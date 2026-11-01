// Finite, isolated actual-app witness for Plan47 owner repair. Requires two named Vite builds.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';
const mode='after';
const base=path.resolve(mode==='before'?'node_modules/.cache/plan47-repair-before-1168ed5/dist':'dist');
const out=path.resolve('reports/development/plan-47-work-and-evening-production-integration/repair-02-browser');await mkdir(out,{recursive:true});
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
 await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:'sessionStorage.setItem("__nav",String(Number(sessionStorage.getItem("__nav")||0)+1));window.__dialogs=[];window.__answers=[]; window.confirm=m=>{__dialogs.push(m);return __answers.length?__answers.shift():true};window.alert=m=>__dialogs.push(m);'});
 await viewport(1366,768);await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/Quackpot/`});
 await click('#morning-setup-form button');await click('[data-obj="plate"]');await click(mode==='after-quiet'?'[data-act="decline"]':'[data-act="confirm"]');await click('[data-act="done"]');await new Promise(r=>setTimeout(r,300));
 phase='morning';await snap('morning-kitchen');
 if(mode==='before'){await textClick('Go to work');}
 else{
  await textClick('The desk');await wait('document.querySelector("[data-obj=work-keys]")');await snap('keys-desktop');
  const boxes=await evaluate(`(()=>{const a=document.querySelector('[data-obj=work-keys]').getBoundingClientRect(),b=document.querySelector('[data-obj=phone]').getBoundingClientRect();return {key:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},phone:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}}})()`);
  if(!(boxes.key.right<=boxes.phone.left||boxes.phone.right<=boxes.key.left||boxes.key.bottom<=boxes.phone.top||boxes.phone.bottom<=boxes.key.top))throw Error('Keys and phone targets overlap');trace.push({name:'target-boxes',...boxes});
  await viewport(390,844);await snap('keys-narrow');await evaluate(`document.querySelector('[data-obj="work-keys"]').focus()`);await snap('keys-focused');
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
 const alternatives=async name=>{const options=await evaluate(`['Call Mom','Sit with Duck'].map(t=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(t));return {label:t,present:!!b,disabled:b?.disabled??null}})`);trace.push({name,options});return options;};
 if(mode!=='before'){const a=await alternatives('options-before-dinner');if(a.some(x=>!x.present||!x.disabled))throw Error('Evening choices not shown disabled before dinner');}
 await click('[data-obj="plate"]');await click(mode==='after-quiet'?'[data-act="decline"]':'[data-act="confirm"]');await click('[data-act="done"]');await new Promise(r=>setTimeout(r,250));await snap('after-dinner');
 if(mode!=='before'){const a=await alternatives('options-after-dinner');if(a.some(x=>!x.present||x.disabled))throw Error('Evening choices not enabled after dinner');}
 await textClick('The desk');await snap('evening-desk');
 if(mode==='after-quiet'){await click('[data-obj="quiet-duck"]');await click('[data-act="confirm"]');await snap('quiet');}
 else {await textClick('Call Mom');await snap('call');}
 await reloadTo('.life-story47');
 await textClick(mode==='after-quiet'?'Finish your break':'Finish the call');await textClick('Continue');await snap('after-anchor');
 phase='phone-advisory';
 const state=async()=>evaluate(`(()=>{const x=JSON.parse(localStorage.getItem('quackpot_save_v1'));return JSON.stringify({state:x.state,eventLog:x.eventLog,rng:x.rng})})()`);
 await evaluate('window.__answers=[false]');const before=await state();await click('[data-obj="phone"]');await new Promise(r=>setTimeout(r,250));if(await state()!==before)throw Error('Cancelled advisory changed saved game');
 await evaluate('window.__answers=[true]');await click('[data-obj="phone"]');await wait('document.querySelector(".life-phone-hub")');
 if(await evaluate(`!!document.querySelector('#btn-open-duck-dex') || !!document.querySelector('[data-life-phone=finish], [data-life-phone=extend]')`))throw Error('Old global Dex or session controls remain');
 let life=await evaluate(`JSON.parse(localStorage.getItem('quackpot_save_v1')).state.life`);if(life.phase!=='evening'||life.session)throw Error('Browsing committed phase');
 await snap('phone-before-action');await click('.app-dex-nav');await click('#btn-dex-return');await wait('document.querySelector(".life-phone-hub")');
 phase='cancel-pull';await evaluate('window.__answers=[false]');const beforePull=await state();await click('[data-life-phone="welcome"]');await new Promise(r=>setTimeout(r,200));if(await state()!==beforePull)throw Error('Cancelled pull changed game');
 phase='confirm-pull';await evaluate('window.__answers=[true]');await click('[data-life-phone="welcome"]');await wait('document.querySelector("#btn-reveal-all")');await snap('after-welcome');
 let saved=await evaluate(`JSON.parse(localStorage.getItem('quackpot_save_v1'))`);if(saved.state.life.phase!=='lateNight'||!saved.state.life.fatiguePending||saved.eventLog.filter(x=>x.type==='draw_committed').length!==10)throw Error('Confirmed welcome did not commit expected phase and draws');
 await click('.app-dex-nav');await click('#btn-dex-return');await wait('document.querySelector("#btn-reveal-all")');await reloadTo('#btn-reveal-all');saved=await evaluate(`JSON.parse(localStorage.getItem('quackpot_save_v1'))`);if(saved.state.life.phase!=='lateNight'||saved.eventLog.filter(x=>x.type==='draw_committed').length!==10)throw Error('Reload changed committed outcome');await snap('reload-welcome');
 await click('#btn-reveal-all');await wait('document.querySelector("#btn-gacha-proceed") && !document.querySelector("#btn-gacha-proceed").disabled');await click('#btn-gacha-proceed');await wait('document.querySelector("[data-life-phone=race]")');await click('[data-life-phone="race"]');await wait('document.querySelector("input[name=stance][value=sprint]")');await evaluate(`document.querySelector('input[name=stance][value=sprint]').click()`);await click('.app-dex-nav');await click('#btn-dex-return');await wait('document.querySelector("input[name=stance][value=sprint]")');if(!await evaluate(`document.querySelector('input[name=stance][value=sprint]').checked`))throw Error('Dex return lost race choice');await snap('race-choice-restored');
 if(runtime.some(e=>e.method==='Runtime.exceptionThrown'))throw Error('Runtime exception in route');
 await writeFile(path.join(out,`${mode}-trace.json`),JSON.stringify({source:mode==='before'?'1168ed5':'working tree',mode,trace,runtime},null,2));
}catch(error){let diagnostic=null;try{diagnostic=await evaluate(`({url:location.href,readyState:document.readyState,body:document.body.innerText,main:document.querySelector('#main-content')?.outerHTML,dialogs:window.__dialogs,save:localStorage.getItem('quackpot_save_v1')})`);}catch(e){diagnostic={error:String(e)}}await writeFile(path.join(out,`${mode}-failure.json`),JSON.stringify({mode,phase,error:String(error),diagnostic,runtime},null,2));throw error;}
finally{if(browser)console.log('Chrome cleanup',JSON.stringify(await closeIsolatedChrome(browser)));await new Promise(r=>server.close(r));}
