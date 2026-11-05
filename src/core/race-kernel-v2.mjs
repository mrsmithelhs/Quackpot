// Plan 59 unmounted kernel foundation. Experimental native-float policy only;
// this module does not yet resolve a race and must not be mounted in the game.
import { createRng } from './prng.mjs';

export const NUMERIC_POLICY = 'native-float-experimental/v1';
export const KEY_POLICY = 'utf8-length-cyrb128-sfc32/v1';

const encoder = new TextEncoder();
const MAX_COMPONENT_BYTES = 1024;

/** Code-unit ordering is independent of host locale. */
export function compareIds(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') throw new TypeError('IDs must be strings');
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Prefix UTF-8 byte lengths and hex encode bytes before seeding the existing PRNG. */
export function encodeKey(parts) {
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > 16) throw new RangeError('invalid key component count');
  return parts.map((part) => {
    if (typeof part !== 'string' || !part || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(part)) throw new TypeError('invalid key component');
    const bytes = encoder.encode(part);
    if (bytes.length > MAX_COMPONENT_BYTES) throw new RangeError('key component too long');
    return `${bytes.length}:${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }).join('');
}

export function keyedDraw(seed, raceId, domain, components) {
  if (!Array.isArray(components)) throw new TypeError('components must be an array');
  const key = encodeKey([KEY_POLICY, seed, raceId, domain, ...components]);
  return { key, value: createRng(key).next() };
}

/** Rating penalty is applied before the Plan 23 affine conversion. */
export function effectiveRaceRating({ baseRating, restFactor, downFactor, injured }) {
  if (![baseRating, restFactor, downFactor].every(Number.isFinite)
    || baseRating <= 0 || baseRating > 100 || restFactor <= 0 || restFactor > 1
    || downFactor <= 0 || downFactor > 2 || typeof injured !== 'boolean') throw new RangeError('invalid rating inputs');
  const rating = baseRating * restFactor * downFactor * (injured ? 0.9 : 1);
  return { rating, affineSpeed: 8.25 + 0.5 * rating };
}
