// reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs
// Scenario runner and evidence generator for Plan 17 Repair 01.
// Incorporates probability conservation, explicit censoring, roster coverage matrix,
// and deferred integration lifecycle obligations. Outputs to results.json and console summary.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeExactOpeningDistribution,
  solveBaseOddsBankRecurrence,
  simulateTicketRecycling,
  traceSingleRecyclingRun,
  computeQuadratureWinProbability,
  simulatePairedRaces,
  traceWholeWalletPaths,
} from './down-validation-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Plan 17 Down Exchange and Wallet Validation (Repair 01) ===\n');

// 1. Opening Distributions
console.log('1. Computing exact opening 10-pull distributions...');
const opening = computeExactOpeningDistribution();

// 2. Representative 10-card Opening Traces
console.log('2. Generating representative 10-card opening traces...');
const traces = [
  {
    name: 'Trace 1: Low Tail Opening (4 Down — 2.02% probability)',
    note: 'Plan 03 static trial fixture equivalent. Draws all 6 unique identities, yielding 4 Common duplicates.',
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
    name: 'Trace 2: Median / Typical Opening (7 Down — 12.27% probability)',
    note: 'Count vector [2, 3, 5, 0, 0, 0] (3 unique commons drawn, 7 common duplicates).',
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
    name: 'Trace 3: Upper-Middle Opening (10 Down — 13.14% probability)',
    note: 'Count vector [3, 2, 3, 2, 0, 0] (4 unique identities, 1 Rare duplicate + 5 Common duplicates).',
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
    name: 'Trace 4: Legendary Windfall Opening (25 Down — 0.3719% probability)',
    note: 'Count vector [0, 0, 6, 1, 1, 2] (4 unique identities, 1 Legendary duplicate + 5 Common duplicates).',
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

// 3. Pooled-Bank Recurrence (Repair 01: Full Mass Conservation & First-Step Split)
console.log('3. Solving pooled-bank recurrence across starting banks (0 to 24 Down)...');
const bankRecurrence = {
  bank0: solveBaseOddsBankRecurrence(0),
  bank4: solveBaseOddsBankRecurrence(4),
  bank6: solveBaseOddsBankRecurrence(6),
  bank12: solveBaseOddsBankRecurrence(12),
  bank18: solveBaseOddsBankRecurrence(18),
  bank20: solveBaseOddsBankRecurrence(20),
  bank24: solveBaseOddsBankRecurrence(24),
};

// 4. Roster Coverage Matrix (Repair 01: Empty, Partial Missing Legendary, Full)
console.log('4. Running roster coverage simulation matrix (10,000 trials per cell)...');
const rosterMatrix = {
  // Empty roster (0 ducks owned)
  empty_bank6_pity0: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 0,
    initialOwned: new Set(),
    trials: 10000,
    seed: 'mat-empty-6-0',
  }),
  empty_bank12_pity0: simulateTicketRecycling({
    initialBank: 12,
    initialPity: 0,
    initialOwned: new Set(),
    trials: 10000,
    seed: 'mat-empty-12-0',
  }),

  // Partial roster: owns Commons + Rares (5/6), MISSING Legendary duck-5
  partial_no_legendary_bank6_pity0: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 0,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    trials: 10000,
    seed: 'mat-part-no-leg-6-0',
  }),
  partial_no_legendary_bank6_pity30: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 30,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    trials: 10000,
    seed: 'mat-part-no-leg-6-30',
  }),
  partial_no_legendary_bank6_pity49: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    trials: 10000,
    seed: 'mat-part-no-leg-6-49',
  }),
  partial_no_legendary_bank12_pity0: simulateTicketRecycling({
    initialBank: 12,
    initialPity: 0,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    trials: 10000,
    seed: 'mat-part-no-leg-12-0',
  }),

  // Full roster (6/6 ducks owned)
  full_bank6_pity0: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 0,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 10000,
    seed: 'mat-full-6-0',
  }),
  full_bank6_pity30: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 30,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 10000,
    seed: 'mat-full-6-30',
  }),
  full_bank6_pity49_reset: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 10000,
    freezePity: false,
    seed: 'mat-full-6-49-reset',
  }),
  full_bank12_pity0: simulateTicketRecycling({
    initialBank: 12,
    initialPity: 0,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 10000,
    seed: 'mat-full-12-0',
  }),
  full_bank24_pity0: simulateTicketRecycling({
    initialBank: 24,
    initialPity: 0,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 10000,
    seed: 'mat-full-24-0',
  }),

  // Frozen Pity Counterexample (Cap-Hit Demonstration)
  frozen_pity49_counterexample: simulateTicketRecycling({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    trials: 10,
    maxDraws: 500,
    freezePity: true,
    seed: 'mat-frozen-pity49',
  }),
};

