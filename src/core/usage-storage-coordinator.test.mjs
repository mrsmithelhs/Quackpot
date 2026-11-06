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

test('ordinary save cannot overwrite a different run or a divergent prefix', async () => {
  const { storage, coordinator, initial } = fixture();
  await assert.rejects(coordinator.save({ usageRunId:'fedcba9876543210fedcba9876543210', eventLog:events }), /different run/);
  await assert.rejects(coordinator.save({ usageRunId:id, eventLog:[{ seq:0, type:'terminal' }] }), /evidence changed/);
  assert.equal(storage.getItem('save'), initial);
});

test('binding a legacy identity persists before an archive failure', async () => {
  const { storage, locks } = fixture();
  const legacy = JSON.stringify({ eventLog:events });
  storage.setItem('save', legacy);
  const coordinator = createUsageCoordinator({ storage, locks, primaryKey:'save', expectedPrimary:legacy, generation:0 });
  await coordinator.bindLegacyId(id, () => true);
  const bound = storage.getItem('save');
  assert.equal(JSON.parse(bound).usageRunId, id);
  const set = storage.setItem;
  storage.setItem = (key, value) => { if (key === USAGE_HISTORY_KEY) throw new Error('quota'); set(key, value); };
  await assert.rejects(coordinator.replace({ prior:{ id, entries:events }, replacement:{} }), /quota/);
  assert.equal(storage.getItem('save'), bound);
});

test('replacement archives distinct live and saved runs before changing primary', async () => {
  const { storage, coordinator } = fixture();
  const liveId = 'fedcba9876543210fedcba9876543210';
  await coordinator.replace({ prior:{ id, entries:events }, additionalRuns:[{ id:liveId, entries:events }], replacement:{} });
  assert.deepEqual(Object.keys(JSON.parse(storage.getItem(USAGE_HISTORY_KEY)).records).sort(), [id, liveId].sort());
});

test('shorter save cannot change archived history or primary during export preparation', async () => {
  const { storage, coordinator, initial } = fixture();
  await coordinator.archive({ id, entries:[...events, { seq:1, type:'action' }] });
  const history = storage.getItem(USAGE_HISTORY_KEY);
  await assert.rejects(coordinator.archive({ id, entries:events }), /shorter run evidence unverified/);
  assert.equal(storage.getItem('save'), initial);
  assert.equal(storage.getItem(USAGE_HISTORY_KEY), history);
  assert.equal(await coordinator.snapshot(), history);
});

test('same-run Save can preserve unreadable history, while archive and replacement remain blocked', async () => {
  const { storage, locks, initial } = fixture();
  const invalid = '{"version":999}';
  storage.setItem(USAGE_HISTORY_KEY, invalid);
  const coordinator = createUsageCoordinator({ storage, locks, primaryKey:'save', expectedPrimary:initial, generation:null, protectedHistoryRaw:invalid });
  const newer = { usageRunId:id, eventLog:[...events, { seq:1, type:'action' }] };
  await coordinator.save(newer);
  assert.equal(storage.getItem('save'), JSON.stringify(newer));
  assert.equal(storage.getItem(USAGE_HISTORY_KEY), invalid);
  await assert.rejects(coordinator.archive({ id, entries:newer.eventLog }), /history is unavailable/);
  await assert.rejects(coordinator.clearHistory(), /history is unavailable/);
  await assert.rejects(coordinator.replace({ prior:{ id, entries:newer.eventLog }, replacement:{} }), /history is unavailable/);
  await assert.rejects(coordinator.save({ usageRunId:'fedcba9876543210fedcba9876543210', eventLog:newer.eventLog }), /different run/);
  await assert.rejects(coordinator.save({ usageRunId:id, eventLog:[{ seq:0, type:'terminal' }] }), /evidence changed/);
  assert.equal(storage.getItem('save'), JSON.stringify(newer));
  assert.equal(storage.getItem(USAGE_HISTORY_KEY), invalid);
});
