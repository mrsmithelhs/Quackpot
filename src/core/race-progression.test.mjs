import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRaceProgress,recoverRaceDays,buildRaceV2Input,applyRaceV2Facts} from './race-progression.mjs';
import {draw} from './race-v2/codec.mjs';

test('day admission recovers before entry and new injury is not decremented',()=>{
  const before=initialRaceProgress();before.ducks.duck={progress:1,banked:0,assigned:'bounce',recoveryDays:1,firstPointEarned:false};
  const entered=recoverRaceDays(before,1),input=buildRaceV2Input({seed:'seed',raceId:'R01',duckId:'duck',baseRating:10,fieldRating:8,restFactor:1,trialCommitted:false,stance:'safe',progress:entered});
  assert.equal(input.entrants.find(e=>e.id==='P').entryInjury,false);assert.equal(input.entrants.find(e=>e.id==='P').ability,'bounce');
  const result={status:'finished',entrants:[{id:'P',injured:true}],crossings:[{id:'P',place:'1'}]};
  const after=applyRaceV2Facts(entered,{seed:'seed',raceId:'R01',duckId:'duck'},result);
  assert.equal(after.progress.ducks.duck.recoveryDays,2);assert.equal(after.progress.ducks.duck.banked,1);assert.equal(after.progress.ducks.duck.progress,0);
  assert.equal(after.earned,3);assert.equal(after.payoutGems,50);assert.equal(after.extensionRoll,null);assert.equal(before.ducks.duck.recoveryDays,1);
});

test('unresolved attempts retain injury but do not award progress or extension',()=>{
  const p=initialRaceProgress(),r=applyRaceV2Facts(p,{seed:'seed',raceId:'R02',duckId:'duck'},
    {status:'unresolved',entrants:[{id:'P',injured:true}],crossings:[{id:'P',place:null}]});
  assert.equal(r.place,null);assert.equal(r.payoutGems,0);assert.equal(r.earned,0);assert.equal(r.extensionRoll,null);assert.equal(r.progress.ducks.duck.recoveryDays,2);
});

test('only a completed race entered injured evaluates the keyed extension once',()=>{
  const p=initialRaceProgress();p.ducks.duck={progress:0,banked:0,assigned:null,recoveryDays:1,firstPointEarned:false};
  const event={seed:'fixed-extension',raceId:'R03',duckId:'duck'},result={status:'finished',entrants:[{id:'P',injured:true}],crossings:[{id:'P',place:'4'}]};
  const value=applyRaceV2Facts(p,event,result),roll=draw(event.seed,event.raceId,'recovery-extension',['duck']).value;
  assert.equal(value.extensionRoll,roll.toString());assert.equal(value.extension,roll*4n<4294967296n);
  assert.equal(value.progress.ducks.duck.recoveryDays,value.extension?2:1);assert.equal(p.ducks.duck.recoveryDays,1);
  const unresolved=applyRaceV2Facts(p,event,{...result,status:'unresolved',crossings:[]});assert.equal(unresolved.extensionRoll,null);assert.equal(unresolved.progress.ducks.duck.recoveryDays,1);
});
