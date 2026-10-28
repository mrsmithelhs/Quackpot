import test from 'node:test';
import assert from 'node:assert/strict';
import { createAmbientGlowController } from './ambient-glow-controller.mjs';

class FakeAnimation {
  constructor(frames, options) { this.frames = frames; this.options = options; this.cancelled = false; }
  cancel() { this.cancelled = true; }
}

function fixture() {
  const glow = {
    style: {},
    animations: [],
    animate(frames, options) {
      const animation = new FakeAnimation(frames, options);
      this.animations.push(animation);
      return animation;
    },
  };
  const container = { querySelector: (selector) => selector === '.apartment-phone-glow' ? glow : null };
  const documentListeners = new Map();
  const documentRef = {
    visibilityState: 'visible',
    addEventListener: (name, handler) => documentListeners.set(name, handler),
    removeEventListener: (name) => documentListeners.delete(name),
  };
  const mediaListeners = new Set();
  const media = {
    matches: false,
    addEventListener: (_name, handler) => mediaListeners.add(handler),
    removeEventListener: (_name, handler) => mediaListeners.delete(handler),
    change(value) { this.matches = value; for (const handler of mediaListeners) handler(); },
  };
  let observerCallback;
  let observerDisconnected = false;
  class Observer {
    constructor(callback) { observerCallback = callback; }
    observe(target) { this.target = target; }
    disconnect() { observerDisconnected = true; }
  }
  return {
    glow, container, documentRef, documentListeners, media, mediaListeners, Observer,
    observerCallback: () => observerCallback,
    observerDisconnected: () => observerDisconnected,
  };
}

test('scene-anchored phone light cycles on opacity only and stops for manual, page, reduced, offscreen, and inactive states', () => {
  const f = fixture();
  const controller = createAmbientGlowController(f.container, {
    documentRef: f.documentRef,
    matchMedia: () => f.media,
    IntersectionObserverRef: f.Observer,
  });
  assert.equal(f.glow.animations.length, 0);
  f.observerCallback()([{ target: f.glow, isIntersecting: true, intersectionRatio: 1 }]);
  const animation = f.glow.animations.at(-1);
  assert.equal(animation.options.duration, 3000);
  assert.equal(animation.options.iterations, Infinity);
  assert.deepEqual(animation.frames, [
    { opacity: .28 },
    { opacity: .62, offset: .5 },
    { opacity: .28 },
  ]);

  controller.setEnabled(false);
  assert.equal(animation.cancelled, true);
  assert.equal(f.glow.style.opacity, '');
  f.media.change(true);
  controller.setEnabled(true);
  assert.equal(f.glow.animations.length, 1, 'manual enable must not override reduced motion');
  f.observerCallback()([{ target: f.glow, isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(f.glow.animations.length, 1, 'visibility updates must not override reduced motion');
  f.media.change(false);
  assert.equal(f.glow.animations.length, 2);
  controller.setEnabled(true);
  const manuallyResumed = f.glow.animations.at(-1);
  f.documentRef.visibilityState = 'hidden';
  f.documentListeners.get('visibilitychange')();
  assert.equal(manuallyResumed.cancelled, true);
  f.documentRef.visibilityState = 'visible';
  f.documentListeners.get('visibilitychange')();
  const pageResumed = f.glow.animations.at(-1);
  f.media.change(true);
  assert.equal(pageResumed.cancelled, true);
  f.media.change(false);
  const reducedResumed = f.glow.animations.at(-1);
  f.observerCallback()([{ target: f.glow, isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(reducedResumed.cancelled, true);
  f.observerCallback()([{ target: f.glow, isIntersecting: true, intersectionRatio: 1 }]);
  const visibleAgain = f.glow.animations.at(-1);
  controller.setActive(false);
  assert.equal(visibleAgain.cancelled, true);
  controller.setActive(true);
  const activeAgain = f.glow.animations.at(-1);
  controller.destroy();
  assert.equal(activeAgain.cancelled, true);
  assert.equal(f.documentListeners.has('visibilitychange'), false);
  assert.equal(f.observerDisconnected(), true);
  assert.equal(f.mediaListeners.size, 0);
  const animationCountAfterDestroy = f.glow.animations.length;
  f.observerCallback()([{ target: f.glow, isIntersecting: true, intersectionRatio: 1 }]);
  f.media.change(false);
  assert.equal(f.glow.animations.length, animationCountAfterDestroy, 'late callbacks must not restart a destroyed controller');
});

test('phone glow remains at its static baseline when animation visibility cannot be tracked or reduced motion starts enabled', () => {
  const f = fixture();
  const controller = createAmbientGlowController(f.container, {
    documentRef: f.documentRef,
    matchMedia: () => f.media,
    IntersectionObserverRef: null,
  });
  assert.equal(f.glow.animations.length, 0);
  controller.destroy();

  const reduced = fixture();
  reduced.media.matches = true;
  const reducedController = createAmbientGlowController(reduced.container, {
    documentRef: reduced.documentRef,
    matchMedia: () => reduced.media,
    IntersectionObserverRef: reduced.Observer,
  });
  reduced.observerCallback()([{ target: reduced.glow, isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(reduced.glow.animations.length, 0);
  reducedController.destroy();
});
