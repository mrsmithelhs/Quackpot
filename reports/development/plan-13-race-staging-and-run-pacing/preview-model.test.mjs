import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPresentationPlan,
  raceFingerprint,
  raceFractionAtWallClock,
  presentationProgressFraction,
  resolveSeededRace,
  restorePresentationSnapshot,
  savePresentationSnapshot,
} from './preview-model.mjs';

const baseInput = Object.freeze({
  seed: 'Quackpot Plan 13 named-seed example',
  raceId: 'R03',
  playerBaseSpeed: 11.7,
  fieldBaseSpeed: 11.5,
  choice: 'steady',
  model: 'causal',
  trialCommitted: false,
});

const presentationVariants = [
  ...[12, 20, 30].flatMap((duration) => [
    { duration, camera: 'wide' },
    { duration, camera: 'close' },
  ]),
  { duration: 12, camera: 'wide', staticMode: true },
  { duration: 20, camera: 'close', reducedMotion: true },
  { duration: 30, camera: 'close', skipped: true },
  { duration: 20, camera: 'wide', replay: true },
  { duration: 30, camera: 'close', replay: true },
  { duration: 20, camera: 'close', highlightSeconds: 1, lighting: 'warm' },
  { duration: 30, camera: 'close', highlightSeconds: 2, lighting: 'neutral' },
];

for (const model of ['causal', 'resolved']) {
  test(`${model} named-seed resolution is deterministic and presentation-independent`, () => {
    const resolution = resolveSeededRace({ ...baseInput, model });
    const repeated = resolveSeededRace({ ...baseInput, model });
    const expectedTrace = raceFingerprint(resolution);

    assert.equal(raceFingerprint(repeated), expectedTrace);
    for (const options of presentationVariants) {
      const plan = buildPresentationPlan(resolution, options);
      assert.equal(plan.resultFingerprint, expectedTrace, JSON.stringify(options));
      assert.equal(plan.visualLanePaths.length, 6);
      assert.equal(plan.totalWallSeconds, Number(options.duration ?? 20) + Number(options.highlightSeconds ?? 0));
    }
    assert.equal(raceFingerprint(resolution), expectedTrace, 'presentation planning must not mutate the resolved trace');
  });

  test(`${model} save/reload presentation snapshot restores the same mechanical trace`, () => {
    const resolution = resolveSeededRace({ ...baseInput, model });
    const before = raceFingerprint(resolution);
    const saved = savePresentationSnapshot(resolution, {
      duration: 30,
      camera: 'close',
      reducedMotion: false,
      replay: true,
    });
    const restored = restorePresentationSnapshot(saved);
    assert.equal(raceFingerprint(restored.resolution), before);
    assert.equal(restored.presentation.resultFingerprint, before);
  });
}

test('causal mode consumes only its race-local beat draws; resolved mode adds none', () => {
  const causal = resolveSeededRace({ ...baseInput, model: 'causal' });
  const resolved = resolveSeededRace({ ...baseInput, model: 'resolved' });
  assert.deepEqual(causal.draws, { performance: 6, events: 12, total: 18 });
  assert.deepEqual(resolved.draws, { performance: 6, events: 0, total: 6 });
  assert.equal(causal.streamSnapshots.performance, resolved.streamSnapshots.performance);
});

test('Drafting is currently mechanically equivalent to Steady; Sprint changes baseline performance', () => {
  const steady = resolveSeededRace({ ...baseInput, choice: 'steady' });
  const drafting = resolveSeededRace({ ...baseInput, choice: 'drafting' });
  assert.deepEqual(drafting.entrants, steady.entrants);
  assert.deepEqual(drafting.eventRecords, steady.eventRecords);
  assert.deepEqual(drafting.finish, steady.finish);
  assert.equal(drafting.draws.total, steady.draws.total);

  const sprint = resolveSeededRace({ ...baseInput, choice: 'sprint' });
  const steadyPlayerSpeed = steady.entrants.find((entrant) => entrant.player).speed;
  const sprintPlayerSpeed = sprint.entrants.find((entrant) => entrant.player).speed;
  assert.notEqual(sprintPlayerSpeed, steadyPlayerSpeed);
});

test('Plan 17 preview trial multiplies base speed once by the accepted 1.05 factor', () => {
  const withoutTrial = resolveSeededRace({ ...baseInput, model: 'resolved', trialCommitted: false });
  const withTrial = resolveSeededRace({ ...baseInput, model: 'resolved', trialCommitted: true });
  const ordinaryPlayer = withoutTrial.entrants.find((entrant) => entrant.player);
  const trialPlayer = withTrial.entrants.find((entrant) => entrant.player);
  assert.equal(withTrial.trialConsumptionCount, 1);
  assert.equal(withoutTrial.trialConsumptionCount, 0);
  assert.ok(Math.abs(trialPlayer.speed / ordinaryPlayer.speed - 1.05) < 1e-12);
  assert.equal(withTrial.draws.performance, withoutTrial.draws.performance);
});

test('two-lane three-row grid assignments are repeatable and preserve logical lane IDs', () => {
  const result = resolveSeededRace(baseInput);
  const wide = buildPresentationPlan(result, { duration: 12, camera: 'wide' });
  const cinematic = buildPresentationPlan(result, { duration: 30, camera: 'close', highlightSeconds: 2 });
  assert.deepEqual(cinematic.visualLanePaths, wide.visualLanePaths);
  assert.deepEqual(wide.visualLanePaths.map(({ lane, row }) => [lane, row]), [
    [1, 0], [2, 0], [1, 1], [2, 1], [1, 2], [2, 2],
  ]);
  assert.equal(wide.laneChangesEnabled, false);
  assert.deepEqual(result.finish.map(({ id, lane }) => ({ id, lane })),
    resolveSeededRace(baseInput).finish.map(({ id, lane }) => ({ id, lane })));
});

test('displayed finish progress orders entrants exactly like the recorded finish', () => {
  for (const model of ['causal', 'resolved']) {
    const result = resolveSeededRace({ ...baseInput, model });
    const displayEntrants = result.entrants.map((entrant) => ({
      ...entrant,
      presentationEvents: result.eventRecords
        .filter((event) => event.id === entrant.id && event.delta !== 0)
        .map(({ beat, delta }) => ({ beat, delta })),
    }));
    const displayed = [...displayEntrants]
      .sort((a, b) => presentationProgressFraction(b, result.finish, 1) - presentationProgressFraction(a, result.finish, 1))
      .map(({ id }) => id);
    assert.deepEqual(displayed, result.finish.map(({ id }) => id));
  }
});

test('slow-motion highlight remaps only presentation time and adds its declared wall time', () => {
  const duration = 20;
  const oneSecond = { duration, highlightSeconds: 1 };
  const twoSeconds = { duration, highlightSeconds: 2 };
  const baseAtMidBeat = duration * 0.4;
  const oneSlowAtMidBeat = raceFractionAtWallClock(baseAtMidBeat, oneSecond);
  const twoSlowAtMidBeat = raceFractionAtWallClock(baseAtMidBeat, twoSeconds);
  assert.ok(oneSlowAtMidBeat < 0.4);
  assert.ok(twoSlowAtMidBeat < oneSlowAtMidBeat);
  assert.equal(raceFractionAtWallClock(duration + 1, oneSecond), 1);
  assert.equal(raceFractionAtWallClock(duration + 2, twoSeconds), 1);
});
