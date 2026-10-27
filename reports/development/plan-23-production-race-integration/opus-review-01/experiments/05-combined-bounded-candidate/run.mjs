import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Opus-authored frozen combination check: affine + risk-only Sprint + rowSpacing 1.5, fresh seeds.
// Constants were frozen from experiment 04 before this run; no tuning after results.
const here = import.meta.dirname;
const repoRoot = resolve(here, '../../../../../..');
const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(sourcePath, 'utf8');
const sourceSha256 = createHash('sha256').update(source).digest('hex');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;

function patch(code, from, to) {
  if (code.split(from).length !== 2) throw new Error(`anchor must occur exactly once: ${from}`);
  return code.replace(from, to);
}
async function load({ playerRow = 0, sprintMean = '1.1', rowSpacing = 4 }) {
  let code = patch(source, "from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
  code = patch(code, 'topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', 'topSpeed: 8.25 + 0.5 * sampled,');
  if (sprintMean !== '1.1') code = patch(code, 'base * 1.1 * (1 + (2 * draw - 1) * 0.2)', `base * ${sprintMean} * (1 + (2 * draw - 1) * 0.2)`);
  if (rowSpacing !== 4) code = patch(code, 'rowSpacing: 4,', `rowSpacing: ${rowSpacing},`);
  if (playerRow !== 0) {
    const rival = { 1: 'C', 2: 'E' }[playerRow];
    code = patch(code, "{ id: 'P', name: 'Player', lane: 2, row: 0, player: true }", `{ id: 'P', name: 'Player', lane: 2, row: ${playerRow}, player: true }`);
    code = patch(code, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: ${playerRow} }`, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: 0 }`);
  }
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const SEEDS = Array.from({ length: 40 }, (_, i) => `opus-r01-combo-val-${String(i + 1).padStart(2, '0')}`);
const TIERS = [['common', 10], ['rare', 14], ['legendary', 20]];
const GROUPS = [['R01-rest1', 'R01', 8, 1], ['R03-rest1', 'R03', 11.2, 1], ['R03-rest0.5', 'R03', 11.2, 0.5], ['R03-rest0.75-future', 'R03', 11.2, 0.75], ['R01-rest0.5-matrix', 'R01', 8, 0.5], ['R01-rest0.75-matrix', 'R01', 8, 0.75]];
const ARMS = [
  { name: 'affine-current', sprintMean: '1.1', rowSpacing: 4 },
  { name: 'combined-candidate', sprintMean: '1.0', rowSpacing: 1.5 },
];

function summarize(race) {
  const p = race.finish.find((e) => e.id === 'P');
  const rivalMax = Math.max(...race.finish.filter((e) => e.id !== 'P').map((e) => e.progress));
  const rows = race.trajectory.filter((r) => r.tick * race.dt >= 3 - 1e-9);
  const leader = (r) => r.entrants.reduce((b, e) => (!b || e.progress > b.progress || (e.progress === b.progress && e.id < b.id) ? e : b), null).id;
  let leadChanges = 0;
  for (let i = 1; i < rows.length; i += 1) if (leader(rows[i]) !== leader(rows[i - 1])) leadChanges += 1;
  return { status: race.status, time: race.finishTimeSeconds, place: p.place, win: p.place === 1, margin: p.progress - rivalMax, leadChanges };
}
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const q = (xs, p) => [...xs].sort((a, b) => a - b)[Math.max(0, Math.ceil(p * xs.length) - 1)];

const out = {};
for (const arm of ARMS) {
  const mods = {};
  for (const row of [0, 1, 2]) mods[row] = await load({ playerRow: row, sprintMean: arm.sprintMean, rowSpacing: arm.rowSpacing });
  const recs = [];
  for (const [group, raceId, field, rest] of GROUPS) for (const [tier, rating] of TIERS)
    for (const choice of ['steady', 'sprint']) for (const trial of [false, true]) for (const seed of SEEDS) for (const row of [0, 1, 2]) {
      const race = mods[row].resolveSeededRace({ seed, raceId, playerBaseSpeed: rating * rest, fieldBaseSpeed: field, choice, trialCommitted: trial, experiment: 'weave-rank-strong-contact' });
      recs.push({ group, tier, choice, trial, seed, row, ...summarize(race) });
    }
  const fin = recs.filter((r) => r.status === 'finished');
  const prodFin = fin.filter((r) => !r.group.includes('matrix') && !r.group.includes('future'));
  const prodTimes = prodFin.map((r) => r.time);
  const times = fin.map((r) => r.time);
  const cell = (f) => { const xs = recs.filter(f); return { n: xs.length, winRate: mean(xs.map((r) => Number(r.win))), meanPlace: mean(xs.map((r) => r.place)) }; };
  const winTable = {};
  for (const [group] of GROUPS) for (const [tier] of TIERS) for (const choice of ['steady', 'sprint']) for (const rowMode of ['row0', 'slot-balanced'])
    winTable[`${group}|${tier}|${choice}|${rowMode}`] = cell((r) => r.group === group && r.tier === tier && r.choice === choice && (rowMode === 'slot-balanced' || r.row === 0));
  const key = (r) => `${r.group}|${r.tier}|${r.trial}|${r.seed}|${r.row}`;
  const steady = new Map(recs.filter((r) => r.choice === 'steady').map((r) => [key(r), r]));
  const pairStats = (f) => {
    const pairs = recs.filter((r) => r.choice === 'sprint' && f(r)).map((x) => [x, steady.get(key(x))]);
    const d = pairs.map(([x, y]) => x.place - y.place);
    return { pairs: pairs.length, meanDeltaPlace: mean(d), improved: d.filter((v) => v < 0).length / d.length, worsened: d.filter((v) => v > 0).length / d.length,
      winChangePp: 100 * (mean(pairs.map(([x]) => Number(x.win))) - mean(pairs.map(([, y]) => Number(y.win)))), meanDeltaMargin: mean(pairs.map(([x, y]) => x.margin - y.margin)) };
  };
  const sprintVsSteady = {};
  for (const rowMode of ['row0', 'slot-balanced']) {
    sprintVsSteady[`all|${rowMode}`] = pairStats((r) => rowMode === 'slot-balanced' || r.row === 0);
    for (const [group] of GROUPS) for (const [tier] of TIERS)
      sprintVsSteady[`${group}|${tier}|${rowMode}`] = pairStats((r) => r.group === group && r.tier === tier && (rowMode === 'slot-balanced' || r.row === 0));
  }
  const byRow = Object.fromEntries([0, 1, 2].map((row) => [`row${row}`, cell((r) => r.row === row)]));
  out[arm.name] = { arm, races: recs.length, unresolved: recs.length - fin.length,
    timingProduction: { n: prodTimes.length, median: q(prodTimes, 0.5), p95: q(prodTimes, 0.95), max: Math.max(...prodTimes), over23: prodTimes.filter((t) => t > 23).length, under17: prodTimes.filter((t) => t < 17).length },
    timingAllSixGroups: { n: times.length, median: q(times, 0.5), p95: q(times, 0.95), max: Math.max(...times), over23: times.filter((t) => t > 23).length, under17: times.filter((t) => t < 17).length },
    meanLeadChangesAfter3s: mean(recs.map((r) => r.leadChanges)), shareWithLeadChange: mean(recs.map((r) => Number(r.leadChanges >= 1))),
    overallWin: { row0: cell((r) => r.row === 0), slotBalanced: cell(() => true) }, byRow, winTable, sprintVsSteady };
}
await writeFile(resolve(here, 'results.json'), JSON.stringify({ provenance: { sourceSha256, seeds: SEEDS, cells: 'six groups (3 production, 1 future R03 0.75, 2 matrix-only R01 tired) × 3 tiers × steady/sprint × trial off/on = 72 matrix cells; rows 0,1,2 equally weighted',
  substitutions: ['PRNG URL', 'topSpeed = 8.25 + 0.5*sampled (all arms)', 'combined-candidate: sprint mean 1.1→1.0 and rowSpacing 4→1.5', 'player start row swap for rows 1/2'] }, results: out }, null, 2) + '\n');
for (const [name, r] of Object.entries(out)) {
  console.log(name, JSON.stringify({ races: r.races, unresolved: r.unresolved, timingProduction: r.timingProduction, timingAll: r.timingAllSixGroups, lead: [r.meanLeadChangesAfter3s.toFixed(2), r.shareWithLeadChange.toFixed(3)],
    win: [r.overallWin.row0.winRate.toFixed(3), r.overallWin.slotBalanced.winRate.toFixed(3)], byRow: Object.fromEntries(Object.entries(r.byRow).map(([k, v]) => [k, v.winRate.toFixed(3)])),
    sprint: Object.fromEntries(Object.entries(r.sprintVsSteady).map(([k, v]) => [k, `dP ${v.meanDeltaPlace.toFixed(2)} imp ${(100 * v.improved).toFixed(1)} wor ${(100 * v.worsened).toFixed(1)} win ${v.winChangePp.toFixed(1)}`])) }));
  console.log('  wins', Object.entries(r.winTable).map(([k, v]) => `${k}:${(100 * v.winRate).toFixed(0)}`).join(' '));
}
