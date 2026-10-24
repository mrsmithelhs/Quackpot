// src/ui/receipt-view.js
// Printed-slip Receipt component rendering the three registers and accounting ledger.
// Strictly presents the Receipt in DOM, then records receipt_shown and checkpoints the tail.

import { projectReceipt } from '../core/receipt.mjs';

export function renderReceiptView(container, engine, callbacks = {}) {
  const { onFreshRun, onPresented } = callbacks;

  // Project receipt from log events
  let receipt = projectReceipt(engine.log.entries);

  const routeLabels = {
    run_complete: 'Run Complete (Day 3 Championship Settled)',
    uninstall: 'Early Uninstall (Exit Friction / Retention Tested)',
    running_on_empty: 'Running On Empty (Unpaid Bill / Escalation Exhausted)',
  };

  const routeLabel = routeLabels[receipt.terminalRoute] || receipt.terminalRoute || 'Unknown';

  // Mount markup into the DOM
  container.innerHTML = `
    <div class="receipt-container">
      <div class="receipt-paper" id="receipt-paper">
        <div class="receipt-header">
          <div class="receipt-cutout">----------------------------------------</div>
          <div class="receipt-title">QUACKPOT TRANSACTION RECEIPT</div>
          <div class="receipt-subtitle">CourseVGD Critical Microtransaction Audit</div>
          <div class="receipt-cutout">----------------------------------------</div>
          <div class="receipt-meta-grid">
            <div>Terminal Route: <strong>${routeLabel}</strong></div>
            <div>Append-Only Chain: <strong class="${receipt.chainValid ? 'text-success' : 'text-danger'}">${receipt.chainValid ? 'VERIFIED (FNV-1a)' : 'CORRUPT'}</strong></div>
            <div>Record Status: <strong id="receipt-pair-status" class="text-success">RECORD LOCKED (Tail Complete)</strong></div>
          </div>
        </div>

        <section class="receipt-section">
          <h3 class="receipt-section-title">SECTION I: MANIPULATION CATALOG</h3>
          <p class="receipt-section-note">Grounded solely in append-only event evidence. Only cues actually displayed are named.</p>

          ${receipt.findings.length === 0 ? `
            <div class="receipt-empty-note">No manipulative cues were displayed during this abbreviated session.</div>
          ` : `
            <div class="receipt-findings-list">
              ${receipt.findings.map((f, idx) => `
                <div class="receipt-finding-card">
                  <div class="finding-badge">Technique #${idx + 1}: ${f.label}</div>
                  
                  <div class="register-block reg-displayed">
                    <div class="reg-label">1. WE DISPLAYED:</div>
                    <ul class="reg-list">
                      ${f.displayed.map((d) => `<li><span class="seq-tag">[#${d.seq ?? '-'}]</span> ${d.text}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="register-block reg-did">
                    <div class="reg-label">2. YOU DID:</div>
                    <ul class="reg-list">
                      ${f.did.map((d) => `<li><span class="seq-tag">[#${d.seq ?? '-'}]</span> ${d.text}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="register-block reg-question">
                    <div class="reg-label">3. DID THIS AFFECT YOU? (Reflection):</div>
                    <div class="question-text">"${f.question.text}"</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </section>

        <section class="receipt-section">
          <h3 class="receipt-section-title">SECTION II: FINANCIAL & HEALTH ACCOUNTING</h3>
          <div class="accounting-ledger">
            ${receipt.accounting?.lines?.length ? `
              <ul class="accounting-list">
                ${receipt.accounting.lines.map((l) => `
                  <li><span class="seq-tag">[#${l.seq ?? '-'}]</span> ${l.text}</li>
                `).join('')}
              </ul>
            ` : `
              <div class="receipt-empty-note">No financial transactions recorded.</div>
            `}

            <div class="accounting-summary-box">
              <div class="summary-row"><span>Final Cash Balance (Log-derived):</span><strong>$${receipt.summary.finalCash.toFixed(2)}</strong></div>
              <div class="summary-row"><span>Final Health (Log-derived):</span><strong>${receipt.summary.finalHealth} HP</strong></div>
              <div class="summary-row"><span>Final Accumulated Debt:</span><strong>$${receipt.summary.finalDebt.toFixed(2)}</strong></div>
              <div class="summary-row"><span>Total Digital Ducks Owned:</span><strong>${receipt.summary.ownedDucksCount}</strong></div>
              <div class="summary-row"><span>Secondary Currency (Down):</span><strong>${receipt.summary.totalDown}</strong></div>
            </div>
          </div>
        </section>

        <section class="receipt-section">
          <h3 class="receipt-section-title">SECTION III: GACHA PULL AUDIT LEDGER</h3>
          <p class="receipt-section-note">Comparison of committed draw results vs. what was revealed on screen.</p>
          <div class="pull-ledger-table-wrap">
            <table class="pull-ledger-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Committed Duck</th>
                  <th>Tier</th>
                  <th>Pre-Draw Odds (L / R / C)</th>
                  <th>Revealed?</th>
                  <th>Duplicate / Down</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.pullLedger.map((p) => {
                  const pL = (p.preDrawOdds.legendary * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
                  const pR = (p.preDrawOdds.rare * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
                  const pC = (p.preDrawOdds.common * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
                  return `
                    <tr>
                      <td>${p.drawIndex}</td>
                      <td>${p.committed.identity}</td>
                      <td><span class="tier-pill tier-${p.committed.rarity}">${p.committed.rarity.toUpperCase()}</span></td>
                      <td class="odds-cell">${pL} / ${pR} / ${pC}</td>
                      <td>${p.revealed ? '✓ Yes' : '❌ Unrevealed'}</td>
                      <td>${p.committed.duplicate ? `+${p.committed.downGained} Down` : 'New'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>

        <div class="receipt-footer">
          <div class="receipt-cutout">----------------------------------------</div>
          <div class="receipt-end-msg">End of Run Record • Quackpot Browser Slice</div>
          <button id="btn-fresh-run" class="btn btn-primary btn-lg">
            🔄 Start Fresh Run
          </button>
        </div>
      </div>
    </div>
  `;

  // NOW that markup is in the DOM, record actual presentation boundary and complete tail
  receipt = engine.recordReceiptPresented();

  if (onPresented) {
    onPresented();
  }

  const btnFresh = container.querySelector('#btn-fresh-run');
  if (btnFresh && onFreshRun) {
    btnFresh.addEventListener('click', onFreshRun);
  }
}
