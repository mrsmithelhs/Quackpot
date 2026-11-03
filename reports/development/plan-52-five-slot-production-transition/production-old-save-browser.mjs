import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const dir='reports/development/plan-52-five-slot-production-transition/production-old-save-repair';await mkdir(dir,{recursive:true});
const fixturePath='reports/development/plan-52-five-slot-production-transition/baseline-phone/hub-generated.save.json',fixture=await readFile(fixturePath,'utf8');
const paths=['src/main.js','src/core/storage.mjs','src/core/life-replay.mjs'];const pins=Object.fromEntries(await Promise.all(paths.map(async p=>[p,createHash('sha256').update(await readFile(p)).digest('hex')])));
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),results=[],consoleErrors=[];let b,error=null;
try {
 b=await launchIsolatedChrome();b.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled' && m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 for(const mode of ['temporary','replacement','quota-failure']) {
  const {browserContextId}=await b.cdp.send('Target.createBrowserContext');const {targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank',browserContextId});const {sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});
  const send=(method,params={})=>b.cdp.send(method,params,sessionId),evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=()=>new Promise(resolve=>setTimeout(resolve,400)),click=async text=>{const ok=await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(${JSON.stringify(text)}));if(!b)return false;b.click();return true})()`);if(!ok)throw Error(`${mode}: missing ${text}`);await wait();};
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
  const injected=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(fixture)});localStorage.setItem('quackpot_save_backup','occupied-backup-sentinel');`});
  await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});let ready=false;for(let i=0;i<80;i++){if(await evaluate("document.body.innerText.includes('Save from an earlier development version')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${mode}: unsupported-save dialog absent`);
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.identifier});const png=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${mode}-dialog.png`,Buffer.from(png.data,'base64'));
  if(!await evaluate("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Replace with a new run'));return !!b && b.classList.contains('btn-secondary') && b.classList.contains('btn-lg')})()"))throw Error(`${mode}: replacement button styling missing`);
  await evaluate('window.confirm=()=>true;window.alert=()=>{}');
  if(mode==='temporary') {await click('Play a temporary session');await evaluate('document.querySelector("#morning-setup-form").requestSubmit()');await wait();await click('Save');}
  else {if(mode==='quota-failure')await evaluate("(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='quackpot_save_v1')throw new DOMException('synthetic quota failure','QuotaExceededError');return set.call(this,k,v)}})()");await click('Replace with a new run');}
  const state=await evaluate(`(()=>{const raw=localStorage.getItem('quackpot_save_v1');return {primaryUnchanged:raw===${JSON.stringify(fixture)},backup:localStorage.getItem('quackpot_save_backup'),schema:(()=>{try{return JSON.parse(raw)?.schemaVersion}catch{return null}})(),body:document.body.innerText}})()`);
  if(state.backup!=='occupied-backup-sentinel')throw Error(`${mode}: occupied backup changed`);
  if(mode==='temporary' && !state.primaryUnchanged)throw Error('temporary play changed original');
  if(mode==='replacement' && (state.primaryUnchanged || state.schema!==5))throw Error('explicit replacement did not install schema 5');
  if(mode==='quota-failure' && (!state.primaryUnchanged || !state.body.includes('replacement did not complete')))throw Error('quota failure did not preserve/report original');
  const after=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${mode}-after.png`,Buffer.from(after.data,'base64'));results.push({mode,...state});await b.cdp.send('Target.disposeBrowserContext',{browserContextId});
 }
} catch(e){error=String(e);} finally {const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(`${dir}/trace.json`,JSON.stringify({sourceCommit,pins,fixturePath,fixtureSha256:createHash('sha256').update(fixture).digest('hex'),results,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({results:results.map(({mode,primaryUnchanged,schema,backup})=>({mode,primaryUnchanged,schema,backup})),consoleErrors,error,cleanup}));if(error || consoleErrors.length)process.exitCode=1;}
