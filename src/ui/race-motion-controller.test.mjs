import test from 'node:test';
import assert from 'node:assert/strict';
import { createRaceMotionController } from './race-motion-controller.mjs';

function mockScene() {
  const mediaHandlers = new Map();
  const media = { matches: false, addEventListener(name, callback) { mediaHandlers.set(name, callback); }, removeEventListener(name) { mediaHandlers.delete(name); } };
  const contactLayers = [];
  const createAnimated = () => {
    const target = { style: {}, animations: [], getAnimations() { return this.animations; },
      animate(frames, options) { const animation = { frames, options, playState: 'running', finished: Promise.resolve(), cancel() { this.cancelled = true; this.playState = 'idle'; }, pause() { this.playState = 'paused'; }, play() { this.playState = 'running'; } }; this.animations.push(animation); return animation; } };
    return target;
  };
  const scopes = Array.from({ length: 6 }, (_, index) => {
    const id = ['A', 'P', 'B', 'C', 'D', 'E'][index];
    const shell = createAnimated();
    shell.dataset = { raceId: id, duckPrefix: `race-${id}`, duckMotion: 'paddle' };
    const svgNodes = new Map(['body-backing-rim', 'tail-backing', 'head-backing-rim', 'head-group', 'wing-group', 'wing-mid', 'wing-under-seam', 'wing-top', 'wing-mid-seam'].map((name) => [name, createAnimated()]));
    const svg = { querySelector(selector) { return svgNodes.get(selector.split('-').slice(2).join('-')) ?? null; } };
    shell.querySelector = (selector) => selector === 'svg' ? svg : selector.startsWith('#') ? svg.querySelector(selector) : null;
    const layer = { animations: [], getAnimations() { return this.animations; }, animate(frames, options) { const animation = { frames, options, cancel() { this.cancelled = true; } }; this.animations.push(animation); return animation; } };
    contactLayers.push(layer);
    return {
      querySelector(selector) { return selector === '[data-duck-motion]' ? shell : selector === '[data-race-contact-layer]' ? layer : null; },
      querySelectorAll(selector) { return selector === '*' ? [shell, ...svgNodes.values()] : []; },
      shell, layer, svgNodes,
    };
  });
  const toggle = {
    pressed: false,
    getAttribute(name) { return name === 'aria-pressed' ? String(this.pressed) : null; },
    click() { this.pressed = !this.pressed; },
  };
  const podiumScope = {
    querySelector(selector) { return selector === '[data-duck-motion-toggle]' ? toggle : null; },
    querySelectorAll() { return []; },
    toggle,
  };
  const container = {
    querySelectorAll(selector) { return selector === '[data-race-runner-scope]' ? scopes : selector === '[data-race-contact-layer]' ? contactLayers : []; },
    querySelector(selector) { return selector === '[data-race-podium-scope]' ? podiumScope : null; },
  };
  const instances = [];
  const motionControllerFactory = (scope, options) => {
    const instance = { scope, active: options.active, paused: options.paused, destroyed: false,
      setActive(value) { this.active = Boolean(value); }, destroy() { this.destroyed = true; } };
    instances.push(instance);
    return instance;
  };
  return { container, scopes, podiumScope, media, mediaHandlers, instances, motionControllerFactory, matchMedia: () => media };
}

