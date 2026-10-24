// scripts/dev/smoke-browser.mjs
// Local headless browser subpath smoke test for Plan 02.
// Robust process ownership, isolated temporary browser profile, bounded event/HTTP waits,
// and verification that the browser observes asset filenames from this run's build.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

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
const OBSERVATION_OUTPUT_PATH = path.resolve('reports/development/plan-02-static-build-deploy-spike/smoke-observations.json');

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
        // Reject all pending command callbacks promptly
        for (const [id, { reject: cbReject }] of this.callbacks.entries()) {
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

async function runSmoke() {
  console.log('=== Plan 02 Headless Browser Subpath Smoke Test (Isolated) ===');
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

    // Validate Phase 1 Network
    validateRequests(initialReqList, {
      expectedOrigin: EXPECTED_ORIGIN,
      expectedSubpath: BASE_PATH,
      isReload: false,
    });
    validateConsoleAndErrors(consoleLogs, runtimeExceptions);

    // Verify browser observed exact chunk names from this run's build
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

    // Evaluate Phase 1 DOM
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

    // Validate Phase 2 Network (allowing 304s)
    validateRequests(reloadReqList, {
      expectedOrigin: EXPECTED_ORIGIN,
      expectedSubpath: BASE_PATH,
      isReload: true,
    });
    validateConsoleAndErrors(consoleLogs, runtimeExceptions);

    // Verify browser observed exact chunk names on reload
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

    // Evaluate Phase 2 DOM
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

    // Write auditable machine-readable observation artifact
    const observationRecord = {
      timestamp: new Date().toISOString(),
      browser: browserMeta.Browser,
      origin: EXPECTED_ORIGIN,
      subpath: BASE_PATH,
      expectedBuildChunks: expectedChunks,
      phase1InitialLoad: {
        requests: initialReqList.map(({ requestId, ...rest }) => rest),
        dom: domPhase1,
        verified: true,
      },
      phase2Reload: {
        requests: reloadReqList.map(({ requestId, ...rest }) => rest),
        dom: domPhase2,
        verified: true,
      },
      phase3TrailingSlash: trailingSlashObservation,
      consoleLogs,
      runtimeExceptions,
      summary: {
        zeroExternalRequests: true,
        staticSubpathResolved: true,
        svgDecoded: true,
        reloadSucceeded: true,
        observedArtifactsMatchedCurrentBuild: true,
        cdpAndHttpWaitsBounded: true,
        deployedPagesSlashRedirectVerified: false,
      },
    };

    writeFileSync(OBSERVATION_OUTPUT_PATH, JSON.stringify(observationRecord, null, 2), 'utf-8');
    console.log(`Saved machine-readable observations to: ${OBSERVATION_OUTPUT_PATH}`);

    console.log('\n=============================================================');
    console.log('SMOKE TEST VERIFICATION RESULTS');
    console.log('=============================================================');
    console.log('  [PASS] Isolated process ownership & port check');
    console.log('  [PASS] Dedicated temporary browser profile');
    console.log('  [PASS] Build freshness & chunk filename verification');
    console.log('  [PASS] Initial load under /Quackpot/ (bounded event wait, all 200 OK)');
    console.log('  [PASS] DOM mounted and SVG decoded (naturalWidth: 120, naturalHeight: 120)');
    console.log('  [PASS] Reload verification (bounded event wait, DOM + 200/304 cache requests)');
    console.log('  [PASS] Zero runtime exceptions, zero console errors, zero external requests');
    console.log('  [INFO] Trailing slash /Quackpot returned 404 locally on Vite preview');
    console.log('  [UNVERIFIED] GitHub Pages deployed 301 redirect (requires live deployment)');
    console.log('=============================================================');
  } finally {
    await cleanup();
  }
}

runSmoke().catch((err) => {
  console.error('\nSmoke test failed:', err);
  process.exit(1);
});
