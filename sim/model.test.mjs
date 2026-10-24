import test from 'node:test';
import assert from 'node:assert/strict';
import { Run, simulate, preDrawOdds, DEFAULT_PARAMS, EVENT_DECK } from './model.mjs';
import { makeStrategy } from './strategies.mjs';

const P = DEFAULT_PARAMS;

test('same seed, params, and strategy replay the identical log; different seeds diverge', () => {
  const a = simulate({ maxDays: 20 }, 'r1', makeStrategy('whale_ten'));
  const b = simulate({ maxDays: 20 }, 'r1', makeStrategy('whale_ten'));
  const c = simulate({ maxDays: 20 }, 'r2', makeStrategy('whale_ten'));
  assert.equal(a.log.head, b.log.head);
  assert.deepEqual(a.log.entries, b.log.entries);
  assert.notEqual(a.log.head, c.log.head);
  const pulls = (r) => r.log.entries.filter((e) => e.type === 'draw_committed').map((e) => e.payload.identity).join();
  assert.notEqual(pulls(a), pulls(c));
});

test('consuming strategy randomness does not shift draw, race, or event streams', () => {
  const play = (burn) => {
    const run = new Run({ startGems: 3200 }, 'iso');
    run.start();
    if (burn) for (let i = 0; i < 500; i++) run.rngStrategy.next();
    run.pull(10);
    run.race('best');
    run.runDeck('weekly');
    return run.log.entries.filter((e) => ['draw_committed', 'race_result', 'event_result'].includes(e.type)).map((e) => JSON.stringify(e.payload));
  };
  const a = play(false);
  assert.ok(a.length > 12);
  assert.deepEqual(a, play(true));
});

test('pre-draw odds: base before soft pity, monotone ramp, certain at hard pity, always sum to 1', () => {
  assert.equal(preDrawOdds(P, 0).legendary, 0.02);
  assert.equal(preDrawOdds(P, 32).legendary, 0.02); // draw 33
  assert.equal(preDrawOdds(P, 33).legendary, 0.02); // draw 34
  assert.ok(preDrawOdds(P, 34).legendary > 0.02); // draw 35: soft pity begins
  let prev = 0;
  for (let n = 34; n < 49; n++) {
    const o = preDrawOdds(P, n);
    assert.ok(o.legendary > prev);
    prev = o.legendary;
  }
  assert.equal(preDrawOdds(P, 49).legendary, 1); // draw 50
  for (let n = 0; n < 60; n++) {
    const o = preDrawOdds(P, n);
    assert.ok(Math.abs(o.common + o.rare + o.legendary - 1) < 1e-9);
  }
});

