import {writeFile,readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {launchIsolatedChrome,closeIsolatedChrome,evaluate,waitFor} from '../../../scripts/dev/checkpoints/cdp.mjs';
const track='m5';
const out=new URL(`./local/stage-d/${track}/`,import.meta.url);
let url,origin,server,serverExit;
const pins=['stage-d-listening.html','stage-d-listening.mjs','duration-variants.mjs','low-register-variants.mjs','../plan-43-apartment-music-styles-and-motif-intrusion-study/selected-drum-arrangement.mjs','../plan-43-apartment-music-styles-and-motif-intrusion-study/tinysynth-drums.mjs','../plan-43-apartment-music-styles-and-motif-intrusion-study/drum-snare-tighter.mjs','../plan-43-apartment-music-styles-and-motif-intrusion-study/drum-short.mjs','../plan-43-apartment-music-styles-and-motif-intrusion-study/drum-revisions.mjs','../plan-43-apartment-music-styles-and-motif-intrusion-study/vendor/webaudio-tinysynth.js','local/stage-d/m5/events.json','local/stage-d/m5/original.wav','local/stage-d/m5/duration50-capture.wav'];
async function hashes(){return Object.fromEntries(await Promise.all(pins.map(async p=>[p,createHash('sha256').update(await readFile(new URL(p,import.meta.url))).digest('hex')])))}
let browser,session;const errors=[],requests=[],responses=[],failed=[],records=[];
const assert=(x,m)=>{if(!x)throw Error(m)};
try{
 const before=await hashes();
 assert(before['local/stage-d/m5/events.json']==='525f9ea1c1017b753f7e607b18287ce2ec89c5034660b4d9f74393b60b5dadda'&&before['local/stage-d/m5/original.wav']==='a1e6615bccb0738d71a165d62f3edf36724f8a2f57a8676178f61760ec428fc7'&&before['local/stage-d/m5/duration50-capture.wav']==='5415166c125304637cc2bad88d0bc385fde23a19c0045ca40ea5b545b8d0439b','source or control hash mismatch');
 server=spawn('C:\\Program Files\\Python314\\python.exe',['-I',new URL('./low-register-static-server.py',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'),'0','85'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 serverExit=once(server,'exit');server.stderr.on('data',x=>console.error('Server stderr:',String(x)));
 const lines=createInterface({input:server.stdout});const first=await Promise.race([once(lines,'line').then(x=>x[0]),new Promise((_,reject)=>setTimeout(()=>reject(Error('static server startup timeout')),5000))]);
 const match=/pid=(\d+) .* port=(\d+) deadline_s=85/.exec(first);assert(match&&Number(match[1])===server.pid,'invalid static server startup');origin=`http://127.0.0.1:${match[2]}`;url=origin+`/reports/development/plan-53-generated-track-transcription-and-reconstruction/stage-d-listening.html?track=${track}`;console.log('Static server:',first);
 browser=await launchIsolatedChrome();const context=await browser.cdp.send('Target.createBrowserContext',{disposeOnDetach:true});
 const target=await browser.cdp.send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});session=(await browser.cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 browser.cdp.socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.sessionId!==session)return;if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Network.responseReceived')responses.push({url:m.params.response.url,status:m.params.response.status,type:m.params.response.mimeType});if(m.method==='Network.loadingFailed')failed.push(m.params)});
 for(const domain of ['Page','Runtime','Network'])await browser.cdp.send(domain+'.enable',{},session);
 await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false},session);
 await browser.cdp.send('Page.navigate',{url},session);await waitFor(browser.cdp,session,"document.querySelector('#status')?.textContent.startsWith('Ready:')",'listening page',10000);
 const desktop=await evaluate(browser.cdp,session,"({width:document.documentElement.scrollWidth,viewport:innerWidth,title:document.title})");
 await writeFile(new URL('low-register-static-desktop-check.png',out),Buffer.from((await browser.cdp.send('Page.captureScreenshot',{format:'png'},session)).data,'base64'),{flag:'wx'});
 await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 const narrow=await evaluate(browser.cdp,session,"({width:document.documentElement.scrollWidth,viewport:innerWidth,buttons:[...document.querySelectorAll('button')].map(x=>({text:x.textContent,width:x.getBoundingClientRect().width}))})");
 await writeFile(new URL('low-register-static-narrow-check.png',out),Buffer.from((await browser.cdp.send('Page.captureScreenshot',{format:'png'},session)).data,'base64'),{flag:'wx'});
 assert(narrow.width<=narrow.viewport+1,'narrow horizontal overflow');await browser.cdp.send('Emulation.clearDeviceMetricsOverride',{},session);
 const partState=await evaluate(browser.cdp,session,"({parts:[...document.querySelectorAll('#parts input')].map(x=>x.dataset.part),curatedDisabled:document.querySelector('#curated').disabled})");
 assert(track==='m3'?partState.parts.length===4&&!partState.curatedDisabled:partState.parts.length===1&&partState.curatedDisabled,'unexpected predicted part controls');
 for(const kind of ['lowquiet','lowelectric']){
   await evaluate(browser.cdp,session,`document.getElementById('${kind}').click()`);
   await waitFor(browser.cdp,session,"document.querySelector('#status').textContent.startsWith('Playing ')",'playback started',10000);
   const controls=await evaluate(browser.cdp,session,"({all:[...document.querySelectorAll('#parts input')].every(x=>x.disabled)})");assert(controls.all,'part controls not locked');
   await waitFor(browser.cdp,session,"/^(Finished:|Playback stopped:)/.test(document.querySelector('#status').textContent)",'playback completion',35000);
   const status=await evaluate(browser.cdp,session,"document.querySelector('#status').textContent");assert(status.startsWith('Finished: 450 note-on')&&status.includes(kind==='lowquiet'?'duration 50% · quiet low register':'duration 50% · electric low register'),'playback failure or wrong duration: '+status);
   const base64=await evaluate(browser.cdp,session,"(async()=>{const b=new Uint8Array(await (await fetch(document.querySelector('#wav').href)).arrayBuffer());let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));return btoa(s)})()");
   const b=Buffer.from(base64,'base64');assert(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WAVE'&&b.readUInt16LE(20)===1&&b.readUInt16LE(22)===2&&b.readUInt16LE(34)===16,'WAV format');
   const rate=b.readUInt32LE(24), frames=b.readUInt32LE(40)/4;assert(b.length===44+frames*4&&frames/rate>=25&&frames/rate<=30,'WAV length');let peak=0,nonzero=0;for(let i=44;i<b.length;i+=2){const s=b.readInt16LE(i);peak=Math.max(peak,Math.abs(s));if(s)nonzero++}assert(peak>0&&peak<32767&&nonzero>0,'silent or clipped output');
   const filename='low-register-static-'+kind+'-capture.wav';await writeFile(new URL(filename,out),b,{flag:'wx'});records.push({kind,status,bytes:b.length,rate,frames,seconds:frames/rate,peak,nonzero,sha256:createHash('sha256').update(b).digest('hex')});
 }
 assert(!errors.length,'browser runtime errors: '+JSON.stringify(errors));assert(requests.every(x=>x.startsWith(origin+'/')||x.startsWith('blob:')),'unexpected page request');
 const after=await hashes();assert(JSON.stringify(before)===JSON.stringify(after),'source or control changed during capture');assert(requests.filter(x=>x===url).length===1,'page navigated during capture');
 console.log(JSON.stringify({track,partState,desktop,narrow,records,errors,requests,pins:before,limits:'captured WAV has unmeasured start latency; scheduled notes are not proof of individual audible onsets'}));
}catch(e){let state=null;if(browser&&session)try{state=await evaluate(browser.cdp,session,"({url:location.href,readyState:document.readyState,status:document.querySelector('#status')?.textContent??null})")}catch(diagnosticError){state={error:String(diagnosticError.stack||diagnosticError)}}console.error(String(e.stack||e));console.error('Browser diagnostics:',JSON.stringify({state,requests,responses,failed,errors}));process.exitCode=1}
finally{if(browser){const result=await closeIsolatedChrome(browser);console.log('Browser cleanup:',JSON.stringify(result));if(result.residual||result.uncertainty)process.exitCode=1}if(server){if(server.exitCode===null)server.kill();const [code,signal]=await serverExit;console.log('Static server cleanup:',JSON.stringify({pid:server.pid,code,signal,exited:server.exitCode!==null||server.signalCode!==null}));if(server.exitCode===null&&server.signalCode===null)process.exitCode=1}}
