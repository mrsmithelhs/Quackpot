// A sampled process list cannot establish complete descendant coverage.
export function sampledCleanup({ rootExited, remainingCount, inspectionFailed }) {
  return { rootExited, observedProcessesExited: !inspectionFailed && remainingCount === 0,
    inspectionFailed, coverage: 'sampled-only', uncertainty: true,
    profileRetained: true, treeTerminationConfirmed: false };
}
export function signalOriginalChild(child) {
  if (!child || typeof child.kill !== 'function') throw new TypeError('Original spawned child handle required.');
  return child.kill();
}
