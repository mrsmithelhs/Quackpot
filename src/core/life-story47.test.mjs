import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from './game-engine.mjs';
import { EventLog } from './event-log.mjs';
import { projectReceipt } from './receipt.mjs';
import { validateSave, loadGame, saveGame, backupCorruptSave, resetInMemoryStore, setTemporaryPreservationMode, STORAGE_KEY, BACKUP_KEY } from './storage.mjs';
import { initialLife, transitionLife, callMomScheduled } from './life-progression.mjs';

const act = (engine, intent) => { const result = engine.applyLifeIntent(intent); assert.equal(result.ok, true, JSON.stringify(result)); return result; };
const fresh = () => { const e = new GameEngine('plan47-contract', { lifePolicy: true }); e.start(); e.setupCompanion(); return e; };
const saved = (e) => { const env = e.toEnvelope(); assert.deepEqual(validateSave(env), { valid: true, errors: [] }); return GameEngine.fromEnvelope(env); };

test('policy 1 initial shape stays stable', () => {
  assert.deepEqual(Object.keys(initialLife()), ['policyVersion','config','day','phase','anchor','meals','session','nextId','work','missedShifts','employed','shiftDays','rent','rentSurfaced','recovery','fatiguePending','sold']);
  assert.equal(initialLife().config.leisureHealth, 10);
});

test('selected shift requires displayed stages and pays once across reload', () => {
  let e = fresh(); act(e, { type: 'meal', choice: 'buy' });
  assert.equal(e.beginStoryWork('depart').ok, true);
  const id = e.state.life.work.id; const chosen = structuredClone(e.state.life.story47.story);
  assert.equal(e.applyLifeIntent({ type:'complete_work', id }).ok, false);
  e = saved(e); assert.deepEqual(e.state.life.story47.story, chosen);
  assert.ok(e.showLifeStory47(id, 'commute')); assert.equal(e.showLifeStory47(id, 'commute'), null);
  act(e, { type:'work_story_step', id }); assert.equal(e.applyLifeIntent({ type:'complete_work', id }).ok, false);
  e = saved(e); assert.ok(e.showLifeStory47(id, 'work')); act(e, { type:'complete_work', id });
  assert.equal(e.state.cash, 134); e = saved(e);
  assert.equal(e.applyLifeIntent({ type:'complete_work', id }).ok, false); assert.equal(e.state.cash, 134);
  act(e, { type:'dismiss_story47', id }); assert.equal(e.state.life.story47, undefined);
  saved(e);
});

test('activity reserves anchor, requires display, grants capped effect once, and survives reload', () => {
  let e = fresh(); act(e,{type:'meal',choice:'buy'}); act(e,{type:'advance'}); act(e,{type:'advance'}); act(e,{type:'meal',choice:'buy'});
  act(e,{type:'begin_activity47',version:1,choice:'call_mom'}); const id=e.state.life.story47.id;
  for (const type of ['advance','late_night','leisure']) assert.equal(e.applyLifeIntent({type}).ok,false);
  assert.equal(e.applyLifeIntent({type:'complete_activity47',id}).ok,false);
  assert.ok(e.showLifeStory47(id,'scene')); e=saved(e); act(e,{type:'complete_activity47',id});
  assert.equal(e.state.health,100); assert.equal(e.state.life.story47.stage,'ack'); e=saved(e);
  assert.equal(e.applyLifeIntent({type:'complete_activity47',id}).ok,false); act(e,{type:'dismiss_story47',id}); saved(e);
});

test('unfinished activity is interrupted on terminal without health credit', () => {
  const e=fresh(); act(e,{type:'meal',choice:'buy'}); act(e,{type:'advance'}); act(e,{type:'advance'}); act(e,{type:'meal',choice:'buy'});
  act(e,{type:'begin_activity47',version:1,choice:'sit_duck'}); e.finishRunComplete();
  assert.equal(e.log.entries.filter(x=>x.type==='activity47_interrupted').length,1);
  assert.equal(e.log.entries.filter(x=>x.type==='life_health' && x.payload.reason==='sit_duck').length,0); saved(e);
});

