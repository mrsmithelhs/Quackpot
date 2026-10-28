import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeatherMotion } from '../controller.mjs';
import { createFlashArbiter } from '../arbiter.mjs';
import { LIGHTNING, pulseFactor, pulseKeyframes, pulseTiming, createLightningEffect } from '../lightning.mjs';
import { makeWorld } from './fake-dom.mjs';

const flush = () => new Promise(r => setImmediate(r));
const clock = (t = 10000) => ({ now: () => t, add: v => { t += v; } });
/** Fake watchdog scheduler: timers fire only when the test says so. */
const timers = () => { const list = []; return { list, schedule: (fn, ms) => { const t = { fn, ms, cleared: false }; list.push(t); return () => { t.cleared = true; }; }, fire: i => { if (!list[i].cleared) list[i].fn(); } }; };
/** A scene on a world: visible observation delivered, shared arbiter and a lightning effect injected. */
function scene(w, { arbiter, effect, weather = 'storm', ...opts } = {}) {
  const root = w.makeRoot(), n = w.observers.length, m = createWeatherMotion(root, { weather, env: w.env(), arbiter, flashEffect: effect, ...opts });
  if (w.observers.length > n) w.observers[n].fire(true);
  return { root, m };
}
const kit = () => { const c = clock(), t = timers(), arbiter = createFlashArbiter({ now: c.now }), effect = createLightningEffect({ schedule: t.schedule }); return { c, t, arbiter, effect }; };
const interp = (kf, t, dur) => { const p = t / dur; for (let i = 0; i < kf.length - 1; i++) if (p >= kf[i].offset && p <= kf[i + 1].offset) return kf[i].opacity + (kf[i + 1].opacity - kf[i].opacity) * (p - kf[i].offset) / (kf[i + 1].offset - kf[i].offset); return 0; };

test('curve: one maximum at the peak, zero outside the pulse, linear rise and fall, bounded; keyframes encode exactly that curve', () => {
  const L = LIGHTNING;
  assert.equal(pulseFactor(-5), 0); assert.equal(pulseFactor(0), 0); assert.equal(pulseFactor(L.peakMs), 1); assert.equal(pulseFactor(L.durationMs), 0); assert.equal(pulseFactor(L.durationMs + 50), 0);
  assert.equal(pulseFactor(60), .5); assert.equal(pulseFactor(360), .5, 'midpoint of the fall');
  let max = 0, maxAt = -1, prev = 0, rises = 0, falls = 0;
  for (let t = 0; t <= L.durationMs; t += 1) {
    const f = pulseFactor(t); assert.ok(f >= 0 && f <= 1);
    if (f > max) { max = f; maxAt = t; } if (f > prev) rises++; else if (f < prev) falls++;
    if (t <= L.peakMs) assert.ok(f >= prev); else assert.ok(f <= prev);
    prev = f;
  }
  assert.deepEqual([max, maxAt, rises, falls], [1, L.peakMs, L.peakMs, L.durationMs - L.peakMs]);
  for (const peak of [L.windowPeak, L.roomPeak]) {
    const kf = pulseKeyframes(peak); assert.equal(kf.length, 3); assert.deepEqual(kf.map(k => Object.keys(k).sort().join()), Array(3).fill('offset,opacity'));
    for (let t = 0; t <= L.durationMs; t += 7) assert.ok(Math.abs(interp(kf, t, L.durationMs) - peak * pulseFactor(t)) < 1e-9, `t=${t}`);
  }
  assert.deepEqual(pulseTiming(), { duration: 600, easing: 'linear', fill: 'none', iterations: 1 });
  assert.ok(L.windowPeak <= .2 && L.roomPeak <= .1 && L.durationMs === 600 && L.peakMs === 120, 'documented design bounds (lightning-mechanism.md)');
});

