// Independent seeded draw verification for five-slot replay. It consumes the
// recorded event stream, not pending-reveal snapshots or UI success references.
import {createRng} from './prng.mjs';
import {BANNER_1_ROSTER, GAME_CONSTANTS, calculatePreDrawOdds} from './game-engine.mjs';
import {makeRaceRestEvidence} from './race-rest.mjs';
import {resolveSeededRace,serializeRaceResolution} from './race-resolver.mjs';
import {PRODUCTION,PLAYTEST_WORK_CALENDAR,createSchedule} from './life-schedule/index.mjs';
import {initialFinance,latchDue,dueObligations} from './life-finance.mjs';
import {inspectLifeTransaction,commitLifeTransaction,stageSocialTransition} from './life-coordinator.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// Rebuild the coordinated portion from its original policy and recorded inputs.
// Fail closed on cases this first replay slice does not yet cover; this function
// is deliberately not connected to storage until every supported path is covered.
export function validateFiveSlotTransactionHistory(envelope) {
  const entries=envelope?.eventLog;
  if(!Array.isArray(entries))return ['Missing transaction history'];
  let life={policyVersion:PRODUCTION.id,config:{...PRODUCTION},schedule:createSchedule(PRODUCTION,PLAYTEST_WORK_CALENDAR),
    finance:initialFinance(),social46:null,socialRevision:0,socialOperationIds:{},sold:[],story47:null};
  let balances={cashCents:Math.round(PRODUCTION.startCash*100),health:PRODUCTION.startHealth};
  const errors=[];
  for(let i=0;i<entries.length;i++) {
    const entry=entries[i];
    if(entry.type==='income' || (entry.type==='purchase' && entry.payload?.price>0)) {
      errors.push(`Unsupported external balance action at ${entry.seq}`);break;
    }
    if(!['life52_intent','life52_social_intent'].includes(entry.type)) {
      if(['life52_effect','life52_commit'].includes(entry.type))errors.push(`Orphan transaction evidence at ${entry.seq}`);
      continue;
    }
    const end=entries.findIndex((event,index)=>index>i && event.type==='life52_commit');
    if(end<0 || entries.slice(i+1,end).some(event=>['life52_intent','life52_social_intent'].includes(event.type))) {errors.push(`Incomplete transaction at ${entry.seq}`);break;}
    const inside=entries.slice(i+1,end), actualEvents=inside.filter(event=>event.type==='life52_effect').map(event=>event.payload?.effect);
    if(inside.some(event=>event.type!=='life52_effect')) {errors.push(`Unsupported transaction evidence at ${entry.seq}`);break;}
    const intent=entry.payload?.intent, finance=latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot});
    const due=dueObligations(finance,balances.cashCents), rent=due.bills.find(bill=>bill.id.startsWith('rent-'));
    const options={bills:due.bills.map(bill=>({id:bill.id,amountCents:bill.amountCents??bill.totalCents})),
      cashCents:due.cashCents,totalCents:due.totalCents,shortfallCents:due.shortfallCents,
      saleOptions:['couch','tv'].filter(asset=>!life.sold.includes(asset)),
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
    if(intent?.action?.type==='play') {
      errors.push(`Unsupported transaction kind at ${entry.seq}`);break;
    }
    let result;
    if(entry.type==='life52_social_intent') result=stageSocialTransition(life,balances,intent,context);
    else {
      const proposal=inspectLifeTransaction(life,balances,intent,context);
      if(!proposal.ok){errors.push(`Invalid transaction at ${entry.seq}: ${proposal.reason}`);break;}
      result=commitLifeTransaction(life,balances,proposal.proposal,entry.payload.operation??{},context);
    }
    const commit=entries[end].payload;
    if(!result?.ok || !same(result.events,actualEvents) || commit?.domain!==(entry.type==='life52_social_intent'?'social':intent?.domain) || commit?.cashDeltaCents!==result.cashDeltaCents || commit?.healthDelta!==result.healthDelta || commit?.operationId!==(intent?.operationId??intent?.action?.operationId??intent?.action?.id)) {
      errors.push(`Transaction mismatch at ${entry.seq}`);break;
    }
    life=result.state;balances={cashCents:balances.cashCents+result.cashDeltaCents,health:balances.health+result.healthDelta};
    i=end;
  }
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
  const seed=starts[0].payload.seed, errors=[], seen=new Set(); let trialAvailable=false, expectedRaceNumber=1;
  for(let i=0;i<entries.length;i++) {
    const e=entries[i];
    if(e.type==='action' && e.payload?.kind==='race_trial_purchased'){if(trialAvailable)errors.push(`Duplicate race trial at ${e.seq}`);trialAvailable=true;continue;}
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
        const expected={place:player.place,payoutGems:player.payout,rivalPlace:rival?.place??null,playerPerf:player.sampledPerformance,winner:result.winner,finishTimeSeconds:result.finishTimeSeconds,lastFinishTimeSeconds:result.lastFinishTimeSeconds,finishOrder:result.finish.map(x=>({id:x.id,place:x.place,payout:x.payout}))};
        if(next.type!=='race_result'||Object.entries(expected).some(([k,v])=>!same(next.payload?.[k],v)))errors.push(`Seeded race outcome mismatch for ${p.raceId}`);
        const consumed=entries[i+2], reward=entries[i+(p.trialCommitted?3:2)];
        if(p.trialCommitted && (consumed?.type!=='action' || consumed.payload?.kind!=='race_trial_consumed' || consumed.payload?.raceId!==p.raceId || consumed.payload?.multiplier!==GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER))errors.push(`Missing race trial consumption for ${p.raceId}`);
        if(!p.trialCommitted && consumed?.type==='action' && consumed.payload?.kind==='race_trial_consumed')errors.push(`Unexpected race trial consumption for ${p.raceId}`);
        if(player.payout>0 && (reward?.type!=='reward'||reward.payload?.kind!=='race_gems'||reward.payload?.raceId!==p.raceId||reward.payload?.gems!==player.payout))errors.push(`Missing race reward for ${p.raceId}`);
      } else if(next.type!=='race_attempt_unresolved' || next.payload?.resolutionStatus!==result.status) errors.push(`Seeded unresolved race mismatch for ${p.raceId}`);
    } catch(error) {errors.push(`Race reconstruction failed for ${p.raceId}: ${error.message}`);}
  }
  for(let i=0;i<entries.length;i++){const e=entries[i];if(['race_result','race_attempt_unresolved'].includes(e.type) && (entries[i-1]?.type!=='action' || entries[i-1]?.payload?.kind!=='race_choice' || entries[i-1]?.payload?.raceId!==e.payload?.raceId))errors.push(`Race outcome lacks adjacent choice at ${e.seq}`);}
  return errors;
}
