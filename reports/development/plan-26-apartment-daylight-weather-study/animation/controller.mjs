// Plan 26 Stage A/B: host-side weather motion controller (Web Animations API on an inline study SVG). See interface.md for the contract.
// No controller = the approved still. Nothing here touches the duck, its ancestors, or the lamp layers; no module-level state.
import { rainMotionSpec, keyframesFor, dropKeyframes } from './rain-motion.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';
export const PAUSE_BLOCKERS = ['user-pause', 'hidden', 'offscreen', 'inactive'];
export const STILL_BLOCKERS = ['user-stop', 'reduced'];
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

export function createWeatherMotion(root, options = {}) {
  const { weather, arbiter = null, reducedMotion = 'auto', flashEffect = null } = options;
  if (reducedMotion !== 'auto' && reducedMotion !== 'reduce') throw new RangeError("weather motion: reducedMotion must be 'auto' or 'reduce'");
  const spec = rainMotionSpec(weather);            // throws on an unknown weather; null for overcast
  const env = options.env || browserEnv(root);
  const doc = env.document;

  let streaksEl = null, dropletsEl = null;
  if (spec) {
    streaksEl = root.querySelector('[data-p26="rain-streaks"]'); dropletsEl = root.querySelector('[data-p26="droplets"]');
    if (!streaksEl || !dropletsEl) throw new TypeError(`weather motion: root has no rain layers for '${weather}' (weather must match the rendered scene)`);
  }

  const blockers = new Set(), subscribers = new Set();
  let destroyed = false, built = null, flash = null, error = null, osReduced = false, visibilityPending = false, io = null, mql = null, mqlHandler = null, visHandler = null;

  // ---- build / restore ------------------------------------------------------------------------------------------------------------
  function buildMotion() {
    const created = { container: null, hidden: [], anims: [], playing: true, targets: [] };
    try {
      for (const role of spec.hide) {
        const el = role === 'rain-streaks' ? streaksEl : dropletsEl;
        created.hidden.push({ el, prev: el.getAttribute('display') });
        el.setAttribute('display', 'none');
      }
      const container = env.createSvg('g', { 'data-p26-motion': 'rain' });
      const animated = [];                                  // [target element, keyframes, options]
      for (const layer of spec.layers) {
        if (layer.type === 'streaks') {
          const holder = env.createSvg('g', { 'data-p26-motion': layer.name }), target = env.createSvg('g', { 'data-p26-motion-target': layer.name });
          for (const k of layer.copies) target.appendChild(env.createSvg('path', { d: layer.d, transform: `translate(${k * layer.vector.dx} ${k * layer.vector.dy})`, ...layer.style }));
          holder.appendChild(target); container.appendChild(holder);
          const kf = keyframesFor(layer); animated.push([target, kf.keyframes, kf.options]);
        } else {
          const holder = env.createSvg('g', { 'data-p26-motion': layer.name });
          for (const d of layer.drops) {
            const target = env.createSvg('g', { 'data-p26-motion-target': 'drop' });
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
    if (blockers.has('reduced')) return refuse('reduced-motion');
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
    try { handle = flashEffect.start(ctx); } catch { ticket.cancel('effect-start-failed'); return refuse('effect-start-failed'); }
    const mine = { ticket, handle };
    flash = mine;
    Promise.resolve(handle.finished).then(
      () => { if (flash === mine) { flash = null; ticket.finish(); for (const fn of [...subscribers]) fn(state()); } },
      () => { if (flash === mine) { flash = null; ticket.cancel('effect-aborted'); for (const fn of [...subscribers]) fn(state()); } }
    );
    for (const fn of [...subscribers]) fn(state());
    return ticket;
  }

  // ---- environment listeners ------------------------------------------------------------------------------------------------------
  const syncReduced = () => set('reduced', osReduced || reducedMotion === 'reduce');
  if (reducedMotion === 'reduce') blockers.add('reduced');
  if (env.matchMedia) {
    mql = env.matchMedia(REDUCED_QUERY);
    if (mql) {
      osReduced = !!mql.matches;
      mqlHandler = ev => { osReduced = !!ev.matches; syncReduced(); };
      if (mql.addEventListener) mql.addEventListener('change', mqlHandler); else if (mql.addListener) mql.addListener(mqlHandler);
      if (osReduced) blockers.add('reduced');
    }
  }
  if (doc) {
    if (doc.visibilityState === 'hidden') blockers.add('hidden');
    visHandler = () => set('hidden', doc.visibilityState === 'hidden');
    doc.addEventListener('visibilitychange', visHandler);
  }
  if (env.IntersectionObserver) {
    // Visibility is unknown until the observer's first (asynchronous) callback, so start blocked: a window that is cropped out or off screen must never get a frame of rain or accept a flash in the meantime.
    // Without an observer there is nothing to wait for and the scene counts as visible (the documented fallback).
    visibilityPending = true; blockers.add('offscreen');
    io = new env.IntersectionObserver(entries => {
      const last = entries[entries.length - 1]; if (destroyed || !last) return;
      const first = visibilityPending, was = blockers.has('offscreen'); visibilityPending = false;
      set('offscreen', !last.isIntersecting);
      if (first && was === blockers.has('offscreen')) for (const fn of [...subscribers]) fn(state());   // pending cleared with no blocker change: still tell listeners
    });
    // The rain only lives in the glass, so the glass is what must be on screen: in a framing that crops the window out the scene box can be visible while no rain is.
    io.observe(root.querySelector('[data-p26="sky"]') || root);
  }
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
    stop: () => set('user-stop', true), start: () => set('user-stop', false),
    setActive: on => set('inactive', !on),
    subscribe: fn => { if (destroyed) return () => {}; subscribers.add(fn); return () => subscribers.delete(fn); },
    targets: () => (built ? [...built.targets] : []),
    flashAnimations: () => (flash && flash.handle.animations ? [...flash.handle.animations] : []),
    flashTargets: () => (flash && flash.handle.targets ? [...flash.handle.targets] : [])
  };
}
const r2 = n => Math.round(n * 100) / 100;