test('a ten-pull is ten ordered draws, each with its own pre-draw pity state and odds', () => {
  const run = new Run({ startGems: 1600, softPityStart: 4, hardPity: 6, rarity: { common: 0.9, rare: 0.1, legendary: 0 } }, 'ten');
  run.start();
  const before = run.log.length;
  run.pull(10);
  const draws = run.log.entries.slice(before).filter((e) => e.type === 'draw_committed');
  assert.equal(draws.length, 10);
  assert.deepEqual(draws.map((d) => d.payload.drawIndex), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  // base legendary odds are zero, soft pity starts at draw 4, hard pity at 6: a legendary lands by draw 6 of each window
  for (let i = 0; i < 10; i++) {
    const d = draws[i].payload;
    assert.equal(d.drawNumberInWindow, d.pityBefore + 1);
    assert.equal(d.odds.legendary, preDrawOdds(run.p, d.pityBefore).legendary);
    if (i > 0) assert.equal(d.drawNumberInWindow, draws[i - 1].payload.rarity === 'legendary' ? 1 : draws[i - 1].payload.drawNumberInWindow + 1);
    assert.ok(d.drawNumberInWindow <= 6);
    if (d.drawNumberInWindow < 4) assert.equal(d.odds.legendary, 0);
    if (d.drawNumberInWindow === 6) assert.equal(d.rarity, 'legendary');
  }
  assert.ok(draws.some((d) => d.payload.odds.legendary > 0 && d.payload.odds.legendary < 1));
  // each draw is committed then revealed in order (sequential mode)
  const kinds = run.log.entries.slice(before).filter((e) => /draw_committed|reveal_shown/.test(e.type)).map((e) => `${e.type}:${e.payload.drawIndex}`);
  assert.deepEqual(kinds.slice(0, 4), ['draw_committed:1', 'reveal_shown:1', 'draw_committed:2', 'reveal_shown:2']);
});

test('pull 35 logs exact unrounded odds 0.08125, and odds reset across a ten-pull', () => {
  // Start with pity = 34 so the next draw is draw 35 (soft pity start)
  const run = new Run({ startGems: 1600, openingAdvancesPity: false }, 'p35');
  run.start();
  run.pity = 34;
  run.pull(1);
  const draw35 = run.log.entries.find((e) => e.type === 'draw_committed' && e.payload.drawNumberInWindow === 35);
  assert.ok(draw35);
  // Draft pull 35 legendary probability must be exact 0.08125, not rounded 0.0813
  assert.equal(draw35.payload.odds.legendary, 0.08125);
  assert.equal(draw35.payload.odds.legendary, preDrawOdds(run.p, 34).legendary);
  assert.equal(draw35.payload.odds.common, preDrawOdds(run.p, 34).common);
  assert.equal(draw35.payload.odds.rare, preDrawOdds(run.p, 34).rare);

  // Ten-pull with a guaranteed legendary on draw 2 to verify in-flight reset
  const runTen = new Run({ startGems: 1600, softPityStart: 2, hardPity: 2, rarity: { common: 0.8, rare: 0.2, legendary: 0 } }, 'resetTen');
  runTen.start();
  runTen.pull(10);
  const tenDraws = runTen.log.entries.filter((e) => e.type === 'draw_committed' && !e.payload.free);
  assert.equal(tenDraws.length, 10);
  // Draw 1 has pityBefore = 0, drawNumberInWindow = 1
  assert.equal(tenDraws[0].payload.pityBefore, 0);
  // Draw 2 reaches hard pity (hardPity: 2), so rarity is legendary and pityAfter resets to 0
  assert.equal(tenDraws[1].payload.rarity, 'legendary');
  assert.equal(tenDraws[1].payload.pityAfter, 0);
  // Draw 3 starts a fresh window with pityBefore = 0 and base odds
  assert.equal(tenDraws[2].payload.pityBefore, 0);
  assert.equal(tenDraws[2].payload.odds.legendary, 0);
});

test('opening free ten-pull advances pity only when the parameter says so', () => {
  const off = new Run({ openingAdvancesPity: false }, 'o');
  off.start();
  assert.equal(off.pity, 0);
  assert.ok(off.log.entries.filter((e) => e.type === 'draw_committed').every((e) => e.payload.advancesPity === false && e.payload.pityBefore === 0));
  const on = new Run({ openingAdvancesPity: true, rarity: { common: 0.8, rare: 0.2, legendary: 0 } }, 'o');
  on.start();
  assert.equal(on.pity, 10);
});

test('pity counter carries or resets across a banner change', () => {
  for (const [mode, expectPity] of [['carry', true], ['reset', false]]) {
    const run = new Run({ pityCarry: mode, startGems: 320, bannerDays: 2, rarity: { common: 0.8, rare: 0.2, legendary: 0 } }, 'c');
    run.start();
    run.pull(1);
    run.pull(1);
    assert.equal(run.pity, 2);
    run.day = 3; // banner boundary with bannerDays 2
    run.playDay(makeStrategy('frugal_single'));
    assert.equal(run.pity > 0, expectPity);
  }
});

test('pity statistics distinguish soft entry, hard-guarantee draw, and earlier legendary', () => {
  const hard = new Run({ startGems: 160 * 60, softPityStart: 50, rarity: { common: 0.8, rare: 0.2, legendary: 0 }, openingAdvancesPity: false }, 'h');
  hard.start();
  for (let i = 0; i < 50; i++) hard.pull(1);
  assert.equal(hard.stats.enteredSoft, false); // soft pity coincides with the hard draw here
  assert.equal(hard.stats.reachedHardDraw, true);
  assert.deepEqual(hard.stats.windows, { beforeSoft: 0, inSoft: 0, atHard: 1 });
  const soft = new Run({ startGems: 160 * 40, softPityStart: 2, hardPity: 1000, rarity: { common: 0.8, rare: 0.2, legendary: 0 } }, 's');
  soft.start();
  for (let i = 0; i < 40; i++) soft.pull(1);
  assert.equal(soft.stats.enteredSoft, true);
  assert.equal(soft.stats.reachedHardDraw, false);
  const early = new Run({ startGems: 160, rarity: { common: 0, rare: 0, legendary: 1 } }, 'e');
  early.start();
  early.pull(1);
  assert.equal(early.stats.enteredSoft, false);
  assert.equal(early.stats.reachedHardDraw, false);
  assert.deepEqual(early.stats.windows, { beforeSoft: 1, inSoft: 0, atHard: 0 });
});

test('duplicates convert to Down; Down shop is worth little compared with pulls', () => {
  const run = simulate({ maxDays: 15 }, 'dup', makeStrategy('whale_ten'));
  const s = run.summary();
  assert.ok(s.duplicates > 0);
  const gemEquivalent = (s.down + s.downSpent) * run.p.downValueGems;
  assert.ok(gemEquivalent < s.gemsSpentOnPulls * 0.05);
});

test('escalation ladder runs in order and ends in running_on_empty with a record of the unpaid bill', () => {
  const run = simulate({ startCash: 0, wagePerDay: 0, creditLimit: 400, maxDays: 300 }, 'broke', makeStrategy('frugal_single'));
  assert.equal(run.terminal, 'running_on_empty');
  const steps = run.log.entries.filter((e) => e.type === 'escalation_offered').map((e) => e.payload.step);
  assert.ok(steps.includes('skip_lunch'));
  // one-time and credit steps are offered only once health is exhausted; shifts and lunch only before that
  for (const o of run.log.entries.filter((e) => e.type === 'escalation_offered')) {
    if (['sell_couch', 'sell_tv', 'credit_card'].includes(o.payload.step)) assert.ok(o.payload.healthBefore <= 20);
    else assert.ok(o.payload.healthBefore > 20);
  }
  assert.ok(steps.indexOf('sell_tv') > steps.indexOf('sell_couch'));
  assert.ok(steps.indexOf('credit_card') > steps.indexOf('sell_tv'));
  const e = run.log.entries;
  const lastDue = e.filter((x) => x.type === 'expense_due').at(-1);
  assert.ok(!e.some((x) => x.type === 'expense_paid' && x.seq > lastDue.seq));
});

test('every terminal route reaches the Receipt entry', () => {
  const routes = {
    uninstall: simulate({}, 't1', makeStrategy('early_uninstaller')),
    run_complete: simulate({ maxDays: 5 }, 't2', makeStrategy('frugal_single')),
    running_on_empty: simulate({ startCash: 0, wagePerDay: 0, maxDays: 60 }, 't3', makeStrategy('frugal_single')),
    completed_collection: simulate({ rosterSize: 1 }, 't4', makeStrategy('frugal_single')),
  };
  for (const [route, run] of Object.entries(routes)) {
    assert.equal(run.terminal, route);
    const tail = run.log.entries.slice(-2).map((e) => e.type);
    assert.deepEqual(tail, ['terminal', 'receipt_shown'], route);
  }
});

test('event deck: eligibility, one-time use, bounded effects, and neutral fallback', () => {
  const run = new Run({ eventWeights: { tax_refund: 1, car_repair: 0, overtime_offer: 0, glitch_duck: 0 } }, 'deck');
  run.start();
  run.runDeck('weekly');
  const first = run.log.entries.filter((e) => e.type === 'event_result').at(-1);
  assert.equal(first.payload.id, 'tax_refund');
  run.cash = 0; // make car_repair ineligible too
  run.health = 40;
  run.runDeck('weekly'); // tax_refund now used (one-time); all others ineligible or weight zero
  const second = run.log.entries.filter((e) => e.type === 'event_result').at(-1);
  assert.equal(second.payload.fallback, true);
  assert.equal(run.log.entries.filter((e) => e.type === 'event_result' && e.payload.id === 'tax_refund').length, 1);
});

test('ineligible deck falls back to a neutral event and records why', () => {
  const run = new Run({}, 'fallback');
  run.start();
  run.cash = 0;
  run.health = 40;
  run.usedEvents.add('tax_refund');
  run.usedEvents.add('glitch_duck');
  run.runDeck('weekly');
  const e = run.log.entries;
  const elig = e.filter((x) => x.type === 'event_eligibility').at(-1);
  assert.deepEqual(elig.payload.candidates.map((c) => c.eligible), [false, false, false, false]);
  assert.ok(elig.payload.candidates.every((c) => c.reason.length > 0));
  const res = e.filter((x) => x.type === 'event_result').at(-1);
  assert.equal(res.payload.fallback, true);
  assert.deepEqual(res.payload.effects, {});
  assert.equal(run.cash, 0);
});

test('event effects stay inside declared bounds across many seeds', () => {
  for (let s = 0; s < 200; s++) {
    const run = new Run({ startCash: 500 }, `b${s}`);
    run.start();
    run.runDeck('weekly');
    const res = run.log.entries.filter((e) => e.type === 'event_result').at(-1);
    const ev = EVENT_DECK.find((d) => d.id === res.payload.id);
    for (const [k, v] of Object.entries(res.payload.effects)) {
      if (ev.bounds[k]) assert.ok(v >= ev.bounds[k][0] && v <= ev.bounds[k][1]);
    }
  }
});

test('cues fire only when their condition holds (rival needs a newer banner)', () => {
  const run = new Run({}, 'rival');
  run.start();
  run.runDeck('race_day');
  assert.equal(run.log.entries.some((e) => e.type === 'cue_shown' && e.payload.technique === 'social_comparison'), false);
  run.banner = 1;
  run.runDeck('race_day');
  assert.equal(run.log.entries.some((e) => e.type === 'cue_shown' && e.payload.technique === 'social_comparison'), true);
});

test('race choice policies all run; per-run summaries are finite', () => {
  for (const race of ['best', 'rested', 'longshot', 'random', 'alternate']) {
    const s = simulate({ maxDays: 10 }, 'rp', makeStrategy('frugal_single', { race })).summary();
    assert.ok(Number.isFinite(s.gemsFromRaces) && s.races === 20, race);
  }
});
