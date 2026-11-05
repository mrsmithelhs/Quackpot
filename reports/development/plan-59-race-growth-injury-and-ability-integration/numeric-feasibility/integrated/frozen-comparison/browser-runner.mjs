import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {launchIsolatedChrome,closeIsolatedChrome,createPage,evaluate} from '../../../../../../scripts/dev/checkpoints/cdp.mjs';
import {cases} from './suite.mjs';
const base='reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/';
const out=process.argv[2];if(!out)throw Error('output required');
const pins=JSON.parse(await readFile(base+'pins.json','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
async function verify(root){for(const [path,pin] of Object.entries(pins))if(hash(await readFile(join(root,path)))!==pin)throw Error(`source drift ${path}`);}
const summary=c=>c?Object.fromEntries(['residual','rootExited','observedProcessesExited','inspectionFailed','coverage','uncertainty','profileRetained','treeTerminationConfirmed','childExitCode','profileRemoved','profileIdSha256'].filter(k=>Object.hasOwn(c,k)).map(k=>[k,c[k]])):null;
let snapshot=null,server=null,browser=null,cleanup=null,serverExit=null,error=null,version=null,sourceStable=false;const records=[],exceptions=[];
try {
  await verify('.');snapshot=await mkdtemp(join(tmpdir(),'qp59-integrated-snapshot-'));
  for(const path of Object.keys(pins)){const target=join(snapshot,path);await mkdir(dirname(target),{recursive:true});await copyFile(path,target);}
  await verify(snapshot);await writeFile(`${out}/snapshot.private.log`,JSON.stringify({snapshot}),{flag:'wx'});
  server=spawn('C:/Program Files/Python314/python.exe',['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',snapshot],{stdio:['ignore','pipe','pipe'],windowsHide:true});
  const origin=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(Error('server readiness timeout')),5000);server.stdout.on('data',chunk=>{text+=chunk;if(text.includes('\n')){clearTimeout(timer);resolve(text.trim());}});server.once('error',reject);server.once('exit',code=>reject(Error(`server exited ${code}`)));});
  if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('invalid loopback origin');
  browser=await launchIsolatedChrome();browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails?.text??'exception');});
  version=await browser.cdp.send('Browser.getVersion');const page=await createPage(browser.cdp,origin+base,{viewport:{width:800,height:600}});
  let ready=false;for(let i=0;i<50;i++){if(await evaluate(browser.cdp,page.sessionId,'Boolean(window.comparison?.cases)')){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('page readiness timeout');
  const browserCases=await evaluate(browser.cdp,page.sessionId,'window.comparison.cases');if(JSON.stringify(browserCases)!==JSON.stringify(cases))throw Error('case list mismatch');
  for(const id of cases){const reference=JSON.parse(await readFile(`${out}/node/${id.replace('/','-')}.json`,'utf8'));const start=Date.now();
    await evaluate(browser.cdp,page.sessionId,`window.beginComparison(${JSON.stringify(id)})`);
    let done=false;for(let i=0;i<100;i++){if(await evaluate(browser.cdp,page.sessionId,'window.comparison.done')){done=true;break;}await new Promise(r=>setTimeout(r,100));}if(!done)throw Error(`case timeout ${id}`);
    const result=await evaluate(browser.cdp,page.sessionId,'({result:window.comparison.result,error:window.comparison.error})');
    if(result.error||!result.result)throw Error(`browser case failure ${id}: ${JSON.stringify(result.error)}`);
    const expected=JSON.stringify({id:reference.id,envelope:reference.envelope,negative:reference.negative}),actual=JSON.stringify(result.result),a=Buffer.from(expected),b=Buffer.from(actual);
    let offset=0;while(offset<Math.min(a.length,b.length)&&a[offset]===b[offset])offset++;
    const exact=a.equals(b),firstDifference=exact?null:{offset,nodeByte:a[offset]??null,browserByte:b[offset]??null};
    const record={...result.result,elapsedMs:Date.now()-start,exact,firstDifference};
    await writeFile(`${out}/browser-${id.replace('/','-')}.json`,JSON.stringify(record),{flag:'wx'});records.push({id,exact,firstDifference,elapsedMs:record.elapsedMs});
    if(!exact)throw Error(`canonical mismatch ${id}`);
  }
  await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});await verify('.');await verify(snapshot);sourceStable=true;
}catch(e){error=String(e);}finally{
  if(browser)cleanup=await closeIsolatedChrome(browser);
  if(server){if(server.exitCode===null&&server.signalCode===null){server.kill();await Promise.race([new Promise(r=>server.once('exit',r)),new Promise(r=>setTimeout(r,3000))]);}serverExit={code:server.exitCode,signal:server.signalCode};}
  const serverObservedExited=Boolean(server)&&(server.exitCode!==null||server.signalCode!==null);
  const cleanupFullyVerified=serverObservedExited&&cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false&&cleanup?.residual===false&&cleanup?.treeTerminationConfirmed===true&&cleanup?.uncertainty===false;
  const artifactChecksPassed=!error&&sourceStable&&exceptions.length===0&&records.length===cases.length&&records.every(r=>r.exact);
  await writeFile(`${out}/browser.private.log`,JSON.stringify({snapshot,cleanup,error,exceptions,serverExit},null,2),{flag:'wx'});
  const result={nodeVersion:process.version,browserVersion:version?{product:version.product,revision:version.revision,protocolVersion:version.protocolVersion,jsVersion:version.jsVersion}:null,
    sourceStable,records,artifactChecksPassed,cleanupFullyVerified,accepted:artifactChecksPassed&&cleanupFullyVerified,cleanup:summary(cleanup),serverObservedExited,serverExit,
    exceptionCount:exceptions.length,error:error?'See ignored private diagnostic.':null};
  await writeFile(`${out}/browser-summary.json`,JSON.stringify(result,null,2),{flag:'wx'});console.log(JSON.stringify(result));if(!result.accepted)process.exitCode=1;
}