test('one accepted event = one pulse: exactly two overlay animations, each one iteration, nothing else animated, no new animations later', async () => {
  const { arbiter, effect } = kit(), w = makeWorld(), { m } = scene(w, { arbiter, effect });
  const rain = w.animations.length, t = m.requestFlash({ requester: 'story' });
  assert.equal(t.status, 'accepted'); assert.equal(w.animations.length, rain + 2);
  const fa = m.flashAnimations(); assert.equal(fa.length, 2);
  for (const a of fa) { assert.deepEqual(a.options, pulseTiming()); assert.deepEqual(Object.keys(a.keyframes[0]).sort(), ['offset', 'opacity']); }
  assert.deepEqual(m.flashTargets().map(n => n.getAttribute('data-p26-flash-target')), ['window-lift', 'room-lift']);
  for (const n of m.flashTargets()) assert.equal(n.getAttribute('opacity'), '0', 'neutral at creation');
  fa.forEach(a => a.finish()); assert.deepEqual(await t.done, { status: 'finished', id: t.id }); await flush();
  assert.equal(w.animations.length, rain + 2, 'no repeat, no restart');
});

test('overlay placement and cleanup: window lift last in the pane clip group, room lift right after window-spill, DOM returns exactly to the pre-flash serialisation', async () => {
  for (const how of ['finish', 'cancel']) {
    const { arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect }), before = root.serialize();
    const clip = root.querySelector('[data-p26="sky"]').parentNode, spill = root.querySelector('[data-p26="window-spill"]');
    const t = m.requestFlash();
    assert.notEqual(root.serialize(), before);
    assert.equal(clip.childNodes.at(-1).getAttribute('data-p26-flash'), 'window-lift'); assert.equal(clip.childNodes.at(-1).getAttribute('width'), '200');
    const sib = spill.parentNode.childNodes, i = sib.indexOf(spill);
    assert.equal(sib[i + 1].getAttribute('data-p26-flash'), 'defs'); assert.equal(sib[i + 2].getAttribute('data-p26-flash'), 'room-lift');
    assert.equal(sib[i + 2].getAttribute('style'), 'mix-blend-mode:screen'); assert.equal(sib[i + 2].getAttribute('rx'), '380');
    assert.equal(sib[i + 2].getAttribute('fill'), 'url(#x-flash-lift)'); assert.equal(sib[i + 1].childNodes[0].getAttribute('id'), 'x-flash-lift');
    if (how === 'finish') { m.flashAnimations().forEach(a => a.finish()); assert.equal((await t.done).status, 'finished'); }
    else { m.stop(); assert.equal((await t.done).status, 'cancelled'); m.start(); }
    await flush(); assert.equal(root.querySelector('[data-p26-flash]'), null, how);
    if (how === 'finish') assert.equal(root.serialize(), before, 'neutral after a finished pulse');
  }
});

test('duck and lamp subtrees are byte-identical during and after a pulse; nothing animated reaches them', () => {
  const { arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect });
  const duck = [...root.walk()].find(n => n.getAttribute('data-test') === 'duck-wrap'), lamp = [...root.walk()].find(n => (n.getAttribute('class') || '').includes('lamp-on'));
  const d0 = duck.serialize(), l0 = lamp.serialize(), sky0 = root.querySelector('[data-p26="sky"]').serialize();
  const t = m.requestFlash(); assert.equal(t.status, 'accepted');
  assert.equal(duck.serialize(), d0); assert.equal(lamp.serialize(), l0); assert.equal(root.querySelector('[data-p26="sky"]').serialize(), sky0);
  for (const a of w.animations) assert.ok(!duck.contains(a.target) && !a.target.contains(duck) && !lamp.contains(a.target) && !a.target.contains(lamp), 'no animation reaches the duck or lamp');
  m.destroy();
});

