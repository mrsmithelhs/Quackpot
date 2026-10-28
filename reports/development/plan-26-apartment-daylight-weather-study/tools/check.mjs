// Plan 26 source checks (Node). Usage (repo root): node reports/development/plan-26-apartment-daylight-weather-study/tools/check.mjs
// Covers: pinned kit, no-effect identity with the kit, option precedence, exact-anchor failures, XML/ID validity, two instances,
// structural preservation of lamp and duck markup, no animation constructs, keyed-geometry checks against the kit's own specs.
import { execFileSync } from 'node:child_process';
import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { ROOM_SPECS } from '../../../../src/assets/apartment/rooms/specs.mjs';
import { windowMm } from '../../../../src/assets/apartment/props/index.mjs';
import { renderStudyScene } from '../study/scene.mjs';
import { resolveStudyOptions } from '../study/options.mjs';
import { insertAt, stripInserted, insertedNames, AnchorError } from '../study/anchors.mjs';
import { WINDOW, KEYED_ITEMS, patchQuads } from '../study/daylight.mjs';
import { verifyPinnedKit, REPO_ROOT, listKitFiles, KIT_DIR, blobId } from '../study/pin.mjs';
import { checkWellFormed, idReport } from './xml.mjs';
import fs from 'node:fs';
import path from 'node:path';

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { if (cond) { pass++; console.log('ok  ', name); } else { fail++; console.log('FAIL', name, detail); } };
const throws = (name, fn, cls, re) => { try { fn(); ok(name, false, 'did not throw'); } catch (e) { ok(name, (!cls || e instanceof cls) && (!re || re.test(e.message)), e.message); } };

