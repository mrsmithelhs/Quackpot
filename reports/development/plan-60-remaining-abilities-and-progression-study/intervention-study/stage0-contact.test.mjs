// Controlled swept-contact and injected event fractions; not a full race.
import test from 'node:test';
import assert from 'node:assert/strict';
import { controlledContactFixture } from './adapter.mjs';

const input={seed:'p60i-contact-000',raceId:'p60i-contact',choice:'steady',playerBaseSpeed:10,fieldBaseSpeed:10,
  trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,
  susceptibility:'contact',injuryBand:'medium',intervention:{arm:'guard',entryInjured:false}};
for (const [label,tick,fraction,factor] of [['start',11,0,1],['after-start',11,.001,.5],['before-end',20,.999,.5],['end-same-step',20,1,1],['end-next-step',21,0,1],['after-end',21,.001,1]]) {
  test(`Guard actual-contact boundary ${label}`,()=>{
    const r=controlledContactFixture(input,{tick,fraction,guardStart:10});
    assert.equal(r.records.length,1);
    const rolls=r.records[0].injuryRolls, p=rolls.find(x=>x.id==='P'),a=rolls.find(x=>x.id==='A');
    assert.ok(p && a); assert.equal(p.interventionFactor,factor);
    assert.equal(p.probability,.05*factor); assert.equal(a.probability,.05);
    assert.notEqual(p.key,a.key);
  });
}
test('already-injured P receives no additional injury roll, A remains independent',()=>{
  const r=controlledContactFixture({...input,intervention:{arm:'guard',entryInjured:true}},{tick:12,fraction:.5,guardStart:10});
  assert.equal(r.records.length,1);
  assert.deepEqual(r.records[0].injuryRolls.map(x=>x.id),['A']);
});
