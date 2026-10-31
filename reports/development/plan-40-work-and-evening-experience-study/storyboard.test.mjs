// reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs
// Unit tests for Plan 40 storyboard data, scenes, and experiment tracker.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WORK_VIGNETTES,
  COMMUTE_VIGNETTES,
  WAGE_PAYSLIP,
  EVENING_ACTIVITIES,
  EXTRA_SHIFTS,
} from './copy.mjs';
import {
  getApartmentSceneSvg,
  renderPaySlipHtml,
  VIGNETTE_ICONS,
} from './scenes.mjs';
import { ExperimentTracker } from './experiment-tracker.mjs';

test('Copy contracts and numeric boundaries', () => {
  // Plan 29 baseline completed-shift take-home wage
  assert.equal(WAGE_PAYSLIP.takeHome, '$60.00');

  // Work vignettes have both grind and engaging conditions
  assert.ok(WORK_VIGNETTES.grind.beats.length >= 2);
  assert.ok(WORK_VIGNETTES.engaging.beats.length >= 2);

  // Commute vignettes have both exhausting and pleasant conditions
  assert.ok(COMMUTE_VIGNETTES.exhausting.beats.length >= 2);
  assert.ok(COMMUTE_VIGNETTES.pleasant.beats.length >= 2);

  // Evening activities include Call Mom (+5 HP) and Sit with Duck (+2 HP)
  assert.equal(EVENING_ACTIVITIES.callMom.healthEffect, 5);
  assert.equal(EVENING_ACTIVITIES.sitWithDuck.healthEffect, 2);
  assert.equal(EVENING_ACTIVITIES.openGacha.healthEffect, 0);

  // Extra shifts have flat cash rewards and explicit health penalties
  assert.equal(EXTRA_SHIFTS.length, 3);
  for (const s of EXTRA_SHIFTS) {
    assert.ok(typeof s.cashGain === 'number' && s.cashGain > 0);
    assert.ok(typeof s.healthCost === 'number' && s.healthCost > 0);
  }
});

test('Scene rendering and SVG generation', () => {
  // Accepted apartment art renders correctly
  const kitchenSvg = getApartmentSceneSvg({ area: 'kitchen', light: 'neutral', duck: false, idPrefix: 'test-k' });
  assert.ok(kitchenSvg.includes('<svg'));
  assert.ok(kitchenSvg.includes('test-k'));

  const deskSvg = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'test-d' });
  assert.ok(deskSvg.includes('<svg'));
  assert.ok(deskSvg.includes('test-d'));

  // Vignette icons exist
  assert.ok(VIGNETTE_ICONS.warehouse.includes('<svg'));
  assert.ok(VIGNETTE_ICONS.bus_rain.includes('<svg'));
  assert.ok(VIGNETTE_ICONS.park_sun.includes('<svg'));

  // Payslip HTML matches baseline
  const payslipHtml = renderPaySlipHtml();
  assert.ok(payslipHtml.includes('$60.00'));
  assert.ok(payslipHtml.includes('Harbor Logistics'));
});

test('ExperimentTracker tracks choices and cohorts', () => {
  const tracker = new ExperimentTracker();
  const initialStats = tracker.getConditionStats();
  assert.equal(initialStats.length, 4);

  // Record a restorative choice
  tracker.recordChoice({
    workCondition: 'engaging',
    commuteCondition: 'pleasant',
    eveningChoice: 'call_mom',
  });

  // Record a gacha choice
  tracker.recordChoice({
    workCondition: 'grind',
    commuteCondition: 'exhausting',
    eveningChoice: 'open_gacha',
  });

  const updatedStats = tracker.getConditionStats();
  const grindExh = updatedStats.find((s) => s.key === 'grind+exhausting');
  const engPleas = updatedStats.find((s) => s.key === 'engaging+pleasant');

  assert.ok(grindExh.gacha >= 1);
  assert.ok(engPleas.restorative >= 1);
});
