import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Opus review 01, experiment 03: pace-scaling candidate (alternative mechanic).
// Pre-registered calibration of P25 then P15 on the 72-cell matrix; validation only for the first candidate that passes the rule.
// Loads in-memory copies of the Plan 13 reference with declared substitutions; never edits the source.
const STARTED = Date.now();
const here = import.meta.dirname;
const repoRoot = resolve(here, '../../../../../..');
const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const rawSource = await readFile(sourcePath, 'utf8');
const sourceSha256 = createHash('sha256').update(rawSource).digest('hex');
const crlfLineCount = rawSource.split('\r\n').length - 1;
const lfLineCount = rawSource.split('\n').length - 1 - crlfLineCount;
// The in-memory copy normalizes CRLF to LF so the declared anchor 'speed: 6,\n' matches. The reference file has no CRLF
// line breaks, so this is a no-op; the verification section records the measured counts and the no-op flag.
const source = rawSource.replace(/\r\n/g, '\n');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;
const CMD = 'node reports/development/plan-23-production-race-integration/opus-review-01/experiments/03-pace-scaling-candidate/run.mjs';

// --- Pre-registered design -----------------------------------------------------------
const MAIN_EXPERIMENT = 'weave-rank-strong-contact';
const ENVELOPE_EXPERIMENT = 'controller-recenter';
const HIGHLIGHT_S = 2;
const RULE = { medianMinS: 17, medianMaxS: 23, lateShareMax: 0.025 };
const CANDIDATES = [
  { name: 'P25', alpha: 0.25, r0: 9.46 },
  { name: 'P15', alpha: 0.15, r0: 10.57 },
];
const ENVELOPE = { seed: 'opus-envelope', raceId: 'ENV', fieldBaseSpeed: 0.5, ratings: [5, 8, 10, 14, 20, 27.7] };
const seedList = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
const CAL_SEEDS = seedList('opus-r01-pace-cal-', 12);
const VAL_SEEDS = seedList('opus-r01-pace-val-', 30);

const TIERS = [['common', 10], ['rare', 14], ['legendary', 20]];
const TIER_NAMES = TIERS.map(([name]) => name);
const GROUPS = [
  { group: 'R01-rest1', raceId: 'R01', fieldBaseSpeed: 8, rest: 1, kind: 'production', label: 'R01 rested' },
  { group: 'R03-rest1', raceId: 'R03', fieldBaseSpeed: 11.2, rest: 1, kind: 'production', label: 'R03 rested' },
  { group: 'R03-rest0.5', raceId: 'R03', fieldBaseSpeed: 11.2, rest: 0.5, kind: 'production', label: 'R03 after R01 (rest 0.5)' },
  { group: 'R03-rest0.75', raceId: 'R03', fieldBaseSpeed: 11.2, rest: 0.75, kind: 'future', label: 'R03 rest 0.75 (future, not reachable in the current 2-race slice)' },
  { group: 'R01-rest0.75', raceId: 'R01', fieldBaseSpeed: 8, rest: 0.75, kind: 'matrix-only', label: 'R01 rest 0.75 (matrix only)' },
  { group: 'R01-rest0.5', raceId: 'R01', fieldBaseSpeed: 8, rest: 0.5, kind: 'matrix-only', label: 'R01 rest 0.5 (matrix only)' },
];
const GROUP_ORDER = GROUPS.map((g) => g.group);
const STANCES = ['steady', 'sprint'];
const TRIALS = [false, true];
const keyOf = ({ tier, group, stance, trial }) => `${tier}|${group}|${stance}|${trial ? 'trial' : 'no-trial'}`;
const MATRIX = [];
for (const g of GROUPS) for (const [tier, tierRating] of TIERS) for (const stance of STANCES) for (const trial of TRIALS) {
  const cell = { ...g, tier, tierRating, stance, trial };
  cell.key = keyOf(cell);
  MATRIX.push(cell);
}
const isProd = (c) => c.kind === 'production';
const isFuture = (c) => c.kind === 'future';
const PROD = MATRIX.filter((c) => isProd(c));
const FUT = MATRIX.filter((c) => isFuture(c));
const PROD_FUT = MATRIX.filter((c) => isProd(c) || isFuture(c));
const SPRINT_PROD = PROD.filter((c) => c.stance === 'sprint');
const PROD_GROUPS = GROUPS.filter((g) => g.kind === 'production').map((g) => g.group);
const FUT_GROUPS = GROUPS.filter((g) => g.kind === 'future').map((g) => g.group);

const COMPARISONS = [
  { name: 'trial on vs off', scope: isProd, applies: (c) => c.trial, partner: (c) => ({ ...c, trial: false }) },
  { name: 'sprint vs steady', scope: isProd, applies: (c) => c.stance === 'sprint', partner: (c) => ({ ...c, stance: 'steady' }) },
  { name: 'rest 0.5 vs 1 (R03)', scope: isProd, applies: (c) => c.group === 'R03-rest0.5', partner: (c) => ({ ...c, group: 'R03-rest1' }) },
  { name: 'rest 0.75 vs 1 (future, R03)', scope: isFuture, applies: (c) => c.group === 'R03-rest0.75', partner: (c) => ({ ...c, group: 'R03-rest1' }) },
  { name: 'rare vs common', scope: isProd, applies: (c) => c.tier === 'rare', partner: (c) => ({ ...c, tier: 'common' }) },
  { name: 'legendary vs rare', scope: isProd, applies: (c) => c.tier === 'legendary', partner: (c) => ({ ...c, tier: 'rare' }) },
];
const MODES = [
  { id: 'row0', label: 'row 0', rows: [0] },
  { id: 'slot', label: 'slot-balanced rows 0-2', rows: [0, 1, 2] },
];
const CAL_SUBSETS = [
  { id: 'matrix-row0', label: 'matrix, 72 cells, row 0', filter: () => true },
  { id: 'production-row0', label: 'production, 36 cells, row 0', filter: (i) => isProd(i.cell) },
  { id: 'future-row0', label: 'future R03 rest 0.75, 12 cells, row 0', filter: (i) => isFuture(i.cell) },
];
const VAL_SUBSETS = [
  { id: 'matrix-row0', label: 'matrix, 72 cells, row 0', filter: (i) => i.row === 0 },
  { id: 'production-row0', label: 'production, 36 cells, row 0', filter: (i) => i.row === 0 && isProd(i.cell) },
  { id: 'production-slot', label: 'production, 36 cells, slot-balanced rows 0-2', filter: (i) => isProd(i.cell) },
  { id: 'future-row0', label: 'future R03 rest 0.75, 12 cells, row 0', filter: (i) => i.row === 0 && isFuture(i.cell) },
  { id: 'future-slot', label: 'future R03 rest 0.75, 12 cells, slot-balanced rows 0-2', filter: (i) => isFuture(i.cell) },
];
const NEUTRAL_SUBSETS = [
  { id: 'sprint-prod-row0', label: 'sprint, production, 18 cells, row 0', filter: (i) => i.row === 0 },
  { id: 'sprint-prod-slot', label: 'sprint, production, 18 cells, slot-balanced rows 0-2', filter: () => true },
];

