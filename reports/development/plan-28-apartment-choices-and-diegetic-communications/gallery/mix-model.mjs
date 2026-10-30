// Plan 28 selected interaction model (owner D20: the mix). Pure routing and decision view-models, no DOM.
// Where the flow belongs is derived from engine state alone, so it would survive a reload. Every amount on a
// decision comes from an engine clone of the action about to run (comparison/life-model.mjs previews).

import { previewLadder } from '../comparison/life-model.mjs';
import { RENT_AMOUNT, effectText, money } from '../comparison/views.mjs';

const round = (n) => Math.round(n * 100) / 100;

/** Each escalation offer lives where it would in the apartment: a text on the phone, a sale at the object. */
export const OFFER_PLACE = Object.freeze({ extra_shift: 'desk-phone', sell_couch: 'living', sell_tv: 'living', credit_card: 'desk-card' });

export function rentState(engine) {
  const s = engine.state;
  const paid = (s.billsSettled ?? []).includes('d2_rent');
  const owing = s.activeBill?.billId === 'd2_rent';
  const short = owing ? round(s.activeBill.amount - s.cash) : Math.max(0, round(RENT_AMOUNT - s.cash));
  return { paid, owing, short, cash: s.cash };
}

/**
 * The place the selected flow should show. Mandatory beats win: the Receipt once terminal, the current escalation
 * offer while rent is owed, the notice until rent has been dealt with, breakfast on Day 3. Otherwise the place the
 * player chose with the day bar (`requested`) stands, so optional beats stay optional.
 */
export function placeFor(engine, requested = 'kitchen-notice') {
  if (engine.isTerminal()) return 'receipt';
  const r = rentState(engine);
  if (r.owing) return OFFER_PLACE[engine.getCurrentEscalationStep()] ?? 'kitchen-notice';
  if (!r.paid) return 'kitchen-notice';
  if (engine.state.day >= 3) return 'kitchen-breakfast';
  return requested;
}

/** Optional beats after rent is paid with exactly $15 (zero-cash choices): only while that choice is open. */
export const optionalOpen = (engine) => engine.state.activeModal === 'zerocash' && engine.state.cash === 0;

/**
 * The game's panel on the held rent notice when cash is short. The button runs the same billExpense call as Pay:
 * the bill comes due, nothing is taken, and the options to cover it follow. The panel says so before the press.
 */
export function shortfallDecision(engine) {
  const r = rentState(engine);
  return {
    heading: `Rent: ${money(RENT_AMOUNT)}, and you have ${money(r.cash)}`,
    lines: [
      `You are ${money(r.short)} short. Nothing will be taken.`,
      'Your options to cover it come next, one at a time. You can turn each one down.',
    ],
    confirm: `Try to pay ${money(RENT_AMOUNT)}`,
    back: 'Put it down',
  };
}

const OFFER_COPY = {
  extra_shift: { heading: "Cover Marisol's late shift?", accept: 'Work the shift', keep: 'Turn it down' },
  sell_couch: { heading: 'Sell the couch?', accept: 'Sell the couch', keep: 'Keep the couch' },
  sell_tv: { heading: 'Sell the TV?', accept: 'Sell the TV', keep: 'Keep the TV' },
  credit_card: { heading: 'Take a card cash advance?', accept: 'Take the advance', keep: 'Decline the advance' },
};

/**
 * The current escalation offer as a decision: accept (exact effect, and whether rent then gets paid), turn it down
 * (recorded; states that rent stays short, or that the run ends if that is what the engine would do), or put it down
 * (no decision, nothing recorded). The ending label comes from the engine's own decline preview, not the step name.
 */
export function ladderDecision(engine) {
  const p = previewLadder(engine);
  if (!p.step) return null;
  const r = rentState(engine);
  const copy = OFFER_COPY[p.step];
  const effect = effectText(p.accept.effect, { rentPaid: p.accept.rentPaid });
  const lines = [`Rent is ${money(r.short)} short. Nothing has been taken.`, `If you accept: ${effect}.`];
  if (p.step === 'credit_card') lines.splice(1, 0, `Available now: ${money(p.accept.effect.cash)}. It adds ${money(p.accept.effect.debt)} to what you owe (now ${money(engine.state.debt)}).`);
  const decline = p.decline.endsRun
    ? { label: `${copy.keep}: rent stays ${money(RENT_AMOUNT)} unpaid and this run ends. Your Receipt is next.`, endsRun: true }
    : { label: `${copy.keep} (rent still ${money(r.short)} short)`, endsRun: false };
  return { step: p.step, heading: copy.heading, lines, confirm: `${copy.accept}: ${effect}`, decline, back: 'Not now', preview: p };
}
