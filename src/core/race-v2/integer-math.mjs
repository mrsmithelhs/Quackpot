// Unmounted experimental integer arithmetic.
export const LIMIT = (1n << 127n) - 1n;
export const TURN = 1n << 32n;
export const Q = 1n << 62n;

export function checked(x) {
  if (typeof x !== 'bigint' || x < -LIMIT || x > LIMIT) throw new RangeError('integer bound');
  return x;
}

export function roundEven(n, d) {
  checked(n); checked(d);
  if (d <= 0n) throw new RangeError('positive denominator required');
  const sign = n < 0n ? -1n : 1n, abs = n < 0n ? -n : n;
  let q = abs / d;
  const remainder = abs % d;
  const twice = checked(remainder * 2n);
  if (twice > d || (twice === d && q % 2n === 1n)) q++;
  return checked(sign * q);
}

export function wrapTurns(x) {
  checked(x);
  return ((x % TURN) + TURN) % TURN;
}

export function parseCanonicalInteger(s) {
  if (typeof s !== 'string' || s.length > 40 || !/^(?:0|-?[1-9][0-9]*)$/.test(s)) throw new RangeError('invalid canonical integer');
  return checked(BigInt(s));
}

/** Fixed 32-step rotation; arithmetic right shift rounds toward negative infinity. */
export function cordic(angle, table) {
  if (!Array.isArray(table.atan_turns) || table.atan_turns.length !== 32) throw new RangeError('invalid table');
  let z = wrapTurns(angle);
  if (z >= TURN / 2n) z -= TURN;
  let sign = 1n;
  if (z > TURN / 4n) { z -= TURN / 2n; sign = -1n; }
  else if (z < -TURN / 4n) { z += TURN / 2n; sign = -1n; }
  let x = parseCanonicalInteger(table.gain_q62), y = 0n;
  for (let i = 0; i < 32; i++) {
    const step = BigInt(table.atan_turns[i]);
    const direction = z >= 0n ? 1n : -1n;
    const nx = checked(x - direction * (y >> BigInt(i)));
    const ny = checked(y + direction * (x >> BigInt(i)));
    x = nx; y = ny; z -= direction * step;
  }
  return { cos: checked(sign * x), sin: checked(sign * y), residualTurns: z };
}

export function squareDistanceContact(dx, dy, diameter) {
  [dx, dy, diameter].forEach(checked);
  if (diameter <= 0n) throw new RangeError('invalid diameter');
  return checked(checked(dx * dx) + checked(dy * dy)) <= checked(diameter * diameter);
}

/** Integer square root, rounded down, with bounded iterations. */
export function isqrt(n) {
  checked(n);
  if (n < 0n) throw new RangeError('negative square root');
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (let i = 0; i < 128; i++) {
    const next = (x + n / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
  throw new RangeError('square root iteration cap');
}

/** Integer vectoring angle in 2^32 turns; zero vector is undefined. */
export function vectorAngle(x, y, table) {
  checked(x); checked(y);
  if (x === 0n && y === 0n) throw new RangeError('zero vector');
  if (!Array.isArray(table.atan_turns) || table.atan_turns.length !== 32) throw new RangeError('invalid table');
  if (y === 0n) return x > 0n ? 0n : TURN / 2n;
  if (x === 0n) return y > 0n ? TURN / 4n : 3n * TURN / 4n;
  const max = (x < 0n ? -x : x) > (y < 0n ? -y : y) ? (x < 0n ? -x : x) : (y < 0n ? -y : y);
  if (max > (1n << 100n)) throw new RangeError('vector input too large');
  while ((x < 0n ? -x : x) < (1n << 61n) && (y < 0n ? -y : y) < (1n << 61n)) { x <<= 1n; y <<= 1n; }
  let z = 0n;
  if (x < 0n) { x = -x; y = -y; z = TURN / 2n; }
  for (let i = 0; i < 32 && y !== 0n; i++) {
    const direction = y > 0n ? 1n : -1n;
    const nx = checked(x + direction * (y >> BigInt(i)));
    const ny = checked(y - direction * (x >> BigInt(i)));
    x = nx; y = ny; z += direction * BigInt(table.atan_turns[i]);
  }
  return wrapTurns(z);
}
