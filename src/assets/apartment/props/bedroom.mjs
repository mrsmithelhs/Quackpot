// Extracted verbatim from reports/development/plan-10-metagame-duck-cinematography/preview.html (blob f304ff9f, bedroom, lines 361-363) by Plan 24.
// Pure static SVG-string builders: no DOM, no state, no side effects.
import { R, Ci, Pg, NS } from './prims.mjs';

export const bed = () => R(-1080, -300, 60, 300, '#5a4333', 6, NS) + R(1020, -300, 60, 300, '#5a4333', 6, NS) + R(-1100, -1060, 100, 780, '#7a5a43', 22) + R(1010, -660, 90, 380, '#7a5a43', 22) + R(-1010, -560, 2020, 270, '#e3e6ee', 36) + R(-980, -720, 440, 170, '#f4f1ea', 70) + R(-520, -690, 360, 140, '#eceff4', 60) + R(-480, -620, 1520, 330, '#6f8fb0', 44) + [-340, -150, 40, 230, 420, 610, 800].map(x => R(x, -610, 22, 310, '#8aa8c6', 0, NS)).join('') + R(-480, -400, 1520, 24, '#587a9c', 0, NS);
export const bedside = () => R(-240, -560, 480, 560, '#8a6b52', 12) + R(-210, -500, 420, 200, '#7a5b42', 10, 'stroke-width="1.5"') + Ci(0, -400, 16, '#e0cfa8', NS) + R(-210, -270, 420, 230, '#7a5b42', 10, 'stroke-width="1.5"') + R(-190, -625, 380, 65, '#a98a5c', 6, NS);
export const bedLamp = () => R(-45, -90, 90, 90, '#e8d9b9', 8) + R(-9, -250, 18, 170, '#8a7a5c', 0, NS) + Pg('-140,-330 140,-330 190,-190 -190,-190', '#f1d9a0') + R(-60, -200, 120, 20, '#8a7a5c', 6, NS);
