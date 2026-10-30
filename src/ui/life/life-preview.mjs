// src/ui/life/life-preview.mjs
// Engine previews for apartment decisions. Every money, health or debt figure a control shows is computed on a clone
// of the engine, so the copy cannot drift from what the click does. Previews never mutate the real engine.

import { GAME_CONSTANTS } from '../../core/game-engine.mjs';

export const RENT_AMOUNT = GAME_CONSTANTS.RENT_DAY2;
export const BREAKFAST_AMOUNT = GAME_CONSTANTS.FOOD_DAILY;

const RENT_SENDER = 'Harbor Court Property Office';
const SHIFT_SENDER = 'Marisol · Harbor Street Diner';

export const money = (n) => `$${Math.abs(n).toFixed(2)}`;
const signedMoney = (n) => `${n < 0 ? '−' : '+'}${money(n)}`;

/** Human-readable effect, listing only what changes. */
export function effectText(delta, { rentPaid = false } = {}) {
  const parts = [];
  if (delta.cash) parts.push(`${signedMoney(delta.cash)} cash`);
  if (delta.health) parts.push(`${delta.health > 0 ? '+' : '−'}${Math.abs(delta.health)} health`);
  if (delta.debt > 0) parts.push(`${money(delta.debt)} more owed`);
  else if (delta.debt < 0) parts.push(`${money(delta.debt)} less owed`);
  if (rentPaid) parts.push(`then ${money(RENT_AMOUNT)} rent paid`);
  return parts.join(', ');
}

/** Kit furnishings derived from the engine's `assetsSold` array. */
export function furnishingsFrom(assetsSold = []) {
  return {
    couch: assetsSold.includes('couch') ? 'removed' : 'present',
    tv: assetsSold.includes('tv') ? 'removed' : 'present',
  };
}

/**
 * Gross effect of the option itself, read from the `escalation_result` event appended at or after `fromSeq`
 * (before any automatic rent payment is subtracted). Empty for Continue/Decline.
 */
export function effectFromEvents(entries, fromSeq, beforeDebt) {
  const ev = entries.find((e) => e.seq >= fromSeq && e.type === 'escalation_result');
  const fx = ev?.payload?.effects ?? {};
  return {
    cash: fx.cashGained ?? 0,
    health: -(fx.healthLost ?? 0),
    debt: fx.debtAfter !== undefined ? Math.round((fx.debtAfter - beforeDebt) * 100) / 100 : 0,
  };
}

function cloneEngine(engine) {
  return engine.constructor.fromEnvelope(structuredClone(engine.toEnvelope()));
}

function snapshotOf(engine) {
  return { ...engine.state, assetsSold: [...engine.state.assetsSold], events: engine.log.length };
}

function deltaOf(before, after) {
  return {
    cash: Math.round((after.cash - before.cash) * 100) / 100,
    health: after.health - before.health,
    debt: Math.round((after.debt - before.debt) * 100) / 100,
  };
}

function outcomeOf(before, clone, result) {
  const s = clone.state;
  return {
    result,
    after: { cash: s.cash, health: s.health, debt: s.debt, assetsSold: [...s.assetsSold] },
    delta: deltaOf(before, s),
    effect: effectFromEvents(clone.log.entries, before.events, before.debt),
    appended: clone.log.entries.filter((e) => e.seq >= before.events).map((e) => e.type),
    rentPaid: (s.billsSettled ?? []).includes('d2_rent'),
    endsRun: s.phase === 'terminal',
    sold: s.assetsSold.filter((a) => !before.assetsSold.includes(a)),
  };
}

// Memo: results per engine, dropped whenever the log grows (every real change appends an event).
// Direct state edits that append nothing are not seen; callers must log through the engine.
const memos = new WeakMap();
function memo(engine, key, compute) {
  const len = engine.log.length;
  let m = memos.get(engine);
  if (!m || m.len !== len) {
    m = { len, values: new Map() };
    memos.set(engine, m);
  }
  if (!m.values.has(key)) m.values.set(key, compute());
  return m.values.get(key);
}

