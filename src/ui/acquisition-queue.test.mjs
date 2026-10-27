// src/ui/acquisition-queue.test.mjs
// Tests for first-owned acquisition queue controller lifecycle, interruption, and skip semantics.

import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../core/game-engine.mjs';
import { createAcquisitionQueueController } from './acquisition-queue.mjs';

class MockContainer {
  constructor() {
    this.children = [];
  }
  appendChild(child) {
    this.children.push(child);
  }
  removeChild(child) {
    this.children = this.children.filter((c) => c !== child);
  }
}

test('acquisition-queue: fast-pull immediately resolves newly acquired ducks with static cues', () => {
  const engine = new GameEngine('seed-acq-fast-pull');
  engine.start();

  const draws = [
    { commitSeq: 1, identity: 'duck-0', rarity: 'common', duplicate: false, revealed: true },
    { commitSeq: 2, identity: 'duck-1', rarity: 'common', duplicate: false, revealed: true },
    { commitSeq: 3, identity: 'duck-0', rarity: 'common', duplicate: true, downGained: 1, revealed: true }, // duplicate
  ];

  let completedData = null;
  const container = new MockContainer();
  const queueController = createAcquisitionQueueController(container, engine, {
    onComplete: (data) => { completedData = data; },
  });

  queueController.enqueueReveals(draws, { fastPull: true });

  assert.ok(completedData);
  assert.equal(completedData.fastPull, true);
  assert.equal(completedData.count, 2); // Only duck-0 and duck-1, duck-0 duplicate skipped

  assert.ok(engine.state.seenDexEntries.includes('duck-0'));
  assert.ok(engine.state.seenDexEntries.includes('duck-1'));

  // Static acquisition cues emitted
  const staticCues = engine.log.entries.filter((e) => e.type === 'cue_shown' && e.payload?.cueId === 'duck_dex_acquisition_static');
  assert.equal(staticCues.length, 2);

  queueController.destroy();
});

test('acquisition-queue: skips already seen entries and duplicate draws', () => {
  const engine = new GameEngine('seed-acq-seen-check');
  engine.start();
  engine.state.seenDexEntries = ['duck-0']; // already seen

  const draws = [
    { commitSeq: 1, identity: 'duck-0', rarity: 'common', duplicate: false, revealed: true }, // seen
    { commitSeq: 2, identity: 'duck-1', rarity: 'common', duplicate: false, revealed: true }, // new!
    { commitSeq: 3, identity: 'duck-2', rarity: 'rare', duplicate: false, revealed: false }, // unrevealed
  ];

  let completedData = null;
  const container = new MockContainer();
  const queueController = createAcquisitionQueueController(container, engine, {
    onComplete: (data) => { completedData = data; },
  });

  queueController.enqueueReveals(draws, { fastPull: true });

  assert.equal(completedData.count, 1); // Only duck-1
  assert.ok(engine.state.seenDexEntries.includes('duck-1'));
  assert.equal(engine.state.seenDexEntries.includes('duck-2'), false); // duck-2 unrevealed, stay hidden

  queueController.destroy();
});

test('acquisition-queue: explicit skip logs skipped action, emits static cue, and restores focus', () => {
  const engine = new GameEngine('seed-acq-explicit-skip');
  engine.start();

  let persisted = false;
  let focusReturned = false;
  let completedInfo = null;

  const skipBtn = {
    addEventListener(type, h) { this.clickHandler = h; },
    focus() { this.focused = true; },
  };

  const slotElement = {
    scrollIntoView() { this.scrolled = true; },
    classList: { add() {}, remove() {} },
    querySelector: () => ({ textContent: '' }),
  };

  const mockDoc = {
    createElement: (tag) => {
      const node = {
        tagName: tag,
        className: '',
        attributes: {},
        children: [],
        listeners: new Map(),
        setAttribute(k, v) { this.attributes[k] = v; },
        getAttribute(k) { return this.attributes[k] ?? null; },
        addEventListener(type, h) {
          if (!this.listeners.has(type)) this.listeners.set(type, []);
          this.listeners.get(type).push(h);
        },
        dispatchEvent(event) {
          for (const h of (this.listeners.get(event.type) || [])) h(event);
        },
        remove() { this.removed = true; },
        focus() { this.focused = true; },
        scrollIntoView() { this.scrolled = true; },
        querySelector: (sel) => {
          if (sel === '#btn-skip-acq') return skipBtn;
          if (sel.includes('data-acq-slot')) return slotElement;
          return null;
        },
        querySelectorAll: () => [],
      };
      return node;
    },
    activeElement: null,
  };

  const container = {
    ownerDocument: mockDoc,
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); },
  };

  const queueController = createAcquisitionQueueController(container, engine, {
    onPersist: () => { persisted = true; },
    onFocusReturn: () => { focusReturned = true; },
    onComplete: (data) => { completedInfo = data; },
  });

  const draws = [
    { commitSeq: 1, identity: 'duck-0', rarity: 'common', duplicate: false, revealed: true },
    { commitSeq: 2, identity: 'duck-1', rarity: 'rare', duplicate: false, revealed: true },
  ];

  queueController.enqueueReveals(draws, { fastPull: false });
  assert.equal(queueController.isActive(), true);

  // Trigger explicit skip
  queueController.skip();

  // 1. Logs skipped action with exact remaining count
  const skipAction = engine.log.entries.find((e) => e.type === 'action' && e.payload?.kind === 'acquisition_presentation_skipped');
  assert.ok(skipAction);
  assert.equal(skipAction.payload.remainingCount, 2);

  // 2. Both ducks marked seen and static cues recorded
  assert.ok(engine.state.seenDexEntries.includes('duck-0'));
  assert.ok(engine.state.seenDexEntries.includes('duck-1'));
  const staticCues = engine.log.entries.filter((e) => e.type === 'cue_shown' && e.payload?.cueId === 'duck_dex_acquisition_static');
  assert.equal(staticCues.length, 2);

  // 3. Persist and focus return callbacks triggered
  assert.equal(persisted, true);
  assert.equal(focusReturned, true);
  assert.equal(completedInfo?.skipped, true);
  assert.equal(queueController.isActive(), false);

  queueController.destroy();
});

