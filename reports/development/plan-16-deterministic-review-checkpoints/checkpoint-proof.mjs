// Plan 16 bounded checkpoint proof. Run only through bounded-node-run.ps1.
// Browser phases use fresh Chromium BrowserContexts and the normal app restore path.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { appendFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { GameEngine } from '../../../src/core/game-engine.mjs';
import { validateSave, STORAGE_KEY } from '../../../src/core/storage.mjs';

const ROOT = process.cwd();
const OUT = path.resolve('reports/development/plan-16-deterministic-review-checkpoints');
const CHROME = process.env.QP16_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SERVED_FILES = [
  'src/main.js', 'src/style.css',
  'src/core/game-engine.mjs', 'src/core/storage.mjs', 'src/core/prng.mjs',
  'src/core/event-log.mjs', 'src/core/receipt.mjs', 'src/core/race-resolver.mjs', 'src/core/race-rest.mjs',
  'src/ui/shell.css', 'src/ui/stage-transition.css', 'src/ui/duck-dex.css', 'src/ui/apartment-view.css',
  'src/assets/duck-placeholder.svg', 'src/ui/stage-transition.js', 'src/ui/hud.js', 'src/ui/desk-view.js',
  'src/ui/gacha-view.js', 'src/ui/acquisition-queue.mjs', 'src/ui/duck-dex-view.mjs',
  'src/ui/duck-rig-view.mjs', 'src/ui/duck-motion-controller.mjs', 'src/ui/duck-motion.css',
  'src/ui/race-view.js', 'src/ui/race-view.css', 'src/ui/race-entry.css',
  'src/ui/race-playback-controller.mjs', 'src/ui/race-motion-controller.mjs', 'src/ui/modals.js',
  'src/ui/receipt-view.js', 'src/ui/settings-modal.js',
];
const SOURCE_ROOT_FILES = ['index.html', 'vite.config.mjs', 'package.json', 'package-lock.json'];
const MANIFEST_PATH = path.join(OUT, 'checkpoint-manifest.json');
const RESULT_PATH = path.join(OUT, 'proof-results.jsonl');
const STARTER_CAPTURE_ARCHIVE = path.join(OUT, 'history/2026-10-29-first-starter-capture');
const STARTER_CAPTURE_RECIPE_SHA256 = 'cb318662122d8e18289c3d30d668971e949809aca8678cf77d4e5ae996ab4185';
const STARTER_CAPTURE_FIXTURE_SHA256 = 'e6a4de779d350fb249b3a95071d81b42008495bc52cba40d487b2cd95b2508d9';
const STARTER_CAPTURE_SOURCE_REVISION = 'cdf757a2ce3f98f64f9159521ad20854cf8e917e';
const STARTER_CAPTURE_SOURCE_FINGERPRINT = '2c4244c466ae8c323b8f96a1c0db69989e171438b3710069fce8be976661715d';
const PHASES = new Set(['create-pending', 'pending-restore', 'branch-accept', 'branch-decline']);
const argv = process.argv.slice(2);
const arg = (name) => {
  const index = argv.indexOf(name);
  return index < 0 ? null : argv[index + 1] ?? null;
};
const phase = arg('--phase');
const baseURL = arg('--base-url');
const stopAt = Date.now() + 82000;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const fail = (message) => { throw new Error(message); };
const ownedBrowsers = new Set();
const cleanupNotes = [];
let failureScreenshotTaken = false;

function canonical(value, topLevel = true) {
  if (Array.isArray(value)) return value.map((item) => canonical(item, false));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().filter((key) => !(topLevel && key === 'savedAt'))
      .map((key) => [key, canonical(value[key], false)]));
  }
  return value;
}

function semanticJson(value, excludeTopLevelSavedAt = true) { return JSON.stringify(canonical(value, excludeTopLevelSavedAt)); }

function assertValid(envelope, label) {
  const result = validateSave(envelope);
  if (!result.valid) fail(`${label} failed validateSave: ${result.errors.join('; ')}`);
  return result;
}

function assertFreshManifest(manifest, checkpointId, source) {
  const entry = manifest.checkpoints?.[checkpointId];
  if (!manifestEntryFresh(entry, source)) {
    fail(`${checkpointId} is stale for the current relevant source/recipe fingerprint; regenerate after review.`);
  }
}

function manifestEntryFresh(entry, source) {
  return Boolean(entry && entry.sourceFingerprint === source.fingerprint
    && entry.recipeFingerprint === source.recipeFingerprint
    && JSON.stringify(entry.sourceFiles) === JSON.stringify(source.files));
}

function capturedStarterLoaderIdentityFresh(entry, source) {
  return Boolean(entry?.checkpointMode === 'captured-replayable'
    && entry.recipeFingerprint === STARTER_CAPTURE_RECIPE_SHA256
    && entry.fixtureSha256 === STARTER_CAPTURE_FIXTURE_SHA256
    && entry.sourceRevision === STARTER_CAPTURE_SOURCE_REVISION
    && entry.sourceFingerprint === STARTER_CAPTURE_SOURCE_FINGERPRINT
    && entry.captureProvenance?.mode === 'single-mounted-capture'
    && entry.captureProvenance.recipeFingerprint === STARTER_CAPTURE_RECIPE_SHA256
    && entry.captureProvenance.sourceRevision === STARTER_CAPTURE_SOURCE_REVISION
    && entry.captureProvenance.sourceFingerprint === STARTER_CAPTURE_SOURCE_FINGERPRINT
    && entry.captureProvenance.fixtureSha256 === STARTER_CAPTURE_FIXTURE_SHA256
    && entry.loaderValidation?.mode === 'captured-fixture-loader'
    && entry.loaderValidation.recipeFile === 'reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs'
    && entry.loaderValidation.recipeFingerprint === source.recipeFingerprint
    && entry.loaderValidation.productionSourceClosure === 'checkpoint.sourceFiles'
    && JSON.stringify(entry.sourceFiles) === JSON.stringify(source.files)
  );
}

