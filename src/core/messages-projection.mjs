import { MESSAGE_HISTORY } from './messages-content.mjs';

export const MESSAGE_POLICY = 'messages-v1';
export const MAX_DELIVERIES = 256;
const TOKEN = /^[a-z0-9][a-z0-9:_-]{0,127}$/;
const THREADS = new Set(['work', 'ren', 'loan', 'launch', 'history:copy-counter', 'history:lantern-laundry', 'history:kit', 'history:mom']);
const identity = m => `${m.deliveryId}@${m.revision}`;
export function messageKey(m) { return identity(m); }
function valid(m) {
  return m && THREADS.has(m.threadId) && [m.messageId, m.deliveryId].every(x => typeof x === 'string' && TOKEN.test(x)) &&
    Number.isSafeInteger(m.revision) && m.revision > 0 && m.revision <= 1000000 &&
    Number.isSafeInteger(m.sequence) && m.sequence >= 0 && typeof m.sender === 'string' && m.sender.length <= 100 &&
    typeof m.text === 'string' && m.text.length <= 4000 && typeof m.historical === 'boolean';
}
export function historyMessages() {
  return MESSAGE_HISTORY.map((m, i) => ({ threadId: `history:${m.id}`, messageId: `history:${m.id}`, deliveryId: `history:${m.id}:1`, revision: 1, sequence: i, sender: m.sender, text: m.text, historical: true }));
}
// Callers establish deliveries; projection cannot create them from state or balances.
export function projectMessages(deliveries, readKeys = []) {
  if (!Array.isArray(deliveries) || deliveries.length > MAX_DELIVERIES || !Array.isArray(readKeys) || readKeys.length > MAX_DELIVERIES) throw new Error('Invalid message bounds');
  const records = new Map();
  for (const m of deliveries) {
    if (!valid(m)) throw new Error('Invalid message');
    const key = identity(m), previous = records.get(key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(m)) throw new Error('Conflicting delivery');
    records.set(key, m);
  }
  const current = new Map();
  for (const m of records.values()) { const old=current.get(m.deliveryId); if (!old || m.revision > old.revision) current.set(m.deliveryId,m); }
  const reads = new Set(readKeys);
  if ([...reads].some(k => typeof k !== 'string' || k.length > 140)) throw new Error('Invalid read key');
  const messages = [...current.values()].sort((a,b) => Number(a.historical)-Number(b.historical) || (a.historical ? a.sequence-b.sequence : b.sequence-a.sequence) || (a.deliveryId < b.deliveryId ? -1 : a.deliveryId > b.deliveryId ? 1 : 0) || b.revision-a.revision)
    .map(m => ({...m, unread: !m.historical && !reads.has(identity(m))}));
  const threads = new Map();
  for (const m of messages) {
    const t = threads.get(m.threadId) ?? { id: m.threadId, sender: m.sender, preview: m.text, unread: false, messages: [] };
    t.messages.push(m); t.unread ||= m.unread; threads.set(m.threadId, t);
  }
  return { threads: [...threads.values()], unreadThreads: [...threads.values()].filter(t => t.unread).length };
}
// Registry must be generated from the exact prefix by the authoritative replay adapter.
export function validateReadAtPrefix(payload, registry, priorReads) {
  if (!payload || Object.keys(payload).sort().join(',') !== 'deliveryId,revision' ||
      typeof payload.deliveryId !== 'string' || !TOKEN.test(payload.deliveryId) ||
      !Number.isSafeInteger(payload.revision) || payload.revision < 1 || payload.revision > 1000000 ||
      !Array.isArray(registry) || registry.length > MAX_DELIVERIES || !Array.isArray(priorReads) || priorReads.length > MAX_DELIVERIES) return false;
  const key = identity(payload);
  return registry.some(m => valid(m) && !m.historical && identity(m) === key) && !registry.some(m => valid(m) && m.deliveryId === payload.deliveryId && m.revision > payload.revision) && !priorReads.includes(key);
}



