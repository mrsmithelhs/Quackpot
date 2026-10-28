// Plan 26 Stage 2: living-room still daylight layers. Pure string builders in scene coordinates (the kit's 960x540 box).
//
// Why a LOW sun: in this camera the coffee table covers the foreground floor (the rug/floor is visible only as a thin band behind
// the table and to the right), so a high sun's patch lands behind the table and is invisible. A low late-afternoon sun (16 deg)
// carries the window beam onto the table top where the duck stands, which is where the picture needs the light.
//
// APPROXIMATIONS (labelled, not physical): one sun direction/elevation for the room; the window glass and mullions are projected
// onto the table plane (and floor, when visible) only, no sun on walls or furniture faces; item shadows are simple strips/tapers
// and capsules, not silhouettes; shadows on the floor are drawn broadly (a single window would not light the whole floor), but the
// sun patch itself follows the window; the shade tint is a global multiply.
import { ROOM_SPECS } from '../../../../src/assets/apartment/rooms/specs.mjs';
import { proj, put } from '../../../../src/assets/apartment/rooms/camera.mjs';
import { windowMm } from '../../../../src/assets/apartment/props/index.mjs';

const sc = ROOM_SPECS.living;
export const SUN = { azimuthDeg: -6, elevationDeg: 16 };   // light travels toward the camera (-z) and very slightly to the left (-X)
const AZ = SUN.azimuthDeg * Math.PI / 180, TAN_E = Math.tan(SUN.elevationDeg * Math.PI / 180), SX = Math.sin(AZ), SZ = Math.cos(AZ);

/** Window the study is keyed to: must equal the kit's spec (checked by tools/check.mjs against ROOM_SPECS and windowMm). */
export const WINDOW = { X: -150, z: 4000, Y: 750, w: 900, h: 800, frame: 30, midY: 750 + 800 * .45, glassBottom: 750 + 30, glassTop: 750 + 800 - 30 };
/** Furniture the directional shadows are keyed to (kit spec coordinates; checked against ROOM_SPECS). */
export const KEYED_ITEMS = { sofa: { X: 1350, z: 3900 }, tv: { X: -1500, z: 3950 }, plant: { X: -700, z: 3700 }, lamp: { X: 480, z: 3500 } };
export const TABLE = ROOM_SPECS.living.surfaces[0];   // { X, w, zf, zb, Y, fill }
const DUCK_ON_TABLE = { X: -150 + 6, z: 900, Y: 430, r: 48, h: 81 }, MUG = { X: -470, z: 900, Y: 430, r: 42, h: 92 };

export const STRENGTH = {
  restrained: { tint: .05, shadow: .32, patch: .55, glass: .62, bloom: .32, tableShadow: .34 },
  strong: { tint: .10, shadow: .5, patch: .85, glass: .9, bloom: .55, tableShadow: .46 }
};

const f1 = n => n.toFixed(1);
/** Screen point on plane Y0 reached by the sun ray that passes (X, z) at height Y0 + h. */
const Z_MIN = 250;   // rays are cut at this depth (mm in front of the camera): beyond it a long low-sun shadow is far below the frame anyway
const P = (X, z, Y0, h) => { const t = Math.min(h / TAN_E, (z - Z_MIN) / SZ), p = proj(sc, X + SX * t, z - SZ * t, Y0); return [p.x, p.y]; };
const pts = a => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
/** Shadow strip of a vertical object at (X, z) between absolute heights H0..H1 (half-width w0..w1), cast onto plane Y0.
 *  Parts below the plane cast no shadow on it; returns '' if nothing is above the plane. */
