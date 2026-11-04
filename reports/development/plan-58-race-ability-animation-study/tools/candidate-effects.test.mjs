import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, stateAt } from '../gallery/fixtures.mjs';
import { guardCue, recoveryCue, diveCue } from '../gallery/candidate-effects.mjs';

test('candidate response is separate from contact and no-response control',()=>{
 assert.deepEqual(stateAt(scenarios.guard.events,1.35).map(e=>e.type),['contact','guard']);
 assert.deepEqual(stateAt(scenarios['guard-control'].events,1.35).map(e=>e.type),['contact']);
 assert.deepEqual(stateAt(scenarios.guard.events,3).map(e=>e.type),[]);
});
test('injury persists after recovery and no-response remains distinct',()=>{
 assert.deepEqual(stateAt(scenarios.recovery.events,2).map(e=>e.type),['injury','recovery']);
 assert.deepEqual(stateAt(scenarios.recovery.events,3.4).map(e=>e.type),['injury']);
 assert.deepEqual(stateAt(scenarios['recovery-control'].events,2).map(e=>e.type),['injury']);
});
test('Dive has bounded activation and inert distinct alternatives',()=>{
 assert.deepEqual(stateAt(scenarios.dive.events,.5),[]);
 assert.deepEqual(stateAt(scenarios.dive.events,2).map(e=>e.type),['dive']);
 assert.deepEqual(stateAt(scenarios.dive.events,3.4),[]);
 assert.deepEqual(stateAt(scenarios['dive-control'].events,2),[]);
 for(const [fn,a,b] of [[guardCue,'tab','arc'],[recoveryCue,'arc','fold'],[diveCue,'ring','marker']]){
  assert.notEqual(fn(.5,a),fn(.5,b));
  for(const markup of [fn(.5,a),fn(.5,b)])assert.doesNotMatch(markup,/<script|on\w+\s*=|href\s*=|url\(|https?:/i);
 }
});

test('accepted Bounce and crowd fixture controls retain their authored timing',()=>{
 assert.deepEqual(scenarios.bounce.events,[{id:'threat',type:'threat',at:.65,end:1.35,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.35,end:3.2,source:'A',targets:[]}]);
 assert.deepEqual(scenarios.crowd.events,[{id:'surge',type:'crowd',at:.8,end:3,source:'A',targets:[]}]);
});
