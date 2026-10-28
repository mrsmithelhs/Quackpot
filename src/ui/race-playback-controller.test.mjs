import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeededRace } from '../core/race-resolver.mjs';
import { createRacePlaybackController, individualPresentationTiming, participantGlowEnvelope, raceCourseTimeAtFraction, raceFractionAtWallClock, raceHighlightParticipantEvents, restoreRaceTimelineState, wallClockAtRaceFraction } from './race-playback-controller.mjs';

function fixture() {
  return resolveSeededRace({
    seed: 'plan23-playback-controller', raceId: 'R01', playerBaseSpeed: 10,
    restFactor: 1, fieldBaseSpeed: 8, choice: 'steady', trialCommitted: false,
    trialMultiplier: 1.05, experiment: 'weave-rank-strong-contact',
    dramaArm: 'R2combined-risk-only', studySprintMean: 1,
  });
}

function harness() {
  const handlers = new Map();
  const button = () => ({
    handlers: new Map(), addEventListener(name, callback) { this.handlers.set(name, callback); },
    removeEventListener(name) { this.handlers.delete(name); },
    fire(name = 'click') { this.handlers.get(name)?.({ target: this }); },
  });
  const controls = {
    '[data-race-pause]': button(),
    '[data-race-replay]': button(), '[data-race-proceed]': button(),
  };
  const container = {
    querySelector(selector) { return controls[selector] ?? null; },
    addEventListener(name, callback) { const list = handlers.get(name) ?? []; list.push(callback); handlers.set(name, list); },
    removeEventListener(name, callback) {
      const list = handlers.get(name) ?? [];
      handlers.set(name, list.filter((item) => item !== callback));
    },
    fireClick(target) { for (const callback of handlers.get('click') ?? []) callback({ target }); },
    listenerCount() { return [...handlers.values()].reduce((total, items) => total + items.length, 0) + [...Object.values(controls)].reduce((total, item) => total + item.handlers.size, 0); },
  };
  const documentHandlers = new Map();
  const documentRef = {
    visibilityState: 'visible',
    addEventListener(name, callback) { documentHandlers.set(name, callback); },
    removeEventListener(name) { documentHandlers.delete(name); },
  };
  const frameCallbacks = new Map();
  let frameId = 0;
  const requestFrame = (callback) => { const id = ++frameId; frameCallbacks.set(id, callback); return id; };
  const cancelFrame = (id) => frameCallbacks.delete(id);
  const stepFrame = (time) => {
    const [id, callback] = frameCallbacks.entries().next().value ?? [];
    if (callback) { frameCallbacks.delete(id); callback(time); }
  };
  const mediaHandlers = new Map();
  const media = { matches: false, addEventListener(name, callback) { mediaHandlers.set(name, callback); }, removeEventListener(name) { mediaHandlers.delete(name); } };
  const matchMedia = () => media;
  return { container, controls, documentRef, documentHandlers, frameCallbacks, stepFrame, requestFrame, cancelFrame, media, mediaHandlers, matchMedia };
}

test('Plan 23 presentation reserves the accepted two-second highlight after actual race time', () => {
  const timing = individualPresentationTiming(fixture());
  assert.equal(timing.highlightSeconds, 2);
  assert.equal(timing.simulationWallSeconds, timing.duration + 2);
  assert.equal(timing.revealSeconds, 1);
  assert.ok(timing.duration > 0);
});

test('timeline event and checkpoint labels use the same course-time domain as the seek clock', () => {
  const resolution = fixture();
  const timing = individualPresentationTiming(resolution);
  const midpoint = (timing.highlightStartFraction + timing.highlightEndFraction) / 2;
  const event = resolution.eventRecords.reduce((closest, candidate) =>
    Math.abs(candidate.tick / resolution.ticks - midpoint) < Math.abs(closest.tick / resolution.ticks - midpoint)
      ? candidate
      : closest);
  const cases = [
    { kind: 'checkpoint', fraction: 0.25 },
    { kind: 'event', fraction: event.tick / resolution.ticks },
    { kind: 'checkpoint', fraction: 0.75 },
  ];

  for (const { kind, fraction } of cases) {
    const wallSeconds = wallClockAtRaceFraction(fraction, timing);
    const snapshotSeconds = raceFractionAtWallClock(wallSeconds, timing) * timing.duration;
    assert.ok(Math.abs(raceCourseTimeAtFraction(fraction, timing) - snapshotSeconds) < 1e-9,
      `${kind} label at fraction ${fraction} matches the seek snapshot before/during/after the highlight`);
  }
});

