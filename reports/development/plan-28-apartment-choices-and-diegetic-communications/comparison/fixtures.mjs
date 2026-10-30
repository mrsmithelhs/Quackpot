// Plan 28 report-local prototype: load a Plan 35 rent fixture in memory against Plan 35's current validation pins.
// Canonical input = fixture-validation-index.json (exact bytes + SHA-256 + recorded valid result) and the catalog
// boundary. Capture origin is not re-derived here. A mismatch stops with expected/actual; there is no synthetic fallback.
// No storage APIs are touched: bytes come from the caller's reader (same-origin fetch in the page, fs in Node tests).

import { GameEngine } from '../../../../src/core/game-engine.mjs';
import { validateSave } from '../../../../src/core/storage.mjs';

export const VALIDATION_INDEX = 'reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/fixture-validation-index.json';
export const CATALOG = 'scripts/dev/checkpoints/catalog.json';
export const RENT_FIXTURES = Object.freeze({
  'rent-paid-zero': 'plan35.rent-paid-zero.v1',
  'rent-unpaid': 'plan35.rent-unpaid-escalation.v1',
});

async function sha256Hex(bytes) {
  // Browsers and Node >= 19 expose Web Crypto globally; older Node needs the explicit module.
  const subtle = globalThis.crypto?.subtle ?? (await import('node:crypto')).webcrypto.subtle;
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const decodeJson = (bytes) => JSON.parse(new TextDecoder().decode(bytes));

/**
 * @param {string} key  one of RENT_FIXTURES
 * @param {(repoPath: string) => Promise<Uint8Array>} readRepoFile
 * @returns {{ ok: boolean, checks: {name, expected, actual, pass}[], engine?: GameEngine, checkpointId: string }}
 */
export async function loadRentFixture(key, readRepoFile) {
  const checkpointId = RENT_FIXTURES[key];
  if (!checkpointId) throw new RangeError(`Unknown rent fixture "${key}"`);
  const checks = [];
  const check = (name, expected, actual) => {
    const pass = JSON.stringify(expected) === JSON.stringify(actual);
    checks.push({ name, expected, actual, pass });
    return pass;
  };

  const index = decodeJson(await readRepoFile(VALIDATION_INDEX));
  const catalog = decodeJson(await readRepoFile(CATALOG));
  const pin = index.entries?.[checkpointId];
  const entry = catalog.checkpoints?.[checkpointId];
  if (!check('validation index entry present', true, Boolean(pin))) return { ok: false, checks, checkpointId };
  if (!check('catalog entry present', true, Boolean(entry))) return { ok: false, checks, checkpointId };
  check('catalog status', 'current-loadable', entry.status);
  check('recorded validation result', true, pin.result?.valid === true);
  check('catalog and index name the same fixture', pin.fixture.path, entry.fixture);

  const bytes = await readRepoFile(pin.fixture.path);
  check('fixture bytes', pin.fixture.bytes, bytes.byteLength);
  check('fixture sha256', pin.fixture.sha256, await sha256Hex(bytes));
  if (!checks.every((c) => c.pass)) return { ok: false, checks, checkpointId };

  const envelope = decodeJson(bytes);
  const validation = validateSave(envelope);
  check('validateSave (src/core/storage.mjs)', { valid: true, errors: [] }, { valid: validation.valid, errors: validation.errors });
  check('recorded event count', pin.result.eventCount, envelope.eventLog.length);
  check('recorded chain head', pin.result.chainHead, envelope.eventLog.at(-1)?.chain);
  for (const [field, expected] of Object.entries(entry.boundary)) check(`boundary ${field}`, expected, envelope.state[field]);
  if (!checks.every((c) => c.pass)) return { ok: false, checks, checkpointId };

  const engine = GameEngine.fromEnvelope(envelope);
  engine.autosaveEnabled = false; // the prototype never calls saveGame; this only documents intent
  return { ok: true, checks, engine, checkpointId };
}
