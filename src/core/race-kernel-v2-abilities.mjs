// Plan 55 diagnostic parameters, not adopted balance. No presentation side effects.
export const ABILITY_PARAMETERS = Object.freeze({
  intervalTicks: 5, rearmAbsentChecks: 2, activationProbability: 0.75,
  bounceRiseTicks: 2, bounceAirTicks: 10, bounceLandingTicks: 2,
  cooldownTicks: 40, crowdTicks: 10, crowdAcceleration: 1.5,
});

export function bouncePhase(state, tick) {
  if (state.startTick === null) return 'idle';
  const age = tick - state.startTick;
  if (age < 0) throw new RangeError('tick before ability start');
  if (age < 2) return 'rising';
  if (age < 12) return 'airborne';
  if (age < 14) return 'landing';
  return 'idle';
}

export function isProtected(state, tick) {
  return ['rising', 'airborne', 'landing'].includes(bouncePhase(state, tick));
}

export function injuryChance(stance, injured, protectedNow) {
  if (!['steady', 'sprint'].includes(stance) || typeof injured !== 'boolean' || typeof protectedNow !== 'boolean') throw new TypeError('invalid injury context');
  return injured || protectedNow ? 0 : stance === 'steady' ? 0.05 : 0.1;
}

/** Course distance wraps; finished or airborne participants cannot be crowd neighbors. */
export function crowdNeighbors(entrant, entrants, courseLength) {
  if (!Number.isFinite(courseLength) || courseLength <= 0) throw new RangeError('invalid course length');
  return entrants.filter((other) => {
    if (other.id === entrant.id || other.finished || other.airborne) return false;
    const difference = Math.abs(other.progress - entrant.progress) % courseLength;
    return Math.min(difference, courseLength - difference) <= 8
      && Math.hypot(other.x - entrant.x, other.y - entrant.y) <= 4;
  }).map((e) => e.id).sort();
}

/** Acceleration changes approach to the current target, never the target itself. */
export function acceleratedSpeed(speed, target, acceleration, dt, crowdActive) {
  if (![speed, target, acceleration, dt].every(Number.isFinite) || speed < 0 || target < 0 || acceleration < 0 || dt < 0 || typeof crowdActive !== 'boolean') throw new RangeError('invalid acceleration');
  return speed >= target ? speed : Math.min(target, speed + (acceleration + (crowdActive ? 1.5 : 0)) * dt);
}

/** Present-state closest approach only; no access to future trajectories. */
export function bounceThreat(entrant, entrants, courseLength) {
  const candidates = [];
  for (const other of entrants) {
    if (other.id === entrant.id || other.finished || other.airborne) continue;
    const arc = Math.abs(entrant.progress - other.progress) % courseLength;
    if (Math.min(arc, courseLength - arc) > 8) continue;
    const dx = other.x - entrant.x, dy = other.y - entrant.y;
    const vx = other.vx - entrant.vx, vy = other.vy - entrant.vy;
    const d = Math.hypot(dx, dy), v2 = vx * vx + vy * vy;
    if (d <= 1 || d > 6 || !v2) continue;
    const time = -(dx * vx + dy * vy) / v2;
    if (time <= 0 || time > 0.5) continue;
    const separation = Math.hypot(dx + time * vx, dy + time * vy);
    if (separation < 1.2) candidates.push({ id: other.id, time, separation });
  }
  candidates.sort((a, b) => a.separation - b.separation || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return candidates[0] ?? null;
}

/** One attempt per latched opportunity, including a declined roll. */
export function sampleOpportunity(previous, { tick, eligible, roll }) {
  if (!Number.isSafeInteger(tick) || tick < 0 || typeof eligible !== 'boolean' || !Number.isFinite(roll) || roll < 0 || roll >= 1) throw new RangeError('invalid opportunity');
  if (!previous || typeof previous.latched !== 'boolean'
      || !Number.isSafeInteger(previous.absentChecks) || previous.absentChecks < 0 || previous.absentChecks > 2
      || !Number.isSafeInteger(previous.opportunity) || previous.opportunity < 0
      || !Number.isSafeInteger(previous.cooldownUntil) || previous.cooldownUntil < 0
      || !Number.isSafeInteger(previous.activeUntil) || previous.activeUntil < 0) throw new RangeError('invalid opportunity state');
  const next = { ...previous };
  if (tick % 5 !== 0) return { state: next, attempted: false, activated: false };
  if (!eligible) {
    next.absentChecks = Math.min(2, next.absentChecks + 1);
    if (next.absentChecks >= 2) next.latched = false;
    return { state: next, attempted: false, activated: false };
  }
  next.absentChecks = 0;
  if (next.latched || tick < next.cooldownUntil || next.activeUntil > tick) return { state: next, attempted: false, activated: false };
  next.latched = true; next.opportunity += 1;
  return { state: next, attempted: true, activated: roll < 0.75 };
}

/** Advance a single participant's diagnostic ability state at a tick boundary. */
export function advanceAbility(previous, { kind, tick, eligible, draw }) {
  if (!['bounce', 'crowd'].includes(kind) || !Number.isSafeInteger(tick) || tick < 0
      || typeof eligible !== 'boolean' || typeof draw !== 'function' || !previous
      || !Number.isSafeInteger(previous.activeUntil) || !Number.isSafeInteger(previous.cooldownUntil)
      || !(previous.startTick === null || Number.isSafeInteger(previous.startTick))) throw new RangeError('invalid ability transition');
  let state = { ...previous };
  const events = [];
  if (state.startTick !== null && tick >= state.activeUntil) {
    events.push({ kind: 'termination', ability: kind, tick });
    state.startTick = null;
    state.cooldownUntil = tick + ABILITY_PARAMETERS.cooldownTicks;
  }
  const probe = sampleOpportunity(state, { tick, eligible, roll: 0 });
  if (!probe.attempted) return { state: probe.state, events };
  const evidence = draw(probe.state.opportunity);
  if (!evidence || !Number.isFinite(evidence.value) || evidence.value < 0 || evidence.value >= 1 || typeof evidence.key !== 'string') throw new RangeError('invalid ability draw');
  const decision = sampleOpportunity(state, { tick, eligible, roll: evidence.value });
  state = decision.state;
  events.push({ kind: 'opportunity', ability: kind, tick, opportunity: state.opportunity,
    activated: decision.activated, draw: evidence.value, key: evidence.key });
  if (decision.activated) {
    state.startTick = tick;
    state.activeUntil = tick + (kind === 'bounce' ? 14 : ABILITY_PARAMETERS.crowdTicks);
    events.push({ kind: 'activation', ability: kind, tick, opportunity: state.opportunity });
  }
  return { state, events };
}
