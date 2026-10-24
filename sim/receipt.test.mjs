import test from 'node:test';
import assert from 'node:assert/strict';
import { Run, simulate, preDrawOdds } from './model.mjs';
import { makeStrategy } from './strategies.mjs';
import { projectReceipt, receiptText } from './receipt.mjs';
import { verifyChain, verifyCompleteness, EventLog } from './event-log.mjs';
import { runMatchedWindows } from './run-experiments.mjs';

const DISPLAY_TYPES = new Set(['cue_shown', 'offer_shown', 'retention_modal_shown', 'reveal_shown']);

/** Every "We displayed" line must cite a log entry that records a display. */
function assertDisplayedProvenance(run, receipt) {
  const bySeq = new Map(run.log.entries.map((e) => [e.seq, e]));
  for (const f of receipt.findings) {
    for (const l of f.displayed) {
      assert.ok(l.seq !== null && DISPLAY_TYPES.has(bySeq.get(l.seq).type), `${f.technique}: displayed line cites ${bySeq.get(l.seq)?.type}`);
    }
    for (const l of f.did) assert.ok(l.seq === null || bySeq.has(l.seq));
    assert.equal(f.question.answer, null);
  }
}

function paidTenPull(params, exit) {
  const run = new Run({ startGems: 1600, ...params }, 'exit');
  run.start();
  const res = run.pull(10, { exit });
  const interrupted = res.interrupted;
  if (interrupted) run.uninstall('leave');
  return { run, interrupted, receipt: projectReceipt(run.log.entries) };
}

const paidLedger = (receipt) => receipt.pullLedger.filter((l) => l.purchaseKind === 'ten_pull');

test('S4 exit on both sides of the commit/reveal boundary (sequential commit): committed-not-shown stays out of "We displayed"', () => {
  const before = paidTenPull({}, { draw: 4, boundary: 'after_commit_before_reveal' });
  const led = paidLedger(before.receipt);
  assert.equal(led.length, 4); // draws 5..10 never committed in sequential mode
  assert.deepEqual(led.map((l) => l.revealed), [true, true, true, false]);
  assert.equal(led[3].displayed, null);
  assert.ok(led[3].committed.identity); // the committed result is reportable as a result
  assert.equal(before.receipt.terminalRoute, 'uninstall');
  assert.equal(before.receipt.receiptShown, true);
  assertDisplayedProvenance(before.run, before.receipt);
  // no reveal entry exists for the committed-but-unshown draw, so no displayed line can stand on it
  assert.equal(before.run.log.entries.filter((e) => e.type === 'reveal_shown' && e.payload.commitSeq === led[3].committedSeq).length, 0);
  // the Down total in the secondary-currency display counts only revealed duplicates
  const shownDown = before.run.log.entries.filter((e) => e.type === 'reveal_shown').reduce((s, e) => s + e.payload.downGained, 0);
  const sc = before.receipt.findings.find((f) => f.technique === 'secondary_currency');
  if (sc) assert.ok(sc.displayed[0].text.includes(shownDown + ' Down in total'));
  // cost was still paid and recorded
  const buy = before.run.log.entries.find((e) => e.payload.kind === 'ten_pull');
  assert.equal(buy.payload.cost, 1600);

  const after = paidTenPull({}, { draw: 4, boundary: 'after_reveal' });
  const led2 = paidLedger(after.receipt);
  assert.deepEqual(led2.map((l) => l.revealed), [true, true, true, true]);
  assert.equal(led2[3].displayed.identity, led2[3].committed.identity);

  const early = paidTenPull({}, { draw: 4, boundary: 'before_commit' });
  assert.equal(paidLedger(early.receipt).length, 3);
});

test('S4 exit boundaries in batch commit mode: all ten committed, only earlier reveals displayed', () => {
  const r = paidTenPull({ commitMode: 'batch' }, { draw: 4, boundary: 'after_commit_before_reveal' });
  const led = paidLedger(r.receipt);
  assert.equal(led.length, 10);
  assert.deepEqual(led.map((l) => l.revealed), [true, true, true, false, false, false, false, false, false, false]);
  assertDisplayedProvenance(r.run, r.receipt);
  const none = paidTenPull({ commitMode: 'batch' }, { draw: 1, boundary: 'before_commit' });
  assert.equal(paidLedger(none.receipt).length, 0);
  assert.equal(none.receipt.terminalRoute, 'uninstall');
  const shownAll = paidTenPull({ commitMode: 'batch' }, { draw: 10, boundary: 'after_reveal' });
  assert.equal(paidLedger(shownAll.receipt).filter((l) => l.revealed).length, 10);
});

