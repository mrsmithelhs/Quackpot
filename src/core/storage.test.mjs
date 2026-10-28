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
import { GameEngine } from './game-engine.mjs';
import { resolveSeededRace, restoreRaceResolution, serializeRaceResolution } from './race-resolver.mjs';

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

test('storage [Plan 23]: schema-v1 migration creates only summary-only race state', () => {
  resetInMemoryStore();
  const legacy = makeValidEnvelope();
  legacy.state.raceResults = {
    1: { raceNumber: 1, place: 2, payoutGems: 20, rivalPlace: 1, playerPerf: 10 },
  };
  legacy.state.completedRaces = [1];
  legacy.state.step = 'd1_midday_race_result';
  const legacyLog = EventLog.hydrate(legacy.eventLog);
  legacyLog.append('race_result', {
    raceNumber: 1, place: 2, payoutGems: 20, rivalPlace: 1, playerPerf: 10,
  }, legacy.state.clock);
  legacy.eventLog = legacyLog.entries;
  const storage = createMockStorage({ [STORAGE_KEY]: JSON.stringify(legacy) });

  const loaded = loadGame(storage);
  assert.equal(loaded.valid, true, JSON.stringify(loaded.errors));
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.envelope.schemaVersion, 3);
  assert.equal(loaded.envelope.raceRestEvidenceVersion, 1);
  assert.equal(loaded.envelope.state.raceAttempts[1].legacySummaryOnly, true);
  assert.equal(loaded.envelope.state.raceResolutions['R01'], undefined,
    'migration must not fabricate trajectories or displayed race cues');
  assert.deepEqual(loaded.envelope.eventLog, legacy.eventLog,
    'migration leaves the historical hash-chained log unchanged');
});

function makeFinishedPlan23Envelope() {
  const engine = new GameEngine('root-plan23-attempt-consistency');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  engine.runRace(1, engine.state.owned[0], 'safe');
  return engine.toEnvelope();
}

function makeTiredPlan22Envelope() {
  const engine = new GameEngine('root-plan22-downgrade-probe');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  const duckId = engine.state.owned[0];
  engine.runRace(1, duckId, 'safe');
  engine.runRace(2, duckId, 'safe');
  return engine.toEnvelope();
}

function stripRestEvidence(envelope, type) {
  const changed = new EventLog();
  for (const entry of envelope.eventLog) {
    const payload = structuredClone(entry.payload);
    if (entry.type === type) delete payload.restEvidence;
    changed.append(entry.type, payload, entry.clock);
  }
  return { ...envelope, eventLog: changed.entries };
}

test('storage [Plan 22]: post-policy finished and unresolved rest evidence cannot be removed', () => {
  const finished = stripRestEvidence(makeFinishedPlan23Envelope(), 'race_result');
  const finishedResult = validateSave(finished);
  assert.equal(finishedResult.valid, false);
  assert.ok(finishedResult.errors.some((error) => /missing required rest evidence/.test(error)));

  const engine = new GameEngine('plan22-unresolved-evidence');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  engine.resolveRaceCandidate = (input) => resolveSeededRace(input, { maxCompletionTicks: 1 });
  const attempt = engine.runRace(1, engine.state.owned[0], 'safe');
  assert.equal(attempt.status, 'unresolved');
  const unresolved = stripRestEvidence(engine.toEnvelope(), 'race_attempt_unresolved');
  const unresolvedResult = validateSave(unresolved);
  assert.equal(unresolvedResult.valid, false);
  assert.ok(unresolvedResult.errors.some((error) => /missing required rest evidence/.test(error)));
});

test('storage [Plan 22]: schema downgrade and stripped rest caches cannot relabel a tired resolver result as legacy', () => {
  const envelope = makeTiredPlan22Envelope();
  const tiredRace = envelope.eventLog.find((entry) => entry.type === 'race_result' && entry.payload.raceNumber === 2);
  assert.equal(tiredRace.payload.restEvidence.restFactor, 0.5);

  envelope.schemaVersion = 2;
  delete envelope.raceRestEvidenceVersion;
  const legacyLabel = validateSave(envelope);
  assert.equal(legacyLabel.valid, false);
  assert.ok(legacyLabel.errors.some((error) => /requires schema 3/.test(error)));

  const downgraded = structuredClone(envelope);
  downgraded.eventLog = downgraded.eventLog
    .filter((entry) => entry.type !== 'race_rest_policy_activated')
    .map((entry) => {
      const payload = structuredClone(entry.payload);
      delete payload.restEvidence;
      if (Array.isArray(payload.candidates)) delete payload.candidates;
      return { type: entry.type, payload, clock: entry.clock };
    });
  const rechained = new EventLog();
  downgraded.eventLog.forEach((entry) => rechained.append(entry.type, entry.payload, entry.clock));
  downgraded.eventLog = rechained.entries;
  for (const attempt of Object.values(downgraded.state.raceAttempts)) delete attempt.restEvidence;
  for (const result of Object.values(downgraded.state.raceResults)) delete result.restEvidence;
  const stripped = validateSave(downgraded);
  assert.equal(stripped.valid, false);
  assert.ok(stripped.errors.some((error) => /requires schema 3/.test(error)), JSON.stringify(stripped.errors));
});

