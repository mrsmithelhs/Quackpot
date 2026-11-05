import test from 'node:test';
import assert from 'node:assert/strict';
import { applyContactInjuries, compareIds, contactInjuries, DIAGNOSTIC_RULES, effectiveRaceRating, encodeKey, keyedDraw, resolveRaceV2, validateRaceInput } from './race-kernel-v2.mjs';
import { advanceOvalInterval, advancePositions, commitBoundary, constrainUnrearmed, correctNewContactAtWall, findOvalContact, nextBoundary, nextOvalBoundary, observeSeparation, safeNormalCorrection, contactImpulse } from './race-kernel-v2-boundaries.mjs';
import { acceleratedSpeed, advanceAbility, bouncePhase, bounceThreat, crowdEligible, crowdNeighbors, endActiveAbilities, injuryChance, sampleOpportunity } from './race-kernel-v2-abilities.mjs';
import { advanceCourse, advanceSteeringEpisode, applyWorldVelocity, courseFrame, curveTargetSpeed, linearizeEntrant, recenterCorrectionDeg, resolveWallEndpoint, steerEntrant, targetSpeed, turnCap } from './race-kernel-v2-physics.mjs';
import * as v1 from './race-resolver.mjs';

function assertPhysicalOutcome(result) {
  assert.equal(result.readiness.controller, 'validation-pending');
  assert.equal(result.readiness.production, false);
  if (result.status === 'finished') {
    assert.equal(result.unresolved, null);
    assert.equal(result.crossings.length, 6);
    assert.deepEqual(result.crossings.map((e) => e.place), [1, 2, 3, 4, 5, 6]);
  } else {
    assert.equal(result.status, 'unresolved');
    assert.ok(result.unresolved.reason);
    assert.ok(result.crossings.every((e) => e.place === null));
  }
  assert.ok(result.events.every((e, i) => !i || e.time >= result.events[i - 1].time));
  assert.ok(result.events.filter((e) => e.phase === 'tick-start').every((e) => e.boundaryFraction === 0));
  for (const event of result.events.filter((e) => e.contactId && e.kind !== 'contact')) {
    const contacts = result.events.filter((e) => e.kind === 'contact' && e.id === event.contactId);
    assert.equal(contacts.length, 1);
    assert.equal(event.time, contacts[0].time);
  }
}

test('race input validation freezes a detached bounded snapshot and rejects invalid assignments', () => {
  const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
    course: 'plan23-oval/v1', seed: 'seed', raceId: 'race', choice: 'steady',
    entrants: Array.from({ length: 6 }, (_, i) => ({ id: `E${i}`, player: i === 0, lane: i % 2 + 1, row: Math.floor(i / 2),
      baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false, ability: null, stance: 'steady' })) };
  const snapshot = validateRaceInput(input);
  assert.ok(Object.isFrozen(snapshot.entrants[0]));
  input.entrants[0].baseRating = 11;
  assert.equal(snapshot.entrants[0].baseRating, 10);
  for (const bad of [
    { ...input, numericPolicy: 'unknown' },
    { ...input, entrants: input.entrants.map((e) => ({ ...e, player: false })) },
    { ...input, entrants: input.entrants.map((e, i) => i === 1 ? { ...e, id: 'E0' } : e) },
    { ...input, entrants: input.entrants.map((e, i) => i === 1 ? { ...e, baseRating: Infinity } : e) },
  ]) assert.throws(() => validateRaceInput(bad), RangeError);
  assert.doesNotThrow(() => validateRaceInput({ ...input, rules: DIAGNOSTIC_RULES }));
  assert.throws(() => validateRaceInput({ ...input, rules: DIAGNOSTIC_RULES,
    entrants: input.entrants.map((e, i) => i === 0 ? { ...e, ability: 'bounce' } : e) }), RangeError);
  assert.throws(() => validateRaceInput({ ...input, rules: DIAGNOSTIC_RULES,
    entrants: input.entrants.map((e, i) => i === 0 ? { ...e, entryInjury: true } : e) }), RangeError);
});

test('boundary capacity retains earlier crossings and rejects wall and contact children atomically', () => {
  const filler = Array.from({ length: 510 }, (_, i) => ({ kind: 'prior', id: `prior-${i}` }));
  const finishes = { time: 0, events: structuredClone(filler), pairs: {}, entrants: Array.from({ length: 6 }, (_, i) =>
    ({ id: `E${i}`, progress: 1, lateral: -3 + i * 1.2, speed: 0, heading: 0, finished: false })) };
  const stopped = advanceOvalInterval(finishes, 0, 1);
  assert.equal(stopped.reason, 'event-cap');
  assert.equal(stopped.state.events.length, 512);
  assert.equal(stopped.state.entrants.filter((e) => e.finished).length, 2);
  const wall = { time: 0, events: Array.from({ length: 512 }, (_, i) => ({ kind: 'prior', id: `${i}` })), pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 6, speed: 1, heading: Math.PI / 2, finished: false, wallEpisode: false },
  ] };
  assert.deepEqual(advanceOvalInterval(wall, 0, 245).state, wall);
  const contact = { time: 0, events: structuredClone(filler), pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false, landing: true, stance: 'steady', injured: false, ability: null },
    { id: 'B', progress: 1, lateral: 0, speed: 0, heading: 0, finished: false, stance: 'steady', injured: false, ability: null },
  ] };
  const rejected = advanceOvalInterval(contact, 0, 245, (candidate, boundary) =>
    applyContactInjuries(candidate, boundary, { seed: 'seed', raceId: 'R', tick: 1 }));
  assert.equal(rejected.reason, 'event-cap');
  assert.deepEqual(rejected.state, contact);
});

