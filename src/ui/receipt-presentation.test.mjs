import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../core/game-engine.mjs';
import { EventLog } from '../core/event-log.mjs';
import { projectReceipt } from '../core/receipt.mjs';
import { presentReceipt } from './receipt-presentation.mjs';

test('actual engine draws and races remain chronological and separate from purchases', () => {
  const e = new GameEngine('plan44-race', { lifePolicy: true }); e.start(); e.setupCompanion();
  const step = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  step({ type: 'meal', choice: 'buy' }); step({ type: 'advance' }); step({ type: 'advance' }); step({ type: 'meal', choice: 'buy' });
  e.commitPromotionalTenPull(); e.revealAllPending();
  e.recordRaceChoicesShown(1, { duckId: e.state.owned[0] });
  assert.ok(e.runRace(1, e.state.owned[0]));
  e.recordRaceCueDisplayed(1, { cueId: 'test-cue', text: 'Shown cue' }); e.recordRacePlaybackAction(1, 'skip');
  step({ type: 'extend_session', confirmed: true }); assert.equal(e.buyLifeBundle(330), true); e.commitPaidPull(1); e.revealAllPending();
  assert.ok(e.runRace(2, e.state.owned[0])); e.clickUninstall(); e.leaveUninstall();
  assert.ok(e.log.entries.length < 150);
  const receipt = projectReceipt(e.log.entries), view = presentReceipt(receipt);
  assert.equal(view.draws.length, 11); assert.equal(view.revealedCount, 11);
  assert.deepEqual(view.draws.map(x => x.preDrawOdds), e.log.entries.filter(x => x.type === 'draw_committed').map(x => x.payload.odds));
  assert.ok(view.draws.every(x => x.purchaseAssociation === 'unknown'));
  assert.equal(view.purchases.length, e.log.entries.filter(x => x.type === 'purchase').length);
  assert.deepEqual(view.race.map(x => x.seq), view.race.map(x => x.seq).slice().sort((a,b) => a-b));
  assert.ok(view.race.some(x => x.register === 'Game recorded' && x.text.includes('crossing order')));
  assert.ok(view.race.some(x => x.register === 'We displayed' && x.text === 'Shown cue'));
  assert.equal(receipt.isComplete, false); assert.equal(receipt.receiptShown, false);
  e.recordReceiptPresented(); e.recordReceiptPresented(); assert.equal(e.log.entries.filter(x => x.type === 'receipt_shown').length, 1);
});

test('immediate uninstall records offered retention and leave separately', () => {
  const e = new GameEngine('plan44-leave', { lifePolicy: true }); e.start(); e.setupCompanion(); e.clickUninstall(); e.leaveUninstall();
  const r = projectReceipt(e.log.entries); const f = r.findings.find(x => x.technique === 'exit_friction');
  assert.ok(f.displayed.some(x => /Retention offer shown/.test(x.text))); assert.ok(f.did.some(x => /leave immediately/.test(x.text)));
  assert.equal(r.terminalRoute, 'uninstall'); assert.ok(e.log.entries.length < 30);
});

test('legacy missing odds and balances remain unavailable; no transaction link is asserted', () => {
  const log = new EventLog(), clock = { day: 1, label: 'fixture' };
  log.append('run_started', { seed: 'synthetic' }, clock);
  log.append('purchase', { kind: 'ten_pull', cost: 100, price: 0 }, clock);
  log.append('draw_committed', { drawIndex: 1, of: 1, identity: 'duck', rarity: 'common', duplicate: false }, clock);
  const v = presentReceipt(projectReceipt(log.entries));
  assert.equal(v.totals, null); assert.equal(v.draws[0].preDrawOdds, undefined); assert.equal(v.draws[0].purchaseAssociation, 'unknown');
});


