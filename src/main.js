// src/main.js
// Main entry point and controller for Quackpot browser application.

import './style.css';
import './ui/shell.css';
import './ui/stage-transition.css';
import './ui/duck-motion.css';
import './ui/duck-dex.css';
import './ui/race-view.css';
import './ui/apartment-view.css';
import './ui/life/life.css';
import duckSvgUrl from './assets/duck-placeholder.svg';

import { GameEngine, GAME_CONSTANTS } from './core/game-engine.mjs';
import {
  saveGame,
  loadGame,
  clearGame,
  backupCorruptSave,
  getInMemoryStatus,
  setTemporaryPreservationMode,
  isTemporaryPreservationMode,
} from './core/storage.mjs';

import { renderHud } from './ui/hud.js';
import { renderDeskView } from './ui/desk-view.js';
import { renderGachaView } from './ui/gacha-view.js';
import { renderDuckDexView } from './ui/duck-dex-view.mjs';
import { renderRaceView } from './ui/race-view.js';
import {
  renderStarterOffer,
  renderRetentionModal,
  renderCorruptSaveModal,
} from './ui/modals.js';
import { renderLifeView } from './ui/life/life-view.js';
import {
  BREAKFAST_STEP_BY_DAY,
  afterBreakfast,
  breakfastBeforeMidday,
  isKnownStep,
  isLifeStep,
  normalizeLoadedStep,
} from './ui/life/life-routing.mjs';
import { renderReceiptView } from './ui/receipt-view.js';
import { renderSettingsModal } from './ui/settings-modal.js';
import { createStageTransition } from './ui/stage-transition.js';

const app = document.querySelector('#app');

