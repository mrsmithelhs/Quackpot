// Plan 28 interaction gallery (report-local). Four treatments of notice -> inspect -> choose -> consequence, judged in
// the room. Layer 1: objects in their places with halo, chip and the duck's gaze. Layer 2: a held object, read freely.
// Layer 3: the game's own decision UI (collapsed panel, phone app, or anchored confirm) where the only commitment
// happens. Every commitment calls the real engine in memory; amounts come from engine clones. No storage APIs.

import { renderScene } from '../../../../src/assets/apartment/index.mjs';
import { GAME_CONSTANTS } from '../../../../src/core/game-engine.mjs';
import { loadRentFixture } from '../comparison/fixtures.mjs';
import { furnishingsFrom } from '../comparison/life-model.mjs';
import * as prop from './props.mjs';
import { chips, decide, marisolThread, money, noticeLetter, plannerPage, portalPage, results, worldLabels } from './copy.mjs';

const RENT = GAME_CONSTANTS.RENT_DAY2;
const FOOD = GAME_CONSTANTS.FOOD_DAILY;
const REPO_ROOT = new URL('../../../../', import.meta.url);
const params = new URLSearchParams(location.search);
const MOTION_OFF = params.has('motion-off');
const reducedMotion = () => MOTION_OFF || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (MOTION_OFF) document.documentElement.classList.add('motion-off');

const $ = (s, root = document) => root.querySelector(s);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let seq = 0;
const uid = (p) => `${p}${++seq}`;

// ---------- engine ----------

const pick = (s) => ({ cash: s.cash, health: s.health, debt: s.debt });
const cloneEngine = (e) => e.constructor.fromEnvelope(structuredClone(e.toEnvelope()));
const ACTIONS = {
  payRent: (e) => e.billExpense('rent', RENT),
  takeShift: (e) => e.chooseZeroCashOption('extra_shift'),
  sellCouch: (e) => e.chooseZeroCashOption('sell_couch'),
  breakfast: (e) => e.billExpense('food', FOOD),
  // main.js:658-665 order without the food charge, which waits for the breakfast choice (owner D9)
  evening: (e) => { e.chooseZeroCashOption('continue'); e.creditWage(); e.advanceDay(3, 'day 3 morning'); },
};
/** What an action would do, from a throwaway clone; the shown amounts cannot drift from the commit. */
function preview(engine, action) {
  const c = cloneEngine(engine);
  ACTIONS[action](c);
  return { before: pick(engine.state), after: pick(c.state) };
}
/** Gross extra-shift pay from a clone that has paid rent first, so the planner can quote it before rent is paid. */
function shiftPayOf(e) {
  const c = cloneEngine(e);
  if (!c.state.billsSettled.includes('d2_rent')) ACTIONS.payRent(c);
  const before = c.state.cash;
  ACTIONS.takeShift(c);
  return Math.round((c.state.cash - before) * 100) / 100;
}
const facts = (e) => ({
  rentPaid: e.state.billsSettled.includes('d2_rent'),
  breakfastPaid: e.state.billsSettled.includes('d3_food'),
  couchSold: e.state.assetsSold.includes('couch'),
  shiftTaken: e.log.entries.some((x) => x.type === 'escalation_result' && x.payload?.step === 'extra_shift'),
  zeroCashOpen: e.state.activeModal === 'zerocash',
});

