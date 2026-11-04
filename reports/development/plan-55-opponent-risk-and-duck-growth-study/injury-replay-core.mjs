import { isDeepStrictEqual } from 'node:util';
export const REPLAY_CASES=Object.freeze([{seedIndex:0,arm:'first'},{seedIndex:0,arm:'contact'},{seedIndex:1,arm:'first'},{seedIndex:1,arm:'contact'}]);
export function historicalInput(i,arm) {
 if(![0,1].includes(i)||!['first','contact'].includes(arm))throw new RangeError('unsupported replay case');
 const seed=`p55m-${String(i).padStart(3,'0')}`,player=i%2?'sprint':'steady';
 const choices=Object.fromEntries(['A','B','C','D','E'].map((id,j)=>[id,(i+j)%2?'sprint':'steady']));
 return {seed,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:player,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:choices,multiContact:{advice:true,risks:{P:player,...choices}},susceptibility:arm};
}
// Exact projection copied semantically from the historical runner; changing its field set breaks parity.
export function projectHistorical(r,input,arm) {
 const contacts=r.eventRecords.filter(e=>e.type==='duck-contact').map(e=>({id:e.id,tick:e.tick,participants:e.participants,rolls:e.injuryRolls??[]}));
 const participants=Object.fromEntries(['P','A','B','C','D','E'].map(id=>{const events=contacts.filter(e=>e.participants.includes(id)),rolls=events.flatMap(e=>e.rolls.filter(x=>x.id===id));return [id,{contacts:events.length,rolls:rolls.length,newInjury:rolls.some(x=>x.injured)}];}));
 return {seed:input.seed,arm,player:input.choice,choices:input.candidateRivalChoices,status:r.status,reason:r.unresolvedReason,guard:r.guardEvidence,contacts,participants,targets:r.injuryTargets??{},crossings:r.finishCrossings.map(x=>({id:x.id,time:x.crossingTimeSeconds})),first:r.finishTimeSeconds,last:r.lastFinishTimeSeconds,adviceEligible:(r.adviceAudit??[]).filter(x=>x.eligible).length};
}
export function requireHistoricalParity(actual,saved) {
 if(!isDeepStrictEqual(actual,saved))throw new Error('historical case projection mismatch');
 return true;
}
