import test from 'node:test';
import assert from 'node:assert/strict';
import {createSchedule,PRODUCTION} from './life-schedule/index.mjs';
import {initialFinance,latchDue,prepareFinance,commitFinance} from './life-finance.mjs';
import {renGraphNode} from './life-social-dialogue.mjs';
import {inspectLifeTransaction,classifyDueScheduleCommitment,classifyDueSocialCommitment,commitLifeTransaction,stageSocialTransition,stageWorkStory,prepareActivityStory,stageActivityStory} from './life-coordinator.mjs';
const setup=()=>({schedule:createSchedule(PRODUCTION,{2:true,3:true,4:true}),finance:initialFinance()});
const prep=(s,b,i,c={})=>inspectLifeTransaction(s,b,i,c);
const commit=(s,b,p,o={},c={})=>commitLifeTransaction(s,b,p,o,c);
test('due commitment classification checks schedule validity without a committable bypass',()=>{
 const s=setup();s.schedule.day=4;const b={cashCents:17000,health:100};
 const meal={domain:'schedule',action:{type:'meal',choice:'buy',operationId:'meal'}};
 assert.deepEqual(classifyDueScheduleCommitment(s,b,meal),{ok:true,blockedBy:'financial_obligation_due',hasConflicts:false,rentWorkConflict:false});
 assert.equal(prep(s,b,meal).reason,'financial_obligation_due');
 assert.equal(classifyDueScheduleCommitment(s,b,{domain:'schedule',action:{type:'sleep',operationId:'sleep'}}).reason,'sleep_unavailable');
 assert.equal(classifyDueScheduleCommitment(s,b,{domain:'schedule',action:{type:'reserve',operationId:'plan'}}).reason,'not_slot_commitment');
 s.schedule.recovery={id:'zero',resolved:false};
 assert.equal(classifyDueScheduleCommitment(s,{cashCents:17000,health:0},meal).reason,'recovery_pending');
});
test('staged work story requires displayed scenes and pays only on completion',()=>{
 let s=setup(),b={cashCents:8000,health:100};const meal=prep(s,b,{domain:'schedule',action:{type:'meal',choice:'buy',operationId:'breakfast'}});
 let result=commit(s,b,meal.proposal,{confirmed:true});assert.equal(result.ok,true);s=result.state;b.cashCents+=result.cashDeltaCents;
 const context={seed:'work-story',schedule:{},shownStages:[]};
 result=stageWorkStory(s,b,{type:'start',operationId:'begin',confirmed:true},context);assert.equal(result.ok,true,JSON.stringify(result));s=result.state;
 const id=s.story47.id;assert.equal(s.story47.stage,'commute');assert.equal(s.schedule.active.id,id);assert.equal(b.cashCents,7400);
 assert.equal(stageWorkStory(s,b,{type:'advance',id,operationId:'hidden'},context).reason,'story_not_shown');
 context.shownStages.push(`${id}:commute`);result=stageWorkStory(s,b,{type:'advance',id,operationId:'arrive'},context);assert.equal(result.ok,true);s=result.state;
 assert.equal(stageWorkStory(s,b,{type:'complete',id,operationId:'unseen'},context).reason,'story_not_shown');
 context.shownStages.push(`${id}:work`);result=stageWorkStory(s,b,{type:'complete',id,operationId:'finish',confirmed:true},context);
 assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.cashDeltaCents,6000);s=result.state;b.cashCents+=result.cashDeltaCents;
 assert.equal(s.story47.stage,'payslip');assert.equal(s.schedule.slot,'early-evening');assert.equal(b.cashCents,13400);
 assert.equal(stageWorkStory(s,b,{type:'complete',id,operationId:'finish',confirmed:true},context).reason,'duplicate_operation');
 result=stageWorkStory(s,b,{type:'dismiss',id,operationId:'home'},context);assert.equal(result.ok,true);assert.equal(result.state.story47,null);
});
test('due rent blocks ordinary schedule, but explicit payment is staged once',()=>{
 const s=setup();s.schedule.day=4;const b={cashCents:17000,health:100};
 assert.equal(prep(s,b,{domain:'schedule',action:{type:'meal',choice:'buy',operationId:'m'}}).reason,'financial_obligation_due');
 const p=prep(s,b,{domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:'p'}}).proposal;
 const r=commit(s,b,p);assert.equal(r.ok,true);assert.equal(r.cashDeltaCents,-17000);assert.equal(r.events[0].type,'financial_due');assert.equal(r.events[1].type,'rent_paid');assert.equal(s.finance.rents[0].status,'pending');
 assert.equal(prep(r.state,{cashCents:0,health:100},p.intent).reason,'duplicate_operation');
});
test('a due rent permits its future shift reservation without clearing the obligation',()=>{
 const s=setup();s.schedule.day=4;const b={cashCents:0,health:100};
 const intent={domain:'schedule',action:{type:'reserve-overtime',operationId:'reserve',reservationId:'extra-1',day:5,rentId:'rent-1'}};
 const context={schedule:{rentObligation:{id:'rent-1',status:'due'}}};
 const p=prep(s,b,intent,context);assert.equal(p.ok,true,JSON.stringify(p));
 const result=commitLifeTransaction(s,b,p.proposal,{confirmed:true},context);
 assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.state.schedule.overtimeReservation.day,5);
 assert.equal(result.state.finance.rents[0].latched,true);assert.equal(result.state.finance.rents[0].status,'pending');
});
test('rent rescue allows necessary routine to the reserved shift, but a due loan stops it',()=>{
 let s=setup();s.schedule.day=4;s.schedule.workCalendar['5']=true;let b={cashCents:0,health:100};let n=0;
 const context=()=>({schedule:{overtimeReservation:structuredClone(s.schedule.overtimeReservation),rentObligation:{id:'rent-1',status:'due'}}});
 const act=action=>{const i={domain:'schedule',action:{...action,operationId:`rescue-${++n}`}};const p=prep(s,b,i,context());assert.equal(p.ok,true,JSON.stringify({i,p}));const r=commitLifeTransaction(s,b,p.proposal,{confirmed:true},context());assert.equal(r.ok,true,JSON.stringify({i,r}));s=r.state;b={cashCents:b.cashCents+r.cashDeltaCents,health:b.health+r.healthDelta};};
 act({type:'reserve-overtime',reservationId:'extra',day:5,rentId:'rent-1'});
 assert.equal(prep(s,b,{domain:'schedule',action:{type:'play',kind:'pull',operationId:'not-allowed'}},context()).reason,'financial_obligation_due');
 const collision=structuredClone(s);collision.finance.loans.push({id:'loan-1',totalCents:150,due:{day:4,slot:'morning'},status:'pending',latched:true});
 assert.equal(prep(collision,b,{domain:'schedule',action:{type:'meal',choice:'skip',operationId:'loan-block'}},context()).reason,'financial_obligation_due');
 act({type:'meal',choice:'skip'});act({type:'start',kind:'work'});act({type:'complete',activityId:s.schedule.active.id});
 act({type:'meal',choice:'buy'});act({type:'start',kind:'quiet'});act({type:'complete',activityId:s.schedule.active.id});act({type:'sleep'});
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:s.schedule.active.id});act({type:'meal',choice:'buy'});
 act({type:'start',kind:'overtime',reservationId:'extra'});act({type:'complete',activityId:s.schedule.active.id});
 assert.equal(b.cashCents,16200);assert.equal(b.health,80);assert.equal(s.schedule.overtimeReservation.status,'completed');assert.equal(s.finance.rents[0].status,'pending');
 assert.equal(prep(s,b,{domain:'schedule',action:{type:'reserve-overtime',operationId:'again',reservationId:'extra-again',day:6,rentId:'rent-1'}},context()).reason,'overtime_reservation_unavailable');
 assert.equal(prep(s,b,{domain:'schedule',action:{type:'sleep',operationId:'after-shift'}},context()).reason,'financial_obligation_due');
});
test('recovery crossing a deadline latches the debt without a second cash authority',()=>{
 const s=setup();s.schedule.day=4;s.schedule.slot='morning';s.schedule.recovery={id:'zero',resolved:false};const b={cashCents:0,health:0};
 const p=prep(s,b,{domain:'schedule',action:{type:'recover',operationId:'recover'}}).proposal;assert.ok(p);
 const r=commit(s,b,p,{confirmed:true});assert.equal(r.ok,true);assert.equal(r.healthDelta,20);assert.equal(r.state.schedule.slot,'midday');assert.equal(r.state.finance.rents[0].latched,true);assert.equal(r.events[0].type,'financial_due');
 assert.equal(prep(r.state,{cashCents:0,health:20},{domain:'schedule',action:{type:'start',kind:'work',operationId:'work'}}).reason,'financial_obligation_due');
});
test('forced recovery crossing a loan deadline leaves repayment due before work',()=>{
 const s=setup();let finance=latchDue(s.finance,{day:4,slot:'morning'});
 const loan=prepareFinance(finance,16900,{day:4,slot:'morning'},{type:'accept_loan',billId:'rent-1',id:'loan'});
 assert.equal(loan.ok,true);finance=commitFinance(finance,16900,{day:4,slot:'morning'},loan.proposal).finance;
 const rent=prepareFinance(finance,17000,{day:4,slot:'morning'},{type:'pay_rent',billId:'rent-1',id:'rent'});
 assert.equal(rent.ok,true);s.finance=commitFinance(finance,17000,{day:4,slot:'morning'},rent.proposal).finance;
 s.schedule.day=9;s.schedule.slot='morning';s.schedule.workCalendar['9']=true;s.schedule.recovery={id:'zero',resolved:false};
 const balances={cashCents:0,health:0};
 assert.equal(prep(s,balances,{domain:'finance',action:{type:'repay_loan',loanId:'loan-1',id:'repay'}}).reason,'recovery_pending');
 const recovery=prep(s,balances,{domain:'schedule',action:{type:'recover',operationId:'recover-loan'}});assert.equal(recovery.ok,true);
 const result=commit(s,balances,recovery.proposal,{confirmed:true});assert.equal(result.ok,true);
 assert.equal(result.state.schedule.slot,'midday');assert.equal(result.state.finance.loans[0].latched,true);
 assert.ok(result.events.some(event=>event.type==='financial_due' && event.id==='loan-1'));
 assert.equal(prep(result.state,{cashCents:0,health:20},{domain:'schedule',action:{type:'start',kind:'work',operationId:'work-loan'}}).reason,'financial_obligation_due');
});
test('recovery crossing a loan deadline preserves simultaneous rent and loan choices',()=>{
 const s=setup();let finance=latchDue(s.finance,{day:9,slot:'morning'});
 const loan=prepareFinance(finance,16900,{day:9,slot:'morning'},{type:'accept_loan',billId:'rent-1',id:'loan-collision'});
 assert.equal(loan.ok,true);finance=commitFinance(finance,16900,{day:9,slot:'morning'},loan.proposal).finance;
 const rent=prepareFinance(finance,17000,{day:9,slot:'morning'},{type:'pay_rent',billId:'rent-1',id:'rent-collision'});
 assert.equal(rent.ok,true);s.finance=commitFinance(finance,17000,{day:9,slot:'morning'},rent.proposal).finance;
 s.schedule.day=14;s.schedule.slot='morning';s.schedule.recovery={id:'zero',resolved:false};const b={cashCents:0,health:0};
 const p=prep(s,b,{domain:'schedule',action:{type:'recover',operationId:'collision-recover'}});assert.equal(p.ok,true);
 const r=commit(s,b,p.proposal,{confirmed:true});assert.equal(r.ok,true);
 assert.deepEqual(r.events.filter(event=>event.type==='financial_due').map(event=>event.id),['rent-2','loan-1']);
 assert.equal(r.state.finance.rents[1].latched,true);assert.equal(r.state.finance.loans[0].latched,true);
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

test('Ren offer reserves no slot and Welcome stages social scene with scheduler claim',()=>{
 let s=setup();s.schedule.day=2;s.schedule.slot='evening';s.schedule.obligations['2:dinner']='buy';const b={cashCents:8000,health:90};let n=0;
 const social=action=>{const r=stageSocialTransition(s,b,{operationId:`social-${++n}`,action});assert.equal(r.ok,true,JSON.stringify({action,r}));s=r.state;return r;};
 social({type:'social46_activate',version:1,revision:2});social({type:'social46_knock_shown'});social({type:'social46_door_open'});
 for(const choice of ['meet','glad','continue','thanks','finish']){social({type:'social46_intro_line_shown'});social({type:'social46_intro_choose',choice});}
 social({type:'social46_offer',day:2,initiator:'ren',activity:'door'});const id=s.social46.pending.id;social({type:'social46_offer_shown',id});
 const dueBranch=structuredClone(s);dueBranch.finance.rents[0].latched=true;const dueBefore=structuredClone(dueBranch);
 assert.equal(stageSocialTransition(dueBranch,b,{operationId:'due-social',action:{type:'social46_reply',id,choice:'accept'}}).reason,'financial_obligation_due');assert.deepEqual(dueBranch,dueBefore);
 assert.equal(classifyDueSocialCommitment(dueBranch,b,{operationId:'due-social',action:{type:'social46_reply',id,choice:'accept'}}).reason,'not_slot_commitment');
 social({type:'social46_reply',id,choice:'accept'});
 assert.equal(s.schedule.slot,'evening');assert.equal(s.schedule.active,null);assert.equal(s.schedule.futurePlans[id].status,'reserved');
 const activity={type:'start',choice:'sit_duck',operationId:'duck-conflict',confirmed:true,conflictChoice:'notice'},activityContext={schedule:{}};
 const activityPreview=prepareActivityStory(s,b,activity,activityContext);assert.equal(activityPreview.ok,true);assert.deepEqual(activityPreview.proposal.schedule.conflicts,[id]);
 assert.equal(stageActivityStory(s,b,activity,activityContext).reason,'warning_not_shown');
 assert.equal(stageActivityStory(s,b,activity,{...activityContext,warningShown:true}).reason,'conflict_not_shown');
 const activityResult=stageActivityStory(s,b,activity,{...activityContext,warningShown:true,conflictShownKinds:['conflict_notice']});assert.equal(activityResult.ok,true);assert.equal(activityResult.state.social46.pending,null);assert.equal(activityResult.state.schedule.active.kind,'activity47');assert.equal(s.social46.pending.id,id);
 const future=structuredClone(s);future.schedule.day=4;future.schedule.slot='morning';future.schedule.futurePlans[id].day=5;future.social46.pending.day=5;
 const rescueContext={schedule:{rentObligation:{id:'rent-1',status:'due'}}},rescueIntent={domain:'schedule',action:{type:'reserve-overtime',operationId:'future-conflict',reservationId:'extra',rentId:'rent-1',day:5}};
 const reserve=prep(future,b,rescueIntent,rescueContext);assert.equal(reserve.ok,true);assert.deepEqual(reserve.proposal.schedule.conflicts,[id]);
 const conflict=commitLifeTransaction(future,b,reserve.proposal,{confirmed:true,conflictChoice:'break'},rescueContext);assert.equal(conflict.ok,true,JSON.stringify(conflict));assert.equal(conflict.state.social46.pending,null);assert.equal(conflict.state.schedule.overtimeReservation.day,5);
 const play={domain:'schedule',action:{type:'play',kind:'pull',operationId:'conflicting-pull'}};const context={schedule:{operationAvailable:true}};const prepared=prep(s,b,play,context);assert.equal(prepared.ok,true);assert.deepEqual(prepared.proposal.schedule.conflicts,[id]);
 const failed=commitLifeTransaction(s,b,prepared.proposal,{confirmed:true,conflictChoice:'break'},context);assert.equal(failed.ok,false);assert.equal(s.social46.pending.id,id);assert.equal(s.schedule.futurePlans[id].status,'reserved');
 const committed=commitLifeTransaction(s,b,prepared.proposal,{confirmed:true,conflictChoice:'break',success:true,operationId:'conflicting-pull',resultRef:'unit-symbolic'},context);assert.equal(committed.ok,true);assert.equal(committed.state.social46.pending,null);assert.equal(committed.state.social46.history.at(-1).outcome,'broken');assert.equal(committed.state.schedule.active.kind,'session');assert.equal(s.social46.pending.id,id);
 const cancelled=stageSocialTransition(s,b,{operationId:'cancel-branch',action:{type:'social46_cancel',id}});assert.equal(cancelled.ok,true);assert.equal(cancelled.state.schedule.futurePlans[id].status,'cancelled');assert.equal(cancelled.state.social46.pending,null);assert.equal(s.schedule.futurePlans[id].status,'reserved');
 const rescheduled=stageSocialTransition(s,b,{operationId:'reschedule-branch',action:{type:'social46_reschedule_plan',id,day:3}});assert.equal(rescheduled.ok,true);assert.equal(rescheduled.state.schedule.futurePlans[id].status,'cancelled');assert.equal(rescheduled.state.social46.pending.day,3);assert.equal(rescheduled.state.social46.pending.committed,false);
 social({type:'social46_visit_knock_shown',id});social({type:'social46_visit_open',id});social({type:'social46_visit_arrival_shown',id,lookVersion:1});social({type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1});
 assert.equal(s.schedule.active.kind,'social');assert.equal(s.schedule.active.planId,id);assert.equal(s.social46.scene.id,id);
 const before=structuredClone(s);const rejected=stageSocialTransition(s,b,{operationId:'not-shown',action:{type:'social46_complete',id,choice:'finish'}});assert.equal(rejected.ok,false);assert.deepEqual(s,before);
 let completed=null;
 for(let step=0;step<12;step++){
  const scene=s.social46.scene; const graph=renGraphNode(scene.activity,scene.node,scene.seating,scene.hasUncommunicatedBreak);assert.ok(graph);
  social({type:'social46_scene_shown',id});const choice=graph.choices[0];
  if(choice.next===null){
   const dueScene=structuredClone(s);dueScene.finance.rents[0].latched=true;const snapshot=structuredClone(dueScene);
   const request={operationId:'due-complete',action:{type:'social46_complete',id,choice:choice.id}};
   assert.equal(classifyDueSocialCommitment(dueScene,b,request).ok,true);assert.deepEqual(dueScene,snapshot);
   assert.equal(stageSocialTransition(dueScene,b,request).reason,'financial_obligation_due');
   completed=social({type:'social46_complete',id,choice:choice.id});break;
  }
  social({type:'social46_scene_next',id,choice:choice.id});
 }
 assert.ok(completed);assert.equal(completed.healthDelta,5);assert.equal(s.schedule.slot,'late-evening');assert.equal(s.schedule.futurePlans[id].status,'completed');assert.equal(s.social46.scene.stage,'ack');
});