async function readRepoFile(path) {
  const res = await fetch(new URL(path, REPO_ROOT), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

// ---------- treatments and moments ----------

const ANSWERS = {
  T1: {
    exists: 'A rent notice taped to the fridge door at fridge scale; the duck faces it.',
    notice: 'Halo, "Rent notice" chip, duck gaze; it is a button in tab order with an accessible name.',
    words: "The property office's letter, read in your hand. The game's own panel (collapsed: Decide) sits beside it.",
    commit: 'Only the panel\'s "Pay $15.00", which states the cash before and after. Reading or putting it down costs nothing.',
    result: 'The panel reports the payment; the notice on the fridge carries a PAID stamp; the halo goes out.',
  },
  T2: {
    exists: 'An envelope on the desk (duck faces it), and the phone on the desk with a message on its screen.',
    notice: 'Halo and chip on each; the phone also shows the sender on its own screen.',
    words: "Letter: the office's words. Phone: the office's payment page or Marisol's texts. Consequences the app would not state (health) stay in the game's panel.",
    commit: 'The payment page\'s own "Pay" button (an app really has buttons), or the game panel beside a text thread.',
    result: 'The phone shows its receipt; put down, the envelope lies open on the desk.',
  },
  T3: {
    exists: "Your own notepad on the desk, which the duck faces.",
    notice: 'Halo and "Today\'s list" chip on the notepad.',
    words: 'Your handwriting: a to-do list. Choosing an item opens the game\'s panel with the exact consequence.',
    commit: 'The panel under the chosen item. Items that are not possible yet are written as "later".',
    result: 'The item is ticked and struck through; the next item becomes possible.',
  },
  T4: {
    exists: 'The thing itself: the notice, the couch with a sale tag, an empty plate on the counter.',
    notice: 'Halo, chip and gaze on the object.',
    words: "Only the game's short confirm, attached to the object. Nothing to read first.",
    commit: 'The confirm\'s verb-and-amount button. "Not now" closes it; nothing happened.',
    result: 'The room changes: the couch is gone, a bakery bag replaces the plate, the notice is stamped.',
  },
  MIX: {
    exists: 'One afternoon and the next morning, each beat in the treatment that suits it.',
    notice: 'The same halo, chip and gaze everywhere.',
    words: 'Paper is held and read (T1); phone-native beats use the phone (T2); quick object actions use a confirm (T4).',
    commit: 'Always in the game\'s own UI or an honest app, never on the paper.',
    result: 'Each object changes in place; the day bar moves the day on.',
  },
};

const NOTICE = { x: 3.6, y: 25, w: 9.5 }; // fridge door, kitchen-wide (duck side faces left, toward it)

const MOMENTS = {
  'T1-rent': { treatment: 'T1', label: 'Rent: notice on the fridge', setup: [], when: 'Day 2 · afternoon',
    scene: () => ({ area: 'kitchen', framing: 'wide', light: 'neutral', duckView: 'side' }),
    objects: (e) => [noticeObj(e, 'held-letter')] },
  'T1-breakfast': { treatment: 'T1', label: 'Breakfast: bakery flyer on the fridge', setup: ['payRent', 'evening'], when: 'Day 3 · morning',
    scene: () => ({ area: 'kitchen', framing: 'wide', light: 'window', duckView: 'side' }),
    objects: (e) => [{ id: 'flyer', svg: prop.tapedNotice({ idPrefix: uid('fl'), state: facts(e).breakfastPaid ? 'read' : 'unread' }), ...NOTICE,
      label: 'Bakery flyer on the fridge', chip: 'Breakfast', done: facts(e).breakfastPaid, activate: (el) => openFlyer(el) }] },
  'T2-rent': { treatment: 'T2', label: 'Rent: envelope, pay on the phone', setup: [], when: 'Day 2 · afternoon',
    scene: () => ({ area: 'desk-top', light: 'window', phone: { status: '3:10 PM', brand: 'MAIL', heading: ['Harbor', 'Court'], body: ['Rent due today'], note: '' } }),
    objects: (e) => [
      { id: 'envelope', svg: prop.envelope({ idPrefix: uid('en'), state: facts(e).rentPaid ? 'open' : 'closed' }), x: 13, y: 6, w: 15,
        label: worldLabels.envelope, chip: chips.envelope, chipBelow: true, done: facts(e).rentPaid, activate: (el) => openEnvelope(el) },
    ] },
  'T2-shift': { treatment: 'T2', label: 'Work: message on the phone', setup: ['payRent'], when: 'Day 2 · late afternoon',
    scene: (e) => ({ area: 'desk-side', light: 'warm', duckView: 'side',
      phone: facts(e).shiftTaken ? { status: '6:42 PM', brand: 'MESSAGES', heading: ['Marisol'], body: ['thank you!!'], note: '' }
        : { status: '6:40 PM', brand: 'MESSAGES', heading: ['Marisol'], body: ['Shift tonight?'], note: '' } }),
    objects: (e) => [{ id: 'phone', hotspot: true, x: 63, y: 17, w: 17.5, h: 58, label: worldLabels.phone, chip: chips.phone,
      done: facts(e).shiftTaken, activate: (el) => openShiftPhone(el) }] },
  'T3-list': { treatment: 'T3', label: "Notes to self: today's list", setup: [], when: 'Day 2 · afternoon',
    scene: () => ({ area: 'desk-top', light: 'window' }),
    objects: (e) => [{ id: 'notepad', hotspot: true, x: 9, y: 22, w: 26.5, h: 74, label: worldLabels.notepad, chip: chips.notepad,
      done: facts(e).rentPaid && facts(e).shiftTaken, activate: (el) => openPlanner(el) }] },
  'T4-rent': { treatment: 'T4', label: 'Rent: confirm at the notice', setup: [], when: 'Day 2 · afternoon',
    scene: () => ({ area: 'kitchen', framing: 'wide', light: 'neutral', duckView: 'side' }),
    objects: (e) => [noticeObj(e, 'popover')] },
  'T4-couch': { treatment: 'T4', label: 'Possession: sell the couch', setup: ['payRent'], when: 'Day 2 · late afternoon',
    scene: (e) => ({ area: 'living', framing: 'wide', light: 'neutral', duckView: 'side', furnishings: furnishingsFrom(e.state.assetsSold) }),
    objects: (e) => facts(e).couchSold ? [] : [{ id: 'couch', hotspot: true, x: 65, y: 33, w: 34, h: 46, label: worldLabels.couch, chip: chips.couch,
      tag: prop.saleTag({ idPrefix: uid('tg') }), activate: (el) => openPopover(el, couchSpec(), 'left') }] },
  'T4-breakfast': { treatment: 'T4', label: 'Breakfast: plate on the counter', setup: ['payRent', 'evening'], when: 'Day 3 · morning',
    scene: () => ({ area: 'kitchen', framing: 'medium', light: 'window', duckView: 'side' }),
    objects: (e) => [facts(e).breakfastPaid
      ? { id: 'bag', svg: prop.bakeryBag({ idPrefix: uid('bg') }), x: 26, y: 50, w: 7, label: 'Bakery bag', done: true }
      : { id: 'plate', svg: prop.emptyPlate({ idPrefix: uid('pl') }), x: 21, y: 66, w: 14, label: worldLabels.plate, chip: chips.plate,
        activate: (el) => openPopover(el, breakfastSpec(), 'right') }] },
  'MIX-day': { treatment: 'MIX', label: 'Recommended mix: an afternoon and a morning', setup: [], when: 'Day 2 · afternoon', chain: ['T1-rent', 'T2-shift', 'T4-breakfast'] },
};

function noticeObj(e, mode) {
  const paid = facts(e).rentPaid;
  return { id: 'notice', svg: prop.tapedNotice({ idPrefix: uid('nt'), state: paid ? 'paid' : 'unread' }), ...NOTICE,
    label: worldLabels.rentNotice, chip: chips.rentNotice, done: paid,
    activate: (el) => (mode === 'popover' ? openPopover(el, rentSpec(), 'right') : openNotice(el)) };
}

// ---------- state ----------

const ui = { engine: null, base: 0, moment: null, step: 0, busy: false, generation: 0, returnFocus: null };
const TREATMENT_LABELS = { T1: 'T1 · Held paper + decision panel', T2: 'T2 · Paper and phone', T3: 'T3 · Notes to self', T4: 'T4 · Confirm at the object', MIX: 'Mix · recommended combination' };

async function startMoment(id) {
  const generation = ++ui.generation;
  closeHeld({ instant: true });
  closePopover();
  const m = MOMENTS[id];
  ui.moment = id;
  ui.step = 0;
  $('#scene').innerHTML = '';
  $('#objects').innerHTML = '';
  $('#day-bar').innerHTML = '<span class="when">Loading…</span>';
  const loaded = await loadRentFixture('rent-paid-zero', readRepoFile);
  if (generation !== ui.generation) return;
  if (!loaded.ok) {
    $('#day-bar').innerHTML = '<strong>Stopped: the Plan 35 fixture failed its pinned checks. No synthetic state is used.</strong>';
    $('#fixture-line').textContent = loaded.checks.filter((c) => !c.pass).map((c) => `${c.name}: expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(c.actual)}`).join('; ');
    return;
  }
  ui.engine = loaded.engine;
  $('#fixture-line').textContent = `${loaded.checkpointId}: ${loaded.checks.length} pinned checks pass (lightweight loader; Plan 35's checkpoint-proof is the freshness check).`;
  const first = m.chain ? MOMENTS[m.chain[0]] : m;
  for (const a of first.setup) ACTIONS[a](ui.engine); // scripted setup, listed in the reviewer panel
  ui.base = ui.engine.log.length;
  renderAnswers(m.treatment, first.setup);
  renderRoom();
}

const current = () => { const m = MOMENTS[ui.moment]; return m.chain ? MOMENTS[m.chain[ui.step]] : m; };

function renderRoom() {
  const m = current();
  const e = ui.engine;
  const { svg } = renderScene({ idPrefix: uid('gs'), ...m.scene(e) });
  $('#scene').innerHTML = svg;
  $('#objects').innerHTML = '';
  for (const o of m.objects(e)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `obj${o.hotspot ? ' hotspot' : ''}${o.done ? ' done' : ''}`;
    b.dataset.obj = o.id;
    Object.assign(b.style, { left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, ...(o.h ? { height: `${o.h}%` } : {}) });
    b.setAttribute('aria-label', o.done ? `${o.label} (done)` : o.label);
    b.innerHTML = `${o.svg ?? ''}${o.tag ? `<span class="tag" style="position:absolute;left:8%;top:12%;width:12%">${o.tag}</span>` : ''}${o.chip && !o.done ? `<span class="chip${o.chipBelow ? ' below' : ''}" aria-hidden="true">${esc(o.chip)}</span>` : ''}`;
    // Done objects stay focusable (focus returns to them after putting something down) but do nothing.
    if (o.done || !o.activate) b.setAttribute('aria-disabled', 'true');
    if (o.activate && !o.done) b.addEventListener('click', () => { if (!ui.busy) o.activate(b); });
    $('#objects').append(b);
  }
  renderDayBar();
  renderReviewer();
  $('#hud-cash').textContent = `Cash ${money(e.state.cash)} · Health ${e.state.health}`;
}

function renderDayBar() {
  const top = MOMENTS[ui.moment];
  const m = current();
  const bar = $('#day-bar');
  bar.innerHTML = `<span class="when">${esc(m.when)}</span>`;
  if (!top.chain) return;
  const e = ui.engine;
  const nexts = [
    facts(e).rentPaid ? { label: 'Later that afternoon', go: () => { ui.step = 1; renderRoom(); } } : null,
    { label: facts(e).shiftTaken ? 'Go to work (extra shift, then home)' : 'Go to work (your usual shift)', go: () => { ACTIONS.evening(e); ui.step = 2; renderRoom(); } },
    null,
  ];
  const n = nexts[ui.step];
  if (!n) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ui-button day-next';
  btn.textContent = `${n.label} →`;
  btn.style.cssText = 'width:auto;color:var(--slate-ink);background:var(--slate);border-color:var(--slate)';
  btn.addEventListener('click', () => { n.go(); $('#objects .obj:not(.done)')?.focus(); });
  bar.append(btn);
}

// ---------- layer 2: held ----------

function flip(fromEl, toEl, reverse = false) {
  if (reducedMotion() || !fromEl || !toEl) return Promise.resolve();
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  if (!a.width || !b.width) return Promise.resolve();
  const dx = a.left + a.width / 2 - (b.left + b.width / 2);
  const dy = a.top + a.height / 2 - (b.top + b.height / 2);
  const s = Math.max(.05, a.width / b.width);
  const away = { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(-4deg)`, opacity: .2 };
  const home = { transform: getComputedStyle(toEl).transform === 'none' ? 'none' : getComputedStyle(toEl).transform, opacity: 1 };
  const anim = toEl.animate(reverse ? [home, away] : [away, home], { duration: reverse ? 220 : 320, easing: 'cubic-bezier(.2,.8,.2,1)', fill: reverse ? 'forwards' : 'backwards' });
  // A page that is not being drawn may never finish an animation; never let that block putting something down.
  const timeout = new Promise((resolve) => setTimeout(resolve, (reverse ? 220 : 320) + 120));
  return Promise.race([anim.finished.catch(() => {}), timeout]);
}

function openHeld(fromEl, objectHtml, { label, decision }) {
  ui.returnFocus = fromEl;
  const held = $('#held');
  held.innerHTML = '';
  held.hidden = false;
  held.setAttribute('role', 'dialog');
  held.setAttribute('aria-modal', 'true');
  held.setAttribute('aria-label', label);
  const obj = document.createElement('div');
  obj.className = 'held-object';
  obj.innerHTML = objectHtml;
  held.append(obj);
  if (decision) held.append(decision);
  $('.layout').inert = true;
  document.body.append(held); // keep the dialog outside the inert layout
  flip(fromEl, obj.firstElementChild);
  (obj.querySelector('h2') ?? obj.firstElementChild)?.setAttribute('tabindex', '-1');
  (obj.querySelector('h2') ?? obj.firstElementChild)?.focus();
  return obj;
}

async function closeHeld({ instant = false } = {}) {
  const held = $('#held');
  if (!held || held.hidden) return;
  const obj = held.querySelector('.held-object > *');
  if (!instant) await flip(ui.returnFocus, obj, true);
  held.hidden = true;
  held.innerHTML = '';
  $('.layout').inert = false;
  $('#room').append(held);
  if (instant) return;
  renderRoom();
  const id = ui.returnFocus?.dataset.obj;
  ($(`#objects [data-obj="${id}"]`) ?? $('#objects .obj'))?.focus();
}
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!$('#held').hidden) { ev.preventDefault(); closeHeld(); } else if (ui.popover) { ev.preventDefault(); closePopover(true); }
});

