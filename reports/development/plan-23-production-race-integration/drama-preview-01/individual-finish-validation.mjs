import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import * as original from './candidate-model.mjs';
import { firstCrossingParityProjection, interpolateSnapshot as interpolateExtendedSnapshot, resolveSeededRace } from './individual-finish-model.mjs';

const folder = import.meta.dirname;
const sourcePath = resolve(folder, '../drama-study-02/validation-results.json');
const outputPath = resolve(folder, 'individual-finish-validation-results.json');
const frozen = JSON.parse(await readFile(sourcePath, 'utf8'));
const rows = frozen.attempts.filter((row) => row.arm === 'R2combined-risk-only');
if (rows.length !== 1440) throw new Error(`Expected 1,440 frozen selected-arm attempts; found ${rows.length}`);

const roster = { common: 10, rare: 14, legendary: 20 };
const field = { tutorial: { speed: 8, raceId: 'R01' }, finale: { speed: 11.2, raceId: 'R03' } };
const restFactor = { rested: 1, 'one-race-rest': 0.75, 'zero-races-rest': 0.5 };
const quantile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)] : null;
};
const summary = (values) => ({ n: values.length, min: Math.min(...values), p50: quantile(values, 0.5), p90: quantile(values, 0.9), p95: quantile(values, 0.95), max: Math.max(...values) });
const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function returnedPrefix(historical, extended) {
  const ticks = Array.from({ length: Math.floor(historical.ticks) + 1 }, (_, tick) => tick);
  if (!ticks.some((tick) => Math.abs(tick - historical.ticks) <= 1e-12)) ticks.push(historical.ticks);
  const fields = ['progress', 'lateral', 'heading', 'speed', 'x', 'y'];
  for (const tick of ticks) {
    const expected = original.interpolateSnapshot(historical, tick);
    const actual = interpolateExtendedSnapshot(extended, tick);
    for (const expectedEntrant of expected.entrants) {
      const actualEntrant = actual.entrants.find((entrant) => entrant.id === expectedEntrant.id);
      for (const field of fields) {
        if (!actualEntrant || Math.abs(expectedEntrant[field] - actualEntrant[field]) > 1e-8) {
          return { matches: false, sampleCount: ticks.length, tick, entrantId: expectedEntrant.id, field,
            expected: expectedEntrant[field], actual: actualEntrant?.[field] ?? null };
        }
      }
    }
  }
  const samples = ticks.map((tick) => {
    const snapshot = interpolateExtendedSnapshot(extended, tick);
    return { tick, entrants: snapshot.entrants.map((entrant) => ({ id: entrant.id, ...Object.fromEntries(fields.map((field) => [field, entrant[field]])) })) };
  });
  return { matches: true, sampleCount: ticks.length, sha256: sha(samples) };
}
const attempts = [];
const firstWinnerTimes = [];
const lastWinnerTimes = [];
const tailTimes = [];
const fullPlaybackTimes = [];
let changedLowerPlacements = 0;
let changedPayouts = 0;
let exactTieRaces = 0;
let exactTiePairs = 0;
let nearTieRaces = 0;
let nearTiePairs = 0;
let partial = 0;
let guardCounts = {};
let firstMismatch = null;