test('contact identity survives order changes and rejected-boundary retry', () => {
  const initial = { time: 0, tick: 1, tickStart: 0, events: [], pairs: {}, entrants: [
    { id: 'B', progress: 1, lateral: 0, speed: 0, heading: 0, finished: false, stance: 'steady', injured: false, ability: null },
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false, landing: true, stance: 'steady', injured: false, ability: null },
  ] };
  const apply = (candidate, boundary) => applyContactInjuries(candidate, boundary, { seed: 'seed', raceId: 'R', tick: 1 });
  const rejected = advanceOvalInterval(initial, 0, 245, (candidate, boundary) => { apply(candidate, boundary); return false; });
  assert.deepEqual(rejected.state, initial);
  const first = advanceOvalInterval(rejected.state, 0, 245, apply);
  const reversed = advanceOvalInterval({ ...initial, entrants: [...initial.entrants].reverse() }, 0, 245, apply);
  const project = (result) => result.state.events.map(({ kind, id, contactId, participantId, time }) => ({ kind, id, contactId, participantId, time }));
  assert.deepEqual(project(first), project(reversed));
  const contact = first.state.events.find((e) => e.kind === 'contact');
  assert.equal(contact.id, contact.contactId);
  assert.equal(first.state.events.filter((e) => e.kind === 'injury-check' && e.contactId === contact.id).length, 2);
});

test('experimental race loop returns replayable physical outcome and independent readiness', () => {
  const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
    course: 'plan23-oval/v1', seed: 'seed', raceId: 'race', choice: 'steady',
    entrants: Array.from({ length: 6 }, (_, i) => ({ id: `E${i}`, player: i === 0, lane: i % 2 + 1, row: Math.floor(i / 2),
      baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false, ability: null, stance: 'steady' })) };
  const result = resolveRaceV2(input);
  assertPhysicalOutcome(result);
  assert.deepEqual(result, resolveRaceV2(input));
  assert.doesNotThrow(() => JSON.stringify(result));
});

test('fixed paired no-ability and mixed-ability inputs remain bounded', (t) => {
  for (const seed of ['pair-0', 'pair-1', 'pair-2']) {
    for (const mixed of [false, true]) {
      const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
        course: 'plan23-oval/v1', seed, raceId: 'paired', choice: 'steady',
        entrants: Array.from({ length: 6 }, (_, i) => ({ id: `E${i}`, player: i === 0, lane: i % 2 + 1, row: Math.floor(i / 2),
          baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false,
          ability: mixed && i === 0 ? 'bounce' : mixed && i === 1 ? 'crowd' : null, stance: 'steady' })) };
      const result = resolveRaceV2(input);
      assertPhysicalOutcome(result);
      assert.ok(result.events.length <= 512 && result.trajectory.length <= 801);
      const counts = Object.fromEntries([...new Set(result.events.map((e) => e.kind))].sort().map((kind) => [kind, result.events.filter((e) => e.kind === kind).length]));
      t.diagnostic(JSON.stringify({ arm: `${seed}/${mixed ? 'mixed' : 'control'}`, unresolved: result.unresolved,
        crossings: result.crossings, counts }));
    }
  }
});

test('targeted pair-1 mixed and control record current ability lifecycle', (t) => {
  for (const mixed of [false, true]) {
    const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
      course: 'plan23-oval/v1', seed: 'pair-1', raceId: 'paired', choice: 'steady',
      entrants: Array.from({ length: 6 }, (_, i) => ({ id: `E${i}`, player: i === 0, lane: i % 2 + 1, row: Math.floor(i / 2),
        baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false,
        ability: mixed && i === 0 ? 'bounce' : mixed && i === 1 ? 'crowd' : null, stance: 'steady' })) };
    const result = resolveRaceV2(input);
    assertPhysicalOutcome(result);
    const abilityEvents = result.events.filter((e) => ['opportunity', 'activation', 'termination'].includes(e.kind));
    const counts = Object.fromEntries([...new Set(result.events.map((e) => e.kind))].sort().map((kind) => [kind, result.events.filter((e) => e.kind === kind).length]));
    assert.equal(new Set(result.events.map((e) => e.id)).size, result.events.length);
    t.diagnostic(JSON.stringify({ arm: mixed ? 'mixed' : 'control', status: result.status, unresolved: result.unresolved,
      crossings: result.crossings, counts, abilityEvents }));
  }
});

test('fixed half-substep comparison remains bounded', (t) => {
  for (const seed of ['pair-0', 'pair-1']) {
    const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
      course: 'plan23-oval/v1', seed, raceId: 'paired', choice: 'steady',
      entrants: Array.from({ length: 6 }, (_, i) => ({ id: `E${i}`, player: i === 0, lane: i % 2 + 1, row: Math.floor(i / 2),
        baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false, ability: null, stance: 'steady' })) };
    const result = resolveRaceV2(input, { substepScale: 0.5 });
    assertPhysicalOutcome(result);
    assert.equal(result.substepScale, 0.5);
    const counts = Object.fromEntries([...new Set(result.events.map((e) => e.kind))].sort().map((kind) => [kind, result.events.filter((e) => e.kind === kind).length]));
    t.diagnostic(JSON.stringify({ arm: `${seed}/half`, unresolved: result.unresolved, crossings: result.crossings, counts }));
  }
});