test('S4 exit during the opening free ten-pull (mid-reveal) still reaches the Receipt, with no starter offer', () => {
  const run = new Run({}, 'open');
  run.start({ openingExit: { draw: 2, boundary: 'after_commit_before_reveal' } });
  run.uninstall('leave');
  const r = projectReceipt(run.log.entries);
  assert.equal(r.pullLedger.length, 2);
  assert.deepEqual(r.pullLedger.map((l) => l.revealed), [true, false]);
  assert.equal(r.terminalRoute, 'uninstall');
  assert.equal(r.findings.some((f) => f.technique === 'anchoring'), false);
  assertDisplayedProvenance(run, r);
});

test('S4 pre-draw conditional odds: each draw reports its own actual odds, shown or not', () => {
  const { run, receipt } = paidTenPull({ softPityStart: 3, hardPity: 6, rarity: { common: 0.9, rare: 0.1, legendary: 0.01 } }, null);
  const led = paidLedger(receipt);
  assert.equal(led.length, 10);
  for (const l of led) {
    const expected = preDrawOdds(run.p, l.pityBefore);
    assert.equal(l.preDrawOdds.legendary, expected.legendary);
    assert.equal(l.preDrawOdds.common, expected.common);
    assert.equal(l.preDrawOdds.rare, expected.rare);
  }
  assert.ok(new Set(led.map((l) => l.preDrawOdds.legendary)).size > 1); // odds differ draw by draw
});

test('S4 pity cue is named only when its cue fired; odds still appear in the ledger', () => {
  const hidden = new Run({ startGems: 1600, pityCounterVisible: false }, 'nocue');
  hidden.start();
  hidden.pull(10);
  const r = projectReceipt(hidden.log.entries);
  assert.equal(r.findings.some((f) => f.technique === 'sunk_cost_pity'), false);
  assert.ok(r.pullLedger.length >= 20 && r.pullLedger.every((l) => l.preDrawOdds));
  const shown = new Run({ startGems: 1600 }, 'cue');
  shown.start();
  shown.pull(10);
  const r2 = projectReceipt(shown.log.entries);
  const f = r2.findings.find((x) => x.technique === 'sunk_cost_pity');
  assert.ok(f && f.displayed.length === 1 && f.did[0].text.includes('actual pre-draw legendary odds'));
  assert.ok(f.did[0].text.includes('raised soft-pity odds') && f.did[0].text.includes('hard guarantee'));
});

test('S4 zero cash and unpaid expense: escalation is logged in order and the Receipt route is running_on_empty', () => {
  const run = simulate({ startCash: 0, wagePerDay: 0, maxDays: 60 }, 'zero', makeStrategy('frugal_single'));
  const r = projectReceipt(run.log.entries);
  assert.equal(r.terminalRoute, 'running_on_empty');
  assert.equal(r.receiptShown, true);
  const e = run.log.entries;
  for (const off of e.filter((x) => x.type === 'escalation_offered')) {
    assert.equal(e[off.seq + 1].type, 'action');
    assert.equal(e[off.seq + 2].type, 'escalation_result');
  }
  assertDisplayedProvenance(run, r);

  // Accounting / terminal outcome section tests
  assert.ok(r.accounting);
  assert.ok(r.accounting.unpaidExpense);
  assert.equal(r.accounting.unpaidExpense.amount, 12);
  assert.equal(r.accounting.unpaidExpense.kind, 'food');
  assert.equal(r.accounting.unpaidExpense.paid, false);
  assert.ok(r.accounting.escalations.length > 0);
  assert.ok(r.accounting.lines.some((l) => l.text.includes('Unpaid expense recorded')));
  assert.ok(r.accounting.lines.some((l) => l.text.includes('$12.00 for food')));
  assert.ok(r.accounting.lines.some((l) => l.text.includes('Terminal route was running_on_empty')));
});

