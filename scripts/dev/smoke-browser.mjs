// scripts/dev/smoke-browser.mjs
// Local headless browser subpath smoke test for Plan 02 and Plan 03 Repair 01.
// Robust process ownership, isolated temporary browser profile, bounded event/HTTP waits,
// verification of build asset hashes, and comprehensive automated end-to-end browser journeys.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { currentPlan52SourceClosure, sha256 } from './checkpoints/provenance.mjs';

import {
  assertPortFree,
  validateRequests,
  validateDomState,
  validateConsoleAndErrors,
  safeCleanupTempDir,
  fetchWithTimeout,
  waitForEndpoint,
  waitForCdpEvent,
} from './smoke-validator.mjs';

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

const PREVIEW_PORT = 4173;
const HOST = '127.0.0.1';
const EXPECTED_ORIGIN = `http://${HOST}:${PREVIEW_PORT}`;
const BASE_PATH = '/Quackpot/';
const BASE_URL = `${EXPECTED_ORIGIN}${BASE_PATH}`;
const NO_SLASH_URL = `${EXPECTED_ORIGIN}/Quackpot`;
const CDP_PORT = 9222;
const OBSERVATION_OUTPUT_PATH = process.env.QUACKPOT_SMOKE_OBSERVATION_OUTPUT
  ? path.resolve(process.env.QUACKPOT_SMOKE_OBSERVATION_OUTPUT)
  : path.resolve('reports/development/plan-52-five-slot-production-transition/smoke-observations.json');

function findBrowserBinary() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  throw new Error('No supported Chrome or Edge binary found at standard paths.');
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CdpSession {
  constructor(wsUrl, timeoutMs = 8000) {
    this.wsUrl = wsUrl;
    this.timeoutMs = timeoutMs;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventHandlers = new Map();
    this.closed = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`CDP WebSocket connection to ${this.wsUrl} timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        clearTimeout(timer);
        resolve();
      };
      this.ws.onerror = (err) => {
        clearTimeout(timer);
        reject(err);
      };
      this.ws.onclose = () => {
        this.closed = true;
        for (const [, { reject: cbReject }] of this.callbacks.entries()) {
          cbReject(new Error('CDP WebSocket closed unexpectedly'));
        }
        this.callbacks.clear();
        this.emit('close');
      };
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve: cbResolve, reject: cbReject, timer: cmdTimer } = this.callbacks.get(msg.id);
          clearTimeout(cmdTimer);
          this.callbacks.delete(msg.id);
          if (msg.error) cbReject(new Error(msg.error.message));
          else cbResolve(msg.result);
        } else if (msg.method) {
          const handlers = this.eventHandlers.get(msg.method) || [];
          for (const handler of handlers) handler(msg.params);
        }
      };
    });
  }

  send(method, params = {}, cmdTimeoutMs = 6000) {
    if (this.closed) {
      return Promise.reject(new Error(`Cannot send CDP command "${method}": connection is closed`));
    }
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      const cmdTimer = setTimeout(() => {
        if (this.callbacks.has(msgId)) {
          this.callbacks.delete(msgId);
          reject(new Error(`CDP command "${method}" timed out after ${cmdTimeoutMs}ms`));
        }
      }, cmdTimeoutMs);

      this.callbacks.set(msgId, { resolve, reject, timer: cmdTimer });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const list = this.eventHandlers.get(event);
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    }
  }

  emit(event, params) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) handler(params);
  }

  close() {
    if (this.ws && !this.closed) {
      this.closed = true;
      this.ws.close();
      this.emit('close');
    }
  }
}

async function evalExpr(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  if (res.exceptionDetails) {
    const desc = res.exceptionDetails.text || res.exceptionDetails.exception?.description || 'Unknown eval error';
    throw new Error(`Eval error: ${desc}`);
  }
  return res.result?.value;
}

async function clickSelector(cdp, selector, waitMs = 250) {
  await evalExpr(cdp, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error("Element not found: " + ${JSON.stringify(selector)});
    el.click();
  })()`);
  if (waitMs > 0) await sleep(waitMs);
}

