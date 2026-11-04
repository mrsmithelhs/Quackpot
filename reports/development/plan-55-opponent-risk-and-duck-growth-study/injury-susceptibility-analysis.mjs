import { readFile,open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir='reports/development/plan-55-opponent-risk-and-duck-growth-study/injury-susceptibility-results/',arms=['off','first','contact'],data={};
for(const arm of arms){const x=JSON.parse(await readFile(`${dir}${arm}.json`,'utf8'));if(x.version!=='plan55-injury-susceptibility/v1'||x.arm!==arm||x.calls!==8||x.failure||x.cases.length!==8)throw Error(`invalid ${arm}`);data[arm]=x.cases;for(let i=0;i<8;i++)if(x.cases[i].seed!==`p55m-${String(i).padStart(3,'0')}`||x.cases[i].arm!==arm||x.cases[i].status!=='finished')throw Error('seed/order/status mismatch');}
const rows=[];
for(let i=0;i<8;i++){
 const [off,first,contact]=arms.map(k=>data[k][i]);if(JSON.stringify(off.choices)!==JSON.stringify(first.choices)||JSON.stringify(off.choices)!==JSON.stringify(contact.choices)||off.player!==first.player||off.player!==contact.player)throw Error('unpaired field');
 const summary=x=>({contacts:x.contacts.length,participants:x.participants,newInjured:Object.values(x.participants).filter(p=>p.newInjury).length,first:x.first,last:x.last});
 rows.push({seed:off.seed,off:summary(off),first:summary(first),contact:summary(contact)});
}
const payload=JSON.stringify({method:'eight fixed paired single races; participant eligibility and contacts may diverge after onset; no imputation or run-level injury inference',rows});
const path=dir+'analysis.json',h=await open(path,'wx');await h.writeFile(payload);await h.close();process.stdout.write(JSON.stringify({path,bytes:Buffer.byteLength(payload),sha256:createHash('sha256').update(payload).digest('hex'),seeds:rows.length})+'\n');
