import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Opus review 01, experiment 02: paired production-effect diagnostics under the affine candidate.
// Loads an in-memory copy of the Plan 13 reference with declared substitutions; never edits the source.
const here = import.meta.dirname;
const repoRoot = resolve(here, '../../../../../..');
const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(sourcePath, 'utf8');
const sourceSha256 = createHash('sha256').update(source).digest('hex');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;

// Copied from experiment 01 (run.mjs load): string-patched in-memory module.
// options.map: rating->topSpeed expression in x; options.playerRow: move the player to this start row (same-lane rival swaps to row 0).
function patch(code, from, to) {
  if (!code.includes(from)) throw new Error(`patch anchor missing: ${from}`);
  return code.replace(from, to);
}

async function load({ map = 'x', playerRow = 0 } = {}) {
  let code = patch(source, "from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
  code = patch(code, 'topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', `topSpeed: ((x) => (${map}))(sampled),`);
  if (playerRow !== 0) {
    const rival = { 1: 'C', 2: 'E' }[playerRow];
    code = patch(code, "{ id: 'P', name: 'Player', lane: 2, row: 0, player: true }", `{ id: 'P', name: 'Player', lane: 2, row: ${playerRow}, player: true }`);
    code = patch(code, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: ${playerRow} }`, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: 0 }`);
  }
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

// --- Design -----------------------------------------------------------------
const AFFINE = '8.25 + 0.5 * x';
const affine = (x) => 8.25 + 0.5 * x;
const MAIN_EXPERIMENT = 'weave-rank-strong-contact';
const NOWEAVE_EXPERIMENT = 'controller-recenter';
const SEEDS = Array.from({ length: 40 }, (_, i) => `opus-r01-paired-${String(i + 1).padStart(2, '0')}`);
const TIERS = [['common', 10], ['rare', 14], ['legendary', 20]];
const RACE_GROUPS = [
  { group: 'R01-rest1', raceId: 'R01', fieldBaseSpeed: 8, rest: 1, label: 'R01 rested', future: false },
  { group: 'R03-rest1', raceId: 'R03', fieldBaseSpeed: 11.2, rest: 1, label: 'R03 rested', future: false },
  { group: 'R03-rest0.5', raceId: 'R03', fieldBaseSpeed: 11.2, rest: 0.5, label: 'R03 after R01 (rest 0.5)', future: false },
  { group: 'R03-rest0.75', raceId: 'R03', fieldBaseSpeed: 11.2, rest: 0.75, label: 'R03 rest 0.75 (future, not reachable in current 2-race slice)', future: true },
];
const STANCES = ['steady', 'sprint'];
const TRIALS = [false, true];
const cellKey = (c) => `${c.tier}|${c.group}|${c.stance}|${c.trial ? 'trial' : 'no-trial'}`;
const ALL_CELLS = [];
for (const g of RACE_GROUPS) {
  for (const [tier, rating] of TIERS) {
    for (const stance of STANCES) {
      for (const trial of TRIALS) ALL_CELLS.push({ ...g, tier, tierRating: rating, stance, trial });
    }
  }
}
const REST1_CELLS = ALL_CELLS.filter((c) => c.rest === 1);

const ARMS = [
  { name: 'affine-row0', cells: ALL_CELLS, slots: [0], experiment: MAIN_EXPERIMENT },
  { name: 'affine-slot-balanced', cells: ALL_CELLS, slots: [0, 1, 2], experiment: MAIN_EXPERIMENT },
  { name: 'affine-row0-noweave', cells: REST1_CELLS, slots: [0], experiment: NOWEAVE_EXPERIMENT },
];

const COMPARISONS = [
  { name: 'trial on vs off', applies: (c) => c.trial, partner: (c) => ({ ...c, trial: false }) },
  { name: 'sprint vs steady', applies: (c) => c.stance === 'sprint', partner: (c) => ({ ...c, stance: 'steady' }) },
  { name: 'rest 0.5 vs 1 (R03)', applies: (c) => c.group === 'R03-rest0.5', partner: (c) => ({ ...c, group: 'R03-rest1' }) },
  { name: 'rest 0.75 vs 1 (future, R03)', applies: (c) => c.group === 'R03-rest0.75', partner: (c) => ({ ...c, group: 'R03-rest1' }) },
  { name: 'rare vs common', applies: (c) => c.tier === 'rare', partner: (c) => ({ ...c, tier: 'common' }) },
  { name: 'legendary vs rare', applies: (c) => c.tier === 'legendary', partner: (c) => ({ ...c, tier: 'rare' }) },
];

// --- Statistics helpers -----------------------------------------------------
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const share = (xs, pred) => (xs.length ? xs.filter(pred).length / xs.length : null);
const maxOf = (xs) => (xs.length ? Math.max(...xs) : null);
const minOf = (xs) => (xs.length ? Math.min(...xs) : null);
function percentile(values, p) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const h = ((s.length - 1) * p) / 100;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return s[lo] + (s[hi] - s[lo]) * (h - lo);
}
const round = (x, d = 4) => (x === null || x === undefined || !Number.isFinite(x) ? x : Number(x.toFixed(d)));

