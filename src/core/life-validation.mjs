// Replay life transitions independently from their persisted snapshots.
import { initialLife, transitionLife } from './life-progression.mjs';
import { isKnownLifeConfig, LIFE_POLICY_VERSION } from './life-config.mjs';

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
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'life_intent') {
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
  if (!same(life, state.life)) errors.push('Life state does not match replay');
  if (cash !== state.cash || health !== state.health) errors.push('Life balances do not match replay');
  return errors;
}