// 5. Reproducible Single-Run Per-Draw Trajectories
console.log('5. Generating step-by-step per-draw trajectories...');
const stepTrajectories = {
  traj1_empty_bank6: traceSingleRecyclingRun({
    initialBank: 6,
    initialPity: 0,
    initialOwned: new Set(),
    seed: 'traj-empty-6',
  }),
  traj2_partial_missing_legendary_pity49: traceSingleRecyclingRun({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4']),
    seed: 'traj-part-49',
  }),
  traj3_full_pity49_with_reset: traceSingleRecyclingRun({
    initialBank: 6,
    initialPity: 49,
    initialOwned: new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
    seed: 'traj-full-49-reset',
  }),
};

// 6. Pond Race Item I1 Resolution
console.log('6. Solving race quadrature and paired Monte Carlo...');
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

// 7. Whole-Wallet Hypothetical Progression Paths
console.log('7. Tracing whole-wallet hypothetical progression paths...');
const walletPaths = traceWholeWalletPaths();

// Assemble final results structure
const results = {
  generatedAt: new Date().toISOString(),
  rulesEvaluated: {
    t1: 'A (ticket pulls award normal 1/5/20 Down on duplicates)',
    t2: 'A (advances pity by 1, with explicit reset to 0 on Legendary)',
    t3: 'A (immediate active-banner redemption "Pull with Down — 6 Down")',
    i1: '+5% base speed boost for 1 race, non-stacking (lifecycle verification deferred to integration)',
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
  representativeOpeningTraces: traces,
  pooledBankRecurrence: Object.fromEntries(
    Object.entries(bankRecurrence).map(([k, v]) => [
      k,
      {
        initialBank: v.initialBank,
        expectedDraws: v.expectedDraws,
        steps: v.steps,
        liveMass: v.liveMass,
        absorbedMass: v.absorbedMass,
        totalMass: v.totalMass,
        firstStepAbsorbed: v.firstStepAbsorbed,
        absorbedDistribution: v.absorbedDistribution,
      },
    ])
  ),
  rosterMatrix: Object.fromEntries(
    Object.entries(rosterMatrix).map(([k, v]) => [
      k,
      {
        trials: v.trials,
        initialBank: v.initialBank,
        initialPity: v.initialPity,
        maxDrawsCap: v.maxDrawsCap,
        absorbedCount: v.absorbedCount,
        absorbedRate: v.absorbedRate,
        censoredCount: v.censoredCount,
        censoredRate: v.censoredRate,
        meanDrawsCompleted: v.meanDrawsCompleted,
        meanDrawsCapped: v.meanDrawsCapped,
        maxDrawsObserved: v.maxDrawsObserved,
        rareBouncesPer100Draws: v.rareBouncesPer100Draws,
        legendaryWindfallsPer100Draws: v.legendaryWindfallsPer100Draws,
        terminalBanks: v.terminalBanks,
        censoredResidualBanks: v.censoredResidualBanks,
      },
    ])
  ),
  stepTrajectories,
  raceItemResolution: {
    quadrature: raceQuadrature,
    deltaSprintWinPct: (raceQuadrature.finale_sprint_boosted - raceQuadrature.finale_sprint_baseline) * 100,
    pairedMonteCarlo: racePairedSim,
  },
  wholeWalletHypotheticalPaths: walletPaths,
  integrationObligations: [
    'Race item commit/cancel/reload: item must be consumed once on race commit; opening/closing stance modal must not consume; reload must not consume twice.',
    'Receipt representation: Down spend must be separate from cash and gems; 5 Down must be reported as affording a 3-Down item (not wholly stranded); reflection must be question-based.',
  ],
};

const outputPath = path.join(__dirname, 'results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\nResults successfully written to: ${outputPath}`);

// Print formatted summary tables to stdout
console.log('\n--- Summary Table 1: Base-Odds Pooled Bank Recurrence (Mass Conserved) ---');
console.table(
  Object.values(bankRecurrence).map((v) => ({
    bank: `${v.initialBank} Down`,
    expectedDraws: v.expectedDraws.toFixed(5),
    absorbedMass: v.absorbedMass.toFixed(8),
    liveMass: v.liveMass.toExponential(2),
    totalMass: v.totalMass.toFixed(8),
    steps: v.steps,
  }))
);

console.log('\n--- Summary Table 2: Roster Coverage Matrix (10,000 runs per cell) ---');
console.table(
  Object.entries(rosterMatrix).map(([k, v]) => ({
    scenario: k,
    bank: v.initialBank,
    pity: v.initialPity,
    meanDraws: v.meanDrawsCompleted !== null ? v.meanDrawsCompleted.toFixed(3) : 'N/A',
    absorbedPct: (v.absorbedRate * 100).toFixed(1) + '%',
    censoredPct: (v.censoredRate * 100).toFixed(1) + '%',
    maxDraws: v.maxDrawsObserved,
  }))
);