async function waitForSelector(cdp, selector, maxWaitMs = 5000, pollIntervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const found = await evalExpr(cdp, `Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    if (found) return true;
    await sleep(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for selector "${selector}" after ${maxWaitMs}ms`);
}

async function waitForVisible(cdp, selector, maxWaitMs = 5000, pollIntervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const visible = await evalExpr(cdp, `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    })()`);
    if (visible) return true;
    await sleep(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for visible selector "${selector}" after ${maxWaitMs}ms`);
}

async function waitForEnabled(cdp, selector, maxWaitMs = 40000, pollIntervalMs = 100) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const enabled = await evalExpr(cdp, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); return Boolean(el && !el.disabled); })()`);
    if (enabled) return true;
    await sleep(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for enabled selector "${selector}" after ${maxWaitMs}ms`);
}

async function startAndSettleRace(cdp) {
  await waitForSelector(cdp, '[data-race-form]');
  await clickSelector(cdp, '[data-race-form] button[type="submit"]');
  const hasSkip = await evalExpr(cdp, `Boolean(document.querySelector('[data-race-skip]'))`);
  if (hasSkip) throw new Error('Normal race playback must not expose a Skip control.');
  await waitForEnabled(cdp, '[data-race-proceed]');
  await waitForVisible(cdp, '[data-race-result-summary]');
}

async function continueRace(cdp) {
  await clickSelector(cdp, '[data-race-proceed]');
}

async function resetAndLoadFresh(cdp) {
  await evalExpr(cdp, `localStorage.clear();`);
  const reloadPromise = waitForCdpEvent(cdp, 'Page.loadEventFired', 8000);
  await cdp.send('Page.reload', { ignoreCache: true });
  await reloadPromise;
  await sleep(400);
}

async function clickButtonText(cdp, text) {
  const clicked=await evalExpr(cdp,`(()=>{const button=[...document.querySelectorAll('button')].find(b=>!b.disabled && b.offsetParent!==null && b.textContent.includes(${JSON.stringify(text)}));if(!button)return false;button.click();return true})()`);
  if(!clicked)throw new Error(`Enabled button not found: ${text}`);
  await sleep(250);
}

async function startFiveSlotDay(cdp) {
  await waitForSelector(cdp,'#morning-setup-form');await evalExpr(cdp,"document.querySelector('#morning-setup-form').requestSubmit()");await sleep(250);
  await clickSelector(cdp,'[data-obj=plate]');await clickSelector(cdp,'[data-act=confirm]');await clickSelector(cdp,'[data-act=done]');
  await clickButtonText(cdp,'The desk');await clickSelector(cdp,'[data-obj=work-keys]');await clickSelector(cdp,'[data-act=confirm]');
  await waitForSelector(cdp,'.life-story47 .life-day-next');await clickSelector(cdp,'.life-story47 .life-day-next');await clickSelector(cdp,'.life-story47 .life-day-next');await clickSelector(cdp,'.life-story47 .life-day-next');
  await clickSelector(cdp,'[data-obj=plate]');await clickSelector(cdp,'[data-act=confirm]');await clickSelector(cdp,'[data-act=done]');
  await clickButtonText(cdp,'The desk');await clickSelector(cdp,'[data-obj=phone]');await waitForSelector(cdp,'[data-life-phone=welcome]');
}

async function runSmoke() {
  console.log('=== Five-slot Headless Browser Subpath Smoke Test (Isolated) ===');
  const sourceAtStart=await currentPlan52SourceClosure();
  const browserBin = findBrowserBinary();
  console.log('Browser binary found:', browserBin);

  // 1. Verify build freshness and parse expected asset chunk filenames
  const distIndexHtml = path.resolve('dist/index.html');
  if (!existsSync(distIndexHtml)) {
    throw new Error(
      'Build artifact dist/index.html not found. Run "npm run test:smoke" (which builds automatically via pretest:smoke) or run "npm run build" first.'
    );
  }
  const indexHtmlContent = readFileSync(distIndexHtml, 'utf-8');
  const jsMatch = indexHtmlContent.match(/src="\/Quackpot\/assets\/(index-[^"]+\.js)"/);
  const cssMatch = indexHtmlContent.match(/href="\/Quackpot\/assets\/(index-[^"]+\.css)"/);
  const svgMatch = indexHtmlContent.match(/href="\/Quackpot\/assets\/(duck-placeholder-[^"]+\.svg)"/);

  const expectedChunks = {
    js: jsMatch ? jsMatch[1] : null,
    css: cssMatch ? cssMatch[1] : null,
    svg: svgMatch ? svgMatch[1] : null,
  };
  if (!expectedChunks.js || !expectedChunks.css || !expectedChunks.svg) {
    throw new Error(`Failed to parse expected asset chunk names from ${distIndexHtml}`);
  }
  console.log('Verified build artifacts to observe from current build:', expectedChunks);

  // 2. Check endpoints before spawn (fail early on port collisions)
  console.log('Checking port availability...');
  await assertPortFree(HOST, PREVIEW_PORT);
  await assertPortFree(HOST, CDP_PORT);
  console.log(`Ports ${PREVIEW_PORT} and ${CDP_PORT} verified free.`);

  // 3. Create isolated temporary browser profile
  const tmpRoot = os.tmpdir();
  const tempProfileDir = mkdtempSync(path.join(tmpRoot, 'quackpot-smoke-profile-'));
  console.log('Created dedicated browser profile:', tempProfileDir);

  let previewProc = null;
  let chromeProc = null;
  let cdp = null;

  // Track processes for guaranteed cleanup
  const cleanup = async () => {
    console.log('\nRunning cleanup...');
    if (cdp) {
      try { cdp.close(); } catch {}
    }
    if (chromeProc && !chromeProc.killed) {
      try { chromeProc.kill('SIGKILL'); } catch {}
    }
    if (previewProc && !previewProc.killed) {
      try { previewProc.kill('SIGKILL'); } catch {}
    }
    await sleep(200);
    try {
      await safeCleanupTempDir(tempProfileDir, tmpRoot);
      console.log('Cleaned up dedicated browser profile directory.');
    } catch (err) {
      console.error('Warning during profile cleanup:', err.message);
    }
  };

  process.on('SIGINT', async () => { await cleanup(); process.exit(130); });
  process.on('uncaughtException', async (err) => { await cleanup(); console.error(err); process.exit(1); });

  try {
    // 4. Spawn Vite preview
    const viteBin = path.resolve('node_modules/vite/bin/vite.js');
    console.log(`Spawning Vite preview: ${viteBin} on ${HOST}:${PREVIEW_PORT}...`);
    previewProc = spawn(
      process.execPath,
      [viteBin, 'preview', '--host', HOST, '--port', String(PREVIEW_PORT), '--strictPort'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    previewProc.on('error', (err) => {
      throw new Error(`Vite preview failed to spawn: ${err.message}`);
    });

    previewProc.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        throw new Error(`Vite preview exited prematurely with code ${code} / signal ${signal}`);
      }
    });

    previewProc.stdout.on('data', (d) => {
      const s = d.toString();
      if (s.includes('Local:')) console.log('[Vite Preview Output]', s.trim());
    });

    previewProc.stderr.on('data', (d) => {
      const s = d.toString();
      if (s.includes('error')) console.error('[Vite Preview Error]', s.trim());
    });

    // 5. Spawn headless Chrome with dedicated profile
    console.log(`Spawning Chrome with CDP port ${CDP_PORT}...`);
    chromeProc = spawn(browserBin, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tempProfileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
    ]);

    chromeProc.on('error', (err) => {
      throw new Error(`Chrome failed to spawn: ${err.message}`);
    });

    chromeProc.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        throw new Error(`Chrome exited prematurely with code ${code} / signal ${signal}`);
      }
    });

    // 6. Bounded wait for endpoints
    console.log('Waiting for Preview endpoint (bounded)...');
    await waitForEndpoint(BASE_URL, { totalTimeoutMs: 8000, perRequestTimeoutMs: 1500 });
    console.log('Vite preview ready at', BASE_URL);

    console.log('Waiting for Chrome CDP endpoint (bounded)...');
    await waitForEndpoint(`http://${HOST}:${CDP_PORT}/json/version`, { totalTimeoutMs: 8000, perRequestTimeoutMs: 1500 });
    const verRes = await fetchWithTimeout(`http://${HOST}:${CDP_PORT}/json/version`, {}, 2000);
    const browserMeta = await verRes.json();
    console.log(`Chrome CDP ready: ${browserMeta.Browser}`);

    // Create target page with bounded request
    const newPageRes = await fetchWithTimeout(`http://${HOST}:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' }, 2000);
    const targetInfo = await newPageRes.json();
    console.log('Target created:', targetInfo.id);

    cdp = new CdpSession(targetInfo.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('CDP connected.');

    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // Storage for observations
    const initialLoadRequests = new Map();
    const reloadRequests = new Map();
    const consoleLogs = [];
    const runtimeExceptions = [];
    const dialogs = [];
    cdp.on('Page.javascriptDialogOpening', params => {
      dialogs.push({type:params.type,message:params.message,accepted:true});
      cdp.send('Page.handleJavaScriptDialog',{accept:true}).catch(error=>runtimeExceptions.push({text:`Dialog response failed: ${error.message}`}));
    });

    cdp.on('Runtime.exceptionThrown', (params) => {
      const desc = params.exceptionDetails.text || params.exceptionDetails.exception?.description || 'Unknown error';
      runtimeExceptions.push({ text: desc, lineNumber: params.exceptionDetails.lineNumber });
      console.error('[Runtime Exception]', desc);
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      const text = params.args.map((a) => a.value ?? JSON.stringify(a)).join(' ');
      consoleLogs.push({ type: params.type, text });
      console.log(`[Browser Console ${params.type}]`, text);
    });

    let activeRequestMap = initialLoadRequests;

    cdp.on('Network.requestWillBeSent', (params) => {
      if (params.request.url.startsWith('http://') || params.request.url.startsWith('https://')) {
        activeRequestMap.set(params.requestId, {
          requestId: params.requestId,
          url: params.request.url,
          method: params.request.method,
          type: params.type,
          status: null,
          mimeType: null,
        });
      }
    });

    cdp.on('Network.responseReceived', (params) => {
      if (activeRequestMap.has(params.requestId)) {
        const item = activeRequestMap.get(params.requestId);
        item.status = params.response.status;
        item.mimeType = params.response.mimeType;
      }
    });

    // --- PHASE 1: Initial load at subpath /Quackpot/ (Bounded Page.loadEventFired wait) ---
    console.log(`\n--- Phase 1: Navigating to ${BASE_URL} ---`);
    const initialLoadPromise = waitForCdpEvent(cdp, 'Page.loadEventFired', 8000);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await initialLoadPromise;
    await sleep(700);

    const initialReqList = Array.from(initialLoadRequests.values());
    console.log(`Phase 1 recorded ${initialReqList.length} requests:`);
    console.table(initialReqList.map(({ requestId, ...rest }) => rest));

    validateRequests(initialReqList, {
      expectedOrigin: EXPECTED_ORIGIN,
      expectedSubpath: BASE_PATH,
      isReload: false,
    });
    validateConsoleAndErrors(consoleLogs, runtimeExceptions);

    const phase1Filenames = initialReqList.map((r) => path.basename(new URL(r.url).pathname));
    if (!phase1Filenames.includes(expectedChunks.js)) {
      throw new Error(`Build chunk verification failed: ${expectedChunks.js} not observed in initial requests`);
    }
    if (!phase1Filenames.includes(expectedChunks.css)) {
      throw new Error(`Build chunk verification failed: ${expectedChunks.css} not observed in initial requests`);
    }
    if (!phase1Filenames.includes(expectedChunks.svg)) {
      throw new Error(`Build chunk verification failed: ${expectedChunks.svg} not observed in initial requests`);
    }
    console.log('✓ Phase 1 observed asset filenames match this run\'s build.');

    const evalPhase1 = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const app = document.querySelector('#app');
        const h1 = document.querySelector('#spike-title')?.textContent;
        const duckImg = document.querySelector('.duck-img');
        const specItems = document.querySelectorAll('.spec-item').length;
        return {
          hasApp: Boolean(app),
          h1,
          duckSrc: duckImg?.src,
          duckComplete: duckImg?.complete,
          duckNaturalWidth: duckImg?.naturalWidth,
          duckNaturalHeight: duckImg?.naturalHeight,
          specItemsCount: specItems,
        };
      })()`,
      returnByValue: true,
    });
    const domPhase1 = evalPhase1.result.value;
    console.log('Phase 1 DOM evaluation:', domPhase1);
    validateDomState(domPhase1, {
      expectedOrigin: EXPECTED_ORIGIN,
      expectedSubpath: BASE_PATH,
    });
    console.log('✓ Phase 1 initial load validation passed.');

    // --- PHASE 2: Reload Verification (Bounded Page.loadEventFired wait) ---
    console.log(`\n--- Phase 2: Page Reload Verification ---`);
    activeRequestMap = reloadRequests;
    const reloadPromise = waitForCdpEvent(cdp, 'Page.loadEventFired', 8000);
    await cdp.send('Page.reload', { ignoreCache: false });
    await reloadPromise;
    await sleep(700);

    const reloadReqList = Array.from(reloadRequests.values());
    console.log(`Phase 2 recorded ${reloadReqList.length} requests on reload:`);
    console.table(reloadReqList.map(({ requestId, ...rest }) => rest));

    validateRequests(reloadReqList, {
      expectedOrigin: EXPECTED_ORIGIN,
      expectedSubpath: BASE_PATH,
      isReload: true,
    });
    validateConsoleAndErrors(consoleLogs, runtimeExceptions);

    const phase2Filenames = reloadReqList.map((r) => path.basename(new URL(r.url).pathname));
    if (!phase2Filenames.includes(expectedChunks.js)) {
      throw new Error(`Build chunk verification failed on reload: ${expectedChunks.js} not observed`);
    }
    if (!phase2Filenames.includes(expectedChunks.css)) {
      throw new Error(`Build chunk verification failed on reload: ${expectedChunks.css} not observed`);
    }
    if (!phase2Filenames.includes(expectedChunks.svg)) {
      throw new Error(`Build chunk verification failed on reload: ${expectedChunks.svg} not observed`);
    }
    console.log('✓ Phase 2 reload asset filenames match this run\'s build.');

    const evalPhase2 = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const app = document.querySelector('#app');
        const h1 = document.querySelector('#spike-title')?.textContent;
        const duckImg = document.querySelector('.duck-img');
        const specItems = document.querySelectorAll('.spec-item').length;
        return {
          hasApp: Boolean(app),
          h1,
          duckSrc: duckImg?.src,
          duckComplete: duckImg?.complete,
          duckNaturalWidth: duckImg?.naturalWidth,
          duckNaturalHeight: duckImg?.naturalHeight,
          specItemsCount: specItems,
        };
      })()`,
      returnByValue: true,
    });
    const domPhase2 = evalPhase2.result.value;
    console.log('Phase 2 DOM evaluation after reload:', domPhase2);
    validateDomState(domPhase2, {
      expectedOrigin: EXPECTED_ORIGIN,
      expectedSubpath: BASE_PATH,
    });
    console.log('✓ Phase 2 reload validation passed.');

    // --- PHASE 3: Trailing Slash Check (/Quackpot) ---
    console.log(`\n--- Phase 3: Trailing Slash Check (${NO_SLASH_URL}) ---`);
    const noSlashRes = await fetchWithTimeout(NO_SLASH_URL, { redirect: 'manual' }, 2000);
    const trailingSlashObservation = {
      requestedUrl: NO_SLASH_URL,
      statusCode: noSlashRes.status,
      locationHeader: noSlashRes.headers.get('location'),
      note: 'Observed 404 on local Vite preview server. Production GitHub Pages 301 redirect is a remote deployment property and is not established or claimed by this local test.',
    };
    console.log('Trailing slash result:', trailingSlashObservation);

    // Current-policy journeys use only the mounted UI and an isolated browser profile.
    const assert = (condition,message) => { if(!condition)throw new Error(message); };
    const saved = async () => JSON.parse(await evalExpr(cdp,"localStorage.getItem('quackpot_save_v1')"));
    const reload = async () => {const event=waitForCdpEvent(cdp,'Page.loadEventFired',8000);await cdp.send('Page.reload',{ignoreCache:false});await event;await sleep(400);};
    const meal = async skip => {await waitForSelector(cdp,'[data-obj=plate]');await clickSelector(cdp,'[data-obj=plate]');await clickSelector(cdp,skip?'[data-act=decline]':'[data-act=confirm]');await clickSelector(cdp,'[data-act=done]');};
    const earlyBed = async () => {await clickButtonText(cdp,'The bedroom');await clickSelector(cdp,'[data-obj=bed]');await clickSelector(cdp,'[data-act=confirm]');await clickSelector(cdp,'[data-act=done]');};
    const scheduledWork = async () => {await clickButtonText(cdp,'The desk');await clickSelector(cdp,'[data-obj=work-keys]');await clickSelector(cdp,'[data-act=confirm]');await waitForSelector(cdp,'.life-story47 .life-day-next');await clickSelector(cdp,'.life-story47 .life-day-next');await clickSelector(cdp,'.life-story47 .life-day-next');await clickSelector(cdp,'.life-story47 .life-day-next');};
    await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});

    await resetAndLoadFresh(cdp);await clickSelector(cdp,'#btn-uninstall');await waitForSelector(cdp,'#btn-retention-leave');
    assert((await evalExpr(cdp,"document.querySelector('.retention-reward-banner')?.innerText"))?.includes('80 FREE GEMS'),'Retention offer missing');
    await clickSelector(cdp,'#btn-retention-leave');await waitForSelector(cdp,'#receipt-paper');
    assert((await evalExpr(cdp,"document.querySelector('#receipt-paper').innerText")).includes('Uninstalled early'),'Uninstall Receipt missing');
    assert(!await evalExpr(cdp,"!!document.querySelector('#btn-uninstall')") && await evalExpr(cdp,"!!document.querySelector('.hud-terminal-pill')"),'Terminal controls not locked');

    await resetAndLoadFresh(cdp);await startFiveSlotDay(cdp);
    await clickSelector(cdp,'[data-life-phone=bundle]');const afterBundle=await saved();
    assert(afterBundle.state.cash===123.01 && afterBundle.state.gems===330,'Real bundle purchase balance mismatch');
    // Deliberate fictional spending creates a later rent shortfall even when
    // the player completes scheduled shifts; this is not a nonspending route.
    for(let i=0;i<11;i++)await clickSelector(cdp,'[data-life-phone=bundle]');
    const afterSpending=await saved();assert(afterSpending.eventLog.filter(e=>e.type==='purchase'&&e.payload.kind==='bundle').length===12 && Math.abs(afterSpending.state.cash-68.12)<0.001,'Repeated fictional purchases were not committed as expected');
    await clickSelector(cdp,'[data-life-phone=welcome]');await waitForSelector(cdp,'#btn-reveal-next');await clickSelector(cdp,'#btn-reveal-next');await clickSelector(cdp,'#btn-reveal-next');
    assert(await evalExpr(cdp,"document.querySelectorAll('.duck-card.card-revealed').length")===2,'Expected two revealed cards');
    await clickSelector(cdp,'#btn-uninstall');await clickSelector(cdp,'#btn-retention-stay');await waitForSelector(cdp,'#btn-reveal-next');
    await clickSelector(cdp,'#btn-uninstall');await waitForSelector(cdp,'#btn-retention-stay');
    assert((await evalExpr(cdp,"document.querySelector('.modal-retention').innerText")).includes('already claimed'),'Repeat retention copy missing');
    await clickSelector(cdp,'#btn-retention-stay');await reload();await waitForSelector(cdp,'#btn-reveal-next');
    assert(await evalExpr(cdp,"document.querySelectorAll('.duck-card.card-revealed').length")===2,'Mid-reveal reload changed revealed cards');
    await clickSelector(cdp,'#btn-reveal-all');await waitForSelector(cdp,'#btn-gacha-proceed');await clickSelector(cdp,'#btn-gacha-proceed');
    await waitForSelector(cdp,'[data-life-phone=race]');await clickSelector(cdp,'[data-life-phone=race]');await startAndSettleRace(cdp);
    const beforeRaceReload=await saved(),raceEvents=beforeRaceReload.eventLog.filter(e=>e.type==='race_result');assert(raceEvents.length===1,'Expected one finished race');
    await reload();await waitForEnabled(cdp,'[data-race-proceed]');const afterRaceReload=await saved();
    assert(afterRaceReload.state.gems===beforeRaceReload.state.gems && afterRaceReload.eventLog.filter(e=>e.type==='race_result').length===1,'Race reload duplicated outcome or Gems');
    await continueRace(cdp);await waitForSelector(cdp,'#btn-return-apartment');await clickSelector(cdp,'#btn-return-apartment');await waitForSelector(cdp,'.life-day-actions');
    await clickButtonText(cdp,'Finish phone session');await clickButtonText(cdp,'Go to sleep');
    for(let day=2;day<=3;day++){await meal(false);await scheduledWork();await meal(false);await earlyBed();}
    const rentBefore=await saved();assert(rentBefore.state.life.schedule.day===4 && rentBefore.state.cash<170,'Expected Day 4 rent shortfall');
    await clickButtonText(cdp,'See loan terms');const loan=await saved();assert(loan.state.life.finance.rents[0].status==='pending' && loan.state.debt>0 && loan.state.cash===170,'Loan silently paid rent or terms failed');
    await clickButtonText(cdp,'Pay Remaining rent');const paid=await saved();assert(paid.state.cash===0 && paid.state.life.finance.rents[0].status==='paid' && !paid.state.terminalRoute,'Explicit zero-cash rent payment failed');
    await clickButtonText(cdp,'Finish run');await waitForSelector(cdp,'#receipt-paper');
    const summary=await evalExpr(cdp,"document.querySelector('.receipt-totals')?.innerText");assert(summary?.includes('$0.00') && !summary.includes('Unavailable'),'Five-slot Receipt totals missing');
    const finished=await saved();assert(finished.eventLog.filter(e=>e.type==='terminal').length===1,'Terminal duplicated');

    await evalExpr(cdp,"localStorage.setItem('quackpot_save_v1','{\\\"schemaVersion\\\":1,\\\"savedAt\\\":123,\\\"broken\\\":true}')");await reload();await waitForSelector(cdp,'#btn-corrupt-backup');await clickSelector(cdp,'#btn-corrupt-backup');
    assert((await evalExpr(cdp,"localStorage.getItem('quackpot_save_v1')"))?.includes('broken') && (await evalExpr(cdp,"localStorage.getItem('quackpot_save_backup')"))?.includes('broken'),'Corrupt primary or backup not preserved');
    await resetAndLoadFresh(cdp);await waitForSelector(cdp,'#morning-setup-form');
    await evalExpr(cdp,"Storage.prototype.setItem=function(){throw new Error('QuotaExceededError: synthetic disk full')}");await evalExpr(cdp,"document.querySelector('#morning-setup-form').requestSubmit()");await sleep(300);
    assert((await evalExpr(cdp,"document.querySelector('#storage-warning-banner')?.innerText"))?.includes('Storage Warning'),'Automatic quota warning missing');
    await clickSelector(cdp,'#btn-manual-save');assert((await evalExpr(cdp,"document.querySelector('#storage-warning-banner')?.innerText"))?.includes('Storage Warning'),'Manual quota warning missing');
    await resetAndLoadFresh(cdp);await waitForSelector(cdp,'#morning-autosave');await evalExpr(cdp,"document.querySelector('#morning-autosave').checked=false;document.querySelector('#morning-setup-form').requestSubmit()");await sleep(300);
    await meal(false);assert(await evalExpr(cdp,"localStorage.getItem('quackpot_save_v1')")===null,'Autosave disabled wrote data');await clickSelector(cdp,'#btn-manual-save');
    assert(Boolean(await evalExpr(cdp,"localStorage.getItem('quackpot_save_v1')")),'Manual save missing');
    validateRequests(Array.from(reloadRequests.values()),{expectedOrigin:EXPECTED_ORIGIN,expectedSubpath:BASE_PATH,isReload:true});validateConsoleAndErrors(consoleLogs,runtimeExceptions);
    const sourceAtEnd=await currentPlan52SourceClosure();assert(sourceAtEnd.sha256===sourceAtStart.sha256,'Source changed during smoke run');
    const observationRecord={timestamp:new Date().toISOString(),browser:browserMeta.Browser,origin:EXPECTED_ORIGIN,subpath:BASE_PATH,expectedBuildChunks:expectedChunks,sourceClosureSha256:sourceAtStart.sha256,smokeScriptSha256:sha256(readFileSync('scripts/dev/smoke-browser.mjs')),buildJsSha256:sha256(readFileSync(path.resolve('dist/assets',expectedChunks.js))),buildCssSha256:sha256(readFileSync(path.resolve('dist/assets',expectedChunks.css))),
      initialLoad:{requests:initialReqList.map(({requestId,...rest})=>rest),dom:domPhase1},reload:{requests:reloadReqList.map(({requestId,...rest})=>rest),dom:domPhase2},trailingSlash:trailingSlashObservation,dialogs,
      checks:{earlyUninstallReceipt:true,purchase:true,midRevealReload:true,repeatRetention:true,raceResultReloadReducedMotion:true,rentLoanSeparatePaymentZeroCash:true,financialReceipt:true,corruptSavePreserved:true,syntheticQuotaWarnings:true,autosaveDisabledManualSave:true},
      limits:['The rent-shortfall route deliberately buys 12 fictional Gem bundles and completes scheduled shifts; it is not a nonspending balance claim.','Legacy starter-offer, automatic rent escalation and old zero-cash modal journeys retired; five-slot decisions exercised instead.','Race result smoke uses reduced motion and does not validate normal playback timing.']};
    writeFileSync(OBSERVATION_OUTPUT_PATH,JSON.stringify(observationRecord,null,2),'utf8');
    console.log(`Five-slot UI smoke passed; observations: ${OBSERVATION_OUTPUT_PATH}`);

  } finally {
    await cleanup();
  }
}

runSmoke().catch((err) => {
  console.error('\nSmoke test failed:', err);
  process.exit(1);
});
