import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, calculatePreDrawOdds, BANNER_1_ROSTER } from './game-engine.mjs';
import { verifyCompleteness } from './event-log.mjs';
import { validateSave } from './storage.mjs';

test('engine: preDrawOdds matches linear formula at draw 35 (0.08125) and draw 50 (1.0)', () => {
  const o1 = calculatePreDrawOdds(0);
  assert.equal(o1.legendary, 0.02);

  const o35 = calculatePreDrawOdds(34); // draw 35
  assert.equal(o35.legendary, 0.08125);

  const o50 = calculatePreDrawOdds(49); // draw 50
  assert.equal(o50.legendary, 1.0);
  assert.equal(o50.common, 0);
  assert.equal(o50.rare, 0);
});

test('engine: Trace 1 (Frugal/Solvent) executes 4 bills totaling $30 and finishes on run_complete', () => {
  const engine = new GameEngine('seed-trace-1');
  engine.start();
  engine.setupCompanion('Professor Quacks', 'classic-yellow');

  // Day 1
  engine.commitPromotionalTenPull();
  engine.revealAllPending();

  const food1 = engine.billExpense('food', 5.00);
  assert.equal(food1.paid, true);
  assert.equal(engine.state.cash, 10.00);

  // Tutorial race
  const race1 = engine.runRace(1, engine.state.owned[0], 'safe');
  assert.equal(race1.place, 1);
  assert.equal(engine.state.gems, 50);

  // Starter offer shown, declined
  engine.displayStarterOffer();
  engine.declineStarterPack();
  assert.equal(engine.state.cash, 10.00);

  // Evening wage
  engine.creditWage();
  assert.equal(engine.state.cash, 20.00);

  // Day 2
  engine.advanceDay(2, 'day 2 morning');
  const food2 = engine.billExpense('food', 5.00);
  assert.equal(food2.paid, true);
  assert.equal(engine.state.cash, 15.00);

  engine.advanceDay(2, 'day 2 afternoon');
  const rent = engine.billExpense('rent', 15.00);
  assert.equal(rent.paid, true);
  assert.equal(engine.state.cash, 0.00); // Frugal zero-cash moment

  // Continues to wage without forced sacrifice
  engine.chooseZeroCashOption('continue');
  engine.creditWage();
  assert.equal(engine.state.cash, 10.00);

  // Day 3
  engine.advanceDay(3, 'day 3 morning');
  const food3 = engine.billExpense('food', 5.00);
  assert.equal(food3.paid, true);
  assert.equal(engine.state.cash, 5.00);

  engine.advanceDay(3, 'day 3 midday');
  engine.runRace(2, engine.state.owned[0], 'safe');

  engine.finishRunComplete();
  assert.equal(engine.state.phase, 'terminal');
  assert.equal(engine.state.terminalRoute, 'run_complete');

  // Present receipt
  const receipt = engine.presentReceipt();
  assert.equal(engine.state.phase, 'receipt_presented');
  assert.equal(verifyCompleteness(engine.log.entries), true);

  // Receipt verification
  assert.equal(receipt.terminalRoute, 'run_complete');
  assert.equal(receipt.accounting.unpaidExpense, null);
  assert.equal(receipt.accounting.expenses.filter((e) => e.status === 'paid').length, 4);

  const totalPaid = receipt.accounting.expenses.reduce((s, e) => s + e.paidAmount, 0);
  assert.equal(totalPaid, 30.00);

  // Anchoring finding recorded offer shown, but no purchase
  const anchoring = receipt.findings.find((f) => f.technique === 'anchoring');
  assert.ok(anchoring);
  assert.ok(anchoring.did[0].text.includes('purchase not recorded'));
});

test('engine [Repair 01 Regression]: zero-cash extra shift and sell couch keep run solvent and active', () => {
  // Test Extra Shift route
  const e1 = new GameEngine('seed-zc-shift');
  e1.start();
  e1.setupCompanion();
  e1.billExpense('rent', 15.00); // cash 15 -> 0
  assert.equal(e1.state.cash, 0);

  const shiftRes = e1.chooseZeroCashOption('extra_shift');
  assert.equal(shiftRes.resolved, true);
  assert.equal(e1.state.cash, 10.00);
  assert.equal(e1.state.health, 85);
  assert.equal(e1.state.phase, 'playing'); // NOT terminal!
  assert.equal(e1.state.terminalRoute, null);

  // Test Sell Couch route
  const e2 = new GameEngine('seed-zc-couch');
  e2.start();
  e2.setupCompanion();
  e2.billExpense('rent', 15.00); // cash 15 -> 0
  assert.equal(e2.state.cash, 0);

  const couchRes = e2.chooseZeroCashOption('sell_couch');
  assert.equal(couchRes.resolved, true);
  assert.equal(e2.state.cash, 10.00);
  assert.equal(e2.state.health, 100);
  assert.ok(e2.state.assetsSold.includes('couch'));
  assert.equal(e2.state.phase, 'playing'); // NOT terminal!

  // Selling couch a second time is rejected
  assert.throws(() => e2.chooseZeroCashOption('sell_couch'), /Couch already sold/);
});