test('refusals consume no budget: not storm, no glass, no anchor, no arbiter, motion unavailable, reduced, stopped, pending, offscreen, hidden, inactive, paused, destroyed', () => {
  const { arbiter, effect } = kit(), w = makeWorld();
  assert.equal(scene(w, { arbiter, effect, weather: 'rain' }).m.requestFlash().reason, 'not-storm');
  { const r = w.makeRoot({ withRain: false }); assert.equal(createWeatherMotion(r, { weather: 'overcast', env: w.env(), arbiter, flashEffect: effect }).requestFlash().reason, 'blocked:offscreen', 'overcast is pending/blocked first'); }
  { const r = w.makeRoot({ withRain: false }), n = w.observers.length, m = createWeatherMotion(r, { weather: 'overcast', env: w.env(), arbiter, flashEffect: effect }); w.observers[n].fire(true); assert.equal(m.requestFlash().reason, 'not-storm'); }
  { const s = scene(w, { arbiter, effect }); s.root.querySelector('[data-p26="sky"]').parentNode.removeAttribute('clip-path'); assert.equal(s.m.requestFlash().reason, 'no-glass'); }
  { const s = scene(w, { arbiter, effect }), sp = s.root.querySelector('[data-p26="window-spill"]'); sp.parentNode.removeChild(sp); assert.equal(s.m.requestFlash().reason, 'no-room-anchor'); }
  assert.equal(scene(w, { effect }).m.requestFlash().reason, 'no-arbiter');
  {
    const w2 = makeWorld(), root = w2.makeRoot(), orig = w2.node; w2.node = (tag, a) => { const n = orig(tag, a); n.animate = () => { throw new Error('no WAAPI'); }; return n; };
    const m = createWeatherMotion(root, { weather: 'storm', env: w2.env(), arbiter, flashEffect: effect }); w2.observers[0].fire(true);
    assert.match(m.state().error, /no WAAPI/); assert.equal(m.requestFlash().reason, 'motion-unavailable');
  }
  assert.equal(scene(w, { arbiter, effect, reducedMotion: 'reduce' }).m.requestFlash().reason, 'reduced-motion');
  assert.equal(scene(w, { arbiter, effect, startStopped: true }).m.requestFlash().reason, 'stopped');
  { const root = w.makeRoot(), m = createWeatherMotion(root, { weather: 'storm', env: w.env(), arbiter, flashEffect: effect }); assert.equal(m.requestFlash().reason, 'blocked:offscreen', 'pending visibility'); w.observers.at(-1).fire(false); assert.equal(m.requestFlash().reason, 'blocked:offscreen', 'glass cropped out'); }
  assert.equal(scene(w, { arbiter, effect, startPaused: true }).m.requestFlash().reason, 'blocked:user-pause');
  assert.equal(scene(w, { arbiter, effect, active: false }).m.requestFlash().reason, 'blocked:inactive');
  { const s = scene(w, { arbiter, effect }); w.doc.set('hidden'); assert.equal(s.m.requestFlash().reason, 'blocked:hidden'); w.doc.set('visible'); s.m.destroy(); assert.equal(s.m.requestFlash().reason, 'destroyed'); }
  const st = arbiter.snapshot().stats;
  assert.deepEqual([st.accepted, st.refusedCooldown, st.refusedActive], [0, 0, 0], 'not one refusal touched the arbiter');
});