function assertCapturedStarterLoaderNegativeControls(entry, source) {
  const staleLoader = structuredClone(entry);
  staleLoader.loaderValidation.recipeFingerprint = 'stale-loader-recipe';
  if (capturedStarterLoaderIdentityFresh(staleLoader, source)) fail('Stale captured-fixture loader recipe negative control was accepted.');
  const staleSource = structuredClone(entry);
  staleSource.sourceFiles['src/core/game-engine.mjs'] = 'stale-production-source';
  if (capturedStarterLoaderIdentityFresh(staleSource, source)) fail('Stale captured-fixture production-source negative control was accepted.');
  return { staleLoaderRecipeRejected: true, staleProductionSourceRejected: true };
}

async function assertCapturedStarterFresh(manifest, source, fixtureRaw) {
  const checkpointId = 'qp16.starter-offer.v1';
  const entry = manifest.checkpoints?.[checkpointId];
  if (!capturedStarterLoaderIdentityFresh(entry, source)) fail('Captured starter is stale for current production source or loader identity.');
  if (sha256(fixtureRaw) !== STARTER_CAPTURE_FIXTURE_SHA256) fail('Captured starter active fixture bytes differ from the owner-approved capture hash.');

  const archiveIndex = await readJson(path.join(STARTER_CAPTURE_ARCHIVE, 'archive-index.json'));
  if (archiveIndex.checkpointId !== checkpointId
      || archiveIndex.captureRecipeFingerprint !== STARTER_CAPTURE_RECIPE_SHA256
      || archiveIndex.captureSourceRevision !== STARTER_CAPTURE_SOURCE_REVISION
      || archiveIndex.captureSourceFingerprint !== STARTER_CAPTURE_SOURCE_FINGERPRINT
      || archiveIndex.fixtureSha256 !== STARTER_CAPTURE_FIXTURE_SHA256) {
    fail('Captured starter archive provenance does not match its pinned original capture identity.');
  }
  const expectedFiles = [
    'starter-offer.save.json', 'checkpoint-proof.capture.mjs', 'checkpoint-manifest.capture.json',
    'proof-results.capture.jsonl', 'controlled-vite-phase-results.capture.jsonl',
  ].sort();
  const archiveFiles = archiveIndex.files;
  if (!Array.isArray(archiveFiles) || JSON.stringify(archiveFiles.map((item) => item.file).sort()) !== JSON.stringify(expectedFiles)) {
    fail('Captured starter archive file set differs from the approved provenance set.');
  }
  let archiveBytes = 0;
  const archiveContents = {};
  for (const record of archiveFiles) {
    if (!Number.isSafeInteger(record.bytes) || record.bytes < 0 || record.bytes > 1024 * 1024 || !/^[a-f0-9]{64}$/.test(record.sha256 ?? '')) {
      fail(`Captured starter archive index has an invalid size/hash entry for ${record.file}.`);
    }
    archiveBytes += record.bytes;
    if (archiveBytes > 2 * 1024 * 1024) fail('Captured starter provenance archive exceeds its 2 MiB verification bound.');
    const bytes = await readFile(path.join(STARTER_CAPTURE_ARCHIVE, record.file));
    if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256) fail(`Captured starter archive hash/size mismatch for ${record.file}.`);
    archiveContents[record.file] = bytes;
  }
  if (sha256(archiveContents['checkpoint-proof.capture.mjs']) !== STARTER_CAPTURE_RECIPE_SHA256
      || sha256(archiveContents['starter-offer.save.json']) !== STARTER_CAPTURE_FIXTURE_SHA256) {
    fail('Archived starter recipe or fixture fails its pinned original SHA-256.');
  }
  const originalManifest = JSON.parse(archiveContents['checkpoint-manifest.capture.json'].toString('utf8'));
  const originalEntry = originalManifest.checkpoints?.[checkpointId];
  if (!originalEntry || originalEntry.recipeFingerprint !== STARTER_CAPTURE_RECIPE_SHA256
      || originalEntry.fixtureSha256 !== STARTER_CAPTURE_FIXTURE_SHA256
      || originalEntry.sourceRevision !== STARTER_CAPTURE_SOURCE_REVISION
      || originalEntry.sourceFingerprint !== STARTER_CAPTURE_SOURCE_FINGERPRINT
      || JSON.stringify(originalEntry.sourceFiles) !== JSON.stringify(entry.sourceFiles)) {
    fail('Archived original starter manifest does not match the pinned capture provenance.');
  }
  if (sha256(JSON.stringify({ files: originalEntry.sourceFiles, recipeFingerprint: originalEntry.recipeFingerprint })) !== STARTER_CAPTURE_SOURCE_FINGERPRINT) {
    fail('Archived starter source fingerprint does not match its original source-file map and recipe hash.');
  }
  const archivedProofResults = archiveContents['proof-results.capture.jsonl'].toString('utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const capturedRecord = archivedProofResults.filter((record) => record.phase === 'starter-capture'
    && record.fixtureHash === STARTER_CAPTURE_FIXTURE_SHA256 && record.valid === true);
  if (capturedRecord.length !== 1) fail('Archive does not contain exactly one successful first starter-capture proof record.');
  const archivedHelperResults = archiveContents['controlled-vite-phase-results.capture.jsonl'].toString('utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const successfulCapture = archivedHelperResults.filter((record) => record.phase === 'starter-capture'
    && record.proof?.exit?.code === 0 && record.cleanup?.residual === false && record.cleanup?.uncertainty === false);
  if (successfulCapture.length !== 1) fail('Archive does not contain exactly one clean controlled helper record for the first starter capture.');

  const provenanceControls = assertCapturedStarterLoaderNegativeControls(entry, source);
  return {
    checkpointClass: entry.checkpointMode,
    fixtureSha256: STARTER_CAPTURE_FIXTURE_SHA256,
    captureSourceRevision: STARTER_CAPTURE_SOURCE_REVISION,
    captureSourceFingerprint: STARTER_CAPTURE_SOURCE_FINGERPRINT,
    captureRecipeFingerprint: STARTER_CAPTURE_RECIPE_SHA256,
    loaderRecipeFingerprint: source.recipeFingerprint,
    loaderProductionFilesMatched: true,
    archiveFilesVerified: archiveFiles.length,
    archiveBytesVerified: archiveBytes,
    provenanceControls,
  };
}

