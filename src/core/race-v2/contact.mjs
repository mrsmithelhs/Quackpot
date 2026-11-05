import { Q, checked, isqrt, roundEven, vectorAngle } from './integer-math.mjs';
import { integerFrame } from './course-probe.mjs';
import { DIAMETER, MARGIN, UNIT, velocity } from './course.mjs';

const abs=(n)=>n<0n?-n:n;
const norm=(x,y)=>isqrt(checked(checked(x*x)+checked(y*y)));
const worldPosition=(e,table)=>integerFrame(e.progress,e.lateral,table);
function applyVelocity(e,vx,vy,table) {
  const speed=norm(vx,vy);
  return {...e,speed,heading:speed?vectorAngle(vx,vy,table):e.heading};
}
export function distance(a,b,table) { const x=worldPosition(a,table),y=worldPosition(b,table);return norm(y.x-x.x,y.y-x.y); }

/** Discrete sampled wall; correction is lateral only and gains no finish credit. */
export function wall(e,table,travelBound) {
  if(abs(e.lateral)<=6n*UNIT)return {ok:true,entrant:abs(e.lateral)<5950000n?{...e,wallEpisode:false,wallConstrained:false}:e,event:null};
  if(abs(e.lateral)-6n*UNIT>travelBound+MARGIN)return {ok:false,reason:'wall-deep'};
  const side=e.lateral<0n?-1n:1n,v=velocity({...e,lateral:side*6n*UNIT},table),normal=v.across;
  const f=integerFrame(e.progress,side*6n*UNIT,table),tangent=v.along;
  const outward=normal*side>0n;
  const reflected=outward?(e.wallEpisode?0n:-roundEven(normal,4n)):normal;
  const damped=outward&&!e.wallEpisode?roundEven(tangent*9n,10n):tangent;
  const vx=roundEven(checked(damped*f.tx-reflected*f.ty),Q),vy=roundEven(checked(damped*f.ty+reflected*f.tx),Q);
  return {ok:true,entrant:{...applyVelocity(e,vx,vy,table),lateral:side*6n*UNIT,wallEpisode:true,wallConstrained:true},event:e.wallEpisode?null:outward?'wall-impact':'wall-overlap'};
}

/** Checked discrete correction; original inputs remain untouched on any guard. */
export function correctPair(entrants,ids,table,travelBound,finish,{landing=false}={}) {
  const copies=structuredClone(entrants),a=copies.find((e)=>e.id===ids[0]),b=copies.find((e)=>e.id===ids[1]);
  if(!a||!b||a===b||a.finished||b.finished)return {ok:false,reason:'contact-identity'};
  const before=[worldPosition(a,table),worldPosition(b,table)], first=distance(a,b,table);
  const correctionBudget=(landing?DIAMETER:travelBound)+MARGIN;
  if(first===0n || first>DIAMETER || DIAMETER-first>correctionBudget)return {ok:false,reason:'contact-depth'};
  let passes=0;
  while(distance(a,b,table)<DIAMETER && passes<16) {
    const pa=worldPosition(a,table),pb=worldPosition(b,table),dx=pb.x-pa.x,dy=pb.y-pa.y,d=norm(dx,dy);
    if(d===0n)return {ok:false,reason:'contact-degenerate'};
    const amount=(DIAMETER-d+MARGIN+1n)/2n,nx=roundEven(checked(dx*Q),d),ny=roundEven(checked(dy*Q),d);
    for(const [index,e,sign] of [[0,a,-1n],[1,b,1n]]) {
      const f=integerFrame(e.progress,e.lateral,table),wx=roundEven(checked(sign*amount*nx),Q),wy=roundEven(checked(sign*amount*ny),Q);
      const progress=checked(e.progress+roundEven(checked(wx*f.tx+wy*f.ty),Q));
      const lateral=checked(e.lateral+roundEven(checked(-wx*f.ty+wy*f.tx),Q));
      if(progress>=finish)return {ok:false,reason:'correction-finish'};
      e.finishCorrection=checked(e.finishCorrection+progress-e.progress);e.progress=progress;
      e.lateral=lateral>6n*UNIT?6n*UNIT:lateral< -6n*UNIT? -6n*UNIT:lateral;
      const now=worldPosition(e,table);
      if(norm(now.x-before[index].x,now.y-before[index].y)>correctionBudget)return {ok:false,reason:'correction-cap'};
    }
    passes++;
  }
  if(distance(a,b,table)<DIAMETER)return {ok:false,reason:'correction-nonconvergent'};
  for(const other of copies) if(!other.finished&&!other.airborne&&other.id!==a.id&&other.id!==b.id
      &&(distance(a,other,table)<DIAMETER||distance(b,other,table)<DIAMETER)) return {ok:false,reason:'correction-third-party'};
  const displacements=[a,b].map((e,i)=>{const p=worldPosition(e,table);return norm(p.x-before[i].x,p.y-before[i].y);});
  return {ok:true,entrants:copies,passes,penetration:DIAMETER-first,displacements,correctionBudget};
}

/** Restitution only for genuine closing motion; no invented impulse otherwise. */
export function impulsePair(entrants,ids,table,{constraint=false}={}) {
  const copies=structuredClone(entrants),a=copies.find((e)=>e.id===ids[0]),b=copies.find((e)=>e.id===ids[1]);
  const x=velocity(a,table),y=velocity(b,table),dx=y.x-x.x,dy=y.y-x.y,d=norm(dx,dy);
  if(!d)return {ok:false,reason:'contact-degenerate'};
  const nx=roundEven(checked(dx*Q),d),ny=roundEven(checked(dy*Q),d);
  const relative=roundEven(checked((y.vx-x.vx)*nx+(y.vy-x.vy)*ny),Q);
  const impulse=relative<0n?(constraint?roundEven(-relative,2n):roundEven(checked(-relative*5n),8n)):0n;
  const ix=roundEven(checked(impulse*nx),Q),iy=roundEven(checked(impulse*ny),Q);
  Object.assign(a,applyVelocity(a,x.vx-ix,x.vy-iy,table));Object.assign(b,applyVelocity(b,y.vx+ix,y.vy+iy,table));
  return {ok:true,entrants:copies,impulse,relative};
}
