export const isMessagesPolicy = value => value === 'messages-v1' || value === 'messages-v2';
// Source policy for Messages v1. Called with verified reconstructed state on
// replay; callers must not treat unvalidated final snapshots as history proof.
export function deliveryCandidate(life, kind, id) {
  if (!life || typeof id !== 'string' || id.length > 80) return false;
  if (kind === 'work') {
    const day=life.schedule?.day;
    return id === `work:shift:${day}` && Number.isSafeInteger(day) && day > 0 && life.schedule.employment?.employed === true && life.schedule.workCalendar?.[String(day)] === true;
  }
  if (kind === 'loan') return /^loan:statement:loan-[1-9]\d*$/.test(id) && life.finance?.loans?.some(loan=>`loan:statement:${loan.id}`===id);
  if (kind === 'ren') return renCurrentIds(life).includes(id);
  return false;
}
export function renOfferId(life) {
  const s=life?.social46,p=s?.pending;
  if(!s?.introShown || (s.revision===2 && !s.intro?.numberShared) || !p || p.committed || !/^ren-[1-9]\d*$/.test(p.id) || !Number.isSafeInteger(p.day) || p.day<1 || !['door','game','repair'].includes(p.activity))return null;
  return `ren:offer:${p.id}:${p.day}:${p.activity}:${p.suggested?'suggested':'original'}`;
}
export function renCurrentIds(life) {
  const s=life?.social46;if(!s?.introShown || (s.revision===2 && !s.intro?.numberShared))return [];
  const ids=[],offer=renOfferId(life),p=s.pending,r=s.response;
  if(offer)ids.push(offer);
  if(p?.committed && /^ren-[1-9]\d*$/.test(p.id) && Number.isSafeInteger(p.day) && p.day>0) {
    ids.push(`ren:ack:${p.id}:${p.day}`);
    if(!p.seatingConfirmed)ids.push(`ren:floor:${p.id}:${p.day}`);
  }
  if(r && /^ren-[1-9]\d*$/.test(r.id) && ['response_declined','response_notice','response_broken'].includes(r.kind)) {
    ids.push(`ren:response:${r.id}:${r.kind}`);
    if(r.reply && /^[a-z]{1,24}$/.test(r.reply.choice))ids.push(`ren:response-reply:${r.id}:${r.kind}:${r.reply.choice}`);
  }
  return ids;
}
export function renMessageShown(life,id) {
  if(!renCurrentIds(life).includes(id))return false;
  const s=life.social46;
  if(id.startsWith('ren:offer:'))return Boolean(s.pending?.shown);
  if(id.startsWith('ren:ack:'))return s.pending?.ackShownDay===life.schedule.day;
  if(id.startsWith('ren:floor:'))return Boolean(s.pending?.floorPromptShown);
  if(id.startsWith('ren:response-reply:'))return Boolean(s.response?.reply?.shown);
  if(id.startsWith('ren:response:'))return Boolean(s.response?.shown);
  return false;
}
export function deliveryPayloads(life) {
  const day=life?.schedule?.day, work={kind:'work',id:`work:shift:${day}`,revision:1};
  const loans=(life?.finance?.loans ?? []).map(loan=>({kind:'loan',id:`loan:statement:${loan.id}`,revision:1}));
  return [...(deliveryCandidate(life,'work',work.id)?[work]:[]),...loans.filter(x=>deliveryCandidate(life,x.kind,x.id))];
}
export function isDeliveryPayload(payload) {
  return payload && Object.keys(payload).sort().join(',')==='id,kind,revision' && payload.revision===1 && ['work','loan','ren'].includes(payload.kind) && typeof payload.id==='string' && payload.id.length<=80;
}
export function earlyRepaymentEligibility(engine, loanId, expectedTotal = null, expectedLogLength = null) {
  const life=engine?.state?.life,loan=life?.finance?.loans?.find(item=>item.id===loanId && item.status==='pending');
  if(!loan || life.schedule?.recovery || engine.checkDueObligations().bills.length || !Number.isSafeInteger(loan.totalCents) ||
    (expectedTotal!==null && loan.totalCents!==expectedTotal) || (expectedLogLength!==null && engine.log?.length!==expectedLogLength) || Math.round(engine.state.cash*100)<loan.totalCents)return null;
  return {loanId:loan.id,totalCents:loan.totalCents};
}
