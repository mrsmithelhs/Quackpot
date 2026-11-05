import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { COURSE_LENGTH, courseFrame, linearizeEntrant, advanceCourse } from '../../../src/core/race-kernel-v2-physics.mjs';
import { sweptContact } from '../../../src/core/race-kernel-v2-boundaries.mjs';

const pins = ['src/core/race-kernel-v2-physics.mjs', 'src/core/race-kernel-v2-boundaries.mjs', 'reports/development/plan-59-race-growth-injury-and-ability-integration/geometry-diagnostic.mjs', 'reports/development/plan-59-race-growth-injury-and-ability-integration/geometry-protocol.md'];
const hashes = Object.fromEntries(pins.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
const cases = [];
for (const [where, progress] of [['straight', 0], ['bend', 50], ['entry', 29.95], ['exit', 30 + Math.PI * 20 - 0.05], ['finish', COURSE_LENGTH - 0.05]]) {
  for (const lateral of [-5, 0, 5]) for (const mode of ['closing', 'grazing', 'nonclosing']) {
    const heading = Math.atan2(courseFrame(progress, lateral).ty, courseFrame(progress, lateral).tx);
    const a = { progress, lateral, speed: mode === 'nonclosing' ? 1 : 12, heading };
    const b = { progress: progress + 1.1, lateral: lateral + (mode === 'grazing' ? 0.9 : 0), speed: mode === 'nonclosing' ? 12 : 1, heading };
    const al = linearizeEntrant(a), bl = linearizeEntrant(b);
    const predicted = sweptContact(al, bl, 0.05);
    const distance = (t) => {
      const x = linearizeEntrant(advanceCourse(a, t)), y = linearizeEntrant(advanceCourse(b, t));
      return Math.hypot(x.x - y.x, x.y - y.y);
    };
    let minimum = Infinity, first = null;
    for (let i = 0; i <= 200; i++) {
      const t = i * 0.05 / 200, d = distance(t);
      minimum = Math.min(minimum, d);
      if (first === null && d <= 1) first = t;
    }
    cases.push({ id: `${where}/${lateral}/${mode}`, predicted, predictedResidual: predicted === null ? null : distance(predicted) - 1,
      firstSampledPenetration: first, sampledDelay: predicted === null || first === null ? null : first - predicted,
      minimumSampledSeparation: minimum, initialSeparation: distance(0),
      crossesFinish: progress < COURSE_LENGTH && advanceCourse(a, 0.05).progress >= COURSE_LENGTH });
  }
}
const result = { protocol: 'plan59-geometry-diagnostic/v1', runtime: process.version, hashes, cases };
writeFileSync('reports/development/plan-59-race-growth-injury-and-ability-integration/geometry-diagnostic-result.json', JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ cases: cases.length, predictions: cases.filter((c) => c.predicted !== null).length,
  maxResidual: Math.max(...cases.map((c) => Math.abs(c.predictedResidual ?? 0))),
  predictedWithoutSampledPenetration: cases.filter((c) => c.predicted !== null && c.firstSampledPenetration === null).length,
  sampledPenetrationWithoutPrediction: cases.filter((c) => c.predicted === null && c.firstSampledPenetration !== null).length }));
