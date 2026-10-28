// Plan 26 study options and the requested -> effective precedence (see mechanism.md for the table).
// Stage 2 (this file's implemented range): daylight off|sun over the kit's neutral or legacy window light, weather 'clear' only.
// Weather stills (overcast|rain|storm) are Stage 3: their precedence is defined here so it is reviewed now, but they are rejected.

export const DAYLIGHT = ['off', 'sun'];
export const WEATHER = ['clear', 'overcast', 'rain', 'storm'];
export const STRENGTHS = ['restrained', 'strong'];
export const KIT_LIGHTS = ['neutral', 'window', 'warm'];

/**
 * @returns {{requested, effective, notes: string[], noEffect: boolean}}
 * Rules, in order:
 *  R1  weather other than 'clear' suppresses direct sun (no sun patch, no directional shadows): effective sun = false.
 *  R2  effective sun supersedes the legacy window wash: requested light 'window' becomes effective kit light 'neutral'.
 *      Weather (R1) also owns window light, so the legacy wash is suppressed there as well.
 *  R3  the warm lamp ('warm') is independent of sky, but its pairing with sun/weather is a Stage 3 comparison:
 *      lamp + sun is rejected now; lamp + weather is rejected until Stage 3.
 *  R4  weather other than 'clear' is rejected in Stage 2 (RangeError) after R1-R3 are evaluated, so the precedence is testable.
 */
export function resolveStudyOptions({ daylight = 'off', weather = 'clear', light = 'neutral', strength = 'strong' } = {}) {
  const check = (name, v, list) => { if (!list.includes(v)) throw new RangeError(`Unknown ${name}: ${String(v)} (expected ${list.join(' | ')})`); };
  check('daylight', daylight, DAYLIGHT); check('weather', weather, WEATHER); check('light', light, KIT_LIGHTS); check('strength', strength, STRENGTHS);
  const requested = { daylight, weather, light, strength };
  const notes = [];
  const sun = daylight === 'sun' && weather === 'clear';
  if (daylight === 'sun' && weather !== 'clear') notes.push(`R1: weather '${weather}' suppresses direct sun (requested daylight 'sun' is not effective)`);
  let kitLight = light;
  if (light === 'window' && (sun || weather !== 'clear')) { kitLight = 'neutral'; notes.push(`R2: legacy window wash suppressed by ${sun ? 'sun' : `weather '${weather}'`}; kit light is 'neutral'`); }
  if (light === 'warm' && sun) throw new RangeError("R3: warm lamp with sun is a Stage 3 pairing and is not available in the daylight stage");
  if (weather !== 'clear') throw new RangeError(`R4: weather '${weather}' stills are Stage 3 and not implemented in this stage`);
  const effective = { sun, weather, kitLight, strength: sun ? strength : null };
  return { requested, effective, notes, noEffect: !sun };
}
