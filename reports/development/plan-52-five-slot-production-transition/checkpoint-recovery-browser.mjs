import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'checkpoint-recovery';await mkdir(dir,{recursive:true});
const source=base+'production-finance-final/day4-rent-shortfall.save.json',bytes=await readFile(source),raw=bytes.toString('utf8');
const closure=await currentPlan52SourceClosure(),dialogs=[],consoleErrors=[],captures=[];let b,error=null;
try {
 b=await launchIsolatedChrome();const {targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank'}),{sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});
 b.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.sessionId!==sessionId)return;if(m.method==='Page.javascriptDialogOpening'){dialogs.push(m.params.message);b.cdp.send('Page.handleJavaScriptDialog',{accept:true},sessionId).catch(e=>consoleErrors.push(String(e)));}if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 const send=(method,params={})=>b.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=()=>new Promise(r=>setTimeout(r,200));
 const click=async selector=>{if(!await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))throw Error(`Missing ${selector}`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
 const textClick=async text=>{if(!await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`))throw Error(`Missing button ${text}`);await wait();};
 const save=async name=>{await wait();const value=await evaluate("localStorage.getItem('quackpot_save_v1')"),e=JSON.parse(value),v=validateSave(e,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});if(!v.valid)throw Error(`${name}: ${v.errors.join('; ')}`);await writeFile(`${dir}/${name}.save.json`,value);const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${name}.png`,Buffer.from(shot.data,'base64'));captures.push({name,sha256:sha256(Buffer.from(value)),day:e.state.life.schedule.day,slot:e.state.life.schedule.slot,health:e.state.health,cash:e.state.cash,body:await evaluate('document.body.innerText')});return e;};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(raw)})`});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
 let ready=false;for(let i=0;i<80;i++){if(await evaluate("document.body.innerText.includes('Inspect furniture in the living room')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Rent decision did not restore');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier});
 await textClick('Inspect furniture in the living room');
 for(const asset of ['couch','tv']){await click(`[data-obj=${asset}-sale]`);await click('[data-act=confirm]');await click('[data-act=done]');}
 await textClick('The kitchen');await click('[data-obj=notice]');await textClick('Pay Remaining rent');
 for(let day=4;day<=13;day++){
   await click('[data-obj=plate]');await click('[data-act=decline]');await click('[data-act=done]');
   let state=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')")).state;if(state.life.schedule.recovery)break;
   await textClick('Spend time quietly');await click('[data-obj=plate]');await click('[data-act=decline]');await click('[data-act=done]');
   state=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')")).state;if(state.life.schedule.recovery)break;
   await textClick('Spend time quietly');await textClick('Go to sleep');
 }
 const result=await save('zero-hp-recovery');if(result.state.health!==0||!result.state.life.schedule.recovery||result.state.life.finance.rents[0].status!=='paid')throw Error('Did not reach genuine zero-HP recovery after settled first rent');
}catch(e){error=String(e);}finally{const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(dir+'/trace.json',JSON.stringify({source,sourceSha256:sha256(bytes),sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile(base+'checkpoint-recovery-browser.mjs')),captures,dialogs,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({captures:captures.map(({name,day,slot,health,cash})=>({name,day,slot,health,cash})),dialogs,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
