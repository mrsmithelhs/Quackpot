import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSE_LENGTH, PHYSICS, buildPresentationPlan, impactFixtureTrace, interpolateSnapshot,
  raceFingerprint, raceFractionAtWallClock, raceDuckYaw, resolveSeededRace, narrativeForEvent,
  restorePresentationSnapshot, sampleTrajectory, savePresentationSnapshot,
  turnCap, recenterCorrectionDeg,
} from './preview-model.mjs';

const baseInput = Object.freeze({ seed: 'Quackpot Plan 13 named-seed example', raceId: 'R00', playerBaseSpeed: 11.7,
  fieldBaseSpeed: 11.5, choice: 'steady', trialCommitted: false, experiment: 'controller-recenter' });
const resolve = (overrides = {}) => resolveSeededRace({ ...baseInput, ...overrides });

test('seeded race resolves at first line crossing with deterministic mechanics and separate presentation', () => {
  const a = resolve(); const b = resolve();
  assert.equal(a.rulesVersion, 'plan13-physics-v3');
  assert.equal(a.status, 'finished');
  assert.ok(a.finishTimeSeconds > 0 && a.finishTimeSeconds < 40);
  assert.equal(raceFingerprint(a), raceFingerprint(b));
  assert.equal(a.draws.performance, 6);
  assert.ok(a.drawKeys.every((key) => key.startsWith('plan13/v2|R00|')));
  assert.equal(a.trajectory[0].tick, 0);
  assert.equal(a.trajectory.at(-1).tick, a.ticks);
  assert.ok(a.finish.length === 6 && a.finish.some((e) => e.crossedAtFinish));
  assert.equal(a.finish[0].crossedAtFinish, true);
  assert.ok(Math.abs(a.finish[0].crossingTimeSeconds - a.finishTimeSeconds) < 1e-6);
  assert.ok(a.finish.every((e) => e.place >= 1 && e.place <= 6));
  assert.ok(COURSE_LENGTH > 245 && COURSE_LENGTH < 246);
  assert.match(a.terminalStepOrdering.resolutionOrder, /terminal before the tick-end wall\/contact resolver/);
  assert.ok(a.terminalStepOrdering.contactCandidates.every((candidate) => Number.isFinite(candidate.timeSeconds)));
});

test('acceleration and speed-dependent maximum turn rate are applied', () => {
  const r = resolve(); const oneSecond = r.trajectory.find((s) => s.tick === 20).entrants.find((e) => e.id === 'A');
  assert.ok(oneSecond.speed > 6);
  assert.equal(turnCap(8), 50);
  assert.equal(turnCap(12), 30);
  assert.equal(turnCap(20), PHYSICS.minTurnRateDeg);
  assert.ok(PHYSICS.minTurnRateDeg <= turnCap(12));
});

test('recenter correction is bounded, cross-track restoring and symmetric', () => {
  assert.ok(recenterCorrectionDeg(2) < 0);
  assert.ok(recenterCorrectionDeg(-2) > 0);
  assert.ok(Object.is(recenterCorrectionDeg(0), 0) || Object.is(recenterCorrectionDeg(0), -0));
  assert.equal(recenterCorrectionDeg(100), -PHYSICS.recoveryMaxCorrectionDeg);
  assert.equal(recenterCorrectionDeg(-100), PHYSICS.recoveryMaxCorrectionDeg);
});

test('race duck Y-turn is continuous across both bends', () => {
  const straight = PHYSICS.straight, bend = Math.PI * PHYSICS.curveRadius, eps = 1e-5;
  assert.equal(raceDuckYaw(0), 180);
  assert.ok(Math.abs(raceDuckYaw(straight / 2 + bend) - 0) < 1e-8);
  assert.ok(Math.abs(raceDuckYaw(straight / 2 + bend + straight / 2)) < 1e-8);
  assert.ok(Math.abs(raceDuckYaw(COURSE_LENGTH) - 180) < 1e-8);
  for (const boundary of [straight / 2, straight / 2 + bend, straight / 2 + bend + straight, COURSE_LENGTH - straight / 2]) {
    assert.ok(Math.abs(raceDuckYaw(boundary - eps) - raceDuckYaw(boundary + eps)) < .01);
  }
});

