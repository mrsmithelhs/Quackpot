import { Q, TURN, checked, cordic, roundEven, vectorAngle, wrapTurns } from '../integer-math.mjs';
import { BEND, LENGTH, integerFrame } from '../course-probe.mjs';

export { LENGTH };
export const UNIT=1000000n, TICK=50000n, MARGIN=1000n, DIAMETER=UNIT;
const abs=(n)=>n<0n?-n:n;
const clamp=(n,a,b)=>n<a?a:n>b?b:n;
export function ceilDiv(n,d) { checked(n); checked(d); if(n<0n || d<=0n)throw new RangeError('invalid ceiling division'); return checked((n+d-1n)/d); }
export function velocity(e,table) {
  const frame=integerFrame(e.progress,e.lateral,table), c=cordic(e.heading,table);
  let vx=roundEven(checked(e.speed*c.cos),Q),vy=roundEven(checked(e.speed*c.sin),Q);
  const normal=roundEven(checked(-vx*frame.ty+vy*frame.tx),Q);
  const constrained=e.wallConstrained && abs(e.lateral)===6n*UNIT && normal*(e.lateral<0n?-1n:1n)>0n;
  if(constrained){const tangent=roundEven(checked(vx*frame.tx+vy*frame.ty),Q);vx=roundEven(checked(tangent*frame.tx),Q);vy=roundEven(checked(tangent*frame.ty),Q);}
  return { ...frame,vx,vy,along:roundEven(checked(vx*frame.tx+vy*frame.ty),Q),
    across:constrained?0n:roundEven(checked(-vx*frame.ty+vy*frame.tx),Q) };
}
export function move(e,dt,table) {
  if(typeof dt!=='bigint'||dt<=0n)throw new RangeError('nonpositive step');
  const v=velocity(e,table);
  return {...e,progress:checked(e.progress+roundEven(checked(v.along*dt),UNIT)),
    lateral:checked(e.lateral+roundEven(checked(v.across*dt),UNIT))};
}
export function turnCap(speed){checked(speed);return speed<0n?(()=>{throw new RangeError('negative speed');})():clamp(90000000n-5n*speed,30000000n,90000000n);}
const degTurn=(degreesMillionths)=>roundEven(checked(degreesMillionths*TURN),360n*UNIT);
const signed=(angle)=>{const n=wrapTurns(angle);return n>TURN/2n?n-TURN:n;};
export function curveSpeed(radius) {
  if(radius<=0n)throw new RangeError('radius'); let lo=0n,hi=12000000n;
  while(lo<hi){const mid=(lo+hi+1n)/2n;const rate=roundEven(checked(mid*180n*UNIT*UNIT),checked(radius*3141593n));
    if(rate<=turnCap(mid))lo=mid;else hi=mid-1n;} return lo;
}
export function nextCurveDistance(progress) {
  let s=(progress+30n*UNIT)%LENGTH;if(s<0n)s+=LENGTH;
  if(s<60n*UNIT)return 60n*UNIT-s;
  if(s<60n*UNIT+BEND)return 0n;
  if(s<120n*UNIT+BEND)return 120n*UNIT+BEND-s;
  return 0n;
}
export function control(e,topSpeed,table,{assisted=false,crowd=false,slowdown=false}={}) {
  const corner=curveSpeed(20n*UNIT-abs(e.lateral));
  const stopping=clamp(roundEven(checked(e.speed*e.speed-corner*corner),12n*UNIT),0n,100n*UNIT);
  let target=nextCurveDistance(e.progress)<=stopping+roundEven(e.speed*TICK,UNIT)?(topSpeed<corner?topSpeed:corner):topSpeed;
  if(slowdown)target=roundEven(target*8n,10n);
  const acceleration=(assisted?5n:3n)*UNIT+(crowd?1500000n:0n);
  const speed=target<e.speed?(e.speed-300000n<target?target:e.speed-300000n):(e.speed+roundEven(acceleration*TICK,UNIT)>target?target:e.speed+roundEven(acceleration*TICK,UNIT));
  const f=integerFrame(e.progress,e.lateral,table), tangent=vectorAngle(f.tx,f.ty,table);
  const lookahead=assisted?6000000n:10000000n, error=e.lateral-e.assignedLaneOffset;
  let correction=signed(vectorAngle(lookahead,-error,table));
  const maxCorrection=degTurn(20000000n);correction=clamp(correction,-maxCorrection,maxCorrection);
  let desired=wrapTurns(tangent+correction);
  if(e.steering && ['acquire','hold'].includes(e.steering.phase))desired=wrapTurns(tangent+e.steering.sign*e.steering.angle);
  let cap=turnCap(speed);if(assisted && (!e.steering || e.steering.phase==='recover'))cap=clamp(roundEven(cap*3n,2n),0n,90000000n);
  const step=roundEven(checked(degTurn(cap)*TICK),UNIT), diff=signed(desired-e.heading);
  return {...e,speed,heading:wrapTurns(e.heading+clamp(diff,-step,step))};
}

export function advanceEpisode(entrant,tick,rank,table) {
  const e=structuredClone(entrant),episode=e.steering;if(!episode)return e;
  const f=integerFrame(e.progress,e.lateral,table),tangent=vectorAngle(f.tx,f.ty,table);
  const offset=abs(signed(e.heading-tangent)),error=e.lateral-e.assignedLaneOffset;
  const maxOffset=degTurn(10000000n),tolerance=degTurn(1000000n);
  const target=['acquire','hold'].includes(episode.phase)?wrapTurns(tangent+episode.sign*episode.angle)
    :wrapTurns(tangent+clamp(signed(vectorAngle(10000000n,-error,table)),-degTurn(20000000n),degTurn(20000000n)));
  const aligned=abs(signed(target-e.heading))<=tolerance;
  if(episode.phase==='acquire') {
    if(aligned&&offset>=maxOffset){episode.phase='hold';episode.held=0n;
      if(episode.kind==='weave'&&rank<=2&&e.slowCount<2n&&e.slowUntil<=tick){e.slowCount++;e.slowUntil=tick+21n;}}
    else if(tick-episode.start>=20n)episode.phase='recover';
  } else if(episode.phase==='hold') {
    if(!aligned||offset<maxOffset)episode.phase='recover';else if(++episode.held>=10n)episode.phase='recover';
  } else {
    episode.centered=abs(error)<=250000n&&aligned?episode.centered+1n:0n;if(episode.centered>=3n)e.steering=null;
  }
  return e;
}