test('acquisition-queue: interruption mid-flight preserves unrevealed/unseen state for clean resume', () => {
  const engine = new GameEngine('seed-acq-interruption');
  engine.start();

  const skipBtn = {
    addEventListener() {},
    focus() {},
  };

  const mockDoc = {
    createElement: () => ({
      className: '',
      attributes: {},
      children: [],
      setAttribute() {},
      addEventListener() {},
      remove() {},
      focus() {},
      scrollIntoView() {},
      querySelector: (sel) => {
        if (sel === '#btn-skip-acq') return skipBtn;
        return {
          scrollIntoView() {},
          classList: { add() {}, remove() {} },
          querySelector: () => ({ textContent: '' }),
        };
      },
      querySelectorAll: () => [],
    }),
  };

  const container = {
    ownerDocument: mockDoc,
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); },
  };

  const queue1 = createAcquisitionQueueController(container, engine, {});

  const draws = [
    { commitSeq: 1, identity: 'duck-2', rarity: 'common', duplicate: false, revealed: true },
  ];

  queue1.enqueueReveals(draws, { fastPull: false });
  assert.equal(queue1.isActive(), true);

  // Destroy mid-presentation (e.g. view unmount, reload, navigation to Settings)
  queue1.destroy();
  assert.equal(queue1.isActive(), false);

  // duck-2 was NOT completed: it must NOT be marked seen and no completion cue is logged
  assert.equal(engine.state.seenDexEntries.includes('duck-2'), false);
  const cues = engine.log.entries.filter((e) => e.type === 'cue_shown' && e.payload?.cueId?.startsWith('duck_dex_acquisition'));
  assert.equal(cues.length, 0);

  // Re-creating controller and re-enqueuing resumes cleanly
  let resumedComplete = false;
  const queue2 = createAcquisitionQueueController(container, engine, {
    onComplete: () => { resumedComplete = true; },
  });

  // Fast-pull resume
  queue2.enqueueReveals(draws, { fastPull: true });
  assert.equal(resumedComplete, true);
  assert.ok(engine.state.seenDexEntries.includes('duck-2'));

  queue2.destroy();
});

test('acquisition-queue: nominal interactive lifecycle completes 2.0s focus and 2.5s color dissolve with truthful cue', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

  const engine = new GameEngine('seed-acq-nominal-timer');
  engine.start();

  let persisted = false;
  let completed = false;

  const targetSlot = {
    scrollIntoView() { this.scrolled = true; },
    classList: {
      classes: new Set(),
      add(...c) { c.forEach((x) => this.classes.add(x)); },
      remove(...c) { c.forEach((x) => this.classes.delete(x)); },
    },
    querySelector: () => ({ textContent: '' }),
  };

  const mockDoc = {
    createElement: () => ({
      className: '',
      attributes: {},
      children: [],
      setAttribute() {},
      addEventListener() {},
      remove() {},
      focus() {},
      scrollIntoView() {},
      querySelector: (sel) => {
        if (sel === '#btn-skip-acq') return { addEventListener() {}, focus() {} };
        if (sel.includes('data-acq-slot')) return targetSlot;
        return null;
      },
      querySelectorAll: () => [],
    }),
  };

  const container = {
    ownerDocument: mockDoc,
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); },
  };

  const queue = createAcquisitionQueueController(container, engine, {
    onPersist: () => { persisted = true; },
    onComplete: () => { completed = true; },
  });

  const draws = [
    { commitSeq: 1, identity: 'duck-0', rarity: 'common', duplicate: false, revealed: true },
  ];

  queue.enqueueReveals(draws, { fastPull: false });
  assert.equal(queue.isActive(), true);

  // Before 2.0s: still in focus phase, not colorized, not completed
  t.mock.timers.tick(1900);
  assert.equal(engine.state.seenDexEntries.includes('duck-0'), false);
  assert.equal(persisted, false);

  // At 2.0s: enters phase 2 (colorizing)
  t.mock.timers.tick(100);
  assert.ok(targetSlot.classList.classes.has('slot-discovering'));

  // Mid phase 2: not completed yet
  t.mock.timers.tick(2400);
  assert.equal(engine.state.seenDexEntries.includes('duck-0'), false);

  // At 4.5s total (2.0s + 2.5s): phase 2 finishes
  t.mock.timers.tick(100);

  // Completed!
  assert.ok(engine.state.seenDexEntries.includes('duck-0'));
  assert.equal(persisted, true);
  assert.equal(completed, true);

  // Truthful cue emitted with exact timing evidence
  const cue = engine.log.entries.find((e) => e.type === 'cue_shown' && e.payload?.cueId === 'duck_dex_acquisition');
  assert.ok(cue);
  assert.equal(cue.payload.identity, 'duck-0');
  assert.equal(cue.payload.focusMs, 2000);
  assert.equal(cue.payload.transitionMs, 2500);

  queue.destroy();
  t.mock.timers.reset();
});
