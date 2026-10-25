// reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs
// Verification suite for Plan 17 Down exchange, ticket recycling, and wallet progression.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeExactOpeningDistribution,
  solveBaseOddsBankRecurrence,
  simulateTicketRecycling,
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

test('Plan 17 — Pooled-bank recurrence under base odds (Markov decay)', () => {
  const result6 = solveBaseOddsBankRecurrence(6);

  // Exact reproduction of root preflight check: ~1.08075 draws
  assert.ok(Math.abs(result6.expectedDraws - 1.080747) < 1e-4, `Expected draws from 6 Down should be ~1.08075, got ${result6.expectedDraws}`);
  assert.ok(result6.remainingLiveProbability < 1e-13, 'Remaining live mass must decay below 1e-13');
  assert.ok(result6.steps <= 65, `Extinction should be reached within ~65 steps, took ${result6.steps}`);

  // Multi-ticket starting banks
  const result12 = solveBaseOddsBankRecurrence(12);
  const result18 = solveBaseOddsBankRecurrence(18);
  const result24 = solveBaseOddsBankRecurrence(24);

  assert.ok(Math.abs(result12.expectedDraws - 2.5446) < 1e-3, `12 Down expected draws ~2.545, got ${result12.expectedDraws}`);
  assert.ok(Math.abs(result18.expectedDraws - 3.9511) < 1e-3, `18 Down expected draws ~3.951, got ${result18.expectedDraws}`);
  assert.ok(Math.abs(result24.expectedDraws - 5.3352) < 1e-3, `24 Down expected draws ~5.335, got ${result24.expectedDraws}`);
});

test('Plan 17 — Dynamic pity recycling (Rule T2 A) vs. frozen-pity runaway loop', () => {
  // 1. Approved Rule T2 A: normal pity advance + Legendary reset to 0
  const normalSim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 0,
    trials: 10000,
    freezePity: false,
    seed: 'test-normal-seed',
  });

  assert.ok(normalSim.meanDraws > 1.0 && normalSim.meanDraws < 1.25, `Normal pity mean draws should be ~1.08 - 1.15, got ${normalSim.meanDraws}`);
  assert.ok(normalSim.maxDrawsInRun < 50, `Max cascade under normal reset should be bounded, got ${normalSim.maxDrawsInRun}`);

  // 2. High-pity start at pity 49: with normal reset, still strictly finite
  const pity49Sim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    trials: 5000,
    freezePity: false, // resets on legendary
    seed: 'test-pity49-seed',
  });

  // At pity 49, first draw is guaranteed Legendary (+20 Down -> bank = 20).
  // Then pity resets to 0. An initial bank of 20 at base odds yields ~4.04 more draws, total ~5.08 draws.
  assert.ok(pity49Sim.meanDraws > 4.8 && pity49Sim.meanDraws < 5.3, `Pity 49 with reset should average ~5.08 draws, got ${pity49Sim.meanDraws}`);
  assert.ok(pity49Sim.maxDrawsInRun < 50, 'Max cascade from pity 49 with reset must remain bounded');

  // 3. Counterexample: What if pity was frozen at 49 without reset?
  const frozenSim = simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    trials: 10,
    freezePity: true, // no reset
    seed: 'test-frozen-seed',
  });

  // Without reset, every single draw hits Legendary (+20 Down, net +14 Down). Run hits safety cap 2000!
  assert.equal(frozenSim.maxDrawsInRun, 2001, 'Frozen pity 49 without reset must hit runaway safety cap');
});

test('Plan 17 — Race item I1 (+5% speed) observable impact via quadrature and paired simulation', () => {
  // Quadrature checks against 5 opponents at base speed 11.2 (range [10.64, 11.76])
  // Common Sprint: target speed 11.0, noise span 0.20 -> range [8.8, 13.2]
  const baseSprintWin = computeQuadratureWinProbability(8.8, 13.2, 11.2);
  assert.ok(Math.abs(baseSprintWin - 0.369697) < 1e-4, `Baseline Common Sprint win prob should be ~36.97%, got ${baseSprintWin}`);

  // Boosted Common Sprint (+5% on base 10.0 -> 10.5, Sprint target 11.55, noise span 0.20 -> range [9.24, 13.86])
  const boostedSprintWin = computeQuadratureWinProbability(9.24, 13.86, 11.2);
  assert.ok(Math.abs(boostedSprintWin - 0.494949) < 1e-4, `Boosted Common Sprint win prob should be ~49.49%, got ${boostedSprintWin}`);

  const quadratureDelta = boostedSprintWin - baseSprintWin;
  assert.ok(Math.abs(quadratureDelta - 0.125252) < 1e-4, `Quadrature delta should be +12.52%, got ${quadratureDelta}`);

  // Common Safe stance vs Finale field:
  // Baseline Safe: [9.5, 10.5] vs field [10.64, 11.76] -> 0.0% win rate
  const baseSafeWin = computeQuadratureWinProbability(9.5, 10.5, 11.2);
  assert.equal(baseSafeWin, 0.0, 'Baseline Common Safe cannot beat 11.2 field');

  // Boosted Safe: 10.5 * [0.95, 1.05] -> [9.975, 11.025] -> max 11.025 > min 10.64 (small upset chance)
  const boostedSafeWin = computeQuadratureWinProbability(9.975, 11.025, 11.2);
  assert.ok(boostedSafeWin > 0.0 && boostedSafeWin < 0.001, `Boosted Common Safe should have small upset chance, got ${boostedSafeWin}`);

  // Paired Monte Carlo check
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

test('Plan 17 — Whole-wallet balances and isolated bundle arithmetic reconciliation', () => {
  const paths = traceWholeWalletPaths();

  // Path 1: Isolated bundle (no prior rewards)
  const p1 = paths.find((p) => p.id === 'path-1');
  assert.equal(p1.totalGemsBeforePulls, 1750);
  assert.equal(p1.afterTenPulls, 150);
  assert.equal(p1.affordableSingles, 0);
  assert.equal(p1.strandedRemainder, 150);
  assert.equal(p1.shortfallToNext, 10); // Exactly 10 short of 160

  // Path 2: Tutorial race winner (+50g) + 1750 bundle
  const p2 = paths.find((p) => p.id === 'path-2');
  assert.equal(p2.totalGemsBeforePulls, 1800);
  assert.equal(p2.afterTenPulls, 200);
  assert.equal(p2.affordableSingles, 1); // CAN do 11th pull!
  assert.equal(p2.strandedRemainder, 40);
  assert.equal(p2.shortfallToNext, 120);

  // Path 3: Starter pack + tutorial win - 1 single pull + 1750 bundle
  const p3 = paths.find((p) => p.id === 'path-3');
  assert.equal(p3.totalGemsBeforePulls, 1880);
  assert.equal(p3.afterTenPulls, 280);
  assert.equal(p3.affordableSingles, 1);
  assert.equal(p3.strandedRemainder, 120);
  assert.equal(p3.shortfallToNext, 40);

  // Path 4: Starter pack alone ($0.99 for 240g) + tutorial win (50g)
  const p4 = paths.find((p) => p.id === 'path-4');
  assert.equal(p4.totalGemsBeforePulls, 290);
  assert.equal(p4.affordableSingles, 1);
  assert.equal(p4.strandedRemainder, 130);
  assert.equal(p4.shortfallToNext, 30);
});
