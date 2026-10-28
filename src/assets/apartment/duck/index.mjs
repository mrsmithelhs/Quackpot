// Physical rubber-duck representations (six): the five authored views plus the overhead drawing.
// The duck is an inanimate prop: these are static drawings only.
import { views } from './views.mjs';
import { topDuckInner } from './overhead.mjs';
import { inner } from '../core/svg.mjs';

export const DUCK_VIEW_KEYS = ['front', 'side', 'rear', 'high', 'low', 'top'];
/** Views a horizontal scene camera (rooms, desk side view) can show. */
export const HORIZONTAL_DUCK_VIEWS = ['front', 'side', 'rear'];
export const DUCK_LABELS = { front: views.front.label, side: views.side.label, rear: views.rear.label, high: views.high.label, low: views.low.label, top: 'Overhead' };
const TOP_LABEL = 'Overhead static rubber duck seen from directly above';

export function assertDuckView(view) {
  if (!DUCK_VIEW_KEYS.includes(view)) throw new RangeError(`unknown duck view "${view}"; expected one of ${DUCK_VIEW_KEYS.join(', ')}`);
  return view;
}

/** Standalone 360x270 `<svg>` for a duck view. The overhead view wraps the same drawing used by the top-down desk. */
export function duckSvg(view) {
  assertDuckView(view);
  if (view !== 'top') return views[view].svg;
  return `<svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${TOP_LABEL}">${topDuckInner()}</svg>`;
}

/** Inner markup (no outer svg) of a horizontal-camera duck view, ready to embed in a scene. */
export function duckInnerMarkup(view) {
  if (!HORIZONTAL_DUCK_VIEWS.includes(view)) throw new RangeError(`"${view}" cannot be embedded in a horizontal scene; resolve it first`);
  return inner(views[view].svg);
}

/**
 * Which duck a scene camera can actually show. `camera` is 'horizontal' (rooms, desk side view) or
 * 'overhead' (top-down desk). A mismatch is reported, never hidden behind the requested label.
 */
export function resolveDuckView(requested, camera) {
  assertDuckView(requested);
  if (camera === 'overhead') {
    return requested === 'top' ? { view: 'top', fallback: null }
      : { view: 'top', fallback: { from: requested, to: 'top', reason: 'the top-down desk camera always shows the overhead duck' } };
  }
  if (camera !== 'horizontal') throw new RangeError(`unknown camera "${camera}"`);
  return HORIZONTAL_DUCK_VIEWS.includes(requested) ? { view: requested, fallback: null }
    : { view: 'side', fallback: { from: requested, to: 'side', reason: `a horizontal scene camera cannot show the ${requested} duck view; the side view is shown` } };
}
