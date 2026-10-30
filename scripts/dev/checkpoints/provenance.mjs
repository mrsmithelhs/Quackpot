import { createHash } from 'node:crypto';
import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const CATALOG_PATH = 'scripts/dev/checkpoints/catalog.json';
export const PLAN16 = 'reports/development/plan-16-deterministic-review-checkpoints';
export const PLAN35 = 'reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot';
export const CAPTURE_ORIGIN_MANIFEST_PATH = `${PLAN35}/capture-origins/plan35-loader-b259ee172bd54741443352031068584924b5c494444f497b212795b41d0ed496/origin-manifest.json`;
export const CAPTURE_ORIGIN_MANIFEST_SHA256 = '0b14119a97711bc68907a7816f1218fb41479a9ce95e56996caf5af89653c15e';
export const FIXTURE_VALIDATION_INDEX_PATH = `${PLAN35}/fixture-validation-index.json`;
export const STORAGE_KEY = 'quackpot_save_v1';
export const MAX_FIXTURE_BYTES = 1024 * 1024;
export const MAX_FIXTURE_TOTAL_BYTES = 2 * 1024 * 1024;
export const MAX_ARCHIVE_FILE_BYTES = 1024 * 1024;
export const MAX_ARCHIVE_TOTAL_BYTES = 2 * 1024 * 1024;
const MAX_CAPTURE_ORIGIN_FILE_BYTES = 256 * 1024;
const MAX_CAPTURE_ORIGIN_MANIFEST_BYTES = 16 * 1024;
const MAX_FIXTURE_VALIDATION_INDEX_BYTES = 64 * 1024;
const MAX_PILOT_LOG_BYTES = 1024 * 1024;
const CAPTURE_ORIGIN_LOADER_FILES = [
  'scripts/dev/checkpoints/provenance.mjs', 'scripts/dev/checkpoints/envelope.mjs',
  'scripts/dev/checkpoints/checkpoint-proof.mjs', 'scripts/dev/checkpoints/cdp.mjs',
  'scripts/dev/checkpoints/browser-phase.mjs', 'scripts/dev/checkpoints/run-controlled-phase.mjs',
  'scripts/dev/checkpoints/process-tree.mjs', 'scripts/dev/checkpoints/process-tree.ps1',
];
const VALIDATION_LOADER_FILES = [
  'scripts/dev/checkpoints/provenance.mjs', 'scripts/dev/checkpoints/envelope.mjs',
  'scripts/dev/checkpoints/checkpoint-proof.mjs',
];
const PLAN35_CHECKPOINT_IDS = [
  'plan35.rent-paid-zero.v1', 'plan35.rent-unpaid-escalation.v1', 'plan35.finale-race-entry.v1',
];

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const fail = (message) => { throw new Error(message); };

export function resolveRepoPath(relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) fail(`Invalid repository relative path: ${relative}`);
  const resolved = path.resolve(ROOT, relative);
  const rel = path.relative(ROOT, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) fail(`Repository path escapes root: ${relative}`);
  return resolved;
}

export async function readBounded(relative, maxBytes) {
  const full = resolveRepoPath(relative);
  const info = await stat(full);
  if (!info.isFile()) fail(`Expected a regular file: ${relative}`);
  if (info.size > maxBytes) fail(`File exceeds read cap before loading: ${relative} (${info.size} > ${maxBytes} bytes)`);
  const bytes = await readFile(full);
  if (bytes.length !== info.size || bytes.length > maxBytes) fail(`File changed or exceeded cap while reading: ${relative}`);
  return bytes;
}

export async function readJsonBounded(relative, maxBytes = 256 * 1024) {
  const bytes = await readBounded(relative, maxBytes);
  try { return JSON.parse(bytes.toString('utf8')); }
  catch (error) { fail(`Invalid JSON in ${relative}: ${error.message}`); }
}

export async function readCatalog() { return readJsonBounded(CATALOG_PATH); }

