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
    setAttribute() {},
    classList: {
      classes: new Set(),
      add(...c) { c.forEach((x) => this.classes.add(x)); },
      remove(...c) { c.forEach((x) => this.classes.delete(x)); },
    },
    querySelector: () => ({ textContent: '', setAttribute() {} }),
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

test('acquisition-queue [Plan 21 Repair 02]: real-engine active discovery begins as silhouette in Phase 1 and colorizes in Phase 2', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

  const engine = new GameEngine('plan21-review');
  engine.start();
  engine.commitPromotionalTenPull();

  // Index 0 is duck-3 (Bath Cadet)
  engine.revealDrawAtIndex(0);

  let capturedOverlayHtml = '';
  const slotElements = new Map();
  const getOrCreateSlotMock = (id) => {
    if (!slotElements.has(id)) {
      slotElements.set(id, {
        id,
        attributes: {},
        setAttribute(k, v) { this.attributes[k] = v; },
        classList: {
          classes: new Set(),
          add(...c) { c.forEach((x) => this.classes.add(x)); },
          remove(...c) { c.forEach((x) => this.classes.delete(x)); },
          contains(c) { return this.classes.has(c); },
        },
        querySelector: () => ({ textContent: '', setAttribute() {} }),
        scrollIntoView() { this.scrolled = true; },
      });
    }
    return slotElements.get(id);
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
      set innerHTML(html) { capturedOverlayHtml = html; },
      get innerHTML() { return capturedOverlayHtml; },
      querySelector: (sel) => {
        if (sel === '#btn-skip-acq') return { addEventListener() {}, focus() {} };
        const match = sel.match(/data-acq-slot="([^"]+)"/);
        if (match) return getOrCreateSlotMock(match[1]);
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

  const queue = createAcquisitionQueueController(container, engine, {});
  queue.enqueueReveals(engine.state.pendingReveals, { fastPull: false });
  assert.equal(queue.isActive(), true);

  // 1. Verify Phase 1 markup: duck-3 target slot MUST be rendered as an unowned silhouette!
  assert.ok(capturedOverlayHtml.includes('data-acq-slot="duck-3"'));
  // Must have slot-unowned and slot-highlight-focus, NOT slot-owned
  assert.match(capturedOverlayHtml, /class="duck-dex-slot slot-unowned slot-highlight-focus"[^>]*data-acq-slot="duck-3"/);
  assert.ok(capturedOverlayHtml.includes('Slot duck-3: Unowned silhouette'));
  assert.ok(capturedOverlayHtml.includes('??? (Unowned)'));
  assert.ok(capturedOverlayHtml.includes('Missing from roster'));

  // 2. Advance to Phase 2 (at 2.0s)
  t.mock.timers.tick(2000);
  const targetMock = getOrCreateSlotMock('duck-3');
  assert.equal(targetMock.classList.contains('slot-unowned'), false);
  assert.equal(targetMock.classList.contains('slot-owned'), true);
  assert.equal(targetMock.classList.contains('slot-discovering'), true);
  assert.equal(targetMock.classList.contains('slot-discovered'), true);

  // 3. Complete Phase 2 (at 4.5s total)
  t.mock.timers.tick(2500);
  assert.ok(engine.state.seenDexEntries.includes('duck-3'));

  queue.destroy();
  t.mock.timers.reset();
});

test('acquisition-queue [Plan 21 Repair 02]: duplicate-first reveal triggers discovery, subsequent original reveal does not re-trigger', () => {
  const engine = new GameEngine('plan21-review');
  engine.start();
  engine.commitPromotionalTenPull();

  // Index 0: duck-3 (duplicate: false)
  // Index 1: duck-3 (duplicate: true)
  assert.equal(engine.state.pendingReveals[1].identity, 'duck-3');
  assert.equal(engine.state.pendingReveals[1].duplicate, true);

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
        return { scrollIntoView() {}, classList: { add() {}, remove() {} }, querySelector: () => ({ textContent: '', setAttribute() {} }) };
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

  let completed = false;
  const queue = createAcquisitionQueueController(container, engine, {
    onComplete: () => { completed = true; },
  });

  // Reveal index 1 FIRST (the duplicate card)
  engine.revealDrawAtIndex(1);
  queue.enqueueReveals(engine.state.pendingReveals, { fastPull: false });

  // duck-3 was newly acquired in this batch, so revealing duplicate first starts presentation!
  assert.equal(queue.isActive(), true);

  // Skip / complete presentation
  queue.skip();
  assert.ok(engine.state.seenDexEntries.includes('duck-3'));
  assert.equal(queue.isActive(), false);

  // Later reveal index 0 (the original card)
  engine.revealDrawAtIndex(0);
  queue.enqueueReveals(engine.state.pendingReveals, { fastPull: false });

  // duck-3 is already in seenDexEntries, so it is NOT queued again!
  assert.equal(queue.isActive(), false);

  queue.destroy();
});

