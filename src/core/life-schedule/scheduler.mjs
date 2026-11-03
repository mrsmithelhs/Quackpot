import { SLOTS, BASELINE, guidance } from './policy.mjs';
const copy = v => structuredClone(v);
const fail = reason => ({ ok: false, reason });
const canonical = v => JSON.stringify(v);
const current = s => `${s.day}:${s.slot}`;
const meal = slot => slot === 'morning' ? 'breakfast' : slot === 'early-evening' ? 'dinner' : null;
const advance = s => { const i = SLOTS.indexOf(s.slot); if (i === 4) { s.day++; s.slot = SLOTS[0]; } else s.slot = SLOTS[i + 1]; };
export function createSchedule(policy = BASELINE, calendar = {}) {
  if (!policy || typeof policy.id !== 'string' || !policy.id || (policy.earlyBedHealth !== null && (!Number.isFinite(policy.earlyBedHealth) || policy.earlyBedHealth < 0)) || !Number.isInteger(policy.supportedDays) || policy.supportedDays < 0 || !calendar || Array.isArray(calendar)) throw new TypeError('invalid policy or calendar');
  for (const k of ['startCash','startHealth','maxHealth','mealCost','mealSkipHealth','scheduledWage','overtimeWage','overtimeHealth','rentAmount','rentDueDay','recoveryHealth','lateFatigueHealth']) if (!Number.isFinite(policy[k]) || policy[k] < 0) throw new TypeError(`invalid ${k}`);
  if (policy.recoveryConsumesSlot === true && Math.min(policy.recoveryHealth, policy.maxHealth) <= policy.mealSkipHealth) throw new TypeError('recovery_meal_cycle: recovery cannot escape zero after a missed meal');
  if (Object.hasOwn(calendar,'1') && calendar['1'] !== true) throw new TypeError('tutorial_shift_calendar_required');
  const workCalendar = {'1':true,...copy(calendar)};
  return { schema: 1, policyId: policy.id, config: copy(policy), day: 1, slot: 'morning', revision: 0, nextActivityId: 1, active: null, completedOperationIds: {}, obligations: {}, rent: policy.id === 'five-slot-v1' ? null : { id:'rent-1', status:'pending' }, employment:{employed:true,missedShifts:0}, futurePlans: {}, overtimeReservation: null, fatigue: null, recovery: null, workCalendar };
}
export function inspect(state, balances, intent, context = {}) {
  if (!state || !state.config || !balances || !Number.isFinite(balances.cash) || balances.cash < 0 || !Number.isFinite(balances.health) || balances.health < 0 || balances.health > state.config.maxHealth || !intent || typeof intent.operationId !== 'string' || !intent.operationId || ['__proto__','constructor','prototype'].includes(intent.operationId)) return fail('invalid_input');
  if (Object.hasOwn(state.completedOperationIds, intent.operationId)) return fail('duplicate_operation');
  const s = state, p = s.config, key = current(s), m = meal(s.slot), production = p.id === 'five-slot-v1', scheduled = s.workCalendar[String(s.day)] === true && (!(production || p.employmentStudy) || s.employment.employed);
  let costs = 0, hpDelta = 0, displaced = [], conflicts = [], disclosures = [], destination = s.slot, recoveryInstead = false;
  if (s.recovery && !['recover'].includes(intent.type)) return fail('recovery_pending');
  const rentDue = p.rentStudy && s.day >= p.rentDueDay && s.rent.status === 'pending';
  if (rentDue && intent.type !== 'rent' && intent.type !== 'recover') return fail('rent_decision_pending');
  const promisedWork = s.rent?.reservedWork?.status === 'reserved' && s.rent.reservedWork.day === s.day && SLOTS.indexOf(s.slot) <= SLOTS.indexOf('evening');
  if (s.rent?.status === 'escalation-pending' && !['rent','recover','reserve-rent-overtime'].includes(intent.type) && !promisedWork && !(s.active && ['progress','complete','abandon'].includes(intent.type))) return fail('rent_escalation_unresolved');
  if (intent.type === 'reserve-overtime') {
    if (!production || !s.employment.employed || typeof intent.reservationId !== 'string' || !intent.reservationId || !Number.isSafeInteger(intent.day) || intent.day < s.day || (intent.day === s.day && (SLOTS.indexOf(s.slot) > SLOTS.indexOf('evening') || (s.slot === 'evening' && s.active))) || s.overtimeReservation?.status === 'reserved' || s.overtimeReservation?.rentId === intent.rentId || !context.rentObligation || context.rentObligation.id !== intent.rentId || context.rentObligation.status !== 'due') return fail('overtime_reservation_unavailable');
    const plan=Object.values(s.futurePlans).find(x=>x.day===intent.day && x.slot==='evening' && x.status==='reserved');
    if(plan) conflicts.push(plan.id);
    disclosures.push('rent-overtime-terms'); if(conflicts.length) disclosures.push('social-conflict');
  } else if (intent.type === 'reserve-rent-overtime') {
    if (s.rent?.status !== 'escalation-pending' || !p.overtimeStudy || !s.employment.employed || s.rent.reservedWork || (s.slot === 'evening' && s.active) || SLOTS.indexOf(s.slot) > SLOTS.indexOf('evening')) return fail('rent_overtime_unavailable');
    const plan=Object.values(s.futurePlans).find(x=>x.day===s.day && x.slot==='evening' && x.status==='reserved'); if (plan) conflicts.push(plan.id);
    disclosures.push('rent-overtime-terms'); if (conflicts.length) disclosures.push('social-conflict');
  } else if (intent.type === 'rent') {
    if ((!rentDue && !(p.rentStudy && ['overdue','escalation-pending'].includes(s.rent.status) && intent.choice === 'pay')) || !['pay','acknowledge-shortfall','hold'].includes(intent.choice)) return fail('rent_unavailable');
    if (intent.choice === 'pay') { if (balances.cash < p.rentAmount) return fail('insufficient_cash'); costs=p.rentAmount; }
    if (intent.choice === 'acknowledge-shortfall' && balances.cash >= p.rentAmount) return fail('shortfall_absent');
    if (intent.choice === 'hold' && balances.cash < p.rentAmount) return fail('hold_unavailable');
    disclosures.push('rent-terms');
  } else if (intent.type === 'reserve') {
    if (typeof intent.planId !== 'string' || !intent.planId || ['__proto__','constructor','prototype'].includes(intent.planId) || !Number.isInteger(intent.day) || intent.day < s.day || intent.slot !== 'evening' || ((s.rent?.reservedWork?.status === 'reserved' && s.rent.reservedWork.day === intent.day && intent.slot === 'evening') || (s.overtimeReservation?.status === 'reserved' && s.overtimeReservation.day === intent.day && intent.slot === 'evening')) || (intent.day === s.day && (SLOTS.indexOf(s.slot) > SLOTS.indexOf('evening') || (s.slot === 'evening' && s.active))) || (s.futurePlans[intent.planId] && s.futurePlans[intent.planId].status !== 'cancelled') || Object.values(s.futurePlans).some(plan => plan.day === intent.day && plan.slot === intent.slot && plan.status === 'reserved')) return fail('invalid_plan');
  } else if (intent.type === 'cancel-plan') {
    const plan=s.futurePlans[intent.planId];
    if (!plan || plan.status !== 'reserved' || (s.active && s.active.planId === intent.planId)) return fail('plan_not_cancellable');
  } else if (intent.type === 'return-to-meal') {
    const plan=s.futurePlans[intent.planId]; if (!m || s.active || !plan || plan.status !== 'reserved' || plan.day !== s.day || plan.slot !== 'evening') return fail('meal_return_unavailable');
  } else if (intent.type === 'meal') {
    if (!m || s.active || !['buy','skip'].includes(intent.choice)) return fail('meal_unavailable');
    if (intent.choice === 'buy') { costs = p.mealCost; if (balances.cash < costs) return fail('insufficient_cash'); }
    else { hpDelta = -Math.min(balances.health, p.mealSkipHealth); if (balances.health + hpDelta === 0) disclosures.push('recovery-required'); }
    destination = SLOTS[SLOTS.indexOf(s.slot) + 1];
  } else if (intent.type === 'start' || intent.type === 'play') {
    const play = intent.type === 'play';
    if (s.day === 1 && m && !s.active) return fail('tutorial_meal_choice_required');
    if (play && !['pull','race'].includes(intent.kind)) return fail('invalid_play');
    if (play && context.operationAvailable !== true) return fail('operation_unavailable');
    if (!play && !['work','overtime','social','leisure','early-bed','quiet','activity47'].includes(intent.kind)) return fail('invalid_activity');
    if (s.day === 1 && (play || intent.kind !== 'work') && s.slot === 'midday') return fail('tutorial_shift_required');
    if (s.day === 1 && play && !['evening','late-evening'].includes(s.slot)) return fail('tutorial_play_locked');
    if (intent.kind === 'social' && (!intent.planId || s.futurePlans[intent.planId]?.status !== 'reserved' || s.futurePlans[intent.planId]?.day !== s.day || s.futurePlans[intent.planId]?.slot !== s.slot)) return fail('social_plan_unavailable');
    if (intent.kind === 'work' && (s.slot !== 'midday' || !scheduled)) return fail('work_unavailable');
    if (intent.kind === 'overtime' && (!(production || p.overtimeStudy) || s.slot !== 'evening' || !s.employment.employed)) return fail('overtime_unavailable');
    if (production && intent.kind === 'overtime' && (!context.overtimeReservation || typeof intent.reservationId !== 'string' || !intent.reservationId || context.overtimeReservation.id !== intent.reservationId || context.overtimeReservation.day !== s.day || context.overtimeReservation.slot !== s.slot || context.overtimeReservation.status !== 'reserved' || JSON.stringify(context.overtimeReservation) !== JSON.stringify(s.overtimeReservation))) return fail('overtime_reservation_required');
    if (intent.kind === 'overtime') disclosures.push('overtime-terms');
    if (['social','leisure','early-bed','activity47'].includes(intent.kind) && s.slot !== 'evening') return fail('wrong_slot');
    if (intent.kind === 'early-bed' && p.earlyBedHealth === null) return fail('early_bed_value_unselected');
    if (s.active) {
      if (!play || s.active.kind !== 'session') return fail('activity_pending');
      if (s.active[intent.kind + 'Used']) {
        if (!intent.extend) return fail('extension_required');
        const next = SLOTS.indexOf(s.slot) + 1;
        if (next >= SLOTS.length) return fail('extension_unavailable');
        destination = SLOTS[next];
      } else if (intent.extend) return fail('extension_not_needed');
    }
    const target = destination;
    const newlyClaimed = !s.active || Boolean(intent.extend);
    const targetMeal = meal(target);
    if (newlyClaimed && targetMeal) { displaced.push(targetMeal); hpDelta = -Math.min(balances.health, p.mealSkipHealth); }
    if (newlyClaimed && target === 'midday' && scheduled && intent.kind !== 'work') { if (s.day === 1) return fail('tutorial_shift_required'); displaced.push('shift'); }
    if (target === 'late-evening' && play && !s.fatigue?.pending) displaced.push('late-fatigue');
    const plan = Object.values(s.futurePlans).find(x => x.day === s.day && x.slot === target && x.status === 'reserved');
    if (plan && intent.kind !== 'social') conflicts.push(plan.id);
    disclosures.push(...guidance(s.day, displaced.map(kind => ({ kind })), p).disclosures);
    if (conflicts.length) disclosures.push('social-conflict');
    if (hpDelta && balances.health + hpDelta === 0) { recoveryInstead = true; destination = 'recovery'; disclosures.push('recovery-required'); }
  } else if (intent.type === 'progress') {
    if (!s.active || s.active.id !== intent.activityId || !Number.isSafeInteger(intent.cursor) || intent.cursor < 0 || (s.active.cursor !== null && intent.cursor <= s.active.cursor)) return fail('invalid_progress');
  } else if (intent.type === 'complete' || intent.type === 'abandon') {
    if (!s.active || s.active.id !== intent.activityId) return fail('activity_not_pending');
    if (intent.type === 'abandon' && s.active.kind === 'work') { if (s.day === 1) return fail('tutorial_shift_required'); displaced.push('shift'); disclosures.push('abandon-misses-shift'); }
    destination = s.slot === 'late-evening' ? 'morning' : SLOTS[SLOTS.indexOf(s.slot) + 1];
  } else if (intent.type === 'sleep') {
    if (s.slot !== 'late-evening' || s.active) return fail('sleep_unavailable'); destination = 'morning';
  } else if (intent.type === 'recover') {
    if (!s.recovery || s.recovery.resolved) return fail('recovery_unavailable');
    if (typeof p.recoveryConsumesSlot !== 'boolean') return fail('recovery_slot_policy_unselected');
    if (p.recoveryConsumesSlot && meal(s.slot)) { const afterRecovery=Math.min(p.maxHealth, balances.health+p.recoveryHealth); if (afterRecovery <= p.mealSkipHealth) return fail('recovery_cycle_unresolved'); displaced.push(meal(s.slot)); disclosures.push('recovery-misses-meal'); }
    if (p.recoveryConsumesSlot && s.slot === 'midday' && scheduled) { displaced.push('shift'); disclosures.push('recovery-misses-shift'); }
  } else return fail('unknown_intent');
  if ((production || p.employmentStudy) && displaced.includes('shift') && s.employment.missedShifts >= 2) disclosures.push('employment-termination');
  const reservedToday = s.overtimeReservation?.status === 'reserved' && s.overtimeReservation.day === s.day;
  const rentWorkConflict = Boolean((promisedWork || reservedToday) && destination === 'evening' && (intent.type === 'play' || intent.type === 'start') && intent.kind !== 'overtime');
  if (rentWorkConflict) disclosures.push('reserved-overtime-conflict');
  let destinationDay = s.day;
  if (intent.type === 'complete' && s.active?.kind === 'early-bed') { destination = 'morning'; destinationDay++; }
  else if ((intent.type === 'sleep' || ((intent.type === 'complete' || intent.type === 'abandon') && s.slot === 'late-evening')) && destination === 'morning') destinationDay++;
  else if (intent.type === 'recover' && p.recoveryConsumesSlot) { const idx = SLOTS.indexOf(s.slot); destination = SLOTS[(idx + 1) % SLOTS.length]; if (idx === SLOTS.length - 1) destinationDay++; }
  if (recoveryInstead) { const index = SLOTS.indexOf(s.slot) + (intent.extend ? 2 : 1); destinationDay += Math.floor(index / SLOTS.length); destination = SLOTS[index % SLOTS.length]; }
  const appliesFatigue = Boolean(s.fatigue?.pending && s.slot === 'late-evening' && (intent.type === 'sleep' || intent.type === 'complete' || intent.type === 'abandon'));
  let fatigueRecovery = false;
  if (appliesFatigue) { hpDelta = -Math.min(balances.health, p.lateFatigueHealth); if (balances.health + hpDelta === 0) { fatigueRecovery = true; disclosures.push('fatigue-recovery'); } }
  let cashDelta = costs ? -costs : 0;
  if (intent.type === 'complete' && s.active?.kind === 'work') cashDelta += p.scheduledWage;
  let overtimeRecovery = false;
  if (intent.type === 'complete' && s.active?.kind === 'overtime') { cashDelta += p.overtimeWage; hpDelta -= Math.min(balances.health,p.overtimeHealth); if (balances.health + hpDelta === 0) { overtimeRecovery = true; disclosures.push('overtime-recovery'); } }
  if (intent.type === 'complete' && s.active?.kind === 'social') hpDelta += Math.min(5, p.maxHealth - balances.health);
  if (intent.type === 'complete' && s.active?.kind === 'activity47') hpDelta += Math.min(5, p.maxHealth - balances.health);
  if (intent.type === 'complete' && s.active?.kind === 'early-bed') hpDelta += Math.min(p.earlyBedHealth, p.maxHealth - balances.health);
  if (intent.type === 'recover') { const restored=Math.min(p.recoveryHealth, p.maxHealth - balances.health); hpDelta += restored; if (p.recoveryConsumesSlot && meal(s.slot)) hpDelta -= Math.min(p.mealSkipHealth, balances.health + restored); }
  const entersRecovery = overtimeRecovery || fatigueRecovery || recoveryInstead || (intent.type === 'meal' && balances.health + hpDelta === 0);
  return { ok: true, proposal: { cashDelta, appliesFatigue, fatigueRecovery, overtimeRecovery, rentWorkConflict, revision: s.revision, operationId: intent.operationId, intent: copy(intent), balances: copy(balances), context: copy(context), slot: key, destination: {day:destinationDay, slot:destination, mode: entersRecovery ? 'recovery' : 'normal'}, costs, hpDelta, displaced, conflicts, disclosures, recoveryInstead } };
}
export function commit(state, balances, proposal, operation = {}, currentContext = null) {
  if (!proposal?.intent) return fail('invalid_proposal');
  if ((proposal.intent.type === 'play' || (state.config?.id === 'five-slot-v1' && (proposal.intent.type === 'reserve-overtime' || (proposal.intent.type === 'start' && proposal.intent.kind === 'overtime')))) && !currentContext) return fail('fresh_context_required');
  const checked = inspect(state, balances, proposal.intent, currentContext ?? proposal.context);
  if (!checked.ok) return checked;
  if (canonical(checked.proposal) !== canonical(proposal)) return fail('stale_proposal');
  if (proposal.rentWorkConflict && operation.overtimeChoice !== 'withdraw') return fail('overtime_conflict_choice_required');
  if (proposal.conflicts.length && !['notice','break'].includes(operation.conflictChoice)) return fail('conflict_choice_required');
  if (proposal.disclosures.length && operation.confirmed !== true) return fail('confirmation_required');
  if (proposal.recoveryInstead && (operation.kind !== 'accept-recovery' || operation.success !== undefined || operation.resultRef !== undefined)) return fail('recovery_choice_required');
  if (!proposal.recoveryInstead && proposal.intent.type === 'play' && (!operation.success || operation.operationId !== proposal.operationId || typeof operation.resultRef !== 'string' || !operation.resultRef)) return fail('operation_not_succeeded');
  const s = copy(state), i = proposal.intent, events = [], delta = { cash: proposal.cashDelta, health: proposal.hpDelta };
  const emit = (type, data = {}) => events.push({ type, ...data });
  const missShift = reason => { if (s.obligations[`${s.day}:shift`] === 'missed') return; s.obligations[`${s.day}:shift`] = 'missed'; emit('obligation_missed',{kind:'shift',reason,healthDelta:0}); if (s.config.id === 'five-slot-v1' || s.config.employmentStudy) { s.employment.missedShifts++; if (s.employment.missedShifts >= 3) { s.employment.employed = false; emit('employment_ended',{day:s.day}); } } };
  if (i.type === 'reserve-overtime') { s.overtimeReservation={id:i.reservationId,day:i.day,slot:'evening',status:'reserved',rentId:i.rentId}; for (const id of proposal.conflicts) { s.futurePlans[id].status=operation.conflictChoice==='notice'?'notice':'broken'; emit('plan_conflict_resolved',{id,choice:operation.conflictChoice}); } emit('rent_overtime_reserved',{id:i.reservationId,day:i.day,slot:'evening',rentId:i.rentId}); }
  if (i.type === 'reserve-rent-overtime') { s.rent.reservedWork={day:s.day,slot:'evening',status:'reserved'}; for (const id of proposal.conflicts) { s.futurePlans[id].status=operation.conflictChoice==='notice'?'notice':'broken'; emit('plan_conflict_resolved',{id,choice:operation.conflictChoice}); } emit('rent_overtime_reserved',{day:s.day,slot:'evening'}); }
  if (i.type === 'rent') { s.rent.status = i.choice === 'pay' ? 'paid' : (s.config.hypotheticalRentContinuation ? 'overdue' : 'escalation-pending'); emit('rent_decided',{id:s.rent.id,choice:i.choice,amount:s.config.rentAmount,cashDelta:delta.cash}); }
  if (i.type === 'reserve') { s.futurePlans[i.planId] = { id:i.planId, day:i.day, slot:i.slot, status:'reserved' }; emit('plan_reserved',{id:i.planId}); }
  if (i.type === 'cancel-plan') { s.futurePlans[i.planId].status='cancelled'; emit('plan_cancelled',{id:i.planId}); }
  if (i.type === 'return-to-meal') emit('returned_to_meal',{planId:i.planId,slot:current(s)});
  if (i.type === 'meal') { s.obligations[`${s.day}:${meal(s.slot)}`] = i.choice; emit('meal_completed',{choice:i.choice, slot:current(s), cashDelta:delta.cash, healthDelta:delta.health}); advance(s); if (balances.health + delta.health === 0) { s.recovery = {id:`recovery-${i.operationId}`, resolved:false}; emit('recovery_required',{id:s.recovery.id}); } }
  if (proposal.rentWorkConflict) { if (s.overtimeReservation?.status === 'reserved') s.overtimeReservation.status='withdrawn'; else s.rent.reservedWork.status='withdrawn'; emit('rent_overtime_withdrawn',{day:s.day}); }
  if (proposal.recoveryInstead) {
    if (s.active && i.extend) { emit('activity_completed',{id:s.active.id,reason:'recovery-before-extension'}); s.active = null; advance(s); }
    for (const kind of proposal.displaced) { if (kind !== 'late-fatigue') { s.obligations[`${s.day}:${kind}`] = 'missed'; emit('obligation_missed',{kind,healthDelta:proposal.hpDelta}); } }
    advance(s); s.recovery = {id:`recovery-${i.operationId}`, resolved:false}; emit('recovery_required',{id:s.recovery.id});
  } else if (i.type === 'start' || i.type === 'play') {
    if (s.active && i.extend) { emit('activity_completed',{id:s.active.id, reason:'extension'}); s.active = null; advance(s); }
    for (const kind of proposal.displaced) {
      if (kind === 'late-fatigue') { s.fatigue = { id:i.operationId, pending:true }; emit('fatigue_pending',{id:i.operationId}); }
      else if (kind === 'shift') missShift('competing-activity');
      else { s.obligations[`${s.day}:${kind}`] = 'missed'; emit('obligation_missed',{kind, healthDelta:proposal.hpDelta}); }
    }
    for (const id of proposal.conflicts) { s.futurePlans[id].status = operation.conflictChoice === 'notice' ? 'notice' : 'broken'; emit('plan_conflict_resolved',{id, choice:operation.conflictChoice}); }
    if (!s.active) { s.active = { id:`activity-${s.nextActivityId++}`, kind:i.type === 'play' ? 'session' : i.kind, day:s.day, slot:s.slot, status:'active', planId:i.planId ?? null, cursor:null, pullUsed:false, raceUsed:false }; emit('activity_started',{id:s.active.id, kind:s.active.kind, slot:current(s)}); }
    if (i.type === 'play') { s.active[i.kind + 'Used'] = true; emit('play_committed',{id:s.active.id, kind:i.kind, resultRef:operation.resultRef}); }
  }
  if (i.type === 'progress') { s.active.cursor = i.cursor; emit('activity_progressed',{id:s.active.id,cursor:i.cursor}); }
  if (i.type === 'complete' || i.type === 'abandon') {
    const active = s.active; if (active.kind === 'overtime' && s.overtimeReservation?.status === 'reserved') s.overtimeReservation.status = i.type === 'complete' ? 'completed' : 'abandoned'; if (active.kind === 'overtime' && s.rent?.reservedWork?.status === 'reserved') s.rent.reservedWork.status = i.type === 'complete' ? 'completed' : 'abandoned'; if (i.type === 'abandon' && active.kind === 'work') missShift('abandoned-work'); if (i.type === 'complete' && active.kind === 'work') { s.obligations[`${s.day}:shift`] = 'completed'; }
    if (active.kind === 'social' && active.planId) { s.futurePlans[active.planId].status = i.type === 'complete' ? 'completed' : 'interrupted'; }
    emit(i.type === 'complete' ? 'activity_completed' : 'activity_abandoned',{id:active.id}); s.active = null;
    if (active.kind === 'early-bed' && i.type === 'complete') { s.day++; s.slot = 'morning'; } else advance(s);
  }
  if (i.type === 'sleep') { emit('sleep_completed'); advance(s); }
  if (i.type === 'recover') { const id = s.recovery.id; s.recovery = null; if (s.config.recoveryConsumesSlot) { const missedMeal=meal(s.slot); if (missedMeal) { s.obligations[`${s.day}:${missedMeal}`]='missed'; emit('obligation_missed',{kind:missedMeal,reason:'recovery',healthDelta:-Math.min(s.config.mealSkipHealth,balances.health+Math.min(s.config.recoveryHealth,s.config.maxHealth-balances.health))}); } if (s.slot === 'evening') { if (s.overtimeReservation?.status === 'reserved' && s.overtimeReservation.day === s.day) { s.overtimeReservation.status='recovery-exempt'; emit('rent_overtime_recovery_exempt',{day:s.day}); } if (s.rent?.reservedWork?.status === 'reserved') { s.rent.reservedWork.status='recovery-exempt'; emit('rent_overtime_recovery_exempt',{day:s.day}); } for (const plan of Object.values(s.futurePlans)) if (plan.day===s.day && plan.slot==='evening' && plan.status==='reserved') { plan.status='recovery-exempt'; emit('plan_recovery_exempt',{id:plan.id}); } } if (proposal.displaced.includes('shift')) { missShift('recovery'); } advance(s); } emit('recovery_completed',{id, consumedSlot:s.config.recoveryConsumesSlot}); }
  if (proposal.overtimeRecovery) { s.recovery={id:`recovery-${i.operationId}`,resolved:false}; emit('recovery_required',{id:s.recovery.id}); }
  if (proposal.appliesFatigue) { emit('fatigue_applied',{id:s.fatigue.id,healthDelta:proposal.hpDelta}); s.fatigue = null; if (proposal.fatigueRecovery) { s.recovery={id:`recovery-${i.operationId}`,resolved:false}; emit('recovery_required',{id:s.recovery.id}); } }
  s.completedOperationIds[i.operationId] = { intent:copy(i), resultRef:operation.resultRef ?? null }; s.revision++;
  return {ok:true, state:s, balanceDeltas:delta, events};
}


