// Focused Plan 25 keyboard activation probe against the already-built dist bundle.
// Uses one isolated Chrome profile, local preview, and bounded runner; does not edit product code.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.resolve('reports/development/plan-25-desk-phone-art-integration');
mkdirSync(outputDir, { recursive: true });
const profile = mkdtempSync(path.join(os.tmpdir(), 'quackpot-plan25-keyboard-'));
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const previewPort = 4174;
const debugPort = 9223;
const timeoutMs = 30000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let preview;
let chrome;
let ws;
let targetDiscovery = 'not started';
let chromeError = null;
let chromeExit = null;
let chromeStderr = '';
let cleanup = {};
let diagnostic = {};
let overallTimer;
let pending = new Map();

function waitForExit(child, timeout = 3000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return Promise.race([new Promise((resolve) => child.once('close', () => resolve(true))), delay(timeout).then(() => false)]);
}
async function stopOwnedChild(child, tree = false) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return true;
  if (tree && process.platform === 'win32' && child.pid) {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    await Promise.race([new Promise((resolve) => killer.once('close', resolve)), delay(3000)]);
    if (killer.exitCode === null && killer.signalCode === null) killer.kill();
  } else child.kill();
  return waitForExit(child);
}
function assertPortFree(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (error) => reject(new Error(`Refusing to use busy port ${port}: ${error.message}`)));
    server.listen(port, '127.0.0.1', () => server.close((error) => error ? reject(error) : resolve()));
  });
}
async function fetchJson(url, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
    return response.json();
  } finally { clearTimeout(timer); }
}
async function ready(url) {
  try { return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok; } catch { return false; }
}
async function until(fn, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await fn();
    if (value) return value;
    await delay(100);
  }
  throw new Error(`Probe wait exceeded ${timeout}ms`);
}
function buildAssets() {
  const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  return [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]).filter((name) => name.includes('/assets/')).map((name) => {
    const asset = path.basename(name);
    return { name: asset, sha256: createHash('sha256').update(readFileSync(path.join(root, 'dist/assets', asset))).digest('hex') };
  });
}
function rejectPending(error) {
  for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(error); }
  pending.clear();
}

