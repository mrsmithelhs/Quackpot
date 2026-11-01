// Isolated headless Chrome verification of the Plan 39 v3 Web Audio Laboratory.
// Run only via reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const engine = require("./synth-engine.js");

const ROOT = "C:/AI/Quackpot";
const LAB_DIR = path.join(ROOT, "reports/development/plan-39-melody-reference-and-web-audio-laboratory");
const PAGE_PATH = path.join(LAB_DIR, "index.html");
const EXPORTS_DIR = path.join(LAB_DIR, "exports");
const CHROME = process.env.QUACKPOT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const HOST = "127.0.0.1";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

let profileDir = null;
let downloadTmpDir = null;
let chromeChild = null;
let chromeStderr = "";
let browserCdp = null;
let pageCdp = null;
const downloadRecords = new Map();
const networkRequests = [];
const pageErrors = [];

function connectCdp(url, label) {
  const socket = new WebSocket(url);
  let nextId = 1;
  const pending = new Map();
  const handlers = new Set();
  const openPromise = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} WebSocket open timeout`)), 5000);
    socket.onopen = () => { clearTimeout(t); resolve(); };
    socket.onerror = () => { clearTimeout(t); reject(new Error(`${label} WebSocket error`)); };
  });

  socket.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.id && pending.has(msg.id)) {
      const entry = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(entry.timer);
      if (msg.error) entry.reject(new Error(`${label} ${entry.method}: ${msg.error.message}`));
      else entry.resolve(msg.result || {});
      return;
    }
    if (msg.method) {
      for (const h of handlers) h(msg.method, msg.params || {});
    }
  };

  return {
    async ready() { await openPromise; },
    onEvent(fn) { handlers.add(fn); },
    send(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`${label} ${method} timed out`));
        }, 15000);
        pending.set(id, { resolve, reject, timer, method });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { try { socket.close(); } catch {} }
  };
}

async function evaluate(cdp, expression) {
  const res = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.text || "Browser evaluation exception");
  }
  return res.result?.value;
}

async function waitUntil(fn, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const val = await fn();
    if (val) return val;
    await delay(100);
  }
  throw new Error(`Timeout waiting for ${label}`);
}

async function cleanup() {
  pageCdp?.close();
  browserCdp?.close();
  if (chromeChild?.pid && !chromeChild.exitCode) {
    const killer = spawn("taskkill.exe", ["/PID", String(chromeChild.pid), "/T", "/F"], { windowsHide: true });
    await new Promise((r) => killer.once("close", r));
  }
  await delay(250);
  if (profileDir && existsSync(profileDir)) {
    try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
  if (downloadTmpDir && existsSync(downloadTmpDir)) {
    try { rmSync(downloadTmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function main() {
  if (!existsSync(PAGE_PATH)) throw new Error(`Missing laboratory HTML: ${PAGE_PATH}`);
  if (!existsSync(CHROME)) throw new Error(`Missing Chrome executable: ${CHROME}`);

  mkdirSync(EXPORTS_DIR, { recursive: true });
  profileDir = mkdtempSync(path.join(os.tmpdir(), "quackpot-plan39-chrome-"));
  downloadTmpDir = mkdtempSync(path.join(os.tmpdir(), "quackpot-plan39-dl-"));

  const pageUrl = pathToFileURL(PAGE_PATH).href;
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "--window-size=1280,900",
    pageUrl
  ];

  chromeChild = spawn(CHROME, args, { cwd: ROOT, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  chromeChild.stderr.on("data", chunk => { chromeStderr = (chromeStderr + chunk.toString()).slice(-8000); });
  const portFile = path.join(profileDir, "DevToolsActivePort");
  const endpoint = await waitUntil(() => {
    if (!existsSync(portFile)) return null;
    const lines = readFileSync(portFile, "utf8").trim().split(/\r?\n/);
    const port = Number(lines[0]);
    return port > 0 && lines[1] ? { port, browserPath: lines[1] } : null;
  }, 8000, "DevToolsActivePort");

  browserCdp = connectCdp(`ws://${HOST}:${endpoint.port}${endpoint.browserPath}`, "Browser");
  await browserCdp.ready();
  browserCdp.onEvent((method, params) => {
    if (method === "Browser.downloadWillBegin") {
      downloadRecords.set(params.guid, { guid: params.guid, name: params.suggestedFilename, state: "inProgress" });
    }
    if (method === "Browser.downloadProgress") {
      const rec = downloadRecords.get(params.guid) || { guid: params.guid };
      Object.assign(rec, { state: params.state, receivedBytes: params.receivedBytes });
      downloadRecords.set(params.guid, rec);
    }
  });
  await browserCdp.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadTmpDir,
    eventsEnabled: true
  });

  const target = await waitUntil(async () => {
    const res = await fetch(`http://${HOST}:${endpoint.port}/json/list`);
    const list = await res.json();
    return list.find((t) => t.type === "page" && t.url === pageUrl && t.webSocketDebuggerUrl) || null;
  }, 6000, "Page target");

  pageCdp = connectCdp(target.webSocketDebuggerUrl, "Page");
  await pageCdp.ready();
  await pageCdp.send("Page.enable");
  await pageCdp.send("Runtime.enable");
  await pageCdp.send("Network.enable");
  await pageCdp.send("Network.setBlockedURLs", { urls: ["http://*", "https://*"] });

  pageCdp.onEvent((method, params) => {
    if (method === "Network.requestWillBeSent") {
      networkRequests.push(params.request?.url || "");
    }
    if (method === "Runtime.exceptionThrown") {
      pageErrors.push(params.exceptionDetails?.text || "Runtime exception");
    }
  });

  await waitUntil(
    () => evaluate(pageCdp, `document.readyState === "complete" && Boolean(window.QUACKPOT_PLAN39_ENGINE)`),
    5000,
    "Laboratory boot"
  );


  const result = await evaluate(pageCdp, `(async () => {
    const e = window.QUACKPOT_PLAN39_ENGINE;
    const configs = [
      { candidateId: "C0-original", harmonyId: "H0-dry", patchId: "P0-plan32-triangle", tempoBpm: 100, layerMode: "full" },
      { candidateId: "M3-horizon-drift", harmonyId: "H-B1-horizon", patchId: "TS-flute-harp", leadProgramId: "GM-12-marimba", chordsProgramId: "GM-46-harp", bassProgramId: "GM-32-acoustic-bass", tempoBpm: 104, layerMode: "full", roomAir: true, microGroove: true },
      { candidateId: "M3-horizon-drift", harmonyId: "H-B1-horizon", patchId: "TS-flute-harp", tempoBpm: 92, layerMode: "conditioning-skeleton" }
    ];
    const cases = [];
    for (const cfg of configs) {
      const score = e.buildScheduledScore(cfg);
      const one = await e.renderOfflineWav(score);
      const wrap = await e.renderOfflineWav(e.buildScheduledScore({ ...cfg, seamlessLoopWrap: true }));
      const manifest = e.createExportManifest(score, { safetyScale: one.safetyScale });
      const restored = e.validateImportedManifest(JSON.parse(JSON.stringify(manifest)));
      const hdr = e.parseWavHeader(one.wav.arrayBuffer);
      const whdr = e.parseWavHeader(wrap.wav.arrayBuffer);
      if (!restored.valid || hdr.channels !== 2 || hdr.sampleRate !== 48000 || whdr.frames !== Math.round(score.phraseSeconds * hdr.sampleRate) || one.measured.isClipped || wrap.measured.isClipped) throw new Error("render/restore assertion failed " + cfg.candidateId);
      cases.push({ cfg, events: score.leadEvents.length + score.chordEvents.length + score.bassEvents.length, phrase: score.phraseSeconds, duration: score.durationSeconds, one: { header: hdr, measured: one.measured, scale: one.safetyScale }, wrap: { header: whdr, measured: wrap.measured, scale: wrap.safetyScale }, restored: restored.valid });
    }
    return cases;
  })()`);
  // Restore through the real file-input handler, then inspect visible controls.
  await evaluate(pageCdp, `(() => {
    const e = window.QUACKPOT_PLAN39_ENGINE;
    const score = e.buildScheduledScore({candidateId:'M3-horizon-drift', harmonyId:'H-B1-horizon', patchId:'TS-flute-harp', tempoBpm:104, layerMode:'conditioning-skeleton', layerGains:{lead:0.7,chords:0.8,bass:0.6}});
    const file = new File([JSON.stringify(e.createExportManifest(score))], 'restore.json', {type:'application/json'});
    const transfer = new DataTransfer(); transfer.items.add(file);
    const input = document.querySelector('#import-json-input'); input.files = transfer.files; input.dispatchEvent(new Event('change', {bubbles:true}));
  })()`);
  await waitUntil(() => evaluate(pageCdp, `document.querySelector('#candidate-select').value === 'M3-horizon-drift' && document.querySelector('#tempo-select').value === '104' && document.querySelector('#layer-mode-select').value === 'conditioning-skeleton'`), 5000, 'manifest UI restore');
  // A trusted click unlocks AudioContext. Record scheduled oscillator starts;
  // this checks two joins in audio time, not what a person hears.
  await evaluate(pageCdp, `(() => { document.querySelector('[data-select-only="C0-original"]').click(); document.querySelector('#loop-toggle').checked = true; window.__starts = []; const original = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function(t) { window.__starts.push(t); return original.call(this,t); }; })()`);
  async function click(selector) {
    const pt = await evaluate(pageCdp, `(() => { const e=document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()`);
    await pageCdp.send('Input.dispatchMouseEvent', {type:'mousePressed', x:pt.x, y:pt.y, button:'left', clickCount:1});
    await pageCdp.send('Input.dispatchMouseEvent', {type:'mouseReleased', x:pt.x, y:pt.y, button:'left', clickCount:1});
  }
  await click('#play-selected-btn');
  await waitUntil(() => evaluate(pageCdp, `window.__starts.length >= 30`), 13000, 'two scheduled loop joins');
  const starts = await evaluate(pageCdp, `window.__starts.slice(0,30)`);
  if (Math.abs((starts[10]-starts[0])-4.8)>0.00001 || Math.abs((starts[20]-starts[10])-4.8)>0.00001) throw new Error('loop audio-time join mismatch');
  await click('#stop-btn');
  const countAfterStop = await evaluate(pageCdp, `window.__starts.length`);
  await delay(300);
  if (await evaluate(pageCdp, `window.__starts.length`) !== countAfterStop) throw new Error('new starts after stop');
  // UI lifecycle: six explicit C0 exports exercise bounded retained bundle eviction.
  await evaluate(pageCdp, `document.querySelector('[data-select-only="C0-original"]').click()`);
  for (let i = 0; i < 6; i++) {
    await evaluate(pageCdp, `document.querySelector('#render-export-btn').click()`);
    await waitUntil(() => evaluate(pageCdp, `!document.querySelector('#render-export-btn').disabled && document.querySelectorAll('.export-bundle-card').length >= ${Math.min(i + 1, 5)}`), 12000, `export ${i+1}`);
  }
  const ui = await evaluate(pageCdp, `({ cards: document.querySelectorAll('.export-bundle-card').length, status: document.querySelector('#render-export-btn').disabled })`);
  if (ui.cards !== 5 || ui.status) throw new Error('export retention failure');
  const report = { cases: result, ui, loop: { starts, countAfterStop }, pageErrors, networkRequests, note: 'Headless browser graph/render evidence only; no physical listening or live/WAV sample-identity claim.' };
  if (pageErrors.length || networkRequests.some(u => /^https?:/.test(u))) throw new Error(JSON.stringify(report));
  const reportPath = path.join(LAB_DIR, 'repair-browser-evidence.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ok:true, reportPath, cases:result.length, retained:ui.cards}) + '\n');
}
main().catch(err => { process.stderr.write((err.stack || err.message) + '\nChrome stderr: ' + chromeStderr + '\n'); process.exitCode = 1; }).finally(cleanup);
