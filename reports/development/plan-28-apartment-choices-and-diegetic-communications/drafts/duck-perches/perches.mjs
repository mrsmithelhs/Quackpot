// Report-local sketch perches for the Plan 28 gallery's duck.
// Not apartment-kit assets; not adopted art.
// Each export is pure: returns { svg, seat } with seat in viewBox units (where a duck's base rests).

const OUT = '#3b3226';
const WOOD = '#a8754a';
const EDGE = '#7a5233';
const TOP = '#c08a5a';
const ID_RE = /^[a-z][a-z0-9-]{0,23}$/;

const checkId = (p) => {
  if (typeof p !== 'string' || !ID_RE.test(p)) throw new RangeError(`invalid idPrefix: ${String(p)}`);
};
const checkNum = (n, min, max, name) => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) {
    throw new RangeError(`${name} must be a number between ${min} and ${max}`);
  }
};
const wrap = (w, h, p, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">` +
  `<defs><filter id="${p}-blur" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>` +
  `${body}</svg>`;
const shadow = (p, cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(0,0,0,.18)" filter="url(#${p}-blur)"/>`;

export const PERCH_NAMES = Object.freeze(['wallShelf', 'bookStack', 'crate', 'windowLedge']);

export function wallShelf({ idPrefix, width = 160 } = {}) {
  checkId(idPrefix);
  checkNum(width, 100, 300, 'width');
  const p = idPrefix;
  const W = width;
  const cx = 10 + W / 2;
  const bracket = (x) => `<path d="M${x} 44V58H${x + 12}" fill="none" stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  const body =
    shadow(p, cx, 62, W / 2 - 8, 3) +
    bracket(32) + bracket(10 + W - 22) +
    `<rect x="10" y="30" width="${W}" height="14" rx="3" fill="${EDGE}" stroke="${OUT}" stroke-width="2"/>` +
    `<rect x="12" y="35" width="${W - 4}" height="7" fill="${WOOD}"/>` +
    `<rect x="10" y="30" width="${W}" height="5" rx="3" fill="${TOP}" stroke="${OUT}" stroke-width="2"/>`;
  return { svg: wrap(W + 20, 70, p, body), seat: { x: cx, y: 32.5 } };
}

export function bookStack({ idPrefix, count = 3 } = {}) {
  checkId(idPrefix);
  if (!Number.isInteger(count) || count < 2 || count > 5) throw new RangeError('count must be an integer between 2 and 5');
  const p = idPrefix;
  const H = count * 22 + 20;
  const colors = ['#5b7fa6', '#b5654a', '#6f9a6a', '#d4b45a'];
  const offsets = [-3, 4, -5, 3, -2];
  let body = shadow(p, 70, H - 3, 62, 2.5);
  let seatX = 70;
  for (let i = 0; i < count; i++) {
    const w = 110 + (i % 3) * 7;
    const off = offsets[i % offsets.length];
    const x = 70 + off - w / 2;
    const y = H - 24 - i * 22;
    body += `<rect x="${x}" y="${y}" width="${w}" height="20" rx="4" fill="${colors[i % colors.length]}" stroke="${OUT}" stroke-width="2"/>` +
      `<rect x="${x + w - 9}" y="${y + 3}" width="5" height="14" rx="1" fill="#f3ead6" stroke="${OUT}" stroke-width="1"/>`;
    if (i === count - 1) seatX = 70 + off;
  }
  return { svg: wrap(140, H, p, body), seat: { x: seatX, y: 18 } };
}

export function crate({ idPrefix } = {}) {
  checkId(idPrefix);
  const p = idPrefix;
  const body =
    shadow(p, 60, 87, 50, 2.5) +
    `<rect x="12" y="20" width="96" height="64" rx="4" fill="${WOOD}" stroke="${OUT}" stroke-width="2"/>` +
    `<rect x="12" y="40" width="96" height="6" fill="${EDGE}" stroke="${OUT}" stroke-width="2"/>` +
    `<rect x="12" y="60" width="96" height="6" fill="${EDGE}" stroke="${OUT}" stroke-width="2"/>` +
    `<rect x="12" y="20" width="96" height="8" rx="4" fill="${TOP}" stroke="${OUT}" stroke-width="2"/>`;
  return { svg: wrap(120, 90, p, body), seat: { x: 60, y: 24 } };
}

export function windowLedge({ idPrefix, width = 220 } = {}) {
  checkId(idPrefix);
  checkNum(width, 120, 400, 'width');
  const p = idPrefix;
  const W = width;
  const body =
    shadow(p, W / 2, 31, W / 2 - 8, 2.5) +
    `<rect x="4" y="16" width="${W - 8}" height="12" rx="2" fill="#cfc6b4" stroke="${OUT}" stroke-width="2"/>` +
    `<rect x="4" y="10" width="${W - 8}" height="6" rx="2" fill="#e9e2d3" stroke="${OUT}" stroke-width="2"/>`;
  return { svg: wrap(W, 40, p, body), seat: { x: W / 2, y: 13 } };
}
