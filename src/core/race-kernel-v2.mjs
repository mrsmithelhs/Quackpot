// Plan 59 unmounted kernel candidate. Experimental native-float policy only;
// Physical completion does not imply controller or production readiness.
import { createRng } from './prng.mjs';
import { acceleratedSpeed, advanceAbility, bouncePhase, bounceThreat, crowdNeighbors, injuryChance, isProtected } from './race-kernel-v2-abilities.mjs';
import { advanceOvalInterval, CONTACT_POLICY } from './race-kernel-v2-boundaries.mjs';
import { COURSE_LENGTH, advanceSteeringEpisode, courseFrame, linearizeEntrant, steerEntrant, targetSpeed } from './race-kernel-v2-physics.mjs';

export const NUMERIC_POLICY = 'native-float-experimental/v1';
export const KEY_POLICY = 'utf8-length-cyrb128-sfc32/v1';

const encoder = new TextEncoder();
const MAX_COMPONENT_BYTES = 1024;
export const COURSE_POLICY = 'plan23-oval/v1';
// Diagnostic only; this rules identity is not cleared for production.
export const DIAGNOSTIC_RULES = 'plan59-diagnostic-no-injury/v1';

/** Validate and detach the complete experimental entry snapshot before any draw. */
export function validateRaceInput(input) {
  const objectWithKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
  const text = (value) => typeof value === 'string' && value.trim().length > 0
    && encoder.encode(value).length <= 64 && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value);
  if (!objectWithKeys(input, ['schema', 'rules', 'numericPolicy', 'seed', 'raceId', 'choice', 'entrants', 'course'])
      || input.schema !== 'quackpot.race-input/v2' || !['plan59-working/v1', DIAGNOSTIC_RULES].includes(input.rules)
      || input.numericPolicy !== NUMERIC_POLICY || input.course !== COURSE_POLICY
      || !text(input.seed) || !text(input.raceId) || !['steady', 'sprint'].includes(input.choice)
      || !Array.isArray(input.entrants) || input.entrants.length !== 6) throw new RangeError('invalid race input');
  const ids = new Set(), positions = new Set();
  let players = 0;
  for (const entrant of input.entrants) {
    if (!objectWithKeys(entrant, ['id', 'player', 'lane', 'row', 'baseRating', 'restFactor', 'downFactor', 'entryInjury', 'ability', 'stance'])
        || !text(entrant.id) || ids.has(entrant.id) || typeof entrant.player !== 'boolean'
        || ![1, 2].includes(entrant.lane) || ![0, 1, 2].includes(entrant.row)
        || positions.has(`${entrant.lane}:${entrant.row}`) || !Number.isFinite(entrant.baseRating)
        || entrant.baseRating <= 0 || entrant.baseRating > 100 || ![0.5, 0.75, 1].includes(entrant.restFactor)
        || ![1, 1.05].includes(entrant.downFactor) || typeof entrant.entryInjury !== 'boolean'
        || ![null, 'bounce', 'crowd'].includes(entrant.ability) || !['steady', 'sprint'].includes(entrant.stance)
        || (entrant.player && entrant.stance !== input.choice)
        || (input.rules === DIAGNOSTIC_RULES && (entrant.ability !== null || entrant.entryInjury))) throw new RangeError('invalid entrant');
    ids.add(entrant.id); positions.add(`${entrant.lane}:${entrant.row}`); players += Number(entrant.player);
  }
  if (players !== 1) throw new RangeError('exactly one player required');
  const snapshot = structuredClone(input);
  for (const entrant of snapshot.entrants) Object.freeze(entrant);
  Object.freeze(snapshot.entrants);
  return Object.freeze(snapshot);
}

