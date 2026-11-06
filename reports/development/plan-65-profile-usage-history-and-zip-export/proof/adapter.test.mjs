// Synthetic tests; execution requires the authorized bounded lane.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Coordinator, Lock, MemoryStorage } from './adapter.mjs';

const bytes = x => JSON.stringify(x);
function setup(primary = { id: 'old', log: ['a'] }) {
  const storage = new MemoryStorage(), lock = new Lock();
  if (primary !== null) storage.set('primary', bytes(primary));
  return { storage, lock, c: new Coordinator(storage, lock, storage.get('primary'), 0) };
}

test('rapid queued saves follow own verified bytes and refuse an external change', async () => {
  const { storage, c } = setup();
  await Promise.all([c.save({ id:'old', log:['a','b'] }), c.save({ id:'old', log:['a','b','c'] })]);
  assert.equal(storage.get('primary'), bytes({ id:'old', log:['a','b','c'] }));
  storage.set('primary', bytes({ id:'other', log:[] }));
  await assert.rejects(c.save({ id:'old', log:['a','b','c','d'] }), /primary changed/);
  assert.equal(storage.get('primary'), bytes({ id:'other', log:[] }));
});

test('restart archives before replace; cancel is byte-preserving', async () => {
  const { storage, c } = setup();
  const before = storage.get('primary');
  await c.restart({ confirmed:false });
  assert.equal(storage.get('primary'), before); assert.equal(storage.get('history'), null);
  await c.restart({ confirmed:true, priorRun:{ id:'old', log:['a'] }, replacement:{ id:'new', log:[] } });
  assert.equal(JSON.parse(storage.get('history')).records.old.count, 1);
  assert.equal(storage.get('primary'), bytes({ id:'new', log:[] }));
});

test('same-ID stale or divergent evidence cannot replace a newer saved primary', async () => {
  for (const log of [['a'], ['a','different']]) {
    const { storage, c } = setup({ id:'old', log:['a','b'] });
    const before = storage.get('primary');
    await assert.rejects(c.restart({ confirmed:true, priorRun:{ id:'old', log }, replacement:{ id:'new', log:[] } }), /saved prefix mismatch/);
    assert.equal(storage.get('primary'), before);
    assert.equal(storage.get('history'), null);
  }
});

test('failed archive prevents replacement, while failed replacement leaves verified history', async () => {
  for (const target of ['history', 'primary']) {
    const { storage, c } = setup(), before = storage.get('primary');
    storage.fault = point => point === `set:${target}`;
    await assert.rejects(c.restart({ confirmed:true, priorRun:{ id:'old', log:['a'] }, replacement:{ id:'new', log:[] } }));
    assert.equal(storage.get('primary'), before);
    assert.equal(storage.get('history') === null, target === 'history');
    storage.fault = null;
    await c.restart({ confirmed:true, priorRun:{ id:'old', log:['a'] }, replacement:{ id:'new', log:[] } });
    assert.equal(JSON.parse(storage.get('history')).records.old.count, 1);
  }
});

test('terminal archive with autosave off does not replace an older saved run', async () => {
  const { storage, c } = setup(), saved = storage.get('primary');
  await c.archive({ id:'terminal-unsaved', log:['start','terminal','receipt'] });
  assert.equal(storage.get('primary'), saved);
  await c.restart({ confirmed:true, priorRun:{ id:'old', log:['a'] }, replacement:{ id:'new', log:[] } });
  assert.deepEqual(Object.keys(JSON.parse(storage.get('history')).records).sort(), ['old','terminal-unsaved']);
});

test('full-source commitment identifies conflicting extension despite truncated timeline', async () => {
  const { storage, c } = setup();
  await c.archive({ id:'old', log:['a','b','c'] });
  const before = storage.get('history');
  await assert.rejects(c.archive({ id:'old', log:['a','b','different','d'] }), /conflict/);
  await assert.rejects(c.archive({ id:'old', log:['a','b'] }), /shorter unverified/);
  assert.equal(storage.get('history'), before);
  await c.archive({ id:'old', log:['a','b','c','d'] });
  const record = JSON.parse(storage.get('history')).records.old;
  assert.equal(record.count, 4); assert.deepEqual(record.timeline, ['a','b']); assert.equal(record.omitted, 2);
});

test('clear writes empty history and a new generation in one write, rejecting stale tab', async () => {
  const { storage, lock, c } = setup();
  const stale = new Coordinator(storage, lock, storage.get('primary'), 0);
  await c.archive({ id:'old', log:['a'] });
  await c.clearHistory();
  const history = JSON.parse(storage.get('history'));
  assert.equal(history.generation, 1); assert.deepEqual(history.records, {});
  await assert.rejects(stale.archive({ id:'old', log:['a'] }), /history changed/);
  assert.equal(storage.get('history'), bytes(history));
});

test('legacy ID binding happens only after confirmation and can persist after later failure', async () => {
  const { storage, c } = setup({ log:['a'] });
  const before = storage.get('primary');
  await c.restart({ confirmed:false, legacyId:'old' }); assert.equal(storage.get('primary'), before);
  storage.fault = point => point === 'set:history';
  await assert.rejects(c.restart({ confirmed:true, legacyId:'old', priorRun:{ id:'old', log:['a'] }, replacement:{ id:'new', log:[] } }));
  assert.equal(storage.get('primary'), bytes({ log:['a'], id:'old' }));
  storage.fault = null;
  await c.restart({ confirmed:true, priorRun:{ id:'old', log:['a'] }, replacement:{ id:'new', log:[] } });
  assert.equal(storage.get('primary'), bytes({ id:'new', log:[] }));
});

test('readback failure after a primary write reports uncertainty, not preservation', async () => {
  const { storage, c } = setup();
  const originalSet = storage.set.bind(storage);
  storage.set = (key, value) => {
    originalSet(key, value);
    if (key === 'primary') storage.fault = point => point === 'get:primary';
  };
  await assert.rejects(c.save({ id:'old', log:['a','b'] }), /fault:get:primary/);
  storage.fault = null;
  assert.equal(storage.get('primary'), bytes({ id:'old', log:['a','b'] }));
  await assert.rejects(c.save({ id:'old', log:['a','b','c'] }), /primary changed/);
});
