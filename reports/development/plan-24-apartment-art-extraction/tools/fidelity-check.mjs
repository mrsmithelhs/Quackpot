// Review tooling (NOT runtime): structural fidelity of the extracted kit against the frozen Plan 10 baseline.
// Usage (repo root):  node reports/development/plan-24-apartment-art-extraction/tools/fidelity-check.mjs [--only static,rooms,desk,controls] [--json]
// Verifies the frozen blob ids first and fails clearly on a mismatch. Pre-bake equality proves STRUCTURAL
// preservation only; final visual fidelity needs the rendered gallery comparison.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadBaseline, verifyBuffer, REPO_ROOT, FROZEN } from './baseline.mjs';
import { compareMarkup, firstDiff, idReport, normalizeIds, checkWellFormed } from './compare.mjs';

const KIT = path.join(REPO_ROOT, 'src/assets/apartment');
const load = async rel => { try { return await import(pathToFileURL(path.join(KIT, rel)).href); } catch (e) { if (e.code === 'ERR_MODULE_NOT_FOUND') return null; throw e; } };
const args = process.argv.slice(2);
const only = (args.find(a => a === '--only') ? args[args.indexOf('--only') + 1] : 'static,rooms,desk,controls').split(',');
const results = [];
const record = (name, ok, detail = '') => { results.push({ name, ok, detail }); };

const base = loadBaseline();       // throws on blob mismatch
record('frozen blobs verified', true, `${FROZEN.preview.blob.slice(0, 8)} / ${FROZEN.duckViews.blob.slice(0, 8)}`);
const eqJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const bundle = [];  // sample scene pairs reused by the negative controls

if (only.includes('static')) {
  const constants = await load('core/constants.mjs'), defs = await load('lighting/defs.mjs'), views = await load('duck/views.mjs'), overhead = await load('duck/overhead.mjs');
  if (!constants) record('core/constants.mjs', false, 'missing');
  else for (const n of ['PX_MM', 'PHONE_MM', 'DUCK_SCALE', 'DUCK_CX', 'F', 'CX', 'DUCK_UNITS_PER_MM']) record(`constant ${n}`, eqJson(constants[n], base.api[n]), JSON.stringify(constants[n]));
  record('lighting/defs.mjs sceneDefs identical', !!defs && defs.sceneDefs === base.api.sceneDefs);
  if (!views) record('duck/views.mjs', false, 'missing');
  else {
    record('duck views deep-equal frozen duck-views.js', eqJson(views.views, base.views));
    // Line-ending tolerant: a Windows checkout may rewrite LF as CRLF, which JS template literals normalise anyway.
    const text = (await import('node:fs')).readFileSync(path.join(KIT, 'duck/views.mjs'), 'utf8').replace(/\r\n/g, '\n');
    record('duck/views.mjs body byte-identical to frozen blob', text.endsWith(base.duckViewsText), `${text.length} bytes`);
  }
  record('duck/overhead.mjs topDuckInner identical', !!overhead && overhead.topDuckInner() === base.api.topDuckInner());
  const [prims, ...fams] = await Promise.all(['prims', 'decor', 'living', 'kitchen', 'bedroom', 'toys'].map(f => load(`props/${f}.mjs`)));
  if (!prims || fams.some(f => !f)) record('props modules', false, 'missing');
  else {
    const p = Object.assign({}, prims, ...fams), b = base.api;
    const calls = {
      art: [['land'], ['night'], ['night', 900, 560], ['land', 960, 640]], windowMm: [[900, 800], [600, 800, '#8fb0a0'], [800, 850, '#9b8fb0']], plant: [[800], [900]], mug: [[], ['#4f8fc0']],
      sofa: [[1500]], coffeeTable: [[1100]], tvUnit: [[false], [true]], floorLamp: [[]], fridge: [[]], cabinetRun: [[2100]], stove: [[]], pot: [[]], hood: [[]], upperCabs: [[800], [1000]], clock: [[]],
      kettle: [[]], toaster: [[]], jars: [[]], bar: [[1500]], stool: [[]], fruit: [[]], pendant: [[-3600]], bed: [[]], bedside: [[]], bedLamp: [[]], clockSmall: [[]], toyShelf: [[]], teddy: [[]],
      block: [['#d96c5a', 'A'], ['#4f8fc0', 'B']], robot: [[]], truck: [[]], rings: [[]], ball: [[]], bunny: [[]], magazines: [[]]
    };
    for (const [name, argSets] of Object.entries(calls)) {
      const bad = argSets.map(a => firstDiff(b[name](...a), p[name](...a))).filter(Boolean);
      record(`prop ${name}`, !bad.length, bad[0] || `${argSets.length} call(s)`);
    }
    record('prim sc_', p.sc_(p.teddy(), .72) === b.sc_(b.teddy(), .72));
    record('prims R/Ci/El/Pg/Pa/NS', p.R(1, 2, 3, 4, '#fff', 5, 'x') === b.R(1, 2, 3, 4, '#fff', 5, 'x') && p.Ci(1, 2, 3, '#000') === b.Ci(1, 2, 3, '#000') && p.El(1, 2, 3, 4, '#000') === b.El(1, 2, 3, 4, '#000') && p.Pg('0,0 1,1', '#000') === b.Pg('0,0 1,1', '#000') && p.Pa('M0 0', '#000') === b.Pa('M0 0', '#000') && p.NS === b.NS);
  }
}