test('finite healthy no-ability v1 control is reported without parity assumption', (t) => {
  const seed = 'pair-0', raceId = 'paired';
  const specs = [['A', 1, 0], ['P', 2, 0], ['B', 1, 1], ['C', 2, 1], ['D', 1, 2], ['E', 2, 2]];
  const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
    course: 'plan23-oval/v1', seed, raceId, choice: 'steady', entrants: specs.map(([id, lane, row]) => ({ id, lane, row,
      player: id === 'P', baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false, ability: null, stance: 'steady' })) };
  const candidate = resolveRaceV2(input);
  const reference = v1.resolveSeededRace({ seed, raceId, playerBaseSpeed: 10, fieldBaseSpeed: 10, restFactor: 1,
    choice: 'steady', trialCommitted: false, trialMultiplier: 1.05, experiment: 'weave-rank-strong-contact',
    dramaArm: 'R2combined-risk-only', studySprintMean: 1 });
  assertPhysicalOutcome(candidate);
  const counts = Object.fromEntries([...new Set(candidate.events.map((e) => e.kind))].sort().map((kind) => [kind, candidate.events.filter((e) => e.kind === kind).length]));
  t.diagnostic(JSON.stringify({ v2: { unresolved: candidate.unresolved, crossings: candidate.crossings, counts },
    v1: { status: reference.status, unresolvedReason: reference.unresolvedReason,
      crossings: reference.finishCrossings.map(({ id, crossingTimeSeconds }) => ({ id, time: crossingTimeSeconds })) } }));
});

test('diagnostic controls compare same-input reference behavior without injury or ability', (t) => {
  const specs = [['A', 1, 0], ['P', 2, 0], ['B', 1, 1], ['C', 2, 1], ['D', 1, 2], ['E', 2, 2]];
  const sample = (trajectory) => [trajectory[0], trajectory[Math.floor((trajectory.length - 1) / 2)], trajectory.at(-1)];
  for (const seed of ['pair-0', 'pair-1', 'pair-2']) {
    const raceId = 'paired';
    const input = { schema: 'quackpot.race-input/v2', rules: DIAGNOSTIC_RULES, numericPolicy: 'native-float-experimental/v1',
      course: 'plan23-oval/v1', seed, raceId, choice: 'steady', entrants: specs.map(([id, lane, row]) => ({ id, lane, row,
        player: id === 'P', baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false, ability: null, stance: 'steady' })) };
    const candidate = resolveRaceV2(input);
    const reference = v1.resolveSeededRace({ seed, raceId, playerBaseSpeed: 10, fieldBaseSpeed: 10, restFactor: 1,
      choice: 'steady', trialCommitted: false, trialMultiplier: 1.05, experiment: 'weave-rank-strong-contact',
      dramaArm: 'R2combined-risk-only', studySprintMean: 1 });
    assertPhysicalOutcome(candidate);
    assert.ok(candidate.entrants.every((e) => !e.finalInjury));
    assert.ok(candidate.events.filter((e) => e.kind === 'injury-check').every((e) => e.chance === 0 && e.draw === null));
    const counts = (events, key) => Object.fromEntries([...new Set(events.map((e) => e[key]))].sort().map((kind) => [kind, events.filter((e) => e[key] === kind).length]));
    t.diagnostic(JSON.stringify({ seed, label: 'same-input reference behavior; keyed streams differ',
      v2: { unresolved: candidate.unresolved, crossings: candidate.crossings, counts: counts(candidate.events, 'kind'), trajectory: sample(candidate.trajectory) },
      v1: { status: reference.status, unresolvedReason: reference.unresolvedReason,
        crossings: reference.finishCrossings.map(({ id, crossingTimeSeconds }) => ({ id, time: crossingTimeSeconds })),
        counts: counts(reference.eventRecords, 'type'), trajectory: sample(reference.trajectory) } }));
  }
});

test('diagnostic pair-0 boundary evidence', (t) => {
  const input = { schema: 'quackpot.race-input/v2', rules: 'plan59-working/v1', numericPolicy: 'native-float-experimental/v1',
    course: 'plan23-oval/v1', seed: 'pair-0', raceId: 'paired', choice: 'steady',
    entrants: Array.from({ length: 6 }, (_, i) => ({ id: `E${i}`, player: i === 0, lane: i % 2 + 1, row: Math.floor(i / 2),
      baseRating: 10, restFactor: 1, downFactor: 1, entryInjury: false, ability: null, stance: 'steady' })) };
  const result = resolveRaceV2(input);
  assertPhysicalOutcome(result);
  t.diagnostic(JSON.stringify({ unresolved: result.unresolved, crossings: result.crossings }));
});

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

