// Finite, local-only inspection of Plan 35 owned-process lifecycle helpers.
// Run only after root source review and explicit command clearance.
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { inspectOwnedIdentities, snapshotOwnedTree, startOwnedProcessMonitor } from './process-tree.mjs';
import { ROOT } from './provenance.mjs';

const MAX_CASE_MS = 13000;
const ACTIVE_BUDGET_MS = 40000;
const CLEANUP_RESERVE_MS = 10000;
const MAX_TOTAL_MS = ACTIVE_BUDGET_MS + CLEANUP_RESERVE_MS;
const MAX_OUTPUT_BYTES = 8 * 1024;
const MAX_PARENT_RECORD_BYTES = 1024;
const startedAt = Date.now();
const outcomes = [];
const fail = (message) => { throw new Error(message); };
const remainingTotalMs = () => Math.max(0, MAX_TOTAL_MS - (Date.now() - startedAt));
const activeDeadline = (caseStarted) => Math.min(caseStarted + MAX_CASE_MS, startedAt + ACTIVE_BUDGET_MS);
const identityKey = (row) => `${row.pid}:${row.created}`;

function trackSpawn(command, args, { captureReadyRelease = false, caseStartedMono = performance.now() } = {}) {
  const record = { child: spawn(command, args, { cwd: ROOT, windowsHide: true,
    stdio: captureReadyRelease ? ['pipe', 'pipe', 'ignore'] : 'ignore' }),
    pid: null, exit: null, close: null, exitElapsedMs: null, closeElapsedMs: null,
    error: null, stdout: '', stdoutOverflow: false };
  record.pid = record.child.pid ?? null;
  if (captureReadyRelease) record.child.stdout.on('data', (chunk) => {
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

async function waitForReadyRecord(record, deadline) {
  while (Date.now() < deadline && Date.now() - startedAt < MAX_TOTAL_MS) {
    if (record.error) throw new Error(`Owned child failed to spawn: ${record.error.code ?? record.error.message}`);
    if (record.stdoutOverflow || Buffer.byteLength(record.stdout) > MAX_PARENT_RECORD_BYTES)
      fail('Controlled root exceeded the bounded ready record.');
    if (record.stdout) {
      let parsed = null;
      try { parsed = JSON.parse(record.stdout.trim()); }
      catch { /* the single bounded JSON record may still be arriving */ }
      if (parsed !== null) {
        if (parsed?.ready !== true || Object.keys(parsed).some((key) => !['ready', 'pid'].includes(key)))
          fail('Controlled root emitted an unexpected ready record.');
        return parsed;
      }
    }
    if (record.close) throw new Error('Controlled root closed before its ready record was received.');
    await delay(25);
  }
  throw new Error('Controlled root did not emit its ready record before the scenario deadline.');
}

function releaseRoot(record) {
  if (!record.child.stdin?.writable) fail('Controlled root release pipe is not writable.');
  record.child.stdin.end('release\n');
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

async function waitForIdentitiesGone(tracked, deadline, trace, caseStartedMono, initialLive = null) {
  let currentLive = initialLive ?? await queryIdentities(tracked, null, trace, caseStartedMono);
  while (Date.now() < deadline && Date.now() - startedAt < MAX_TOTAL_MS) {
    if (currentLive.length === 0) return { remaining: [] };
    currentLive = await queryIdentities(tracked, null, trace, caseStartedMono);
    await delay(125);
  }
  if (currentLive.length === 0) return { remaining: [] };
  throw new Error(`Retained owned identities did not settle before the scenario deadline (live=${currentLive.length}).`);
}

async function runMonitoredCase(name, code, { expectDescendant = false } = {}) {
  const caseStarted = Date.now();
  const caseStartedMono = performance.now();
  const identityQueries = [];
  const deadline = Math.min(activeDeadline(caseStarted), Date.now() + remainingTotalMs());
  const record = trackSpawn(process.execPath, ['-e', code], { captureReadyRelease: true, caseStartedMono });
  if (!record.pid) fail(`${name}: owned child PID was not registered at spawn.`);
  const monitor = startOwnedProcessMonitor(record.pid, { intervalMs: 150, maxDurationMs: MAX_CASE_MS, isAlive: () => record.child.exitCode === null });
  let tracked = [];
  let stopped = false;
  let monitorStopStartElapsedMs = null;
  let monitorStopEndElapsedMs = null;
  let identityComparatorValidated = false;
  let preReleaseRows = [];
  let intendedDescendant = null;
  let readyRecord = null;
  let descendantStates = [];
  let descendantObservation = null;
  try {
    await monitor.ready;
    readyRecord = await waitForReadyRecord(record, deadline);
    preReleaseRows = await snapshotOwnedTree(record.pid, 2000);
    const rootIdentity = preReleaseRows.find((row) => row.pid === record.pid && row.root === true);
    if (!rootIdentity) fail(`${name}: live root snapshot did not return the controlled root identity.`);
    const liveRootRoundTrip = await queryIdentities([rootIdentity], rootIdentity, identityQueries, caseStartedMono);
    if (!liveRootRoundTrip.some((row) => identityKey(row) === identityKey(rootIdentity)))
      fail(`${name}: known-live root PID plus creation-time identity did not round-trip.`);
    identityComparatorValidated = true;

    if (expectDescendant) {
      if (!Number.isSafeInteger(readyRecord.pid) || readyRecord.pid <= 0)
        fail(`${name}: controlled root did not announce a valid child PID.`);
      intendedDescendant = preReleaseRows.find((row) => row.pid === readyRecord.pid && row.ppid === record.pid && row.root !== true) ?? null;
      if (!intendedDescendant) fail(`${name}: announced child was not present in the live pre-release process-tree snapshot.`);
    } else if (Object.hasOwn(readyRecord, 'pid')) {
      fail(`${name}: normal-exit controlled root unexpectedly announced a child.`);
    }

    releaseRoot(record);
    await waitForEvent(record, 'exit', deadline);
    monitorStopStartElapsedMs = performance.now() - caseStartedMono;
    tracked = await monitor.stop();
    monitorStopEndElapsedMs = performance.now() - caseStartedMono;
    stopped = true;
    const identities = new Map([...preReleaseRows, ...tracked].map((row) => [identityKey(row), row]));
    tracked = [...identities.values()];
    if (!tracked.some((row) => row.pid === record.pid && row.root === true))
      fail(`${name}: recorded identities did not retain the controlled root identity.`);
    if (intendedDescendant && !tracked.some((row) => identityKey(row) === identityKey(intendedDescendant)))
      fail(`${name}: intended child identity was not retained for post-exit inspection.`);

    const firstPostExitLive = await queryIdentities(tracked, null, identityQueries, caseStartedMono);
    const liveKeys = new Set(firstPostExitLive.map(identityKey));
    const retainedChildren = tracked.filter((row) => row.root !== true);
    descendantStates = retainedChildren.map(({ pid, created }) => ({ pid, created,
      firstPostExitStatus: liveKeys.has(`${pid}:${created}`) ? 'live' : 'absent' }));
    if (expectDescendant) {
      const observedSurvivor = descendantStates.some((row) => row.firstPostExitStatus === 'live');
      descendantObservation = observedSurvivor ? 'surviving-descendant-observed' : 'no-survivor-observed-in-this-environment';
    }

    const cleared = await waitForIdentitiesGone(tracked, deadline, identityQueries, caseStartedMono, firstPostExitLive);
    const rootClose = await waitForEvent(record, 'close', deadline);
    outcomes.push({ name, result: 'pass', rootPid: record.pid, readyRecord, rootExit: record.exit, rootClose,
      rootExitElapsedMs: record.exitElapsedMs, rootCloseElapsedMs: record.closeElapsedMs,
      monitorStopStartElapsedMs, monitorStopEndElapsedMs, rootIdentityRoundTrip: true,
      intendedIdentity: intendedDescendant, descendantObservation, descendantStates,
      identityQueries, trackedIdentityCount: tracked.length, allRecordedIdentitiesAbsent: cleared.remaining.length === 0,
      samplingLimit: 'Identity status is a point-in-time query after root exit; no survivor observed does not establish that the child never survived.',
      elapsedMs: Date.now() - caseStarted });
  } catch (error) {
    if (record.child.exitCode === null && record.pid) { try { record.child.kill(); } catch {} }
    if (!stopped) {
      try { tracked = await monitor.stop(); stopped = true; }
      catch { /* the uncertainty is retained in the reported failure below */ }
    }
    tracked = [...new Map([...preReleaseRows, ...tracked].map((row) => [identityKey(row), row])).values()];
    let cleanupConfirmed = false;
    if (tracked.length && identityComparatorValidated) {
      try {
        await waitForIdentitiesGone(tracked, Math.min(Date.now() + 8000, startedAt + MAX_TOTAL_MS), identityQueries, caseStartedMono);
        cleanupConfirmed = true;
      } catch { /* report cleanup as unproven */ }
    }
    const errorText = error.stack || error.message;
    outcomes.push({ name, result: 'failed-or-uncertain', rootPid: record.pid, readyRecord,
      rootExit: record.exit, rootExitElapsedMs: record.exitElapsedMs, rootCloseElapsedMs: record.closeElapsedMs,
      monitorStopStartElapsedMs, monitorStopEndElapsedMs, rootIdentityRoundTrip: identityComparatorValidated,
      intendedIdentity: intendedDescendant, descendantObservation, descendantStates,
      identityQueries, trackedIdentityCount: tracked.length, cleanupConfirmed,
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
    "const { spawn } = require('node:child_process'); const child = spawn(process.execPath, ['-e', 'setTimeout(() => process.exit(0), 8500)'], { windowsHide: true, stdio: 'ignore' }); if (!child.pid) process.exit(3); process.stdout.write(JSON.stringify({ ready: true, pid: child.pid })); process.stdin.once('data', () => process.exit(0)); setTimeout(() => process.exit(0), 8000);",
    { expectDescendant: true });
  await runMonitoredCase('normal-exit',
    "process.stdout.write(JSON.stringify({ ready: true })); process.stdin.once('data', () => process.exit(0)); setTimeout(() => process.exit(0), 8000);");
  await startupFailureCase();
  await inspectionFailureCase();
  const result = { probe: 'plan35-owned-process-lifecycle/1',
    coverageLimit: 'Exercises exact-identity helpers with controlled ready/release roots. Parent-exit classifications are point-in-time samples; no survivor observed does not establish that a child never survived. Does not exercise CDP/launcher shutdown, forced termination, or a mid-run CIM outage.',
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
    coverageLimit: 'Exercises exact-identity helpers with controlled ready/release roots. Parent-exit classifications are point-in-time samples; no survivor observed does not establish that a child never survived. Does not exercise CDP/launcher shutdown, forced termination, or a mid-run CIM outage.',
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
