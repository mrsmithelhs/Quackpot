import assert from 'node:assert/strict';
import { resolveSeededRace as traffic } from './multi-contact-adapter.mjs';
import { resolveSeededRace as candidate } from './injury-susceptibility-adapter.mjs';
const input={seed:'p55m-check-0',raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1,candidateRivalChoices:{A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'},multiContact:{advice:true,risks:{P:'steady',A:'sprint',B:'steady',C:'sprint',D:'steady',E:'sprint'}}};
let calls=0;calls++;const baseline=traffic(input);calls++;const disabled=candidate(input);assert.deepEqual(disabled,baseline);
calls++;const first=candidate({...input,susceptibility:'first'});calls++;const each=candidate({...input,susceptibility:'contact'});
const contacts=x=>x.eventRecords.filter(e=>e.type==='duck-contact');const a=contacts(first),b=contacts(each);
let coupled=0;if(a.length&&b.length&&a[0].id===b[0].id){assert.deepEqual(a[0].injuryRolls,b[0].injuryRolls);coupled=a[0].injuryRolls.length;}
for(const [policy,result] of [['first',first],['contact',each]]){
 const rolls=contacts(result).flatMap(e=>e.injuryRolls??[]);
 for(const id of ['P','A','B','C','D','E']){const personal=rolls.filter(x=>x.id===id);assert.ok(personal.filter(x=>x.injured).length<=1);if(policy==='first')assert.ok(personal.length<=1);}
 for(const [id,w] of Object.entries(result.injuryTargets)){const event=contacts(result).find(e=>(e.injuryRolls??[]).some(x=>x.id===id&&x.injured));assert.ok(event);assert.equal(w.tick,event.tick+1);assert.equal(w.afterTarget,w.beforeTarget*.95);}
}
process.stdout.write(JSON.stringify({calls,disabledParity:true,firstStatus:first.status,contactStatus:each.status,firstContacts:a.length,eachContacts:b.length,coupledFirstParticipantRolls:coupled,couplingCoverage:coupled>0?'observed':'gap',policies:['first','contact'],firstTargets:Object.keys(first.injuryTargets).length,eachTargets:Object.keys(each.injuryTargets).length})+'\n');

