// Independent orchestration calculations; no production mutation or scenario approval.
import { calculatePreDrawOdds } from '../../../src/core/game-engine.mjs';

const probabilities = [.8 / 3, .8 / 3, .8 / 3, .09, .09, .02];
const payouts = [1, 1, 1, 5, 5, 20];
const factorial = [1];
for (let n = 1; n <= 10; n++) factorial[n] = factorial[n - 1] * n;
const downDistribution = new Map();
const duplicateDistribution = new Map();
let totalProbability = 0;
function enumerate(index, remaining, counts) {
  if (index < 5) {
    for (let n = 0; n <= remaining; n++) enumerate(index + 1, remaining - n, [...counts, n]);
    return;
  }
  const all = [...counts, remaining];
  let probability = factorial[10], down = 0, duplicates = 0;
  for (let i = 0; i < 6; i++) {
    probability *= probabilities[i] ** all[i] / factorial[all[i]];
    duplicates += Math.max(all[i] - 1, 0);
    down += Math.max(all[i] - 1, 0) * payouts[i];
  }
  totalProbability += probability;
  downDistribution.set(down, (downDistribution.get(down) || 0) + probability);
  duplicateDistribution.set(duplicates, (duplicateDistribution.get(duplicates) || 0) + probability);
}
enumerate(0, 10, []);
const ordered = [...downDistribution].sort((a, b) => a[0] - b[0]);
let cumulative = 0, median;
for (const [down, probability] of ordered) {
  cumulative += probability;
  if (median === undefined && cumulative >= .5) median = down;
}
function firstPlaceProbability(low, high) {
  const steps = 100000;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const performance = low + (high - low) * (i + .5) / steps;
    const oneOpponentCDF = Math.max(0, Math.min(1, (performance - 10.64) / 1.12));
    sum += oneOpponentCDF ** 5;
  }
  return sum / steps;
}
// Finite-horizon pooled-bank calculation, base odds/full ownership ONLY.
let banks = new Map([[6, 1]]), expectedDraws = 0, liveMass = 1, steps = 0;
for (; steps < 1500 && liveMass > 1e-13; steps++) {
  const next = new Map();
  for (const [bank, probability] of banks) {
    if (bank < 6) continue;
    expectedDraws += probability;
    for (const [award, chance] of [[1, .8], [5, .18], [20, .02]]) {
      const after = bank - 6 + award;
      next.set(after, (next.get(after) || 0) + probability * chance);
    }
  }
  banks = next;
  liveMass = [...banks].reduce((sum, [bank, probability]) => sum + (bank >= 6 ? probability : 0), 0);
}
console.log(JSON.stringify({
  assumptions: 'Empty six-identity roster, 10 independent base-odds opening draws; pooled-bank check separately assumes full ownership/base odds/no external income.',
  totalProbability,
  meanDown: ordered.reduce((sum, [down, probability]) => sum + down * probability, 0),
  medianDown: median,
  ticketAffordable: ordered.reduce((sum, [down, probability]) => sum + (down >= 6 ? probability : 0), 0),
  exactly25Down: downDistribution.get(25),
  duplicateDistribution: [...duplicateDistribution].sort((a, b) => a[0] - b[0]),
  frozenPity49Odds: calculatePreDrawOdds(49),
  fullRosterBaseBank6: { expectedDrawsFiniteHorizon: expectedDraws, remainingLiveProbability: liveMass, steps, cap: 1500 },
  currentFiveOpponentSprintWinQuadrature: { baseline: firstPlaceProbability(8.8, 13.2), boost5Percent: firstPlaceProbability(9.24, 13.86) }
}, null, 2));
