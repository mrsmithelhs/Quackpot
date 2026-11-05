// Declared parity checks; do not execute until QP Orch clears Stage 0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeededRace as original } from '../../plan-55-opponent-risk-and-duck-growth-study/bounce-reconcile-adapter.mjs';
import { resolveSeededRace as candidate } from './adapter.mjs';

function input(seedIndex,choice,favorite) {
  const rivals={A:'steady',B:'steady',C:'steady',D:'steady',E:'steady'};
  return { seed:`p60i-${String(seedIndex).padStart(3,'0')}`, raceId:'p60i', playerBaseSpeed:favorite?14:10,
    fieldBaseSpeed:10, restFactor:1, choice, trialCommitted:false, trialMultiplier:1.05,
    experiment:'weave-rank-strong-contact', dramaArm:'R2combined-risk-only', studySprintMean:1,
    candidateRivalChoices:rivals, multiContact:{advice:true,risks:{P:choice,...rivals}} };
}
function withoutStudyMetadata(result) {
  const r=structuredClone(result);
  delete r.interventionAudit; delete r.interventionInjuryAudit; delete r.inputs.intervention;
  if (r.firstCrossingWitness?.inputs) delete r.firstCrossingWitness.inputs.intervention;
  return r;
}
for (let seed=0;seed<4;seed++) for (const favorite of [false,true]) for (const choice of ['steady','sprint']) {
  test(`legacy no-injury parity ${seed} ${favorite?'favorite':'equal'} ${choice}`,()=>{
    const base=input(seed,choice,favorite);
    const old=original(base);
    const replacement=candidate({...base,intervention:{arm:'none',entryInjured:false}});
    console.log(JSON.stringify({caseId:`p60i-${String(seed).padStart(3,'0')}/${favorite?'favorite':'equal'}/${choice}`,
      original:{status:old.status,reason:old.unresolvedReason},candidate:{status:replacement.status,reason:replacement.unresolvedReason}}));
    assert.deepStrictEqual(withoutStudyMetadata(replacement),old);
    assert.equal(old.status,'finished','matching unresolved outputs do not satisfy finish coverage');
  });
}
