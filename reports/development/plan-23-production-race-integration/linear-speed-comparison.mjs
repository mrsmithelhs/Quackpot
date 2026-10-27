import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Report-only matched comparison: current sqrt10.45 mapping vs. direct global
// rating-to-world-speed conversion. No production module is written or imported.
const reportDir = import.meta.dirname;
const repoRoot = resolve(reportDir, '../../..');
const calibrationSeeds = Array.from({ length: 8 }, (_, i) => `plan23-linear-cal-${String(i + 1).padStart(2, '0')}`);
const validationSeeds = Array.from({ length: 20 }, (_, i) => `plan23-linear-validation-${String(i + 1).padStart(2, '0')}`);
const low = 4.4;
const high = 27.72;
const experiment = 'weave-rank-strong-contact';
const raceIds = [['R01', 8], ['R03', 11.2]];
const tiers = [['common', 10], ['rare', 14], ['legendary', 20]];
const stances = [['safe', 'steady'], ['sprint', 'sprint']];
const rests = [['rested', 1], ['one-race-rest', 0.75], ['zero-races-rest', 0.5]];
const models = {
  sqrt10_45: { formula: '10.45 + 1.55 * sqrt((x - 4.4) / (27.72 - 4.4))', map: (x) => 10.45 + 1.55 * Math.sqrt((x - 4.4) / (27.72 - 4.4)), caps: 'mapped output stays inside the accepted 8–12 top-speed range; Plan 13 corner-target search is unchanged' },
  linear_raw: { formula: 'x (identity conversion from rating to internal world speed)', map: (x) => x, caps: 'sampled topSpeed clamp removed; accepted Plan 13 corner-target search bound and turn law unchanged' },
  linear_anchor_half: { formula: '8.25 + 0.5*x (maps low supported sample 4.4 to 10.45; retains half of raw absolute differences)', map: (x) => 8.25 + 0.5 * x, caps: 'sampled topSpeed clamp removed; accepted Plan 13 corner-target search bound and turn law unchanged' },
};

const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(sourcePath, 'utf8');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;
const sourceHash = createHash('sha256').update(source).digest('hex');
const withPrng = source.replace("from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
if (withPrng === source) throw new Error('Accepted reference PRNG import was not found');

async function loadResolver(name, model) {
  const mapText = model.map.toString().replace(/^\(x\) => /, '');
  let code = withPrng
    .replace('function makeEntrants(input) {', `function adapter(x) { return ${mapText}; }\nfunction makeEntrants(input) {`)
    .replace('topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', 'topSpeed: adapter(sampled),');
  if (!code.includes('topSpeed: adapter(sampled),')) throw new Error(`Failed to insert ${name} adapter`);
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).resolveSeededRace;
}

const quantile = (values, p) => [...values].sort((a, b) => a - b)[Math.ceil(p * values.length) - 1];
function summarize(values) {
  if (!values.length) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  return { n: values.length, mean, sd, p5: quantile(values, 0.05), median: quantile(values, 0.5), p90: quantile(values, 0.9), p95: quantile(values, 0.95), p99: quantile(values, 0.99), min: Math.min(...values), max: Math.max(...values), under17: values.filter((v) => v < 17).length, over23: values.filter((v) => v > 23).length };
}
function wilson(k, n) {
  if (!n) return { low: null, high: null };
  const z = 1.96, p = k / n, d = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / d;
  const half = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return { low: center - half, high: center + half };
}
function bootstrapSeedInterval(rows, field, repetitions = 3000) {
  const bySeed = new Map();
  for (const row of rows) {
    const item = bySeed.get(row.seed) ?? { bad: 0, attempts: 0 };
    item.bad += row[field] ? 1 : 0;
    item.attempts++;
    bySeed.set(row.seed, item);
  }
  const blocks = [...bySeed.values()];
  if (blocks.every((block) => block.bad === 0)) return { low: null, high: null, seedBlocks: blocks.length, repetitions, note: 'No observed late-or-unresolved outcomes; percentile bootstrap is degenerate. Use the Wilson interval as the stated upper uncertainty bound.' };
  let state = 0x23f17a5;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 0x1_0000_0000; };
  const rates = [];
  for (let r = 0; r < repetitions; r++) {
    let bad = 0, attempts = 0;
    for (let j = 0; j < blocks.length; j++) {
      const block = blocks[Math.floor(random() * blocks.length)];
      bad += block.bad; attempts += block.attempts;
    }
    rates.push(bad / attempts);
  }
  return { low: quantile(rates, 0.025), high: quantile(rates, 0.975), seedBlocks: blocks.length, repetitions };
}
const average = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const phaseSeeds = { calibration: calibrationSeeds, validation: validationSeeds };
const outputs = {};

