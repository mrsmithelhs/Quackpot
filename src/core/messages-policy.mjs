// Source policy for Messages v1. Called with verified reconstructed state on
// replay; callers must not treat unvalidated final snapshots as history proof.
export function deliveryCandidate(life, kind, id) {
  if (!life || typeof id !== 'string' || id.length > 80) return false;
  if (kind === 'work') {
    const day=life.schedule?.day;
    return id === `work:shift:${day}` && Number.isSafeInteger(day) && day > 0 && life.schedule.employment?.employed === true && life.schedule.workCalendar?.[String(day)] === true;
  }
  if (kind === 'loan') return /^loan:statement:loan-[1-9]\d*$/.test(id) && life.finance?.loans?.some(loan=>`loan:statement:${loan.id}`===id);
  return false;
}
export function deliveryPayloads(life) {
  const day=life?.schedule?.day, work={kind:'work',id:`work:shift:${day}`,revision:1};
  const loans=(life?.finance?.loans ?? []).map(loan=>({kind:'loan',id:`loan:statement:${loan.id}`,revision:1}));
  return [...(deliveryCandidate(life,'work',work.id)?[work]:[]),...loans.filter(x=>deliveryCandidate(life,x.kind,x.id))];
}
export function isDeliveryPayload(payload) {
  return payload && Object.keys(payload).sort().join(',')==='id,kind,revision' && payload.revision===1 && ['work','loan'].includes(payload.kind) && typeof payload.id==='string' && payload.id.length<=80;
}
