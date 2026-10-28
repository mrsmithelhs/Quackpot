// Isolated Plan 25 production desk lifecycle witness. Uses a temporary Chrome profile and local preview only.
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.resolve('reports/development/plan-25-desk-phone-art-integration');
mkdirSync(outputDir, { recursive: true });
const profile = mkdtempSync(path.join(os.tmpdir(), 'quackpot-plan25-'));
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const previewPort = 4174;
const debugPort = 9223;
let preview;
let chrome;
let ws;
let overallTimer;
let pending = new Map();
let chromeStopPromise;
let previewStopPromise;
let previewError = null;
let chromeError = null;
let chromeExit = null;
let chromeStderr = '';
let targetDiscoveryError = 'not started';
const CHROME_STDERR_LIMIT = 8192;
const RUN_TIMEOUT_MS = 90000;
const SOCKET_TIMEOUT_MS = 5000;
const COMMAND_TIMEOUT_MS = 6000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function rejectPending(error) {
  for (const entry of pending.values()) {
    clearTimeout(entry.timer);
    entry.reject(error);
  }
  pending.clear();
}

async function until(fn, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await fn();
    if (value) return value;
    await delay(100);
  }
  throw new Error(`Timed out after ${timeout}ms`);
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
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchReady(url, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function waitForExit(child, timeout = 3000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return Promise.race([
    new Promise((resolve) => child.once('close', () => resolve(true))),
    delay(timeout).then(() => false),
  ]);
}

async function stopOwnedChild(child, processTree = false) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return true;
  if (processTree && process.platform === 'win32' && child.pid) {
    const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    killer.on('error', () => {});
    await Promise.race([new Promise((resolve) => killer.once('close', resolve)), delay(3000)]);
    if (killer.exitCode === null && killer.signalCode === null) killer.kill();
  } else {
    child.kill();
  }
  return waitForExit(child);
}

function stopOwnedChrome() {
  if (!chromeStopPromise) chromeStopPromise = stopOwnedChild(chrome, true);
  return chromeStopPromise;
}

function stopOwnedPreview() {
  if (!previewStopPromise) previewStopPromise = stopOwnedChild(preview);
  return previewStopPromise;
}

function currentBuildAssets() {
  const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => reference.includes('/assets/'));
  return references.map((reference) => {
    const name = path.basename(reference);
    const assetPath = path.join(root, 'dist/assets', name);
    const hash = createHash('sha256').update(readFileSync(assetPath)).digest('hex');
    return { name, sha256: hash };
  });
}

