// Pure policy transitions. Callers commit the returned state and effects together.
import { LIFE_CONFIG, LIFE_POLICY_VERSION } from './life-config.mjs';

export function initialLife() {
  return {
    policyVersion: LIFE_POLICY_VERSION, config: { ...LIFE_CONFIG }, day: 1, phase: 'morning',
    anchor: null, meals: {}, session: null, nextId: 1, work: null,
    missedShifts: 0, employed: true, shiftDays: {}, rent: { id: 'rent-1', status: 'pending' }, rentSurfaced: false,
    recovery: null, fatiguePending: false, sold: [],
  };
}

const phases = ['morning', 'afternoon', 'evening', 'lateNight'];
const clone = (value) => structuredClone(value);
const cap = (value, low, high) => Math.max(low, Math.min(high, value));
const money = (value) => Math.round(value * 100) / 100;

/** Returns a fresh state and factual effects, or rejects an invalid intent without mutation. */
export function transitionLife(input, balances, intent) {
  const life = clone(input);
  const config = life.config;
  let cash = balances.cash;
  let health = balances.health;
  const events = [];
  const fail = (reason) => ({ ok: false, reason });
  const record = (type, payload = {}) => events.push({ type, payload });
  const hp = (delta, reason) => {
    const before = health;
    health = cap(health + delta, 0, config.maxHealth);
    record('life_health', { reason, before, delta: health - before, after: health });
    if (health === 0 && !life.recovery) life.recovery = { id: `recovery-${life.nextId++}`, recovered: false };
  };
  const deadlineBlocks = () => life.rent.status === 'due';
  const mealPending = () => {
    const meal = life.phase === 'morning' ? 'breakfast' : life.phase === 'evening' ? 'dinner' : null;
    return meal && !life.meals[`d${life.day}-${meal}`];
  };
  const shiftMiss = () => {
    if (life.phase === 'afternoon' && life.employed && !life.shiftDays[life.day]) {
      life.missedShifts++;
      life.shiftDays[life.day] = 'missed';
      record('life_shift_missed', { day: life.day, count: life.missedShifts });
      if (life.missedShifts >= 3) { life.employed = false; record('life_employment_ended', { day: life.day }); }
    }
  };
  const arrive = (day, phase) => {
    life.day = day; life.phase = phase; life.anchor = null; life.session = null;
    record('life_phase_arrived', { day, phase });
    if (day >= config.rentDueDay && life.rent.status === 'pending') {
      life.rent.status = 'due';
      record('expense_due', { kind: 'rent', amount: config.rentAmount, billId: life.rent.id, cashBefore: cash });
      if (cash < config.rentAmount) {
        life.rent.status = 'overdue';
        record('life_rent_shortfall', { billId: life.rent.id, shortfall: money(config.rentAmount - cash) });
      }
    }
    if (phase === 'morning' && life.fatiguePending) { life.fatiguePending = false; hp(-config.lateFatigueHealth, 'late_night_fatigue'); }
  };
  const advance = () => {
    shiftMiss();
    if (life.phase === 'lateNight' || life.phase === 'evening') arrive(life.day + 1, 'morning');
    else arrive(life.day, phases[phases.indexOf(life.phase) + 1]);
  };
  if (!intent || typeof intent.type !== 'string') return fail('invalid_intent');
  switch (intent.type) {
    case 'meal': {
      if (deadlineBlocks() || life.recovery) return fail('obligation_pending');
      const window = life.phase === 'morning' ? 'breakfast' : life.phase === 'evening' ? 'dinner' : null;
      if (!window) return fail('wrong_phase');
      const id = `d${life.day}-${window}`;
      if (life.meals[id]) return fail('already_consumed');
      if (!['buy', 'skip'].includes(intent.choice)) return fail('invalid_choice');
      if (intent.choice === 'buy' && cash < config.mealCost) return fail('insufficient_cash');
      life.meals[id] = intent.choice;
      if (intent.choice === 'buy') {
        cash = money(cash - config.mealCost);
        record('expense_due', { kind: window, amount: config.mealCost, billId: id, cashBefore: money(cash + config.mealCost) });
        record('expense_paid', { kind: window, amount: config.mealCost, billId: id, cashAfter: cash });
      } else hp(-config.mealSkipHealth, `${window}_skipped`);
      break;
    }
    case 'rent': {
      if (!['pending', 'due', 'overdue'].includes(life.rent.status)) return fail('already_paid');
      if (intent.choice === 'hold') {
        if (life.rent.status !== 'due' || cash < config.rentAmount) return fail('hold_unavailable');
        life.rent.status = 'overdue'; record('life_rent_held', { billId: life.rent.id, cash });
      } else if (intent.choice === 'pay') {
        if (cash < config.rentAmount) return fail('insufficient_cash');
        if (life.rent.status === 'pending') record('expense_due', { kind: 'rent', amount: config.rentAmount, billId: life.rent.id, cashBefore: cash });
        cash = money(cash - config.rentAmount); life.rent.status = 'paid';
        record('expense_paid', { kind: 'rent', amount: config.rentAmount, billId: life.rent.id, cashAfter: cash });
      } else return fail('invalid_choice');
      break;
    }
    case 'rent_surface':
      if (!['paid', 'overdue'].includes(life.rent.status)) return fail('rent_unresolved');
      life.rentSurfaced = true; record('life_rent_surfaced', { billId: life.rent.id, status: life.rent.status }); break;
    case 'agree_work': {
      if (deadlineBlocks() || life.recovery || life.anchor || life.work || !life.employed) return fail('unavailable');
      if (intent.kind !== 'scheduled' && intent.kind !== 'overtime') return fail('invalid_kind');
      if ((intent.kind === 'scheduled' && life.phase !== 'afternoon') || (intent.kind === 'overtime' && life.phase !== 'evening')) return fail('wrong_phase');
      const id = `work-${life.nextId++}`;
      life.anchor = id; life.work = { id, kind: intent.kind, status: 'doing' };
      record('life_work_agreed', { ...life.work, day: life.day });
      break;
    }
    case 'complete_work': {
      if (!life.work || life.work.id !== intent.id || life.work.status !== 'doing') return fail('work_not_pending');
      const work = life.work; work.status = 'completed';
      if (work.kind === 'scheduled') life.shiftDays[life.day] = 'completed';
      cash = money(cash + (work.kind === 'scheduled' ? config.scheduledWage : config.overtimeWage));
      record('income', { kind: work.kind === 'scheduled' ? 'wage' : 'overtime', amount: work.kind === 'scheduled' ? config.scheduledWage : config.overtimeWage, transactionId: work.id, cashAfter: cash });
      if (work.kind === 'overtime') hp(-config.overtimeHealth, 'overtime');
      life.work = null;
      break;
    }
    case 'leisure':
      if (deadlineBlocks() || life.recovery || life.anchor || life.phase !== 'evening') return fail('unavailable');
      life.anchor = `leisure-${life.nextId++}`; hp(config.leisureHealth, 'leisure'); break;
    case 'sell': {
      if (deadlineBlocks() || life.recovery || !['couch', 'tv'].includes(intent.asset) || life.sold.includes(intent.asset)) return fail('unavailable');
      const amount = intent.asset === 'couch' ? 10 : 15;
      life.sold.push(intent.asset); cash = money(cash + amount);
      record('income', { kind: 'asset_sale', asset: intent.asset, amount, cashAfter: cash }); break;
    }
    case 'phone_commit': {
      if (deadlineBlocks() || life.recovery || !['pull', 'race'].includes(intent.kind)) return fail('unavailable');
      if (life.day === 1 && life.phase !== 'evening' && life.phase !== 'lateNight') return fail('not_unlocked');
      if (!life.session) {
        if (life.anchor) return fail('anchor_used');
        const id = `session-${life.nextId++}`; life.session = { id, pull: false, race: false, suspended: false }; life.anchor = id;
      }
      if (life.session[intent.kind]) return fail('extension_required');
      life.session[intent.kind] = true; life.session.suspended = false;
      if (life.phase === 'lateNight') life.fatiguePending = true;
      record('life_session_commit', { id: life.session.id, kind: intent.kind });
      break;
    }
    case 'phone_suspend':
      if (!life.session) return fail('no_session'); life.session.suspended = true; break;
    case 'phone_resume':
      if (!life.session) return fail('no_session'); life.session.suspended = false; break;
    case 'extend_session':
      if (!life.session || intent.confirmed !== true || deadlineBlocks() || life.recovery || life.work || mealPending()) return fail('extension_unavailable');
      if (life.phase === 'evening') arrive(life.day, 'lateNight');
      else advance();
      record('life_session_extended', { day: life.day, phase: life.phase });
      break;
    case 'advance':
      if (deadlineBlocks() || life.recovery || life.work || mealPending()) return fail('pending_commitment');
      advance(); break;
    case 'late_night':
      if (deadlineBlocks() || life.recovery || life.work || mealPending() || life.phase !== 'evening') return fail('unavailable');
      arrive(life.day, 'lateNight'); break;
    case 'recover':
      if (!life.recovery || life.recovery.recovered) return fail('no_recovery');
      if (!life.anchor) shiftMiss();
      life.anchor = life.recovery.id; life.recovery.recovered = true; hp(config.recoveryHealth, 'bedrest');
      record('life_recovered', { id: life.recovery.id }); break;
    case 'finish_recovery':
      if (!life.recovery?.recovered || deadlineBlocks()) return fail('recovery_pending');
      life.recovery = null; advance(); break;
    default: return fail('unknown_intent');
  }
  return { ok: true, life, cash, health, events };
}