if (app) {
  window.GameEngine = GameEngine;
  let engine = null;
  let currentStep = 'desk';
  let activeModal = null;
  let storageWarningText = null;
  let phoneOpen = false;
  let settingsOpen = false;
  let settingsCleanup = null;
  let settingsTriggerId = 'btn-open-settings';
  let stageTransition = null;
  let gachaViewHandle = null;
  let deskViewHandle = null;
  let duckDexViewHandle = null;
  let raceViewHandle = null;
  let dexReturnStep = 'd1_morning_gacha';
  let duckMotionPaused = false;
  let animatePhoneGlow = true;
  // Apartment life UI state (place chosen, object held, Decide expanded). Survives re-renders; never saved.
  const lifeUi = { place: null, held: null, decideOpen: false };
  let lifeViewHandle = null;

  function generateRandomSeed() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      return `${arr[0].toString(16)}-${arr[1].toString(16)}`;
    }
    return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  function checkStorageResult(res) {
    if (res && res.preservedSnapshot) {
      storageWarningText = 'Temporary Session: An existing save is preserved. Storage saving is paused to protect it.';
    } else if (res && res.inMemory) {
      storageWarningText = 'Storage Warning: Browser storage quota exceeded or restricted. Your previous save remains stored, but new progress this session is held in temporary memory and will be lost on reload.';
    } else if (res && res.success && !getInMemoryStatus() && !isTemporaryPreservationMode()) {
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
          setTemporaryPreservationMode(false);
          startFreshRun(true);
        },
        onKeepBackup: () => {
          // Backup corrupted save without destroying or overwriting it (Repair 02, P2)
          const backupOk = backupCorruptSave();
          setTemporaryPreservationMode(true);
          if (!backupOk) {
            storageWarningText = 'Notice: Could not write backup copy to backup storage key. The original corrupt save remains preserved in primary storage. Playing in temporary memory mode.';
          } else {
            storageWarningText = 'Notice: Corrupted save copy preserved under backup key. The original save remains preserved in storage. Playing in temporary memory mode.';
          }
          startFreshRun(false); // start in temporary mode without overwriting preserved save
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
          phoneOpen = true;
          activeModal = null;
        } else {
          // A crash between a breakfast charge and its step update moves forward without charging again.
          const loaded = normalizeLoadedStep(engine);
          if (loaded.next) applyStepTransition(loaded.next);
          currentStep = engine.state.step || 'desk';
          phoneOpen = currentStep !== 'desk' && !isLifeStep(currentStep);
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

    if (!enableStorageSave || isTemporaryPreservationMode()) {
      engine.autosaveEnabled = false;
      if (!storageWarningText) {
        storageWarningText = 'Temporary Session: An existing save is preserved in storage. Automatic saving is paused to prevent overwriting it.';
      }
    } else {
      engine.autosaveEnabled = true;
      storageWarningText = null;
    }

    currentStep = 'desk';
    dexReturnStep = 'd1_morning_gacha';
    duckMotionPaused = false;
    phoneOpen = false;
    activeModal = null;
    engine.state.step = 'desk';
    engine.state.activeModal = null;

    renderApp();
  }

  function updateHud() {
    const hudContainer = document.querySelector('#hud-container');
    if (!hudContainer || !engine) return;

    renderHud(hudContainer, engine, duckSvgUrl, {
      onSave: saveNow,
      onSettings: () => {
        stageTransition?.cancel();
        settingsTriggerId = 'btn-open-settings';
        settingsOpen = true;
        renderApp();
      },
      showReturn: phoneOpen && !engine.isTerminal() && currentStep !== 'duck_dex',
      showDex: phoneOpen && !engine.isTerminal() && currentStep !== 'duck_dex',
      onOpenDex: () => {
        stageTransition?.cancel();
        dexReturnStep = currentStep;
        currentStep = 'duck_dex';
        engine.recordDexViewed('hud');
        maybeAutosave();
        renderApp();
      },
      onReturnToApartment: () => {
        stageTransition?.run('return').then((completed) => {
          if (!completed || engine.isTerminal() || settingsOpen) return;
          phoneOpen = false;
          renderApp();
          requestAnimationFrame(() => document.querySelector('#btn-start-app')?.focus());
        });
      },
      onUninstall: () => {
        stageTransition?.cancel();
        if (engine.isTerminal()) return;
        engine.clickUninstall();
        activeModal = 'retention';
        maybeAutosave(); // Keep the displayed retention prompt and original interrupted context across reload.
        renderApp();
      },
    });
  }

  function saveNow() {
    let res;
    if (isTemporaryPreservationMode()) {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm('An existing save snapshot is currently preserved. Overwrite it with this session?')
        : false;
      if (confirmed) {
        setTemporaryPreservationMode(false);
        res = saveGame(engine.toEnvelope(), globalThis.localStorage, true);
      } else {
        res = saveGame(engine.toEnvelope(), globalThis.localStorage, false);
      }
    } else {
      res = saveGame(engine.toEnvelope());
    }
    checkStorageResult(res);
    updateWarningBanner();
    return res;
  }

  function renderApp() {
    const racePlaybackSnapshot = raceViewHandle?.snapshot?.() ?? null;
    raceViewHandle?.destroy?.();
    raceViewHandle = null;
    deskViewHandle?.destroy?.();
    deskViewHandle = null;
    gachaViewHandle?.destroy();
    gachaViewHandle = null;
    duckDexViewHandle?.destroy();
    duckDexViewHandle = null;
    lifeViewHandle?.destroy?.();
    lifeViewHandle = null;
    settingsCleanup?.();
    settingsCleanup = null;
    updateHud();
    updateWarningBanner();

    const mainContainer = document.querySelector('#main-content');
    const modalContainer = document.querySelector('#modal-container');
    if (!mainContainer || !modalContainer) return;

    // Render active view based on authoritative progression step
    if (!engine.isTerminal() && isLifeStep(currentStep)) {
      lifeViewHandle = renderLifeView(mainContainer, engine, lifeUi, lifeCallbacks(), {
        active: !settingsOpen && !activeModalBlocksLife(),
      });
    } else if (!engine.isTerminal() && currentStep !== 'duck_dex' && !isKnownStep(currentStep)) {
      // Non-destructive recovery: the save is kept exactly as it is and nothing is charged or replayed.
      mainContainer.innerHTML = `
        <div class="stage-transition-card">
          <h2>We couldn't find your place</h2>
          <p>This save stopped at a point this version doesn't recognize ("${String(currentStep).replace(/[^\w-]/g, '')}"). Your progress is kept unchanged and nothing has been charged. Settings, Save and Uninstall still work.</p>
        </div>
      `;
    } else if (!phoneOpen) {
      deskViewHandle = renderDeskView(mainContainer, duckSvgUrl, ({ name, style, autosaveEnabled, returning }) => {
        if (returning) {
          phoneOpen = true;
          renderApp();
          stageTransition?.run('enter').then((completed) => {
            if (completed) focusCurrentStageIfNeeded();
          });
          return;
        }
        if (!isTemporaryPreservationMode()) {
          engine.autosaveEnabled = autosaveEnabled;
        } else {
          engine.autosaveEnabled = false;
        }
        engine.setupCompanion(name, style);
        enterLife(BREAKFAST_STEP_BY_DAY[1]);
      }, {
        returning: currentStep !== 'desk',
        companion: engine.state.physicalCompanion,
        animatePhoneGlow,
        phoneGlowActive: !settingsOpen && !activeModal && !engine.isTerminal(),
      });
    } else if (currentStep === 'd1_morning_gacha') {
      const isGachaActive = !settingsOpen && !activeModal && !engine.isTerminal();
      gachaViewHandle = renderGachaView(mainContainer, engine, {
        active: isGachaActive,
        duckMotionPaused,
        duckMotionActive: isGachaActive,
        onDuckMotionPauseChange: (paused) => { duckMotionPaused = paused; },
        onAcquisitionPersist: () => {
          maybeAutosave();
        },
        onAcquisitionComplete: () => {
          maybeAutosave();
        },
        onDuplicateHelpShown: (sourceRevealSeq) => {
          const cue = engine.showDuplicateConversionHelp(sourceRevealSeq);
          if (cue) maybeAutosave();
          return cue;
        },
        onDuplicateHelpDismiss: (sourceCueSeq) => {
          const event = engine.dismissDuplicateConversionHelp(sourceCueSeq);
          if (event) maybeAutosave();
          return event;
        },
        onClaimPull: () => {
          engine.commitPromotionalTenPull();
          maybeAutosave();
          renderApp();
        },
        onRevealCard: () => {
          engine.revealNextDraw();
          maybeAutosave();
          gachaViewHandle?.update(engine);
        },
        onRevealCardAtIndex: (idx) => {
          engine.revealDrawAtIndex(idx);
          maybeAutosave();
          gachaViewHandle?.update(engine);
        },
        onRevealAll: () => {
          engine.revealAllPending();
          maybeAutosave();
          gachaViewHandle?.update(engine);
        },
        onProceed: () => {
          // Saves from before breakfast moved reach here with Day 1 breakfast unpaid: the kitchen comes first.
          if (breakfastBeforeMidday(engine)) {
            enterLife(BREAKFAST_STEP_BY_DAY[1]);
            return;
          }
          engine.advanceDay(1, 'day 1 midday');
          currentStep = 'd1_midday_race';
          engine.state.step = currentStep;
          maybeAutosave();
          renderApp();
        },
      });
    } else if (currentStep === 'duck_dex') {
      duckDexViewHandle = renderDuckDexView(mainContainer, engine, {
        onReturn: () => {
          currentStep = dexReturnStep || 'd1_morning_gacha';
          renderApp();
        },
      });
    } else if (currentStep === 'd1_midday_race' || currentStep === 'd1_midday_race_result') {
      raceViewHandle = renderRaceView(mainContainer, engine, 1, {
        onStartRace: ({ duckId, stance, useTrial, raceNumber }) => {
          const outcome = engine.runRace(raceNumber, duckId, stance, { useTrial });
          currentStep = 'd1_midday_race_result';
          engine.state.step = currentStep;
          maybeAutosave();
          updateHud();
          return { attempt: outcome, resolution: engine.getRaceResolution(raceNumber) };
        },
        onChoiceShown: ({ raceNumber, duckId, candidates, fieldBaseSpeed, trialState, exposureId }) => {
          if (engine.recordRaceChoicesShown(raceNumber, { duckId, candidates, fieldBaseSpeed, trialState, exposureId })) maybeAutosave();
        },
        onTrialOfferShown: ({ raceNumber, costDown, exposureId }) => {
          if (engine.recordRaceTrialOfferShown(raceNumber, costDown, exposureId)) maybeAutosave();
        },
        onBuyTrial: () => {
          const purchased = engine.purchaseRaceTrial();
          if (purchased) maybeAutosave();
          return purchased;
        },
        onAction: (action, details) => {
          engine.recordRacePlaybackAction(1, action, details);
          maybeAutosave();
        },
        onCueDisplayed: (cue) => {
          engine.recordRaceCueDisplayed(1, cue);
          maybeAutosave();
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
      }, { active: !settingsOpen && !activeModal && !engine.isTerminal(), initialSnapshot: racePlaybackSnapshot });
    } else if (currentStep === 'd1_afternoon_starter') {
      mainContainer.innerHTML = `
        <div class="stage-transition-card">
          <h2>Day 1: Afternoon In Town</h2>
          <p>Reviewing special shop offers and preparing for the evening.</p>
        </div>
      `;
    } else if (currentStep === 'd3_midday_race' || currentStep === 'd3_midday_race_result') {
      raceViewHandle = renderRaceView(mainContainer, engine, 2, {
        onStartRace: ({ duckId, stance, useTrial, raceNumber }) => {
          const outcome = engine.runRace(raceNumber, duckId, stance, { useTrial });
          currentStep = 'd3_midday_race_result';
          engine.state.step = currentStep;
          maybeAutosave();
          updateHud();
          return { attempt: outcome, resolution: engine.getRaceResolution(raceNumber) };
        },
        onChoiceShown: ({ raceNumber, duckId, candidates, fieldBaseSpeed, trialState, exposureId }) => {
          if (engine.recordRaceChoicesShown(raceNumber, { duckId, candidates, fieldBaseSpeed, trialState, exposureId })) maybeAutosave();
        },
        onTrialOfferShown: ({ raceNumber, costDown, exposureId }) => {
          if (engine.recordRaceTrialOfferShown(raceNumber, costDown, exposureId)) maybeAutosave();
        },
        onBuyTrial: () => {
          const purchased = engine.purchaseRaceTrial();
          if (purchased) maybeAutosave();
          return purchased;
        },
        onAction: (action, details) => {
          engine.recordRacePlaybackAction(2, action, details);
          maybeAutosave();
        },
        onCueDisplayed: (cue) => {
          engine.recordRaceCueDisplayed(2, cue);
          maybeAutosave();
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
      }, { active: !settingsOpen && !activeModal && !engine.isTerminal(), initialSnapshot: racePlaybackSnapshot });
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

    if (settingsOpen) {
      settingsCleanup = renderSettingsModal(modalContainer, {
        autosaveEnabled: engine.autosaveEnabled,
        animatePhoneGlow,
        autosaveLocked: isTemporaryPreservationMode() || engine.isTerminal(),
        saveDisabled: engine.isTerminal(),
        onAutosaveChange: (checked) => {
          if (engine.isTerminal()) return;
          engine.autosaveEnabled = isTemporaryPreservationMode() ? false : checked;
          if (engine.autosaveEnabled) maybeAutosave();
          else saveNow();
        },
        onAnimatePhoneGlowChange: (checked) => { animatePhoneGlow = checked; },
        onSave: saveNow,
        onClose: () => {
          settingsOpen = false;
          settingsCleanup?.();
          settingsCleanup = null;
          renderApp();
          requestAnimationFrame(() => document.getElementById(settingsTriggerId)?.focus());
        },
      });
    }
  }

  function focusCurrentStageIfNeeded() {
    if (document.activeElement && document.activeElement !== document.body) return;
    const mainContainer = document.querySelector('#main-content');
    const target = mainContainer?.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
    target?.focus();
  }

  // Reset in place: the life view keeps a reference to this object (and leaves returnFocus on it for the next render).
  function resetLifeUi() {
    Object.assign(lifeUi, { place: null, held: null, decideOpen: false });
  }

  // Life steps are apartment surfaces: the phone is put away while they are shown.
  function enterLife(step) {
    currentStep = step;
    engine.state.step = step;
    activeModal = engine.state.activeModal || null;
    phoneOpen = false;
    resetLifeUi();
    maybeAutosave();
    renderApp();
  }

  // Moves to the step breakfast leads to. Phone steps reopen from the apartment desk ("Open Quackpot").
  function applyStepTransition(next) {
    if (next.advance) engine.advanceDay(...next.advance);
    currentStep = next.step;
    engine.state.step = next.step;
    activeModal = engine.state.activeModal || null;
    phoneOpen = false;
    resetLifeUi();
  }

  const activeModalBlocksLife = () => activeModal === 'retention' || activeModal === 'starter';

  // Every life commitment names the log length it was decided against, so a double activation or a stale view
  // cannot apply an effect twice or apply the next offer by mistake.
  function lifeCallbacks() {
    const commit = (fn) => (expectLog, ...args) => {
      if (engine.isTerminal() || engine.log.length !== expectLog) return null;
      const result = fn(...args);
      currentStep = engine.state.step;
      activeModal = engine.state.activeModal || null;
      maybeAutosave();
      updateHud();
      return result;
    };
    return {
      onPayRent: commit(() => engine.billExpense('rent', GAME_CONSTANTS.RENT_DAY2)),
      onLadderAccept: commit(() => {
        const next = engine.state.activeBill?.kind === 'food' ? afterBreakfast(engine) : null;
        const result = engine.acceptEscalation();
        if (result.resolved && next) applyStepTransition(next);
        return result;
      }),
      onLadderDecline: commit(() => engine.declineEscalation()),
      onOptional: commit((choice) => {
        if (choice !== 'extra_shift' && choice !== 'sell_couch') throw new RangeError(`Unknown optional choice "${choice}"`);
        return engine.chooseZeroCashOption(choice);
      }),
      onBreakfast: commit(() => {
        const next = afterBreakfast(engine);
        const result = engine.billExpense('food', GAME_CONSTANTS.FOOD_DAILY);
        if (result.paid && !result.zeroCash) applyStepTransition(next);
        return result;
      }),
      onContinue: commit(() => {
        const next = afterBreakfast(engine);
        const result = engine.chooseZeroCashOption('continue');
        applyStepTransition(next);
        return result;
      }),
      onGoToWork: commit(() => goToWork()),
      onRefresh: () => {
        currentStep = engine.isTerminal() ? 'receipt' : engine.state.step;
        if (!isLifeStep(currentStep)) phoneOpen = engine.isTerminal();
        renderApp();
        if (!isLifeStep(currentStep)) requestAnimationFrame(() => document.querySelector('#btn-start-app')?.focus());
      },
    };
  }

  function proceedToDay1Evening() {
    engine.creditWage(); // Day 1 Wage (+10.00)
    engine.advanceDay(2, 'day 2 morning');
    enterLife(BREAKFAST_STEP_BY_DAY[2]); // Breakfast is bought by the player's tap (Plan 38, D9)
  }

  // "Go to work": closes any open paid-zero opportunity, then the ordinary wage once, then Day 3 breakfast.
  function goToWork() {
    if (engine.state.activeModal === 'zerocash') engine.chooseZeroCashOption('continue');
    engine.creditWage(); // Day 2 Wage (+10.00)
    engine.advanceDay(3, 'day 3 morning');
    currentStep = BREAKFAST_STEP_BY_DAY[3];
    engine.state.step = currentStep;
    activeModal = null;
    resetLifeUi();
    return { step: currentStep };
  }

  // Launch app
  initApp();
  stageTransition = createStageTransition(document.querySelector('#main-content'));
  console.info('[Quackpot] Plan 03 mechanism slice ready.');
}
