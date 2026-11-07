import {createPilot,restorePilot,availableActions,dispatch,snapshot} from './plan-67-actions.mjs';
import {GameEngine} from '../../src/core/game-engine.mjs';
import {validateSave} from '../../src/core/storage.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const out='reports/development/plan-67-headless-playthrough-and-reachability-pilot';
const stable=e=>{const x=structuredClone(e);delete x.savedAt;return JSON.stringify(x);};
export function policy(c, mode) {
  const e=c.engine,s=e.state.life.schedule, story=e.state.life.story47;
  if(c.prompt==='retention')return 'leave';
  if(c.prompt==='default')return 'default-confirm';
  if(mode==='exit')return 'uninstall';
  if(story){
    if(story.stage==='payslip')return 'work-dismiss';
    const shown=e.log.entries.some(x=>x.type==='story47_shown'&&x.payload.id===story.id&&x.payload.stage===story.stage);
    return shown?(story.stage==='commute'?'work-advance':'work-complete'):`show-${story.stage}`;
  }
  if(s.recovery)return 'recover';
  const due=e.checkDueObligations().bills;
  if(due.length){
    if(!e.fiveSlotDueOptionsWereShown())return 'due-show';
    return mode==='default'?'due-attempt':'due-pay';
  }
  if(s.active?.kind==='early-bed')return 'bed-complete';
  return {morning:'meal-buy',midday:'work-start','early-evening':'meal-buy',evening:'bed-start','late-evening':'sleep'}[s.slot];
}
export function run(seed,mode,limit=120, resume=false) {
  let c=createPilot(seed),rows=[],resumed=false;
  for(let i=0;i<limit&&!c.engine.isTerminal();i++){
    if(mode==='solvent' && c.engine.state.life.schedule.day>=15) break;
    if(resume&&!resumed&&i===(mode==='exit'?1:8)){const x=c.engine.toEnvelope();c=restorePilot(x,c.prompt,c.sequence);resumed=true;}
    const action=policy(c,mode), row=dispatch(c,action); rows.push(row);
    if(!row.ok)return {category:'rejected',reason:row.reason,rows,final:snapshot(c),envelope:c.engine.toEnvelope()};
  }
  return {category:c.engine.isTerminal()?'terminal':'still-playable-at-horizon',rows,final:snapshot(c),envelope:c.engine.toEnvelope()};
}
function main(){
 mkdirSync(`${out}/routes`,{recursive:true});mkdirSync(`${out}/checkpoint`,{recursive:true});
 const seed='plan67-pilot-001';
 for(const mode of ['exit','default','solvent']){
  const a=run(seed,mode),b=run(seed,mode),c=run(seed,mode,120,true);
  const compare=JSON.stringify(a.rows)===JSON.stringify(b.rows)&&stable(a.envelope)===stable(b.envelope);
  const resumed=JSON.stringify(a.rows)===JSON.stringify(c.rows)&&stable(a.envelope)===stable(c.envelope);
  const validation=validateSave(a.envelope,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});
  writeFileSync(`${out}/routes/${mode}.json`,JSON.stringify({seed,mode,category:a.category,reason:a.reason,final:a.final,repeatEqual:compare,resumeEqual:resumed,validation,rows:a.rows},null,2));
  process.stdout.write(`${mode} ${a.category} ${a.reason??''} ${JSON.stringify(a.final)} repeat=${compare} resume=${resumed} valid=${validation.valid}\n`);
 }
 // No shown events or simulated prompt: earliest post-setup boundary.
 const engine=new GameEngine(seed,{lifePolicy:'five-slot-v1',tutorialShift:true});engine.start();
 const envelope=engine.toEnvelope(),valid=validateSave(envelope,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});
 const roundtrip=stable(envelope)===stable(GameEngine.fromEnvelope(envelope).toEnvelope());
 const bytes=JSON.stringify(envelope,null,2);writeFileSync(`${out}/checkpoint/pre-setup.save.json`,bytes);
 writeFileSync(`${out}/checkpoint/provenance.json`,JSON.stringify({seed,policy:'five-slot-v1',schema:5,boundary:{step:envelope.state.step,day:1,slot:'morning',logLength:envelope.eventLog.length},recipe:'construct default five-slot engine and start; before companion setup and any simulated displays',sha256:createHash('sha256').update(bytes).digest('hex'),valid,roundtrip,sourceRevision:'7945bb26ee1a0570d3ac455d5639488447f578a2',browserObserved:false},null,2));
 process.stdout.write(`checkpoint valid=${valid.valid} roundtrip=${roundtrip}\n`);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/plan-67-routes.mjs'))main();