/** Code-unit ordering is independent of host locale. */
export function compareIds(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') throw new TypeError('IDs must be strings');
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Prefix UTF-8 byte lengths and hex encode bytes before seeding the existing PRNG. */
export function encodeKey(parts) {
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > 16) throw new RangeError('invalid key component count');
  return parts.map((part) => {
    if (typeof part !== 'string' || !part || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(part)) throw new TypeError('invalid key component');
    const bytes = encoder.encode(part);
    if (bytes.length > MAX_COMPONENT_BYTES) throw new RangeError('key component too long');
    return `${bytes.length}:${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }).join('');
}

export function keyedDraw(seed, raceId, domain, components) {
  if (!Array.isArray(components)) throw new TypeError('components must be an array');
  const key = encodeKey([KEY_POLICY, seed, raceId, domain, ...components]);
  return { key, value: createRng(key).next() };
}

/** Rating penalty is applied before the Plan 23 affine conversion. */
export function effectiveRaceRating({ baseRating, restFactor, downFactor, injured }) {
  if (![baseRating, restFactor, downFactor].every(Number.isFinite)
    || baseRating <= 0 || baseRating > 120 || restFactor <= 0 || restFactor > 1
    || downFactor <= 0 || downFactor > 2 || typeof injured !== 'boolean') throw new RangeError('invalid rating inputs');
  const rating = baseRating * restFactor * downFactor * (injured ? 0.9 : 1);
  return { rating, affineSpeed: 8.25 + 0.5 * rating };
}

/** Pure, participant-keyed injury consequences for one committed real contact. */
export function contactInjuries({ seed, raceId, contactId, tick, participants, diagnosticNoInjury = false }) {
  if (!Number.isSafeInteger(tick) || tick < 0 || !Array.isArray(participants) || participants.length !== 2
      || participants[0].id === participants[1].id || typeof diagnosticNoInjury !== 'boolean') throw new RangeError('invalid contact injury input');
  return participants.map((participant) => {
    if (typeof participant.id !== 'string' || !participant.id || typeof participant.injured !== 'boolean'
        || !['steady', 'sprint'].includes(participant.stance)
        || ![null, 'bounce', 'crowd'].includes(participant.ability)) throw new RangeError('invalid participant');
    const protectedNow = participant.ability === 'bounce' && isProtected(participant.bounceState, tick);
    const chance = diagnosticNoInjury ? 0 : injuryChance(participant.stance, participant.injured, protectedNow);
    const draw = chance ? keyedDraw(seed, raceId, 'contact-injury/v1', [contactId, participant.id]) : null;
    return { id: participant.id, entryInjured: participant.injured, protected: protectedNow,
      chance, draw: draw?.value ?? null, key: draw?.key ?? null,
      injured: participant.injured || Boolean(draw && draw.value < chance) };
  });
}

/** Apply contact consequences to a candidate boundary, before its checkpoint commits. */
export function applyContactInjuries(candidate, boundary, { seed, raceId, tick, diagnosticNoInjury = false }) {
  if (!candidate || !Array.isArray(candidate.entrants) || !Array.isArray(candidate.events)
      || !boundary || !Array.isArray(boundary.ids) || boundary.ids.length !== 2
      || !Number.isSafeInteger(tick) || tick < 0) throw new RangeError('invalid contact boundary');
  const ids = [...boundary.ids].sort(compareIds);
  const participants = ids.map((id) => candidate.entrants.find((entrant) => entrant.id === id));
  if (ids[0] === ids[1] || participants.some((entrant) => !entrant || entrant.finished)) throw new RangeError('invalid contact participants');
  candidate.contactEpisodes ??= {};
  const pairKey = encodeKey(ids);
  const episode = candidate.contactEpisodes[pairKey] ?? 0;
  if (!Number.isSafeInteger(episode) || episode < 0 || episode >= 800) return false;
  const contactId = encodeKey(['contact/v1', raceId, ...ids, String(episode)]);
  const contact = candidate.events.at(-1);
  if (!contact || contact.kind !== 'contact' || !Array.isArray(contact.ids)
      || [...contact.ids].sort(compareIds).some((id, index) => id !== ids[index])) throw new RangeError('missing candidate contact');
  contact.id = contactId; contact.contactId = contactId;
  const boundaryTime = contact.time;
  const results = contactInjuries({ seed, raceId, contactId, tick, participants, diagnosticNoInjury });
  candidate.contactEpisodes[pairKey] = episode + 1;
  for (let i = 0; i < participants.length; i++) {
    const entrant = participants[i], result = results[i];
    candidate.events.push({ kind: 'injury-check', id: encodeKey(['injury-check/v1', contactId, entrant.id]),
      contactId, participantId: entrant.id, tick, time: boundaryTime, tickStart: contact.tickStart, phase: 'boundary', chance: result.chance, draw: result.draw,
      key: result.key, protected: result.protected, injuredBefore: result.entryInjured, injuredAfter: result.injured });
    if (!entrant.injured && result.injured) {
      entrant.injured = true;
      candidate.events.push({ kind: 'injury', id: encodeKey(['injury/v1', contactId, entrant.id]),
        contactId, participantId: entrant.id, tick, time: boundaryTime, tickStart: contact.tickStart, phase: 'boundary', chance: result.chance, draw: result.draw, key: result.key });
    }
  }
  if (contact?.kind === 'contact' && contact.impulse > 0) {
    const positions = participants.map(linearizeEntrant);
    const dx = positions[1].x - positions[0].x, dy = positions[1].y - positions[0].y;
    for (let i = 0; i < participants.length; i++) {
      const entrant = participants[i], frame = courseFrame(entrant.progress, entrant.lateral);
      const tangent = Math.atan2(frame.ty, frame.tx), outward = Math.atan2(i ? dy : -dy, i ? dx : -dx);
      const relative = Math.atan2(Math.sin(outward - tangent), Math.cos(outward - tangent));
      const sign = Math.abs(relative) < 1e-6 ? (i ? 1 : -1) : Math.sign(relative);
      const draw = keyedDraw(seed, raceId, 'contact-steering/v1', [entrant.id, contactId]);
      entrant.steeringEpisode = { kind: 'contact', phase: 'acquire', startTick: tick, sign,
        targetOffsetDeg: 15 + 5 * draw.value, heldTicks: 0, centeredTicks: 0 };
      candidate.events.push({ kind: 'contact-steering', participantId: entrant.id, contactId, tick, time: boundaryTime, tickStart: contact.tickStart, phase: 'boundary',
        sign, targetOffsetDeg: entrant.steeringEpisode.targetOffsetDeg, draw });
    }
  }
  return true;
}

/** Experimental, unmounted race loop. Unresolved preserves only committed facts. */
export function resolveRaceV2(input, { substepScale = 1 } = {}) {
  if (![1, 0.5].includes(substepScale)) throw new RangeError('invalid substep scale');
  const snapshot = validateRaceInput(input);
  const entrants = [...snapshot.entrants].sort((a, b) => compareIds(a.id, b.id)).map((entry) => {
    const performance = keyedDraw(snapshot.seed, snapshot.raceId, 'performance/v1', [entry.id]);
    const spread = entry.player && entry.stance === 'sprint' ? 0.2 : 0.05;
    const sampledRating = entry.baseRating * (1 + (2 * performance.value - 1) * spread);
    const phase = keyedDraw(snapshot.seed, snapshot.raceId, 'weave-phase/v1', [entry.id]);
    return { ...entry, injured: entry.entryInjury, sampledRating, performance, finished: false,
      progress: -entry.row * 4, lateral: entry.lane === 1 ? -0.6 : 0.6,
      assignedLaneOffset: entry.lane === 1 ? -0.6 : 0.6, heading: 0, speed: 6,
      nextWeaveTick: 1 + Math.floor(phase.value * 60), weaveOpportunity: 0, steeringEpisode: null,
      leaderSlowdownCount: 0, leaderSlowdownUntil: 0, wallEpisode: false, wallConstrained: false, assistOpportunity: 0, assistCount: 0,
      assistUntil: 0, assistCooldownUntil: 0,
      abilityState: { latched: false, absentChecks: 0, cooldownUntil: 0, activeUntil: 0, opportunity: 0, startTick: null } };
  });
  let state = { time: 0, entrants, pairs: {}, contactEpisodes: {}, events: [] };
  const trajectory = [{ tick: 0, entrants: entrants.map(({ id, progress, lateral, heading, speed }) => ({ id, progress, lateral, heading, speed })) }];
  let reason = 'watchdog', lastCommittedTick = 0, guardEvidence = null;
  for (let tick = 1; tick <= 800; tick++) {
    const before = state, candidate = structuredClone(state);
    candidate.tick = tick;
    candidate.tickStart = before.time;
    const active = candidate.entrants.filter((e) => !e.finished);
    const ranked = [...active].sort((a, b) => b.progress - a.progress || compareIds(a.id, b.id));
    const world = active.map((e) => ({ ...linearizeEntrant(e), airborne: e.ability === 'bounce' && bouncePhase(e.abilityState, tick) === 'airborne' }));
    for (const e of active) {
      const rank = ranked.findIndex((r) => r.id === e.id) + 1;
      if (e.ability) {
        const here = world.find((item) => item.id === e.id);
        const eligible = e.ability === 'bounce' ? Boolean(bounceThreat(here, world, COURSE_LENGTH))
          : !e.steeringEpisode && !here.airborne && crowdNeighbors(here, world, COURSE_LENGTH).length >= 2;
        const update = advanceAbility(e.abilityState, { kind: e.ability, tick, eligible,
          draw: (n) => keyedDraw(snapshot.seed, snapshot.raceId, 'ability-activation/v1', [e.ability, e.id, String(n)]) });
        e.abilityState = update.state;
        candidate.events.push(...update.events.map((event) => ({ ...event, participantId: e.id, time: before.time, tickStart: before.time, phase: 'tick-start' })));
      }
      e.bounceState = e.ability === 'bounce' ? { startTick: e.abilityState.startTick } : { startTick: null };
      const phase = e.ability === 'bounce' ? bouncePhase(e.bounceState, tick) : 'idle';
      e.airborne = phase === 'airborne'; e.landing = phase === 'landing';
      if (tick === e.nextWeaveTick) {
        const index = e.weaveOpportunity++;
        e.nextWeaveTick = tick + (rank <= active.length / 2 ? 60 : 120);
        if (!e.steeringEpisode && Math.abs(e.lateral - e.assignedLaneOffset) <= 0.25) {
          const sign = keyedDraw(snapshot.seed, snapshot.raceId, 'weave-sign/v1', [e.id, String(index)]);
          const magnitude = keyedDraw(snapshot.seed, snapshot.raceId, 'weave-magnitude/v1', [e.id, String(index)]);
          e.steeringEpisode = { kind: 'weave', phase: 'acquire', startTick: tick, sign: sign.value < 0.5 ? -1 : 1,
            targetOffsetDeg: 12 + 4 * magnitude.value, heldTicks: 0, centeredTicks: 0 };
          candidate.events.push({ kind: 'weave', participantId: e.id, tick, time: before.time, tickStart: before.time, phase: 'tick-start', sign, magnitude });
        }
      }
      if (tick % 40 === 0) {
        const index = e.assistOpportunity++, predecessor = ranked[rank - 2];
        if (rank > active.length / 2 && predecessor && predecessor.progress - e.progress >= 2
            && tick >= e.assistCooldownUntil && e.assistCount < 2) {
          const roll = keyedDraw(snapshot.seed, snapshot.raceId, 'rear-assistance/v1', [e.id, String(index)]);
          candidate.events.push({ kind: 'assistance-opportunity', participantId: e.id, tick, time: before.time, tickStart: before.time, phase: 'tick-start', roll });
          if (roll.value < 0.5) { e.assistUntil = tick + 40; e.assistCooldownUntil = tick + 80; e.assistCount++; }
        }
      }
      const rating = effectiveRaceRating({ baseRating: e.sampledRating, restFactor: e.restFactor, downFactor: e.downFactor, injured: e.injured });
      const target = targetSpeed(rating.affineSpeed, e.progress, e.lateral, e.speed, e.leaderSlowdownUntil > tick).targetSpeed;
      const assisted = e.assistUntil > tick;
      const crowd = e.ability === 'crowd' && e.abilityState.startTick !== null && e.abilityState.activeUntil > tick;
      e.speed = target < e.speed ? Math.max(target, e.speed - 6 * 0.05)
        : acceleratedSpeed(e.speed, target, assisted ? 5 : 3, 0.05, crowd);
      Object.assign(e, steerEntrant(e, tick, rank, assisted));
    }
    if (candidate.events.length > 512) { reason = 'event-cap'; break; }
    const boundaryCount = candidate.events.filter((event) => event.kind === 'contact' || event.kind === 'crossing').length;
    const advanced = advanceOvalInterval(candidate, 0.05, COURSE_LENGTH,
      (draft, boundary) => applyContactInjuries(draft, boundary, { seed: snapshot.seed, raceId: snapshot.raceId, tick,
        diagnosticNoInjury: snapshot.rules === DIAGNOSTIC_RULES }), substepScale);
    const nextCount = advanced.state.events.filter((event) => event.kind === 'contact' || event.kind === 'crossing').length;
    state = advanced.ok || nextCount > boundaryCount || advanced.state.time > before.time ? advanced.state : before;
    if (!advanced.ok) { reason = advanced.reason; guardEvidence = advanced.guardEvidence ?? null; break; }
    state.entrants = state.entrants.map((entrant) => {
      const rank = ranked.findIndex((item) => item.id === entrant.id) + 1;
      if (!rank || (entrant.steeringEpisode?.kind === 'contact' && entrant.steeringEpisode.startTick === tick)) return entrant;
      return advanceSteeringEpisode(entrant, tick, rank);
    });
    lastCommittedTick = tick;
    trajectory.push({ tick, entrants: state.entrants.map(({ id, progress, lateral, heading, speed }) => ({ id, progress, lateral, heading, speed })) });
    if (state.entrants.every((e) => e.finished)) { reason = null; break; }
  }
  const crossingEvents = state.events.filter((event) => event.kind === 'crossing');
  const finished = reason === null;
  const events = state.events.map((event, index) => {
    const tick = event.tick ?? Math.max(1, Math.ceil(event.time / 0.05));
    const time = event.time ?? (tick - 1) * 0.05;
    const tickStart = event.tickStart ?? (tick - 1) * 0.05;
    return { ...event, id: event.id ?? encodeKey(['event/v1', snapshot.raceId, String(index), event.kind]),
      tick, time, phase: event.phase ?? 'boundary', boundaryFraction: Math.max(0, Math.min(1, (time - tickStart) / 0.05)),
      participants: event.ids ?? (event.participantId ? [event.participantId] : []), outcome: event.outcome ?? null };
  });
  const result = { schema: 'quackpot.race-result/v2', rules: snapshot.rules, numericPolicy: snapshot.numericPolicy,
    serializationVersion: 'experimental-json/v1', contactPolicy: CONTACT_POLICY, substepScale,
    readiness: { controller: 'validation-pending', numerical: 'native-float-experimental', production: false },
    raceId: snapshot.raceId, status: finished ? 'finished' : 'unresolved',
    inputIdentity: snapshot, entrants: state.entrants.map((e) => ({ id: e.id, entryInjury: e.entryInjury,
      effectiveRatingEvidence: effectiveRaceRating({ baseRating: e.sampledRating, restFactor: e.restFactor, downFactor: e.downFactor, injured: e.injured }), finalInjury: e.injured })),
    events, crossings: crossingEvents.map((event, index) => ({ participantId: event.ids[0], time: event.time,
      place: finished ? index + 1 : null })), trajectory,
    retainedInjuries: state.events.filter((event) => event.kind === 'injury').map((event) => ({ participantId: event.participantId, eventId: event.id })),
    unresolved: finished ? null : { reason, lastCommittedTick, guardEvidence } };
  const finiteJson = (value) => value === null || typeof value === 'string' || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))
    || (Array.isArray(value) && value.every(finiteJson))
    || (typeof value === 'object' && Object.values(value).every(finiteJson));
  if (events.length > 512 || trajectory.length > 801 || new Set(events.map((event) => event.id)).size !== events.length
      || !finiteJson(result)) throw new RangeError('invalid experimental race result');
  return result;
}
