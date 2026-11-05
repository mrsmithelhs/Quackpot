// Two scripted physical contact setups, no claim of continuous natural path.
import test from 'node:test';
import assert from 'node:assert/strict';
import { controlledInterruptionFixture } from './adapter.mjs';

test('a second contact interrupts the window and reactivation is blocked by cooldown',()=>{
  for (const arm of ['quick-recovery','straight-shooter']) {
    let covered=0;
    for(let i=0;i<4;i++) {
      const input={seed:`p60i-fixture-${String(i).padStart(3,'0')}`,raceId:'p60i-fixture',choice:'steady',
        playerBaseSpeed:10,fieldBaseSpeed:10,trialCommitted:false,trialMultiplier:1.05,
        experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,
        susceptibility:'contact',injuryBand:'medium',intervention:{arm,entryInjured:false}};
      const r=controlledInterruptionFixture(input);
      assert.equal(r.records.length,2);
      const ended=r.interventionAudit.audit.find(x=>x.type==='end' && x.reason==='new-contact');
      if(ended) { covered++; assert.equal(ended.tick,13); assert.equal(r.interventionAudit.cooldownUntil,53);
        assert.ok(r.interventionAudit.audit.some(x=>x.type==='blocked' && x.tick===13)); }
    }
    assert.ok(covered>0,`${arm}: fixed seeds did not cover interruption`);
  }
});
