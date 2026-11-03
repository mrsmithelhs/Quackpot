// Apartment life routing (Plan 38, the Plan 28 selected mix). Pure: reads engine state, never mutates it.
// Life steps are apartment surfaces; phone steps (gacha, races, Receipt) keep their own views. Which place in the
// apartment is shown is derived from state, so mandatory beats survive reload while the player's own choice of
// place is UI state that is never saved.

const round = (n) => Math.round(n * 100) / 100;
export const fiveSlotLabel = slot => ({morning:'Morning',midday:'Midday','early-evening':'Early Evening',evening:'Evening','late-evening':'Late Evening'})[slot] ?? '';

// Unmounted routing seam for the new policy. Recovery wins even when an
// obligation is already due; the pending bill remains visible afterward.
export function fiveSlotPriority(engine) {
  const life=engine.state.life;
  if(life?.policyVersion!=='five-slot-v1')return null;
  if(life.schedule.recovery)return {kind:'recovery'};
  const due=engine.checkDueObligations();
  if(due.bills.length)return {kind:'payment',billIds:due.bills.map(bill=>bill.id),
    rescueReservation:!due.bills.some(bill=>bill.id.startsWith('loan-')) && life.schedule.overtimeReservation?.status==='reserved' ? structuredClone(life.schedule.overtimeReservation) : null};
  return {kind:'slot',day:life.schedule.day,slot:life.schedule.slot};
}

// Presentation-only compatibility view; scheduler state remains authoritative.
export function fiveSlotSocialView(engine) {
  const life=engine.state.life;if(life?.policyVersion!=='five-slot-v1')return life;
  const s=life.schedule,active=s.active,dinner=s.obligations[`${s.day}:dinner`],due=engine.checkDueObligations();
  return {...life,day:s.day,phase:s.slot,anchor:active?.id??null,
    session:active?.kind==='session'?active:null,work:['work','overtime'].includes(active?.kind)?active:null,
    recovery:s.recovery,rent:{status:due.bills.length?'due':'pending'},rentSurfaced:true,
    meals:dinner?{[`d${s.day}-dinner`]:dinner}:{}};
}

export const BREAKFAST_STEP_BY_DAY = Object.freeze({ 1: 'd1_morning_breakfast', 2: 'd2_morning_breakfast', 3: 'd3_morning_breakfast' });
const BREAKFAST_DAY_BY_STEP = Object.freeze(Object.fromEntries(Object.entries(BREAKFAST_STEP_BY_DAY).map(([d, s]) => [s, Number(d)])));
export const RENT_STEPS = Object.freeze(['d2_afternoon_rent', 'd2_afternoon_rent_resolved', 'd2_afternoon_zerocash', 'd2_afternoon_escalation', 'life_rent']);
export const LIFE_STEPS = Object.freeze([...Object.values(BREAKFAST_STEP_BY_DAY), 'life_breakfast', 'life_work', 'life_evening', 'life_recovery', ...RENT_STEPS]);

/** Every step string the controller can render. Anything else gets a non-destructive recovery screen. */
export const KNOWN_STEPS = Object.freeze([
  'desk', 'd1_morning_gacha', 'd1_midday_race', 'd1_midday_race_result', 'd1_afternoon_starter',
  'd3_midday_race', 'd3_midday_race_result', 'life_phone', 'life_gacha', 'life_race', 'life_race_result', 'receipt', ...LIFE_STEPS,
]);

/** Each escalation offer lives where it would in the apartment: a text on the phone, a sale at the object. */
export const OFFER_PLACE = Object.freeze({
  skip_lunch: 'kitchen-breakfast', extra_shift: 'desk-phone', sell_couch: 'living', sell_tv: 'living', credit_card: 'desk-card',
});
export const PLACES = Object.freeze(['kitchen-notice', 'kitchen-breakfast', 'desk-phone', 'desk-card', 'living']);

export const isLifeStep = (step) => LIFE_STEPS.includes(step);
export const isBreakfastStep = (step) => step === 'life_breakfast' || step in BREAKFAST_DAY_BY_STEP;
export const isKnownStep = (step) => KNOWN_STEPS.includes(step);

const settled = (engine, billId) => (engine.state.billsSettled ?? []).includes(billId);

