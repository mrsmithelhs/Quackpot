// Plan 28 report-local checks (H1 routing, H2 furnishings, semantic outcome cases).
// Run only through the Plan 25 bounded launcher (standing authority: clearance 04). Uses real Plan 35 fixtures in memory and the
// real engine; never touches storage. A pure routing test does not demonstrate production reload, focus or
// transition integration: those are browser-gate and later production-packet questions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { RENT_FIXTURES, loadRentFixture } from './fixtures.mjs';
import { ROUTES, effectFromEvents, furnishingsFrom, lifeLocation, morningFramingFor, sceneFor } from './life-model.mjs';
import { breakfastView, effectText, ledgerView, outcomeView, paidZeroView, rentDueView, rentUnpaidView } from './views.mjs';

const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const readRepoFile = async (p) => new Uint8Array(await readFile(REPO_ROOT + p));

async function load(key) {
  const loaded = await loadRentFixture(key, readRepoFile);
  assert.ok(loaded.ok, `fixture ${key} failed: ${JSON.stringify(loaded.checks.filter((c) => !c.pass))}`);
  return loaded.engine;
}
const before = (engine) => ({ cash: engine.state.cash, health: engine.state.health, debt: engine.state.debt, assetsSold: [...engine.state.assetsSold], events: engine.log.length });
const appendedSince = (engine, from) => engine.log.entries.filter((e) => e.seq >= from);
const routeKnown = (state) => lifeLocation(state).place !== 'unsupported';

// ---------- fixture pins ----------

test('both rent fixtures load against Plan 35 validation pins', async () => {
  for (const key of Object.keys(RENT_FIXTURES)) {
    const loaded = await loadRentFixture(key, readRepoFile);
    const failed = loaded.checks.filter((c) => !c.pass);
    assert.deepEqual(failed, [], `${key} mismatches`);
    assert.equal(loaded.engine.state.step, 'd2_afternoon_rent');
  }
});

test('a changed fixture byte stops loading and reports expected vs actual', async () => {
  const tamper = async (p) => {
    const bytes = await readRepoFile(p);
    if (!p.endsWith('rent-paid-zero.save.json')) return bytes;
    const copy = bytes.slice();
    copy[copy.length - 2] ^= 1;
    return copy;
  };
  const loaded = await loadRentFixture('rent-paid-zero', tamper);
  assert.equal(loaded.ok, false);
  assert.equal(loaded.engine, undefined);
  const sha = loaded.checks.find((c) => c.name === 'fixture sha256');
  assert.equal(sha.pass, false);
  assert.notEqual(sha.expected, sha.actual);
});

// ---------- H1 routing ----------

test('H1: every persisted route in the source table has exactly one proposed place', () => {
  for (const row of ROUTES.filter((r) => !r.future)) {
    const where = lifeLocation({ step: row.step, activeModal: row.activeModal });
    assert.equal(where.place, row.proposed, `${row.step}/${row.activeModal}`);
  }
  for (const step of ['d2_afternoon_rent', 'd2_afternoon_zerocash', 'd2_afternoon_escalation', 'd2_afternoon_rent_resolved']) {
    const row = ROUTES.find((r) => r.step === step);
    assert.equal(lifeLocation({ step, activeModal: row.activeModal }).place, 'apartment', step);
  }
  assert.equal(lifeLocation({ step: 'receipt', phase: 'terminal' }).place, 'receipt');
  assert.equal(lifeLocation({ step: 'duck_dex' }).place, 'unsupported', 'controller-only step must not be guessed');
  assert.equal(lifeLocation({ step: 'd2_afternoon_rent', activeModal: 'starter' }).place, 'unsupported');
  assert.equal(lifeLocation({ step: 'd1_morning_gacha', activeModal: 'escalation' }).future, true, 'food shortfall stays explicitly future');
});

