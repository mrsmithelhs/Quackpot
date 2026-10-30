// Plan 28 report-local prototype: pure presentation model for Direction A.
// Reads engine state and log. Previews run on clones; the one exception is previewLadder, which calls the real
// getCurrentEscalationStep() exactly as the production modal does (modals.js:90), and that call can advance
// escalationStepIndex past ineligible steps.
// Not imported by src/. Proposed production behavior is described in ../proposal.md, not implied here.

/**
 * Source-grounded routing table: every { step, activeModal } the current controller can persist
 * (src/main.js, src/core/game-engine.mjs at c67cac3) and where Direction A would show it.
 * `current` is where it renders today; `proposed` is Direction A. Rows marked `future` are not reachable
 * today and exist only so their routing is explicit rather than guessed.
 */
export const ROUTES = Object.freeze([
  { step: 'desk', activeModal: null, current: 'apartment', proposed: 'apartment', moment: 'desk', source: 'main.js:268-297' },
  { step: 'd1_morning_gacha', activeModal: null, current: 'phone', proposed: 'phone', moment: 'gacha', source: 'main.js:298-349' },
  { step: 'd1_midday_race', activeModal: null, current: 'phone', proposed: 'phone', moment: 'race', source: 'main.js:357-397' },
  { step: 'd1_midday_race_result', activeModal: null, current: 'phone', proposed: 'phone', moment: 'race', source: 'main.js:357-397' },
  { step: 'd1_afternoon_starter', activeModal: 'starter', current: 'phone', proposed: 'phone', moment: 'starter-offer', source: 'main.js:383-405, 510-526' },
  { step: 'd1_afternoon_starter', activeModal: null, current: 'phone', proposed: 'phone', moment: 'starter-offer', source: 'main.js:398-404 (between Buy/Decline and proceed)' },
  { step: 'd2_afternoon_rent', activeModal: null, current: 'phone', proposed: 'apartment', moment: 'rent-due', source: 'main.js:405-456' },
  { step: 'd2_afternoon_zerocash', activeModal: 'zerocash', current: 'phone', proposed: 'apartment', moment: 'paid-zero', source: 'game-engine.mjs:762-773; main.js:527-556' },
  { step: 'd2_afternoon_escalation', activeModal: 'escalation', current: 'phone', proposed: 'apartment', moment: 'rent-unpaid', source: 'game-engine.mjs:784-790; main.js:557-594' },
  { step: 'd2_afternoon_rent_resolved', activeModal: null, current: 'phone', proposed: 'apartment', moment: 'rent-settled', source: 'main.js:405-456' },
  { step: 'd3_midday_race', activeModal: null, current: 'phone', proposed: 'phone', moment: 'race', source: 'main.js:457-495' },
  { step: 'd3_midday_race_result', activeModal: null, current: 'phone', proposed: 'phone', moment: 'race', source: 'main.js:457-495' },
  { step: 'receipt', activeModal: null, current: 'receipt', proposed: 'receipt', moment: 'receipt', source: 'main.js:496-505' },
  // Food shortfall would open the ladder on a non-rent step; unreachable at current values (current-mapping.md §4.5).
  { step: '*', activeModal: 'escalation', current: 'phone', proposed: 'apartment', moment: 'food-unpaid', source: 'game-engine.mjs:784-790', future: true },
]);

/** 'duck_dex' is controller-only (main.js:203-206 never writes engine.state.step) and is not a persisted step. */
export const CONTROLLER_ONLY_STEPS = Object.freeze(['duck_dex']);

/**
 * Where Direction A shows a persisted state. Retention (Uninstall) overlays whatever it interrupted, so the place
 * comes from `interruptedContext`. Unknown combinations return place 'unsupported' instead of a guess.
 */
export function lifeLocation({ step, activeModal = null, phase = 'playing', interruptedContext = null } = {}) {
  if (phase === 'terminal' || phase === 'receipt_presented') return { place: 'receipt', moment: 'receipt', overlay: null };
  if (activeModal === 'retention') {
    const under = lifeLocation({ step: interruptedContext?.step, activeModal: interruptedContext?.activeModal ?? null, phase });
    return { ...under, overlay: 'retention' };
  }
  const row = ROUTES.find((r) => !r.future && r.step === step && r.activeModal === activeModal)
    ?? ROUTES.find((r) => r.future && r.activeModal === activeModal && activeModal !== null && step !== undefined);
  if (!row) return { place: 'unsupported', moment: null, overlay: null };
  return { place: row.proposed, moment: row.moment, overlay: null, future: Boolean(row.future) };
}

/** Kit furnishings derived from the engine's real `assetsSold` array (game-engine.mjs:122). */
export function furnishingsFrom(assetsSold = []) {
  return {
    couch: assetsSold.includes('couch') ? 'removed' : 'present',
    tv: assetsSold.includes('tv') ? 'removed' : 'present',
  };
}

const BLANK_PHONE = Object.freeze({ status: '', brand: '', heading: [], body: [], note: '' });

/**
 * Travelling-companion baseline (owner D2): the duck sits where the character is, still within each composition.
 * The only open framing question compared is the morning ledger (`medium` close on the bar vs `wide` kitchen).
 */
