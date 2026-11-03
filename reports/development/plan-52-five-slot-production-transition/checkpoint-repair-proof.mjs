import {spawnSync} from 'node:child_process';import {readFile,writeFile} from 'node:fs/promises';
const j=JSON.parse(await readFile('scripts/dev/checkpoints/catalog.json','utf8')),results=[];
for(const id of Object.keys(j.checkpoints).filter(x=>x.startsWith('plan52.'))){const r=spawnSync(process.execPath,['--max-old-space-size=512','scripts/dev/checkpoints/checkpoint-proof.mjs','fixture',id],{encoding:'utf8',windowsHide:true});results.push({id,status:r.status,stdout:r.stdout,stderr:r.stderr});if(r.status!==0)break;}
await writeFile('reports/development/plan-52-five-slot-production-transition/checkpoint-repair-case-evidence/proof-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));if(results.length!==13||results.some(x=>x.status!==0))process.exitCode=1;