export function catalogEntry(catalog, id) {
  const entry = catalog.checkpoints?.[id] ?? catalog.references?.[id];
  if (!entry) fail(`Unknown checkpoint id: ${id}`);
  return entry;
}

export function assertCaptureParent(catalog, entry) {
  const parent = entry.provenance?.captureParent;
  if (!parent?.id || !/^[a-f0-9]{64}$/.test(parent.sha256 ?? '')) throw new Error('Captured checkpoint has incomplete parent identity.');
  const source = catalogEntry(catalog, parent.id);
  if (source.sha256 !== parent.sha256) throw new Error(`Captured checkpoint parent identity changed: ${parent.id}`);
  if (source.provenance?.sourceClosureSha256
      && source.provenance.sourceClosureSha256 !== entry.provenance.sourceClosureSha256) {
    throw new Error('Captured checkpoint parent and child production source closures differ.');
  }
  return { id: parent.id, sha256: parent.sha256 };
}

export async function readFixtureBeforeParse(entry) {
  const bytes = await readBounded(entry.fixture, MAX_FIXTURE_BYTES);
  if (!/^[a-f0-9]{64}$/.test(entry.sha256 ?? '')) fail(`Fixture has no pinned SHA-256: ${entry.fixture}`);
  if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) fail(`Exact fixture identity mismatch: ${entry.fixture}`);
  return { bytes, raw: bytes.toString('utf8'), hash: sha256(bytes) };
}

export async function verifyPinnedPlan16Archive(catalog) {
  const entry = catalog.references?.['qp16.starter-offer.v1'];
  if (!entry) fail('Plan 16 starter archive catalog entry is missing.');
  const indexPath = `${entry.archiveDirectory}/archive-index.json`;
  const indexBytes = await readBounded(indexPath, 64 * 1024);
  if (sha256(indexBytes) !== entry.archiveIndexSha256) fail('Plan 16 archive index differs from the independently pinned SHA-256.');
  const index = JSON.parse(indexBytes.toString('utf8'));
  if (index.checkpointId !== 'qp16.starter-offer.v1' || index.fixtureSha256 !== entry.sha256) fail('Plan 16 archive identity disagrees with the pinned starter entry.');
  if (!Array.isArray(index.files) || index.files.length !== 5) fail('Plan 16 archive file list differs from the approved five-file provenance set.');
  let total = 0;
  const files = {};
  for (const item of index.files) {
    if (typeof item.file !== 'string' || path.basename(item.file) !== item.file
      || !Number.isSafeInteger(item.bytes) || item.bytes < 0 || item.bytes > MAX_ARCHIVE_FILE_BYTES
      || !/^[a-f0-9]{64}$/.test(item.sha256 ?? '')) fail('Invalid Plan 16 archive record.');
    total += item.bytes;
    if (total > MAX_ARCHIVE_TOTAL_BYTES) fail('Plan 16 archive exceeds its 2 MiB aggregate cap.');
    const bytes = await readBounded(`${entry.archiveDirectory}/${item.file}`, MAX_ARCHIVE_FILE_BYTES);
    if (bytes.length !== item.bytes || sha256(bytes) !== item.sha256) fail(`Plan 16 archived provenance mismatch: ${item.file}`);
    files[item.file] = { bytes: bytes.length, sha256: sha256(bytes) };
  }
  const archivedFixture = files['starter-offer.save.json'];
  if (!archivedFixture || archivedFixture.sha256 !== entry.sha256 || archivedFixture.bytes !== entry.bytes) fail('Plan 16 archive does not pin the exact active starter bytes.');
  return { indexSha256: entry.archiveIndexSha256, fileCount: index.files.length, bytes: total, files };
}

