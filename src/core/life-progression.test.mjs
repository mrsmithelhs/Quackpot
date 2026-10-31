import test from 'node:test';
import assert from 'node:assert/strict';
import { initialLife, transitionLife } from './life-progression.mjs';

function run(s, intent) {
  const r = transitionLife(s.life, s, intent);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
}
const start = () => ({ life: initialLife(), cash: 80, health: 100 });

test('work is accepted separately and pays once after completion', () => {
  let s = run(start(), { type: 'meal', choice: 'buy' });
  s = run(s, { type: 'advance' });
  s = run(s, { type: 'agree_work', kind: 'scheduled' });
  assert.equal(s.cash, 74);
  const id = s.life.work.id;
  s = run(s, { type: 'complete_work', id });
  assert.equal(s.cash, 134);
  assert.equal(transitionLife(s.life, s, { type: 'complete_work', id }).ok, false);
});

test('deadline resolves before meals, exact-zero payment remains paid', () => {
  let s = start(); s.life.day = 3; s.life.phase = 'evening'; s.life.meals['d3-dinner'] = 'buy'; s.cash = 170;
  s = run(s, { type: 'advance' });
  assert.equal(s.life.rent.status, 'due');
  assert.equal(transitionLife(s.life, s, { type: 'meal', choice: 'buy' }).ok, false);
  s = run(s, { type: 'rent', choice: 'pay' });
  assert.equal(s.cash, 0); assert.equal(s.life.rent.status, 'paid');
});

test('withholding retains cash; shortfall is automatic', () => {
  let s = start(); s.life.day = 3; s.life.phase = 'evening'; s.life.meals['d3-dinner'] = 'buy'; s.cash = 180;
  s = run(s, { type: 'advance' }); s = run(s, { type: 'rent', choice: 'hold' });
  assert.equal(s.cash, 180); assert.equal(s.life.rent.status, 'overdue');
  let t = start(); t.life.day = 3; t.life.phase = 'evening'; t.life.meals['d3-dinner'] = 'buy'; t.cash = 100;
  t = run(t, { type: 'advance' });
  assert.equal(t.life.rent.status, 'overdue');
  assert.equal(t.events.find(e => e.type === 'life_rent_shortfall').payload.shortfall, 70);
});

test('session has one pull and one race, with free suspension', () => {
  let s = start(); s.life.phase = 'evening';
  s = run(s, { type: 'phone_commit', kind: 'pull' });
  const id = s.life.session.id;
  s = run(s, { type: 'phone_suspend' }); s = run(s, { type: 'phone_resume' });
  s = run(s, { type: 'phone_commit', kind: 'race' });
  assert.equal(s.life.session.id, id);
  assert.equal(transitionLife(s.life, s, { type: 'phone_commit', kind: 'pull' }).reason, 'extension_required');
});

test('three missed afternoon shifts terminate scheduled work', () => {
  let s = start();
  for (let i = 0; i < 3; i++) {
    s.life.day = i + 1; s.life.phase = 'afternoon'; s.life.anchor = null;
    s = run(s, { type: 'advance' });
  }
  assert.equal(s.life.missedShifts, 3); assert.equal(s.life.employed, false);
});
import { GameEngine } from './game-engine.mjs';
import { validateSave } from './storage.mjs';

test('new policy engine round trips and rejects changed progression snapshot', () => {
  const e = new GameEngine('plan38', { lifePolicy: true });
  e.start(); e.setupCompanion();
  assert.equal(e.applyLifeIntent({ type: 'meal', choice: 'buy' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'advance' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'agree_work', kind: 'scheduled' }).ok, true);
  const saved = e.toEnvelope();
  assert.equal(saved.schemaVersion, 4);
  assert.deepEqual(validateSave(saved).errors, []);
  const restored = GameEngine.fromEnvelope(saved);
  assert.equal(restored.applyLifeIntent({ type: 'complete_work', id: restored.state.life.work.id }).ok, true);
  assert.equal(restored.state.cash, 134);
  const altered = restored.toEnvelope(); altered.state.life.missedShifts = 2;
  assert.equal(validateSave(altered).valid, false);
});

test('recovery cannot bypass a newly due deadline or duplicate recovery', () => {
  let s = start(); s.life.day = 4; s.life.phase = 'morning'; s.life.rent.status = 'due';
  s.cash = 170; s.health = 0; s.life.recovery = { id: 'recovery-1', recovered: false }; s.life.nextId = 2;
  s = run(s, { type: 'recover' });
  assert.equal(s.health, 25);
  assert.equal(transitionLife(s.life, s, { type: 'finish_recovery' }).reason, 'recovery_pending');
  assert.equal(transitionLife(s.life, s, { type: 'recover' }).reason, 'no_recovery');
  s = run(s, { type: 'rent', choice: 'pay' });
  s = run(s, { type: 'finish_recovery' });
  assert.equal(s.life.phase, 'afternoon'); assert.equal(s.cash, 0); assert.equal(s.health, 25);
});

