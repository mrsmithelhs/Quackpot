// Authored swept contact plus 20 controller steps, not a full race.
// Fixed seeds; do not execute until Stage0 clearance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { controlledRecoveryFixture } from './adapter.mjs';

function fixtureInput(seedIndex,arm) {
  return {seed:`p60i-fixture-${String(seedIndex).padStart(3,'0')}`,raceId:'p60i-fixture',choice:'steady',
    playerBaseSpeed:10,fieldBaseSpeed:10,trialCommitted:false,trialMultiplier:1.05,
    experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,
    susceptibility:'contact',injuryBand:'medium',intervention:{arm,entryInjured:false}};
}
test('fixed controlled contact preserves impulse/injury and can expose different controller paths',()=>{
  let bothActivated=0, distinct=0, witness=null;
  for(let i=0;i<4;i++) {
    const control=controlledRecoveryFixture(fixtureInput(i,'none'));
    const quick=controlledRecoveryFixture(fixtureInput(i,'quick-recovery'));
    const straight=controlledRecoveryFixture(fixtureInput(i,'straight-shooter'));
    assert.equal(control.records.length,1,`seed ${i}: exactly one contact`);
    for(const candidate of [quick,straight]) {
      assert.equal(candidate.records.length,1);
      assert.deepEqual(candidate.records[0].pre,control.records[0].pre);
      assert.deepEqual(candidate.records[0].post,control.records[0].post);
      assert.deepEqual(candidate.records[0].injuryRolls,control.records[0].injuryRolls);
    }
    const q=quick.interventionAudit.audit.some(x=>x.type==='start');
    const s=straight.interventionAudit.audit.some(x=>x.type==='start');
    if(q && s) {
      bothActivated++;
      let maximum=0,atTick=null,field=null;
      for(let j=0;j<quick.path.length;j++) for(const key of ['heading','lateral','progress']) {
        assert.equal(quick.path[j].tick,straight.path[j].tick);
        const delta=Math.abs(quick.path[j][key]-straight.path[j][key]);
        if(delta>maximum) { maximum=delta; atTick=quick.path[j].tick; field=key; }
      }
      if(maximum>1e-9) { distinct++; if(!witness) witness={seedIndex:i,maximum,atTick,field}; }
    }
  }
  console.log(JSON.stringify({case:'controlled-numeric-divergence',bothActivated,distinct,tolerance:1e-9,witness}));
  assert.ok(bothActivated>0,'fixed four seeds must include shared activation or distinction is inconclusive');
  assert.ok(distinct>0,'controlled numerical path distinction not established');
});
