// Plan 26 study options and the requested -> effective precedence (see mechanism.md for the table).
// Stage 2: daylight off|sun over the kit's neutral or legacy window light. Stage 3: still weather overcast|rain|storm and ONE named
// lamp pairing (storm + warm lamp). Weather is still-image only: there is no timing, flash or animation option anywhere.

export const DAYLIGHT = ['off', 'sun'];
export const WEATHER = ['clear', 'overcast', 'rain', 'storm'];
export const STRENGTHS = ['restrained', 'strong'];
export const KIT_LIGHTS = ['neutral', 'window', 'warm'];
export const KIT_OVERLAYS = ['svg', 'none'];

/**
 * @returns {{requested, effective, notes: string[], noEffect: boolean}}
 * Rules, in order:
 *  R1  weather other than 'clear' suppresses direct sun (no sun band, no directional shadows): effective sun = false.
 *  R2  effective sun, and any weather, supersede the legacy window wash: requested light 'window' becomes effective kit light 'neutral'.
 *  R3  the warm lamp ('warm') is independent of the sky in principle, but only the named storm pairing is built:
 *      storm + lamp is accepted; lamp with sun, overcast or rain is rejected (RangeError). Lamp with a clear sky and no study effect is the
 *      kit's own warm light, passed through unchanged.
 *  R4  (storm + lamp only) the kit's warm full-room overlay is a dark vignette anchored to the lamp that would leave the duck in deep
 *      shade, so the effective overlay is 'none'; the lamp's own glow layers stay on and the storm tint supplies the darkness.
 */
export function resolveStudyOptions({ daylight = 'off', weather = 'clear', light = 'neutral', strength = 'strong', overlay } = {}) {
  const check = (name, v, list) => { if (!list.includes(v)) throw new RangeError(`Unknown ${name}: ${String(v)} (expected ${list.join(' | ')})`); };
  check('daylight', daylight, DAYLIGHT); check('weather', weather, WEATHER); check('light', light, KIT_LIGHTS); check('strength', strength, STRENGTHS);
  if (overlay !== undefined) check('overlay', overlay, KIT_OVERLAYS);
  const requested = { daylight, weather, light, strength, overlay: overlay ?? null };
  const notes = [];
  const sun = daylight === 'sun' && weather === 'clear';
  if (daylight === 'sun' && weather !== 'clear') notes.push(`R1: weather '${weather}' suppresses direct sun (requested daylight 'sun' is not effective)`);
  let kitLight = light, kitOverlay = overlay ?? null;
  if (light === 'window' && (sun || weather !== 'clear')) { kitLight = 'neutral'; notes.push(`R2: legacy window wash suppressed by ${sun ? 'sun' : `weather '${weather}'`}; kit light is 'neutral'`); }
  const lamp = light === 'warm';
  if (lamp && (sun || weather !== 'clear') && weather !== 'storm') throw new RangeError(`R3: warm lamp with ${sun ? 'sun' : `'${weather}'`} is not in the named set (only storm + lamp is built)`);
  if (lamp && weather === 'storm') { if (kitOverlay !== 'none') notes.push(`R4: kit warm overlay omitted (effective overlay 'none')${overlay === 'svg' ? ', overriding the requested \'svg\'' : ''}: the storm tint supplies the darkness and the lamp's glow layers stay on`); kitOverlay = 'none'; }
  const effective = { sun, weather, kitLight, overlay: kitOverlay, lamp, strength: sun ? strength : null };
  return { requested, effective, notes, noEffect: !sun && weather === 'clear' };
}
