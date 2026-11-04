import { open } from 'node:fs/promises';
import { resolveSeededRace } from './injury-susceptibility-adapter.mjs';
const arm=process.argv[2];if(!['off','first','contact'].includes(arm))throw Error('invalid arm');
const path=`reports/development/plan-55-opponent-risk-and-duck-growth-study/injury-susceptibility-results/${arm}.json`;
const h=await open(path,'wx');let calls=0;const cases=[];let failure=null;
try {
 for(let i=0;i<8;i++) {
  const seed=`p55m-${String(i).padStart(3,'0')}`,player=i%2?'sprint':'steady';
  const choices=Object.fromEntries(['A','B','C','D','E'].map((id,j)=>[id,(i+j)%2?'sprint':'steady']));
  const risks={P:player,...choices};
  const input={seed,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:player,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:choices,multiContact:{advice:true,risks}};
  if(arm!=='off')input.susceptibility=arm;
  calls++;const r=resolveSeededRace(input);
  const contacts=r.eventRecords.filter(e=>e.type==='duck-contact').map(e=>({id:e.id,tick:e.tick,participants:e.participants,rolls:e.injuryRolls??[]}));
  const participants=Object.fromEntries(['P','A','B','C','D','E'].map(id=>{const events=contacts.filter(e=>e.participants.includes(id)),rolls=events.flatMap(e=>e.rolls.filter(x=>x.id===id));return [id,{contacts:events.length,rolls:rolls.length,newInjury:rolls.some(x=>x.injured)}];}));
  cases.push({seed,arm,player,choices,status:r.status,reason:r.unresolvedReason,guard:r.guardEvidence,contacts,participants,targets:r.injuryTargets??{},crossings:r.finishCrossings.map(x=>({id:x.id,time:x.crossingTimeSeconds})),first:r.finishTimeSeconds,last:r.lastFinishTimeSeconds,adviceEligible:(r.adviceAudit??[]).filter(x=>x.eligible).length});
  if(r.status!=='finished')throw Error(`unresolved race ${seed}: ${r.unresolvedReason}`);
 }
} catch(e){failure=String(e?.stack??e);}
await h.writeFile(JSON.stringify({version:'plan55-injury-susceptibility/v1',arm,calls,cases,failure}));await h.close();
process.stdout.write(JSON.stringify({arm,calls,cases:cases.length,failure})+'\n');if(failure)process.exitCode=1;
