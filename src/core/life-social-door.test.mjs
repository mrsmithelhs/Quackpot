import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLife, transitionLife } from './life-progression.mjs';
function fixture() { const life=initialLife(); life.day=2; life.phase='evening'; life.meals['d2-dinner']='buy';life.rent.status='paid'; return {life,cash:100,health:50}; }
function act(s,intent) { const next=transitionLife(s.life,s,intent); assert.equal(next.ok,true,JSON.stringify(next)); return next; }
const activate=s=>act(s,{type:'social46_activate',version:1,revision:2});
const shown=s=>act(s,{type:'social46_intro_line_shown'});
const choose=(s,choice)=>act(s,{type:'social46_intro_choose',choice});
test('ignored first knock is neutral, suppressed today and available on a later day',()=>{
 let s=activate(fixture()); s=act(s,{type:'social46_knock_shown'});s=act(s,{type:'social46_knock_ignore'});
 assert.equal(s.life.social46.unanswered,0);assert.deepEqual(s.life.social46.history,[]);assert.equal(s.life.social46.relationship,'connected');
 assert.equal(transitionLife(s.life,s,{type:'social46_knock_shown'}).ok,false);
 s=act(s,{type:'advance'});s=act(s,{type:'social46_knock_shown'});assert.equal(s.life.social46.intro.knockDay,3);
});
test('number display and final response gate offers; dialogue is time and health neutral',()=>{
 let s=activate(fixture());s=act(s,{type:'social46_knock_shown'});s=act(s,{type:'social46_door_open'});s=shown(s);s=choose(s,'meet');s=shown(s);s=choose(s,'making');s=shown(s);s=choose(s,'continue');s=shown(s);
 assert.equal(s.life.social46.intro.numberShared,true);assert.equal(s.life.social46.introShown,false);
 assert.equal(transitionLife(s.life,s,{type:'social46_offer',day:2,initiator:'ren',activity:'door'}).ok,false);
 s=choose(s,'thanks');s=shown(s);s=choose(s,'finish');assert.equal(s.life.social46.introShown,true);assert.equal(s.health,50);assert.equal(s.life.anchor,null);assert.equal(s.life.day,2);
 assert.equal(transitionLife(s.life,s,{type:'social46_intro_choose',choice:'finish'}).ok,false);
});
test('close and normal life transition preserve the unfinished dialogue cursor',()=>{
 let s=activate(fixture());s=act(s,{type:'social46_knock_shown'});s=act(s,{type:'social46_door_open'});s=shown(s);s=choose(s,'why');s=shown(s);s=act(s,{type:'social46_intro_close'});
 s=act(s,{type:'advance'});assert.equal(s.life.social46.intro.node,'reason');assert.equal(s.life.social46.introShown,false);
 s=act(s,{type:'social46_door_open'});assert.equal(s.life.social46.intro.node,'reason');assert.equal(transitionLife(s.life,s,{type:'social46_intro_line_shown'}).ok,false);
});

test('revision 2 partial and completed introductions replay in actual envelopes', async()=>{
 const {GameEngine}=await import('./game-engine.mjs');const {validateSave}=await import('./storage.mjs');
 const e=new GameEngine('synthetic-ren-door-v2',{lifePolicy:true});e.start();e.setupCompanion();
 const step=intent=>assert.equal(e.applyLifeIntent(intent).ok,true,JSON.stringify(intent));
 step({type:'meal',choice:'buy'});step({type:'advance'});step({type:'advance'});step({type:'meal',choice:'buy'});step({type:'advance'});
 step({type:'social46_activate',version:1,revision:2});step({type:'social46_knock_shown'});step({type:'social46_door_open'});step({type:'social46_intro_line_shown'});
 let env=e.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));
 const resumed=GameEngine.fromEnvelope(env);const run=intent=>assert.equal(resumed.applyLifeIntent(intent).ok,true,JSON.stringify(intent));
 for(const intent of [{type:'social46_intro_choose',choice:'meet'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'glad'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'continue'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'thanks'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'finish'}]) run(intent);
 env=resumed.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));assert.equal(env.state.life.social46.introShown,true);
});

