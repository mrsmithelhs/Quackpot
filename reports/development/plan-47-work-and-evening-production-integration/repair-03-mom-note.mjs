// Finite, isolated actual-app witness for Plan47 owner repair. Requires two named Vite builds.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';
const mode='after';
const base=path.resolve(mode==='before'?'node_modules/.cache/plan47-repair-before-1168ed5/dist':'dist');
const out=path.resolve('reports/development/plan-47-work-and-evening-production-integration/repair-03-mom-note-settled');await mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');const route=u.pathname.startsWith('/Quackpot/')?u.pathname.slice(9):u.pathname;const f=path.resolve(base,`.${decodeURIComponent(route==='/'?'/index.html':route)}`);if(!f.startsWith(base+path.sep))throw Error('outside root');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});
let browser,sessionId,send,evaluate,phase='startup';const trace=[],runtime=[];
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await launchIsolatedChrome();
 const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'});({sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true}));
 browser.cdp.socket.addEventListener('message',event=>{try{const m=JSON.parse(String(event.data));if(m.sessionId===sessionId&&['Runtime.exceptionThrown','Runtime.consoleAPICalled','Log.entryAdded'].includes(m.method))runtime.push(m);}catch{}});
 send=(method,params={})=>browser.cdp.send(method,params,sessionId);
 evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=async expr=>{for(let i=0;i<80;i++){if(await evaluate(`Boolean(${expr})`))return;await new Promise(r=>setTimeout(r,100));}throw Error(`Timed out ${expr}`);};
 const click=async sel=>{await wait(`document.querySelector(${JSON.stringify(sel)})`);await evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`);};
 const textClick=async text=>{const q=`[...document.querySelectorAll('button')].find(b=>!b.disabled && b.textContent.includes(${JSON.stringify(text)}))`;await wait(q);await evaluate(`${q}.click()`);};
 const snap=async name=>{const state=await evaluate(`(()=>{const r=JSON.parse(localStorage.getItem('quackpot_save_v1')||'null');return {text:document.body.innerText,life:r?.state?.life,cash:r?.state?.cash,events:r?.eventLog?.map(e=>({type:e.type,payload:e.payload}))}})()`);trace.push({name,...state});const img=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(out,`${mode}-${name}.png`),Buffer.from(img.data,'base64'));};
 const viewport=async(w,h)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600});
 const reloadTo=async selector=>{const previous=await evaluate(`sessionStorage.getItem('__nav')`);await send('Page.reload');await wait(`sessionStorage.getItem('__nav')!==${JSON.stringify(previous)} && document.querySelector(${JSON.stringify(selector)})`);};
 await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:'sessionStorage.setItem("__nav",String(Number(sessionStorage.getItem("__nav")||0)+1));window.__dialogs=[]; window.confirm=m=>{__dialogs.push(m);return true};window.alert=m=>__dialogs.push(m);'});
 await viewport(1366,768);await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/Quackpot/`});
 await click('#morning-setup-form button');await click('[data-obj="plate"]');await click('[data-act="decline"]');await click('[data-act="done"]');await new Promise(r=>setTimeout(r,300));
 phase='morning';await snap('morning-kitchen');
 if(mode==='before'){await textClick('Go to work');}
 else{
  await textClick('The desk');await wait('document.querySelector("[data-obj=work-keys]")');await evaluate(`document.querySelector('[data-obj=work-keys]').focus()`);await snap('keys-desktop');await click('[data-obj=work-keys]');await wait(`!document.querySelector('.life-popover').getAnimations().some(a=>a.playState==='running')`);await snap('keys-popover-desktop');await click('[data-act=back]');
  const boxes=await evaluate(`(()=>{const a=document.querySelector('[data-obj=work-keys]').getBoundingClientRect(),b=document.querySelector('[data-obj=phone]').getBoundingClientRect();return {key:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},phone:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}}})()`);
  if(!(boxes.key.right<=boxes.phone.left||boxes.phone.right<=boxes.key.left||boxes.key.bottom<=boxes.phone.top||boxes.phone.bottom<=boxes.key.top))throw Error('Keys and phone targets overlap');trace.push({name:'target-boxes',...boxes});
  await viewport(390,844);await snap('keys-narrow');await click('[data-obj=work-keys]');await wait(`!document.querySelector('.life-popover').getAnimations().some(a=>a.playState==='running')`);await snap('keys-popover-narrow');await click('[data-act=back]');await evaluate(`document.querySelector('[data-obj="work-keys"]').focus()`);await snap('keys-focused');
  await reloadTo('.life-view');
  const restored=await evaluate(`(()=>{const e=JSON.parse(localStorage.getItem('quackpot_save_v1'));return {marker:e.eventLog.find(x=>x.type==='run_started').payload.tutorialShiftVersion,cash:e.state.cash,incomes:e.eventLog.filter(x=>x.type==='income').length}})()`);
  if(restored.marker!==1||restored.incomes!==0)throw Error('New-run marker or pre-departure wage state invalid');trace.push({name:'marker-restored-before-departure',...restored});
  await textClick('The desk');await click('[data-obj="work-keys"]');await snap('keys-decision');await click('[data-act="confirm"]');
 }
 phase='work';await wait('document.querySelector(".life-story47")');await snap('commute');
 await reloadTo('.life-story47');
 await click('#btn-open-settings');await click('[data-settings-done]');await click('#btn-uninstall');await click('#btn-retention-stay');
 await textClick('Arrive at work');await textClick('Complete shift');await snap('payslip');await textClick('Return home');
 phase='evening';await wait('document.querySelector("[data-obj=plate]")');await snap('before-dinner');
 await click('[data-obj="plate"]');await click(mode==='after-quiet'?'[data-act="decline"]':'[data-act="confirm"]');await click('[data-act="done"]');await new Promise(r=>setTimeout(r,250));await snap('after-dinner');
 phase='mom-note';await wait('document.querySelector("[data-obj=mom-note]") && !document.querySelector("[data-obj=mom-note]").disabled');
 const geometry=await evaluate(`(()=>{const boxes=['mom-note','notice'].map(id=>{const r=document.querySelector('[data-obj="'+id+'"]').getBoundingClientRect();return {id,left:r.left,right:r.right,top:r.top,bottom:r.bottom}});return boxes})()`);
 if(!(geometry[0].right<=geometry[1].left||geometry[1].right<=geometry[0].left||geometry[0].bottom<=geometry[1].top||geometry[1].bottom<=geometry[0].top))throw Error('Note overlaps rent target');trace.push({name:'note-target-boxes',geometry});
 await snap('note-narrow');await viewport(1366,768);await snap('note-desktop');await evaluate(`document.querySelector('[data-obj=mom-note]').focus()`);await snap('note-focused');await click('[data-obj=mom-note]');await snap('note-decision');await click('[data-act=back]');await click('[data-obj=mom-note]');await click('[data-act=confirm]');await wait('document.querySelector(".life-story47")');await snap('call');await textClick('Finish the call');await textClick('Continue');const final=await evaluate(`JSON.parse(localStorage.getItem('quackpot_save_v1'))`);const events=final.eventLog.filter(x=>x.type==='life_intent'&&x.payload.intent.type==='begin_activity47');if(events.length!==1||events[0].payload.intent.version!==3)throw Error('Call not version 3');const hp=final.eventLog.filter(x=>x.type==='life_health'&&x.payload.reason==='call_mom');if(hp.length!==1||hp[0].payload.delta!==5)throw Error('Call effect not exactly 5');trace.push({name:'call-verified',intent:events[0].payload.intent,hp:hp[0].payload});await wait('document.querySelector("[data-obj=mom-note]")');if(!await evaluate(`document.querySelector('[data-obj=mom-note]').disabled`))throw Error('Note still active after call');await snap('note-used');
 if(runtime.some(e=>e.method==='Runtime.exceptionThrown'))throw Error('Runtime exception in route');
 await writeFile(path.join(out,`${mode}-trace.json`),JSON.stringify({source:mode==='before'?'1168ed5':'working tree',mode,trace,runtime},null,2));
}catch(error){let diagnostic=null;try{diagnostic=await evaluate(`({url:location.href,readyState:document.readyState,body:document.body.innerText,main:document.querySelector('#main-content')?.outerHTML,dialogs:window.__dialogs,save:localStorage.getItem('quackpot_save_v1')})`);}catch(e){diagnostic={error:String(e)}}await writeFile(path.join(out,`${mode}-failure.json`),JSON.stringify({mode,phase,error:String(error),diagnostic,runtime},null,2));throw error;}
finally{if(browser)console.log('Chrome cleanup',JSON.stringify(await closeIsolatedChrome(browser)));await new Promise(r=>server.close(r));}
