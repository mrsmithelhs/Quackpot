// Small shared SVG/text helpers for the apartment art kit. Pure functions; no DOM, no state.

/** Inner markup of a standalone `<svg ...>...</svg>` string (identical to the original preview helper). */
export const inner = svg => svg.match(/^<svg[^>]*>([\s\S]*)<\/svg>$/)[1];

// XML 1.0 forbids these code points even when escaped.
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

/** Escape text for element content or a double- or single-quoted attribute value. */
export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

/** Validate caller-supplied display text: a string within `max` characters containing no invalid XML characters. */
export function checkText(value, label, max) {
  if (typeof value !== 'string') throw new TypeError(`${label} must be a string`);
  if (value.length > max) throw new RangeError(`${label} is longer than ${max} characters`);
  if (INVALID_XML_CHARS.test(value)) throw new RangeError(`${label} contains characters that are not valid in XML`);
  return value;
}
