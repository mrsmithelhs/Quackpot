// reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs
// Unit tests for Plan 40 storyboard data, scenes, and experiment tracker.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WORK_BEATS,
  COMMUTE_BEATS,
  WAGE_PAYSLIP,
  EVENING_ACTIVITIES,
  EXTRA_SHIFTS_CATALOG,
  rollDailyExtraShifts,
  LIKERT_LABELS,
  LIKERT_COLORS,
} from './copy.mjs';
import {
  getApartmentSceneSvg,
  getAmbientBackdropSvg,
  renderPaySlipHtml,
  renderLikertBadge,
  VIGNETTE_ICONS,
} from './scenes.mjs';
import { ExperimentTracker } from './experiment-tracker.mjs';

test('5-point Likert scale and 3-digit hex beat catalog', () => {
  // Plan 29 baseline completed-shift take-home wage
  assert.equal(WAGE_PAYSLIP.takeHome, '$60.00');

  // Verify 5 sample work beats
  assert.equal(WORK_BEATS.length, 5);
  for (const b of WORK_BEATS) {
    assert.match(b.hexId, /^[0-9A-F]{3}$/i);
    assert.ok(b.rating >= 1 && b.rating <= 5);
    assert.ok(b.heading.length > 0);
    assert.ok(b.text.length > 0);
    assert.ok(b.dimension.length > 0);
  }

  // Verify 5 sample commute beats (commute in and commute home)
  assert.equal(COMMUTE_BEATS.length, 5);
  const phases = new Set(COMMUTE_BEATS.map(b => b.phase));
  assert.ok(phases.has('in'));
  assert.ok(phases.has('home'));
  for (const b of COMMUTE_BEATS) {
    assert.match(b.hexId, /^[0-9A-F]{3}$/i);
    assert.ok(b.rating >= 1 && b.rating <= 5);
  }

  // Verify 5 extra shift types with 5 narrative beats each (25 total beats)
  assert.equal(EXTRA_SHIFTS_CATALOG.length, 5);
  for (const shift of EXTRA_SHIFTS_CATALOG) {
    assert.ok(typeof shift.cashGain === 'number' && shift.cashGain > 0);
    assert.ok(typeof shift.healthCost === 'number' && shift.healthCost > 0);
    assert.equal(shift.beats.length, 5);
    for (const beat of shift.beats) {
      assert.match(beat.hexId, /^[0-9A-F]{3}$/i);
      assert.ok(beat.rating >= 1 && beat.rating <= 5);
      assert.ok(beat.text.length > 0);
    }
  }

  // Verify daily extra shift roll returns 1-2 options and prioritizes gig work
  const rolled = rollDailyExtraShifts(2, 0.5);
  assert.equal(rolled.length, 2);
  assert.equal(rolled[0].category, 'gig');
});

test('Scene rendering, ambient backdrops, and SVG generation', () => {
  // Accepted apartment art renders correctly
  const kitchenSvg = getApartmentSceneSvg({ area: 'kitchen', light: 'neutral', duck: false, idPrefix: 'test-k' });
  assert.ok(kitchenSvg.includes('<svg'));
  assert.ok(kitchenSvg.includes('test-k'));

  const deskSvg = getApartmentSceneSvg({ area: 'desk-side', light: 'warm', duck: true, idPrefix: 'test-d' });
  assert.ok(deskSvg.includes('<svg'));
  assert.ok(deskSvg.includes('test-d'));

  // Ambient backdrop generation
  const warehouseBackdrop = getAmbientBackdropSvg('warehouse', 2);
  assert.ok(warehouseBackdrop.includes('<svg'));

  const transitBackdrop = getAmbientBackdropSvg('commute_transit', 4);
  assert.ok(transitBackdrop.includes('<svg'));

  // Likert badge markup
  const badgeHtml = renderLikertBadge('014', 4);
  assert.ok(badgeHtml.includes('#014'));
  assert.ok(badgeHtml.includes('Pleasant / Uplifting'));

  // Payslip HTML matches baseline
  const payslipHtml = renderPaySlipHtml();
  assert.ok(payslipHtml.includes('$60.00'));
  assert.ok(payslipHtml.includes('Harbor Logistics'));
});

test('ExperimentTracker tracks Likert tiers and compact usage format', () => {
  const tracker = new ExperimentTracker();
  const initialStats = tracker.getTierStats();
  assert.equal(initialStats.length, 3); // depleting, neutral, uplifting

  // Record an uplifting day session
  tracker.recordSession({
    beats: [['014', 4], ['015', 5], ['0C5', 5]],
    eveningChoice: 'call_mom',
  });

  // Record a depleting day session
  tracker.recordSession({
    beats: [['011', 1], ['012', 2], ['0C1', 1]],
    eveningChoice: 'open_gacha',
  });

  const updatedStats = tracker.getTierStats();
  const depleting = updatedStats.find(s => s.key === 'depleting');
  const uplifting = updatedStats.find(s => s.key === 'uplifting');

  assert.ok(depleting.gacha >= 1);
  assert.ok(uplifting.restorative >= 1);

  // Compact export format verification
  const compactJson = tracker.exportCompactUsage();
  assert.ok(compactJson.includes('"b":[["014",4],["015",5],["0C5",5]]'));
  assert.ok(compactJson.includes('"s":4.67'));
  assert.ok(compactJson.includes('"c":"call_mom"'));
});
