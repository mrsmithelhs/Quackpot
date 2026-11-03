import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine} from './game-engine.mjs';
import {validateSave} from './storage.mjs';
import {validateSeededDrawHistory,validateSeededRaceHistory,validateFiveSlotTransactionHistory} from './life-replay.mjs';
function realDraw(){const e=new GameEngine('plan52-replay-seed');e.start();e.setupCompanion();e.commitPromotionalTenPull();return e.toEnvelope();}
test('five-slot first-day invitation can be shown and answered before launch',()=>{
 const e=new GameEngine('plan52-invitation',{lifePolicy:'five-slot-v1',tutorialShift:true});e.start();e.setupCompanion();
 assert.ok(e.showLifeInvitation());assert.equal(e.replyLifeInvitation(),true);assert.ok(e.showLifeAcknowledgment());
 assert.ok(e.displayLifeGemShop());assert.equal(e.buyLifeBundle(60),false);assert.equal(e.openLifeApp(),false);
});
test('five-slot evening story requires display, restores health once and replays',()=>{
 const e=new GameEngine('plan52-activity',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();let n=0;
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`activity-setup:${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 act({type:'meal',choice:'skip'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
 assert.equal(e.state.health,95);const preview=e.prepareFiveSlotActivityStory('call_mom','mom-start');assert.equal(preview.ok,true);
 assert.equal(e.applyFiveSlotActivityStory({type:'start',choice:'call_mom',operationId:'mom-start',confirmed:true},e.log.length).ok,true);
 assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 const id=e.state.life.story47.id,complete={type:'complete',id,operationId:'mom-complete',confirmed:true};
 assert.equal(e.applyFiveSlotActivityStory(complete,e.log.length).reason,'story_not_shown');assert.ok(e.showLifeStory47(id,'scene'));
 assert.equal(e.applyFiveSlotActivityStory(complete,e.log.length).ok,true);assert.equal(e.state.health,100);
 assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 assert.equal(e.applyFiveSlotActivityStory(complete,e.log.length).ok,false);assert.equal(e.applyFiveSlotActivityStory({type:'dismiss',id,operationId:'mom-dismiss'},e.log.length).ok,true);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
 const missing=structuredClone(e.toEnvelope());missing.eventLog=missing.eventLog.filter(event=>event.type!=='story47_shown');assert.ok(validateFiveSlotTransactionHistory(missing).length);
});
test('five-slot story conflict requires shown choices and cancelled warning cannot authorize it',()=>{
 const e=new GameEngine('plan52-activity-ren',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();let n=0;
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`ren-setup:${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
 act({type:'start',kind:'early-bed'});act({type:'complete',activityId:e.state.life.schedule.active.id});
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
 const social=action=>{const r=e.applyFiveSlotSocialAction({operationId:`ren-social:${++n}`,action},e.log.length);assert.equal(r.ok,true,JSON.stringify(r));};
 social({type:'social46_activate',version:1,revision:2});social({type:'social46_knock_shown'});social({type:'social46_door_open'});
 for(const choice of ['meet','glad','continue','thanks','finish']){social({type:'social46_intro_line_shown'});social({type:'social46_intro_choose',choice});}
 social({type:'social46_offer',day:2,initiator:'ren',activity:'door'});const id=e.state.life.social46.pending.id;social({type:'social46_offer_shown',id});social({type:'social46_reply',id,choice:'accept'});
 const intent={type:'start',choice:'sit_duck',operationId:'duck-conflict',confirmed:true,conflictChoice:'notice'};
 let preview=e.prepareFiveSlotActivityStory(intent.choice,intent.operationId);assert.deepEqual(preview.proposal.schedule.conflicts,[id]);
 assert.ok(e.recordFiveSlotActivityWarningShown(intent.choice,intent.operationId,preview.proposal));assert.ok(e.recordFiveSlotActivityWarningCancelled(intent.choice,intent.operationId));
 assert.equal(e.applyFiveSlotActivityStory(intent,e.log.length).reason,'warning_not_shown');assert.equal(e.state.life.social46.pending.id,id);
 social({type:'social46_conflict_shown',id,kind:'conflict_notice'});preview=e.prepareFiveSlotActivityStory(intent.choice,intent.operationId);
 assert.ok(e.recordFiveSlotActivityWarningShown(intent.choice,intent.operationId,preview.proposal));assert.equal(e.applyFiveSlotActivityStory(intent,e.log.length).ok,true);
 assert.equal(e.state.life.social46.pending,null);assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 e.finishRunComplete();const receipt=e.presentReceipt();assert.ok(receipt.accounting.lines.some(line=>line.text.includes('Cancelled after an activity warning')));assert.ok(receipt.evidence.some(event=>event.type==='life52_activity_warning_cancelled'));
});
test('five-slot transaction replay rebuilds real actions and rejects changed effects or snapshots',()=>{
 const e=new GameEngine('plan52-transaction-replay',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();let n=0;
 assert.equal(e.state.life.schedule.workCalendar['19'],true);assert.equal(e.state.life.schedule.workCalendar['20'],undefined);
 const act=action=>{const intent={domain:'schedule',action:{...action,operationId:`replay-${++n}`}};const p=e.prepareFiveSlotAction(intent);assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});
 const envelope=e.toEnvelope();assert.deepEqual(validateFiveSlotTransactionHistory(envelope),[]);
 const bypass=structuredClone(envelope);bypass.eventLog[0].payload.tutorialShiftVersion=1;assert.ok(validateFiveSlotTransactionHistory(bypass).some(error=>error.includes('bypasses story')));
 const promo=structuredClone(envelope);promo.state.tenPullCommitted=true;assert.ok(validateFiveSlotTransactionHistory(promo).some(error=>error.includes('Promotional pull state')));
 const altered=structuredClone(envelope);altered.eventLog.find(event=>event.type==='life52_effect').payload.effect.choice='skip';assert.ok(validateFiveSlotTransactionHistory(altered).some(error=>error.includes('mismatch')));
 const snapshot=structuredClone(envelope);snapshot.state.life.schedule.day=7;assert.ok(validateFiveSlotTransactionHistory(snapshot).some(error=>error.includes('Reconstructed')));
 const earlyOpen=structuredClone(envelope);earlyOpen.eventLog.splice(1,0,{seq:999,type:'action',payload:{kind:'quackpot_opened',app:'Quackpot'}});assert.ok(validateFiveSlotTransactionHistory(earlyOpen).some(error=>error.includes('Invalid app entry')));
 const wrongPolicy=structuredClone(envelope);wrongPolicy.eventLog[0].payload.lifeConfig.scheduledWage=600;assert.ok(validateFiveSlotTransactionHistory(wrongPolicy).some(error=>error.includes('policy start')));
 const missing=structuredClone(envelope);missing.eventLog.splice(missing.eventLog.findIndex(event=>event.type==='life52_effect'),1);assert.ok(validateFiveSlotTransactionHistory(missing).some(error=>error.includes('mismatch')));
});
test('five-slot replay verifies retention rewards and the immediate uninstall ending',()=>{
 const e=new GameEngine('plan52-retention',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();e.clickUninstall();e.stayUninstall();e.clickUninstall();e.leaveUninstall();e.recordReceiptPresented();
 const envelope=e.toEnvelope();assert.deepEqual(validateFiveSlotTransactionHistory(envelope),[]);
 const altered=structuredClone(envelope);altered.eventLog.find(event=>event.type==='reward' && event.payload.kind==='retention_gems').payload.gems=800;
 assert.ok(validateFiveSlotTransactionHistory(altered).some(error=>error.includes('retention reward')));
 const afterLeave=structuredClone(envelope);const terminal=afterLeave.eventLog.findIndex(event=>event.type==='terminal');afterLeave.eventLog.splice(terminal,0,{seq:999,type:'action',payload:{kind:'unrelated'}});
 assert.ok(validateFiveSlotTransactionHistory(afterLeave).some(error=>error.includes('after uninstall choice')));
});
test('real engine promotional batch matches independently regenerated stream',()=>{assert.deepEqual(validateSeededDrawHistory(realDraw()),[]);});
test('tampered draw result, order and RNG are rejected',()=>{const env=realDraw();const draw=env.eventLog.find(x=>x.type==='draw_committed');const modified=structuredClone(env);modified.eventLog[draw.seq].payload.identity='forged';assert.ok(validateSeededDrawHistory(modified).some(x=>x.includes('mismatch')));const reordered=structuredClone(env);const i=draw.seq;[reordered.eventLog[i],reordered.eventLog[i+1]]=[reordered.eventLog[i+1],reordered.eventLog[i]];assert.ok(validateSeededDrawHistory(reordered).some(x=>x.includes('mismatch')));const rng=structuredClone(env);rng.prngStreams.draw=rng.prngStreams.root;assert.ok(validateSeededDrawHistory(rng).some(x=>x.includes('Draw RNG')));});
test('removed batch member and unaccompanied paid purchase are rejected',()=>{const env=realDraw();const missing=structuredClone(env);missing.eventLog.splice(missing.eventLog.findIndex(x=>x.type==='draw_committed'),1);assert.ok(validateSeededDrawHistory(missing).length);const purchase=structuredClone(env);purchase.eventLog.push({seq:purchase.eventLog.length,type:'purchase',payload:{kind:'single_pull'}});assert.ok(validateSeededDrawHistory(purchase).some(x=>x.includes('Incomplete')));});

test('real seeded race is recomputed and altered witness or result rejected',()=>{const e=new GameEngine('plan52-race-replay');e.start();e.setupCompanion();e.commitPromotionalTenPull();e.runRace(1,e.state.owned[0]);const env=e.toEnvelope();assert.deepEqual(validateSeededRaceHistory(env),[]);const changed=structuredClone(env);const result=changed.eventLog.find(x=>x.type==='race_result');result.payload.place=result.payload.place===1?2:1;assert.ok(validateSeededRaceHistory(changed).some(x=>x.includes('outcome mismatch')));const witness=structuredClone(env);witness.state.raceResolutions.R01.digest='tampered';assert.ok(validateSeededRaceHistory(witness).some(x=>x.includes('resolution mismatch')));});


test('actual paid pull is replayed from a genuine life run',()=>{
 const e=new GameEngine('plan52-paid-replay',{lifePolicy:true});e.start();e.setupCompanion();
 const act=intent=>assert.equal(e.applyLifeIntent(intent).ok,true,JSON.stringify(intent));
 act({type:'meal',choice:'buy'});act({type:'advance'});act({type:'agree_work',kind:'scheduled'});act({type:'complete_work',id:e.state.life.work.id});act({type:'advance'});act({type:'meal',choice:'buy'});
 assert.equal(e.openLifeApp(),true);assert.ok(e.commitPromotionalTenPull());e.revealAllPending();assert.equal(e.buyLifeBundle(1090),true);assert.equal(e.buyLifeBundle(1090),true);assert.ok(e.commitPaidPull(1,{confirmNext:true}));
 const env=e.toEnvelope();assert.deepEqual(validateSeededDrawHistory(env),[]);
 const forged=structuredClone(env);const purchase=forged.eventLog.find(x=>x.type==='purchase'&&x.payload.kind==='single_pull');purchase.payload.kind='ten_pull';assert.ok(validateSeededDrawHistory(forged).length>0);
});

test('race replay rejects missing trial consumption and nonsequential race identity',()=>{
 const e=new GameEngine('plan52-race-trial');e.start();e.setupCompanion();e.commitPromotionalTenPull();assert.ok(e.state.down>=3);assert.equal(e.purchaseRaceTrial(),true);e.runRace(1,e.state.owned[0],'safe',{useTrial:true});const env=e.toEnvelope();assert.deepEqual(validateSeededRaceHistory(env),[]);
 const missing=structuredClone(env);const index=missing.eventLog.findIndex(x=>x.type==='action'&&x.payload.kind==='race_trial_consumed');assert.ok(index>=0);missing.eventLog.splice(index,1);assert.ok(validateSeededRaceHistory(missing).some(x=>x.includes('trial consumption')));
 const orphan=structuredClone(env);const orphanEvent=orphan.eventLog.splice(index,1)[0];orphan.eventLog.push(orphanEvent);assert.ok(validateSeededRaceHistory(orphan).some(x=>x.includes('without matching completed race')));
 const freeTrial=structuredClone(env);freeTrial.eventLog.find(x=>x.type==='action'&&x.payload.kind==='race_trial_purchased').payload.costDown=0;assert.ok(validateSeededRaceHistory(freeTrial).some(x=>x.includes('Invalid race trial purchase')));
 const skipped=structuredClone(env);const choice=skipped.eventLog.find(x=>x.type==='action'&&x.payload.kind==='race_choice');const result=skipped.eventLog.find(x=>x.type==='race_result');choice.payload.raceId='R02';result.payload.raceId='R02';result.payload.raceNumber=2;assert.ok(validateSeededRaceHistory(skipped).some(x=>x.includes('sequence mismatch')));
});