const letterHtml = (l, { stamped = false, flyer = false } = {}) => `
  <article class="letter${flyer ? ' flyer' : ''}${stamped ? ' stamped' : ''}">
    <p class="sender">${esc(l.sender)}</p>
    <h2>${esc(l.heading)}</h2>
    ${l.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
    <footer>${esc(l.footer)}</footer>
  </article>`;

// ---------- layer 3: the game's decision panel ----------

/** Collapsed by default (owner D13). The only commitment is its confirm button. */
function decisionPanel(spec, { onConfirm, onBack, expanded = false }) {
  const panel = document.createElement('section');
  panel.className = 'decide';
  const bodyId = uid('db');
  panel.innerHTML = `
    <button type="button" class="decide-toggle" aria-expanded="${expanded}" aria-controls="${bodyId}">Decide<span class="visually-hidden">: ${esc(spec.heading)}</span></button>
    <div class="decide-body" id="${bodyId}"${expanded ? '' : ' hidden'}>
      <h3>${esc(spec.heading)}</h3>
      ${spec.lines.map((l) => `<p class="fact">${esc(l)}</p>`).join('')}
      <div class="decide-actions">
        ${spec.confirm ? `<button type="button" class="ui-button" data-act="confirm">${esc(spec.confirm)}</button>` : ''}
        <button type="button" class="ui-button secondary" data-act="back">${esc(spec.back)}</button>
      </div>
    </div>`;
  const toggle = $('.decide-toggle', panel);
  const body = $('.decide-body', panel);
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    body.hidden = !open;
    if (open) $('h3', body).setAttribute('tabindex', '-1'), $('h3', body).focus();
  });
  panel.addEventListener('click', (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') onBack();
    if (act === 'confirm') guarded(panel, onConfirm);
  });
  return panel;
}