const FRAMINGS = ['wide', 'medium'], HVIEWS = ['front', 'side', 'rear'];
if (only.includes('rooms')) {
  const mod = await load('rooms/scene.mjs'), cam = await load('rooms/camera.mjs'), specs = await load('rooms/specs.mjs');
  if (!mod || !cam || !specs) record('rooms modules', false, 'missing');
  else {
    record('rooms/camera proj matches', eqJson(cam.proj({ hy: 250, camH: 638 }, 480, 900, 430), base.api.proj({ hy: 250, camH: 638 }, 480, 900, 430)));
    record('rooms/camera put matches', cam.put({ hy: 250, camH: 638 }, -150, 700, 0, '<g/>', 'x') === base.api.put({ hy: 250, camH: 638 }, -150, 700, 0, '<g/>', 'x'));
    record('ROOM_SPECS area keys', eqJson(Object.keys(specs.ROOM_SPECS), Object.keys(base.api.ROOM_SPECS)));
    for (const area of ['living', 'kitchen', 'bedroom']) for (const framing of FRAMINGS) for (const view of HVIEWS) {
      const states = area === 'living' ? [false, true] : [false];
      for (const sold of states) {
        const expected = base.api.roomScene(area, view, framing, sold);
        const furnishings = sold ? { couch: 'removed', tv: 'removed' } : { couch: 'present', tv: 'present' };
        const actual = mod.buildRoomScene({ area, duckView: view, framing, furnishings });
        const cmp = compareMarkup(expected.svg, actual.svg), lampEq = eqJson(expected.lamp, actual.lamp);
        record(`room ${area}/${framing}/${view}${sold ? '/sold' : ''}`, cmp.equal && lampEq && !cmp.actualIds.duplicates.length && !cmp.actualIds.missing.length, cmp.diff || (lampEq ? '' : 'lamp hints differ'));
        if (area === 'living' && framing === 'wide' && view === 'side' && !sold) bundle.push({ name: 'living-wide', expected: expected.svg, actual: actual.svg });
      }
    }
  }
}

if (only.includes('desk')) {
  const side = await load('desk/side.mjs'), top = await load('desk/top.mjs'), phone = await load('desk/phone.mjs');
  if (!side || !top || !phone) record('desk modules', false, 'missing');
  else {
    record('desk/phone phoneFace default copy matches', phone.phoneFace(158, 299) === base.api.phoneFace(158, 299) && phone.phoneFace(158.4, 299.2) === base.api.phoneFace(158.4, 299.2));
    for (const view of HVIEWS) { const cmp = compareMarkup(base.api.sideDeskScene(view), side.buildSideDeskScene({ duckView: view })); record(`desk side/${view}`, cmp.equal && !cmp.actualIds.duplicates.length && !cmp.actualIds.missing.length, cmp.diff || ''); if (view === 'side') bundle.push({ name: 'desk-side', expected: base.api.sideDeskScene(view), actual: side.buildSideDeskScene({ duckView: view }) }); }
    const cmp = compareMarkup(base.api.topDeskScene(), top.buildTopDeskScene({})); record('desk top', cmp.equal && !cmp.actualIds.duplicates.length && !cmp.actualIds.missing.length, cmp.diff || '');
    bundle.push({ name: 'desk-top', expected: base.api.topDeskScene(), actual: top.buildTopDeskScene({}) });
  }
}

if (only.includes('controls')) {
  // Negative controls: deliberately corrupted copies MUST be detected by the same comparison.
  const sample = bundle[0] || { name: 'duck-front', expected: base.views.front.svg, actual: base.views.front.svg };
  const exp = sample.expected, act = sample.actual;
  const mutate = (s, re, fn) => { const m = s.match(re); if (!m) throw new Error(`control pattern missing: ${re}`); return s.slice(0, m.index) + fn(m[0]) + s.slice(m.index + m[0].length); };
  const controls = {
    'path digit changed': s => mutate(s, /d="M(-?\d+)/, m => m.replace(/-?\d+$/, x => String(Number(x) + 1))),
    'style attribute changed': s => mutate(s, /fill="#[0-9a-f]{6}"/, () => 'fill="#123456"'),
    'content removed': s => mutate(s, /<(rect|circle|ellipse|polygon|path)\b[^>]*\/>/, () => ''),
    'dangling reference': s => mutate(s, /url\(#([^)]+)\)/, m => m.replace(/.\)$/, 'x)')),
    'duplicate id': s => { const m = s.match(/\bid="([^"]+)"/g); return s.replace(m[1] || m[0], m[0]); },
    'text content changed': s => (s.includes('Welcome') ? s.replace('Welcome', 'Welcomf') : mutate(s, /<(rect|circle)\b/, m => `${m} data-x="1"`))
  };
  for (const [name, fn] of Object.entries(controls)) {
    let detected = false, detail = '';
    try {
      const bad = fn(act), cmp = compareMarkup(exp, bad);
      const ids = idReport(bad);
      detected = !cmp.equal || ids.duplicates.length > 0 || ids.missing.length > 0;
      detail = detected ? 'detected' : 'NOT DETECTED';
    } catch (e) { detail = `control failed to apply: ${e.message}`; }
    record(`negative control: ${name}`, detected, detail);
  }
  try { verifyBuffer(Buffer.from('tampered'), FROZEN.preview.blob, 'tampered buffer'); record('negative control: wrong blob content', false, 'NOT DETECTED'); }
  catch (e) { record('negative control: wrong blob content', /Frozen baseline mismatch/.test(e.message), 'detected'); }
  record('negative control: well-formedness checker catches mismatch', checkWellFormed('<svg><g></svg>') !== null && checkWellFormed('<svg><g/></svg>') === null);
}

const failed = results.filter(r => !r.ok);
if (args.includes('--json')) console.log(JSON.stringify({ results, failed: failed.length }, null, 1));
else {
  for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.detail && (!r.ok || r.detail.length < 70) ? ` — ${r.detail}` : ''}`);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? `; ${failed.length} FAILED` : ''}`);
}
process.exit(failed.length ? 1 : 0);
