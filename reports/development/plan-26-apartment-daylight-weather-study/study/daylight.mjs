// Plan 26 Stage 2: living-room still daylight layers. Pure string builders in scene coordinates (the kit's 960x540 box).
// APPROXIMATIONS (labelled, not physically exact): one sun direction/elevation for the whole room; the window's glass and
// mullions are projected onto the floor plane only (no sun on walls/furniture faces); item shadows are simple strips/tapers,
// not silhouettes; the shade tint is a global multiply; shadows are drawn everywhere on the floor/table, not clipped to the beam
// (a single window would not light the whole floor; this is a stylised "bright day" reading).
import { ROOM_SPECS } from '../../../../src/assets/apartment/rooms/specs.mjs';
import { proj } from '../../../../src/assets/apartment/rooms/camera.mjs';

const sc = ROOM_SPECS.living;
export const SUN = { azimuthDeg: 25, elevationDeg: 36 };   // light travels toward the camera (-z) and to the right (+X)
const AZ = SUN.azimuthDeg * Math.PI / 180, TAN_E = Math.tan(SUN.elevationDeg * Math.PI / 180), SX = Math.sin(AZ), SZ = Math.cos(AZ);

/** Window the study is keyed to: must equal the kit's spec (checked by tools/check.mjs against ROOM_SPECS and windowMm). */
export const WINDOW = { X: -150, z: 4000, Y: 750, w: 900, h: 800, frame: 30, midY: 750 + 800 * .45, glassBottom: 750 + 30, glassTop: 750 + 800 - 30 };
/** Furniture the directional shadows are keyed to (kit spec coordinates; checked against ROOM_SPECS). */
export const KEYED_ITEMS = { sofa: { X: 1350, z: 3900 }, tv: { X: -1500, z: 3950 }, plant: { X: -700, z: 3700 }, lamp: { X: 480, z: 3500 } };
const DUCK_ON_TABLE = { X: -150 + 6, z: 900, Y: 430 }, MUG = { X: -470, z: 900, Y: 430 };

export const STRENGTH = {
  restrained: { tint: .14, shadow: .36, patch: .5, glass: .62, bloom: .32 },
  strong: { tint: .24, shadow: .55, patch: .72, glass: .88, bloom: .55 }
};

const f1 = n => n.toFixed(1);
/** Screen point of the floor (or a plane at height Y0) reached by the sun ray that passes (X, z) at height h above Y0. */
const P = (X, z, Y0, h) => { const t = h / TAN_E, p = proj(sc, X + SX * t, z - SZ * t, Y0); return [p.x, p.y]; };
const pts = a => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
/** Shadow strip of a vertical object at (X, z) standing on plane Y0: half-width w0 at height h0 to w1 at h1. */
const strip = (X, z, Y0, h0, w0, h1, w1) => `<polygon points="${pts([P(X - w0, z, Y0, h0), P(X + w0, z, Y0, h0), P(X + w1, z, Y0, h1), P(X - w1, z, Y0, h1)])}"/>`;

function windowPanes() {
  const { X, w, glassBottom: gb, glassTop: gt, midY } = WINDOW, x0 = X - w / 2 + WINDOW.frame, x1 = X + w / 2 - WINDOW.frame;
  return { x0, x1, gb, gt, midY, mullion: 8 };
}

/** The four sun-patch quads on the floor (window panes projected along the sun, mullions widened to 48 mm for the shadow). */
export function patchQuads() {
  const { x0, x1, gb, gt, midY } = windowPanes(), g = 24, cx = WINDOW.X, z = WINDOW.z;
  const cols = [[x0, cx - g], [cx + g, x1]], rows = [[gb, midY - g], [midY + g, gt]];
  return cols.flatMap(([a, b]) => rows.map(([lo, hi]) => [P(a, z, 0, lo), P(b, z, 0, lo), P(b, z, 0, hi), P(a, z, 0, hi)]));
}

export function glassRects() {
  const { x0, x1, gb, gt, midY } = windowPanes(), cx = WINDOW.X, z = WINDOW.z, m = 8;
  const cols = [[x0, cx - m], [cx + m, x1]], rows = [[gb, midY - m], [midY + m, gt]];
  return cols.flatMap(([a, b]) => rows.map(([lo, hi]) => { const tl = proj(sc, a, z, hi), br = proj(sc, b, z, lo); return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y }; }));
}

