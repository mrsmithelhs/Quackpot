import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {launchIsolatedChrome,closeIsolatedChrome,evaluate,waitFor} from '../../../scripts/dev/checkpoints/cdp.mjs';
const out=new URL('./local/listening/',import.meta.url), url='http://localhost:5173/Quackpot/reports/development/plan-53-generated-track-transcription-and-reconstruction/listening.html';
let browser,session;const errors=[],requests=[],records=[];
const assert=(x,m)=>{if(!x)throw Error(m)};
try{
 browser=await launchIsolatedChrome();const context=await browser.cdp.send('Target.createBrowserContext',{disposeOnDetach:true});
 const target=await browser.cdp.send('Target.createTarget',{url:'about:blank',browserContextId:context.browserContextId});session=(await browser.cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 browser.cdp.socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.sessionId!==session)return;if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text)});
 for(const domain of ['Page','Runtime','Network'])await browser.cdp.send(domain+'.enable',{},session);
 await browser.cdp.send('Page.navigate',{url},session);await waitFor(browser.cdp,session,"document.querySelector('#status')?.textContent.startsWith('Ready:')",'listening page',10000);
 const desktop=await evaluate(browser.cdp,session,"({width:document.documentElement.scrollWidth,viewport:innerWidth,title:document.title})");
 await writeFile(new URL('desktop-check.png',out),Buffer.from((await browser.cdp.send('Page.captureScreenshot',{format:'png'},session)).data,'base64'),{flag:'wx'});
 await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 const narrow=await evaluate(browser.cdp,session,"({width:document.documentElement.scrollWidth,viewport:innerWidth,buttons:[...document.querySelectorAll('button')].map(x=>({text:x.textContent,width:x.getBoundingClientRect().width}))})");
 await writeFile(new URL('narrow-check.png',out),Buffer.from((await browser.cdp.send('Page.captureScreenshot',{format:'png'},session)).data,'base64'),{flag:'wx'});
 assert(narrow.width<=narrow.viewport+1,'narrow horizontal overflow');await browser.cdp.send('Emulation.clearDeviceMetricsOverride',{},session);
 for(const kind of ['stock','curated']){
   await evaluate(browser.cdp,session,`document.getElementById('${kind}').click()`);
   await waitFor(browser.cdp,session,"document.querySelector('#status').textContent.startsWith('Playing ')",'playback started',10000);
   const controls=await evaluate(browser.cdp,session,"({guitar:document.querySelector('#guitar').disabled,drums:document.querySelector('#drums').disabled})");assert(controls.guitar&&controls.drums,'part controls not locked');
   await waitFor(browser.cdp,session,"/^(Finished:|Playback stopped:)/.test(document.querySelector('#status').textContent)",'playback completion',35000);
   const status=await evaluate(browser.cdp,session,"document.querySelector('#status').textContent");assert(status.startsWith('Finished: 541 note-on'),'playback failure: '+status);
   const base64=await evaluate(browser.cdp,session,"(async()=>{const b=new Uint8Array(await (await fetch(document.querySelector('#wav').href)).arrayBuffer());let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));return btoa(s)})()");
   const b=Buffer.from(base64,'base64');assert(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WAVE'&&b.readUInt16LE(20)===1&&b.readUInt16LE(22)===2&&b.readUInt16LE(34)===16,'WAV format');
   const rate=b.readUInt32LE(24), frames=b.readUInt32LE(40)/4;assert(b.length===44+frames*4&&frames/rate>=25&&frames/rate<=30,'WAV length');let peak=0,nonzero=0;for(let i=44;i<b.length;i+=2){const s=b.readInt16LE(i);peak=Math.max(peak,Math.abs(s));if(s)nonzero++}assert(peak>0&&peak<32767&&nonzero>0,'silent or clipped output');
   const filename=kind+'-capture.wav';await writeFile(new URL(filename,out),b,{flag:'wx'});records.push({kind,status,bytes:b.length,rate,frames,seconds:frames/rate,peak,nonzero,sha256:createHash('sha256').update(b).digest('hex')});
 }
 assert(!errors.length,'browser runtime errors: '+JSON.stringify(errors));assert(requests.every(x=>x.startsWith('http://localhost:5173/')||x.startsWith('blob:')),'unexpected page request');
 console.log(JSON.stringify({desktop,narrow,records,errors,requests,limits:'captured WAV has unmeasured start latency; scheduled notes are not proof of individual audible onsets'}));
}catch(e){console.error(String(e.stack||e));process.exitCode=1}
finally{if(browser){const result=await closeIsolatedChrome(browser);console.log('Browser cleanup:',JSON.stringify(result));if(result.residual||result.uncertainty)process.exitCode=1}}
