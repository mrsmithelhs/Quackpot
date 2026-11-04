import { open } from 'node:fs/promises';
import { createRng } from '../../../src/core/prng.mjs';
import { deriveRaceRest } from '../../../src/core/race-rest.mjs';
import { resolveSeededRace } from './follow-on-adapter.mjs';
import { selectFavorite, updateAfterRace, chooseRivals } from './follow-on-state.mjs';
import { burstActive } from './candidate.mjs';
const cells=[['favorite','none','post-race'],['favorite','burst','post-race'],['favorite','guard','post-race'],['favorite','none','same-race'],['favorite','burst','same-race'],['favorite','guard','same-race'],['favorite','none','off'],['rotate','none','post-race'],['rotate','burst','post-race'],['rotate','guard','post-race'],['rotate','none','same-race'],['rotate','burst','same-race'],['rotate','guard','same-race'],['rotate','none','off']];
const shard=Number(process.argv[2]);if(!Number.isInteger(shard)||shard<0||shard>=14)throw Error('shard 0..13 required');
const path=`reports/development/plan-55-opponent-risk-and-duck-growth-study/follow-on-results/progression-${String(shard).padStart(2,'0')}.json`;
const handle=await open(path,'wx');let calls=0;const runs=[];let failure=null;
try {
 for(let index=shard*8;index<shard*8+8;index++) {
  const si=Math.floor(index/14),[policy,ability,mode]=cells[index%14],seed=`p55p-${String(si).padStart(3,'0')}`;
  const owned=['duck-0','duck-1','duck-3'],rivals=['r0','r1','r2','r3','r4','r5'];
  let state={ducks:Object.fromEntries([...owned,...rivals].map(id=>[id,{injured:false,completed:0,banked:0,ability:null}])),events:[],committed:[]};
  const history=[],races=[];
  for(let opportunity=0;opportunity<12;opportunity++) {
   const raceId=`R${String(opportunity+1).padStart(2,'0')}`;
   const priorState=state; state=structuredClone(state);
   const options=Object.fromEntries(owned.map(id=>[id,{rating:10,rest:deriveRaceRest(history,id).restFactor,injured:state.ducks[id].injured}]));
   const duckId=policy==='favorite'?selectFavorite(options,'duck-0'):owned[opportunity%3],duck=state.ducks[duckId];
   const rest=options[duckId].rest,priorInjury=duck.injured;
   if(mode!=='off'&&ability!=='none'&&duck.banked===1){duck.banked=0;duck.ability=ability;}
   const active=mode!=='off'&&burstActive(seed,raceId,duckId,duck);
   const playerInput=(10+(active?1:0))*rest*(priorInjury ? 0.9 : 1);
   const rotation=[...rivals.slice(opportunity%6),...rivals.slice(0,opportunity%6)];
   const field=chooseRivals(Object.fromEntries(rivals.map(id=>[id,state.ducks[id]])),rotation);
   const slots=['A','B','C','D','E'],probability=(opportunity+si)%2===0?.2:.8;
   const choices=Object.fromEntries(field.map(id=>[id,createRng(seed).fork(`plan55-follow/v1/${raceId}/${id}/stance`).next()<probability?'sprint':'steady']));
   const slotMap=Object.fromEntries(slots.map((slot,i)=>[slot,field[i]]));
   const entrantState={P:{stableId:duckId,stance:'steady',guard:duck.ability==='guard',injuredBefore:priorInjury}};
   const ratings={},slotChoices={};
   for(const slot of slots){const id=slotMap[slot];entrantState[slot]={stableId:id,stance:choices[id],guard:false,injuredBefore:state.ducks[id].injured};ratings[slot]=(opportunity===0?8:11.2)*(state.ducks[id].injured ? 0.9 : 1);slotChoices[slot]=choices[id];}
   const input={seed,raceId,playerBaseSpeed:playerInput,restFactor:rest,fieldBaseSpeed:opportunity===0?8:11.2,choice:'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:slotChoices,followOn:{mode,entrants:entrantState,ratings}};
   calls++;const result=resolveSeededRace(input),player=result.finish.find(e=>e.id==='P');
   const finished=result.status==='finished'&&result.finish.length===6&&Boolean(player?.place);
   const contact=result.eventRecords.filter(e=>e.type==='duck-contact').map(e=>({tick:e.tick,participants:e.participants.map(id=>id==='P'?duckId:slotMap[id]),rolls:(e.injury??[]).map(v=>({id:v.stableId,key:v.key,p:v.probability,value:v.value,injured:v.injured,sameRaceApplied:v.sameRaceApplied}))}));
   const pre={injured:priorInjury,rest,completed:duck.completed,banked:duck.banked,ability:duck.ability};
   if(!finished){state=priorState;races.push({opportunity:opportunity+1,raceId,status:'unresolved',reason:result.unresolvedReason,duckId,pre,field,choices,contact});break;}
   const updates=contact.flatMap(c=>c.rolls);
   state=updateAfterRace(state,{status:'finished',seed,raceId,field:[duckId,...field],contact:updates});
   const after=state.ducks[duckId];after.completed++;
   if(mode!=='off'&&after.completed===3)after.banked=1;
   history.push({type:'race_result',seq:history.length+1,payload:{duckId}});
   races.push({opportunity:opportunity+1,raceId,status:'finished',duckId,pre,post:{injured:after.injured,completed:after.completed,banked:after.banked,ability:after.ability},favoriteChosen:duckId==='duck-0',playerInput,burst:active,place:player.place,payout:player.payout,probability,field,knownInjury:Object.fromEntries(field.map(id=>[id,entrantState[slots[field.indexOf(id)]].injuredBefore])),choices,contact,updates:state.events.filter(e=>e.raceId===raceId),injuryTargets:result.injuryTargets});
  }
  runs.push({index,seed,phase:si%2?'variable-first':'steady-first',policy,ability,mode,races,committed:state.committed});
 }
} catch(error){failure=String(error?.stack??error);}
await handle.writeFile(JSON.stringify({version:'plan55-progression/v1',shard,calls,runs,failure}));await handle.close();
process.stdout.write(JSON.stringify({shard,calls,runs:runs.length,failure})+'\n');if(failure)process.exitCode=1;


