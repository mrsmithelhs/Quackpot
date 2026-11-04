import { readFile,open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir='reports/development/plan-55-opponent-risk-and-duck-growth-study/multi-base-results/',arms=['reference','multi','advice'];const data={};
for(const arm of arms){const x=JSON.parse(await readFile(`${dir}${arm}.json`,'utf8'));if(x.version!=='plan55-multi-base/v1'||x.arm!==arm||x.calls!==8||x.failure||x.cases.length!==8)throw Error(`invalid ${arm}`);data[arm]=x.cases;for(let i=0;i<8;i++)if(x.cases[i].seed!==`p55m-${String(i).padStart(3,'0')}`||x.cases[i].arm!==arm)throw Error('seed/order mismatch');}
const rows=[];
for(let i=0;i<8;i++) {
 const [r,m,a]=arms.map(k=>data[k][i]);
 if(JSON.stringify(r.choices)!==JSON.stringify(m.choices)||JSON.stringify(r.choices)!==JSON.stringify(a.choices)||r.player!==m.player||r.player!==a.player)throw Error('unpaired field');
 rows.push({seed:r.seed,reference:{status:r.status,contacts:r.contacts.length,clusters:r.clusters.length,crowding:r.crowding,first:r.first,last:r.last},multi:{status:m.status,contacts:m.contacts.length,clusters:m.clusters.length,crowding:m.crowding,first:m.first,last:m.last},advice:{status:a.status,contacts:a.contacts.length,clusters:a.clusters.length,crowding:a.crowding,first:a.first,last:a.last,opportunities:a.advice.opportunities,eligible:a.advice.eligible,followed:a.advice.followed,ignored:a.advice.ignored,skips:a.advice.skips}});
}
const payload=JSON.stringify({method:'descriptive fixed paired seeds; unresolved and guard evidence retained in input cases; no imputation or claimed avoided specific collision',rows});
const path=dir+'analysis.json',h=await open(path,'wx');await h.writeFile(payload);await h.close();process.stdout.write(JSON.stringify({path,bytes:Buffer.byteLength(payload),sha256:createHash('sha256').update(payload).digest('hex'),seeds:rows.length})+'\n');

