import {open} from 'node:fs/promises';import {resolveSeededRace} from './predictive-traffic-adapter.mjs';import {stageInput,crowdMeasure,rankChurn} from './predictive-stage-core.mjs';import {checkPins,sha} from './predictive-stage-io.mjs';
const arm=process.argv[2],pinDigest=process.argv[3];if(!['reference','multi','predictive'].includes(arm))throw Error('invalid arm');
const root='reports/development/plan-55-opponent-risk-and-duck-growth-study/predictive-stage1-output/';
async function write(path,data){const h=await open(path,'wx');try{await h.writeFile(data)}finally{await h.close()}}
let calls=0;const cases=[];
try{await checkPins(pinDigest);for(let i=0;i<16;i++){
 const input=stageInput(i,arm);await checkPins(pinDigest);calls++;const r=resolveSeededRace(input);await checkPins(pinDigest);
 const contacts=r.eventRecords.filter(e=>e.type==='duck-contact'),crowd=crowdMeasure(r.trajectory,r.dt,r.courseLength,r.finishCrossings);
 cases.push({seed:input.seed,arm,choice:input.choice,risks:{P:input.choice,...input.candidateRivalChoices},status:r.status,reason:r.unresolvedReason,guard:r.guardEvidence,contacts,contactAudit:r.multiContactAudit??[],advice:r.adviceAudit??[],crowd,rankChurn:rankChurn(r.trajectory),crossings:r.finishCrossings,winner:r.winner,first:r.finishTimeSeconds,last:r.lastFinishTimeSeconds,dt:r.dt,courseLength:r.courseLength});
 if(r.status!=='finished')throw Error(`unresolved race ${input.seed}: ${r.unresolvedReason}`);
 }
 const text=JSON.stringify({version:'plan55-predictive-stage1/v1',arm,calls,cases,failure:null});if(Buffer.byteLength(text)>2*1024*1024)throw Error('arm output exceeds 2 MiB');await checkPins(pinDigest);await write(`${root}${arm}.json`,text);await checkPins(pinDigest);await write(`${root}${arm}.complete.json`,JSON.stringify({arm,calls,bytes:Buffer.byteLength(text),sha256:sha(text),pinDigest}));process.stdout.write(JSON.stringify({arm,calls,cases:cases.length,bytes:Buffer.byteLength(text),sha256:sha(text)})+'\n');
}catch(e){const failure=JSON.stringify({arm,calls,error:String(e?.stack??e)});try{await write(`${root}${arm}.failure.json`,failure)}catch(writeError){process.stderr.write('failure receipt write failed: '+String(writeError)+'\n')}process.stderr.write(failure+'\n');process.exitCode=1}
