// Palette entries used by the digital rig are six-digit hex colors.
export function blendWhite(base, amount) {
  const match = /^#([0-9a-f]{6})$/i.exec(base.trim());
  if (!match) return base;
  const weight = Number.isFinite(amount) ? Math.max(0, Math.min(1, amount)) : 0;
  const channels = [0, 2, 4].map(index => parseInt(match[1].slice(index, index + 2), 16));
  return `rgb(${channels.map(channel => Math.round(channel + (255 - channel) * weight)).join(', ')})`;
}
