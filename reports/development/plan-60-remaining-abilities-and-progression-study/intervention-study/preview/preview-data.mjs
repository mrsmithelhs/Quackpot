// Report-local data projection: sampled P paths only, no resolver or synthetic opponents.
export const DT = .05;
export const CONTACT_TICK = 259;
export const WINDOW = Object.freeze([219,299]);
export const ARMS = Object.freeze(['none','quick-recovery','straight-shooter']);

export function parseWitness(text) {
  const parsed=text.trim().split(/\r?\n/).map(line=>JSON.parse(line));
  if(parsed[0]?.type!=='start'||parsed[0].start!==0||parsed[0].end!==4||parsed.at(-1)?.type!=='complete') throw Error('Incomplete source shard');
  const result=ARMS.map((arm,index)=>{
    const matches=parsed.filter(row=>row.type==='case' && row.arm===arm);
    if(matches.length!==1) throw Error(`Missing or duplicate ${arm}`);
    const row=matches[0], expectedIndex=[0,2,3][index];
    if(row.index!==expectedIndex||row.seed!=='p60i-000'||row.raceId!=='p60i'||row.stance!=='steady'||row.playerBaseSpeed!==10||row.fieldBaseSpeed!==10||row.entryInjured||row.status!=='finished') throw Error(`Unexpected configuration for ${arm}`);
    const contacts=row.contacts.filter(c=>c.participants.includes('P'));
    if(contacts.length!==1||contacts[0].id!=='duck-contact-259-A-P'||contacts[0].tick!==CONTACT_TICK) throw Error(`Unexpected contact for ${arm}`);
    if(!Array.isArray(row.witness)||row.witness.length<2) throw Error(`Missing P path for ${arm}`);
    const frames=row.witness.map(f=>({tick:f.tick,x:f.entrant?.x,y:f.entrant?.y,heading:f.entrant?.heading}));
    if(frames.some((f,i)=>!Number.isFinite(f.tick)||!Number.isFinite(f.x)||!Number.isFinite(f.y)||!Number.isFinite(f.heading)||(i>0&&f.tick<=frames[i-1].tick))) throw Error(`Invalid trajectory for ${arm}`);
    const starts=row.starts??[];
    if((arm==='none'&&starts.length!==0)||(arm!=='none'&&(starts.length!==1||starts[0].tick!==CONTACT_TICK||starts[0].identity!==contacts[0].id))) throw Error(`Unexpected activation for ${arm}`);
    const pRolls=contacts.flatMap(c=>(c.injuryRolls??[]).filter(r=>r.id==='P'));
    const finish=row.finish.find(x=>x.id==='P');
    if(!finish||pRolls.length!==1||pRolls.some(r=>r.injured)) throw Error(`Unexpected P outcome for ${arm}`);
    return {arm,frames,starts,contact:contacts[0],pInjured:false,finishSeconds:finish.crossingTimeSeconds,place:finish.place};
  });
  return result;
}

export function sharedBounds(rows,mode) {
  if(!['whole','contact'].includes(mode)) throw Error('Invalid view mode');
  const frames=rows.flatMap(row=>mode==='contact'?row.frames.filter(f=>f.tick>=WINDOW[0]&&f.tick<=WINDOW[1]):row.frames);
  if(!frames.length) throw Error('No frames in view');
  const xs=frames.map(f=>f.x),ys=frames.map(f=>f.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const pad=mode==='contact'?2:3;
  return {minX:minX-pad,maxX:maxX+pad,minY:minY-pad,maxY:maxY+pad};
}

export function frameAtOrBefore(frames,tick) {
  let result=frames[0]; for(const frame of frames){if(frame.tick>tick)break;result=frame;} return result;
}
