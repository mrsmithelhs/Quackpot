// Rebuild schema-6 race inputs/effects from ordered, independently checked history.
import {makeRaceRestEvidence,stableExposureSignature} from '../race-rest.mjs';
import {initialRaceProgress,recoverRaceDays,buildRaceV2Input,applyRaceV2Facts,assignRaceAbility,raceCandidateFacts,RACE_CANDIDATE_EVIDENCE_VERSION} from '../race-progression.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function createRaceHistoryPlan(envelope,{roster,constants}){
  const entries=envelope.eventLog,seed=entries[0]?.payload?.seed;if(typeof seed!=='string')throw new RangeError('missing run seed');
  const races=[],owned=new Set();let trial=false,down=0,next=1,pending=[];
  for(let i=0;i<entries.length;i++){
    const e=entries[i],p=e.payload??{};
    if(e.type==='draw_committed'){if(p.duplicate)down+=p.downGained??0;else owned.add(p.identity);}
    if(e.type==='action'&&p.kind==='down_spent'){if(!Number.isSafeInteger(p.amount)||p.amount<0||p.amount>down)throw new RangeError('invalid Down spending');down-=p.amount;}
    if(e.type==='action'&&p.kind==='race_trial_purchased'){if(trial||p.costDown!==constants.RACE_TRIAL_COST||down<p.costDown)throw new RangeError('invalid trial purchase');down-=p.costDown;trial=true;}
    if(e.type==='action'&&p.kind==='race_trial_consumed'){if(!trial||entries[i-1]?.type!=='race_result'||entries[i-2]?.payload?.raceId!==p.raceId)throw new RangeError('invalid trial consumption');trial=false;}
    if(e.type==='action'&&p.kind==='race_ability_assigned'){
      if(!owned.has(p.duckId)||!['bounce','crowd'].includes(p.ability)||!Number.isSafeInteger(e.clock?.day))throw new RangeError('invalid ability assignment');
      pending.push({kind:'assignment',id:p.duckId,ability:p.ability,day:e.clock.day});
    }
    if(e.type==='race_choice_offered'&&Object.hasOwn(p,'candidateEvidenceVersion')){
      if(p.candidateEvidenceVersion!==RACE_CANDIDATE_EVIDENCE_VERSION||!Number.isSafeInteger(e.clock?.day))throw new RangeError('unknown candidate evidence');
      pending.push({kind:'exposure',payload:p,day:e.clock.day,owned:[...owned],trial,next,history:entries.slice(0,i)});
    }
    if(e.type!=='action'||p.kind!=='race_choice')continue;
    const outcome=entries[i+1],n=outcome?.payload?.raceNumber,duck=roster.find(x=>x.id===p.duckId);
    if(!outcome||!['race_result','race_attempt_unresolved'].includes(outcome.type)||n!==next++||p.raceId!==`R${String(n).padStart(2,'0')}`
      ||outcome.payload.raceId!==p.raceId||outcome.payload.duckId!==p.duckId||!duck||!owned.has(p.duckId)||!['safe','sprint'].includes(p.stance)
      ||typeof p.trialCommitted!=='boolean'||(p.trialCommitted&&!trial))throw new RangeError('invalid race history');
    const rest=makeRaceRestEvidence(entries.slice(0,i),p.duckId,duck.speed),evidence={...rest,trialCommitted:p.trialCommitted,trialMultiplier:constants.RACE_TRIAL_SPEED_MULTIPLIER};
    if(!same(p.restEvidence,evidence)||!same(outcome.payload.restEvidence,evidence))throw new RangeError('race rest mismatch');
    const record=envelope.state.raceResolutions[p.raceId];if(!record||record.digest!==outcome.payload.resolutionDigest)throw new RangeError('race record mismatch');
    races.push({choice:p,outcome:outcome.payload,type:outcome.type,duck,rest,record,trialAvailable:trial,pending});pending=[];
  }
  if(Object.keys(envelope.state.raceResolutions).length!==races.length)throw new RangeError('race record count mismatch');
  let progress=initialRaceProgress(),day=1;
  const applyPending=items=>{for(const a of items){if(a.day<day)throw new RangeError('candidate day order');progress=recoverRaceDays(progress,a.day-day);day=a.day;
    if(a.kind==='assignment'){progress=assignRaceAbility(progress,a.id,a.ability);continue;}
    const p=a.payload,selected=p.trialState?.selected,available=a.trial,ids=Array.isArray(p.candidates)?p.candidates.map(c=>c.duckId):[];
    if(p.referenceDay!==day||p.raceNumber!==a.next||new Set(ids).size!==ids.length||!ids.length||ids.some(id=>!a.owned.includes(id))||!ids.includes(p.selectedDuckId)
      ||typeof selected!=='boolean'||(selected&&!available)||p.trialAvailable!==available||!same(p.trialState,{available,selected,multiplier:constants.RACE_TRIAL_SPEED_MULTIPLIER})
      ||p.fieldBaseSpeed!==(p.raceNumber===1?constants.TUTORIAL_FIELD_SPEED:constants.FINALE_FIELD_SPEED))throw new RangeError('candidate exposure context mismatch');
    const expected=ids.map(id=>{const duck=roster.find(d=>d.id===id);if(!duck)throw new RangeError('unknown candidate');const rest=makeRaceRestEvidence(a.history,id,duck.speed);
      return raceCandidateFacts({duckId:id,baseRating:duck.speed,restFactor:rest.restFactor,historyLimited:rest.historyLimited,recoveryDays:progress.ducks[id]?.recoveryDays??0,referenceDay:day,upgradeAvailable:available,upgradeSelected:selected});});
    expected.sort((x,y)=>Number(y.effectiveRatingMicros)-Number(x.effectiveRatingMicros)||y.authoredRating-x.authoredRating||a.owned.indexOf(x.duckId)-a.owned.indexOf(y.duckId)||(x.duckId<y.duckId?-1:x.duckId>y.duckId?1:0));
    const signature=stableExposureSignature({candidateEvidenceVersion:RACE_CANDIDATE_EVIDENCE_VERSION,candidates:expected,fieldBaseSpeed:p.fieldBaseSpeed,trialState:p.trialState,duckId:p.selectedDuckId});
    if(!same(expected,p.candidates)||p.foregroundedDuckId!==expected[0].duckId||p.signature!==signature||p.exposureId!==`race-choice-${p.raceNumber}-${signature}`)throw new RangeError('candidate evidence mismatch');
  }};
  return {records:races.map(x=>x.record),
    deriveInput(index){const r=races[index];applyPending(r.pending);const entryDay=r.outcome.entryDay;
      if(!Number.isSafeInteger(entryDay)||entryDay<day||entryDay>envelope.state.life.schedule.day)throw new RangeError('invalid race entry day');
      progress=recoverRaceDays(progress,entryDay-day);day=entryDay;
      return buildRaceV2Input({seed,raceId:r.choice.raceId,duckId:r.choice.duckId,baseRating:r.duck.speed,
        fieldRating:r.outcome.raceNumber===1?constants.TUTORIAL_FIELD_SPEED:constants.FINALE_FIELD_SPEED,
        restFactor:r.rest.restFactor,trialCommitted:r.choice.trialCommitted,stance:r.choice.stance,progress});},
    onResult(index,candidate){const r=races[index],facts=candidate.compact.facts;
      const effects=applyRaceV2Facts(progress,{seed,raceId:r.choice.raceId,duckId:r.choice.duckId},{status:facts.status,entrants:facts.injuries,crossings:facts.crossings});
      const p=r.outcome,finished=facts.status==='finished',cross=facts.crossings;
      const expected={status:finished?'finished':'unresolved',resolutionStatus:facts.status,entryInjury:effects.enteredInjured,raceGrowthAfter:effects.progress,
        extensionRoll:effects.extensionRoll,extension:effects.extension};
      if(finished){Object.assign(expected,{place:effects.place,payoutGems:effects.payoutGems,trialConsumed:r.choice.trialCommitted,
        winner:cross[0].id,finishTimeSeconds:Number(cross[0].time)/1000000,lastFinishTimeSeconds:Number(cross.at(-1).time)/1000000,
        rivalPlace:p.raceNumber===2?Number(cross.find(e=>e.id==='A').place):null,playerPerf:null,
        finishOrder:cross.map((e,i)=>({id:e.id,place:i+1,payout:[50,20,10,0,0,0][i]}))});}
      else Object.assign(expected,{unresolvedReason:facts.unresolved.reason,guardEvidence:facts.unresolved.guardEvidence,
        knownCrossings:cross.map(e=>({id:e.id,crossingTimeSeconds:Number(e.time)/1000000})),trialAvailable:r.trialAvailable,trialCommitted:r.choice.trialCommitted});
      if((finished?r.type!=='race_result':r.type!=='race_attempt_unresolved')||Object.entries(expected).some(([k,v])=>!same(p[k],v)))throw new RangeError('race effects mismatch');
      progress=effects.progress;},
    finish(){applyPending(pending);const finalDay=envelope.state.life.schedule.day;if(!Number.isSafeInteger(finalDay)||finalDay<day)throw new RangeError('invalid final day');
      progress=recoverRaceDays(progress,finalDay-day);if(!same(progress,envelope.state.raceGrowth))throw new RangeError('race progression mismatch');}
  };
}
