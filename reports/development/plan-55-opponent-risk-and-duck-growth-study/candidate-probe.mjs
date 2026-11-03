import assert from 'node:assert/strict';
import { resolveSeededRace } from './race-adapter.mjs';
import { rivalChoices, burstActive, completeRace, assignPoint, playerContactFromResolution } from './candidate.mjs';
const seed='plan55-candidate-endpoints',raceId='R01';
const base={seed,raceId,playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1};
const control=resolveSeededRace(base);
const low=resolveSeededRace({...base,candidateRivalChoices:rivalChoices(seed,raceId,0)});
const high=resolveSeededRace({...base,candidateRivalChoices:rivalChoices(seed,raceId,1)});
for(const id of ['A','B','C','D','E']) {
  const c=control.entrants.find(x=>x.id===id), l=low.entrants.find(x=>x.id===id), h=high.entrants.find(x=>x.id===id);
  assert.equal(l.sampledPerformance,c.sampledPerformance); assert.equal(h.performanceDraw,c.performanceDraw);
  assert.equal(h.sampledPerformance,Math.round(8*(1+(2*c.performanceDraw-1)*0.2)*1000)/1000);
}
assert.equal(high.entrants.find(x=>x.id==='P').sampledPerformance,control.entrants.find(x=>x.id==='P').sampledPerformance);
let s={ducks:{d:{injured:false,completed:0,banked:0,ability:null}},events:[]};
const input={status:'finished',duckId:'d',stance:'steady',playerContact:false,seed,raceId};
assert.equal(burstActive(seed,raceId,'d',s.ducks.d),false);
assert.deepEqual(completeRace(s,{...input,status:'unresolved',playerContact:true}),s);
for(let i=0;i<3;i++) s=completeRace(s,{...input,raceId:`R${i}`});
s=assignPoint(s,'d','burst');assert.equal(typeof burstActive(seed,raceId,'d',s.ducks.d),'boolean');
assert.equal(completeRace(s,input).events.at(-1).injuryRollEligible,false);
assert.equal(playerContactFromResolution({status:'finished',eventRecords:[{type:'duck-contact',participants:['A','B']}]}),false);
assert.equal(playerContactFromResolution({status:'finished',eventRecords:[{type:'duck-contact',participants:['P','B']}]}),true);
assert.equal(playerContactFromResolution({status:'unresolved',eventRecords:[{type:'duck-contact',participants:['P','B']}]}),false);
process.stdout.write(JSON.stringify({resolverCalls:3,checks:'endpoint spreads, player unchanged, unearned and earned ability, unresolved and no-player-contact'})+'\n');


