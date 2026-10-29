// Finite report-local Plan 32 render proof. Invoke only through Plan 25's
// bounded-node-run.ps1. No server, package install, or audio playback is used.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const ROOT = "C:/AI/Quackpot";
const BASE = "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview";
const MODE = process.argv[2] === "--extensions" ? "extensions" : process.argv.length === 2 ? "motifs" : "invalid";
const EXT_BASE = "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes";
const HISTORY = MODE === "extensions" ? `${EXT_BASE}/composition-preview/history` : `${BASE}/history`;
const PAGE = MODE === "extensions" ? `${EXT_BASE}/composition-preview/index.html` : `${BASE}/index.html`;
const OUTPUT = MODE === "extensions" ? `${HISTORY}/attempt-01` : `${HISTORY}/attempt-02`;
const HOST = "127.0.0.1";
const CHROME = process.env.QUACKPOT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const MAX_TOTAL_MS = 79000;
const MAX_WORK_MS = 70000;
const MAX_CLEANUP_WAIT_MS = 4500;
const MAX_STDIO_CHARS = 8192;
const CDP_COMMAND_TIMEOUT_MS = 3000;
const RENDER_TIMEOUT_MS = MODE === "extensions" ? 15000 : 8000;
const FILE_TIMEOUT_MS = 2000;
const MAX_OUTPUT_FILE_BYTES = MODE === "extensions" ? 3800000 : 2000000;
const EXPECTED_WAV_BYTES = MODE === "extensions" ? 44 + Math.ceil(19.32 * 48000) * 2 * 2 : 44 + Math.ceil((8 * 60 / 100 + 0.12) * 48000) * 2 * 2;
const IDS = MODE === "extensions" ? ["S1", "S2", "S3"] : ["A", "B", "C"];
const SOURCE_FILES = MODE === "extensions"
  ? [`${EXT_BASE}/composition-extensions.js`, `${EXT_BASE}/composition-preview/index.html`, `${EXT_BASE}/composition-preview/preview.css`, `${EXT_BASE}/composition-preview/preview.js`, `${BASE}/runner.mjs`]
  : ["index.html", "preview.css", "motifs.js", "preview.js", "runner.mjs"].map((file) => `${BASE}/${file}`);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const startedAt = Date.now();

let profile = null;
let activeOutputPath = null;
let chromeRecord = null;
let browserCdp = null;
let pageCdp = null;
let workDeadlineTimer = null;
let totalWatchdogTimer = null;
let workTimedOut = false;
let totalTimedOut = false;
let cleanupPromise = null;
let fatalError = null;
let sourceRequests = [];
const stopPromises = new WeakMap();
const downloadRecords = new Map();

class BoundedText {
  constructor() { this.value = ""; }
  append(chunk) {
    if (this.value.length < MAX_STDIO_CHARS) this.value += chunk.toString("utf8").slice(0, MAX_STDIO_CHARS - this.value.length);
  }
}

function ownedSpawn(command, args, options = {}) {
  const child = spawn(command, args, { windowsHide: true, ...options });
  const record = { child, command, args, cwd: options.cwd, error: null, exit: null, closed: null,
    stdout: new BoundedText(), stderr: new BoundedText(), spawnedAt: new Date().toISOString() };
  child.stdout?.on("data", (chunk) => record.stdout.append(chunk));
  child.stderr?.on("data", (chunk) => record.stderr.append(chunk));
  child.once("error", (error) => { record.error = error; });
  child.once("exit", (code, signal) => { record.exit = { code, signal, at: new Date().toISOString() }; });
  child.once("close", (code, signal) => { record.closed = { code, signal, at: new Date().toISOString() }; });
  return record;
}

function waitEvent(record, eventName, timeoutMs, label) {
  const { child } = record;
  if (eventName === "exit" && record.exit) return Promise.resolve(record.exit);
  if (eventName === "close" && record.closed) return Promise.resolve(record.closed);
  if (record.error && !child.pid) return Promise.reject(new Error(`${label} failed to spawn: ${record.error.message}`));
  return new Promise((resolve, reject) => {
    let timer;
    const cleanup = () => {
      clearTimeout(timer);
      child.removeListener(eventName, onEvent);
      child.removeListener("error", onError);
    };
    const onEvent = (...args) => { cleanup(); resolve(args); };
    const onError = (error) => { cleanup(); reject(error); };
    timer = setTimeout(() => { cleanup(); reject(new Error(`${label} ${eventName} wait timed out after ${timeoutMs} ms.`)); }, timeoutMs);
    child.once(eventName, onEvent);
    child.once("error", onError);
  });
}

