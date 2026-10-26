import { createRng } from '../../../src/core/prng.mjs';

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

function makeEntrants(input) {
  const root = createRng(input.seed).fork(`plan13/v2/race:${input.raceId}`);
  const performance = root.fork('performance');
  return ENTRANTS.map((spec) => {
    const draw = performance.next();
    const base = spec.player
      ? input.playerBaseSpeed * (input.trialCommitted ? 1.05 : 1)
      : input.fieldBaseSpeed;
    const sampled = spec.player && input.choice === 'sprint'
      ? base * 1.1 * (1 + (2 * draw - 1) * 0.2)
      : base * (1 + (2 * draw - 1) * 0.05);
    const rowProgress = -spec.row * PHYSICS.rowSpacing;
    return {
      ...spec,
      performanceDraw: draw,
      sampledPerformance: sampled,
      topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed),
      speed: 6,
      progress: rowProgress,
      assignedLaneOffset: spec.lane === 1 ? -PHYSICS.laneOffset : PHYSICS.laneOffset,
      lateral: spec.lane === 1 ? -PHYSICS.laneOffset : PHYSICS.laneOffset,
      heading: 0,
      acceleration: PHYSICS.baseAcceleration,
      wallEpisode: false,
      steeringEpisode: null,
      nextWeaveTick: null,
      weaveOpportunityIndex: 0,
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

function beginRecovery(entrant, event, tick, kind = 'recovery') {
  entrant.steeringEpisode = { kind, phase: 'recover', startTick: tick, record: event, settledTicks: 0 };
  event.recovery[entrant.id] = { startedAt: q(tick * PHYSICS.dt, 1000), yawRecoveredAt: null, recenteredAt: null };
}

function initializeWeaveSchedules(entrants, input, drawKeys) {
  if (weavingType(input) === 'none') return;
  for (const entrant of entrants) {
    const phase = latentDraw(input.seed, input.raceId, 'weave-phase', entrant.id, 0);
    entrant.nextWeaveTick = 1 + Math.floor(phase.value * PHYSICS.weaveInitialPhaseTicks);
    drawKeys.push(phase.key);
  }
}

function processWeaveDue(entrants, input, tick, diagnostics, eventRecords, drawKeys) {
  const treatment = weavingType(input);
  if (treatment === 'none') return false;
  const dueEntrants = entrants.filter((entrant) => entrant.nextWeaveTick === tick);
  if (!dueEntrants.length) return false;
  const rank = rankAt(entrants);
  const rankById = new Map(rank.map((entrant, index) => [entrant.id, index + 1]));
  for (const entrant of dueEntrants.sort((a, b) => a.id.localeCompare(b.id))) {
    if (diagnostics.length >= PHYSICS.maxOpportunityDiagnostics) return true;
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
    record.recovery[entrant.id] = { startedAt: q(tick * PHYSICS.dt, 1000), acquiredAt: null, holdStartAt: null, holdSeconds: 0, yawRecoveredAt: null, recenteredAt: null, maxDeviationDeg: 0 };
    entrant.steeringEpisode = {
      kind: 'weave', phase: 'acquire', sign, targetOffsetDeg: magnitude,
      startTick: tick, heldTicks: 0, record,
    };
    record.success = true;
    eventRecords.push(record);
    diagnostic.eventId = record.id;
    diagnostic.signKey = signDraw.key;
    diagnostic.magnitudeKey = magnitudeDraw.key;
  }
  return false;
}

function advanceSteeringEpisode(entrant, tick, controller) {
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
      episode.record.status = 'holding';
      if (detail) { detail.acquiredAt = q(tick * PHYSICS.dt, 1000); detail.holdStartAt = detail.acquiredAt; }
      return;
    }
    if (tick - episode.startTick >= PHYSICS.steeringAcquireTimeoutTicks) {
      episode.phase = 'recover'; episode.record.status = 'acquisition-timeout';
      episode.record.reason = 'target was not attained within the 1-second acquisition limit';
      if (detail) detail.holdSeconds = 0;
    }
    return;
  }
  if (episode.phase === 'hold') {
    const target = offsetTarget(entrant, episode.sign, episode.targetOffsetDeg);
    const maintained = headingErrorDegrees(entrant.heading, target) <= PHYSICS.recoveryHeadingToleranceDeg && Math.abs(actualOffset) >= 10;
    if (!maintained) {
      episode.phase = 'recover'; episode.record.status = 'hold-interrupted';
      episode.record.reason = 'turn cap or curve change interrupted the 10-degree held deviation';
    } else {
      episode.heldTicks += 1;
      if (detail) detail.holdSeconds = q(episode.heldTicks * PHYSICS.dt, 1000);
      if (episode.heldTicks >= PHYSICS.weaveHoldTicks) {
        episode.phase = 'recover'; episode.record.status = 'recovering';
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
    if (detail) detail.recenteredAt = q(tick * PHYSICS.dt, 1000);
    episode.record.status = episode.record.status === 'acquisition-timeout' || episode.record.status === 'hold-interrupted'
      ? episode.record.status : 'recentered';
    entrant.steeringEpisode = null;
  }
}

function resolveWall(entrant, tick, records) {
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
    records.push({ id: `wall-${tick}-${entrant.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type: 'wall-impact', participants: [entrant.id], effect: 'bounded bounce and tangential slowdown', normalClosingSpeed: q(closing, 1000), speedBefore: q(Math.hypot(v.x, v.y), 1000), speedAfter: q(entrant.speed, 1000), eligible: true });
    return true;
  }
  entrant.wallEpisode = true;
  records.push({ id: `wall-overlap-${tick}-${entrant.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type: 'wall-overlap', participants: [entrant.id], effect: 'position clamped; no impact impulse', normalClosingSpeed: q(closing, 1000), eligible: false });
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

function resolveOneDuckContact(entrants, tick, input, records, keys, previous) {
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
    eligible: true, selectorKey: selector.key, eligiblePairCount: candidates.length, recovery: {},
  };
  for (const [entrant, outward] of [[a, { x: -nx, y: -ny }], [b, { x: nx, y: ny }]]) {
    if (entrant.steeringEpisode?.kind === 'weave') {
      const prior = entrant.steeringEpisode;
      prior.record.status = 'cancelled_by_collision';
      prior.record.reason = 'duck contact took steering priority';
      const priorDetail = prior.record.recovery?.[entrant.id];
      if (priorDetail) priorDetail.cancelledAt = q(tick * PHYSICS.dt, 1000);
    }
    const tangent = tangentHeading(entrant);
    const outwardAngle = Math.atan2(outward.y, outward.x);
    const cross = angleDelta(outwardAngle, tangent);
    const direction = Math.abs(cross) < 1e-6
      ? (entrant === a ? -1 : 1)
      : Math.sign(cross);
    if (contactType(input) === 'control') {
      beginRecovery(entrant, record, tick, 'contact-recovery');
      recoveryTargets[entrant.id] = { controlDeflectionDeg: PHYSICS.collisionDeflectionDeg, outwardSign: direction };
      continue;
    }
    const magnitudeDraw = latentDraw(input.seed, input.raceId, 'contact-angle', entrant.id, 0);
    keys.push(magnitudeDraw.key);
    const magnitude = PHYSICS.strongContactMinDeg + magnitudeDraw.value * (PHYSICS.strongContactMaxDeg - PHYSICS.strongContactMinDeg);
    const detail = { startedAt: q(tick * PHYSICS.dt, 1000), yawRecoveredAt: null, recenteredAt: null, targetOffsetDeg: q(magnitude, 1000), outwardSign: direction, magnitudeKey: magnitudeDraw.key, maxDeviationDeg: 0 };
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
  records.push(record);
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

function simulate(input) {
  validate(input);
  const settings = EXPERIMENTS[input.experiment];
  const entrants = makeEntrants(input);
  for (const entrant of entrants) entrant.heading = tangentHeading(entrant);
  const eventRecords = [];
  const opportunityRecords = [];
  const drawKeys = [];
  initializeWeaveSchedules(entrants, input, drawKeys);
  const trajectory = [copyState(entrants, 0)];
  let priorPositions = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
  let status = 'unresolved';
  let unresolvedReason = 'line_not_crossed_before_watchdog';
  let finish = [];
  let finishTimeSeconds = null;
  let winner = null;
  for (let tick = 1; tick <= PHYSICS.maxTicks; tick += 1) {
    if (processWeaveDue(entrants, input, tick, opportunityRecords, eventRecords, drawKeys)) {
      unresolvedReason = 'opportunity_diagnostic_cap';
      break;
    }
    const before = entrants.map((e) => ({ id: e.id, progress: e.progress, lateral: e.lateral, heading: e.heading, speed: e.speed }));
    for (const e of entrants) {
      const frame = frameAt(e.progress, e.lateral);
      let targetSpeed = e.topSpeed;
      const curveDistance = nextCurveDistance(e.progress);
      const targetCornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));
      const stopping = Math.max(0, (e.speed * e.speed - targetCornerSpeed * targetCornerSpeed) / (2 * PHYSICS.braking));
      if (curveDistance <= stopping + e.speed * PHYSICS.dt) targetSpeed = Math.min(targetSpeed, targetCornerSpeed);
      e.acceleration = PHYSICS.baseAcceleration;
      e.speed = targetSpeed < e.speed
        ? Math.max(targetSpeed, e.speed - PHYSICS.braking * PHYSICS.dt)
        : Math.min(targetSpeed, e.speed + e.acceleration * PHYSICS.dt);
      let desiredHeading = controllerHeading(e, settings.controller);
      const episode = e.steeringEpisode;
      if (episode && ['acquire', 'hold'].includes(episode.phase)) {
        desiredHeading = offsetTarget(e, episode.sign, episode.targetOffsetDeg);
      }
      const turnRadians = Math.min(Math.abs(angleDelta(desiredHeading, e.heading)), turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt);
      e.heading += Math.sign(angleDelta(desiredHeading, e.heading)) * turnRadians;
      const error = angleDelta(e.heading, angleOf(frame));
      e.progress += e.speed * Math.cos(error) * PHYSICS.dt;
      e.lateral += e.speed * Math.sin(error) * PHYSICS.dt;
      advanceSteeringEpisode(e, tick, settings.controller);
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
      const crossingIds = crossed.filter((item) => Math.abs(item.fraction - firstFraction) * PHYSICS.dt <= 1e-9).map((item) => item.id);
      const terminalTick = tick - 1 + firstFraction;
      const terminal = interpolatedState(before, entrants, firstFraction, terminalTick);
      for (const item of terminal.entrants) if (crossingIds.includes(item.id)) item.progress = q(COURSE_LENGTH, 1000);
      trajectory.push(terminal);
      if (eventRecords.length >= PHYSICS.maxMechanicalEvents) {
        status = 'unresolved'; unresolvedReason = 'mechanical_event_cap';
        break;
      }
      finishTimeSeconds = terminalTick * PHYSICS.dt;
      finish = finishOrderAt(terminal, entrants, crossingIds);
      winner = finish[0]?.id ?? null;
      eventRecords.push({
        id: `finish-line-${tick}-${crossingIds.join('-')}`, tick: terminalTick, time: q(finishTimeSeconds, 1_000_000),
        type: 'finish-line-crossing', participants: crossingIds, eligible: true,
        effect: `${crossingIds.join(' and ')} crossed first; all remaining places are classified at that same instant`,
      });
      status = 'finished'; unresolvedReason = null;
      break;
    }
    for (const e of entrants) if (Math.abs(e.lateral) > PHYSICS.corridorHalfWidth) resolveWall(e, tick, eventRecords);
    resolveOneDuckContact(entrants, tick, input, eventRecords, drawKeys, priorPositions);
    if (eventRecords.length > PHYSICS.maxMechanicalEvents) {
      status = 'unresolved'; unresolvedReason = 'mechanical_event_cap';
      break;
    }
    trajectory.push(copyState(entrants, tick));
    priorPositions = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
  }
  const finalTick = trajectory.at(-1).tick;
  for (const event of eventRecords) if (event.status === 'active' || event.status === 'holding' || event.status === 'recovering') {
    event.status = status === 'finished' ? 'race-ended-at-finish' : 'race-ended-before-recovery';
    event.reason = status === 'finished' ? 'race ended at the first line crossing' : unresolvedReason;
  }
  const result = {
    rulesVersion: PHYSICS.version, seed: input.seed, raceId: input.raceId,
    experiment: input.experiment, controller: settings.controller, weaving: settings.weaving, contactTreatment: settings.contact, choice: input.choice,
    inputs: { ...input },
    status, unresolvedReason, winner, finishTimeSeconds: finishTimeSeconds === null ? null : q(finishTimeSeconds, 1_000_000),
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

export function resolveSeededRace(input) { return simulate(input); }

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
      const angle = detail.targetOffsetDeg ?? event.recoveryTargets?.[id]?.controlDeflectionDeg;
      const turn = Number.isFinite(angle) ? ` turned ${angle.toFixed(1)} degrees away` : ' changed heading';
      const held = Number.isFinite(detail.holdSeconds) && detail.holdSeconds > 0 ? ` and held that turn for ${detail.holdSeconds.toFixed(2)} seconds` : '';
      const lane = Number.isFinite(detail.recenteredAt) ? `, returning to lane in ${(detail.recenteredAt - detail.startedAt).toFixed(2)} seconds` : ', with lane recovery still in progress when the race ended';
      return `${name}${turn}${held}${lane}`;
    }).filter(Boolean).join('; ');
    return `${names.join(' and ')} collided. The impulse changed speed${changes ? `: ${changes}` : ''}. ${recoveries || 'Their changed headings are recorded.'}`;
  }
  if (event.type === 'weave-turn') {
    const detail = event.recovery?.[event.participants[0]];
    const target = Number.isFinite(event.targetOffsetDeg) ? `${event.targetOffsetDeg.toFixed(1)}-degree` : 'seeded path-relative';
    if (!detail) return `${names[0]} began a ${target} turn; its acquisition and lane recovery are recorded.`;
    const hold = detail.holdSeconds > 0 ? `held the turn for ${detail.holdSeconds.toFixed(2)} seconds` : 'did not attain the 0.5-second hold';
    const lane = Number.isFinite(detail.recenteredAt) ? `returned to lane in ${(detail.recenteredAt - detail.startedAt).toFixed(2)} seconds` : 'had not returned to lane when the race ended';
    const outcome = event.reason ? ` ${event.reason}.` : '';
    return `${names[0]} began a seeded ${target} path-relative turn, ${hold}, and ${lane}.${outcome}`;
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
