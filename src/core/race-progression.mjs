// Schema-6 race facts; all calls operate on detached transaction drafts.
import { draw } from './race-v2/codec.mjs';

const payout=[50,20,10,0,0,0];
export function initialRaceProgress(){return {schema:'race-growth-injury/v1',ducks:{}};}
function readDuck(state,id){return state.ducks[id]??{progress:0,banked:0,assigned:null,recoveryDays:0,firstPointEarned:false};}
export function assignRaceAbility(state,id,ability){
  if(!['bounce','crowd'].includes(ability))throw new RangeError('unsupported ability');
  const next=structuredClone(state),duck=readDuck(next,id);
  if(duck.banked!==1||duck.assigned!==null||!duck.firstPointEarned)throw new RangeError('ability assignment unavailable');
  duck.banked=0;duck.assigned=ability;next.ducks[id]=duck;return next;
}
export function recoverRaceDays(state,elapsed){
  if(!Number.isSafeInteger(elapsed)||elapsed<0)throw new RangeError('invalid elapsed days');
  const next=structuredClone(state);for(const d of Object.values(next.ducks))d.recoveryDays=Math.max(0,d.recoveryDays-elapsed);return next;
}
export function buildRaceV2Input({seed,raceId,duckId,baseRating,fieldRating,restFactor,trialCommitted,stance,progress}){
  const duck=readDuck(progress,duckId),million=value=>String(Math.round(value*1000000));
  const specs=[['A',1,0],['P',2,0],['B',1,1],['C',2,1],['D',1,2],['E',2,2]];
  return {schema:'integer-race-input/v1',rules:'integer-working/v1',numericPolicy:'integer-q62-micros/v1',course:'integer-oval/v1',
    seed,raceId,choice:stance==='safe'?'steady':'sprint',entrants:specs.map(([id,lane,row])=>({id,player:id==='P',lane:String(lane),row:String(row),
      baseRating:million(id==='P'?baseRating:fieldRating),restFactor:million(id==='P'?restFactor:1),downFactor:million(id==='P'&&trialCommitted?1.05:1),
      entryInjury:id==='P'&&duck.recoveryDays>0,ability:id==='P'?duck.assigned:null,stance:id==='P'&&stance==='sprint'?'sprint':'steady'}))};
}
export function applyRaceV2Facts(progress,{seed,raceId,duckId},result){
  const next=structuredClone(progress),before=readDuck(next,duckId);next.ducks[duckId]=before;
  const entry=before.recoveryDays>0,player=result.entrants.find(e=>e.id==='P');if(!player)throw new RangeError('player missing');
  const crossing=result.crossings.find(e=>e.id==='P'),finished=result.status==='finished';
  if(finished&&(!crossing||!Number.isInteger(Number(crossing.place))))throw new RangeError('player finish missing');
  let extensionRoll=null,extension=false;
  if(player.injured&&!entry)before.recoveryDays=2;
  if(finished&&entry){const roll=draw(seed,raceId,'recovery-extension',[duckId]);extensionRoll=roll.value.toString();extension=roll.value*4n<4294967296n;if(extension)before.recoveryDays++;}
  const place=finished?Number(crossing.place):null,earned=finished?2+(place<=3?1:0):0;
  before.progress+=earned;if(!before.firstPointEarned&&before.progress>=4){before.progress-=4;before.banked++;before.firstPointEarned=true;}
  return {progress:next,place,payoutGems:place===null?0:payout[place-1],enteredInjured:entry,extensionRoll,extension,earned};
}
