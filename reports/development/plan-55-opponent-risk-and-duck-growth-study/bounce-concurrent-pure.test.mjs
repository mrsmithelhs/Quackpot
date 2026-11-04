import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialAbilityState,considerOpportunity} from './ability-opportunity-candidate.mjs';
const dir=new URL('.',import.meta.url);
test('concurrent adapter preserves study source except predicate and telemetry',async()=>{
 const old=(await readFile(new URL('bounce-exposure-adapter.mjs',dir),'utf8')).replaceAll('\r\n','\n');
 let expected=old.replace("eligible=!e.steeringEpisode&&(kind==='bounce'?Boolean(threat):(e.bounceStudy.phase!=='airborne'&&crowdEligible(own,others,COURSE_LENGTH)))", "eligible=kind==='bounce'?Boolean(threat):(!e.steeringEpisode&&e.bounceStudy.phase!=='airborne'&&crowdEligible(own,others,COURSE_LENGTH))");
 expected=expected.replace('recoveryActive:Boolean(e.steeringEpisode),phaseBefore:', 'recoveryActive:Boolean(e.steeringEpisode),episodeKind:e.steeringEpisode?.kind??null,episodePhase:e.steeringEpisode?.phase??null,phaseBefore:');
 expected=expected.replace("abilityAudit.push({id:e.id,kind,...event});", "abilityAudit.push({id:e.id,kind,...event,steering:{kind:e.steeringEpisode?.kind??null,phase:e.steeringEpisode?.phase??null}});");
 expected=expected.replace("abilityAudit.push({id:e.id,...decision.audit,eligible,preStep:","abilityAudit.push({id:e.id,...decision.audit,eligible,activatedDuringCollisionRecovery:kind==='bounce'&&decision.audit.activated===true&&['contact','contact-recovery'].includes(e.steeringEpisode?.kind),preStep:");
 expected=expected.replace("phases:{[a.id]:phase(a),[b.id]:phase(b)}});return {eligible:false};", "phases:{[a.id]:phase(a),[b.id]:phase(b)},steering:{[a.id]:{kind:a.steeringEpisode?.kind??null,phase:a.steeringEpisode?.phase??null},[b.id]:{kind:b.steeringEpisode?.kind??null,phase:b.steeringEpisode?.phase??null}}});return {eligible:false};");
 expected=expected.replace("      const before=records.length;\n      resolveOneDuckContact", "      const steeringBefore=Object.fromEntries([byId[item.a],byId[item.b]].map(e=>[e.id,{kind:e.steeringEpisode?.kind??null,phase:e.steeringEpisode?.phase??null}]));\n      const before=records.length;\n      resolveOneDuckContact");
 expected=expected.replace("added[0].studyContactPhases=contactNow.phases;}","added[0].studyContactPhases=contactNow.phases;added[0].studySteeringAtContact=steeringBefore;}");
 assert.notEqual(expected,old); assert.equal((await readFile(new URL('bounce-concurrent-adapter.mjs',dir),'utf8')).replaceAll('\r\n','\n'),expected);
});
