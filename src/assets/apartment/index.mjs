// Public interface of the apartment art kit: static SVG strings for the physical rubber duck and its apartment
// and desk scenes. Pure functions; no DOM, timers, observers or module state; deterministic for the same inputs.
//
// Inputs are trusted presentation facts supplied by the caller (which duck view, which light, whether the couch
// or TV are shown). Nothing here decides sales, rewards or story state. Not imported by the game yet.
//
// Hosts: a returned scene paints beyond its viewBox (wall/floor/desk extensions that fill letterbox bands), so
// give its container `overflow: hidden`, like a stage. Use a distinct `idPrefix` for every scene or duck placed in
// the same document; reusing a prefix duplicates ids (a pure function cannot detect that across calls).
import { DUCK_VIEW_KEYS, DUCK_LABELS, duckSvg, resolveDuckView } from './duck/index.mjs';
import { assertIdPrefix, scopeIds } from './core/ids.mjs';
import { checkText, escapeXml } from './core/svg.mjs';
import { LIGHT_MODES, DESK_LIGHT_HINTS, sceneStyle, overlayMarkup } from './lighting/modes.mjs';
import { buildRoomScene } from './rooms/scene.mjs';
import { buildSideDeskScene } from './desk/side.mjs';
import { buildTopDeskScene } from './desk/top.mjs';
import { DEFAULT_PHONE_TEXT } from './desk/phone.mjs';

export { DUCK_VIEW_KEYS as DUCK_VIEWS, LIGHT_MODES, DUCK_LABELS, DEFAULT_PHONE_TEXT };
export const AREAS = ['living', 'kitchen', 'bedroom', 'desk-side', 'desk-top'];
export const ROOM_AREAS = ['living', 'kitchen', 'bedroom'];
export const FRAMINGS = ['wide', 'medium'];
export const OVERLAYS = ['svg', 'none'];
export const FURNISHING_STATES = ['present', 'removed'];
/** Largest accepted lengths for the phone's display strings (the defaults fit with room to spare). */
export const PHONE_LIMITS = { status: 8, brand: 12, heading: { lines: 2, chars: 12 }, body: { lines: 2, chars: 16 }, note: 28 };

