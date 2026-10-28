// Plan 26 review tool (NOT runtime): in-page measurement helpers for animation/gallery.html, reached as window.__p26m.harness.
//
// Raster method: the stage is serialised into an SVG <foreignObject>, loaded as an image and drawn to a canvas (same as tools/browser-measure.js).
// A serialised clone does NOT carry Web Animations state (an animation is not an attribute), so a raw clone shows every animated element at
// its un-animated position. `bakedClone()` therefore writes each animated element's computed transform/opacity into the clone's style.
// positiveControl() proves the difference on this very browser: raw clones at two times are identical (method blind), baked clones differ.
// Nothing here judges the art; diagnostic numbers only.
const BAKE = '[data-p26-motion-target],[data-p26-flash-target]';          // animated overlay nodes whose computed state is baked into a raster clone
const ser = new XMLSerializer(), sleep = ms => new Promise(r => setTimeout(r, ms));
const css = () => [...document.querySelectorAll('head style')].map(s => s.textContent).join('\n');

/** Seek every animation of a scene to a time (ms). Test tool: it bypasses the controller's own play/pause bookkeeping, so destroy or rebuild the scene afterwards. */
export function seek(ctl, ms, only) {
  for (const el of ctl.targets()) {
    if (only && el.getAttribute('data-p26-motion-target') !== only) continue;
    for (const a of el.getAnimations()) { a.pause(); a.currentTime = ms; }
  }
}
export function seekEach(ctl, fn) {                          // fn(name, animation) -> ms
  for (const el of ctl.targets()) for (const a of el.getAnimations()) { a.pause(); a.currentTime = fn(el.getAttribute('data-p26-motion-target'), a); }
}

/** Clone of the stage with computed animated state written into the clone, so a serialised raster can see it. */
function stageClone(stage, bake) {
  const clone = stage.cloneNode(true);
  if (bake) {
    const a = [...stage.querySelectorAll(BAKE)], b = [...clone.querySelectorAll(BAKE)];
    a.forEach((el, i) => { const cs = getComputedStyle(el); b[i].style.transform = cs.transform === 'none' ? '' : cs.transform; b[i].style.opacity = cs.opacity; });
  }
  return clone;
}
export async function raster(stage, W, H, bake) {
  const clone = stageClone(stage, bake); clone.style.width = `${W}px`; clone.style.height = `${H}px`; clone.style.aspectRatio = 'auto';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;height:${H}px;background:#fff"><style>${css()}</style>${ser.serializeToString(clone)}</div></foreignObject></svg>`;
  const img = new Image(); await new Promise((ok, bad) => { img.onload = ok; img.onerror = () => bad(new Error('raster failed')); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H);
}
export const stageSize = (stage, W) => { const r = stage.getBoundingClientRect(); return [W, Math.round(W * r.height / r.width)]; };
/** Mean absolute channel difference (0-255), share of pixels differing by > 24, and the same restricted by an optional pixel mask(x, y). */
function diff(a, b, mask) {
  let sum = 0, n = 0, c24 = 0; const W = a.width, d1 = a.data, d2 = b.data;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < W; x++) {
    if (mask && !mask(x, y)) continue; const i = (y * W + x) * 4;
    const m = Math.max(Math.abs(d1[i] - d2[i]), Math.abs(d1[i + 1] - d2[i + 1]), Math.abs(d1[i + 2] - d2[i + 2])); sum += m; n++; if (m > 24) c24++;
  }
  return { mean: +(sum / Math.max(1, n)).toFixed(3), over24: +(c24 / Math.max(1, n) * 100).toFixed(3), pixels: n };
}
export const sceneOf = id => { const inst = window.__p26m.scenes.get(id); if (!inst) throw new Error(`no scene ${id}`); return { inst, stage: inst.root.closest('.stage') }; };

