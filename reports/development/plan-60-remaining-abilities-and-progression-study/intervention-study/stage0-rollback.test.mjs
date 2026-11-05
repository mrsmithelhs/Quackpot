// Fixed guarded runs; no execution until QP Orch clears Stage 0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeededRace } from './adapter.mjs';

test('injected guard after actual P intervention restores committed state and draws',()=>{
  for (const arm of ['quick-recovery','straight-shooter']) {
    let covered=0;
    for (let i=0;i<4;i++) {
      const choice=i%2?'sprint':'steady';
      const rivals=Object.fromEntries(['A','B','C','D','E'].map((id,j)=>[id,(i+j)%2?'sprint':'steady']));
      const input={seed:`p55t-screen-${String(i).padStart(3,'0')}`,raceId:'R01',playerBaseSpeed:10,fieldBaseSpeed:8,
        choice,candidateRivalChoices:rivals,trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',
        dramaArm:'R2combined-risk-only',studySprintMean:1,susceptibility:'contact',injuryBand:'medium',
        multiContact:{advice:false,risks:{P:choice,...rivals}},intervention:{arm,entryInjured:false}};
      const result=resolveSeededRace(input,{testGuardAfterIntervention:true,testObserveRollback:true});
      if(result.unresolvedReason==='multi_contact_guard' && result.guardEvidence?.eventId==='test-after-intervention-contact') {
        covered++;
        const proof=result.guardEvidence.rollbackProof;
        assert.ok(proof); assert.equal(proof.afterActualContact,true); assert.equal(proof.entrantDiff,null);
        for(const [key,value] of Object.entries(proof)) if(!['afterActualContact','entrantDiff'].includes(key)) assert.equal(value,true,`${arm} ${i} ${key}`);
      } else assert.equal(result.status,'finished',`${arm} ${i} unexpected stop: ${result.unresolvedReason}`);
    }
    assert.ok(covered>0,`${arm}: fixed seeds did not cover active-intervention rollback`);
  }
});
