// Interface tests for the apartment art kit. Run directly: node --test src/assets/apartment/apartment.test.mjs
// These check the contract (validation, IDs, escaping, fallbacks, purity, safety). They do not prove visual
// fidelity; that is checked by the Plan 24 harness and the rendered gallery comparison.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDuck, renderScene, DUCK_VIEWS, AREAS, ROOM_AREAS, FRAMINGS, LIGHT_MODES, PHONE_LIMITS } from './index.mjs';

const KIT_DIR = path.dirname(fileURLToPath(import.meta.url));
const wellFormed = xml => { // minimal tag-stack parse check; proves nothing about SVG semantics
  const stack = [], re = /<!--[\s\S]*?-->|<(\/?)([A-Za-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g; let m;
  while ((m = re.exec(xml))) { if (m[0].startsWith('<!--')) continue; const [, close, name, , self] = m; if (close) { if (stack.pop() !== name) return false; } else if (!self) stack.push(name); }
  return stack.length === 0;
};
const ids = svg => [...svg.matchAll(/\bid="([^"]*)"/g)].map(m => m[1]);
const refs = svg => [...svg.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]).concat([...svg.matchAll(/\bhref="#([^"]+)"/g)].map(m => m[1]));
const scene = (extra = {}) => renderScene({ area: 'living', idPrefix: 'a', ...extra });

test('exports the documented vocabulary', () => {
  assert.deepEqual(DUCK_VIEWS, ['front', 'side', 'rear', 'high', 'low', 'top']);
  assert.deepEqual(AREAS, ['living', 'kitchen', 'bedroom', 'desk-side', 'desk-top']);
  assert.deepEqual(ROOM_AREAS, ['living', 'kitchen', 'bedroom']);
  assert.deepEqual(FRAMINGS, ['wide', 'medium']);
  assert.deepEqual(LIGHT_MODES, ['neutral', 'window', 'warm']);
});

test('every duck view renders as a well-formed standalone svg with scoped ids', () => {
  for (const view of DUCK_VIEWS) {
    const svg = renderDuck(view, { idPrefix: 'duck1' });
    assert.ok(svg.startsWith('<svg viewBox="0 0 360 270"'), view);
    assert.ok(wellFormed(svg), view);
    for (const id of ids(svg)) assert.ok(id.startsWith('duck1-'), `${view}: ${id}`);
    for (const r of refs(svg)) assert.ok(ids(svg).includes(r), `${view}: dangling ${r}`);
    assert.ok(svg.length < 24_000, `${view} ${svg.length}`);
  }
  assert.throws(() => renderDuck('profile', { idPrefix: 'd' }), RangeError);
});

test('option validation rejects malformed input, including options a branch would ignore', () => {
  assert.throws(() => renderScene({ area: 'living' }), TypeError);                                   // missing prefix
  for (const bad of ['', 'A1', '1a', 'a b', 'a_b', 'x'.repeat(25), 7]) assert.throws(() => scene({ idPrefix: bad }), /idPrefix/, String(bad));
  assert.throws(() => scene({ area: 'garage' }), RangeError);
  assert.throws(() => scene({ light: 'dark' }), RangeError);
  assert.throws(() => scene({ framing: 'close' }), RangeError);
  assert.throws(() => scene({ duckView: 'profile' }), RangeError);
  assert.throws(() => scene({ overlay: 'css' }), RangeError);
  assert.throws(() => scene({ decorative: 'yes' }), TypeError);
  assert.throws(() => scene({ surprise: 1 }), TypeError);
  assert.throws(() => scene({ furnishings: { couch: 'sold' } }), RangeError);
  assert.throws(() => scene({ furnishings: { sofa: 'present' } }), TypeError);
  // invalid values on an ignored branch are still rejected
  assert.throws(() => renderScene({ area: 'desk-top', idPrefix: 'a', framing: 'close' }), RangeError);
  assert.throws(() => renderScene({ area: 'kitchen', idPrefix: 'a', furnishings: { tv: 'gone' } }), RangeError);
  assert.throws(() => renderScene({ area: 'bedroom', idPrefix: 'a', phone: { note: 5 } }), TypeError);
  assert.throws(() => scene({ label: 'x'.repeat(121) }), RangeError);
});

test('phone copy is bounded, escaped and may be deliberately empty', () => {
  const desk = (phone) => renderScene({ area: 'desk-side', idPrefix: 'p', phone });
  assert.throws(() => desk({ heading: ['a', 'b', 'c'] }), RangeError);
  assert.throws(() => desk({ heading: 'Hello' }), TypeError);
  assert.throws(() => desk({ brand: 'x'.repeat(PHONE_LIMITS.brand + 1) }), RangeError);
  assert.throws(() => desk({ note: 'bad\u0000char' }), RangeError);
  assert.throws(() => desk({ status: 'a\uD800' }), RangeError);
  assert.throws(() => desk({ extra: 'x' }), TypeError);
  const tricky = desk({ brand: '<b>&"\'', note: '<script>x</script>'.slice(0, PHONE_LIMITS.note) }).svg;
  assert.ok(tricky.includes('&lt;b&gt;&amp;&quot;&apos;'));
  assert.ok(!/<script/i.test(tricky) && !tricky.includes('<b>'));
  assert.ok(wellFormed(tricky));
  const empty = desk({ status: '', brand: '', heading: [], body: [], note: '' }).svg;
  assert.ok(wellFormed(empty) && !empty.includes('QUACKPOT') && !empty.includes('Welcome') && !empty.includes('9:41'));
  assert.ok(desk({}).svg.includes('Limited-time invitation'));
});

test('actual duck view and any fallback are reported truthfully for every request and area', () => {
  for (const area of AREAS) for (const requested of DUCK_VIEWS) {
    const { meta, svg } = renderScene({ area, idPrefix: 'm', duckView: requested });
    const overheadCamera = area === 'desk-top';
    const expected = overheadCamera ? 'top' : ['front', 'side', 'rear'].includes(requested) ? requested : 'side';
    assert.equal(meta.requestedDuckView, requested);
    assert.equal(meta.duckView, expected, `${area}/${requested}`);
    if (expected === requested) assert.equal(meta.fallback, null);
    else { assert.equal(meta.fallback.from, requested); assert.equal(meta.fallback.to, expected); assert.ok(meta.fallback.reason.length > 10); }
    assert.equal(meta.shotKey, area.startsWith('desk') ? area : `${area}-wide`);
    assert.ok(svg.length > 1000);
  }
  assert.deepEqual(renderScene({ area: 'desk-top', idPrefix: 'm', framing: 'medium', furnishings: { tv: 'removed' } }).meta.ignored, ['framing', 'furnishings']);
  assert.deepEqual(renderScene({ area: 'kitchen', idPrefix: 'm', phone: {} }).meta.ignored, ['phone']);
  assert.equal(renderScene({ area: 'kitchen', idPrefix: 'm', framing: 'medium' }).meta.shotKey, 'kitchen-medium');
});

test('repeated scenes with distinct prefixes keep ids unique and references resolvable', () => {
  const docs = [];
  for (const area of AREAS) for (const [n, light] of LIGHT_MODES.entries()) docs.push(renderScene({ area, idPrefix: `s${docs.length}`, light, duckView: n === 0 ? 'front' : 'side' }).svg);
  docs.push(renderDuck('front', { idPrefix: 'dd' }), renderDuck('top', { idPrefix: 'dt' }));
  const all = docs.join('');
  const declared = ids(all);
  assert.equal(new Set(declared).size, declared.length, 'duplicate ids across scenes');
  const known = new Set(declared);
  for (const r of refs(all)) assert.ok(known.has(r), `dangling reference ${r}`);
  docs.slice(0, -2).forEach((svg, i) => { for (const id of ids(svg)) assert.ok(id.startsWith(`s${i}-`), id); });
});

test('output is static, self-contained svg: no external references, scripts or handlers', () => {
  for (const area of AREAS) for (const light of LIGHT_MODES) {
    const { svg } = renderScene({ area, idPrefix: 'safe', light, decorative: false, label: 'A "quoted" <label>' });
    assert.ok(wellFormed(svg), `${area}/${light}`);
    assert.ok(!/(https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(svg), 'external url');
    assert.ok(!/<(script|foreignObject|image|iframe|use|animate|set)\b/i.test(svg), 'forbidden element');
    assert.ok(!/\son[a-z]+=/i.test(svg) && !/javascript:/i.test(svg), 'handler');
    for (const h of svg.matchAll(/href="([^"]*)"/g)) assert.ok(h[1].startsWith('#'), `href ${h[1]}`);
    assert.ok(!/@import|@font-face|url\((?!#)/.test(svg), 'css import or external url()');
    const root = svg.match(/^<svg[^>]*>/)[0];   // inner decorative groups (lamp glow) legitimately keep aria-hidden
    assert.ok(root.includes('A &quot;quoted&quot; &lt;label&gt;') && root.includes('role="img"') && !root.includes('aria-hidden'));
    assert.ok(svg.length < 64_000, `${area}/${light} ${svg.length}`);
  }
  const hidden = renderScene({ area: 'kitchen', idPrefix: 'h' }).svg;
  assert.ok(hidden.startsWith('<svg') && /aria-hidden="true"/.test(hidden.match(/^<svg[^>]*>/)[0]) && !/role="img"/.test(hidden.match(/^<svg[^>]*>/)[0]));
});

test('light modes are baked into the scene and the overlay is optional', () => {
  const warm = renderScene({ area: 'kitchen', idPrefix: 'w', light: 'warm' }), neutral = renderScene({ area: 'kitchen', idPrefix: 'w', light: 'neutral' });
  assert.ok(warm.svg.includes('.apt-w .lamp-on{opacity:1}') && neutral.svg.includes('.apt-w .lamp-on{opacity:0}'));
  assert.ok(warm.svg.includes('.cast-lamp{display:inline') && !neutral.svg.includes('.cast-lamp{display:inline'));
  assert.ok(warm.svg.includes('rgb(255,190,98)') && !neutral.svg.includes('rgb(255,190,98)') && renderScene({ area: 'kitchen', idPrefix: 'w', light: 'window' }).svg.includes('rgb(255,245,205)'));
  const none = renderScene({ area: 'kitchen', idPrefix: 'w', light: 'warm', overlay: 'none' });
  assert.ok(!none.svg.includes('rgb(255,190,98)') && none.svg.length < warm.svg.length);
  assert.equal(warm.lighting.mode, 'warm');
  for (const k of ['x', 'y', 'rx', 'ry']) assert.ok(Number.isFinite(warm.lighting[k] ?? warm.lighting.center[k]), k);
  assert.ok(warm.svg.includes('mix-blend-mode:screen') && warm.svg.includes('vector-effect:non-scaling-stroke'));
});

test('couch and TV visibility flags change only their own item', () => {
  const marker = { couch: '#6d6d64', tv: '#1f2c38' };           // sofa back fill / TV screen fill
  const v = (couch, tv) => renderScene({ area: 'living', idPrefix: 'f', furnishings: { couch, tv } });
  const both = v('present', 'present'), none = v('removed', 'removed'), noCouch = v('removed', 'present'), noTv = v('present', 'removed');
  assert.ok(both.svg.includes(marker.couch) && both.svg.includes(marker.tv));
  assert.ok(!none.svg.includes(marker.couch) && !none.svg.includes(marker.tv));
  assert.ok(!noCouch.svg.includes(marker.couch) && noCouch.svg.includes(marker.tv));
  assert.ok(noTv.svg.includes(marker.couch) && !noTv.svg.includes(marker.tv));
  assert.equal(new Set([both.svg, none.svg, noCouch.svg, noTv.svg]).size, 4);
  assert.deepEqual(noCouch.meta.furnishings, { couch: 'removed', tv: 'present' });
  assert.equal(renderScene({ area: 'kitchen', idPrefix: 'f' }).meta.furnishings, null);
});

test('framing changes only the medium crop of room scenes', () => {
  for (const area of ROOM_AREAS) {
    const wide = renderScene({ area, idPrefix: 'r', framing: 'wide' }).svg, medium = renderScene({ area, idPrefix: 'r', framing: 'medium' }).svg;
    assert.ok(wide.includes('viewBox="0 0 960 540"') && !medium.includes('viewBox="0 0 960 540"'), area);
    const [, , w, h] = medium.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    assert.ok(Math.abs(w / h - 960 / 540) < 0.01 && w < 960, area);
  }
});

test('pure and deterministic: identical output, inputs untouched, no global state', () => {
  const globalsBefore = Object.keys(globalThis).sort().join();
  const opts = Object.freeze({ area: 'bedroom', idPrefix: 'pure', light: 'warm', framing: 'medium', phone: Object.freeze({ note: 'ok' }), furnishings: Object.freeze({ couch: 'present' }) });
  const a = renderScene(opts), b = renderScene(opts);
  assert.equal(a.svg, b.svg); assert.deepEqual(a.meta, b.meta); assert.deepEqual(a.lighting, b.lighting);
  assert.equal(renderDuck('rear', { idPrefix: 'pure' }), renderDuck('rear', { idPrefix: 'pure' }));
  assert.equal(Object.keys(globalThis).sort().join(), globalsBefore);
});

test('kit modules never import report files or use hidden state', () => {
  const files = [];
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (f.endsWith('.mjs') && !f.endsWith('.test.mjs')) files.push(f); } };
  walk(KIT_DIR);
  assert.ok(files.length >= 20);
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/^\s*(?:import|export)\b[^;]*?from\s+['"]([^'"]+)['"]/gm)) assert.ok(m[1].startsWith('./') || m[1].startsWith('../'), `${f}: non-relative import ${m[1]}`), assert.ok(!/reports/.test(m[1]), `${f}: imports reports`);
    assert.ok(!/\b(document|window|localStorage|setTimeout|setInterval|requestAnimationFrame|MutationObserver|fetch)\b\s*[.(]/.test(src.replace(/\/\/.*$/gm, '')), `${f}: touches browser/global APIs`);
  }
});
