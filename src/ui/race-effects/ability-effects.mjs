// Unmounted visual extraction from Plan 58; explicit presentation only.
// No gameplay state, clock, randomness, DOM ownership or report imports.
const clamp = (n) => Math.max(0, Math.min(1, n));
const envelope = (p) => Math.min(1, p * 5, (1 - p) * 5);
const wrap = (body) => `<svg viewBox="0 0 256 256" aria-hidden="true">${body}</svg>`;
const kinds = new Set(['bounce', 'crowd', 'guard', 'recovery', 'dive', 'wide', 'ahead', 'draft', 'straight', 'steady', 'wake']);

function force(p, still) {
  const rise = still ? 1 : Math.min(1, Math.max(0, Math.sin(Math.PI * p) * 1.5));
  const arrow = '<path d="M-6 0 V-34 H-13 L0 -50 L13 -34 H6 V0 Z" fill="#ff684c" stroke="#4a140c" stroke-width="3"/>';
  return wrap(`<ellipse cx="128" cy="218" rx="58" ry="13" fill="#8a6a3a" stroke="#4a3a20" stroke-width="4"/><g opacity="${.35 + .65 * rise}" transform="translate(0 ${8 * (1 - rise)})"><g transform="translate(92 215)">${arrow}</g><g transform="translate(128 215) scale(1 1.2)">${arrow}</g><g transform="translate(164 215)">${arrow}</g></g><ellipse cx="128" cy="218" rx="46" ry="9" fill="#f6efd9" stroke="#4a3a20" stroke-width="3"/><ellipse cx="128" cy="218" rx="25" ry="5" fill="none" stroke="#ef6a1a" stroke-width="3"/>`);
}
function wave(p, still) {
  const ripple = still ? 0 : Math.sin(p * Math.PI * 4) * 5;
  return wrap(`<g transform="translate(0 ${ripple})"><path d="M20 213 Q30 166 60 171 Q82 174 103 213 Z" fill="#9fe0d8" stroke="#256f7c" stroke-width="5"/><path d="M28 215 Q46 185 65 192 Q80 196 96 215 Z" fill="#5bbcb8" stroke="#256f7c" stroke-width="4"/><path d="M42 217 Q55 199 69 204 Q80 207 89 217 Z" fill="#2f8f99" stroke="#256f7c" stroke-width="3"/><path d="M28 202 Q50 177 72 188" fill="none" stroke="#f4fbf4" stroke-width="6" stroke-linecap="round"/></g>`);
}
function air(p, still, front) {
  const offset = still ? 0 : -p * 90;
  const d = front ? 'M66 145 C100 133 149 132 190 138 L231 147' : 'M62 156 C106 148 158 147 195 155 L231 165';
  return wrap(`<path d="${d}" fill="none" stroke="#1f4a78" stroke-width="12" stroke-linecap="round" stroke-dasharray="70 16" stroke-dashoffset="${offset}"/><path d="${d}" fill="none" stroke="#bfe8ff" stroke-width="7" stroke-linecap="round" stroke-dasharray="70 16" stroke-dashoffset="${offset}"/>`);
}
function guard(p, still) {
  const v = still ? 1 : Math.min(1, p * 5);
  return wrap(`<g opacity="${v}" fill="none" stroke="#f6efd9" stroke-width="10" stroke-linecap="round"><path d="M190 76 Q226 108 190 146"/><path d="M201 86 Q226 110 201 135" stroke="#294553" stroke-width="4"/></g>`);
}
function recovery(p, still) {
  const v = still ? .65 : p;
  return wrap(`<path d="M200 178 Q176 218 95 205" fill="none" stroke="#f6efd9" stroke-width="11" stroke-linecap="round" stroke-dasharray="70 30" stroke-dashoffset="${-v * 60}"/><path d="M113 192 L95 205 L116 211" fill="none" stroke="#294553" stroke-width="5"/>`);
}
function diveLayer(p, behind) {
  const sub = p < .2, emerge = p >= .8, progress = sub ? p / .2 : emerge ? (p - .8) / .2 : 0;
  const ring = sub ? 1 - .7 * progress : emerge ? .3 + .7 * progress : p < .3 ? .3 * (.3 - p) / .1 : p > .7 ? .3 * (p - .7) / .1 : 0;
  const splash = sub ? 1 - progress : emerge ? Math.sin(Math.PI * progress) : 0;
  const drops = behind ? [[67,155,-16,-27],[170,154,14,-30],[95,145,-6,-36]] : [[83,163,-17,-32],[148,160,17,-36],[187,167,22,-22]];
  const spray = drops.map(([x,y,dx,dy]) => `<ellipse cx="${x + dx * progress}" cy="${y + dy * progress}" rx="4" ry="7" fill="#a8e5eb" stroke="#397c87" stroke-width="2" opacity="${splash}"/>`).join('');
  const ripple = behind && ring ? `<g transform="translate(128 180) scale(${ring}) translate(-128 -180)" opacity="${Math.max(.35,splash)}"><ellipse cx="128" cy="180" rx="86" ry="20" fill="#6ab4b1" fill-opacity=".72" stroke="#245d68" stroke-width="6"/><ellipse cx="128" cy="180" rx="48" ry="10" fill="none" stroke="#d6f2ea" stroke-width="4"/></g>` : '';
  return wrap(ripple + spray);
}
function wide(p) { return wrap(`<g fill="none" stroke-linecap="round" opacity="${envelope(p)}"><g stroke="#254f5a" stroke-width="12"><path d="M165 91 Q205 120 165 150"/><path d="M180 77 Q238 120 180 164"/></g><g stroke="#eff9f0" stroke-width="6"><path d="M165 91 Q205 120 165 150"/><path d="M180 77 Q238 120 180 164"/></g></g>`); }
function aheadShadow(p) { const v = envelope(p); return wrap(`<ellipse class="ahead-ground-shadow" cx="128" cy="185" rx="${45*(1+.25*p)}" ry="${9*(1+.25*p)}" fill="#263d49" opacity="${v*(.32-.16*p)}"/>`); }
function aheadArcs(p) { return wrap(`<g opacity="${envelope(p)}" fill="none" stroke-linecap="round"><g stroke="#285762" stroke-width="12"><path d="M158 110 Q185 119 195 138"/><path d="M171 98 Q201 109 213 130"/></g><g stroke="#e7f8f4" stroke-width="6"><path d="M158 110 Q185 119 195 138"/><path d="M171 98 Q201 109 213 130"/></g></g>`); }
function draft(p, g, back) {
  const { width, height, leaderX, followerX, y, duckWidth } = g, sign = leaderX < followerX ? -1 : 1;
  const from = leaderX - sign * duckWidth * .25, to = followerX + sign * duckWidth * .27, mid = (from + to) / 2;
  const paths = back ? `<path d="M${from} ${y-8} Q${mid} ${y-19} ${to} ${y-8}"/><path d="M${from} ${y-1} Q${mid} ${y-11} ${to} ${y-1}"/>` : `<path d="M${from} ${y+12} Q${mid} ${y+18} ${to} ${y+12}"/>`;
  return `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true"><g opacity="${envelope(p)}" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#315e69" stroke-width="7">${paths}</g><g stroke="#e0f7f1" stroke-width="3.5">${paths}</g></g></svg>`;
}
function straight(p) { const v = envelope(p), offset = (1-p)*54; return wrap(`<g fill="none" stroke-linecap="round" opacity="${v}"><g stroke="#294d5c" stroke-width="11" stroke-dasharray="42 14" stroke-dashoffset="${offset}"><path d="M11 151 H84"/><path d="M11 178 H84"/></g><g stroke="#f4f8df" stroke-width="5" stroke-dasharray="42 14" stroke-dashoffset="${offset}"><path d="M11 151 H84"/><path d="M11 178 H84"/></g></g>`); }
function steady(p, back) {
  const v = envelope(p), x = back ? 75 : 182, r = 66 - 17 * Math.min(1,p*2);
  const ring = `M${128-r} 184 A${r} 17 0 0 ${back ? 1 : 0} ${128+r} 184`;
  const brace = `M${x} 104 Q${x+(back?-12:12)*(1-Math.max(0,(p-.5)*2))} 145 ${x} 183`;
  const paths = (d, outer, inner) => `<path d="${d}" stroke="${outer}" stroke-width="11"/><path d="${d}" stroke="${inner}" stroke-width="5"/>`;
  return wrap(`<g fill="none" stroke-linecap="round"><g class="steady-ring-phase" opacity="${v*Math.max(0,Math.min(1,(.58-p)/.16))}">${paths(ring,'#463f79','#e5d7f7')}</g><g class="steady-brace-phase" opacity="${v*Math.max(0,Math.min(1,(p-.42)/.16))}">${paths(brace,'#564479','#eee0fb')}</g></g>`);
}
function wake(p, back) { const cy=back?168:196; return wrap(`<g opacity="${envelope(p)}" transform="rotate(${p*(back?100:-100)} 195 ${cy})" fill="none" stroke-linecap="round"><path d="M195 ${cy} C181 ${cy-14} 173 ${cy+7} 187 ${cy+13} C202 ${cy+21} 214 ${cy+4} 209 ${cy-8}" stroke="#255e6c" stroke-width="12"/><path d="M195 ${cy} C181 ${cy-14} 173 ${cy+7} 187 ${cy+13} C202 ${cy+21} 214 ${cy+4} 209 ${cy-8}" stroke="#daf5ee" stroke-width="5"/></g>`); }

