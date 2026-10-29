import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const acceptedBlobs = {
  'apartment/index.mjs': 'e08544e19533add5e08f47f0ef83ede91d9a1d82',
  'apartment/rooms/specs.mjs': '8aa51104a967ae9454128d79594b4df5eb5809c9',
  'apartment/rooms/camera.mjs': 'e8e96a172b46d93a83f6cce53b352794414fe294',
  'apartment/rooms/scene.mjs': 'a2f7ca4d53cb88ffea77933e6c0f2e8186df3bb3',
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
