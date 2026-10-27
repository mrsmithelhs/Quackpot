// src/ui/acquisition-queue.mjs
// Presentation queue controller for first-owned card reveals on the Duck-Dex shelf.

import { BANNER_1_ROSTER, DUCK_COSMETICS } from '../core/game-engine.mjs';
import { createDigitalDuckSvg } from './duck-rig-view.mjs';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function createAcquisitionQueueController(container, engine, callbacks = {}) {
  const { onComplete, onStateChange, onPersist, onFocusReturn, active = true } = callbacks;
  let isActive = Boolean(active);
  let pendingFastPull = false;
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

  function isEffectiveActive() {
    return (
      isActive &&
      !isDestroyed &&
      !engine.isTerminal() &&
      (typeof document === 'undefined' || document.visibilityState === 'visible')
    );
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

  function resolveStatically(count = 0) {
    if (isDestroyed || !isEffectiveActive()) return;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
      timerRemaining = 0;
    }
    const itemsToResolve = [];
    if (activeItem) {
      itemsToResolve.push(activeItem);
      activeItem = null;
    }
    while (queue.length > 0) {
      itemsToResolve.push(queue.shift());
    }
    if (itemsToResolve.length === 0) {
      pendingFastPull = false;
      return;
    }

    for (const item of itemsToResolve) {
      engine.recordAcquisitionCue(item.identity, { isStatic: true });
      engine.markDexEntrySeen(item.identity);
    }
    const resolvedCount = count || itemsToResolve.length;
    pendingFastPull = false;
    onPersist?.();
    cleanupOverlay();
    onStateChange?.({ active: false });
    onComplete?.({ fastPull: true, count: resolvedCount });
    onFocusReturn?.();
  }

  function renderShelfSlot(duck, isTarget, isColorized) {
    // If this slot is the active target currently undergoing discovery presentation:
    // It must begin as an unowned silhouette during Phase 1 (isColorized === false),
    // and only become discovered/colored when Phase 2 starts (isColorized === true).
    // All other slots reflect their current discovered state (duck.owned).
    const isPresentedAsDiscovered = isTarget ? isColorized : duck.owned;
    const prefix = `qp-acq-slot-${duck.id}`;
    const cosmetics = DUCK_COSMETICS[duck.id] || { palette: 'classic-yellow', hat: 'none', accessory: 'none' };
    const artSvg = createDigitalDuckSvg({
      prefix,
      label: isPresentedAsDiscovered ? `${duck.name}, ${duck.tier} digital duck` : `Slot ${duck.id}: Unowned silhouette`,
      palette: cosmetics.palette,
      hat: cosmetics.hat,
      accessory: cosmetics.accessory,
    });

    const focusClass = isTarget ? ' slot-highlight-focus' : '';
    const discoveredClass = isTarget && isColorized ? ' slot-discovered slot-discovering' : '';
    const ownedClass = isPresentedAsDiscovered ? ' slot-owned' : ' slot-unowned';

    return `
      <div class="duck-dex-slot${ownedClass}${focusClass}${discoveredClass}" 
           data-duck-id="${duck.id}" 
           data-acq-slot="${duck.id}"
           tabindex="0" 
           role="region" 
           aria-label="${isPresentedAsDiscovered ? `${duck.name}, ${duck.tier}, Speed ${duck.speed.toFixed(1)}` : `Unowned silhouette`}">
        <span class="slot-tier-badge tier-${duck.tier}">${duck.tier.toUpperCase()}</span>
        <div class="slot-duck-art">
          ${artSvg}
        </div>
        <div class="slot-duck-name" data-slot-name>${isPresentedAsDiscovered ? duck.name : '??? (Unowned)'}</div>
        <div class="slot-duck-stat" data-slot-stat>${isPresentedAsDiscovered ? `Speed: ${duck.speed.toFixed(1)}` : 'Missing from roster'}</div>
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

  function completeActiveItem() {
    if (!activeItem) return;
    engine.recordAcquisitionCue(activeItem.identity, { focusMs: 2000, transitionMs: 2500 });
    engine.markDexEntrySeen(activeItem.identity);
    onPersist?.();
    activeItem = null;
    activePhase = null;
    processNext();
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
      targetSlot.setAttribute('aria-label', `${duckDef?.name || activeItem.identity}, ${duckDef?.tier || activeItem.rarity}, Speed ${duckDef?.speed.toFixed(1) || 10.0}`);
      const nameEl = targetSlot.querySelector('[data-slot-name]');
      const statEl = targetSlot.querySelector('[data-slot-stat]');
      if (nameEl) nameEl.textContent = duckDef?.name || activeItem.identity;
      if (statEl) statEl.textContent = `Speed: ${duckDef?.speed.toFixed(1) || 10.0}`;
      const svg = targetSlot.querySelector('.slot-duck-art svg');
      svg?.setAttribute('aria-label', `${duckDef?.name || activeItem.identity}, ${duckDef?.tier || activeItem.rarity} digital duck`);
    }

    if (live) {
      live.textContent = `New Duck-Dex Entry: ${duckDef?.name || activeItem.identity} (${activeItem.rarity}) unlocked!`;
    }

    timerRemaining = 2500;
    timerStart = Date.now();
    timerId = setTimeout(() => {
      timerId = null;
      completeActiveItem();
    }, 2500);
  }

  function processNext() {
    if (isDestroyed || !isEffectiveActive()) return;
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
    if (isDestroyed || engine.isTerminal()) return;
    const newlyAcquired = [];
    const newlyAcquiredInBatch = new Set(
      draws.filter((d) => !d.duplicate).map((d) => d.identity)
    );

    for (const draw of draws) {
      if (!draw.revealed) continue;
      // Must be an identity acquired in this batch
      if (!newlyAcquiredInBatch.has(draw.identity)) continue;

      const seen = engine.state.seenDexEntries || [];
      if (seen.includes(draw.identity)) continue;
      if (queue.some((i) => i.identity === draw.identity)) continue;
      if (activeItem?.identity === draw.identity) continue;
      if (newlyAcquired.some((i) => i.identity === draw.identity)) continue;

      const item = {
        identity: draw.identity,
        rarity: draw.rarity,
        commitSeq: draw.commitSeq,
      };
      queue.push(item);
      newlyAcquired.push(item);
    }

    if (newlyAcquired.length === 0) return;

    if (fastPull) {
      pendingFastPull = true;
    }

    // Fast-pull or reduced motion resolves immediately with static state change only when active
    if (pendingFastPull || prefersReducedMotion()) {
      if (isEffectiveActive()) {
        resolveStatically(newlyAcquired.length);
      }
      return;
    }

    if (!isRunning && isEffectiveActive()) {
      processNext();
    }
  }

  function setActive(nextActive) {
    if (isDestroyed || engine.isTerminal()) return;
    const wasEffective = isEffectiveActive();
    isActive = Boolean(nextActive);
    const nowEffective = isEffectiveActive();

    if (wasEffective && !nowEffective) {
      // Transitioning to inactive: suspend active timer immediately
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
        timerRemaining = Math.max(0, timerRemaining - (Date.now() - timerStart));
      }
    } else if (!wasEffective && nowEffective) {
      // Transitioning to active: resolve statically if reduced motion or pending fast pull
      if (pendingFastPull || prefersReducedMotion()) {
        if (activeItem || queue.length > 0) {
          resolveStatically();
        } else {
          pendingFastPull = false;
        }
      } else if (isRunning && timerId === null && activeItem) {
        timerStart = Date.now();
        timerId = setTimeout(() => {
          timerId = null;
          if (activePhase === 'focus') {
            startPhase2();
          } else if (activePhase === 'colorizing') {
            completeActiveItem();
          }
        }, Math.max(50, timerRemaining));
      } else if (!isRunning && queue.length > 0) {
        processNext();
      }
    }
  }

  // Automatic suspension without fake player skip logging
  function handleVisibilityChange() {
    if (isDestroyed || engine.isTerminal()) return;
    if (document.visibilityState === 'hidden') {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
        timerRemaining = Math.max(0, timerRemaining - (Date.now() - timerStart));
      }
    } else if (document.visibilityState === 'visible' && isEffectiveActive()) {
      if (pendingFastPull || prefersReducedMotion()) {
        if (activeItem || queue.length > 0) {
          resolveStatically();
        } else {
          pendingFastPull = false;
        }
      } else if (isRunning && timerId === null && activeItem) {
        timerStart = Date.now();
        timerId = setTimeout(() => {
          timerId = null;
          if (activePhase === 'focus') {
            startPhase2();
          } else if (activePhase === 'colorizing') {
            completeActiveItem();
          }
        }, Math.max(50, timerRemaining));
      } else if (!isRunning && queue.length > 0) {
        processNext();
      }
    }
  }

  const motionMedia = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(MOTION_QUERY) : null;
  function handleMotionChange() {
    if (isDestroyed || engine.isTerminal()) return;
    if (prefersReducedMotion() && (isRunning || activeItem || queue.length > 0)) {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
        timerRemaining = 0;
      }
      if (isEffectiveActive()) {
        resolveStatically();
      } else {
        // While inactive or suspended: do NOT mutate engine state, seen entries, cues, or callbacks.
        // Safely preserve active item (if any) back into the pending queue and clean up DOM overlay.
        if (activeItem) {
          queue.unshift(activeItem);
          activeItem = null;
          isRunning = false;
          activePhase = null;
        }
        if (overlayEl) {
          overlayEl.remove();
          overlayEl = null;
        }
        for (const el of priorInertElements) {
          el.inert = false;
        }
        priorInertElements = [];
      }
    }
  }
  motionMedia?.addEventListener?.('change', handleMotionChange);

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return {
    enqueueReveals,
    skip: skipAll,
    setActive,
    isActive: () => isRunning && isEffectiveActive(),
    destroy: () => {
      isDestroyed = true;
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      motionMedia?.removeEventListener?.('change', handleMotionChange);
      cleanupOverlay();
      queue = [];
      activeItem = null;
      pendingFastPull = false;
    },
  };
}
