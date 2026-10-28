// Plan 24 comparison gallery. Imports ONLY the new kit; the baseline is the unchanged Plan 10 page in an iframe.
import { renderDuck, renderScene, DUCK_VIEWS, DUCK_LABELS, AREAS, ROOM_AREAS, FRAMINGS, LIGHT_MODES } from '../../../src/assets/apartment/index.mjs';

const BASELINE_URL = '../plan-10-metagame-duck-cinematography/preview.html';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---- 1. duck contact sheet -----------------------------------------------------------------
$('#ducks').innerHTML = DUCK_VIEWS.map(v => `<article class="card"><h3>${esc(DUCK_LABELS[v])}</h3>${renderDuck(v, { idPrefix: `duck-${v}` })}</article>`).join('');

// ---- 2. baseline comparison -----------------------------------------------------------------
const state = { area: 'living', framing: 'wide', light: 'neutral', duckView: 'side', couch: 'present', tv: 'present', width: 1200, mode: 'side', zoom: 1 };
const options = {
  area: AREAS, framing: FRAMINGS, light: LIGHT_MODES, duckView: DUCK_VIEWS, couch: ['present', 'removed'], tv: ['present', 'removed'],
  width: [1200, 375], mode: ['side', 'diff', 'only-base', 'only-kit'], zoom: [1, 2, 3]
};
const labels = { area: 'Area', framing: 'Framing', light: 'Light', duckView: 'Duck view requested', couch: 'Couch', tv: 'TV', width: 'Baseline page width (px)', mode: 'Display', zoom: 'CSS crop zoom (not browser zoom)' };
$('#cmpControls').innerHTML = Object.entries(options).map(([k, list]) => `<fieldset><legend>${labels[k]}</legend><select data-k="${k}">${list.map(v => `<option value="${v}"${v === state[k] ? ' selected' : ''}>${v}</option>`).join('')}</select></fieldset>`).join('');
$('#cmpControls').addEventListener('change', e => { const k = e.target.dataset.k; state[k] = typeof options[k][0] === 'number' ? Number(e.target.value) : e.target.value; if (k === 'width') reloadBaseline(); else render(); });

const BASE_LIGHT = { neutral: 'neutral', window: 'light', warm: 'dark' };
// Persistent structure: the iframe is never re-parented (moving it would reload the baseline).
$('#cmp').innerHTML = `<figure class="basefig"><div class="zoomwrap" id="baseZoom"><div class="zoominner"><div class="clip" id="baseClip"></div></div></div><figcaption id="baseCap"></figcaption></figure>`
  + `<figure class="kitfig"><div class="zoomwrap" id="kitZoom"><div class="zoominner"><div class="stage" id="kitStage"><div class="layer" id="kitLayer"></div></div></div></div><figcaption id="kitCap"></figcaption></figure>`;
let frame = null, baselineReady = Promise.resolve();
function reloadBaseline() {
  baselineReady = new Promise(resolve => {   // resolves when the baseline has loaded (render() awaits this; it must not wait on itself)
    frame = document.createElement('iframe');
    frame.src = BASELINE_URL; frame.width = String(state.width); frame.height = '1500'; frame.scrolling = 'no'; frame.title = 'Unchanged Plan 10 baseline page';
    frame.addEventListener('load', () => {
      const d = frame.contentDocument; const st = d.createElement('style'); st.textContent = '.caption{display:none !important}'; d.head.append(st); resolve();
    }, { once: true });
    $('#baseClip').replaceChildren(frame);
  });
  baselineReady.then(() => render());
}
const setRadio = (d, name, value) => { const el = d.querySelector(`input[name="${name}"][value="${value}"]`); if (!el) return false; el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); return true; };