test('timeline high-water stays sticky through rewind and replay, and full seek reveals every event', () => {
  const ui = harness();
  const resolution = fixture();
  const controller = createRacePlaybackController(ui.container, resolution, {
    matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
  });
  const timelineEvents = resolution.eventRecords.filter((event) => ['duck-contact', 'wall-impact', 'leader-wobble-slowdown', 'catch-up-assist', 'finish-line-crossing', 'weave-turn'].includes(event.type));
  const lateEvent = timelineEvents.at(-1);
  const earlyEvent = timelineEvents[0];
  const seek = (event) => ui.container.fireClick({
    dataset: { raceSeek: event.id },
    closest(selector) { return selector === '[data-race-seek]' ? this : null; },
  });

  seek(lateEvent);
  const highWater = controller.snapshot().timelineHighWaterTick;
  assert.ok(highWater >= lateEvent.tick);
  seek(earlyEvent);
  assert.equal(controller.snapshot().timelineHighWaterTick, highWater,
    'seeking backwards retains reached timeline history');
  ui.controls['[data-race-replay]'].fire();
  assert.equal(controller.snapshot().timelineHighWaterTick, highWater,
    'replay restarts the current cursor without retracting timeline history');
  ui.container.fireClick({
    dataset: { raceCheckpoint: '100' },
    closest(selector) { return selector === '[data-race-checkpoint]' ? this : null; },
  });
  const finishedSnapshot = controller.snapshot();
  assert.equal(finishedSnapshot.timelineHighWaterTick, resolution.trajectory.at(-1).tick);
  assert.equal(finishedSnapshot.revealedEventIds.length, timelineEvents.length,
    'the full checkpoint reveals every timeline event');
  controller.destroy();
});

test('timeline high-water does not advance while the race view is inactive', () => {
  const ui = harness();
  const resolution = fixture();
  const controller = createRacePlaybackController(ui.container, resolution, {
    active: false, matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
  });
  ui.container.fireClick({
    dataset: { raceCheckpoint: '100' },
    closest(selector) { return selector === '[data-race-checkpoint]' ? this : null; },
  });
  assert.equal(controller.snapshot().timelineHighWaterTick, 0);
  controller.setActive(true);
  assert.equal(controller.snapshot().timelineHighWaterTick, resolution.trajectory.at(-1).tick,
    'reaching a timeline point while visible can then unlock its event descriptions');
  controller.destroy();
});

test('reload restores timeline reveal only from matching stored timeline cue evidence', () => {
  const resolution = fixture();
  const timelineEvents = resolution.eventRecords.filter((event) => ['duck-contact', 'wall-impact', 'leader-wobble-slowdown', 'catch-up-assist', 'finish-line-crossing', 'weave-turn'].includes(event.type));
  const first = timelineEvents[0];
  const entries = [
    { type: 'race_cue_displayed', payload: { raceNumber: 1, raceId: 'R01', cueId: `race-timeline-event:${first.id}`, eventId: first.id } },
    { type: 'race_cue_displayed', payload: { raceNumber: 2, raceId: 'R02', cueId: `race-timeline-event:${timelineEvents.at(-1).id}`, eventId: timelineEvents.at(-1).id } },
    { type: 'race_cue_displayed', payload: { raceNumber: 1, raceId: 'R01', cueId: `event:${timelineEvents.at(-1).id}`, eventId: timelineEvents.at(-1).id } },
  ];
  const restored = restoreRaceTimelineState(resolution, { raceNumber: 1, raceId: 'R01', logEntries: entries });
  assert.deepEqual(restored.timelineDisplayedEventIds, [first.id]);
  assert.equal(restored.timelineHighWaterTick, first.tick);
});

