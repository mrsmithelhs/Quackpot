// Independent seeded draw verification for five-slot replay. It consumes the
// recorded event stream, not pending-reveal snapshots or UI success references.
import {createRng} from './prng.mjs';
import {BANNER_1_ROSTER, GAME_CONSTANTS, calculatePreDrawOdds} from './game-engine.mjs';
import {makeRaceRestEvidence} from './race-rest.mjs';
import {resolveSeededRace,serializeRaceResolution} from './race-resolver.mjs';
import {PRODUCTION,PLAYTEST_WORK_CALENDAR,createSchedule} from './life-schedule/index.mjs';
import {initialFinance,latchDue,dueObligations} from './life-finance.mjs';
import {inspectLifeTransaction,commitLifeTransaction,stageSocialTransition,stageWorkStory} from './life-coordinator.mjs';
import {social46NeedsSaleDisclosure,social46CouchSold} from './life-social.mjs';
import {hasEnteredQuackpot} from './life-entry.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// Rebuild the coordinated portion from its original policy and recorded inputs.
// Fail closed on cases this first replay slice does not yet cover; this function
// is deliberately not connected to storage until every supported path is covered.
export function validateFiveSlotTransactionHistory(envelope) {
  const entries=envelope?.eventLog;
  if(!Array.isArray(entries))return ['Missing transaction history'];
  if(entries[0]?.type!=='run_started' || entries[0].payload?.lifePolicyVersion!==PRODUCTION.id || !same(entries[0].payload?.lifeConfig,PRODUCTION))return ['Missing or mismatched five-slot policy start'];
  let life={policyVersion:PRODUCTION.id,config:{...PRODUCTION},schedule:createSchedule(PRODUCTION,PLAYTEST_WORK_CALENDAR),
    finance:initialFinance(),social46:null,socialRevision:0,socialOperationIds:{},sold:[],story47:null};
  let balances={cashCents:Math.round(PRODUCTION.startCash*100),health:PRODUCTION.startHealth},gems=0,expectedTerminal=null,terminalRoute=null,retentionOpen=false,retentionUsed=false,leaveRequested=false,receiptSeen=false,expectedStoryIncome=null;
  const shownStages=[];
  const errors=[...validateSeededDrawHistory(envelope),...validateSeededRaceHistory(envelope)];
  if(errors.length)return errors;
  for(let i=0;i<entries.length;i++) {
    const entry=entries[i];
    if(expectedStoryIncome) {
      if(entry.type!=='income' || !same(entry.payload,expectedStoryIncome)){errors.push(`Work income evidence mismatch at ${entry.seq}`);break;}
      expectedStoryIncome=null;continue;
    }
    if(expectedTerminal) {
      if(entry.type!=='terminal' || !same(entry.payload,expectedTerminal))errors.push(`Financial terminal mismatch at ${entry.seq}`);
      expectedTerminal=null;if(errors.length)break;terminalRoute='running_on_empty';
      continue;
    }
    if(terminalRoute) {
      if(entry.type!=='receipt_shown' || receiptSeen || entry.payload?.route!==terminalRoute){errors.push(`Unexpected event after terminal at ${entry.seq}`);break;}
      receiptSeen=true;continue;
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
    if(entry.type==='action' && entry.payload?.kind==='leave_immediately') {if(!retentionOpen){errors.push(`Invalid uninstall choice at ${entry.seq}`);break;}retentionOpen=false;leaveRequested=true;continue;}
    if(entry.type==='terminal') {
      if(entry.payload?.route==='uninstall' && leaveRequested)terminalRoute='uninstall';
      else if(entry.payload?.route==='run_complete' && !leaveRequested && !retentionOpen)terminalRoute='run_complete';
      else {errors.push(`Unsupported terminal at ${entry.seq}`);break;}
      continue;
    }
    if(retentionOpen && ['life52_intent','life52_social_intent','life52_work_story_intent','purchase','income','draw_committed','race_result','race_attempt_unresolved'].includes(entry.type)) {errors.push(`Gameplay while retention prompt was open at ${entry.seq}`);break;}
    if(entry.type==='story47_shown') {
      const story=life.story47,key=`${entry.payload?.id}:${entry.payload?.stage}`;
      const beats=story?.kind==='work' && story.stage==='commute'?[story.story.commute]:story?.kind==='work' && story.stage==='work'?[...story.story.work]:null;
      if(!story || story.id!==entry.payload?.id || story.stage!==entry.payload?.stage || !beats || entry.payload.version!==1 || !same(entry.payload.beats,beats) || shownStages.includes(key)){errors.push(`Invalid displayed work story at ${entry.seq}`);break;}
      shownStages.push(key);continue;
    }
    if(entry.type==='income') {
      const p=entry.payload, amount={couch:30,tv:40}[p?.asset];
      const view={social46:life.social46,day:life.schedule.day,sold:life.sold};
      if(p?.kind!=='asset_sale' || !amount || p.amount!==amount || life.sold.includes(p.asset) || life.schedule.recovery
        || (p.asset==='couch' && social46NeedsSaleDisclosure(view)) || p.cashAfter!==(balances.cashCents+amount*100)/100) {errors.push(`Invalid asset sale at ${entry.seq}`);break;}
      life.sold.push(p.asset);if(p.asset==='couch')social46CouchSold({social46:life.social46});balances.cashCents+=amount*100;continue;
    }
    if(entry.type==='purchase' && entry.payload?.price>0) {
      const p=entry.payload, price=new Map([[60,99],[330,499],[1090,1499]]).get(p.bundleGems);
      const due=dueObligations(latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot}),balances.cashCents);
      if(p.kind!=='bundle' || price===undefined || p.price!==price/100 || balances.cashCents<price || life.schedule.recovery || due.bills.length || !hasEnteredQuackpot(entries.slice(0,i)) || p.cashAfter!==(balances.cashCents-price)/100 || p.gemsAfter!==gems+p.bundleGems) {errors.push(`Invalid cash purchase at ${entry.seq}`);break;}
      balances.cashCents-=price;gems+=p.bundleGems;continue;
    }
    if(!['life52_intent','life52_social_intent','life52_work_story_intent'].includes(entry.type)) {
      if(['life52_effect','life52_commit'].includes(entry.type))errors.push(`Orphan transaction evidence at ${entry.seq}`);
      if(entry.type==='draw_committed' || ['race_result','race_attempt_unresolved'].includes(entry.type))errors.push(`Unbound gameplay outcome at ${entry.seq}`);
      if(entry.type==='reward' || entry.type==='terminal' || (entry.type==='purchase' && !(entry.payload?.price>0)))errors.push(`Unsupported standalone outcome at ${entry.seq}`);
      continue;
    }
    const end=entries.findIndex((event,index)=>index>i && event.type==='life52_commit');
    if(end<0 || entries.slice(i+1,end).some(event=>['life52_intent','life52_social_intent','life52_work_story_intent'].includes(event.type))) {errors.push(`Incomplete transaction at ${entry.seq}`);break;}
    const inside=entries.slice(i+1,end), actualEvents=inside.filter(event=>event.type==='life52_effect').map(event=>event.payload?.effect);
    const intent=entry.payload?.intent, finance=latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot});
    const due=dueObligations(finance,balances.cashCents), rent=due.bills.find(bill=>bill.id.startsWith('rent-'));
    const options={bills:due.bills.map(bill=>({id:bill.id,amountCents:bill.amountCents??bill.totalCents})),
      cashCents:due.cashCents,totalCents:due.totalCents,shortfallCents:due.shortfallCents,
      saleOptions:['couch','tv'].filter(asset=>!life.sold.includes(asset)),
      loanRentIds:life.finance.loans.some(loan=>loan.status==='pending')?[]:due.bills.filter(bill=>bill.id.startsWith('rent-') && bill.amountCents>due.cashCents).map(bill=>bill.id),
      overtimeAvailable:!due.bills.some(bill=>bill.id.startsWith('loan-')) && due.bills.some(bill=>bill.id.startsWith('rent-'))
        && life.schedule.employment.employed && life.schedule.overtimeReservation?.status!=='reserved'
        && due.bills.some(bill=>bill.id.startsWith('rent-') && bill.id!==life.schedule.overtimeReservation?.rentId),
      scheduleRevision:life.schedule.revision,financeRevision:life.finance.revision};
    const wasShown=(type,payload)=>entries.slice(0,i).some(event=>event.type===type && same(event.payload,payload));
    const context={schedule:{overtimeReservation:structuredClone(life.schedule.overtimeReservation),
      rentObligation:rent?{id:rent.id,status:'due'}:null},optionsDisclosed:due.bills.length>0 && wasShown('life52_due_options_shown',options)};
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
      if(!hasEnteredQuackpot(entries.slice(0,i))) {errors.push(`Gameplay before app entry at ${entry.seq}`);break;}
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
    else {
      const proposal=inspectLifeTransaction(life,balances,intent,context);
      if(!proposal.ok){errors.push(`Invalid transaction at ${entry.seq}: ${proposal.reason}`);break;}
      result=commitLifeTransaction(life,balances,proposal.proposal,operation,context);
    }
    const commit=entries[end].payload;
    if(!result?.ok || !same(result.events,actualEvents) || commit?.domain!==(entry.type==='life52_social_intent'?'social':entry.type==='life52_work_story_intent'?'work_story':intent?.domain) || commit?.cashDeltaCents!==result.cashDeltaCents || commit?.healthDelta!==result.healthDelta || commit?.operationId!==(intent?.operationId??intent?.action?.operationId??intent?.action?.id)) {
      errors.push(`Transaction mismatch at ${entry.seq}`);break;
    }
    life=result.state;balances={cashCents:balances.cashCents+result.cashDeltaCents,health:balances.health+result.healthDelta};
    if(entry.type==='life52_work_story_intent' && intent.type==='complete')expectedStoryIncome={kind:'wage',amount:result.cashDeltaCents/100,transactionId:intent.id,cashAfter:balances.cashCents/100,source:'five-slot-work-story'};
    const terminal=result.events.find(event=>event.type==='financial_default');
    if(terminal)expectedTerminal={route:'running_on_empty',reason:terminal.reason,obligationId:terminal.obligationId,
      outstandingCents:terminal.outstandingCents,housingLost:terminal.route==='housing_loss'};
    i=end;
  }
  if(expectedTerminal)errors.push('Missing financial terminal event');
  if(expectedStoryIncome)errors.push('Missing work income evidence');
  if(!errors.length && terminalRoute && (envelope.state?.terminalRoute!==terminalRoute || envelope.state?.phase!==(receiptSeen?'receipt_presented':'terminal')))errors.push('Terminal does not match saved state');
  if(!errors.length && !terminalRoute && ['terminal','receipt_presented'].includes(envelope.state?.phase))errors.push('Saved terminal has no matching event');
  if(!errors.length && Boolean(envelope.state?.retentionUsed)!==retentionUsed)errors.push('Retention reward state does not match history');
  const debt=life.finance.loans.filter(loan=>['pending','defaulted'].includes(loan.status)).reduce((sum,loan)=>sum+loan.totalCents,0)/100;
  if(!errors.length && envelope.state?.debt!==debt)errors.push('Reconstructed debt does not match saved state');
  if(!errors.length && envelope.state?.gems!==gems)errors.push('Reconstructed Gem balance does not match saved state');
  if(!errors.length && (envelope.state?.day!==life.schedule.day || envelope.state?.clock?.day!==life.schedule.day || envelope.state?.clock?.label!==`day ${life.schedule.day} ${life.schedule.slot}`))errors.push('Reconstructed schedule clock does not match saved state');
  if(!errors.length && (!same(life,envelope.state?.life) || balances.cashCents!==Math.round(envelope.state?.cash*100) || balances.health!==envelope.state?.health))errors.push('Reconstructed life or balances do not match saved state');
  return errors;
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
    if(e.type==='action' && e.payload?.kind==='race_trial_consumed'){if(!trialAvailable)errors.push(`Race trial consumed without purchase at ${e.seq}`);trialAvailable=false;continue;}
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
