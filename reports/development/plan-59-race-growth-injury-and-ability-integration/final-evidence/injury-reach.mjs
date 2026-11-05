import assert from 'node:assert/strict';
import {Worker as Thread} from 'node:worker_threads';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {GameEngine} from '../../../../src/core/game-engine.mjs';
import {createSchema6Session,SCHEMA6_STORAGE_KEY,STORAGE_KEY} from '../../../../src/core/storage.mjs';

class WorkerAdapter {
  constructor(){this.thread=new Thread(new URL('./worker-node-adapter.mjs',import.meta.url));this.thread.on('message',data=>this.onmessage?.({data}));this.thread.on('error',error=>this.onerror?.(error));this.thread.on('messageerror',error=>this.onmessageerror?.(error));}
  postMessage(value){this.thread.postMessage(value);}
  terminate(){void this.thread.terminate();}
}
globalThis.Worker=WorkerAdapter;
const retry=process.argv[2]==='retry-11';const shard=retry?4:Number(process.argv[2]);assert.ok(Number.isInteger(shard)&&shard>=1&&shard<=4);
const dir='reports/development/plan-59-race-growth-injury-and-ability-integration/final-evidence/reachability-results';await mkdir(dir,{recursive:true});
for(let i=retry?11:(shard-1)*3+1;i<=(retry?11:shard*3);i++){
  const seed=`plan59-injury-reach-${String(i).padStart(2,'0')}`;let engine=new GameEngine(seed,{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true});engine.start();engine.setupCompanion();
  const values=new Map([[STORAGE_KEY,'owner-schema-five']]);const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  let session=createSchema6Session(storage);assert.equal((await session.bindNew(engine)).success,true);let seq=0;
  const act=action=>{const p=engine.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`reach-${++seq}`}});assert.equal(p.ok,true,JSON.stringify(p));assert.equal(engine.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
  const work=()=>{assert.equal(engine.beginStoryWork('agree').ok,true);const id=engine.state.life.story47.id;assert.ok(engine.showLifeStory47(id,'commute'));assert.equal(engine.applyFiveSlotWorkStory({type:'advance',id,operationId:`reach-${++seq}`},engine.log.length).ok,true);assert.ok(engine.showLifeStory47(id,'work'));assert.equal(engine.applyFiveSlotWorkStory({type:'complete',id,operationId:`reach-${++seq}`,confirmed:true},engine.log.length).ok,true);assert.equal(engine.applyFiveSlotWorkStory({type:'dismiss',id,operationId:`reach-${++seq}`},engine.log.length).ok,true);};
  act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});assert.equal(engine.openLifeApp(),true);assert.ok(engine.commitPromotionalTenPull());engine.revealAllPending();
  const duck=engine.state.owned[0],race=await engine.runRaceV2(1,duck,'safe',{operationId:`reach-race-${i}`});assert.ok(race);assert.equal(session.save(engine).success,true);
  const growth=structuredClone(engine.state.raceGrowth.ducks[duck]);const record=engine.state.raceResolutions.R01;
  const result={seed,duck,status:race.status,unresolvedReason:race.unresolvedReason??null,growth,injuries:record.facts.injuries,actions:'breakfast, tutorial work, dinner, promotional pull, first owned duck, safe stance, race'};
  if(retry)assert.deepEqual(result,JSON.parse(await readFile(`${dir}/${seed}.json`,'utf8')));else await writeFile(`${dir}/${seed}.json`,JSON.stringify(result,null,2),{flag:'wx'});console.log(JSON.stringify(result));
  if(growth?.recoveryDays>0){
    const recovery=[{day:engine.state.life.schedule.day,days:growth.recoveryDays}];
    for(let day=0;day<2;day++){
      if(day===0){act({type:'complete',activityId:engine.state.life.schedule.active.id});act({type:'sleep'});}
      else {act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});act({type:'start',kind:'early-bed'});act({type:'complete',activityId:engine.state.life.schedule.active.id});}
      assert.equal(session.save(engine).success,true);session=createSchema6Session(storage);const loaded=await session.load();assert.equal(loaded.valid,true,JSON.stringify(loaded.errors));engine=loaded.engine;recovery.push({day:engine.state.life.schedule.day,days:engine.state.raceGrowth.ducks[duck].recoveryDays});
    }
    assert.deepEqual(recovery.map(x=>x.days),[2,1,0]);assert.equal(values.get(STORAGE_KEY),'owner-schema-five');
    await writeFile(`${dir}/injury-recovery-save.json`,values.get(SCHEMA6_STORAGE_KEY),{flag:'wx'});await writeFile(`${dir}/injury-recovery-summary.json`,JSON.stringify({seed,duck,recovery,schema5Preserved:true},null,2),{flag:'wx'});console.log(JSON.stringify({recovery}));break;
  }
}