test('pre-existing work and immediate leisure keep legacy behavior', () => {
  let e=fresh(); act(e,{type:'meal',choice:'skip'}); act(e,{type:'advance'}); act(e,{type:'agree_work',kind:'scheduled'});
  const id=e.state.life.work.id; const before=JSON.stringify(e.log.entries); e=saved(e);
  assert.equal(JSON.stringify(e.log.entries),before); act(e,{type:'complete_work',id}); assert.equal(e.state.cash,140);
  act(e,{type:'advance'}); act(e,{type:'leisure'}); assert.equal(e.state.health,100);
  const log=JSON.stringify(e.log.entries); e=saved(e); assert.equal(JSON.stringify(e.log.entries),log);
  assert.equal(e.applyLifeIntent({type:'leisure'}).ok,false);
});

test('invalid or unknown story snapshots do not validate as legacy', () => {
  const e=fresh(); act(e,{type:'meal',choice:'buy'}); assert.equal(e.beginStoryWork('depart').ok,true);
  const env=e.toEnvelope();
  for (const mutate of [
    value => { value.state.life.story47.version=99; },
    value => { value.state.life.story47.story.commute='unknown'; },
    value => { value.state.life.story47.stage='payslip'; },
    value => { delete value.state.life.story47; },
  ]) { const bad=structuredClone(env); mutate(bad); assert.equal(validateSave(bad).valid,false); }
});

test('family recovery at low health records the actual capped amount and preserves unrelated RNG streams', () => {
  let e=fresh(); act(e,{type:'meal',choice:'skip'}); act(e,{type:'advance'}); act(e,{type:'advance'}); act(e,{type:'meal',choice:'buy'});
  const before = e.toEnvelope().prngStreams; act(e,{type:'begin_activity47',version:1,choice:'call_mom'});
  const id=e.state.life.story47.id; e.showLifeStory47(id,'scene'); act(e,{type:'complete_activity47',id});
  assert.equal(e.state.health,100);
  assert.equal(e.log.entries.findLast(x=>x.type==='life_health').payload.delta,5);
  assert.deepEqual(e.toEnvelope().prngStreams,before); e=saved(e);
});

test('completed activity awaiting dismissal is not interrupted or rewarded twice', () => {
  let e=fresh(); act(e,{type:'meal',choice:'skip'}); act(e,{type:'advance'}); act(e,{type:'advance'}); act(e,{type:'meal',choice:'buy'});
  act(e,{type:'begin_activity47',version:1,choice:'sit_duck'}); const id=e.state.life.story47.id;
  e.showLifeStory47(id,'scene'); act(e,{type:'complete_activity47',id}); e=saved(e);
  assert.equal(e.state.health,100); e.finishRunComplete();
  assert.equal(e.log.entries.filter(x=>x.type==='activity47_interrupted').length,0);
  assert.equal(e.log.entries.filter(x=>x.type==='life_health' && x.payload.reason==='sit_duck').length,1); saved(e);
});

test('altered deterministic selection is rejected before committing', () => {
  const e=fresh(); act(e,{type:'meal',choice:'buy'});
  const before=e.log.head;
  assert.equal(e.applyLifeIntent({type:'depart_work_story47',confirmedSessionEnd:false,story:{version:1,commute:'invalid',work:['011','012']}}).ok,false);
  assert.equal(e.log.head,before);
});


