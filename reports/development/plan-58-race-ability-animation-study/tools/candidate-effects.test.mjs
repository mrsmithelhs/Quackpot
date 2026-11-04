import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, stateAt, guardApproach, diveTravel } from '../gallery/fixtures.mjs';
import { guardCue, recoveryCue, diveCue, diveStages, diveLayer } from '../gallery/candidate-effects.mjs';

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

test('Guard and control use a continuous approach across contact boundaries',()=>{
 for(const t of [.5,1,1.55,2.05]) assert.ok(Math.abs(guardApproach(t-1e-5)-guardApproach(t+1e-5))<.001);
 assert.equal(guardApproach(0),0);assert.equal(guardApproach(1),1);assert.equal(guardApproach(1.55),1);assert.equal(guardApproach(3),0);
 assert.deepEqual(scenarios.guard.events[0],scenarios['guard-control'].events[0]);
});
test('Dive has three continuous travel phases and layered inert splashes',()=>{
 assert.equal(diveStages(.1).stage,'submerging');assert.equal(diveStages(.5).stage,'underwater');assert.equal(diveStages(.9).stage,'emerging');
 assert.ok(diveStages(.01).ring>diveStages(.19).ring);assert.ok(diveStages(.81).ring<diveStages(.99).ring);
 assert.equal(diveStages(.5).splash,0);for(const p of [.2,.3,.7,.8])assert.ok(Math.abs(diveStages(p-1e-6).ring-diveStages(p+1e-6).ring)<.001);
 for(const t of [.8,1.3,2.8,3.3])assert.ok(Math.abs(diveTravel(t-1e-6)-diveTravel(t+1e-6))<.001);
 assert.equal(diveTravel(0),0);assert.equal(diveTravel(4),12);
 for(const layer of ['front','behind']){const markup=diveLayer(.1,layer);assert.match(markup,/<ellipse/);assert.doesNotMatch(markup,/<script|on\w+\s*=|href\s*=|url\(|https?:/i);}
 assert.notEqual(diveLayer(.1,'front'),diveLayer(.1,'behind'));
});

test('new ability and control events keep distinct participants and activation',()=>{
 for(const name of ['wide','ahead','draft']){assert.equal(stateAt(scenarios[name].events,1).length,1);assert.deepEqual(stateAt(scenarios[name].events,1)[0].targets,['B']);assert.deepEqual(stateAt(scenarios[name+'-control'].events,1),[]);assert.deepEqual(stateAt(scenarios[name].events,3.3),[]);}
});
