import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { launchIsolatedChrome, closeIsolatedChrome, evaluate, waitFor } from '../../../scripts/dev/checkpoints/cdp.mjs';
const dir=new URL('./auditions/',import.meta.url);const url='http://localhost:5173/Quackpot/reports/development/plan-43-apartment-music-styles-and-motif-intrusion-study/comparison.html';
const requests=[];let browser,session,context;const records=[];
try{
 await mkdir(dir,{recursive:true});browser=await launchIsolatedChrome();
 browser.cdp.socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.sessionId===session&&m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);});
 context=await browser.cdp.send('Target.createBrowserContext',{disposeOnDetach:true});const target=await browser.cdp.send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});session=(await browser.cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 await browser.cdp.send('Page.enable',{},session);await browser.cdp.send('Runtime.enable',{},session);await browser.cdp.send('Network.enable',{},session);await browser.cdp.send('Page.navigate',{url},session);
 await waitFor(browser.cdp,session,"document.querySelector('#status')?.textContent==='ready'",'comparison page ready',10000);
 for(const name of ['mallet','bass','guitar','ensemble'])for(const [label,engine] of [['A','custom'],['B','upstream']]){
  await evaluate(browser.cdp,session,`beginComparison(${JSON.stringify(name)},${JSON.stringify(engine)})`);
  await waitFor(browser.cdp,session,'window.comparisonOutcome!==null','render settlement',30000);
  const outcome=await evaluate(browser.cdp,session,'window.comparisonOutcome');if(outcome.error)throw Error(outcome.error);
  const {wav,...metadata}=outcome.value;const bytes=Buffer.from(wav,'base64');if(bytes.length>40*48000*4+44)throw Error('WAV size bound');
  const file=`${name}-${label}.wav`;await writeFile(new URL(file,dir),bytes);records.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,...metadata});
  await evaluate(browser.cdp,session,'window.comparisonOutcome=null');
 }
 const total=records.reduce((n,x)=>n+x.bytes,0);if(records.length!==8||total>=62000000)throw Error('output bound');
 if(requests.some(x=>!x.startsWith('http://localhost:5173/')))throw Error('unexpected page network request '+JSON.stringify(requests));
 await writeFile(new URL('render-manifest.json',dir),JSON.stringify({records,total,requests},null,2));console.log(JSON.stringify({records:records.map(({file,sha256,bytes,stats,info})=>({file,sha256,bytes,stats,info})),total,requests},null,2));
}catch(e){console.error(String(e.stack||e));process.exitCode=1;}
finally{if(browser){const cleanup=await closeIsolatedChrome(browser);console.log('Browser cleanup:',JSON.stringify(cleanup));if(cleanup.residual||cleanup.uncertainty)process.exitCode=1;}}
