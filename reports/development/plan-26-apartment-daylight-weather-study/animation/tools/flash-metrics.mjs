// Plan 26 review tool (NOT runtime): pure luminance and flash-counting maths for the lightning composite measurement. No DOM; tested in Node.
// A simplified reading of the WCAG 2.2 SC 2.3.1 general-flash definition on a sampled frame series. It is a diagnostic, not a certification.

export const REFERENCE_FIELD = Object.freeze({ w: 341, h: 256, px: 341 * 256, quarter: Math.floor(341 * 256 / 4) });   // 10-degree field at the 1024x768 reference; a quarter is the combined-area allowance
const lin = c => { const s = c / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; };
const LUT = Float32Array.from({ length: 256 }, (_, i) => lin(i));

/** WCAG relative luminance of an sRGB colour given as 0-255 channels. */
export const relLuminance = (r, g, b) => .2126 * LUT[r | 0] + .7152 * LUT[g | 0] + .0722 * LUT[b | 0];

/** Per-pixel relative luminance of RGBA bytes (alpha ignored: the raster is drawn on an opaque background). */
export function luminanceFrame(rgba) {
  const n = rgba.length / 4, out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = .2126 * LUT[rgba[i * 4]] + .7152 * LUT[rgba[i * 4 + 1]] + .0722 * LUT[rgba[i * 4 + 2]];
  return out;
}

/** Compare one luminance frame to a base frame over an optional mask(i) -> bool. */
export function frameStats(base, frame, { delta = .1, mask = null } = {}) {
  let n = 0, sb = 0, sf = 0, maxLift = 0, maxDrop = 0, over = 0;
  for (let i = 0; i < base.length; i++) {
    if (mask && !mask(i)) continue;
    const d = frame[i] - base[i]; n++; sb += base[i]; sf += frame[i];
    if (d > maxLift) maxLift = d; if (-d > maxDrop) maxDrop = -d;
    if (Math.abs(d) >= delta) over++;
  }
  return { pixels: n, meanBase: n ? sb / n : 0, meanFrame: n ? sf / n : 0, maxLift, maxDrop, pixelsOverDelta: over };
}

/** Number of alternating swings of at least `delta` in a series (zig-zag with hysteresis); a swing needs its darker end below `darkMax`. */
export function swingsOf(series, delta = .1, darkMax = .8) {
  const EPS = 1e-9, ok = (a, b) => Math.min(a, b) < darkMax;
  let swings = 0, dir = 0, ext = series[0], lo = series[0], hi = series[0], loI = 0, hiI = 0;   // lo/hi: extremes seen while the direction is undecided; ext: running extreme in the current direction
  for (let i = 1; i < series.length; i++) {
    const v = series[i];
    if (dir === 0) {
      if (v > hi) { hi = v; hiI = i; } if (v < lo) { lo = v; loI = i; }
      if (hi - lo >= delta - EPS && ok(hi, lo)) { swings++; dir = hiI > loI ? 1 : -1; ext = dir === 1 ? hi : lo; }
    } else if (dir === 1) {
      if (v > ext) ext = v; else if (ext - v >= delta - EPS && ok(ext, v)) { swings++; dir = -1; ext = v; }
    } else if (v < ext) ext = v; else if (v - ext >= delta - EPS && ok(ext, v)) { swings++; dir = 1; ext = v; }
  }
  return swings;
}
/** Flashes in a series: opposing swing pairs (rise then fall, or fall then rise). */
export const flashesOf = (series, delta = .1, darkMax = .8) => Math.floor(swingsOf(series, delta, darkMax) / 2);

/** Per-pixel flash counts over a list of luminance frames (all the same length). Returns { counts, flashingPixels, maxFlashes }. */
export function pixelFlashes(frames, { delta = .1, darkMax = .8, mask = null } = {}) {
  const n = frames[0].length, counts = new Uint8Array(n), series = new Float32Array(frames.length);
  let flashing = 0, max = 0;
  for (let i = 0; i < n; i++) {
    if (mask && !mask(i)) continue;
    for (let f = 0; f < frames.length; f++) series[f] = frames[f][i];
    const c = flashesOf(series, delta, darkMax); counts[i] = c; if (c) flashing++; if (c > max) max = c;
  }
  return { counts, flashingPixels: flashing, maxFlashes: max };
}

/**
 * Streaming per-pixel swing tracker: push luminance frames one at a time, no frame list is retained (about 17 bytes of state per pixel).
 * Same zig-zag rules as swingsOf, so for any pixel it reports the same swings as swingsOf over that pixel's series.
 */
export function createSwingTracker(n, { delta = .1, darkMax = .8 } = {}) {
  const EPS = 1e-9, ext = new Float32Array(n), lo = new Float32Array(n), hi = new Float32Array(n), loI = new Int32Array(n), hiI = new Int32Array(n), dir = new Int8Array(n), swings = new Uint8Array(n);
  let count = 0;
  function push(frame) {
    if (frame.length !== n) throw new RangeError('swing tracker: frame length differs');
    if (count === 0) { ext.set(frame); lo.set(frame); hi.set(frame); count = 1; return; }
    const at = count++;
    for (let p = 0; p < n; p++) {
      const v = frame[p], d = dir[p];
      if (d === 0) {
        if (v > hi[p]) { hi[p] = v; hiI[p] = at; } if (v < lo[p]) { lo[p] = v; loI[p] = at; }
        if (hi[p] - lo[p] >= delta - EPS && Math.min(hi[p], lo[p]) < darkMax) { swings[p]++; dir[p] = hiI[p] > loI[p] ? 1 : -1; ext[p] = dir[p] === 1 ? hi[p] : lo[p]; }
      } else if (d === 1) {
        if (v > ext[p]) ext[p] = v; else if (ext[p] - v >= delta - EPS && Math.min(ext[p], v) < darkMax) { swings[p]++; dir[p] = -1; ext[p] = v; }
      } else if (v < ext[p]) ext[p] = v; else if (v - ext[p] >= delta - EPS && Math.min(ext[p], v) < darkMax) { swings[p]++; dir[p] = 1; ext[p] = v; }
    }
  }
  /** Flashing pixels (>= 1 opposing swing pair) over an optional mask(i) -> bool. */
  function result(mask = null) {
    let flashing = 0, max = 0;
    for (let p = 0; p < n; p++) { if (mask && !mask(p)) continue; const f = swings[p] >> 1; if (f) flashing++; if (f > max) max = f; }
    return { flashingPixels: flashing, maxFlashes: max, frames: count };
  }
  return { push, result, frames: () => count, swingsAt: p => swings[p] };
}

/** Largest number of event start times falling in any half-open window of `windowMs`. */
export function maxInWindow(startsMs, windowMs = 1000) {
  const t = [...startsMs].sort((a, b) => a - b); let best = 0;
  for (let i = 0; i < t.length; i++) { let c = 0; for (let j = i; j < t.length && t[j] < t[i] + windowMs; j++) c++; if (c > best) best = c; }
  return best;
}
