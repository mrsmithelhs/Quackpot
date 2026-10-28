// Review/authoring tooling (NOT runtime, NOT imported by src/): loads the frozen Plan 10 baseline from git
// by blob id, verifies it, and evaluates its generators in plain Node so the extracted kit can be compared
// against the original without a browser. Fails loudly if the recorded blob ids do not match.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const PLAN10_DIR = 'reports/development/plan-10-metagame-duck-cinematography';
export const FROZEN = {
  commit: '768945e',
  preview: { path: `${PLAN10_DIR}/preview.html`, blob: 'f304ff9f8ebd844973a98fd915ecb7c124e97029' },
  duckViews: { path: `${PLAN10_DIR}/duck-views.js`, blob: 'a48c0e210de27e5b4cbbd1a6b933942f30a2f4e3' }
};

function gitBlob(blob) {
  return execFileSync('git', ['cat-file', 'blob', blob], { cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 });
}
/** Throws unless `buf` hashes to the git blob id `blob`. */
export function verifyBuffer(buf, blob, label = 'buffer') {
  const id = createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');
  if (id !== blob) throw new Error(`Frozen baseline mismatch for ${label}: expected blob ${blob}, got ${id}`);
  return buf;
}
function verifiedText(entry) {
  return verifyBuffer(gitBlob(entry.blob), entry.blob, entry.path).toString('utf8');
}

export const SCRIPT_START = '  let svgInstance = 0;';
export const SCRIPT_END = '  function update() {';
export const BASELINE_NAMES = ['uniq', 'renderViewSvg', 'inner', 'PX_MM', 'PHONE_MM', 'DUCK_SCALE', 'DUCK_CX', 'sceneDefs', 'phoneFace', 'sideDeskScene', 'topDuckInner', 'topDeskScene',
  'F', 'CX', 'DUCK_UNITS_PER_MM', 'proj', 'put', 'R', 'Ci', 'El', 'Pg', 'Pa', 'NS',
  'art', 'windowMm', 'plant', 'mug', 'sofa', 'coffeeTable', 'tvUnit', 'floorLamp', 'fridge', 'cabinetRun', 'stove', 'pot', 'hood', 'upperCabs', 'clock', 'kettle', 'toaster', 'jars', 'bar', 'stool', 'fruit', 'pendant',
  'bed', 'bedside', 'bedLamp', 'clockSmall', 'toyShelf', 'sc_', 'teddy', 'block', 'robot', 'truck', 'rings', 'ball', 'bunny', 'magazines', 'ROOM_SPECS', 'roomScene'];

let cache = null;
/** Verified frozen sources plus the evaluated baseline generators (fresh instance counter each call). */
export function loadBaseline() {
  if (!cache) {
    const previewText = verifiedText(FROZEN.preview);
    const duckViewsText = verifiedText(FROZEN.duckViews);
    cache = { previewText, duckViewsText };
  }
  const { previewText, duckViewsText } = cache;
  const views = new Function(`${duckViewsText.replace('export const views =', 'const views =')}\nreturn views;`)();
  const a = previewText.indexOf(SCRIPT_START), b = previewText.indexOf(SCRIPT_END);
  if (a < 0 || b < 0 || b < a) throw new Error('Frozen preview script markers not found');
  const body = previewText.slice(a, b);
  const api = new Function('views', `${body}\nreturn { ${BASELINE_NAMES.join(', ')} };`)(views);
  return { previewText, duckViewsText, views, api, lines: previewText.split('\n') };
}
