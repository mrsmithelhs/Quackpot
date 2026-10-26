import test from 'node:test';
import assert from 'node:assert/strict';
import { composeDuckSvg } from '../core/duck-rig.mjs';
import { createDigitalDuckSvg } from './duck-rig-view.mjs';
import { createDuckMotionController, selectGachaDuckMotion } from './duck-motion-controller.mjs';

test('cosmetic motion is a stable keyed choice with no game RNG dependency', () => {
  for (const identity of ['duck_01', 'duck_02']) {
    const choice = selectGachaDuckMotion(17, identity);
    assert.ok(['paddle', 'graceful-bob'].includes(choice));
    assert.equal(selectGachaDuckMotion(17, identity), choice);
  }
  assert.notEqual(selectGachaDuckMotion(17, 'duck_01'), selectGachaDuckMotion(18, 'duck_01'));
});

test('digital rig helper namespaces filter and group IDs per card', () => {
  const first = createDigitalDuckSvg({ prefix: 'qp-card-10', label: 'First duck' });
  const second = createDigitalDuckSvg({ prefix: 'qp-card-11', label: 'Second duck' });
  assert.match(first, /id="qp-card-10-seam-shadow"/);
  assert.match(first, /filter="url\(#qp-card-10-seam-shadow\)"/);
  assert.match(second, /id="qp-card-11-seam-shadow"/);
  assert.doesNotMatch(first, /id="duck-seam-shadow"/);
  assert.match(first, /aria-label="First duck"/);
  assert.throws(() => createDigitalDuckSvg({ prefix: 'bad prefix', label: 'Duck' }), /SVG-safe/);
  assert.equal(composeDuckSvg({ prefix: 'rig_test', paperMode: 'hybrid' }).includes('rig_test-seam-shadow'), true);
});

class FakeAnimation {
  constructor() { this.paused = false; this.cancelled = false; this.currentTime = 0; this.playState = 'running'; this.playCalls = 0; }
  pause() { this.paused = true; this.playState = 'paused'; }
  play() { this.paused = false; this.playState = 'running'; this.playCalls += 1; }
  cancel() { this.cancelled = true; this.playState = 'idle'; }
}

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.style = {};
    this.dataset = {};
    this.isConnected = true;
    this.attributes = {};
    this.listeners = new Map();
    this.children = new Map();
    this.animations = [];
    this.textContent = '';
    this.disabled = false;
  }
  querySelector(selector) { return this.children.get(selector) || null; }
  querySelectorAll(selector) { return selector === '[id]' ? [...this.children.values()] : []; }
  animate(frames, options) { const animation = new FakeAnimation(); animation.frames = frames; animation.options = options; this.animations.push(animation); return animation; }
  addEventListener(name, handler) { this.listeners.set(name, handler); }
  removeEventListener(name) { this.listeners.delete(name); }
  setAttribute(name, value) { this.attributes[name] = value; }
}

function createMotionShell(prefix = 'qp-card-9', motion = 'paddle') {
  const shell = new FakeElement();
  shell.dataset = { duckPrefix: prefix, duckMotion: motion };
  const svg = new FakeElement();
  for (const id of ['head-group', 'wing-group', 'body-backing-rim', 'tail-backing', 'head-backing-rim', 'wing-mid', 'wing-under-seam', 'wing-top', 'wing-mid-seam']) {
    svg.children.set(`#${prefix}-${id}`, new FakeElement(`${prefix}-${id}`));
  }
  shell.children.set('svg', svg);
  return { shell, svg };
}

