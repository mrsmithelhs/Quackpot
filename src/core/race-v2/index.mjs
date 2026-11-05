// Unmounted experimental API; integration and save policy remain separate gates.
export { resolveIntegerRace } from './integer-kernel.mjs';
export { validateInput, encodeResult, decodeResult } from './codec.mjs';
export { getReferenceTable } from './reference-policy.mjs';
