import { appendFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { assertCatalogBoundary, assertNegativeControls, validateAndHydrate } from './envelope.mjs';
import {
  MAX_FIXTURE_TOTAL_BYTES, PLAN35, ROOT, assertFreshnessNegativeControls, assertValidationAttestationNegativeControls,
  catalogEntry, currentLoaderSha256, currentValidationLoaderSha256,
  assertCaptureParent, assertValidationResultMatches, readBounded, readCatalog, readFixtureBeforeParse,
  readPinnedPilotEvidenceRecord, resolveRepoPath, sha256, verifyPinnedPlan16Archive,
  verifyCaptureOrigin, verifyPlan16SourceClosure, validateFreshness, validateFixtureBase,
  writeFixtureValidationAttestation,
} from './provenance.mjs';

const fail = (message) => { throw new Error(message); };
const resultsPath = path.join(ROOT, PLAN35, 'pilot-results.jsonl');

async function appendResult(record) {
  const current = await stat(resultsPath).catch((error) => error.code === 'ENOENT' ? null : Promise.reject(error));
  const line = `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`;
  if (Buffer.byteLength(line) > 1024 * 1024 || (current && current.size + Buffer.byteLength(line) > 1024 * 1024)) fail('Plan 35 pilot result log exceeds 1 MiB.');
  if (current) {
    const prior = await readBounded(`${PLAN35}/pilot-results.jsonl`, 1024 * 1024);
    for (const row of prior.toString('utf8').split(/\r?\n/).filter(Boolean)) JSON.parse(row);
  }
  await mkdir(path.dirname(resultsPath), { recursive: true });
  await appendFile(resultsPath, line, 'utf8');
  return { file: `${PLAN35}/pilot-results.jsonl`, bytes: Buffer.byteLength(line), sha256: sha256(Buffer.from(line)) };
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
  const freshness = await validateFreshness(entry, id);
  const negativeFreshness = assertFreshnessNegativeControls(entry, freshness);
  const negativeAttestation = assertValidationAttestationNegativeControls(entry, id,
    freshness.validationAttestation, freshness);
  const fixture = await readFixtureBeforeParse(entry);
  const envelope = JSON.parse(fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  assertCatalogBoundary(id, entry, envelope);
  const negativeControls = { ...assertNegativeControls(envelope), ...negativeFreshness, ...negativeAttestation };
  const record = { phase: 'fixture-preflight', id, class: entry.class, status: entry.status,
    bytes: fixture.bytes.length, sha256: fixture.hash, freshness, validation, negativeControls };
  await appendResult(record);
  return record;
}

async function revalidate(id) {
  const catalog = await readCatalog();
  const entry = catalogEntry(catalog, id);
  assertCaptureParent(catalog, entry);
  await verifyPinnedPlan16Archive(catalog);
  const current = await validateFixtureBase(entry, id);
  const envelope = JSON.parse(current.fixture.raw);
  const validation = validateAndHydrate(envelope, id);
  assertCatalogBoundary(id, entry, envelope);
  const negativeControls = { ...assertNegativeControls(envelope), ...assertFreshnessNegativeControls(entry, current) };
  const attestationBase = {
    protocol: 'qp35.fixture-validation.v1', checkpointId: id,
    fixture: { path: entry.fixture, bytes: current.fixture.bytes.length, sha256: current.fixture.hash },
    captureOrigin: { captureRevision: current.captureOrigin.captureRevision,
      captureRecipeFile: current.captureOrigin.captureRecipeFile, captureRecipeSha256: current.captureOrigin.captureRecipeSha256,
      loaderSha256: current.captureOrigin.loaderSha256, manifestSha256: current.captureOrigin.manifestSha256 },
    productionSourceFingerprint: current.productionSourceFingerprint,
    sourceClosureSha256: current.sourceClosureSha256,
    validationLoaderSha256: current.validationLoaderSha256,
    result: { valid: true, boundaryMatched: true, envelopeValid: validation.validation.valid,
      errors: validation.validation.errors, eventCount: validation.eventCount, chainHead: validation.chainHead, negativeControls },
  };
  const attestationNegativeControls = assertValidationAttestationNegativeControls(entry, id, attestationBase, current,
    { requireRecordPin: false });
  const finalNegativeControls = { ...negativeControls, ...attestationNegativeControls };
  const record = { phase: 'fixture-revalidation', id,
    fixture: attestationBase.fixture, captureOrigin: attestationBase.captureOrigin,
    productionSourceFingerprint: current.productionSourceFingerprint,
    sourceClosureSha256: current.sourceClosureSha256,
    validationLoaderSha256: current.validationLoaderSha256,
    result: { valid: true, boundaryMatched: true, negativeControls: finalNegativeControls, validation } };
  // Confirm the final positive attestation shape before appending a successful result record.
  const stagedAttestation = { ...attestationBase,
    result: { ...attestationBase.result, negativeControls: finalNegativeControls } };
  assertValidationAttestation(entry, id, stagedAttestation, current, { requireRecordPin: false });
  const stagedNegativeControls = assertValidationAttestationNegativeControls(entry, id, stagedAttestation, current,
    { requireRecordPin: false });
  if (JSON.stringify(stagedNegativeControls) !== JSON.stringify(attestationNegativeControls)) {
    fail('Validation-attestation negative controls changed while building the result record.');
  }
  assertValidationResultMatches(stagedAttestation, record);
  const recordPin = await appendResult(record);
  const attestation = { ...attestationBase,
    result: { ...attestationBase.result, negativeControls: finalNegativeControls }, recordPin };
  // Verify the pinned record and full attestation before publishing the index entry.
  const storedRecord = await readPinnedPilotEvidenceRecord(recordPin);
  assertValidationAttestation(entry, id, attestation, current);
  assertValidationAttestationNegativeControls(entry, id, attestation, current);
  assertValidationResultMatches(attestation, storedRecord);
  await writeFixtureValidationAttestation(id, attestation);
  await validateFreshness(entry, id);
  return { phase: 'fixture-revalidation', id, fixture: attestation.fixture,
    captureOrigin: attestation.captureOrigin, validationLoaderSha256: attestation.validationLoaderSha256,
    negativeControls: finalNegativeControls, recordPin };
}

async function auditCaptureOrigins() {
  const catalog = await readCatalog();
  const ids = ['plan35.rent-paid-zero.v1', 'plan35.rent-unpaid-escalation.v1', 'plan35.finale-race-entry.v1'];
  const origins = [];
  for (const id of ids) {
    const entry = catalogEntry(catalog, id);
    const origin = await verifyCaptureOrigin(id, entry);
    origins.push({ checkpointId: id, captureRevision: origin.captureRevision,
      captureRecipeSha256: origin.captureRecipeSha256, loaderSha256: origin.loaderSha256,
      manifestSha256: origin.manifestSha256 });
  }
  return { phase: 'capture-origin-audit', origins };
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
  if (command === 'revalidate' && id) {
    const result = await revalidate(id);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return;
  }
  if (command === 'origin-audit' && !id) {
    process.stdout.write(`${JSON.stringify(await auditCaptureOrigins())}\n`);
    return;
  }
  if (command === 'loader-identity') {
    process.stdout.write(`${JSON.stringify({ loaderSha256: await currentLoaderSha256(),
      validationLoaderSha256: await currentValidationLoaderSha256() })}\n`);
    return;
  }
  fail('Usage: checkpoint-proof.mjs reference <Plan16-id> | fixture <Plan35-id> | revalidate <Plan35-id> | origin-audit | loader-identity');
}

main().catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
