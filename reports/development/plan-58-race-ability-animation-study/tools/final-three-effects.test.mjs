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

test('Steady A moves from ring to brace through a smooth midpoint while B remains separate',()=>{
 const weight=(p,part)=>Number(steadyCue(p,'a','front').match(new RegExp('class="steady-'+part+'-phase" opacity="([0-9.]+)"'))[1]);
 assert.equal(weight(.25,'ring'),1);assert.equal(weight(.25,'brace'),0);assert.ok(weight(.5,'ring')>0&&weight(.5,'brace')>0);assert.equal(weight(.75,'ring'),0);assert.equal(weight(.75,'brace'),1);
 for(const part of ['ring','brace'])assert.ok(Math.abs(weight(.5-1e-6,part)-weight(.5+1e-6,part))<.001);
 assert.match(steadyCue(.75,'b','front'),/steady-b/);assert.doesNotMatch(steadyCue(.75,'b','front'),/steady-ring-phase/);
});
