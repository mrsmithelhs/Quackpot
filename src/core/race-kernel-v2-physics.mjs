// Course geometry and speed limits derived from the pinned Plan 23 resolver.
// Unmounted candidate; the weave, R2 controller and full race loop are not here.
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
  const vx = entrant.speed * Math.cos(entrant.heading), vy = entrant.speed * Math.sin(entrant.heading);
  return { ...entrant, x: frame.x, y: frame.y, vx, vy,
    progressVelocity: vx * frame.tx + vy * frame.ty,
    lateralVelocity: -vx * frame.ty + vy * frame.tx };
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