for (const [index, row] of rows.entries()) {
  const preset = field[row.field];
  const input = {
    seed: row.seed, raceId: preset.raceId,
    playerBaseSpeed: roster[row.tier] * restFactor[row.rest], fieldBaseSpeed: preset.speed,
    choice: row.stance === 'sprint' ? 'sprint' : 'steady', trialCommitted: row.trialCommitted,
    experiment: 'weave-rank-strong-contact', dramaArm: 'R2combined-risk-only', studySprintMean: 1.0,
  };
  const historical = original.resolveSeededRace(input);
  const extended = resolveSeededRace(input);
  const baselineWitness = firstCrossingParityProjection(historical);
  const extendedWitness = firstCrossingParityProjection(extended);
  const witnessMatches = JSON.stringify(baselineWitness) === JSON.stringify(extendedWitness);
  const trajectoryPrefix = returnedPrefix(historical, extended);
  const frozenRowMatches = historical.status === row.status && historical.winner === row.winner && historical.finishTimeSeconds === row.finishTimeSeconds;
  if ((!witnessMatches || !trajectoryPrefix.matches || !frozenRowMatches) && !firstMismatch) {
    firstMismatch = { kind: !frozenRowMatches ? 'frozen-study-row' : !witnessMatches ? 'first-cross-causal-parity' : 'returned-trajectory-prefix', index, seed: row.seed, tier: row.tier, field: row.field, stance: row.stance, trialCommitted: row.trialCommitted, rest: row.rest,
      frozenWinner: row.winner, frozenTime: row.finishTimeSeconds, frozenStatus: row.status,
      trajectoryPrefix,
      expectedHash: sha(baselineWitness), actualHash: sha(extendedWitness), expectedWinner: baselineWitness.winner,
      actualWinner: extendedWitness.winner, expectedTime: baselineWitness.finishTimeSeconds, actualTime: extendedWitness.finishTimeSeconds };
  }
  if (firstMismatch) break;

  firstWinnerTimes.push(historical.finishTimeSeconds);
  if (extended.status === 'finished') {
    lastWinnerTimes.push(extended.lastFinishTimeSeconds);
    fullPlaybackTimes.push(extended.horizonSeconds + 3);
  }
  const tail = extended.lastFinishTimeSeconds === null ? null : extended.lastFinishTimeSeconds - extended.finishTimeSeconds;
  if (tail !== null) tailTimes.push(tail);
  if (extended.status !== 'finished') {
    partial += 1;
    const key = extended.unresolvedReason ?? 'unknown';
    guardCounts[key] = (guardCounts[key] ?? 0) + 1;
  }
  const oldPlace = new Map(historical.finish.map((finish) => [finish.id, finish.place]));
  const oldPayout = new Map(historical.finish.map((finish) => [finish.id, finish.payout]));
  const newPlace = new Map(extended.finish.map((finish) => [finish.id, finish.place]));
  const newPayout = new Map(extended.finish.map((finish) => [finish.id, finish.payout]));
  const lowerPlaceChanges = [...oldPlace.keys()].filter((id) => id !== historical.winner && oldPlace.get(id) !== newPlace.get(id));
  const payoutChanges = [...oldPayout.keys()].filter((id) => oldPayout.get(id) !== newPayout.get(id));
  changedLowerPlacements += lowerPlaceChanges.length;
  changedPayouts += payoutChanges.length;
  const sorted = [...extended.finishCrossings].sort((a, b) => a.crossingTimeSeconds - b.crossingTimeSeconds || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const pairs = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const delta = sorted[i].crossingTimeSeconds - sorted[i - 1].crossingTimeSeconds;
    if (delta === 0) { exactTiePairs += 1; pairs.push({ a: sorted[i - 1].id, b: sorted[i].id, delta }); }
    else if (delta < 0.005) { nearTiePairs += 1; pairs.push({ a: sorted[i - 1].id, b: sorted[i].id, delta }); }
  }
  if (pairs.some((pair) => pair.delta === 0)) exactTieRaces += 1;
  if (pairs.some((pair) => pair.delta > 0)) nearTieRaces += 1;
  attempts.push({
    seed: row.seed, tier: row.tier, field: row.field, stance: row.stance, trialCommitted: row.trialCommitted, rest: row.rest,
    witnessSha256: sha(extendedWitness), firstWinner: historical.winner, firstWinnerSeconds: historical.finishTimeSeconds,
    trajectoryPrefixSampleCount: trajectoryPrefix.sampleCount, trajectoryPrefixSha256: trajectoryPrefix.sha256,
    extendedStatus: extended.status, lastFinishSeconds: extended.lastFinishTimeSeconds, tailSeconds: tail,
    lowerPlaceChanges: lowerPlaceChanges.map((id) => ({ id, oldPlace: oldPlace.get(id), newPlace: newPlace.get(id) })),
    payoutChanges: payoutChanges.map((id) => ({ id, oldPayout: oldPayout.get(id), newPayout: newPayout.get(id) })),
    crossingOrder: extended.status === 'finished' ? extended.finish.map((item) => ({ id: item.id, place: item.place, crossingTimeSeconds: item.crossingTimeSeconds, payout: item.payout })) : [],
    tiePairs: pairs,
    unresolvedIds: extended.unresolvedEntrants.map((entrant) => entrant.id), guardEvidence: extended.guardEvidence,
  });
  if (index % 100 === 99) process.stdout.write(`verified ${index + 1}/1440 first-cross witnesses\n`);
}

