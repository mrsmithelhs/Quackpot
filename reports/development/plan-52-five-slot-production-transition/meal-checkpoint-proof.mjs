import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {currentValidationLoaderSha256,currentPlan52SourceClosure} from '../../../scripts/dev/checkpoints/provenance.mjs';
const output='reports/development/plan-52-five-slot-production-transition/meal-checkpoint-proof-results.json';
const loader=await currentValidationLoaderSha256(),closure=(await currentPlan52SourceClosure()).sha256;
if(loader!=='ff519ab1bee76d11d53978ade35e871f638ee6364d9e680dd00797fad395a285'||closure!=='ed85dbadcfae669ac8fa2c66130a004a9892f2008dddbd1dfaa44f0d4cfb47fd')throw Error('Loader/source pin mismatch');
const unit=spawnSync(process.execPath,['--max-old-space-size=512','--test','scripts/dev/checkpoints/seeded-continuation.test.mjs','scripts/dev/checkpoints/seeded-completed-fixtures.test.mjs','scripts/dev/checkpoints/cleanup-evidence.test.mjs'],{encoding:'utf8',windowsHide:true});if(unit.status!==0){console.error(unit.stdout,unit.stderr);process.exit(1);}
const catalog=JSON.parse(await readFile('scripts/dev/checkpoints/catalog.json','utf8')),ids=Object.keys(catalog.checkpoints).filter(x=>x.startsWith('plan52.')),results=[];
for(const id of ids){if(catalog.checkpoints[id].cleanupEvidencePolicy!=='sampled-observation-v1')throw Error(`${id}: missing policy`);const r=spawnSync(process.execPath,['--max-old-space-size=512','scripts/dev/checkpoints/checkpoint-proof.mjs','fixture',id],{encoding:'utf8',windowsHide:true});results.push({id,status:r.status,stdout:r.stdout,stderr:r.stderr});if(r.status!==0)break;}
await writeFile(output,JSON.stringify({loader,closure,unit:{status:unit.status,stdout:unit.stdout,stderr:unit.stderr},results},null,2),{flag:'wx'});console.log(JSON.stringify({loader,closure,unit:{status:unit.status,stdout:unit.stdout,stderr:unit.stderr},results}));if(results.length!==13||results.some(x=>x.status!==0))process.exitCode=1;