/** One commitment per activation: busy flag plus disabled controls; billExpense is also idempotent per bill. */
function guarded(scope, fn) {
  if (ui.busy) return;
  ui.busy = true;
  for (const b of scope.querySelectorAll('button')) b.disabled = true;
  try { fn(); } finally { ui.busy = false; }
}

function showResult(panel, res, { done = 'Put it down', onDone = () => closeHeld() } = {}) {
  panel.innerHTML = `<div class="decide-body result-body"><h3 tabindex="-1">${esc(res.heading)}</h3>${res.lines.map((l) => `<p class="fact">${esc(l)}</p>`).join('')}
    <div class="decide-actions"><button type="button" class="ui-button" data-act="done">${esc(done)}</button></div></div>`;
  panel.classList.add('result');
  $('[data-act="done"]', panel).addEventListener('click', onDone);
  $('h3', panel).focus();
  renderReviewer();
  $('#hud-cash').textContent = `Cash ${money(ui.engine.state.cash)} · Health ${ui.engine.state.health}`;
  $('#status').textContent = res.heading;
}

const rentSpec = () => { const p = preview(ui.engine, 'payRent'); return { action: 'payRent', ...decide.payRent({ amount: RENT, cashBefore: p.before.cash, cashAfter: p.after.cash }),
  result: () => results.rentPaid({ amount: RENT, cashAfter: ui.engine.state.cash, wage: GAME_CONSTANTS.WAGE_DAILY }) }; };
