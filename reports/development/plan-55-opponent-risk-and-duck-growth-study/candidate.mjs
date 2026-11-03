import { createRng } from '../../../src/core/prng.mjs';

const fork = (seed, raceId, kind, id) => createRng(seed).fork(`plan55/v1/${raceId}/${kind}/${id}`).next();
export function rivalChoices(seed, raceId, probability) {
  if (!(probability >= 0 && probability <= 1)) throw new RangeError('invalid probability');
  return Object.fromEntries(['A','B','C','D','E'].map(id => [id, fork(seed,raceId,'rival',id) < probability ? 'sprint' : 'steady']));
}
export function burstActive(seed, raceId, duckId, duck) {
  return duck?.ability === 'burst' && fork(seed,raceId,'burst',duckId) < 0.5;
}
export function ratingForRace(rating, restFactor, injured, active) {
  return (rating + (active ? 1 : 0)) * restFactor * (injured ? 0.9 : 1);
}
export function completeRace(state, { status, duckId, stance, playerContact, seed, raceId }) {
  if (!['steady','sprint'].includes(stance)) throw new RangeError('invalid stance');
  if (status !== 'finished') return structuredClone(state);
  const next = structuredClone(state);
  const duck = next.ducks[duckId];
  if (!duck) throw new Error('unknown duck');
  const wasInjured = duck.injured;
  const extended = wasInjured && fork(seed,raceId,'extension',duckId) < 0.5;
  const p = (stance === 'steady' ? 0.2 : 0.4) * (duck.ability === 'guard' ? 0.5 : 1);
  const newInjury = playerContact && fork(seed,raceId,'injury',duckId) < p;
  duck.injured = Boolean(extended || newInjury);
  for (const [id, other] of Object.entries(next.ducks)) if (id !== duckId) other.injured = false;
  duck.completed += 1;
  if (duck.completed === 3) duck.banked = 1;
  next.events.push({raceId, duckId, extended, newInjury, injuryRollEligible: Boolean(playerContact), injuryProbability: p});
  return next;
}
export function assignPoint(state, duckId, ability) {
  if (!['burst','guard'].includes(ability)) throw new RangeError('invalid ability');
  const next = structuredClone(state), duck = next.ducks[duckId];
  if (!duck || duck.banked !== 1 || duck.ability) throw new Error('point unavailable');
  duck.banked = 0; duck.ability = ability;
  return next;
}
export function earlyBed(state) {
  const next = structuredClone(state);
  for (const duck of Object.values(next.ducks)) duck.injured = false;
  return next;
}


export function playerContactFromResolution(resolution) {
  if (resolution.status !== 'finished') return false;
  if (!Array.isArray(resolution.eventRecords)) throw new TypeError('missing mechanical event records');
  return resolution.eventRecords.some(event => event.type === 'duck-contact' && Array.isArray(event.participants) && event.participants.includes('P'));
}
