import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherMotion } from '../controller.mjs';
import { createFlashArbiter } from '../arbiter.mjs';
import { BRIGHT, layerFactor, layerOpacity, layerKeyframes, pulseTiming, createBrightLightningEffect } from '../lightning-bright.mjs';
import { makeWorld } from './fake-dom.mjs';

const flush = () => new Promise(r => setImmediate(r));
const clock = (t = 10000) => ({ now: () => t, add: v => { t += v; } });
const timers = () => { const list = []; return { list, schedule: (fn, ms) => { const t = { fn, ms, cleared: false }; list.push(t); return () => { t.cleared = true; }; }, fire: i => { if (!list[i].cleared) list[i].fn(); } }; };
function scene(w, { arbiter, effect, weather = 'storm', ...opts } = {}) {
  const root = w.makeRoot(), n = w.observers.length, m = createWeatherMotion(root, { weather, env: w.env(), arbiter, flashEffect: effect, ...opts });
  if (w.observers.length > n) w.observers[n].fire(true);
  return { root, m };
}
const kit = () => { const c = clock(), t = timers(), arbiter = createFlashArbiter({ now: c.now }), effect = createBrightLightningEffect({ schedule: t.schedule }); return { c, t, arbiter, effect }; };
const interp = (kf, t, dur) => { const p = t / dur; for (let i = 0; i < kf.length - 1; i++) if (p >= kf[i].offset && p <= kf[i + 1].offset) return kf[i + 1].offset === kf[i].offset ? kf[i + 1].opacity : kf[i].opacity + (kf[i + 1].opacity - kf[i].opacity) * (p - kf[i].offset) / (kf[i + 1].offset - kf[i].offset); return 0; };

test('bright curve: hard rise to the peak, the whole-scene layer is gone at 300 ms, the window layer is still lit then and fades out 500 ms later; bounded, one pulse', () => {
  const B = BRIGHT, S = B.scene, W = B.window;
  assert.equal(B.durationMs, 800);
  assert.equal(layerFactor(S.keys, 0), 0); assert.equal(layerFactor(S.keys, 40), 1); assert.equal(layerFactor(S.keys, 300), 0); assert.equal(layerFactor(S.keys, 500), 0); assert.equal(layerFactor(S.keys, 800), 0);
  assert.equal(layerFactor(W.keys, 40), 1); assert.equal(layerFactor(W.keys, 300), .75); assert.equal(layerFactor(W.keys, 800), 0); assert.equal(layerFactor(W.keys, 1000), 0);
  assert.ok(layerFactor(W.keys, 550) > 0 && layerFactor(W.keys, 550) < .75 && layerFactor(W.keys, 790) > 0, 'the window is still lit well after the scene flash ended');
  const end = keys => keys.find(([t, f], i) => i > 0 && f === 0)[0];                                   // first time a layer reaches zero after the peak
  assert.equal(end(W.keys) - end(S.keys), 500, 'the window outlasts the scene flash by 500 ms');
  for (const [name, layer] of [['scene', S], ['window', W]]) {
    let prev = 0, rose = true, peaks = 0;
    for (let t = 0; t <= 800; t++) { const f = layerFactor(layer.keys, t); assert.ok(f >= 0 && f <= 1, name); if (rose && f < prev) { rose = false; peaks++; } if (!rose && f > prev) assert.fail(`${name} rises again at ${t}`); prev = f; }
    assert.equal(peaks, 1, `${name}: one maximum, no second peak`);
    const kf = layerKeyframes(layer); assert.deepEqual(kf.map(k => Object.keys(k).sort().join()), Array(kf.length).fill('offset,opacity'));
    for (let t = 0; t <= 800; t += 13) assert.ok(Math.abs(interp(kf, t, 800) - layerOpacity(layer, t)) < 1e-9, `${name} t=${t}`);
  }
  assert.ok(S.peak <= .95 && W.peak <= 1, 'documented bounds'); assert.deepEqual(pulseTiming(), { duration: 800, easing: 'linear', fill: 'none', iterations: 1 });
});

