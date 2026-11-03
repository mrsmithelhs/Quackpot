import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { GameEngine } from '../../../src/core/game-engine.mjs';
import { validateSave } from '../../../src/core/storage.mjs';
import { currentPlan52SourceClosure, sha256 } from '../../../scripts/dev/checkpoints/provenance.mjs';

const base='reports/development/plan-52-five-slot-production-transition/';
const parent=base+'production-ren-final/ren-complete.save.json';
const recipe=base+'checkpoint-independent-generator.mjs';
const output=base+'checkpoint-independent';
const bytes=await readFile(parent), initial=JSON.parse(bytes);
const options={experimentalFiveSlot:true,requireFiveSlotTutorial:true};
if(!validateSave(initial,options).valid)throw Error('Parent save is invalid');
const engine=GameEngine.fromEnvelope(initial);
let n=0;const actions=[];
const dismiss=engine.applyFiveSlotSocialAction({operationId:'checkpoint-dismiss-ren',action:{type:'social46_dismiss',id:engine.state.life.social46.scene.id}},engine.log.length);
if(!dismiss.ok)throw Error(`Shown Ren acknowledgement could not be dismissed: ${JSON.stringify(dismiss)}`);actions.push({type:'social46_dismiss'});
const act=action=>{const proposal=engine.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`checkpoint-day7-${++n}`}});if(!proposal.ok||proposal.proposal.schedule.disclosures.length)throw Error(`Action unavailable or needs a displayed warning: ${JSON.stringify(proposal)}`);const committed=engine.commitFiveSlotAction(proposal.proposal,{confirmed:true});if(!committed.ok)throw Error(`Action failed: ${JSON.stringify(committed)}`);actions.push(action);};
act({type:'sleep'});
for(let day=5;day<=6;day++){act({type:'meal',choice:'skip'});act({type:'start',kind:'quiet'});act({type:'complete',activityId:engine.state.life.schedule.active.id});act({type:'meal',choice:'skip'});act({type:'start',kind:'quiet'});act({type:'complete',activityId:engine.state.life.schedule.active.id});act({type:'sleep'});}
const envelope=engine.toEnvelope(),s=envelope.state;
if(s.life.schedule.day!==7||s.life.schedule.slot!=='morning'||!validateSave(envelope,options).valid)throw Error('Unexpected independent-day boundary');
await mkdir(output,{recursive:true});
const raw=Buffer.from(JSON.stringify(envelope));await writeFile(output+'/day7-morning.save.json',raw);
const closure=await currentPlan52SourceClosure();
await writeFile(output+'/trace.json',JSON.stringify({parent,parentSha256:sha256(bytes),recipeSha256:sha256(await readFile(recipe)),sourceClosureSha256:closure.sha256,actions,captures:[{name:'day7-morning',sha256:sha256(raw)}],error:null},null,2));
console.log(JSON.stringify({day:s.life.schedule.day,slot:s.life.schedule.slot,cash:s.cash,health:s.health,fixtureSha256:sha256(raw),sourceClosureSha256:closure.sha256}));