// --- Substitutions (declared anchors; every anchor must be found) -------------------
const IMPORT_ANCHOR = "from '../../../src/core/prng.mjs'";
const TOP_ANCHOR = 'topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),';
const AFFINE_PAIRS = [[TOP_ANCHOR, 'topSpeed: ((x) => (8.25 + 0.5 * x))(sampled),']];
const SPRINT_NEUTRAL_PAIRS = [['base * 1.1 * (1 + (2 * draw - 1) * 0.2)', 'base * 1.0 * (1 + (2 * draw - 1) * 0.2)']];
function paceSubstitutions({ alpha, r0 }, eol = '\n') {
  const pace = `Math.pow(sampled / ${r0}, ${alpha})`;
  return [
    [TOP_ANCHOR, `pace: ${pace}, topSpeed: 14 * ${pace},`],
    [`speed: 6,${eol}`, `speed: 6 * ${pace},${eol}`],
    ['const targetCornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));', 'const targetCornerSpeed = e.pace * curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));'],
    ['/ (2 * PHYSICS.braking));', '/ (2 * PHYSICS.braking * e.pace * e.pace));'],
    ['e.acceleration = PHYSICS.baseAcceleration;', 'e.acceleration = PHYSICS.baseAcceleration * e.pace * e.pace;'],
    ['e.speed - PHYSICS.braking * PHYSICS.dt)', 'e.speed - PHYSICS.braking * e.pace * e.pace * PHYSICS.dt)'],
    ['turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt', 'e.pace * turnCap(e.speed / e.pace) * Math.PI / 180 * PHYSICS.dt'],
  ];
}
function affineArm() {
  return { name: 'affine', pairs: AFFINE_PAIRS, expectedTop: (s) => 8.25 + 0.5 * s, pace: null };
}
function paceArm(cand, name = `pace-${cand.name}`, extra = []) {
  const pace = (s) => Math.pow(s / cand.r0, cand.alpha);
  return { name, pairs: [...paceSubstitutions(cand), ...extra], expectedTop: (s) => 14 * pace(s), pace };
}

// --- Statistics helpers (definitions copied from experiment 02) ---------------------
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
const round = (x, d = 4) => (x === null || x === undefined || !Number.isFinite(x) ? null : Number(x.toFixed(d)));

// --- Module loading -----------------------------------------------------------------
let CAPS = null;
let RULES_VERSION = null;
const moduleCache = new Map();
const ARMS_USED = [];
const dataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const importCode = (code) => import(dataUrl(code));

function substitute(code, pairs) {
  let out = code;
  const counts = [];
  for (const [from, to] of pairs) {
    const occurrences = out.split(from).length - 1;
    if (occurrences === 0) throw new Error(`patch anchor missing: ${JSON.stringify(from)}`);
    out = out.split(from).join(to);
    counts.push({ anchor: from, occurrences });
  }
  return { code: out, counts };
}

