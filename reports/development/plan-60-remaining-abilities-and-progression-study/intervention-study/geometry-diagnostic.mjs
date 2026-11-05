// Seven fixed source-geometry probes; see geometry-witness-protocol.md.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { frameAt, pos, velocity, sweptPairCandidate, COURSE_LENGTH as L, PHYSICS } from './geometry-adapter.mjs';
const base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/';
const output=base+'geometry-witness.json';
writeFileSync(output,'', {flag:'wx'});
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
function verifyPins() {
  const manifest=readFileSync(base+'stage0-owned-pins.txt','utf8');
  if(sha(base+'stage0-owned-pins.txt')!=='43771117c7e27c4c7c0f04020ef272321b4226c6552806ddd97dedeb14d490c4') throw Error('owned manifest drift');
  for(const line of (manifest+'\n'+readFileSync(base+'source-pins.txt','utf8')).trim().split(/\r?\n/)) {
    if(!line.trim())continue;
    const [hash,path]=line.trim().split(/\s+/,2);
    if(sha(path)!==hash) throw Error(`source drift ${path}`);
  }
  const original=readFileSync(base+'adapter.mjs','utf8');
  const copy=readFileSync(base+'geometry-adapter.mjs','utf8');
  if(copy!==original+'\r\nexport { frameAt, pos, velocity, sweptPairCandidate };\r\n') throw Error('geometry copy mismatch');
}
const specs=[
  ['proposed',[-.45,0,.05,.6],[-.55,1,.05,.4]],
  ['no-contact',[-.25,0,.25,0],[-2,3,-1.5,3]],
  ['opening-overlap',[-.3,0,.2,0],[-1.1,0,-.65,0]],
  ['p-only',[-.25,0,.25,0],[-.9,.5,-.4,.5]],
  ['both-cross',[-.25,0,.25,0],[-.3,2,.2,2]],
  ['closing-after',[-.25,0,.25,0],[-1.35,0,-.74,0]],
];
function straight(id,s) {
  const first={id,progress:L+s[0],lateral:s[1]},last={id,progress:L+s[2],lateral:s[3]};
  const from=pos(first),to=pos(last), vx=(to.x-from.x)/PHYSICS.dt,vy=(to.y-from.y)/PHYSICS.dt;
  const speed=Math.hypot(vx,vy),heading=Math.atan2(vy,vx);
  return {first,last:{...last,speed,heading},from,to,speed,heading,zeroTurn:true,
    displacementError:Math.hypot((to.x-from.x)-vx*PHYSICS.dt,(to.y-from.y)-vy*PHYSICS.dt)};
}
function corner(id,progress,lateral,speed,offset) {
  const first={id,progress,lateral},frame=frameAt(progress,lateral),heading=Math.atan2(frame.ty,frame.tx)+offset;
  const last={id,progress:progress+speed*Math.cos(offset)*PHYSICS.dt,lateral:lateral+speed*Math.sin(offset)*PHYSICS.dt,speed,heading};
  return {first,last,from:pos(first),to:pos(last),speed,heading,zeroTurn:true,displacementError:null};
}
function observe(name,p,b) {
  const crossings=[p,b].filter(x=>x.first.progress<L&&x.last.progress>=L).map(x=>({id:x.first.id,fraction:(L-x.first.progress)/(x.last.progress-x.first.progress)}));
  const candidate=sweptPairCandidate(p.last,b.last,{P:p.from,B:b.from},{P:p.to,B:b.to});
  let closing=null;
  if(candidate) { const length=Math.hypot(candidate.normal.x,candidate.normal.y)||1, va=velocity(p.last),vb=velocity(b.last);
    closing=((vb.x-va.x)*candidate.normal.x+(vb.y-va.y)*candidate.normal.y)/length; }
  return {name,crossings,candidate:candidate?{fraction:candidate.t,distance:candidate.distance}:null,closing,
    rawStrictClosing:closing!==null&&closing<0,robustClosing:closing!==null&&closing < -1e-9,
    beforeFirstCrossing:Boolean(candidate&&crossings.length&&candidate.t<Math.min(...crossings.map(x=>x.fraction))),
    kinematics:{pSpeed:p.speed,bSpeed:b.speed,zeroTurn:p.zeroTurn&&b.zeroTurn,pDisplacementError:p.displacementError,bDisplacementError:b.displacementError,
      withinDiagnosticSpeedBound:p.speed<=20&&b.speed<=20,cornerWorldDisplacementChecked:p.displacementError!==null&&b.displacementError!==null,controllerReachability:'unestablished'}};
}
const near=(a,b)=>Math.abs(a-b)<1e-7;
try {
  verifyPins(); if(!near(PHYSICS.dt,.05))throw Error('unexpected dt');
  const observations=specs.map(([name,p,b])=>observe(name,straight('P',p),straight('B',b)));
  observations.push(observe('corner-control',corner('P',40,0,10,.2),corner('B',39.2,.6,11,-.2)));
  const get=name=>observations.find(x=>x.name===name), proposed=get('proposed');
  if(proposed.crossings.length!==2 || !near(proposed.crossings[0].fraction,.9) || !near(proposed.crossings[1].fraction,11/12) || !proposed.candidate || !near(proposed.candidate.fraction,1.21/1.45) || Math.abs(proposed.closing)>1e-9) throw Error('proposed expectation mismatch');
  if(get('no-contact').candidate || get('no-contact').crossings.length!==1)throw Error('no-contact mismatch');
  if(!get('opening-overlap').candidate || get('opening-overlap').closing<=1e-9)throw Error('nonclosing mismatch');
  if(get('p-only').crossings.length!==1 || get('p-only').robustClosing)throw Error('P-only mismatch');
  if(get('both-cross').crossings.length!==2 || get('both-cross').candidate)throw Error('both-cross mismatch');
  const late=get('closing-after'); if(!late.candidate || !late.robustClosing || late.beforeFirstCrossing || !near(late.candidate.fraction,1))throw Error('closing-after mismatch');
  if(get('corner-control').crossings.length)throw Error('corner finish mismatch');
  for(const o of observations) if(!o.kinematics.withinDiagnosticSpeedBound||!o.kinematics.zeroTurn||o.kinematics.pDisplacementError>1e-8||o.kinematics.bDisplacementError>1e-8)throw Error(`kinematic bound ${o.name}`);
  verifyPins(); appendFileSync(output,JSON.stringify({status:'complete',protocol:'geometry-witness-v1',dt:PHYSICS.dt,observations},null,2));
} catch(error) { appendFileSync(output,JSON.stringify({status:'failure',error:String(error)},null,2)); throw error; }