async function atomicJson(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temp, file);
}

async function atomicText(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, value, 'utf8');
  await rename(temp, file);
}

async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }

async function appendResult(record) {
  try {
    const prior = await readFile(RESULT_PATH, 'utf8');
    if (Buffer.byteLength(prior) > 1024 * 1024) fail('Append-only proof result log exceeds 1 MiB.');
    for (const line of prior.split(/\r?\n/).filter(Boolean)) JSON.parse(line);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await appendFile(RESULT_PATH, `${JSON.stringify(record)}\n`, 'utf8');
}

function assertNegativeControls(envelope, source) {
  const badSchema = structuredClone(envelope); badSchema.schemaVersion = 999;
  if (validateSave(badSchema).valid) fail('Malformed schema negative control was accepted.');
  const badStream = structuredClone(envelope); badStream.prngStreams.draw = 'not-json';
  if (validateSave(badStream).valid) fail('Malformed RNG snapshot negative control was accepted.');
  const badChain = structuredClone(envelope);
  badChain.eventLog[0].payload.seed = 'tampered';
  if (validateSave(badChain).valid) fail('Tampered event-chain negative control was accepted.');
  const badState = structuredClone(envelope); badState.state.step = 'receipt';
  if (validateSave(badState).valid) fail('Incoherent state/log negative control was accepted.');
  const staleEntry = { sourceFingerprint: 'stale', sourceFiles: source.files, recipeFingerprint: source.recipeFingerprint };
  if (manifestEntryFresh(staleEntry, source)) fail('Stale-fingerprint negative control was accepted.');
  return { malformedSchemaRejected: true, malformedRngSnapshotRejected: true, tamperedEventChainRejected: true, incoherentStateLogRejected: true, staleFingerprintDetected: true };
}

async function currentSource() {
  const recipePath = 'reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs';
  const tracked = execFileSync('git', ['ls-files', '--', 'src', ...SOURCE_ROOT_FILES, recipePath], { encoding: 'utf8', timeout: 5000 })
    .trim().split(/\r?\n/).filter(Boolean).sort();
  const actual = [...new Set([...SERVED_FILES, ...SOURCE_ROOT_FILES, ...tracked.filter((file) => file.startsWith('src/')), recipePath])].sort();
  if (tracked.length === 0 || actual.some((file) => !tracked.includes(file))) fail('The local source closure, root configuration, and proof recipe must all be tracked before fixture generation.');
  execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...actual], { stdio: 'ignore', timeout: 5000 });
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 5000 }).trim();
  const files = {};
  for (const file of actual.filter((file) => file !== recipePath)) files[file] = sha256(await readFile(path.join(ROOT, file)));
  const recipeFingerprint = sha256(await readFile(path.join(ROOT, recipePath)));
  return { revision, files, recipeFingerprint, fingerprint: sha256(JSON.stringify({ files, recipeFingerprint })), servedEntries: [...SERVED_FILES] };
}

async function servedSource(url) {
  const expectedText = process.env.QP16_EXPECTED_SERVED_MODULES;
  if (!expectedText) fail('QP16_EXPECTED_SERVED_MODULES must contain root-reviewed module response hashes.');
  const expected = JSON.parse(expectedText);
  const served = {};
  for (const file of SERVED_FILES) {
    const route = file.replaceAll('\\', '/');
    const response = await fetch(new URL(route, url), { signal: AbortSignal.timeout(Math.max(1, Math.min(5000, stopAt - Date.now()))), redirect: 'manual' });
    if (!response.ok) fail(`Source identity fetch failed for ${route}: HTTP ${response.status}`);
    const reader = response.body?.getReader();
    if (!reader) fail(`Source identity response has no body for ${route}.`);
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 3 * 1024 * 1024) { await reader.cancel(); fail(`Served source exceeds the 3 MiB identity-read limit: ${route}`); }
      chunks.push(value);
    }
    served[route] = sha256(Buffer.concat(chunks, size));
    if (!/^[a-f0-9]{64}$/.test(expected[route] ?? '') || expected[route] !== served[route]) fail(`Served source hash mismatch for ${route}; do not proceed with this server.`);
  }
  if (Object.keys(expected).length !== SERVED_FILES.length || SERVED_FILES.some((file) => !(file in expected))) fail('Expected served-module hash set does not cover the exact served-entry list.');
  return served;
}

function initialManifest(source) {
  return {
    manifestVersion: 1,
    generator: { id: 'qp16-checkpoint-proof', version: 1 },
    checkpoints: {},
    provenanceNotice: 'Synthetic scripted prehistory only. No event before the load boundary represents learner or reviewer observation.',
  };
}

