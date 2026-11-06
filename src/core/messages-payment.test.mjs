import test from 'node:test';
import assert from 'node:assert/strict';
import {payMessageLoan,confirmApartmentLoan} from './messages-payment.mjs';
test('explicit payment uses displayed amount and current prefix exactly once',()=>{
 const loan={id:'loan-1',status:'pending',totalCents:894},bills=[];let commits=0;
 const e={state:{cash:40,life:{schedule:{recovery:null},finance:{loans:[loan]}}},log:{length:5},checkDueObligations:()=>({bills}),prepareFiveSlotAction:intent=>({ok:true,proposal:intent}),commitFiveSlotAction:()=>{commits++;loan.status='paid';e.state.cash-=8.94;e.log.length++;return {ok:true};}};
 const before=()=>({cash:e.state.cash,status:loan.status,log:e.log.length,commits});let snapshot=before();
 // A displayed choice dismissed without calling Pay changes nothing.
 assert.deepEqual(before(),snapshot);
 assert.equal(payMessageLoan(e,'loan-1',900,5).ok,false);assert.deepEqual(before(),snapshot);
 assert.equal(payMessageLoan(e,'loan-1',894,4).ok,false);assert.deepEqual(before(),snapshot);
 bills.push({id:'rent-1'});assert.equal(payMessageLoan(e,'loan-1',894,5).ok,false);assert.deepEqual(before(),snapshot);bills.length=0;
 e.state.cash=1;snapshot=before();assert.equal(payMessageLoan(e,'loan-1',894,5).ok,false);assert.deepEqual(before(),snapshot);e.state.cash=40;
 assert.equal(payMessageLoan(e,'loan-1',894,5).ok,true);assert.equal(commits,1);snapshot=before();assert.equal(payMessageLoan(e,'loan-1',894,5).ok,false);assert.deepEqual(before(),snapshot);
});

test('apartment confirmation cancels safely and revalidates changes before paying',()=>{
 const loan={id:'loan-1',status:'pending',totalCents:894},bills=[];let commits=0;
 const e={state:{cash:40,life:{schedule:{recovery:null},finance:{loans:[loan]}}},log:{length:5},checkDueObligations:()=>({bills}),prepareFiveSlotAction:intent=>({ok:true,proposal:intent}),commitFiveSlotAction:()=>{commits++;loan.status='paid';e.state.cash-=8.94;e.log.length++;return {ok:true};}};
 assert.equal(confirmApartmentLoan(e,'loan-1',()=>false).reason,'cancelled');assert.equal(commits,0);assert.equal(e.state.cash,40);
 assert.equal(confirmApartmentLoan(e,'loan-1',()=>{loan.totalCents=900;return true;}).ok,false);assert.equal(commits,0);loan.totalCents=894;
 assert.equal(confirmApartmentLoan(e,'loan-1',()=>{bills.push({id:'rent-1'});return true;}).ok,false);assert.equal(commits,0);bills.length=0;
 assert.equal(confirmApartmentLoan(e,'loan-1',()=>true).ok,true);assert.equal(commits,1);assert.equal(confirmApartmentLoan(e,'loan-1',()=>true).ok,false);assert.equal(commits,1);
});
