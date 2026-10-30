// Historical artifacts read without modification. These save files are read-only evidence from earlier plans.
// This test does not re-attest them: it only checks how the current engine and Plan 38 routing read them.
// Nothing here writes to disk, and each test parses its own copy of the envelope.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GameEngine } from '../../../../src/core/game-engine.mjs';
import { validateSave } from '../../../../src/core/storage.mjs';
import {
  placeFor, availablePlaces, normalizeLoadedStep, afterBreakfast, breakfastBeforeMidday,
} from '../../../../src/ui/life/life-routing.mjs';

const ROOT = new URL('../../../../', import.meta.url);
const PLAN16 = 'reports/development/plan-16-deterministic-review-checkpoints/';
const PLAN35_INDEX = 'reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/fixture-validation-index.json';

async function readJson(relPath) {
  return JSON.parse(await readFile(new URL(relPath, ROOT), 'utf8'));
}

/** Loads a raw envelope file: validate, then hydrate. Fails loudly if the current validator rejects it. */
async function loadEngine(relPath) {
  const envelope = await readJson(relPath);
  const verdict = validateSave(envelope);
  assert.equal(verdict.valid, true, verdict.errors.join('; '));
  return GameEngine.fromEnvelope(envelope);
}

/** Resolves a Plan 35 checkpoint's save path through its validation index. */
async function plan35FixturePath(id) {
  const index = await readJson(PLAN35_INDEX);
  return index.entries[id].fixture.path;
}

/** Test-local breakfast tap: charge $5, and only when paid apply afterBreakfast (advance, then step). */
function tapBreakfast(engine) {
  const result = engine.billExpense('food', 5);
  if (!result.paid) return { result, next: null };
  const next = afterBreakfast(engine);
  if (next.advance) engine.advanceDay(...next.advance);
  engine.state.step = next.step;
  return { result, next };
}

const paidEntries = (engine, billId) => engine.log.entries.filter((e) => e.type === 'expense_paid' && e.payload?.billId === billId);

test('pending-reveal save: breakfast after the revealed ten-pull charges once and never replays the pull', async () => {
  const engine = await loadEngine(`${PLAN16}pending-reveal.save.json`);
  assert.equal(engine.state.day, 1);
  assert.equal(engine.state.step, 'd1_morning_gacha');
  assert.equal(engine.state.tenPullCommitted, true);
  assert.equal(engine.state.pendingReveals.length, 10);
  assert.equal(breakfastBeforeMidday(engine), true);

  // Routing reads must not touch the pending draws or the log.
  const pendingAtLoad = structuredClone(engine.state.pendingReveals);
  const logAtLoad = engine.log.entries.length;
  placeFor(engine);
  availablePlaces(engine);
  normalizeLoadedStep(engine);
  afterBreakfast(engine);
  assert.deepEqual(engine.state.pendingReveals, pendingAtLoad);
  assert.equal(engine.log.entries.length, logAtLoad);

  engine.revealAllPending();
  assert.equal(engine.state.pendingReveals.every((d) => d.revealed), true);
  const revealedBeforeTap = structuredClone(engine.state.pendingReveals);
  const cashBefore = engine.state.cash;
  const drawsBefore = engine.log.entries.filter((e) => e.type === 'draw_committed').length;

  engine.state.step = 'd1_morning_breakfast';
  const tap = tapBreakfast(engine);
  assert.equal(tap.result.paid, true);
  assert.equal(engine.state.cash, cashBefore - 5);
  assert.equal(paidEntries(engine, 'd1_food').length, 1);
  assert.deepEqual(tap.next, { step: 'd1_midday_race', advance: [1, 'day 1 midday'], phone: true });
  assert.equal(engine.state.step, 'd1_midday_race');
  assert.equal(engine.state.clock.label, 'day 1 midday');

  // A second tap is a no-op: no new events, no second charge.
  const logAfterTap = engine.log.entries.length;
  const second = engine.billExpense('food', 5);
  assert.equal(second.alreadySettled, true);
  assert.equal(engine.state.cash, cashBefore - 5);
  assert.equal(engine.log.entries.length, logAfterTap);
  assert.equal(paidEntries(engine, 'd1_food').length, 1);

  // Pending draws are exactly as they were before the tap, and the pull is not replayed.
  assert.deepEqual(engine.state.pendingReveals, revealedBeforeTap);
  assert.deepEqual(engine.commitPromotionalTenPull(), revealedBeforeTap);
  assert.equal(engine.log.entries.filter((e) => e.type === 'draw_committed').length, drawsBefore);
});

test('starter-offer save: Day 1 breakfast already settled, so Day 2 breakfast goes to the kitchen', async () => {
  const engine = await loadEngine(`${PLAN16}starter-offer.save.json`);
  assert.equal(engine.state.step, 'd1_afternoon_starter');
  assert.equal(engine.state.day, 1);
  assert.equal(engine.state.billsSettled.includes('d1_food'), true);
  assert.equal(breakfastBeforeMidday(engine), false);

  engine.creditWage();
  engine.advanceDay(2, 'day 2 morning');
  engine.state.step = 'd2_morning_breakfast';
  assert.equal(placeFor(engine), 'kitchen-breakfast');
});

for (const id of ['plan35.rent-paid-zero.v1', 'plan35.rent-unpaid-escalation.v1']) {
  test(`${id}: Day 2 rent loads on the notice, repair leaves it alone, no breakfast is pending`, async () => {
    const engine = await loadEngine(await plan35FixturePath(id));
    assert.equal(engine.state.day, 2);
    assert.equal(engine.state.step, 'd2_afternoon_rent');
    assert.equal(placeFor(engine), 'kitchen-notice');
    assert.deepEqual(availablePlaces(engine), ['kitchen-notice']);

    const before = structuredClone(engine.state);
    assert.deepEqual(normalizeLoadedStep(engine), { step: 'd2_afternoon_rent', recovered: false, next: null });
    assert.deepEqual(engine.state, before);

    assert.equal(engine.state.billsSettled.includes('d2_food'), true);
    const logBefore = engine.log.entries.length;
    assert.equal(engine.billExpense('food', 5).alreadySettled, true);
    assert.equal(engine.log.entries.length, logBefore);
  });
}