test('contact injuries preserve an existing injury and independently key the other participant', () => {
  const a = { id: 'A', stance: 'steady', injured: true, ability: 'bounce', bounceState: { startTick: 0 } };
  const b = { id: 'B', stance: 'sprint', injured: false, ability: null };
  const result = contactInjuries({ seed: 'seed', raceId: 'R', contactId: 'R-A-B-1', tick: 12, participants: [a, b] });
  assert.equal(result[0].injured, true);
  assert.equal(result[0].protected, true);
  assert.equal(result[1].chance, 0.1);
  const reversed = contactInjuries({ seed: 'seed', raceId: 'R', contactId: 'R-A-B-1', tick: 12, participants: [b, a] });
  assert.deepEqual(result[1], reversed[0]);
  assert.equal(result[0].draw, null);
  const diagnostic = contactInjuries({ seed: 'seed', raceId: 'R', contactId: 'R-A-B-1', tick: 12,
    participants: [a, b], diagnosticNoInjury: true });
  assert.equal(diagnostic[1].chance, 0);
  assert.equal(diagnostic[1].draw, null);
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

test('ability transition records activation and termination, then enforces cooldown', () => {
  const initial = { latched: false, absentChecks: 0, cooldownUntil: 0, activeUntil: 0, opportunity: 0, startTick: null };
  const draw = () => ({ value: 0.2, key: 'key' });
  const active = advanceAbility(initial, { kind: 'bounce', tick: 0, eligible: true, draw });
  assert.deepEqual(active.events.map((event) => event.kind), ['opportunity', 'activation']);
  assert.equal(bouncePhase(active.state, 12), 'landing');
  const ended = advanceAbility(active.state, { kind: 'bounce', tick: 14, eligible: false, draw });
  assert.equal(ended.events[0].kind, 'termination');
  assert.equal(ended.state.cooldownUntil, 54);
  assert.equal(initial.startTick, null);
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

test('crowd is equally eligible during weave and recovery without repeat activation', () => {
  const self = { id: 'A', x: 0, y: 0, progress: 0 };
  const others = [{ id: 'B', x: 1, y: 0, progress: 1 }, { id: 'C', x: 2, y: 0, progress: 2 }];
  const initial = { latched: false, absentChecks: 0, cooldownUntil: 0, activeUntil: 0, opportunity: 0, startTick: null };
  for (const phase of ['acquire', 'recover']) {
    const e = { ...self, steeringEpisode: { kind: 'weave', phase } };
    assert.equal(crowdEligible(e, [e, ...others], 100), true);
    let draws = 0;
    const draw = () => { draws++; return { value: 0.1, key: 'fixed' }; };
    const first = advanceAbility(initial, { kind: 'crowd', tick: 0, eligible: true, draw });
    const repeated = advanceAbility(first.state, { kind: 'crowd', tick: 5, eligible: true, draw });
    assert.equal(first.events.filter((event) => event.kind === 'activation').length, 1);
    assert.equal(repeated.events.length, 0);
    assert.equal(draws, 1);
  }
  assert.equal(crowdEligible({ ...self, airborne: true }, [self, ...others], 100), false);
});

test('ability active at finish terminates once at crossing with reserved capacity', () => {
  const abilityState = { latched: true, absentChecks: 0, cooldownUntil: 0, activeUntil: 20, opportunity: 1, startTick: 2 };
  const initial = { time: 0.2, tick: 5, tickStart: 0.2, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 1, lateral: 0, speed: 0, heading: 0, finished: false, ability: 'crowd', abilityState },
  ] };
  const result = advanceOvalInterval(initial, 0, 1);
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.events.map((e) => e.kind), ['crossing', 'termination']);
  assert.equal(result.state.events[1].reason, 'finish');
  assert.equal(result.state.events[1].time, result.state.events[0].time);
  assert.equal(result.state.entrants[0].abilityState.startTick, null);
  const full = { ...initial, events: Array.from({ length: 511 }, (_, i) => ({ kind: 'prior', id: `p${i}` })) };
  const stopped = advanceOvalInterval(full, 0, 1);
  assert.equal(stopped.reason, 'event-cap');
  assert.deepEqual(stopped.state, full);
  assert.equal(endActiveAbilities(stopped.state, { reason: 'unresolved', ids: ['A'], tick: 5, time: 0.2, tickStart: 0.2 }), true);
  assert.equal(stopped.state.events.length, 512);
  assert.equal(stopped.state.events.at(-1).reason, 'unresolved');
});

test('ability unresolved closeout excludes rolled-back activation and is idempotent', () => {
  const active = { latched: true, absentChecks: 0, cooldownUntil: 0, activeUntil: 20, opportunity: 1, startTick: 0 };
  const idle = { latched: false, absentChecks: 0, cooldownUntil: 0, activeUntil: 0, opportunity: 0, startTick: null };
  const initial = { time: 0.1, tick: 3, tickStart: 0.1, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false, landing: true, ability: 'bounce', abilityState: active },
    { id: 'B', progress: 1, lateral: 0, speed: 0, heading: 0, finished: false, ability: 'crowd', abilityState: idle },
  ] };
  const rejected = advanceOvalInterval(initial, 0, 245, (draft) => {
    draft.entrants[1].abilityState.startTick = 3;
    return false;
  });
  assert.equal(rejected.reason, 'contact-rejected');
  assert.deepEqual(rejected.state, initial);
  assert.equal(endActiveAbilities(rejected.state, { reason: 'unresolved', ids: ['A', 'B'], tick: 3, time: 0.1, tickStart: 0.1 }), true);
  assert.equal(rejected.state.events.length, 1);
  assert.equal(rejected.state.events[0].participantId, 'A');
  assert.equal(rejected.state.events[0].time, 0.1);
  assert.equal(endActiveAbilities(rejected.state, { reason: 'unresolved', ids: ['A', 'B'], tick: 3, time: 0.1, tickStart: 0.1 }), true);
  assert.equal(rejected.state.events.length, 1);
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

test('steering respects the turn cap and leaves the input snapshot unchanged', () => {
  const entrant = { progress: 0, lateral: 1, speed: 8, heading: 0, assignedLaneOffset: 0,
    steeringEpisode: null, leaderSlowdownCount: 0, leaderSlowdownUntil: 0 };
  const result = steerEntrant(entrant, 1, 1, false);
  assert.ok(result.heading < 0);
  assert.ok(Math.abs(result.heading) <= turnCap(8) * Math.PI / 180 * 0.05);
  assert.equal(entrant.heading, 0);
});

test('independent controller transitions acquisition, hold, timeout and recovery after movement', () => {
  const e = { progress: 0, lateral: 0, speed: 8, heading: 12 * Math.PI / 180, assignedLaneOffset: 0,
    leaderSlowdownCount: 0, leaderSlowdownUntil: 0,
    steeringEpisode: { kind: 'weave', phase: 'acquire', startTick: 1, sign: 1, targetOffsetDeg: 12, heldTicks: 0, centeredTicks: 0 } };
  const held = advanceSteeringEpisode(e, 2, 1);
  assert.equal(held.steeringEpisode.phase, 'hold');
  assert.equal(held.leaderSlowdownUntil, 23);
  assert.equal(e.steeringEpisode.phase, 'acquire');
  const completedHold = advanceSteeringEpisode({ ...held, steeringEpisode: { ...held.steeringEpisode, heldTicks: 9 } }, 3, 1);
  assert.equal(completedHold.steeringEpisode.phase, 'recover');
  const timeout = advanceSteeringEpisode({ ...e, heading: 0 }, 21, 4);
  assert.equal(timeout.steeringEpisode.phase, 'recover');
  const recovered = advanceSteeringEpisode({ ...completedHold, heading: 0,
    steeringEpisode: { ...completedHold.steeringEpisode, centeredTicks: 2 } }, 4, 1);
  assert.equal(recovered.steeringEpisode, null);
});

test('independent wall endpoint reproduces Plan 23 damping, restitution and rearm', () => {
  const entrant = { id: 'A', progress: 0, lateral: 6.1, speed: 10, heading: Math.PI / 4, wallEpisode: false };
  const result = resolveWallEndpoint(entrant, 5);
  const component = 10 / Math.sqrt(2);
  assert.equal(result.event.kind, 'wall-impact');
  assert.equal(result.entrant.lateral, 6);
  assert.ok(Math.abs(result.entrant.speed - Math.hypot(component * 0.9, component * 0.25)) < 1e-12);
  assert.equal(entrant.lateral, 6.1);
  assert.equal(resolveWallEndpoint({ ...result.entrant, lateral: 6.1 }, 6).event, null);
  assert.equal(resolveWallEndpoint({ ...result.entrant, lateral: 5.9 }, 7).entrant.wallEpisode, false);
  const away = resolveWallEndpoint({ ...entrant, heading: -Math.PI / 4 }, 8);
  assert.equal(away.event.kind, 'wall-overlap');
  assert.equal(away.entrant.speed, entrant.speed);
});

test('wall reflection opposes signed normal velocity on both sides', () => {
  for (const side of [-1, 1]) {
    const entrant = { id: 'A', progress: 0, lateral: side * 6.1, speed: 10,
      heading: side * Math.PI / 4, wallEpisode: false };
    const result = resolveWallEndpoint(entrant, 1);
    const normal = linearizeEntrant(result.entrant).lateralVelocity;
    assert.ok(normal * side < 0);
    assert.ok(Math.abs(normal + side * (10 / Math.sqrt(2)) * 0.25) < 1e-12);
  }
});

test('wall constraint has exact local zero outward normal and preserves inward motion', () => {
  const progress = 45, frame = courseFrame(progress, 6);
  const tangent = Math.atan2(frame.ty, frame.tx);
  const outward = { progress, lateral: 6, speed: 10, heading: tangent + Math.PI / 4, wallConstrained: true };
  const constrained = linearizeEntrant(outward);
  assert.equal(constrained.lateralVelocity, 0);
  assert.equal(outward.heading, tangent + Math.PI / 4);
  const inward = linearizeEntrant({ ...outward, heading: tangent - Math.PI / 4 });
  assert.ok(inward.lateralVelocity < 0);
});

test('wall interval resolves at the corridor boundary without forcing progress', () => {
  const initial = { time: 0, tick: 3, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 5.9, speed: 10, heading: Math.PI / 2, finished: false, wallEpisode: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245);
  assert.equal(result.ok, true);
  assert.equal(result.state.events[0].kind, 'wall-impact');
  assert.ok(Math.abs(result.state.events[0].time - 0.01) < 1e-12);
  assert.ok(result.state.entrants[0].lateral < 6);
  assert.ok(Math.abs(result.state.entrants[0].progress) < 1e-12);
  assert.equal(initial.entrants[0].lateral, 5.9);
});

test('wall at a crossing boundary is resolved before the crossing', () => {
  const initial = { time: 0, tick: 1, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 5.9, speed: 10 * Math.sqrt(2), heading: Math.PI / 4, finished: false, wallEpisode: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 0.1);
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.events.map((event) => event.kind), ['wall-impact', 'crossing']);
  assert.equal(result.state.events[1].ids[0], 'A');
});