for (const [modelName, model] of Object.entries(models)) {
  const resolveRace = await loadResolver(modelName, model);
  const phaseRows = {};
  for (const [phase, seeds] of Object.entries(phaseSeeds)) {
    const rows = [];
    for (const [tier, speed] of tiers) for (const [raceId, fieldSpeed] of raceIds)
      for (const [stance, choice] of stances) for (const trialCommitted of [false, true])
        for (const [rest, restFactor] of rests) for (const seed of seeds) {
          const input = { seed, raceId, playerBaseSpeed: speed * restFactor, fieldBaseSpeed: fieldSpeed, choice, trialCommitted, experiment };
          const race = resolveRace(input);
          const player = race.finish?.find((e) => e.id === 'P');
          rows.push({ phase, seed, cell: `${tier}|${raceId}|${stance}|trial-${trialCommitted}|${rest}`, tier, raceId, stance, trialCommitted, rest,
            status: race.status, unresolvedReason: race.unresolvedReason ?? null,
            finishTimeSeconds: race.status === 'finished' ? race.finishTimeSeconds : null,
            playbackSeconds: race.status === 'finished' ? race.finishTimeSeconds + 2 : null,
            place: player?.place ?? null, win: player?.place === 1,
            lateOrUnresolved: race.status !== 'finished' || race.finishTimeSeconds > 23 });
        }
    phaseRows[phase] = rows;
  }
  outputs[modelName] = { formula: model.formula, capTreatment: model.caps, phases: {} };
  for (const [phase, rows] of Object.entries(phaseRows)) {
    const finished = rows.filter((row) => row.status === 'finished');
    const sim = finished.map((row) => row.finishTimeSeconds);
    const playback = finished.map((row) => row.playbackSeconds);
    const lateCount = finished.filter((row) => row.finishTimeSeconds > 23).length;
    const unresolvedCount = rows.length - finished.length;
    const cellRows = new Map();
    for (const row of rows) {
      const list = cellRows.get(row.cell) ?? [];
      list.push(row); cellRows.set(row.cell, list);
    }
    const cells = Object.fromEntries([...cellRows.entries()].map(([key, items]) => {
      const done = items.filter((item) => item.status === 'finished');
      const times = done.map((item) => item.finishTimeSeconds);
      const late = done.filter((item) => item.finishTimeSeconds > 23).length;
      return [key, { attempts: items.length, finished: done.length, unresolved: items.length - done.length, lateOver23: late,
        conservativeLateOrUnresolvedShare: (late + items.length - done.length) / items.length, simulation: summarize(times),
        playback: summarize(done.map((item) => item.playbackSeconds)), meanPlace: average(done.map((item) => item.place)), winRate: average(done.map((item) => Number(item.win))) }];
    }));
    const grouped = {};
    for (const dimension of ['tier', 'raceId', 'stance', 'trialCommitted', 'rest']) {
      const groups = new Map();
      for (const row of rows) { const list = groups.get(String(row[dimension])) ?? []; list.push(row); groups.set(String(row[dimension]), list); }
      grouped[dimension] = Object.fromEntries([...groups.entries()].map(([key, items]) => {
        const done = items.filter((item) => item.status === 'finished');
        const l = done.filter((item) => item.finishTimeSeconds > 23).length;
        return [key, { attempts: items.length, finished: done.length, unresolved: items.length - done.length,
          lateOver23: l, lateOrUnresolvedShare: (l + items.length - done.length) / items.length,
          simulation: summarize(done.map((item) => item.finishTimeSeconds)), playback: summarize(done.map((item) => item.playbackSeconds)),
          meanPlace: average(done.map((item) => item.place)), winRate: average(done.map((item) => Number(item.win))) }];
      }));
    }
    const tailOrUnresolved = rows.filter((row) => row.status !== 'finished' || row.finishTimeSeconds > 23).length;
    outputs[modelName].phases[phase] = { runMix: 'equal weight across 72 cells: 3 tiers × 2 race/field inputs × 2 stances × 2 trial states × 3 rest factors',
      attempts: rows.length, finished: finished.length, unresolved: unresolvedCount,
      unresolvedReasons: Object.fromEntries([...new Set(rows.map((row) => row.unresolvedReason).filter(Boolean))].map((reason) => [reason, rows.filter((row) => row.unresolvedReason === reason).length])),
      simulation: summarize(sim), playbackWithSelectedHighlight: summarize(playback),
      lateOver23ShareAmongFinishes: lateCount / (finished.length || 1), lateOver23Wilson95AmongFinishes: wilson(lateCount, finished.length),
      conservativeLateOrUnresolvedShareOfAttempts: tailOrUnresolved / rows.length,
      conservativeSeedBlockBootstrap95: bootstrapSeedInterval(rows, 'lateOrUnresolved'),
      grouped, cells };
  }
}

