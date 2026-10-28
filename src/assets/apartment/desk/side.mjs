// Desk scene with the side camera (Plan 24 extraction). Pure SVG-string builder: no DOM, no state.
import { PX_MM, PHONE_MM, DUCK_SCALE, DUCK_CX } from '../core/constants.mjs';
import { sceneDefs } from '../lighting/defs.mjs';
import { DUCK_LABELS, duckInnerMarkup } from '../duck/index.mjs';
import { phoneFace, DEFAULT_PHONE_TEXT } from './phone.mjs';

  export function buildSideDeskScene({ duckView, phone = DEFAULT_PHONE_TEXT }) {
    if (!['front', 'side', 'rear'].includes(duckView)) throw new RangeError(`duckView must be front, side or rear; got "${duckView}"`);
    const dx = 270 - DUCK_CX[duckView] * DUCK_SCALE, dy = 414 - 250 * DUCK_SCALE;
    const pw = PHONE_MM.w * PX_MM, ph = PHONE_MM.h * PX_MM, pcx = 690;
    const duckInner = duckInnerMarkup(duckView);
    return `<svg class="desk-scene" viewBox="0 0 960 540" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${sceneDefs}
      <rect x="-900" y="-600" width="2760" height="1100" fill="#d5d0c6"/>
      <rect x="-900" y="500" width="2760" height="300" fill="#a59582"/>
      <g><rect x="380" y="36" width="270" height="190" fill="#eee5d5"/><rect x="389" y="45" width="252" height="172" fill="#b9d2d7"/><rect x="512" y="45" width="6" height="172" fill="#eee5d5"/><rect x="389" y="140" width="252" height="6" fill="#eee5d5"/></g>
      <rect x="-900" y="470" width="2760" height="60" fill="#1a0f0a" opacity=".16"/>
      <rect x="-900" y="384" width="2760" height="5" fill="#1a0f0a" opacity=".16"/>
      <path d="M-900 388H1860V432H-900Z" fill="url(#g-wood-side)"/>
      <rect x="-900" y="432" width="2760" height="38" fill="#5c3e2d"/><rect x="-900" y="432" width="2760" height="2" fill="#b08a66"/>
      <rect x="44" y="470" width="36" height="120" fill="#4a3326"/><rect x="882" y="470" width="36" height="120" fill="#4a3326"/>

      <g id="lamp-side">
        ${(() => {
          // Lamp head at (238,112), turned 80 deg so its opening faces down and slightly right; the light cones
          // start at that opening and spread +/- about the head axis, so beam and lamp agree.
          const hx = 238, hy = 112, rot = 80 * Math.PI / 180, g = (lx, ly) => [hx + lx * Math.cos(rot) - ly * Math.sin(rot), hy + lx * Math.sin(rot) + ly * Math.cos(rot)];
          const A = g(30, 40), B = g(30, -40), deskY = 410;
          const cone = (half, op) => { const h = half * Math.PI / 180, aL = rot + h, aR = rot - h, tL = (deskY - A[1]) / Math.sin(aL), tR = (deskY - B[1]) / Math.sin(aR);
            const pts = [A, [A[0] + tL * Math.cos(aL), deskY], [B[0] + tR * Math.cos(aR), deskY], B].map(q => q.map(v => v.toFixed(1)).join(',')).join(' ');
            return `<polygon points="${pts}" fill="url(#g-cone)" opacity="${op}"/>`; };
          const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
          return `<g class="lamp-on" filter="url(#f-blur-l)">${cone(46, .5)}${cone(26, .8)}<ellipse cx="${(mid[0] + 62).toFixed(0)}" cy="410" rx="190" ry="15" fill="#ffc47a" opacity=".55"/><circle cx="${mid[0].toFixed(1)}" cy="${mid[1].toFixed(1)}" r="46" fill="url(#g-glow)"/></g>`;
        })()}
        <ellipse cx="84" cy="398" rx="50" ry="9" fill="#514038"/>
        <path d="M84 392L118 196L243 84" fill="none" stroke="#514038" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="118" cy="196" r="10" fill="#6b574a"/>
        <g transform="translate(238 112) rotate(80)"><polygon points="-30,-26 30,-40 30,40 -30,26" fill="#514038" stroke="#3a2c26" stroke-width="3" stroke-linejoin="round"/><line x1="30" y1="-40" x2="30" y2="40" stroke="#d9d2c4" stroke-width="5"/><line class="lamp-on" x1="30" y1="-40" x2="30" y2="40" stroke="#ffd48a" stroke-width="7"/></g>
      </g>

      <g class="cast" opacity=".32" filter="url(#f-blur)"><ellipse cx="300" cy="418" rx="105" ry="10"/><ellipse cx="506" cy="428" rx="88" ry="9"/><ellipse cx="716" cy="412" rx="80" ry="8"/><ellipse cx="880" cy="410" rx="96" ry="9"/></g>

      <g id="phone-side"><rect x="${pcx - 70}" y="398" width="140" height="10" rx="5" fill="#413b36"/>
        <g transform="translate(${pcx - pw / 2} ${398 - ph})">${phoneFace(pw, ph, phone)}</g>
        <rect x="${pcx - 50}" y="380" width="100" height="22" rx="6" fill="#413b36"/></g>

      <g id="books-plant-side">
        <rect x="785" y="344" width="160" height="62" fill="#4f6b7a"/><rect x="785" y="354" width="160" height="5" fill="#e8dcc0"/><rect x="785" y="392" width="160" height="3" fill="#e8dcc0" opacity=".7"/>
        <rect x="797" y="282" width="140" height="62" fill="#8a5a44"/><rect x="797" y="292" width="140" height="5" fill="#e8dcc0"/><rect x="797" y="330" width="140" height="3" fill="#e8dcc0" opacity=".7"/>
        <rect x="925" y="282" width="12" height="124" fill="#1a0f0a" opacity=".16"/>
        <g fill="#5f9a62" stroke="#3f6e44" stroke-width="2"><ellipse cx="885" cy="208" rx="11" ry="30" transform="rotate(-42 885 236)"/><ellipse cx="885" cy="208" rx="11" ry="30" transform="rotate(42 885 236)"/><ellipse cx="885" cy="206" rx="11" ry="31" transform="rotate(-18 885 236)"/><ellipse cx="885" cy="206" rx="11" ry="31" transform="rotate(18 885 236)"/><ellipse cx="885" cy="204" rx="12" ry="32"/></g>
        <path d="M840 236H930L922 282H848Z" fill="#b5654a" stroke="#7d4130" stroke-width="3" stroke-linejoin="round"/><rect x="836" y="230" width="98" height="10" rx="4" fill="#c5745a" stroke="#7d4130" stroke-width="3"/>
      </g>

      <g id="mug-side" transform="translate(470 424) scale(.72) translate(-470 -424)"><path d="M395 254H545V412Q545 424 533 424H407Q395 424 395 412Z" fill="#b86b4b" stroke="#7f4630" stroke-width="3"/>
        <rect x="520" y="262" width="25" height="160" fill="#1a0f0a" opacity=".14"/><rect x="406" y="264" width="13" height="140" rx="6" fill="#fff" opacity=".2"/>
        <path d="M545 284C592 280 594 374 545 378" fill="none" stroke="#b86b4b" stroke-width="14"/><path d="M545 284C592 280 594 374 545 378" fill="none" stroke="#7f4630" stroke-width="2" opacity=".6" transform="translate(6 0)"/>
        <ellipse cx="470" cy="254" rx="75" ry="7" fill="#5a3322" stroke="#7f4630" stroke-width="3"/></g>

      <svg x="${dx}" y="${dy}" width="${360 * DUCK_SCALE}" height="${270 * DUCK_SCALE}" viewBox="0 0 360 270" overflow="visible" role="img" aria-label="${DUCK_LABELS[duckView]} rubber duck on the desk">${duckInner}</svg>
    </svg>`;
  }
