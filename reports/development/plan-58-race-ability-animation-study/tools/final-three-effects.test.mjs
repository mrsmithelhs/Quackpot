import test from 'node:test';
import assert from 'node:assert/strict';
import {scenarios,stateAt} from '../gallery/fixtures.mjs';
import {straightCue,steadyCue,wakeCue,wobbleAngle,straightAngle} from '../gallery/final-three-effects.mjs';
test('contact, wobble and follower controls preserve separately authored events',()=>{
 assert.deepEqual(stateAt(scenarios.straight.events,1.4).map(x=>x.type),['contact','straight']);assert.deepEqual(stateAt(scenarios['straight-control'].events,1.4).map(x=>x.type),['contact']);
 assert.deepEqual(stateAt(scenarios.steady.events,1.4).map(x=>x.type),['wobble','steady']);assert.deepEqual(stateAt(scenarios['steady-control'].events,1.4).map(x=>x.type),['wobble']);
 assert.deepEqual(stateAt(scenarios.wake.events,1.4)[0].targets,['B']);assert.deepEqual(stateAt(scenarios['wake-control'].events,1.4),[]);
 for(const name of ['steady','steady-control','wake','wake-control'])assert.ok(!scenarios[name].events.some(x=>x.type==='contact'||x.type==='injury'));
});
test('A/B effects change with time, use independent layers, and contain inert SVG',()=>{
 const groups=[[p=>straightCue(p,'a'),p=>straightCue(p,'b')],[p=>steadyCue(p,'a','front'),p=>steadyCue(p,'b','front')],[p=>wakeCue(p,'a','front'),p=>wakeCue(p,'b','front')]];
 for(const [a,b] of groups){assert.notEqual(a(.5),b(.5));assert.notEqual(a(.3),a(.7));assert.doesNotMatch(a(.5)+b(.5),/<script|on\w+\s*=|href\s*=|url\(|https?:|NaN/i);}
 assert.notEqual(steadyCue(.5,'a','front'),steadyCue(.5,'a','back'));assert.notEqual(wakeCue(.5,'b','front'),wakeCue(.5,'b','back'));
});
test('body returns to neutral and wobble controls share the same initial track',()=>{
 for(const t of [.65,.8,1.1,1.2])assert.equal(wobbleAngle(t,true),wobbleAngle(t,false));
 assert.equal(wobbleAngle(0,true),0);assert.equal(wobbleAngle(4,true),0);assert.equal(straightAngle(0),0);assert.equal(straightAngle(4),0);
 assert.ok(Math.abs(wobbleAngle(2.05,true))<Math.abs(wobbleAngle(2.05,false)));
});
