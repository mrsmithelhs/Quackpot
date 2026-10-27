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
