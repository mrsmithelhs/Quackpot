import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderStudyScene } from '../../study/scene.mjs';

const fp = JSON.parse(readFileSync(new URL('../still-fingerprint.json', import.meta.url), 'utf8'));
const ANIMATION = /<animate|<set\b|@keyframes|animation\s*:|transition\s*:|requestAnimationFrame|setTimeout|setInterval|\.animate\(/;

test('approved still weather SVG output is byte-identical to the recorded fingerprints (no controller = the approved still)', () => {
  const cells = { overcast: { weather: 'overcast' }, rain: { weather: 'rain' }, storm: { weather: 'storm' }, stormlamp: { weather: 'storm', light: 'warm' } };
  let n = 0;
  for (const [k, o] of Object.entries(cells)) for (const fr of ['wide', 'medium']) {
    const svg = renderStudyScene({ area: 'living', idPrefix: 'fp', framing: fr, ...o }).svg;
    assert.equal(createHash('sha256').update(svg).digest('hex'), fp[`${k}/${fr}`], `${k}/${fr}`);
    assert.ok(!ANIMATION.test(svg), `${k}/${fr} contains an animation construct`); n++;
  }
  assert.equal(n, 8);
});

test('still SVG carries the roles the controller addresses, once each', () => {
  for (const w of ['rain', 'storm']) {
    const svg = renderStudyScene({ area: 'living', idPrefix: 'fp', weather: w }).svg;
    for (const role of ['rain-streaks', 'droplets']) assert.equal(svg.split(`data-p26="${role}"`).length - 1, 1, `${w}/${role}`);
  }
  assert.ok(!renderStudyScene({ area: 'living', idPrefix: 'fp', weather: 'overcast' }).svg.includes('data-p26="rain-streaks"'));
});

test('protected sources are unmodified in the working tree (kit, study wrapper, still gallery, pinned kit)', () => {
  const root = fileURLToPath(new URL('../../../../', import.meta.url));
  const paths = ['src/assets/apartment', 'reports/development/plan-26-apartment-daylight-weather-study/study', 'reports/development/plan-26-apartment-daylight-weather-study/gallery.html', 'reports/development/plan-26-apartment-daylight-weather-study/gallery.js', 'reports/development/plan-26-apartment-daylight-weather-study/pinned-kit.json'];
  const out = execFileSync('git', ['status', '--porcelain', '--', ...paths], { cwd: root, encoding: 'utf8' });
  assert.equal(out.trim(), '', `modified protected paths:\n${out}`);
});
