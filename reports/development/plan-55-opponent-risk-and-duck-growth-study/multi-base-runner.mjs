import { open } from 'node:fs/promises';
import { resolveSeededRace } from './multi-contact-adapter.mjs';
const arm=process.argv[2];if(!['reference','multi','advice'].includes(arm))throw Error('invalid arm');
const path=`reports/development/plan-55-opponent-risk-and-duck-growth-study/multi-base-results/${arm}.json`;
const h=await open(path,'wx');let calls=0;const cases=[];let failure=null;
try {
 for(let i=0;i<8;i++) {
  const seed=`p55m-${String(i).padStart(3,'0')}`,player=i%2?'sprint':'steady';
  const choices=Object.fromEntries(['A','B','C','D','E'].map((id,j)=>[id,(i+j)%2?'sprint':'steady']));
  const risks={P:player,...choices};
  const input={seed,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:player,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:choices};
  if(arm!=='reference')input.multiContact={advice:arm==='advice',risks};
  calls++;const r=resolveSeededRace(input);
  const contacts=r.eventRecords.filter(e=>e.type==='duck-contact').map(e=>({tick:e.tick,participants:e.participants,closing:e.relativeClosingSpeed}));
  const clusters=[];
  for(let a=0;a<contacts.length;a++)for(let b=a+1;b<contacts.length;b++)if(contacts[b].tick-contacts[a].tick<=20&&contacts[a].participants.some(id=>contacts[b].participants.includes(id)))clusters.push([a,b]);
  if(!Number.isFinite(r.dt)||r.dt<=0)throw Error('invalid trajectory dt');
  const tickGaps=[...new Set(r.trajectory.slice(1).map((frame,j)=>frame.tick-r.trajectory[j].tick))].sort((a,b)=>a-b);
  if(tickGaps.some(g=>!Number.isFinite(g)||g<=0))throw Error('invalid trajectory cadence');
  let crowdedSamples=0, maxCrowded=0, stalledSamples=0;
  const crossingTicks=Object.fromEntries(r.finishCrossings.map(x=>[x.id,x.tick]));
  for(const frame of r.trajectory) {
    const active=frame.entrants.filter(e=>crossingTicks[e.id]===undefined || frame.tick<crossingTicks[e.id]);let crowded=0;
    for(const e of active){const near=active.filter(n=>{if(n.id===e.id)return false;const arc=Math.abs(n.progress-e.progress)%r.courseLength;return Math.min(arc,r.courseLength-arc)<=8&&Math.hypot(n.x-e.x,n.y-e.y)<=4;});if(near.length>=2)crowded++;if(e.speed<1)stalledSamples++;}
    crowdedSamples+=crowded;maxCrowded=Math.max(maxCrowded,crowded);
  }
  const advice=r.adviceAudit??[],eligible=advice.filter(x=>x.eligible),skips={};
  for(const x of advice.filter(x=>!x.eligible||x.reason))skips[x.reason??'unknown']=(skips[x.reason??'unknown']??0)+1;
  cases.push({seed,arm,player,choices,status:r.status,reason:r.unresolvedReason,guard:r.guardEvidence,contacts,clusters,crossings:r.finishCrossings.map(x=>({id:x.id,time:x.crossingTimeSeconds})),winner:r.winner,first:r.finishTimeSeconds,last:r.lastFinishTimeSeconds,crowding:{crowdedDuckSamples:crowdedSamples,maxSimultaneousCrowded:maxCrowded,stalledDuckSamples:stalledSamples,sampleSeconds:r.dt,tickGaps},advice:{opportunities:advice.length,eligible:eligible.length,followed:eligible.filter(x=>x.follow&&x.side).length,ignored:eligible.filter(x=>!x.follow).length,skips,details:eligible.map(({tick,id,risk,probability,key,draw,follow,side,target,reason})=>({tick,id,risk,probability,key,draw,follow,side,target,reason}))}});
  if(r.status!=='finished') throw Error(`unresolved race ${seed}: ${r.unresolvedReason}`);
 }
} catch(e){failure=String(e?.stack??e);}
await h.writeFile(JSON.stringify({version:'plan55-multi-base/v1',arm,calls,cases,failure}));await h.close();
process.stdout.write(JSON.stringify({arm,calls,cases:cases.length,failure})+'\n');if(failure)process.exitCode=1;



