// Root-owned finite viewport witness; avoids full-gallery screenshot allocation.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../scripts/dev/checkpoints/cdp.mjs';
const root=process.cwd(), out='reports/development/plan-45-ren-svg-component-extraction';
const server=http.createServer(async(req,res)=>{try{
 const route=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+decodeURIComponent(route));
 if(!file.startsWith(root+path.sep))throw Error('outside root');
 res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
 res.end(await readFile(file));
}catch{res.writeHead(404).end();}});
let browser, session;const observations=[],errors=[];
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await launchIsolatedChrome();
 const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true}));
 browser.cdp.socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.sessionId===session&&m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
 const send=(method,params={})=>browser.cdp.send(method,params,session);
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/${out}/gallery.html`});
 const until=Date.now()+12000;while(!await ev('Boolean(document.querySelector("#crop svg") && [...document.images].every(i=>i.complete&&i.naturalWidth>0))')){if(Date.now()>until)throw Error('gallery readiness timeout');await new Promise(r=>setTimeout(r,100));}
 for(const [name,width,height,selector] of [
 ['expressions',1280,900,'#avatars'],['door',1280,900,'#door'],['couch',1280,900,'#couch'],['floor',1280,900,'#floor'],['crop',1280,900,'#crop'],
 ['narrow-door',390,844,'#door'],['narrow-couch',390,844,'#couch'],['narrow-crop',390,844,'#crop']]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await ev(`document.querySelector('${selector}').scrollIntoView({block:'center'})`);
  await ev('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const state=await ev(`(()=>{const s=document.querySelector('${selector}');const r=s.getBoundingClientRect();return {name:'${name}',width:innerWidth,scrollWidth:document.documentElement.scrollWidth,svgCount:document.querySelectorAll('.output svg,.avatars svg').length,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),target:{top:r.top,bottom:r.bottom,width:r.width,height:r.height}}})()`);
  assert.ok(state.scrollWidth<=width,'gallery horizontal overflow');assert.ok(state.svgCount>=16,'missing extracted figures');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  const file=`${out}/root-${name}.png`;await writeFile(file,Buffer.from(shot.data,'base64'));observations.push({...state,file});
 }
 assert.equal(errors.length,0,'runtime exception');
}finally{
 const cleanup=await closeIsolatedChrome(browser);await new Promise(r=>server.close(r));
 await writeFile(`${out}/root-rendered-evidence.json`,JSON.stringify({source:'a9adec8 / progress2a8c279; Ren source and apartment inputs unchanged by root',observations,errors,cleanup},null,2));
 console.log(JSON.stringify({captures:observations.length,errors:errors.length,cleanup:{residual:cleanup.residual,uncertainty:cleanup.uncertainty}}));
}
