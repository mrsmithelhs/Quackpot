import test from 'node:test';
import assert from 'node:assert/strict';
import * as original from './candidate-model.mjs';
import { COURSE_LENGTH, firstCrossingParityProjection, orderCrossingsByTime, resolveSeededRace, runEndpointResolution } from './individual-finish-model.mjs';

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

test('completion watchdog keeps factual crossings but withholds placed finishes and payouts', () => {
  const partial = resolveSeededRace(fixture(), { maxCompletionTicks: 1 });
  assert.equal(partial.status, 'partial-unresolved');
  assert.ok(partial.finishCrossings.length > 0);
  assert.ok(partial.unresolvedEntrants.length > 0);
  assert.deepEqual(partial.finish, []);
  assert.equal(partial.lastFinishTimeSeconds, null);
});

