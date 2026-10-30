import { spawn } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './provenance.mjs';

const fail = (message) => { throw new Error(message); };
const SCRIPT = path.join(ROOT, 'scripts/dev/checkpoints/process-tree.ps1');

export function snapshotOwnedTree(rootPid, timeoutMs = 2500) {
  if (!Number.isSafeInteger(rootPid) || rootPid <= 0) return Promise.reject(new Error('Invalid owned process root PID.'));
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-RootPid', String(rootPid)],
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
        if (rows.some((row) => !Number.isSafeInteger(row.pid) || !Number.isSafeInteger(row.ppid) || typeof row.created !== 'string')) fail('Malformed process-tree inspection output.');
        resolve(rows);
      } catch (error) { reject(error); }
    });
  });
}
