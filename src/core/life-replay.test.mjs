import test from 'node:test';
import assert from 'node:assert/strict';
import {GameEngine} from './game-engine.mjs';
import {validateSeededDrawHistory,validateSeededRaceHistory} from './life-replay.mjs';
function realDraw(){const e=new GameEngine('plan52-replay-seed');e.start();e.setupCompanion();e.commitPromotionalTenPull();return e.toEnvelope();}
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
