import test from 'node:test';
import assert from 'node:assert/strict';
import {lowRegisterVariant} from './low-register-variants.mjs';

test('boundary and independent velocity and timbre preserve note timing and source',()=>{
 const data={duration_experiment:{factor:.5},programs:{acoustic_piano:0},omitted:[],notes:[55,56].map((pitch,index)=>({index,part:'acoustic_piano',pitch,start:index,end:index+.5,velocity:85}))};
 const original=structuredClone(data), quiet=lowRegisterVariant(data,'quiet'), electric=lowRegisterVariant(data,'electric');
 assert.deepEqual(data,original);
 for(const v of [quiet,electric]) for(let i=0;i<2;i++) for(const k of ['index','part','pitch','start','end']) assert.equal(v.notes[i][k],data.notes[i][k]);
 assert.deepEqual(quiet.notes.map(n=>[n.velocity,n.render_program]),[[60,0],[85,0]]);
 assert.deepEqual(electric.notes.map(n=>[n.velocity,n.render_program]),[[85,4],[85,0]]);
});
test('rejects unsupported variants, source durations and notes',()=>{
 const d={duration_experiment:{factor:.5},programs:{acoustic_piano:0},omitted:[],notes:[{part:'acoustic_piano',pitch:55,start:0,end:1,velocity:85}]};
 assert.throws(()=>lowRegisterVariant(d,'other'));assert.throws(()=>lowRegisterVariant({...d,duration_experiment:{factor:.75}},'quiet'));
 assert.throws(()=>lowRegisterVariant({...d,notes:[{...d.notes[0],part:'drums'}]},'quiet'));
});