test('captured pre-change policy-1 work and leisure envelopes remain byte-stable and continuable', () => {
  for (const name of ['old-pending-work','old-completed-work','old-resolved-leisure']) {
    const path = new URL(`../../reports/development/plan-47-work-and-evening-production-integration/fixtures/${name}.json`, import.meta.url);
    const envelope = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(validateSave(envelope).valid, true, name);
    const oldLog = JSON.stringify(envelope.eventLog);
    const e = GameEngine.fromEnvelope(envelope);
    assert.equal(JSON.stringify(e.log.entries), oldLog);
    if (name === 'old-pending-work') { const id=e.state.life.work.id; act(e,{type:'complete_work',id}); assert.equal(e.state.cash,140); assert.equal(e.applyLifeIntent({type:'complete_work',id}).ok,false); }
    if (name === 'old-completed-work') assert.equal(e.state.cash,140);
    if (name === 'old-resolved-leisure') { assert.equal(e.state.health,100); assert.equal(e.applyLifeIntent({type:'leisure'}).ok,false); }
    assert.equal(validateSave(e.toEnvelope()).valid,true);
  }
});
test('unknown story save is preserved by real storage load, backup and temporary autosave adapters', () => {
  const e=fresh(); act(e,{type:'meal',choice:'buy'}); e.beginStoryWork('depart');
  const bad=e.toEnvelope(); bad.state.life.story47.story.catalog='future'; const raw=JSON.stringify(bad);
  const data=new Map([[STORAGE_KEY,raw]]); const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  resetInMemoryStore();
  try {
    assert.equal(loadGame(storage).isCorrupt,true);
    assert.equal(backupCorruptSave(storage),true); assert.equal(data.get(BACKUP_KEY),raw);
    setTemporaryPreservationMode(true); const result=saveGame(fresh().toEnvelope(),storage);
    assert.equal(result.preservedSnapshot,true); assert.equal(data.get(STORAGE_KEY),raw);
  } finally { resetInMemoryStore(); }
});

test('evening activities wait for the explicit dinner decision', () => {
  const e=fresh(); act(e,{type:'meal',choice:'buy'}); act(e,{type:'advance'}); act(e,{type:'advance'});
  assert.equal(e.applyLifeIntent({type:'begin_activity47',version:1,choice:'call_mom'}).ok,false);
  assert.equal(e.applyLifeIntent({type:'begin_activity47',version:1,choice:'sit_duck'}).ok,false);
  act(e,{type:'meal',choice:'skip'}); act(e,{type:'begin_activity47',version:1,choice:'call_mom'});
});

test('Receipt distinguishes displayed commute from unseen shift and records interruption without wages', () => {
  const e=fresh(); act(e,{type:'meal',choice:'buy'}); e.beginStoryWork('depart');
  const id=e.state.life.work.id; e.showLifeStory47(id,'commute'); e.finishRunComplete(); e.recordReceiptPresented();
  const lines=projectReceipt(e.log.entries).accounting.lines.map(item=>item.text).join('\n');
  assert.match(lines,/Displayed a commute scene/); assert.match(lines,/shift was unfinished/);
  assert.doesNotMatch(lines,/two work observations/); assert.doesNotMatch(lines,/received \$60/);
});

const tutorialAct=(e,intent)=>{const r=e.applyLifeIntent(intent);assert.equal(r.ok,true,JSON.stringify(r));return r;};
const tutorialCreate=(tutorialShift=true)=>{const e=new GameEngine('tutorial-repair',{lifePolicy:true,tutorialShift});e.start();e.setupCompanion();return e;};
function tutorialReplaceStarted(envelope, update) {
  const log=new EventLog();
  for(const entry of envelope.eventLog) {const payload=structuredClone(entry.payload);if(entry.type==='run_started')update(payload);log.append(entry.type,payload,entry.clock);}
  return {...envelope,eventLog:log.entries};
}
function tutorialFinish(e) {
  assert.equal(e.beginStoryWork('depart').ok,true); const id=e.state.life.work.id;
  assert.equal(e.state.cash,80); assert.equal(e.log.entries.filter(x=>x.type==='income').length,0);
  e.showLifeStory47(id,'commute');tutorialAct(e,{type:'work_story_step',id});e.showLifeStory47(id,'work');tutorialAct(e,{type:'complete_work',id});
  assert.equal(e.state.cash,140);assert.equal(e.applyLifeIntent({type:'complete_work',id}).ok,false);tutorialAct(e,{type:'dismiss_story47',id});tutorialAct(e,{type:'advance'});
}

test('marked first day prevents all alternate phase and game commitments; departure pays only at completion', () => {
  let e=tutorialCreate(); assert.equal(e.log.entries[0].payload.tutorialShiftVersion,1);
  tutorialAct(e,{type:'meal',choice:'skip'});assert.equal(e.state.health,95);
  for(const intent of [{type:'advance'},{type:'extend_session',confirmed:true},{type:'phone_commit',kind:'pull'},{type:'late_night'},{type:'finish_recovery'}]) {
    const before=e.log.head;assert.equal(e.applyLifeIntent(intent).reason,'tutorial_shift_required');assert.equal(e.log.head,before);
  }
  assert.ok(e.showLifeInvitation());assert.equal(e.replyLifeInvitation(),true);
  assert.equal(validateSave(e.toEnvelope()).valid,true); e=GameEngine.fromEnvelope(e.toEnvelope());
  assert.equal(e.tutorialShiftVersion,1);assert.equal(e.applyLifeIntent({type:'advance'}).reason,'tutorial_shift_required');
  tutorialFinish(e); assert.equal(e.state.life.phase,'evening');assert.equal(validateSave(e.toEnvelope()).valid,true);
});

