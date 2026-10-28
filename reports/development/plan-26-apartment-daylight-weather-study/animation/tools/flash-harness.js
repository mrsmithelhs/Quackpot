// Plan 26 review tool (NOT runtime): in-page composite measurement of the lightning pulse, reached as window.__p26m.harness. Works for either look (bright or
// restrained): timing, key times, peak and the expected opacity curve are read from the held pulse's OWN keyframes, nothing is assumed about one look.
// Method (see lightning-mechanism.md): the pulse animations are PAUSED and SEEKED to chosen times, the stage (or the grid) is rasterised at CSS scale 1
// with the animated opacity baked into the clone, and per-pixel relative luminance is analysed with the pure maths in flash-metrics.mjs.
// Nothing depends on real-time frame delivery. Rain is frozen at one time so only the pulse differs between frames.
// Memory is bounded: one scene at a time, frames are STREAMED (a base frame, the previous frame and the current one are all that is kept; flash
// counting uses per-pixel running state), canvases are released after each capture, and a pixel limit and a JS-heap growth guard stop a run early.
// Numbers are diagnostic only. They are not a conformance analysis, find no maximum flashing area in any reference field, and certify nothing.
import { raster, sceneOf, seek, sleep } from './browser-harness.js';
import { luminanceFrame, frameStats, createSwingTracker, pixelFlashes, swingsOf, maxInWindow, REFERENCE_FIELD } from './flash-metrics.mjs';
import { createLightningEffect } from '../lightning.mjs';

const STEP_MS = 20, HZ60 = 1000 / 60, MAX_STAGE_PX = 1.2e6, MAX_GRID_PX = 2.4e6, MAX_HEAP_GROWTH = 200e6;
const round = (n, d = 4) => (n === null || n === undefined ? n : +n.toFixed(d));
const heap = () => (performance.memory ? performance.memory.usedJSHeapSize : null);
const guard = (start, where) => { const h = heap(); if (start !== null && h !== null && h - start > MAX_HEAP_GROWTH) throw new Error(`flash harness: JS heap grew ${Math.round((h - start) / 1e6)} MB during ${where}; stopped`); };

/** Opacity of a held pulse animation at time t, from its own keyframes (piecewise linear). */
function expectedOpacity(anim, t) {
  const kf = anim.effect.getKeyframes(), dur = anim.effect.getComputedTiming().duration, p = t / dur;
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i], b = kf[i + 1];
    if (p >= a.offset && p <= b.offset) return b.offset === a.offset ? +b.opacity : +a.opacity + (+b.opacity - +a.opacity) * (p - a.offset) / (b.offset - a.offset);
  }
  return 0;
}
/** Duration, key times (every keyframe offset of every layer) and the time of the largest total opacity, read from the held animations. */
function pulseInfo(anims) {
  const dur = anims[0].effect.getComputedTiming().duration, keyTimes = new Set();
  for (const a of anims) for (const k of a.effect.getKeyframes()) keyTimes.add(round(k.offset * dur, 3));
  const keys = [...keyTimes].sort((x, y) => x - y); let peakMs = 0, best = -1;
  for (const t of keys) { const sum = anims.reduce((n, a) => n + expectedOpacity(a, t), 0); if (sum > best + 1e-12) { best = sum; peakMs = t; } }
  return { durationMs: dur, keyTimes: keys, peakMs };
}
/** Sample times: every 20 ms over the whole pulse, every key time (so extrema and both transitions are hit exactly), plus a 60 Hz grid; the end sample sits just inside the pulse. */
export function sampleTimes(info) {
  const t = new Set(), d = info.durationMs;
  for (let x = 0; x <= d; x += STEP_MS) t.add(x);
  for (const k of info.keyTimes) t.add(k);
  for (let k = 0; k * HZ60 <= d; k++) t.add(round(k * HZ60, 3));
  return [...t].map(x => Math.min(x, d - .01)).sort((a, b) => a - b);
}
const onGrid = (t, step, d) => Math.abs(t / step - Math.round(t / step)) < 1e-3 || t >= d - .02;

