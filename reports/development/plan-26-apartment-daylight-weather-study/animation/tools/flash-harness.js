// Plan 26 review tool (NOT runtime): in-page composite measurement of the lightning pulse, reached as window.__p26m.harness.
// Method (see lightning-mechanism.md): the pulse animations are PAUSED and SEEKED to chosen times, the stage (or the whole grid) is rasterised with the
// animated opacity baked into the clone, and per-pixel relative luminance is analysed with the pure maths in flash-metrics.mjs. Nothing depends on
// real-time frame delivery. Rain is frozen at one time so only the pulse differs between frames. Numbers are diagnostic, not a certification.
import { raster, sceneOf, seek, sleep } from './browser-harness.js';
import { luminanceFrame, frameStats, pixelFlashes, maxInWindow, REFERENCE_FIELD } from './flash-metrics.mjs';
import { LIGHTNING, pulseFactor, createLightningEffect } from '../lightning.mjs';

const L = LIGHTNING, STEP_MS = 20, HZ60 = 1000 / 60;
const round = (n, d = 4) => (n === null || n === undefined ? n : +n.toFixed(d));

/** Sample times: every 20 ms over the whole pulse (both transitions and the peak) plus a 60 Hz grid; the end sample sits just inside the pulse. */
export function sampleTimes() {
  const t = new Set();
  for (let x = 0; x <= L.durationMs; x += STEP_MS) t.add(x);
  t.add(L.peakMs);
  for (let k = 0; k * HZ60 <= L.durationMs; k++) t.add(round(k * HZ60, 3));
  return [...t].map(x => Math.min(x, L.durationMs - .01)).sort((a, b) => a - b);
}

/** Start a pulse through the controller's own path (shared arbiter, all refusal rules) and hold it paused so it can be sampled. Waits out a cooldown once. */
async function startHeld(ctl, requester) {
  const m = window.__p26m, restore = m.schedule; m.schedule = () => () => {};                         // measurement only: no wall-clock watchdog while frames are sampled
  let t = ctl.requestFlash({ requester });
  if (t.status === 'refused' && t.reason === 'cooldown') { await sleep(Math.ceil(t.retryAfterMs) + 60); t = ctl.requestFlash({ requester }); }
  if (t.status !== 'accepted') { m.schedule = restore; return { refused: t.reason || 'refused', retryAfterMs: t.retryAfterMs }; }
  const anims = ctl.flashAnimations(); for (const a of anims) a.pause();
  return { ticket: t, anims, done: () => { m.schedule = restore; } };
}
const setPulseTime = (anims, t) => { for (const a of anims) a.currentTime = t; };
const opacityOf = el => +getComputedStyle(el).opacity;

function maskFor(inst, stage, w, h) {
  const sr = stage.getBoundingClientRect(), k = w / sr.width, box = el => { const r = el.getBoundingClientRect(); return { x0: (r.left - sr.left) * k, y0: (r.top - sr.top) * k, x1: (r.right - sr.left) * k, y1: (r.bottom - sr.top) * k }; };
  const inBox = b => i => { const x = i % w, y = (i / w) | 0; return x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1; };
  const glass = box(inst.root.querySelector('[data-p26="sky"]')), duckEl = inst.root.querySelector('svg[role="img"]'), duck = duckEl ? box(duckEl) : null;
  return { glass: inBox(glass), duck: duck ? inBox(duck) : null, notGlass: i => !inBox(glass)(i), glassBox: glass, duckBox: duck };
}

/** Positive control for the flash: raw clone is blind to the pulse; baked clone sees it. */
export async function flashPositiveControl(id, W = 640) {
  const { inst, stage } = sceneOf(id), r = stage.getBoundingClientRect(), w = W, h = Math.round(W * r.height / r.width);
  const held = await startHeld(inst.ctl, 'positive-control'); if (held.refused) return { id, refused: held.refused };
  try {
    seek(inst.ctl, 500);
    setPulseTime(held.anims, 0); const raw0 = luminanceFrame((await raster(stage, w, h, false)).data), baked0 = luminanceFrame((await raster(stage, w, h, true)).data);
    setPulseTime(held.anims, L.peakMs); const raw1 = luminanceFrame((await raster(stage, w, h, false)).data), baked1 = luminanceFrame((await raster(stage, w, h, true)).data);
    const raw = frameStats(raw0, raw1), baked = frameStats(baked0, baked1);
    return { id, size: `${w}x${h}`, rawMaxLift: round(raw.maxLift), rawBlind: raw.maxLift === 0 && raw.maxDrop === 0, bakedMaxLift: round(baked.maxLift), bakedMeanLift: round(baked.meanFrame - baked.meanBase), methodSeesPulseWhenBaked: baked.maxLift > .01 && baked.maxLift > raw.maxLift * 5 };
  } finally { held.done(); inst.ctl.stop(); inst.ctl.start(); }
}

