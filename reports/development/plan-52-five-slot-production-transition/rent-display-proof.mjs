import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {currentValidationLoaderSha256,currentPlan52SourceClosure} from '../../../scripts/dev/checkpoints/provenance.mjs';
const output='reports/development/plan-52-five-slot-production-transition/rent-display-proof-results.json';
const loader=await currentValidationLoaderSha256(),closure=(await currentPlan52SourceClosure()).sha256;
if(loader!=='db26608df64be0f0bbf79bef278b7d2ffd9c32fb109f1e9c224405791c2a1a5e'||closure!=='d5a49498b70a18a1109731159cdc8dabbf2e1b9ce58b3aabaffca1dc64db7d06')throw Error('Loader/source pin mismatch');
const catalog=JSON.parse(await readFile('scripts/dev/checkpoints/catalog.json','utf8')),ids=Object.keys(catalog.checkpoints).filter(x=>x.startsWith('plan52.')),results=[];
for(const id of ids){if(catalog.checkpoints[id].cleanupEvidencePolicy!=='sampled-observation-v1')throw Error(`${id}: missing policy`);const r=spawnSync(process.execPath,['--max-old-space-size=512','scripts/dev/checkpoints/checkpoint-proof.mjs','fixture',id],{encoding:'utf8',windowsHide:true});results.push({id,status:r.status,stdout:r.stdout,stderr:r.stderr});if(r.status!==0)break;}
await writeFile(output,JSON.stringify({loader,closure,results},null,2),{flag:'wx'});console.log(JSON.stringify({loader,closure,results}));if(results.length!==13||results.some(x=>x.status!==0))process.exitCode=1;
