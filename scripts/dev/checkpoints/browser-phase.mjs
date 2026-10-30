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

function validateExposureSuffix(suffix, display, id, expected) {
  const knownDuckIds = new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']);
  const lastUnknownResult = expected.eventLog.filter((event) => event.type === 'race_result')
    .filter((event) => !knownDuckIds.has(event.payload?.duckId)).at(-1);
  let sawRaceExposure = false;
  for (const event of suffix) {
    const payload = event.payload ?? {};
    if (id !== 'plan35.finale-race-entry.v1' || !['race_rest_policy_activated', 'race_choice_offered', 'race_trial_offer_shown'].includes(event.type)
        || display.raceNumber !== 2 || (event.type !== 'race_rest_policy_activated' && payload.raceNumber !== 2)) fail(`Unexpected event-log suffix during ${id} restore: ${event.type}.`);
    if (event.type === 'race_rest_policy_activated') {
      const expectedBaseline = lastUnknownResult?.seq ?? -1;
      if (sawRaceExposure || payload.policyVersion !== 'quackpot.race-rest/1'
          || payload.historyBaselineSeq !== expectedBaseline || Boolean(payload.historyLimited) !== Boolean(lastUnknownResult)
          || JSON.stringify(payload.rule) !== JSON.stringify({ interveningCompletedRaces: [0, 1, '2+'], restFactors: [0.5, 0.75, 1] })) {
        fail('Finale rest-policy activation suffix does not match the real mounted race exposure path.');
      }
    } else if (event.type === 'race_choice_offered') {
      sawRaceExposure = true;
      const visibleIds = new Set(display.candidates.map((candidate) => candidate.id));
      if (!Array.isArray(payload.candidates) || !payload.candidates.length
          || payload.candidates.some((candidate) => !candidate.rendered || !visibleIds.has(candidate.duckId))) {
        fail('Finale race-choice exposure suffix does not match mounted owned cards.');
      }
      const offeredIds = new Set(payload.candidates.map((candidate) => candidate.duckId));
      if (payload.candidates.length !== visibleIds.size || offeredIds.size !== visibleIds.size
          || [...visibleIds].some((duckId) => !offeredIds.has(duckId))) fail('Finale exposure omitted, duplicated, or added a mounted fully visible owned card.');
      if (payload.trialState?.available !== Boolean(display.state?.raceTrialAvailable)
          || payload.trialAvailable !== Boolean(display.state?.raceTrialAvailable)
          || payload.trialState?.selected !== Boolean(display.trialSelected && display.state?.raceTrialAvailable)
          || !Number.isFinite(payload.trialState?.multiplier)
          || !Number.isFinite(payload.fieldBaseSpeed)) fail('Finale race exposure controls do not match mounted selection/trial state.');
      for (const candidate of payload.candidates) {
        const mounted = display.candidates.find((item) => item.id === candidate.duckId);
        const match = mounted?.effective.match(/Race rating\s+([0-9.]+)/);
        const displayedRating = match ? Number(match[1]) : NaN;
        if (!Number.isFinite(displayedRating) || Math.abs(displayedRating - candidate.effectiveBaseInput) > 1e-12
            || !Number.isFinite(candidate.authoredRating) || !Number.isFinite(candidate.restFactor)
            || !Number.isFinite(candidate.effectiveWithTrialInput)
            || Math.abs(candidate.effectiveBaseInput - candidate.authoredRating * candidate.restFactor) > 1e-12
            || Math.abs(candidate.effectiveWithTrialInput - candidate.effectiveBaseInput * (payload.trialState.selected ? payload.trialState.multiplier : 1)) > 1e-12
            || (candidate.restFactor < 1 && !mounted.reason.startsWith(`Needs rest · ${Math.round((1 - candidate.restFactor) * 100)}% lower`))
            || (candidate.restFactor === 1 && !mounted.reason.startsWith('Rested.'))) fail(`Finale exposure values do not match mounted card ${candidate.duckId}.`);
      }
      const checked = display.candidates.find((candidate) => candidate.checked)?.id ?? null;
      const expectedSelected = checked ?? payload.candidates[0]?.duckId ?? null;
      if (payload.selectedDuckId !== expectedSelected) fail('Finale race exposure selected identity differs from the mounted checked card or first offered card.');
      if (payload.foregroundedDuckId !== payload.candidates[0]?.duckId) fail('Finale race exposure foreground identity differs from the first offered card.');
    } else if (!display.trialText || payload.costDown !== 3 || payload.availableDown !== display.state?.down
        || payload.alreadyPurchased !== Boolean(display.state?.raceTrialAvailable)) {
      fail('Finale trial exposure suffix does not match the mounted offer and restored save.');
    }
  }
  return true;
}

