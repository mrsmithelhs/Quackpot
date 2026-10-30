import { appendFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { assertCatalogBoundary, validateAndHydrate } from './envelope.mjs';
import { closeIsolatedChrome, clickPointer, createPage, evaluate, launchIsolatedChrome, mounted, waitFor } from './cdp.mjs';
import {
  CATALOG_PATH, MAX_FIXTURE_BYTES, MAX_FIXTURE_TOTAL_BYTES, PLAN35, ROOT, STORAGE_KEY,
  assertCaptureParent, catalogEntry, currentLoaderSha256, readBounded, readCatalog, readFixtureBeforeParse,
  resolveRepoPath, sha256, verifyPinnedPlan16Archive, verifyPlan16SourceClosure, validateFreshness,
} from './provenance.mjs';

const BASE_URL = process.env.QP35_BASE_URL;
const RESULT_PATH = path.join(ROOT, PLAN35, 'pilot-results.jsonl');
let servedSourceMapSha256 = null;
const fail = (message) => { throw new Error(message); };

async function pageSave(cdp, page, label) {
  const raw = await evaluate(cdp, page.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
  if (!raw) fail(`${label}: ordinary application save key was empty.`);
  const envelope = JSON.parse(raw);
  return { raw, envelope, hash: sha256(raw) };
}

async function createIsolatedPage(browser, fixtureRaw = null) {
  return createPage(browser.cdp, BASE_URL, { fixtureRaw });
}

async function assertAppReady(cdp, page, expectedEnvelope = null) {
  const expectedState = expectedEnvelope?.state;
  const predicate = expectedState
    ? `(() => { try { const e=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})); return document.readyState==='complete'&&e?.state?.step===${JSON.stringify(expectedState.step)}&&e?.state?.activeModal===${JSON.stringify(expectedState.activeModal)}; } catch { return false; } })()`
    : `document.readyState==='complete'&&Boolean(document.querySelector('#main-content'))`;
  await waitFor(cdp, page.sessionId, predicate, 'ordinary application restore');
}

async function starterFixture(catalog) {
  const entry = catalogEntry(catalog, 'qp16.starter-offer.v1');
  await verifyPinnedPlan16Archive(catalog);
  const closure = await verifyPlan16SourceClosure(catalog, { requireCurrent: true });
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  const validation = validateAndHydrate(envelope, 'Plan 16 starter capture parent');
  if (envelope.state.step !== 'd1_afternoon_starter' || envelope.state.activeModal !== 'starter') fail('Pinned Plan 16 starter is not at its recorded mounted offer boundary.');
  return { entry, fixture, envelope, closure, validation };
}

async function setSentinel(cdp, page, raw) {
  const encoded = JSON.stringify(raw);
  await evaluate(cdp, page.sessionId, `localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, ${encoded})`);
  return evaluate(cdp, page.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
}

async function captureCatalogEntry(id, fixtureRaw, envelope, parent, source, actions, observations) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  const bytes = Buffer.from(fixtureRaw, 'utf8');
  if (bytes.length > MAX_FIXTURE_BYTES) fail(`Captured fixture exceeds the 1 MiB cap: ${bytes.length}`);
  const relative = entry.fixture;
  const full = resolveRepoPath(relative);
  const existing = await stat(full).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  if (existing) fail(`Refusing to overwrite a prior checkpoint candidate: ${relative}`);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes, { flag: 'wx' });

  const total = await Promise.all(Object.values(catalog.checkpoints)
    .filter((item) => item.status !== 'not-captured')
    .map(async (item) => (await stat(resolveRepoPath(item.fixture))).size));
  const totalBytes = total.reduce((sum, value) => sum + value, 0) + bytes.length;
  if (totalBytes > MAX_FIXTURE_TOTAL_BYTES) fail(`Captured fixtures exceed the aggregate cap after capture (${totalBytes} bytes); preserve candidate and ask for review.`);

  const sourceFiles = source.closure.currentFiles;
  const sourceClosureSha256 = sha256(JSON.stringify(sourceFiles));
  const loaderSha256 = await currentLoaderSha256();
  const captureRecipeSha256 = sha256(await readBounded('scripts/dev/checkpoints/browser-phase.mjs', 256 * 1024));
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8', timeout: 5000 }).trim();
  const capture = {
    captureMode: 'single-mounted-ui-capture', captureRevision: revision,
    captureParent: { id: parent.id, sha256: parent.sha256 },
    captureRecipe: { file: 'scripts/dev/checkpoints/browser-phase.mjs', sha256: captureRecipeSha256 },
    loaderSha256, productionSourceRevision: source.closure.captureSourceRevision,
    productionSourceFingerprint: source.closure.expectedFingerprint,
    sourceFiles, sourceClosureSha256, servedSourceMapSha256, actions, observations,
    prehistory: 'All events before this checkpoint were synthetic or earlier mounted setup, as specified by captureParent; they are not attributed to the pilot reviewer.',
  };
  entry.status = 'capture-pending-cleanup';
  entry.bytes = bytes.length;
  entry.sha256 = sha256(bytes);
  entry.provenance = capture;
  const catalogPath = resolveRepoPath(CATALOG_PATH);
  const temporaryCatalogPath = `${catalogPath}.${process.pid}.tmp`;
  await writeFile(temporaryCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, { flag: 'wx' });
  await rename(temporaryCatalogPath, catalogPath);
  return { id, fixture: relative, bytes: bytes.length, sha256: entry.sha256, provenance: capture, totalBytes };
}

async function markCaptureLoadable(id, expectedHash) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  if (entry.status !== 'capture-pending-cleanup' || entry.sha256 !== expectedHash) fail('Captured candidate changed before cleanup was confirmed.');
  entry.status = 'current-loadable';
  const catalogPath = resolveRepoPath(CATALOG_PATH);
  const temporaryCatalogPath = `${catalogPath}.${process.pid}.tmp`;
  await writeFile(temporaryCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, { flag: 'wx' });
  await rename(temporaryCatalogPath, catalogPath);
  return { id, status: entry.status, sha256: entry.sha256 };
}

