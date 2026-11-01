// Report-local visual comparison; actual production renderers, isolated synthetic engine, no storage.
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../../../scripts/dev/checkpoints/cdp.mjs';
const repo=process.cwd();
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/ui/shell.css"><link rel="stylesheet" href="/src/ui/life/life.css"><div class="game-wrapper"><div id="hud-container"></div><main class="main-content" id="main-content"></main></div><script type="module">
import {GameEngine} from '/src/core/game-engine.mjs';
import {renderHud} from '/src/ui/hud.js';
import {renderLifeView} from '/src/ui/life/life-view.js';
import {candidateKeysTray} from '/reports/development/plan-47-work-and-evening-production-integration/keys-art-review/candidate.mjs';
const e=new GameEngine('keys-art-report',{lifePolicy:true,tutorialShift:true});e.start();e.setupCompanion();e.applyLifeIntent({type:'meal',choice:'buy'});e.state.step='life_breakfast';
renderHud(document.querySelector('#hud-container'),e,'/src/assets/duck-placeholder.svg');
renderLifeView(document.querySelector('#main-content'),e,{place:'desk-phone'},{});
window.useCandidate=()=>{const button=document.querySelector('[data-obj="work-keys"]');button.querySelector('svg').outerHTML=candidateKeysTray();};
window.ready=true;
</script>`;
const server=http.createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;if(p==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}const f=path.resolve(repo,'.'+decodeURIComponent(p));if(!f.startsWith(repo+path.sep))throw Error('outside');const b=await readFile(f);res.setHeader('Content-Type',({'.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);}catch{res.writeHead(404).end();}});
let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await launchIsolatedChrome();
 const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'});const {sessionId}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true});
 const send=(method,params={})=>browser.cdp.send(method,params,sessionId);
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=async expr=>{for(let i=0;i<80;i++){if(await evaluate(`Boolean(${expr})`))return;await new Promise(r=>setTimeout(r,100));}throw Error(`Timed out ${expr}`)};
 const dest=path.resolve('reports/development/plan-47-work-and-evening-production-integration/keys-art-review');const evidence=[];
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});await wait('window.ready');
 const snap=async name=>{const dims=await evaluate(`(()=>{const r=document.querySelector('[data-obj="work-keys"]').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);const data=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(dest,`${name}.png`),Buffer.from(data.data,'base64'));evidence.push({name,target:dims});};
 await snap('current-desktop');await evaluate('window.useCandidate()');await snap('candidate-desktop');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await snap('candidate-narrow');
 await send('Page.reload');await wait('window.ready');await snap('current-narrow');
 await writeFile(path.join(dest,'comparison.json'),JSON.stringify({kind:'synthetic component witness, production scene and UI; candidate SVG substituted only in this isolated page',evidence},null,2));
}finally{if(browser)console.log('Chrome cleanup',JSON.stringify(await closeIsolatedChrome(browser)));await new Promise(r=>server.close(r));}
