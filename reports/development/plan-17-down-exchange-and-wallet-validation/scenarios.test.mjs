// reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs
// Verification suite for Plan 17 Down exchange, ticket recycling, and wallet progression.
// Incorporates Repair 01 specifications: probability conservation, censoring bookkeeping,
// roster coverage matrix (empty, partial missing legendary, full), and item lifecycle boundaries.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeExactOpeningDistribution,
  solveBaseOddsBankRecurrence,
  simulateTicketRecycling,
  traceSingleRecyclingRun,
  computeQuadratureWinProbability,
  simulatePairedRaces,
  traceWholeWalletPaths,
} from './down-validation-engine.mjs';

test('Plan 17 — Opening 10-pull duplicate cards and Down distributions', () => {
  const dist = computeExactOpeningDistribution();

  assert.ok(Math.abs(dist.totalProbability - 1.0) < 1e-12, 'Total probability must sum to 1.0');
  assert.ok(Math.abs(dist.meanDown - 8.3705557) < 1e-4, `Mean Down should be ~8.3706, got ${dist.meanDown}`);
  assert.equal(dist.medianDown, 7, `Median Down must be 7, got ${dist.medianDown}`);
  assert.ok(Math.abs(dist.meanDups - 5.7308) < 1e-3, `Mean duplicate cards should be ~5.7308, got ${dist.meanDups}`);

  // Guaranteed item affordability and ~82% ticket affordability
  assert.ok(Math.abs(dist.itemAffordable - 1.0) < 1e-12, 'P(Down >= 3) must be 100%');
  assert.ok(Math.abs(dist.ticketAffordable - 0.819507) < 1e-4, `P(Down >= 6) should be ~81.95%, got ${dist.ticketAffordable}`);

  // Specific 25 Down probability
  assert.ok(Math.abs(dist.exactly25Down - 0.0037189) < 1e-5, `P(Down = 25) should be ~0.3719%, got ${dist.exactly25Down}`);

  // Pigeonhole bounds on duplicate cards: min 4, max 9
  assert.equal(dist.orderedDups[0][0], 4, 'Minimum duplicate cards must be 4');
  assert.equal(dist.orderedDups[dist.orderedDups.length - 1][0], 9, 'Maximum duplicate cards must be 9');
});

test('Plan 17 Repair 01 — Base-bank recurrence: mass conservation and terminal bank distribution', () => {
  // Test starting bank 6
  const res6 = solveBaseOddsBankRecurrence(6);

  // 1. Correct expected draws preserved
  assert.ok(Math.abs(res6.expectedDraws - 1.080747) < 1e-4, `Expected draws should be ~1.08075, got ${res6.expectedDraws}`);

  // 2. Full mass conservation: absorbed + live ≈ 1.0
  assert.ok(Math.abs(res6.totalMass - 1.0) < 1e-12, `Total mass must be 1.0, got ${res6.totalMass}`);
  assert.ok(res6.absorbedMass > 0.9999999, `Absorbed mass must be ~1.0, got ${res6.absorbedMass}`);
  assert.ok(res6.liveMass < 1e-13, `Live mass must be below 1e-13, got ${res6.liveMass}`);

  // 3. First-step split: bank 6 absorbs exactly 0.80 at 1 Down and 0.18 at 5 Down
  const step1 = new Map(res6.firstStepAbsorbed);
  assert.ok(Math.abs(step1.get(1) - 0.80) < 1e-12, `First-step absorbed at 1 Down should be 0.80, got ${step1.get(1)}`);
  assert.ok(Math.abs(step1.get(5) - 0.18) < 1e-12, `First-step absorbed at 5 Down should be 0.18, got ${step1.get(5)}`);

  // 4. Overall absorbed bank distribution accounts for all absorbed runs across [1..5]
  const distMap = new Map(res6.absorbedDistribution);
  assert.ok(distMap.get(1) > 0.80, 'Final absorbed 1 Down should be ~80.04%');
  assert.ok(distMap.get(5) > 0.18, 'Final absorbed 5 Down should be ~19.04%');

  // 5. Initial bank below purchase cost (0 to 5)
  for (let b = 0; b < 6; b++) {
    const sub = solveBaseOddsBankRecurrence(b);
    assert.equal(sub.expectedDraws, 0, `Bank ${b} cannot afford any draws`);
    assert.equal(sub.steps, 0, `Bank ${b} steps should be 0`);
    assert.equal(sub.absorbedMass, 1.0, `Bank ${b} absorbed mass must be 1.0`);
    assert.equal(sub.absorbedDistribution[0][0], b, `Bank ${b} must absorb at ${b}`);
    assert.equal(sub.absorbedDistribution[0][1], 1.0, `Bank ${b} must absorb 100% probability at ${b}`);
  }

  // 6. Multi-ticket banks
  const res12 = solveBaseOddsBankRecurrence(12);
  const res24 = solveBaseOddsBankRecurrence(24);
  assert.ok(Math.abs(res12.expectedDraws - 2.5446) < 1e-3, `Bank 12 expected draws ~2.545, got ${res12.expectedDraws}`);
  assert.ok(Math.abs(res12.totalMass - 1.0) < 1e-12, `Bank 12 total mass must be 1.0, got ${res12.totalMass}`);
  assert.ok(Math.abs(res24.expectedDraws - 5.3352) < 1e-3, `Bank 24 expected draws ~5.335, got ${res24.expectedDraws}`);
  assert.ok(Math.abs(res24.totalMass - 1.0) < 1e-12, `Bank 24 total mass must be 1.0, got ${res24.totalMass}`);
});