function createFixture() {
  const elements = [];
  const { shell, svg } = createMotionShell();
  elements.push(shell);
  const button = new FakeElement();
  const status = new FakeElement();
  const container = {
    querySelectorAll: () => elements,
    querySelector: (selector) => selector === '[data-duck-motion-toggle]' ? button : status,
  };
  const listeners = new Map();
  const documentRef = {
    visibilityState: 'visible',
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  const mediaListeners = new Set();
  const observedTargets = new Set();
  const media = {
    matches: false,
    addEventListener: (_name, handler) => mediaListeners.add(handler),
    removeEventListener: (_name, handler) => mediaListeners.delete(handler),
    change(value) { media.matches = value; for (const handler of mediaListeners) handler(); },
  };
  let observerCallback;
  let disconnected = false;
  class Observer {
    constructor(callback) { observerCallback = callback; }
    observe(target) { this.target = target; observedTargets.add(target); }
    unobserve(target) { observedTargets.delete(target); }
    disconnect() { disconnected = true; observedTargets.clear(); }
  }
  return { container, shell, svg, elements, button, status, documentRef, media, listeners, Observer, observedTargets, observerCallback: () => observerCallback, disconnected: () => disconnected };
}

test('controller pauses and resumes on visibility/offscreen changes and resets on reduced motion or teardown', () => {
  const fixture = createFixture();
  const controller = createDuckMotionController(fixture.container, {
    documentRef: fixture.documentRef,
    matchMedia: () => fixture.media,
    IntersectionObserverRef: fixture.Observer,
  });
  const svgElements = [...fixture.svg.children.values()];
  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: true, intersectionRatio: 1 }]);
  assert.ok(svgElements[0].animations.length > 0);
  assert.equal(fixture.svg.children.get('#qp-card-9-wing-mid').style.transformOrigin, '52px 56px');
  assert.equal(fixture.svg.children.get('#qp-card-9-wing-under-seam').style.transformOrigin, '52px 56px');
  assert.equal(fixture.button.disabled, false);

  const wingMidAnimation = fixture.svg.children.get('#qp-card-9-wing-mid').animations[0];
  assert.deepEqual(wingMidAnimation.frames.map(({ offset }) => offset), [0, .075, .48, .74, 1]);
  assert.equal(wingMidAnimation.frames[0].transform, 'translate(0px, 0px) rotate(0deg)');
  assert.equal(wingMidAnimation.frames[1].transform, 'translate(0px, 0px) rotate(0deg)');
  assert.equal(wingMidAnimation.frames[2].transform, 'translate(1.6px, 0.48px) rotate(1.2deg)');
  assert.equal(wingMidAnimation.options.delay, 0);

  fixture.documentRef.visibilityState = 'hidden';
  const beforeHidden = [...svgElements[0].animations];
  fixture.listeners.get('visibilitychange')();
  assert.ok(beforeHidden.every((animation) => animation.cancelled));
  assert.equal(fixture.svg.children.get('#qp-card-9-wing-mid').style.transform, '');
  fixture.documentRef.visibilityState = 'visible';
  fixture.listeners.get('visibilitychange')();
  assert.ok(fixture.svg.children.get('#qp-card-9-wing-mid').animations.length > 1);

  const beforeOffscreen = [...svgElements[0].animations];
  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: false, intersectionRatio: 0 }]);
  assert.ok(beforeOffscreen.every((animation) => animation.cancelled));
  assert.equal(fixture.svg.children.get('#qp-card-9-wing-mid').style.transform, '');
  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: true, intersectionRatio: 1 }]);
  assert.ok(svgElements[0].animations.every((animation) => !animation.paused));

  fixture.media.change(true);
  assert.ok(svgElements[0].animations.every((animation) => animation.cancelled));
  assert.equal(svgElements[0].style.transform, '');
  assert.equal(fixture.button.disabled, true);
  fixture.media.change(false);
  assert.ok(svgElements[0].animations.length > 0);

  controller.destroy();
  assert.ok(fixture.shell.animations.every((animation) => animation.cancelled));
  assert.equal(svgElements[0].style.transform, '');
  assert.equal(fixture.disconnected(), true);
  assert.equal(fixture.listeners.has('visibilitychange'), false);
});

test('controller honors user pause and inactive mount without discarding live controller state', () => {
  const fixture = createFixture();
  let persistedPause = false;
  const controller = createDuckMotionController(fixture.container, {
    active: false,
    documentRef: fixture.documentRef,
    matchMedia: () => fixture.media,
    IntersectionObserverRef: fixture.Observer,
    onPauseChange: (paused) => { persistedPause = paused; },
  });
  assert.equal(fixture.shell.animations.length, 0);
  controller.setActive(true);
  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: true, intersectionRatio: 1 }]);
  assert.ok(fixture.shell.animations.length > 0);
  fixture.button.listeners.get('click')();
  assert.equal(persistedPause, true);
  assert.ok(fixture.shell.animations.every((animation) => animation.paused));
  controller.setActive(false);
  assert.ok(fixture.shell.animations.every((animation) => animation.cancelled));
  assert.equal(fixture.svg.children.get('#qp-card-9-wing-mid').style.transform, '');
  controller.setActive(true);
  assert.equal(fixture.shell.animations.length, 1);
  controller.destroy();
});

