import { createRng } from '../../../../src/core/prng.mjs';

export const PHYSICS = Object.freeze({
  version: 'plan13-physics-v3',
  dt: 0.05,
  straight: 60,
  curveRadius: 20,
  corridorHalfWidth: 6,
  laneOffset: 0.6,
  rowSpacing: 4,
  duckRadius: 0.5,
  contactReleaseDistance: 1.2,
  restitution: 0.25,
  wallTangentialDamping: 0.9,
  baseAcceleration: 3,
  braking: 6,
  maxSpeed: 12,
  minSpeed: 8,
  maxTurnRateDeg: 90,
  turnRateSlope: 5,
  minTurnRateDeg: 30,
  collisionDeflectionDeg: 6,
  strongContactMinDeg: 15,
  strongContactMaxDeg: 20,
  weaveMinDeg: 12,
  weaveMaxDeg: 16,
  weaveFrontIntervalTicks: 60,
  weaveRearIntervalTicks: 120,
  weaveInitialPhaseTicks: 60,
  weaveHoldTicks: 10,
  steeringAcquireTimeoutTicks: 20,
  recoveryLookaheadMeters: 10,
  recoveryMaxCorrectionDeg: 20,
  recoveryLateralTolerance: 0.25,
  recoveryHeadingToleranceDeg: 1,
  recoverySettleTicks: 3,
  maxTicks: 800,
  maxMechanicalEvents: 128,
  maxOpportunityDiagnostics: 84,
  payoutByPlace: Object.freeze([50, 20, 10]),
});

const CHOICES = new Set(['steady', 'sprint', 'drafting']);
const EXPERIMENTS = Object.freeze({
  'controller-tangent': Object.freeze({ controller: 'tangent', weaving: 'none', contact: 'control' }),
  'controller-recenter': Object.freeze({ controller: 'recenter', weaving: 'none', contact: 'control' }),
  'weave-symmetric': Object.freeze({ controller: 'recenter', weaving: 'symmetric', contact: 'control' }),
  'weave-rank-weighted': Object.freeze({ controller: 'recenter', weaving: 'rank-weighted', contact: 'control' }),
  'contact-6deg': Object.freeze({ controller: 'recenter', weaving: 'none', contact: 'control' }),
  'contact-15-20deg': Object.freeze({ controller: 'recenter', weaving: 'none', contact: 'strong' }),
  'weave-rank-strong-contact': Object.freeze({ controller: 'recenter', weaving: 'rank-weighted', contact: 'strong' }),
});
const EXPERIMENT_NAMES = new Set(Object.keys(EXPERIMENTS));
const ENTRANTS = Object.freeze([
  { id: 'A', name: 'Rival A', lane: 1, row: 0 },
  { id: 'P', name: 'Player', lane: 2, row: 0, player: true },
  { id: 'B', name: 'Rival B', lane: 1, row: 1 },
  { id: 'C', name: 'Rival C', lane: 2, row: 1 },
  { id: 'D', name: 'Rival D', lane: 1, row: 2 },
  { id: 'E', name: 'Rival E', lane: 2, row: 2 },
]);

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const wrap = (n, period) => ((n % period) + period) % period;
export const COURSE_LENGTH = 2 * PHYSICS.straight + 2 * Math.PI * PHYSICS.curveRadius;
const COURSE_START = PHYSICS.straight / 2;

function validate(input) {
  if (!input || typeof input !== 'object') throw new TypeError('race input is required');
  if (typeof input.seed !== 'string' || !input.seed.trim()) throw new TypeError('seed must be a non-empty string');
  if (typeof input.raceId !== 'string' || !input.raceId.trim()) throw new TypeError('raceId must be a non-empty string');
  if (!CHOICES.has(input.choice)) throw new RangeError(`unsupported choice: ${input.choice}`);
  if (!EXPERIMENT_NAMES.has(input.experiment)) throw new RangeError(`unsupported experiment: ${input.experiment}`);
  if (!Number.isFinite(input.playerBaseSpeed) || input.playerBaseSpeed <= 0) throw new RangeError('playerBaseSpeed must be positive');
  if (!Number.isFinite(input.fieldBaseSpeed) || input.fieldBaseSpeed <= 0) throw new RangeError('fieldBaseSpeed must be positive');
}

function eventDraw(seed, raceId, tick, kind, ids = 'field', episode = 0) {
  const stableIds = [...String(ids).split(/[;,]/)].sort().join(',');
  const key = `plan13/v2|${raceId}|${tick}|${kind}|${stableIds}|${episode}`;
  return { key, value: createRng(seed).fork(key).next() };
}

function latentDraw(seed, raceId, kind, entrantId, opportunityIndex = 0) {
  const key = `plan13/v3|${raceId}|${kind}|${entrantId}|${opportunityIndex}`;
  return { key, value: createRng(seed).fork(key).next() };
}

function adapter(x) { return 8.25 + 0.5 * x; }
function makeEntrants(input) {
  const root = createRng(input.seed).fork(`plan13/v2/race:${input.raceId}`);
  const performance = root.fork('performance');
  return ENTRANTS.map((spec) => {
    const draw = performance.next();
    const base = spec.player
      ? input.playerBaseSpeed * (input.trialCommitted ? 1.05 : 1)
      : input.fieldBaseSpeed;
    const sampled = spec.player && input.choice === 'sprint'
      ? base * (input.studySprintMean ?? 1.1) * (1 + (2 * draw - 1) * 0.2)
      : base * (1 + (2 * draw - 1) * 0.05);
    const rowProgress = -spec.row * PHYSICS.rowSpacing;
    return {
      ...spec,
      performanceDraw: draw,
      sampledPerformance: sampled,
      topSpeed: adapter(sampled),
      speed: 6,
      progress: rowProgress,
      assignedLaneOffset: spec.lane === 1 ? -PHYSICS.laneOffset : PHYSICS.laneOffset,
      lateral: spec.lane === 1 ? -PHYSICS.laneOffset : PHYSICS.laneOffset,
      heading: 0,
      acceleration: PHYSICS.baseAcceleration,
      wallEpisode: false,
      steeringEpisode: null,
      nextWeaveTick: null,
      weaveOpportunityIndex: 0, leaderSlowdownCount: 0, leaderSlowdownUntil: 0, leaderSlowdownEventRecord: null, leaderSlowdownTicks: 0, leaderSlowdownSpeedDelta: 0,
    };
  });
}

function frameAt(progress, lateral = 0) {
  const s = wrap(progress + COURSE_START, COURSE_LENGTH);
  const straight = PHYSICS.straight;
  const curveLength = Math.PI * PHYSICS.curveRadius;
  let x; let y; let tx; let ty; let curve = false; let side = 0;
  if (s < straight) {
    x = -straight / 2 + s; y = -PHYSICS.curveRadius; tx = 1; ty = 0;
  } else if (s < straight + curveLength) {
    const angle = -Math.PI / 2 + (s - straight) / PHYSICS.curveRadius;
    x = straight / 2 + PHYSICS.curveRadius * Math.cos(angle);
    y = PHYSICS.curveRadius * Math.sin(angle);
    tx = -Math.sin(angle); ty = Math.cos(angle); curve = true; side = 1;
  } else if (s < 2 * straight + curveLength) {
    const offset = s - straight - curveLength;
    x = straight / 2 - offset; y = PHYSICS.curveRadius; tx = -1; ty = 0;
  } else {
    const angle = Math.PI / 2 + (s - 2 * straight - curveLength) / PHYSICS.curveRadius;
    x = -straight / 2 + PHYSICS.curveRadius * Math.cos(angle);
    y = PHYSICS.curveRadius * Math.sin(angle);
    tx = -Math.sin(angle); ty = Math.cos(angle); curve = true; side = -1;
  }
  const nx = -ty; const ny = tx;
  return {
    x: x + nx * lateral,
    y: y + ny * lateral,
    tx, ty, nx, ny, curve, side,
    radius: curve ? PHYSICS.curveRadius - lateral * side : Infinity,
  };
}

export function turnCap(speed) {
  return Math.max(PHYSICS.minTurnRateDeg, PHYSICS.maxTurnRateDeg - PHYSICS.turnRateSlope * speed);
}

export function recenterCorrectionDeg(crossTrackError) {
  return clamp(Math.atan2(-crossTrackError, PHYSICS.recoveryLookaheadMeters) * 180 / Math.PI,
    -PHYSICS.recoveryMaxCorrectionDeg, PHYSICS.recoveryMaxCorrectionDeg);
}

export function steeringEquilibrium(progress, lateral, assignedLaneOffset, controller = 'recenter') {
  const tangent = angleOf(frameAt(progress, lateral));
  if (controller === 'tangent') return tangent;
  if (controller !== 'recenter') throw new RangeError(`unsupported steering controller: ${controller}`);
  return tangent + recenterCorrectionDeg(lateral - assignedLaneOffset) * Math.PI / 180;
}

