import { createRng } from '../../../src/core/prng.mjs';
export class ContactGuardError extends Error {
  constructor(tick, pair, count) { super('multi-contact diagnostic limit'); this.tick=tick; this.pair=pair; this.count=count; }
}
export const pairKey=(a,b)=>[a,b].sort().join('|');
export function observeSeparation(state, distances) {
  const next=structuredClone(state);
  for(const [key,distance] of Object.entries(distances)) if(next.pairs[key] && distance>=1.2) next.pairs[key].separated=true;
  return next;
}
export function rearmPair(episode, tick) {
  return !episode || (episode.separated===true && tick-episode.tick>=10);
}
// Candidate ordering is stable; the callback must recalculate physical closing after each impulse.
export function processCandidatePairs(candidates,state,tick,revalidate,resolve,limit=32) {
  const next=structuredClone(state), accepted=[], rejected=[];
  for(const item of [...candidates].sort((a,b)=>a.fraction-b.fraction||pairKey(a.a,a.b).localeCompare(pairKey(b.a,b.b)))) {
    const key=pairKey(item.a,item.b), now=revalidate(item);
    if(!now.eligible){rejected.push({key,reason:'no-longer-closing'});continue;}
    if(!rearmPair(next.pairs[key],tick)){rejected.push({key,reason:'episode-active'});continue;}
    const resolved=resolve(item,now);
    if(!resolved){rejected.push({key,reason:'no-contact-event'});continue;}
    if(next.count>=limit)throw new ContactGuardError(tick,key,next.count+1);
    next.pairs[key]={tick,separated:false};next.count++;accepted.push({key,fraction:item.fraction});
  }
  return {state:next,accepted,rejected};
}
// courseDelta rejects physically adjacent segments that are far apart along the course.
export function localCrowdNeighbors(neighbors,courseLength) {
  return neighbors.filter(n=>{const arc=Math.abs(n.courseDelta),along=Math.min(arc,courseLength-arc);return along<=8 && n.distance<=4 && n.active && n.ground;});
}
export function adviceOpportunity({seed,raceId,tick,id,risk,proximityEligible,neighbors,courseLength,recoveryActive}) {
  if(recoveryActive)return {eligible:false,reason:'recovery-priority'};
  const near=localCrowdNeighbors(neighbors,courseLength);
  if(near.length<2 || !near.some(n=>n.closing))return {eligible:false,reason:'no-closing-crowd'};
  const probability=(risk==='steady' ? 0.75 : risk==='sprint' ? 0.35 : NaN)*(proximityEligible ? 0.8 : 1);
  if(!Number.isFinite(probability))throw new Error('invalid risk');
  const key=`plan55-multi/v1/${raceId}/${id}/${tick}/advice`, draw=createRng(seed).fork(key).next();
  return {eligible:true,probability,key,draw,follow:draw<probability};
}


export function selectAdviceSide({id,lateral,corridorHalfWidth,neighbors}) {
  const nearby=neighbors.filter(n=>n.distance<=4),left=nearby.filter(n=>n.lateral<lateral).length,right=nearby.filter(n=>n.lateral>lateral).length;
  const preferred=left===right?(id.localeCompare('P')<0?-1:1):(left<right?-1:1);
  const feasible=side=>Math.abs(lateral+side*0.4)<=corridorHalfWidth&&!nearby.some(n=>n.distance<1.2&&Math.sign(n.lateral-lateral)===side);
  return feasible(preferred)?preferred:feasible(-preferred)?-preferred:0;
}



export function advicePriority({enabled,episode,until,tick,target}) {
  if(!enabled)return {active:false,cancel:false,target:null};
  if(episode)return {active:false,cancel:true,target:null};
  return until>tick && Number.isFinite(target)?{active:true,cancel:false,target}:{active:false,cancel:false,target:null};
}
export function assistanceAttribution({active,adviceApplied,ordinaryCorrection,assistedCorrection,requestedTurn,ordinaryCap,appliedCap,dt}) {
  return {recenter:active&&!adviceApplied&&Math.abs(assistedCorrection-ordinaryCorrection)>1e-6,
    raisedCap:active&&appliedCap>ordinaryCap+1e-6&&requestedTurn>ordinaryCap*Math.PI/180*dt+1e-9};
}
