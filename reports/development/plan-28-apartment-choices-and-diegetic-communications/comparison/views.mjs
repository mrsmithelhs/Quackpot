// Plan 28 report-local prototype: Direction A view-models and selected copy.
// Every money/health/debt figure on a control comes from an engine preview (life-model.mjs), not from constants,
// so the copy cannot drift from what the click actually does. DOM rendering lives in prototype.js.

import { GAME_CONSTANTS } from '../../../../src/core/game-engine.mjs';
import { effectFromEvents, ledgerFacts, previewLadder, previewZeroCash } from './life-model.mjs';

export const RENT_SENDER = 'Harbor Court Property Office';
export const SHIFT_SENDER = 'Marisol · Harbor Street Diner';
export const RENT_AMOUNT = GAME_CONSTANTS.RENT_DAY2;

export const money = (n) => `$${Math.abs(n).toFixed(2)}`;
const signedMoney = (n) => `${n < 0 ? '−' : '+'}${money(n)}`;

/** Human-readable effect, listing only what changes (Continue/Decline need not repeat unchanged balances). */
export function effectText(delta, { rentPaid = false } = {}) {
  const parts = [];
  if (delta.cash) parts.push(`${signedMoney(delta.cash)} cash`);
  if (delta.health) parts.push(`${delta.health > 0 ? '+' : '−'}${Math.abs(delta.health)} health`);
  if (delta.debt > 0) parts.push(`${money(delta.debt)} more owed`);
  else if (delta.debt < 0) parts.push(`${money(delta.debt)} less owed`);
  if (rentPaid) parts.push(`then ${money(RENT_AMOUNT)} rent paid`);
  return parts.join(', ');
}

const MORNING_LINES = { 1: 'Toast, the last of the coffee.', 2: 'Coffee again.', 3: 'Last of the eggs.' };

/** Morning ledger: past-tense facts from the log. The only control is Continue; nothing is chosen here. */
export function ledgerView(entries, day) {
  const f = ledgerFacts(entries, day);
  const lines = [];
  if (f.wage) lines.push(`Last night's wage: +${money(f.wage.amount)}.`);
  if (f.food) lines.push(`Breakfast: ${money(f.food.amount)}, paid this morning.`);
  if (f.foodUnpaid) lines.push('Breakfast is not paid yet.');
  if (f.food) lines.push(`Cash on hand: ${money(f.food.cashAfter)}.`);
  return {
    moment: 'ledger',
    provenance: 'log-projection',
    card: { kind: 'note', heading: `Day ${day} morning`, aside: MORNING_LINES[day] ?? '', lines },
    controls: [{ id: 'continue', label: 'Continue', primary: true }],
    facts: f,
  };
}

/** Rent bill before Pay. The status says "not yet paid" until the engine records payment. */
export function rentDueView(engine) {
  const s = engine.state;
  return {
    moment: 'rent-due',
    provenance: 'live-engine',
    card: {
      kind: 'bill', sender: RENT_SENDER, heading: 'Rent due today · Unit 4B',
      lines: [`Amount due: ${money(RENT_AMOUNT)}.`, `Cash on hand: ${money(s.cash)}.`, 'Status: not yet paid.'],
    },
    controls: [{ id: 'pay', label: `Pay rent (${money(RENT_AMOUNT)})`, primary: true }],
  };
}

/** Rent paid and cash is exactly zero. Neutral: paid in full, nothing failed, wage still arrives. */
export function paidZeroView(engine) {
  const controls = [{ id: 'zero:continue', label: 'Continue to evening', primary: true, effect: '', preview: previewZeroCash(engine, 'continue') }];
  const shift = previewZeroCash(engine, 'extra_shift');
  if (shift) controls.push({ id: 'zero:extra_shift', label: `Work an extra night shift (${effectText(shift.effect)})`, effect: effectText(shift.effect), preview: shift });
  const couch = previewZeroCash(engine, 'sell_couch');
  if (couch) controls.push({ id: 'zero:sell_couch', label: `Sell the couch (${effectText(couch.effect)})`, effect: effectText(couch.effect), preview: couch });
  return {
    moment: 'paid-zero',
    provenance: 'live-engine',
    card: {
      kind: 'bill', sender: RENT_SENDER, heading: 'Rent paid in full', stamp: 'PAID',
      lines: [
        `Paid ${money(RENT_AMOUNT)} today. Cash on hand: ${money(engine.state.cash)}.`,
        `Your ${money(GAME_CONSTANTS.WAGE_DAILY)} wage arrives this evening. Nothing else is due today.`,
        'The other two options below are optional.',
      ],
    },
    controls,
  };
}

