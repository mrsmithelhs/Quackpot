import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'receipt-summary-repair';await mkdir(dir,{recursive:true});
const source=base+'production-endings/loan-default-receipt-narrow.save.json',bytes=await readFile(source),raw=bytes.toString('utf8'),original=JSON.parse(raw);
if(!validateSave(original,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid)throw Error('Starting Receipt save invalid');
const closure=await currentPlan52SourceClosure(),captures=[],consoleErrors=[];let b,error=null;
try {
 b=await launchIsolatedChrome();const {targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank'}),{sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});
 b.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.sessionId!==sessionId)return;if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 const send=(method,params={})=>b.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');const injected=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(raw)})`});
 await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});let ready=false;for(let i=0;i<80;i++){if(await evaluate("document.readyState==='complete' && !!document.querySelector('#receipt-paper')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Receipt did not restore');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.identifier});
 for(const [name,width,height,mobile] of [['narrow',390,844,true],['desktop',1280,720,false]]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});await new Promise(r=>setTimeout(r,300));
  const summary=await evaluate("[...document.querySelectorAll('.receipt-totals > div')].map(x=>({label:x.querySelector('span')?.textContent,value:x.querySelector('strong')?.textContent}))"),body=await evaluate("document.querySelector('#receipt-paper').innerText");
  const expected={Cash:'$0.00',Health:'70 HP',Debt:'$99.00','Digital ducks':'0',Down:'0'};
  if(summary.length!==5 || summary.some(x=>expected[x.label]!==x.value) || !body.includes('Running on empty'))throw Error(`${name}: Receipt summary or ending differs`);
  const image=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${name}.png`,Buffer.from(image.data,'base64'));captures.push({name,summary,ending:'Running on empty'});
 }
 const after=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')"));if(after.eventLog.filter(e=>e.type==='terminal').length!==1||after.state.debt!==99)throw Error('Receipt restore changed terminal or debt');
}catch(e){error=String(e);}finally{const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(`${dir}/trace.json`,JSON.stringify({source,sourceSha256:sha256(bytes),sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile(base+'restore-receipt-repair.mjs')),captures,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({captures,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
