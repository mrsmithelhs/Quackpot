import { projectReceipt } from '../core/receipt.mjs';
import { presentReceipt } from './receipt-presentation.mjs';
import './receipt-view.css';

const esc = value => String(value ?? 'Unavailable').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const seq = value => Number.isFinite(value) ? `[#${value}] ` : '';
const lines = items => items.length ? `<ul>${items.map(item => `<li>${esc(seq(item.seq) + (item.register ? `${item.register}: ` : '') + item.text)}</li>`).join('')}</ul>` : '<p>No additional record available.</p>';
const amount = value => Number.isFinite(value) ? `$${value.toFixed(2)}` : 'Unavailable';
const odds = value => Number.isFinite(value) && value >= 0 && value <= 1 ? `${(value * 100).toFixed(4).replace(/\.?0+$/, '')}%` : 'Unavailable';
const entry = item => `<li><span>${esc(seq(item.seq))}</span>${esc(item.register ? `${item.register}: ` : '')}${esc(item.text)}</li>`;
const cards = findings => findings.map(f => `<article class="receipt-card"><h3>${esc(f.label)}</h3><div class="receipt-register"><strong>We displayed</strong>${lines(f.displayed.slice(0, 1))}</div><div class="receipt-register"><strong>You did / game recorded</strong>${lines(f.did.slice(0, 2))}</div><div class="receipt-register"><strong>Did this affect you?</strong><p>${esc(f.question.text)}</p></div><details><summary>All supporting records</summary><h4>We displayed</h4>${lines(f.displayed)}<h4>You did / game recorded</h4>${lines(f.did)}<h4>Display evidence</h4><ul>${(f.displayEvidence ?? []).map(e => `<li>${esc(seq(e.seq))}${esc(e.type)}: ${esc(JSON.stringify(e.payload))}</li>`).join('')}</ul></details></article>`).join('');

