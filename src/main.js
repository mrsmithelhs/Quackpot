// src/main.js
// Main entry point and controller for Quackpot browser application.

import './style.css';
import duckSvgUrl from './assets/duck-placeholder.svg';

import { GameEngine } from './core/game-engine.mjs';
import { saveGame, loadGame, clearGame } from './core/storage.mjs';

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
  let engine = null;
  let currentStep = 'desk'; // 'desk' | 'd1_morning_gacha' | 'd1_midday_race' | 'd2_afternoon_rent' | 'd3_midday_race' | 'receipt'
  let activeModal = null; // null | 'starter' | 'zerocash' | 'escalation' | 'retention'

  function initApp() {
    // Scaffold UI containers inside #app
    app.innerHTML = `
      <div id="game-wrapper" class="game-wrapper">
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
          startFreshRun();
        },
        onKeepBackup: () => {
          startFreshRun();
        },
      });
      return;
    }

    if (loadResult.envelope) {
      try {
        engine = GameEngine.fromEnvelope(loadResult.envelope);
        console.info('[Quackpot] Restored valid run from storage:', engine.state);

        // Resume based on saved engine phase
        if (engine.state.phase === 'terminal' || engine.state.phase === 'receipt_presented') {
          currentStep = 'receipt';
        } else if (engine.state.day === 1) {
          if (engine.state.clock.label.includes('midday')) currentStep = 'd1_midday_race';
          else if (engine.state.clock.label.includes('afternoon')) {
            currentStep = 'd1_midday_race';
            activeModal = 'starter';
          } else currentStep = 'd1_morning_gacha';
        } else if (engine.state.day === 2) {
          currentStep = 'd2_afternoon_rent';
        } else if (engine.state.day === 3) {
          currentStep = 'd3_midday_race';
        }

        renderApp();
        return;
      } catch (err) {
        console.warn('[Quackpot] Failed to hydrate from saved envelope:', err);
      }
    }

    // Start fresh game by default
    startFreshRun();
  }

  function startFreshRun() {
    engine = new GameEngine(String(Date.now()));
    engine.start();
    currentStep = 'desk';
    activeModal = null;
    maybeAutosave();
    renderApp();
  }

  function maybeAutosave() {
    if (engine && engine.autosaveEnabled) {
      saveGame(engine.toEnvelope());
    }
  }

  function updateHud() {
    const hudContainer = document.querySelector('#hud-container');
    if (!hudContainer || !engine) return;

    renderHud(hudContainer, engine, duckSvgUrl, {
      onSave: () => {
        return saveGame(engine.toEnvelope());
      },
      onUninstall: () => {
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

    const mainContainer = document.querySelector('#main-content');
    const modalContainer = document.querySelector('#modal-container');
    if (!mainContainer || !modalContainer) return;

    // Render active view
    if (currentStep === 'desk') {
      renderDeskView(mainContainer, duckSvgUrl, ({ name, style }) => {
        engine.setupCompanion(name, style);
        currentStep = 'd1_morning_gacha';
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
        onRevealAll: () => {
          engine.revealAllPending();
          maybeAutosave();
          renderApp();
        },
        onProceed: () => {
          // Food Bill 1 arrives
          engine.billExpense('food', 5.00);
          engine.advanceDay(1, 'day 1 midday');
          currentStep = 'd1_midday_race';
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'd1_midday_race') {
      renderRaceView(mainContainer, engine, 1, {
        onStartRace: ({ duckId, stance, raceNumber }) => {
          const outcome = engine.runRace(raceNumber, duckId, stance);
          maybeAutosave();
          return outcome;
        },
        onProceed: () => {
          engine.advanceDay(1, 'day 1 afternoon');
          engine.displayStarterOffer();
          engine.displayGemShop();
          activeModal = 'starter';
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'd2_afternoon_rent') {
      mainContainer.innerHTML = `
        <div class="stage-transition-card">
          <h2>Day 2: Rent Due Date</h2>
          <p>
            Your landlord arrives to collect this month\'s rent: <strong>$15.00</strong>.
          </p>
          <div class="rent-status-box">
            <div>Current Cash on Hand: <strong>$${engine.state.cash.toFixed(2)}</strong></div>
            <div>Rent Due: <strong>$15.00</strong></div>
          </div>
          <button id="btn-pay-rent" class="btn btn-primary btn-lg">
            Pay Rent ($15.00)
          </button>
        </div>
      `;

      const btnPayRent = mainContainer.querySelector('#btn-pay-rent');
      if (btnPayRent) {
        btnPayRent.addEventListener('click', () => {
          const billResult = engine.billExpense('rent', 15.00);
          maybeAutosave();

          if (billResult.paid) {
            // Rent paid! If cash is now $0, prompt zero-cash check
            if (engine.state.cash === 0) {
              activeModal = 'zerocash';
              renderApp();
            } else {
              proceedToDay2Evening();
            }
          } else {
            // Cash insufficient! Launch escalation ladder
            activeModal = 'escalation';
            renderApp();
          }
        });
      }
    } else if (currentStep === 'd3_midday_race') {
      renderRaceView(mainContainer, engine, 2, {
        onStartRace: ({ duckId, stance, raceNumber }) => {
          const outcome = engine.runRace(raceNumber, duckId, stance);
          maybeAutosave();
          return outcome;
        },
        onProceed: () => {
          engine.finishRunComplete();
          currentStep = 'receipt';
          activeModal = null;
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'receipt') {
      renderReceiptView(mainContainer, engine, {
        onFreshRun: () => {
          clearGame();
          startFreshRun();
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
          proceedToDay1Evening();
        },
        onDecline: () => {
          engine.declineStarterPack();
          activeModal = null;
          proceedToDay1Evening();
        },
      });
    } else if (activeModal === 'zerocash') {
      renderZeroCashPrompt(modalContainer, engine, {
        onContinue: () => {
          engine.continueToWage();
          activeModal = null;
          proceedToDay2Evening();
        },
        onExtraShift: () => {
          engine.acceptEscalation();
          activeModal = null;
          proceedToDay2Evening();
        },
        onSellCouch: () => {
          engine.acceptEscalation();
          activeModal = null;
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
            proceedToDay2Evening();
          } else if (res.route === 'running_on_empty') {
            activeModal = null;
            currentStep = 'receipt';
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
          activeModal = null;
          maybeAutosave();
          renderApp();
        },
        onLeave: () => {
          engine.leaveUninstall();
          activeModal = null;
          currentStep = 'receipt';
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
    maybeAutosave();
    renderApp();
  }

  function proceedToDay2Evening() {
    engine.creditWage(); // Day 2 Wage (+10.00)
    engine.advanceDay(3, 'day 3 morning');
    engine.billExpense('food', 5.00); // Day 3 Morning Food ($5.00)
    currentStep = 'd3_midday_race';
    maybeAutosave();
    renderApp();
  }

  // Launch app
  initApp();
  console.info('[Quackpot] Plan 03 mechanism slice ready.');
}