/** Positive control: raw vs baked raster at two animation times. Method is only trustworthy if raw is identical and baked differs. */
export async function positiveControl(id, W = 640) {
  const { inst, stage } = sceneOf(id), [w, h] = stageSize(stage, W);
  seek(inst.ctl, 0); const raw0 = await raster(stage, w, h, false), baked0 = await raster(stage, w, h, true);
  seek(inst.ctl, 700); const raw1 = await raster(stage, w, h, false), baked1 = await raster(stage, w, h, true);
  const raw = diff(raw0, raw1), baked = diff(baked0, baked1);
  return { id, size: `${w}x${h}`, rawDiff: raw, bakedDiff: baked, methodSeesMotionWhenBaked: baked.mean > 0 && baked.mean > raw.mean * 5, rawIsBlind: raw.mean === 0 };
}

/** Loop seam per streak layer: diff across the wrap (D-dt -> D) against a mid-loop diff of the same step. A broken seam would make the first far larger. */
export async function seamCheck(id, dtMs = 40, W = 640) {
  const { inst, stage } = sceneOf(id), [w, h] = stageSize(stage, W), out = {};
  for (const layer of ['rain-far', 'rain-near']) {
    const target = inst.ctl.targets().find(t => t.getAttribute('data-p26-motion-target') === layer); if (!target) continue;
    const D = target.getAnimations()[0].effect.getComputedTiming().duration;
    const frame = async tl => { seekEach(inst.ctl, (name, a) => (name === layer ? tl : 1234)); return raster(stage, w, h, true); };
    const wrapA = await frame(D - dtMs), wrapB = await frame(D), midA = await frame(D * .4), midB = await frame(D * .4 + dtMs);
    const seam = diff(wrapA, wrapB), mid = diff(midA, midB);
    out[layer] = { durationMs: Math.round(D), stepMs: dtMs, across: seam, midLoop: mid, ratio: +(seam.mean / Math.max(.001, mid.mean)).toFixed(2) };
  }
  return { id, size: `${w}x${h}`, layers: out };
}

/** Clip check: with motion frozen at t, pixels more than `margin` px outside the glass (sky rect box) must equal the still. */
export async function clipCheck(id, atMs = 900, margin = 8, W = 640) {
  const { inst, stage } = sceneOf(id), [w, h] = stageSize(stage, W), sr = stage.getBoundingClientRect();
  const skyBox = inst.root.querySelector('[data-p26="sky"]').getBoundingClientRect(), k = w / sr.width;
  const box = { x0: (skyBox.left - sr.left) * k - margin, y0: (skyBox.top - sr.top) * k - margin, x1: (skyBox.right - sr.left) * k + margin, y1: (skyBox.bottom - sr.top) * k + margin };
  const outside = (x, y) => x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1;
  seek(inst.ctl, atMs); const moving = await raster(stage, w, h, true);
  const still = await rasterStill(inst, stage, w, h);
  return { id, size: `${w}x${h}`, glassBoxPx: Object.fromEntries(Object.entries(box).map(([a, b]) => [a, Math.round(b)])), outsideGlass: diff(moving, still, outside), insideGlass: diff(moving, still, (x, y) => !outside(x, y)) };
}

/** The approved still rendered fresh (static markup, no controller) into a detached stage clone with the same CSS. */
async function rasterStill(inst, stage, w, h) {
  const clone = stage.cloneNode(true), layer = clone.querySelector('.layer'); layer.innerHTML = inst.stillHTML;
  const holder = document.createElement('div'); holder.style.cssText = 'position:absolute;left:-99999px;top:0;width:' + stage.getBoundingClientRect().width + 'px'; holder.appendChild(clone); document.body.appendChild(holder);
  try { return await raster(clone, w, h, false); } finally { holder.remove(); }
}