export async function verifyPlan16SourceClosure(catalog, { requireCurrent = true } = {}) {
  const reference = catalog.references?.['qp16.starter-offer.v1'];
  if (!reference) fail('Plan 16 starter reference is absent.');
  const manifest = await readJsonBounded(reference.manifest, 512 * 1024);
  const manifestEntry = manifest.checkpoints?.['qp16.starter-offer.v1'];
  if (!manifestEntry || manifestEntry.fixtureSha256 !== reference.sha256
      || manifestEntry.captureProvenance?.recipeFingerprint !== reference.captureRecipeSha256
      || manifestEntry.loaderValidation?.recipeFingerprint !== reference.historicalLoaderSha256) {
    fail('Plan 16 manifest no longer matches its separately recorded capture/loader identities.');
  }
  const files = manifestEntry.sourceFiles;
  if (!files || typeof files !== 'object' || Array.isArray(files)) fail('Plan 16 source closure map is missing.');
  const current = {};
  let matches = true;
  for (const [relative, expected] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    if (!relative.startsWith('src/') && !['index.html', 'vite.config.mjs', 'package.json', 'package-lock.json'].includes(relative)) fail(`Unexpected source-closure path: ${relative}`);
    const bytes = await readBounded(relative, 3 * 1024 * 1024);
    const actual = sha256(bytes);
    current[relative] = actual;
    if (actual !== expected) matches = false;
  }
  const expectedFingerprint = sha256(JSON.stringify({ files, recipeFingerprint: reference.captureRecipeSha256 }));
  if (expectedFingerprint !== reference.captureSourceFingerprint) fail('Plan 16 source-file map does not reproduce the immutable capture fingerprint.');
  const fingerprintCurrentFiles = {};
  for (const relative of Object.keys(files)) fingerprintCurrentFiles[relative] = current[relative];
  const currentFingerprint = sha256(JSON.stringify({ files: fingerprintCurrentFiles, recipeFingerprint: reference.captureRecipeSha256 }));
  if (requireCurrent && !matches) fail('Current production source closure differs from the immutable Plan 16 starter capture; do not derive Plan 35 fixtures from it.');
  return { matches, expectedFingerprint: reference.captureSourceFingerprint, captureSourceRevision: manifestEntry.captureProvenance.sourceRevision,
    currentFiles: current, currentFingerprint };
}

export async function currentLoaderSha256() {
  const files = {};
  for (const relative of ['scripts/dev/checkpoints/provenance.mjs', 'scripts/dev/checkpoints/envelope.mjs',
    'scripts/dev/checkpoints/checkpoint-proof.mjs', 'scripts/dev/checkpoints/cdp.mjs',
    'scripts/dev/checkpoints/browser-phase.mjs', 'scripts/dev/checkpoints/run-controlled-phase.mjs',
    'scripts/dev/checkpoints/process-tree.mjs', 'scripts/dev/checkpoints/process-tree.ps1']) {
    files[relative] = sha256(await readBounded(relative, 256 * 1024));
  }
  return sha256(JSON.stringify(files));
}

export async function currentValidationLoaderSha256() {
  const files = {};
  for (const relative of VALIDATION_LOADER_FILES) files[relative] = sha256(await readBounded(relative, 256 * 1024));
  return sha256(JSON.stringify(files));
}

