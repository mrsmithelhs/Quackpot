import test from 'node:test';
import assert from 'node:assert/strict';
import { measure } from './baseline-runner.mjs';

const entrant = (id, progress, x, speed) => ({ id, progress, x, y: 0, speed });
const frame = (tick, others) => ({ tick, entrants: [entrant('P', 10, 0, 10), ...others] });
test('counts real events, latches proximity episodes, and stops at individual finishes', () => {
  const r = { dt: 0.05, status: 'finished', unresolvedReason: null, horizonSeconds: 0.2,
    finishCrossings: [{ id: 'P', crossingTimeSeconds: 0.15 }, { id: 'A', crossingTimeSeconds: 0.1 }],
    finish: [{ id: 'P', place: 2 }],
    trajectory: [frame(0,[entrant('A', 11, 1, 11)]), frame(1,[entrant('A', 11, 1, 11)]),
      frame(2,[entrant('A', 11, 1, 11), entrant('B', 9, -1, 9)]), frame(3,[entrant('B',9,-1,9)])],
    eventRecords: [{ id: 'c', tick: 1, type: 'duck-contact', participants: ['P','A'] },
      { id: 'w', tick: 2, type: 'weave-turn', participants: ['P'] }] };
  const m = measure(r);
  assert.deepEqual([m.contacts,m.weaves,m.leaderFrames,m.leaderEpisodes,m.followerFrames,m.followerEpisodes], [1,1,2,1,1,1]);
  assert.equal(m.witness.leader.id, 'A');
  assert.equal(m.place, 2);
});

test('retains unresolved status and rejects duplicate event identity', () => {
  const r = { dt: 0.05, status: 'partial-unresolved', unresolvedReason: 'guard', horizonSeconds: 0,
    finishCrossings: [], finish: [], trajectory: [frame(0,[])], eventRecords: [] };
  assert.equal(measure(r).playerFinish, null);
  r.eventRecords = [{ id: 'same', type: 'duck-contact', participants: ['P','A'] }, { id: 'same', type: 'duck-contact', participants: ['P','A'] }];
  assert.throws(() => measure(r), /duplicate event identity/);
});

test('clips a target crossing within a sample interval and records target switches', () => {
  const r = { dt: 0.05, status: 'finished', unresolvedReason: null, horizonSeconds: 0.15,
    finishCrossings: [{id:'A', crossingTimeSeconds:0.075}, {id:'P',crossingTimeSeconds:0.15}],
    finish: [{id:'P',place:2}], eventRecords: [], trajectory: [
      frame(0,[entrant('A',11,1,11),entrant('B',12,2,11)]),
      frame(1,[entrant('A',11,1,11),entrant('B',12,2,11)]),
      frame(2,[entrant('A',11,1,11),entrant('B',12,2,11)]), frame(3,[])] };
  const m = measure(r);
  assert.ok(Math.abs(m.leaderSeconds - 0.125) < 1e-9);
  assert.equal(m.leaderEpisodes, 1);
  assert.equal(m.leaderTargets, 2);
  assert.equal(m.leaderSwitches, 1);
});
