// Course geometry and speed limits derived from the pinned Plan 23 resolver.
// Unmounted candidate; the full race loop is not here.
export const COURSE_LENGTH = 120 + 40 * Math.PI;
const wrap = (n, period) => ((n % period) + period) % period;

export function courseFrame(progress, lateral = 0) {
  if (!Number.isFinite(progress) || !Number.isFinite(lateral)) throw new RangeError('invalid course position');
  const s = wrap(progress + 30, COURSE_LENGTH), bend = 20 * Math.PI;
  let x, y, tx, ty, side = 0;
  if (s < 60) { x = -30 + s; y = -20; tx = 1; ty = 0; }
  else if (s < 60 + bend) {
    const a = -Math.PI / 2 + (s - 60) / 20;
    x = 30 + 20 * Math.cos(a); y = 20 * Math.sin(a); tx = -Math.sin(a); ty = Math.cos(a); side = 1;
  } else if (s < 120 + bend) { x = 30 - (s - 60 - bend); y = 20; tx = -1; ty = 0; }
  else {
    const a = Math.PI / 2 + (s - 120 - bend) / 20;
    x = -30 + 20 * Math.cos(a); y = 20 * Math.sin(a); tx = -Math.sin(a); ty = Math.cos(a); side = -1;
  }
  return { x: x - ty * lateral, y: y + tx * lateral, tx, ty, side,
    radius: side ? 20 - lateral * side : null };
}

export function turnCap(speed) {
  if (!Number.isFinite(speed) || speed < 0) throw new RangeError('invalid speed');
  return Math.max(30, 90 - 5 * speed);
}

export function curveTargetSpeed(radius) {
  if (!Number.isFinite(radius) || radius <= 0) throw new RangeError('invalid radius');
  let low = 0, high = 12;
  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2;
    if (mid / radius * 180 / Math.PI <= turnCap(mid)) low = mid;
    else high = mid;
  }
  return low;
}

export function recenterCorrectionDeg(error) {
  if (!Number.isFinite(error)) throw new RangeError('invalid cross-track error');
  return Math.max(-20, Math.min(20, Math.atan2(-error, 10) * 180 / Math.PI));
}

export function nextCurveDistance(progress) {
  if (!Number.isFinite(progress)) throw new RangeError('invalid progress');
  const s = wrap(progress + 30, COURSE_LENGTH), bend = 20 * Math.PI;
  if (s < 60) return 60 - s;
  if (s < 60 + bend) return 0;
  if (s < 120 + bend) return 120 + bend - s;
  return 0;
}

/** v1 braking lookahead and cap; injury is already composed in topSpeed. */
export function targetSpeed(topSpeed, progress, lateral, speed, leaderSlowdown = false) {
  if (![topSpeed, progress, lateral, speed].every(Number.isFinite) || topSpeed < 0 || speed < 0 || Math.abs(lateral) >= 20 || typeof leaderSlowdown !== 'boolean') throw new RangeError('invalid speed context');
  const corner = curveTargetSpeed(20 - Math.abs(lateral));
  const stopping = Math.max(0, (speed * speed - corner * corner) / 12);
  const limited = nextCurveDistance(progress) <= stopping + speed * 0.05 ? Math.min(topSpeed, corner) : topSpeed;
  return { topSpeed, cornerSpeed: corner, targetSpeed: limited * (leaderSlowdown ? 0.8 : 1) };
}

/** Rebuild a linearized world velocity from the current course frame and heading. */
export function linearizeEntrant(entrant) {
  const frame = courseFrame(entrant.progress, entrant.lateral);
  let vx = entrant.speed * Math.cos(entrant.heading), vy = entrant.speed * Math.sin(entrant.heading);
  const normal = -vx * frame.ty + vy * frame.tx;
  // A continuing wall constraint suppresses only outward local normal motion.
  // Store this as a local physical constraint, not an angle-roundtrip equality.
  const constrained = entrant.wallConstrained && Math.abs(entrant.lateral) === 6 && normal * Math.sign(entrant.lateral) > 0;
  if (constrained) {
    const tangent = vx * frame.tx + vy * frame.ty;
    vx = tangent * frame.tx; vy = tangent * frame.ty;
  }
  return { ...entrant, x: frame.x, y: frame.y, vx, vy,
    progressVelocity: vx * frame.tx + vy * frame.ty,
    lateralVelocity: constrained ? 0 : -vx * frame.ty + vy * frame.tx };
}

/** Project impulse back to heading/speed; retain steering/recovery state unchanged. */
export function applyWorldVelocity(entrant, vx, vy) {
  if (![vx, vy].every(Number.isFinite)) throw new RangeError('invalid velocity');
  return { ...entrant, speed: Math.hypot(vx, vy), heading: Math.atan2(vy, vx) };
}

export function advanceCourse(entrant, dt) {
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('invalid time');
  const linear = linearizeEntrant(entrant);
  return { ...entrant, progress: entrant.progress + linear.progressVelocity * dt,
    lateral: entrant.lateral + linear.lateralVelocity * dt };
}