const sampleInputs = [4.4, 5, 7.5, 8, 10, 10.5, 11, 11.2, 14, 14.7, 20, 21, 22, 27.72];
const inputConversion = Object.fromEntries(sampleInputs.map((x) => [String(x), {
  sqrt10_45: models.sqrt10_45.map(x), linear_raw: models.linear_raw.map(x), linear_anchor_half: models.linear_anchor_half.map(x),
}]));
const payload = { provenance: { source: 'accepted Plan 13 race-physics.mjs; in-memory adapter only; physics constants unchanged',
  referenceSourceSha256: sourceHash, experiment, selectedRulesPreserved: 'same rank-weave/contact experiment, seed keys, course geometry, acceleration, braking, accepted corner-target search and turn law, contact and finish logic; only sampled topSpeed conversion differs',
  comparison: 'sqrt10.45 baseline vs. identity linear conversion, then one calibration-selected linear conversion; no 8–12 topSpeed clamp on either linear arm',
  calibrationSeeds, validationSeeds, calibrationSeedsPerCell: calibrationSeeds.length, validationSeedsPerCell: validationSeeds.length,
  cellsPerPhase: 72, attemptsPerModel: 72 * (calibrationSeeds.length + validationSeeds.length),
  threshold: 'finish >23s is the one-sided late-tail criterion; median target 17–23s; under-17s finishes are permitted. An unresolved attempt is separately counted and included as conservative late-or-unresolved outcome.',
  inputOrder: 'roster rating × rest factor × one-time trial factor × stance/sample draw; then model conversion',
  speedRange: { low, high }, highlight: 'simulation finish time is reported separately from +2s presentation playback' },
  conversionSamples: inputConversion, results: outputs };
await writeFile(resolve(reportDir, 'linear-speed-comparison-results.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ provenance: payload.provenance, results: Object.fromEntries(Object.entries(outputs).map(([name, result]) => [name, Object.fromEntries(Object.entries(result.phases).map(([phase, phaseResult]) => [phase, {
  attempts: phaseResult.attempts, finished: phaseResult.finished, unresolved: phaseResult.unresolved,
  simulation: phaseResult.simulation, playbackWithSelectedHighlight: phaseResult.playbackWithSelectedHighlight,
  lateOver23ShareAmongFinishes: phaseResult.lateOver23ShareAmongFinishes,
  lateOver23Wilson95AmongFinishes: phaseResult.lateOver23Wilson95AmongFinishes,
  conservativeLateOrUnresolvedShareOfAttempts: phaseResult.conservativeLateOrUnresolvedShareOfAttempts,
  conservativeSeedBlockBootstrap95: phaseResult.conservativeSeedBlockBootstrap95,
}]))])) }, null, 2));