export function rentState(engine) {
  const s = engine.state;
  if (s.life) {
    if(s.life.policyVersion==='five-slot-v1') {
      const due=engine.checkDueObligations().bills.find(bill=>bill.id.startsWith('rent-'));
      return {paid:!due && s.life.finance.rents.some(bill=>bill.status==='paid'),owing:Boolean(due),short:due?Math.max(0,round(due.amountCents/100-s.cash)):0,cash:s.cash};
    }
    const amount = s.life.config.rentAmount;
    const paid = s.life.rent.status === 'paid';
    const owing = ['due', 'overdue'].includes(s.life.rent.status);
    return { paid, owing, short: paid ? 0 : Math.max(0, round(amount - s.cash)), cash: s.cash };
  }
  const amount = s.activeBill?.billId === 'd2_rent' ? s.activeBill.amount : 15;
  const paid = settled(engine, 'd2_rent');
  const owing = s.activeBill?.billId === 'd2_rent';
  return { paid, owing, short: paid ? 0 : Math.max(0, round(amount - s.cash)), cash: s.cash };
}

export function breakfastState(engine) {
  if(engine.state.life?.policyVersion==='five-slot-v1') {
    const schedule=engine.state.life.schedule,kind=schedule.slot==='early-evening'?'dinner':'breakfast',billId=`${schedule.day}:${kind}`;
    return {day:schedule.day,billId,settled:Boolean(schedule.obligations[billId]),owing:false};
  }
  const day = BREAKFAST_DAY_BY_STEP[engine.state.step] ?? engine.state.day;
  if (engine.state.life) {
    const billId = `d${day}-${engine.state.life.phase === 'evening' ? 'dinner' : 'breakfast'}`;
    return { day, billId, settled: Boolean(engine.state.life.meals[billId]), owing: false };
  }
  const billId = `d${day}_food`;
  return { day, billId, settled: settled(engine, billId), owing: engine.state.activeBill?.billId === billId };
}

/** The single paid-zero opportunity (extra shift or sell the couch) is open only while the engine holds it open. */
export const optionalOpen = (engine) => engine.state.activeModal === 'zerocash' && engine.state.cash === 0;

/**
 * The offer currently owed, or null, by the engine's own ladder rule. That getter normalizes the ladder index as it
 * reads, so the index is put back: routing stays read-only and accept/decline still do their own normalization.
 */
export function currentOffer(engine) {
  if (!engine.state.activeBill) return null;
  const index = engine.state.escalationStepIndex;
  const step = engine.getCurrentEscalationStep();
  engine.state.escalationStepIndex = index;
  return step;
}

/** Places this step lets the player visit. Optional places appear only while the opportunity is open. */
export function availablePlaces(engine) {
  const step = engine.state.step;
  if(engine.state.life?.policyVersion==='five-slot-v1') {
    const life=engine.state.life,s=life.schedule;
    if(step==='life_recovery')return ['bedroom','desk-phone','kitchen-breakfast','living'];
    if(step==='life_rent')return ['kitchen-breakfast','desk-phone','living'];
    const places=step==='life_breakfast'?['kitchen-breakfast','desk-phone','living']:['desk-phone','kitchen-breakfast','living'];
    if(['evening','late-evening'].includes(s.slot))places.push('bedroom');
    if(s.day>=2 && !s.recovery && !s.active && !life.story47 && !engine.checkDueObligations().bills.length)places.push('door');
    return places;
  }
  if (engine.state.life && step === 'life_recovery') return ['bedroom', 'desk-phone', 'kitchen-breakfast', 'living'];
  if (engine.state.life && step === 'life_rent') return ['kitchen-breakfast', 'desk-phone', 'living'];
  if (engine.state.life && ['life_work', 'life_evening', 'life_breakfast'].includes(step)) {
    const life = engine.state.life;
    const places = step === 'life_breakfast' ? ['kitchen-breakfast', 'desk-phone', 'living'] : ['desk-phone', 'kitchen-breakfast', 'living'];
    if (life.day >= 2 && !life.recovery && !life.work && !life.story47 && !life.session && life.rent.status !== 'due' && !(life.rent.status === 'overdue' && !life.rentSurfaced)) places.push('door');
    return places;
  }
  const offer = currentOffer(engine);
  if (offer) return [OFFER_PLACE[offer] ?? 'kitchen-notice'];
  if (isBreakfastStep(step)) return ['kitchen-breakfast'];
  if (!RENT_STEPS.includes(step)) return [];
  if (!rentState(engine).paid) return ['kitchen-notice'];
  return optionalOpen(engine) ? ['kitchen-notice', 'desk-phone', 'living'] : ['kitchen-notice'];
}

