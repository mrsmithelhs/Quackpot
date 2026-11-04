import { restoreRng } from '../../../src/core/prng.mjs';
import { BANNER_1_ROSTER, GAME_CONSTANTS, calculatePreDrawOdds } from '../../../src/core/game-engine.mjs';
import { validateSeededDrawHistory, validateFiveSlotTransactionHistory } from '../../../src/core/life-replay.mjs';
import { validateSave } from '../../../src/core/storage.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const allowed=new Set(['plan52.independent-day.v1','plan52.rent-paid-zero.v1']);
const recipes=new Set(['reports/development/plan-52-five-slot-production-transition/meal-checkpoint-refresh.mjs','reports/development/plan-52-five-slot-production-transition/session-checkpoint-refresh.mjs']);
export function validateContinuationDispatch({id,recipe,policy,result}) {
 const seeded=recipes.has(recipe) && allowed.has(id);
 if(allowed.has(id) && !recipes.has(recipe))return false;
 if(seeded) return policy==='seeded-gameplay-v1' && result?.continuationPolicy==='seeded-gameplay-v1' && result?.unchangedRng===false;
 return policy===undefined && result?.continuationPolicy===undefined && result?.unchangedRng===true;
}
export function validateSeededDrawArithmetic({id,policy,recipe,parent,child,continued}) {
 const errors=[];if(policy!=='seeded-gameplay-v1'||!allowed.has(id)||!recipes.has(recipe))return ['unsupported continuation policy, case or recipe'];
 if(!parent?.eventLog||!child?.eventLog||!continued?.eventLog)return ['missing envelope'];
 if(!same(child.eventLog.slice(0,parent.eventLog.length),parent.eventLog))errors.push('parent prefix changed');
 if(!same(parent.prngStreams,child.prngStreams))errors.push('RNG changed before gameplay');
 if(!same(continued.eventLog.slice(0,child.eventLog.length),child.eventLog))errors.push('child prefix changed');
 const suffix=continued.eventLog.slice(child.eventLog.length),draws=suffix.filter(x=>x.type==='draw_committed'),intents=suffix.filter(x=>x.type==='life52_intent'&&x.payload?.intent?.action?.type==='play'&&x.payload?.intent?.action?.kind==='pull');
 if(draws.length!==10||intents.length!==1||suffix.some(x=>x.type==='purchase'))errors.push('expected one free ten-draw transaction');
 try {
  const rng=restoreRng(child.prngStreams.draw),owned=new Set(child.state.owned),pity=child.state.pityCount;
  for(let i=0;i<10;i++){
   const odds=calculatePreDrawOdds(pity),roll=rng.next(),rarity=roll<odds.legendary?'legendary':roll<odds.legendary+odds.rare?'rare':'common',pool=BANNER_1_ROSTER.filter(x=>x.tier===rarity),item=pool[rng.int(pool.length)],duplicate=owned.has(item.id);
   const expected={drawIndex:i+1,of:10,pityBefore:pity,drawNumberInWindow:pity+1,odds,rarity,identity:item.id,duplicate,downGained:duplicate?GAME_CONSTANTS.DOWN_PER_DUPLICATE[rarity]:0,advancesPity:false};
   if(!same(draws[i]?.payload,expected))errors.push(`independent draw mismatch ${i+1}`);owned.add(item.id);
  }
  if(continued.prngStreams.draw!==rng.serialize())errors.push('draw stream mismatch');
  for(const key of ['root','race','event'])if(continued.prngStreams[key]!==child.prngStreams[key])errors.push(`${key} stream changed`);
 } catch {errors.push('invalid RNG or state');}
 if(validateSeededDrawHistory(continued).length||validateFiveSlotTransactionHistory(continued).length||!validateSave(continued,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid)errors.push('full seeded transaction replay failed');
 return errors;
}

// A draw-started UI witness is not a completed review continuation.
export function validateSeededContinuation(args) {
 const errors=validateSeededDrawArithmetic(args), child=args.child, continued=args.continued;
 if(!child?.eventLog || !continued?.eventLog)return errors;
 const suffix=continued.eventLog.slice(child.eventLog.length);
 const starts=suffix.filter(e=>e.type==='life52_effect' && e.payload?.effect?.type==='activity_started' && e.payload.effect.kind==='session');
 const completions=suffix.filter(e=>e.type==='life52_effect' && e.payload?.effect?.type==='activity_completed');
 const start=starts[0]?.payload?.effect;
 if(starts.length!==1 || completions.length!==1 || completions[0]?.payload?.effect?.id!==start?.id || continued.state?.life?.schedule?.day!==child.state?.life?.schedule?.day || continued.state?.life?.schedule?.slot!=='midday' || continued.state?.life?.schedule?.active!==null)errors.push('session completion boundary missing');
 return errors;
}
