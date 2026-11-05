// Finite source-pinned static snapshot check. Do not execute before root lane assignment.
import { launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate } from '../../../../scripts/dev/checkpoints/cdp.mjs';
import { mkdir,mkdtemp,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join,dirname } from 'node:path';

const base='reports/development/plan-60-remaining-abilities-and-progression-study/experience-gallery/';
const out=base+'evidence-03';
const files=[base+'index.html',base+'gallery.css',base+'model.mjs',base+'gallery.mjs'];
const dependencies=['scripts/dev/checkpoints/cdp.mjs','scripts/dev/checkpoints/process-tree.mjs','scripts/dev/checkpoints/process-cleanup-policy.mjs','scripts/dev/checkpoints/provenance.mjs','reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py'];
const sha=data=>createHash('sha256').update(data).digest('hex');
const pins={},checks=[];let root,server,browser,serverExit=null,cleanup=null,error=null,cleanupError=null,serverError=null;
await mkdir(out,{recursive:false});
try {
  root=await mkdtemp(join(tmpdir(),'qp60-preview-snapshot-'));
  const manifest=await readFile(base+'source-pins.txt','utf8');
  for(const line of manifest.trim().split(/\r?\n/)){const [expected,file]=line.trim().split(/\s+/,2);if(sha(await readFile(file))!==expected)throw Error(`pinned input drift ${file}`);}
  for(const file of [...files,...dependencies,base+'capture.mjs'])pins[file]=sha(await readFile(file));
  for(const file of files){const bytes=await readFile(file),destination=join(root,file);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes,{flag:'wx'});if(sha(await readFile(destination))!==pins[file])throw Error(`snapshot mismatch ${file}`);}
  server=spawn('C:/Program Files/Python314/python.exe',['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',root],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  const origin=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('server readiness timed out')),5000);server.stdout.on('data',chunk=>{output+=chunk;if(output.includes('\n')){clearTimeout(timer);resolve(output.trim());}});server.once('error',reject);server.once('exit',code=>reject(Error(`server exited before readiness ${code}`)));});
  if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('unexpected endpoint');
  const url=origin+base;const response=await fetch(url,{signal:AbortSignal.timeout(5000)});if(!response.ok||!(await response.text()).includes('Three ways to handle traffic'))throw Error('snapshot body failed');
  browser=await launchIsolatedChrome();
  for(const [width,height] of [[1024,900],[390,844]]) {
    const page=await createPage(browser.cdp,url,{viewport:{width,height}}),ev=expression=>evaluate(browser.cdp,page.sessionId,expression),send=(method,params={})=>browser.cdp.send(method,params,page.sessionId);
    let ready=false;for(let i=0;i<30;i++){if(await ev("document.querySelectorAll('.panel svg g').length===8")){ready=true;break;}await new Promise(resolve=>setTimeout(resolve,100));}if(!ready)throw Error('diagrams not ready');
    const state=await ev(`(()=>({width:innerWidth,fit:document.documentElement.scrollWidth<=innerWidth,panels:document.querySelectorAll('.panel').length,illustrative:document.body.textContent.includes('Illustrative authored motion'),paused:document.querySelector('#play').textContent==='Play',svgs:document.querySelectorAll('.panel svg g').length}))()`);
    if(state.width!==width||!state.fit||state.panels!==4||!state.illustrative||!state.paused||state.svgs!==8)throw Error(`state ${JSON.stringify(state)}`);
    await ev(`(()=>{const x=document.querySelector('#time');x.focus();x.value='49';x.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
    const keyboard=await ev(`(()=>({focused:document.activeElement===document.querySelector('#time'),value:document.querySelector('#time').value}))()`);
    if(!keyboard.focused||keyboard.value!=='50')throw Error(`keyboard ${JSON.stringify(keyboard)}`);
    await ev(`document.querySelector('#play').click()`);await new Promise(resolve=>setTimeout(resolve,250));
    const advanced=await ev(`Number(document.querySelector('#time').value)>50`);await ev(`document.querySelector('#play').click()`);
    const paused=await ev(`document.querySelector('#play').textContent==='Play'`);if(!advanced||!paused)throw Error('play/pause failed');
    for(const scene of ['contact','open']){
      await ev(`(()=>{const radio=document.querySelector('input[value=${scene}]');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));const slider=document.querySelector('#time');slider.value='55';slider.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      const condition=await ev(`document.querySelectorAll('.panel')[2].querySelector('.state').textContent`);
      if((scene==='contact')!==condition.includes('active'))throw Error('scenario state failed');
      for(const index of (width===390?[0,1,2,3]:[0,2])){
        await ev(`document.querySelectorAll('.panel')[${index}].scrollIntoView({block:'start'})`);await ev('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
        const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${out}/${width}-${scene}-panel-${index+1}.png`,Buffer.from(shot.data,'base64'),{flag:'wx'});
      }
    }
    checks.push({width,height,state,keyboard,advanced,paused,scenes:['contact','open']});await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  for(const [file,hash] of Object.entries(pins))if(sha(await readFile(file))!==hash)throw Error(`source drift ${file}`);
  if(await readFile(base+'source-pins.txt','utf8')!==manifest)throw Error('manifest drift');
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
  const receipt={scope:'Authored qualitative illustration; no resolver replay or balance evidence',pins,checks,error:error?'capture-error; see private diagnostic hash':null,cleanup:publicCleanup,serverObservedExited,snapshotRetained:true,privateDiagnosticSha256:sha(privateBytes),artifactChecksPassed,cleanupFullyVerified,accepted:artifactChecksPassed&&cleanupFullyVerified};
  await writeFile(out+'/receipt.json',JSON.stringify(receipt,null,2),{flag:'wx'});console.log(JSON.stringify(receipt));if(!receipt.accepted)process.exitCode=1;
}
