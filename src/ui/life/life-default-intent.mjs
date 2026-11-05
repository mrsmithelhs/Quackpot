// Transient UI state for a pending action; no scheduler or finance operation is
// prepared here. The controller must reclassify before committing a default.
export function snapshotDefaultIntent(engine, action) {
  if (!engine || engine.isTerminal() || !action || typeof action !== 'object') return null;
  const life=engine.state.life, due=engine.checkDueObligations();
  if (life?.policyVersion!=='five-slot-v1' || life.schedule.recovery || !due?.bills.length) return null;
  return structuredClone({action, bills:due.bills, cashCents:due.cashCents,
    state:engine.state, logLength:engine.log.length});
}

export function defaultIntentIsCurrent(engine, pending) {
  if (!pending) return false;
  const current=snapshotDefaultIntent(engine,pending.action);
  return current !== null && JSON.stringify(current)===JSON.stringify(pending);
}

export function selectedDefaultBill(pending, billId) {
  if (!pending || typeof billId!=='string') return null;
  return pending.bills.find(bill=>bill.id===billId) ?? null;
}