test('highlight glow follows recorded participant events and has eased two-second presentation duration', () => {
  const resolution = fixture();
  const highlightEvents = raceHighlightParticipantEvents(resolution);
  assert.ok(highlightEvents.length <= 1, 'the slow-motion cue highlights one recorded event, not the whole field');
  const center = (individualPresentationTiming(resolution).highlightStartFraction + individualPresentationTiming(resolution).highlightEndFraction) / 2;
  for (const type of ['weave-turn', 'leader-wobble-slowdown', 'duck-contact', 'wall-impact', 'catch-up-assist']) {
    const selected = raceHighlightParticipantEvents({
      ...resolution,
      eventRecords: [{ id: `${type}-highlight`, type, participants: ['A'], tick: Math.round(center * resolution.ticks) }],
    });
    assert.equal(selected[0]?.type, type, `${type} can provide an accepted highlight participant`);
    assert.deepEqual(selected[0]?.participants, ['A'], 'only recorded event participants are selected');
  }
  assert.deepEqual(raceHighlightParticipantEvents({
    ...resolution,
    eventRecords: [{ id: 'distant-highlight', type: 'weave-turn', participants: ['A'], tick: Math.round(0.9 * resolution.ticks) }],
  }), [], 'events outside the selected highlight window do not create a highlight pulse');

  assert.equal(participantGlowEnvelope(0), 0);
  assert.ok(participantGlowEnvelope(0.125) > 0 && participantGlowEnvelope(0.125) < 1,
    'glow has an eased onset');
  assert.equal(participantGlowEnvelope(1), 1);
  assert.ok(participantGlowEnvelope(2.1) > 0,
    'the effect remains visible past two seconds');
  assert.equal(participantGlowEnvelope(2.2), 0);
});

test('stored reveal evidence can restore the entire timeline high-water', () => {
  const resolution = fixture();
  const timelineEvents = resolution.eventRecords.filter((event) => ['duck-contact', 'wall-impact', 'leader-wobble-slowdown', 'catch-up-assist', 'finish-line-crossing', 'weave-turn'].includes(event.type));
  const entries = timelineEvents.map((event) => ({
    type: 'race_cue_displayed',
    payload: { raceNumber: 1, raceId: 'R01', cueId: `race-timeline-event:${event.id}`, eventId: event.id },
  }));
  const restored = restoreRaceTimelineState(resolution, { raceNumber: 1, raceId: 'R01', logEntries: entries });
  assert.equal(restored.timelineHighWaterTick, resolution.trajectory.at(-1).tick);
  assert.equal(restored.timelineDisplayedEventIds.length, timelineEvents.length);
});

test('Plan 23 playback pauses, seeks by event identity, and releases listeners and frames', () => {
  const ui = harness();
  const states = [];
  const actions = [];
  const cues = [];
  const resolution = fixture();
  const controller = createRacePlaybackController(ui.container, resolution, {
    matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
    onState: (state) => states.push(state), onAction: (action) => actions.push(action),
    onCueDisplayed: (cue) => cues.push(cue),
  });

  ui.stepFrame(100);
  ui.stepFrame(1100);
  ui.controls['[data-race-pause]'].fire();
  const paused = controller.snapshot();
  assert.equal(paused.userPaused, true);
  assert.equal(paused.elapsedMs, 1000);
  assert.equal(ui.frameCallbacks.size, 0);

  const event = resolution.eventRecords.find((item) => item.type === 'finish-line-crossing');
  const seekButton = {
    dataset: { raceSeek: event.id },
    closest(selector) { return selector === '[data-race-seek]' ? this : null; },
  };
  ui.container.fireClick(seekButton);
  assert.ok(actions.some((item) => item === 'seek'));
  assert.ok(cues.some((item) => item.eventId === event.id && item.seek === true));
  assert.equal(states.at(-1).userPaused, true);
  assert.match(states.at(-1).commentary, /crossed the finish line/);
  ui.controls['[data-race-pause]'].fire();
  ui.stepFrame(1200);
  ui.stepFrame(1300);
  assert.equal(cues.filter((item) => item.eventId === event.id).length, 1,
    'resuming from a fractional-time crossing does not log the sought cue twice');

  controller.destroy();
  assert.equal(ui.container.listenerCount(), 0);
  assert.equal(ui.documentHandlers.size, 0);
  assert.equal(ui.mediaHandlers.size, 0);
  assert.equal(ui.frameCallbacks.size, 0);
});

test('Plan 23 reduced motion settles to a static result without scheduling animation frames', () => {
  const ui = harness();
  ui.media.matches = true;
  const states = [];
  const controller = createRacePlaybackController(ui.container, fixture(), {
    matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
    onState: (state) => states.push(state),
  });
  assert.equal(states.at(-1).settled, true);
  assert.equal(states.at(-1).reduced, true);
  assert.equal(states.at(-1).progress, 1);
  assert.equal(ui.frameCallbacks.size, 0);
  const checkpoint = (fraction) => ({
    dataset: { raceCheckpoint: String(fraction) },
    closest(selector) { return selector === '[data-race-checkpoint]' ? this : null; },
  });
  ui.container.fireClick(checkpoint(50));
  assert.equal(states.at(-1).progress, 0.5);
  assert.equal(states.at(-1).podiumVisible, false);
  assert.equal(states.at(-1).reduced, true);
  ui.container.fireClick(checkpoint(100));
  assert.equal(states.at(-1).settled, true);
  assert.equal(states.at(-1).progress, 1);
  assert.equal(states.at(-1).podiumVisible, true);
  controller.destroy();
});