export async function verifyCaptureOrigin(id, entry) {
  const manifestBytes = await readBounded(CAPTURE_ORIGIN_MANIFEST_PATH, MAX_CAPTURE_ORIGIN_MANIFEST_BYTES);
  const manifestSha256 = sha256(manifestBytes);
  if (manifestSha256 !== CAPTURE_ORIGIN_MANIFEST_SHA256) fail('Capture-origin manifest differs from the independently pinned SHA-256.');
  let manifest;
  try { manifest = JSON.parse(manifestBytes.toString('utf8')); }
  catch (error) { fail(`Invalid capture-origin manifest JSON: ${error.message}`); }
  if (manifest.protocol !== 'qp35.capture-origin.v1' || manifest.loaderSha256 !== entry.provenance?.loaderSha256
      || manifest.captureRecipe?.path !== entry.provenance?.captureRecipe?.file
      || manifest.captureRecipe?.sha256 !== entry.provenance?.captureRecipe?.sha256
      || !Array.isArray(manifest.capturedAtRevisions) || manifest.capturedAtRevisions.length !== PLAN35_CHECKPOINT_IDS.length
      || !Array.isArray(manifest.files) || manifest.files.length !== CAPTURE_ORIGIN_LOADER_FILES.length) {
    fail('Captured checkpoint origin does not match the pinned origin manifest.');
  }
  const supportedRevision = manifest.capturedAtRevisions.find((row) => row.checkpointId === id);
  if (!PLAN35_CHECKPOINT_IDS.includes(id) || supportedRevision?.revision !== entry.provenance?.captureRevision) {
    fail('Capture-origin revision is not in the independently pinned supported origin set.');
  }
  if (manifest.limits?.fileBytesMaximum !== MAX_CAPTURE_ORIGIN_FILE_BYTES
      || manifest.limits?.aggregateBytesMaximum !== MAX_ARCHIVE_TOTAL_BYTES
      || !Number.isSafeInteger(manifest.limits?.archiveBytes) || manifest.limits.archiveBytes < 1
      || manifest.limits.archiveBytes > MAX_ARCHIVE_TOTAL_BYTES) fail('Capture-origin manifest has invalid size limits.');
  let declaredBytes = 0;
  for (let index = 0; index < CAPTURE_ORIGIN_LOADER_FILES.length; index += 1) {
    const item = manifest.files[index];
    if (item?.path !== CAPTURE_ORIGIN_LOADER_FILES[index]
        || item.archivePath !== `${path.posix.dirname(CAPTURE_ORIGIN_MANIFEST_PATH)}/files/${item.path}`
        || !Number.isSafeInteger(item.bytes) || item.bytes < 1 || item.bytes > MAX_CAPTURE_ORIGIN_FILE_BYTES
        || !/^[a-f0-9]{40}$/.test(item.gitBlobOid ?? '') || !/^[a-f0-9]{64}$/.test(item.sha256 ?? '')) {
      fail(`Invalid bounded capture-origin file record at index ${index}.`);
    }
    declaredBytes += item.bytes;
    if (declaredBytes > MAX_ARCHIVE_TOTAL_BYTES) fail('Capture-origin files exceed the 2 MiB aggregate cap.');
  }
  if (declaredBytes !== manifest.limits.archiveBytes) fail('Capture-origin declared aggregate byte count is inconsistent.');
  const loaderFiles = {};
  for (const item of manifest.files) {
    const bytes = await readBounded(item.archivePath, MAX_CAPTURE_ORIGIN_FILE_BYTES);
    if (bytes.length !== item.bytes || sha256(bytes) !== item.sha256) fail(`Archived capture-origin source mismatch: ${item.path}`);
    loaderFiles[item.path] = item.sha256;
  }
  if (sha256(JSON.stringify(loaderFiles)) !== manifest.loaderSha256) fail('Archived capture-origin loader aggregate hash mismatch.');
  if (loaderFiles[manifest.captureRecipe.path] !== manifest.captureRecipe.sha256) fail('Archived capture recipe hash mismatch.');
  return { manifestPath: CAPTURE_ORIGIN_MANIFEST_PATH, manifestSha256, captureRevision: supportedRevision.revision,
    captureRecipeFile: manifest.captureRecipe.path, captureRecipeSha256: manifest.captureRecipe.sha256,
    loaderSha256: manifest.loaderSha256 };
}

