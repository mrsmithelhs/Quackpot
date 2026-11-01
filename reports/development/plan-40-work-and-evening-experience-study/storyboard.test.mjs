// reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs
// Unit tests for Plan 40 storyboard data, scenes, and experiment tracker.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATALOG_VERSION,
  WORK_BEATS,
  COMMUTE_BEATS,
  WAGE_PAYSLIP,
  KITCHEN_RETURN_SCENE,
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
  renderDepartureCardHtml,
  renderCommuteCardHtml,
  renderWorkShiftCardHtml,
  VIGNETTE_ICONS,
  esc,
} from './scenes.mjs';
import { ExperimentTracker } from './experiment-tracker.mjs';
import {
  beatOccurrenceKey,
  StoryboardController,
  resolveReviewerMoment,
  getNextWorkSequenceMoment,
} from './storyboard.mjs';

test('Repeated work observations count by slot while rerendering counts neither twice', () => {
  const context = { state: { moment: 'work_shift', displayedBeatsSet: new Set(), preChoiceBeats: [] } };
  const record = (slot) => StoryboardController.prototype.recordDisplayedBeat.call(context, WORK_BEATS[0], slot);
  record('first'); record('second'); record('first'); record('second');
  assert.equal(context.state.preChoiceBeats.length, 2);
});

test('Gig return hides author badges until the reviewer enables them', () => {
  const controller = Object.create(StoryboardController.prototype);
  controller.state = { moment: 'night_return', scenarioCommitted: true, activeExtraShift: EXTRA_SHIFTS_CATALOG[0], activeExtraBeat: WORK_BEATS[0], cash: 60, health: 80, showAuthorBadges: false };
  controller.dom = { sceneLayer: { innerHTML: '' }, overlayLayer: { innerHTML: '', querySelector: () => ({ addEventListener() {} }) } };
  controller.renderStage();
  assert.equal(controller.dom.overlayLayer.innerHTML.includes('likert-badge'), false);
  controller.state.showAuthorBadges = true;
  controller.renderStage();
  assert.equal(controller.dom.overlayLayer.innerHTML.includes('likert-badge'), true);
});

test('Author-assigned tone scale, catalog versioning, and Global Hex ID Uniqueness', () => {
  assert.equal(CATALOG_VERSION, '1.1.0');

  // Plan 29 baseline completed-shift take-home wage
  assert.equal(WAGE_PAYSLIP.takeHome, '$60.00');
  // Candidate gross/deductions omitted per Root Continuation 03
  assert.equal(WAGE_PAYSLIP.gross, undefined);
  assert.equal(WAGE_PAYSLIP.deductions, undefined);

  // Global ID Uniqueness Set
  const allHexIds = [];

  // Verify expanded work beats (15 beats)
  assert.equal(WORK_BEATS.length, 15);
  for (const b of WORK_BEATS) {
    assert.match(b.hexId, /^[0-9A-F]{3}$/i);
    assert.ok(b.rating >= 1 && b.rating <= 5);
    assert.ok(b.heading.length > 0);
    assert.ok(b.text.length > 0);
    assert.ok(b.dimension.length > 0);
    allHexIds.push(b.hexId);
  }

  // Verify expanded commute beats (12 beats)
  assert.equal(COMMUTE_BEATS.length, 12);
  const phases = new Set(COMMUTE_BEATS.map(b => b.phase));
  assert.ok(phases.has('in'));
  assert.ok(phases.has('home'));
  for (const b of COMMUTE_BEATS) {
    assert.match(b.hexId, /^[0-9A-F]{3}$/i);
    assert.ok(b.rating >= 1 && b.rating <= 5);
    allHexIds.push(b.hexId);
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
      allHexIds.push(beat.hexId);
    }
  }

  // STRICT GLOBAL ID UNIQUENESS CHECK across entire 52-beat catalog
  assert.equal(allHexIds.length, 52);
  const uniqueHexSet = new Set(allHexIds);
  assert.equal(uniqueHexSet.size, 52, `Expected 52 globally unique hex IDs, found duplicates in: ${allHexIds}`);

  // Backwards compatibility: verify 1.0.0 core IDs retain stable meanings
  const id011 = WORK_BEATS.find(b => b.hexId === '011');
  assert.equal(id011.rating, 1);
  const id014 = WORK_BEATS.find(b => b.hexId === '014');
  assert.equal(id014.rating, 4);
  const id0C1 = COMMUTE_BEATS.find(b => b.hexId === '0C1');
  assert.equal(id0C1.rating, 1);
  const id0C4 = COMMUTE_BEATS.find(b => b.hexId === '0C4');
  assert.equal(id0C4.rating, 4);

  // Day 1 kitchen return scene coordination with explicit dinner choices
  assert.ok(KITCHEN_RETURN_SCENE.heading.includes('Kitchen'));
  assert.ok(KITCHEN_RETURN_SCENE.options.eat);
  assert.ok(KITCHEN_RETURN_SCENE.options.skip);
  assert.ok(KITCHEN_RETURN_SCENE.options.eat.disclosedParams.includes('$6'));
  assert.ok(KITCHEN_RETURN_SCENE.options.skip.disclosedParams.includes('5 HP'));

  // Evening activities candidate labels
  assert.ok(EVENING_ACTIVITIES.sitWithDuck.badge.includes('Proposal'));
  assert.ok(EVENING_ACTIVITIES.openGacha.badge.includes('Stand-in'));

  // Verify daily extra shift roll returns 1-2 options and handles weights
  const rolled = rollDailyExtraShifts(2, 0.25);
  assert.equal(rolled.length, 2);
  assert.notEqual(rolled[0].id, rolled[1].id);
});

