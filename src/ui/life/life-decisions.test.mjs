// src/ui/life/life-decisions.test.mjs
// Apartment decision view-models: wording, exact effects, and the rule that building a decision changes nothing.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GameEngine } from '../../core/game-engine.mjs';
import { noticeLetter, rentDueText, rentNoticeCorrections } from './life-copy.mjs';
import { ladderDecision, optionalCouchDecision, optionalShiftDecision, payRentDecision, shortfallDecision, breakfastDecision, fiveSlotDueDecision, fiveSlotLoanDecision } from './life-decisions.mjs';
import { effectFromEvents, previewZeroCash } from './life-preview.mjs';
import { OFFER_PLACE, placeFor, rentState } from './life-routing.mjs';

const fresh = () => {
  const e = new GameEngine('seed-x');
  e.start();
  e.setupCompanion('Q', 'classic-yellow');
  return e;
};
// Day 2, $0.99 short of rent; the bill is not yet billed.
const unpaid = () => { const e = fresh(); e.state.day = 2; e.state.cash = 14.01; return e; };
// Day 2, exactly $15: rent billed and paid, cash now $0.00 (zero-cash choices open).
const paidZero = () => { const e = fresh(); e.state.day = 2; e.state.cash = 15; e.billExpense('rent', 15); return e; };
const types = (e, from) => e.log.entries.filter((x) => x.seq >= from).map((x) => x.type);

