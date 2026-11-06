import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { emptyHistory, mergeRun } from './usage-history.mjs';
import { createUsageZip, usageDocument } from './usage-export.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const id = '0123456789abcdef0123456789abcdef';

test('usage export retains factual allowed codes and omits private payloads and commitments', async () => {
  const entries = [
    { seq:0, type:'action', payload:{ kind:'uninstall_chosen', text:'Private Name' } },
    { seq:1, type:'terminal', payload:{ route:'uninstall', seed:'secret' } },
  ];
  const history = await mergeRun(emptyHistory(), id, entries);
  const doc = usageDocument(JSON.stringify(history));
  assert.equal(doc.runs[0].timeline[0].action, 'uninstall_chosen');
  assert.equal(doc.runs[0].timeline[1].route, 'uninstall');
  assert.doesNotMatch(JSON.stringify(doc), /Private Name|secret|sourceDigest/);
  assert.equal(doc.achievements.availability, 'unavailable');
  assert.equal(usageDocument(JSON.stringify(history), { currentSaveUnverified:true }).coverage.currentSave, 'shorter-unverified');
  const zip = await createUsageZip(JSON.stringify(history));
  assert.ok(zip.size > 0 && zip.size < 8 * 1024 * 1024);
});

test('export omits a reveal whose commitment is unavailable and reports the omission', async () => {
  const entries = [{ seq:0, type:'action', payload:{} }, { seq:1, type:'reveal_shown', payload:{ commitSeq:0 } }];
  const history = await mergeRun(emptyHistory(), id, entries);
  const run = usageDocument(JSON.stringify(history)).runs[0];
  assert.deepEqual(run.timeline, [{ seq:0, category:'action' }]);
  assert.equal(run.evidence.timelineOmitted, 1);
});