function remainingWorkMs() {
  return Math.max(0, Math.min(MAX_WORK_MS - (Date.now() - startedAt), MAX_TOTAL_MS - (Date.now() - startedAt)));
}

function assertWorkBudget(label, reserveMs = 1000) {
  if (workTimedOut || totalTimedOut || remainingWorkMs() <= reserveMs) {
    throw new Error(`Plan 32 ${label} reached its bounded browser-work deadline.`);
  }
}

function connectCdp(url, label) {
  const socket = new WebSocket(url);
  let nextId = 1;
  let opened = false;
  const pending = new Map();
  const eventHandlers = new Set();
  let rejectOpen;
  const openPromise = new Promise((resolve, reject) => {
    rejectOpen = reject;
    const timer = setTimeout(() => reject(new Error(`${label} WebSocket open timed out.`)), 4000);
    socket.onopen = () => { opened = true; clearTimeout(timer); resolve(); };
  });

  function rejectPending(error) {
    for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(error); }
    pending.clear();
  }

  socket.onmessage = (event) => {
    let message;
    try { message = JSON.parse(event.data); } catch { return; }
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(entry.timer);
      if (message.error) entry.reject(new Error(`${label} ${entry.method} failed: ${message.error.message}`));
      else entry.resolve(message.result || {});
      return;
    }
    if (message.method) for (const handler of eventHandlers) handler(message.method, message.params || {});
  };
  socket.onerror = () => {
    const error = new Error(`${label} WebSocket error.`);
    if (!opened) rejectOpen(error);
    rejectPending(error);
  };
  socket.onclose = () => {
    const error = new Error(`${label} WebSocket closed.`);
    if (!opened) rejectOpen(error);
    rejectPending(error);
  };

  return {
    async ready() { await openPromise; },
    onEvent(handler) { eventHandlers.add(handler); return () => eventHandlers.delete(handler); },
    send(method, params = {}) {
      if (!opened || socket.readyState !== WebSocket.OPEN) return Promise.reject(new Error(`${label} WebSocket is not open.`));
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`${label} ${method} timed out after ${CDP_COMMAND_TIMEOUT_MS} ms.`));
        }, CDP_COMMAND_TIMEOUT_MS);
        pending.set(id, { resolve, reject, timer, method });
        try { socket.send(JSON.stringify({ id, method, params })); }
        catch (error) {
          clearTimeout(timer);
          pending.delete(id);
          reject(error);
        }
      });
    },
    close() { try { socket.close(); } catch {} }
  };
}

async function waitUntil(predicate, timeoutMs, label) {
  const deadline = Date.now() + Math.min(timeoutMs, remainingWorkMs());
  let lastError = "not ready";
  while (Date.now() < deadline) {
    assertWorkBudget(label);
    try {
      const value = await predicate();
      if (value) return value;
      lastError = "condition not yet true";
    } catch (error) { lastError = error.message; }
    await delay(100);
  }
  throw new Error(`${label} timed out: ${lastError}`);
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Browser evaluation failed.");
  return result.result?.value;
}

