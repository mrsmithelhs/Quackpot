import { createRng } from '../../../src/core/prng.mjs';
export function rollInjury(entrant,{policy,stance,seed,raceId,contactId}) {
  if(!['first','contact'].includes(policy)||!['steady','sprint'].includes(stance))throw new RangeError('invalid injury inputs');
  if(entrant.susceptibilityInjured||(policy==='first'&&entrant.susceptibilityRolled))return null;
  const probability=stance==='sprint'?0.4:0.2;
  const key=`plan55-susceptibility/v1/${raceId}/${contactId}/${entrant.id}/injury`;
  const value=createRng(seed).fork(key).next(),injured=value<probability;
  entrant.susceptibilityRolled=true;
  return {id:entrant.id,stance,probability,key,value,injured};
}
export function extensionOnce(state,{seed,raceId,id,status}) {
  const next=structuredClone(state);
  if(status!=='finished' || !next.injured)return next;
  next.extensionDecisions??={};
  if(Object.hasOwn(next.extensionDecisions,raceId))throw new Error('extension already decided');
  const key=`plan55-susceptibility/v1/${raceId}/${id}/extension`,value=createRng(seed).fork(key).next();
  next.extensionDecisions[raceId]={id,key,value,extended:value<0.5};return next;
}

