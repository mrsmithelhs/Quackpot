import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLife, transitionLife } from './life-progression.mjs';
import { renGraphNode, REN_RESPONSE_LINES } from './life-social-dialogue.mjs';
function fixture(activity='game',seating='couch',broken=false,accepted=true) {
 const life=initialLife();life.day=2;life.phase='evening';life.meals['d2-dinner']='buy';life.rent.status='paid';
 let s={life,cash:100,health:50};s=act(s,{type:'social46_activate',version:1,revision:2});
 s.life.social46.introShown=true;
 if(activity==='repair') {s.life.social46.relationship='strained';if(broken)s.life.social46.history=[{id:'old',outcome:'broken'}];}
 if(seating==='floor')s.life.sold.push('couch');
 s=act(s,{type:'social46_offer',day:2,initiator:'player',activity});const id=s.life.social46.pending.id;
 s=act(s,{type:'social46_offer_shown',id});if(accepted)s=act(s,{type:'social46_reply',id,choice:'accept'});
 return {s,id};
}
function act(s,intent) {const r=transitionLife(s.life,s,intent);assert.equal(r.ok,true,JSON.stringify({intent,r}));return r;}
function choose(s,id,choice) {s=act(s,{type:'social46_scene_shown',id});return act(s,{type:'social46_scene_next',id,choice});}
for(const activity of ['door','game','repair']) for(const first of ['a','b']) for(const variant of [0,1]) for(const leaf of [0,1]) {
 test(`${activity} path ${first}/${variant}/${leaf} is display-gated and earns once at Finish`,()=>{
  let {s,id}=fixture(activity,'couch',activity==='repair');const beforeHealth=s.health;
  s=act(s,{type:'social46_begin',id,dialogueVersion:1});
  assert.equal(transitionLife(s.life,s,{type:'social46_scene_next',id,choice:first}).ok,false);
  s=choose(s,id,first);s=choose(s,id,'continue');if(activity==='game')s=choose(s,id,'continue');
  const root=activity==='door'?(variant?'making':'busy'):activity==='game'?(variant?'together':'tease'):(variant?'apology':'reconnect');
  s=choose(s,id,root);let n=renGraphNode(activity,s.life.social46.scene.node,s.life.social46.scene.seating,s.life.social46.scene.hasUncommunicatedBreak);s=choose(s,id,n.choices[leaf].id);s=choose(s,id,'continue');
  assert.equal(s.health,beforeHealth);assert.equal(transitionLife(s.life,s,{type:'social46_complete',id,choice:'finish'}).ok,false);
  s=act(s,{type:'social46_scene_shown',id});s=act(s,{type:'social46_complete',id,choice:'finish'});assert.equal(s.health,55);
  assert.equal(transitionLife(s.life,s,{type:'social46_complete',id,choice:'finish'}).ok,false);
 });
}
test('floor context skips couch cue and unbroken repair cannot invent apology',()=>{
 let {s,id}=fixture('game','floor');s=act(s,{type:'social46_begin',id,dialogueVersion:1});s=choose(s,id,'a');s=choose(s,id,'continue');assert.equal(s.life.social46.scene.node,'g0');
 ({s,id}=fixture('repair','couch',false));s=act(s,{type:'social46_begin',id,dialogueVersion:1});s=choose(s,id,'a');s=choose(s,id,'continue');s=act(s,{type:'social46_scene_shown',id});assert.equal(transitionLife(s.life,s,{type:'social46_scene_next',id,choice:'apology'}).ok,false);
});
test('legacy begin remains three-beat and unknown graph versions fail',()=>{
 let {s,id}=fixture();assert.equal(transitionLife(s.life,s,{type:'social46_begin',id,dialogueVersion:9}).ok,false);s=act(s,{type:'social46_begin',id});assert.equal(s.life.social46.scene.dialogueVersion,undefined);s=act(s,{type:'social46_scene_shown',id});s=act(s,{type:'social46_scene_next',id});assert.equal(s.life.social46.scene.beat,1);
});
test('response replies require the displayed same response and cannot change history',()=>{
 let {s,id}=fixture('game','couch',false,false);s=act(s,{type:'social46_reply',id,choice:'decline'});assert.equal(transitionLife(s.life,s,{type:'social46_response_reply',id,choice:'thanks'}).ok,false);
 s=act(s,{type:'social46_response_shown',id});const history=structuredClone(s.life.social46.history);
 assert.equal(transitionLife(s.life,s,{type:'social46_response_reply',id:'wrong',choice:'thanks'}).ok,false);
 s=act(s,{type:'social46_response_reply',id,choice:'thanks'});assert.deepEqual(s.life.social46.history,history);assert.equal(s.health,50);
 assert.equal(transitionLife(s.life,s,{type:'social46_response_dismiss',id}).ok,false);
 s=act(s,{type:'social46_response_reply_shown',id});assert.equal(s.events.find(x=>x.type==='social46_display').payload.text,REN_RESPONSE_LINES.response_declined.thanks);s=act(s,{type:'social46_response_dismiss',id});assert.equal(s.life.social46.response,null);
});