test('one accepted event = one bright pulse: exactly two overlay animations (scene, window), opacity only, neutral at creation, no repeat', async () => {
  const { arbiter, effect } = kit(), w = makeWorld(), { m } = scene(w, { arbiter, effect });
  const rain = w.animations.length, t = m.requestFlash({ requester: 'story' });
  assert.equal(t.status, 'accepted'); assert.equal(w.animations.length, rain + 2);
  const fa = m.flashAnimations(); for (const a of fa) { assert.deepEqual(a.options, pulseTiming()); assert.ok(a.keyframes.every(k => Object.keys(k).sort().join() === 'offset,opacity')); }
  assert.deepEqual(m.flashTargets().map(n => n.getAttribute('data-p26-flash-target')), ['scene-flash', 'window-flash']);
  for (const n of m.flashTargets()) assert.equal(n.getAttribute('opacity'), '0');
  fa.forEach(a => a.finish()); assert.deepEqual(await t.done, { status: 'finished', id: t.id }); await flush(); assert.equal(w.animations.length, rain + 2);
});

test('placement and cleanup: scene white and clipped window white sit right after window-spill (above the tint, below any lamp layers), duck and lamp untouched, DOM returns exactly', async () => {
  for (const how of ['finish', 'cancel']) {
    const { arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect }), before = root.serialize();
    const duck = [...root.walk()].find(n => n.getAttribute('data-test') === 'duck-wrap'), lamp = [...root.walk()].find(n => (n.getAttribute('class') || '').includes('lamp-on')), d0 = duck.serialize(), l0 = lamp.serialize();
    const spill = root.querySelector('[data-p26="window-spill"]'), t = m.requestFlash(), sib = spill.parentNode.childNodes, i = sib.indexOf(spill);
    assert.equal(sib[i + 1].getAttribute('data-p26-flash'), 'scene-flash'); assert.equal(sib[i + 1].getAttribute('fill'), '#ffffff'); assert.equal(sib[i + 1].getAttribute('width'), '14000');
    assert.equal(sib[i + 2].getAttribute('data-p26-flash'), 'window-clip'); assert.equal(sib[i + 2].getAttribute('clip-path'), 'url(#x-panes)');
    assert.equal(sib[i + 2].childNodes[0].getAttribute('width'), '200'); assert.equal(sib[i + 2].childNodes[0].getAttribute('data-p26-flash-target'), 'window-flash');
    assert.equal(duck.serialize(), d0); assert.equal(lamp.serialize(), l0);
    for (const a of w.animations) assert.ok(!duck.contains(a.target) && !a.target.contains(duck) && !lamp.contains(a.target) && !a.target.contains(lamp));
    if (how === 'finish') { m.flashAnimations().forEach(a => a.finish()); assert.equal((await t.done).status, 'finished'); } else { m.stop(); assert.equal((await t.done).status, 'cancelled'); m.start(); }
    await flush(); assert.equal(root.querySelector('[data-p26-flash]'), null, how); if (how === 'finish') assert.equal(root.serialize(), before);
  }
});

