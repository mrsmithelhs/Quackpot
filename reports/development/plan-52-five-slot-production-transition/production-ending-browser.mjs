import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'production-endings';await mkdir(dir,{recursive:true});
const source=base+'production-finance/day9-loan-due.save.json',sourceBytes=await readFile(source),raw=sourceBytes.toString('utf8'),initial=JSON.parse(raw);
if(!validateSave(initial,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid)throw Error('Starting checkpoint invalid');
const closure=await currentPlan52SourceClosure(),captures=[],dialogs=[],consoleErrors=[];let b,error=null;
try {
 b=await launchIsolatedChrome();
 for(const mode of ['default','uninstall']) {
  const {browserContextId}=await b.cdp.send('Target.createBrowserContext'),{targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank',browserContextId}),{sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});let cancelNext=mode==='default';
  b.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.sessionId!==sessionId)return;if(m.method==='Page.javascriptDialogOpening'){const accept=!cancelNext;cancelNext=false;dialogs.push({mode,type:m.params.type,message:m.params.message,accepted:accept});b.cdp.send('Page.handleJavaScriptDialog',{accept},sessionId).catch(e=>consoleErrors.push(String(e)));}if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
  const send=(method,params={})=>b.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=()=>new Promise(resolve=>setTimeout(resolve,300));
  const click=async selector=>{if(!await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))throw Error(`${mode}: missing ${selector}`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
  const textClick=async text=>{if(!await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>!x.disabled && x.offsetParent!==null && x.textContent.includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`))throw Error(`${mode}: missing enabled ${text}`);await wait();};
  const capture=async name=>{await wait();const rawSave=await evaluate("localStorage.getItem('quackpot_save_v1')"),e=JSON.parse(rawSave),v=validateSave(e,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});if(!v.valid)throw Error(`${name}: invalid save: ${v.errors.join('; ')}`);await writeFile(`${dir}/${name}.save.json`,rawSave);const image=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${name}.png`,Buffer.from(image.data,'base64'));const terminal=e.eventLog.filter(x=>x.type==='terminal');captures.push({name,sha256:sha256(Buffer.from(rawSave)),slot:e.state.life.schedule.slot,cash:e.state.cash,health:e.state.health,debt:e.state.debt,phase:e.state.phase,terminal,body:await evaluate('document.body.innerText')});return e;};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(raw)})`});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
  let ready=false;for(let i=0;i<80;i++){if(await evaluate("document.readyState==='complete' && document.body.innerText.includes('Payday loan: $99.00')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${mode}: due loan did not restore`);await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier});
  if(mode==='default') {
    await textClick('Leave Payday loan unpaid');let e=await capture('loan-default-cancelled');if(e.state.debt!==99||e.state.cash!==0||e.state.life.schedule.slot!=='midday'||e.state.terminalRoute)throw Error('cancelled default changed progression');
    if(!dialogs.at(-1)?.message.includes('Running on Empty ends the run'))throw Error('ending consequence was not disclosed');
    await textClick('Leave Payday loan unpaid');e=await capture('loan-default-receipt-narrow');const terminal=e.eventLog.filter(x=>x.type==='terminal');
    if(e.state.debt!==99||terminal.length!==1||terminal[0].payload.reason!=='loan_unaffordable'||terminal[0].payload.outstandingCents!==9900)throw Error('loan default lost debt, reason or once-only terminal');
    if(!captures.at(-1).body.includes('$99.00'))throw Error('Receipt does not show outstanding debt');
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await capture('loan-default-receipt-desktop');
  } else {
    await click('#btn-open-settings');await capture('settings-over-loan');await click('[data-settings-done]');
    await click('#btn-uninstall');await capture('uninstall-offer');await click('#btn-retention-leave');const e=await capture('uninstall-receipt');
    const terminal=e.eventLog.filter(x=>x.type==='terminal');if(e.state.debt!==99||terminal.length!==1||terminal[0].payload.route!=='uninstall')throw Error('uninstall did not preserve debt and end once');
  }
  await b.cdp.send('Target.disposeBrowserContext',{browserContextId});
 }
}catch(e){error=String(e);}finally{const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(`${dir}/trace.json`,JSON.stringify({source,sourceSha256:sha256(sourceBytes),sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile(base+'production-ending-browser.mjs')),captures,dialogs,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({captures:captures.map(({name,slot,cash,debt,phase,terminal})=>({name,slot,cash,debt,phase,terminal})),dialogs,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
