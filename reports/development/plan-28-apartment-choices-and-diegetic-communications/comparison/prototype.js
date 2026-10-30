// Plan 28 report-local prototype page: renders Direction A view-models and drives the real engine in memory.
// Calls mirror the production controller order (src/main.js) without importing it. No storage APIs are used.

import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { createStageTransition } from '../../../../src/ui/stage-transition.js';
import { loadRentFixture } from './fixtures.mjs';
import { lifeLocation, sceneFor, snapshotOf } from './life-model.mjs';
import { RENT_AMOUNT, ledgerView, outcomeView, paidZeroView, rentDueView, rentUnpaidView, returnView, standinView } from './views.mjs';

const REPO_ROOT = new URL('../../../../', import.meta.url);
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const transition = createStageTransition($('#stage'));
// Reviewer switch: ?motion-off skips the transition entirely so meaning can be checked without animation.
// The production reduced-motion path (stage-transition.js static overlay) is exercised only under real
// prefers-reduced-motion emulation.
const MOTION_OFF = new URLSearchParams(location.search).has('motion-off');
const turnPhone = (direction) => (MOTION_OFF ? Promise.resolve(true) : transition.run(direction));
let sceneSeq = 0;

const ui = {
  scenario: 'paid-zero',
  engine: null,
  baseEvents: 0,
  view: null,
  token: 0,
  busy: false,
  cues: [],
  focusOnRender: false,
  before: null,
  generation: 0,
};

