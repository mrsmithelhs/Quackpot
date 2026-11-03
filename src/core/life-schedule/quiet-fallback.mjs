// Decide only whether the no-reward fallback is available. The caller supplies
// freshly inspected, genuinely executable free alternatives; purchases alone
// never remove a free way forward. Nothing here mutates game state.
export function quietFallbackEligibility({quiet, alternatives = []} = {}) {
  if (!quiet?.ok) return {ok:false,reason:quiet?.reason ?? 'unavailable'};
  const schedule=quiet.proposal?.schedule;
  if (!schedule || schedule.conflicts?.length || schedule.rentWorkConflict) return {ok:false,reason:'commitment_pending'};
  if (alternatives.some(option=>option?.available === true && option?.free === true)) return {ok:false,reason:'free_alternative_available'};
  return {ok:true};
}
