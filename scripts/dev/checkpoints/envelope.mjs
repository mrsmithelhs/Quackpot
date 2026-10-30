import { GameEngine } from '../../../src/core/game-engine.mjs';
import { validateSave } from '../../../src/core/storage.mjs';

const fail = (message) => { throw new Error(message); };

export function stableEnvelope(envelope) {
  const copy = structuredClone(envelope);
  delete copy.savedAt;
  return JSON.stringify(copy);
}

export function validateAndHydrate(envelope, label) {
  const result = validateSave(envelope);
  if (!result.valid) fail(`${label} failed production save validation: ${result.errors.join('; ')}`);
  const restored = GameEngine.fromEnvelope(envelope).toEnvelope();
  if (stableEnvelope(envelope) !== stableEnvelope(restored)) fail(`${label} hydrate/serialize comparison differs beyond top-level savedAt.`);
  return { validation: result, state: envelope.state, rngStreams: Object.keys(envelope.prngStreams ?? {}).sort(),
    eventCount: envelope.eventLog?.length ?? 0, chainHead: envelope.eventLog?.at(-1)?.chain ?? 'genesis' };
}

export function assertNegativeControls(envelope) {
  const badSchema = structuredClone(envelope); badSchema.schemaVersion = 999;
  if (validateSave(badSchema).valid) fail('Negative control accepted an unsupported schema.');
  const badRng = structuredClone(envelope); badRng.prngStreams.draw = 'not-json';
  if (validateSave(badRng).valid) fail('Negative control accepted a malformed RNG stream.');
  const badChain = structuredClone(envelope);
  if (!badChain.eventLog?.length) fail('Cannot run event-chain negative control on an empty event log.');
  badChain.eventLog[0].payload.seed = 'tampered';
  if (validateSave(badChain).valid) fail('Negative control accepted a changed event-log chain.');
  return { unsupportedSchemaRejected: true, malformedRngRejected: true, changedLogChainRejected: true };
}

export function assertCatalogBoundary(id, entry, envelope) {
  const state = envelope.state ?? {};
  const boundary = entry.boundary ?? {};
  for (const key of ['step', 'activeModal', 'phase', 'cash']) {
    if (Object.hasOwn(boundary, key) && state[key] !== boundary[key]) fail(`${id} state boundary mismatch for ${key}: expected ${boundary[key]}, got ${state[key]}`);
  }
  if (id.startsWith('plan35.rent-')) {
    if (state.step !== 'd2_afternoon_rent' || state.activeModal !== null || state.phase !== 'playing') fail(`${id} is not the ordinary pre-Pay rent view.`);
    if (envelope.eventLog.some((event) => event.type === 'expense_due' && event.payload?.kind === 'rent')) fail(`${id} unexpectedly contains a rent expense_due event before Pay.`);
  }
  if (id === 'plan35.finale-race-entry.v1') {
    if (state.step !== 'd3_midday_race' || state.activeModal !== null) fail(`${id} is not the ordinary finale race-entry boundary.`);
    if (envelope.eventLog.some((event) => event.type === 'action' && event.payload?.kind === 'race_choice' && event.payload?.raceId === 'R02')) fail(`${id} already contains a second-race choice/commit.`);
  }
}
