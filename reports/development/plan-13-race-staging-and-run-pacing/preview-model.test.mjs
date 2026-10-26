import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSE_LENGTH,
  PHYSICS,
  buildPresentationPlan,
  curveTargetSpeed,
  impactFixtureTrace,
  interpolateSnapshot,
  raceFingerprint,
  raceFractionAtWallClock,
  raceDuckYaw,
  resolveSeededRace,
  restorePresentationSnapshot,
  sampleTrajectory,
  savePresentationSnapshot,
  turnCap,
} from './preview-model.mjs';

const baseInput = Object.freeze({
  seed: 'Quackpot Plan 13 named-seed example',
  raceId: 'R00',
  playerBaseSpeed: 10.5,
  fieldBaseSpeed: 10.2,
  choice: 'steady',
  trialCommitted: false,
  model: 'baseline',
  duration: 20,
});

function resolve(overrides = {}) { return resolveSeededRace({ ...baseInput, ...overrides }); }

test('fixed-step physics is deterministic and keyed independently from presentation', () => {
  const a = resolve(); const b = resolve();
  assert.equal(a.rulesVersion, 'plan13-physics-v2');
  assert.equal(a.ticks, 400);
  assert.equal(raceFingerprint(a), raceFingerprint(b));
  assert.equal(a.draws.performance, 6);
  assert.ok(a.drawKeys.every((key) => key.startsWith('plan13/v2|R00|')));
  assert.equal(a.trajectory.length, a.ticks + 1);
  assert.equal(a.finish.length, 6);
  assert.deepEqual(a.finish.map((e) => e.place), [1, 2, 3, 4, 5, 6]);
});

test('12, 20 and 30 second horizons have exact fixed tick counts and rank one shared horizon', () => {
  for (const [duration, ticks] of [[12, 240], [20, 400], [30, 600]]) {
    const result = resolve({ duration });
    assert.equal(result.ticks, ticks);
    assert.equal(result.horizonSeconds, duration);
    assert.equal(result.trajectory.at(-1).tick, ticks);
    assert.deepEqual(result.finish.map((e) => e.id), [...result.finish].sort((a, b) => b.progress - a.progress || (a.id === 'P' ? -1 : b.id === 'P' ? 1 : a.id.localeCompare(b.id))).map((e) => e.id));
  }
  assert.ok(COURSE_LENGTH > 245 && COURSE_LENGTH < 246);
});

test('20 Hz acceleration trace reaches 9 m/s and advances 7.575 m after one second', () => {
  const result = resolve({ playerBaseSpeed: 10, fieldBaseSpeed: 10 });
  const first = result.trajectory[20].entrants.find((e) => e.id === 'A');
  assert.equal(first.speed, 9);
  assert.equal(first.progress, 7.575, 'the 20 Hz semi-implicit update sums the post-acceleration speeds');
});

test('corner steering cap forces a lower safe speed at 20 m radius', () => {
  const safe = curveTargetSpeed(19.4);
  assert.ok((safe / 19.4) * 180 / Math.PI <= turnCap(safe) + 1e-8);
  assert.ok((12 / 19.4) * 180 / Math.PI > turnCap(12));
  assert.ok(safe < 12 && safe > 10);
});

test('race duck Y-turn is continuous across both modeled oval bends', () => {
  const straight = PHYSICS.straight;
  const bend = Math.PI * PHYSICS.curveRadius;
  const epsilon = 1e-5;
  assert.ok(Math.abs(raceDuckYaw(0) - 180) < 1e-8, 'top straight mirrors the left-facing source image to face right');
  assert.ok(Math.abs(raceDuckYaw(straight / 2) - 180) < 1e-8);
  assert.ok(Math.abs(raceDuckYaw(straight / 2 + bend / 2) - 90) < 1e-8);
  assert.ok(Math.abs(raceDuckYaw(straight / 2 + bend) - 0) < 1e-8);
  assert.ok(Math.abs(raceDuckYaw(straight / 2 + bend + straight / 2)) < 1e-8, 'bottom straight faces left');
  assert.ok(Math.abs(raceDuckYaw(straight / 2 + bend + straight + bend / 2) - 90) < 1e-8);
  assert.ok(Math.abs(raceDuckYaw(COURSE_LENGTH) - 180) < 1e-8);
  for (const boundary of [straight / 2, straight / 2 + bend, straight / 2 + bend + straight, COURSE_LENGTH - straight / 2]) {
    const before = raceDuckYaw(boundary - epsilon);
    const at = raceDuckYaw(boundary);
    const after = raceDuckYaw(boundary + epsilon);
    assert.ok(Math.abs(before - at) < 0.001 && Math.abs(after - at) < 0.001, `yaw stays continuous at progress ${boundary}`);
  }
});

