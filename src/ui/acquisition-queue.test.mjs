// src/ui/acquisition-queue.test.mjs
// Tests for first-owned acquisition queue controller lifecycle and idempotency.

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
