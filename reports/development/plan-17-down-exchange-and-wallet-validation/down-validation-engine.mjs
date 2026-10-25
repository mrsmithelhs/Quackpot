// reports/development/plan-17-down-exchange-and-wallet-validation/down-validation-engine.mjs
// Dedicated calculation and simulation engine for Plan 17 Down exchange and wallet validation.
// Implements approved scenario rules:
// - T1 A: ticket duplicate draws award normal 1/5/20 Down
// - T2 A: ticket draws advance pity by 1, with normal Legendary reset to 0
// - T3 A: immediate active-banner redemption ("Pull with Down — 6 Down")
// - I1: +5% base speed boost for 1 race, non-stacking, consumed on race commit

import { calculatePreDrawOdds, BANNER_1_ROSTER, GAME_CONSTANTS } from '../../../src/core/game-engine.mjs';
import { createRng } from '../../../src/core/prng.mjs';

export const PROBABILITIES_6 = [0.8 / 3, 0.8 / 3, 0.8 / 3, 0.09, 0.09, 0.02];
export const PAYOUTS_6 = [1, 1, 1, 5, 5, 20];
export const TIERS_6 = ['common', 'common', 'common', 'rare', 'rare', 'legendary'];

const FACTORIALS = [1];
for (let i = 1; i <= 10; i++) FACTORIALS[i] = FACTORIALS[i - 1] * i;

/**
 * Computes exact multinomial distributions for a 10-pull from an empty 6-identity roster.
 */
export function computeExactOpeningDistribution() {
  const downDist = new Map();
  const dupDist = new Map();
  let totalProbability = 0;

  function enumerate(idx, remaining, counts) {
    if (idx < 5) {
      for (let n = 0; n <= remaining; n++) {
        enumerate(idx + 1, remaining - n, [...counts, n]);
      }
      return;
    }
    const all = [...counts, remaining];
    let prob = FACTORIALS[10];
    let down = 0;
    let dups = 0;

    for (let i = 0; i < 6; i++) {
      prob *= (PROBABILITIES_6[i] ** all[i]) / FACTORIALS[all[i]];
      const dupCount = Math.max(all[i] - 1, 0);
      dups += dupCount;
      down += dupCount * PAYOUTS_6[i];
    }

    totalProbability += prob;
    downDist.set(down, (downDist.get(down) || 0) + prob);
    dupDist.set(dups, (dupDist.get(dups) || 0) + prob);
  }

  enumerate(0, 10, []);

  const orderedDown = [...downDist].sort((a, b) => a[0] - b[0]);
  const orderedDups = [...dupDist].sort((a, b) => a[0] - b[0]);

  let cumulative = 0;
  let medianDown = null;
  for (const [down, prob] of orderedDown) {
    cumulative += prob;
    if (medianDown === null && cumulative >= 0.5) {
      medianDown = down;
    }
  }

  const meanDown = orderedDown.reduce((sum, [d, p]) => sum + d * p, 0);
  const meanDups = orderedDups.reduce((sum, [d, p]) => sum + d * p, 0);
  const ticketAffordable = orderedDown.reduce((sum, [d, p]) => sum + (d >= 6 ? p : 0), 0);
  const itemAffordable = orderedDown.reduce((sum, [d, p]) => sum + (d >= 3 ? p : 0), 0);

  return {
    totalProbability,
    meanDown,
    medianDown,
    meanDups,
    ticketAffordable,
    itemAffordable,
    orderedDown,
    orderedDups,
    exactly25Down: downDist.get(25) || 0,
  };
}

/**
 * Evaluates exact pooled-bank recurrence under base odds and full ownership.
 * Tracks discrete integer bank transitions: cost = 6, returns = +1 (80%), +5 (18%), +20 (2%).
 */
export function solveBaseOddsBankRecurrence(initialBank, maxSteps = 1500, epsilon = 1e-13) {
  let banks = new Map([[initialBank, 1.0]]);
  let expectedDraws = 0;
  let liveMass = 1.0;
  let steps = 0;
  const drawCountDistribution = new Map(); // total draws -> probability mass ending there

  for (; steps < maxSteps && liveMass > epsilon; steps++) {
    const next = new Map();
    for (const [bank, prob] of banks) {
      if (bank < 6) {
        // This mass is terminal
        continue;
      }
      expectedDraws += prob;
      for (const [award, chance] of [[1, 0.80], [5, 0.18], [20, 0.02]]) {
        const after = bank - 6 + award;
        next.set(after, (next.get(after) || 0) + prob * chance);
      }
    }
    banks = next;
    liveMass = [...banks].reduce((sum, [b, p]) => sum + (b >= 6 ? p : 0), 0);
  }

  // Final stranded bank distribution
  const terminalBankDistribution = new Map();
  for (const [b, p] of banks) {
    if (b < 6) {
      terminalBankDistribution.set(b, (terminalBankDistribution.get(b) || 0) + p);
    }
  }

  return {
    initialBank,
    expectedDraws,
    remainingLiveProbability: liveMass,
    steps,
    terminalBankDistribution: [...terminalBankDistribution].sort((a, b) => a[0] - b[0]),
  };
}

