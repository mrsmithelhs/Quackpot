// Fail closed: rendered artifact assertions and cleanup are separate facts.
export function assessCapture({ error, focusedTest, results, exceptions, cleanup, serverObservedExited }) {
  const captures = Array.isArray(results) ? results.filter((item) => item.kind) : [];
  const lifecycle = Array.isArray(results) ? results.filter((item) => item.lifecycle) : [];
  const artifactChecksPassed = !error && focusedTest?.code === 0 && focusedTest?.signal === null
    && Array.isArray(exceptions) && exceptions.length === 0
    && captures.length === 44 && lifecycle.length === 2
    && captures.every((item) => item.imagesLoaded === true && item.expectedArt === true && item.idsUnique === true
      && item.rigs === true && item.stagesInside === true && item.noHorizontalOverflow === true)
    && lifecycle.every((item) => Object.values(item.lifecycle).every((value) => value === true));
  const cleanupFullyVerified = serverObservedExited === true && cleanup?.rootExited === true
    && cleanup?.observedProcessesExited === true && cleanup?.inspectionFailed === false
    && cleanup?.residual === false && cleanup?.treeTerminationConfirmed === true && cleanup?.uncertainty === false;
  return { artifactChecksPassed, cleanupFullyVerified, accepted: artifactChecksPassed && cleanupFullyVerified };
}

export function publicCleanup(cleanup) {
  if (!cleanup) return null;
  const keys = ['residual','rootExited','observedProcessesExited','inspectionFailed','coverage','uncertainty',
    'profileRetained','treeTerminationConfirmed','childExitCode','profileRemoved','profileIdSha256','chromeStderrPresent'];
  const publicFields = Object.fromEntries(keys.filter((key) => Object.hasOwn(cleanup,key)).map((key) => [key,cleanup[key]]));
  return { ...publicFields, trackedDescendantCount: Array.isArray(cleanup.trackedDescendants) ? cleanup.trackedDescendants.length : null,
    remainingDescendantCount: Array.isArray(cleanup.remainingDescendants) ? cleanup.remainingDescendants.length : null };
}
