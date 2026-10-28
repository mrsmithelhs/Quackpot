import test from 'node:test';
import assert from 'node:assert/strict';
import { EventLog } from './event-log.mjs';
import { GameEngine, BANNER_1_ROSTER } from './game-engine.mjs';
import { deriveRaceRest, formatRaceRating, makeRaceRestEvidence } from './race-rest.mjs';

function history(ids) {
  const log = new EventLog();
  ids.forEach((duckId, index) => log.append('race_result', { raceNumber: index + 1, raceId: `fixture-${index + 1}`, duckId }, {}));
  return log.entries;
}

test('identity rest uses intervening completed races and leaves never-raced identities rested', () => {
  assert.equal(deriveRaceRest([], 'duck-0').restFactor, 1);
  assert.equal(deriveRaceRest(history(['duck-0']), 'duck-0').restFactor, 0.5);
  assert.equal(deriveRaceRest(history(['duck-0', 'duck-1']), 'duck-0').restFactor, 0.75);
  assert.equal(deriveRaceRest(history(['duck-0', 'duck-1', 'duck-2']), 'duck-0').restFactor, 1);
  assert.equal(deriveRaceRest(history(['duck-0', 'duck-0']), 'duck-0').restFactor, 0.5);
});

test('unknown legacy identity creates a history-limited baseline without a never-raced claim', () => {
  const log = new EventLog();
  log.append('race_result', { raceNumber: 1, raceId: 'legacy-1' }, {});
  log.append('race_result', { raceNumber: 2, raceId: 'legacy-2', duckId: 'duck-0' }, {});
  const a = deriveRaceRest(log.entries, 'duck-0');
  assert.equal(a.historyLimited, true);
  assert.equal(a.lastRaceSeq, log.entries[1].seq);
  assert.equal(a.restFactor, 0.5);
  assert.equal(deriveRaceRest(log.entries, 'duck-1').restFactor, 1);
});

test('unrecognized historical identities start a history-limited baseline instead of counting as intervening races', () => {
  const entries = history(['duck-0', 'legacy-duck-from-retired-roster']);
  const rest = deriveRaceRest(entries, 'duck-0');
  assert.equal(rest.historyLimited, true);
  assert.equal(rest.historyBaselineSeq, entries[1].seq);
  assert.equal(rest.lastRaceSeq, null);
  assert.equal(rest.restFactor, 1);
});

test('rest evidence snapshots authored and effective base inputs', () => {
  const evidence = makeRaceRestEvidence(history(['duck-2']), 'duck-2', 14);
  assert.equal(evidence.restFactor, 0.5);
  assert.equal(evidence.authoredRating, 14);
  assert.equal(evidence.effectiveBaseInput, 7);
});

test('human race-rating formatting removes floating-point display noise without changing the evidence value', () => {
  const exactInput = 14 * 1.05;
  assert.equal(exactInput, 14.700000000000001);
  assert.equal(formatRaceRating(exactInput), '14.7');
  assert.equal(formatRaceRating(15.75), '15.75');
  assert.equal(formatRaceRating(10), '10');
  assert.equal(exactInput, 14 * 1.05, 'formatting does not replace the underlying numeric input');
});

test('unknown completed history sets the append-only activation boundary, while known history is retained', () => {
  const engine = new GameEngine('plan22-activation-boundary');
  engine.log.append('race_result', { raceNumber: 1, raceId: 'known', duckId: 'duck-0' }, {});
  engine.log.append('race_result', { raceNumber: 2, raceId: 'unknown', duckId: 'legacy-duck-from-retired-roster' }, {});
  const activation = engine.activateRaceRestPolicy();
  assert.equal(activation.type, 'race_rest_policy_activated');
  assert.equal(activation.payload.historyLimited, true);
  assert.equal(activation.payload.historyBaselineSeq, 1);
  assert.equal(deriveRaceRest(engine.log.entries, 'duck-0').restFactor, 1,
    'unknown legacy boundary resets tracking without inventing which identity raced');
});

test('candidate exposure captures rendered order and only changed signatures append', () => {
  const engine = new GameEngine('plan22-candidate-exposure');
  engine.state.owned = ['duck-0', 'duck-5'];
  engine.log.append('race_result', { raceNumber: 1, raceId: 'fixture-1', duckId: 'duck-5' }, {});
  engine.log.append('race_result', { raceNumber: 2, raceId: 'fixture-2', duckId: 'duck-0' }, {});
  const candidates = [
    { duckId: 'duck-5', authoredRating: 20, restFactor: 0.75, historyLimited: false, effectiveBaseInput: 15, effectiveWithTrialInput: 15, rendered: true },
    { duckId: 'duck-0', authoredRating: 10, restFactor: 1, effectiveBaseInput: 10, effectiveWithTrialInput: 10, rendered: true },
  ];
  const first = engine.recordRaceChoicesShown(1, { duckId: 'duck-5', candidates, fieldBaseSpeed: 8, trialState: { available: false, selected: false, multiplier: 1.05 }, exposureId: 'shown-a' });
  assert.equal(first.type, 'race_choice_offered');
  assert.equal(first.payload.candidates[0].duckId, 'duck-5');
  assert.ok(engine.log.entries.findIndex((entry) => entry.type === 'race_rest_policy_activated') < first.seq);
  assert.equal(engine.recordRaceChoicesShown(1, { duckId: 'duck-5', candidates, fieldBaseSpeed: 8, trialState: { available: false, selected: false, multiplier: 1.05 }, exposureId: 'shown-a' }), null);
  engine.state.raceTrialAvailable = true;
  const refreshed = engine.recordRaceChoicesShown(1, { duckId: 'duck-5', candidates: candidates.map((candidate) => ({ ...candidate, effectiveWithTrialInput: candidate.effectiveBaseInput * 1.05 })), fieldBaseSpeed: 8, trialState: { available: true, selected: true, multiplier: 1.05 }, exposureId: 'shown-b' });
  assert.ok(refreshed);
  assert.equal(engine.log.entries.filter((entry) => entry.type === 'race_choice_offered').length, 2);
});

test('the first visible race-trial offer also follows the race-rest policy boundary', () => {
  const engine = new GameEngine('plan22-trial-exposure-boundary');
  const offer = engine.recordRaceTrialOfferShown(1);
  assert.equal(offer.type, 'race_trial_offer_shown');
  const activationIndex = engine.log.entries.findIndex((entry) => entry.type === 'race_rest_policy_activated');
  assert.ok(activationIndex >= 0 && activationIndex < engine.log.entries.indexOf(offer));
});

test('small and empty rosters keep only owned identities available', () => {
  const engine = new GameEngine('plan22-small-roster');
  engine.state.owned = ['duck-0'];
  const available = engine.state.owned.map((id) => BANNER_1_ROSTER.find((duck) => duck.id === id)).filter(Boolean);
  assert.deepEqual(available.map((duck) => duck.id), ['duck-0']);
  engine.state.owned = [];
  assert.deepEqual(engine.state.owned.map((id) => BANNER_1_ROSTER.find((duck) => duck.id === id)).filter(Boolean), []);
});
