import {launchIsolatedChrome,closeIsolatedChrome} from '../../../scripts/dev/checkpoints/cdp.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base='reports/development/plan-52-five-slot-production-transition/',dir=base+'repair-layout-browser';await mkdir(dir,{recursive:true});
const source=base+'production-finance-final/day4-rent-shortfall.save.json',fixture=await readFile(source,'utf8');
const closure=await currentPlan52SourceClosure(),results=[],consoleErrors=[];let browser,error=null;
try{
 browser=await launchIsolatedChrome();browser.cdp.socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.method==='Runtime.exceptionThrown')consoleErrors.push(m.params.exceptionDetails?.text??'exception');if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push(m.params.args?.map(x=>x.value??x.description).join(' '));});
 for(const [width,height] of [[1280,720],[1024,600],[860,700],[390,844]]){
  const {browserContextId}=await browser.cdp.send('Target.createBrowserContext'),{targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank',browserContextId}),{sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true});
  const send=(method,params={})=>browser.cdp.send(method,params,sessionId),evalExpr=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;},pause=()=>new Promise(r=>setTimeout(r,250));
  const click=async selector=>{if(!await evalExpr(`!!document.querySelector(${JSON.stringify(selector)})`))throw Error(`${width}: missing ${selector}`);await evalExpr(`document.querySelector(${JSON.stringify(selector)}).click()`);await pause();};
  const capture=async name=>{await pause();const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`${dir}/${width}-${name}.png`,Buffer.from(shot.data,'base64'));};
  const rect=selector=>evalExpr(`(()=>{const x=document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();return x?{left:x.left,top:x.top,width:x.width,height:x.height}:null})()`);
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
  let ready=false;for(let i=0;i<80;i++){if(await evalExpr("!!document.querySelector('#morning-setup-form')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${width}: fresh setup did not load`);
  const setup=await rect('.life-scene');await capture('setup');await evalExpr("document.querySelector('#morning-setup-form').requestSubmit()");await pause();const play=await rect('.life-scene');await capture('morning');
  if(!setup||!play||Math.abs(setup.left-play.left)>1||Math.abs(setup.top-play.top)>1||Math.abs(setup.width-play.width)>1)throw Error(`${width}: setup/play scene geometry differs: ${JSON.stringify({setup,play})}`);
  if(await evalExpr("document.body.innerText.includes('Spend time quietly') || !!document.querySelector('[data-obj=fallback-duck]')"))throw Error(`${width}: fallback offered during guided breakfast`);
  await click('[data-obj=plate]');await click('[data-act=confirm]');await click('[data-act=done]');
  if(await evalExpr("document.body.innerText.includes('Spend time quietly') || !!document.querySelector('[data-obj=fallback-duck]')"))throw Error(`${width}: fallback offered during mandatory work`);
  if(!await evalExpr("!!document.querySelector('[data-obj=notice]')")){const navigated=await evalExpr("(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('The kitchen'));if(!b)return false;b.click();return true})()");if(!navigated)throw Error(`${width}: cannot navigate to kitchen`);await pause();}
  await click('[data-obj=notice]');const ordinaryLetter=await rect('.life-letter'),ordinaryDecide=await rect('.life-decide'),ordinaryHeld=await rect('.life-held');await capture('rent-before-due');
  if(!ordinaryLetter||!ordinaryDecide||ordinaryLetter.width<Math.min(260,width-35)||ordinaryLetter.top<ordinaryHeld.top-2)throw Error(`${width}: ordinary notice squeezed or clipped`);
  const add=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('quackpot_save_v1',${JSON.stringify(fixture)})`});await send('Page.navigate',{url:'http://localhost:5173/Quackpot/'});
  ready=false;for(let i=0;i<80;i++){if(await evalExpr("document.body.innerText.includes('Payment due')")){ready=true;break;}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(`${width}: real due notice failed to restore`);await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:add.identifier});await pause();
  const letter=await rect('.life-letter'),decide=await rect('.life-decide'),held=await rect('.life-held');await capture('rent-due');
  if(!letter||!decide||letter.width<Math.min(260,width-35)||letter.top<held.top-2)throw Error(`${width}: letter is squeezed or starts above scroll area`);
  if(await evalExpr("document.body.innerText.includes('Spend time quietly') || !!document.querySelector('[data-obj=fallback-duck]')"))throw Error(`${width}: fallback offered while rent is due`);
  const shell=await evalExpr("({horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,uninstallVisible:!!document.querySelector('#btn-uninstall')})");if(shell.horizontalOverflow||!shell.uninstallVisible)throw Error(`${width}: shell overflow or missing Uninstall`);
  results.push({width,height,setup,play,ordinaryLetter,ordinaryDecide,letter,decide,held,shell,letterLayout:decide.top>letter.top+letter.height-5?'stacked':'side-by-side',noFallbackAtBreakfastWorkOrDue:true});await browser.cdp.send('Target.disposeBrowserContext',{browserContextId});
 }
}catch(e){error=String(e);}finally{const cleanup=browser?await closeIsolatedChrome(browser):null;await writeFile(dir+'/trace.json',JSON.stringify({source,fixtureSha256:sha256(Buffer.from(fixture)),sourceClosureSha256:closure.sha256,recipeSha256:sha256(await readFile(base+'repair-layout-browser.mjs')),results,consoleErrors,error,cleanup},null,2));console.log(JSON.stringify({results,consoleErrors,error,cleanup}));if(error||consoleErrors.length)process.exitCode=1;}
