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
  wing:  { cx: 34, cy: 16, cz: -6, s: [7, 15, 33] },
  tail:  { c: [0, 27, -45], s: [11, 15, 17] },
  eyeDir: [0.52, 0.12, 0.84], eyeSize: [4.6, 6.2]
};
export const VIEWS = {
  front: { az: 35, el: 12 },
  side:  { az: 90, el: 5 },
  rear:  { az: 148, el: 16 },
  high:  { az: 35, el: 52 },
  low:   { az: 35, el: -16 }
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
  parts.body = mk(bodyPts(), 28);
  parts.head = mk(headPts(), 26);
  parts.tail = mk(ell(MODEL.tail.c, MODEL.tail.s), 16);
  parts.billLo = mk(ell(MODEL.billLo.c, MODEL.billLo.s), 16);
  parts.billUp = mk(ell(MODEL.billUp.c, MODEL.billUp.s), 16);
  parts.wingNear = mk(wingPts(1), 18);   // +x wing
  parts.wingFar = mk(wingPts(-1), 18);   // -x wing
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
  built[name].bbox = { x0: Math.min(...xs)+off[0], x1: Math.max(...xs)+off[0], y0: Math.min(...ys)+off[1], y1: Math.max(...ys)+off[1] };
}

// painter order per view (back to front); authored choice, see spec.
const ORDER = {
  front: ['tail', 'wingFar', 'body', 'wingNear', 'head', 'billLo', 'billUp'],
  side:  ['tail', 'wingFar', 'body', 'wingNear', 'head', 'billLo', 'billUp'],
  rear:  ['billLo', 'billUp', 'wingFar', 'head', 'body', 'wingNear', 'tail'],
  high:  ['tail', 'wingFar', 'body', 'wingNear', 'head', 'billLo', 'billUp'],
  low:   ['tail', 'wingFar', 'head', 'billLo', 'billUp', 'body', 'wingNear']
};
const COL = { body:'#f4bc32', head:'#ffd23f', tail:'#e9b02c', wingNear:'#e6a924', wingFar:'#cf9a28', billUp:'#f36e2c', billLo:'#e85e28' };

fs.mkdirSync(OUT, { recursive: true });
const summary = {};
for (const [name, b] of Object.entries(built)) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 270" width="720" height="540"><rect width="360" height="270" fill="#f6f3ee"/>\n`;
  svg += `<line x1="0" y1="246" x2="360" y2="246" stroke="#bbb" stroke-dasharray="3 3"/>\n`;
  for (const p of ORDER[name]) svg += `<path id="${p}" d="${b.parts[p].path}" fill="${COL[p]}" stroke="#4b241b" stroke-width="2.5" stroke-linejoin="round" fill-opacity=".85"/>\n`;
  for (const [nm, e] of Object.entries(b.eyes)) if (e.facing > 0.02) svg += `<path id="${nm}" d="${e.path}" fill="#45251f" stroke="#2a130e" stroke-width="1"/>\n`;
  svg += `</svg>\n`;
  fs.writeFileSync(path.join(OUT, `guide-${name}.svg`), svg);
  summary[name] = { ...b.facts, drawOrder: ORDER[name], bbox: Object.fromEntries(Object.entries(b.bbox).map(([k, v]) => [k, Math.round(v)])), visibleEyes: Object.entries(b.eyes).filter(([, e]) => e.facing > 0.02).map(([k]) => k),
    paths: Object.fromEntries([...Object.entries(b.parts).map(([k, v]) => [k, v.path]), ...Object.entries(b.eyes).map(([k, e]) => [k, e.path])]) };
}
fs.writeFileSync(path.join(OUT, 'guides.json'), JSON.stringify({ model: MODEL, camera: { distance: D, target: TARGET, scalePxPerUnit: K }, views: summary }, null, 1));
for (const [k, v] of Object.entries(summary)) console.log(k, JSON.stringify({ ...v, paths: undefined }));
