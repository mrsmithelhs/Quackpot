// Plan 38 measurement: cost of clone-based effect previews on a real Day 2 save and on an inflated log.
// Read-only: the historical save is parsed in memory and never written. Run only through the bounded launcher.
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { GameEngine } from '../../../src/core/game-engine.mjs';
import { previewLadder, previewZeroCash } from '../../../src/ui/life/life-preview.mjs';

const ROOT = new URL('../../../', import.meta.url);
const SAVE = 'reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/rent-unpaid-escalation.save.json';
const envelope = JSON.parse(await readFile(new URL(SAVE, ROOT), 'utf8'));

function timed(label, make, run, n = 20) {
  const samples = [];
  for (let i = 0; i < n; i++) {
    const e = make();
    const t = performance.now();
    run(e);
    samples.push(performance.now() - t);
  }
  samples.sort((a, b) => a - b);
  const e = make();
  const bytes = JSON.stringify(e.toEnvelope()).length;
  console.log(`${label}: events ${e.log.length}, envelope ${(bytes / 1024).toFixed(0)} KB, median ${samples[n >> 1].toFixed(2)} ms, max ${samples[n - 1].toFixed(2)} ms`);
}

const unpaid = () => {
  const e = GameEngine.fromEnvelope(structuredClone(envelope));
  e.billExpense('rent', 15);
  return e;
};
const inflated = () => {
  const e = unpaid();
  for (let i = 0; i < 3000; i++) e.log.append('action', { kind: 'measurement_padding', i }, e.state.clock);
  return e;
};
const paidZero = () => {
  const e = GameEngine.fromEnvelope(structuredClone(envelope));
  e.state.cash = 15;
  e.billExpense('rent', 15);
  return e;
};

timed('ladder preview, real Day 2 save (cold)', unpaid, (e) => previewLadder(e));
timed('ladder preview twice (second call memoized), real save', unpaid, (e) => { previewLadder(e); const t = performance.now(); previewLadder(e); return t; });
timed('ladder preview, +3000 events (cold)', inflated, (e) => previewLadder(e));
timed('zero-cash previews (shift + couch), real save', paidZero, (e) => { previewZeroCash(e, 'extra_shift'); previewZeroCash(e, 'sell_couch'); });