function plannedVisit({dinner=false,day=2,planDay=2}={}) {
 let s=fixture();if(!dinner)delete s.life.meals['d2-dinner'];s.life.day=day;s=activate(s);s.life.social46.introShown=true;
 s=act(s,{type:'social46_offer',day:planDay,initiator:'ren',activity:'door'});const id=s.life.social46.pending.id;
 s=act(s,{type:'social46_offer_shown',id});s=act(s,{type:'social46_reply',id,choice:'accept'});return {s,id};
}
test('planned door arrival remains free until shown, opened, dinner and marked welcome',()=>{
 let {s,id}=plannedVisit();const before=structuredClone(s);
 assert.equal(transitionLife(s.life,s,{type:'social46_visit_open',id}).ok,false);
 assert.equal(transitionLife(s.life,s,{type:'social46_visit_knock_shown',id:'wrong'}).ok,false);
 s=act(s,{type:'social46_visit_knock_shown',id});assert.equal(s.life.anchor,null);assert.equal(s.health,before.health);
 assert.equal(transitionLife(s.life,s,{type:'social46_visit_knock_shown',id}).ok,false);
 s=act(s,{type:'social46_visit_open',id});assert.equal(s.life.anchor,null);assert.equal(s.health,before.health);
 assert.equal(transitionLife(s.life,s,{type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1}).ok,false);
 s=act(s,{type:'social46_visit_arrival_shown',id});assert.equal(transitionLife(s.life,s,{type:'social46_visit_arrival_shown',id}).ok,false);
 assert.equal(transitionLife(s.life,s,{type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1}).ok,false);
 s=act(s,{type:'meal',choice:'buy'});assert.equal(transitionLife(s.life,s,{type:'social46_begin',id,arrivalVersion:1}).ok,false);s=act(s,{type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1});assert.equal(s.life.anchor,id);assert.equal(s.life.phase,'evening');assert.equal(s.health,before.health);
});
test('ignoring a planned knock does not break it until a competing commitment is confirmed',()=>{
 let {s,id}=plannedVisit({dinner:true});s=act(s,{type:'social46_visit_knock_shown',id});s=act(s,{type:'social46_visit_ignore',id});
 assert.equal(s.life.social46.pending.committed,true);assert.deepEqual(s.life.social46.history,[]);
 assert.equal(transitionLife(s.life,s,{type:'social46_visit_ignore',id}).ok,false);
 const reopened=act(s,{type:'social46_visit_open',id});assert.equal(reopened.life.social46.pending.arrival.open,true);
 assert.equal(transitionLife(s.life,s,{type:'advance'}).reason,'social_conflict');
 s=act(s,{type:'advance',socialConflict:'continue'});assert.equal(s.life.social46.history.at(-1).outcome,'broken');
});
test('future, canceled, blocked and invalid arrivals never fabricate a knock',()=>{
 let {s,id}=plannedVisit({dinner:true,planDay:3});assert.equal(transitionLife(s.life,s,{type:'social46_visit_knock_shown',id}).ok,false);
 ({s,id}=plannedVisit({dinner:true}));s=act(s,{type:'social46_cancel',id});assert.equal(transitionLife(s.life,s,{type:'social46_visit_knock_shown',id}).ok,false);
 ({s,id}=plannedVisit({dinner:true}));s.life.recovery={id:'recovery-synthetic',recovered:false};assert.equal(transitionLife(s.life,s,{type:'social46_visit_knock_shown',id}).ok,false);
 ({s,id}=plannedVisit({dinner:true}));assert.equal(transitionLife(s.life,s,{type:'social46_begin',id,dialogueVersion:1,arrivalVersion:2}).ok,false);
});
test('rescheduling an opened arrival clears only its new arrival marker',()=>{
 let {s,id}=plannedVisit({dinner:true});s=act(s,{type:'social46_visit_knock_shown',id});s=act(s,{type:'social46_visit_open',id});s=act(s,{type:'social46_visit_arrival_shown',id});
 s=act(s,{type:'social46_reschedule_plan',id,day:3});assert.equal(s.life.social46.pending.arrival,undefined);assert.equal(s.life.social46.pending.day,3);
});