test('S4 ineligible event: no technique finding is invented; fallback is recorded and neutral', () => {
  const run = new Run({}, 'inel');
  run.start();
  run.cash = 0;
  run.health = 40;
  run.usedEvents.add('tax_refund');
  run.usedEvents.add('glitch_duck');
  run.runDeck('weekly');
  run.uninstall('leave');
  const r = projectReceipt(run.log.entries);
  assert.equal(r.findings.some((f) => f.technique === 'social_comparison'), false);
  const res = run.log.entries.filter((e) => e.type === 'event_result').at(-1);
  assert.equal(res.payload.fallback, true);
  assert.equal(res.payload.category, 'neutral delight');
  assertDisplayedProvenance(run, r);
});

test('S4 banner transition near the ending: window cue and purchase attribution', () => {
  // maxDays 7: banner 3 begins on day 7, the final day; bannerDays is 3, but truthful window is 1 day
  const buys = simulate({ maxDays: 7 }, 'bt', makeStrategy('whale_ten'));
  const r = projectReceipt(buys.log.entries);
  assert.equal(r.terminalRoute, buys.terminal);
  const fomo = r.findings.find((f) => f.technique === 'fear_of_missing_out');
  assert.ok(fomo);
  const cues = buys.log.entries.filter((e) => e.type === 'cue_shown' && e.payload.technique === 'fear_of_missing_out');
  assert.equal(cues.length, 3);
  assert.equal(cues.at(-1).clock.day, 7);
  // Final banner window is truthful: 1 day, not 3 days
  assert.equal(cues.at(-1).payload.label, 'Banner ends in 1 game-day');
  assert.equal(cues.at(-1).clock.label, 'Day 7, banner 3 ends in 1 game-day');
  assert.ok(cues.at(-1).seq < buys.log.entries.find((e) => e.type === 'terminal').seq);
  assert.ok(fomo.displayed.length === 3 && fomo.did.length >= 3);
  assert.ok(fomo.displayed.at(-1).text.includes('"Banner ends in 1 game-day" for banner 3.'));

  // Non-divisible maxDays 8 test: banner 3 begins on day 7 with 2 days left
  const nd8 = simulate({ maxDays: 8 }, 'nd8', makeStrategy('frugal_single'));
  const cues8 = nd8.log.entries.filter((e) => e.type === 'cue_shown' && e.payload.technique === 'fear_of_missing_out');
  assert.equal(cues8.length, 3);
  assert.equal(cues8.at(-1).payload.label, 'Banner ends in 2 game-days');
  assert.equal(cues8.at(-1).clock.label, 'Day 7, banner 3 ends in 2 game-days');
  const day8Entry = nd8.log.entries.find((e) => e.clock.day === 8);
  assert.ok(day8Entry);
  assert.equal(day8Entry.clock.label, 'Day 8, banner 3 ends in 1 game-day');

  // Voluntary early exit does not pretend the banner ended early before exit
  const voluntary = new Run({ maxDays: 15 }, 'vol');
  voluntary.start();
  const initCue = voluntary.log.entries.find((e) => e.type === 'cue_shown' && e.payload.technique === 'fear_of_missing_out');
  assert.equal(initCue.payload.label, 'Banner ends in 3 game-days');
  voluntary.day = 2;
  voluntary.uninstall('leave');
  const exitEntry = voluntary.log.entries.find((e) => e.type === 'terminal');
  assert.equal(exitEntry.payload.route, 'uninstall');
  assert.equal(exitEntry.clock.label, 'Day 2, banner 1 ends in 2 game-days');

  // Frugal player never buys: each window says so, and it cites no purchase
  const f = simulate({ maxDays: 7 }, 'bt', makeStrategy('frugal_single'));
  const fr = projectReceipt(f.log.entries).findings.find((x) => x.technique === 'fear_of_missing_out');
  assert.ok(fr.did.every((l) => l.seq === null && l.text.startsWith('No gem purchase')));
  assertDisplayedProvenance(buys, r);
});

test('S4 uninstall flow: leaving immediately and staying both record the modal, the action, and what followed', () => {
  const leave = simulate({}, 'u1', makeStrategy('early_uninstaller'));
  const fl = projectReceipt(leave.log.entries).findings.find((f) => f.technique === 'exit_friction');
  assert.ok(fl.displayed[0].text.includes('80 gems'));
  assert.ok(fl.did.some((l) => l.text.startsWith('Chose to leave immediately')));
  assert.ok(fl.did.some((l) => l.text.includes('uninstall')));

  const run = new Run({}, 'u2');
  run.start();
  run.uninstall('stay');
  assert.equal(run.terminal, null);
  assert.equal(run.gems, 80);
  run.uninstall('leave');
  const f2 = projectReceipt(run.log.entries).findings.find((f) => f.technique === 'exit_friction');
  assert.equal(f2.displayed.length, 2);
  assert.ok(f2.did.some((l) => l.text.includes('stay')) && f2.did.some((l) => l.text.includes('leave')));
});

