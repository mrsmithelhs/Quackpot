import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { GameEngine, calculatePreDrawOdds, BANNER_1_ROSTER } from './game-engine.mjs';
import { EventLog, verifyCompleteness } from './event-log.mjs';
import { projectReceipt } from './receipt.mjs';
import { validateSave } from './storage.mjs';
import { resolveSeededRace } from './race-resolver.mjs';
import { validateSeededDrawHistory, validateSeededRaceHistory, validateFiveSlotTransactionHistory } from './life-replay.mjs';

test('due warning classifier rejects invalid commitments and leaves state untouched',()=>{
 const e=new GameEngine('default-classifier',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 e.state.life.schedule.day=4;e.state.life.schedule.slot='morning';e.state.cash=180;
 const before=JSON.stringify(e.state),length=e.log.length;
 assert.equal(e.classifyFiveSlotDueCommitment({kind:'schedule',action:{type:'meal',choice:'buy'}}).ok,true);
 assert.equal(e.classifyFiveSlotDueCommitment({kind:'schedule',action:{type:'sleep'}}).reason,'sleep_unavailable');
 assert.equal(e.classifyFiveSlotDueCommitment({kind:'work'}).reason,'work_unavailable');
 assert.equal(e.classifyFiveSlotDueCommitment({kind:'play',play:'pull',promotion:false,count:1}).ok,false);
 assert.equal(e.classifyFiveSlotDueCommitment({kind:'play',play:'race',raceNumber:1,duckId:'not-owned',stance:'safe',useTrial:false}).ok,false);
 assert.equal(JSON.stringify(e.state),before);assert.equal(e.log.length,length);
 assert.equal(e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'buy',operationId:'blocked'}}).reason,'financial_obligation_due');
 e.state.life.schedule.recovery={id:'zero',resolved:false};e.state.health=0;
 assert.equal(e.classifyFiveSlotDueCommitment({kind:'schedule',action:{type:'meal',choice:'buy'}}).ok,false);
});

