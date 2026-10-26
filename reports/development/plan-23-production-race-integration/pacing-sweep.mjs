import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { resolveSeededRace } from '../plan-13-race-staging-and-run-pacing/preview-model.mjs';

const reportDir = import.meta.dirname;
const repoRoot = resolve(reportDir, '../../..');
const low = 4.4;
const high = 27.72;
const span = high - low;
const seeds = Array.from({ length: 30 }, (_, i) => `plan23-pacing-validation-${String(i + 1).padStart(2, '0')}`);
const models = {
  sqrt10_45: (x) => 10.45 + 1.55 * Math.sqrt((x - 4.4) / (27.72 - 4.4)),
};
const raceIds = [['R01', 8], ['R03', 11.2]];
const tiers = [['common', 10], ['rare', 14], ['legendary', 20]];
const stances = [['safe', 'steady'], ['sprint', 'sprint']];
const rests = [['rested', 1], ['one-race-rest', 0.75], ['zero-race-rest', 0.5]];
const experiment = 'weave-rank-strong-contact';
const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(sourcePath, 'utf8');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;
const withPrng = source.replace("from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
if (withPrng === source) throw new Error('Accepted reference PRNG import was not found');

async function loadResolver(name, fn) {
  const mapText = fn.toString().replace(/^\(x\) => /, '');
  const code = withPrng
    .replace('function makeEntrants(input) {', `function adapter(x) { return ${mapText}; }\nfunction makeEntrants(input) {`)
    .replace('topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', 'topSpeed: adapter(sampled),');
  if (!code.includes('topSpeed: adapter(sampled),')) throw new Error(`Failed to insert ${name} adapter`);
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).resolveSeededRace;
}

const quantile = (values, p) => [...values].sort((a, b) => a - b)[Math.ceil(p * values.length) - 1];
const summarize = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0) / values.length);
  return { n: values.length, mean, sd, skew: values.reduce((a,b)=>a+((b-mean)/sd)**3,0)/values.length,
  median: quantile(values, 0.5), p90: quantile(values, 0.9), p95: quantile(values, 0.95), p99: quantile(values, 0.99),
  min: Math.min(...values), max: Math.max(...values), over23Share: values.filter((v) => v > 23).length / values.length,
  in17to23Share: values.filter((v) => v >= 17 && v <= 23).length / values.length,
  under17Share: values.filter((v) => v < 17).length / values.length };
};

