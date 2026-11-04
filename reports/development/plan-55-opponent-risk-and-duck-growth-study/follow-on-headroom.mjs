import { open } from 'node:fs/promises';
import { resolveSeededRace } from './follow-on-adapter.mjs';
import { rivalChoices, burstActive } from './candidate.mjs';
const shard=Number(process.argv[2]);if(![0,1].includes(shard))throw Error('shard must be 0 or 1');
const path=`reports/development/plan-55-opponent-risk-and-duck-growth-study/follow-on-results/headroom-${shard}.json`;
const handle=await open(path,'wx');let calls=0;const runs=[];let failure=null;
try {
 for(let i=shard*4;i<shard*4+4;i++) for(const rating of [10,14]) for(const ability of ['none','burst','guard']) for(const mode of ['post-race','same-race']) {
  const seed=`p55h-${String(i).padStart(3,'0')}`,raceId='R01';
  const choices=rivalChoices(seed,raceId,i%2?0.8:0.2);
  const entrants=Object.fromEntries(['P','A','B','C','D','E'].map(id=>[id,{stance:id==='P'?'steady':choices[id],guard:id==='P'&&ability==='guard',injuredBefore:false}]));
  const burst=ability==='burst'&&burstActive(seed,raceId,'duck-0',{ability:'burst'});
  const x={seed,raceId,playerBaseSpeed:rating+(burst?1:0),restFactor:1,fieldBaseSpeed:rating,choice:'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:choices,followOn:{mode,entrants}};
  calls++;const result=resolveSeededRace(x), player=result.finish.find(e=>e.id==='P');
  const contact=result.eventRecords.filter(e=>e.type==='duck-contact').map(e=>({tick:e.tick,participants:e.participants,injury:e.injury}));
  runs.push({seed,rating,ability,mode,phase:i%2?'variable-first':'steady-first',choices,burst,status:result.status,place:player?.place??null,finishTimeSeconds:player?.crossingTimeSeconds??null,contact,injuryTargets:result.injuryTargets});
 }
} catch(error){failure=String(error?.stack??error);}
await handle.writeFile(JSON.stringify({version:'plan55-headroom/v1',shard,calls,runs,failure}));await handle.close();
process.stdout.write(JSON.stringify({shard,calls,runs:runs.length,failure})+'\n');if(failure)process.exitCode=1;
