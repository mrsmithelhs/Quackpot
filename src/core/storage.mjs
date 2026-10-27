// src/core/storage.mjs
// LocalStorage envelope adapter with deep semantic restore validation and in-memory fallback.

import { verifyChain } from './event-log.mjs';

export const STORAGE_KEY = 'quackpot_save_v1';
export const BACKUP_KEY = 'quackpot_save_backup';
export const CURRENT_SCHEMA_VERSION = 1;

// In-memory fallback session store when localStorage is unavailable or throws quota error
let inMemoryStore = null;
let inMemoryActive = false;
let temporaryPreservationActive = false;

export function getInMemoryStatus() {
  return inMemoryActive;
}

export function resetInMemoryStore() {
  inMemoryStore = null;
  inMemoryActive = false;
  temporaryPreservationActive = false;
}

export function setTemporaryPreservationMode(active) {
  temporaryPreservationActive = Boolean(active);
}

export function isTemporaryPreservationMode() {
  return temporaryPreservationActive;
}

/**
 * Validates a save envelope semantically.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateSave(envelope) {
  const errors = [];
  try {
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
      if (state.seenDexEntries !== undefined) {
        if (!Array.isArray(state.seenDexEntries) || !state.seenDexEntries.every((id) => typeof id === 'string')) {
          errors.push('state.seenDexEntries must be an array of string duck IDs');
        }
      }
      if (!Array.isArray(state.pendingReveals)) {
        errors.push('state.pendingReveals must be an array');
      }
      if (!['setup', 'playing', 'escalation', 'terminal', 'receipt_presented'].includes(state.phase)) {
        errors.push(`Invalid state.phase: ${state.phase}`);
      }
      if (!state.clock || typeof state.clock !== 'object' || typeof state.clock.day !== 'number') {
        errors.push('Invalid state.clock object');
      }
    }

    // Validate PRNG streams
    const streams = envelope.prngStreams;
    if (!streams || typeof streams !== 'object') {
      errors.push('Missing prngStreams object');
    } else {
      let rootKey = null;
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
            continue;
          }
          // Validate that all 4 state words are valid uint32 integers
          for (let w = 0; w < 4; w++) {
            const word = parsed.s[w];
            if (typeof word !== 'number' || !Number.isInteger(word) || word < 0 || word > 0xffffffff) {
              errors.push(`Stream ${name} has invalid uint32 state word at [${w}]: ${JSON.stringify(word)}`);
            }
          }
          // Validate stream key derivation hierarchy
          if (name === 'root') {
            rootKey = parsed.key;
          } else if (rootKey !== null) {
            const expectedKey = `${rootKey}/${name}`;
            if (parsed.key !== expectedKey) {
              errors.push(`Stream ${name} key mismatch: expected "${expectedKey}", got "${parsed.key}"`);
            }
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
      } else if (state && Array.isArray(state.owned) && Array.isArray(state.pendingReveals)) {
        // Reconcile state against event log
        let calcCash = 15.00;
        let calcGems = 0;
        let calcHealth = 100;
        let calcDebt = 0;
        let calcDown = 0;
        const expectedOwned = [];
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
              expectedOwned.push(e.payload.identity);
            } else if (e.payload.downGained) {
              calcDown += e.payload.downGained;
            }
            if (e.payload.advancesPity) {
              calcPity = (e.payload.rarity === 'legendary') ? 0 : calcPity + 1;
            }
          }
          if (e.type === 'action' && e.payload?.kind === 'down_spent') {
            if (e.payload?.amount) calcDown -= e.payload.amount;
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
        if (calcDebt !== (state.debt ?? 0)) {
          errors.push(`State debt mismatch: log implies ${calcDebt}, state reports ${state.debt}`);
        }
        if (calcDown !== (state.down ?? 0)) {
          errors.push(`State down mismatch: log implies ${calcDown}, state reports ${state.down}`);
        }
        if (calcPity !== (state.pityCount ?? 0)) {
          errors.push(`State pityCount mismatch: log implies ${calcPity}, state reports ${state.pityCount}`);
        }

        // Exact state.owned reconciliation (P1 repair)
        if (state.owned.length !== expectedOwned.length || !state.owned.every((id, idx) => id === expectedOwned[idx])) {
          errors.push(`State owned inventory mismatch: log implies [${expectedOwned.join(', ')}], state reports [${state.owned.join(', ')}]`);
        }

        // Exact pendingReveals validation (Repair 02, P1: reject missing, duplicate, or mismatched pending queue)
        const commitEvents = entries.filter((e) => e.type === 'draw_committed');
        const revealedSeqs = new Set(
          entries.filter((e) => e.type === 'reveal_shown').map((e) => e.payload?.commitSeq)
        );

        if (commitEvents.length === 0) {
          if (Array.isArray(state.pendingReveals) && state.pendingReveals.length > 0) {
            errors.push('state.pendingReveals must be empty when no draw_committed events exist');
          }
        } else {
          if (!Array.isArray(state.pendingReveals) || state.pendingReveals.length !== commitEvents.length) {
            errors.push(`state.pendingReveals length mismatch: expected ${commitEvents.length} items from committed draws, got ${state.pendingReveals?.length ?? 0}`);
          } else {
            const seenCommitSeqs = new Set();
            for (let i = 0; i < commitEvents.length; i++) {
              const commit = commitEvents[i];
              const item = state.pendingReveals[i];
              if (!item || typeof item !== 'object') {
                errors.push(`Malformed item in pendingReveals at index [${i}]`);
                continue;
              }
              if (seenCommitSeqs.has(item.commitSeq)) {
                errors.push(`Duplicate commitSeq ${item.commitSeq} in pendingReveals at index [${i}]`);
              }
              seenCommitSeqs.add(item.commitSeq);

              if (item.commitSeq !== commit.seq) {
                errors.push(`pendingReveals index [${i}] commitSeq mismatch: expected ${commit.seq}, got ${item.commitSeq}`);
              }
              if (item.drawIndex !== commit.payload.drawIndex) {
                errors.push(`pendingReveals index [${i}] drawIndex mismatch: expected ${commit.payload.drawIndex}, got ${item.drawIndex}`);
              }
              if (item.of !== commit.payload.of) {
                errors.push(`pendingReveals index [${i}] "of" mismatch: expected ${commit.payload.of}, got ${item.of}`);
              }
              if (item.identity !== commit.payload.identity) {
                errors.push(`pendingReveals index [${i}] identity mismatch: expected "${commit.payload.identity}", got "${item.identity}"`);
              }
              if (item.rarity !== commit.payload.rarity) {
                errors.push(`pendingReveals index [${i}] rarity mismatch: expected "${commit.payload.rarity}", got "${item.rarity}"`);
              }
              if (item.duplicate !== commit.payload.duplicate) {
                errors.push(`pendingReveals index [${i}] duplicate mismatch: expected ${commit.payload.duplicate}, got ${item.duplicate}`);
              }
              if (item.downGained !== commit.payload.downGained) {
                errors.push(`pendingReveals index [${i}] downGained mismatch: expected ${commit.payload.downGained}, got ${item.downGained}`);
              }
              if (item.advancesPity !== commit.payload.advancesPity) {
                errors.push(`pendingReveals index [${i}] advancesPity mismatch: expected ${commit.payload.advancesPity}, got ${item.advancesPity}`);
              }
              if (typeof item.revealed !== 'boolean') {
                errors.push(`pendingReveals index [${i}] revealed flag must be boolean`);
              } else {
                const hasRevealEvent = revealedSeqs.has(commit.seq);
                if (item.revealed !== hasRevealEvent) {
                  errors.push(`pendingReveals index [${i}] revealed state mismatch: state=${item.revealed}, logHasReveal=${hasRevealEvent}`);
                }
              }
            }
          }
        }

        // Authoritative completed races and raceResults reconciliation (Repair 02, P1)
        const loggedRaceResults = entries.filter((e) => e.type === 'race_result');
        const loggedRaceMap = new Map();
        for (const r of loggedRaceResults) {
          loggedRaceMap.set(r.payload.raceNumber, r.payload);
        }

        if (!Array.isArray(state.completedRaces)) {
          errors.push('state.completedRaces must be an array');
        } else {
          for (const [rNum, rPayload] of loggedRaceMap.entries()) {
            if (!state.completedRaces.includes(rNum)) {
              errors.push(`state.completedRaces missing race ${rNum} recorded in event log`);
            }
            if (!state.raceResults || !state.raceResults[rNum]) {
              errors.push(`state.raceResults missing cached result for race ${rNum} recorded in event log`);
            } else {
              const res = state.raceResults[rNum];
              if (res.place !== rPayload.place) {
                errors.push(`state.raceResults[${rNum}] place mismatch: expected ${rPayload.place}, got ${res.place}`);
              }
              if (res.payoutGems !== rPayload.payoutGems) {
                errors.push(`state.raceResults[${rNum}] payoutGems mismatch: expected ${rPayload.payoutGems}, got ${res.payoutGems}`);
              }
            }
          }
          for (const rNum of state.completedRaces) {
            if (!loggedRaceMap.has(rNum)) {
              errors.push(`state.completedRaces contains race ${rNum} with no race_result in event log`);
            }
          }
        }

        // Authoritative step reconciliation against completed races
        if (loggedRaceMap.has(1)) {
          if (state.step === 'desk' || state.step === 'd1_morning_gacha' || state.step === 'd1_midday_race') {
            errors.push(`state.step "${state.step}" is invalid: race 1 already completed in event log`);
          }
        }
        if (loggedRaceMap.has(2)) {
          if (state.step === 'd3_midday_race') {
            errors.push(`state.step "${state.step}" is invalid: race 2 already completed in event log`);
          }
        }

        // Terminal & Receipt phase coherence (Repair 02)
        const hasTerminalEvent = entries.some((e) => e.type === 'terminal');
        const hasReceiptEvent = entries.some((e) => e.type === 'receipt_shown');

        if (hasTerminalEvent) {
          if (state.phase !== 'terminal' && state.phase !== 'receipt_presented') {
            errors.push(`state.phase must be "terminal" or "receipt_presented" when terminal event exists (got "${state.phase}")`);
          }
          if (state.step !== 'receipt') {
            errors.push(`state.step must be "receipt" when terminal event exists (got "${state.step}")`);
          }
          if (state.activeModal !== null) {
            errors.push(`state.activeModal must be null in terminal phase (got "${state.activeModal}")`);
          }
        } else {
          if (state.phase === 'terminal' || state.phase === 'receipt_presented') {
            errors.push(`state.phase "${state.phase}" invalid: no terminal event found in log`);
          }
          if (state.step === 'receipt') {
            errors.push('state.step is "receipt" but no terminal event exists in log');
          }
        }

        if (hasReceiptEvent) {
          if (state.phase !== 'receipt_presented') {
            errors.push(`state.phase must be "receipt_presented" when receipt_shown event exists (got "${state.phase}")`);
          }
          if (state.step !== 'receipt') {
            errors.push('state.step must be "receipt" when receipt_shown event exists');
          }
        }
      }
    }
  } catch (err) {
    errors.push(`Unexpected error during save validation: ${err.message}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Saves game envelope to storage.
 * If storage fails or preservation mode is active, safely retains existing stored snapshot and activates in-memory session.
 */
export function saveGame(envelope, storage = globalThis.localStorage, allowOverwritePreserved = false) {
  const serialized = JSON.stringify(envelope);

  // If temporary preservation mode is active, protect the primary snapshot from being overwritten
  if (temporaryPreservationActive && !allowOverwritePreserved) {
    inMemoryStore = serialized;
    inMemoryActive = true;
    return {
      success: false,
      inMemory: true,
      preservedSnapshot: true,
      error: 'primary_snapshot_preserved',
    };
  }

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
 * Backs up an existing corrupted or legacy save before overwriting.
 */
export function backupCorruptSave(storage = globalThis.localStorage) {
  try {
    if (!storage) return false;
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      storage.setItem(BACKUP_KEY, raw);
      return true;
    }
  } catch {
    return false;
  }
  return false;
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
