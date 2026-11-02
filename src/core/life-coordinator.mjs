// Pure staging of the shared scheduler and financial authority. The engine owns
// trusted context, actual game outcomes, the event log and final publication.
import {inspect as inspectSchedule,commit as commitSchedule} from './life-schedule/index.mjs';
import {latchDue,dueObligations,prepareFinance,commitFinance} from './life-finance.mjs';
const copy = value => structuredClone(value);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const bad = reason => ({ok:false,reason});
const validBalances = b => b && Number.isSafeInteger(b.cashCents) && b.cashCents >= 0 && Number.isFinite(b.health) && b.health >= 0;
const pos = schedule => ({day:schedule.day,slot:schedule.slot});
const newDue = (before,after) => [...after.rents,...after.loans].filter(x=>x.latched && ![...before.rents,...before.loans].find(y=>y.id===x.id)?.latched).map(x=>({type:'financial_due',id:x.id,due:copy(x.due)}));

// Inspection may discover due obligations, but cannot mutate or publish state.
export function inspectLifeTransaction(state,balances,intent,context={}) {
  if(!state?.schedule || !state?.finance || !validBalances(balances) || !intent || !context || typeof context !== 'object') return bad('invalid_input');
  const finance=latchDue(state.finance,pos(state.schedule));
  const due=dueObligations(finance,balances.cashCents);
  const recovery=Boolean(state.schedule.recovery);
  if(intent.domain==='schedule') {
    if(due.bills.length && !(recovery && intent.action?.type==='recover')) return bad('financial_obligation_due');
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
    const previous=finance; finance=latchDue(finance,pos(schedule)); events=[...events,...newDue(previous,finance)];
  }
  return {ok:true,state:{...copy(state),schedule,finance},cashDeltaCents,healthDelta,events:[...priorDueEvents,...events]};
}
