import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveGame,
  loadGame,
  clearGame,
  validateSave,
  STORAGE_KEY,
  resetInMemoryStore
} from './storage.mjs';
import { EventLog } from './event-log.mjs';
import { createRng } from './prng.mjs';

function createMockStorage(initialData = {}) {
  const store = new Map(Object.entries(initialData));
  let failWrites = false;
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) {
      if (failWrites) throw new Error('QuotaExceededError: storage is full');
      store.set(k, String(v));
    },
    removeItem(k) { store.delete(k); },
    setFailWrites(flag) { failWrites = flag; },
    _store: store,
  };
}

function makeValidEnvelope() {
  const rng = createRng('test-seed');
  const rngDraw = rng.fork('draw');
  const rngRace = rng.fork('race');
  const rngEvent = rng.fork('event');

  const log = new EventLog();
  log.append('run_started', { seed: 'test-seed' }, { day: 1, label: 'day 1 morning' });
  log.append('income', { amount: 10.00, kind: 'wage' }, { day: 1, label: 'day 1 evening' });

  return {
    schemaVersion: 1,
    savedAt: 1700000000000,
    autosaveEnabled: true,
    state: {
      day: 1,
      clock: { day: 1, label: 'day 1 evening' },
      phase: 'playing',
      cash: 25.00, // 15 initial + 10 wage
      gems: 0,
      health: 100,
      debt: 0,
      down: 0,
      pityCount: 0,
      owned: [],
      pendingReveals: [],
    },
    prngStreams: {
      root: rng.serialize(),
      draw: rngDraw.serialize(),
      race: rngRace.serialize(),
      event: rngEvent.serialize(),
    },
    eventLog: log.entries,
  };
}

test('storage: saves and loads valid game envelope cleanly', () => {
  resetInMemoryStore();
  const mock = createMockStorage();
  const env = makeValidEnvelope();

  const saveRes = saveGame(env, mock);
  assert.equal(saveRes.success, true);
  assert.equal(saveRes.inMemory, false);

  const loadRes = loadGame(mock);
  assert.equal(loadRes.valid, true);
  assert.equal(loadRes.isCorrupt, false);
  assert.equal(loadRes.envelope.state.cash, 25.00);
});

test('storage: semantic validation detects mismatched state values', () => {
  const env = makeValidEnvelope();
  env.state.cash = 99.99; // Mismatched cash!

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('State cash mismatch')));
});

test('storage: semantic validation detects corrupted PRNG streams', () => {
  const env = makeValidEnvelope();
  env.prngStreams.draw = 'not a json';

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('PRNG snapshot')));
});

test('storage: semantic validation detects broken event log hash chain', () => {
  const env = makeValidEnvelope();
  // Tamper with event log
  const tamperedLog = structuredClone(env.eventLog);
  tamperedLog[1].payload.amount = 999.00; // breaks hash chain

  env.eventLog = tamperedLog;
  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('verifyChain')));
});

test('storage: write failure activates in-memory session and leaves stored snapshot untouched', () => {
  resetInMemoryStore();
  const mock = createMockStorage();
  const env1 = makeValidEnvelope();
  saveGame(env1, mock);

  // Enable failure on future writes
  mock.setFailWrites(true);
  const env2 = makeValidEnvelope();
  env2.state.cash = 25.00;
  env2.savedAt = 1700000005000;

  const failRes = saveGame(env2, mock);
  assert.equal(failRes.success, false);
  assert.equal(failRes.inMemory, true);

  // In-memory session holds new save
  const loadMemory = loadGame(mock);
  assert.equal(loadMemory.envelope.savedAt, 1700000005000);

  // But the mock storage item in localStorage still contains the older env1 snapshot!
  const storedJson = JSON.parse(mock.getItem(STORAGE_KEY));
  assert.equal(storedJson.savedAt, 1700000000000);
});

test('storage: loadGame safely flags malformed JSON without crashing', () => {
  resetInMemoryStore();
  const mock = createMockStorage({ [STORAGE_KEY]: 'broken {json[' });
  const loadRes = loadGame(mock);
  assert.equal(loadRes.valid, false);
  assert.equal(loadRes.isCorrupt, true);
  assert.ok(loadRes.errors[0].includes('JSON parse failure'));
});

test('storage: clearGame clears both storage and in-memory store', () => {
  resetInMemoryStore();
  const mock = createMockStorage();
  const env = makeValidEnvelope();
  saveGame(env, mock);
  assert.ok(mock.getItem(STORAGE_KEY));

  clearGame(mock);
  assert.equal(mock.getItem(STORAGE_KEY), null);
  const loadRes = loadGame(mock);
  assert.equal(loadRes.envelope, null);
});
