// Working values for new Plan 38 runs. Legacy runs retain their original rules.
export const LIFE_POLICY_VERSION = 1;
export const LIFE_CONFIG = Object.freeze({
  startCash: 80, startHealth: 100, maxHealth: 100, mealCost: 6,
  mealSkipHealth: 5, scheduledWage: 60, rentAmount: 170, rentDueDay: 4,
  recoveryHealth: 25, lateFatigueHealth: 10, leisureHealth: 10,
  overtimeWage: 60, overtimeHealth: 15,
});

export function isKnownLifeConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(LIFE_CONFIG);
  return Object.keys(value).length === keys.length
    && keys.every((key) => Number.isFinite(value[key]) && value[key] === LIFE_CONFIG[key]);
}
