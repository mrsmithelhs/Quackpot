import test from 'node:test';import assert from 'node:assert/strict';import {normalize,buildSchedule} from './full-track-events.mjs';
const a={type:'start',index:1,instrument:'acoustic_piano',pitch:60,start_time:121},b={type:'end',start_event_index:1,end_time:121.5};
test('full-track seconds retained and scheduled without excerpt clipping',()=>{const input=[a,b],before=structuredClone(input),r=normalize(input,127.1735);assert.deepEqual(input,before);assert.equal(r.notes[0].start,121);assert.equal(r.notes[0].end,121.5);assert.equal(r.render_duration,129.1735);assert.equal(buildSchedule(r).events.filter(e=>e.on).length,1)});
test('rejects bad duration, unpaired or past allowed tail',()=>{assert.throws(()=>normalize([a],127));assert.throws(()=>normalize([a,b],0));assert.throws(()=>normalize([a,{...b,end_time:131}],127));});

test('retains notes beyond source duration as a labeled tail',()=>{const input=[{...a,start_time:133.7},{...b,end_time:133.96}],r=normalize(input,133.5335);assert.equal(r.notes[0].end,133.96);assert.equal(r.render_duration,135.96);assert.equal(buildSchedule(r).events.length,2)});
