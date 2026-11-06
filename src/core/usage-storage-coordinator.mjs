import { USAGE_HISTORY_KEY, parseHistory, mergeRun, clearHistory } from './usage-history.mjs';

// The caller supplies validated envelopes and projections. Every schema-5 primary,
// backup and history mutation must use this same lock before mounting this module.
export const USAGE_LOCK_NAME = 'quackpot-schema5-storage-v1';

export function createUsageCoordinator({ storage, locks, primaryKey, expectedPrimary, generation }) {
  let expected = expectedPrimary;
  let expectedGeneration = generation;
  let queue = Promise.resolve();
  let session = 0;

  const enqueue = operation => {
    const queuedSession = session;
    const result = queue.then(async () => {
      if (!locks?.request) throw new Error('storage locking unavailable');
      return locks.request(USAGE_LOCK_NAME, { mode: 'exclusive', ifAvailable: true }, async lock => {
        if (!lock) throw new Error('storage is busy; try again');
        if (queuedSession !== session) throw new Error('session changed');
        const history = parseHistory(storage.getItem(USAGE_HISTORY_KEY));
        if (history.generation !== expectedGeneration) throw new Error('history changed in another tab');
        if (storage.getItem(primaryKey) !== expected) throw new Error('save changed in another tab');
        return operation(history);
      });
    });
    queue = result.catch(() => {});
    return result;
  };
  const write = (key, value) => {
    storage.setItem(key, value);
    if (storage.getItem(key) !== value) throw new Error('storage write could not be verified');
  };
  const archive = async (history, run) => {
    const next = await mergeRun(history, run.id, run.entries);
    // Digesting is asynchronous; noncooperating writers remain a documented limit.
    if (storage.getItem(primaryKey) !== expected) throw new Error('save changed during archive');
    write(USAGE_HISTORY_KEY, JSON.stringify(next));
    return next;
  };

  return {
    save(envelope) {
      const bytes = JSON.stringify(envelope);
      return enqueue(() => { write(primaryKey, bytes); expected = bytes; return { success: true }; });
    },
    archive(run) { return enqueue(history => archive(history, run)); },
    replace({ prior, replacement }) {
      const bytes = JSON.stringify(replacement);
      return enqueue(async history => {
        if (expected !== null) {
          const saved = JSON.parse(expected);
          if (!prior || !saved.usageRunId || prior.id !== saved.usageRunId || !Array.isArray(saved.eventLog)) {
            throw new Error('saved run identity unavailable');
          }
          // Verify the archived candidate extends the actual primary, not just a
          // possibly older history record with the same ID.
          if (prior.entries.length < saved.eventLog.length ||
              JSON.stringify(prior.entries.slice(0, saved.eventLog.length)) !== JSON.stringify(saved.eventLog)) {
            throw new Error('saved run evidence changed');
          }
          history = await archive(history, prior);
        }
        if (storage.getItem(primaryKey) !== expected) throw new Error('save changed before replacement');
        write(primaryKey, bytes); expected = bytes; session++;
        return { success: true };
      });
    },
    clearHistory() {
      return enqueue(history => {
        const next = clearHistory(history);
        write(USAGE_HISTORY_KEY, JSON.stringify(next));
        expectedGeneration = next.generation;
        return next;
      });
    },
  };
}
