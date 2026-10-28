// Throwaway authoring aid: projects a simple landmark model of the duck into
// per-view silhouette guides. NOT shipped; outputs are static review guides.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

// ---- landmark model (duck-local units; +z front, +y up, +x = duck's left; body length ~120)
export const MODEL = {
  body:  { c: [0, 0, 0], a: 42, bTop: 36, bBot: 26, cz: 60 },
  head:  { c: [0, 52, 10], r: 40 },
  billUp:{ c: [0, 43, 49], s: [16, 6, 13] },
  billLo:{ c: [0, 37.5, 47], s: [14, 4.5, 11] },
  wing:  { cx: 34, cy: 19, cz: -10, s: [7, 15, 32] },
  tail:  { c: [0, 27, -45], s: [11, 15, 17] },
  eyeDir: [0.52, 0.12, 0.84], eyeSize: [4.6, 6.2]
};
export const VIEWS = {
  front: { az: 35, el: 12 },
  side:  { az: 90, el: 5 },
  rear:  { az: 148, el: 16 },
  high:  { az: 35, el: 52 },
  low:   { az: 35, el: -16 },
  top:   { az: 90, el: 78 }
};
const D = 330, TARGET = [0, 28, 0];

function camera({ az, el }) {
  const A = az * Math.PI / 180, E = el * Math.PI / 180;
  const d = [Math.sin(A)*Math.cos(E), Math.sin(E), Math.cos(A)*Math.cos(E)];
  const r = norm([d[2], 0, -d[0]]);
  const f = d.map(x => -x);
  const u = cross(r, f);
  return { d, r, u };
}
const proj = (cam, X) => {
  const v = [X[0]-TARGET[0], X[1]-TARGET[1], X[2]-TARGET[2]];
  const t = dot(v, cam.d), s = D / (D - t);
  return [dot(v, cam.r)*s, -dot(v, cam.u)*s, t];
};

// ---- surface samplers
function sphereDirs(n = 28, m = 56) {
  const out = [];
  for (let i = 0; i <= n; i++) { const th = Math.PI*i/n; for (let j = 0; j < m; j++) { const ph = 2*Math.PI*j/m; out.push([Math.sin(th)*Math.cos(ph), Math.cos(th), Math.sin(th)*Math.sin(ph)]); } }
  return out;
}
const DIRS = sphereDirs();
const ell = (c, s, rot) => DIRS.map(u => { let p = [u[0]*s[0], u[1]*s[1], u[2]*s[2]]; return [p[0]+c[0], p[1]+c[1], p[2]+c[2]]; });
function bodyPts() {
  const { a, bTop, bBot, cz } = MODEL.body;
  return DIRS.map(u => {
    const p = 2 + 1.4 * Math.max(0, -u[1]);
    const k = 1 / Math.pow(Math.abs(u[0])**p + Math.abs(u[1])**p + Math.abs(u[2])**p, 1/p);
    return [a*u[0]*k, (u[1] >= 0 ? bTop : bBot)*u[1]*k, cz*u[2]*k];
  });
}
const headPts = () => ell(MODEL.head.c, [MODEL.head.r, MODEL.head.r, MODEL.head.r]);
const wingPts = side => ell([side*MODEL.wing.cx, MODEL.wing.cy, MODEL.wing.cz], MODEL.wing.s);
function eyeData(side) {
  const n = norm([side*MODEL.eyeDir[0], MODEL.eyeDir[1], MODEL.eyeDir[2]]);
  const pos = MODEL.head.c.map((x, i) => x + MODEL.head.r*n[i]);
  const tu = norm(cross([0,1,0], n)), tv = cross(n, tu);
  const pts = [];
  for (let i = 0; i < 24; i++) { const t = 2*Math.PI*i/24; pts.push(pos.map((x, k) => x + tu[k]*Math.cos(t)*MODEL.eyeSize[0] + tv[k]*Math.sin(t)*MODEL.eyeSize[1])); }
  return { n, pos, pts };
}

