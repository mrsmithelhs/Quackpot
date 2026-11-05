import test from 'node:test';
import assert from 'node:assert/strict';
import {snapshotDefaultIntent,defaultIntentIsCurrent,selectedDefaultBill} from './life-default-intent.mjs';
import {GameEngine} from '../../core/game-engine.mjs';
import {readFileSync} from 'node:fs';
import {validateFiveSlotTransactionHistory} from '../../core/life-replay.mjs';

test('pending default tracks state and explicit bill without choosing a priority',()=>{
 const engine={state:{life:{policyVersion:'five-slot-v1',schedule:{revision:1,recovery:null},finance:{revision:2}},cash:20},log:{length:4},isTerminal:()=>false,
   checkDueObligations:()=>({cashCents:2000,bills:[{id:'rent-1',amountCents:17000},{id:'loan-1',totalCents:3000}]})};
 const pending=snapshotDefaultIntent(engine,{type:'sleep'});
 assert.equal(selectedDefaultBill(pending,'loan-1').id,'loan-1');
 assert.equal(selectedDefaultBill(pending,undefined),null);
 assert.equal(defaultIntentIsCurrent(engine,pending),true);
 engine.state.cash=21;
 assert.equal(defaultIntentIsCurrent(engine,pending),false);
 engine.state.cash=20;engine.log.length++;
 assert.equal(defaultIntentIsCurrent(engine,pending),false);
 engine.state.life.schedule.recovery={resolved:false};
 assert.equal(snapshotDefaultIntent(engine,{type:'sleep'}),null);
});

test('reconsider is inert, stale attempts fail preflight, and confirmed rent default never runs the chosen meal',()=>{
 const save=JSON.parse(readFileSync('reports/development/plan-52-five-slot-production-transition/production-finance-final/day4-rent-shortfall.save.json','utf8'));
 const e=GameEngine.fromEnvelope(save),request={kind:'schedule',action:{type:'meal',choice:'buy'}};
 assert.equal(e.classifyFiveSlotDueCommitment(request).ok,true);
 assert.equal(e.fiveSlotDueOptionsWereShown(),true);
 const before=structuredClone(e.state),rng=e.rngDraw.serialize(),length=e.log.length;
 const pending=snapshotDefaultIntent(e,request);
 assert.equal(defaultIntentIsCurrent(e,pending),true);assert.deepEqual(e.state,before);assert.equal(e.log.length,length);
 e.recordFiveSlotDueOptionsShown();assert.equal(defaultIntentIsCurrent(e,pending),false);
 const fresh=snapshotDefaultIntent(e,request),target=selectedDefaultBill(fresh,'rent-1');assert.ok(target);
 const p=e.prepareFiveSlotAction({domain:'finance',action:{type:'leave_unpaid',billId:target.id,id:'test-default',confirmed:true,optionsDisclosed:true}});
 assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal).ok,true);
 assert.equal(e.commitFiveSlotAction(p.proposal).ok,false);assert.equal(e.state.cash,before.cash);assert.equal(e.state.health,before.health);
 assert.deepEqual(e.state.life.schedule,before.life.schedule);assert.equal(e.rngDraw.serialize(),rng);
 assert.equal(e.log.entries.filter(event=>event.type==='terminal').length,1);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
});
