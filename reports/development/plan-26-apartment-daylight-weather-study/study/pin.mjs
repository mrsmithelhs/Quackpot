// Plan 26 (report tooling, not runtime): verifies that the delivered Plan 24 kit under src/assets/apartment/ is exactly the
// pinned source. Hashes are git blob ids of the LF-normalised file bytes, so a Windows checkout with CRLF still verifies.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '../../../..');
export const KIT_DIR = path.join(REPO_ROOT, 'src/assets/apartment');
export const PIN_FILE = path.join(HERE, '..', 'pinned-kit.json');

export function blobId(buffer) {
  const lf = Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  return crypto.createHash('sha1').update(`blob ${lf.length}\0`).update(lf).digest('hex');
}

export function listKitFiles(dir = KIT_DIR, base = KIT_DIR) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listKitFiles(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  }).sort();
}

/** Returns { ok, problems[] }; never throws for a mismatch (the caller decides). */
export function verifyPinnedKit(pinOverride) {
  const pin = pinOverride ?? JSON.parse(fs.readFileSync(PIN_FILE, 'utf8'));
  const problems = [];
  const actual = listKitFiles();
  for (const f of Object.keys(pin.files)) if (!actual.includes(f)) problems.push(`missing: ${f}`);
  for (const f of actual) if (!(f in pin.files)) problems.push(`unpinned file: ${f}`);
  for (const f of actual) if (f in pin.files) { const id = blobId(fs.readFileSync(path.join(KIT_DIR, f))); if (id !== pin.files[f]) problems.push(`changed: ${f} (${id.slice(0, 8)} != ${pin.files[f].slice(0, 8)})`); }
  return { ok: problems.length === 0, problems, commit: pin.commit, files: actual.length };
}

export function assertPinnedKit() {
  const r = verifyPinnedKit();
  if (!r.ok) throw new Error(`Plan 26: delivered kit differs from the pin ${r.commit}:\n  ${r.problems.join('\n  ')}`);
  return r;
}
