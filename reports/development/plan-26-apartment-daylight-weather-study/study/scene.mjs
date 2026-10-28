// Plan 26 study wrapper around the pinned, read-only Plan 24 kit.
//   renderStudyScene(options) -> { svg, meta, lighting, study }
// With no effect requested (daylight 'off', weather 'clear') `svg` is EXACTLY the kit's output. With daylight 'sun' or still weather
// (living room only) layer blocks are inserted at verified anchors; removing them (anchors.stripInserted) returns the kit's output for the
// effective kit options unchanged. Still images only: no animation, flash or timing anywhere.
import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { resolveStudyOptions } from './options.mjs';
import { insertAt } from './anchors.mjs';
import { floorLayer, windowGlassLayer, windowItemMarkup, tablePlaneLayer, tableObjectsLayer, atmosphereLayer, SUN } from './daylight.mjs';
import { windowWeatherLayer, floorWeatherLayer, atmosphereWeatherLayer } from './weather.mjs';

const STUDY_KEYS = ['daylight', 'weather', 'strength'];
// In Node the delivered kit must equal the pin before anything renders; the browser gallery cannot read files and relies on tools/check.mjs.
if (typeof process !== 'undefined' && process.versions?.node) (await import('./pin.mjs')).assertPinnedKit();

const RUG = /<polygon points="[^"]*" fill="#b8836a" stroke="#9a6a52" stroke-width="4"\/>/;
const TABLE_TOP = /<polygon points="[^"]*" fill="#86664d" stroke="#3a2c26" stroke-width="2" stroke-linejoin="round"\/>/;
const BEFORE_FIRST_GLOW = /<\/svg>(?=<g class="o lamp-on lamp-pool" )/;   // the duck's closing tag, directly followed by the first lamp glow
const duckShadowAnchor = prefix => new RegExp(`<ellipse [^>]*fill="url\\(#${prefix}-g-soft\\)"/><svg x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" viewBox="0 0 360 270" overflow="visible" role="img"`);

export function renderStudyScene(options = {}) {
  const kitOptions = Object.fromEntries(Object.entries(options).filter(([k]) => !STUDY_KEYS.includes(k)));
  const resolved = resolveStudyOptions({ daylight: options.daylight, weather: options.weather, light: kitOptions.light ?? 'neutral', strength: options.strength, overlay: kitOptions.overlay });
  const eff = resolved.effective;
  if (!resolved.noEffect && (kitOptions.area ?? 'living') !== 'living') throw new RangeError(`Plan 26 daylight and weather are living-room only in this study (area '${String(kitOptions.area)}')`);
  const kit = renderScene({ ...kitOptions, light: eff.kitLight, ...(eff.overlay ? { overlay: eff.overlay } : {}) });
  const study = { requested: resolved.requested, effective: eff, notes: resolved.notes, inserted: [], approximations: [], sun: null };
  if (resolved.noEffect) return { ...kit, study };

  const prefix = kitOptions.idPrefix, id = `${prefix}-p26`, furnishings = kit.meta.furnishings;
  let svg = kit.svg;
  if (eff.sun) {
    const strength = eff.strength;
    svg = insertAt(svg, { name: 'sun-floor', anchor: RUG, where: 'after' }, floorLayer({ id, furnishings, strength }));
    svg = insertAt(svg, { name: 'sun-window-glass', anchor: windowItemMarkup(), where: 'after' }, windowGlassLayer({ strength }));
    svg = insertAt(svg, { name: 'sun-table-plane', anchor: TABLE_TOP, where: 'after' }, tablePlaneLayer({ id, strength }));
    svg = insertAt(svg, { name: 'sun-table-objects', anchor: duckShadowAnchor(prefix), where: 'before' }, tableObjectsLayer({ id, strength }));
    svg = insertAt(svg, { name: 'sun-atmosphere', anchor: BEFORE_FIRST_GLOW, where: 'after' }, atmosphereLayer({ id, strength }));
    study.inserted = ['sun-floor', 'sun-window-glass', 'sun-table-plane', 'sun-table-objects', 'sun-atmosphere'];
    study.sun = { ...SUN, strength };
    study.approximations = ['one low sun direction/elevation for the room', 'window projected to the table plane (and floor when in frame)', 'item shadows are strips/tapers/capsules, not silhouettes', 'floor shadows drawn broadly, not clipped to the beam', 'global multiply shade tint'];
  } else {
    const weather = eff.weather;
    svg = insertAt(svg, { name: 'wx-floor', anchor: RUG, where: 'after' }, floorWeatherLayer({ id, furnishings, weather }));
    svg = insertAt(svg, { name: 'wx-window', anchor: windowItemMarkup(), where: 'after' }, windowWeatherLayer({ id, weather }));
    svg = insertAt(svg, { name: 'wx-atmosphere', anchor: BEFORE_FIRST_GLOW, where: 'after' }, atmosphereWeatherLayer({ id, weather, lamp: eff.lamp }));
    study.inserted = ['wx-floor', 'wx-window', 'wx-atmosphere'];
    study.approximations = ['flat gradient sky with ellipse clouds', 'seeded static streaks and droplets clipped to the panes', 'soft non-directional shadows', 'global multiply tint and vignette', ...(eff.lamp ? ['restrained warm spill follows the kit lamp (shade opening, down cone, up spill); the duck gets no added light'] : [])];
  }
  return { ...kit, svg, study };
}
