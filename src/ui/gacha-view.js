// src/ui/gacha-view.js
// Promotional 10-Pull theater with truthful commit-before-reveal card flipping.

import { BANNER_1_ROSTER } from '../core/game-engine.mjs';

export function renderGachaView(container, engine, callbacks = {}) {
  const { onClaimPull, onRevealCard, onRevealCardAtIndex, onRevealAll, onProceed } = callbacks;
  const pending = engine.state.pendingReveals || [];
  const hasPending = pending.length > 0;
  const allRevealed = hasPending && pending.every((d) => d.revealed);
  const unrevealedCount = pending.filter((d) => !d.revealed).length;

  container.innerHTML = `
    <div class="gacha-container">
      <div class="gacha-banner-card">
        <div class="gacha-banner-header">
          <div class="banner-tag">Promotional Welcome Event</div>
          <h2>Pond of Destiny</h2>
          <p class="banner-sub">Free 10-Pull • Guaranteed to Start Your Digital Duck Racing Team</p>
          <div class="odds-pill-bar">
            <span class="odds-tag odds-common">Common: 80%</span>
            <span class="odds-tag odds-rare">Rare: 18%</span>
            <span class="odds-tag odds-legendary">Legendary: 2%</span>
          </div>
        </div>

        ${!hasPending ? `
          <div class="gacha-claim-section">
            <p class="gacha-prompt">
              The app presents an eye-catching golden button. No gems or cash are required for this first promotional roll!
            </p>
            <button id="btn-claim-pull" class="btn btn-gold btn-lg">
              ✨ Claim Free 10-Pull! ✨
            </button>
          </div>
        ` : `
          <div class="gacha-theater">
            <div class="gacha-theater-header">
              <span class="gacha-theater-status">
                ${allRevealed ? '✓ All 10 ducks revealed!' : `Cards waiting: ${unrevealedCount} unrevealed`}
              </span>
              ${!allRevealed ? `
                <div class="gacha-theater-actions">
                  <button id="btn-reveal-next" class="btn btn-primary btn-sm">
                    Flip Next Card
                  </button>
                  <button id="btn-reveal-all" class="btn btn-secondary btn-sm">
                    Reveal All
                  </button>
                </div>
              ` : ''}
            </div>

            <div class="card-grid">
              ${pending.map((card, idx) => {
                const duckDef = BANNER_1_ROSTER.find((d) => d.id === card.identity);
                const name = duckDef?.name || card.identity;
                const speed = duckDef?.speed || 10.0;

                if (!card.revealed) {
                  return `
                    <div class="duck-card card-back" data-card-idx="${idx}" title="Click to flip Card #${idx + 1}">
                      <div class="card-back-pattern">🦆</div>
                      <div class="card-back-num">#${idx + 1}</div>
                      <div class="card-back-tap">Click to flip #${idx + 1}</div>
                    </div>
                  `;
                }

                return `
                  <div class="duck-card card-revealed card-tier-${card.rarity}">
                    <div class="card-tier-badge tier-${card.rarity}">
                      ${card.rarity.toUpperCase()}
                    </div>
                    <div class="card-art-icon">🦆</div>
                    <div class="card-duck-name">${name}</div>
                    <div class="card-duck-stat">Speed: ${speed.toFixed(1)}</div>
                    ${card.duplicate ? `
                      <div class="card-duplicate-pill">
                        +${card.downGained} Down
                      </div>
                    ` : `
                      <div class="card-new-pill">NEW!</div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>

            ${allRevealed ? `
              <div class="gacha-complete-section">
                <div class="gacha-summary">
                  <h3>Opening Team Assembled!</h3>
                  <p>You have ${engine.state.owned.length} unique ducks in your digital stable.</p>
                  ${engine.state.down > 0 ? `<p class="down-note">Duplicate ducks converted to <strong>${engine.state.down} Down</strong>.</p>` : ''}
                </div>
                <button id="btn-gacha-proceed" class="btn btn-primary btn-lg">
                  Next: Morning Breakfast Expense ($5.00) ➔
                </button>
              </div>
            ` : ''}
          </div>
        `}
      </div>
    </div>
  `;

  const btnClaim = container.querySelector('#btn-claim-pull');
  if (btnClaim && onClaimPull) {
    btnClaim.addEventListener('click', onClaimPull);
  }

  const btnNext = container.querySelector('#btn-reveal-next');
  if (btnNext && onRevealCard) {
    btnNext.addEventListener('click', onRevealCard);
  }

  const btnAll = container.querySelector('#btn-reveal-all');
  if (btnAll && onRevealAll) {
    btnAll.addEventListener('click', onRevealAll);
  }

  const btnProceed = container.querySelector('#btn-gacha-proceed');
  if (btnProceed && onProceed) {
    btnProceed.addEventListener('click', onProceed);
  }

  // Bind exact card index click handler (P1 repair)
  const cardBacks = container.querySelectorAll('.card-back');
  cardBacks.forEach((el) => {
    el.addEventListener('click', () => {
      const idx = Number(el.getAttribute('data-card-idx'));
      if (typeof onRevealCardAtIndex === 'function') {
        onRevealCardAtIndex(idx);
      } else if (typeof onRevealCard === 'function') {
        onRevealCard();
      }
    });
  });
}