const strip = (X, z, Y0, H0, w0, H1, w1) => {
  if (H1 <= Y0) return '';
  if (H0 < Y0) { const k = (Y0 - H0) / (H1 - H0); w0 += (w1 - w0) * k; H0 = Y0; }
  return `<polygon points="${pts([P(X - w0, z, Y0, H0 - Y0), P(X + w0, z, Y0, H0 - Y0), P(X + w1, z, Y0, H1 - Y0), P(X - w1, z, Y0, H1 - Y0)])}"/>`;
};
/** Round footprint (radius r) of an object of height h standing on plane Y0: capsule from base to the shadow tip. */
const capsule = (X, z, Y0, r, h) => {
  const b = proj(sc, X, z, Y0), [tx, ty] = P(X, z, Y0, h), rx = b.s * r, ry = rx * (sc.camH - Y0) / z, rt = .62;   // the tip is narrower: the top of a duck/mug is smaller than its base
  return `<ellipse cx="${f1(b.x)}" cy="${f1(b.y)}" rx="${f1(rx)}" ry="${f1(ry)}"/><ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(rx * rt)}" ry="${f1(ry * rt)}"/>`
    + `<polygon points="${pts([[b.x - rx, b.y], [b.x + rx, b.y], [tx + rx * rt, ty], [tx - rx * rt, ty]])}"/>`;
};

function windowPanes() {
  const { X, w, glassBottom: gb, glassTop: gt, midY } = WINDOW;
  return { x0: X - w / 2 + WINDOW.frame, x1: X + w / 2 - WINDOW.frame, gb, gt, midY };
}

/** Window panes projected along the sun onto plane Y0 (mullion gaps widened to 48 mm so the cross reads). */
export function patchQuads(Y0 = 0) {
  const { x0, x1, gb, gt, midY } = windowPanes(), g = 24, cx = WINDOW.X, z = WINDOW.z;
  const cols = [[x0, cx - g], [cx + g, x1]], rows = [[gb, midY - g], [midY + g, gt]];
  return cols.flatMap(([a, b]) => rows.map(([lo, hi]) => [P(a, z, Y0, lo - Y0), P(b, z, Y0, lo - Y0), P(b, z, Y0, hi - Y0), P(a, z, Y0, hi - Y0)]));
}

export function glassRects() {
  const { x0, x1, gb, gt, midY } = windowPanes(), cx = WINDOW.X, z = WINDOW.z, m = 8;
  const cols = [[x0, cx - m], [cx + m, x1]], rows = [[gb, midY - m], [midY + m, gt]];
  return cols.flatMap(([a, b]) => rows.map(([lo, hi]) => { const tl = proj(sc, a, z, hi), br = proj(sc, b, z, lo); return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y }; }));
}

/** Screen outline of the coffee-table top (the kit's own surface polygon). */
export function tableOutline() {
  const { X, w, zf, zb, Y } = TABLE;
  return [[X - w / 2, zb], [X + w / 2, zb], [X + w / 2, zf], [X - w / 2, zf]].map(([x, z]) => { const p = proj(sc, x, z, Y); return [p.x, p.y]; });
}

const SCENE_H = 540;
/** Floor layer (inserted after the rug, under every item): floor sun patch when any of it is in frame, plus long item shadows. */
export function floorLayer({ id, furnishings, strength }) {
  const S = STRENGTH[strength], K = KEYED_ITEMS, shadows = [];
  const quads = patchQuads(0).filter(q => q.some(p => p[1] < SCENE_H));
  if (furnishings.couch === 'present') shadows.push(strip(K.sofa.X, K.sofa.z, 0, 0, 750, 860, 750));
  if (furnishings.tv === 'present') shadows.push(strip(K.tv.X, K.tv.z, 0, 0, 650, 520, 650), strip(K.tv.X, K.tv.z, 0, 520, 560, 1190, 560));
  shadows.push(strip(K.plant.X, K.plant.z, 0, 0, 170, 420, 170), strip(K.plant.X, K.plant.z, 0, 420, 200, 1450, 330));
  shadows.push(strip(K.lamp.X, K.lamp.z, 0, 0, 30, 1250, 30), strip(K.lamp.X, K.lamp.z, 0, 1200, 245, 1540, 170));
  const patch = quads.length ? `<g data-p26="sun-floor-patch" fill="#ffd9a0" opacity="${S.patch}" filter="url(#${id}-patch-blur)" style="mix-blend-mode:screen">${quads.map(q => `<polygon points="${pts(q)}"/>`).join('')}</g>` : '';
  return `<defs><filter id="${id}-patch-blur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter><filter id="${id}-shadow-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>`
    + patch
    + `<g data-p26="sun-shadows" fill="#3f5f94" opacity="${S.shadow}" filter="url(#${id}-shadow-blur)" style="mix-blend-mode:multiply">${shadows.join('')}</g>`;
}

