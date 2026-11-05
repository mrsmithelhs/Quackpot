// Report-local exploratory candidate. No production import or parity claim.
import { Q, TURN, checked, roundEven } from '../integer-math.mjs';
import { integerFrame } from '../course-probe.mjs';
import { LENGTH, UNIT, TICK, ceilDiv, velocity, move, control, advanceEpisode } from './course.mjs';
import { distance, correctPair, impulsePair, wall } from './contact.mjs';
import { bouncePhase, contactInjuries, ratedTop, updateAbility } from './abilities.mjs';
import { draw, deepFreeze, validateInput } from './codec.mjs';
import { matchesReferencePolicy } from './reference-policy.mjs';

const order=(a,b)=>a<b?-1:a>b?1:0;
const activeCount=(state)=>state.entrants.filter((e)=>e.abilityStart!==null).length;
const capacity=(state,extra=0)=>state.events.length+extra+activeCount(state)<=512;
function emit(state,kind,participants=[],details=[]) {
  if(!capacity(state,1))return false;
  state.events.push({id:`event-${state.sequence++}`,kind,time:state.time,participants,details});return true;
}
function closeAbility(state,e,reason) {
  if(e.abilityStart===null)return true;
  e.abilityStart=null;return emit(state,'ability-end',[e.id],[e.ability,reason]);
}
function crossingsAtEndpoint(before,after,stepStart,dt) {
  const found=[];
  for(const e of after) {
    if(e.finished)continue;
    const prior=before.find((item)=>item.id===e.id),old=prior.progress-prior.finishCorrection,now=e.progress-e.finishCorrection;
    if(old<LENGTH&&now>=LENGTH&&now>old)found.push({id:e.id,time:checked(stepStart+dt),stepStart,stepDuration:dt,
      numerator:LENGTH-old,denominator:now-old,place:null});
  }
  return found.sort((a,b)=>{const left=checked(a.numerator*b.denominator),right=checked(b.numerator*a.denominator);
    return left<right?-1:left>right?1:order(a.id,b.id);});
}
function publishCrossing(state,crossing) {
  const e=state.entrants.find((item)=>item.id===crossing.id);if(e.finished)return true;
  if(!emit(state,'crossing',[e.id],[crossing.stepStart.toString(),crossing.stepDuration.toString(),crossing.numerator.toString(),crossing.denominator.toString()]))return false;
  e.finished=true;state.crossings.push(crossing);return closeAbility(state,e,'finish');
}
function pairKey(a,b){return JSON.stringify([a,b]);}
const forensicEntrant=(e,tick)=>({id:e.id,progress:e.progress,lateral:e.lateral,speed:e.speed,heading:e.heading,
  airborne:e.airborne,ability:e.ability,phase:bouncePhase(e,tick),abilityStart:e.abilityStart,opportunity:e.abilityOpportunity??0n});