const shiftSpec = () => { const p = preview(ui.engine, 'takeShift'); return { action: 'takeShift', ...decide.takeShift({ pay: p.after.cash - p.before.cash, health: p.before.health, healthAfter: p.after.health, cashAfter: p.after.cash }),
  result: () => results.shiftTaken({ pay: p.after.cash - p.before.cash, healthAfter: ui.engine.state.health, cashAfter: ui.engine.state.cash }) }; };
const couchSpec = () => { const p = preview(ui.engine, 'sellCouch'); return { action: 'sellCouch', ...decide.sellCouch({ gain: p.after.cash - p.before.cash, cashAfter: p.after.cash }),
  result: () => results.couchSold({ gain: p.after.cash - p.before.cash, cashAfter: ui.engine.state.cash }) }; };
const breakfastSpec = () => { const p = preview(ui.engine, 'breakfast'); return { action: 'breakfast', ...decide.getBreakfast({ amount: FOOD, cashBefore: p.before.cash, cashAfter: p.after.cash }),
  result: () => results.breakfastBought({ amount: FOOD, cashAfter: ui.engine.state.cash }) }; };

function commit(spec) {
  const before = ui.engine.log.length;
  ACTIONS[spec.action](ui.engine);
  if (ui.engine.log.length === before) throw new Error(`${spec.action} appended nothing`);
}

