// src/ui/acquisition-queue.js
// Presentation queue controller for first-owned card reveal Duck-Dex theater.

import { BANNER_1_ROSTER, DUCK_COSMETICS } from '../core/game-engine.mjs';
import { createDigitalDuckSvg } from './duck-rig-view.mjs';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function createAcquisitionQueueController(container, engine, callbacks = {}) {
  const { onComplete, onStateChange } = callbacks;
  let queue = [];
  let activeItem = null;
  let isRunning = false;
  let isDestroyed = false;
  let timerId = null;
  let overlayEl = null;

  function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia?.(MOTION_QUERY).matches;
  }

  function cleanupOverlay() {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    activeItem = null;
    isRunning = false;
  }

  function skipAll() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    const remainingCount = queue.length + (activeItem ? 1 : 0);
    if (activeItem) {
      engine.markDexEntrySeen(activeItem.identity);
    }
    while (queue.length > 0) {
      const item = queue.shift();
      engine.markDexEntrySeen(item.identity);
    }

    engine.skipAcquisitionPresentation(remainingCount);
    cleanupOverlay();
    onStateChange?.({ active: false });
    onComplete?.({ skipped: true, count: remainingCount });
  }

  function processNext() {
    if (isDestroyed) return;
    if (queue.length === 0) {
      cleanupOverlay();
      onStateChange?.({ active: false });
      onComplete?.({ skipped: false });
      return;
    }

    isRunning = true;
    onStateChange?.({ active: true });
    activeItem = queue.shift();

    const duckDef = BANNER_1_ROSTER.find((d) => d.id === activeItem.identity);
    const cosmetics = DUCK_COSMETICS[activeItem.identity] || { palette: 'classic-yellow', hat: 'none', accessory: 'none' };
    const prefix = `qp-acq-${activeItem.identity}-${Date.now()}`;
    const svgMarkup = createDigitalDuckSvg({
      prefix,
      label: `${duckDef?.name || activeItem.identity}, ${activeItem.rarity} digital duck`,
      palette: cosmetics.palette,
      hat: cosmetics.hat,
      accessory: cosmetics.accessory,
    });

    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.className = 'acquisition-theater-overlay';
      overlayEl.setAttribute('role', 'dialog');
      overlayEl.setAttribute('aria-modal', 'true');
      overlayEl.setAttribute('aria-label', 'New Duck-Dex Entry Discovered');
      container.appendChild(overlayEl);
    }

    overlayEl.innerHTML = `
      <div class="acquisition-stage">
        <div class="acquisition-badge">✨ New Identity Discovered! ✨</div>
        <div class="acquisition-art-box">
          <div class="acquisition-glow-backdrop" data-glow></div>
          <div class="acquisition-duck-svg-wrap is-silhouette" data-svg-wrap>
            ${svgMarkup}
          </div>
        </div>
        <h3 class="acquisition-duck-name" data-duck-name>${duckDef?.name || activeItem.identity}</h3>
        <div class="acquisition-duck-stat" data-duck-stat>
          Rarity: <strong>${activeItem.rarity.toUpperCase()}</strong> • Base Speed: <strong>${duckDef?.speed.toFixed(1) || 10.0} m/s</strong>
        </div>
        <button type="button" class="acquisition-skip-btn" id="btn-skip-acq" aria-label="Skip discovery sequence">
          ⏭️ Skip Presentation
        </button>
        <div class="sr-only" role="status" aria-live="polite" data-acq-live></div>
      </div>
    `;

    const skipBtn = overlayEl.querySelector('#btn-skip-acq');
    skipBtn?.addEventListener('click', skipAll);
    skipBtn?.focus();

    // Phase 1: Shelf Focus (~2.0s)
    timerId = setTimeout(() => {
      if (isDestroyed || !overlayEl) return;

      // Phase 2: Silhouette-to-Color Transition (~2.5s)
      const wrap = overlayEl.querySelector('[data-svg-wrap]');
      const glow = overlayEl.querySelector('[data-glow]');
      const name = overlayEl.querySelector('[data-duck-name]');
      const stat = overlayEl.querySelector('[data-duck-stat]');
      const live = overlayEl.querySelector('[data-acq-live]');

      wrap?.classList.remove('is-silhouette');
      wrap?.classList.add('is-colorized');
      glow?.classList.add('glow-active');
      name?.classList.add('show-details');
      stat?.classList.add('show-details');

      if (live) {
        live.textContent = `New Duck-Dex Entry: ${duckDef?.name || activeItem.identity} (${activeItem.rarity}) unlocked!`;
      }

      engine.recordAcquisitionCue(activeItem.identity, { focusMs: 2000, transitionMs: 2500 });

      // Phase 3: Transition to next or complete (~2.5s)
      timerId = setTimeout(() => {
        processNext();
      }, 2500);
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

    // If Fast-Pull or Reduced Motion is active, resolve instantly with static state change
    if (fastPull || prefersReducedMotion()) {
      for (const item of queue) {
        engine.recordAcquisitionCue(item.identity, { isStatic: true });
      }
      queue = [];
      onComplete?.({ fastPull: true, count: newlyAcquired.length });
      return;
    }

    if (!isRunning) {
      processNext();
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden' && isRunning) {
      skipAll();
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
      cleanupOverlay();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    },
  };
}