test('immediate uninstall remains available before tutorial completion', () => {
  const e=tutorialCreate();e.clickUninstall();e.leaveUninstall();
  assert.equal(e.isTerminal(),true);assert.equal(e.log.entries.filter(x=>x.type==='income').length,0);assert.equal(validateSave(e.toEnvelope()).valid,true);
});

test('marker-free historical run stays optional; supported marker survives; unknown markers reject', () => {
  const old=tutorialCreate(false);tutorialAct(old,{type:'meal',choice:'skip'});const original=old.toEnvelope();const bytes=JSON.stringify(original.eventLog);
  const restored=GameEngine.fromEnvelope(original);assert.equal(JSON.stringify(restored.log.entries),bytes);tutorialAct(restored,{type:'advance'});tutorialAct(restored,{type:'advance'});
  assert.equal(restored.state.life.shiftDays[1],'missed');assert.equal(validateSave(restored.toEnvelope()).valid,true);
  const newRun=tutorialCreate();assert.equal(validateSave(newRun.toEnvelope()).valid,true);
  for(const bad of [null,0,2,'1']) assert.equal(validateSave(tutorialReplaceStarted(newRun.toEnvelope(),p=>{p.tutorialShiftVersion=bad;})).valid,false);
  const nonlife=new GameEngine('nonlife');nonlife.start();assert.equal(validateSave(tutorialReplaceStarted(nonlife.toEnvelope(),p=>{p.tutorialShiftVersion=1;})).valid,false);
});

test('later shift remains optional through genuine play and records a missed shift', () => {
  const e=tutorialCreate();tutorialAct(e,{type:'meal',choice:'skip'});tutorialFinish(e);tutorialAct(e,{type:'meal',choice:'buy'});
  assert.ok(e.openLifeApp());assert.equal(e.commitPromotionalTenPull().length,10);e.revealAllPending();tutorialAct(e,{type:'advance'});
  assert.equal(e.state.life.day,2);tutorialAct(e,{type:'meal',choice:'buy'});assert.ok(e.runRace(1,e.state.owned[0]));
  tutorialAct(e,{type:'extend_session',confirmed:true});assert.equal(e.state.life.phase,'afternoon');
  assert.equal(e.buyLifeBundle(330),true);assert.equal(e.commitPaidPull(1).length,1);e.revealAllPending();tutorialAct(e,{type:'advance'});
  assert.equal(e.state.life.shiftDays[2],'missed');assert.ok(e.log.entries.some(x=>x.type==='life_shift_missed' && x.payload.day===2));
  assert.equal(validateSave(e.toEnvelope()).valid,true);
});


test('activity v1 pending quiet retains +10; v2 quiet uses selected +5 and rejects unknown versions', () => {
  for (const version of [1,2]) {
    let e=fresh(); act(e,{type:'meal',choice:'skip'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'skip'});
    assert.equal(e.state.health,90);
    assert.equal(e.applyLifeIntent({type:'begin_activity47',version:3,choice:'sit_duck'}).ok,false);
    act(e,{type:'begin_activity47',version,choice:'sit_duck'});const id=e.state.life.story47.id;
    e.showLifeStory47(id,'scene');e=saved(e);act(e,{type:'complete_activity47',id});
    assert.equal(e.state.health,version===1?100:95);assert.equal(e.log.entries.findLast(x=>x.type==='life_health').payload.delta,version===1?10:5);
    e=saved(e);assert.equal(e.applyLifeIntent({type:'complete_activity47',id}).ok,false);act(e,{type:'dismiss_story47',id});saved(e);
  }
});