export function raceHeadingError(progress, heading) {
  return angleDelta(heading, angleOf(frameAt(progress)));
}

// Presentation-only yaw for a flat duck image following this oval. The image
// faces right on the top straight, completes one 180-degree Y turn over each
// semicircular bend, and faces left on the bottom straight. Labels stay out of
// this transform in the renderer.
export function raceDuckYaw(progress) {
  const s = wrap(progress + PHYSICS.straight / 2, COURSE_LENGTH);
  const bend = Math.PI * PHYSICS.curveRadius;
  if (s < PHYSICS.straight) return 180;
  if (s < PHYSICS.straight + bend) return 180 * (1 - (s - PHYSICS.straight) / bend);
  if (s < PHYSICS.straight * 2 + bend) return 0;
  return 180 * (s - (PHYSICS.straight * 2 + bend)) / bend;
}

export function curveTargetSpeed(radius) {
  let low = 0; let high = PHYSICS.maxSpeed;
  for (let i = 0; i < 32; i += 1) {
    const mid = (low + high) / 2;
    const needed = (mid / radius) * 180 / Math.PI;
    if (needed <= turnCap(mid)) low = mid; else high = mid;
  }
  return low;
}

function nextCurveDistance(progress) {
  const s = wrap(progress + COURSE_START, COURSE_LENGTH);
  const straight = PHYSICS.straight;
  const curveLength = Math.PI * PHYSICS.curveRadius;
  if (s < straight) return straight - s;
  if (s < straight + curveLength) return 0;
  if (s < 2 * straight + curveLength) return 2 * straight + curveLength - s;
  return 0;
}

function desiredTurnRate(entrant, targetSpeed) {
  const frame = frameAt(entrant.progress, entrant.lateral);
  const radius = frame.curve ? frame.radius : PHYSICS.curveRadius - Math.abs(entrant.lateral);
  return (targetSpeed / radius) * 180 / Math.PI;
}

function rankAt(entrants) {
  return [...entrants].sort((a, b) => {
    const progressDiff = b.progress - a.progress;
    if (Math.abs(progressDiff) > 1e-9) return progressDiff;
    const lateralDiff = Math.abs(a.lateral) - Math.abs(b.lateral);
    if (Math.abs(lateralDiff) > 1e-9) return lateralDiff;
    if (a.player) return -1;
    if (b.player) return 1;
    return a.id.localeCompare(b.id);
  });
}

function copyState(entrants, tick) {
  return {
    tick,
    entrants: entrants.map((e) => ({
      id: e.id, progress: q(e.progress, 1000), lateral: q(e.lateral, 1000),
      heading: q(e.heading, 10000), speed: q(e.speed, 1000),
      x: q(frameAt(e.progress, e.lateral).x, 1000), y: q(frameAt(e.progress, e.lateral).y, 1000),
    })),
  };
}

const q = (n, factor) => Math.round(n * factor) / factor;
function angleDelta(to, from) { return Math.atan2(Math.sin(to - from), Math.cos(to - from)); }
function angleOf(frame) { return Math.atan2(frame.ty, frame.tx); }
function pos(e) { return frameAt(e.progress, e.lateral); }
function velocity(e) { return { x: e.speed * Math.cos(e.heading), y: e.speed * Math.sin(e.heading) }; }
function setVelocity(e, vx, vy, tick) {
  e.speed = Math.hypot(vx, vy);
  e.heading = Math.atan2(vy, vx);
  e.sprintUntil = Math.max(e.sprintUntil, tick);
}

function controllerType(input) { return EXPERIMENTS[input.experiment].controller; }
function weavingType(input) { return EXPERIMENTS[input.experiment].weaving; }
function contactType(input) { return EXPERIMENTS[input.experiment].contact; }
function tangentHeading(entrant) { return angleOf(frameAt(entrant.progress, entrant.lateral)); }
function crossTrackError(entrant) { return entrant.lateral - entrant.assignedLaneOffset; }
function controllerHeading(entrant, controller) {
  return steeringEquilibrium(entrant.progress, entrant.lateral, entrant.assignedLaneOffset, controller);
}
function offsetTarget(entrant, sign, degrees) {
  return tangentHeading(entrant) + sign * degrees * Math.PI / 180;
}
function headingErrorDegrees(to, from) { return Math.abs(angleDelta(to, from)) * 180 / Math.PI; }

function makeEpisodeRecord(type, entrant, tick, details = {}) {
  return {
    id: `${type}-${tick}-${entrant.id}`, tick, time: q(tick * PHYSICS.dt, 1000),
    type, participants: [entrant.id], status: 'active', recovery: {}, ...details,
  };
}

class MechanicalEventCapError extends Error {
  constructor(event, count, limit) {
    super(`mechanical event cap ${limit} would be exceeded by ${event.type} at tick ${event.tick}`);
    this.name = 'MechanicalEventCapError';
    this.event = event;
    this.count = count;
    this.limit = limit;
  }
}

function appendMechanicalEvent(records, event, limit) {
  if (records.length >= limit) throw new MechanicalEventCapError(event, records.length + 1, limit);
  records.push(event);
}

function refreshEpisodeStatus(event) {
  const states = Object.values(event.recovery ?? {});
  if (!states.length) return;
  if (states.every((detail) => ['recentered', 'cancelled'].includes(detail.recoveryStatus))) {
    event.status = states.every((detail) => detail.recoveryStatus === 'recentered') ? 'recentered' : 'cancelled';
  } else if (states.some((detail) => detail.holdStatus === 'holding')) event.status = 'holding';
  else if (states.some((detail) => detail.acquisitionStatus === 'acquiring')) event.status = 'active';
  else event.status = 'recovering';
}

function beginRecovery(entrant, event, tick, kind = 'recovery') {
  entrant.steeringEpisode = { kind, phase: 'recover', startTick: tick, record: event, settledTicks: 0 };
  event.recovery[entrant.id] = { startedAt: q(tick * PHYSICS.dt, 1000), yawRecoveredAt: null, recenteredAt: null,
    acquisitionStatus: 'not-required', holdStatus: 'not-required', recoveryStatus: 'recovering' };
  refreshEpisodeStatus(event);
}

function initializeWeaveSchedules(entrants, input, drawKeys) {
  if (weavingType(input) === 'none') return;
  for (const entrant of entrants) {
    const phase = latentDraw(input.seed, input.raceId, 'weave-phase', entrant.id, 0);
    entrant.nextWeaveTick = 1 + Math.floor(phase.value * PHYSICS.weaveInitialPhaseTicks);
    drawKeys.push(phase.key);
  }
}

function processWeaveDue(entrants, input, tick, diagnostics, eventRecords, drawKeys, limits) {
  const treatment = weavingType(input);
  if (treatment === 'none') return false;
  const dueEntrants = entrants.filter((entrant) => entrant.nextWeaveTick === tick);
  if (!dueEntrants.length) return false;
  if (diagnostics.length + dueEntrants.length > limits.maxOpportunityDiagnostics) {
    return { exceeded: true, attempted: diagnostics.length + dueEntrants.length, limit: limits.maxOpportunityDiagnostics };
  }
  const rank = rankAt(entrants);
  const rankById = new Map(rank.map((entrant, index) => [entrant.id, index + 1]));
  for (const entrant of dueEntrants.sort((a, b) => a.id.localeCompare(b.id))) {
    const opportunityIndex = entrant.weaveOpportunityIndex;
    entrant.weaveOpportunityIndex += 1;
    const place = rankById.get(entrant.id);
    const interval = treatment === 'symmetric' || place <= entrants.length / 2
      ? PHYSICS.weaveFrontIntervalTicks : PHYSICS.weaveRearIntervalTicks;
    entrant.nextWeaveTick = tick + interval;
    const error = crossTrackError(entrant);
    const blocked = Boolean(entrant.steeringEpisode)
      || (Math.abs(error) > PHYSICS.recoveryLateralTolerance);
    const diagnostic = {
      id: `weave-opportunity-${tick}-${entrant.id}-${opportunityIndex}`,
      tick, time: q(tick * PHYSICS.dt, 1000), entrantId: entrant.id, rank: place,
      intervalTicks: interval, opportunityIndex, status: blocked ? 'skipped' : 'activated',
      reason: blocked ? entrant.steeringEpisode ? `active ${entrant.steeringEpisode.phase} recovery` : 'lane recentering active' : 'eligible',
      nextDueTick: entrant.nextWeaveTick,
    };
    diagnostics.push(diagnostic);
    if (blocked) continue;
    const signDraw = latentDraw(input.seed, input.raceId, 'weave-sign', entrant.id, opportunityIndex);
    const magnitudeDraw = latentDraw(input.seed, input.raceId, 'weave-magnitude', entrant.id, opportunityIndex);
    drawKeys.push(signDraw.key, magnitudeDraw.key);
    const sign = signDraw.value < 0.5 ? -1 : 1;
    const magnitude = PHYSICS.weaveMinDeg + magnitudeDraw.value * (PHYSICS.weaveMaxDeg - PHYSICS.weaveMinDeg);
    const record = makeEpisodeRecord('weave-turn', entrant, tick, {
      participants: [entrant.id], sign, targetOffsetDeg: q(magnitude, 1000),
      signKey: signDraw.key, magnitudeKey: magnitudeDraw.key,
      effect: 'seeded path-relative steering deviation followed by lane recentering',
      reason: 'scheduled by the selected weaving treatment',
    });
    record.recovery[entrant.id] = { startedAt: q(tick * PHYSICS.dt, 1000), acquiredAt: null, holdStartAt: null, holdSeconds: 0, yawRecoveredAt: null, recenteredAt: null, maxDeviationDeg: 0,
      acquisitionStatus: 'acquiring', holdStatus: 'pending', recoveryStatus: 'recovering' };
    entrant.steeringEpisode = {
      kind: 'weave', phase: 'acquire', sign, targetOffsetDeg: magnitude,
      startTick: tick, heldTicks: 0, record,
    };
    appendMechanicalEvent(eventRecords, record, limits.maxMechanicalEvents);
    refreshEpisodeStatus(record);
    diagnostic.eventId = record.id;
    diagnostic.signKey = signDraw.key;
    diagnostic.magnitudeKey = magnitudeDraw.key;
  }
  return false;
}

