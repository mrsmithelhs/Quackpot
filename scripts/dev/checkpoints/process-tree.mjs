import { spawn } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './provenance.mjs';

const fail = (message) => { throw new Error(message); };
const SCRIPT = path.join(ROOT, 'scripts/dev/checkpoints/process-tree.ps1');

function inspect(args, timeoutMs = 2500, { diagnostic = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, ...args],
      { cwd: ROOT, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let overflow = false;
    const maxStdoutBytes = diagnostic ? 2 * 1024 : 256 * 1024;
    const append = (current, chunk) => {
      if (Buffer.byteLength(current) + chunk.length > maxStdoutBytes) { overflow = true; return current; }
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
        if (diagnostic) {
          if (parsed?.kind !== 'owned-identity-diagnostic/1'
              || !Array.isArray(parsed.receivedOwnedJson)
              || !Array.isArray(parsed.currentRowsForSuppliedPids)
              || !Array.isArray(parsed.comparisons)) fail('Malformed owned identity diagnostic output.');
          resolve(parsed);
          return;
        }
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

export function diagnoseOwnedIdentities(rows, timeoutMs = 2500) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 4
      || rows.some((row) => !Number.isSafeInteger(row.pid) || typeof row.created !== 'string' || !row.created)) {
    return Promise.reject(new Error('Invalid or oversized diagnostic owned identity list.'));
  }
  return inspect(['-OwnedJson', JSON.stringify(rows.map(({ pid, created }) => ({ pid, created }))), '-DiagnosticOwned'],
    timeoutMs, { diagnostic: true });
}

export function startOwnedProcessMonitor(rootPid, { intervalMs = 750, maxDurationMs = 76000, isAlive = () => true } = {}) {
  const identities = new Map();
  const started = Date.now();
  let stopped = false;
  let timer = null;
  let active = null;
  let failure = null;
  let firstSample = true;
  const sample = async () => {
    if (stopped) return;
    active = snapshotOwnedTree(rootPid, 2000);
    try {
      const rows = await active;
      if (!rows.some((row) => row.root === true) && isAlive()) failure ??= new Error('Owned process root disappeared during live monitoring.');
      for (const row of rows) identities.set(`${row.pid}:${row.created}`, row);
    } catch (error) { failure ??= error; }
    finally { active = null; }
    const initialFailure = firstSample && failure;
    firstSample = false;
    if (!stopped) {
      if (Date.now() - started >= maxDurationMs) failure ??= new Error('Owned process monitor reached its hard deadline.');
      else timer = setTimeout(sample, intervalMs);
    }
    if (initialFailure) throw initialFailure;
  };
  const ready = sample();
  return {
    ready,
    async stop() {
      stopped = true;
      clearTimeout(timer);
      if (active) await active.catch(() => {});
      if (failure) throw failure;
      return [...identities.values()];
    },
  };
}
