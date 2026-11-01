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
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:4187/Quackpot/'}); await until('!!document.querySelector("#morning-setup-form")');
  await evaljs('document.querySelector("#morning-setup-form button[type=submit]").click()'); await until('!!document.querySelector("#btn-uninstall")');
  await evaljs('document.querySelector("#btn-uninstall").click()'); await until('!!document.querySelector("#btn-retention-leave")');
  await evaljs('document.querySelector("#btn-retention-leave").click()'); await until('!!document.querySelector(".plan44-receipt")');
  const capture=async name => {const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true}); writeFileSync(`reports/development/plan-44-production-receipt-layout-a/${name}.png`,Buffer.from(r.data,'base64'));};
  await capture('desktop');
  const checks={}; checks.desktop=await evaljs('({title:document.querySelector(".plan44-receipt h1").textContent,route:document.querySelector(".plan44-receipt header").innerText,details:document.querySelectorAll(".plan44-receipt details").length,overflow:document.documentElement.scrollWidth>innerWidth})');
  checks.keyboard=await evaljs(`(() => {const s=document.querySelector('.plan44-receipt summary');s.focus();return {focused:document.activeElement===s,outline:getComputedStyle(s).outlineStyle};})()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13,text:'\r'}); await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});
  checks.keyboard.open=await evaljs('document.querySelector(".plan44-receipt details").open');
  checks.print=await evaljs(`(() => {const all=[...document.querySelectorAll('.plan44-receipt details')];const before=all.map(x=>x.open);window.dispatchEvent(new Event('beforeprint'));const during=all.every(x=>x.open);window.dispatchEvent(new Event('afterprint'));return {during,restored:all.every((x,i)=>x.open===before[i])};})()`);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true}); await wait(200); checks.narrow=await evaljs('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})'); await capture('narrow');
  writeFileSync('reports/development/plan-44-production-receipt-layout-a/browser-check.json',JSON.stringify(checks,null,2)); console.log(JSON.stringify(checks));
} finally { if(socket) socket.close(); if (child.exitCode === null && child.signalCode === null) { child.kill(); await new Promise(r => child.once('exit',r)); } try {rmSync(profile,{recursive:true,force:true});} catch(e) {console.error(`profile cleanup: ${e.message}`);} }