test('H1: states reached by real actions from both fixtures all have a known route', async () => {
  const seen = [];
  const record = (e) => seen.push({ step: e.state.step, activeModal: e.state.activeModal, phase: e.state.phase, interruptedContext: e.state.interruptedContext });

  for (const choice of ['continue', 'extra_shift', 'sell_couch']) {
    const e = await load('rent-paid-zero');
    record(e);
    e.billExpense('rent', 15.00); record(e);
    e.chooseZeroCashOption(choice); record(e);
  }
  for (let declines = 0; declines < 6; declines += 1) {
    const e = await load('rent-unpaid');
    e.billExpense('rent', 15.00); record(e);
    let ended = false;
    for (let i = 0; i < declines && !ended; i += 1) { e.declineEscalation(); record(e); ended = e.isTerminal(); }
    if (!ended && e.getCurrentEscalationStep()) { e.acceptEscalation(); record(e); }
  }
  for (const s of seen) assert.ok(routeKnown(s), `unrouted ${JSON.stringify(s)}`);

  // Uninstall over the ladder: retention overlays the apartment and Stay restores the same moment.
  const e = await load('rent-unpaid');
  e.billExpense('rent', 15.00);
  e.clickUninstall();
  const during = lifeLocation(e.state);
  assert.deepEqual([during.place, during.moment, during.overlay], ['apartment', 'rent-unpaid', 'retention']);
  e.stayUninstall();
  assert.deepEqual([lifeLocation(e.state).place, lifeLocation(e.state).moment], ['apartment', 'rent-unpaid']);
  e.clickUninstall();
  e.leaveUninstall();
  assert.equal(lifeLocation(e.state).place, 'receipt');
});

// ---------- H2 furnishings ----------

const count = (s, needle) => s.split(needle).length - 1;
const SOFA = '#6d6d64';   // sofa back, src/assets/apartment/props/living.mjs:5
const SCREEN = '#15191f'; // TV screen, living.mjs:7 (omitted when sold)
const GHOST = '#c9c3b8';  // removed-item ghost (both rects), rooms/specs.mjs:17

function livingSvg(assetsSold, n) {
  return renderScene(sceneFor('sale-done', { idPrefix: `h2-${n}`, assetsSold })).svg;
}

test('H2: all four furnishing combinations change the rendered living room, not just the echoed option', () => {
  const combos = [[], ['couch'], ['tv'], ['couch', 'tv']];
  const base = livingSvg([], 0);
  combos.forEach((sold, i) => {
    const f = furnishingsFrom(sold);
    assert.deepEqual(f, { couch: sold.includes('couch') ? 'removed' : 'present', tv: sold.includes('tv') ? 'removed' : 'present' });
    const svg = livingSvg(sold, i + 1);
    const meta = renderScene(sceneFor('sale-done', { idPrefix: `h2m-${i}`, assetsSold: sold })).meta;
    assert.deepEqual(meta.furnishings, f);
    if (sold.includes('couch')) assert.ok(count(svg, SOFA) < count(base, SOFA), 'sofa drawing removed');
    else assert.equal(count(svg, SOFA), count(base, SOFA));
    if (sold.includes('tv')) assert.ok(count(svg, SCREEN) < count(base, SCREEN), 'tv screen removed');
    else assert.equal(count(svg, SCREEN), count(base, SCREEN));
    assert.equal(count(svg, GHOST) - count(base, GHOST), sold.length, 'one ghost per removed item');
  });
});

test('H2: the real engine assetsSold shape after actual sales drives the room', async () => {
  const couchRun = await load('rent-unpaid');
  couchRun.billExpense('rent', 15.00);
  couchRun.declineEscalation(); // extra shift → next
  assert.equal(couchRun.getCurrentEscalationStep(), 'sell_couch');
  couchRun.acceptEscalation();
  assert.deepEqual(couchRun.state.assetsSold, ['couch']);
  assert.deepEqual(furnishingsFrom(couchRun.state.assetsSold), { couch: 'removed', tv: 'present' });

  const tvRun = await load('rent-unpaid');
  tvRun.billExpense('rent', 15.00);
  tvRun.declineEscalation();
  tvRun.declineEscalation();
  assert.equal(tvRun.getCurrentEscalationStep(), 'sell_tv');
  tvRun.acceptEscalation();
  assert.deepEqual(tvRun.state.assetsSold, ['tv']);
  assert.deepEqual(furnishingsFrom(tvRun.state.assetsSold), { couch: 'present', tv: 'removed' });
});

