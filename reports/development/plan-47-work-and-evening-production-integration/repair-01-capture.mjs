// Finite, isolated actual-app witness for Plan47 owner repair. Requires two named Vite builds.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../scripts/dev/checkpoints/cdp.mjs';
const mode=process.argv[2]; if(!['capture'].includes(mode))throw Error('Expected before or after');
const base=path.resolve('dist');
const out=path.resolve('reports/development/plan-47-work-and-evening-production-integration/repair-01-browser');await mkdir(out,{recursive:true});
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
 await click('#morning-setup-form button');await click('[data-obj="plate"]');await click(mode==='after-quiet'?'[data-act="decline"]':'[data-act="confirm"]');await click('[data-act="done"]');await new Promise(r=>setTimeout(r,300));
 phase='morning';await wait(`document.querySelector('.life-stage') && getComputedStyle(document.querySelector('.life-stage')).opacity==='1'`);await snap('kitchen-cue');
 if(!(await evaluate(`document.body.innerText.includes('Your work keys are on the desk.')`)))throw Error('Kitchen keys cue missing');
 await click('[data-obj="notice"]');await wait(`document.querySelector('.life-held:not([hidden])')`);await snap('rent-letter');
 await click('[data-act="toggle"]');await snap('rent-decision');
 const text=await evaluate(`document.querySelector('.life-held').innerText`);
 if(!text.includes('due in three days')||text.includes('due on Day')||text.includes('No cash has been taken'))throw Error('Rent relative copy not shown consistently');
 await click('[data-act="back"]');await wait(`document.querySelector('.life-held')?.hidden`);
 await textClick('The desk');await wait(`document.querySelector('[data-obj=work-keys]') && getComputedStyle(document.querySelector('.life-stage')).opacity==='1'`);await snap('keys-desktop');
 const boxes=await evaluate(`(()=>{const a=document.querySelector('[data-obj=work-keys]').getBoundingClientRect(),b=document.querySelector('[data-obj=phone]').getBoundingClientRect();return {key:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},phone:{left:b.left,right:b.right,top:b.top,bottom:b.bottom}}})()`);
 if(!(boxes.key.right<=boxes.phone.left||boxes.phone.right<=boxes.key.left||boxes.key.bottom<=boxes.phone.top||boxes.phone.bottom<=boxes.key.top))throw Error('Keys and phone targets overlap');trace.push({name:'target-boxes',...boxes});
 await viewport(390,844);await snap('keys-narrow');await evaluate(`document.querySelector('[data-obj="work-keys"]').focus()`);await snap('keys-focused');
 if(runtime.some(e=>e.method==='Runtime.exceptionThrown'))throw Error('Runtime exception in capture');
 await writeFile(path.join(out,`${mode}-trace.json`),JSON.stringify({source:'final build',mode,trace,runtime},null,2));
}catch(error){let diagnostic=null;try{diagnostic=await evaluate(`({url:location.href,readyState:document.readyState,body:document.body.innerText,main:document.querySelector('#main-content')?.outerHTML,dialogs:window.__dialogs,save:localStorage.getItem('quackpot_save_v1')})`);}catch(e){diagnostic={error:String(e)}}await writeFile(path.join(out,`${mode}-failure.json`),JSON.stringify({mode,phase,error:String(error),diagnostic,runtime},null,2));throw error;}
finally{if(browser)console.log('Chrome cleanup',JSON.stringify(await closeIsolatedChrome(browser)));await new Promise(r=>server.close(r));}
