// Narrow, best-effort localStorage replacement. The check and write are not atomic.
export function restartConfirmationText(priorPhase, hasPrimary, autosave) {
  const live = hasPrimary && !['terminal', 'receipt_presented'].includes(priorPhase);
  const replaced = live ? 'The finished Receipt and a separate saved run will be replaced.' : hasPrimary ? 'The finished Receipt and the saved record will be replaced.' : 'The finished Receipt will be replaced.';
  const timing = autosave ? ' The new run will be saved now.' : hasPrimary ? ' The existing saved record will remain until you choose Save or enable automatic saving.' : ' The new run will be saved only when you choose Save or enable automatic saving.';
  return `${replaced}${timing} Continue?`;
}

export function replaceRestartSnapshot(storage, key, expected, envelope, validate) {
  let serialized;
  try {
    serialized = JSON.stringify(envelope);
    if (!validate(JSON.parse(serialized))) return { success: false, reason: 'invalid-candidate' };
    if (!storage || storage.getItem(key) !== expected) return { success: false, reason: 'changed' };
  } catch { return { success: false, reason: 'unavailable' }; }
  try {
    storage.setItem(key, serialized);
    if (storage.getItem(key) !== serialized) return { success: false, reason: 'changed-after-write' };
    return { success: true };
  } catch { return { success: false, reason: 'write-or-readback-failed' }; }
}
