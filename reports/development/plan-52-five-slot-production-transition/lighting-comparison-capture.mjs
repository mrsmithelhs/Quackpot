import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'lighting-comparison';await mkdir(dir,{recursive:true});
const results=[],consoleErrors=[];let browser,error=null;
try{
 browser=await launchIsolatedChrome();const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'}),{sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true});
 browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.sessionId!==sessionId)return;if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 const send=(method,params={})=>browser.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:960,height:540,deviceScaleFactor:1,mobile:false});
 for(const name of ['day','candidate','evening']){
  await send('Page.navigate',{url:`http://localhost:5173/Quackpot/${base}lighting-comparison.html?capture=${name}`});let ready=false;
  for(let i=0;i<80;i++){if(await evaluate(`document.querySelector('figure.selected')?.dataset.name===${JSON.stringify(name)} && [...document.querySelectorAll('figure.selected img')].every(x=>x.complete && x.naturalWidth>0)`)){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${name}: comparison did not load`);
  const bounds=await evaluate("(()=>{const r=document.querySelector('figure.selected .scene').getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,images:document.querySelectorAll('figure.selected img').length}})()");
  if(bounds.left!==0||bounds.top!==0||bounds.width!==960||bounds.height!==540||bounds.images!==(name==='candidate'?2:1))throw Error(`${name}: unexpected scene bounds or image layers`);
  const shot=await send('Page.captureScreenshot',{format:'png'}),bytes=Buffer.from(shot.data,'base64');await writeFile(`${dir}/${name}.png`,bytes);results.push({name,sha256:sha256(bytes),bounds});
 }

}catch(e){error=String(e);}finally{const cleanup=browser?await closeIsolatedChrome(browser):null;await writeFile(dir+'/trace.json',JSON.stringify({htmlSha256:sha256(await readFile(base+'lighting-comparison.html')),candidateSha256:sha256(await readFile(base+'sonnet-kitchen-candidate.svg')),recipeSha256:sha256(await readFile(base+'lighting-comparison-capture.mjs')),results,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({results,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
