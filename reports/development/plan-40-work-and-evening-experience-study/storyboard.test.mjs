// reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs
// Unit tests for Plan 40 storyboard data, scenes, and experiment tracker.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATALOG_VERSION,
  WORK_BEATS,
  COMMUTE_BEATS,
  WAGE_PAYSLIP,
  EVENING_ACTIVITIES,
  EXTRA_SHIFTS_CATALOG,
  rollDailyExtraShifts,
  AUTHOR_TONE_LABELS,
  AUTHOR_TONE_COLORS,
} from './copy.mjs';
import {
  getApartmentSceneSvg,
  getAmbientBackdropSvg,
  renderPaySlipHtml,
  renderLikertBadge,
  VIGNETTE_ICONS,
} from './scenes.mjs';
import { ExperimentTracker } from './experiment-tracker.mjs';

test('Author-assigned tone scale, catalog versioning, and 3-digit hex IDs', () => {
  assert.equal(CATALOG_VERSION, '1.0.0');

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

  // Verify 5 extra shift types with 5 alternative narrative beats each (25 total beats)
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

  // Verify daily extra shift roll returns 1-2 options and handles weights
  const rolled = rollDailyExtraShifts(2, 0.25);
  assert.equal(rolled.length, 2);
  assert.notEqual(rolled[0].id, rolled[1].id);
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

  // Tone badge markup
  const badgeHtml = renderLikertBadge('014', 4);
  assert.ok(badgeHtml.includes('#014'));
  assert.ok(badgeHtml.includes('Pleasant / Uplifting'));

  // Payslip HTML matches baseline
  const payslipHtml = renderPaySlipHtml();
  assert.ok(payslipHtml.includes('$60.00'));
  assert.ok(payslipHtml.includes('Harbor Logistics'));
});

test('ExperimentTracker pre-choice isolation and synthetic-data separation', () => {
  const tracker = new ExperimentTracker();

  // Observed preview sessions start empty (0)
  assert.equal(tracker.observedPreviewSessions.length, 0);
  const emptyObserved = tracker.getObservedStats();
  for (const tier of emptyObserved) {
    assert.equal(tier.total, 0);
  }

  // Demonstration fixture is separate and non-zero
  const demoStats = tracker.getDemonstrationStats();
  const demoTotal = demoStats.reduce((acc, t) => acc + t.total, 0);
  assert.equal(demoTotal, 90);

  // Record an session: pre-choice beats only should dictate the score
  tracker.recordSession({
    preChoiceBeats: [['014', 4], ['015', 5], ['0C5', 5]],
    eveningChoice: 'extra_shift',
    postChoiceBeats: [['F01', 1]], // Extra shift was depleting, but happened AFTER choice!
  });

  assert.equal(tracker.observedPreviewSessions.length, 1);
  const recorded = tracker.observedPreviewSessions[0];

  // Pre-choice score should be (4 + 5 + 5)/3 = 4.67 (Uplifting), NOT dragged down by F01
  assert.equal(recorded.avgPreChoiceScore, 4.67);
  assert.equal(recorded.scoreTier, 'uplifting');
  assert.equal(recorded.postChoiceBeats.length, 1);
  assert.equal(recorded.postChoiceBeats[0][0], 'F01');

  // Verify observed tier stats updated without polluting demo stats
  const updatedObserved = tracker.getObservedStats();
  const upliftingTier = updatedObserved.find(s => s.key === 'uplifting');
  assert.equal(upliftingTier.total, 1);
  assert.equal(upliftingTier.extra, 1);

  // Compact export format verification
  const compactJson = tracker.exportCompactUsage();
  assert.ok(compactJson.includes('"pre":[["014",4],["015",5],["0C5",5]]'));
  assert.ok(compactJson.includes('"avg":4.67'));
  assert.ok(compactJson.includes('"act":"extra_shift"'));
  assert.ok(compactJson.includes('"post":[["F01",1]]'));
});