test('acquisition-queue [Plan 21 Repair 02]: inactive modal state suspends timers and prevents background completion', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

  const engine = new GameEngine('seed-inactive-modal');
  engine.start();

  let persisted = false;

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
        return { scrollIntoView() {}, setAttribute() {}, classList: { add() {}, remove() {} }, querySelector: () => ({ textContent: '', setAttribute() {} }) };
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

  // 1. Queue created with active: false (e.g. Settings or retention modal open)
  const queue = createAcquisitionQueueController(container, engine, {
    active: false,
    onPersist: () => { persisted = true; },
  });

  const draws = [
    { commitSeq: 1, identity: 'duck-4', rarity: 'rare', duplicate: false, revealed: true },
  ];

  queue.enqueueReveals(draws, { fastPull: false });
  // Should NOT be active while inactive modal is open
  assert.equal(queue.isActive(), false);
  assert.equal(container.children.length, 0);

  // Advance time past 10 seconds: NO timers run, NO seen entry marked, NO autosave
  t.mock.timers.tick(10000);
  assert.equal(engine.state.seenDexEntries.includes('duck-4'), false);
  assert.equal(persisted, false);

  // 2. Player closes modal: setActive(true)
  queue.setActive(true);
  assert.equal(queue.isActive(), true);
  assert.equal(container.children.length, 1); // overlay mounted

  // Advance 1000ms: in Phase 1
  t.mock.timers.tick(1000);
  assert.equal(engine.state.seenDexEntries.includes('duck-4'), false);

  // 3. Player opens Settings mid-presentation (Phase 1): setActive(false)
  queue.setActive(false);
  assert.equal(queue.isActive(), false);

  // Advance time past 10 seconds while suspended: no completion occurs
  t.mock.timers.tick(10000);
  assert.equal(engine.state.seenDexEntries.includes('duck-4'), false);
  assert.equal(persisted, false);

  // 4. Player closes Settings: setActive(true)
  queue.setActive(true);
  assert.equal(queue.isActive(), true);

  // Remaining 1000ms of Phase 1 + 2500ms of Phase 2 finishes
  t.mock.timers.tick(1000); // completes Phase 1
  t.mock.timers.tick(2500); // completes Phase 2

  // Now properly completed!
  assert.ok(engine.state.seenDexEntries.includes('duck-4'));
  assert.equal(persisted, true);

  queue.destroy();
  t.mock.timers.reset();
});

test('acquisition-queue [Plan 21 Repair 03]: inactive queued work followed by reduced-motion change does not prematurely mutate or emit cues; reactivation resolves statically once', () => {
  const engine = new GameEngine('plan21-review');
  engine.start();
  engine.commitPromotionalTenPull();

  // Index 0: duck-3
  engine.revealDrawAtIndex(0);

  let motionListeners = [];
  let isReducedMotion = false;
  const originalWindow = globalThis.window;
  globalThis.window = {
    matchMedia: (q) => ({
      matches: isReducedMotion,
      addEventListener: (type, h) => { if (type === 'change') motionListeners.push(h); },
      removeEventListener: (type, h) => { motionListeners = motionListeners.filter((x) => x !== h); },
    }),
  };

  const container = {
    ownerDocument: {
      createElement: () => ({
        className: '',
        attributes: {},
        children: [],
        setAttribute() {},
        addEventListener() {},
        remove() {},
      }),
    },
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); },
  };

  let persistCount = 0;
  let completeCalls = [];

  try {
    // 1. Controller created with active: false (e.g. view hidden or modal open)
    const queue = createAcquisitionQueueController(container, engine, {
      active: false,
      onPersist: () => { persistCount++; },
      onComplete: (data) => { completeCalls.push(data); },
    });

    queue.enqueueReveals(engine.state.pendingReveals, { fastPull: false });

    // While inactive: no seen mutation, no cues, no persistence, no completion
    assert.equal(engine.state.seenDexEntries.includes('duck-3'), false);
    assert.equal(engine.log.entries.filter((e) => e.type === 'cue_shown').length, 0);
    assert.equal(persistCount, 0);
    assert.equal(completeCalls.length, 0);
    assert.equal(container.children.length, 0);

    // 2. Reduced motion toggled to true while STILL inactive
    isReducedMotion = true;
    for (const listener of motionListeners) {
      listener({ matches: true });
    }

    // Must still NOT prematurely mutate state, mark seen, emit cues, or call callbacks
    assert.equal(engine.state.seenDexEntries.includes('duck-3'), false);
    assert.equal(engine.log.entries.filter((e) => e.type === 'cue_shown').length, 0);
    assert.equal(persistCount, 0);
    assert.equal(completeCalls.length, 0);
    assert.equal(container.children.length, 0);

    // 3. Controller reactivated (e.g. modal closed / view activated)
    queue.setActive(true);

    // Resolves statically ONCE:
    assert.ok(engine.state.seenDexEntries.includes('duck-3'));
    const cues = engine.log.entries.filter((e) => e.type === 'cue_shown' && e.payload?.cueId === 'duck_dex_acquisition_static');
    assert.equal(cues.length, 1);
    assert.equal(persistCount, 1);
    assert.equal(completeCalls.length, 1);
    assert.equal(completeCalls[0].fastPull, true);
    assert.equal(completeCalls[0].count, 1);
    assert.equal(queue.isActive(), false); // never animates
    assert.equal(container.children.length, 0); // no DOM overlay left

    queue.destroy();
  } finally {
    globalThis.window = originalWindow;
  }
});

