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

export function snapshotOwnedTree(rootPid, timeoutMs = 2500) {
  if (!Number.isSafeInteger(rootPid) || rootPid <= 0) return Promise.reject(new Error('Invalid owned process root PID.'));
  return inspect(['-RootPid', String(rootPid)], timeoutMs);
}

export function inspectOwnedIdentities(rows, timeoutMs = 2500) {
  if (!Array.isArray(rows) || rows.some((row) => !Number.isSafeInteger(row.pid) || typeof row.created !== 'string' || !row.created)) {
    return Promise.reject(new Error('Invalid retained process identity list.'));
  }
  if (!rows.length) return Promise.resolve([]);
  return inspect(['-OwnedJson', JSON.stringify(rows.map(({ pid, created }) => ({ pid, created })))], timeoutMs);
}

export function startOwnedProcessMonitor(rootPid, { intervalMs = 750, maxDurationMs = 76000, isAlive = () => true } = {}) {
  const identities = new Map();
  const started = Date.now();
  let stopped = false;
  let timer = null;
  let active = null;
  let failure = null;
  let firstSample = true;
  const rememberFailure = (stage, error) => {
    if (!failure) failure = { stage, error };
  };
  const sample = async () => {
    if (stopped) return;
    active = snapshotOwnedTree(rootPid, 2000);
    try {
      const rows = await active;
      if (!rows.some((row) => row.root === true) && isAlive()) {
        rememberFailure('live-root-unobserved', new Error('Owned process root disappeared during live monitoring.'));
      }
      for (const row of rows) identities.set(`${row.pid}:${row.created}`, row);
    } catch (error) { rememberFailure('tree-snapshot', error); }
    finally { active = null; }
    const initialFailure = firstSample && failure;
    firstSample = false;
    if (!stopped) {
      if (Date.now() - started >= maxDurationMs) {
        rememberFailure('monitor-deadline', new Error('Owned process monitor reached its hard deadline.'));
      }
      else timer = setTimeout(sample, intervalMs);
    }
    if (initialFailure) throw initialFailure.error;
  };
  const ready = sample();
  return {
    ready,
    async stop() {
      stopped = true;
      clearTimeout(timer);
      if (active) await active.catch(() => {});
      if (failure) {
        const stoppedError = new Error(`Owned process monitor failed during ${failure.stage}: ${failure.error.message}`, { cause: failure.error });
        stoppedError.ownedIdentities = [...identities.values()];
        stoppedError.inspectionFailureStage = failure.stage;
        stoppedError.inspectionFailureMessage = failure.error.message;
        throw stoppedError;
      }
      return [...identities.values()];
    },
  };
}
