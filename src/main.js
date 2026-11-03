// src/main.js
// Main entry point and controller for Quackpot browser application.

import './style.css';
import './ui/shell.css';
import './ui/stage-transition.css';
import './ui/duck-motion.css';
import './ui/duck-dex.css';
import './ui/race-view.css';
import './ui/life/life-story.css';
import './ui/life/ren46.css';
import './ui/apartment-view.css';
import './ui/life/life.css';
import { renderKitchenSetupView } from './ui/kitchen-setup-view.js';
import duckSvgUrl from './assets/duck-placeholder.svg';

import { GameEngine, GAME_CONSTANTS } from './core/game-engine.mjs';
import {
  saveGame,
  loadGame,
  clearGame,
  backupCorruptSave,
  backupUnsupportedRenSave,
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
import { renderLifePhoneView } from './ui/life/life-phone-view.js';
import { fiveSlotWarningLines, fiveSlotLoanDecision } from './ui/life/life-decisions.mjs';
import { social46Conflict, social46DisplayText } from './core/life-social.mjs';
import { renderUnsupportedRenSave } from './ui/life/ren-save-compat.mjs';
import {
  BREAKFAST_STEP_BY_DAY,
  afterBreakfast,
  breakfastBeforeMidday,
  isKnownStep,
  isLifeStep,
  normalizeLoadedStep,
  lifeSurface,
  fiveSlotSocialView,
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
  let lifeHubExposureRecorded = false;
  let settingsCleanup = null;
  let settingsTriggerId = 'btn-open-settings';
  let stageTransition = null;
  let gachaViewHandle = null;
  let deskViewHandle = null;
  let duckDexViewHandle = null;
  let raceViewHandle = null;
  let dexReturnStep = 'd1_morning_gacha';
  let dexReturnRaceSelection = null;
  let dexReturnRaceSnapshot = null;
  let duckMotionPaused = false;
  let animatePhoneGlow = true;
  // Apartment life UI state (place chosen, object held, Decide expanded). Survives re-renders; never saved.
  const lifeUi = { place: null, held: null, decideOpen: false, renOpen: false };
  let unsupportedRenPreservation = false;
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
    } else if (res && !res.success) {
      storageWarningText = `Storage Warning: This run could not be saved (${res.error || 'unknown error'}). The previous snapshot was not replaced.`;
    } else if (res && res.success && !getInMemoryStatus() && !isTemporaryPreservationMode()) {
      storageWarningText = null;
    }
  }

  function maybeAutosave() {
    if (engine && engine.autosaveEnabled && !unsupportedRenPreservation) {
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

    if (loadResult.unsupportedDevelopment) {
      renderUnsupportedRenSave(document.querySelector('#modal-container'), () => {
        const backup = backupUnsupportedRenSave();
        unsupportedRenPreservation = true;
        setTemporaryPreservationMode(true);
        storageWarningText = backup === 'created'
          ? 'Unsupported Ren save and a backup are preserved. This session is temporary and cannot overwrite the saved run.'
          : backup === 'existing'
            ? 'Unsupported Ren save and an existing backup are preserved; no backup was replaced. This session is temporary.'
            : 'Unsupported Ren save is preserved; a backup could not be written. This session is temporary and cannot overwrite the saved run.';
        startFreshRun(false);
      });
      return;
    }

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
          const loaded = engine.state.life ? { next: null } : normalizeLoadedStep(engine);
          if (loaded.next) applyStepTransition(loaded.next);
          if (engine.state.life) {
            const priority = lifeSurface(engine);
            if (['life_rent', 'life_recovery'].includes(priority) && engine.state.step !== priority) {
              if (['life_phone', 'life_gacha', 'life_race', 'life_race_result'].includes(engine.state.step)) engine.state.lifePhoneReturnStep = engine.state.step;
              engine.state.step = priority;
            }
          }
          currentStep = engine.state.step || 'desk';
          phoneOpen = engine.state.life ? currentStep.startsWith('life_') && !isLifeStep(currentStep) : currentStep !== 'desk' && !isLifeStep(currentStep);
          activeModal = engine.state.activeModal || null;
        }

        renderApp();
        return;
      } catch (err) {
        console.warn('[Quackpot] Failed to hydrate from saved envelope:', err);
        renderCorruptSaveModal(document.querySelector('#modal-container'), [`Saved run could not be restored: ${err.message}`], {
          onFresh: () => { clearGame(); setTemporaryPreservationMode(false); startFreshRun(true); },
          onKeepBackup: () => {
            const backupOk = backupCorruptSave();
            setTemporaryPreservationMode(true);
            storageWarningText = backupOk
              ? 'The existing save and a backup are preserved. This session is temporary.'
              : 'The existing save is preserved, but a backup could not be written. This session is temporary.';
            startFreshRun(false);
          },
        });
        return;
      }
    }

    // Start fresh game on desk
    startFreshRun(true);
  }

  function startFreshRun(enableStorageSave = true) {
    const seed = generateRandomSeed();
    engine = new GameEngine(seed, { lifePolicy: true, tutorialShift: true });
    engine.start();

    if (!enableStorageSave || isTemporaryPreservationMode() || unsupportedRenPreservation) {
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

  function openDexFromApp() {
    if (!engine || engine.isTerminal()) return;
    stageTransition?.cancel();
    const form = document.querySelector('[data-race-form]');
    dexReturnRaceSelection = form ? {
      duckId: form.querySelector('input[name="duckId"]:checked')?.value,
      stance: form.querySelector('input[name="stance"]:checked')?.value,
      useTrial: Boolean(form.querySelector('input[name="useTrial"]:checked')),
    } : null;
    dexReturnStep = currentStep;
    dexReturnRaceSnapshot = currentStep === 'life_race_result' ? raceViewHandle?.snapshot?.() ?? null : null;
    currentStep = 'duck_dex';
    engine.recordDexViewed('app'); maybeAutosave(); renderApp();
  }

  function appNotice(message) {
    const host = document.querySelector('#main-content .gacha-banner-header, #main-content .race-view-header');
    if (!host) return;
    let notice = host.querySelector('[data-app-notice]');
    if (!notice) { notice = document.createElement('p'); notice.dataset.appNotice = ''; notice.setAttribute('role', 'status'); host.append(notice); }
    notice.textContent = message;
  }

  function resolveSocialConflict(intent) {
    if (!engine.state.life || !social46Conflict(engine.state.life, intent)) return { ok: true, confirmSocial: false };
    const plan = engine.state.life.social46.pending;
    if (!plan.seatingConfirmed) {
      globalThis.alert('The couch has gone. Open Ren’s messages to confirm floor seating or tell Ren you can’t make it first.');
      return { ok: false };
    }
    const wantsNotice = globalThis.confirm(social46DisplayText('conflict_notice', null, plan.day, 0, engine.state.life.day));
    if (!engine.applyLifeIntent({ type: 'social46_conflict_shown', id: plan.id, kind: 'conflict_notice' }).ok) return { ok: false };
    maybeAutosave();
    if (wantsNotice) {
      const notified = engine.applyLifeIntent({ type: 'social46_cancel', id: plan.id });
      if (!notified.ok) return { ok: false };
      maybeAutosave();
      return globalThis.confirm('Ren has been told. Continue with your chosen activity?') ? { ok: true, confirmSocial: false } : { ok: false };
    }
    const wantsContinue = globalThis.confirm(social46DisplayText('conflict_continue'));
    if (!engine.applyLifeIntent({ type: 'social46_conflict_shown', id: plan.id, kind: 'conflict_continue' }).ok) return { ok: false };
    maybeAutosave();
    return wantsContinue
      ? { ok: true, confirmSocial: true } : { ok: false };
  }

  function commitLifeWithSocial(intent) {
    const conflict = resolveSocialConflict(intent);
    if (!conflict.ok) return { ok: false, reason: 'cancelled' };
    return engine.applyLifeIntent(conflict.confirmSocial ? { ...intent, socialConflict: 'continue' } : intent);
  }

  function confirmNextPlay(kind) {
    if(engine.state.life?.policyVersion==='five-slot-v1') {
      const active=engine.state.life.schedule.active,extend=Boolean(active?.kind==='session' && active[`${kind}Used`]);
      const operationId=`play-ui:${engine.log.length}`,prepared=engine.prepareFiveSlotPlay(kind,{operationId,extend});
      if(!prepared.ok){appNotice('Resolve the current commitment before playing.');return {ok:false};}
      const proposal=prepared.proposal;let conflictChoice=null,overtimeChoice=null;
      if(proposal.schedule.conflicts.length) {
        const view=fiveSlotSocialView(engine),plan=view.social46?.pending;
        if(!plan || !plan.seatingConfirmed || !proposal.schedule.conflicts.includes(plan.id)){appNotice('Resolve your plan with Ren first.');return {ok:false};}
        const tell=globalThis.confirm(`${social46DisplayText('conflict_notice',null,plan.day,0,view.day)}\n\nOK: tell Ren. Cancel: see another option.`);
        const shown=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_conflict_shown',id:plan.id,kind:'conflict_notice'}},engine.log.length);if(!shown.ok)return {ok:false};
        if(tell)conflictChoice='notice';else {
          const proceed=globalThis.confirm(social46DisplayText('conflict_continue'));
          const shownAgain=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_conflict_shown',id:plan.id,kind:'conflict_continue'}},engine.log.length);if(!shownAgain.ok || !proceed)return {ok:false};
          conflictChoice='break';
        }
      }
      if(proposal.schedule.rentWorkConflict) {
        if(!globalThis.confirm('This conflicts with your reserved extra shift. Withdraw from the shift and continue?'))return {ok:false};
        overtimeChoice='withdraw';
      }
      if(proposal.schedule.disclosures.length) {
        const lines=fiveSlotWarningLines(proposal);if(!lines){appNotice('This consequence cannot be shown yet.');return {ok:false};}
        const accepted=globalThis.confirm(`${lines.join('\n')}\n\nContinue?`);
        if(!engine.recordFiveSlotPlayWarningShown(proposal))return {ok:false};
        if(!accepted){engine.recordFiveSlotWarningCancelled(proposal);return {ok:false};}
      } else if(extend && !globalThis.confirm('This starts another time slot. Continue?'))return {ok:false};
      return {ok:true,confirmNext:extend,confirmSocial:false,confirmConsequences:true,conflictChoice,overtimeChoice,operationId};
    }
    if (!engine.needsNextLifePlay(kind)) return { ok: true, confirmNext: false };
    const preview = engine.previewNextLifePlay(kind, { socialContinue: true });
    if (!preview.ok) { appNotice('Return to the apartment, finish the current phase, and resolve any meal, rent, or recovery before continuing.'); return { ok: false }; }
    const life = engine.state.life;
    const warning = life.phase === 'evening'
      ? `Starting this ${kind} moves into Late Night. A pull or race then causes up to ${life.config.lateFatigueHealth} HP fatigue next morning.`
      : life.phase === 'afternoon' && life.employed && !life.shiftDays[life.day]
        ? 'Starting this play moves to the next phase and misses your scheduled shift.'
        : 'Starting this play moves into the next life phase.';
    return globalThis.confirm(`${warning} Continue?`) ? { ok: true, confirmNext: true } : { ok: false };
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
      onReturnToApartment: () => {
        if (engine.state.life) {
          stageTransition?.run('return').then((completed) => {
            if (!completed || engine.isTerminal() || settingsOpen) return;
            if (engine.state.life.session) engine.applyLifeIntent({ type: 'phone_suspend' });
            engine.state.lifePhoneReturnStep = ['life_gacha', 'life_race', 'life_race_result'].includes(currentStep) ? currentStep : 'life_phone';
            currentStep = lifeSurface(engine); engine.state.step = currentStep; phoneOpen = false;
            maybeAutosave(); renderApp();
          });
          return;
        }
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
    if (unsupportedRenPreservation) {
      globalThis.alert('This temporary session cannot overwrite the preserved Ren save.');
      return { success: false, inMemory: true, preservedSnapshot: true };
    }
    if (isTemporaryPreservationMode()) {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm('An existing save snapshot is currently preserved. Overwrite it with this session?')
        : false;
      if (confirmed) {
        setTemporaryPreservationMode(false);
        res = saveGame(engine.toEnvelope(), undefined, true);
      } else {
        res = saveGame(engine.toEnvelope(), undefined, false);
      }
    } else {
      res = saveGame(engine.toEnvelope());
    }
    checkStorageResult(res);
    updateWarningBanner();
    return res;
  }

  function renderApp() {
    const showingLifeHub = Boolean(engine?.state.life && !engine.isTerminal() && currentStep === 'life_phone' && phoneOpen);
    if (!showingLifeHub) lifeHubExposureRecorded = false;
    const racePlaybackSnapshot = raceViewHandle?.snapshot?.() ?? (currentStep === 'life_race_result' ? dexReturnRaceSnapshot : null);
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
    if (!engine.isTerminal() && currentStep === 'desk') {
      renderKitchenSetupView(mainContainer, ({ name, autosaveEnabled }) => {
        engine.autosaveEnabled = !isTemporaryPreservationMode() && autosaveEnabled;
        engine.setupCompanion(name, 'classic-yellow');
        enterLife(engine.state.life ? lifeSurface(engine) : BREAKFAST_STEP_BY_DAY[1]);
      });
    } else if (!engine.isTerminal() && currentStep === 'life_phone' && engine.state.life && phoneOpen) {
      renderLifePhoneView(mainContainer, engine, { onOpenDex: openDexFromApp, action: (action) => {
        const life = engine.state.life;
        if (['welcome', 'single', 'ten'].includes(action) && life.phase === 'afternoon' && life.employed && !life.shiftDays[life.day] && !life.anchor && !engine.needsNextLifePlay('pull')
          && !globalThis.confirm('This pull uses the afternoon anchor and misses your scheduled shift. Continue?')) return;
        if (action === 'welcome') {
          const decision = confirmNextPlay('pull'); if (!decision.ok) return;
          const conflict = life.policyVersion==='five-slot-v1'?{ok:true,confirmSocial:false}:resolveSocialConflict({ type: decision.confirmNext ? 'phone_commit_next' : 'phone_commit' }); if (!conflict.ok) return;
          let draws;
          try { draws = engine.commitPromotionalTenPull({ ...decision, confirmSocial: conflict.confirmSocial }); }
          catch { appNotice(decision.confirmNext ? 'The pull could not start. Your time and resources are unchanged.' : 'The pull could not start. Return to the apartment or try again.'); return; }
          if (!draws) { appNotice('Return to the apartment and resolve the current obligation before playing.'); return; }
          currentStep = 'life_gacha';
        } else if (action === 'single' || action === 'ten') {
          const count = action === 'single' ? 1 : 10;
          const cost = count === 1 ? GAME_CONSTANTS.PULL_SINGLE_COST : GAME_CONSTANTS.PULL_TEN_COST;
          if (engine.state.gems < cost || engine.state.pendingReveals.some(draw => !draw.revealed)) { appNotice('You need enough Gems and all previous cards revealed before this pull.'); return; }
          const decision = confirmNextPlay('pull'); if (!decision.ok) return;
          const conflict = life.policyVersion==='five-slot-v1'?{ok:true,confirmSocial:false}:resolveSocialConflict({ type: decision.confirmNext ? 'phone_commit_next' : 'phone_commit' }); if (!conflict.ok) return;
          let draws;
          try { draws = engine.commitPaidPull(count, { ...decision, confirmSocial: conflict.confirmSocial }); }
          catch { appNotice(decision.confirmNext ? 'The pull could not start. Your time and resources are unchanged.' : 'The pull could not start. Return to the apartment or try again.'); return; }
          if (!draws) { appNotice('Return to the apartment and resolve the current obligation before playing.'); return; }
          currentStep = 'life_gacha';
        } else if (action === 'reveal') currentStep = 'life_gacha';
        else if (action === 'bundle') {
          if (!globalThis.confirm('Buy 330 Gems for $4.99?')) return;
          if (!engine.buyLifeBundle(330)) { globalThis.alert('This purchase is not available.'); return; }
        } else if (action === 'race') currentStep = 'life_race';
        engine.state.step = currentStep; maybeAutosave(); renderApp();
      } });
      if (!settingsOpen && !activeModal && !lifeHubExposureRecorded) {
        if (engine.displayLifeGemShop()) { lifeHubExposureRecorded = true; maybeAutosave(); }
      }
    } else if (!engine.isTerminal() && currentStep === 'life_gacha' && engine.state.life && phoneOpen) {
      gachaViewHandle = renderGachaView(mainContainer, engine, {
        onOpenDex: openDexFromApp,
        onRevealCard: () => { engine.revealNextDraw(); maybeAutosave(); gachaViewHandle?.update(engine); },
        onRevealCardAtIndex: (idx) => { engine.revealDrawAtIndex(idx); maybeAutosave(); gachaViewHandle?.update(engine); },
        onRevealAll: () => { engine.revealAllPending(); maybeAutosave(); gachaViewHandle?.update(engine); },
        onProceed: () => { currentStep = 'life_phone'; engine.state.step = currentStep; maybeAutosave(); renderApp(); },
        onAcquisitionPersist: maybeAutosave, onAcquisitionComplete: maybeAutosave,
        onDuplicateHelpShown: (seq) => { const event = engine.showDuplicateConversionHelp(seq); if (event) maybeAutosave(); return event; },
        onDuplicateHelpDismiss: (seq) => { const event = engine.dismissDuplicateConversionHelp(seq); if (event) maybeAutosave(); return event; },
        active: !settingsOpen && !activeModal, duckMotionPaused, duckMotionActive: !settingsOpen && !activeModal,
        onDuckMotionPauseChange: (paused) => { duckMotionPaused = paused; },
      });
    } else if (!engine.isTerminal() && ['life_race', 'life_race_result'].includes(currentStep) && engine.state.life && phoneOpen) {
      const existing = Object.keys(engine.state.raceAttempts).map(Number);
      const raceNumber = currentStep === 'life_race_result' ? Math.max(...existing) : Math.max(0, ...existing) + 1;
      raceViewHandle = renderRaceView(mainContainer, engine, raceNumber, {
        onOpenDex: openDexFromApp,
        onStartRace: ({ duckId, stance, useTrial }) => {
          const life = engine.state.life;
          const next = engine.needsNextLifePlay('race');
          if (!next && life.phase === 'afternoon' && life.employed && !life.shiftDays[life.day]
            && !globalThis.confirm('This race uses the afternoon anchor and misses your scheduled shift. Continue?')) return null;
          const decision = confirmNextPlay('race'); if (!decision.ok) return null;
          const conflict = life.policyVersion==='five-slot-v1'?{ok:true,confirmSocial:false}:resolveSocialConflict({ type: decision.confirmNext ? 'phone_commit_next' : 'phone_commit' }); if (!conflict.ok) return null;
          let attempt;
          try { attempt = engine.runRace(raceNumber, duckId, stance, { useTrial, ...decision, confirmSocial: conflict.confirmSocial }); }
          catch { appNotice(decision.confirmNext ? 'The race could not start. Your time and resources are unchanged; try again or return to the apartment.' : 'The race could not start. Return to the apartment or try again.'); return null; }
          if (!attempt) { appNotice('Return to the apartment and resolve the current obligation before racing.'); return null; }
          currentStep = 'life_race_result'; engine.state.step = currentStep; maybeAutosave(); updateHud();
          return { attempt, resolution: engine.getRaceResolution(raceNumber) };
        },
        onChoiceShown: (info) => { if (engine.recordRaceChoicesShown(raceNumber, info)) maybeAutosave(); },
        onTrialOfferShown: (info) => { if (engine.recordRaceTrialOfferShown(raceNumber, info.costDown, info.exposureId)) maybeAutosave(); },
        onBuyTrial: () => { const result = engine.purchaseRaceTrial(); if (result) maybeAutosave(); return result; },
        onAction: (action, details) => { engine.recordRacePlaybackAction(raceNumber, action, details); maybeAutosave(); },
        onCueDisplayed: (cue) => { engine.recordRaceCueDisplayed(raceNumber, cue); maybeAutosave(); },
        onProceed: () => { currentStep = 'life_phone'; engine.state.step = currentStep; maybeAutosave(); renderApp(); },
      }, { active: !settingsOpen && !activeModal, initialSnapshot: racePlaybackSnapshot, initialSelection: dexReturnRaceSelection });
      dexReturnRaceSelection = null;
      dexReturnRaceSnapshot = null;
    } else if (!engine.isTerminal() && isLifeStep(currentStep)) {
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
        invitation: currentStep === 'd1_morning_gacha' && !engine.state.tenPullCommitted,
        companion: engine.state.physicalCompanion,
        animatePhoneGlow,
        phoneGlowActive: !settingsOpen && !activeModal && !engine.isTerminal(),
      });
    } else if (currentStep === 'd1_morning_gacha') {
      const isGachaActive = !settingsOpen && !activeModal && !engine.isTerminal();
      gachaViewHandle = renderGachaView(mainContainer, engine, {
        onOpenDex: openDexFromApp,
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
          document.querySelector('#main-content .app-dex-nav')?.focus({ preventScroll: true });
        },
      });
    } else if (currentStep === 'd1_midday_race' || currentStep === 'd1_midday_race_result') {
      raceViewHandle = renderRaceView(mainContainer, engine, 1, {
        onOpenDex: openDexFromApp,
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
        onOpenDex: openDexFromApp,
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
          if (unsupportedRenPreservation) { startFreshRun(false); return; }
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
          phoneOpen = true; // Apartment-origin Leave must render the Receipt immediately, not the desk invitation.
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
    Object.assign(lifeUi, { place: null, held: null, decideOpen: false, noticeFocus: false, pendingNoticeFocus: false, fadeIn: false, renOpen: false });
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

  function commitFiveSlotSchedule(action, {conflictChoice=null}={}) {
    const intent={domain:'schedule',action:{...action,operationId:`life-ui:${engine.log.length}`}};
    const prepared=engine.prepareFiveSlotAction(intent);if(!prepared.ok)return prepared;
    const proposal=prepared.proposal,disclosures=proposal.schedule.disclosures;
    if((proposal.schedule.conflicts.length && !['notice','break'].includes(conflictChoice)) || proposal.schedule.rentWorkConflict)return {ok:false,reason:'specific_conflict_choice_required'};
    if(disclosures.length) {
      const lines=fiveSlotWarningLines(proposal);if(!lines)return {ok:false,reason:'unsupported_warning'};
      const accepted=globalThis.confirm(`${lines.join('\n')}\n\nContinue?`);
      if(!engine.recordFiveSlotScheduleWarningShown(proposal))return {ok:false,reason:'stale_warning'};
      if(!accepted){engine.recordFiveSlotWarningCancelled(proposal);return {ok:false,reason:'cancelled'};}
    }
    return engine.commitFiveSlotAction(proposal,{confirmed:true,...(conflictChoice?{conflictChoice}:{}),...(proposal.schedule.recoveryInstead?{kind:'accept-recovery'}:{})});
  }

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
      onDoorActivate: commit(() => engine.state.life?.policyVersion==='five-slot-v1'
        ? engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_activate',version:1,revision:2}},engine.log.length)
        : engine.applyLifeIntent({ type: 'social46_activate', version: 1, revision: 2 })),
      onSocialOpen: commit(() => {
        const life = fiveSlotSocialView(engine),five=engine.state.life?.policyVersion==='five-slot-v1';
        const apply=intent=>five?engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:intent},engine.log.length):engine.applyLifeIntent(intent);
        if (!life?.social46) return apply({ type: 'social46_activate', version: 1, revision: 1 });
        const s = life.social46;
        if (s.introShown && !s.pending && !s.scene && life.phase === 'evening' && s.lastOfferedDay !== life.day) {
          const day = Math.max(life.day + (life.anchor ? 1 : 0), (s.lastVisitDay ?? -1) + 2);
          apply({ type: 'social46_offer', day, initiator: 'ren', activity: life.day % 2 ? 'game' : 'door' });
        }
        return { ok: true };
      }),
      onSocialAction: commit(intent => {
        if(engine.state.life?.policyVersion!=='five-slot-v1')return engine.applyLifeIntent(intent);
        const result=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:intent},engine.log.length);
        if(result.ok)engine.state.step=lifeSurface(engine);
        return result;
      }),
      onSocialShown: intent => {
        if(activeModalBlocksLife())return;
        const result=engine.state.life?.policyVersion==='five-slot-v1'
          ? engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:intent},engine.log.length) : engine.applyLifeIntent(intent);
        if(result.ok)maybeAutosave();
      },
      onPayRent: commit(() => engine.state.life
        ? engine.applyLifeIntent({ type: 'rent', choice: 'pay' })
        : engine.billExpense('rent', GAME_CONSTANTS.RENT_DAY2)),
      onFiveSlotDueShown: () => { const shown=engine.recordFiveSlotDueOptionsShown();if(shown)maybeAutosave();return shown; },
      onFiveSlotPay: commit((billId) => {
        const loan=billId.startsWith('loan-'),action=loan?{type:'repay_loan',loanId:billId}:{type:'pay_rent',billId};
        const p=engine.prepareFiveSlotAction({domain:'finance',action:{...action,id:`finance-ui:${engine.log.length}`}});
        if(!p.ok)return p;const result=engine.commitFiveSlotAction(p.proposal);
        if(result.ok)engine.state.step=lifeSurface(engine);return result;
      }),
      onFiveSlotEarlyRepay: commit((loanId) => {
        const loan=engine.state.life.finance.loans.find(item=>item.id===loanId && item.status==='pending');
        if(!loan || Math.round(engine.state.cash*100)<loan.totalCents)return {ok:false,reason:'loan_unavailable'};
        if(!globalThis.confirm(`Repay the full $${(loan.totalCents/100).toFixed(2)} payday loan now?`))return {ok:false,reason:'cancelled'};
        const p=engine.prepareFiveSlotAction({domain:'finance',action:{type:'repay_loan',loanId,id:`repay-ui:${engine.log.length}`}});
        return p.ok?engine.commitFiveSlotAction(p.proposal):p;
      }),
      onFiveSlotLoan: commit((billId) => {
        const choice=fiveSlotLoanDecision(engine,billId);if(!choice)return {ok:false,reason:'loan_unavailable'};
        const accepted=globalThis.confirm(`${choice.lines.join('\n')}\n\nAccept this loan?`);
        if(!engine.recordFiveSlotLoanTermsShown(billId))return {ok:false,reason:'stale_terms'};
        if(!accepted)return {ok:false,reason:'cancelled'};
        const p=engine.prepareFiveSlotAction({domain:'finance',action:{type:'accept_loan',billId,id:`loan-ui:${engine.log.length}`}});
        return p.ok?engine.commitFiveSlotAction(p.proposal):p;
      }),
      onFiveSlotReserve: commit((billId,day) => {
        const action={type:'reserve-overtime',rentId:billId,day,reservationId:`rent-shift:${billId}`};
        const probe=engine.prepareFiveSlotAction({domain:'schedule',action:{...action,operationId:`reserve-preview:${engine.log.length}`}});
        if(!probe.ok)return probe;
        let conflictChoice=null;
        if(probe.proposal.schedule.conflicts.length) {
          const view=fiveSlotSocialView(engine),plan=view.social46?.pending;
          if(!plan || !plan.seatingConfirmed || !probe.proposal.schedule.conflicts.includes(plan.id))return {ok:false,reason:'social_conflict_unavailable'};
          const tell=globalThis.confirm(`${social46DisplayText('conflict_notice',null,plan.day,0,view.day)}\n\nOK: tell Ren. Cancel: see another option.`);
          const shown=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_conflict_shown',id:plan.id,kind:'conflict_notice'}},engine.log.length);if(!shown.ok)return shown;
          if(tell)conflictChoice='notice';
          else {
            const proceed=globalThis.confirm(social46DisplayText('conflict_continue'));
            const shownAgain=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_conflict_shown',id:plan.id,kind:'conflict_continue'}},engine.log.length);if(!shownAgain.ok)return shownAgain;
            if(!proceed)return {ok:false,reason:'cancelled'};conflictChoice='break';
          }
        }
        return commitFiveSlotSchedule(action,{conflictChoice});
      }),
      onFiveSlotLeaveUnpaid: commit((billId) => {
        const loan=billId.startsWith('loan-'),consequence=billId==='rent-2'?'Losing housing ends the run.':'Running on Empty ends the run.';
        if(!globalThis.confirm(`Leave this payment unpaid? ${consequence}`))return {ok:false,reason:'cancelled'};
        const action=loan?{type:'leave_unpaid',loanId:billId}:{type:'leave_unpaid',billId};
        const p=engine.prepareFiveSlotAction({domain:'finance',action:{...action,id:`default-ui:${engine.log.length}`,confirmed:true,optionsDisclosed:true}});
        return p.ok?engine.commitFiveSlotAction(p.proposal):p;
      }),
      onHoldRent: commit(() => engine.applyLifeIntent({ type: 'rent', choice: 'hold' })),
      onRentContinue: commit(() => {
        if (!engine.state.life || engine.state.life.rent.status === 'due') return null;
        engine.applyLifeIntent({ type: 'rent_surface' });
        engine.state.step = lifeSurface(engine);
        resetLifeUi();
        return { ok: true };
      }),
      onAgreeWork: commit((kind) => kind === 'scheduled' ? engine.beginStoryWork('agree') : commitLifeWithSocial({ type: 'agree_work', kind })),
      onDepartWork: commit(() => {
        if (engine.state.life.session && !globalThis.confirm('Leaving for work ends this phone session. Continue?')) return null;
        const result = engine.beginStoryWork('depart', Boolean(engine.state.life.session));
        if (result.ok) { engine.state.step = lifeSurface(engine); resetLifeUi(); }
        return result;
      }),
      onCompleteWork: commit((id) => engine.applyLifeIntent({ type: 'complete_work', id })),
      onLeisure: commit(() => commitLifeWithSocial({ type: 'leisure' })),
      onBeginStoryActivity: commit((choice) => {
        if(engine.state.life?.policyVersion!=='five-slot-v1')return commitLifeWithSocial({ type: 'begin_activity47', version: choice === 'call_mom' ? 3 : 2, choice });
        const operationId=`activity-ui:${engine.log.length}`;let preview=engine.prepareFiveSlotActivityStory(choice,operationId),conflictChoice=null;
        if(!preview.ok)return preview;
        if(preview.proposal.schedule.conflicts.length) {
          const view=fiveSlotSocialView(engine),plan=view.social46?.pending;
          if(!plan || !plan.seatingConfirmed || !preview.proposal.schedule.conflicts.includes(plan.id))return {ok:false,reason:'social_conflict_unavailable'};
          const tell=globalThis.confirm(`${social46DisplayText('conflict_notice',null,plan.day,0,view.day)}\n\nOK: tell Ren. Cancel: see another option.`);
          const shown=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_conflict_shown',id:plan.id,kind:'conflict_notice'}},engine.log.length);if(!shown.ok)return shown;
          if(tell)conflictChoice='notice';else {
            const proceed=globalThis.confirm(social46DisplayText('conflict_continue'));
            const shownAgain=engine.applyFiveSlotSocialAction({operationId:`social-ui:${engine.log.length}`,action:{type:'social46_conflict_shown',id:plan.id,kind:'conflict_continue'}},engine.log.length);if(!shownAgain.ok)return shownAgain;
            if(!proceed)return {ok:false,reason:'cancelled'};conflictChoice='break';
          }
          preview=engine.prepareFiveSlotActivityStory(choice,operationId);if(!preview.ok)return preview;
        }
        if(preview.proposal.schedule.disclosures.length) {
          const lines=fiveSlotWarningLines(preview.proposal);if(!lines)return {ok:false,reason:'unsupported_warning'};
          const accepted=globalThis.confirm(`${lines.join('\n')}\n\nContinue?`);
          if(!engine.recordFiveSlotActivityWarningShown(choice,operationId,preview.proposal))return {ok:false,reason:'stale_warning'};
          if(!accepted){engine.recordFiveSlotActivityWarningCancelled(choice,operationId);return {ok:false,reason:'cancelled'};}
        }
        return engine.applyFiveSlotActivityStory({type:'start',choice,operationId,confirmed:true,...(conflictChoice?{conflictChoice}:{})},engine.log.length);
      }),
      onStoryShown: (story) => { if (engine.showLifeStory47(story.id, story.stage)) maybeAutosave(); },
      onStoryAdvance: commit((story) => {
        if(engine.state.life?.policyVersion==='five-slot-v1' && story.kind==='activity') {
          const type=story.stage==='scene'?'complete':'dismiss';
          const result=engine.applyFiveSlotActivityStory({type,id:story.id,operationId:`activity-story-ui:${engine.log.length}`,confirmed:true},engine.log.length);
          if(result.ok && type==='dismiss'){engine.state.step=lifeSurface(engine);resetLifeUi();}return result;
        }
        if (engine.state.life?.policyVersion === 'five-slot-v1' && story.kind === 'work') {
          const type = story.stage === 'commute' ? 'advance' : story.stage === 'work' ? 'complete' : 'dismiss';
          const result = engine.applyFiveSlotWorkStory({ type, id: story.id, operationId: `work-story-ui:${engine.log.length}`, confirmed: true }, engine.log.length);
          if (result.ok && type === 'dismiss') { engine.state.step = lifeSurface(engine); resetLifeUi(); }
          return result;
        }
        let intent;
        if (story.kind === 'work' && story.stage === 'commute') intent = { type: 'work_story_step', id: story.id };
        else if (story.kind === 'work' && story.stage === 'work') intent = { type: 'complete_work', id: story.id };
        else if (story.kind === 'activity' && story.stage === 'scene') intent = { type: 'complete_activity47', id: story.id };
        else intent = { type: 'dismiss_story47', id: story.id };
        const result = engine.applyLifeIntent(intent);
        if (result.ok && story.kind === 'work' && story.stage === 'payslip') {
          const next = engine.applyLifeIntent({ type: 'advance' });
          if (next.ok) { engine.state.step = lifeSurface(engine); resetLifeUi(); if (engine.state.life.day === 1) lifeUi.place = 'kitchen-breakfast'; }
        }
        return result;
      }),

      onSell: commit((asset) => engine.state.life?.policyVersion==='five-slot-v1'
        ? engine.sellFiveSlotAsset(asset,engine.log.length) : engine.applyLifeIntent({ type: 'sell', asset })),
      onRecover: commit(() => engine.applyLifeIntent({ type: 'recover' })),
      onFinishRecovery: commit(() => {
        const result = engine.applyLifeIntent({ type: 'finish_recovery' });
        if (result.ok) { engine.state.step = lifeSurface(engine); resetLifeUi(); }
        return result;
      }),
      onOpenPhone: commit(() => {
        if (engine.state.life.day === 1 && !['evening', 'lateNight'].includes(engine.state.life.phase)) return { ok: false };
        const life = engine.state.life;
        if (life.phase === 'evening' && life.anchor && !life.session && !globalThis.confirm('You already chose an evening activity. Opening and browsing Quackpot is free; starting a pull or race will ask before Late Night. Open it?')) return { ok: false };
        if (!engine.openLifeApp()) return { ok: false };
        if (engine.state.life.session?.suspended) engine.applyLifeIntent({ type: 'phone_resume' });
        engine.state.step = (engine.state.life.session && engine.state.lifePhoneReturnStep) || 'life_phone';
        engine.state.lifePhoneReturnStep = null;
        return { ok: true };
      }),
      onReplyLaunch: commit(() => ({ ok: engine.replyLifeInvitation() })),
      onInvitationShown: () => { if (engine.showLifeInvitation()) maybeAutosave(); },
      onLaunchAcknowledgmentShown: () => { if (engine.showLifeAcknowledgment()) maybeAutosave(); },
      onPhoneTransition: () => { stageTransition?.run('enter'); },
      onLifeAdvance: commit(() => {
        const life = engine.state.life;
        if (life.phase === 'afternoon' && life.employed && !life.shiftDays[life.day]
          && !globalThis.confirm('Continuing will miss your scheduled shift. Continue?')) return null;
        const result = commitLifeWithSocial({ type: 'advance' });
        if (result.ok) {
          engine.state.step = lifeSurface(engine);
          if (['life_rent', 'life_recovery'].includes(engine.state.step)) resetLifeUi();
          if (life.day === 1 && life.phase === 'afternoon' && engine.state.life.phase === 'evening') {
            resetLifeUi(); lifeUi.place = 'kitchen-breakfast';
          }
        }
        else if (result.reason !== 'cancelled') globalThis.alert('Resolve the current meal or other commitment before continuing.');
        return result;
      }),
      onLateNight: commit(() => {
        if (!globalThis.confirm('A pull or race in Late Night causes up to 10 HP fatigue next morning. Continue?')) return null;
        const result = commitLifeWithSocial({ type: 'late_night' });
        if (result.ok) engine.state.step = lifeSurface(engine);
        else if (result.reason !== 'cancelled') globalThis.alert('Resolve the current meal or work before continuing.');
        return result;
      }),
      onFinishLife: commit(() => {
        if (!globalThis.confirm('Finish this run and view the Receipt?')) return null;
        engine.finishRunComplete(); return { ok: true };
      }),
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
        if (engine.state.life?.policyVersion === 'five-slot-v1') {
          const result=commitFiveSlotSchedule({type:'meal',choice:'buy'});
          if(result.ok)engine.state.step=lifeSurface(engine);
          return {paid:result.ok};
        }
        if (engine.state.life) {
          const result = engine.applyLifeIntent({ type: 'meal', choice: 'buy' });
          return { paid: result.ok };
        }
        const next = afterBreakfast(engine);
        const result = engine.billExpense('food', GAME_CONSTANTS.FOOD_DAILY);
        if (result.paid && !result.zeroCash) applyStepTransition(next);
        return result;
      }),
      onFiveSlotSleep: commit(() => {
        const result=commitFiveSlotSchedule({type:'sleep'});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onFiveSlotRecover: commit(() => {
        const result=commitFiveSlotSchedule({type:'recover'});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onFiveSlotQuiet: commit(() => {
        const start=commitFiveSlotSchedule({type:'start',kind:'quiet'});if(!start.ok)return start;
        if(engine.state.life.schedule.recovery){engine.state.step=lifeSurface(engine);resetLifeUi();return start;}
        const result=commitFiveSlotSchedule({type:'complete',activityId:engine.state.life.schedule.active.id});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onFiveSlotFinishQuiet: commit(() => {
        const active=engine.state.life.schedule.active;if(active?.kind!=='quiet')return {ok:false,reason:'unavailable'};
        const result=commitFiveSlotSchedule({type:'complete',activityId:active.id});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onFiveSlotFinishSession: commit(() => {
        const active=engine.state.life.schedule.active;if(active?.kind!=='session')return {ok:false,reason:'unavailable'};
        const result=commitFiveSlotSchedule({type:'complete',activityId:active.id});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onFiveSlotOvertime: commit(() => {
        const reservation=engine.state.life.schedule.overtimeReservation;
        if(!reservation)return {ok:false,reason:'unavailable'};
        return commitFiveSlotSchedule({type:'start',kind:'overtime',reservationId:reservation.id});
      }),
      onFiveSlotFinishOvertime: commit(() => {
        const active=engine.state.life.schedule.active;if(active?.kind!=='overtime')return {ok:false,reason:'unavailable'};
        const result=commitFiveSlotSchedule({type:'complete',activityId:active.id});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onFiveSlotBed: commit(() => {
        const active=engine.state.life.schedule.active;
        if(active && active.kind!=='early-bed')return {ok:false,reason:'activity_pending'};
        if(!active){const start=commitFiveSlotSchedule({type:'start',kind:'early-bed'});if(!start.ok)return start;}
        const result=commitFiveSlotSchedule({type:'complete',activityId:engine.state.life.schedule.active.id});
        if(result.ok){engine.state.step=lifeSurface(engine);resetLifeUi();}
        return result;
      }),
      onSkipBreakfast: commit(() => {
        if (engine.state.life?.policyVersion === 'five-slot-v1') {
          const before=engine.state.health,result=commitFiveSlotSchedule({type:'meal',choice:'skip'});
          if(result.ok)engine.state.step=lifeSurface(engine);
          return {skipped:result.ok,healthLost:before-engine.state.health};
        }
        if (engine.state.life) {
          const result = engine.applyLifeIntent({ type: 'meal', choice: 'skip' });
          const healthEvent = result.events?.find((event) => event.type === 'life_health');
          return { skipped: result.ok, healthLost: -(healthEvent?.payload.delta ?? 0) };
        }
        const next = afterBreakfast(engine);
        const result = engine.skipBreakfast();
        if (result.skipped || result.alreadySettled) applyStepTransition(next);
        return result;
      }),
      onContinue: commit(() => {
        if (engine.state.life) {
          if (engine.state.life.session && !globalThis.confirm('Continuing ends this phone session. Continue?')) return null;
          const result = commitLifeWithSocial({ type: 'advance' });
          if (result.ok) engine.state.step = lifeSurface(engine);
          return result;
        }
        const next = afterBreakfast(engine);
        const result = engine.chooseZeroCashOption('continue');
        applyStepTransition(next);
        return result;
      }),
      onGoToWork: commit(() => goToWork()),
      onRefresh: () => {
        if (engine.state.life?.recovery && isLifeStep(engine.state.step) && !['life_rent', 'life_recovery'].includes(engine.state.step)) {
          engine.state.step = lifeSurface(engine); resetLifeUi();
        }
        currentStep = engine.isTerminal() ? 'receipt' : engine.state.step;
        if (!isLifeStep(currentStep)) phoneOpen = engine.isTerminal() || (engine.state.life && currentStep.startsWith('life_'));
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