// ---------- T1: held letter + panel ----------

function openNotice(el) {
  const spec = rentSpec();
  const panel = decisionPanel(spec, { onBack: () => closeHeld(), onConfirm: () => {
    commit(spec);
    $('#held .letter')?.classList.add('stamped');
    showResult(panel, spec.result());
  } });
  openHeld(el, letterHtml(noticeLetter({ amount: RENT, unit: '4B' })), { label: 'Rent notice, held', decision: panel });
}

function openFlyer(el) {
  const spec = breakfastSpec();
  const flyer = { sender: 'The bakery downstairs', heading: 'Breakfast, from 7 a.m.',
    paragraphs: ['A breakfast roll and a coffee, ready when you come down.', `Breakfast: ${money(FOOD)}.`], footer: 'Ground floor, Harbor Court' };
  const panel = decisionPanel(spec, { onBack: () => closeHeld(), onConfirm: () => { commit(spec); showResult(panel, spec.result()); } });
  openHeld(el, letterHtml(flyer, { flyer: true }), { label: 'Bakery flyer, held', decision: panel });
}

// ---------- T2: envelope -> phone ----------

function phoneHtml({ status, app, body, actions = '' }) {
  return `<div class="phone-held"><div class="phone-screen">
    <div class="phone-status" aria-hidden="true"><span>${esc(status)}</span><span>● ● ●</span></div>
    <h2 class="phone-app-bar">${esc(app)}</h2>
    <div class="phone-body">${body}</div>
    ${actions ? `<div class="phone-actions">${actions}</div>` : ''}
  </div></div>`;
}

function openEnvelope(el) {
  const panel = decisionPanel({ heading: 'Pay this rent', lines: ['The office takes payment on its online page.', 'Nothing is paid until you confirm on the phone.'], confirm: 'Use your phone', back: 'Put it down' },
    { onBack: () => closeHeld(), onConfirm: () => { ui.busy = false; openPortal(el); } });
  openHeld(el, letterHtml(noticeLetter({ amount: RENT, unit: '4B' })), { label: 'Rent letter, held', decision: panel });
}