test('every interruption cancels the pulse to neutral at once, outcome cancelled, cooldown kept, never resumed', async () => {
  for (const how of ['pause', 'hidden', 'inactive', 'offscreen', 'reduced', 'stop', 'destroy']) {
    const { c, arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect });
    assert.ok(root.serialize().includes('data-p26-motion="rain"'));
    const t = m.requestFlash(); assert.equal(t.status, 'accepted'); const fa = m.flashAnimations();
    if (how === 'pause') m.pause(); else if (how === 'hidden') w.doc.set('hidden'); else if (how === 'inactive') m.setActive(false); else if (how === 'offscreen') w.observers.at(-1).fire(false);
    else if (how === 'reduced') w.media.set(true); else if (how === 'stop') m.stop(); else m.destroy();
    assert.equal(root.querySelector('[data-p26-flash]'), null, `${how}: overlay removed at once`); assert.ok(fa.every(a => !a.live), `${how}: animations cancelled`);
    assert.equal((await t.done).status, 'cancelled', how); assert.equal(m.state().flashActive, false);
    if (how !== 'destroy') {
      if (how === 'pause') m.resume(); else if (how === 'hidden') w.doc.set('visible'); else if (how === 'inactive') m.setActive(true); else if (how === 'offscreen') w.observers.at(-1).fire(true); else if (how === 'reduced') w.media.set(false); else m.start();
      await flush(); assert.equal(root.querySelector('[data-p26-flash]'), null, `${how}: not resumed`); assert.equal(m.state().flashActive, false);
    }
    fa.forEach(a => a.finish()); await flush(); assert.equal((await t.done).status, 'cancelled', 'a late finish cannot rewrite it');
    assert.equal(arbiter.snapshot().stats.finished, 0); assert.equal(arbiter.snapshot().stats.cancelled, 1);
    c.add(1000); assert.equal(scene(makeWorld(), { arbiter, effect }).m.requestFlash().reason, 'cooldown', `${how}: cancellation does not refund the cooldown`);
  }
});

test('shared arbiter across many controllers, recreation and fake time: never two pulses within 4000 ms of a start, never overlapping, refusals free', async () => {
  const { c, arbiter, effect } = kit(), w = makeWorld(); const starts = [];
  const make = () => scene(w, { arbiter, effect }).m;
  let a = make(), b = make(); const d = make();
  for (let step = 0; step < 400; step++) {
    c.add(step % 11 === 0 ? 3990 + (step % 7) * 5 : 53 + (step * 37) % 211);   // irregular steps, some tiny, some right at the 4000 ms boundary
    if (step % 17 === 0) { a.destroy(); a = make(); }                  // recreation must not reset the budget
    if (step % 23 === 0) { b.destroy(); b = make(); }
    const m = [a, b, d][step % 3], r = m.requestFlash({ requester: `s${step}` });
    if (r.status === 'accepted') { starts.push(r.startedAt); if (step % 2) m.flashAnimations().forEach(x => x.finish()); else m.stop(); await flush(); m.start(); }
    else assert.ok(['cooldown', 'active'].includes(r.reason) || r.reason.startsWith('blocked'), r.reason);
  }
  assert.ok(starts.length >= 8, `enough accepted pulses to mean something (${starts.length})`);
  for (let i = 1; i < starts.length; i++) assert.ok(starts[i] - starts[i - 1] >= 4000, `gap ${starts[i] - starts[i - 1]}`);
  for (let i = 0; i < starts.length; i++) assert.equal(starts.filter(s => s >= starts[i] && s < starts[i] + 1000).length, 1, 'at most one pulse in any rolling second');
  assert.equal(arbiter.snapshot().stats.accepted, starts.length, 'only accepted requests ever counted');
  await flush();
});

test('boundaries in fake time: 3999.9 ms refused, 4000 ms accepted; a refused request never extends the cooldown', async () => {
  const { c, arbiter, effect } = kit(), w = makeWorld(), s1 = scene(w, { arbiter, effect }), s2 = scene(w, { arbiter, effect });
  const t1 = s1.m.requestFlash(); assert.equal(t1.status, 'accepted'); s1.m.flashAnimations().forEach(a => a.finish()); await t1.done;
  c.add(3999.9); const r = s2.m.requestFlash(); assert.equal(r.reason, 'cooldown'); assert.ok(r.retryAfterMs > 0 && r.retryAfterMs < 1);
  c.add(.1); assert.equal(s2.m.requestFlash().status, 'accepted', 'exactly 4000 ms after the START of the first pulse');
});

