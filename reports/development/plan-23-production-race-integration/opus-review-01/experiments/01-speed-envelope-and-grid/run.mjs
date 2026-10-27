import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

// Opus-authored diagnostic. Loads an in-memory copy of the accepted Plan 13
// reference; never writes outside this folder and never edits the source file.
const here = import.meta.dirname;
const repoRoot = resolve(here, '../../../../../..');
const sourcePath = resolve(repoRoot, 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs');
const source = await readFile(sourcePath, 'utf8');
const sourceSha256 = createHash('sha256').update(source).digest('hex');
const prngUrl = pathToFileURL(resolve(repoRoot, 'src/core/prng.mjs')).href;

function patch(code, from, to) {
  if (!code.includes(from)) throw new Error(`patch anchor missing: ${from}`);
  return code.replace(from, to);
}

// options.map: rating->internal topSpeed (string expression in x); default identity, no clamp.
// options.playerRow: move the player to this start row (swaps with the rival occupying it, same lane).
async function load({ map = 'x', playerRow = 0 } = {}) {
  let code = patch(source, "from '../../../src/core/prng.mjs'", `from '${prngUrl}'`);
  code = patch(code, 'topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),', `topSpeed: ((x) => (${map}))(sampled),`);
  if (playerRow !== 0) {
    // P is lane 2 row 0; the lane-2 rival in the target row moves to row 0. Draw order (array order) is unchanged.
    const rival = { 1: 'C', 2: 'E' }[playerRow];
    code = patch(code, "{ id: 'P', name: 'Player', lane: 2, row: 0, player: true }", `{ id: 'P', name: 'Player', lane: 2, row: ${playerRow}, player: true }`);
    code = patch(code, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: ${playerRow} }`, `{ id: '${rival}', name: 'Rival ${rival}', lane: 2, row: 0 }`);
  }
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const ref = await load();
const { PHYSICS, curveTargetSpeed, COURSE_LENGTH } = ref;

// --- Part A: solo-lap envelope. Field speed 0.5 so the player always leads; no weave, control contact.
function segmentOf(progress) {
  const s = ((progress + PHYSICS.straight / 2) % COURSE_LENGTH + COURSE_LENGTH) % COURSE_LENGTH;
  const bend = Math.PI * PHYSICS.curveRadius;
  if (progress < PHYSICS.straight / 2) return 'opening half-straight';
  if (s < PHYSICS.straight + bend && s >= PHYSICS.straight) return progress < COURSE_LENGTH / 2 ? 'first bend' : 'second bend';
  if (progress >= COURSE_LENGTH - PHYSICS.straight / 2) return 'closing half-straight';
  return 'middle straight';
}
function soloLap(mod, v, experiment) {
  const race = mod.resolveSeededRace({ seed: 'opus-envelope', raceId: 'ENV', playerBaseSpeed: v, fieldBaseSpeed: 0.5, choice: 'steady', trialCommitted: false, experiment });
  // steady stance samples ±5%; recover the exact sampled topSpeed to report it honestly.
  const p = race.entrants.find((e) => e.id === 'P');
  const maxBySegment = {};
  let atTopTicks = 0; let curveSeconds = 0;
  for (let i = 1; i < race.trajectory.length; i += 1) {
    const st = race.trajectory[i].entrants.find((e) => e.id === 'P');
    const seg = segmentOf(st.progress);
    maxBySegment[seg] = Math.max(maxBySegment[seg] ?? 0, st.speed);
    if (Math.abs(st.speed - p.topSpeed) < 1e-3) atTopTicks += 1;
    if (seg.includes('bend')) curveSeconds += race.trajectory[i].tick - race.trajectory[i - 1].tick;
  }
  return { sampledTopSpeed: p.topSpeed, finish: race.finishTimeSeconds, status: race.status,
    shareOfLapAtTopSpeed: atTopTicks / (race.trajectory.length - 1), bendSeconds: curveSeconds * PHYSICS.dt, maxSpeedBySegment: maxBySegment };
}

// Analytic reachable maximum per straight segment (constant accel a, braking b, corner speed c).
const a = PHYSICS.baseAcceleration; const b = PHYSICS.braking;
const c = curveTargetSpeed(PHYSICS.curveRadius - PHYSICS.laneOffset);
const reach = {
  cornerTargetAtLaneOffset: c,
  cornerTargetAtCentre: curveTargetSpeed(PHYSICS.curveRadius),
  openingHalfStraightFromStartSpeed6: Math.sqrt((PHYSICS.straight / 2 + 36 / (2 * a) + c * c / (2 * b)) / (1 / (2 * a) + 1 / (2 * b))),
  middleStraightFromCorner: Math.sqrt((PHYSICS.straight + c * c / (2 * a) + c * c / (2 * b)) / (1 / (2 * a) + 1 / (2 * b))),
  closingHalfStraightFromCorner: Math.sqrt(c * c + 2 * a * PHYSICS.straight / 2),
  bendLengthShareOfLap: (2 * Math.PI * PHYSICS.curveRadius) / COURSE_LENGTH,
};

const speeds = []; for (let v = 6; v <= 26.001; v += 1) speeds.push(Number(v.toFixed(2)));
const envelope = { noWeave: [], selectedWeaveContact: [] };
for (const v of speeds) {
  envelope.noWeave.push({ ratingInput: v, ...soloLap(ref, v, 'controller-recenter') });
  envelope.selectedWeaveContact.push({ ratingInput: v, ...soloLap(ref, v, 'weave-rank-strong-contact') });
}
// Marginal value of +5% at representative affine-mapped internal speeds (solo, no weave).
const affine = (x) => 8.25 + 0.5 * x;
const marginal = [5, 7.5, 10, 14, 20].map((r) => {
  const base = soloLap(ref, affine(r), 'controller-recenter');
  const boosted = soloLap(ref, affine(r * 1.05), 'controller-recenter');
  const rawBase = soloLap(ref, r, 'controller-recenter');
  const rawBoosted = soloLap(ref, r * 1.05, 'controller-recenter');
  return { rating: r, affine: { base: base.finish, boosted: boosted.finish, secondsSaved: base.finish - boosted.finish },
    identity: { base: rawBase.finish, boosted: rawBoosted.finish, secondsSaved: rawBase.finish - rawBoosted.finish } };
});

// --- Part B: start-grid bias. Player and field share the same rating; only start row differs.
const gridSeeds = Array.from({ length: 300 }, (_, i) => `opus-grid-${String(i + 1).padStart(3, '0')}`);
const grid = {};
for (const row of [0, 1, 2]) {
  const mod = row === 0 ? ref : await load({ playerRow: row });
  for (const [label, rating] of [['equal-at-finale-11.2', 11.2], ['equal-at-common-10', 10]]) {
    for (const [mapName, map] of [['identity', 'x'], ['affine', '8.25 + 0.5 * x']]) {
      const m = mapName === 'identity' ? mod : await load({ playerRow: row, map });
      let wins = 0; let placeSum = 0;
      for (const seed of gridSeeds) {
        const race = m.resolveSeededRace({ seed, raceId: 'R03', playerBaseSpeed: rating, fieldBaseSpeed: rating, choice: 'steady', trialCommitted: false, experiment: 'weave-rank-strong-contact' });
        const place = race.finish.find((e) => e.id === 'P').place;
        wins += place === 1 ? 1 : 0; placeSum += place;
      }
      grid[`row${row}|${label}|${mapName}`] = { playerRow: row, rating, map: mapName, races: gridSeeds.length, winRate: wins / gridSeeds.length, meanPlace: placeSum / gridSeeds.length, fairShareWinRate: 1 / 6, fairMeanPlace: 3.5 };
    }
  }
}

const out = { provenance: { sourcePath: 'reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs', sourceSha256,
  substitutions: ['PRNG import URL', 'sampled topSpeed clamp replaced by named map (identity unless stated)', 'Part B only: player start row swapped with same-lane rival'],
  note: 'Solo laps use fieldBaseSpeed 0.5 so the player leads; steady stance still samples ±5%, so sampledTopSpeed is reported.' },
  analyticReach: reach, envelope, marginalBoostSolo: marginal, startGridBias: grid };
await writeFile(resolve(here, 'results.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ analyticReach: reach,
  envelopeNoWeave: envelope.noWeave.map((r) => [r.ratingInput, r.sampledTopSpeed, r.finish, Number(r.shareOfLapAtTopSpeed.toFixed(3)), r.maxSpeedBySegment]),
  envelopeWeave: envelope.selectedWeaveContact.map((r) => [r.ratingInput, r.finish]), marginal, grid }, null, 1));