async function readRepoFile(path) {
  const res = await fetch(new URL(path, REPO_ROOT), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

// ---------- scenario setup ----------

async function startScenario(name) {
  const generation = ++ui.generation;
  transition.cancel();
  ui.busy = true;
  ui.token += 1; // the previous card's controls are now stale
  ui.scenario = name;
  ui.cues = [];
  ui.view = null;
  ui.focusOnRender = false;
  $('#card').className = 'card';
  $('#card').innerHTML = '<h2 id="card-heading" tabindex="-1">Loading scenario…</h2>';
  const fixtureKey = name === 'unpaid' ? 'rent-unpaid' : 'rent-paid-zero';
  const loaded = await loadRentFixture(fixtureKey, readRepoFile);
  if (generation !== ui.generation) return; // a newer scenario started while loading
  renderChecks(loaded);
  if (!loaded.ok) {
    ui.engine = null;
    $('#scene').innerHTML = '';
    $('#card').className = 'card blocked';
    $('#card').innerHTML = `<h2 id="card-heading">Stopped: ${esc(loaded.checkpointId)} failed its pinned checks</h2>
      <p>See the reviewer panel for expected and actual values. No synthetic state is substituted.</p>`;
    renderReviewer();
    ui.busy = false;
    return;
  }
  ui.engine = loaded.engine;
  ui.baseEvents = ui.engine.log.length;
  if (name === 'ledger-d1') { ui.busy = false; return show(ledgerView(ui.engine.log.entries, 1)); }
  if (name === 'return-d2') { ui.busy = false; return show(returnView(ui.engine)); }
  // Live branches: the phone turns back to portrait, then the Day 2 morning ledger (already charged), then the bill.
  await turnPhone('return');
  if (generation !== ui.generation) return;
  ui.busy = false;
  show(ledgerView(ui.engine.log.entries, 2), { next: 'rent' });
}

/** Every scenario start goes through here so a failed load always shows a blocked card. */
function runScenario(name) {
  startScenario(name).catch((err) => {
    ui.busy = false;
    $('#card').className = 'card blocked';
    $('#card').innerHTML = `<h2 id="card-heading" tabindex="-1">Prototype could not start</h2><p>${esc(err.message)}</p>`;
  });
}

// ---------- rendering ----------

function phoneFor(view) {
  if (view.moment === 'shift-done' || view.offerStep === 'extra_shift') {
    return { status: '6:40 PM', brand: 'MESSAGES', heading: ['Marisol'], body: ['Shift tonight?'], note: '' };
  }
  if (view.moment === 'return') return { status: '', brand: 'QUACKPOT', heading: ['Welcome', 'back'], body: ['Ready when', 'you are'], note: '' };
  return null;
}

function show(view, extra = {}, { rerender = false } = {}) {
  ui.view = { ...view, ...extra };
  ui.token += 1;
  const engine = ui.engine;
  const moment = view.moment === 'rent-unpaid' ? 'rent-unpaid' : view.moment;
  const options = sceneFor(moment, {
    idPrefix: `p28-s${++sceneSeq}`,
    assetsSold: engine?.state.assetsSold ?? [],
    morningFraming: $('#morning-framing').value,
    phone: phoneFor(view),
    offerStep: view.offerStep ?? null,
  });
  const scene = renderScene(options);
  $('#scene').innerHTML = scene.svg;
  ui.sceneMeta = scene.meta;
  renderCard(ui.view);
  if (!rerender && (view.provenance !== 'display-only' || view.moment === 'return')) {
    ui.cues.push({ moment: view.moment, provenance: view.provenance, heading: view.card.heading });
  }
  renderReviewer();
  if (ui.focusOnRender) $('#card-heading')?.focus();
  ui.focusOnRender = true;
  $('#status').textContent = view.card.heading;
}

function renderCard(view) {
  const card = view.card;
  const el = $('#card');
  el.className = `card card--${card.kind}`;
  const lines = card.lines.map((l) => `<p>${esc(l)}</p>`).join('');
  const body = card.kind === 'message' ? `<p class="bubble">${esc(card.lines.join(' '))}</p>` : lines;
  const offer = view.offer ? `
    <section class="offer card--inline-${view.offer.kind}" aria-labelledby="offer-heading">
      <p class="offer-kind">${esc({ message: 'Message', listing: 'Listing', statement: 'Card statement' }[view.offer.kind] ?? '')}${view.offer.sender ? ` · ${esc(view.offer.sender)}` : ''}</p>
      <h3 id="offer-heading">${esc(view.offer.heading)}</h3>
      ${view.offer.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
    </section>` : '';
  const controls = view.controls.map((c) => `<button type="button" data-id="${esc(c.id)}" class="${c.primary ? 'primary' : ''}${c.endsRun ? ' ends-run' : ''}">${esc(c.label)}</button>`).join('');
  el.innerHTML = `
    ${card.sender ? `<p class="sender">${esc(card.sender)}</p>` : ''}
    <h2 id="card-heading" tabindex="-1">${esc(card.heading)}</h2>
    ${card.stamp ? `<p class="stamp" aria-label="Stamped ${esc(card.stamp)}">${esc(card.stamp)}</p>` : ''}
    ${card.aside ? `<p class="aside">${esc(card.aside)}</p>` : ''}
    ${body}${offer}
    <div class="controls">${controls}</div>`;
}

// ---------- actions (duplicate/stale guarded) ----------

$('#card').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  const token = ui.token;
  const generation = ui.generation;
  if (ui.busy || button.disabled || !ui.view) return;
  ui.busy = true;
  for (const b of $('#card').querySelectorAll('button')) b.disabled = true;
  Promise.resolve(act(button.dataset.id, generation))
    .catch((err) => { console.error(err); $('#status').textContent = `Prototype error: ${err.message}`; })
    .finally(() => {
      if (generation !== ui.generation) return; // a newer scenario owns busy and the card now
      if (token === ui.token) for (const b of $('#card').querySelectorAll('button')) b.disabled = false;
      ui.busy = false;
    });
});

function beforeOf(engine) {
  const s = engine.state;
  return { cash: s.cash, health: s.health, debt: s.debt, assetsSold: [...s.assetsSold], events: engine.log.length };
}

function showEngineMoment() {
  const engine = ui.engine;
  const where = lifeLocation(engine.state);
  if (where.place === 'receipt') return show(standinView('receipt'));
  if (where.moment === 'rent-due') return show(rentDueView(engine));
  if (where.moment === 'paid-zero') return show(paidZeroView(engine));
  if (where.moment === 'rent-unpaid') return show(rentUnpaidView(engine));
  throw new Error(`Unexpected routing ${JSON.stringify(where)} at step ${engine.state.step}`);
}

