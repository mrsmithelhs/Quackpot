import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine} from './game-engine.mjs';
import {EventLog,verifyChain} from './event-log.mjs';
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
 map.set(SCHEMA6_STORAGE_KEY,saved);const guarded=createSchema6Session(storage),bound=await guarded.load();assert.equal(bound.valid,true);map.set(SCHEMA6_STORAGE_KEY,'external-change');assert.equal(guarded.save(bound.engine).success,false);assert.equal(map.get(SCHEMA6_STORAGE_KEY),'external-change');assert.equal(map.get(STORAGE_KEY),'owner-sentinel');
});


test('launch delivery needs real shown evidence before read or reply, with independent acknowledgment',async()=>{
 const {messagesForEngine}=await import('./messages-runtime.mjs');const e=new GameEngine('messages-launch',{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();
 assert.ok(messagesForEngine(e).deliveries.some(m=>m.deliveryId==='launch:invitation:1'));assert.equal(e.readMessage('launch:invitation:1',1),false);assert.equal(e.replyLifeInvitation(),false);
 assert.ok(e.showLifeInvitation());assert.equal(e.readMessage('launch:invitation:1',1),true);assert.equal(e.replyLifeInvitation(),true);
 assert.equal(e.readMessage('launch:ack:1',1),false);assert.ok(e.showLifeAcknowledgment());assert.equal(e.readMessage('launch:ack:1',1),true);assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
 const bad=structuredClone(e.toEnvelope());bad.eventLog=bad.eventLog.filter(x=>x.payload?.kind!=='launch_reply_invitation');assert.ok(validateSchema6WithCandidates(bad,[]).length);
});

test('shown launch invitation reaches Receipt without a reply or award',()=>{
 const e=new GameEngine('messages-receipt',{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();
 const before={cash:e.state.cash,gems:e.state.gems,day:e.state.day,rng:e.rngDraw.serialize()};assert.ok(e.showLifeInvitation());assert.equal(e.readMessage('launch:invitation:1',1),true);
 assert.deepEqual({cash:e.state.cash,gems:e.state.gems,day:e.state.day,rng:e.rngDraw.serialize()},before);assert.ok(!e.log.entries.some(x=>x.type==='action'&&x.payload?.kind==='launch_reply'));
 e.finishRunComplete();const receipt=e.presentReceipt();assert.ok(receipt.accounting.lines.some(x=>x.text.includes('launch message invited')));assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
});

test('Ren contact appears only after actual introduction without creating an offer',async()=>{
 const {messagesForEngine}=await import('./messages-runtime.mjs');const e=new GameEngine('messages-ren',{lifePolicy:'five-slot-v1',raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();let n=0;
 const has=()=>messagesForEngine(e).deliveries.some(m=>m.deliveryId==='ren:contact:1');assert.equal(has(),false);
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`ren-setup:${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 for(let day=1;day<=2;day++){act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});if(day===1){act({type:'start',kind:'early-bed'});act({type:'complete',activityId:e.state.life.schedule.active.id});}}
 const social=action=>{const x=e.applyFiveSlotSocialAction({operationId:`ren-social:${++n}`,action},e.log.length);assert.equal(x.ok,true,JSON.stringify(x));};
 social({type:'social46_activate',version:1,revision:2});assert.equal(has(),false);social({type:'social46_knock_shown'});social({type:'social46_door_open'});
 for(const choice of ['meet','glad','continue','thanks','finish']){social({type:'social46_intro_line_shown'});social({type:'social46_intro_choose',choice});}
 const before=e.log.length;assert.equal(has(),true);assert.equal(e.log.length,before);assert.equal(e.state.life.social46.pending,null);assert.equal(messagesForEngine(e).projection.threads.find(t=>t.id==='ren').unread,false);assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
 social({type:'social46_offer',day:2,initiator:'ren',activity:'door'});const offer=messagesForEngine(e).deliveries.find(m=>m.deliveryId.startsWith('ren:offer:'));assert.ok(offer);assert.equal(e.readMessage(offer.deliveryId,1),false);
 // Synthetic due-state probe: restore the original due terms before replaying the real history.
 const originalDue=structuredClone(e.state.life.finance.rents[0].due),beforeBlockedLog=e.log.length,beforeRelationship=e.state.life.social46.relationship;e.state.life.finance.rents[0].due={day:2,slot:'morning'};
 const blocked=messagesForEngine(e).deliveries.find(m=>m.deliveryId===offer.deliveryId);assert.equal(blocked.displayBlocked,true);assert.equal(blocked.actionable,false);assert.equal(blocked.sourceDisplay,false);assert.equal(e.log.length,beforeBlockedLog);assert.equal(e.state.life.social46.relationship,beforeRelationship);
 e.state.life.finance.rents[0].due=originalDue;const cleared=messagesForEngine(e).deliveries.find(m=>m.deliveryId===offer.deliveryId);assert.equal(cleared.displayBlocked,false);assert.equal(cleared.sourceDisplay,true);assert.equal(e.log.length,beforeBlockedLog);
 const expired=GameEngine.fromEnvelope(e.toEnvelope());for(const action of [{type:'start',kind:'early-bed',operationId:'expire-bed'},{type:'complete',activityId:'auto',operationId:'expire-sleep'}]){if(action.activityId==='auto')action.activityId=expired.state.life.schedule.active.id;const p=expired.prepareFiveSlotAction({domain:'schedule',action});assert.equal(p.ok,true,JSON.stringify(p));assert.equal(expired.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);}
 const expiredRow=messagesForEngine(expired).projection.threads.find(t=>t.id==='ren').messages.find(m=>m.deliveryId===offer.deliveryId);assert.equal(expiredRow.read,false);assert.equal(expiredRow.unread,false);assert.equal(expiredRow.actionable,false);assert.deepEqual(validateSchema6WithCandidates(expired.toEnvelope(),[]),[]);
 assert.ok(expired.showRenMessageHistory(offer.deliveryId,1));assert.equal(expired.showRenMessageHistory(offer.deliveryId,1),null);assert.equal(expired.readMessage(offer.deliveryId,1),false);expired.finishRunComplete();const historyReceipt=expired.presentReceipt();assert.ok(historyReceipt.accounting.lines.some(x=>x.text.includes('prior Ren message')));assert.deepEqual(validateSchema6WithCandidates(expired.toEnvelope(),[]),[]);
 const withoutRenDelivery=env=>{const log=new EventLog();for(const entry of env.eventLog)if(!(entry.type==='message_delivered'&&entry.payload.id===offer.deliveryId))log.append(entry.type,entry.payload,entry.clock);const copy=structuredClone(env);copy.eventLog=log.entries;assert.equal(verifyChain(copy.eventLog),true);return copy;};
 const atEnd=withoutRenDelivery(e.toEnvelope());assert.ok(validateSchema6WithCandidates(atEnd,[]).some(x=>x.includes('Missing Ren delivery at end')));
 const plan=e.state.life.social46.pending;social({type:'social46_offer_shown',id:plan.id});
 const beforeNext=withoutRenDelivery(e.toEnvelope());assert.ok(validateSchema6WithCandidates(beforeNext,[]).some(x=>x.includes('Missing Ren delivery before')));assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
 const declined=GameEngine.fromEnvelope(e.toEnvelope());assert.equal(declined.applyFiveSlotSocialAction({operationId:'decline',action:{type:'social46_reply',id:plan.id,choice:'decline'}},declined.log.length).ok,true);let response=messagesForEngine(declined).deliveries.find(m=>m.deliveryId.startsWith('ren:response:'));assert.ok(response);assert.equal(declined.readMessage(response.deliveryId,1),false);assert.equal(declined.applyFiveSlotSocialAction({operationId:'response-shown',action:{type:'social46_response_shown',id:plan.id}},declined.log.length).ok,true);assert.equal(declined.readMessage(response.deliveryId,1),true);assert.equal(declined.applyFiveSlotSocialAction({operationId:'response-reply',action:{type:'social46_response_reply',id:plan.id,choice:'thanks'}},declined.log.length).ok,true);response=messagesForEngine(declined).deliveries.find(m=>m.deliveryId.startsWith('ren:response-reply:'));assert.ok(response);assert.equal(declined.readMessage(response.deliveryId,1),false);assert.equal(declined.applyFiveSlotSocialAction({operationId:'response-reply-shown',action:{type:'social46_response_reply_shown',id:plan.id}},declined.log.length).ok,true);assert.equal(declined.readMessage(response.deliveryId,1),true);assert.deepEqual(validateSchema6WithCandidates(declined.toEnvelope(),[]),[]);
 const branch=GameEngine.fromEnvelope(e.toEnvelope());const change=branch.applyFiveSlotSocialAction({operationId:'branch-suggest',action:{type:'social46_suggest_activity',id:plan.id,activity:'game'}},branch.log.length);assert.equal(change.ok,true);
 let rows=messagesForEngine(branch).projection.threads.find(t=>t.id==='ren').messages;let old=rows.find(m=>m.deliveryId===offer.deliveryId),newOffer=rows.find(m=>m.deliveryId.startsWith('ren:offer:')&&m.deliveryId!==offer.deliveryId);assert.equal(old.read,false);assert.equal(old.unread,false);assert.equal(old.actionable,false);assert.equal(newOffer.unread,true);
 assert.deepEqual(validateSchema6WithCandidates(branch.toEnvelope(),[]),[]);const restored=GameEngine.fromEnvelope(branch.toEnvelope());rows=messagesForEngine(restored).projection.threads.find(t=>t.id==='ren').messages;assert.equal(rows.find(m=>m.deliveryId===offer.deliveryId).read,false);assert.equal(rows.find(m=>m.deliveryId===offer.deliveryId).text,old.text);
 assert.equal(restored.applyFiveSlotSocialAction({operationId:'branch-shown',action:{type:'social46_offer_shown',id:plan.id}},restored.log.length).ok,true);assert.equal(restored.applyFiveSlotSocialAction({operationId:'branch-accept',action:{type:'social46_reply',id:plan.id,choice:'accept'}},restored.log.length).ok,true);rows=messagesForEngine(restored).projection.threads.find(t=>t.id==='ren').messages;assert.ok(rows.filter(m=>m.deliveryId.startsWith('ren:offer:')).every(m=>!m.unread&&!m.read&&!m.actionable));assert.deepEqual(validateSchema6WithCandidates(restored.toEnvelope(),[]),[]);
 const ack=rows.find(m=>m.deliveryId.startsWith('ren:ack:'));assert.ok(ack);assert.equal(restored.readMessage(ack.deliveryId,1),false);assert.equal(restored.applyFiveSlotSocialAction({operationId:'branch-ack',action:{type:'social46_ack_shown',id:plan.id}},restored.log.length).ok,true);assert.equal(restored.readMessage(ack.deliveryId,1),true);assert.deepEqual(validateSchema6WithCandidates(restored.toEnvelope(),[]),[]);
 assert.equal(e.readMessage(offer.deliveryId,1),true);social({type:'social46_suggest_activity',id:plan.id,activity:'game'});
 const revised=messagesForEngine(e).deliveries.find(m=>m.deliveryId.startsWith('ren:offer:') && m.actionable);assert.notEqual(revised.deliveryId,offer.deliveryId);assert.equal(e.readMessage(offer.deliveryId,1),false);assert.equal(e.readMessage(revised.deliveryId,1),false);social({type:'social46_offer_shown',id:plan.id});assert.equal(e.readMessage(revised.deliveryId,1),true);assert.deepEqual(validateSchema6WithCandidates(e.toEnvelope(),[]),[]);
 const forged=structuredClone(e.toEnvelope()),renRead=forged.eventLog.find(x=>x.type==='message_read'&&x.payload.id===revised.deliveryId);renRead.payload.id=offer.deliveryId;assert.ok(validateSchema6WithCandidates(forged,[]).some(x=>x.includes('Messages read')));
 const moved=structuredClone(e.toEnvelope()),deliveryIndex=moved.eventLog.findIndex(x=>x.type==='message_delivered'&&x.payload.id===revised.deliveryId);const [delivery]=moved.eventLog.splice(deliveryIndex,1);moved.eventLog.push(delivery);assert.ok(validateSchema6WithCandidates(moved,[]).length);
});

test('expired unseen launch remains informational without inventing a read or display',async()=>{
 const {messagesForEngine}=await import('./messages-runtime.mjs');const e=new GameEngine('messages-expiry',{lifePolicy:'five-slot-v1',raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();let n=0;
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`expiry:${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
 const row=messagesForEngine(e).projection.threads.find(t=>t.id==='launch').messages[0];assert.equal(row.read,false);assert.equal(row.unread,false);assert.equal(row.actionable,false);assert.ok(!e.log.entries.some(x=>x.payload?.kind==='launch_reply_invitation'||(x.type==='message_read'&&x.payload.id==='launch:invitation:1')));
 const restored=GameEngine.fromEnvelope(e.toEnvelope()),again=messagesForEngine(restored).projection.threads.find(t=>t.id==='launch').messages[0];assert.equal(again.read,false);assert.equal(again.text,row.text);assert.deepEqual(validateSchema6WithCandidates(restored.toEnvelope(),[]),[]);
 const display=restored.showExpiredLaunchHistory();assert.ok(display);assert.equal(restored.showExpiredLaunchHistory(),null);assert.equal(restored.readMessage('launch:invitation:1',1),false);const badRevision=structuredClone(restored.toEnvelope());badRevision.eventLog.find(x=>x.payload?.kind==='expired_launch_history').payload.revision=2;assert.ok(validateSchema6WithCandidates(badRevision,[]).some(x=>x.includes('expired launch')));const duplicate=structuredClone(restored.toEnvelope());duplicate.eventLog.push(structuredClone(duplicate.eventLog.find(x=>x.payload?.kind==='expired_launch_history')));assert.ok(validateSchema6WithCandidates(duplicate,[]).some(x=>x.includes('expired launch')));restored.finishRunComplete();const receipt=restored.presentReceipt();assert.ok(receipt.accounting.lines.some(x=>x.text.includes('expired launch invitation')));assert.ok(receipt.evidence.some(x=>x.seq===display.seq && x.payload.id==='launch:invitation:1' && x.payload.revision===1));assert.ok(!receipt.evidence.some(x=>x.payload?.kind==='launch_reply_invitation'||x.payload?.kind==='launch_reply'));const finding=receipt.findings.find(x=>x.technique==='launch_invitation');assert.ok(finding.displayed.some(x=>x.seq===display.seq));assert.ok(finding.did.some(x=>x.text.includes('No LAUNCH reply')));assert.equal(finding.question.answer,null);assert.deepEqual(validateSchema6WithCandidates(restored.toEnvelope(),[]),[]);
});

test('early repayment revalidation rejects new due bills, recovery and changed terms without mutation',async()=>{
 const {earlyRepaymentEligibility}=await import('./messages-policy.mjs');const bills=[];
 const engine={state:{cash:50,life:{schedule:{recovery:null},finance:{loans:[{id:'loan-1',status:'pending',totalCents:1000}]}}},log:{length:7},checkDueObligations:()=>({bills})};
 const first=earlyRepaymentEligibility(engine,'loan-1');assert.deepEqual(first,{loanId:'loan-1',totalCents:1000});
 bills.push({id:'rent-1'},{id:'loan-2'});let snapshot=JSON.stringify({state:engine.state,log:engine.log});assert.equal(earlyRepaymentEligibility(engine,'loan-1',first.totalCents),null);assert.equal(JSON.stringify({state:engine.state,log:engine.log}),snapshot);
 bills.length=0;engine.state.life.schedule.recovery={id:'recover'};snapshot=JSON.stringify({state:engine.state,log:engine.log});assert.equal(earlyRepaymentEligibility(engine,'loan-1',first.totalCents),null);assert.equal(JSON.stringify({state:engine.state,log:engine.log}),snapshot);
 engine.state.life.schedule.recovery=null;engine.state.life.finance.loans[0].totalCents=1100;snapshot=JSON.stringify({state:engine.state,log:engine.log});assert.equal(earlyRepaymentEligibility(engine,'loan-1',first.totalCents),null);assert.equal(JSON.stringify({state:engine.state,log:engine.log}),snapshot);
 engine.state.life.finance.loans[0].totalCents=1000;engine.log.length=8;snapshot=JSON.stringify({state:engine.state,log:engine.log});assert.equal(earlyRepaymentEligibility(engine,'loan-1',first.totalCents,7),null);assert.equal(JSON.stringify({state:engine.state,log:engine.log}),snapshot);
});

test('enabled launch reply cannot be added after the invitation window',()=>{
 const e=new GameEngine('late-launch',{lifePolicy:'five-slot-v1',raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();assert.ok(e.showLifeInvitation());let n=0;
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`late:${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});const before=e.log.length;assert.equal(e.replyLifeInvitation(),false);assert.equal(e.log.length,before);
 e.log.append('action',{kind:'launch_reply',text:'LAUNCH'},e.state.clock);assert.ok(validateSchema6WithCandidates(e.toEnvelope(),[]).some(x=>x.includes('Invalid launch reply')));
});

test('floor reconfirmation is a distinct current decision with its own shown prerequisite',async()=>{
 const {renCurrentIds,renMessageShown,deliveryCandidate}=await import('./messages-policy.mjs');
 const life={schedule:{day:4},social46:{revision:2,introShown:true,intro:{numberShared:true},pending:{id:'ren-2',day:4,activity:'game',committed:true,seatingConfirmed:false,floorPromptShown:false}}};
 const id='ren:floor:ren-2:4';assert.ok(renCurrentIds(life).includes(id));assert.equal(deliveryCandidate(life,'ren',id),true);assert.equal(renMessageShown(life,id),false);life.social46.pending.floorPromptShown=true;assert.equal(renMessageShown(life,id),true);life.social46.pending.seatingConfirmed=true;assert.equal(renCurrentIds(life).includes(id),false);assert.equal(renMessageShown(life,id),false);
});