const results = {};
for (const [name, fn] of Object.entries(models)) {
  const resolveRace = await loadResolver(name, fn);
  const times = [];
  const cells = new Map();
  const rankByTier = new Map();
  let unresolved = 0;
  for (const [tier, speed] of tiers) for (const [raceId, fieldSpeed] of raceIds)
    for (const [stanceName, choice] of stances) for (const trialCommitted of [false, true])
      for (const [restName, restFactor] of rests) for (const seed of seeds) {
        const race = resolveRace({ seed, raceId, playerBaseSpeed: speed * restFactor,
          fieldBaseSpeed: fieldSpeed, choice, trialCommitted, experiment });
        if (race.status !== 'finished') { unresolved++; continue; }
        times.push(race.finishTimeSeconds);
        const cellKey = `${tier}|${raceId}|${stanceName}|trial-${trialCommitted}|${restName}`;
        const cell = cells.get(cellKey) ?? { times: [], places: [], wins: 0 };
        const player = race.finish.find((e) => e.id === 'P');
        cell.times.push(race.finishTimeSeconds); cell.places.push(player.place); cell.wins += player.place === 1 ? 1 : 0;
        cells.set(cellKey, cell);
        const tr = rankByTier.get(tier) ?? { places: [], wins: 0 };
        tr.places.push(player.place); tr.wins += player.place === 1 ? 1 : 0; rankByTier.set(tier, tr);
      }
  const byRest = Object.fromEntries(rests.map(([rest]) => [rest, summarize([...cells.entries()].filter(([key]) => key.endsWith(`|${rest}`)).flatMap(([, v]) => v.times))]));
  const byTierTime = Object.fromEntries(tiers.map(([tier]) => [tier, summarize([...cells.entries()].filter(([key]) => key.startsWith(`${tier}|`)).flatMap(([, v]) => v.times))]));
  const perTierRank = Object.fromEntries([...rankByTier.entries()].map(([tier, v]) => [tier,
    { meanPlace: v.places.reduce((a, b) => a + b, 0) / v.places.length, winRate: v.wins / v.places.length, n: v.places.length }]));
  const means = [...cells.entries()].map(([key, v]) => [key, v.times.reduce((a,b)=>a+b,0)/v.times.length,
    v.places.reduce((a,b)=>a+b,0)/v.places.length]);
  const cellMap = new Map(means.map(([key, time, place]) => [key, { time, place }]));
  const pairedDeltas = { trialSeconds: [], trialPlace: [], sprintSeconds: [], sprintPlace: [] };
  for (const [key, value] of cellMap) {
    const parts = key.split('|');
    const noTrialKey = `${parts[0]}|${parts[1]}|${parts[2]}|trial-false|${parts[4]}`;
    const safeKey = `${parts[0]}|${parts[1]}|safe|${parts[3]}|${parts[4]}`;
    const sprintKey = `${parts[0]}|${parts[1]}|sprint|${parts[3]}|${parts[4]}`;
    if (parts[3] === 'trial-true' && cellMap.has(noTrialKey)) {
      pairedDeltas.trialSeconds.push(value.time - cellMap.get(noTrialKey).time);
      pairedDeltas.trialPlace.push(value.place - cellMap.get(noTrialKey).place);
    }
    if (parts[2] === 'safe' && cellMap.has(sprintKey)) {
      pairedDeltas.sprintSeconds.push(cellMap.get(sprintKey).time - value.time);
      pairedDeltas.sprintPlace.push(cellMap.get(sprintKey).place - value.place);
    }
  }
  const avg = (values) => values.reduce((a,b)=>a+b,0)/values.length;
  results[name] = { transformSamples: { atCommon: fn(10), atRare: fn(14), atLegendary: fn(20), atLow: fn(low), atHigh: fn(high),
      trialBaseDelta: { common: fn(10*1.05)-fn(10), rare: fn(14*1.05)-fn(14), legendary: fn(20*1.05)-fn(20) },
      restDeltaCommon: { 25: fn(10)-fn(7.5), 50: fn(10)-fn(5) } },
    overall: summarize(times), unresolved, byRest, byTierTime, perTierRank,
    averagePairedEffectsAcrossConditionCells: { cells: pairedDeltas.trialSeconds.length,
      trialSeconds: avg(pairedDeltas.trialSeconds), trialPlace: avg(pairedDeltas.trialPlace),
      sprintSecondsSaved: avg(pairedDeltas.sprintSeconds), sprintPlaceImproved: -avg(pairedDeltas.sprintPlace) } };
}

const output = { provenance: { source: 'accepted Plan 13 race-physics.mjs; in-memory post-sampling adapter only',
  referenceSourceSha256: createHash('sha256').update(source).digest('hex'),
  experiment, seeds, seedsPerCell: seeds.length, mappings: Object.keys(models), racesPerMapping: 72 * seeds.length,
  totalRaces: Object.keys(models).length * 72 * seeds.length, validRaces: 'Only finished rows counted; unresolved count is recorded per mapping.',
  inputDomain: { low, high }, }, results };
await writeFile(resolve(reportDir, 'pacing-sweep-results.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ provenance: output.provenance, results: Object.fromEntries(Object.entries(results).map(([n, v]) => [n,
  { transformSamples: v.transformSamples, overall: v.overall, byRest: v.byRest, byTierTime: v.byTierTime,
    perTierRank: v.perTierRank, averagePairedEffectsAcrossConditionCells: v.averagePairedEffectsAcrossConditionCells }])) }, null, 2));
