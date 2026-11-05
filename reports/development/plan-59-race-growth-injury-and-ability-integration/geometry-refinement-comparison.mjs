import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { COURSE_LENGTH, courseFrame } from '../../../src/core/race-kernel-v2-physics.mjs';
import { findOvalContact } from '../../../src/core/race-kernel-v2-boundaries.mjs';

const paths = ['src/core/race-kernel-v2-physics.mjs', 'src/core/race-kernel-v2-boundaries.mjs', 'src/core/race-kernel-v2.test.mjs', 'reports/development/plan-59-race-growth-injury-and-ability-integration/geometry-refinement-comparison.mjs', 'reports/development/plan-59-race-growth-injury-and-ability-integration/geometry-diagnostic-result.json'];
const hashes = Object.fromEntries(paths.map((p) => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]));
const cases = [];
for (const [where, progress] of [['straight', 0], ['bend', 50], ['entry', 29.95], ['exit', 30 + Math.PI * 20 - 0.05], ['finish', COURSE_LENGTH - 0.05]]) {
  for (const lateral of [-5, 0, 5]) for (const mode of ['closing', 'grazing', 'nonclosing']) {
    const f = courseFrame(progress, lateral), heading = Math.atan2(f.ty, f.tx);
    const a = { progress, lateral, speed: mode === 'nonclosing' ? 1 : 12, heading };
    const b = { progress: progress + 1.1, lateral: lateral + (mode === 'grazing' ? 0.9 : 0), speed: mode === 'nonclosing' ? 12 : 1, heading };
    cases.push({ id: `${where}/${lateral}/${mode}`, result: findOvalContact(a, b, 0.05) });
  }
}
writeFileSync('reports/development/plan-59-race-growth-injury-and-ability-integration/geometry-refinement-result.json', JSON.stringify({ runtime: process.version, hashes, cases }, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(Object.fromEntries(['contact', 'clear', 'initial-overlap', 'initial-contact', 'unresolved'].map((s) => [s, cases.filter((c) => c.result.status === s).length]))));