/**
 * Owner decision (2026-10-30): the whole kitchen once as the Day 1 establishing shot, then the close counter view so
 * the duck stays readable at phone width. 'medium' or 'wide' force one framing for reviewer comparison.
 */
export function morningFramingFor(day, override = 'owner') {
  if (override === 'medium' || override === 'wide') return override;
  return day === 1 ? 'wide' : 'medium';
}

export function sceneFor(moment, { idPrefix, assetsSold = [], morningFraming = 'medium', phone = null, offerStep = null } = {}) {
  const base = { idPrefix, decorative: true };
  switch (moment) {
    case 'breakfast':
    case 'ledger':
      return { ...base, area: 'kitchen', framing: morningFraming, light: 'window', duckView: 'front' };
    case 'rent-due':
      return { ...base, area: 'desk-top', light: 'window', phone: BLANK_PHONE };
    case 'paid-zero':
    case 'rent-settled':
      return { ...base, area: 'desk-top', light: 'warm', phone: BLANK_PHONE };
    case 'rent-unpaid':
      if (offerStep === 'extra_shift') return { ...base, area: 'desk-side', light: 'warm', duckView: 'side', phone: phone ?? BLANK_PHONE };
      if (offerStep === 'sell_couch' || offerStep === 'sell_tv') {
        return { ...base, area: 'living', framing: 'wide', light: 'neutral', duckView: 'side', furnishings: furnishingsFrom(assetsSold) };
      }
      return { ...base, area: 'desk-top', light: 'warm', phone: BLANK_PHONE };
    case 'shift-done':
      return { ...base, area: 'desk-side', light: 'warm', duckView: 'side', phone: phone ?? BLANK_PHONE };
    case 'sale-done':
      return { ...base, area: 'living', framing: 'wide', light: 'neutral', duckView: 'side', furnishings: furnishingsFrom(assetsSold) };
    case 'return':
    case 'standin':
      return { ...base, area: 'desk-side', light: 'window', duckView: 'side', phone: phone ?? BLANK_PHONE };
    default:
      throw new RangeError(`No Direction A scene for moment "${moment}"`);
  }
}

/**
 * Past-tense morning facts projected from the real log: the previous evening's wage and this morning's food bill.
 * This is a projection of recorded events, not evidence that anything was displayed.
 */
export function ledgerFacts(entries, day) {
  const foodPaid = entries.find((e) => e.type === 'expense_paid' && e.payload?.kind === 'food' && e.payload?.billId === `d${day}_food`);
  const foodDue = entries.find((e) => e.type === 'expense_due' && e.payload?.kind === 'food' && e.payload?.billId === `d${day}_food`);
  const wage = day > 1 ? entries.find((e) => e.type === 'income' && e.payload?.kind === 'wage' && e.clock?.day === day - 1) : null;
  return {
    day,
    food: foodPaid ? { amount: foodPaid.payload.amount, cashAfter: foodPaid.payload.cashAfter, seq: foodPaid.seq } : null,
    foodUnpaid: Boolean(foodDue && !foodPaid),
    wage: wage ? { amount: wage.payload.amount, seq: wage.seq } : null,
  };
}

function cloneEngine(engine) {
  return engine.constructor.fromEnvelope(structuredClone(engine.toEnvelope()));
}

function deltaOf(before, after) {
  return {
    cash: Math.round((after.cash - before.cash) * 100) / 100,
    health: after.health - before.health,
    debt: Math.round((after.debt - before.debt) * 100) / 100,
  };
}

/**
 * Gross effect of the option itself, read from the `escalation_result` event the engine appended
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

/** Engine-computed consequences of one zero-cash choice, or null if the engine refuses it (ineligible). */
export function previewZeroCash(engine, choice) {
  const before = { ...engine.state, assetsSold: [...engine.state.assetsSold], events: engine.log.length };
  const clone = cloneEngine(engine);
  try {
    const result = clone.chooseZeroCashOption(choice);
    return outcomeOf(before, clone, result);
  } catch {
    return null;
  }
}

/**
 * The current ladder offer and the engine-computed consequences of accepting or declining it.
 * Calls the real `getCurrentEscalationStep()` exactly as the production modal does (modals.js:90).
 */
export function previewLadder(engine) {
  const step = engine.getCurrentEscalationStep();
  const before = { ...engine.state, assetsSold: [...engine.state.assetsSold], events: engine.log.length };
  if (!step) return { step: null, accept: null, decline: null };
  const acceptClone = cloneEngine(engine);
  const acceptResult = acceptClone.acceptEscalation();
  const declineClone = cloneEngine(engine);
  const declineResult = declineClone.declineEscalation();
  return {
    step,
    accept: outcomeOf(before, acceptClone, acceptResult),
    decline: { ...outcomeOf(before, declineClone, declineResult), nextStep: declineClone.state.phase === 'terminal' ? null : declineClone.getCurrentEscalationStep() },
  };
}

/** Snapshot used by the event panel and tests. */
export function snapshotOf(engine) {
  const s = engine.state;
  return {
    step: s.step, activeModal: s.activeModal, phase: s.phase, day: s.day, clock: s.clock?.label,
    cash: s.cash, health: s.health, debt: s.debt, assetsSold: [...s.assetsSold],
    billsSettled: [...(s.billsSettled ?? [])], activeBill: s.activeBill ? { ...s.activeBill } : null,
    events: engine.log.length,
  };
}
