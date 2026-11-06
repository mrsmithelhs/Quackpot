// Narrow, best-effort localStorage replacement. The check and write are not atomic.
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
