import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createUsageCoordinator } from './usage-storage-coordinator.mjs';
import { USAGE_HISTORY_KEY } from './usage-history.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const id = '0123456789abcdef0123456789abcdef';
const events = [{ seq:0, type:'action' }];
function fixture() {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let tail = Promise.resolve();
  const locks = { request: (_name, _options, fn) => { const result = tail.then(() => fn({})); tail = result.catch(() => {}); return result; } };
  const initial = JSON.stringify({ usageRunId:id, eventLog:events });
  storage.setItem('save', initial);
  return { storage, locks, initial, coordinator:createUsageCoordinator({ storage, locks, primaryKey:'save', expectedPrimary:initial, generation:0 }) };
}

test('queued same-tab saves chain and a competing primary is refused', async () => {
  const { storage, coordinator } = fixture();
  const a = { usageRunId:id, eventLog:[...events, { seq:1, type:'action' }] };
  const b = { usageRunId:id, eventLog:[...a.eventLog, { seq:2, type:'action' }] };
  await Promise.all([coordinator.save(a), coordinator.save(b)]);
  assert.equal(storage.getItem('save'), JSON.stringify(b));
  storage.setItem('save', 'newer');
  await assert.rejects(coordinator.save(a), /changed/);
  assert.equal(storage.getItem('save'), 'newer');
});

test('replacement archives first and rejects a stale saved prefix', async () => {
  const { storage, coordinator, initial } = fixture();
  await assert.rejects(coordinator.replace({ prior:{ id, entries:[] }, replacement:{} }), /evidence changed/);
  assert.equal(storage.getItem('save'), initial);
  assert.equal(storage.getItem(USAGE_HISTORY_KEY), null);
  await coordinator.replace({ prior:{ id, entries:events }, replacement:{ usageRunId:'new' } });
  assert.equal(JSON.parse(storage.getItem(USAGE_HISTORY_KEY)).records[id].sourceCount, 1);
  assert.equal(storage.getItem('save'), JSON.stringify({ usageRunId:'new' }));
});

test('history clear invalidates another coordinator and lack of locks blocks writes', async () => {
  const { storage, locks, initial, coordinator } = fixture();
  const other = createUsageCoordinator({ storage, locks, primaryKey:'save', expectedPrimary:initial, generation:0 });
  await coordinator.clearHistory();
  await assert.rejects(other.save({}), /history changed/);
  const noLock = createUsageCoordinator({ storage, locks:null, primaryKey:'save', expectedPrimary:initial, generation:1 });
  await assert.rejects(noLock.save({}), /locking unavailable/);
  assert.equal(storage.getItem('save'), initial);
});