test('due play warning validates real pull and race prerequisites before offering a decision',()=>{
 const e=new GameEngine('default-play',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();e.state.life.schedule.day=4;e.state.life.schedule.slot='morning';
 assert.equal(e.openLifeApp(),true);e.state.gems=160;e.state.owned=[BANNER_1_ROSTER[0].id];
 const pull={kind:'play',play:'pull',promotion:false,count:1};
 assert.equal(e.classifyFiveSlotDueCommitment(pull).ok,true);
 assert.equal(e.classifyFiveSlotDueCommitment({...pull,count:10}).reason,'pull_unavailable');
 e.state.pendingReveals=[{revealed:false}];assert.equal(e.classifyFiveSlotDueCommitment(pull).ok,false);e.state.pendingReveals=[];
 const race={kind:'play',play:'race',raceNumber:1,duckId:e.state.owned[0],stance:'safe',useTrial:false};
 assert.equal(e.classifyFiveSlotDueCommitment(race).ok,true);
 assert.equal(e.classifyFiveSlotDueCommitment({...race,raceNumber:2}).reason,'race_unavailable');
 assert.equal(e.classifyFiveSlotDueCommitment({...race,stance:'invented'}).reason,'race_unavailable');
 assert.equal(e.classifyFiveSlotDueCommitment({...race,useTrial:true}).reason,'race_unavailable');
});

test('skipBreakfast records an idempotent unpaid meal resolution and capped actual health loss', () => {
  const engine = new GameEngine('skip-breakfast');
  engine.state.step = 'd1_morning_breakfast';
  engine.state.health = 3;
  const result = engine.skipBreakfast();
  assert.deepEqual(result, { skipped: true, alreadySettled: false, healthLost: 3, healthAfter: 0 });
  assert.equal(engine.state.cash, 15);
  assert.deepEqual(engine.state.billsSettled, ['d1_food']);
  assert.equal(engine.log.entries.filter((e) => e.type === 'expense_due').length, 0);
  const action = engine.log.entries.find((e) => e.type === 'action' && e.payload.kind === 'breakfast_skipped');
  assert.deepEqual(action.payload, { kind: 'breakfast_skipped', day: 1, billId: 'd1_food', healthLost: 3, healthAfter: 0 });
  assert.deepEqual(engine.skipBreakfast(), { skipped: false, alreadySettled: true });
  assert.equal(engine.state.health, 0);
  const loaded = GameEngine.fromEnvelope(engine.toEnvelope());
  assert.ok(loaded.state.billsSettled.includes('d1_food'));
});

test('skipBreakfast refuses wrong step or an active modal and does not skip a paid meal', () => {
  const engine = new GameEngine('skip-breakfast-guards');
  assert.equal(engine.skipBreakfast().reason, 'wrong_step');
  engine.state.step = 'd1_morning_breakfast';
  engine.state.activeModal = 'other';
  assert.equal(engine.skipBreakfast().reason, 'pending_modal');
  engine.state.activeModal = null;
  engine.billExpense('food', 5);
  assert.equal(engine.skipBreakfast().alreadySettled, true);
  assert.equal(engine.state.health, 100);
  assert.equal(engine.state.cash, 10);
});

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

test('duplicate help is recorded only for first committed-and-revealed duplicate and persists in event log', () => {
  const engine = new GameEngine('duplicate-help');
  const appendDraw = ({ commitSeq, identity, rarity, duplicate, downGained }) => {
    const commit = engine.log.append('draw_committed', { identity, rarity, duplicate, downGained }, engine.state.clock);
    engine.log.append('reveal_shown', {
      commitSeq: commit.seq, identity, rarity, duplicate, downGained,
    }, engine.state.clock);
    return commit.seq;
  };
  const firstCommitSeq = engine.log.append('draw_committed', {
    identity: 'duck-new', rarity: 'common', duplicate: false, downGained: 0,
  }, engine.state.clock).seq;
  assert.equal(engine.getDuplicateConversionHelpState(), null, 'commit alone is not display evidence');
  engine.log.append('reveal_shown', {
    commitSeq: firstCommitSeq, identity: 'duck-new', rarity: 'common', duplicate: false, downGained: 0,
  }, engine.state.clock);
  const firstDuplicateCommitSeq = appendDraw({
    identity: 'duck-old', rarity: 'rare', duplicate: true, downGained: 5,
  });
  appendDraw({ identity: 'duck-old-2', rarity: 'common', duplicate: true, downGained: 1 });

  assert.equal(engine.showDuplicateConversionHelp(firstDuplicateCommitSeq + 2), null, 'a non-source reveal cannot claim help');
  const help = engine.getDuplicateConversionHelpState();
  assert.equal(help.reveal.payload.identity, 'duck-old');
  assert.equal(help.cue, null);
  assert.equal(engine.dismissDuplicateConversionHelp(99), null, 'dismiss-before-show is rejected');
  const cue = engine.showDuplicateConversionHelp(help.reveal.seq);
  assert.equal(cue.type, 'cue_shown');
  assert.equal(cue.payload.cueId, 'duplicate_conversion_help');
  assert.equal(cue.payload.sourceRevealSeq, help.reveal.seq);
  assert.equal(cue.payload.downGained, 5);
  assert.deepEqual(cue.payload.conversionRates, { common: 1, rare: 5, legendary: 20 });
  assert.equal(engine.showDuplicateConversionHelp(help.reveal.seq), null, 'cue is idempotent');
  const dismissed = engine.dismissDuplicateConversionHelp(cue.seq);
  assert.equal(dismissed.payload.sourceCueSeq, cue.seq);
  assert.equal(engine.dismissDuplicateConversionHelp(cue.seq), null, 'dismissal is idempotent');

  const restored = GameEngine.fromEnvelope(engine.toEnvelope());
  assert.equal(restored.getDuplicateConversionHelpState().dismissed, true);
  assert.equal(restored.showDuplicateConversionHelp(help.reveal.seq), null, 'dismissal survives reload');
  assert.equal(restored.log.entries.filter((entry) => entry.type === 'cue_shown').length, 1);
  assert.equal(projectReceipt(restored.log.entries).findings.some((finding) => finding.technique === 'duplicate_conversion_help'), false,
    'ordinary explanatory help does not create a manipulation classification');
});

test('duplicate help rejects spoofed, mismatched, and terminal references', () => {
  const engine = new GameEngine('duplicate-help-guards');
  const orphanRevealSeq = engine.log.append('reveal_shown', {
    commitSeq: 44, identity: 'duck-x', rarity: 'common', duplicate: true, downGained: 1,
  }, engine.state.clock).seq;
  assert.equal(engine.showDuplicateConversionHelp(orphanRevealSeq), null);

  engine.log.append('draw_committed', {
    identity: 'duck-y', rarity: 'rare', duplicate: true, downGained: 5,
  }, engine.state.clock);
  const mismatchedSeq = engine.log.append('reveal_shown', {
    commitSeq: 1, identity: 'duck-y', rarity: 'rare', duplicate: true, downGained: 20,
  }, engine.state.clock).seq;
  assert.equal(engine.showDuplicateConversionHelp(mismatchedSeq), null);
  engine.state.phase = 'terminal';
  assert.equal(engine.dismissDuplicateConversionHelp(mismatchedSeq), null);

  const outOfOrder = new GameEngine('duplicate-help-order');
  outOfOrder.log.append('action', { kind: 'duplicate_help_dismissed', sourceCueSeq: 3 }, outOfOrder.state.clock);
  outOfOrder.log.append('draw_committed', {
    identity: 'duck-z', rarity: 'common', duplicate: true, downGained: 1,
  }, outOfOrder.state.clock);
  const revealSeq = outOfOrder.log.append('reveal_shown', {
    commitSeq: 1, identity: 'duck-z', rarity: 'common', duplicate: true, downGained: 1,
  }, outOfOrder.state.clock).seq;
  outOfOrder.log.append('cue_shown', {
    cueId: 'duplicate_conversion_help', sourceRevealSeq: revealSeq,
    identity: 'duck-z', rarity: 'common', downGained: 1,
  }, outOfOrder.state.clock);
  assert.equal(outOfOrder.getDuplicateConversionHelpState().dismissed, false, 'dismissal before help is not accepted');

  const futureCommit = new GameEngine('duplicate-help-future-commit');
  const futureRevealSeq = futureCommit.log.append('reveal_shown', {
    commitSeq: 1, identity: 'duck-future', rarity: 'common', duplicate: true, downGained: 1,
  }, futureCommit.state.clock).seq;
  futureCommit.log.append('draw_committed', {
    identity: 'duck-future', rarity: 'common', duplicate: true, downGained: 1,
  }, futureCommit.state.clock);
  assert.equal(futureCommit.showDuplicateConversionHelp(futureRevealSeq), null, 'a reveal cannot reference a future commit');
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

test('engine [Plan 38]: Uninstall pressed again while asking keeps the interrupted context, rewards once, and Leave still works', () => {
  const stayEngine = () => {
    const engine = new GameEngine('seed-repeat-uninstall');
    engine.start();
    engine.setupCompanion();
    engine.state.day = 2;
    engine.state.cash = 14.01;
    engine.billExpense('rent', 15);
    return engine;
  };
  const engine = stayEngine();
  assert.equal(engine.state.activeModal, 'escalation');
  engine.clickUninstall();
  const logLength = engine.log.length;
  engine.clickUninstall();
  assert.equal(engine.log.length, logLength, 'the repeated request records nothing');
  assert.deepEqual(engine.state.interruptedContext, { step: 'd2_afternoon_escalation', activeModal: 'escalation' });
  engine.stayUninstall();
  assert.equal(engine.state.activeModal, 'escalation');
  assert.equal(engine.state.step, 'd2_afternoon_escalation');
  assert.equal(engine.state.gems, 80);
  engine.clickUninstall();
  engine.clickUninstall();
  engine.stayUninstall();
  assert.equal(engine.state.gems, 80, 'the reward is granted once');
  assert.equal(engine.state.activeModal, 'escalation');

  const leaving = stayEngine();
  leaving.clickUninstall();
  leaving.clickUninstall();
  assert.equal(leaving.leaveUninstall(), 'uninstall');
  assert.equal(leaving.state.terminalRoute, 'uninstall');
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

// --- Review 02 Required Regressions ---

test('engine [Repair 02 P1]: billExpense is strictly idempotent and prevents duplicate bill processing', () => {
  const engine = new GameEngine('seed-rent-idempotent');
  engine.start();
  engine.setupCompanion();
  engine.advanceDay(2, 'day 2 afternoon');
  assert.equal(engine.state.cash, 15.00);

  // First rent call: paid in full, cash hits $0
  const rent1 = engine.billExpense('rent', 15.00);
  assert.equal(rent1.paid, true);
  assert.equal(rent1.needsEscalation, false);
  assert.equal(rent1.zeroCash, true);
  assert.equal(engine.state.cash, 0);
  assert.equal(engine.state.step, 'd2_afternoon_zerocash');
  assert.equal(engine.state.activeModal, 'zerocash');

  // Second rent call (e.g. repeated click or interrupted handler):
  const rent2 = engine.billExpense('rent', 15.00);
  assert.equal(rent2.paid, true);
  assert.equal(rent2.alreadySettled, true);
  assert.equal(rent2.needsEscalation, false);
  assert.equal(engine.state.cash, 0); // Cash is still 0, not negative or deducted again!
  assert.equal(engine.state.phase, 'playing'); // Not forced into escalation or default!

  // Event log has exactly ONE expense_due and ONE expense_paid for rent
  const rentDueEvents = engine.log.entries.filter((e) => e.type === 'expense_due' && e.payload?.kind === 'rent');
  const rentPaidEvents = engine.log.entries.filter((e) => e.type === 'expense_paid' && e.payload?.kind === 'rent');
  assert.equal(rentDueEvents.length, 1);
  assert.equal(rentPaidEvents.length, 1);
});

test('engine [Repair 02 P1]: reload at paid-zero and unpaid-escalation boundaries preserves coherent progression', () => {
  // Boundary A: Paid-zero boundary
  const engineA = new GameEngine('seed-boundary-a');
  engineA.start();
  engineA.setupCompanion();
  engineA.advanceDay(2, 'day 2 afternoon');
  engineA.billExpense('rent', 15.00); // cash -> 0, step -> d2_afternoon_zerocash, modal -> zerocash

  const envA = engineA.toEnvelope();
  const restoredA = GameEngine.fromEnvelope(envA);
  assert.equal(restoredA.state.cash, 0);
  assert.equal(restoredA.state.step, 'd2_afternoon_zerocash');
  assert.equal(restoredA.state.activeModal, 'zerocash');
  assert.ok(restoredA.state.billsSettled.includes('d2_rent'));

  // Calling billExpense on restored engine does not re-bill
  const reRentA = restoredA.billExpense('rent', 15.00);
  assert.equal(reRentA.alreadySettled, true);
  assert.equal(restoredA.state.cash, 0);

  // Boundary B: Unpaid escalation boundary
  const engineB = new GameEngine('seed-boundary-b');
  engineB.start();
  engineB.setupCompanion();
  engineB.state.cash = 14.01; // Insufficient for $15 rent
  engineB.advanceDay(2, 'day 2 afternoon');
  const rentB = engineB.billExpense('rent', 15.00);
  assert.equal(rentB.paid, false);
  assert.equal(rentB.needsEscalation, true);
  assert.equal(engineB.state.step, 'd2_afternoon_escalation');
  assert.equal(engineB.state.activeModal, 'escalation');

  const envB = engineB.toEnvelope();
  const restoredB = GameEngine.fromEnvelope(envB);
  assert.equal(restoredB.state.step, 'd2_afternoon_escalation');
  assert.equal(restoredB.state.activeModal, 'escalation');
  assert.equal(restoredB.state.activeBill.kind, 'rent');

  // Calling billExpense again does not append another expense_due
  const reRentB = restoredB.billExpense('rent', 15.00);
  assert.equal(reRentB.alreadyPending, true);
  const rentDueEventsB = restoredB.log.entries.filter((e) => e.type === 'expense_due' && e.payload?.kind === 'rent');
  assert.equal(rentDueEventsB.length, 1);
});

test('engine [Repair 02 P1]: hydration reconstructs race completion so deleting state flags cannot permit another payout', () => {
  const engine = new GameEngine('seed-race-payout-protect');
  engine.start();
  engine.setupCompanion();
  engine.state.owned = ['duck-0'];
  const res1 = engine.runRace(1, 'duck-0', 'safe');
  assert.equal(engine.state.gems, 50);

  // Attacker tampers with envelope by clearing completedRaces, raceResults, and resetting step
  const env = engine.toEnvelope();
  env.state.completedRaces = [];
  env.state.raceResults = {};
  env.state.step = 'd1_midday_race';

  // fromEnvelope reconstructs authoritative completed races from event log
  const restored = GameEngine.fromEnvelope(env);
  assert.ok(restored.state.completedRaces.includes(1));
  assert.ok(restored.state.raceResults[1]);
  assert.equal(restored.state.step, 'd1_midday_race_result');

  // Attempting to race again returns cached outcome with ZERO additional gems!
  const res2 = restored.runRace(1, 'duck-0', 'safe');
  assert.equal(res2.place, res1.place);
  assert.equal(restored.state.gems, 50); // Gems remain 50, not 100!
});

test('engine [Plan 23]: affine race input, trial purchase/consumption, save reload, and keyed payout are once-only', () => {
  const engine = new GameEngine('plan21-review');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  const duckId = engine.state.owned[0];
  engine.revealAllPending();
  assert.ok(engine.state.down >= 3, 'the deterministic setup fixture earns enough Down from committed duplicates');
  const downBeforeTrial = engine.state.down;
  const choiceExposure = engine.recordRaceChoicesShown(1, { duckId, fieldBaseSpeed: 8 });
  assert.ok(choiceExposure);
  assert.equal(engine.recordRaceChoicesShown(1, { duckId, fieldBaseSpeed: 8 }), null, 'one stable exposure is logged once across rerenders');
  const trialExposure = engine.recordRaceTrialOfferShown(1);
  assert.ok(trialExposure);
  assert.equal(engine.recordRaceTrialOfferShown(1), null, 'one stable trial affordance exposure is logged once');
  assert.equal(engine.purchaseRaceTrial(), true);
  assert.equal(engine.state.down, downBeforeTrial - 3);

  const first = engine.runRace(1, duckId, 'sprint', { useTrial: true });
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.finishOrder), true);
  assert.throws(() => { first.finishOrder[0].place = 6; }, TypeError);
  engine.recordRaceCueDisplayed(1, { cueId: 'event:finish-line-crossing', text: 'Your duck crossed the finish.' });
  engine.recordRacePlaybackAction(1, 'skip');
  assert.equal(first.status, 'finished');
  assert.equal(first.trialConsumed, true);
  assert.equal(engine.state.raceTrialAvailable, false);
  const resolution = engine.state.raceResolutions[first.raceId];
  assert.equal(resolution.metadata.inputs.playerBaseSpeed, BANNER_1_ROSTER.find((duck) => duck.id === duckId).speed);
  assert.equal(resolution.metadata.inputs.authoredPlayerRating, BANNER_1_ROSTER.find((duck) => duck.id === duckId).speed);
  assert.equal(resolution.metadata.inputs.restFactor, 1, 'never-raced identity keeps the selected rested factor');
  assert.equal(resolution.metadata.inputs.trialCommitted, true);
  assert.equal(resolution.metadata.inputs.dramaArm, 'R2combined-risk-only');
  assert.equal(resolution.metadata.inputs.experiment, 'weave-rank-strong-contact');

  const envelope = engine.toEnvelope();
  const validation = validateSave(envelope);
  assert.equal(validation.valid, true, JSON.stringify(validation.errors));
  const restored = GameEngine.fromEnvelope(envelope);
  const retry = restored.runRace(1, duckId, 'safe', { useTrial: true });
  assert.equal(retry.resolutionDigest, first.resolutionDigest);
  assert.equal(restored.state.gems, engine.state.gems);
  assert.equal(restored.state.down, downBeforeTrial - 3);
  assert.equal(restored.state.raceTrialAvailable, false);
  assert.equal(restored.log.entries.filter((entry) => entry.type === 'race_result').length, 1);
  assert.equal(restored.log.entries.filter((entry) => entry.type === 'reward' && entry.payload?.raceId === first.raceId).length, 1);
  assert.equal(restored.log.entries.filter((entry) => entry.type === 'action' && entry.payload?.kind === 'race_trial_consumed').length, 1);
  const raceReceipt = projectReceipt(restored.log.entries).raceEvidence;
  assert.ok(raceReceipt.displayed.some((item) => item.text.includes('Steady pace')));
  assert.ok(raceReceipt.displayed.some((item) => item.text === 'Your duck crossed the finish.'));
  assert.ok(raceReceipt.did.some((item) => item.text.includes('crossing order')));
  assert.ok(raceReceipt.did.some((item) => item.text.includes('skip')));
  assert.equal(raceReceipt.displayed.some((item) => item.text.includes('collided') || item.text.includes('wall')), false,
    'mechanics that were never displayed are not claimed as shown cues');
});

test('engine [Plan 23]: unresolved guard is persisted once without payout or trial consumption', () => {
  const engine = new GameEngine('plan23-guard-failure');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  const duckId = engine.state.owned[0];
  const downBefore = engine.state.down;
  assert.equal(engine.purchaseRaceTrial(), true);
  const gemsBefore = engine.state.gems;
  engine.resolveRaceCandidate = (input) => resolveSeededRace(input, { maxCompletionTicks: 1 });

  const attempt = engine.runRace(1, duckId, 'safe', { useTrial: true });
  assert.equal(attempt.status, 'unresolved');
  assert.ok(attempt.guardEvidence);
  assert.equal(engine.state.completedRaces.includes(1), false);
  assert.equal(engine.state.raceTrialAvailable, true);
  assert.equal(engine.state.gems, gemsBefore);
  assert.equal(engine.state.down, downBefore - 3);
  assert.equal(engine.log.entries.filter((entry) => entry.type === 'race_result').length, 0);
  assert.equal(engine.log.entries.filter((entry) => entry.type === 'reward' && entry.payload?.kind === 'race_gems').length, 0);

  const envelope = engine.toEnvelope();
  const validation = validateSave(envelope);
  assert.equal(validation.valid, true, JSON.stringify(validation.errors));
  const restored = GameEngine.fromEnvelope(envelope);
  const retry = restored.runRace(1, duckId, 'sprint', { useTrial: true });
  assert.equal(retry.resolutionDigest, attempt.resolutionDigest);
  assert.equal(restored.state.raceTrialAvailable, true);
  assert.equal(restored.state.completedRaces.includes(1), false);
  assert.equal(restored.log.entries.filter((entry) => entry.type === 'race_attempt_unresolved').length, 1);
});

test('engine [Plan 22]: completed race applies the selected 50% repeat penalty exactly once', () => {
  const engine = new GameEngine('plan22-repeat-rest-commit');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  const duckId = engine.state.owned[0];
  const first = engine.runRace(1, duckId, 'safe');
  assert.equal(first.status, 'finished');
  const second = engine.runRace(2, duckId, 'safe');
  assert.equal(second.status, 'finished');
  assert.equal(second.restEvidence.restFactor, 0.5);
  assert.equal(engine.state.raceResolutions.R02.metadata.inputs.playerBaseSpeed, BANNER_1_ROSTER.find((duck) => duck.id === duckId).speed * 0.5);
  assert.equal(engine.state.raceResolutions.R02.metadata.inputs.restFactor, 0.5);
  assert.equal(validateSave(engine.toEnvelope()).valid, true);
  const retry = engine.runRace(2, duckId, 'sprint');
  assert.equal(retry.resolutionDigest, second.resolutionDigest);
  assert.equal(engine.log.entries.filter((entry) => entry.type === 'race_result' && entry.payload.raceNumber === 2).length, 1);
  assert.equal(engine.log.entries.filter((entry) => entry.type === 'reward' && entry.payload.raceId === second.raceId).length, second.payoutGems > 0 ? 1 : 0);
});

test('engine [Plan 23]: both race resolutions fit the paired-save budget and round-trip unchanged', () => {
  const engine = new GameEngine('plan23-two-race-save-budget');
  engine.start();
  engine.setupCompanion();
  engine.commitPromotionalTenPull();
  engine.revealAllPending();
  const duckId = engine.state.owned[0];
  engine.runRace(1, duckId, 'safe');
  engine.runRace(2, duckId, 'sprint');

  const envelope = engine.toEnvelope();
  const serializedRaceBytes = Object.values(envelope.state.raceResolutions)
    .reduce((sum, resolution) => sum + new TextEncoder().encode(JSON.stringify(resolution)).byteLength, 0);
  assert.ok(serializedRaceBytes < 1024 * 1024, `both race resolutions use ${serializedRaceBytes} bytes`);
  const validation = validateSave(envelope);
  assert.equal(validation.valid, true, JSON.stringify(validation.errors));
  const restored = GameEngine.fromEnvelope(envelope);
  for (const raceNumber of [1, 2]) {
    assert.equal(restored.getRaceAttempt(raceNumber).resolutionDigest, engine.getRaceAttempt(raceNumber).resolutionDigest);
    assert.deepEqual(restored.getRaceResolution(raceNumber).trajectory, engine.getRaceResolution(raceNumber).trajectory);
  }
});

test('engine [Plan 21]: getDexCollectionState accurately reflects owned, seen, and missing identities with cosmetics', () => {
  const engine = new GameEngine('seed-plan21-dex-state');
  engine.start();
  engine.state.owned = ['duck-0', 'duck-2'];
  engine.state.seenDexEntries = ['duck-0'];

  const dexState = engine.getDexCollectionState();
  assert.equal(dexState.totalDucks, BANNER_1_ROSTER.length);
  assert.equal(dexState.ownedCount, 2);
  assert.equal(dexState.isComplete, false);

  const d0 = dexState.roster.find((d) => d.id === 'duck-0');
  assert.equal(d0.owned, true);
  assert.equal(d0.seen, true);
  assert.equal(d0.cosmetics.palette, 'classic-yellow');

  const d2 = dexState.roster.find((d) => d.id === 'duck-2');
  assert.equal(d2.owned, true);
  assert.equal(d2.seen, false); // owned but not yet seen in Dex presentation
  assert.equal(d2.cosmetics.palette, 'bubblegum-pink');
  assert.equal(d2.cosmetics.hat, 'sailor-cap');

  const d5 = dexState.roster.find((d) => d.id === 'duck-5');
  assert.equal(d5.owned, false);
  assert.equal(d5.seen, false);

  assert.equal(dexState.sets.length, 1);
  assert.equal(dexState.sets[0].owned, 2);
  assert.equal(dexState.sets[0].total, 6);
  assert.equal(dexState.sets[0].complete, false);
});

test('engine [Plan 21]: recordDexViewed logs action and emits completion_pressure cue only when incomplete', () => {
  const engine = new GameEngine('seed-plan21-dex-viewed');
  engine.start();
  engine.state.owned = ['duck-0', 'duck-1'];

  // Incomplete collection: emits completion_pressure cue
  const res1 = engine.recordDexViewed('hud');
  assert.equal(res1.action.type, 'action');
  assert.equal(res1.action.payload.kind, 'duck_dex_viewed');
  assert.equal(res1.action.payload.source, 'hud');
  assert.ok(res1.cue);
  assert.equal(res1.cue.type, 'cue_shown');
  assert.equal(res1.cue.payload.cueId, 'completion_pressure');
  assert.equal(res1.cue.payload.technique, 'completion_pressure');
  assert.equal(res1.cue.payload.incompleteSets, 1);
  assert.deepEqual(res1.cue.payload.setProgress, [{ set: 'Pond of Destiny', owned: 2, total: 6 }]);

  // Own all 6 ducks: viewing Dex does not emit completion_pressure
  engine.state.owned = BANNER_1_ROSTER.map((d) => d.id);
  const res2 = engine.recordDexViewed('hud');
  assert.equal(res2.action.type, 'action');
  assert.equal(res2.cue, null);
});

test('engine [Plan 21]: recordAcquisitionCue and skipAcquisitionPresentation log truthful events', () => {
  const engine = new GameEngine('seed-plan21-dex-cue');
  engine.start();

  const cue = engine.recordAcquisitionCue('duck-1', { focusMs: 2000, transitionMs: 2500 });
  assert.equal(cue.type, 'cue_shown');
  assert.equal(cue.payload.cueId, 'duck_dex_acquisition');
  assert.equal(cue.payload.identity, 'duck-1');
  assert.equal(cue.payload.rarity, 'common');
  assert.equal(cue.payload.focusMs, 2000);
  assert.equal(cue.payload.transitionMs, 2500);
  assert.ok(engine.state.seenDexEntries.includes('duck-1'));

  // Static acquisition (e.g. reduced motion or fast pull)
  const staticCue = engine.recordAcquisitionCue('duck-2', { isStatic: true });
  assert.equal(staticCue.type, 'cue_shown');
  assert.equal(staticCue.payload.cueId, 'duck_dex_acquisition_static');
  assert.equal(staticCue.payload.focusMs, 0);
  assert.equal(staticCue.payload.transitionMs, 0);

  // Skip presentation
  const skipAction = engine.skipAcquisitionPresentation(3);
  assert.equal(skipAction.type, 'action');
  assert.equal(skipAction.payload.kind, 'acquisition_presentation_skipped');
  assert.equal(skipAction.payload.remainingCount, 3);
});

test('engine [Plan 21]: seenDexEntries hydrates safely and validates in storage envelope', () => {
  const engine = new GameEngine('seed-plan21-dex-storage');
  engine.start();
  engine.commitPromotionalTenPull();
  engine.state.seenDexEntries = [...engine.state.owned];

  const envelope = engine.toEnvelope();
  const valResult = validateSave(envelope);
  assert.equal(valResult.valid, true, JSON.stringify(valResult.errors));

  // Hydration preserves seenDexEntries
  const restored = GameEngine.fromEnvelope(envelope);
  assert.deepEqual(restored.state.seenDexEntries, engine.state.seenDexEntries);

  // Legacy save without seenDexEntries falls back to state.owned
  delete envelope.state.seenDexEntries;
  const legacyRestored = GameEngine.fromEnvelope(envelope);
  assert.deepEqual(legacyRestored.state.seenDexEntries, engine.state.owned);

  // Corrupted seenDexEntries fails semantic validation
  envelope.state.seenDexEntries = 'not-an-array';
  const badResult = validateSave(envelope);
  assert.equal(badResult.valid, false);
  assert.ok(badResult.errors.some((e) => e.includes('seenDexEntries')));
});

test('engine [Plan 21 Repair 01]: zero-reveal Duck-Dex secrecy with plan21-review seed', () => {
  const engine = new GameEngine('plan21-review');
  engine.start();
  engine.commitPromotionalTenPull();

  // Commit acquired 4 distinct identities authoritatively
  assert.equal(engine.state.owned.length, 4);

  // 1. Zero reveals: player sees NO new identities in Duck-Dex
  const dex0 = engine.getDexCollectionState();
  assert.equal(dex0.ownedCount, 0);
  assert.equal(dex0.roster.filter((d) => d.owned).length, 0);
  assert.equal(dex0.sets[0].owned, 0);
  assert.equal(dex0.sets[0].complete, false);
  assert.equal(dex0.sets[0].effectText, 'None active (standard banner set)');

  // 2. Reveal card 0 (duck-3): ONLY duck-3 becomes visible as discovered
  const draw0 = engine.revealDrawAtIndex(0);
  assert.equal(draw0.identity, 'duck-3');

  const dex1 = engine.getDexCollectionState();
  assert.equal(dex1.ownedCount, 1);
  assert.equal(dex1.sets[0].owned, 1);
  const discovered1 = dex1.roster.filter((d) => d.owned);
  assert.equal(discovered1.length, 1);
  assert.equal(discovered1[0].id, 'duck-3');

  // Other unrevealed committed ducks remain hidden as silhouettes
  const duck0 = dex1.roster.find((d) => d.id === 'duck-0');
  const duck1 = dex1.roster.find((d) => d.id === 'duck-1');
  const duck2 = dex1.roster.find((d) => d.id === 'duck-2');
  assert.equal(duck0.owned, false);
  assert.equal(duck1.owned, false);
  assert.equal(duck2.owned, false);

  // 3. Reveal remaining cards: all 4 distinct identities become discovered
  engine.revealAllPending();
  const dexAll = engine.getDexCollectionState();
  assert.equal(dexAll.ownedCount, 4);
  assert.equal(dexAll.sets[0].owned, 4);
  const discoveredAll = dexAll.roster.filter((d) => d.owned).map((d) => d.id).sort();
  assert.deepEqual(discoveredAll, ['duck-0', 'duck-1', 'duck-2', 'duck-3']);
});

test('engine [Plan 21 Repair 01]: duplicate in batch protects unrevealed outcome', () => {
  const engine = new GameEngine('seed-dup-batch');
  engine.start();

  // Fabricate pending reveals where duck-1 appears twice: draw 0 and draw 4
  engine.state.owned = ['duck-1'];
  engine.state.pendingReveals = [
    { commitSeq: 1, identity: 'duck-1', rarity: 'common', duplicate: false, revealed: false },
    { commitSeq: 2, identity: 'duck-2', rarity: 'rare', duplicate: false, revealed: false },
    { commitSeq: 3, identity: 'duck-1', rarity: 'common', duplicate: true, revealed: false, downGained: 1 },
  ];
  engine.state.owned.push('duck-2');

  // Both duck-1 and duck-2 are unrevealed: duck-1 was new in draw 0
  const dex0 = engine.getDexCollectionState();
  assert.equal(dex0.ownedCount, 0);
  assert.equal(dex0.roster.find((d) => d.id === 'duck-1').owned, false);
  assert.equal(dex0.roster.find((d) => d.id === 'duck-2').owned, false);

  // Reveal draw 0 (duck-1): duck-1 is discovered even though draw 3 (duplicate of duck-1) is unrevealed
  engine.revealDrawAtIndex(0);
  const dex1 = engine.getDexCollectionState();
  assert.equal(dex1.ownedCount, 1);
  assert.equal(dex1.roster.find((d) => d.id === 'duck-1').owned, true);
  assert.equal(dex1.roster.find((d) => d.id === 'duck-2').owned, false);
});

test('engine [Plan 21 Repair 02]: duplicate-first reveal discovers identity and subsequent original reveal never loses or duplicates it', () => {
  const engine = new GameEngine('plan21-review');
  engine.start();
  engine.commitPromotionalTenPull();

  // Index 0: duck-3 (duplicate: false)
  // Index 1: duck-3 (duplicate: true)
  assert.equal(engine.state.pendingReveals[0].identity, 'duck-3');
  assert.equal(engine.state.pendingReveals[0].duplicate, false);
  assert.equal(engine.state.pendingReveals[1].identity, 'duck-3');
  assert.equal(engine.state.pendingReveals[1].duplicate, true);

  // 1. Zero reveals: neither is discovered in Duck-Dex
  const dex0 = engine.getDexCollectionState();
  assert.equal(dex0.ownedCount, 0);
  assert.equal(dex0.roster.find((d) => d.id === 'duck-3').owned, false);

  // 2. Reveal index 1 FIRST (the duplicate card):
  // Bath Cadet is visible and discovered immediately
  engine.revealDrawAtIndex(1);
  const dex1 = engine.getDexCollectionState();
  assert.equal(dex1.ownedCount, 1);
  assert.equal(dex1.roster.find((d) => d.id === 'duck-3').owned, true);
  // Other unrevealed identities remain concealed
  assert.equal(dex1.roster.find((d) => d.id === 'duck-0').owned, false);

  // 3. Reveal index 0 LATER (the original non-duplicate card):
  // duck-3 remains discovered and never becomes undiscovered or duplicated
  engine.revealDrawAtIndex(0);
  const dex2 = engine.getDexCollectionState();
  assert.equal(dex2.ownedCount, 1);
  assert.equal(dex2.roster.find((d) => d.id === 'duck-3').owned, true);
  assert.equal(dex2.roster.find((d) => d.id === 'duck-0').owned, false);
});

test('Plan52 staged engine path commits real scheduler and finance state without accepting fake play',()=>{
 let e=new GameEngine('plan52-engine-staged',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 let before=e.rngDraw.serialize();const fake=e.prepareFiveSlotAction({domain:'schedule',action:{type:'play',kind:'pull',operationId:'fake'}});assert.equal(fake.reason,'gameplay_operation_required');assert.equal(e.rngDraw.serialize(),before);
 assert.equal(e.applyLifeIntent({type:'advance'}).reason,'five_slot_action_required');assert.equal(e.openLifeApp(),false);assert.equal(e.buyLifeBundle(60),false);assert.equal(e.commitPromotionalTenPull(),null);assert.equal(e.runRace(1,'duck-0'),null);assert.equal(e.rngDraw.serialize(),before);
 // Resume a genuine pre-repair UI capture; old quiet events remain replayable.
 e=GameEngine.fromEnvelope(JSON.parse(readFileSync('reports/development/plan-52-five-slot-production-transition/production-finance-final/day4-rent-shortfall.save.json','utf8')));before=e.rngDraw.serialize();
 assert.equal(e.state.life.schedule.day,4);assert.equal(e.state.cash,104);assert.equal(e.checkDueObligations().bills[0].id,'rent-1');
 const confirmed=e.log.entries.find(event=>event.type==='life52_intent' && event.payload.intent.action.type==='meal');
 assert.deepEqual(confirmed.payload.operation,{confirmed:true});
 assert.equal(e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'buy',operationId:'blocked'}}).reason,'financial_obligation_due');
 const loanIntent={domain:'finance',action:{type:'accept_loan',billId:'rent-1',id:'loan'}};
 const beforePreview=e.log.length;assert.equal(e.previewFiveSlotLoanTerms('rent-1').totalCents,9900);assert.equal(e.previewFiveSlotDueOptions().shortfallCents,6600);assert.equal(e.log.length,beforePreview);
 assert.equal(e.prepareFiveSlotAction(loanIntent).reason,'loan_terms_not_shown');const terms=e.recordFiveSlotLoanTermsShown('rent-1');assert.equal(terms.payload.principalCents,6600);assert.equal(terms.payload.feeCents,3300);assert.deepEqual(terms.payload.due,{day:9,slot:'midday'});
 let p=e.prepareFiveSlotAction(loanIntent);assert.equal(p.ok,true);let r=e.commitFiveSlotAction(p.proposal);assert.equal(r.ok,true);assert.equal(e.state.cash,170);assert.equal(e.state.life.finance.loans[0].principalCents,6600);
 p=e.prepareFiveSlotAction({domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:'rent-payment'}});assert.equal(p.ok,true);r=e.commitFiveSlotAction(p.proposal);assert.equal(r.ok,true);assert.equal(e.state.cash,0);assert.equal(e.state.life.finance.rents[0].status,'paid');
 assert.equal(e.commitFiveSlotAction(p.proposal).ok,false);assert.equal(e.state.cash,0);assert.equal(e.rngDraw.serialize(),before);assert.equal(e.state.debt,99);
 // A second genuine UI capture reaches the due deadline under the earlier
 // policy; the pre-existing quiet events must still replay after this repair.
 const dueSave=JSON.parse(readFileSync('reports/development/plan-52-five-slot-production-transition/production-finance-final/day9-loan-due.save.json','utf8'));
 const rebuilt=new EventLog();for(const event of dueSave.eventLog.filter(event=>event.type!=='life52_due_options_shown' || !event.payload.bills?.some(bill=>bill.id==='loan-1')))rebuilt.append(event.type,event.payload,event.clock);dueSave.eventLog=rebuilt.entries;e=GameEngine.fromEnvelope(dueSave);
 assert.equal(e.state.life.schedule.day,9);assert.equal(e.state.life.schedule.slot,'midday');assert.equal(e.checkDueObligations().bills[0].id,'loan-1');
 const unpaid={domain:'finance',action:{type:'leave_unpaid',loanId:'loan-1',id:'default',confirmed:true,optionsDisclosed:true}};assert.equal(e.prepareFiveSlotAction(unpaid).reason,'default_evidence_required');
 const shown=e.recordFiveSlotDueOptionsShown();assert.deepEqual(shown.payload.saleOptions,['couch','tv']);assert.equal(e.isTerminal(),false);
 p=e.prepareFiveSlotAction(unpaid);assert.equal(p.ok,true);r=e.commitFiveSlotAction(p.proposal);assert.equal(r.ok,true);assert.equal(e.state.terminalRoute,'running_on_empty');assert.equal(e.state.debt,99);assert.equal(e.log.entries.filter(x=>x.type==='terminal').at(-1).payload.reason,'loan_unaffordable');assert.equal(e.commitFiveSlotAction(p.proposal).ok,false);
 const receipt=e.presentReceipt();
 assert.equal(receipt.summary.finalCash,e.state.cash);
 assert.equal(receipt.summary.finalHealth,e.state.health);
 assert.equal(receipt.summary.finalDebt,99);
 assert.ok(receipt.accounting.lines.some(line=>line.text.includes('Loan terms shown: $66.00 borrowed')));
 assert.ok(receipt.accounting.lines.some(line=>line.text.includes('the loan could not be repaid')));
 const envelope=e.toEnvelope();assert.deepEqual(validateFiveSlotTransactionHistory(envelope),[]);assert.deepEqual(validateSave(envelope,{experimentalFiveSlot:true}),{valid:true,errors:[]});
 const noTerms=structuredClone(envelope);noTerms.eventLog=noTerms.eventLog.filter(event=>event.type!=='life52_loan_terms_shown');
 assert.ok(validateFiveSlotTransactionHistory(noTerms).some(error=>error.includes('Loan terms were not shown')));
 const noTerminal=structuredClone(envelope);noTerminal.eventLog=noTerminal.eventLog.filter(event=>event.type!=='terminal');
 assert.ok(validateFiveSlotTransactionHistory(noTerminal).some(error=>error.includes('terminal')));
 const resumed=structuredClone(envelope);resumed.state.phase='playing';assert.ok(validateFiveSlotTransactionHistory(resumed).some(error=>/terminal/i.test(error)));
});

