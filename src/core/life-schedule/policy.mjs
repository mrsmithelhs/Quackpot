export const SLOTS = Object.freeze(['morning', 'midday', 'early-evening', 'evening', 'late-evening']);
export const BASELINE = Object.freeze({ id: 'plan51-experimental', startCash: 80, startHealth: 100, maxHealth: 100, mealCost: 6, mealSkipHealth: 5, scheduledWage: 60, overtimeWage: 60, overtimeHealth: 15, rentAmount: 170, rentDueDay: 4, recoveryHealth: 25, lateFatigueHealth: 10, earlyBedHealth: 5, recoveryConsumesSlot: true, rentStudy: true, hypotheticalRentContinuation: false, employmentStudy: false, overtimeStudy: false, supportedDays: 5 });
export function guidance(day, consequences, policy) {
  const stage = day === 1 ? 'guided' : day <= 1 + policy.supportedDays ? 'supported' : 'independent';
  return { stage, disclosures: consequences.filter(c => stage !== 'independent' || c.new || c.escalated || c.required).map(c => c.kind) };
}


