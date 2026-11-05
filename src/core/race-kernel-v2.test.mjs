import test from 'node:test';
import assert from 'node:assert/strict';
import { compareIds, effectiveRaceRating, encodeKey, keyedDraw } from './race-kernel-v2.mjs';
import { advanceOvalInterval, advancePositions, commitBoundary, findOvalContact, nextBoundary, nextOvalBoundary, observeSeparation, contactImpulse } from './race-kernel-v2-boundaries.mjs';
import { acceleratedSpeed, bouncePhase, bounceThreat, crowdNeighbors, injuryChance, sampleOpportunity } from './race-kernel-v2-abilities.mjs';
import { advanceCourse, applyWorldVelocity, courseFrame, curveTargetSpeed, linearizeEntrant, recenterCorrectionDeg, targetSpeed, turnCap } from './race-kernel-v2-physics.mjs';
import * as v1 from './race-resolver.mjs';

test('keyed domains and length prefixes keep independent inputs distinct and reproducible', () => {
  assert.notEqual(encodeKey(['ab', 'c']), encodeKey(['a', 'bc']));
  assert.notEqual(encodeKey(['é']), encodeKey(['e', '\u0301']));
  const first = keyedDraw('seed', 'race', 'injury', ['A', 'B', 'A']);
  assert.deepEqual(first, keyedDraw('seed', 'race', 'injury', ['A', 'B', 'A']));
  assert.notEqual(first.key, keyedDraw('seed', 'race', 'injury', ['A', 'B', 'B']).key);
  assert.notEqual(first.key, keyedDraw('seed', 'race', 'activation', ['A', 'B', 'A']).key);
  assert.deepEqual(['b', 'A', 'a'].sort(compareIds), ['A', 'a', 'b']);
  assert.throws(() => encodeKey(['\ud800']), TypeError);
});

test('a collision invalidates a predicted crossing and failed later boundary keeps committed state', () => {
  const state = { time: 0, pairs: {}, events: [], entrants: [
    { id: 'A', x: 8, y: 0, vx: 4, vy: 0, finished: false },
    { id: 'B', x: 9.5, y: 0, vx: 1, vy: 0, finished: false },
  ] };
  const boundary = nextBoundary(state.entrants, state.pairs, 0, 1, 10);
  assert.equal(boundary.kind, 'contact');
  advancePositions(state.entrants, boundary.time);
  state.time += boundary.time;
  const committed = commitBoundary(state, boundary, () => true);
  assert.equal(committed.ok, true);
  const next = nextBoundary(committed.state.entrants, committed.state.pairs, committed.state.time, 1 - boundary.time, 10);
  assert.equal(next.ids[0], 'B');
  const failed = commitBoundary(committed.state, next, () => false);
  assert.equal(failed.ok, false);
  assert.deepEqual(failed.state, committed.state);
  assert.equal(failed.state.events.length, 1);
});

test('oval crossing uses course progress and contact wins an exact tie', () => {
  const entrants = [
    { id: 'A', x: 0, y: 0, vx: 2, vy: 0, progress: 9, progressVelocity: 2 },
    { id: 'B', x: 2, y: 0, vx: 0, vy: 0, progress: 5, progressVelocity: 0 },
  ];
  const next = nextOvalBoundary(entrants, {}, 0, 1, 10);
  assert.equal(next.kind, 'contact');
  assert.equal(next.time, 0.5);
});

test('contact pair rearms only after both separation and elapsed interval', () => {
  const entrants = [
    { id: 'A', x: 0, y: 0, vx: 1, vy: 0 },
    { id: 'B', x: 1.3, y: 0, vx: 0, vy: 0 },
  ];
  const key = JSON.stringify(['A', 'B']);
  const pairs = { [key]: { time: 0, separated: false } };
  assert.equal(nextBoundary(entrants, pairs, 0.6, 1, 100), null);
  observeSeparation(entrants, pairs);
  assert.equal(nextBoundary(entrants, pairs, 0.49, 1, 100), null);
  assert.equal(nextBoundary(entrants, pairs, 0.5, 1, 100).kind, 'contact');
});

test('landing protection blocks injury probability and non-closing contact creates no impulse', () => {
  const active = { startTick: 0 };
  assert.equal(bouncePhase(active, 12), 'landing');
  assert.equal(injuryChance('sprint', false, true), 0);
  assert.equal(injuryChance('sprint', true, true), 0);
  assert.equal(injuryChance('sprint', false, false), 0.1);
  const a = { id: 'A', x: 0, y: 0, vx: -1, vy: 0 };
  const b = { id: 'B', x: 0.5, y: 0, vx: 1, vy: 0 };
  assert.equal(contactImpulse(a, b).impulse, 0);
  assert.equal(a.vx, -1);
});

test('opportunity latches after a declined roll and rearms after two absent checks', () => {
  const initial = { latched: false, absentChecks: 0, cooldownUntil: 0, activeUntil: 0, opportunity: 0 };
  const first = sampleOpportunity(initial, { tick: 0, eligible: true, roll: 0.9 });
  assert.equal(first.attempted, true);
  assert.equal(first.activated, false);
  const repeat = sampleOpportunity(first.state, { tick: 5, eligible: true, roll: 0 });
  assert.equal(repeat.attempted, false);
  const absent = sampleOpportunity(repeat.state, { tick: 10, eligible: false, roll: 0 });
  const rearmed = sampleOpportunity(absent.state, { tick: 15, eligible: false, roll: 0 });
  assert.equal(sampleOpportunity(rearmed.state, { tick: 20, eligible: true, roll: 0 }).activated, true);
});

