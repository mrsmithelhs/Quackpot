import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { clearHistory, emptyHistory, mergeRun, parseHistory } from './usage-history.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const id = '0123456789abcdef0123456789abcdef';
const event = (seq, type, payload = {}) => ({ seq, type, payload, clock: { day: 1 } });

test('history contains only allowlisted categories and no private event payload', async () => {
  const entries = [event(0, 'run_started', { seed:'secret', name:'student' }), event(1, 'action', { text:'private' }), event(2, 'terminal')];
  const history = await mergeRun(emptyHistory(), id, entries);
  assert.deepEqual(history.records[id].timeline, [{ seq:1, category:'action' }, { seq:2, category:'terminal' }]);
  assert.doesNotMatch(JSON.stringify(history), /secret|student|private/);
  assert.equal(parseHistory(JSON.stringify(history)).achievements.availability, 'unavailable');
});

test('full-prefix digest distinguishes an extension, a branch and a shorter snapshot', async () => {
  const entries = [event(0, 'action'), event(1, 'draw_committed')];
  const history = await mergeRun(emptyHistory(), id, entries);
  await assert.rejects(mergeRun(history, id, entries.slice(0, 1)), /shorter/);
  await assert.rejects(mergeRun(history, id, [entries[0], event(1, 'terminal')]), /conflicting/);
  const next = await mergeRun(history, id, [...entries, event(2, 'receipt_shown')]);
  assert.equal(next.records[id].sourceCount, 3);
});

test('clear leaves a versioned empty generation and preserves its input', () => {
  const prior = emptyHistory(7), next = clearHistory(prior);
  assert.equal(next.generation, 8);
  assert.equal(prior.generation, 7);
  assert.deepEqual(parseHistory(JSON.stringify(next)), next);
  assert.throws(() => parseHistory('{"version":999}'), /unsupported/);
});
