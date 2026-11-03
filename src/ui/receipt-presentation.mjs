// Presentation only: all facts come from the Receipt projection, never game state.
const bySeq = (a, b) => (Number.isFinite(a.seq) ? a.seq : Infinity) - (Number.isFinite(b.seq) ? b.seq : Infinity);

export function presentReceipt(receipt) {
  const evidence = receipt.evidence ?? [];
  const events = new Map(evidence.map(e => [e.seq, e]));
  const findings = receipt.findings.map((finding, index) => ({ ...finding, index,
    displayed: [...finding.displayed].sort(bySeq),
    did: finding.did.map(item => ({ ...item, register: ['draw_committed', 'race_result', 'race_attempt_unresolved', 'terminal'].includes(events.get(item.seq)?.type) ? 'Game recorded' : 'Recorded' })).sort(bySeq) }))
    .sort((a, b) => bySeq({ seq: Math.min(...a.displayed.map(x => Number.isFinite(x.seq) ? x.seq : Infinity)) }, { seq: Math.min(...b.displayed.map(x => Number.isFinite(x.seq) ? x.seq : Infinity)) }) || a.index - b.index);
  const race = [
    ...receipt.raceEvidence.displayed.map(item => ({ ...item, register: 'We displayed' })),
    ...receipt.raceEvidence.did.map(item => ({ ...item, register: ['race_result', 'race_attempt_unresolved', 'race_rest_policy_activated'].includes(events.get(item.seq)?.type) || events.get(item.seq)?.payload?.kind === 'race_trial_consumed' ? 'Game recorded' : 'You did' })),
  ].sort(bySeq);
  const count = (type, kind) => evidence.filter(e => e.type === type && (!kind || e.payload?.kind === kind)).length;
  const start = evidence.find(e => e.type === 'run_started');
  // Legacy projections make assumptions about initial balances and associations.
  const numericFields = { purchase: 'price', income: 'amount', expense_paid: 'amount', life_health: 'delta' };
  const current = receipt.chainValid && start?.payload?.lifePolicyVersion === 1 && Number.isFinite(start.payload.lifeConfig?.startCash) && Number.isFinite(start.payload.lifeConfig?.startHealth)
    && evidence.every(e => !numericFields[e.type] || Number.isFinite(e.payload?.[numericFields[e.type]]))
    && evidence.filter(e => ['expense_due', 'expense_paid'].includes(e.type)).every(e => typeof e.payload?.billId === 'string' && e.payload.billId.length > 0 && Number.isFinite(e.payload.amount))
    && Object.values(receipt.summary).every(Number.isFinite);
  return {
    findings, race, evidence,
    raceSources: evidence.filter(e => ['race_choice_offered', 'race_trial_offer_shown', 'race_cue_displayed', 'race_playback_action', 'race_result', 'race_attempt_unresolved', 'race_rest_policy_activated'].includes(e.type) || (e.type === 'action' && ['race_choice', 'race_trial_purchased', 'race_trial_consumed'].includes(e.payload?.kind))).sort(bySeq),
    drawSources: evidence.filter(e => ['draw_committed', 'reveal_shown'].includes(e.type)).sort(bySeq),
    raceCounts: [ ['Choice offers', count('race_choice_offered')], ['Choices', count('action', 'race_choice')], ['Finished results', count('race_result')], ['Unresolved attempts', count('race_attempt_unresolved')], ['Cues displayed', count('race_cue_displayed')], ['Playback actions', count('race_playback_action')] ],
    purchases: evidence.filter(e => e.type === 'purchase'),
    accounting: receipt.accounting.lines.filter(item => current || ['offer_shown', 'cue_shown', 'action', 'income', 'life_health', 'life_rent_held', 'life_rent_shortfall', 'life_work_agreed', 'life_shift_missed', 'life_employment_ended', 'work_interrupted', 'session_interrupted', 'life52_loan_terms_shown', 'life52_due_options_shown', 'life52_schedule_warning_shown', 'life52_schedule_warning_cancelled', 'life52_activity_warning_shown', 'life52_activity_warning_cancelled', 'life52_effect', 'life52_commit', 'terminal'].includes(events.get(item.seq)?.type)).sort(bySeq),
    expenses: current ? receipt.accounting.expenses : [],
    expenseCounts: current ? ['paid', 'waived', 'partially_waived', 'unpaid'].map(status => [status, receipt.accounting.expenses.filter(e => e.status === status).length]) : null,
    totals: current ? receipt.summary : null,
    draws: receipt.pullLedger,
    revealedCount: receipt.pullLedger.filter(d => d.revealed).length,
  };
}