export function assertCurrentIdentity(entry, current) {
  const provenance = entry.provenance;
  if (!provenance) fail('Captured checkpoint provenance is missing.');
  if (!provenance.sourceFiles || typeof provenance.sourceFiles !== 'object' || Array.isArray(provenance.sourceFiles)
      || !Object.keys(provenance.sourceFiles).length) fail('Captured checkpoint source file closure is missing.');
  if (!/^[a-f0-9]{64}$/.test(provenance.sourceClosureSha256 ?? '')
      || !/^[a-f0-9]{64}$/.test(provenance.productionSourceFingerprint ?? '')
      || !/^[a-f0-9]{64}$/.test(provenance.captureRecipe?.sha256 ?? '')
      || typeof provenance.captureRecipe?.file !== 'string' || !provenance.captureRecipe.file
      || !/^[a-f0-9]{64}$/.test(provenance.loaderSha256 ?? '')) fail('Captured checkpoint identity fields are incomplete or malformed.');
  if (!current.sourceFiles || typeof current.sourceFiles !== 'object' || Array.isArray(current.sourceFiles)
      || !Object.keys(current.sourceFiles).length
      || !/^[a-f0-9]{64}$/.test(current.productionSourceFingerprint ?? '')
      || !/^[a-f0-9]{64}$/.test(current.validationLoaderSha256 ?? '')
      || current.captureOrigin?.captureRevision !== provenance.captureRevision
      || current.captureOrigin?.captureRecipeFile !== provenance.captureRecipe.file
      || current.captureOrigin?.captureRecipeSha256 !== provenance.captureRecipe.sha256
      || current.captureOrigin?.loaderSha256 !== provenance.loaderSha256
      || current.captureOrigin?.manifestSha256 !== CAPTURE_ORIGIN_MANIFEST_SHA256) fail('Current checkpoint identity fields are incomplete or unsupported.');
  if (JSON.stringify(provenance.sourceFiles) !== JSON.stringify(current.sourceFiles)) fail('Captured checkpoint is stale for production source closure.');
  if (provenance.sourceClosureSha256 !== sha256(JSON.stringify(current.sourceFiles))) fail('Captured checkpoint source closure fingerprint is stale.');
  if (provenance.productionSourceFingerprint !== current.productionSourceFingerprint) fail('Captured checkpoint production source fingerprint is stale.');
}

export function assertValidationAttestation(entry, id, attestation, current, { requireRecordPin = true } = {}) {
  const provenance = entry.provenance;
  const pin = attestation?.recordPin;
  const origin = attestation?.captureOrigin;
  if (attestation?.protocol !== 'qp35.fixture-validation.v1' || attestation.checkpointId !== id
      || attestation.fixture?.path !== entry.fixture || attestation.fixture?.bytes !== entry.bytes
      || attestation.fixture?.sha256 !== entry.sha256
      || origin?.captureRevision !== provenance?.captureRevision
      || origin?.captureRecipeFile !== provenance?.captureRecipe?.file
      || origin?.captureRecipeSha256 !== provenance?.captureRecipe?.sha256
      || origin?.loaderSha256 !== provenance?.loaderSha256
      || origin?.manifestSha256 !== current.captureOrigin?.manifestSha256
      || attestation.productionSourceFingerprint !== current.productionSourceFingerprint
      || attestation.sourceClosureSha256 !== current.sourceClosureSha256
      || attestation.validationLoaderSha256 !== current.validationLoaderSha256
      || attestation.result?.valid !== true || attestation.result?.boundaryMatched !== true
      || attestation.result?.envelopeValid !== true || !Array.isArray(attestation.result?.errors)
      || attestation.result.errors.length !== 0 || !Number.isSafeInteger(attestation.result?.eventCount)
      || attestation.result.eventCount < 0 || typeof attestation.result?.chainHead !== 'string'
      || (attestation.result.eventCount === 0
        ? attestation.result.chainHead !== 'genesis'
        : !/^[a-f0-9]{8}$/.test(attestation.result.chainHead))
      || !attestation.result?.negativeControls || !Object.keys(attestation.result.negativeControls).length
      || Object.values(attestation.result.negativeControls).some((value) => value !== true)
      || (requireRecordPin && (pin?.file !== `${PLAN35}/pilot-results.jsonl` || !Number.isSafeInteger(pin.bytes)
        || pin.bytes < 2 || pin.bytes > MAX_PILOT_LOG_BYTES || !/^[a-f0-9]{64}$/.test(pin.sha256 ?? '')))) {
    fail(`Missing, stale, or malformed current-validation attestation for ${id}.`);
  }
}

