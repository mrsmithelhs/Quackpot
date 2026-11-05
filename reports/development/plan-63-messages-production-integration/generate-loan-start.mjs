import {GameEngine} from '../../../src/core/game-engine.mjs';
import {writeFile} from 'node:fs/promises';
import {lifeSurface} from '../../../src/ui/life/life-routing.mjs';
import {validateSchema6WithCandidates} from '../../../src/core/life-replay.mjs';
import {messagesForEngine} from '../../../src/core/messages-runtime.mjs';
const e=new GameEngine('plan63-real-start',{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:true});e.start();e.setupCompanion();e.state.step=lifeSurface(e);let n=0;
const ok=(x,label)=>{if(!x || x.ok===false)throw Error(`${label}: ${JSON.stringify(x)}`);return x;};
const act=(action)=>{const p=ok(e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`witness:${++n}`}}),'prepare');return ok(e.commitFiveSlotAction(p.proposal,{confirmed:true}),'commit');};
const story=(type,id)=>ok(e.applyFiveSlotWorkStory({type,id,operationId:`story:${++n}`,confirmed:true},e.log.length),type);
for(let day=1;day<=3;day++){
 act({type:'meal',choice:'buy'});ok(e.beginStoryWork('depart'),'start work');let s=e.state.life.story47;ok(e.showLifeStory47(s.id,'commute'),'show commute');story('advance',s.id);ok(e.showLifeStory47(s.id,'work'),'show work');story('complete',s.id);story('dismiss',s.id);act({type:'meal',choice:'buy'});
 if(day===1){ok(e.openLifeApp(),'app');for(let i=0;i<4;i++){e.displayLifeGemShop();if(!e.buyLifeBundle(1090))throw Error('bundle failed');}}
 act({type:'start',kind:'early-bed'});act({type:'complete',activityId:e.state.life.schedule.active.id});
}
console.log(JSON.stringify({day:e.state.day,cash:e.state.cash,slot:e.state.life.schedule.slot,errors:validateSchema6WithCandidates(e.toEnvelope(),[])}));
const due=e.checkDueObligations().bills.find(x=>x.id==='rent-1');ok(due,'rent');ok(e.recordFiveSlotLoanTermsShown('rent-1'),'loan terms');const p=ok(e.prepareFiveSlotAction({domain:'finance',action:{type:'accept_loan',billId:'rent-1',id:'witness-loan'}}),'loan prepare');ok(e.commitFiveSlotAction(p.proposal),'loan commit');
const env=e.toEnvelope(),errors=validateSchema6WithCandidates(env,[]);if(errors.length)throw Error(JSON.stringify(errors));if(messagesForEngine(e).deliveries.find(m=>m.threadId==='loan')?.actionable!==false)throw Error('early loan action must respect due rent');await writeFile(process.argv[2],JSON.stringify(env,null,2),{flag:'wx'});console.log(JSON.stringify({loan:e.state.life.finance.loans[0].id,cash:e.state.cash,events:e.log.length}));

if(process.argv[3]) {const q=ok(e.prepareFiveSlotAction({domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:'witness-rent'}}),'rent prepare');ok(e.commitFiveSlotAction(q.proposal),'rent pay');if(messagesForEngine(e).deliveries.find(m=>m.threadId==='loan')?.actionable!==false)throw Error('unaffordable early loan action must be unavailable');const next=e.toEnvelope(),issues=validateSchema6WithCandidates(next,[]);if(issues.length)throw Error(JSON.stringify(issues));await writeFile(process.argv[3],JSON.stringify(next,null,2),{flag:'wx'});console.log(JSON.stringify({route:'rent-paid',cash:e.state.cash,loan:e.state.life.finance.loans[0].status}));}
if(process.argv[4]) {ok(e.sellFiveSlotAsset('tv',e.log.length),'sell television');if(messagesForEngine(e).deliveries.find(m=>m.threadId==='loan')?.actionable!==true)throw Error('affordable early loan action missing');if(process.argv[5])await writeFile(process.argv[5],JSON.stringify(e.toEnvelope(),null,2),{flag:'wx'});const q=ok(e.prepareFiveSlotAction({domain:'finance',action:{type:'repay_loan',loanId:'loan-1',id:'witness-repay'}}),'repay prepare');ok(e.commitFiveSlotAction(q.proposal),'repay commit');const next=e.toEnvelope(),issues=validateSchema6WithCandidates(next,[]);if(issues.length)throw Error(JSON.stringify(issues));await writeFile(process.argv[4],JSON.stringify(next,null,2),{flag:'wx'});console.log(JSON.stringify({route:'repaid',cash:e.state.cash,loan:e.state.life.finance.loans[0].status}));}