export const checkpointTick=(time)=>ceilDiv(time,TICK);
function reconcile(state,tick,table,travelBound,seed,raceId,diagnostic,freshLanding=[]) {
  let count=0;
  while(count++<16) {
    const active=state.entrants.filter((e)=>!e.finished&&!e.airborne).sort((a,b)=>order(a.id,b.id));
    let selected=null;
    for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++) {
      const a=active[i],b=active[j],d=distance(a,b,table),key=pairKey(a.id,b.id),previous=state.pairs[key];
      if(previous&&d>=1200000n)previous.separated=true;
      if(d<=UNIT && !selected) {
        const landing=bouncePhase(a,tick)==='landing'||bouncePhase(b,tick)==='landing';
        const x=velocity(a,table),y=velocity(b,table),dot=checked((y.x-x.x)*(y.vx-x.vx)+(y.y-x.y)*(y.vy-x.vy));
        const eligible=!previous||(previous.separated&&state.time-previous.time>=500000n);
        if((d<UNIT||dot<0n||landing)&&(eligible||d<UNIT))selected={a,b,d,key,previous,landing};
      }
    }
    if(!selected)return {ok:true};
    const {a,b,d,key,previous}=selected,ids=[a.id,b.id],rearmed=!previous||(previous.separated&&state.time-previous.time>=500000n);
    if(previous&&!rearmed&&d===UNIT)return {ok:true};
    let landingCorrection=null;
    if(d<UNIT) {
      const landing=ids.some(id=>freshLanding.includes(id)&&bouncePhase(state.entrants.find(e=>e.id===id),tick)==='landing');
      const corrected=correctPair(state.entrants,ids,table,travelBound,LENGTH,{landing});
      if(!corrected.ok)return corrected.reason==='contact-depth'?{...corrected,contactDepth:{participants:ids,separation:d,
        penetration:UNIT-d,travelBound,margin:1000n,atContact:[forensicEntrant(a,tick),forensicEntrant(b,tick)]}}:corrected;
      state.entrants=corrected.entrants;
      if(landing)landingCorrection=corrected;
    }
    const impulse=impulsePair(state.entrants,ids,table,{constraint:!rearmed});if(!impulse.ok)return impulse;
    state.entrants=impulse.entrants;
    if(rearmed) {
      const episode=previous?previous.episode+1n:0n;
      state.pairs[key]={time:state.time,separated:false,episode};
      if(!emit(state,'contact',ids,[episode.toString(),impulse.impulse.toString()]))return {ok:false,reason:'event-cap'};
      if(landingCorrection&&!emit(state,'landing-correction',ids,[landingCorrection.penetration.toString(),...landingCorrection.displacements.map(String),landingCorrection.correctionBudget.toString(),String(landingCorrection.passes)]))return {ok:false,reason:'event-cap'};
      const injury=contactInjuries(state.entrants,ids,episode,tick,seed,raceId,diagnostic);state.entrants=injury.entrants;
      for(const e of injury.events)if(!emit(state,e.kind,e.participants,e.details))return {ok:false,reason:'event-cap'};
      if(impulse.impulse>0n) {
        const aNow=state.entrants.find((e)=>e.id===ids[0]),bNow=state.entrants.find((e)=>e.id===ids[1]);
        const av=velocity(aNow,table),bv=velocity(bNow,table),dx=bv.x-av.x,dy=bv.y-av.y;
        for(const [index,e] of [aNow,bNow].entries()) {
          const frame=integerFrame(e.progress,e.lateral,table),sx=index===0?-dx:dx,sy=index===0?-dy:dy;
          const cross=checked(-frame.ty*sx+frame.tx*sy),sign=cross===0n?(index===0?-1n:1n):(cross<0n?-1n:1n);
          const roll=draw(seed,raceId,'contact-steering',[...ids,episode.toString(),e.id]);
          const degrees=15000000n+roundEven(roll.value*5000000n,4294967296n);
          if(e.steering?.kind==='weave'&&!emit(state,'steering-cancel',[e.id],['contact']))return {ok:false,reason:'event-cap'};
          e.steering={kind:'contact',phase:'acquire',start:tick,sign,angle:roundEven(degrees*TURN,360n*UNIT),held:0n,centered:0n};
          if(!emit(state,'contact-steering',[e.id],[episode.toString(),sign.toString(),roll.value.toString()]))return {ok:false,reason:'event-cap'};
        }
      }
    } else {
      if(!emit(state,'constraint',ids,[impulse.impulse.toString()]))return {ok:false,reason:'event-cap'};
      if(landingCorrection&&!emit(state,'landing-correction',ids,[landingCorrection.penetration.toString(),...landingCorrection.displacements.map(String),landingCorrection.correctionBudget.toString(),String(landingCorrection.passes)]))return {ok:false,reason:'event-cap'};
    }
  }
  return {ok:false,reason:'contact-pass-cap'};
}

