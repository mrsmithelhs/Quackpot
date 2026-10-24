// Plan 01 experiment runner. Usage: node sim/run-experiments.mjs [--quick] [--out <dir>]
// Writes results.json, results.md, traces.txt. Everything here is exploratory evidence from provisional values;
// no output is a recommended or adopted balance table.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Run, simulate, DEFAULT_PARAMS } from './model.mjs';
import { makeStrategy, RACE_POLICIES } from './strategies.mjs';
import { projectReceipt } from './receipt.mjs';

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'reports/development/plan-01-seeded-economy-simulation/results';
const N = (full, quick) => (QUICK ? quick : full);

// ---------------------------------------------------------------- statistics helpers
export function pct(sorted, q) {
  if (sorted.length === 0) return null;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo);
}
export function dist(values) {
  const v = values.filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!v.length) return { n: 0 };
  const mean = v.reduce((s, x) => s + x, 0) / v.length;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, v.length - 1));
  return { n: v.length, min: v[0], p5: pct(v, 0.05), p25: pct(v, 0.25), p50: pct(v, 0.5), p75: pct(v, 0.75), p95: pct(v, 0.95), max: v[v.length - 1], mean, sd };
}
const share = (runs, f) => runs.filter(f).length / runs.length;
const f1 = (x) => (x === null || x === undefined ? '–' : Number.isInteger(x) ? String(x) : x.toFixed(1));
const f2 = (x) => (x === null || x === undefined ? '–' : x.toFixed(2));
const pc = (x) => `${(x * 100).toFixed(0)}%`;
const dcell = (d) => (d.n ? `${f1(d.min)}/${f1(d.p5)}/${f1(d.p50)}/${f1(d.p95)}/${f1(d.max)}` : '–');

