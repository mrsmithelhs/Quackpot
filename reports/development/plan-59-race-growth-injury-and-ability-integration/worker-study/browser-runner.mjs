import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate} from '../../../../scripts/dev/checkpoints/cdp.mjs';
const root='reports/development/plan-59-race-growth-injury-and-ability-integration/worker-study/',out=process.argv[2];if(!out)throw Error('output required');
const source='src/core/race-v2/', paths=[...['index.html','probe.mjs','browser-runner.mjs'].map(x=>root+x),
  ...['worker-client.mjs','race-worker.mjs','persistence.mjs','fixtures.mjs','integer-kernel.mjs','course.mjs','contact.mjs','abilities.mjs','codec.mjs','sha256.mjs','reference-policy.mjs','integer-math.mjs','course-probe.mjs'].map(x=>source+x),
  'src/core/prng.mjs','reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-mixed.json',
  'reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',...['cdp.mjs','process-tree.mjs','process-tree.ps1','process-tree-graph.ps1','process-cleanup-policy.mjs','provenance.mjs'].map(x=>'scripts/dev/checkpoints/'+x)];
const hash=b=>createHash('sha256').update(b).digest('hex'),pins={};let snapshot=null,server=null,browser=null,cleanup=null,error=null,version=null,serverExit=null,stable=false;
const results=[],exceptions=[];
const summary=c=>c?Object.fromEntries(['residual','rootExited','observedProcessesExited','inspectionFailed','coverage','uncertainty','profileRetained','treeTerminationConfirmed','childExitCode','profileRemoved','profileIdSha256'].filter(k=>Object.hasOwn(c,k)).map(k=>[k,c[k]])):null;
async function verify(dir){for(const [path,pin] of Object.entries(pins))if(hash(await readFile(join(dir,path)))!==pin)throw Error(`source drift ${path}`);}
try{
  for(const path of paths)pins[path]=hash(await readFile(path));await writeFile(`${out}/source-pins.json`,JSON.stringify(pins,null,2),{flag:'wx'});
  snapshot=await mkdtemp(join(tmpdir(),'qp59-worker-snapshot-'));for(const path of paths){const dest=join(snapshot,path);await mkdir(dirname(dest),{recursive:true});await copyFile(path,dest);}await verify('.');await verify(snapshot);
  await writeFile(`${out}/snapshot.private.log`,JSON.stringify({snapshot}),{flag:'wx'});
  server=spawn('C:/Program Files/Python314/python.exe',['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',snapshot],{stdio:['ignore','pipe','pipe'],windowsHide:true});
  const origin=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(Error('server timeout')),5000);server.stdout.on('data',chunk=>{text+=chunk;if(text.includes('\n')){clearTimeout(timer);resolve(text.trim());}});server.once('error',reject);server.once('exit',code=>reject(Error(`server exited ${code}`)));});
  if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('invalid origin');
  browser=await launchIsolatedChrome();browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails?.text??'exception');});version=await browser.cdp.send('Browser.getVersion');
  for(const viewport of [{width:1024,height:768},{width:390,height:844}]){
    const page=await createPage(browser.cdp,origin+root,{viewport});let ready=false;
    for(let i=0;i<50;i++){if(await evaluate(browser.cdp,page.sessionId,'typeof window.beginStudy === "function"')){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('fixture readiness');
    await evaluate(browser.cdp,page.sessionId,'window.beginStudy()');let done=false;
    for(let i=0;i<450;i++){if(await evaluate(browser.cdp,page.sessionId,'window.study.done')){done=true;break;}await new Promise(r=>setTimeout(r,100));}if(!done)throw Error('fixture timeout');
    const result=await evaluate(browser.cdp,page.sessionId,'window.study');if(result.error||!result.result)throw Error(`fixture failed ${JSON.stringify(result.error)}`);
    results.push(result.result);await writeFile(`${out}/viewport-${viewport.width}.json`,JSON.stringify(result.result,null,2),{flag:'wx'});
    await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
  }
  await verify('.');await verify(snapshot);stable=true;
}catch(e){error=String(e);}finally{
  if(browser)cleanup=await closeIsolatedChrome(browser);
  if(server){if(server.exitCode===null&&server.signalCode===null){server.kill();await Promise.race([new Promise(r=>server.once('exit',r)),new Promise(r=>setTimeout(r,3000))]);}serverExit={code:server.exitCode,signal:server.signalCode};}
  const serverObservedExited=Boolean(server)&&(server.exitCode!==null||server.signalCode!==null);
  const cleanupFullyVerified=serverObservedExited&&cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.treeTerminationConfirmed===true&&cleanup?.uncertainty===false;
  const artifactChecksPassed=!error&&stable&&exceptions.length===0&&results.length===2;
  await writeFile(`${out}/browser.private.log`,JSON.stringify({snapshot,cleanup,error,exceptions,serverExit},null,2),{flag:'wx'});
  const result={nodeVersion:process.version,browserVersion:version?{product:version.product,jsVersion:version.jsVersion}:null,sourceStable:stable,results,
    artifactChecksPassed,cleanupFullyVerified,accepted:artifactChecksPassed&&cleanupFullyVerified,cleanup:summary(cleanup),serverObservedExited,serverExit,exceptionCount:exceptions.length,error:error?'See ignored private diagnostic.':null};
  await writeFile(`${out}/browser-summary.json`,JSON.stringify(result,null,2),{flag:'wx'});console.log(JSON.stringify(result));if(!result.accepted)process.exitCode=1;
}