async function pageSave(cdp, page, label) {
  const raw = await evaluate(cdp, page.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
  if (!raw) fail(`${label}: ordinary application save key was empty.`);
  const envelope = JSON.parse(raw);
  return { raw, envelope, hash: sha256(raw) };
}

async function assertRestoredPrefix(cdp, page, expected, id) {
  const observed = await pageSave(cdp, page, `restored ${id}`);
  if (JSON.stringify(observed.envelope.state) !== JSON.stringify(expected.state)
      || JSON.stringify(observed.envelope.prngStreams) !== JSON.stringify(expected.prngStreams)) {
    fail(`${id} changed state or RNG during ordinary application restore.`);
  }
  if (observed.envelope.eventLog.length < expected.eventLog.length
      || JSON.stringify(observed.envelope.eventLog.slice(0, expected.eventLog.length)) !== JSON.stringify(expected.eventLog)) {
    fail(`${id} changed or truncated its exact expected event-log prefix during restore.`);
  }
  const suffix = observed.envelope.eventLog.slice(expected.eventLog.length);
  if (id !== 'plan35.finale-race-entry.v1' && suffix.length) fail(`${id} appended events during restore.`);
  const display = await evaluate(cdp, page.sessionId, `(() => ({
    raceNumber: document.querySelector('#main-content')?.innerText.includes('Championship Race') ? 2 : null,
    candidates: [...document.querySelectorAll('.race-candidate-card')].filter(c => {
      if(document.visibilityState==='hidden') return false;
      for(let a=c;a instanceof Element;a=a.parentElement){const s=getComputedStyle(a);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}
      const r=c.getBoundingClientRect(),h=document.querySelector('#hud-container'),hr=h?.getBoundingClientRect(),hs=h?getComputedStyle(h):null;
      const covered=hr&&hs?.position==='sticky'&&hr.top<=0&&hr.bottom>0&&r.top<hr.bottom&&r.right>hr.left&&r.left<hr.right;
      return !covered&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;
    }).map(c => ({id:c.dataset.candidateId,checked:Boolean(c.querySelector('input[name="duckId"]')?.checked),
      name:c.querySelector('.race-candidate-name')?.innerText??'', effective:c.querySelector('.race-candidate-effective')?.innerText??'',
      reason:c.querySelector('.race-candidate-reason')?.innerText??''})),
    trialText: document.querySelector('[data-race-trial]')?.innerText ?? '',
    trialSelected: Boolean(document.querySelector('[data-race-trial] input[name="useTrial"]:checked')),
    state: JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))?.state ?? null
  }))()`);
  validateExposureSuffix(suffix, display, id, expected);
  return { ...observed, restoreComparison: { exactState: true, exactPrngStreams: true,
    exactEventLogPrefix: true, allowedExposureSuffix: suffix } };
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
  await verifyPinnedPlan16Archive(catalog);
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
    const before = await assertRestoredPrefix(browser.cdp, page, JSON.parse(startRaw), parent.id);
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
        parentFixtureSha256: sha256(startRaw), restoredSaveSha256: before.hash, restoreComparison: before.restoreComparison,
        afterHash: after.hash, loadToActionElapsedMs: Date.now() - loadToActionStartedAt });
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
    const restored = await assertRestoredPrefix(browser.cdp, page, start.envelope, id);
    const before = restored;
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
        const roster=cards.map(card=>({id:card.dataset.candidateId,name:card.querySelector('.race-candidate-name')?.innerText??'',
          effective:card.querySelector('.race-candidate-effective')?.innerText??'',reason:card.querySelector('.race-candidate-reason')?.innerText??'',
          checked:Boolean(card.querySelector('input[name="duckId"]')?.checked),text:card.innerText}));
        const tired=roster.find(card=>card.reason.startsWith('Needs rest'));
        const never=roster.find(card=>card.reason==='Rested. No prior finished race.');
        const target=roster.find(card=>!card.checked&&(card.reason.startsWith('Needs rest')||card.reason==='Rested. No prior finished race.'));
        return {raceNumber:document.querySelector('#main-content')?.innerText.includes('Championship Race')?2:null,roster,tired,never,target};
      })()`);
      if (!selected?.target || selected.raceNumber !== 2 || !selected.tired || !selected.never) fail('Finale pilot lacks mounted race two or the natural tired-vs-never-raced roster contrast.');
      const selector = `.race-candidate-card[data-candidate-id="${selected.target.id}"]`;
      const pointer = await clickPointer(browser.cdp, page.sessionId, selector);
      const displayed = await evaluate(browser.cdp, page.sessionId, `(() => { const c=document.querySelector(${JSON.stringify(selector)}); return c ? {checked:Boolean(c.querySelector('input[name="duckId"]')?.checked), selected:c.classList.contains('selected'), text:c.innerText} : null; })()`);
      const after = await pageSave(browser.cdp, page, 'finale selection pilot after action');
      validateAndHydrate(after.envelope, id);
      const selectionDelta = after.envelope.eventLog.slice(before.envelope.eventLog.length);
      const raceChoice = selectionDelta.filter((event) => event.type === 'action' && event.payload?.kind === 'race_choice' && event.payload?.raceId === 'R02');
      const mountedAfterSelection = await evaluate(browser.cdp, page.sessionId, `(() => ({
        raceNumber: document.querySelector('#main-content')?.innerText.includes('Championship Race') ? 2 : null,
        candidates: [...document.querySelectorAll('.race-candidate-card')].filter(c => {
          if(document.visibilityState==='hidden') return false;
          for(let a=c;a instanceof Element;a=a.parentElement){const s=getComputedStyle(a);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}
          const r=c.getBoundingClientRect(),h=document.querySelector('#hud-container'),hr=h?.getBoundingClientRect(),hs=h?getComputedStyle(h):null;
          const covered=hr&&hs?.position==='sticky'&&hr.top<=0&&hr.bottom>0&&r.top<hr.bottom&&r.right>hr.left&&r.left<hr.right;
          return !covered&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;
        }).map(c=>({id:c.dataset.candidateId,checked:Boolean(c.querySelector('input[name="duckId"]')?.checked),
          effective:c.querySelector('.race-candidate-effective')?.innerText??'',reason:c.querySelector('.race-candidate-reason')?.innerText??''})),
        trialText: document.querySelector('[data-race-trial]')?.innerText??'',
        trialSelected: Boolean(document.querySelector('[data-race-trial] input[name="useTrial"]:checked')),
        state: JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))?.state??null
      }))()`);
      validateExposureSuffix(selectionDelta, mountedAfterSelection, id, before.envelope);
      if (!displayed?.checked || !displayed.selected || raceChoice.length) fail('Finale selection was not displayed honestly or unexpectedly committed a race choice.');
      if (JSON.stringify(before.envelope.state) !== JSON.stringify(after.envelope.state)
          || JSON.stringify(before.envelope.prngStreams) !== JSON.stringify(after.envelope.prngStreams)) fail('Pre-submit race selection changed engine state or RNG.');
      observation = { action: 'select one naturally tired or never-raced owned racer card; do not submit', pointer, raceNumber: selected.raceNumber,
        actualRoster: selected.roster, restContrast: { tired: selected.tired, neverRaced: selected.never }, selected: selected.target, displayed,
        selectionExposureDeltaValidated: true,
        beforeHash: before.hash, afterHash: after.hash, loadToActionElapsedMs: Date.now() - loadToActionStartedAt,
        eventLogDelta: after.envelope.eventLog.slice(before.envelope.eventLog.length), engineStateUnchanged: true, rngUnchanged: true };
    }

    const sentinelAfter = await evaluate(browser.cdp, sentinelPage.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
    if (sentinelAfter !== sentinelRaw) fail('Independent isolated ordinary-save sentinel changed during checkpoint review.');
    result = { phase, checkpointId: id, fixtureSha256: start.fixture.hash, restoredSaveSha256: before.hash,
      restoreComparison: before.restoreComparison, sourceClosureSha256: start.entry.provenance.sourceClosureSha256,
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
  if (Object.values(expected).some((record) => !Number.isSafeInteger(record?.bytes) || record.bytes < 0 || record.bytes > 3 * 1024 * 1024)
      || Object.values(expected).reduce((sum, record) => sum + record.bytes, 0) > 24 * 1024 * 1024) fail('Served-source identity map exceeds its per-entry or aggregate byte cap.');
  for (const [file, record] of Object.entries(expected)) {
    const route = new URL(file, BASE_URL);
    if (route.origin !== url.origin || !route.pathname.startsWith(url.pathname)) fail(`Served-source identity escaped the approved loopback base: ${file}`);
    const response = await fetch(route, { redirect: 'manual', signal: AbortSignal.timeout(3500) });
    if (response.status !== 200 || response.url !== route.href) { await response.body?.cancel(); fail(`Served-source identity response failed for ${file}: HTTP ${response.status}`); }
    const reader = response.body?.getReader();
    if (!reader) fail(`Served-source identity has no bounded body stream: ${file}`);
    const chunks = [];
    let size = 0;
    const bodyDeadline = Date.now() + 3500;
    while (true) {
      const remainingMs = bodyDeadline - Date.now();
      if (remainingMs <= 0) { await reader.cancel(); fail(`Served-source identity body deadline exceeded: ${file}`); }
      let readTimer;
      let chunk;
      try {
        chunk = await Promise.race([reader.read(), new Promise((_, reject) => {
          readTimer = setTimeout(() => reject(new Error(`Served-source identity body deadline exceeded: ${file}`)), remainingMs);
        })]);
      } catch (error) { await reader.cancel(); throw error; }
      finally { clearTimeout(readTimer); }
      const { done, value } = chunk;
      if (done) break;
      size += value.byteLength;
      if (size > 3 * 1024 * 1024 || size > record.bytes || size > 24 * 1024 * 1024) {
        await reader.cancel();
        fail(`Served-source identity exceeded its entry or aggregate cap: ${file}`);
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks, size);
    if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256) fail(`Served-source identity changed between launcher and proof: ${file}`);
  }
  servedSourceMapSha256 = sha256(JSON.stringify(expected));
  if (phase?.startsWith('capture-')) return capturePhase(phase);
  if (phase?.startsWith('pilot-')) return pilotPhase(phase);
  fail('Choose one capture or pilot phase.');
}

main().catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
