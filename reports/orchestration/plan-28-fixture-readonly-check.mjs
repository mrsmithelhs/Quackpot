// Root review driver: canonical Plan35 fixture validation, with no log/index/save writes.
import { stat } from 'node:fs/promises';
import {
  MAX_FIXTURE_BYTES, MAX_FIXTURE_TOTAL_BYTES, readCatalog, catalogEntry,
  resolveRepoPath, validateFreshness, readFixtureBeforeParse,
  assertFreshnessNegativeControls, assertValidationAttestationNegativeControls,
} from '../../scripts/dev/checkpoints/provenance.mjs';
import {
  validateAndHydrate, assertCatalogBoundary, assertNegativeControls,
} from '../../scripts/dev/checkpoints/envelope.mjs';

async function main() {
  const catalog = await readCatalog();
  let total = 0;
  for (const entry of Object.values(catalog.checkpoints).filter(e => e.status !== 'not-captured')) {
    const info = await stat(resolveRepoPath(entry.fixture));
    if (!info.isFile() || info.size > MAX_FIXTURE_BYTES) throw new Error('Fixture exceeds file cap.');
    total += info.size;
    if (total > MAX_FIXTURE_TOTAL_BYTES) throw new Error('Fixture aggregate exceeds cap.');
  }
  const results = [];
  for (const id of ['plan35.rent-paid-zero.v1', 'plan35.rent-unpaid-escalation.v1']) {
    const entry = catalogEntry(catalog, id);
    const freshness = await validateFreshness(entry, id);
    const fixture = await readFixtureBeforeParse(entry);
    const envelope = JSON.parse(fixture.raw);
    const validation = validateAndHydrate(envelope, id);
    assertCatalogBoundary(id, entry, envelope);
    const controls = {
      ...assertNegativeControls(envelope),
      ...assertFreshnessNegativeControls(entry, freshness),
      ...assertValidationAttestationNegativeControls(entry, id, freshness.validationAttestation, freshness),
    };
    results.push({ id, bytes: fixture.bytes.length, sha256: fixture.hash,
      validationLoaderSha256: freshness.validationLoaderSha256,
      captureOriginManifestSha256: freshness.captureOrigin.manifestSha256,
      valid: validation.validation.valid, chainHead: validation.chainHead,
      boundaryMatched: true, negativeControls: controls });
  }
  const output = JSON.stringify({ mode: 'read-only canonical preflight; no evidence-log append', results });
  if (Buffer.byteLength(output) > 8192) throw new Error('Summary exceeds 8KiB.');
  process.stdout.write(`${output}\n`);
}

main().catch(error => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