// ---------- semantic outcome cases ----------

test('ledger: past-tense facts from the log, Continue only, and no mutation', async () => {
  const e = await load('rent-paid-zero');
  const n = e.log.length;
  const stateBefore = JSON.stringify(e.state);
  const v = ledgerView(e.log.entries, 2);
  assert.deepEqual(v.controls.map((c) => c.id), ['continue']);
  assert.ok(v.card.lines.includes("Last night's wage: +$10.00."));
  assert.ok(v.card.lines.includes('Breakfast: $5.00, paid this morning.'));
  assert.ok(v.card.lines.includes(`Balance after breakfast: $${v.facts.food.cashAfter.toFixed(2)}.`));
  assert.ok(!v.card.lines.some((l) => l.startsWith('Cash on hand')), 'historic balance is not labelled current');
  assert.equal(e.log.length, n);
  assert.equal(JSON.stringify(e.state), stateBefore);
});

test('rent bill is not called paid before the Pay action', async () => {
  for (const key of ['rent-paid-zero', 'rent-unpaid']) {
    const e = await load(key);
    const v = rentDueView(e);
    assert.ok(v.card.lines.includes('Status: not yet paid.'));
    assert.equal(v.card.stamp, undefined);
    assert.ok(!e.state.billsSettled.includes('d2_rent'));
    assert.deepEqual(v.controls.map((c) => c.label), ['Pay rent ($15.00)']);
  }
});

test('paid-zero: paid in full, $0.00 is not failure, and each choice discloses its actual effect', async () => {
  for (const choice of ['continue', 'extra_shift', 'sell_couch']) {
    const e = await load('rent-paid-zero');
    e.billExpense('rent', 15.00);
    assert.ok(e.state.billsSettled.includes('d2_rent'));
    const stateBefore = JSON.stringify(e.state);
    const v = paidZeroView(e);
    assert.equal(JSON.stringify(e.state), stateBefore, 'previews must not mutate');
    assert.equal(v.card.heading, 'Rent paid in full');
    assert.equal(v.card.stamp, 'PAID');
    assert.ok(v.card.lines.some((l) => l.includes('Cash on hand: $0.00')));
    assert.deepEqual(v.controls.map((c) => c.id), ['zero:continue', 'zero:extra_shift', 'zero:sell_couch']);

    const control = v.controls.find((c) => c.id === `zero:${choice}`);
    const b = before(e);
    e.chooseZeroCashOption(choice);
    const actual = effectFromEvents(appendedSince(e, b.events), b.events, b.debt);
    assert.equal(control.effect, effectText(actual), `${choice} label vs actual`);
    if (choice !== 'continue') assert.ok(control.label.includes(effectText(actual)));
    assert.equal(e.isTerminal(), false, 'paid-zero never ends the run');
  }
});

test('unpaid: never shown as paid; only the decline that really ends the run says so', async () => {
  const e = await load('rent-unpaid');
  e.billExpense('rent', 15.00);
  assert.ok(!e.state.billsSettled.includes('d2_rent'));
  const flags = [];
  for (let guard = 0; guard < 8 && !e.isTerminal(); guard += 1) {
    const v = rentUnpaidView(e);
    assert.equal(v.card.heading, 'Rent unpaid · you need $0.99 more');
    assert.equal(v.card.stamp, undefined);
    const decline = v.controls.find((c) => c.id === 'ladder:decline');
    const n = e.log.length;
    e.declineEscalation();
    assert.equal(e.isTerminal(), decline.endsRun, `decline at ${v.offerStep}: label vs actual`);
    assert.ok(e.log.length > n);
    flags.push({ step: v.offerStep, endsRun: decline.endsRun, label: decline.label });
  }
  assert.ok(e.isTerminal());
  assert.equal(flags.filter((f) => f.endsRun).length, 1);
  assert.equal(flags.at(-1).endsRun, true);
  assert.equal(flags.at(-1).label, 'Decline — rent stays $15.00 unpaid and this run ends. Your Receipt is next.');
  assert.deepEqual(flags.map((f) => f.step), ['extra_shift', 'sell_couch', 'sell_tv', 'credit_card']);
});

