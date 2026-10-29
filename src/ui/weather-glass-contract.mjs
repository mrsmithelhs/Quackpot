// Shared validation for the clipped pane structure consumed by rain motion and lightning.
const role = (root, name) => {
  const nodes = root?.querySelectorAll?.(`[data-weather="${name}"]`) || [];
  return nodes.length === 1 ? nodes[0] : null;
};
const tag = node => String(node?.tagName || '').toLowerCase();

export function validateWeatherGlass(root, { requireRain = false } = {}) {
  const sky = role(root, 'sky');
  if (!sky || tag(sky) !== 'rect') return { valid: false, reason: 'no-glass' };
  const paneGroup = sky.parentNode;
  if (!paneGroup || tag(paneGroup) !== 'g') return { valid: false, reason: 'no-glass' };
  const clip = /^\s*url\(\s*#([^)\s]+)\s*\)\s*$/.exec(paneGroup.getAttribute?.('clip-path') || '');
  if (!clip) return { valid: false, reason: 'no-glass' };
  const references = [...(root.querySelectorAll?.('[id]') || [])].filter(node => node.getAttribute('id') === clip[1]);
  if (references.length !== 1 || tag(references[0]) !== 'clippath') return { valid: false, reason: 'no-glass' };

  let rainStreaks = null, droplets = null;
  if (requireRain) {
    rainStreaks = role(root, 'rain-streaks');
    droplets = role(root, 'droplets');
    if (!rainStreaks || !droplets || tag(rainStreaks) !== 'g' || tag(droplets) !== 'g' || rainStreaks.parentNode !== paneGroup || droplets.parentNode !== paneGroup) {
      return { valid: false, reason: 'no-glass' };
    }
  }
  return { valid: true, sky, paneGroup, clipPath: references[0], rainStreaks, droplets };
}
