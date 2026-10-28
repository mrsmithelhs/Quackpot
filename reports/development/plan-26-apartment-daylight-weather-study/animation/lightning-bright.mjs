// Plan 26 Stage C: the OWNER-DIRECTED bright lightning look (report-only study variant). The root-accepted restrained look stays in lightning.mjs, unchanged.
// Owner direction (2026-10-28, after viewing the restrained pulse and not being able to see it): a bright-white flash that takes over the whole scene,
// then fades quickly from the whole scene, while the window stays light for about half a second longer before it also fades out.
// Everything else is unchanged and shared: host-triggered only, ONE pulse per accepted event, the page arbiter (>= 4000 ms), every blocker, reduced motion
// refusing, cancel-to-neutral, overlays removed at the end. All numbers are design choices for review, NOT safety thresholds and NOT a certification.
// This look is a large-area, high-contrast flash (see lightning-mechanism.md section "Bright look"); it needs its own root review.

export const BRIGHT = Object.freeze({
  name: 'bright',
  weathers: Object.freeze(['storm']),
  durationMs: 800,
  // [time ms, factor 0-1] linear segments. Scene flash: hard rise, quick fade, gone at 300 ms. Window: same rise, still lit at 300 ms, fades out by 800 ms (500 ms longer).
  scene: Object.freeze({ color: '#ffffff', peak: .9, keys: Object.freeze([[0, 0], [40, 1], [300, 0], [800, 0]]) }),
  window: Object.freeze({ color: '#f4f8ff', peak: 1, keys: Object.freeze([[0, 0], [40, 1], [300, .75], [800, 0]]) }),
  watchdogSlackMs: 1500
});

/** Factor of a layer at time t (piecewise linear over its keys; 0 outside the pulse). */
export function layerFactor(keys, tMs) {
  if (!(tMs > keys[0][0]) || tMs >= keys[keys.length - 1][0]) return 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, f0] = keys[i], [t1, f1] = keys[i + 1];
    if (tMs >= t0 && tMs <= t1) return t1 === t0 ? f1 : f0 + (f1 - f0) * (tMs - t0) / (t1 - t0);
  }
  return 0;
}
/** Opacity of a layer at time t. */
export const layerOpacity = (layer, tMs) => layer.peak * layerFactor(layer.keys, tMs);
/** WAAPI keyframes for a layer over the whole pulse duration. */
export const layerKeyframes = (layer, durationMs = BRIGHT.durationMs) => layer.keys.map(([t, f]) => ({ opacity: layer.peak * f, offset: t / durationMs }));
export const pulseTiming = (look = BRIGHT) => ({ duration: look.durationMs, easing: 'linear', fill: 'none', iterations: 1 });

const defaultSchedule = (fn, ms) => { const h = setTimeout(fn, ms); return () => clearTimeout(h); };
const swallow = p => { if (p && typeof p.catch === 'function') p.catch(() => {}); };
const GLASS_CLIP = /^url\(#(.+)\)$/;

/** The injectable controller `flashEffect` for the bright look. `schedule(fn, ms) -> cancel` is only the watchdog (tests pass a fake). */
export function createBrightLightningEffect({ schedule = defaultSchedule, look = BRIGHT } = {}) {
  /** Why a pulse cannot start here, or null. Checked BEFORE the arbiter so a refusal consumes no budget. */
  function canStart({ root, weather } = {}) {
    if (!look.weathers.includes(weather)) return 'not-storm';
    const sky = root && root.querySelector('[data-p26="sky"]'), clip = sky && sky.parentNode, ref = clip && GLASS_CLIP.exec(clip.getAttribute('clip-path') || '');
    if (!ref) return 'no-glass';
    if (!root.querySelector('[data-p26="window-spill"]')) return 'no-room-anchor';
    if (root.querySelector('[data-p26-flash]')) return 'flash-nodes-present';
    return null;
  }

  function start({ root, createSvg } = {}) {
    const sky = root.querySelector('[data-p26="sky"]'), clip = sky.parentNode, spill = root.querySelector('[data-p26="window-spill"]'), clipAttr = clip.getAttribute('clip-path');
    const made = [], anims = [], targets = [];
    let cleaned = false, settled = false, clearWatchdog = null, why = null;
    const cleanup = () => { if (cleaned) return; cleaned = true; if (clearWatchdog) { clearWatchdog(); clearWatchdog = null; } for (const n of made) if (n.parentNode) n.parentNode.removeChild(n); };
    try {
      // Above the rain tint and vignette (so the white is not dimmed by them), below the lamp spill and lamp glow (so the lamp stays warm). Nothing of the duck or lamp is touched.
      const scene = createSvg('rect', { 'data-p26-flash': 'scene-flash', 'data-p26-flash-target': 'scene-flash', x: -6000, y: -6000, width: 14000, height: 14000, fill: look.scene.color, opacity: 0, 'pointer-events': 'none' });
      const group = createSvg('g', { 'data-p26-flash': 'window-clip', 'clip-path': clipAttr });
      const win = createSvg('rect', { 'data-p26-flash-target': 'window-flash', x: sky.getAttribute('x'), y: sky.getAttribute('y'), width: sky.getAttribute('width'), height: sky.getAttribute('height'), fill: look.window.color, opacity: 0, 'pointer-events': 'none' });
      group.appendChild(win);
      const after = spill.nextSibling, parent = spill.parentNode;
      if (after) { parent.insertBefore(scene, after); made.push(scene); parent.insertBefore(group, after); made.push(group); }   // each node is registered the moment it is in the DOM, so a failure between the two inserts still cleans up the first
      else { parent.appendChild(scene); made.push(scene); parent.appendChild(group); made.push(group); }
      for (const [el, layer] of [[scene, look.scene], [win, look.window]]) {
        const a = el.animate(layerKeyframes(layer, look.durationMs), pulseTiming(look)); swallow(a.finished); anims.push(a); targets.push(el);
      }
    } catch (e) { for (const a of anims) { try { a.cancel(); } catch { /* gone */ } } cleanup(); throw e; }

    const cancel = reason => { if (reason && !why) why = reason; settled = true; for (const a of anims) { try { a.cancel(); } catch { /* already gone */ } } cleanup(); };
    try { clearWatchdog = schedule(() => { if (!settled && !cleaned) cancel('watchdog'); }, look.durationMs + look.watchdogSlackMs); }
    catch (e) { cancel(); throw e; }                                   // animations already exist: cancel them and remove every node before the failure propagates, so no pulse runs without a handle
    const finished = Promise.all(anims.map(a => a.finished)).then(() => { settled = true; cleanup(); }, cause => {
      settled = true; cleanup();
      const e = new Error('lightning pulse cancelled'); e.name = 'PulseCancelled'; e.reason = why || 'effect-aborted'; e.cause = cause; throw e;
    });
    return { finished, cancel, animations: anims, targets };
  }

  return { canStart, start };
}