test('S4 append-only provenance: entries are frozen, chain detects interior tampering, trailing deletion remains valid partial log', () => {
  const run = simulate({ maxDays: 6 }, 'chain', makeStrategy('topup_single'));
  const entries = run.log.entries;
  assert.equal(verifyChain(entries), true);
  assert.equal(verifyCompleteness(entries), true);
  assert.throws(() => { entries[0].payload.seed = 'x'; }, TypeError);
  assert.throws(() => { entries.push({}); }, TypeError);

  // Interior modification is detected
  const edited = entries.map((e) => ({ ...e, payload: { ...e.payload } }));
  edited[5].payload.injected = true;
  assert.equal(verifyChain(edited), false);

  // Interior reordering is detected
  const swapped = [...entries];
  [swapped[3], swapped[4]] = [swapped[4], swapped[3]];
  assert.equal(verifyChain(swapped), false);

  // Leading deletion is detected
  assert.equal(verifyChain(entries.slice(1)), false);

  // Interior deletion (dropping entry 5) is detected by sequence and chain mismatch
  const droppedInterior = entries.filter((_, i) => i !== 5);
  assert.equal(verifyChain(droppedInterior), false);

  // Trailing deletion: removing receipt_shown (or both terminal and receipt_shown) preserves a valid prefix
  // A partial log is valid as a partial log under verifyChain
  const withoutReceipt = entries.slice(0, -1);
  assert.equal(verifyChain(withoutReceipt), true);
  assert.equal(verifyCompleteness(withoutReceipt), false);
  const withoutTerminal = entries.slice(0, -2);
  assert.equal(verifyChain(withoutTerminal), true);
  assert.equal(verifyCompleteness(withoutTerminal), false);

  assert.equal(projectReceipt(edited).chainValid, false);
  assert.equal(projectReceipt(withoutReceipt).isComplete, false);
  assert.deepEqual(entries.map((e) => e.seq), entries.map((_, i) => i));
});

test('Receipt is a function of the log alone (not of final run state)', () => {
  const run = simulate({ maxDays: 8 }, 'pure', makeStrategy('whale_ten'));
  const a = projectReceipt(run.log.entries);
  run.gems = 999999;
  run.owned.clear();
  run.cash = -1;
  assert.deepEqual(projectReceipt(run.log.entries), a);
});

test('Receipt wording keeps the three registers and makes no motive claims', () => {
  const motive = /\b(because|in order to|manipulat|trick|designed to|wanted you|chasing|fooled|addict|tempt)/i;
  for (const name of ['whale_ten', 'topup_single', 'early_uninstaller', 'frugal_single']) {
    const run = simulate({ maxDays: 14 }, 'words', makeStrategy(name));
    const r = projectReceipt(run.log.entries);
    for (const t of receiptText(r)) assert.ok(!motive.test(t), t);
    for (const f of r.findings) {
      assert.ok(f.question.text.startsWith('Did '));
      assert.ok(f.question.text.endsWith('?'));
    }
  }
});

test('techniques appear only when their cue fired', () => {
  const quick = simulate({}, 'few', makeStrategy('early_uninstaller'));
  const names = projectReceipt(quick.log.entries).findings.map((f) => f.technique);
  assert.equal(names.includes('social_comparison'), false);
  assert.equal(names.includes('completion_pressure'), false); // no paid pull happened
  assert.equal(names.includes('pressure_on_possession'), false);
  assert.ok(names.includes('exit_friction'));
});

test('pawn offer: accepted and declined are both recorded as actions', () => {
  for (const [choice, kind] of [['accept', 'pawn_accepted'], ['decline', 'pawn_declined']]) {
    const run = simulate({ maxDays: 14 }, 'pawn', makeStrategy('frugal_single', { pawn: choice }));
    const f = projectReceipt(run.log.entries).findings.find((x) => x.technique === 'pressure_on_possession');
    assert.ok(f);
    assert.ok(run.log.entries.some((e) => e.payload.kind === kind));
  }
});

