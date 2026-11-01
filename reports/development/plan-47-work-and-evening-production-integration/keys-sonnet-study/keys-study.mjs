// Report-local drawing study (Sonnet). Not production. Authored from the established identity in
// src/assets/apartment/desk/top.mjs (two brass keys, silver ring, blue rectangular fob) plus owner-supplied
// low-angle photo/drawing geometry guidance: ring stands nearly upright, keys fan out flat in front of it,
// fob is a thick slab. No raster was copied. Palette/outline match life-art.mjs (INK #3b3226, brass #d8c27a/#8a7634).
const INK = '#3b3226', BRASS = '#d8c27a', BRASS_LINE = '#8a7634', BRASS_EDGE = '#a58f48', HOLE = '#4a3324';

// Draw order is ring, keys, fob: the fob covers the key heads/holes and the ring sits behind all, so the ring plausibly threads the holes without drawing it.
// Key in its own flat plane, head at origin, blade along +x, teeth on the -y edge. The caller squashes the plane
// (scale 1 .62) and rotates it; a thickness copy offset downward gives the shallow-perspective edge.
const keyPlane = (fill, line, extra = '') => `<g fill="${fill}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round">
  <path d="M9 5 H47 V-1 H43 V-5 H38 V-1 H34 V-7 H28 V-1 H23 V-4 H17 V-1 H9Z"/>
  <circle r="11.5"/>${extra}</g>`;
const key = (x, y, rot) => `<g transform="translate(${x} ${y + 3}) scale(1 .62) rotate(${rot})">${keyPlane(BRASS_EDGE, '#6e5f2c')}</g>
  <g transform="translate(${x} ${y}) scale(1 .62) rotate(${rot})">${keyPlane(BRASS, BRASS_LINE)}
    <circle r="3.8" fill="${HOLE}" stroke="${BRASS_LINE}" stroke-width="1.6"/>
    <path d="M-7 -4 A8.5 8.5 0 0 1 2 -8.2" fill="none" stroke="#f3e6ab" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M13 0 H40" stroke="#f3e6ab" stroke-width="1.4" stroke-linecap="round"/></g>`;

export function sonnetKeys() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 32 100 42" aria-hidden="true" focusable="false">
    <ellipse cx="56" cy="64" rx="50" ry="7" fill="rgba(0,0,0,.2)"/>
    <ellipse cx="66" cy="61" rx="38" ry="3.6" fill="rgba(0,0,0,.2)"/>
    <g transform="rotate(-8 78 49)" fill="none">
      <ellipse cx="78" cy="49" rx="9.5" ry="10" stroke="#4d4a46" stroke-width="5"/>
      <ellipse cx="78" cy="49" rx="9.5" ry="10" stroke="#cfd3d4" stroke-width="2.8"/>
      <path d="M71.5 44 A9.5 10 0 0 1 77 39.2" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>
    </g>
    ${key(66, 50, 172)}
    ${key(70, 53, 150)}
    <path d="M61 50 L85 46 L96 55 L72 60Z" fill="#3f6e8a" stroke="#1f3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M72 60 L96 55 V60.5 L72 65.5Z" fill="#26485d" stroke="#1f3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M61 50 L72 60 V65.5 L61 55.5Z" fill="#2f5a74" stroke="#1f3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M68 53 L86 49.5" stroke="#8fb3c4" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}
