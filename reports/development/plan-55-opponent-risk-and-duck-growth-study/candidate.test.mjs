import test from 'node:test';
import assert from 'node:assert/strict';
import { rivalChoices, burstActive, ratingForRace, completeRace, assignPoint, earlyBed } from './candidate.mjs';
const fresh = () => ({ducks:{one:{injured:false,completed:0,banked:0,ability:null},two:{injured:true,completed:0,banked:0,ability:null}},events:[]});
const race = (n, extra={}) => ({status:'finished',duckId:'one',ability:null,stance:'steady',playerContact:false,seed:'check',raceId:`R${n}`,...extra});
test('seeded choices and burst are repeatable and independent of calls', () => {
  const a=rivalChoices('s','R1',0.2); burstActive('s','R1','one',{ability:'burst'});
  assert.deepEqual(rivalChoices('s','R1',0.2),a);
  assert.deepEqual(Object.values(rivalChoices('s','R1',0)),Array(5).fill('steady'));
  assert.deepEqual(Object.values(rivalChoices('s','R1',1)),Array(5).fill('sprint'));
  assert.equal(burstActive('s','R1','one',{ability:null}),false);
});
test('only completed races earn one point per duck and assignment is permanent', () => {
  let s=fresh(); assert.deepEqual(completeRace(s,race(1,{status:'unresolved'})),s);
  for(let i=1;i<=3;i++) s=completeRace(s,race(i));
  assert.equal(s.ducks.one.banked,1); assert.equal(s.ducks.two.banked,0);
  s=assignPoint(s,'one','guard'); assert.throws(()=>assignPoint(s,'one','burst'),/unavailable/);
  s=completeRace(s,race(4)); assert.equal(s.ducks.one.banked,0); assert.equal(s.ducks.one.ability,'guard');
});
test('injury is contact gated and existing injury uses extension before new injury', () => {
  let s=fresh(); s.ducks.one.injured=true;
  const noContact=completeRace(s,race(1));
  assert.equal(noContact.events[0].newInjury,false); assert.equal(noContact.events[0].injuryRollEligible,false);
  assert.equal(noContact.ducks.one.injured,noContact.events[0].extended);
  const unearned=completeRace(s,race(1,{playerContact:true,ability:'guard',stance:'sprint'}));
  assert.equal(unearned.events[0].injuryProbability,0.4);
  let earned=fresh();
  for(let i=1;i<=3;i++) earned=completeRace(earned,race(i));
  earned=assignPoint(earned,'one','guard'); earned.ducks.one.injured=true;
  const contact=completeRace(earned,race(4,{playerContact:true,stance:'sprint'}));
  assert.equal(contact.events.at(-1).injuryProbability,0.2);
  assert.equal(contact.ducks.one.injured,contact.events.at(-1).extended || contact.events.at(-1).newInjury);
  assert.equal(contact.ducks.two.injured,false);
  assert.throws(()=>completeRace(s,race(2,{stance:'reckless'})),/invalid stance/);
});
test('stacking and early bed have explicit candidate effects', () => {
  assert.equal(ratingForRace(10,0.5,true,true),4.95);
  const s=fresh(); s.ducks.one.injured=true;
  assert.equal(earlyBed(s).ducks.one.injured,false); assert.equal(s.ducks.one.injured,true);
});


