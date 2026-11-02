// Independent seeded draw verification for five-slot replay. It consumes the
// recorded event stream, not pending-reveal snapshots or UI success references.
import {createRng} from './prng.mjs';
import {BANNER_1_ROSTER, GAME_CONSTANTS, calculatePreDrawOdds} from './game-engine.mjs';
import {makeRaceRestEvidence} from './race-rest.mjs';
import {resolveSeededRace,serializeRaceResolution} from './race-resolver.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
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
  const seed=starts[0].payload.seed, errors=[], seen=new Set(); let trialAvailable=false;
  for(let i=0;i<entries.length;i++) {
    const e=entries[i];
    if(e.type==='action' && e.payload?.kind==='race_trial_purchased'){if(trialAvailable)errors.push(`Duplicate race trial at ${e.seq}`);trialAvailable=true;continue;}
    if(e.type==='action' && e.payload?.kind==='race_trial_consumed'){if(!trialAvailable)errors.push(`Race trial consumed without purchase at ${e.seq}`);trialAvailable=false;continue;}
    if(e.type!=='action'||e.payload?.kind!=='race_choice')continue;
    const p=e.payload, next=entries[i+1];
    if(!next || !['race_result','race_attempt_unresolved'].includes(next.type)){errors.push(`Missing race outcome after ${e.seq}`);continue;}
    const n=next.payload?.raceNumber, duck=BANNER_1_ROSTER.find(x=>x.id===p.duckId);
    if(!Number.isSafeInteger(n)||n<1||p.raceId!==`R${String(n).padStart(2,'0')}`||seen.has(p.raceId)||!duck||!['safe','sprint'].includes(p.stance)||typeof p.trialCommitted!=='boolean') {errors.push(`Invalid race choice at ${e.seq}`);continue;}
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
      } else if(next.type!=='race_attempt_unresolved' || next.payload?.resolutionStatus!==result.status) errors.push(`Seeded unresolved race mismatch for ${p.raceId}`);
    } catch(error) {errors.push(`Race reconstruction failed for ${p.raceId}: ${error.message}`);}
  }
  for(let i=0;i<entries.length;i++){const e=entries[i];if(['race_result','race_attempt_unresolved'].includes(e.type) && (entries[i-1]?.type!=='action' || entries[i-1]?.payload?.kind!=='race_choice' || entries[i-1]?.payload?.raceId!==e.payload?.raceId))errors.push(`Race outcome lacks adjacent choice at ${e.seq}`);}
  return errors;
}
