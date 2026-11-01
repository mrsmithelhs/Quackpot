// New-run tutorial gate; historical life-policy-1 transitions remain unchanged.
export const TUTORIAL_SHIFT_VERSION = 1;
const blocking = new Set(['advance', 'extend_session', 'phone_commit', 'late_night', 'finish_recovery']);
export function tutorialShiftBlock(version, life, intent) {
  if (version !== TUTORIAL_SHIFT_VERSION || !life || life.day !== 1 || life.shiftDays?.[1] === 'completed') return null;
  return blocking.has(intent?.type) ? 'tutorial_shift_required' : null;
}
