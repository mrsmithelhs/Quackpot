// Light modes for the apartment scenes, baked into the returned SVG so a scene is self-contained.
//
// The original review page switched light with page CSS (.stage[data-light]) plus an HTML overlay. Here the same
// rules are emitted as a <style> block scoped to the scene's own class, with the chosen mode already applied, and
// the overlay is drawn inside the SVG in scene coordinates. Intentional differences: no 0.2 s fade (static output)
// and the overlay follows the scene box instead of a host stage's percentages (hosts that prefer the original
// behaviour can pass overlay:'none' and use the returned `lighting` hints).

export const LIGHT_MODES = ['neutral', 'window', 'warm'];

/** Hints for desk scenes (the original page's per-area CSS custom properties, in percent of the scene box). */
export const DESK_LIGHT_HINTS = { 'desk-side': { x: 33, y: 62 }, 'desk-top': { x: 28, y: 38 } };

/** Scoped copy of the original page CSS for the scene classes, with `mode` applied. `cls` is the root class. */
export function sceneStyle(cls, mode) {
  const s = `.${cls}`;
  const warm = mode === 'warm';
  return `<style>${s}{width:100%;height:100%;display:block;overflow:visible}`
    + `${s} .cast [fill]:not([fill="none"]){fill:#1a0f0a}${s} .cast [stroke]:not([stroke="none"]){stroke:#1a0f0a}`
    + `${s} .cast{opacity:.3}${s} .cast-keep{opacity:.3}${s} .cast-lamp{display:none}`
    + `${s} .lamp-on{opacity:${warm ? 1 : 0}}${s} .lamp-pool{mix-blend-mode:screen}`
    + (warm ? `${s} .cast-amb{display:none}${s} .cast-lamp{display:inline;opacity:.42}` : '')
    + `${s}.room-scene .o{stroke:#3a2c26;stroke-width:2;stroke-linejoin:round}${s}.room-scene .o *{vector-effect:non-scaling-stroke}</style>`;
}

const BIG = 'x="-6000" y="-6000" width="14000" height="14000" pointer-events="none"';

/**
 * In-SVG equivalent of the original HTML overlay. `box` = [x, y, w, h] of the scene viewBox; `hint` =
 * { x, y, rx, ry } in percent of that box (centre and ellipse radii of the warm pool).
 */
export function overlayMarkup(mode, box, hint) {
  const [vx, vy, vw, vh] = box;
  if (mode === 'neutral') return `<rect ${BIG} fill="rgb(255,247,227)" fill-opacity=".05"/>`;
  if (mode === 'window') {
    // CSS linear-gradient(115deg, rgb(255 245 205 / 24%), transparent 58%) over the box.
    const a = 115 * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a), len = Math.abs(vw * Math.sin(a)) + Math.abs(vh * Math.cos(a));
    const cx = vx + vw / 2, cy = vy + vh / 2, f = n => Math.round(n * 100) / 100;
    return `<defs><linearGradient id="g-overlay" gradientUnits="userSpaceOnUse" x1="${f(cx - dx * len / 2)}" y1="${f(cy - dy * len / 2)}" x2="${f(cx + dx * len / 2)}" y2="${f(cy + dy * len / 2)}"><stop offset="0" stop-color="rgb(255,245,205)" stop-opacity=".24"/><stop offset=".58" stop-color="rgb(255,245,205)" stop-opacity="0"/></linearGradient></defs><rect ${BIG} fill="url(#g-overlay)"/>`;
  }
  // warm: CSS radial-gradient(ellipse rx ry at px py, rgb(255 190 98 / 48%), rgb(255 171 76 / 20%) 34%, rgb(18 19 29 / 82%)).
  const cx = vx + vw * hint.x / 100, cy = vy + vh * hint.y / 100, rx = vw * hint.rx / 100, ry = vh * hint.ry / 100, f = n => Math.round(n * 100) / 100;
  return `<defs><radialGradient id="g-overlay" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${f(cx)} ${f(cy)}) scale(${f(rx)} ${f(ry)})"><stop offset="0" stop-color="rgb(255,190,98)" stop-opacity=".48"/><stop offset=".34" stop-color="rgb(255,171,76)" stop-opacity=".2"/><stop offset="1" stop-color="rgb(18,19,29)" stop-opacity=".82"/></radialGradient></defs><rect ${BIG} fill="url(#g-overlay)"/>`;
}
