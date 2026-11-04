import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BURST_FRAMES, burstFrameAt } from '../gallery/burst-timeline.mjs';
import { fixtures, stateAt } from '../gallery/fixtures.mjs';

test('four frame boundaries reconstruct deterministically on seek', () => {
  assert.equal(burstFrameAt(-.01), null);
  assert.deepEqual(BURST_FRAMES.map(frame => burstFrameAt(frame.sample)), ['onset','expansion','breakup','settle']);
  assert.equal(burstFrameAt(.12), 'expansion'); assert.equal(burstFrameAt(.30), 'breakup');
  assert.equal(burstFrameAt(.52), 'settle'); assert.equal(burstFrameAt(.85), null);
  assert.equal(burstFrameAt(.68, true), 'expansion'); assert.equal(burstFrameAt(.06, true), 'expansion');
  assert.equal(burstFrameAt(.06), 'onset');
});
test('contact cue frames never create injury, including overlapping contacts', () => {
  assert.equal(stateAt(fixtures.neither.events, 1.2).injured.size, 0);
  assert.deepEqual(stateAt(fixtures.repeated.events, 1.8).contacts.map(event => burstFrameAt(event.age)), ['settle','onset']);
  assert.deepEqual([...stateAt(fixtures.both.events, 1.2).injured], ['A','B']);
  assert.equal(stateAt(fixtures.both.events, .5).injured.size, 0);
});
