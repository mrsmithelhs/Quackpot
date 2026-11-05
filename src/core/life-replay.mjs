import { availableDueOptions, displayedDueOptions } from './life-due-display.mjs';
// Independent seeded draw verification for five-slot replay. It consumes the
// recorded event stream, not pending-reveal snapshots or UI success references.
import {createRng} from './prng.mjs';
import {BANNER_1_ROSTER, GAME_CONSTANTS, calculatePreDrawOdds} from './game-engine.mjs';
import {makeRaceRestEvidence} from './race-rest.mjs';
import {resolveSeededRace,serializeRaceResolution} from './race-resolver.mjs';
import {PRODUCTION,PLAYTEST_WORK_CALENDAR,createSchedule} from './life-schedule/index.mjs';
import {initialFinance,latchDue,dueObligations} from './life-finance.mjs';
import {inspectLifeTransaction,commitLifeTransaction,stageSocialTransition,stageWorkStory,prepareActivityStory,stageActivityStory} from './life-coordinator.mjs';
import {social46NeedsSaleDisclosure,social46CouchSold} from './life-social.mjs';
import {createRaceHistoryPlan} from './race-v2/history-plan.mjs';
import {createRestoreQueue} from './race-v2/restore-queue.mjs';
import {isVerifiedWorkerCandidate} from './race-v2/worker-client.mjs';
import {stableStringify} from './race-v2/codec.mjs';
import {deliveryCandidate,deliveryPayloads,isDeliveryPayload} from './messages-policy.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function validateMessagesHeader(envelope) {
  const start=envelope?.eventLog?.[0]?.payload?.messagesPolicy;
  const metadata=envelope?.messagesPolicy;
  if (start === undefined && metadata === undefined) return [];
  if (envelope?.schemaVersion !== 6 || start !== 'messages-v1' || metadata !== start) return ['Invalid Messages policy metadata'];
  const facts=envelope.eventLog.filter(e=>typeof e.type==='string' && e.type.startsWith('message_'));
  if(facts.length>512 || facts.some(e=>JSON.stringify(e.payload ?? null).length>256)) return ['Messages facts exceed limits'];
  return [];
}
const exitInterruptions=(life,entries)=>{
  const active=life.schedule.active,day=life.schedule.day,social=life.social46,story=life.story47,out=[];
  const unseen=(type,id)=>!entries.some(event=>event.type===type && event.payload?.id===id);
  if(social?.scene?.stage==='scene' && unseen('social46_interrupted',social.scene.id))out.push({type:'social46_interrupted',payload:{id:social.scene.id,day}});
  else if(!social?.scene && social?.pending?.committed && unseen('social46_plan_interrupted',social.pending.id))out.push({type:'social46_plan_interrupted',payload:{id:social.pending.id,day:social.pending.day}});
  if(story?.kind==='activity' && story.stage==='scene' && unseen('activity47_interrupted',story.id))out.push({type:'activity47_interrupted',payload:{id:story.id,choice:story.choice,day}});
  if(['work','overtime'].includes(active?.kind) && unseen('work_interrupted',active.id))out.push({type:'work_interrupted',payload:{id:active.id,kind:active.kind==='work'?'scheduled':'overtime',day}});
  if(active?.kind==='session' && unseen('session_interrupted',active.id))out.push({type:'session_interrupted',payload:{id:active.id,suspended:null,pull:active.pullUsed,race:active.raceUsed}});
  return out;
};