test('engine [Repair 01 Regression]: post-terminal actions are rejected', () => {
  const engine = new GameEngine('seed-post-term');
  engine.start();
  engine.setupCompanion();
  engine.finishRunComplete();
  engine.recordReceiptPresented();

  assert.equal(engine.isTerminal(), true);
  assert.throws(() => engine.clickUninstall(), /Cannot uninstall after run is terminal/);
  assert.throws(() => engine.runRace(1, 'duck-0'), /Cannot race/);
  assert.throws(() => engine.commitPromotionalTenPull(), /Cannot pull/);
  assert.throws(() => engine.buyStarterPack(), /Cannot buy/);
  assert.throws(() => engine.billExpense('food', 5.00), /Cannot bill/);
});

test('engine [Repair 01 Regression]: race execution is idempotent on reload/rerun', () => {
  const engine = new GameEngine('seed-race-rerun');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();

  const outcome1 = engine.runRace(1, engine.state.owned[0], 'safe');
  assert.equal(engine.state.gems, 50);
  const logLenAfterRace1 = engine.log.entries.length;

  // Running race 1 again returns cached result with 0 extra gems and 0 extra events
  const outcome2 = engine.runRace(1, engine.state.owned[0], 'safe');
  assert.equal(outcome2.place, outcome1.place);
  assert.equal(engine.state.gems, 50);
  assert.equal(engine.log.entries.length, logLenAfterRace1);
});

test('engine [Repair 01 Regression]: repeat retention does not re-credit gems and logs stay_without_reward', () => {
  const engine = new GameEngine('seed-repeat-retention');
  engine.start();
  engine.setupCompanion();

  // First retention attempt: grants 80 gems
  engine.clickUninstall();
  engine.stayUninstall();
  assert.equal(engine.state.gems, 80);
  assert.equal(engine.state.retentionUsed, true);

  // Second retention attempt: does NOT grant extra gems
  engine.clickUninstall();
  engine.stayUninstall();
  assert.equal(engine.state.gems, 80);
  assert.ok(engine.log.entries.some((e) => e.type === 'action' && e.payload?.kind === 'stay_without_reward'));
});

test('engine: revealDrawAtIndex reveals exact committed card by index', () => {
  const engine = new GameEngine('seed-reveal-idx');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();

  // Reveal card index 4
  const revealedCard = engine.revealDrawAtIndex(4);
  assert.equal(revealedCard.drawIndex, 5);
  assert.equal(engine.state.pendingReveals[4].revealed, true);
  assert.equal(engine.state.pendingReveals[0].revealed, false);
});

test('engine: Trace 2 (Purchase + Escalation Recovery) recovers via extra shift and finishes with $14.01', () => {
  const engine = new GameEngine('seed-trace-2');
  engine.start();
  engine.setupCompanion('Professor Quacks', 'classic-yellow');

  // Day 1
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  engine.billExpense('food', 5.00); // cash: 10.00
  engine.runRace(1, engine.state.owned[0], 'safe');

  engine.displayStarterOffer();
  const bought = engine.buyStarterPack();
  assert.equal(bought, true);
  assert.equal(engine.state.cash, 9.01);
  assert.equal(engine.state.gems, 290); // 50 race + 240 starter

  engine.creditWage(); // cash: 19.01

  // Day 2
  engine.advanceDay(2, 'day 2 morning');
  engine.billExpense('food', 5.00); // cash: 14.01

  engine.advanceDay(2, 'day 2 afternoon');
  const rent = engine.billExpense('rent', 15.00); // cash 14.01 < 15.00!
  assert.equal(rent.paid, false);
  assert.equal(rent.needsEscalation, true);
  assert.equal(engine.state.phase, 'escalation');

  // Escalation step 2 (extra_shift) offered and accepted
  assert.equal(engine.getCurrentEscalationStep(), 'extra_shift');
  const escResult = engine.acceptEscalation();
  assert.equal(escResult.resolved, true);
  assert.equal(engine.state.cash, 9.01); // 14.01 + 10 - 15
  assert.equal(engine.state.health, 85);

  engine.creditWage(); // cash: 19.01

  // Day 3
  engine.advanceDay(3, 'day 3 morning');
  engine.billExpense('food', 5.00); // cash: 14.01
  engine.finishRunComplete();

  const receipt = engine.presentReceipt();
  assert.equal(receipt.terminalRoute, 'run_complete');
  assert.equal(receipt.accounting.unpaidExpense, null);
  assert.equal(engine.state.cash, 14.01);
  assert.equal(engine.state.health, 85);

  // Receipt confirms starter purchased and 1 escalation step
  const anchoring = receipt.findings.find((f) => f.technique === 'anchoring');
  assert.ok(anchoring.did[0].text.includes('Starter offer bought'));
  assert.equal(receipt.accounting.escalations.length, 1);
  assert.equal(receipt.accounting.escalations[0].step, 'extra_shift');
});

