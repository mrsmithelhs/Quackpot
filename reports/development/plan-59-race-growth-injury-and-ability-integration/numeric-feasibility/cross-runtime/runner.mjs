// Report-local fixed probe orchestrator. Run `node` then `browser` serially.
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchIsolatedChrome, closeIsolatedChrome, createPage, evaluate } from '../../../../../scripts/dev/checkpoints/cdp.mjs';

const base='reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/';
const unit=base+'cross-runtime/', out=unit+'results-01/';
const expected = {
  [base+'protocol.md']:'46ede629fb82550fe5d1eeb977ee9698179156f80aea68bff29a0d556b6e86ce',
  [base+'generate-reference.py']:'b74bd800a4dd30a966b9c5d7497e36b3130d49d937cc36e30ee0a61e7eef4b7b',
  [base+'reference-v1.json']:'81c4d1ba542c28506eb8932f5fb81441c4e554cce2dc489139b9ea2891c3d73c',
  [base+'integer-math.mjs']:'b18eee49d039f68565bea7f6ce7815ad736b5ccbd0e17ef4a3689f56b5f76f9e',
  [base+'decision-probe.mjs']:'7b479c72cc28c3a76042a467f4d0a9552900868a6fee51ff77e43ab4c8740b62',
  [base+'course-probe.mjs']:'f05fd331bd6f9ef23e251dc5e154a6cbc31443ae0d009af863cefd9684489970',
  [base+'canonical-probe.mjs']:'03a80518a27d5d19fc2a716de0c6160cad15772d8777a3a5e2a8290755ad6854',
  [base+'integer-math.test.mjs']:'6d8620930ca4fc101f9484b53858c85350ede97d3912788db85144e35d00631b',
  'src/core/prng.mjs':'7392e6c25ca356fbf253d9dfccd1562052577b2bfaca23720431b123364389a7',
};
const paths=[...Object.keys(expected),unit+'runner.mjs',unit+'probe-runner.mjs',unit+'index.html',
  'reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',
  ...['cdp.mjs','process-tree.mjs','process-tree.ps1','process-tree-graph.ps1','process-cleanup-policy.mjs','provenance.mjs'].map((x)=>'scripts/dev/checkpoints/'+x)];
const hash=(value)=>createHash('sha256').update(value).digest('hex');
async function verify(root,pins) {
  for (const [path,pin] of Object.entries(pins)) if (hash(await readFile(join(root,path))) !== pin) throw Error(`source drift: ${path}`);
}
function difference(a,b,path='$') {
  if (typeof a !== typeof b || a === null || b === null) return Object.is(a,b) ? null : {path,node:a,browser:b};
  if (typeof a !== 'object') return Object.is(a,b) ? null : {path,node:a,browser:b};
  const ak=Object.keys(a),bk=Object.keys(b);
  if (JSON.stringify(ak)!==JSON.stringify(bk)) return {path,kind:'key-order-or-shape',node:ak,browser:bk};
  for(const key of ak){const result=difference(a[key],b[key],`${path}.${key}`);if(result)return result;}
  return null;
}
function cleanupSummary(cleanup) {
  if (!cleanup) return null;
  const keys=['residual','rootExited','observedProcessesExited','inspectionFailed','coverage','uncertainty','profileRetained','treeTerminationConfirmed','childExitCode','profileRemoved','profileIdSha256'];
  return {...Object.fromEntries(keys.filter((k)=>Object.hasOwn(cleanup,k)).map((k)=>[k,cleanup[k]])),
    trackedDescendantCount:cleanup.trackedDescendants?.length ?? null,remainingDescendantCount:cleanup.remainingDescendants?.length ?? null};
}

