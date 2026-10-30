// Report-local sketch props for the Plan 28 interaction gallery.
// Not apartment-kit assets; not adopted art.
// Pure functions returning standalone SVG strings; no external references.

const ID_RE = /^[a-z][a-z0-9-]{0,23}$/;
const INK = '#3b3226';
const GREY = '#b9b2a5';
const SHADOW = 'rgba(0,0,0,.18)';

export const PROP_NAMES = Object.freeze(['tapedNotice', 'envelope', 'emptyPlate', 'bakeryBag', 'saleTag', 'phoneGlow']);

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

function svg(viewBox, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
}

function dropShadow(id) {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="${SHADOW}"/></filter>`;
}

function bars(x, y, widths, h, gap) {
  return widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${h}" rx="${h / 2}" fill="${GREY}"/>`).join('');
}

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
  return svg('0 0 120 150', `<defs>${dropShadow(shadow)}</defs>
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

export function envelope({ idPrefix, state = 'closed' } = {}) {
  const id = checkId(idPrefix);
  checkState(state, ['closed', 'open'], 'envelope');
  const shadow = `${id}-envelope-shadow`;
  const isOpen = state === 'open';
  const letter = isOpen
    ? `<rect x="56" y="14" width="72" height="36" rx="2" fill="#fffdf6" stroke="${INK}" stroke-width="1.5"/>${bars(64, 22, [56, 44], 3.5, 7)}`
    : '';
  const flap = isOpen
    ? `<path d="M10,12 L70,4 L130,12 Z" fill="#efe6d0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
    : `<path d="M10,12 L70,58 L130,12" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  return svg('0 0 140 100', `<defs>${dropShadow(shadow)}</defs>
    <rect x="10" y="12" width="120" height="76" rx="4" fill="#f6f0e2" stroke="${INK}" stroke-width="2" filter="url(#${shadow})"/>
    ${letter}
    <rect x="16" y="16" width="36" height="22" rx="2" fill="${INK}" opacity=".85"/>
    ${bars(21, 21, [24, 18, 22], 3, 6)}
    <rect x="52" y="60" width="36" height="18" rx="2" fill="#fffdf6" stroke="${INK}" stroke-width="1.5"/>
    <path d="M10,88 L56,52 M130,88 L84,52" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${flap}`);
}

export function emptyPlate({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  const soft = `${id}-plate-soft`;
  return svg('0 0 120 50', `<defs><filter id="${soft}" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>
    <ellipse cx="60" cy="44" rx="54" ry="5" fill="${SHADOW}" filter="url(#${soft})"/>
    <ellipse cx="60" cy="30" rx="50" ry="14" fill="#e9dfc8" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="60" cy="26" rx="50" ry="14" fill="#fffaf0" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="60" cy="26" rx="36" ry="9" fill="#f3ead8" stroke="${INK}" stroke-width="1.5"/>`);
}

export function bakeryBag({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  const shadow = `${id}-bag-shadow`;
  return svg('0 0 80 100', `<defs>${dropShadow(shadow)}</defs>
    <g filter="url(#${shadow})">
      <path d="M14,30 L66,30 L70,94 Q40,98 10,94 Z" fill="#c9a46a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M26,34 L24,92 M54,34 L56,92" fill="none" stroke="#a8844f" stroke-width="1.5"/>
      <rect x="14" y="22" width="52" height="10" rx="2" fill="#b0884f" stroke="${INK}" stroke-width="2"/>
      <circle cx="40" cy="64" r="8" fill="#e6c35c" stroke="${INK}" stroke-width="1.5"/>
    </g>`);
}

export function saleTag({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  const shadow = `${id}-tag-shadow`;
  return svg('0 0 70 90', `<defs>${dropShadow(shadow)}</defs>
    <g transform="rotate(-6 35 50)">
      <path d="M31,20 C30,2 40,2 39,20" fill="none" stroke="${INK}" stroke-width="1.5"/>
      <path d="M18,14 L52,14 L62,28 L62,84 Q62,88 58,88 L12,88 Q8,88 8,84 L8,28 Z" fill="#fff3a8" stroke="${INK}" stroke-width="2" stroke-linejoin="round" filter="url(#${shadow})"/>
      <circle cx="35" cy="20" r="3" fill="#f6f0e2" stroke="${INK}" stroke-width="1.5"/>
      <text x="35" y="66" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="${INK}">$</text>
      <rect x="20" y="76" width="30" height="3" rx="1.5" fill="${GREY}"/>
    </g>`);
}

export function phoneGlow({ idPrefix } = {}) {
  const id = checkId(idPrefix);
  return svg('0 0 100 100', `<defs><filter id="${id}-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <rect x="14" y="12" width="72" height="76" rx="16" fill="none" stroke="#ffd36a" stroke-width="6" opacity=".9" filter="url(#${id}-blur)"/>`);
}
