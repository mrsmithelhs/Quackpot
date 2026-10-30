import { renderScene } from '../../assets/apartment/index.mjs';

export const breakfastFraming = (day) => day === 1 ? 'wide' : 'medium';
const boxOf = (framing) => renderScene({ area: 'kitchen', framing, duck: false, idPrefix: `life-frame-${framing}` })
  .svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const medium = boxOf('medium');
const wide = boxOf('wide');

// Selected objects were placed in the medium composition. Keep the same physical position in Day 1's wide shot.
export function breakfastObjectBox(day, box) {
  if (breakfastFraming(day) === 'medium') return { ...box };
  const [mx, my, mw, mh] = medium;
  const [wx, wy, ww, wh] = wide;
  return { ...box, x: (mx + box.x / 100 * mw - wx) / ww * 100,
    y: (my + box.y / 100 * mh - wy) / wh * 100, w: box.w * mw / ww };
}