test('Plan 23 motion maps sampled leaders, handles backward role seeks, animates recorded contacts on paper layers, and cleans up loops', () => {
  const scene = mockScene();
  const controller = createRaceMotionController(scene.container, {
    matchMedia: scene.matchMedia, documentRef: null, motionControllerFactory: scene.motionControllerFactory,
  });
  assert.equal(scene.instances.length, 7, 'six runners and the independent podium scope receive isolated controllers');
  const leaders = [
    { id: 'P', progress: 20 }, { id: 'A', progress: 19 }, { id: 'B', progress: 18 },
    { id: 'C', progress: 17 }, { id: 'D', progress: 16 }, { id: 'E', progress: 15 },
  ];
  controller.updateRunnerRanks({ cursorTick: 20, entrants: leaders });
  controller.updateRunnerRanks({ cursorTick: 40, entrants: leaders });
  assert.equal(scene.scopes[0].shell.dataset.duckMotion, 'graceful-bob');
  assert.equal(scene.scopes[1].shell.dataset.duckMotion, 'graceful-bob');
  assert.equal(scene.scopes[2].shell.dataset.duckMotion, 'paddle');

  const reversed = [
    { id: 'B', progress: 30 }, { id: 'A', progress: 29 }, { id: 'P', progress: 28 },
    { id: 'C', progress: 27 }, { id: 'D', progress: 26 }, { id: 'E', progress: 25 },
  ];
  controller.updateRunnerRanks({ cursorTick: 10, entrants: reversed });
  assert.equal(scene.scopes[1].shell.dataset.duckMotion, 'paddle', 'backward seeks restore the role at the sought race time immediately');
  assert.equal(scene.scopes[2].shell.dataset.duckMotion, 'graceful-bob');

  controller.playContact({ type: 'duck-contact', participants: ['P', 'A'], recovery: {} });
  assert.ok(scene.scopes[1].svgNodes.get('wing-top').animations.length > 0, 'recorded contact articulates an accepted factor-four wing paper layer');
  assert.ok(scene.scopes[0].svgNodes.get('head-backing-rim').animations.length > 0, 'recorded contact articulates the head backing paper');
  assert.ok(scene.scopes[1].shell.animations.some((animation) => animation.options.duration === 1100), 'impact recovery uses the accepted one-shot duration');
  controller.playContact({ type: 'wall-overlap', participants: ['B'], recovery: {} });
  assert.equal(scene.scopes[2].svgNodes.get('wing-top').animations.length, 0, 'only recorded wall impacts and duck contacts animate impact recovery');

  controller.setRaceComplete(true);
  controller.setPodiumVisible(true);
  const podiumController = scene.instances.find((item) => item.scope === scene.podiumScope);
  assert.equal(podiumController.active, true);
  controller.setPodiumMotionPaused(true);
  assert.equal(podiumController.active, true, 'pausing podium ambience does not destroy/reset its motion controller');
  assert.equal(scene.podiumScope.toggle.pressed, true, 'the underlying duck motion controller is paused');
  controller.setPodiumMotionPaused(false);
  assert.equal(podiumController.active, true);
  assert.equal(scene.podiumScope.toggle.pressed, false, 'resuming podium ambience resumes the same loops');
  controller.setActive(false);
  assert.ok(scene.instances.some((item) => item.active === false));
  controller.destroy();
  assert.equal(scene.mediaHandlers.size, 0);
  assert.ok(scene.instances.every((item) => item.destroyed));
  assert.ok(scene.scopes.every((scope) => scope.layer.animations.every((animation) => animation.cancelled)));
  assert.ok(scene.scopes.flatMap((scope) => [scope.shell, ...scope.svgNodes.values()]).every((target) => target.animations.every((animation) => animation.cancelled)),
    'destroy cancels in-flight contact tracks across the wrapper and paper layers');
});

test('Plan 23 motion responds to reduced-motion preference changes without retaining loops', () => {
  const scene = mockScene();
  const controller = createRaceMotionController(scene.container, {
    matchMedia: scene.matchMedia, documentRef: null, motionControllerFactory: scene.motionControllerFactory,
  });
  controller.playContact({ type: 'wall-impact', participants: ['P'] });
  const activeContactTracks = [scene.scopes[1].shell, ...scene.scopes[1].svgNodes.values()].flatMap((target) => target.animations);
  assert.ok(activeContactTracks.length > 0);
  scene.media.matches = true;
  controller.setPodiumMotionPaused(true);
  scene.mediaHandlers.get('change')?.();
  assert.ok(activeContactTracks.every((animation) => animation.cancelled), 'switching to reduced motion cancels active impact/recovery tracks');
  assert.ok(scene.instances.every((item) => item.destroyed));
  const reducedCount = scene.instances.length;
  controller.playContact({ type: 'duck-contact', participants: ['P'], recovery: {} });
  assert.equal(scene.scopes[1].layer.animations.length, 0);
  scene.media.matches = false;
  scene.mediaHandlers.get('change')?.();
  assert.equal(scene.instances.length, reducedCount + 7);
  const recreatedPodium = scene.instances.findLast((item) => item.scope === scene.podiumScope);
  assert.equal(recreatedPodium.paused, true, 'reduced-motion loop recreation preserves the settled podium pause state');
  controller.destroy();
});

test('event seek freezes a readable impact pose and replay reset cancels it', () => {
  const scene = mockScene();
  const controller = createRaceMotionController(scene.container, {
    matchMedia: scene.matchMedia, documentRef: null, motionControllerFactory: scene.motionControllerFactory,
  });
  controller.playContact({ type: 'duck-contact', participants: ['P'] }, { seekPose: true });
  const tracks = [scene.scopes[1].shell, ...scene.scopes[1].svgNodes.values()].flatMap((target) => target.animations);
  assert.ok(tracks.length > 0);
  assert.ok(tracks.every((animation) => animation.playState === 'paused' && animation.currentTime === 450),
    'seeking to a contact shows the mid-impact paper pose without autoplay');
  controller.resetContactMotions();
  assert.ok(tracks.every((animation) => animation.cancelled), 'replay removes the sought impact pose before the race restarts');
  controller.destroy();
});