test('storage read and serialization failures do not become absent or overwrite snapshots', async () => {
  const { loadGame, saveGame } = await import('./storage.mjs');
  const read = loadGame({ getItem() { throw new Error('denied'); } });
  assert.equal(read.isCorrupt, true); assert.equal(read.readFailed, true);
  let written = false; const circular = {}; circular.self = circular;
  const saved = saveGame(circular, { setItem() { written = true; } });
  assert.equal(saved.success, false); assert.match(saved.error, /serialization/); assert.equal(written, false);
});

test('receipt matches overdue rent by ID across later meal and payment', async () => {
  const { projectReceipt } = await import('./receipt.mjs');
  const e = new GameEngine('receipt-life', { lifePolicy: true }); e.start(); e.setupCompanion();
  const step = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  for (let day = 1; day <= 3; day++) {
    step({ type: 'meal', choice: 'buy' });
    step({ type: 'advance' }); step({ type: 'agree_work', kind: 'scheduled' });
    step({ type: 'complete_work', id: e.state.life.work.id });
    step({ type: 'advance' }); step({ type: 'meal', choice: 'buy' }); step({ type: 'advance' });
  }
  step({ type: 'rent', choice: 'hold' });
  step({ type: 'meal', choice: 'buy' });
  step({ type: 'rent', choice: 'pay' });
  const r = projectReceipt(e.log.entries);
  const rent = r.accounting.expenses.find(x => x.kind === 'rent');
  assert.equal(rent.status, 'paid');
  assert.equal(r.summary.finalCash, e.state.cash);
  assert.equal(r.summary.finalHealth, e.state.health);
});


test('new-policy pull and repeat race commitments survive save replay', () => {
  const e = new GameEngine('life-outcomes', { lifePolicy: true }); e.start(); e.setupCompanion();
  assert.equal(e.applyLifeIntent({ type: 'meal', choice: 'buy' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'advance' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'advance' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'meal', choice: 'buy' }).ok, true);
  assert.equal(e.commitPromotionalTenPull().length, 10);
  e.revealAllPending();
  const first = e.runRace(1, e.state.owned[0]);
  assert.ok(first); assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
  assert.equal(e.runRace(1, e.state.owned[0]).raceId, first.raceId);
  assert.equal(e.applyLifeIntent({ type: 'extend_session', confirmed: true }).ok, true);
  assert.equal(e.buyLifeBundle(330), true);
  assert.equal(e.commitPaidPull(1).length, 1);
  e.revealAllPending();
  const second = e.runRace(2, e.state.owned[0]);
  assert.ok(second); assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
});

test('proactive sale persists once and receipt includes the actual proceeds', async () => {
  const { projectReceipt } = await import('./receipt.mjs');
  const e = new GameEngine('life-sale', { lifePolicy: true }); e.start(); e.setupCompanion();
  assert.equal(e.applyLifeIntent({ type: 'sell', asset: 'couch' }).ok, true);
  assert.deepEqual(e.state.assetsSold, ['couch']); assert.equal(e.state.cash, 90);
  assert.equal(e.applyLifeIntent({ type: 'sell', asset: 'couch' }).ok, false);
  assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
  assert.equal(projectReceipt(e.log.entries).summary.finalCash, 90);
});

test('pending terminal save restores without presentation and rejects later race cues', () => {
  const e = new GameEngine('life-terminal', { lifePolicy: true }); e.start(); e.setupCompanion();
  e.clickUninstall(); e.leaveUninstall();
  const count = e.log.length;
  assert.equal(e.recordRacePlaybackAction(1, 'pause'), null);
  assert.equal(e.recordRaceCueDisplayed(1, { cueId: 'late' }), null);
  assert.equal(e.log.length, count);
  assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
  const restored = GameEngine.fromEnvelope(e.toEnvelope());
  assert.equal(restored.state.phase, 'terminal');
  assert.equal(restored.log.entries.some(x => x.type === 'receipt_shown'), false);
  restored.recordReceiptPresented();
  assert.equal(restored.log.entries.filter(x => x.type === 'receipt_shown').length, 1);
});

test('an afternoon game anchor records a missed shift exactly once on phase exit', () => {
  let s = start(); s.life.day = 2; s.life.phase = 'afternoon';
  s = run(s, { type: 'phone_commit', kind: 'pull' });
  s = run(s, { type: 'phone_suspend' }); s = run(s, { type: 'phone_resume' });
  s = run(s, { type: 'advance' });
  assert.equal(s.life.missedShifts, 1); assert.equal(s.life.shiftDays[2], 'missed');
  assert.equal(s.events.filter(e => e.type === 'life_shift_missed').length, 1);
});

test('denied localStorage getter is a recoverable read failure and a non-writing save failure', async () => {
  const { loadGame, saveGame } = await import('./storage.mjs');
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('access denied'); } });
    assert.equal(loadGame().readFailed, true);
    const saved = saveGame({ version: 1 }); assert.equal(saved.success, false); assert.equal(saved.inMemory, true);
  } finally {
    if (old) Object.defineProperty(globalThis, 'localStorage', old); else delete globalThis.localStorage;
    const { resetInMemoryStore } = await import('./storage.mjs'); resetInMemoryStore();
  }
});

