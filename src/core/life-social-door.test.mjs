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
