// Unmounted Plan 59 candidate: swept circle boundaries in course coordinates.
// Experimental native-float arithmetic; no replay portability is implied.
import { advanceCourse, applyWorldVelocity, linearizeEntrant } from './race-kernel-v2-physics.mjs';
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;

// Diagnostic limits, not a production precision or cross-runtime contract.
const CONTACT_TIME_RESOLUTION = 1e-7; // seconds
const MAX_FIRST_CONTACT_BRACKET = 1e-6; // diagnostic seconds, not an adopted gameplay tolerance
const MAX_CONTACT_EVALUATIONS = 4096;

/** Conservative left-to-right curved-distance search for locally linear course motion. */
export function findOvalContact(a, b, duration) {
  if (!Number.isFinite(duration) || duration < 0 || duration > 0.05
      || [a, b].some((e) => ![e.progress, e.lateral, e.speed, e.heading].every(Number.isFinite)
        || Math.abs(e.lateral) > 6 || e.speed < 0 || e.speed > 100)) throw new RangeError('invalid curved search input');
  let evaluations = 0;
  const distance = (t) => {
    if (++evaluations > MAX_CONTACT_EVALUATIONS) throw new RangeError('evaluation-cap');
    const x = linearizeEntrant(advanceCourse(a, t)), y = linearizeEntrant(advanceCourse(b, t));
    return Math.hypot(x.x - y.x, x.y - y.y);
  };
  const bound = 2 * (a.speed + b.speed); // Course mapping slope is < 2 within |lateral| <= 6.
  try {
    const d0 = distance(0), d1 = distance(duration);
    if (d0 < 1) return { status: 'initial-overlap', evaluations, separation: d0 };
    if (d0 === 1) return { status: 'initial-contact', evaluations, separation: d0 };
    let firstUncertain = null;
    const search = (lo, hi, dl, dh) => {
      if (firstUncertain !== null && lo - firstUncertain.time > MAX_FIRST_CONTACT_BRACKET)
        return { status: 'unresolved', reason: 'possible-earlier-contact', outside: firstUncertain.time, inside: null };
      if (Math.min(dl, dh) - bound * (hi - lo) / 2 > 1) return null;
      if (hi - lo <= CONTACT_TIME_RESOLUTION) {
        if (firstUncertain === null) firstUncertain = { time: lo, distance: dl };
        if (dh <= 1) {
          if (hi - firstUncertain.time <= MAX_FIRST_CONTACT_BRACKET)
            return { status: 'contact', outside: firstUncertain.time, inside: hi, outsideDistance: firstUncertain.distance, insideDistance: dh };
          return { status: 'unresolved', reason: 'wide-first-contact-bracket', outside: firstUncertain.time, inside: hi };
        }
        return null;
      }
      const mid = (lo + hi) / 2, dm = distance(mid);
      return search(lo, mid, dl, dm) ?? search(mid, hi, dm, dh);
    };
    const result = search(0, duration, d0, d1);
    return result ? { ...result, evaluations } : firstUncertain
      ? { status: 'unresolved', reason: 'possible-grazing', outside: firstUncertain.time, inside: null, evaluations }
      : { status: 'clear', evaluations };
  } catch (error) {
    if (error instanceof RangeError && error.message === 'evaluation-cap') return { status: 'unresolved', reason: 'evaluation-cap', evaluations };
    throw error;
  }
}

/** First approach to a unit-diameter circle over the supplied interval. */
export function sweptContact(a, b, remaining) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const vx = b.vx - a.vx, vy = b.vy - a.vy;
  const distance2 = dx * dx + dy * dy;
  const closing = dx * vx + dy * vy;
  if (distance2 <= 1) return closing < 0 ? 0 : null;
  const speed2 = vx * vx + vy * vy;
  if (speed2 === 0 || closing >= 0) return null;
  const discriminant = closing * closing - speed2 * (distance2 - 1);
  if (discriminant < 0) return null;
  const t = (-closing - Math.sqrt(discriminant)) / speed2;
  return t >= 0 && t <= remaining ? t : null;
}

/** Recomputes the next physical event from the current post-boundary state. */
export function nextBoundary(entrants, pairs, now, remaining, finish) {
  const active = entrants.filter((e) => !e.finished).sort((a, b) => order(a.id, b.id));
  const candidates = [];
  for (const e of active) {
    if (e.vx > 0 && e.x <= finish) {
      const time = (finish - e.x) / e.vx;
      if (time >= 0 && time <= remaining) candidates.push({ kind: 'crossing', time, ids: [e.id] });
    }
  }
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    const a = active[i], b = active[j], id = JSON.stringify([a.id, b.id]);
    const prior = pairs[id];
    if (prior && !(prior.separated && now - prior.time >= 0.5)) continue;
    const time = sweptContact(a, b, remaining);
    if (time !== null) candidates.push({ kind: 'contact', time, ids: [a.id, b.id], pair: id });
  }
  candidates.sort((a, b) => a.time - b.time || (a.kind === b.kind ? 0 : a.kind === 'contact' ? -1 : 1)
    || order(a.ids.join('\0'), b.ids.join('\0')));
  return candidates[0] ?? null;
}

/** Oval finish is a course-progress boundary, not a world-x boundary. */
export function nextOvalBoundary(entrants, pairs, now, remaining, finish) {
  const active = entrants.filter((e) => !e.finished).sort((a, b) => order(a.id, b.id));
  const candidates = [];
  for (const e of active) {
    if (e.progressVelocity > 0 && e.progress <= finish) {
      const time = (finish - e.progress) / e.progressVelocity;
      if (time >= 0 && time <= remaining) candidates.push({ kind: 'crossing', time, ids: [e.id] });
    }
  }
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    const a = active[i], b = active[j], pair = JSON.stringify([a.id, b.id]), prior = pairs[pair];
    if (prior && !(prior.separated && now - prior.time >= 0.5)) continue;
    const time = sweptContact(a, b, remaining);
    if (time !== null) candidates.push({ kind: 'contact', time, ids: [a.id, b.id], pair });
  }
  candidates.sort((a, b) => a.time - b.time || (a.kind === b.kind ? 0 : a.kind === 'contact' ? -1 : 1)
    || order(a.ids.join('\0'), b.ids.join('\0')));
  return candidates[0] ?? null;
}

