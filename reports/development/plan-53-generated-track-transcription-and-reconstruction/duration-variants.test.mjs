import test from 'node:test';
import assert from 'node:assert/strict';
import {shortenDurations} from './duration-variants.mjs';

test('75% and 50% preserve starts, pitch, program, velocity and source',()=>{
  const source={programs:{acoustic_piano:0},omitted:[],notes:[{index:7,part:'acoustic_piano',pitch:64,start:1,end:3,velocity:85}]};
  const original=structuredClone(source), a=shortenDurations(source,.75), b=shortenDurations(source,.5);
  assert.deepEqual(source,original); assert.equal(a.notes[0].end,2.5); assert.equal(b.notes[0].end,2);
  for(const variant of [a,b]) { for(const key of ['index','part','pitch','start','velocity']) assert.equal(variant.notes[0][key],source.notes[0][key]); assert.deepEqual(variant.programs,source.programs); }
});
test('unsupported factors, invalid notes and percussion are rejected',()=>{
  const input={programs:{acoustic_piano:0},omitted:[],notes:[{part:'acoustic_piano',start:1,end:2}]};
  assert.throws(()=>shortenDurations(input,.9)); assert.throws(()=>shortenDurations({...input,notes:[{part:'drums',start:1,end:2}]},.5));
  assert.throws(()=>shortenDurations({...input,notes:[{part:'acoustic_piano',start:1,end:1}]},.5));
});
