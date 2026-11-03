import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtures, stateAt } from '../gallery/fixtures.mjs';

test('collision does not create injury; onset and clearing follow their own times', () => {
  assert.deepEqual([...stateAt(fixtures.neither.events, 1.2).injured], []);
  assert.deepEqual([...stateAt(fixtures.first.events, 1.1).injured], []);
  assert.deepEqual([...stateAt(fixtures.first.events, 1.2).injured], ['A']);
  assert.deepEqual([...stateAt(fixtures.existing.events, 2.6).injured], []);
  assert.deepEqual([...stateAt(fixtures.existing.events, 0.5).injured], ['A']);
});

test('seek reconstruction removes future facts and retains overlapping contacts', () => {
  const later = stateAt(fixtures.repeated.events, 1.8);
  assert.deepEqual(later.contacts.map(e => e.ids), [['A', 'B'], ['B', 'C']]);
  assert.equal(stateAt(fixtures.repeated.events, 0.5).contacts.length, 0);
  assert.equal(stateAt(fixtures.repeated.events, 3).contacts.length, 0);
  assert.deepEqual([...stateAt(fixtures.both.events, 1.2).injured], ['A', 'B']);
  assert.equal(stateAt(fixtures.wall.events, 1.1).contacts[0].wall, true);
  assert.equal(stateAt(fixtures.wall.events, 1.1).injured.size, 0);
});