test('Plan52 staged engine coordinates Ren reservation and actual visit start',()=>{
 const e=new GameEngine('plan52-ren-staged',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();let n=0;
 const schedule=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`s-${++n}`}});assert.equal(p.ok,true,JSON.stringify(p));const r=e.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(r.ok,true,JSON.stringify(r));};
 const social=action=>{const intent={operationId:`ren-op-${++n}`,action};const r=e.applyFiveSlotSocialAction(intent,e.log.length);assert.equal(r.ok,true,JSON.stringify({action,r}));return r;};
 for(let day=1;day<=2;day++){
  schedule({type:'meal',choice:'buy'});schedule({type:'start',kind:'work'});schedule({type:'complete',activityId:e.state.life.schedule.active.id});schedule({type:'meal',choice:'buy'});
  if(day===1){schedule({type:'start',kind:'early-bed'});schedule({type:'complete',activityId:e.state.life.schedule.active.id});}
 }
 social({type:'social46_activate',version:1,revision:2});social({type:'social46_knock_shown'});social({type:'social46_door_open'});
 for(const choice of ['meet','glad','continue','thanks','finish']){social({type:'social46_intro_line_shown'});social({type:'social46_intro_choose',choice});}
 social({type:'social46_offer',day:2,initiator:'ren',activity:'door'});const id=e.state.life.social46.pending.id;social({type:'social46_offer_shown',id});social({type:'social46_reply',id,choice:'accept'});assert.equal(e.state.life.schedule.active,null);
 social({type:'social46_visit_knock_shown',id});social({type:'social46_visit_open',id});social({type:'social46_visit_arrival_shown',id,lookVersion:1});social({type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1});
 assert.equal(e.state.life.schedule.active.planId,id);assert.equal(e.state.life.social46.scene.id,id);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
 const snapshot=structuredClone(e.state);assert.equal(e.applyFiveSlotSocialAction({operationId:'stale',action:{type:'social46_scene_shown',id}},e.log.length-1).reason,'stale_callback');assert.deepEqual(e.state,snapshot);
});