function advanceSteeringEpisode(entrant, tick, controller, rankAtTick, slowdownEnabled, eventRecords, limits) {
  const episode = entrant.steeringEpisode;
  if (!episode) return;
  const tangent = tangentHeading(entrant);
  const actualOffset = headingErrorDegrees(entrant.heading, tangent) * Math.sign(angleDelta(entrant.heading, tangent));
  const record = episode.record;
  const detail = record.recovery?.[entrant.id];
  if (detail) detail.maxDeviationDeg = Math.max(detail.maxDeviationDeg ?? 0, Math.abs(actualOffset));
  if (episode.phase === 'acquire') {
    const target = offsetTarget(entrant, episode.sign, episode.targetOffsetDeg);
    const atTarget = headingErrorDegrees(entrant.heading, target) <= PHYSICS.recoveryHeadingToleranceDeg;
    if (atTarget && Math.abs(actualOffset) >= 10) {
      episode.phase = 'hold'; episode.heldTicks = 0;
      if (slowdownEnabled && episode.kind === 'weave' && rankAtTick <= 2 && entrant.leaderSlowdownCount < 2 && entrant.leaderSlowdownUntil <= tick) {
        const slowdown = { id: 'leader-wobble-slowdown-' + (tick + 1) + '-' + entrant.id, tick: tick + 1,
          triggerTick: tick, time: q((tick + 1) * PHYSICS.dt, 1000), type: 'leader-wobble-slowdown', participants: [entrant.id],
          status: 'applied', targetSpeedFactor: 0.8, durationLimitTicks: 20, actualTicks: 0, speedDelta: 0,
          reason: 'rank 1 or 2 weave entered its held phase', effect: 'targetSpeed multiplied by 0.8 for at most 20 ticks; normal braking and acceleration remain active' };
        appendMechanicalEvent(eventRecords, slowdown, limits.maxMechanicalEvents);
        entrant.leaderSlowdownEventRecord = slowdown; entrant.leaderSlowdownUntil = tick + 21; entrant.leaderSlowdownCount += 1;
      }
      episode.record.status = 'holding';
      if (detail) { detail.acquiredAt = q(tick * PHYSICS.dt, 1000); detail.holdStartAt = detail.acquiredAt; detail.acquisitionStatus = 'attained'; detail.holdStatus = 'holding'; }
      refreshEpisodeStatus(record);
      return;
    }
    if (tick - episode.startTick >= PHYSICS.steeringAcquireTimeoutTicks) {
      episode.phase = 'recover'; episode.record.status = 'acquisition-timeout';
      episode.record.reason = 'target was not attained within the 1-second acquisition limit';
      if (detail) { detail.holdSeconds = 0; detail.acquisitionStatus = 'timed-out'; detail.holdStatus = 'not-attained'; }
      refreshEpisodeStatus(record);
    }
    return;
  }
  if (episode.phase === 'hold') {
    const target = offsetTarget(entrant, episode.sign, episode.targetOffsetDeg);
    const maintained = headingErrorDegrees(entrant.heading, target) <= PHYSICS.recoveryHeadingToleranceDeg && Math.abs(actualOffset) >= 10;
    if (!maintained) {
      episode.phase = 'recover'; episode.record.status = 'hold-interrupted';
      episode.record.reason = 'turn cap or curve change interrupted the 10-degree held deviation';
      if (detail) detail.holdStatus = 'interrupted';
      refreshEpisodeStatus(record);
    } else {
      episode.heldTicks += 1;
      if (detail) detail.holdSeconds = q(episode.heldTicks * PHYSICS.dt, 1000);
      if (episode.heldTicks >= PHYSICS.weaveHoldTicks) {
        episode.phase = 'recover'; episode.record.status = 'recovering';
        if (detail) detail.holdStatus = 'attained';
        refreshEpisodeStatus(record);
      }
    }
    return;
  }
  const equilibrium = controllerHeading(entrant, controller);
  const aligned = headingErrorDegrees(entrant.heading, equilibrium) <= PHYSICS.recoveryHeadingToleranceDeg;
  episode.settledTicks = aligned ? episode.settledTicks + 1 : 0;
  if (detail && aligned && !detail.yawRecoveredAt && episode.settledTicks >= PHYSICS.recoverySettleTicks) {
    detail.yawRecoveredAt = q(tick * PHYSICS.dt, 1000);
  }
  const centered = Math.abs(crossTrackError(entrant)) <= PHYSICS.recoveryLateralTolerance && aligned;
  episode.centeredTicks = centered ? (episode.centeredTicks ?? 0) + 1 : 0;
  if (centered && episode.centeredTicks >= PHYSICS.recoverySettleTicks) {
    if (detail) { detail.recenteredAt = q(tick * PHYSICS.dt, 1000); detail.recoveryStatus = 'recentered'; }
    episode.record.status = episode.record.status === 'acquisition-timeout' || episode.record.status === 'hold-interrupted'
      ? episode.record.status : 'recentered';
    entrant.steeringEpisode = null;
    refreshEpisodeStatus(record);
  }
}