test('the shared Pause control pauses podium loops after completion without resuming race playback', () => {
  const ui = harness();
  const actions = [];
  const states = [];
  const controller = createRacePlaybackController(ui.container, fixture(), {
    matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
    onAction: (action) => actions.push(action), onState: (state) => states.push(state),
  });
  assert.equal(ui.controls['[data-race-proceed]'].disabled, true,
    'Continue remains unavailable until playback and podium settle');
  ui.stepFrame(100);
  ui.stepFrame((individualPresentationTiming(fixture()).simulationWallSeconds + 1) * 1000 + 100);
  assert.equal(states.at(-1).settled, true);
  assert.equal(states.at(-1).podiumVisible, true);
  assert.equal(ui.controls['[data-race-proceed]'].disabled, false,
    'Continue becomes available after the full presentation settles');
  ui.controls['[data-race-pause]'].fire();
  assert.equal(states.at(-1).settled, true);
  assert.equal(states.at(-1).playing, false);
  assert.equal(states.at(-1).podiumMotionPaused, true);
  ui.controls['[data-race-pause]'].fire();
  assert.equal(states.at(-1).settled, true);
  assert.equal(states.at(-1).podiumMotionPaused, false);
  assert.deepEqual(actions.filter((action) => action.includes('podium-motion')),
    ['pause-podium-motion', 'resume-podium-motion']);
  controller.destroy();
});

test('highlight and reveal lighting envelopes ease while reduced motion remains static', () => {
  const ui = harness();
  const states = [];
  const resolution = fixture();
  const controller = createRacePlaybackController(ui.container, resolution, {
    matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
    onState: (state) => states.push(state),
  });
  const timing = individualPresentationTiming(resolution);
  const highlightStartMs = timing.highlightStartFraction * timing.duration * 1000;
  ui.stepFrame(100);
  ui.stepFrame(100 + highlightStartMs + 100);
  assert.ok(states.at(-1).highlightProgress > 0 && states.at(-1).highlightProgress < 1,
    'highlight begins on an eased envelope');
  ui.stepFrame(100 + (timing.simulationWallSeconds + 0.2) * 1000);
  assert.ok(states.at(-1).revealProgress > 0 && states.at(-1).revealProgress < 1,
    'podium reveal begins on an eased envelope');
  controller.destroy();
});

test('Plan 23 commentary matches recorded wall-impact and leader-wobble event types', () => {
  const ui = harness();
  const resolution = structuredClone(fixture());
  resolution.eventRecords.push(
    { id: 'wall-impact-copy-check', type: 'wall-impact', tick: 10, time: 10, participants: ['P'] },
    { id: 'leader-wobble-copy-check', type: 'leader-wobble-slowdown', tick: 20, time: 20, participants: ['A'] },
  );
  const states = [];
  const controller = createRacePlaybackController(ui.container, resolution, {
    entrantLabels: { P: 'Your duck', A: 'Rival A' },
    matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
    onState: (state) => states.push(state),
  });
  const seek = (eventId) => {
    const button = { dataset: { raceSeek: eventId }, closest(selector) { return selector === '[data-race-seek]' ? this : null; } };
    ui.container.fireClick(button);
    return states.at(-1).commentary;
  };
  assert.match(seek('wall-impact-copy-check'), /Your duck touched the wall and recovered/);
  assert.match(seek('leader-wobble-copy-check'), /Rival A lost speed briefly while leading/);
  controller.destroy();
});

test('Plan 23 hidden or inactive presentation does not claim that cues were displayed', () => {
  const ui = harness();
  const states = [];
  const cues = [];
  const controller = createRacePlaybackController(ui.container, fixture(), {
    active: false, matchMedia: ui.matchMedia, documentRef: ui.documentRef,
    requestFrame: ui.requestFrame, cancelFrame: ui.cancelFrame,
    onState: (state) => states.push(state), onCueDisplayed: (cue) => cues.push(cue),
  });
  assert.equal(states.at(-1).visible, false);
  assert.equal(cues.length, 0);
  controller.setActive(true);
  assert.equal(states.at(-1).visible, true);
  ui.documentRef.visibilityState = 'hidden';
  ui.documentHandlers.get('visibilitychange')?.();
  assert.equal(states.at(-1).visible, false);
  assert.equal(cues.length, 0);
  controller.destroy();
});
