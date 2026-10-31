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
  const snapImage=async () => {};
  const assertPage=async (expression, message)=>{if(!(await evalPage(expression))) throw Error(message);};
  const skip=process.argv.includes('--skip');
  await click('#morning-setup-form button[type=submit]'); await snapshot('kitchen initial'); await snapImage('kitchen-before');
  await assertPage(`document.querySelector('[data-obj="notice"]')?.getAttribute('aria-disabled')==='true' && !!document.querySelector('[data-obj="plate"]')`, 'Kitchen must contain plate and initially inactive notice');
  await click('[data-obj="plate"]'); await click(skip ? '[data-act="decline"]' : '[data-act="confirm"]'); await click('[data-act="done"]'); await pause(400);
  await assertPage(`document.querySelector('[data-obj="notice"]')?.getAttribute('aria-disabled')!=='true' && document.activeElement?.dataset.obj==='notice'`, 'Notice must become available and focused');
  await snapshot('kitchen focus'); await snapImage('kitchen-after');
  await byText('The desk'); await snapshot('morning phone'); await snapImage('morning-desk');
  await assertPage(`document.querySelectorAll('[data-obj="phone"]').length===1 && !document.querySelector('[data-obj="work-phone"]')`, 'Expected one phone hotspot');
  const noReply=process.argv.includes('--no-reply');
  await click('[data-obj="phone"]'); await click('[data-act="toggle"]');
  await assertPage(`document.querySelector('.life-held').innerText.includes('Reply LAUNCH')`, 'Missing launch invitation');
  if (noReply) { await click('[data-act="back"]'); await pause(350); }
  else {
    await click('[data-act="confirm"]');
    await assertPage(`document.querySelector('.life-phone-body').innerText.includes('LAUNCH') && document.querySelector('.life-phone-body').innerText.includes('on the list')`, 'Reply and acknowledgment must be visible');
    await click('[data-act="done"]'); await click('[data-obj="phone"]');
    await assertPage(`document.querySelector('.life-phone-body').innerText.includes('on the list')`, 'Conversation did not persist on reinspection');
    await click('#btn-open-settings'); await click('[data-settings-done]'); await click('#btn-uninstall'); await click('#btn-retention-stay');
    await assertPage(`JSON.parse(localStorage.getItem('quackpot_save_v1')).eventLog.filter(e=>e.payload?.kind==='launch_reply_acknowledgment').length===1`, 'Covered rerender duplicated acknowledgment');
    await send('Page.reload'); await until(()=>evalPage(`Boolean(document.querySelector('.life-day-bar'))`)); await byText('The desk'); await click('[data-obj="phone"]');
    await assertPage(`document.querySelector('.life-phone-body').innerText.includes('on the list')`, 'Conversation did not survive reload');
    await click('[data-act="toggle"]'); await click('[data-act="back"]'); await pause(350);
  }
  await assertPage(`(()=>{let x=JSON.parse(localStorage.getItem('quackpot_save_v1'));return x.state.tenPullCommitted===false && !x.eventLog.some(e=>e.payload?.kind==='fictional_install') && x.eventLog.filter(e=>e.payload?.kind==='launch_reply').length===${noReply ? 0 : 1} && x.eventLog.filter(e=>e.payload?.kind==='launch_reply_acknowledgment').length===${noReply ? 0 : 1}})()`, 'Launch message changed entitlement or fabricated evidence');
  await expectHud(skip?'80.00':'74.00',skip?'95':'100');
  await assertPage(`!JSON.parse(localStorage.getItem('quackpot_save_v1')).eventLog.some(e=>e.payload?.kind==='quackpot_opened')`, 'Morning installation must not count as app entry');
  await byText('The living room'); await assertPage(`!document.querySelector('[data-obj="couch-sale"]') && !document.querySelector('[data-obj="tv-sale"]')`, 'Sales appeared before first app entry'); await snapImage('living-before');
  await byText('The kitchen'); await until(()=>evalPage(`[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Go to work'))`));
  await evalPage(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Go to work'));b.click();b.click();})()`); await pause(150);
  await assertPage(`JSON.parse(localStorage.getItem('quackpot_save_v1')).eventLog.filter(e=>e.type==='life_work_agreed').length===1`, 'Departure was duplicated');
  await snapshot('departed'); await snapImage('afternoon-desk');
  await assertPage(`document.querySelectorAll('[data-obj="phone"]').length===1 && !document.querySelector('[data-obj="work-phone"]')`, 'Phone hotspots overlap');
  await expectHud(skip?'80.00':'74.00',skip?'95':'100'); await send('Page.reload'); await until(()=>evalPage(`Boolean(document.querySelector('[data-obj="phone"]'))`));
  await click('[data-obj="phone"]'); await click('[data-act="toggle"]'); await click('[data-act="confirm"]'); await click('[data-act="done"]'); await expectHud(skip?'140.00':'134.00',skip?'95':'100');
  await byText('Continue to evening'); await snapshot('returned to dinner'); await snapImage('evening-kitchen');
  await assertPage(`document.querySelector('[data-place="kitchen-breakfast"]') && document.querySelector('[data-obj="plate"]') && document.querySelector('[data-obj="notice"]')`, 'Day1 return should show dinner and notice in the kitchen');
  await click('[data-obj="plate"]'); await click('[data-act="confirm"]'); await click('[data-act="done"]');
  await byText('The desk'); await snapImage('evening-desk'); await click('[data-obj="phone"]');
  await until(()=>evalPage(`Boolean(document.querySelector('[data-life-phone="welcome"]'))`)); await snapshot('direct app opening');
  await assertPage(`JSON.parse(localStorage.getItem('quackpot_save_v1')).eventLog.filter(e=>e.payload?.kind==='quackpot_opened').length===1`, 'First entry was not recorded exactly once');
  await click('[data-life-phone="welcome"]'); await assertPage(`JSON.parse(localStorage.getItem('quackpot_save_v1')).eventLog.filter(e=>e.type==='draw_committed').length===10`, 'Expected exactly ten committed draws'); await click('#btn-return-apartment'); await until(()=>evalPage(`Boolean(document.querySelector('[data-obj="phone"]'))`));
  await click('[data-obj="phone"]'); await until(()=>evalPage(`Boolean(document.querySelector('#btn-reveal-all'))`)); await snapshot('committed pull resumed');
  await click('#btn-reveal-all'); await pause(500); await click('#btn-gacha-proceed'); await click('#btn-return-apartment'); await until(()=>evalPage(`Boolean(document.querySelector('[data-obj="phone"]'))`));
  await byText('The living room'); await assertPage(`!!document.querySelector('[data-obj="couch-sale"]') && !!document.querySelector('[data-obj="tv-sale"]')`, 'Sales unavailable after first app entry'); await snapImage('living-after');
  await click('[data-obj="couch-sale"]'); await click('[data-act="confirm"]'); await click('[data-act="done"]'); await snapImage('living-sold');
  await assertPage(`!document.querySelector('[data-obj="couch-sale"]')`, 'Sold couch still offered');
  await click('#btn-uninstall'); await click('#btn-retention-leave'); await snapshot('terminal');
} finally {
  try { ws?.close(); } catch {}
  if(chrome?.pid) spawnSync('taskkill.exe',['/PID',String(chrome.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
  if(server?.pid) spawnSync('taskkill.exe',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
  try { rmSync(profile,{recursive:true,force:true}); } catch {}
}