test('wall shares a boundary with landing contact without duplicating its impulse', () => {
  const initial = { time: 0, tick: 1, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 6, speed: 1, heading: Math.PI / 2, finished: false, wallEpisode: false },
    { id: 'B', progress: 0, lateral: 5, speed: 0, heading: 0, finished: false, landing: true, wallEpisode: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245);
  assert.deepEqual(result.state.events.slice(0, 2).map((event) => event.kind), ['contact', 'wall-impact']);
  assert.equal(result.state.events.filter((event) => event.kind === 'contact').length, 1);
  assert.equal(result.state.events[0].impulse, 0);
});

test('constraint wall prevents repeat impacts and rearms only inside the corridor', () => {
  const initial = { time: 0, tick: 1, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 6, speed: 1, heading: Math.PI / 2, finished: false, wallEpisode: true },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245);
  assert.equal(result.ok, true);
  assert.equal(result.state.events.filter((event) => event.kind === 'wall-impact').length, 0);
  assert.equal(result.state.events.filter((event) => event.kind === 'wall-constraint').length, 1);
  assert.equal(result.state.entrants[0].wallEpisode, true);
  const next = { ...result.state, events: [], entrants: [{ ...result.state.entrants[0], lateral: 5.9, speed: 4, heading: Math.PI / 2 }] };
  const reimpact = advanceOvalInterval(next, 0.05, 245);
  assert.equal(reimpact.ok, true);
  assert.equal(reimpact.state.events.filter((event) => event.kind === 'wall-impact').length, 1);
});