/** After stop/reduced/destroy the DOM serialisation equals the recorded still, and the composited raster equals a fresh still. Leaves the scene in the state you set. */
export async function restoreCheck(id, W = 640) {
  const { inst, stage } = sceneOf(id), [w, h] = stageSize(stage, W), domEqual = inst.root.outerHTML === inst.stillHTML;
  const pixels = diff(await raster(stage, w, h, false), await rasterStill(inst, stage, w, h));
  return { id, phase: inst.ctl.state().phase, blockers: inst.ctl.state().blockers, domEqualsRecordedStill: domEqual, pixelDiffVsFreshStill: pixels, liveAnimations: inst.ctl.targets().reduce((n, t) => n + t.getAnimations().length, 0) };
}

/** WAAPI really moves the layers: sample computed transforms of every animated target at two seek times. */
export function layerMotion(id) {
  const { inst } = sceneOf(id), read = () => inst.ctl.targets().map(t => ({ name: t.getAttribute('data-p26-motion-target'), transform: getComputedStyle(t).transform, opacity: getComputedStyle(t).opacity }));
  seek(inst.ctl, 0); const a = read(); seek(inst.ctl, 500); const b = read();
  const moved = a.map((x, i) => x.transform !== b[i].transform || x.opacity !== b[i].opacity);
  return { id, targets: a.length, movedBetween0and500ms: moved.filter(Boolean).length, byLayer: ['rain-far', 'rain-near', 'drop'].map(n => ({ layer: n, count: a.filter(x => x.name === n).length, moved: a.filter((x, i) => x.name === n && moved[i]).length })), sampleBefore: a.slice(0, 2), sampleAfter: b.slice(0, 2) };
}

/** Real-time state (no seeking): are the scene's animations actually progressing / paused? */
export async function liveProgress(id, waitMs = 400) {
  const { inst } = sceneOf(id), targets = inst.ctl.targets(), t = () => targets.map(el => el.getAnimations().map(a => a.currentTime));
  const a = t(); await sleep(waitMs); const b = t();
  return { id, phase: inst.ctl.state().phase, animations: targets.length, progressed: a.filter((x, i) => x[0] !== b[i][0]).length, playStates: [...new Set(targets.flatMap(el => el.getAnimations().map(x => x.playState)))] };
}

/** Frame cadence over a window with context. rAF intervals are cadence only, not compositor or paint cost; compare against a still baseline and several scenes. */
export async function cadence(label, ms = 3000) {
  const frames = [], longTasks = []; let po = null;
  try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) longTasks.push(Math.round(e.duration)); }); po.observe({ entryTypes: ['longtask'] }); } catch { po = null; }
  const start = performance.now(); let last = null, stop = false, raf = null;
  await new Promise(done => { const step = ts => { if (last !== null) frames.push(ts - last); last = ts; if (ts - start < ms && !stop) raf = requestAnimationFrame(step); else done(); }; raf = requestAnimationFrame(step); setTimeout(() => { stop = true; done(); }, ms + 1500); });
  cancelAnimationFrame(raf); if (po) po.disconnect();
  const s = [...frames].sort((a, b) => a - b), q = p => s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2) : null, med = q(.5);
  const scenes = [...window.__p26m.scenes.values()].map(i => i.ctl.state());
  return {
    label, durationMs: ms, frames: frames.length, medianMs: med, p95Ms: q(.95), maxMs: s.length ? +s.at(-1).toFixed(2) : null,
    over25ms: frames.filter(f => f > 25).length, over50ms: frames.filter(f => f > 50).length, longTasksSupported: !!po, longTasks,
    context: { visibility: document.visibilityState, hasFocus: document.hasFocus(), viewport: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, ua: navigator.userAgent, scenes: scenes.length, running: scenes.filter(x => x.phase === 'running').length, paused: scenes.filter(x => x.phase === 'paused').length, still: scenes.filter(x => x.phase === 'still').length, animations: scenes.reduce((n, x) => n + x.animations, 0), framing: window.__p26m.state.framing, stage: window.__p26m.state.stage }
  };
}

export { sleep };
