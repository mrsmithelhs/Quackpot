// Plan 28 selected interaction model (owner D20) and duck rules (D14, D21): node:test checks.
// Run only through the Plan 25 bounded launcher (standing authority: clearance 04). Uses the real Plan 35 fixtures in
// memory and the real engine; no storage, no DOM. Rendered layout, focus and held/put-down behaviour are browser checks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { loadRentFixture } from '../comparison/fixtures.mjs';
import { effectFromEvents } from '../comparison/life-model.mjs';
import { OFFER_PLACE, ladderDecision, optionalOpen, placeFor, rentState, shortfallDecision } from './mix-model.mjs';
import { MIN_TILT, duckLayerHtml, headingToward, leanToward } from './duck-layer.mjs';
import * as perches from './perches.mjs';
import * as props from './props.mjs';
import { decide, noticeLetter } from './copy.mjs';

const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const readRepoFile = async (p) => new Uint8Array(await readFile(REPO_ROOT + p));
async function load(key) {
  const loaded = await loadRentFixture(key, readRepoFile);
  assert.ok(loaded.ok, `fixture ${key} failed`);
  return loaded.engine;
}
const types = (e, from) => e.log.entries.filter((x) => x.seq >= from).map((x) => x.type);

// ---------- selected flow routing ----------

test('paid with exactly $15: notice first; after paying, optional beats stay optional and Day 3 brings breakfast', async () => {
  const e = await load('rent-paid-zero');
  assert.equal(placeFor(e), 'kitchen-notice');
  e.billExpense('rent', 15);
  assert.equal(rentState(e).paid, true);
  assert.equal(optionalOpen(e), true, 'shift and couch are offered after paying with exactly $15');
  for (const requested of ['kitchen-notice', 'desk-phone', 'living']) assert.equal(placeFor(e, requested), requested, 'the player chooses when to look');
  e.chooseZeroCashOption('extra_shift');
  assert.equal(optionalOpen(e), false, 'after the shift, the couch sale is no longer offered (engine closed the choice)');
  // the evening after a shift: no zero-cash continue (it would throw with $10), wage, next day
  assert.throws(() => e.chooseZeroCashOption('continue'));
  e.creditWage();
  e.advanceDay(3, 'day 3 morning');
  assert.equal(placeFor(e, 'desk-phone'), 'kitchen-breakfast');
});

test('rent short: trying to pay records the bill as due and takes nothing; the panel says so first', async () => {
  const e = await load('rent-unpaid');
  const d = shortfallDecision(e);
  assert.ok(d.lines.some((l) => l.includes('$0.99 short') && l.includes('Nothing will be taken')));
  assert.equal(d.confirm, 'Try to pay $15.00');
  const n = e.log.length;
  const cash = e.state.cash;
  e.billExpense('rent', 15);
  assert.deepEqual(types(e, n), ['expense_due']);
  assert.equal(e.state.cash, cash);
  assert.equal(rentState(e).owing, true);
  assert.equal(placeFor(e), OFFER_PLACE.extra_shift);
});

test('rent short: each offer is shown where it lives, and only the decline that really ends the run says so', async () => {
  const e = await load('rent-unpaid');
  e.billExpense('rent', 15);
  const seen = [];
  for (;;) {
    const d = ladderDecision(e);
    if (!d) break;
    seen.push([d.step, placeFor(e), d.decline.endsRun]);
    assert.ok(d.lines[0].includes('Nothing has been taken'));
    assert.equal(d.back, 'Not now');
    if (d.decline.endsRun) assert.match(d.decline.label, /this run ends\. Your Receipt is next\.$/);
    else assert.match(d.decline.label, /\(rent still \$0\.99 short\)$/);
    e.declineEscalation();
  }
  assert.deepEqual(seen, [
    ['extra_shift', 'desk-phone', false], ['sell_couch', 'living', false], ['sell_tv', 'living', false], ['credit_card', 'desk-card', true],
  ]);
  assert.equal(e.isTerminal(), true);
  assert.equal(placeFor(e, 'desk-card'), 'receipt');
});

