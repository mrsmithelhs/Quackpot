// Weather-only deterministic wrapper over the immutable Plan 24 apartment kit.
import { renderScene } from '../apartment/index.mjs';
import { ROOM_SPECS } from '../apartment/rooms/specs.mjs';
import { put } from '../apartment/rooms/camera.mjs';
import { windowMm } from '../apartment/props/index.mjs';
import { atmosphereWeatherLayer, floorWeatherLayer, windowWeatherLayer, WEATHER_LOOK } from './weather-art.mjs';

export const WEATHER_LAYER_VERSION = 1;
const RUG = /<polygon points="[^"]*" fill="#b8836a" stroke="#9a6a52" stroke-width="4"\/>/;
const BEFORE_FIRST_GLOW = /<\/svg>(?=<g class="o lamp-on lamp-pool" )/;
const WINDOW_ITEM = put(ROOM_SPECS.living, -150, 4000, 750, windowMm(900, 800));

function matches(svg, anchor) {
  if (typeof anchor === 'string') {
    const found = []; let index = svg.indexOf(anchor);
    while (index !== -1) { found.push({ index, 0: anchor }); index = svg.indexOf(anchor, index + anchor.length); }
    return found;
  }
  return [...svg.matchAll(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : `${anchor.flags}g`))];
}
function insert(svg, name, anchor, where, content) {
  const found = matches(svg, anchor);
  if (found.length !== 1) throw new Error(`anchor '${name}' matched ${found.length} times (expected exactly 1)`);
  const at = where === 'after' ? found[0].index + found[0][0].length : found[0].index;
  return `${svg.slice(0, at)}<!--weather:begin ${name}-->${content}<!--weather:end ${name}-->${svg.slice(at)}`;
}

/** Render weather over a production apartment kit scene. Unsupported requests preserve the exact plain kit SVG. */
export function buildWeatherLayers(options = {}) {
  const { weather = 'clear', ...kitOptions } = options;
  const requested = { weather, area: kitOptions.area ?? 'living' };
  const plain = renderScene(kitOptions);
  const fallback = (reason, details = {}) => ({ ...plain, svg: plain.svg, diagnostic: { code: reason, requested, effective: { weather: 'clear', area: plain.meta.area, ...details } }, weatherVersion: WEATHER_LAYER_VERSION });
  if (!['clear', 'overcast', 'rain', 'storm'].includes(weather)) return fallback('unsupported-weather');
  if (weather === 'clear') return { ...plain, diagnostic: null, weatherVersion: WEATHER_LAYER_VERSION, weather: { requested, effective: { weather, area: plain.meta.area } } };
  if (plain.meta.area !== 'living') return fallback('unsupported-area');

  const light = kitOptions.light ?? 'neutral';
  if (light === 'warm' && weather !== 'storm') return fallback('unsupported-light-pairing', { requestedLight: light });
  const effectiveLight = light === 'window' ? 'neutral' : light;
  const effectiveOverlay = light === 'warm' ? 'none' : kitOptions.overlay;
  const scene = renderScene({ ...kitOptions, light: effectiveLight, ...(effectiveOverlay === undefined ? {} : { overlay: effectiveOverlay }) });
  const id = `${kitOptions.idPrefix}-weather`, furnishings = scene.meta.furnishings;
  try {
    let svg = scene.svg;
    svg = insert(svg, 'floor', RUG, 'after', floorWeatherLayer({ id, furnishings, weather }));
    svg = insert(svg, 'window', WINDOW_ITEM, 'after', windowWeatherLayer({ id, weather }));
    svg = insert(svg, 'atmosphere', BEFORE_FIRST_GLOW, 'after', atmosphereWeatherLayer({ id, weather, lamp: light === 'warm' }));
    svg = svg.replaceAll('data-p26=', 'data-weather=');
    return { ...scene, svg, diagnostic: null, weatherVersion: WEATHER_LAYER_VERSION, weather: { requested, effective: { weather, area: 'living', light: effectiveLight, overlay: effectiveOverlay ?? 'svg' } } };
  } catch (error) {
    return fallback('anchor-mismatch', { error: String(error?.message ?? error) });
  }
}

export { WEATHER_LOOK };
