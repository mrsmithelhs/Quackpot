import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, GAME_CONSTANTS } from '../../core/game-engine.mjs';
import {
  BREAKFAST_STEP_BY_DAY, LIFE_STEPS, KNOWN_STEPS, OFFER_PLACE, PLACES,
  isLifeStep, isBreakfastStep, isKnownStep,
  rentState, breakfastState, optionalOpen, currentOffer, availablePlaces,
  placeFor, afterBreakfast, breakfastBeforeMidday, normalizeLoadedStep,
  lifeSurface, fiveSlotPriority, fiveSlotSocialView,
} from './life-routing.mjs';

test('five-slot routing puts recovery before a latched loan or rent',()=>{
 const e=new GameEngine('five-slot-route',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 e.state.life.schedule.day=14;e.state.life.schedule.slot='midday';e.state.life.schedule.recovery={id:'zero',resolved:false};
 e.state.life.finance.loans.push({id:'loan-1',totalCents:150,due:{day:14,slot:'midday'},status:'pending',latched:false});
 assert.deepEqual(fiveSlotPriority(e),{kind:'recovery'});
 assert.equal(lifeSurface(e),'life_recovery');
 e.state.life.schedule.recovery=null;
 assert.deepEqual(fiveSlotPriority(e),{kind:'payment',billIds:['rent-1','rent-2','loan-1'],rescueReservation:null});
 assert.equal(lifeSurface(e),'life_rent');
 assert.equal(rentState(e).owing,true);assert.equal(rentState(e).short,90);
});
test('five-slot apartment routing uses the actual slot and keeps free navigation available',()=>{
 const e=new GameEngine('five-slot-places',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 e.state.life.schedule.day=2;e.state.life.schedule.slot='evening';e.state.step=lifeSurface(e);
 assert.equal(e.state.step,'life_evening');assert.ok(availablePlaces(e).includes('bedroom'));assert.ok(availablePlaces(e).includes('door'));
 e.state.life.schedule.active={id:'activity',kind:'session'};assert.equal(availablePlaces(e).includes('door'),false);
});
test('five-slot Ren presentation uses scheduler day and dinner without mutating state',()=>{
 const e=new GameEngine('five-slot-ren-view',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 e.state.life.schedule.day=2;e.state.life.schedule.slot='evening';e.state.life.schedule.obligations['2:dinner']='buy';const before=structuredClone(e.state);
 const view=fiveSlotSocialView(e);assert.equal(view.day,2);assert.equal(view.phase,'evening');assert.equal(view.meals['d2-dinner'],'buy');assert.deepEqual(e.state,before);
});

// Test-local stand-ins for the controller (main.js) wiring described in the Plan 38 brief.

function freshEngine(seed) {
  const engine = new GameEngine(seed);
  engine.start();
  engine.setupCompanion('Q', 'classic-yellow');
  return engine;
}

/** "Go to work": close an open zero-cash modal, credit the wage, move to Day 3 morning. */
function goToWork(engine) {
  if (engine.state.activeModal === 'zerocash') engine.chooseZeroCashOption('continue');
  engine.creditWage();
  engine.advanceDay(3, 'day 3 morning');
  engine.state.step = 'd3_morning_breakfast';
}

/** A breakfast tap: charge $5, and only when paid apply afterBreakfast (advance, then step). */
function tapBreakfast(engine) {
  const result = engine.billExpense('food', 5);
  if (!result.paid) return { result, next: null };
  const next = afterBreakfast(engine);
  if (next.advance) engine.advanceDay(...next.advance);
  engine.state.step = next.step;
  return { result, next };
}

const wageEntries = (engine) => engine.log.entries.filter((e) => e.type === 'income' && e.payload?.kind === 'wage');

/** Day 2 rent paid to exactly $0: the zero-cash modal is open and the optional beats are available. */
function paidZeroRent(seed) {
  const engine = freshEngine(seed);
  engine.state.cash = 15;
  engine.advanceDay(2, 'day 2 afternoon');
  engine.state.step = 'd2_afternoon_rent';
  engine.billExpense('rent', 15);
  return engine;
}

/** Day 2 rent unpaid with $5 on hand: the ladder is open at extra shift. */
function shortRent(seed) {
  const engine = freshEngine(seed);
  engine.state.cash = 5;
  engine.advanceDay(2, 'day 2 afternoon');
  engine.state.step = 'd2_afternoon_rent';
  engine.billExpense('rent', 15);
  return engine;
}

test('life steps, breakfast map and known steps line up', () => {
  assert.deepEqual(BREAKFAST_STEP_BY_DAY, { 1: 'd1_morning_breakfast', 2: 'd2_morning_breakfast', 3: 'd3_morning_breakfast' });
  assert.deepEqual(LIFE_STEPS, [
    'd1_morning_breakfast', 'd2_morning_breakfast', 'd3_morning_breakfast', 'life_breakfast', 'life_work', 'life_evening', 'life_recovery',
    'd2_afternoon_rent', 'd2_afternoon_rent_resolved', 'd2_afternoon_zerocash', 'd2_afternoon_escalation', 'life_rent',
  ]);
  for (const step of LIFE_STEPS) {
    assert.equal(isLifeStep(step), true, step);
    assert.equal(isKnownStep(step), true, step);
  }
  assert.equal(isLifeStep('d1_morning_gacha'), false);
  assert.equal(isLifeStep('desk'), false);
  assert.equal(isBreakfastStep('d2_morning_breakfast'), true);
  assert.equal(isBreakfastStep('life_breakfast'), true);
  assert.equal(isBreakfastStep('d2_afternoon_rent'), false);
  for (const step of ['desk', 'd1_morning_gacha', 'd1_midday_race_result', 'd3_midday_race', 'receipt']) {
    assert.equal(isKnownStep(step), true, step);
  }
  assert.equal(isKnownStep('mystery'), false);
  assert.deepEqual(PLACES, ['kitchen-notice', 'kitchen-breakfast', 'desk-phone', 'desk-card', 'living']);
});

test('unpaid rent shows the notice even when the player requests an optional place', () => {
  const engine = freshEngine('routing-unpaid-notice');
  engine.state.cash = 5;
  engine.advanceDay(2, 'day 2 afternoon');
  engine.state.step = 'd2_afternoon_rent'; // rent owed, no offer raised yet: notice only
  assert.equal(placeFor(engine, 'desk-phone'), 'kitchen-notice');
  assert.equal(placeFor(engine), 'kitchen-notice');
  assert.deepEqual(availablePlaces(engine), ['kitchen-notice']);
});

test('paid rent with cash left: notice only, and a requested desk-phone is refused', () => {
  const engine = freshEngine('routing-paid-cash');
  engine.state.cash = 20;
  engine.advanceDay(2, 'day 2 afternoon');
  engine.state.step = 'd2_afternoon_rent';
  const result = engine.billExpense('rent', 15);
  assert.equal(result.paid, true);
  assert.equal(engine.state.cash, 5);
  assert.equal(engine.state.step, 'd2_afternoon_rent_resolved');
  assert.equal(optionalOpen(engine), false);
  assert.equal(placeFor(engine, 'desk-phone'), 'kitchen-notice');
  assert.equal(placeFor(engine, 'living'), 'kitchen-notice');
  assert.deepEqual(availablePlaces(engine), ['kitchen-notice']);
});

test('paid to zero: requested desk-phone and living are honoured, so optional beats stay optional', () => {
  const engine = paidZeroRent('routing-paid-zero');
  assert.equal(engine.state.cash, 0);
  assert.equal(engine.state.activeModal, 'zerocash');
  assert.equal(optionalOpen(engine), true);
  assert.deepEqual(availablePlaces(engine), ['kitchen-notice', 'desk-phone', 'living']);
  assert.equal(placeFor(engine, 'desk-phone'), 'desk-phone');
  assert.equal(placeFor(engine, 'living'), 'living');
  assert.equal(placeFor(engine, 'kitchen-notice'), 'kitchen-notice');
  assert.equal(placeFor(engine, 'desk-card'), 'kitchen-notice', 'a place this step does not offer falls back to the default');
  assert.equal(placeFor(engine), 'kitchen-notice');
});

test('short rent walks the ladder in order: extra shift, couch, TV, card, then terminal', () => {
  const engine = shortRent('routing-ladder');
  const expected = [
    ['extra_shift', 'desk-phone'],
    ['sell_couch', 'living'],
    ['sell_tv', 'living'],
    ['credit_card', 'desk-card'],
  ];
  for (const [offer, place] of expected) {
    assert.equal(currentOffer(engine), offer);
    assert.equal(OFFER_PLACE[offer], place);
    assert.equal(placeFor(engine), place);
    assert.equal(placeFor(engine, 'kitchen-notice'), place, 'the owed offer wins over any requested place');
    assert.deepEqual(availablePlaces(engine), [place], 'while an offer is owed, only its place is offered');
    engine.declineEscalation();
  }
  assert.equal(engine.isTerminal(), true);
  assert.equal(engine.state.step, 'receipt');
  assert.equal(placeFor(engine), null);
});

test('short breakfast offers skip lunch at the plate', () => {
  const engine = freshEngine('routing-breakfast-short');
  engine.state.cash = 3;
  engine.state.step = 'd1_morning_breakfast';
  const result = engine.billExpense('food', 5);
  assert.equal(result.needsEscalation, true);
  assert.equal(currentOffer(engine), 'skip_lunch');
  assert.equal(placeFor(engine), 'kitchen-breakfast');
});

test('paid-zero exclusivity: taking the extra shift closes the optional places and the couch', () => {
  const engine = paidZeroRent('routing-exclusive');
  engine.chooseZeroCashOption('extra_shift');
  assert.equal(engine.state.cash, 10);
  assert.equal(optionalOpen(engine), false);
  assert.deepEqual(availablePlaces(engine), ['kitchen-notice']);
  assert.throws(() => engine.chooseZeroCashOption('sell_couch'), /Zero-cash option selected when cash is/);
});

test('Go to work on the paid-zero path credits exactly one wage, with and without the shift', () => {
  const plain = paidZeroRent('routing-work-plain');
  const plainWages = wageEntries(plain).length;
  goToWork(plain);
  assert.equal(wageEntries(plain).length, plainWages + 1);
  assert.equal(plain.state.cash, GAME_CONSTANTS.WAGE_DAILY);
  assert.equal(plain.state.step, 'd3_morning_breakfast');
  assert.equal(plain.state.day, 3);

  const shifted = paidZeroRent('routing-work-shift');
  shifted.chooseZeroCashOption('extra_shift');
  const shiftedWages = wageEntries(shifted).length;
  goToWork(shifted);
  assert.equal(wageEntries(shifted).length, shiftedWages + 1);
  assert.equal(shifted.state.cash, 10 + GAME_CONSTANTS.WAGE_DAILY);
  assert.equal(shifted.state.step, 'd3_morning_breakfast');
});

test('read-only helpers append no log entries and leave state deep-equal', () => {
  const engine = shortRent('routing-read-only');
  // currentOffer reads through getCurrentEscalationStep, which on the first read moves a rent ladder from index 1
  // to 2. That normalisation is engine-side and predates this module, so the snapshot is taken after it.
  engine.getCurrentEscalationStep();
  const stateBefore = structuredClone(engine.state);
  const logBefore = engine.log.entries.length;
  placeFor(engine);
  placeFor(engine, 'desk-phone');
  availablePlaces(engine);
  rentState(engine);
  breakfastState(engine);
  currentOffer(engine);
  optionalOpen(engine);
  assert.equal(engine.log.entries.length, logBefore);
  assert.deepEqual(engine.state, stateBefore);

  const breakfast = freshEngine('routing-read-only-breakfast');
  breakfast.state.cash = 15;
  breakfast.advanceDay(2, 'day 2 morning');
  breakfast.state.step = 'd2_morning_breakfast';
  const breakfastBefore = structuredClone(breakfast.state);
  const breakfastLog = breakfast.log.entries.length;
  assert.equal(placeFor(breakfast), 'kitchen-breakfast');
  availablePlaces(breakfast);
  breakfastState(breakfast);
  assert.equal(breakfast.log.entries.length, breakfastLog);
  assert.deepEqual(breakfast.state, breakfastBefore);
});

test('afterBreakfast Day 1 goes to the gacha while the pull is open, to midday once it is committed', () => {
  const open = freshEngine('routing-d1-open');
  open.state.cash = 15;
  open.state.step = 'd1_morning_breakfast';
  assert.deepEqual(afterBreakfast(open), { step: 'd1_morning_gacha', advance: null, phone: true });
  const openTap = tapBreakfast(open);
  assert.equal(openTap.result.paid, true);
  assert.equal(open.state.step, 'd1_morning_gacha');
  assert.equal(open.state.day, 1);

  const committed = freshEngine('routing-d1-committed');
  committed.state.cash = 15;
  committed.commitPromotionalTenPull();
  committed.state.step = 'd1_morning_breakfast';
  assert.deepEqual(afterBreakfast(committed), { step: 'd1_midday_race', advance: [1, 'day 1 midday'], phone: true });
  const committedTap = tapBreakfast(committed);
  assert.equal(committedTap.result.paid, true);
  assert.equal(committed.state.step, 'd1_midday_race');
  assert.equal(committed.state.clock.label, 'day 1 midday');
  assert.equal(committed.state.day, 1);
});

test('afterBreakfast Day 2 goes to the rent, Day 3 to the midday race', () => {
  const day2 = freshEngine('routing-d2');
  day2.state.cash = 15;
  day2.advanceDay(2, 'day 2 morning');
  day2.state.step = 'd2_morning_breakfast';
  assert.deepEqual(afterBreakfast(day2), { step: 'd2_afternoon_rent', advance: null, phone: false });
  assert.equal(tapBreakfast(day2).result.paid, true);
  assert.equal(day2.state.step, 'd2_afternoon_rent');
  assert.equal(day2.state.billsSettled.includes('d2_food'), true);

  const day3 = freshEngine('routing-d3');
  day3.state.cash = 15;
  day3.advanceDay(3, 'day 3 morning');
  day3.state.step = 'd3_morning_breakfast';
  assert.deepEqual(afterBreakfast(day3), { step: 'd3_midday_race', advance: null, phone: true });
  assert.equal(tapBreakfast(day3).result.paid, true);
  assert.equal(day3.state.step, 'd3_midday_race');
});

test('breakfastBeforeMidday reads the Day 1 food bill', () => {
  const engine = freshEngine('routing-before-midday');
  engine.state.cash = 15;
  assert.equal(breakfastBeforeMidday(engine), true);
  engine.state.step = 'd1_morning_breakfast';
  tapBreakfast(engine);
  assert.equal(breakfastBeforeMidday(engine), false);
});

test('normalizeLoadedStep: a crash after the charge moves forward with no second charge', () => {
  const engine = freshEngine('routing-crash');
  engine.state.cash = 15;
  engine.advanceDay(2, 'day 2 morning');
  engine.state.step = 'd2_morning_breakfast';
  engine.billExpense('food', 5); // the charge lands; the step update never happens (simulated crash)
  const cashAfterCharge = engine.state.cash;

  const repaired = normalizeLoadedStep(engine);
  assert.equal(repaired.recovered, false);
  assert.equal(repaired.step, 'd2_morning_breakfast');
  assert.deepEqual(repaired.next, { step: 'd2_afternoon_rent', advance: null, phone: false });
  assert.equal(engine.state.cash, cashAfterCharge);

  const logBefore = engine.log.entries.length;
  const again = engine.billExpense('food', 5);
  assert.equal(again.alreadySettled, true);
  assert.equal(engine.state.cash, cashAfterCharge);
  assert.equal(engine.log.entries.length, logBefore);
});

test('normalizeLoadedStep: settled zero-cash breakfast preserves its pending choice', () => {
  const engine = freshEngine('routing-zero-cash-breakfast');
  engine.state.cash = 5;
  engine.state.step = 'd1_morning_breakfast';
  engine.billExpense('food', 5);
  assert.equal(engine.state.activeModal, 'zerocash');
  assert.equal(engine.state.step, 'd1_morning_breakfast');
  const before = structuredClone(engine.state);

  assert.deepEqual(normalizeLoadedStep(engine), { step: 'd1_morning_breakfast', recovered: false, next: null });
  assert.deepEqual(engine.state, before, 'reload normalization preserves the active zero-cash decision and context');
});

test('normalizeLoadedStep: settled breakfast preserves an active retention interruption', () => {
  const engine = freshEngine('routing-retention-breakfast');
  engine.state.cash = 15;
  engine.state.step = 'd2_morning_breakfast';
  engine.billExpense('food', 5);
  engine.clickUninstall();
  assert.equal(engine.state.activeModal, 'retention');
  assert.deepEqual(engine.state.interruptedContext, { step: 'd2_morning_breakfast', activeModal: null });
  const before = structuredClone(engine.state);

  assert.deepEqual(normalizeLoadedStep(engine), { step: 'd2_morning_breakfast', recovered: false, next: null });
  assert.deepEqual(engine.state, before, 'reload normalization leaves retention and its saved interruption intact');
});

test('normalizeLoadedStep: an unpaid breakfast needs no repair', () => {
  const engine = freshEngine('routing-unpaid-breakfast');
  engine.state.cash = 15;
  engine.state.step = 'd1_morning_breakfast';
  assert.deepEqual(normalizeLoadedStep(engine), { step: 'd1_morning_breakfast', recovered: false, next: null });
});

test('normalizeLoadedStep: an unknown step is reported and never rewritten', () => {
  const engine = freshEngine('routing-unknown-step');
  engine.state.step = 'mystery';
  const before = structuredClone(engine.state);
  assert.deepEqual(normalizeLoadedStep(engine), { step: 'mystery', recovered: true, next: null });
  assert.deepEqual(engine.state, before);
});

test('new-policy breakfast uses the selected meal window and actual state', () => {
  const e = new GameEngine('life-breakfast', { lifePolicy: true });
  e.start(); e.setupCompanion(); e.state.step = 'life_breakfast';
  assert.deepEqual(breakfastState(e), { day: 1, billId: 'd1-breakfast', settled: false, owing: false });
  assert.equal(placeFor(e), 'kitchen-breakfast');
  assert.equal(e.applyLifeIntent({ type: 'meal', choice: 'skip' }).ok, true);
  assert.equal(breakfastState(e).settled, true);
  assert.equal(e.state.health, 95);
});

test('new-policy rent notice reads the outstanding amount and affordability', () => {
  const e = new GameEngine('life-rent', { lifePolicy: true }); e.start(); e.setupCompanion();
  e.state.step = 'life_rent'; e.state.life.rent.status = 'due';
  assert.deepEqual(rentState(e), { paid: false, owing: true, short: 90, cash: 80 });
  assert.equal(placeFor(e), 'kitchen-breakfast');
});

test('new life route follows breakfast, separate shift and evening dinner with resume', () => {
  const e = new GameEngine('life-day-one', { lifePolicy: true }); e.start(); e.setupCompanion();
  assert.equal(lifeSurface(e), 'life_breakfast');
  assert.deepEqual(availablePlaces(Object.assign(e, { state: { ...e.state, step: 'life_breakfast' } })), ['kitchen-breakfast', 'desk-phone', 'living']);
  assert.equal(e.applyLifeIntent({ type: 'meal', choice: 'buy' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'advance' }).ok, true);
  e.state.step = lifeSurface(e); assert.equal(e.state.step, 'life_work');
  assert.equal(e.applyLifeIntent({ type: 'agree_work', kind: 'scheduled' }).ok, true);
  const id = e.state.life.work.id; assert.equal(e.state.cash, 74);
  const resumed = GameEngine.fromEnvelope(e.toEnvelope());
  assert.equal(resumed.state.life.work.id, id);
  assert.equal(resumed.applyLifeIntent({ type: 'complete_work', id }).ok, true);
  assert.equal(resumed.state.cash, 134);
  assert.equal(resumed.applyLifeIntent({ type: 'complete_work', id }).ok, false);
  assert.equal(resumed.applyLifeIntent({ type: 'advance' }).ok, true);
  resumed.state.step = lifeSurface(resumed); assert.equal(resumed.state.step, 'life_evening');
  assert.equal(placeFor(resumed), 'desk-phone');
  assert.equal(resumed.applyLifeIntent({ type: 'meal', choice: 'buy' }).ok, true);
  assert.equal(resumed.state.cash, 128);
});