test('rent short: every accept states its actual effect and that rent then gets paid', async () => {
  for (let skip = 0; skip < 4; skip++) {
    const e = await load('rent-unpaid');
    e.billExpense('rent', 15);
    for (let i = 0; i < skip; i++) e.declineEscalation();
    const d = ladderDecision(e);
    const before = { events: e.log.length, debt: e.state.debt };
    e.acceptEscalation();
    const actual = effectFromEvents(e.log.entries, before.events, before.debt);
    assert.deepEqual(d.preview.accept.effect, actual, `${d.step}: preview equals what happened`);
    assert.equal(rentState(e).paid, true, `${d.step}: rent paid`);
    assert.match(d.confirm, /then \$15\.00 rent paid$/);
    assert.equal(placeFor(e, 'living'), 'living', 'after resolution the place stays where the player was');
  }
});

// ---------- duck: gaze and the tilt rule (D21) ----------

test('duck heading points the overhead beak at the target; lean only with a wedge and never tiny', () => {
  assert.equal(headingToward({ x: 50, y: 50 }, { x: 10, y: 50 }), 0, 'native beak already points left');
  assert.equal(Math.abs(headingToward({ x: 50, y: 50 }, { x: 90, y: 50 })), 180);
  assert.ok(headingToward({ x: 50, y: 60 }, { x: 45, y: 10 }) > 45, 'target above turns the beak upward (clockwise from left)');
  assert.ok(leanToward({ x: 28, y: 77 }, { x: 71, y: 38 }, 25, 1) > 0, 'target above means look up');
  const level = duckLayerHtml({ view: 'side', facing: 'right', lean: 20, size: 10, x: 50, y: 70 }, 'tsa');
  assert.match(level, /rotate\(0deg\)/, 'no wedge: level');
  assert.doesNotMatch(level, /duck-wedge/);
  const tiny = duckLayerHtml({ view: 'side', lean: MIN_TILT - 1, wedge: 'paperback', size: 10, x: 50, y: 70 }, 'tsb');
  assert.match(tiny, /rotate\(0deg\)/, 'below MIN_TILT: level');
  const up = duckLayerHtml({ view: 'side', facing: 'right', lean: 20, wedge: 'paperback', size: 10, x: 50, y: 70 }, 'tsc');
  assert.match(up, /rotate\(20deg\)/);
  assert.match(up, /class="duck-wedge"/);
  assert.match(up, /scaleX\(-1\)/, 'facing right mirrors the group so the wedge stays under the chest');
  const top = duckLayerHtml({ view: 'top', turn: 41, size: 17, x: 49, y: 61 }, 'tsd');
  assert.match(top, /rotate\(41deg\)/);
});

// ---------- report-local art and copy ----------

test('sketch props and perches are standalone, scoped and inert', () => {
  const svgs = [
    props.tapedNotice({ idPrefix: 'ta', state: 'paid' }), props.envelope({ idPrefix: 'tb', state: 'open' }), props.emptyPlate({ idPrefix: 'tc' }),
    props.bakeryBag({ idPrefix: 'td' }), props.saleTag({ idPrefix: 'te' }), props.phoneGlow({ idPrefix: 'tf' }),
    perches.wallShelf({ idPrefix: 'tg' }).svg, perches.bookStack({ idPrefix: 'th' }).svg, perches.crate({ idPrefix: 'ti' }).svg,
    perches.windowLedge({ idPrefix: 'tj' }).svg, perches.paperback({ idPrefix: 'tk' }),
  ];
  for (const svg of svgs) {
    assert.match(svg, /^<svg[^>]*viewBox="/);
    assert.match(svg, /aria-hidden="true"/);
    assert.doesNotMatch(svg, /<(script|image|foreignObject)\b/);
    for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) assert.match(id, /^t[a-k]-/, `id ${id} is prefixed`);
  }
  assert.throws(() => props.tapedNotice({ idPrefix: 'Bad Id' }), RangeError);
});

test('the institution prints no controls; the game panel states amounts', () => {
  const letter = noticeLetter({ amount: 15, unit: '4B' });
  const text = [letter.heading, ...letter.paragraphs, letter.footer].join(' ');
  assert.doesNotMatch(text, /\b(click|tap|button|press)\b/i);
  const d = decide.payRent({ amount: 15, cashBefore: 15, cashAfter: 0 });
  assert.equal(d.confirm, 'Pay $15.00');
  assert.ok(d.lines.some((l) => l.includes('$15.00 → $0.00')));
});
