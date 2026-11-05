import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeResult} from '../core/race-v2/codec.mjs';
import {projectRaceV2,raceV2VisualState,raceV2DuckPresentation,unresolvedRaceMarkup,reorderRaceCandidates} from './race-v2-presentation.mjs';

test('v2 projection preserves real crossings and gates cues to actual committed events',async()=>{
  const fixture=JSON.parse(readFileSync(new URL('../../reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-mixed.json',import.meta.url)));
  const result=await decodeResult(fixture.envelope),attempt={status:'finished',finishOrder:result.crossings.map((c,i)=>({id:c.id,place:i+1,payout:[50,20,10,0,0,0][i]}))};
  const projected=projectRaceV2(result,attempt);assert.equal(projected.mechanicalVersion,'integer-working/v1');assert.deepEqual(projected.finish.map(e=>e.id),result.crossings.map(e=>e.id));
  for(let i=0;i<result.crossings.length;i++){const c=result.crossings[i],expected=(Number(c.stepStart)+Number(c.stepDuration)*Number(c.numerator)/Number(c.denominator))/1e6;assert.equal(projected.finishCrossings[i].crossingTimeSeconds,expected);}
  const contact=projected.eventRecords.find(e=>e.type==='duck-contact');assert.ok(contact);assert.equal(raceV2VisualState(projected,contact.participants[0],contact.time-.000001).contactAge,null);
  assert.equal(raceV2VisualState(projected,contact.participants[0],contact.time).contactAge,0);
  const start=projected.eventRecords.find(e=>e.type==='ability-start');assert.equal(raceV2VisualState(projected,start.participants[0],start.time).ability.kind,start.details[0]);
  const end=projected.eventRecords.find(e=>e.type==='ability-end'&&e.participants[0]===start.participants[0]);assert.equal(raceV2VisualState(projected,start.participants[0],end.time).ability,null);
  assert.throws(()=>projectRaceV2({...result,status:'unresolved'},attempt),/finished/);
});
test('race and Dex preview use the shared injury and upgrade rating',()=>{
  const d={progress:1,banked:1,assigned:null,recoveryDays:2,firstPointEarned:true};
  assert.equal(raceV2DuckPresentation(d,10,.75,2,true,true).injuredRating,7.0875);
  assert.equal(raceV2DuckPresentation(d,10,.75,2,false,true).injuredRating,6.75);
});
test('unresolved copy does not invent a finish or podium',()=>{const html=unresolvedRaceMarkup(false);assert.match(html,/No finish place or finish reward was awarded/);assert.match(html,/data-race-proceed/);assert.doesNotMatch(html,/data-race-podium/);});
test('repeated visibility updates do not detach focus and a real reorder restores it',()=>{
  const doc={activeElement:null},input={checked:true,focusCalls:0,focus(options){assert.deepEqual(options,{preventScroll:true});this.focusCalls++;doc.activeElement=this;}},other={};
  const a={contains:e=>e===input},b={contains:e=>e===other},note={},list={ownerDocument:doc,cards:[a,b],moves:0,querySelectorAll:()=>list.cards,
    insertBefore(card,after){assert.equal(after,note);this.moves++;this.cards=this.cards.filter(x=>x!==card);this.cards.push(card);if(card.contains(doc.activeElement))doc.activeElement=null;}};
  doc.activeElement=input;for(let i=0;i<5;i++)assert.equal(reorderRaceCandidates(list,[a,b],note),false);
  assert.equal(list.moves,0);assert.equal(doc.activeElement,input);assert.equal(input.checked,true);
  assert.equal(reorderRaceCandidates(list,[b,a],note),true);assert.deepEqual(list.cards,[b,a]);assert.equal(doc.activeElement,input);assert.equal(input.focusCalls,1);
  assert.equal(reorderRaceCandidates(list,[b,a],note),false);assert.equal(input.focusCalls,1);assert.equal(input.checked,true);
});
