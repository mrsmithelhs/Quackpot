// Report-local one-second advisory approximation. It does not advance race state.
export const TARGET_OFFSETS=Object.freeze([-.4,.4,-.8,.8,-1.2,1.2]);
export function lateralReach(speed,turnDegreesPerSecond,t){
 if(![speed,turnDegreesPerSecond,t].every(Number.isFinite)||speed<0||turnDegreesPerSecond<0||t<0)throw RangeError('invalid reach input');
 const w=turnDegreesPerSecond*Math.PI/180;if(w===0)return 0;return speed*(1-Math.cos(w*t))/w;
}
export function chooseClearanceTarget({own,neighbors,normal,turnDegreesPerSecond,corridorHalfWidth=6}){
 if(!own||!normal||![own.x,own.y,own.vx,own.vy,own.speed,own.lateral,normal.nx,normal.ny,turnDegreesPerSecond,corridorHalfWidth].every(Number.isFinite)||own.speed<0||turnDegreesPerSecond<0||corridorHalfWidth<=0)throw RangeError('invalid prediction');
 if(Math.abs(Math.hypot(normal.nx,normal.ny)-1)>1e-6)throw RangeError('normal must be unit length');
 for(const n of neighbors)if(![n.x,n.y,n.vx,n.vy].every(Number.isFinite))throw RangeError('invalid neighbor');
 const times=[0,.25,.5,.75,1];
 function score(offset){let min=Infinity;for(const t of times){const displacement=Math.sign(offset)*Math.min(Math.abs(offset),lateralReach(own.speed,turnDegreesPerSecond,t));const x=own.x+own.vx*t+normal.nx*displacement,y=own.y+own.vy*t+normal.ny*displacement;for(const n of neighbors)min=Math.min(min,Math.hypot(x-(n.x+n.vx*t),y-(n.y+n.vy*t)))}return min}
 const baseline=score(0),candidates=TARGET_OFFSETS.map(offset=>{const target=own.lateral+offset,feasible=Math.abs(target)<=corridorHalfWidth;return {offset,target,feasible,predictedLateralAtOneSecond:Math.sign(offset)*Math.min(Math.abs(offset),lateralReach(own.speed,turnDegreesPerSecond,1)),score:feasible?score(offset):null}});
 if(!neighbors.length)return {baseline:null,candidates,selected:null,reason:'no-neighbors'};
 const available=candidates.filter(c=>c.feasible).sort((a,b)=>b.score-a.score||Math.abs(a.offset)-Math.abs(b.offset)||a.offset-b.offset),best=available[0];
 if(!best)return {baseline,candidates,selected:null,reason:'no-feasible-target'};
 if(best.score-baseline<.1-1e-10)return {baseline,candidates,selected:null,reason:'insufficient-improvement'};
 return {baseline,candidates,selected:best,reason:'selected'};
}
