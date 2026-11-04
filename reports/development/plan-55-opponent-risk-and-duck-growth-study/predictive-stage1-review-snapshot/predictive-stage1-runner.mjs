import {open} from 'node:fs/promises';import {resolveSeededRace} from './predictive-traffic-adapter.mjs';import {stageInput,crowdMeasure,rankChurn} from './predictive-stage-core.mjs';
const arm=process.argv[2];if(!['reference','multi','predictive'].includes(arm))throw Error('invalid arm');
const root='reports/development/plan-55-opponent-risk-and-duck-growth-study/predictive-stage1-output/';
const h=await open(`${root}${arm}.json`,'wx');let calls=0,failure=null;const cases=[];
try{for(let i=0;i<16;i++){
 const input=stageInput(i,arm);calls++;const r=resolveSeededRace(input);
 const contacts=r.eventRecords.filter(e=>e.type==='duck-contact');
 const crowd=crowdMeasure(r.trajectory,r.dt,r.courseLength,r.finishCrossings);
 cases.push({seed:input.seed,arm,choice:input.choice,risks:{P:input.choice,...input.candidateRivalChoices},status:r.status,reason:r.unresolvedReason,guard:r.guardEvidence,contacts,contactAudit:r.multiContactAudit??[],advice:r.adviceAudit??[],crowd,rankChurn:rankChurn(r.trajectory),crossings:r.finishCrossings,winner:r.winner,first:r.finishTimeSeconds,last:r.lastFinishTimeSeconds,dt:r.dt,courseLength:r.courseLength});
 if(r.status!=='finished')throw Error(`unresolved race ${input.seed}: ${r.unresolvedReason}`);
 }}catch(e){failure=String(e?.stack??e)}
const text=JSON.stringify({version:'plan55-predictive-stage1/v1',arm,calls,cases,failure});if(Buffer.byteLength(text)>2*1024*1024){await h.close();throw Error('arm output exceeds 2 MiB')};await h.writeFile(text);await h.close();process.stdout.write(JSON.stringify({arm,calls,cases:cases.length,failure,bytes:Buffer.byteLength(text)})+'\n');if(failure)process.exitCode=1;
