// Empirical Paired Recheck: Removing Physical Duck from Race Roster
// Compares 100 seeds across frugal and whale scenarios and multiple policies
// (best, random, alternate) with own-duck present vs excluded.

import { Run, DEFAULT_PARAMS } from './model.mjs';
import { makeStrategy } from './strategies.mjs';

function runComparison(seedsCount = 100) {
  const policies = ['best', 'random', 'alternate'];
  const scenarios = ['frugal_single', 'whale_ten'];

  const results = [];

  for (const scenario of scenarios) {
    for (const policy of policies) {
      const strat = makeStrategy(scenario, { race: policy });
      let identicalRaces = 0;
      let totalRaces = 0;
      let gemDiffSum = 0;
      let ownDuckPickedWithOwnDuck = 0;

      for (let s = 1; s <= seedsCount; s++) {
        const seed = `recheck-${scenario}-${policy}-${s}`;

        // Run 1: With own-duck present (default)
        const r1 = new Run(DEFAULT_PARAMS, seed);
        r1.start();
        let guard1 = 0;
        while (!r1.terminal && guard1++ < 1000) r1.playDay(strat);

        // Run 2: Without own-duck (ownDuckSold initialized to true immediately after start)
        const r2 = new Run(DEFAULT_PARAMS, seed);
        r2.start();
        r2.ownDuckSold = true;
        let guard2 = 0;
        while (!r2.terminal && guard2++ < 1000) r2.playDay(strat);

        const races1 = r1.log.entries.filter((e) => e.type === 'race_result');
        const races2 = r2.log.entries.filter((e) => e.type === 'race_result');

        totalRaces += races1.length;
        const minLen = Math.min(races1.length, races2.length);
        for (let i = 0; i < minLen; i++) {
          if (races1[i].payload.place === races2[i].payload.place) {
            identicalRaces++;
          }
        }

        // Check if own-duck was picked in Run 1
        const choices1 = r1.log.entries.filter((e) => e.type === 'race_choice_offered');
        const actions1 = r1.log.entries.filter((e) => e.type === 'action' && e.payload.kind === 'race_choice');
        for (let i = 0; i < actions1.length; i++) {
          const ch = actions1[i].payload.choice;
          const duckId = choices1[i]?.payload.options[ch]?.duckId;
          if (duckId === 'own-duck') ownDuckPickedWithOwnDuck++;
        }

        gemDiffSum += (r1.gems - r2.gems);
      }

      results.push({
        scenario,
        policy,
        seedsCount,
        totalRaces,
        identicalRacesRatio: totalRaces > 0 ? (identicalRaces / totalRaces).toFixed(4) : '1.0000',
        ownDuckPickedCount: ownDuckPickedWithOwnDuck,
        meanGemDiff: (gemDiffSum / seedsCount).toFixed(2),
      });
    }
  }

  return results;
}

const res = runComparison(100);
console.log('=== Empirical Paired Recheck Results (100 seeds) ===');
console.table(res);