/** Apply the selected steering turn before physical movement. */
export function steerEntrant(entrant, tick, rank, assisted) {
  if (!entrant || !Number.isSafeInteger(tick) || tick < 0 || !Number.isSafeInteger(rank) || rank < 1
      || typeof assisted !== 'boolean' || !Number.isFinite(entrant.assignedLaneOffset)) throw new RangeError('invalid steering context');
  const e = structuredClone(entrant), frame = courseFrame(e.progress, e.lateral);
  const tangent = Math.atan2(frame.ty, frame.tx);
  const delta = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
  const error = e.lateral - e.assignedLaneOffset;
  const episode = e.steeringEpisode;
  let target = tangent + recenterCorrectionDeg(error) * Math.PI / 180;
  let cap = turnCap(e.speed);
  if (assisted && (!episode || episode.phase === 'recover')) {
    target = tangent + Math.max(-20, Math.min(20, Math.atan2(-error, 6) * 180 / Math.PI)) * Math.PI / 180;
    cap = Math.min(90, cap * 1.5);
  }
  if (episode && ['acquire', 'hold'].includes(episode.phase)) target = tangent + episode.sign * episode.targetOffsetDeg * Math.PI / 180;
  const turn = delta(target, e.heading);
  e.heading += Math.sign(turn) * Math.min(Math.abs(turn), cap * Math.PI / 180 * 0.05);
  return e;
}

/** Advance acquisition, hold and recovery after movement, as in Plan 23. */
export function advanceSteeringEpisode(entrant, tick, rank) {
  if (!entrant || !Number.isSafeInteger(tick) || tick < 0 || !Number.isSafeInteger(rank) || rank < 1
      || !Number.isFinite(entrant.assignedLaneOffset)) throw new RangeError('invalid steering context');
  const e = structuredClone(entrant), frame = courseFrame(e.progress, e.lateral);
  const tangent = Math.atan2(frame.ty, frame.tx);
  const delta = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
  const error = e.lateral - e.assignedLaneOffset;
  const episode = e.steeringEpisode;
  if (!episode) return e;
  const offset = Math.abs(delta(e.heading, tangent)) * 180 / Math.PI;
  const target = ['acquire', 'hold'].includes(episode.phase)
    ? tangent + episode.sign * episode.targetOffsetDeg * Math.PI / 180
    : tangent + recenterCorrectionDeg(error) * Math.PI / 180;
  const atTarget = Math.abs(delta(target, e.heading)) * 180 / Math.PI <= 1;
  if (episode.phase === 'acquire') {
    if (atTarget && offset >= 10) {
      episode.phase = 'hold'; episode.heldTicks = 0;
      if (episode.kind === 'weave' && rank <= 2 && e.leaderSlowdownCount < 2 && e.leaderSlowdownUntil <= tick) {
        e.leaderSlowdownCount++; e.leaderSlowdownUntil = tick + 21;
      }
    } else if (tick - episode.startTick >= 20) episode.phase = 'recover';
  } else if (episode.phase === 'hold') {
    if (!atTarget || offset < 10) episode.phase = 'recover';
    else if (++episode.heldTicks >= 10) episode.phase = 'recover';
  } else if (episode.phase === 'recover') {
    const aligned = Math.abs(delta(target, e.heading)) * 180 / Math.PI <= 1;
    episode.centeredTicks = Math.abs(error) <= 0.25 && aligned ? (episode.centeredTicks ?? 0) + 1 : 0;
    if (episode.centeredTicks >= 3) e.steeringEpisode = null;
  } else throw new RangeError('invalid steering phase');
  return e;
}

/** Plan 23 endpoint wall response, independent of boundary ordering. */
export function resolveWallEndpoint(entrant, tick, atBoundary = false) {
  if (!entrant || !Number.isSafeInteger(tick) || tick < 0
      || ![entrant.progress, entrant.lateral, entrant.speed, entrant.heading].every(Number.isFinite)
      || entrant.speed < 0 || typeof entrant.wallEpisode !== 'boolean' || typeof atBoundary !== 'boolean') throw new RangeError('invalid wall context');
  let e = structuredClone(entrant);
  if (Math.abs(e.lateral) < 6 || (Math.abs(e.lateral) === 6 && !atBoundary) || e.wallEpisode) {
    if (Math.abs(e.lateral) < 5.95) e.wallEpisode = false;
    return { entrant: e, event: null };
  }
  const side = Math.sign(e.lateral), frame = courseFrame(e.progress, e.lateral);
  const vx = e.speed * Math.cos(e.heading), vy = e.speed * Math.sin(e.heading);
  const normalV = -vx * frame.ty + vy * frame.tx, tangentV = vx * frame.tx + vy * frame.ty;
  const closing = normalV * side, speedBefore = e.speed;
  e.lateral = side * 6;
  if (closing > 0) {
    const normal = -normalV * 0.25, tangent = tangentV * 0.9;
    e = applyWorldVelocity(e, frame.tx * tangent - frame.ty * normal,
      frame.ty * tangent + frame.tx * normal);
  }
  e.wallEpisode = true;
  return { entrant: e, event: { kind: closing > 0 ? 'wall-impact' : 'wall-overlap',
    participantId: e.id, tick, closingSpeed: closing, speedBefore, speedAfter: e.speed } };
}
