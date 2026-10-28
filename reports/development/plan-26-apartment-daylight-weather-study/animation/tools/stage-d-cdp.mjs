// Plan 26 Stage D review tool (NOT runtime). One isolated Chrome (temporary profile, own debugging port, no owner tab or storage), driven serially over CDP
// against animation/gallery.html on the owner's already-running dev server. Run ONLY through the bounded launcher (see stage-d-plan.md):
//   bounded-node-run.ps1 -Executable node.exe -ArgumentVector animation/tools/stage-d-cdp.mjs
// Writes the full results to animation/stage-d-results.json and prints a SHORT summary. Exactly one pulse is accepted in the whole run. No retries.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const ANIM = 'reports/development/plan-26-apartment-daylight-weather-study/animation';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE = `http://localhost:5173/Quackpot/${ANIM}/gallery.html`;
const PAGE_JS = readFileSync(path.resolve(ANIM, 'tools/stage-d-page.js'), 'utf8');
const OUT = path.resolve(ANIM, 'stage-d-results.json');
const RUN_LIMIT_MS = 80000;                                                   // below the launcher's 90 s so this script ends itself first

const delay = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.once('error', rej); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); }); });
async function until(fn, timeout, what) { const t0 = Date.now(); for (;;) { const v = await fn().catch(() => null); if (v) return v; if (Date.now() - t0 > timeout) throw new Error(`timed out waiting for ${what}`); await delay(150); } }

class Cdp {
  constructor(url) { this.url = url; this.id = 0; this.pending = new Map(); }
  open() {
    return new Promise((res, rej) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => res(this); this.ws.onerror = () => rej(new Error('websocket error'));
      this.ws.onmessage = e => { const m = JSON.parse(e.data); const p = m.id && this.pending.get(m.id); if (p) { clearTimeout(p.t); this.pending.delete(m.id); if (m.error) p.rej(new Error(`${p.method}: ${m.error.message}`)); else p.res(m.result); } };
    });
  }
  send(method, params = {}, timeout = 20000) {
    const id = ++this.id;
    return new Promise((res, rej) => { const t = setTimeout(() => { this.pending.delete(id); rej(new Error(`${method} timed out`)); }, timeout); this.pending.set(id, { res, rej, t, method }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  close() { try { this.ws.close(); } catch { /* closed */ } }
}

let chrome = null, profile = null; const cleanup = [];
async function stopChrome() {
  if (chrome && chrome.exitCode === null) {
    const k = spawn('taskkill.exe', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }); k.on('error', () => {});
    await Promise.race([new Promise(r => k.once('close', r)), delay(4000)]);
  }
  if (profile) { try { rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 }); } catch (e) { cleanup.push(`profile cleanup: ${e.code || e.message}`); } }
}

const guard = setTimeout(() => { console.error(`FAILED: run exceeded ${RUN_LIMIT_MS} ms`); stopChrome().finally(() => process.exit(2)); }, RUN_LIMIT_MS);