async function render() {
  await baselineReady;
  const d = frame.contentDocument, isDesk = state.area.startsWith('desk');
  const scene = renderScene({ area: state.area, idPrefix: 'cmp', framing: state.framing, light: state.light, duckView: state.duckView, furnishings: { couch: state.couch, tv: state.tv } });
  const mixed = state.area === 'living' && state.couch !== state.tv;
  // Drive the unchanged page through its own controls (no edits to it).
  setRadio(d, 'area', state.area); if (!isDesk) setRadio(d, 'shot', state.framing);
  setRadio(d, 'light', BASE_LIGHT[state.light]);
  setRadio(d, 'view', ['front', 'side', 'rear', 'high', 'low'].includes(state.duckView) ? state.duckView : 'side');
  if (state.area === 'living') setRadio(d, 'state', state.couch === 'removed' && state.tv === 'removed' ? 'sold' : 'full');
  await new Promise(r => setTimeout(r, 60));   // let the baseline restyle (a timer, not rAF: rAF never fires in a hidden pane/tab)
  const box = d.querySelector('#stage').getBoundingClientRect(), W = Math.round(box.width), H = Math.round(box.height), z = state.zoom;
  const origin = state.area === 'desk-top' ? '45% 55%' : '35% 70%';
  for (const id of ['#baseZoom', '#kitZoom']) { const w = $(id); w.style.cssText = `width:${W}px;height:${H}px;overflow:hidden;border-radius:.7rem`; const i = w.firstElementChild; i.style.cssText = `width:${W}px;height:${H}px;transform:scale(${z});transform-origin:${origin}`; }
  const clip = $('#baseClip'); clip.style.cssText = `width:${W}px;height:${H}px`;
  frame.style.left = `${-Math.round(box.left)}px`; frame.style.top = `${-Math.round(box.top)}px`;
  const stage = $('#kitStage'); stage.style.cssText = `width:${W}px;height:${H}px`;
  $('#kitLayer').innerHTML = scene.svg;
  const cmp = $('#cmp'); cmp.className = `cmp ${state.mode === 'diff' ? 'diff' : 'side'}${state.mode === 'only-base' ? ' only-base' : ''}${state.mode === 'only-kit' ? ' only-kit' : ''}`;
  if (state.mode === 'diff') cmp.style.minHeight = `${H}px`; else cmp.style.minHeight = '';
  $('#baseCap').textContent = `Baseline: unchanged Plan 10 page (${W}×${H}px stage)`;
  $('#kitCap').textContent = `Kit: renderScene → ${scene.meta.shotKey}, duck ${scene.meta.duckView}${scene.meta.fallback ? ' (fallback)' : ''}`;
  const notes = [];
  if (mixed) notes.push('mixed couch/TV state: no baseline exists (unbaselined derived composition)');
  if (scene.meta.fallback) notes.push(`duck: requested ${scene.meta.fallback.from}, kit shows ${scene.meta.fallback.to} — ${scene.meta.fallback.reason}`);
  if (state.area === 'desk-top' && state.duckView !== 'top') notes.push('baseline desk-top ignores the duck selection (always overhead)');
  if (scene.meta.ignored.length) notes.push(`ignored options: ${scene.meta.ignored.join(', ')}`);
  $('#cmpStatus').innerHTML = `<p>Stage ${W}×${H}px (measured from the baseline). ${notes.length ? esc(notes.join('; ')) + '.' : 'No fallbacks or unbaselined options in this state.'}</p>`;
}
reloadBaseline();

// ---- 3. scene states ------------------------------------------------------------------------
$('#sceneLight').innerHTML = LIGHT_MODES.map(l => `<option>${l}</option>`).join('');
const SCENE_CELLS = [
  ['living wide', { area: 'living', framing: 'wide' }], ['living medium', { area: 'living', framing: 'medium' }],
  ['kitchen wide', { area: 'kitchen', framing: 'wide' }], ['kitchen medium', { area: 'kitchen', framing: 'medium' }],
  ['bedroom wide', { area: 'bedroom', framing: 'wide' }], ['bedroom medium', { area: 'bedroom', framing: 'medium' }],
  ['desk, side view', { area: 'desk-side' }], ['desk, top-down', { area: 'desk-top' }],
  ['living, couch and TV removed (baselined)', { area: 'living', furnishings: { couch: 'removed', tv: 'removed' } }],
  ['living, couch removed only (unbaselined)', { area: 'living', furnishings: { couch: 'removed', tv: 'present' } }],
  ['living, TV removed only (unbaselined)', { area: 'living', furnishings: { couch: 'present', tv: 'removed' } }]
];
function renderScenes() {
  const light = $('#sceneLight').value, overlay = $('#sceneOverlay').value;
  $('#scenes').innerHTML = SCENE_CELLS.map(([name, opts], i) => {
    const { svg, meta } = renderScene({ idPrefix: `sc${i}`, light, overlay, ...opts });
    return `<article class="card"><h3>${esc(name)}</h3><div class="stage">${`<div class="layer">${svg}</div>`}</div><p>${esc(meta.shotKey)} · duck ${esc(meta.duckView)}${meta.furnishings ? ` · couch ${meta.furnishings.couch}, TV ${meta.furnishings.tv}` : ''}</p></article>`;
  }).join('');
}
$('#sceneLight').addEventListener('change', renderScenes); $('#sceneOverlay').addEventListener('change', renderScenes);
renderScenes();

