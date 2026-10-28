// Extracted verbatim from reports/development/plan-10-metagame-duck-cinematography/preview.html (blob f304ff9f, prims, lines 325-366) by Plan 24.
// Pure static SVG-string builders: no DOM, no state, no side effects.
// Drawing primitives. Every prop is drawn in millimetres as a front elevation: origin = base centre, y negative up.

export const R = (x, y, w, h, fill, rx = 0, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${ex}/>`;
export const Ci = (cx, cy, r, fill, ex = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ex}/>`;
export const El = (cx, cy, rx, ry, fill, ex = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${ex}/>`;
export const Pg = (pts, fill, ex = '') => `<polygon points="${pts}" fill="${fill}" ${ex}/>`;
export const Pa = (d, fill, ex = '') => `<path d="${d}" fill="${fill}" ${ex}/>`;
export const NS = 'stroke="none"';
export const sc_ = (mm, f) => `<g transform="scale(${f})">${mm}</g>`;
