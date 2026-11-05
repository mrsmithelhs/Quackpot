import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIMIT, Q, TURN, checked, cordic, isqrt, parseCanonicalInteger, roundEven, squareDistanceContact, vectorAngle, wrapTurns } from './integer-math.mjs';
import { boundaryDecision, ratingTarget } from './decision-probe.mjs';
import { BEND, integerFrame } from './course-probe.mjs';
import { decodeProbeState, encodeProbeState, probeDraw } from './canonical-probe.mjs';

const data = JSON.parse(readFileSync(new URL('./reference-v1.json', import.meta.url), 'utf8'));
test('signed ties-to-even, wrap, bounds and canonical decimal inputs', () => {
  assert.deepEqual([roundEven(5n, 2n), roundEven(7n, 2n), roundEven(-5n, 2n), roundEven(-7n, 2n)], [2n, 4n, -2n, -4n]);
  assert.equal(wrapTurns(-1n), TURN - 1n);
  assert.throws(() => checked(LIMIT + 1n), RangeError);
  for (const value of ['-0', '+1', '01', '1.0', '9'.repeat(41)]) assert.throws(() => parseCanonicalInteger(value), RangeError);
});

test('finite Decimal reference vectors measure CORDIC rotation error', (t) => {
  let maxError = 0n;
  for (const vector of data.vectors) {
    const result = cordic(BigInt(vector.angle), data);
    for (const error of [result.sin - BigInt(vector.sin_q62), result.cos - BigInt(vector.cos_q62)]) {
      const abs = error < 0n ? -error : error;
      if (abs > maxError) maxError = abs;
    }
  }
  t.diagnostic(`max component error ${maxError} Q62 units; ${Number(maxError) / Number(Q)} unit vector`);
  // A finite-screen sanity threshold, not a general or proved error bound.
  assert.ok(maxError < Q / 1000000n);
});

test('integer threshold, explicit tie, rating composition and no-progress guard', () => {
  assert.equal(squareDistanceContact(999999n, 0n, 1000000n), true);
  assert.equal(squareDistanceContact(1000000n, 0n, 1000000n), true);
  assert.equal(squareDistanceContact(1000001n, 0n, 1000000n), false);
  assert.deepEqual(ratingTarget(10000000n, 500000n, 1000000n, true), { rating: 4500000n, affine: 10500000n });
  assert.deepEqual(boundaryDecision({ dx: 1000000n, dy: 0n, diameter: 1000000n, finishDelta: 500000n, velocity: 10000000n, dtMicros: 50000n }).order, ['contact', 'crossing']);
  assert.equal(boundaryDecision({ dx: 2000000n, dy: 0n, diameter: 1000000n, finishDelta: 1n, velocity: 1n, dtMicros: 1n }).reason, 'rounded-no-progress');
});

test('integer square root and vectoring cover quadrants, axes and small vectors', (t) => {
  for (const n of [0n, 1n, 2n, 3n, 4n, 15n, 16n, LIMIT]) {
    const root = isqrt(n);
    assert.ok(root * root <= n && (root + 1n) * (root + 1n) > n);
  }
  assert.throws(() => isqrt(-1n), RangeError);
  assert.throws(() => vectorAngle(0n, 0n, data), RangeError);
  for (const [x, y, expected] of [[1n,0n,0n], [0n,1n,TURN/4n], [-1n,0n,TURN/2n], [0n,-1n,3n*TURN/4n]])
    assert.equal(vectorAngle(x, y, data), expected);
  for (const [x, y, expected] of [[1n,1n,TURN/8n], [-1n,1n,3n*TURN/8n], [-1n,-1n,5n*TURN/8n], [1n,-1n,7n*TURN/8n]])
    assert.equal(vectorAngle(x, y, data), expected);
  assert.throws(() => vectorAngle(1n << 101n, 1n, data), RangeError);
  let max = 0n;
  for (const v of data.vectors) {
    const actual = vectorAngle(BigInt(v.cos_q62), BigInt(v.sin_q62), data), expected = BigInt(v.angle);
    const raw = (actual - expected + TURN) % TURN, error = raw > TURN / 2n ? TURN - raw : raw;
    if (error > max) max = error;
  }
  t.diagnostic(`max vectoring angle error ${max} turn ticks in ${data.vectors.length} fixed vectors`);
  assert.ok(max <= 16n); // finite-vector check, not a general bound
});

test('integer oval frame at joins and bounded fixed workload', (t) => {
  const a = integerFrame(0n, 0n, data);
  assert.deepEqual({ x: a.x, y: a.y }, { x: 0n, y: -20000000n });
  const joins = [30000000n, 30000000n + BEND, 90000000n + BEND];
  const expected = [[30000000n,-20000000n],[30000000n,20000000n],[-30000000n,20000000n]];
  joins.forEach((p, i) => {
    const f = integerFrame(p, 0n, data);
    assert.ok((f.x - expected[i][0]) ** 2n + (f.y - expected[i][1]) ** 2n <= 4n);
  });
  const start = performance.now();
  for (let i = 0; i < 2000; i++) integerFrame(BigInt(i) * 100000n, 0n, data);
  t.diagnostic(`2000 fixed frames: ${(performance.now() - start).toFixed(3)} ms in this runtime`);
});

test('canonical probe serialization rejects malformed or oversized data', () => {
  const state = { id: 'P', progress: 10n, lateral: -2n, angle: 3n };
  assert.deepEqual(decodeProbeState(encodeProbeState(state)), state);
  for (const bad of ['{}', '{', 'x'.repeat(4097), '{"schema":"numeric-probe/v1","id":"P","progress":"-0","lateral":"0","angle":"0"}'])
    assert.throws(() => decodeProbeState(bad), RangeError);
  assert.throws(() => encodeProbeState({ ...state, progress: LIMIT + 1n }), RangeError);
});

test('domain-keyed probes do not depend on call order', () => {
  const a = probeDraw('seed', 'injury', 'A'), b = probeDraw('seed', 'injury', 'B');
  assert.notEqual(a.key, b.key);
  assert.deepEqual(probeDraw('seed', 'injury', 'A'), a);
  assert.notEqual(probeDraw('seed', 'activation', 'A').key, a.key);
  assert.throws(() => probeDraw('seed', 'injury', '\ud800'), RangeError);
});

test('integer course guard and finish decision distinguish neighboring thresholds', () => {
  assert.throws(() => integerFrame(0n, 6000001n, data), RangeError);
  for (const [delta, crossing] of [[499999n, true], [500000n, true], [500001n, false]]) {
    const result = boundaryDecision({ dx: 1000001n, dy: 0n, diameter: 1000000n, finishDelta: delta, velocity: 10000000n, dtMicros: 50000n });
    assert.equal(result.crossing, crossing);
  }
});

test('fixed straight and bend positions feed the integer contact threshold', () => {
  const contact = (p, q) => {
    const a = integerFrame(p, 0n, data), b = integerFrame(q, 0n, data);
    return squareDistanceContact(b.x - a.x, b.y - a.y, 1000000n);
  };
  assert.equal(contact(0n, 1000000n), true);
  assert.equal(contact(40000000n, 41000000n), true);
  assert.equal(contact(40000000n, 41010000n), false);
});