// ---- 4. requested vs actual duck view ---------------------------------------------------------
const fbAreas = ['living', 'desk-side', 'desk-top'];
$('#fallbacks').innerHTML = `<tr><th>requested</th>${fbAreas.map(a => `<th>${a}</th>`).join('')}</tr>` + DUCK_VIEWS.map(v => `<tr><td>${v}</td>${fbAreas.map(a => { const { meta } = renderScene({ area: a, idPrefix: 'fb', duckView: v }); return `<td>${meta.duckView}${meta.fallback ? ' <em>(fallback)</em>' : ''}</td>`; }).join('')}</tr>`).join('');

// ---- 5. repeated-instance stress ----------------------------------------------------------------
const stressOpts = [['living', 'warm'], ['kitchen', 'warm'], ['bedroom', 'neutral'], ['desk-side', 'warm'], ['desk-top', 'window'], ['living', 'neutral'], ['kitchen', 'neutral'], ['bedroom', 'warm'], ['desk-side', 'neutral'], ['desk-top', 'warm'], ['living', 'window'], ['kitchen', 'window']];
$('#stress').innerHTML = stressOpts.map(([area, light], i) => `<article class="card"><h3>${area} / ${light} (st${i})</h3><div class="stage"><div class="layer">${renderScene({ area, light, idPrefix: `st${i}`, duckView: 'front' }).svg}</div></div></article>`).join('')
  + DUCK_VIEWS.map(v => `<article class="card"><h3>duck ${v} (sd${v})</h3>${renderDuck(v, { idPrefix: `sd${v}` })}</article>`).join('');
{
  const root = document.querySelector('main');
  const all = [...root.querySelectorAll('[id]')].map(e => e.id), dup = all.filter((id, i) => all.indexOf(id) !== i);
  const markup = root.innerHTML, ref = [...markup.matchAll(/url\(&quot;#([^&)]+)&quot;\)|url\(#([^)]+)\)/g)].map(m => m[1] || m[2]), known = new Set(all);
  const missing = [...new Set(ref.filter(r => !known.has(r)))];
  // Negative control: the same prefix used twice must be flagged by the same check.
  const twice = renderScene({ area: 'kitchen', idPrefix: 'same' }).svg + renderScene({ area: 'kitchen', idPrefix: 'same' }).svg;
  const tw = [...twice.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]), twDup = tw.filter((id, i) => tw.indexOf(id) !== i).length;
  $('#stressResult').innerHTML = `<span class="${dup.length || missing.length ? 'bad' : 'ok'}">${all.length} ids on this page, ${dup.length} duplicates, ${ref.length} url(#…) references, ${missing.length} dangling.</span> Negative control (same prefix used twice): <span class="${twDup ? 'ok' : 'bad'}">${twDup} duplicate ids detected</span> — this is why every scene needs its own prefix.`;
}

// ---- 6. coverage -------------------------------------------------------------------------------
$('#coverage').innerHTML = [
  'Genuine duck representations: front, side, rear, high, low, overhead (six). Scenes embed front/side/rear; other requests fall back as reported in section 4.',
  'Scenes that exist: living, kitchen, bedroom (wide and medium each), desk side view, desk top-down — eight compositions, plus the combined couch-and-TV-removed living state.',
  'Mixed couch/TV states are derived from the same drawing paths and have no baseline; they are shown, not validated against one.',
  'Light modes (neutral, window, warm) and the in-SVG overlay exist for every scene; not every combination is claimed as separately validated. See the progress report for the rendered matrix actually inspected.',
  'Real browser zoom is not exercised by this page; the crop zoom control is CSS scaling.'
].map(t => `<li>${esc(t)}</li>`).join('');
