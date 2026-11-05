import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeededRace, runTransactionalEndpointResolution } from './adapter.mjs';

test('endpoint excludes a supplied crossed entrant before resolving contacts',()=>{
  let contactIds;
  const remaining=runTransactionalEndpointResolution([{id:'P',lateral:0},{id:'A',lateral:0}],['P'],()=>{},r=>{contactIds=r.map(x=>x.id)});
  assert.deepEqual(contactIds,['A']); assert.deepEqual(remaining.map(x=>x.id),['A']);
});
test('fixed full-race witness uses individual crossings and does not activate after P crosses',()=>{
  const rivals={A:'steady',B:'steady',C:'steady',D:'steady',E:'steady'};
  for(const arm of ['none','guard']) {
    const input={seed:'p60i-finish-000',raceId:'p60i-finish',choice:'steady',playerBaseSpeed:10,fieldBaseSpeed:10,
      trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,
      susceptibility:'contact',injuryBand:'medium',candidateRivalChoices:rivals,multiContact:{advice:true,risks:{P:'steady',...rivals}},intervention:{arm,entryInjured:false}};
    const result=resolveSeededRace(input);
    assert.equal(result.status,'finished',`unexpected guard: ${result.unresolvedReason}`);
    assert.equal(result.finishCrossings.length,6);
    for(let i=1;i<result.finishCrossings.length;i++) assert.ok(result.finishCrossings[i].crossingTimeSeconds>=result.finishCrossings[i-1].crossingTimeSeconds);
    const p=result.finishCrossings.find(x=>x.id==='P'); assert.ok(p);
    assert.ok(result.interventionAudit.audit.filter(x=>x.type==='start').every(x=>x.tick*result.dt<p.crossingTimeSeconds));
    if (result.interventionAudit.start!==null) assert.fail('ability active after P finish');
  }
});