test('weave and contact experiments have deterministic keyed steering episodes', () => {
  for (const experiment of ['controller-tangent', 'controller-recenter', 'weave-symmetric', 'weave-rank-weighted', 'contact-6deg', 'contact-15-20deg']) {
    const a = resolve({ experiment }), b = resolve({ experiment });
    assert.equal(raceFingerprint(a), raceFingerprint(b), experiment);
    assert.ok(a.eventRecords.length <= PHYSICS.maxMechanicalEvents);
    assert.ok(a.opportunityRecords.length <= PHYSICS.maxOpportunityDiagnostics);
  }
  const weave = resolve({ experiment: 'weave-symmetric' });
  assert.ok(weave.eventRecords.some((e) => e.type === 'weave-turn'));
  const strong = resolve({ experiment: 'contact-15-20deg' });
  const contact = strong.eventRecords.find((e) => e.type === 'duck-contact');
  if (contact) {
    assert.equal(contact.participants.length, 2);
    assert.ok(Object.values(contact.recovery).every((r) => r.targetOffsetDeg >= 15 && r.targetOffsetDeg <= 20));
  }
});

test('matched contact severity changes involved trajectories without changing PRNG performance draws', () => {
  const input = { seed: 'Plan13 stability seed 1', raceId: 'R1', playerBaseSpeed: 11.7, fieldBaseSpeed: 11.5, choice: 'steady', trialCommitted: false };
  const control = resolveSeededRace({ ...input, experiment: 'contact-6deg' });
  const candidate = resolveSeededRace({ ...input, experiment: 'contact-15-20deg' });
  assert.deepEqual(control.drawKeys.filter((key) => key.includes('contact-pair-selection')), candidate.drawKeys.filter((key) => key.includes('contact-pair-selection')));
  assert.deepEqual(control.entrants.map((e) => e.performanceDraw), candidate.entrants.map((e) => e.performanceDraw));
  assert.ok(control.eventRecords.some((e) => e.type === 'duck-contact'));
  const changed = control.trajectory.some((frame, index) => frame.entrants.some((entrant, j) => {
    const other = candidate.trajectory[index]?.entrants[j];
    return other && Math.hypot(entrant.x - other.x, entrant.y - other.y) > 0.01;
  }));
  assert.equal(changed, true);
});

test('accessible event narration reports measured contact and weave recovery', () => {
  const strong = resolve({ experiment: 'contact-15-20deg' });
  const contact = strong.eventRecords.find((e) => e.type === 'duck-contact');
  const names = Object.fromEntries(strong.entrants.map((e) => [e.id, e]));
  const collisionText = narrativeForEvent(contact, names);
  assert.match(collisionText, /collided/);
  assert.match(collisionText, /m\/s/);
  assert.match(collisionText, /attained its .* path-relative target/);
  assert.match(collisionText, /held the attained deviation for 0\.50 seconds/);
  const weave = resolve({ experiment: 'weave-symmetric' }).eventRecords.find((e) => e.type === 'weave-turn');
  assert.match(narrativeForEvent(weave, names), /path-relative target/);
  assert.match(narrativeForEvent(weave, names), /attained its/);
});

