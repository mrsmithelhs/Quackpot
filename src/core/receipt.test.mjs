import test from 'node:test';
import assert from 'node:assert/strict';
import { EventLog } from './event-log.mjs';
import { projectReceipt } from './receipt.mjs';

test('Plan 23 Receipt separates race material shown, player actions, and committed crossing facts', () => {
  const log = new EventLog();
  const clock = { day: 1, label: 'day 1 midday' };
  log.append('race_choice_offered', {
    raceNumber: 1, raceId: 'R01', exposureId: 'race-choice-1', duckId: 'duck-0',
    options: { safe: { label: 'Safe Pace' }, sprint: { label: 'Sprint' } },
  }, clock);
  log.append('race_trial_offer_shown', { raceNumber: 1, costDown: 3, alreadyPurchased: false }, clock);
  log.append('action', { kind: 'race_choice', raceNumber: 1, duckId: 'duck-0', stance: 'sprint', trialCommitted: false }, clock);
  log.append('race_result', {
    raceNumber: 1, raceId: 'R01', resolutionDigest: '1234abcd', place: 2, payoutGems: 20,
    finishOrder: [{ id: 'A', place: 1, payout: 50 }, { id: 'P', place: 2, payout: 20 }],
  }, clock);
  log.append('race_cue_displayed', { raceNumber: 1, raceId: 'R01', cueId: 'podium-reveal', text: 'The podium began to descend.' }, clock);
  log.append('race_playback_action', { raceNumber: 1, raceId: 'R01', action: 'skip' }, clock);

  const evidence = projectReceipt(log.entries).raceEvidence;
  assert.ok(evidence.displayed.some((item) => item.text.includes('Safe pace')));
  assert.ok(evidence.displayed.some((item) => item.text.includes('3 Down')));
  assert.ok(evidence.displayed.some((item) => item.text === 'The podium began to descend.'));
  assert.ok(evidence.did.some((item) => item.text.includes('sprint stance')));
  assert.ok(evidence.did.some((item) => item.text.includes('crossing order')));
  assert.ok(evidence.did.some((item) => item.text.includes('skip')));
  assert.equal(evidence.displayed.some((item) => /collid|wall/i.test(item.text)), false,
    'mechanical contacts are not reported as displayed unless a displayed cue was logged');
});

test('Plan 23 Receipt reports unresolved attempts without invented place or reward', () => {
  const log = new EventLog();
  log.append('race_attempt_unresolved', {
    raceNumber: 1, raceId: 'R01', status: 'unresolved', resolutionStatus: 'unresolved',
    knownCrossings: [{ id: 'A', crossingTimeSeconds: 12.5 }], trialAvailable: true,
  }, { day: 1, label: 'day 1 midday' });
  const did = projectReceipt(log.entries).raceEvidence.did.map((item) => item.text).join('\n');
  assert.match(did, /remained unresolved/);
  assert.match(did, /no finish place or Gems/);
  assert.doesNotMatch(did, /earned \d+ Gems|finished; recorded crossing order/);
});

test('Plan 22 Receipt separates candidate exposure from applied rest and history-limited baseline', () => {
  const log = new EventLog();
  const clock = { day: 1, label: 'day 1 midday' };
  log.append('race_rest_policy_activated', { policyVersion: 'quackpot.race-rest/1', historyBaselineSeq: 2, historyLimited: true }, clock);
  log.append('race_choice_offered', {
    raceNumber: 2, exposureId: 'race-choice-2-visible',
    options: { safe: { label: 'Steady pace' }, sprint: { label: 'Variable pace' } },
    candidates: [
      { duckId: 'duck-5', effectiveBaseInput: 15, effectiveWithTrialInput: 15, restFactor: 0.75 },
      { duckId: 'duck-0', effectiveBaseInput: 10, effectiveWithTrialInput: 10, restFactor: 1, historyLimited: true },
    ],
    trialState: { available: false, selected: false },
  }, clock);
  log.append('action', { kind: 'race_choice', raceId: 'R02', duckId: 'duck-5', stance: 'safe', trialCommitted: false,
    restEvidence: { policyVersion: 'quackpot.race-rest/1', authoredRating: 20, restFactor: 0.75, effectiveBaseInput: 15, trialCommitted: false, trialMultiplier: 1.05 } }, clock);
  log.append('race_attempt_unresolved', { raceNumber: 2, raceId: 'R02', restEvidence: { restFactor: 0.75 }, trialAvailable: false }, clock);
  const evidence = projectReceipt(log.entries).raceEvidence;
  assert.ok(evidence.displayed.some((item) => item.text.includes('duck-5: race rating 15 (25% rest penalty)')));
  assert.ok(evidence.displayed.some((item) => item.text.includes('Pace options: Steady pace and Variable pace')));
  assert.ok(evidence.displayed.some((item) => item.text.includes('duck-0: race rating 10 (rest history limited by an older unknown identity)')));
  assert.ok(evidence.did.some((item) => item.text.includes('older completed race without a recorded duck identity')));
  assert.equal(evidence.displayed.some((item) => item.text.includes('No purchased trial available')), false,
    'a legacy offer without trial-state evidence must not invent trial availability');
  assert.ok(evidence.did.some((item) => item.text.includes('race rating 15')));
  assert.ok(evidence.did.some((item) => item.text.includes('unresolved attempts do not advance rest')));
  assert.equal(evidence.displayed.some((item) => item.text.includes('older completed race without a recorded duck identity')), false);
  assert.equal(evidence.did.some((item) => item.text.includes('Race rest tracking began after an older completed race without a recorded duck identity')), true,
    'policy activation is game-record evidence, not a displayed cue or player action');
});

test('Plan 22 Receipt does not invent candidate ordering or trial availability for incomplete legacy exposures', () => {
  const log = new EventLog();
  log.append('race_choice_offered', { raceNumber: 1, options: { safe: {}, sprint: {} } }, { day: 1, label: 'legacy' });
  const evidence = projectReceipt(log.entries).raceEvidence;
  assert.equal(evidence.displayed.length, 1);
  assert.match(evidence.displayed[0].text, /choice offered; older record has no candidate details/);
  assert.match(evidence.displayed[0].text, /Recorded pace options: Safe pace and Sprint/);
  assert.doesNotMatch(evidence.displayed[0].text, /effective-input order|trial available|winner/i);
});