test('constraint pair pressure converges without a new collision or timer reset', () => {
  const pairs = { '["A","B"]': { time: 0, separated: false }, '["B","C"]': { time: 0, separated: false } };
  const initial = { time: 0.1, events: [], pairs, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 1, heading: 0, finished: false },
    { id: 'B', progress: 0.95, lateral: 0, speed: 0, heading: 0, finished: false },
    { id: 'C', progress: 1.9, lateral: 0, speed: 0, heading: 0, finished: false },
  ] };
  let callbacks = 0;
  const result = advanceOvalInterval(initial, 0, 245, () => { callbacks++; return true; });
  assert.equal(result.ok, true);
  assert.equal(callbacks, 0);
  assert.equal(result.state.events.filter((event) => event.kind === 'contact').length, 0);
  assert.equal(result.state.events[0].kind, 'contact-constraint');
  assert.ok(result.state.events[0].passes > 1);
  assert.deepEqual(result.state.pairs, pairs);
});

test('constraint correction near finish rolls back the full candidate', () => {
  const initial = { time: 0.1, events: [{ kind: 'injury', id: 'committed' }],
    pairs: { '["A","B"]': { time: 0, separated: false } }, entrants: [
      { id: 'A', progress: 0.09, lateral: 0, speed: 0, heading: 0, finished: false },
      { id: 'B', progress: 1.08, lateral: 0, speed: 0, heading: 0, finished: false },
    ] };
  const result = constrainUnrearmed(initial, 1.08);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'constraint-crosses-boundary');
  assert.deepEqual(result.state, initial);
});

test('constraint pair may create a new episode only after separation and half a second', () => {
  const initial = { time: 0.6, events: [], pairs: { '["A","B"]': { time: 0, separated: true } }, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 10, heading: 0, finished: false },
    { id: 'B', progress: 1.1, lateral: 0, speed: 0, heading: 0, finished: false },
  ] };
  let callbacks = 0;
  const result = advanceOvalInterval(initial, 0.05, 245, () => { callbacks++; return true; });
  assert.equal(result.ok, true);
  assert.equal(callbacks, 1);
  assert.equal(result.state.events.filter((event) => event.kind === 'contact').length, 1);
  assert.ok(result.state.pairs['["A","B"]'].time > 0.6);
});

test('joint new-contact wall witness commits one event without correction finish credit', () => {
  const afterE = { id: 'E', progress: 187.95390879654408, lateral: -5.936353397621446, speed: 9.941002766601741, heading: -1.6527866700481881, finished: false, stance: 'steady', injured: false, ability: null };
  const p = { id: 'P', progress: 187.18523722435205, lateral: -6, speed: 9.89820718858391, heading: -1.5865091040500512, finished: false, wallEpisode: true, wallConstrained: true, stance: 'steady', injured: false, ability: null };
  // The rejected-boundary receipt captured E after its tentative correction;
  // invert that logged correction to reconstruct the pre-boundary fixture.
  let e = { ...afterE };
  for (let i = 0; i < 12; i++) {
    const x = linearizeEntrant(e), y = linearizeEntrant(p), f = courseFrame(e.progress, e.lateral);
    const dx = y.x - x.x, dy = y.y - x.y, distance = Math.hypot(dx, dy), amount = 0.0013992461140339692;
    const wx = -amount * dx / distance, wy = -amount * dy / distance;
    e = { ...e, progress: afterE.progress - wx * f.tx - wy * f.ty,
      lateral: afterE.lateral + wx * f.ty - wy * f.tx };
  }
  const ep = linearizeEntrant(e), pp = linearizeEntrant(p);
  assert.ok(Math.abs(Math.hypot(ep.x - pp.x, ep.y - pp.y) - 0.9982015077719321) < 1e-10);
  const initial = { time: 17.328113354061962, events: [], pairs: {}, entrants: [e, p] };
  let calls = 0;
  const apply = (candidate, boundary) => applyContactInjuries(candidate, boundary, { seed: 'seed', raceId: 'R', tick: 346 });
  const result = advanceOvalInterval(initial, 0, 245.66370614359172, (candidate, boundary) => { calls++; return apply(candidate, boundary); });
  assert.equal(result.ok, true);
  assert.equal(calls, 1);
  assert.equal(result.state.events.filter((event) => event.kind === 'contact').length, 1);
  assert.equal(result.state.events.filter((event) => event.kind === 'injury-check').length, 2);
  assert.equal(result.state.events[0].kind, 'contact');
  assert.equal(result.state.events[0].correction.policy, 'joint-wall-contact/v1');
  assert.ok(result.state.events[0].correction.wallProjections > 0);
  for (const e of result.state.entrants) {
    assert.ok(Math.abs(e.lateral) <= 6);
    const prior = initial.entrants.find((item) => item.id === e.id);
    assert.ok(Math.abs(e.progress - (e.finishCorrection ?? 0) - prior.progress) < 1e-12);
  }
  assert.deepEqual(initial.events, []);
  const rejected = advanceOvalInterval(initial, 0, 245.66370614359172, (candidate, boundary) => { apply(candidate, boundary); return false; });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.reason, 'contact-rejected');
  assert.deepEqual(rejected.state, initial);
});