/** Start a pulse through the controller's own path (shared arbiter, all refusal rules) and hold it paused so it can be sampled. Waits out a cooldown once. */
async function startHeld(ctl, requester) {
  const m = window.__p26m, restore = m.schedule; m.schedule = () => () => {};                         // measurement-only hold: no wall-clock watchdog while frames are sampled; ALWAYS restored in held.done()
  let t;
  try {
    t = ctl.requestFlash({ requester });
    if (t.status === 'refused' && t.reason === 'cooldown') { await sleep(Math.ceil(t.retryAfterMs) + 60); t = ctl.requestFlash({ requester }); }
  } catch (e) { m.schedule = restore; throw e; }
  if (t.status !== 'accepted') { m.schedule = restore; return { refused: t.reason || 'refused', retryAfterMs: t.retryAfterMs }; }
  const anims = ctl.flashAnimations(); for (const a of anims) a.pause();
  return { ticket: t, anims, info: pulseInfo(anims), done: () => { m.schedule = restore; } };
}
const setPulseTime = (anims, t) => { for (const a of anims) a.currentTime = t; };
const opacityOf = el => +getComputedStyle(el).opacity;
const freezeRain = (ctl, ms = 500) => seek(ctl, ms);                                                   // paused at one time; the controller itself is not told, so nothing is cancelled
const restoreRain = ctl => { ctl.stop(); ctl.start(); };                                               // after the flash is gone: back to a clean running scene
const lookName = () => (window.__p26m.state && window.__p26m.state.look) || 'unknown';

function maskFor(inst, stage, w) {
  const sr = stage.getBoundingClientRect(), k = w / sr.width, box = el => { const r = el.getBoundingClientRect(); return { x0: (r.left - sr.left) * k, y0: (r.top - sr.top) * k, x1: (r.right - sr.left) * k, y1: (r.bottom - sr.top) * k }; };
  const inBox = b => i => { const x = i % w, y = (i / w) | 0; return x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1; };
  const glass = box(inst.root.querySelector('[data-p26="sky"]')), duckEl = inst.root.querySelector('svg[role="img"]'), duck = duckEl ? box(duckEl) : null;
  const gm = inBox(glass);
  return { glass: gm, duck: duck ? inBox(duck) : null, notGlass: i => !gm(i), glassBox: glass, duckBox: duck };
}

/** The capture method's own checks that need no scene: the streaming tracker equals the series counter on random data. */
export function metricsSelfCheck() {
  let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const n = 48, frames = Array.from({ length: 36 }, () => Float32Array.from({ length: n }, () => rnd()));
  for (let p = 0; p < n; p += 4) for (let f = 8; f < 18; f++) frames[f][p] = .05 + .3 * Math.sin((f - 8) / 9 * Math.PI);
  const t = createSwingTracker(n); frames.forEach(f => t.push(f));
  let bad = 0; for (let p = 0; p < n; p++) if (t.swingsAt(p) !== swingsOf(frames.map(f => f[p]))) bad++;
  const ref = pixelFlashes(frames), got = t.result();
  return { trackerEqualsSeriesCounter: bad === 0 && ref.flashingPixels === got.flashingPixels, pixels: n, frames: frames.length, mismatches: bad };
}

/**
 * Positive control (ONE deterministic capture pair, animation held): the raw clone is blind to the pulse, the baked clone sees it, the baked capture at
 * t=0 equals the scene without any overlay, and the lifted pixels are located (inside and outside the DOM glass box).
 */