test('new activity v2 caps quiet recovery and records actual gain', () => {
  let e=fresh();act(e,{type:'meal',choice:'skip'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'buy'});
  act(e,{type:'begin_activity47',version:2,choice:'sit_duck'});const id=e.state.life.story47.id;e.showLifeStory47(id,'scene');act(e,{type:'complete_activity47',id});
  assert.equal(e.state.health,100);assert.equal(e.log.entries.findLast(x=>x.type==='life_health').payload.delta,5);e=saved(e);
});

test('validator rejects a formerly valid bypass when a new-run tutorial marker is present', () => {
  const legacy=tutorialCreate(false);tutorialAct(legacy,{type:'meal',choice:'buy'});tutorialAct(legacy,{type:'advance'});
  const forged=tutorialReplaceStarted(legacy.toEnvelope(),p=>{p.tutorialShiftVersion=1;});
  const result=validateSave(forged);assert.equal(result.valid,false);
  assert.ok(result.errors.some(message=>message.includes('tutorial_shift_required')));
});

test('new quiet activity reports zero gain at the health cap and cannot repeat', () => {
  let e=fresh();act(e,{type:'meal',choice:'buy'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'buy'});
  act(e,{type:'begin_activity47',version:2,choice:'sit_duck'});const id=e.state.life.story47.id;e.showLifeStory47(id,'scene');act(e,{type:'complete_activity47',id});
  assert.equal(e.state.health,100);assert.equal(e.log.entries.findLast(x=>x.type==='life_health').payload.delta,0);e=saved(e);assert.equal(e.applyLifeIntent({type:'complete_activity47',id}).ok,false);
});

function usedEvening() {
  const e=fresh();act(e,{type:'meal',choice:'buy'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'buy'});
  act(e,{type:'begin_activity47',version:2,choice:'call_mom'});const id=e.state.life.story47.id;e.showLifeStory47(id,'scene');act(e,{type:'complete_activity47',id});act(e,{type:'dismiss_story47',id});return e;
}
function stateFingerprint(e) {const env=e.toEnvelope();return JSON.stringify({state:env.state,log:env.eventLog,streams:env.prngStreams});}

test('browsing after used evening is free and confirmed welcome commits one Late Night pull', () => {
  let e=usedEvening(); const before=structuredClone(e.state.life);assert.equal(e.openLifeApp(),true);assert.deepEqual(e.state.life,before);
  assert.equal(e.needsNextLifePlay('pull'),true);const atPrompt=stateFingerprint(e);assert.equal(e.commitPromotionalTenPull(),null);assert.equal(stateFingerprint(e),atPrompt);
  assert.equal(e.previewNextLifePlay('pull').ok,true);assert.equal(e.commitPromotionalTenPull({confirmNext:true}).length,10);
  assert.equal(e.state.life.phase,'lateNight');assert.equal(e.state.life.fatiguePending,true);assert.equal(e.state.life.session.pull,true);
  const committed=e.log.entries.filter(x=>x.type==='draw_committed').length;assert.equal(committed,10);assert.equal(validateSave(e.toEnvelope()).valid,true);
  e=GameEngine.fromEnvelope(e.toEnvelope());assert.equal(e.commitPromotionalTenPull().length,10);assert.equal(e.log.entries.filter(x=>x.type==='draw_committed').length,10);
});

test('staged paid pull rejects insufficient funds without advancing or touching streams', () => {
  const e=usedEvening();const before=stateFingerprint(e);assert.equal(e.commitPaidPull(1,{confirmNext:true}),null);assert.equal(stateFingerprint(e),before);
  assert.equal(e.buyLifeBundle(330),true);assert.equal(e.commitPaidPull(1,{confirmNext:true}).length,1);assert.equal(e.state.life.phase,'lateNight');
  assert.equal(e.state.gems,170);assert.equal(validateSave(e.toEnvelope()).valid,true);
});

