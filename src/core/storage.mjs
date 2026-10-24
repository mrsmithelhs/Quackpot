// LocalStorage envelope adapter with deep semantic restore validation and in-memory fallback.

import { verifyChain } from './event-log.mjs';

export const STORAGE_KEY = 'quackpot_save_v1';
export const CURRENT_SCHEMA_VERSION = 1;

// In-memory fallback session store when localStorage is unavailable or throws quota error
let inMemoryStore = null;
let inMemoryActive = false;

export function getInMemoryStatus() {
  return inMemoryActive;
}

export function resetInMemoryStore() {
  inMemoryStore = null;
  inMemoryActive = false;
}

/**
 * Validates a save envelope semantically.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateSave(envelope) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, errors: ['Save payload is not an object'] };
  }

  if (envelope.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    errors.push(`Incompatible schema version: expected ${CURRENT_SCHEMA_VERSION}, got ${envelope.schemaVersion}`);
  }

  if (typeof envelope.savedAt !== 'number' || isNaN(envelope.savedAt) || envelope.savedAt <= 0) {
    errors.push('Invalid savedAt timestamp');
  }

  const state = envelope.state;
  if (!state || typeof state !== 'object') {
    errors.push('Missing or invalid state object');
  } else {
    if (typeof state.cash !== 'number' || isNaN(state.cash) || state.cash < 0) {
      errors.push(`Invalid cash balance: ${state.cash}`);
    }
    if (typeof state.gems !== 'number' || isNaN(state.gems) || state.gems < 0) {
      errors.push(`Invalid gems balance: ${state.gems}`);
    }
    if (typeof state.health !== 'number' || isNaN(state.health) || state.health < 0) {
      errors.push(`Invalid health: ${state.health}`);
    }
    if (!Array.isArray(state.owned)) {
      errors.push('state.owned must be an array');
    }
    if (!Array.isArray(state.pendingReveals)) {
      errors.push('state.pendingReveals must be an array');
    }
    if (!['setup', 'playing', 'escalation', 'terminal', 'receipt_presented'].includes(state.phase)) {
      errors.push(`Invalid state.phase: ${state.phase}`);
    }
  }

  // Validate PRNG streams
  const streams = envelope.prngStreams;
  if (!streams || typeof streams !== 'object') {
    errors.push('Missing prngStreams object');
  } else {
    for (const name of ['root', 'draw', 'race', 'event']) {
      const raw = streams[name];
      if (typeof raw !== 'string') {
        errors.push(`Missing or non-string prngStream: ${name}`);
        continue;
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed.v !== 1 || parsed.alg !== 'sfc32' || typeof parsed.key !== 'string' || !Array.isArray(parsed.s) || parsed.s.length !== 4) {
          errors.push(`Invalid sfc32 format in stream ${name}`);
        }
      } catch (err) {
        errors.push(`Failed to parse PRNG snapshot ${name}: ${err.message}`);
      }
    }
  }

  // Validate EventLog
  const entries = envelope.eventLog;
  if (!Array.isArray(entries)) {
    errors.push('eventLog must be an array');
  } else {
    if (!verifyChain(entries)) {
      errors.push('eventLog failed verifyChain (corrupted hash chain or non-sequential IDs)');
    } else if (state) {
      // Reconcile state against event log
      let calcCash = 15.00;
      let calcGems = 0;
      let calcHealth = 100;
      let calcDebt = 0;
      let calcDown = 0;
      const calcOwned = new Set();
      let calcPity = 0;

      for (const e of entries) {
        if (e.type === 'income' && e.payload?.amount) calcCash += e.payload.amount;
        if (e.type === 'expense_paid' && e.payload?.amount) calcCash -= e.payload.amount;
        if (e.type === 'purchase') {
          if (e.payload?.price) calcCash -= e.payload.price;
          if (e.payload?.bundleGems) calcGems += e.payload.bundleGems;
          if (e.payload?.cost) calcGems -= e.payload.cost;
        }
        if (e.type === 'reward' && e.payload?.gems) calcGems += e.payload.gems;
        if (e.type === 'reward' && e.payload?.cash) calcCash += e.payload.cash;
        if (e.type === 'escalation_result') {
          if (e.payload?.effects?.cashGained) calcCash += e.payload.effects.cashGained;
          if (e.payload?.effects?.healthLost) calcHealth -= e.payload.effects.healthLost;
          if (e.payload?.effects?.debtAfter !== undefined) calcDebt = e.payload.effects.debtAfter;
        }
        if (e.type === 'draw_committed') {
          if (!e.payload.duplicate) {
            calcOwned.add(e.payload.identity);
          } else if (e.payload.downGained) {
            calcDown += e.payload.downGained;
          }
          if (e.payload.advancesPity) {
            calcPity = (e.payload.rarity === 'legendary') ? 0 : calcPity + 1;
          }
        }
      }

      calcCash = Math.round(calcCash * 100) / 100;
      if (Math.abs(calcCash - state.cash) > 0.01) {
        errors.push(`State cash mismatch: log implies $${calcCash}, state reports $${state.cash}`);
      }
      if (calcGems !== state.gems) {
        errors.push(`State gems mismatch: log implies ${calcGems}, state reports ${state.gems}`);
      }
      if (calcHealth !== state.health) {
        errors.push(`State health mismatch: log implies ${calcHealth}, state reports ${state.health}`);
      }
      if (calcDebt !== state.debt) {
        errors.push(`State debt mismatch: log implies ${calcDebt}, state reports ${state.debt}`);
      }
      if (calcDown !== (state.down ?? 0)) {
        errors.push(`State down mismatch: log implies ${calcDown}, state reports ${state.down}`);
      }
      if (calcPity !== state.pityCount) {
        errors.push(`State pityCount mismatch: log implies ${calcPity}, state reports ${state.pityCount}`);
      }

      // Check pending reveals
      const committedSeqSet = new Set(entries.filter((e) => e.type === 'draw_committed').map((e) => e.seq));
      const revealedCommitSeqs = new Set(entries.filter((e) => e.type === 'reveal_shown').map((e) => e.payload.commitSeq));
      const expectedPendingCount = Array.from(committedSeqSet).filter((s) => !revealedCommitSeqs.has(s)).length;
      const actualPendingCount = state.pendingReveals.filter((d) => !d.revealed).length;
      if (actualPendingCount !== expectedPendingCount) {
        errors.push(`Pending reveals mismatch: expected ${expectedPendingCount}, state has ${actualPendingCount}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Saves game envelope to storage.
 * If storage fails, safely retains existing stored snapshot and activates in-memory session.
 */
