import { appendFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { assertCatalogBoundary, assertNegativeControls, validateAndHydrate } from './envelope.mjs';
import {
  MAX_FIXTURE_TOTAL_BYTES, PLAN35, ROOT, assertFreshnessNegativeControls, catalogEntry, currentLoaderSha256,
  assertCaptureParent, readCatalog, readFixtureBeforeParse, resolveRepoPath, sha256, verifyPinnedPlan16Archive,
  verifyPlan16SourceClosure, validateFreshness,
} from './provenance.mjs';

const fail = (message) => { throw new Error(message); };
const resultsPath = path.join(ROOT, PLAN35, 'pilot-results.jsonl');

async function appendResult(record) {
  const current = await stat(resultsPath).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  const line = `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`;
  if (current && current.size + Buffer.byteLength(line) > 1024 * 1024) fail('Plan 35 pilot result log exceeds 1 MiB.');
  if (current) {
    const prior = await readBounded(`${PLAN35}/pilot-results.jsonl`, 1024 * 1024);
    for (const row of prior.toString('utf8').split(/\r?\n/).filter(Boolean)) JSON.parse(row);
  }
  await mkdir(path.dirname(resultsPath), { recursive: true });
  await appendFile(resultsPath, line, 'utf8');
}

async function reference(id) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  if (entry.status === 'historical-reference' && id === 'qp16.pending-reveal.v1') {
    const fixture = await readFixtureBeforeParse(entry);
    const envelope = JSON.parse(fixture.raw);
    const validation = validateAndHydrate(envelope, id);
    const record = { phase: 'historical-reference', id, class: entry.class, status: entry.status,
      fixture: { bytes: fixture.bytes.length, sha256: fixture.hash }, validation,
      reuseLimit: 'Historical generated evidence only; current generated reuse remains stale by its recorded recipe.' };
    await appendResult(record);
    return record;
  }
  if (id !== 'qp16.starter-offer.v1') fail(`Unsupported Plan 16 reference: ${id}`);
  const archive = await verifyPinnedPlan16Archive(catalog);
  const closure = await verifyPlan16SourceClosure(catalog, { requireCurrent: false });
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  const currentLoadable = closure.matches;
  const record = { phase: 'historical-reference', id, class: entry.class,
    status: currentLoadable ? 'historical-reference-current-source-match' : 'historical-reference-source-stale',
    fixture: { bytes: fixture.bytes.length, sha256: fixture.hash }, archive, sourceClosure: closure,
    validation, reuseLimit: 'Capture and loader identities remain distinct; historical browser branches used the earlier loader.' };
  await appendResult(record);
  return record;
}

async function fixture(id) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  assertCaptureParent(catalog, entry);
  await verifyPinnedPlan16Archive(catalog);
  const freshness = await validateFreshness(entry);
  const negativeFreshness = assertFreshnessNegativeControls(entry, {
    sourceFiles: entry.provenance.sourceFiles,
    productionSourceFingerprint: entry.provenance.productionSourceFingerprint,
    captureRecipeSha256: freshness.captureRecipeSha256,
    loaderSha256: freshness.loaderSha256,
  });
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  assertCatalogBoundary(id, entry, envelope);
  const negativeControls = { ...assertNegativeControls(envelope), ...negativeFreshness };
  const record = { phase: 'fixture-preflight', id, class: entry.class, status: entry.status,
    bytes: fixture.bytes.length, sha256: fixture.hash, freshness, validation, negativeControls };
  await appendResult(record);
  return record;
}

async function main() {
  const [, , command, id] = process.argv;
  if (command === 'reference' && id) {
    const result = await reference(id);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (command === 'fixture' && id) {
    const catalog = await readCatalog();
    const newEntries = Object.values(catalog.checkpoints ?? {}).filter((item) => item.status !== 'not-captured');
    let bytes = 0;
    for (const item of newEntries) {
      if (!item.fixture) fail('Captured catalog entry has no fixture path.');
      const info = await stat(resolveRepoPath(item.fixture));
      if (!info.isFile() || info.size > catalog.limits.newFixtureBytesMaximum) fail(`Fixture exceeds per-file cap before loading: ${item.fixture}`);
      bytes += info.size;
      if (bytes > MAX_FIXTURE_TOTAL_BYTES || bytes > catalog.limits.newFixturesAggregateBytesMaximum) fail('Plan 35 fixture aggregate exceeds its 2 MiB cap.');
    }
    const result = await fixture(id);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (command === 'loader-identity') {
    process.stdout.write(`${JSON.stringify({ loaderSha256: await currentLoaderSha256() })}\n`);
    return;
  }
  fail('Usage: checkpoint-proof.mjs reference <Plan16-id> | fixture <Plan35-id> | loader-identity');
}

main().catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