try {
  overallTimer = setTimeout(() => {
    const error = new Error(`Overall Plan 25 browser witness exceeded ${RUN_TIMEOUT_MS}ms`);
    rejectPending(error);
    try { ws?.close(); } catch {}
    void stopOwnedChrome();
    void stopOwnedPreview();
  }, RUN_TIMEOUT_MS);
  await assertPortFree(previewPort);
  await assertPortFree(debugPort);
  preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'], { cwd: root, stdio: 'ignore' });
  preview.on('error', (error) => { previewError = error; });
  const url = `http://127.0.0.1:${previewPort}/Quackpot/`;
  await until(async () => { if (previewError) throw new Error(`Vite preview launch failed: ${previewError.message}`); return fetchReady(url); });
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`, '--remote-allow-origins=*',
    `--user-data-dir=${profile}`, '--window-size=1280,800', url,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  chrome.on('error', (error) => { chromeError = error; });
  chrome.stderr.on('data', (chunk) => {
    chromeStderr = (chromeStderr + chunk.toString('utf8')).slice(-CHROME_STDERR_LIMIT);
  });
  chrome.on('exit', (code, signal) => { chromeExit = { code, signal }; });
  let target;
  try {
    target = await until(async () => {
      if (chromeError) throw new Error(`Chrome launch failed: ${chromeError.message}`);
      if (chromeExit) throw new Error(`Chrome exited before target discovery (code=${chromeExit.code}, signal=${chromeExit.signal}); stderr=${chromeStderr || '(empty)'}`);
      try {
        const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
        const pageTarget = targets.find((item) => item.type === 'page' && item.url.startsWith(url));
        targetDiscoveryError = pageTarget ? 'target found' : `debug endpoint responded but no page target matched ${url}`;
        return pageTarget;
      } catch (error) {
        targetDiscoveryError = String(error?.message || error).slice(0, 500);
        return null;
      }
    });
  } catch (error) {
    throw new Error(`${error.message}; last target-discovery detail: ${targetDiscoveryError}; Chrome exit: ${JSON.stringify(chromeExit)}; stderr: ${chromeStderr || '(empty)'}`);
  }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await Promise.race([
    new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = () => reject(new Error('CDP WebSocket connection failed'));
    }),
    delay(SOCKET_TIMEOUT_MS).then(() => { throw new Error(`CDP WebSocket open timed out after ${SOCKET_TIMEOUT_MS}ms`); }),
  ]);
  let nextId = 1;
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const entry = pending.get(message.id);
    if (entry) {
      pending.delete(message.id);
      clearTimeout(entry.timer);
      message.error ? entry.reject(new Error(message.error.message)) : entry.resolve(message.result);
    }
  };
  ws.onerror = () => rejectPending(new Error('CDP WebSocket reported an error'));
  ws.onclose = () => rejectPending(new Error('CDP WebSocket closed before the run completed'));
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP command "${method}" timed out after ${COMMAND_TIMEOUT_MS}ms`));
    }, COMMAND_TIMEOUT_MS);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result?.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await until(async () => evaluate('Boolean(document.querySelector("#btn-start-app"))'));
  const fresh = await evaluate(`(() => {
    const scene = document.querySelector('.apartment-desk-scene');
    const phone = document.querySelector('.apartment-phone-content');
    const button = document.querySelector('#btn-start-app');
    return { heading: document.querySelector('.apartment-phone-heading')?.textContent, message: document.querySelector('.apartment-phone-message')?.textContent,
      scene: scene && { width: scene.getBoundingClientRect().width, height: scene.getBoundingClientRect().height },
      button: button && { type: button.type, label: button.getAttribute('aria-label'), rect: (() => { const r=button.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })() },
      phoneRect: phone && (() => { const r=phone.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })(), overflow: document.documentElement.scrollWidth > innerWidth,
      controls: [...document.querySelectorAll('#companion-name-input,#desk-autosave-checkbox')].map((el) => el.id), svgText: scene?.querySelector('svg')?.textContent?.trim() || '' };
  })()`);
  await send('Page.captureScreenshot', { format: 'png' }).then(({ data }) => writeFileSync(path.join(outputDir, 'desk-desktop.png'), Buffer.from(data, 'base64')));
  await evaluate(`(() => { const input=document.querySelector('#companion-name-input'); input.value='Ada'; input.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#btn-start-app').click(); })()`);
  await until(async () => !(await evaluate('Boolean(document.querySelector(".apartment-desk-scene"))')));
  await evaluate('location.reload()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-return-apartment"))'));
  const afterReload = await evaluate(`({ title: document.querySelector('.hud-companion-info')?.textContent.trim(), step: window.GameEngine ? 'engine-present' : 'no-engine', desk: Boolean(document.querySelector('.apartment-desk-scene')) })`);
  await evaluate('document.querySelector("#btn-return-apartment").click()');
  await until(async () => evaluate('Boolean(document.querySelector("#btn-start-app"))'));
  const returned = await evaluate(`({ heading: document.querySelector('.apartment-phone-heading')?.textContent, message: document.querySelector('.apartment-phone-message')?.textContent,
    companion: document.querySelector('.apartment-desk-copy')?.textContent.includes('Ada'), action: document.querySelector('#btn-start-app')?.textContent.trim(),
    overflow: document.documentElement.scrollWidth > innerWidth })`);

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 520, deviceScaleFactor: 1, mobile: true });
  const narrow = await evaluate(`(() => { const scene=document.querySelector('.apartment-desk-scene'), button=document.querySelector('#btn-start-app'); const r=button.getBoundingClientRect(); return { width: innerWidth, pageWidth: document.documentElement.scrollWidth,
    sceneWidth: scene.getBoundingClientRect().width, buttonWidth: r.width, buttonHeight: r.height, buttonVisible: r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth, overflow: document.documentElement.scrollWidth>innerWidth }; })()`);
  await send('Page.captureScreenshot', { format: 'png' }).then(({ data }) => writeFileSync(path.join(outputDir, 'desk-narrow.png'), Buffer.from(data, 'base64')));
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
  const tiny = await evaluate(`(() => { const button=document.querySelector('#btn-start-app'); const r=button.getBoundingClientRect(); return { width: innerWidth, buttonVisible:r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth, buttonTop:r.top, sceneBottom:document.querySelector('.apartment-desk-scene').getBoundingClientRect().bottom, overflow:document.documentElement.scrollWidth>innerWidth }; })()`);
  const record = { browser: 'Chrome isolated temporary profile', build: 'local Vite preview from current production build', buildAssets: currentBuildAssets(), motion: 'prefers-reduced-motion: reduce', fresh, afterReload, returned, narrow, tiny };
  writeFileSync(path.join(outputDir, 'browser-lifecycle.json'), JSON.stringify(record, null, 2));
  ws.close();
  console.log(JSON.stringify(record, null, 2));
} catch (error) {
  const failure = {
    occurredAt: new Date().toISOString(),
    error: String(error?.stack || error).slice(0, 12000),
    buildAssets: (() => { try { return currentBuildAssets(); } catch (assetError) { return { error: String(assetError?.message || assetError) }; } })(),
    targetDiscoveryError,
    chromeExit,
    chromeStderr,
  };
  writeFileSync(path.join(outputDir, 'browser-lifecycle-failure.json'), JSON.stringify(failure, null, 2));
  throw error;
} finally {
  clearTimeout(overallTimer);
  rejectPending(new Error('Plan 25 browser witness is cleaning up'));
  try { ws?.close(); } catch {}
  const chromeStopped = await stopOwnedChrome();
  const previewStopped = await stopOwnedPreview();
  if (chromeStopped && previewStopped) {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); }
    catch (error) { console.warn(`Temporary profile cleanup note: ${error.message}`); }
  } else {
    console.warn('Owned browser or preview child did not exit before cleanup timeout; preserved its profile for inspection.');
  }
}
