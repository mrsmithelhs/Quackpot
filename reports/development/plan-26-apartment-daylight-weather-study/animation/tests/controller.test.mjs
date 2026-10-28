import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherMotion, PAUSE_BLOCKERS } from '../controller.mjs';
import { createFlashArbiter } from '../arbiter.mjs';
import { makeWorld } from './fake-dom.mjs';
import { rainMotionSpec } from '../rain-motion.mjs';

// Controllers wait for the observer's first callback before animating; most tests start from a known-visible scene, so they deliver that observation explicitly.
const create = (w, root, o = {}) => { const n = w.observers.length, m = createWeatherMotion(root, { env: w.env(), ...o }); if (w.observers.length > n) w.observers[n].fire(true); return m; };
const permutations = a => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])));
const subsets = a => a.reduce((acc, x) => acc.concat(acc.map(s => [...s, x])), [[]]).filter(s => s.length);
const mount = (w = makeWorld(), opts = {}) => { const root = w.makeRoot(), m = create(w, root, { weather: 'storm', ...opts }); return { w, root, m }; };
const clock = () => { let t = 5000; return { now: () => t, add: v => { t += v; } }; };
const fakeEffect = () => { const e = { started: 0, cancelled: 0, start() { e.started++; let res, rej; const finished = new Promise((a, b) => { res = a; rej = b; }); e.finish = res; e.reject = rej; return { finished, cancel: () => { e.cancelled++; } }; } }; return e; };
const flush = () => new Promise(r => setImmediate(r));

test('unblocked: builds animation-only layers after the original droplets, hides originals, animates the expected targets', () => {
  const { w, root, m } = mount();
  const spec = rainMotionSpec('storm'), clip = root.querySelector('[data-p26="rain-streaks"]').parentNode;
  assert.equal(m.state().phase, 'running');
  assert.equal(m.state().animations, 2 + spec.layers[2].drops.length);
  assert.equal(w.live().length, m.state().animations);
  assert.equal(root.querySelector('[data-p26="rain-streaks"]').getAttribute('display'), 'none');
  assert.equal(root.querySelector('[data-p26="droplets"]').getAttribute('display'), 'none');
  const container = root.querySelector('[data-p26-motion="rain"]');
  assert.equal(container.parentNode, clip, 'inside the pane-clipped group');
  assert.equal(container.parentNode.childNodes.indexOf(container), container.parentNode.childNodes.indexOf(root.querySelector('[data-p26="droplets"]')) + 1);
  for (const n of ['rain-far', 'rain-near']) assert.equal(root.querySelector(`[data-p26-motion-target="${n}"]`).childNodes.length, 3, 'three tile copies');
  for (const a of w.animations) for (const kf of a.keyframes) assert.deepEqual(Object.keys(kf).filter(k => !['transform', 'opacity', 'offset'].includes(k)), []);
});

test('stop / reduced / destroy restore the exact original composition (final DOM serialisation)', () => {
  for (const how of ['stop', 'reduced', 'destroy']) {
    const w = makeWorld(), root = w.makeRoot(), before = root.serialize();
    const m = create(w, root, { weather: 'storm'  });
    assert.notEqual(root.serialize(), before, 'motion changes the DOM while active');
    if (how === 'stop') m.stop(); else if (how === 'reduced') w.media.set(true); else m.destroy();
    assert.equal(root.serialize(), before, how);
    assert.equal(w.live().length, 0, `${how}: no live animation`);
  }
});

test('a pre-existing display attribute on an original layer is restored, not dropped', () => {
  const w = makeWorld(), root = w.makeRoot(); root.querySelector('[data-p26="droplets"]').setAttribute('display', 'inline');
  const before = root.serialize(), m = create(w, root, { weather: 'rain'  });
  m.destroy(); assert.equal(root.serialize(), before);
});

