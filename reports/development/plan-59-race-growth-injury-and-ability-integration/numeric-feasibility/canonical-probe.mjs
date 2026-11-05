import { createRng } from '../../../../src/core/prng.mjs';
import { checked, parseCanonicalInteger } from './integer-math.mjs';

const encoder = new TextEncoder();
/** Length-prefixed UTF-8 bytes: a probe domain, never a shared gameplay stream. */
export function probeDraw(seed, domain, id) {
  const values = ['numeric-probe/v1', seed, domain, id];
  const key = values.map((value) => {
    if (typeof value !== 'string' || !value || encoder.encode(value).length > 64
        || /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value)) throw new RangeError('invalid key component');
    const bytes = encoder.encode(value);
    return `${bytes.length}:${Array.from(bytes, (v) => v.toString(16).padStart(2, '0')).join('')}`;
  }).join('');
  return { key, value: createRng(key).next() };
}

/** Small schema probe only, not the game's save or replay format. */
export function encodeProbeState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).sort().join(',') !== 'angle,id,lateral,progress'
      || typeof state.id !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(state.id)) throw new RangeError('invalid probe state');
  for (const key of ['progress', 'lateral', 'angle']) checked(state[key]);
  return JSON.stringify({ schema: 'numeric-probe/v1', id: state.id, progress: state.progress.toString(), lateral: state.lateral.toString(), angle: state.angle.toString() });
}

export function decodeProbeState(json) {
  if (typeof json !== 'string' || encoder.encode(json).length > 4096) throw new RangeError('probe envelope size');
  let parsed;
  try { parsed = JSON.parse(json); } catch { throw new RangeError('invalid JSON'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).sort().join(',') !== 'angle,id,lateral,progress,schema'
      || parsed.schema !== 'numeric-probe/v1' || typeof parsed.id !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(parsed.id)) throw new RangeError('invalid probe envelope');
  return { id: parsed.id, progress: parseCanonicalInteger(parsed.progress), lateral: parseCanonicalInteger(parsed.lateral), angle: parseCanonicalInteger(parsed.angle) };
}
