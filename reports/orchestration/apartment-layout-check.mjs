// Finite component-layout witness, isolated profile and in-memory engine only.
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { launchIsolatedChrome, closeIsolatedChrome } from '../../scripts/dev/checkpoints/cdp.mjs';

const root = process.cwd();
const fixture = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/src/style.css"><link rel="stylesheet" href="/src/ui/shell.css"><link rel="stylesheet" href="/src/ui/life/life.css">
<div class="game-wrapper"><div id="hud-container"></div><main class="main-content" id="main-content"></main></div>
<script type="module">
import {GameEngine} from '/src/core/game-engine.mjs';
import {renderHud} from '/src/ui/hud.js';
import {renderLifeView} from '/src/ui/life/life-view.js';
import {renderLifePhoneView} from '/src/ui/life/life-phone-view.js';
const e=new GameEngine('layout-only',{lifePolicy:true});e.start();e.setupCompanion();
e.state.life.phase='evening';e.state.life.meals['d1-dinner']='buy';e.state.step='life_evening';
e.state.clock.label='day 1 evening';
renderHud(document.querySelector('#hud-container'),e,'/src/assets/duck-placeholder.svg');
let lifeHandle=renderLifeView(document.querySelector('main'),e,{place:'desk-phone'},{});
window.layoutReady=true;
window.hubActions=[];
window.showHub=(mode)=>{
 lifeHandle?.destroy();lifeHandle=null;
 e.state.tenPullCommitted=mode!=='welcome';
 e.state.pendingReveals=mode==='pending'?[{revealed:false}]:[];
 e.state.owned=mode==='welcome'?[]:['bath_cadet'];
 e.state.life.session=mode==='welcome'?null:{pull:true,race:false};
 document.documentElement.style.fontSize='';
 renderLifePhoneView(document.querySelector('main'),e,{action:a=>window.hubActions.push(a)});
};
window.showInvitation=(replied,phase='morning')=>{
 lifeHandle?.destroy();
 const run=new GameEngine('resolved-object-only',{lifePolicy:true});run.start();run.setupCompanion();
 run.showLifeInvitation();if(replied)run.replyLifeInvitation();
 run.state.life.phase=phase;run.state.life.meals['d1-breakfast']='buy';
 run.state.step=phase==='evening'?'life_evening':'life_breakfast';
 const ui={place:'desk-phone',...(replied?{held:{obj:'phone',place:'desk-phone'},returnFocus:{id:'phone',place:'desk-phone'}}:{})};
 window.inviteActions=0;
 lifeHandle=renderLifeView(document.querySelector('main'),run,ui,{onInvitationShown:()=>{window.inviteActions++},onLaunchAcknowledgmentShown:()=>{window.inviteActions++}});
 return run.log.length;
};
</script>`;
const server = http.createServer(async (req,res) => {
  try {
    const pathname = new URL(req.url,'http://localhost').pathname;
    if(pathname==='/') {res.setHeader('Content-Type','text/html');res.end(fixture);return;}
    const file=path.resolve(root,'.'+decodeURIComponent(pathname));
    if(!file.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
    const body=await readFile(file);
    res.setHeader('Content-Type', ({'.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
    res.end(body);
  } catch {res.writeHead(404).end();}
});
let browser,session;
const results=[];
try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await launchIsolatedChrome();
  const {targetId}=await browser.cdp.send('Target.createTarget',{url:'about:blank'});
  ({sessionId:session}=await browser.cdp.send('Target.attachToTarget',{targetId,flatten:true}));
  const send=(method,params={})=>browser.cdp.send(method,params,session);
  const evaluate=async expression=>{
    const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  await send('Page.enable');
  await send('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  const until=Date.now()+7000;
  while(!await evaluate('Boolean(window.layoutReady)')){
    if(Date.now()>until)throw Error('component readiness timeout');
    await new Promise(r=>setTimeout(r,60));
  }
  for(const [width,height] of [[1892,910],[1536,730],[1440,800],[1366,768],[1280,720],[1024,768],[390,844]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const row=await evaluate(`(()=>{const b=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};return {viewport:[innerWidth,innerHeight],header:b('.hud-header'),brand:b('.hud-brand'),status:b('.hud-status-bar'),controls:b('.hud-controls'),scene:b('.life-scene'),bar:b('.life-day-bar'),scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}})()`);
    results.push(row);
    assert.ok(row.scrollWidth<=width,`horizontal overflow at ${width}`);
    if(width>=1000){
      assert.ok(row.bar.bottom<=height,`navigation below viewport at ${width}: ${row.bar.bottom}`);
      assert.ok(row.scrollHeight<=height,`page needs scrolling at ${width}: ${row.scrollHeight}`);
    }
    if(width>=1440)assert.ok(row.status.y<row.brand.bottom && row.controls.y<row.brand.bottom,'header is not compact');
    if(width===1536){const img=await send('Page.captureScreenshot',{format:'png'});await writeFile('reports/orchestration/apartment-layout-desktop.png',Buffer.from(img.data,'base64'));}
  }
  // Enlarged layout text uses the normal stacked/scrolling fallback; no clipping.
  await evaluate("document.documentElement.style.fontSize='32px'");
  const zoom=await evaluate('({scrollWidth:document.documentElement.scrollWidth,width:innerWidth})');
  assert.ok(zoom.scrollWidth<=zoom.width,'enlarged text horizontal overflow');
  results.push({enlargedText:zoom});
  for(const [width,height] of [[1536,730],[390,844]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const mode of ['welcome','pending','paid']){
      await evaluate(`window.showHub('${mode}')`);
      await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const hub=await evaluate(`(()=>{const buttons=[...document.querySelectorAll('[data-life-phone]')];return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,mode:'${mode}',buttons:buttons.map(b=>({action:b.dataset.lifePhone,height:b.getBoundingClientRect().height})),shop:document.querySelector('[data-life-phone="bundle"]').textContent}})()`);
      assert.ok(hub.scrollWidth<=width,'hub horizontal overflow');
      assert.ok(hub.buttons.every(b=>b.height>=44),'hub undersized action');
      const expected=mode==='welcome'?['welcome','bundle','finish']:mode==='pending'?['reveal','race','bundle','extend','finish']:['single','ten','race','bundle','extend','finish'];
      assert.deepEqual(hub.buttons.map(b=>b.action),expected);
      assert.ok(hub.shop.includes('$4.99'));
      await evaluate('window.hubActions=[];document.querySelectorAll("[data-life-phone]").forEach(b=>b.click())');
      assert.deepEqual(await evaluate('window.hubActions'),expected,'action dispatch changed');
      results.push({hub});
      if(mode==='paid'){const img=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(`reports/orchestration/session-hub-${width}.png`,Buffer.from(img.data,'base64'));}
    }
  }
  for(const [replied,phase] of [[false,'morning'],[true,'morning'],[true,'evening']]){
    await evaluate(`window.showInvitation(${replied},'${phase}')`);
    const state=await evaluate(`(()=>{const phone=document.querySelector('[data-obj="phone"]');if(phone.disabled)phone.click();return {disabled:phone.disabled,heldHidden:document.querySelector('.life-held').hidden,actions:window.inviteActions,chip:phone.querySelector('.life-chip')?.textContent??null,activeIsPhone:document.activeElement===phone}})()`);
    // Resolved target clicks must do nothing; enabled-state action behavior belongs to existing journeys.
    if(replied&&phase==='morning'){
      assert.equal(state.disabled,true);assert.equal(state.heldHidden,true);assert.equal(state.actions,0);
      assert.equal(state.chip,null);assert.equal(state.activeIsPhone,false);
    }else assert.equal(state.disabled,false);
    results.push({invitation:{replied,phase,...state}});
  }
} finally {
  const cleanup=await closeIsolatedChrome(browser);
  await new Promise(resolve=>server.close(resolve));
  await writeFile('reports/orchestration/apartment-layout-results.json',JSON.stringify({results,cleanup},null,2));
  console.log(JSON.stringify({cases:results.length,cleanup:{residual:cleanup.residual,uncertainty:cleanup.uncertainty}}));
}

