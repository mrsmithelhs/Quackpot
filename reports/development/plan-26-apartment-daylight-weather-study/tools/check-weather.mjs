// Plan 26 Stage 3 source checks (Node): weather precedence, still-weather variants, structural preservation, absence of animation.
// Usage (repo root): node reports/development/plan-26-apartment-daylight-weather-study/tools/check-weather.mjs
// Structural checks only: they say nothing about whether the weather looks good, and unchanged lamp markup does not mean unchanged lamp
// pixels (the global tint is drawn before the lamp glow but the vignette/tint affect everything beneath it); the browser pass measures that.
import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { renderStudyScene } from '../study/scene.mjs';
import { resolveStudyOptions } from '../study/options.mjs';
import { stripInserted, insertedNames } from '../study/anchors.mjs';
import { checkWellFormed, idReport } from './xml.mjs';

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { if (cond) { pass++; console.log('ok  ', name); } else { fail++; console.log('FAIL', name, detail); } };
const throws = (name, fn, cls, re) => { try { fn(); ok(name, false, 'did not throw'); } catch (e) { ok(name, (!cls || e instanceof cls) && (!re || re.test(e.message)), e.message); } };

// --- precedence ---------------------------------------------------------------------------------------
{ const r = resolveStudyOptions({ daylight: 'sun', weather: 'rain' }); ok('sun + rain: R1 suppresses the sun, effective weather rain', !r.effective.sun && r.effective.weather === 'rain' && r.notes.some(n => n.startsWith('R1')) && !r.noEffect); }
{ const r = resolveStudyOptions({ weather: 'rain', light: 'window' }); ok('rain + window: R2 suppresses the legacy wash (kit neutral)', r.effective.kitLight === 'neutral' && r.notes.some(n => n.startsWith('R2'))); }
{ const r = resolveStudyOptions({ weather: 'storm', light: 'warm' }); ok('storm + lamp accepted: kit warm, overlay none, lamp true, R4 noted', r.effective.kitLight === 'warm' && r.effective.overlay === 'none' && r.effective.lamp && r.notes.some(n => n.startsWith('R4'))); }
{ const r = resolveStudyOptions({ weather: 'storm', light: 'warm', overlay: 'svg' }); ok('storm + lamp with requested overlay svg: overridden and reported', r.effective.overlay === 'none' && r.requested.overlay === 'svg' && r.notes.some(n => /overriding/.test(n))); }
{ const r = resolveStudyOptions({ daylight: 'sun', weather: 'storm', light: 'warm' }); ok('sun + storm + lamp: R1 and R4, effective storm + lamp', !r.effective.sun && r.effective.lamp && r.notes.some(n => n.startsWith('R1')) && r.notes.some(n => n.startsWith('R4'))); }
throws('rain + lamp rejected (not in the named set)', () => resolveStudyOptions({ weather: 'rain', light: 'warm' }), RangeError, /R3/);
throws('overcast + lamp rejected (not in the named set)', () => resolveStudyOptions({ weather: 'overcast', light: 'warm' }), RangeError, /R3/);
throws('sun + lamp rejected', () => resolveStudyOptions({ daylight: 'sun', light: 'warm' }), RangeError, /R3/);
ok('clear sky + lamp, no study effect: kit light passes through', (() => { const r = resolveStudyOptions({ light: 'warm' }); return r.noEffect && r.effective.kitLight === 'warm' && r.effective.overlay === null; })());
ok('clear sky, no study effect, renderStudyScene output equals the kit (warm)', renderStudyScene({ area: 'living', idPrefix: 'id1', light: 'warm' }).svg === renderScene({ area: 'living', idPrefix: 'id1', light: 'warm' }).svg);
throws('unknown weather rejected', () => resolveStudyOptions({ weather: 'hail' }), RangeError);
throws('weather outside the living room rejected', () => renderStudyScene({ area: 'bedroom', idPrefix: 'b1', weather: 'rain' }), RangeError, /living-room only/);
throws('weather in the kitchen with the lamp rejected before area is rendered', () => renderStudyScene({ area: 'kitchen', idPrefix: 'k1', weather: 'storm', light: 'warm' }), RangeError, /living-room only/);

