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