export async function flashPositiveControl(id, { W = null } = {}) {
  const { inst, stage } = sceneOf(id), r = stage.getBoundingClientRect(), w = W || Math.round(r.width), h = Math.round(w * r.height / r.width), n = w * h;
  if (n > MAX_STAGE_PX) return { id, refused: `raster ${w}x${h} exceeds the ${MAX_STAGE_PX} px bound` };
  const h0 = heap(); freezeRain(inst.ctl);
  const noOverlay = luminanceFrame((await raster(stage, w, h, true)).data);                            // frozen rain, no flash node in the DOM
  const held = await startHeld(inst.ctl, 'positive-control'); if (held.refused) return { id, refused: held.refused, retryAfterMs: held.retryAfterMs };
  const masks = maskFor(inst, stage, w), pk = held.info.peakMs; let out;
  try {
    const targets = inst.ctl.flashTargets();
    setPulseTime(held.anims, 0); const opac0 = targets.map(opacityOf), raw0 = luminanceFrame((await raster(stage, w, h, false)).data), baked0 = luminanceFrame((await raster(stage, w, h, true)).data);
    setPulseTime(held.anims, pk); const opacPk = targets.map(opacityOf), expPk = held.anims.map(a => expectedOpacity(a, pk)), raw1 = luminanceFrame((await raster(stage, w, h, false)).data), baked1 = luminanceFrame((await raster(stage, w, h, true)).data);
    const raw = frameStats(raw0, raw1), baked = frameStats(baked0, baked1), invisibleAtZero = frameStats(noOverlay, baked0);
    let lifted = 0, liftedInGlass = 0; for (let i = 0; i < n; i++) if (baked1[i] - baked0[i] > .005) { lifted++; if (masks.glass(i)) liftedInGlass++; }
    const gl = frameStats(baked0, baked1, { mask: masks.glass }), outside = frameStats(baked0, baked1, { mask: masks.notGlass }), duck = masks.duck ? frameStats(baked0, baked1, { mask: masks.duck }) : null;
    guard(h0, 'positive control');
    out = {
      id, look: lookName(), viewport: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, rasterSize: `${w}x${h}`, rasterScaleToCss: round(w / r.width, 3), peakMs: pk,
      computedOverlayOpacity: { t0: opac0.map(x => round(x, 6)), peak: opacPk.map(x => round(x, 6)), expectedAtPeakFromKeyframes: expPk.map(x => round(x, 6)) },
      rawCloneMaxLiftT0toPeak: round(raw.maxLift), rawCloneBlind: raw.maxLift === 0 && raw.maxDrop === 0,
      bakedCloneMaxLiftT0toPeak: round(baked.maxLift), bakedCloneSeesPulse: baked.maxLift > .005 && baked.maxLift > raw.maxLift * 5,
      bakedT0EqualsSceneWithoutOverlay: invisibleAtZero.maxLift === 0 && invisibleAtZero.maxDrop === 0,
      lift: { glassMeanLift: round(gl.meanFrame - gl.meanBase), glassMaxLift: round(gl.maxLift), outsideGlassMeanLift: round(outside.meanFrame - outside.meanBase), outsideGlassMaxLift: round(outside.maxLift), duckRegionMaxLift: duck ? round(duck.maxLift) : null, duckRegionMeanLift: duck ? round(duck.meanFrame - duck.meanBase) : null, wholeStageMaxLift: round(baked.maxLift), wholeStageMeanLift: round(baked.meanFrame - baked.meanBase) },
      geometry: { pixels: n, liftedPixels: lifted, liftedShareOfStage: round(lifted / n, 3), liftedPixelsInsideGlassBox: liftedInGlass, glassBoxPx: Math.round((masks.glassBox.x1 - masks.glassBox.x0) * (masks.glassBox.y1 - masks.glassBox.y0)) },
      heapGrowthMB: heap() === null ? null : Math.round((heap() - h0) / 1e6)
    };
  } finally { for (const a of held.anims) { try { a.cancel(); } catch { /* gone */ } } await sleep(80); held.done(); restoreRain(inst.ctl); }
  out.ticketOutcomeAfterHoldCancel = held.ticket.outcome() || 'pending';
  out.methodSeesRenderedEffect = out.rawCloneBlind && out.bakedCloneSeesPulse && out.bakedT0EqualsSceneWithoutOverlay && out.geometry.liftedPixels > 0;
  return out;
}

/** Draw the baked capture at pulse time `t` (default: the peak) onto a visible canvas under the stage so it can be compared by eye with the live scene. Remove with hideCapture(). */
export async function showCapture(id, t = null, { W = null } = {}) {
  const { inst, stage } = sceneOf(id), r = stage.getBoundingClientRect(), w = W || Math.round(r.width), h = Math.round(w * r.height / r.width);
  const held = await startHeld(inst.ctl, 'show-capture'); if (held.refused) return { id, refused: held.refused };
  const at = t === null ? held.info.peakMs : t;
  try {
    freezeRain(inst.ctl); setPulseTime(held.anims, at); const img = await raster(stage, w, h, true);
    hideCapture(); const c = document.createElement('canvas'); c.id = 'p26-capture-debug'; c.width = w; c.height = h; c.style.cssText = `display:block;margin:.5rem 0;width:${w}px;height:${h}px;border:2px dashed #805638`;
    c.getContext('2d').putImageData(img, 0, 0); const fig = stage.closest('figure'); fig.appendChild(c);
    return { id, look: lookName(), t: at, shownAs: `canvas ${w}x${h} CSS px below the live stage (dashed border); compare geometry and colours by eye` };
  } finally { for (const a of held.anims) { try { a.cancel(); } catch { /* gone */ } } await sleep(80); held.done(); restoreRain(inst.ctl); }
}
export const hideCapture = () => { for (const c of document.querySelectorAll('#p26-capture-debug')) { c.width = c.height = 0; c.remove(); } };

