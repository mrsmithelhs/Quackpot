import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import * as historical from './drama-preview-01/candidate-model.mjs';
import * as selectedContinuation from './drama-preview-01/individual-finish-model.mjs';
import {
  firstCrossingParityProjection,
  interpolateSnapshot as interpolateProduction,
  resolveSeededRace as resolveProduction,
} from '../../../src/core/race-resolver.mjs';

const here = import.meta.dirname;
const frozenPath = resolve(here, 'drama-study-02/validation-results.json');
const outputPath = resolve(here, 'production-parity-results.json');
const frozen = JSON.parse(await readFile(frozenPath, 'utf8'));
const rows = frozen.attempts.filter((row) => row.arm === 'R2combined-risk-only');
if (rows.length !== 1440) throw new Error(`Expected 1,440 frozen selected-arm cases, got ${rows.length}`);

const rating = { common: 10, rare: 14, legendary: 20 };
const field = { tutorial: { speed: 8, raceId: 'R01' }, finale: { speed: 11.2, raceId: 'R03' } };
const rest = { rested: 1, 'one-race-rest': 0.75, 'zero-races-rest': 0.5 };
const fields = ['progress', 'lateral', 'heading', 'speed', 'x', 'y'];
const sha = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
let sampledFrames = 0;
let mismatch = null;
const firstCrossHashes = [];
const tailSeconds = [];
const lastFinishSeconds = [];
const playbackSeconds = [];

for (const [index, row] of rows.entries()) {
  const race = field[row.field];
  const referenceInput = {
    seed: row.seed,
    raceId: race.raceId,
    playerBaseSpeed: rating[row.tier] * rest[row.rest],
    fieldBaseSpeed: race.speed,
    choice: row.stance === 'sprint' ? 'sprint' : 'steady',
    trialCommitted: row.trialCommitted,
    experiment: 'weave-rank-strong-contact',
    dramaArm: 'R2combined-risk-only',
    studySprintMean: 1,
  };
  const productionInput = { ...referenceInput, restFactor: rest[row.rest], trialMultiplier: 1.05 };
  const expected = historical.resolveSeededRace(referenceInput);
  const expectedContinuation = selectedContinuation.resolveSeededRace(productionInput);
  const actual = resolveProduction(productionInput);
  if (actual.inputs.restFactor !== rest[row.rest] || actual.inputs.trialMultiplier !== 1.05) {
    throw new Error('Production adapter input evidence lost the accepted rest/trial values');
  }
  // The preview omitted these two explicitly versioned production adapter
  // fields; compare its historical mechanics after asserting their values above.
  const actualForHistoricalProjection = {
    ...actual,
    inputs: referenceInput,
    firstCrossingWitness: actual.firstCrossingWitness
      ? { ...actual.firstCrossingWitness, inputs: referenceInput }
      : null,
  };
  const oldProjection = firstCrossingParityProjection(expected);
  const newProjection = firstCrossingParityProjection(actualForHistoricalProjection);
  if (JSON.stringify(oldProjection) !== JSON.stringify(newProjection)) {
    mismatch = { index, seed: row.seed, kind: 'first-cross-causal-parity' };
    break;
  }
  const mechanicalFields = [
    'rulesVersion', 'seed', 'raceId', 'experiment', 'controller', 'weaving', 'contactTreatment', 'choice',
    'status', 'unresolvedReason', 'guardLimits', 'guardEvidence', 'terminalStepOrdering', 'winner',
    'finishTimeSeconds', 'lastFinishTimeSeconds', 'finishCrossings', 'unresolvedEntrants', 'tailTicks',
    'courseLength', 'dt', 'horizonSeconds', 'ticks', 'entrants', 'trajectory', 'eventRecords',
    'opportunityRecords', 'finish', 'draws', 'drawKeys', 'trialConsumptionCount', 'studyAssistanceAudit',
  ];
  const mechanicsMismatch = mechanicalFields.find((name) => JSON.stringify(actual[name]) !== JSON.stringify(expectedContinuation[name]));
  if (mechanicsMismatch) {
    mismatch = { index, seed: row.seed, kind: 'selected-continuation', field: mechanicsMismatch };
    break;
  }
  if (expected.status !== row.status || expected.winner !== row.winner || expected.finishTimeSeconds !== row.finishTimeSeconds) {
    mismatch = { index, seed: row.seed, kind: 'frozen-winner-fixture' };
    break;
  }
  const sampleTicks = Array.from({ length: Math.floor(expected.ticks) + 1 }, (_, tick) => tick);
  if (!sampleTicks.some((tick) => Math.abs(tick - expected.ticks) <= 1e-12)) sampleTicks.push(expected.ticks);
  const returned = [];
  for (const tick of sampleTicks) {
    const before = historical.interpolateSnapshot(expected, tick);
    const after = interpolateProduction(actual, tick);
    for (const oldEntrant of before.entrants) {
      const newEntrant = after.entrants.find((entrant) => entrant.id === oldEntrant.id);
      for (const name of fields) {
        if (!newEntrant || Math.abs(oldEntrant[name] - newEntrant[name]) > 1e-8) {
          mismatch = { index, seed: row.seed, kind: 'trajectory-prefix', tick, id: oldEntrant.id, field: name,
            expected: oldEntrant[name], actual: newEntrant?.[name] ?? null };
          break;
        }
      }
      if (mismatch) break;
      returned.push({ id: oldEntrant.id, ...Object.fromEntries(fields.map((name) => [name, newEntrant[name]])) });
    }
    if (mismatch) break;
    sampledFrames += 1;
  }
  if (mismatch) break;
  firstCrossHashes.push(sha(newProjection));
  if (actual.status === 'finished') {
    lastFinishSeconds.push(actual.lastFinishTimeSeconds);
    tailSeconds.push(actual.lastFinishTimeSeconds - actual.finishTimeSeconds);
    playbackSeconds.push(actual.horizonSeconds + 3);
  }
  if (index % 100 === 99) process.stdout.write(`verified ${index + 1}/1440 production-port cases\n`);
}

