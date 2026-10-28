export const RACE_REST_POLICY_VERSION = 'quackpot.race-rest/1';
const KNOWN_RACE_DUCK_IDS = new Set(['duck-0', 'duck-1', 'duck-2', 'duck-3', 'duck-4', 'duck-5']);

export function isKnownRaceDuckId(duckId) {
  return typeof duckId === 'string' && KNOWN_RACE_DUCK_IDS.has(duckId);
}

/** Human-readable decimal form; persisted and resolver inputs keep their full numeric values. */
export function formatRaceRating(value) {
  if (!Number.isFinite(value)) return String(value);
  return String(Number(value.toPrecision(15)));
}

const completed = (entries) => entries.filter((entry) => entry.type === 'race_result');
const identityOf = (entry) => isKnownRaceDuckId(entry.payload?.duckId)
  ? entry.payload.duckId
  : null;

export function deriveRaceRestBoundary(entries) {
  const activation = entries.find((entry) => entry.type === 'race_rest_policy_activated');
  if (activation) return {
    policyVersion: activation.payload?.policyVersion,
    boundarySeq: activation.payload?.historyBaselineSeq ?? -1,
    historyLimited: Boolean(activation.payload?.historyLimited),
    activationSeq: activation.seq,
  };

  const results = completed(entries);
  const lastUnknown = results.filter((entry) => !identityOf(entry)).at(-1) ?? null;
  return {
    policyVersion: RACE_REST_POLICY_VERSION,
    boundarySeq: lastUnknown?.seq ?? -1,
    historyLimited: Boolean(lastUnknown),
    activationSeq: null,
  };
}

export function deriveRaceRest(entries, duckId) {
  if (typeof duckId !== 'string' || !duckId) throw new TypeError('duckId must be a non-empty identity');
  const boundary = deriveRaceRestBoundary(entries);
  const results = completed(entries).filter((entry) => entry.seq > boundary.boundarySeq);
  const priorOwn = results.map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => identityOf(entry) === duckId).at(-1);
  const intervening = priorOwn
    ? results.slice(priorOwn.index + 1).filter((entry) => identityOf(entry) !== duckId)
    : [];
  const factor = priorOwn ? (intervening.length === 0 ? 0.5 : intervening.length === 1 ? 0.75 : 1) : 1;
  return {
    policyVersion: RACE_REST_POLICY_VERSION,
    historyBaselineSeq: boundary.boundarySeq,
    historyLimited: boundary.historyLimited,
    completedOrdinal: results.length,
    lastRaceSeq: priorOwn?.entry.seq ?? null,
    interveningRaceSeqs: intervening.map((entry) => entry.seq),
    restFactor: factor,
    authoredRating: null,
    effectiveBaseInput: null,
  };
}

export function makeRaceRestEvidence(entries, duckId, authoredRating) {
  if (!Number.isFinite(authoredRating) || authoredRating <= 0) throw new RangeError('authoredRating must be positive');
  const rest = deriveRaceRest(entries, duckId);
  return {
    ...rest,
    authoredRating,
    effectiveBaseInput: authoredRating * rest.restFactor,
  };
}

export function raceRestEvidenceMatches(entries, evidence, duckId, authoredRating) {
  if (!evidence || evidence.policyVersion !== RACE_REST_POLICY_VERSION) return false;
  return JSON.stringify(evidence) === JSON.stringify(makeRaceRestEvidence(entries, duckId, authoredRating));
}

export function stableExposureSignature(value) {
  const text = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
