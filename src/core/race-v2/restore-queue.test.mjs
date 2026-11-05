import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSchema6Raw} from './restore-queue.mjs';

test('raw admission rejects one oversized compact record before reconstruction',()=>{
  const record={schema:'race-v2-compact/v1',input:{entrants:Array.from({length:6},()=>({}))},facts:{events:[],crossings:[]},padding:''};
  const wrap=value=>JSON.stringify({schemaVersion:6,eventLog:[],state:{raceResolutions:{R01:value}}});
  assert.doesNotThrow(()=>parseSchema6Raw(wrap(record)));
  record.padding='x'.repeat(128*1024);
  const raw=wrap(record);
  assert.ok(new TextEncoder().encode(raw).byteLength<1024*1024,'fixture stays below the combined limit');
  assert.throws(()=>parseSchema6Raw(raw),/individual race record limit/);
});