// Rebuild the coordinated portion from its original policy and recorded inputs.
// Fail closed on cases this first replay slice does not yet cover; this function
// is deliberately not connected to storage until every supported path is covered.
function validateTransactions(envelope, verifiedV2 = false) {
  const entries=envelope?.eventLog;
  if(!Array.isArray(entries))return ['Missing transaction history'];
  const messagesHeaderErrors=validateMessagesHeader(envelope);if(messagesHeaderErrors.length)return messagesHeaderErrors;
  if(entries[0]?.type!=='run_started' || entries[0].payload?.lifePolicyVersion!==PRODUCTION.id || !same(entries[0].payload?.lifeConfig,PRODUCTION))return ['Missing or mismatched five-slot policy start'];
  let life={policyVersion:PRODUCTION.id,config:{...PRODUCTION},schedule:createSchedule(PRODUCTION,PLAYTEST_WORK_CALENDAR),
    finance:initialFinance(),social46:null,socialRevision:0,socialOperationIds:{},sold:[],story47:null};
  let balances={cashCents:Math.round(PRODUCTION.startCash*100),health:PRODUCTION.startHealth},gems=0,expectedTerminal=null,terminalRoute=null,retentionOpen=false,retentionUsed=false,leaveRequested=false,receiptSeen=false,expectedStoryIncome=null,appOpened=false;
  const shownStages=[];let expectedInterruptions=[],completionInterruptions=null;
  const deliveries=new Map(),reads=new Set();
  const errors=[...validateSeededDrawHistory(envelope),...(envelope.schemaVersion===6?(verifiedV2?[]:['Schema-6 race history requires async verification']):validateSeededRaceHistory(envelope))];
  if(errors.length)return errors;
  for(let i=0;i<entries.length;i++) {
    const entry=entries[i];
    if(envelope.schemaVersion===6&&entry.type==='action'&&entry.payload?.kind==='race_ability_assigned'&&entry.clock?.day!==life.schedule.day){
      errors.push(`Ability assignment day mismatch at ${entry.seq}`);break;
    }
    if(envelope.schemaVersion===6&&entry.type==='race_choice_offered'&&Object.hasOwn(entry.payload??{},'candidateEvidenceVersion')
      &&(entry.clock?.day!==life.schedule.day||entry.payload.referenceDay!==life.schedule.day)){
      errors.push(`Candidate exposure day mismatch at ${entry.seq}`);break;
    }
    if(expectedStoryIncome) {
      if(entry.type!=='income' || !same(entry.payload,expectedStoryIncome)){errors.push(`Work income evidence mismatch at ${entry.seq}`);break;}
      expectedStoryIncome=null;continue;
    }
    if(expectedTerminal) {
      if(entry.type!=='terminal' || !same(entry.payload,expectedTerminal))errors.push(`Financial terminal mismatch at ${entry.seq}`);
      expectedTerminal=null;if(errors.length)break;terminalRoute='running_on_empty';
      continue;
    }
    if(i>0 && envelope.messagesPolicy==='messages-v1' && !terminalRoute && !leaveRequested) {
      const expected=deliveryPayloads(life).filter(p=>!deliveries.has(p.id));
      if(expected.length && (entry.type!=='message_delivered' || !same(entry.payload,expected[0]))) {errors.push(`Missing Messages delivery before ${entry.seq}`);break;}
    }
    if(terminalRoute) {
      if(entry.type!=='receipt_shown' || receiptSeen || entry.payload?.route!==terminalRoute){errors.push(`Unexpected event after terminal at ${entry.seq}`);break;}
      receiptSeen=true;continue;
    }
    if(completionInterruptions!==null) {
      if(completionInterruptions.length) {
        const expected=completionInterruptions.shift();if(entry.type!==expected.type || !same(entry.payload,expected.payload)){errors.push(`Invalid interruption before run completion at ${entry.seq}`);break;}
        continue;
      }
      if(entry.type!=='terminal' || entry.payload?.route!=='run_complete'){errors.push(`Unexpected event after run interruption at ${entry.seq}`);break;}
      completionInterruptions=null;
    }
    if(leaveRequested && expectedInterruptions.length) {
      const expected=expectedInterruptions.shift();
      if(entry.type!==expected.type || !same(entry.payload,expected.payload)){errors.push(`Invalid interruption after uninstall choice at ${entry.seq}`);break;}
      continue;
    }
    if(leaveRequested && entry.type!=='terminal') {errors.push(`Unexpected event after uninstall choice at ${entry.seq}`);break;}
    if(typeof entry.type === 'string' && entry.type.startsWith('message_')) {
      const p=entry.payload;
      if(envelope.messagesPolicy!=='messages-v1' || retentionOpen) {errors.push(`Messages policy unavailable at ${entry.seq}`);break;}
      if(entry.type==='message_delivered') {
        if(!isDeliveryPayload(p) || deliveries.has(p.id) || !deliveryCandidate(life,p.kind,p.id)) {errors.push(`Invalid Messages delivery at ${entry.seq}`);break;}
        deliveries.set(p.id,p.revision);continue;
      }
      if(entry.type==='message_read') {
        if(!p || Object.keys(p).sort().join(',')!=='id,revision' || typeof p.id!=='string' || p.id.length>80 || deliveries.get(p.id)!==p.revision || reads.has(p.id)) {errors.push(`Invalid Messages read at ${entry.seq}`);break;}
        reads.add(p.id);continue;
      }
      errors.push(`Unsupported Messages event at ${entry.seq}`);break;
    }
    if(entry.type==='action' && entry.payload?.kind==='quackpot_opened') {
      if(appOpened || entry.payload.app!=='Quackpot' || (life.schedule.day===1 && !['evening','late-evening'].includes(life.schedule.slot))) {errors.push(`Invalid app entry at ${entry.seq}`);break;}
      appOpened=true;continue;
    }
    if(entry.type==='action' && entry.payload?.kind==='uninstall_chosen') {
      if(retentionOpen || entries[i+1]?.type!=='retention_modal_shown') {errors.push(`Invalid uninstall prompt at ${entry.seq}`);break;}
      const modal=entries[i+1].payload;if(modal?.gemsOffered!==(retentionUsed?0:GAME_CONSTANTS.RETENTION_GEMS)){errors.push(`Invalid retention offer at ${entry.seq}`);break;}
      retentionOpen=true;i++;continue;
    }
    if(entry.type==='action' && entry.payload?.kind==='play_out_the_trap') {
      const reward=entries[i+1];if(!retentionOpen || retentionUsed || reward?.type!=='reward' || reward.payload?.kind!=='retention_gems' || reward.payload.gems!==GAME_CONSTANTS.RETENTION_GEMS || reward.payload.gemsAfter!==gems+GAME_CONSTANTS.RETENTION_GEMS){errors.push(`Invalid retention reward at ${entry.seq}`);break;}
      gems+=GAME_CONSTANTS.RETENTION_GEMS;retentionUsed=true;retentionOpen=false;i++;continue;
    }
    if(entry.type==='action' && entry.payload?.kind==='stay_without_reward') {if(!retentionOpen || !retentionUsed){errors.push(`Invalid retention choice at ${entry.seq}`);break;}retentionOpen=false;continue;}
    if(entry.type==='action' && entry.payload?.kind==='leave_immediately') {
      if(!retentionOpen){errors.push(`Invalid uninstall choice at ${entry.seq}`);break;}
      expectedInterruptions=exitInterruptions(life,entries.slice(0,i));
      retentionOpen=false;leaveRequested=true;continue;
    }
    if(['social46_interrupted','social46_plan_interrupted','activity47_interrupted','work_interrupted','session_interrupted'].includes(entry.type)) {
      completionInterruptions=exitInterruptions(life,entries.slice(0,i));const expected=completionInterruptions.shift();
      if(!expected || entry.type!==expected.type || !same(entry.payload,expected.payload)){errors.push(`Invalid interruption before run completion at ${entry.seq}`);break;}
      continue;
    }
    if(entry.type==='terminal') {
      if(entry.payload?.route==='uninstall' && leaveRequested)terminalRoute='uninstall';
      else if(entry.payload?.route==='run_complete' && !leaveRequested && !retentionOpen && exitInterruptions(life,entries.slice(0,i)).length===0)terminalRoute='run_complete';
      else {errors.push(`Unsupported terminal at ${entry.seq}`);break;}
      continue;
    }
    if(retentionOpen && ['life52_intent','life52_social_intent','life52_work_story_intent','life52_activity_story_intent','purchase','income','draw_committed','race_result','race_attempt_unresolved'].includes(entry.type)) {errors.push(`Gameplay while retention prompt was open at ${entry.seq}`);break;}
    if(entry.type==='story47_shown') {
      const story=life.story47,key=`${entry.payload?.id}:${entry.payload?.stage}`;
      const beats=story?.kind==='work' && story.stage==='commute'?[story.story.commute]:story?.kind==='work' && story.stage==='work'?[...story.story.work]:story?.kind==='activity' && story.stage==='scene'?[story.choice]:null;
      if(!story || story.id!==entry.payload?.id || story.stage!==entry.payload?.stage || !beats || entry.payload.version!==1 || !same(entry.payload.beats,beats) || shownStages.includes(key)){errors.push(`Invalid displayed work story at ${entry.seq}`);break;}
      shownStages.push(key);continue;
    }
    if(entry.type==='life52_schedule_warning_cancelled') {
      const operationId=entry.payload?.operationId,earlier=entries.slice(0,i);
      const shown=earlier.findLastIndex(event=>event.type==='life52_schedule_warning_shown' && event.payload?.proposal?.intent?.action?.operationId===operationId);
      const cancelled=earlier.findLastIndex(event=>event.type==='life52_schedule_warning_cancelled' && event.payload?.operationId===operationId);
      if(typeof operationId!=='string' || shown<0 || shown<=cancelled || Object.hasOwn(life.schedule.completedOperationIds,operationId)){errors.push(`Invalid warning cancellation at ${entry.seq}`);break;}
      continue;
    }
    if(entry.type==='life52_activity_warning_cancelled') {
      const {choice,operationId}=entry.payload??{},earlier=entries.slice(0,i);
      const shown=earlier.findLastIndex(event=>event.type==='life52_activity_warning_shown' && event.payload?.choice===choice && event.payload?.operationId===operationId);
      const cancelled=earlier.findLastIndex(event=>event.type==='life52_activity_warning_cancelled' && event.payload?.choice===choice && event.payload?.operationId===operationId);
      if(!['call_mom','sit_duck'].includes(choice) || typeof operationId!=='string' || shown<0 || shown<=cancelled || Object.hasOwn(life.storyOperationIds??{},operationId)){errors.push(`Invalid activity warning cancellation at ${entry.seq}`);break;}
      continue;
    }
    if(entry.type==='income') {
      const p=entry.payload, amount={couch:30,tv:40}[p?.asset];
      const view={social46:life.social46,day:life.schedule.day,sold:life.sold};
      if(p?.kind!=='asset_sale' || !amount || p.amount!==amount || life.sold.includes(p.asset) || life.schedule.recovery
        || (p.asset==='couch' && social46NeedsSaleDisclosure(view)) || p.cashAfter!==(balances.cashCents+amount*100)/100) {errors.push(`Invalid asset sale at ${entry.seq}`);break;}
      life.sold.push(p.asset);if(p.asset==='couch')social46CouchSold({social46:life.social46});balances.cashCents+=amount*100;continue;
    }
    if(entry.type==='action' && entry.payload?.kind==='race_trial_purchased') {
      const due=dueObligations(latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot}),balances.cashCents);
      if(life.schedule.recovery || due.bills.length){errors.push(`Race trial purchased while payment or recovery was pending at ${entry.seq}`);break;}
    }
    if(entry.type==='purchase' && entry.payload?.price>0) {
      const p=entry.payload, price=new Map([[60,99],[330,499],[1090,1499]]).get(p.bundleGems);
      const due=dueObligations(latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot}),balances.cashCents);
      if(p.kind!=='bundle' || price===undefined || p.price!==price/100 || balances.cashCents<price || life.schedule.recovery || due.bills.length || !appOpened || p.cashAfter!==(balances.cashCents-price)/100 || p.gemsAfter!==gems+p.bundleGems) {errors.push(`Invalid cash purchase at ${entry.seq}`);break;}
      balances.cashCents-=price;gems+=p.bundleGems;continue;
    }
    if(!['life52_intent','life52_social_intent','life52_work_story_intent','life52_activity_story_intent'].includes(entry.type)) {
      if(entry.type==='life52_due_options_shown' && Object.hasOwn(entry.payload ?? {},'displayVersion')) {
        const dueNow=dueObligations(latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot}),balances.cashCents);
        if(!same(entry.payload,displayedDueOptions(life,dueNow))) {errors.push(`Invalid due display evidence at ${entry.seq}`);break;}
      }
      if(['life52_effect','life52_commit'].includes(entry.type))errors.push(`Orphan transaction evidence at ${entry.seq}`);
      if(entry.type==='draw_committed' || ['race_result','race_attempt_unresolved'].includes(entry.type))errors.push(`Unbound gameplay outcome at ${entry.seq}`);
      if(entry.type==='reward' || entry.type==='terminal' || (entry.type==='purchase' && !(entry.payload?.price>0)))errors.push(`Unsupported standalone outcome at ${entry.seq}`);
      continue;
    }
    const end=entries.findIndex((event,index)=>index>i && event.type==='life52_commit');
    if(end<0 || entries.slice(i+1,end).some(event=>['life52_intent','life52_social_intent','life52_work_story_intent','life52_activity_story_intent'].includes(event.type))) {errors.push(`Incomplete transaction at ${entry.seq}`);break;}
    const inside=entries.slice(i+1,end), actualEvents=inside.filter(event=>event.type==='life52_effect').map(event=>event.payload?.effect);
    const intent=entry.payload?.intent, finance=latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot});
    if(entries[0].payload?.tutorialShiftVersion && entry.type==='life52_intent' && intent?.domain==='schedule' && intent.action?.type==='start' && intent.action?.kind==='work') {errors.push(`Tutorial work bypasses story at ${entry.seq}`);break;}
    const due=dueObligations(finance,balances.cashCents), rent=due.bills.find(bill=>bill.id.startsWith('rent-'));
    const options=availableDueOptions(life,due), displayed=displayedDueOptions(life,due);
    const wasShown=(type,payload)=>entries.slice(0,i).some(event=>event.type===type && same(event.payload,payload));
    const context={schedule:{overtimeReservation:structuredClone(life.schedule.overtimeReservation),
      rentObligation:rent?{id:rent.id,status:'due'}:null},optionsDisclosed:due.bills.length>0 && (wasShown('life52_due_options_shown',options) || wasShown('life52_due_options_shown',displayed))};
    if(intent?.action?.type==='accept_loan') {
      const bill=due.bills.find(item=>item.id===intent.action.billId && item.id.startsWith('rent-'));
      const principalCents=bill?bill.amountCents-balances.cashCents:0,feeCents=Math.ceil(principalCents/2);
      const terms={billId:intent.action.billId,cashCents:balances.cashCents,principalCents,feeCents,totalCents:principalCents+feeCents,
        due:{day:life.schedule.day+5,slot:'midday'},scheduleRevision:life.schedule.revision,financeRevision:life.finance.revision};
      if(principalCents<=0 || !wasShown('life52_loan_terms_shown',terms)){errors.push(`Loan terms were not shown at ${entry.seq}`);break;}
    }
    const gameplay=intent?.domain==='schedule' && intent?.action?.type==='play';
    let operation=entry.payload?.operation??{};
    if(gameplay) {
      if(!appOpened) {errors.push(`Gameplay before app entry at ${entry.seq}`);break;}
      context.schedule.operationAvailable=true;
      const other=inside.filter(event=>event.type!=='life52_effect');
      const firstEffect=inside.findIndex(event=>event.type==='life52_effect');
      if(firstEffect>=0 && inside.slice(firstEffect).some(event=>event.type!=='life52_effect')) {errors.push(`Gameplay evidence out of order at ${entry.seq}`);break;}
      if(intent.action.kind==='pull') {
        const draws=other.filter(event=>event.type==='draw_committed'), purchases=other.filter(event=>event.type==='purchase');
        const expectedKind=draws.length===1?'single_pull':'ten_pull',expectedCost=draws.length===1?160:1600;
        if(![1,10].includes(draws.length) || purchases.length>1 || other.some(event=>!['draw_committed','purchase'].includes(event.type)) || (purchases.length===0 && draws.length!==10)
          || (purchases.length===1 && (other[0]!==purchases[0] || purchases[0].payload?.kind!==expectedKind || purchases[0].payload?.cost!==expectedCost || purchases[0].payload?.price!==0))) {errors.push(`Invalid draw transaction at ${entry.seq}`);break;}
        if(purchases.length) {if(gems<expectedCost || purchases[0].payload.gemsAfter!==gems-expectedCost){errors.push(`Invalid draw payment at ${entry.seq}`);break;}gems-=expectedCost;}
        operation={...operation,success:true,operationId:intent.action.operationId,resultRef:`draw:${draws[0].seq}`};
      } else if(intent.action.kind==='race') {
        const outcomes=other.filter(event=>['race_result','race_attempt_unresolved'].includes(event.type));
        const choices=other.filter(event=>event.type==='action' && event.payload?.kind==='race_choice');
        if(outcomes.length!==1 || choices.length!==1 || choices[0].payload.raceId!==outcomes[0].payload?.raceId || typeof outcomes[0].payload?.resolutionDigest!=='string' || other.some(event=>!['race_rest_policy_activated','action','race_result','race_attempt_unresolved','reward'].includes(event.type))) {errors.push(`Invalid race transaction at ${entry.seq}`);break;}
        const ordered=other.filter(event=>event.type!=='race_rest_policy_activated');
        const expected=[choices[0],outcomes[0]];
        if(outcomes[0].type==='race_result' && choices[0].payload.trialCommitted)expected.push(other.find(event=>event.type==='action' && event.payload?.kind==='race_trial_consumed'));
        if(outcomes[0].type==='race_result' && outcomes[0].payload.payoutGems>0)expected.push(other.find(event=>event.type==='reward' && event.payload?.kind==='race_gems'));
        if(expected.some(event=>!event) || !same(ordered,expected) || other.filter(event=>event.type==='race_rest_policy_activated').length>1 || (other.some(event=>event.type==='race_rest_policy_activated') && other[0].type!=='race_rest_policy_activated')) {errors.push(`Invalid race evidence order at ${entry.seq}`);break;}
        if(outcomes[0].type==='race_result') {const payout=outcomes[0].payload.payoutGems;if(outcomes[0].payload.gemsAfter!==gems+payout || (payout>0 && expected.at(-1)?.payload?.gemsAfter!==gems+payout)){errors.push(`Invalid race reward balance at ${entry.seq}`);break;}gems+=payout;}
        operation={...operation,success:true,operationId:intent.action.operationId,resultRef:`race:${outcomes[0].payload.resolutionDigest}`};
      } else {errors.push(`Unsupported gameplay at ${entry.seq}`);break;}
    } else if(inside.some(event=>event.type!=='life52_effect')) {errors.push(`Unsupported transaction evidence at ${entry.seq}`);break;}
    let result;
    if(entry.type==='life52_social_intent') result=stageSocialTransition(life,balances,intent,context);
    else if(entry.type==='life52_work_story_intent')result=stageWorkStory(life,balances,intent,{...context,seed:entries[0].payload.seed,shownStages});
    else if(entry.type==='life52_activity_story_intent') {
      const preview=intent?.type==='start'?prepareActivityStory(life,balances,intent,context):null;
      const earlier=entries.slice(0,i),shown=preview?.ok?earlier.findLastIndex(event=>event.type==='life52_activity_warning_shown' && same(event.payload,{choice:intent.choice,operationId:intent.operationId,proposal:preview.proposal})):-1;
      const cancelled=earlier.findLastIndex(event=>event.type==='life52_activity_warning_cancelled' && event.payload?.choice===intent?.choice && event.payload?.operationId===intent?.operationId);
      const warningShown=shown>=0 && shown>cancelled;
      const plan=life.social46?.pending,conflictShownKinds=earlier.filter(e=>e.type==='life52_effect' && e.payload?.effect?.type==='social46_display' && e.payload.effect.payload?.id===plan?.id && e.payload.effect.payload?.atDay===life.schedule.day).map(e=>e.payload.effect.payload.kind);
      result=stageActivityStory(life,balances,intent,{...context,shownStages,warningShown,conflictShownKinds});
    }
    else {
      const proposal=inspectLifeTransaction(life,balances,intent,context);
      if(!proposal.ok){errors.push(`Invalid transaction at ${entry.seq}: ${proposal.reason}`);break;}
      if(entries[0].payload?.tutorialShiftVersion && proposal.proposal.domain==='schedule' && proposal.proposal.schedule.disclosures.length) {
        const earlier=entries.slice(0,i),shown=earlier.findLastIndex(event=>event.type==='life52_schedule_warning_shown' && same(event.payload,{proposal:proposal.proposal}));
        const cancelled=earlier.findLastIndex(event=>event.type==='life52_schedule_warning_cancelled' && event.payload?.operationId===intent.action.operationId);
        if(shown<0 || shown<=cancelled){errors.push(`Schedule warning was not shown at ${entry.seq}`);break;}
      }
      result=commitLifeTransaction(life,balances,proposal.proposal,operation,context);
    }
    const commit=entries[end].payload;
    if(!result?.ok || !same(result.events,actualEvents) || commit?.domain!==(entry.type==='life52_social_intent'?'social':entry.type==='life52_work_story_intent'?'work_story':entry.type==='life52_activity_story_intent'?'activity_story':intent?.domain) || commit?.cashDeltaCents!==result.cashDeltaCents || commit?.healthDelta!==result.healthDelta || commit?.operationId!==(intent?.operationId??intent?.action?.operationId??intent?.action?.id)) {
      errors.push(`Transaction mismatch at ${entry.seq}`);break;
    }
    if(envelope.schemaVersion===6&&gameplay&&intent.action.kind==='race'){
      const race=inside.find(event=>['race_result','race_attempt_unresolved'].includes(event.type));
      if(race?.payload?.entryDay!==result.state.schedule.day){errors.push(`Race entry day mismatch at ${entry.seq}`);break;}
    }
    life=result.state;balances={cashCents:balances.cashCents+result.cashDeltaCents,health:balances.health+result.healthDelta};
    if(entry.type==='life52_work_story_intent' && intent.type==='complete')expectedStoryIncome={kind:'wage',amount:result.cashDeltaCents/100,transactionId:intent.id,cashAfter:balances.cashCents/100,source:'five-slot-work-story'};
    const terminal=result.events.find(event=>event.type==='financial_default');
    if(terminal)expectedTerminal={route:'running_on_empty',reason:terminal.reason,obligationId:terminal.obligationId,
      outstandingCents:terminal.outstandingCents,housingLost:terminal.route==='housing_loss'};
    i=end;
  }
  if(expectedTerminal)errors.push('Missing financial terminal event');
  if(!terminalRoute && envelope.messagesPolicy==='messages-v1' && deliveryPayloads(life).some(p=>!deliveries.has(p.id)))errors.push('Missing Messages delivery at end of history');
  if(expectedStoryIncome)errors.push('Missing work income evidence');
  if(expectedInterruptions.length)errors.push('Missing interruption evidence after uninstall choice');
  if(completionInterruptions!==null)errors.push('Missing terminal after run interruption');
  if(leaveRequested && !terminalRoute)errors.push('Missing terminal after uninstall choice');
  if(!errors.length && terminalRoute && (envelope.state?.terminalRoute!==terminalRoute || envelope.state?.phase!==(receiptSeen?'receipt_presented':'terminal')))errors.push('Terminal does not match saved state');
  if(!errors.length && !terminalRoute && ['terminal','receipt_presented'].includes(envelope.state?.phase))errors.push('Saved terminal has no matching event');
  if(!errors.length && Boolean(envelope.state?.retentionUsed)!==retentionUsed)errors.push('Retention reward state does not match history');
  if(!errors.length && Boolean(envelope.state?.tenPullCommitted)!==entries.some(event=>event.type==='draw_committed' && event.payload?.advancesPity===false))errors.push('Promotional pull state does not match history');
  const debt=life.finance.loans.filter(loan=>['pending','defaulted'].includes(loan.status)).reduce((sum,loan)=>sum+loan.totalCents,0)/100;
  if(!errors.length && envelope.state?.debt!==debt)errors.push('Reconstructed debt does not match saved state');
  if(!errors.length && envelope.state?.gems!==gems)errors.push('Reconstructed Gem balance does not match saved state');
  if(!errors.length && (envelope.state?.day!==life.schedule.day || envelope.state?.clock?.day!==life.schedule.day || envelope.state?.clock?.label!==`day ${life.schedule.day} ${life.schedule.slot}`))errors.push('Reconstructed schedule clock does not match saved state');
  if(!errors.length && (!same(life,envelope.state?.life) || balances.cashCents!==Math.round(envelope.state?.cash*100) || balances.health!==envelope.state?.health))errors.push('Reconstructed life or balances do not match saved state');
  return errors;
}