const OFFER_CARDS = {
  extra_shift: (p) => ({ kind: 'message', sender: SHIFT_SENDER, heading: 'Can you take tonight?', lines: [`Late shift tonight, ${money(p.accept.effect.cash)} cash. It's a long one.`] }),
  sell_couch: (p) => ({ kind: 'listing', heading: 'For sale: couch', lines: [`A buyer will pay ${money(p.accept.effect.cash)} now and collect it tonight. The couch is gone for good.`] }),
  sell_tv: (p) => ({ kind: 'listing', heading: 'For sale: TV', lines: [`A buyer will pay ${money(p.accept.effect.cash)} now. The TV is gone for good.`] }),
  credit_card: (p, s) => ({ kind: 'statement', heading: 'Card cash advance', lines: [`Available now: ${money(p.accept.effect.cash)}.`, `Adds ${money(p.accept.effect.debt)} to what you owe (now ${money(s.debt)}).`] }),
};
const ACCEPT_VERB = { extra_shift: 'Work the extra night shift', sell_couch: 'Sell the couch', sell_tv: 'Sell the TV', credit_card: 'Take the cash advance' };

/** Unpaid rent: the bill stays unpaid; one engine-eligible offer at a time; the run-ending decline says so. */
export function rentUnpaidView(engine) {
  const s = engine.state;
  const bill = s.activeBill ?? { amount: RENT_AMOUNT, kind: 'rent' };
  const p = previewLadder(engine);
  const shortfall = Math.round((bill.amount - s.cash) * 100) / 100;
  const billCard = {
    kind: 'bill', sender: RENT_SENDER, heading: `Rent unpaid · you need ${money(shortfall)} more`,
    lines: [
      `Amount due: ${money(bill.amount)}. Cash on hand: ${money(s.cash)}. Nothing has been taken.`,
      `It stays unpaid until you have ${money(bill.amount)} cash.`,
    ],
  };
  if (!p.step) {
    return { moment: 'rent-unpaid', provenance: 'live-engine', offerStep: null, card: billCard, controls: [], ladder: p };
  }
  const offer = OFFER_CARDS[p.step](p, s);
  const accept = { id: 'ladder:accept', label: `${ACCEPT_VERB[p.step]} (${effectText(p.accept.effect, { rentPaid: p.accept.rentPaid })})`, primary: true, preview: p.accept };
  const decline = p.decline.endsRun
    ? { id: 'ladder:decline', label: `Decline — rent stays ${money(bill.amount)} unpaid and this run ends. Your Receipt is next.`, endsRun: true, preview: p.decline }
    : { id: 'ladder:decline', label: `Skip this offer (rent still ${money(shortfall)} short)`, endsRun: false, preview: p.decline };
  return { moment: 'rent-unpaid', provenance: 'live-engine', offerStep: p.step, card: billCard, offer, controls: [accept, decline], ladder: p };
}

/**
 * After a ladder accept or zero-cash choice: what actually happened, read from the events the engine appended
 * since `before.events` and from engine state afterwards.
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

/** Desk-side return composition (display-only): today's facts on a sticky note beside the phone. */
export function returnView(engine) {
  const s = engine.state;
  const lines = [`Cash on hand: ${money(s.cash)}. Health: ${s.health}.`];
  if (s.day === 2 && !(s.billsSettled ?? []).includes('d2_rent')) lines.push(`Rent ${money(RENT_AMOUNT)} due this afternoon.`);
  if (s.assetsSold.length) lines.push(`Sold: ${s.assetsSold.join(', ')}.`);
  return {
    moment: 'return',
    provenance: 'display-only',
    card: { kind: 'note', heading: `Day ${s.day}`, lines },
    controls: [{ id: 'open-quackpot', label: 'Open Quackpot', primary: true }],
  };
}

/** Phone or Receipt stand-in for steps outside this prototype. */
export function standinView(kind) {
  const text = {
    'race-1': ['Next on the phone: race 1', 'The gacha and races are outside this prototype.'],
    'race-2': ['Next on the phone: race 2', 'The gacha and races are outside this prototype.'],
    receipt: ['This run has ended', 'The Receipt would open next. It is outside this prototype.'],
    quackpot: ['Quackpot (landscape phone)', 'Stand-in only. The phone turns back to portrait when you return.'],
  }[kind];
  return {
    moment: 'standin', provenance: 'display-only',
    card: { kind: 'standin', heading: text[0], lines: [text[1]] },
    controls: kind === 'quackpot' ? [{ id: 'return', label: 'Return to apartment', primary: true }] : [],
  };
}
