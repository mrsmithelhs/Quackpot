// Report-only externally clocked fixture: no timer or gameplay effects.
// Plan58 durations are illustrative study fixtures, not production timing.
const durations = Object.freeze({ bounce: 1850, crowd: 2200, guard: 1600, recovery: 1700,
  dive: 2500, wide: 2400, ahead: 2400, draft: 2000, straight: 1800, steady: 2000, wake: 2300,
  pop: 850, fragments: 850, burst: 850, injury: 1000, 'white-return': 1000 });
export function previewDurationMs(kind) {
  if (!Object.hasOwn(durations, kind)) throw new RangeError('invalid preview kind');
  return durations[kind];
}

export function createTimeline(render) {
  if (typeof render !== 'function') throw new TypeError('render required');
  let value = 0, playing = false, disposed = false;
  const check = () => { if (disposed) throw new Error('timeline disposed'); };
  return {
    seek(next) { check(); if (!Number.isFinite(next)) throw new RangeError('invalid time'); value = Math.max(0, Math.min(1,next)); render(value); },
    play() { check(); playing = true; },
    pause() { check(); playing = false; },
    step(delta) { check(); if (!Number.isFinite(delta) || delta < 0) throw new RangeError('invalid delta'); if (playing) { value = Math.min(1,value+delta); render(value); } },
    snapshot() { return { value, playing, disposed }; },
    dispose() { if (!disposed) { playing = false; disposed = true; render(null); } },
  };
}