/** One whole integer-microsecond endpoint is atomic, including crossing facts. */
export function advanceIntegerStep(state,dt,table,{seed,raceId,diagnostic=false,travelBound=250000n,tick=1n,freshLanding=[]}={}) {
  if(typeof dt!=='bigint'||dt<=0n)return {ok:false,reason:'substep-resolution',state};
  const candidate=structuredClone(state),stepStart=candidate.time;
  // Landing is an eligible contact at the actual start boundary. Keep its
  // effects inside the same transaction and recheck the chosen travel bound.
  let endpointBound=travelBound;
  if(candidate.entrants.some((e)=>!e.finished&&bouncePhase(e,tick)==='landing')) {
    const landing=reconcile(candidate,tick,table,travelBound,seed,raceId,diagnostic,freshLanding);
    if(!landing.ok)return {ok:false,reason:landing.reason,state,guardEvidence:{pendingCrossings:[],...(landing.contactDepth?{contactDepth:{...landing.contactDepth,stage:'step-start',stepStart,dt,tick,pre:state.entrants.filter(e=>landing.contactDepth.participants.includes(e.id)).map(e=>forensicEntrant(e,tick))}}:{})}};
    const live=candidate.entrants.filter((e)=>!e.finished),speeds=live.map((e)=>e.speed).sort((a,b)=>a>b?-1:a<b?1:0);
    const relative=2n*((speeds[0]??0n)+(speeds[1]??0n));
    if(relative){const allowed=checked(travelBound*UNIT)/relative;if(allowed<dt)dt=allowed;}
    for(const e of live){const v=velocity(e,table),delta=LENGTH-(e.progress-e.finishCorrection);
      if(v.along>0n&&delta>0n){const crossing=ceilDiv(checked(delta*UNIT),v.along);if(crossing<dt)dt=crossing;}}
    if(dt<1n)return {ok:false,reason:'substep-resolution',state,guardEvidence:{pendingCrossings:[]}};
    endpointBound=ceilDiv(checked(relative*dt),UNIT);
  }
  const before=structuredClone(candidate.entrants);
  candidate.entrants=candidate.entrants.map((e)=>e.finished?e:move(e,dt,table));candidate.time=checked(candidate.time+dt);
  const pending=crossingsAtEndpoint(before,candidate.entrants,stepStart,dt);
  for(const crossing of pending.filter((item)=>item.numerator<item.denominator))if(!publishCrossing(candidate,crossing))return {ok:false,reason:'event-cap',state};
  for(const e of candidate.entrants.filter((item)=>!item.finished)) {
    const response=wall(e,table,endpointBound);if(!response.ok)return {ok:false,reason:response.reason,state,guardEvidence:{pendingCrossings:pending.map((item)=>item.id)}};
    Object.assign(e,response.entrant);if(response.event&&!emit(candidate,response.event,[e.id],[]))return {ok:false,reason:'event-cap',state};
  }
  const contacts=reconcile(candidate,tick,table,endpointBound,seed,raceId,diagnostic);
  if(!contacts.ok)return {ok:false,reason:contacts.reason,state,guardEvidence:{pendingCrossings:pending.map((item)=>item.id),...(contacts.contactDepth?{contactDepth:{...contacts.contactDepth,stage:'endpoint',stepStart,dt,tick,pre:state.entrants.filter(e=>contacts.contactDepth.participants.includes(e.id)).map(e=>forensicEntrant(e,tick))}}:{})}};
  for(const crossing of pending.filter((item)=>item.numerator===item.denominator)) {
    const entrant=candidate.entrants.find((e)=>e.id===crossing.id);
    if(entrant.progress-entrant.finishCorrection>=LENGTH&&!publishCrossing(candidate,crossing))return {ok:false,reason:'event-cap',state};
  }
  if(!capacity(candidate))return {ok:false,reason:'event-cap',state};
  return {ok:true,state:candidate,duration:dt};
}

