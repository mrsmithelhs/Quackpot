// Pure staging of the shared scheduler and financial authority. The engine owns
// trusted context, actual game outcomes, the event log and final publication.
import {inspect as inspectSchedule,commit as commitSchedule} from './life-schedule/index.mjs';
import {latchDue,dueObligations,prepareFinance,commitFinance} from './life-finance.mjs';
import {prepareSocial46,transitionSocial46,social46PhaseExit,social46ForcedRecovery} from './life-social.mjs';
const copy = value => structuredClone(value);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const bad = reason => ({ok:false,reason});
const validBalances = b => b && Number.isSafeInteger(b.cashCents) && b.cashCents >= 0 && Number.isFinite(b.health) && b.health >= 0;
const pos = schedule => ({day:schedule.day,slot:schedule.slot});
const withinRentRescue = (schedule,due,action) => {
  if(due.bills.some(bill=>bill.id.startsWith('loan-')))return false;
  const reservation=schedule.overtimeReservation;
  if(reservation?.status!=='reserved' || !due.bills.some(bill=>bill.id===reservation.rentId))return false;
  if(schedule.day>reservation.day || (schedule.day===reservation.day && schedule.slot==='late-evening'))return false;
  if(action?.type==='meal' || action?.type==='sleep')return true;
  if(action?.type==='start')return ['work','quiet'].includes(action.kind)
    || (action.kind==='overtime' && action.reservationId===reservation.id);
  if(['progress','complete','abandon'].includes(action?.type))return ['work','quiet','overtime'].includes(schedule.active?.kind);
  return false;
};
const newDue = (before,after) => [...after.rents,...after.loans].filter(x=>x.latched && ![...before.rents,...before.loans].find(y=>y.id===x.id)?.latched).map(x=>({type:'financial_due',id:x.id,due:copy(x.due)}));
const socialView = (state,finance,balances) => {
  const schedule=state.schedule, active=schedule.active, dinner=schedule.obligations[`${schedule.day}:dinner`];
  return {day:schedule.day,phase:schedule.slot,anchor:active?.id??null,session:active?.kind==='session'?active:null,
    rent:{status:dueObligations(finance,balances.cashCents).bills.length?'due':'pending'},rentSurfaced:true,recovery:schedule.recovery,
    work:active?.kind==='work'||active?.kind==='overtime'?active:null,story47:state.story47??null,
    meals:{...(dinner?{[`d${schedule.day}-dinner`]:dinner}:{})},sold:copy(state.sold??[]),social46:copy(state.social46??null)};
};

// Inspection may discover due obligations, but cannot mutate or publish state.
export function inspectLifeTransaction(state,balances,intent,context={}) {
  if(!state?.schedule || !state?.finance || !validBalances(balances) || !intent || !context || typeof context !== 'object') return bad('invalid_input');
  const finance=latchDue(state.finance,pos(state.schedule));
  const due=dueObligations(finance,balances.cashCents);
  const recovery=Boolean(state.schedule.recovery);
  if(intent.domain==='schedule') {
    if(state.social46?.scene)return bad('social_scene_pending');
    const reservingRentShift = !due.bills.some(bill=>bill.id.startsWith('loan-')) && intent.action?.type==='reserve-overtime'
      && due.bills.some(bill=>bill.id===intent.action.rentId && bill.id.startsWith('rent-'));
    const travellingToRentShift=withinRentRescue(state.schedule,due,intent.action);
    if(due.bills.length && !(recovery && intent.action?.type==='recover') && !reservingRentShift && !travellingToRentShift) return bad('financial_obligation_due');
    const p=inspectSchedule(state.schedule,{cash:balances.cashCents/100,health:balances.health},intent.action,context.schedule ?? {});
    if(!p.ok)return p;
    return {ok:true,proposal:{domain:'schedule',scheduleRevision:state.schedule.revision,financeRevision:state.finance.revision,balances:copy(balances),intent:copy(intent),context:copy(context),schedule:p.proposal}};
  }
  if(intent.domain==='finance') {
    if(recovery)return bad('recovery_pending');
    if(intent.action?.type==='leave_unpaid' && context.optionsDisclosed!==true) return bad('options_not_disclosed');
    const p=prepareFinance(finance,balances.cashCents,pos(state.schedule),intent.action);
    if(!p.ok)return p;
    return {ok:true,proposal:{domain:'finance',scheduleRevision:state.schedule.revision,financeRevision:state.finance.revision,balances:copy(balances),intent:copy(intent),context:copy(context),finance:p.proposal}};
  }
  return bad('unknown_domain');
}