async function loadArm(arm, row) {
  const first = substitute(source, [[IMPORT_ANCHOR, `from '${prngUrl}'`], ...arm.pairs]);
  let code = first.code;
  if (row !== 0) {
    const rival = { 1: 'C', 2: 'E' }[row];
    code = substitute(code, [
      ["{ id: 'P', name: 'Player', lane: 2, row: 0, player: true }", `{ id: 'P', name: 'Player', lane: 2, row: ${row}, player: true }`],
      [`{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: ${row} }`, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: 0 }`],
    ]).code;
  }
  const mod = await importCode(code);
  if (!CAPS) CAPS = { events: mod.PHYSICS.maxMechanicalEvents, opportunities: mod.PHYSICS.maxOpportunityDiagnostics };
  if (!RULES_VERSION) RULES_VERSION = mod.PHYSICS.version;
  return { mod, counts: first.counts };
}

async function moduleFor(arm, row) {
  const key = `${arm.name}|${row}`;
  if (!moduleCache.has(key)) moduleCache.set(key, await loadArm(arm, row));
  return moduleCache.get(key);
}

// --- Race execution and per-race metrics (definitions copied from experiment 02) -----
function leaderId(snapshot) {
  let best = null;
  for (const e of snapshot.entrants) {
    if (!best || e.progress > best.progress || (e.progress === best.progress && e.id < best.id)) best = e;
  }
  return best.id;
}

function rankOf(snapshot, id) {
  const ordered = [...snapshot.entrants].sort((a, b) => b.progress - a.progress || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return ordered.findIndex((e) => e.id === id) + 1;
}

function summarizeRace(race, arm) {
  const P = race.entrants.find((e) => e.id === 'P');
  const mapResidual = Math.max(...race.entrants.map((e) => Math.abs(e.topSpeed - arm.expectedTop(e.sampledPerformance))));
  const finished = race.status === 'finished';
  const rec = {
    status: race.status,
    unresolvedReason: race.unresolvedReason,
    finishTimeSeconds: race.finishTimeSeconds,
    playbackPlus2Seconds: finished ? race.horizonSeconds + HIGHLIGHT_S : null,
    playerRow: P.row,
    playerSampled: P.sampledPerformance,
    playerTopSpeed: P.topSpeed,
    playerPace: arm.pace ? arm.pace(P.sampledPerformance) : null,
    mapResidual,
    eventCount: race.eventRecords.length,
    opportunityCount: race.opportunityRecords.length,
    place: null,
    win: false,
    margin: null,
    winningMargin: null,
  };
  if (finished) {
    const pf = race.finish.find((e) => e.id === 'P');
    const rivalMax = Math.max(...race.finish.filter((e) => e.id !== 'P').map((e) => e.progress));
    rec.place = pf.place;
    rec.win = pf.place === 1;
    rec.margin = pf.progress - rivalMax;
    rec.winningMargin = race.finish[0].progress - race.finish[1].progress;
  }
  // Trajectory rows with tick*dt >= 3 s, consecutive-row changes (duplicated terminal rows included, as in experiment 02).
  const after3s = race.trajectory.filter((row) => row.tick * race.dt >= 3 - 1e-9);
  let leadChanges = 0;
  let rankChanges = 0;
  for (let i = 1; i < after3s.length; i += 1) {
    if (leaderId(after3s[i]) !== leaderId(after3s[i - 1])) leadChanges += 1;
    if (rankOf(after3s[i], 'P') !== rankOf(after3s[i - 1], 'P')) rankChanges += 1;
  }
  rec.leadChangesAfter3s = leadChanges;
  rec.playerPlaceChangesAfter3s = rankChanges;
  return rec;
}

const raceInput = (cell, seed) => ({
  seed,
  raceId: cell.raceId,
  playerBaseSpeed: cell.tierRating * cell.rest,
  fieldBaseSpeed: cell.fieldBaseSpeed,
  choice: cell.stance,
  trialCommitted: cell.trial,
  experiment: MAIN_EXPERIMENT,
});

async function runPlan(arm, plan, seeds) {
  if (!ARMS_USED.some((a) => a.name === arm.name)) {
    const first = await moduleFor(arm, 0);
    arm.counts = first.counts;
    ARMS_USED.push(arm);
  }
  const items = [];
  for (const { row, cells } of plan) {
    const { mod } = await moduleFor(arm, row);
    for (const cell of cells) {
      for (const seed of seeds) {
        const race = mod.resolveSeededRace(raceInput(cell, seed));
        items.push({ cell, seed, row, rec: summarizeRace(race, arm) });
      }
    }
  }
  return items;
}

// --- Summaries ----------------------------------------------------------------------
function reasonCounts(recs) {
  const reasons = {};
  for (const r of recs) if (r.status !== 'finished') reasons[r.unresolvedReason] = (reasons[r.unresolvedReason] ?? 0) + 1;
  return reasons;
}

// Unresolved races are kept in every denominator; their finish times are excluded from finish-time statistics only.
function summarizeItems(items) {
  const recs = items.map((i) => i.rec);
  const fin = recs.filter((r) => r.status === 'finished');
  const times = fin.map((r) => r.finishTimeSeconds);
  const playback = fin.map((r) => r.playbackPlus2Seconds);
  const unresolved = recs.length - fin.length;
  const late = times.filter((t) => t > 23).length;
  const early = times.filter((t) => t < 17).length;
  const wins = recs.filter((r) => r.win).length;
  return {
    races: recs.length,
    finished: fin.length,
    unresolved,
    unresolvedReasons: reasonCounts(recs),
    finishMedianS: round(percentile(times, 50)),
    finishP5S: round(percentile(times, 5)),
    finishP95S: round(percentile(times, 95)),
    finishMaxS: round(maxOf(times)),
    shareUnder17OfAll: round(recs.length ? early / recs.length : null),
    shareOver23OfFinished: round(fin.length ? late / fin.length : null),
    shareOver23OrUnresolvedOfAll: round(recs.length ? (late + unresolved) / recs.length : null),
    playbackPlus2MedianS: round(percentile(playback, 50)),
    playbackPlus2MaxS: round(maxOf(playback)),
    maxEventCount: maxOf(recs.map((r) => r.eventCount)),
    maxOpportunityCount: maxOf(recs.map((r) => r.opportunityCount)),
    wins,
    winRate: round(recs.length ? wins / recs.length : null),
    meanPlace: round(mean(fin.map((r) => r.place)), 3),
    meanLeadChangesAfter3s: round(mean(recs.map((r) => r.leadChangesAfter3s)), 3),
    shareWithLeadChangeAfter3s: round(share(recs, (r) => r.leadChangesAfter3s >= 1)),
    meanPlayerPlaceChangesAfter3s: round(mean(recs.map((r) => r.playerPlaceChangesAfter3s)), 3),
    meanWinningMargin: round(mean(fin.map((r) => r.winningMargin)), 3),
  };
}

function subsetSummaries(items, subsets) {
  const out = {};
  for (const s of subsets) out[s.id] = { label: s.label, ...summarizeItems(items.filter(s.filter)) };
  return out;
}

function groupTierTable(items, rows) {
  const out = {};
  for (const g of [...PROD_GROUPS, ...FUT_GROUPS]) {
    for (const [tier] of TIERS) {
      out[`${g}|${tier}`] = summarizeItems(items.filter((i) => rows.includes(i.row) && i.cell.group === g && i.cell.tier === tier));
    }
  }
  return out;
}

function calibrationRule(items) {
  const recs = items.map((i) => i.rec);
  const times = recs.filter((r) => r.status === 'finished').map((r) => r.finishTimeSeconds);
  const unresolved = recs.length - times.length;
  const median = percentile(times, 50);
  const lateShare = times.length ? times.filter((t) => t > 23).length / times.length : null;
  const medianOk = median !== null && median >= RULE.medianMinS && median <= RULE.medianMaxS;
  const lateOk = lateShare !== null && lateShare <= RULE.lateShareMax;
  const unresolvedOk = unresolved === 0;
  return {
    medianFinishS: round(median),
    medianInRange: medianOk,
    shareOver23OfFinished: round(lateShare),
    shareOver23AtMost2_5pct: lateOk,
    unresolved,
    unresolvedZero: unresolvedOk,
    pass: medianOk && lateOk && unresolvedOk,
  };
}

function armCheck(items, arm) {
  const recs = items.map((i) => i.rec);
  const paceVals = recs.map((r) => r.playerPace).filter((v) => v !== null);
  return {
    races: recs.length,
    substitutionCounts: arm.counts,
    maxMapResidual: round(maxOf(recs.map((r) => r.mapResidual)), 6),
    playerRowMatchesSlot: items.every((i) => i.rec.playerRow === i.row),
    playerTopSpeedMin: round(minOf(recs.map((r) => r.playerTopSpeed))),
    playerTopSpeedMax: round(maxOf(recs.map((r) => r.playerTopSpeed))),
    playerPaceMin: paceVals.length ? round(minOf(paceVals)) : null,
    playerPaceMax: paceVals.length ? round(maxOf(paceVals)) : null,
    unresolvedReasons: reasonCounts(recs),
    maxEventCount: maxOf(recs.map((r) => r.eventCount)),
    maxOpportunityCount: maxOf(recs.map((r) => r.opportunityCount)),
  };
}

// --- Paired comparisons (definitions copied from experiment 02) ------------------------
function indexItems(items) {
  return new Map(items.map((i) => [`${i.cell.key}|${i.seed}|${i.row}`, i]));
}

function buildPairs(xItems, yIndex, partner) {
  const pairs = [];
  let missing = 0;
  for (const x of xItems) {
    const y = yIndex.get(`${keyOf(partner(x.cell))}|${x.seed}|${x.row}`);
    if (!y) {
      missing += 1;
      continue;
    }
    pairs.push({
      tierLabel: x.cell.tier === y.cell.tier ? x.cell.tier : `${x.cell.tier} vs ${y.cell.tier}`,
      group: x.cell.group,
      x: x.rec,
      y: y.rec,
    });
  }
  return { pairs, missing };
}

function pairStats(pairs) {
  const fin = pairs.filter((p) => p.x.status === 'finished' && p.y.status === 'finished');
  const dPlace = fin.map((p) => p.x.place - p.y.place);
  const dMargin = fin.map((p) => p.x.margin - p.y.margin);
  const winX = share(pairs, (p) => p.x.win);
  const winY = share(pairs, (p) => p.y.win);
  return {
    pairs: pairs.length,
    finishedPairs: fin.length,
    unresolvedPairs: pairs.length - fin.length,
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

function comparisonSummary(pairs) {
  const groups = GROUP_ORDER.filter((g) => pairs.some((p) => p.group === g));
  const tiers = [...new Set(pairs.map((p) => p.tierLabel))];
  const byGroup = {};
  const byTier = {};
  const byTierGroup = {};
  for (const g of groups) byGroup[g] = pairStats(pairs.filter((p) => p.group === g));
  for (const t of tiers) byTier[t] = pairStats(pairs.filter((p) => p.tierLabel === t));
  for (const g of groups) {
    for (const t of TIER_NAMES) {
      const sel = pairs.filter((p) => p.group === g && p.tierLabel === t);
      if (sel.length) byTierGroup[`${t}|${g}`] = pairStats(sel);
    }
  }
  return { all: pairStats(pairs), byGroup, byTier, byTierGroup };
}

function comparisonsFor(items, index, rows) {
  const comparisons = {};
  const missingPartners = {};
  for (const comp of COMPARISONS) {
    const xs = items.filter((i) => rows.includes(i.row) && comp.scope(i.cell) && comp.applies(i.cell));
    const built = buildPairs(xs, index, comp.partner);
    comparisons[comp.name] = comparisonSummary(built.pairs);
    missingPartners[comp.name] = built.missing;
  }
  return { comparisons, missingPartners };
}

function armBlock(items, arm) {
  const index = indexItems(items);
  const block = {
    name: arm.name,
    checks: armCheck(items, arm),
    subsets: subsetSummaries(items, VAL_SUBSETS),
    groupTier: {},
    comparisons: {},
    missingPartners: {},
  };
  for (const m of MODES) {
    block.groupTier[m.id] = groupTierTable(items, m.rows);
    const c = comparisonsFor(items, index, m.rows);
    block.comparisons[m.id] = c.comparisons;
    block.missingPartners[m.id] = c.missingPartners;
  }
  return block;
}

function neutralBlock(neutralItems, paceItems) {
  const paceIndex = indexItems(paceItems);
  const block = { subsets: subsetSummaries(neutralItems, NEUTRAL_SUBSETS), modes: {} };
  for (const m of MODES) {
    const nX = neutralItems.filter((i) => m.rows.includes(i.row));
    const built = buildPairs(nX, paceIndex, (c) => ({ ...c, stance: 'steady' }));
    const winTable = {};
    for (const g of PROD_GROUPS) {
      for (const tier of TIER_NAMES) {
        const sel = (items, stance) => items.filter((i) => m.rows.includes(i.row) && i.cell.group === g && i.cell.tier === tier && (stance === null || i.cell.stance === stance));
        winTable[`${g}|${tier}`] = {
          neutralSprint: summarizeItems(sel(neutralItems, null)),
          paceSteady: summarizeItems(sel(paceItems, 'steady')),
          paceSprint: summarizeItems(sel(paceItems, 'sprint')),
        };
      }
    }
    block.modes[m.id] = { missingPartners: built.missing, paired: comparisonSummary(built.pairs), winTable };
  }
  return block;
}

// --- Determinism, line-ending equivalence, and envelope ---------------------------------
async function determinismCheck(arm) {
  const { mod } = await moduleFor(arm, 0);
  let races = 0;
  let identical = true;
  for (const cell of MATRIX.filter((_, i) => i % 8 === 0)) {
    for (const seed of VAL_SEEDS.slice(0, 2)) {
      const input = raceInput(cell, seed);
      const a = JSON.stringify(summarizeRace(mod.resolveSeededRace(input), arm));
      const b = JSON.stringify(summarizeRace(mod.resolveSeededRace(input), arm));
      races += 1;
      if (a !== b) identical = false;
    }
  }
  return { arm: arm.name, races, identical };
}

async function envelopeCheck(cand) {
  const arm = paceArm(cand, `pace-${cand.name}`);
  const { mod } = await moduleFor(arm, 0);
  return ENVELOPE.ratings.map((rating) => {
    const race = mod.resolveSeededRace({
      seed: ENVELOPE.seed,
      raceId: ENVELOPE.raceId,
      playerBaseSpeed: rating,
      fieldBaseSpeed: ENVELOPE.fieldBaseSpeed,
      choice: 'steady',
      trialCommitted: false,
      experiment: ENVELOPE_EXPERIMENT,
    });
    const P = race.entrants.find((e) => e.id === 'P');
    const k = arm.pace(P.sampledPerformance);
    const finish = race.finishTimeSeconds;
    return {
      rating,
      status: race.status,
      playerSampled: round(P.sampledPerformance, 4),
      k: round(k, 4),
      finishTimeSeconds: round(finish, 4),
      finishTimesK: finish === null ? null : round(finish * k, 4),
      winner: race.winner,
      playerPlace: race.finish.find((e) => e.id === 'P')?.place ?? null,
    };
  });
}

// --- Phase 1: calibration ------------------------------------------------------------
const phaseS = {};
let t0 = Date.now();
const calibration = {};
for (const cand of CANDIDATES) {
  const arm = paceArm(cand, `cal-${cand.name}`);
  const items = await runPlan(arm, [{ row: 0, cells: MATRIX }], CAL_SEEDS);
  calibration[cand.name] = {
    arm: arm.name,
    pairs: arm.pairs,
    checks: armCheck(items, arm),
    subsets: subsetSummaries(items, CAL_SUBSETS),
    rule: calibrationRule(items),
  };
}
phaseS.calibration = Math.round((Date.now() - t0) / 1000);
const selected = CANDIDATES.find((c) => calibration[c.name].rule.pass) ?? null;

// --- Phase 2: validation (only for the selected candidate) ----------------------------
let validation = null;
let envelope = null;
let determinism = null;
t0 = Date.now();
if (selected) {
  const aff = affineArm();
  const pace = paceArm(selected);
  const neutral = paceArm(selected, `pace-${selected.name}-sprint-neutral`, SPRINT_NEUTRAL_PAIRS);
  const FULL_PLAN = [{ row: 0, cells: MATRIX }, { row: 1, cells: PROD_FUT }, { row: 2, cells: PROD_FUT }];
  const SPRINT_PLAN = [0, 1, 2].map((row) => ({ row, cells: SPRINT_PROD }));
  const itemsAff = await runPlan(aff, FULL_PLAN, VAL_SEEDS);
  const itemsPace = await runPlan(pace, FULL_PLAN, VAL_SEEDS);
  const itemsNeutral = await runPlan(neutral, SPRINT_PLAN, VAL_SEEDS);
  validation = {
    candidate: selected.name,
    seeds: VAL_SEEDS.length,
    plan: 'affine and pace: 72 matrix cells at row 0 plus 48 production+future cells at rows 1 and 2; neutral: 18 production sprint cells at rows 0-2',
    arms: {
      affine: armBlock(itemsAff, aff),
      [pace.name]: armBlock(itemsPace, pace),
    },
    sprintNeutral: { name: neutral.name, checks: armCheck(itemsNeutral, neutral), ...neutralBlock(itemsNeutral, itemsPace) },
  };
  determinism = [await determinismCheck(aff), await determinismCheck(pace)];
  envelope = await envelopeCheck(selected);
}
phaseS.validation = Math.round((Date.now() - t0) / 1000);

const sumNested = (o) => Object.values(o).reduce((a, v) => a + (typeof v === 'number' ? v : sumNested(v)), 0);
const missingPartnersTotal = validation
  ? sumNested(validation.arms.affine.missingPartners)
    + sumNested(validation.arms[`pace-${selected.name}`].missingPartners)
    + sumNested(Object.fromEntries(MODES.map((m) => [m.id, validation.sprintNeutral.modes[m.id].missingPartners])))
  : 0;

const verification = {
  referenceSha256: sourceSha256,
  crlfLinesNormalized: crlfLineCount,
  rulesVersion: RULES_VERSION,
  guardCaps: CAPS,
  guardCapsNote: 'maxMechanicalEvents and maxOpportunityDiagnostics read from the loaded reference module',
  determinism,
  lineEndings: { crlfLineBreaks: crlfLineCount, lfLineBreaks: lfLineCount, normalizationIsNoOp: source === rawSource },
  missingPartnersTotal,
};

const elapsedS = Math.round((Date.now() - STARTED) / 1000);
const results = {
  provenance: {
    referenceSourcePath: 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs',
    referenceSha256: sourceSha256,
    rulesVersion: RULES_VERSION,
    experiment: MAIN_EXPERIMENT,
    envelopeExperiment: ENVELOPE_EXPERIMENT,
    highlightSecondsForPlayback: HIGHLIGHT_S,
    tieBreaks: 'leader and player rank ties: higher progress, then id ascending (A < B < ... < P)',
    sampling: 'trajectory rows with tick*dt >= 3 s; duplicated terminal rows included as in the reference output',
  },
  design: {
    calibrationSeeds: { count: CAL_SEEDS.length, first: CAL_SEEDS[0], last: CAL_SEEDS.at(-1) },
    validationSeeds: { count: VAL_SEEDS.length, first: VAL_SEEDS[0], last: VAL_SEEDS.at(-1) },
    tiers: TIERS.map(([name, rating]) => ({ name, rating })),
    groups: GROUPS,
    matrixCells: MATRIX.length,
    productionCells: PROD.length,
    futureCells: FUT.length,
    comparisons: COMPARISONS.map((c) => c.name),
    rule: RULE,
    candidates: CANDIDATES,
  },
  calibration: { candidates: calibration, selected: selected ? selected.name : null, outcome: selected ? `selected ${selected.name}` : 'no candidate passed' },
  validation,
  envelope: selected ? { candidate: selected.name, experiment: ENVELOPE_EXPERIMENT, seed: ENVELOPE.seed, raceId: ENVELOPE.raceId, fieldBaseSpeed: ENVELOPE.fieldBaseSpeed, rows: envelope } : null,
  verification,
  timingSeconds: { ...phaseS, total: elapsedS },
};

await writeFile(resolve(here, 'results.json'), JSON.stringify(results, null, 2) + '\n');

// --- README (generated from the same results) ----------------------------------------
const FENCE = '```';
const f = (x, d = 2) => (x === null || x === undefined ? 'n/a' : Number(x).toFixed(d));
const pc = (x, d = 1) => (x === null || x === undefined ? 'n/a' : `${(100 * x).toFixed(d)}%`);
const sg = (x, d = 2) => (x === null || x === undefined ? 'n/a' : `${x > 0 ? '+' : ''}${Number(x).toFixed(d)}`);
const md = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `|${headers.map(() => '---').join('|')}|`,
  ...rows.map((r) => `| ${r.join(' | ')} |`),
].join('\n');
const out = [];
const H = (level, text) => out.push(`${'#'.repeat(level)} ${text}`, '');
const P = (text) => out.push(text, '');
const LI = (items) => { for (const t of items) out.push(`- ${t}`); out.push(''); };
const BLOCK = (lines) => { out.push(FENCE, ...lines, FENCE, ''); };
const TABLE = (headers, rows) => { out.push(md(headers, rows), ''); };

const timingHead = () => ['Arm', 'Subset', 'Races', 'Unresolved', 'Finish median (s)', 'p5 (s)', 'p95 (s)', 'max (s)', 'Share < 17 s (of all)', 'Share > 23 s (of finished)', 'Share > 23 s or unresolved (of all)', 'Playback +2 s median (s)', 'Playback +2 s max (s)', `Max events (cap ${CAPS.events})`, `Max opp. diagnostics (cap ${CAPS.opportunities})`];
const timingRow = (arm, s) => [arm, s.label, String(s.races), String(s.unresolved), f(s.finishMedianS), f(s.finishP5S), f(s.finishP95S), f(s.finishMaxS), pc(s.shareUnder17OfAll), pc(s.shareOver23OfFinished), pc(s.shareOver23OrUnresolvedOfAll), f(s.playbackPlus2MedianS), f(s.playbackPlus2MaxS), String(s.maxEventCount), String(s.maxOpportunityCount)];
const cmpCell = (s) => (s ? `${sg(s.meanDeltaPlace, 3)} / ${sg(s.winRateChangePp, 1)} / ${sg(s.meanDeltaMargin, 2)} / ${pc(s.improvedShare)} / ${pc(s.worsenedShare)}` : 'n/a');
const cmpPairs = (s) => (s ? String(s.pairs) : 'n/a');

H(1, '03 — Pace-scaling candidate (Opus-review diagnostic)');
P(`**Author:** bounded experiment-writer subagent (claude-haiku-5-5), delegated by the Opus reviewer. **Command (from repo root):** \`${CMD}\``);
P(`**Output:** \`results.json\` and this README, both written by \`run.mjs\` from the same in-memory results. Wall time of this run: ${elapsedS} s (calibration ${phaseS.calibration} s, validation ${phaseS.validation} s).`);

H(2, 'Hypothesis (from the brief)');
P('One global pace number that scales the whole motion envelope removes the speed-saturation knee, gives uniform relative modifier effects across tiers, and meets the timing rule.');

H(2, 'Method and substitutions');
LI([
  `Reference: \`reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs\`, read-only. SHA-256 \`${sourceSha256}\`. Loaded in memory with the experiment 02 string-patch loader (copied into \`run.mjs\`, not imported). No source file is edited.`,
  `Line endings: the reference has ${crlfLineCount} CRLF and ${lfLineCount} LF line breaks. The in-memory copy converts CRLF to LF before substitution (a no-op for this file), so that the anchor \`speed: 6,\\n\` from the brief matches the text.`,
  'Substitutions are applied in order with split/join; each anchor must occur at least once (the run throws otherwise). Occurrence counts are in Verification.',
  'Player rating input = tier rating x rest factor; trial and stance are applied inside the module.',
  'The affine arm changes only the sampled top-speed clamp, as in experiment 02. The pace arms change the seven anchors below; R0 and ALPHA are literals set per candidate.',
]);
H(3, 'Affine arm (baseline)');
const substLines = (pairs) => pairs.map(([from, to]) => `${JSON.stringify(from)} → ${JSON.stringify(to)}`);
BLOCK(substLines(AFFINE_PAIRS));
H(3, 'Pace arms (both candidates; R0 and ALPHA as literals)');
for (const cand of CANDIDATES) {
  P(`${cand.name}: ALPHA = ${cand.alpha}, R0 = ${cand.r0}`);
  BLOCK(substLines(paceSubstitutions(cand)));
}
H(3, 'Sprint-neutral arm (selected pace candidate plus this change; Safe/Steady unchanged)');
BLOCK(substLines(SPRINT_NEUTRAL_PAIRS));

H(2, 'Cases, seeds, arms');
TABLE(['Group', 'raceId', 'Field base', 'Rest', 'Kind', 'Label'], GROUPS.map((g) => [g.group, g.raceId, f(g.fieldBaseSpeed, 1), f(g.rest, 2), g.kind, g.label]));
P(`Matrix: 6 race groups x tiers common 10 / rare 14 / legendary 20 x steady/sprint x trial off/on = 72 cells. Production subset: ${PROD.length} cells (R01-rest1, R03-rest1, R03-rest0.5). Future group: ${FUT.length} cells (R03-rest0.75). Matrix-only: R01 with rest 0.75 and 0.5 (24 cells).`);
P(`Calibration seeds: \`${CAL_SEEDS[0]}\` … \`${CAL_SEEDS.at(-1)}\` (${CAL_SEEDS.length}). Validation seeds: \`${VAL_SEEDS[0]}\` … \`${VAL_SEEDS.at(-1)}\` (${VAL_SEEDS.length}), fresh and not used in any earlier experiment. Crossed seeds are shared across cells and arms.`);
TABLE(['Arm', 'Map / substitutions', 'Plan', 'Cells'], [
  ['cal-P25 / cal-P15', 'pace candidate (7 anchors)', 'row 0 only', '72 matrix cells x 12 seeds'],
  ['affine', 'topSpeed 8.25 + 0.5 x (no clamp)', 'row 0: 72 cells; rows 1 and 2: 48 production+future cells', '30 seeds'],
  ['pace-<selected>', 'pace candidate (7 anchors)', 'same as affine', '30 seeds'],
  ['pace-<selected>-sprint-neutral', 'pace candidate + Sprint mean 1.0 instead of 1.1', 'sprint cells of 3 production groups at rows 0-2', '18 cells x 3 rows x 30 seeds'],
]);

H(2, 'Metric definitions');
LI([
  '`margin` = P progress minus max rival progress in `finish[]` (body lengths; negative = P behind at the finish instant). `winningMargin` = place-1 progress minus place-2 progress.',
  'Lead changes and P rank changes: trajectory rows with tick x dt >= 3 s, counted as changes between consecutive rows; leader = highest progress, ties by id ascending.',
  'Paired comparisons: same seed, same row, all other inputs fixed. Delta = X minus Y, X the first-named side, so negative Delta place = X better. Improved / unchanged / worsened are shares of pairs with both races finished. Win rates use all pairs. Margin percentiles use linear interpolation.',
  'Timing: finish-time median, p5, p95 and max use finished races. Share < 17 s uses all races. Share > 23 s is shown both over finished races and over all races with unresolved counted as late (conservative). Playback +2 s = horizonSeconds + 2 s (the reference presentation adds highlightSeconds to the race duration, see buildPresentationPlan totalWallSeconds); reported separately.',
  'Unresolved races stay in every denominator. Win rate = wins / all races in the subset; mean place and margins use finished races.',
]);

H(2, 'Selection rule and outcome (pre-registered)');
P(`Rule: pick P25 if its calibration has median finish in [${RULE.medianMinS}, ${RULE.medianMaxS}] s, share of finishes > 23 s <= ${(RULE.lateShareMax * 100).toFixed(1)}%, and 0 unresolved; else pick P15 if it passes the same rule; else STOP.`);
TABLE(['Candidate', 'Median finish (s)', 'Median in range', 'Share > 23 s (of finished)', 'Share <= 2.5%', 'Unresolved', 'Unresolved = 0', 'Pass'], CANDIDATES.map((c) => {
  const r = calibration[c.name].rule;
  return [c.name, f(r.medianFinishS), String(r.medianInRange), pc(r.shareOver23OfFinished), String(r.shareOver23AtMost2_5pct), String(r.unresolved), String(r.unresolvedZero), String(r.pass)];
}));
const alsoPassed = selected ? CANDIDATES.filter((c) => c.name !== selected.name && calibration[c.name].rule.pass).map((c) => c.name) : [];
P(selected ? `**Outcome: selected ${selected.name}.** ${alsoPassed.length ? `${alsoPassed.join(', ')} also passed the rule and was not validated, because the rule selects the first passing candidate in the order P25, P15.` : ''} Validation and the solo envelope check were run for ${selected.name} only.` :'**Outcome: no candidate passed.** Per the brief, this run stopped after the calibration results. Validation and the solo envelope check were not run, and no candidate was tuned.');

H(2, 'Calibration results (row 0, 12 seeds)');
for (const c of CANDIDATES) {
  P(`${c.name} (\`${calibration[c.name].arm}\`):`);
  TABLE(timingHead(), Object.values(calibration[c.name].subsets).map((s) => timingRow(c.name, s)));
}

if (selected) {
  H(2, 'Validation results');
  P(`Candidate: ${validation.candidate}. Seeds ${VAL_SEEDS.length}. Arms: affine (baseline), pace-${selected.name} (selected candidate), pace-${selected.name}-sprint-neutral. Modes: row 0 (player at row 0 only) and slot-balanced (rows 0, 1, 2 weighted equally on the 48 production+future cells; the 24 matrix-only cells have row 0 only, so slot rows are restricted to production+future).`);

  H(3, 'Timing summary');
  const timingRows = [];
  for (const armName of ['affine', `pace-${selected.name}`]) {
    for (const s of Object.values(validation.arms[armName].subsets)) timingRows.push(timingRow(armName, s));
  }
  for (const s of Object.values(validation.sprintNeutral.subsets)) timingRows.push(timingRow(validation.sprintNeutral.name, s));
  TABLE(timingHead(), timingRows);

  H(3, 'Per-tier x group: win rate, mean place, lead changes, margin (production groups plus future)');
  const armsCmp = ['affine', `pace-${selected.name}`];
  for (const m of MODES) {
    P(`Mode: ${m.label}`);
    const rows = [];
    for (const g of [...PROD_GROUPS, ...FUT_GROUPS]) {
      for (const tier of TIER_NAMES) {
        const a = validation.arms.affine.groupTier[m.id][`${g}|${tier}`];
        const p = validation.arms[`pace-${selected.name}`].groupTier[m.id][`${g}|${tier}`];
        rows.push([`${g}${FUT_GROUPS.includes(g) ? ' (future)' : ''}`, tier,
          pc(a.winRate), f(a.meanPlace, 2), `${f(a.meanLeadChangesAfter3s, 2)} (${pc(a.shareWithLeadChangeAfter3s)})`, f(a.meanWinningMargin, 2),
          pc(p.winRate), f(p.meanPlace, 2), `${f(p.meanLeadChangesAfter3s, 2)} (${pc(p.shareWithLeadChangeAfter3s)})`, f(p.meanWinningMargin, 2)]);
      }
    }
    TABLE(['Group', 'Tier', 'affine win', 'affine mean place', 'affine lead chg after 3 s (share >= 1)', 'affine mean win margin', `pace win`, `pace mean place`, 'pace lead chg after 3 s (share >= 1)', 'pace mean win margin'], rows);
  }

  H(3, 'Paired comparisons (cell: mean Delta place / win change pp / mean Delta margin / improved / worsened)');
  P('Delta = X minus Y (X first-named). Production groups for all comparisons except the rest 0.75 vs 1 comparison, which uses the future group. Pair counts are listed for affine row 0, affine slot, pace row 0, pace slot.');
  for (const comp of COMPARISONS) {
    P(`#### ${comp.name}`);
    const cols = [
      { label: 'affine row 0', s: validation.arms.affine.comparisons.row0[comp.name] },
      { label: 'affine slot', s: validation.arms.affine.comparisons.slot[comp.name] },
      { label: `pace-${selected.name} row 0`, s: validation.arms[`pace-${selected.name}`].comparisons.row0[comp.name] },
      { label: `pace-${selected.name} slot`, s: validation.arms[`pace-${selected.name}`].comparisons.slot[comp.name] },
    ];
    const groupKeys = [...new Set(cols.flatMap((c) => Object.keys(c.s.byGroup)))].sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));
    const tierKeys = [...new Set(cols.flatMap((c) => Object.keys(c.s.byTier)))];
    const rows = [['all', cols.map((c) => cmpPairs(c.s.all)).join(' / '), ...cols.map((c) => cmpCell(c.s.all))]];
    for (const g of groupKeys) rows.push([`group ${g}`, cols.map((c) => cmpPairs(c.s.byGroup[g] ?? null)).join(' / '), ...cols.map((c) => cmpCell(c.s.byGroup[g] ?? null))]);
    for (const t of tierKeys) rows.push([`tier ${t}`, cols.map((c) => cmpPairs(c.s.byTier[t] ?? null)).join(' / '), ...cols.map((c) => cmpCell(c.s.byTier[t] ?? null))]);
    TABLE(['Subset', 'Pairs (aff r0 / aff slot / pace r0 / pace slot)', ...cols.map((c) => c.label)], rows);
  }

  H(3, 'Sprint-neutral arm');
  P(`Neutral sprint = pace-${selected.name} with Sprint mean 1.0 (instead of 1.1). Pace steady and pace +10% sprint are the pace arm's own cells at the same rows, seeds and trial states. Paired comparison: neutral sprint (X) minus pace steady (Y), same seed, row, trial, tier and group.`);
  for (const m of MODES) {
    P(`Mode: ${m.label}`);
    const rows = [];
    for (const g of PROD_GROUPS) {
      for (const tier of TIER_NAMES) {
        const w = validation.sprintNeutral.modes[m.id].winTable[`${g}|${tier}`];
        rows.push([g, tier, `${pc(w.neutralSprint.winRate)} / ${f(w.neutralSprint.meanPlace, 2)}`, `${pc(w.paceSteady.winRate)} / ${f(w.paceSteady.meanPlace, 2)}`, `${pc(w.paceSprint.winRate)} / ${f(w.paceSprint.meanPlace, 2)}`]);
      }
    }
    TABLE(['Group', 'Tier', 'Neutral sprint win / mean place', 'Pace steady win / mean place', 'Pace +10% sprint win / mean place'], rows);
    const paired = validation.sprintNeutral.modes[m.id].paired;
    const prow = [['all', cmpPairs(paired.all), cmpCell(paired.all)]];
    for (const g of PROD_GROUPS) prow.push([`group ${g}`, cmpPairs(paired.byGroup[g] ?? null), cmpCell(paired.byGroup[g] ?? null)]);
    for (const t of TIER_NAMES) prow.push([`tier ${t}`, cmpPairs(paired.byTier[t] ?? null), cmpCell(paired.byTier[t] ?? null)]);
    for (const g of PROD_GROUPS) for (const t of TIER_NAMES) prow.push([`${t} x ${g}`, cmpPairs(paired.byTierGroup[`${t}|${g}`] ?? null), cmpCell(paired.byTierGroup[`${t}|${g}`] ?? null)]);
    P(`Paired: neutral sprint minus pace steady, ${m.label}:`);
    TABLE(['Subset', 'Pairs', 'Mean Delta place / win change pp / mean Delta margin / improved / worsened'], prow);
  }

  H(2, 'Solo envelope check (selected candidate)');
  P(`Experiment \`${ENVELOPE_EXPERIMENT}\`, seed \`${ENVELOPE.seed}\`, raceId \`${ENVELOPE.raceId}\`, field base ${ENVELOPE.fieldBaseSpeed}, steady, trial off, player at row 0. finish x k should be roughly constant if the whole envelope scales with k = (sampled / R0)^ALPHA.`);
  TABLE(['Rating', 'Player sampled', 'k', 'Finish (s)', 'Finish x k', 'Status', 'Winner', 'Player place'], envelope.map((r) => [String(r.rating), f(r.playerSampled, 3), f(r.k, 4), f(r.finishTimeSeconds, 3), f(r.finishTimesK, 3), r.status, String(r.winner), String(r.playerPlace)]));
}

H(2, 'Verification');
const armChecks = [];
armChecks.push(['calibration cal-P25', calibration.P25.checks]);
armChecks.push(['calibration cal-P15', calibration.P15.checks]);
if (selected) {
  armChecks.push(['affine', validation.arms.affine.checks]);
  armChecks.push([`pace-${selected.name}`, validation.arms[`pace-${selected.name}`].checks]);
  armChecks.push([`pace-${selected.name}-sprint-neutral`, validation.sprintNeutral.checks]);
}
TABLE(['Arm', 'Races', 'Max map residual (tolerance ~1e-3 from rounded output)', 'Player row = slot', 'Player top speed range', 'Player pace range', 'Unresolved reasons', 'Max events', 'Max opp. diagnostics', 'Substitution anchor occurrences'], armChecks.map(([name, c]) => [
  name, String(c.races), f(c.maxMapResidual, 6), String(c.playerRowMatchesSlot),
  `${f(c.playerTopSpeedMin, 3)} – ${f(c.playerTopSpeedMax, 3)}`,
  c.playerPaceMin === null ? 'n/a' : `${f(c.playerPaceMin, 3)} – ${f(c.playerPaceMax, 3)}`,
  JSON.stringify(c.unresolvedReasons),
  String(c.maxEventCount), String(c.maxOpportunityCount),
  c.substitutionCounts ? c.substitutionCounts.map((x) => x.occurrences).join(',') : 'n/a',
]));
LI([
  `Reference SHA-256 ${sourceSha256}; rules version ${RULES_VERSION}; guard caps read from the module: mechanical events ${CAPS.events}, opportunity diagnostics ${CAPS.opportunities}.`,
  `Line endings: ${crlfLineCount} CRLF and ${lfLineCount} LF line breaks in the reference; normalization to LF is ${source === rawSource ? 'a no-op' : 'applied'}.`,
  determinism ? `Determinism spot check (re-running races, ${determinism.map((d) => `${d.arm} ${d.races} races`).join(', ')}): ${determinism.every((d) => d.identical) ? 'identical' : 'MISMATCH'}.` : 'Determinism spot check: not run (no candidate selected).',
  validation ? `Missing paired partners (should be 0): ${verification.missingPartnersTotal}.` : 'Validation not run.',
]);

H(2, 'Limitations');
LI([
  'Crossed seeds: the same seeds are used across cells, rows and arms, so pairs are not independent and pooled pair counts overstate precision. No standard errors or confidence intervals are reported.',
  'The matrix is an equal-weight balance over tiers, race groups, stances, trial states and rest factors. It is not player frequency; the production mix is not modelled.',
  'Slot-balanced is a proxy: rows 0, 1 and 2 weighted equally on the production+future cells. It is not an implemented seeded start-slot rule.',
  'The pace arms change the accepted Plan 13 acceleration, braking, turn-rate application and remove the 8-12 speed clamp. They are an alternative mechanic, not a calibration of the accepted mechanic. The affine arm also removes the clamp, as in experiment 02.',
  'Calibration used 12 seeds and the validation used 30 fresh seeds; the selection rule was applied to calibration only.',
  'The R03 rest 0.75 group is future-only and not reachable in the current 2-race slice.',
  'Player base speed = tier rating x rest, so R03 rest 0.5 legendary (10.0) and R03 rested common (10.0) are the same player input and produce identical races. Those table rows repeat by construction; the same input is counted in both places.',
  'The noweave and matrix-only groups are not part of the production summaries.',
  'Unresolved races are counted in every denominator; the late-or-unresolved share is the conservative timing figure.',
  'Win rates in the tier x group tables pool both trial states and both stances unless the table states otherwise.',
]);

const readme = out.join('\n') + '\n';
await writeFile(resolve(here, 'README.md'), readme);

// --- Console summary -------------------------------------------------------------------
console.log(`reference sha256 ${sourceSha256}`);
console.log(`CRLF lines normalized: ${crlfLineCount}; caps events ${CAPS.events}, opportunities ${CAPS.opportunities}; rules ${RULES_VERSION}`);
for (const c of CANDIDATES) {
  const r = calibration[c.name].rule;
  const m = calibration[c.name].subsets['matrix-row0'];
  console.log(`CAL ${c.name}: median ${r.medianFinishS} (in range ${r.medianInRange}), share>23s ${r.shareOver23OfFinished} (ok ${r.shareOver23AtMost2_5pct}), unresolved ${r.unresolved}, pass ${r.pass} | p5 ${m.finishP5S} p95 ${m.finishP95S} max ${m.finishMaxS} <17s ${m.shareUnder17OfAll} | +2s med ${m.playbackPlus2MedianS} max ${m.playbackPlus2MaxS} | maxEv ${m.maxEventCount} maxOpp ${m.maxOpportunityCount}`);
}
console.log(`outcome: ${results.calibration.outcome}`);
if (selected) {
  for (const armName of ['affine', `pace-${selected.name}`]) {
    const s = validation.arms[armName].subsets['matrix-row0'];
    console.log(`VAL ${armName} matrix row0: median ${s.finishMedianS} p5 ${s.finishP5S} p95 ${s.finishP95S} max ${s.finishMaxS} <17 ${s.shareUnder17OfAll} >23 ${s.shareOver23OfFinished} unresolved ${s.unresolved}`);
  }
  console.log(`envelope: ${envelope.map((r) => `${r.rating}: ${r.finishTimeSeconds}s x k ${r.finishTimesK}`).join(' | ')}`);
}
console.log(`timing seconds: ${JSON.stringify(phaseS)} total ${elapsedS}`);
console.log(`wrote ${resolve(here, 'results.json')} and ${resolve(here, 'README.md')}`);