export function renderReceiptView(container, engine, callbacks = {}) {
  const receipt = projectReceipt(engine.log.entries);
  const view = presentReceipt(receipt);
  const routes = { run_complete: 'Run complete', uninstall: 'Uninstalled early', running_on_empty: 'Running on empty' };
  const totals = view.totals;
  container.innerHTML = `<div class="receipt-container"><main class="receipt-paper plan44-receipt" id="receipt-paper">
    <header><p class="receipt-eyebrow">Quackpot · Your time in the pond</p><h1>Your Receipt</h1><p>Look back at what appeared, what happened, and what you think about it.</p><p><strong>Ending:</strong> ${esc(routes[receipt.terminalRoute] ?? receipt.terminalRoute ?? 'Unavailable')}</p></header>
    <section><h2>Your run at a glance</h2><div class="receipt-totals">${[['Cash', totals ? amount(totals.finalCash) : 'Unavailable'], ['Health', totals && Number.isFinite(totals.finalHealth) ? `${totals.finalHealth} HP` : 'Unavailable'], ['Debt', totals ? amount(totals.finalDebt) : 'Unavailable'], ['Digital ducks', totals && Number.isFinite(totals.ownedDucksCount) ? totals.ownedDucksCount : 'Unavailable'], ['Down', totals && Number.isFinite(totals.totalDown) ? totals.totalDown : 'Unavailable']].map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div></section>
    <section><h2>Things to reflect on</h2><p>These questions are yours to answer.</p>${view.findings.length ? `<div class="receipt-cards">${cards(view.findings)}</div>` : '<p>No technique display was recorded in the available record.</p>'}</section>
    <section><h2>Races</h2><p>${view.raceCounts.map(([label, n]) => `${esc(label)}: ${n}`).join(' · ')}</p><details><summary>Race records in order (${view.race.length})</summary><ol>${view.race.map(entry).join('')}</ol><p>${esc(receipt.raceEvidence.question.text)}</p></details></section>
    <section><h2>Draws and transactions</h2><p>${view.draws.length} draws committed · ${view.revealedCount} revealed</p><details><summary>Draw results and recorded odds</summary>${view.draws.map(d => `<article class="receipt-draw"><h3>Draw ${esc(d.drawIndex)} of ${esc(d.of)} <small>${esc(seq(d.committedSeq))}</small></h3><p>Game recorded: ${esc(d.committed.identity)} · ${esc(d.committed.rarity)} · ${d.committed.duplicate === true ? `duplicate, ${esc(d.committed.downGained)} Down` : d.committed.duplicate === false ? 'new' : 'duplicate status unavailable'}</p><p>Pre-draw odds — Legendary ${odds(d.preDrawOdds?.legendary)} · Rare ${odds(d.preDrawOdds?.rare)} · Common ${odds(d.preDrawOdds?.common)}</p><p>${d.revealed ? `Displayed ${esc(seq(d.revealSeq))}: ${esc(d.displayed?.identity)} · ${esc(d.displayed?.rarity)} · ${d.displayed?.duplicate === true ? `duplicate, ${esc(d.displayed?.downGained)} Down` : d.displayed?.duplicate === false ? 'new' : 'duplicate status unavailable'}` : 'No reveal recorded for this draw.'}</p></article>`).join('') || '<p>No draws recorded.</p>'}</details><details><summary>Purchase transactions (${view.purchases.length})</summary><p>Purchases are listed separately from draws.</p><ul>${view.purchases.map(p => `<li>${esc(seq(p.seq))}${esc(p.payload?.kind)} · ${Number.isFinite(p.payload?.cost) ? `${esc(p.payload.cost)} gems` : 'Gem cost unavailable'} · ${esc(amount(p.payload?.price))}</li>`).join('')}</ul></details></section>
    <section><h2>Life and accounting</h2><p>Payments, obligations, and other recorded moments.</p><p>${view.expenseCounts ? view.expenseCounts.map(([status, count]) => `${esc(status.replaceAll('_', ' '))}: ${count}`).join(' · ') : 'Expense status unavailable for this record.'}</p><details><summary>Life and accounting records</summary>${lines(view.accounting)}${view.expenses.length ? `<h3>Expense records</h3><ul>${view.expenses.map(e => `<li>${esc(seq(e.seq))}${esc(e.kind)}: ${esc(e.status)}; due ${esc(amount(e.dueAmount))}, paid ${esc(amount(e.paidAmount))}, waived ${esc(amount(e.waivedAmount))}${e.paidSeq !== null ? ` (payment ${esc(seq(e.paidSeq).trim())})` : ''}</li>`).join('')}</ul>` : '<p>No expense summary is available for this record.</p>'}</details><details><summary>Supporting event details</summary><p>These are recorded event fields, in order.</p><ul>${view.evidence.filter(e => !['run_started', 'race_choice_offered', 'race_trial_offer_shown', 'race_cue_displayed', 'race_playback_action', 'race_result', 'race_attempt_unresolved', 'race_rest_policy_activated', 'purchase', 'draw_committed', 'reveal_shown'].includes(e.type)).map(e => `<li>${esc(seq(e.seq))}${esc(e.type)}: ${esc(JSON.stringify(e.payload))}</li>`).join('')}</ul></details></section>
    <footer><button id="btn-fresh-run" class="btn btn-primary btn-lg">Start fresh run</button></footer></main></div>`;
  engine.recordReceiptPresented();
  callbacks.onPresented?.();
  container.querySelector('#btn-fresh-run')?.addEventListener('click', () => callbacks.onFreshRun?.());
}

// Temporarily open native disclosures for print and restore the reader's choices.
if (typeof window !== 'undefined') {
  let openedForPrint = [];
  window.addEventListener('beforeprint', () => {
    openedForPrint = [...document.querySelectorAll('.plan44-receipt details:not([open])')];
    openedForPrint.forEach(detail => { detail.open = true; });
  });
  window.addEventListener('afterprint', () => { openedForPrint.forEach(detail => { detail.open = false; }); openedForPrint = []; });
}



