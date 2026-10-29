// One bounded Plan 16 browser phase with an owned Vite dev server.
// Invoke only through the Plan 25 bounded-node-run.ps1 launcher.
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';
import { appendFile, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT = 'C:/AI/Quackpot';
const HOST = '127.0.0.1';
const PORT = 5181;
const BASE_URL = `http://${HOST}:${PORT}/Quackpot/`;
const BASE_PATH = 'reports/development/plan-16-deterministic-review-checkpoints';
const RECIPE = `${BASE_PATH}/checkpoint-proof.mjs`;
const HELPER = `${BASE_PATH}/run-controlled-vite-phase.mjs`;
const RESULTS = `${BASE_PATH}/controlled-vite-phase-results.jsonl`;
const VITE_ENTRY = 'node_modules/vite/bin/vite.js';
const PHASES = new Set(['pending-restore', 'starter-capture', 'branch-accept', 'branch-decline']);
const MAX_TOTAL_MS = 79000;
const MAX_WORK_MS = 71000;
const MAX_STDIO_CHARS = 8192;
const MAX_ENTRY_BYTES = 3 * 1024 * 1024;
const MAX_SERVED_BYTES = 24 * 1024 * 1024;
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sleep = (ms) => delay(ms);
const startedAt = Date.now();
let serverChild = null;
let proofChild = null;
let workTimedOut = false;
let totalTimedOut = false;
let cleanupPromise = null;
let workDeadlineTimer = null;
let totalWatchdogTimer = null;
let evidence = { startedAt: new Date(startedAt).toISOString() };
const stopPromises = new WeakMap();

class BoundedText {
  constructor() { this.value = ''; }
  append(chunk) {
    if (this.value.length < MAX_STDIO_CHARS) this.value += chunk.toString('utf8').slice(0, MAX_STDIO_CHARS - this.value.length);
  }
}

function ownedSpawn(command, args, options) {
  const child = spawn(command, args, { windowsHide: true, ...options });
  const record = { child, command, args, cwd: options.cwd, spawnedAt: new Date().toISOString(), error: null, exit: null,
    closed: null, stdout: new BoundedText(), stderr: new BoundedText() };
  child.stdout?.on('data', (chunk) => record.stdout.append(chunk));
  child.stderr?.on('data', (chunk) => record.stderr.append(chunk));
  child.once('error', (error) => { record.error = error; });
  child.once('exit', (code, signal) => { record.exit = { code, signal, at: new Date().toISOString() }; });
  child.once('close', (code, signal) => { record.closed = { code, signal, at: new Date().toISOString() }; });
  return record;
}

function remainingMs() { return Math.max(0, MAX_TOTAL_MS - (Date.now() - startedAt)); }
function remainingWorkMs() { return Math.max(0, Math.min(MAX_WORK_MS - (Date.now() - startedAt), remainingMs())); }

function assertWorkBudget(label) {
  if (workTimedOut || remainingWorkMs() <= 0) throw new Error(`Plan 16 ${label} reached the ${MAX_WORK_MS}ms work deadline.`);
}

async function waitEvent(record, event, timeoutMs, label, cleanupWindow = false) {
  const { child } = record;
  if (event === 'exit' && record.exit) return record.exit;
  if (event === 'close' && record.closed) return record.closed;
  if (record.error) throw new Error(`${label} failed to spawn: ${record.error.message}`);
  await new Promise((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); child.removeListener(event, onEvent); child.removeListener('error', onError); };
    const onEvent = (...args) => { cleanup(); resolve(args); };
    const onError = (error) => { cleanup(); reject(error); };
    const boundedMs = cleanupWindow ? timeoutMs : Math.min(timeoutMs, remainingMs());
    if (boundedMs <= 0) { reject(new Error(`${label} ${event} wait reached the total deadline.`)); return; }
    const timer = setTimeout(() => { cleanup(); reject(new Error(`${label} ${event} wait timed out.`)); }, boundedMs);
    child.once(event, onEvent);
    child.once('error', onError);
  });
  if (record.error) throw new Error(`${label} failed: ${record.error.message}`);
  if (event === 'exit') return record.exit;
  if (event === 'close') return record.closed;
}

async function assertPortAvailable() {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', (error) => reject(new Error(`Port ${PORT} already has a listener or cannot be bound: ${error.message}`)));
    probe.listen(PORT, HOST, resolve);
  });
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
}