/** Engine-computed consequences of one zero-cash choice, or null if the engine refuses it (ineligible). */
export function previewZeroCash(engine, choice) {
  return memo(engine, `zero:${choice}`, () => {
    const before = snapshotOf(engine);
    const clone = cloneEngine(engine);
    try {
      const result = clone.chooseZeroCashOption(choice);
      return outcomeOf(before, clone, result);
    } catch {
      return null;
    }
  });
}

/**
 * The current ladder offer and the engine-computed consequences of accepting or declining it.
 * The step is read from a clone: getCurrentEscalationStep() can advance escalationStepIndex, and a preview must not.
 */
export function previewLadder(engine) {
  return memo(engine, 'ladder', () => {
    const step = cloneEngine(engine).getCurrentEscalationStep();
    if (!step) return { step: null, accept: null, decline: null };
    const before = snapshotOf(engine);
    const acceptClone = cloneEngine(engine);
    const acceptResult = acceptClone.acceptEscalation();
    const declineClone = cloneEngine(engine);
    const declineResult = declineClone.declineEscalation();
    return {
      step,
      accept: outcomeOf(before, acceptClone, acceptResult),
      decline: { ...outcomeOf(before, declineClone, declineResult), nextStep: declineClone.state.phase === 'terminal' ? null : declineClone.getCurrentEscalationStep() },
    };
  });
}

/**
 * After a ladder accept or zero-cash choice: what actually happened, read from the events the engine appended
 * since `before.events` and from engine state afterwards. `before` is a snapshot taken before the choice.
 */
export function outcomeView(engine, { choice, before }) {
  const s = engine.state;
  const appended = engine.log.entries.filter((e) => e.seq >= before.events);
  const effect = effectFromEvents(appended, before.events, before.debt);
  const rentPaidNow = appended.some((e) => e.type === 'expense_paid' && e.payload?.kind === 'rent');
  const rentPaid = (s.billsSettled ?? []).includes('d2_rent');
  const sold = s.assetsSold.filter((a) => !before.assetsSold.includes(a));
  const lines = [];
  if (rentPaidNow) lines.push(`Rent paid in full: ${money(RENT_AMOUNT)}.`);
  if (choice === 'extra_shift') lines.push(`Worked the extra night shift: ${effectText(effect)}. Health ${before.health} → ${s.health}.`);
  for (const item of sold) lines.push(`${item === 'couch' ? 'The couch is' : 'The TV is'} gone: ${effectText(effect)}.`);
  if (choice === 'credit_card') lines.push(`Cash advance taken: ${effectText(effect)}. You now owe ${money(s.debt)} in total.`);
  if (!rentPaid) lines.push(`Rent is still unpaid: ${money(RENT_AMOUNT)} due.`);
  lines.push(`Cash on hand: ${money(s.cash)}.`);
  const moment = sold.length ? 'sale-done' : choice === 'extra_shift' ? 'shift-done' : rentPaid ? 'rent-settled' : 'rent-unpaid';
  const card = moment === 'shift-done'
    ? { kind: 'message', sender: SHIFT_SENDER, heading: 'Thanks for covering tonight.', lines }
    : moment === 'sale-done'
      ? { kind: 'note', heading: sold.includes('couch') ? 'The couch was collected' : 'The TV was collected', lines }
      : { kind: 'bill', sender: RENT_SENDER, heading: rentPaid ? 'Rent paid in full' : 'Rent still unpaid', stamp: rentPaid ? 'PAID' : null, lines };
  return {
    moment, provenance: 'live-engine', card, effect, rentPaid, rentPaidNow, sold,
    appended: appended.map((e) => e.type),
    controls: [{ id: 'evening', label: 'Continue to evening', primary: true }],
  };
}