// --- pin ---------------------------------------------------------------------------------------------
const pin = verifyPinnedKit();
ok(`pinned kit verified (${pin.files} files, ${pin.commit.slice(0, 7)})`, pin.ok, pin.problems.join('; '));
const git = (...a) => execFileSync('git', a, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
const committed = Object.fromEntries(git('ls-tree', '-r', pin.commit, 'src/assets/apartment').split('\n').map(l => { const [, , r] = l.split(' '); const [b, f] = r.split('\t'); return [f.replace('src/assets/apartment/', ''), b]; }));
ok('pin matches git blobs of the pinned commit', listKitFiles().every(f => committed[f] === blobId(fs.readFileSync(path.join(KIT_DIR, f)))) && Object.keys(committed).length === listKitFiles().length);
ok('kit unchanged in the working tree since the pin', git('status', '--porcelain', '--', 'src/assets/apartment') === '');
{ const p = JSON.parse(fs.readFileSync(new URL('../pinned-kit.json', import.meta.url), 'utf8')); const f = Object.keys(p.files)[0];
  ok('negative control: a tampered pin hash is detected', !verifyPinnedKit({ ...p, files: { ...p.files, [f]: '0'.repeat(40) } }).ok);
  const { [f]: _gone, ...rest } = p.files; ok('negative control: a missing pinned entry is detected', !verifyPinnedKit({ ...p, files: rest }).ok); }

// --- keyed geometry against the kit's own spec -------------------------------------------------------
const living = ROOM_SPECS.living.items({ couch: 'present', tv: 'present' });
const at = (X, z) => living.find(i => i.X === X && i.z === z);
ok('window keyed to the kit spec (position and windowMm(900,800))', (() => { const w = at(WINDOW.X, WINDOW.z); return w && w.Y === WINDOW.Y && w.mm === windowMm(WINDOW.w, WINDOW.h); })());
ok('sofa/tv/plant/lamp keyed to kit spec positions', Object.values(KEYED_ITEMS).every(k => at(k.X, k.z)));
ok('four sun-patch quads', patchQuads().length === 4);

// --- identity: no-effect output equals the kit ------------------------------------------------------
const areas = ['living', 'kitchen', 'bedroom', 'desk-side', 'desk-top'];
let identical = 0, total = 0;
for (const area of areas) for (const light of ['neutral', 'window', 'warm']) for (const framing of ['wide', 'medium']) for (const duckView of ['front', 'side', 'rear', 'high', 'low', 'top']) {
  const o = { area, idPrefix: 'idt', light, framing, duckView }; total++;
  if (renderStudyScene(o).svg === renderScene(o).svg) identical++;
}
ok(`no-effect wrapper output is byte-identical to the kit (${identical}/${total} option combinations)`, identical === total);
for (const furn of [{ couch: 'removed', tv: 'removed' }, { couch: 'removed', tv: 'present' }, { couch: 'present', tv: 'removed' }]) { const o = { area: 'living', idPrefix: 'idt', furnishings: furn }; ok(`identity with furnishings ${JSON.stringify(furn)}`, renderStudyScene(o).svg === renderScene(o).svg); }
ok('explicit overlay none passes through', renderStudyScene({ area: 'living', idPrefix: 'idt', light: 'warm', overlay: 'none' }).svg === renderScene({ area: 'living', idPrefix: 'idt', light: 'warm', overlay: 'none' }).svg);

// --- precedence -------------------------------------------------------------------------------------
const r1 = resolveStudyOptions({ daylight: 'sun', light: 'window' });
ok('sun + window: window wash suppressed (effective neutral), reported', r1.effective.sun && r1.effective.kitLight === 'neutral' && r1.notes.some(n => n.startsWith('R2')));
ok('sun + neutral: effective sun, no notes', (() => { const r = resolveStudyOptions({ daylight: 'sun' }); return r.effective.sun && r.notes.length === 0; })());
throws('sun + warm lamp rejected (Stage 3 pairing)', () => resolveStudyOptions({ daylight: 'sun', light: 'warm' }), RangeError, /R3/);
throws('weather stills rejected in this stage (rain)', () => resolveStudyOptions({ weather: 'rain' }), RangeError, /R4/);
throws('sun + overcast: weather rule R1 evaluated, then Stage 3 rejection', () => resolveStudyOptions({ daylight: 'sun', weather: 'overcast' }), RangeError, /R4/);
throws('unknown daylight rejected', () => resolveStudyOptions({ daylight: 'noon' }), RangeError);
throws('daylight outside the living room rejected', () => renderStudyScene({ area: 'kitchen', idPrefix: 'k1', daylight: 'sun' }), RangeError, /living-room only/);

// --- sun variants -----------------------------------------------------------------------------------
const base = { area: 'living', idPrefix: 'sun1' };
for (const strength of ['restrained', 'strong']) for (const framing of ['wide', 'medium']) for (const light of ['neutral', 'window']) for (const duckView of ['front', 'side', 'rear']) {
  const o = { ...base, framing, light, duckView, daylight: 'sun', strength };
  const r = renderStudyScene(o), kit = renderScene({ ...base, framing, light: 'neutral', duckView });
  const tag = `${strength}/${framing}/${light}/${duckView}`;
  if (duckView !== 'side' && light === 'window') continue;
  ok(`sun ${tag}: layers removed -> kit output exactly`, stripInserted(r.svg) === kit.svg);
  ok(`sun ${tag}: well-formed XML`, checkWellFormed(r.svg).ok, checkWellFormed(r.svg).error);
  const ids = idReport(r.svg); ok(`sun ${tag}: ids unique and resolvable`, ids.duplicates.length === 0 && ids.dangling.length === 0, JSON.stringify(ids));
  const dk = s => s.match(/<svg x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" viewBox="0 0 360 270"[\s\S]*?<\/svg>/)?.[0];
  ok(`sun ${tag}: duck markup byte-identical`, dk(r.svg) && dk(r.svg) === dk(kit.svg));
  const glow = s => (s.match(/<g class="o lamp-on lamp-pool"[\s\S]*?<\/g>/g) || []).join('|');
  ok(`sun ${tag}: lamp glow markup byte-identical`, glow(r.svg).length > 0 && glow(r.svg) === glow(kit.svg));
  ok(`sun ${tag}: no animation constructs`, !/<animate|<set |@keyframes|animation\s*:|requestAnimationFrame|<script/i.test(r.svg));
  ok(`sun ${tag}: inserted blocks are the three expected`, insertedNames(r.svg).join() === 'sun-floor,sun-table,sun-atmosphere');
  ok(`sun ${tag}: root viewBox and class unchanged`, r.svg.slice(0, 120) === kit.svg.slice(0, 120));
}
{ const a = renderStudyScene({ ...base, idPrefix: 'inst-a', daylight: 'sun', strength: 'strong' }).svg, b = renderStudyScene({ ...base, idPrefix: 'inst-b', daylight: 'sun', strength: 'restrained', framing: 'medium' }).svg;
  const rep = idReport(a, b); ok('two simultaneous sun instances: ids unique and resolvable', rep.duplicates.length === 0 && rep.dangling.length === 0, JSON.stringify(rep));
  ok('deterministic: identical input -> identical output', renderStudyScene({ ...base, daylight: 'sun' }).svg === renderStudyScene({ ...base, daylight: 'sun' }).svg);
  const sizeKiB = n => (Buffer.byteLength(n) / 1024).toFixed(1); console.log(`size: sun strong wide ${sizeKiB(a)} KiB; kit neutral ${sizeKiB(renderScene({ ...base, idPrefix: 'sz' }).svg)} KiB`); }

// --- missing and ambiguous anchors ------------------------------------------------------------------
const kitSvg = renderScene({ ...base, idPrefix: 'anc' }).svg;
throws('missing anchor rejected', () => insertAt(kitSvg, { name: 'x', anchor: '<nothing-here/>', where: 'after' }, '<g/>'), AnchorError, /matched 0 times/);
throws('ambiguous anchor rejected', () => insertAt(kitSvg, { name: 'x', anchor: '<g class="o lamp-on lamp-pool" ', where: 'after' }, '<g/>'), AnchorError, /matched [2-9]\d* times/);
throws('anchor missing after the kit output changes (rug colour)', () => insertAt(kitSvg.replace('#b8836a', '#000000'), { name: 'rug', anchor: /<polygon points="[^"]*" fill="#b8836a" stroke="#9a6a52" stroke-width="4"\/>/, where: 'after' }, '<g/>'), AnchorError);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
