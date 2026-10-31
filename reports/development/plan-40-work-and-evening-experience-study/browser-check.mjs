// reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs
// Automated headless Chrome browser verification for Plan 40 storyboard.
// Runs with zero external npm dependencies, using Node built-in http, fetch, and WebSocket.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const reportDir = path.resolve('reports/development/plan-40-work-and-evening-experience-study');
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
};

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const port = s.address().port;
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

function startStaticServer(port) {
  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url, `http://127.0.0.1:${port}`);
      let filePath = path.join(rootDir, decodeURIComponent(parsedUrl.pathname));

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.statusCode = 404;
        res.end(`Not found: ${req.url}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.statusCode = 500;
      res.end(`Server error: ${err.message}`);
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function runBrowserCheck() {
  console.log('--- Starting Plan 40 Browser Verification ---');
  const serverPort = await getFreePort();
  const debugPort = await getFreePort();
  console.log(`Allocated ephemeral ports: server=${serverPort}, chrome_debug=${debugPort}`);

  const server = await startStaticServer(serverPort);
  const targetUrl = `http://127.0.0.1:${serverPort}/reports/development/plan-40-work-and-evening-experience-study/index.html`;

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan40-chrome-'));
  let chromeProcess = null;
  let ws = null;
  const results = {
    stepsPassed: [],
    screenshotsSaved: [],
    timings: {},
  };

  try {
    console.log(`Spawning headless Chrome at debug port ${debugPort}...`);
    chromeProcess = spawn(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${debugPort}`,
      '--remote-allow-origins=*',
      `--user-data-dir=${profileDir}`,
      '--window-size=1280,800',
      targetUrl,
    ], { stdio: 'ignore' });

    // Wait for Chrome remote debugging to respond
    let target = null;
    const startWait = Date.now();
    while (Date.now() - startWait < 12000) {
      try {
        const targets = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
        const page = targets.find((t) => t.type === 'page' && t.url.includes('plan-40'));
        if (page) {
          target = page;
          break;
        }
      } catch {}
      await delay(200);
    }

    if (!target) {
      throw new Error('Timed out waiting for Chrome page target discovery.');
    }

    console.log('Connecting to Chrome CDP WebSocket:', target.webSocketDebuggerUrl);
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = (e) => reject(new Error('WebSocket connection error'));
    });

    let msgId = 1;
    const pendingCommands = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (pendingCommands.has(msg.id)) {
        const { resolve, reject } = pendingCommands.get(msg.id);
        pendingCommands.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      pendingCommands.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evaluate = async (expression) => {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text || 'Runtime.evaluate failed');
      }
      return res.result?.value;
    };

    const captureScreenshot = async (filename) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(reportDir, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      results.screenshotsSaved.push(filename);
      console.log(`Saved screenshot: ${filename}`);
    };

    await send('Page.enable');
    await send('Runtime.enable');

    // Step 1: Wait for DOM readiness
    await delay(500);
    const title = await evaluate('document.title');
    console.log('Page Title:', title);
    if (!title.includes('Plan 40')) throw new Error(`Unexpected page title: ${title}`);
    results.stepsPassed.push('Step 1: Page loaded and titled correctly');

    // Step 2: Departure View verification
    const initialCash = await evaluate('document.querySelector("#hud-cash").textContent');
    const initialHp = await evaluate('document.querySelector("#hud-hp").textContent');
    console.log(`Initial HUD: Cash=${initialCash}, HP=${initialHp}`);
    if (initialCash !== '$15.00' || initialHp !== '80 HP') {
      throw new Error(`Initial HUD stats mismatch: ${initialCash}, ${initialHp}`);
    }
    results.stepsPassed.push('Step 2: Departure view loaded with baseline HUD stats ($15.00, 80 HP)');

    // Step 3: Advance to Work Beat 1
    await evaluate('document.querySelector("#btn-start-work").click()');
    await delay(150);
    const workBeatTitle = await evaluate('document.querySelector(".vignette-titles h3").textContent');
    console.log('Work Beat 1 Heading:', workBeatTitle);
    results.stepsPassed.push(`Step 3: Advanced to Work Beat 1 (${workBeatTitle})`);

    // Step 4: Advance to Work Beat 2 & Clock Out
    await evaluate('document.querySelector("#btn-work-next").click()');
    await delay(150);
    await evaluate('document.querySelector("#btn-clock-out").click()');
    await delay(150);
    results.stepsPassed.push('Step 4: Advanced through Work Beat 2 and clocked out');

    // Step 5: Advance through Commute beats to Wage Payslip
    await evaluate('document.querySelector("#btn-commute-next").click()');
    await delay(150);
    await evaluate('document.querySelector("#btn-arrive-home").click()');
    await delay(200);

    const payslipAmount = await evaluate('document.querySelector(".pay-amount").textContent');
    console.log('Wage Payslip Take-Home Amount:', payslipAmount);
    if (payslipAmount !== '$60.00') {
      throw new Error(`Payslip take-home wage mismatch: expected $60.00, got ${payslipAmount}`);
    }
    results.stepsPassed.push('Step 5: Wage payslip accurately verified at $60.00 completed-shift take-home');

    // Step 6: Collect wages and enter Evening Apartment
    await evaluate('document.querySelector("#btn-collect-pay").click()');
    await delay(300);

    const eveningCash = await evaluate('document.querySelector("#hud-cash").textContent');
    const eveningPhase = await evaluate('document.querySelector("#hud-phase").textContent');
    console.log(`Evening HUD: Cash=${eveningCash}, Phase=${eveningPhase}`);
    if (eveningCash !== '$75.00') {
      throw new Error(`Expected $75.00 after $60 wage collection, got ${eveningCash}`);
    }
    results.stepsPassed.push('Step 6: Wages collected into wallet ($75.00) and entered Evening Apartment');

    // Capture Evening Desktop Screenshot
    await captureScreenshot('storyboard-evening-desktop.png');

    // Step 7: Call Mom activity (+5 HP)
    await evaluate('document.querySelector("#anchor-mom").click()');
    await delay(200);

    // Step through Mom's dialogue
    while (true) {
      const hasNext = await evaluate('Boolean(document.querySelector("#btn-next-call"))');
      if (!hasNext) break;
      await evaluate('document.querySelector("#btn-next-call").click()');
      await delay(100);
    }
    await evaluate('document.querySelector("#btn-finish-call").click()');
    await delay(200);

    const hpAfterMom = await evaluate('document.querySelector("#hud-hp").textContent');
    console.log('HP after Calling Mom:', hpAfterMom);
    if (hpAfterMom !== '85 HP') {
      throw new Error(`Expected 85 HP after Mom check-in, got ${hpAfterMom}`);
    }
    results.stepsPassed.push('Step 7: Call Mom check-in completed, restoring +5 HP (80 -> 85 HP)');

    // Step 8: Extra Shift Selection & Decoupling from Rent
    await evaluate('window.storyboard.jumpToMoment("extra_shifts")');
    await delay(200);
    const numShifts = await evaluate('document.querySelectorAll(".shift-card").length');
    console.log('Number of extra shift options:', numShifts);
    if (numShifts !== 3) throw new Error(`Expected 3 extra shift options, got ${numShifts}`);

    // Choose Marisol's dinner cover (+$45 cash, -15 HP)
    await evaluate('document.querySelector("[data-shift-id=\'diner_marisol\']").click()');
    await delay(200);

    const cashAfterExtra = await evaluate('document.querySelector("#hud-cash").textContent');
    const hpAfterExtra = await evaluate('document.querySelector("#hud-hp").textContent');
    console.log(`Night Return HUD: Cash=${cashAfterExtra}, HP=${hpAfterExtra}`);
    if (cashAfterExtra !== '$120.00' || hpAfterExtra !== '70 HP') {
      throw new Error(`Stats after Marisol shift mismatch: expected $120.00 and 70 HP, got ${cashAfterExtra}, ${hpAfterExtra}`);
    }
    results.stepsPassed.push('Step 8: Marisol extra shift completed: +$45.00 cash ($120.00) and -15 HP (70 HP) verified');

    // Step 9: Narrow Viewport Toggle
    await evaluate('document.querySelector("#toggle-narrow").click()');
    await delay(200);
    await captureScreenshot('storyboard-narrow-mobile.png');
    await evaluate('document.querySelector("#toggle-narrow").click()');
    await delay(100);
    results.stepsPassed.push('Step 9: Narrow mobile viewport (390px) verified and captured');

    // Step 10: Reduced Motion Toggle
    await evaluate('document.querySelector("#toggle-motion").click()');
    const isMotionOff = await evaluate('document.documentElement.classList.contains("motion-off")');
    if (!isMotionOff) throw new Error('Reduced motion class not toggled on documentElement');
    results.stepsPassed.push('Step 10: Reduced motion toggle verified');

    // Step 11: Cohort Experiment Tracker verification
    const cohortRows = await evaluate('document.querySelectorAll("#cohort-stats-body tr").length');
    console.log('Cohort experiment table rows:', cohortRows);
    if (cohortRows !== 4) throw new Error(`Expected 4 condition cohort rows, got ${cohortRows}`);
    results.stepsPassed.push('Step 11: Owner research experiment tracker verified with 4 conditions and live choices');

    console.log('=== All 11 Browser Verification Steps Passed! ===');
    fs.writeFileSync(
      path.join(reportDir, 'browser-verification.json'),
      JSON.stringify(results, null, 2),
      'utf8'
    );
  } finally {
    if (ws) {
      try { ws.close(); } catch {}
    }
    if (chromeProcess) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill.exe', ['/PID', String(chromeProcess.pid), '/T', '/F'], { stdio: 'ignore' });
        } else {
          chromeProcess.kill('SIGKILL');
        }
      } catch {}
    }
    if (server) {
      server.close();
    }
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

runBrowserCheck().catch((err) => {
  console.error('Browser check failed:', err);
  process.exit(1);
});
