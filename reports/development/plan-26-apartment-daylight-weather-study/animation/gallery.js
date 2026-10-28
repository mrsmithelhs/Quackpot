// Plan 26 motion gallery (report page, not game UI). Scenes come from the unchanged study wrapper; motion comes from the controller.
import { renderStudyScene } from '../study/scene.mjs';
import { createWeatherMotion, createFlashArbiter } from './index.mjs';
import { createLightningEffect } from './lightning.mjs';
import * as rainHarness from './tools/browser-harness.js';
import * as flashHarness from './tools/flash-harness.js';
const harness = { ...rainHarness, ...flashHarness };

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const STAGES = { wide: ['wide stage 1120×540 (2.07:1)', '1120 / 540'], scene: ['scene shape 16:9', '16 / 9'], narrow: ['narrow stage 335×310 (1.08:1)', '335 / 310'] };
const CELLS = {
  rain: ['Rain', { weather: 'rain' }],
  storm: ['Storm', { weather: 'storm' }],
  stormlamp: ['Storm + warm lamp', { weather: 'storm', light: 'warm' }],
  overcast: ['Overcast (no rain motion by design)', { weather: 'overcast' }]
};
const state = { framing: 'wide', stage: 'wide', show: 'all', selected: 'storm' };
const choices = { framing: ['wide', 'medium'], stage: Object.keys(STAGES), show: ['all', 'one', 'dup4'], selected: Object.keys(CELLS) };
const labels = { framing: 'Framing', stage: 'Stage shape', show: 'Scenes shown (all four / the selected one / four copies of the selected one)', selected: 'Selected scene' };
$('#controls').innerHTML = Object.entries(choices).map(([k, list]) => `<fieldset><legend>${labels[k]}</legend><select data-k="${k}">${list.map(v => `<option value="${v}"${v === state[k] ? ' selected' : ''}>${k === 'stage' ? STAGES[v][0] : k === 'selected' ? CELLS[v][0] : v}</option>`).join('')}</select></fieldset>`).join('');
$('#controls').addEventListener('change', e => { const k = e.target.dataset.k; if (!k) return; state[k] = e.target.value; render(); });

const arbiter = createFlashArbiter();                       // ONE per page, injected into every controller
const prefs = { paused: {}, stopped: {}, inactive: {} };    // per scene instance; survive controller recreation and re-render
const scenes = new Map();                                    // instance id -> { id, key, root, ctl, stillHTML, weather }
let reducedOption = false, lightningOn = false;
const sched = { fn: (fn, ms) => { const h = setTimeout(fn, ms); return () => clearTimeout(h); } };   // the lightning watchdog; the measurement harness swaps it out while it samples

const t0 = performance.now();
function log(msg) { const el = $('#log'); el.textContent = `${((performance.now() - t0) / 1000).toFixed(2)}s  ${msg}\n` + el.textContent.split('\n').slice(0, 40).join('\n'); }

function instances() {
  if (state.show === 'one') return [{ id: state.selected, key: state.selected }];
  if (state.show === 'dup4') return [1, 2, 3, 4].map(n => ({ id: `${state.selected}-${n}`, key: state.selected }));
  return Object.keys(CELLS).map(k => ({ id: k, key: k }));
}

function makeController(inst) {
  inst.ctl = createWeatherMotion(inst.root, { weather: inst.weather, arbiter, reducedMotion: reducedOption ? 'reduce' : 'auto', startPaused: !!prefs.paused[inst.id], startStopped: !!prefs.stopped[inst.id], active: !prefs.inactive[inst.id], flashEffect: createLightningEffect({ schedule: (fn, ms) => sched.fn(fn, ms) }) });
  inst.unsub = inst.ctl.subscribe(() => paint(inst));
  paint(inst);
}

function paint(inst) {
  const card = document.querySelector(`[data-inst="${inst.id}"]`); if (!card) return;
  const s = inst.ctl.state(), has = b => s.blockers.includes(b), dead = s.phase === 'destroyed';
  const set = (act, label, pressed, disabled) => { const b = card.querySelector(`[data-act="${act}"]`); b.textContent = label; b.setAttribute('aria-pressed', String(!!pressed)); b.disabled = !!disabled; };
  set('pause', has('user-pause') ? 'Resume motion' : 'Pause motion', has('user-pause'), dead || !s.motion);
  set('stop', has('user-stop') ? 'Allow motion' : 'Show still', has('user-stop'), dead || !s.motion);
  set('active', has('inactive') ? 'Scene inactive (click to activate)' : 'Scene active', has('inactive'), dead);
  set('destroy', dead ? 'Recreate controller' : 'Destroy controller', dead, false);
  const fb = card.querySelector('[data-act="flash"]'); if (fb) fb.disabled = !lightningOn || dead;
  card.querySelector('.status').textContent = `${s.phase}${s.motion ? '' : ' (no rain motion for this weather)'} · blockers: ${s.blockers.join(', ') || 'none'} · animations: ${s.animations}${s.error ? ` · ERROR ${s.error}` : ''}`;
}

