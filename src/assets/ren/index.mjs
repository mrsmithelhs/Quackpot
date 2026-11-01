import { assertIdPrefix, scopeIds } from '../apartment/core/ids.mjs';
import { figureDefs, doorSource } from './source.mjs';
import { renderScene } from '../apartment/index.mjs';
import { patches } from './scene-patches.mjs';

const expressions = Object.freeze({ warm: 'warm', laugh: 'laugh', tease: 'tease', 'not-tonight': 'sorry', 'long-day': 'tired', listening: 'listen' });
export const REN_EXPRESSIONS = Object.freeze(Object.keys(expressions));
export const REN_FRAMINGS = Object.freeze(['avatar', 'bust']);
const style = `<style>svg{--skin:#a8703f;--shade:#8a5428;--blush:#c9784f;--hair:#2a1d17}.skin{fill:var(--skin)}.shade{fill:var(--shade)}.blush{fill:var(--blush)}.hair{fill:var(--hair)}.l3{stroke:#3a2c26;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.l2{stroke:#3a2c26;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}</style>`;
function options(input, allowed) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('options must be an object');
  for (const key of Object.keys(input)) if (!allowed.includes(key)) throw new TypeError(`unknown option: ${key}`);
  assertIdPrefix(input.idPrefix);
  if (input.decorative !== undefined && typeof input.decorative !== 'boolean') throw new TypeError('decorative must be boolean');
}
// Make the original source classes unique as well as IDs: inline SVG style rules otherwise affect neighbors.
function isolateClasses(svg, prefix) {
  for (const cls of ['skin', 'shade', 'blush', 'hair', 'l3', 'l2']) {
    svg = svg.replace(new RegExp(`\\.${cls}\\b`, 'g'), `.ren-${prefix}-${cls}`)
      .replace(/class="([^"]*)"/g, (_, values) => `class="${values.split(/\s+/).map(v => v === cls ? `ren-${prefix}-${v}` : v).join(' ')}"`);
  }
  return svg.replace(/:root,svg\{/g, `.ren-${prefix}-root{`).replace(/<style>svg\{/g, `<style>.ren-${prefix}-root{`)
    .replace(/<svg\b([^>]*)>/, (_, attrs) => /\bclass="/.test(attrs) ? `<svg${attrs.replace(/class="/, `class="ren-${prefix}-root `)}>` : `<svg class="ren-${prefix}-root"${attrs}>`);
}
function finish(svg, prefix) { return scopeIds(isolateClasses(svg, prefix), prefix); }
export function renderRen(input = {}) {
  options(input, ['idPrefix', 'expression', 'framing', 'decorative']);
  const expression = input.expression ?? 'warm', framing = input.framing ?? 'bust';
  if (!Object.hasOwn(expressions, expression)) throw new RangeError('unsupported expression');
  if (!REN_FRAMINGS.includes(framing)) throw new RangeError('unsupported framing');
  const viewBox = framing === 'avatar' ? '46 30 148 148' : '0 0 240 300';
  const access = input.decorative ? 'aria-hidden="true"' : `role="img" aria-label="Ren: ${expression}"`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${access}>${style}<defs>${figureDefs}</defs><use href="#r4-fig-${expressions[expression]}"/></svg>`;
  return { svg: finish(svg, input.idPrefix), meta: { expression, framing, viewBox, pose: 'front', complexion: 'A', pencil: 'ear' } };
}
export function renderRenScene(input = {}) {
  options(input, ['idPrefix', 'scene', 'decorative']);
  if (input.scene === 'couch-close') return livingScene(input.idPrefix, 'ren-couch-medium', input.decorative);
  if (input.scene !== 'door') throw new RangeError('unsupported scene');
  let svg = doorSource.replace(/ role="img" aria-label="[^"]*"/, input.decorative ? ' aria-hidden="true"' : ' role="img" aria-label="Ren at the apartment door"');
  return { svg: finish(svg, input.idPrefix), meta: { scene: 'door', viewBox: '0 0 960 540', bodyEdge: 'frame', candidate: true } };
}

// Full-output drift fingerprint; not a cryptographic authenticity check.
export function baselineFingerprint(s) {
  let a = 2166136261, b = 5381;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = (Math.imul(b, 33) ^ c) | 0; }
  return [a >>> 0, b >>> 0].map(n => n.toString(16).padStart(8, '0')).join('');
}
const fingerprints = Object.freeze({'ren-couch-medium':'2cbc01bb3ec0b079', 'ren-floor-game-night':'6fa7b2d744181793'});
// Patch only the changed source spans; fingerprint and contexts detect baseline drift.
function livingScene(prefix, name, decorative) {
  const floor = name === 'ren-floor-game-night';
  let svg = renderScene({ area: 'living', idPrefix: name, framing: 'wide', light: 'window', furnishings: floor ? {couch:'removed', tv:'present'} : undefined, duckView: 'side', decorative: false, label: 'baseline' }).svg;
  const patch = patches[name];
  if (svg.length !== patch.length || baselineFingerprint(svg) !== fingerprints[name]) throw new Error('Apartment baseline drift: fingerprint');
  for (const op of patch.ops) {
    if (svg.slice(op.start,op.end) !== op.old || svg.slice(Math.max(0,op.start-40),op.start) !== op.before || svg.slice(op.end,op.end+40) !== op.after) throw new Error('Apartment baseline drift: context');
  }
  for (const op of [...patch.ops].reverse()) svg = svg.slice(0,op.start) + op.value + svg.slice(op.end);
  svg = svg.replaceAll(`apt-${name}`, `apt-${prefix}-${name}`);
  if (decorative) svg = svg.replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
  return {svg: finish(svg, prefix), meta: floor
    ? {scene:'floor-game-night-original', viewBox:'0 0 960 540', bodyEdge:'coffee-table', duckSupport:'blue magazine', candidate:true}
    : {scene:'couch-close', viewBox:'536 100 400 225', bodyEdge:'sofa foreground', candidate:true}};
}
/** Unreviewed original floor composition; gallery reference only, not a production scene contract. */
export function renderFloorCandidate(input = {}) {
  options(input, ['idPrefix', 'decorative']);
  return livingScene(input.idPrefix, 'ren-floor-game-night', input.decorative);
}
