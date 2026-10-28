// Plan 26 review tool (NOT runtime): analytic ESTIMATE of the lightning pulse before any browser composite exists. `node animation/tools/estimate-lightning.mjs`
// Composites in sRGB gamma space as a browser does (normal blend for the window lift, screen for the room lift, multiply for the rain tint), then converts to WCAG relative luminance.
// It ignores the vignette, anti-aliasing and the actual room colours, so it is only a sanity bound; the browser composite measurement is the evidence.
import { LIGHTNING, pulseFactor } from '../lightning.mjs';
import { relLuminance } from './flash-metrics.mjs';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const L = LIGHTNING, win = hex(L.windowColor), room = hex(L.room.color), tint = hex('#36497a'), TINT_OP = .46;     // storm tint from study/weather.mjs
const lum = c => relLuminance(...c.map(v => Math.round(v * 255)));
const normal = (b, o, a) => b.map((v, i) => v * (1 - a) + o[i] * a);
const screen = (b, o, a) => b.map((v, i) => v + a * o[i] * (1 - v));
const multiplyTint = b => b.map((v, i) => v * (1 - TINT_OP) + v * tint[i] * TINT_OP);

export function estimate() {
  const glass = [['sky bottom #525d74', '#525d74'], ['sky top #343d51', '#343d51'], ['cloud #414b61', '#414b61'], ['dark cloud #272f40', '#272f40'], ['rain streak #f3f7ff', '#f3f7ff']];
  const roomBases = [['very dark room 0.02', .15], ['dark room 0.05', .25], ['mid room 0.15', .43]].map(([n, g]) => [n, [g, g, g]]);   // gamma grey standing in for room pixels under the tint
  const out = [];
  for (const [name, h] of glass) { const b = hex(h), l0 = lum(multiplyTint(b)); const l1 = lum(multiplyTint(normal(b, win, L.windowPeak))); out.push({ region: `glass ${name}`, neutral: +l0.toFixed(4), peak: +l1.toFixed(4), lift: +(l1 - l0).toFixed(4) }); }
  for (const [name, b] of roomBases) { const l0 = lum(b), l1 = lum(screen(b, room, L.roomPeak)); out.push({ region: `room centre (gradient alpha 1) ${name}`, neutral: +l0.toFixed(4), peak: +l1.toFixed(4), lift: +(l1 - l0).toFixed(4) }); }
  return out;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')}` || process.argv[1]?.endsWith('estimate-lightning.mjs')) {
  console.log(`pulse: ${L.durationMs} ms, linear rise 0-${L.peakMs} ms, linear fall ${L.peakMs}-${L.durationMs} ms; peak opacity window ${L.windowPeak}, room ${L.roomPeak}`);
  console.log('t_ms  f      window_op  room_op');
  for (const t of [0, 20, 40, 60, 80, 100, 120, 160, 240, 360, 480, 600]) console.log(`${String(t).padStart(4)}  ${pulseFactor(t).toFixed(3)}  ${(L.windowPeak * pulseFactor(t)).toFixed(4)}     ${(L.roomPeak * pulseFactor(t)).toFixed(4)}`);
  console.log('\nestimated peak lift in relative luminance (threshold of interest 0.10):');
  for (const r of estimate()) console.log(`${r.region.padEnd(44)} ${r.neutral} -> ${r.peak}  lift ${r.lift}`);
  const step = L.windowPeak / (L.peakMs / (1000 / 60));
  console.log(`\nrise per 60 Hz frame: window opacity +${step.toFixed(4)} (of ${L.windowPeak}); fall per frame: -${(L.windowPeak / ((L.durationMs - L.peakMs) / (1000 / 60))).toFixed(4)}`);
}
