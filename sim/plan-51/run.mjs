import { createSchedule, inspect, commit, BASELINE } from '../../src/core/life-schedule/index.mjs';
import { ROUTES, SEEDS } from './routes.mjs';
import { createRng } from '../../src/core/prng.mjs';
import { initialLife, transitionLife } from '../../src/core/life-progression.mjs';
export function studyManifest() { return { scheduler: createSchedule(BASELINE, {}).policyId, seeds: [...SEEDS], routes: [...ROUTES], status: 'partial-policy-study' }; }
// Deterministic schedule-only example: no seeded gameplay is simulated here.
export function balancedTrace(days = 7) {
  let state = createSchedule({...BASELINE,rentStudy:false}, Object.fromEntries(Array.from({length:days},(_,i)=>[String(i+1),true])));
  let balances = {cash:BASELINE.startCash,health:BASELINE.startHealth}; const ledger=[]; let n=0;
  const step = (intent, operation={}) => {
    intent.operationId=`trace-${++n}`; const p=inspect(state,balances,intent); if (!p.ok) throw Error(p.reason);
    const r=commit(state,balances,p.proposal,{confirmed:true,...operation}); if (!r.ok) throw Error(r.reason);
    state=r.state; balances={cash:balances.cash+r.balanceDeltas.cash,health:balances.health+r.balanceDeltas.health};
    ledger.push({intent:intent.type,kind:intent.kind??intent.choice??null,day:state.day,slot:state.slot,...balances,events:r.events});
  };
  for(let d=1;d<=days;d++) {
    step({type:'meal',choice:'buy'}); step({type:'start',kind:'work'}); step({type:'complete',activityId:state.active.id});
    step({type:'meal',choice:'buy'}); step({type:'start',kind:'leisure'}); step({type:'complete',activityId:state.active.id}); step({type:'sleep'});
  }
  return { assumptions:['work available every day','no rent, fatigue, leisure recovery, or random game outcomes modeled'],ledger,final:{day:state.day,slot:state.slot,...balances}};
}
// Schedule-only traces use symbolic operation references; they do not simulate draws, races, or RNG.
export function playRoute(name) {
  if (!['missed-work','dinner-play','session-extension'].includes(name)) throw new Error('unsupported route');
  let state=createSchedule(BASELINE,{'2':true}); state.day=2; state.slot=name==='missed-work'?'midday':name==='dinner-play'?'early-evening':'evening';
  let balances={cash:80,health:100}, n=0; const ledger=[];
  const perform=(intent, op={})=>{
    intent.operationId=`${name}-${++n}`; const ctx=intent.type==='play'?{operationAvailable:true}:{};
    const p=inspect(state,balances,intent,ctx); if(!p.ok) throw new Error(p.reason);
    const r=commit(state,balances,p.proposal,{confirmed:true,...op},intent.type==='play'?ctx:null); if(!r.ok) throw new Error(r.reason);
    state=r.state; balances={cash:balances.cash+r.balanceDeltas.cash,health:balances.health+r.balanceDeltas.health};
    ledger.push({intent:intent.type,kind:intent.kind,day:state.day,slot:state.slot,...balances,events:r.events});
  };
  perform({type:'play',kind:'pull'},{success:true,operationId:`${name}-1`,resultRef:'symbolic-pull'});
  if(name==='session-extension') {perform({type:'play',kind:'race'},{success:true,operationId:`${name}-2`,resultRef:'symbolic-race'}); perform({type:'play',kind:'pull',extend:true},{success:true,operationId:`${name}-3`,resultRef:'symbolic-second-pull'});}
  else perform({type:'complete',activityId:state.active.id});
  return {name,assumptions:'symbolic successful operations; no actual purchase, draw, race, RNG, rent or fatigue application',ledger,final:{day:state.day,slot:state.slot,...balances,obligations:state.obligations,fatigue:state.fatigue}};
}
// Isolated hypothetical; values are candidates, not adopted policy.
export function earlyBedComparison() {
  return [5,10].map(amount => {
    let state=createSchedule({...BASELINE,earlyBedHealth:amount},{}); state.day=2; state.slot='evening';
    const balances={cash:0,health:90};
    const first=inspect(state,balances,{type:'start',kind:'early-bed',operationId:`start-${amount}`});
    const started=commit(state,balances,first.proposal,{}); state=started.state;
    const next=inspect(state,balances,{type:'complete',activityId:state.active.id,operationId:`finish-${amount}`});
    const finished=commit(state,balances,next.proposal,{});
    return {candidateExtraHP:amount,startingHP:90,endingHP:90+finished.balanceDeltas.health,nextDay:finished.state.day,nextSlot:finished.state.slot,forgone:'Evening activity and Late Evening active play'};
  });
}
export function recoveryComparison() {
  return [false,true].map(consumesSlot => {
    let state=createSchedule({...BASELINE,recoveryConsumesSlot:consumesSlot},{2:true}); state.day=2; state.slot='morning';
    let balances={cash:0,health:3};
    const intent={type:'meal',choice:'skip',operationId:`skip-${consumesSlot}`};
    const first=inspect(state,balances,intent); const missed=commit(state,balances,first.proposal,{confirmed:true});
    state=missed.state; balances={cash:0,health:0};
    const proposal=inspect(state,balances,{type:'recover',operationId:`recover-${consumesSlot}`});
    const recovered=commit(state,balances,proposal.proposal,{confirmed:true});
    return {candidateConsumesSlot:consumesSlot,health:recovered.balanceDeltas.health,day:recovered.state.day,slot:recovered.state.slot,scheduledShiftStillAvailable:recovered.state.slot==='midday',assumptions:'$0 cash, recovery +25 HP, no other obligations modeled'};
  });
}
// Paired candidates run the same explicit intentions; first infeasible intention stops that route.
function candidateTrace(config, start, intentions, fallback = false) {
  let state=createSchedule({...BASELINE,rentStudy:true,hypotheticalRentContinuation:true,...config},{3:true,4:true}); Object.assign(state,{day:start.day,slot:start.slot});
  let balances={cash:start.cash,health:start.health}, n=0; const ledger=[];
  let skipCompletion=false;
  for (const raw of intentions) {
    if (skipCompletion && raw.type === 'complete' && raw.activityId === '$active') { skipCompletion=false; ledger.push({intention:raw, skipped:'work was unavailable'}); continue; }
    const intent={...raw,operationId:`candidate-${++n}`};
    if (intent.activityId === '$active') intent.activityId=state.active?.id;
    const context=intent.type==='play'?{operationAvailable:true}:{};
    const prepared=inspect(state,balances,intent,context);
    if (!prepared.ok && fallback && raw.type === 'start' && raw.kind === 'work' && prepared.reason === 'work_unavailable') { ledger.push({intention:raw,unavailable:prepared.reason,day:state.day,slot:state.slot,...balances}); skipCompletion=true; continue; }
    if (!prepared.ok) return {config,ledger,stopped:{intention:raw,reason:prepared.reason,day:state.day,slot:state.slot,...balances},final:{day:state.day,slot:state.slot,...balances,rent:state.rent.status,plans:state.futurePlans}};
    const operation={confirmed:true, conflictChoice:'notice'}; if(intent.type==='play') Object.assign(operation,{success:true,operationId:intent.operationId,resultRef:'symbolic-race'});
    const result=commit(state,balances,prepared.proposal,operation,intent.type==='play'?context:null);
    if (!result.ok) return {config,ledger,stopped:{intention:raw,reason:result.reason,day:state.day,slot:state.slot,...balances},final:{day:state.day,slot:state.slot,...balances,rent:state.rent.status,plans:state.futurePlans}};
    state=result.state; balances={cash:balances.cash+result.balanceDeltas.cash,health:balances.health+result.balanceDeltas.health};
    ledger.push({intention:raw,day:state.day,slot:state.slot,...balances,events:result.events});
  }
  return {config,ledger,stopped:null,final:{day:state.day,slot:state.slot,...balances,rent:state.rent.status,plans:state.futurePlans}};
}
export function pairedCandidates() {
  const earlyIntentions=[{type:'reserve',planId:'ren',day:3,slot:'evening'},{type:'start',kind:'early-bed'},{type:'complete',activityId:'$active'},{type:'rent',choice:'acknowledge-shortfall'},{type:'meal',choice:'buy'},{type:'start',kind:'work'},{type:'complete',activityId:'$active'},{type:'meal',choice:'buy'},{type:'start',kind:'quiet'},{type:'complete',activityId:'$active'},{type:'play',kind:'race'},{type:'complete',activityId:'$active'}];
  const recoveryIntentions=[{type:'meal',choice:'skip'},{type:'recover'},{type:'start',kind:'work'},{type:'complete',activityId:'$active'},{type:'meal',choice:'buy'},{type:'start',kind:'early-bed'},{type:'complete',activityId:'$active'},{type:'rent',choice:'acknowledge-shortfall'},{type:'meal',choice:'buy'},{type:'start',kind:'work'},{type:'complete',activityId:'$active'},{type:'meal',choice:'buy'},{type:'start',kind:'quiet'},{type:'complete',activityId:'$active'},{type:'play',kind:'race'},{type:'complete',activityId:'$active'}];
  return {assumptions:'Fixed action intentions and deterministic schedule; symbolic race has no price or RNG. Candidate rent shortfall acknowledgment, +25 recovery and -10 late fatigue are working study inputs, not adopted policy. A reserved Ren plan is explicitly withdrawn with notice; no relationship effects or job termination are modeled.', earlyBed:[5,10].map(v=>candidateTrace({earlyBedHealth:v,recoveryConsumesSlot:false},{day:3,slot:'evening',cash:80,health:90},earlyIntentions)), recovery:[false,true].map(v=>candidateTrace({earlyBedHealth:5,recoveryConsumesSlot:v},{day:3,slot:'morning',cash:80,health:3},recoveryIntentions)), recoveryFallback:[false,true].map(v=>candidateTrace({earlyBedHealth:5,recoveryConsumesSlot:v},{day:3,slot:'morning',cash:80,health:3},recoveryIntentions,true))};
}
// Narrow old-policy control. Not save migration or whole-run balance equivalence.
export function oldPolicyDayControl() {
  let life=initialLife(), balances={cash:80,health:100}; const ledger=[];
  const step=intent=>{const r=transitionLife(life,balances,intent);if(!r.ok)throw new Error(r.reason);life=r.life;balances={cash:r.cash,health:r.health};ledger.push({intent:intent.type,day:life.day,phase:life.phase,...balances,events:r.events});};
  step({type:'meal',choice:'buy'});step({type:'depart_work'});step({type:'complete_work',id:life.work.id});step({type:'advance'});step({type:'meal',choice:'buy'});step({type:'begin_activity47',choice:'sit_duck',version:2});step({type:'complete_activity47',id:life.story47.id});step({type:'dismiss_story47',id:life.story47.id});step({type:'advance'});
  return {source:'src/core/life-progression.mjs policy 1',limitations:'One current-source old-policy route; not a compatibility claim, no RNG or rent.',ledger,final:{day:life.day,phase:life.phase,...balances}};
}
export function noCashNoJobTrace({continueHypothetical=false}={}) {
  let state=createSchedule({...BASELINE,rentStudy:true,employmentStudy:true,hypotheticalRentContinuation:continueHypothetical},{}); state.day=2; state.employment.employed=false;
  let balances={cash:0,health:100},n=0; const ledger=[];
  const step=intent=>{intent.operationId=`no-cash-${++n}`; const p=inspect(state,balances,intent); if(!p.ok) return p.reason; const r=commit(state,balances,p.proposal,{confirmed:true}); if(!r.ok) return r.reason; state=r.state; balances={cash:balances.cash+r.balanceDeltas.cash,health:balances.health+r.balanceDeltas.health}; ledger.push({intent:intent.type,kind:intent.kind??intent.choice??null,day:state.day,slot:state.slot,...balances,events:r.events});return null;};
  let blocked=null;
  while(state.day<=17 && !blocked) {
    if(state.recovery) blocked=step({type:'recover'});
    else if(state.day>=4 && state.rent.status==='pending') blocked=continueHypothetical ? step({type:'rent',choice:'acknowledge-shortfall'}) : 'rent_escalation_unresolved';
    else if(state.slot==='morning'||state.slot==='early-evening') blocked=step({type:'meal',choice:'skip'});
    else if(state.slot==='midday'||state.slot==='evening') {blocked=step({type:'start',kind:'quiet'});if(!blocked) blocked=step({type:'complete',activityId:state.active.id});}
    else blocked=step({type:'sleep'});
  }
  return {assumptions:'No starting cash or job; 16 days of explicit skipped meals, quiet time, normal sleep and candidate rent-shortfall acknowledgement. No gacha, charity or hidden income.',blocked,ledger,final:{day:state.day,slot:state.slot,...balances,rent:state.rent.status}};
}
export function rentOvertimeTrace() {
  const intentions=[{type:'rent',choice:'acknowledge-shortfall'},{type:'reserve-rent-overtime'},{type:'meal',choice:'buy'},{type:'start',kind:'work'},{type:'complete',activityId:'$active'},{type:'rent',choice:'pay'},{type:'meal',choice:'skip'},{type:'start',kind:'overtime'},{type:'complete',activityId:'$active'}];
  // Use the real escalation stop rather than the hypothetical continuation switch.
  return candidateTrace({overtimeStudy:true,hypotheticalRentContinuation:false},{day:4,slot:'morning',cash:120,health:100},intentions);
}
export function overtimeComparison() {
  const common=[{type:'reserve',planId:'ren',day:3,slot:'evening'}, {type:'start',kind:'$choice'}, {type:'complete',activityId:'$active'}, {type:'play',kind:'race'}, {type:'complete',activityId:'$active'}];
  return ['quiet','overtime'].map(choice=>candidateTrace({overtimeStudy:true,recoveryConsumesSlot:true},{day:3,slot:'evening',cash:80,health:90},common.map(i=>i.kind==='$choice'?{...i,kind:choice}:i)));
}
// Seeded hypothetical action-selection cohort, not a model of student behavior or gacha outcomes.
export function seededCohort(earlyBedHealth) {
  return SEEDS.map(seed=>{
    const rng=createRng(`plan51-route-${seed}`); let s=createSchedule({...BASELINE,earlyBedHealth,recoveryConsumesSlot:true,rentStudy:true,employmentStudy:true},Object.fromEntries(Array.from({length:7},(_,i)=>[String(i+1),true])));
    let b={cash:80,health:100}, n=0; const ledger=[];
    const act=(intent, op={})=>{intent.operationId=`${seed}-${++n}`; const context=intent.type==='play'?{operationAvailable:true}:{}; const p=inspect(s,b,intent,context); if(!p.ok) return p.reason; const o={confirmed:true,...op}; if(intent.type==='play') Object.assign(o,{success:true,operationId:intent.operationId,resultRef:'symbolic-race'}); const r=commit(s,b,p.proposal,o,intent.type==='play'?context:null); if(!r.ok) return r.reason; s=r.state;b={cash:b.cash+r.balanceDeltas.cash,health:b.health+r.balanceDeltas.health};ledger.push({day:s.day,slot:s.slot,cash:b.cash,health:b.health,intent:intent.type,kind:intent.kind??intent.choice??null,events:r.events});return null;};
    let blocked=null;
    while(s.day<=7 && !blocked) {
      if (s.recovery) blocked=act({type:'recover'});
      else if (s.config.rentStudy && s.day>=4 && s.rent.status==='pending') blocked=b.cash>=170?act({type:'rent',choice:'pay'}):'rent_escalation_unresolved';
      else if(s.slot==='morning'||s.slot==='early-evening') blocked=act({type:'meal',choice:b.cash>=6?'buy':'skip'});
      else if(s.slot==='midday') {const work=s.day===1 || (s.employment.employed && rng.int(4)!==0); blocked=act({type:'start',kind:work?'work':'quiet'}); if(!blocked) blocked=act({type:'complete',activityId:s.active.id});}
      else if(s.slot==='evening') {const bed=rng.int(4)===0; blocked=act({type:'start',kind:bed?'early-bed':'quiet'}); if(!blocked) blocked=act({type:'complete',activityId:s.active.id});}
      else {const play=rng.int(2)===0; blocked=play?act({type:'play',kind:'race'}):act({type:'sleep'}); if(!blocked&&play) blocked=act({type:'complete',activityId:s.active.id});}
    }
    return {seed,blocked,final:{day:s.day,slot:s.slot,...b,rent:s.rent.status,employment:s.employment},ledger};
  });
}
if (process.argv[1] && new URL(import.meta.url).pathname.replace(/^\//,'').toLowerCase() === process.argv[1].replaceAll('\\','/').toLowerCase()) process.stdout.write(JSON.stringify({manifest:studyManifest(),balanced:balancedTrace(),playRoutes:['missed-work','dinner-play','session-extension'].map(playRoute),earlyBed:earlyBedComparison(),recovery:recoveryComparison(),paired:pairedCandidates(),oldControl:oldPolicyDayControl(),noCash:noCashNoJobTrace(),overtime:overtimeComparison(),rentOvertime:rentOvertimeTrace(),cohort5:seededCohort(5),cohort10:seededCohort(10)}, null, 2)+'\n');

