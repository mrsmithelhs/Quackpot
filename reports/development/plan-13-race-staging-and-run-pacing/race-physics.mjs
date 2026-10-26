import { createRng } from '../../../src/core/prng.mjs';

export const PHYSICS = Object.freeze({
  version: 'plan13-physics-v2',
  dt: 0.05,
  horizons: Object.freeze({ 12: 240, 20: 400, 30: 600 }),
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
  sprintCheckpoint: 0.5,
  sprintChance: 0.5,
  sprintAcceleration: 3,
  sprintDurationSeconds: 1,
  wobbleCheckpoints: Object.freeze([0.5, 0.75]),
  wobbleChance: 0.1,
  wobbleAngleDeg: 5,
  wobbleSpeedFactor: 0.8,
  wobbleDurationSeconds: 0.5,
  maxEvents: 64,
  maxTicks: 600,
  payoutByPlace: Object.freeze([50, 20, 10]),
});

const CHOICES = new Set(['steady', 'sprint', 'drafting']);
const MODES = new Set(['baseline', 'catchup', 'wobble', 'combined']);
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
  if (!MODES.has(input.model)) throw new RangeError(`unsupported physics mode: ${input.model}`);
  if (![12, 20, 30].includes(Number(input.duration))) throw new RangeError('race horizon must be 12, 20, or 30 seconds');
  if (!Number.isFinite(input.playerBaseSpeed) || input.playerBaseSpeed <= 0) throw new RangeError('playerBaseSpeed must be positive');
  if (!Number.isFinite(input.fieldBaseSpeed) || input.fieldBaseSpeed <= 0) throw new RangeError('fieldBaseSpeed must be positive');
}

