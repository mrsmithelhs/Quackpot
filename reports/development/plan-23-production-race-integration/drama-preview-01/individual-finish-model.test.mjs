import test from 'node:test';
import assert from 'node:assert/strict';
import * as original from './candidate-model.mjs';
import { COURSE_LENGTH, firstCrossingParityProjection, interpolateSnapshot, orderCrossingsByTime, resolveSeededRace, runEndpointResolution, runTransactionalEndpointResolution } from './individual-finish-model.mjs';

const fixture = (extra = {}) => ({
  seed: 'plan23-drama2-val-01', raceId: 'R01', playerBaseSpeed: 10, fieldBaseSpeed: 8,
  choice: 'steady', trialCommitted: false, experiment: 'weave-rank-strong-contact',
  dramaArm: 'R2combined-risk-only', studySprintMean: 1, ...extra,
});

test('first-crossing causal witness matches the original resolver through the genuine first crossing', () => {
  const input = fixture();
  const expected = original.resolveSeededRace(input);
  const actual = resolveSeededRace(input);
  assert.deepEqual(firstCrossingParityProjection(actual), firstCrossingParityProjection(expected));
  assert.equal(actual.winner, expected.winner);
  assert.equal(actual.finishTimeSeconds, expected.finishTimeSeconds);
  assert.equal(actual.firstCrossingWitness.projection, 'plan23-first-crossing-causal-parity-v1');
  assert.ok(actual.lastFinishTimeSeconds > actual.finishTimeSeconds);
});

test('finish crossing order uses strict numeric time and codepoint ID only for exact ties', () => {
  const crossings = [
    { id: 'b', crossingTimeSeconds: 2 },
    { id: 'z', crossingTimeSeconds: 1 + 1e-12 },
    { id: 'a', crossingTimeSeconds: 1 },
    { id: 'A', crossingTimeSeconds: 1 },
  ];
  assert.deepEqual(orderCrossingsByTime(crossings).map((item) => item.id), ['A', 'a', 'z', 'b']);
});

test('completed race records genuine per-entrant crossing witnesses and awards only after every entrant crosses', () => {
  const result = resolveSeededRace(fixture());
  assert.equal(result.status, 'finished');
  assert.equal(result.finish.length, result.entrants.length);
  assert.equal(result.finishCrossings.length, result.entrants.length);
  assert.deepEqual(result.finish.map((item) => item.id), orderCrossingsByTime(result.finishCrossings).map((item) => item.id));
  for (const crossing of result.finish) {
    for (const key of ['crossingTimeSeconds', 'tick', 'fraction', 'progress', 'lateral', 'heading', 'speed', 'x', 'y']) {
      assert.equal(Number.isFinite(crossing[key]), true, `${crossing.id}.${key} should be an unrounded numeric crossing witness`);
    }
    assert.ok(crossing.progress >= COURSE_LENGTH - 1e-10);
    assert.equal(crossing.payout >= 0, true);
  }
});