/** Full composite measurement of one scene's pulse. Leaves the scene neutral and running. */
export async function flashMeasure(id, { W = null } = {}) {
  const { inst, stage } = sceneOf(id), sr = stage.getBoundingClientRect(), w = W || Math.round(sr.width), h = Math.round(w * sr.height / sr.width);
  const held = await startHeld(inst.ctl, 'measure'); if (held.refused) return { id, refused: held.refused };
  const times = sampleTimes(), rows = [], frames = [], masks = maskFor(inst, stage, w, h);
  let curve = 0;
  try {
    seek(inst.ctl, 500);                                                                 // rain frozen at one time for every frame
    const targets = inst.ctl.flashTargets();
    for (const t of times) {
      setPulseTime(held.anims, t);
      const ow = opacityOf(targets[0]), orr = opacityOf(targets[1]);
      curve = Math.max(curve, Math.abs(ow - L.windowPeak * pulseFactor(t)), Math.abs(orr - L.roomPeak * pulseFactor(t)));
      frames.push(luminanceFrame((await raster(stage, w, h, true)).data)); rows.push({ t: round(t, 2), windowOpacity: round(ow), roomOpacity: round(orr) });
    }
  } finally { held.done(); inst.ctl.stop(); inst.ctl.start(); }
  await sleep(50);
  const neutral = luminanceFrame((await raster(stage, w, h, true)).data), base = frames[0];
  const afterNeutral = frameStats(base, neutral);
  let peakLift = 0, peakLiftAt = 0, peakStep = 0, peakStepAt = 0, glassMeanPeak = 0, duckPeak = 0, outsideGlassPeak = 0;
  frames.forEach((f, i) => {
    const all = frameStats(base, f), g = frameStats(base, f, { mask: masks.glass }), d = masks.duck ? frameStats(base, f, { mask: masks.duck }) : null, o = frameStats(base, f, { mask: masks.notGlass });
    const step = i ? frameStats(frames[i - 1], f) : { maxLift: 0, maxDrop: 0 }, stepMax = Math.max(step.maxLift, step.maxDrop);
    Object.assign(rows[i], { stageMean: round(all.meanFrame), glassMean: round(g.meanFrame), maxLift: round(all.maxLift), pixelsOver010: all.pixelsOverDelta, step: round(stepMax) });
    if (all.maxLift > peakLift) { peakLift = all.maxLift; peakLiftAt = rows[i].t; }
    if (stepMax > peakStep) { peakStep = stepMax; peakStepAt = rows[i].t; }
    glassMeanPeak = Math.max(glassMeanPeak, g.meanFrame - g.meanBase); if (d) duckPeak = Math.max(duckPeak, d.maxLift); outsideGlassPeak = Math.max(outsideGlassPeak, o.maxLift);
  });
  const idx = pred => times.map((t, i) => (pred(t) ? i : -1)).filter(i => i >= 0);
  const grid20 = idx(t => Math.abs(t / STEP_MS - Math.round(t / STEP_MS)) < 1e-6 || t >= L.durationMs - .02);
  const grid60 = idx(t => Math.abs(t / HZ60 - Math.round(t / HZ60)) < 1e-3 || t >= L.durationMs - .02);
  const flashOver = list => { const r = pixelFlashes(list.map(i => frames[i])); return { flashingPixels: r.flashingPixels, maxFlashesPerPixel: r.maxFlashes, shareOfReferenceQuarter: round(r.flashingPixels / REFERENCE_FIELD.quarter, 3) }; };
  const area = w * h;
  return {
    id, viewport: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, rasterSize: `${w}x${h}`, cssPxGrid: true, frames: frames.length,
    animationVsCurveMaxOpacityError: round(curve, 6),
    neutralAfterCancel: { maxLiftVsStart: round(afterNeutral.maxLift), maxDropVsStart: round(afterNeutral.maxDrop) },
    extrema: { peakAtMs: peakLiftAt, peakMaxPixelLift: round(peakLift), peakGlassMeanLift: round(glassMeanPeak), peakDuckRegionMaxLift: masks.duck ? round(duckPeak) : null, peakOutsideGlassMaxLift: round(outsideGlassPeak) },
    transitions: { largestFrameToFrameStep: round(peakStep), at: peakStepAt, sampling: `every ${STEP_MS} ms and 60 Hz grid, merged` },
    flash: {
      definition: 'per pixel: rise swing >= 0.10 then fall swing >= 0.10 of relative luminance, darker end < 0.80 (WCAG 2.2 SC 2.3.1 general flash, simplified)',
      referenceField: `${REFERENCE_FIELD.w}x${REFERENCE_FIELD.h} px = ${REFERENCE_FIELD.px}; quarter = ${REFERENCE_FIELD.quarter}`, stageAreaPx: area, glassBoxPx: Math.round((masks.glassBox.x1 - masks.glassBox.x0) * (masks.glassBox.y1 - masks.glassBox.y0)),
      at20msGrid: flashOver(grid20), at60HzGrid: flashOver(grid60), allSamples: flashOver(times.map((_, i) => i)),
      flashesPerRollingSecondByScheduler: maxInWindow([0, 4000, 8000, 12000], 1000), redFlash: 'not applicable: blue-white overlays only, no saturated red'
    },
    rows
  };
}

