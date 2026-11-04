import test from 'node:test';
import assert from 'node:assert/strict';
import { applyContactInjury, injuryTargetForTick } from './follow-on-adapter.mjs';
import { selectFavorite, updateAfterRace, chooseRivals } from './follow-on-state.mjs';
const input={seed:'follow-fixture',raceId:'R01',followOn:{mode:'same-race',entrants:{P:{stance:'steady',guard:true,injuredBefore:false},A:{stance:'sprint',guard:false,injuredBefore:false}}}};
test('participant keys, conditional Guard and no prior-draw coupling',()=>{const participants=[{id:'P'},{id:'A'}],keys=[];const out=applyContactInjury(participants,input,9,'contact-9',keys);assert.equal(out[0].probability,.1);assert.equal(out[1].probability,.4);assert.notEqual(out[0].key,out[1].key);assert.deepEqual(out,applyContactInjury([{id:'P'},{id:'A'}],input,9,'contact-9',[]));assert.ok(out.every(x=>!x.sameRaceApplied||x.onsetTick===9));});
test('effective rating selection and rival fallback',()=>{const d={f:{rating:10,rest:.5,injured:false},a:{rating:10,rest:.75,injured:true},b:{rating:10,rest:.5,injured:false}};assert.equal(selectFavorite(d,'f'),'a');d.f.rest=1;assert.equal(selectFavorite(d,'f'),'f');const rivals=Object.fromEntries(['A','B','C','D','E','F'].map(id=>[id,{injured:id==='A'}]));assert.deepEqual(chooseRivals(rivals,['A','B','C','D','E','F']),['B','C','D','E','F']);});
test('unresolved rolls back and absent participant recovers only on completion',()=>{const state={ducks:{P:{injured:true},A:{injured:true}},events:[]};const event={seed:'s',raceId:'R1',field:['P'],contact:[]};assert.deepEqual(updateAfterRace(state,{...event,status:'unresolved'}),state);const done=updateAfterRace(state,{...event,status:'finished'});assert.equal(done.ducks.A.injured,false);assert.equal(state.ducks.A.injured,true);});

test('onset does not change target at the collision tick',()=>{assert.equal(injuryTargetForTick(10,9,9),10);assert.equal(injuryTargetForTick(10,9,10),9.5);assert.equal(injuryTargetForTick(10,undefined,10),10);});

test('one post-race transition applies participant results without stacking injury',()=>{const state={ducks:{P:{injured:true},A:{injured:false}},events:[]};const done=updateAfterRace(state,{status:'finished',seed:'s',raceId:'R1',field:['P','A'],contact:[{id:'P',injured:true},{id:'A',injured:true}]});assert.equal(done.ducks.P.injured,true);assert.equal(done.ducks.A.injured,true);assert.equal(done.events.length,2);assert.equal(state.events.length,0);});

test('leader counterfactual retains the injury effect with normal or assisted acceleration',()=>{const noLeader=injuryTargetForTick(12,9,10);const leader=injuryTargetForTick(12*.8,9,10);assert.equal(noLeader,11.399999999999999);assert.ok(Math.abs(leader-9.12)<1e-12);for(const acceleration of [3,5]){const before=8;const ref=Math.min(noLeader,before+acceleration*.05);const actual=Math.min(leader,before+acceleration*.05);assert.equal(ref-actual,0);}});


test('completed race cannot be committed twice',()=>{const state={ducks:{P:{injured:false}},events:[]},x={status:'finished',seed:'s',raceId:'R1',field:['P'],contact:[]};const done=updateAfterRace(state,x);assert.throws(()=>updateAfterRace(done,x),/already committed/);});
test('injury keys carry stable participant identities across field slots',()=>{const a=structuredClone(input);a.followOn.entrants.P.stableId='duck-0';a.followOn.entrants.A.stableId='r4';const out=applyContactInjury([{id:'P'},{id:'A'}],a,9,'contact-9',[]);assert.equal(out[1].stableId,'r4');assert.ok(out[1].key.includes('/r4/injury'));});
