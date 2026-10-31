import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os'; import path from 'node:path'; import net from 'node:net';
const profile = mkdtempSync(path.join(os.tmpdir(), 'qp38-browser-'));
const previewPort = 4189, debugPort = 9239; const width = process.argv.includes('--narrow') ? 390 : 1280;
const pause = ms => new Promise(r => setTimeout(r, ms));
const free = port => new Promise((resolve, reject) => { const s = net.createServer(); s.once('error', reject); s.listen(port, '127.0.0.1', () => s.close(resolve)); });
const until = async fn => { for (let i=0;i<100;i++) { try { const v=await fn(); if(v) return v; } catch {} await pause(100); } throw Error('Timed out waiting for browser'); };
let server, chrome, ws;
try {
  await free(previewPort); await free(debugPort);
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(previewPort),'--strictPort'], {stdio:'ignore'});
  const url = `http://127.0.0.1:${previewPort}/Quackpot/`;
  await until(async () => (await fetch(url)).ok);
  chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${debugPort}`,'--remote-allow-origins=*',`--user-data-dir=${profile}`,'--window-size=1280,800',url], {stdio:['ignore','ignore','pipe']});
  chrome.stderr.on('data', chunk => process.stderr.write(chunk)); chrome.on('error', error => process.stderr.write(String(error)));
  const target = await until(async () => (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).find(x => x.type==='page' && x.url.startsWith(url)));
  ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  let seq=0; const pending=new Map(); ws.onmessage=({data})=>{const m=JSON.parse(data);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.delete(id))reject(Error(`CDP timeout ${method}`))},5000)});
  const evalPage=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
  await send('Page.enable'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:process.argv.includes('--motion') ? 'no-preference' : 'reduce'}]});
  await until(()=>evalPage('Boolean(document.querySelector("#morning-setup-form"))'));
  const click=async selector=>{await until(()=>evalPage(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)); await evalPage(`document.querySelector(${JSON.stringify(selector)}).click()`); await pause(150)};
  const byText=async text=>{await until(()=>evalPage(`[...document.querySelectorAll('button')].some(b=>b.textContent.includes(${JSON.stringify(text)}))`)); await evalPage(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`); await pause(150)};
  const expectHud=async (cash, health)=>{const v=await evalPage(`({cash:document.querySelector("#hud-cash")?.innerText,health:document.querySelector("#hud-health")?.innerText})`);if(!v.cash.includes(cash)||!v.health.includes(health))throw Error(`Unexpected HUD ${JSON.stringify(v)} expected ${cash}/${health}`);};
  const snapshot=async label=>{const x=await evalPage(`({text:document.querySelector('#main-content')?.innerText,clock:document.querySelector('#hud-clock')?.innerText,cash:document.querySelector('#hud-cash')?.innerText,health:document.querySelector('#hud-health')?.innerText})`);console.log(JSON.stringify({label,...x}));};
  const key=async (name,code,num,text)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code,windowsVirtualKeyCode:num,...(text?{text}: {})});await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code,windowsVirtualKeyCode:num});};
  const tabClick=async expression=>{
    for(let n=0;n<80;n++){
      if(await evalPage(`document.activeElement === (${expression})`)){await key('Enter','Enter',13,'\r');await pause(150);return;}
      await key('Tab','Tab',9); await pause(15);
    }
    throw Error(`Keyboard could not reach ${expression}`);
  };
  await tabClick(`document.querySelector('#morning-setup-form button[type=submit]')`); await snapshot('keyboard setup');
  await tabClick(`document.querySelector('[data-obj="plate"]')`);
  await tabClick(`document.querySelector('[data-act="decline"]')`);
  await tabClick(`document.querySelector('[data-act="done"]')`);
  await tabClick(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Go to work'))`);
  await snapshot('keyboard afternoon'); await expectHud('80.00','95');
  await tabClick(`document.querySelector('[data-obj="phone"]')`);
  await tabClick(`document.querySelector('[data-act="toggle"]')`);
  await tabClick(`document.querySelector('[data-act="confirm"]')`);
  await tabClick(`document.querySelector('[data-act="done"]')`);
  await snapshot('keyboard work completed'); await expectHud('140.00','95');
} finally {
  try { ws?.close(); } catch {}
  if(chrome?.pid) spawnSync('taskkill.exe',['/PID',String(chrome.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
  if(server?.pid) spawnSync('taskkill.exe',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
  try { rmSync(profile,{recursive:true,force:true}); } catch {}
}