test('narrative separates target from attainment, timeout, interrupted hold and control deflection', () => {
  const names = Object.fromEntries(['A', 'B', 'P'].map((id) => [id, { id, name: `Duck ${id}` }]));
  const timeoutRace = resolveSeededRace({ ...baseInput, seed: 'narrative-seed 0', raceId: 'R', experiment: 'weave-symmetric' });
  const timeout = timeoutRace.eventRecords.find((event) => event.id === 'weave-turn-66-B');
  const timeoutText = narrativeForEvent(timeout, names);
  assert.match(timeoutText, /did not attain its .* target within the 1-second acquisition limit/);
  assert.doesNotMatch(timeoutText, /turned .* away/);

  const cancelledRace = resolveSeededRace({ ...baseInput, seed: 'hold-interrupt 0', raceId: 'R', experiment: 'weave-symmetric' });
  const cancelled = cancelledRace.eventRecords.find((event) => event.id === 'weave-turn-27-P');
  assert.match(narrativeForEvent(cancelled, names), /acquisition was cancelled by a later collision/);
  assert.doesNotMatch(narrativeForEvent(cancelled, names), /hold was interrupted/);

  const recoveredByContactRace = resolveSeededRace({ ...baseInput, seed: 'Plan13 stability seed 1', raceId: 'R1', experiment: 'weave-symmetric' });
  const recoveredByContact = recoveredByContactRace.eventRecords.find((event) => event.id === 'weave-turn-1-B');
  assert.equal(recoveredByContact.recovery.B.acquisitionStatus, 'attained');
  assert.equal(recoveredByContact.recovery.B.holdStatus, 'attained');
  assert.match(narrativeForEvent(recoveredByContact, Object.fromEntries(recoveredByContactRace.entrants.map((entrant) => [entrant.id, entrant]))), /held the attained deviation for 0\.50 seconds/);
  assert.match(narrativeForEvent(recoveredByContact, Object.fromEntries(recoveredByContactRace.entrants.map((entrant) => [entrant.id, entrant]))), /steering recovery was cancelled by a later contact/);

  const interruptedRace = resolveSeededRace({ ...baseInput, seed: 'hold-interrupt 10', raceId: 'R', experiment: 'contact-15-20deg' });
  const interrupted = interruptedRace.eventRecords.find((event) => event.id === 'duck-contact-262-A-B');
  assert.match(narrativeForEvent(interrupted, names), /hold was interrupted after 0\.20 seconds/);

  const control = resolve({ experiment: 'contact-6deg' }).eventRecords.find((event) => event.type === 'duck-contact');
  assert.match(narrativeForEvent(control, Object.fromEntries(resolve().entrants.map((entrant) => [entrant.id, entrant]))), /ID-signed steering deflection/);
  assert.doesNotMatch(narrativeForEvent(control, names), /away/);
});

test('contact status aggregates both participants and reports recovery left unfinished at finish', () => {
  const race = resolveSeededRace({ ...baseInput, seed: 'asym-contact seed 699', raceId: 'R', experiment: 'contact-15-20deg' });
  const contact = race.eventRecords.find((event) => event.type === 'duck-contact');
  assert.equal(contact.status, 'race-ended-at-finish');
  assert.equal(contact.recovery.B.recoveryStatus, 'recentered');
  assert.equal(contact.recovery.A.recoveryStatus, 'race-ended-before-recovery');
  const names = Object.fromEntries(race.entrants.map((entrant) => [entrant.id, entrant]));
  const text = narrativeForEvent(contact, names);
  assert.match(text, /Rival B.*returned to its assigned lane/);
  assert.match(text, /Rival A.*had not returned to its assigned lane before the finish crossing/);

  const late = resolveSeededRace({ ...baseInput, seed: 'late-contact seed 7', raceId: 'R', experiment: 'contact-15-20deg' });
  const lateContact = late.eventRecords.find((event) => event.type === 'duck-contact');
  assert.equal(lateContact.status, 'race-ended-at-finish');
  assert.ok(Object.values(lateContact.recovery).every((detail) => detail.recoveryStatus === 'race-ended-before-recovery'));
});

test('event and diagnostic caps stop before overflow with no result or payout', () => {
  const capInput = { seed: 'Plan13 stability seed 8', raceId: 'R8', playerBaseSpeed: 11.7, fieldBaseSpeed: 11.5,
    choice: 'steady', trialCommitted: false, experiment: 'weave-symmetric' };
  const eventCapped = resolveSeededRace(capInput, { maxMechanicalEvents: 4 });
  assert.equal(eventCapped.status, 'unresolved');
  assert.equal(eventCapped.unresolvedReason, 'mechanical_event_cap');
  assert.equal(eventCapped.guardEvidence.attemptedCount, 5);
  assert.equal(eventCapped.guardEvidence.eventId, 'weave-turn-33-E');
  assert.ok(eventCapped.eventRecords.length <= 4);
  assert.equal(eventCapped.winner, null);
  assert.deepEqual(eventCapped.finish, []);
  assert.equal(eventCapped.eventRecords.some((event) => event.tick === 33), false, 'over-cap tick transaction is discarded as a unit');

  const diagnosticCapped = resolveSeededRace(capInput, { maxOpportunityDiagnostics: 1 });
  assert.equal(diagnosticCapped.status, 'unresolved');
  assert.equal(diagnosticCapped.unresolvedReason, 'opportunity_diagnostic_cap');
  assert.equal(diagnosticCapped.guardEvidence.attemptedCount, 2);
  assert.ok(diagnosticCapped.opportunityRecords.length <= 1);
  assert.equal(diagnosticCapped.winner, null);
  assert.deepEqual(diagnosticCapped.finish, []);
});