/** Aggregate over simultaneous scenes: one request in the same tick on every storm scene on the page, then composite of the whole grid with the accepted pulse held. */
export async function flashAggregate({ W = null } = {}) {
  const m = window.__p26m, storm = [...m.scenes.values()].filter(i => i.weather === 'storm' && i.ctl.state().phase !== 'destroyed');
  const grid = document.querySelector('#grid'), gr = grid.getBoundingClientRect(), w = W || Math.round(gr.width), h = Math.round(w * gr.height / gr.width);
  const restore = m.schedule; m.schedule = () => () => {};
  let results; try { results = storm.map(i => ({ id: i.id, out: i.ctl.requestFlash({ requester: `aggregate:${i.id}` }) })); } catch (e) { m.schedule = restore; throw e; }
  const accepted = results.filter(r => r.out.status === 'accepted'), refused = results.filter(r => r.out.status !== 'accepted');
  const overlays = storm.filter(i => i.root.querySelector('[data-p26-flash]')).length;
  const summary = { stormScenes: storm.length, accepted: accepted.length, refused: refused.map(r => `${r.id}:${r.out.reason}`), scenesWithOverlay: overlays, arbiter: m.arbiter.snapshot().stats };
  if (!accepted.length) { m.schedule = restore; return { ...summary, note: 'nothing accepted (cooldown or blocker); no composite taken' }; }
  const inst = m.scenes.get(accepted[0].id), anims = inst.ctl.flashAnimations(); for (const a of anims) a.pause();
  try {
    for (const s of storm) seek(s.ctl, 500);
    const frames = [], times = [0, 60, L.peakMs, 240, 360, L.durationMs - .01];
    for (const t of times) { setPulseTime(anims, t); frames.push(luminanceFrame((await raster(grid, w, h, true)).data)); }
    const base = frames[0], peak = frames[2], st = frameStats(base, peak), pf = pixelFlashes(frames);
    return { ...summary, viewport: `${innerWidth}x${innerHeight}`, rasterSize: `${w}x${h}`, gridAreaPx: w * h, peakMaxPixelLift: round(st.maxLift), pixelsOver010AtPeak: st.pixelsOverDelta, flashingPixels: pf.flashingPixels, shareOfReferenceQuarter: round(pf.flashingPixels / REFERENCE_FIELD.quarter, 3), sampledAtMs: times.map(t => round(t, 2)), note: 'grid raster covers every scene on the page, which is at least as large as the visible viewport' };
  } finally { m.schedule = restore; for (const s of storm) { s.ctl.stop(); s.ctl.start(); } }
}

export { createLightningEffect };
