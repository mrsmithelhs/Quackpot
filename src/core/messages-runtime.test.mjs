import test from 'node:test';
import assert from 'node:assert/strict';
import {messagesForEngine} from './messages-runtime.mjs';

test('work delivery and loan action preserve identity and displayed repayment amount',()=>{
 const loan={id:'loan-1',status:'pending',totalCents:894};
 const entries=[{seq:0,type:'run_started'},{seq:1,type:'message_delivered',clock:{day:1},payload:{kind:'work',id:'work:shift:1',revision:1}},{seq:2,type:'message_delivered',clock:{day:2},payload:{kind:'work',id:'work:shift:2',revision:1}},{seq:3,type:'message_delivered',clock:{day:2},payload:{kind:'loan',id:'loan:statement:loan-1',revision:1}}];
 const bills=[];const engine={messagesPolicy:'messages-v1',state:{cash:40,life:{schedule:{day:2,slot:'evening',recovery:null},finance:{loans:[loan]},social46:null}},log:{entries,length:entries.length},checkDueObligations:()=>({bills})};
 const projection=()=>messagesForEngine(engine);let data=projection();const works=data.deliveries.filter(m=>m.threadId==='work');assert.deepEqual(works.map(m=>m.deliveryId),['work:shift:1','work:shift:2']);assert.ok(works.every(m=>!m.text.includes('keys')&&!m.text.includes('pays')));
 let message=data.deliveries.find(m=>m.threadId==='loan');assert.equal(message.actionable,true);assert.equal(message.actionLabel,'Pay $8.94');assert.equal(message.actionAmountCents,894);assert.equal(message.actionLogLength,4);
 bills.push({id:'rent-1'});message=projection().deliveries.find(m=>m.threadId==='loan');assert.equal(message.actionable,false);assert.equal(message.status,'Outstanding');
 bills.length=0;engine.state.cash=1;assert.equal(projection().deliveries.find(m=>m.threadId==='loan').actionable,false);loan.status='paid';assert.equal(projection().deliveries.find(m=>m.threadId==='loan').actionable,false);
});
