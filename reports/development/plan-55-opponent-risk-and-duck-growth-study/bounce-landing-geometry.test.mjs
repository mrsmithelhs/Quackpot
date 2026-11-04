import test from 'node:test';import assert from 'node:assert/strict';import {landingGeometry,landingImpulse,compareLandingEvents} from './bounce-landing-geometry.mjs';
test('overlap correction separates equally along contact normal',()=>{const g=landingGeometry({id:'A',x:0,y:0},{id:'B',x:.4,y:0});assert.equal(g.normal.x,1);assert.ok(.4+2*g.displacement>1);assert.equal(g.deltaA.x,-g.deltaB.x)});
test('coincident normal is deterministic and symmetric under participant reversal',()=>{const a={id:'A',x:0,y:0},b={id:'B',x:0,y:0},x=landingGeometry(a,b),y=landingGeometry(b,a);assert.equal(x.normal.x,-y.normal.x);assert.equal(x.coincident,true)});
test('nonoverlap is not a landing contact',()=>assert.equal(landingGeometry({id:'A',x:0,y:0},{id:'B',x:1,y:0}),null));
test('impulse is only applied for closing velocity',()=>{assert.equal(landingImpulse(0),0);assert.equal(landingImpulse(1),0);assert.equal(landingImpulse(-2),1.25)});

test('previously committed boundary events precede landing and next tick follows',()=>{const a=[{id:'next',tick:5},{id:'landing',tick:4,contactCause:'occupied-landing'},{id:'finish',tick:4,type:'finish-line-crossing'}].sort(compareLandingEvents);assert.deepEqual(a.map(x=>x.id),['finish','landing','next'])});

test('landing rearm counts elapsed ticks from physical boundary', async()=>{const {processCandidatePairs}=await import('./multi-contact-state.mjs');const item={a:'A',b:'P',fraction:0},state={pairs:{'A|P':{tick:1,separated:true}},count:1};const run=boundary=>processCandidatePairs([item],state,boundary,()=>({eligible:true}),()=>true);assert.equal(run(10).rejected[0].reason,'episode-active');assert.equal(run(11).accepted.length,1);assert.equal(run(11).state.pairs['A|P'].tick,11)});
