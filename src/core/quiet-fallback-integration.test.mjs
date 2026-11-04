import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GameEngine} from './game-engine.mjs';

const base='reports/development/plan-52-five-slot-production-transition/';
const load=async name=>GameEngine.fromEnvelope(JSON.parse(await readFile(base+name,'utf8')));
const startQuiet=(e,id='fallback-test')=>e.prepareFiveSlotAction({domain:'schedule',action:{type:'start',kind:'quiet',operationId:id}});

test('guided meals, mandatory work, and ordinary free Evening activity suppress fallback',async()=>{
  const breakfast=await load('production-day1-final/morning-narrow.save.json');assert.equal(startQuiet(breakfast).ok,false);
  const work=await load('production-day1-final/midday-keys.save.json');assert.equal(startQuiet(work).ok,false);
  const dinner=await load('production-day1-final/dinner-narrow.save.json');assert.equal(startQuiet(dinner).ok,false);
  const evening=await load('production-day1-final/evening-narrow.save.json');assert.equal(startQuiet(evening).ok,false);
});

test('loan deadline, recovery, and Ren commitment are never displaced by fallback',async()=>{
  const loan=await load('production-finance-final/day9-loan-due.save.json');assert.equal(startQuiet(loan).reason,'financial_obligation_due');
  const recovery=await load('checkpoint-recovery/zero-hp-recovery.save.json');assert.equal(startQuiet(recovery).reason,'recovery_pending');
  const ren=await load('production-ren-final/ren-reserved.save.json');assert.equal(startQuiet(ren).reason,'commitment_pending');
});

test('a genuine free promotional session suppresses the fallback before and after the pull starts',async()=>{
  const e=await load('checkpoint-independent/day7-morning.save.json');
  const meal=e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'skip',operationId:'free-session-breakfast'}});
  assert.equal(meal.ok,true);assert.equal(e.commitFiveSlotAction(meal.proposal,{confirmed:true}).ok,true);
  assert.equal(startQuiet(e,'before-free-session').reason,'free_alternative_available');
  assert.equal(e.openLifeApp(),true);assert.ok(e.commitPromotionalTenPull({operationId:'free-session-pull'}));
  assert.equal(e.state.life.schedule.active.kind,'session');assert.equal(startQuiet(e,'during-free-session').ok,false);
});

test('synthetic no-free-option unemployed Midday admits free no-reward fallback and rechecks stale proposals',async()=>{
  const e=await load('checkpoint-independent/day7-morning.save.json');
  let p=e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'skip',operationId:'test-breakfast'}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);
  // Unit-only synthetic resource configuration; never exported as a review save.
  e.state.tenPullCommitted=true;e.state.pendingReveals=[];e.state.owned=[];e.state.gems=0;e.state.cash=20;
  p=startQuiet(e);assert.equal(p.ok,true,JSON.stringify(p));const cash=e.state.cash,health=e.state.health;
  const done=e.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(done.ok,true);assert.equal(e.state.cash,cash);assert.equal(e.state.health,health);
  assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,false);
  const e2=await load('checkpoint-independent/day7-morning.save.json');let meal=e2.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'skip',operationId:'test-breakfast-2'}});assert.equal(e2.commitFiveSlotAction(meal.proposal,{confirmed:true}).ok,true);
  e2.state.tenPullCommitted=true;e2.state.pendingReveals=[];e2.state.owned=[];e2.state.gems=0;const proposal=startQuiet(e2,'stale');assert.equal(proposal.ok,true);
  e2.state.gems=160;assert.equal(e2.commitFiveSlotAction(proposal.proposal,{confirmed:true}).reason,'free_alternative_available');
});

test('synthetic rent rescue permits only necessary free fallback advancement; a due loan still blocks it',async()=>{
  const e=await load('production-finance-final/day4-rent-shortfall.save.json');
  const intent={domain:'schedule',action:{type:'reserve-overtime',reservationId:'fallback-rescue',rentId:'rent-1',day:5,operationId:'fallback-reserve'}};
  const reservation=e.prepareFiveSlotAction(intent);assert.equal(reservation.ok,true);assert.ok(e.recordFiveSlotScheduleWarningShown(reservation.proposal));assert.equal(e.commitFiveSlotAction(reservation.proposal,{confirmed:true}).ok,true);
  const meal=e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'skip',operationId:'rescue-meal'}});assert.equal(meal.ok,true);assert.equal(e.commitFiveSlotAction(meal.proposal,{confirmed:true}).ok,true);
  // Unit-only emulation of unemployment while the future reservation remains.
  e.state.life.schedule.employment.employed=false;
  const p=startQuiet(e,'rescue-quiet');assert.equal(p.ok,true,JSON.stringify(p));const cash=e.state.cash;
  assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);assert.equal(e.state.cash,cash);assert.equal(e.state.life.finance.rents[0].status,'pending');
  const loan=await load('production-finance-final/day9-loan-due.save.json');assert.equal(startQuiet(loan,'loan-blocked').reason,'financial_obligation_due');
});

test('later meal slots offer the existing free quiet fallback only when other free activities are unavailable',async()=>{
 for(const day of [2,6,7]) for(const slot of ['morning','early-evening']) {
  const e=await load('checkpoint-independent/day7-morning.save.json');
  // Synthetic eligibility fixture only; do not export as a review save.
  e.state.life.schedule.day=day;e.state.life.schedule.slot=slot;e.state.life.schedule.recovery=null;
  e.state.tenPullCommitted=true;e.state.pendingReveals=[];e.state.owned=[];e.state.gems=0;e.state.cash=20;e.state.health=100;
  const before=structuredClone(e.state),rng=JSON.stringify(e.toEnvelope().prngStreams);
  let p=startQuiet(e,`meal-fallback-${day}-${slot}`);assert.equal(p.ok,true,JSON.stringify(p));
  const meal=slot==='morning'?'breakfast':'dinner';assert.ok(p.proposal.schedule.displaced.includes(meal));
  assert.equal(p.proposal.schedule.disclosures.includes(meal),day<=6);
  if(day<=6){assert.ok(e.recordFiveSlotScheduleWarningShown(p.proposal));assert.ok(e.recordFiveSlotWarningCancelled(p.proposal));assert.deepEqual(e.state,before);assert.equal(JSON.stringify(e.toEnvelope().prngStreams),rng);p=startQuiet(e,`meal-fallback-confirm-${day}-${slot}`);assert.ok(e.recordFiveSlotScheduleWarningShown(p.proposal));}
  const started=e.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(started.ok,true,JSON.stringify(started));assert.equal(e.state.health,95);assert.equal(e.state.cash,20);
  const id=e.state.life.schedule.active.id,done=e.prepareFiveSlotAction({domain:'schedule',action:{type:'complete',activityId:id,operationId:`meal-fallback-finish-${day}-${slot}`}});assert.ok(done.ok);assert.ok(e.commitFiveSlotAction(done.proposal,{confirmed:true}).ok);
  assert.equal(e.state.life.schedule.slot,slot==='morning'?'midday':'evening');assert.equal(e.state.health,95);assert.equal(e.state.cash,20);assert.equal(JSON.stringify(e.toEnvelope().prngStreams),rng);
 }
});
