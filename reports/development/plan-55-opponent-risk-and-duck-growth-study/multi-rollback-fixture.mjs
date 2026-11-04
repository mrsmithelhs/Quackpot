import assert from 'node:assert/strict';
import { resolveSeededRace } from './multi-contact-adapter.mjs';
const input={seed:'p55m-rollback-fixture',raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:{A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'},multiContact:{advice:true,risks:{P:'steady',A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'}}};
const a=resolveSeededRace(input,{maxMechanicalEvents:1}),b=resolveSeededRace(input,{maxMechanicalEvents:1});assert.deepEqual(a,b);
assert.equal(a.unresolvedReason,'mechanical_event_cap');const tick=a.guardEvidence.tick;
assert.ok(a.trajectory.every(x=>x.tick<tick));assert.ok(a.finishCrossings.every(x=>x.tick<tick));
assert.ok(a.eventRecords.every(x=>x.tick<tick));assert.ok(a.multiContactAudit.every(x=>x.tick<tick));assert.ok(a.adviceAudit.every(x=>x.tick<tick));
process.stdout.write(JSON.stringify({calls:2,status:a.status,reason:a.unresolvedReason,tick,discarded:a.guardEvidence.tickRecordsDiscarded,retainedContacts:a.eventRecords.filter(x=>x.type==='duck-contact').length,retainedAdvice:a.adviceAudit.length,eligibleAdvice:a.adviceAudit.filter(x=>x.eligible).length,pairCount:a.multiContactAudit.at(-1)?.state.count??0,lastTrajectoryTick:a.trajectory.at(-1)?.tick??null})+'\n');

