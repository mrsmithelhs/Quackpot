// src/ui/life/life-art.mjs
// Life-scene sketch art: props, perches and posed-duck markup for the apartment life screens.
// Ported from the Plan 28 report-local gallery (props.mjs, perches.mjs, duck-layer.mjs). Pure functions returning
// standalone SVG or HTML strings: no scripts, no external references, aria-hidden, ids scoped by idPrefix.
// The duck is the apartment kit's own renderDuck() artwork, posed by CSS classes prefixed life-.

import { renderDuck } from '../../assets/apartment/index.mjs';

const ID_RE = /^[a-z][a-z0-9-]{0,23}$/;
const INK = '#3b3226';
const GREY = '#b9b2a5';
const SHADOW = 'rgba(0,0,0,.18)';
const WOOD = '#a8754a';
const EDGE = '#7a5233';
const TOP = '#c08a5a';
const ROOM_ASPECT = 16 / 9;

// ---------- shared helpers ----------

function checkId(idPrefix) {
  if (typeof idPrefix !== 'string' || !ID_RE.test(idPrefix)) {
    throw new RangeError(`idPrefix must match ${ID_RE}: got ${String(idPrefix)}`);
  }
  return idPrefix;
}

function checkState(state, allowed, name) {
  if (!allowed.includes(state)) {
    throw new RangeError(`${name}: unknown state "${String(state)}"`);
  }
}

function checkNum(n, min, max, name) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) {
    throw new RangeError(`${name} must be a number between ${min} and ${max}`);
  }
}

function svgBox(viewBox, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
}

function dropShadow(id) {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="${SHADOW}"/></filter>`;
}

function bars(x, y, widths, h, gap) {
  return widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${h}" rx="${h / 2}" fill="${GREY}"/>`).join('');
}

// ---------- props ----------

export function tapedNotice({ idPrefix, state = 'unread' } = {}) {
  const id = checkId(idPrefix);
  checkState(state, ['unread', 'paid', 'read'], 'tapedNotice');
  const shadow = `${id}-notice-shadow`;
  const curl = state === 'read'
    ? `<path d="M106,122 L106,140 L88,140 Z" fill="#ebe2c8" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`
    : '';
  const stamp = state === 'paid'
    ? `<g transform="rotate(-12 60 78)"><rect x="23" y="66" width="74" height="24" rx="3" fill="none" stroke="#2f6b4f" stroke-width="3"/><text x="60" y="86" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="22" fill="#2f6b4f">PAID</text></g>`
    : '';
  return svgBox('0 0 120 150', `<defs>${dropShadow(shadow)}</defs>
    <g transform="rotate(-3 60 75)">
      <rect x="14" y="16" width="92" height="124" rx="4" fill="#fffdf6" stroke="${INK}" stroke-width="2" filter="url(#${shadow})"/>
      <rect x="26" y="26" width="68" height="9" rx="2" fill="${INK}"/>
      ${bars(26, 46, [68, 60, 66, 52, 64, 58, 36], 4, 9)}
      ${curl}
      ${stamp}
      <rect x="16" y="9" width="30" height="12" fill="rgba(232,220,180,.85)" transform="rotate(-18 31 15)"/>
      <rect x="74" y="7" width="30" height="12" fill="rgba(232,220,180,.85)" transform="rotate(14 89 13)"/>
    </g>`);
}

