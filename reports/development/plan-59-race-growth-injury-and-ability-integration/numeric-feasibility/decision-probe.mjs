import { checked, roundEven, squareDistanceContact } from './integer-math.mjs';

const SCALE = 1_000_000n;
export function ratingTarget(rating, rest, down, injured) {
  [rating, rest, down].forEach(checked);
  if (rating <= 0n || rating > 100n * SCALE || ![500000n, 750000n, SCALE].includes(rest)
      || ![SCALE, 1050000n].includes(down) || typeof injured !== 'boolean') throw new RangeError('invalid rating');
  let value = roundEven(checked(rating * rest), SCALE);
  value = roundEven(checked(value * down), SCALE);
  if (injured) value = roundEven(checked(value * 9n), 10n);
  return { rating: value, affine: 8250000n + roundEven(value, 2n) };
}

/** This probe's exact tie policy processes contact before finish. */
export function boundaryDecision({ dx, dy, diameter, finishDelta, velocity, dtMicros }) {
  [dx, dy, diameter, finishDelta, velocity, dtMicros].forEach(checked);
  if (dtMicros <= 0n || velocity < 0n || finishDelta < 0n) return { status: 'unresolved', reason: 'invalid-or-no-progress' };
  const contact = squareDistanceContact(dx, dy, diameter);
  const travel = roundEven(checked(velocity * dtMicros), SCALE);
  if (!travel && finishDelta > 0n) return { status: 'unresolved', reason: 'rounded-no-progress' };
  return { status: 'decided', contact, crossing: travel >= finishDelta,
    order: contact && travel >= finishDelta ? ['contact', 'crossing'] : contact ? ['contact'] : travel >= finishDelta ? ['crossing'] : [] };
}