function resolveWall(entrant, tick, records, limits) {
  const side = Math.sign(entrant.lateral);
  if (Math.abs(entrant.lateral) <= PHYSICS.corridorHalfWidth || entrant.wallEpisode) {
    if (Math.abs(entrant.lateral) < PHYSICS.corridorHalfWidth - 0.05) entrant.wallEpisode = false;
    return false;
  }
  const boundary = side * PHYSICS.corridorHalfWidth;
  const frame = frameAt(entrant.progress, entrant.lateral);
  const v = velocity(entrant);
  const normalV = v.x * frame.nx + v.y * frame.ny;
  const tangentV = v.x * frame.tx + v.y * frame.ty;
  const closing = normalV * side;
  entrant.lateral = boundary;
  if (closing > 0) {
    const nextNormal = -closing * PHYSICS.restitution;
    const nextTangent = tangentV * PHYSICS.wallTangentialDamping;
    setVelocity(entrant, frame.tx * nextTangent + frame.nx * nextNormal, frame.ty * nextTangent + frame.ny * nextNormal, tick);
    entrant.wallEpisode = true;
    appendMechanicalEvent(records, { id: `wall-${tick}-${entrant.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type: 'wall-impact', participants: [entrant.id], effect: 'bounded bounce and tangential slowdown', normalClosingSpeed: q(closing, 1000), speedBefore: q(Math.hypot(v.x, v.y), 1000), speedAfter: q(entrant.speed, 1000), eligible: true }, limits.maxMechanicalEvents);
    return true;
  }
  entrant.wallEpisode = true;
  appendMechanicalEvent(records, { id: `wall-overlap-${tick}-${entrant.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type: 'wall-overlap', participants: [entrant.id], effect: 'position clamped; no impact impulse', normalClosingSpeed: q(closing, 1000), eligible: false }, limits.maxMechanicalEvents);
  return true;
}

function sweptPairCandidate(a, b, previous, current) {
  const r0 = { x: previous[b.id].x - previous[a.id].x, y: previous[b.id].y - previous[a.id].y };
  const r1 = { x: current[b.id].x - current[a.id].x, y: current[b.id].y - current[a.id].y };
  const d = { x: r1.x - r0.x, y: r1.y - r0.y };
  const d2 = d.x * d.x + d.y * d.y;
  const t = d2 === 0 ? 0 : clamp(-(r0.x * d.x + r0.y * d.y) / d2, 0, 1);
  const closest = { x: r0.x + d.x * t, y: r0.y + d.y * t };
  const distance = Math.hypot(closest.x, closest.y);
  return distance <= PHYSICS.duckRadius * 2 ? { distance, normal: closest, t } : null;
}

function auditTerminalTickOrdering(before, entrants, previous, tick, finishFraction, contactEpisodeAlreadyUsed) {
  const current = Object.fromEntries(entrants.map((entrant) => [entrant.id, pos(entrant)]));
  const contactCandidates = [];
  for (let i = 0; i < entrants.length; i += 1) for (let j = i + 1; j < entrants.length; j += 1) {
    const a = entrants[i]; const b = entrants[j];
    const candidate = sweptPairCandidate(a, b, previous, current);
    if (!candidate) continue;
    const length = Math.hypot(candidate.normal.x, candidate.normal.y) || 1;
    const nx = candidate.normal.x / length; const ny = candidate.normal.y / length;
    const va = velocity(a); const vb = velocity(b);
    const relativeNormal = (vb.x - va.x) * nx + (vb.y - va.y) * ny;
    if (relativeNormal >= 0) continue;
    contactCandidates.push({
      participants: [a.id, b.id], fraction: q(candidate.t, 10000),
      timeSeconds: q((tick - 1 + candidate.t) * PHYSICS.dt, 10000),
      closestDistanceMeters: q(candidate.distance, 10000),
      relativeClosingSpeed: Number((-relativeNormal).toPrecision(8)),
      passesCurrentClosingCheck: relativeNormal < 0,
      beforeOrAtFirstFinish: candidate.t <= finishFraction + 1e-9,
      wouldTriggerUnderOneContactLimit: !contactEpisodeAlreadyUsed && relativeNormal < 0 && candidate.t <= finishFraction + 1e-9,
    });
  }
  const wallCandidates = [];
  for (const entrant of entrants) {
    const from = before.find((item) => item.id === entrant.id);
    const to = entrant;
    const side = Math.sign(to.lateral);
    if (!side || Math.abs(to.lateral) <= PHYSICS.corridorHalfWidth || side * (to.lateral - from.lateral) <= 0) continue;
    const fraction = from.lateral * side >= PHYSICS.corridorHalfWidth
      ? 0 : (side * PHYSICS.corridorHalfWidth - from.lateral) / (to.lateral - from.lateral);
    if (fraction < 0 || fraction > 1) continue;
    const frame = frameAt(to.progress, to.lateral);
    const v = velocity(to);
    const closingSpeed = (v.x * frame.nx + v.y * frame.ny) * side;
    if (closingSpeed <= 0) continue;
    wallCandidates.push({ entrantId: entrant.id, fraction: q(fraction, 10000),
      timeSeconds: q((tick - 1 + fraction) * PHYSICS.dt, 10000),
      beforeOrAtFirstFinish: fraction <= finishFraction + 1e-9, closingSpeed: q(closingSpeed, 10000) });
  }
  return {
    tick, dt: PHYSICS.dt, firstFinishFraction: q(finishFraction, 10000),
    contactEpisodeAlreadyUsed,
    resolutionOrder: 'crossing is interpolated and terminal before the tick-end wall/contact resolver runs',
    contactCandidates, wallCandidates,
  };
}

function resolveOneDuckContact(entrants, tick, input, records, keys, previous, limits) {
  if (records.some((e) => e.type === 'duck-contact')) return;
  const current = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
  const candidates = [];
  for (let i = 0; i < entrants.length; i += 1) for (let j = i + 1; j < entrants.length; j += 1) {
    const a = entrants[i]; const b = entrants[j];
    const hit = sweptPairCandidate(a, b, previous, current);
    if (hit) candidates.push({ a, b, ...hit });
  }
  if (!candidates.length) return;
  candidates.sort((x, y) => `${x.a.id},${x.b.id}`.localeCompare(`${y.a.id},${y.b.id}`));
  const selector = eventDraw(input.seed, input.raceId, tick, 'contact-pair-selection', candidates.map((item) => `${item.a.id},${item.b.id}`).join(';'));
  keys.push(selector.key);
  const picked = candidates[Math.floor(selector.value * candidates.length)];
  const { a, b } = picked;
  let nx = picked.normal.x; let ny = picked.normal.y;
  const norm = Math.hypot(nx, ny) || 1;
  nx /= norm; ny /= norm;
  const va = velocity(a); const vb = velocity(b);
  const relativeNormal = (vb.x - va.x) * nx + (vb.y - va.y) * ny;
  if (relativeNormal >= 0) return;
  const impulse = -(1 + PHYSICS.restitution) * relativeNormal / 2;
  const av = { x: va.x - impulse * nx, y: va.y - impulse * ny };
  const bv = { x: vb.x + impulse * nx, y: vb.y + impulse * ny };
  const rotate = (vector, radians) => ({ x: vector.x * Math.cos(radians) - vector.y * Math.sin(radians), y: vector.x * Math.sin(radians) + vector.y * Math.cos(radians) });
  let ar = av; let br = bv;
  const recoveryTargets = {};
  if (contactType(input) === 'control') {
    const angle = PHYSICS.collisionDeflectionDeg * Math.PI / 180;
    const stableSign = a.id.localeCompare(b.id) <= 0 ? 1 : -1;
    ar = rotate(av, stableSign * angle); br = rotate(bv, -stableSign * angle);
  }
  setVelocity(a, ar.x, ar.y, tick); setVelocity(b, br.x, br.y, tick);
  const record = {
    id: `duck-contact-${tick}-${a.id}-${b.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type: 'duck-contact',
    participants: [a.id, b.id].sort(),
    effect: contactType(input) === 'control'
      ? 'restitution impulse with the current fixed 6-degree response, followed by lane recovery'
      : 'restitution impulse with seeded 15–20 degree outward steering targets, followed by lane recovery',
    relativeClosingSpeed: q(-relativeNormal, 1000), restitution: PHYSICS.restitution,
    pre: { [a.id]: { vx: q(va.x, 1000), vy: q(va.y, 1000), speed: q(Math.hypot(va.x, va.y), 1000) }, [b.id]: { vx: q(vb.x, 1000), vy: q(vb.y, 1000), speed: q(Math.hypot(vb.x, vb.y), 1000) } },
    post: { [a.id]: { vx: q(ar.x, 1000), vy: q(ar.y, 1000), speed: q(a.speed, 1000) }, [b.id]: { vx: q(br.x, 1000), vy: q(br.y, 1000), speed: q(b.speed, 1000) } },
    eligible: true, selectorKey: selector.key, eligiblePairCount: candidates.length, status: 'active', recovery: {},
  };
  for (const [entrant, outward] of [[a, { x: -nx, y: -ny }], [b, { x: nx, y: ny }]]) {
    if (entrant.steeringEpisode?.kind === 'weave') {
      const prior = entrant.steeringEpisode;
      prior.record.status = 'cancelled_by_collision';
      prior.record.reason = 'duck contact took steering priority';
      const priorDetail = prior.record.recovery?.[entrant.id];
      if (priorDetail) {
        priorDetail.cancelledAt = q(tick * PHYSICS.dt, 1000);
        priorDetail.recoveryStatus = 'cancelled';
        if (prior.phase === 'hold') priorDetail.holdStatus = 'interrupted';
        else if (prior.phase === 'acquire') { priorDetail.acquisitionStatus = 'cancelled-by-collision'; priorDetail.holdStatus = 'not-attained'; }
      }
      refreshEpisodeStatus(prior.record);
    }
    const tangent = tangentHeading(entrant);
    const outwardAngle = Math.atan2(outward.y, outward.x);
    const cross = angleDelta(outwardAngle, tangent);
    const direction = Math.abs(cross) < 1e-6
      ? (entrant === a ? -1 : 1)
      : Math.sign(cross);
    if (contactType(input) === 'control') {
      beginRecovery(entrant, record, tick, 'contact-recovery');
      const stableSign = a.id.localeCompare(b.id) <= 0 ? 1 : -1;
      const steeringDeflectionDeg = stableSign * PHYSICS.collisionDeflectionDeg * (entrant === a ? 1 : -1);
      record.recovery[entrant.id].steeringDeflectionDeg = steeringDeflectionDeg;
      recoveryTargets[entrant.id] = { steeringDeflectionDeg };
      continue;
    }
    const magnitudeDraw = latentDraw(input.seed, input.raceId, 'contact-angle', entrant.id, 0);
    keys.push(magnitudeDraw.key);
    const magnitude = PHYSICS.strongContactMinDeg + magnitudeDraw.value * (PHYSICS.strongContactMaxDeg - PHYSICS.strongContactMinDeg);
    const detail = { startedAt: q(tick * PHYSICS.dt, 1000), yawRecoveredAt: null, recenteredAt: null, targetOffsetDeg: q(magnitude, 1000), outwardSign: direction, magnitudeKey: magnitudeDraw.key, maxDeviationDeg: 0,
      acquisitionStatus: 'acquiring', holdStatus: 'pending', recoveryStatus: 'recovering' };
    record.recovery[entrant.id] = detail;
    entrant.steeringEpisode = { kind: 'contact', phase: 'acquire', startTick: tick, sign: direction, targetOffsetDeg: magnitude, record, settledTicks: 0, heldTicks: 0 };
    recoveryTargets[entrant.id] = { targetOffsetDeg: detail.targetOffsetDeg, outwardSign: direction, magnitudeKey: magnitudeDraw.key };
  }
  const post = current;
  const separation = Math.hypot(post[b.id].x - post[a.id].x, post[b.id].y - post[a.id].y);
  if (separation < PHYSICS.duckRadius * 2) {
    const correction = (PHYSICS.duckRadius * 2 - separation) / 2 + 0.001;
    const fa = frameAt(a.progress, a.lateral); const fb = frameAt(b.progress, b.lateral);
    a.lateral = clamp(a.lateral - correction * (nx * fa.nx + ny * fa.ny), -PHYSICS.corridorHalfWidth, PHYSICS.corridorHalfWidth);
    b.lateral = clamp(b.lateral + correction * (nx * fb.nx + ny * fb.ny), -PHYSICS.corridorHalfWidth, PHYSICS.corridorHalfWidth);
  }
  record.recoveryTargets = recoveryTargets;
  refreshEpisodeStatus(record);
  appendMechanicalEvent(records, record, limits.maxMechanicalEvents);
}

function interpolatedState(before, after, fraction, tick) {
  return {
    tick,
    entrants: before.map((old) => {
      const next = after.find((item) => item.id === old.id);
      const progress = old.progress + (next.progress - old.progress) * fraction;
      const lateral = old.lateral + (next.lateral - old.lateral) * fraction;
      const heading = old.heading + angleDelta(next.heading, old.heading) * fraction;
      const speed = old.speed + (next.speed - old.speed) * fraction;
      const frame = frameAt(progress, lateral);
      return {
        id: old.id, progress: q(progress, 1000), lateral: q(lateral, 1000),
        heading: q(heading, 10000), speed: q(speed, 1000),
        x: q(frame.x, 1000), y: q(frame.y, 1000),
      };
    }),
  };
}

function finishOrderAt(snapshot, entrants, crossingIds) {
  const crossingSet = new Set(crossingIds);
  const live = snapshot.entrants.map((item) => {
    const entrant = entrants.find((e) => e.id === item.id);
    return { ...entrant, progress: item.progress, lateral: item.lateral, speed: item.speed, crossedAtFinish: crossingSet.has(item.id) };
  });
  return rankAt(live).map((e, index) => ({
    id: e.id, name: e.name, lane: e.lane, row: e.row, player: Boolean(e.player), crossedAtFinish: e.crossedAtFinish,
    crossingTimeSeconds: e.crossedAtFinish ? snapshot.tick * PHYSICS.dt : null,
    speed: q(e.speed, 1000), topSpeed: q(e.topSpeed, 1000), score: q(e.progress, 1000),
    progress: q(e.progress, 1000), lateral: q(e.lateral, 1000), place: index + 1,
    payout: PHYSICS.payoutByPlace[index] ?? 0,
  }));
}

function processStudyAssistance(entrants, input, tick, tickStartOrder, records, eventRecords, drawKeys, limits) {
  if (tick % 40 !== 0) return false;
  if (records.length + entrants.length > 120) throw new Error('study-sidecar cap exceeded');
  const rankById = new Map(tickStartOrder.map((entrant, index) => [entrant.id, index + 1]));
  for (const entrant of entrants) {
    const opportunityIndex = entrant.assistOpportunityIndex++;
    const rank = rankById.get(entrant.id);
    const orderIndex = tickStartOrder.findIndex((item) => item.id === entrant.id);
    const predecessor = orderIndex > 0 ? tickStartOrder[orderIndex - 1] : null;
    const gap = predecessor ? predecessor.progress - entrant.progress : null;
    const reasons = [];
    if (rank <= entrants.length / 2) reasons.push('not-back-half');
    if (gap === null || gap < 2) reasons.push('gap-under-2m');
    if (tick < entrant.assistCooldownUntil) reasons.push('cooldown');
    if (entrant.assistCount >= 2) reasons.push('per-race-cap');
    const record = { tick, entrantId: entrant.id, opportunityIndex, rank, predecessorId: predecessor?.id ?? null,
      observedGapMeters: gap === null ? null : q(gap, 1000), speed: q(entrant.speed, 1000), topSpeed: q(entrant.topSpeed, 1000),
      speedHeadroom: q(entrant.topSpeed - entrant.speed, 1000), speedSaturatedAtOpportunity: entrant.speed >= entrant.topSpeed - 1e-9,
      status: reasons.length ? 'blocked' : 'eligible', reasons, drawKey: null,
      progressAtOpportunity: q(entrant.progress, 1000), episodeEndTick: null, progressAtEpisodeEnd: null, progressDeltaDuringEpisode: null,
      gapAtEpisodeEnd: null, executedTicks: 0, accelerationTicks: 0, saturatedTicks: 0, recenterTicks: 0, raisedTurnCapTicks: 0, turnCapReliefTicks: 0,
      appliedSpeedGain: 0, maxAppliedTurnCapDegPerSecond: 0 };
    records.push(record);
    if (reasons.length) continue;
    const chance = latentDraw(input.seed, input.raceId, 'plan23-rear-assistance', entrant.id, opportunityIndex);
    record.drawKey = chance.key;
    drawKeys.push(chance.key);
    if (chance.value >= 0.5) { record.status = 'chance-failed'; continue; }
    const event = { id: 'catch-up-assist-' + tick + '-' + entrant.id, tick, time: q(tick * PHYSICS.dt, 1000),
      type: 'catch-up-assist', participants: [entrant.id], status: 'applied',
      effect: '5.0 m/s^2 acceleration for up to 40 ticks, with 6 m recovery lookahead and turn cap up to 1.5× (maximum 90°/s)',
      reason: 'seeded back-half and gap-eligible assistance opportunity', durationLimitTicks: 40, actualTicks: 0 };
    appendMechanicalEvent(eventRecords, event, limits.maxMechanicalEvents);
    entrant.assistStartTick = tick;
    entrant.assistUntilTick = tick + 40;
    entrant.assistCount += 1;
    entrant.assistActualTicks = 0;
    entrant.assistSpeedGain = 0;
    entrant.assistCooldownUntil = tick + 80;
    entrant.assistAuditRecord = record;
    entrant.assistEventRecord = event;
    record.status = 'executed';
    record.eventId = event.id;
  }
  return false;
}

function simulate(input, guardLimitOverrides = {}) {
  validate(input);
  const limits = {
    maxMechanicalEvents: guardLimitOverrides.maxMechanicalEvents ?? PHYSICS.maxMechanicalEvents,
    maxOpportunityDiagnostics: guardLimitOverrides.maxOpportunityDiagnostics ?? PHYSICS.maxOpportunityDiagnostics,
  };
  if (!Number.isInteger(limits.maxMechanicalEvents) || limits.maxMechanicalEvents < 1 || limits.maxMechanicalEvents > PHYSICS.maxMechanicalEvents
    || !Number.isInteger(limits.maxOpportunityDiagnostics) || limits.maxOpportunityDiagnostics < 0 || limits.maxOpportunityDiagnostics > PHYSICS.maxOpportunityDiagnostics) {
    throw new RangeError('guard limits must be non-negative integers no greater than the model caps');
  }
  const settings = EXPERIMENTS[input.experiment];
  const entrants = makeEntrants(input);
  for (const entrant of entrants) entrant.heading = tangentHeading(entrant);
  const eventRecords = [];
  const opportunityRecords = [];
  const drawKeys = [];
  const assistanceAudit = [];
  for (const e of entrants) { e.assistOpportunityIndex = 0; e.assistUntilTick = 0; e.assistCount = 0; e.assistCooldownUntil = 0; e.assistAuditRecord = null; e.assistEventRecord = null; e.assistStartTick = 0; e.assistActualTicks = 0; e.assistSpeedGain = 0; }
  initializeWeaveSchedules(entrants, input, drawKeys);
  const trajectory = [copyState(entrants, 0)];
  let priorPositions = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
  let status = 'unresolved';
  let unresolvedReason = 'line_not_crossed_before_watchdog';
  let finish = [];
  let finishTimeSeconds = null;
  let winner = null;
  let guardEvidence = null;
  let terminalStepOrdering = null;
  for (let tick = 1; tick <= PHYSICS.maxTicks; tick += 1) {
    const priorEventCount = eventRecords.length;
    const priorOpportunityCount = opportunityRecords.length;
    const priorDrawKeyCount = drawKeys.length;
    const priorEventSnapshot = eventRecords.map((event) => structuredClone(event));
    const tickEvents = [...eventRecords];
    const tickOpportunities = [...opportunityRecords];
    const tickDrawKeys = [...drawKeys];
    const tickAssistanceSnapshot = assistanceAudit.map((item) => structuredClone(item));
    const tickStartOrder = rankAt(entrants);
    try {
      const dueResult = processWeaveDue(entrants, input, tick, tickOpportunities, tickEvents, tickDrawKeys, limits);
      if (dueResult && dueResult.exceeded) {
        unresolvedReason = 'opportunity_diagnostic_cap';
        guardEvidence = { kind: unresolvedReason, tick, limit: dueResult.limit, attemptedCount: dueResult.attempted };
        break;
      }
      if (input.dramaArm === 'R2combined' || input.dramaArm === 'R2combined-risk-only') {
        processStudyAssistance(entrants, input, tick, tickStartOrder, assistanceAudit, tickEvents, tickDrawKeys, limits);
      }
    const before = entrants.map((e) => ({ id: e.id, progress: e.progress, lateral: e.lateral, heading: e.heading, speed: e.speed }));
    for (const e of entrants) {
      const frame = frameAt(e.progress, e.lateral);
      let targetSpeed = e.topSpeed;
      const curveDistance = nextCurveDistance(e.progress);
      const targetCornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));
      const stopping = Math.max(0, (e.speed * e.speed - targetCornerSpeed * targetCornerSpeed) / (2 * PHYSICS.braking));
      if (curveDistance <= stopping + e.speed * PHYSICS.dt) targetSpeed = Math.min(targetSpeed, targetCornerSpeed);
      const slowdownSpeedBeforeStep = e.speed;
      const unslowedTargetSpeed = targetSpeed;
      const leaderSlowdownActive = e.leaderSlowdownUntil > tick;
      if (leaderSlowdownActive) targetSpeed *= 0.8;
      const assistedNow = e.assistUntilTick > tick;
      e.acceleration = assistedNow ? 5 : PHYSICS.baseAcceleration;
      const speedBeforeStep = e.speed;
      e.speed = targetSpeed < e.speed
        ? Math.max(targetSpeed, e.speed - PHYSICS.braking * PHYSICS.dt)
        : Math.min(targetSpeed, e.speed + e.acceleration * PHYSICS.dt);
      if (leaderSlowdownActive && e.leaderSlowdownEventRecord) {
        const referenceSpeed = unslowedTargetSpeed < slowdownSpeedBeforeStep
          ? Math.max(unslowedTargetSpeed, slowdownSpeedBeforeStep - PHYSICS.braking * PHYSICS.dt)
          : Math.min(unslowedTargetSpeed, slowdownSpeedBeforeStep + e.acceleration * PHYSICS.dt);
        e.leaderSlowdownEventRecord.actualTicks += 1;
        e.leaderSlowdownEventRecord.speedDelta += Math.max(0, referenceSpeed - e.speed);
        e.leaderSlowdownTicks += 1;
        e.leaderSlowdownSpeedDelta += Math.max(0, referenceSpeed - e.speed);
      }
      if (!leaderSlowdownActive && e.leaderSlowdownEventRecord?.status === 'applied') {
        e.leaderSlowdownEventRecord.status = 'completed';
        e.leaderSlowdownEventRecord.endTick = tick - 1;
        e.leaderSlowdownEventRecord.durationTicks = e.leaderSlowdownEventRecord.actualTicks;
      }
      if (assistedNow) {
        const referenceSpeed = Math.min(targetSpeed, speedBeforeStep + PHYSICS.baseAcceleration * PHYSICS.dt);
        const speedGain = Math.max(0, e.speed - referenceSpeed);
        e.assistSpeedGain = (e.assistSpeedGain ?? 0) + speedGain;
        e.assistActualTicks = (e.assistActualTicks ?? 0) + 1;
        if (e.assistAuditRecord) {
          e.assistAuditRecord.executedTicks += 1;
          e.assistAuditRecord.accelerationTicks += 1;
          e.assistAuditRecord.saturatedTicks += speedGain <= 1e-9 ? 1 : 0;
          e.assistAuditRecord.appliedSpeedGain += speedGain;
          e.assistEventRecord.actualTicks = e.assistActualTicks;
          e.assistEventRecord.appliedSpeedGain = q(e.assistSpeedGain, 1000);
        }
      }
      let desiredHeading = controllerHeading(e, settings.controller);
      const episode = e.steeringEpisode;
      let appliedTurnCap = turnCap(e.speed);
      const turnAssistActive = assistedNow && (!episode || episode.phase === 'recover');
      if (turnAssistActive) {
        const ordinaryCorrection = recenterCorrectionDeg(crossTrackError(e));
        const assistedCorrection = clamp(Math.atan2(-crossTrackError(e), 6) * 180 / Math.PI,
          -PHYSICS.recoveryMaxCorrectionDeg, PHYSICS.recoveryMaxCorrectionDeg);
        desiredHeading = tangentHeading(e) + assistedCorrection * Math.PI / 180;
        appliedTurnCap = Math.min(90, appliedTurnCap * 1.5);
        if (e.assistAuditRecord) {
          if (Math.abs(assistedCorrection - ordinaryCorrection) > 1e-6) e.assistAuditRecord.recenterTicks += 1;
          if (appliedTurnCap > turnCap(e.speed) + 1e-6) e.assistAuditRecord.raisedTurnCapTicks += 1;
          e.assistAuditRecord.maxAppliedTurnCapDegPerSecond = Math.max(e.assistAuditRecord.maxAppliedTurnCapDegPerSecond, appliedTurnCap);
        }
      }
      if (episode && ['acquire', 'hold'].includes(episode.phase)) {
        desiredHeading = offsetTarget(e, episode.sign, episode.targetOffsetDeg);
      }
      const requestedTurnRadians = Math.abs(angleDelta(desiredHeading, e.heading));
      const turnRadians = Math.min(requestedTurnRadians, appliedTurnCap * Math.PI / 180 * PHYSICS.dt);
      if (turnAssistActive && e.assistAuditRecord && requestedTurnRadians > turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt + 1e-9
        && turnRadians > turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt + 1e-9) e.assistAuditRecord.turnCapReliefTicks += 1;
      e.heading += Math.sign(angleDelta(desiredHeading, e.heading)) * turnRadians;
      const error = angleDelta(e.heading, angleOf(frame));
      e.progress += e.speed * Math.cos(error) * PHYSICS.dt;
      e.lateral += e.speed * Math.sin(error) * PHYSICS.dt;
      if (e.assistAuditRecord && e.assistEventRecord && e.assistUntilTick === tick + 1 && e.assistEventRecord.status === 'applied') {
        e.assistEventRecord.status = 'completed'; e.assistEventRecord.endTick = tick; e.assistEventRecord.durationTicks = e.assistActualTicks;
        e.assistAuditRecord.status = 'completed'; e.assistAuditRecord.episodeEndTick = tick;
        e.assistAuditRecord.progressAtEpisodeEnd = q(e.progress, 1000);
        e.assistAuditRecord.progressDeltaDuringEpisode = q(e.progress - e.assistAuditRecord.progressAtOpportunity, 1000);
        const auditPredecessor = entrants.find((candidate) => candidate.id === e.assistAuditRecord.predecessorId);
        e.assistAuditRecord.gapAtEpisodeEnd = auditPredecessor ? q(auditPredecessor.progress - e.progress, 1000) : null;
      }
      advanceSteeringEpisode(e, tick, settings.controller, tickStartOrder.findIndex((item) => item.id === e.id) + 1,
        ['R2combined', 'R2combined-risk-only'].includes(input.dramaArm), tickEvents, limits);
    }
    const crossed = [];
    for (const beforeEntrant of before) {
      const after = entrants.find((e) => e.id === beforeEntrant.id);
      if (beforeEntrant.progress < COURSE_LENGTH && after.progress >= COURSE_LENGTH) {
        const fraction = (COURSE_LENGTH - beforeEntrant.progress) / (after.progress - beforeEntrant.progress);
        crossed.push({ id: after.id, fraction });
      }
    }
    if (crossed.length) {
      crossed.sort((a, b) => a.fraction - b.fraction || a.id.localeCompare(b.id));
      const firstFraction = crossed[0].fraction;
      terminalStepOrdering = auditTerminalTickOrdering(before, entrants, priorPositions, tick, firstFraction,
        eventRecords.some((event) => event.type === 'duck-contact'));
      const crossingIds = crossed.filter((item) => Math.abs(item.fraction - firstFraction) * PHYSICS.dt <= 1e-9).map((item) => item.id);
      const terminalTick = tick - 1 + firstFraction;
      const terminal = interpolatedState(before, entrants, firstFraction, terminalTick);
      for (const item of terminal.entrants) if (crossingIds.includes(item.id)) item.progress = q(COURSE_LENGTH, 1000);
      const terminalTime = terminalTick * PHYSICS.dt;
      const finishEvent = {
        id: `finish-line-${tick}-${crossingIds.join('-')}`, tick: terminalTick, time: q(terminalTime, 1_000_000),
        type: 'finish-line-crossing', participants: crossingIds, eligible: true,
        effect: `${crossingIds.join(' and ')} crossed first; all remaining places are classified at that same instant`,
      };
      appendMechanicalEvent(tickEvents, finishEvent, limits.maxMechanicalEvents);
      finishTimeSeconds = terminalTime;
      finish = finishOrderAt(terminal, entrants, crossingIds);
      winner = finish[0]?.id ?? null;
      trajectory.push(terminal);
      trajectory.push(terminal);
      eventRecords.push(...tickEvents.slice(priorEventCount));
      opportunityRecords.push(...tickOpportunities.slice(priorOpportunityCount));
      drawKeys.push(...tickDrawKeys.slice(priorDrawKeyCount));
      status = 'finished'; unresolvedReason = null;
      break;
    }
    for (const e of entrants) if (Math.abs(e.lateral) > PHYSICS.corridorHalfWidth) resolveWall(e, tick, tickEvents, limits);
    resolveOneDuckContact(entrants, tick, input, tickEvents, tickDrawKeys, priorPositions, limits);
    trajectory.push(copyState(entrants, tick));
    priorPositions = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
    eventRecords.push(...tickEvents.slice(priorEventCount));
    opportunityRecords.push(...tickOpportunities.slice(priorOpportunityCount));
    drawKeys.push(...tickDrawKeys.slice(priorDrawKeyCount));
    } catch (error) {
      if (!(error instanceof MechanicalEventCapError)) throw error;
      unresolvedReason = 'mechanical_event_cap';
      eventRecords.splice(0, eventRecords.length, ...priorEventSnapshot);
      assistanceAudit.splice(0, assistanceAudit.length, ...tickAssistanceSnapshot);
      guardEvidence = { kind: unresolvedReason, tick, limit: error.limit, attemptedCount: error.count,
        eventType: error.event.type, eventId: error.event.id, tickRecordsDiscarded: tickEvents.length - priorEventCount };
      break;
    }
  }
  const finalTick = trajectory.at(-1).tick;
  const finalSnapshot = trajectory.at(-1);
  for (const e of entrants) {
    if (e.assistEventRecord?.status === 'applied') {
      e.assistEventRecord.status = 'ended-with-race'; e.assistEventRecord.endTick = finalTick; e.assistEventRecord.durationTicks = e.assistActualTicks;
      if (e.assistAuditRecord) {
        const finalEntrant = finalSnapshot.entrants.find((item) => item.id === e.id);
        const finalPredecessor = finalSnapshot.entrants.find((item) => item.id === e.assistAuditRecord.predecessorId);
        e.assistAuditRecord.status = 'ended-with-race'; e.assistAuditRecord.episodeEndTick = finalTick;
        e.assistAuditRecord.progressAtEpisodeEnd = finalEntrant?.progress ?? null;
        e.assistAuditRecord.progressDeltaDuringEpisode = finalEntrant ? q(finalEntrant.progress - e.assistAuditRecord.progressAtOpportunity, 1000) : null;
        e.assistAuditRecord.gapAtEpisodeEnd = finalEntrant && finalPredecessor ? q(finalPredecessor.progress - finalEntrant.progress, 1000) : null;
      }
    }
    if (e.leaderSlowdownEventRecord?.status === 'applied') {
      e.leaderSlowdownEventRecord.status = 'ended-with-race'; e.leaderSlowdownEventRecord.endTick = finalTick;
      e.leaderSlowdownEventRecord.durationTicks = e.leaderSlowdownEventRecord.actualTicks;
    }
  }
  for (const event of eventRecords) if (Object.keys(event.recovery ?? {}).length) {
    const unfinished = Object.values(event.recovery).filter((detail) => !['recentered', 'cancelled'].includes(detail.recoveryStatus));
    for (const detail of unfinished) {
      detail.recoveryStatus = status === 'finished' ? 'race-ended-before-recovery' : 'run-ended-before-recovery';
    }
    if (unfinished.length) {
      event.status = status === 'finished' ? 'race-ended-at-finish' : 'race-ended-before-recovery';
      event.reason = status === 'finished' ? 'race ended at the first line crossing before every participant recovered' : unresolvedReason;
    } else refreshEpisodeStatus(event);
  }
  const result = {
    studyAssistanceAudit: assistanceAudit,
    rulesVersion: PHYSICS.version, seed: input.seed, raceId: input.raceId,
    experiment: input.experiment, controller: settings.controller, weaving: settings.weaving, contactTreatment: settings.contact, choice: input.choice,
    inputs: { ...input },
    status, unresolvedReason, guardLimits: limits, guardEvidence, terminalStepOrdering, winner, finishTimeSeconds: finishTimeSeconds === null ? null : q(finishTimeSeconds, 1_000_000),
    trialConsumptionCount: input.trialCommitted ? 1 : 0,
    courseLength: q(COURSE_LENGTH, 1000), dt: PHYSICS.dt, horizonSeconds: q(finalTick * PHYSICS.dt, 1_000_000), ticks: finalTick,
    entrants: entrants.map((e) => ({ id: e.id, name: e.name, lane: e.lane, row: e.row, player: Boolean(e.player), performanceDraw: e.performanceDraw, sampledPerformance: q(e.sampledPerformance, 1000), topSpeed: q(e.topSpeed, 1000) })),
    trajectory,
    eventRecords: eventRecords.sort((a, b) => a.tick - b.tick || a.id.localeCompare(b.id)),
    opportunityRecords,
    finish,
    draws: { performance: entrants.length, events: drawKeys.length, total: entrants.length + drawKeys.length },
    drawKeys,
  };
  return deepFreeze(result);
}

export function resolveSeededRace(input, guardLimitOverrides) { return simulate(input, guardLimitOverrides); }

export function sampleTrajectory(resolution, tick) {
  if (!Number.isFinite(tick) || tick < 0 || tick > resolution.ticks + 1e-9) throw new RangeError('tick is outside the committed trajectory');
  const timeline = resolution.trajectory;
  if (tick <= timeline[0].tick) return timeline[0];
  for (let index = 1; index < timeline.length; index += 1) {
    const after = timeline[index];
    if (Math.abs(after.tick - tick) <= 1e-9) return after;
    if (after.tick > tick) {
      const before = timeline[index - 1];
      const fraction = (tick - before.tick) / (after.tick - before.tick);
      return interpolatedState(before.entrants, after.entrants, fraction, tick);
    }
  }
  return timeline.at(-1);
}

export function impactFixtureTrace() {
  const restitution = PHYSICS.restitution;
  const closing = 2;
  const impulse = (1 + restitution) * closing / 2;
  const duckContact = { pre: { A: 8, B: 6 }, post: { A: 8 - impulse, B: 6 + impulse }, impulse };
  const wall = { normalSpeedBefore: 10, normalSpeedAfter: -10 * restitution, tangentialSpeedBefore: 4, tangentialSpeedAfter: 4 * PHYSICS.wallTangentialDamping };
  return deepFreeze({ duckContact, wall });
}

export function rankFromSnapshot(snapshot, resolution) {
  return [...snapshot.entrants].sort((a, b) => b.progress - a.progress || Math.abs(a.lateral) - Math.abs(b.lateral) || (a.id === 'P' ? -1 : b.id === 'P' ? 1 : a.id.localeCompare(b.id)))
    .map((item) => ({ ...resolution.finish.find((e) => e.id === item.id), progress: item.progress, lateral: item.lateral, speed: item.speed }));
}

function steeringOutcomeText(detail, mode = 'target', targetAngle = detail.targetOffsetDeg) {
  const clauses = [];
  const angle = mode === 'control' ? detail.steeringDeflectionDeg : targetAngle;
  if (mode === 'control' && Number.isFinite(angle)) {
    clauses.push(`received a ${angle > 0 ? '+' : ''}${angle.toFixed(1)}-degree ID-signed steering deflection after the impact impulse`);
  } else if (Number.isFinite(angle)) {
    const target = `${angle.toFixed(1)}-degree path-relative target`;
    if (detail.acquisitionStatus === 'attained') {
      const elapsed = Number.isFinite(detail.acquiredAt) ? ` after ${(detail.acquiredAt - detail.startedAt).toFixed(2)} seconds` : '';
      clauses.push(`attained its ${target}${elapsed}`);
    } else if (detail.acquisitionStatus === 'timed-out') {
      clauses.push(`did not attain its ${target} within the 1-second acquisition limit`);
    } else if (detail.acquisitionStatus === 'cancelled-by-collision') {
      clauses.push(`its ${target} acquisition was cancelled by a later collision before it was recorded as attained`);
    } else {
      clauses.push(`had an active ${target} that was not yet recorded as attained`);
    }
  }
  if (Number.isFinite(detail.maxDeviationDeg)) clauses.push(`reached a maximum ${detail.maxDeviationDeg.toFixed(1)}-degree deviation from the course tangent`);
  if (detail.holdStatus === 'attained') clauses.push(`held the attained deviation for ${(detail.holdSeconds ?? 0).toFixed(2)} seconds`);
  else if (detail.holdStatus === 'interrupted') clauses.push(`its hold was interrupted after ${(detail.holdSeconds ?? 0).toFixed(2)} seconds`);
  else if (detail.holdStatus === 'not-attained') clauses.push('no target hold was reached');
  if (detail.recoveryStatus === 'recentered' && Number.isFinite(detail.recenteredAt)) {
    clauses.push(`returned to its assigned lane in ${(detail.recenteredAt - detail.startedAt).toFixed(2)} seconds`);
  } else if (detail.recoveryStatus === 'race-ended-before-recovery') {
    clauses.push('had not returned to its assigned lane before the finish crossing');
  } else if (detail.recoveryStatus === 'run-ended-before-recovery') {
    clauses.push('lane recovery was still in progress when the simulator stopped unresolved');
  } else if (detail.recoveryStatus === 'cancelled') {
    clauses.push('its steering recovery was cancelled by a later contact');
  }
  return clauses.join('; ');
}

export function narrativeForEvent(event, entrantsById) {
  const names = event.participants.map((id) => entrantsById[id]?.name ?? id);
  if (event.type === 'duck-contact') {
    const changes = event.participants.map((id) => {
      const before = event.pre?.[id]?.speed; const after = event.post?.[id]?.speed;
      return Number.isFinite(before) && Number.isFinite(after) ? `${entrantsById[id]?.name ?? id} ${before.toFixed(2)} to ${after.toFixed(2)} m/s` : null;
    }).filter(Boolean).join('; ');
    const recoveries = event.participants.map((id) => {
      const detail = event.recovery?.[id];
      if (!detail) return null;
      const name = entrantsById[id]?.name ?? id;
      const mode = Number.isFinite(detail.steeringDeflectionDeg) ? 'control' : 'target';
      const outcome = steeringOutcomeText(detail, mode);
      return outcome ? `${name} ${outcome}` : `${name}'s steering response is recorded without claiming a target was attained`;
    }).filter(Boolean).join('; ');
    return `${names.join(' and ')} collided. The impulse changed speed${changes ? `: ${changes}` : ''}. ${recoveries || 'Their changed headings are recorded.'}`;
  }
  if (event.type === 'weave-turn') {
    const detail = event.recovery?.[event.participants[0]];
    const target = Number.isFinite(event.targetOffsetDeg) ? `${event.targetOffsetDeg.toFixed(1)}-degree` : 'seeded path-relative';
    if (!detail) return `${names[0]} began a seeded ${target} path-relative target; its attainment and lane recovery are recorded separately.`;
    const outcome = steeringOutcomeText(detail, 'target', event.targetOffsetDeg);
    return `${names[0]} began a seeded ${target} path-relative target; ${outcome || 'attainment and recovery remain unconfirmed'}.`;
  }
  if (event.type === 'finish-line-crossing') return `${names.join(' and ')} crossed first. Remaining places are classified from their positions at that exact crossing time.`;
  if (event.type === 'wall-impact') return `${names[0]} reached the course wall, bounced, and lost speed.`;
  if (event.type === 'wall-overlap') return `${names[0]} reached the course boundary; its position was clamped without an impact impulse.`;
  if (event.type === 'catchup-sprint') return event.success ? `${names[0]} used the seeded catch-up sprint and accelerated toward its own top speed.` : `${names[0]} was eligible for a catch-up sprint, but it did not activate${event.reason.includes('already at') ? ' because the duck was already at top speed' : ''}.`;
  if (event.type === 'leader-wobble') return event.success ? `${names[0]} had a brief heading wobble and slowed to recover.` : `${names[0]} was eligible for a leader wobble, but the seeded roll did not activate it.`;
  return `${names.join(' and ')} had a recorded race event.`;
}