test('pause-class blockers are independent: every subset and clearing order resumes only when all are cleared', () => {
  const apply = { 'user-pause': (m, on) => (on ? m.pause() : m.resume()), hidden: (m, on, w) => w.doc.set(on ? 'hidden' : 'visible'), offscreen: (m, on, w) => w.observers.at(-1).fire(!on), inactive: (m, on) => m.setActive(!on) };
  let cases = 0;
  for (const set of subsets(PAUSE_BLOCKERS)) for (const order of permutations(set)) {
    const { w, m } = mount();
    set.forEach(b => apply[b](m, true, w));
    assert.equal(m.state().phase, 'paused'); assert.deepEqual(m.state().blockers, [...set].sort());
    order.forEach((b, i) => {
      apply[b](m, false, w);
      assert.equal(m.state().phase, i < order.length - 1 ? 'paused' : 'running', `${set} cleared in ${order}, step ${i}`);
      assert.equal(w.live().filter(a => a.playState === 'running').length > 0, i === order.length - 1);
    });
    m.destroy(); cases++;
  }
  assert.equal(cases, 64, 'sum over subsets of k! for 4 blockers');
});

test('still-class blockers dominate: reduced and stop clear independently, rebuild only when the whole set is empty', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = create(w, root, { weather: 'storm'  });
  m.stop(); w.media.set(true); m.pause();
  assert.equal(m.state().phase, 'still'); assert.deepEqual(m.state().blockers, ['reduced', 'user-pause', 'user-stop']);
  m.start(); assert.equal(m.state().phase, 'still', 'reduced still holds');
  w.media.set(false); assert.equal(m.state().phase, 'still', 'user-pause still holds and nothing is built while paused');
  assert.equal(root.querySelector('[data-p26-motion="rain"]'), null);
  m.resume(); assert.equal(m.state().phase, 'running');
  m.stop(); assert.ok(root.serialize() === before);
});

test('created blocked: the approved still stays untouched until the first unblocked moment', () => {
  for (const opts of [{ startPaused: true }, { active: false }]) {
    const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = create(w, root, { weather: 'rain', ...opts });
    assert.equal(root.serialize(), before); assert.equal(w.animations.length, 0); assert.equal(m.state().phase, 'still');
    if (opts.startPaused) m.resume(); else m.setActive(true);
    assert.equal(m.state().phase, 'running');
  }
  const w = makeWorld(); w.doc.visibilityState = 'hidden'; const root = w.makeRoot(), before = root.serialize();
  const m = create(w, root, { weather: 'rain'  });
  assert.equal(root.serialize(), before); w.doc.set('visible'); assert.equal(m.state().phase, 'running');
});

test('live reduced-motion preference: startup and changes while running', () => {
  const w = makeWorld({ reducedPref: true }), root = w.makeRoot(), before = root.serialize();
  const m = create(w, root, { weather: 'storm'  });
  assert.equal(root.serialize(), before); assert.equal(m.state().phase, 'still'); assert.deepEqual(m.state().blockers, ['reduced']);
  w.media.set(false); assert.equal(m.state().phase, 'running');
  w.media.set(true); assert.equal(m.state().phase, 'still'); assert.equal(root.serialize(), before);
  assert.equal(m.requestFlash().reason, 'reduced-motion');
});

test("option reducedMotion:'reduce' behaves as reduced and the OS preference cannot clear it", () => {
  const { w, root, m } = mount(makeWorld(), { reducedMotion: 'reduce' });
  assert.equal(m.state().phase, 'still'); w.media.set(true); w.media.set(false);
  assert.equal(m.state().phase, 'still'); assert.equal(root.querySelector('[data-p26-motion="rain"]'), null);
  assert.throws(() => createWeatherMotion(w.makeRoot(), { weather: 'rain', env: w.env(), reducedMotion: 'ignore' }), RangeError);
});

