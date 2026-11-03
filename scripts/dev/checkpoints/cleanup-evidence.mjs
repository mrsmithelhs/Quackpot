// Evidence policy is specific to Plan 52 checkpoint proofs. Other consumers
// continue to require their existing strict cleanup contract.
export function acceptsPlan52Cleanup(cleanup, policy) {
  if (policy === undefined || policy === 'strict-v1') return cleanup?.residual === false && cleanup?.uncertainty === false;
  if (policy !== 'sampled-observation-v1') return false;
  return cleanup?.rootExited === true && cleanup?.observedProcessesExited === true
    && cleanup?.inspectionFailed === false && cleanup?.residual === false
    && cleanup?.coverage === 'sampled-only' && cleanup?.uncertainty === true
    && cleanup?.treeTerminationConfirmed === false && cleanup?.profileRetained === true;
}
