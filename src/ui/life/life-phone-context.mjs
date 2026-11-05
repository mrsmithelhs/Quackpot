// Presentation only: artwork and interaction must describe the same phone content.
import {latchDue,dueObligations} from '../../core/life-finance.mjs';
export function messagesDirectPhone(life,policy) {
  if(policy!=='messages-v1' || life?.policyVersion!=='five-slot-v1' || life.schedule.recovery)return false;
  const context=lifePhoneKind(life),s=life.schedule;
  const workBridge=context==='work' && s.day>=2 && s.slot==='midday' && !s.active && !life.story47;
  if(context!=='app' && !workBridge)return false;
  return dueObligations(latchDue(life.finance,{day:life.schedule.day,slot:life.schedule.slot}),0).bills.length===0;
}
export function lifePhoneKind(life) {
  if(life.policyVersion==='five-slot-v1') {
    const s=life.schedule,due=dueObligations(latchDue(life.finance,{day:s.day,slot:s.slot}),0).bills;
    const rescue=s.overtimeReservation?.status==='reserved' && s.day<=s.overtimeReservation.day && !(s.day===s.overtimeReservation.day && s.slot==='late-evening') && due.some(bill=>bill.id===s.overtimeReservation.rentId)
      && !due.some(bill=>bill.id.startsWith('loan-'));
    const blocked=Boolean(s.recovery) || (due.length>0 && !rescue);
    if(!blocked && (s.active?.kind==='work' || (!s.active && s.slot==='midday' && s.employment.employed && s.workCalendar[String(s.day)])))return 'work';
    return s.day>1 || ['evening','late-evening'].includes(s.slot)?'app':'invitation';
  }
  const blocked = life.recovery || life.rent.status === 'due'
    || (life.rent.status === 'overdue' && !life.rentSurfaced);
  if (!blocked && (life.work || (life.phase === 'afternoon' && life.employed && !life.anchor))) return 'work';
  return life.day > 1 || ['evening', 'lateNight'].includes(life.phase) ? 'app' : 'invitation';
}

export function lifePhoneResolved(life, entries = []) {
  return lifePhoneKind(life) === 'invitation'
    && entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply');
}

export function lifePhoneScreen(life, welcomeClaimed, entries = [], messagesPolicy = null) {
  const phase=life.policyVersion==='five-slot-v1'?life.schedule.slot:life.phase;
  const status = life.policyVersion === 'five-slot-v1'
    ? ({ morning: 'Morning', midday: 'Midday', 'early-evening': 'Early PM', evening: 'Evening', 'late-evening': 'Late Eve' })[phase]
    : phase === 'lateNight' ? 'Late' : phase === 'afternoon' ? 'PM' : phase[0].toUpperCase() + phase.slice(1);
  const kind = messagesDirectPhone(life,messagesPolicy)?'app':lifePhoneKind(life);
  if (kind === 'work') return { status, brand: 'MESSAGES', heading: ['Work'], body: [(life.work || life.schedule?.active?.kind==='work') ? 'Shift underway' : 'Shift today'], note: '' };
  if (kind === 'invitation') return { status, brand: 'QUACKPOT', heading: ['Tonight!'], body: [lifePhoneResolved(life, entries) ? 'On the list!' : 'Reply LAUNCH'], note: '' };
  return { status, brand: 'QUACKPOT', heading: [welcomeClaimed ? 'Quackpot' : 'Invitation'], body: [welcomeClaimed ? 'Return to app' : 'Open the app'], note: '' };
}