/** Full composite measurement of ONE scene's pulse, streamed. Leaves the scene neutral and running. */
export async function flashMeasure(id, { W = null } = {}) {
  const { inst, stage } = sceneOf(id), sr = stage.getBoundingClientRect(), w = W || Math.round(sr.width), h = Math.round(w * sr.height / sr.width), n = w * h;
  if (n > MAX_STAGE_PX) return { id, refused: `raster ${w}x${h} exceeds the ${MAX_STAGE_PX} px bound` };
  const h0 = heap(); freezeRain(inst.ctl);
  const base = luminanceFrame((await raster(stage, w, h, true)).data);                                  // frozen rain, no flash node in the DOM: the reference for lift AND for the neutral check
  const held = await startHeld(inst.ctl, 'measure'); if (held.refused) return { id, refused: held.refused, retryAfterMs: held.retryAfterMs };
  const info = held.info, times = sampleTimes(info), masks = maskFor(inst, stage, w), t20 = createSwingTracker(n), t60 = createSwingTracker(n), tAll = createSwingTracker(n), rows = [];
  let prev = null, curveErr = 0, peakLift = 0, peakLiftAt = 0, peakStep = 0, peakStepAt = 0, glassMeanPeak = 0, stageMeanPeak = 0, duckPeak = 0, duckMeanPeak = 0, outsideGlassPeak = 0, zeroOverlay = null, neutral = null, domClean = null, outcome = null;
  try {
    const targets = inst.ctl.flashTargets();
    for (let i = 0; i < times.length; i++) {
      const t = times[i]; setPulseTime(held.anims, t);
      const ops = targets.map(opacityOf); ops.forEach((o, k) => { curveErr = Math.max(curveErr, Math.abs(o - expectedOpacity(held.anims[k], t))); });
      const f = luminanceFrame((await raster(stage, w, h, true)).data);
      if (i === 0) zeroOverlay = frameStats(base, f);
      const all = frameStats(base, f), g = frameStats(base, f, { mask: masks.glass }), o = frameStats(base, f, { mask: masks.notGlass }), d = masks.duck ? frameStats(base, f, { mask: masks.duck }) : null;
      const step = prev ? frameStats(prev, f) : { maxLift: 0, maxDrop: 0 }, stepMax = Math.max(step.maxLift, step.maxDrop);
      rows.push({ t: round(t, 2), opacities: ops.map(x => round(x)), stageMean: round(all.meanFrame), glassMean: round(g.meanFrame), maxLift: round(all.maxLift), step: round(stepMax) });
      if (all.maxLift > peakLift) { peakLift = all.maxLift; peakLiftAt = t; }
      if (stepMax > peakStep) { peakStep = stepMax; peakStepAt = t; }
      glassMeanPeak = Math.max(glassMeanPeak, g.meanFrame - g.meanBase); stageMeanPeak = Math.max(stageMeanPeak, all.meanFrame - all.meanBase);
      if (d) { duckPeak = Math.max(duckPeak, d.maxLift); duckMeanPeak = Math.max(duckMeanPeak, d.meanFrame - d.meanBase); } outsideGlassPeak = Math.max(outsideGlassPeak, o.maxLift);
      tAll.push(f); if (onGrid(t, STEP_MS, info.durationMs)) t20.push(f); if (onGrid(t, HZ60, info.durationMs)) t60.push(f);
      prev = f; guard(h0, `sampling t=${round(t, 1)}`);
    }
    // restoration, isolated from rain: cancel ONLY the pulse; rain stays frozen at the same time, so the neutral frame must equal the pre-flash reference
    for (const a of held.anims) a.cancel();
    await sleep(80);
    domClean = inst.root.querySelector('[data-p26-flash]') === null;
    neutral = frameStats(base, luminanceFrame((await raster(stage, w, h, true)).data));
    outcome = await Promise.race([held.ticket.done, sleep(500).then(() => 'still pending')]);
  } finally { held.done(); restoreRain(inst.ctl); }
  const gm = masks.glassBox;
  return {
    id, look: lookName(), viewport: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, rasterSize: `${w}x${h}`, rasterScaleToCss: round(w / sr.width, 3), pixels: n, framesSampled: times.length, framesRetainedAtOnce: 3,
    pulse: { durationMs: info.durationMs, keyTimesMs: info.keyTimes, peakMs: info.peakMs },
    heapGrowthMB: heap() === null ? null : Math.round((heap() - h0) / 1e6),
    animationVsOwnKeyframesMaxOpacityError: round(curveErr, 6),
    overlayInvisibleAtT0VsNoOverlay: { maxLift: round(zeroOverlay.maxLift), maxDrop: round(zeroOverlay.maxDrop) },
    restoration: { overlayNodesRemovedFromDom: domClean, neutralVsPreFlashReference: { maxLift: round(neutral.maxLift), maxDrop: round(neutral.maxDrop) }, rain: 'frozen at the same time for both frames (isolated)', ticketOutcomeAfterCancel: outcome },
    extrema: { peakLiftAtMs: round(peakLiftAt, 2), peakMaxPixelLift: round(peakLift), peakWholeStageMeanLift: round(stageMeanPeak), peakGlassMeanLift: round(glassMeanPeak), peakOutsideGlassMaxLift: round(outsideGlassPeak), peakDuckRegionMaxLift: masks.duck ? round(duckPeak) : null, peakDuckRegionMeanLift: masks.duck ? round(duckMeanPeak) : null },
    transitions: { largestFrameToFrameStep: round(peakStep), at: round(peakStepAt, 2), sampling: `every ${STEP_MS} ms, every key time and a 60 Hz grid, merged (${times.length} samples)` },
    flash: {
      definition: 'per pixel: rise swing >= 0.10 then fall swing >= 0.10 of relative luminance, darker end < 0.80 (WCAG 2.2 SC 2.3.1 general flash, simplified; luminance and opposing transitions only)',
      limits: 'counts flashing pixels over the whole raster; it does NOT find the maximum flashing area inside any 341x256 reference field, evaluates no spatial or frequency conformance, and makes no pass claim',
      referenceField: `${REFERENCE_FIELD.w}x${REFERENCE_FIELD.h} px = ${REFERENCE_FIELD.px} (a quarter is ${REFERENCE_FIELD.quarter}); stage raster ${n} px at CSS scale ${round(w / sr.width, 3)}; glass box about ${Math.round((gm.x1 - gm.x0) * (gm.y1 - gm.y0))} px`,
      at20msGrid: t20.result(), at60HzGrid: t60.result(), allSamples: tAll.result(),
      schedulerMaxPulsesInAnyRollingSecond: maxInWindow([0, 4000, 8000, 12000], 1000),
      redTransitions: 'not analysed (the composite colours were not examined for red transitions; the overlay fill colours are not evidence of absence)'
    },
    rows
  };
}