test('contact mode is deterministic, bounded to one episode, and has a no-contact seed control', () => {
  const contact = resolve({ raceId: 'R00' });
  const repeated = resolve({ raceId: 'R00' });
  const none = resolve({ raceId: 'R01' });
  const contacts = contact.eventRecords.filter((e) => e.type === 'duck-contact');
  assert.equal(contacts.length, 1);
  assert.equal(raceFingerprint(contact), raceFingerprint(repeated));
  assert.ok(contacts[0].participants.length === 2);
  assert.ok(contacts[0].eligiblePairCount >= 1);
  assert.equal(none.eventRecords.filter((e) => e.type === 'duck-contact').length, 0);
});

test('candidate wall and duck impulse fixture shares the stated restitution math', () => {
  const trace = impactFixtureTrace();
  assert.deepEqual(trace.duckContact.pre, { A: 8, B: 6 });
  assert.equal(trace.duckContact.post.A, 6.75);
  assert.equal(trace.duckContact.post.B, 7.25);
  assert.equal(trace.wall.normalSpeedAfter, -2.5);
  assert.equal(trace.wall.tangentialSpeedAfter, 3.6);
});

test('catch-up, wobble and combined treatments have separate keyed events', () => {
  for (const model of ['baseline', 'catchup', 'wobble', 'combined']) {
    const one = resolve({ model }); const two = resolve({ model });
    assert.equal(raceFingerprint(one), raceFingerprint(two));
  }
  const catchup = resolve({ model: 'catchup' });
  const wobble = resolve({ model: 'wobble' });
  assert.ok(catchup.eventRecords.some((e) => e.type === 'catchup-sprint'));
  assert.ok(wobble.eventRecords.some((e) => e.type === 'leader-wobble'));
  assert.ok(catchup.eventRecords.every((e) => e.type !== 'leader-wobble'));
  assert.ok(wobble.eventRecords.every((e) => e.type !== 'catchup-sprint'));
});

test('Plan 17 trial multiplies the player base-speed input once', () => {
  const plain = resolve({ playerBaseSpeed: 10, fieldBaseSpeed: 10 });
  const trial = resolve({ playerBaseSpeed: 10, fieldBaseSpeed: 10, trialCommitted: true });
  const regular = plain.entrants.find((e) => e.id === 'P');
  const boosted = trial.entrants.find((e) => e.id === 'P');
  assert.equal(trial.trialConsumptionCount, 1);
  assert.equal(plain.trialConsumptionCount, 0);
  assert.ok(Math.abs(boosted.sampledPerformance / regular.sampledPerformance - 1.05) < 0.0001);
  assert.equal(trial.draws.performance, plain.draws.performance);
});

test('five reduced-motion checkpoints map to exact stored trajectory ticks', () => {
  for (const [duration, expected] of [[12, [0, 60, 120, 180, 240]], [20, [0, 100, 200, 300, 400]], [30, [0, 150, 300, 450, 600]]]) {
    const result = resolve({ duration });
    const plan = buildPresentationPlan(result, { duration, reducedMotion: true, camera: 'wide' });
    assert.deepEqual(plan.checkpoints, expected);
    assert.deepEqual(plan.checkpoints.map((tick) => sampleTrajectory(result, tick).tick), expected);
    assert.equal(plan.resultFingerprint, raceFingerprint(result));
  }
});

test('event seeking samples the post-event tick without changing the race record', () => {
  const result = resolve();
  const event = result.eventRecords.find((e) => e.type === 'duck-contact');
  assert.ok(event);
  const before = raceFingerprint(result);
  const selected = sampleTrajectory(result, event.tick);
  const interpolated = interpolateSnapshot(result, event.tick);
  assert.equal(selected.tick, event.tick);
  assert.deepEqual(interpolated, selected);
  assert.equal(raceFingerprint(result), before);
});

test('save and restore keeps the trajectory, presentation actions, and selected cursor', () => {
  const result = resolve();
  const log = [{ sequence: 1, replay: 0, type: 'event selected and playback sought', tick: 120, eventId: 'example' }];
  const serialized = savePresentationSnapshot(result, { duration: 20, camera: 'wide', lighting: 'event', reducedMotion: true, cursorTick: 120, presentationLog: log, finished: true, replayNumber: 2, started: true });
  const restored = restorePresentationSnapshot(serialized);
  assert.equal(raceFingerprint(restored.resolution), raceFingerprint(result));
  assert.equal(restored.cursorTick, 120);
  assert.deepEqual(restored.presentationLog, log);
  assert.equal(restored.finished, true);
  assert.equal(restored.replayNumber, 2);
  assert.equal(restored.started, true);
  assert.deepEqual(restored.presentation.checkpoints, [0, 100, 200, 300, 400]);
});

test('slow-motion changes playback mapping only and ends at the committed simulation horizon', () => {
  const duration = 20;
  const at = (fraction, highlightSeconds) => raceFractionAtWallClock(fraction * duration, { duration, highlightSeconds });
  assert.ok(at(0.5, 2) < 0.5);
  assert.equal(raceFractionAtWallClock(duration + 2, { duration, highlightSeconds: 2 }), 1);
  assert.equal(raceFractionAtWallClock(duration, { duration, highlightSeconds: 0 }), 1);
});
