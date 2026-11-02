import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='reports/development/plan-52-five-slot-production-transition/baseline-work';await mkdir(dir,{recursive:true});
const paths=['src/main.js','src/core/game-engine.mjs','src/core/storage.mjs','src/core/life-progression.mjs','src/core/life-social.mjs','src/ui/life/life-view.js','src/ui/kitchen-setup-view.js'];
const pins=Object.fromEntries(await Promise.all(paths.map(async p=>[p,createHash('sha256').update(await readFile(p)).digest('hex')])));
let b;const captures=[];let error=null;
try{b=await launchIsolatedChrome();const {targetId}=await b.cdp.send('Target.createTarget',{url:'about:blank'});const {sessionId}=await b.cdp.send('Target.attachToTarget',{targetId,flatten:true});const send=(m,p={})=>b.cdp.send(m,p,sessionId);const evaljs=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
let ready=false;for(let i=0;i<80;i++){if(await evaljs('document.readyState === "complete" && !!document.querySelector("#app") && document.querySelector("#app").innerText.length>0')){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('application readiness timeout');
const snap=async name=>{await new Promise(r=>setTimeout(r,350));const body=await evaljs('document.body.innerText');const png=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${name}.png`,Buffer.from(png.data,'base64'));captures.push({name,body});};
await snap('fresh-desktop');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await snap('fresh-narrow');
const setup=await evaljs('!!document.querySelector("#morning-setup-form")');if(setup){await evaljs('document.querySelector("#morning-setup-form").requestSubmit()');await new Promise(r=>setTimeout(r,800));await snap('post-setup-narrow');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await snap('post-setup-desktop');;const click=async sel=>{const found=await evaljs("!!document.querySelector("+JSON.stringify(sel)+")");if(!found)throw Error('missing '+sel);await evaljs("document.querySelector("+JSON.stringify(sel)+").click()");await new Promise(r=>setTimeout(r,350));};
await click('[data-obj=plate]');await snap('breakfast-decision');await click('[data-act=confirm]');await click('[data-act=done]');await snap('breakfast-complete');const desk=await evaljs("(()=>{const b=Array.from(document.querySelectorAll('button')).find(x=>x.textContent.includes('The desk'));if(!b)return false;b.click();return true})()");if(!desk)throw Error('desk navigation missing');await new Promise(r=>setTimeout(r,450));await snap('desk-keys');await click('[data-obj=work-keys]');await snap('work-keys-decision');await click('[data-act=confirm]');await new Promise(r=>setTimeout(r,450));if(!await evaljs("document.querySelector('#story47-heading')?.textContent === 'On the way to work'"))throw Error('expected commute heading not mounted after keys');await snap('work-departure');}else throw Error('fresh page did not display setup form');
}catch(e){error=String(e);}finally{const cleanup=b?await closeIsolatedChrome(b):null;await writeFile(`${dir}/trace.json`,JSON.stringify({sourceCommit:'406c8de7a4183575fdde93c2fd613c4f3765c592',sourcePins:pins,url:'http://localhost:5173/Quackpot/',storage:'new isolated Chrome profile; no owner data',captures,error,cleanup},null,2));console.log(JSON.stringify({captures:captures.map(x=>x.name),error,cleanup}));if(error)process.exitCode=1;}







