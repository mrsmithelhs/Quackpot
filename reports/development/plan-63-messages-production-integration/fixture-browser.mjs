import {mkdtemp,mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto'; import {spawn} from 'node:child_process'; import {tmpdir} from 'node:os'; import {join,dirname} from 'node:path';
import {launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate,waitFor} from '../../../scripts/dev/checkpoints/cdp.mjs';
const out=process.argv[2], base='reports/development/plan-63-messages-production-integration/';
const paths=[base+'fixture.html',base+'fixture.mjs','src/core/messages-content.mjs','src/core/messages-projection.mjs','src/ui/messages-view.mjs','src/ui/messages.css'];
const hash=b=>createHash('sha256').update(b).digest('hex');let server,browser,cleanup,error,stable=false;const results=[],pins={};
try {
 const snap=await mkdtemp(join(tmpdir(),'qp63-snapshot-')); for(const p of paths){const b=await readFile(p);pins[p]=hash(b);const dest=join(snap,p);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,b);}
 server=spawn('C:/Program Files/Python314/python.exe',['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',snap],{stdio:['ignore','pipe','pipe'],windowsHide:true});
 const origin=await new Promise((resolve,reject)=>{let s='';const t=setTimeout(()=>reject(Error('server timeout')),5000);server.stdout.on('data',x=>{s+=x;if(s.includes('\n')){clearTimeout(t);resolve(s.trim());}});server.once('error',reject);server.once('exit',()=>reject(Error('server exit')));});
 if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('unexpected origin');
 browser=await launchIsolatedChrome();
 for(const width of [1200,390]) {
  const page=await createPage(browser.cdp,origin+base+'fixture.html',{viewport:{width,height:800}});const sid=page.sessionId;
  await waitFor(browser.cdp,sid,"window.fixture && document.querySelector('#open')",'fixture');
  const run=async code=>evaluate(browser.cdp,sid,code); const assert=(condition,label)=>{if(!condition)throw Error(`${width}: ${label}`);};
  await run("document.querySelector('#open').click(); window.fixture.cover(true); document.querySelector('.messages-thread').click()");
  await new Promise(r=>setTimeout(r,250));assert((await run('window.fixture.reads.length'))===0,'covered read');
  await run('window.fixture.revise()'); await new Promise(r=>setTimeout(r,200));assert((await run('window.fixture.reads.length'))===0,'covered revised read');
  await run('window.fixture.cover(false)');await waitFor(browser.cdp,sid,"window.fixture.reads.includes('loan:statement:fixture@2')",'visible revised read');
  assert(!(await run("window.fixture.reads.includes('loan:statement:fixture@1')")),'stale revision read');
  await run("document.querySelector('header button').focus()"); await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'},sid);await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sid);
  assert(await run("!!document.querySelector('.messages-thread')"),'keyboard Back');
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sid);await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sid);
  assert(await run("!document.querySelector('.messages-panel') && document.activeElement.id==='open'"),'Escape and focus');
  await run("document.querySelector('#open').click(); window.fixture.destroy()");assert(await run("!document.querySelector('.messages-panel')"),'destroy');
  results.push({width,covered:true,revision:true,keyboardBack:true,escapeFocus:true,destroy:true});
  await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
 }
 const fallback=await createPage(browser.cdp,origin+base+'fixture.html',{viewport:{width:390,height:800}});const fsid=fallback.sessionId;
 await waitFor(browser.cdp,fsid,"window.fixture && document.querySelector('#open')",'fallback fixture');
 await evaluate(browser.cdp,fsid,"window.IntersectionObserver=undefined;document.querySelector('#open').click();document.querySelector('.messages-thread').click();document.querySelector('.messages-bubble').focus()");
 await waitFor(browser.cdp,fsid,"window.fixture.reads.includes('loan:statement:fixture@1')",'keyboard fallback read');
 await evaluate(browser.cdp,fsid,"document.querySelector('header button:last-child').click()");
 if(!await evaluate(browser.cdp,fsid,"!document.querySelector('.messages-panel') && document.activeElement.id==='open'"))throw Error('visible Close/focus');
 results.push({case:'no-intersection-observer',keyboardFocusRead:true,visibleCloseFocus:true});
 await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:fallback.contextId});
 for(const p of paths)if(hash(await readFile(p))!==pins[p])throw Error('source drift');stable=true;
}catch(e){error=String(e);}finally{
 if(browser)cleanup=await closeIsolatedChrome(browser);if(server && server.exitCode===null && server.signalCode===null){server.kill();await Promise.race([new Promise(r=>server.once('exit',r)),new Promise(r=>setTimeout(r,3000))]);}
 const serverExited=!!server&&(server.exitCode!==null||server.signalCode!==null);const clean=serverExited&&cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.treeTerminationConfirmed===true&&cleanup?.uncertainty===false;
 const result={pins,results,stable,error,serverExited,cleanup:cleanup ? {residual:cleanup.residual,rootExited:cleanup.rootExited,observedProcessesExited:cleanup.observedProcessesExited,inspectionFailed:cleanup.inspectionFailed,coverage:cleanup.coverage,uncertainty:cleanup.uncertainty,profileRetained:cleanup.profileRetained,treeTerminationConfirmed:cleanup.treeTerminationConfirmed,childExitCode:cleanup.childExitCode} : null,clean};await writeFile(out,JSON.stringify(result,null,2),{flag:'wx'});console.log(JSON.stringify({results,stable,error,serverExited,clean}));if(error||!stable||!clean)process.exitCode=1;
}