// Context and balances must be freshly supplied by the engine, not the UI.
export function commitLifeTransaction(state,balances,proposal,operation={},currentContext=null) {
  if(!proposal?.intent || !currentContext)return bad('fresh_context_required');
  const check=inspectLifeTransaction(state,balances,proposal.intent,currentContext);
  if(!check.ok)return check;
  if(!same(check.proposal,proposal))return bad('stale_proposal');
  const before=state.finance;
  let finance=latchDue(before,pos(state.schedule));
  const priorDueEvents=newDue(before,finance);
  let schedule=state.schedule,cashDeltaCents=0,healthDelta=0,events=[];
  if(proposal.domain==='finance') {
    const result=commitFinance(finance,balances.cashCents,pos(schedule),proposal.finance);
    if(!result.ok)return result;
    finance=result.finance;cashDeltaCents=result.cashDeltaCents;events=result.events;
  } else {
    const result=commitSchedule(schedule,{cash:balances.cashCents/100,health:balances.health},proposal.schedule,operation,currentContext.schedule ?? {});
    if(!result.ok)return result;
    schedule=result.state;cashDeltaCents=Math.round(result.balanceDeltas.cash*100);healthDelta=result.balanceDeltas.health;events=result.events;
    if(!Number.isSafeInteger(cashDeltaCents) || Math.abs(cashDeltaCents/100-result.balanceDeltas.cash)>1e-7)return bad('fractional_cent_delta');
    const view=socialView(state,finance,balances), socialEvents=[];
    const record=(type,payload)=>socialEvents.push({type,payload});
    if(proposal.schedule.conflicts.length) {
      if(!view.social46?.pending || !proposal.schedule.conflicts.includes(view.social46.pending.id))return bad('social_conflict_mismatch');
      let resolved;
      if(operation.conflictChoice==='notice') resolved=transitionSocial46(view,{type:'social46_cancel',id:view.social46.pending.id},record,()=>{});
      else if(operation.conflictChoice==='break') {view.day=proposal.schedule.destination.day;view.phase='evening';resolved=prepareSocial46(view,{type:'phone_commit',socialConflict:'continue'},record) ?? {ok:true};}
      else return bad('conflict_choice_required');
      if(!resolved.ok)return resolved;
    }
    if(result.events.some(e=>e.type==='plan_recovery_exempt')) social46ForcedRecovery(view,record);
    if(state.schedule.slot==='evening' && (schedule.day!==state.schedule.day || schedule.slot!=='evening')) social46PhaseExit(view,record);
    if(!same(view.social46,state.social46??null)) {state={...state,social46:view.social46,socialRevision:(state.socialRevision??0)+1};}
    events=[...socialEvents,...events];
    const previous=finance; finance=latchDue(finance,pos(schedule)); events=[...events,...newDue(previous,finance)];
  }
  return {ok:true,state:{...copy(state),schedule,finance},cashDeltaCents,healthDelta,events:[...priorDueEvents,...events]};
}

// Pure staging for Ren-specific actions. The projection is reconstructed from
// the scheduler and finance on every call; it is not a second clock or wallet.
export function stageSocialTransition(state,balances,intent,context={}) {
  if(!state?.schedule || !state?.finance || !validBalances(balances) || !intent?.action?.type?.startsWith('social46_') || typeof intent.operationId!=='string' || !intent.operationId || ['__proto__','constructor','prototype'].includes(intent.operationId)) return bad('invalid_social_input');
  if(Object.hasOwn(state.socialOperationIds ?? {},intent.operationId)) return bad('duplicate_operation');
  const schedule=state.schedule, finance=latchDue(state.finance,pos(schedule));
  const due=dueObligations(finance,balances.cashCents), active=schedule.active;
  const dinner=schedule.obligations[`${schedule.day}:dinner`];
  const view={day:schedule.day,phase:schedule.slot,anchor:active?.id??null,session:active?.kind==='session'?active:null,
    rent:{status:due.bills.length?'due':'pending'},rentSurfaced:true,recovery:schedule.recovery,
    work:active?.kind==='work'||active?.kind==='overtime'?active:null,story47:state.story47??null,
    meals:{...(dinner?{[`d${schedule.day}-dinner`]:dinner}:{})},sold:copy(state.sold??[]),social46:copy(state.social46??null)};
  const original=copy(view.social46), socialEvents=[];let socialHealthDelta=0;
  const record=(type,payload)=>socialEvents.push({type,payload});
  const hp=amount=>{socialHealthDelta=Math.min(amount,schedule.config.maxHealth-balances.health);};
  const socialGuard=prepareSocial46(view,intent.action,record);if(socialGuard)return socialGuard;
  const transitioned=transitionSocial46(view,intent.action,record,hp);if(!transitioned?.ok)return transitioned??bad('unknown_social_intent');
  let scheduleAction=null;
  const before=original?.pending, after=view.social46?.pending, type=intent.action.type;
  if(type==='social46_reply' && intent.action.choice==='accept' && after?.committed) scheduleAction={type:'reserve',planId:after.id,day:after.day,slot:'evening'};
  else if((type==='social46_cancel'||type==='social46_reschedule_plan') && before?.committed) scheduleAction={type:'cancel-plan',planId:before.id};
  else if(type==='social46_begin') scheduleAction={type:'start',kind:'social',planId:before?.id};
  else if(type==='social46_complete') scheduleAction={type:'complete',activityId:schedule.active?.id};
  let nextSchedule=schedule,scheduleEvents=[],cashDeltaCents=0,healthDelta=0;
  if(scheduleAction) {
    if(schedule.recovery)return bad('recovery_pending');
    if(due.bills.length)return bad('financial_obligation_due');
    scheduleAction.operationId=`social:${intent.operationId}`;
    const inspected=inspectSchedule(schedule,{cash:balances.cashCents/100,health:balances.health},scheduleAction,context.schedule??{});
    if(!inspected.ok)return inspected;
    const committed=commitSchedule(schedule,{cash:balances.cashCents/100,health:balances.health},inspected.proposal,{confirmed:true},context.schedule??{});
    if(!committed.ok)return committed;
    nextSchedule=committed.state;scheduleEvents=committed.events;cashDeltaCents=Math.round(committed.balanceDeltas.cash*100);healthDelta=committed.balanceDeltas.health;
    if(type==='social46_complete' && healthDelta!==socialHealthDelta)return bad('social_health_mismatch');
  }
  const nextFinance=latchDue(finance,pos(nextSchedule));
  const socialOperationIds={...(state.socialOperationIds??{}),[intent.operationId]:true};
  return {ok:true,state:{...copy(state),schedule:nextSchedule,finance:nextFinance,social46:view.social46,socialOperationIds,socialRevision:(state.socialRevision??0)+1},cashDeltaCents,healthDelta,events:[...newDue(state.finance,finance),...socialEvents,...scheduleEvents,...newDue(finance,nextFinance)]};
}