/**
 * Grid-level aggregate over simultaneous storm scenes: one request on every storm scene in the same tick, then the accepted pulse is held and the
 * WHOLE #grid element is rasterised (CSS scale 1). The grid raster is generally larger than the viewport, so the result is labelled grid-level; the
 * part of it inside the current viewport is reported separately. Streamed: a base frame, the previous frame and the current one only.
 */
export async function flashAggregate() {
  const m = window.__p26m, storm = [...m.scenes.values()].filter(i => i.weather === 'storm' && i.ctl.state().phase !== 'destroyed');
  const grid = document.querySelector('#grid'), gr = grid.getBoundingClientRect(), w = Math.round(gr.width), h = Math.round(gr.height), n = w * h;
  if (storm.length < 2) return { refused: 'need at least two storm scenes on the page (use "four copies of the selected scene" with Storm selected)' };
  if (n > MAX_GRID_PX) return { refused: `grid raster ${w}x${h} exceeds the ${MAX_GRID_PX} px bound; narrow the page or show fewer scenes` };
  const h0 = heap(), restore = m.schedule; m.schedule = () => () => {};                                  // measurement-only hold, restored in finally
  let accepted = [], refused = [], summary, out;
  try {
    for (const s of storm) freezeRain(s.ctl);
    const base = luminanceFrame((await raster(grid, w, h, true)).data);
    const ask = () => storm.map(i => ({ id: i.id, out: i.ctl.requestFlash({ requester: `aggregate:${i.id}` }) }));
    let results = ask();
    if (results.every(r => r.out.status !== 'accepted') && results.every(r => r.out.reason === 'cooldown')) { await sleep(Math.ceil(Math.max(...results.map(r => r.out.retryAfterMs))) + 60); results = ask(); }
    accepted = results.filter(r => r.out.status === 'accepted'); refused = results.filter(r => r.out.status !== 'accepted');
    summary = { look: lookName(), stormScenes: storm.length, accepted: accepted.length, refused: refused.map(r => `${r.id}:${r.out.reason}`), scenesWithOverlay: storm.filter(i => i.root.querySelector('[data-p26-flash]')).length, arbiter: m.arbiter.snapshot().stats };
    if (!accepted.length) return { ...summary, note: 'nothing accepted (cooldown or a blocker); no composite taken' };
    const inst = m.scenes.get(accepted[0].id), anims = inst.ctl.flashAnimations(); for (const a of anims) a.pause();
    const info = pulseInfo(anims), vx0 = Math.max(0, Math.round(-gr.left)), vy0 = Math.max(0, Math.round(-gr.top)), vx1 = Math.min(w, Math.round(innerWidth - gr.left)), vy1 = Math.min(h, Math.round(innerHeight - gr.top));
    const inView = i => { const x = i % w, y = (i / w) | 0; return x >= vx0 && x < vx1 && y >= vy0 && y < vy1; };
    const times = [...new Set([0, ...info.keyTimes, info.durationMs / 2, info.durationMs - .01].map(x => Math.min(x, info.durationMs - .01)))].sort((a, b) => a - b), tracker = createSwingTracker(n), rows = []; let peak = null, peakView = null;
    for (const t of times) {
      setPulseTime(anims, t); const f = luminanceFrame((await raster(grid, w, h, true)).data), all = frameStats(base, f), vw = frameStats(base, f, { mask: inView });
      rows.push({ t: round(t, 2), gridMaxLift: round(all.maxLift), gridMeanLift: round(all.meanFrame - all.meanBase), gridPixelsOver010: all.pixelsOverDelta, viewportMaxLift: round(vw.maxLift), viewportPixelsOver010: vw.pixelsOverDelta });
      if (t === info.peakMs) { peak = all; peakView = vw; }
      tracker.push(f); guard(h0, `aggregate t=${round(t, 1)}`);
    }
    for (const a of anims) a.cancel(); await sleep(80);
    const clean = storm.every(i => !i.root.querySelector('[data-p26-flash]')), neutral = frameStats(base, luminanceFrame((await raster(grid, w, h, true)).data));
    out = {
      ...summary, label: 'GRID-LEVEL DIAGNOSTIC, not a verified whole-viewport result',
      viewport: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, extent: { gridRasterCssPx: `${w}x${h}`, gridRectInViewport: `left ${Math.round(gr.left)}, top ${Math.round(gr.top)}`, rasterScaleToCss: 1, viewportCropInGridRaster: `x ${vx0}-${vx1}, y ${vy0}-${vy1}` },
      peakAtMs: info.peakMs, grid: { peakMaxLift: round(peak.maxLift), pixelsOver010AtPeak: peak.pixelsOverDelta, flashingPixelsTotal: tracker.result().flashingPixels },
      viewportCrop: { peakMaxLift: round(peakView.maxLift), pixelsOver010AtPeak: peakView.pixelsOverDelta, flashingPixelsTotal: tracker.result(inView).flashingPixels },
      areaNote: 'flashing pixels are totals over the stated extent; they are not the maximum inside any 341x256 reference field and carry no area-based pass claim',
      sampledAtMs: times.map(t => round(t, 2)), rows, heapGrowthMB: heap() === null ? null : Math.round((heap() - h0) / 1e6),
      restoration: { overlayNodesRemoved: clean, neutralVsPreFlashReference: { maxLift: round(neutral.maxLift), maxDrop: round(neutral.maxDrop) }, rain: 'frozen at one time for every scene in both frames' }
    };
  } finally { m.schedule = restore; for (const s of storm) restoreRain(s.ctl); }
  return out;
}

export { createLightningEffect };
