// Report-only composition. This is not a production integration seam.
import { renderScene } from '../../../src/assets/apartment/index.mjs';
import { ROOM_SPECS } from '../../../src/assets/apartment/rooms/specs.mjs';
import { F } from '../../../src/assets/apartment/core/constants.mjs';

// Shift the shelf and its supported contents left by 160 scene units. Replace
// the shared spec only during this synchronous preview render, restoring it even
// if the renderer throws. Future integration needs a pure composition input.
export function bedroomStudyScene(idPrefix = 'p49-bedroom') {
  const original = ROOM_SPECS.bedroom;
  const move = (x, z) => x - 160 * z / F;
  ROOM_SPECS.bedroom = {
    ...original,
    anchor: { ...original.anchor, X: move(original.anchor.X, original.anchor.z) },
    items: furnishings => original.items(furnishings).map(item => item.z === 1500 && item.X === -250 ? { ...item, X: move(item.X, item.z) } : item),
    onTable: original.onTable.map(item => ({ ...item, X: move(item.X, item.z) })),
    surfaces: original.surfaces.map(surface => ({ ...surface, X: move(surface.X, (surface.zf + surface.zb) / 2) })),
  };
  try { return renderScene({ area: 'bedroom', light: 'warm', idPrefix, duckView: 'side' }); }
  finally { ROOM_SPECS.bedroom = original; }
}