/**
 * Simulates dynamic ticket recycling under Rule T1 A and T2 A (pity-advancing with Legendary reset).
 * Supports full ownership or partial roster, and custom starting pity count.
 */
export function simulateTicketRecycling({
  initialBank = 6,
  initialPity = 0,
  initialOwned = new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']),
  trials = 50000,
  seed = 'down-sim-seed-17',
  freezePity = false, // Counterexample toggle: if true, pity does not reset on legendary
}) {
  const rng = createRng(seed);
  let totalDraws = 0;
  let totalDownGained = 0;
  let maxDrawsInRun = 0;
  const drawCounts = new Map();
  const terminalBanks = new Map();
  let rareBounces = 0;      // +5 Down gained
  let legendaryWindfalls = 0; // +20 Down gained
  let legendaryHits = 0;

  for (let t = 0; t < trials; t++) {
    let bank = initialBank;
    let pity = initialPity;
    let owned = new Set(initialOwned);
    let draws = 0;

    while (bank >= 6) {
      bank -= 6;
      draws++;

      const odds = calculatePreDrawOdds(pity);
      const r = rng.next();
      let rarity = 'common';
      if (r < odds.legendary) {
        rarity = 'legendary';
      } else if (r < odds.legendary + odds.rare) {
        rarity = 'rare';
      }

      // Pick duck within rarity pool
      const pool = BANNER_1_ROSTER.filter((d) => d.tier === rarity);
      const chosen = pool[rng.int(pool.length)];

      const isDuplicate = owned.has(chosen.id);
      let downAward = 0;

      if (!isDuplicate) {
        owned.add(chosen.id);
      } else {
        downAward = GAME_CONSTANTS.DOWN_PER_DUPLICATE[rarity];
        bank += downAward;
        totalDownGained += downAward;

        if (downAward === 5) rareBounces++;
        if (downAward === 20) legendaryWindfalls++;
      }

      // Pity advancement & reset (Rule T2 A)
      if (rarity === 'legendary') {
        legendaryHits++;
        if (!freezePity) {
          pity = 0; // Normal reset
        }
      } else {
        if (!freezePity) {
          pity++;
        }
      }

      // Safety guard against runaway loops
      if (draws > 2000) break;
    }

    totalDraws += draws;
    maxDrawsInRun = Math.max(maxDrawsInRun, draws);
    drawCounts.set(draws, (drawCounts.get(draws) || 0) + 1);
    terminalBanks.set(bank, (terminalBanks.get(bank) || 0) + 1);
  }

  const meanDraws = totalDraws / trials;
  return {
    trials,
    initialBank,
    initialPity,
    meanDraws,
    maxDrawsInRun,
    rareBouncesPer100Draws: (rareBounces / totalDraws) * 100,
    legendaryWindfallsPer100Draws: (legendaryWindfalls / totalDraws) * 100,
    drawCounts: [...drawCounts].sort((a, b) => a[0] - b[0]).map(([d, c]) => ({ draws: d, pct: (c / trials) * 100 })),
    terminalBanks: [...terminalBanks].sort((a, b) => a[0] - b[0]).map(([b, c]) => ({ bank: b, pct: (c / trials) * 100 })),
  };
}

/**
 * Numerical quadrature for 1st place probability against 5 independent opponents.
 * Opponents: base speed * (1 + (2u - 1) * 0.05).
 * Player: low to high uniform range.
 */
export function computeQuadratureWinProbability(playerLow, playerHigh, opponentBaseSpeed, steps = 100000) {
  const oppLow = opponentBaseSpeed * 0.95;
  const oppHigh = opponentBaseSpeed * 1.05;
  const oppSpan = oppHigh - oppLow;

  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const perf = playerLow + (playerHigh - playerLow) * (i + 0.5) / steps;
    const oneOpponentCDF = Math.max(0, Math.min(1, (perf - oppLow) / oppSpan));
    sum += oneOpponentCDF ** 5;
  }
  return sum / steps;
}

/**
 * Paired Monte Carlo simulation for pond race placements and payouts.
 * Tests Duck speed baseline vs. Option I1 (+5% speed boost).
 */
