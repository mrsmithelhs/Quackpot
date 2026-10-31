// Installation and first-entry facts are derived from the append-only log, so older policy-1 saves need no new fields.
export function hasEnteredQuackpot(entries) {
  return entries.some(e => (e.type === 'action' && e.payload?.kind === 'quackpot_opened')
    || (e.type === 'cue_shown' && e.payload?.technique === 'currency_obfuscation'
      && e.payload?.bundles?.length === 1 && e.payload.bundles[0].gems === 330 && e.payload.bundles[0].price === 4.99)
    || e.type === 'draw_committed' || e.type === 'race_result' || e.type === 'race_attempt_unresolved');
}
export function hasInstalledQuackpot(entries) {
  return hasEnteredQuackpot(entries) || entries.some(e => e.type === 'action' && e.payload?.kind === 'fictional_install');
}
