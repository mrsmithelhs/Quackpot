import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { cases,runCase } from './suite.mjs';
const base='reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/';
const [seed,out]=process.argv.slice(2);if(!['pair-0','pair-1','pair-2'].includes(seed)||!out)throw Error('invalid shard');
const pins=JSON.parse(await readFile(base+'pins.json','utf8'));
async function verify(){for(const [path,pin] of Object.entries(pins)){const hash=createHash('sha256').update(await readFile(path)).digest('hex');if(hash!==pin)throw Error(`source drift ${path}`);}}
await verify();const table=JSON.parse(await readFile(base+'../../reference-v1.json','utf8'));
for(const id of cases.filter(c=>c.startsWith(seed+'/'))){const start=performance.now(),first=await runCase(id,table),elapsedMs=performance.now()-start,repeat=await runCase(id,table);
  if(JSON.stringify(first)!==JSON.stringify(repeat))throw Error(`repeat mismatch ${id}`);
  const record={...first,elapsedMs,bytes:Buffer.byteLength(first.envelope),nodeVersion:process.version,repeat:true};
  await writeFile(`${out}/${id.replace('/','-')}.json`,JSON.stringify(record),{flag:'wx'});
  const payload=JSON.parse(first.envelope).payload;console.log(JSON.stringify({id,status:payload.status,unresolved:payload.unresolved,crossings:payload.crossings,elapsedMs,bytes:record.bytes}));}
await verify();
