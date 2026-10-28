// Desk scene with the overhead camera (Plan 24 extraction). Pure SVG-string builder: no DOM, no state.
import { PX_MM, PHONE_MM } from '../core/constants.mjs';
import { sceneDefs } from '../lighting/defs.mjs';
import { topDuckInner } from '../duck/overhead.mjs';
import { phoneFace, DEFAULT_PHONE_TEXT } from './phone.mjs';

  export function buildTopDeskScene({ phone = DEFAULT_PHONE_TEXT } = {}) {
    const pw = PHONE_MM.w * PX_MM, ph = PHONE_MM.h * PX_MM;
    const S = 0.8, duckT = `translate(470 330) rotate(-10) scale(${S}) translate(-178.5 -135)`;
    // Warm-lamp mode: shadows point directly away from the lamp (shorter the farther away); other
    // light modes use one fixed ambient offset. Both shadow sets are in the DOM; CSS picks one.
    const LAMP = { x: 185, y: 128 };
    // Shadow offset scales with the object's height above the desk (`lift`, px): flat things hug their
    // shadow, the duck throws a longer one; lift 0 (a sticky note) casts none.
    const away = (cx, cy, lift) => { const vx = cx - LAMP.x, vy = cy - LAMP.y, d = Math.hypot(vx, vy) || 1, len = lift * Math.max(.7, Math.min(1.5, 420 / d)); return [Math.round(vx / d * len * 10) / 10, Math.round(vy / d * len * 10) / 10]; };
    const obj = (cx, cy, rot, shape, lift = 6) => {
      if (!lift) return `<g transform="translate(${cx} ${cy}) rotate(${rot})">${shape}</g>`;
      const [ax, ay] = away(cx, cy, lift), blur = lift <= 8 ? 'f-blur-s' : 'f-blur';
      return `<g class="cast cast-amb" filter="url(#${blur})" transform="translate(${cx + lift * .85} ${cy + lift}) rotate(${rot})">${shape}</g><g class="cast cast-lamp" filter="url(#${blur})" transform="translate(${cx + ax} ${cy + ay}) rotate(${rot})">${shape}</g><g transform="translate(${cx} ${cy}) rotate(${rot})">${shape}</g>`;
    };
    const key = (rot, len) => `<g transform="rotate(${rot})"><g transform="translate(24 0)"><circle cx="13" cy="0" r="13" fill="#d8c27a" stroke="#8a7634" stroke-width="2.5"/><circle cx="13" cy="0" r="4.5" fill="#6a4833"/><path d="M26 -5H${len}V-1H${len - 9}V3H${len - 18}V-1H${len - 28}V6H26Z" fill="#d8c27a" stroke="#8a7634" stroke-width="2.5" stroke-linejoin="round"/></g></g>`;
    const pencil = `<rect x="-190" y="-7.5" width="330" height="15" fill="#e0a526" stroke="#8a6414" stroke-width="2"/><rect x="-190" y="-2" width="330" height="4" fill="#f5c64a"/><polygon points="-190,-7.5 -228,0 -190,7.5" fill="#e8c79a" stroke="#8a6414" stroke-width="2" stroke-linejoin="round"/><polygon points="-228,0 -214,-3.7 -214,3.7" fill="#3a3a3a"/><rect x="140" y="-7.5" width="26" height="15" fill="#c9ccd1" stroke="#7d8189" stroke-width="2"/><rect x="166" y="-7.5" width="20" height="15" rx="5" fill="#e69aa0" stroke="#a15a60" stroke-width="2"/>`;
    const lines = Array.from({ length: 13 }, (_, i) => `<line x1="-104" y1="${-120 + i * 18}" x2="104" y2="${-120 + i * 18}" stroke="#8fb1c9" stroke-width="1.4"/>`).join('');
    const notepad = `<rect x="-115" y="-163" width="231" height="326" rx="6" fill="#efe6d2" stroke="#b9ad92" stroke-width="2.5"/>${lines}<rect x="-115" y="-163" width="231" height="26" rx="6" fill="#d9ccb0"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${-90 + i * 22.5}" cy="-150" r="4.5" fill="#6a5b46"/>`).join('')}`;
    const balm = `<rect x="-66" y="-16.5" width="132" height="33" rx="11" fill="#ddd4c6" stroke="#9c9183" stroke-width="2.5"/><rect x="-66" y="-16.5" width="50" height="33" rx="11" fill="#58504a"/><rect x="-18" y="-16.5" width="4" height="33" fill="#8f877d"/>`;
    const coin = (kind) => { const gold = kind === 'gold', fill = gold ? 'url(#g-coin-gold)' : 'url(#g-coin-silver)', lo = gold ? '#8a6a1c' : '#7d8189', hi = gold ? '#f6e3a0' : '#f4f5f7'; return `<circle r="21" fill="${fill}" stroke="${lo}" stroke-width="2.2"/><circle r="17.6" fill="none" stroke="${lo}" stroke-width="1.1" stroke-dasharray="1.5 1.5" opacity=".65"/><circle r="13.2" fill="none" stroke="${lo}" stroke-width="1.2" opacity=".85"/>${gold ? '<polygon points="0,-8 2.4,-2.5 8,-2.5 3.6,1.2 5,7 0,3.7 -5,7 -3.6,1.2 -8,-2.5 -2.4,-2.5" fill="' + lo + '" opacity=".7"/>' : '<text y="5.4" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="800" fill="' + lo + '" opacity=".8">Q</text>'}<path d="M-16 -6Q-12 -14 -4 -17" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`; };
    const grain = Array.from({ length: 16 }, (_, i) => `<path d="M-900 ${40 + i * 33}C-300 ${30 + i * 33} 300 ${52 + i * 33} 1860 ${40 + i * 33}" fill="none" stroke="#fff" stroke-opacity=".035" stroke-width="2"/>`).join('');
    return `<svg class="desk-scene" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${sceneDefs}
      <rect x="-900" y="-900" width="2760" height="2340" fill="url(#g-wood-top)"/>${grain}
      <g stroke="#1a0f0a" stroke-opacity=".3" stroke-width="3"><line x1="-900" y1="170" x2="1860" y2="170"/><line x1="-900" y1="350" x2="1860" y2="350"/><line x1="-900" y1="530" x2="1860" y2="530"/></g>
      <g stroke="#fff" stroke-opacity=".08" stroke-width="2"><line x1="-900" y1="173" x2="1860" y2="173"/><line x1="-900" y1="353" x2="1860" y2="353"/><line x1="-900" y1="533" x2="1860" y2="533"/></g>

      ${obj(215, 350, 5, notepad, 5)}
      ${obj(300, 238, 12, '<rect x="-35" y="-35" width="70" height="70" fill="#f1d36a" stroke="#c6a53f" stroke-width="1.5"/><rect x="-35" y="-35" width="70" height="13" fill="#e9c24e"/><path d="M-30 -8H22M-30 6H10" stroke="#c9a94a" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>', 0)}
      ${obj(385, 448, -14, pencil, 4)}
      ${obj(590, 115, 0, `<circle r="27" fill="none" stroke="#c3beb2" stroke-width="6"/><rect x="-6" y="24" width="12" height="26" rx="3" fill="#3f6e8a" transform="rotate(-20)"/>${key(75, 100)}${key(20, 92)}`, 4)}
      ${obj(905, 118, 28, balm, 8)}
      ${obj(612, 466, 0, coin('gold'), 2.5)}${obj(645, 480, 0, coin('silver'), 2.5)}${obj(584, 500, 0, coin('gold'), 2.5)}
      ${obj(790, 300, -6, `<g transform="translate(${-pw / 2} ${-ph / 2})">${phoneFace(pw, ph, phone)}</g>`, 7)}

      ${(() => { const [ax, ay] = away(470, 330, 22); const shape = `<g transform="${duckT}"><ellipse cx="180" cy="135" rx="102" ry="71"/><circle cx="163" cy="135" r="68"/><ellipse cx="197" cy="77" rx="52" ry="15"/><ellipse cx="197" cy="193" rx="52" ry="15"/></g>`; return `<g class="cast cast-amb" filter="url(#f-blur)"><g transform="translate(18 22)">${shape}</g></g><g class="cast cast-lamp" filter="url(#f-blur)"><g transform="translate(${ax} ${ay})">${shape}</g></g>`; })()}
      <g transform="${duckT}" role="img" aria-label="Overhead rubber duck on the desk">${topDuckInner()}</g>

      <g class="lamp-on lamp-pool" aria-hidden="true"><circle cx="185" cy="128" r="520" fill="url(#g-pool)"/><circle cx="185" cy="128" r="170" fill="url(#g-glow)" opacity=".7"/></g>
      <g id="lamp-top">
        <g class="cast cast-keep" filter="url(#f-blur)" transform="translate(12 14)"><path d="M62 48L125 88L185 128" fill="none" stroke="#000" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="62" cy="48" r="54"/><circle cx="185" cy="128" r="70"/></g>
        <circle cx="62" cy="48" r="54" fill="#514038" stroke="#3a2c26" stroke-width="3"/><circle cx="62" cy="48" r="35" fill="#5f4a40"/>
        <path d="M62 48L125 88L185 128" fill="none" stroke="#514038" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="125" cy="88" r="10" fill="#6b574a"/>
        <circle cx="185" cy="128" r="70" fill="#b88650" stroke="#6f4b2a" stroke-width="4"/><circle cx="185" cy="128" r="45" fill="#d0a066" stroke="#8a6034" stroke-width="2.5"/><circle cx="185" cy="128" r="15" fill="#6b574a"/>
        <circle class="lamp-on" cx="185" cy="128" r="70" fill="none" stroke="#ffd48a" stroke-width="8"/>
      </g>
    </svg>`;
  }
