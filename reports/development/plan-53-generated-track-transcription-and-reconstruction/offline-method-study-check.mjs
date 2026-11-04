import {writeFile,readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {launchIsolatedChrome,closeIsolatedChrome,evaluate,waitFor} from '../../../scripts/dev/checkpoints/cdp.mjs';
const out=new URL('./local/offline-method-study/',import.meta.url);let url,origin,server,serverExit;
const pins=['offline-method-study.html','offline-method-study.mjs','low-register-static-server.py','../plan-43-apartment-music-styles-and-motif-intrusion-study/vendor/webaudio-tinysynth.js'];
async function hashes(){return Object.fromEntries(await Promise.all(pins.map(async p=>[p,createHash('sha256').update(await readFile(new URL(p,import.meta.url))).digest('hex')])))}
let browser,session;const errors=[],requests=[],responses=[],failed=[],records=[];
const assert=(x,m)=>{if(!x)throw Error(m)};
try{
 const before=await hashes();

 server=spawn('C:\\Program Files\\Python314\\python.exe',['-I',new URL('./low-register-static-server.py',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),'0','85'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 serverExit=once(server,'exit');server.stderr.on('data',x=>console.error('Server stderr:',String(x)));
 const lines=createInterface({input:server.stdout});const first=await Promise.race([once(lines,'line').then(x=>x[0]),new Promise((_,reject)=>setTimeout(()=>reject(Error('static server startup timeout')),5000))]);
 const match=/pid=(\d+) .* port=(\d+) deadline_s=85/.exec(first);assert(match&&Number(match[1])===server.pid,'invalid static server startup');origin=`http://127.0.0.1:${match[2]}`;url=origin+`/reports/development/plan-53-generated-track-transcription-and-reconstruction/offline-method-study.html`;console.log('Static server:',first);
 browser=await launchIsolatedChrome();const context=await browser.cdp.send('Target.createBrowserContext',{disposeOnDetach:true});
 const target=await browser.cdp.send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});session=(await browser.cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 browser.cdp.socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.sessionId!==session)return;if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Network.responseReceived')responses.push({url:m.params.response.url,status:m.params.response.status,type:m.params.response.mimeType});if(m.method==='Network.loadingFailed')failed.push(m.params)});
 for(const domain of ['Page','Runtime','Network'])await browser.cdp.send(domain+'.enable',{},session);
 await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false},session);
 await browser.cdp.send('Page.navigate',{url},session);await waitFor(browser.cdp,session,"document.querySelector('#result')?.textContent !== 'PENDING'",'four-render study',70000);
 const result=await evaluate(browser.cdp,session,"JSON.parse(document.querySelector('#result').textContent)");assert(result.success&&result.results.length===4,'study failure: '+JSON.stringify(result));
 const screenshot=await browser.cdp.send('Page.captureScreenshot',{format:'png'},session);await writeFile(new URL('offline-study-check.png',out),Buffer.from(screenshot.data,'base64'),{flag:'wx'});
 assert(!errors.length,'browser runtime errors: '+JSON.stringify(errors));assert(requests.every(x=>x.startsWith(origin+'/')||x.startsWith('blob:')),'unexpected page request');const after=await hashes();assert(JSON.stringify(before)===JSON.stringify(after),'source changed during study');assert(requests.filter(x=>x===url).length===1,'page navigated');console.log(JSON.stringify({result,requests,pins:before}));
}catch(e){let state=null;if(browser&&session)try{state=await evaluate(browser.cdp,session,"({url:location.href,readyState:document.readyState,status:document.querySelector('#result')?.textContent??null})")}catch(diagnosticError){state={error:String(diagnosticError.stack||diagnosticError)}}console.error(String(e.stack||e));console.error('Browser diagnostics:',JSON.stringify({state,requests,responses,failed,errors}));process.exitCode=1}
finally{if(browser){const result=await closeIsolatedChrome(browser);console.log('Browser cleanup:',JSON.stringify(result));if(result.residual||result.uncertainty)process.exitCode=1}if(server){if(server.exitCode===null)server.kill();const [code,signal]=await serverExit;console.log('Static server cleanup:',JSON.stringify({pid:server.pid,code,signal,exited:server.exitCode!==null||server.signalCode!==null}));if(server.exitCode===null&&server.signalCode===null)process.exitCode=1}}