if (process.argv[2] === 'node') {
  await mkdir(out,{recursive:false});
  const snapshot=await mkdtemp(join(tmpdir(),'plan59-numeric-snapshot-')), pins={};
  for(const path of paths){const data=await readFile(path), digest=hash(data); if(expected[path] && expected[path]!==digest) throw Error(`frozen pin mismatch: ${path}`);
    pins[path]=digest; const target=join(snapshot,path); await mkdir(dirname(target),{recursive:true}); await copyFile(path,target);}
  await verify('.',pins); await verify(snapshot,pins);
  await writeFile(out+'snapshot.private.log',JSON.stringify({snapshot}),{flag:'wx'});
  const data=JSON.parse(await readFile(join(snapshot,base+'reference-v1.json'),'utf8'));
  const {runFixedProbes}=await import(pathToFileURL(join(snapshot,unit+'probe-runner.mjs')).href);
  const canonical=JSON.stringify(runFixedProbes(data)), bytes=Buffer.from(canonical,'utf8');
  await verify('.',pins); await verify(snapshot,pins);
  const result={schema:'plan59.cross-runtime-node/v1',nodeVersion:process.version,pins,canonical,canonicalSha256:hash(bytes),bytes:bytes.length,
    recordCount:JSON.parse(canonical).records.length,snapshotRetained:true};
  await writeFile(out+'node-result.json',JSON.stringify(result,null,2),{flag:'wx'});
  console.log(JSON.stringify({nodeVersion:result.nodeVersion,canonicalSha256:result.canonicalSha256,bytes:result.bytes,recordCount:result.recordCount}));
} else if (process.argv[2] === 'browser') {
  const node=JSON.parse(await readFile(out+'node-result.json','utf8'));
  const {snapshot}=JSON.parse(await readFile(out+'snapshot.private.log','utf8'));
  let browser,server,serverExit=null,cleanup=null,error=null,browserVersion=null,canonical=null,firstDifference=null,exactBytes=false,sourceStable=false;
  const exceptions=[];
  try {
    await verify('.',node.pins); await verify(snapshot,node.pins);
    server=spawn('C:/Program Files/Python314/python.exe',['reports/development/plan-58-race-ability-animation-study/tools/snapshot_server.py',snapshot],{stdio:['ignore','pipe','pipe'],windowsHide:true});
    const origin=await new Promise((resolveOrigin,reject)=>{let output='';const timer=setTimeout(()=>reject(Error('server readiness timeout')),5000);
      server.stdout.on('data',(chunk)=>{output+=chunk;if(output.includes('\n')){clearTimeout(timer);resolveOrigin(output.trim());}});
      server.once('error',reject);server.once('exit',(code)=>reject(Error(`server exited before readiness ${code}`)));});
    if(!/^http:\/\/127\.0\.0\.1:\d+\/Quackpot\/$/.test(origin))throw Error('unexpected loopback endpoint');
    const url=origin+unit; const response=await fetch(url,{signal:AbortSignal.timeout(5000)});
    if(!response.ok || !(await response.text()).includes('fixed numeric probes'))throw Error('snapshot body failed');
    browser=await launchIsolatedChrome();
    browser.cdp.socket.addEventListener('message',(event)=>{const message=JSON.parse(String(event.data));if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails?.text??'exception');});
    browserVersion=await browser.cdp.send('Browser.getVersion');
    const page=await createPage(browser.cdp,url,{viewport:{width:800,height:600}});
    let ready=false; for(let i=0;i<30;i++){if(await evaluate(browser.cdp,page.sessionId,"typeof window.runNumericProbes === 'function'")){ready=true;break;}await new Promise((r)=>setTimeout(r,100));}
    if(!ready)throw Error('probe page readiness timeout');
    canonical=await evaluate(browser.cdp,page.sessionId,'window.runNumericProbes()');
    if(typeof canonical!=='string')throw Error('non-string canonical stream');
    firstDifference=difference(JSON.parse(node.canonical),JSON.parse(canonical));
    exactBytes=Buffer.from(node.canonical,'utf8').equals(Buffer.from(canonical,'utf8'));
    if(!exactBytes&&!firstDifference){const a=Buffer.from(node.canonical,'utf8'),b=Buffer.from(canonical,'utf8');let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;firstDifference={path:'$canonical-bytes',offset:i,nodeByte:a[i]??null,browserByte:b[i]??null};}
    await browser.cdp.send('Target.disposeBrowserContext',{browserContextId:page.contextId});
    await verify('.',node.pins); await verify(snapshot,node.pins); sourceStable=true;
  } catch(e){error=String(e);} finally {
    if(browser)cleanup=await closeIsolatedChrome(browser);
    if(server){if(server.exitCode===null&&server.signalCode===null){server.kill();await new Promise((done)=>{server.once('exit',done);setTimeout(done,3000);});}serverExit={code:server.exitCode,signal:server.signalCode};}
    const serverObservedExited=Boolean(server)&&(server.exitCode!==null||server.signalCode!==null);
    const cleanupFullyVerified=serverObservedExited&&cleanup?.rootExited===true&&cleanup?.observedProcessesExited===true&&cleanup?.inspectionFailed===false
      &&cleanup?.residual===false&&cleanup?.treeTerminationConfirmed===true&&cleanup?.uncertainty===false;
    const artifactChecksPassed=!error&&exceptions.length===0&&sourceStable&&exactBytes&&firstDifference===null;
    const raw={error,exceptions,browserVersion,cleanup,serverExit,snapshot};
    await writeFile(out+'browser.private.log',JSON.stringify(raw,null,2),{flag:'wx'});
    const result={schema:'plan59.cross-runtime-browser/v1',nodeVersion:node.nodeVersion,
      browserVersion:browserVersion ? {product:browserVersion.product,revision:browserVersion.revision,protocolVersion:browserVersion.protocolVersion,jsVersion:browserVersion.jsVersion} : null,
      pins:node.pins,sourceStable,recordCount:canonical?JSON.parse(canonical).records.length:null,canonical,
      canonicalSha256:canonical?hash(Buffer.from(canonical,'utf8')):null,bytes:canonical?Buffer.byteLength(canonical,'utf8'):null,
      exactBytes,firstDifference,artifactChecksPassed,cleanupFullyVerified,accepted:artifactChecksPassed&&cleanupFullyVerified,
      error:error?'Browser probe failed; see ignored local diagnostic.':null,exceptionCount:exceptions.length,
      cleanup:cleanupSummary(cleanup),serverExit,serverObservedExited,snapshotRetained:true};
    await writeFile(out+'browser-result.json',JSON.stringify(result,null,2),{flag:'wx'});
    console.log(JSON.stringify({artifactChecksPassed,cleanupFullyVerified,accepted:result.accepted,exactBytes,firstDifference,
      nodeVersion:result.nodeVersion,browserVersion:result.browserVersion,recordCount:result.recordCount,canonicalSha256:result.canonicalSha256,
      cleanup:result.cleanup,serverObservedExited,error:result.error}));
    if(!result.accepted)process.exitCode=1;
  }
} else throw Error('expected node or browser mode');
