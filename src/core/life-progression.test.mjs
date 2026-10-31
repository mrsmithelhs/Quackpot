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
