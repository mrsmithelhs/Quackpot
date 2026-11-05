import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine} from './game-engine.mjs';
import {validateSchema6WithCandidates} from './life-replay.mjs';
test('Messages start policy is isolated and replay checks delivery/read prefix',()=>{
 const e=new GameEngine('messages-policy',{lifePolicy:'five-slot-v1',raceV2:true,messagesPolicy:true});e.start();
 const env=e.toEnvelope();assert.equal(env.messagesPolicy,'messages-v1');assert.equal(env.eventLog[0].payload.messagesPolicy,'messages-v1');
 const delivery=env.eventLog.find(x=>x.type==='message_delivered');assert.ok(delivery);
 assert.equal(e.readMessage(delivery.payload.id,1),true);assert.equal(e.readMessage(delivery.payload.id,1),false);
 assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
 const missing=structuredClone(e.toEnvelope());missing.eventLog=missing.eventLog.filter(x=>!x.type.startsWith('message_'));assert.ok(validateSchema6WithCandidates(missing,[]).some(x=>x.includes('delivery')));
 const tampered=e.toEnvelope();tampered.messagesPolicy='unknown';assert.ok(validateSchema6WithCandidates(tampered,[]).some(x=>x.includes('policy')));
 const ahead=structuredClone(e.toEnvelope());ahead.eventLog.splice(1,0,ahead.eventLog.pop());assert.ok(validateSchema6WithCandidates(ahead,[]).length);
 const old=new GameEngine('old-policy',{lifePolicy:'five-slot-v1',raceV2:true});old.start();assert.equal(old.toEnvelope().messagesPolicy,undefined);assert.equal(old.readMessage('work:shift:1',1),false);assert.deepEqual(validateSchema6WithCandidates(old.toEnvelope(),[]),[]);
 assert.throws(()=>new GameEngine('bad',{lifePolicy:'five-slot-v1',messagesPolicy:true}));
});


test('work read preserves schedule and survives a real five-slot action',()=>{
 const e=new GameEngine('messages-work',{lifePolicy:'five-slot-v1',raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();
 const before={cash:e.state.cash,day:e.state.day,rng:e.rngRace.serialize()};assert.equal(e.readMessage('work:shift:1',1),true);
 assert.deepEqual({cash:e.state.cash,day:e.state.day,rng:e.rngRace.serialize()},before);
 const p=e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'skip',operationId:'breakfast'}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);
 assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
});

test('schema6 session saves and reloads read state while preserving the separate default key',async()=>{
 const {createSchema6Session,STORAGE_KEY,SCHEMA6_STORAGE_KEY}=await import('./storage.mjs');
 const map=new Map([[STORAGE_KEY,'owner-sentinel']]);const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const e=new GameEngine('messages-storage',{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:true});e.start();
 const session=createSchema6Session(storage);assert.equal((await session.bindNew(e)).success,true);assert.equal(e.readMessage('work:shift:1',1),true);assert.equal(session.save(e).success,true);
 const restored=await createSchema6Session(storage).load();assert.equal(restored.valid,true,JSON.stringify(restored.errors));assert.equal(restored.engine.messagesPolicy,'messages-v1');assert.equal(restored.engine.readMessage('work:shift:1',1),false);assert.equal(map.get(STORAGE_KEY),'owner-sentinel');
 const saved=map.get(SCHEMA6_STORAGE_KEY);const malformed=JSON.parse(saved);malformed.messagesPolicy='bad';map.set(SCHEMA6_STORAGE_KEY,JSON.stringify(malformed));const failed=await createSchema6Session(storage).load();assert.equal(failed.valid,false);assert.equal(map.get(SCHEMA6_STORAGE_KEY),JSON.stringify(malformed));assert.equal(map.get(STORAGE_KEY),'owner-sentinel');
});

