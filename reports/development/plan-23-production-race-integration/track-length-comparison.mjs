import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Small report-only identity-speed screen. Radius and all race/physics constants
// remain fixed; only the straight segment length changes in the memory copy.
const reportDir = import.meta.dirname;
const repoRoot = resolve(reportDir, '../../..');
const seeds = Array.from({ length: 8 }, (_, i) => `plan23-linear-cal-${String(i + 1).padStart(2, '0')}`);
const straightLengths = [60, 40, 20];
const curveRadius = 20;
const experiment = 'weave-rank-strong-contact';
const raceIds = [['R01', 8], ['R03', 11.2]];
const tiers = [['common', 10], ['rare', 14], ['legendary', 20]];
const stances = [['safe', 'steady'], ['sprint', 'sprint']];
const rests = [['rested', 1], ['one-race-rest', 0.75], ['zero-races-rest', 0.5]];
const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(sourcePath, 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;
const withPrng = source.replace("from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
if (withPrng === source) throw new Error('Accepted reference PRNG import was not found');

async function loadResolver(straight) {
  let code = withPrng.replace('topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', 'topSpeed: sampled,');
  if (!code.includes('topSpeed: sampled,')) throw new Error('Could not install the identity rating-to-topSpeed conversion');
  if (straight !== 60) {
    const updated = code.replace('straight: 60,', `straight: ${straight},`);
    if (updated === code) throw new Error(`Could not install straight length ${straight}`);
    code = updated;
  }
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).resolveSeededRace;
}

const quantile = (values, p) => [...values].sort((a, b) => a - b)[Math.ceil(p * values.length) - 1];
function summarize(values) {
  if (!values.length) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  return { n: values.length, mean, sd, p5: quantile(values, 0.05), median: quantile(values, 0.5), p90: quantile(values, 0.9), p95: quantile(values, 0.95), p99: quantile(values, 0.99), min: Math.min(...values), max: Math.max(...values), under17: values.filter((v) => v < 17).length, over23: values.filter((v) => v > 23).length };
}
function wilson(k, n) {
  if (!n) return { low: null, high: null };
  const z = 1.96, p = k / n, d = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / d;
  const half = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return { low: center - half, high: center + half };
}
function blockBootstrap(rows, repetitions = 3000) {
  const groups = new Map();
  for (const row of rows) {
    const block = groups.get(row.seed) ?? { bad: 0, n: 0 };
    block.bad += row.status !== 'finished' || row.finishTimeSeconds > 23 ? 1 : 0;
    block.n++;
    groups.set(row.seed, block);
  }
  const blocks = [...groups.values()];
  if (blocks.every((block) => block.bad === 0)) return { low: null, high: null, seedBlocks: blocks.length, repetitions, note: 'No observed late-or-unresolved outcomes; bootstrap is degenerate. Use Wilson interval as an attempt-level bound.' };
  let state = 0x23a71c;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 0x1_0000_0000; };
  const rates = [];
  for (let r = 0; r < repetitions; r++) {
    let bad = 0, n = 0;
    for (let i = 0; i < blocks.length; i++) { const b = blocks[Math.floor(random() * blocks.length)]; bad += b.bad; n += b.n; }
    rates.push(bad / n);
  }
  return { low: quantile(rates, 0.025), high: quantile(rates, 0.975), seedBlocks: blocks.length, repetitions };
}
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const results = {};
for (const straight of straightLengths) {
  const resolveRace = await loadResolver(straight);
  const rows = [];
  for (const [tier, speed] of tiers) for (const [raceId, fieldSpeed] of raceIds)
    for (const [stance, choice] of stances) for (const trialCommitted of [false, true])
      for (const [rest, restFactor] of rests) for (const seed of seeds) {
        const race = resolveRace({ seed, raceId, playerBaseSpeed: speed * restFactor, fieldBaseSpeed: fieldSpeed,
          choice, trialCommitted, experiment });
        const player = race.finish?.find((entrant) => entrant.id === 'P');
        rows.push({ seed, cell: `${tier}|${raceId}|${stance}|trial-${trialCommitted}|${rest}`, tier, raceId, stance, trialCommitted, rest,
          status: race.status, unresolvedReason: race.unresolvedReason ?? null,
          finishTimeSeconds: race.status === 'finished' ? race.finishTimeSeconds : null,
          playbackSeconds: race.status === 'finished' ? race.finishTimeSeconds + 2 : null,
          place: player?.place ?? null, win: player?.place === 1 });
      }
  const done = rows.filter((row) => row.status === 'finished');
  const late = done.filter((row) => row.finishTimeSeconds > 23).length;
  const unresolved = rows.length - done.length;
  const conservativeBad = late + unresolved;
  const times = done.map((row) => row.finishTimeSeconds);
  const perCell = new Map();
  for (const row of rows) { const cell = perCell.get(row.cell) ?? []; cell.push(row); perCell.set(row.cell, cell); }
  const cells = Object.fromEntries([...perCell.entries()].map(([key, attempts]) => {
    const finished = attempts.filter((row) => row.status === 'finished');
    const cellLate = finished.filter((row) => row.finishTimeSeconds > 23).length;
    return [key, { attempts: attempts.length, finished: finished.length, unresolved: attempts.length - finished.length,
      lateOver23: cellLate, conservativeBadShare: (cellLate + attempts.length - finished.length) / attempts.length,
      simulation: summarize(finished.map((row) => row.finishTimeSeconds)), playbackWithHighlight: summarize(finished.map((row) => row.playbackSeconds)),
      meanPlace: mean(finished.map((row) => row.place)), winRate: mean(finished.map((row) => Number(row.win))) }];
  }));
  const grouped = {};
  for (const dimension of ['tier', 'raceId', 'stance', 'trialCommitted', 'rest']) {
    const buckets = new Map();
    for (const row of rows) { const list = buckets.get(String(row[dimension])) ?? []; list.push(row); buckets.set(String(row[dimension]), list); }
    grouped[dimension] = Object.fromEntries([...buckets.entries()].map(([key, attempts]) => {
      const finished = attempts.filter((row) => row.status === 'finished');
      const groupLate = finished.filter((row) => row.finishTimeSeconds > 23).length;
      return [key, { attempts: attempts.length, finished: finished.length, unresolved: attempts.length - finished.length,
        lateOver23: groupLate, conservativeBadShare: (groupLate + attempts.length - finished.length) / attempts.length,
        simulation: summarize(finished.map((row) => row.finishTimeSeconds)), meanPlace: mean(finished.map((row) => row.place)),
        winRate: mean(finished.map((row) => Number(row.win))) }];
    }));
  }
  results[String(straight)] = { course: { straight, curveRadius, length: 2 * straight + 2 * Math.PI * curveRadius },
    runMix: 'equal weight across 72 cells: 3 tiers × 2 race/field inputs × 2 stances × 2 trial states × 3 rest factors',
    attempts: rows.length, finished: done.length, unresolved,
    unresolvedReasons: Object.fromEntries([...new Set(rows.map((row) => row.unresolvedReason).filter(Boolean))].map((reason) => [reason, rows.filter((row) => row.unresolvedReason === reason).length])),
    simulation: summarize(times), playbackWithSelectedHighlight: summarize(done.map((row) => row.playbackSeconds)),
    lateOver23ShareAmongFinishes: late / (done.length || 1), lateWilson95: wilson(late, done.length),
    conservativeLateOrUnresolvedShareOfAttempts: conservativeBad / rows.length,
    conservativeSeedBlockBootstrap95: blockBootstrap(rows),
    calibrationPass: times.length > 0 && quantile(times, 0.5) >= 17 && quantile(times, 0.5) <= 23 && conservativeBad / rows.length <= 0.05,
    grouped, cells };
}
const payload = { provenance: { source: 'accepted Plan 13 race-physics.mjs; in-memory identity topSpeed adapter and straight-segment geometry only',
  referenceSourceSha256: sourceHash, experiment, seedSet: 'existing 8-seed calibration set; all 72 input cells; these seeds are not held-out validation',
  seeds, seedsPerCell: seeds.length, cellsPerStraight: 72, attemptsPerStraight: 72 * seeds.length,
  changedParameter: 'straight length only; radius fixed at 20; identity rating-to-internal-speed mapping; sampled 8–12 clamp removed',
  fixedPhysics: 'All other Plan 13 constants unchanged, including maxSpeed=12 corner-target search bound, minSpeed setting (unused after clamp removal), acceleration, braking, turn law, weave/contact mechanics, event caps, and finish resolution.',
  passRule: 'Calibration pass requires median simulation finish in [17,23]s and late-or-unresolved attempts ≤5%; late means strictly >23s. Under-17 outcomes are allowed.',
  inputMatrix: '3 roster ratings × 2 production race/field cases × 2 stances × trial off/on × 3 rest factors',
  playback: 'Selected +2s highlight reported separately from simulated crossing time' }, results };
await writeFile(resolve(reportDir, 'track-length-comparison-results.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ provenance: payload.provenance, results: Object.fromEntries(Object.entries(results).map(([straight, result]) => [straight, {
  course: result.course, attempts: result.attempts, finished: result.finished, unresolved: result.unresolved,
  simulation: result.simulation, lateOver23ShareAmongFinishes: result.lateOver23ShareAmongFinishes,
  lateWilson95: result.lateWilson95, conservativeLateOrUnresolvedShareOfAttempts: result.conservativeLateOrUnresolvedShareOfAttempts,
  conservativeSeedBlockBootstrap95: result.conservativeSeedBlockBootstrap95, calibrationPass: result.calibrationPass,
}])) }, null, 2));