test('staged race handles used allowance and discards failed resolver or serialization work', () => {
  const e=fresh();act(e,{type:'meal',choice:'buy'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'buy'});
  assert.equal(e.commitPromotionalTenPull().length,10);e.revealAllPending();assert.ok(e.runRace(1,e.state.owned[0]));
  const before=stateFingerprint(e);assert.equal(e.needsNextLifePlay('race'),true);
  assert.throws(()=>e.runRace(2,'not-owned','safe',{confirmNext:true}));assert.equal(stateFingerprint(e),before);
  e.resolveRaceCandidate=()=>{throw Error('synthetic resolver failure');};assert.throws(()=>e.runRace(2,e.state.owned[0],'safe',{confirmNext:true}));assert.equal(stateFingerprint(e),before);delete e.resolveRaceCandidate;
  e.serializeRaceCandidate=()=>{throw Error('synthetic serialization failure');};assert.throws(()=>e.runRace(2,e.state.owned[0],'safe',{confirmNext:true}));assert.equal(stateFingerprint(e),before);delete e.serializeRaceCandidate;
  assert.ok(e.runRace(2,e.state.owned[0],'safe',{confirmNext:true}));assert.equal(e.state.life.phase,'lateNight');assert.equal(e.state.life.session.race,true);assert.equal(validateSave(e.toEnvelope()).valid,true);
});

test('composed next-play intent rejects stale and unknown versions, and unused other allowance stays in phase', () => {
  const e=fresh();act(e,{type:'meal',choice:'buy'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'buy'});
  assert.equal(e.commitPromotionalTenPull().length,10);e.revealAllPending();const before=e.log.head;
  assert.equal(e.applyLifeIntent({type:'phone_commit_next',version:9,confirmed:true,kind:'race'}).ok,false);assert.equal(e.log.head,before);
  assert.equal(e.needsNextLifePlay('race'),false);assert.ok(e.runRace(1,e.state.owned[0]));assert.equal(e.state.life.phase,'evening');assert.equal(validateSave(e.toEnvelope()).valid,true);
});

test('new staged draw failure and public orphan reservation leave all live state unchanged', () => {
  const e=usedEvening();const before=stateFingerprint(e);
  assert.equal(e.applyLifeIntent({type:'phone_commit_next',version:1,confirmed:true,kind:'pull'}).reason,'private_reservation');
  e.sampleLifeDraw=()=>{throw Error('synthetic draw failure');};
  assert.throws(()=>e.commitPromotionalTenPull({confirmNext:true}));assert.equal(stateFingerprint(e),before);delete e.sampleLifeDraw;
});

test('composed replay rejects incomplete promo batch and orphaned race choice', () => {
  const e=usedEvening();assert.equal(e.commitPromotionalTenPull({confirmNext:true}).length,10);
  const log=new EventLog();let removed=false;
  for(const entry of e.log.entries){if(entry.type==='draw_committed'&&!removed){removed=true;continue;}log.append(entry.type,entry.payload,entry.clock);}
  const altered={...e.toEnvelope(),eventLog:log.entries};
  assert.ok(validateSave(altered).errors.some(x=>x.includes('Incomplete next-play draw batch')));
  const r=fresh();act(r,{type:'meal',choice:'buy'});act(r,{type:'advance'});act(r,{type:'advance'});act(r,{type:'meal',choice:'buy'});
  r.commitPromotionalTenPull();r.revealAllPending();r.runRace(1,r.state.owned[0]);r.runRace(2,r.state.owned[0],'safe',{confirmNext:true});
  const orphan=new EventLog();for(const entry of r.log.entries){if(entry.type==='race_result'&&entry.payload.raceId===r.raceIdFor(2))continue;orphan.append(entry.type,entry.payload,entry.clock);}
  assert.ok(validateSave({...r.toEnvelope(),eventLog:orphan.entries}).errors.some(x=>x.includes('Missing next-play race outcome')));
});

test('unconsumed same-phase race cannot be forced into a next phase', () => {
  const e=fresh();act(e,{type:'meal',choice:'buy'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'buy'});
  e.commitPromotionalTenPull();e.revealAllPending();const before=stateFingerprint(e);
  assert.equal(e.runRace(1,e.state.owned[0],'safe',{confirmNext:true}),null);assert.equal(stateFingerprint(e),before);
});

