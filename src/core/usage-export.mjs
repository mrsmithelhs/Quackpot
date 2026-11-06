import { ZipWriter } from '@zip.js/zip.js/lib/zip-core-writer.js';
import { BlobWriter, TextReader } from '@zip.js/zip.js/lib/zip-core-native.js';
import { parseHistory, MAX_PROJECTED_EVENTS } from './usage-history.mjs';

const MAX_JSON_BYTES = 2 * 1024 * 1024;
const MAX_ZIP_BYTES = 8 * 1024 * 1024;
const categories = new Set(['displayed','action','committed','revealed','terminal','receipt']);
const actions = new Set(['uninstall_chosen','leave_immediately','play_out_the_trap','stay_without_reward','race_choice','race_trial_consumed','starter_declined','fictional_install','quackpot_opened']);
const techniques = new Set(['launch_invitation','currency_obfuscation','fear_of_missing_out','sunk_cost_pity','power_creep','anchoring','exit_friction','completion_pressure','social_comparison','secondary_currency','pressure_on_possession']);

export function usageDocument(raw, { currentSaveUnverified = false } = {}) {
  const history = parseHistory(raw);
  let remaining = MAX_PROJECTED_EVENTS;
  const runs = Object.keys(history.records).sort().map(runId => {
    const source = history.records[runId];
    const candidates = source.timeline.slice(0, remaining).map(item => {
      if (!Number.isSafeInteger(item.seq) || item.seq < 0 || !categories.has(item.category)) throw new Error('Invalid recorded event');
      const event = { seq:item.seq, category:item.category };
      if (actions.has(item.action)) event.action = item.action;
      if (techniques.has(item.technique)) event.technique = item.technique;
      if (['uninstall','running_on_empty','run_complete'].includes(item.route)) event.route = item.route;
      if (Number.isSafeInteger(item.commitSeq) && item.commitSeq >= 0 && item.commitSeq < item.seq) event.commitSeq = item.commitSeq;
      if (item.odds && typeof item.odds === 'object') {
        const odds = {};
        for (const key of ['common','rare','legendary']) if (typeof item.odds[key] === 'number' && Number.isFinite(item.odds[key]) && item.odds[key] >= 0 && item.odds[key] <= 1) odds[key] = item.odds[key];
        if (Object.keys(odds).length) event.odds = odds;
      }
      return event;
    });
    const committed = new Set(candidates.filter(item => item.category === 'committed').map(item => item.seq));
    const timeline = candidates.filter(item => item.category !== 'revealed' ||
      (item.commitSeq !== undefined && committed.has(item.commitSeq)));
    remaining -= timeline.length;
    const omitted = source.omitted + source.timeline.length - timeline.length;
    return { runId, status:source.receipt ? 'receipt-recorded' : source.terminal ? 'terminal' : 'unfinished',
      evidence:{ completeness:'incomplete', reason:'projection-and-profile-coverage-limited', timelineOmitted:omitted },
      summary:{ recordedTimelineEvents:source.timeline.length + source.omitted }, timeline };
  });
  return { format:'quackpot-profile-usage', schemaVersion:1, catalogVersion:'categories-1',
    coverage:{ complete:false, reason:'Earlier, cleared, unsaved or other-profile runs may be absent.',
      ...(currentSaveUnverified ? { currentSave:'shorter-unverified' } : {}) },
    achievements:{ availability:'unavailable' }, runs };
}

export async function createUsageZip(raw, options = {}) {
  const json = JSON.stringify(usageDocument(raw, options));
  if (new TextEncoder().encode(json).byteLength > MAX_JSON_BYTES) throw new Error('Usage file exceeds the size limit');
  const writer = new ZipWriter(new BlobWriter('application/zip'), { useWebWorkers:false, level:0, zip64:false });
  await writer.add('usage.json', new TextReader(json), { level:0, bufferedWrite:true,
    dataDescriptor:false, extendedTimestamp:false, lastModDate:new Date('1980-01-02T00:00:00Z') });
  const blob = await writer.close();
  if (blob.size > MAX_ZIP_BYTES) throw new Error('Usage archive exceeds the size limit');
  return blob;
}
