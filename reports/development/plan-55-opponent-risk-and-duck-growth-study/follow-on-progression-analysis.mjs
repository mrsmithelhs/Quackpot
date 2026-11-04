import { readFile,open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir='reports/development/plan-55-opponent-risk-and-duck-growth-study/follow-on-results/';
const cells=[['favorite','none','post-race'],['favorite','burst','post-race'],['favorite','guard','post-race'],['favorite','none','same-race'],['favorite','burst','same-race'],['favorite','guard','same-race'],['favorite','none','off'],['rotate','none','post-race'],['rotate','burst','post-race'],['rotate','guard','post-race'],['rotate','none','same-race'],['rotate','burst','same-race'],['rotate','guard','same-race'],['rotate','none','off']];
const runs=[],seen=new Set();
for(let shard=0;shard<14;shard++){
 const o=JSON.parse(await readFile(`${dir}progression-${String(shard).padStart(2,'0')}.json`,'utf8'));
 if(o.version!=='plan55-progression/v1'||o.shard!==shard||o.failure||o.runs.length!==8||o.calls>96)throw Error(`invalid shard ${shard}`);
 for(const r of o.runs){const si=Math.floor(r.index/14),cell=cells[r.index%14];
  if(r.index<shard*8||r.index>=shard*8+8||seen.has(r.index)||r.seed!==`p55p-${String(si).padStart(3,'0')}`||[r.policy,r.ability,r.mode].some((v,i)=>v!==cell[i])||!Array.isArray(r.races)||r.races.length>12)throw Error(`invalid run ${r.index}`);
  seen.add(r.index);runs.push(r);
 }
}
if(runs.length!==112)throw Error('missing runs');
const summaries=runs.map(r=>{
 const done=r.races.filter(x=>x.status==='finished'),unresolved=r.races.filter(x=>x.status!=='finished');
 const rolls=done.flatMap(x=>x.contact.flatMap(c=>c.rolls)),playerRolls=done.flatMap(x=>x.contact.flatMap(c=>c.rolls.filter(z=>z.id===x.duckId)));
 return {seed:r.seed,phase:r.phase,policy:r.policy,ability:r.ability,mode:r.mode,attempted:r.races.length,completed:done.length,unresolved:unresolved.length,missingOpportunities:12-r.races.length,
  favoriteEntries:done.filter(x=>x.favoriteChosen).length,injuredEntries:done.filter(x=>x.pre.injured).length,tiredEntries:done.filter(x=>x.pre.rest<1).length,
  wins:done.filter(x=>x.place===1).length,losses:done.filter(x=>x.place>1).length,payout:done.reduce((s,x)=>s+x.payout,0),meanPlace:done.length?done.reduce((s,x)=>s+x.place,0)/done.length:null,
  pointEarned:done.filter(x=>x.post.banked===1).map(x=>({duck:x.duckId,opportunity:x.opportunity})),abilityFirstUse:done.filter(x=>x.pre.ability).map(x=>({duck:x.duckId,opportunity:x.opportunity})).filter((x,i,a)=>a.findIndex(y=>y.duck===x.duck)===i),
  playerExposures:playerRolls.length,playerInjuries:playerRolls.filter(x=>x.injured).length,rivalExposures:rolls.length-playerRolls.length,rivalInjuries:rolls.filter(x=>!playerRolls.includes(x)&&x.injured).length,
  extensions:done.flatMap(x=>x.updates).filter(x=>x.extended).length,recoveries:done.flatMap(x=>x.updates).filter(x=>x.previous&&!x.injured).length};
});
const payload=JSON.stringify({method:'descriptive individual paired seeds; no imputation; unresolved stops each run',summaries});
const path=dir+'progression-analysis.json',h=await open(path,'wx');await h.writeFile(payload);await h.close();
process.stdout.write(JSON.stringify({path,bytes:Buffer.byteLength(payload),sha256:createHash('sha256').update(payload).digest('hex'),runs:summaries.length})+'\n');
