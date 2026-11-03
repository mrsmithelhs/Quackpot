// src/ui/life/life-decisions.mjs
// Decision view-models for the apartment: pure, no DOM. Each returns { heading, lines, confirm, back, decline?, preview?, step? }.
// Amounts come from the engine or an engine preview (life-preview.mjs). Building a decision never changes the engine.

import { decide } from './life-copy.mjs';
import { rentState } from './life-routing.mjs';
import { BREAKFAST_AMOUNT, RENT_AMOUNT, effectText, money, previewLadder, previewZeroCash } from './life-preview.mjs';

const round = (n) => Math.round(n * 100) / 100;

// Presentation data only. The caller records that a choice or terms were
// shown after mounting this content; previewing it changes no game state.
export function fiveSlotDueDecision(engine) {
  const due=engine.previewFiveSlotDueOptions();
  if(!due)return null;
  const label=id=>id.startsWith('loan-')?'Payday loan':id==='rent-1'?'Remaining rent':'Rent';
  return {
    heading:due.bills.length>1?'Payments due':'Payment due',
    lines:[...due.bills.map(bill=>`${label(bill.id)}: ${money(bill.amountCents/100)}.`),
      `Cash on hand: ${money(due.cashCents/100)}.`,
      ...(due.bills.length>1?[`Together: ${money(due.totalCents/100)}; combined shortfall: ${money(due.shortfallCents/100)}. Choose which to handle first.`]:[]),
      ...(due.overtimeAvailable?['You can reserve an eligible future Evening extra shift.']:[]),
      ...(due.saleOptions.length?[`You can inspect the ${due.saleOptions.join(' and ')} for a sale in the apartment.`]:[]),
      ...(due.loanRentIds.length?['A payday loan may cover a rent shortfall; see its full terms before deciding.']:[])],
    bills:due.bills.map(bill=>({...bill,label:label(bill.id),canPay:due.cashCents>=bill.amountCents,
      unpaidOutcome:bill.id==='rent-2'?'Losing housing ends the run.':'Running on Empty ends the run.'})),
    saleOptions:due.saleOptions,loanRentIds:due.loanRentIds,overtimeAvailable:due.overtimeAvailable,
  };
}

export function fiveSlotLoanDecision(engine,billId) {
  const terms=engine.previewFiveSlotLoanTerms(billId);
  if(!terms)return null;
  return {heading:'Payday loan',lines:[`Borrow ${money(terms.principalCents/100)}.`,
    `One-time fee: ${money(terms.feeCents/100)}. Repay ${money(terms.totalCents/100)} by Midday on day ${terms.due.day}, before work.`,
    'You may repay the full amount early. Accepting the loan does not pay rent; choose Pay separately.'],terms};
}

/** Use the committed effect, including clamping, rather than reconstructing it from the offer. */
export function workCompletionLines(result, state, pay, overtime) {
  const lines = [`Pay received: ${money(pay)}. Cash on hand: ${money(state.cash)}.`];
  if (overtime) {
    const effect = result.events?.find(event => event.type === 'life_health' && event.payload.reason === 'overtime');
    if (effect) lines.push(`Health changed by ${effect.payload.delta} HP (${effect.payload.before} → ${effect.payload.after}).`);
  }
  return lines;
}

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
  if (engine.state.life?.phase === 'evening') return {
    heading: 'Dinner at home', lines: [`Dinner costs ${money(amount)}.`, `Cash on hand: ${money(cashBefore)} → ${money(round(cashBefore - amount))}.`],
    confirm: `Buy dinner for ${money(amount)}`, back: 'Put it down',
    decline: { label: `Skip dinner (−${loss} HP)`, endsRun: false },
  };
  return { ...decide.getBreakfast({ amount, cashBefore, cashAfter: round(cashBefore - amount) }),
    back: 'Put it down', decline: { label: `Skip breakfast (−${loss} HP)`, endsRun: false } };
}
