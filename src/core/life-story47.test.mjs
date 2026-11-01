import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from './game-engine.mjs';
import { projectReceipt } from './receipt.mjs';
import { validateSave, loadGame, saveGame, backupCorruptSave, resetInMemoryStore, setTemporaryPreservationMode, STORAGE_KEY, BACKUP_KEY } from './storage.mjs';
import { initialLife } from './life-progression.mjs';

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