test('joint new-contact correction rejects deep, third-party and finish-unsafe cases', () => {
  const a = { id: 'A', progress: 0, lateral: 6, speed: 1, heading: 0, finished: false };
  const b = { ...a, id: 'B', progress: 0.9 };
  assert.equal(correctNewContactAtWall([a, { ...b, progress: 0.5 }], ['A', 'B'], 245).reason, 'joint-deep-or-invalid');
  assert.equal(correctNewContactAtWall([a, b, { ...a, id: 'C', progress: -0.9 }], ['A', 'B'], 245).reason, 'correction-third-party-overlap');
  assert.equal(correctNewContactAtWall([a, b], ['A', 'B'], 0.9).reason, 'correction-crosses-boundary');
  assert.equal(a.progress, 0);
  assert.equal(b.progress, 0.9);
});

test('joint new-contact correction respects mirrored walls, reversed IDs and tangent', () => {
  for (const side of [-1, 1]) {
    const a = { id: 'A', progress: 0, lateral: side * 6, speed: 0, heading: 0, finished: false };
    const b = { id: 'B', progress: 0, lateral: side * 5.1, speed: 0, heading: 0, finished: false };
    const forward = correctNewContactAtWall([a, b], ['A', 'B'], 245);
    const reverse = correctNewContactAtWall([b, a], ['B', 'A'], 245);
    assert.equal(forward.ok, true);
    assert.equal(reverse.ok, true);
    for (const id of ['A', 'B']) {
      const left = forward.entrants.find((e) => e.id === id), right = reverse.entrants.find((e) => e.id === id);
      assert.ok(Math.abs(left.progress - right.progress) < 1e-12);
      assert.ok(Math.abs(left.lateral - right.lateral) < 1e-12);
      assert.ok(Math.abs(left.lateral) <= 6);
    }
    assert.equal(correctNewContactAtWall([a, { ...b, lateral: side * 5 }], ['A', 'B'], 245).reason, 'joint-deep-or-invalid');
  }
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
  assert.equal(result.reason, 'deep-contact');
  assert.deepEqual(result.state, initial);
});

test('airborne passage is eligible for movement but an unsafe occupied landing stops', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false, airborne: true },
    { id: 'B', progress: 0.5, lateral: 0, speed: 0, heading: 0, finished: false },
  ] };
  const airborne = advanceOvalInterval(initial, 0.05, 245);
  assert.equal(airborne.ok, true);
  assert.deepEqual(airborne.state.events, []);
  airborne.state.entrants[0].airborne = false;
  airborne.state.entrants[0].landing = true;
  const landing = advanceOvalInterval(airborne.state, 0.05, 245);
  assert.equal(landing.ok, false);
  assert.equal(landing.reason, 'deep-contact');
  assert.deepEqual(landing.state, airborne.state);
});

test('exact non-closing landing commits once and a rejected callback rolls back', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false, landing: true },
    { id: 'B', progress: 1, lateral: 0, speed: 0, heading: 0, finished: false },
  ] };
  const rejected = advanceOvalInterval(initial, 0.05, 245, (candidate) => {
    candidate.events.push({ kind: 'injury' });
    return false;
  });
  assert.equal(rejected.reason, 'contact-rejected');
  assert.deepEqual(rejected.state, initial);
  const accepted = advanceOvalInterval(initial, 0.05, 245, (candidate) => {
    candidate.events.push({ kind: 'injury' });
    return true;
  });
  assert.equal(accepted.ok, true);
  assert.equal(accepted.state.events.filter((event) => event.kind === 'contact').length, 1);
  assert.equal(accepted.state.events[0].impulse, 0);
  assert.equal(accepted.state.events[1].kind, 'injury');
});

test('contact injury consequences and episode identity commit with the boundary', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false, landing: true,
      stance: 'steady', injured: true, ability: 'bounce', bounceState: { startTick: 0 } },
    { id: 'B', progress: 1, lateral: 0, speed: 0, heading: 0, finished: false,
      stance: 'sprint', injured: false, ability: null },
  ] };
  const apply = (candidate, boundary) => applyContactInjuries(candidate, boundary, { seed: 'seed', raceId: 'R', tick: 12 });
  const result = advanceOvalInterval(initial, 0.05, 245, apply);
  assert.equal(result.ok, true);
  assert.equal(result.state.entrants[0].injured, true);
  assert.equal(Object.values(result.state.contactEpisodes)[0], 1);
  assert.equal(result.state.events.filter((event) => event.kind === 'injury-check').length, 2);
  assert.deepEqual(result, advanceOvalInterval(initial, 0.05, 245, apply));
  assert.equal(initial.contactEpisodes, undefined);
  const declined = advanceOvalInterval(initial, 0.05, 245, (candidate, boundary) => {
    apply(candidate, boundary);
    return false;
  });
  assert.deepEqual(declined.state, initial);
});

