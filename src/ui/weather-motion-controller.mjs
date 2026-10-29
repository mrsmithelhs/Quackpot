// Plan 34 unmounted extraction: host-side weather motion controller (Web Animations API on a weather-layer SVG).
// No controller = the approved still. Nothing here touches the duck, its ancestors, or the lamp layers; no module-level state.
import { rainMotionSpec, keyframesFor, dropKeyframes } from './weather-rain-spec.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';
export const WEATHER_MOTION_VERSION = 1;
export const PAUSE_BLOCKERS = ['user-pause', 'hidden', 'offscreen', 'inactive'];
export const STILL_BLOCKERS = ['user-stop', 'motion-disabled', 'reduced', 'reduced-unknown', 'motion-unavailable'];
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/** Default environment from the root's own document/window. Tests pass fakes. */
export function browserEnv(root) {
  const doc = root.ownerDocument, win = doc.defaultView;
  return {
    document: doc,
    matchMedia: win && win.matchMedia ? q => win.matchMedia(q) : null,
    IntersectionObserver: win && win.IntersectionObserver ? win.IntersectionObserver : null,
    createSvg: (tag, attrs = {}) => { const e = doc.createElementNS(SVG_NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); return e; }
  };
}

const swallow = p => { if (p && typeof p.catch === 'function') p.catch(() => {}); };