test('overcast has no motion and wrong roots are rejected', () => {
  const w = makeWorld(), root = w.makeRoot({ withRain: false }), before = root.serialize();
  const m = create(w, root, { weather: 'overcast'  });
  assert.deepEqual([m.state().phase, m.state().motion, m.state().animations], ['still', false, 0]); assert.equal(root.serialize(), before);
  m.pause(); m.resume(); m.destroy();
  assert.throws(() => createWeatherMotion(w.makeRoot({ withRain: false }), { weather: 'storm', env: w.env() }), TypeError);
  assert.throws(() => createWeatherMotion(w.makeRoot(), { weather: 'hail', env: w.env() }), RangeError);
});

test('destroy is idempotent and leaves no animation, observer, listener or subscriber', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = create(w, root, { weather: 'storm'  }); let calls = 0; m.subscribe(() => calls++);
  assert.ok(w.doc.listenerCount === 1 && w.media.l.size === 1 && w.observers.at(-1).connected);
  m.destroy(); const n = calls; m.destroy(); m.destroy();
  assert.equal(calls, n, 'no notification after destroy'); assert.equal(w.live().length, 0);
  assert.equal(w.doc.listenerCount, 0); assert.equal(w.media.l.size, 0); assert.equal(w.observers.at(-1).connected, false);
  assert.equal(m.state().phase, 'destroyed'); assert.equal(m.targets().length, 0);
  m.pause(); m.resume(); m.stop(); m.start(); m.setActive(false); w.doc.set('hidden'); w.media.set(true);
  assert.equal(m.state().phase, 'destroyed'); assert.equal(w.live().length, 0); assert.equal(root.serialize(), before);
  assert.equal(m.requestFlash().reason, 'destroyed'); assert.equal(typeof m.subscribe(() => {}), 'function', 'subscribe after destroy is a harmless no-op');
});

test('cancel() rejections of Animation.finished are handled (no unhandled rejection)', async () => {
  const seen = []; const h = e => seen.push(e); process.on('unhandledRejection', h);
  const { m } = mount(); m.stop(); m.start(); m.destroy(); await flush(); await flush();
  process.off('unhandledRejection', h); assert.deepEqual(seen, []);
});

test('repeated instances are independent; teardown of one does not touch the others', () => {
  const w = makeWorld(), roots = [0, 1, 2].map(() => w.makeRoot()), ms = roots.map(r => create(w, r, { weather: 'rain'  }));
  const per = ms[0].state().animations;
  ms[0].pause(); assert.deepEqual(ms.map(m => m.state().phase), ['paused', 'running', 'running']);
  ms[1].stop(); assert.deepEqual(ms.map(m => m.state().phase), ['paused', 'still', 'running']);
  ms[2].destroy(); assert.deepEqual(ms.map(m => m.state().phase), ['paused', 'still', 'destroyed']);
  assert.equal(w.live().length, per, 'only the paused scene still owns live animations');
  w.observers[0].fire(true); w.observers[1].fire(false);       // each scene has its own observer
  assert.deepEqual(ms.map(m => m.state().blockers), [['user-pause'], ['offscreen', 'user-stop'], []]);
  w.doc.set('hidden'); assert.deepEqual(ms.map(m => m.state().blockers.includes('hidden')), [true, true, false]);
  ms.forEach(m => m.destroy()); assert.equal(w.live().length, 0);
});

test('no animation targets the duck, its ancestors or the lamp; all targets sit inside the motion container', () => {
  const { root, m } = mount(); const duck = root.querySelector('[role="img"]') ?? [...root.walk()].find(n => n.getAttribute('role') === 'img'), lamp = [...root.walk()].find(n => (n.getAttribute('class') || '').includes('lamp-on'));
  const container = root.querySelector('[data-p26-motion="rain"]');
  assert.ok(duck && lamp && m.targets().length > 5);
  for (const t of m.targets()) { assert.ok(container.contains(t)); assert.ok(!t.contains(duck) && !duck.contains(t) && !t.contains(lamp) && !lamp.contains(t)); }
  assert.equal(root.serialize().includes('data-p26-motion-target'), true);
});

