// Bounded deterministic engine-only exploration, not a browser/owner witness.
// Synthetic cue transcript is emitted before recording shown evidence; it does
// not assert that an apartment UI was displayed or that a real player saw it.
import {readFile,writeFile} from 'node:fs/promises';
import {GameEngine} from '../../../src/core/game-engine.mjs';
import {validateSave} from '../../../src/core/storage.mjs';
import {fiveSlotWarningLines} from '../../../src/ui/life/life-decisions.mjs';
import {currentPlan52SourceClosure,sha256} from '../../../scripts/dev/checkpoints/provenance.mjs';
const base='reports/development/plan-52-five-slot-production-transition/';
const file=base+'session-checkpoint-refresh-second/rent-shortfall.save.json',bytes=await readFile(file),expected='95818cb2cb48cf8ddf35af49018678092920968d1e14006de38c695c9cabf140';
const source=await currentPlan52SourceClosure();if(source.sha256!=='dd32f612945bd11196ddf3a16dcfc2c8f33c1b8288c88fa7d169dbd163ca040c'||sha256(bytes)!==expected)throw Error('source or parent changed');
const parent=JSON.parse(bytes),opts={experimentalFiveSlot:true,requireFiveSlotTutorial:true};if(!validateSave(parent,opts).valid)throw Error('parent invalid');
const e=GameEngine.fromEnvelope(parent),steps=[],cues=[];let stopped=null;
const emit=(kind,value)=>{cues.push({kind,value});};
const act=(action)=>{const intent={domain:'schedule',action:{...action,operationId:`closeout-route:${e.log.length}`}},p=e.prepareFiveSlotAction(intent);if(!p.ok)throw Error(`${action.type}: ${p.reason}`);if(p.proposal.schedule.disclosures.length){const lines=fiveSlotWarningLines(p.proposal);if(!lines)throw Error('unsupported cue');emit('simulated-schedule-disclosure',lines);if(!e.recordFiveSlotScheduleWarningShown(p.proposal))throw Error('cue evidence rejected');}const result=e.commitFiveSlotAction(p.proposal,{confirmed:true});if(!result.ok)throw Error(`${action.type}: ${result.reason}`);steps.push({action:action.type,kind:action.kind??null,day:e.state.life.schedule.day,slot:e.state.life.schedule.slot,cash:e.state.cash,health:e.state.health});};
const work=()=>{let r=e.beginStoryWork('depart');if(!r.ok)throw Error(`work start: ${r.reason}`);const id=e.state.life.story47.id;for(const [stage,type] of [['commute','advance'],['work','complete'],['payslip','dismiss']]){emit('simulated-story-mounted',{id,stage,story:e.state.life.story47.story});if(!e.showLifeStory47(id,stage))throw Error(`show ${stage}`);r=e.applyFiveSlotWorkStory({type,id,operationId:`closeout-story:${e.log.length}`,confirmed:true},e.log.length);if(!r.ok)throw Error(`story ${stage}: ${r.reason}`);}steps.push({action:'work-story',day:e.state.life.schedule.day,slot:e.state.life.schedule.slot,cash:e.state.cash,health:e.state.health});};
try{
 // One named route only: keep first rent outstanding, reserve Day 9 overtime,
 // skip both meals and complete work/quiet/sleep on Days 4–8. No state edits.
 act({type:'reserve-overtime',rentId:'rent-1',day:9,reservationId:'closeout-rent-shift'});
 for(let day=4;day<=8;day++){
  if(e.state.life.schedule.day!==day||e.state.life.schedule.slot!=='morning')throw Error('unexpected route boundary');
  act({type:'meal',choice:'skip'});work();act({type:'meal',choice:'skip'});act({type:'start',kind:'quiet'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'sleep'});
 }
 const terms=e.previewFiveSlotLoanTerms('rent-1');stopped=terms?'loan-offered-at-day9':'loan-unavailable-at-day9';
 steps.push({action:'probe-loan',day:e.state.life.schedule.day,slot:e.state.life.schedule.slot,cash:e.state.cash,health:e.state.health,terms});
}catch(err){stopped=`route-blocked: ${String(err)}`;}
const envelope=e.toEnvelope(),validation=validateSave(envelope,opts),output={kind:'engine-only-named-route',source:source.sha256,parent:file,parentSha256:expected,
  limitations:['One fixed candidate route, not exhaustive reachability.','Cue transcript is a synthetic engine-test presentation, not evidence of a rendered UI or owner experience.','No saved state, balance, health, schedule or log was manually edited.'],
  searchLimit:'Day 4 through Day 9 Morning; one reserved-shift route',steps,cues,stopped,node:process.version,v8:process.versions.v8,validation:{valid:validation.valid,errors:validation.errors}};
await writeFile(base+'closeout-engine-reachability-result.json',JSON.stringify(output,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({stopped,final:steps.at(-1),validation:output.validation,source:source.sha256}));
if(!validation.valid)process.exitCode=1;