test('staged next-play preserves tutorial marker, seed and autosave preference', () => {
  let e=tutorialCreate();tutorialAct(e,{type:'meal',choice:'skip'});tutorialFinish(e);tutorialAct(e,{type:'meal',choice:'buy'});
  tutorialAct(e,{type:'begin_activity47',version:2,choice:'call_mom'});const id=e.state.life.story47.id;e.showLifeStory47(id,'scene');tutorialAct(e,{type:'complete_activity47',id});tutorialAct(e,{type:'dismiss_story47',id});
  e.autosaveEnabled=false;const seed=e.seed;assert.equal(e.commitPromotionalTenPull({confirmNext:true}).length,10);
  assert.equal(e.seed,seed);assert.equal(e.tutorialShiftVersion,1);assert.equal(e.autosaveEnabled,false);assert.equal(validateSave(e.toEnvelope()).valid,true);
  e=GameEngine.fromEnvelope(e.toEnvelope());assert.equal(e.tutorialShiftVersion,1);assert.equal(e.autosaveEnabled,false);
});

test('next play cannot skip a newly required morning meal after Late Night', () => {
  const e=usedEvening();assert.equal(e.buyLifeBundle(330),true);assert.equal(e.commitPromotionalTenPull({confirmNext:true}).length,10);e.revealAllPending();
  const before=stateFingerprint(e);assert.equal(e.previewNextLifePlay('pull').reason,'destination_obligation_pending');
  assert.equal(e.commitPaidPull(1,{confirmNext:true}),null);assert.equal(stateFingerprint(e),before);assert.equal(e.state.life.phase,'lateNight');
});


test('Call Mom v3 follows fixed scheduled days without rolling a missed offer', () => {
  for (const day of [1,2,5,6,7,10,11,12]) {
    const life=initialLife();life.day=day;life.phase='evening';life.meals[`d${day}-dinner`]='skip';
    const before=JSON.stringify(life);const result=transitionLife(life,{cash:80,health:90},{type:'begin_activity47',version:3,choice:'call_mom'});
    assert.equal(result.ok,[1,6,11].includes(day),`day ${day}`);assert.equal(callMomScheduled(day),[1,6,11].includes(day));
    assert.equal(JSON.stringify(life),before);
  }
});

test('Call Mom v3 respects dinner and anchor and survives save with one capped recovery', () => {
  let e=fresh();act(e,{type:'meal',choice:'skip'});act(e,{type:'advance'});act(e,{type:'advance'});
  assert.equal(e.applyLifeIntent({type:'begin_activity47',version:3,choice:'call_mom'}).ok,false);
  act(e,{type:'meal',choice:'skip'});act(e,{type:'begin_activity47',version:3,choice:'call_mom'});const id=e.state.life.story47.id;
  e.showLifeStory47(id,'scene');e=saved(e);act(e,{type:'complete_activity47',id});assert.equal(e.state.health,95);e=saved(e);
  assert.equal(e.applyLifeIntent({type:'complete_activity47',id}).ok,false);act(e,{type:'dismiss_story47',id});
  assert.equal(e.applyLifeIntent({type:'begin_activity47',version:3,choice:'call_mom'}).ok,false);saved(e);
});


test('legacy v1 and v2 pending calls retain their promised recovery across reload', () => {
  for (const version of [1,2]) {
    let e=fresh();act(e,{type:'meal',choice:'skip'});act(e,{type:'advance'});act(e,{type:'advance'});act(e,{type:'meal',choice:'skip'});
    act(e,{type:'begin_activity47',version,choice:'call_mom'});const id=e.state.life.story47.id;e.showLifeStory47(id,'scene');e=saved(e);
    act(e,{type:'complete_activity47',id});assert.equal(e.state.health,95);assert.equal(e.log.entries.findLast(x=>x.type==='life_health').payload.delta,5);saved(e);
  }
});

test('v3 cannot bypass rent, recovery, existing activity, or unknown versions', () => {
  const base=initialLife();base.phase='evening';base.meals['d1-dinner']='buy';
  for (const patch of [{rent:{id:'rent-1',status:'due'}},{recovery:{recovered:false}},{anchor:'other'}]) {
    const life=Object.assign(structuredClone(base),patch);assert.equal(transitionLife(life,{cash:80,health:90},{type:'begin_activity47',version:3,choice:'call_mom'}).ok,false);
  }
  assert.equal(transitionLife(base,{cash:80,health:90},{type:'begin_activity47',version:4,choice:'call_mom'}).ok,false);
});
