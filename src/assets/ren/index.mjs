import { assertIdPrefix, scopeIds } from '../apartment/core/ids.mjs';
import { figureDefs, doorSource } from './source.mjs';
import { renderScene } from '../apartment/index.mjs';
import { patches } from './scene-patches.mjs';
import { tvUnit } from '../apartment/props/living.mjs';
import { closedDoorSource } from './closed-door.mjs';
import { arrivalScenes } from './arrival-scenes.mjs';

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
// Owner-selected door hand: a derived replacement of the original arm/hand fragment.
const originalHand = `<path class="skin l3" d="M216 300 L200 262 L178 268 L192 300Z"/>
  <ellipse class="skin l3" cx="186" cy="262" rx="13" ry="9" transform="rotate(-20 186 262)"/>
  <path class="l2" fill="none" d="M176 258 Q182 262 190 258"/>`;
const selectedHand = `<path class="skin l3" d="M216 300 L207 281 Q205 276 205 270 Q205 265 204 263 Q208 257 205 254 Q202 252 199 259 Q197 258 195 259 L190 259 Q187 259 187 262 Q187 264 190 265 L187 265 Q184 265 184 268 Q184 271 187 271 L189 271 Q186 271 186 274 Q186 277 190 277 L192 277 Q189 277 189 280 Q189 282 192 282 L195 281 Q198 282 199 285 L192 300Z"/><path class="l2" fill="none" d="M190 265 L198 264 M189 271 L198 270 M192 277 L200 275"/>`;
function replaceOnce(source, from, to, name) {
  const pos = source.indexOf(from);
  if (pos < 0 || source.indexOf(from, pos + from.length) !== -1) throw new Error(`${name} source drift`);
  return source.slice(0, pos) + to + source.slice(pos + from.length);
}
export function renderRenScene(input = {}) {
  options(input, ['idPrefix', 'scene', 'decorative']);
  if (input.scene === 'couch-close') return livingScene(input.idPrefix, 'ren-couch-medium', input.decorative);
  if (input.scene === 'closed-door') {
    const access = input.decorative ? 'aria-hidden="true"' : 'role="img" aria-label="The closed apartment door"';
    return { svg: finish(closedDoorSource.replace('<svg ', `<svg ${access} `), input.idPrefix), meta: { scene: 'closed-door', viewBox: '0 0 960 540' } };
  }
  if (input.scene !== 'door') throw new RangeError('unsupported scene');
  let svg = replaceOnce(doorSource, originalHand, selectedHand, 'Door hand').replace(/ role="img" aria-label="[^"]*"/, input.decorative ? ' aria-hidden="true"' : ' role="img" aria-label="Ren at the apartment door"');
  return { svg: finish(svg, input.idPrefix), meta: { scene: 'door', viewBox: '0 0 960 540', bodyEdge: 'frame', hand: 'owner-selected-derived' } };
}

// Full-output drift fingerprint; not a cryptographic authenticity check.
export function baselineFingerprint(s) {
  let a = 2166136261, b = 5381;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = (Math.imul(b, 33) ^ c) | 0; }
  return [a >>> 0, b >>> 0].map(n => n.toString(16).padStart(8, '0')).join('');
}
const arrivalFingerprints = Object.freeze({ cardigan: '9fe27f9be9099cb3', pajamas: 'ea813044a8b954de' });
// Two selected, box-free doorway looks; this is not a general wardrobe composer.
export function renderRenArrival(input = {}) {
  options(input, ['idPrefix', 'look', 'decorative']);
  if (!Object.hasOwn(arrivalFingerprints, input.look)) throw new RangeError('unsupported arrival look');
  const source = arrivalScenes[input.look];
  if (baselineFingerprint(source) !== arrivalFingerprints[input.look]) throw new Error('Ren arrival source drift');
  let svg = source.replaceAll('outfit-', `${input.idPrefix}-`);
  if (input.decorative) svg = replaceOnce(svg, 'role="img" aria-label="Ren at the apartment door"', 'aria-hidden="true"', 'Arrival label');
  return { svg, meta: { scene: 'arrival', look: input.look, viewBox: '0 0 960 540', prop: 'none' } };
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
  if (!floor) {
    svg = replaceOnce(svg, 'translate(735.8 405.4) scale(0.2436)', 'translate(735.8 316.4) scale(0.2436)', 'Couch figure');
    svg = replaceOnce(svg, 'viewBox="536 100 400 225"', 'viewBox="536 -10 400 225"', 'Couch framing');
  }
  svg = svg.replaceAll(`apt-${name}`, `apt-${prefix}-${name}`);
  if (decorative) svg = svg.replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
  return {svg: finish(svg, prefix), meta: floor
    ? {scene:'floor-game-night-original', viewBox:'0 0 960 540', bodyEdge:'coffee-table', duckSupport:'blue magazine', selection:'owner-selected-wide'}
    : {scene:'couch-close', viewBox:'536 -10 400 225', bodyEdge:'frame', framing:'owner-selected-derived'}};
}
/** Owner-selected original wide floor composition; unmounted and not a production scene contract. */
export function renderFloorCandidate(input = {}) {
  options(input, ['idPrefix', 'decorative', 'tv']);
  if (input.tv !== undefined && !['present', 'removed'].includes(input.tv)) throw new RangeError('unsupported TV state');
  const rendered = livingScene(input.idPrefix, 'ren-floor-game-night', input.decorative);
  if (input.tv !== 'removed') return rendered;
  // Bounded compatibility bridge: preserve the pinned selected floor scene and
  // substitute only the apartment kit's existing sold-TV variant. A changed
  // baseline or occurrence count must stop rather than render a sold TV.
  const before = tvUnit(false), after = tvUnit(true);
  if (rendered.svg.split(before).length !== 2) throw new Error('Ren floor TV seam drift: expected one fragment');
  return { svg: rendered.svg.replace(before, after), meta: { ...rendered.meta, tv: 'removed' } };
}
