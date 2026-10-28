import { writeFile } from 'node:fs/promises';
import { GameEngine, BANNER_1_ROSTER, GAME_CONSTANTS } from '../../../src/core/game-engine.mjs';
import { resolveSeededRace } from '../../../src/core/race-resolver.mjs';
import { deriveRaceRest } from '../../../src/core/race-rest.mjs';

const base = {
  raceId: 'R02', fieldBaseSpeed: 12,
  trialMultiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER,
  experiment: 'weave-rank-strong-contact', dramaArm: 'R2combined-risk-only', studySprintMean: 1,
};
const initialSeeds = Array.from({ length: 30 }, (_, index) => `plan22-matched-${String(index + 1).padStart(2, '0')}`);
const initialCases = [];
for (const duck of [BANNER_1_ROSTER[0], BANNER_1_ROSTER[2], BANNER_1_ROSTER[5]]) {
  for (const restFactor of [1, 0.75, 0.5]) {
    for (const seed of initialSeeds) {
      initialCases.push(runCase({ seed, duck, restFactor, trialCommitted: false, choice: 'steady', group: 'initial-270' }));
    }
  }
}

const profiles = [
  { rosterSize: 1, target: 'duck-0', history: ['duck-0'], description: 'one identity repeatedly races; zero intervening race' },
  { rosterSize: 2, target: 'duck-2', history: ['duck-2', 'duck-0'], description: 'two identity cadence; one intervening race' },
  { rosterSize: 3, target: 'duck-5', history: ['duck-5', 'duck-0', 'duck-2'], description: 'three identity rotation; two intervening races' },
];
const broadSeeds = Array.from({ length: 12 }, (_, index) => `plan22-cadence-${String(index + 1).padStart(2, '0')}`);
const broadCases = [];
for (const profile of profiles) {
  const target = BANNER_1_ROSTER.find((duck) => duck.id === profile.target);
  const engine = new GameEngine(`fixture-${profile.rosterSize}`);
  profile.history.forEach((duckId, index) => engine.log.append('race_result', {
    raceNumber: index + 1, raceId: `fixture-${profile.rosterSize}-${index + 1}`, duckId,
  }, { day: 1, label: 'synthetic longer-history fixture' }));
  const evidence = deriveRaceRest(engine.log.entries, profile.target);
  for (const factor of new Set([1, evidence.restFactor])) {
    for (const trialCommitted of [false, true]) {
      for (const choice of ['steady', 'sprint']) {
        for (const seed of broadSeeds) {
          broadCases.push(runCase({ seed, duck: target, restFactor: factor, trialCommitted, choice, group: 'cadence-input-screen', profile }));
        }
      }
    }
  }
}

function runCase({ seed, duck, restFactor, trialCommitted, choice, group, profile = null }) {
  const input = {
    ...base, seed, authoredPlayerRating: duck.speed, playerBaseSpeed: duck.speed * restFactor,
    restFactor, trialCommitted, choice,
  };
  const result = resolveSeededRace(input);
  const player = result.finish.find((entrant) => entrant.id === 'P') ?? null;
  return {
    group, seed, duckId: duck.id, authoredRating: duck.speed, restFactor,
    effectiveBaseInput: input.playerBaseSpeed, trialCommitted, choice,
    rosterSize: profile?.rosterSize ?? null, syntheticHistory: profile?.history ?? null,
    syntheticHistoryDescription: profile?.description ?? null,
    status: result.status, unresolvedReason: result.unresolvedReason ?? null,
    place: player?.place ?? null, payout: player?.payout ?? 0,
    playerCrossingSeconds: player?.crossingTimeSeconds ?? null,
    winnerCrossingSeconds: result.finishTimeSeconds ?? null,
    lastCrossingSeconds: result.lastFinishTimeSeconds ?? null,
  };
}

