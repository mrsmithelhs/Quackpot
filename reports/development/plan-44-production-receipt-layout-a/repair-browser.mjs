import { GameEngine } from '../../../src/core/game-engine.mjs';
import { validateSave } from '../../../src/core/storage.mjs';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const browserPath = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if (!browserPath) throw Error('No supported browser binary');
const profile = mkdtempSync(path.join(tmpdir(), 'plan44-browser-'));
const child = spawn(browserPath, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking'], {stdio:'ignore'});
let socket; const wait = ms => new Promise(r => setTimeout(r, ms));
try {
  const active = path.join(profile, 'DevToolsActivePort');
  for (let i=0; i<100 && !existsSync(active) && child.exitCode === null; i++) await wait(100);
  if (!existsSync(active)) throw Error(`Browser did not start (exit ${child.exitCode}, signal ${child.signalCode})`);
  const { readFileSync } = await import('node:fs'); const port = readFileSync(active,'utf8').split('\n')[0];
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x => x.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve,reject) => { socket.onopen=resolve; socket.onerror=reject; });
  let id=0; const pending=new Map(); socket.onmessage=({data}) => { const msg=JSON.parse(data); if (!msg.id) return; const p=pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(Error(msg.error.message)) : p.resolve(msg.result); };
  const send=(method,params={}) => new Promise((resolve,reject) => { const n=++id; pending.set(n,{resolve,reject}); socket.send(JSON.stringify({id:n,method,params})); });
  const evaljs=async expression => {const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw Error(r.exceptionDetails.text); return r.result.value;};
  const until=async expression => {for(let i=0;i<100;i++){if(await evaljs(expression)) return; await wait(100);} const snap=await send('Page.captureScreenshot',{format:'png'}); writeFileSync('reports/development/plan-44-production-receipt-layout-a/browser-failure.png',Buffer.from(snap.data,'base64')); writeFileSync('reports/development/plan-44-production-receipt-layout-a/browser-failure.txt',String(await evaljs('document.body.innerText')).slice(0,12000)); throw Error(`Timed out: ${expression}`);};
  const makeRun = hostile => {
    const e = new GameEngine(hostile ? 'plan44-hostile-fixture' : 'plan44-repair-witness', {lifePolicy:true}); e.start(); e.setupCompanion();
    const step = intent => { const result=e.applyLifeIntent(intent); if(!result.ok) throw Error(`Intent failed: ${JSON.stringify(intent)} ${result.reason}`); };
    step({type:'meal',choice:'buy'}); step({type:'advance'}); step({type:'advance'}); step({type:'meal',choice:'buy'});
    e.commitPromotionalTenPull(); e.revealAllPending(); e.recordRaceChoicesShown(1,{duckId:e.state.owned[0]});
    if(!e.runRace(1,e.state.owned[0])) throw Error('Race 1 failed');
    // Harness-recorded seek is a deliberate fixture for event fields, not observed UI playback.
    e.recordRacePlaybackAction(1,'seek',{eventId:'fixture-event-42',cursorTick:123});
    if(hostile) e.recordRaceCueDisplayed(1,{cueId:'fixture-hostile',text:'<img src=x onerror="window.plan44Attack=1">'});
    step({type:'extend_session',confirmed:true}); e.buyLifeBundle(330); e.commitPaidPull(1); e.revealAllPending();
    if(!e.runRace(2,e.state.owned[0])) throw Error('Race 2 failed'); e.clickUninstall(); e.leaveUninstall();
    const envelope=e.toEnvelope(), valid=validateSave(envelope); if(!valid.valid) throw Error(`Invalid envelope: ${valid.errors.join('; ')}`);
    if(e.log.entries.length>150 || JSON.stringify(envelope).length>1000000) throw Error('Witness exceeded bounds');
    return {envelope, events:e.log.entries.filter(x=>['draw_committed','reveal_shown','race_result','race_playback_action','race_cue_displayed'].includes(x.type)).map(({seq,type,payload})=>({seq,type,payload}))};
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:4187/Quackpot/'}); await until('!!document.querySelector("#morning-setup-form")');
  const witness=makeRun(false); await evaljs(`localStorage.setItem('quackpot_save_v1', ${JSON.stringify(JSON.stringify(witness.envelope))})`);
  await send('Page.reload'); await until('!!document.querySelector(".plan44-receipt")');
  const result=await evaljs(`(() => {const list=[...document.querySelectorAll('[data-evidence-seq]')];return {rows:list.map(x=>({seq:Number(x.dataset.evidenceSeq),type:x.dataset.evidenceType,text:x.textContent})), width:innerWidth,scrollWidth:document.documentElement.scrollWidth, title:document.querySelector('.plan44-receipt h1').innerText};})()`);
  for(const e of witness.events) {const row=result.rows.find(x=>x.seq===e.seq&&x.type===e.type); if(!row) throw Error(`Missing source row ${e.type} #${e.seq}`); if(e.type==='race_playback_action' && (!row.text.includes('fixture-event-42')||!row.text.includes('123'))) throw Error('Missing seek fields'); if(e.type==='draw_committed' && (!row.text.includes('pityBefore')||!row.text.includes('drawNumberInWindow')||!row.text.includes('advancesPity'))) throw Error('Missing draw fields'); if(e.type==='race_result' && (!row.text.includes('finishTimeSeconds')||!row.text.includes('lastFinishTimeSeconds'))) throw Error('Missing finish timings'); }
  if(result.scrollWidth>result.width) { result.overflowElements=await evaljs(`[...document.querySelectorAll('*')].map(x=>({tag:x.tagName,cls:x.className,left:x.getBoundingClientRect().left,right:x.getBoundingClientRect().right,scroll:x.scrollWidth,client:x.clientWidth})).filter(x=>x.right>innerWidth+1||x.left< -1).slice(0,30)`); writeFileSync('reports/development/plan-44-production-receipt-layout-a/overflow-diagnostic.json',JSON.stringify(result,null,2)); throw Error(`Desktop overflow: ${result.width}/${result.scrollWidth}`); }
  await evaljs(`document.querySelector('.plan44-receipt summary').focus()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9}); await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
  result.keyboard=await evaljs(`({tag:document.activeElement.tagName, focusVisible:document.activeElement.matches(':focus-visible'), outline:getComputedStyle(document.activeElement).outlineStyle})`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:'\r'}); await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  result.keyboard.open=await evaljs(`document.activeElement.closest('details')?.open ?? null`);
  const pdf=await send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true}); writeFileSync('reports/development/plan-44-production-receipt-layout-a/repair-print.pdf',Buffer.from(pdf.data,'base64')); result.printBytes=Buffer.from(pdf.data,'base64').length;
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true}); await wait(150); result.narrow=await evaljs('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})'); if(result.narrow.scrollWidth>result.narrow.width) throw Error('Narrow horizontal overflow');
  const screen=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true}); writeFileSync('reports/development/plan-44-production-receipt-layout-a/repair-narrow.png',Buffer.from(screen.data,'base64'));
  const hostile=makeRun(true); await evaljs(`localStorage.setItem('quackpot_save_v1', ${JSON.stringify(JSON.stringify(hostile.envelope))})`); await send('Page.reload'); await until('!!document.querySelector(".plan44-receipt")');
  result.hostile=await evaljs(`({executed:window.plan44Attack===1, image:!!document.querySelector('.plan44-receipt img[src="x"]'),literal:document.querySelector('.plan44-receipt').textContent.includes('<img src=x onerror=')})`);
  if(result.hostile.executed||result.hostile.image||!result.hostile.literal) throw Error('Hostile text not safely rendered');
  result.witness={seed:'plan44-repair-witness',eventCount:witness.envelope.eventLog.length,sourceRows:witness.events.map(({seq,type})=>({seq,type})),seek:'harness-recorded, not observed playback',hostile:'separate engine-generated hostile display fixture, not observed playback'};
  delete result.rows; writeFileSync('reports/development/plan-44-production-receipt-layout-a/repair-browser.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result));
} finally { if(socket) socket.close(); if(child.exitCode===null && child.signalCode===null){child.kill(); await new Promise(r=>child.once('exit',r));} try{rmSync(profile,{recursive:true,force:true});}catch(e){console.error(`profile cleanup: ${e.message}`);} }


