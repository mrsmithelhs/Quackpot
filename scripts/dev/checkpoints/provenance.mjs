import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const CATALOG_PATH = 'scripts/dev/checkpoints/catalog.json';
export const PLAN16 = 'reports/development/plan-16-deterministic-review-checkpoints';
export const PLAN35 = 'reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot';
export const STORAGE_KEY = 'quackpot_save_v1';
export const MAX_FIXTURE_BYTES = 1024 * 1024;
export const MAX_FIXTURE_TOTAL_BYTES = 2 * 1024 * 1024;
export const MAX_ARCHIVE_FILE_BYTES = 1024 * 1024;
export const MAX_ARCHIVE_TOTAL_BYTES = 2 * 1024 * 1024;

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
  const currentFingerprint = sha256(JSON.stringify({ files: current, recipeFingerprint: reference.captureRecipeSha256 }));
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
      || !/^[a-f0-9]{64}$/.test(current.captureRecipeSha256 ?? '')
      || !/^[a-f0-9]{64}$/.test(current.loaderSha256 ?? '')) fail('Current checkpoint identity fields are incomplete or malformed.');
  if (JSON.stringify(provenance.sourceFiles) !== JSON.stringify(current.sourceFiles)) fail('Captured checkpoint is stale for production source closure.');
  if (provenance.sourceClosureSha256 !== sha256(JSON.stringify(current.sourceFiles))) fail('Captured checkpoint source closure fingerprint is stale.');
  if (provenance.productionSourceFingerprint !== current.productionSourceFingerprint) fail('Captured checkpoint production source fingerprint is stale.');
  if (provenance.captureRecipe?.sha256 !== current.captureRecipeSha256) fail('Captured checkpoint capture recipe identity is stale.');
  if (provenance.loaderSha256 !== current.loaderSha256) fail('Captured checkpoint loader identity is stale.');
}

export async function validateFreshness(entry) {
  if (entry.status !== 'current-loadable') fail(`Checkpoint is not current-loadable: ${entry.fixture} (${entry.status})`);
  if (!entry.provenance?.sourceClosureSha256 || !entry.provenance?.sourceFiles
      || !entry.provenance?.productionSourceFingerprint || !entry.provenance?.captureRecipe?.file
      || !entry.provenance?.captureRecipe?.sha256 || !entry.provenance?.loaderSha256) {
    fail('Current-loadable checkpoint is missing required source, recipe, loader, or closure identity.');
  }
  {
    const catalog = await readCatalog();
    assertCaptureParent(catalog, entry);
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
    const recipePath = entry.provenance.captureRecipe?.file;
    if (!recipePath) fail('Captured checkpoint capture recipe identity is absent.');
    const recipeBytes = await readBounded(recipePath, 256 * 1024);
    const recipeSha256 = sha256(recipeBytes);
    const loaderSha256 = await currentLoaderSha256();
    const current = { sourceFiles: pinnedClosure.currentFiles, productionSourceFingerprint: pinnedClosure.expectedFingerprint,
      captureRecipeSha256: recipeSha256, loaderSha256 };
    assertCurrentIdentity(entry, current);
    return { loaderSha256, sourceClosureSha256: entry.provenance.sourceClosureSha256,
      captureRecipeSha256: recipeSha256 };
  }
  const loaderHash = await currentLoaderSha256();
  if (entry.provenance?.loaderSha256 && entry.provenance.loaderSha256 !== loaderHash) fail('Captured checkpoint is stale for current loader identity.');
  return { loaderSha256: loaderHash, sourceClosureSha256: entry.provenance?.sourceClosureSha256 ?? null };
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
