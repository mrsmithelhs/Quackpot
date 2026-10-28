// Plan 26 Stage 3: living-room STILL weather layers (overcast, rain, storm). Pure, deterministic string builders in scene coordinates.
// Still drawings only: no animation, timing, flash, audio or external asset. Elements are grouped by role (data-p26 names: sky, clouds,
// rain-streaks, droplets) so a later, separately approved motion stage could address them, but nothing here is speculative infrastructure.
//
// Rain and storm differ by art, not only darkness: sky and cloud colours, streak density, length, slant and weight, droplet count, tint
// strength and vignette. Storm has NO flash layer. Overcast has no streaks. APPROXIMATIONS: the sky is a flat gradient with ellipse
// clouds; streaks are random-looking but seeded (identical every render); the room tint is a global multiply; the storm + lamp spill is a
// restrained study addition that follows the kit lamp's own position (shade opening, down cone, up spill). The duck gets NO added light:
// the kit's lamp does not reach it, so it stays readable in shade like it does in the ordinary warm scene.
import { ROOM_SPECS } from '../../../../src/assets/apartment/rooms/specs.mjs';
import { proj } from '../../../../src/assets/apartment/rooms/camera.mjs';
import { glassRects, KEYED_ITEMS } from './daylight.mjs';

const sc = ROOM_SPECS.living;
const f1 = n => n.toFixed(1);

export const WEATHER_LOOK = {
  overcast: { sky: ['#b4bec9', '#d6dce3'], cloud: ['#9ca7b5', '#c4ccd6'], clouds: 8, rain: null, drops: 0, tint: ['#8da2c2', .18], vignette: 0, spill: .30, soft: .2 },
  rain: { sky: ['#76849b', '#9aa6b8'], cloud: ['#5f6d84', '#8794a7'], clouds: 9, rain: { n: 62, len: [12, 20], slant: 11, w: 1.1, op: .55, color: '#e9f1fb' }, drops: 7, tint: ['#5b77a4', .30], vignette: .16, spill: .22, soft: .24 },
  storm: { sky: ['#343d51', '#525d74'], cloud: ['#272f40', '#414b61'], clouds: 11, rain: { n: 150, len: [20, 34], slant: 30, w: 1.6, op: .72, color: '#f3f7ff' }, drops: 10, tint: ['#36497a', .46], vignette: .42, spill: .12, soft: .3 }
};

/** Small seeded PRNG (mulberry32): the same weather always draws the same streaks. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const SEEDS = { overcast: 11, rain: 23, storm: 47 };

function glassBox() {
  const r = glassRects(), x0 = Math.min(...r.map(a => a.x)), y0 = Math.min(...r.map(a => a.y)), x1 = Math.max(...r.map(a => a.x + a.w)), y1 = Math.max(...r.map(a => a.y + a.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Sky, clouds, streaks and droplets, clipped to the four panes. Inserted right after the window item (under plant, lamp, curtains). */
export function windowWeatherLayer({ id, weather }) {
  const L = WEATHER_LOOK[weather], r = rng(SEEDS[weather]), b = glassBox();
  const clouds = Array.from({ length: L.clouds }, (_, i) => {
    const rx = 24 + r() * 34, ry = 9 + r() * 10, cx = b.x + r() * b.w, cy = b.y + (weather === 'overcast' ? .1 + r() * .55 : .02 + r() * .5) * b.h;
    return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${L.cloud[i % 2]}" opacity="${(.82 + r() * .16).toFixed(2)}"/>`;
  }).join('');
  let streaks = '', drops = '';
  if (L.rain) {
    const R = L.rain, s = Math.sin(R.slant * Math.PI / 180), c = Math.cos(R.slant * Math.PI / 180);
    streaks = Array.from({ length: R.n }, () => { const len = R.len[0] + r() * (R.len[1] - R.len[0]), x = b.x - 20 + r() * (b.w + 40), y = b.y - 10 + r() * (b.h + 10); return `M${f1(x)} ${f1(y)}L${f1(x - len * s)} ${f1(y + len * c)}`; }).join('');
    streaks = `<path d="${streaks}" fill="none" stroke="${R.color}" stroke-width="${R.w}" stroke-linecap="round" opacity="${R.op}"/>`;
    drops = Array.from({ length: L.drops }, () => {
      const x = b.x + 6 + r() * (b.w - 12), y = b.y + 8 + r() * (b.h - 16), rx = 1.8 + r() * 1.8, ry = rx * 1.45, trail = r() < .5 ? `<line x1="${f1(x)}" y1="${f1(y - ry)}" x2="${f1(x + .6)}" y2="${f1(y - ry - 9 - r() * 8)}" stroke="#eaf2fb" stroke-width="1" stroke-linecap="round" opacity=".28"/>` : '';
      return `${trail}<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#dfeaf7" fill-opacity=".34" stroke="#ffffff" stroke-opacity=".55" stroke-width=".8"/><circle cx="${f1(x - rx * .3)}" cy="${f1(y - ry * .35)}" r="${f1(rx * .28)}" fill="#fff" opacity=".8"/>`;
    }).join('');
  }
  return `<defs><clipPath id="${id}-panes">${glassRects().map(g => `<rect x="${f1(g.x)}" y="${f1(g.y)}" width="${f1(g.w)}" height="${f1(g.h)}"/>`).join('')}</clipPath>`
    + `<linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.sky[0]}"/><stop offset="1" stop-color="${L.sky[1]}"/></linearGradient></defs>`
    + `<g clip-path="url(#${id}-panes)"><rect data-p26="sky" x="${f1(b.x - 4)}" y="${f1(b.y - 4)}" width="${f1(b.w + 8)}" height="${f1(b.h + 8)}" fill="url(#${id}-sky)"/>`
    + `<g data-p26="clouds">${clouds}</g>${L.rain ? `<g data-p26="rain-streaks">${streaks}</g><g data-p26="droplets">${drops}</g>` : ''}</g>`;
}

