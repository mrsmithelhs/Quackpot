import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {GameEngine} from '../game-engine.mjs';
import {initialRaceProgress} from '../race-progression.mjs';
import {resolveIntegerRace} from './integer-kernel.mjs';
import {getReferenceTable} from './reference-policy.mjs';
import {encodeResult} from './codec.mjs';
import {compactFromEnvelope,reconstruct} from './persistence.mjs';
import {createSchema6Session,SCHEMA6_STORAGE_KEY,STORAGE_KEY} from '../storage.mjs';
import {EventLog,verifyChain} from '../event-log.mjs';
import {invalidateForSchema6StorageEvent} from './storage-invalidation.mjs';
const witness=new URL('../../../reports/development/plan-52-five-slot-production-transition/session-panel-witness-attempt3/resolved-panel.save.json',import.meta.url);
class TestWorker{postMessage(data){queueMicrotask(async()=>{try{let candidate;if(data.mode==='restore')candidate=await reconstruct(data.record);else{const envelope=await encodeResult(resolveIntegerRace(data.input,getReferenceTable()));candidate={envelope,compact:await compactFromEnvelope(envelope)};}
  this.onmessage({data:{kind:'complete',requestId:data.requestId,context:data.context,candidate}});}catch(error){this.onmessage({data:{kind:'failure',requestId:data.requestId,context:data.context,error:{name:error.name}}});}});}terminate(){}}
test('schema-6 owned draft commits genuine worker candidate once',async()=>{
  const original=globalThis.Worker;globalThis.Worker=TestWorker;
  try{const env=JSON.parse(readFileSync(witness,'utf8'));env.schemaVersion=6;env.state.raceGrowth=initialRaceProgress();const engine=GameEngine.fromEnvelope(env);
    const race=await engine.runRaceV2(1,engine.state.owned[0],'safe');assert.ok(race);assert.equal(race.status,'finished');
    assert.equal(engine.state.completedRaces.length,1);assert.equal(engine.toEnvelope().schemaVersion,6);
    const count=engine.log.length,again=await engine.runRaceV2(1,engine.state.owned[0],'safe');assert.equal(again.raceId,race.raceId);assert.equal(engine.log.length,count);
  }finally{globalThis.Worker=original;}
});

test('cancel and stale epoch publish no race draft',async()=>{
  const original=globalThis.Worker;let worker;
  class HeldWorker extends TestWorker{constructor(){super();worker=this;}postMessage(data){this.data=data;}release(){super.postMessage(this.data);}}
  globalThis.Worker=HeldWorker;
  try{
    const fixture=()=>{const env=JSON.parse(readFileSync(witness,'utf8'));env.schemaVersion=6;env.state.raceGrowth=initialRaceProgress();return GameEngine.fromEnvelope(env);};
    let engine=fixture(),before=JSON.stringify(engine.state),length=engine.log.length,pending=engine.runRaceV2(1,engine.state.owned[0],'safe');
    engine.cancelRaceV2();await assert.rejects(pending,/canceled/);assert.equal(JSON.stringify(engine.state),before);assert.equal(engine.log.length,length);
    engine=fixture();length=engine.log.length;pending=engine.runRaceV2(1,engine.state.owned[0],'safe');engine.state.down++;worker.release();
    assert.equal(await pending,null);assert.equal(engine.log.length,length);assert.deepEqual(engine.state.raceAttempts,{});
  }finally{globalThis.Worker=original;}
});

test('cancel after claim blocks late decode and old cleanup cannot clear a newer operation',async()=>{
  const oldWorker=globalThis.Worker,cryptoDescriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto'),nativeCrypto=globalThis.crypto;
  let armed=false,held=false,releaseDigest,notifyReached,created=0;
  const gate=new Promise(resolve=>{releaseDigest=resolve;}),reached=new Promise(resolve=>{notifyReached=resolve;});
  class GatedWorker extends TestWorker{constructor(){super();this.number=created++;}postMessage(data){if(this.number===0)super.postMessage(data);else this.waiting=data;}terminate(){if(this.number===0)armed=true;}}
  const wrapped=Object.create(nativeCrypto);Object.defineProperty(wrapped,'subtle',{value:{digest:async(...args)=>{if(armed&&!held){held=true;notifyReached();await gate;}return nativeCrypto.subtle.digest(...args);}}});
  globalThis.Worker=GatedWorker;Object.defineProperty(globalThis,'crypto',{configurable:true,value:wrapped});
  try{
    const env=JSON.parse(readFileSync(witness,'utf8'));env.schemaVersion=6;env.state.raceGrowth=initialRaceProgress();const engine=GameEngine.fromEnvelope(env);
    const snapshot=()=>JSON.stringify({state:engine.state,log:engine.log.entries,rng:engine.rngRace.serialize()}),before=snapshot();
    const first=engine.runRaceV2(1,engine.state.owned[0],'safe');await reached;engine.cancelRaceV2();
    const second=engine.runRaceV2(1,engine.state.owned[0],'safe');releaseDigest();assert.equal(await first,null);
    assert.equal(await engine.runRaceV2(1,engine.state.owned[0],'safe'),null,'newer operation remains pending');
    engine.cancelRaceV2();await assert.rejects(second,/canceled/);assert.equal(snapshot(),before);
  }finally{releaseDigest();globalThis.Worker=oldWorker;Object.defineProperty(globalThis,'crypto',cryptoDescriptor);}
});

