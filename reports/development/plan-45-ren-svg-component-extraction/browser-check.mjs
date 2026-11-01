import http from 'node:http'; import {readFile, mkdtemp, rm, writeFile} from 'node:fs/promises'; import {spawn} from 'node:child_process'; import {tmpdir} from 'node:os'; import path from 'node:path'; import net from 'node:net';
const root=process.cwd(), out=path.resolve('reports/development/plan-45-ren-svg-component-extraction');
const profile=await mkdtemp(path.join(tmpdir(),'qp45-')); let browser,server,ws; const errors=[];
const freePort=()=>new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
try {
 server=http.createServer(async(req,res)=>{try{const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!target.startsWith(root+path.sep))throw Error('outside root'); const data=await readFile(target);const ext=path.extname(target);res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png'})[ext]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('Not found')}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port, debug=await freePort();
 browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,`--remote-debugging-port=${debug}`,'about:blank'],{stdio:'ignore',windowsHide:true});browser.on('error',e=>errors.push(String(e)));
 let targets;for(let i=0;i<100;i++){try{targets=await (await fetch(`http://127.0.0.1:${debug}/json`)).json();if(targets[0]?.webSocketDebuggerUrl)break}catch{}await delay(100)} if(!targets?.[0])throw Error('Chrome CDP unavailable');
 ws=new WebSocket(targets[0].webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}}else if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));else if(m.method==='Log.entryAdded'&&m.params.entry.level==='error')errors.push(m.params.entry.text)};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.delete(id))reject(Error(`timeout ${method}`))},18000).unref()});
 await call('Page.enable');await call('Runtime.enable');await call('Log.enable');
 const evidence=[];
 for(const [name,width,height] of [['desktop',1280,900],['narrow',390,844]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:`http://127.0.0.1:${port}/reports/development/plan-45-ren-svg-component-extraction/gallery.html`});await delay(1700);
  const data=(await call('Runtime.evaluate',{returnByValue:true,expression:`(()=>{const svgs=[...document.querySelectorAll('.output svg,.avatars svg')];const imgs=[...document.images];let missing=[];for(const svg of svgs){const ids=new Set([...svg.querySelectorAll('[id]')].map(x=>x.id));for(const e of svg.querySelectorAll('*'))for(const a of e.attributes){for(const m of a.value.matchAll(/url\\(#([^\\)]+)\\)/g)){if(!ids.has(m[1]))missing.push(m[1])}if((a.name==='href'||a.name==='xlink:href')&&a.value.startsWith('#')&&!ids.has(a.value.slice(1)))missing.push(a.value.slice(1))}}return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,svgCount:svgs.length,images:imgs.map(x=>({ok:x.complete&&x.naturalWidth>0,src:x.getAttribute('src')})),missing,ready:document.readyState}})()`})).result.value;
  const metrics=await call('Page.getLayoutMetrics');
  for(const [part,selector] of [['faces','#avatars'],['door','#door'],['couch','#couch'],['floor','#floor'],['crop','#crop']]) {
   await call('Runtime.evaluate',{expression:`document.querySelector('${selector}').scrollIntoView({block:'center'})`}); await delay(250);
   const shot=await call('Page.captureScreenshot',{format:'png'});await writeFile(path.join(out,`gallery-${name}-${part}.png`),Buffer.from(shot.data,'base64'));
  }
  evidence.push({name,...data,height:metrics.cssContentSize.height});
 }
 await writeFile(path.join(out,'browser-evidence.json'),JSON.stringify({evidence,errors},null,2));console.log(JSON.stringify({evidence,errors}));if(errors.length||evidence.some(e=>e.missing.length||e.images.some(i=>!i.ok)))process.exitCode=1;
} finally {if(ws)ws.close();if(browser){browser.kill();await Promise.race([new Promise(r=>browser.once('exit',r)),delay(3000)])}if(server)await new Promise(r=>server.close(r));for(let i=0;i<10;i++){try{await rm(profile,{recursive:true,force:true});break}catch{await delay(200)}}}