export function assertValidationAttestationNegativeControls(entry, id, attestation, current, { requireRecordPin = true } = {}) {
  assertValidationAttestation(entry, id, attestation, current, { requireRecordPin });
  const cases = [
    ['attestation missing', (copy) => { copy.attestation = null; }],
    ['fixture hash changed', (copy) => { copy.attestation.fixture.sha256 = '0'.repeat(64); }],
    ['origin recipe changed', (copy) => { copy.attestation.captureOrigin.captureRecipeSha256 = '0'.repeat(64); }],
    ['origin loader changed', (copy) => { copy.attestation.captureOrigin.loaderSha256 = '0'.repeat(64); }],
    ['origin manifest changed', (copy) => { copy.attestation.captureOrigin.manifestSha256 = '0'.repeat(64); }],
    ['source closure changed', (copy) => { copy.attestation.sourceClosureSha256 = '0'.repeat(64); }],
    ['validation loader changed', (copy) => { copy.attestation.validationLoaderSha256 = '0'.repeat(64); }],
    ['record pin malformed', (copy) => { copy.attestation.recordPin.sha256 = 'not-a-sha256'; }],
    ['result invalidated', (copy) => { copy.attestation.result.valid = false; }],
    ['envelope result invalidated', (copy) => { copy.attestation.result.envelopeValid = false; }],
    ['validation result field missing', (copy) => { delete copy.attestation.result.eventCount; }],
    ['malformed chain head', (copy) => { copy.attestation.result.chainHead = 'not-a-chain-head'; }],
    ['validation chain head missing', (copy) => { delete copy.attestation.result.chainHead; }],
  ];
  if (requireRecordPin) cases.push(['record pin missing', (copy) => { delete copy.attestation.recordPin; }]);
  const rejected = {};
  for (const [label, mutate] of cases) {
    const copy = { attestation: structuredClone(attestation) };
    mutate(copy);
    let failedClosed = false;
    try { assertValidationAttestation(entry, id, copy.attestation, current); }
    catch { failedClosed = true; }
    if (!failedClosed) fail(`Validation-attestation negative control accepted ${label}.`);
    rejected[`${label.replaceAll(/[^a-zA-Z0-9]/g, '')}Rejected`] = true;
  }
  return rejected;
}

export async function readPinnedPilotEvidenceRecord(pin) {
  if (pin?.file !== `${PLAN35}/pilot-results.jsonl` || !Number.isSafeInteger(pin.bytes)
      || pin.bytes < 2 || pin.bytes > MAX_PILOT_LOG_BYTES || !/^[a-f0-9]{64}$/.test(pin.sha256 ?? '')) {
    fail('Invalid pilot evidence record pin.');
  }
  const bytes = await readBounded(pin.file, MAX_PILOT_LOG_BYTES);
  const line = bytes.toString('utf8').split(/(?<=\n)/).find((row) => Buffer.byteLength(row) === pin.bytes && sha256(Buffer.from(row)) === pin.sha256);
  if (!line) fail('Pinned pilot evidence record is missing or changed.');
  try { return JSON.parse(line); }
  catch (error) { fail(`Pinned pilot evidence record is invalid JSON: ${error.message}`); }
}

export async function readFixtureValidationIndex({ allowMissing = false } = {}) {
  const info = await stat(resolveRepoPath(FIXTURE_VALIDATION_INDEX_PATH)).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  if (!info) {
    if (allowMissing) return { protocol: 'qp35.fixture-validation-index.v1', entries: {} };
    fail('Current fixture-validation index is missing; run explicit offline revalidation.');
  }
  if (!info.isFile() || info.size > MAX_FIXTURE_VALIDATION_INDEX_BYTES) fail('Fixture-validation index exceeds its 64 KiB cap before reading.');
  return readJsonBounded(FIXTURE_VALIDATION_INDEX_PATH, MAX_FIXTURE_VALIDATION_INDEX_BYTES);
}