export function validateFiveSlotTransactionHistory(envelope){return validateTransactions(envelope,false);}

export function validateSchema6WithCandidates(envelope,candidates){
  try{
    const headerErrors=validateMessagesHeader(envelope);if(headerErrors.length)return headerErrors;
    const plan=createRaceHistoryPlan(envelope,{roster:BANNER_1_ROSTER,constants:GAME_CONSTANTS});
    if(!Array.isArray(candidates)||candidates.length!==plan.records.length)throw new RangeError('missing verified candidates');
    for(let i=0;i<candidates.length;i++){
      const candidate=candidates[i];if(!isVerifiedWorkerCandidate(candidate)||!same(candidate.compact,plan.records[i])||stableStringify(plan.deriveInput(i,plan.records[i]))!==stableStringify(plan.records[i].input))throw new RangeError('unverified race candidate');
      plan.onResult(i,candidate);
    }
    plan.finish();return validateTransactions(envelope,true);
  }catch(error){return [`Schema-6 replay failed: ${error.message}`];}
}

/** Full schema-6 replay; no caller-provided token can substitute for reconstruction. */
export async function validateFiveSlotTransactionHistoryAsync(envelope,{signal,onProgress=()=>{},onValidated=()=>{}}={}){
  if(envelope?.schemaVersion!==6)return validateTransactions(envelope,false);
  const headerErrors=validateMessagesHeader(envelope);if(headerErrors.length)return headerErrors;
  const queue=createRestoreQueue();const abort=()=>queue.cancel();signal?.addEventListener('abort',abort,{once:true});
  try{
    if(signal?.aborted)throw new Error('restore canceled');
    const plan=createRaceHistoryPlan(envelope,{roster:BANNER_1_ROSTER,constants:GAME_CONSTANTS});
    const candidates=await queue.reconstruct(plan.records,{context:{runId:envelope.eventLog[0].payload.seed,operationId:'restore',revision:String(envelope.state.life.schedule.revision),logLength:String(envelope.eventLog.length),stateIdentity:'full-history'},
      deriveInput:plan.deriveInput,onResult:plan.onResult,onProgress});
    plan.finish();const errors=validateSchema6WithCandidates(envelope,candidates);if(!errors.length)onValidated(candidates);return errors;
  }catch(error){return [`Schema-6 replay failed: ${error.message}`];}
  finally{signal?.removeEventListener('abort',abort);queue.cancel();}
}
export function validateSeededDrawHistory(envelope) {
  const entries=envelope?.eventLog, starts=Array.isArray(entries)?entries.filter(e=>e.type==='run_started'):[];
  if(starts.length!==1 || typeof starts[0].payload?.seed!=='string')return ['Missing or duplicate seeded run start'];
  const seed=starts[0].payload.seed, root=createRng(seed), draw=root.fork('draw');
  let pity=0, promoSeen=false; const owned=new Set(), errors=[];
  for(let i=0;i<entries.length;) {
    const event=entries[i]; let count=0, paid=false;
    if(event.type==='purchase' && ['single_pull','ten_pull'].includes(event.payload?.kind)) {
      paid=true;count=event.payload.kind==='single_pull'?1:10;i++;
    } else if(event.type==='draw_committed') {
      if(promoSeen){errors.push(`Unexpected unpurchased draw batch at ${event.seq}`);break;}
      promoSeen=true;count=10;
    } else {i++;continue;}
    for(let n=1;n<=count;n++,i++) {
      const actual=entries[i];
      if(actual?.type!=='draw_committed'){errors.push(`Incomplete ${paid?'paid':'promotional'} draw batch`);break;}
      const odds=calculatePreDrawOdds(pity), roll=draw.next();
      const rarity=roll<odds.legendary?'legendary':roll<odds.legendary+odds.rare?'rare':'common';
      const pool=BANNER_1_ROSTER.filter(x=>x.tier===rarity), item=pool[draw.int(pool.length)];
      const duplicate=owned.has(item.id), downGained=duplicate?GAME_CONSTANTS.DOWN_PER_DUPLICATE[rarity]:0;
      const expected={drawIndex:n,of:count,pityBefore:pity,drawNumberInWindow:pity+1,odds,rarity,identity:item.id,duplicate,downGained,advancesPity:paid};
      if(!same(actual.payload,expected))errors.push(`Seeded draw mismatch at ${actual.seq}`);
      owned.add(item.id);if(paid)pity=rarity==='legendary'?0:pity+1;
    }
  }
  if(envelope?.prngStreams?.draw!==draw.serialize())errors.push('Draw RNG state does not match seeded draw history');
  for(const [name,rng] of [['root',root],['race',root.fork('race')],['event',root.fork('event')]]) {
    if(envelope?.prngStreams?.[name]!==rng.serialize())errors.push(`${name} RNG state does not match seeded history`);
  }
  return errors;
}

