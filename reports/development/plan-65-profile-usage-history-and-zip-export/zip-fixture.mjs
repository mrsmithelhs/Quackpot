// Synthetic writer diagnostic; not an actual Welcome download.
import { writeFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { emptyHistory, mergeRun } from '../../../src/core/usage-history.mjs';
import { createUsageZip } from '../../../src/core/usage-export.mjs';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const entries = [{ seq:0, type:'action', payload:{ kind:'uninstall_chosen' } },
  { seq:1, type:'terminal', payload:{ route:'uninstall' } }];
const history = await mergeRun(emptyHistory(), '0123456789abcdef0123456789abcdef', entries);
const blob = await createUsageZip(JSON.stringify(history));
await writeFile('synthetic-writer.zip', new Uint8Array(await blob.arrayBuffer()));
console.log(`synthetic archive ${blob.size} bytes`);