export async function writeFixtureValidationIndex(index) {
  if (index?.protocol !== 'qp35.fixture-validation-index.v1' || !index.entries || typeof index.entries !== 'object'
      || Array.isArray(index.entries) || Object.keys(index.entries).some((id) => !PLAN35_CHECKPOINT_IDS.includes(id))) {
    fail('Refusing to write malformed or unsupported fixture-validation index.');
  }
  const destination = resolveRepoPath(FIXTURE_VALIDATION_INDEX_PATH);
  const temporary = `${destination}.${process.pid}.tmp`;
  const json = `${JSON.stringify(index, null, 2)}\n`;
  if (Buffer.byteLength(json) > MAX_FIXTURE_VALIDATION_INDEX_BYTES) fail('Fixture-validation index would exceed its 64 KiB cap.');
  await writeFile(temporary, json, { flag: 'wx' });
  await rename(temporary, destination);
}

export async function validateFixtureBase(entry, id) {
  if (entry.status !== 'current-loadable') fail(`Checkpoint is not current-loadable: ${entry.fixture} (${entry.status})`);
  if (!entry.provenance?.sourceClosureSha256 || !entry.provenance?.sourceFiles
      || !entry.provenance?.productionSourceFingerprint || !entry.provenance?.captureRecipe?.file
      || !entry.provenance?.captureRecipe?.sha256 || !entry.provenance?.loaderSha256
      || !entry.provenance?.captureRevision) {
    fail('Current-loadable checkpoint is missing required source, capture-origin, or closure identity.');
  }
  const catalog = await readCatalog();
  assertCaptureParent(catalog, entry);
  await verifyPinnedPlan16Archive(catalog);
  const captureOrigin = await verifyCaptureOrigin(id, entry);
  const pinnedClosure = await verifyPlan16SourceClosure(catalog, { requireCurrent: true });
  const closure = entry.provenance.sourceFiles;
  if (!closure || typeof closure !== 'object' || Array.isArray(closure)) fail('Captured checkpoint source file closure is absent.');
  if (JSON.stringify(closure) !== JSON.stringify(pinnedClosure.currentFiles)
      || entry.provenance.productionSourceFingerprint !== pinnedClosure.expectedFingerprint) {
    fail('Captured checkpoint source identity does not match the independently pinned Plan 16 production closure.');
  }
  for (const [relative, expected] of Object.entries(closure)) {
    const bytes = await readBounded(relative, 3 * 1024 * 1024);
    if (sha256(bytes) !== expected) fail(`Captured checkpoint is stale for production source: ${relative}`);
  }
  const fixture = await readFixtureBeforeParse(entry);
  const validationLoaderSha256 = await currentValidationLoaderSha256();
  const current = { sourceFiles: pinnedClosure.currentFiles, productionSourceFingerprint: pinnedClosure.expectedFingerprint,
    captureOrigin, validationLoaderSha256 };
  assertCurrentIdentity(entry, current);
  return { id, fixture, captureOrigin, validationLoaderSha256,
    sourceFiles: pinnedClosure.currentFiles, sourceClosureSha256: entry.provenance.sourceClosureSha256,
    productionSourceFingerprint: entry.provenance.productionSourceFingerprint };
}

export function assertValidationResultMatches(attestation, record) {
  if (record?.phase !== 'fixture-revalidation' || record.id !== attestation.checkpointId
      || record.fixture?.path !== attestation.fixture.path || record.fixture?.bytes !== attestation.fixture.bytes
      || record.fixture?.sha256 !== attestation.fixture.sha256
      || record.captureOrigin?.captureRevision !== attestation.captureOrigin.captureRevision
      || record.captureOrigin?.captureRecipeFile !== attestation.captureOrigin.captureRecipeFile
      || record.captureOrigin?.captureRecipeSha256 !== attestation.captureOrigin.captureRecipeSha256
      || record.captureOrigin?.loaderSha256 !== attestation.captureOrigin.loaderSha256
      || record.captureOrigin?.manifestSha256 !== attestation.captureOrigin.manifestSha256
      || record.productionSourceFingerprint !== attestation.productionSourceFingerprint
      || record.sourceClosureSha256 !== attestation.sourceClosureSha256
      || record.validationLoaderSha256 !== attestation.validationLoaderSha256
      || record.result?.valid !== attestation.result.valid
      || record.result?.boundaryMatched !== attestation.result.boundaryMatched
      || record.result?.validation?.validation?.valid !== attestation.result.envelopeValid
      || JSON.stringify(record.result?.validation?.validation?.errors) !== JSON.stringify(attestation.result.errors)
      || record.result?.validation?.eventCount !== attestation.result.eventCount
      || record.result?.validation?.chainHead !== attestation.result.chainHead
      || JSON.stringify(record.result?.negativeControls) !== JSON.stringify(attestation.result.negativeControls)) {
    fail('Pinned fixture-revalidation record disagrees with its validation attestation.');
  }
}

