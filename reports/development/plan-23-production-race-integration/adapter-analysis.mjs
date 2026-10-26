import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { resolveSeededRace, PHYSICS } from '../plan-13-race-staging-and-run-pacing/preview-model.mjs';

const ROOT = resolve(import.meta.dirname, '../../..');
const referencePath = resolve(ROOT, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const prngUrl = pathToFileURL(resolve(ROOT, 'src/core/prng.mjs')).href;
const source = await readFile(referencePath, 'utf8');
const replacedImport = source.replace("from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
if (replacedImport === source) throw new Error('Could not locate the accepted reference PRNG import');
const adapterAnchor = 'function makeEntrants(input) {';
if (!replacedImport.includes(adapterAnchor)) throw new Error('Could not locate reference entrant construction');

const LOW = 4.4; // 10 m/s common × 0.50 rest × 1.10 sprint × 0.80 low draw
const HIGH = 27.72; // 20 m/s legendary × 1.05 trial × 1.10 sprint × 1.20 high draw
const range = HIGH - LOW;
const mappings = {
  clampedReference: (speed) => Math.max(8, Math.min(12, speed)),
  affine8to12: (speed) => 8 + 4 * (speed - LOW) / range,
  logarithmic9to12: (speed) => 9 + 3 * Math.log1p((speed - LOW) / 5) / Math.log1p(range / 5),
  squareRoot9to12: (speed) => 9 + 3 * Math.sqrt((speed - LOW) / range),
};

const bytes = (value) => Buffer.byteLength(JSON.stringify(value), 'utf8');
const gzBytes = (value) => gzipSync(Buffer.from(JSON.stringify(value))).byteLength;
function compactResolution(resolution) {
  const order = resolution.entrants.map((entrant) => entrant.id);
  const trajectory = [];
  let prior = '';
  for (const snapshot of resolution.trajectory) {
    const row = [Math.round(snapshot.tick * 1_000_000), snapshot.entrants.map((entrant) => [
      Math.round(entrant.progress * 1_000), Math.round(entrant.lateral * 1_000),
      Math.round(entrant.heading * 10_000), Math.round(entrant.speed * 1_000),
    ])];
    const encoded = JSON.stringify(row);
    if (encoded !== prior) trajectory.push(row);
    prior = encoded;
  }
  return {
    version: 1, rulesVersion: resolution.rulesVersion, seed: resolution.seed, raceId: resolution.raceId,
    inputs: resolution.inputs, status: resolution.status, unresolvedReason: resolution.unresolvedReason,
    winner: resolution.winner, finishTimeMicros: resolution.finishTimeSeconds === null ? null : Math.round(resolution.finishTimeSeconds * 1_000_000),
    entrants: resolution.entrants.map(({ id, name, lane, row, player }) => ({ id, name, lane, row, player })),
    trajectoryOrder: order, trajectory, eventRecords: resolution.eventRecords,
    opportunityRecords: resolution.opportunityRecords, finish: resolution.finish,
    trialConsumptionCount: resolution.trialConsumptionCount,
  };
}

async function loadMappedResolver(name, map) {
  const adapterSource = `const LOW = ${LOW}; const HIGH = ${HIGH}; const range = HIGH - LOW;\nfunction adapter(speed) { return ${map.toString().replace(/^\(speed\) => /, '')}; }\n`;
  const transformed = replacedImport.replace(adapterAnchor, `${adapterSource}${adapterAnchor}`)
    .replace('topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', 'topSpeed: adapter(sampled),');
  if (transformed === replacedImport || !transformed.includes('topSpeed: adapter(sampled),')) throw new Error(`Could not install ${name} in-memory adapter`);
  const module = await import(`data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`);
  return module.resolveSeededRace;
}

const roster = [
  ['common-10', 10], ['rare-14', 14], ['legendary-20', 20],
];
const fieldInputs = [
  ['tutorial-8', 8, 'R01'], ['finale-11.2', 11.2, 'R03'],
];
const stances = [['safe', 'steady'], ['sprint', 'sprint']];
const rests = [['rested', 1], ['one-race-rest', 0.75], ['zero-races-rest', 0.5]];
const trials = [false, true];
const seeds = Array.from({ length: 6 }, (_, i) => `plan23-adapter-seed-${String(i + 1).padStart(2, '0')}`);
const experiment = 'weave-rank-strong-contact';

const directInput = { seed: 'Quackpot Plan 13 named-seed example', raceId: 'R03', playerBaseSpeed: 11.7,
  fieldBaseSpeed: 11.5, choice: 'steady', trialCommitted: false, experiment };
const directReference = resolveSeededRace(directInput);
const scan = {};
for (const [name, map] of Object.entries(mappings)) {
  const mappedResolve = await loadMappedResolver(name, map);
  const rows = [];
  const outcomes = new Map();
  const rankTotals = new Map();
  const finishTimes = [];
  const serialized = [];
  let maxMechanicalEvents = 0; let maxOpportunityDiagnostics = 0; let maxTicks = 0;
  for (const [duckId, baseSpeed] of roster) for (const [raceName, fieldBaseSpeed, raceId] of fieldInputs)
    for (const [stanceName, choice] of stances) for (const trialCommitted of trials)
      for (const [restName, restFactor] of rests) for (const seed of seeds) {
        const resolution = mappedResolve({ seed, raceId, playerBaseSpeed: baseSpeed * restFactor,
          fieldBaseSpeed, choice, trialCommitted, experiment });
        maxMechanicalEvents = Math.max(maxMechanicalEvents, resolution.eventRecords.length);
        maxOpportunityDiagnostics = Math.max(maxOpportunityDiagnostics, resolution.opportunityRecords.length);
        maxTicks = Math.max(maxTicks, resolution.ticks);
        const key = `${duckId}|${raceName}|${stanceName}|trial-${trialCommitted}|${restName}`;
        const agg = outcomes.get(key) ?? { n: 0, finished: 0, inTargetBand: 0, unresolved: {}, wins: 0, placeSum: 0, finishTimes: [] };
        agg.n++;
        if (resolution.status === 'finished') {
          agg.finished++;
          if (resolution.finishTimeSeconds >= 17 && resolution.finishTimeSeconds <= 23) agg.inTargetBand++;
          agg.finishTimes.push(resolution.finishTimeSeconds);
          finishTimes.push(resolution.finishTimeSeconds);
          const player = resolution.finish.find((entry) => entry.id === 'P');
          agg.placeSum += player.place;
          if (player.place === 1) agg.wins++;
        } else agg.unresolved[resolution.unresolvedReason] = (agg.unresolved[resolution.unresolvedReason] ?? 0) + 1;
        outcomes.set(key, agg);
        if (!rankTotals.has(duckId)) rankTotals.set(duckId, { n: 0, place: 0, wins: 0 });
        const rank = rankTotals.get(duckId);
        if (resolution.status === 'finished') {
          rank.n++; rank.place += resolution.finish.find((entry) => entry.id === 'P').place;
          rank.wins += resolution.finish[0]?.id === 'P' ? 1 : 0;
        }
        if (seed === seeds[0] && trialCommitted === false && restName === 'rested' && stanceName === 'safe') {
          rows.push({ duck: duckId, field: raceName, stance: stanceName, trialCommitted, rest: restName,
            finishTimeSeconds: resolution.finishTimeSeconds, place: resolution.finish.find((e) => e.id === 'P')?.place,
            playerTopSpeed: resolution.entrants.find((e) => e.id === 'P')?.topSpeed,
            status: resolution.status, reason: resolution.unresolvedReason });
          if (serialized.length < 5) {
            const compact = compactResolution(resolution);
            serialized.push({ resolution, bytes: bytes(resolution), gzipBytes: gzBytes(resolution),
              compactBytes: bytes(compact), compactGzipBytes: gzBytes(compact), compactTrajectoryPoints: compact.trajectory.length });
          }
        }
      }
  scan[name] = {
    pointRows: rows,
    perCell: Object.fromEntries([...outcomes.entries()].map(([key, value]) => [key, {
      n: value.n, finishRate: value.finished / value.n, targetBandRateAmongFinished: value.finished ? value.inTargetBand / value.finished : null,
      meanPlayerPlace: value.finished ? value.placeSum / value.finished : null, playerWinRate: value.finished ? value.wins / value.finished : null,
      finishMin: value.finishTimes.length ? Math.min(...value.finishTimes) : null,
      finishMedian: value.finishTimes.length ? [...value.finishTimes].sort((a,b)=>a-b)[Math.floor(value.finishTimes.length/2)] : null,
      finishMax: value.finishTimes.length ? Math.max(...value.finishTimes) : null, unresolved: value.unresolved,
    }])),
    byIdentity: Object.fromEntries([...rankTotals.entries()].map(([id, v]) => [id, { meanPlace: v.place / v.n, winRate: v.wins / v.n, n: v.n }])),
    overall: { races: [...outcomes.values()].reduce((s, v) => s + v.n, 0), finishRate: [...outcomes.values()].reduce((s,v)=>s+v.finished,0) / [...outcomes.values()].reduce((s,v)=>s+v.n,0),
      targetBandRateAmongFinished: finishTimes.filter((t)=>t>=17&&t<=23).length / finishTimes.length,
      finishMin: Math.min(...finishTimes), finishMedian: [...finishTimes].sort((a,b)=>a-b)[Math.floor(finishTimes.length/2)], finishMax: Math.max(...finishTimes),
      maxMechanicalEvents, maxOpportunityDiagnostics, maxTicks },
    sampleSerialization: serialized.map(({ resolution, ...size }) => ({ status: resolution.status, ticks: resolution.ticks,
      eventCount: resolution.eventRecords.length, opportunityCount: resolution.opportunityRecords.length, ...size })),
  };
}

const capResolution = resolveSeededRace(directInput, { maxMechanicalEvents: 1, maxOpportunityDiagnostics: 0 });
const eventCapResolution = resolveSeededRace(directInput, { maxMechanicalEvents: 1, maxOpportunityDiagnostics: PHYSICS.maxOpportunityDiagnostics });
const out = {
  provenance: { referenceModule: 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs',
    referenceVersion: PHYSICS.version, readOnly: true, adapterAppliedInMemoryToSampledPerformance: true,
    seeds, experiment, raceIds: fieldInputs.map((row) => row[2]), rests: Object.fromEntries(rests),
    count: '3 roster speeds × 2 production fields/race IDs × 2 stances × 2 trial states × 3 rest factors × 6 seeds = 432 races per mapping',
    inputDomain: { minimum: LOW, maximum: HIGH }, directReference: {
      fingerprintSha256: createHash('sha256').update((await import('../plan-13-race-staging-and-run-pacing/preview-model.mjs')).raceFingerprint(directReference)).digest('hex'),
      status: directReference.status, ticks: directReference.ticks, jsonBytes: bytes(directReference), gzipBytes: gzBytes(directReference),
      events: directReference.eventRecords.length, opportunities: directReference.opportunityRecords.length },
    guardSizingWitness: { status: capResolution.status, reason: capResolution.unresolvedReason, ticks: capResolution.ticks,
      eventCount: capResolution.eventRecords.length, opportunityCount: capResolution.opportunityRecords.length,
      jsonBytes: bytes(capResolution), gzipBytes: gzBytes(capResolution) },
    eventCapSizingWitness: { status: eventCapResolution.status, reason: eventCapResolution.unresolvedReason, ticks: eventCapResolution.ticks,
      eventCount: eventCapResolution.eventRecords.length, opportunityCount: eventCapResolution.opportunityRecords.length,
      jsonBytes: bytes(eventCapResolution), gzipBytes: gzBytes(eventCapResolution) },
    note: 'This analysis transform inserts one global mapping after accepted reference sampling and before physics; no source file is written or imported by production.' },
  mappings: Object.fromEntries(Object.entries(mappings).map(([name, fn]) => [name,
    { atDomainLow: fn(LOW), atCommon: fn(10), atRare: fn(14), atLegendary: fn(20), atDomainHigh: fn(HIGH),
      trialDeltaAt10: fn(10*1.05)-fn(10), trialDeltaAt14: fn(14*1.05)-fn(14), trialDeltaAt20: fn(20*1.05)-fn(20),
      restDeltaAt10To75: fn(10)-fn(7.5), restDeltaAt10To50: fn(10)-fn(5) } ])),
  scan,
};
await writeFile(resolve(import.meta.dirname, 'adapter-analysis-results.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ provenance: out.provenance, mappings: out.mappings,
  summaries: Object.fromEntries(Object.entries(scan).map(([name, d]) => [name, { overall: d.overall, byIdentity: d.byIdentity, sampleSerialization: d.sampleSerialization, pointRows: d.pointRows }])) }, null, 2));