test('new graph and old unversioned scene each replay from actual revision2 envelopes',async()=>{
 const {GameEngine}=await import('./game-engine.mjs');const {validateSave}=await import('./storage.mjs');
 const e=new GameEngine('synthetic-ren-graph',{lifePolicy:true});e.start();e.setupCompanion();
 const step=intent=>assert.equal(e.applyLifeIntent(intent).ok,true,JSON.stringify(intent));
 for(const intent of [{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'advance'},{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'social46_activate',version:1,revision:2},{type:'social46_knock_shown'},{type:'social46_door_open'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'meet'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'glad'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'continue'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'thanks'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'finish'},{type:'social46_offer',day:2,initiator:'player',activity:'game'}])step(intent);
 const id=e.state.life.social46.pending.id;step({type:'social46_offer_shown',id});step({type:'social46_reply',id,choice:'accept'});
 const legacy=GameEngine.fromEnvelope(e.toEnvelope());assert.equal(legacy.applyLifeIntent({type:'social46_begin',id}).ok,true);let legacyEnv=legacy.toEnvelope();assert.equal(validateSave(legacyEnv).valid,true,JSON.stringify(validateSave(legacyEnv).errors));
 step({type:'social46_begin',id,dialogueVersion:1});const before=e.toEnvelope();const beforeRng=JSON.stringify(before.prngStreams);
 for(const choice of ['a','continue','continue','together','learn','continue']) {step({type:'social46_scene_shown',id});step({type:'social46_scene_next',id,choice});}
 let env=e.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));assert.equal(JSON.stringify(env.prngStreams),beforeRng);assert.equal(env.state.health,before.state.health);
 const resumed=GameEngine.fromEnvelope(env);assert.equal(resumed.applyLifeIntent({type:'social46_scene_shown',id}).ok,true);assert.equal(resumed.applyLifeIntent({type:'social46_complete',id,choice:'finish'}).ok,true);
 env=resumed.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));assert.equal(env.state.health,Math.min(before.state.health+5,100));
});


test('every response kind and both reply choices are finite and outcome-neutral',()=>{
 for(const [kind,choices] of Object.entries(REN_RESPONSE_LINES)) for(const choice of Object.keys(choices)) {
  let {s,id}=fixture('game','couch',false,false);s=act(s,{type:'social46_reply',id,choice:'decline'});
  s.life.social46.response.kind=kind;s=act(s,{type:'social46_response_shown',id});const before=structuredClone(s.life.social46.history);
  s=act(s,{type:'social46_response_reply',id,choice});s=act(s,{type:'social46_response_reply_shown',id});
  assert.deepEqual(s.life.social46.history,before);assert.equal(s.health,50);assert.equal(s.events.find(e=>e.type==='social46_display').payload.text,choices[choice]);
  s=act(s,{type:'social46_response_dismiss',id});assert.equal(s.life.social46.response,null);
 }
});
test('repair apology condition excludes all non-break outcomes',()=>{
 for(const outcome of ['declined','notice','recovery_exempt','unanswered','neutral','honored']) {
  let {s,id}=fixture('repair','couch',false);s.life.social46.history=[{id:'prior',outcome}];s=act(s,{type:'social46_begin',id,dialogueVersion:1});
  assert.equal(s.life.social46.scene.hasUncommunicatedBreak,false,outcome);
 }
});

test('reply message and original direct close replay from actual revision2 envelopes',async()=>{
 const {GameEngine}=await import('./game-engine.mjs');const {validateSave}=await import('./storage.mjs');const e=new GameEngine('synthetic-ren-reply',{lifePolicy:true});e.start();e.setupCompanion();
 const step=i=>assert.equal(e.applyLifeIntent(i).ok,true,JSON.stringify(i));
 for(const i of [{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'advance'},{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'social46_activate',version:1,revision:2},{type:'social46_knock_shown'},{type:'social46_door_open'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'meet'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'glad'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'continue'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'thanks'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'finish'},{type:'social46_offer',day:2,initiator:'player',activity:'door'}])step(i);
 const id=e.state.life.social46.pending.id;step({type:'social46_offer_shown',id});step({type:'social46_reply',id,choice:'decline'});step({type:'social46_response_shown',id});
 const old=GameEngine.fromEnvelope(e.toEnvelope());assert.equal(old.applyLifeIntent({type:'social46_response_dismiss',id}).ok,true);assert.equal(validateSave(old.toEnvelope()).valid,true);
 step({type:'social46_response_reply',id,choice:'thanks'});step({type:'social46_response_reply_shown',id});let env=e.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));
 const restored=GameEngine.fromEnvelope(env);assert.equal(restored.applyLifeIntent({type:'social46_response_dismiss',id}).ok,true);env=restored.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));
});