export function interpolateSnapshot(resolution, tickFloat) {
  const tick = clamp(tickFloat, 0, resolution.ticks);
  return sampleTrajectory(resolution, tick);
}

export function buildPresentationPlan(resolution, options = {}) {
  const duration = Number(resolution.horizonSeconds);
  const highlightSeconds = Number(options.highlightSeconds ?? 0);
  const reducedMotion = Boolean(options.reducedMotion);
  const camera = options.camera ?? 'close';
  const lighting = options.lighting ?? 'event';
  if (!Number.isFinite(duration) || duration <= 0 || ![0, 1, 2].includes(highlightSeconds)) throw new RangeError('invalid preview presentation timing');
  if (!['close', 'wide'].includes(camera) || !['event', 'off'].includes(lighting)) throw new RangeError('invalid camera or lighting setting');
  return deepFreeze({
    duration, camera, lighting, simulationTicks: resolution.ticks, highlightSeconds,
    totalWallSeconds: duration + highlightSeconds,
    checkpoints: [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.min(resolution.ticks, q(resolution.ticks * fraction, 1000))),
    reducedMotion, resultFingerprint: raceFingerprint(resolution),
  });
}

export function raceFractionAtWallClock(elapsedSeconds, { duration, highlightSeconds = 0 } = {}) {
  if (!Number.isFinite(Number(duration)) || Number(duration) <= 0 || ![0, 1, 2].includes(Number(highlightSeconds))) throw new RangeError('invalid presentation timing');
  const elapsed = clamp(elapsedSeconds, 0, Number(duration) + Number(highlightSeconds));
  if (!highlightSeconds) return elapsed / duration;
  const start = duration * 0.47; const baseLength = duration * 0.06;
  const end = start + baseLength + highlightSeconds;
  if (elapsed <= start) return elapsed / duration;
  if (elapsed < end) return 0.47 + ((elapsed - start) / (baseLength + highlightSeconds)) * 0.06;
  return Math.min(1, 0.53 + (elapsed - end) / duration);
}

