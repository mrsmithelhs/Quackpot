import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:net';

const host = '127.0.0.1';
async function getFreePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}
const previewPort = await getFreePort();
let cdpPort = await getFreePort();
while (cdpPort === previewPort) cdpPort = await getFreePort();
const baseUrl = `http://${host}:${previewPort}/Quackpot/`;
const chromeCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chromePath) throw new Error('No Chrome or Edge binary found in the supported install paths.');

const profileDir = mkdtempSync(path.join(process.cwd(), '.plan19-profile-'));
const preview = spawn(process.execPath, [
  path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--host', host,
  '--port', String(previewPort), '--strictPort',
], { stdio: 'ignore' });
const browser = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
  '--remote-allow-origins=*', '--disable-crash-reporter', '--disable-crashpad',
], { stdio: ['ignore', 'ignore', 'pipe'] });
browser.stderr.on('data', (chunk) => process.stderr.write(`[Chrome] ${chunk}`));
browser.on('error', (error) => process.stderr.write(`[Chrome launch error] ${error.message}\n`));
browser.on('exit', (code, signal) => {
  if (code !== 0 && code !== null) process.stderr.write(`[Chrome exited] code=${code} signal=${signal}\n`);
});

class Cdp {
  constructor(url) { this.socket = new WebSocket(url); this.nextId = 0; this.pending = new Map(); this.listeners = new Map(); }
  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (!message.id) {
        for (const listener of this.listeners.get(message.method) || []) listener(message.params);
        return;
      }
      const handlers = this.pending.get(message.id);
      if (!handlers) return;
      this.pending.delete(message.id);
      if (message.error) handlers.reject(new Error(message.error.message));
      else handlers.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }
  close() { this.socket.close(); }
}