function eventDraw(seed, raceId, tick, kind, ids = 'field', episode = 0) {
  const stableIds = [...String(ids).split(/[;,]/)].sort().join(',');
  const key = `plan13/v2|${raceId}|${tick}|${kind}|${stableIds}|${episode}`;
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
      lateral: spec.lane === 1 ? -PHYSICS.laneOffset : PHYSICS.laneOffset,
      heading: 0,
      acceleration: PHYSICS.baseAcceleration,
      wobbleUntil: -1,
      sprintUntil: -1,
      sprintUsed: false,
      wobbleUsed: false,
      wallEpisode: false,
      lastPosition: null,
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

function processAssistEvents(entrants, input, tick, totalTicks, records, keys) {
  const fraction = tick / totalTicks;
  const addEvent = (type, entrant, draw, details) => {
    records.push({ id: `${type}-${tick}-${entrant.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type, participants: [entrant.id], draw: draw.value, drawKey: draw.key, ...details });
    keys.push(draw.key);
  };
  if (input.model === 'catchup' || input.model === 'combined') {
    const checkpoint = Math.round(totalTicks * PHYSICS.sprintCheckpoint);
    if (tick === checkpoint) {
      const order = rankAt(entrants);
      for (const entrant of order.slice(-2)) {
        const draw = eventDraw(input.seed, input.raceId, tick, 'catchup-sprint', entrant.id);
        keys.push(draw.key);
        entrant.sprintUsed = true;
        const success = draw.value < PHYSICS.sprintChance;
        const noRoom = entrant.speed >= entrant.topSpeed - 1e-9;
        if (success && !noRoom) entrant.sprintUntil = tick + Math.round(PHYSICS.sprintDurationSeconds / PHYSICS.dt);
        addEvent('catchup-sprint', entrant, draw, {
          eligible: true, success, effect: success && !noRoom ? 'temporary acceleration' : 'no effect',
          reason: noRoom ? 'already at own top speed' : success ? 'seeded sprint roll succeeded' : 'seeded sprint roll did not activate',
        });
      }
    }
  }
  if (input.model === 'wobble' || input.model === 'combined') {
    const checkpoint = PHYSICS.wobbleCheckpoints.find((value) => tick === Math.round(totalTicks * value));
    if (checkpoint !== undefined) {
      const order = rankAt(entrants);
      for (const entrant of order.slice(0, 2)) {
        if (entrant.wobbleUsed) continue;
        const draw = eventDraw(input.seed, input.raceId, tick, 'leader-wobble', entrant.id);
        keys.push(draw.key);
        entrant.wobbleUsed = true;
        const success = draw.value < PHYSICS.wobbleChance;
        if (success) {
          const sign = draw.value % PHYSICS.wobbleChance < PHYSICS.wobbleChance / 2 ? -1 : 1;
          entrant.heading += sign * PHYSICS.wobbleAngleDeg * Math.PI / 180;
          entrant.wobbleUntil = tick + Math.round(PHYSICS.wobbleDurationSeconds / PHYSICS.dt);
        }
        addEvent('leader-wobble', entrant, draw, {
          eligible: true, success, effect: success ? 'heading perturbation and brief speed cap' : 'no effect',
          reason: success ? `${signText(draw.value)}5 degree wobble; recovery cap` : 'seeded wobble roll did not activate',
        });
      }
    }
  }
  void fraction;
}

function signText(draw) { return draw % PHYSICS.wobbleChance < PHYSICS.wobbleChance / 2 ? '−' : '+'; }

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
  const angle = PHYSICS.collisionDeflectionDeg * Math.PI / 180;
  const sign = a.id.localeCompare(b.id) <= 0 ? 1 : -1;
  const rotate = (vector, radians) => ({ x: vector.x * Math.cos(radians) - vector.y * Math.sin(radians), y: vector.x * Math.sin(radians) + vector.y * Math.cos(radians) });
  const ar = rotate(av, sign * angle); const br = rotate(bv, -sign * angle);
  setVelocity(a, ar.x, ar.y, tick); setVelocity(b, br.x, br.y, tick);
  const post = current;
  const separation = Math.hypot(post[b.id].x - post[a.id].x, post[b.id].y - post[a.id].y);
  if (separation < PHYSICS.duckRadius * 2) {
    const correction = (PHYSICS.duckRadius * 2 - separation) / 2 + 0.001;
    const fa = frameAt(a.progress, a.lateral); const fb = frameAt(b.progress, b.lateral);
    a.lateral = clamp(a.lateral - correction * (nx * fa.nx + ny * fa.ny), -PHYSICS.corridorHalfWidth, PHYSICS.corridorHalfWidth);
    b.lateral = clamp(b.lateral + correction * (nx * fb.nx + ny * fb.ny), -PHYSICS.corridorHalfWidth, PHYSICS.corridorHalfWidth);
  }
  records.push({
    id: `duck-contact-${tick}-${a.id}-${b.id}`, tick, time: q(tick * PHYSICS.dt, 1000), type: 'duck-contact',
    participants: [a.id, b.id].sort(), effect: 'symmetric impulse, 6 degree outward deflection and recovery through acceleration',
    relativeClosingSpeed: q(-relativeNormal, 1000), restitution: PHYSICS.restitution,
    pre: { [a.id]: { vx: q(va.x, 1000), vy: q(va.y, 1000), speed: q(Math.hypot(va.x, va.y), 1000) }, [b.id]: { vx: q(vb.x, 1000), vy: q(vb.y, 1000), speed: q(Math.hypot(vb.x, vb.y), 1000) } },
    post: { [a.id]: { vx: q(ar.x, 1000), vy: q(ar.y, 1000), speed: q(a.speed, 1000) }, [b.id]: { vx: q(br.x, 1000), vy: q(br.y, 1000), speed: q(b.speed, 1000) } },
    eligible: true, selectorKey: selector.key,
    eligiblePairCount: candidates.length,
  });
}

function simulate(input) {
  validate(input);
  const horizon = Number(input.duration);
  const ticks = PHYSICS.horizons[horizon];
  if (ticks > PHYSICS.maxTicks) throw new RangeError('simulation exceeds the tick budget');
  const entrants = makeEntrants(input);
  for (const e of entrants) e.heading = angleOf(frameAt(e.progress, e.lateral));
  const eventRecords = [];
  const drawKeys = [];
  const trajectory = [copyState(entrants, 0)];
  let priorPositions = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
  for (let tick = 1; tick <= ticks; tick += 1) {
    processAssistEvents(entrants, input, tick, ticks, eventRecords, drawKeys);
    for (const e of entrants) {
      const frame = frameAt(e.progress, e.lateral);
      const currentAngle = angleOf(frame);
      const desired = angleOf(frameAt(e.progress, e.lane === 1 ? -PHYSICS.laneOffset : PHYSICS.laneOffset));
      let targetSpeed = e.topSpeed;
      const curveDistance = nextCurveDistance(e.progress);
      const targetCornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));
      const stopping = Math.max(0, (e.speed * e.speed - targetCornerSpeed * targetCornerSpeed) / (2 * PHYSICS.braking));
      if (curveDistance <= stopping + e.speed * PHYSICS.dt) targetSpeed = Math.min(targetSpeed, targetCornerSpeed);
      if (tick < e.wobbleUntil) targetSpeed = Math.min(targetSpeed, e.topSpeed * PHYSICS.wobbleSpeedFactor);
      const sprinting = tick < e.sprintUntil && e.speed < e.topSpeed;
      e.acceleration = PHYSICS.baseAcceleration + (sprinting ? PHYSICS.sprintAcceleration : 0);
      e.speed = targetSpeed < e.speed
        ? Math.max(targetSpeed, e.speed - PHYSICS.braking * PHYSICS.dt)
        : Math.min(targetSpeed, e.speed + e.acceleration * PHYSICS.dt);
      const desiredHeading = desired + (tick < e.wobbleUntil ? 0 : 0);
      const turnRadians = Math.min(Math.abs(angleDelta(desiredHeading, e.heading)), turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt);
      e.heading += Math.sign(angleDelta(desiredHeading, e.heading)) * turnRadians;
      const error = angleDelta(e.heading, currentAngle);
      e.progress += e.speed * Math.cos(error) * PHYSICS.dt;
      e.lateral += e.speed * Math.sin(error) * PHYSICS.dt;
      if (Math.abs(e.lateral) > PHYSICS.corridorHalfWidth) resolveWall(e, tick, eventRecords);
    }
    resolveOneDuckContact(entrants, tick, input, eventRecords, drawKeys, priorPositions);
    if (eventRecords.length > PHYSICS.maxEvents) throw new RangeError('race event record exceeds the event budget');
    trajectory.push(copyState(entrants, tick));
    priorPositions = Object.fromEntries(entrants.map((e) => [e.id, pos(e)]));
  }
  const finish = rankAt(entrants).map((e, index) => ({
    id: e.id, name: e.name, lane: e.lane, player: Boolean(e.player),
    speed: q(e.speed, 1000), topSpeed: q(e.topSpeed, 1000), score: q(e.progress, 1000),
    progress: q(e.progress, 1000), lateral: q(e.lateral, 1000), place: index + 1,
    payout: PHYSICS.payoutByPlace[index] ?? 0,
  }));
  const result = {
    rulesVersion: PHYSICS.version, seed: input.seed, raceId: input.raceId,
    model: input.model, choice: input.choice,
    inputs: { ...input, duration: horizon },
    trialConsumptionCount: input.trialCommitted ? 1 : 0,
    courseLength: q(COURSE_LENGTH, 1000), dt: PHYSICS.dt, horizonSeconds: horizon, ticks,
    entrants: entrants.map((e) => ({ id: e.id, name: e.name, lane: e.lane, row: e.row, player: Boolean(e.player), performanceDraw: e.performanceDraw, sampledPerformance: q(e.sampledPerformance, 1000), topSpeed: q(e.topSpeed, 1000) })),
    trajectory,
    eventRecords: eventRecords.sort((a, b) => a.tick - b.tick || a.id.localeCompare(b.id)),
    finish,
    draws: { performance: entrants.length, events: drawKeys.length, total: entrants.length + drawKeys.length },
    drawKeys,
  };
  return deepFreeze(result);
}

export function resolveSeededRace(input) { return simulate(input); }

export function sampleTrajectory(resolution, tick) {
  if (!Number.isInteger(tick) || tick < 0 || tick > resolution.ticks) throw new RangeError('tick is outside the committed trajectory');
  return resolution.trajectory[tick];
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
  if (event.type === 'duck-contact') return `${names.join(' and ')} made contact. Their headings and speeds changed; the simulation records the recovery from this point.`;
  if (event.type === 'wall-impact') return `${names[0]} reached the course wall, bounced, and lost speed.`;
  if (event.type === 'wall-overlap') return `${names[0]} reached the course boundary; its position was clamped without an impact impulse.`;
  if (event.type === 'catchup-sprint') return event.success ? `${names[0]} used the seeded catch-up sprint and accelerated toward its own top speed.` : `${names[0]} was eligible for a catch-up sprint, but it did not activate${event.reason.includes('already at') ? ' because the duck was already at top speed' : ''}.`;
  if (event.type === 'leader-wobble') return event.success ? `${names[0]} had a brief heading wobble and slowed to recover.` : `${names[0]} was eligible for a leader wobble, but the seeded roll did not activate it.`;
  return `${names.join(' and ')} had a recorded race event.`;
}

export function interpolateSnapshot(resolution, tickFloat) {
  const tick = clamp(tickFloat, 0, resolution.ticks);
  const before = Math.floor(tick); const after = Math.min(resolution.ticks, Math.ceil(tick));
  if (before === after) return sampleTrajectory(resolution, before);
  const ratio = tick - before;
  const a = sampleTrajectory(resolution, before); const b = sampleTrajectory(resolution, after);
  return { tick: q(tick, 1000), entrants: a.entrants.map((item, i) => {
    const next = b.entrants[i];
    return Object.fromEntries(['progress', 'lateral', 'heading', 'speed', 'x', 'y'].map((key) => [key, item[key] + (next[key] - item[key]) * ratio]).concat([['id', item.id]]));
  }) };
}

export function buildPresentationPlan(resolution, options = {}) {
  const duration = Number(options.duration ?? resolution.horizonSeconds ?? 20);
  const highlightSeconds = Number(options.highlightSeconds ?? 0);
  const reducedMotion = Boolean(options.reducedMotion);
  const camera = options.camera ?? 'close';
  const lighting = options.lighting ?? 'event';
  if (![12, 20, 30].includes(duration) || ![0, 1, 2].includes(highlightSeconds)) throw new RangeError('invalid preview presentation timing');
  if (!['close', 'wide'].includes(camera) || !['event', 'off'].includes(lighting)) throw new RangeError('invalid camera or lighting setting');
  return deepFreeze({
    duration, camera, lighting, simulationTicks: resolution.ticks, highlightSeconds,
    totalWallSeconds: duration + highlightSeconds,
    checkpoints: [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(resolution.ticks * fraction)),
    reducedMotion, resultFingerprint: raceFingerprint(resolution),
  });
}

export function raceFractionAtWallClock(elapsedSeconds, { duration, highlightSeconds = 0 } = {}) {
  if (![12, 20, 30].includes(Number(duration)) || ![0, 1, 2].includes(Number(highlightSeconds))) throw new RangeError('invalid presentation timing');
  const elapsed = clamp(elapsedSeconds, 0, Number(duration) + Number(highlightSeconds));
  if (!highlightSeconds) return elapsed / duration;
  const start = duration * 0.47; const baseLength = duration * 0.06;
  const end = start + baseLength + highlightSeconds;
  if (elapsed <= start) return elapsed / duration;
  if (elapsed < end) return 0.47 + ((elapsed - start) / (baseLength + highlightSeconds)) * 0.06;
  return Math.min(1, 0.53 + (elapsed - end) / duration);
}

export function raceFingerprint(resolution) {
  return JSON.stringify({ rulesVersion: resolution.rulesVersion, seed: resolution.seed, raceId: resolution.raceId, model: resolution.model, choice: resolution.choice, inputs: resolution.inputs, trialConsumptionCount: resolution.trialConsumptionCount, trajectory: resolution.trajectory, eventRecords: resolution.eventRecords, finish: resolution.finish, draws: resolution.draws, drawKeys: resolution.drawKeys });
}

export function savePresentationSnapshot(resolution, options = {}) {
  return JSON.stringify({
    version: 2,
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
  if (snapshot.version !== 2 || !snapshot.resolution || !snapshot.presentation) throw new Error('Unrecognized Plan 13 physics snapshot');
  if (raceFingerprint(snapshot.resolution) !== snapshot.presentation.resultFingerprint) throw new Error('Snapshot trajectory does not match its fingerprint');
  return deepFreeze(snapshot);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
