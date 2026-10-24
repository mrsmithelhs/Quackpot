// scripts/dev/smoke-browser.mjs
// Local headless browser subpath smoke test for Plan 02.
// Exercises Vite preview static server and headless Chrome over CDP.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

const PREVIEW_PORT = 4173;
const HOST = '127.0.0.1';
const BASE_PATH = '/Quackpot/';
const BASE_URL = `http://${HOST}:${PREVIEW_PORT}${BASE_PATH}`;
const NO_SLASH_URL = `http://${HOST}:${PREVIEW_PORT}/Quackpot`;
const CDP_PORT = 9222;

function findBrowserBinary() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  throw new Error('No supported Chrome or Edge binary found at standard paths.');
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEndpoint(url, timeoutMs = 10000) {
  const start = Date.now();
  let lastErr = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304) return res;
    } catch (err) {
      lastErr = err;
    }
    await sleep(200);
  }
  throw new Error(`Endpoint ${url} failed to respond within ${timeoutMs}ms. Last error: ${lastErr?.message}`);
}

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method) {
          const handlers = this.eventHandlers.get(msg.method) || [];
          for (const handler of handlers) handler(msg.params);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runSmoke() {
  console.log('=== Plan 02 Headless Browser Subpath Smoke Test ===');
  const browserBin = findBrowserBinary();
  console.log('Using browser binary:', browserBin);

  // 1. Spawn Vite preview directly via Node
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  console.log(`Spawning Vite preview directly: ${viteBin} on ${HOST}:${PREVIEW_PORT}...`);
  const previewProc = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', HOST, '--port', String(PREVIEW_PORT), '--strictPort'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  previewProc.stdout.on('data', (d) => {
    const s = d.toString();
    if (s.includes('Local:')) console.log('[Vite Preview]', s.trim());
  });

  previewProc.stderr.on('data', (d) => {
    const s = d.toString();
    if (s.includes('error')) console.error('[Vite Preview Error]', s.trim());
  });

  // 2. Spawn headless Chrome
  console.log(`Spawning headless Chrome with CDP port ${CDP_PORT}...`);
  const chromeProc = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
  ]);

  try {
    // Wait for both endpoints
    console.log('Waiting for Preview server to become ready...');
    await waitForEndpoint(BASE_URL, 10000);
    console.log('Preview server ready at', BASE_URL);

    console.log('Waiting for Chrome CDP endpoint...');
    await waitForEndpoint(`http://${HOST}:${CDP_PORT}/json/version`, 10000);
    console.log('Chrome CDP ready.');

    // Discover browser target / create page
    const newPageRes = await fetch(`http://${HOST}:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' });
    const targetInfo = await newPageRes.json();
    console.log('Browser page created. Target ID:', targetInfo.id);

    const cdp = new CdpSession(targetInfo.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('CDP WebSocket connected.');

    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const requestsMap = new Map();
    const consoleLogs = [];

    cdp.on('Network.requestWillBeSent', (params) => {
      if (params.request.url.startsWith('http://') || params.request.url.startsWith('https://')) {
        requestsMap.set(params.requestId, {
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
      if (requestsMap.has(params.requestId)) {
        const item = requestsMap.get(params.requestId);
        item.status = params.response.status;
        item.mimeType = params.response.mimeType;
      }
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      const text = params.args.map((a) => a.value ?? JSON.stringify(a)).join(' ');
      consoleLogs.push({ type: params.type, text });
      console.log(`[Browser Console ${params.type}]`, text);
    });

    // --- PHASE 1: Initial load at subpath /Quackpot/ ---
    console.log(`\nNavigating to ${BASE_URL}...`);
    const loadPromise = new Promise((resolve) => {
      cdp.on('Page.loadEventFired', resolve);
    });

    await cdp.send('Page.navigate', { url: BASE_URL });
    await loadPromise;
    await sleep(800); // let rendering, favicon & scripts finish

    const recordedRequests = Array.from(requestsMap.values());
    console.log('\n--- Initial Load Network Activity ---');
    console.table(recordedRequests.map(({ requestId, ...rest }) => rest));

    // Evaluate DOM
    const evalRes = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const app = document.querySelector('#app');
        const h1 = document.querySelector('h1')?.textContent;
        const duckImg = document.querySelector('.duck-img');
        const badges = Array.from(document.querySelectorAll('.status-badge')).map(b => b.textContent);
        return {
          h1,
          hasApp: Boolean(app),
          duckSrc: duckImg?.src,
          duckComplete: duckImg?.complete,
          duckNaturalWidth: duckImg?.naturalWidth,
          duckNaturalHeight: duckImg?.naturalHeight,
          badgeCount: badges.length,
          allPass: badges.every(b => b === 'PASS')
        };
      })()`,
      returnByValue: true,
    });

    console.log('DOM Evaluation Result:', evalRes.result.value);

    // Assertions for initial load
    const dom = evalRes.result.value;
    if (!dom.hasApp || dom.h1 !== 'Quackpot Static Spike') {
      throw new Error(`DOM assertion failed: h1 is "${dom.h1}", expected "Quackpot Static Spike"`);
    }
    if (!dom.duckComplete || dom.duckNaturalWidth === 0) {
      throw new Error(`Duck SVG image failed to render or decode: naturalWidth=${dom.duckNaturalWidth}`);
    }
    if (!dom.allPass || dom.badgeCount !== 4) {
      throw new Error(`Badge assertions failed: count=${dom.badgeCount}, allPass=${dom.allPass}`);
    }

    // Verify all requests are local to /Quackpot/
    for (const req of recordedRequests) {
      const u = new URL(req.url);
      if (u.hostname !== HOST && u.hostname !== 'localhost') {
        throw new Error(`VIOLATION: External network request detected to ${req.url}`);
      }
      if (req.status !== 200 && req.status !== 304) {
        throw new Error(`Request failed with status ${req.status}: ${req.url}`);
      }
    }
    console.log('✓ Initial load: All requests local, zero external network calls, DOM and SVG verified.');

    // --- PHASE 2: Page Reload Verification ---
    console.log('\n--- Performing Page Reload ---');
    const reloadMap = new Map();
    const reloadReqListener = (params) => {
      if (params.request.url.startsWith('http://') || params.request.url.startsWith('https://')) {
        reloadMap.set(params.requestId, {
          url: params.request.url,
          method: params.request.method,
          status: null,
        });
      }
    };
    const reloadRespListener = (params) => {
      if (reloadMap.has(params.requestId)) {
        reloadMap.get(params.requestId).status = params.response.status;
      }
    };
    cdp.on('Network.requestWillBeSent', reloadReqListener);
    cdp.on('Network.responseReceived', reloadRespListener);

    const reloadPromise = new Promise((resolve) => {
      cdp.on('Page.loadEventFired', resolve);
    });
    await cdp.send('Page.reload', { ignoreCache: false });
    await reloadPromise;
    await sleep(600);

    const reloadList = Array.from(reloadMap.values());
    console.log(`Reload completed. Recorded ${reloadList.length} requests during reload:`);
    console.table(reloadList);
    for (const req of reloadList) {
      if (req.status !== 200 && req.status !== 304) {
        throw new Error(`Reload request failed with status ${req.status}: ${req.url}`);
      }
    }
    console.log('✓ Reload verified without errors.');

    // --- PHASE 3: Trailing Slash Test (/Quackpot) ---
    console.log(`\n--- Testing Trailing Slash: ${NO_SLASH_URL} ---`);
    const noSlashRes = await fetch(NO_SLASH_URL, { redirect: 'manual' });
    console.log(`Fetch ${NO_SLASH_URL} status:`, noSlashRes.status);
    console.log(`Location header:`, noSlashRes.headers.get('location'));

    if (noSlashRes.status === 301 || noSlashRes.status === 308 || noSlashRes.status === 302) {
      console.log(`✓ Server correctly redirects /Quackpot to trailing slash: ${noSlashRes.headers.get('location')}`);
    } else if (noSlashRes.status === 200) {
      console.log(`✓ Server directly serves /Quackpot with 200 OK.`);
    } else {
      console.warn(`Trailing slash returned unexpected status ${noSlashRes.status}`);
    }

    cdp.close();
    console.log('\n=== SMOKE TEST PASSED: ALL CHECKS VERIFIED ===');
  } finally {
    // Teardown
    console.log('Cleaning up processes...');
    chromeProc.kill('SIGKILL');
    previewProc.kill('SIGKILL');
  }
}

runSmoke().catch((err) => {
  console.error('\nSmoke test failed:', err);
  process.exit(1);
});
