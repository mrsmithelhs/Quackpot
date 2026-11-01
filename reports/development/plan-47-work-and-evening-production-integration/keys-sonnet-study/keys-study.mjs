// Report-local drawing study (Sonnet). Not production. Authored from the established identity in
// src/assets/apartment/desk/top.mjs (two brass keys, silver ring, blue rectangular fob) plus owner-supplied
// low-angle photo/drawing geometry guidance: ring stands nearly upright, keys fan out flat in front of it,
// fob is a thick slab. No raster was copied. Palette/outline match life-art.mjs (INK #3b3226, brass #d8c27a/#8a7634).
const INK = '#3b3226', BRASS = '#d8c27a', BRASS_LINE = '#8a7634', BRASS_EDGE = '#a58f48', HOLE = '#4a3324';

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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 76" aria-hidden="true" focusable="false">
    <ellipse cx="62" cy="63" rx="55" ry="7" fill="rgba(0,0,0,.2)"/>
    <ellipse cx="64" cy="60" rx="40" ry="3.6" fill="rgba(0,0,0,.2)"/>
    <path d="M84 49 L109 45 L118 54 L93 59Z" fill="#3f6e8a" stroke="#1f3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M93 59 L118 54 V59 L93 64Z" fill="#26485d" stroke="#1f3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M84 49 L93 59 V64 L84 54Z" fill="#2f5a74" stroke="#1f3a4a" stroke-width="2" stroke-linejoin="round"/>
    <path d="M90 52 L108 49" stroke="#8fb3c4" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="88.5" cy="52" r="1.8" fill="#16293a"/>
    <path d="M88 52 Q78 54 72 48" fill="none" stroke="#4d4a46" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M88 52 Q78 54 72 48" fill="none" stroke="#cfd3d4" stroke-width="2.4" stroke-linecap="round"/>
    ${key(65, 49, 172)}
    <g transform="rotate(8 70 28)" fill="none">
      <ellipse cx="70" cy="28" rx="13" ry="19" stroke="#4d4a46" stroke-width="5.6"/>
      <ellipse cx="70" cy="28" rx="13" ry="19" stroke="#cfd3d4" stroke-width="3.2"/>
      <path d="M59 20 A13 19 0 0 1 66 10" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>
    </g>
    ${key(73, 54, 150)}
  </svg>`;
}
