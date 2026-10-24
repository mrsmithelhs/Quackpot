// Seedable PRNG for Quackpot runs and the event deck.
//
// Algorithm: sfc32 (Small Fast Counter, 128-bit state, four uint32 words), seeded
// from a string key through the cyrb128 hash. Chosen because it is tiny, has no
// dependencies, passes common statistical batteries, and its whole state is four
// integers, which makes serialization trivial and exact.
//
// Contract (stable for later game reuse; no DOM, Node, or network APIs):
//   createRng(seed)         -> rng; seed is any number or string, normalized with String(seed).
//   rng.next()              -> float in [0, 1).
//   rng.int(n)              -> integer in [0, n).
//   rng.range(lo, hi)       -> integer in [lo, hi] inclusive.
//   rng.pick(array)         -> one element.
//   rng.weighted(weights)   -> index chosen proportionally to non-negative weights.
//   rng.serialize()         -> string snapshot of key + state (JSON, versioned).
//   restoreRng(string)      -> rng that continues exactly where the snapshot left off.
//   rng.fork(label)         -> independent child stream.
//
// fork(label) determinism: a child is seeded ONLY from the parent's key path and the
// label (`<parentKey>/<label>`), never from how many values the parent has produced.
// So (a) consuming or not consuming the parent never changes a child, (b) adding a new
// consumer (a new fork label) never shifts existing streams, and (c) forking the same
// label twice yields two identical streams. A restored rng keeps its key, so its forks
// match those of the original.

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function build(key, state) {
  let [a, b, c, d] = state;

  function nextUint32() {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return t >>> 0;
  }

  const rng = {
    key,
    next() {
      return nextUint32() / 4294967296;
    },
    int(n) {
      if (!Number.isInteger(n) || n <= 0) throw new RangeError(`int(n) needs a positive integer, got ${n}`);
      return Math.floor(rng.next() * n);
    },
    range(lo, hi) {
      return lo + rng.int(hi - lo + 1);
    },
    pick(array) {
      if (array.length === 0) throw new RangeError('pick() on an empty array');
      return array[rng.int(array.length)];
    },
    weighted(weights) {
      let total = 0;
      for (const w of weights) {
        if (w < 0) throw new RangeError('negative weight');
        total += w;
      }
      if (total <= 0) throw new RangeError('weights sum to zero');
      let u = rng.next() * total;
      for (let i = 0; i < weights.length; i++) {
        if (u < weights[i]) return i;
        u -= weights[i];
      }
      // Floating-point guard: fall back to the last index with positive weight.
      for (let i = weights.length - 1; i >= 0; i--) if (weights[i] > 0) return i;
      return 0;
    },
    serialize() {
      return JSON.stringify({ v: 1, alg: 'sfc32', key, s: [a >>> 0, b >>> 0, c >>> 0, d >>> 0] });
    },
    fork(label) {
      return createRng(`${key}/${label}`, true);
    },
  };
  return rng;
}

export function createRng(seed, _isKey = false) {
  const key = String(seed);
  const state = cyrb128(key);
  const rng = build(key, state);
  for (let i = 0; i < 15; i++) rng.next(); // warm-up, as recommended for sfc32
  return rng;
}

export function restoreRng(serialized) {
  const o = JSON.parse(serialized);
  if (o.v !== 1 || o.alg !== 'sfc32' || !Array.isArray(o.s) || o.s.length !== 4) {
    throw new Error('Unrecognized PRNG snapshot');
  }
  return build(o.key, o.s.map((x) => x | 0));
}