test('planned arrival, open and marked welcome replay in real revision2 envelopes',async()=>{
 const {GameEngine}=await import('./game-engine.mjs');const {validateSave}=await import('./storage.mjs');const {projectReceipt}=await import('./receipt.mjs');
 const e=new GameEngine('synthetic-ren-visit-door',{lifePolicy:true});e.start();e.setupCompanion();const step=i=>assert.equal(e.applyLifeIntent(i).ok,true,JSON.stringify(i));
 for(const i of [{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'advance'},{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'social46_activate',version:1,revision:2},{type:'social46_knock_shown'},{type:'social46_door_open'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'meet'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'glad'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'continue'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'thanks'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'finish'},{type:'social46_offer',day:2,initiator:'ren',activity:'door'}])step(i);
 const id=e.state.life.social46.pending.id;step({type:'social46_offer_shown',id});step({type:'social46_reply',id,choice:'accept'});const before=e.toEnvelope();step({type:'social46_visit_knock_shown',id});step({type:'social46_visit_open',id});
 const unmarked=GameEngine.fromEnvelope(e.toEnvelope());assert.equal(unmarked.applyLifeIntent({type:'social46_visit_arrival_shown',id}).ok,true);assert.equal(validateSave(unmarked.toEnvelope()).valid,true);
 step({type:'social46_visit_arrival_shown',id,lookVersion:1});let env=e.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));assert.deepEqual(env.prngStreams,before.prngStreams);assert.equal(env.state.health,before.state.health);assert.equal(env.state.life.anchor,null);assert.equal(env.state.life.social46.pending.arrival.look,'cardigan');
 assert.equal(e.applyLifeIntent({type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1}).ok,false);
 const resumed=GameEngine.fromEnvelope(env);assert.equal(resumed.applyLifeIntent({type:'meal',choice:'buy'}).ok,true);assert.equal(resumed.applyLifeIntent({type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1}).ok,true);env=resumed.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));assert.equal(env.state.life.anchor,id);
 const displays=env.eventLog.filter(x=>x.type==='social46_display'&&['visit_knock','visit_arrival'].includes(x.payload.kind));assert.deepEqual(displays.map(x=>x.payload.kind),['visit_knock','visit_arrival']);assert.ok(JSON.stringify(projectReceipt(env.eventLog)).includes('Ren’s arrival at the door'));
});

test('marked arrival freezes the outfit actually displayed and carries it into the door scene',()=>{
 let {s,id}=plannedVisit({dinner:true});s=act(s,{type:'social46_visit_knock_shown',id});s=act(s,{type:'social46_visit_open',id});
 assert.equal(transitionLife(s.life,s,{type:'social46_visit_arrival_shown',id,lookVersion:2}).ok,false);
 s=act(s,{type:'social46_visit_arrival_shown',id,lookVersion:1});assert.equal(s.life.social46.pending.arrival.look,'cardigan');
 assert.equal(s.events.find(e=>e.type==='social46_display').payload.look,'cardigan');s=act(s,{type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1});assert.equal(s.life.social46.scene.arrivalLook,'cardigan');
});
test('couch-game arrival stays pajamas if the couch is sold after Ren appears',()=>{
 const life=initialLife();life.day=2;life.phase='evening';life.meals['d2-dinner']='buy';life.rent.status='paid';let s=activate({life,cash:100,health:50});s.life.social46.introShown=true;
 s=act(s,{type:'social46_offer',day:2,initiator:'ren',activity:'game'});const id=s.life.social46.pending.id;s=act(s,{type:'social46_offer_shown',id});s=act(s,{type:'social46_reply',id,choice:'accept'});
 s=act(s,{type:'social46_visit_knock_shown',id});s=act(s,{type:'social46_visit_open',id});s=act(s,{type:'social46_visit_arrival_shown',id,lookVersion:1});assert.equal(s.life.social46.pending.arrival.look,'pajamas');
 s=act(s,{type:'sell',asset:'couch'});assert.equal(s.life.social46.pending.arrival.look,'pajamas');s=act(s,{type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1});assert.equal(s.life.social46.scene.arrivalLook,'pajamas');assert.equal(s.life.social46.scene.seating,'floor');
});

test('zero health while choosing dinner exempts an arrived visit from a broken commitment',()=>{
 let {s,id}=plannedVisit();s.health=5;s=act(s,{type:'social46_visit_knock_shown',id});s=act(s,{type:'social46_visit_open',id});s=act(s,{type:'social46_visit_arrival_shown',id,lookVersion:1});
 s=act(s,{type:'meal',choice:'skip'});assert.equal(s.health,0);assert.ok(s.life.recovery);assert.equal(s.life.social46.pending,null);assert.equal(s.life.social46.history.at(-1).outcome,'recovery_exempt');
});
