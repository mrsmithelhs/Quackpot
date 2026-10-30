import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Plan 38 re-pinned index.mjs and rooms/scene.mjs after adding the default-preserving `duck` option; default scene
// output was verified byte-identical across 252 option combinations and layers.test.mjs still passes.
const acceptedBlobs = {
  'apartment/index.mjs': 'a2a7c9b6addc3157d66053b94f9f4943924a65ea',
  'apartment/rooms/specs.mjs': '8aa51104a967ae9454128d79594b4df5eb5809c9',
  'apartment/rooms/camera.mjs': 'e8e96a172b46d93a83f6cce53b352794414fe294',
  'apartment/rooms/scene.mjs': '897b432c85ae0f63fcf8a8b0200a62ead2a14309',
  'apartment/props/living.mjs': '80cc60c9703f7d586aa139273b5ee77206c7f3d0',
  'apartment/core/constants.mjs': '5a8c8f228fab6cb795298188bd6f7f8b807ed489'
};

test('weather extraction anchors still match the accepted Plan 24 kit source fingerprint', () => {
  for (const [relative, expected] of Object.entries(acceptedBlobs)) {
    const bytes = readFileSync(path.join(root, relative));
    const normalized = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
    const header = Buffer.from(`blob ${normalized.length}\0`);
    const actual = createHash('sha1').update(header).update(normalized).digest('hex');
    assert.equal(actual, expected, `kit source changed: ${relative}`);
  }
});
