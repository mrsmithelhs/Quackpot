// src/main.js
// Main entry point and controller for Quackpot browser application.

import './style.css';
import duckSvgUrl from './assets/duck-placeholder.svg';

import { GameEngine } from './core/game-engine.mjs';
import { saveGame, loadGame, clearGame, backupCorruptSave, getInMemoryStatus } from './core/storage.mjs';

import { renderHud } from './ui/hud.js';
import { renderDeskView } from './ui/desk-view.js';
import { renderGachaView } from './ui/gacha-view.js';
import { renderRaceView } from './ui/race-view.js';
import {
  renderStarterOffer,
  renderZeroCashPrompt,
  renderEscalationModal,
  renderRetentionModal,
  renderCorruptSaveModal,
} from './ui/modals.js';
import { renderReceiptView } from './ui/receipt-view.js';

const app = document.querySelector('#app');

if (app) {
  window.GameEngine = GameEngine;
  let engine = null;
  let currentStep = 'desk';
  let activeModal = null;
  let storageWarningText = null;

  function generateRandomSeed() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      return `${arr[0].toString(16)}-${arr[1].toString(16)}`;
    }
    return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  function checkStorageResult(res) {
    if (res && res.inMemory) {
      storageWarningText = 'Storage Warning: Browser storage quota exceeded or restricted. Your previous save remains stored, but new progress this session is held in temporary memory and will be lost on reload.';
    } else if (res && res.success && !getInMemoryStatus()) {
      storageWarningText = null;
    }
  }

  function maybeAutosave() {
    if (engine && engine.autosaveEnabled) {
      const res = saveGame(engine.toEnvelope());
      checkStorageResult(res);
      updateWarningBanner();
    }
  }

  function updateWarningBanner() {
    const banner = document.querySelector('#storage-warning-banner');
    if (!banner) return;
    if (storageWarningText) {
      banner.textContent = storageWarningText;
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  }

  function initApp() {
    // Scaffold UI containers inside #app
    app.innerHTML = `
      <div id="game-wrapper" class="game-wrapper">
        <div id="storage-warning-banner" class="storage-warning-banner" style="display: none;"></div>
        <div id="hud-container"></div>
        <main id="main-content" class="main-content"></main>
        <div id="modal-container"></div>
      </div>
    `;

    // Attempt to load existing game
    const loadResult = loadGame();

    if (loadResult.isCorrupt) {
      renderCorruptSaveModal(document.querySelector('#modal-container'), loadResult.errors, {
        onFresh: () => {
          clearGame();
          startFreshRun(true);
        },
        onKeepBackup: () => {
          // Backup corrupted save without destroying or overwriting it
          backupCorruptSave();
          startFreshRun(false); // start in temporary mode without overwriting corrupted save
        },
      });
      return;
    }

    if (loadResult.envelope) {
      try {
        engine = GameEngine.fromEnvelope(loadResult.envelope);
        console.info('[Quackpot] Restored valid run from storage:', engine.state);

        // Authoritative restore of learner progression step and active modal (P1 repair)
        if (engine.isTerminal()) {
          currentStep = 'receipt';
          activeModal = null;
        } else {
          currentStep = engine.state.step || 'desk';
          activeModal = engine.state.activeModal || null;
        }

        renderApp();
        return;
      } catch (err) {
        console.warn('[Quackpot] Failed to hydrate from saved envelope:', err);
      }
    }

    // Start fresh game on desk
    startFreshRun(true);
  }

  function startFreshRun(enableStorageSave = true) {
    const seed = generateRandomSeed();
    engine = new GameEngine(seed);
    engine.start();
    engine.autosaveEnabled = true;
    currentStep = 'desk';
    activeModal = null;
    engine.state.step = 'desk';
    engine.state.activeModal = null;

    if (enableStorageSave) {
      // Do not force immediate write before learner styles companion and confirms autosave
    }

    renderApp();
  }

  function updateHud() {
    const hudContainer = document.querySelector('#hud-container');
    if (!hudContainer || !engine) return;

    renderHud(hudContainer, engine, duckSvgUrl, {
      onSave: () => {
        const res = saveGame(engine.toEnvelope());
        checkStorageResult(res);
        updateWarningBanner();
        return res;
      },
      onUninstall: () => {
        if (engine.isTerminal()) return;
        engine.clickUninstall();
        activeModal = 'retention';
        renderApp();
      },
      onToggleAutosave: (checked) => {
        engine.autosaveEnabled = checked;
        maybeAutosave();
      },
    });
  }

  function renderApp() {
    updateHud();
    updateWarningBanner();

    const mainContainer = document.querySelector('#main-content');
    const modalContainer = document.querySelector('#modal-container');
    if (!mainContainer || !modalContainer) return;

    // Render active view based on authoritative progression step
    if (currentStep === 'desk') {
      renderDeskView(mainContainer, duckSvgUrl, ({ name, style, autosaveEnabled }) => {
        engine.autosaveEnabled = autosaveEnabled;
        engine.setupCompanion(name, style);
        currentStep = 'd1_morning_gacha';
        engine.state.step = currentStep;
        maybeAutosave();
        renderApp();
      });
    } else if (currentStep === 'd1_morning_gacha') {
      renderGachaView(mainContainer, engine, {
        onClaimPull: () => {
          engine.commitPromotionalTenPull();
          maybeAutosave();
          renderApp();
        },
        onRevealCard: () => {
          engine.revealNextDraw();
          maybeAutosave();
          renderApp();
        },
        onRevealCardAtIndex: (idx) => {
          engine.revealDrawAtIndex(idx);
          maybeAutosave();
          renderApp();
        },
        onRevealAll: () => {
          engine.revealAllPending();
          maybeAutosave();
          renderApp();
        },
        onProceed: () => {
          engine.billExpense('food', 5.00);
          engine.advanceDay(1, 'day 1 midday');
          currentStep = 'd1_midday_race';
          engine.state.step = currentStep;
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'd1_midday_race' || currentStep === 'd1_midday_race_result') {
      renderRaceView(mainContainer, engine, 1, {
        onStartRace: ({ duckId, stance, raceNumber }) => {
          const outcome = engine.runRace(raceNumber, duckId, stance);
          currentStep = 'd1_midday_race_result';
          engine.state.step = currentStep;
          maybeAutosave();
          updateHud();
          return outcome;
        },
        onProceed: () => {
          engine.advanceDay(1, 'day 1 afternoon');
          engine.displayStarterOffer();
          engine.displayGemShop();
          currentStep = 'd1_afternoon_starter';
          engine.state.step = currentStep;
          activeModal = 'starter';
          engine.state.activeModal = activeModal;
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'd1_afternoon_starter') {
      mainContainer.innerHTML = `
        <div class="stage-transition-card">
          <h2>Day 1: Afternoon In Town</h2>
          <p>Reviewing special shop offers and preparing for the evening.</p>
        </div>
      `;
    } else if (currentStep === 'd2_afternoon_rent' || currentStep === 'd2_afternoon_rent_resolved' || currentStep === 'd2_afternoon_zerocash' || currentStep === 'd2_afternoon_escalation') {
      const isResolved = (currentStep === 'd2_afternoon_rent_resolved');
      mainContainer.innerHTML = `
        <div class="stage-transition-card">
          <h2>Day 2: Rent Due Date</h2>
          <p>
            ${isResolved
              ? 'Your rent bill has been fully settled for Day 2.'
              : 'Your landlord arrives to collect this month\'s rent: <strong>$15.00</strong>.'}
          </p>
          <div class="rent-status-box">
            <div>Current Cash on Hand: <strong>$${engine.state.cash.toFixed(2)}</strong></div>
            <div>Rent Status: <strong>${isResolved ? 'PAID ✓' : '$15.00 Due'}</strong></div>
          </div>
          ${!isResolved ? `
            <button id="btn-pay-rent" class="btn btn-primary btn-lg">
              Pay Rent ($15.00)
            </button>
          ` : `
            <button id="btn-rent-proceed" class="btn btn-primary btn-lg">
              Proceed to Evening Wage ➔
            </button>
          `}
        </div>
      `;

      const btnPayRent = mainContainer.querySelector('#btn-pay-rent');
      if (btnPayRent) {
        btnPayRent.addEventListener('click', () => {
          const billResult = engine.billExpense('rent', 15.00);
          maybeAutosave();

          if (billResult.paid) {
            if (engine.state.cash === 0) {
              activeModal = 'zerocash';
              currentStep = 'd2_afternoon_zerocash';
              engine.state.step = currentStep;
              engine.state.activeModal = activeModal;
              maybeAutosave();
              renderApp();
            } else {
              currentStep = 'd2_afternoon_rent_resolved';
              engine.state.step = currentStep;
              maybeAutosave();
              proceedToDay2Evening();
            }
          } else {
            activeModal = 'escalation';
            currentStep = 'd2_afternoon_escalation';
            engine.state.step = currentStep;
            engine.state.activeModal = activeModal;
            maybeAutosave();
            renderApp();
          }
        });
      }

      const btnProceed = mainContainer.querySelector('#btn-rent-proceed');
      if (btnProceed) {
        btnProceed.addEventListener('click', () => {
          proceedToDay2Evening();
        });
      }
    } else if (currentStep === 'd3_midday_race' || currentStep === 'd3_midday_race_result') {
      renderRaceView(mainContainer, engine, 2, {
        onStartRace: ({ duckId, stance, raceNumber }) => {
          const outcome = engine.runRace(raceNumber, duckId, stance);
          currentStep = 'd3_midday_race_result';
          engine.state.step = currentStep;
          maybeAutosave();
          updateHud();
          return outcome;
        },
        onProceed: () => {
          engine.finishRunComplete();
          currentStep = 'receipt';
          engine.state.step = currentStep;
          activeModal = null;
          engine.state.activeModal = null;
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'receipt') {
      renderReceiptView(mainContainer, engine, {
        onPresented: () => {
          maybeAutosave();
        },
        onFreshRun: () => {
          clearGame();
          startFreshRun(true);
        },
      });
    }

    // Render active modal (if any)
    modalContainer.innerHTML = '';
    if (activeModal === 'starter') {
      renderStarterOffer(modalContainer, engine, {
        onBuy: () => {
          engine.buyStarterPack();
          activeModal = null;
          engine.state.activeModal = null;
          maybeAutosave();
          proceedToDay1Evening();
        },
        onDecline: () => {
          engine.declineStarterPack();
          activeModal = null;
          engine.state.activeModal = null;
          maybeAutosave();
          proceedToDay1Evening();
        },
      });
    } else if (activeModal === 'zerocash') {
      renderZeroCashPrompt(modalContainer, engine, {
        onContinue: () => {
          engine.chooseZeroCashOption('continue');
          activeModal = null;
          currentStep = 'd2_afternoon_rent_resolved';
          engine.state.step = currentStep;
          engine.state.activeModal = null;
          maybeAutosave();
          proceedToDay2Evening();
        },
        onExtraShift: () => {
          engine.chooseZeroCashOption('extra_shift');
          activeModal = null;
          currentStep = 'd2_afternoon_rent_resolved';
          engine.state.step = currentStep;
          engine.state.activeModal = null;
          maybeAutosave();
          proceedToDay2Evening();
        },
        onSellCouch: () => {
          engine.chooseZeroCashOption('sell_couch');
          activeModal = null;
          currentStep = 'd2_afternoon_rent_resolved';
          engine.state.step = currentStep;
          engine.state.activeModal = null;
          maybeAutosave();
          proceedToDay2Evening();
        },
      });
    } else if (activeModal === 'escalation') {
      renderEscalationModal(modalContainer, engine, {
        onAccept: () => {
          const res = engine.acceptEscalation();
          maybeAutosave();
          if (res.resolved) {
            activeModal = null;
            currentStep = 'd2_afternoon_rent_resolved';
            engine.state.step = currentStep;
            engine.state.activeModal = null;
            maybeAutosave();
            proceedToDay2Evening();
          } else if (res.route === 'running_on_empty') {
            activeModal = null;
            currentStep = 'receipt';
            engine.state.step = currentStep;
            engine.state.activeModal = null;
            maybeAutosave();
            renderApp();
          } else {
            renderApp();
          }
        },
        onDecline: () => {
          const res = engine.declineEscalation();
          maybeAutosave();
          if (res.route === 'running_on_empty') {
            activeModal = null;
            currentStep = 'receipt';
            engine.state.step = currentStep;
            engine.state.activeModal = null;
            maybeAutosave();
            renderApp();
          } else {
            renderApp();
          }
        },
      });
    } else if (activeModal === 'retention') {
      renderRetentionModal(modalContainer, engine, {
        onStay: () => {
          engine.stayUninstall();
          activeModal = engine.state.activeModal;
          currentStep = engine.state.step;
          maybeAutosave();
          renderApp();
        },
        onLeave: () => {
          engine.leaveUninstall();
          activeModal = null;
          currentStep = 'receipt';
          engine.state.step = currentStep;
          engine.state.activeModal = null;
          maybeAutosave();
          renderApp();
        },
      });
    }
  }

  function proceedToDay1Evening() {
    engine.creditWage(); // Day 1 Wage (+10.00)
    engine.advanceDay(2, 'day 2 morning');
    engine.billExpense('food', 5.00); // Day 2 Morning Food ($5.00)
    currentStep = 'd2_afternoon_rent';
    engine.state.step = currentStep;
    maybeAutosave();
    renderApp();
  }

  function proceedToDay2Evening() {
    engine.creditWage(); // Day 2 Wage (+10.00)
    engine.advanceDay(3, 'day 3 morning');
    engine.billExpense('food', 5.00); // Day 3 Morning Food ($5.00)
    currentStep = 'd3_midday_race';
    engine.state.step = currentStep;
    maybeAutosave();
    renderApp();
  }

  // Launch app
  initApp();
  console.info('[Quackpot] Plan 03 mechanism slice ready.');
}
