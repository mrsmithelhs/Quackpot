// Plan 26 Stage A: the page-wide flash arbiter. ONE per page, created by the host and injected into every controller.
// Logic only (no DOM, no timers, no rendering): a request is accepted, or refused and forgotten. Nothing is ever queued or replayed.
// The 4000 ms default is the approved design value, not a safety threshold or a certification.

export const DEFAULT_COOLDOWN_MS = 4000;

export function createFlashArbiter({ now = () => performance.now(), cooldownMs = DEFAULT_COOLDOWN_MS } = {}) {
  if (typeof now !== 'function') throw new TypeError('flash arbiter: now must be a function returning monotonic milliseconds');
  if (!Number.isFinite(cooldownMs) || cooldownMs < DEFAULT_COOLDOWN_MS) throw new RangeError(`flash arbiter: cooldownMs must be a finite number >= ${DEFAULT_COOLDOWN_MS}`);

  let clock = -Infinity, lastStartedAt = -Infinity, active = null, seq = 0;
  const stats = { accepted: 0, refusedCooldown: 0, refusedActive: 0, finished: 0, cancelled: 0 };

  /** Monotonic high-water mark: a clock that steps backwards cannot create a window for an extra flash. */
  const tick = () => {
    const t = now();
    if (!Number.isFinite(t)) throw new TypeError('flash arbiter: now() returned a non-finite value');
    if (t > clock) clock = t;
    return clock;
  };

  function request({ requester = null } = {}) {
    const t = tick();
    if (active) { stats.refusedActive++; return { status: 'refused', reason: 'active', retryAfterMs: Math.max(0, lastStartedAt + cooldownMs - t) }; }
    const elapsed = t - lastStartedAt;
    if (elapsed < cooldownMs) { stats.refusedCooldown++; return { status: 'refused', reason: 'cooldown', retryAfterMs: cooldownMs - elapsed }; }
    const id = ++seq;
    let result = null, resolve;
    const done = new Promise(r => { resolve = r; });
    const settle = (status, reason) => {
      if (result) return result;                         // first settle wins; repeats return it
      result = reason === undefined ? { status, id } : { status, id, reason };
      if (active && active.id === id) active = null;
      stats[status]++;
      resolve(result);
      return result;
    };
    const ticket = { status: 'accepted', id, requester, startedAt: t, done, finish: () => settle('finished'), cancel: reason => settle('cancelled', reason ?? 'cancelled'), outcome: () => result };
    lastStartedAt = t;
    active = ticket;
    stats.accepted++;
    return ticket;
  }

  const snapshot = () => ({ cooldownMs, activeId: active ? active.id : null, lastStartedAt: Number.isFinite(lastStartedAt) ? lastStartedAt : null, nextAllowedAt: Number.isFinite(lastStartedAt) ? lastStartedAt + cooldownMs : null, stats: { ...stats } });

  return { request, snapshot, cooldownMs };
}
