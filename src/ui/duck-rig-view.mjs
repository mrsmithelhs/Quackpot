import { composeDuckSvg } from '../core/duck-rig.mjs';

const SAFE_PREFIX = /^[a-zA-Z0-9_-]+$/;

export function createDigitalDuckSvg({ prefix, label, palette = 'classic-yellow' }) {
  if (!SAFE_PREFIX.test(prefix || '')) {
    throw new Error('A unique, SVG-safe duck prefix is required.');
  }
  const markup = composeDuckSvg({
    prefix,
    palette,
    paperMode: 'hybrid',
    hat: 'none',
    accessory: 'none',
  });
  const accessibleName = String(label || 'Digital gacha duck')
    .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return markup.replace(/aria-label="[^"]*"/, `aria-label="${accessibleName}"`);
}
