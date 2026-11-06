// Synthetic diagnostic only: exercise the actual Plan42 ZIP reader, which has a
// different synthetic JSON schema. No archive extraction to the filesystem.
import { readFile } from 'node:fs/promises';
import { decodeZip } from '../plan-42-usage-package-contract-and-zip-spike/archive.mjs';
for (const file of (process.argv.slice(2).length ? process.argv.slice(2) : ['synthetic-writer.zip'])) {
  const bytes = new Uint8Array(await readFile(file));
  try {
    await decodeZip(bytes);
    throw new Error('Unexpected acceptance of the multi-run JSON by the synthetic schema');
  } catch (error) {
    if (error.message !== 'unexpected fields') throw error;
    console.log(`${file}: Plan42 transport and bounded JSON parsing passed; its synthetic schema refused the different multi-run envelope (unexpected fields).`);
    console.log('Explicit diagnostic disposition: unsupported format quackpot-profile-usage / schema version 1.');
  }
}
