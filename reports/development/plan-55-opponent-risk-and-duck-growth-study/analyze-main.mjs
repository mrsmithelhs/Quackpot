import { readFile, open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRng } from '../../../src/core/prng.mjs';
const base='reports/development/plan-55-opponent-risk-and-duck-growth-study/main-results/';
const cells=['A','B1','B2','C1','C2','C3','C4','C5','D'],runs=[],shards=[];
for(let k=0;k<18;k++) {
  let text; try {text=await readFile(`${base}shard-${String(k).padStart(2,'0')}.json`,'utf8');} catch(e) {if(e.code==='ENOENT'){shards.push({shard:k,missing:true});continue;}throw e;}
  const x=JSON.parse(text);
  if(x.version!=='plan55-main/v1'||x.shard!==k||!Number.isInteger(x.calls)||x.calls<0||x.calls>96||!Array.isArray(x.runs)||x.runs.length>16) throw Error(`invalid shard ${k}`);
  for(const r of x.runs) {
    if(!Number.isInteger(r.index)||r.index<16*k||r.index>=16*k+16)throw Error(`invalid index in shard ${k}`);
    const si=Math.floor(r.index/18),n=r.index%18;
    if(r.seed!==`plan55-${String(si).padStart(3,'0')}`||r.rosterSize!==(n<9?1:3)||r.cell!==cells[n%9]||r.phase!==(si%2===0?'steady-first':'variable-first')||!Array.isArray(r.races)||r.races.length!==6)throw Error(`invalid run ${r.index}`);
    for(let j=0;j<6;j++) {const q=r.races[j], expected=r.cell==='A'?'current':((j+si)%2===0?'mostly-steady':'mostly-variable');if(q.opportunity!==j+1||q.field!==expected||!['finished','unresolved'].includes(q.status)||(q.status==='finished'&&(!Number.isInteger(q.place)||q.place<1||q.place>6)))throw Error(`invalid race ${r.index}/${j}`);}
    runs.push(r);
  }
  shards.push({shard:k,calls:x.calls,failure:x.failure});
}
if(shards.length!==18 || shards.some(s=>s.missing || s.failure) || runs.length!==288) throw Error('incomplete main matrix; analysis withheld');
const lookup=new Map();for(const r of runs){const key=`${r.seed}/${r.rosterSize}/${r.cell}`;if(lookup.has(key))throw Error(`duplicate run ${key}`);lookup.set(key,r);}
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
function paired(a,b,field,metric,roster) {
  const units=[]; let eligible=0,missing=0,unresolved=0;
  for(let i=0;i<16;i++) {
    const seed=`plan55-${String(i).padStart(3,'0')}`, values=[];
    const left=lookup.get(`${seed}/${roster}/${a}`),right=lookup.get(`${seed}/${roster}/${b}`);
    for(let j=0;j<6;j++) {
      if((j+i)%2 !== (field==='mostly-steady'?0:1))continue;
      eligible++;const x=left?.races[j],y=right?.races[j];
      if(!x||!y){missing++;continue;}if(x.status!=='finished'||y.status!=='finished'){unresolved++;continue;}
      const value=r=>metric==='place'?r.place:metric==='newInjury'?Number(r.newInjury):metric==='extended'?Number(r.extended):-r.place-Number(r.newInjury)-0.5*Number(r.extended);
      values.push(value(x)-value(y));
    }
    if(values.length)units.push({seed,phase:i%2===0?'steady-first':'variable-first',difference:mean(values)});
  }
  const differences=units.map(x=>x.difference),boot=[];
  if(differences.length>=2){const rng=createRng(`plan55-analysis/v1/${a}/${b}/${field}/${metric}/${roster}`);for(let i=0;i<2000;i++)boot.push(mean(differences.map(()=>differences[rng.int(differences.length)])));boot.sort((x,y)=>x-y);}
  return {a,b,field,metric,roster,eligible,missing,unresolved,nSeeds:units.length,mean:differences.length?mean(differences):null,ci95:boot.length?[boot[49],boot[1949]]:null,units};
}
const results=[];
for(const [a,b] of [['B1','B2'],['C2','C4'],['C3','C5'],['C2','C3'],['C4','C5'],['C1','B1'],['C2','C1'],['D','C2']]) for(const roster of [1,3]) for(const field of ['mostly-steady','mostly-variable']) for(const metric of ['place','score','newInjury','extended']) results.push(paired(a,b,field,metric,roster));
const output=JSON.stringify({method:'2000 deterministic seed-block bootstrap percentile 2.5/97.5; completed matched race opportunities averaged within seed and roster; no imputation',shards,results});
const path=base+'analysis.json';const handle=await open(path,'wx');await handle.writeFile(output);await handle.close();
process.stdout.write(JSON.stringify({path,bytes:Buffer.byteLength(output),sha256:createHash('sha256').update(output).digest('hex'),comparisons:results.length})+'\n');

