// Report-local composition script (Plan 41). Reads the apartment art kit (read-only imports from src/assets/apartment)
// and Ren's concept SVGs, and writes static SVG scenes with Ren placed in the kit's perspective at real depth.
// It mutates the kit's in-memory ROOM_SPECS only for the lifetime of this process; no source file is changed.
// Output: ./scenes/*.svg and ./scenes/index.html. Not a game asset, not imported by the game.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderScene } from '../../../../../src/assets/apartment/index.mjs';
import { ROOM_SPECS } from '../../../../../src/assets/apartment/rooms/specs.mjs';
import { sofa, R } from '../../../../../src/assets/apartment/props/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const svgRound = resolve(here, '../svg-round-01');
const outDir = resolve(here, 'scenes');
mkdirSync(outDir, { recursive: true });

// --- Ren sprite -> kit millimetre item. Figure space is 240x300 with (120,300) at the chest cut. `cutY` is the world height (mm)
// of that cut line; `s` is mm per figure unit. Furniture drawn after Ren hides the cut.
function renItem(file, { X, z, cutY, s }) {
  let body = readFileSync(resolve(svgRound, file), 'utf8');
  body = body.replace(/<\?xml[^>]*>/, '').replace(/<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<style>[\s\S]*?<\/style>/, '').replace(/<rect width="240" height="300" fill="#efe3cc"\/>/, '');
  const mm = `<g class="ren" transform="translate(0 ${-cutY}) scale(${s}) translate(-120 -300)">${body}</g>`;
  return { X, z, Y: 0, mm };
}
// Foreground pieces of the kit's sofa (arms, seat cushions, base strip), redrawn in the same colours so they overlap a seated Ren.
const sofaFront = w => R(-w / 2 + 150, -150, w - 300, 40, '#5e5e56') + R(-w / 2, -610, 160, 500, '#65655c', 60) + R(w / 2 - 160, -610, 160, 500, '#65655c', 60)
  + R(-w / 2 + 150, -440, (w - 300) / 2, 310, '#8a897e', 40) + R(0, -440, (w - 300) / 2, 310, '#8a897e', 40);

const origItems = {};
for (const k of Object.keys(ROOM_SPECS)) origItems[k] = ROOM_SPECS[k].items;
const setExtra = (area, extra) => { ROOM_SPECS[area].items = f => [...origItems[area](f), ...extra]; };

const scenes = [
  { id: 'ren-couch-wide', area: 'living', light: 'window', label: 'Ren sitting on the couch in the living room, the physical rubber duck on the coffee table',
    ren: renItem('outfits/cardigan-terracotta/cardigan-terracotta-v2.svg', { X: 1050, z: 3900, cutY: 420, s: 2.4 }),
    extra: s => [s.ren, { X: 1350, z: 3900, Y: 0, mm: sofaFront(1500) }] },
  { id: 'ren-couch-medium', area: 'living', light: 'window', crop: '536 100 400 225', label: 'Close view of Ren sitting on the couch',
    ren: renItem('outfits/pajama-navy/pajama-navy.svg', { X: 1050, z: 3900, cutY: 420, s: 2.4 }),
    extra: s => [s.ren, { X: 1350, z: 3900, Y: 0, mm: sofaFront(1500) }] },
  { id: 'ren-loveseat-wide', area: 'living', light: 'neutral', label: 'Ren sitting in a small sofa to the left of the living room, the couch empty',
    ren: renItem('outfits/coveralls-olive/coveralls-olive.svg', { X: -250, z: 3000, cutY: 420, s: 2.4 }),
    extra: s => [{ X: -250, z: 3000, Y: 0, mm: sofa(900), shadow: 1000 }, s.ren, { X: -250, z: 3000, Y: 0, mm: sofaFront(900) }] },
  { id: 'ren-kitchen-bar-wide', area: 'kitchen', light: 'window', label: 'Ren standing behind the kitchen bar, the physical rubber duck on the bar top',
    ren: renItem('outfits/camp-shirt-geometric/camp-shirt-geometric.svg', { X: 250, z: 1150, cutY: 770, s: 2.4 }),
    extra: s => [s.ren] },
  { id: 'ren-kitchen-bar-medium', area: 'kitchen', light: 'window', crop: '446 30 480 270', label: 'Close view of Ren behind the kitchen bar',
    ren: renItem('outfits/paint-overalls/paint-overalls.svg', { X: 250, z: 1150, cutY: 770, s: 2.4 }),
    extra: s => [s.ren] }
];

const css = p => `<style>.apt-${p}.room-scene .o .ren{stroke:none;--skin:#a8703f;--shade:#8a5428;--blush:#c9784f;--hair:#2a1d17}`
  + `.apt-${p}.room-scene .o .ren *{vector-effect:none}`
  // Ancestor selectors do not match inside <use> instances, so the fill/line classes are deliberately unscoped (class names are Ren-only).
  + `.skin{fill:var(--skin)}.shade{fill:var(--shade)}.blush{fill:var(--blush)}.hair{fill:var(--hair)}`
  + `.l3{stroke:#3a2c26;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.l2{stroke:#3a2c26;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}</style>`;

const written = [];
for (const sc of scenes) {
  setExtra(sc.area, sc.extra(sc));
  const prefix = sc.id.slice(0, 22).replace(/[^a-z0-9-]/g, '');
  const r = renderScene({ area: sc.area, idPrefix: prefix, framing: 'wide', light: sc.light, duckView: 'side', decorative: false, label: sc.label });
  let svg = r.svg.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  svg = svg.replace(/<\/svg>$/, `${css(prefix)}</svg>`);
  if (sc.crop) svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${sc.crop}"`);
  // restore the untouched specs for the next scene
  for (const k of Object.keys(origItems)) ROOM_SPECS[k].items = origItems[k];
  writeFileSync(resolve(outDir, `${sc.id}.svg`), svg);
  written.push({ id: sc.id, bytes: svg.length, label: sc.label });
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Plan 41 Ren in the apartment (kit camera)</title>
<style>body{margin:0;padding:12px;background:#f6efe2;font:14px system-ui,sans-serif;color:#2d2420}h1{font-size:16px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:10px}figure{margin:0}img{width:100%;height:auto;display:block;border:1px solid #d9ccb4}figcaption{font-size:12px;margin-top:2px}</style></head><body>
<h1>Ren in the apartment, drawn into the art kit's own camera (concept composition; PROPOSED, not game art)</h1><div class="g">
${written.map(w => `<figure><img src="${w.id}.svg" alt="${w.label}"><figcaption>${w.id}: ${w.label}</figcaption></figure>`).join('\n')}
</div></body></html>`;
writeFileSync(resolve(outDir, 'index.html'), html);
console.log(JSON.stringify(written));