function summarize(cases) {
  const finished = cases.filter((item) => item.status === 'finished');
  const sorted = (key) => finished.map((item) => item[key]).filter(Number.isFinite).sort((a, b) => a - b);
  const median = (values) => values.length ? values[Math.floor((values.length - 1) / 2)] : null;
  return {
    cases: cases.length, finished: finished.length, unresolved: cases.length - finished.length,
    first: finished.filter((item) => item.place === 1).length,
    podium: finished.filter((item) => item.place <= 3).length,
    payoutTotal: finished.reduce((sum, item) => sum + item.payout, 0),
    medianPlayerCrossingSeconds: median(sorted('playerCrossingSeconds')),
    medianWinnerCrossingSeconds: median(sorted('winnerCrossingSeconds')),
    medianLastCrossingSeconds: median(sorted('lastCrossingSeconds')),
  };
}

function pairedEffects(profile, selectedFactor) {
  return ['steady', 'sprint'].flatMap((choice) => [false, true].map((trialCommitted) => {
    const pairs = broadSeeds.map((seed) => {
      const matches = broadCases.filter((item) => item.rosterSize === profile.rosterSize && item.seed === seed && item.choice === choice && item.trialCommitted === trialCommitted);
      const baseline = matches.find((item) => item.restFactor === 1);
      const selected = matches.find((item) => item.restFactor === selectedFactor);
      return baseline && selected ? { baseline, selected } : null;
    }).filter(Boolean);
    const delta = (field) => {
      const values = pairs.map(({ baseline, selected }) => selected[field] - baseline[field]);
      const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
      const sd = values.length > 1 ? Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)) : null;
      return { n: values.length, mean, sd, min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null };
    };
    return { choice, trialCommitted, pairedSeeds: pairs.length, placeDelta: delta('place'), payoutDelta: delta('payout'), playerCrossingDeltaSeconds: delta('playerCrossingSeconds'), winnerCrossingDeltaSeconds: delta('winnerCrossingSeconds') };
  }));
}

const output = {
  source: 'src/core/race-resolver.mjs',
  resolverConfig: base,
  initialSeedSet: initialSeeds,
  initialCases,
  initialSummary: summarize(initialCases),
  broadSeedSet: broadSeeds,
  broadCases,
  broadSummaryByProfile: profiles.map((profile) => ({
    rosterSize: profile.rosterSize,
    target: profile.target,
    syntheticHistory: profile.history,
    description: profile.description,
    restFactor: deriveRaceRest((() => {
      const engine = new GameEngine('summary-fixture');
      profile.history.forEach((duckId, index) => engine.log.append('race_result', { raceNumber: index + 1, raceId: `summary-${index + 1}`, duckId }, {}));
      return engine.log.entries;
    })(), profile.target).restFactor,
    restVsBaseline: [
      { restFactor: 1, cases: broadCases.filter((item) => item.rosterSize === profile.rosterSize && item.restFactor === 1), },
      { restFactor: deriveRaceRest((() => {
        const engine = new GameEngine('summary-fixture');
        profile.history.forEach((duckId, index) => engine.log.append('race_result', { raceNumber: index + 1, raceId: `summary-${index + 1}`, duckId }, {}));
        return engine.log.entries;
      })(), profile.target).restFactor, cases: broadCases.filter((item) => item.rosterSize === profile.rosterSize && item.restFactor === deriveRaceRest((() => {
        const engine = new GameEngine('summary-fixture');
        profile.history.forEach((duckId, index) => engine.log.append('race_result', { raceNumber: index + 1, raceId: `summary-${index + 1}`, duckId }, {}));
        return engine.log.entries;
      })(), profile.target).restFactor), },
    ].map((bucket) => ({ restFactor: bucket.restFactor, summary: summarize(bucket.cases) })),
    pairedEffects: pairedEffects(profile, deriveRaceRest((() => {
      const engine = new GameEngine('summary-fixture');
      profile.history.forEach((duckId, index) => engine.log.append('race_result', { raceNumber: index + 1, raceId: `summary-${index + 1}`, duckId }, {}));
      return engine.log.entries;
    })(), profile.target).restFactor),
  })),
};

await writeFile(new URL('./screen-results.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ initial: output.initialSummary, broad: output.broadSummaryByProfile.map(({ rosterSize, restFactor, restVsBaseline }) => ({ rosterSize, restFactor, restVsBaseline })) }, null, 2));