// Reconstruct race inputs from recorded choice, prior history and canonical rules,
// then rerun the pure resolver rather than trusting the saved resolution inputs.
export function validateSeededRaceHistory(envelope) {
  const entries=envelope?.eventLog, starts=Array.isArray(entries)?entries.filter(e=>e.type==='run_started'):[];
  if(starts.length!==1 || typeof starts[0].payload?.seed!=='string')return ['Missing or duplicate seeded run start'];
  const seed=starts[0].payload.seed, errors=[], seen=new Set(); let trialAvailable=false, expectedRaceNumber=1,down=0;
  for(let i=0;i<entries.length;i++) {
    const e=entries[i];
    if(e.type==='draw_committed' && e.payload?.duplicate)down+=e.payload.downGained??0;
    if(e.type==='action' && e.payload?.kind==='down_spent') {const amount=e.payload.amount;if(!Number.isSafeInteger(amount) || amount<0 || amount>down)errors.push(`Invalid Down spending at ${e.seq}`);else down-=amount;}
    if(e.type==='action' && e.payload?.kind==='race_trial_purchased'){if(trialAvailable || e.payload.costDown!==GAME_CONSTANTS.RACE_TRIAL_COST || down<GAME_CONSTANTS.RACE_TRIAL_COST)errors.push(`Invalid race trial purchase at ${e.seq}`);down-=GAME_CONSTANTS.RACE_TRIAL_COST;trialAvailable=true;continue;}
    if(e.type==='action' && e.payload?.kind==='race_trial_consumed'){
      const outcome=entries[i-1],choice=entries[i-2];
      if(!trialAvailable || outcome?.type!=='race_result' || choice?.type!=='action' || choice.payload?.kind!=='race_choice' || !choice.payload.trialCommitted || choice.payload.raceId!==e.payload.raceId || outcome.payload?.raceId!==e.payload.raceId)errors.push(`Race trial consumed without matching completed race at ${e.seq}`);
      trialAvailable=false;continue;
    }
    if(e.type!=='action'||e.payload?.kind!=='race_choice')continue;
    const p=e.payload, next=entries[i+1];
    if(!next || !['race_result','race_attempt_unresolved'].includes(next.type)){errors.push(`Missing race outcome after ${e.seq}`);continue;}
    const n=next.payload?.raceNumber, duck=BANNER_1_ROSTER.find(x=>x.id===p.duckId);
    if(!Number.isSafeInteger(n)||n<1||p.raceId!==`R${String(n).padStart(2,'0')}`||seen.has(p.raceId)||!duck||!['safe','sprint'].includes(p.stance)||typeof p.trialCommitted!=='boolean') {errors.push(`Invalid race choice at ${e.seq}`);continue;}
    if(n!==expectedRaceNumber)errors.push(`Race sequence mismatch at ${e.seq}`); expectedRaceNumber=n+1;
    seen.add(p.raceId); if(p.trialCommitted && !trialAvailable)errors.push(`Race trial unavailable at ${e.seq}`);
    const prior=entries.slice(0,i), owned=prior.some(x=>x.type==='draw_committed' && x.payload?.identity===duck.id && x.payload?.duplicate===false);
    if(!owned){errors.push(`Unowned race entrant at ${e.seq}`);continue;}
    const rest=makeRaceRestEvidence(prior,duck.id,duck.speed);
    if(!same(p.restEvidence,{...rest,trialCommitted:p.trialCommitted,trialMultiplier:GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER}))errors.push(`Race rest evidence mismatch at ${e.seq}`);
    const input={seed,raceId:p.raceId,authoredPlayerRating:duck.speed,playerBaseSpeed:rest.effectiveBaseInput,restFactor:rest.restFactor,fieldBaseSpeed:n===1?GAME_CONSTANTS.TUTORIAL_FIELD_SPEED:GAME_CONSTANTS.FINALE_FIELD_SPEED,choice:p.stance==='safe'?'steady':'sprint',trialCommitted:p.trialCommitted,trialMultiplier:GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1};
    try {
      const result=resolveSeededRace(input), encoded=serializeRaceResolution(result), player=result.finish.find(x=>x.id==='P')??null, rival=n===2?result.finish.find(x=>x.id==='A'):null;
      if(!same(envelope.state?.raceResolutions?.[p.raceId],encoded.encoded))errors.push(`Seeded race resolution mismatch for ${p.raceId}`);
      if(next.payload?.resolutionDigest!==encoded.digest || next.payload?.raceId!==p.raceId || next.payload?.duckId!==p.duckId)errors.push(`Race outcome identity mismatch for ${p.raceId}`);
      if(result.status==='finished' && result.finish.length===6 && player?.place) {
        const expected={status:'finished',resolutionStatus:result.status,stance:p.stance,trialConsumed:p.trialCommitted,restEvidence:p.restEvidence,
          place:player.place,payoutGems:player.payout,rivalPlace:rival?.place??null,playerPerf:player.sampledPerformance,winner:result.winner,finishTimeSeconds:result.finishTimeSeconds,lastFinishTimeSeconds:result.lastFinishTimeSeconds,finishOrder:result.finish.map(x=>({id:x.id,place:x.place,payout:x.payout}))};
        if(next.type!=='race_result'||Object.entries(expected).some(([k,v])=>!same(next.payload?.[k],v)))errors.push(`Seeded race outcome mismatch for ${p.raceId}`);
        const consumed=entries[i+2], reward=entries[i+(p.trialCommitted?3:2)];
        if(p.trialCommitted && (consumed?.type!=='action' || consumed.payload?.kind!=='race_trial_consumed' || consumed.payload?.raceId!==p.raceId || consumed.payload?.multiplier!==GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER))errors.push(`Missing race trial consumption for ${p.raceId}`);
        if(!p.trialCommitted && consumed?.type==='action' && consumed.payload?.kind==='race_trial_consumed')errors.push(`Unexpected race trial consumption for ${p.raceId}`);
        if(player.payout>0 && (reward?.type!=='reward'||reward.payload?.kind!=='race_gems'||reward.payload?.raceId!==p.raceId||reward.payload?.gems!==player.payout))errors.push(`Missing race reward for ${p.raceId}`);
      } else {
        const expected={status:'unresolved',resolutionStatus:result.status,unresolvedReason:result.unresolvedReason,
          guardEvidence:result.guardEvidence,knownCrossings:result.finishCrossings.map(crossing=>({id:crossing.id,crossingTimeSeconds:crossing.crossingTimeSeconds})),
          trialAvailable,trialCommitted:p.trialCommitted,restEvidence:p.restEvidence};
        if(next.type!=='race_attempt_unresolved' || Object.entries(expected).some(([key,value])=>!same(next.payload?.[key],value)))errors.push(`Seeded unresolved race mismatch for ${p.raceId}`);
      }
    } catch(error) {errors.push(`Race reconstruction failed for ${p.raceId}: ${error.message}`);}
  }
  for(let i=0;i<entries.length;i++){const e=entries[i];if(['race_result','race_attempt_unresolved'].includes(e.type) && (entries[i-1]?.type!=='action' || entries[i-1]?.payload?.kind!=='race_choice' || entries[i-1]?.payload?.raceId!==e.payload?.raceId))errors.push(`Race outcome lacks adjacent choice at ${e.seq}`);}
  return errors;
}