try {
  overallTimer = setTimeout(() => {
    rejectPending(new Error(`Keyboard probe exceeded ${timeoutMs}ms`));
    try { ws?.close(); } catch {}
    void stopOwnedChild(chrome, true);
    void stopOwnedChild(preview);
  }, timeoutMs);
  await assertPortFree(previewPort);
  await assertPortFree(debugPort);
  const assets = buildAssets();
  preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'], { cwd: root, stdio: 'ignore' });
  const url = `http://127.0.0.1:${previewPort}/Quackpot/`;
  await until(() => ready(url));
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`, '--remote-allow-origins=*',
    `--user-data-dir=${profile}`, '--window-size=1280,800', url,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  chrome.on('error', (error) => { chromeError = error.message; });
  chrome.stderr.on('data', (chunk) => { chromeStderr = (chromeStderr + chunk.toString('utf8')).slice(-8192); });
  chrome.on('exit', (code, signal) => { chromeExit = { code, signal }; });
  const target = await until(async () => {
    if (chromeError) throw new Error(`Chrome launch failed: ${chromeError}`);
    if (chromeExit) throw new Error(`Chrome exited before target discovery: ${JSON.stringify(chromeExit)}; ${chromeStderr}`);
    try {
      const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
      const page = targets.find((entry) => entry.type === 'page' && entry.url.startsWith(url));
      targetDiscovery = page ? 'target found' : `endpoint responded without ${url}`;
      return page;
    } catch (error) { targetDiscovery = String(error.message || error).slice(0, 500); return null; }
  }, 15000);
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('CDP WebSocket connection failed')); }),
    delay(5000).then(() => { throw new Error('CDP WebSocket open timed out'); }),
  ]);
  let nextId = 1;
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    message.error ? entry.reject(new Error(message.error.message)) : entry.resolve(message.result);
  };
  ws.onerror = () => rejectPending(new Error('CDP WebSocket error'));
  ws.onclose = () => rejectPending(new Error('CDP WebSocket closed'));
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP ${method} exceeded 5000ms`)); }, 5000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result?.value;
  };
  const enter = async () => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await until(() => evaluate('Boolean(document.querySelector("#btn-start-app"))'));
  const assetsReady = buildAssets();
  const pageReady = await evaluate(`(() => { const b=document.querySelector('#btn-start-app'); return {buttonExists:!!b,buttonDisabled:b?.disabled,formId:b?.form?.id,activeElement:document.activeElement?.id}; })()`);
  diagnostic = { buildAssets: assetsReady, pageReady };
  if (!pageReady.buttonExists || pageReady.buttonDisabled || pageReady.formId !== 'desk-companion-form') throw new Error(`Product setup is not probe-ready: ${JSON.stringify(pageReady)}`);
  const installRecorder = await evaluate(`(() => {
    window.__qpKeyEvents=[];
    const wanted=new Set(['keydown','keypress','keyup','click','submit']);
    const record=(phase)=>(event)=>{
      if (!wanted.has(event.type) || window.__qpKeyEvents.length>=50) return;
      const target=event.target,button=target?.closest?.('#btn-start-app,[data-native-enter-control]');
      const form=target?.closest?.('form');
      if (!button && !form?.matches('#desk-companion-form,[data-native-enter-form]')) return;
      window.__qpKeyEvents.push({phase,type:event.type,isTrusted:event.isTrusted,key:event.key||null,code:event.code||null,target:target?.id||target?.tagName||null,button:button?.id||null,form:form?.id||null,defaultPrevented:event.defaultPrevented});
    };
    for(const type of wanted){ document.addEventListener(type,record('capture'),true); document.addEventListener(type,record('bubble'),false); }
    const form=document.createElement('form'); form.id='native-enter-probe-form'; form.setAttribute('data-native-enter-form','');
    const button=document.createElement('button'); button.type='submit'; button.id='native-enter-probe-button'; button.setAttribute('data-native-enter-control',''); button.textContent='Native Enter positive control';
    form.append(button); document.body.append(form);
    form.addEventListener('submit',event=>event.preventDefault());
    return {installed:true};
  })()`);
  diagnostic.recorder = installRecorder;
  const eventRecords = () => evaluate('window.__qpKeyEvents.slice(0,50)');
  const controlReady = await evaluate(`(() => { const b=document.querySelector('#native-enter-probe-button'); b.focus(); return {active:document.activeElement.id,formId:b.form?.id,disabled:b.disabled}; })()`);
  if (controlReady.active !== 'native-enter-probe-button' || controlReady.formId !== 'native-enter-probe-form' || controlReady.disabled) throw new Error(`Positive control is not keyboard ready: ${JSON.stringify(controlReady)}`);
  await enter();
  const controlEvents = await until(async () => { const events = await eventRecords(); return events.some((event) => event.type === 'submit' && event.form === 'native-enter-probe-form') ? events : null; }, 2000);
  const control = { ready: controlReady, events: controlEvents.filter((event) => event.form === 'native-enter-probe-form' || event.button === 'native-enter-probe-button') };
  diagnostic.control = control;
  if (!control.events.some((event) => event.type === 'click' && event.button === 'native-enter-probe-button')
      || !control.events.some((event) => event.type === 'submit' && event.defaultPrevented)) throw new Error(`Native positive control did not activate and submit: ${JSON.stringify(control)}`);
  await evaluate(`(() => { document.querySelector('#native-enter-probe-form').remove(); window.__qpKeyEvents=[]; const b=document.querySelector('#btn-start-app'); b.focus(); return {active:document.activeElement.id,formId:b.form?.id,disabled:b.disabled}; })()`);
  const productReady = await evaluate(`(() => { const b=document.querySelector('#btn-start-app'); return {active:document.activeElement.id,formId:b.form?.id,disabled:b.disabled}; })()`);
  diagnostic.productReady = productReady;
  if (productReady.active !== 'btn-start-app' || productReady.formId !== 'desk-companion-form' || productReady.disabled) throw new Error(`Product control changed before activation: ${JSON.stringify(productReady)}`);
  await enter();
  let productTransition = false;
  const start = Date.now();
  while (Date.now() - start < 2500) {
    const state = await evaluate(`(() => ({events:window.__qpKeyEvents.slice(0,50),desk:!!document.querySelector('.apartment-desk-scene'),gacha:!!document.querySelector('#btn-claim-pull')}))()`);
    if (state.events.some((event) => event.type === 'submit' && event.form === 'desk-companion-form') || !state.desk || state.gacha) {
      productTransition = !state.desk || state.gacha;
      const product = { ready: productReady, transitioned: productTransition, deskPresent: state.desk, gachaPresent: state.gacha, events: state.events };
      diagnostic.product = product;
      const record = { browser: 'Chrome isolated temporary profile', build: 'existing dist bundle; no rebuild', buildAssets: assetsReady, pageReady, recorder: installRecorder, control, product, limits: { eventCap: 50, productWaitMs: Date.now() - start } };
      if (!product.events.some((event) => event.type === 'click' && event.button === 'btn-start-app')
          || !product.events.some((event) => event.type === 'submit' && event.form === 'desk-companion-form' && event.defaultPrevented)
          || !productTransition) throw new Error(`Product keyboard activation did not complete: ${JSON.stringify(record)}`);
      writeFileSync(path.join(outputDir, 'keyboard-activation-probe.json'), JSON.stringify(record, null, 2));
      console.log(JSON.stringify(record, null, 2));
      break;
    }
    await delay(100);
  }
  if (!productTransition) { diagnostic.productEvents = await eventRecords(); throw new Error(`Product Enter probe produced no complete transition; events=${JSON.stringify(diagnostic.productEvents)}`); }
  ws.close();
} catch (error) {
  const failure = {
    occurredAt: new Date().toISOString(),
    error: String(error?.stack || error).slice(0, 12000),
    diagnostic,
    buildAssets: (() => { try { return buildAssets(); } catch (assetError) { return { error: String(assetError.message || assetError) }; } })(),
    targetDiscovery,
    chromeExit,
    chromeStderr,
  };
  writeFileSync(path.join(outputDir, 'keyboard-activation-probe-failure.json'), JSON.stringify(failure, null, 2));
  throw error;
} finally {
  clearTimeout(overallTimer);
  rejectPending(new Error('Keyboard probe cleanup'));
  try { ws?.close(); } catch {}
  const chromeStopped = await stopOwnedChild(chrome, true);
  const previewStopped = await stopOwnedChild(preview);
  cleanup = { chromeStopped, previewStopped };
  if (chromeStopped && previewStopped) {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); cleanup.profileRemoved = true; }
    catch (error) { cleanup.profileError = error.message; }
  } else cleanup.profilePreserved = true;
  console.log(JSON.stringify({ cleanup }));
}
