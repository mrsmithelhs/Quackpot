// src/core/storage.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveGame,
  loadGame,
  clearGame,
  backupCorruptSave,
  validateSave,
  STORAGE_KEY,
  BACKUP_KEY,
  resetInMemoryStore,
  setTemporaryPreservationMode,
  isTemporaryPreservationMode,
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
      completedRaces: [],
      raceResults: {},
      billsSettled: [],
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

function makeEnvelopeWithPulls() {
  const rng = createRng('test-pull-seed');
  const rngDraw = rng.fork('draw');
  const rngRace = rng.fork('race');
  const rngEvent = rng.fork('event');

  const log = new EventLog();
  log.append('run_started', { seed: 'test-pull-seed' }, { day: 1, label: 'day 1 morning' });
  
  // Commit 2 draws
  const e1 = log.append('draw_committed', {
    drawIndex: 1, of: 2, pityBefore: 0, drawNumberInWindow: 1,
    odds: { common: 0.8, rare: 0.18, legendary: 0.02 },
    rarity: 'common', identity: 'duck-0', duplicate: false, downGained: 0, advancesPity: false
  }, { day: 1, label: 'day 1 morning' });

  const e2 = log.append('draw_committed', {
    drawIndex: 2, of: 2, pityBefore: 0, drawNumberInWindow: 1,
    odds: { common: 0.8, rare: 0.18, legendary: 0.02 },
    rarity: 'rare', identity: 'duck-2', duplicate: false, downGained: 0, advancesPity: false
  }, { day: 1, label: 'day 1 morning' });

  return {
    schemaVersion: 1,
    savedAt: 1700000000000,
    autosaveEnabled: true,
    state: {
      day: 1,
      clock: { day: 1, label: 'day 1 morning' },
      phase: 'playing',
      cash: 15.00,
      gems: 0,
      health: 100,
      debt: 0,
      down: 0,
      pityCount: 0,
      completedRaces: [],
      raceResults: {},
      billsSettled: [],
      owned: ['duck-0', 'duck-2'],
      pendingReveals: [
        { commitSeq: e1.seq, drawIndex: 1, of: 2, identity: 'duck-0', rarity: 'common', duplicate: false, downGained: 0, advancesPity: false, revealed: false },
        { commitSeq: e2.seq, drawIndex: 2, of: 2, identity: 'duck-2', rarity: 'rare', duplicate: false, downGained: 0, advancesPity: false, revealed: false },
      ],
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
  env.state.cash = 99.99;

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

test('storage [Repair 01 Regression]: rejects PRNG state word with string "bad"', () => {
  const env = makeValidEnvelope();
  const drawObj = JSON.parse(env.prngStreams.draw);
  drawObj.s[1] = 'bad'; // String instead of uint32
  env.prngStreams.draw = JSON.stringify(drawObj);

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('invalid uint32 state word')));
});

test('storage [Repair 01 Regression]: rejects envelope when state.owned is cleared', () => {
  const env = makeEnvelopeWithPulls();
  env.state.owned = []; // Cleared owned inventory while draws exist in log

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('State owned inventory mismatch')));
});

test('storage [Repair 01 Regression]: rejects pending reveal with uncommitted identity "duck-NOT-COMMITTED"', () => {
  const env = makeEnvelopeWithPulls();
  env.state.pendingReveals[0].identity = 'duck-NOT-COMMITTED';

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('identity mismatch')));
});

test('storage: semantic validation detects broken event log hash chain', () => {
  const env = makeValidEnvelope();
  const tamperedLog = structuredClone(env.eventLog);
  tamperedLog[1].payload.amount = 999.00;

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

  mock.setFailWrites(true);
  const env2 = makeValidEnvelope();
  env2.state.cash = 25.00;
  env2.savedAt = 1700000005000;

  const failRes = saveGame(env2, mock);
  assert.equal(failRes.success, false);
  assert.equal(failRes.inMemory, true);

  const loadMemory = loadGame(mock);
  assert.equal(loadMemory.envelope.savedAt, 1700000005000);

  const storedJson = JSON.parse(mock.getItem(STORAGE_KEY));
  assert.equal(storedJson.savedAt, 1700000000000);
});

test('storage [Repair 01]: backupCorruptSave preserves invalid data under backup key', () => {
  const mock = createMockStorage({ [STORAGE_KEY]: 'corrupt-save-data' });
  const backupOk = backupCorruptSave(mock);
  assert.equal(backupOk, true);
  assert.equal(mock.getItem(BACKUP_KEY), 'corrupt-save-data');
  assert.equal(mock.getItem(STORAGE_KEY), 'corrupt-save-data');
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

// --- Review 02 Required Regressions ---

test('storage [Repair 02 Probe 1A]: rejects envelope when pendingReveals queue is removed', () => {
  const env = makeEnvelopeWithPulls();
  env.state.pendingReveals = []; // Probe A: removed entire pending queue while draw_committed events exist

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('pendingReveals length mismatch')));
});

