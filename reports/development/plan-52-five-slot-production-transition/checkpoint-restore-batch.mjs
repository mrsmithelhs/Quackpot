import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'checkpoint-restore-batch';await mkdir(dir,{recursive:true});
const ids=['fresh-tutorial','midday-work','unresolved-dinner','completed-evening','independent-day','ren-reserved','ren-arriving','rent-shortfall','rent-paid-zero','loan-due','zero-hp-recovery'];
const catalog=JSON.parse(await readFile('scripts/dev/checkpoints/catalog.json','utf8')),closure=await currentPlan52SourceClosure(),results=[],consoleErrors=[],dialogs=[];let browser,error=null;
try{
 browser=await launchIsolatedChrome();
 browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Page.javascriptDialogOpening'){dialogs.push({sessionId:m.sessionId,message:m.params.message});browser.cdp.send('Page.handleJavaScriptDialog',{accept:true},m.sessionId).catch(e=>consoleErrors.push(String(e)));}if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 for(const name of ids){
  const entry=catalog.checkpoints[`plan52.${name}.v1`];if(!entry)throw Error(`Missing ${name}`);const bytes=await readFile(entry.fixture),raw=bytes.toString('utf8'),before=JSON.parse(raw);
  if(sha256(bytes)!==entry.sha256||!validateSave(before,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid)throw Error(`${name}: invalid source fixture`);
  const {browserContextId}=await browser.cdp.send('Target.createBrowserContext'),{targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank',browserContextId}),{sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true});
  const send=(method,params={})=>browser.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;},wait=()=>new Promise(r=>setTimeout(r,200));
  const click=async selector=>{if(!await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))throw Error(`${name}: missing ${selector}`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
  const textClick=async text=>{if(!await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`))throw Error(`${name}: missing button ${text}`);await wait();};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const inject=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(raw)})`});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
  let ready=false;for(let i=0;i<80;i++){if(await evaluate("document.readyState==='complete' && !!document.querySelector('#main-content') && document.body.innerText.includes('Health:')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${name}: application did not restore`);await wait();await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:inject.identifier});
  const restored=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')"));if(JSON.stringify(restored.eventLog.slice(0,before.eventLog.length))!==JSON.stringify(before.eventLog)||JSON.stringify(restored.prngStreams)!==JSON.stringify(before.prngStreams))throw Error(`${name}: restore changed prior history or RNG`);
  const screenshot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${name}.png`,Buffer.from(screenshot.data,'base64'));
  const meal=async(skip=false)=>{if(!await evaluate("!!document.querySelector('[data-obj=plate]')"))await textClick('The kitchen');await click('[data-obj=plate]');await click(skip?'[data-act=decline]':'[data-act=confirm]');await click('[data-act=done]');};
  switch(name){
   case 'fresh-tutorial':case 'unresolved-dinner':await meal();break;
   case 'independent-day':await meal(true);break;
   case 'midday-work':await textClick('Complete shift');break;
   case 'completed-evening':await textClick('Go to sleep');break;
   case 'rent-shortfall':await textClick('See loan terms');break;
   case 'rent-paid-zero':await meal(true);break;
   case 'loan-due':await textClick('Inspect furniture in the living room');await click('[data-obj=couch-sale]');await click('[data-act=confirm]');await click('[data-act=done]');break;
   case 'ren-reserved':case 'ren-arriving':
    if(!await evaluate("document.body.innerText.includes('Welcome Ren in')")){await textClick('The door');if(await evaluate("!!document.querySelector('.ren46-door-knock')"))await click('.ren46-door-knock');if(await evaluate("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Open the door'))"))await textClick('Open the door');}
    await textClick('Welcome Ren in');break;
   case 'zero-hp-recovery':await click('[data-obj=bed]');await click('[data-act=confirm]');await click('[data-act=done]');break;
  }
  const after=JSON.parse(await evaluate("localStorage.getItem('quackpot_save_v1')"));if(!validateSave(after,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid)throw Error(`${name}: continuation invalid`);
  if(JSON.stringify(after.prngStreams)!==JSON.stringify(before.prngStreams))throw Error(`${name}: continuation unexpectedly changed RNG`);
  const s=after.state,oldWages=before.eventLog.filter(e=>e.type==='income'&&e.payload.kind==='wage').length,newWages=after.eventLog.filter(e=>e.type==='income'&&e.payload.kind==='wage').length;
  const expected={ 'fresh-tutorial':()=>s.life.schedule.slot==='midday','midday-work':()=>s.life.story47?.stage==='payslip'&&newWages===oldWages+1,'unresolved-dinner':()=>s.life.schedule.slot==='evening','completed-evening':()=>s.life.schedule.day===2&&s.life.schedule.slot==='morning','independent-day':()=>s.life.schedule.slot==='midday','rent-shortfall':()=>s.debt===99&&s.cash===170,'rent-paid-zero':()=>s.life.schedule.slot==='midday'&&s.debt===99,'loan-due':()=>s.cash===30&&s.debt===99,'ren-reserved':()=>s.life.social46.scene?.stage==='scene','ren-arriving':()=>s.life.social46.scene?.stage==='scene','zero-hp-recovery':()=>s.health===25&&s.life.schedule.slot==='late-evening'&&!s.life.schedule.recovery }[name];
  if(!expected()||(name!=='midday-work'&&newWages!==oldWages))throw Error(`${name}: continuation boundary or wage count incorrect`);
  results.push({name,fixture:entry.fixture,fixtureSha256:sha256(bytes),restoredEvents:restored.eventLog.length,afterEvents:after.eventLog.length,day:s.life.schedule.day,slot:s.life.schedule.slot,cash:s.cash,health:s.health,unchangedRng:true,continuationVerified:true});
  await browser.cdp.send('Target.disposeBrowserContext',{browserContextId});
 }
}catch(e){error=String(e);}finally{const cleanup=browser?await closeIsolatedChrome(browser):null;await writeFile(dir+'/trace.json',JSON.stringify({sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile(base+'checkpoint-restore-batch.mjs')),results,dialogs,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({results,dialogs,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
