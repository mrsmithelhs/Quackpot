// src/ui/duck-dex-view.test.mjs
// Tests for voluntary Duck-Dex shelf rendering, inspection, and navigation.

import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, BANNER_1_ROSTER } from '../core/game-engine.mjs';
import { renderDuckDexView } from './duck-dex-view.mjs';

class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.innerHTML = '';
    this.className = '';
    this.dataset = {};
    this.listeners = new Map();
    this.children = [];
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const h of list) h(event);
  }

  querySelector(selector) {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) return this;
      return this._findChild((el) => el.id === id);
    }
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      if (this.className.includes(cls)) return this;
      return this._findChild((el) => el.className.includes(cls));
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      this._collectChildren((el) => el.className.includes(cls), results);
    }
    return results;
  }

  _findChild(predicate) {
    for (const c of this.children) {
      if (predicate(c)) return c;
      const found = c._findChild ? c._findChild(predicate) : null;
      if (found) return found;
    }
    return null;
  }

  _collectChildren(predicate, results) {
    for (const c of this.children) {
      if (predicate(c)) results.push(c);
      if (c._collectChildren) c._collectChildren(predicate, results);
    }
  }

  focus() {
    this.focused = true;
  }
}

test('renderDuckDexView: pure markup generation and state reflection', () => {
  const engine = new GameEngine('seed-dex-view-test');
  engine.start();
  engine.state.owned = ['duck-0', 'duck-1'];

  // Test container mock with innerHTML capture
  const container = {
    innerHTML: '',
    querySelectorAll() { return []; },
    querySelector() { return null; },
  };

  let returned = false;
  const viewHandle = renderDuckDexView(container, engine, {
    onReturn: () => { returned = true; },
  });

  assert.ok(container.innerHTML.includes('Duck-Dex Collection'));
  assert.ok(container.innerHTML.includes('Pond of Destiny'));
  assert.ok(container.innerHTML.includes('2 / 6 Ducks'));
  assert.ok(container.innerHTML.includes('Set Bonus:</strong> None active'));
  assert.ok(container.innerHTML.includes('Puddle Quacker'));
  assert.ok(container.innerHTML.includes('Rubber Mallard'));
  assert.ok(container.innerHTML.includes('??? (Unowned)'));
  assert.ok(container.innerHTML.includes('slot-owned'));
  assert.ok(container.innerHTML.includes('slot-unowned'));

  viewHandle.destroy();
});

test('renderDuckDexView: inspector factual data contains no fabricated scores', () => {
  const engine = new GameEngine('seed-dex-inspector-test');
  engine.start();
  engine.state.owned = ['duck-5']; // Legendary Biblically Accurate Duck

  const dexState = engine.getDexCollectionState();
  const d5 = dexState.roster.find((d) => d.id === 'duck-5');
  assert.equal(d5.name, 'Biblically Accurate Duck');
  assert.equal(d5.speed, 20.0);
  assert.equal(d5.tier, 'legendary');

  // Verify cosmetics match canonical Mode C definitions
  assert.equal(d5.cosmetics.palette, 'bubblegum-pink');
  assert.equal(d5.cosmetics.hat, 'tiny-top-hat');
  assert.equal(d5.cosmetics.accessory, 'monocle');
});

test('renderDuckDexView: inspector copy clearly distinguishes base tier share from identity odds and contains no dev jargon', () => {
  const engine = new GameEngine('seed-dex-odds-copy');
  engine.start();
  engine.state.owned = ['duck-0', 'duck-3', 'duck-5'];

  // Test opening inspector for duck-0 (Common)
  let capturedHtml = '';
  const fakeSlot = {
    dataset: { duckId: 'duck-0' },
    addEventListener(name, handler) {
      if (name === 'click') this.clickHandler = handler;
    },
    focus() { this.focused = true; },
  };

  const fakeCloseBtn = {
    addEventListener(name, handler) {
      if (name === 'click') this.closeHandler = handler;
    },
    focus() { this.focused = true; },
  };

  const fakeBackdrop = {
    addEventListener(name, handler) {
      if (name === 'click') this.backdropHandler = handler;
      if (name === 'keydown') this.keydownHandler = handler;
    },
    querySelectorAll() { return [fakeCloseBtn]; },
  };

  const fakeSections = [
    { inert: false },
    { inert: false },
  ];

  const container = {
    set innerHTML(val) { capturedHtml = val; },
    get innerHTML() { return capturedHtml; },
    querySelectorAll(selector) {
      if (selector === '[data-dex-section]') return fakeSections;
      if (selector === '.duck-dex-slot') return [fakeSlot];
      return [];
    },
    querySelector(selector) {
      if (selector === '#btn-close-inspector') return fakeCloseBtn;
      if (selector === '#dex-inspector-backdrop') return fakeBackdrop;
      if (selector === '[data-duck-id="duck-0"]') return fakeSlot;
      return null;
    },
  };

  const viewHandle = renderDuckDexView(container, engine, {});

  // Simulate slot click to open inspector
  fakeSlot.clickHandler();

  // Verify inspector modal is rendered
  assert.ok(capturedHtml.includes('duck-dex-inspector-backdrop'));
  assert.ok(capturedHtml.includes('Puddle Quacker'));

  // Disambiguated odds copy:
  assert.ok(capturedHtml.includes('Base Tier Rate:'));
  assert.ok(capturedHtml.includes('80% (Base tier pool share across 3 Common ducks)'));
  assert.ok(capturedHtml.includes('Base Identity Odds:'));
  assert.ok(capturedHtml.includes('~26.7% (1 of 3 Common identities)'));

  // Plain speed rating without m/s:
  assert.ok(capturedHtml.includes('Speed Rating:'));
  assert.ok(capturedHtml.includes('10.0'));
  assert.equal(capturedHtml.includes('m/s'), false);

  // In-world race availability without dev jargon:
  assert.ok(capturedHtml.includes('Rested and ready to race'));
  assert.equal(capturedHtml.includes('Plan 22'), false);
  assert.equal(capturedHtml.includes('Plan22'), false);
  assert.equal(capturedHtml.includes('founding design'), false);
  assert.equal(capturedHtml.includes('investigation only'), false);

  // Background sections made inert while modal is open
  assert.equal(fakeSections.every((s) => s.inert === true), true);

  // Simulate closing inspector
  fakeCloseBtn.closeHandler();

  // Background sections restored to active
  assert.equal(fakeSections.every((s) => s.inert === false), true);
  // Focus returned to originating slot
  assert.equal(fakeSlot.focused, true);

  viewHandle.destroy();
});
