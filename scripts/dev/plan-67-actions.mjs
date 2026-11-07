import { GameEngine } from '../../src/core/game-engine.mjs';
import { lifeSurface } from '../../src/ui/life/life-routing.mjs';

// Restricted model of browser choices; displayed events below are explicitly simulated.
export function createPilot(seed) {
  const engine = new GameEngine(seed, {lifePolicy:'five-slot-v1', tutorialShift:true});
  engine.start(); engine.setupCompanion('Professor Quacks','classic-yellow');
  // Mirror main.js enterLife(lifeSurface(engine)) after welcome setup. 
  engine.state.step = lifeSurface(engine);
  return {engine, prompt:null, sequence:0};
}
export function restorePilot(envelope, prompt=null, sequence=0) {
  return {engine:GameEngine.fromEnvelope(envelope), prompt, sequence};
}
const id = c => `plan67:${++c.sequence}`;
export function snapshot(c) {
  const e=c.engine,s=e.state.life.schedule;
  return {day:s.day,slot:s.slot,cash:e.state.cash,health:e.state.health,active:s.active?.kind??null,
    story:e.state.life.story47?.stage??null,due:e.checkDueObligations().bills.map(b=>b.id),
    terminal:e.state.terminalRoute,logLength:e.log.length};
}
export function availableActions(c) {
  const e=c.engine,s=e.state.life.schedule,story=e.state.life.story47;
  if(e.isTerminal()) return [];
  if(c.prompt==='retention') return ['leave','stay'];
  if(c.prompt==='default') return ['default-confirm','default-reconsider'];
  const actions=['uninstall'];
  if(story) {
    if(story.stage==='commute'||story.stage==='work') actions.push(`show-${story.stage}`);
    if(story.stage==='commute') actions.push('work-advance');
    if(story.stage==='work') actions.push('work-complete');
    if(story.stage==='payslip') actions.push('work-dismiss');
    return actions;
  }
  if(s.recovery) return [...actions,'recover'];
  if(e.checkDueObligations().bills.length) return [...actions,'due-show','due-pay','due-attempt'];
  if(s.active?.kind==='early-bed') return [...actions,'bed-complete'];
  if(s.slot==='morning'||s.slot==='early-evening') return [...actions,'meal-buy',...(s.day===1?['meal-skip']:[])];
  if(s.slot==='midday') return [...actions,'work-start'];
  if(s.slot==='evening') return [...actions,'bed-start'];
  if(s.slot==='late-evening') return [...actions,'sleep'];
  return actions;
}
export function dispatch(c, action) {
  const e=c.engine, before=snapshot(c), options=availableActions(c), start=e.log.length;
  if(!options.includes(action)) return {action,available:options,before,after:before,ok:false,reason:'not_exposed_by_pilot',events:[]};
  let result={ok:true}, simulated=[];
  const schedule = a => {
    const p=e.prepareFiveSlotAction({domain:'schedule',action:{...a,operationId:id(c)}});
    if(!p.ok)return p;
    if(p.proposal.schedule.disclosures.length) {
      if(!e.recordFiveSlotScheduleWarningShown(p.proposal))return {ok:false,reason:'warning_record_failed'};
      simulated.push('warning shown and confirmed');
    }
    return e.commitFiveSlotAction(p.proposal,{confirmed:true});
  };
  const story=e.state.life.story47;
  switch(action) {
    case 'uninstall': e.clickUninstall();c.prompt='retention';simulated.push('retention shown');break;
    case 'leave': e.leaveUninstall();c.prompt=null;break;
    case 'stay': e.stayUninstall();c.prompt=null;break;
    case 'meal-buy': result=schedule({type:'meal',choice:'buy'});break;
    case 'meal-skip': result=schedule({type:'meal',choice:'skip'});break;
    case 'work-start': result=e.beginStoryWork('agree');break;
    case 'show-commute': case 'show-work': result={ok:Boolean(e.showLifeStory47(story.id,story.stage))};simulated.push(`story ${story.stage} shown`);break;
    case 'work-advance': case 'work-complete': case 'work-dismiss': {
      const type={'work-advance':'advance','work-complete':'complete','work-dismiss':'dismiss'}[action];
      result=e.applyFiveSlotWorkStory({type,id:story.id,operationId:id(c),confirmed:true},e.log.length);break;
    }
    case 'bed-start': result=schedule({type:'start',kind:'early-bed'});break;
    case 'bed-complete': result=schedule({type:'complete',activityId:e.state.life.schedule.active.id});break;
    case 'sleep': result=schedule({type:'sleep'});break;
    case 'recover': result=schedule({type:'recover'});break;
    case 'due-show': result={ok:Boolean(e.recordFiveSlotDueOptionsShown())};simulated.push('due options shown');break;
    case 'due-pay': {
      const bill=e.checkDueObligations().bills[0],a=bill.id.startsWith('loan-')?{type:'repay_loan',loanId:bill.id}:{type:'pay_rent',billId:bill.id};
      const p=e.prepareFiveSlotAction({domain:'finance',action:{...a,id:id(c)}});result=p.ok?e.commitFiveSlotAction(p.proposal):p;break;
    }
    case 'due-attempt': {
      const req={kind:'schedule',action:{type:'meal',choice:'buy'}};
      const classified=e.classifyFiveSlotDueCommitment(req);
      if(!classified.ok) result=classified;
      else if(!e.fiveSlotDueOptionsWereShown())result={ok:false,reason:'options_not_shown'};
      else {c.prompt='default';simulated.push('default consequence warning shown');} break;
    }
    case 'default-reconsider': c.prompt=null;break;
    case 'default-confirm': {
      const bill=e.checkDueObligations().bills[0], target=bill.id.startsWith('loan-')?{loanId:bill.id}:{billId:bill.id};
      const p=e.prepareFiveSlotAction({domain:'finance',action:{type:'leave_unpaid',...target,id:id(c),confirmed:true,optionsDisclosed:true}});
      result=p.ok?e.commitFiveSlotAction(p.proposal):p;c.prompt=null;simulated.push('default confirmed');break;
    }
  }
  return {action,available:options,before,after:snapshot(c),ok:result?.ok!==false,reason:result?.reason??null,
    events:e.log.entries.slice(start),simulated};
}
export function step(c, action) {
  const row=dispatch(c,action);if(!row.ok)throw new Error(`${action}: ${row.reason}`);return row;
}