async function act(id, generation) {
  const engine = ui.engine;
  const stale = () => generation !== ui.generation;
  if (id === 'continue') {
    if (ui.view.next === 'rent') return show(rentDueView(engine));
    if (ui.view.next === 'race-2' || ui.scenario === 'ledger-d1') {
      const next = ui.view.next === 'race-2' ? 'race-2' : 'race-1';
      await turnPhone('enter');
      if (stale()) return;
      return show(standinView(next));
    }
  }
  if (id === 'pay') {
    // main.js:434 — the only rent mutation; result routing follows engine state.
    const before = beforeOf(engine);
    const result = engine.billExpense('rent', RENT_AMOUNT);
    if (result.paid && !result.zeroCash) return show(outcomeView(engine, { choice: 'pay', before }));
    return showEngineMoment();
  }
  if (id === 'zero:continue') {
    engine.chooseZeroCashOption('continue');
    return evening();
  }
  if (id.startsWith('zero:')) {
    const choice = id.slice(5);
    const before = beforeOf(engine);
    engine.chooseZeroCashOption(choice);
    return show(outcomeView(engine, { choice, before }));
  }
  if (id === 'ladder:accept') {
    const choice = ui.view.offerStep;
    const before = beforeOf(engine);
    const result = engine.acceptEscalation();
    const view = outcomeView(engine, { choice, before });
    if (!result.resolved && !engine.isTerminal()) view.controls = [{ id: 'bill', label: 'Back to the bill', primary: true }];
    return show(view);
  }
  if (id === 'ladder:decline') {
    engine.declineEscalation();
    return showEngineMoment();
  }
  if (id === 'bill') return showEngineMoment();
  if (id === 'evening') return evening();
  if (id === 'open-quackpot') {
    await turnPhone('enter');
    if (stale()) return;
    return show(standinView('quackpot'));
  }
  if (id === 'return') {
    await turnPhone('return');
    if (stale()) return;
    return show(returnView(engine));
  }
  throw new Error(`Unhandled control ${id}`);
}

/** main.js:658-665 proceedToDay2Evening, in the same order; then the Day 3 morning ledger from the new events. */
function evening() {
  const engine = ui.engine;
  engine.creditWage();
  engine.advanceDay(3, 'day 3 morning');
  engine.billExpense('food', 5.00);
  engine.state.step = 'd3_midday_race';
  return show(ledgerView(engine.log.entries, 3), { next: 'race-2' });
}

// ---------- reviewer panel ----------

function renderChecks(loaded) {
  $('#checks tbody').innerHTML = loaded.checks.map((c) => `<tr class="${c.pass ? '' : 'fail'}"><td>${esc(c.name)}</td><td>${esc(JSON.stringify(c.expected))}</td><td>${esc(JSON.stringify(c.actual))}</td></tr>`).join('');
}

function renderReviewer() {
  const view = ui.view;
  const meta = ui.sceneMeta;
  $('#provenance').innerHTML = view ? `
    <dt>Moment</dt><dd>${esc(view.moment)}</dd>
    <dt>Source</dt><dd>${esc({ 'live-engine': 'live engine (Plan 35 fixture, in memory)', 'log-projection': 'projection of recorded events', 'display-only': 'display-only composition' }[view.provenance])}</dd>
    <dt>Scene</dt><dd>${esc(meta ? `${meta.shotKey} · light ${meta.light} · duck ${meta.duckView}${meta.furnishings ? ` · couch ${meta.furnishings.couch}, tv ${meta.furnishings.tv}` : ''}` : '')}</dd>` : '';
  const engine = ui.engine;
  $('#snapshot').textContent = engine ? JSON.stringify(snapshotOf(engine), null, 1) : '(no engine)';
  $('#events').innerHTML = engine
    ? engine.log.entries.filter((e) => e.seq >= ui.baseEvents).map((e) => `<li>${esc(e.type)} ${esc(JSON.stringify(e.payload))}</li>`).join('')
    : '';
  $('#cues').innerHTML = ui.cues.map((c) => `<li>${esc(c.moment)} · ${esc(c.heading)} <em>(${esc(c.provenance)})</em></li>`).join('');
}

$('#scenario').addEventListener('change', (e) => runScenario(e.target.value));
$('#reset').addEventListener('click', () => runScenario($('#scenario').value));
$('#morning-framing').addEventListener('change', () => {
  if (ui.view?.moment === 'ledger' && !ui.busy) { ui.focusOnRender = false; show(ui.view, {}, { rerender: true }); }
});

runScenario('paid-zero');
