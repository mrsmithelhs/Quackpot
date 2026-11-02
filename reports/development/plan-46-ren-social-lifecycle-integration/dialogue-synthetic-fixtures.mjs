// Valid engine-generated synthetic continuations; no owner storage or fabricated state.
import { GameEngine } from '../../../src/core/game-engine.mjs';
import { validateSave } from '../../../src/core/storage.mjs';
export function makeFixture(mode) {
 const e=new GameEngine(`plan46-branch-${mode}`,{lifePolicy:true});e.start();e.setupCompanion();
 const run=i=>{const r=e.applyLifeIntent(i);if(!r.ok)throw Error(JSON.stringify({i,r,life:e.state.life}));};
 for(const i of [{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'advance'},{type:'meal',choice:'skip'},{type:'advance'},{type:'advance'},{type:'meal',choice:'buy'},{type:'social46_activate',version:1,revision:2},{type:'social46_knock_shown'},{type:'social46_door_open'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'meet'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'glad'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'continue'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'thanks'},{type:'social46_intro_line_shown'},{type:'social46_intro_choose',choice:'finish'}]) { if(mode==='dinner' && i.type==='meal' && e.state.life.day===2 && e.state.life.phase==='evening') continue; run(i); }
 if(mode==='floor'){if(!e.openLifeApp())throw Error('synthetic app opening failed');run({type:'sell',asset:'couch'});run({type:'sell',asset:'tv'});}
 if(mode==='repair'){
  for(let n=0;n<3;n++){
   const day=e.state.life.day;run({type:'social46_offer',day,initiator:'ren',activity:'door'});const id=e.state.life.social46.pending.id;run({type:'social46_offer_shown',id});run({type:'advance'});
   if(e.state.life.rent.status==='due')run({type:'rent',choice:'pay'});if(e.state.life.rent.status==='overdue')run({type:'rent_surface'});
   run({type:'meal',choice:'buy'});run({type:'advance'});run({type:'advance'});run({type:'meal',choice:'buy'});
  }
  if(e.state.life.social46.relationship!=='drifting')throw Error('repair relationship not drifting');
 }
 const day=e.state.life.day;if(!['nooffer','dinner'].includes(mode))run({type:'social46_offer',day,initiator:'player',activity:mode==='repair'?'repair':mode==='floor'?'game':'door'});
 e.state.step='life_evening';const env=e.toEnvelope();const valid=validateSave(env);if(!valid.valid)throw Error(JSON.stringify(valid.errors));return env;
}