test('five-slot uninstall records interrupted work without awarding its wage',()=>{
 const e=new GameEngine('plan52-work-interrupted',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();
 for(const action of [{type:'meal',choice:'skip',operationId:'meal'},{type:'start',kind:'work',operationId:'work'}]){
  const p=e.prepareFiveSlotAction({domain:'schedule',action});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);
 }
 const cash=e.state.cash,id=e.state.life.schedule.active.id;e.clickUninstall();e.leaveUninstall();
 const interruption=e.log.entries.find(event=>event.type==='work_interrupted');assert.deepEqual(interruption.payload,{id,kind:'scheduled',day:1});assert.equal(e.state.cash,cash);
 assert.equal(e.state.terminalRoute,'uninstall');
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
 const continued=structuredClone(e.toEnvelope());continued.eventLog.push({seq:continued.eventLog.length,type:'income',payload:{kind:'asset_sale',asset:'tv',amount:40}});
 assert.ok(validateFiveSlotTransactionHistory(continued).some(error=>error.includes('after terminal')));
});

test('five-slot engine stages actual work story and records the paid payslip once',()=>{
 let e=new GameEngine('plan52-work-story',{lifePolicy:'five-slot-v1',tutorialShift:true});e.start();e.setupCompanion();
 const breakfast=e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'buy',operationId:'breakfast'}});assert.equal(breakfast.ok,true);assert.equal(e.commitFiveSlotAction(breakfast.proposal,{confirmed:true}).ok,true);
 assert.equal(e.prepareFiveSlotAction({domain:'schedule',action:{type:'start',kind:'work',operationId:'bypass'}}).reason,'story_work_required');
 assert.equal(e.beginStoryWork('agree').ok,true);const id=e.state.life.story47.id;
 assert.equal(e.applyFiveSlotWorkStory({type:'advance',id,operationId:'unseen'},e.log.length).reason,'story_not_shown');
 assert.ok(e.showLifeStory47(id,'commute'));assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);e=GameEngine.fromEnvelope(e.toEnvelope());
 assert.equal(e.showLifeStory47(id,'commute'),null);e.clickUninstall();assert.equal(e.applyFiveSlotWorkStory({type:'advance',id,operationId:'covered'},e.log.length).reason,'presentation_covered');e.stayUninstall();
 assert.equal(e.applyFiveSlotWorkStory({type:'advance',id,operationId:'arrive'},e.log.length).ok,true);
 assert.equal(e.applyFiveSlotWorkStory({type:'complete',id,operationId:'hidden'},e.log.length).reason,'story_not_shown');
 assert.ok(e.showLifeStory47(id,'work'));const complete={type:'complete',id,operationId:'paid',confirmed:true};
 assert.equal(e.applyFiveSlotWorkStory(complete,e.log.length).ok,true);assert.equal(e.state.cash,134);assert.equal(e.state.life.story47.stage,'payslip');
 assert.equal(e.log.entries.filter(event=>event.type==='income' && event.payload.transactionId===id).length,1);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);assert.equal(validateSave(e.toEnvelope()).valid,false);
 assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 const forgedCash=structuredClone(e.toEnvelope());forgedCash.state.cash+=1;assert.equal(validateSave(forgedCash,{experimentalFiveSlot:true}).valid,false);e=GameEngine.fromEnvelope(e.toEnvelope());
 const forgedStory=structuredClone(e.toEnvelope());forgedStory.eventLog.find(event=>event.type==='life52_effect' && event.payload.effect.type==='story47_started').payload.effect.story.commute='forged';
 const rebuilt=new EventLog();for(const event of forgedStory.eventLog)rebuilt.append(event.type,event.payload,event.clock);forgedStory.eventLog=rebuilt.entries;
 assert.equal(validateSave(forgedStory,{experimentalFiveSlot:true}).valid,false);
 assert.equal(e.applyFiveSlotWorkStory(complete,e.log.length).reason,'duplicate_operation');
 assert.equal(e.applyFiveSlotWorkStory({type:'dismiss',id,operationId:'back-home'},e.log.length).ok,true);assert.equal(e.state.life.story47,null);
 e.finishRunComplete();const receipt=e.presentReceipt();assert.equal(receipt.summary.finalCash,134);
 const envelope=e.toEnvelope();assert.deepEqual(validateFiveSlotTransactionHistory(envelope),[]);
 const missing=structuredClone(envelope);missing.eventLog=missing.eventLog.filter(event=>!(event.type==='story47_shown' && event.payload.stage==='work'));
 assert.ok(validateFiveSlotTransactionHistory(missing).length>0);
});