let cdp;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready(url) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {}
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
async function evaluate(expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
  return result.result?.value;
}
async function waitFor(expression, label, timeout = 6000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await wait(50);
  }
  throw new Error(`Timed out waiting for ${label}`);
}
async function click(selector) {
  const found = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
  if (!found) throw new Error(`Missing button ${selector}`);
}
try {
  await ready(baseUrl);
  await ready(`http://${host}:${cdpPort}/json/version`);
  const targets = await (await fetch(`http://${host}:${cdpPort}/json/list`)).json();
  const target = targets.find((item) => item.type === 'page');
  if (!target) throw new Error('Chrome did not create a page target.');
  cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  const appRequests = [];
  cdp.on('Network.requestWillBeSent', ({ request }) => {
    if (request.url.startsWith('http://') || request.url.startsWith('https://')) appRequests.push(request.url);
  });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 520, deviceScaleFactor: 1, mobile: true });
  await cdp.send('Page.navigate', { url: baseUrl });
  await waitFor('Boolean(document.querySelector("#btn-start-app"))', 'initial desk');
  await evaluate('localStorage.clear()');

  // A pre-setup manual save must restore to the companion setup desk.
  await click('#btn-manual-save');
  if (!(await evaluate('Boolean(localStorage.getItem("quackpot_save_v1"))'))) throw new Error('Save before setup did not write an envelope.');
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitFor('Boolean(document.querySelector("#btn-start-app")) && Boolean(document.querySelector("#companion-name-input"))', 'pre-setup save restored to desk');
  if (await evaluate('Boolean(document.querySelector("#btn-claim-pull"))')) throw new Error('Pre-setup save bypassed the companion setup desk.');
  await evaluate('localStorage.clear()');

  // One ordinary activation enters through the visual turn/expand sequence.
  await evaluate('document.querySelector("#desk-autosave-checkbox").checked = false');
  await click('#btn-start-app');
  await waitFor('Boolean(document.querySelector(".stage-transition"))', 'phone transition overlay');
  await waitFor('Boolean(document.querySelector("#btn-claim-pull")) && !document.querySelector(".stage-transition")', 'gacha stage after transition', 5000);
  if (!(await evaluate('Boolean(document.querySelector("#btn-claim-pull"))'))) throw new Error('Single activation did not reach gacha.');
  if (!(await evaluate('document.activeElement.id === "btn-claim-pull"'))) throw new Error('Entry did not move focus into the phone stage.');
  if (await evaluate('localStorage.getItem("quackpot_save_v1")') !== null) throw new Error('Initial autosave choice was not respected.');

  // Settings focus, live autosave preference, save failure feedback and small viewport bounds.
  await click('#btn-open-settings');
  if (!(await evaluate('Boolean(document.querySelector(".settings-credits summary"))'))) throw new Error('Settings did not expose local Credits and asset notices.');
  const settingsBounds = await evaluate(`(() => { const d = document.querySelector('.settings-card'); const r = d.getBoundingClientRect(); const c = document.querySelector('[data-settings-close]').getBoundingClientRect(); const ids = ['btn-manual-save','btn-open-settings','btn-return-apartment','btn-uninstall']; const controls = ids.map(id => { const b = document.getElementById(id).getBoundingClientRect(); return {id,left:b.left,right:b.right,top:b.top,bottom:b.bottom}; }); return {top:r.top,bottom:r.bottom,height:innerHeight,closeTop:c.top,closeBottom:c.bottom,focus:document.activeElement?.getAttribute('data-settings-close'),inert:document.querySelector('#main-content').inert,controls}; })()`);
  if (settingsBounds.top < 0 || settingsBounds.bottom > settingsBounds.height || settingsBounds.closeTop < settingsBounds.top || settingsBounds.closeBottom > settingsBounds.bottom || settingsBounds.focus === null || !settingsBounds.inert || settingsBounds.controls.some((item) => item.left < 0 || item.right > 390 || item.top < 0 || item.bottom > 520)) {
    throw new Error(`Settings viewport/focus/inert check failed: ${JSON.stringify(settingsBounds)}`);
  }
  const initialAutosaveChecked = await evaluate('document.querySelector("[data-settings-autosave]").checked');
  if (initialAutosaveChecked) throw new Error('Settings did not reflect the disabled initial autosave choice.');
  await evaluate('(() => { const input = document.querySelector("[data-settings-autosave]"); input.checked = true; input.dispatchEvent(new Event("change", {bubbles:true})); })()');
  if (!(await evaluate('Boolean(localStorage.getItem("quackpot_save_v1"))'))) throw new Error('Enabling autosave in Settings did not use the real save path.');
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' });
  await evaluate('document.querySelector("[data-settings-done]").focus()');
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' });
  if (!(await evaluate('document.activeElement.matches("[data-settings-close]")'))) throw new Error('Settings Tab focus did not wrap to the close control.');
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await waitFor('!document.querySelector("[role=dialog]") && document.activeElement.id === "btn-open-settings"', 'Escape close and focus return');
  await click('#btn-open-settings');
  await click('[data-settings-backdrop]');
  if (!(await evaluate('!document.querySelector("[role=dialog]")'))) throw new Error('Backdrop click did not close settings.');

  // Commit and save a partial pull, then confirm browser reload restores it.
  await click('#btn-claim-pull');
  await click('#btn-manual-save');
  let savedEnvelope = await evaluate('localStorage.getItem("quackpot_save_v1")');
  if (!savedEnvelope) throw new Error('Manual save did not write the local envelope.');
  await cdp.send('Page.reload', { ignoreCache: true });
  try {
    await waitFor('Boolean(document.querySelector("#btn-reveal-next"))', 'restored pending reveals');
  } catch {
    const restoredState = await evaluate(`(() => { const raw = localStorage.getItem("quackpot_save_v1"); return { body:document.querySelector("#main-content")?.innerText, raw, step:raw ? JSON.parse(raw).state.step : null, pending:raw ? JSON.parse(raw).state.pendingReveals?.length : null }; })()`);
    throw new Error(`Saved game did not restore pending reveals: ${JSON.stringify(restoredState)}`);
  }
  const savedStep = await evaluate('JSON.parse(localStorage.getItem("quackpot_save_v1")).state.step');
  if (savedStep !== 'd1_morning_gacha') throw new Error(`Reload restored unexpected step: ${savedStep}`);

  await click('#btn-open-settings');
  await evaluate('(() => { const input = document.querySelector("[data-settings-autosave]"); input.checked = false; input.dispatchEvent(new Event("change", {bubbles:true})); })()');
  if (await evaluate('JSON.parse(localStorage.getItem("quackpot_save_v1")).autosaveEnabled') !== false) throw new Error('Turning autosave off did not persist the preference.');
  await click('[data-settings-done]');
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitFor('Boolean(document.querySelector("#btn-reveal-next"))', 'reload with autosave disabled');
  await click('#btn-open-settings');
  if (await evaluate('document.querySelector("[data-settings-autosave]").checked')) throw new Error('Autosave-off preference did not survive reload.');
  await evaluate('(() => { const input = document.querySelector("[data-settings-autosave]"); input.checked = true; input.dispatchEvent(new Event("change", {bubbles:true})); })()');
  savedEnvelope = await evaluate('localStorage.getItem("quackpot_save_v1")');
  await click('[data-settings-done]');

  // Settings opened during return cancels that transition and stays on the active phone route.
  await evaluate('document.querySelector("#btn-return-apartment").click(); document.querySelector("#btn-open-settings").click();');
  await waitFor('Boolean(document.querySelector("[role=dialog]"))', 'settings opened during return');
  await wait(900);
  if (!(await evaluate('Boolean(document.querySelector("[role=dialog]")) && Boolean(document.querySelector("#btn-return-apartment")) && !document.querySelector("#btn-start-app")'))) {
    throw new Error('Return completion changed the route or focus context while Settings was open.');
  }
  await click('[data-settings-done]');

  await click('#btn-open-settings');
  await evaluate('localStorage.setItem = function(){ throw new Error("QuotaExceededError: test only"); }');
  await click('[data-settings-save]');
  const failureCopy = await evaluate('document.querySelector("[data-settings-status]").textContent');
  if (!failureCopy.includes('Save failed')) throw new Error(`Settings save failure was not reported: ${failureCopy}`);
  await click('[data-settings-done]');

  // Returning to the apartment is visual only: the current step and saved state remain intact.
  await click('#btn-return-apartment');
  await waitFor('Boolean(document.querySelector("#btn-start-app")) && document.querySelector(".desk-intro h2")?.textContent.includes("Back at Your Apartment")', 'animated return to apartment');
  const savedAfterReturn = await evaluate('localStorage.getItem("quackpot_save_v1")');
  if (savedAfterReturn !== savedEnvelope) throw new Error('Apartment return changed the saved game snapshot.');
  await click('#btn-start-app');
  await waitFor('Boolean(document.querySelector("#btn-reveal-next")) && !document.querySelector(".stage-transition")', 'reopen saved game step', 5000);
  if (!(await evaluate('document.activeElement.id === "btn-reveal-next"'))) throw new Error('Reopening the phone did not move focus into the current stage.');

  await evaluate('document.querySelector("#btn-return-apartment").click(); document.querySelector("#btn-uninstall").click();');
  await waitFor('Boolean(document.querySelector("#btn-retention-leave"))', 'Uninstall during return');
  await wait(900);
  if (!(await evaluate('Boolean(document.querySelector("#btn-retention-leave")) && !document.querySelector(".stage-transition")'))) throw new Error('Cancelled return fired a stale completion after Uninstall.');
  await click('#btn-retention-leave');
  await waitFor('Boolean(document.querySelector("#receipt-paper"))', 'Receipt after cancelling return');

  // Reduced-motion setting takes the static path. Uninstall during entry cancels without stale completion.
  await evaluate('localStorage.clear()');
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitFor('Boolean(document.querySelector("#btn-start-app"))', 'fresh desk for reduced motion');
  await evaluate('window.__sawStaticTransition = false; new MutationObserver(() => { if (document.querySelector(".stage-transition-static")) window.__sawStaticTransition = true; }).observe(document.querySelector("#main-content"), {childList:true,subtree:true})');
  await click('#btn-start-app');
  await waitFor('window.__sawStaticTransition', 'reduced-motion static equivalent');
  await waitFor('Boolean(document.querySelector("#btn-claim-pull")) && !document.querySelector(".stage-transition")', 'static entry completion');
  if (!(await evaluate('document.activeElement.id === "btn-claim-pull"'))) throw new Error('Reduced-motion entry did not move focus into the current stage.');
  await evaluate('localStorage.clear()');
  await cdp.send('Emulation.setEmulatedMedia', { features: [] });
  await cdp.send('Page.reload', { ignoreCache: true });
  await waitFor('Boolean(document.querySelector("#btn-start-app"))', 'fresh desk for cancellation check');
  await evaluate('document.querySelector("#btn-start-app").click(); document.querySelector("#btn-uninstall").click();');
  await waitFor('Boolean(document.querySelector("#btn-retention-leave"))', 'retention offer after cancelling entry');
  await wait(900);
  if (!(await evaluate('Boolean(document.querySelector("#btn-retention-leave")) && !document.querySelector(".stage-transition")'))) throw new Error('Cancelled entry fired a stale completion after Uninstall.');
  await click('#btn-retention-leave');
  await waitFor('Boolean(document.querySelector("#receipt-paper"))', 'Receipt after immediate Uninstall');
  const externalRequests = appRequests.filter((url) => new URL(url).origin !== new URL(baseUrl).origin);
  if (externalRequests.length) throw new Error(`Game page made external requests: ${externalRequests.join(', ')}`);

  console.log(JSON.stringify({
    status: 'passed',
    viewport: '390x520',
    checks: [
      'pre-setup Save/reload restores the companion desk',
      'single activation turn and expansion with focus transfer',
      'initial autosave choice and autosave-off setting survive reload',
      'settings bounds, inert background, focus containment, Escape and backdrop dismissal',
      'focus return to settings launcher', 'visible storage failure feedback',
      'animated apartment return preserves saved state and reopens current game step',
      'Settings during return cancels the pending return callback',
      'reduced-motion static entry with focus transfer', 'Uninstall cancels transition and reaches Receipt without stale callbacks',
      'Uninstall during return cancels the reverse callback', 'game page requests stay on local preview origin',
    ],
    settingsBounds,
    failureCopy,
    pageRequests: appRequests,
  }, null, 2));
} finally {
  cdp?.close();
  const stopChild = (child) => new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) return resolve();
    child.once('exit', resolve);
    child.kill();
    setTimeout(resolve, 4000).unref();
  });
  await Promise.all([stopChild(browser), stopChild(preview)]);
  await wait(300);
  const workspaceRoot = path.resolve(process.cwd());
  const cleanupRoot = path.resolve(profileDir);
  if (!cleanupRoot.startsWith(`${workspaceRoot}${path.sep}`) || !path.basename(cleanupRoot).startsWith('.plan19-profile-')) {
    throw new Error(`Refusing to remove unexpected browser profile path: ${cleanupRoot}`);
  }
  rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