async function assertSocketReady() {
  assertWorkBudget('socket readiness');
  await new Promise((resolve, reject) => {
    const socket = createConnection({ host: HOST, port: PORT });
    const timer = setTimeout(() => { socket.destroy(); reject(new Error('Vite loopback socket readiness timed out.')); }, Math.min(1500, remainingWorkMs()));
    socket.once('connect', () => { clearTimeout(timer); socket.destroy(); resolve(); });
    socket.once('error', (error) => { clearTimeout(timer); reject(error); });
  });
}

async function waitHttpReady(record) {
  const until = Math.min(Date.now() + 8000, startedAt + MAX_WORK_MS);
  let lastError = 'no response';
  while (Date.now() < until) {
    assertWorkBudget('HTTP readiness');
    if (record.error) throw new Error(`Vite failed to spawn: ${record.error.message}`);
    if (record.exit) throw new Error(`Vite exited before readiness: ${JSON.stringify(record.exit)}; stderr=${record.stderr.value}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(1000, remainingWorkMs()));
    try {
      const response = await fetch(BASE_URL, { signal: controller.signal, redirect: 'manual' });
      if (response.status === 200 && response.url === BASE_URL) {
        await response.body?.cancel();
        await assertSocketReady();
        return;
      }
      lastError = `HTTP ${response.status} at ${response.url}`;
      await response.body?.cancel();
    } catch (error) { lastError = error.message; }
    finally { clearTimeout(timer); }
    await sleep(150);
  }
  throw new Error(`Vite HTTP readiness failed: ${lastError}; stderr=${record.stderr.value}`);
}

async function currentSourceIdentity() {
  const tracked = execFileSync('git', ['ls-files', '--', 'src', 'index.html', 'vite.config.mjs', 'package.json', 'package-lock.json', RECIPE, HELPER],
    { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim().split(/\r?\n/).filter(Boolean).sort();
  const needed = [RECIPE, HELPER, 'index.html', 'vite.config.mjs', 'package.json', 'package-lock.json'];
  if (needed.some((file) => !tracked.includes(file))) throw new Error('Commit the complete source closure and launcher before a browser phase.');
  execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...tracked], { cwd: ROOT, stdio: 'ignore', timeout: 5000 });
  const files = {};
  for (const file of tracked) files[file] = sha256(await readFile(path.join(ROOT, file)));
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
  return { revision, files, fingerprint: sha256(JSON.stringify({ revision, files })) };
}

async function responseHashes(source) {
  const entries = source.servedEntries;
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > 64) throw new Error('The committed harness served-entry list is missing or exceeds 64 entries.');
  const hashes = {};
  let aggregateBytes = 0;
  let reservedBytes = 0;
  for (let offset = 0; offset < entries.length; offset += 4) {
    assertWorkBudget('served-entry hashing');
    const batch = entries.slice(offset, offset + 4);
    const results = await Promise.all(batch.map(async (entry) => {
      assertWorkBudget(`served-entry hashing for ${entry}`);
      if (aggregateBytes + reservedBytes + MAX_ENTRY_BYTES > MAX_SERVED_BYTES) throw new Error('Controlled Vite response exceeds the 24 MiB aggregate reservation cap.');
      reservedBytes += MAX_ENTRY_BYTES;
      let reservationActive = true;
      try {
        const url = new URL(entry, BASE_URL);
        if (url.origin !== new URL(BASE_URL).origin || !url.pathname.startsWith('/Quackpot/')) throw new Error(`Refusing served-entry URL outside the controlled base: ${url.href}`);
        const response = await fetch(url, { signal: AbortSignal.timeout(Math.min(1200, remainingWorkMs())), redirect: 'manual' });
        if (response.status !== 200 || response.url !== url.href) {
          await response.body?.cancel();
          throw new Error(`Vite entry identity fetch failed for ${entry}: HTTP ${response.status}; redirects are rejected.`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error(`No response body for controlled Vite entry ${entry}.`);
        const chunks = [];
        let size = 0;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_ENTRY_BYTES) { await reader.cancel(); throw new Error(`Vite entry exceeded the 3 MiB cap: ${entry}`); }
            chunks.push(value);
          }
        } finally { reader.releaseLock(); }
        aggregateBytes += size;
        reservedBytes -= MAX_ENTRY_BYTES;
        reservationActive = false;
        if (aggregateBytes > MAX_SERVED_BYTES) throw new Error('Controlled Vite served-entry responses exceeded the 24 MiB aggregate cap.');
        return [entry, sha256(Buffer.concat(chunks, size)), size];
      } finally {
        if (reservationActive) reservedBytes -= MAX_ENTRY_BYTES;
      }
    }));
    for (const [entry, hash, size] of results) {
      hashes[entry] = hash;
    }
  }
  return { hashes, bytes: aggregateBytes, entries: entries.length };
}

function stopOwned(record, label) {
  if (!record || record.exit) return Promise.resolve({ stopped: true, pid: record?.child.pid ?? null, exit: record?.exit ?? null });
  const existing = stopPromises.get(record);
  if (existing) return existing;
  const operation = (async () => {
    const child = record.child;
    let treeKill = null;
    if (process.platform === 'win32' && child.pid) {
      const killer = ownedSpawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { cwd: ROOT, stdio: ['ignore', 'ignore', 'ignore'] });
      try { await waitEvent(killer, 'close', 1500, `${label} tree cleanup`, true); }
      catch { try { killer.child.kill(); } catch {} }
      treeKill = { pid: killer.child.pid, exit: killer.exit, spawnError: killer.error?.message ?? null };
      if (!killer.closed || killer.closed.code !== 0) {
        try { child.kill(); } catch {}
        try { await waitEvent(killer, 'close', 500, `${label} taskkill cleanup`, true); } catch {}
        return { stopped: false, pid: child.pid, command: record.command, treeKill, reason: 'owned process-tree termination was not confirmed' };
      }
    } else {
      try { child.kill('SIGTERM'); } catch {}
    }
    if (!record.exit) {
      try { await waitEvent(record, 'exit', 2000, `${label} cleanup`, true); }
      catch { return { stopped: false, pid: child.pid, command: record.command, treeKill, reason: 'owned process did not exit within cleanup window' }; }
    }
    return { stopped: true, pid: child.pid, exit: record.exit, treeKill };
  })();
  stopPromises.set(record, operation);
  return operation;
}

async function runProof(phase, hashes) {
  assertWorkBudget('proof subprocess launch');
  const env = { ...process.env, QP16_EXPECTED_SERVED_MODULES: JSON.stringify(hashes), QP16_BASE_URL: BASE_URL };
  proofChild = ownedSpawn(process.execPath, ['--max-old-space-size=1024', RECIPE, '--phase', phase, '--base-url', BASE_URL],
    { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
  await waitEvent(proofChild, 'close', Math.max(1, remainingMs() - 1000), 'proof phase');
  if (proofChild.error) throw new Error(`Proof phase failed to spawn: ${proofChild.error.message}`);
  if (proofChild.exit?.code !== 0) throw new Error(`Proof phase exited ${JSON.stringify(proofChild.exit)}; stdout=${proofChild.stdout.value}; stderr=${proofChild.stderr.value}`);
  return { pid: proofChild.child.pid, command: proofChild.command, args: proofChild.args, cwd: proofChild.cwd,
    spawnedAt: proofChild.spawnedAt, exit: proofChild.exit, stdout: proofChild.stdout.value, stderr: proofChild.stderr.value };
}

async function main() {
  const phase = process.argv[2];
  if (!PHASES.has(phase)) throw new Error(`Choose exactly one browser phase: ${[...PHASES].join(', ')}`);
  evidence.phase = phase;
  assertWorkBudget('repository check');
  if ((await realpath(process.cwd())).toLowerCase() !== (await realpath(ROOT)).toLowerCase()) throw new Error(`Run from exact repository root ${ROOT}.`);
  const sourceBefore = await currentSourceIdentity();
  evidence.sourceBefore = sourceBefore;
  assertWorkBudget('server launch');
  await assertPortAvailable();
  assertWorkBudget('server spawn after port probe');
  const vitePath = path.resolve(ROOT, VITE_ENTRY);
  await readFile(vitePath);
  assertWorkBudget('server spawn after Vite executable check');
  serverChild = ownedSpawn(process.execPath, ['--max-old-space-size=1024', vitePath, '--host', HOST, '--port', String(PORT), '--strictPort', '--base', '/Quackpot/'],
    { cwd: ROOT, env: { ...process.env, VITE_BASE: '/Quackpot/' }, stdio: ['ignore', 'pipe', 'pipe'] });
  evidence.server = { pid: serverChild.child.pid, command: serverChild.command, args: serverChild.args, cwd: serverChild.cwd, spawnedAt: serverChild.spawnedAt, baseURL: BASE_URL, viteBase: '/Quackpot/' };
  await waitHttpReady(serverChild);
  const served = await responseHashes({ servedEntries: await getServedEntries() });
  evidence.served = { hashes: served.hashes, entryCount: served.entries, bytes: served.bytes,
    limitation: 'finite SERVED_FILES response map; not full-network or transitive-byte attestation' };
  const proofResult = await runProof(phase, served.hashes);
  evidence.proof = proofResult;
  if (workTimedOut || totalTimedOut) throw new Error('The bounded helper deadline interrupted this proof phase.');
  const sourceAfter = await currentSourceIdentity();
  evidence.sourceAfter = sourceAfter;
  if (sourceBefore.fingerprint !== sourceAfter.fingerprint) throw new Error('Tracked source changed during the controlled Vite/browser phase.');
}

async function getServedEntries() {
  const recipe = await readFile(path.join(ROOT, RECIPE), 'utf8');
  const match = recipe.match(/const SERVED_FILES = \[([\s\S]*?)\];/);
  if (!match) throw new Error('Could not locate the finite SERVED_FILES declaration in the committed proof recipe.');
  const values = [...match[1].matchAll(/'([^']+)'/g)];
  const residue = match[1].replace(/'[^']+'/g, '').replace(/[\s,]/g, '');
  const entries = values.map((item) => item[1]);
  if (residue || entries.length < 1 || entries.length > 64 || new Set(entries).size !== entries.length) {
    throw new Error('The finite SERVED_FILES declaration is malformed, duplicated, or exceeds 64 entries.');
  }
  return entries;
}

function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  clearTimeout(workDeadlineTimer);
  clearTimeout(totalWatchdogTimer);
  cleanupPromise = (async () => {
    const proof = await stopOwned(proofChild, 'proof phase');
    const vite = await stopOwned(serverChild, 'Vite server');
    const result = { proof, vite, residual: !proof.stopped || !vite.stopped };
    evidence.cleanup = result;
    if (result.residual) process.exitCode = 1;
    return result;
  })();
  return cleanupPromise;
}

let finalizationPromise = null;
function finalize(error) {
  if (finalizationPromise) return finalizationPromise;
  finalizationPromise = (async () => {
  if (error) { evidence.error = error.stack || error.message; process.stderr.write(`${evidence.error}\n`); process.exitCode = 1; }
  if (proofChild && !evidence.proof) evidence.proofProcess = { pid: proofChild.child.pid, command: proofChild.command, args: proofChild.args,
    cwd: proofChild.cwd, spawnedAt: proofChild.spawnedAt, exit: proofChild.exit, close: proofChild.closed,
    spawnError: proofChild.error?.message ?? null, stdout: proofChild.stdout.value, stderr: proofChild.stderr.value };
  if (serverChild && evidence.server) evidence.server.exit = serverChild.exit;
  const cleanupResult = await cleanup();
  evidence.finishedAt = new Date().toISOString();
  evidence.workTimedOut = workTimedOut;
  evidence.totalTimedOut = totalTimedOut;
  const line = `${JSON.stringify(evidence)}\n`;
  try {
    const resultPath = path.join(ROOT, RESULTS);
    const prior = await stat(resultPath).catch((readError) => readError.code === 'ENOENT' ? null : Promise.reject(readError));
    if (prior && prior.size + Buffer.byteLength(line) > 2 * 1024 * 1024) throw new Error('Controlled phase evidence log would exceed 2 MiB.');
    await appendFile(resultPath, line, 'utf8');
    process.stdout.write(`${JSON.stringify({ phase: evidence.phase ?? process.argv[2] ?? null, evidenceFile: RESULTS,
      evidenceBytes: Buffer.byteLength(line), evidenceSha256: sha256(Buffer.from(line)), sourceFingerprint: evidence.sourceBefore?.fingerprint ?? null,
      serverPid: evidence.server?.pid ?? null, servedEntries: evidence.served?.entryCount ?? 0, servedBytes: evidence.served?.bytes ?? 0,
      proofPid: evidence.proof?.pid ?? null, proofExit: evidence.proof?.exit ?? null, cleanup: cleanupResult, workTimedOut, totalTimedOut })}\n`);
  } catch (writeError) {
    process.stderr.write(`Could not append controlled phase evidence: ${writeError.stack || writeError.message}\n`);
    process.exitCode = 1;
  }
  })();
  return finalizationPromise;
}

workDeadlineTimer = setTimeout(() => {
  workTimedOut = true;
  evidence.workDeadlineReachedAt = new Date().toISOString();
  void stopOwned(serverChild, 'work deadline Vite shutdown').then((result) => { evidence.workDeadlineServerStop = result; });
}, Math.max(1, MAX_WORK_MS - (Date.now() - startedAt)));
totalWatchdogTimer = setTimeout(() => {
  totalTimedOut = true;
  evidence.totalDeadlineReachedAt = new Date().toISOString();
  process.exitCode = 1;
  void cleanup();
}, Math.max(1, MAX_TOTAL_MS - (Date.now() - startedAt)));

main().then(() => finalize()).catch((error) => finalize(error)).catch((error) => {
  process.stderr.write(`Launcher finalization failed: ${error.stack || error.message}\n`);
  process.exitCode = 1;
});
