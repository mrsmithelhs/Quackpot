import test from 'node:test';
import assert from 'node:assert/strict';
import { padAndForce, bowWave, airCurrents } from '../gallery/revision-effects.mjs';

test('authored motion varies by phase while still frames remain deterministic',()=>{
 assert.notEqual(padAndForce(.1),padAndForce(.5));
 assert.notEqual(bowWave(.1),bowWave(.2));
 assert.notEqual(airCurrents(.1),airCurrents(.5));
 assert.equal(airCurrents(.1,true),airCurrents(.5,true));
 assert.equal(bowWave(.1,true),bowWave(.5,true));
});
test('effect markup contains no active or external references',()=>{
 for(const art of [padAndForce(.5),bowWave(.5),airCurrents(.5)]){
  assert.match(art,/^<svg /);assert.doesNotMatch(art,/<script|on\w+\s*=|href\s*=|url\(|https?:/i);
 }
});
