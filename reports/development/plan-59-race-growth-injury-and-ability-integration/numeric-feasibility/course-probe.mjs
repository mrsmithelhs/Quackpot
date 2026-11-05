import { Q, TURN, checked, cordic, roundEven } from './integer-math.mjs';

const UNIT = 1000000n;
// Rounded from 20*pi course units; provisional policy, not production constants.
export const BEND = 62831853n;
export const LENGTH = 120n * UNIT + 2n * BEND;
const wrap = (x, period) => ((x % period) + period) % period;

/** Integer oval frame using Q62 unit vectors, at integer millionth positions. */
export function integerFrame(progress, lateral, table) {
  checked(progress); checked(lateral);
  if (progress < -32n * UNIT || progress > 512n * UNIT || lateral < -6n * UNIT || lateral > 6n * UNIT) throw new RangeError('course input bounds');
  const s = wrap(progress + 30n * UNIT, LENGTH);
  let x, y, tx, ty;
  if (s < 60n * UNIT) { x = -30n * UNIT + s; y = -20n * UNIT; tx = Q; ty = 0n; }
  else if (s < 60n * UNIT + BEND) {
    const angle = -TURN / 4n + roundEven(checked((s - 60n * UNIT) * TURN), 2n * BEND);
    const c = cordic(angle, table); x = 30n * UNIT + roundEven(20n * UNIT * c.cos, Q); y = roundEven(20n * UNIT * c.sin, Q); tx = -c.sin; ty = c.cos;
  } else if (s < 120n * UNIT + BEND) {
    x = 30n * UNIT - (s - 60n * UNIT - BEND); y = 20n * UNIT; tx = -Q; ty = 0n;
  } else {
    const angle = TURN / 4n + roundEven(checked((s - 120n * UNIT - BEND) * TURN), 2n * BEND);
    const c = cordic(angle, table); x = -30n * UNIT + roundEven(20n * UNIT * c.cos, Q); y = roundEven(20n * UNIT * c.sin, Q); tx = -c.sin; ty = c.cos;
  }
  return { x: checked(x - roundEven(ty * lateral, Q)), y: checked(y + roundEven(tx * lateral, Q)), tx, ty };
}
