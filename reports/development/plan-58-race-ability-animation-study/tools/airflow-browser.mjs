// Finite static-snapshot capture, report-local; no owner server or game storage.
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir, mkdtemp, copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
const base='reports/development/plan-58-race-ability-animation-study/', out=base+'evidence/airflow-02';
await mkdir(out,{recursive:false});
const paths=[...['index.html','boot.mjs','gallery.mjs','gallery.css','fixtures.mjs','revision-effects.mjs'].map(x=>base+'gallery/'+x),...['haiku-arc.svg','haiku-disc.svg','haiku-wedge.svg','haiku-folds.svg'].map(x=>base+'art/'+x),'src/ui/duck-rig-view.mjs','src/core/duck-rig.mjs',base+'tools/airflow-browser.mjs',base+'tools/snapshot_server.py'];
let browser,server,root,serverExit=null,error=null,cleanup=null,origin=null;const pins={},results=[],exceptions=[],navigations=[];
try{
 root=await mkdtemp(join(tmpdir(),'plan58-airflow-snapshot-'));
 for(const p of paths){const data=await readFile(p);pins[p]=createHash('sha256').update(data).digest('hex');const dest=join(root,p);await mkdir(dirname(dest),{recursive:true});await copyFile(p,dest);}
 server=spawn('C:/Program Files/Python314/python.exe',[base+'tools/snapshot_server.py',root],{stdio:['ignore','pipe','pipe'],windowsHide:true});
 const endpoint=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('server readiness timed out')),5000);server.stdout.on('data',chunk=>{output+=chunk;if(output.includes('\n')){clearTimeout(timer);resolve(output.trim());}});server.once('error',reject);server.once('exit',code=>reject(Error('server exited before readiness '+code)));});
 origin=endpoint;if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('unexpected endpoint');
 const url=origin+base+'gallery/';const response=await fetch(url,{signal:AbortSignal.timeout(5000)});if(!response.ok||!(await response.text()).includes('Ability motion study'))throw Error('snapshot body failed');
 browser=await launchIsolatedChrome();browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Page.frameNavigated'&&!m.params.frame.parentId)navigations.push(m.params.frame.url);});
 for(const [width,height] of [[1024,900],[390,844]]){
  const page=await createPage(browser.cdp,url,{viewport:{width,height}}),send=(m,p={})=>browser.cdp.send(m,p,page.sessionId),ev=e=>evaluate(browser.cdp,page.sessionId,e);
  let ready=false;for(let i=0;i<30;i++){if(await ev("document.querySelectorAll('.runner svg').length===8")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('snapshot gallery not ready');const navCount=navigations.length;
  const check=await ev(`(()=>{const a=document.querySelector('.study'),set=(k,v)=>{const e=a.querySelector('[data-'+k+']');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));};set('scene','crowd');set('time','1.2');const back=a.querySelector('.air-behind path'),front=a.querySelector('.air-front path');const start=back.getPointAtLength(0).x,end=back.getPointAtLength(back.getTotalLength()).x,offset1=Number(back.getAttribute('stroke-dashoffset'));set('time','1.7');const offset2=Number(a.querySelector('.air-behind path').getAttribute('stroke-dashoffset'));const body=a.querySelector('.body'),behind=a.querySelector('.air-effects'),infront=a.querySelector('.air-front-effects');const z=[behind,body,infront].map(e=>Number(getComputedStyle(e).zIndex));set('facing','right');const mirrored=behind.style.transform.includes('-1')&&infront.style.transform.includes('-1');set('scene','combo');set('time','2');const overlap=!!a.querySelector('.force')&&!!a.querySelector('.air-behind')&&!!a.querySelector('.air-front')&&!a.querySelector('.wave');return {headToTail:start<end,advances:offset2<offset1,separate:!!front,z,mirrored,overlap};})()`);
  if(!check.headToTail||!check.advances||!check.separate||!(check.z[0]<check.z[1]&&check.z[1]<check.z[2])||!check.mirrored||!check.overlap)throw Error('airflow state check failed '+JSON.stringify(check));
  for(const [name,index,facing] of [['race-left',1,'left'],['race-right',1,'right'],['dex-left',2,'left'],['dex-right',2,'right'],['selection-left',3,'left'],['selection-right',3,'right']]){
   await ev(`(()=>{const a=document.querySelector('.study:nth-child(${index})');for(const [k,v] of Object.entries(${JSON.stringify({scene:'crowd',time:'1.5',facing})})){const e=a.querySelector('[data-'+k+']');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}})()`);await ev('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
   const rect=await ev(`(()=>{const r=document.querySelector('.study:nth-child(${index}) .stage').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}})()`);const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...rect,scale:1}});await writeFile(`${out}/${width}-${name}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
  }
  if(exceptions.length||navigations.length!==navCount)throw Error('exception or unexpected navigation');results.push({width,height,...check});await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
 }
 for(const [p,hash] of Object.entries(pins))if(createHash('sha256').update(await readFile(p)).digest('hex')!==hash)throw Error('source drift '+p);
}catch(e){error=String(e);}finally{
 if(browser)cleanup=await closeIsolatedChrome(browser);
 if(server){if(server.exitCode===null&&server.signalCode===null){server.kill();await new Promise(resolve=>{server.once('exit',resolve);setTimeout(resolve,3000);});}serverExit={code:server.exitCode,signal:server.signalCode};}
 const browserOK=cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.coverage==='sampled-only'&&cleanup?.uncertainty===true&&cleanup?.profileRetained===true&&cleanup?.treeTerminationConfirmed===false;
 const serverObservedExited=!!server&&(server.exitCode!==null||server.signalCode!==null);const accepted=browserOK&&serverObservedExited;const receipt={disclaimer:'Synthetic presentation; no owner server or game saves.',pins,results,exceptions,navigations,error,cleanup,serverExit,serverObservedExited,snapshotRetained:true,accepted};await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2),{flag:'wx'});console.log(JSON.stringify(receipt));if(error||!accepted)process.exitCode=1;
}