function render() {
  for (const inst of scenes.values()) { inst.unsub?.(); inst.ctl.destroy(); }
  scenes.clear();
  const [, ar] = STAGES[state.stage], list = instances();
  $('#grid').innerHTML = list.map(({ id, key }) => `<figure data-inst="${id}"><div class="stage" style="--ar:${ar}"><div class="layer"></div></div><figcaption><strong>${esc(CELLS[key][0])}</strong> · ${esc(id)}</figcaption><div class="tools"><button type="button" data-act="pause"></button><button type="button" data-act="stop"></button><button type="button" data-act="active"></button><button type="button" data-act="destroy"></button>${CELLS[key][1].weather === 'storm' ? '<button type="button" data-act="flash">Lightning (one pulse)</button>' : ''}</div><div class="status" aria-live="off"></div></figure>`).join('');
  list.forEach(({ id, key }, i) => {
    const [, opts] = CELLS[key], card = document.querySelector(`[data-inst="${id}"]`), layer = card.querySelector('.layer');
    layer.innerHTML = renderStudyScene({ area: 'living', idPrefix: `m-${id}`, framing: state.framing, duckView: 'side', furnishings: { couch: 'present', tv: 'present' }, ...opts }).svg;
    const root = layer.querySelector(':scope > svg'), inst = { id, key, root, weather: opts.weather, stillHTML: root.outerHTML };
    scenes.set(id, inst); makeController(inst);
  });
  $('#status').textContent = `Stage ${STAGES[state.stage][0]}; viewport ${innerWidth}×${innerHeight}; ${scenes.size} scene(s).`;
  syncPageButtons(); syncLightning(); checks();
}

$('#grid').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const inst = scenes.get(b.closest('[data-inst]').dataset.inst), s = inst.ctl.state(), act = b.dataset.act;
  if (act === 'pause') { if (s.blockers.includes('user-pause')) { inst.ctl.resume(); prefs.paused[inst.id] = false; } else { inst.ctl.pause(); prefs.paused[inst.id] = true; } }
  else if (act === 'stop') { if (s.blockers.includes('user-stop')) { inst.ctl.start(); prefs.stopped[inst.id] = false; } else { inst.ctl.stop(); prefs.stopped[inst.id] = true; } }
  else if (act === 'active') { const on = s.blockers.includes('inactive'); inst.ctl.setActive(on); prefs.inactive[inst.id] = !on; }
  else if (act === 'flash') { fire(inst); return; }
  else if (act === 'destroy') { if (s.phase === 'destroyed') makeController(inst); else { inst.unsub?.(); inst.ctl.destroy(); paint(inst); } }
  log(`${inst.id}: ${act} -> ${JSON.stringify(inst.ctl.state())}`); syncPageButtons();
});

