// Plan 26 study wrapper around the pinned, read-only Plan 24 kit.
//   renderStudyScene(options) -> { svg, meta, lighting, study }
// With no effect requested (daylight 'off', weather 'clear') `svg` is EXACTLY the kit's output. With daylight 'sun' (living room only)
// three layer blocks are inserted at verified anchors; removing them (anchors.stripInserted) returns the kit output unchanged.
import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { resolveStudyOptions } from './options.mjs';
import { insertAt } from './anchors.mjs';
import { floorLayer, tableLayer, atmosphereLayer, SUN } from './daylight.mjs';

const STUDY_KEYS = ['daylight', 'weather', 'strength'];
// In Node the delivered kit must equal the pin before anything renders; the browser gallery cannot read files and relies on tools/check.mjs.
if (typeof process !== 'undefined' && process.versions?.node) (await import('./pin.mjs')).assertPinnedKit();

export function renderStudyScene(options = {}) {
  const kitOptions = Object.fromEntries(Object.entries(options).filter(([k]) => !STUDY_KEYS.includes(k)));
  const resolved = resolveStudyOptions({ daylight: options.daylight, weather: options.weather, light: kitOptions.light ?? 'neutral', strength: options.strength });
  if (!resolved.noEffect && (kitOptions.area ?? 'living') !== 'living') throw new RangeError(`Plan 26 daylight is living-room only in this study (area '${String(kitOptions.area)}')`);
  const kit = renderScene({ ...kitOptions, light: resolved.effective.kitLight });
  const study = { requested: resolved.requested, effective: resolved.effective, notes: resolved.notes, inserted: [], approximations: [], sun: null };
  if (resolved.noEffect) return { ...kit, study };

  const prefix = kitOptions.idPrefix, id = `${prefix}-p26`, strength = resolved.effective.strength, furnishings = kit.meta.furnishings;
  let svg = kit.svg;
  // 1. after the rug, under every item: sun patch + item shadows
  svg = insertAt(svg, { name: 'sun-floor', anchor: /<polygon points="[^"]*" fill="#b8836a" stroke="#9a6a52" stroke-width="4"\/>/, where: 'after' }, floorLayer({ id, furnishings, strength }));
  // 2. before the duck's contact shadow: table-top shadows of the duck and mug (the duck markup itself is untouched)
  svg = insertAt(svg, { name: 'sun-table', anchor: new RegExp(`<ellipse [^>]*fill="url\\(#${prefix}-g-soft\\)"/><svg x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" viewBox="0 0 360 270" overflow="visible" role="img"`), where: 'before' }, tableLayer({ id, strength }));
  // 3. above furniture and duck, below the first lamp glow: shade tint, bloom, white-out panes
  svg = insertAt(svg, { name: 'sun-atmosphere', anchor: /<\/svg>(?=<g class="o lamp-on lamp-pool" )/, where: 'after' }, atmosphereLayer({ id, strength }));
  study.inserted = ['sun-floor', 'sun-table', 'sun-atmosphere'];
  study.sun = { ...SUN, strength };
  study.approximations = ['one sun direction/elevation for the room', 'window projected to the floor plane only', 'item shadows are strips/tapers, not silhouettes', 'shadows are not clipped to the beam', 'global multiply shade tint'];
  return { ...kit, svg, study };
}
