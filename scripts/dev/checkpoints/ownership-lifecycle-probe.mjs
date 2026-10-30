// Finite, local-only inspection of Plan 35 owned-process lifecycle helpers.
// Run only after root source review and explicit command clearance.
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { diagnoseOwnedIdentities, inspectOwnedIdentities, startOwnedProcessMonitor } from './process-tree.mjs';
import { ROOT } from './provenance.mjs';

const MAX_CASE_MS = 13000;
const ACTIVE_BUDGET_MS = 40000;
const CLEANUP_RESERVE_MS = 10000;
const MAX_TOTAL_MS = ACTIVE_BUDGET_MS + CLEANUP_RESERVE_MS;
const MAX_OUTPUT_BYTES = 8 * 1024;
const MAX_PARENT_RECORD_BYTES = 1024;
const startedAt = Date.now();
const outcomes = [];
let identityComparatorValidated = false;
const fail = (message) => { throw new Error(message); };
const remainingTotalMs = () => Math.max(0, MAX_TOTAL_MS - (Date.now() - startedAt));
const activeDeadline = (caseStarted) => Math.min(caseStarted + MAX_CASE_MS, startedAt + ACTIVE_BUDGET_MS);
const identityKey = (row) => `${row.pid}:${row.created}`;

function trackSpawn(command, args, { captureStdout = false, caseStartedMono } = {}) {
  const record = { child: spawn(command, args, { cwd: ROOT, windowsHide: true,
    stdio: captureStdout ? ['ignore', 'pipe', 'ignore'] : 'ignore' }),
    pid: null, exit: null, close: null, exitElapsedMs: null, closeElapsedMs: null,
    error: null, stdout: '', stdoutOverflow: false };
  record.pid = record.child.pid ?? null;
  if (captureStdout) record.child.stdout.on('data', (chunk) => {
    if (Buffer.byteLength(record.stdout) + chunk.length > MAX_PARENT_RECORD_BYTES) record.stdoutOverflow = true;
    else record.stdout += chunk.toString('utf8');
  });
  record.child.once('error', (error) => { record.error = error; });
  record.child.once('exit', (code, signal) => {
    record.exit = { code, signal };
    record.exitElapsedMs = performance.now() - caseStartedMono;
  });
  record.child.once('close', (code, signal) => {
    record.close = { code, signal };
    record.closeElapsedMs = performance.now() - caseStartedMono;
  });
  return record;
}

async function waitForEvent(record, eventName, deadline) {
  while (Date.now() < deadline && Date.now() - startedAt < MAX_TOTAL_MS) {
    if (record.error) throw new Error(`Owned child failed to spawn: ${record.error.code ?? record.error.message}`);
    if (record[eventName]) return record[eventName];
    await delay(50);
  }
  throw new Error(`Owned child did not emit ${eventName} before its scenario deadline.`);
}

async function queryIdentities(tracked, expectedIdentity, trace, caseStartedMono) {
  const query = { startElapsedMs: performance.now() - caseStartedMono, querySucceeded: false };
  try {
    const live = await inspectOwnedIdentities(tracked, 2000);
    query.endElapsedMs = performance.now() - caseStartedMono;
    query.querySucceeded = true;
    query.expectedIdentity = expectedIdentity ? {
      pid: expectedIdentity.pid, created: expectedIdentity.created,
      returned: live.some((row) => identityKey(row) === identityKey(expectedIdentity)),
    } : null;
    query.liveControlledIdentities = live.map(({ pid, created }) => ({ pid, created }));
    if (trace.length < 24) trace.push(query);
    else fail('Identity-query diagnostic trace exceeded its 24-query bound.');
    return live;
  } catch (error) {
    query.endElapsedMs = performance.now() - caseStartedMono;
    query.expectedIdentity = expectedIdentity ? { pid: expectedIdentity.pid, created: expectedIdentity.created, returned: false } : null;
    query.error = (error.message || String(error)).slice(0, 200);
    if (trace.length < 24) trace.push(query);
    throw error;
  }
}