test('storage [Repair 02 Probe 1B]: rejects envelope when pendingReveals item is cloned/duplicated', () => {
  const env = makeEnvelopeWithPulls();
  // Probe B: replaced second item with clone of first item
  env.state.pendingReveals[1] = structuredClone(env.state.pendingReveals[0]);

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('Duplicate commitSeq') || e.includes('commitSeq mismatch')));
});

test('storage [Repair 02 Probe 1C]: rejects envelope when pending downGained is tampered to 999', () => {
  const env = makeEnvelopeWithPulls();
  // Probe C: changed pending downGained to 999
  env.state.pendingReveals[0].downGained = 999;

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('downGained mismatch')));
});

test('storage [Repair 02 Probe 1D]: rejects cleared completedRaces and resets step when race_result is logged', () => {
  const log = new EventLog();
  log.append('run_started', { seed: 'test-seed' }, { day: 1, label: 'day 1 morning' });
  log.append('income', { amount: 10.00, kind: 'wage' }, { day: 1, label: 'day 1 evening' });
  log.append('race_result', {
    raceNumber: 1,
    duckId: 'duck-0',
    stance: 'safe',
    place: 1,
    payoutGems: 50,
    gemsAfter: 50,
    rivalPlace: null,
    playerPerf: 10.2,
  }, { day: 1, label: 'day 1 midday' });
  log.append('reward', { kind: 'race_gems', gems: 50, gemsAfter: 50 }, { day: 1, label: 'day 1 midday' });

  const env = makeValidEnvelope();
  env.eventLog = log.entries;
  env.state.gems = 50;
  // Probe D: legitimately raced, but attacker clears completedRaces, raceResults, and resets step to 'd1_midday_race'
  env.state.completedRaces = [];
  env.state.raceResults = {};
  env.state.step = 'd1_midday_race';

  const val = validateSave(env);
  assert.equal(val.valid, false);
  assert.ok(val.errors.some((e) => e.includes('state.completedRaces missing race 1')));
  assert.ok(val.errors.some((e) => e.includes('race 1 already completed in event log')));
});

test('storage [Repair 02 P2]: temporary preservation mode protects primary snapshot from being overwritten', () => {
  resetInMemoryStore();
  const mock = createMockStorage({ [STORAGE_KEY]: 'original-corrupt-snapshot' });

  // Activate temporary preservation mode
  setTemporaryPreservationMode(true);
  const env = makeValidEnvelope();

  const res = saveGame(env, mock);
  assert.equal(res.success, false);
  assert.equal(res.preservedSnapshot, true);
  assert.equal(res.inMemory, true);

  // Assert primary storage key still contains the original corrupt snapshot!
  assert.equal(mock.getItem(STORAGE_KEY), 'original-corrupt-snapshot');

  // Explicit consent to overwrite replaces it
  const overwriteRes = saveGame(env, mock, true);
  assert.equal(overwriteRes.success, true);
  assert.ok(mock.getItem(STORAGE_KEY).includes('"schemaVersion":1'));
});

test('storage [Repair 02 P2]: backup-key failure does not discard or overwrite primary snapshot', () => {
  resetInMemoryStore();
  // Mock storage that fails only on BACKUP_KEY writes, but succeeds on STORAGE_KEY
  const store = new Map([[STORAGE_KEY, 'precious-corrupted-data']]);
  const mockWithBackupFailure = {
    getItem(k) { return store.get(k) || null; },
    setItem(k, v) {
      if (k === BACKUP_KEY) throw new Error('QuotaExceeded on backup key');
      store.set(k, String(v));
    },
    removeItem(k) { store.delete(k); },
  };

  const backupOk = backupCorruptSave(mockWithBackupFailure);
  assert.equal(backupOk, false);

  // In temporary preservation mode:
  setTemporaryPreservationMode(true);
  const env = makeValidEnvelope();
  const saveRes = saveGame(env, mockWithBackupFailure);

  assert.equal(saveRes.success, false);
  assert.equal(saveRes.preservedSnapshot, true);
  // Verify original snapshot is NOT discarded or overwritten
  assert.equal(mockWithBackupFailure.getItem(STORAGE_KEY), 'precious-corrupted-data');
});