// ---- hull + smooth path
function hull(P) {
  const pts = P.map(p => [p[0], p[1]]).sort((a, b) => a[0]-b[0] || a[1]-b[1]);
  const cr = (o, a, b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);
  const lo = []; for (const p of pts) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  const up = []; for (const p of pts.reverse()) { while (up.length >= 2 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function resample(poly, n) {
  const L = [0]; for (let i = 1; i <= poly.length; i++) { const a = poly[i-1], b = poly[i % poly.length]; L.push(L[i-1] + Math.hypot(b[0]-a[0], b[1]-a[1])); }
  const tot = L.at(-1), out = []; let j = 0;
  for (let i = 0; i < n; i++) { const s = tot*i/n; while (L[j+1] < s) j++; const a = poly[j], b = poly[(j+1) % poly.length]; const f = (s-L[j])/(L[j+1]-L[j] || 1); out.push([a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f]); }
  return out;
}
const f1 = x => (Math.round(x*10)/10).toString();
function smoothPath(poly, n) {
  const p = resample(poly, n), N = p.length;
  let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < N; i++) {
    const p0 = p[(i-1+N)%N], p1 = p[i], p2 = p[(i+1)%N], p3 = p[(i+2)%N];
    const c1 = [p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6], c2 = [p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + 'Z';
}

// ---- build one view
function build(name, view, K, off) {
  const cam = camera(view);
  const tf = X => { const q = proj(cam, X); return [q[0]*K + off[0], q[1]*K + off[1], q[2]]; };
  const mk = (P, n) => { const Q = P.map(tf); return { path: smoothPath(hull(Q), n), pts: Q }; };
  const parts = {};
  parts.body = mk(bodyPts(), 22);
  parts.head = mk(headPts(), 20);
  parts.tail = mk(ell(MODEL.tail.c, MODEL.tail.s), 12);
  parts.billLo = mk(ell(MODEL.billLo.c, MODEL.billLo.s), 12);
  parts.billUp = mk(ell(MODEL.billUp.c, MODEL.billUp.s), 12);
  parts.wingNear = mk(wingPts(1), 14);   // +x wing
  parts.wingFar = mk(wingPts(-1), 14);   // -x wing
  const eyes = {};
  for (const [nm, sd] of [['eyeNear', 1], ['eyeFar', -1]]) {
    const e = eyeData(sd); eyes[nm] = { facing: dot(e.n, cam.d), path: smoothPath(hull(e.pts.map(tf)), 12) };
  }
  // visibility facts
  const facts = {
    view: name, azimuthDeg: view.az, elevationDeg: view.el,
    nearWingFacing: +dot([1,0.1,0], cam.d).toFixed(2), farWingFacing: +dot([-1,0.1,0], cam.d).toFixed(2),
    billAxisFacing: +dot([0,0,1], cam.d).toFixed(2),
    underFacing: +dot([0,-1,0], cam.d).toFixed(2),
    eyeNearFacing: +eyes.eyeNear.facing.toFixed(2), eyeFarFacing: +eyes.eyeFar.facing.toFixed(2)
  };
  return { parts, eyes, facts, cam };
}

// size/offset: shared scale so all five read at the same object size; bottom of body at y=246, centred on all-part bbox
const K = 1.68;
const built = {};
for (const [name, v] of Object.entries(VIEWS)) {
  let b = build(name, v, K, [0, 0]);
  const all = Object.values(b.parts).flatMap(p => p.pts);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const bodyMaxY = Math.max(...b.parts.body.pts.map(p => p[1]));
  const off = [180 - (Math.min(...xs)+Math.max(...xs))/2, 246 - bodyMaxY];
  built[name] = build(name, v, K, off);
  built[name].off = off; built[name].bbox = { x0: Math.min(...xs)+off[0], x1: Math.max(...xs)+off[0], y0: Math.min(...ys)+off[1], y1: Math.max(...ys)+off[1] };
}


// ================= styled output (baked static SVG) =================
const LINE = '#4b241b';
const ORDER = {
  front: ['tail', 'wingFar', 'body', 'wingNear', 'head', 'eyes', 'billLo', 'billUp'],
  side:  ['tail', 'wingFar', 'body', 'head', 'wingNear', 'eyes', 'billLo', 'billUp'],
  rear:  ['billLo', 'billUp', 'wingFar', 'body', 'head', 'wingNear', 'tail'],
  high:  ['tail', 'wingFar', 'body', 'wingNear', 'head', 'eyes', 'billLo', 'billUp'],
  low:   ['tail', 'wingFar', 'head', 'eyes', 'billLo', 'billUp', 'body', 'wingNear'],
  top:   ['tail', 'wingFar', 'body', 'head', 'wingNear', 'eyes', 'billLo', 'billUp']
};
const PAL = {
  body: ['#f4bc32', '#dfa52f'], head: ['#f6c238', '#e2a82f'], tail: ['#eeb52c', '#d29a26'],
  wingNear: ['#ebb02a', '#cf9421'], wingFar: ['#dba02a', '#c08720'],
  billUp: ['#f36e2c', '#d9541f'], billLo: ['#e85e28', '#c8481b']
};
const SW = { body: 5, head: 5, tail: 4.5, wingNear: 4.5, wingFar: 4, billUp: 4.5, billLo: 4 };
const SHIFT = { body: [-9, -11], head: [-8, -9], tail: [-4, -5], wingNear: [-5, -6], wingFar: [-4, -5], billUp: [-3, -4], billLo: [-2, -3] };
const tr = (d, [x, y]) => `<path d="${d}" transform="translate(${x} ${y})"`;

function smoothOpen(pts) {
  const N = pts.length; let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < N-1; i++) {
    const p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(N-1, i+2)];
    d += `C${f1(p1[0]+(p2[0]-p0[0])/6)} ${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)} ${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}
function topArc(pts, n, frac) { // open stroke along the upper contour of a hull path
  const ring = resample(hull(pts), n); const ys = ring.map(p => p[1]);
  const lo = Math.min(...ys), hi = Math.max(...ys), lim = lo + (hi-lo)*frac;
  const inn = ring.map(p => p[1] <= lim); let start = inn.findIndex((v, i) => v && !inn[(i-1+n)%n]); if (start < 0) start = 0;
  const run = []; for (let k = 0; k < n && inn[(start+k)%n]; k++) run.push(ring[(start+k)%n]);
  return smoothOpen(run);
}
function bodyBand(cam, tf, thr) { // lower, camera-facing belly region of the body
  const { a, bTop, bBot, cz } = MODEL.body; const out = [];
  for (const u of DIRS) {
    const p = 2 + 1.4 * Math.max(0, -u[1]); const k = 1 / Math.pow(Math.abs(u[0])**p + Math.abs(u[1])**p + Math.abs(u[2])**p, 1/p);
    const P = [a*u[0]*k, (u[1] >= 0 ? bTop : bBot)*u[1]*k, cz*u[2]*k];
    const n = norm([P[0]/a, P[1]/(P[1] >= 0 ? bTop : bBot), P[2]/cz]);
    if (n[1] < -thr && dot(n, cam.d) > 0.02) out.push(tf(P));
  }
  return out;
}
function groove(wingSide, tf, g) { // feather-gap arcs on the wing's outer face
  const { cx, cy, cz, s } = MODEL.wing; const pts = [];
  for (let i = 0; i <= 4; i++) {
    const t = i/4, uz = -0.9 + 0.62*t, uy = g + 0.1*(1-t), ux = Math.sqrt(Math.max(0, 1-uz*uz-uy*uy));
    pts.push(tf([wingSide*(cx + ux*s[0]), cy + uy*s[1], cz + uz*s[2]]));
  }
  return smoothOpen(pts);
}

function styled(name) {
  const b = built[name], cam = b.cam, off = b.off;
  const tf = X => { const q = proj(cam, X); return [q[0]*K + off[0], q[1]*K + off[1], q[2]]; };
  const defs = [], out = [];
  const id = nm => `${name}-${nm}`;
  const clipOf = (nm, d) => { defs.push(`<clipPath id="${id('c-'+nm)}"><path d="${d}"/></clipPath>`); return `url(#${id('c-'+nm)})`; };
  const facts = b.facts;
  const nearVisible = facts.nearWingFacing > 0.05, farVisible = facts.farWingFacing > 0.05;
  const P = nm => b.parts[nm].path;
  const form = (nm, d, extra = '') => {
    const [lit, dark] = PAL[nm], c = clipOf(nm, d), sh = SHIFT[nm];
    let g = `<g id="${id(nm)}">`;
    g += `<path d="${d}" fill="${lit}"/>`;
    g += `<g clip-path="${c}">${tr(d, [0, 0])} fill="${dark}"/>${tr(d, sh)} fill="${lit}"/>${extra}`;
    if (nm === 'body' || nm === 'head') g += `${tr(d, [6, 7])} fill="none" stroke="#ffe27c" stroke-width="${nm === 'head' ? 5 : 3.5}" stroke-opacity=".8"/>`;
    g += `</g><path d="${d}" fill="none" stroke="${LINE}" stroke-width="${SW[nm]}" stroke-linejoin="round"/></g>`;
    return g;
  };
  for (const part of ORDER[name]) {
    if (part === 'body') {
      let extra = '';
      const thr = name === 'low' ? 0.2 : name === 'high' ? 0.45 : 0.4;
      const band = bodyBand(cam, tf, thr);
      if (band.length > 6) extra += `<path d="${smoothPath(hull(band), 14)}" fill="${name === 'low' ? '#b27a1d' : '#c98f22'}" fill-opacity="${name === 'low' ? 0.9 : 0.55}"/>`;
      if (name !== 'low') extra += `${tr(P('head'), [3, 9])} fill="#c98f22" fill-opacity=".55"/>`;
      out.push(form('body', P('body'), extra));
    } else if (part === 'head') {
      out.push(form('head', P('head')));
    } else if (part === 'tail') {
      if (name === 'rear') {
        const d = P('tail'), arc = topArc(b.parts.tail.pts, 22, 0.78);
        out.push(`<g id="${id('tail')}"><path d="${d}" fill="${PAL.tail[0]}"/><g clip-path="${clipOf('tail', d)}">${tr(d, [0,0])} fill="${PAL.tail[1]}"/>${tr(d, SHIFT.tail)} fill="${PAL.tail[0]}"/></g><path d="${arc}" fill="none" stroke="${LINE}" stroke-width="4.5" stroke-linecap="round"/></g>`);
      } else out.push(form('tail', P('tail')));
    } else if (part === 'wingNear' || part === 'wingFar') {
      const near = part === 'wingNear', vis = near ? nearVisible : farVisible;
      let extra = '';
      if (vis) { const side = near ? 1 : -1; extra = `<path d="${groove(side, tf, -0.05)}" fill="none" stroke="#9c681e" stroke-width="2.6" stroke-linecap="round"/><path d="${groove(side, tf, 0.38)}" fill="none" stroke="#9c681e" stroke-width="2.6" stroke-linecap="round"/>`; }
      out.push(form(part, P(part), extra));
    } else if (part === 'eyes') {
      const hc = clipOf('headEye', P('head'));
      let g = `<g id="${id('eyes')}" clip-path="${hc}">`;
      const glints = [];
      for (const e of Object.values(b.eyes)) if (e.facing > 0.06) {
        g += `<path d="${e.path}" fill="#45251f" stroke="#2c1510" stroke-width="2"/>`;
        if (e.facing > 0.6) {
          const nums = e.path.match(/-?\d+\.?\d*/g).map(Number);
          const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
          const cxm = (Math.min(...xs)+Math.max(...xs))/2, cym = (Math.min(...ys)+Math.max(...ys))/2, w = Math.max(...xs)-Math.min(...xs);
          glints.push(`<circle cx="${f1(cxm - w*0.16)}" cy="${f1(cym - w*0.3)}" r="${f1(Math.max(1.4, w*0.17))}" fill="#fff4d8"/>`);
        }
      }
      out.push(g + glints.join('') + '</g>');
    } else if (part === 'billUp' || part === 'billLo') {
      out.push(form(part, P(part)));
    }
  }
  const labels = { front: 'Front three-quarter static rubber duck', side: 'Side profile static rubber duck facing left', rear: 'Rear three-quarter static rubber duck seen from behind', high: 'High angle static rubber duck seen from above', low: 'Low angle static rubber duck seen from below', top: 'Overhead static rubber duck seen from directly above' };
  return `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMax meet" role="img" aria-label="${labels[name]}"><defs>${defs.join('')}</defs>${out.join('')}</svg>`;
}

fs.mkdirSync(OUT, { recursive: true });
const result = {};
for (const name of Object.keys(VIEWS)) result[name] = styled(name);
fs.writeFileSync(path.join(OUT, 'styled.json'), JSON.stringify(result));
for (const [k, s] of Object.entries(result)) fs.writeFileSync(path.join(OUT, `styled-${k}.svg`), s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
console.log('ok', Object.fromEntries(Object.entries(result).map(([k, s]) => [k, s.length])));