// --- variants -----------------------------------------------------------------------------------------
const streakStats = svg => {
  const d = svg.match(/<g data-p26="rain-streaks"><path d="([^"]*)"/)?.[1]; if (!d) return { n: 0, slant: 0, len: 0 };
  const segs = [...d.matchAll(/M([\d.-]+) ([\d.-]+)L([\d.-]+) ([\d.-]+)/g)].map(m => [Number(m[1]) - Number(m[3]), Number(m[4]) - Number(m[2])]);
  return { n: segs.length, slant: segs.reduce((a, [dx, dy]) => a + Math.atan2(dx, dy) * 180 / Math.PI, 0) / segs.length, len: segs.reduce((a, [dx, dy]) => a + Math.hypot(dx, dy), 0) / segs.length };
};
const countDrops = svg => (svg.match(/<g data-p26="droplets">([\s\S]*?)<\/g>/)?.[1].match(/<ellipse /g) || []).length;
const tintOp = svg => Number(svg.match(/data-p26="weather-tint"[^>]*opacity="([\d.]+)"/)?.[1]);
const skyTop = svg => svg.match(/<linearGradient id="[^"]*-sky"[^>]*><stop offset="0" stop-color="(#\w+)"/)?.[1];
const cells = [['overcast', { weather: 'overcast' }], ['rain', { weather: 'rain' }], ['storm', { weather: 'storm' }], ['storm+lamp', { weather: 'storm', light: 'warm' }]];
const out = {};
for (const [name, o] of cells) for (const framing of ['wide', 'medium']) for (const duckView of ['front', 'side', 'rear']) for (const furn of [{ couch: 'present', tv: 'present' }, { couch: 'removed', tv: 'removed' }]) {
  if (furn.couch === 'removed' && !(framing === 'wide' && duckView === 'side')) continue;
  const opts = { area: 'living', idPrefix: 'wx1', framing, duckView, furnishings: furn, ...o }, r = renderStudyScene(opts), e = r.study.effective, tag = `${name}/${framing}/${duckView}${furn.couch === 'removed' ? '/removed' : ''}`;
  const kit = renderScene({ area: 'living', idPrefix: 'wx1', framing, duckView, furnishings: furn, light: e.kitLight, ...(e.overlay ? { overlay: e.overlay } : {}) });
  out[tag] = r.svg;
  ok(`weather ${tag}: layers removed -> kit output for the effective kit options`, stripInserted(r.svg) === kit.svg);
  ok(`weather ${tag}: well-formed XML`, checkWellFormed(r.svg).ok, checkWellFormed(r.svg).error);
  const ids = idReport(r.svg); ok(`weather ${tag}: ids unique and resolvable`, ids.duplicates.length === 0 && ids.dangling.length === 0, JSON.stringify(ids));
  const dk = t => t.match(/<svg x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" viewBox="0 0 360 270"[\s\S]*?<\/svg>/)?.[0];
  ok(`weather ${tag}: duck markup byte-identical`, dk(r.svg) && dk(r.svg) === dk(kit.svg));
  const glow = t => (t.match(/<g class="o lamp-on lamp-pool"[\s\S]*?<\/g>/g) || []).join('|');
  ok(`weather ${tag}: lamp glow markup byte-identical`, glow(r.svg).length > 0 && glow(r.svg) === glow(kit.svg));
  ok(`weather ${tag}: no animation, timing or flash constructs`, !/<animate|<set |@keyframes|animation\s*:|transition\s*:|requestAnimationFrame|setTimeout|<script|flash|lightning|bolt/i.test(r.svg));
  ok(`weather ${tag}: three inserted blocks, sun not effective`, insertedNames(r.svg).join() === 'wx-floor,wx-window,wx-atmosphere' && !e.sun);
  ok(`weather ${tag}: root viewBox and class unchanged`, r.svg.slice(0, 120) === kit.svg.slice(0, 120));
  ok(`weather ${tag}: lamp focus only in the lamp cell; kit warm overlay absent there`, name === 'storm+lamp' ? (r.svg.includes('data-p26="lamp-focus"') && !/g-overlay/.test(r.svg)) : !r.svg.includes('data-p26="lamp-focus"'));
  const soft = r.svg.match(/data-p26="ambient-shadows"/g) || []; ok(`weather ${tag}: soft ambient shadows, no directional sun shadows`, soft.length === 1 && !/data-p26="sun-/.test(r.svg));
}
{ const w = k => out[`${k}/wide/side`], o = streakStats(w('overcast')), ra = streakStats(w('rain')), st = streakStats(w('storm'));
  ok('overcast has no rain streaks or droplets', o.n === 0 && countDrops(w('overcast')) === 0);
  ok(`rain and storm differ in art: storm has >=2x the streaks (${ra.n} vs ${st.n})`, st.n >= 2 * ra.n);
  ok(`storm streaks are longer (${ra.len.toFixed(1)} vs ${st.len.toFixed(1)}) and more slanted (${ra.slant.toFixed(1)} vs ${st.slant.toFixed(1)} deg)`, st.len > ra.len * 1.4 && Math.abs(st.slant) - Math.abs(ra.slant) > 10);
  ok(`storm has more droplets than rain (${countDrops(w('rain'))} vs ${countDrops(w('storm'))})`, countDrops(w('storm')) > countDrops(w('rain')));
  ok('sky colours differ between overcast, rain and storm', new Set(['overcast', 'rain', 'storm'].map(k => skyTop(w(k)))).size === 3);
  ok('room tint strengthens: overcast < rain < storm', tintOp(w('overcast')) < tintOp(w('rain')) && tintOp(w('rain')) < tintOp(w('storm')));
  ok('no sun blocks in any weather cell', !/data-p26="(sun-|shade-tint|window-glass|window-bloom)/.test(Object.values(out).join('')));
  ok('storm and storm+lamp differ', w('storm') !== w('storm+lamp'));
  ok('storm+lamp keeps the same sky, streaks and droplets as storm', streakStats(w('storm+lamp')).n === streakStats(w('storm')).n && skyTop(w('storm+lamp')) === skyTop(w('storm')) && countDrops(w('storm+lamp')) === countDrops(w('storm'))); }
{ const a = renderStudyScene({ area: 'living', idPrefix: 'w-a', weather: 'storm' }).svg, b = renderStudyScene({ area: 'living', idPrefix: 'w-b', weather: 'rain', framing: 'medium' }).svg, c = renderStudyScene({ area: 'living', idPrefix: 'w-c', daylight: 'sun' }).svg, d = renderStudyScene({ area: 'living', idPrefix: 'w-d', weather: 'storm', light: 'warm' }).svg;
  const rep = idReport(a, b, c, d); ok('four simultaneous instances (storm, rain, sun, storm+lamp): ids unique and resolvable', rep.duplicates.length === 0 && rep.dangling.length === 0, JSON.stringify(rep));
  ok('weather deterministic: identical input -> identical output', renderStudyScene({ area: 'living', idPrefix: 'w-a', weather: 'storm' }).svg === a);
  const kib = t => (Buffer.byteLength(t) / 1024).toFixed(1); console.log(`size KiB: storm ${kib(a)}, rain(medium) ${kib(b)}, storm+lamp ${kib(d)}`); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
