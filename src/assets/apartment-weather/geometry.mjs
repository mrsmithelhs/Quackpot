// Minimal living-room geometry shared by the unmounted weather still and motion helpers.
import { ROOM_SPECS } from '../apartment/rooms/specs.mjs';
import { proj } from '../apartment/rooms/camera.mjs';

export const WINDOW = Object.freeze({ X: -150, z: 4000, Y: 750, w: 900, h: 800, frame: 30, midY: 1110 });
export const KEYED_ITEMS = Object.freeze({ sofa: { X: 1350, z: 3900 }, tv: { X: -1500, z: 3950 }, plant: { X: -700, z: 3700 }, lamp: { X: 480, z: 3500 } });
export const LIVING = ROOM_SPECS.living;

export function glassRects() {
  const { X, z, w, frame, midY } = WINDOW, gb = 780, gt = 1520;
  const x0 = X - w / 2 + frame, x1 = X + w / 2 - frame, m = 8;
  const cols = [[x0, X - m], [X + m, x1]], rows = [[gb, midY - m], [midY + m, gt]];
  return cols.flatMap(([a, b]) => rows.map(([lo, hi]) => {
    const tl = proj(LIVING, a, z, hi), br = proj(LIVING, b, z, lo);
    return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };
  }));
}