function syncPageButtons() {
  const live = [...scenes.values()].filter(i => i.ctl.state().phase !== 'destroyed' && i.ctl.state().motion);
  $('#pause-all').setAttribute('aria-pressed', String(live.length > 0 && live.every(i => i.ctl.state().blockers.includes('user-pause'))));
  $('#stop-all').setAttribute('aria-pressed', String(live.length > 0 && live.every(i => i.ctl.state().blockers.includes('user-stop'))));
  $('#pause-all').textContent = $('#pause-all').getAttribute('aria-pressed') === 'true' ? 'Resume all' : 'Pause all';
  $('#stop-all').textContent = $('#stop-all').getAttribute('aria-pressed') === 'true' ? 'Allow motion (all)' : 'Show still (all)';
}
$('#pause-all').addEventListener('click', () => { const on = $('#pause-all').getAttribute('aria-pressed') !== 'true'; for (const i of scenes.values()) { if (i.ctl.state().phase === 'destroyed') continue; prefs.paused[i.id] = on; on ? i.ctl.pause() : i.ctl.resume(); } log(`pause all: ${on}`); syncPageButtons(); });
$('#stop-all').addEventListener('click', () => { const on = $('#stop-all').getAttribute('aria-pressed') !== 'true'; for (const i of scenes.values()) { if (i.ctl.state().phase === 'destroyed') continue; prefs.stopped[i.id] = on; on ? i.ctl.stop() : i.ctl.start(); } log(`show still (all): ${on}`); syncPageButtons(); });
$('#reduced-opt').addEventListener('change', e => { reducedOption = e.target.checked; log(`reducedMotion option: ${reducedOption ? "'reduce'" : "'auto'"}`); render(); });
function fire(inst) {
  const t = inst.ctl.requestFlash({ requester: inst.id });
  if (t.status === 'accepted') { log(`${inst.id}: lightning ACCEPTED (#${t.id})`); t.done.then(o => { log(`${inst.id}: lightning #${o.id} ${o.status.toUpperCase()}${o.reason ? ` (${o.reason})` : ''}`); paintArbiter(); }); }
  else log(`${inst.id}: lightning REFUSED: ${t.reason}${t.retryAfterMs ? ` (retry in ${Math.ceil(t.retryAfterMs)} ms)` : ''}`);
  paintArbiter(); return t;
}
function paintArbiter() {
  const a = arbiter.snapshot(), st = a.stats, wait = a.nextAllowedAt === null ? 0 : Math.max(0, a.nextAllowedAt - performance.now());
  $('#arbiter').textContent = `page arbiter: accepted ${st.accepted} · refused cooldown ${st.refusedCooldown} / active ${st.refusedActive} · finished ${st.finished} · cancelled ${st.cancelled} · ${a.activeId ? 'pulse active' : wait > 0 ? `next allowed in ${Math.ceil(wait)} ms` : 'ready'}`;
}
function syncLightning() {
  for (const b of document.querySelectorAll('#grid [data-act="flash"]')) b.disabled = !lightningOn;
  $('#flash').disabled = !lightningOn; $('#flash-all').disabled = !lightningOn; paintArbiter();
}
$('#lightning-on').addEventListener('change', e => { lightningOn = e.target.checked; log(`lightning requests ${lightningOn ? 'ENABLED' : 'disabled'} (never automatic; one pulse per accepted request)`); syncLightning(); });
$('#flash').addEventListener('click', () => { const inst = scenes.get(state.show === 'dup4' ? `${state.selected}-1` : state.selected) || [...scenes.values()][0]; fire(inst); });
$('#flash-all').addEventListener('click', () => { const storm = [...scenes.values()].filter(i => i.weather === 'storm'); log(`aggregate demo: one request on each of ${storm.length} storm scene(s) in the same tick`); for (const i of storm) fire(i); });
setInterval(paintArbiter, 250);
const mq = matchMedia('(prefers-reduced-motion: reduce)');
const showOs = () => { $('#os-reduced').textContent = `OS preference (live): ${mq.matches ? 'reduce' : 'no preference'}`; };
mq.addEventListener('change', () => { showOs(); log(`OS reduced-motion preference changed: ${mq.matches}`); });
showOs();
document.addEventListener('visibilitychange', () => log(`visibilityState: ${document.visibilityState}`));
addEventListener('resize', () => { $('#status').textContent = `Stage ${STAGES[state.stage][0]}; viewport ${innerWidth}×${innerHeight}; ${scenes.size} scene(s).`; });

async function checks() {
  const root = document.querySelector('#grid'), ids = [...root.querySelectorAll('[id]')].map(e => e.id), dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  const refs = [...root.innerHTML.matchAll(/url\(&quot;#([^&)]+)&quot;\)|url\(#([^)]+)\)/g)].map(m => m[1] || m[2]), known = new Set(ids), dangling = [...new Set(refs.filter(r => !known.has(r)))];
  const rows = [['ids on this page', `${ids.length}`, dup.length === 0 ? 'ok' : 'bad', `${dup.length} duplicates`], ['url(#…) references', `${refs.length}`, dangling.length === 0 ? 'ok' : 'bad', `${dangling.length} dangling`]];
  try {
    const fp = await (await fetch(new URL('./still-fingerprint.json', import.meta.url))).json(), svg = renderStudyScene({ area: 'living', idPrefix: 'fp', weather: 'storm', framing: 'wide' }).svg;
    const hex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(svg)))].map(b => b.toString(16).padStart(2, '0')).join('');
    rows.push(['approved still (storm, wide) equals the recorded fingerprint (this browser)', hex === fp['storm/wide'] ? 'equal' : 'DIFFERENT', hex === fp['storm/wide'] ? 'ok' : 'bad', '']);
  } catch (err) { rows.push(['approved still fingerprint', 'unavailable', 'bad', String(err.message || err)]); }
  $('#checks').innerHTML = rows.map(([a, b, c, d]) => `<tr><td>${a}</td><td class="${c}">${b}</td><td>${d}</td></tr>`).join('');
}

window.__p26m = { scenes, prefs, arbiter, state, harness, get schedule() { return sched.fn; }, set schedule(v) { sched.fn = v; }, rebuild: render, get reducedOption() { return reducedOption; }, set: async (k, v) => { const s = document.querySelector(`#controls select[data-k="${k}"]`); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); } };
render();