test('refusals before the arbiter consume no budget; storm only', () => {
  const { arbiter, effect } = kit(), w = makeWorld();
  assert.equal(scene(w, { arbiter, effect, weather: 'rain' }).m.requestFlash().reason, 'not-storm');
  { const s = scene(w, { arbiter, effect }); s.root.querySelector('[data-p26="sky"]').parentNode.removeAttribute('clip-path'); assert.equal(s.m.requestFlash().reason, 'no-glass'); }
  { const s = scene(w, { arbiter, effect }), sp = s.root.querySelector('[data-p26="window-spill"]'); sp.parentNode.removeChild(sp); assert.equal(s.m.requestFlash().reason, 'no-room-anchor'); }
  assert.equal(scene(w, { arbiter, effect, reducedMotion: 'reduce' }).m.requestFlash().reason, 'reduced-motion');
  assert.equal(scene(w, { arbiter, effect, startStopped: true }).m.requestFlash().reason, 'stopped');
  assert.equal(scene(w, { arbiter, effect, startPaused: true }).m.requestFlash().reason, 'blocked:user-pause');
  { const root = w.makeRoot(), m = createWeatherMotion(root, { weather: 'storm', env: w.env(), arbiter, flashEffect: effect }); assert.equal(m.requestFlash().reason, 'blocked:offscreen', 'pending visibility'); w.observers.at(-1).fire(false); assert.equal(m.requestFlash().reason, 'blocked:offscreen', 'glass cropped out'); }
  assert.equal(scene(w, { effect }).m.requestFlash().reason, 'no-arbiter');
  const st = arbiter.snapshot().stats; assert.deepEqual([st.accepted, st.refusedCooldown, st.refusedActive], [0, 0, 0]);
});

test('every interruption cancels the bright pulse at once, cooldown kept, never resumed; the watchdog reason survives', async () => {
  for (const how of ['pause', 'hidden', 'inactive', 'offscreen', 'reduced', 'stop', 'destroy']) {
    const { c, arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect }), t = m.requestFlash(), fa = m.flashAnimations();
    assert.equal(t.status, 'accepted');
    if (how === 'pause') m.pause(); else if (how === 'hidden') w.doc.set('hidden'); else if (how === 'inactive') m.setActive(false); else if (how === 'offscreen') w.observers.at(-1).fire(false);
    else if (how === 'reduced') w.media.set(true); else if (how === 'stop') m.stop(); else m.destroy();
    assert.equal(root.querySelector('[data-p26-flash]'), null, how); assert.ok(fa.every(a => !a.live), how); assert.equal((await t.done).status, 'cancelled', how);
    fa.forEach(a => a.finish()); await flush(); assert.equal((await t.done).status, 'cancelled'); assert.equal(arbiter.snapshot().stats.finished, 0);
    c.add(1000); assert.equal(scene(makeWorld(), { arbiter, effect }).m.requestFlash().reason, 'cooldown', `${how}: no refund`);
  }
  const { t: tm, arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect }), t = m.requestFlash();
  assert.equal(tm.list[0].ms, 800 + 1500); tm.fire(0); assert.deepEqual(await t.done, { status: 'cancelled', id: t.id, reason: 'watchdog' }); assert.equal(root.querySelector('[data-p26-flash]'), null);
});

test('shared arbiter with the bright look: four scenes in one tick give one pulse; 3999.9 ms refused, 4000 ms accepted', async () => {
  { const { arbiter, effect } = kit(), w = makeWorld(), scenes = [0, 1, 2, 3].map(() => scene(w, { arbiter, effect })), res = scenes.map(s => s.m.requestFlash());
    assert.deepEqual(res.map(r => r.status), ['accepted', 'refused', 'refused', 'refused']); assert.equal(scenes.filter(s => s.root.querySelector('[data-p26-flash]')).length, 1); }
  { const { c, arbiter, effect } = kit(), w = makeWorld(), a = scene(w, { arbiter, effect }), b = scene(w, { arbiter, effect }), t1 = a.m.requestFlash();
    a.m.flashAnimations().forEach(x => x.finish()); await t1.done; c.add(3999.9); assert.equal(b.m.requestFlash().reason, 'cooldown'); c.add(.1); assert.equal(b.m.requestFlash().status, 'accepted'); }
});

