import assert from 'node:assert/strict';
import { resolveSeededRace as original } from '../../../src/core/race-resolver.mjs';
import { resolveSeededRace as adapter } from './multi-contact-adapter.mjs';
const base=i=>({seed:`p55m-check-${i}`,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:i%2?'sprint':'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1});
const repair=process.argv[2] === 'repair-check';
if(process.argv[2] && !repair)throw Error('unsupported mode');
let calls=0,contacts=0,multi=0,eligible=0,followed=0;
for(let i=0;i<(repair?1:4);i++){const x=base(i);calls++;const a=original(x);calls++;const b=adapter(x);assert.deepEqual(b,a);}
for(let i=0;i<(repair?1:2);i++){
 const x={...base(i),candidateRivalChoices:{A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'},multiContact:{advice:true,risks:{P:base(i).choice,A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'}}};
 calls++;const a=adapter(x);calls++;const b=adapter(x);assert.deepEqual(a,b);
 eligible+=a.adviceAudit.filter(e=>e.eligible).length;followed+=a.adviceAudit.filter(e=>e.eligible&&e.follow&&e.side).length;
 const hit=a.eventRecords.filter(e=>e.type==='duck-contact');contacts+=hit.length;if(hit.length>1)multi++;
 assert.ok(hit.length<=32);assert.ok(a.multiContactAudit.every(e=>Array.isArray(e.accepted)&&Array.isArray(e.rejected)));
}
process.stdout.write(JSON.stringify({calls,controlPairs:repair?1:4,candidateRepeatPairs:repair?1:2,contacts,multiRaceWitnesses:multi,eligible,followed})+'\n');