test('closing contact creates keyed outward steering after its impulse', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 10, heading: 0, finished: false,
      stance: 'steady', injured: false, ability: null },
    { id: 'B', progress: 1.1, lateral: 0, speed: 0, heading: 0, finished: false,
      stance: 'steady', injured: false, ability: null },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245, (candidate, boundary) =>
    applyContactInjuries(candidate, boundary, { seed: 'seed', raceId: 'R', tick: 1 }));
  assert.equal(result.ok, true);
  assert.equal(result.state.events.filter((event) => event.kind === 'contact-steering').length, 2);
  for (const entrant of result.state.entrants) {
    assert.equal(entrant.steeringEpisode.kind, 'contact');
    assert.ok(entrant.steeringEpisode.targetOffsetDeg >= 15 && entrant.steeringEpisode.targetOffsetDeg < 20);
  }
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

test('bounded normal correction rejects deep, finish-adjacent and third-party overlap', () => {
  const a = { id: 'A', progress: 0, lateral: 0, speed: 10, heading: 0 };
  const b = { id: 'B', progress: 0.999999, lateral: 0, speed: 0, heading: 0 };
  const bracket = { outside: 0, inside: 1e-6 };
  const corrected = safeNormalCorrection([a, b], ['A', 'B'], bracket, 245);
  assert.equal(corrected.ok, true);
  assert.equal(a.progress, 0);
  for (const e of corrected.entrants) {
    const original = [a, b].find((item) => item.id === e.id);
    assert.ok(Math.abs(e.progress - e.finishCorrection - original.progress) < 1e-14);
  }
  assert.equal(safeNormalCorrection([a, { ...b, progress: 0.5 }], ['A', 'B'], bracket, 245).reason, 'correction-exceeds-bracket');
  assert.equal(safeNormalCorrection([a, b], ['A', 'B'], bracket, 0.9999994).reason, 'correction-crosses-boundary');
  assert.equal(safeNormalCorrection([a, b, { ...a, id: 'C', progress: -0.9 }], ['A', 'B'], bracket, 245).reason, 'correction-third-party-overlap');
});

test('oval interval commits a sampled straight contact and recomputes remaining movement', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 10, heading: 0, finished: false },
    { id: 'B', progress: 1.1, lateral: 0, speed: 0, heading: 0, finished: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 245);
  assert.equal(result.ok, true);
  assert.equal(result.state.events[0].kind, 'contact');
  assert.ok(result.state.events[0].correction.penetration <= 0.25);
  assert.ok(result.state.entrants[1].progress > 1.1);
  assert.equal(initial.entrants[1].progress, 1.1);
});

test('oval interval truncates at a crossing before a later sampled contact', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 10, heading: 0, finished: false },
    { id: 'B', progress: 0.08, lateral: 1.1, speed: 0, heading: 0, finished: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 0.09);
  assert.equal(result.ok, true);
  assert.equal(result.state.events[0].kind, 'crossing');
  assert.deepEqual(result.state.events[0].ids, ['A']);
  assert.ok(!result.state.events.some((event) => event.kind === 'contact'));
});

test('discrete contact sensitivity, near miss and crowded rollback remain explicit', () => {
  const make = (lateral = 0) => ({ time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 10, heading: 0, finished: false },
    { id: 'B', progress: 1.1, lateral, speed: 0, heading: 0, finished: false },
  ] });
  for (const scale of [1, 0.5]) {
    const hit = advanceOvalInterval(make(), 0.05, 245, null, scale);
    assert.equal(hit.ok, true);
    assert.equal(hit.state.events.filter((event) => event.kind === 'contact').length, 1);
    const miss = advanceOvalInterval(make(1.01), 0.05, 245, null, scale);
    assert.equal(miss.ok, true);
    assert.equal(miss.state.events.length, 0);
  }
  const cluster = { time: 0, events: [{ kind: 'injury', id: 'earlier' }], pairs: {}, entrants: [
    { id: 'A', progress: 0, lateral: 0, speed: 0, heading: 0, finished: false },
    { id: 'B', progress: 0.9, lateral: 0, speed: 0, heading: 0, finished: false },
    { id: 'C', progress: 1.8, lateral: 0, speed: 0, heading: 0, finished: false },
  ] };
  const stopped = advanceOvalInterval(cluster, 0.05, 245);
  assert.equal(stopped.ok, false);
  assert.equal(stopped.reason, 'correction-third-party-overlap');
  assert.deepEqual(stopped.state, cluster);
});

test('landing contact at a crossing boundary is recorded before crossings', () => {
  const initial = { time: 0, events: [], pairs: {}, entrants: [
    { id: 'A', progress: 0.1, lateral: 0, speed: 0, heading: 0, finished: false, landing: true },
    { id: 'B', progress: 0.1, lateral: 1, speed: 0, heading: 0, finished: false },
  ] };
  const result = advanceOvalInterval(initial, 0.05, 0.1);
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.events.map((event) => event.kind), ['contact', 'crossing', 'crossing']);
  assert.equal(result.state.events[0].impulse, 0);
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