function initial(input) {
  const entrants=[...input.entrants].sort((a,b)=>order(a.id,b.id)).map((e)=>{
    const roll=draw(input.seed,input.raceId,'performance',[e.id]),spread=e.player&&e.stance==='sprint'?200000n:50000n;
    const adjustment=roundEven(checked((2n*roll.value-4294967296n)*spread),4294967296n);
    const sampledRating=roundEven(checked(BigInt(e.baseRating)*(UNIT+adjustment)),UNIT);
    const phase=draw(input.seed,input.raceId,'weave-phase',[e.id]);
    return {...e,lane:BigInt(e.lane),row:BigInt(e.row),restFactor:BigInt(e.restFactor),downFactor:BigInt(e.downFactor),
      sampledRating,progress:-BigInt(e.row)*4000000n,lateral:e.lane==='1'?-600000n:600000n,
      assignedLaneOffset:e.lane==='1'?-600000n:600000n,finishCorrection:0n,speed:6000000n,heading:0n,
      injured:e.entryInjury,finished:false,airborne:false,wallEpisode:false,wallConstrained:false,
      abilityStart:null,abilityUntil:0n,abilityCooldown:0n,abilityAbsent:0n,abilityLatched:false,abilityOpportunity:0n,
      steering:null,nextWeave:1n+phase.value*60n/4294967296n,weaveOpportunity:0n,slowCount:0n,slowUntil:0n,
      assistOpportunity:0n,assistCount:0n,assistUntil:0n,assistCooldown:0n};
  });
  return {time:0n,entrants,events:[],crossings:[],pairs:{},sequence:0n};
}
const sample=(state,tick)=>({tick,entrants:state.entrants.map(({id,progress,lateral,speed,heading})=>({id,progress,lateral,speed,heading}))});

