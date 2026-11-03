import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const dir='reports/development/plan-52-five-slot-production-transition/checkpoint-restores';await mkdir(dir,{recursive:true});
const cases=[{name:'payslip',file:'reports/development/plan-52-five-slot-production-transition/production-day1-seeded/payslip-narrow.save.json',heading:'Payslip',next:'early-evening'},
 {name:'call-scene',file:'reports/development/plan-52-five-slot-production-transition/production-day1-seeded/mom-scene-narrow.save.json',heading:'Call Mom',next:'late-evening'}];
const closure=await currentPlan52SourceClosure(),results=[],consoleErrors=[];let b,error=null;
try {
 b=await launchIsolatedChrome();b.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 for(const item of cases) {
  const bytes=await readFile(item.file),raw=bytes.toString('utf8'),before=JSON.parse(raw),validation=validateSave(before,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});if(!validation.valid)throw Error(`${item.name}: source save invalid`);
  const {browserContextId}=await b.cdp.send('Target.createBrowserContext'),{targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank',browserContextId}),{sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});
  const send=(method,params={})=>b.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(raw)})`});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
  let ready=false;for(let i=0;i<80;i++){if(await evaluate(`document.querySelector('#story47-heading')?.textContent === ${JSON.stringify(item.heading)}`)){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${item.name}: restored scene missing`);
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier});
  const restored=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')"));if(JSON.stringify(restored.eventLog)!==JSON.stringify(before.eventLog)||JSON.stringify(restored.prngStreams)!==JSON.stringify(before.prngStreams))throw Error(`${item.name}: restore changed event history or RNG`);
  const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${item.name}-restored.png`,Buffer.from(shot.data,'base64'));
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await new Promise(r=>setTimeout(r,250));const desktop=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${item.name}-restored-desktop.png`,Buffer.from(desktop.data,'base64'));
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate("document.querySelector('.life-story47 .life-day-next').click()");await new Promise(r=>setTimeout(r,400));
  const after=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')"));if(after.state.life.schedule.slot!==item.next)throw Error(`${item.name}: wrong continuation slot`);
  if(after.eventLog.filter(e=>e.type==='income'&&e.payload.kind==='wage').length!==1)throw Error(`${item.name}: wage was duplicated`);
  if(after.state.cash!==before.state.cash)throw Error(`${item.name}: continuation changed cash`);
  if(item.name==='call-scene' && after.eventLog.filter(e=>e.type==='life52_effect'&&e.payload.effect?.type==='story47_advanced'&&e.payload.effect.stage==='ack').length!==1)throw Error('call completion was not exactly once');
  if(!validateSave(after,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid)throw Error(`${item.name}: continued save invalid`);
  if(JSON.stringify(after.prngStreams)!==JSON.stringify(before.prngStreams))throw Error(`${item.name}: continuation changed RNG`);
  const nextShot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${item.name}-continued.png`,Buffer.from(nextShot.data,'base64'));
  results.push({name:item.name,fixture:item.file,fixtureSha256:sha256(bytes),beforeEvents:before.eventLog.length,afterEvents:after.eventLog.length,slot:after.state.life.schedule.slot,cash:after.state.cash,health:after.state.health,unchangedRng:true,wages:1});
  await b.cdp.send('Target.disposeBrowserContext',{browserContextId});
 }
}catch(e){error=String(e);}finally{const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(`${dir}/trace.json`,JSON.stringify({sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile('reports/development/plan-52-five-slot-production-transition/restore-day1-checkpoints.mjs')),results,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({results,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
