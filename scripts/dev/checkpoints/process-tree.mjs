import { spawn } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './provenance.mjs';

const fail = (message) => { throw new Error(message); };
const SCRIPT = path.join(ROOT, 'scripts/dev/checkpoints/process-tree.ps1');

function inspect(args, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, ...args],
      { cwd: ROOT, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let overflow = false;
    const append = (current, chunk) => {
      if (current.length + chunk.length > 256 * 1024) { overflow = true; return current; }
      return current + chunk.toString('utf8');
    };
    child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk); });
    child.stderr.on('data', (chunk) => { stderr = append(stderr, chunk); });
    const timer = setTimeout(() => { try { child.kill(); } catch {} reject(new Error('Owned process-tree inspection timed out.')); }, timeoutMs);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 || overflow) return reject(new Error(`Owned process-tree inspection failed (${code}): ${stderr.slice(0, 1024)}`));
      try {
        const parsed = JSON.parse(stdout.trim() || '[]');
        const rows = Array.isArray(parsed) ? parsed : [parsed];
        if (rows.some((row) => !Number.isSafeInteger(row.pid) || !Number.isSafeInteger(row.ppid) || typeof row.created !== 'string' || !row.created)) fail('Malformed process-tree inspection output.');
        resolve(rows);
      } catch (error) { reject(error); }
    });
  });
}

export function snapshotOwnedTree(rootPid, timeoutMs = 2500, rootCreated = null) {
  if (!Number.isSafeInteger(rootPid) || rootPid <= 0 || !/^\d+$/.test(rootCreated ?? '')) return Promise.reject(new Error('Bound root PID and UTC creation ticks are required.'));
  return inspect(['-RootPid', String(rootPid), '-RootCreated', rootCreated], timeoutMs);
}

export async function captureRootIdentity(rootPid, timeoutMs = 2500) {
  if (!Number.isSafeInteger(rootPid) || rootPid <= 0) throw new Error('Invalid owned process root PID.');
  const rows = await inspect(['-RootPid', String(rootPid), '-RootOnly'], timeoutMs);
  if (rows.length !== 1 || rows[0].pid !== rootPid || !/^\d+$/.test(rows[0].created)) throw new Error('Live root identity unavailable.');
  return { ...rows[0], root: true };
}

export function inspectOwnedIdentities(rows, timeoutMs = 2500) {
  if (!Array.isArray(rows) || rows.some((row) => !Number.isSafeInteger(row.pid) || typeof row.created !== 'string' || !row.created)) {
    return Promise.reject(new Error('Invalid retained process identity list.'));
  }
  if (!rows.length) return Promise.resolve([]);
  return inspect(['-OwnedJson', JSON.stringify(rows.map(({ pid, created }) => ({ pid, created })))], timeoutMs);
}

export function startOwnedProcessMonitor(rootPid, { intervalMs = 750, maxDurationMs = 76000, isAlive = () => true,
  captureRoot = captureRootIdentity, snapshot = snapshotOwnedTree } = {}) {
  const identities = new Map();
  const started = Date.now();
  let stopped = false, timer = null, active = null, failure = null, rootIdentity = null;
  const sample = () => {
    if (stopped) return Promise.resolve();
    const work = (async () => {
      try {
        if (!rootIdentity) rootIdentity = await captureRoot(rootPid, 2000);
        const rows = await snapshot(rootPid, 2000, rootIdentity.created);
        if (!rows.some(row => row.root === true) && isAlive()) throw new Error('Owned process root disappeared during live monitoring.');
        for (const row of rows) identities.set(`${row.pid}:${row.created}`, row);
      } catch (error) { if (!failure) failure = error; }
    })();
    active = work;
    return work.then(() => {
      if (active === work) active = null;
      if (!stopped) {
        if (Date.now() - started >= maxDurationMs) failure ??= new Error('Owned process monitor reached its hard deadline.');
        else timer = setTimeout(() => { sample().catch(() => {}); }, intervalMs);
      }
      if (failure) throw failure;
    });
  };
  const ready = sample();
  return {
    ready,
    get rootIdentity() { return rootIdentity; },
    async stop() {
      stopped = true; clearTimeout(timer);
      if (active) await active.catch(() => {});
      if (failure) {
        const error = new Error(`Owned process monitor failed: ${failure.message}`, { cause: failure });
        error.ownedIdentities = [...identities.values()];
        error.inspectionFailureStage = 'tree-snapshot';
        error.inspectionFailureMessage = failure.message;
        throw error;
      }
      return [...identities.values()];
    },
  };
}
