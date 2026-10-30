// Plan 28 gallery: report-local posed duck (owner D14 and the art expansion the owner authorised on 2026-10-30).
// The apartment kit always draws its own duck facing left. Here that duck is removed from the rendered scene in the
// page (the kit itself is unchanged) and replaced by a posed duck drawn from the kit's own renderDuck() artwork.
// Poses: facing left or right, leaning (gaze up or down) against something, top-down at any heading, scaled for
// distance, optionally sitting on a perch. These are compositions of existing artwork, not new duck drawings.

import { renderDuck } from '../../../../src/assets/apartment/index.mjs';
import * as perches from './perches.mjs';

const ROOM_ASPECT = 16 / 9;
// renderDuck() draws in a 360x270 box; the side/front/rear base sits near (176-180, 250). Top view is centred.
const BASE = { side: [176 / 360, 250 / 270], front: [180 / 360, 250 / 270], rear: [180 / 360, 250 / 270], top: [0.5, 0.5] };

/** Remove the kit's built-in duck (and its contact or cast shadows) from a rendered scene, in the page only. */
export function removeKitDuck(sceneEl) {
  const root = sceneEl.querySelector('svg');
  const box = sceneEl.getBoundingClientRect();
  let kit = null;
  for (const el of sceneEl.querySelectorAll('[aria-label*="rubber duck"]')) {
    if (el === root) continue;
    // Where the kit put its duck, so a pose can keep that spot: base point and drawing-box width, % of the room.
    const r = el.getBoundingClientRect();
    if (el.tagName === 'svg' && box.width) {
      kit = { x: ((r.left - box.left + r.width * BASE.side[0]) / box.width) * 100, y: ((r.top - box.top + r.height * BASE.side[1]) / box.height) * 100, w: (r.width / box.width) * 100 };
    }
    const prev = el.previousElementSibling;
    if (prev?.tagName === 'ellipse' && /g-soft/.test(prev.getAttribute('fill') ?? '')) prev.remove();
    el.remove();
  }
  // desk-top: the duck's two cast shadows reuse its own transform
  for (const g of sceneEl.querySelectorAll('g.cast')) if (g.innerHTML.includes('rotate(-10) scale(0.8)')) g.remove();
  return kit ?? { x: 50, y: 70, w: 10 };
}

/**
 * Heading (CSS degrees, clockwise) that turns a duck whose beak natively points left so it points from `from` to `to`.
 * Both points are percentages of the room box; the room is 16:9, so horizontal percentages are scaled.
 */
export function headingToward(from, to) {
  const dx = (to.x - from.x) * ROOM_ASPECT;
  const dy = to.y - from.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = right, 90 = down
  return Math.round(((angle - 180 + 540) % 360) - 180);
}

/**
 * Lean (CSS degrees) for a side-view duck so its gaze tilts toward `to`: positive looks up.
 * Clamped to a believable tilt for a duck resting against something.
 */
export function leanToward(from, to, max = 22) {
  const dx = Math.abs(to.x - from.x) * ROOM_ASPECT;
  const dy = from.y - to.y;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return Math.max(-max, Math.min(max, Math.round(deg * 0.6)));
}

/**
 * HTML for one posed duck, positioned in the room by percentages.
 *   pose.view    'side' | 'front' | 'rear' | 'top'
 *   pose.facing  'left' | 'right' (side view; the kit's side duck faces left)
 *   pose.lean    degrees, side view: positive tips the beak up (resting back against something), negative down
 *   pose.turn    degrees clockwise, top view: heading; the native overhead duck's beak points left
 *   pose.x/y     the duck's base point (top view: its centre), % of the room; ignored when `perch` is given
 *   pose.size    duck width as % of the room width (smaller = farther away)
 *   pose.perch   optional { name, x, y, w, ...options }: a perch from perches.mjs, placed at x/y (top-left, %) with
 *                width w (%); the duck stands on the perch's seat
 */
export function duckLayerHtml(pose, idPrefix) {
  const view = pose.view ?? 'side';
  let { x, y } = pose;
  let perchHtml = '';
  if (pose.perch) {
    const { name, x: px, y: py, w, ...opts } = pose.perch;
    const made = perches[name]({ idPrefix: `${idPrefix}-p`, ...opts });
    const [, , vbW, vbH] = made.svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const h = w * (vbH / vbW) * ROOM_ASPECT;
    x = px + (made.seat.x / vbW) * w;
    y = py + (made.seat.y / vbH) * h;
    perchHtml = `<div class="perch" style="left:${px}%;top:${py}%;width:${w}%">${made.svg}</div>`;
  }
  const [bx, by] = BASE[view];
  const mirror = view === 'side' && pose.facing === 'right' ? ' scaleX(-1)' : '';
  const rot = view === 'top' ? pose.turn ?? 0 : pose.lean ?? 0;
  // CSS applies right to left: rotate first (a left-facing duck tips its beak up with a clockwise turn), then mirror.
  const transform = `${mirror} rotate(${rot}deg)`.trim();
  const duck = renderDuck(view, { idPrefix: `${idPrefix}-d`, decorative: true });
  const shadow = view === 'top' ? '' : '<span class="duck-contact" aria-hidden="true"></span>';
  return `${perchHtml}<div class="duck-pose duck-${view}" aria-hidden="true"
      style="left:${x}%;top:${y}%;width:${pose.size}%;transform:translate(${-bx * 100}%, ${-by * 100}%)">
      ${shadow}<div class="duck-body" style="transform-origin:${bx * 100}% ${by * 100}%;transform:${transform}">${duck}</div></div>`;
}