async function waitForIdentitiesGone(tracked, deadline, expectedLiveIdentity, trace, caseStartedMono) {
  if (!identityComparatorValidated) fail('Refusing to treat empty identity results as cleanup evidence before a known-live round-trip.');
  let sawExpectedLive = expectedLiveIdentity === null || identityComparatorValidated;
  let live = [];
  while (Date.now() < deadline && Date.now() - startedAt < MAX_TOTAL_MS) {
    live = await queryIdentities(tracked, expectedLiveIdentity, trace, caseStartedMono);
    if (expectedLiveIdentity && live.some((row) => identityKey(row) === identityKey(expectedLiveIdentity))) sawExpectedLive = true;
    const expectedWasObserved = expectedLiveIdentity === null || sawExpectedLive;
    if (expectedWasObserved && live.length === 0) return { observedExpectedLive: expectedLiveIdentity ? sawExpectedLive : null, remaining: [] };
    await delay(125);
  }
  throw new Error(`Retained owned identities did not settle before the scenario deadline (live=${live.length}, expectedObserved=${sawExpectedLive}).`);
}

async function runMonitoredCase(name, code, { expectedLiveDescendant = false } = {}) {
  const caseStarted = Date.now();
  const caseStartedMono = performance.now();
  const identityQueries = [];
  const deadline = Math.min(activeDeadline(caseStarted), Date.now() + remainingTotalMs());
  const record = trackSpawn(process.execPath, ['-e', code], { captureStdout: expectedLiveDescendant, caseStartedMono });
  if (!record.pid) fail(`${name}: owned child PID was not registered at spawn.`);
  const monitor = startOwnedProcessMonitor(record.pid, { intervalMs: 150, maxDurationMs: MAX_CASE_MS, isAlive: () => record.child.exitCode === null });
  let tracked = [];
  let stopped = false;
  let monitorStopStartElapsedMs = null;
  let monitorStopEndElapsedMs = null;
  let expectedDescendant = null;
  let identityDiagnostic = null;
  try {
    await monitor.ready;
    await waitForEvent(record, 'exit', deadline);
    monitorStopStartElapsedMs = performance.now() - caseStartedMono;
    tracked = await monitor.stop();
    monitorStopEndElapsedMs = performance.now() - caseStartedMono;
    stopped = true;
    const root = tracked.find((row) => row.pid === record.pid && row.root === true);
    if (!root) fail(`${name}: retained process tree did not contain the observed owned root identity.`);
    if (expectedLiveDescendant) {
      if (record.stdoutOverflow || Buffer.byteLength(record.stdout) > MAX_PARENT_RECORD_BYTES)
        fail(`${name}: controlled parent exceeded the bounded child-identity record.`);
      const lines = record.stdout.trim().split(/\r?\n/);
      if (lines.length !== 1) fail(`${name}: controlled parent did not emit exactly one child-identity record.`);
      let emitted;
      try { emitted = JSON.parse(lines[0]); } catch { fail(`${name}: controlled parent emitted malformed child-identity JSON.`); }
      if (!Number.isSafeInteger(emitted?.pid) || emitted.pid <= 0) fail(`${name}: emitted child PID was invalid.`);
      expectedDescendant = tracked.find((row) => row.pid === emitted.pid && row.ppid === record.pid && row.root !== true) ?? null;
      if (!expectedDescendant) fail(`${name}: intended child PID ${emitted.pid} had no retained PID plus creation identity.`);
      const liveRoundTrip = await queryIdentities([expectedDescendant], expectedDescendant, identityQueries, caseStartedMono);
      if (!liveRoundTrip.some((row) => identityKey(row) === identityKey(expectedDescendant))) {
        identityDiagnostic = await diagnoseOwnedIdentities([expectedDescendant], 2000);
        fail(`${name}: known-live identity round-trip did not return the intended child PID plus creation time.`);
      }
      identityComparatorValidated = true;
    }
    const cleared = await waitForIdentitiesGone(tracked, deadline, expectedDescendant, identityQueries, caseStartedMono);
    const rootClose = await waitForEvent(record, 'close', deadline);
    outcomes.push({ name, result: 'pass', rootPid: record.pid, rootExit: record.exit, rootClose,
      rootExitElapsedMs: record.exitElapsedMs, rootCloseElapsedMs: record.closeElapsedMs,
      monitorStopStartElapsedMs, monitorStopEndElapsedMs, intendedIdentity: expectedDescendant,
      identityComparatorValidated, identityQueries, trackedIdentityCount: tracked.length,
      observedDescendantLiveAfterParentExit: expectedDescendant ? cleared.observedExpectedLive : null, elapsedMs: Date.now() - caseStarted });
  } catch (error) {
    if (record.child.exitCode === null && record.pid) { try { record.child.kill(); } catch {} }
    if (!stopped) {
      try { tracked = await monitor.stop(); stopped = true; }
      catch { /* the uncertainty is retained in the reported failure below */ }
    }
    let cleanupConfirmed = false;
    if (tracked.length) {
      if (identityComparatorValidated) {
        try {
          await waitForIdentitiesGone(tracked, Math.min(Date.now() + 8000, startedAt + MAX_TOTAL_MS), null, identityQueries, caseStartedMono);
          cleanupConfirmed = true;
        } catch { /* report cleanup as unproven */ }
      }
    }
    const errorText = error.stack || error.message;
    outcomes.push({ name, result: 'failed-or-uncertain', rootPid: record.pid,
      rootExit: record.exit, rootExitElapsedMs: record.exitElapsedMs, rootCloseElapsedMs: record.closeElapsedMs,
      monitorStopStartElapsedMs, monitorStopEndElapsedMs, intendedIdentity: expectedLiveDescendant ? expectedDescendant ?? null : null,
      identityDiagnostic, identityComparatorValidated, identityQueries, trackedIdentityCount: tracked.length, cleanupConfirmed,
      error: errorText.slice(0, 2000), elapsedMs: Date.now() - caseStarted });
    throw new Error(`${name} failed; cleanupConfirmed=${cleanupConfirmed}: ${error.message}`);
  }
}

