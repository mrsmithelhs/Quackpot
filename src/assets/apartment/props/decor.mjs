// Extracted verbatim from reports/development/plan-10-metagame-duck-cinematography/preview.html (blob f304ff9f, decor, lines 333-374) by Plan 24.
// Pure static SVG-string builders: no DOM, no state, no side effects.
import { R, Ci, El, Pg, Pa, NS } from './prims.mjs';

export const art = (kind, w = 960, h = 640) => {
    const iw = w - 80, ih = h - 80, x = -iw / 2, y = -h + 40;
    const body = kind === 'night'
      ? R(x, y, iw, ih, '#26325a', 0, NS) + Ci(iw * .22, y + ih * .3, 70, '#f3e6b0', NS) + Ci(iw * .22 + 28, y + ih * .3 - 14, 60, '#26325a', NS) + [[-220, .25], [-60, .4], [140, .2], [250, .45], [-300, .5]].map(([sx, sy]) => Ci(sx, y + ih * sy, 7, '#f3e6b0', NS)).join('') + Pa(`M${x} ${y + ih}V${y + ih * .72}Q${x + iw * .3} ${y + ih * .55} ${x + iw * .55} ${y + ih * .74}T${x + iw} ${y + ih * .68}V${y + ih}Z`, '#18203f', NS)
      : R(x, y, iw, ih, '#f0e3c8', 0, NS) + R(x, y, iw, ih * .55, '#9ec3cf', 0, NS) + Ci(iw * .22, y + ih * .3, 70, '#f6c35b', NS) + Pa(`M${x} ${y + ih * .62}Q${x + iw * .25} ${y + ih * .35} ${x + iw * .5} ${y + ih * .6}T${x + iw} ${y + ih * .55}V${y + ih}H${x}Z`, '#7a9a62', NS) + Pa(`M${x} ${y + ih * .82}Q${x + iw * .35} ${y + ih * .62} ${x + iw * .7} ${y + ih * .85}T${x + iw} ${y + ih * .8}V${y + ih}H${x}Z`, '#5c7b4c', NS);
    return R(-w / 2, -h, w, h, '#8a6a4a', 8) + R(x - 14, y - 14, iw + 28, ih + 28, '#f6efe0', 0) + body;
  };
export const windowMm = (w, h, curtain = '#c6a97a') => R(-w / 2 - 60, -40, w + 120, 60, '#eee5d5') + R(-w / 2, -h, w, h, '#eee5d5') + R(-w / 2 + 30, -h + 30, w - 60, h - 60, '#b9d2d7') + R(-8, -h + 30, 16, h - 60, '#eee5d5', 0, NS) + R(-w / 2 + 30, -h * .45 - 8, w - 60, 16, '#eee5d5', 0, NS) + Pg(`${-w / 2 + 60},${-h + 60} ${-w / 2 + 230},${-h + 60} ${-w / 2 + 60},${-h * .55}`, '#fff', 'stroke="none" opacity=".25"') + R(-w / 2 - 230, -h - 120, 210, h + 120, curtain, 20) + R(w / 2 + 20, -h - 120, 210, h + 120, curtain, 20) + R(-w / 2 - 260, -h - 150, w + 520, 30, '#7d6240', 10);
export const plant = (h = 900) => Pg('-150,-380 150,-380 110,0 -110,0', '#b5654a') + R(-170, -420, 340, 50, '#c5745a', 14) + [-50, -25, 0, 25, 50].map((a, i) => El(0, -420 - h * (.25 + (i === 2 ? .1 : .02 * i)), 62, h * .27, i % 2 ? '#5f9a62' : '#4f8a55', `transform="rotate(${a} 0 -420)"`)).join('');
export const mug = (col = '#b86b4b') => R(-45, -95, 90, 95, col, 10) + El(0, -95, 45, 9, '#5a3322') + Pa('M45 -75C80 -75 80 -25 45 -22', 'none', 'stroke-width="9"');
export const magazines = () => R(-130, -26, 260, 26, '#d95b43', 3) + R(-120, -52, 240, 26, '#4f8fc0', 3);
export const clock = () => Ci(0, -170, 170, '#f6f1e4', 'stroke-width="5"') + [0, 90, 180, 270].map(a => R(-4, -170 - 150, 8, 28, '#3a2c26', 0, `transform="rotate(${a} 0 -170)" stroke="none"`)).join('') + Pa('M0 -170L0 -270M0 -170L70 -140', 'none', 'stroke-width="9" stroke-linecap="round"') + Ci(0, -170, 12, '#3a2c26', NS);
export const clockSmall = () => R(-60, -80, 120, 80, '#3a4a68', 14) + Ci(0, -40, 26, '#e9eef7', 'stroke-width="2"') + Pa('M0 -40L0 -58M0 -40L14 -32', 'none', 'stroke-width="3"');
