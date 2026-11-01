// Presentation only: artwork and interaction must describe the same phone content.
export function lifePhoneKind(life) {
  const blocked = life.recovery || life.rent.status === 'due'
    || (life.rent.status === 'overdue' && !life.rentSurfaced);
  if (!blocked && (life.work || (life.phase === 'afternoon' && life.employed && !life.anchor))) return 'work';
  return life.day > 1 || ['evening', 'lateNight'].includes(life.phase) ? 'app' : 'invitation';
}

export function lifePhoneResolved(life, entries = []) {
  return lifePhoneKind(life) === 'invitation'
    && entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply');
}

export function lifePhoneScreen(life, welcomeClaimed, entries = []) {
  const status = life.phase === 'lateNight' ? 'Late' : life.phase === 'afternoon' ? 'PM' : life.phase[0].toUpperCase() + life.phase.slice(1);
  const kind = lifePhoneKind(life);
  if (kind === 'work') return { status, brand: 'MESSAGES', heading: ['Work'], body: [life.work ? 'Shift underway' : 'Shift today'], note: '' };
  if (kind === 'invitation') return { status, brand: 'QUACKPOT', heading: ['Tonight!'], body: [lifePhoneResolved(life, entries) ? 'On the list!' : 'Reply LAUNCH'], note: '' };
  return { status, brand: 'QUACKPOT', heading: [welcomeClaimed ? 'Quackpot' : 'Invitation'], body: [welcomeClaimed ? 'Return to app' : 'Open the app'], note: '' };
}
