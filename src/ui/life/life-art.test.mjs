// src/ui/life/life-art.test.mjs
// Tests for life-scene art: posed duck tilt and gaze rules, scoped and inert SVG, no external references.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as art from './life-art.mjs';

const { MIN_TILT, duckPoseHtml, headingToward, leanToward } = art;

test('duck heading points the overhead beak at the target; lean only with a wedge and never tiny', () => {
  assert.equal(headingToward({ x: 50, y: 50 }, { x: 10, y: 50 }), 0, 'native beak already points left');
  assert.equal(Math.abs(headingToward({ x: 50, y: 50 }, { x: 90, y: 50 })), 180);
  assert.ok(headingToward({ x: 50, y: 60 }, { x: 45, y: 10 }) > 45, 'target above turns the beak upward (clockwise from left)');
  assert.ok(leanToward({ x: 28, y: 77 }, { x: 71, y: 38 }, 25, 1) > 0, 'target above means look up');
  const level = duckPoseHtml({ view: 'side', facing: 'right', lean: 20, size: 10, x: 50, y: 70 }, 'tsa');
  assert.match(level, /rotate\(0deg\)/, 'no wedge: level');
  assert.doesNotMatch(level, /life-duck-wedge/);
  const tiny = duckPoseHtml({ view: 'side', lean: MIN_TILT - 1, wedge: 'paperback', size: 10, x: 50, y: 70 }, 'tsb');
  assert.match(tiny, /rotate\(0deg\)/, 'below MIN_TILT: level');
  const up = duckPoseHtml({ view: 'side', facing: 'right', lean: 20, wedge: 'paperback', size: 10, x: 50, y: 70 }, 'tsc');
  assert.match(up, /rotate\(20deg\)/);
  assert.match(up, /class="life-duck-wedge"/);
  assert.match(up, /scaleX\(-1\)/, 'facing right mirrors the group so the wedge stays under the chest');
  const top = duckPoseHtml({ view: 'top', turn: 41, size: 17, x: 49, y: 61 }, 'tsd');
  assert.match(top, /rotate\(41deg\)/);
});

test('sketch props and perches are standalone, scoped and inert', () => {
  const svgs = [
    art.tapedNotice({ idPrefix: 'ta', state: 'paid' }), art.emptyPlate({ idPrefix: 'tc' }),
    art.bakeryBag({ idPrefix: 'td' }), art.saleTag({ idPrefix: 'te' }), art.phoneGlow({ idPrefix: 'tf' }),
    art.wallShelf({ idPrefix: 'tg' }).svg, art.paperback({ idPrefix: 'tk' }), art.workKeysTray(),
  ];
  for (const svg of svgs) {
    assert.match(svg, /^<svg[^>]*viewBox="/);
    assert.match(svg, /aria-hidden="true"/);
    assert.doesNotMatch(svg, /<(script|image|foreignObject)\b/);
    for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) assert.match(id, /^t[a-k]-/, `id ${id} is prefixed`);
  }
  assert.throws(() => art.tapedNotice({ idPrefix: 'Bad Id' }), RangeError);
});

test('posed duck markup is classed life-, scoped by idPrefix, and rejects bad input with RangeError', () => {
  const html = duckPoseHtml({ view: 'side', facing: 'left', lean: 20, wedge: 'paperback', size: 12, x: 40, y: 60, perch: { name: 'wallShelf', x: 30, y: 20, w: 30 } }, 'tsp');
  assert.match(html, /class="life-perch"/);
  assert.match(html, /class="life-duck-pose life-duck-side"/);
  assert.match(html, /class="life-duck-flip"/);
  assert.match(html, /class="life-duck-contact"/);
  assert.doesNotMatch(html, /class="(perch|duck-[a-z]+)"/, 'no unprefixed pose classes');
  assert.throws(() => duckPoseHtml({ view: 'side', size: 10, x: 1, y: 1 }, 'Bad Id'), RangeError);
  assert.throws(() => duckPoseHtml({ view: 'diagonal', size: 10, x: 1, y: 1 }, 'tse'), RangeError);
  assert.throws(() => duckPoseHtml({ view: 'side', size: 10, x: 1, y: 1, perch: { name: 'crate', x: 1, y: 1, w: 10 } }, 'tsf'), RangeError);
  assert.throws(() => duckPoseHtml({ view: 'side', lean: 20, wedge: 'crate', size: 10, x: 1, y: 1 }, 'tsg'), RangeError);
});

test('no output contains script, external href or external url()', () => {
  const outputs = [
    art.tapedNotice({ idPrefix: 'ta', state: 'read' }), art.saleTag({ idPrefix: 'te' }), art.emptyPlate({ idPrefix: 'tc' }),
    art.bakeryBag({ idPrefix: 'td' }), art.phoneGlow({ idPrefix: 'tf' }), art.workKeysTray(), art.wallShelf({ idPrefix: 'tg' }).svg, art.paperback({ idPrefix: 'tk' }),
    duckPoseHtml({ view: 'side', facing: 'right', lean: -20, wedge: 'paperback', size: 10, x: 50, y: 70 }, 'tsa'),
    duckPoseHtml({ view: 'side', facing: 'left', lean: 20, wedge: 'paperback', size: 12, x: 40, y: 60, perch: { name: 'wallShelf', x: 30, y: 20, w: 30 } }, 'tsb'),
    duckPoseHtml({ view: 'front', size: 10, x: 50, y: 70 }, 'tsc'),
    duckPoseHtml({ view: 'rear', size: 10, x: 50, y: 70 }, 'tsd'),
    duckPoseHtml({ view: 'top', turn: 90, size: 17, x: 49, y: 61 }, 'tse'),
  ];
  for (const out of outputs) {
    assert.doesNotMatch(out, /<script/i);
    assert.doesNotMatch(out, /href="http/);
    assert.doesNotMatch(out, /url\(http/);
  }
});
