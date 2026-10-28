import { F, CX } from '../core/constants.mjs';

export const proj = (sc, X, z, Y = 0) => { const s = F / z; return { s, x: CX + s * X, y: sc.hy + s * (sc.camH - Y) }; };
export const put = (sc, X, z, Y, mm, cls = '') => { const p = proj(sc, X, z, Y); return `<g class="o ${cls}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${p.s.toFixed(4)})">${mm}</g>`; };
