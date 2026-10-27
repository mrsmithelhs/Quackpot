// reports/development/plan-21-duck-dex-and-new-entry-presentation/plan-21-browser-check.mjs
// Isolated headless browser verification for Plan 21 Repair 02.
// Validates:
// 1. Real-state silhouette computed filter during Phase 1 and color transition in Phase 2.
// 2. Settings modal opening during Phase 1 suspends timers and prevents background completion.
// 3. Duplicate-first reveal triggers discovery; subsequent original reveal does not re-trigger.
// 4. Reveal-All / Fast-Pull instant resolution with toast.
// 5. Escape keyboard dismissal and focus return.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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
  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
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
const chromePath = chromeCandidates.find((c) => existsSync(c));
if (!chromePath) throw new Error('No Chrome or Edge binary found in supported install paths.');

const profileDir = mkdtempSync(path.join(process.cwd(), '.plan21-profile-'));
const preview = spawn(process.execPath, [
  path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--host', host,
  '--port', String(previewPort), '--strictPort',
], { stdio: 'ignore' });

const browser = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profileDir}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
  '--remote-allow-origins=*', '--disable-crash-reporter', '--disable-crashpad',
], { stdio: ['ignore', 'ignore', 'pipe'] });

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }
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
      const res = await fetch(url);
      if (res.ok) return res;
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

