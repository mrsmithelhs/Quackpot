// Plan 26 Stage C: the lightning pulse effect (report-only study). Host-triggered through controller.requestFlash; see lightning-mechanism.md.
// One pulse per accepted event: linear rise, linear fall, then the overlay nodes are removed. Only `opacity` of two animation-only overlay nodes is
// animated. Nothing here touches the duck, the lamp, the rain layers or the still's own nodes. All numbers are design choices, not safety thresholds.

export const LIGHTNING = Object.freeze({
  weathers: Object.freeze(['storm']),
  durationMs: 600, peakMs: 120,                       // linear rise 0 -> 120 ms, linear fall 120 -> 600 ms
  windowPeak: 0.18, roomPeak: 0.08,                   // peak opacity of the two overlays at f = 1
  windowColor: '#e8f0ff',
  room: Object.freeze({ color: '#cfdcff', stops: Object.freeze([[0, 1], [.55, .55], [1, 0]]) }),
  watchdogSlackMs: 1500                               // a pulse still unsettled this long after its nominal end is cancelled
});

/** Pulse factor f(t) in [0, 1]; the exact curve the keyframes encode. */
export function pulseFactor(tMs, L = LIGHTNING) {
  if (!(tMs > 0) || tMs >= L.durationMs) return 0;
  return tMs <= L.peakMs ? tMs / L.peakMs : (L.durationMs - tMs) / (L.durationMs - L.peakMs);
}
/** WAAPI keyframes for an overlay whose peak opacity is `peak`. */
export const pulseKeyframes = (peak, L = LIGHTNING) => [{ opacity: 0, offset: 0 }, { opacity: peak, offset: L.peakMs / L.durationMs }, { opacity: 0, offset: 1 }];
export const pulseTiming = (L = LIGHTNING) => ({ duration: L.durationMs, easing: 'linear', fill: 'none', iterations: 1 });

const defaultSchedule = (fn, ms) => { const h = setTimeout(fn, ms); return () => clearTimeout(h); };
const swallow = p => { if (p && typeof p.catch === 'function') p.catch(() => {}); };
const GLASS_CLIP = /^url\(#(.+)\)$/;

/** The injectable controller `flashEffect`. `schedule(fn, ms) -> cancel` is only the watchdog (tests pass a fake). */
export function createLightningEffect({ schedule = defaultSchedule, look = LIGHTNING } = {}) {
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
    const sky = root.querySelector('[data-p26="sky"]'), clip = sky.parentNode, spill = root.querySelector('[data-p26="window-spill"]');
    const base = GLASS_CLIP.exec(clip.getAttribute('clip-path'))[1].replace(/-panes$/, ''), gid = `${base}-flash-lift`;
    const made = [];
    let cleaned = false, settled = false, clearWatchdog = null;
    const cleanup = () => { if (cleaned) return; cleaned = true; if (clearWatchdog) { clearWatchdog(); clearWatchdog = null; } for (const n of made) if (n.parentNode) n.parentNode.removeChild(n); };
    const anims = [], targets = [];
    try {
      const win = createSvg('rect', { 'data-p26-flash': 'window-lift', 'data-p26-flash-target': 'window-lift', x: sky.getAttribute('x'), y: sky.getAttribute('y'), width: sky.getAttribute('width'), height: sky.getAttribute('height'), fill: look.windowColor, opacity: 0, 'pointer-events': 'none' });
      clip.appendChild(win); made.push(win);
      const defs = createSvg('defs', { 'data-p26-flash': 'defs' }), grad = createSvg('radialGradient', { id: gid });
      for (const [offset, o] of look.room.stops) grad.appendChild(createSvg('stop', { offset, 'stop-color': look.room.color, 'stop-opacity': o }));
      defs.appendChild(grad);
      const room = createSvg('ellipse', { 'data-p26-flash': 'room-lift', 'data-p26-flash-target': 'room-lift', cx: spill.getAttribute('cx'), cy: spill.getAttribute('cy'), rx: spill.getAttribute('rx'), ry: spill.getAttribute('ry'), fill: `url(#${gid})`, opacity: 0, style: 'mix-blend-mode:screen', 'pointer-events': 'none' });
      const after = spill.nextSibling, parent = spill.parentNode;
      if (after) { parent.insertBefore(defs, after); parent.insertBefore(room, after); } else { parent.appendChild(defs); parent.appendChild(room); }
      made.push(defs, room);
      for (const [el, peak] of [[win, look.windowPeak], [room, look.roomPeak]]) {
        const a = el.animate(pulseKeyframes(peak, look), pulseTiming(look)); swallow(a.finished); anims.push(a); targets.push(el);
      }
    } catch (e) { for (const a of anims) { try { a.cancel(); } catch { /* gone */ } } cleanup(); throw e; }

    let why = null;                                                     // why this pulse was cancelled by the effect itself (e.g. `watchdog`); carried on the rejection so the ticket keeps it
    const cancel = reason => { if (reason && !why) why = reason; settled = true; for (const a of anims) { try { a.cancel(); } catch { /* already gone */ } } cleanup(); };
    clearWatchdog = schedule(() => { if (!settled && !cleaned) cancel('watchdog'); }, look.durationMs + look.watchdogSlackMs);
    const finished = Promise.all(anims.map(a => a.finished)).then(() => { settled = true; cleanup(); }, cause => {
      settled = true; cleanup();
      const e = new Error('lightning pulse cancelled'); e.name = 'PulseCancelled'; e.reason = why || 'effect-aborted'; e.cause = cause; throw e;
    });
    return { finished, cancel, animations: anims, targets };
  }

  return { canStart, start };
}
