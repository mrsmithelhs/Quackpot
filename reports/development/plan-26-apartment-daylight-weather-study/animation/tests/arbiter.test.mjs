import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlashArbiter } from '../arbiter.mjs';

const clockAt = () => { let t = 1000; return { now: () => t, set: v => { t = v; }, add: v => { t += v; } }; };

test('first request is accepted; second inside four seconds is refused with retryAfterMs', () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now });
  const t1 = a.request({ requester: 'A' });
  assert.equal(t1.status, 'accepted');
  t1.finish();
  c.add(1000);
  const r = a.request({ requester: 'B' });
  assert.deepEqual([r.status, r.reason, r.retryAfterMs], ['refused', 'cooldown', 3000]);
});

test('exact boundary: 3999.9 ms refused, 4000 ms accepted', () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now });
  a.request().finish();
  c.add(3999.9); assert.equal(a.request().reason, 'cooldown');
  c.add(.1); assert.equal(a.request().status, 'accepted');
});

test('a refused request is never queued, never extends the cooldown and never starts later', () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now });
  a.request().finish();
  c.add(3000); assert.equal(a.request().status, 'refused');       // refused at 3000 ms
  c.add(1000);                                                    // 4000 ms after the ACCEPTED pulse (not after the refusal)
  assert.equal(a.snapshot().stats.accepted, 1, 'nothing auto-started');
  assert.equal(a.request().status, 'accepted');
  assert.equal(a.snapshot().stats.accepted, 2);
});

test('an unsettled pulse refuses as active even when the cooldown has elapsed', () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now });
  const t = a.request(); c.add(9000);
  const r = a.request(); assert.equal(r.reason, 'active'); assert.equal(r.retryAfterMs, 0);
  t.finish(); assert.equal(a.request().status, 'accepted');
});

test('cancel and finish are distinct outcomes, first settle wins, cancel does not reset the cooldown', async () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now });
  const t = a.request({ requester: 'A' });
  assert.deepEqual(t.cancel('hidden'), { status: 'cancelled', id: t.id, reason: 'hidden' });
  assert.deepEqual(t.finish(), { status: 'cancelled', id: t.id, reason: 'hidden' }, 'repeat returns the first outcome');
  assert.deepEqual(await t.done, { status: 'cancelled', id: t.id, reason: 'hidden' });
  c.add(500); assert.equal(a.request().reason, 'cooldown', 'cancelled pulse still counts');
  c.add(3500);
  const u = a.request(); u.finish();
  assert.deepEqual(await u.done, { status: 'finished', id: u.id });
  assert.deepEqual(a.snapshot().stats, { accepted: 2, refusedCooldown: 1, refusedActive: 0, finished: 1, cancelled: 1 });
});

test('a clock that steps backwards cannot open a window', () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now });
  a.request().finish();
  c.set(0); assert.equal(a.request().reason, 'cooldown');
  c.set(1000 + 3999); assert.equal(a.request().reason, 'cooldown');
  c.set(1000 + 4000); assert.equal(a.request().status, 'accepted');
});

test('configuration is validated', () => {
  assert.throws(() => createFlashArbiter({ cooldownMs: 3999 }), RangeError);
  assert.throws(() => createFlashArbiter({ cooldownMs: NaN }), RangeError);
  assert.throws(() => createFlashArbiter({ now: 5 }), TypeError);
  assert.throws(() => createFlashArbiter({ now: () => NaN }).request(), TypeError);
  assert.equal(createFlashArbiter().cooldownMs, 4000);
  const c = clockAt(), a = createFlashArbiter({ now: c.now, cooldownMs: 6000 });
  a.request().finish(); c.add(5999); assert.equal(a.request().reason, 'cooldown'); c.add(1); assert.equal(a.request().status, 'accepted');
});

test('rolling window: with only accepted pulses, no more than one starts in any 4 s window of a long burst of attempts', () => {
  const c = clockAt(), a = createFlashArbiter({ now: c.now }), starts = [];
  for (let i = 0; i < 2000; i++) { const t = a.request(); if (t.status === 'accepted') { starts.push(c.now()); t.finish(); } c.add(37); }
  for (let i = 1; i < starts.length; i++) assert.ok(starts[i] - starts[i - 1] >= 4000);
  assert.ok(starts.length > 10);
});