/** Table-plane layer (inserted right after the table top, under the mug, magazines and duck): the window beam on the table with its
 *  frame shadow, and the plant leaves'/lamp shade's shadows crossing it; all clipped to the table outline. */
export function tablePlaneLayer({ id, strength }) {
  const S = STRENGTH[strength], K = KEYED_ITEMS, Y0 = TABLE.Y, quads = patchQuads(Y0);
  const shades = [strip(K.plant.X, K.plant.z, Y0, 840, 220, 1450, 330), strip(K.lamp.X, K.lamp.z, Y0, 430, 30, 1250, 30), strip(K.lamp.X, K.lamp.z, Y0, 1200, 245, 1540, 170)].join('');
  return `<defs><clipPath id="${id}-table-clip"><polygon points="${pts(tableOutline())}"/></clipPath><filter id="${id}-table-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="${id}-table-shade-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.4"/></filter></defs>`
    + `<g clip-path="url(#${id}-table-clip)">`
    + `<g data-p26="sun-table-patch" fill="#ffdca0" opacity="${S.patch}" filter="url(#${id}-table-blur)" style="mix-blend-mode:screen">${quads.map(q => `<polygon points="${pts(q)}"/>`).join('')}</g>`
    + `<g data-p26="sun-table-shade" fill="#3f5f94" opacity="${(S.shadow * .72).toFixed(3)}" filter="url(#${id}-table-shade-blur)" style="mix-blend-mode:multiply">${shades}</g>`
    + `</g>`;
}

/** Duck and mug shadows on the table top (inserted before the duck's contact-shadow ellipse; duck markup untouched). */
export function tableObjectsLayer({ id, strength }) {
  const S = STRENGTH[strength], D = DUCK_ON_TABLE, M = MUG;
  return `<defs><filter id="${id}-small-blur" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="1.8"/></filter></defs>`
    + `<g data-p26="sun-table-objects" fill="#3f5f94" opacity="${S.tableShadow}" filter="url(#${id}-small-blur)" style="mix-blend-mode:multiply">${capsule(D.X, D.z, D.Y, D.r, D.h)}${capsule(M.X, M.z, M.Y, M.r, M.h)}</g>`;
}

/** Atmosphere layer (above furniture and duck, below any lamp glow): light cool shade tint, window bloom, white-out panes. */
export function atmosphereLayer({ id, strength }) {
  const S = STRENGTH[strength], c = proj(sc, WINDOW.X, WINDOW.z, (WINDOW.glassBottom + WINDOW.glassTop) / 2), s = c.s;
  const rx = (WINDOW.w / 2 + 1000) * s, ry = (WINDOW.h / 2 + 800) * s;   // wide warm halo across the wall around the window
  return `<defs><radialGradient id="${id}-bloom"><stop offset="0" stop-color="#fff3cf" stop-opacity="${S.bloom}"/><stop offset=".55" stop-color="#ffeab8" stop-opacity="${(S.bloom * .35).toFixed(3)}"/><stop offset="1" stop-color="#ffe4a8" stop-opacity="0"/></radialGradient></defs>`
    + `<rect data-p26="shade-tint" x="-6000" y="-6000" width="14000" height="14000" pointer-events="none" fill="#7c9fd4" opacity="${S.tint}" style="mix-blend-mode:multiply"/>`
    + `<ellipse data-p26="window-bloom" cx="${f1(c.x)}" cy="${f1(c.y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#${id}-bloom)" style="mix-blend-mode:screen"/>`;
}

/** The kit's own markup for the window item, rebuilt with the kit's `put` and `windowMm` (an exact anchor: it must occur once in the scene). */
export const windowItemMarkup = () => put(sc, WINDOW.X, WINDOW.z, WINDOW.Y, windowMm(WINDOW.w, WINDOW.h));

/** White-out of the four panes, inserted right after the window item so the plant, lamp and curtains in front of it stay on top. */
export function windowGlassLayer({ strength }) {
  const S = STRENGTH[strength];
  return `<g data-p26="window-glass">${glassRects().map(r => `<rect x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}" fill="#fffbe8" opacity="${S.glass}"/>`).join('')}</g>`;
}
