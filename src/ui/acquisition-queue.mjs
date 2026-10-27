// src/ui/acquisition-queue.mjs
// Presentation queue controller for first-owned card reveals on the Duck-Dex shelf.

import { BANNER_1_ROSTER, DUCK_COSMETICS } from '../core/game-engine.mjs';
import { createDigitalDuckSvg } from './duck-rig-view.mjs';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function createAcquisitionQueueController(container, engine, callbacks = {}) {
  const { onComplete, onStateChange, onPersist, onFocusReturn } = callbacks;
  let queue = [];
  let activeItem = null;
  let isRunning = false;
  let isDestroyed = false;
  let timerId = null;
  let timerStart = 0;
  let timerRemaining = 0;
  let activePhase = null; // 'focus' | 'colorizing'
  let overlayEl = null;
  let priorInertElements = [];

  function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia?.(MOTION_QUERY).matches;
  }

  function cleanupOverlay() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
    for (const el of priorInertElements) {
      el.inert = false;
    }
    priorInertElements = [];
    activeItem = null;
    isRunning = false;
    activePhase = null;
  }

  function renderShelfSlot(duck, isTarget, isColorized) {
    const isOwned = duck.owned || isColorized;
    const prefix = `qp-acq-slot-${duck.id}`;
    const cosmetics = DUCK_COSMETICS[duck.id] || { palette: 'classic-yellow', hat: 'none', accessory: 'none' };
    const artSvg = createDigitalDuckSvg({
      prefix,
      label: isOwned ? `${duck.name}, ${duck.tier} digital duck` : `Slot ${duck.id}: Unowned silhouette`,
      palette: cosmetics.palette,
      hat: cosmetics.hat,
      accessory: cosmetics.accessory,
    });

    const focusClass = isTarget ? ' slot-highlight-focus' : '';
    const discoveredClass = isColorized ? ' slot-discovered slot-discovering' : '';
    const ownedClass = isOwned ? ' slot-owned' : ' slot-unowned';

    return `
      <div class="duck-dex-slot${ownedClass}${focusClass}${discoveredClass}" 
           data-duck-id="${duck.id}" 
           data-acq-slot="${duck.id}"
           tabindex="0" 
           role="region" 
           aria-label="${isOwned ? `${duck.name}, ${duck.tier}, Speed ${duck.speed.toFixed(1)}` : `Unowned silhouette`}">
        <span class="slot-tier-badge tier-${duck.tier}">${duck.tier.toUpperCase()}</span>
        <div class="slot-duck-art">
          ${artSvg}
        </div>
        <div class="slot-duck-name" data-slot-name>${isOwned ? duck.name : '??? (Unowned)'}</div>
        <div class="slot-duck-stat" data-slot-stat>${isOwned ? `Speed: ${duck.speed.toFixed(1)}` : 'Missing from roster'}</div>
      </div>
    `;
  }

  function renderShelfMarkup(activeDuckId, isColorized = false) {
    const dexState = engine.getDexCollectionState();
    const set = dexState.sets[0] || { name: 'Pond of Destiny', owned: 0, total: 6, complete: false };
    const targetDuck = BANNER_1_ROSTER.find((d) => d.id === activeDuckId);

    return `
      <div class="acquisition-shelf-card" role="dialog" aria-modal="true" aria-labelledby="acq-canopy-title" tabindex="-1">
        <header class="acquisition-canopy">
          <div class="acquisition-title-group">
            <h2 id="acq-canopy-title">🦆 Duck-Dex Discovery</h2>
            <div class="acquisition-status-badge">
              ✨ New Discovery: <strong>${targetDuck?.name || activeDuckId}</strong> (${targetDuck?.tier.toUpperCase() || 'COMMON'}) ✨
            </div>
          </div>
          <button type="button" class="acquisition-skip-btn" id="btn-skip-acq" aria-label="Skip presentation sequence">
            ⏭️ Skip Presentation
          </button>
        </header>

        <section class="duck-dex-set-card" aria-label="Set Progress">
          <div class="set-card-header">
            <span class="set-card-title">${set.name}</span>
            <span class="set-card-badge ${set.complete ? 'badge-complete' : ''}">
              ${set.owned} / ${set.total} Ducks Discovered
            </span>
          </div>
          <div class="set-progress-track">
            <div class="set-progress-fill" style="width: ${(set.owned / set.total) * 100}%"></div>
          </div>
          <p class="set-effect-gap-note">
            <strong>Set Bonus:</strong> ${set.effectText}
          </p>
        </section>

        <section class="duck-dex-shelf-section" aria-label="Curio Display Shelf">
          <h3 class="duck-dex-shelf-title">Curio Shelf</h3>
          <div class="duck-dex-grid">
            ${dexState.roster.map((duck) => renderShelfSlot(duck, duck.id === activeDuckId, duck.id === activeDuckId && isColorized)).join('')}
          </div>
        </section>

        <div class="sr-only" role="status" aria-live="polite" data-acq-live></div>
      </div>
    `;
  }

  // Explicit user skip via button or Escape key
  function skipAll() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    const remainingCount = queue.length + (activeItem ? 1 : 0);
    if (remainingCount === 0) {
      cleanupOverlay();
      return;
    }

    if (activeItem) {
      engine.markDexEntrySeen(activeItem.identity);
      engine.recordAcquisitionCue(activeItem.identity, { isStatic: true });
    }
    while (queue.length > 0) {
      const item = queue.shift();
      engine.markDexEntrySeen(item.identity);
      engine.recordAcquisitionCue(item.identity, { isStatic: true });
    }

    engine.skipAcquisitionPresentation(remainingCount);
    onPersist?.();
    cleanupOverlay();
    onStateChange?.({ active: false });
    onComplete?.({ skipped: true, count: remainingCount });
    onFocusReturn?.();
  }

  function startPhase2() {
    if (isDestroyed || !activeItem || !overlayEl) return;
    activePhase = 'colorizing';

    const duckDef = BANNER_1_ROSTER.find((d) => d.id === activeItem.identity);
    const targetSlot = overlayEl.querySelector(`[data-acq-slot="${activeItem.identity}"]`);
    const live = overlayEl.querySelector('[data-acq-live]');

    if (targetSlot) {
      targetSlot.classList.remove('slot-unowned');
      targetSlot.classList.add('slot-owned', 'slot-discovering', 'slot-discovered');
      const nameEl = targetSlot.querySelector('[data-slot-name]');
      const statEl = targetSlot.querySelector('[data-slot-stat]');
      if (nameEl) nameEl.textContent = duckDef?.name || activeItem.identity;
      if (statEl) statEl.textContent = `Speed: ${duckDef?.speed.toFixed(1) || 10.0}`;
    }

    if (live) {
      live.textContent = `New Duck-Dex Entry: ${duckDef?.name || activeItem.identity} (${activeItem.rarity}) unlocked!`;
    }

    timerRemaining = 2500;
    timerStart = Date.now();
    timerId = setTimeout(() => {
      timerId = null;
      // Record real displayed acquisition cue and mark seen on completion
      engine.recordAcquisitionCue(activeItem.identity, { focusMs: 2000, transitionMs: 2500 });
      engine.markDexEntrySeen(activeItem.identity);
      onPersist?.();
      activeItem = null;
      activePhase = null;
      processNext();
    }, 2500);
  }

  function processNext() {
    if (isDestroyed) return;
    if (queue.length === 0) {
      cleanupOverlay();
      onStateChange?.({ active: false });
      onComplete?.({ skipped: false });
      onFocusReturn?.();
      return;
    }

    isRunning = true;
    onStateChange?.({ active: true });
    activeItem = queue.shift();

    const doc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!overlayEl && doc) {
      overlayEl = doc.createElement('div');
      overlayEl.className = 'acquisition-shelf-overlay';
      overlayEl.setAttribute('role', 'region');
      overlayEl.setAttribute('aria-label', 'Duck-Dex Acquisition Discovery');
      container.appendChild(overlayEl);

      // Make siblings inert while overlay is active
      for (const sibling of (container.children || [])) {
        if (sibling !== overlayEl && !sibling.inert) {
          sibling.inert = true;
          priorInertElements.push(sibling);
        }
      }
    }

    if (!overlayEl) return;
    overlayEl.innerHTML = renderShelfMarkup(activeItem.identity, false);

    const skipBtn = overlayEl.querySelector('#btn-skip-acq');
    skipBtn?.addEventListener('click', skipAll);
    skipBtn?.focus();

    // Trap focus inside overlay
    overlayEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipAll();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = overlayEl.querySelectorAll('button:not(:disabled), [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const activeEl = doc?.activeElement;
          if (e.shiftKey && activeEl === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && activeEl === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    const targetSlot = overlayEl.querySelector(`[data-acq-slot="${activeItem.identity}"]`);
    targetSlot?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Phase 1: Focus matching slot for ~2.0s
    activePhase = 'focus';
    timerRemaining = 2000;
    timerStart = Date.now();
    timerId = setTimeout(() => {
      timerId = null;
      startPhase2();
    }, 2000);
  }

  function enqueueReveals(draws, { fastPull = false } = {}) {
    if (isDestroyed) return;
    const newlyAcquired = [];

    for (const draw of draws) {
      if (!draw.revealed || draw.duplicate) continue;
      const seen = engine.state.seenDexEntries || [];
      if (seen.includes(draw.identity)) continue;
      if (queue.some((i) => i.identity === draw.identity)) continue;
      if (activeItem?.identity === draw.identity) continue;

      const item = {
        identity: draw.identity,
        rarity: draw.rarity,
        commitSeq: draw.commitSeq,
      };
      queue.push(item);
      newlyAcquired.push(item);
    }

    if (newlyAcquired.length === 0) return;

    // Fast-pull or reduced motion resolves immediately with static state change
    if (fastPull || prefersReducedMotion()) {
      for (const item of queue) {
        engine.recordAcquisitionCue(item.identity, { isStatic: true });
        engine.markDexEntrySeen(item.identity);
      }
      queue = [];
      onPersist?.();
      onComplete?.({ fastPull: true, count: newlyAcquired.length });
      return;
    }

    if (!isRunning) {
      processNext();
    }
  }

  // Automatic suspension without fake player skip logging
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
        timerRemaining = Math.max(0, timerRemaining - (Date.now() - timerStart));
      }
    } else if (document.visibilityState === 'visible' && isRunning && timerId === null && activeItem) {
      // Resume timer
      timerStart = Date.now();
      timerId = setTimeout(() => {
        timerId = null;
        if (activePhase === 'focus') {
          startPhase2();
        } else if (activePhase === 'colorizing') {
          engine.recordAcquisitionCue(activeItem.identity, { focusMs: 2000, transitionMs: 2500 });
          engine.markDexEntrySeen(activeItem.identity);
          onPersist?.();
          activeItem = null;
          activePhase = null;
          processNext();
        }
      }, Math.max(50, timerRemaining));
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return {
    enqueueReveals,
    skip: skipAll,
    isActive: () => isRunning,
    destroy: () => {
      isDestroyed = true;
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      cleanupOverlay();
    },
  };
}
