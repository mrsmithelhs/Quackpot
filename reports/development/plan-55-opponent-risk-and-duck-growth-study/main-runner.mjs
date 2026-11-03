import { open, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolveSeededRace as original } from '../../../src/core/race-resolver.mjs';
import { resolveSeededRace as adapter } from './race-adapter.mjs';
import { deriveRaceRest } from '../../../src/core/race-rest.mjs';
import { rivalChoices, burstActive, ratingForRace, completeRace, assignPoint, playerContactFromResolution } from './candidate.mjs';

const cells=['A','B1','B2','C1','C2','C3','C4','C5','D'];
const check=process.argv[2]==='check';
const shard=check?0:Number(process.argv[2]);
if(!Number.isInteger(shard)||shard<0||shard>=18) throw Error('shard must be 0..17');
const out=check ? 'reports/development/plan-55-opponent-risk-and-duck-growth-study/main-results/integration-check.json' : `reports/development/plan-55-opponent-risk-and-duck-growth-study/main-results/shard-${String(shard).padStart(2,'0')}.json`;
const handle=await open(out,'wx');
const sha = async file => createHash('sha256').update(await readFile(file)).digest('hex');
let calls=0; const runs=[]; let failure=null;
try {
  const pins=(await readFile('reports/development/plan-55-opponent-risk-and-duck-growth-study/core-source-pins.txt','utf8')).trim().split(/\r?\n/);
  for(const line of pins) {const [hash,path]=line.split(/  /);if(await sha(path)!==hash)throw Error(`source drift: ${path}`);}
  for(let index=check?4:shard*16;index<(check?5:(shard+1)*16);index++) {
    const seedIndex=Math.floor(index/18), within=index%18, rosterSize=within<9?1:3, cell=cells[within%9];
    const seed=`plan55-${String(seedIndex).padStart(3,'0')}`;
    const ids=rosterSize===1?['duck-0']:['duck-0','duck-1','duck-3'];
    let state={ducks:Object.fromEntries(ids.map(id=>[id,{injured:false,completed:0,banked:0,ability:null}])),events:[]};
    const history=[], races=[];
    for(let opportunity=0;opportunity<6;opportunity++) {
      const raceId=`R${String(opportunity+1).padStart(2,'0')}`, duckId=cell==='D'?ids[opportunity%ids.length]:ids[0];
      const stance=['B2','C4','C5'].includes(cell)?'sprint':'steady';
      const growth=['C1','C2','C3','C4','C5','D'].includes(cell), injury=['C2','C3','C4','C5','D'].includes(cell);
      const ability=['C3','C5'].includes(cell)?'guard':'burst';
      if(growth && state.ducks[duckId].banked===1) state=assignPoint(state,duckId,ability);
      const duck=state.ducks[duckId], rest=deriveRaceRest(history,duckId).restFactor;
      const active=growth && burstActive(seed,raceId,duckId,duck);
      const rating=ratingForRace(10,rest,injury && duck.injured,active);
      const field=cell==='A'?'current':((opportunity+seedIndex)%2===0?'mostly-steady':'mostly-variable');
      const probability=field==='current'?null:field==='mostly-steady'?0.2:0.8;
      const input={seed,raceId,playerBaseSpeed:rating,restFactor:rest,fieldBaseSpeed:opportunity===0?8:11.2,choice:stance,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1};
      if(cell!=='A') input.candidateRivalChoices=rivalChoices(seed,raceId,probability);
      calls++; const result=(cell==='A'?original:adapter)(input);
      const player=result.finish.find(x=>x.id==='P');
      const status=result.status==='finished' && result.finish.length===6 && player?.place?'finished':'unresolved';
      const contact=playerContactFromResolution(result);
      const participants=result.eventRecords.filter(e=>e.type==='duck-contact').map(e=>e.participants);
      const assignedBefore=duck.ability; const completedBefore=duck.completed;
      if(status==='finished') {
        history.push({type:'race_result',seq:history.length+1,payload:{duckId}});
        if(growth) state=completeRace(state,{status,duckId,stance,playerContact:injury && contact,seed,raceId});
      }
      const event=growth&&status==='finished'?state.events.at(-1):null;
      races.push({opportunity:opportunity+1,field,probability,rivalChoices:input.candidateRivalChoices??null,duckId,stance,status,place:player?.place??null,payout:player?.payout??null,rest,effectiveInput:rating,sampledPerformance:result.entrants.find(e=>e.id==='P').sampledPerformance,contactParticipants:participants,injuredBefore:injury&&duck.injured,burstActive:active,playerContact:contact,injuryEligible:event?.injuryRollEligible??false,injuryProbability:injury?(event?.injuryProbability??null):null,newInjury:event?.newInjury??false,extended:event?.extended??false,completedBefore,completedAfter:state.ducks[duckId].completed,bankedAfter:state.ducks[duckId].banked,assignedBefore,assignedAfter:state.ducks[duckId].ability});
    }
    runs.push({index,seed,phase:seedIndex%2===0?'steady-first':'variable-first',rosterSize,cell,races});
    if(check) {
      if(calls!==6 || races[0].rest!==1 || races[1].rest!==0.5) throw Error('integration rest invariant failed');
      if(races.slice(0,3).some(r=>r.assignedBefore || r.burstActive) || races[2].bankedAfter!==1 || races[3].assignedBefore!=='burst') throw Error('integration earned point invariant failed');
      for(const r of races) if(r.status==='finished' && r.injuryEligible!==r.playerContact) throw Error('integration contact eligibility mismatch');
    }
  }
} catch(error) {failure=String(error?.stack??error);}
const output={version:'plan55-main/v1',shard,calls,runs,failure};
await handle.writeFile(JSON.stringify(output));await handle.close();
process.stdout.write(JSON.stringify({shard,calls,completedRuns:runs.length,failure})+'\n');
if(failure) process.exitCode=1;