export function saveGame(envelope, storage = globalThis.localStorage) {
  const serialized = JSON.stringify(envelope);
  try {
    if (!storage) throw new Error('localStorage is not available');
    storage.setItem(STORAGE_KEY, serialized);
    inMemoryActive = false;
    return { success: true, inMemory: false };
  } catch (err) {
    inMemoryStore = serialized;
    inMemoryActive = true;
    return { success: false, inMemory: true, error: err.message };
  }
}

/**
 * Loads game envelope from storage (or active in-memory session).
 * Returns { envelope, valid, errors, isCorrupt }
 */
export function loadGame(storage = globalThis.localStorage) {
  let raw = null;
  if (inMemoryActive && inMemoryStore) {
    raw = inMemoryStore;
  } else {
    try {
      if (storage) raw = storage.getItem(STORAGE_KEY);
    } catch {
      raw = null;
    }
  }

  if (!raw) {
    return { envelope: null, valid: true, errors: [], isCorrupt: false };
  }

  let envelope;
  try {
    envelope = JSON.parse(raw);
  } catch (err) {
    return { envelope: null, valid: false, errors: [`JSON parse failure: ${err.message}`], isCorrupt: true };
  }

  const { valid, errors } = validateSave(envelope);
  return { envelope, valid, errors, isCorrupt: !valid };
}

/**
 * Clears saved game from storage and in-memory store.
 */
export function clearGame(storage = globalThis.localStorage) {
  try {
    if (storage) storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage deletion errors
  }
  resetInMemoryStore();
}