export function saleTag({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  const shadow = `${id}-tag-shadow`;
  return svgBox('0 0 70 90', `<defs>${dropShadow(shadow)}</defs>
    <g transform="rotate(-6 35 50)">
      <path d="M31,20 C30,2 40,2 39,20" fill="none" stroke="${INK}" stroke-width="1.5"/>
      <path d="M18,14 L52,14 L62,28 L62,84 Q62,88 58,88 L12,88 Q8,88 8,84 L8,28 Z" fill="#fff3a8" stroke="${INK}" stroke-width="2" stroke-linejoin="round" filter="url(#${shadow})"/>
      <circle cx="35" cy="20" r="3" fill="#f6f0e2" stroke="${INK}" stroke-width="1.5"/>
      <text x="35" y="66" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="${INK}">$</text>
      <rect x="20" y="76" width="30" height="3" rx="1.5" fill="${GREY}"/>
    </g>`);
}

export function emptyPlate({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  const soft = `${id}-plate-soft`;
  return svgBox('0 0 120 50', `<defs><filter id="${soft}" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>
    <ellipse cx="60" cy="44" rx="54" ry="5" fill="${SHADOW}" filter="url(#${soft})"/>
    <ellipse cx="60" cy="30" rx="50" ry="14" fill="#e9dfc8" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="60" cy="26" rx="50" ry="14" fill="#fffaf0" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="60" cy="26" rx="36" ry="9" fill="#f3ead8" stroke="${INK}" stroke-width="1.5"/>`);
}

export function bakeryBag({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  const shadow = `${id}-bag-shadow`;
  return svgBox('0 0 80 100', `<defs>${dropShadow(shadow)}</defs>
    <g filter="url(#${shadow})">
      <path d="M14,30 L66,30 L70,94 Q40,98 10,94 Z" fill="#c9a46a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M26,34 L24,92 M54,34 L56,92" fill="none" stroke="#a8844f" stroke-width="1.5"/>
      <rect x="14" y="22" width="52" height="10" rx="2" fill="#b0884f" stroke="${INK}" stroke-width="2"/>
      <circle cx="40" cy="64" r="8" fill="#e6c35c" stroke="${INK}" stroke-width="1.5"/>
    </g>`);
}

export function phoneGlow({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  return svgBox('0 0 100 100', `<defs><filter id="${id}-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <rect x="14" y="12" width="72" height="76" rx="16" fill="none" stroke="#ffd36a" stroke-width="6" opacity=".9" filter="url(#${id}-blur)"/>`);
}

// ---------- perches and wedges ----------

// Each perch returns { svg, seat } with seat in viewBox units (where a duck's base rests).
function perchWrap(w, h, p, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">` +
    `<defs><filter id="${p}-blur" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>` +
    `${body}</svg>`;
}

function perchShadow(p, cx, cy, rx, ry) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SHADOW}" filter="url(#${p}-blur)"/>`;
}

export function wallShelf({ idPrefix, width = 160 } = {}) {
  checkId(idPrefix);
  checkNum(width, 100, 300, 'width');
  const p = idPrefix;
  const W = width;
  const cx = 10 + W / 2;
  const bracket = (x) => `<path d="M${x} 44V58H${x + 12}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  const body =
    perchShadow(p, cx, 62, W / 2 - 8, 3) +
    bracket(32) + bracket(10 + W - 22) +
    `<rect x="10" y="30" width="${W}" height="14" rx="3" fill="${EDGE}" stroke="${INK}" stroke-width="2"/>` +
    `<rect x="12" y="35" width="${W - 4}" height="7" fill="${WOOD}"/>` +
    `<rect x="10" y="30" width="${W}" height="5" rx="3" fill="${TOP}" stroke="${INK}" stroke-width="2"/>`;
  return { svg: perchWrap(W + 20, 70, p, body), seat: { x: cx, y: 32.5 } };
}

/**
 * A closed paperback lying flat, seen from the front: the believable object under one end of a tilted duck.
 * Drawn to stretch (preserveAspectRatio none) so its thickness can match the lift it supports. Returns a string.
 */
export function paperback({ idPrefix } = {}) {
  checkId(idPrefix);
  const body = `<rect x="2" y="2" width="96" height="12" rx="2" fill="#5b7fa6" stroke="${INK}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`
    + `<rect x="8" y="4.5" width="84" height="7" rx="1" fill="#f3ead6" stroke="#cbbf9f" stroke-width="1" vector-effect="non-scaling-stroke"/>`
    + `<rect x="2" y="2" width="96" height="2.5" fill="#6f8fb3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">${body}</svg>`;
}

const PERCHES = Object.freeze({ wallShelf });
const WEDGES = Object.freeze({ paperback });

// ---------- posed duck ----------

// renderDuck() draws in a 360x270 box; the side/front/rear base sits near (176-180, 250). Top view is centred.
const BASE = Object.freeze({ side: [176 / 360, 250 / 270], front: [180 / 360, 250 / 270], rear: [180 / 360, 250 / 270], top: [0.5, 0.5] });

/**
 * Heading (CSS degrees, clockwise) that turns a duck whose beak natively points left so it points from `from` to `to`.
 * Both points are percentages of the room box; the room is 16:9, so horizontal percentages are scaled.
 */
export function headingToward(from, to) {
  const dx = (to.x - from.x) * ROOM_ASPECT;
  const dy = to.y - from.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = right, 90 = down
  return Math.round(((angle - 180 + 540) % 360) - 180);
}

/**
 * Lean (CSS degrees) for a side-view duck so its gaze tilts toward `to`: positive looks up.
 * Clamped to a believable tilt for a duck propped on something; `gain` 1 aims straight at the target.
 */
export function leanToward(from, to, max = 22, gain = 0.6) {
  const dx = Math.abs(to.x - from.x) * ROOM_ASPECT;
  const dy = from.y - to.y;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return Math.max(-max, Math.min(max, Math.round(deg * gain)));
}

// A tilt needs a believable object under the raised end, and tiny tilts are not worth drawing.
export const MIN_TILT = 12;
// Side duck (native, facing left) in its 360x270 box: chest and tail contact points on its base line.
const CHEST = [0.3, 250 / 270];
const TAIL = [0.78, 250 / 270];

/**
 * HTML for one posed duck, positioned in the room by percentages. Every class is prefixed life-.
 *   pose.view    'side' | 'front' | 'rear' | 'top'
 *   pose.facing  'left' | 'right' (side view; the kit's side duck faces left)
 *   pose.lean    degrees, side view: positive looks up (chest raised), negative looks down (tail raised).
 *                Drawn only with pose.wedge and only if |lean| >= MIN_TILT; otherwise the duck sits level.
 *   pose.wedge   'paperback' (the object under the raised end)
 *   pose.turn    degrees clockwise, top view: heading; the native overhead duck's beak points left
 *   pose.x/y     the duck's base point (top view: its centre), % of the room; ignored when `perch` is given
 *   pose.size    duck width as % of the room width (smaller = farther away)
 *   pose.perch   optional { name, x, y, w, ...options }: a perch ('wallShelf'), placed at x/y (top-left, %) with
 *                width w (%); the duck stands on the perch's seat
 * `idPrefix` scopes every id in the markup. Throws RangeError on a bad idPrefix, view, perch or wedge name.
 */
export function duckPoseHtml(pose, idPrefix) {
  checkId(idPrefix);
  const view = pose.view ?? 'side';
  if (!Object.hasOwn(BASE, view)) throw new RangeError(`unknown duck view "${String(view)}"`);
  let { x, y } = pose;
  let perchHtml = '';
  if (pose.perch) {
    const { name, x: px, y: py, w, ...opts } = pose.perch;
    if (!Object.hasOwn(PERCHES, name)) throw new RangeError(`unknown perch "${String(name)}"`);
    const made = PERCHES[name]({ idPrefix: `${idPrefix}-p`, ...opts });
    const [, , vbW, vbH] = made.svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const h = w * (vbH / vbW) * ROOM_ASPECT;
    x = px + (made.seat.x / vbW) * w;
    y = py + (made.seat.y / vbH) * h;
    perchHtml = `<div class="life-perch" style="left:${px}%;top:${py}%;width:${w}%">${made.svg}</div>`;
  }
  const [bx, by] = BASE[view];
  const duck = renderDuck(view, { idPrefix: `${idPrefix}-d`, decorative: true });
  let inner;
  if (view === 'top') {
    inner = `<div class="life-duck-body" style="transform-origin:50% 50%;transform:rotate(${pose.turn ?? 0}deg)">${duck}</div>`;
  } else {
    const tilt = view === 'side' && pose.wedge && Math.abs(pose.lean ?? 0) >= MIN_TILT ? pose.lean : 0;
    let wedge = '';
    let origin = `${bx * 100}% ${by * 100}%`;
    if (tilt) {
      if (!Object.hasOwn(WEDGES, pose.wedge)) throw new RangeError(`unknown wedge "${String(pose.wedge)}"`);
      // Looking up: pivot on the tail, the chest rests on the wedge. Looking down: pivot on the chest, tail on the wedge.
      const [pivot, raised] = tilt > 0 ? [TAIL, CHEST] : [CHEST, TAIL];
      origin = `${pivot[0] * 100}% ${pivot[1] * 100}%`;
      const lift = Math.abs(pivot[0] - raised[0]) * 360 * Math.sin((Math.abs(tilt) * Math.PI) / 180); // box units
      const wedgeW = 0.34;
      wedge = `<span class="life-duck-wedge" style="left:${(raised[0] - wedgeW / 2) * 100}%;width:${wedgeW * 100}%;top:${((raised[1] * 270 - lift) / 270) * 100}%;height:${(lift / 270) * 100}%">${WEDGES[pose.wedge]({ idPrefix: `${idPrefix}-w` })}</span>`;
    }
    const contact = '<span class="life-duck-contact" aria-hidden="true"></span>';
    const body = `<div class="life-duck-body" style="transform-origin:${origin};transform:rotate(${tilt}deg)">${duck}</div>`;
    // Mirror the whole group (contact shadow, wedge, duck) so the wedge stays under the correct end.
    inner = `<div class="life-duck-flip"${view === 'side' && pose.facing === 'right' ? ' style="transform:scaleX(-1)"' : ''}>${contact}${wedge}${body}</div>`;
  }
  return `${perchHtml}<div class="life-duck-pose life-duck-${view}" aria-hidden="true"
      style="left:${x}%;top:${y}%;width:${pose.size}%;transform:translate(${-bx * 100}%, ${-by * 100}%)">${inner}</div>`;
}
