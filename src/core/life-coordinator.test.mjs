import test from 'node:test';
import assert from 'node:assert/strict';
import {createSchedule,PRODUCTION} from './life-schedule/index.mjs';
import {initialFinance} from './life-finance.mjs';
import {inspectLifeTransaction,commitLifeTransaction} from './life-coordinator.mjs';
const setup=()=>({schedule:createSchedule(PRODUCTION,{2:true,3:true,4:true}),finance:initialFinance()});
const prep=(s,b,i,c={})=>inspectLifeTransaction(s,b,i,c);
const commit=(s,b,p,o={},c={})=>commitLifeTransaction(s,b,p,o,c);
test('due rent blocks ordinary schedule, but explicit payment is staged once',()=>{
 const s=setup();s.schedule.day=4;const b={cashCents:17000,health:100};
 assert.equal(prep(s,b,{domain:'schedule',action:{type:'meal',choice:'buy',operationId:'m'}}).reason,'financial_obligation_due');
 const p=prep(s,b,{domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:'p'}}).proposal;
 const r=commit(s,b,p);assert.equal(r.ok,true);assert.equal(r.cashDeltaCents,-17000);assert.equal(r.events[0].type,'financial_due');assert.equal(r.events[1].type,'rent_paid');assert.equal(s.finance.rents[0].status,'pending');
 assert.equal(prep(r.state,{cashCents:0,health:100},p.intent).reason,'duplicate_operation');
});
test('recovery crossing a deadline latches the debt without a second cash authority',()=>{
 const s=setup();s.schedule.day=4;s.schedule.slot='morning';s.schedule.recovery={id:'zero',resolved:false};const b={cashCents:0,health:0};
 const p=prep(s,b,{domain:'schedule',action:{type:'recover',operationId:'recover'}}).proposal;assert.ok(p);
 const r=commit(s,b,p,{confirmed:true});assert.equal(r.ok,true);assert.equal(r.healthDelta,20);assert.equal(r.state.schedule.slot,'midday');assert.equal(r.state.finance.rents[0].latched,true);assert.equal(r.events[0].type,'financial_due');
 assert.equal(prep(r.state,{cashCents:0,health:20},{domain:'schedule',action:{type:'start',kind:'work',operationId:'work'}}).reason,'financial_obligation_due');
});
test('changed context or balance rejects a prepared transaction without mutation',()=>{
 const s=setup();s.schedule.day=4;const b={cashCents:17000,health:100};const before=structuredClone(s);
 const p=prep(s,b,{domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:'p'}}).proposal;
 assert.equal(commitLifeTransaction(s,{...b,cashCents:16999},p,{},{}).ok,false);
 assert.equal(commitLifeTransaction(s,b,p,{},null).reason,'fresh_context_required');assert.deepEqual(s,before);
});
test('financial default requires coordinator-confirmed options disclosure',()=>{
 const s=setup();s.schedule.day=4;const b={cashCents:0,health:100};const action={type:'leave_unpaid',billId:'rent-1',id:'d',confirmed:true,optionsDisclosed:true};
 assert.equal(prep(s,b,{domain:'finance',action},{}).reason,'options_not_disclosed');
 assert.equal(prep(s,b,{domain:'finance',action},{optionsDisclosed:true}).ok,true);
});