async function stopOwned(record, label) {
  if (!record) return { stopped: true, childExited: true, treeTerminationConfirmed: true, residual: false, uncertainty: false, pid: null };
  const existing = stopPromises.get(record);
  if (existing) return existing;
  const operation = (async () => {
    const child = record.child;
    if (record.error && !child.pid) return { stopped: true, childExited: true, treeTerminationConfirmed: true, residual: false, uncertainty: false,
      pid: null, spawnError: record.error.message };
    if (record.exit) return { stopped: true, childExited: true, treeTerminationConfirmed: false, residual: false, uncertainty: true,
      pid: child.pid, exit: record.exit, reason: "Chrome exited before owned-tree termination could be confirmed" };

    const taskkillWaitMs = Math.min(2500, MAX_CLEANUP_WAIT_MS);
    const exitConfirmWaitMs = Math.max(0, MAX_CLEANUP_WAIT_MS - taskkillWaitMs);
    const killer = ownedSpawn("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    try { await waitEvent(killer, "close", taskkillWaitMs, `${label} taskkill`); }
    catch (error) { killer.error ||= error; }
    const killRecord = { pid: killer.child.pid, exit: killer.exit, close: killer.closed, error: killer.error?.message ?? null,
      stdout: killer.stdout.value, stderr: killer.stderr.value };
    if (!killer.closed || killer.closed.code !== 0) {
      try { child.kill(); } catch (error) { record.cleanupError = error.message; }
      try { await waitEvent(record, "exit", exitConfirmWaitMs, `${label} direct exit confirmation`); } catch {}
      const exited = Boolean(record.exit);
      return { stopped: exited, childExited: exited, treeTerminationConfirmed: false, residual: !exited, uncertainty: true,
        pid: child.pid, treeKill: killRecord, reason: exited ? "child exited but owned-tree termination was not confirmed" : "owned process tree remains active" };
    }
    if (!record.exit) {
      try { await waitEvent(record, "exit", exitConfirmWaitMs, `${label} exit confirmation`); }
      catch { return { stopped: false, childExited: false, treeTerminationConfirmed: true, residual: true, uncertainty: false,
        pid: child.pid, treeKill: killRecord, reason: "taskkill succeeded but Chrome exit was not observed" }; }
    }
    return { stopped: true, childExited: true, treeTerminationConfirmed: true, residual: false, uncertainty: false,
      pid: child.pid, exit: record.exit, treeKill: killRecord };
  })();
  stopPromises.set(record, operation);
  return operation;
}

async function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  cleanupPromise = (async () => {
    clearTimeout(workDeadlineTimer);
    clearTimeout(totalWatchdogTimer);
    pageCdp?.close();
    browserCdp?.close();
    const chrome = await stopOwned(chromeRecord, "Plan 32 headless Chrome");
    const safeToRemoveProfile = chrome.childExited && chrome.treeTerminationConfirmed && !chrome.residual && !chrome.uncertainty;
    let profileCleanupError = null;
    if (profile && safeToRemoveProfile) {
      try { rmSync(profile, { recursive: true, force: true }); }
      catch (error) { profileCleanupError = error.message; }
    }
    const result = { chrome, profileRemoved: Boolean(profile && safeToRemoveProfile && !profileCleanupError), profileCleanupError,
      preservedProfilePath: profile && !safeToRemoveProfile ? profile : null };
    if (chrome.residual || chrome.uncertainty || profileCleanupError) {
      process.exitCode = 1;
      process.stderr.write(`Plan 32 cleanup requires attention: ${JSON.stringify(result)}\n`);
    }
    return result;
  })();
  return cleanupPromise;
}

function listAttemptFiles() {
  if (!activeOutputPath || !existsSync(activeOutputPath)) return [];
  return readdirSync(activeOutputPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "attempt-record.json")
    .map((entry) => {
      const filePath = path.join(activeOutputPath, entry.name);
      try {
        const bytes = readFileSync(filePath);
        return { name: entry.name, bytes: bytes.length, sha256: sha256(bytes) };
      } catch (error) {
        return { name: entry.name, readError: error.message };
      }
    });
}

