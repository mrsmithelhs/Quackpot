// Plan 26 daylight comparison gallery. Imports only the study wrapper (which wraps the pinned, read-only kit).
import { renderStudyScene } from './study/scene.mjs';
import { renderScene } from '../../../src/assets/apartment/index.mjs';
import { glassRects } from './study/daylight.mjs';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const STAGES = { wide: ['wide stage 1120×540 (2.07:1)', '1120 / 540'], scene: ['scene shape 16:9', '16 / 9'], narrow: ['narrow stage 335×310 (1.08:1)', '335 / 310'] };
const state = { framing: 'wide', stage: 'wide', duckView: 'side', couch: 'present', tv: 'present', zoom: 1, mode: 'columns' };
const options = { framing: ['wide', 'medium'], stage: Object.keys(STAGES), duckView: ['side', 'front', 'rear'], couch: ['present', 'removed'], tv: ['present', 'removed'], zoom: [1, 2, 3], mode: ['columns', 'diff'] };
const labels = { framing: 'Framing', stage: 'Stage shape', duckView: 'Duck view', couch: 'Couch', tv: 'TV', zoom: 'CSS crop zoom (not browser zoom)', mode: 'Display (diff = variant vs neutral, black = identical)' };
$('#controls').innerHTML = Object.entries(options).map(([k, list]) => `<fieldset><legend>${labels[k]}</legend><select data-k="${k}">${list.map(v => `<option value="${v}"${v === state[k] ? ' selected' : ''}>${k === 'stage' ? STAGES[v][0] : v}</option>`).join('')}</select></fieldset>`).join('');
$('#controls').addEventListener('change', e => { const k = e.target.dataset.k; state[k] = typeof options[k][0] === 'number' ? Number(e.target.value) : e.target.value; render(); });

const CELLS = [
  ['neutral', 'Neutral (kit light neutral)', { light: 'neutral' }],
  ['window', 'Legacy window (kit light window, scene-anchored overlay)', { light: 'window' }],
  ['sunr', 'Sun, restrained', { light: 'neutral', daylight: 'sun', strength: 'restrained' }],
  ['suns', 'Sun, strong', { light: 'neutral', daylight: 'sun', strength: 'strong' }],
  ['hostwin', 'EXTRA CONTROL: legacy window, host/stage-anchored (overlay none + original stage CSS)', { light: 'window', overlay: 'none' }, true]
];

function scene(prefix, opts) {
  return renderStudyScene({ area: 'living', idPrefix: prefix, framing: state.framing, duckView: state.duckView, furnishings: { couch: state.couch, tv: state.tv }, ...opts });
}

/** Fraction of the window glass inside the scene's viewBox (weather art lives in the glass; the medium crop may hide it). */
function windowShare(svg) {
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/); if (!vb) return 1;
  const [, vx, vy, vw, vh] = vb.map(Number), g = glassRects(); let total = 0, inside = 0;
  for (const r of g) { total += r.w * r.h; const w = Math.max(0, Math.min(r.x + r.w, vx + vw) - Math.max(r.x, vx)), h = Math.max(0, Math.min(r.y + r.h, vy + vh) - Math.max(r.y, vy)); inside += w * h; }
  return inside / total;
}

function cell({ key, title, opts, host, diff, ar, weather }) {
  const a = scene(`g-${key}`, opts);
  const layers = diff ? `<div class="layer">${scene('g-base', { light: 'neutral' }).svg.replace(/id="g-base-/g, `id="gb-${key}-`).replace(/#g-base-/g, `#gb-${key}-`)}</div><div class="layer second">${a.svg}</div>` : `<div class="layer">${a.svg}</div>`;
  const notes = [...a.study.notes];
  if (weather) { const share = windowShare(a.svg); if (share < .05) notes.push('window out of frame: weather reads as AMBIENCE (tint/vignette), not visible rainfall'); else if (share < .95) notes.push('window partly cropped'); }
  return `<figure><div class="stage" style="--ar:${ar};--z:${state.zoom}">${layers}${host && !diff ? '<div class="host-wash"></div>' : ''}</div><figcaption><strong>${esc(title)}</strong> · ${esc(a.meta.shotKey)} · duck ${esc(a.meta.duckView)}${notes.length ? ' · ' + esc(notes.join('; ')) : ''}</figcaption></figure>`;
}

const WEATHER_CELLS = [
  ['clearsun', 'Clear, strong sun (daylight reference, lamp off)', { light: 'neutral', daylight: 'sun', strength: 'strong' }],
  ['overcast', 'Overcast (lamp off)', { weather: 'overcast' }],
  ['rain', 'Rain (lamp off)', { weather: 'rain' }],
  ['storm', 'Storm, no flash (lamp off)', { weather: 'storm' }],
  ['stormlamp', 'Storm + warm lamp', { weather: 'storm', light: 'warm' }]
];
// Comparison aid, not an approved weather cell: the ordinary kit warm scene (same lamp, kit's own scene-anchored overlay).
const WARM_REFERENCE = ['warmref', 'REFERENCE (not a weather cell): ordinary kit warm scene', { light: 'warm' }];

function render() {
  const diff = state.mode === 'diff', [, ar] = STAGES[state.stage];
  $('#grid').innerHTML = CELLS.filter(c => !(diff && c[0] === 'neutral')).map(([key, title, opts, host]) => cell({ key, title, opts, host, diff, ar })).join('');
  $('#wgrid').innerHTML = WEATHER_CELLS.map(([key, title, opts]) => cell({ key: `w${key}`, title, opts, diff, ar, weather: key !== 'clearsun' })).join('');
  $('#wgrid').insertAdjacentHTML('beforeend', cell({ key: `w${WARM_REFERENCE[0]}`, title: WARM_REFERENCE[1], opts: WARM_REFERENCE[2], diff, ar }));
  $('#status').textContent = `Stage ${STAGES[state.stage][0]}; viewport ${innerWidth}×${innerHeight}.`;
}
render();
addEventListener('resize', () => { $('#status').textContent = `Stage ${STAGES[state.stage][0]}; viewport ${innerWidth}×${innerHeight}.`; });

// ---- page checks ---------------------------------------------------------------------------------
{
  const root = document.querySelector('main'), ids = [...root.querySelectorAll('[id]')].map(e => e.id), dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  const refs = [...root.innerHTML.matchAll(/url\(&quot;#([^&)]+)&quot;\)|url\(#([^)]+)\)/g)].map(m => m[1] || m[2]), known = new Set(ids), dangling = [...new Set(refs.filter(r => !known.has(r)))];
  const same = renderStudyScene({ area: 'living', idPrefix: 'chk' }).svg === renderScene({ area: 'living', idPrefix: 'chk' }).svg;
  const rows = [['ids on this page', `${ids.length}`, dup.length === 0 ? 'ok' : 'bad', `${dup.length} duplicates`], ['url(#…) references', `${refs.length}`, dangling.length === 0 ? 'ok' : 'bad', `${dangling.length} dangling`], ['no-effect wrapper output equals kit output (living, this browser)', same ? 'equal' : 'DIFFERENT', same ? 'ok' : 'bad', '']];
  $('#checks').innerHTML = rows.map(([a, b, c, d]) => `<tr><td>${a}</td><td class="${c}">${b}</td><td>${d}</td></tr>`).join('');
}
