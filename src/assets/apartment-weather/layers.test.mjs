import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeatherLayers } from './layers.mjs';
import { renderScene } from '../apartment/index.mjs';
import { ROOM_SPECS } from '../apartment/rooms/specs.mjs';

const stripWeather = svg => svg.replace(/<!--weather:begin [\w-]+-->[\s\S]*?<!--weather:end [\w-]+-->/g, '');
const scene = (idPrefix, options = {}) => renderScene({ area: 'living', idPrefix, ...options });

test('clear weather returns exact kit markup and never inserts weather roles', () => {
  const kit = scene('wx-clear'), got = buildWeatherLayers({ area: 'living', idPrefix: 'wx-clear', weather: 'clear' });
  assert.equal(got.svg, kit.svg);
  assert.equal(got.diagnostic, null);
  assert.equal(got.weatherVersion, 1);
  assert.doesNotMatch(got.svg, /data-weather=/);
});

test('weather roles, pane clip, instance ids, and layer order are stable against the real kit', () => {
  const a = buildWeatherLayers({ area: 'living', idPrefix: 'wx-a', weather: 'storm', light: 'warm' });
  const b = buildWeatherLayers({ area: 'living', idPrefix: 'wx-b', weather: 'storm', light: 'warm' });
  for (const result of [a, b]) {
    assert.equal(result.diagnostic, null);
    for (const role of ['ambient-shadows', 'sky', 'clouds', 'rain-streaks', 'droplets', 'weather-tint', 'weather-vignette', 'window-spill', 'lamp-spill']) assert.match(result.svg, new RegExp(`data-weather="${role}"`));
    assert.match(result.svg, /clip-path="url\(#wx-[ab]-weather-panes\)"/);
    assert.ok(result.svg.indexOf('data-weather="ambient-shadows"') < result.svg.indexOf('data-weather="sky"'));
    assert.ok(result.svg.indexOf('data-weather="window-spill"') < result.svg.indexOf('class="o lamp-on lamp-pool"'));
    assert.equal(stripWeather(result.svg), renderScene({ area: 'living', idPrefix: result === a ? 'wx-a' : 'wx-b', light: 'warm', overlay: 'none' }).svg);
  }
  assert.notEqual(a.svg.match(/id="([^"]+-weather-[^"]+)"/)?.[1], b.svg.match(/id="([^"]+-weather-[^"]+)"/)?.[1]);
});

test('unsupported weather and non-living area return the unchanged plain kit with requested/effective diagnostics', () => {
  const unknown = buildWeatherLayers({ area: 'living', idPrefix: 'wx-u', weather: 'snow' });
  assert.equal(unknown.svg, scene('wx-u').svg);
  assert.deepEqual(unknown.diagnostic, { code: 'unsupported-weather', requested: { weather: 'snow', area: 'living' }, effective: { weather: 'clear', area: 'living' } });
  const area = buildWeatherLayers({ area: 'kitchen', idPrefix: 'wx-k', weather: 'rain' });
  assert.equal(area.svg, scene('wx-k', { area: 'kitchen' }).svg);
  assert.equal(area.diagnostic.code, 'unsupported-area');
  assert.deepEqual(area.diagnostic.requested, { weather: 'rain', area: 'kitchen' });
  assert.deepEqual(area.diagnostic.effective, { weather: 'clear', area: 'kitchen' });
});

test('weather-only options do not leak into the kit and duck/lamp source subtrees are preserved', () => {
  const base = scene('wx-d', { light: 'neutral', overlay: 'none' }).svg;
  const result = buildWeatherLayers({ area: 'living', idPrefix: 'wx-d', weather: 'rain', light: 'neutral', overlay: 'none' });
  assert.equal(stripWeather(result.svg), base);
  const duck = svg => svg.match(/<svg x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*" viewBox="0 0 360 270"[\s\S]*?<\/svg>/)?.[0];
  assert.equal(duck(result.svg), duck(base));
  assert.ok(result.svg.includes('<g class="o lamp-on lamp-pool"'));
});

test('a missing later anchor discards earlier staged layers and returns the exact plain kit scene', () => {
  const originalItems = ROOM_SPECS.living.items;
  try {
    ROOM_SPECS.living.items = () => [];
    const kit = renderScene({ area: 'living', idPrefix: 'wx-atomic' });
    const result = buildWeatherLayers({ area: 'living', idPrefix: 'wx-atomic', weather: 'storm' });
    assert.equal(result.svg, kit.svg);
    assert.equal(result.diagnostic.code, 'anchor-mismatch');
    assert.equal(result.diagnostic.effective.weather, 'clear'); assert.match(result.diagnostic.effective.error, /window/);
    assert.doesNotMatch(result.svg, /<!--weather:begin/);
  } finally {
    ROOM_SPECS.living.items = originalItems;
  }
});
