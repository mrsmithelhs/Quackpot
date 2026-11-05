// Plan60 baseline exposure only. See baseline-preregistration.md; no ability or injury effects.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolveSeededRace } from '../../../src/core/race-resolver.mjs';

const pins = [
  ['src/core/race-resolver.mjs', 'e6b27be361810fd4dfbc00f4e043a6353fb4b75aa17f7acadd03cd606880e129'],
  ['src/core/prng.mjs', '7392e6c25ca356fbf253d9dfccd1562052577b2bfaca23720431b123364389a7'],
];
function checkPins() {
  for (const [path, expected] of pins) {
    const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
    if (actual !== expected) throw new Error(`source pin mismatch: ${path}`);
  }
}

export function measure(resolution) {
  const crossing = new Map(resolution.finishCrossings.map(x => [x.id, x.crossingTimeSeconds]));
  const playerFinish = crossing.get('P') ?? Infinity;
  const uniqueFrames = [...new Map(resolution.trajectory.map(frame => [frame.tick, frame])).values()].sort((a,b) => a.tick-b.tick);
  let leaderFrames = 0, followerFrames = 0, leaderEpisodes = 0, followerEpisodes = 0;
  let leaderSeconds = 0, followerSeconds = 0, leaderTargets = 0, followerTargets = 0, leaderSwitches = 0, followerSwitches = 0;
  let previousLeaderId = null, previousFollowerId = null;
  let priorLeader = false, priorFollower = false;
  const witness = { leader: null, follower: null };
  for (let i = 0; i < uniqueFrames.length - 1; i++) {
    const frame = uniqueFrames[i];
    const time = frame.tick * resolution.dt;
    const nextTime = uniqueFrames[i+1].tick * resolution.dt;
    if (time >= playerFinish) break;
    const player = frame.entrants.find(x => x.id === 'P');
    if (!player) throw new Error('missing player trajectory');
    const leader = [], follower = [];
    for (const other of frame.entrants) {
      if (other.id === 'P' || time >= (crossing.get(other.id) ?? Infinity)) continue;
      const gap = other.progress - player.progress;
      const distance = Math.hypot(other.x - player.x, other.y - player.y);
      if (distance > 4) continue;
      if (gap > 0 && gap <= 8 && other.speed > player.speed) leader.push({ id: other.id, distance });
      if (gap < 0 && gap >= -8) follower.push({ id: other.id, distance });
    }
    for (const candidates of [leader, follower]) candidates.sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
    if (leader.length) {
      const id = leader[0].id; leaderFrames++; if (!priorLeader) leaderEpisodes++;
      if (id !== previousLeaderId) { leaderTargets++; if (priorLeader) leaderSwitches++; }
      leaderSeconds += Math.max(0, Math.min(nextTime, playerFinish, crossing.get(id) ?? Infinity) - time);
      if (!witness.leader) witness.leader = { tick: frame.tick, id };
    }
    if (follower.length) {
      const id = follower[0].id; followerFrames++; if (!priorFollower) followerEpisodes++;
      if (id !== previousFollowerId) { followerTargets++; if (priorFollower) followerSwitches++; }
      followerSeconds += Math.max(0, Math.min(nextTime, playerFinish, crossing.get(id) ?? Infinity) - time);
      if (!witness.follower) witness.follower = { tick: frame.tick, id };
    }
    priorLeader = leader.length > 0; priorFollower = follower.length > 0;
    previousLeaderId = leader[0]?.id ?? null; previousFollowerId = follower[0]?.id ?? null;
  }
  const ownEvents = resolution.eventRecords.filter(e => e.participants?.includes('P'));
  const contacts = ownEvents.filter(e => e.type === 'duck-contact');
  const weaves = ownEvents.filter(e => e.type === 'weave-turn');
  if (new Set(contacts.map(e => e.id)).size !== contacts.length || new Set(weaves.map(e => e.id)).size !== weaves.length) throw new Error('duplicate event identity');
  const place = resolution.finish.find(x => x.id === 'P')?.place ?? null;
  return { status: resolution.status, unresolvedReason: resolution.unresolvedReason, horizonSeconds: resolution.horizonSeconds,
    playerFinish: Number.isFinite(playerFinish) ? playerFinish : null, place, contacts: contacts.length, weaves: weaves.length,
    leaderFrames, leaderEpisodes, leaderSeconds, leaderTargets, leaderSwitches,
    followerFrames, followerEpisodes, followerSeconds, followerTargets, followerSwitches,
    witness: { ...witness, contacts: contacts.map(e => ({ id: e.id, tick: e.tick })), weaves: weaves.map(e => ({ id: e.id, tick: e.tick })) } };
}

function run() {
  const [startText, endText, output] = process.argv.slice(2);
  const start = Number(startText), end = Number(endText);
  const valid = [[0,4], [4,32], [32,64], [64,96], [96,128]].some(([a,b]) => start === a && end === b);
  if (!valid || !output || !/^reports\/development\/plan-60-remaining-abilities-and-progression-study\/baseline-[a-z0-9-]+\.jsonl$/.test(output)) throw new Error('unsupported preregistered batch or output');
  checkPins();
  writeFileSync(output, JSON.stringify({ type: 'start', start, end, pins }) + '\n', { flag: 'wx' });
  const started = performance.now();
  try {
    for (let index = start; index < end; index++) {
      const seedIndex = Math.floor(index / 4), cell = index % 4;
      const input = { seed: `p60-${String(seedIndex).padStart(3,'0')}`, raceId: 'P60-baseline', playerBaseSpeed: 10,
        fieldBaseSpeed: cell < 2 ? 10 : 14, choice: cell % 2 ? 'sprint' : 'steady', restFactor: 1,
        trialCommitted: false, trialMultiplier: 1.05, experiment: 'weave-rank-strong-contact', dramaArm: 'R2combined-risk-only', studySprintMean: 1 };
      const result = measure(resolveSeededRace(input));
      if (seedIndex !== 0) delete result.witness;
      appendFileSync(output, JSON.stringify({ type: 'case', index, seedIndex, cell, ...result }) + '\n');
    }
    checkPins();
    appendFileSync(output, JSON.stringify({ type: 'complete', elapsedMs: performance.now() - started, memory: process.memoryUsage() }) + '\n');
  } catch (error) {
    appendFileSync(output, JSON.stringify({ type: 'failure', message: String(error), elapsedMs: performance.now() - started }) + '\n');
    throw error;
  }
}
if (process.argv[1]?.replaceAll('\\','/').endsWith('/baseline-runner.mjs')) run();