test('Plan 17 Repair 01 — Explicit censoring vs. absorption bookkeeping', () => {
  // 1. Normal pity advance with Legendary reset (Rule T2 A): 100% absorption, 0% censoring
  const normalSim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 0,
    trials: 5000,
    maxDraws: 1000,
    freezePity: false,
    seed: 'censor-test-normal',
  });

  assert.equal(normalSim.absorbedCount, 5000, 'All normal runs must be absorbed');
  assert.equal(normalSim.censoredCount, 0, 'No normal runs should hit the cap');
  assert.equal(normalSim.censoredRate, 0.0, 'Censored rate must be 0%');
  assert.equal(normalSim.absorbedRate, 1.0, 'Absorbed rate must be 100%');
  assert.ok(normalSim.meanDrawsCompleted > 1.0 && normalSim.meanDrawsCompleted < 1.25);
  assert.ok(normalSim.terminalBanks.length > 0, 'Terminal banks must be populated for absorbed runs');
  assert.ok(normalSim.terminalBanks.every((item) => item.bank < 6), 'All terminal banks must be < 6 Down');
  assert.equal(normalSim.censoredResidualBanks.length, 0, 'Censored residual banks must be empty');

  // 2. Frozen pity counterexample (pity 49 without reset): 100% censoring, 0% absorption
  const frozenSim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    trials: 5,
    maxDraws: 500,
    freezePity: true,
    seed: 'censor-test-frozen',
  });

  assert.equal(frozenSim.absorbedCount, 0, 'Frozen pity without reset cannot be absorbed');
  assert.equal(frozenSim.censoredCount, 5, 'All frozen pity runs must hit cap');
  assert.equal(frozenSim.censoredRate, 1.0, 'Censored rate must be 100%');
  assert.equal(frozenSim.maxDrawsObserved, 500, 'Max draws must equal declared cap');
  assert.equal(frozenSim.terminalBanks.length, 0, 'Terminal banks must be empty for censored runs');
  assert.equal(frozenSim.censoredResidualBanks.length, 1, 'Censored residual bank must be recorded');
  // At 500 draws: initial 6, each draw costs 6, awards 20 -> net +14 per draw.
  // Final bank = 6 + 500 * 14 = 7006 Down!
  assert.equal(frozenSim.censoredResidualBanks[0].bank, 7006, 'Bank after 500 draws should be exactly 7006 Down');
});

