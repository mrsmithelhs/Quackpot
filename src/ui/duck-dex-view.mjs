// src/ui/duck-dex-view.js
// Voluntary Duck-Dex collection shelf and factual inspector view.

import { createDigitalDuckSvg } from './duck-rig-view.mjs';

const TIER_DROP_RATES = {
  common: '80% (Base Rate)',
  rare: '18% (Base Rate)',
  legendary: '2% (Base Rate, with Linear Pity)',
};

export function renderDuckDexView(container, engine, callbacks = {}) {
  const { onReturn } = callbacks;
  const dexState = engine.getDexCollectionState();
  const set = dexState.sets[0] || { name: 'Pond of Destiny', owned: 0, total: 6, complete: false };
  const percentage = Math.round((dexState.ownedCount / dexState.totalDucks) * 100);

  let activeInspectorDuck = null;

  function renderSlot(duck, idx) {
    const isOwned = duck.owned;
    const prefix = `qp-dex-slot-${duck.id}`;
    const artSvg = createDigitalDuckSvg({
      prefix,
      label: isOwned ? `${duck.name}, ${duck.tier} digital duck` : `Unknown ${duck.tier} duck silhouette`,
      palette: duck.cosmetics.palette,
      hat: duck.cosmetics.hat,
      accessory: duck.cosmetics.accessory,
    });

    return `
      <div class="duck-dex-slot ${isOwned ? 'slot-owned' : 'slot-unowned'}" 
           data-duck-id="${duck.id}" 
           tabindex="0" 
           role="button" 
           aria-label="${isOwned ? `${duck.name}, ${duck.tier}, Speed ${duck.speed.toFixed(1)}` : `Slot ${idx + 1}: Unowned silhouette`}">
        <span class="slot-tier-badge tier-${duck.tier}">${duck.tier.toUpperCase()}</span>
        <div class="slot-duck-art">
          ${artSvg}
        </div>
        <div class="slot-duck-name">${isOwned ? duck.name : '??? (Unowned)'}</div>
        <div class="slot-duck-stat">${isOwned ? `Speed: ${duck.speed.toFixed(1)} m/s` : 'Missing from roster'}</div>
      </div>
    `;
  }

  function renderInspectorModal(duck) {
    if (!duck) return '';
    const isOwned = duck.owned;
    const prefix = `qp-dex-inspect-${duck.id}`;
    const artSvg = createDigitalDuckSvg({
      prefix,
      label: isOwned ? `${duck.name}` : `Silhouette of ${duck.tier} duck`,
      palette: duck.cosmetics.palette,
      hat: duck.cosmetics.hat,
      accessory: duck.cosmetics.accessory,
    });

    return `
      <div class="duck-dex-inspector-backdrop" id="dex-inspector-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspector-duck-title">
        <div class="duck-dex-inspector-card">
          <button class="inspector-close-btn" id="btn-close-inspector" aria-label="Close inspector">✕</button>
          <div class="inspector-header">
            <div class="inspector-art-container ${isOwned ? '' : 'art-silhouette'}">
              ${artSvg}
            </div>
            <h3 class="inspector-title" id="inspector-duck-title">${isOwned ? duck.name : '??? (Unowned Identity)'}</h3>
            <span class="inspector-tier-tag tier-${duck.tier}">${duck.tier.toUpperCase()}</span>
          </div>

          <div class="inspector-data-list">
            <div class="inspector-data-row">
              <span class="inspector-data-label">Ownership Status:</span>
              <span class="inspector-data-value">${isOwned ? 'Owned in Stable ✓' : 'Not Discovered'}</span>
            </div>
            <div class="inspector-data-row">
              <span class="inspector-data-label">Base Race Speed:</span>
              <span class="inspector-data-value">${duck.speed.toFixed(1)} m/s</span>
            </div>
            <div class="inspector-data-row">
              <span class="inspector-data-label">Pre-Draw Drop Rate:</span>
              <span class="inspector-data-value">${TIER_DROP_RATES[duck.tier] || duck.tier}</span>
            </div>
            <div class="inspector-data-row">
              <span class="inspector-data-label">Set Collection:</span>
              <span class="inspector-data-value">Pond of Destiny</span>
            </div>
            <div class="inspector-data-row">
              <span class="inspector-data-label">Race Availability:</span>
              <span class="inspector-data-value">${isOwned ? 'Rested / Available' : 'Unavailable'}</span>
            </div>
          </div>

          <p class="inspector-plan22-note">
            <strong>Stamina & Rest Notice:</strong> In conformance with founding design, soft fatigue penalties (50% penalty with 0 intervening races, 25% with 1 race) apply during race staging once Plan 22 is integrated.
          </p>
        </div>
      </div>
    `;
  }

  function renderView() {
    container.innerHTML = `
      <div class="duck-dex-container">
        <header class="duck-dex-header">
          <div class="duck-dex-title-group">
            <h2>🦆 Duck-Dex Collection</h2>
            <div class="duck-dex-summary-stats">
              Total Roster Discovered: <strong>${dexState.ownedCount} / ${dexState.totalDucks}</strong> (${percentage}%)
            </div>
          </div>
          <button id="btn-dex-return" class="btn btn-secondary duck-dex-return-btn">
            ← Return to Game
          </button>
        </header>

        <section class="duck-dex-set-card" aria-labelledby="set-title">
          <div class="set-card-header">
            <span class="set-card-title" id="set-title">${set.name}</span>
            <span class="set-card-badge ${set.complete ? 'badge-complete' : ''}">
              ${set.complete ? '✓ Set Completed' : `${set.owned} / ${set.total} Ducks`}
            </span>
          </div>
          <div class="set-progress-track" role="progressbar" aria-valuenow="${set.owned}" aria-valuemin="0" aria-valuemax="${set.total}">
            <div class="set-progress-fill" style="width: ${(set.owned / set.total) * 100}%"></div>
          </div>
          <p class="set-effect-gap-note">
            <strong>Set Bonus:</strong> ${set.effectText}
          </p>
        </section>

        <section class="duck-dex-shelf-section" aria-label="Curio Display Shelf">
          <h3 class="duck-dex-shelf-title">Curio Shelf</h3>
          <div class="duck-dex-grid">
            ${dexState.roster.map((duck, idx) => renderSlot(duck, idx)).join('')}
          </div>
        </section>

        <div id="inspector-modal-mount">
          ${renderInspectorModal(activeInspectorDuck)}
        </div>
      </div>
    `;

    // Attach slot click and keydown handlers
    const slots = container.querySelectorAll('.duck-dex-slot');
    for (const slot of slots) {
      const duckId = slot.dataset.duckId;
      const duck = dexState.roster.find((d) => d.id === duckId);

      const openInspector = () => {
        activeInspectorDuck = duck;
        renderView();
        const closeBtn = container.querySelector('#btn-close-inspector');
        closeBtn?.focus();
      };

      slot.addEventListener('click', openInspector);
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openInspector();
        }
      });
    }

    // Attach return button
    const btnReturn = container.querySelector('#btn-dex-return');
    if (btnReturn && onReturn) {
      btnReturn.addEventListener('click', onReturn);
    }

    // Attach inspector dismissals
    const btnCloseInspect = container.querySelector('#btn-close-inspector');
    const backdrop = container.querySelector('#dex-inspector-backdrop');

    const closeInspector = () => {
      activeInspectorDuck = null;
      renderView();
    };

    btnCloseInspect?.addEventListener('click', closeInspector);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) closeInspector();
    });
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (activeInspectorDuck) {
        activeInspectorDuck = null;
        renderView();
      } else if (onReturn) {
        onReturn();
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
  renderView();

  return {
    destroy: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown);
      }
    },
  };
}