export function simulatePairedRaces({
  baseSpeed = 10.0,
  stance = 'sprint',
  opponentBaseSpeed = 11.2,
  itemBoost = 0.05, // +5%
  trials = 20000,
  seed = 'race-paired-seed-17',
}) {
  const rngBase = createRng(seed);
  const rngItem = createRng(seed); // Paired seed ensures identical opponent & noise rolls

  function runOneTrial(rng, duckSpeed) {
    const uPlayer = rng.next();
    const noiseSpan = stance === 'safe' ? 0.05 : 0.20;
    const targetSpeed = stance === 'safe' ? duckSpeed : duckSpeed * 1.10;
    const playerPerf = targetSpeed * (1 + (2 * uPlayer - 1) * noiseSpan);

    const opponents = [];
    for (let i = 1; i <= 5; i++) {
      const uOpp = rng.next();
      const oppPerf = opponentBaseSpeed * (1 + (2 * uOpp - 1) * 0.05);
      opponents.push({ perf: oppPerf, isPlayer: false, lane: i + 1 });
    }

    const entrants = [{ perf: playerPerf, isPlayer: true, lane: 2 }, ...opponents];
    entrants.sort((a, b) => {
      const diff = b.perf - a.perf;
      if (Math.abs(diff) > 1e-6) return diff;
      if (a.isPlayer) return -1;
      if (b.isPlayer) return 1;
      return a.lane - b.lane;
    });

    const place = entrants.findIndex((e) => e.isPlayer) + 1;
    let gems = 0;
    if (place === 1) gems = 50;
    else if (place === 2) gems = 20;
    else if (place === 3) gems = 10;

    return { place, gems, perf: playerPerf };
  }

  const baselinePlaces = [0, 0, 0, 0, 0, 0, 0];
  const boostedPlaces = [0, 0, 0, 0, 0, 0, 0];
  let baselineGems = 0;
  let boostedGems = 0;

  for (let i = 0; i < trials; i++) {
    const b = runOneTrial(rngBase, baseSpeed);
    const m = runOneTrial(rngItem, baseSpeed * (1 + itemBoost));

    baselinePlaces[b.place]++;
    boostedPlaces[m.place]++;
    baselineGems += b.gems;
    boostedGems += m.gems;
  }

  return {
    trials,
    baseSpeed,
    stance,
    opponentBaseSpeed,
    baseline: {
      winRate: baselinePlaces[1] / trials,
      placeDistribution: baselinePlaces.slice(1).map((c) => (c / trials) * 100),
      meanGems: baselineGems / trials,
    },
    boosted: {
      winRate: boostedPlaces[1] / trials,
      placeDistribution: boostedPlaces.slice(1).map((c) => (c / trials) * 100),
      meanGems: boostedGems / trials,
    },
    deltaWinRate: (boostedPlaces[1] - baselinePlaces[1]) / trials,
    deltaMeanGems: (boostedGems - baselineGems) / trials,
  };
}

/**
 * Traces whole-wallet balances across the 5 canonical progression paths.
 */
export function traceWholeWalletPaths() {
  const PULL_SINGLE = 160;
  const PULL_TEN = 1600;

  const scenarios = [
    {
      id: 'path-1',
      name: 'Path 1: Pure Isolated 1,750 Bundle',
      initialGems: 0,
      purchases: [{ kind: 'bundle', gems: 1750, cash: 4.99 }],
      pullsTen: 1,
      note: 'Theoretical bundle remainder without gameplay.',
    },
    {
      id: 'path-2',
      name: 'Path 2: Tutorial Race Win (50g) + 1,750 Bundle',
      initialGems: 50,
      purchases: [{ kind: 'bundle', gems: 1750, cash: 4.99 }],
      pullsTen: 1,
      note: 'Actual standard Day 1 opening progression.',
    },
    {
      id: 'path-3',
      name: 'Path 3: Starter Pack (240g) + Tutorial Win (50g) - 1 Pull + 1,750 Bundle',
      initialGems: 50 + 240 - 160, // 130
      purchases: [{ kind: 'bundle', gems: 1750, cash: 4.99 }],
      pullsTen: 1,
      note: 'Player bought starter pack and did one single pull on Day 1.',
    },
    {
      id: 'path-4',
      name: 'Path 4: Starter Pack Alone ($0.99 for 240g) + Tutorial Win (50g)',
      initialGems: 50,
      purchases: [{ kind: 'starter', gems: 240, cash: 0.99 }],
      pullsTen: 0,
      note: 'Day 1 starter anchor decision point.',
    },
    {
      id: 'path-5',
      name: 'Path 5: Two Race Wins (Day 1 + Day 2 = 100g) + 1,750 Bundle',
      initialGems: 100,
      purchases: [{ kind: 'bundle', gems: 1750, cash: 4.99 }],
      pullsTen: 1,
      note: 'Frugal player reaches Day 3 marketplace after two wins.',
    },
  ];

  return scenarios.map((s) => {
    let gems = s.initialGems;
    let cashSpent = 0;
    for (const p of s.purchases) {
      gems += p.gems;
      cashSpent += p.cash;
    }

    const afterTen = gems - s.pullsTen * PULL_TEN;
    const affordableSingles = Math.floor(afterTen / PULL_SINGLE);
    const strandedRemainder = afterTen % PULL_SINGLE;
    const shortfallToNext = strandedRemainder === 0 ? 0 : PULL_SINGLE - strandedRemainder;

    return {
      ...s,
      totalGemsBeforePulls: gems,
      cashSpent,
      afterTenPulls: afterTen,
      affordableSingles,
      strandedRemainder,
      shortfallToNext,
    };
  });
}
