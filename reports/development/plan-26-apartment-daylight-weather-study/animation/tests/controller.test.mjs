import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherMotion, PAUSE_BLOCKERS } from '../controller.mjs';
import { createFlashArbiter } from '../arbiter.mjs';
import { makeWorld } from './fake-dom.mjs';
import { rainMotionSpec } from '../rain-motion.mjs';

const permutations = a => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])));
const subsets = a => a.reduce((acc, x) => acc.concat(acc.map(s => [...s, x])), [[]]).filter(s => s.length);
const mount = (w = makeWorld(), opts = {}) => { const root = w.makeRoot(), m = createWeatherMotion(root, { weather: 'storm', env: w.env(), ...opts }); return { w, root, m }; };
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
    const m = createWeatherMotion(root, { weather: 'storm', env: w.env() });
    assert.notEqual(root.serialize(), before, 'motion changes the DOM while active');
    if (how === 'stop') m.stop(); else if (how === 'reduced') w.media.set(true); else m.destroy();
    assert.equal(root.serialize(), before, how);
    assert.equal(w.live().length, 0, `${how}: no live animation`);
  }
});

test('a pre-existing display attribute on an original layer is restored, not dropped', () => {
  const w = makeWorld(), root = w.makeRoot(); root.querySelector('[data-p26="droplets"]').setAttribute('display', 'inline');
  const before = root.serialize(), m = createWeatherMotion(root, { weather: 'rain', env: w.env() });
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
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'storm', env: w.env() });
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
    const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'rain', env: w.env(), ...opts });
    assert.equal(root.serialize(), before); assert.equal(w.animations.length, 0); assert.equal(m.state().phase, 'still');
    if (opts.startPaused) m.resume(); else m.setActive(true);
    assert.equal(m.state().phase, 'running');
  }
  const w = makeWorld(); w.doc.visibilityState = 'hidden'; const root = w.makeRoot(), before = root.serialize();
  const m = createWeatherMotion(root, { weather: 'rain', env: w.env() });
  assert.equal(root.serialize(), before); w.doc.set('visible'); assert.equal(m.state().phase, 'running');
});

test('live reduced-motion preference: startup and changes while running', () => {
  const w = makeWorld({ reducedPref: true }), root = w.makeRoot(), before = root.serialize();
  const m = createWeatherMotion(root, { weather: 'storm', env: w.env() });
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
  const m = createWeatherMotion(root, { weather: 'overcast', env: w.env() });
  assert.deepEqual([m.state().phase, m.state().motion, m.state().animations], ['still', false, 0]); assert.equal(root.serialize(), before);
  m.pause(); m.resume(); m.destroy();
  assert.throws(() => createWeatherMotion(w.makeRoot({ withRain: false }), { weather: 'storm', env: w.env() }), TypeError);
  assert.throws(() => createWeatherMotion(w.makeRoot(), { weather: 'hail', env: w.env() }), RangeError);
});

test('destroy is idempotent and leaves no animation, observer, listener or subscriber', () => {
  const w = makeWorld(), root = w.makeRoot(), before = root.serialize(), m = createWeatherMotion(root, { weather: 'storm', env: w.env() }); let calls = 0; m.subscribe(() => calls++);
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
  const w = makeWorld(), roots = [0, 1, 2].map(() => w.makeRoot()), ms = roots.map(r => createWeatherMotion(r, { weather: 'rain', env: w.env() }));
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
  const m = createWeatherMotion(root, { weather: 'rain', env: w.env() });
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
  assert.equal(createWeatherMotion(makeWorld().makeRoot(), { weather: 'rain', env: makeWorld().env(), arbiter, flashEffect: null }).requestFlash().reason, 'flash-visual-not-built');
  assert.equal(createWeatherMotion(makeWorld().makeRoot(), { weather: 'rain', env: makeWorld().env(), flashEffect: fx }).requestFlash().reason, 'no-arbiter');
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
  const mk = () => createWeatherMotion(w.makeRoot(), { weather: 'storm', env: w.env(), arbiter, flashEffect: fx });
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
  assert.equal(m2.requestFlash().reason, 'effect-start-failed'); assert.equal(arb2.snapshot().stats.cancelled, 1); assert.equal(arb2.snapshot().stats.finished, 0);
});
