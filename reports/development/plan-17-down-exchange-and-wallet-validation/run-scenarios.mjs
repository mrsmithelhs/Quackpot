// reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs
// Scenario runner and evidence generator for Plan 17.
// Outputs comprehensive structured evidence to results.json and console summary.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeExactOpeningDistribution,
  solveBaseOddsBankRecurrence,
  simulateTicketRecycling,
  computeQuadratureWinProbability,
  simulatePairedRaces,
  traceWholeWalletPaths,
  PROBABILITIES_6,
  TIERS_6,
  PAYOUTS_6,
} from './down-validation-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Plan 17 Down Exchange and Wallet Validation ===\n');

// 1. Opening Distributions
console.log('1. Computing exact opening 10-pull distributions...');
const opening = computeExactOpeningDistribution();

// 2. Representative 10-card Opening Traces
console.log('2. Generating representative 10-card opening traces...');
const traces = [
  {
    name: 'Trace 1: Low Tail (Plan 03 Fixture Equivalent)',
    cards: [
      { draw: 1, id: 'duck-0', tier: 'common', status: 'NEW', down: 0 },
      { draw: 2, id: 'duck-1', tier: 'common', status: 'NEW', down: 0 },
      { draw: 3, id: 'duck-3', tier: 'common', status: 'NEW', down: 0 },
      { draw: 4, id: 'duck-2', tier: 'rare', status: 'NEW', down: 0 },
      { draw: 5, id: 'duck-4', tier: 'rare', status: 'NEW', down: 0 },
      { draw: 6, id: 'duck-5', tier: 'legendary', status: 'NEW', down: 0 },
      { draw: 7, id: 'duck-0', tier: 'common', status: 'DUP', down: 1 },
      { draw: 8, id: 'duck-1', tier: 'common', status: 'DUP', down: 1 },
      { draw: 9, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 10, id: 'duck-0', tier: 'common', status: 'DUP', down: 1 },
    ],
    totalDups: 4,
    totalDown: 4,
    probabilityPct: opening.orderedDown.find(([d]) => d === 4)[1] * 100,
    affordable: '1 speed item (3 Down); 2 Down short of ticket',
  },
  {
    name: 'Trace 2: Median / Typical Opening (7 Down)',
    // Exact count vector: [2, 3, 5, 0, 0, 0] -> 3 unique commons seen, 7 common duplicates = 7 Down
    cards: [
      { draw: 1, id: 'duck-0', tier: 'common', status: 'NEW', down: 0 },
      { draw: 2, id: 'duck-1', tier: 'common', status: 'NEW', down: 0 },
      { draw: 3, id: 'duck-3', tier: 'common', status: 'NEW', down: 0 },
      { draw: 4, id: 'duck-0', tier: 'common', status: 'DUP', down: 1 },
      { draw: 5, id: 'duck-1', tier: 'common', status: 'DUP', down: 1 },
      { draw: 6, id: 'duck-1', tier: 'common', status: 'DUP', down: 1 },
      { draw: 7, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 8, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 9, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 10, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
    ],
    totalDups: 7,
    totalDown: 7,
    probabilityPct: opening.orderedDown.find(([d]) => d === 7)[1] * 100,
    affordable: '1 ticket (6 Down) + 1 Down remainder, or 2 speed items + 1 remainder',
  },
  {
    name: 'Trace 3: Upper-Middle Opening (10 Down)',
    // Exact count vector: [1, 1, 1, 1, 3, 3] -> wait, for 10 Down: [1, 1, 1, 1, 3, 0] -> 2 rare dups = 10 Down, 3 common unique = 7 cards?
    // Let's check 10 Down: 2 Rare dups (10 Down) + 0 common dups = 2 dups. But 10 cards across 6 ids has at least 4 dups.
    // So 10 Down is: 1 Rare dup (5 Down) + 5 Common dups (5 Down) = 10 Down! (Total 6 dups: 5 common, 1 rare).
    cards: [
      { draw: 1, id: 'duck-0', tier: 'common', status: 'NEW', down: 0 },
      { draw: 2, id: 'duck-1', tier: 'common', status: 'NEW', down: 0 },
      { draw: 3, id: 'duck-3', tier: 'common', status: 'NEW', down: 0 },
      { draw: 4, id: 'duck-2', tier: 'rare', status: 'NEW', down: 0 },
      { draw: 5, id: 'duck-2', tier: 'rare', status: 'DUP', down: 5 },
      { draw: 6, id: 'duck-0', tier: 'common', status: 'DUP', down: 1 },
      { draw: 7, id: 'duck-0', tier: 'common', status: 'DUP', down: 1 },
      { draw: 8, id: 'duck-1', tier: 'common', status: 'DUP', down: 1 },
      { draw: 9, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 10, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
    ],
    totalDups: 6,
    totalDown: 10,
    probabilityPct: opening.orderedDown.find(([d]) => d === 10)[1] * 100,
    affordable: '1 ticket (6 Down) + 4 Down remainder, or 3 speed items + 1 remainder',
  },
  {
    name: 'Trace 4: Legendary Windfall Opening (25 Down)',
    // Exact count vector: [0, 0, 6, 1, 1, 2] -> 5 common dups (5 Down) + 1 legendary dup (20 Down) = 25 Down! (Total 6 dups).
    cards: [
      { draw: 1, id: 'duck-3', tier: 'common', status: 'NEW', down: 0 },
      { draw: 2, id: 'duck-2', tier: 'rare', status: 'NEW', down: 0 },
      { draw: 3, id: 'duck-4', tier: 'rare', status: 'NEW', down: 0 },
      { draw: 4, id: 'duck-5', tier: 'legendary', status: 'NEW', down: 0 },
      { draw: 5, id: 'duck-5', tier: 'legendary', status: 'DUP', down: 20 },
      { draw: 6, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 7, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 8, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 9, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
      { draw: 10, id: 'duck-3', tier: 'common', status: 'DUP', down: 1 },
    ],
    totalDups: 6,
    totalDown: 25,
    probabilityPct: opening.exactly25Down * 100,
    affordable: '4 tickets (24 Down) + 1 Down remainder, or 8 speed items + 1 remainder',
  },
];

// 3. Pooled-Bank Recurrence
console.log('3. Solving pooled-bank recurrence across starting banks...');
const bankRecurrence = {
  bank6: solveBaseOddsBankRecurrence(6),
  bank12: solveBaseOddsBankRecurrence(12),
  bank18: solveBaseOddsBankRecurrence(18),
  bank20: solveBaseOddsBankRecurrence(20),
  bank24: solveBaseOddsBankRecurrence(24),
};

// 4. Dynamic Pity Simulation (Rule T2 A)
console.log('4. Simulating dynamic pity recycling (50,000 trials each)...');
const dynamicRecycling = {
  pity0: simulateTicketRecycling({ initialBank: 6, initialPity: 0, trials: 50000, seed: 'dyn-0' }),
  pity30: simulateTicketRecycling({ initialBank: 6, initialPity: 30, trials: 50000, seed: 'dyn-30' }),
  pity49_reset: simulateTicketRecycling({ initialBank: 6, initialPity: 49, trials: 50000, seed: 'dyn-49-reset', freezePity: false }),
  pity49_frozen: simulateTicketRecycling({ initialBank: 6, initialPity: 49, trials: 10, seed: 'dyn-49-frozen', freezePity: true }),
};

// 5. Pond Race Item I1 Resolution
console.log('5. Solving race quadrature and paired Monte Carlo...');
const raceQuadrature = {
  finale_sprint_baseline: computeQuadratureWinProbability(8.8, 13.2, 11.2),
  finale_sprint_boosted: computeQuadratureWinProbability(9.24, 13.86, 11.2),
  finale_safe_baseline: computeQuadratureWinProbability(9.5, 10.5, 11.2),
  finale_safe_boosted: computeQuadratureWinProbability(9.975, 11.025, 11.2),
  tutorial_safe_baseline: computeQuadratureWinProbability(9.5, 10.5, 8.0),
  tutorial_safe_boosted: computeQuadratureWinProbability(9.975, 11.025, 8.0),
};

const racePairedSim = {
  finale_sprint: simulatePairedRaces({ baseSpeed: 10.0, stance: 'sprint', opponentBaseSpeed: 11.2, itemBoost: 0.05, trials: 20000 }),
  finale_safe: simulatePairedRaces({ baseSpeed: 10.0, stance: 'safe', opponentBaseSpeed: 11.2, itemBoost: 0.05, trials: 20000 }),
  tutorial_safe: simulatePairedRaces({ baseSpeed: 10.0, stance: 'safe', opponentBaseSpeed: 8.0, itemBoost: 0.05, trials: 20000 }),
};

// 6. Whole-Wallet Progression Paths
console.log('6. Tracing whole-wallet progression paths...');
const walletPaths = traceWholeWalletPaths();

// Assemble final results structure
const results = {
  generatedAt: new Date().toISOString(),
  rules: {
    t1: 'A (ticket pulls award normal 1/5/20 Down)',
    t2: 'A (advances pity by 1, with normal Legendary reset to 0)',
    t3: 'A (immediate active-banner redemption "Pull with Down — 6 Down")',
    i1: '+5% base speed boost for 1 race, non-stacking, consumed on race commit',
  },
  openingDistribution: {
    meanDown: opening.meanDown,
    medianDown: opening.medianDown,
    meanDups: opening.meanDups,
    pItemAffordable: opening.itemAffordable,
    pTicketAffordable: opening.ticketAffordable,
    downDistribution: opening.orderedDown.map(([d, p]) => ({ down: d, prob: p, pct: p * 100 })),
    duplicateDistribution: opening.orderedDups.map(([d, p]) => ({ dups: d, prob: p, pct: p * 100 })),
  },
  representativeTraces: traces,
  pooledBankRecurrence: {
    bank6: { expectedDraws: bankRecurrence.bank6.expectedDraws, liveMass: bankRecurrence.bank6.remainingLiveProbability, steps: bankRecurrence.bank6.steps },
    bank12: { expectedDraws: bankRecurrence.bank12.expectedDraws, liveMass: bankRecurrence.bank12.remainingLiveProbability, steps: bankRecurrence.bank12.steps },
    bank18: { expectedDraws: bankRecurrence.bank18.expectedDraws, liveMass: bankRecurrence.bank18.remainingLiveProbability, steps: bankRecurrence.bank18.steps },
    bank20: { expectedDraws: bankRecurrence.bank20.expectedDraws, liveMass: bankRecurrence.bank20.remainingLiveProbability, steps: bankRecurrence.bank20.steps },
    bank24: { expectedDraws: bankRecurrence.bank24.expectedDraws, liveMass: bankRecurrence.bank24.remainingLiveProbability, steps: bankRecurrence.bank24.steps },
  },
  dynamicRecycling: {
    pity0: { meanDraws: dynamicRecycling.pity0.meanDraws, maxDraws: dynamicRecycling.pity0.maxDrawsInRun, rareBouncesPct: dynamicRecycling.pity0.rareBouncesPer100Draws, legendaryWindfallsPct: dynamicRecycling.pity0.legendaryWindfallsPer100Draws },
    pity30: { meanDraws: dynamicRecycling.pity30.meanDraws, maxDraws: dynamicRecycling.pity30.maxDrawsInRun, rareBouncesPct: dynamicRecycling.pity30.rareBouncesPer100Draws, legendaryWindfallsPct: dynamicRecycling.pity30.legendaryWindfallsPer100Draws },
    pity49_reset: { meanDraws: dynamicRecycling.pity49_reset.meanDraws, maxDraws: dynamicRecycling.pity49_reset.maxDrawsInRun },
    pity49_frozen: { meanDraws: dynamicRecycling.pity49_frozen.meanDraws, maxDraws: dynamicRecycling.pity49_frozen.maxDrawsInRun, runawayConfirmed: dynamicRecycling.pity49_frozen.maxDrawsInRun > 2000 },
  },
  raceItemResolution: {
    quadrature: raceQuadrature,
    deltaSprintWinPct: (raceQuadrature.finale_sprint_boosted - raceQuadrature.finale_sprint_baseline) * 100,
    pairedMonteCarlo: racePairedSim,
  },
  wholeWalletPaths: walletPaths,
};

const outputPath = path.join(__dirname, 'results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\nResults successfully written to: ${outputPath}`);

// Print formatted summary tables to stdout
console.log('\n--- Summary Table 1: Opening Affordability ---');
console.log(`P(Down >= 3) [Speed Item]: ${(opening.itemAffordable * 100).toFixed(4)}%`);
console.log(`P(Down >= 6) [Single Ticket]: ${(opening.ticketAffordable * 100).toFixed(4)}%`);
console.log(`Mean Down: ${opening.meanDown.toFixed(4)} | Median Down: ${opening.medianDown}`);

console.log('\n--- Summary Table 2: Pooled Bank Recurrence (Base Odds) ---');
console.table([
  { bank: '6 Down (1 Ticket)', expectedDraws: bankRecurrence.bank6.expectedDraws.toFixed(5), liveMass: bankRecurrence.bank6.remainingLiveProbability.toExponential(2) },
  { bank: '12 Down (2 Tickets)', expectedDraws: bankRecurrence.bank12.expectedDraws.toFixed(5), liveMass: bankRecurrence.bank12.remainingLiveProbability.toExponential(2) },
  { bank: '18 Down (3 Tickets)', expectedDraws: bankRecurrence.bank18.expectedDraws.toFixed(5), liveMass: bankRecurrence.bank18.remainingLiveProbability.toExponential(2) },
  { bank: '24 Down (4 Tickets)', expectedDraws: bankRecurrence.bank24.expectedDraws.toFixed(5), liveMass: bankRecurrence.bank24.remainingLiveProbability.toExponential(2) },
]);

console.log('\n--- Summary Table 3: Race Item I1 Win Rate (Finale Field 11.2) ---');
console.log(`Baseline Common Sprint Win Rate: ${(raceQuadrature.finale_sprint_baseline * 100).toFixed(2)}%`);
console.log(`Boosted Common Sprint Win Rate:  ${(raceQuadrature.finale_sprint_boosted * 100).toFixed(2)}%`);
console.log(`Net Win Rate Delta:              +${((raceQuadrature.finale_sprint_boosted - raceQuadrature.finale_sprint_baseline) * 100).toFixed(2)} percentage points`);

console.log('\n--- Summary Table 4: Whole-Wallet Balances ---');
console.table(walletPaths.map((w) => ({
  path: w.name,
  gemsBefore: w.totalGemsBeforePulls,
  afterTen: w.afterTenPulls,
  affordableSingles: w.affordableSingles,
  strandedGems: w.strandedRemainder,
  shortfall: w.shortfallToNext,
})));
