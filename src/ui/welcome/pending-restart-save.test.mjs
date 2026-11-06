import test from 'node:test';
import assert from 'node:assert/strict';
import { saveAfterPendingRestart } from './pending-restart-save.mjs';

test('later Save waits for replacement and persists its own newer snapshot', async () => {
  let complete, stored = null;
  const pending = new Promise(resolve => { complete = resolve; });
  const target = {}, snapshot = { eventLog:['first','later'] };
  const result = saveAfterPendingRestart(pending, target, snapshot, () => target, async value => { stored = value; return { success:true }; });
  assert.equal(stored, null);
  complete({ success:true });
  assert.equal((await result).success, true);
  assert.deepEqual(stored, snapshot);
});

test('failed first replacement or changed run never reports newer snapshot saved', async () => {
  const target = {}; let calls = 0;
  const save = async () => { calls++; return { success:true }; };
  assert.equal((await saveAfterPendingRestart(Promise.resolve({ success:false }), target, {}, () => target, save)).success, false);
  assert.equal((await saveAfterPendingRestart(Promise.resolve({ success:true }), target, {}, () => ({}), save)).success, false);
  assert.equal(calls, 0);
});
