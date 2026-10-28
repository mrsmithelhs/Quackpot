// Plan 26 daylight comparison gallery. Imports only the study wrapper (which wraps the pinned, read-only kit).
import { renderStudyScene } from './study/scene.mjs';
import { renderScene } from '../../../src/assets/apartment/index.mjs';

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

function render() {
  const diff = state.mode === 'diff', [, ar] = STAGES[state.stage];
  const cells = CELLS.filter(c => !(diff && c[0] === 'neutral'));
  $('#grid').innerHTML = cells.map(([key, title, opts, host]) => {
    const a = scene(`g-${key}`, opts), layers = diff ? `<div class="layer">${scene('g-base', { light: 'neutral' }).svg.replace(/id="g-base-/g, `id="gb-${key}-`).replace(/#g-base-/g, `#gb-${key}-`)}</div><div class="layer second">${a.svg}</div>` : `<div class="layer">${a.svg}</div>`;
    const note = a.study.notes.length ? ` · ${esc(a.study.notes.join('; '))}` : '';
    return `<figure><div class="stage" style="--ar:${ar};--z:${state.zoom}">${layers}${host && !diff ? '<div class="host-wash"></div>' : ''}</div><figcaption><strong>${esc(title)}</strong> · ${esc(a.meta.shotKey)} · duck ${esc(a.meta.duckView)}${note}</figcaption></figure>`;
  }).join('');
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