if (firstMismatch) {
  await writeFile(outputPath, JSON.stringify({ version: 'plan23-individual-finish-validation-v1', expectedAttempts: 1440, verifiedBeforeMismatch: attempts.length, firstCrossingParity: 'STOPPED_ON_MISMATCH', firstMismatch }, null, 2));
  throw new Error(`First-crossing parity mismatch; stopped at frozen row ${firstMismatch.index}: ${JSON.stringify(firstMismatch)}`);
}
if (attempts.length !== 1440) throw new Error(`Only ${attempts.length}/1440 selected-arm attempts were checked`);
const output = {
  version: 'plan23-individual-finish-validation-v1',
  provenance: {
    historicalFile: '../drama-study-02/validation-results.json', historicalArm: 'R2combined-risk-only',
    attempts: rows.length, seedSet: 'plan23-drama2-val-01 through -20',
    caveat: 'This validates the report-only extended resolver against a frozen selected study set; it is not production validation or evidence about unseen seed populations.',
  },
  firstCrossingParity: { verified: attempts.length, mismatches: 0, projection: 'plan23-first-crossing-causal-parity-v1', definition: 'inputs, old winner and time, causal witness projection, every integer-tick returned interpolation through the old first-crossing tick plus the exact terminal frame, causal event records with only post-stop recovery/end copies normalized away, opportunity records, keyed draw keys, draw counts, and terminal-step ordering' },
  returnedTrajectoryPrefix: { cases: attempts.length, sampleFrames: attempts.reduce((total, attempt) => total + attempt.trajectoryPrefixSampleCount, 0), mismatches: 0, tolerance: 1e-8, definition: 'Compare actual interpolateSnapshot output for all integer ticks through each historical resolution.ticks and the exact historical terminal tick, across progress/lateral/heading/speed/x/y for every entrant; this independently checks renderer input and cannot be satisfied by firstCrossingWitness alone.' },
  results: {
    historicalFirstWinnerSeconds: summary(firstWinnerTimes),
    extendedLastFinisherSeconds: lastWinnerTimes.length ? summary(lastWinnerTimes) : null,
    winnerToLastCrossingTailSeconds: tailTimes.length ? summary(tailTimes) : null,
    changedLowerPlacementsByEntrantAcrossAllCases: changedLowerPlacements,
    changedPayoutsByEntrantAcrossAllCases: changedPayouts,
    exactTieRaces: { races: exactTieRaces, adjacentPairs: exactTiePairs },
    nearTieUnder5msRaces: { races: nearTieRaces, adjacentPairs: nearTiePairs },
    unresolvedAttempts: partial, unresolvedGuardReasons: guardCounts,
    fullPlaybackEstimateSecondsWith2sHighlightAnd1sOverlappingCoastPodium: fullPlaybackTimes.length ? summary(fullPlaybackTimes) : null,
  },
  attempts,
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(`Wrote ${attempts.length} parity-verified rows to ${outputPath}\n`);