export function createWeatherMotionController(root, options = {}) {
  const { weather, arbiter = null, reducedMotion = 'auto', flashEffect = null, flashEnabled = false, motionEnabled = true } = options;
  if (reducedMotion !== 'auto' && reducedMotion !== 'reduce') throw new RangeError("weather motion: reducedMotion must be 'auto' or 'reduce'");
  const spec = rainMotionSpec(weather);            // throws on an unknown weather; null for overcast
  const env = options.env || browserEnv(root);
  const doc = env.document;

  let streaksEl = null, dropletsEl = null;
  const skyNodes = root.querySelectorAll('[data-weather="sky"]');
  const skyEl = skyNodes.length === 1 ? skyNodes[0] : null;
  const clipPath = skyEl?.parentNode?.getAttribute?.('clip-path') || '';
  const validGlass = !!(skyEl && /^url\(#[^)]+\)$/.test(clipPath));
  if (spec) {
    streaksEl = root.querySelector('[data-weather="rain-streaks"]'); dropletsEl = root.querySelector('[data-weather="droplets"]');
    if (!streaksEl || !dropletsEl) throw new TypeError(`weather motion: root has no rain layers for '${weather}' (weather must match the rendered scene)`);
  }

  const blockers = new Set(), subscribers = new Set();
  let destroyed = false, built = null, flash = null, error = null, flashOn = !!flashEnabled, osReduced = false, visibilityPending = false, io = null, mql = null, mqlHandler = null, visHandler = null;

  // ---- build / restore ------------------------------------------------------------------------------------------------------------
  function buildMotion() {
    const created = { container: null, hidden: [], anims: [], playing: true, targets: [] };
    try {
      for (const role of spec.hide) {
        const el = role === 'rain-streaks' ? streaksEl : dropletsEl;
        created.hidden.push({ el, prev: el.getAttribute('display') });
        el.setAttribute('display', 'none');
      }
      const container = env.createSvg('g', { 'data-weather-motion': 'rain' });
      const animated = [];                                  // [target element, keyframes, options]
      for (const layer of spec.layers) {
        if (layer.type === 'streaks') {
          const holder = env.createSvg('g', { 'data-weather-motion': layer.name }), target = env.createSvg('g', { 'data-weather-motion-target': layer.name });
          for (const k of layer.copies) target.appendChild(env.createSvg('path', { d: layer.d, transform: `translate(${k * layer.vector.dx} ${k * layer.vector.dy})`, ...layer.style }));
          holder.appendChild(target); container.appendChild(holder);
          const kf = keyframesFor(layer); animated.push([target, kf.keyframes, kf.options]);
        } else {
          const holder = env.createSvg('g', { 'data-weather-motion': layer.name });
          for (const d of layer.drops) {
            const target = env.createSvg('g', { 'data-weather-motion-target': 'drop' });
            target.appendChild(env.createSvg('ellipse', { cx: d.cx, cy: d.cy, rx: d.rx, ry: d.ry, fill: '#dfeaf7', 'fill-opacity': .34, stroke: '#ffffff', 'stroke-opacity': .55, 'stroke-width': .8 }));
            target.appendChild(env.createSvg('circle', { cx: r2(d.cx - d.rx * .3), cy: r2(d.cy - d.ry * .35), r: r2(d.rx * .28), fill: '#fff', opacity: .8 }));
            holder.appendChild(target);
            const kf = dropKeyframes(d); animated.push([target, kf.keyframes, kf.options]);
          }
          container.appendChild(holder);
        }
      }
      const parent = dropletsEl.parentNode, next = dropletsEl.nextSibling;
      if (next) parent.insertBefore(container, next); else parent.appendChild(container);
      created.container = container;
      for (const [target, kf, opt] of animated) {
        const anim = target.animate(kf, opt);
        swallow(anim.finished);                             // cancel() rejects `finished` with AbortError; that is expected
        created.anims.push(anim); created.targets.push(target);
      }
      built = created;
      error = null;
    } catch (e) {                                           // e.g. no WAAPI: roll back to the approved still and stay there
      rollback(created);
      built = null; error = String(e && e.message || e);
    }
  }
  function rollback(b) {
    for (const a of b.anims) { try { a.cancel(); } catch { /* already gone */ } }
    if (b.container && b.container.parentNode) b.container.parentNode.removeChild(b.container);
    for (const { el, prev } of b.hidden) { if (prev === null) el.removeAttribute('display'); else el.setAttribute('display', prev); }
  }
  function teardownMotion() { if (built) { rollback(built); built = null; } }

  // ---- reconcile: one row of the lifecycle table ----------------------------------------------------------------------------------
  const anyOf = list => list.some(b => blockers.has(b));
  function reconcile() {
    if (destroyed) return;
    if (flash && blockers.size) cancelFlash(`blocked:${[...blockers].sort().join(',')}`);
    if (spec) {
      const still = anyOf(STILL_BLOCKERS), paused = anyOf(PAUSE_BLOCKERS);
      if (still) teardownMotion();
      else if (!built) { if (!paused && !error) buildMotion(); }
      if (built) {
        if (paused && built.playing) { built.anims.forEach(a => a.pause()); built.playing = false; }
        else if (!paused && !built.playing) { built.anims.forEach(a => a.play()); built.playing = true; }
      }
    }
    for (const fn of [...subscribers]) fn(state());
  }
  const set = (name, on) => { if (destroyed) return; const had = blockers.has(name); if (on === had) return; if (on) blockers.add(name); else blockers.delete(name); reconcile(); };

  // ---- flash (logic only; the visual is a later gate) ---------------------------------------------------------------------------
  function cancelFlash(reason) {
    const f = flash; if (!f) return;
    flash = null;
    try { f.handle.cancel(); } catch { /* effect already gone */ }
    f.ticket.cancel(reason);
  }
  function requestFlash({ requester = null } = {}) {
    const refuse = reason => ({ status: 'refused', reason });
    if (destroyed) return refuse('destroyed');
    if (!flashOn) return refuse('flash-off');
    if (blockers.has('reduced') || blockers.has('reduced-unknown')) return refuse('reduced-motion');
    if (blockers.has('user-stop')) return refuse('stopped');
    if (blockers.size) return refuse(`blocked:${[...blockers].sort().join(',')}`);
    if (spec && !built) return refuse('motion-unavailable');          // e.g. animate() failed: the still stays, and so does the refusal
    if (!flashEffect) return refuse('flash-visual-not-built');
    if (!arbiter) return refuse('no-arbiter');
    const ctx = { root, weather, createSvg: env.createSvg };
    const unavailable = !flash && flashEffect.canStart ? flashEffect.canStart(ctx) : null;   // the effect's own preconditions, before any budget is touched (own pulse still running: the arbiter says 'active')
    if (unavailable) return refuse(unavailable);
    const ticket = arbiter.request({ requester });
    if (ticket.status === 'refused') return ticket;
    let handle;
    try { handle = flashEffect.start(ctx); } catch { ticket.cancel('effect-start-failed'); return ticket; }   // the budget WAS spent: return the accepted ticket, already settled `cancelled`; never a budget-free refusal and never a visual claim
    const mine = { ticket, handle };
    flash = mine;
    Promise.resolve(handle.finished).then(
      () => { if (flash === mine) { flash = null; ticket.finish(); for (const fn of [...subscribers]) fn(state()); } },
      err => { if (flash === mine) { flash = null; ticket.cancel((err && err.reason) || 'effect-aborted'); for (const fn of [...subscribers]) fn(state()); } }   // an effect may say why (e.g. `watchdog`)
    );
    for (const fn of [...subscribers]) fn(state());
    return ticket;
  }

  // ---- environment listeners ------------------------------------------------------------------------------------------------------
  if (reducedMotion === 'reduce') blockers.add('reduced');
  if (env.matchMedia) {
    try {
      mql = env.matchMedia(REDUCED_QUERY);
      const hasChangeListener = !!(mql && (typeof mql.addEventListener === 'function' || typeof mql.addListener === 'function'));
      if (mql && typeof mql.matches === 'boolean' && hasChangeListener) {
        osReduced = mql.matches;
        mqlHandler = ev => {
          if (!ev || typeof ev.matches !== 'boolean') { set('reduced-unknown', true); return; }
          osReduced = ev.matches;
          const wasUnknown = blockers.has('reduced-unknown'), wasReduced = blockers.has('reduced');
          blockers.delete('reduced-unknown');
          if (osReduced || reducedMotion === 'reduce') blockers.add('reduced'); else blockers.delete('reduced');
          if (wasUnknown !== blockers.has('reduced-unknown') || wasReduced !== blockers.has('reduced')) reconcile();
        };
        if (mql.addEventListener) mql.addEventListener('change', mqlHandler); else if (mql.addListener) mql.addListener(mqlHandler);
        if (osReduced) blockers.add('reduced');
      } else mql = null;
    } catch { mql = null; }
  }
  if (doc) {
    if (doc.visibilityState === 'hidden') blockers.add('hidden');
    visHandler = () => set('hidden', doc.visibilityState === 'hidden');
    doc.addEventListener('visibilitychange', visHandler);
  }
  if (env.IntersectionObserver) {
    // Visibility is unknown until the observer's first (asynchronous) callback, so start blocked: a window that is cropped out or off screen must never get a frame of rain or accept a flash in the meantime.
    // The glass stays blocked until its own first asynchronous visibility callback.
    visibilityPending = true; blockers.add('offscreen');
    try { if (!validGlass) throw new Error('weather motion: one clipped sky role is required for visibility'); io = new env.IntersectionObserver(entries => {
      const last = entries[entries.length - 1]; if (destroyed || !last) return;
      const first = visibilityPending, was = blockers.has('offscreen'); visibilityPending = false;
      set('offscreen', !last.isIntersecting);
      if (first && was === blockers.has('offscreen')) for (const fn of [...subscribers]) fn(state());   // pending cleared with no blocker change: still tell listeners
    });
    // The rain only lives in the glass, so the glass is what must be on screen: in a framing that crops the window out the scene box can be visible while no rain is.
    io.observe(skyEl);
    } catch { if (io) io.disconnect(); io = null; visibilityPending = true; blockers.add('offscreen'); }
  } else { visibilityPending = true; blockers.add('offscreen'); }
  if (!validGlass) blockers.add('motion-unavailable');
  if (!env.matchMedia || !mql || !doc) blockers.add('reduced-unknown');
  if (motionEnabled === false) blockers.add('motion-disabled');
  if (options.startPaused) blockers.add('user-pause');
  if (options.startStopped) blockers.add('user-stop');
  if (options.active === false) blockers.add('inactive');
  reconcile();

  // ---- public ---------------------------------------------------------------------------------------------------------------------
  function state() {
    const phase = destroyed ? 'destroyed' : built ? (built.playing ? 'running' : 'paused') : 'still';
    return { weather, phase, blockers: [...blockers].sort(), motion: !!spec, animations: built ? built.anims.length : 0, flashActive: !!flash, visibilityPending, error };
  }
  function destroy() {
    if (destroyed) return;
    cancelFlash('destroyed');
    teardownMotion();
    destroyed = true;
    if (visHandler) doc.removeEventListener('visibilitychange', visHandler);
    if (mql && mqlHandler) { if (mql.removeEventListener) mql.removeEventListener('change', mqlHandler); else if (mql.removeListener) mql.removeListener(mqlHandler); }
    if (io) io.disconnect();
    visHandler = mqlHandler = io = mql = null;
    blockers.clear();
    const last = state();
    for (const fn of [...subscribers]) fn(last);
    subscribers.clear();
  }

  return {
    state, destroy, requestFlash,
    pause: () => set('user-pause', true), resume: () => set('user-pause', false),
    setMotionEnabled: on => set('motion-disabled', !on),
    setFlashEnabled: on => { const enabled = !!on; if (flashOn === enabled || destroyed) return; flashOn = enabled; if (!enabled) cancelFlash('flash-off'); for (const fn of [...subscribers]) fn(state()); },
    stop: () => set('user-stop', true), start: () => set('user-stop', false),
    setActive: on => set('inactive', !on),
    subscribe: fn => { if (destroyed) return () => {}; subscribers.add(fn); return () => subscribers.delete(fn); },
    targets: () => (built ? [...built.targets] : []),
    flashAnimations: () => (flash && flash.handle.animations ? [...flash.handle.animations] : []),
    flashTargets: () => (flash && flash.handle.targets ? [...flash.handle.targets] : [])
  };
}
const r2 = n => Math.round(n * 100) / 100;