test('acquisition-queue [Plan 21 Repair 03]: terminal guard prevents static resolution, mutations, cues, and callbacks', () => {
  const engine = new GameEngine('seed-terminal-guard');
  engine.start();
  engine.state.phase = 'terminal';
  engine.state.step = 'receipt';

  const container = new MockContainer();
  let persistCount = 0;
  let completeCalls = [];

  const queue = createAcquisitionQueueController(container, engine, {
    active: true,
    onPersist: () => { persistCount++; },
    onComplete: (data) => { completeCalls.push(data); },
  });

  const draws = [
    { commitSeq: 1, identity: 'duck-1', rarity: 'common', duplicate: false, revealed: true },
  ];

  queue.enqueueReveals(draws, { fastPull: true });

  assert.equal(engine.state.seenDexEntries.includes('duck-1'), false);
  assert.equal(engine.log.entries.filter((e) => e.type === 'cue_shown').length, 0);
  assert.equal(persistCount, 0);
  assert.equal(completeCalls.length, 0);
  assert.equal(queue.isActive(), false);

  queue.setActive(true);
  assert.equal(persistCount, 0);
  assert.equal(completeCalls.length, 0);

  queue.destroy();
});

test('acquisition-queue [Plan 21 Repair 03]: hidden document mount with reduced motion does not resolve until visibility returns to visible', () => {
  const engine = new GameEngine('seed-hidden-doc');
  engine.start();

  let visibility = 'hidden';
  let visibilityListeners = [];
  const originalDoc = globalThis.document;
  const originalWindow = globalThis.window;

  globalThis.document = {
    get visibilityState() { return visibility; },
    addEventListener: (type, h) => { if (type === 'visibilitychange') visibilityListeners.push(h); },
    removeEventListener: (type, h) => { visibilityListeners = visibilityListeners.filter((x) => x !== h); },
  };

  globalThis.window = {
    matchMedia: () => ({
      matches: true, // reduced motion active
      addEventListener() {},
      removeEventListener() {},
    }),
  };

  const container = new MockContainer();
  let persistCount = 0;
  let completeCalls = [];

  try {
    const queue = createAcquisitionQueueController(container, engine, {
      active: true,
      onPersist: () => { persistCount++; },
      onComplete: (data) => { completeCalls.push(data); },
    });

    const draws = [
      { commitSeq: 1, identity: 'duck-2', rarity: 'rare', duplicate: false, revealed: true },
    ];

    queue.enqueueReveals(draws, { fastPull: false });

    // While document is hidden: zero seen mutation, zero cues, zero persistence
    assert.equal(engine.state.seenDexEntries.includes('duck-2'), false);
    assert.equal(engine.log.entries.filter((e) => e.type === 'cue_shown').length, 0);
    assert.equal(persistCount, 0);
    assert.equal(completeCalls.length, 0);

    // Document becomes visible
    visibility = 'visible';
    for (const h of visibilityListeners) h();

    // Resolves statically once
    assert.ok(engine.state.seenDexEntries.includes('duck-2'));
    assert.equal(engine.log.entries.filter((e) => e.type === 'cue_shown' && e.payload?.cueId === 'duck_dex_acquisition_static').length, 1);
    assert.equal(persistCount, 1);
    assert.equal(completeCalls.length, 1);

    queue.destroy();
  } finally {
    globalThis.document = originalDoc;
    globalThis.window = originalWindow;
  }
});
