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
      return enqueue(() => {
        if (expected !== null) {
          const previous = JSON.parse(expected);
          if (previous.usageRunId && previous.usageRunId !== envelope.usageRunId) {
            throw new Error('a different run requires archival before replacement');
          }
          if (!Array.isArray(previous.eventLog) || !Array.isArray(envelope.eventLog) ||
              envelope.eventLog.length < previous.eventLog.length ||
              JSON.stringify(envelope.eventLog.slice(0, previous.eventLog.length)) !== JSON.stringify(previous.eventLog)) {
            throw new Error('saved run evidence changed');
          }
        }
        write(primaryKey, bytes); expected = bytes; return { success: true };
      });
    },
    archive(run) {
      const snapshot = structuredClone(run);
      return enqueue(history => archive(history, snapshot));
    },
    // Only call after the user has confirmed replacement. This preserves the
    // new identity if a later archive or replacement fails.
    bindLegacyId(id, validate) {
      return enqueue(() => {
        if (expected === null) throw new Error('saved run unavailable');
        const envelope = JSON.parse(expected);
        if (envelope.usageRunId) return envelope.usageRunId;
        if (!/^[0-9a-f]{32}$/.test(id)) throw new Error('invalid run identity');
        envelope.usageRunId = id;
        if (!validate(envelope)) throw new Error('bound save is invalid');
        const bytes = JSON.stringify(envelope);
        write(primaryKey, bytes);
        expected = bytes;
        return id;
      });
    },
    replace({ prior, replacement, additionalRuns = [] }) {
      const bytes = JSON.stringify(replacement);
      const priorSnapshot = prior && structuredClone(prior);
      const otherSnapshots = structuredClone(additionalRuns);
      return enqueue(async history => {
        if (expected !== null) {
          const saved = JSON.parse(expected);
          if (!priorSnapshot || !saved.usageRunId || priorSnapshot.id !== saved.usageRunId || !Array.isArray(saved.eventLog)) {
            throw new Error('saved run identity unavailable');
          }
          // Verify the archived candidate extends the actual primary, not just a
          // possibly older history record with the same ID.
          if (priorSnapshot.entries.length < saved.eventLog.length ||
              JSON.stringify(priorSnapshot.entries.slice(0, saved.eventLog.length)) !== JSON.stringify(saved.eventLog)) {
            throw new Error('saved run evidence changed');
          }
          history = await archive(history, priorSnapshot);
        }
        for (const run of otherSnapshots) history = await archive(history, run);
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
