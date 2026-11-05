// Unmounted Plan 59 candidate: swept circle boundaries in course coordinates.
// Experimental native-float arithmetic; no replay portability is implied.
import { advanceCourse, applyWorldVelocity, courseFrame, linearizeEntrant } from './race-kernel-v2-physics.mjs';
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
    const creditedProgress = e.progress - (e.finishCorrection ?? 0);
    if (e.progressVelocity > 0 && creditedProgress <= finish) {
      const time = (finish - creditedProgress) / e.progressVelocity;
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

/** Candidate-only correction. A failure leaves the caller's checkpoint untouched. */
export function safeNormalCorrection(entrants, ids, bracket, finish) {
  const copies = structuredClone(entrants), a = copies.find((e) => e.id === ids[0]), b = copies.find((e) => e.id === ids[1]);
  if (!a || !b || a === b || a.finished || b.finished || !Number.isFinite(finish)
      || [a, b].some((e) => ![e.progress, e.lateral, e.speed, e.heading].every(Number.isFinite) || e.speed < 0 || e.speed > 100 || Math.abs(e.lateral) > 6)
      || !Number.isFinite(bracket.outside) || !Number.isFinite(bracket.inside)
      || bracket.inside < bracket.outside || bracket.inside - bracket.outside > MAX_FIRST_CONTACT_BRACKET) return { ok: false, reason: 'invalid-bracket' };
  const al = linearizeEntrant(a), bl = linearizeEntrant(b), dx = bl.x - al.x, dy = bl.y - al.y, distance = Math.hypot(dx, dy);
  if (distance === 0 || distance > 1) return { ok: false, reason: 'not-inside-witness' };
  // At most twice each speed bounds course-map travel inside |lateral| <= 6.
  // The arithmetic allowance scales with coordinates and covers rounding in the
  // few native operations here; it is not a general collision tolerance.
  const arithmetic = 64 * Number.EPSILON * Math.max(1, Math.abs(al.x), Math.abs(al.y), Math.abs(bl.x), Math.abs(bl.y));
  const limit = 2 * (a.speed + b.speed) * (bracket.inside - bracket.outside) + arithmetic;
  const penetration = 1 - distance;
  if (penetration > limit) return { ok: false, reason: 'correction-exceeds-bracket' };
  const nx = dx / distance, ny = dy / distance, correction = (penetration + arithmetic) / 2;
  const before = [a, b].map((e) => ({ id: e.id, progress: e.progress, lateral: e.lateral }));
  for (const [e, sign] of [[a, -1], [b, 1]]) {
    const f = courseFrame(e.progress, e.lateral), wx = sign * correction * nx, wy = sign * correction * ny;
    const progress = e.progress + wx * f.tx + wy * f.ty;
    const lateral = e.lateral - wx * f.ty + wy * f.tx;
    if (progress >= finish || Math.abs(lateral) > 6) return { ok: false, reason: 'correction-crosses-boundary' };
    e.finishCorrection = (e.finishCorrection ?? 0) + progress - e.progress;
    e.progress = progress; e.lateral = lateral;
  }
  const aa = linearizeEntrant(a), bb = linearizeEntrant(b);
  if (Math.hypot(aa.x - bb.x, aa.y - bb.y) < 1) return { ok: false, reason: 'correction-incomplete' };
  for (const e of copies) if (!e.finished && e.id !== a.id && e.id !== b.id) {
    const p = linearizeEntrant(e);
    if (Math.hypot(p.x - aa.x, p.y - aa.y) < 1 || Math.hypot(p.x - bb.x, p.y - bb.y) < 1)
      return { ok: false, reason: 'correction-third-party-overlap' };
  }
  return { ok: true, entrants: copies, evidence: { bracket: { ...bracket }, before,
    after: [a, b].map((e) => ({ id: e.id, progress: e.progress, lateral: e.lateral })), penetration, correction, limit, arithmetic } };
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
    const candidates = [];
    for (const e of linear) if (!e.finished && e.progressVelocity > 0 && e.progress - (e.finishCorrection ?? 0) <= finish) {
      const time = (finish - (e.progress - (e.finishCorrection ?? 0))) / e.progressVelocity;
      if (time <= remaining) candidates.push({ kind: 'crossing', time, ids: [e.id] });
    }
    const ordered = linear.filter((e) => !e.finished).sort((a, b) => order(a.id, b.id));
    for (let i = 0; i < ordered.length; i++) for (let j = i + 1; j < ordered.length; j++) {
      const a = ordered[i], b = ordered[j], pair = JSON.stringify([a.id, b.id]), prior = state.pairs[pair];
      if (prior && !(prior.separated && state.time - prior.time >= 0.5)) continue;
      const found = findOvalContact(a, b, remaining);
      if (found.status === 'unresolved' || found.status === 'initial-overlap') return { ok: false, reason: found.reason ?? found.status, state };
      if (found.status === 'contact') candidates.push({ kind: 'contact', time: found.inside, ids: [a.id, b.id], pair, bracket: found });
      if (found.status === 'initial-contact') {
        const closing = (b.x - a.x) * (b.vx - a.vx) + (b.y - a.y) * (b.vy - a.vy);
        if (closing < 0) candidates.push({ kind: 'contact', time: 0, ids: [a.id, b.id], pair, bracket: null });
      }
    }
    // A finish or another contact inside an unresolved contact time bracket
    // cannot safely be ordered by the bracket's inside endpoint.
    for (const c of candidates.filter((item) => item.kind === 'contact' && item.bracket)) {
      for (const other of candidates) {
        if (other === c) continue;
        const lower = other.bracket?.outside ?? other.time, upper = other.bracket?.inside ?? other.time;
        if (lower <= c.bracket.inside && upper >= c.bracket.outside)
          return { ok: false, reason: 'ambiguous-boundary-order', state };
      }
    }
    candidates.sort((a, b) => a.time - b.time || (a.kind === b.kind ? 0 : a.kind === 'contact' ? -1 : 1) || order(a.ids.join('\0'), b.ids.join('\0')));
    const next = candidates[0] ?? null;
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
      let evidence = null;
      if (next.bracket) {
        const corrected = safeNormalCorrection(candidate.entrants, next.ids, next.bracket, finish);
        if (!corrected.ok) return { ok: false, reason: corrected.reason, state };
        candidate.entrants = corrected.entrants; evidence = corrected.evidence;
      }
      const a = linearizeEntrant(candidate.entrants.find((e) => e.id === next.ids[0]));
      const b = linearizeEntrant(candidate.entrants.find((e) => e.id === next.ids[1]));
      const impulse = contactImpulse(a, b);
      candidate.entrants = candidate.entrants.map((e) => e.id === a.id ? applyWorldVelocity(e, a.vx, a.vy)
        : e.id === b.id ? applyWorldVelocity(e, b.vx, b.vy) : e);
      candidate.pairs[next.pair] = { time: candidate.time, separated: false };
      candidate.events.push({ kind: 'contact', ids: next.ids, time: candidate.time, impulse: impulse.impulse, correction: evidence });
    }
    state = candidate; // The next loop recomputes from this committed boundary.
    remaining -= dt;
    if (remaining <= 0) return { ok: true, state };
  }
  return { ok: false, reason: 'boundary-cap', state };
}
