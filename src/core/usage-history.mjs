// Profile history contains bounded projections, never resumable save envelopes.
// Mutating callers must hold the shared schema-5 storage lock.
export const USAGE_HISTORY_KEY = 'quackpot_usage_history_v1';
export const USAGE_HISTORY_VERSION = 1;
export const MAX_HISTORY_BYTES = 2 * 1024 * 1024;
export const MAX_HISTORY_RUNS = 100;
export const MAX_PROJECTED_EVENTS = 2000;

const encoder = new TextEncoder();
const eventKinds = new Map([
  ['cue_shown', 'displayed'], ['offer_shown', 'displayed'],
  ['retention_modal_shown', 'displayed'], ['action', 'action'],
  ['draw_committed', 'committed'], ['reveal_shown', 'revealed'],
  ['terminal', 'terminal'], ['receipt_shown', 'receipt'],
]);
const allowedActions = new Set(['uninstall_chosen','leave_immediately','play_out_the_trap','stay_without_reward','race_choice','race_trial_consumed','starter_declined','fictional_install','quackpot_opened']);
const allowedTechniques = new Set(['launch_invitation','currency_obfuscation','fear_of_missing_out','sunk_cost_pity','power_creep','anchoring','exit_friction','completion_pressure','social_comparison','secondary_currency','pressure_on_possession']);
const allowedRoutes = new Set(['uninstall','running_on_empty','run_complete']);

function projectEvent(entry) {
  const category = eventKinds.get(entry.type);
  if (!category) return null;
  const result = { seq:entry.seq, category };
  const payload = entry.payload && typeof entry.payload === 'object' ? entry.payload : {};
  if (allowedActions.has(payload.kind)) result.action = payload.kind;
  if (allowedTechniques.has(payload.technique)) result.technique = payload.technique;
  if (allowedRoutes.has(payload.route)) result.route = payload.route;
  if (entry.type === 'reveal_shown' && Number.isSafeInteger(payload.commitSeq) && payload.commitSeq >= 0 && payload.commitSeq < entry.seq) result.commitSeq = payload.commitSeq;
  if (entry.type === 'draw_committed' && payload.odds && typeof payload.odds === 'object') {
    const odds = {};
    for (const key of ['common','rare','legendary']) if (typeof payload.odds[key] === 'number' && Number.isFinite(payload.odds[key]) && payload.odds[key] >= 0 && payload.odds[key] <= 1) odds[key] = payload.odds[key];
    if (Object.keys(odds).length) result.odds = odds;
  }
  return result;
}

export function emptyHistory(generation = 0) {
  return { version: USAGE_HISTORY_VERSION, generation, records: {}, achievements: { availability: 'unavailable' } };
}

export function parseHistory(raw) {
  if (raw === null) return emptyHistory();
  if (encoder.encode(raw).byteLength > MAX_HISTORY_BYTES) throw new Error('history too large');
  const history = JSON.parse(raw);
  if (!history || history.version !== USAGE_HISTORY_VERSION ||
      !Number.isSafeInteger(history.generation) || history.generation < 0 ||
      !history.records || typeof history.records !== 'object' || Array.isArray(history.records) ||
      Object.keys(history.records).length > MAX_HISTORY_RUNS ||
      history.achievements?.availability !== 'unavailable') throw new Error('unsupported or corrupt history');
  for (const [id, record] of Object.entries(history.records)) {
    if (!/^[0-9a-f]{32}$/.test(id) || !record || !Number.isSafeInteger(record.sourceCount) ||
        record.sourceCount < 0 || !/^[0-9a-f]{64}$/.test(record.sourceDigest) ||
        !Array.isArray(record.timeline) || record.timeline.length > MAX_PROJECTED_EVENTS ||
        !Number.isSafeInteger(record.omitted) || record.omitted < 0) throw new Error('corrupt history record');
  }
  return history;
}

async function digestPrefix(entries) {
  if (!globalThis.crypto?.subtle) throw new Error('secure digest unavailable');
  const bytes = encoder.encode(JSON.stringify(entries));
  if (bytes.byteLength > MAX_HISTORY_BYTES) throw new Error('source evidence too large');
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(hash, value => value.toString(16).padStart(2, '0')).join('');
}

// The first production projection intentionally retains only closed categories and
// sequence numbers; event payloads can include names, free text, seeds and clocks.
export async function mergeRun(history, id, entries) {
  if (!/^[0-9a-f]{32}$/.test(id) || !Array.isArray(entries) ||
      entries.some((entry, index) => !entry || entry.seq !== index || typeof entry.type !== 'string')) {
    throw new Error('invalid run evidence');
  }
  const prior = history.records[id];
  if (!prior && Object.keys(history.records).length >= MAX_HISTORY_RUNS) throw new Error('history full');
  if (prior) {
    if (entries.length < prior.sourceCount) throw new Error('shorter run evidence unverified');
    if (await digestPrefix(entries.slice(0, prior.sourceCount)) !== prior.sourceDigest) throw new Error('conflicting run evidence');
  }
  const events = entries.map(projectEvent).filter(Boolean);
  const record = {
    sourceCount: entries.length, sourceDigest: await digestPrefix(entries),
    timeline: events.slice(0, MAX_PROJECTED_EVENTS), omitted: Math.max(0, events.length - MAX_PROJECTED_EVENTS),
    terminal: events.some(event => event.category === 'terminal'),
    receipt: events.some(event => event.category === 'receipt'),
  };
  const next = { ...history, records: { ...history.records, [id]: record } };
  if (encoder.encode(JSON.stringify(next)).byteLength > MAX_HISTORY_BYTES) throw new Error('history full');
  return next;
}

export function clearHistory(history) {
  if (history.generation >= Number.MAX_SAFE_INTEGER) throw new Error('history generation exhausted');
  return emptyHistory(history.generation + 1);
}
