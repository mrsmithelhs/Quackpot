import {open,mkdir} from 'node:fs/promises';import {isDeepStrictEqual} from 'node:util';import {resolveSeededRace as oldRace} from './injury-susceptibility-adapter.mjs';import {resolveSeededRace as newRace} from './predictive-traffic-adapter.mjs';import {stageInput} from './predictive-stage-core.mjs';import {sha,checkPins} from './predictive-stage-io.mjs';
const root='reports/development/plan-55-opponent-risk-and-duck-growth-study/predictive-correctness-output/',pin=process.argv[2];let calls=0;const cases=[];
async function write(path,data){const h=await open(path,'wx');try{await h.writeFile(data)}finally{await h.close()}}
function canonical(r){const {multiContactAudit,...rest}=r;return rest}
function audit(r){let repeats=0;for(const batch of r.multiContactAudit??[])for(const hit of batch.accepted){const prev=batch.rearmBefore[hit.key];if(prev){repeats++;if(!prev.separated||!prev.separationWitness||prev.separationWitness.tick>=batch.tick||prev.separationWitness.distance<1.2||batch.tick-prev.tick<10)throw Error('invalid rearm evidence')}}return repeats}
await mkdir(root);
try{await checkPins(pin);for(const i of [0,1])for(const arm of ['reference','multi']){
 const input=stageInput(i,arm);input.seed=`p55m-${String(i).padStart(3,'0')}`;
 await checkPins(pin);calls++;const old=oldRace(input);await checkPins(pin);calls++;const next=newRace(input);await checkPins(pin);
 const equal=isDeepStrictEqual(canonical(old),canonical(next)), oldHash=sha(JSON.stringify(canonical(old))),newHash=sha(JSON.stringify(canonical(next)));
 if(arm==='reference'&&!equal)throw Error('accepted reference differs');if(old.status!=='finished'||next.status!=='finished')throw Error('correctness race unresolved');
 cases.push({seed:input.seed,arm,equal,oldHash,newHash,oldContacts:old.eventRecords.filter(x=>x.type==='duck-contact').map(x=>x.id),newContacts:next.eventRecords.filter(x=>x.type==='duck-contact').map(x=>x.id),repeatsWithWitness:audit(next)});
 }
 for(const i of [0,1]){const input=stageInput(i,'predictive');input.seed=`p55m-${String(i).padStart(3,'0')}`;await checkPins(pin);calls++;const r=newRace(input,{testInjectLiveGuard:true});await checkPins(pin);const e=r.guardEvidence?.testRollback;if(r.unresolvedReason!=='multi_contact_guard'||!e||Object.values(e).some(x=>x!==true))throw Error('live guard not reached or rollback mismatch: '+JSON.stringify({seed:input.seed,reason:r.unresolvedReason,e}));cases.push({seed:input.seed,arm:'forced-guard',rollback:e,guard:r.guardEvidence,repeatsWithWitness:audit(r)});}
 const text=JSON.stringify({version:'plan55-predictive-correctness/v1',calls,cases,pin});if(Buffer.byteLength(text)>1024*1024)throw Error('receipt too large');await write(root+'result.json',text);await write(root+'complete.json',JSON.stringify({calls,bytes:Buffer.byteLength(text),sha256:sha(text),pin}));process.stdout.write(JSON.stringify({calls,sha256:sha(text),cases})+'\n');
}catch(e){const error=String(e?.stack??e);try{await write(root+'failure.json',JSON.stringify({calls,cases,error}))}catch(w){process.stderr.write('failure receipt failed: '+String(w)+'\n')}process.stderr.write(JSON.stringify({calls,error})+'\n');process.exitCode=1}