test('animate() failure rolls back to the approved still and records the error', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(); const orig = w.node;
  w.node = (tag, attrs) => { const n = orig(tag, attrs); n.animate = () => { throw new Error('no WAAPI'); }; return n; };
  const m = create(w, root, { weather: 'rain'  });
  assert.equal(root.serialize(), before); assert.equal(m.state().phase, 'still'); assert.match(m.state().error, /no WAAPI/);
  m.pause(); m.resume(); assert.equal(m.state().phase, 'still', 'does not retry a failing build');
});

// ---- flash logic only (fake effect) -----------------------------------------------------------------------------------------------
test('flash refusal precedence and cooldown consumption', async () => {
  const c = clock(), arbiter = createFlashArbiter({ now: c.now }), fx = fakeEffect();
  const { w, m } = mount(makeWorld(), { arbiter, flashEffect: fx });
  m.pause(); assert.equal(m.requestFlash().reason, 'blocked:user-pause'); m.resume();
  m.stop(); assert.equal(m.requestFlash().reason, 'stopped'); m.start();
  assert.equal(fx.started, 0); assert.equal(arbiter.snapshot().stats.accepted, 0, 'blocked refusals consume no cooldown');
  const t = m.requestFlash({ requester: 'story' }); assert.equal(t.status, 'accepted'); assert.equal(m.state().flashActive, true);
  fx.finish(); assert.deepEqual(await t.done, { status: 'finished', id: t.id }); assert.equal(m.state().flashActive, false);
  assert.equal(m.requestFlash().reason, 'cooldown'); c.add(4000); assert.equal(m.requestFlash().status, 'accepted');
  void w;
  const w2 = makeWorld(), w3 = makeWorld();
  assert.equal(create(w2, w2.makeRoot(), { weather: 'rain', arbiter, flashEffect: null }).requestFlash().reason, 'flash-visual-not-built');
  assert.equal(create(w3, w3.makeRoot(), { weather: 'rain', flashEffect: fx }).requestFlash().reason, 'no-arbiter');
});

test('an interruption cancels the transient flash to neutral and never resumes it', async () => {
  for (const interrupt of ['hidden', 'pause', 'inactive', 'reduced', 'stop', 'destroy', 'offscreen']) {
    const c = clock(), arbiter = createFlashArbiter({ now: c.now }), fx = fakeEffect(), { w, m } = mount(makeWorld(), { arbiter, flashEffect: fx });
    const t = m.requestFlash();
    if (interrupt === 'hidden') w.doc.set('hidden'); else if (interrupt === 'pause') m.pause(); else if (interrupt === 'inactive') m.setActive(false);
    else if (interrupt === 'reduced') w.media.set(true); else if (interrupt === 'stop') m.stop(); else if (interrupt === 'offscreen') w.observers.at(-1).fire(false); else m.destroy();
    const out = await t.done;
    assert.equal(out.status, 'cancelled', interrupt); assert.equal(fx.cancelled, 1);
    fx.finish(); await flush();                                  // a late natural finish must not rewrite the outcome
    assert.equal((await t.done).status, 'cancelled'); assert.equal(arbiter.snapshot().stats.finished, 0);
    if (interrupt !== 'destroy') { if (interrupt === 'hidden') w.doc.set('visible'); else if (interrupt === 'pause') m.resume(); else if (interrupt === 'inactive') m.setActive(true); else if (interrupt === 'reduced') w.media.set(false); else if (interrupt === 'stop') m.start(); else w.observers.at(-1).fire(true); assert.equal(fx.started, 1, 'a cleared blocker does not restart the beat'); assert.equal(m.state().flashActive, false); }
    assert.equal(m.requestFlash().reason === undefined, false, 'cooldown still applies after a cancelled beat');
    m.destroy();
  }
});