if (mismatch || firstCrossHashes.length !== 1440) {
  const failed = { version: 'plan23-production-port-parity-v1', verifiedCases: firstCrossHashes.length, sampledFrames, mismatches: 1, firstMismatch: mismatch };
  await writeFile(outputPath, `${JSON.stringify(failed, null, 2)}\n`);
  throw new Error(`Production port parity stopped: ${JSON.stringify(mismatch)}`);
}
const quantile = (values, p) => [...values].sort((a, b) => a - b)[Math.ceil(p * values.length) - 1];
const summary = (values) => ({ n: values.length, p50: quantile(values, 0.5), p95: quantile(values, 0.95), max: Math.max(...values), over23: values.filter((value) => value > 23).length });
const result = {
  version: 'plan23-production-port-parity-v1',
  provenance: { historical: 'drama-preview-01/candidate-model.mjs', selectedContinuation: 'drama-preview-01/individual-finish-model.mjs', cases: rows.length,
    production: '../../../src/core/race-resolver.mjs', criterion: 'selected R2combined-risk-only frozen 1,440 first-cross causal projections, exact all-recorded mechanics/crossings/places/payouts versus the selected continuation, and every returned interpolation frame through historical terminal tick' },
  firstCrossingParity: { cases: firstCrossHashes.length, mismatches: 0, witnessSha256: sha(firstCrossHashes) },
  trajectoryPrefix: { sampledFrames, mismatches: 0, tolerance: 1e-8 },
  selectedModelTimes: {
    winnerCrossingSeconds: summary(rows.map((row) => row.finishTimeSeconds)),
    lastCrossingSeconds: summary(lastFinishSeconds),
    winnerToLastTailSeconds: { p50: quantile(tailSeconds, 0.5), p95: quantile(tailSeconds, 0.95), max: Math.max(...tailSeconds) },
    playbackWithTwoSecondHighlightAndOneSecondRevealSeconds: { p50: quantile(playbackSeconds, 0.5), p95: quantile(playbackSeconds, 0.95), max: Math.max(...playbackSeconds) },
  },
  caveat: 'The frozen matrix validates selected known inputs and their historical first-crossing output. It does not estimate unseen production-seed populations or substitute for browser lifecycle evidence.',
};
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`Verified ${rows.length} production-port cases and ${sampledFrames} returned trajectory frames.\n`);
