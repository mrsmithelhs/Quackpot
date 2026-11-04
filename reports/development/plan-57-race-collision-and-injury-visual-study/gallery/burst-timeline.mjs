// Candidate presentation timing; independent of injury and race mechanics.
export const BURST_FRAMES = Object.freeze([
  { name: 'onset', start: 0, end: .12, sample: .06 },
  { name: 'expansion', start: .12, end: .30, sample: .20 },
  { name: 'breakup', start: .30, end: .52, sample: .41 },
  { name: 'settle', start: .52, end: .85, sample: .68 },
]);
export function burstFrameAt(age, still = false) {
  if (!Number.isFinite(age) || age < 0 || age >= .85) return null;
  return still ? 'expansion' : BURST_FRAMES.find(frame => age >= frame.start && age < frame.end)?.name ?? null;
}