const SCENE_LABELS = { living: 'living room', kitchen: 'kitchen', bedroom: 'bedroom with toy shelf', 'desk-side': 'desk, side view', 'desk-top': 'desk, top-down view' };
const enumOf = (value, list, name) => { if (!list.includes(value)) throw new RangeError(`${name} must be one of ${list.join(', ')}`); return value; };
const plainObject = (value, name) => { if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} must be an object`); return value; };
const onlyKeys = (obj, allowed, name) => { for (const k of Object.keys(obj)) if (!allowed.includes(k)) throw new TypeError(`${name} has unknown option "${k}"`); };

function resolveFurnishings(input) {
  const f = plainObject(input ?? {}, 'furnishings');
  onlyKeys(f, ['couch', 'tv'], 'furnishings');
  return { couch: enumOf(f.couch ?? 'present', FURNISHING_STATES, 'furnishings.couch'), tv: enumOf(f.tv ?? 'present', FURNISHING_STATES, 'furnishings.tv') };
}

function resolvePhone(input) {
  const p = plainObject(input ?? {}, 'phone');
  onlyKeys(p, ['status', 'brand', 'heading', 'body', 'note'], 'phone');
  const lines = (value, def, name, limit) => {
    if (value === undefined) return [...def];
    if (!Array.isArray(value)) throw new TypeError(`phone.${name} must be an array of strings`);
    if (value.length > limit.lines) throw new RangeError(`phone.${name} accepts at most ${limit.lines} lines`);
    return value.map((s, i) => checkText(s, `phone.${name}[${i}]`, limit.chars));
  };
  const one = (value, def, name, max) => (value === undefined ? def : checkText(value, `phone.${name}`, max));
  return {
    status: one(p.status, DEFAULT_PHONE_TEXT.status, 'status', PHONE_LIMITS.status), brand: one(p.brand, DEFAULT_PHONE_TEXT.brand, 'brand', PHONE_LIMITS.brand),
    heading: lines(p.heading, DEFAULT_PHONE_TEXT.heading, 'heading', PHONE_LIMITS.heading), body: lines(p.body, DEFAULT_PHONE_TEXT.body, 'body', PHONE_LIMITS.body),
    note: one(p.note, DEFAULT_PHONE_TEXT.note, 'note', PHONE_LIMITS.note)
  };
}

const ROOT_OPEN = /^<svg\b[^>]*>/;
const setRootClass = (svg, cls) => svg.replace(/^(<svg\b[^>]*?) class="([^"]*)"/, (_, head, c) => `${head} class="${c} ${cls}"`);
function setRootLabel(svg, decorative, label) {
  const open = svg.match(ROOT_OPEN)[0];
  const stripped = open.replace(/\s(?:role|aria-label|aria-hidden)="[^"]*"/g, '');
  const attrs = decorative ? ' aria-hidden="true"' : ` role="img" aria-label="${escapeXml(label)}"`;
  return svg.replace(open, stripped.replace(/>$/, `${attrs}>`));
}
function checkLabel(label) { if (label !== undefined) checkText(label, 'label', 120); return label; }

/**
 * One duck drawing as a standalone 360x270 SVG string. `view` is one of the six genuine representations
 * (front, side, rear, high, low, top) and is always the view you asked for.
 * Options: idPrefix (required), decorative (default false: role="img" with a label), label (optional, escaped).
 */
export function renderDuck(view, options = {}) {
  const o = plainObject(options, 'options');
  onlyKeys(o, ['idPrefix', 'decorative', 'label'], 'options');
  const prefix = assertIdPrefix(o.idPrefix);
  if (!DUCK_VIEW_KEYS.includes(view)) throw new RangeError(`unknown duck view "${view}"; expected one of ${DUCK_VIEW_KEYS.join(', ')}`);
  if (o.decorative !== undefined && typeof o.decorative !== 'boolean') throw new TypeError('decorative must be a boolean');
  const label = checkLabel(o.label);
  const decorative = o.decorative ?? false;
  // Default (not decorative, no label): keep each drawing's own baseline accessible name untouched.
  const svg = !decorative && label === undefined ? duckSvg(view) : setRootLabel(duckSvg(view), decorative, label ?? '');
  return scopeIds(svg, prefix);
}

/**
 * One apartment scene as `{ svg, meta, lighting }`.
 *   area       living | kitchen | bedroom | desk-side | desk-top (required)
 *   idPrefix   required, unique per scene in a document
 *   duckView   requested duck view (default 'side'); meta.duckView / meta.fallback say what is actually drawn
 *   framing    wide | medium (rooms only; reported in meta.ignored for desks)
 *   light      neutral | window | warm
 *   furnishings { couch, tv } each 'present' | 'removed' (living room only): render visibility, not game logic
 *   phone      optional display strings for the desk phone (desks only), bounded by PHONE_LIMITS; '' omits a line
 *   overlay    'svg' (default; dimming/tint drawn inside the SVG) | 'none' (use `lighting` hints instead)
 *   decorative true (default, aria-hidden like the original scenes) | false (role="img" with `label`)
 *   label      optional accessible name, escaped, at most 120 characters
 * Every option is validated even when the area ignores it; ignored options are listed in meta.ignored.
 */
export function renderScene(options = {}) {
  const o = plainObject(options, 'options');
  onlyKeys(o, ['area', 'idPrefix', 'duckView', 'framing', 'light', 'furnishings', 'phone', 'overlay', 'decorative', 'label'], 'options');
  const prefix = assertIdPrefix(o.idPrefix);
  const area = enumOf(o.area, AREAS, 'area');
  const requestedDuckView = enumOf(o.duckView ?? 'side', DUCK_VIEW_KEYS, 'duckView');
  const framing = enumOf(o.framing ?? 'wide', FRAMINGS, 'framing');
  const light = enumOf(o.light ?? 'neutral', LIGHT_MODES, 'light');
  const overlay = enumOf(o.overlay ?? 'svg', OVERLAYS, 'overlay');
  if (o.decorative !== undefined && typeof o.decorative !== 'boolean') throw new TypeError('decorative must be a boolean');
  const decorative = o.decorative ?? true;
  const label = checkLabel(o.label);
  const furnishings = resolveFurnishings(o.furnishings);
  const phone = resolvePhone(o.phone);

  const isDesk = area.startsWith('desk');
  const { view: duckView, fallback } = resolveDuckView(requestedDuckView, area === 'desk-top' ? 'overhead' : 'horizontal');
  const ignored = [];
  if (isDesk && o.framing !== undefined) ignored.push('framing');
  if (area !== 'living' && o.furnishings !== undefined) ignored.push('furnishings');
  if (!isDesk && o.phone !== undefined) ignored.push('phone');

  let raw, hint, box = [0, 0, 960, 540];
  if (isDesk) {
    raw = area === 'desk-side' ? buildSideDeskScene({ duckView, phone }) : buildTopDeskScene({ phone });
    hint = { ...DESK_LIGHT_HINTS[area], rx: 58, ry: 58 };
  } else {
    const r = buildRoomScene({ area, duckView, framing, furnishings });
    raw = r.svg;
    hint = { x: r.lamp.x, y: r.lamp.y, rx: parseFloat(r.lamp.rx ?? '58'), ry: parseFloat(r.lamp.ry ?? '58') };
    box = raw.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  }

  const cls = `apt-${prefix}`;
  let svg = setRootClass(raw, cls);
  svg = setRootLabel(svg, decorative, label ?? `${DUCK_LABELS[duckView]} rubber duck in the ${SCENE_LABELS[area]}`);
  svg = svg.replace(ROOT_OPEN, open => `${open}${sceneStyle(cls, light)}`);
  if (overlay === 'svg') svg = svg.replace(/<\/svg>$/, `${overlayMarkup(light, box, hint)}</svg>`);
  svg = scopeIds(svg, prefix);

  return {
    svg,
    meta: { area, shotKey: isDesk ? area : `${area}-${framing}`, framing: isDesk ? null : framing, light, requestedDuckView, duckView, fallback, furnishings: area === 'living' ? furnishings : null, ignored },
    lighting: { mode: light, center: { x: hint.x, y: hint.y }, rx: hint.rx, ry: hint.ry }
  };
}