test('engine: Trace 3 (Purchase + Default) declines all escalations and ends on running_on_empty', () => {
  const engine = new GameEngine('seed-trace-3');
  engine.start();
  engine.setupCompanion('Professor Quacks', 'classic-yellow');

  // Day 1: buy starter
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  engine.billExpense('food', 5.00);
  engine.displayStarterOffer();
  engine.buyStarterPack();
  engine.creditWage();

  // Day 2: rent short
  engine.advanceDay(2, 'day 2 morning');
  engine.billExpense('food', 5.00);
  engine.billExpense('rent', 15.00);

  // Decline all escalation steps
  engine.declineEscalation(); // declines extra_shift
  engine.declineEscalation(); // declines sell_couch
  engine.declineEscalation(); // declines sell_tv
  const def = engine.declineEscalation(); // declines credit_card -> exhausts!

  assert.equal(def.route, 'running_on_empty');
  assert.equal(engine.state.phase, 'terminal');
  assert.equal(engine.state.terminalRoute, 'running_on_empty');

  const receipt = engine.presentReceipt();
  assert.equal(receipt.terminalRoute, 'running_on_empty');
  assert.ok(receipt.accounting.unpaidExpense);
  assert.equal(receipt.accounting.unpaidExpense.kind, 'rent');
});

test('engine: Trace 4 (Uninstall) opens retention modal and leaves immediately to Receipt', () => {
  const engine = new GameEngine('seed-trace-4');
  engine.start();
  engine.setupCompanion('Professor Quacks', 'classic-yellow');

  engine.clickUninstall();
  assert.equal(engine.state.retentionOffered, true);

  const route = engine.leaveUninstall();
  assert.equal(route, 'uninstall');
  assert.equal(engine.state.phase, 'terminal');

  const receipt = engine.presentReceipt();
  assert.equal(receipt.terminalRoute, 'uninstall');

  // Exit friction finding recorded
  const exitFinding = receipt.findings.find((f) => f.technique === 'exit_friction');
  assert.ok(exitFinding);
  assert.ok(exitFinding.did[0].text.includes('Chose to leave immediately'));
});

test('engine: tactical stances are mathematically non-dominated under weaker vs faster fields', () => {
  const commonDuck = BANNER_1_ROSTER.find((d) => d.tier === 'common');
  const S = commonDuck.speed; // 10.0

  // Condition 1: Weaker field (base 9.0 ±5% => [8.55, 9.45])
  const safePerfMin = S * (1 - 0.05); // 9.50
  assert.ok(safePerfMin > 9.45, 'Safe pace guarantees 100% win against 9.0 field');

  const sprintPerfMin = (S * 1.10) * (1 - 0.20); // 8.80
  assert.ok(sprintPerfMin < 9.45, 'Sprint push has blunder risk against 9.0 field');

  // Condition 2: Faster field (base 11.2 ±5% => [10.64, 11.76])
  const safePerfMax = S * (1 + 0.05); // 10.50
  assert.ok(safePerfMax < 10.64, 'Safe pace guarantees 0% win against 11.2 field');

  const sprintPerfMax = (S * 1.10) * (1 + 0.20); // 13.20
  assert.ok(sprintPerfMax > 11.76, 'Sprint push peak beats 11.2 field');
});

test('engine: commit-before-reveal reload integrity and unrevealed Receipt provenance', () => {
  const engine = new GameEngine('seed-reveal-test');
  engine.start();
  engine.setupCompanion('Professor Quacks', 'classic-yellow');

  const draws = engine.commitPromotionalTenPull();
  assert.equal(draws.length, 10);
  assert.equal(engine.state.pendingReveals.length, 10);

  // Reveal only 3 draws
  engine.revealNextDraw();
  engine.revealNextDraw();
  engine.revealNextDraw();

  // Save to envelope
  const env = engine.toEnvelope();
  const val = validateSave(env);
  assert.equal(val.valid, true);

  // Restore into new engine instance
  const restoredEngine = GameEngine.fromEnvelope(env);
  assert.equal(restoredEngine.state.pendingReveals.filter((d) => !d.revealed).length, 7);

  // If player uninstalls right now with 7 draws unrevealed
  restoredEngine.clickUninstall();
  restoredEngine.leaveUninstall();
  const receipt = restoredEngine.presentReceipt();

  // Ledger shows all 10 committed draws
  assert.equal(receipt.pullLedger.length, 10);
  assert.equal(receipt.pullLedger.filter((l) => l.revealed).length, 3);
  assert.equal(receipt.pullLedger.filter((l) => !l.revealed).length, 7);
});

test('engine: idempotent Receipt presentation on reload after completion', () => {
  const engine = new GameEngine('seed-idempotent');
  engine.start();
  engine.setupCompanion();
  engine.finishRunComplete();
  engine.presentReceipt();

  const countBefore = engine.log.entries.length;
  // Calling presentReceipt again does not append duplicate receipt_shown
  engine.presentReceipt();
  assert.equal(engine.log.entries.length, countBefore);
});