test('five-slot financial decisions explain combined debt and exact loan deadline without committing',()=>{
 const e=new GameEngine('decision-52',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 // Isolated presentation fixture: the production replay is tested separately.
 e.state.life.schedule.day=14;e.state.cash=100;e.state.life.finance.rents[0].status='paid';
 e.state.life.finance.loans.push({id:'loan-1',totalCents:7500,due:{day:14,slot:'midday'},status:'pending',latched:true});
 const before=structuredClone(e.state),length=e.log.length;
 const due=fiveSlotDueDecision(e);assert.ok(due.lines.some(line=>line.includes('$475.00') && line.includes('$375.00')));
 assert.equal(due.bills.find(bill=>bill.id==='loan-1').canPay,true);
 assert.equal(fiveSlotLoanDecision(e,'rent-2'),null);assert.deepEqual(e.state,before);assert.equal(e.log.length,length);
 e.state.life.finance.loans=[];const loan=fiveSlotLoanDecision(e,'rent-2');
 assert.ok(loan.lines.some(line=>line.includes('$450.00') && line.includes('day 19')));
 assert.ok(loan.lines.some(line=>line.includes('does not pay rent')));
 const rentOnly=fiveSlotDueDecision(e);assert.ok(rentOnly.lines.some(line=>line.includes('$60.00') && line.includes('15 HP')));
 assert.ok(rentOnly.lines.some(line=>line.includes('$30.00') && line.includes('$40.00')));
});
test('five-slot Early Evening meal uses dinner copy and the selected cost',()=>{
 const e=new GameEngine('five-slot-dinner-copy',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();e.state.life.schedule.slot='early-evening';
 const decision=breakfastDecision(e);assert.equal(decision.heading,'Dinner at home');assert.ok(decision.confirm.includes('$6.00'));assert.ok(decision.decline.label.includes('Skip dinner'));
});

test('rent short: trying to pay records the bill as due and takes nothing; the panel says so first', () => {
  const e = unpaid();
  const d = shortfallDecision(e);
  assert.ok(d.lines.some((l) => l.includes('$0.99 short') && l.includes('Nothing will be taken')));
  assert.equal(d.confirm, 'Try to pay $15.00');
  const n = e.log.length;
  const cash = e.state.cash;
  e.billExpense('rent', 15);
  assert.deepEqual(types(e, n), ['expense_due']);
  assert.equal(e.state.cash, cash);
  assert.equal(rentState(e).owing, true);
  assert.equal(placeFor(e), OFFER_PLACE.extra_shift);
});

test('rent short: each offer is shown where it lives, and only the decline that really ends the run says so', () => {
  const e = unpaid();
  e.billExpense('rent', 15);
  const seen = [];
  for (;;) {
    const d = ladderDecision(e);
    if (!d) break;
    seen.push([d.step, placeFor(e), d.decline.endsRun]);
    assert.ok(d.lines[0].includes('Nothing has been taken'));
    assert.equal(d.back, 'Not now');
    if (d.decline.endsRun) assert.match(d.decline.label, /this run ends\. Your Receipt is next\.$/);
    else assert.match(d.decline.label, /\(rent still \$0\.99 short\)$/);
    e.declineEscalation();
  }
  assert.deepEqual(seen, [
    ['extra_shift', 'desk-phone', false], ['sell_couch', 'living', false], ['sell_tv', 'living', false], ['credit_card', 'desk-card', true],
  ]);
  assert.equal(e.isTerminal(), true);
  assert.equal(e.state.step, 'receipt');
});

test('rent short: every accept states its actual effect and that rent then gets paid', () => {
  for (let skip = 0; skip < 4; skip++) {
    const e = unpaid();
    e.billExpense('rent', 15);
    for (let i = 0; i < skip; i++) e.declineEscalation();
    const d = ladderDecision(e);
    const before = { events: e.log.length, debt: e.state.debt };
    e.acceptEscalation();
    const actual = effectFromEvents(e.log.entries, before.events, before.debt);
    assert.deepEqual(d.preview.accept.effect, actual, `${d.step}: preview equals what happened`);
    assert.equal(rentState(e).paid, true, `${d.step}: rent paid`);
    assert.match(d.confirm, /then \$15\.00 rent paid$/);
    // Optional places close once rent is settled (life-routing), so the player is returned to the notice.
    assert.equal(placeFor(e, 'living'), 'kitchen-notice', 'after resolution only the notice place remains');
  }
});

test('short food bill: skip-lunch copy matches the waived bill and health loss', () => {
  const e = fresh();
  e.state.cash = 3;
  e.state.step = 'd1_morning_breakfast';
  e.billExpense('food', 5);

  const d = ladderDecision(e);
  assert.doesNotThrow(() => ladderDecision(e));
  assert.equal(d.step, 'skip_lunch');
  assert.equal(d.heading, 'Go without breakfast?');
  assert.ok(d.lines[0].includes('Food bill is $2.00 short'));
  assert.match(d.lines[1], /15 health/);
  assert.match(d.lines[1], /\$5\.00 food bill is waived/);
  assert.match(d.confirm, /Go without breakfast:.*15 health.*\$5\.00 food bill is waived/);

  const before = { events: e.log.length, debt: e.state.debt };
  e.acceptEscalation();
  const actual = effectFromEvents(e.log.entries, before.events, before.debt);
  assert.deepEqual(d.preview.accept.effect, actual);
  assert.equal(e.state.health, 85);
  assert.equal(e.state.cash, 3);
  assert.equal(e.state.activeBill, null);
  assert.ok(e.log.entries.some((entry) => entry.type === 'escalation_result' && entry.payload.effects.billWaived === 5));
});

test('declining skip lunch says the actual food shortfall remains due', () => {
  const e = fresh();
  e.state.cash = 3;
  e.state.step = 'd1_morning_breakfast';
  e.billExpense('food', 5);
  const d = ladderDecision(e);

  assert.equal(d.decline.endsRun, false);
  assert.equal(d.decline.label, 'Find another way (food bill still $2.00 short)');
  e.declineEscalation();
  assert.equal(e.state.activeBill.kind, 'food');
  assert.equal(e.state.activeBill.amount, 5);
  assert.equal(e.state.cash, 3);
});

test('paid with exactly $15: the rent decision shows cash before and after, and the notice stays plain paper', () => {
  const e = fresh();
  e.state.day = 2;
  e.state.cash = 15;
  const d = payRentDecision(e);
  assert.equal(d.confirm, 'Pay $15.00');
  assert.ok(d.lines.some((l) => l.includes('$15.00 → $0.00')));
  assert.equal(d.back, 'Put it down');

  const letter = noticeLetter({ amount: 15, unit: '4B' });
  const text = [letter.heading, ...letter.paragraphs, letter.footer].join(' ');
  assert.doesNotMatch(text, /\b(click|tap|button|press)\b/i);
});

test('optional zero-cash decisions preview the exact effect the engine then applies', () => {
  for (const [make, choice] of [[optionalShiftDecision, 'extra_shift'], [optionalCouchDecision, 'sell_couch']]) {
    const shown = make(paidZero());
    const real = paidZero();
    const before = { events: real.log.length, debt: real.state.debt };
    real.chooseZeroCashOption(choice);
    const actual = effectFromEvents(real.log.entries, before.events, before.debt);
    assert.deepEqual(shown.preview.effect, actual, `${choice}: preview equals the real effect`);
    assert.equal(shown.back, 'Not now');
    assert.equal('decline' in shown, false, `${choice}: no decline`);
  }
  assert.equal(optionalShiftDecision(paidZero()).lines[1], 'Effect: +$10.00 cash, −15 health.');
  assert.equal(optionalCouchDecision(paidZero()).lines[1], 'Effect: +$10.00 cash. The couch is gone for good.');
});

test('optional decisions are null once the engine refuses the choice', () => {
  const e = paidZero();
  e.chooseZeroCashOption('sell_couch');
  assert.equal(optionalCouchDecision(e), null, 'couch already sold and cash is no longer zero');
  assert.equal(previewZeroCash(e, 'extra_shift'), null);
});

test('breakfast decision: bakery heading, exact confirm and cash before → after', () => {
  const e = fresh();
  e.state.day = 3;
  e.state.cash = 15;
  const d = breakfastDecision(e);
  assert.match(d.heading, /bakery downstairs/);
  assert.equal(d.confirm, 'Buy breakfast for $5.00');
  assert.ok(d.lines.includes('Cash on hand: $15.00 → $10.00.'));
  assert.equal(d.back, 'Put it down');
  assert.equal(d.decline.label, 'Skip breakfast (−5 HP)');
});

test('building any decision appends no log entries and leaves engine.state unchanged', () => {
  for (const make of [
    () => { const e = unpaid(); e.billExpense('rent', 15); return e; },
    () => paidZero(),
    () => { const e = fresh(); e.state.day = 2; e.state.cash = 15; return e; },
  ]) {
    const e = make();
    const n = e.log.length;
    const state = structuredClone(e.state);
    shortfallDecision(e);
    ladderDecision(e);
    optionalShiftDecision(e);
    optionalCouchDecision(e);
    payRentDecision(e);
    breakfastDecision(e);
    assert.equal(e.log.length, n, 'no log entries appended');
    assert.deepStrictEqual(e.state, state, 'engine.state deep-equal before and after');
  }
});

test('previews are memoised while the log is unchanged, and recomputed after it grows', () => {
  const e = paidZero();
  const first = previewZeroCash(e, 'extra_shift');
  assert.equal(previewZeroCash(e, 'extra_shift'), first);
  e.log.append('action', { kind: 'noop' }, e.state.clock);
  assert.notEqual(previewZeroCash(e, 'extra_shift'), first);
});

test('rent wording uses the existing relative deadline consistently', () => {
  const life={day:1,phase:'morning',rent:{status:'pending'},config:{rentDueDay:4}};
  for (const [day, expected] of [[1,'due in three days'],[2,'due in two days'],[3,'due tomorrow morning'],[4,'due this morning']]) {
    life.day=day; if(day===4)life.rent.status='due';
    assert.equal(rentDueText(life),expected);
    assert.ok(noticeLetter({amount:170,unit:'4B',dueText:rentDueText(life)}).paragraphs[0].includes(expected));
  }
  life.rent.status='overdue';assert.equal(rentDueText(life),'overdue');
  life.rent.status='paid';assert.equal(rentDueText(life),'paid');
});

test('rent notice preserves its original print and accumulates daily handwritten corrections', () => {
  const life={day:1,phase:'morning',rent:{status:'pending'},config:{rentDueDay:4}};
  for (const [day, marks] of [[1,[]],[2,['2']],[3,['2','1']],[4,['2','1','TODAY!']],[5,['2','1','TODAY!']]]) {
    life.day=day;
    const corrections=rentNoticeCorrections(life);
    assert.deepEqual(corrections,marks);
    const letter=noticeLetter({amount:170,unit:'4B',dueText:'due in three days',corrections});
    assert.match(letter.paragraphs[0],/due in three days/);
    assert.deepEqual(letter.corrections,marks);
  }
});