async function createPending() {
  const source = await currentSource();
  const engine = new GameEngine('qp16-pending-seed-v1');
  engine.start();
  engine.setupCompanion('Professor Quacks', 'classic-yellow');
  engine.commitPromotionalTenPull();
  const envelope = engine.toEnvelope();
  assertValid(envelope, 'pending-reveal envelope');
  const restored = GameEngine.fromEnvelope(envelope).toEnvelope();
  if (semanticJson(envelope) !== semanticJson(restored)) fail('Pending-reveal hydrate/serialize semantic comparison differed.');
  const entries = envelope.eventLog;
  const draws = entries.filter((entry) => entry.type === 'draw_committed');
  if (draws.length !== 10 || entries.some((entry) => entry.type === 'reveal_shown')) fail('Pending-reveal event boundary is not ten commits before any reveal.');
  if (envelope.state.step !== 'd1_morning_gacha' || envelope.state.activeModal !== null
      || envelope.state.pendingReveals.length !== 10 || envelope.state.pendingReveals.some((item) => item.revealed)) {
    fail('Pending-reveal engine state does not match its declared UI boundary.');
  }
  const negativeControls = assertNegativeControls(envelope, source);
  const fixturePath = path.join(OUT, 'pending-reveal.save.json');
  const fixtureText = `${JSON.stringify(envelope)}\n`;
  let prior = null;
  try {
    const priorRaw = await readFile(fixturePath, 'utf8');
    prior = { hash: sha256(priorRaw), envelope: JSON.parse(priorRaw) };
    const oldManifest = await readJson(MANIFEST_PATH);
    const oldEntry = oldManifest.checkpoints?.['qp16.pending-reveal.v1'];
    if (!oldEntry || oldEntry.fixtureSha256 !== prior.hash) fail('Existing pending fixture bytes do not match their prior manifest identity; bytes were preserved.');
    assertFreshManifest(oldManifest, 'qp16.pending-reveal.v1', source);
    if (semanticJson(prior.envelope) !== semanticJson(envelope)) {
      fail('Pending-reveal regeneration differs semantically from the existing fixture (excluding savedAt only); existing bytes were preserved.');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  let manifest;
  try { manifest = await readJson(MANIFEST_PATH); }
  catch (error) { if (error.code !== 'ENOENT') throw error; manifest = initialManifest(source); }
  if (prior) {
    if (!manifest.checkpoints?.['qp16.pending-reveal.v1']) fail('Existing pending fixture has no manifest provenance; its bytes were preserved.');
    assertFreshManifest(manifest, 'qp16.pending-reveal.v1', source);
  }
  await atomicText(fixturePath, fixtureText);
  manifest.checkpoints['qp16.pending-reveal.v1'] = {
    fixtureFile: path.basename(fixturePath), fixtureSha256: sha256(fixtureText), fixtureBytes: Buffer.byteLength(fixtureText),
    seed: engine.seed, schemaVersion: envelope.schemaVersion, raceRestEvidenceVersion: envelope.raceRestEvidenceVersion,
    sourceRevision: source.revision, sourceFingerprint: source.fingerprint, sourceFiles: source.files, recipeFingerprint: source.recipeFingerprint,
    boundary: { step: envelope.state.step, activeModal: envelope.state.activeModal, phase: envelope.state.phase, eventCount: entries.length, eventLogHead: entries.at(-1)?.chain ?? 'genesis' },
    scriptedPrehistory: true,
  };
  await atomicJson(MANIFEST_PATH, manifest);
  await appendResult({ phase: 'create-pending', source, valid: true, semanticRoundTrip: 'equal excluding top-level savedAt only', regeneration: prior ? { priorFixtureHash: prior.hash, newFixtureHash: sha256(fixtureText), semanticEqualExcludingTopLevelSavedAt: true } : 'first generation; run phase again to compare deterministic regeneration', negativeControls, eventBoundary: { drawCommits: draws.length, revealEvents: 0, eventLogHead: entries.at(-1)?.chain } });
  process.stdout.write('Created and validated seeded pending-reveal envelope.\n');
}

function boundedTail(child) {
  let text = '';
  child.stderr?.on('data', (chunk) => { if (text.length < 8192) text += chunk.toString().slice(0, 8192 - text.length); });
  return () => text;
}

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.connectTimer = null;
    this.ready = new Promise((resolve, reject) => {
      this.connectTimer = setTimeout(() => reject(new Error('DevTools WebSocket connect timeout.')), 5000);
      this.socket.addEventListener('open', () => { clearTimeout(this.connectTimer); this.connectTimer = null; resolve(); }, { once: true });
      this.socket.addEventListener('error', () => { clearTimeout(this.connectTimer); this.connectTimer = null; reject(new Error('DevTools WebSocket error.')); }, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result ?? {});
    });
  }

  async send(method, params = {}, sessionId) {
    await this.ready;
    const cleanup = params.__cleanup === true;
    if (cleanup) delete params.__cleanup;
    if (Date.now() >= stopAt && !cleanup) fail('Overall bounded proof deadline reached.');
    const id = this.nextId++;
    const message = { id, method, params, ...(sessionId ? { sessionId } : {}) };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`DevTools command timed out: ${method}`)); }, cleanup ? 750 : 5000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify(message));
    });
  }

  close() {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.connectTimer = null;
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error('DevTools connection closed during cleanup.'));
      this.pending.delete(id);
    }
    try { this.socket.close(); } catch { /* already closed */ }
  }
}

async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true }, sessionId);
  if (result.exceptionDetails) fail(`Page evaluation failed: ${result.exceptionDetails.text}`);
  return result.result?.value;
}

async function waitFor(cdp, sessionId, expression, label, timeout = 12000) {
  const limit = Math.min(Date.now() + timeout, stopAt);
  while (Date.now() < limit) {
    const value = await evaluate(cdp, sessionId, expression);
    if (value) return value;
    await delay(100);
  }
  fail(`Timed out waiting for ${label}.`);
}

async function clickVisible(cdp, sessionId, selector) {
  const expression = `(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return {error:'missing',selector,scroll:{x:scrollX,y:scrollY}}; e.scrollIntoView({block:'center',inline:'center'}); const r=e.getBoundingClientRect(); const x=r.left+r.width/2,y=r.top+r.height/2; const inert=e.closest('[inert]'); const hit=document.elementFromPoint(x,y); const describe=(node)=>{ if(!node) return null; const s=getComputedStyle(node),b=node.getBoundingClientRect(); return {tag:node.tagName,className:typeof node.className==='string'?node.className:'',rect:{x:b.x,y:b.y,width:b.width,height:b.height},style:{position:s.position,zIndex:s.zIndex,pointerEvents:s.pointerEvents,visibility:s.visibility,opacity:s.opacity,transform:s.transform}}; }; if(!r.width||!r.height||e.disabled||inert||getComputedStyle(e).pointerEvents==='none'||r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight||!(hit===e||e.contains(hit))) return {error:'not-hit-testable',selector,x,y,target:describe(e),hit:describe(hit),scroll:{x:scrollX,y:scrollY},visualViewport:visualViewport?{offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop,width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale}:null}; return {x,y}; })()`;
  const point = await evaluate(cdp, sessionId, expression);
  if (point?.error) {
    let screenshot = null;
    if (!failureScreenshotTaken) {
      failureScreenshotTaken = true;
      try {
        const captured = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true }, sessionId);
        const bytes = Buffer.from(captured.data || '', 'base64');
        const screenshotPath = path.join(OUT, 'failure-hit-test.png');
        if (bytes.length > 0 && bytes.length <= 2 * 1024 * 1024) {
          try { await readFile(screenshotPath); fail('Refusing to overwrite the existing bounded hit-test screenshot.'); }
          catch (error) { if (error.code !== 'ENOENT') throw error; }
          await writeFile(screenshotPath, bytes, { flag: 'wx' });
          screenshot = { file: path.basename(screenshotPath), bytes: bytes.length, sha256: sha256(bytes) };
        } else screenshot = { omitted: true, reason: 'captured PNG was empty or exceeded the 2 MiB bound', bytes: bytes.length };
      } catch (error) { screenshot = { omitted: true, reason: `capture failed: ${error.message}` }; }
    }
    fail(`Cannot pointer-activate ${selector}: ${JSON.stringify({ ...point, failureScreenshot: screenshot, screenshotAlreadyCaptured: failureScreenshotTaken && screenshot === null })}`);
  }
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y }, sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 }, sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 }, sessionId);
}