async function startupFailureCase() {
  const caseStarted = Date.now();
  const deadline = Math.min(activeDeadline(caseStarted), Date.now() + remainingTotalMs());
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
  await runMonitoredCase('parent-early-exit',
    "const { spawn } = require('node:child_process'); const child = spawn(process.execPath, ['-e', 'setTimeout(() => process.exit(0), 8500)'], { windowsHide: true, stdio: 'ignore' }); if (!child.pid) process.exit(3); process.stdout.write(JSON.stringify({ pid: child.pid })); setTimeout(() => process.exit(0), 2500);",
    { expectedLiveDescendant: true });
  await runMonitoredCase('normal-exit', 'setTimeout(() => process.exit(0), 2500)');
  await startupFailureCase();
  await inspectionFailureCase();
  const result = { probe: 'plan35-owned-process-lifecycle/1',
    coverageLimit: 'Exercises monitoring/identity helpers with naturally exiting children only; does not exercise cdp/launcher shutdown, forced termination, or mid-run CIM outage.',
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(), elapsedMs: Date.now() - startedAt, limits: { caseMs: MAX_CASE_MS,
      activeBudgetMs: ACTIVE_BUDGET_MS, totalMs: MAX_TOTAL_MS, cleanupReserveMs: CLEANUP_RESERVE_MS,
      parentIdentityRecordBytes: MAX_PARENT_RECORD_BYTES, maxOutputBytes: MAX_OUTPUT_BYTES }, outcomes };
  const line = `${JSON.stringify(result)}\n`;
  if (Buffer.byteLength(line) > MAX_OUTPUT_BYTES) fail('Ownership probe output exceeds its 8 KiB cap.');
  process.stdout.write(line);
}

main().catch((error) => {
  const result = { probe: 'plan35-owned-process-lifecycle/1',
    coverageLimit: 'Exercises monitoring/identity helpers with naturally exiting children only; does not exercise cdp/launcher shutdown, forced termination, or mid-run CIM outage.',
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(), elapsedMs: Date.now() - startedAt, status: 'failed-or-uncertain',
    limits: { caseMs: MAX_CASE_MS, activeBudgetMs: ACTIVE_BUDGET_MS, totalMs: MAX_TOTAL_MS,
      cleanupReserveMs: CLEANUP_RESERVE_MS, parentIdentityRecordBytes: MAX_PARENT_RECORD_BYTES, maxOutputBytes: MAX_OUTPUT_BYTES },
    error: (error.stack || error.message).slice(0, 3000), outcomes };
  const line = `${JSON.stringify(result)}\n`;
  if (Buffer.byteLength(line) <= MAX_OUTPUT_BYTES) process.stdout.write(line);
  else process.stderr.write('Ownership probe failure record exceeded the 8 KiB cap.\n');
  process.stderr.write(`${error.message.slice(0, 1000)}\n`);
  process.exitCode = 1;
});