// ---- injected start failures after acceptance: exact restoration, accepted-then-cancelled, budget kept, later request works ----------------------------------
test('injected failure: the SECOND overlay insertion throws after the first succeeded -> exact DOM restoration, accepted-then-cancelled, cooldown kept, later request works', async () => {
  const c = clock(), tm = timers(), arbiter = createFlashArbiter({ now: c.now }), effect = createBrightLightningEffect({ schedule: tm.schedule }), w = makeWorld(), { root, m } = scene(w, { arbiter, effect });
  const before = root.serialize(), liveBefore = w.live().length, parent = root.querySelector('[data-p26="window-spill"]').parentNode, real = parent.insertBefore.bind(parent); let calls = 0;
  parent.insertBefore = (n, ref) => { if (++calls === 2) throw new Error('second insert fails'); return real(n, ref); };
  const r = m.requestFlash(); parent.insertBefore = real;
  assert.equal(calls, 2, 'the first insertion really happened before the failure');
  assert.equal(r.status, 'accepted'); assert.deepEqual(await r.done, { status: 'cancelled', id: r.id, reason: 'effect-start-failed' });
  assert.equal(root.serialize(), before, 'exact DOM restoration: the first overlay is gone too'); assert.equal(root.querySelector('[data-p26-flash]'), null);
  assert.equal(w.live().length, liveBefore, 'no live animation left behind'); assert.equal(tm.list.length, 0, 'no watchdog timer was armed');
  assert.deepEqual([arbiter.snapshot().stats.accepted, arbiter.snapshot().stats.cancelled, arbiter.snapshot().stats.finished], [1, 1, 0]); assert.equal(arbiter.snapshot().activeId, null); assert.equal(m.state().flashActive, false);
  c.add(100); assert.equal(m.requestFlash().reason, 'cooldown', 'the cooldown is kept');
  c.add(3900); const ok = m.requestFlash(); assert.equal(ok.status, 'accepted', 'a later request works once the failure is removed and the cooldown has passed'); assert.equal(tm.list.length, 1);
  m.flashAnimations().forEach(a => a.finish()); assert.equal((await ok.done).status, 'finished'); assert.equal(tm.list[0].cleared, true); await flush(); assert.equal(root.serialize(), before);
});

test('injected failure: the watchdog scheduler throws AFTER the animations exist -> animations cancelled, every node removed, accepted-then-cancelled, cooldown kept, later request works', async () => {
  const c = clock(), tm = timers(); let broken = true;
  const effect = createBrightLightningEffect({ schedule: (fn, ms) => { if (broken) throw new Error('no timer available'); return tm.schedule(fn, ms); } });
  const arbiter = createFlashArbiter({ now: c.now }), w = makeWorld(), { root, m } = scene(w, { arbiter, effect });
  const before = root.serialize(), liveBefore = w.live().length, animsBefore = w.animations.length;
  const r = m.requestFlash();
  assert.equal(w.animations.length, animsBefore + 2, 'the two pulse animations really were created before the scheduler failed');
  assert.equal(r.status, 'accepted'); assert.deepEqual(await r.done, { status: 'cancelled', id: r.id, reason: 'effect-start-failed' });
  assert.equal(root.serialize(), before, 'exact DOM restoration'); assert.equal(root.querySelector('[data-p26-flash]'), null);
  assert.equal(w.live().length, liveBefore, 'the pulse animations were cancelled: no pulse runs without a handle'); assert.equal(tm.list.length, 0, 'no timer exists');
  assert.deepEqual([arbiter.snapshot().stats.accepted, arbiter.snapshot().stats.cancelled, arbiter.snapshot().stats.finished], [1, 1, 0]); assert.equal(arbiter.snapshot().activeId, null); assert.equal(m.state().flashActive, false);
  c.add(100); assert.equal(m.requestFlash().reason, 'cooldown', 'the cooldown is kept');
  broken = false; c.add(3900); const ok = m.requestFlash(); assert.equal(ok.status, 'accepted'); assert.equal(tm.list.length, 1);
  m.flashAnimations().forEach(a => a.finish()); assert.equal((await ok.done).status, 'finished'); assert.equal(tm.list[0].cleared, true); await flush(); assert.equal(root.serialize(), before);
});