test('schema 4 rejects gameplay evidence appended after a terminal event', () => {
  const e = new GameEngine('life-terminal-forged', { lifePolicy: true }); e.start(); e.setupCompanion();
  e.finishRunComplete(); e.log.append('action', { kind: 'forged_after_terminal' }, e.state.clock);
  assert.equal(validateSave(e.toEnvelope()).valid, false);
});

test('Late Night browsing is free and only an active commitment causes next-morning fatigue', () => {
  let s = start(); s.life.day = 2; s.life.phase = 'evening'; s.life.meals['d2-dinner'] = 'skip';
  let browse = run(s, { type: 'late_night' });
  browse = run(browse, { type: 'advance' }); assert.equal(browse.health, 100);
  let active = run(s, { type: 'late_night' });
  active = run(active, { type: 'phone_commit', kind: 'pull' });
  active = run(active, { type: 'advance' }); assert.equal(active.health, 90);
  assert.equal(active.events.find(e => e.type === 'life_health').payload.reason, 'late_night_fatigue');
});

test('reachable Late Night collapse on Day 4 latches rent before recovery and survives reload', async () => {
  const { lifeSurface } = await import('../ui/life/life-routing.mjs');
  const e = new GameEngine('deadline-collapse', { lifePolicy: true }); e.start(); e.setupCompanion();
  const doIt = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  for (let day = 1; day <= 3; day++) {
    doIt({ type: 'meal', choice: 'skip' }); doIt({ type: 'advance' });
    doIt({ type: 'agree_work', kind: 'scheduled' }); doIt({ type: 'complete_work', id: e.state.life.work.id });
    doIt({ type: 'advance' }); doIt({ type: 'meal', choice: 'skip' });
    doIt({ type: 'agree_work', kind: 'overtime' }); doIt({ type: 'complete_work', id: e.state.life.work.id });
    doIt({ type: 'late_night' });
    if (day === 1) { assert.equal(e.commitPromotionalTenPull().length, 10); e.revealAllPending(); }
    else assert.ok(e.runRace(day - 1, e.state.owned[0]));
    doIt({ type: 'advance' });
  }
  assert.equal(e.state.life.day, 4); assert.equal(e.state.health, 0);
  assert.equal(e.state.life.rent.status, 'due'); assert.equal(lifeSurface(e), 'life_rent');
  assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
  const restored = GameEngine.fromEnvelope(e.toEnvelope());
  assert.equal(restored.applyLifeIntent({ type: 'recover' }).ok, true);
  assert.equal(restored.applyLifeIntent({ type: 'finish_recovery' }).ok, false);
  assert.equal(restored.applyLifeIntent({ type: 'rent', choice: 'hold' }).ok, true);
  assert.equal(restored.applyLifeIntent({ type: 'finish_recovery' }).ok, true);
  assert.equal(restored.state.life.rent.status, 'overdue'); assert.equal(restored.state.health, 25);
  assert.deepEqual(validateSave(restored.toEnvelope()).errors, []);
});

test('missing the first shift still unlocks one welcome entitlement in evening', () => {
  const e = new GameEngine('missed-first', { lifePolicy: true }); e.start(); e.setupCompanion();
  assert.equal(e.applyLifeIntent({ type: 'meal', choice: 'skip' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'advance' }).ok, true);
  assert.equal(e.applyLifeIntent({ type: 'advance' }).ok, true);
  assert.equal(e.state.life.missedShifts, 1);
  assert.equal(e.commitPromotionalTenPull().length, 10);
  const before = e.log.entries.filter(x => x.type === 'draw_committed').length;
  e.commitPromotionalTenPull();
  assert.equal(e.log.entries.filter(x => x.type === 'draw_committed').length, before);
  assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
});

test('extension requires explicit confirmation and creates only one new phase allowance', () => {
  let s = start(); s.life.day = 2; s.life.phase = 'afternoon';
  s = run(s, { type: 'phone_commit', kind: 'race' });
  assert.equal(transitionLife(s.life, s, { type: 'extend_session' }).ok, false);
  s = run(s, { type: 'extend_session', confirmed: true });
  assert.equal(s.life.phase, 'evening'); assert.equal(s.life.missedShifts, 1); assert.equal(s.life.session, null);
  s = run(s, { type: 'phone_commit', kind: 'pull' });
  s = run(s, { type: 'phone_commit', kind: 'race' });
  assert.equal(transitionLife(s.life, s, { type: 'phone_commit', kind: 'race' }).reason, 'extension_required');
});

test('phone offer evidence records only the bundle and welcome terms actually shown', async () => {
  const { projectReceipt } = await import('./receipt.mjs');
  const e = new GameEngine('life-disclosure', { lifePolicy: true }); e.start(); e.setupCompanion();
  e.displayLifeGemShop();
  const cue = e.log.entries.find(x => x.type === 'cue_shown');
  assert.deepEqual(cue.payload.bundles, [{ gems: 330, price: 4.99 }]);
  assert.ok(projectReceipt(e.log.entries).accounting.lines.some(x => x.text.includes('free 10-pull')));
  assert.deepEqual(validateSave(e.toEnvelope()).errors, []);
});
