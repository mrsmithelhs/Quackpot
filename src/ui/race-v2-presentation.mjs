// Display-only projection of a validated integer result. The canonical result is never changed.
import { integerFrame } from '../core/race-v2/course-probe.mjs';
import { getReferenceTable } from '../core/race-v2/reference-policy.mjs';
import { sampleTrajectory } from '../core/race-resolver.mjs';
import {raceCandidateFacts} from '../core/race-progression.mjs';

const table=getReferenceTable(),unit=1e6,turn=2**32,dt=.05;
const number=value=>{const n=Number(value);if(!Number.isSafeInteger(n))throw new RangeError('display value out of bounds');return n;};
const seconds=c=>(number(c.stepStart)+number(c.stepDuration)*number(c.numerator)/number(c.denominator))/unit;
export function unresolvedRaceMarkup(isTutorial){
  return `<section class="race-view race-unresolved"><p class="race-eyebrow">${isTutorial?'Tutorial event':'Championship finale'}</p><h2>Race attempt unresolved</h2><p>This race could not be completed. No finish place or finish reward was awarded.</p><p>The attempt is recorded once. The story may continue, but this is not a finished race and does not count toward future rest.</p><button type="button" data-race-proceed class="race-control-button">Continue</button></section>`;
}
export function reorderRaceCandidates(list,orderedCards,after){
  const current=[...list.querySelectorAll('.race-candidate-card')];
  if(current.length!==orderedCards.length||current.some(card=>!orderedCards.includes(card)))throw new RangeError('candidate order mismatch');
  if(current.every((card,index)=>card===orderedCards[index]))return false;
  const focus=list.ownerDocument?.activeElement,restore=focus&&current.some(card=>card.contains(focus));
  for(const card of orderedCards)list.insertBefore(card,after);
  if(restore&&list.ownerDocument.activeElement!==focus)focus.focus({preventScroll:true});
  return true;
}
export function raceV2DuckPresentation(growth,baseRating,restFactor=1,referenceDay=1,upgradeAvailable=false,upgradeSelected=false){
  const d=growth??{progress:0,banked:0,assigned:null,recoveryDays:0,firstPointEarned:false};
  const facts=raceCandidateFacts({duckId:'preview',baseRating,restFactor,recoveryDays:d.recoveryDays,referenceDay,upgradeAvailable,upgradeSelected});
  return {progress:d.progress,banked:d.banked,assigned:d.assigned,recoveryDays:d.recoveryDays,firstPointEarned:d.firstPointEarned,
    restRating:Number(facts.restRatingMicros)/unit,injuredRating:Number(facts.effectiveRatingMicros)/unit};
}
export function projectRaceV2(result,attempt){
  if(result?.schema!=='integer-race-result/v1'||result.rules!=='integer-working/v1'||result.status!=='finished'||attempt?.status!=='finished')throw new RangeError('finished v2 result required');
  const crossing=result.crossings.map(c=>({...c,at:seconds(c)})),end=crossing.at(-1).at;
  const entrants=result.inputIdentity.entrants.map(e=>({id:e.id,name:e.id,player:e.player,lane:number(e.lane),row:number(e.row),entryInjury:e.entryInjury}));
  let trajectory=result.trajectory.map(frame=>({tick:number(frame.tick),entrants:frame.entrants.map(e=>{const f=integerFrame(BigInt(e.progress),BigInt(e.lateral),table);return {id:e.id,progress:number(e.progress)/unit,lateral:number(e.lateral)/unit,speed:number(e.speed)/unit,heading:number(e.heading)/turn*Math.PI*2,x:Number(f.x)/unit,y:Number(f.y)/unit};})}));
  const finalTick=end/dt,temporary={trajectory,ticks:trajectory.at(-1).tick};
  const final=sampleTrajectory(temporary,Math.min(finalTick,temporary.ticks));
  trajectory=trajectory.filter(frame=>frame.tick<finalTick);trajectory.push({...final,tick:finalTick});
  const partial={trajectory,ticks:finalTick};
  const finishCrossings=crossing.map(c=>{const t=Math.min(c.at/dt,finalTick),state=sampleTrajectory(partial,t).entrants.find(e=>e.id===c.id);return {...state,crossingTimeSeconds:c.at};});
  const eventRecords=result.events.filter(e=>number(e.time)/unit<=end).map(e=>({id:e.id,type:e.kind==='contact'?'duck-contact':e.kind==='wall'?'wall-impact':e.kind,tick:number(e.time)/unit/dt,time:number(e.time)/unit,participants:e.participants,details:e.details}));
  const finish=crossing.map((c,i)=>({id:c.id,place:i+1,payout:attempt.finishOrder[i].payout}));
  if(finish.some((e,i)=>e.id!==attempt.finishOrder[i].id))throw new RangeError('finish order mismatch');
  return {mechanicalVersion:result.rules,status:'finished',entrants,trajectory,ticks:finalTick,dt,finishCrossings,finish,eventRecords,finishTimeSeconds:crossing[0].at,lastFinishTimeSeconds:end};
}

// Return state at the current simulation time, making pause, seek and replay deterministic.
export function raceV2VisualState(resolution,id,seconds){
  const events=resolution.eventRecords.filter(e=>e.participants.includes(id)&&e.time<=seconds);
  const contact=[...events].reverse().find(e=>e.type==='duck-contact'||e.type==='wall-impact');
  const injury=resolution.entrants.find(e=>e.id===id)?.entryInjury||events.some(e=>e.type==='injury');
  const startIndex=events.findLastIndex(e=>e.type==='ability-start'),start=events[startIndex];
  const end=start&&events.slice(startIndex+1).find(e=>e.type==='ability-end');
  const ability=start&&!end&&['bounce','crowd'].includes(start.details[0])?{kind:start.details[0],progress:Math.min(1,Math.max(0,(seconds-start.time)/(start.details[0]==='bounce'?.7:.5)))}:null;
  return {injury,ability,contactAge:contact?seconds-contact.time:null};
}
