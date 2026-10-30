// Finite, local-only inspection of Plan 35 owned-process lifecycle helpers.
// Run only after root source review and explicit command clearance.
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { inspectOwnedIdentities, startOwnedProcessMonitor } from './process-tree.mjs';
import { ROOT } from './provenance.mjs';

const MAX_CASE_MS = 7000;
const MAX_TOTAL_MS = 38000;
const MAX_OUTPUT_BYTES = 8 * 1024;
const startedAt = Date.now();
const outcomes = [];
const fail = (message) => { throw new Error(message); };
const remainingTotalMs = () => Math.max(0, MAX_TOTAL_MS - (Date.now() - startedAt));
const identityKey = (row) => `${row.pid}:${row.created}`;

function trackSpawn(command, args) {
  const record = { child: spawn(command, args, { cwd: ROOT, windowsHide: true, stdio: 'ignore' }),
    pid: null, exit: null, close: null, error: null };
  record.pid = record.child.pid ?? null;
  record.child.once('error', (error) => { record.error = error; });
  record.child.once('exit', (code, signal) => { record.exit = { code, signal }; });
  record.child.once('close', (code, signal) => { record.close = { code, signal }; });
  return record;
}

async function waitForClose(record, deadline) {
  while (Date.now() < deadline && Date.now() - startedAt < MAX_TOTAL_MS) {
    if (record.error) throw new Error(`Owned child failed to spawn: ${record.error.code ?? record.error.message}`);
    if (record.close) return record.close;
    await delay(50);
  }
  throw new Error('Owned child did not close before its scenario deadline.');
}

async function waitForIdentitiesGone(tracked, deadline, expectedLiveIdentity = null) {
  let sawExpectedLive = expectedLiveIdentity === null;
  let live = [];
  while (Date.now() < deadline && Date.now() - startedAt < MAX_TOTAL_MS) {
    live = await inspectOwnedIdentities(tracked, 2000);
    if (expectedLiveIdentity && live.some((row) => identityKey(row) === identityKey(expectedLiveIdentity))) sawExpectedLive = true;
    if (sawExpectedLive && live.length === 0) return { observedExpectedLive: sawExpectedLive, remaining: [] };
    await delay(125);
  }
  throw new Error(`Retained owned identities did not settle before the scenario deadline (live=${live.length}, expectedObserved=${sawExpectedLive}).`);
}

async function runMonitoredCase(name, code, { expectedLiveDescendant = false } = {}) {
  const caseStarted = Date.now();
  const deadline = Math.min(caseStarted + MAX_CASE_MS, Date.now() + remainingTotalMs());
  const record = trackSpawn(process.execPath, ['-e', code]);
  if (!record.pid) fail(`${name}: owned child PID was not registered at spawn.`);
  const monitor = startOwnedProcessMonitor(record.pid, { intervalMs: 150, maxDurationMs: MAX_CASE_MS, isAlive: () => record.child.exitCode === null });
  let tracked = [];
  let stopped = false;
  try {
    await monitor.ready;
    const rootClose = await waitForClose(record, deadline);
    tracked = await monitor.stop();
    stopped = true;
    const root = tracked.find((row) => row.pid === record.pid && row.root === true);
    if (!root) fail(`${name}: retained process tree did not contain the observed owned root identity.`);
    let expectedDescendant = null;
    if (expectedLiveDescendant) {
      expectedDescendant = tracked.find((row) => row.ppid === record.pid && row.pid !== record.pid) ?? null;
      if (!expectedDescendant) fail(`${name}: no independently retained direct child identity was observed.`);
    }
    const cleared = await waitForIdentitiesGone(tracked, deadline, expectedDescendant);
    outcomes.push({ name, result: 'pass', rootPid: record.pid, rootExit: rootClose, trackedIdentityCount: tracked.length,
      observedDescendantLiveAfterParentExit: cleared.observedExpectedLive, elapsedMs: Date.now() - caseStarted });
  } catch (error) {
    if (record.child.exitCode === null && record.pid) { try { record.child.kill(); } catch {} }
    if (!stopped) {
      try { tracked = await monitor.stop(); stopped = true; }
      catch { /* the uncertainty is retained in the reported failure below */ }
    }
    let cleanupConfirmed = false;
    if (tracked.length) {
      try {
        await waitForIdentitiesGone(tracked, Math.min(Date.now() + 8000, startedAt + MAX_TOTAL_MS));
        cleanupConfirmed = true;
      } catch { /* report cleanup as unproven */ }
    }
    const errorText = error.stack || error.message;
    outcomes.push({ name, result: 'failed-or-uncertain', rootPid: record.pid,
      rootExit: record.exit, trackedIdentityCount: tracked.length, cleanupConfirmed,
      error: errorText.slice(0, 2000), elapsedMs: Date.now() - caseStarted });
    throw new Error(`${name} failed; cleanupConfirmed=${cleanupConfirmed}: ${error.message}`);
  }
}