export async function validateFreshness(entry, id) {
  const base = await validateFixtureBase(entry, id);
  const index = await readFixtureValidationIndex();
  if (index.protocol !== 'qp35.fixture-validation-index.v1' || !index.entries || typeof index.entries !== 'object'
      || Array.isArray(index.entries)) fail('Fixture-validation index is malformed.');
  const attestation = index.entries[id];
  const current = { ...base, captureOrigin: base.captureOrigin, validationLoaderSha256: base.validationLoaderSha256 };
  assertValidationAttestation(entry, id, attestation, current);
  const record = await readPinnedPilotEvidenceRecord(attestation.recordPin);
  assertValidationResultMatches(attestation, record);
  return { id, sourceFiles: base.sourceFiles, sourceClosureSha256: base.sourceClosureSha256,
    productionSourceFingerprint: base.productionSourceFingerprint, captureOrigin: base.captureOrigin,
    validationLoaderSha256: base.validationLoaderSha256,
    fixture: { bytes: base.fixture.bytes.length, sha256: base.fixture.hash }, validationAttestation: attestation };
}

export function assertFreshnessNegativeControls(entry, current) {
  const cases = [
    ['source closure', (copy) => { copy.provenance.sourceFiles[Object.keys(copy.provenance.sourceFiles)[0]] = '0'.repeat(64); }],
    ['capture recipe', (copy) => { copy.provenance.captureRecipe.sha256 = '0'.repeat(64); }],
    ['loader', (copy) => { copy.provenance.loaderSha256 = '0'.repeat(64); }],
    ['source map missing', (copy) => { delete copy.provenance.sourceFiles; }],
    ['source closure hash missing', (copy) => { delete copy.provenance.sourceClosureSha256; }],
    ['source fingerprint missing', (copy) => { delete copy.provenance.productionSourceFingerprint; }],
    ['recipe missing', (copy) => { delete copy.provenance.captureRecipe; }],
    ['recipe file missing', (copy) => { delete copy.provenance.captureRecipe.file; }],
    ['recipe hash missing', (copy) => { delete copy.provenance.captureRecipe.sha256; }],
    ['loader missing', (copy) => { delete copy.provenance.loaderSha256; }],
  ];
  const rejected = {};
  for (const [label, mutate] of cases) {
    const copy = structuredClone(entry);
    mutate(copy);
    let failedClosed = false;
    try { assertCurrentIdentity(copy, current); }
    catch { failedClosed = true; }
    if (!failedClosed) fail(`Freshness negative control accepted a stale ${label} identity.`);
    rejected[`${label.replaceAll(/[^a-zA-Z0-9]/g, '')}Rejected`] = true;
  }
  return rejected;
}

export async function writeFixtureValidationAttestation(id, attestation) {
  if (!PLAN35_CHECKPOINT_IDS.includes(id)) fail(`Unsupported Plan 35 validation target: ${id}`);
  const index = await readFixtureValidationIndex({ allowMissing: true });
  if (index.protocol !== 'qp35.fixture-validation-index.v1' || !index.entries || typeof index.entries !== 'object'
      || Array.isArray(index.entries) || Object.keys(index.entries).some((key) => !PLAN35_CHECKPOINT_IDS.includes(key))) {
    fail('Existing fixture-validation index is malformed or contains unsupported checkpoints.');
  }
  index.entries[id] = attestation;
  index.updatedAt = new Date().toISOString();
  await writeFixtureValidationIndex(index);
}
