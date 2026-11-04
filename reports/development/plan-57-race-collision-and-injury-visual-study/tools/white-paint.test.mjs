import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blendWhite } from '../gallery/white-paint.mjs';

test('white blend preserves palette endpoints and clamps finite weights', () => {
  assert.equal(blendWhite('#fbbf24', 0), 'rgb(251, 191, 36)');
  assert.equal(blendWhite('#fbbf24', 1), 'rgb(255, 255, 255)');
  assert.equal(blendWhite('#000000', .5), 'rgb(128, 128, 128)');
  assert.equal(blendWhite('#047857', -1), 'rgb(4, 120, 87)');
  assert.equal(blendWhite('unknown', .5), 'unknown');
});