test('storage [Plan 22]: pre-policy schema 2 factor-1 race remains valid without new-policy facts', () => {
  const envelope = makeFinishedPlan23Envelope();
  envelope.schemaVersion = 2;
  delete envelope.raceRestEvidenceVersion;
  envelope.eventLog = envelope.eventLog
    .filter((entry) => entry.type !== 'race_rest_policy_activated')
    .map((entry) => {
      const payload = structuredClone(entry.payload);
      delete payload.restEvidence;
      if (Array.isArray(payload.candidates)) delete payload.candidates;
      return { type: entry.type, payload, clock: entry.clock };
    });
  const rechained = new EventLog();
  envelope.eventLog.forEach((entry) => rechained.append(entry.type, entry.payload, entry.clock));
  envelope.eventLog = rechained.entries;
  for (const attempt of Object.values(envelope.state.raceAttempts)) delete attempt.restEvidence;
  for (const result of Object.values(envelope.state.raceResults)) delete result.restEvidence;
  const valid = validateSave(envelope);
  assert.equal(valid.valid, true, JSON.stringify(valid.errors));
});

test('storage [Plan 22]: post-policy event, choice identity, caches, and resolution inputs stay bound', () => {
  const baseline = makeTiredPlan22Envelope();
  assert.equal(validateSave(baseline).valid, true);

  const badCache = structuredClone(baseline);
  badCache.state.raceResults[2].restEvidence.restFactor = 0.75;
  const cacheResult = validateSave(badCache);
  assert.equal(cacheResult.valid, false);
  assert.ok(cacheResult.errors.some((error) => /raceResults\[2\]\.restEvidence/.test(error)));

  const badIdentity = structuredClone(baseline);
  const log = new EventLog();
  for (const entry of badIdentity.eventLog) {
    const payload = structuredClone(entry.payload);
    if (entry.type === 'action' && payload.kind === 'race_choice' && payload.raceId === 'R02') payload.duckId = 'duck-999';
    log.append(entry.type, payload, entry.clock);
  }
  badIdentity.eventLog = log.entries;
  const identityResult = validateSave(badIdentity);
  assert.equal(identityResult.valid, false);
  assert.ok(identityResult.errors.some((error) => /missing required rest evidence|rest evidence does not match its completed history or action/.test(error)));

  const badResolution = structuredClone(baseline);
  const alteredResolution = structuredClone(restoreRaceResolution(badResolution.state.raceResolutions.R02));
  alteredResolution.inputs.restFactor = 0.75;
  badResolution.state.raceResolutions.R02 = serializeRaceResolution(alteredResolution).encoded;
  const resolutionResult = validateSave(badResolution);
  assert.equal(resolutionResult.valid, false);
  assert.ok(resolutionResult.errors.some((error) => /resolver inputs do not match required rest evidence/.test(error)));

  const badRating = structuredClone(baseline);
  const ratingLog = new EventLog();
  for (const entry of badRating.eventLog) {
    const payload = structuredClone(entry.payload);
    if (entry.type === 'action' && payload.kind === 'race_choice' && payload.raceId === 'R01') {
      payload.restEvidence.authoredRating = 999;
    }
    ratingLog.append(entry.type, payload, entry.clock);
  }
  badRating.eventLog = ratingLog.entries;
  const ratingResult = validateSave(badRating);
  assert.equal(ratingResult.valid, false);
  assert.ok(ratingResult.errors.some((error) => /invalid authored rating/.test(error)));
});

test('storage [Plan 22]: policy activation must precede each bound race-choice action', () => {
  const envelope = makeFinishedPlan23Envelope();
  const activation = envelope.eventLog.find((entry) => entry.type === 'race_rest_policy_activated');
  const reordered = envelope.eventLog.filter((entry) => entry.type !== 'race_rest_policy_activated');
  const actionIndex = reordered.findIndex((entry) => entry.type === 'action' && entry.payload?.kind === 'race_choice' && entry.payload.raceId === 'R01');
  reordered.splice(actionIndex + 1, 0, activation);
  const log = new EventLog();
  reordered.forEach((entry) => log.append(entry.type, entry.payload, entry.clock));
  envelope.eventLog = log.entries;
  const result = validateSave(envelope);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => /missing required rest evidence or its committed choice action/.test(error)));
});

test('storage [Plan 23]: finished cached attempt must match canonical race record and resolution', () => {
  const envelope = makeFinishedPlan23Envelope();
  const baseline = validateSave(envelope);
  assert.equal(baseline.valid, true, JSON.stringify(baseline.errors));

  envelope.state.raceAttempts[1] = {
    ...envelope.state.raceAttempts[1],
    place: 6,
    payoutGems: 999,
    duckId: 'duck-999',
    finishOrder: envelope.state.raceAttempts[1].finishOrder.slice().reverse(),
  };

  const corrupted = validateSave(envelope);
  assert.equal(corrupted.valid, false);
  assert.ok(corrupted.errors.some((error) => error.includes('raceAttempts[1].place')));
  assert.ok(corrupted.errors.some((error) => error.includes('raceAttempts[1].payoutGems')));
  assert.ok(corrupted.errors.some((error) => error.includes('raceAttempts[1].duckId')));
  assert.ok(corrupted.errors.some((error) => error.includes('raceAttempts[1].finishOrder')));
});

test('storage [Plan 23]: same-length altered finish-order cache is rejected', () => {
  const envelope = makeFinishedPlan23Envelope();
  const order = envelope.state.raceAttempts[1].finishOrder;
  envelope.state.raceAttempts[1].finishOrder = [order[1], order[0], ...order.slice(2)];
  assert.equal(envelope.state.raceAttempts[1].finishOrder.length, order.length);

  const corrupted = validateSave(envelope);
  assert.equal(corrupted.valid, false);
  assert.ok(corrupted.errors.some((error) => error.includes('raceAttempts[1].finishOrder')));
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