test('four storm scenes, one request each in the same tick: one pulse total, the rest refused active (aggregate = one pulse)', () => {
  const { arbiter, effect } = kit(), w = makeWorld(), scenes = [0, 1, 2, 3].map(() => scene(w, { arbiter, effect }));
  const res = scenes.map(s => s.m.requestFlash());
  assert.deepEqual(res.map(r => r.status), ['accepted', 'refused', 'refused', 'refused']); assert.deepEqual(res.slice(1).map(r => r.reason), ['active', 'active', 'active']);
  assert.equal(scenes.filter(s => s.root.querySelector('[data-p26-flash]')).length, 1); assert.equal(w.live().filter(a => a.target.getAttribute('data-p26-flash-target')).length, 2);
  assert.equal(arbiter.snapshot().stats.accepted, 1);
});

test('late callbacks and teardown: destroy after finish, destroy twice mid-pulse, watchdog cancel, watchdog cleared on finish', async () => {
  {
    const { arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect }), t = m.requestFlash();
    m.flashAnimations().forEach(a => a.finish()); assert.equal((await t.done).status, 'finished'); m.destroy(); m.destroy(); await flush();
    assert.equal((await t.done).status, 'finished', 'destroy after finish cannot turn it into cancelled'); assert.equal(root.querySelector('[data-p26-flash]'), null);
  }
  { const { arbiter, effect } = kit(), w = makeWorld(), { m } = scene(w, { arbiter, effect }), t = m.requestFlash(); m.destroy(); m.destroy(); assert.equal((await t.done).status, 'cancelled'); assert.equal(arbiter.snapshot().stats.cancelled, 1); }
  {
    const { c, t: tm, arbiter, effect } = kit(), w = makeWorld(), { root, m } = scene(w, { arbiter, effect }), t = m.requestFlash();
    assert.equal(tm.list.length, 1); assert.equal(tm.list[0].ms, 600 + 1500);
    tm.fire(0); assert.deepEqual(await t.done, { status: 'cancelled', id: t.id, reason: 'watchdog' }, 'the watchdog reason survives to the ticket'); assert.equal(root.querySelector('[data-p26-flash]'), null); assert.equal(m.state().flashActive, false);
    c.add(4000); assert.equal(m.requestFlash().status, 'accepted', 'a watchdog-cancelled pulse frees the scene after the cooldown');
  }
  { const { arbiter, effect, t: tm } = kit(), w = makeWorld(), { m } = scene(w, { arbiter, effect }), t = m.requestFlash(); m.flashAnimations().forEach(a => a.finish()); await t.done; assert.equal(tm.list[0].cleared, true, 'watchdog cleared on finish'); }
});

test('an effect start failure after acceptance rolls back the overlay and returns the ACCEPTED ticket already cancelled (budget spent, no refund, no visual claimed)', async () => {
  const c = clock(), arbiter = createFlashArbiter({ now: c.now }), effect = createLightningEffect({ schedule: () => () => {} }), w = makeWorld(), { root, m } = scene(w, { arbiter, effect });
  const spill = root.querySelector('[data-p26="window-spill"]').parentNode, real = spill.insertBefore.bind(spill); spill.insertBefore = () => { throw new Error('boom'); };
  const r = m.requestFlash(); spill.insertBefore = real;
  assert.equal(r.status, 'accepted'); assert.deepEqual(await r.done, { status: 'cancelled', id: r.id, reason: 'effect-start-failed' });
  assert.equal(root.querySelector('[data-p26-flash]'), null, 'partial overlay rolled back'); assert.equal(arbiter.snapshot().activeId, null); assert.equal(m.state().flashActive, false);
  assert.deepEqual([arbiter.snapshot().stats.accepted, arbiter.snapshot().stats.cancelled, arbiter.snapshot().stats.finished], [1, 1, 0]);
  c.add(100); assert.equal(m.requestFlash().reason, 'cooldown');
});
