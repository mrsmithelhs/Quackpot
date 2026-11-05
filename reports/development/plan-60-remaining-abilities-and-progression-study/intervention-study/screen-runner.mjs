// Fixed, limited exploratory Plan60 screen. No execution until QP Orch clears Stage1.
import { readFileSync,writeFileSync,appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolveSeededRace } from './adapter.mjs';
const base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/';
const args=process.argv.slice(2),start=Number(args[0]),end=Number(args[1]),expectedPins=args[2];
const ranges=[[0,4],[4,16],...Array.from({length:19},(_,i)=>[16+i*16,32+i*16])];
if(!ranges.some(([a,b])=>a===start&&b===end)||!/^[a-f0-9]{64}$/.test(expectedPins??'')) throw Error('unsupported range or pin');
const file=base+`screen-${String(start).padStart(3,'0')}-${String(end).padStart(3,'0')}.jsonl`;
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
function check() {
  if(sha(base+'screen-owned-pins.txt')!==expectedPins) throw Error('screen pin manifest drift');
  for(const manifest of ['source-pins.txt','stage0-owned-pins.txt','screen-owned-pins.txt']) for(const line of readFileSync(base+manifest,'utf8').trim().split(/\r?\n/)) {
    if(!line.trim())continue; const [hash,path]=line.trim().split(/\s+/,2); if(sha(path)!==hash)throw Error(`source drift ${path}`);
  }
}
const arms=['none','guard','quick-recovery','straight-shooter'];
function caseInput(index) {
  const injured=index>=256, offset=injured?index-256:index, seed=injured?Math.floor(offset/8):Math.floor(offset/16);
  const cell=injured?Math.floor(offset/4)%2:Math.floor(offset/4)%4, arm=arms[offset%4];
  const choice=cell%2?'sprint':'steady',favorite=!injured&&cell>=2;
  const rivals={A:'steady',B:'steady',C:'steady',D:'steady',E:'steady'};
  return {seed:`p60i-${String(seed).padStart(3,'0')}`,raceId:'p60i',choice,playerBaseSpeed:favorite?14:10,fieldBaseSpeed:10,
    trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,
    candidateRivalChoices:rivals,multiContact:{advice:true,risks:{P:choice,...rivals}},susceptibility:'contact',injuryBand:'medium',
    intervention:{arm,entryInjured:injured}};
}
function compact(r,input,index) {
  const contacts=r.eventRecords.filter(e=>e.type==='duck-contact');
  const own=contacts.filter(e=>e.participants.includes('P'));
  const trace=r.interventionAudit?.audit??[];
  const opportunities=trace.filter(e=>e.type==='opportunity');
  const starts=trace.filter(e=>e.type==='start');
  const ends=trace.filter(e=>e.type==='end');
  const advice=(r.adviceAudit??[]).filter(e=>e.id==='P');
  const assistance=(r.studyAssistanceAudit??[]).filter(e=>e.entrantId==='P');
  const result={index,input,seed:input.seed,raceId:input.raceId,arm:input.intervention.arm,entryInjured:input.intervention.entryInjured,
    stance:input.choice,playerBaseSpeed:input.playerBaseSpeed,fieldBaseSpeed:input.fieldBaseSpeed,status:r.status,reason:r.unresolvedReason,
    guardEvidence:r.guardEvidence??null,finish:r.finish.map(x=>({id:x.id,place:x.place,crossingTimeSeconds:x.crossingTimeSeconds})),
    firstCrossingSeconds:r.finishTimeSeconds,lastCrossingSeconds:r.lastFinishTimeSeconds,
    contacts:contacts.map(e=>({id:e.id,tick:e.tick,participants:e.participants,injuryRolls:e.injuryRolls??[],
      recovery:e.recovery??{},ranks:e.studyRanksAtContact??null})),
    pContacts:own.length,opportunities,starts,ends,controllerAudit:trace.filter(e=>['controller-transition','target-modifier','blocked'].includes(e.type)),
    injuryAudit:r.interventionInjuryAudit??{},adviceSummary:{samples:advice.length,eligible:advice.filter(e=>e.eligible===true).length,follow:advice.filter(e=>e.follow===true).length},
    assistanceSummary:{records:assistance.length},drawCounts:r.draws};
  // Fixed, compact path witness only: first seed in each cell, no outcome-selected screenshots.
  if(input.seed==='p60i-000') result.witness=r.trajectory.map(f=>({tick:f.tick,entrant:f.entrants.find(e=>e.id==='P')}));
  return result;
}
check(); writeFileSync(file,JSON.stringify({type:'start',start,end,manifest:expectedPins})+'\n',{flag:'wx'});
const began=performance.now(); let bytes=0,currentIndex=null;
try {
  for(let index=start;index<end;index++) {
    currentIndex=index;
    check(); const input=caseInput(index); const result=resolveSeededRace(input);
    const row=compact(result,input,index),line=JSON.stringify({type:'case',...row})+'\n';
    bytes+=Buffer.byteLength(line); if(bytes>2*1024*1024) throw Error('2 MiB output cap');
    appendFileSync(file,line); check();
    if(result.status!=='finished') throw Error(`unresolved case ${index}: ${result.status}/${result.unresolvedReason}`);
  }
  appendFileSync(file,JSON.stringify({type:'complete',count:end-start,elapsedMs:performance.now()-began})+'\n');
} catch(error) { appendFileSync(file,JSON.stringify({type:'failure',index:currentIndex,input:currentIndex===null?null:caseInput(currentIndex),error:String(error),elapsedMs:performance.now()-began})+'\n'); throw error; }