test('Scene rendering, payslip honesty (no gross/deductions), and SVG generation', () => {
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

  // Payslip HTML matches baseline without invented gross/deduction numbers
  const payslipHtml = renderPaySlipHtml();
  assert.ok(payslipHtml.includes('$60.00'));
  assert.ok(payslipHtml.includes('Harbor Logistics'));
  assert.equal(payslipHtml.includes('88.00'), false);
  assert.equal(payslipHtml.includes('28.00'), false);
  assert.equal(payslipHtml.includes('Gross'), false);
  assert.equal(payslipHtml.includes('Deductions'), false);
});

test('ExperimentTracker pre-choice isolation, unscored handling, and synthetic separation', () => {
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

  // Test recording with EMPTY preChoiceBeats (direct jump): should be unscored
  const unscoredSession = tracker.recordSession({
    preChoiceBeats: [],
    eveningChoice: 'call_mom',
  });
  assert.equal(unscoredSession.avgPreChoiceScore, null);
  assert.equal(unscoredSession.scoreTier, 'unscored');

  // Verify that an unscored session does NOT pollute depleting, neutral, or uplifting tiers
  const statsAfterUnscored = tracker.getObservedStats();
  for (const tier of statsAfterUnscored) {
    assert.equal(tier.total, 0);
  }

  // Record an uplifting session: pre-choice beats only should dictate the score
  tracker.recordSession({
    preChoiceBeats: [['014', 4], ['015', 5], ['0C5', 5]],
    eveningChoice: 'extra_shift',
    postChoiceBeats: [['F01', 1]], // Extra shift was depleting, but happened AFTER choice!
  });

  assert.equal(tracker.observedPreviewSessions.length, 2);
  const recorded = tracker.observedPreviewSessions[1];

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

  // Compact export format verification (Proposed Adapter for CATALOG_VERSION 1.1.0)
  const compactJson = tracker.exportCompactUsage();
  const exportEnvelope = JSON.parse(compactJson);
  assert.deepEqual(Object.keys(exportEnvelope), ['catalogVersion', 'scenarios']);
  assert.equal(exportEnvelope.catalogVersion, CATALOG_VERSION);
  assert.equal(exportEnvelope.scenarios.length, 2);
  assert.deepEqual(exportEnvelope.scenarios[1], {
    pre: [['014', 4], ['015', 5], ['0C5', 5]],
    avg: 4.67,
    act: 'extra_shift',
    post: [['F01', 1]],
    dinner: null,
  });
});

test('Displayed occurrence key deduplicates rerenders but preserves same beat in another slot', () => {
  assert.equal(beatOccurrenceKey('work_shift', '014'), beatOccurrenceKey('work_shift', '014'));
  assert.notEqual(beatOccurrenceKey('work_shift', '014'), beatOccurrenceKey('commute_in', '014'));
});

test('Reviewer navigation cannot reopen a completed choice or fabricate an extra-shift return', () => {
  assert.equal(resolveReviewerMoment('evening', {
    scenarioCommitted: true, eveningChoice: 'call_mom', activeExtraShift: null, activeExtraBeat: null,
  }), 'evening_complete');
  assert.equal(resolveReviewerMoment('night_return', {
    scenarioCommitted: false, eveningChoice: null, activeExtraShift: null, activeExtraBeat: null,
  }), 'evening');
  assert.equal(resolveReviewerMoment('evening', {
    scenarioCommitted: true, eveningChoice: 'extra_shift', activeExtraShift: { id: 'gig' }, activeExtraBeat: { hexId: 'F01' },
  }), 'night_return');
  assert.equal(resolveReviewerMoment('work_1', {}), 'work_shift');
  assert.equal(resolveReviewerMoment('work_2', {}), 'work_shift');
});

