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
  constructor() { this.paused = false; this.cancelled = false; }
  pause() { this.paused = true; }
  play() { this.paused = false; }
  cancel() { this.cancelled = true; }
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
  animate() { const animation = new FakeAnimation(); this.animations.push(animation); return animation; }
  addEventListener(name, handler) { this.listeners.set(name, handler); }
  removeEventListener(name) { this.listeners.delete(name); }
  setAttribute(name, value) { this.attributes[name] = value; }
}

function createFixture() {
  const elements = [];
  const shell = new FakeElement();
  shell.dataset = { duckPrefix: 'qp-card-9', duckMotion: 'paddle' };
  const svg = new FakeElement();
  for (const id of ['head-group', 'wing-group', 'body-backing-rim', 'tail-backing', 'head-backing-rim', 'wing-mid', 'wing-under-seam', 'wing-top', 'wing-mid-seam']) {
    svg.children.set(`#qp-card-9-${id}`, new FakeElement(`qp-card-9-${id}`));
  }
  shell.children.set('svg', svg);
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
    observe(target) { this.target = target; }
    disconnect() { disconnected = true; }
  }
  return { container, shell, svg, button, status, documentRef, media, listeners, Observer, observerCallback: () => observerCallback, disconnected: () => disconnected };
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
  assert.equal(fixture.button.disabled, false);

  fixture.documentRef.visibilityState = 'hidden';
  fixture.listeners.get('visibilitychange')();
  assert.ok(svgElements[0].animations.every((animation) => animation.paused));
  fixture.documentRef.visibilityState = 'visible';
  fixture.listeners.get('visibilitychange')();
  assert.ok(svgElements[0].animations.every((animation) => !animation.paused));

  fixture.observerCallback()([{ target: fixture.shell, isIntersecting: false, intersectionRatio: 0 }]);
  assert.ok(svgElements[0].animations.every((animation) => animation.paused));
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
  controller.setActive(true);
  assert.ok(fixture.shell.animations.every((animation) => animation.paused));
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
