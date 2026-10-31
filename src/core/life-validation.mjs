// Replay life transitions independently from their persisted snapshots.
import { initialLife, transitionLife } from './life-progression.mjs';
import { isKnownLifeConfig, LIFE_POLICY_VERSION } from './life-config.mjs';
import { hasEnteredQuackpot } from './life-entry.mjs';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function validateLifeHistory(entries, state) {
  const errors = [];
  const start = entries.find(e => e.type === 'run_started');
  if (!start || start.payload.lifePolicyVersion !== LIFE_POLICY_VERSION || !isKnownLifeConfig(start.payload.lifeConfig)) {
    return ['Unknown or missing life policy configuration in run_started'];
  }
  let life = initialLife();
  let cash = life.config.startCash;
  let health = life.config.startHealth;
  let terminal = false;
  let interruptedWork = null;
  let interruptedSession = null;
  let installed = false;
  let opened = false;
  let invitation = false, replied = false, acknowledged = false;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'action' && e.payload?.kind === 'fictional_install') {
      if (installed || opened || e.payload.app !== 'Quackpot' || hasEnteredQuackpot(entries.slice(0, i))) errors.push(`Invalid fictional installation at ${e.seq}`);
      installed = true;
    }
    if (e.type === 'action' && e.payload?.kind === 'quackpot_opened') {
      if (opened || e.payload.app !== 'Quackpot' || (life.day === 1 && !['evening', 'lateNight'].includes(life.phase)) || hasEnteredQuackpot(entries.slice(0, i))) errors.push(`Invalid first app entry at ${e.seq}`);
      opened = true;
    }
    if (e.type === 'offer_shown' && e.payload?.kind === 'launch_reply_invitation') {
      if (invitation || life.day !== 1 || !['morning', 'afternoon'].includes(life.phase) || e.payload.technique !== 'launch_invitation' || e.payload.launch !== 'day_1_evening') errors.push(`Invalid launch invitation at ${e.seq}`);
      invitation = true;
    }
    if (e.type === 'action' && e.payload?.kind === 'launch_reply') {
      if (!invitation || replied || e.payload.text !== 'LAUNCH') errors.push(`Invalid launch reply at ${e.seq}`);
      replied = true;
    }
    if (e.type === 'cue_shown' && e.payload?.kind === 'launch_reply_acknowledgment') {
      if (!replied || acknowledged) errors.push(`Invalid launch acknowledgment at ${e.seq}`);
      acknowledged = true;
    }
    if (terminal && e.type !== 'receipt_shown') errors.push(`Post-terminal event at ${e.seq}`);
    if ((interruptedWork || interruptedSession) && !terminal && !['work_interrupted', 'session_interrupted', 'terminal'].includes(e.type)) errors.push(`Event between interruption and terminal at ${e.seq}`);
    if (e.type === 'work_interrupted') {
      if (interruptedWork || !life.work || !same(e.payload, { id: life.work.id, kind: life.work.kind, day: life.day })) errors.push(`Invalid work interruption at ${e.seq}`);
      interruptedWork = e.payload.id;
    }
    if (e.type === 'session_interrupted') {
      if (interruptedSession || !life.session || !same(e.payload, { id: life.session.id, suspended: life.session.suspended, pull: life.session.pull, race: life.session.race })) errors.push(`Invalid session interruption at ${e.seq}`);
      interruptedSession = e.payload.id;
    }
    if (e.type === 'terminal') {
      if (life.work && interruptedWork !== life.work.id) errors.push('Terminal is missing pending work interruption');
      if (life.session && interruptedSession !== life.session.id) errors.push('Terminal is missing active session interruption');
      terminal = true;
    }
    if (e.type === 'life_intent') {
      if (e.payload.intent?.type === 'sell_after_open' && !hasEnteredQuackpot(entries.slice(0, i))) errors.push(`Sale before first app entry at ${e.seq}`);
      const result = transitionLife(life, { cash, health }, e.payload.intent);
      if (!result.ok) { errors.push(`Invalid life intent at ${e.seq}: ${result.reason}`); break; }
      for (let j = 0; j < result.events.length; j++) {
        const actual = entries[i + 1 + j], expected = result.events[j];
        if (!actual || actual.type !== expected.type || !same(actual.payload, expected.payload)) errors.push(`Life effect mismatch after ${e.seq}`);
      }
      const end = entries[i + 1 + result.events.length];
      if (!end || end.type !== 'life_transition' || !same(end.payload, { intent: e.payload.intent, life: result.life, cash: result.cash, health: result.health })) {
        errors.push(`Life transition mismatch after ${e.seq}`); break;
      }
      if (e.payload.intent.type === 'phone_commit') {
        const next = entries[i + 2 + result.events.length];
        const expected = e.payload.intent.kind === 'race' ? ['action'] : ['purchase', 'draw_committed'];
        if (!next || !expected.includes(next.type) || (e.payload.intent.kind === 'race' && next.payload.kind !== 'race_choice')) {
          errors.push(`Phone commitment at ${e.seq} has no corresponding outcome commit`);
        }
        if (e.payload.intent.kind === 'pull' && next?.type === 'purchase'
          && (!['single_pull', 'ten_pull'].includes(next.payload.kind) || entries[i + 3 + result.events.length]?.type !== 'draw_committed')) {
          errors.push(`Pull commitment at ${e.seq} has no committed draw`);
        }
      }
      life = result.life; cash = result.cash; health = result.health;
      i += result.events.length + 1;
      continue;
    }
    if (e.type === 'life_transition' || e.type.startsWith('life_')) errors.push(`Unpaired life event at ${e.seq}`);
    if (e.type === 'purchase' && e.payload.price) cash -= e.payload.price;
    if (e.type === 'reward' && e.payload.cash) cash += e.payload.cash;
    if (e.type === 'income' && e.payload.amount) cash += e.payload.amount;
    if (e.type === 'expense_paid' && e.payload.amount) cash -= e.payload.amount;
    if (e.type === 'escalation_result') {
      cash += e.payload.effects?.cashGained || 0;
      health -= e.payload.effects?.healthLost || 0;
    }
    cash = Math.round(cash * 100) / 100;
  }
  if ((interruptedWork || interruptedSession) && !terminal) errors.push('Interruption evidence requires a terminal event');
  if (!same(life, state.life)) errors.push('Life state does not match replay');
  if (!same(life.sold, state.assetsSold)) errors.push('Sold furnishings do not match life history');
  if (cash !== state.cash || health !== state.health) errors.push('Life balances do not match replay');
  return errors;
}
