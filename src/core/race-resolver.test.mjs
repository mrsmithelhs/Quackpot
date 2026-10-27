import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveSeededRace,
  serializeRaceResolution,
  restoreRaceResolution,
  raceFingerprint,
  MAX_SERIALIZED_RACE_RESOLUTION_BYTES,
} from './race-resolver.mjs';

const input = {
  seed: 'plan23-production-codec-fixture', raceId: 'R01', playerBaseSpeed: 10,
  restFactor: 1, fieldBaseSpeed: 8, choice: 'steady', trialCommitted: false,
  trialMultiplier: 1.05, experiment: 'weave-rank-strong-contact',
  dramaArm: 'R2combined-risk-only', studySprintMean: 1,
};

test('Plan 23 resolver save projection restores full renderer and mechanical evidence losslessly', () => {
  const resolution = resolveSeededRace(input);
  assert.equal(resolution.status, 'finished');
  const saved = serializeRaceResolution(resolution);
  const restored = restoreRaceResolution(saved.encoded);

  assert.ok(saved.bytes < MAX_SERIALIZED_RACE_RESOLUTION_BYTES);
  assert.equal(raceFingerprint(restored), raceFingerprint(resolution));
  assert.deepEqual(restored.trajectory, resolution.trajectory);
  assert.deepEqual(restored.eventRecords, resolution.eventRecords);
  assert.deepEqual(restored.opportunityRecords, resolution.opportunityRecords);
  assert.deepEqual(restored.finishCrossings, resolution.finishCrossings);
  assert.deepEqual(restored.finish, resolution.finish);
  assert.equal(restored.firstCrossingWitness, null, 'the report-only parity witness is not production save data');
});

test('Plan 23 resolver rejects digest and coordinate tampering without rerunning', () => {
  const saved = serializeRaceResolution(resolveSeededRace(input));
  const changedDigest = structuredClone(saved.encoded);
  changedDigest.digest = '00000000';
  assert.throws(() => restoreRaceResolution(changedDigest), /digest mismatch/);

  const changedCoordinate = structuredClone(saved.encoded);
  changedCoordinate.trajectory[0][1][0][4] += 0.01;
  assert.throws(() => restoreRaceResolution(changedCoordinate), /digest mismatch/);
});

test('Plan 23 serialized race budget is enforced without truncating evidence', () => {
  const resolution = structuredClone(resolveSeededRace(input));
  resolution.inputs.auditPadding = 'x'.repeat(MAX_SERIALIZED_RACE_RESOLUTION_BYTES);
  assert.throws(() => serializeRaceResolution(resolution), /exceeds the .* per-race limit/);
  assert.equal(resolution.trajectory.length > 0, true, 'over-budget mechanics are rejected, never truncated');
});

test('Plan 23 resolver rejects non-finite raw inputs and unsupported modifiers', () => {
  assert.throws(() => resolveSeededRace({ ...input, playerBaseSpeed: NaN }), /playerBaseSpeed/);
  assert.throws(() => resolveSeededRace({ ...input, trialMultiplier: 1.1 }), /trial multiplier/);
  assert.throws(() => resolveSeededRace({ ...input, dramaArm: 'retuned' }), /adopted R2combined-risk-only/);
});

test('Plan 23 affine conversion preserves all three roster tiers above the old speed cap', () => {
  const mapped = [10, 14, 20].map((rating) => {
    const result = resolveSeededRace({ ...input, seed: 'plan23-affine-tier-fixture', playerBaseSpeed: rating });
    const player = result.entrants.find((entrant) => entrant.id === 'P');
    assert.ok(Math.abs(player.topSpeed - (8.25 + 0.5 * player.sampledPerformance)) < 0.0011);
    return player.topSpeed;
  });
  assert.ok(mapped[0] < mapped[1] && mapped[1] < mapped[2]);
  assert.ok(mapped[1] > 12, 'Rare input survives beyond the previous 8–12 top-speed cap');
  assert.ok(mapped[2] > 12, 'Legendary input survives beyond the previous 8–12 top-speed cap');
});