test('Plan 17 Repair 01 — Roster coverage matrix (empty, partial missing legendary, full)', () => {
  // Case A: Empty roster (0 ducks owned). Every draw is a brand new duck.
  // Starting with 6 Down: draw 1 costs 6 Down -> duck is new -> 0 Down awarded -> bank = 0 -> terminates immediately!
  const emptySim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 0,
    initialOwned: new Set(),
    trials: 2000,
    seed: 'matrix-empty-seed',
  });

  assert.equal(emptySim.meanDrawsCompleted, 1.0, 'Empty roster starting with 6 Down must always take exactly 1 draw');
  assert.equal(emptySim.terminalBanks[0].bank, 0, 'Empty roster must end with exactly 0 Down');
  assert.equal(emptySim.terminalBanks[0].pct, 100.0, '100% of empty roster runs end with 0 Down');

  // Case B: Partial roster missing Legendary ('duck-0' through 'duck-4' owned, 'duck-5' missing).
  // Starting at pity 49: draw 1 is guaranteed Legendary ('duck-5').
  // Because 'duck-5' is NEW, it awards 0 Down!
  // Bank drops from 6 to 0, run absorbs at bank 0 after exactly 1 draw!
  const partialMissingLegSim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    trials: 2000,
    seed: 'matrix-partial-seed',
  });

  assert.equal(partialMissingLegSim.meanDrawsCompleted, 1.0, 'Missing Legendary at hard pity awards 0 Down, ending in 1 draw');
  assert.equal(partialMissingLegSim.terminalBanks[0].bank, 0, 'Must end with 0 Down');
  assert.equal(partialMissingLegSim.terminalBanks[0].pct, 100.0, '100% end with 0 Down');

  // Case C: Full roster ('duck-0' through 'duck-5' owned).
  // Starting at pity 49: draw 1 is a duplicate Legendary ('duck-5'), awarding 20 Down!
  // Pity resets to 0. Bank = 20 Down. Decays over ~5.08 draws.
  const fullPity49Sim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 2000,
    seed: 'matrix-full-pity49-seed',
  });

  assert.ok(fullPity49Sim.meanDrawsCompleted > 4.8 && fullPity49Sim.meanDrawsCompleted < 5.3, 'Full roster at pity 49 averages ~5.08 draws');
  assert.equal(fullPity49Sim.censoredCount, 0, 'All full roster runs with reset must absorb cleanly');
});

test('Plan 17 Repair 01 — Reproducible per-draw trajectories', () => {
  // Trace 1: Empty roster, starting with 6 Down
  const traceEmpty = traceSingleRecyclingRun({
    initialBank: 6,
    initialPity: 0,
    initialOwned: new Set(),
    seed: 'trace-empty',
  });
  assert.equal(traceEmpty.totalDraws, 1);
  assert.equal(traceEmpty.steps[0].ownershipBefore, 'NEW');
  assert.equal(traceEmpty.steps[0].downAward, 0);
  assert.equal(traceEmpty.finalBank, 0);
  assert.equal(traceEmpty.isAbsorbed, true);

  // Trace 2: Partial roster missing Legendary, starting at pity 49
  const tracePartial = traceSingleRecyclingRun({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    seed: 'trace-partial',
  });
  assert.equal(tracePartial.totalDraws, 1);
  assert.equal(tracePartial.steps[0].rarity, 'legendary');
  assert.equal(tracePartial.steps[0].duckId, 'duck-5');
  assert.equal(tracePartial.steps[0].ownershipBefore, 'NEW');
  assert.equal(tracePartial.steps[0].downAward, 0);
  assert.equal(tracePartial.finalBank, 0);
  assert.equal(tracePartial.isAbsorbed, true);

  // Trace 3: Full roster starting at pity 49 with reset
  const traceFull = traceSingleRecyclingRun({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    seed: 'trace-full',
  });
  assert.ok(traceFull.totalDraws > 1, 'Full roster duplicate Legendary enables subsequent draws');
  assert.equal(traceFull.steps[0].rarity, 'legendary');
  assert.equal(traceFull.steps[0].ownershipBefore, 'OWNED');
  assert.equal(traceFull.steps[0].downAward, 20);
  assert.equal(traceFull.steps[0].pityAfter, 0, 'Pity must reset to 0 on Legendary');
  assert.equal(traceFull.isAbsorbed, true);
});

