// Pure staging of the shared scheduler and financial authority. The engine owns
// trusted context, actual game outcomes, the event log and final publication.
import {inspect as inspectSchedule,commit as commitSchedule} from './life-schedule/index.mjs';
import {latchDue,dueObligations,prepareFinance,commitFinance} from './life-finance.mjs';
import {prepareSocial46,transitionSocial46,social46PhaseExit,social46ForcedRecovery} from './life-social.mjs';
import {selectWorkStory} from './life-story-content.mjs';
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
    if(context.allowActivityStory!==true && ((intent.action?.type==='start' && intent.action?.kind==='activity47') || (['complete','abandon','progress'].includes(intent.action?.type) && state.schedule.active?.kind==='activity47')))return bad('activity_story_required');
    if(state.story47 && context.allowWorkStory!==true)return bad('story_pending');
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

// Read-only classification for an attempted commitment. It never returns a
// scheduler proposal: only the normal finance gate may authorize a default,
// and the original schedule transaction remains subject to that gate.
export function classifyDueScheduleCommitment(state,balances,intent,context={}) {
  const normal=inspectLifeTransaction(state,balances,intent,context);
  if(normal.reason!=='financial_obligation_due')return {ok:false,reason:normal.ok?'not_blocked':normal.reason};
  const action=intent?.action;
  if(!action || !['meal','sleep','start','play','complete'].includes(action.type))return bad('not_slot_commitment');
  const inspected=inspectSchedule(state.schedule,{cash:balances.cashCents/100,health:balances.health},action,context.schedule??{});
  if(!inspected.ok)return inspected;
  if(inspected.proposal.recoveryInstead)return bad('recovery_required');
  return {ok:true,blockedBy:'financial_obligation_due',hasConflicts:Boolean(inspected.proposal.conflicts.length),rentWorkConflict:Boolean(inspected.proposal.rentWorkConflict)};
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
      else if(operation.conflictChoice==='break') {view.day=proposal.intent.action.type==='reserve-overtime'?proposal.intent.action.day:proposal.schedule.destination.day;view.phase='evening';resolved=prepareSocial46(view,{type:'phone_commit',socialConflict:'continue'},record) ?? {ok:true};}
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
  if(state.story47)return bad('story_pending');
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

// Social presentation can be advanced without spending a slot. Only begin or
// complete may be classified here, and the actual social guards run on a
// throwaway copy before the scheduler validates the corresponding commitment.
export function classifyDueSocialCommitment(state,balances,intent,context={}) {
  if(!['social46_begin','social46_complete'].includes(intent?.action?.type))return bad('not_slot_commitment');
  const staged=stageSocialTransition(copy(state),copy(balances),copy(intent),copy(context));
  if(staged.reason!=='financial_obligation_due')return bad(staged.ok?'not_blocked':staged.reason);
  const action=intent.action.type==='social46_begin'
    ? {type:'start',kind:'social',planId:state.social46?.pending?.id}
    : {type:'complete',activityId:state.schedule.active?.id};
  action.operationId=`social:${intent.operationId}`;
  const inspected=inspectSchedule(state.schedule,{cash:balances.cashCents/100,health:balances.health},action,context.schedule??{});
  if(!inspected.ok)return inspected;
  if(inspected.proposal.recoveryInstead)return bad('recovery_required');
  return {ok:true,blockedBy:'financial_obligation_due'};
}

// Unmounted Plan47 work-story adapter. The caller supplies shown-stage facts
// from the append-only log; scheduler and deterministic story remain staged.
export function stageWorkStory(state,balances,intent,context={}) {
  if(!state?.schedule || !state?.finance || !validBalances(balances) || typeof context.seed!=='string'
    || typeof intent?.operationId!=='string' || !intent.operationId || ['__proto__','constructor','prototype'].includes(intent.operationId))return bad('invalid_story_input');
  if(Object.hasOwn(state.storyOperationIds??{},intent.operationId))return bad('duplicate_operation');
  let next=copy(state),cashDeltaCents=0,healthDelta=0,events=[];
  const story=next.story47;
  if(intent.type==='start') {
    if(story)return bad('story_pending');
    const action={domain:'schedule',action:{type:'start',kind:'work',operationId:`story:${intent.operationId}`}};
    const p=inspectLifeTransaction(next,balances,action,context);if(!p.ok)return p;
    const r=commitLifeTransaction(next,balances,p.proposal,{confirmed:intent.confirmed===true},context);if(!r.ok)return r;
    next=r.state;cashDeltaCents=r.cashDeltaCents;healthDelta=r.healthDelta;events=r.events;
    const id=next.schedule.active.id;
    next.story47={version:1,kind:'work',id,stage:'commute',story:selectWorkStory(context.seed,id)};
    events.push({type:'story47_started',id,story:copy(next.story47.story)});
  } else {
    if(story?.kind!=='work' || story.id!==intent.id)return bad('story_unavailable');
    if(intent.type==='advance' && story.stage==='commute') {
      if(!context.shownStages?.includes(`${story.id}:commute`))return bad('story_not_shown');
      next.story47.stage='work';events.push({type:'story47_advanced',id:story.id,stage:'work'});
    } else if(intent.type==='complete' && story.stage==='work') {
      if(!context.shownStages?.includes(`${story.id}:work`))return bad('story_not_shown');
      const action={domain:'schedule',action:{type:'complete',activityId:story.id,operationId:`story:${intent.operationId}`}};
      const allowed={...context,allowWorkStory:true};
      const p=inspectLifeTransaction(next,balances,action,allowed);if(!p.ok)return p;
      const r=commitLifeTransaction(next,balances,p.proposal,{confirmed:intent.confirmed===true},allowed);if(!r.ok)return r;
      next=r.state;cashDeltaCents=r.cashDeltaCents;healthDelta=r.healthDelta;events=r.events;
      next.story47.stage='payslip';events.push({type:'story47_advanced',id:story.id,stage:'payslip'});
    } else if(intent.type==='dismiss' && story.stage==='payslip') {
      next.story47=null;events.push({type:'story47_dismissed',id:story.id});
    } else return bad('invalid_story_stage');
  }
  next.storyOperationIds={...(next.storyOperationIds??{}),[intent.operationId]:true};
  return {ok:true,state:next,cashDeltaCents,healthDelta,events};
}

// The activity scene and its slot reservation are one staged operation. The
// caller supplies only actually displayed warning/scene facts from the log.
export function prepareActivityStory(state,balances,intent,context={}) {
  if(!state?.schedule || !['call_mom','sit_duck'].includes(intent?.choice) || typeof intent.operationId!=='string' || !intent.operationId)return bad('invalid_activity_story');
  if(state.story47 || (intent.choice==='call_mom' && (state.schedule.day-1)%5!==0))return bad('activity_unavailable');
  const action={domain:'schedule',action:{type:'start',kind:'activity47',operationId:`story:${intent.operationId}`}};
  return inspectLifeTransaction(state,balances,action,{...context,allowActivityStory:true});
}

export function stageActivityStory(state,balances,intent,context={}) {
  if(!state?.schedule || !validBalances(balances) || typeof intent?.operationId!=='string' || !intent.operationId || ['__proto__','constructor','prototype'].includes(intent.operationId))return bad('invalid_story_input');
  if(Object.hasOwn(state.storyOperationIds??{},intent.operationId))return bad('duplicate_operation');
  let next=copy(state),cashDeltaCents=0,healthDelta=0,events=[];
  const story=next.story47;
  if(intent.type==='start') {
    const {warningShown,shownStages,conflictShownKinds,...baseContext}=context;
    const p=prepareActivityStory(next,balances,intent,baseContext);if(!p.ok)return p;
    if(p.proposal.schedule.recoveryInstead)return bad('recovery_required');
    if(p.proposal.schedule.disclosures.length && context.warningShown!==true)return bad('warning_not_shown');
    if(p.proposal.schedule.conflicts.length && !(conflictShownKinds??[]).includes(intent.conflictChoice==='notice'?'conflict_notice':'conflict_continue'))return bad('conflict_not_shown');
    const r=commitLifeTransaction(next,balances,p.proposal,{confirmed:intent.confirmed===true,conflictChoice:intent.conflictChoice},{...baseContext,allowActivityStory:true});if(!r.ok)return r;
    next=r.state;cashDeltaCents=r.cashDeltaCents;healthDelta=r.healthDelta;events=r.events;
    const id=next.schedule.active.id;
    next.story47={version:intent.choice==='call_mom'?3:2,kind:'activity',id,choice:intent.choice,stage:'scene'};
    events.push({type:'story47_started',id,choice:intent.choice});
  } else {
    if(story?.kind!=='activity' || story.id!==intent.id)return bad('story_unavailable');
    if(intent.type==='complete' && story.stage==='scene') {
      if(!context.shownStages?.includes(`${story.id}:scene`))return bad('story_not_shown');
      const action={domain:'schedule',action:{type:'complete',activityId:story.id,operationId:`story:${intent.operationId}`}};
      const allowed={...context,allowActivityStory:true,allowWorkStory:true};
      const p=inspectLifeTransaction(next,balances,action,allowed);if(!p.ok)return p;
      const r=commitLifeTransaction(next,balances,p.proposal,{confirmed:intent.confirmed===true},allowed);if(!r.ok)return r;
      next=r.state;cashDeltaCents=r.cashDeltaCents;healthDelta=r.healthDelta;events=r.events;
      next.story47.stage='ack';events.push({type:'story47_advanced',id:story.id,stage:'ack'});
    } else if(intent.type==='dismiss' && story.stage==='ack') {
      next.story47=null;events.push({type:'story47_dismissed',id:story.id});
    } else return bad('invalid_story_stage');
  }
  next.storyOperationIds={...(next.storyOperationIds??{}),[intent.operationId]:true};
  return {ok:true,state:next,cashDeltaCents,healthDelta,events};
}
