// Plan 26 Stage B: pure spec of the animation-only rain layers. No DOM, no animation API here: the controller turns this data into nodes.
//
// The approved still rain (a random seeded streak path inside the pane clip) is NOT replaced: while motion is active the controller
// hides it and shows these layers, then restores it exactly. These layers are new art (own seeds, far/near split, sliding drops), so the
// moving picture differs from the still on purpose; only the look parameters (colour, slant, widths, density) are derived from WEATHER_LOOK.
//
// Seamless loop: a streak tile has height H and the lattice vector v = (-H*tan(slant), H) along the streak direction. Three copies
// sit at k*v (k = -2, -1, 0) inside one group that is translated by exactly v over one cycle. At phase 1 the three copies stand at
// (-1, 0, +1)*v, which shows the same visible content as phase 0 provided the copy that is off-frame (below at +v, above at -2v) stays
// off-frame: H must exceed the glass height and the streak overhang. tests/rain-motion.test.mjs checks that geometrically.
import { WEATHER_LOOK } from '../study/weather.mjs';
import { glassRects } from '../study/daylight.mjs';

/** Same small PRNG as the still (mulberry32), copied so the approved still generator stays untouched. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** First-pass tuning in scene units per second (the glass is roughly 214 x 190 units); owner/browser review may retune these. */
export const MOTION_LOOK = {
  rain: { far: { share: .6, speed: 110, w: .85, op: .62 }, near: { share: .4, speed: 190, w: 1.15, op: 1 }, seed: 1100, dropDuration: [8000, 13000] },
  storm: { far: { share: .55, speed: 200, w: .95, op: .62 }, near: { share: .45, speed: 330, w: 1.2, op: 1 }, seed: 2200, dropDuration: [6000, 10000] }
};
export const TILE_COPIES = [-2, -1, 0];
/** Weathers that have rain motion. Overcast has none by design. */
export const MOTION_WEATHERS = Object.keys(MOTION_LOOK);

function glassBox() {
  const r = glassRects(), x0 = Math.min(...r.map(a => a.x)), y0 = Math.min(...r.map(a => a.y)), x1 = Math.max(...r.map(a => a.x + a.w)), y1 = Math.max(...r.map(a => a.y + a.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
const r1 = n => Math.round(n * 10) / 10;

function streakLayer(name, look, R, M, b, r) {
  const slant = R.slant * Math.PI / 180, s = Math.sin(slant), c = Math.cos(slant), t = s / c;
  const H = Math.ceil(b.h) + 40, over = Math.ceil(H * t);
  const xMin = b.x - 20 - over, xMax = b.x + b.w + 20 + over;
  const area = (xMax - xMin) * H, origArea = (b.w + 40) * (b.h + 10);
  const n = Math.round(R.n * look.share * area / origArea);
  const mid = (R.len[0] + R.len[1]) / 2;
  const lenRange = name === 'rain-far' ? [R.len[0], mid] : [mid, R.len[1] * 1.1];
  const segments = Array.from({ length: n }, () => {
    const len = lenRange[0] + r() * (lenRange[1] - lenRange[0]), x = xMin + r() * (xMax - xMin), y = b.y + r() * H;
    return [r1(x), r1(y), r1(x - len * s), r1(y + len * c)];
  });
  const v = { dx: r1(-H * t), dy: H };
  return {
    name, type: 'streaks', tileHeight: H, vector: v, copies: TILE_COPIES, segments,
    d: segments.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join(''),
    style: { fill: 'none', stroke: R.color, 'stroke-width': Math.round(R.w * look.w * 100) / 100, 'stroke-linecap': 'round', opacity: Math.round(R.op * look.op * 100) / 100 },
    speed: look.speed, durationMs: Math.round(Math.hypot(v.dx, v.dy) / look.speed * 1000)
  };
}

function dropLayer(L, M, b, r) {
  const drops = Array.from({ length: L.drops }, () => {
    const rx = 1.8 + r() * 1.8, ry = rx * 1.45, travel = 10 + r() * 10, durationMs = Math.round(M.dropDuration[0] + r() * (M.dropDuration[1] - M.dropDuration[0]));
    const cx = b.x + 6 + r() * (b.w - 12), cy = b.y + 8 + r() * (b.h - 16 - travel);
    return { cx: r1(cx), cy: r1(cy), rx: Math.round(rx * 100) / 100, ry: Math.round(ry * 100) / 100, travel: r1(travel), durationMs, delayMs: -Math.round(r() * durationMs) };
  });
  return { name: 'drops', type: 'drops', drops };
}

/** The motion spec for a weather, or null when that weather has no rain motion (overcast). Unknown weathers throw. */
export function rainMotionSpec(weather) {
  if (!(weather in WEATHER_LOOK)) throw new RangeError(`rain motion: unknown weather '${weather}'`);
  const M = MOTION_LOOK[weather];
  if (!M) return null;
  const L = WEATHER_LOOK[weather], R = L.rain, b = glassBox(), r = rng(M.seed);
  return {
    weather, glass: b,
    hide: ['rain-streaks', 'droplets'],                    // original still roles, hidden only while motion is active
    layers: [streakLayer('rain-far', M.far, R, M, b, r), streakLayer('rain-near', M.near, R, M, b, r), dropLayer(L, M, b, r)]
  };
}

/** Segments of a streak layer in scene coordinates at loop phase u in [0, 1] (copies translated by (k + u) * v). */
export function segmentsAt(layer, u) {
  const out = [];
  for (const k of layer.copies) {
    const ox = (k + u) * layer.vector.dx, oy = (k + u) * layer.vector.dy;
    for (const [x1, y1, x2, y2] of layer.segments) out.push([x1 + ox, y1 + oy, x2 + ox, y2 + oy]);
  }
  return out;
}

/** Segments whose bounding box touches the glass box (what could be seen at that phase, before pane clipping). */
export function visibleSegments(layer, u, box) {
  return segmentsAt(layer, u).filter(([x1, y1, x2, y2]) => Math.max(x1, x2) >= box.x && Math.min(x1, x2) <= box.x + box.w && Math.max(y1, y2) >= box.y && Math.min(y1, y2) <= box.y + box.h);
}

/** WAAPI keyframes/options for each animated target, `transform` and `opacity` only. */
export function keyframesFor(layer) {
  if (layer.type === 'streaks') return { keyframes: [{ transform: 'translate(0px, 0px)' }, { transform: `translate(${layer.vector.dx}px, ${layer.vector.dy}px)` }], options: { duration: layer.durationMs, iterations: Infinity, easing: 'linear' } };
  throw new RangeError(`keyframesFor: no layer-level animation for '${layer.type}' (drops animate per drop)`);
}
export function dropKeyframes(d) {
  return { keyframes: [{ transform: 'translate(0px, 0px)', opacity: 0, offset: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .75 }, { transform: `translate(0px, ${d.travel}px)`, opacity: 0, offset: 1 }], options: { duration: d.durationMs, delay: d.delayMs, iterations: Infinity, easing: 'linear' } };
}