async function startupFailureCase() {
  const caseStarted = Date.now();
  const deadline = Math.min(caseStarted + MAX_CASE_MS, Date.now() + remainingTotalMs());
  const missingExecutable = path.join(ROOT, 'scripts/dev/checkpoints/__qp35_missing_owned_executable__.exe');
  try {
    await access(missingExecutable);
    fail('startup-failure probe path exists; refusing to launch an unexpected executable.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const record = trackSpawn(missingExecutable, []);
  while (Date.now() < deadline && !record.error && !record.close) await delay(25);
  if (!record.error || record.pid !== null) {
    outcomes.push({ name: 'startup-failure', result: 'failed', errorCode: record.error?.code ?? null,
      pidRegistered: record.pid !== null, elapsedMs: Date.now() - caseStarted });
    fail('startup-failure: expected an explicit spawn error and no owned PID.');
  }
  outcomes.push({ name: 'startup-failure', result: 'pass', errorCode: record.error.code, pidRegistered: false,
    elapsedMs: Date.now() - caseStarted });
}

async function inspectionFailureCase() {
  const caseStarted = Date.now();
  const monitor = startOwnedProcessMonitor(0, { intervalMs: 100, maxDurationMs: MAX_CASE_MS });
  let initialError = null;
  try { await monitor.ready; }
  catch (error) { initialError = error; }
  let stickyError = null;
  try { await monitor.stop(); }
  catch (error) { stickyError = error; }
  if (!initialError?.message.includes('Invalid owned process root PID')
      || !stickyError?.message.includes('Invalid owned process root PID')) fail('inspection-failure: invalid root did not fail and remain sticky.');
  outcomes.push({ name: 'inspection-failure', case: 'invalid-root-input-only', result: 'pass', initialRejected: true, uncertaintySticky: true,
    processKillAttempted: false, elapsedMs: Date.now() - caseStarted });
}

async function main() {
  if (process.platform !== 'win32') fail('This bounded ownership probe requires the reviewed Windows process-tree inspector.');
  await runMonitoredCase('normal-exit', 'setTimeout(() => process.exit(0), 2500)');
  await runMonitoredCase('parent-early-exit',
    "const { spawn } = require('node:child_process'); const child = spawn(process.execPath, ['-e', 'setTimeout(() => process.exit(0), 4500)'], { windowsHide: true, stdio: 'ignore' }); setTimeout(() => process.exit(0), 2500);",
    { expectedLiveDescendant: true });
  await startupFailureCase();
  await inspectionFailureCase();
  const result = { probe: 'plan35-owned-process-lifecycle/1',
    coverageLimit: 'Exercises monitoring/identity helpers with naturally exiting children only; does not exercise cdp/launcher shutdown, forced termination, or mid-run CIM outage.',
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(), elapsedMs: Date.now() - startedAt, limits: { caseMs: MAX_CASE_MS,
      totalMs: MAX_TOTAL_MS, cleanupReserveMs: MAX_TOTAL_MS - MAX_CASE_MS * 4, maxOutputBytes: MAX_OUTPUT_BYTES }, outcomes };
  const line = `${JSON.stringify(result)}\n`;
  if (Buffer.byteLength(line) > MAX_OUTPUT_BYTES) fail('Ownership probe output exceeds its 8 KiB cap.');
  process.stdout.write(line);
}

main().catch((error) => {
  const result = { probe: 'plan35-owned-process-lifecycle/1',
    coverageLimit: 'Exercises monitoring/identity helpers with naturally exiting children only; does not exercise cdp/launcher shutdown, forced termination, or mid-run CIM outage.',
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(), elapsedMs: Date.now() - startedAt, status: 'failed-or-uncertain',
    error: (error.stack || error.message).slice(0, 3000), outcomes };
  const line = `${JSON.stringify(result)}\n`;
  if (Buffer.byteLength(line) <= MAX_OUTPUT_BYTES) process.stdout.write(line);
  else process.stderr.write('Ownership probe failure record exceeded the 8 KiB cap.\n');
  process.stderr.write(`${error.message.slice(0, 1000)}\n`);
  process.exitCode = 1;
});
