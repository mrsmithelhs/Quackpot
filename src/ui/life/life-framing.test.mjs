import test from 'node:test';
import assert from 'node:assert/strict';
import { renderScene } from '../../assets/apartment/index.mjs';
import { breakfastFraming, breakfastObjectBox } from './life-framing.mjs';

test('Day 1 establishes the kitchen wide; later breakfasts use medium, keeping objects at the same scene coordinates', () => {
  assert.equal(breakfastFraming(1), 'wide');
  assert.equal(breakfastFraming(2), 'medium');
  assert.equal(breakfastFraming(3), 'medium');
  const readBox = (framing) => renderScene({ area: 'kitchen', framing, duck: false, idPrefix: `test-${framing}` }).svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const medium = readBox('medium');
  const wide = readBox('wide');
  for (const box of [{ x: 21, y: 66, w: 14 }, { x: 26, y: 50, w: 7 }]) {
    const projected = breakfastObjectBox(1, box);
    assert.ok(Math.abs((wide[0] + projected.x / 100 * wide[2]) - (medium[0] + box.x / 100 * medium[2])) < 1e-8);
    assert.ok(Math.abs((wide[1] + projected.y / 100 * wide[3]) - (medium[1] + box.y / 100 * medium[3])) < 1e-8);
    assert.ok(Math.abs(projected.w * wide[2] - box.w * medium[2]) < 1e-8);
    assert.deepEqual(breakfastObjectBox(2, box), box);
  }
});