test('Bounce threat uses nearby closing participants and stable tie order', () => {
  const player = { id: 'P', x: 0, y: 0, vx: 4, vy: 0, progress: 0 };
  const rivals = ['B', 'A'].map((id) => ({ id, x: 2, y: 0, vx: 0, vy: 0, progress: 2 }));
  assert.equal(bounceThreat(player, [player, ...rivals], 100).id, 'A');
  assert.equal(bounceThreat(player, [player, { ...rivals[0], finished: true }], 100), null);
});

test('crowd neighbors use wrapped course distance and acceleration respects target', () => {
  const e = { id: 'A', x: 0, y: 0, progress: 99 };
  const others = [e, { id: 'B', x: 1, y: 0, progress: 1 }, { id: 'C', x: 2, y: 0, progress: 1001 }, { id: 'D', x: 2, y: 0, progress: 1, finished: true }];
  assert.deepEqual(crowdNeighbors(e, others, 100), ['B', 'C']);
  assert.equal(acceleratedSpeed(9, 10, 3, 0.5, true), 10);
});

test('isolated controller primitives agree with the pinned v1 reference', () => {
  for (const speed of [0, 6, 10, 20]) assert.equal(turnCap(speed), v1.turnCap(speed));
  for (const error of [-10, -1, 0, 1, 10]) assert.equal(recenterCorrectionDeg(error), v1.recenterCorrectionDeg(error));
  for (const radius of [14, 20, 26]) assert.equal(curveTargetSpeed(radius), v1.curveTargetSpeed(radius));
  const start = courseFrame(0);
  // Mathematical start is x=0; floating modulo in the reference can leave a tiny residue.
  assert.ok(Math.abs(start.x) < 1e-12);
  assert.deepEqual([start.y, start.tx, start.ty], [-20, 1, 0]);
});

test('course velocity conversion preserves recovery metadata through an impulse', () => {
  const entrant = { progress: 0, lateral: 0, speed: 8, heading: 0, recovery: { phase: 'recover' } };
  const first = linearizeEntrant(entrant);
  assert.equal(first.progressVelocity, 8);
  assert.equal(advanceCourse(entrant, 0.05).progress, 0.4);
  const after = applyWorldVelocity(entrant, 6, 2);
  assert.deepEqual(after.recovery, entrant.recovery);
  assert.equal(after.speed, Math.hypot(6, 2));
});

test('no-contact oval interval advances course state without manufacturing a crossing', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 8, heading: 0, finished: false },
    { id: 'B', progress: -4, lateral: 0, speed: 8, heading: 0, finished: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245);
  assert.equal(result.ok, true);
  assert.equal(result.state.entrants[0].progress, 0.4);
  assert.deepEqual(result.state.events, []);
  assert.equal(initial.entrants[0].progress, 0);
});

test('unsafe oval overlap stops and preserves the previous boundary', () => {
  const initial = { time: 2, events: [{ kind: 'injury', id: 'retained' }], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 8, heading: 0, finished: false },
    { id: 'B', progress: 0.5, lateral: 0, speed: 8, heading: 0, finished: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'unsafe-overlap');
  assert.deepEqual(result.state, initial);
});

test('curved search distinguishes clear and initial overlap without claiming a finish', () => {
  const a = { progress: 0, lateral: 0, speed: 8, heading: 0 };
  assert.equal(findOvalContact(a, { ...a, progress: 4 }, 0.05).status, 'clear');
  assert.equal(findOvalContact(a, { ...a, progress: 0.5 }, 0.05).status, 'initial-overlap');
});

test('curved search brackets a straight closing contact without treating a near miss as a hit', () => {
  const a = { progress: 0, lateral: 0, speed: 10, heading: 0 };
  const hit = findOvalContact(a, { ...a, progress: 1.1, speed: 0 }, 0.05);
  assert.equal(hit.status, 'contact');
  assert.ok(hit.outside <= 0.01 && hit.inside >= 0.01);
  assert.ok(hit.inside - hit.outside <= 1e-6);
  const clear = findOvalContact(a, { ...a, progress: 1.1, lateral: 2, speed: 0 }, 0.05);
  assert.equal(clear.status, 'clear');
});

test('injury reduces rating before the affine mapping and composes with rest and upgrade', () => {
  assert.deepEqual(effectiveRaceRating({ baseRating: 10, restFactor: 0.5, downFactor: 1, injured: true }), { rating: 4.5, affineSpeed: 10.5 });
  const healthy = effectiveRaceRating({ baseRating: 10, restFactor: 1, downFactor: 1.05, injured: false });
  const injured = effectiveRaceRating({ baseRating: 10, restFactor: 1, downFactor: 1.05, injured: true });
  assert.equal(injured.rating, healthy.rating * 0.9);
  assert.notEqual(injured.affineSpeed, healthy.affineSpeed * 0.9);
  const before = targetSpeed(healthy.affineSpeed, 0, 0, 6);
  const after = targetSpeed(injured.affineSpeed, 0, 0, 6);
  assert.equal(after.topSpeed, injured.affineSpeed);
  assert.ok(after.targetSpeed < before.targetSpeed);
  assert.throws(() => effectiveRaceRating({ baseRating: Infinity, restFactor: 1, downFactor: 1, injured: false }), RangeError);
});
