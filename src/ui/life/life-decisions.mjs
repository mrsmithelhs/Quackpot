// src/ui/life/life-decisions.mjs
// Decision view-models for the apartment: pure, no DOM. Each returns { heading, lines, confirm, back, decline?, preview?, step? }.
// Amounts come from the engine or an engine preview (life-preview.mjs). Building a decision never changes the engine.

import { decide } from './life-copy.mjs';
import { rentState } from './life-routing.mjs';
import { BREAKFAST_AMOUNT, RENT_AMOUNT, effectText, money, previewLadder, previewZeroCash } from './life-preview.mjs';

const round = (n) => Math.round(n * 100) / 100;

/** The rent bill before Pay, when cash covers it. Cash after is the engine's own subtraction. */
export function payRentDecision(engine) {
  const cashBefore = engine.state.cash;
  return decide.payRent({ amount: RENT_AMOUNT, cashBefore, cashAfter: round(cashBefore - RENT_AMOUNT) });
}

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
  skip_lunch: { heading: 'Go without breakfast?', accept: 'Go without breakfast', keep: 'Find another way' },
  extra_shift: { heading: "Cover Marisol's late shift?", accept: 'Work the shift', keep: 'Turn it down' },
  sell_couch: { heading: 'Sell the couch?', accept: 'Sell the couch', keep: 'Keep the couch' },
  sell_tv: { heading: 'Sell the TV?', accept: 'Sell the TV', keep: 'Keep the TV' },
  credit_card: { heading: 'Take a card cash advance?', accept: 'Take the advance', keep: 'Decline the advance' },
};

/**
 * The current escalation offer as a decision: accept (exact effect, and whether rent then gets paid), turn it down
 * (recorded; states that rent stays short, or that the run ends if that is what the engine would do), or put it down
 * (no decision, nothing recorded). The ending label comes from the engine's own decline preview, not the step name.
 * Null when no offer is owed.
 */
export function ladderDecision(engine) {
  const p = previewLadder(engine);
  if (!p.step) return null;
  const r = rentState(engine);
  const copy = OFFER_COPY[p.step];
  const bill = engine.state.activeBill;
  const foodBill = bill?.kind === 'food';
  const effect = effectText(p.accept.effect, { rentPaid: !foodBill && p.accept.rentPaid });
  const short = Math.max(0, round(bill.amount - engine.state.cash));
  const foodAccept = p.step === 'skip_lunch'
    ? `the ${money(bill.amount)} food bill is waived`
    : p.accept.result.resolved
      ? `then ${money(bill.amount)} food bill paid`
      : `food bill remains ${money(Math.max(0, round(bill.amount - p.accept.after.cash)))} short`;
  const lines = foodBill
    ? [`Food bill is ${money(short)} short. Nothing has been taken.`, `If you accept: ${effect}; ${foodAccept}.`]
    : [`Rent is ${money(r.short)} short. Nothing has been taken.`, `If you accept: ${effect}.`];
  if (p.step === 'credit_card') lines.splice(1, 0, `Available now: ${money(p.accept.effect.cash)}. It adds ${money(p.accept.effect.debt)} to what you owe (now ${money(engine.state.debt)}).`);
  const decline = p.decline.endsRun
    ? { label: foodBill
      ? `${copy.keep}: the ${money(bill.amount)} food bill stays due (${money(short)} short) and this run ends. Your Receipt is next.`
      : `${copy.keep}: rent stays ${money(RENT_AMOUNT)} unpaid and this run ends. Your Receipt is next.`, endsRun: true }
    : { label: foodBill
      ? `${copy.keep} (food bill still ${money(short)} short)`
      : `${copy.keep} (rent still ${money(r.short)} short)`, endsRun: false };
  const confirm = foodBill
    ? `${copy.accept}: ${effect}; ${foodAccept}`
    : `${copy.accept}: ${effect}`;
  return { step: p.step, heading: copy.heading, lines, confirm, decline, back: 'Not now', preview: p };
}

/**
 * Optional, paid with exactly $0.00: work tonight's extra shift for the engine's exact effect. Null when the engine
 * refuses the choice right now (for example, health too low, or the choice is closed).
 */
export function optionalShiftDecision(engine) {
  const p = previewZeroCash(engine, 'extra_shift');
  if (!p) return null;
  return {
    heading: "Cover Marisol's late shift?",
    lines: [
      "Tonight, Harbor Street Diner. It's a long one.",
      `Effect: ${effectText(p.effect)}.`,
      `Health ${engine.state.health} → ${p.after.health}.`,
      `Cash on hand after: ${money(p.after.cash)}.`,
    ],
    confirm: 'Work the shift',
    back: 'Not now',
    preview: p,
  };
}

/**
 * Optional, paid with exactly $0.00: sell the couch for the engine's exact effect. Null when the engine refuses it
 * (already sold, or the choice is closed).
 */
export function optionalCouchDecision(engine) {
  const p = previewZeroCash(engine, 'sell_couch');
  if (!p) return null;
  return {
    heading: 'Sell the couch?',
    lines: [
      `A buyer pays ${money(p.effect.cash)} cash and takes the couch today.`,
      `Effect: ${effectText(p.effect)}. The couch is gone for good.`,
      `Cash on hand after: ${money(p.after.cash)}.`,
    ],
    confirm: `Sell for ${money(p.effect.cash)}`,
    back: 'Not now',
    preview: p,
  };
}

/** Breakfast from the bakery downstairs. The amount is the engine's daily food cost. */
export function breakfastDecision(engine) {
  const cashBefore = engine.state.cash;
  const loss = Math.min(5, Math.max(0, engine.state.health));
  const amount = engine.state.life?.config.mealCost ?? BREAKFAST_AMOUNT;
  return { ...decide.getBreakfast({ amount, cashBefore, cashAfter: round(cashBefore - amount) }),
    back: 'Put it down', decline: { label: `Skip breakfast (−${loss} HP)`, endsRun: false } };
}
