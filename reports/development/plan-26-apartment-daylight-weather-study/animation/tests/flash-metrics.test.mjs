import test from 'node:test';
import assert from 'node:assert/strict';
import { REFERENCE_FIELD, relLuminance, luminanceFrame, frameStats, swingsOf, flashesOf, pixelFlashes, createSwingTracker, maxInWindow } from '../tools/flash-metrics.mjs';

const near = (a, b, e = 1e-4) => assert.ok(Math.abs(a - b) <= e, `${a} vs ${b}`);

test('relative luminance matches the WCAG formula at known points', () => {
  assert.equal(relLuminance(0, 0, 0), 0); near(relLuminance(255, 255, 255), 1); near(relLuminance(255, 0, 0), .2126); near(relLuminance(0, 255, 0), .7152); near(relLuminance(0, 0, 255), .0722);
  near(relLuminance(119, 119, 119), .1845, .001);
  const f = luminanceFrame(new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255])); near(f[0], 1); near(f[1], 0);
});

test('reference field: 341 x 256 px, quarter 21824', () => { assert.deepEqual([REFERENCE_FIELD.px, REFERENCE_FIELD.quarter], [87296, 21824]); });

test('flash counting: a pulse with swings of at least 0.10 is one flash; smaller swings, noise, bright pairs and one-way ramps are not', () => {
  const pulse = (lo, hi) => [lo, lo, (lo + hi) / 2, hi, (lo + hi) / 2, lo, lo];
  assert.equal(flashesOf(pulse(.05, .20)), 1); assert.equal(flashesOf(pulse(.05, .14)), 0, 'a 0.09 pulse is below the threshold');
  assert.equal(flashesOf(pulse(.05, .15)), 1, 'exactly 0.10 counts');
  assert.equal(flashesOf([...pulse(.05, .3), ...pulse(.05, .3)]), 2);
  assert.equal(flashesOf([.1, .12, .09, .13, .1, .14, .08]), 0, 'noise under the hysteresis');
  assert.equal(flashesOf([.85, .95, .85, .95, .85]), 0, 'both ends at or above 0.80: not a general flash');
  assert.equal(flashesOf([0, .1, .2, .3, .4, .5]), 0, 'a ramp up is one change, not a pair');
  assert.equal(swingsOf([0, .5, 0]), 2); assert.equal(flashesOf([0, .5, 0, .5]), 1);
  assert.equal(flashesOf([.5, 0, .5]), 1, 'fall then rise is also an opposing pair');
});

test('a slow rise split into small frame steps still counts by its total run (steps below 0.10 do not hide it)', () => {
  const up = Array.from({ length: 9 }, (_, i) => .02 + i * .03), down = [...up].reverse();
  assert.equal(flashesOf([...up, ...down.slice(1)]), 1);
});

test('frameStats and pixelFlashes over a tiny frame set with a mask', () => {
  const base = Float32Array.from([.1, .1, .1, .1]), peak = Float32Array.from([.3, .1, .22, .1]);
  const s = frameStats(base, peak); assert.equal(s.pixels, 4); near(s.maxLift, .2); assert.equal(s.maxDrop, 0); assert.equal(s.pixelsOverDelta, 2); near(s.meanFrame, .18);
  const m = frameStats(base, peak, { mask: i => i < 2 }); assert.equal(m.pixels, 2); near(m.meanFrame, .2);
  const r = pixelFlashes([base, Float32Array.from([.2, .1, .15, .1]), peak, Float32Array.from([.2, .1, .15, .1]), base]);
  assert.deepEqual([...r.counts], [1, 0, 1, 0]); assert.equal(r.flashingPixels, 2); assert.equal(r.maxFlashes, 1);
  assert.equal(pixelFlashes([base, peak, base], { mask: i => i === 1 }).flashingPixels, 0);
});

test('maxInWindow: rolling-window count of event starts', () => {
  assert.equal(maxInWindow([0, 4000, 8000]), 1); assert.equal(maxInWindow([0, 999, 4000]), 2); assert.equal(maxInWindow([0, 1000]), 1, 'window is half-open'); assert.equal(maxInWindow([]), 0);
});

test('streaming swing tracker equals the series-based counter pixel by pixel, without retaining frames', () => {
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const n = 64, frames = Array.from({ length: 40 }, () => Float32Array.from({ length: n }, () => rnd()));
  for (let p = 0; p < n; p += 3) for (let f = 10; f < 20; f++) frames[f][p] = .05 + .3 * Math.sin((f - 10) / 9 * Math.PI);        // some smooth pulses among the noise
  const t = createSwingTracker(n); frames.forEach(f => t.push(f));
  for (let p = 0; p < n; p++) assert.equal(t.swingsAt(p), swingsOf(frames.map(f => f[p])), `pixel ${p}`);
  const ref = pixelFlashes(frames), got = t.result(); assert.deepEqual([got.flashingPixels, got.maxFlashes, got.frames], [ref.flashingPixels, ref.maxFlashes, 40]);
  assert.equal(t.result(p => p < 10).flashingPixels, pixelFlashes(frames, { mask: p => p < 10 }).flashingPixels);
  assert.throws(() => t.push(new Float32Array(3)), RangeError);
});

test('saturated-red tracker: hand-computed cases (pure red and 240,30,20 are saturated red in sRGB; 230,40,20 and grey are not), transitions and opposing pairs', async () => {
  const { createRedTracker } = await import('../tools/flash-metrics.mjs');
  const px = (...c) => c.flatMap(([r, g, b]) => [r, g, b, 255]), red = [255, 0, 0], white = [255, 255, 255], near = [240, 30, 20], justUnder = [230, 40, 20], grey = [120, 100, 100];
  const frames = [px(red, white, near, justUnder, grey), px(white, white, white, white, grey), px(red, white, near, justUnder, grey)].map(a => Uint8ClampedArray.from(a));
  const t = createRedTracker(5); frames.forEach(f => t.push(f)); const r = t.result();
  assert.deepEqual([r.redPixelsInFirstFrame, r.pixelsEverSaturatedRed, r.redTransitionEvents, r.pixelsWithOpposingRedTransitions], [2, 2, 4, 2]); assert.ok(r.maxRedValue0to320 > 300);
  const lin = createRedTracker(5, { linear: true }); frames.forEach(f => lin.push(f)); assert.equal(lin.result().pixelsEverSaturatedRed, 3, 'the linearised basis also flags 230,40,20: the basis matters, so both are reported');
  assert.throws(() => t.push(new Uint8ClampedArray(8)), RangeError);
});
