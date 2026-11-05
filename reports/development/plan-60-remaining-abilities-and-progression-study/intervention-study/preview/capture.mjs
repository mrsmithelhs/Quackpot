// Finite source-pinned static snapshot check. Do not execute before root lane assignment.
import { launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate } from '../../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir,mkdtemp,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join,dirname } from 'node:path';

const base='reports/development/plan-60-remaining-abilities-and-progression-study/intervention-study/';
const out=base+'preview-evidence-01';
const files=[base+'preview/index.html',base+'preview/preview.css',base+'preview/preview-data.mjs',base+'preview/preview.mjs',base+'screen-000-004.jsonl'];
const dependencies=['scripts/dev/checkpoints/cdp.mjs','scripts/dev/checkpoints/process-tree.mjs','scripts/dev/checkpoints/process-cleanup-policy.mjs','scripts/dev/checkpoints/provenance.mjs','reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py'];
const sha=data=>createHash('sha256').update(data).digest('hex');
const pins={},checks=[];let root,server,browser,serverExit=null,cleanup=null,error=null,cleanupError=null,serverError=null;
await mkdir(out,{recursive:false});
try {
  root=await mkdtemp(join(tmpdir(),'qp60-preview-snapshot-'));
  const manifest=await readFile(base+'preview/preview-pins.txt','utf8');
  for(const line of manifest.trim().split(/\r?\n/)){const [expected,file]=line.trim().split(/\s+/,2);if(sha(await readFile(file))!==expected)throw Error(`pinned input drift ${file}`);}
  for(const file of [...files,...dependencies,base+'preview/capture.mjs'])pins[file]=sha(await readFile(file));
  if(pins[base+'screen-000-004.jsonl']!=='26cefdc875b8cff52cee0d37c7e990d9baf54f46b9ec5b76afdb676dde5a11ab')throw Error('witness drift');
  for(const file of files){const bytes=await readFile(file),destination=join(root,file);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes,{flag:'wx'});if(sha(await readFile(destination))!==pins[file])throw Error(`snapshot mismatch ${file}`);}
  server=spawn('C:/Program Files/Python314/python.exe',['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',root],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  const origin=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('server readiness timed out')),5000);server.stdout.on('data',chunk=>{output+=chunk;if(output.includes('\n')){clearTimeout(timer);resolve(output.trim());}});server.once('error',reject);server.once('exit',code=>reject(Error(`server exited before readiness ${code}`)));});
  if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('unexpected endpoint');
  const url=origin+base+'preview/';const response=await fetch(url,{signal:AbortSignal.timeout(5000)});if(!response.ok||!(await response.text()).includes('One contact, three paths'))throw Error('snapshot body failed');
  browser=await launchIsolatedChrome();
  for(const [width,height] of [[1024,900],[390,844]]) {
    const page=await createPage(browser.cdp,url,{viewport:{width,height}}),ev=expression=>evaluate(browser.cdp,page.sessionId,expression),send=(method,params={})=>browser.cdp.send(method,params,page.sessionId);
    let ready=false;for(let i=0;i<30;i++){if(await ev("document.querySelectorAll('.panel').length===3")){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,100));}if(!ready)throw Error('preview not ready');
    const state=await ev(`(()=>{const panels=[...document.querySelectorAll('.panel')],canvases=panels.map(p=>p.querySelector('canvas'));return {width:innerWidth,fit:document.documentElement.scrollWidth<=innerWidth,panels:panels.length,contact:panels.every(p=>p.textContent.includes('processing tick 259')),activation:panels.map(p=>p.textContent.includes('Ability activation: tick 259')),noAbility:panels[0].textContent.includes('Ability activation: none'),injury:panels.every(p=>p.textContent.includes('Recorded injury for this duck: no')),canvasSizes:canvases.map(c=>[c.width,c.height]),nonempty:canvases.every(c=>{const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return x.some((v,i)=>i%4===3&&v>0)})};})()`);
    if(state.width!==width||!state.fit||state.panels!==3||!state.contact||!state.noAbility||state.activation.join(',')!=='false,true,true'||!state.injury||!state.nonempty||state.canvasSizes.some(size=>size.join(',')!=='600,400'))throw Error(`state check ${JSON.stringify(state)}`);
    await ev(`(()=>{const x=document.querySelector('input[value=contact]');x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await ev('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const zoom=await ev(`(()=>({checked:document.querySelector('input[value=contact]').checked,time:document.querySelector('#time').value,status:document.querySelector('#status').textContent}))()`);
    if(!zoom.checked||zoom.time!=='259'||!zoom.status.includes('processing tick'))throw Error(`zoom state ${JSON.stringify(zoom)}`);
    const focus=await ev(`(()=>{const slider=document.querySelector('#time');slider.focus();return document.activeElement===slider;})()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
    const keyboard=await ev(`(()=>({focused:document.activeElement===document.querySelector('#time'),value:document.querySelector('#time').value}))()`);
    if(!focus||!keyboard.focused||keyboard.value!=='260')throw Error(`keyboard range ${JSON.stringify(keyboard)}`);
    for(const tick of [259,268]) {
      await ev(`(()=>{const slider=document.querySelector('#time');slider.value='${tick}';slider.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      for(const index of (width===390?[0,1,2]:[0])) {
        await ev(`document.querySelectorAll('.panel')[${index}].scrollIntoView({block:'start'})`);
        await ev('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
        const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${out}/${width}-tick-${tick}-panel-${index+1}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
      }
    }
    checks.push({width,height,state,zoom,keyboard,ticks:[259,268]});await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  for(const [file,hash] of Object.entries(pins))if(sha(await readFile(file))!==hash)throw Error(`source drift ${file}`);
  if(await readFile(base+'preview/preview-pins.txt','utf8')!==manifest)throw Error('manifest drift');
} catch(e) { error=String(e); }
finally {
  try { if(browser)cleanup=await closeIsolatedChrome(browser); } catch(e) {cleanupError=String(e);}
  finally { try {if(server){if(server.exitCode===null&&server.signalCode===null){server.kill();await new Promise(resolve=>{server.once('exit',resolve);setTimeout(resolve,3000);});}serverExit={code:server.exitCode,signal:server.signalCode};}}catch(e){serverError=String(e);} }
  const serverObservedExited=!!server&&(server.exitCode!==null||server.signalCode!==null);
  const publicCleanup=cleanup?Object.fromEntries(['rootExited','observedProcessesExited','inspectionFailed','residual','coverage','uncertainty','profileRetained','treeTerminationConfirmed'].filter(k=>k in cleanup).map(k=>[k,cleanup[k]])):null;
  const artifactChecksPassed=!error&&checks.length===2;
  const cleanupFullyVerified=!cleanupError&&!serverError&&serverObservedExited&&cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.uncertainty===false&&cleanup?.coverage!=='sampled-only'&&cleanup?.treeTerminationConfirmed===true;
  const privateRoot=await mkdtemp(join(tmpdir(),'qp60-preview-private-'));
  const privateBytes=Buffer.from(JSON.stringify({error,cleanupError,serverError,cleanup,serverExit}));
  await writeFile(join(privateRoot,'diagnostics.json'),privateBytes,{flag:'wx'});
  const receipt={scope:'P-only sampled research path, no production race or opponent reconstruction',pins,checks,error:error?'capture-error; see private diagnostic hash':null,cleanup:publicCleanup,serverObservedExited,snapshotRetained:true,privateDiagnosticSha256:sha(privateBytes),artifactChecksPassed,cleanupFullyVerified,accepted:artifactChecksPassed&&cleanupFullyVerified};
  await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2),{flag:'wx'});console.log(JSON.stringify(receipt));if(!receipt.accepted)process.exitCode=1;
}