test('unpaid: every accept discloses its actual effect and the outcome distinguishes paid from unpaid', async () => {
  for (let depth = 0; depth < 4; depth += 1) {
    const e = await load('rent-unpaid');
    e.billExpense('rent', 15.00);
    for (let i = 0; i < depth; i += 1) e.declineEscalation();
    const v = rentUnpaidView(e);
    const accept = v.controls.find((c) => c.id === 'ladder:accept');
    const b = before(e);
    const result = e.acceptEscalation();
    const actual = effectFromEvents(appendedSince(e, b.events), b.events, b.debt);
    const paidNow = appendedSince(e, b.events).some((x) => x.type === 'expense_paid' && x.payload.kind === 'rent');
    assert.ok(accept.label.includes(effectText(actual, { rentPaid: paidNow })), `${v.offerStep}: "${accept.label}"`);
    const out = outcomeView(e, { choice: v.offerStep, before: b });
    assert.equal(out.rentPaidNow, paidNow);
    assert.equal(out.card.lines.includes('Rent paid in full: $15.00.'), paidNow);
    assert.equal(out.card.lines.includes('Rent is still unpaid: $15.00 due.'), !e.state.billsSettled.includes('d2_rent'));
    assert.equal(result.resolved, e.state.billsSettled.includes('d2_rent'));
    assert.ok(out.card.lines.includes(`Cash on hand: $${e.state.cash.toFixed(2)}.`));
  }
});

test('evening after paid-zero continue: nothing is charged for breakfast until the tap, then one charge and a Day 3 ledger', async () => {
  const e = await load('rent-paid-zero');
  e.billExpense('rent', 15.00);
  e.chooseZeroCashOption('continue');
  e.creditWage(); // main.js:658-665 order, with the food charge moved to the tap (owner decision 2026-10-30)
  e.advanceDay(3, 'day 3 morning');
  const isFood = (x) => x.payload?.kind === 'food' && x.payload?.billId === 'd3_food';
  assert.equal(e.log.entries.filter(isFood).length, 0, 'no breakfast event before the tap');
  const pre = breakfastView(e, 3);
  assert.deepEqual(pre.controls.map((c) => c.id), ['breakfast:pay'], 'one control and no skip: skipping is Plan 37');
  assert.ok(pre.card.lines.includes("Last night's wage: +$10.00."));
  assert.ok(pre.card.lines.includes('Breakfast: $5.00, not paid yet.'));
  assert.ok(pre.card.lines.includes(`Cash on hand: $${e.state.cash.toFixed(2)}.`));
  assert.ok(!pre.card.lines.some((l) => /paid this morning|Balance after/.test(l)), 'not described as paid before the tap');

  const n = e.log.length;
  const first = e.billExpense('food', 5.00);
  const second = e.billExpense('food', 5.00); // a duplicate tap must not charge twice
  assert.ok(first.paid && !first.zeroCash);
  assert.equal(second.alreadySettled, true);
  assert.deepEqual(appendedSince(e, n).map((x) => x.type), ['expense_due', 'expense_paid']);
  const v = ledgerView(e.log.entries, 3);
  assert.ok(v.card.lines.includes('Breakfast: $5.00, paid this morning.'));
  assert.ok(v.card.lines.includes('Balance after breakfast: $5.00.'));
});

test('morning framing: owner choice is wide on Day 1 and medium after; reviewer overrides force one framing', () => {
  assert.equal(morningFramingFor(1), 'wide');
  assert.equal(morningFramingFor(2), 'medium');
  assert.equal(morningFramingFor(3, 'owner'), 'medium');
  assert.equal(morningFramingFor(1, 'medium'), 'medium');
  assert.equal(morningFramingFor(3, 'wide'), 'wide');
  for (const moment of ['ledger', 'breakfast']) {
    assert.equal(sceneFor(moment, { idPrefix: 'p28-f', morningFraming: morningFramingFor(1) }).framing, 'wide');
    assert.equal(sceneFor(moment, { idPrefix: 'p28-f', morningFraming: morningFramingFor(2) }).framing, 'medium');
  }
});
