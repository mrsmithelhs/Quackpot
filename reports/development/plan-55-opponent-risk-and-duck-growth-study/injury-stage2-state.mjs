import {createRng} from '../../../src/core/prng.mjs';
export const PROBABILITIES=Object.freeze({low:Object.freeze({steady:.025,sprint:.05}),medium:Object.freeze({steady:.05,sprint:.1}),high:Object.freeze({steady:.1,sprint:.2})});
export function rollInjury(entrant,{policy,stance,seed,raceId,contactId,injuryBand}){
 if(policy!=='contact'||!['steady','sprint'].includes(stance)||!Object.hasOwn(PROBABILITIES,injuryBand))throw new RangeError('invalid injury study inputs');
 if(entrant.susceptibilityInjured)return null;
 const probability=PROBABILITIES[injuryBand][stance],key=`plan55-susceptibility/v1/${raceId}/${contactId}/${entrant.id}/injury`,value=createRng(seed).fork(key).next(),injured=value<probability;
 entrant.susceptibilityRolled=true;return {id:entrant.id,stance,probability,key,value,injured};
}