function openPortal(fromEl) {
  const p = preview(ui.engine, 'payRent');
  const page = portalPage({ amount: RENT, cash: p.before.cash });
  const body = `${page.rows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}
    <div class="row"><span>Cash on hand after</span><strong>${esc(money(p.after.cash))}</strong></div><p class="note">${esc(page.note)}</p>`;
  const actions = `<button type="button" class="app-button" data-act="pay">Pay ${esc(money(RENT))}</button><button type="button" class="app-button secondary" data-act="back">Back</button>`;
  const obj = openHeld(fromEl, phoneHtml({ status: '3:12 PM', app: `Harbor Court · ${page.title}`, body, actions }), { label: 'Phone, held: rent payment page' });
  obj.addEventListener('click', (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') closeHeld();
    if (act === 'pay') guarded(obj, () => {
      ACTIONS.payRent(ui.engine);
      const r = results.rentPaid({ amount: RENT, cashAfter: ui.engine.state.cash, wage: GAME_CONSTANTS.WAGE_DAILY });
      $('.phone-body', obj).innerHTML = `<p><strong>${esc(r.heading)}</strong></p>${r.lines.map((l) => `<p>${esc(l)}</p>`).join('')}`;
      $('.phone-actions', obj).innerHTML = '<button type="button" class="app-button" data-act="back">Done</button>';
      $('.phone-actions .app-button', obj).focus();
      renderReviewer();
      $('#hud-cash').textContent = `Cash ${money(ui.engine.state.cash)} · Health ${ui.engine.state.health}`;
    });
  });
}

function openShiftPhone(el) {
  const spec = shiftSpec();
  const thread = marisolThread({ pay: shiftPayOf(ui.engine) }).map((t) => `<p class="bubble${t.from === 'You' ? ' you' : ''}">${esc(t.text)}</p>`).join('');
  // A text thread would not state the health cost, so the commitment stays in the game's panel beside the phone.
  const panel = decisionPanel(spec, { onBack: () => closeHeld(), onConfirm: () => {
    commit(spec);
    $('#held .phone-body').insertAdjacentHTML('beforeend', '<p class="bubble you">I can cover it.</p><p class="bubble">thank you!!</p>');
    showResult(panel, spec.result());
  } });
  openHeld(el, phoneHtml({ status: '6:40 PM', app: 'Marisol · Harbor Street Diner', body: thread }), { label: 'Phone, held: messages from Marisol', decision: panel });
}

// ---------- T3: notes to self ----------

function openPlanner(el) {
  const e = ui.engine;
  const page = plannerPage({ rent: RENT, shiftPay: shiftPayOf(e) });
  const items = () => page.items.map((it) => {
    const f = facts(e);
    const ticked = it.id === 'rent' ? f.rentPaid : f.shiftTaken;
    const later = it.id === 'shift' && !f.rentPaid;
    return `<li><button type="button" class="item${ticked ? ' ticked' : ''}" data-item="${it.id}" ${later || ticked ? 'aria-disabled="true"' : ''}>
      <span class="box" aria-hidden="true"></span><span class="text">${esc(it.text)}</span>${later ? '<span class="later">(after rent)</span>' : ''}${ticked ? '<span class="visually-hidden"> (done)</span>' : ''}</button></li>`;
  }).join('');
  const html = `<article class="planner"><h2>${esc(page.heading)}</h2><ul>${items()}</ul></article>`;
  const panelSlot = document.createElement('div');
  panelSlot.className = 'decide-slot';
  const obj = openHeld(el, html, { label: 'Your notepad, held', decision: panelSlot });
  const choose = (id) => {
    const spec = id === 'rent' ? rentSpec() : shiftSpec();
    const panel = decisionPanel(spec, { expanded: true, onBack: () => { panelSlot.innerHTML = ''; $(`[data-item="${id}"]`, obj)?.focus(); }, onConfirm: () => {
      commit(spec);
      $('ul', obj).innerHTML = items();
      showResult(panel, spec.result(), { done: 'Back to the list', onDone: () => { panelSlot.innerHTML = ''; ($('.item:not([aria-disabled])', obj) ?? $('h2', obj)).focus(); } });
    } });
    panelSlot.replaceChildren(panel);
    $('h3', panel).setAttribute('tabindex', '-1');
    $('h3', panel).focus();
  };
  obj.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-item]');
    if (b && b.getAttribute('aria-disabled') !== 'true') choose(b.dataset.item);
  });
  panelSlot.insertAdjacentHTML('beforeend', '<button type="button" class="ui-button secondary" data-act="putdown" style="width:auto;color:var(--slate);border-color:var(--slate)">Put it down</button>');
  $('[data-act="putdown"]', panelSlot).addEventListener('click', () => closeHeld());
}

// ---------- T4: anchored confirm ----------

