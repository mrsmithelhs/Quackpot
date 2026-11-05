import { checked, roundEven } from '../integer-math.mjs';
import { LENGTH, UNIT, velocity } from './course.mjs';
import { draw } from './codec.mjs';

const abs=(n)=>n<0n?-n:n, LIMIT32=4294967296n;
export function bouncePhase(e,tick) {
  if(e.ability!=='bounce'||e.abilityStart===null)return 'idle';
  const age=tick-e.abilityStart;if(age<0n)throw new RangeError('invalid phase');
  return age<2n?'rising':age<12n?'airborne':age<14n?'landing':'idle';
}
function worldNear(a,b,table,maxDistance) {
  const x=velocity(a,table),y=velocity(b,table),dx=y.x-x.x,dy=y.y-x.y;
  return {x,y,dx,dy,d2:checked(dx*dx+dy*dy),within:checked(dx*dx+dy*dy)<=checked(maxDistance*maxDistance)};
}
function arcNear(a,b,limit){const diff=abs(a.progress-b.progress)%LENGTH;return (diff<LENGTH-diff?diff:LENGTH-diff)<=limit;}
export function crowdEligible(e,all,table) {
  if(e.finished||e.airborne)return false;
  return all.filter((other)=>other.id!==e.id&&!other.finished&&!other.airborne&&arcNear(e,other,8n*UNIT)
    &&worldNear(e,other,table,4n*UNIT).within).length>=2;
}
export function bounceEligible(e,all,table) {
  for(const other of all) {
    if(other.id===e.id||other.finished||other.airborne||!arcNear(e,other,8n*UNIT))continue;
    const w=worldNear(e,other,table,6n*UNIT);if(!w.within||w.d2<=UNIT*UNIT)continue;
    const vx=w.y.vx-w.x.vx,vy=w.y.vy-w.x.vy,v2=checked(vx*vx+vy*vy),dot=checked(w.dx*vx+w.dy*vy);
    if(!v2||dot>=0n||checked(-2n*dot)>v2)continue;
    if(checked(checked(w.d2*v2)-checked(dot*dot))<checked(1440000000000n*v2))return true;
  }
  return false;
}
export function updateAbility(entrant,all,tick,seed,raceId,table) {
  const e=structuredClone(entrant),events=[];
  if(!e.ability)return {entrant:e,events};
  if(e.abilityStart!==null && tick>=e.abilityUntil) {
    events.push({kind:'ability-end',participants:[e.id],details:[e.ability]});
    e.abilityStart=null;e.abilityCooldown=tick+40n;
  }
  e.airborne=bouncePhase(e,tick)==='airborne';
  if(tick%5n!==0n)return {entrant:e,events};
  const eligible=e.ability==='crowd'?crowdEligible(e,all,table):bounceEligible(e,all,table);
  if(!eligible){e.abilityAbsent=e.abilityAbsent<2n?e.abilityAbsent+1n:2n;if(e.abilityAbsent>=2n)e.abilityLatched=false;return {entrant:e,events};}
  e.abilityAbsent=0n;
  if(e.abilityLatched||tick<e.abilityCooldown||e.abilityStart!==null)return {entrant:e,events};
  e.abilityLatched=true;const index=e.abilityOpportunity++;
  const roll=draw(seed,raceId,'ability',[e.ability,e.id,index.toString()]);
  const activated=checked(roll.value*4n)<3n*LIMIT32;
  events.push({kind:'ability-opportunity',participants:[e.id],details:[e.ability,index.toString(),roll.value.toString(),activated?'yes':'no']});
  if(activated){e.abilityStart=tick;e.abilityUntil=tick+(e.ability==='bounce'?14n:10n);events.push({kind:'ability-start',participants:[e.id],details:[e.ability,index.toString()]});}
  return {entrant:e,events};
}
export function contactInjuries(entrants,ids,episode,tick,seed,raceId,diagnostic) {
  const copies=structuredClone(entrants),events=[];
  for(const id of [...ids].sort()) {
    const e=copies.find((item)=>item.id===id),phase=bouncePhase(e,tick),protectedNow=phase!=='idle';
    if(e.injured||protectedNow||diagnostic){events.push({kind:'injury-check',participants:[id],details:[protectedNow?'protected':diagnostic?'diagnostic':'injured','none']});continue;}
    const roll=draw(seed,raceId,'injury',[...ids,episode.toString(),id]);
    const threshold=e.stance==='steady'?5n:10n,injured=checked(roll.value*100n)<threshold*LIMIT32;
    events.push({kind:'injury-check',participants:[id],details:[threshold.toString(),roll.value.toString()]});
    if(injured){e.injured=true;events.push({kind:'injury',participants:[id],details:[roll.value.toString()]});}
  }
  return {entrants:copies,events};
}
export function ratedTop(e) {
  let rating=roundEven(checked(e.sampledRating*e.restFactor),UNIT);
  rating=roundEven(checked(rating*e.downFactor),UNIT);
  if(e.injured)rating=roundEven(checked(rating*9n),10n);
  return {rating,affine:8250000n+roundEven(rating,2n)};
}