// Replays a new-policy model journal. External gameplay outcome authenticity is the engine's responsibility.
export function replay(initial, startingBalances, records) {
  let state=copy(initial), balances=copy(startingBalances);
  for (let index=0; index<records.length; index++) {
    const record=records[index], context=record.context ?? {};
    const prepared=inspect(state,balances,record.intent,context);
    if (!prepared.ok) return {ok:false,index,reason:prepared.reason};
    const applied=commit(state,balances,prepared.proposal,record.operation ?? {},record.intent.type==='play'?context:null);
    if (!applied.ok) return {ok:false,index,reason:applied.reason};
    if (canonical(applied.events)!==canonical(record.events)) return {ok:false,index,reason:'event_mismatch'};
    state=applied.state; balances={cash:balances.cash+applied.balanceDeltas.cash,health:balances.health+applied.balanceDeltas.health};
  }
  return {ok:true,state,balances};
}

// Caller records only actual display/cancel actions; this returns evidence and never mutates gameplay.
export function observe(proposal, observation) {
  if (!proposal?.operationId || !observation || !['warning-shown','cancelled'].includes(observation.type)) return fail('invalid_observation');
  if (observation.type === 'warning-shown' && !proposal.disclosures.includes(observation.warning)) return fail('warning_not_prepared');
  return {ok:true,event:{type:observation.type,operationId:proposal.operationId,slot:proposal.slot,...(observation.type === 'warning-shown'?{warning:observation.warning}:{})}};
}
