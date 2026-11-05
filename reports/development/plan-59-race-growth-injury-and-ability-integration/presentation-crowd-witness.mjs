// One fixed, real engine/scheduler/worker history; no seed search or altered rules.
import assert from 'node:assert/strict';
import {Worker as Thread} from 'node:worker_threads';
import {writeFile} from 'node:fs/promises';
import {GameEngine} from '../../../src/core/game-engine.mjs';
import {createSchema6Session,SCHEMA6_STORAGE_KEY,STORAGE_KEY} from '../../../src/core/storage.mjs';
class WorkerAdapter{constructor(){this.thread=new Thread(new URL('./final-evidence/worker-node-adapter.mjs',import.meta.url));this.thread.on('message',data=>this.onmessage?.({data}));this.thread.on('error',error=>this.onerror?.(error));}postMessage(v){this.thread.postMessage(v);}terminate(){void this.thread.terminate();}}
globalThis.Worker=WorkerAdapter;
const bankedOnly=process.argv[2]==='banked';
const out='reports/development/plan-59-race-growth-injury-and-ability-integration/presentation-crowd-witness',values=new Map([[STORAGE_KEY,'schema-five-sentinel']]);
const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
const engine=new GameEngine('schema6-six-races',{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true});engine.start();engine.setupCompanion();
const session=createSchema6Session(storage);assert.equal((await session.bindNew(engine)).success,true);let seq=0;
const act=action=>{const p=engine.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`crowd-${++seq}`}});assert.equal(p.ok,true,JSON.stringify(p));assert.equal(engine.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
const work=()=>{assert.equal(engine.beginStoryWork('agree').ok,true);const id=engine.state.life.story47.id;assert.ok(engine.showLifeStory47(id,'commute'));assert.equal(engine.applyFiveSlotWorkStory({type:'advance',id,operationId:`crowd-${++seq}`},engine.log.length).ok,true);assert.ok(engine.showLifeStory47(id,'work'));assert.equal(engine.applyFiveSlotWorkStory({type:'complete',id,operationId:`crowd-${++seq}`,confirmed:true},engine.log.length).ok,true);assert.equal(engine.applyFiveSlotWorkStory({type:'dismiss',id,operationId:`crowd-${++seq}`},engine.log.length).ok,true);};
const results=[];for(let day=1;day<=2;day++){
 act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});if(day===1){assert.equal(engine.openLifeApp(),true);assert.ok(engine.commitPromotionalTenPull());engine.revealAllPending();}
 for(let offset=0;offset<2;offset++){
  const number=(day-1)*2+offset+1,operationId=`six-race-${number}`,options={operationId};
  if(offset){const p=engine.prepareFiveSlotPlay('race',{operationId,extend:true});assert.equal(p.ok,true,JSON.stringify(p));if(p.proposal.schedule.disclosures.length)assert.ok(engine.recordFiveSlotPlayWarningShown(p.proposal));Object.assign(options,{confirmNext:true,confirmConsequences:true});}
  const race=await engine.runRaceV2(number,engine.state.owned[0],'safe',options);assert.ok(race);assert.equal(session.save(engine).success,true);
  if(number===2){if(bankedOnly){assert.equal(engine.state.raceGrowth.ducks[engine.state.owned[0]].banked,1);await writeFile(`${out}-banked.json`,values.get(SCHEMA6_STORAGE_KEY),{flag:'wx'});console.log(JSON.stringify({bankedDuck:engine.state.owned[0],bytes:Buffer.byteLength(values.get(SCHEMA6_STORAGE_KEY))}));process.exit(0);}assert.equal(engine.assignRaceV2Ability(engine.state.owned[0],'crowd'),true);assert.equal(session.save(engine).success,true);await writeFile(`${out}-before.json`,values.get(SCHEMA6_STORAGE_KEY),{flag:'wx'});}
  if(number===3)await writeFile(`${out}-after.json`,values.get(SCHEMA6_STORAGE_KEY),{flag:'wx'});
  results.push({number,status:race.status,events:engine.state.raceResolutions[race.raceId].facts.events.filter(e=>e.kind.startsWith('ability-'))});
 }
 if(day<2)act({type:'complete',activityId:engine.state.life.schedule.active.id});
}
const raw=values.get(SCHEMA6_STORAGE_KEY),restore=await createSchema6Session(storage).load();assert.equal(restore.valid,true,JSON.stringify(restore.errors));assert.equal(values.get(STORAGE_KEY),'schema-five-sentinel');
await writeFile(`${out}-save.json`,raw,{flag:'wx'});await writeFile(`${out}-summary.json`,JSON.stringify({seed:'schema6-six-races',ability:'crowd',duck:engine.state.owned[0],results,schema5Preserved:true},null,2),{flag:'wx'});console.log(JSON.stringify({results,bytes:Buffer.byteLength(raw)}));
