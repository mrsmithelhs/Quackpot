import {createPilot,restorePilot,availableActions,dispatch,snapshot} from './plan-67-actions.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
const dir='reports/development/plan-67-headless-playthrough-and-reachability-pilot/scan';mkdirSync(dir,{recursive:true});
const seeds=['plan67-pilot-001','plan67-pilot-002','plan67-pilot-003'];
const started=Date.now(), deadline=60000, capStates=2000, capEdges=10000, maxDepth=120,maxDay=15;
let expanded=0,edges=0,abort=null,counts={},witness={},queue=[];
for(const seed of seeds){const c=createPilot(seed);queue.push({seed,envelope:c.engine.toEnvelope(),prompt:null,sequence:0,path:[]});}
let cursor=0;
while(cursor<queue.length){
 if(Date.now()-started>=deadline){abort='wall-time safety abort';break;}
 if(expanded>=capStates){abort='state work budget exhausted';break;}
 const node=queue[cursor++],c=restorePilot(node.envelope,node.prompt,node.sequence),s=snapshot(c);expanded++;
 if(c.engine.isTerminal()){counts.terminal=(counts.terminal??0)+1;continue;}
 if(node.path.length>=maxDepth||s.day>=maxDay){counts.horizon=(counts.horizon??0)+1;continue;}
 let acts=availableActions(c).filter(a=>{
   const story=c.engine.state.life.story47;
   if(a.startsWith('show-')&&story)return !c.engine.log.entries.some(e=>e.type==='story47_shown'&&e.payload.id===story.id&&e.payload.stage===story.stage);
   if(a==='due-show')return !c.engine.fiveSlotDueOptionsWereShown();
   return true;
 }).sort();
 if(!acts.length){counts.deadEnd=(counts.deadEnd??0)+1;continue;}
 for(const action of acts){
  if(edges>=capEdges){abort='edge work budget exhausted';break;}
  if(Date.now()-started>=deadline){abort='wall-time safety abort';break;}
  const x=restorePilot(node.envelope,node.prompt,node.sequence),row=dispatch(x,action);edges++;
  const pair=`${s.slot}/${s.story??s.active??(s.due.length?'due':'idle')}/${action}/${row.ok?'ok':row.reason}`;
  if(!witness[pair])witness[pair]={seed:node.seed,path:[...node.path,action],before:row.before,after:row.after};
  if(!row.ok){counts.rejected=(counts.rejected??0)+1;continue;}
  queue.push({seed:node.seed,envelope:x.engine.toEnvelope(),prompt:x.prompt,sequence:x.sequence,path:[...node.path,action]});
 }
 if(abort)break;
}
const result={seeds,budgets:{maxDay,maxDepth,capStates,capEdges,wallMs:deadline},expanded,edges,queued:queue.length,remaining:queue.length-cursor,stop:abort??'queue exhausted',elapsedMs:Date.now()-started,counts,witness,limitations:['No grouping; repeated paths retained.','Only the pilot action subset; modeled browser availability is not observed UI.','No witness within bounds is not unreachability.','Presentation events are simulated.']};
writeFileSync(`${dir}/scan.json`,JSON.stringify(result,null,2));process.stdout.write(JSON.stringify({...result,witnessCount:Object.keys(witness).length,witness:undefined})+'\n');