test('cross-tab invalidation after claim cancels the late result and preserves both storage keys',async()=>{
  const oldWorker=globalThis.Worker,cryptoDescriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto'),nativeCrypto=globalThis.crypto;
  let armed=false,held=false,releaseDigest,notifyReached;const gate=new Promise(resolve=>{releaseDigest=resolve;}),reached=new Promise(resolve=>{notifyReached=resolve;});
  class GatedWorker extends TestWorker{terminate(){armed=true;}}
  const wrapped=Object.create(nativeCrypto);Object.defineProperty(wrapped,'subtle',{value:{digest:async(...args)=>{if(armed&&!held){held=true;notifyReached();await gate;}return nativeCrypto.subtle.digest(...args);}}});
  globalThis.Worker=GatedWorker;Object.defineProperty(globalThis,'crypto',{configurable:true,value:wrapped});
  try{
    const env=JSON.parse(readFileSync(witness,'utf8'));env.schemaVersion=6;env.state.raceGrowth=initialRaceProgress();const engine=GameEngine.fromEnvelope(env);
    const data=new Map([[STORAGE_KEY,'schema-five']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
    const session=createSchema6Session(storage);assert.deepEqual(await session.bindNew(engine),{success:true});assert.deepEqual(session.save(engine),{success:true});
    const raw=data.get(SCHEMA6_STORAGE_KEY),before=JSON.stringify({state:engine.state,log:engine.log.entries,rng:engine.rngRace.serialize()});
    const pending=engine.runRaceV2(1,engine.state.owned[0],'safe');await reached;
    assert.equal(invalidateForSchema6StorageEvent({key:'other'},session,engine),false);
    assert.equal(invalidateForSchema6StorageEvent({key:SCHEMA6_STORAGE_KEY},session,engine),true);releaseDigest();assert.equal(await pending,null);
    assert.equal(JSON.stringify({state:engine.state,log:engine.log.entries,rng:engine.rngRace.serialize()}),before);assert.equal(engine.autosaveEnabled,false);
    assert.equal(data.get(SCHEMA6_STORAGE_KEY),raw);assert.equal(data.get(STORAGE_KEY),'schema-five');assert.equal(session.save(engine).success,false);
  }finally{releaseDigest();globalThis.Worker=oldWorker;Object.defineProperty(globalThis,'crypto',cryptoDescriptor);}
});

test('actual engine day transitions decrement a synthetic preexisting injury once per day',()=>{
  const engine=new GameEngine('schema6-day-hook',{lifePolicy:'five-slot-v1',raceV2:true});engine.start();engine.setupCompanion();
  engine.state.raceGrowth.ducks['duck-0']={progress:0,banked:0,assigned:null,recoveryDays:2,firstPointEarned:false};let sequence=0;
  const act=action=>{const p=engine.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`day-hook-${++sequence}`}});assert.equal(p.ok,true,JSON.stringify(p));
    const result=engine.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(result.ok,true,JSON.stringify(result));};
  for(let day=1;day<=2;day++){
    act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:engine.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
    assert.equal(engine.state.raceGrowth.ducks['duck-0'].recoveryDays,3-day);
    act({type:'start',kind:'early-bed'});act({type:'complete',activityId:engine.state.life.schedule.active.id});
    assert.equal(engine.state.life.schedule.day,day+1);assert.equal(engine.state.raceGrowth.ducks['duck-0'].recoveryDays,2-day);
  }
});