function openPopover(el, spec, side) {
  closePopover();
  ui.returnFocus = el;
  const room = $('#room').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const pop = document.createElement('section');
  pop.className = `popover arrow-${side === 'right' ? 'left' : 'right'}`;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-labelledby', 'pop-h');
  pop.innerHTML = `<h3 id="pop-h" tabindex="-1">${esc(spec.heading)}</h3>${spec.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
    <div class="decide-actions"><button type="button" class="ui-button" data-act="confirm">${esc(spec.confirm)}</button>
    <button type="button" class="ui-button secondary" data-act="back">${esc(spec.back)}</button></div>`;
  const top = Math.max(0, r.top - room.top - 8);
  if (side === 'right') pop.style.left = `${r.right - room.left + 14}px`;
  else pop.style.right = `${room.right - r.left + 14}px`;
  pop.style.top = `${top}px`;
  $('#popover-layer').append(pop);
  ui.popover = pop;
  if (!reducedMotion()) pop.animate([{ opacity: 0, transform: `translateX(${side === 'right' ? -8 : 8}px)` }, { opacity: 1, transform: 'none' }], { duration: 160, easing: 'ease-out' });
  pop.addEventListener('click', (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') closePopover(true);
    if (act === 'confirm') guarded(pop, () => {
      commit(spec);
      const res = spec.result();
      pop.innerHTML = `<h3 id="pop-h" tabindex="-1">${esc(res.heading)}</h3>${res.lines.map((l) => `<p>${esc(l)}</p>`).join('')}
        <div class="decide-actions"><button type="button" class="ui-button" data-act="done">OK</button></div>`;
      $('h3', pop).focus();
      $('#status').textContent = res.heading;
      renderReviewer();
      $('#hud-cash').textContent = `Cash ${money(ui.engine.state.cash)} · Health ${ui.engine.state.health}`;
    });
    if (act === 'done') { closePopover(false); renderRoom(); ($('#objects .obj') ?? $('#day-bar button'))?.focus(); }
  });
  $('h3', pop).focus();
}

function closePopover(refocus = false) {
  if (!ui.popover) return;
  ui.popover.remove();
  ui.popover = null;
  if (refocus) ui.returnFocus?.focus();
}

// ---------- reviewer ----------

function renderAnswers(t, setup) {
  const a = ANSWERS[t];
  $('#answers').innerHTML = [['1 What exists', a.exists], ['2 How it is noticed', a.notice], ['3 Whose words', a.words], ['4 Where commitment happens', a.commit], ['5 What changes', a.result],
    ['Scripted setup', setup.length ? setup.join(' → ') : 'none']].map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
}

function renderReviewer() {
  const e = ui.engine;
  if (!e) return;
  const s = e.state;
  $('#snapshot').textContent = JSON.stringify({ step: s.step, activeModal: s.activeModal, day: s.day, cash: s.cash, health: s.health, assetsSold: s.assetsSold, billsSettled: s.billsSettled }, null, 1);
  $('#events').innerHTML = e.log.entries.filter((x) => x.seq >= ui.base).map((x) => `<li>${esc(x.type)} ${esc(JSON.stringify(x.payload))}</li>`).join('');
}

// ---------- controls ----------

const tSel = $('#treatment');
const mSel = $('#moment');
tSel.innerHTML = Object.entries(TREATMENT_LABELS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
function fillMoments() {
  mSel.innerHTML = Object.entries(MOMENTS).filter(([, m]) => m.treatment === tSel.value).map(([k, m]) => `<option value="${k}">${esc(m.label)}</option>`).join('');
}
tSel.addEventListener('change', () => { fillMoments(); startMoment(mSel.value); });
mSel.addEventListener('change', () => startMoment(mSel.value));
$('#reset').addEventListener('click', () => startMoment(mSel.value));
const applyGuidance = () => { $('#room').className = `room guidance-${$('#guidance').value}`; };
$('#guidance').addEventListener('change', applyGuidance);
const initial = params.get('m');
if (initial && MOMENTS[initial]) tSel.value = MOMENTS[initial].treatment;
fillMoments();
if (initial && MOMENTS[initial]) mSel.value = initial;
applyGuidance();
startMoment(mSel.value).catch((err) => { $('#day-bar').innerHTML = `<strong>Gallery could not start: ${esc(err.message)}</strong>`; console.error(err); });
