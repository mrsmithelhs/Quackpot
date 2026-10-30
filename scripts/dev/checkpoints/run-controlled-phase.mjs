// One serialized Plan 35 capture or pilot phase; invoke only through Plan 25's guard.
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';
import { appendFile, readFile, realpath, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { CATALOG_PATH, PLAN35, ROOT, catalogEntry, readCatalog, readFixtureBeforeParse, resolveRepoPath, sha256 } from './provenance.mjs';
import { inspectOwnedIdentities, snapshotOwnedTree, startOwnedProcessMonitor } from './process-tree.mjs';

const HOST = '127.0.0.1';
const PORT = 5181;
const BASE_URL = `http://${HOST}:${PORT}/Quackpot/`;
const VITE = 'node_modules/vite/bin/vite.js';
const PHASES = new Set(['capture-rent-paid-zero', 'capture-rent-unpaid-escalation', 'capture-finale-race-entry',
  'pilot-paid-rent', 'pilot-unpaid-rent', 'pilot-finale-rest-selection']);
const MAX_TOTAL_MS = 76000;
const MAX_WORK_MS = 66000;
const MAX_STDIO = 12 * 1024;
const MAX_ENTRY_BYTES = 3 * 1024 * 1024;
const MAX_SERVED_BYTES = 24 * 1024 * 1024;
const startedAt = Date.now();
const resultsPath = path.join(ROOT, PLAN35, 'controlled-pilot-results.jsonl');
const trackedSourceRoots = ['src', 'index.html', 'vite.config.mjs', 'package.json', 'package-lock.json', 'scripts/dev/checkpoints'];
const serverChild = { child: null, command: null, args: null, cwd: ROOT, error: null, exit: null, close: null, stdout: '', stderr: '', monitor: null };
const proofChild = { child: null, command: null, args: null, cwd: ROOT, error: null, exit: null, close: null, stdout: '', stderr: '', monitor: null };
let workDeadline = false;
let totalDeadline = false;
let cleanupStarted = false;
let phaseSucceeded = false;
let capturePromotionRequest = null;
let evidence = { phase: process.argv[2] ?? null, startedAt: new Date(startedAt).toISOString(), baseURL: BASE_URL };

function fail(message) { throw new Error(message); }
function remainingWork() { return Math.max(0, Math.min(MAX_WORK_MS - (Date.now() - startedAt), MAX_TOTAL_MS - (Date.now() - startedAt))); }
function appendOutput(record, key, chunk) { if (record[key].length < MAX_STDIO) record[key] += chunk.toString('utf8').slice(0, MAX_STDIO - record[key].length); }

function expectedCaptureId(phase) {
  return phase === 'capture-rent-paid-zero' ? 'plan35.rent-paid-zero.v1'
    : phase === 'capture-rent-unpaid-escalation' ? 'plan35.rent-unpaid-escalation.v1'
      : phase === 'capture-finale-race-entry' ? 'plan35.finale-race-entry.v1' : null;
}

function parseCompleteProofResult(stdout) {
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  if (lines.length !== 1) fail(`Expected exactly one complete browser-phase result record; received ${lines.length}.`);
  const result = JSON.parse(lines[0]);
  if (!result || typeof result !== 'object' || Array.isArray(result)) fail('Browser phase returned a non-object proof result.');
  return result;
}

async function promoteCaptureAfterSupervisorSuccess({ id, expectedHash }) {
  if (totalDeadline || Date.now() >= startedAt + MAX_TOTAL_MS) fail('Supervisor total cleanup deadline reached before catalog promotion.');
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  if (entry.status !== 'capture-pending-cleanup' || entry.sha256 !== expectedHash)
    fail('Capture candidate catalog status/hash changed before supervisor promotion.');
  const fixture = await readFixtureBeforeParse(entry);
  if (fixture.hash !== expectedHash) fail('Captured fixture bytes/hash changed before supervisor promotion.');
  if (totalDeadline || Date.now() >= startedAt + MAX_TOTAL_MS) fail('Supervisor total cleanup deadline reached before atomic catalog update.');
  entry.status = 'current-loadable';
  const catalogPath = resolveRepoPath(CATALOG_PATH);
  const temporaryCatalogPath = `${catalogPath}.${process.pid}.tmp`;
  await writeFile(temporaryCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, { flag: 'wx' });
  await rename(temporaryCatalogPath, catalogPath);
  return { id, status: entry.status, sha256: entry.sha256 };
}

function ownedSpawn(record, command, args, env = process.env) {
  record.command = command; record.args = args;
  const child = spawn(command, args, { cwd: ROOT, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  record.child = child;
  child.stdout.on('data', (chunk) => appendOutput(record, 'stdout', chunk));
  child.stderr.on('data', (chunk) => appendOutput(record, 'stderr', chunk));
  child.once('error', (error) => { record.error = error; });
  child.once('exit', (code, signal) => { record.exit = { code, signal, at: new Date().toISOString() }; });
  child.once('close', (code, signal) => { record.close = { code, signal, at: new Date().toISOString() }; });
  if (process.platform === 'win32') record.monitor = startOwnedProcessMonitor(child.pid, { isAlive: () => child.exitCode === null });
  return record;
}

async function waitForChild(record, deadline, label) {
  const until = Math.min(deadline, Date.now() + remainingWork());
  while (Date.now() < until) {
    if (record.error) fail(`${label} failed to spawn: ${record.error.message}`);
    if (record.close) return record.close;
    await delay(100);
  }
  fail(`${label} did not finish before its bounded phase deadline.`);
}

async function assertPortFree() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', (error) => reject(new Error(`Refusing to use port ${PORT}: ${error.message}`)));
    server.listen(PORT, HOST, resolve);
  });
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function waitReady() {
  const until = Math.min(startedAt + MAX_WORK_MS, Date.now() + 8000);
  let last = 'no response';
  while (Date.now() < until) {
    if (serverChild.error || serverChild.exit) fail(`Vite exited before readiness: ${JSON.stringify(serverChild.exit)} ${serverChild.stderr}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(1000, remainingWork()));
    try {
      const response = await fetch(BASE_URL, { redirect: 'manual', signal: controller.signal });
      last = `HTTP ${response.status}`;
      await response.body?.cancel();
      if (response.status === 200 && response.url === BASE_URL) return;
    } catch (error) { last = error.message; }
    finally { clearTimeout(timer); }
    await delay(150);
  }
  fail(`Vite readiness timed out: ${last}`);
}

async function servedHashes() {
  const served = ['src/main.js', 'src/style.css', 'src/core/game-engine.mjs', 'src/core/storage.mjs', 'src/core/prng.mjs',
    'src/core/event-log.mjs', 'src/core/receipt.mjs', 'src/core/race-resolver.mjs', 'src/core/race-rest.mjs',
    'src/ui/shell.css', 'src/ui/stage-transition.css', 'src/ui/duck-dex.css', 'src/ui/apartment-view.css',
    'src/assets/duck-placeholder.svg', 'src/ui/stage-transition.js', 'src/ui/hud.js', 'src/ui/desk-view.js',
    'src/ui/gacha-view.js', 'src/ui/acquisition-queue.mjs', 'src/ui/duck-dex-view.mjs', 'src/ui/duck-rig-view.mjs',
    'src/ui/duck-motion-controller.mjs', 'src/ui/duck-motion.css', 'src/ui/race-view.js', 'src/ui/race-view.css',
    'src/ui/race-entry.css', 'src/ui/race-playback-controller.mjs', 'src/ui/race-motion-controller.mjs',
    'src/ui/modals.js', 'src/ui/receipt-view.js', 'src/ui/settings-modal.js'];
  const hashes = {};
  let total = 0;
  for (const file of served) {
    if (Date.now() >= startedAt + MAX_WORK_MS) fail('Served-source identity reached the work deadline.');
    const url = new URL(file, BASE_URL);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(3500, remainingWork()));
    try {
      const response = await fetch(url, { redirect: 'manual', signal: controller.signal });
      if (response.status !== 200 || response.url !== url.href) { await response.body?.cancel(); fail(`Served source response failed: ${file} HTTP ${response.status}`); }
      const reader = response.body?.getReader();
      if (!reader) fail(`Missing served response body: ${file}`);
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_ENTRY_BYTES) { await reader.cancel(); fail(`Served file exceeds 3 MiB: ${file}`); }
        chunks.push(value);
      }
      total += size;
      if (total > MAX_SERVED_BYTES) fail('Finite served-source map exceeds 24 MiB.');
      hashes[file] = { sha256: sha256(Buffer.concat(chunks, size)), bytes: size };
    } finally { clearTimeout(timer); }
  }
  return { hashes, entries: served.length, bytes: total, scope: 'Finite allowlisted source map only; not a claim covering every network/transitive response.' };
}

async function sourceIdentity() {
  const tracked = execFileSync('git', ['ls-files', '--', ...trackedSourceRoots], { cwd: ROOT, encoding: 'utf8', timeout: 5000 })
    .trim().split(/\r?\n/).filter(Boolean).sort();
  const toolSources = tracked.filter((file) => file.startsWith('scripts/dev/checkpoints/') && (file.endsWith('.mjs') || file.endsWith('.ps1')));
  const required = ['index.html', 'vite.config.mjs', 'package.json', 'package-lock.json', ...tracked.filter((file) => file.startsWith('src/')),
    ...toolSources];
  const missing = required.filter((file) => !tracked.includes(file));
  if (missing.length) fail(`Commit the reviewed source closure before browser use; untracked: ${missing.join(', ')}`);
  execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...required], { cwd: ROOT, stdio: 'ignore', timeout: 5000 });
  const files = {};
  for (const file of required) files[file] = sha256(await readFile(path.join(ROOT, file)));
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
  return { revision, files, fingerprint: sha256(JSON.stringify({ revision, files })) };
}

async function stopOwned(record) {
  if (record.stopPromise) return record.stopPromise;
  record.stopPromise = stopOwnedOnce(record);
  return record.stopPromise;
}

async function stopOwnedOnce(record) {
  if (!record.child) return { residual: false, uncertainty: true, exit: record.exit, reason: 'owned process handle missing' };
  const parentExitedOnEntry = record.exit !== null;
  const provedBrowserCleanup = () => {
    const line = record.stdout.split(/\r?\n/).filter(Boolean).at(-1);
    if (!line) return false;
    try {
      const parsed = JSON.parse(line);
      return parsed.cleanup?.treeTerminationConfirmed === true && parsed.cleanup?.residual === false && parsed.cleanup?.uncertainty === false;
    } catch { return false; }
  };
  let tracked = [];
  let inspectionFailed = process.platform !== 'win32';
  let rootObserved = false;
  if (process.platform === 'win32') {
    try {
      tracked = record.monitor ? await record.monitor.stop() : await snapshotOwnedTree(record.child.pid);
      rootObserved = tracked.some((row) => row.root === true);
      if (!rootObserved) inspectionFailed = true;
    }
    catch { inspectionFailed = true; }
  }
  if (record.exit === null && process.platform === 'win32' && rootObserved) {
    const rootIdentity = tracked.find((row) => row.root === true);
    try {
      if (!rootIdentity || !(await inspectOwnedIdentities([rootIdentity])).length) { rootObserved = false; inspectionFailed = true; }
    } catch { rootObserved = false; inspectionFailed = true; }
  }
  if (record.exit === null && process.platform === 'win32' && rootObserved) {
    try { execFileSync('taskkill.exe', ['/PID', String(record.child.pid), '/T', '/F'], { cwd: ROOT, stdio: 'ignore', timeout: 2500 }); }
    catch { /* exit and fresh tree inspection below are authoritative */ }
  } else if (record.exit === null) { try { record.child.kill('SIGTERM'); } catch {} }
  if (record.close === null) await Promise.race([new Promise((resolve) => record.child.once('close', resolve)), delay(2500)]);
  let remaining = [];
  let remainingTree = [];
  if (process.platform === 'win32') {
    try {
      const until = Date.now() + 1800;
      do {
        remainingTree = await snapshotOwnedTree(record.child.pid);
        const known = new Set(tracked.map((row) => `${row.pid}:${row.created}`));
        tracked.push(...remainingTree.filter((row) => !known.has(`${row.pid}:${row.created}`)));
        remaining = await inspectOwnedIdentities(tracked);
        if (remaining.length === 0 && remainingTree.length === 0 && record.close !== null) break;
        await delay(100);
      } while (Date.now() < until);
    } catch { inspectionFailed = true; }
  }
  const helperConfirmed = record === proofChild && record.exit?.code === 0 && provedBrowserCleanup();
  const retainedClear = remaining.length === 0 && remainingTree.length === 0;
  const parentUnobserved = parentExitedOnEntry && !helperConfirmed;
  const residual = record.exit === null || remaining.length > 0 || remainingTree.length > 0 || parentUnobserved;
  return { residual, uncertainty: inspectionFailed || !record.close || remaining.length > 0 || remainingTree.length > 0 || parentUnobserved
      || (record === proofChild && helperConfirmed && !retainedClear),
    exit: record.exit, close: record.close, trackedDescendants: tracked, remainingDescendants: remaining, remainingTree };
}

async function appendEvidence() {
  const info = await stat(resultsPath).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  const record = { ...evidence, finishedAt: new Date().toISOString(), elapsedMs: Date.now() - startedAt, workDeadline, totalDeadline };
  const line = `${JSON.stringify(record)}\n`;
  if (info && info.size + Buffer.byteLength(line) > 2 * 1024 * 1024) fail('Controlled pilot result log would exceed 2 MiB.');
  if (info) {
    const prior = await readFile(resultsPath, 'utf8');
    for (const row of prior.split(/\r?\n/).filter(Boolean)) JSON.parse(row);
  }
  await appendFile(resultsPath, line, 'utf8');
}

async function main() {
  const phase = process.argv[2];
  if (!PHASES.has(phase)) fail(`Choose one phase: ${[...PHASES].join(', ')}`);
  const cwd = await realpath(process.cwd());
  if (cwd.toLowerCase() !== (await realpath(ROOT)).toLowerCase()) fail(`Run from repository root ${ROOT}.`);
  evidence.phase = phase;
  evidence.sourceBefore = await sourceIdentity();
  await assertPortFree();
  const vitePath = path.resolve(ROOT, VITE);
  await readFile(vitePath);
  ownedSpawn(serverChild, process.execPath, ['--max-old-space-size=512', vitePath, '--host', HOST, '--port', String(PORT), '--strictPort', '--base', '/Quackpot/'],
    { ...process.env, VITE_BASE: '/Quackpot/' });
  await serverChild.monitor?.ready;
  evidence.server = { pid: serverChild.child.pid, command: serverChild.command, args: serverChild.args, baseURL: BASE_URL };
  await waitReady();
  evidence.served = await servedHashes();
  if (Date.now() >= startedAt + MAX_WORK_MS) fail('Cleanup reserve reached before proof launch.');
  const expected = JSON.stringify(evidence.served.hashes);
  ownedSpawn(proofChild, process.execPath, ['--max-old-space-size=512', 'scripts/dev/checkpoints/browser-phase.mjs', phase],
    { ...process.env, QP35_BASE_URL: BASE_URL, QP35_EXPECTED_SERVED: expected });
  await proofChild.monitor?.ready;
  const proofExit = await waitForChild(proofChild, startedAt + MAX_WORK_MS, 'Browser phase');
  evidence.proof = { pid: proofChild.child.pid, exit: proofExit, stdout: proofChild.stdout, stderr: proofChild.stderr };
  if (proofExit.code !== 0) fail(`Browser phase exited ${proofExit.code}: ${proofChild.stderr}`);
  if (phase.startsWith('capture-')) {
    const proofResult = parseCompleteProofResult(proofChild.stdout);
    const expectedId = expectedCaptureId(phase);
    const candidate = proofResult.candidate;
    const expectedHash = candidate?.sha256;
    const sentinel = proofResult.capture?.provenance?.observations?.ordinarySaveSentinel;
    if (proofResult.phase !== phase || !expectedId || candidate?.id !== expectedId
        || candidate?.status !== 'capture-pending-cleanup'
        || typeof expectedHash !== 'string' || !/^[a-f0-9]{64}$/.test(expectedHash)
        || proofResult.capture?.id !== expectedId || proofResult.capture?.sha256 !== expectedHash
        || sentinel?.isolatedContext !== true || sentinel?.unchanged !== true
        || typeof sentinel?.beforeSha256 !== 'string' || sentinel.beforeSha256 !== sentinel.afterSha256
        || proofResult.cleanup?.residual !== false || proofResult.cleanup?.uncertainty !== false
        || proofResult.cleanup?.treeTerminationConfirmed !== true || proofResult.cleanup?.profileRemoved !== true) {
      fail('Browser phase did not return the complete expected pending candidate and confirmed Chrome cleanup result.');
    }
    evidence.proof.result = proofResult;
    capturePromotionRequest = { id: expectedId, expectedHash };
  }
  evidence.sourceAfter = await sourceIdentity();
  if (evidence.sourceBefore.fingerprint !== evidence.sourceAfter.fingerprint) fail('Tracked source identity changed during browser phase.');
  phaseSucceeded = true;
}

const workTimer = setTimeout(() => { workDeadline = true; void stopOwned(serverChild, 'work deadline'); }, MAX_WORK_MS);
const totalTimer = setTimeout(() => { totalDeadline = true; void cleanup(); }, MAX_TOTAL_MS);
async function cleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  clearTimeout(workTimer);
  const proof = await stopOwned(proofChild, 'proof');
  const server = await stopOwned(serverChild, 'Vite');
  evidence.cleanup = { proof, server, residual: proof.residual || server.residual, uncertainty: proof.uncertainty || server.uncertainty };
  if (capturePromotionRequest) {
    if (!phaseSucceeded || totalDeadline || evidence.cleanup.residual || evidence.cleanup.uncertainty
        || proof.exit?.code !== 0 || !proof.close || !server.close
        || evidence.sourceBefore?.fingerprint !== evidence.sourceAfter?.fingerprint) {
      evidence.capturePromotion = { ...capturePromotionRequest, status: 'capture-pending-cleanup', promoted: false,
        reason: 'Supervisor phase/source/owned-tree cleanup conditions were not all satisfied.' };
      process.exitCode = 1;
    } else {
      try {
        evidence.sourceAfterCleanup = await sourceIdentity();
        if (evidence.sourceAfterCleanup.fingerprint !== evidence.sourceBefore.fingerprint)
          fail('Tracked source identity changed before capture promotion.');
        if (totalDeadline || Date.now() >= startedAt + MAX_TOTAL_MS)
          fail('Supervisor total cleanup deadline reached before capture promotion.');
        evidence.capturePromotion = { ...(await promoteCaptureAfterSupervisorSuccess(capturePromotionRequest)), promoted: true };
      } catch (error) {
        evidence.capturePromotion = { ...capturePromotionRequest, status: 'capture-pending-cleanup', promoted: false,
          reason: (error.stack || error.message).slice(0, 1200) };
        process.stderr.write(`Capture remains pending cleanup: ${error.message}\n`);
        process.exitCode = 1;
      }
    }
  }
  try { await appendEvidence(); }
  catch (error) { process.stderr.write(`Could not append bounded evidence: ${error.message}\n`); process.exitCode = 1; }
  if (evidence.cleanup.residual || evidence.cleanup.uncertainty || totalDeadline) process.exitCode = 1;
  clearTimeout(totalTimer);
}

main().then(async () => { await cleanup(); }).catch(async (error) => {
  evidence.error = error.stack || error.message;
  process.stderr.write(`${evidence.error}\n`);
  process.exitCode = 1;
  await cleanup();
});