export function advancePositions(entrants, dt) {
  for (const e of entrants) if (!e.finished) { e.x += e.vx * dt; e.y += e.vy * dt; }
}

/** Rearming requires both observed separation and half a second elapsed. */
export function observeSeparation(entrants, pairs) {
  const byId = new Map(entrants.map((entrant) => [entrant.id, entrant]));
  for (const [key, prior] of Object.entries(pairs)) {
    const ids = JSON.parse(key), a = byId.get(ids[0]), b = byId.get(ids[1]);
    if (a && b && Math.hypot(a.x - b.x, a.y - b.y) >= 1.2) prior.separated = true;
  }
}

/** Equal-mass impulse; non-closing contacts intentionally do not gain impulse. */
export function contactImpulse(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
  const nx = distance ? dx / distance : order(a.id, b.id) < 0 ? 1 : -1;
  const ny = distance ? dy / distance : 0;
  const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  const impulse = relative < 0 ? -(1 + 0.25) * relative / 2 : 0;
  a.vx -= impulse * nx; a.vy -= impulse * ny;
  b.vx += impulse * nx; b.vy += impulse * ny;
  return { nx, ny, impulse };
}

/** A committed boundary is a fresh checkpoint; failed candidates are discarded. */
export function commitBoundary(state, boundary, validate) {
  const candidate = structuredClone(state);
  const byId = new Map(candidate.entrants.map((e) => [e.id, e]));
  if (boundary.kind === 'contact') {
    const a = byId.get(boundary.ids[0]), b = byId.get(boundary.ids[1]);
    if (!a || !b || a.finished || b.finished) throw new RangeError('invalid contact participants');
    boundary = { ...boundary, ...contactImpulse(a, b) };
    candidate.pairs[boundary.pair] = { time: candidate.time, separated: false };
  } else if (boundary.kind === 'crossing') {
    const entrant = byId.get(boundary.ids[0]);
    if (!entrant || entrant.finished) throw new RangeError('invalid crossing participant');
    entrant.finished = true;
  } else throw new RangeError('invalid boundary kind');
  candidate.events.push(boundary);
  return validate(candidate) ? { ok: true, state: candidate } : { ok: false, state };
}

/** Experimental piecewise-local-frame interval; no race-loop or injury semantics. */
export function advanceOvalInterval(initial, duration, finish) {
  if (!Number.isFinite(duration) || duration < 0 || duration > 0.05 || !Number.isFinite(finish)) throw new RangeError('invalid interval');
  let state = structuredClone(initial), remaining = duration;
  for (let boundaryCount = 0; boundaryCount < 32; boundaryCount++) {
    const linear = state.entrants.map((e) => e.finished ? e : linearizeEntrant(e));
    for (let i = 0; i < linear.length; i++) for (let j = i + 1; j < linear.length; j++) {
      if (!linear[i].finished && !linear[j].finished && Math.hypot(linear[i].x - linear[j].x, linear[i].y - linear[j].y) < 1)
        return { ok: false, reason: 'unsafe-overlap', state };
    }
    observeSeparation(linear, state.pairs);
    const next = nextOvalBoundary(linear, state.pairs, state.time, remaining, finish);
    const dt = next?.time ?? remaining;
    const candidate = structuredClone(state);
    candidate.entrants = candidate.entrants.map((e) => e.finished ? e : advanceCourse(e, dt));
    candidate.time += dt;
    if (!next) {
      const endpoint = candidate.entrants.filter((e) => !e.finished).map(linearizeEntrant);
      for (let i = 0; i < endpoint.length; i++) for (let j = i + 1; j < endpoint.length; j++) {
        if (Math.hypot(endpoint[i].x - endpoint[j].x, endpoint[i].y - endpoint[j].y) < 1)
          return { ok: false, reason: 'unsafe-overlap', state };
      }
      return { ok: true, state: candidate };
    }
    const byId = new Map(candidate.entrants.map((e) => [e.id, e]));
    if (next.kind === 'crossing') {
      byId.get(next.ids[0]).finished = true;
      candidate.events.push({ kind: 'crossing', ids: next.ids, time: candidate.time });
    } else {
      const a = linearizeEntrant(byId.get(next.ids[0])), b = linearizeEntrant(byId.get(next.ids[1]));
      // Local linear sweep is approximate on a bend. Do not create a contact
      // if course-frame advancement does not reach the physical boundary.
      if (Math.hypot(a.x - b.x, a.y - b.y) !== 1)
        return { ok: false, reason: 'sweep-frame-disagreement', state };
      const impulse = contactImpulse(a, b);
      candidate.entrants = candidate.entrants.map((e) => e.id === a.id ? applyWorldVelocity(e, a.vx, a.vy)
        : e.id === b.id ? applyWorldVelocity(e, b.vx, b.vy) : e);
      candidate.pairs[next.pair] = { time: candidate.time, separated: false };
      candidate.events.push({ kind: 'contact', ids: next.ids, time: candidate.time, impulse: impulse.impulse });
    }
    state = candidate; // The next loop recomputes from this committed boundary.
    remaining -= dt;
    if (remaining <= 0) return { ok: true, state };
  }
  return { ok: false, reason: 'boundary-cap', state };
}
