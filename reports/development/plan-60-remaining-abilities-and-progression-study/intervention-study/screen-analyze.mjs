// Fixed summaries only; no filtering or execution until Stage1 clearance.
import {readFileSync,writeFileSync} from 'node:fs';
const base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/';
const phase=process.argv[2]; if(!['healthy','injured'].includes(phase))throw Error('invalid phase');
const ranges=phase==='healthy'?[[0,4],[4,16],...Array.from({length:15},(_,i)=>[16+i*16,32+i*16])]:Array.from({length:4},(_,i)=>[256+i*16,272+i*16]);
const rows=[];
for(const [a,b] of ranges) {
  const name=base+`screen-${String(a).padStart(3,'0')}-${String(b).padStart(3,'0')}.jsonl`;
  const lines=readFileSync(name,'utf8').trim().split(/\r?\n/).map(JSON.parse);
  if(lines[0]?.type!=='start'||lines[0].start!==a||lines[0].end!==b||lines.at(-1)?.type!=='complete')throw Error(`incomplete ${name}`);
  const cases=lines.filter(x=>x.type==='case'); if(cases.length!==b-a || cases.some((x,i)=>x.index!==a+i||x.status!=='finished'))throw Error(`missing, duplicate or unresolved ${name}`);
  rows.push(...cases);
}
const median=values=>{const v=[...values].sort((a,b)=>a-b),m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;};
const dist=values=>({n:values.length,min:Math.min(...values),q1:[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*.25)],median:median(values),q3:[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*.75)],max:Math.max(...values)});
function wilson(k,n) {const z=1.96,p=k/n,d=1+z*z/n,mid=(p+z*z/(2*n))/d,half=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;return [Math.max(0,mid-half),Math.min(1,mid+half)];}
function pRolls(row) {return row.contacts.flatMap(c=>(c.injuryRolls??[]).filter(x=>x.id==='P').map(x=>({...x,contactId:c.id})));}
function recovery(row) { return row.contacts.filter(c=>c.participants.includes('P')).map(c=>c.recovery?.P).filter(Boolean); }
function cohort(row) {return `${row.entryInjured?'injured':'healthy'}/${row.playerBaseSpeed===14?'favorite':'equal'}/${row.stance}`;}
const groups={};
for(const row of rows) {const key=`${cohort(row)}/${row.arm}`;(groups[key]??=[]).push(row);}
const summaries={};
for(const [key,g] of Object.entries(groups)) {
  const withContact=g.filter(x=>x.pContacts>0).length,withInjury=g.filter(x=>pRolls(x).some(z=>z.injured)).length;
  const durations=g.flatMap(x=>recovery(x).filter(z=>Number.isFinite(z.startedAt)&&Number.isFinite(z.recenteredAt)).map(z=>z.recenteredAt-z.startedAt));
  const starts=g.reduce((n,x)=>n+x.starts.length,0),protectedRolls=g.flatMap(pRolls).filter(x=>x.interventionFactor===.5);
  const activatedContactEpisodes=g.reduce((n,x)=>n+x.starts.filter(s=>x.contacts.some(c=>c.id===s.identity&&c.participants.includes('P'))).length,0);
  summaries[key]={races:g.length,pWithContact:{count:withContact,denominator:g.length,wilson95:wilson(withContact,g.length)},
    pNewInjury:g[0].entryInjured?null:{count:withInjury,denominator:g.length,wilson95:wilson(withInjury,g.length)},
    entryInjuredNoPRoll:g[0].entryInjured?{count:g.filter(x=>pRolls(x).length===0).length,denominator:g.length}:null,
    pContactDistribution:dist(g.map(x=>x.pContacts)),activationCount:starts,opportunityCount:g.reduce((n,x)=>n+x.opportunities.length,0),
    protectedEligibleRolls:protectedRolls.length,activatedContactEpisodes,recoveryCompleted:durations.length,recoveryObservations:g.reduce((n,x)=>n+recovery(x).length,0),
    recoverySeconds:durations.length?dist(durations):null,place:dist(g.map(x=>x.finish.find(e=>e.id==='P').place)),
    firstCrossingSeconds:dist(g.map(x=>x.firstCrossingSeconds)),lastCrossingSeconds:dist(g.map(x=>x.lastCrossingSeconds)),
    belowEightActivationFlag:starts<8,belowEightRelevantFlag:g[0].arm==='guard'?protectedRolls.length<8:['quick-recovery','straight-shooter'].includes(g[0].arm)?activatedContactEpisodes<8:null};
}
const comparisons={};
for(const [key,g] of Object.entries(groups)) {
  if(!key.endsWith('/none'))continue;
  for(const arm of ['guard','quick-recovery','straight-shooter']) {
    const targetKey=key.slice(0,-4)+arm, targets=groups[targetKey]; if(!targets)throw Error(`missing arm ${targetKey}`);
    const paired=g.map(c=>{const t=targets.find(x=>x.seed===c.seed);if(!t)throw Error(`missing seed ${c.seed}`);return [c,t];});
    let matchedDraws=0,controlOnlyInjuries=0,candidateOnlyInjuries=0;
    for(const [control,candidate] of paired) {
      const a=pRolls(control),b=pRolls(candidate);
      for(const roll of a) {const match=b.find(x=>x.contactId===roll.contactId&&x.key===roll.key&&x.value===roll.value);
        if(match) {matchedDraws++;if(roll.injured&&!match.injured)controlOnlyInjuries++;if(!roll.injured&&match.injured)candidateOnlyInjuries++;}}
    }
    const placeDifference=paired.map(([c,t])=>t.finish.find(x=>x.id==='P').place-c.finish.find(x=>x.id==='P').place);
    comparisons[`${key} vs ${arm}`]={pairedSeeds:paired.length,placeDifference:dist(placeDifference),
      lower:placeDifference.filter(x=>x<0).length,same:placeDifference.filter(x=>x===0).length,higher:placeDifference.filter(x=>x>0).length,
      matchedPInjuryDraws:matchedDraws,matchedControlOnlyInjuryOutcomes:controlOnlyInjuries,matchedCandidateOnlyInjuryOutcomes:candidateOnlyInjuries};
  }
}
const output={phase,total:rows.length,summaries,comparisons,limitations:['Seed pairing does not match divergent trajectories or contacts.',
  'Matched injury outcomes require identical actual contact ID, entrant key and draw; they are descriptive conditional comparisons, not a population injury-prevention estimate.',
  'False Guard predictions and within-window contact fractions cannot be determined from the currently retained audit.',
  'Contact-endpoint finish ordering and continuous interruption remain inherited/untested limitations.',
  'Recovery times exclude unrecentered/censored episodes; denominator is reported.',
  'Wilson intervals assume independent cases and do not account for paired/shared seed structure across arms.']};
writeFileSync(base+`screen-${phase}-analysis.json`,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
