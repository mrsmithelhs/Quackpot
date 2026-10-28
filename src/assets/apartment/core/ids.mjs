// Instance-ID scoping. Builders keep fixed local ids; one final pass makes every id and reference in a finished
// SVG string unique to the caller's prefix. Pure and deterministic: there is no hidden counter.

export const ID_PREFIX_PATTERN = /^[a-z][a-z0-9-]{0,23}$/;

export function assertIdPrefix(prefix) {
  if (typeof prefix !== 'string') throw new TypeError('idPrefix is required and must be a string');
  if (!ID_PREFIX_PATTERN.test(prefix)) throw new RangeError('idPrefix must match /^[a-z][a-z0-9-]{0,23}$/');
  return prefix;
}

/** Rewrite every id declaration and every url(#id) / href="#id" reference to `${prefix}-${id}`. */
export function scopeIds(svg, prefix) {
  assertIdPrefix(prefix);
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`)
    .replace(/\bhref="#([^"]+)"/g, (_, id) => `href="#${prefix}-${id}"`);
}