/** Soft, directionless ambient shadows (no sun): wide blurred ellipses under the large furniture. Inserted after the rug. */
export function floorWeatherLayer({ id, furnishings, weather }) {
  const L = WEATHER_LOOK[weather], K = KEYED_ITEMS, items = [];
  const base = (X, z, half) => { const p = proj(sc, X, z, 0); return `<ellipse cx="${f1(p.x)}" cy="${f1(p.y + 3)}" rx="${f1(p.s * half * 1.15)}" ry="${f1(p.s * half * .16)}"/>`; };
  if (furnishings.couch === 'present') items.push(base(K.sofa.X, K.sofa.z, 800));
  if (furnishings.tv === 'present') items.push(base(K.tv.X, K.tv.z, 700));
  items.push(base(K.plant.X, K.plant.z, 260), base(K.lamp.X, K.lamp.z, 200));
  return `<defs><filter id="${id}-soft-blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7"/></filter></defs>`
    + `<g data-p26="ambient-shadows" fill="#2c3d63" opacity="${L.soft}" filter="url(#${id}-soft-blur)" style="mix-blend-mode:multiply">${items.join('')}</g>`;
}

/** Room atmosphere (above furniture and duck, below the first lamp glow): cool tint, vignette, cool window spill, and for the lamp cell a restrained warm spill that follows the kit lamp (no light is added to the duck). */
export function atmosphereWeatherLayer({ id, weather, lamp }) {
  const L = WEATHER_LOOK[weather], b = glassBox(), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const LP = sc.lampAt, open = proj(sc, LP.X, LP.z, 1200), mid = proj(sc, LP.X, LP.z, 650), up = proj(sc, LP.X, LP.z, 1700);   // the kit lamp: shade opening, middle of its down cone, above the shade
  return `<defs>`
    + `<radialGradient id="${id}-vig" cx=".5" cy=".6" r=".75"><stop offset=".35" stop-color="#0a1020" stop-opacity="0"/><stop offset="1" stop-color="#0a1020" stop-opacity="${L.vignette}"/></radialGradient>`
    + `<radialGradient id="${id}-spill"><stop offset="0" stop-color="#d6e4ff" stop-opacity="${L.spill}"/><stop offset=".6" stop-color="#c3d6f5" stop-opacity="${(L.spill * .3).toFixed(3)}"/><stop offset="1" stop-color="#b8cdee" stop-opacity="0"/></radialGradient>`
    + (lamp ? `<radialGradient id="${id}-spill-lamp"><stop offset="0" stop-color="#ffc98a" stop-opacity=".34"/><stop offset=".55" stop-color="#ffb86e" stop-opacity=".13"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>` : '')
    + `</defs>`
    + `<rect data-p26="weather-tint" x="-6000" y="-6000" width="14000" height="14000" pointer-events="none" fill="${L.tint[0]}" opacity="${L.tint[1]}" style="mix-blend-mode:multiply"/>`
    + (L.vignette ? `<rect data-p26="weather-vignette" x="-6000" y="-6000" width="14000" height="14000" pointer-events="none" fill="url(#${id}-vig)" style="mix-blend-mode:multiply"/>` : '')
    + `<ellipse data-p26="window-spill" cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(b.w * 1.9)}" ry="${f1(b.h * 1.5)}" fill="url(#${id}-spill)" style="mix-blend-mode:screen"/>`
    + (lamp ? `<g data-p26="lamp-spill" style="mix-blend-mode:screen"><ellipse cx="${f1(mid.x)}" cy="${f1(mid.y)}" rx="${f1(mid.s * 950)}" ry="${f1(mid.s * 800)}" fill="url(#${id}-spill-lamp)"/><ellipse cx="${f1(up.x)}" cy="${f1(up.y)}" rx="${f1(up.s * 520)}" ry="${f1(up.s * 420)}" fill="url(#${id}-spill-lamp)" opacity=".6"/></g>` : '');
}
