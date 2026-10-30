import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { snapshotOwnedTree } from './process-tree.mjs';

const fail = (message) => { throw new Error(message); };
const CHROME = process.env.QP35_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ownedBrowsers = new Set();

export class CDP {
  constructor(url) {
    if (typeof WebSocket !== 'function') fail('This Node runtime does not provide the WebSocket API required by the bounded CDP helper.');
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('DevTools WebSocket connect timeout.')), 5000);
      this.socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('DevTools WebSocket error.')); }, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      const pending = this.pending.get(message.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result ?? {});
    });
  }

  async send(method, params = {}, sessionId = null) {
    await this.ready;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 5000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  close() {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error('CDP closed during cleanup.'));
      this.pending.delete(id);
    }
    try { this.socket.close(); } catch { /* already closed */ }
  }
}

export async function launchIsolatedChrome() {
  const profile = await mkdtemp(path.join(os.tmpdir(), 'qp35-chrome-'));
  const child = spawn(CHROME, ['--headless=new', '--no-first-run', '--disable-gpu', '--no-default-browser-check',
    '--window-size=1365,900', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const owned = { profile, child, cdp: null, stderr: () => stderr, closed: false };
  ownedBrowsers.add(owned);
  let stderr = '';
  child.stderr.on('data', (chunk) => { if (stderr.length < 8192) stderr += chunk.toString().slice(0, 8192 - stderr.length); });
  let startError = null;
  child.once('error', (error) => { startError = error; });
  const portFile = path.join(profile, 'DevToolsActivePort');
  const until = Date.now() + 10000;
  let portInfo = null;
  try {
    while (Date.now() < until) {
      if (startError || child.exitCode !== null) fail(`Chrome exited during startup (${startError?.message ?? child.exitCode}): ${stderr}`);
      try { portInfo = (await readFile(portFile, 'utf8')).trim().split(/\r?\n/); break; }
      catch { await delay(100); }
    }
    if (!portInfo?.[0] || !portInfo[1]) fail(`Chrome DevTools endpoint did not appear: ${stderr}`);
    owned.cdp = new CDP(`ws://127.0.0.1:${portInfo[0]}${portInfo[1]}`);
    await owned.cdp.ready;
    return owned;
  } catch (error) {
    const cleanup = await closeIsolatedChrome(owned);
    throw new Error(`Isolated Chrome startup failed; cleanup=${JSON.stringify(cleanup)}; ${error.message}`);
  }
}

export async function closeIsolatedChrome(browser) {
  if (!browser || browser.closed) return { residual: false, uncertainty: false };
  browser.closed = true;
  if (browser.cdp) {
    try { await browser.cdp.send('Browser.close'); } catch { /* Browser.close normally closes the transport. */ }
    browser.cdp.close();
  }
  if (browser.child.exitCode === null) await Promise.race([new Promise((resolve) => browser.child.once('exit', resolve)), delay(1200)]);
  let treeTerminationConfirmed = false;
  let tracked = [];
  if (browser.child.pid) {
    try {
      tracked = await snapshotOwnedTree(browser.child.pid);
    } catch { /* cleanup status below records uncertainty */ }
    if (browser.child.exitCode === null) {
      try { execFileSync('taskkill.exe', ['/PID', String(browser.child.pid), '/T', '/F'], { stdio: 'ignore', timeout: 2500 }); }
      catch { /* verification below decides whether termination is confirmed */ }
    }
    if (browser.child.exitCode === null) await Promise.race([new Promise((resolve) => browser.child.once('exit', resolve)), delay(500)]);
  }
  let remaining = [];
  try {
    const until = Date.now() + 2000;
    do {
      remaining = browser.child.pid ? await snapshotOwnedTree(browser.child.pid) : [];
      const liveTracked = remaining.some((row) => tracked.some((old) => old.pid === row.pid && old.created === row.created));
      if (!liveTracked && remaining.length === 0 && browser.child.exitCode !== null) { treeTerminationConfirmed = true; break; }
      await delay(100);
    } while (Date.now() < until);
  } catch { /* unavailable ownership inspection remains uncertainty */ }
  const residual = browser.child.exitCode === null || remaining.length > 0;
  let profileRemoved = false;
  if (treeTerminationConfirmed && !residual) {
    try { await rm(browser.profile, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }); profileRemoved = true; }
    catch { /* caller records cleanup failure */ }
  }
  ownedBrowsers.delete(browser);
  return { residual, uncertainty: !treeTerminationConfirmed || !profileRemoved, childExitCode: browser.child.exitCode,
    treeTerminationConfirmed, profileRemoved, chromeStderr: browser.stderr() };
}

export async function createPage(cdp, url, { viewport = { width: 1365, height: 900 }, fixtureRaw = null } = {}) {
  const context = await cdp.send('Target.createBrowserContext', { disposeOnDetach: true });
  const target = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId: context.browserContextId });
  const attached = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const sessionId = attached.sessionId;
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: false }, sessionId);
  if (fixtureRaw !== null) {
    const key = JSON.stringify('quackpot_save_v1');
    const value = JSON.stringify(fixtureRaw);
    const token = `qp35-seed-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(() => { try { if (location.origin === 'null' || sessionStorage.getItem(${JSON.stringify(token)})) return; sessionStorage.setItem(${JSON.stringify(token)}, '1'); localStorage.setItem(${key}, ${value}); } catch {} })();`,
    }, sessionId);
  }
  await cdp.send('Page.navigate', { url }, sessionId);
  return { contextId: context.browserContextId, targetId: target.targetId, sessionId };
}

export async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, sessionId);
  if (result.exceptionDetails) fail(`Browser evaluation failed: ${result.exceptionDetails.text}`);
  return result.result?.value;
}

export async function waitFor(cdp, sessionId, expression, label, timeoutMs = 10000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const value = await evaluate(cdp, sessionId, expression);
    if (value) return value;
    await delay(100);
  }
  fail(`Timed out waiting for ${label}.`);
}

export async function mounted(cdp, sessionId, selector, label) {
  return waitFor(cdp, sessionId,
    `(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; })()`, label);
}

export async function clickPointer(cdp, sessionId, selector) {
  const point = await evaluate(cdp, sessionId, `(() => {
    const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return {error:'missing'};
    e.scrollIntoView({block:'center',inline:'center'}); const r=e.getBoundingClientRect(); const x=r.left+r.width/2,y=r.top+r.height/2;
    const hit=document.elementFromPoint(x,y); const s=getComputedStyle(e);
    if(!r.width||!r.height||e.disabled||e.closest('[inert]')||s.pointerEvents==='none'||r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight||!(hit===e||e.contains(hit))) return {error:'not-hit-testable',selector,x,y,hit:hit?.tagName??null};
    return {x,y,text:e.innerText}; })()`);
  if (point?.error) throw new Error(`Pointer target failure: ${JSON.stringify(point)}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y }, sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 }, sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 }, sessionId);
  return point;
}