test('page arbiter is shared: scene B is refused after scene A; recreating A does not reset the cooldown', async () => {
  const c = clock(), arbiter = createFlashArbiter({ now: c.now }), w = makeWorld(), fx = fakeEffect();
  const mk = () => create(w, w.makeRoot(), { weather: 'storm', arbiter, flashEffect: fx });
  const a = mk(), b = mk(); const t = a.requestFlash({ requester: 'A' }); fx.finish(); await t.done;
  assert.equal(b.requestFlash().reason, 'cooldown');
  a.destroy(); const a2 = mk(); c.add(1500); assert.equal(a2.requestFlash().reason, 'cooldown', 'no reset on recreation');
  c.add(2500); assert.equal(b.requestFlash().status, 'accepted'); assert.equal(a2.requestFlash().reason, 'active');
  assert.equal(fx.started, 2);
});

test('an effect that rejects or throws is reported as cancelled / refused, not finished', async () => {
  const c = clock(), arbiter = createFlashArbiter({ now: c.now }), fx = fakeEffect(), { m } = mount(makeWorld(), { arbiter, flashEffect: fx });
  const t = m.requestFlash(); const e = new Error('abort'); e.name = 'AbortError'; fx.reject(e);
  assert.deepEqual(await t.done, { status: 'cancelled', id: t.id, reason: 'effect-aborted' });
  const bad = { start() { throw new Error('boom'); } }, c2 = clock(), arb2 = createFlashArbiter({ now: c2.now });
  const { m: m2 } = mount(makeWorld(), { arbiter: arb2, flashEffect: bad });
  const r2 = m2.requestFlash();                                  // the budget was spent, so this is the accepted ticket, already cancelled: not a budget-free refusal
  assert.equal(r2.status, 'accepted'); assert.deepEqual(r2.outcome(), { status: 'cancelled', id: r2.id, reason: 'effect-start-failed' }); assert.deepEqual(await r2.done, { status: 'cancelled', id: r2.id, reason: 'effect-start-failed' });
  assert.deepEqual([arb2.snapshot().stats.accepted, arb2.snapshot().stats.cancelled, arb2.snapshot().stats.finished], [1, 1, 0]); assert.equal(m2.state().flashActive, false);
  c2.add(100); assert.equal(m2.requestFlash().reason, 'cooldown', 'no cooldown refund after a start failure');
});

test('off-screen watches the glass, not the scene box (a framing that crops the window out must not run rain)', () => {
  const { root, w } = mount(); const sky = root.querySelector('[data-p26="sky"]');
  assert.ok(sky, 'fixture has a glass'); assert.deepEqual(w.observers.at(-1).targets, [sky]);
  const w2 = makeWorld(), r2 = w2.makeRoot(); const g = r2.querySelector('[data-p26="sky"]'); g.parentNode.childNodes.splice(g.parentNode.childNodes.indexOf(g), 1);
  createWeatherMotion(r2, { weather: 'storm', env: w2.env() }); assert.deepEqual(w2.observers.at(-1).targets, [r2], 'falls back to the root when no glass is present');
});

// ---- delayed first observation (visibility is pending until the observer's first callback) -----------------------------------------
test('pending visibility: nothing is built, the still is untouched and flash is refused without using the cooldown, until the first observation', () => {
  const c = clock(), arbiter = createFlashArbiter({ now: c.now }), fx = fakeEffect(), w = makeWorld(), root = w.makeRoot(), before = root.serialize();
  const m = createWeatherMotion(root, { weather: 'storm', env: w.env(), arbiter, flashEffect: fx });
  assert.equal(root.serialize(), before); assert.equal(w.animations.length, 0);
  assert.deepEqual([m.state().phase, m.state().visibilityPending, m.state().blockers], ['still', true, ['offscreen']]);
  assert.equal(m.requestFlash().reason, 'blocked:offscreen'); assert.equal(fx.started, 0); assert.equal(arbiter.snapshot().stats.accepted, 0, 'no cooldown consumed');
  w.observers[0].fire(true);
  assert.deepEqual([m.state().phase, m.state().visibilityPending, m.state().blockers], ['running', false, []]); assert.notEqual(root.serialize(), before);
  assert.equal(m.requestFlash().status, 'accepted');
  m.destroy();
});