function table(headers, rows) {
  return [`| ${headers.join(' | ')} |`, `|${headers.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

// ---------------------------------------------------------------- run helpers
const STRATS = ['frugal_single', 'saver_ten', 'topup_single', 'pity_chaser', 'whale_ten', 'early_uninstaller'];

/** Time-pacing ASSUMPTIONS (seconds). A headless model cannot measure real classroom minutes. */
export const PACING = { setup: 90, reveal: 3, raceFixed: 20, raceChoice: 5, offerRead: 8, event: 8, escalation: 15, banner: 10, modal: 20, receipt: 150 };
export function estimateSeconds(entries, pacing = PACING) {
  const c = (t) => entries.filter((e) => e.type === t).length;
  return pacing.setup + c('reveal_shown') * pacing.reveal + c('race_result') * (pacing.raceFixed + pacing.raceChoice) + c('offer_shown') * pacing.offerRead +
    c('event_result') * pacing.event + c('escalation_result') * pacing.escalation + c('banner_started') * pacing.banner + c('retention_modal_shown') * pacing.modal + pacing.receipt;
}

function runMany(label, params, stratName, n, stratOverrides = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const run = simulate(params, `${label}-${i}`, makeStrategy(stratName, stratOverrides));
    const s = run.summary();
    s.seconds = estimateSeconds(run.log.entries);
    s.anyLegendary = s.legendaries > 0;
    s.pulls = s.freeDraws + s.paidDraws;
    s.gemsPerDay = s.gemsFromRaces / s.day;
    out.push(s);
  }
  return out;
}

function pityRow(runs) {
  const w = (k) => runs.reduce((s, r) => s + r.windows[k], 0);
  return {
    enteredSoft: share(runs, (r) => r.enteredSoft),
    reachedHard: share(runs, (r) => r.reachedHardDraw),
    anyLegendary: share(runs, (r) => r.anyLegendary),
    noPaidDraw: share(runs, (r) => r.paidDraws === 0),
    windowsBeforeSoft: w('beforeSoft'), windowsInSoft: w('inSoft'), windowsAtHard: w('atHard'),
    paidDraws: dist(runs.map((r) => r.paidDraws)),
    firstLegendary: dist(runs.map((r) => r.firstLegendaryDraw)),
  };
}

const results = { meta: { quick: QUICK, generated: new Date().toLocaleDateString('en-CA'), defaults: DEFAULT_PARAMS, pacing: PACING } };
const md = [];
const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${m}`);

// ================================================================ BASELINE (unchanged design table)
log('baseline');
results.baseline = [];
{
  const rows = [];
  for (const maxDays of [15, 30, 60]) {
    for (const st of STRATS) {
      const runs = runMany(`base-${maxDays}-${st}`, { maxDays }, st, N(400, 40));
      const routes = {};
      for (const r of runs) routes[r.route] = (routes[r.route] ?? 0) + 1;
      const pr = pityRow(runs);
      const rec = { maxDays, strategy: st, n: runs.length, routes, pity: pr, owned: dist(runs.map((r) => r.ownedDistinct)), cashSpent: dist(runs.map((r) => r.cashSpentOnBundles)),
        gemsPerDay: dist(runs.map((r) => r.gemsPerDay)), minCash: dist(runs.map((r) => r.minCash)), debt: dist(runs.map((r) => r.debt)), minutes: dist(runs.map((r) => r.seconds / 60)),
        duplicates: dist(runs.map((r) => r.duplicates)), day: dist(runs.map((r) => r.day)) };
      results.baseline.push(rec);
      rows.push([maxDays, st, Object.entries(routes).map(([k, v]) => `${k} ${pc(v / runs.length)}`).join(', '), dcell(rec.day), dcell(rec.pity.paidDraws), pc(pr.enteredSoft), pc(pr.reachedHard), pc(pr.anyLegendary), dcell(rec.owned)]);
    }
  }
  md.push('## Baseline: unchanged design-table starting values\n');
  md.push(`Each row is ${N(400, 40)} seeds. Cells show min/p5/p50/p95/max. "Soft" = a draw with raised-but-not-certain legendary odds; "Hard" = the guaranteed draw occurred. All non-table inputs are assumptions (see report). Opening ten-pull does not advance pity in the baseline (assumption).\n`);
  md.push(table(['maxDays', 'strategy', 'terminal routes', 'days played', 'paid draws', 'entered soft', 'reached hard', 'any legendary', 'owned identities (of 24)'], rows));
  md.push('');
}

// ================================================================ S1 pity reachability sweep
log('S1');
results.s1 = [];
{
  const combos = [];
  for (const soft of [20, 35, 50, Infinity]) for (const hard of [30, 50, 70, 90]) if (soft < hard || soft === Infinity) combos.push([soft, hard]);
  const rows = [];
  for (const maxDays of [15, 60]) {
    for (const [soft, hard] of combos) {
      for (const st of ['frugal_single', 'topup_single', 'pity_chaser', 'whale_ten']) {
        for (const payoutScale of [1, 4]) {
          const runs = runMany(`s1-${maxDays}-${soft}-${hard}-${st}-${payoutScale}`, { maxDays, softPityStart: soft, hardPity: hard, payoutScale }, st, N(80, 20));
          const pr = pityRow(runs);
          const rec = { maxDays, soft: soft === Infinity ? 'none' : soft, hard, strategy: st, payoutScale, n: runs.length, ...pr };
          results.s1.push(rec);
          rows.push([maxDays, rec.soft, hard, st, payoutScale, pc(pr.enteredSoft), pc(pr.reachedHard), pc(pr.anyLegendary), dcell(pr.paidDraws), f1(pr.firstLegendary.p50)]);
        }
      }
    }
  }
  md.push('## S1: pity reachability sweep\n');
  md.push(`${N(80, 20)} seeds per row. Soft/hard thresholds are draws within a pity window; "none" = no soft pity. Columns separate: entered soft pity, reached the hard-guarantee draw, and obtained any legendary (including by base odds before soft pity). Paid-draw cell: min/p5/p50/p95/max. Last column: median draw count of the first legendary among runs that got one (free opening draws included).\n`);
  md.push(table(['days', 'soft', 'hard', 'strategy', 'race payout x', 'entered soft', 'reached hard', 'any legendary', 'paid draws', 'median 1st legendary'], rows));
  md.push('');

  // pity carry / opening-advance side sweep
  const side = [];
  results.s1Side = [];
  for (const carry of ['carry', 'reset']) {
    for (const adv of [false, true]) {
      for (const st of ['topup_single', 'whale_ten']) {
        const runs = runMany(`s1side-${carry}-${adv}-${st}`, { maxDays: 60, pityCarry: carry, openingAdvancesPity: adv }, st, N(150, 30));
        const pr = pityRow(runs);
        results.s1Side.push({ carry, openingAdvancesPity: adv, strategy: st, ...pr });
        side.push([carry, adv, st, pc(pr.enteredSoft), pc(pr.reachedHard), pc(pr.anyLegendary), `${pr.windowsBeforeSoft}/${pr.windowsInSoft}/${pr.windowsAtHard}`]);
      }
    }
  }
  md.push('### S1 side sweep: banner pity carry/reset and whether the opening free ten-pull advances pity (60 days)\n');
  md.push('Window columns count completed pity windows ending in a legendary: before soft pity / inside soft pity / at the hard draw.\n');
  md.push(table(['pity at banner change', 'opening advances pity', 'strategy', 'entered soft', 'reached hard', 'any legendary', 'windows before-soft/in-soft/at-hard'], side));
  md.push('');
}

// ================================================================ S2 self-funding versus starvation
log('S2');
results.s2 = [];
{
  const rows = [];
  for (const payoutScale of [0.5, 1, 2, 4, 8, 16]) {
    for (const racesPerDay of [1, 2, 4]) {
      const runs = runMany(`s2a-${payoutScale}-${racesPerDay}`, { maxDays: 60, payoutScale, racesPerDay }, 'frugal_single', N(100, 20));
      const gpd = dist(runs.map((r) => r.gemsPerDay));
      const draws = dist(runs.map((r) => r.paidDraws));
      const rec = { kind: 'race-only', payoutScale, racesPerDay, n: runs.length, gemsPerDay: gpd, paidDraws: draws, daysPerPull: 160 / gpd.mean, legendaryShare: share(runs, (r) => r.anyLegendary) };
      results.s2.push(rec);
      rows.push([payoutScale, racesPerDay, dcell(gpd), f1(160 / gpd.mean), dcell(draws), pc(rec.legendaryShare), dcell(dist(runs.map((r) => r.ownedDistinct)))]);
    }
  }
  md.push('## S2: race income versus pull cost\n');
  md.push('### Race income alone (frugal_single: never buys gems; 60 days, 40 runs per row)\n');
  md.push('A pull costs 160 gems. "Days per pull" = 160 / mean gems earned per day. Cells min/p5/p50/p95/max over runs.\n');
  md.push(table(['payout x', 'races/day', 'gems/day', 'days per pull (mean)', 'paid draws in 60d', 'any legendary', 'owned identities'], rows));
  md.push('');

  const rows2 = [];
  results.s2b = [];
  for (const bundlePriceScale of [0.25, 1, 4]) {
    for (const wagePerDay of [25, 45, 90]) {
      for (const st of ['frugal_single', 'topup_single', 'whale_ten']) {
        const runs = runMany(`s2b-${bundlePriceScale}-${wagePerDay}-${st}`, { maxDays: 60, bundlePriceScale, wagePerDay }, st, N(100, 20));
        const routes = {};
        for (const r of runs) routes[r.route] = (routes[r.route] ?? 0) + 1;
        const rec = { bundlePriceScale, wagePerDay, strategy: st, n: runs.length, routes, runningOnEmpty: share(runs, (r) => r.route === 'running_on_empty'), minCash: dist(runs.map((r) => r.minCash)),
          debt: dist(runs.map((r) => r.debt)), cashSpent: dist(runs.map((r) => r.cashSpentOnBundles)), paidDraws: dist(runs.map((r) => r.paidDraws)), day: dist(runs.map((r) => r.day)), escalation: dist(runs.map((r) => r.escalation)) };
        results.s2b.push(rec);
        rows2.push([bundlePriceScale, wagePerDay, st, pc(rec.runningOnEmpty), dcell(rec.day), dcell(rec.minCash), dcell(rec.debt), dcell(rec.cashSpent), dcell(rec.paidDraws)]);
      }
    }
  }
  md.push('### Cash drain and starvation (60 days; cash-to-dollar and wage are assumptions)\n');
  md.push('Starvation = terminal route `running_on_empty` before day 60. Price x multiplies bundle and starter cash prices. Cells min/p5/p50/p95/max.\n');
  md.push(table(['price x', 'wage/day', 'strategy', 'running on empty', 'days played', 'min cash', 'final debt', 'cash spent on bundles', 'paid draws'], rows2));
  md.push('');

  // loop gain: do pulls feed back into race income? compare mean gems/day early vs late for a gem-funded player.
  const loop = [];
  results.s2Loop = [];
  for (const scale of [1, 4, 16]) {
    for (const creep of [1.0, 1.15]) {
      const early = runMany(`s2l-e-${scale}-${creep}`, { maxDays: 6, payoutScale: scale, powerCreep: creep }, 'frugal_single', N(150, 30));
      const late = runMany(`s2l-l-${scale}-${creep}`, { maxDays: 60, payoutScale: scale, powerCreep: creep }, 'frugal_single', N(150, 30));
      const rec = { payoutScale: scale, powerCreep: creep, earlyGemsPerDay: dist(early.map((r) => r.gemsPerDay)), lateGemsPerDay: dist(late.map((r) => r.gemsPerDay)) };
      results.s2Loop.push(rec);
      loop.push([scale, creep, f1(rec.earlyGemsPerDay.mean), f1(rec.lateGemsPerDay.mean), f2(rec.lateGemsPerDay.mean / rec.earlyGemsPerDay.mean)]);
    }
  }
  md.push('### Does income grow as the roster grows? (frugal player; first 6 days vs 60-day average)\n');
  md.push(table(['payout x', 'power creep', 'gems/day (6d)', 'gems/day (60d avg)', 'ratio'], loop));
  md.push('');

  // Down loop check
  const dl = [];
  results.s2Down = [];
  for (const downValueGems of [0.02, 0.1, 0.5, 1]) {
    const runs = runMany(`s2d-${downValueGems}`, { maxDays: 60, downValueGems }, 'whale_ten', N(100, 20));
    const ratio = runs.map((r) => ((r.down + r.downSpent) * downValueGems) / Math.max(1, r.gemsSpentOnPulls));
    const rec = { downValueGems, ratio: dist(ratio) };
    results.s2Down.push(rec);
    dl.push([downValueGems, dcell({ ...rec.ratio, min: rec.ratio.min * 100, p5: rec.ratio.p5 * 100, p50: rec.ratio.p50 * 100, p95: rec.ratio.p95 * 100, max: rec.ratio.max * 100 })]);
  }
  md.push('### Down shop as a pull loop (whale_ten, 60 days): best-case gem-equivalent of all Down earned, as % of gems spent on pulls\n');
  md.push('Cells min/p5/p50/p95/max of percent. A value near or above 100% would make duplicates fund the next pull.\n');
  md.push(table(['gem value of 1 Down (assumed)', '% of pull spend recovered'], dl));
  md.push('');
}

// ================================================================ Race-choice policy comparison
log('race policies');
results.racePolicy = [];
{
  const rows = [];
  const scenarios = [
    ['small roster (frugal, 15d)', { maxDays: 15 }, 'frugal_single'],
    ['large roster (whale, 15d)', { maxDays: 15 }, 'whale_ten'],
    ['field ignores creep', { maxDays: 15, fieldScalesWithCreep: false }, 'whale_ten'],
    ['no fatigue', { maxDays: 15, fatiguePenalty: 0 }, 'whale_ten'],
    ['strong fatigue 30%', { maxDays: 15, fatiguePenalty: 0.3 }, 'whale_ten'],
    ['longshot x2.5', { maxDays: 15, longshotMultiplier: 2.5 }, 'whale_ten'],
  ];
  const n = N(300, 40);
  for (const [name, params, st] of scenarios) {
    const per = {};
    for (const pol of RACE_POLICIES) per[pol] = runMany(`rp-${name}`, params, st, n, { race: pol }).map((r) => r.gemsFromRaces / r.races);
    // paired by seed: same labels give the same draw/event/race streams
    const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
    for (const pol of RACE_POLICIES) {
      const diff = per[pol].map((x, i) => x - per.best[i]);
      const m = mean(diff);
      const se = Math.sqrt(diff.reduce((s, x) => s + (x - m) ** 2, 0) / (diff.length - 1)) / Math.sqrt(diff.length);
      const winShare = per.best.map((_, i) => (per[pol][i] >= Math.max(...RACE_POLICIES.map((p) => per[p][i])) - 1e-9 ? 1 : 0)).reduce((s, x) => s + x, 0) / n;
      const rec = { scenario: name, policy: pol, n, meanGemsPerRace: mean(per[pol]), diffVsBest: m, ci95: [m - 1.96 * se, m + 1.96 * se], bestOrTiedShare: winShare };
      results.racePolicy.push(rec);
      rows.push([name, pol, f2(rec.meanGemsPerRace), `${f2(m)} [${f2(rec.ci95[0])}, ${f2(rec.ci95[1])}]`, pc(winShare)]);
    }
  }
  md.push('## Pre-race choice policies (compared, not assumed)\n');
  md.push(`Mean gems per race by policy, paired by seed (${n} seeds). "vs best" = mean paired difference from the always-best policy with a 95% interval. "Best or tied" = share of seeds where that policy's average payout was the highest of the five. A policy dominates only if it wins in every scenario with an interval that excludes zero.\n`);
  md.push(table(['scenario', 'policy', 'mean gems/race', 'vs best [95% CI]', 'best or tied'], rows));
  md.push('');
}

// ================================================================ S3 roster and duplicates
log('S3');
results.s3 = [];
{
  const rows = [];
  for (const rosterSize of [12, 18, 24, 36, 48, 60]) {
    for (const st of ['topup_single', 'whale_ten']) {
      const runs = runMany(`s3-${rosterSize}-${st}`, { maxDays: 60, rosterSize }, st, N(100, 20));
      const completers = runs.filter((r) => r.route === 'completed_collection');
      const rec = { rosterSize, strategy: st, n: runs.length, completed: completers.length / runs.length, owned: dist(runs.map((r) => r.ownedDistinct / rosterSize)),
        dupPerPaidDraw: dist(runs.map((r) => r.duplicates / Math.max(1, r.pulls))), pullsToComplete: dist(completers.map((r) => r.pulls)), down: dist(runs.map((r) => r.down)), day: dist(runs.map((r) => r.day)) };
      results.s3.push(rec);
      rows.push([rosterSize, st, pc(rec.completed), dcell({ ...rec.owned, min: rec.owned.min * 100, p5: rec.owned.p5 * 100, p50: rec.owned.p50 * 100, p95: rec.owned.p95 * 100, max: rec.owned.max * 100 }), f2(rec.dupPerPaidDraw.mean), dcell(rec.pullsToComplete), dcell(rec.down)]);
    }
  }
  md.push('## S3: roster size, duplicates, completion\n');
  md.push(`60 days, ${N(100, 20)} seeds per row. Roster composition repeats the pattern common/common/rare/common/rare/legendary (assumed); new banners release 6 identities until the roster is full. Owned = % of roster. Cells min/p5/p50/p95/max.\n`);
  md.push(table(['roster size', 'strategy', 'completed collection', 'owned % of roster', 'duplicates per draw (mean)', 'draws to complete (completers)', 'Down held'], rows));
  md.push('');

  const abl = [];
  results.ablation = [];
  for (const [label, params] of [
    ['baseline', {}], ['no set bonus', { setBonus: 0 }], ['set bonus 15%', { setBonus: 0.15 }], ['no curveballs', { curveballs: false }],
  ]) {
    for (const st of ['topup_single', 'whale_ten']) {
      const runs = runMany(`abl-${label}-${st}`, { maxDays: 30, ...params }, st, N(200, 30));
      const rec = { label, strategy: st, n: runs.length, gemsPerDay: dist(runs.map((r) => r.gemsPerDay)), minCash: dist(runs.map((r) => r.minCash)), runningOnEmpty: share(runs, (r) => r.route === 'running_on_empty'), owned: dist(runs.map((r) => r.ownedDistinct)) };
      results.ablation.push(rec);
      abl.push([label, st, f1(rec.gemsPerDay.mean), dcell(rec.minCash), pc(rec.runningOnEmpty), f1(rec.owned.mean)]);
    }
  }
  md.push('### Set-bonus and curveball ablations (30 days)\n');
  md.push(table(['variant', 'strategy', 'mean race gems/day', 'min cash (min/p5/p50/p95/max)', 'running on empty', 'mean owned'], abl));
  md.push('');
}

// ================================================================ floor-time estimate
log('time');
{
  const rows = [];
  for (const maxDays of [15, 30]) {
    for (const st of ['frugal_single', 'topup_single', 'whale_ten', 'early_uninstaller']) {
      const b = results.baseline.find((r) => r.maxDays === maxDays && r.strategy === st);
      rows.push([maxDays, st, dcell(b.minutes)]);
    }
  }
  md.push('## Floor-time estimate (assumption-driven, NOT a measurement)\n');
  md.push(`Seconds assumed per element: ${Object.entries(PACING).map(([k, v]) => `${k} ${v}`).join(', ')}. The model has no real pacing; whether a floor run is roughly 15 minutes requires browser and human observation. Cells min/p5/p50/p95/max minutes.\n`);
  md.push(table(['days', 'strategy', 'estimated minutes'], rows));
  md.push('');
}

// ================================================================ traces
log('traces');
function fmt(e) {
  const p = Object.entries(e.payload).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ');
  return `[${String(e.seq).padStart(3)}] d${e.clock.day} ${e.type} ${p}`.slice(0, 230);
}
{
  const traces = [];
  const a = simulate({ maxDays: 15 }, 'trace-early', makeStrategy('early_uninstaller'));
  traces.push('=== Trace 1: early_uninstaller, seed trace-early (full run) ===', ...a.log.entries.map(fmt));
  const b = simulate({ maxDays: 15 }, 'trace-frugal', makeStrategy('frugal_single'));
  traces.push('', '=== Trace 2: frugal_single, seed trace-frugal (first 70 entries; 15-day run has ' + b.log.length + ') ===', ...b.log.entries.slice(0, 70).map(fmt));
  // find a whale seed whose log contains a soft-pity draw
  let c = null;
  for (let i = 0; i < 200 && !c; i++) {
    const r = simulate({ maxDays: 15 }, `trace-pity-${i}`, makeStrategy('whale_ten'));
    if (r.log.entries.some((e) => e.type === 'draw_committed' && e.payload.odds.legendary > 0.05 && e.payload.odds.legendary < 1)) c = [i, r];
  }
  if (c) {
    const es = c[1].log.entries;
    const idx = es.findIndex((e) => e.type === 'draw_committed' && e.payload.odds.legendary > 0.05 && e.payload.odds.legendary < 1);
    traces.push('', `=== Trace 3: whale_ten, seed trace-pity-${c[0]}, first soft-pity draw with 12 entries of context each side ===`, ...es.slice(Math.max(0, idx - 12), idx + 12).map(fmt));
  }
  const d = new Run({ startGems: 1600 }, 'trace-exit');
  d.start();
  d.pull(10, { exit: { draw: 4, boundary: 'after_commit_before_reveal' } });
  d.uninstall('leave');
  traces.push('', '=== Trace 4: scripted exit between commit and reveal of draw 4 of a paid ten-pull (sequential mode), seed trace-exit ===', ...d.log.entries.slice(-16).map(fmt));
  const rc = projectReceipt(d.log.entries);
  traces.push('', '--- Receipt projection for trace 4 (pull ledger, paid ten-pull) ---', ...rc.pullLedger.filter((l) => l.purchaseKind === 'ten_pull').map((l) => `draw ${l.drawIndex}/${l.of} pityBefore=${l.pityBefore} odds=${JSON.stringify(l.preDrawOdds)} committed=${l.committed.rarity}:${l.committed.identity} revealed=${l.revealed}`));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'traces.txt'), traces.join('\n') + '\n');
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'results.json'), JSON.stringify(results, (k, v) => (v === Infinity ? 'Infinity' : v), 1));
writeFileSync(join(outDir, 'results.md'), `# Plan 01 simulation results (generated ${results.meta.generated}${QUICK ? ', QUICK mode: small samples' : ''})\n\nGenerated by \`node sim/run-experiments.mjs\`. Exploratory evidence from provisional values; not a balance table.\n\n${md.join('\n')}\n`);
log('done');