test('crossed entrants do not participate in endpoint records or later opportunities', () => {
  const result = resolveSeededRace(fixture());
  const crossingTickById = new Map(result.finishCrossings.map((item) => [item.id, item.tick]));
  for (const event of result.eventRecords) {
    if (event.type === 'finish-line-crossing') continue;
    if (['duck-contact', 'wall-impact', 'wall-overlap'].includes(event.type)) {
      for (const id of event.participants) assert.equal(event.tick >= crossingTickById.get(id), false, `${id} must be excluded from its crossing tick endpoint and later`);
    }
  }
  for (const opportunity of result.opportunityRecords) {
    assert.equal(opportunity.tick <= crossingTickById.get(opportunity.entrantId), true,
      `${opportunity.entrantId} must not receive an opportunity after its crossing tick`);
  }
  const contactsByTick = new Map();
  const endpointActorTicks = new Set();
  for (const event of result.eventRecords.filter((item) => item.type === 'duck-contact')) {
    contactsByTick.set(event.tick, (contactsByTick.get(event.tick) ?? 0) + 1);
  }
  for (const count of contactsByTick.values()) assert.equal(count, 1, 'the endpoint contact resolver runs once at most per tick');
  for (const event of result.eventRecords.filter((item) => ['wall-impact', 'wall-overlap'].includes(item.type))) {
    const key = `${event.tick}:${event.participants[0]}`;
    assert.equal(endpointActorTicks.has(key), false, `${key} must have one endpoint wall resolution at most`);
    endpointActorTicks.add(key);
  }
  const sameTickCrossers = result.finishCrossings.filter((item) => item.tick === 443).sort((a, b) => a.fraction - b.fraction || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  assert.deepEqual(sameTickCrossers.map((item) => item.id), ['B', 'C']);
  const sameTickEvent = result.eventRecords.find((item) => item.type === 'finish-line-crossing' && item.id.startsWith('finish-line-443-'));
  assert.deepEqual(sameTickEvent.crossingFractions.map((item) => item.id), ['B', 'C']);
  assert.ok(sameTickEvent.crossingFractions[0].fraction < sameTickEvent.crossingFractions[1].fraction);
  const earlierCrossingFrame = interpolateSnapshot(result, 442 + sameTickEvent.crossingFractions[0].fraction);
  assert.ok(earlierCrossingFrame.entrants.find((entrant) => entrant.id === 'B').progress >= COURSE_LENGTH - 0.01);
  assert.ok(earlierCrossingFrame.entrants.find((entrant) => entrant.id === 'C').progress < COURSE_LENGTH,
    'C must remain before its later within-tick crossing at B’s crossing time');
});

test('returned trajectory prefix matches the historical interpolation and does not move later same-tick crossers early', () => {
  const input = fixture({ seed: 'plan23-drama2-val-04', playerBaseSpeed: 7.5 });
  const expected = original.resolveSeededRace(input);
  const actual = resolveSeededRace(input);
  const firstCrossing = actual.finishCrossings[0];
  const terminalTick = expected.ticks;
  for (let tick = 0; tick < Math.floor(terminalTick); tick += 1) {
    const oldFrame = original.interpolateSnapshot(expected, tick);
    const newFrame = interpolateSnapshot(actual, tick);
    assert.deepEqual(newFrame.entrants, oldFrame.entrants, `returned trace differs at tick ${tick}`);
  }
  assert.deepEqual(interpolateSnapshot(actual, terminalTick).entrants,
    original.interpolateSnapshot(expected, terminalTick).entrants, 'actual terminal frame must match the historical renderer input');
  const laterSameTick = actual.finishCrossings.filter((item) => item.tick === firstCrossing.tick && item.fraction > firstCrossing.fraction);
  assert.ok(laterSameTick.some((item) => ['A', 'C'].includes(item.id)), 'fixture includes later A/C crossings in the winner tick');
  const terminal = interpolateSnapshot(actual, terminalTick);
  for (const crossing of laterSameTick) {
    assert.ok(terminal.entrants.find((entrant) => entrant.id === crossing.id).progress < COURSE_LENGTH,
      `${crossing.id} must remain before its later within-tick crossing at the first crossing frame`);
  }
});

test('crossing-tick endpoint dispatcher runs wall then contact resolution once on survivors only', () => {
  const entrants = [
    { id: 'A', lateral: 7 },
    { id: 'B', lateral: 7 },
    { id: 'C', lateral: 0 },
  ];
  const wallChecks = [];
  const contactChecks = [];
  const surviving = runEndpointResolution(entrants, ['A'],
    (entrant) => wallChecks.push(entrant.id),
    (active) => contactChecks.push({ count: 1, participants: active.map((entrant) => entrant.id) }));
  assert.deepEqual(wallChecks, ['B']);
  assert.deepEqual(surviving.map((entrant) => entrant.id), ['B', 'C']);
  assert.deepEqual(contactChecks, [{ count: 1, participants: ['B', 'C'] }]);
});

test('endpoint-resolution failure rolls back survivor mutations and does not dispatch contact afterward', () => {
  const entrants = [{ id: 'P', lateral: 8 }, { id: 'A', lateral: 0 }];
  let contactCalled = false;
  assert.throws(() => runTransactionalEndpointResolution(entrants, [],
    (entrant) => { entrant.lateral = 1; throw new Error('forced wall endpoint failure'); },
    () => { contactCalled = true; }), /forced wall endpoint failure/);
  assert.equal(entrants[0].lateral, 8);
  assert.equal(entrants[1].lateral, 0);
  assert.equal(contactCalled, false);
});

test('mechanical-event cap rolls back the entire failed crossing tick and keeps crossing evidence consistent', () => {
  const beforeFirst = resolveSeededRace(fixture(), { maxMechanicalEvents: 26 });
  assert.equal(beforeFirst.status, 'unresolved');
  assert.equal(beforeFirst.winner, null);
  assert.equal(beforeFirst.finishTimeSeconds, null);
  assert.equal(beforeFirst.firstCrossingWitness, null);
  assert.deepEqual(beforeFirst.finishCrossings, []);
  assert.equal(beforeFirst.eventRecords.some((event) => event.type === 'finish-line-crossing'), false);
  assert.equal(beforeFirst.ticks, beforeFirst.guardEvidence.tick - 1);

  const afterTwo = resolveSeededRace(fixture(), { maxMechanicalEvents: 28 });
  assert.equal(afterTwo.status, 'partial-unresolved');
  assert.deepEqual(afterTwo.finishCrossings.map((crossing) => crossing.id), ['P', 'A']);
  const recorded = afterTwo.eventRecords.filter((event) => event.type === 'finish-line-crossing')
    .flatMap((event) => event.crossingFractions.map((crossing) => ({ id: crossing.id, fraction: crossing.fraction })));
  assert.deepEqual(recorded, afterTwo.finishCrossings.map((crossing) => ({ id: crossing.id, fraction: crossing.fraction })));
  assert.deepEqual(afterTwo.finish, []);
  assert.equal(afterTwo.finishCrossings.some((crossing) => crossing.tick === afterTwo.guardEvidence.tick), false);
  assert.equal(afterTwo.trajectory.at(-1).tick, afterTwo.guardEvidence.tick - 1);
});

test('completion watchdog keeps factual crossings but withholds placed finishes and payouts', () => {
  const partial = resolveSeededRace(fixture(), { maxCompletionTicks: 1 });
  assert.equal(partial.status, 'partial-unresolved');
  assert.ok(partial.finishCrossings.length > 0);
  assert.ok(partial.unresolvedEntrants.length > 0);
  assert.deepEqual(partial.finish, []);
  assert.equal(partial.lastFinishTimeSeconds, null);
});

