import { proj, put } from './camera.mjs';
import { ROOM_SPECS } from './specs.mjs';
import { pendant } from '../props/index.mjs';
import { CX, DUCK_UNITS_PER_MM, DUCK_CX } from '../core/constants.mjs';
import { sceneDefs } from '../lighting/defs.mjs';
import { DUCK_LABELS, duckInnerMarkup } from '../duck/index.mjs';

export function buildRoomScene({ area, duckView, framing, furnishings }) {
  if (!Object.prototype.hasOwnProperty.call(ROOM_SPECS, area)) throw new RangeError(`Unknown room area: ${String(area)}`);
  if (framing !== 'wide' && framing !== 'medium') throw new RangeError(`Unknown framing: ${String(framing)}`);
  if (!['front', 'side', 'rear'].includes(duckView)) throw new RangeError(`Unknown duck view: ${String(duckView)}`);
  const states = ['present', 'removed'];
  if (!furnishings || !states.includes(furnishings.couch) || !states.includes(furnishings.tv)) throw new RangeError('furnishings must be { couch, tv } with each "present" or "removed"');
  const sc = ROOM_SPECS[area], wallBase = proj(sc, 0, sc.zw), sw = wallBase.s;
  const items = sc.items(furnishings).slice().sort((a, b) => b.z - a.z);
  const out = [], glows = [];
  const floorLines = [-9, -7, -5, -3, -1, 1, 3, 5, 7, 9].map(i => { const X = i * 650, yb = 700, sNear = (yb - sc.hy) / sc.camH; return `<line x1="${CX + sw * X}" y1="${wallBase.y}" x2="${CX + sNear * X}" y2="${yb}" stroke="#000" stroke-opacity=".07" stroke-width="2"/>`; }).join('');
  const tile = sc.tiles ? `<pattern id="k-tile" width="${sw * 120}" height="${sw * 120}" patternUnits="userSpaceOnUse"><rect width="${sw * 120}" height="${sw * 120}" fill="${sc.wall}"/><path d="M0 0H${sw * 120}M0 0V${sw * 120}" stroke="#a9b3a0" stroke-width="1.2" fill="none"/></pattern>` : '';
  const wallFill = sc.tiles ? 'url(#k-tile)' : sc.wall;
  out.push(`<rect x="-900" y="-700" width="2760" height="${wallBase.y + 700}" fill="${wallFill}"/>`);
  if (sc.tiles) out.push(`<rect x="-900" y="-700" width="2760" height="${proj(sc, 0, sc.zw, 1700).y + 700}" fill="${sc.wall}" opacity=".0"/>`);
  out.push(`<rect x="-900" y="${wallBase.y}" width="2760" height="900" fill="${sc.floor}"/>${floorLines}`);
  out.push(`<rect x="-900" y="${wallBase.y - sw * 100}" width="2760" height="${sw * 100}" fill="#000" opacity=".12"/>`);
  if (sc.rug) { const pts = sc.rug.map(([X, z]) => { const p = proj(sc, X, z); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' '); out.push(`<polygon points="${pts}" fill="${sc.rugFill}" stroke="${sc.rugTrim}" stroke-width="4"/>`); }
  const k =proj(sc, 0, sc.anchor.z).s / DUCK_UNITS_PER_MM, dp = proj(sc, sc.anchor.X, sc.anchor.z, sc.anchor.Y);
  const duckSvg = `<svg x="${(dp.x - DUCK_CX[duckView] * k).toFixed(1)}" y="${(dp.y - 250 * k).toFixed(1)}" width="${360 * k}" height="${270 * k}" viewBox="0 0 360 270" overflow="visible" role="img" aria-label="${DUCK_LABELS[duckView]} rubber duck in the ${sc.label.toLowerCase()}">${duckInnerMarkup(duckView)}</svg>`;
  const dShadow = `<ellipse cx="${dp.x + k * 20}" cy="${dp.y + 2}" rx="${k * 105}" ry="${k * 11}" fill="url(#g-soft)"/>`;
  for (const it of items) {
    if (it.ghost) { out.push(put(sc, it.X, it.z, it.Y, it.mm)); continue; }
    if (it.shadow) { const p = proj(sc, it.X, it.z, 0); out.push(`<ellipse cx="${(p.x + p.s * it.shadow * .06).toFixed(1)}" cy="${(p.y + 2).toFixed(1)}" rx="${(p.s * it.shadow * .56).toFixed(1)}" ry="${(p.s * Math.min(it.shadow, 900) * .05).toFixed(1)}" fill="url(#g-soft)"/>`); }
    out.push(put(sc, it.X, it.z, it.Y, it.mm));
  }
  for (const sf of sc.surfaces || []) {
    const q = [[sf.X - sf.w / 2, sf.zb], [sf.X + sf.w / 2, sf.zb], [sf.X + sf.w / 2, sf.zf], [sf.X - sf.w / 2, sf.zf]].map(([X, z]) => { const pp = proj(sc, X, z, sf.Y); return `${pp.x.toFixed(1)},${pp.y.toFixed(1)}`; }).join(' ');
    out.push(`<polygon points="${q}" fill="${sf.fill}" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round"/>`);
  }
  // things on the duck's surface, then duck, then foreground pendant
  const nearAnchor = [];
  for (const it of sc.onTable.filter(t => t.X < sc.anchor.X)) nearAnchor.push(it);
  for (const it of sc.onTable.filter(t => t.X >= sc.anchor.X)) nearAnchor.push(it);
  for (const it of nearAnchor) out.push(put(sc, it.X, it.z, it.Y, it.mm));
  out.push(dShadow + duckSvg);
  if (sc.pendant) { const p = sc.pendant; out.push(put(sc, p.X, p.z, p.Y, pendant(-3600), 'pendant')); }
  // lamp glow
  const L = sc.lampAt, lp = proj(sc, L.X, L.z, L.Y);
  // An open lampshade throws light mainly down (and a fainter spill up), not equally in all directions:
  // a soft halo at the shade plus blurred cones from its openings.
  glows.push(put(sc, L.X, L.z, L.Y, `<circle r="${L.r}" fill="url(#g-glow)" opacity=".5"/>`, 'lamp-on lamp-pool'));
  for (const c of sc.cones || []) {
    const e = c.dir === 'down' ? c.len : -c.len;
    glows.push(put(sc, c.X, c.z, c.Y, `<polygon points="${-c.w0},0 ${c.w0},0 ${c.w1},${e} ${-c.w1},${e}" fill="url(#g-cone-${c.dir === 'down' ? 'd' : 'u'})" stroke="none" opacity="${c.op ?? 1}" filter="url(#f-blur-mm)"/>`, 'lamp-on lamp-pool'));
  }
  const vb = framing === 'medium' ? (() => { const w = 440, h = w * 540 / 960; return `${(dp.x - w * .46).toFixed(1)} ${Math.max(0, Math.min(540 - h, dp.y - h * .66)).toFixed(1)} ${w} ${h.toFixed(1)}`; })() : '0 0 960 540';
  const [vx, vy, vw, vh] = vb.split(' ').map(Number);
  return {
    lamp: { x: Math.max(5, Math.min(95, (lp.x - vx) / vw * 100)), y: Math.max(5, Math.min(95, (lp.y - vy) / vh * 100 + (sc.poolDy || 0))), rx: sc.poolRx, ry: sc.poolRy },
    svg: `<svg class="desk-scene room-scene" viewBox="${vb}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${sceneDefs}<defs>${tile}</defs>${out.join('')}${glows.join('')}</svg>`
  };
}
