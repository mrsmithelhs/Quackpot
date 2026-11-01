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

// Flat board game seen from the kit's slightly raised camera: a trapezoid of coloured cells with a few pawns.
function boardGame() {
  const half = y => 250 - 30 * (-y / 72);
  let s = `<polygon points="-250,0 250,0 220,-72 -220,-72" fill="#f1e3c8" stroke="#3a2c26" stroke-width="6" stroke-linejoin="round"/>`;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const y0 = -8 - r * 18, y1 = y0 - 16, cw0 = 2 * (half(y0) - 14) / 6, cw1 = 2 * (half(y1) - 14) / 6;
    const x = (cw, k, y) => -(half(y) - 14) + cw * k;
    s += `<polygon points="${x(cw0, c, y0)},${y0} ${x(cw0, c + 1, y0)},${y0} ${x(cw1, c + 1, y1)},${y1} ${x(cw1, c, y1)},${y1}" fill="${(r + c) % 2 ? '#4f6d7a' : '#c76b3d'}" stroke="none"/>`;
  }
  const pawn = (cx, cy, f) => `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="15" fill="${f}" stroke="#3a2c26" stroke-width="4"/>`;
  return s + pawn(-120, -30, '#e0b341') + pawn(-40, -48, '#e58f8f') + pawn(90, -34, '#6b7b4a') + R(150, -34, 26, 20, '#f6e9d6', 4, 'stroke="#3a2c26" stroke-width="3"');
}

const origItems = {};
for (const k of Object.keys(ROOM_SPECS)) origItems[k] = ROOM_SPECS[k].items;
const origOnTable = {};
for (const k of Object.keys(ROOM_SPECS)) origOnTable[k] = ROOM_SPECS[k].onTable;
const origAnchor = {};
for (const k of Object.keys(ROOM_SPECS)) origAnchor[k] = ROOM_SPECS[k].anchor;
const setExtra = (area, extra) => { ROOM_SPECS[area].items = f => [...origItems[area](f), ...extra]; };

const scenes = [
  { id: 'ren-couch-wide', area: 'living', light: 'window', label: 'Ren sitting on the couch in the living room, the physical rubber duck on the coffee table',
    ren: renItem('outfits/cardigan-terracotta/cardigan-terracotta-v2.svg', { X: 1050, z: 3900, cutY: 420, s: 2.4 }),
    extra: s => [s.ren, { X: 1350, z: 3900, Y: 0, mm: sofaFront(1500) }] },
  { id: 'ren-couch-medium', area: 'living', light: 'window', crop: '536 100 400 225', label: 'Close view of Ren sitting on the couch',
    ren: renItem('outfits/pajama-navy/pajama-navy.svg', { X: 1050, z: 3900, cutY: 420, s: 2.4 }),
    extra: s => [s.ren, { X: 1350, z: 3900, Y: 0, mm: sofaFront(1500) }] },
  { id: 'ren-loveseat-wide', area: 'living', light: 'neutral', label: 'Ren sitting in a small sofa to the left of the living room, the couch empty',
    ren: renItem('outfits/vest-puffer/vest-puffer-v3.svg', { X: -250, z: 3000, cutY: 420, s: 2.4 }),
    extra: s => [{ X: -250, z: 3000, Y: 0, mm: sofa(900), shadow: 1000 }, s.ren, { X: -250, z: 3000, Y: 0, mm: sofaFront(900) }] },
  { id: 'ren-kitchen-bar-wide', area: 'kitchen', light: 'window', label: 'Ren standing behind the kitchen bar, the physical rubber duck on the bar top',
    ren: renItem('outfits/camp-shirt-geometric/camp-shirt-geometric.svg', { X: 250, z: 1150, cutY: 770, s: 2.4 }),
    extra: s => [s.ren] },
  { id: 'ren-kitchen-bar-medium', area: 'kitchen', light: 'window', crop: '446 30 480 270', label: 'Close view of Ren behind the kitchen bar',
    ren: renItem('outfits/apron-tool/apron-tool.svg', { X: 250, z: 1150, cutY: 770, s: 2.4 }),
    extra: s => [s.ren] },
  // Floor game night (couch sold, plan 05 Example 1): couch removed, Ren sits on the floor behind the coffee table, the table hides the cut.
  { id: 'ren-floor-game-night', area: 'living', light: 'window', furn: { couch: 'removed', tv: 'present' },
    // the duck rides on top of the blue magazine (stack is 52 mm tall) and faces left toward the board; X is just right of the magazines' X so they draw first
    anchor: { X: 262, z: 900, Y: 482 },
    onTable: [{ X: -150, z: 900, Y: 430, mm: boardGame() }],
    label: 'Ren on the floor at a board game night, couch gone, duck on a magazine facing the board',
    ren: renItem('outfits/cardigan-terracotta/cardigan-terracotta-v2.svg', { X: -150, z: 1500, cutY: 300, s: 2.4 }),
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
  if (sc.onTable) ROOM_SPECS[sc.area].onTable = [...origOnTable[sc.area], ...sc.onTable];
  if (sc.anchor) ROOM_SPECS[sc.area].anchor = sc.anchor;
  const prefix = sc.id.slice(0, 22).replace(/[^a-z0-9-]/g, '');
  const r = renderScene({ area: sc.area, idPrefix: prefix, framing: 'wide', light: sc.light, furnishings: sc.furn, duck: sc.duck ?? true, duckView: 'side', decorative: false, label: sc.label });
  let svg = r.svg.replace(/^<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"');
  svg = svg.replace(/<\/svg>$/, `${css(prefix)}</svg>`);
  if (sc.crop) svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${sc.crop}"`);
  // restore the untouched specs for the next scene
  for (const k of Object.keys(origItems)) ROOM_SPECS[k].items = origItems[k];
  for (const k of Object.keys(origOnTable)) ROOM_SPECS[k].onTable = origOnTable[k];
  for (const k of Object.keys(origAnchor)) ROOM_SPECS[k].anchor = origAnchor[k];
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