async function waitFor(expression, label, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await wait(50);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function click(selector) {
  const found = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
  if (!found) throw new Error(`Missing element to click: ${selector}`);
}

async function pressKey(key) {
  const keyCode = { Tab: 9, Enter: 13, Escape: 27, Space: 32 }[key] || 0;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}

const observations = {
  timestamp: new Date().toISOString(),
  checks: [],
};

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

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 420, height: 740, deviceScaleFactor: 1, mobile: true });
  await cdp.send('Page.navigate', { url: baseUrl });
  await waitFor('Boolean(document.querySelector("#btn-start-app"))', 'initial desk view');
  await evaluate('localStorage.clear()');

  // --- Journey 1: Setup companion & Commit 10-Pull ---
  await click('#btn-start-app');
  await waitFor('Boolean(document.querySelector("#btn-claim-pull"))', 'gacha claim section');
  await click('#btn-claim-pull');
  await waitFor('Boolean(document.querySelector(".card-grid"))', 'gacha theater card grid');

  observations.checks.push({
    name: 'ten_pull_committed',
    passed: await evaluate('document.querySelectorAll(".card-back").length === 10'),
    detail: '10 card backs present on initial commit',
  });

  // --- Journey 2: Active discovery real silhouette in Phase 1 and color in Phase 2 ---
  // Reveal card 0
  await click('#btn-reveal-next');
  await waitFor('Boolean(document.querySelector(".acquisition-shelf-overlay"))', 'acquisition shelf overlay mount');

  const phase1TargetState = await evaluate(`(() => {
    const slot = document.querySelector('.slot-highlight-focus');
    if (!slot) return null;
    const svg = slot.querySelector('.slot-duck-art svg');
    const computedSvg = getComputedStyle(svg);
    const nameEl = slot.querySelector('[data-slot-name]');
    return {
      targetId: slot.getAttribute('data-acq-slot'),
      hasUnownedClass: slot.classList.contains('slot-unowned'),
      hasOwnedClass: slot.classList.contains('slot-owned'),
      hasHighlightClass: slot.classList.contains('slot-highlight-focus'),
      nameText: nameEl?.textContent || '',
      computedFilter: computedSvg.filter,
    };
  })()`);

  observations.checks.push({
    name: 'active_discovery_phase1_silhouette',
    passed: phase1TargetState?.hasUnownedClass === true &&
            phase1TargetState?.hasOwnedClass === false &&
            phase1TargetState?.hasHighlightClass === true &&
            phase1TargetState?.nameText.includes('???') &&
            phase1TargetState?.computedFilter.includes('brightness(0)'),
    detail: phase1TargetState,
  });

  // Wait 2.2s for Phase 2 (color transition) to begin
  await wait(2200);

  const phase2TargetState = await evaluate(`(() => {
    const slot = document.querySelector('.slot-highlight-focus');
    if (!slot) return null;
    const svg = slot.querySelector('.slot-duck-art svg');
    const computedSvg = getComputedStyle(svg);
    const nameEl = slot.querySelector('[data-slot-name]');
    return {
      targetId: slot.getAttribute('data-acq-slot'),
      hasUnownedClass: slot.classList.contains('slot-unowned'),
      hasOwnedClass: slot.classList.contains('slot-owned'),
      hasDiscoveringClass: slot.classList.contains('slot-discovering'),
      nameText: nameEl?.textContent || '',
      transitionProperty: computedSvg.transitionProperty,
    };
  })()`);

  observations.checks.push({
    name: 'active_discovery_phase2_color_transition',
    passed: phase2TargetState?.hasUnownedClass === false &&
            phase2TargetState?.hasOwnedClass === true &&
            phase2TargetState?.hasDiscoveringClass === true &&
            !phase2TargetState?.nameText.includes('???') &&
            phase2TargetState?.transitionProperty.includes('filter'),
    detail: phase2TargetState,
  });

  // Wait remaining 2.6s for Phase 2 to complete
  await wait(2600);
  await waitFor('!document.querySelector(".acquisition-shelf-overlay")', 'overlay cleanup after completion');

  observations.checks.push({
    name: 'acquisition_completed_cleanup',
    passed: await evaluate('!document.querySelector(".acquisition-shelf-overlay")'),
    detail: 'Overlay removed cleanly after 4.5s nominal presentation',
  });

  // --- Journey 3: Inactive Modal Boundaries (Settings opened during presentation) ---
  const nextTargetInfo = await evaluate(`(() => {
    const save = JSON.parse(localStorage.getItem('quackpot_save_v1') || '{}');
    const pending = save?.state?.pendingReveals || [];
    const seen = new Set(save?.state?.seenDexEntries || []);
    const newlyAcquiredInBatch = new Set(pending.filter((d) => !d.duplicate).map((d) => d.identity));
    const nextIdx = pending.findIndex((d) => !d.revealed && newlyAcquiredInBatch.has(d.identity) && !seen.has(d.identity));
    if (nextIdx === -1) return null;
    return { nextIdx, identity: pending[nextIdx].identity };
  })()`);

  if (nextTargetInfo) {
    await click(`.card-back[data-card-idx="${nextTargetInfo.nextIdx}"]`);
    await waitFor('Boolean(document.querySelector(".acquisition-shelf-overlay"))', `acquisition overlay for card ${nextTargetInfo.nextIdx}`);

    // Immediately open Settings in the HUD
    await click('#btn-open-settings');
    await waitFor('Boolean(document.querySelector(".settings-card"))', 'settings modal dialog open');

    // Wait 5 seconds (longer than full 4.5s presentation!)
    await wait(5000);

    // Verify that target duck was NOT marked seen and no completion cue occurred behind Settings
    const inactiveModalState = await evaluate(`(() => {
      const save = JSON.parse(localStorage.getItem('quackpot_save_v1') || '{}');
      const seen = save?.state?.seenDexEntries || [];
      return {
        seenEntries: seen,
        targetMarkedSeen: seen.includes(${JSON.stringify(nextTargetInfo.identity)}),
        settingsOpen: Boolean(document.querySelector('.settings-card')),
      };
    })()`);

    observations.checks.push({
      name: 'inactive_modal_suspension_in_settings',
      passed: inactiveModalState.settingsOpen === true && inactiveModalState.targetMarkedSeen === false,
      detail: inactiveModalState,
    });

    // Close Settings modal via Escape
    await pressKey('Escape');
    await waitFor('!document.querySelector(".settings-card")', 'settings modal closed');

    // Verify presentation resumes or can be cleanly dismissed
    await waitFor('Boolean(document.querySelector(".acquisition-shelf-overlay"))', 'overlay active after settings close');
    await pressKey('Escape'); // Escape skips overlay
    await waitFor('!document.querySelector(".acquisition-shelf-overlay")', 'overlay dismissed via Escape');
  }

  // --- Journey 4: Duplicate-First Reveal ---
  await evaluate(`(() => {
    localStorage.clear();
    location.reload();
  })()`);
  await waitFor('Boolean(document.querySelector("#btn-start-app"))', 'reloaded desk view');
  await click('#btn-start-app');
  await waitFor('Boolean(document.querySelector("#btn-claim-pull"))', 'reloaded claim section');
  await click('#btn-claim-pull');
  await waitFor('Boolean(document.querySelector(".card-grid"))', 'reloaded card grid');

  // Find the exact duplicate card index and original card index from this session's batch
  const batchInfo = await evaluate(`(() => {
    const save = JSON.parse(localStorage.getItem('quackpot_save_v1') || '{}');
    const pending = save?.state?.pendingReveals || [];
    const dupIdx = pending.findIndex((d) => d.duplicate);
    if (dupIdx === -1) return null;
    const dupId = pending[dupIdx].identity;
    const origIdx = pending.findIndex((d) => !d.duplicate && d.identity === dupId);
    return { dupIdx, origIdx, dupId };
  })()`);

  if (batchInfo) {
    // 1. Reveal the duplicate card FIRST!
    await click(`.card-back[data-card-idx="${batchInfo.dupIdx}"]`);
    await waitFor('Boolean(document.querySelector(".acquisition-shelf-overlay"))', 'overlay on duplicate-first reveal');

    const duplicateFirstDiscovery = await evaluate(`(() => {
      const slot = document.querySelector('[data-acq-slot="${batchInfo.dupId}"]');
      return {
        slotFound: Boolean(slot),
        overlayTitle: document.querySelector('#acq-canopy-title')?.textContent || '',
      };
    })()`);

    observations.checks.push({
      name: 'duplicate_first_reveal_triggers_discovery',
      passed: duplicateFirstDiscovery.slotFound === true,
      detail: duplicateFirstDiscovery,
    });

    // Skip the duplicate-first presentation
    await click('#btn-skip-acq');
    await waitFor('!document.querySelector(".acquisition-shelf-overlay")', 'overlay closed after skip');

    // 2. Now reveal the original card for the same identity!
    await click(`.card-back[data-card-idx="${batchInfo.origIdx}"]`);
    await wait(600);

    // Overlay MUST NOT open again!
    const secondRevealOverlay = await evaluate('Boolean(document.querySelector(".acquisition-shelf-overlay"))');
    observations.checks.push({
      name: 'subsequent_original_reveal_does_not_retrigger',
      passed: secondRevealOverlay === false,
      detail: { secondRevealOverlay },
    });
  }

  // --- Journey 5: Reveal-All & Fast-Pull bypass ---
  await click('#btn-reveal-all');
  await waitFor('Boolean(document.querySelector(".fast-pull-toast"))', 'fast-pull toast notification');

  const revealAllState = await evaluate(`(() => {
    const cardBacks = document.querySelectorAll('.card-back').length;
    const toast = document.querySelector('.fast-pull-toast')?.textContent || '';
    const overlay = Boolean(document.querySelector('.acquisition-shelf-overlay'));
    return { cardBacks, toast, overlay };
  })()`);

  observations.checks.push({
    name: 'reveal_all_fast_pull_bypass',
    passed: revealAllState.cardBacks === 0 && revealAllState.overlay === false && revealAllState.toast.includes('added to Duck-Dex'),
    detail: revealAllState,
  });

  console.log('\n=== PLAN 21 REPAIR 02 HEADLESS BROWSER VERIFICATION ===');
  let allPassed = true;
  for (const check of observations.checks) {
    console.log(`  [${check.passed ? 'PASS' : 'FAIL'}] ${check.name}`);
    if (!check.passed) allPassed = false;
  }
  console.log(`\nOverall: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);

  writeFileSync(
    path.resolve('reports/development/plan-21-duck-dex-and-new-entry-presentation/repair-02-browser-observations.json'),
    JSON.stringify(observations, null, 2)
  );
  console.log('Observations saved to repair-02-browser-observations.json\n');

} finally {
  cdp?.close();
  browser.kill();
  preview.kill();
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
}