test('schema-6 private prefix validates fresh race and isolated full restore',async()=>{
  const original=globalThis.Worker;globalThis.Worker=TestWorker;
  const values=new Map([[STORAGE_KEY,'owner-schema-five']]);const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  try{
    const env=JSON.parse(readFileSync(witness,'utf8'));env.schemaVersion=6;env.state.raceGrowth=initialRaceProgress();const engine=GameEngine.fromEnvelope(env),session=createSchema6Session(storage);
    assert.deepEqual(await session.bindNew(engine),{success:true});assert.deepEqual(session.save(engine),{success:true});
    assert.ok(await engine.runRaceV2(1,engine.state.owned[0],'safe'));assert.deepEqual(session.save(engine),{success:true});
    const stored=values.get(SCHEMA6_STORAGE_KEY);assert.equal(values.get(STORAGE_KEY),'owner-schema-five');
    const originalRecord=engine.state.raceResolutions.R01;const changed=structuredClone(originalRecord);changed.facts.injuries[0].injured=!changed.facts.injuries[0].injured;engine.state.raceResolutions.R01=changed;
    assert.equal(session.save(engine).success,false);assert.equal(values.get(SCHEMA6_STORAGE_KEY),stored);engine.state.raceResolutions.R01=originalRecord;
    const originalSet=storage.setItem;storage.setItem=()=>{throw Error('quota');};assert.equal(session.save(engine).success,false);assert.equal(values.get(SCHEMA6_STORAGE_KEY),stored);storage.setItem=originalSet;
    const restored=await createSchema6Session(storage).load();assert.equal(restored.valid,true,JSON.stringify(restored.errors));
    assert.equal(restored.engine.state.completedRaces.length,1);assert.equal(values.get(SCHEMA6_STORAGE_KEY),stored);
    globalThis.Worker=class {postMessage(){queueMicrotask(()=>this.onerror());}terminate(){}};
    const unavailable=await createSchema6Session(storage).load();assert.equal(unavailable.unavailable,true);assert.equal(unavailable.isCorrupt,false);assert.equal(values.get(SCHEMA6_STORAGE_KEY),stored);globalThis.Worker=TestWorker;
    for(const tamper of ['input','facts','digest','effect']){
      const forged=JSON.parse(stored),record=forged.state.raceResolutions.R01;
      if(tamper==='input')record.input.seed='different';
      if(tamper==='facts')record.facts.injuries[0].injured=!record.facts.injuries[0].injured;
      if(tamper==='digest')record.digest='0'.repeat(64);
      if(tamper==='effect'){
        const entry=forged.eventLog.find(e=>e.type==='race_result');entry.payload.place=entry.payload.place===1?2:1;
        forged.state.raceAttempts[1].place=entry.payload.place;forged.state.raceResults[1].place=entry.payload.place;forged.state.lastRaceResult.place=entry.payload.place;
        const log=new EventLog();for(const e of forged.eventLog)log.append(e.type,e.payload,e.clock);forged.eventLog=log.entries;assert.equal(verifyChain(forged.eventLog),true);
      }
      values.set(SCHEMA6_STORAGE_KEY,JSON.stringify(forged));const rejected=await createSchema6Session(storage).load();assert.equal(rejected.valid,false,tamper);assert.equal(rejected.isCorrupt,true,tamper);
    }
    values.set(SCHEMA6_STORAGE_KEY,stored);
    values.set(SCHEMA6_STORAGE_KEY,'externally changed');assert.equal(session.save(engine).success,false);assert.equal(values.get(STORAGE_KEY),'owner-schema-five');
  }finally{globalThis.Worker=original;}
});

test('unsupported schema-6 namespace data remains untouched',async()=>{
  const data=new Map([[SCHEMA6_STORAGE_KEY,'{"schemaVersion":999,"unknown":true}'],[STORAGE_KEY,'schema-five']]);
  const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const session=createSchema6Session(storage),result=await session.load();assert.equal(result.unsupportedDevelopment,true);assert.equal(result.isCorrupt,false);
  assert.equal(data.get(STORAGE_KEY),'schema-five');assert.equal(data.get(SCHEMA6_STORAGE_KEY),'{"schemaVersion":999,"unknown":true}');
  const env=JSON.parse(readFileSync(witness,'utf8'));env.schemaVersion=6;env.state.raceGrowth=initialRaceProgress();const fresh=GameEngine.fromEnvelope(env);
  const set=storage.setItem;storage.setItem=()=>{throw Error('quota');};assert.equal((await session.replacePreserved(fresh)).success,false);
  assert.equal(data.get(SCHEMA6_STORAGE_KEY),'{"schemaVersion":999,"unknown":true}');storage.setItem=set;
  assert.equal((await session.replacePreserved(fresh)).success,true);assert.equal(data.get('quackpot_save_v2_development_backup'),'{"schemaVersion":999,"unknown":true}');assert.equal(data.get(STORAGE_KEY),'schema-five');
});