test('terminal-step audit separates pre-finish pair proximity from contacts eligible under the one-contact cap', () => {
  const r = resolveSeededRace({ ...baseInput, seed: 'Plan13 finish-order seed 324', raceId: 'F324', experiment: 'contact-15-20deg' });
  const audit = r.terminalStepOrdering;
  assert.equal(audit.dt, PHYSICS.dt);
  assert.equal(audit.contactEpisodeAlreadyUsed, true);
  const nearMiss = audit.contactCandidates.find((candidate) => candidate.participants.join('|') === 'C|E');
  assert.ok(nearMiss);
  assert.equal(nearMiss.beforeOrAtFirstFinish, true);
  assert.equal(nearMiss.passesCurrentClosingCheck, true);
  assert.equal(nearMiss.wouldTriggerUnderOneContactLimit, false);
  assert.ok(nearMiss.timeSeconds < r.finishTimeSeconds);
  assert.equal(audit.wallCandidates.length, 0);
  assert.equal(r.eventRecords.some((event) => event.type === 'duck-contact' && event.tick === audit.tick), false);
});

test('candidate wall and duck impulse fixture shares the stated restitution math', () => {
  const trace = impactFixtureTrace();
  assert.deepEqual(trace.duckContact.pre, { A: 8, B: 6 });
  assert.equal(trace.duckContact.post.A, 6.75);
  assert.equal(trace.duckContact.post.B, 7.25);
  assert.equal(trace.wall.normalSpeedAfter, -2.5);
  assert.equal(trace.wall.tangentialSpeedAfter, 3.6);
});

test('Plan 17 trial multiplies player base speed by five percent once', () => {
  const plain = resolve({ trialCommitted: false }); const trial = resolve({ trialCommitted: true });
  assert.equal(trial.trialConsumptionCount, 1);
  assert.equal(plain.trialConsumptionCount, 0);
  assert.ok(Math.abs(trial.entrants.find((e) => e.id === 'P').sampledPerformance / plain.entrants.find((e) => e.id === 'P').sampledPerformance - 1.05) < 1e-4);
  assert.equal(trial.draws.performance, plain.draws.performance);
});

test('presentation checkpoints follow the committed variable-length trace', () => {
  const r = resolve(); const plan = buildPresentationPlan(r, { reducedMotion: true, camera: 'wide' });
  assert.equal(plan.checkpoints[0], 0);
  assert.ok(Math.abs(plan.checkpoints.at(-1) - r.ticks) < .001);
  for (const tick of plan.checkpoints) assert.ok(Math.abs(sampleTrajectory(r, tick).tick - tick) < .001);
  assert.equal(plan.resultFingerprint, raceFingerprint(r));
});

test('event seeking and saved state preserve the committed race', () => {
  const r = resolve(); const before = raceFingerprint(r); const event = r.eventRecords[0];
  if (event) assert.deepEqual(interpolateSnapshot(r, event.tick), sampleTrajectory(r, event.tick));
  const log = [{ sequence: 1, replay: 0, type: 'presentation cue', tick: 1 }];
  const restored = restorePresentationSnapshot(savePresentationSnapshot(r, { cursorTick: 1, presentationLog: log, finished: true, started: true }));
  assert.equal(raceFingerprint(restored.resolution), before);
  assert.equal(restored.cursorTick, 1);
  assert.deepEqual(restored.presentationLog, log);
});

test('highlight slowdown changes playback mapping only', () => {
  const duration = 20;
  const at = (f, highlightSeconds) => raceFractionAtWallClock(f * duration, { duration, highlightSeconds });
  assert.ok(at(.5, 2) < .5);
  assert.equal(raceFractionAtWallClock(duration + 2, { duration, highlightSeconds: 2 }), 1);
  assert.equal(raceFractionAtWallClock(duration, { duration, highlightSeconds: 0 }), 1);
});
