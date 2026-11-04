// Report-local candidate only. Inputs are present-state observations, never future trajectories.
export function selectPredictedThreat(own, neighbors, courseLength) {
  if (!Number.isFinite(courseLength) || courseLength <= 0) throw new RangeError('invalid course length');
  const threats=[];
  for(const n of neighbors) {
    if(!n.active || !n.ground || n.id===own.id) continue;
    const arc=Math.abs(n.progress-own.progress)%courseLength;
    if(Math.min(arc,courseLength-arc)>8) continue;
    const rx=n.x-own.x, ry=n.y-own.y, vx=n.vx-own.vx, vy=n.vy-own.vy;
    if(![rx,ry,vx,vy].every(Number.isFinite)) throw new RangeError('invalid observation');
    if(Math.hypot(rx,ry)>6) continue;
    const vv=vx*vx+vy*vy, rv=rx*vx+ry*vy;
    if(vv===0 || rv>=0) continue;
    const time=-rv/vv;
    if(time<=0 || time>1) continue;
    const separation=Math.hypot(rx+vx*time,ry+vy*time);
    if(separation<1.4) threats.push({id:n.id,time,separation});
  }
  threats.sort((a,b)=>a.separation-b.separation || a.id.localeCompare(b.id));
  return threats[0]??null;
}
export function shouldFollowAdvice(risk, draw) {
  if(!Number.isFinite(draw)||draw<0||draw>=1)throw new RangeError('invalid draw');
  const probability=risk==='steady'?0.75:risk==='sprint'?0.35:NaN;
  if(!Number.isFinite(probability))throw new RangeError('invalid risk');
  return {probability,follow:draw<probability};
}