export function raceFingerprint(resolution) {
  return JSON.stringify({ rulesVersion: resolution.rulesVersion, seed: resolution.seed, raceId: resolution.raceId, experiment: resolution.experiment, controller: resolution.controller, weaving: resolution.weaving, contactTreatment: resolution.contactTreatment, choice: resolution.choice, inputs: resolution.inputs, status: resolution.status, unresolvedReason: resolution.unresolvedReason, winner: resolution.winner, finishTimeSeconds: resolution.finishTimeSeconds, trialConsumptionCount: resolution.trialConsumptionCount, trajectory: resolution.trajectory, eventRecords: resolution.eventRecords, opportunityRecords: resolution.opportunityRecords, finish: resolution.finish, draws: resolution.draws, drawKeys: resolution.drawKeys });
}

export function savePresentationSnapshot(resolution, options = {}) {
  return JSON.stringify({
    version: 3,
    resolution,
    presentation: buildPresentationPlan(resolution, options),
    presentationLog: options.presentationLog ?? [],
    cursorTick: options.cursorTick ?? 0,
    finished: Boolean(options.finished),
    replayNumber: options.replayNumber ?? 0,
    started: Boolean(options.started),
  });
}

export function restorePresentationSnapshot(serialized) {
  const snapshot = JSON.parse(serialized);
  if (snapshot.version !== 3 || !snapshot.resolution || !snapshot.presentation) throw new Error('Unrecognized Plan 13 physics snapshot');
  if (raceFingerprint(snapshot.resolution) !== snapshot.presentation.resultFingerprint) throw new Error('Snapshot trajectory does not match its fingerprint');
  return deepFreeze(snapshot);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