test('first observation not intersecting (cropped or off screen): stays on the unchanged still, then starts when it becomes visible', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(); let calls = 0;
  const m = createWeatherMotion(root, { weather: 'storm', env: w.env() }); m.subscribe(() => calls++);
  w.observers[0].fire(false);
  assert.deepEqual([m.state().phase, m.state().visibilityPending, m.state().blockers], ['still', false, ['offscreen']]);
  assert.equal(root.serialize(), before); assert.equal(w.animations.length, 0); assert.ok(calls >= 1, 'listeners hear that visibility is now known');
  w.observers[0].fire(true); assert.equal(m.state().phase, 'running');
  w.observers[0].fire(false); assert.equal(m.state().phase, 'paused'); assert.equal(w.live().filter(a => a.playState === 'running').length, 0);
  m.destroy();
});

test('a visible first observation never overrides other blockers (pause, inactive, reduced, stop, hidden)', () => {
  const cases = { 'user-pause': { startPaused: true }, inactive: { active: false }, 'user-stop': { startStopped: true }, reduced: { reducedMotion: 'reduce' } };
  for (const [name, opts] of Object.entries(cases)) {
    const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'rain', env: w.env(), ...opts });
    w.observers[0].fire(true);
    assert.equal(m.state().phase, 'still', name); assert.deepEqual(m.state().blockers, [name], name); assert.equal(w.animations.length, 0, name); assert.equal(root.serialize(), before, name);
    if (name === 'user-pause') m.resume(); else if (name === 'inactive') m.setActive(true); else if (name === 'user-stop') m.start(); else { m.destroy(); continue; }
    assert.equal(m.state().phase, 'running', `${name} cleared`); m.destroy();
  }
  const w = makeWorld(); w.doc.visibilityState = 'hidden'; const root = w.makeRoot(), m = createWeatherMotion(root, { weather: 'rain', env: w.env() });
  w.observers[0].fire(true); assert.deepEqual(m.state().blockers, ['hidden']); assert.equal(m.state().phase, 'still');
  w.doc.set('visible'); assert.equal(m.state().phase, 'running');
});

test('other blockers set or cleared while visibility is pending do not start motion early or lose the pending state', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'storm', env: w.env() });
  m.pause(); m.resume(); m.setActive(false); m.setActive(true); w.doc.set('hidden'); w.doc.set('visible'); w.media.set(true); w.media.set(false); m.stop(); m.start();
  assert.deepEqual([m.state().phase, m.state().visibilityPending, m.state().blockers], ['still', true, ['offscreen']]); assert.equal(root.serialize(), before); assert.equal(w.animations.length, 0);
  m.pause(); w.observers[0].fire(true); assert.deepEqual([m.state().phase, m.state().blockers], ['still', ['user-pause']]);
  m.resume(); assert.equal(m.state().phase, 'running'); m.destroy();
});

test('teardown before the first callback: a late observation cannot revive anything', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'storm', env: w.env() });
  m.destroy();
  assert.equal(w.observers[0].connected, false);
  w.observers[0].fire(true); w.observers[0].fire(false); w.observers[0].fire(true);      // a fake that still delivers after disconnect
  assert.equal(m.state().phase, 'destroyed'); assert.equal(w.animations.length, 0); assert.equal(root.serialize(), before);
  assert.equal(m.requestFlash().reason, 'destroyed'); m.destroy();
});

test('no IntersectionObserver: the documented visible fallback starts at once and is never pending', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'storm', env: { ...w.env(), IntersectionObserver: null } });
  assert.equal(w.observers.length, 0);
  assert.deepEqual([m.state().phase, m.state().visibilityPending, m.state().blockers], ['running', false, []]); assert.notEqual(root.serialize(), before);
  m.destroy(); assert.equal(root.serialize(), before);
});