test('synthetic exact-zero expense records distinguish paid from unpaid', () => {
  const config = { startCash: 6, startHealth: 100 };
  function fixture(paid) {
    const log = new EventLog(), clock = { day: 1, label: 'fixture' };
    log.append('run_started', { lifePolicyVersion: 1, lifeConfig: config }, clock);
    log.append('expense_due', { kind: 'breakfast', billId: 'bill', amount: 6, cashBefore: paid ? 6 : 0 }, clock);
    if (paid) log.append('expense_paid', { kind: 'breakfast', billId: 'bill', amount: 6, cashAfter: 0 }, clock);
    log.append('terminal', { route: 'uninstall' }, clock);
    return presentReceipt(projectReceipt(log.entries));
  }
  const paid = fixture(true), unpaid = fixture(false);
  assert.equal(paid.totals.finalCash, 0); assert.equal(paid.expenses[0].status, 'paid');
  assert.equal(unpaid.expenses[0].status, 'unpaid');
  assert.notEqual(unpaid.expenses[0].status, paid.expenses[0].status);
});

test('actual engine records rent shortfall without inferring debt from cash', () => {
  const e = new GameEngine('plan44-shortfall', { lifePolicy: true }); e.start(); e.setupCompanion();
  const step = intent => assert.equal(e.applyLifeIntent(intent).ok, true, JSON.stringify(intent));
  for (let day = 1; day <= 3; day++) {
    step({ type: 'meal', choice: 'skip' }); step({ type: 'advance' }); step({ type: 'advance' });
    step({ type: 'meal', choice: 'skip' }); step({ type: 'advance' });
  }
  assert.equal(e.state.life.rent.status, 'overdue'); e.clickUninstall(); e.leaveUninstall();
  const view = presentReceipt(projectReceipt(e.log.entries));
  assert.ok(view.expenses.some(x => x.kind === 'rent' && x.status === 'unpaid'));
  assert.ok(view.evidence.some(x => x.type === 'life_rent_shortfall'));
  assert.equal(view.totals.finalCash, e.state.cash); assert.equal(view.totals.finalDebt, e.state.debt);
  assert.ok(e.log.entries.length < 150);
});

test('missing bill identifiers suppress inferred accounting without hiding recorded work outcomes', () => {
  const log = new EventLog(), clock = { day: 1, label: 'fixture' };
  log.append('run_started', { lifePolicyVersion: 1, lifeConfig: { startCash: 6, startHealth: 100 } }, clock);
  log.append('expense_due', { kind: 'lunch', billId: 'bill', amount: 6, cashBefore: 0 }, clock);
  log.append('escalation_result', { step: 'skip_lunch', effects: { billWaived: 6 } }, clock);
  log.append('expense_paid', { kind: 'lunch', amount: 0 }, clock);
  log.append('life_shift_missed', { day: 1, count: 1 }, clock);
  log.append('life_employment_ended', { day: 1 }, clock);
  const view = presentReceipt(projectReceipt(log.entries));
  assert.equal(view.expenseCounts, null); assert.deepEqual(view.expenses, []);
  assert.ok(!view.accounting.some(x => /Unpaid expense recorded/.test(x.text)));
  assert.ok(view.accounting.some(x => /missed shift/.test(x.text)));
  assert.ok(view.accounting.some(x => /employment ended/.test(x.text)));
});

test('finding evidence is presented by sequence instead of construction order', () => {
  const log = new EventLog(), clock = { day: 1, label: 'fixture' };
  log.append('cue_shown', { technique: 'currency_obfuscation', bundles: [], pullCost: 100 }, clock);
  log.append('purchase', { kind: 'bundle', bundleGems: 60, price: 1, gemsAfter: 60 }, clock);
  log.append('purchase', { kind: 'single_pull', cost: 100, price: 0 }, clock);
  log.append('purchase', { kind: 'bundle', bundleGems: 60, price: 1, gemsAfter: 60 }, clock);
  const f = presentReceipt(projectReceipt(log.entries)).findings[0];
  assert.deepEqual(f.did.map(x => x.seq), [1, 2, 3]);
});
