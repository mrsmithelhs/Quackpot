// Isolated synthetic validation. Run only in the approved Job Object workspace.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { CDP } from '../../../scripts/dev/checkpoints/cdp.mjs';

const root = path.resolve('C:/AI/Quackpot/reports/development/plan-65-profile-usage-history-and-zip-export/build-candidate-08');
const manifest = await readFile('C:/AI/Quackpot/reports/development/plan-65-profile-usage-history-and-zip-export/build-candidate-08-sha256.txt','utf8');
const pins = new Map(manifest.trim().split(/\r?\n/).map(line => { const [hash, name] = line.split(/\s{2}/); return [name,hash.toLowerCase()]; }));
const hash = data => createHash('sha256').update(data).digest('hex');
for (const [name, expected] of pins) if (hash(await readFile(path.join(root,name))) !== expected) throw Error(`build pin mismatch: ${name}`);
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.wav':'audio/wav', '.txt':'text/plain', '.map':'application/json' };
const server = createServer(async (req,res) => {
  try {
    const p = new URL(req.url,'http://127.0.0.1').pathname;
    if (!p.startsWith('/Quackpot/')) { res.writeHead(404).end(); return; }
    const name = p.slice(10) || 'index.html';
    if (!pins.has(name)) { res.writeHead(404).end(); return; }
    const bytes = await readFile(path.join(root,name));
    if (hash(bytes)!==pins.get(name)) { res.writeHead(503).end(); return; }
    res.writeHead(200,{'content-type':mime[path.extname(name)]||'application/octet-stream','cache-control':'no-store','content-security-policy':"connect-src 'none'; worker-src 'none'"}); res.end(bytes);
  } catch { res.writeHead(500).end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const workspace = process.cwd(), profile = path.join(workspace,'profile'), downloads = path.join(workspace,'downloads');
await mkdir(profile); await mkdir(downloads);
const child = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','--disable-extensions','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], {windowsHide:true,stdio:'ignore'});
let cdp;
const facts = { origin, assertions:[], screenshots:[], dialogs:[], requests:'server CSP blocks connect and workers; DNS blocked except loopback; not a complete network trace' };
const assert = (condition, message) => { if (!condition) throw Error(message); facts.assertions.push(message); };
try {
  let info;
  for (let i=0;i<100;i++) { try { info=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).trim().split(/\r?\n/); break; } catch { await delay(100); } }
  if (!info) throw Error('Chrome DevTools endpoint unavailable');
  cdp = new CDP(`ws://127.0.0.1:${info[0]}${info[1]}`); await cdp.ready;
  const started = new Map(), completed = [];
  cdp.socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Browser.downloadWillBegin') started.set(message.params.guid, message.params.suggestedFilename);
    if (message.method === 'Browser.downloadProgress' && message.params.state === 'completed' && started.get(message.params.guid) === 'quackpot-usage.zip') completed.push(message.params.guid);
    if (message.method === 'Page.javascriptDialogOpening') {
      facts.dialogs.push(message.params.message);
      void cdp.send('Page.handleJavaScriptDialog',{accept:true},message.sessionId).catch(()=>{});
    }
  });
  await cdp.send('Browser.setDownloadBehavior',{behavior:'allowAndName',downloadPath:downloads,eventsEnabled:true});
  async function page() {
    const {targetId} = await cdp.send('Target.createTarget',{url:'about:blank'});
    const {sessionId} = await cdp.send('Target.attachToTarget',{targetId,flatten:true});
    await cdp.send('Page.enable',{},sessionId); await cdp.send('Runtime.enable',{},sessionId);
    await cdp.send('Page.navigate',{url:origin+'/Quackpot/'},sessionId);
    return sessionId;
  }
  async function evalAt(s, expression) { const out=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},s); if(out.exceptionDetails) throw Error(out.exceptionDetails.exception?.description||out.exceptionDetails.text); return out.result.value; }
  async function wait(s, expression) { for(let i=0;i<120;i++){if(await evalAt(s,expression))return;await delay(100);}throw Error(`timeout: ${expression}`); }
  async function click(s, text) { const find=`[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)} && !x.disabled)`; await wait(s,`Boolean(${find})`); await evalAt(s,`${find}.click()`); }
  async function name(s, value) { await wait(s,`Boolean(document.querySelector('.qp-welcome input'))`); await evalAt(s,`(()=>{const x=document.querySelector('.qp-welcome input');x.value=${JSON.stringify(value)};x.dispatchEvent(new Event('input',{bubbles:true}));})()`); }
  async function screenshot(s, label) { const image=await cdp.send('Page.captureScreenshot',{format:'png'},s); await writeFile(path.join(workspace,`${label}.png`),Buffer.from(image.data,'base64')); facts.screenshots.push(label); }
  async function local(s, key) { return evalAt(s,`localStorage.getItem(${JSON.stringify(key)})`); }
  const a=await page(); await wait(a,`document.querySelector('.qp-welcome')!==null`);
  await click(a,'Start'); await name(a,'Synthetic A'); await click(a,'Continue'); await wait(a,`Boolean(document.querySelector('#btn-uninstall'))`);
  await click(a,'❌ Uninstall'); await click(a,'Leave Anyway (Uninstall)'); await wait(a,`Boolean(document.querySelector('#receipt-paper'))`); await click(a,'Back to welcome');
  await click(a,'Start another run'); await name(a,'Synthetic B'); await click(a,'Continue'); await click(a,'Cancel'); await click(a,'View Receipt'); await wait(a,`Boolean(document.querySelector('#receipt-paper'))`); assert(true,'cancel retains accessible Receipt');
  await click(a,'Back to welcome'); await click(a,'Start another run'); await name(a,'Synthetic B'); await click(a,'Continue'); await click(a,'Start another run'); await wait(a,`document.body.innerText.includes('Synthetic B')`);
  await cdp.send('Page.reload',{},a); await wait(a,`[...document.querySelectorAll('button')].some(x=>x.textContent.trim()==='Continue')`); await click(a,'Continue'); await wait(a,`document.body.innerText.includes('Synthetic B')`); assert(true,'confirmed restart reloads and continues');
  await click(a,'❌ Uninstall'); await click(a,'💎 Take 80 Gems & Stay'); await click(a,'❌ Uninstall'); await click(a,'Leave Anyway (Uninstall)'); await wait(a,`Boolean(document.querySelector('#receipt-paper'))`); await click(a,'Back to welcome');
  await click(a,'Download usage file'); for(let i=0;i<100 && completed.length<1;i++)await delay(100);
  assert(completed.length===1,'first actual Welcome download completed');
  await click(a,'Download usage file'); for(let i=0;i<100 && completed.length<2;i++)await delay(100);
  assert(completed.length===2,'second actual Welcome download completed'); facts.downloads=completed;
  const savedBefore=await local(a,'quackpot_save_v1'); await click(a,'Settings'); await click(a,'Clear usage history'); await click(a,'Cancel'); assert((await local(a,'quackpot_usage_history_v1'))!==null,'cancel retains history'); await click(a,'Clear usage history'); await click(a,'Clear history'); await wait(a,`document.body.innerText.includes('Usage history cleared.')`); assert((await local(a,'quackpot_save_v1'))===savedBefore,'clear leaves primary bytes unchanged'); await screenshot(a,'clear-confirmed'); await click(a,'Done');
  await cdp.send('Page.reload',{},a); await wait(a,`[...document.querySelectorAll('button')].some(x=>x.textContent.trim()==='View Receipt')`); await click(a,'View Receipt'); await wait(a,`Boolean(document.querySelector('#receipt-paper'))`); assert(true,'saved terminal Receipt remains accessible after clear');
  await screenshot(a,'receipt-after-clear');
  // Stale tab: both tabs read same terminal primary; a confirmed restart in A changes it.
  await click(a,'Back to welcome'); const b=await page(); await wait(b,`[...document.querySelectorAll('button')].some(x=>x.textContent.trim()==='View Receipt')`);
  await click(a,'Start another run'); await name(a,'Synthetic C'); await click(a,'Continue'); await click(a,'Start another run'); await wait(a,`document.body.innerText.includes('Synthetic C')`);
  const after=await local(a,'quackpot_save_v1'); await evalAt(b,`setTimeout(()=>[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='View Receipt').click(),0);true`); await delay(250);
  await delay(100);
  assert(facts.dialogs.some(message => /changed|could not be read/i.test(message)), 'stale tab reports changed saved data');
  assert((await local(a,'quackpot_save_v1'))===after,'stale tab does not change newer primary');
  await writeFile(path.join(workspace,'observations.json'),JSON.stringify(facts,null,2));
  console.log(JSON.stringify(facts));
} catch (error) {
  facts.error = error?.stack || String(error);
  await writeFile(path.join(workspace,'observations.json'),JSON.stringify(facts,null,2));
  throw error;
} finally {
  try { await cdp?.send('Browser.close'); } catch {}
  cdp?.close();
  await new Promise(resolve => server.close(resolve));
  if (child.exitCode===null) child.kill();
}
