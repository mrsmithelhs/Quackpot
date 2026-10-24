// Append-only run record. Entries are deep-frozen, carry a monotonically increasing
// `seq`, and are hash-chained (each `chain` value covers the previous chain value).
// Reordering, modifying, or deleting interior entries invalidates the sequence or hash
// chain, as checked by verifyChain(). Any valid prefix also verifies; trailing truncation
// does not break prefix chaining, so finished-run completeness is checked separately
// by verifyCompleteness().
// The Receipt projection reads only this record, never the final run state.

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

function chainOf(prev, seq, type, clock, payload) {
  return fnv1a(`${prev}|${seq}|${type}|${JSON.stringify(clock)}|${JSON.stringify(payload)}`);
}

export class EventLog {
  #entries = [];
  #head = 'genesis';

  append(type, payload, clock) {
    const seq = this.#entries.length;
    const p = structuredClone(payload ?? {});
    const c = structuredClone(clock ?? {});
    const chain = chainOf(this.#head, seq, type, c, p);
    const entry = deepFreeze({ seq, type, clock: c, payload: p, chain });
    this.#entries.push(entry);
    this.#head = chain;
    return entry;
  }

  get entries() {
    return Object.freeze([...this.#entries]);
  }

  get length() {
    return this.#entries.length;
  }

  /** Final chain value; equal heads mean identical logs (used as a trace fingerprint). */
  get head() {
    return this.#head;
  }
}

/** True only if seq values are 0..n-1 and every chain value matches. */
export function verifyChain(entries) {
  let prev = 'genesis';
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.seq !== i) return false;
    if (chainOf(prev, e.seq, e.type, e.clock, e.payload) !== e.chain) return false;
    prev = e.chain;
  }
  return true;
}

/**
 * Checks whether the log ends with a valid ordered terminal/Receipt pair
 * with matching routes for a finished run. The expected finished-run boundary
 * requires a terminal entry immediately followed by receipt_shown with matching route.
 * Prefix logs remain valid partial logs under verifyChain, but fail completeness.
 */
export function verifyCompleteness(entries) {
  if (!Array.isArray(entries) || entries.length < 2) return false;
  const terminalIndex = entries.findIndex((e) => e.type === 'terminal');
  const receiptIndex = entries.findIndex((e) => e.type === 'receipt_shown');
  if (terminalIndex === -1 || receiptIndex === -1) return false;
  // terminal must precede receipt_shown
  if (terminalIndex >= receiptIndex) return false;
  const terminal = entries[terminalIndex];
  const receipt = entries[receiptIndex];
  // routes must match and be non-empty strings
  if (!terminal.payload?.route || terminal.payload.route !== receipt.payload?.route) return false;
  // Ensure no duplicate terminal or receipt_shown entries exist
  const lastTerminalIndex = entries.findLastIndex((e) => e.type === 'terminal');
  const lastReceiptIndex = entries.findLastIndex((e) => e.type === 'receipt_shown');
  if (terminalIndex !== lastTerminalIndex || receiptIndex !== lastReceiptIndex) return false;
  // Expected boundary: terminal immediately precedes receipt_shown at the tail of the log
  if (receiptIndex !== terminalIndex + 1 || receiptIndex !== entries.length - 1) return false;
  return true;
}