test('controller keeps a static fallback when intersection visibility cannot be observed', () => {
  const fixture = createFixture();
  const controller = createDuckMotionController(fixture.container, {
    documentRef: fixture.documentRef,
    matchMedia: () => fixture.media,
    IntersectionObserverRef: null,
  });
  assert.equal(fixture.shell.animations.length, 0);
  assert.equal(fixture.button.disabled, true);
  assert.equal(fixture.button.textContent, 'Motion off (visibility unavailable)');
  controller.destroy();
});

test('syncNewCards registers only new revealed cards and preserves existing running animation phase', () => {
  const fixture = createFixture();
  const controller = createDuckMotionController(fixture.container, {
    documentRef: fixture.documentRef,
    matchMedia: () => fixture.media,
    IntersectionObserverRef: fixture.Observer,
  });
  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: true, intersectionRatio: 1 }]);
  const firstAnimations = [...fixture.shell.animations];
  firstAnimations.forEach((animation, index) => { animation.currentTime = 140 + index; });
  const playCounts = firstAnimations.map((animation) => animation.playCalls);

  const second = createMotionShell('qp-card-10', 'graceful-bob');
  fixture.elements.push(second.shell);
  assert.equal(controller.syncNewCards(), 1);
  assert.equal(controller.syncNewCards(), 0);
  assert.equal(fixture.observedTargets.has(second.shell), true);
  assert.deepEqual(fixture.shell.animations, firstAnimations);
  assert.deepEqual(firstAnimations.map((animation) => animation.currentTime), firstAnimations.map((_, index) => 140 + index));
  assert.deepEqual(firstAnimations.map((animation) => animation.playCalls), playCounts);
  assert.equal(second.shell.animations.length, 0);

  fixture.observerCallback()([{ target: second.shell, isIntersecting: true, intersectionRatio: 1 }]);
  assert.ok(second.shell.animations.length > 0);
  assert.deepEqual(fixture.shell.animations, firstAnimations);
  controller.destroy();
  assert.ok(second.shell.animations.every((animation) => animation.cancelled));
  assert.equal(fixture.observedTargets.size, 0);
});

test('syncNewCards enables pause control for the first reveal and ignores updates after destroy', () => {
  const fixture = createFixture();
  fixture.elements.length = 0;
  const controller = createDuckMotionController(fixture.container, {
    documentRef: fixture.documentRef,
    matchMedia: () => fixture.media,
    IntersectionObserverRef: fixture.Observer,
  });
  assert.equal(fixture.button.disabled, true);

  const first = createMotionShell('qp-card-10', 'graceful-bob');
  fixture.elements.push(first.shell);
  assert.equal(controller.syncNewCards(), 1);
  assert.equal(fixture.button.disabled, false);
  assert.equal(first.shell.animations.length, 0);
  fixture.observerCallback()([{ target: first.shell, isIntersecting: true, intersectionRatio: 1 }]);
  assert.ok(first.shell.animations.length > 0);

  controller.destroy();
  assert.equal(controller.syncNewCards(), 0);
  assert.ok(first.shell.animations.every((animation) => animation.cancelled));
  assert.equal(fixture.observedTargets.size, 0);
});

test('controller starts static when system reduced motion is already enabled', () => {
  const fixture = createFixture();
  fixture.media.matches = true;
  const controller = createDuckMotionController(fixture.container, {
    documentRef: fixture.documentRef,
    matchMedia: () => fixture.media,
    IntersectionObserverRef: fixture.Observer,
  });
  assert.equal(fixture.shell.animations.length, 0);
  assert.equal(fixture.button.disabled, true);
  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(fixture.button.textContent, 'Motion off (reduced motion)');
  fixture.media.change(false);
  assert.ok(fixture.shell.animations.length > 0);
  fixture.media.change(true);
  assert.ok(fixture.shell.animations.every((animation) => animation.cancelled));
  controller.destroy();
});
