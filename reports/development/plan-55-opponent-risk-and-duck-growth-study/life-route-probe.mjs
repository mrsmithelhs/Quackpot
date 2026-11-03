import assert from 'node:assert/strict';
import { GameEngine } from '../../../src/core/game-engine.mjs';

// Public API only. Calls that report a shown cue simulate presentation for this headless trace;
// they are not claims of a real browser display or a captured production save.
function trace(name, limited) {
  const e=new GameEngine(`plan55-life-${name}`,{lifePolicy:'five-slot-v1',tutorialShift:true});
  e.start(); e.setupCompanion(); let n=0, races=0; const points=[];
  const snapshot=label => points.push({label,day:e.state.life.schedule.day,slot:e.state.life.schedule.slot,cash:e.state.cash,health:e.state.health,owned:[...e.state.owned],races,dues:e.checkDueObligations().bills.map(b=>({id:b.id,amountCents:b.amountCents}))});
  const action=(action)=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`${name}-action-${++n}`}});assert.equal(p.ok,true,JSON.stringify(p));if(p.proposal.schedule.disclosures.length) assert.ok(e.recordFiveSlotScheduleWarningShown(p.proposal));const r=e.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(r.ok,true,JSON.stringify(r));};
  const work=()=>{assert.equal(e.beginStoryWork('agree').ok,true);const id=e.state.life.story47.id;assert.ok(e.showLifeStory47(id,'commute'));assert.equal(e.applyFiveSlotWorkStory({type:'advance',id,operationId:`${name}-arrive-${++n}`},e.log.length).ok,true);assert.ok(e.showLifeStory47(id,'work'));assert.equal(e.applyFiveSlotWorkStory({type:'complete',id,operationId:`${name}-work-${++n}`,confirmed:true},e.log.length).ok,true);assert.equal(e.applyFiveSlotWorkStory({type:'dismiss',id,operationId:`${name}-dismiss-${++n}`},e.log.length).ok,true);};
  const race=()=>{const operationId=`${name}-race-${++n}`;const p=e.prepareFiveSlotPlay('race',{operationId});assert.equal(p.ok,true,JSON.stringify(p));if(p.proposal.schedule.disclosures.length) assert.ok(e.recordFiveSlotPlayWarningShown(p.proposal));const out=e.runRace(races+1,e.state.owned[0],'safe',{operationId,confirmConsequences:true});assert.ok(out,`race rejected ${operationId}`);races++;assert.equal(out.status,'finished');snapshot(`race-${races}`);};
  const close=()=>action({type:'complete',activityId:e.state.life.schedule.active.id});
  const sleep=()=>action({type:'sleep'});
  for(let day=1;day<=6;day++) {
    snapshot(`day-${day}-morning`);
    if(e.checkDueObligations().bills.length) {
      if(limited) {snapshot('limited-stop-at-due');break;}
      const p=e.prepareFiveSlotAction({domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:`${name}-rent`}});assert.equal(p.ok,true,JSON.stringify(p));assert.equal(e.commitFiveSlotAction(p.proposal).ok,true);snapshot('rent-paid');
    }
    action({type:'meal',choice:'buy'});
    if(limited && day===2) {assert.equal(e.openLifeApp(),true,'public app re-entry required');race();close();} else work();
    action({type:'meal',choice:'buy'});
    if(limited && day===2) {action({type:'start',kind:'early-bed'});close();continue;}
    assert.equal(e.openLifeApp(),true);
    if(day===1) {assert.ok(e.commitPromotionalTenPull({operationId:`${name}-pull`}));e.revealAllPending();}
    race();close();sleep();
  }
  return {name,simulatedPresentation:true,notBrowserEvidence:true,races,points,finalRent:e.state.life.finance.rents[0].status};
}
const results=[trace('baseline',false),trace('limited',true)];
assert.ok(results.reduce((n,r)=>n+r.races,0)<=12);
process.stdout.write(JSON.stringify(results)+'\n');