test('Plan 17 — Race item I1 (+5% speed) observable impact via quadrature and paired simulation', () => {
  const baseSprintWin = computeQuadratureWinProbability(8.8, 13.2, 11.2);
  assert.ok(Math.abs(baseSprintWin - 0.369697) < 1e-4, `Baseline Common Sprint win prob should be ~36.97%, got ${baseSprintWin}`);

  const boostedSprintWin = computeQuadratureWinProbability(9.24, 13.86, 11.2);
  assert.ok(Math.abs(boostedSprintWin - 0.494949) < 1e-4, `Boosted Common Sprint win prob should be ~49.49%, got ${boostedSprintWin}`);

  const quadratureDelta = boostedSprintWin - baseSprintWin;
  assert.ok(Math.abs(quadratureDelta - 0.125252) < 1e-4, `Quadrature delta should be +12.52%, got ${quadratureDelta}`);

  const baseSafeWin = computeQuadratureWinProbability(9.5, 10.5, 11.2);
  assert.equal(baseSafeWin, 0.0, 'Baseline Common Safe cannot beat 11.2 field');

  const boostedSafeWin = computeQuadratureWinProbability(9.975, 11.025, 11.2);
  assert.ok(boostedSafeWin > 0.0 && boostedSafeWin < 0.001, `Boosted Common Safe should have small upset chance, got ${boostedSafeWin}`);

  const paired = simulatePairedRaces({
    baseSpeed: 10.0,
    stance: 'sprint',
    opponentBaseSpeed: 11.2,
    itemBoost: 0.05,
    trials: 10000,
  });

  assert.ok(Math.abs(paired.baseline.winRate - 0.37) < 0.02, `Simulated baseline win rate near 37%, got ${paired.baseline.winRate}`);
  assert.ok(Math.abs(paired.boosted.winRate - 0.49) < 0.02, `Simulated boosted win rate near 49%, got ${paired.boosted.winRate}`);
  assert.ok(paired.deltaMeanGems > 5.0, `Expected gems delta should be positive (~6g), got ${paired.deltaMeanGems}`);
});

test('Plan 17 — Whole-wallet hypothetical balances and isolated bundle arithmetic reconciliation', () => {
  const paths = traceWholeWalletPaths();

  const p1 = paths.find((p) => p.id === 'path-1');
  assert.equal(p1.totalGemsBeforePulls, 1750);
  assert.equal(p1.afterTenPulls, 150);
  assert.equal(p1.affordableSingles, 0);
  assert.equal(p1.strandedRemainder, 150);
  assert.equal(p1.shortfallToNext, 10);

  const p2 = paths.find((p) => p.id === 'path-2');
  assert.equal(p2.totalGemsBeforePulls, 1800);
  assert.equal(p2.afterTenPulls, 200);
  assert.equal(p2.affordableSingles, 1);
  assert.equal(p2.strandedRemainder, 40);
  assert.equal(p2.shortfallToNext, 120);

  const p3 = paths.find((p) => p.id === 'path-3');
  assert.equal(p3.totalGemsBeforePulls, 1880);
  assert.equal(p3.afterTenPulls, 280);
  assert.equal(p3.affordableSingles, 1);
  assert.equal(p3.strandedRemainder, 120);
  assert.equal(p3.shortfallToNext, 40);

  const p4 = paths.find((p) => p.id === 'path-4');
  assert.equal(p4.totalGemsBeforePulls, 290);
  assert.equal(p4.affordableSingles, 1);
  assert.equal(p4.strandedRemainder, 130);
  assert.equal(p4.shortfallToNext, 30);
});
