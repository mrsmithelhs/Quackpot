// Plan 26 report tool: writes pinned-kit.json from the kit as committed at PIN_COMMIT (git blob ids), after checking that the
// working copy already matches that commit. Usage (repo root): node reports/development/plan-26-apartment-daylight-weather-study/tools/pin-kit.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { REPO_ROOT, PIN_FILE, KIT_DIR, listKitFiles, blobId } from '../study/pin.mjs';
import path from 'node:path';

const PIN_COMMIT = '5237a2a';   // last commit that touched src/assets/apartment/ (Plan 24)
const git = (...a) => execFileSync('git', a, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
const full = git('rev-parse', PIN_COMMIT);
const tree = git('ls-tree', '-r', PIN_COMMIT, 'src/assets/apartment').split('\n').map(l => { const [, , rest] = l.split(' '); const [blob, file] = rest.split('\t'); return [file.replace('src/assets/apartment/', ''), blob]; });
const files = Object.fromEntries(tree.sort(([a], [b]) => (a < b ? -1 : 1)));
const mismatch = [];
for (const f of listKitFiles()) { const id = blobId(fs.readFileSync(path.join(KIT_DIR, f))); if (files[f] !== id) mismatch.push(f); }
if (mismatch.length || Object.keys(files).length !== listKitFiles().length) { console.error('working copy differs from', PIN_COMMIT, mismatch); process.exit(1); }
fs.writeFileSync(PIN_FILE, JSON.stringify({ note: 'Plan 26 pin of the delivered Plan 24 kit (src/assets/apartment/); git blob ids of LF-normalised files', commit: full, files }, null, 2) + '\n');
console.log('pinned', Object.keys(files).length, 'files at', full);