async function readPilotFixture(catalog, id) {
  const entry = catalogEntry(catalog, id);
  if (entry.status === 'not-captured') fail(`Capture phase has not created ${id}.`);
  assertCaptureParent(catalog, entry);
  await assertFixtureAggregate(catalog);
  const freshness = await validateFreshness(entry);
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  validateAndHydrate(envelope, id);
  assertCatalogBoundary(id, entry, envelope);
  return { entry, fixture, envelope, freshness };
}

async function assertFixtureAggregate(catalog) {
  let total = 0;
  for (const item of Object.values(catalog.checkpoints ?? {}).filter((value) => value.status !== 'not-captured')) {
    const info = await stat(resolveRepoPath(item.fixture));
    if (!info.isFile() || info.size > MAX_FIXTURE_BYTES) fail(`Fixture exceeds 1 MiB before reading: ${item.fixture}`);
    total += info.size;
    if (total > MAX_FIXTURE_TOTAL_BYTES) fail('Captured fixtures exceed the aggregate 2 MiB cap before reading.');
  }
}

async function capturePhase(phase) {
  const catalog = await readCatalog();
  const source = await starterFixture(catalog);
  let parent = { id: 'qp16.starter-offer.v1', sha256: source.fixture.hash };
  let startRaw = source.fixture.raw;
  let pageSelector = '#btn-decline-starter';
  let targetId = 'plan35.rent-paid-zero.v1';
  let routeAction = 'starter_declined';
  if (phase === 'capture-rent-unpaid-escalation') {
    pageSelector = '#btn-buy-starter';
    targetId = 'plan35.rent-unpaid-escalation.v1';
    routeAction = 'starter_purchase';
  } else if (phase === 'capture-finale-race-entry') {
    const rent = await readPilotFixture(catalog, 'plan35.rent-paid-zero.v1');
    parent = { id: 'plan35.rent-paid-zero.v1', sha256: rent.fixture.hash };
    startRaw = rent.fixture.raw;
    pageSelector = '#btn-pay-rent';
    targetId = 'plan35.finale-race-entry.v1';
    routeAction = 'rent_paid_then_zero_cash_continue';
  }

  const browser = await launchIsolatedChrome();
  let cleanup = null;
  let captureResult = null;
  try {
    const page = await createIsolatedPage(browser, startRaw);
    await assertAppReady(browser.cdp, page, JSON.parse(startRaw));
    await mounted(browser.cdp, page.sessionId, pageSelector, 'mounted capture parent action');
    const before = await pageSave(browser.cdp, page, 'capture before action');
    const loadToActionStartedAt = Date.now();
    let pointer = await clickPointer(browser.cdp, page.sessionId, pageSelector);
    if (phase === 'capture-finale-race-entry') {
      await mounted(browser.cdp, page.sessionId, '#btn-zero-continue', 'real solvent zero-cash modal');
      pointer = [pointer, await clickPointer(browser.cdp, page.sessionId, '#btn-zero-continue')];
      await mounted(browser.cdp, page.sessionId, '[data-race-form]', 'day-three finale race entry');
    } else {
      await mounted(browser.cdp, page.sessionId, '#btn-pay-rent', 'ordinary day-two rent page');
    }
    const after = await pageSave(browser.cdp, page, 'capture after mounted route');
    validateAndHydrate(after.envelope, targetId);
    const capturedDelta = after.envelope.eventLog.slice(before.envelope.eventLog.length);
    if (targetId.includes('rent-paid')) {
      if (after.envelope.state.step !== 'd2_afternoon_rent' || after.envelope.state.cash !== 15 || after.envelope.state.activeModal !== null) fail('Paid-rent capture did not reach the correct pre-Pay ordinary page.');
      if (after.envelope.eventLog.some((event) => event.type === 'expense_due' && event.payload?.kind === 'rent')) fail('Rent was billed before the intended pre-Pay checkpoint boundary.');
      if (capturedDelta.filter((event) => event.type === 'action' && event.payload?.kind === 'starter_declined').length !== 1) fail('Rent-paid capture must preserve one real starter decline action.');
    } else if (targetId.includes('rent-unpaid')) {
      if (after.envelope.state.step !== 'd2_afternoon_rent' || after.envelope.state.cash !== 14.01 || after.envelope.state.activeModal !== null) fail('Unpaid-rent capture did not reach the correct pre-Pay ordinary page.');
      if (after.envelope.eventLog.some((event) => event.type === 'expense_due' && event.payload?.kind === 'rent')) fail('Rent was billed before the intended pre-Pay checkpoint boundary.');
      if (capturedDelta.filter((event) => event.type === 'purchase' && event.payload?.kind === 'starter').length !== 1) fail('Rent-unpaid capture must preserve one real starter purchase.');
    } else {
      if (after.envelope.state.step !== 'd3_midday_race' || after.envelope.state.activeModal !== null) fail('Finale capture did not reach the ordinary race-entry boundary.');
      if (capturedDelta.filter((event) => event.type === 'expense_due' && event.payload?.kind === 'rent').length !== 1
          || capturedDelta.filter((event) => event.type === 'expense_paid' && event.payload?.kind === 'rent').length !== 1
          || capturedDelta.filter((event) => event.type === 'action' && event.payload?.kind === 'continue_to_wage').length !== 1) {
        fail('Finale capture must preserve the actual rent Pay and zero-cash Continue route exactly once.');
      }
      const secondRace = after.envelope.eventLog.some((event) => event.type === 'action' && event.payload?.kind === 'race_choice' && event.payload?.raceId === 'R02');
      if (secondRace) fail('Finale capture must stop before second-race submit.');
    }

    captureResult = await captureCatalogEntry(targetId, after.raw, after.envelope, parent, source,
      [{ action: routeAction, pointer }], { visibleText: (await evaluate(browser.cdp, page.sessionId, `document.querySelector('#main-content')?.innerText ?? ''`)).slice(0, 1200),
        state: { step: after.envelope.state.step, activeModal: after.envelope.state.activeModal, cash: after.envelope.state.cash },
        eventLogHead: after.envelope.eventLog.at(-1)?.chain ?? 'genesis', eventDelta: capturedDelta.map((event) => ({ type: event.type, payload: event.payload })),
        beforeHash: before.hash, afterHash: after.hash, loadToActionElapsedMs: Date.now() - loadToActionStartedAt });
  } finally { cleanup = await closeIsolatedChrome(browser); }
  if (cleanup?.residual || cleanup?.uncertainty) fail(`Chrome cleanup is not confirmed: ${JSON.stringify(cleanup)}`);
  const loadable = await markCaptureLoadable(targetId, captureResult.sha256);
  const result = { phase, capture: captureResult, loadable, cleanup };
  await appendBoundedResult(result);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

async function pilotPhase(phase) {
  const catalog = await readCatalog();
  const id = phase === 'pilot-paid-rent' ? 'plan35.rent-paid-zero.v1'
    : phase === 'pilot-unpaid-rent' ? 'plan35.rent-unpaid-escalation.v1' : 'plan35.finale-race-entry.v1';
  const brief = phase === 'pilot-finale-rest-selection' ? 'finale-rest-selection.md' : 'paid-vs-unpaid-rent.md';
  const start = await readPilotFixture(catalog, id);
  const briefBytes = await readBounded(`${PLAN35}/review-briefs/${brief}`, 32 * 1024);
  const browser = await launchIsolatedChrome();
  let cleanup = null;
  let result = null;
  try {
    const page = await createIsolatedPage(browser, start.fixture.raw);
    await assertAppReady(browser.cdp, page, start.envelope);
    await mounted(browser.cdp, page.sessionId, id.includes('rent-') ? '#btn-pay-rent' : '[data-race-form]', 'pilot start boundary');
    const before = await pageSave(browser.cdp, page, 'pilot before action');
    const loadToActionStartedAt = Date.now();

    const sentinelPage = await createPage(browser.cdp, BASE_URL);
    await assertAppReady(browser.cdp, sentinelPage);
    const sentinelRaw = await setSentinel(browser.cdp, sentinelPage, start.fixture.raw);

    let observation;
    if (id === 'plan35.rent-paid-zero.v1' || id === 'plan35.rent-unpaid-escalation.v1') {
      const pointer = await clickPointer(browser.cdp, page.sessionId, '#btn-pay-rent');
      if (id === 'plan35.rent-paid-zero.v1') {
        await mounted(browser.cdp, page.sessionId, '#btn-zero-continue', 'solvent zero-cash prompt');
      } else {
        await mounted(browser.cdp, page.sessionId, '#btn-accept-escalation', 'unpaid rent escalation choice');
      }
      const after = await pageSave(browser.cdp, page, 'pilot after Pay action');
      validateAndHydrate(after.envelope, id);
      const delta = after.envelope.eventLog.slice(before.envelope.eventLog.length);
      const due = delta.filter((event) => event.type === 'expense_due' && event.payload?.kind === 'rent');
      const paid = delta.filter((event) => event.type === 'expense_paid' && event.payload?.kind === 'rent');
      if (due.length !== 1) fail(`Pay must append exactly one genuine rent expense_due event; observed ${due.length}.`);
      if (id === 'plan35.rent-paid-zero.v1') {
        if (paid.length !== 1 || after.envelope.state.cash !== 0 || after.envelope.state.activeBill !== null
            || after.envelope.state.debt !== before.envelope.state.debt || !after.envelope.state.billsSettled.includes('d2_rent')) fail('Paid-rent outcome does not match settled solvent zero-cash boundary.');
        if (delta.filter((event) => event.type === 'expense_paid' && event.payload?.kind === 'rent').length !== 1) fail('Paid rent event must appear exactly once.');
      } else {
        if (paid.length !== 0 || after.envelope.state.cash !== 14.01
            || after.envelope.state.activeBill?.kind !== 'rent' || after.envelope.state.activeBill?.amount !== 15
            || after.envelope.state.phase !== 'escalation') fail('Unpaid-rent result does not preserve the actual active bill and escalation state.');
      }
      observation = { action: 'pointer Pay once', pointer, beforeHash: before.hash, afterHash: after.hash,
        loadToActionElapsedMs: Date.now() - loadToActionStartedAt,
        eventLogDelta: delta, stateAfter: after.envelope.state, visibleText: (await evaluate(browser.cdp, page.sessionId, `document.querySelector('#modal-container')?.innerText ?? ''`)).slice(0, 1200) };
    } else {
      const selected = await evaluate(browser.cdp, page.sessionId, `(() => {
        const cards=[...document.querySelectorAll('.race-candidate-card')];
        const target=cards.find(card=>!card.querySelector('input[name="duckId"]')?.checked);
        return target ? {id:target.dataset.candidateId, text:target.innerText} : null;
      })()`);
      if (!selected) fail('No unselected owned racer card is available for the one-action selection pilot.');
      const selector = `.race-candidate-card[data-candidate-id="${selected.id}"]`;
      const pointer = await clickPointer(browser.cdp, page.sessionId, selector);
      const displayed = await evaluate(browser.cdp, page.sessionId, `(() => { const c=document.querySelector(${JSON.stringify(selector)}); return c ? {checked:Boolean(c.querySelector('input[name="duckId"]')?.checked), selected:c.classList.contains('selected'), text:c.innerText} : null; })()`);
      const after = await pageSave(browser.cdp, page, 'finale selection pilot after action');
      validateAndHydrate(after.envelope, id);
      const raceChoice = after.envelope.eventLog.slice(before.envelope.eventLog.length)
        .filter((event) => event.type === 'action' && event.payload?.kind === 'race_choice' && event.payload?.raceId === 'R02');
      if (!displayed?.checked || !displayed.selected || raceChoice.length) fail('Finale selection was not displayed honestly or unexpectedly committed a race choice.');
      if (JSON.stringify(before.envelope.state) !== JSON.stringify(after.envelope.state)
          || JSON.stringify(before.envelope.prngStreams) !== JSON.stringify(after.envelope.prngStreams)) fail('Pre-submit race selection changed engine state or RNG.');
      observation = { action: 'select one unselected owned racer card; do not submit', pointer, selected, displayed,
        beforeHash: before.hash, afterHash: after.hash, loadToActionElapsedMs: Date.now() - loadToActionStartedAt,
        eventLogDelta: after.envelope.eventLog.slice(before.envelope.eventLog.length), engineStateUnchanged: true, rngUnchanged: true };
    }

    const sentinelAfter = await evaluate(browser.cdp, sentinelPage.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
    if (sentinelAfter !== sentinelRaw) fail('Independent isolated ordinary-save sentinel changed during checkpoint review.');
    result = { phase, checkpointId: id, fixtureSha256: start.fixture.hash, sourceClosureSha256: start.entry.provenance.sourceClosureSha256,
      servedSourceMapSha256,
      loaderSha256: start.freshness.loaderSha256, briefSha256: sha256(briefBytes), viewport: { width: 1365, height: 900 }, observation,
      sentinelPreserved: true };
  } finally { cleanup = await closeIsolatedChrome(browser); }
  if (cleanup?.residual || cleanup?.uncertainty) fail(`Chrome cleanup is not confirmed: ${JSON.stringify(cleanup)}`);
  result.cleanup = cleanup;
  await appendBoundedResult(result);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

async function appendBoundedResult(record) {
  const info = await stat(RESULT_PATH).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  const line = `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`;
  if (info && info.size + Buffer.byteLength(line) > 1024 * 1024) fail('Plan 35 pilot results would exceed 1 MiB.');
  if (info) {
    const prior = await readFile(RESULT_PATH, 'utf8');
    for (const row of prior.split(/\r?\n/).filter(Boolean)) JSON.parse(row);
  }
  await appendFile(RESULT_PATH, line, 'utf8');
}

async function main() {
  const phase = process.argv[2];
  if (!BASE_URL) fail('QP35_BASE_URL must be supplied by the controlled launcher.');
  const url = new URL(BASE_URL);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password || !url.pathname.endsWith('/')) fail('Only the approved loopback Vite base URL is permitted.');
  const expected = JSON.parse(process.env.QP35_EXPECTED_SERVED ?? 'null');
  if (!expected || typeof expected !== 'object' || Array.isArray(expected) || Object.keys(expected).length !== 31) fail('Controlled launcher did not provide the finite 31-entry served-source identity map.');
  for (const [file, record] of Object.entries(expected)) {
    const route = new URL(file, BASE_URL);
    if (route.origin !== url.origin || !route.pathname.startsWith(url.pathname)) fail(`Served-source identity escaped the approved loopback base: ${file}`);
    const response = await fetch(route, { redirect: 'manual', signal: AbortSignal.timeout(3500) });
    if (response.status !== 200 || response.url !== route.href) { await response.body?.cancel(); fail(`Served-source identity response failed for ${file}: HTTP ${response.status}`); }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 3 * 1024 * 1024 || bytes.length !== record.bytes || sha256(bytes) !== record.sha256) fail(`Served-source identity changed between launcher and proof: ${file}`);
  }
  servedSourceMapSha256 = sha256(JSON.stringify(expected));
  if (phase?.startsWith('capture-')) return capturePhase(phase);
  if (phase?.startsWith('pilot-')) return pilotPhase(phase);
  fail('Choose one capture or pilot phase.');
}

main().catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