async function pageSave(cdp, sessionId) {
  const raw = await evaluate(cdp, sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
  if (!raw) fail('Normal app storage key is empty at the asserted boundary.');
  return { raw, envelope: JSON.parse(raw), hash: sha256(raw) };
}

async function assertMounted(cdp, sessionId, selector, label) {
  await waitFor(cdp, sessionId, `(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; })()`, label);
}

async function spawnChrome() {
  const profile = await mkdtemp(path.join(os.tmpdir(), 'qp16-chrome-'));
  const owned = { profile, child: null, cdp: null, stderr: () => '', closed: false };
  ownedBrowsers.add(owned);
  let child;
  try {
    child = spawn(CHROME, ['--headless=new', '--no-first-run', '--disable-gpu', '--no-default-browser-check', '--window-size=1365,900', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (error) {
    owned.startError = error.message;
    throw new Error(`Could not start isolated Chrome: ${error.message}`);
  }
  owned.child = child;
  owned.stderr = boundedTail(child);
  child.on('error', (error) => { owned.startError = error.message; });
  const portFile = path.join(profile, 'DevToolsActivePort');
  const limit = Math.min(Date.now() + 10000, stopAt);
  let portInfo;
  while (Date.now() < limit) {
    if (owned.startError || child.exitCode !== null) fail(`Chrome exited during startup (${owned.startError ?? child.exitCode}): ${owned.stderr()}`);
    try { portInfo = (await readFile(portFile, 'utf8')).trim().split(/\r?\n/); break; } catch { await delay(100); }
  }
  if (!portInfo?.[0] || !portInfo[1]) fail(`Chrome DevTools endpoint did not appear: ${owned.stderr()}`);
  owned.cdp = new CDP(`ws://127.0.0.1:${portInfo[0]}${portInfo[1]}`);
  await owned.cdp.ready;
  return owned;
}

async function createPage(cdp, fixtureRaw, url) {
  const context = await cdp.send('Target.createBrowserContext', { disposeOnDetach: true });
  const target = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId: context.browserContextId });
  const attached = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const session = attached.sessionId;
  await cdp.send('Page.enable', {}, session);
  await cdp.send('Runtime.enable', {}, session);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false }, session);
  if (fixtureRaw !== null) {
    const key = JSON.stringify(STORAGE_KEY), raw = JSON.stringify(fixtureRaw);
    const token = `qp16-fixture-seeded-${sha256(raw).slice(0, 16)}`;
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { try { if (location.origin === 'null' || sessionStorage.getItem(${JSON.stringify(token)})) return; sessionStorage.setItem(${JSON.stringify(token)}, '1'); localStorage.setItem(${key},${raw}); } catch {} })();` }, session);
  }
  await cdp.send('Page.navigate', { url }, session);
  return { contextId: context.browserContextId, targetId: target.targetId, sessionId: session };
}

async function closeChrome(browser) {
  if (!browser || browser.closed) return;
  browser.closed = true;
  if (browser.cdp) {
    try { await browser.cdp.send('Browser.close', { __cleanup: true }); } catch (error) { cleanupNotes.push(`Browser.close: ${error.message}`); }
    browser.cdp.close();
  }
  if (browser.child && browser.child.exitCode === null) {
    await Promise.race([new Promise((resolve) => browser.child.once('exit', resolve)), delay(1500)]);
  }
  if (browser.child && browser.child.exitCode === null && browser.child.pid) {
    try { execFileSync('taskkill', ['/PID', String(browser.child.pid), '/T', '/F'], { stdio: 'ignore', timeout: 2500 }); }
    catch (error) { cleanupNotes.push(`owned Chrome tree ${browser.child.pid} termination: ${error.message}`); }
    await Promise.race([new Promise((resolve) => browser.child.once('exit', resolve)), delay(500)]);
  }
  if (browser.child && browser.child.exitCode === null) cleanupNotes.push(`owned Chrome tree ${browser.child.pid} may remain; inspect cleanup notes before continuing.`);
  try { await rm(browser.profile, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }); }
  catch (error) { cleanupNotes.push(`temporary profile cleanup: ${error.message}`); }
  ownedBrowsers.delete(browser);
}

async function requireBaseSource() {
  if (!baseURL) fail('--base-url is required for every browser phase.');
  const url = new URL(baseURL);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) fail('Proof URL must be an approved loopback HTTP origin.');
  if (url.username || url.password || !url.pathname.endsWith('/')) fail('Proof URL must have no credentials and end with a base-path slash.');
  const local = await currentSource();
  const served = await servedSource(url);
  return { url: url.href, local, served };
}

async function runPendingRestore() {
  const sourceProof = await requireBaseSource();
  const fixturePath = path.join(OUT, 'pending-reveal.save.json');
  const fixtureRaw = await readFile(fixturePath, 'utf8');
  const manifest = await readJson(MANIFEST_PATH);
  const source = await currentSource();
  assertFreshManifest(manifest, 'qp16.pending-reveal.v1', sourceProof.local);
  const entry = manifest.checkpoints['qp16.pending-reveal.v1'];
  if (!entry || sha256(fixtureRaw) !== entry.fixtureSha256) fail('Pending fixture bytes do not match the manifest.');
  if (manifest.servedSourceHashes && JSON.stringify(manifest.servedSourceHashes) !== JSON.stringify(sourceProof.served)) fail('Served source identity differs from the previously reviewed source map.');
  const envelope = JSON.parse(fixtureRaw); assertValid(envelope, 'pending fixture');
  let browser;
  try {
    browser = await spawnChrome();
    const sentinelEngine = new GameEngine('qp16-ordinary-save-sentinel'); sentinelEngine.start();
    const sentinelRaw = JSON.stringify(sentinelEngine.toEnvelope());
    const ordinary = await createPage(browser.cdp, sentinelRaw, sourceProof.url);
    await waitFor(browser.cdp, ordinary.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})!==null`, 'isolated ordinary save');
    const sentinelBefore = await evaluate(browser.cdp, ordinary.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
    const fixturePage = await createPage(browser.cdp, fixtureRaw, sourceProof.url);
    await assertMounted(browser.cdp, fixturePage.sessionId, '#btn-reveal-next', 'normal pending-reveal UI');
    const initial = await pageSave(browser.cdp, fixturePage.sessionId);
    if (semanticJson(initial.envelope) !== semanticJson(envelope)) fail('Normal app hydration did not preserve the pending checkpoint envelope.');
    if (initial.envelope.state.pendingReveals.some((item) => item.revealed)) fail('Mounted pending fixture is not at the unrevealed boundary.');
    if (!documentTitle(await evaluate(browser.cdp, fixturePage.sessionId, 'document.title'))) fail('App document title was unavailable.');
    const targetIndex = initial.envelope.state.pendingReveals.findIndex((item) => !item.duplicate);
    if (targetIndex < 0) fail('Pending recipe has no first-owned card for a stable one-card reveal continuation.');
    await clickVisible(browser.cdp, fixturePage.sessionId, `.card-back[data-card-idx="${targetIndex}"]`);
    await waitFor(browser.cdp, fixturePage.sessionId, `(() => { try { const e=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})); return e?.eventLog?.filter(x=>x.type==='reveal_shown').length===1; } catch { return false; } })()`, 'one normally displayed reveal');
    await waitFor(browser.cdp, fixturePage.sessionId, `(() => { const e=document.querySelector('.acquisition-shelf-overlay'); return !e; })()`, 'natural acquisition presentation completion after one reveal', 12000);
    const after = await pageSave(browser.cdp, fixturePage.sessionId);
    assertValid(after.envelope, 'post-reveal save');
    const revealed = after.envelope.state.pendingReveals.filter((item) => item.revealed);
    if (revealed.length !== 1 || !after.envelope.state.pendingReveals[targetIndex]?.revealed) fail('The current autosave does not match the one-card UI boundary.');
    const logDelta = after.envelope.eventLog.slice(initial.envelope.eventLog.length);
    const revealEvents = logDelta.filter((entry) => entry.type === 'reveal_shown');
    if (revealEvents.length !== 1 || revealEvents[0].payload.commitSeq !== initial.envelope.state.pendingReveals[targetIndex].commitSeq) fail('Expected exactly one matching reveal event after one UI action.');
    if (semanticJson(initial.envelope.prngStreams) !== semanticJson(after.envelope.prngStreams)) fail('Reveal continuation unexpectedly advanced an RNG stream.');
    if (after.envelope.eventLog.filter((entry) => entry.type === 'draw_committed').length !== initial.envelope.eventLog.filter((entry) => entry.type === 'draw_committed').length) fail('Reveal continuation changed the draw commit count.');
    const repeat = GameEngine.fromEnvelope(after.envelope);
    const logLengthBeforeRepeat = repeat.log.length;
    repeat.revealDrawAtIndex(targetIndex);
    if (repeat.log.length !== logLengthBeforeRepeat) fail('Repeated engine reveal was not idempotent.');
    const oldTimeOrigin = await evaluate(browser.cdp, fixturePage.sessionId, 'performance.timeOrigin');
    await browser.cdp.send('Page.reload', { ignoreCache: true }, fixturePage.sessionId);
    await waitFor(browser.cdp, fixturePage.sessionId, `performance.timeOrigin>${Number(oldTimeOrigin)}`, 'new document after reload');
    await waitFor(browser.cdp, fixturePage.sessionId, `document.readyState==='complete'`, 'restored document load complete');
    await assertMounted(browser.cdp, fixturePage.sessionId, '.card-revealed[data-card-idx]', 'reloaded one-reveal continuation');
    const afterReload = await pageSave(browser.cdp, fixturePage.sessionId);
    if (afterReload.raw !== after.raw) fail('Fixture seeding script rewrote storage after reload or normal restore changed the saved continuation.');
    const sentinelAfter = await evaluate(browser.cdp, ordinary.sessionId, `localStorage.getItem(${JSON.stringify(STORAGE_KEY)})`);
    if (sentinelAfter !== sentinelBefore) fail('Fixture load altered the independent ordinary-save context.');
    manifest.servedSourceHashes = sourceProof.served;
    await atomicJson(MANIFEST_PATH, manifest);
    await appendResult({ phase, source: sourceProof, fixtureHash: sha256(fixtureRaw), normalRoute: 'gacha theater', control: 'visible card back', postLoadRevealEvents: revealEvents.length, postLoadEventDelta: logDelta.map(({ type, payload }) => ({ type, payload })), postLoadRngUnchanged: true, repeatedEngineRevealIdempotent: true, postLoadLogHead: after.envelope.eventLog.at(-1)?.chain, ordinarySavePreserved: true, limitations: ['isolated sentinel context only; owner profile not accessed'] });
  } finally { await closeChrome(browser); }
}

