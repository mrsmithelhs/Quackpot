// Authoring tool (NOT runtime): mechanically slices the mechanical parts of the frozen Plan 10 sources into
// src/assets/apartment/. Deterministic; reads exact git blobs verified by id (see baseline.mjs).
// Usage (repo root):  node reports/development/plan-24-apartment-art-extraction/tools/extract-verbatim.mjs
// Writes: core/constants.mjs, lighting/defs.mjs, duck/views.mjs, duck/overhead.mjs, props/{prims,decor,living,kitchen,bedroom,toys}.mjs
import fs from 'node:fs';
import path from 'node:path';
import { loadBaseline, REPO_ROOT, FROZEN } from './baseline.mjs';

const OUT = path.join(REPO_ROOT, 'src/assets/apartment');
const { previewText, duckViewsText, lines } = loadBaseline();
const prov = (what, a, b) => `// Extracted verbatim from ${FROZEN.preview.path} (blob ${FROZEN.preview.blob.slice(0, 8)}, ${what}${a ? `, lines ${a}-${b}` : ''}) by Plan 24.\n// Pure static SVG-string builders: no DOM, no state, no side effects.\n`;
const write = (rel, text) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); console.log('wrote', rel, text.length); };
const lineNo = needle => { const i = lines.findIndex(l => l.startsWith(needle)); if (i < 0) throw new Error(`marker not found: ${needle}`); return i; };
const dedent = l => (l.startsWith('  ') ? l.slice(2) : l);

// ---- top-level statements of the preview script, keyed by declared name ----
const scriptStart = lineNo('  let svgInstance = 0;'), scriptEnd = lineNo('  function update() {');
const stmts = {};
{
  let cur = null;
  for (let i = scriptStart; i < scriptEnd; i++) {
    const m = lines[i].match(/^  (?:const|function) ([A-Za-z_$][\w$]*)/);
    if (m) { cur = { name: m[1], from: i + 1, to: i + 1, text: [lines[i]] }; stmts[m[1]] = cur; }
    else if (cur && (lines[i].startsWith('   ') || lines[i].startsWith('  }') || lines[i].startsWith('  `'))) { cur.text.push(lines[i]); cur.to = i + 1; }
    else if (lines[i].trim() === '' || lines[i].trim().startsWith('//')) { cur = null; }
    else if (cur) { cur.text.push(lines[i]); cur.to = i + 1; }
  }
}
// Only the first line is dedented: continuation lines may sit inside multi-line template literals, whose content must stay byte-exact.
const stmtText = n => { if (!stmts[n]) throw new Error(`statement not found: ${n}`); const [first, ...rest] = stmts[n].text; return [dedent(first), ...rest].join('\n'); };
const exportify = n => stmtText(n).replace(/^(const|function) /, 'export $1 ');

// ---- core/constants.mjs ----
{
  const one = stmts.F.text[0];   // "  const F = 950, CX = 480, DUCK_UNITS_PER_MM = 3.34;   // ..." (single line)
  write('core/constants.mjs', `${prov('constants')}// Camera, scale and framing constants shared by every scene. Single source of truth; do not duplicate.\n`
    + `export const SCENE_BOX = { w: 960, h: 540 };   // room/desk scene viewBox (wide framing)\n`
    + `export const DUCK_FRAME = { w: 360, h: 270, contentBottom: 250 };   // every duck view is drawn in this frame\n`
    + ['PX_MM', 'PHONE_MM', 'DUCK_SCALE', 'DUCK_CX'].map(exportify).join('\n') + '\n'
    + one.replace(/^  const /, 'export const ').replace(/^export const F = 950, CX = 480, DUCK_UNITS_PER_MM = 3.34;/, 'export const F = 950, CX = 480, DUCK_UNITS_PER_MM = 3.34;') + '\n');
}

// ---- lighting/defs.mjs ----
write('lighting/defs.mjs', `${prov('sceneDefs', stmts.sceneDefs.from, stmts.sceneDefs.to)}// Shared gradients and blur filters used by every desk and room scene (ids are scoped later by core/ids.mjs).\n${exportify('sceneDefs')}\n`);

// ---- duck/views.mjs: byte-identical views object from frozen duck-views.js ----
write('duck/views.mjs', `// Five static physical-duck views (front three-quarter, side, rear three-quarter, high, low).\n// Body of this file below the marker is byte-identical to the frozen Plan 10 duck-views.js (blob ${FROZEN.duckViews.blob.slice(0, 8)}); a test checks that.\n// DUCK-VIEWS-BEGIN\n${duckViewsText}`);

// ---- duck/overhead.mjs ----
write('duck/overhead.mjs', `${prov('topDuckInner', stmts.topDuckInner.from, stmts.topDuckInner.to)}// Sixth duck representation: the overhead drawing used by the top-down desk (360x270 frame, head circle,\n// bill ahead, body oval, wing lobes, tail bump; light from the upper left).\n${exportify('topDuckInner')}\n`);

// ---- props ----
const FAMILY = {
  prims: ['R', 'Ci', 'El', 'Pg', 'Pa', 'NS', 'sc_'],
  decor: ['art', 'windowMm', 'plant', 'mug', 'magazines', 'clock', 'clockSmall'],
  living: ['sofa', 'coffeeTable', 'tvUnit', 'floorLamp'],
  kitchen: ['fridge', 'cabinetRun', 'stove', 'pot', 'hood', 'upperCabs', 'kettle', 'toaster', 'jars', 'bar', 'stool', 'fruit', 'pendant'],
  bedroom: ['bed', 'bedside', 'bedLamp'],
  toys: ['toyShelf', 'teddy', 'block', 'robot', 'truck', 'rings', 'ball', 'bunny']
};
const PRIMS = ['R', 'Ci', 'El', 'Pg', 'Pa', 'NS', 'sc_'];
const allProps = Object.values(FAMILY).flat();
for (const [fam, names] of Object.entries(FAMILY)) {
  const body = names.map(exportify).join('\n');
  let header = prov(`${fam}`, Math.min(...names.map(n => stmts[n].from)), Math.max(...names.map(n => stmts[n].to)));
  if (fam === 'prims') header += '// Drawing primitives. Every prop is drawn in millimetres as a front elevation: origin = base centre, y negative up.\n';
  else {
    const used = PRIMS.filter(p => new RegExp(`(?<![\\w$])${p.replace('$', '\\$')}(?![\\w$])`).test(body));
    header += `import { ${used.join(', ')} } from './prims.mjs';\n`;
    const otherProps = allProps.filter(n => !names.includes(n) && !PRIMS.includes(n) && new RegExp(`(?<![\\w$])${n}\\(`).test(body));
    if (otherProps.length) throw new Error(`${fam} depends on other props: ${otherProps}`);
  }
  write(`props/${fam}.mjs`, `${header}\n${body}\n`);
}
console.log('done; statements found:', Object.keys(stmts).length);