/**
 * The place to show. Mandatory beats win: the owed offer's place, then an unpaid breakfast or rent notice.
 * Otherwise the player's requested place stands if this step offers it, so optional beats stay optional (D22).
 */
export function placeFor(engine, requested = null) {
  if (engine.state.life && engine.state.step === 'life_recovery') {
    const places = availablePlaces(engine);
    return places.includes(requested) ? requested : 'bedroom';
  }
  if (engine.state.life && engine.state.step === 'life_rent') {
    const places = availablePlaces(engine);
    return places.includes(requested) ? requested : 'kitchen-breakfast';
  }
  if (engine.state.life && ['life_breakfast', 'life_work', 'life_evening'].includes(engine.state.step)) {
    const places = availablePlaces(engine);
    return places.includes(requested) ? requested : engine.state.step === 'life_breakfast' ? 'kitchen-breakfast' : 'desk-phone';
  }
  const offer = currentOffer(engine);
  if (offer) return OFFER_PLACE[offer] ?? 'kitchen-notice';
  const step = engine.state.step;
  if (isBreakfastStep(step)) return 'kitchen-breakfast';
  if (RENT_STEPS.includes(step) && !rentState(engine).paid) return 'kitchen-notice';
  const places = availablePlaces(engine);
  return places.includes(requested) ? requested : (places[0] ?? null);
}

/** Map a versioned phase to its apartment surface; obligations have priority. */
export function lifeSurface(engine) {
  const life = engine.state.life;
  if (!life) return null;
  if(life.policyVersion==='five-slot-v1') {
    const priority=fiveSlotPriority(engine);
    if(priority.kind==='recovery')return 'life_recovery';
    if(priority.kind==='payment')return 'life_rent';
    if(['morning','early-evening'].includes(priority.slot))return 'life_breakfast';
    return priority.slot==='midday'?'life_work':'life_evening';
  }
  if (life.rent.status === 'due' || (life.rent.status === 'overdue' && !life.rentSurfaced)) return 'life_rent';
  if (life.recovery) return 'life_recovery';
  if (life.phase === 'morning') return 'life_breakfast';
  if (life.phase === 'afternoon') return 'life_work';
  return 'life_evening';
}

/**
 * Where breakfast leads. Day 1 normally goes on to the gacha; an older save that reached the gacha with breakfast
 * still unpaid (the pull already committed) goes on to midday instead, so no pull is replayed.
 */
export function afterBreakfast(engine) {
  const { day } = breakfastState(engine);
  if (day === 1) {
    return engine.state.tenPullCommitted
      ? { step: 'd1_midday_race', advance: [1, 'day 1 midday'], phone: true }
      : { step: 'd1_morning_gacha', advance: null, phone: true };
  }
  if (day === 2) return { step: 'd2_afternoon_rent', advance: null, phone: false };
  return { step: 'd3_midday_race', advance: null, phone: true };
}

/** Old saves made before breakfast moved: the gacha's Proceed sends an unpaid Day 1 breakfast to the kitchen first. */
export const breakfastBeforeMidday = (engine) => !settled(engine, 'd1_food');

/**
 * Reload repair for a saved step. A crash between the breakfast charge and the step update moves forward with no
 * second charge. An unknown step is reported, never rewritten.
 */
export function normalizeLoadedStep(engine) {
  const step = engine.state.step;
  if (!isKnownStep(step)) return { step, recovered: true, next: null };
  if (isBreakfastStep(step)) {
    const b = breakfastState(engine);
    const interrupted = engine.state.activeModal === 'zerocash'
      || engine.state.activeModal === 'retention'
      || engine.state.interruptedContext;
    if (b.settled && !engine.state.activeBill && !interrupted) return { step, recovered: false, next: afterBreakfast(engine) };
  }
  return { step, recovered: false, next: null };
}