export function resolveIntegerRace(raw,table,{travelLimit=250000n}={}) {
  const input=validateInput(raw);if(![250000n,125000n].includes(travelLimit))throw new RangeError('invalid travel limit');
  if(!matchesReferencePolicy(table))throw new RangeError('invalid numeric table');
  let state=initial(input),trajectory=[sample(state,0n)],reason='watchdog',guardEvidence=null;
  for(let tick=1n;tick<=800n;tick++) {
    const start=state;let committedStep=false;
    try {
    const candidate=structuredClone(state),active=candidate.entrants.filter((e)=>!e.finished);
    const freshLanding=active.filter(e=>e.airborne&&bouncePhase(e,tick)==='landing').map(e=>e.id);
    const ranked=[...active].sort((a,b)=>a.progress===b.progress?order(a.id,b.id):a.progress>b.progress?-1:1);
    for(const e of active)e.airborne=bouncePhase(e,tick)==='airborne';
    for(const e of active) {
      const rank=ranked.findIndex((item)=>item.id===e.id)+1;
      const update=updateAbility(e,active,tick,input.seed,input.raceId,table);Object.assign(e,update.entrant);
      for(const event of update.events)if(!emit(candidate,event.kind,event.participants,event.details)){reason='event-cap';break;}
      if(reason==='event-cap')break;
      if(tick===e.nextWeave){const index=e.weaveOpportunity++;e.nextWeave=tick+(rank*2<=active.length?60n:120n);
        if(!e.steering && (e.lateral-e.assignedLaneOffset<=250000n && e.lateral-e.assignedLaneOffset>=-250000n)){
          const sign=draw(input.seed,input.raceId,'weave-sign',[e.id,index.toString()]);const magnitude=draw(input.seed,input.raceId,'weave-magnitude',[e.id,index.toString()]);
          const degrees=12000000n+roundEven(magnitude.value*4000000n,4294967296n);
          e.steering={kind:'weave',phase:'acquire',start:tick,sign:sign.value<2147483648n?-1n:1n,angle:roundEven(degrees*(1n<<32n),360n*UNIT),held:0n,centered:0n};
          if(!emit(candidate,'weave',[e.id],[index.toString(),sign.value.toString(),magnitude.value.toString()])){reason='event-cap';break;}
        }}
      if(tick%40n===0n){const index=e.assistOpportunity++,predecessor=ranked[rank-2];
        if(rank*2>active.length&&predecessor&&predecessor.progress-e.progress>=2000000n&&tick>=e.assistCooldown&&e.assistCount<2n){
          const roll=draw(input.seed,input.raceId,'assistance',[e.id,index.toString()]);
          if(!emit(candidate,'assist-opportunity',[e.id],[index.toString(),roll.value.toString()])){reason='event-cap';break;}
          if(roll.value<2147483648n){e.assistUntil=tick+40n;e.assistCooldown=tick+80n;e.assistCount++;}}}
      const top=ratedTop(e).affine;
      Object.assign(e,control(e,top,table,{assisted:e.assistUntil>tick,crowd:e.ability==='crowd'&&e.abilityStart!==null,slowdown:e.slowUntil>tick}));
    }
    if(reason==='event-cap'||!capacity(candidate)){reason='event-cap';state=start;break;}
    state=candidate;let remaining=TICK,steps=0;
    while(remaining>0n) {
      if(++steps>256){reason='substep-cap';if(!committedStep)state=start;break;}
      const live=state.entrants.filter((e)=>!e.finished),speeds=live.map((e)=>e.speed).sort((a,b)=>a>b?-1:a<b?1:0);
      const maxRelative=2n*((speeds[0]??0n)+(speeds[1]??0n));
      let dt=maxRelative?travelLimit*UNIT/maxRelative:remaining;if(dt>remaining)dt=remaining;
      for(const e of live){const v=velocity(e,table),delta=LENGTH-(e.progress-e.finishCorrection);
        if(v.along>0n&&delta>0n){const toCross=ceilDiv(checked(delta*UNIT),v.along);if(toCross<dt)dt=toCross;}}
      if(dt<1n){reason='substep-resolution';if(!committedStep)state=start;break;}
      const bound=ceilDiv(checked(maxRelative*dt),UNIT);
      const next=advanceIntegerStep(state,dt,table,{seed:input.seed,raceId:input.raceId,diagnostic:input.rules==='integer-diagnostic-no-injury/v1',travelBound:bound,tick,freshLanding:committedStep?[]:freshLanding});
      if(!next.ok){reason=next.reason;guardEvidence=next.guardEvidence??null;if(!committedStep)state=start;break;}
      state=next.state;remaining-=next.duration;committedStep=true;
    }
    if(reason!=='watchdog')break;
    state.entrants=state.entrants.map((e)=>{const rank=ranked.findIndex((item)=>item.id===e.id)+1;return rank?advanceEpisode(e,tick,rank,table):e;});
    trajectory.push(sample(state,tick));
    if(state.entrants.every((e)=>e.finished)){reason=null;break;}
    } catch(error) {
      if(!(error instanceof RangeError))throw error;
      if(!committedStep)state=start;
      reason='numeric-guard';guardEvidence=null;break;
    }
  }
  if(guardEvidence?.contactDepth)guardEvidence.contactDepth.retained={time:state.time,entrants:state.entrants.filter(e=>guardEvidence.contactDepth.participants.includes(e.id)).map(e=>forensicEntrant(e,checkpointTick(state.time)))};
  if(reason!==null)for(const e of state.entrants.sort((a,b)=>order(a.id,b.id)))closeAbility(state,e,'unresolved');
  const finished=reason===null;
  const result={schema:'integer-race-result/v1',rules:input.rules,numericPolicy:input.numericPolicy,inputIdentity:input,status:finished?'finished':'unresolved',clock:state.time,
    entrants:state.entrants.map((e)=>({id:e.id,entryInjury:e.entryInjury,injured:e.injured,progress:e.progress,lateral:e.lateral,speed:e.speed,heading:e.heading,finished:e.finished})),
    events:state.events,crossings:state.crossings.map((e,i)=>({...e,place:finished?BigInt(i+1):null})),trajectory,
    unresolved:finished?null:{reason,time:state.time,guardEvidence}};
  return deepFreeze(result);
}
