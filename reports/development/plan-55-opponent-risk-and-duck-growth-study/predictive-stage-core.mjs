export const IDS=Object.freeze(['P','A','B','C','D','E']);
export function stageInput(i,arm){
 if(!Number.isInteger(i)||i<0||i>=16||!['reference','multi','predictive'].includes(arm))throw RangeError('invalid stage input');
 const seed=`p55t-screen-${String(i).padStart(3,'0')}`,choice=i%2?'sprint':'steady',candidateRivalChoices=Object.fromEntries(IDS.slice(1).map((id,j)=>[id,(i+j)%2?'sprint':'steady']));
 const x={seed,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices};
 if(arm!=='reference')x.multiContact={advice:arm==='predictive',risks:{P:choice,...candidateRivalChoices}};
 return x;
}
export function crowdMeasure(frames,dt,courseLength,crossings){
 if(!Number.isFinite(dt)||dt<=0||!Number.isFinite(courseLength)||courseLength<=0)throw Error('invalid units');
 const totals=Object.fromEntries(IDS.map(id=>[id,0])),longest={...totals},current={...totals};let maxGap=0;
 for(let i=0;i<frames.length-1;i++){
  const a=frames[i],b=frames[i+1],gap=(b.tick-a.tick)*dt;if(!Number.isFinite(gap)||gap<=0)throw Error('invalid cadence');maxGap=Math.max(gap,maxGap);
  const active=a.entrants.filter(e=>!crossings.some(c=>c.id===e.id&&c.crossingTimeSeconds<=a.tick*dt));
  for(const id of IDS){const e=active.find(x=>x.id===id);const near=e?active.filter(n=>{if(e.id===n.id)return false;const d=Math.abs(n.progress-e.progress)%courseLength;return Math.min(d,courseLength-d)<=8&&Math.hypot(e.x-n.x,e.y-n.y)<=4}).length:0;
   if(near>=2&&gap<=dt+1e-8){totals[id]+=gap;current[id]+=gap;longest[id]=Math.max(longest[id],current[id]);}else current[id]=0;
  }
 }
 return {totals,longest,maxGap};
}

export function rankChurn(frames){let prev=null,changes=0;for(const f of frames){const order=[...f.entrants].sort((a,b)=>b.progress-a.progress||a.id.localeCompare(b.id)).map(x=>x.id).join('|');if(prev!==null&&order!==prev)changes++;prev=order}return changes}