/** Floor layer (inserted after the rug, under every item): sun patch + room item shadows. `id` is the scoped-id stem. */
export function floorLayer({ id, furnishings, strength }) {
  const S = STRENGTH[strength], quads = patchQuads();
  const ys = quads.flat().map(p => p[1]), yTop = Math.min(...ys), yBot = Math.max(...ys);
  const K = KEYED_ITEMS, shadows = [];
  if (furnishings.couch === 'present') shadows.push(strip(K.sofa.X, K.sofa.z, 0, 0, 750, 860, 750));
  if (furnishings.tv === 'present') shadows.push(strip(K.tv.X, K.tv.z, 0, 0, 650, 520, 650), strip(K.tv.X, K.tv.z, 0, 520, 560, 1190, 560));
  shadows.push(strip(K.plant.X, K.plant.z, 0, 0, 170, 420, 170), strip(K.plant.X, K.plant.z, 0, 420, 200, 1450, 330));
  shadows.push(strip(K.lamp.X, K.lamp.z, 0, 0, 30, 1250, 30), strip(K.lamp.X, K.lamp.z, 0, 1200, 245, 1540, 170));
  return `<defs>`
    + `<linearGradient id="${id}-patch" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(yTop)}" x2="0" y2="${f1(yBot)}"><stop offset="0" stop-color="#ffe3a8"/><stop offset="1" stop-color="#ffd08a" stop-opacity=".6"/></linearGradient>`
    + `<filter id="${id}-patch-blur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>`
    + `<filter id="${id}-shadow-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.4"/></filter>`
    + `</defs>`
    + `<g data-p26="sun-patch" fill="url(#${id}-patch)" opacity="${S.patch}" filter="url(#${id}-patch-blur)" style="mix-blend-mode:screen">${quads.map(q => `<polygon points="${pts(q)}"/>`).join('')}</g>`
    + `<g data-p26="sun-shadows" fill="#3f5f94" opacity="${S.shadow}" filter="url(#${id}-shadow-blur)" style="mix-blend-mode:multiply">${shadows.join('')}</g>`;
}

/** Table layer (inserted before the duck's contact shadow): short directional shadows of the duck and mug on the table top. */
export function tableLayer({ id, strength }) {
  const S = STRENGTH[strength], D = DUCK_ON_TABLE, M = MUG;
  return `<defs><filter id="${id}-small-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>`
    + `<g data-p26="sun-table-shadows" fill="#3f5f94" opacity="${Math.min(.7, S.shadow + .1)}" filter="url(#${id}-small-blur)" style="mix-blend-mode:multiply">${strip(D.X, D.z, D.Y, 0, 46, 81, 32)}${strip(M.X, M.z, M.Y, 0, 42, 92, 40)}</g>`;
}

/** Atmosphere layer (inserted above all furniture and the duck, below any lamp glow): cool shade tint, white-out panes, bloom. */
export function atmosphereLayer({ id, strength }) {
  const S = STRENGTH[strength], rects = glassRects(), c = proj(sc, WINDOW.X, WINDOW.z, (WINDOW.glassBottom + WINDOW.glassTop) / 2), s = c.s;
  const rx = (WINDOW.w / 2 + 330) * s, ry = (WINDOW.h / 2 + 300) * s;
  return `<defs><radialGradient id="${id}-bloom"><stop offset="0" stop-color="#fff3cf" stop-opacity="${S.bloom}"/><stop offset=".55" stop-color="#ffeab8" stop-opacity="${(S.bloom * .35).toFixed(3)}"/><stop offset="1" stop-color="#ffe4a8" stop-opacity="0"/></radialGradient></defs>`
    + `<rect data-p26="shade-tint" x="-6000" y="-6000" width="14000" height="14000" pointer-events="none" fill="#6f8fc4" opacity="${S.tint}" style="mix-blend-mode:multiply"/>`
    + `<ellipse data-p26="window-bloom" cx="${f1(c.x)}" cy="${f1(c.y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#${id}-bloom)" style="mix-blend-mode:screen"/>`
    + `<g data-p26="window-glass">${rects.map(r => `<rect x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}" fill="#fffbe8" opacity="${S.glass}"/>`).join('')}</g>`;
}
