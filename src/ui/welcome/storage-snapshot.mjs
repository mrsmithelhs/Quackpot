// Identity check only, not an atomic storage transaction.
export function readWelcomeSnapshot(storage, key) {
  try {
    if (!storage) return { readable: false };
    return { readable: true, raw: storage.getItem(key) };
  } catch { return { readable: false }; }
}

export function welcomeSnapshotMatches(previous, current) {
  return Boolean(previous?.readable && current?.readable && previous.raw === current.raw);
}

export function welcomeResumeDisposition(previous, current, livePresentedReceipt) {
  if (welcomeSnapshotMatches(previous, current)) return 'resume';
  return livePresentedReceipt ? 'temporary-receipt' : 'refuse';
}

export function preserveLiveReceipt(engine, setPreservation) {
  if (engine?.state?.phase !== 'receipt_presented') return false;
  setPreservation(true); engine.autosaveEnabled = false; return true;
}

export function isRelevantStorageEvent(event, storage, key) {
  return (event.key === key || event.key === null) && (!event.storageArea || event.storageArea === storage);
}
