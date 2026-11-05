// Full resolver selected-injury control: fixed inputs, not a natural-outcome screen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeededRace } from './adapter.mjs';

const rivals={A:'steady',B:'steady',C:'steady',D:'steady',E:'steady'};
const common={seed:'p60i-entry-000',raceId:'p60i-entry',choice:'steady',playerBaseSpeed:10,fieldBaseSpeed:10,
  trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,
  susceptibility:'contact',injuryBand:'medium',candidateRivalChoices:rivals,multiContact:{advice:true,risks:{P:'steady',...rivals}}};
for (const arm of ['none','guard','quick-recovery','straight-shooter']) test(`entry injury applies once ${arm}`,()=>{
  const result=resolveSeededRace({...common,intervention:{arm,entryInjured:true}});
  const audit=result.interventionInjuryAudit.P;
  assert.ok(audit,'injury rating witness exists');
  assert.equal(audit.tick,1);
  assert.ok(Math.abs(audit.injuredTopSpeed-(8.25+.5*audit.sampledRating*.9))<1e-10);
  assert.ok(audit.cappedTarget<=audit.injuredTopSpeed);
  for (const event of result.eventRecords.filter(x=>x.type==='duck-contact' && x.participants.includes('P'))) {
    assert.equal(event.injuryRolls.some(x=>x.id==='P'),false,'entry injury cannot stack');
  }
});

test('historical onset witness applies target on next tick and retains contact impulse',()=>{
  // Chosen before execution from Plan55's recorded p55t-screen-001 injury witness;
  // this is a controlled historical case, never a natural-screen sample.
  const choice='sprint', rivals={A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'};
  const input={...common,seed:'p55t-screen-001',raceId:'R01',choice,playerBaseSpeed:8,fieldBaseSpeed:8,
    candidateRivalChoices:rivals,multiContact:{advice:true,risks:{P:choice,...rivals}},intervention:{arm:'none',entryInjured:false}};
  const result=resolveSeededRace(input), audit=result.interventionInjuryAudit.P;
  assert.ok(audit,'predeclared historical injury witness was not observed');
  assert.equal(audit.tick,audit.onsetTick+1);
  assert.ok(Math.abs(audit.injuredTopSpeed-(8.25+.5*audit.sampledRating*.9))<1e-10);
  const event=result.eventRecords.find(e=>e.type==='duck-contact' && e.injuryRolls?.some(r=>r.id==='P' && r.injured));
  assert.ok(event); assert.equal(event.tick,audit.onsetTick);
  assert.ok(event.pre.P && event.post.P,'actual contact impulse retained');
});
