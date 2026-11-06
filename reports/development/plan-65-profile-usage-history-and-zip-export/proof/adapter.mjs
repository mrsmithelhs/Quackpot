// Synthetic, unmounted contract model. Not game code or a browser storage implementation.
import { createHash } from 'node:crypto';

const digest = log => createHash('sha256').update(JSON.stringify(log)).digest('hex');
const copy = value => JSON.parse(JSON.stringify(value));

export class MemoryStorage {
  constructor() { this.data = new Map(); this.fault = null; }
  get(key) { if (this.fault?.(`get:${key}`)) throw Error(`fault:get:${key}`); return this.data.get(key) ?? null; }
  set(key, value) { if (this.fault?.(`set:${key}`)) throw Error(`fault:set:${key}`); this.data.set(key, value); }
}

// Models a shared exclusive lock, not Web Locks scheduling, browser persistence or old tabs.
export class Lock {
  #tail = Promise.resolve();
  run(fn) { const result = this.#tail.then(fn); this.#tail = result.catch(() => {}); return result; }
}

const empty = generation => ({ version: 1, generation, records: {} });
const readHistory = storage => {
  const raw = storage.get('history');
  if (raw === null) return { raw, value: empty(0) };
  const value = JSON.parse(raw);
  if (value.version !== 1 || !Number.isSafeInteger(value.generation) || !value.records) throw Error('invalid history');
  return { raw, value };
};
const writeVerified = (storage, key, bytes) => {
  storage.set(key, bytes);
  if (storage.get(key) !== bytes) throw Error(`unverified:${key}`);
};

export class Coordinator {
  #queue = Promise.resolve();
  #session = 0;
  constructor(storage, lock, expectedPrimary, historyGeneration) {
    Object.assign(this, { storage, lock, expectedPrimary, historyGeneration });
  }
  #enqueue(fn) {
    const session = this.#session;
    const result = this.#queue.then(() => this.lock.run(() => {
      if (session !== this.#session) throw Error('stale session');
      const history = readHistory(this.storage);
      if (history.value.generation !== this.historyGeneration) throw Error('history changed');
      if (this.storage.get('primary') !== this.expectedPrimary) throw Error('primary changed');
      return fn(history);
    }));
    this.#queue = result.catch(() => {});
    return result;
  }
  // expectedPrimary advances only after this coordinator verifies its own write.
  save(envelope) {
    const candidate = JSON.stringify(copy(envelope));
    return this.#enqueue(() => {
      writeVerified(this.storage, 'primary', candidate);
      this.expectedPrimary = candidate;
      return candidate;
    });
  }
  archive(run) {
    const candidate = copy(run);
    return this.#enqueue(history => this.#archive(history.value, candidate));
  }
  #archive(history, run) {
    if (!run.id || !Array.isArray(run.log)) throw Error('invalid run');
    const prior = history.records[run.id];
    if (prior && run.log.length < prior.count) throw Error('shorter unverified');
    if (prior && digest(run.log.slice(0, prior.count)) !== prior.digest) throw Error('conflict');
    history.records[run.id] = { count: run.log.length, digest: digest(run.log),
      // Synthetic allowlisted projection, intentionally truncated independently of digest.
      timeline: run.log.slice(0, 2), omitted: Math.max(0, run.log.length - 2) };
    writeVerified(this.storage, 'history', JSON.stringify(history));
  }
  // Confirmation is an explicit input; a legacy primary is not changed before it.
  restart({ confirmed, priorRun, replacement, legacyId }) {
    if (!confirmed) return Promise.resolve({ cancelled: true });
    return this.#enqueue(history => {
      let current = this.expectedPrimary === null ? null : JSON.parse(this.expectedPrimary);
      if (current && !current.id) {
        if (!legacyId) throw Error('missing legacy id');
        current.id = legacyId;
        const bound = JSON.stringify(current);
        writeVerified(this.storage, 'primary', bound);
        this.expectedPrimary = bound; // An ensuing failure does not undo confirmed binding.
      }
      if (current && !priorRun) throw Error('missing prior evidence');
      if (priorRun && current && priorRun.id !== current.id) throw Error('identity mismatch');
      if (priorRun) this.#archive(history.value, copy(priorRun));
      const candidate = JSON.stringify(copy(replacement));
      writeVerified(this.storage, 'primary', candidate);
      this.expectedPrimary = candidate;
      this.#session++;
      return { saved: true };
    });
  }
  clearHistory() {
    return this.#enqueue(history => {
      const next = empty(history.value.generation + 1);
      writeVerified(this.storage, 'history', JSON.stringify(next));
      this.historyGeneration = next.generation;
      return next.generation;
    });
  }
}