test('coherently re-chained assignment day must match replayed schedule',async()=>{
  const original=globalThis.Worker;globalThis.Worker=TestWorker;
  try{
    const path='../../../reports/development/plan-59-race-growth-injury-and-ability-integration/schema6-six-race-witness-02.json';
    const env=JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
    const assignment=env.eventLog.find(e=>e.type==='action'&&e.payload?.kind==='race_ability_assigned');assert.ok(assignment);assignment.clock.day++;
    const log=new EventLog();for(const e of env.eventLog)log.append(e.type,e.payload,e.clock);env.eventLog=log.entries;assert.equal(verifyChain(env.eventLog),true);
    const raw=JSON.stringify(env),data=new Map([[SCHEMA6_STORAGE_KEY,raw]]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
    const result=await createSchema6Session(storage).load();assert.equal(result.valid,false);assert.ok(result.errors.some(e=>e.includes('Ability assignment day mismatch')),JSON.stringify(result.errors));assert.equal(data.get(SCHEMA6_STORAGE_KEY),raw);
  }finally{globalThis.Worker=original;}
});

test('six races follow real five-slot transitions and serial semantic restore',async(t)=>{
  const original=globalThis.Worker;globalThis.Worker=TestWorker;
  const values=new Map([[STORAGE_KEY,'owner-schema-five']]);const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  try{
    const engine=new GameEngine('schema6-six-races',{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true});engine.start();engine.setupCompanion();
    const session=createSchema6Session(storage);assert.deepEqual(await session.bindNew(engine),{success:true});let sequence=0;
    const act=action=>{const p=engine.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`six-${++sequence}`}});assert.equal(p.ok,true,JSON.stringify(p));
      const result=engine.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(result.ok,true,JSON.stringify(result));};
    const work=()=>{assert.equal(engine.beginStoryWork('agree').ok,true);const id=engine.state.life.story47.id;
      assert.ok(engine.showLifeStory47(id,'commute'));assert.equal(engine.applyFiveSlotWorkStory({type:'advance',id,operationId:`six-arrive-${++sequence}`},engine.log.length).ok,true);
      assert.ok(engine.showLifeStory47(id,'work'));assert.equal(engine.applyFiveSlotWorkStory({type:'complete',id,operationId:`six-work-${++sequence}`,confirmed:true},engine.log.length).ok,true);
      assert.equal(engine.applyFiveSlotWorkStory({type:'dismiss',id,operationId:`six-home-${++sequence}`},engine.log.length).ok,true);};
    const outcomes=[];for(let day=1;day<=3;day++){
      act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});
      if(day===1){assert.equal(engine.openLifeApp(),true);assert.ok(engine.commitPromotionalTenPull());engine.revealAllPending();}
      for(let offset=0;offset<2;offset++){
        const number=(day-1)*2+offset+1,operationId=`six-race-${number}`,options={operationId};
        if(offset){const preview=engine.prepareFiveSlotPlay('race',{operationId,extend:true});assert.equal(preview.ok,true,JSON.stringify(preview));
          if(preview.proposal.schedule.disclosures.length)assert.ok(engine.recordFiveSlotPlayWarningShown(preview.proposal));
          Object.assign(options,{confirmNext:true,confirmConsequences:true});}
        const race=await engine.runRaceV2(number,engine.state.owned[0],'safe',options);assert.ok(race,`race ${number}`);assert.ok(['finished','unresolved'].includes(race.status));outcomes.push({number,status:race.status,reason:race.unresolvedReason??null});
        const saved=session.save(engine);assert.equal(saved.success,true,JSON.stringify(saved));
        if(number===2){assert.equal(engine.assignRaceV2Ability(engine.state.owned[0],'bounce'),true);assert.equal(engine.assignRaceV2Ability(engine.state.owned[0],'crowd'),false);assert.equal(session.save(engine).success,true);}
      }
      if(day<3)act({type:'complete',activityId:engine.state.life.schedule.active.id});
    }
    const raw=values.get(SCHEMA6_STORAGE_KEY),progress=[];if(process.env.QP59_WRITE_SIX_WITNESS==='1')writeFileSync('reports/development/plan-59-race-growth-injury-and-ability-integration/schema6-six-race-witness-02.json',raw,{flag:'wx'});const start=performance.now();
    const restored=await createSchema6Session(storage).load({onProgress:value=>progress.push(value.completed)});
    assert.equal(restored.valid,true,JSON.stringify(restored.errors));assert.deepEqual(progress,[1,2,3,4,5,6]);assert.equal(restored.engine.state.completedRaces.length,outcomes.filter(o=>o.status==='finished').length);
    assert.equal(values.get(STORAGE_KEY),'owner-schema-five');t.diagnostic(JSON.stringify({bytes:Buffer.byteLength(raw),restoreMs:performance.now()-start,days:engine.state.life.schedule.day,outcomes}));
  }finally{globalThis.Worker=original;}
});
