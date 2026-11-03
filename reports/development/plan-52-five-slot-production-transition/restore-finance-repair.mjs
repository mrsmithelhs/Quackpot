import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const dir='reports/development/plan-52-five-slot-production-transition/finance-notice-repair';await mkdir(dir,{recursive:true});
const cases=[{name:'rent-shortfall',file:'production-finance/day4-rent-shortfall.save.json'},
 {name:'paid-zero',file:'production-finance/day4-rent-paid.save.json'}];
const base='reports/development/plan-52-five-slot-production-transition/',closure=await currentPlan52SourceClosure(),captures=[],dialogs=[],consoleErrors=[];let b,error=null;
try {
 b=await launchIsolatedChrome();
 for(const item of cases) {
  const bytes=await readFile(base+item.file),raw=bytes.toString('utf8'),original=JSON.parse(raw),valid=validateSave(original,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});if(!valid.valid)throw Error(`${item.name}: invalid starting save`);
  const {browserContextId}=await b.cdp.send('Target.createBrowserContext'),{targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank',browserContextId}),{sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});
  b.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.sessionId!==sessionId)return;if(m.method==='Page.javascriptDialogOpening'){dialogs.push({case:item.name,type:m.params.type,message:m.params.message});b.cdp.send('Page.handleJavaScriptDialog',{accept:true},sessionId).catch(e=>consoleErrors.push(String(e)));}if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
  const send=(method,params={})=>b.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=()=>new Promise(resolve=>setTimeout(resolve,250));
  const click=async selector=>{if(!await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))throw Error(`${item.name}: missing ${selector}`);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
  const textClick=async text=>{if(!await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>!x.disabled && x.textContent.includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`))throw Error(`${item.name}: missing enabled ${text}`);await wait();};
  const capture=async name=>{await wait();const rawSave=await evaluate("localStorage.getItem('quackpot_save_v1')"),saved=JSON.parse(rawSave),validation=validateSave(saved,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});if(!validation.valid)throw Error(`${name}: invalid save: ${validation.errors.join('; ')}`);await writeFile(`${dir}/${name}.save.json`,rawSave);const body=await evaluate('document.body.innerText'),focus=await evaluate("(()=>{const a=document.activeElement,r=a.getBoundingClientRect();return {text:a.textContent,top:r.top,bottom:r.bottom,height:innerHeight}})()");const png=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${name}.png`,Buffer.from(png.data,'base64'));captures.push({name,sha256:sha256(Buffer.from(rawSave)),body,focus,day:saved.state.life.schedule.day,slot:saved.state.life.schedule.slot,cash:saved.state.cash,debt:saved.state.debt,terminal:saved.state.terminalRoute,bills:saved.state.life.finance.rents,loans:saved.state.life.finance.loans});return saved;};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const injected=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(raw)})`});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
  let ready=false;for(let i=0;i<80;i++){if(await evaluate("document.readyState==='complete' && !!document.querySelector('.life-view')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${item.name}: restored app missing`);await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.identifier});await wait();
  if(item.name==='paid-zero') {
    await textClick('The desk');await click('[data-obj=phone]');const snapshot=await capture('paid-zero-statement-narrow');
    if(snapshot.state.cash!==0 || snapshot.state.debt!==99 || !captures.at(-1).body.includes('Payday loan statement'))throw Error('early loan statement missing');
    if(!await evaluate("document.querySelector('.life-phone-body')?.innerText.includes('$99.00')"))throw Error('phone statement amount missing');
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await capture('paid-zero-statement-desktop');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    if(await evaluate("[...document.querySelectorAll('.life-day-actions button')].some(b=>b.textContent.includes('Repay loan'))"))throw Error('detached early repay action remains');
    const beforeSchedule=JSON.stringify(snapshot.state.life.schedule);await textClick('Open Quackpot');const opened=await capture('paid-zero-browse');
    if(opened.state.step!=='life_phone' || JSON.stringify(opened.state.life.schedule)!==beforeSchedule)throw Error('early loan statement blocked free app access or consumed time');
  } else {
    let saved=await capture(`${item.name}-due-narrow`),info=captures.at(-1);
    if(!info.body.includes('Payment due') || info.focus.top<0 || info.focus.bottom>info.focus.height)throw Error(`${item.name}: due heading not focused in viewport`);
    if(item.name==='rent-shortfall' && !await evaluate("(()=>{const t=document.querySelector('.life-letter')?.innerText??'';return t.includes('Most of the rent')&&t.includes('three')&&t.includes('TODAY!')})()"))throw Error('accepted printed rent notice or countdown missing');
    if(item.name==='loan-due' && (info.body.includes('Rent paid') || !info.body.includes('Payday loan: $99.00')))throw Error('loan due is obscured by stale rent status');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    if(!await evaluate("document.activeElement?.tagName==='BUTTON' && !!document.activeElement.closest('.life-payment-held') && !document.activeElement.disabled"))throw Error(`${item.name}: payment actions are not keyboard reachable`);
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await capture(`${item.name}-due-desktop`);await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    if(item.name==='rent-shortfall') {
      await textClick('See loan terms');saved=await capture('rent-loan-accepted');if(saved.state.cash!==170||saved.state.debt!==99||saved.state.life.finance.rents[0].status!=='pending')throw Error('loan acceptance silently paid rent');
      await textClick('Pay Remaining rent');saved=await capture('rent-paid-zero');if(saved.state.cash!==0||saved.state.debt!==99||saved.state.terminalRoute||saved.state.life.finance.rents[0].status!=='paid')throw Error('explicit zero-cash rent payment failed');
    } else {
      await textClick('Put it down');await textClick('The living room');await click('[data-obj=couch-sale]');await click('[data-act=confirm]');await click('[data-act=done]');saved=await capture('loan-after-couch-sale');
      if(saved.state.cash!==30||saved.state.debt!==99||saved.state.life.finance.loans[0].status!=='pending')throw Error('sale changed or cleared due loan');
      await textClick('The desk');await click('[data-obj=phone]');await capture('loan-reopened');if(!captures.at(-1).body.includes('Payday loan: $99.00'))throw Error('pending loan not available on phone');
    }
  }
  await b.cdp.send('Target.disposeBrowserContext',{browserContextId});
 }
}catch(e){error=String(e);}finally{const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(`${dir}/trace.json`,JSON.stringify({sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile(base+'restore-finance-repair.mjs')),captures,dialogs,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({captures:captures.map(({name,day,slot,cash,debt,focus})=>({name,day,slot,cash,debt,focus})),dialogs,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