test('Two-stage work sequence progression and single-direction commute', () => {
  // Mode 1: Commute In (Morning transit to work -> Shift -> Wage Payslip)
  assert.equal(getNextWorkSequenceMoment('departure', 'in'), 'commute_in');
  assert.equal(getNextWorkSequenceMoment('commute_in', 'in'), 'work_shift');
  assert.equal(getNextWorkSequenceMoment('work_shift', 'in'), 'payslip');
  assert.equal(getNextWorkSequenceMoment('payslip', 'in'), 'kitchen_dinner');

  // Mode 2: Commute Home (Shift -> Late afternoon commute home -> Wage Payslip)
  assert.equal(getNextWorkSequenceMoment('departure', 'home'), 'work_shift');
  assert.equal(getNextWorkSequenceMoment('work_shift', 'home'), 'commute_home');
  assert.equal(getNextWorkSequenceMoment('commute_home', 'home'), 'payslip');
  assert.equal(getNextWorkSequenceMoment('payslip', 'home'), 'kitchen_dinner');
});

test('Departure card renders single action button without duplicate transit choices', () => {
  const html = renderDepartureCardHtml();
  assert.ok(html.includes('id="btn-start-work-sequence"'));
  assert.ok(html.includes('Head Out to Work'));
  assert.equal(html.includes('id="btn-commute-in"'), false);
  assert.equal(html.includes('Arrive at Shift Floor'), false);
});

test('Work shift renders two notes on a single card and hides debug badges in production view', () => {
  const beat1 = WORK_BEATS[1]; // #016 (& Paper Cuts)
  const beat2 = WORK_BEATS[9]; // #014

  // Production view (default): showAuthorBadges = false
  const cleanHtml = renderWorkShiftCardHtml(beat1, beat2, { commuteDirection: 'in', showAuthorBadges: false });
  assert.ok(cleanHtml.includes(esc(beat1.heading)));
  assert.ok(cleanHtml.includes(esc(beat1.text)));
  assert.ok(cleanHtml.includes(esc(beat2.heading)));
  assert.ok(cleanHtml.includes(esc(beat2.text)));
  assert.ok(cleanHtml.includes('Clock Out &amp; Collect Wages'));
  // Debug badges must be hidden
  assert.equal(cleanHtml.includes('likert-badge'), false);
  assert.equal(cleanHtml.includes('#016'), false);
  assert.equal(cleanHtml.includes('#014'), false);

  // Reviewer debug view: showAuthorBadges = true
  const debugHtml = renderWorkShiftCardHtml(beat1, beat2, { commuteDirection: 'home', showAuthorBadges: true });
  assert.ok(debugHtml.includes('Clock Out &amp; Head Home'));
  assert.ok(debugHtml.includes('likert-badge'));
  assert.ok(debugHtml.includes('#016'));
  assert.ok(debugHtml.includes('#014'));
});

test('Commute card renders single directional transit and hides debug badges in production view', () => {
  const beat = COMMUTE_BEATS[2]; // #0C3

  // Commute In (clean production view)
  const cleanInHtml = renderCommuteCardHtml(beat, { phase: 'in', showAuthorBadges: false });
  assert.ok(cleanInHtml.includes('Stage 1/2'));
  assert.ok(cleanInHtml.includes('id="btn-enter-work"'));
  assert.ok(cleanInHtml.includes('Arrive at Shift Floor'));
  assert.equal(cleanInHtml.includes('likert-badge'), false);

  // Commute Home (debug view)
  const debugHomeHtml = renderCommuteCardHtml(beat, { phase: 'home', showAuthorBadges: true });
  assert.ok(debugHomeHtml.includes('Stage 2/2'));
  assert.ok(debugHomeHtml.includes('id="btn-arrive-home"'));
  assert.ok(debugHomeHtml.includes('Arrive at Apartment Door'));
  assert.ok(debugHomeHtml.includes('likert-badge'));
  assert.ok(debugHomeHtml.includes('#0C3'));
});

test('Session lifecycle: single evening choice, dinner maintenance choice, and candidate figures', () => {
  const tracker = new ExperimentTracker();

  // Test recording a session with explicit dinner choice
  const session = tracker.recordSession({
    preChoiceBeats: [['012', 2], ['0C4', 4]],
    eveningChoice: 'call_mom',
    dinnerChoice: 'eat',
  });

  assert.equal(session.dinnerChoice, 'eat');
  assert.equal(session.eveningChoice, 'call_mom');
  assert.equal(session.avgPreChoiceScore, 3.0);
  assert.equal(session.scoreTier, 'neutral');
  assert.equal(session.postChoiceBeats.length, 0);

  // Verify candidate figures are documented as working proposals
  for (const shift of EXTRA_SHIFTS_CATALOG) {
    assert.ok(shift.cashGain >= 35 && shift.cashGain <= 55, `Candidate cashGain out of expected range: ${shift.cashGain}`);
    assert.ok(shift.healthCost >= 8 && shift.healthCost <= 15, `Candidate healthCost out of expected range: ${shift.healthCost}`);
  }
});