/** Produce selected layers and articulated-pose descriptors from explicit inputs. */
export function abilityVisual({ kind, progress, idPrefix, pose = {} }) {
  if (!kinds.has(kind) || typeof idPrefix !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(idPrefix) || !pose || typeof pose !== 'object'
      || (progress !== null && (!Number.isFinite(progress) || progress < 0 || progress > 1))
      || (pose.still !== undefined && typeof pose.still !== 'boolean')
      || (pose.facing !== undefined && !['left', 'right', 'turn'].includes(pose.facing))
      || (pose.wobbleAngle !== undefined && (!Number.isFinite(pose.wobbleAngle) || Math.abs(pose.wobbleAngle) > 90))) throw new RangeError('invalid visual input');
  const facing = pose.facing ?? 'left';
  const orientation = { layerScaleX: facing === 'right' ? -1 : facing === 'turn' ? .55 : 1,
    bodyRotateY: facing === 'right' ? 180 : facing === 'turn' ? 65 : 0 };
  const empty = { kind, active: false, layers: {}, wingArtwork: '', headBridge: '', pose: { bodyY: 0, bodyOpacity: 1, wingAngle: 0, head: { dx: 0, dy: 0, angle: 0, bridge: 0 }, tilt: 0, wingFan: 0, wingFanAngle: 0, underwater: false }, facing, orientation };
  if (progress === null) return empty;
  const still = Boolean(pose.still), p = still ? .5 : clamp(progress), v = envelope(p), layers = {};
  if (kind === 'bounce') layers.water = force(p, still);
  if (kind === 'crowd') { layers.water = wave(p, still); layers.back = air(p, still, false); layers.front = air(p, still, true); }
  if (kind === 'guard') layers.overlay = guard(p, still);
  if (kind === 'recovery') layers.overlay = recovery(p, still);
  if (kind === 'dive') { layers.back = diveLayer(p, true); layers.front = diveLayer(p, false); }
  if (kind === 'wide') layers.overlay = wide(p);
  if (kind === 'ahead') { layers.water = aheadShadow(p); layers.overlay = aheadArcs(p); }
  if (kind === 'draft') {
    const g = pose.link;
    if (!g || !['width','height','leaderX','followerX','y','duckWidth'].every((key) => Number.isFinite(g[key]) && Math.abs(g[key]) <= 10000)
        || g.width <= 0 || g.height <= 0 || g.duckWidth <= 0) throw new RangeError('draft needs finite link geometry');
    layers.back = draft(p, g, true); layers.front = draft(p, g, false);
  }
  if (kind === 'straight') layers.overlay = straight(p);
  if (kind === 'steady') { layers.back = steady(p, true); layers.front = steady(p, false); }
  if (kind === 'wake') { layers.back = wake(p, true); layers.front = wake(p, false); }
  for (const key of Object.keys(layers)) layers[key] = layers[key].replace('<svg ', `<svg id="${idPrefix}-${key}" `);
  const head = ['ahead','draft','crowd'].includes(kind) ? { dx: -3*v, dy: 2*v, angle: -18*v, bridge: v } : empty.pose.head;
  const wingAngle = kind === 'bounce' ? (still ? -28 : Math.sin(p*Math.PI*6)*32)
    : kind === 'wide' ? (still ? -35 : Math.sin(p*Math.PI*4)*38)
    : kind === 'ahead' ? (still ? -30 : -25+Math.sin(p*Math.PI*8)*22)
    : kind === 'steady' ? (still ? -12 : -(pose.wobbleAngle ?? 0)*1.5)
    : kind === 'wake' ? (still ? -10 : Math.sin(p*Math.PI*4)*22)
    : kind === 'straight' ? (still ? -10 : Math.sin(p*Math.PI)*-24) : 0;
  const immersion = kind === 'dive' ? Math.max(0, Math.min(1,p/.2,(1-p)/.2)) : 0;
  const lift = kind === 'bounce' ? (still ? .65 : Math.sin(Math.PI*p)) : kind === 'ahead' ? v*2.8 : 0;
  const wingArtwork = ['wide','ahead'].includes(kind) ? `<g id="${idPrefix}-wing-fan" aria-hidden="true"><path d="M58 62 Q69 48 76 42 L75 57 Q84 45 91 43 L85 60 Q93 54 97 55 L86 68 Q75 72 60 68 Z" fill="var(--duck-wing-fill)" stroke="var(--duck-wing-shadow)" stroke-width="1.4"/><path d="M64 64 L76 51 M67 65 L86 53 M70 67 L91 60" fill="none" stroke="var(--duck-wing-shadow)" stroke-width="1"/></g>` : '';
  const headBridge = ['ahead','draft','crowd'].includes(kind) ? `<path id="${idPrefix}-neck-bridge" d="M35 43 Q43 46 52 48 L54 58 Q45 61 36 57 Z" fill="var(--duck-body-fill)" aria-hidden="true"/>` : '';
  return { kind, active: true, layers, wingArtwork, headBridge, facing, orientation, pose: { bodyY: 22*immersion-lift*38,
    bodyOpacity: 1-.58*immersion, wingAngle, head, tilt: kind === 'steady' ? (pose.wobbleAngle ?? 0) : kind === 'straight' ? Math.sin(Math.PI*p)*11 : 0,
    wingFan: kind === 'wide' ? Math.sin(Math.PI*p) : kind === 'ahead' ? v : 0, wingFanAngle: kind === 'ahead' ? -35 : 0,
    underwater: kind === 'dive' && p >= .2 && p < .8 } };
}