test('five-slot future rent shift remains reserved after deliberate early rent payment',()=>{
 const e=new GameEngine('plan52-rescue-paid',{lifePolicy:'five-slot-v1',tutorialShift:true});e.start();e.setupCompanion();let n=0;
 const act=action=>{const intent={domain:'schedule',action:{...action,operationId:`rescue-engine-${++n}`}};const p=e.prepareFiveSlotAction(intent);assert.equal(p.ok,true,JSON.stringify(p));if(p.proposal.schedule.disclosures.length)assert.ok(e.recordFiveSlotScheduleWarningShown(p.proposal));const r=e.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(r.ok,true,JSON.stringify(r));};
 const work=()=>{assert.equal(e.beginStoryWork('agree').ok,true);const id=e.state.life.story47.id;assert.ok(e.showLifeStory47(id,'commute'));assert.equal(e.applyFiveSlotWorkStory({type:'advance',id,operationId:`arrive-${++n}`},e.log.length).ok,true);assert.ok(e.showLifeStory47(id,'work'));assert.equal(e.applyFiveSlotWorkStory({type:'complete',id,operationId:`finish-${++n}`,confirmed:true},e.log.length).ok,true);assert.equal(e.applyFiveSlotWorkStory({type:'dismiss',id,operationId:`dismiss-${++n}`},e.log.length).ok,true);};
 const earlyBed=()=>{act({type:'start',kind:'early-bed'});act({type:'complete',activityId:e.state.life.schedule.active.id});};
 for(let day=1;day<=3;day++){act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});earlyBed();}
 assert.equal(e.state.cash,224);assert.equal(e.state.life.schedule.day,4);
 const priorDown=e.state.down;e.state.down=3;const beforeTrialLog=e.log.length;assert.equal(e.purchaseRaceTrial(),false);assert.equal(e.state.down,3);assert.equal(e.log.length,beforeTrialLog);e.state.down=priorDown;
 const reserveIntent={domain:'schedule',action:{type:'reserve-overtime',reservationId:'extra',rentId:'rent-1',day:5,operationId:'shift-warning'}};
 const reserve=e.prepareFiveSlotAction(reserveIntent);assert.equal(reserve.ok,true);assert.equal(e.commitFiveSlotAction(reserve.proposal,{confirmed:true}).reason,'warning_not_shown');
 const beforeWarning=structuredClone(e.state),rngBeforeWarning=e.rngDraw.serialize();assert.ok(e.recordFiveSlotScheduleWarningShown(reserve.proposal));assert.ok(e.recordFiveSlotWarningCancelled(reserve.proposal));
 assert.equal(e.commitFiveSlotAction(reserve.proposal,{confirmed:true}).reason,'warning_not_shown');assert.deepEqual(e.state,beforeWarning);assert.equal(e.rngDraw.serialize(),rngBeforeWarning);assert.ok(e.recordFiveSlotScheduleWarningShown(reserve.proposal));
 assert.equal(e.commitFiveSlotAction(reserve.proposal,{confirmed:true}).ok,true);
 assert.equal(e.recordFiveSlotWarningCancelled(reserve.proposal),null);
 const payment=e.prepareFiveSlotAction({domain:'finance',action:{type:'pay_rent',billId:'rent-1',id:'pay-early'}});assert.equal(payment.ok,true);assert.equal(e.commitFiveSlotAction(payment.proposal).ok,true);
 assert.equal(e.state.life.schedule.overtimeReservation.status,'reserved');assert.equal(e.state.cash,54);
 act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});earlyBed();
 act({type:'meal',choice:'buy'});work();act({type:'meal',choice:'buy'});act({type:'start',kind:'overtime',reservationId:'extra'});act({type:'complete',activityId:e.state.life.schedule.active.id});
 assert.equal(e.state.cash,210);assert.equal(e.state.health,85);assert.equal(e.state.life.schedule.overtimeReservation.status,'completed');assert.equal(e.state.life.finance.rents[0].status,'paid');
 assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 const noWarning=structuredClone(e.toEnvelope());noWarning.eventLog=noWarning.eventLog.filter(event=>event.type!=='life52_schedule_warning_shown');
 assert.ok(validateFiveSlotTransactionHistory(noWarning).some(error=>/warning/i.test(error)));
 e.finishRunComplete();const receipt=e.presentReceipt();assert.ok(receipt.accounting.lines.some(line=>line.text.includes('extra-shift terms')));assert.ok(receipt.accounting.lines.some(line=>line.text.includes('Cancelled after a schedule warning')));
});

