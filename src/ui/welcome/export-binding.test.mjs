import test from 'node:test';
import assert from 'node:assert/strict';
import { bindExportIdentity } from './export-binding.mjs';

test('legacy identity and Welcome snapshot remain reconciled if a later export step fails', async () => {
  const saved = { eventLog:[] }, id = '0123456789abcdef0123456789abcdef';
  let primary = JSON.stringify(saved), welcome = primary, pending = null;
  await assert.rejects(async () => {
    await bindExportIdentity(saved, id, async value => { primary = JSON.stringify({ ...saved, usageRunId:value }); return value; },
      value => { pending = value; welcome = primary; });
    throw new Error('archive failed');
  }, /archive failed/);
  assert.equal(welcome, primary);
  assert.equal(JSON.parse(welcome).usageRunId, id);
  assert.equal(pending.usageRunId, id);
  const retryId = await bindExportIdentity(saved, id, async () => JSON.parse(primary).usageRunId, () => {});
  assert.equal(retryId, id);
});