const results = { startedAt: new Date().toISOString(), page: PAGE, note: 'Stage D evidence: one isolated headless Chrome on this machine only; not a certificate, no general performance claim.', cells: [], lifecycle: {} };
try {
  const pageResp = await fetch(PAGE, { signal: AbortSignal.timeout(5000) }).catch(e => ({ ok: false, status: String(e.message) }));
  if (!pageResp.ok) throw new Error(`the gallery is not reachable at ${PAGE} (${pageResp.status}); not starting a server`);

  const port = await freePort(); profile = mkdtempSync(path.join(os.tmpdir(), 'quackpot-plan26-d-'));
  chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--remote-allow-origins=*', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,720', 'about:blank'], { stdio: 'ignore', windowsHide: true });
  let chromeErr = null; chrome.on('error', e => { chromeErr = e; });
  const version = await until(async () => (await fetch(`http://127.0.0.1:${port}/json/version`)).json(), 20000, 'Chrome debugging endpoint');
  if (chromeErr) throw chromeErr;
  results.browser = { product: version.Browser, userAgent: version['User-Agent'], mode: '--headless=new, temporary profile, GPU flag left at Chrome default (no --disable-gpu), no sandbox/Crashpad bypass flags' };

  // best-effort GPU description from the browser endpoint (diagnostic only)
  try {
    const b = await new Cdp(version.webSocketDebuggerUrl).open(), info = await b.send('SystemInfo.getInfo', {}, 8000); b.close();
    results.gpu = { devices: (info.gpu.devices || []).map(d => `${d.vendorString} ${d.deviceString} driver ${d.driverVersion}`), glRenderer: info.gpu.auxAttributes && info.gpu.auxAttributes.glRenderer, featureStatus: info.gpu.featureStatus, model: info.modelName || null };
  } catch (e) { results.gpu = { unavailable: String(e.message) }; }

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(), pageTarget = targets.find(t => t.type === 'page');
  const A = await new Cdp(pageTarget.webSocketDebuggerUrl).open();
  const ev = async (expression, timeout = 20000) => { const r = await A.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, timeout); if (r.exceptionDetails) throw new Error(`page error: ${(r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text}`); return r.result.value; };
  await A.send('Page.enable'); await A.send('Runtime.enable'); await A.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await A.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const metricsDelta = (a, b, windowMs) => ({ taskMs: +((b.TaskDuration - a.TaskDuration) * 1000).toFixed(1), scriptMs: +((b.ScriptDuration - a.ScriptDuration) * 1000).toFixed(1), layoutMs: +((b.LayoutDuration - a.LayoutDuration) * 1000).toFixed(1), styleRecalcMs: +((b.RecalcStyleDuration - a.RecalcStyleDuration) * 1000).toFixed(1), layoutCount: b.LayoutCount - a.LayoutCount, styleRecalcCount: b.RecalcStyleCount - a.RecalcStyleCount, mainThreadBusyShare: +(((b.TaskDuration - a.TaskDuration) * 1000) / windowMs).toFixed(3), nodes: b.Nodes, jsHeapMB: +(b.JSHeapUsedSize / 1e6).toFixed(1) });
  const metricsOverride = (w, h, dpr) => A.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: false });

  await metricsOverride(1280, 720, 1);
  await A.send('Page.navigate', { url: PAGE });
  await until(() => ev('!!(window.__p26m && window.__p26m.scenes && window.__p26m.scenes.size)', 4000), 20000, 'the gallery to load');
  await ev(PAGE_JS);
  results.pageEnv = await ev('__sd.env()');

  const cell = async (name, setupArgs, run) => {
    const setup = await ev(`__sd.setup(${JSON.stringify(setupArgs)})`, 25000), m0 = await metrics();
    const r = await run(); const m1 = await metrics();
    const entry = { cell: name, setup, ...r, cdp: metricsDelta(m0, m1, r.windowMs || 3000) };
    results.cells.push(entry); return entry;
  };
  const steady = () => ev('__sd.measure(3000)', 15000);

  await cell('1 still baseline (storm + lamp, Show still), 1280x720 dpr1', { show: 'one', selected: 'stormlamp', still: true }, steady);
  await cell('2 rain, one scene running, 1280x720 dpr1', { show: 'one', selected: 'rain' }, steady);
  await cell('3 storm + lamp, one scene running, 1280x720 dpr1', { show: 'one', selected: 'stormlamp' }, steady);
  await cell('4 REAL-TIME bright pulse (one, requested 400 ms into 3 s), storm + lamp, 1280x720 dpr1', { show: 'one', selected: 'stormlamp' }, async () => { const p = await ev('__sd.pulse("stormlamp", 3000)', 20000); return { windowMs: 3000, pulse: p }; });
  await cell('5 DIAGNOSTIC four storm scenes (as many as are visible), 1280x720 dpr1', { show: 'dup4', selected: 'storm' }, steady);
  await metricsOverride(390, 844, 2);
  await cell('6 storm + lamp, one scene running, 390x844 dpr2 (viewport emulation only)', { show: 'one', selected: 'stormlamp' }, steady);
  await metricsOverride(1280, 720, 1);

  // lifecycle: real hidden page, then browser-emulated reduced motion (neither starts a pulse)
  await ev(`__sd.setup(${JSON.stringify({ show: 'one', selected: 'stormlamp' })})`, 25000);
  const lc = results.lifecycle, snap = () => ev('({ vis: document.visibilityState, focus: document.hasFocus(), states: __sd.states(), media: matchMedia("(prefers-reduced-motion: reduce)").matches })');
  lc.hiddenPage = { before: await snap() };
  const bResp = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then(r => r.json()).catch(e => ({ error: String(e.message) }));
  if (bResp.id) {
    await fetch(`http://127.0.0.1:${port}/json/activate/${bResp.id}`); await delay(1500);
    lc.hiddenPage.whileOtherTabActive = await snap(); lc.hiddenPage.refusalWhileOtherTabActive = await ev('__sd.probeRefusal("stormlamp")');
    await fetch(`http://127.0.0.1:${port}/json/activate/${pageTarget.id}`); await delay(1500);
    lc.hiddenPage.afterReturning = await snap(); await fetch(`http://127.0.0.1:${port}/json/close/${bResp.id}`).catch(() => {});
    lc.hiddenPage.coverage = lc.hiddenPage.whileOtherTabActive.vis === 'hidden' ? 'real hidden state reached by activating another tab in this isolated Chrome' : 'BLOCKED: activating another tab did NOT change document.visibilityState here, so no real hidden-page result';
  } else lc.hiddenPage.coverage = `BLOCKED: could not open a second tab (${bResp.error})`;
  await A.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); await delay(800);
  lc.reducedMotionEmulated = { label: 'browser-emulated media feature (Emulation.setEmulatedMedia), NOT the actual OS setting', whileReduced: await snap(), refusal: await ev('__sd.probeRefusal("stormlamp")') };
  await A.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }); await delay(800);
  lc.reducedMotionEmulated.afterClearing = await snap();
  results.arbiterAtEnd = await ev('window.__p26m.arbiter.snapshot()');
  A.close();
  results.finishedAt = new Date().toISOString();
} catch (e) {
  results.failure = String(e && e.message || e);
} finally {
  clearTimeout(guard); await stopChrome(); results.cleanupNotes = cleanup;
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

const brief = c => ({ cell: c.cell, fps: c.framesPerSecond, medianMs: c.medianMs, p95Ms: c.p95Ms, maxMs: c.maxMs, over25: c.over25ms, over50: c.over50ms, longTasks: c.longTasks, timelineVsWall: c.timelineVsWall, running: c.runningAnimationsAtEnd, busyShare: c.cdp && c.cdp.mainThreadBusyShare, taskMs: c.cdp && c.cdp.taskMs, scriptMs: c.cdp && c.cdp.scriptMs, heapMB: c.cdp && c.cdp.jsHeapMB });
const pulse = (results.cells.find(c => c.pulse) || {}).pulse;
console.log(JSON.stringify({
  failure: results.failure || null, browser: results.browser && results.browser.product, gpu: results.gpu && (results.gpu.devices || results.gpu.unavailable), env: results.pageEnv && { vp: results.pageEnv.vp, dpr: results.pageEnv.dpr, vis: results.pageEnv.vis, focus: results.pageEnv.focus },
  cells: results.cells.filter(c => !c.pulse).map(brief),
  pulse: pulse && { status: pulse.status, outcome: pulse.outcome, settledAfterRequestMs: pulse.settledAfterRequestMs, timing: pulse.timing, frames: pulse.framesFromRequestToSettle, intervals: pulse.frameIntervalsDuringPulse, staleFrames: pulse.staleOverlayFramesAfterSettle, nodesAtEnd: pulse.overlayNodesAtEnd, next: pulse.requestRightAfterSettle, nextAllowedAt: pulse.arbiter && pulse.arbiter.nextAllowedAt, lastStartedAt: pulse.arbiter && pulse.arbiter.lastStartedAt, stats: pulse.arbiter && pulse.arbiter.stats },
  pulseCellMetrics: (results.cells.find(c => c.pulse) || {}).cdp,
  hidden: results.lifecycle.hiddenPage && { coverage: results.lifecycle.hiddenPage.coverage, before: results.lifecycle.hiddenPage.before && results.lifecycle.hiddenPage.before.vis, during: results.lifecycle.hiddenPage.whileOtherTabActive, refusal: results.lifecycle.hiddenPage.refusalWhileOtherTabActive, after: results.lifecycle.hiddenPage.afterReturning && results.lifecycle.hiddenPage.afterReturning.states },
  reduced: results.lifecycle.reducedMotionEmulated && { whileReduced: results.lifecycle.reducedMotionEmulated.whileReduced && results.lifecycle.reducedMotionEmulated.whileReduced.states, refusal: results.lifecycle.reducedMotionEmulated.refusal, after: results.lifecycle.reducedMotionEmulated.afterClearing && results.lifecycle.reducedMotionEmulated.afterClearing.states },
  acceptedPulsesInWholeRun: results.arbiterAtEnd && results.arbiterAtEnd.stats.accepted, cleanup: cleanup, resultsFile: path.relative(process.cwd(), OUT)
}));
if (results.failure) process.exit(1);