test('five-slot late-play warning must be shown before its actual paid pull',()=>{
 const e=new GameEngine('plan52-play-warning',{lifePolicy:'five-slot-v1',tutorialShift:true});e.start();e.setupCompanion();let n=0;
 const meal=choice=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice,operationId:`meal-${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 meal('buy');assert.equal(e.beginStoryWork('agree').ok,true);const id=e.state.life.story47.id;
 assert.ok(e.showLifeStory47(id,'commute'));assert.equal(e.applyFiveSlotWorkStory({type:'advance',id,operationId:'arrive'},e.log.length).ok,true);
 assert.ok(e.showLifeStory47(id,'work'));assert.equal(e.applyFiveSlotWorkStory({type:'complete',id,operationId:'finish',confirmed:true},e.log.length).ok,true);
 assert.equal(e.applyFiveSlotWorkStory({type:'dismiss',id,operationId:'home'},e.log.length).ok,true);meal('buy');
 assert.equal(e.openLifeApp(),true);assert.ok(e.commitPromotionalTenPull());e.revealAllPending();assert.equal(e.buyLifeBundle(1090),true);assert.equal(e.buyLifeBundle(1090),true);
 const preview=e.prepareFiveSlotPlay('pull',{operationId:'late-paid',extend:true});assert.equal(preview.ok,true);assert.ok(preview.proposal.schedule.disclosures.includes('late-fatigue'));
 const before=structuredClone(e.state),rng=e.rngDraw.serialize();assert.equal(e.commitPaidPull(1,{confirmNext:true,confirmConsequences:true,operationId:'late-paid'}),null);assert.deepEqual(e.state,before);assert.equal(e.rngDraw.serialize(),rng);
 assert.ok(e.recordFiveSlotPlayWarningShown(preview.proposal));assert.equal(e.commitPaidPull(1,{confirmNext:true,confirmConsequences:true,operationId:'late-paid'}).length,1);
 assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 const missing=structuredClone(e.toEnvelope());missing.eventLog=missing.eventLog.filter(event=>event.type!=='life52_schedule_warning_shown');assert.ok(validateFiveSlotTransactionHistory(missing).some(error=>error.includes('warning was not shown')));
});

test('five-slot uninstall preserves an unfinished phone session without inventing its visibility',()=>{
 const e=new GameEngine('plan52-session-interrupted',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();let n=0;
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`u-${++n}`}});assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal,{confirmed:true}).ok,true);};
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
 assert.equal(e.openLifeApp(),true);assert.ok(e.commitPromotionalTenPull());const id=e.state.life.schedule.active.id;
 e.clickUninstall();e.leaveUninstall();const interruption=e.log.entries.find(event=>event.type==='session_interrupted');
 assert.equal(interruption.payload.id,id);assert.equal(interruption.payload.suspended,null);assert.equal(interruption.payload.pull,true);
 assert.ok(e.presentReceipt().accounting.lines.some(line=>line.text==='A phone session remained when the run ended.'));
});

test('Plan52 staged engine commits actual pull with schedule, RNG and prior results atomically',()=>{
 const e=new GameEngine('plan52-real-pull',{lifePolicy:'five-slot-v1'});e.start();e.setupCompanion();let n=0;
 const act=action=>{const p=e.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`p-${++n}`}});assert.equal(p.ok,true,JSON.stringify(p));const r=e.commitFiveSlotAction(p.proposal,{confirmed:true});assert.equal(r.ok,true,JSON.stringify(r));};
 act({type:'meal',choice:'buy'});act({type:'start',kind:'work'});act({type:'complete',activityId:e.state.life.schedule.active.id});act({type:'meal',choice:'buy'});
 assert.equal(e.state.life.schedule.slot,'evening');assert.equal(e.openLifeApp(),true);
 const before={state:structuredClone(e.state),log:e.log.entries,rng:e.rngDraw.serialize()};e.sampleLifeDraw=()=>{throw Error('forced draw failure');};assert.throws(()=>e.commitPromotionalTenPull(),/forced draw failure/);assert.deepEqual(e.state,before.state);assert.deepEqual(e.log.entries,before.log);assert.equal(e.rngDraw.serialize(),before.rng);delete e.sampleLifeDraw;
 const draws=e.commitPromotionalTenPull();assert.equal(draws.length,10);assert.equal(e.state.life.schedule.active.kind,'session');assert.equal(e.state.life.schedule.active.pullUsed,true);const after=e.rngDraw.serialize();assert.notEqual(after,before.rng);assert.strictEqual(e.commitPromotionalTenPull(),e.state.pendingReveals);assert.equal(e.rngDraw.serialize(),after);assert.deepEqual(validateSeededDrawHistory(e.toEnvelope()),[]);
 const beforeRace={state:structuredClone(e.state),log:e.log.entries,rng:e.rngDraw.serialize()};e.resolveRaceCandidate=()=>{throw Error('forced race failure');};assert.throws(()=>e.runRace(1,e.state.owned[0]),/forced race failure/);assert.deepEqual(e.state,beforeRace.state);assert.deepEqual(e.log.entries,beforeRace.log);assert.equal(e.rngDraw.serialize(),beforeRace.rng);delete e.resolveRaceCandidate;
 assert.equal(e.runRace(2,e.state.owned[0]),null);const race=e.runRace(1,e.state.owned[0]);assert.ok(race);assert.equal(e.state.life.schedule.active.raceUsed,true);assert.strictEqual(e.runRace(1,e.state.owned[0]),e.getRaceAttempt(1));assert.deepEqual(validateSeededRaceHistory(e.toEnvelope()),[]);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
 const alteredOutcome=structuredClone(e.toEnvelope());alteredOutcome.eventLog.find(event=>event.type==='race_result').payload.place=99;
 assert.ok(validateFiveSlotTransactionHistory(alteredOutcome).some(error=>error.includes('outcome mismatch')));
 const wrongClock=structuredClone(e.toEnvelope());wrongClock.state.clock.label='day 2 morning';
 assert.ok(validateFiveSlotTransactionHistory(wrongClock).some(error=>error.includes('schedule clock')));
 e.revealAllPending();assert.equal(e.buyLifeBundle(1090),true);assert.equal(e.buyLifeBundle(1090),true);
 const pending=structuredClone(e.state),rngBeforeExtension=e.rngDraw.serialize();assert.equal(e.commitPaidPull(1,{confirmNext:true}),null);assert.deepEqual(e.state,pending);assert.equal(e.rngDraw.serialize(),rngBeforeExtension);
 const paid=e.commitPaidPull(1,{confirmNext:true,confirmConsequences:true});assert.equal(paid.length,1);assert.equal(e.state.life.schedule.slot,'late-evening');assert.equal(e.state.life.schedule.fatigue.pending,true);assert.deepEqual(validateSeededDrawHistory(e.toEnvelope()),[]);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
 assert.deepEqual(validateSave(e.toEnvelope(),{experimentalFiveSlot:true}),{valid:true,errors:[]});
 const freePaidDraw=structuredClone(e.toEnvelope());freePaidDraw.eventLog.find(event=>event.type==='purchase' && event.payload.kind==='single_pull').payload.cost=0;
 assert.ok(validateFiveSlotTransactionHistory(freePaidDraw).some(error=>error.includes('draw transaction')));
 const extraReward=structuredClone(e.toEnvelope());extraReward.eventLog.push({seq:extraReward.eventLog.length,type:'reward',payload:{kind:'race_gems',gems:500}});
 assert.ok(validateFiveSlotTransactionHistory(extraReward).some(error=>error.includes('standalone outcome')));
});

test('Plan52 due options allow one-time furniture sales without automatically paying',()=>{
 const e=GameEngine.fromEnvelope(JSON.parse(readFileSync('reports/development/plan-52-five-slot-production-transition/production-finance-final/day4-rent-shortfall.save.json','utf8')));
 const shown=e.recordFiveSlotDueOptionsShown();assert.equal(shown.payload.shortfallCents,6600);assert.deepEqual(shown.payload.loanRentIds,['rent-1']);assert.equal(shown.payload.overtimeAvailable,true);assert.equal(e.isTerminal(),false);
 assert.equal(e.sellFiveSlotAsset('couch',e.log.length).ok,true);assert.equal(e.sellFiveSlotAsset('couch',e.log.length).reason,'unavailable');assert.equal(e.sellFiveSlotAsset('tv',e.log.length).ok,true);assert.equal(e.state.cash,174);assert.equal(e.state.life.finance.rents[0].status,'pending');
 const hold={domain:'finance',action:{type:'leave_unpaid',billId:'rent-1',id:'hold',confirmed:true,optionsDisclosed:true}};assert.equal(e.prepareFiveSlotAction(hold).reason,'default_evidence_required');const after=e.recordFiveSlotDueOptionsShown();assert.deepEqual(after.payload.saleOptions,[]);
 const p=e.prepareFiveSlotAction(hold);assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal).ok,true);const terminal=e.log.entries.filter(x=>x.type==='terminal');assert.equal(terminal.length,1);assert.equal(terminal[0].payload.reason,'first_rent_withheld');assert.equal(e.state.cash,174);
 assert.deepEqual(validateFiveSlotTransactionHistory(e.toEnvelope()),[]);
 const forged=structuredClone(e.toEnvelope());forged.eventLog.find(event=>event.type==='income' && event.payload.asset==='couch').payload.amount=300;
 assert.ok(validateFiveSlotTransactionHistory(forged).some(error=>error.includes('Invalid asset sale')));
});

test('due option display v2 is replayable and forged display versions or fields are rejected',()=>{
 const initial=JSON.parse(readFileSync('reports/development/plan-52-five-slot-production-transition/production-finance-final/day4-rent-shortfall.save.json','utf8'));
 const e=GameEngine.fromEnvelope(initial);const displayed=e.recordFiveSlotDueOptionsShown();assert.equal(displayed.payload.displayVersion,2);
 const valid=e.toEnvelope();assert.equal(validateSave(valid,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid,true);
 for(const mutate of [p=>{p.displayVersion=3;},p=>{p.saleOptions=[];},p=>{p.extra=true;}]){
  const changed=structuredClone(valid);mutate(changed.eventLog.at(-1).payload);const rebuilt=new EventLog();for(const event of changed.eventLog)rebuilt.append(event.type,event.payload,event.clock);changed.eventLog=rebuilt.entries;
  assert.equal(validateSave(changed,{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid,false);
 }
});

test('legacy v1 shown due options still authorize and replay an explicitly confirmed financial default',()=>{
 const initial=JSON.parse(readFileSync('reports/development/plan-52-five-slot-production-transition/production-finance-final/day4-rent-shortfall.save.json','utf8'));
 const e=GameEngine.fromEnvelope(initial);assert.equal(e.log.entries.at(-1).type,'life52_due_options_shown');assert.equal(Object.hasOwn(e.log.entries.at(-1).payload,'displayVersion'),false);
 const action={domain:'finance',action:{type:'leave_unpaid',billId:'rent-1',id:'legacy-default',confirmed:true,optionsDisclosed:true}};
 const p=e.prepareFiveSlotAction(action);assert.equal(p.ok,true);assert.equal(e.commitFiveSlotAction(p.proposal).ok,true);
 assert.equal(e.log.entries.filter(event=>event.type==='terminal').length,1);assert.equal(validateSave(e.toEnvelope(),{experimentalFiveSlot:true,requireFiveSlotTutorial:true}).valid,true);
});
