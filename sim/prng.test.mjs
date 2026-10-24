import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng, restoreRng } from './prng.mjs';

const take = (rng, n) => Array.from({ length: n }, () => rng.next());

test('same seed replays the same sequence; numeric and string seeds normalize alike', () => {
  assert.deepEqual(take(createRng('abc'), 50), take(createRng('abc'), 50));
  assert.deepEqual(take(createRng(42), 10), take(createRng('42'), 10));
});

test('different seeds diverge', () => {
  assert.notDeepEqual(take(createRng('a'), 5), take(createRng('b'), 5));
  assert.notDeepEqual(take(createRng(1), 5), take(createRng(2), 5));
});

test('pinned reference values detect an accidental algorithm change (sfc32 + cyrb128, 15 warm-up draws)', () => {
  const r = createRng('quackpot');
  assert.equal(r.next(), 0.15019973507151008);
  assert.equal(r.next(), 0.33036871650256217);
  assert.equal(r.int(1000), 188);
  assert.equal(createRng('quackpot').fork('draw').int(1000000), 378561);
});

test('serialize/restore continues exactly where the original left off', () => {
  const a = createRng('save-me');
  take(a, 37);
  const snap = a.serialize();
  const expected = take(a, 25);
  const b = restoreRng(snap);
  assert.deepEqual(take(b, 25), expected);
  assert.equal(typeof snap, 'string');
  assert.equal(JSON.parse(snap).alg, 'sfc32');
});

test('restoring rejects unknown snapshots', () => {
  assert.throws(() => restoreRng('{"v":2}'));
});

test('fork depends only on key path and label, not on parent consumption', () => {
  const p1 = createRng('root');
  const p2 = createRng('root');
  take(p2, 1000);
  assert.deepEqual(take(p1.fork('draw'), 20), take(p2.fork('draw'), 20));
});

test('fork labels are independent streams, and the same label twice is identical', () => {
  const p = createRng('root');
  assert.notDeepEqual(take(p.fork('draw'), 10), take(p.fork('event'), 10));
  assert.deepEqual(take(p.fork('draw'), 10), take(p.fork('draw'), 10));
  assert.notDeepEqual(take(p.fork('draw'), 10), take(p, 10));
});

test('forks of a restored rng match forks of the original', () => {
  const a = createRng('root');
  take(a, 9);
  const b = restoreRng(a.serialize());
  assert.deepEqual(take(a.fork('x'), 10), take(b.fork('x'), 10));
  assert.deepEqual(take(a.fork('x').fork('y'), 10), take(b.fork('x').fork('y'), 10));
});

test('forked stream state serializes and restores', () => {
  const f = createRng('root').fork('draw');
  take(f, 5);
  const g = restoreRng(f.serialize());
  assert.deepEqual(take(f, 10), take(g, 10));
});

test('int, range, pick, weighted stay in bounds and look roughly uniform', () => {
  const r = createRng('dist');
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < 40000; i++) counts[r.int(4)]++;
  for (const c of counts) assert.ok(Math.abs(c - 10000) < 400, `bucket ${c}`);
  for (let i = 0; i < 1000; i++) {
    const v = r.range(3, 5);
    assert.ok(v >= 3 && v <= 5);
  }
  const w = [0, 0, 0];
  for (let i = 0; i < 30000; i++) w[r.weighted([1, 0, 3])]++;
  assert.equal(w[1], 0);
  assert.ok(Math.abs(w[2] / 30000 - 0.75) < 0.02);
  assert.throws(() => r.int(0));
  assert.throws(() => r.pick([]));
  assert.throws(() => r.weighted([0, 0]));
});

test('next() stays in [0, 1)', () => {
  const r = createRng('range');
  for (let i = 0; i < 20000; i++) {
    const x = r.next();
    assert.ok(x >= 0 && x < 1);
  }
});