test('Repair 02: distinguish paid in cash, waived (skipped lunch), and unpaid bills in accounting projection', () => {
  // Case 1: Skipped lunch waives food bill (waived, 0 paid in cash)
  const runWaived = new Run({ startCash: 0, wagePerDay: 0 }, 'waived-rep');
  runWaived.start();
  runWaived.payBill('food', 12);
  runWaived.uninstall('leave');
  const rWaived = projectReceipt(runWaived.log.entries);
  assert.equal(rWaived.accounting.expenses.length, 1);
  const exp0 = rWaived.accounting.expenses[0];
  assert.equal(exp0.kind, 'food');
  assert.equal(exp0.dueAmount, 12);
  assert.equal(exp0.paidAmount, 0);
  assert.equal(exp0.waivedAmount, 12);
  assert.equal(exp0.status, 'waived');
  assert.equal(exp0.paid, false);
  assert.equal(rWaived.accounting.unpaidExpense, null);
  // Verify wording does not represent skipped lunch as paid in cash or purchased food
  assert.ok(rWaived.accounting.lines.some((l) => l.text.includes('food expense(s) waived via skipped lunch ($12.00 total)')));
  assert.ok(!rWaived.accounting.lines.some((l) => l.text.includes('paid in cash')));
  assert.ok(!rWaived.accounting.lines.some((l) => l.text.includes('All 1 recorded expense bills were paid')));

  // Case 2: Ordinary payment in cash
  const runPaid = new Run({ startCash: 200 }, 'paid-rep');
  runPaid.start();
  runPaid.payBill('food', 12);
  runPaid.uninstall('leave');
  const rPaid = projectReceipt(runPaid.log.entries);
  assert.equal(rPaid.accounting.expenses[0].status, 'paid');
  assert.equal(rPaid.accounting.expenses[0].paidAmount, 12);
  assert.equal(rPaid.accounting.expenses[0].waivedAmount, 0);
  assert.equal(rPaid.accounting.expenses[0].paid, true);
  assert.ok(rPaid.accounting.lines.some((l) => l.text.includes('1 recorded expense bill(s) paid in cash ($12.00 total)')));
  assert.ok(!rPaid.accounting.lines.some((l) => l.text.includes('waived')));

  // Case 3: Unpaid bill ending in running_on_empty
  const runUnpaid = simulate({ startCash: 0, wagePerDay: 0, maxDays: 60 }, 'unpaid-rep', makeStrategy('frugal_single'));
  const rUnpaid = projectReceipt(runUnpaid.log.entries);
  assert.ok(rUnpaid.accounting.unpaidExpense);
  assert.equal(rUnpaid.accounting.unpaidExpense.status, 'unpaid');
  assert.equal(rUnpaid.accounting.unpaidExpense.paid, false);
  assert.ok(rUnpaid.accounting.lines.some((l) => l.text.includes('Unpaid expense recorded')));
});

test('Repair 02: final debt reflects latest credit draw, even after the final interest charge', () => {
  // Reproduction from repair-02.md: creditLimit 800, maxDays 60
  // Interest occurs on days 7, 14, 21, etc. On day 49 or later bills draw credit up to limit 800.
  const run = simulate({ startCash: 0, wagePerDay: 0, creditLimit: 800, maxDays: 60 }, 'debt-1', makeStrategy('frugal_single'));
  const r = projectReceipt(run.log.entries);
  assert.equal(r.accounting.finalDebt, 800);
  assert.ok(r.accounting.lines.some((l) => l.text.includes('final debt recorded was $800.00')));
});

