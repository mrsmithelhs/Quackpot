// Report-local synthetic contract experiment. There is no production unlock producer.
import test from 'node:test';
import assert from 'node:assert/strict';

function syntheticProjection(source) {
  if (source === null) return { availability:'unavailable' };
  if (source.synthetic !== true || source.catalog !== 'synthetic-catalog-1' || !Array.isArray(source.unlocks)) throw Error('unsupported synthetic source');
  const seen = new Set();
  for (const unlock of source.unlocks) {
    if (!/^synthetic-[a-z0-9-]+$/.test(unlock.id) || unlock.scope !== 'run') throw Error('invalid synthetic unlock');
    seen.add(unlock.id);
  }
  return { availability:'available', catalog:source.catalog, unlocks:[...seen].sort().map(id => ({ id, scope:'run' })) };
}

test('labeled synthetic duplicate unlock is retained once', () => {
  const one = { id:'synthetic-unlock-a', scope:'run' };
  assert.deepEqual(syntheticProjection({ synthetic:true, catalog:'synthetic-catalog-1', unlocks:[one,one] }),
    { availability:'available', catalog:'synthetic-catalog-1', unlocks:[one] });
});

test('synthetic available empty and unavailable are distinct; unlabeled input is refused', () => {
  assert.deepEqual(syntheticProjection(null), { availability:'unavailable' });
  assert.deepEqual(syntheticProjection({ synthetic:true, catalog:'synthetic-catalog-1', unlocks:[] }),
    { availability:'available', catalog:'synthetic-catalog-1', unlocks:[] });
  assert.throws(() => syntheticProjection({ catalog:'synthetic-catalog-1', unlocks:[] }), /unsupported/);
});
