import test from 'node:test';
import assert from 'node:assert/strict';
import { assessCapture, publicCleanup } from './capture-policy.mjs';

test('capture rejects uncertain cleanup independently of passing artifact checks', () => {
  const capture = { kind: 'bounce', imagesLoaded: true, expectedArt: true, idsUnique: true, rigs: true, stagesInside: true, noHorizontalOverflow: true };
  const input = { error: null, focusedTest: { code: 0, signal: null }, exceptions: [],
    results: [...Array.from({ length: 44 }, () => ({ ...capture })), { lifecycle: { pause: true } }, { lifecycle: { pause: true } }],
    serverObservedExited: true, cleanup: { rootExited: true, observedProcessesExited: true, inspectionFailed: false,
      residual: false, treeTerminationConfirmed: false, uncertainty: true } };
  assert.deepEqual(assessCapture(input), { artifactChecksPassed: true, cleanupFullyVerified: false, accepted: false });
  input.cleanup.treeTerminationConfirmed = true; input.cleanup.uncertainty = false;
  assert.equal(assessCapture(input).accepted, true);
  for (const [field, invalid] of [['rootExited',false],['observedProcessesExited',false],['inspectionFailed',true],
    ['residual',true],['treeTerminationConfirmed',false],['uncertainty',true]]) {
    const broken = { ...input, cleanup: { ...input.cleanup, [field]: invalid } };
    assert.equal(assessCapture(broken).cleanupFullyVerified, false, field);
    assert.equal(assessCapture(broken).accepted, false, field);
  }
  input.serverObservedExited = false;
  assert.equal(assessCapture(input).accepted, false);
  const clean = publicCleanup({ profileIdSha256: 'hash', trackedDescendants: [{ pid: 123 }], remainingDescendants: [] });
  assert.deepEqual(clean, { profileIdSha256: 'hash', trackedDescendantCount: 1, remainingDescendantCount: 0 });
});