for(const [original,alternative] of [['door','game'],['game','door']]) test(`shown Ren ${original} offer can be counter-suggested once as ${alternative}`,()=>{
 const life=initialLife();life.day=2;life.phase='evening';life.meals['d2-dinner']='buy';life.rent.status='paid';let s={life,cash:100,health:50};
 s=act(s,{type:'social46_activate',version:1,revision:2});s.life.social46.introShown=true;
 s=act(s,{type:'social46_offer',day:2,initiator:'ren',activity:original});const id=s.life.social46.pending.id;
 const suggest={type:'social46_suggest_activity',id,activity:alternative};
 assert.equal(transitionLife(s.life,s,suggest).ok,false);s=act(s,{type:'social46_offer_shown',id});
 assert.equal(transitionLife(s.life,s,{...suggest,id:'wrong'}).ok,false);assert.equal(transitionLife(s.life,s,{...suggest,activity:original}).ok,false);assert.equal(transitionLife(s.life,s,{...suggest,activity:'repair'}).ok,false);
 const startHealth=s.health;s=act(s,suggest);const p=s.life.social46.pending;assert.equal(p.id,id);assert.equal(p.activity,alternative);assert.equal(p.replied,true);assert.equal(p.shown,false);assert.equal(s.health,startHealth);assert.equal(s.life.anchor,null);
 assert.equal(transitionLife(s.life,s,{type:'social46_reply',id,choice:'accept'}).ok,false);assert.equal(transitionLife(s.life,s,{...suggest,activity:original}).ok,false);
 let beforeShown=act(s,{type:'advance'});assert.equal(beforeShown.life.social46.history.at(-1).outcome,'neutral');assert.equal(beforeShown.life.social46.unanswered,0);
 s=act(s,{type:'social46_offer_shown',id});assert.equal(s.events.find(e=>e.type==='social46_display').payload.kind,'suggestion_response');
 assert.equal(transitionLife(s.life,s,{...suggest,activity:original}).ok,false);
 let ignored=act(s,{type:'advance'});assert.equal(ignored.life.social46.history.at(-1).outcome,'neutral');assert.equal(ignored.life.social46.unanswered,0);
 let declined=act(s,{type:'social46_reply',id,choice:'decline'});assert.equal(declined.life.social46.history.at(-1).outcome,'declined');
 let committed=act(s,{type:'social46_reply',id,choice:'accept'});assert.equal(transitionLife(committed.life,committed,{...suggest,activity:original}).ok,false);committed=act(committed,{type:'advance',socialConflict:'continue'});assert.equal(committed.life.social46.history.at(-1).outcome,'broken');
});

test('counterproposal retains both displayed facts and replays at each explicit boundary',async()=>{
 const {GameEngine}=await import('./game-engine.mjs');const {validateSave}=await import('./storage.mjs');const {projectReceipt}=await import('./receipt.mjs');
 const e=new GameEngine('synthetic-ren-counterproposal',{lifePolicy:true});e.start();e.setupCompanion();const step=i=>assert.equal(e.applyLifeIntent(i).ok,true,JSON.stringify(i));
 for(const i of [{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'advance'},{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'social46_activate',version:1,revision:2},{type:'social46_knock_shown'},{type:'social46_door_open'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'meet'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'glad'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'continue'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'thanks'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'finish'},{type:'social46_offer',day:2,initiator:'ren',activity:'door'}])step(i);
 const id=e.state.life.social46.pending.id;step({type:'social46_offer_shown',id});const before=e.toEnvelope();step({type:'social46_suggest_activity',id,activity:'game'});let env=e.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));assert.deepEqual(env.prngStreams,before.prngStreams);assert.equal(env.state.health,before.state.health);
 step({type:'social46_offer_shown',id});step({type:'social46_reply',id,choice:'accept'});env=e.toEnvelope();assert.equal(validateSave(env).valid,true,JSON.stringify(validateSave(env).errors));
 const social=env.eventLog.filter(x=>x.type==='social46_display'&&['invitation','suggestion_response'].includes(x.payload.kind));assert.deepEqual(social.map(x=>x.payload.kind),['invitation','suggestion_response']);assert.deepEqual(social.map(x=>x.payload.activity),['door','game']);
 const projected=projectReceipt(env.eventLog);assert.ok(JSON.stringify(projected).includes('suggested a different activity')||JSON.stringify(projected).includes('Suggested a different activity'));
});