// --- Race execution and per-race metrics -------------------------------------
const modules = {};
for (const row of [0, 1, 2]) modules[row] = await load({ map: AFFINE, playerRow: row });
const DT = modules[0].PHYSICS.dt;

function leaderId(row) {
  let best = null;
  for (const e of row.entrants) {
    if (!best || e.progress > best.progress || (e.progress === best.progress && e.id < best.id)) best = e;
  }
  return best.id;
}

function rankOf(row, id) {
  const ordered = [...row.entrants].sort((a, b) => b.progress - a.progress || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return ordered.findIndex((e) => e.id === id) + 1;
}

function summarizeRace(race, slot) {
  const P = race.entrants.find((e) => e.id === 'P');
  const mapResidual = Math.max(...race.entrants.map((e) => Math.abs(e.topSpeed - affine(e.sampledPerformance))));
  const rec = {
    status: race.status,
    unresolvedReason: race.unresolvedReason,
    finishTimeSeconds: race.finishTimeSeconds,
    slot,
    playerRow: P.row,
    playerSampled: P.sampledPerformance,
    playerTopSpeed: P.topSpeed,
    mapResidual,
    place: null,
    win: false,
    margin: null,
    winningMargin: null,
  };
  if (race.status === 'finished') {
    const pf = race.finish.find((e) => e.id === 'P');
    const rivalMax = Math.max(...race.finish.filter((e) => e.id !== 'P').map((e) => e.progress));
    rec.place = pf.place;
    rec.win = pf.place === 1;
    rec.margin = pf.progress - rivalMax;
    rec.winningMargin = race.finish[0].progress - race.finish[1].progress;
  }
  // Trajectory is read here and not retained: rows with tick*dt >= 3 s, consecutive-row changes.
  const rows = race.trajectory.filter((row) => row.tick * race.dt >= 3 - 1e-9);
  let leadChanges = 0;
  let rankChanges = 0;
  for (let i = 1; i < rows.length; i += 1) {
    if (leaderId(rows[i]) !== leaderId(rows[i - 1])) leadChanges += 1;
    if (rankOf(rows[i], 'P') !== rankOf(rows[i - 1], 'P')) rankChanges += 1;
  }
  rec.leadChangesAfter3s = leadChanges;
  rec.playerPlaceChangesAfter3s = rankChanges;
  return rec;
}

function runRace(cell, seed, slot, experiment) {
  const race = modules[slot].resolveSeededRace({
    seed,
    raceId: cell.raceId,
    playerBaseSpeed: cell.tierRating * cell.rest,
    fieldBaseSpeed: cell.fieldBaseSpeed,
    choice: cell.stance,
    trialCommitted: cell.trial,
    experiment,
  });
  return summarizeRace(race, slot);
}

// Determinism spot check: re-run a sample of races and compare the per-race metrics exactly.
let deterministic = true;
for (const cell of ALL_CELLS.filter((_, i) => i % 8 === 0)) {
  for (const seed of SEEDS.slice(0, 2)) {
    const a = JSON.stringify(runRace(cell, seed, 0, MAIN_EXPERIMENT));
    const b = JSON.stringify(runRace(cell, seed, 0, MAIN_EXPERIMENT));
    if (a !== b) deterministic = false;
  }
}

const armRuns = [];
const timingMs = {};
for (const arm of ARMS) {
  const t0 = performance.now();
  const index = new Map();
  for (const cell of arm.cells) {
    for (const seed of SEEDS) {
      for (const slot of arm.slots) index.set(`${cellKey(cell)}|${seed}|${slot}`, runRace(cell, seed, slot, arm.experiment));
    }
  }
  timingMs[arm.name] = Math.round(performance.now() - t0);
  armRuns.push({ ...arm, index });
}

function itemsOf(arm) {
  const items = [];
  for (const cell of arm.cells) {
    for (const seed of SEEDS) {
      for (const slot of arm.slots) items.push({ cell, seed, slot, rec: arm.index.get(`${cellKey(cell)}|${seed}|${slot}`) });
    }
  }
  return items;
}

// --- Summaries ----------------------------------------------------------------
// Unresolved races are kept in every denominator; their finish times are excluded from finish-time statistics only.
function aggregate(items) {
  const recs = items.map((i) => i.rec);
  const fin = recs.filter((r) => r.status === 'finished');
  const times = fin.map((r) => r.finishTimeSeconds);
  const wins = recs.filter((r) => r.win).length;
  const unresolved = recs.length - fin.length;
  return {
    races: recs.length,
    finished: fin.length,
    unresolved,
    finishMedianS: round(percentile(times, 50)),
    finishP95S: round(percentile(times, 95)),
    finishMaxS: round(maxOf(times)),
    shareFinishOver23sOfFinished: round(share(times, (t) => t > 23)),
    shareOver23sOrUnresolvedOfAll: round((times.filter((t) => t > 23).length + unresolved) / recs.length),
    wins,
    winRate: round(wins / recs.length),
    meanPlace: round(mean(fin.map((r) => r.place)), 3),
    meanLeadChangesAfter3s: round(mean(recs.map((r) => r.leadChangesAfter3s)), 3),
    shareWithLeadChangeAfter3s: round(share(recs, (r) => r.leadChangesAfter3s >= 1)),
    meanPlayerPlaceChangesAfter3s: round(mean(recs.map((r) => r.playerPlaceChangesAfter3s)), 3),
    meanWinningMargin: round(mean(fin.map((r) => r.winningMargin)), 3),
  };
}

function summarizeArm(arm) {
  const items = itemsOf(arm);
  const groups = RACE_GROUPS.filter((g) => arm.cells.some((c) => c.group === g.group));
  const byGroup = {};
  const byTierGroup = {};
  for (const g of groups) {
    byGroup[g.group] = aggregate(items.filter((i) => i.cell.group === g.group));
    for (const [tier] of TIERS) {
      byTierGroup[`${tier}|${g.group}`] = aggregate(items.filter((i) => i.cell.group === g.group && i.cell.tier === tier));
    }
  }
  const byCell = {};
  for (const cell of arm.cells) {
    byCell[cellKey(cell)] = aggregate(items.filter((i) => cellKey(i.cell) === cellKey(cell)));
  }
  const recs = items.map((i) => i.rec);
  const reasons = {};
  for (const r of recs) if (r.status !== 'finished') reasons[r.unresolvedReason] = (reasons[r.unresolvedReason] ?? 0) + 1;
  const verification = {
    races: recs.length,
    maxMapResidual: round(maxOf(recs.map((r) => r.mapResidual)), 6),
    playerRowMatchesSlot: items.every((i) => i.rec.playerRow === i.slot),
    playerTopSpeedMin: round(minOf(recs.map((r) => r.playerTopSpeed))),
    playerTopSpeedMax: round(maxOf(recs.map((r) => r.playerTopSpeed))),
    unresolvedReasons: reasons,
  };
  return { overall: aggregate(items), byGroup, byTierGroup, byCell, verification };
}

// --- Paired comparisons --------------------------------------------------------
function pairsFor(arm, comp) {
  const pairs = [];
  for (const x of arm.cells.filter(comp.applies)) {
    const yCell = comp.partner(x);
    const yKey = cellKey(yCell);
    for (const seed of SEEDS) {
      for (const slot of arm.slots) {
        const rx = arm.index.get(`${cellKey(x)}|${seed}|${slot}`);
        const ry = arm.index.get(`${yKey}|${seed}|${slot}`);
        if (!rx || !ry) continue;
        pairs.push({
          tierLabel: x.tier === yCell.tier ? x.tier : `${x.tier} vs ${yCell.tier}`,
          group: x.group,
          x: rx,
          y: ry,
        });
      }
    }
  }
  return pairs;
}

function pairStats(pairs) {
  const n = pairs.length;
  const fin = pairs.filter((p) => p.x.status === 'finished' && p.y.status === 'finished');
  const dPlace = fin.map((p) => p.x.place - p.y.place);
  const dMargin = fin.map((p) => p.x.margin - p.y.margin);
  const winX = share(pairs, (p) => p.x.win);
  const winY = share(pairs, (p) => p.y.win);
  return {
    pairs: n,
    finishedPairs: fin.length,
    unresolvedPairs: n - fin.length,
    meanDeltaPlace: round(mean(dPlace), 4),
    improvedShare: round(share(dPlace, (d) => d < 0)),
    unchangedShare: round(share(dPlace, (d) => d === 0)),
    worsenedShare: round(share(dPlace, (d) => d > 0)),
    winRateX: round(winX),
    winRateY: round(winY),
    winRateChangePp: winX === null ? null : round((winX - winY) * 100, 2),
    meanDeltaMargin: round(mean(dMargin)),
    deltaMarginP10: round(percentile(dMargin, 10)),
    deltaMarginP50: round(percentile(dMargin, 50)),
    deltaMarginP90: round(percentile(dMargin, 90)),
  };
}

function summarizeComparison(pairs) {
  const groups = [...new Set(pairs.map((p) => p.group))];
  const tiers = [...new Set(pairs.map((p) => p.tierLabel))];
  const byGroup = {};
  const byTier = {};
  for (const g of groups) byGroup[g] = pairStats(pairs.filter((p) => p.group === g));
  for (const t of tiers) byTier[t] = pairStats(pairs.filter((p) => p.tierLabel === t));
  return { all: pairStats(pairs), byGroup, byTier };
}

// --- Assemble and write -------------------------------------------------------
const armSummaries = {};
for (const arm of armRuns) armSummaries[arm.name] = summarizeArm(arm);

const comparisons = {};
for (const comp of COMPARISONS) {
  comparisons[comp.name] = {};
  for (const arm of armRuns) comparisons[comp.name][arm.name] = summarizeComparison(pairsFor(arm, comp));
}

const results = {
  provenance: {
    referenceSourcePath: 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs',
    referenceSha256: sourceSha256,
    rulesVersion: modules[0].PHYSICS.version,
    dt: DT,
    substitutions: [
      'PRNG import URL (repo src/core/prng.mjs as absolute file URL)',
      'sampled top-speed clamp replaced by affine map 8.25 + 0.5 * x (candidate; no other constant changed)',
      'slot-balanced arm only: player start row swapped with same-lane rival (row 1 = C, row 2 = E)',
    ],
    tieBreaks: 'leader and player rank ties: higher progress, then id ascending (A < B < ... < P)',
    sampling: 'trajectory rows with tick*dt >= 3 s; duplicated terminal rows are included as in the reference output',
    notes: 'Player rating input = tier rating x rest factor; trial and stance are applied inside the module.',
  },
  design: {
    seeds: { count: SEEDS.length, first: SEEDS[0], last: SEEDS.at(-1) },
    tiers: TIERS.map(([name, rating]) => ({ name, rating })),
    raceGroups: RACE_GROUPS,
    arms: ARMS.map((a) => ({ name: a.name, experiment: a.experiment, slots: a.slots, cells: a.cells.length, groups: [...new Set(a.cells.map((c) => c.group))] })),
    cellsPerArm: Object.fromEntries(ARMS.map((a) => [a.name, a.cells.length])),
    comparisons: COMPARISONS.map((c) => c.name),
  },
  determinismSpotCheckPassed: deterministic,
  arms: armSummaries,
  comparisons,
};

await writeFile(resolve(here, 'results.json'), JSON.stringify(results, null, 2) + '\n');

// --- Compact console summary ----------------------------------------------------
console.log(`reference sha256 ${sourceSha256}`);
console.log(`determinism spot check: ${deterministic ? 'ok' : 'MISMATCH'}`);
console.log('\nARMS');
for (const arm of armRuns) {
  const o = armSummaries[arm.name].overall;
  console.log(`${arm.name}: races ${o.races}, unresolved ${o.unresolved}, finish median ${o.finishMedianS} p95 ${o.finishP95S} max ${o.finishMaxS}, share>23s ${o.shareFinishOver23sOfFinished}, win ${o.winRate}, meanPlace ${o.meanPlace}, leadChanges(>=3s) mean ${o.meanLeadChangesAfter3s} share>=1 ${o.shareWithLeadChangeAfter3s}, meanWinMargin ${o.meanWinningMargin}, ms ${timingMs[arm.name]}`);
}
console.log('\nCOMPARISONS (all pairs; delta = X minus Y; negative place delta = X better)');
for (const comp of COMPARISONS) {
  for (const arm of armRuns) {
    const s = comparisons[comp.name][arm.name].all;
    if (!s.pairs) {
      console.log(`${comp.name} | ${arm.name}: no applicable cells in arm`);
      continue;
    }
    console.log(`${comp.name} | ${arm.name}: pairs ${s.pairs} (unresolved ${s.unresolvedPairs}), meanDPlace ${s.meanDeltaPlace}, improved ${s.improvedShare}, unchanged ${s.unchangedShare}, worsened ${s.worsenedShare}, win X ${s.winRateX} Y ${s.winRateY} (chg ${s.winRateChangePp} pp), meanDMargin ${s.meanDeltaMargin} [p10 ${s.deltaMarginP10}, p50 ${s.deltaMarginP50}, p90 ${s.deltaMarginP90}]`);
  }
}
console.log(`\nwrote ${resolve(here, 'results.json')}`);