function documentTitle(value) { return typeof value === 'string' && value.length > 0; }

async function clickAllAcquisitionSkips(cdp, sessionId) {
  const deadline = Math.min(Date.now() + 20000, stopAt);
  while (Date.now() < deadline) {
    const state = await evaluate(cdp, sessionId, `(() => { const proceed=document.querySelector('#btn-gacha-proceed'); const overlay=document.querySelector('.acquisition-shelf-overlay'); if(!proceed) return {done:false}; if(!overlay) proceed.scrollIntoView({block:'center'}); const r=proceed.getBoundingClientRect(); const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); const done=!overlay&&!proceed.disabled&&!proceed.closest('[inert]')&&r.width>0&&r.height>0&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&(hit===proceed||proceed.contains(hit)); return {done,skip:!!document.querySelector('.acquisition-shelf-overlay #btn-skip-acq')}; })()`);
    if (state.done) return;
    if (state.skip) await clickVisible(cdp, sessionId, '.acquisition-shelf-overlay #btn-skip-acq');
    else await delay(120);
  }
  fail('Acquisition presentation did not reach the visible gacha-proceed control within its bounded wait.');
}

async function runStarterCapture() {
  const sourceProof = await requireBaseSource();
  const fixturePath = path.join(OUT, 'pending-reveal.save.json');
  const fixtureRaw = await readFile(fixturePath, 'utf8');
  const manifest = await readJson(MANIFEST_PATH);
  assertFreshManifest(manifest, 'qp16.pending-reveal.v1', sourceProof.local);
  if (manifest.servedSourceHashes && JSON.stringify(manifest.servedSourceHashes) !== JSON.stringify(sourceProof.served)) fail('Served source identity differs from the previously reviewed source map.');
  let oldStarterRaw = null;
  try { oldStarterRaw = await readFile(path.join(OUT, 'starter-offer.save.json'), 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (oldStarterRaw !== null) {
    if (!manifest.checkpoints?.['qp16.starter-offer.v1']) fail('Existing starter fixture has no manifest provenance; its bytes were preserved.');
    assertFreshManifest(manifest, 'qp16.starter-offer.v1', sourceProof.local);
    if (manifest.checkpoints['qp16.starter-offer.v1'].fixtureSha256 !== sha256(oldStarterRaw)) fail('Existing starter fixture bytes do not match their prior manifest identity; bytes were preserved.');
  }
  if (sha256(fixtureRaw) !== manifest.checkpoints['qp16.pending-reveal.v1']?.fixtureSha256) fail('Pending baseline fixture hash mismatch.');
  const pending = JSON.parse(fixtureRaw); assertValid(pending, 'starter recipe baseline');
  let browser;
  try {
    browser = await spawnChrome();
    const page = await createPage(browser.cdp, fixtureRaw, sourceProof.url);
    await assertMounted(browser.cdp, page.sessionId, '#btn-reveal-all', 'mounted pending gacha theater');
    await clickVisible(browser.cdp, page.sessionId, '#btn-reveal-all');
    await clickAllAcquisitionSkips(browser.cdp, page.sessionId);
    await clickVisible(browser.cdp, page.sessionId, '#btn-gacha-proceed');
    await assertMounted(browser.cdp, page.sessionId, '[data-race-form]', 'mounted tutorial race form');
    await clickVisible(browser.cdp, page.sessionId, '[data-race-form] button[type="submit"]');
    await waitFor(browser.cdp, page.sessionId, `(() => { const b=document.querySelector('[data-race-proceed]'); return b&&!b.disabled; })()`, 'natural race playback settle and Continue', 45000);
    await clickVisible(browser.cdp, page.sessionId, '[data-race-proceed]');
    await assertMounted(browser.cdp, page.sessionId, '#btn-decline-starter', 'mounted starter-offer modal');
    const captured = await pageSave(browser.cdp, page.sessionId);
    assertValid(captured.envelope, 'starter-offer current UI save');
    const state = captured.envelope.state;
    const events = captured.envelope.eventLog;
    const restored = GameEngine.fromEnvelope(captured.envelope).toEnvelope();
    if (semanticJson(captured.envelope) !== semanticJson(restored)) fail('Starter envelope hydrate/serialize round-trip differed.');
    const negativeControls = assertNegativeControls(captured.envelope, sourceProof.local);
    const raceEvents = events.filter((event) => event.type === 'race_result' && event.payload.raceNumber === 1);
    const race = raceEvents[0];
    if (raceEvents.length !== 1 || events.at(-1)?.type !== 'cue_shown' || state.step !== 'd1_afternoon_starter' || state.activeModal !== 'starter') {
      fail('Captured starter envelope does not match the visible modal, completed race, and current autosave boundary.');
    }
    if (!events.some((event) => event.type === 'race_cue_displayed') || !events.some((event) => event.type === 'race_choice_offered')) {
      fail('Starter prehistory lacks race UI evidence from mounted callbacks.');
    }
    const baselineEvents = pending.eventLog;
    if (events.length <= baselineEvents.length || baselineEvents.some((event, index) => JSON.stringify(event) !== JSON.stringify(events[index]))) fail('Starter event history does not preserve the full pending checkpoint prefix.');
    const changedRngStreams = Object.keys(pending.prngStreams).filter((name) => pending.prngStreams[name] !== captured.envelope.prngStreams[name]);
    const changedStateFields = Object.keys(pending.state).filter((name) => semanticJson(pending.state[name], false) !== semanticJson(state[name], false));
    if (changedRngStreams.length !== 0) fail(`Mounted starter recipe unexpectedly changed engine RNG streams: ${changedRngStreams.join(', ')}.`);
    const starterRaw = captured.raw;
    let priorStarter = null;
    if (oldStarterRaw !== null) {
      priorStarter = { hash: sha256(oldStarterRaw), envelope: JSON.parse(oldStarterRaw) };
      if (semanticJson(priorStarter.envelope) !== semanticJson(captured.envelope)) fail('Starter semantic regeneration differs (excluding top-level savedAt only); old fixture bytes were preserved.');
    }
    await atomicText(path.join(OUT, 'starter-offer.save.json'), starterRaw);
    manifest.checkpoints['qp16.starter-offer.v1'] = {
      fixtureFile: 'starter-offer.save.json', fixtureSha256: captured.hash, fixtureBytes: Buffer.byteLength(starterRaw),
      seed: pending.prngStreams.root ? JSON.parse(pending.prngStreams.root).key : 'unknown', schemaVersion: captured.envelope.schemaVersion,
      raceRestEvidenceVersion: captured.envelope.raceRestEvidenceVersion,
      sourceRevision: sourceProof.local.revision, sourceFingerprint: sourceProof.local.fingerprint,
      sourceFiles: sourceProof.local.files, recipeFingerprint: sourceProof.local.recipeFingerprint,
      boundary: { step: state.step, activeModal: state.activeModal, phase: state.phase, eventCount: events.length, eventLogHead: events.at(-1)?.chain },
      scriptedPrehistory: true,
    };
    manifest.servedSourceHashes = sourceProof.served;
    await atomicJson(MANIFEST_PATH, manifest);
    await appendResult({ phase, source: sourceProof, fixtureHash: captured.hash, byteLength: Buffer.byteLength(starterRaw), semanticRegeneration: priorStarter ? { previousHash: priorStarter.hash, currentHash: captured.hash, equalExcludingTopLevelSavedAt: true } : 'first starter generation; rerun phase to compare', negativeControls, valid: true, visibleModal: 'Starter offer', stateBoundary: { step: state.step, activeModal: state.activeModal }, stateFieldsChangedFromPending: changedStateFields, rngStreamsChangedFromPending: changedRngStreams, logPrefixPreserved: true, appendedEventCount: events.length - baselineEvents.length, race: { status: race.payload.status, raceId: race.payload.raceId, resolutionDigest: race.payload.resolutionDigest }, eventLogHead: events.at(-1)?.chain, autosaveMatchesVisibleBoundary: true, limitations: ['synthetic scripted prehistory before pending checkpoint'] });
  } finally { await closeChrome(browser); }
}

async function runBranch(branch) {
  const sourceProof = await requireBaseSource();
  const fixturePath = path.join(OUT, 'starter-offer.save.json');
  const fixtureRaw = await readFile(fixturePath, 'utf8');
  const manifest = await readJson(MANIFEST_PATH);
  const starterProvenance = await assertCapturedStarterFresh(manifest, sourceProof.local, fixtureRaw);
  if (!manifest.servedSourceHashes || JSON.stringify(manifest.servedSourceHashes) !== JSON.stringify(sourceProof.served)) fail('Served source identity differs from the exact source map recorded in the manifest.');
  assertValid(JSON.parse(fixtureRaw), 'starter fixture');
  let browser;
  try {
    browser = await spawnChrome();
    const page = await createPage(browser.cdp, fixtureRaw, sourceProof.url);
    const selector = branch === 'accept' ? '#btn-buy-starter' : '#btn-decline-starter';
    await assertMounted(browser.cdp, page.sessionId, selector, `starter ${branch} control`);
    await clickVisible(browser.cdp, page.sessionId, selector);
    await waitFor(browser.cdp, page.sessionId, `(() => { try { const e=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})); return e?.state?.activeModal===null&&e?.state?.step==='d2_afternoon_rent'&&e?.state?.clock?.day===2&&e?.state?.phase==='playing'; } catch { return false; } })()`, `starter ${branch} completed controller continuation`);
    await assertMounted(browser.cdp, page.sessionId, '#main-content .stage-transition-card', 'normal day-two rent route after starter choice');
    const after = await pageSave(browser.cdp, page.sessionId); assertValid(after.envelope, `${branch} branch continuation`);
    const relevant = after.envelope.eventLog.slice(JSON.parse(fixtureRaw).eventLog.length);
    const starterEvents = relevant.filter((entry) => entry.type === 'purchase' && entry.payload.kind === 'starter'
      || entry.type === 'action' && entry.payload.kind === 'starter_declined');
    if (starterEvents.length !== 1 || (branch === 'accept') !== (starterEvents[0].type === 'purchase')) fail(`Starter ${branch} branch did not append exactly its one-time result.`);
    const before = JSON.parse(fixtureRaw).state;
    const expectedCash = Math.round((before.cash + 10 - 5 - (branch === 'accept' ? 0.99 : 0)) * 100) / 100;
    if (after.envelope.state.cash !== expectedCash) fail(`Starter ${branch} branch cash effect mismatch: expected ${expectedCash}, got ${after.envelope.state.cash}.`);
    if (after.envelope.state.gems !== before.gems + (branch === 'accept' ? 240 : 0)
        || after.envelope.state.starterBought !== (branch === 'accept')) fail(`Starter ${branch} branch reward/state effect mismatch.`);
    const roundTrip = GameEngine.fromEnvelope(after.envelope).toEnvelope();
    if (semanticJson(after.envelope) !== semanticJson(roundTrip)) fail(`Starter ${branch} continuation hydrate/serialize round-trip differed.`);
    await appendResult({ phase: `branch-${branch}`, source: sourceProof, fixtureHash: sha256(fixtureRaw), starterProvenance, outcome: branch, addedEvents: relevant.map((entry) => ({ type: entry.type, payload: entry.payload })), starterEventCount: starterEvents.length, finalContext: { step: after.envelope.state.step, activeModal: after.envelope.state.activeModal, day: after.envelope.state.clock.day, phase: after.envelope.state.phase }, expectedCash, actualCash: after.envelope.state.cash, expectedGems: before.gems + (branch === 'accept' ? 240 : 0), actualGems: after.envelope.state.gems, continuationValid: true, autosaveMatchesMountedRoute: true });
  } finally { await closeChrome(browser); }
}

async function main() {
  if (phase === 'starter-capture') fail('Fresh starter capture is disabled after the owner-approved immutable capture amendment; preserve and replay the pinned starter fixture.');
  if (!PHASES.has(phase)) fail(`Choose one phase: ${[...PHASES].join(', ')}`);
  await mkdir(OUT, { recursive: true });
  if (phase === 'create-pending') return createPending();
  if (phase === 'pending-restore') return runPendingRestore();
  return runBranch(phase.slice('branch-'.length));
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}).finally(async () => {
  for (const browser of [...ownedBrowsers]) await closeChrome(browser);
  if (cleanupNotes.length) {
    process.stderr.write(`Cleanup issues: ${cleanupNotes.join(' | ')}\n`);
    process.exitCode = 1;
  }
});
