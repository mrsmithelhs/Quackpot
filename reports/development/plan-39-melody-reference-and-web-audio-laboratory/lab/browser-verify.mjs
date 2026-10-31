// Isolated headless Chrome verification of the Plan 39 Web Audio Laboratory.
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
        }, 12000);
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

  // 1. Verify UI controls and candidate roster in DOM
  const uiSnapshot = await evaluate(pageCdp, `(() => ({
    candidateOptions: [...document.querySelectorAll("#candidate-select option")].map(o => o.value),
    harmonyOptions: [...document.querySelectorAll("#harmony-select option")].map(o => o.value),
    patchOptions: [...document.querySelectorAll("#patch-select option")].map(o => o.value),
    tempoOptions: [...document.querySelectorAll("#tempo-select option")].map(o => Number(o.value)),
    primaryCards: [...document.querySelectorAll("#primary-candidates-grid .candidate-card")].map(c => c.dataset.candidateId),
    optionalCards: [...document.querySelectorAll("#optional-candidates-grid .candidate-card")].map(c => c.dataset.candidateId)
  }))()`);

  // 2. Test unsupported combination guard & recovery
  const guardCheck = await evaluate(pageCdp, `(() => {
    const cand = document.getElementById("candidate-select");
    const harm = document.getElementById("harmony-select");
    cand.value = "C0-original";
    cand.dispatchEvent(new Event("change", { bubbles: true }));
    harm.value = "H1-bright-resolved";
    harm.dispatchEvent(new Event("change", { bubbles: true }));
    const blockedState = {
      noticeVisible: !document.getElementById("combination-notice").classList.contains("hidden"),
      noticeText: document.getElementById("combination-notice-msg").textContent,
      playDisabled: document.getElementById("play-selected-btn").disabled,
      exportDisabled: document.getElementById("render-export-btn").disabled
    };
    document.getElementById("combination-fix-btn").click();
    const recoveredState = {
      candidate: cand.value,
      harmony: harm.value,
      playDisabled: document.getElementById("play-selected-btn").disabled
    };
    return { blockedState, recoveredState };
  })()`);

  if (!guardCheck.blockedState.noticeVisible || !guardCheck.blockedState.playDisabled || guardCheck.recoveredState.playDisabled) {
    throw new Error(`Combination guard check failed: ${JSON.stringify(guardCheck)}`);
  }

  // Helper for trusted user-gesture clicks via CDP Input.dispatchMouseEvent
  async function trustedClick(selector) {
    const pt = await evaluate(pageCdp, `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);
    if (!pt) throw new Error(`Missing element for trustedClick: ${selector}`);
    await pageCdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pt.x, y: pt.y });
    await pageCdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: pt.x, y: pt.y, button: "left", clickCount: 1 });
    await pageCdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pt.x, y: pt.y, button: "left", clickCount: 1 });
  }

  // 3. Test live AudioContext scheduling, rapid switch, and Stop teardown using trusted user gestures
  await trustedClick("#ab-original-btn");
  const stateDuringOrig = await waitUntil(
    () => evaluate(pageCdp, `document.getElementById("telemetry-state").textContent === "PLAYING" ? "PLAYING" : null`),
    2000,
    "Live audition PLAYING state (Original C)"
  );
  await trustedClick("#ab-repeat2x-btn");
  const stateDuringRepeat = await waitUntil(
    () => evaluate(pageCdp, `document.getElementById("telemetry-state").textContent === "PLAYING" && document.getElementById("telemetry-candidate").textContent === "C0-repeat2x" ? "PLAYING" : null`),
    2000,
    "Live audition PLAYING state (2x Repeat)"
  );
  await trustedClick("#stop-btn");
  const liveAuditionLifecycle = await evaluate(pageCdp, `({
    stateDuringOrig: ${JSON.stringify(stateDuringOrig)},
    stateDuringRepeat: ${JSON.stringify(stateDuringRepeat)},
    stateAfterStop: document.getElementById("telemetry-state").textContent,
    stopDisabledAfterStop: document.getElementById("stop-btn").disabled
  })`);

  if (liveAuditionLifecycle.stateDuringOrig !== "PLAYING" ||
      liveAuditionLifecycle.stateDuringRepeat !== "PLAYING" ||
      liveAuditionLifecycle.stateAfterStop !== "IDLE" ||
      !liveAuditionLifecycle.stopDisabledAfterStop) {
    throw new Error(`Live audition stop lifecycle failed: ${JSON.stringify(liveAuditionLifecycle)}`);
  }

  // 4. Render & verify all 7 candidates (with default settings + v2 acoustics/conditioning) via real browser OfflineAudioContext,
  // and trigger UI bundle export + download for C0-repeat2x, C1-period-lock, and C4-sentence-drive
  const renderedCandidatesReport = [];
  for (const candId of uiSnapshot.candidateOptions) {
    const item = await evaluate(pageCdp, `(async () => {
      const eng = window.QUACKPOT_PLAN39_ENGINE;
      const cand = eng.getCandidate(${JSON.stringify(candId)});
      const useAcoustics = !cand.lockBareControl && cand.id !== "C0-repeat2x";
      const mixScore = eng.buildScheduledScore({
        candidateId: cand.id,
        harmonyId: cand.defaultHarmonyId,
        patchId: cand.defaultPatchId,
        tempoBpm: 100,
        layerMode: "full",
        exportProfile: "game-audition",
        roomAir: useAcoustics,
        microGroove: useAcoustics,
        shakerPulse: cand.id === "C3-accompaniment-groove"
      });
      const melodyScore = eng.buildScheduledScore({
        candidateId: cand.id,
        harmonyId: cand.defaultHarmonyId,
        patchId: cand.defaultPatchId,
        tempoBpm: 100,
        layerMode: "melody-only",
        exportProfile: "suno-conditioning"
      });
      const parity = eng.verifyLeadEventParity(mixScore, melodyScore);
      const mixRender = await eng.renderOfflineWav(mixScore);
      const mixWavHeader = eng.parseWavHeader(mixRender.wav.arrayBuffer);
      const melodyRender = await eng.renderOfflineWav(melodyScore);
      const melodyWavHeader = eng.parseWavHeader(melodyRender.wav.arrayBuffer);

      return {
        candidateId: cand.id,
        harmonyId: cand.defaultHarmonyId,
        patchId: cand.defaultPatchId,
        tempoBpm: 100,
        bars: cand.bars,
        roomAir: mixScore.roomAir,
        microGroove: mixScore.microGroove,
        shakerPulse: mixScore.shakerPulse,
        durationSeconds: mixRender.durationSeconds,
        frameCount: mixRender.frameCount,
        wavByteLength: mixRender.wav.byteLength,
        leadEventCount: mixScore.leadEvents.length,
        chordEventCount: mixScore.chordEvents.length,
        bassEventCount: mixScore.bassEvents.length,
        leadParityIdentical: parity.identical,
        mixHeaderValid: mixWavHeader.valid,
        melodyHeaderValid: melodyWavHeader.valid,
        mixMeasurements: mixRender.measured,
        melodyMeasurements: melodyRender.measured
      };
    })()`);
    renderedCandidatesReport.push(item);
  }

  // Also verify all 8 patches (P0-P7) and seamlessLoopWrap on C4-sentence-drive
  for (const patchId of uiSnapshot.patchOptions) {
    try {
      await evaluate(pageCdp, `(async () => {
        const eng = window.QUACKPOT_PLAN39_ENGINE;
        const pScore = eng.buildScheduledScore({
          candidateId: "C4-sentence-drive",
          harmonyId: "H4-deceptive-pivot",
          patchId: ${JSON.stringify(patchId)},
          tempoBpm: 100,
          layerMode: "full",
          exportProfile: "game-audition",
          roomAir: false,
          microGroove: true,
          seamlessLoopWrap: ${JSON.stringify(patchId)} === "P4-cozy-marimba"
        });
        const pRender = await eng.renderOfflineWav(pScore);
        if (pRender.measured.isClipped) {
          throw new Error("Patch " + ${JSON.stringify(patchId)} + " clipped during OfflineAudioContext verification.");
        }
        if (${JSON.stringify(patchId)} === "P4-cozy-marimba" && pRender.frameCount !== 921600) {
          throw new Error("Expected seamlessLoopWrap frameCount 921600, got " + pRender.frameCount);
        }
        return true;
      })()`);
    } catch (err) {
      throw new Error(`Patch verification failed on ${patchId}: ${err.message}`);
    }
  }

  // 5. Trigger actual UI export bundle & file downloads for C0-repeat2x, C1-period-lock, and C4-sentence-drive
  async function exportAndDownloadViaUI(candidateId) {
    await evaluate(pageCdp, `(() => {
      const sel = document.getElementById("candidate-select");
      sel.value = ${JSON.stringify(candidateId)};
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("render-export-btn").click();
    })()`);

    await waitUntil(
      () => evaluate(pageCdp, `Boolean(document.querySelector('.export-bundle-card[data-bundle-candidate=${JSON.stringify(candidateId)}]')) && !document.getElementById("render-export-btn").disabled`),
      20000,
      `Export bundle card for ${candidateId}`
    );

    const downloadNames = await evaluate(pageCdp, `(() => {
      const card = document.querySelector('.export-bundle-card[data-bundle-candidate=${JSON.stringify(candidateId)}]');
      const links = [...card.querySelectorAll("a[download]")];
      links.forEach(a => a.click());
      return links.map(a => a.getAttribute("download"));
    })()`);

    const verifiedDownloads = [];
    for (const fileName of downloadNames) {
      const filePath = path.join(downloadTmpDir, fileName);
      await waitUntil(
        () => existsSync(filePath) && !readdirSync(downloadTmpDir).some((n) => n.endsWith(".crdownload")) && statSync(filePath).size > 0,
        5000,
        `Downloaded file ${fileName}`
      );
      const bytes = readFileSync(filePath);
      const fileHash = sha256(bytes);

      if (fileName.endsWith(".wav")) {
        const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        const hdr = engine.parseWavHeader(ab);
        const persistWav = fileName === "plan39-c0-repeat2x-h0-dry-p0-plan32-triangle-100bpm-melody.wav";
        if (persistWav) {
          writeFileSync(path.join(EXPORTS_DIR, fileName), bytes);
        }
        verifiedDownloads.push({
          fileName,
          bytes: bytes.length,
          sha256: fileHash,
          wavHeader: hdr,
          persistedToExportsDir: persistWav
        });
      } else if (fileName.endsWith(".json")) {
        const parsed = JSON.parse(bytes.toString("utf8"));
        const rt = engine.validateImportedManifest(parsed);
        if (!rt.valid) throw new Error(`Downloaded manifest failed round-trip: ${rt.error}`);
        // Persist the compact manifest JSON into exports/
        writeFileSync(path.join(EXPORTS_DIR, fileName), bytes);
        verifiedDownloads.push({
          fileName,
          bytes: bytes.length,
          sha256: fileHash,
          roundTripValid: rt.valid,
          persistedToExportsDir: true
        });
      }
    }
    return verifiedDownloads;
  }

  const c0RepeatDownloads = await exportAndDownloadViaUI("C0-repeat2x");
  const c1PeriodDownloads = await exportAndDownloadViaUI("C1-period-lock");
  const c4SentenceDownloads = await exportAndDownloadViaUI("C4-sentence-drive");

  const nonLocalRequests = networkRequests.filter(
    (u) => !u.startsWith("file:") && !u.startsWith("blob:") && !u.startsWith("data:")
  );
  if (nonLocalRequests.length > 0) {
    throw new Error(`Unexpected non-local network requests: ${nonLocalRequests.join(", ")}`);
  }
  if (pageErrors.length > 0) {
    throw new Error(`Unexpected page runtime errors: ${pageErrors.join("; ")}`);
  }

  const verificationReport = {
    artifact: "quackpot-plan39-browser-verification-report",
    verifiedAt: new Date().toISOString(),
    browser: "Isolated headless Google Chrome (Web Audio API AudioContext + OfflineAudioContext)",
    pageUrl,
    nonLocalNetworkRequests: nonLocalRequests.length,
    pageRuntimeErrors: pageErrors.length,
    uiSnapshot,
    combinationGuardVerification: guardCheck,
    liveAuditionLifecycle,
    offlineRenderedCandidates: renderedCandidatesReport,
    verifiedBrowserDownloads: {
      "C0-repeat2x": c0RepeatDownloads,
      "C1-period-lock": c1PeriodDownloads,
      "C4-sentence-drive": c4SentenceDownloads
    },
    auditionHonestyNote: "Headless Chrome executed real Web Audio API OfflineAudioContext rendering, PCM sample measurement, and WAV/JSON file downloads, plus live AudioContext graph scheduling/teardown. Physical acoustic speaker audition and aesthetic selection remain the human owner's listening gate."
  };

  const reportPath = path.join(EXPORTS_DIR, "browser-verification-report.json");
  writeFileSync(reportPath, `${JSON.stringify(verificationReport, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ ok: true, reportPath, candidatesVerified: renderedCandidatesReport.length })}\n`);
}

main()
  .catch((err) => {
    process.stderr.write(`${err.stack || err.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
  });
