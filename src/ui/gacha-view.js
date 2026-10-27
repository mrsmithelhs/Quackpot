// src/ui/gacha-view.js
// Promotional 10-Pull theater with truthful commit-before-reveal card flipping.

import { BANNER_1_ROSTER, DUCK_COSMETICS } from '../core/game-engine.mjs';
import { createDigitalDuckSvg } from './duck-rig-view.mjs';
import { createDuckMotionController, selectGachaDuckMotion } from './duck-motion-controller.mjs';
import { createAcquisitionQueueController } from './acquisition-queue.mjs';

function renderCard(card, idx, { revealEnter = false } = {}) {
  const duckDef = BANNER_1_ROSTER.find((d) => d.id === card.identity);
  const name = duckDef?.name || card.identity;
  const speed = duckDef?.speed || 10.0;
  const prefix = `qp-card-${Number(card.commitSeq)}`;
  const motion = selectGachaDuckMotion(card.commitSeq, card.identity);
  const revealClass = revealEnter ? ' card-reveal-enter' : '';
  return `
    <div class="duck-card card-revealed card-tier-${card.rarity}${revealClass}" data-card-idx="${idx}" data-card-key="${card.commitSeq}">
      <div class="card-tier-badge tier-${card.rarity}">
        ${card.rarity.toUpperCase()}
      </div>
      <div class="card-art-icon gacha-card-duck" data-duck-prefix="${prefix}" data-duck-motion="${motion}">
        ${createDigitalDuckSvg({ prefix, label: `${name}, ${card.rarity} digital duck` })}
      </div>
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
}

function renderCardBack(idx) {
  return `
    <div class="duck-card card-back" data-card-idx="${idx}" title="Click to flip Card #${idx + 1}">
      <div class="card-back-pattern">🦆</div>
      <div class="card-back-num">#${idx + 1}</div>
      <div class="card-back-tap">Click to flip #${idx + 1}</div>
    </div>
  `;
}

function renderCompletion(engine) {
  return `
    <div class="gacha-complete-section" data-gacha-complete>
      <div class="gacha-summary">
        <h3>Opening Team Assembled!</h3>
        <p>You have ${engine.state.owned.length} unique ducks in your digital stable.</p>
        ${engine.state.down > 0 ? `<p class="down-note">Duplicate ducks converted to <strong>${engine.state.down} Down</strong>.</p>` : ''}
      </div>
      <button id="btn-gacha-proceed" class="btn btn-primary btn-lg">
        Next: Morning Breakfast Expense ($5.00) ➔
      </button>
    </div>
  `;
}

function duplicateHelpMarkup(cue = null) {
  const payload = cue?.payload;
  if (!payload) return '<div class="duplicate-help-body" data-duplicate-help-copy></div>';
  const text = `Duplicate ducks are automatically returned and converted to Down. This ${payload.rarity} duplicate awarded ${payload.downGained} Down. Common duplicates award 1, Rare 5, and Legendary 20.`;
  return `<div class="duplicate-help-body" data-duplicate-help-copy>${text}</div>`;
}

function positionDuplicateHelp(callout, card) {
  if (!callout || !card) return;
  const target = card.getBoundingClientRect();
  if (target.width <= 0 || target.height <= 0 || target.bottom <= 0 || target.right <= 0
      || target.top >= window.innerHeight || target.left >= window.innerWidth) return false;
  const width = Math.min(360, window.innerWidth - 24);
  callout.style.width = `${width}px`;
  const computed = getComputedStyle(callout);
  const verticalChrome = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
    .reduce((sum, property) => sum + (Number.parseFloat(computed[property]) || 0), 0);
  const body = callout.querySelector('.duplicate-help-body');
  body?.style.setProperty('--duplicate-help-body-max-height', `${Math.max(40, window.innerHeight - 24 - verticalChrome)}px`);
  const height = callout.getBoundingClientRect().height;
  let left = target.right + 12;
  if (left + width > window.innerWidth - 12) left = target.left - width - 12;
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
  let top = target.top;
  if (top + height > window.innerHeight - 12) top = target.bottom - height;
  top = Math.max(12, Math.min(top, window.innerHeight - height - 12));
  const exit = document.querySelector('#btn-uninstall')?.getBoundingClientRect();
  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  const fits = (x, y) => {
    const pointer = x >= target.right ? 'left'
      : (x + width <= target.left ? 'right' : (y >= target.bottom ? 'top' : 'bottom'));
    const bounds = {
      left: x - (pointer === 'left' ? 11 : 0),
      top: y - (pointer === 'top' ? 11 : 0),
      right: x + width + (pointer === 'right' ? 11 : 0),
      bottom: y + height + (pointer === 'bottom' ? 11 : 0),
    };
    return bounds.left >= 12 && bounds.top >= 12 && bounds.right <= window.innerWidth - 12
      && bounds.bottom <= window.innerHeight - 12
      && !overlaps(bounds, target)
      && (!exit || !overlaps(bounds, exit));
  };
  const placements = [[left, top]];
  const centeredLeft = Math.max(12, Math.min(target.left + target.width / 2 - width / 2, window.innerWidth - width - 12));
  placements.push([centeredLeft, target.bottom + 12], [centeredLeft, target.top - height - 12]);
  if (exit) {
    placements.push(
      [left, exit.bottom + 12],
      [left, exit.top - height - 12],
      [exit.left - width - 12, top],
      [exit.right + 12, top],
    );
  }
  const placement = placements.find(([x, y]) => fits(x, y));
  if (!placement) return false;
  [left, top] = placement;
  callout.style.left = `${left}px`;
  callout.style.top = `${top}px`;
  const pointer = left >= target.right ? 'left'
    : (left + width <= target.left ? 'right' : (top >= target.bottom ? 'top' : 'bottom'));
  callout.dataset.pointer = pointer;
  const verticalOffset = Math.max(20, Math.min(height - 20, target.top + target.height / 2 - top));
  const horizontalOffset = Math.max(20, Math.min(width - 20, target.left + target.width / 2 - left));
  callout.style.setProperty('--pointer-offset', `${pointer === 'left' || pointer === 'right' ? verticalOffset : horizontalOffset}px`);
  return true;
}

export function renderGachaView(container, engine, callbacks = {}) {
  const {
    onClaimPull, onRevealCard, onRevealCardAtIndex, onRevealAll, onProceed,
    duckMotionPaused = false, duckMotionActive = true, onDuckMotionPauseChange,
    onDuplicateHelpShown, onDuplicateHelpDismiss,
  } = callbacks;
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
              <span class="gacha-theater-status" data-gacha-theater-status>
                ${allRevealed ? '✓ All 10 ducks revealed!' : `Cards waiting: ${unrevealedCount} unrevealed`}
              </span>
              <div class="gacha-motion-control">
                <button type="button" class="btn btn-secondary btn-sm" data-duck-motion-toggle aria-pressed="${duckMotionPaused}">
                  ${duckMotionPaused ? 'Resume duck motion' : 'Pause duck motion'}
                </button>
                <span class="gacha-motion-status" data-duck-motion-status role="status" aria-live="polite"></span>
              </div>
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
              ${pending.map((card, idx) => card.revealed ? renderCard(card, idx) : renderCardBack(idx)).join('')}
            </div>

            ${allRevealed ? `
              ${renderCompletion(engine)}
            ` : ''}
          </div>
        `}
      </div>
    </div>
  `;

  const showFastPullToast = (count) => {
    if (count <= 0) return;
    const existing = container.querySelector('.fast-pull-toast');
    existing?.remove();
    const toast = container.ownerDocument.createElement('div');
    toast.className = 'fast-pull-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = `✨ ${count} new duck${count > 1 ? 's' : ''} added to Duck-Dex!`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const acquisitionQueue = createAcquisitionQueueController(container, engine, {
    onComplete: ({ fastPull, count } = {}) => {
      if (fastPull && count > 0) {
        showFastPullToast(count);
      }
      callbacks.onAcquisitionComplete?.();
    },
  });

  const btnClaim = container.querySelector('#btn-claim-pull');
  if (btnClaim && onClaimPull) {
    btnClaim.addEventListener('click', onClaimPull);
  }

  const btnNext = container.querySelector('#btn-reveal-next');
  if (btnNext && onRevealCard) {
    btnNext.addEventListener('click', () => {
      onRevealCard();
      acquisitionQueue.enqueueReveals(engine.state.pendingReveals, { fastPull: false });
    });
  }

  const btnAll = container.querySelector('#btn-reveal-all');
  if (btnAll && onRevealAll) {
    btnAll.addEventListener('click', () => {
      onRevealAll();
      acquisitionQueue.enqueueReveals(engine.state.pendingReveals, { fastPull: true });
    });
  }

  const btnProceed = container.querySelector('#btn-gacha-proceed');
  if (btnProceed && onProceed) {
    btnProceed.addEventListener('click', onProceed);
  }

  const motionController = createDuckMotionController(container, {
    active: duckMotionActive,
    paused: duckMotionPaused,
    onPauseChange: onDuckMotionPauseChange,
  });

  let destroyed = false;
  let helpCallout = null;
  let helpWindowHandlers = null;
  let retryHelpPresentation = null;
  let helpFrame = null;
  let pendingRevealCard = null;
  let pendingRevealHandler = null;
  const removeHelpCallout = () => {
    helpCallout?.remove();
    helpCallout = null;
    if (helpWindowHandlers) {
      window.removeEventListener('resize', helpWindowHandlers.resize);
      window.removeEventListener('scroll', helpWindowHandlers.scroll, true);
      helpWindowHandlers = null;
    }
    if (retryHelpPresentation) {
      document.removeEventListener('visibilitychange', retryHelpPresentation);
      window.removeEventListener('focus', retryHelpPresentation);
      window.removeEventListener('scroll', retryHelpPresentation, true);
      window.removeEventListener('resize', retryHelpPresentation);
      retryHelpPresentation = null;
    }
    if (helpFrame !== null) {
      cancelAnimationFrame(helpFrame);
      helpFrame = null;
    }
    if (pendingRevealCard && pendingRevealHandler) {
      pendingRevealCard.removeEventListener('animationend', pendingRevealHandler);
      pendingRevealCard.removeEventListener('animationcancel', pendingRevealHandler);
    }
    pendingRevealCard = null;
    pendingRevealHandler = null;
  };
  const watchHelpPosition = (callout, card) => {
    if (helpWindowHandlers) return;
    const reposition = () => { callout.hidden = !positionDuplicateHelp(callout, card); };
    const resize = reposition;
    const scroll = reposition;
    helpWindowHandlers = { resize, scroll };
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true, capture: true });
  };
  const presentDuplicateHelp = () => {
    if (destroyed || !duckMotionActive) return;
    const help = engine.getDuplicateConversionHelpState?.();
    if (!help || help.dismissed) return;
    const card = container.querySelector(`[data-card-key="${help.reveal.payload.commitSeq}"]`);
    if (!card) return;
    if (help.cue) {
      if (!helpCallout) {
        helpCallout = container.ownerDocument.createElement('aside');
        helpCallout.className = 'duplicate-help-callout';
        helpCallout.setAttribute('aria-label', 'Duplicate conversion information');
        helpCallout.setAttribute('role', 'status');
        helpCallout.setAttribute('aria-live', 'polite');
        helpCallout.innerHTML = `${duplicateHelpMarkup(help.cue)}<button type="button" class="duplicate-help-close" aria-label="Dismiss duplicate conversion information">×</button>`;
        container.append(helpCallout);
        const close = helpCallout.querySelector('.duplicate-help-close');
        const dismiss = () => {
          const event = onDuplicateHelpDismiss?.(help.cue.seq);
          if (event) {
            removeHelpCallout();
          }
        };
        close?.addEventListener('click', dismiss);
        helpCallout.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && helpCallout.contains(container.ownerDocument.activeElement)) {
            event.preventDefault();
            dismiss();
          }
        });
        watchHelpPosition(helpCallout, card);
      }
      helpCallout.hidden = !positionDuplicateHelp(helpCallout, card);
      return;
    }
    if (helpCallout) return;
    const attempt = () => {
      if (destroyed || !duckMotionActive || !card.isConnected || document.visibilityState !== 'visible') return;
      const rect = card.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0
        && rect.top < window.innerHeight && rect.left < window.innerWidth;
      if (!visible) {
        const animation = getComputedStyle(card);
        if (card.classList.contains('card-reveal-enter') && animation.animationName !== 'none') {
          if (pendingRevealCard !== card) {
            if (pendingRevealCard && pendingRevealHandler) {
              pendingRevealCard.removeEventListener('animationend', pendingRevealHandler);
              pendingRevealCard.removeEventListener('animationcancel', pendingRevealHandler);
            }
            pendingRevealCard = card;
            pendingRevealHandler = (event) => {
              if (event.target !== card) return;
              card.removeEventListener('animationend', pendingRevealHandler);
              card.removeEventListener('animationcancel', pendingRevealHandler);
              pendingRevealCard = null;
              pendingRevealHandler = null;
              scheduleDuplicateHelp();
            };
            card.addEventListener('animationend', pendingRevealHandler);
            card.addEventListener('animationcancel', pendingRevealHandler);
          }
        }
        return;
      }
      const candidate = container.ownerDocument.createElement('aside');
      candidate.className = 'duplicate-help-callout';
      candidate.setAttribute('aria-label', 'Duplicate conversion information');
      candidate.setAttribute('role', 'status');
      candidate.setAttribute('aria-live', 'polite');
      candidate.innerHTML = `${duplicateHelpMarkup()}<button type="button" class="duplicate-help-close" aria-label="Dismiss duplicate conversion information">×</button>`;
      candidate.querySelector('[data-duplicate-help-copy]').textContent =
        `Duplicate ducks are automatically returned and converted to Down. This ${help.reveal.payload.rarity} duplicate awarded ${help.reveal.payload.downGained} Down. Common duplicates award 1, Rare 5, and Legendary 20.`;
      container.append(candidate);
      const placed = positionDuplicateHelp(candidate, card);
      if (!placed) { candidate.remove(); return; }
      const cue = onDuplicateHelpShown?.(help.reveal.seq);
      if (!cue) { candidate.remove(); return; }
      candidate.querySelector('[data-duplicate-help-copy]').textContent =
        `Duplicate ducks are automatically returned and converted to Down. This ${cue.payload.rarity} duplicate awarded ${cue.payload.downGained} Down. Common duplicates award 1, Rare 5, and Legendary 20.`;
      positionDuplicateHelp(candidate, card);
      helpCallout = candidate;
      candidate.querySelector('.duplicate-help-close')?.addEventListener('click', () => {
        const event = onDuplicateHelpDismiss?.(cue.seq);
        if (event) removeHelpCallout();
      });
      candidate.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && candidate.contains(container.ownerDocument.activeElement)) {
          event.preventDefault();
          const dismissed = onDuplicateHelpDismiss?.(cue.seq);
          if (dismissed) removeHelpCallout();
        }
      });
      watchHelpPosition(candidate, card);
    };
    attempt();
  };
  const scheduleDuplicateHelp = () => {
    if (helpFrame !== null) cancelAnimationFrame(helpFrame);
    helpFrame = requestAnimationFrame(() => {
      helpFrame = null;
      presentDuplicateHelp();
    });
  };
  presentDuplicateHelp();
  retryHelpPresentation = () => presentDuplicateHelp();
  document.addEventListener('visibilitychange', retryHelpPresentation);
  window.addEventListener('focus', retryHelpPresentation);
  window.addEventListener('scroll', retryHelpPresentation, { passive: true, capture: true });
  window.addEventListener('resize', retryHelpPresentation, { passive: true });

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
      acquisitionQueue.enqueueReveals(engine.state.pendingReveals, { fastPull: false });
    });
  });

  const update = (nextEngine) => {
    if (destroyed) return false;
    const nextPending = nextEngine.state.pendingReveals || [];
    const nextAllRevealed = nextPending.length > 0 && nextPending.every((card) => card.revealed);
    const nextUnrevealedCount = nextPending.filter((card) => !card.revealed).length;
    const cardGrid = container.querySelector('.card-grid');
    const theaterStatus = container.querySelector('[data-gacha-theater-status]');
    if (!cardGrid || !theaterStatus) return false;

    let addedCard = false;
    for (const [idx, card] of nextPending.entries()) {
      if (!card.revealed) continue;
      const current = cardGrid.querySelector(`[data-card-idx="${idx}"]`);
      if (!current?.classList.contains('card-back')) continue;
      const template = container.ownerDocument.createElement('template');
      template.innerHTML = renderCard(card, idx, { revealEnter: true });
      const revealedCard = template.content.firstElementChild;
      if (!revealedCard) continue;
      current.replaceWith(revealedCard);
      addedCard = true;
    }

    theaterStatus.textContent = nextAllRevealed
      ? '✓ All 10 ducks revealed!'
      : `Cards waiting: ${nextUnrevealedCount} unrevealed`;

    if (nextAllRevealed) {
      container.querySelector('.gacha-theater-actions')?.remove();
      if (!container.querySelector('[data-gacha-complete]')) {
        cardGrid.insertAdjacentHTML('afterend', renderCompletion(nextEngine));
        const proceedButton = container.querySelector('#btn-gacha-proceed');
        if (proceedButton && onProceed) proceedButton.addEventListener('click', onProceed);
      }
    }

    if (addedCard) motionController.syncNewCards();
    scheduleDuplicateHelp();
    return true;
  };

  return {
    update,
    acquisitionQueue,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      motionController.destroy();
      acquisitionQueue.destroy();
      removeHelpCallout();
    },
  };
}