test('Repair 02: verifyCompleteness validates ordered terminal/Receipt pair and matching route', () => {
  // Valid finished run
  const run = simulate({ maxDays: 3 }, 'comp-1', makeStrategy('early_uninstaller'));
  assert.equal(verifyChain(run.log.entries), true);
  assert.equal(verifyCompleteness(run.log.entries), true);

  // Wrong order: receipt_shown emitted before terminal
  const logWrongOrder = new EventLog();
  logWrongOrder.append('run_started', {});
  logWrongOrder.append('receipt_shown', { route: 'uninstall' });
  logWrongOrder.append('terminal', { route: 'uninstall' });
  assert.equal(verifyChain(logWrongOrder.entries), true);
  assert.equal(verifyCompleteness(logWrongOrder.entries), false);

  // Route mismatch: terminal route differs from receipt_shown route
  const logMismatchedRoute = new EventLog();
  logMismatchedRoute.append('run_started', {});
  logMismatchedRoute.append('terminal', { route: 'running_on_empty' });
  logMismatchedRoute.append('receipt_shown', { route: 'uninstall' });
  assert.equal(verifyChain(logMismatchedRoute.entries), true);
  assert.equal(verifyCompleteness(logMismatchedRoute.entries), false);

  // Extra entries after receipt_shown
  const logTrailing = new EventLog();
  logTrailing.append('run_started', {});
  logTrailing.append('terminal', { route: 'run_complete' });
  logTrailing.append('receipt_shown', { route: 'run_complete' });
  logTrailing.append('action', { kind: 'extra' });
  assert.equal(verifyChain(logTrailing.entries), true);
  assert.equal(verifyCompleteness(logTrailing.entries), false);
});

test('Repair 03: structured paid flag agrees with actual cash payment', () => {
  // Waived lunch (paidAmount: 0, waivedAmount: 12) -> paid: false
  const runWaived = new Run({ startCash: 0, wagePerDay: 0 }, 'r03-waived');
  runWaived.start();
  runWaived.payBill('food', 12);
  runWaived.uninstall('leave');
  const rWaived = projectReceipt(runWaived.log.entries);
  assert.equal(rWaived.accounting.expenses[0].status, 'waived');
  assert.equal(rWaived.accounting.expenses[0].paidAmount, 0);
  assert.equal(rWaived.accounting.expenses[0].waivedAmount, 12);
  assert.equal(rWaived.accounting.expenses[0].paid, false);

  // Cash payment (paidAmount: 12, waivedAmount: 0) -> paid: true
  const runPaid = new Run({ startCash: 200 }, 'r03-paid');
  runPaid.start();
  runPaid.payBill('food', 12);
  runPaid.uninstall('leave');
  const rPaid = projectReceipt(runPaid.log.entries);
  assert.equal(rPaid.accounting.expenses[0].status, 'paid');
  assert.equal(rPaid.accounting.expenses[0].paidAmount, 12);
  assert.equal(rPaid.accounting.expenses[0].paid, true);

  // Unpaid bill -> paid: false
  const runUnpaid = simulate({ startCash: 0, wagePerDay: 0, maxDays: 60 }, 'r03-unpaid', makeStrategy('frugal_single'));
  const rUnpaid = projectReceipt(runUnpaid.log.entries);
  assert.equal(rUnpaid.accounting.unpaidExpense.status, 'unpaid');
  assert.equal(rUnpaid.accounting.unpaidExpense.paidAmount, 0);
  assert.equal(rUnpaid.accounting.unpaidExpense.paid, false);
});

test('Repair 03: runMatchedWindows requires full observed race exposure in both windows (excludes collection completion before races on last day)', () => {
  // s2em-whale_ten-1-1-1 completes collection on day 12 before races (observed late races = 4 vs expected = 6)
  const runs = runMatchedWindows('s2em-whale_ten-1-1', { maxDays: 15, payoutScale: 1, powerCreep: 1 }, 'whale_ten', 5, [1, 3], [10, 12]);

  // Run index 0 has full exposure (6 early races, 6 late races)
  assert.equal(runs[0].hasFullEarly, true);
  assert.equal(runs[0].hasFullLate, true);
  assert.equal(runs[0].fullExposure, true);
  assert.notEqual(runs[0].lateGpd, null);
  assert.notEqual(runs[0].pairedDiff, null);

  // Run index 1 completes collection on day 12 before races
  const incompleteRun = runs[1];
  assert.equal(incompleteRun.day, 12);
  assert.equal(incompleteRun.route, 'completed_collection');
  assert.equal(incompleteRun.lateRacesCount, 4);
  assert.equal(incompleteRun.expectedLateRaces, 6);
  assert.equal(incompleteRun.hasFullLate, false);
  assert.equal(incompleteRun.fullExposure, false);
  assert.equal(incompleteRun.lateGpd, null);
  assert.equal(incompleteRun.pairedDiff, null);

  // Filter for full exposure runs excludes incomplete run index 1
  const fullRuns = runs.filter((r) => r.fullExposure);
  assert.ok(!fullRuns.some((r) => r === incompleteRun));
});
