// Declared helper checks; not execution authority or evidence of full race physics.
import test from 'node:test';
import assert from 'node:assert/strict';
import { adjustedTopSpeed, initialState, guardFactor, guardObservation, tickState, expire } from './interventions.mjs';

test('injury is a single rating factor before affine conversion',()=>{
  assert.equal(adjustedTopSpeed(10,false),13.25);
  assert.equal(adjustedTopSpeed(10,true),12.75);
  assert.ok(Math.abs(adjustedTopSpeed(10*.5*1.05,true)-10.6125)<1e-12);
  assert.equal(Math.min(10,adjustedTopSpeed(10,true)),10);
});
test('Guard requires an earlier activation and excludes exact end',()=>{
  const state=initialState('guard'); state.start=10; state.end=20;
  assert.equal(guardFactor(state,10),1); assert.equal(guardFactor(state,10.5),.5);
  assert.equal(guardFactor(state,19.999),.5); assert.equal(guardFactor(state,20),1); assert.equal(guardFactor(state,20.001),1);
  tickState(state,19); assert.equal(guardFactor(state,19.999),.5); tickState(state,20); assert.equal(guardFactor(state,20),1);
});
test('expiry starts cooldown and does not repeat',()=>{
  const state=initialState('guard'); state.start=10; state.end=20;
  tickState(state,20); assert.equal(state.start,null); assert.equal(state.cooldownUntil,60);
  tickState(state,21); assert.equal(state.audit.filter(e=>e.type==='end').length,1);
});
test('interrupt and finish can close an active interval without healing anything',()=>{
  const state=initialState('quick-recovery'); state.start=10; state.end=20;
  const previous=expire(state,15,'new-contact'); assert.equal(previous.start,10); assert.equal(state.cooldownUntil,55);
  assert.equal(expire(state,16,'finish'),null);
});
test('fractional finish terminates Guard without restoring the active window',()=>{
  const state=initialState('guard'); state.start=10; state.end=20;
  assert.equal(guardFactor(state,19.49),.5);
  expire(state,19.5,'finish');
  assert.equal(guardFactor(state,19.51),1);
  assert.equal(state.cooldownUntil,59.5);
});
test('absence rearms Guard without fabricating contact',()=>{
  const state=initialState('guard'); state.latched=true;
  guardObservation(state,{seed:'fixture',raceId:'fixture',id:'P',tick:5,threat:null});
  assert.equal(state.latched,true);
  guardObservation(state,{seed:'fixture',raceId:'fixture',id:'P',tick:10,threat:null});
  assert.equal(state.latched,false); assert.equal(state.audit.length,0);
});