function writeAttemptRecord(cleanupResult) {
  if (!activeOutputPath) return;
  const failed = Boolean(fatalError || workTimedOut || totalTimedOut || cleanupResult.chrome.residual ||
    cleanupResult.chrome.uncertainty || cleanupResult.profileCleanupError);
  const downloads = [...downloadRecords.values()].map(({ guid, name, state, receivedBytes, totalBytes, filePath }) =>
    ({ guid, name, state, receivedBytes: receivedBytes ?? null, totalBytes: totalBytes ?? null, filePath: filePath ?? null }));
  const sourceHashes = Object.fromEntries(SOURCE_FILES.map((file) => {
    try { return [file, sha256(readFileSync(path.join(ROOT, file)))]; }
    catch (error) { return [file, { readError: error.message }]; }
  }));
  const record = {
    artifact: MODE === "extensions" ? "quackpot-plan32-composition-attempt-record" : "quackpot-plan32-preview-attempt-record",
    attempt: path.basename(activeOutputPath),
    status: failed ? "failed" : "completed",
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date().toISOString(),
    failure: fatalError ? { message: fatalError.message, stack: fatalError.stack ?? null } : null,
    timedOut: { browserWork: workTimedOut, totalRunner: totalTimedOut },
    sourceHashes,
    browser: { kind: "isolated headless Chrome", launched: Boolean(chromeRecord?.child?.pid),
      pid: chromeRecord?.child?.pid ?? null, exit: chromeRecord?.exit ?? null, spawnError: chromeRecord?.error?.message ?? null,
      stderr: chromeRecord?.stderr?.value ?? "" },
    playback: "none; the headless runner did not audition audio",
    downloads,
    outputFiles: listAttemptFiles(),
    cleanup: cleanupResult
  };
  writeFileSync(path.join(activeOutputPath, "attempt-record.json"), `${JSON.stringify(record, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

async function renderAndDownload(cdp, id) {
  assertWorkBudget(`${id} preview`, RENDER_TIMEOUT_MS + 1000 + FILE_TIMEOUT_MS * 2 + 2500);
  const selectorId = MODE === "extensions" ? "structure-select" : "motif-select";
  const selectedId = await evaluate(cdp, `(() => { const select = document.querySelector(${JSON.stringify(`#${selectorId}`)}); if (!select) return null; select.value = ${JSON.stringify(id)}; select.dispatchEvent(new Event("change", { bubbles: true })); return select.value; })()`);
  if (selectedId !== id) throw new Error(`Preview selection control chose ${selectedId}; expected ${id}.`);
  const renderPoint = await evaluate(cdp, `(() => { const element = document.querySelector("#render-button"); element.scrollIntoView({ block: "center" }); const rect = element.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: renderPoint.x, y: renderPoint.y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: renderPoint.x, y: renderPoint.y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: renderPoint.x, y: renderPoint.y, button: "left", clickCount: 1 });

  const outcome = await waitUntil(async () => {
    const result = await evaluate(cdp, `(() => ({ text: document.querySelector("#status")?.textContent || "", disabled: Boolean(document.querySelector("#render-button")?.disabled) }))()`);
    if (result.text.includes(MODE === "extensions" ? "Render stopped:" : "Preview render stopped:")) return { failed: result.text };
    if ((MODE === "extensions" ? result.text.includes(`${id} rendered:`) : result.text.includes("rendered once at fixed common gain")) && !result.disabled) return result.text;
    return null;
  }, RENDER_TIMEOUT_MS + 500, `${id} offline render`);
  if (typeof outcome === "object" && outcome?.failed) throw new Error(`${id} render failed: ${outcome.failed}`);
  const status = outcome;
  const rowMetrics = MODE === "extensions" ? status : await evaluate(cdp, `(() => { const row = [...document.querySelectorAll("#preview-list .preview-row")].find((item) => item.textContent.includes(${JSON.stringify(`${id} —`)})); return row?.querySelector(".preview-meta span")?.textContent || null; })()`);
  if (!rowMetrics || !(MODE === "extensions" ? rowMetrics.includes("not LUFS or true peak") : rowMetrics.includes("not LUFS / not true peak"))) throw new Error(`${id} preview lacks its PCM-only limitation label.`);

  const files = [];
  let outputNames;
  if (MODE === "extensions") {
    const suffix = { S1: "call-answer", S2: "bookend", S3: "spacious" }[id];
    outputNames = [`plan32-extension-${id.toLowerCase()}-${suffix}.wav`, `plan32-extension-${id.toLowerCase()}-${suffix}-provenance.json`];
  } else outputNames = [`plan32-motif-${id.toLowerCase()}.wav`, `plan32-motif-${id.toLowerCase()}-manifest.json`];
  for (const name of outputNames) {
    if (MODE !== "extensions") {
      const selector = `a[download=${JSON.stringify(name)}]`;
      const point = await evaluate(cdp, `(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return null; element.scrollIntoView({ block: "center" }); const rect = element.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
      if (!point) throw new Error(`Preview download link missing: ${name}`);
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
      await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
    }
    const deadline = Date.now() + FILE_TIMEOUT_MS;
    let download = null;
    while (Date.now() < deadline) {
      assertWorkBudget(`${id} download`);
      download = [...downloadRecords.values()].find((item) => item.name === name);
      if (download?.state === "canceled") throw new Error(`Chrome canceled ${name}.`);
      if (download?.state === "completed") break;
      await delay(100);
    }
    if (download?.state !== "completed") throw new Error(`Chrome did not finish ${name} within ${FILE_TIMEOUT_MS} ms.`);
    const filePath = download.filePath || path.join(ROOT, OUTPUT, name);
    if (path.dirname(path.resolve(filePath)).toLowerCase() !== path.resolve(ROOT, OUTPUT).toLowerCase()) throw new Error(`Download escaped the report output folder: ${filePath}`);
    await waitUntil(() => existsSync(filePath) && !readdirSync(path.dirname(filePath)).some((entry) => entry.endsWith(".crdownload")) && statSync(filePath).size > 0,
      750, `download flush ${name}`);
    const size = statSync(filePath).size;
    if (size > MAX_OUTPUT_FILE_BYTES) throw new Error(`Unexpectedly large preview output: ${name} (${size} bytes; cap ${MAX_OUTPUT_FILE_BYTES}).`);
    if (MODE === "extensions" && name.endsWith(".json") && size > 32768) throw new Error(`Provenance exceeded 32 KiB cap: ${name} (${size} bytes).`);
    if (name.endsWith(".wav") && size !== EXPECTED_WAV_BYTES) throw new Error(`Unexpected WAV size for ${name}: ${size} bytes, expected ${EXPECTED_WAV_BYTES}.`);
    files.push({ path: filePath, name, size, sha256: sha256(readFileSync(filePath)), downloadGuid: download.guid });
  }

  const wavPath = files.find((file) => file.name.endsWith(".wav")).path;
  const wavBytes = readFileSync(wavPath);
  if (wavBytes.toString("ascii", 0, 4) !== "RIFF" || wavBytes.toString("ascii", 8, 12) !== "WAVE" ||
      wavBytes.readUInt16LE(20) !== 1 || wavBytes.readUInt16LE(22) !== 2 || wavBytes.readUInt32LE(24) !== 48000 ||
      wavBytes.readUInt16LE(34) !== 16 || wavBytes.readUInt32LE(40) !== wavBytes.length - 44) {
    throw new Error(`WAV format validation failed for ${wavPath}.`);
  }
  const manifestPath = files.find((file) => file.name.endsWith(".json")).path;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const measurement = MODE === "extensions" ? { ...manifest.render, ...manifest.render?.measurements } : manifest.render;
  const eventsPresent = MODE === "extensions" ? manifest.events?.length >= 10 && manifest.source?.sha256 : manifest.motif?.events?.length;
  const pcmBasis = MODE === "extensions" ? manifest.render?.measurements?.basis : measurement?.measurementBasis;
  if (!eventsPresent || (MODE === "extensions" && (manifest.source.sha256 !== sha256(readFileSync(path.join(ROOT, `${BASE}/motifs.js`))) ||
      manifest.render?.channels !== 2 || manifest.render?.format !== "PCM16" || manifest.render?.musicalSeconds !== 19.2 || manifest.render?.tailSeconds !== 0.12)) ||
      !Number.isFinite(measurement?.sampleRate) || measurement.sampleRate !== 48000 ||
      !Number.isFinite(measurement?.durationSeconds) || !Number.isFinite(measurement?.elapsedMilliseconds) ||
      !(Number.isFinite(measurement?.samplePeakDbfs) || measurement?.samplePeakDbfs === null) ||
      !(Number.isFinite(measurement?.rmsDbfs) || measurement?.rmsDbfs === null) ||
      !String(pcmBasis).includes(MODE === "extensions" ? "not LUFS or true peak" : "not LUFS or true peak")) {
    throw new Error(`${id} provenance manifest lacks finite PCM readings or the no-LUFS/no-true-peak statement.`);
  }
  return { id, status, displayedMetrics: rowMetrics, files, measurement };
}

async function main() {
  if (MODE === "invalid") throw new Error("Usage: runner.mjs [--extensions].");
  if (process.platform !== "win32") throw new Error("Plan 32 controlled renderer is scoped to the authorized Windows host.");
  const actualRoot = realpathSync(process.cwd()).toLowerCase();
  const expectedRoot = realpathSync(ROOT).toLowerCase();
  if (actualRoot !== expectedRoot) throw new Error(`Run from exact repository root ${ROOT}.`);
  const previewPath = path.resolve(ROOT, PAGE);
  if (MODE === "extensions") {
    const sourceScript = readFileSync(path.join(ROOT, `${EXT_BASE}/composition-extensions.js`), "utf8");
    const motifSource = readFileSync(path.join(ROOT, `${BASE}/motifs.js`));
    const expectedHash = sha256(motifSource);
    if (!sourceScript.includes(`sha256: "${expectedHash}"`)) throw new Error("Extension source hash does not match the unchanged selected motif source.");
    if (Buffer.byteLength(sourceScript, "utf8") > 32768) throw new Error("Portable extension source exceeded the 32 KiB source cap.");
  }
  const outputPath = path.resolve(ROOT, OUTPUT);
  if (!existsSync(previewPath)) throw new Error(`Preview page missing: ${previewPath}`);
  if (!existsSync(CHROME)) throw new Error(`Chrome executable missing: ${CHROME}`);
  const historyPath = path.resolve(ROOT, HISTORY);
  mkdirSync(historyPath, { recursive: true });
  const reportRoot = path.resolve(ROOT, MODE === "extensions" ? `${EXT_BASE}/composition-preview` : BASE);
  const historyRelative = path.relative(reportRoot, realpathSync(historyPath));
  if (historyRelative === ".." || historyRelative.startsWith(`..${path.sep}`) || path.isAbsolute(historyRelative)) {
    throw new Error("Plan 32 history folder resolves outside its report-local source directory.");
  }
  if (existsSync(outputPath)) throw new Error(`Refusing to reuse existing attempt folder: ${outputPath}`);
  mkdirSync(outputPath);
  activeOutputPath = outputPath;
  if (realpathSync(outputPath).toLowerCase() !== outputPath.toLowerCase()) throw new Error("Preview output directory resolves outside its report folder.");
  profile = mkdtempSync(path.join(os.tmpdir(), "quackpot-plan32-headless-"));
  const pageUrl = pathToFileURL(previewPath).href;
  const browserArgs = [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-sync", "--disable-extensions", "--disable-default-apps",
    "--disable-component-update", "--disable-features=MediaRouter", "--autoplay-policy=user-gesture-required",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--window-size=1120,850", pageUrl
  ];
  // Register ownership and bounded stdio before awaiting readiness.
  chromeRecord = ownedSpawn(CHROME, browserArgs, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  const activePortPath = path.join(profile, "DevToolsActivePort");
  const endpoint = await waitUntil(() => {
    if (!existsSync(activePortPath)) return null;
    const lines = readFileSync(activePortPath, "utf8").trim().split(/\r?\n/);
    const port = Number(lines[0]);
    return Number.isInteger(port) && port > 0 && port <= 65535 && lines[1]?.startsWith("/devtools/browser/")
      ? { port, browserPath: lines[1] } : null;
  }, 8000, "Chrome DevTools endpoint");

  browserCdp = connectCdp(`ws://${HOST}:${endpoint.port}${endpoint.browserPath}`, "Chrome browser");
  await browserCdp.ready();
  browserCdp.onEvent((method, params) => {
    if (method === "Browser.downloadWillBegin") downloadRecords.set(params.guid, { guid: params.guid, name: params.suggestedFilename, state: "inProgress", url: params.url });
    if (method === "Browser.downloadProgress") {
      const record = downloadRecords.get(params.guid) || { guid: params.guid, name: null };
      Object.assign(record, { state: params.state, receivedBytes: params.receivedBytes, totalBytes: params.totalBytes, filePath: params.filePath || null });
      downloadRecords.set(params.guid, record);
    }
  });
  await browserCdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: outputPath, eventsEnabled: true });
  const pageTarget = await waitUntil(async () => {
    const url = `http://${HOST}:${endpoint.port}/json/list`;
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(2000) });
    if (!response.ok || response.url !== url) throw new Error(`Local DevTools endpoint returned ${response.status}.`);
    const targets = await response.json();
    return targets.find((entry) => entry.type === "page" && entry.url === pageUrl && entry.webSocketDebuggerUrl) || null;
  }, 8000, "Chrome preview page target");
  pageCdp = connectCdp(pageTarget.webSocketDebuggerUrl, "Plan 32 preview page");
  await pageCdp.ready();
  await pageCdp.send("Page.enable");
  await pageCdp.send("Runtime.enable");
  await pageCdp.send("Network.enable");
  await pageCdp.send("Network.setBlockedURLs", { urls: ["http://*", "https://*"] });
  pageCdp.onEvent((method, params) => {
    if (method === "Network.requestWillBeSent") {
      sourceRequests.push(params.request?.url || "");
      if (sourceRequests.length > 128) sourceRequests.shift();
    }
  });
  const readySelector = MODE === "extensions" ? "structure-select" : "motif-select";
  await waitUntil(async () => evaluate(pageCdp, `(() => document.readyState === "complete" && Boolean(document.querySelector(${JSON.stringify(`#${readySelector}`)}) && document.querySelector("#render-button")))()`), 5000, "preview page load");

  const previews = [];
  for (const id of IDS) previews.push(await renderAndDownload(pageCdp, id));
  const externalRequests = sourceRequests.filter((url) => !url.startsWith("file:") && !url.startsWith("data:") && !url.startsWith("blob:"));
  if (externalRequests.length) throw new Error(`Unexpected non-local page requests: ${externalRequests.join(", ")}`);
  const inputs = SOURCE_FILES;
  const sourceHashes = Object.fromEntries(inputs.map((file) => [file, sha256(readFileSync(path.join(ROOT, file)))]));
  const report = {
    artifact: MODE === "extensions" ? "quackpot-plan32-three-composition-structure-previews" : "quackpot-plan32-three-bare-melody-previews",
    generatedAt: new Date().toISOString(),
    browser: { kind: "isolated headless Chrome", pageUrl, loopbackDebugPort: endpoint.port },
    guards: { browserWorkMs: MAX_WORK_MS, totalRunnerMs: MAX_TOTAL_MS, outerWrapper: "Plan 25 bounded-node-run.ps1: 90 seconds, 2 GiB sampled process-tree private bytes, Node heap 1 GiB" },
    playback: "none; the headless renderer did not play or audition audio",
    network: { blockedPageUrls: ["http://*", "https://*"], observedNonLocalPageRequests: externalRequests },
    sourceHashes,
    previews: previews.map((item) => ({ id: item.id, displayedMetrics: item.displayedMetrics, measurements: item.measurement,
      files: Object.fromEntries(item.files.map((file) => [file.name.endsWith(".wav") ? "wav" : "provenance", { name: file.name, bytes: file.size, sha256: file.sha256 }])) }))
  };
  writeFileSync(path.join(outputPath, "run-manifest.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ output: `${OUTPUT}/`, previewCount: previews.length,
    files: previews.flatMap((item) => item.files.map((file) => file.name)), runManifest: `${OUTPUT}/run-manifest.json`,
    playback: "none", externalPageRequests: externalRequests.length })}\n`);
}

workDeadlineTimer = setTimeout(() => {
  workTimedOut = true;
  fatalError ||= new Error(`Plan 32 browser work reached ${MAX_WORK_MS} ms.`);
  process.stderr.write(`${fatalError.message}\n`);
  void cleanup();
}, MAX_WORK_MS);
totalWatchdogTimer = setTimeout(() => {
  totalTimedOut = true;
  fatalError ||= new Error(`Plan 32 total runner reached ${MAX_TOTAL_MS} ms.`);
  process.exitCode = 1;
  process.stderr.write(`${fatalError.message}\n`);
  void cleanup();
}, MAX_TOTAL_MS);

process.once("SIGINT", () => {
  fatalError ||= new Error("Plan 32 runner interrupted by SIGINT.");
  process.exitCode = 1;
  void cleanup();
});
process.once("SIGTERM", () => {
  fatalError ||= new Error("Plan 32 runner interrupted by SIGTERM.");
  process.exitCode = 1;
  void cleanup();
});

main().catch((error) => {
  fatalError ||= error;
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}).finally(async () => {
  const result = await cleanup();
  if (fatalError || workTimedOut || totalTimedOut || result.chrome.residual || result.chrome.uncertainty || result.profileCleanupError) {
    process.exitCode = 1;
  }
  try { writeAttemptRecord(result); }
  catch (error) {
    process.exitCode = 1;
    process.stderr.write(`Plan 32 could not persist the attempt record: ${error.stack || error.message}\n`);
  }
});
