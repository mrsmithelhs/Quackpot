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
import './ui/messages.css';
import { renderKitchenSetupView } from './ui/kitchen-setup-view.js';
import { mountWelcome } from './ui/welcome-view.js';
import welcomeMusic from './assets/audio/welcome-m5.wav';
import { readWelcomeSnapshot, welcomeSnapshotMatches, welcomeResumeDisposition, preserveLiveReceipt, isRelevantStorageEvent } from './ui/welcome/storage-snapshot.mjs';
import { shouldSaveReceiptPresentation } from './ui/welcome/receipt-lifecycle.mjs';
import { restartConfirmationText } from './ui/welcome/restart-storage.mjs';
import { createUsageCoordinator } from './core/usage-storage-coordinator.mjs';
import { parseHistory, USAGE_HISTORY_KEY } from './core/usage-history.mjs';
import duckSvgUrl from './assets/duck-placeholder.svg';

import { GameEngine, GAME_CONSTANTS, BANNER_1_ROSTER } from './core/game-engine.mjs';
import { makeRaceRestEvidence, formatRaceRating } from './core/race-rest.mjs';
import { raceCandidateFacts } from './core/race-progression.mjs';
import {
  STORAGE_KEY,
  validateSave,
  resetInMemoryStore,
  loadGame,
  clearGame,
  backupCorruptSave,
  backupUnsupportedRenSave,
  replaceUnsupportedSave,
  getInMemoryStatus,
  setTemporaryPreservationMode,
  isTemporaryPreservationMode,
  createSchema6Session,
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
import { fiveSlotWarningLines, fiveSlotLoanDecision, fiveSlotDueDecision } from './ui/life/life-decisions.mjs';
import { snapshotDefaultIntent, defaultIntentIsCurrent, selectedDefaultBill } from './ui/life/life-default-intent.mjs';
import { social46Conflict, social46DisplayText } from './core/life-social.mjs';
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
import { invalidateForSchema6StorageEvent } from './core/race-v2/storage-invalidation.mjs';
import { messagesForEngine } from './core/messages-runtime.mjs';
import { payMessageLoan, confirmApartmentLoan } from './core/messages-payment.mjs';
import { isMessagesPolicy,renOfferId,renCurrentIds,renMessageShown } from './core/messages-policy.mjs';
import { mountMessages,isMessagesBackdrop } from './ui/messages-view.mjs';

const app = document.querySelector('#app');

if (app) {
  const raceV2Development=new URLSearchParams(window.location.search).get('race-v2')==='1';
  const schema6Session=raceV2Development?createSchema6Session():null;
  window.GameEngine = GameEngine;
  let engine = null, engineOriginPrimary = false;
  let welcomeHandle = null, pendingEnvelope = null, welcomeAutosave = true, welcomePreservation = false, welcomeSnapshot = null, pendingRestartSave = null;
  let usageCoordinator = null, pendingRestartPromise = null;
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
  let pendingDefault = null;
  let unsupportedRenPreservation = false;
  let lifeViewHandle = null;
  let messagesHandle = null;
  let messagesGeometryCleanup = null;
  let knownMessageDeliveries = null, messageAttentionStarted = null;
  if(raceV2Development)window.addEventListener('storage',event=>{
    if(!invalidateForSchema6StorageEvent(event,schema6Session,engine))return;
    storageWarningText='The development save changed in another tab. This session will not overwrite it.';updateWarningBanner();
  });
  if (!raceV2Development) window.addEventListener('storage', event => {
    let storage; try { storage = globalThis.localStorage; } catch { storage = null; }
    if (!isRelevantStorageEvent(event, storage, STORAGE_KEY)) return;
    if (welcomeHandle) welcomeSnapshot = { readable: false };
    if (!engine) return;
    welcomePreservation = true; setTemporaryPreservationMode(true); engine.autosaveEnabled = false;
    storageWarningText = 'The saved data changed in another tab. This session is temporary and will not overwrite it.';
    updateWarningBanner();
  });

  function generateRandomSeed() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(2);
      crypto.getRandomValues(arr);
      return `${arr[0].toString(16)}-${arr[1].toString(16)}`;
    }
    return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }

  function assignUsageId(target) {
    if (target.usageRunId) return target.usageRunId;
    if (!globalThis.crypto?.getRandomValues) throw new Error('Secure run identity is unavailable');
    target.usageRunId = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    return target.usageRunId;
  }

  function usageRun(target) {
    return { id: assignUsageId(target), entries: target.log.entries };
  }

  function storageFailure(error) {
    const result = { success:false, error:error?.message || 'storage unavailable' };
    checkStorageResult(result); updateWarningBanner(); return result;
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
      if (raceV2Development) { const res = schema6Session.save(engine); checkStorageResult(res); updateWarningBanner(); return; }
      void saveNow();
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
        <div id="messages-layer" class="messages-layer" hidden></div>
        <div id="modal-container"></div>
      </div>
    `;

    if(raceV2Development){void initSchema6();return;}

    try {
      const storage = globalThis.localStorage;
      const history = parseHistory(storage.getItem(USAGE_HISTORY_KEY));
      usageCoordinator = createUsageCoordinator({ storage, locks:globalThis.navigator?.locks, primaryKey:STORAGE_KEY,
        expectedPrimary:storage.getItem(STORAGE_KEY), generation:history.generation });
    } catch { usageCoordinator = null; }

    // Attempt to load existing game
    const loadResult = loadGame(undefined,{experimentalFiveSlot:true,requireFiveSlotTutorial:true});

    if (loadResult.unsupportedDevelopment) {
      const container=document.querySelector('#modal-container');
      const overlay=document.createElement('div');overlay.className='modal-backdrop';
      const card=document.createElement('section');card.className='modal-card modal-corrupt ren46-save-compat';card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-labelledby','development-save-heading');
      const heading=document.createElement('h2');heading.id='development-save-heading';heading.textContent='Save from an earlier development version';
      const message=document.createElement('p');message.textContent='This version cannot resume that save. You can play temporarily while keeping it, or deliberately replace the saved run with a new one.';
      const note=document.createElement('p');note.textContent='A replacement attempts to preserve a backup if the backup slot is empty. An existing backup is not overwritten.';
      const status=document.createElement('p');status.setAttribute('role','status');
      const temporary=document.createElement('button');temporary.type='button';temporary.className='btn btn-primary btn-lg';temporary.textContent='Play a temporary session';
      const replace=document.createElement('button');replace.type='button';replace.className='btn btn-secondary btn-lg';replace.textContent='Replace with a new run';
      temporary.addEventListener('click', async () => {
        let backup = 'unavailable';
        try { backup = await usageCoordinator?.recovery(() => backupUnsupportedRenSave()) ?? 'unavailable'; } catch { /* Preserve original in temporary mode. */ }
        unsupportedRenPreservation = true;
        setTemporaryPreservationMode(true);
        storageWarningText = backup === 'created'
          ? 'Unsupported Ren save and a backup are preserved. This session is temporary and cannot overwrite the saved run.'
          : backup === 'existing'
            ? 'Unsupported Ren save and an existing backup are preserved; no backup was replaced. This session is temporary.'
            : 'Unsupported Ren save is preserved; a backup could not be written. This session is temporary and cannot overwrite the saved run.';
        startFreshRun(false);
      });
      replace.addEventListener('click',async()=>{
        if(!globalThis.confirm('Replace the saved run with a new run? The original will be copied to an empty backup slot if possible.'))return;
        const fresh=new GameEngine(generateRandomSeed(),{lifePolicy:'five-slot-v1',tutorialShift:true});fresh.start();
        let result;
        try { assignUsageId(fresh); result=await usageCoordinator.recovery(() => replaceUnsupportedSave(fresh.toEnvelope(),undefined,{experimentalFiveSlot:true,requireFiveSlotTutorial:true})); }
        catch (error) { status.textContent=`The replacement did not complete (${error.message}). The saved data needs reinspection.`; return; }
        if(!result.success){const restoration={restored:'The original was restored.',not_needed:'The original was not replaced.',failed:'The original could not be verified as restored.',not_attempted_primary_changed:'The saved data changed during the attempt; it was not overwritten again.'}[result.restoration]??'The saved data could not be verified.';status.textContent=`The replacement did not complete (${result.error}). ${restoration} The browser may have kept a backup; check the saved data before trying again.`;return;}
        unsupportedRenPreservation=false;startFreshRun(true,fresh);
      });
      const temporaryRow=document.createElement('div'),replaceRow=document.createElement('div');temporaryRow.append(temporary);replaceRow.append(replace);
      card.append(heading,message,note,status,temporaryRow,replaceRow);overlay.append(card);container.append(overlay);temporary.focus();
      return;
    }

    if (loadResult.isCorrupt) {
      renderCorruptSaveModal(document.querySelector('#modal-container'), loadResult.errors, {
        onFresh: async () => {
          try { await usageCoordinator.recovery(() => { clearGame(); if (localStorage.getItem(STORAGE_KEY) !== null) throw new Error('clear failed'); }); }
          catch (error) { storageFailure(error); return; }
          setTemporaryPreservationMode(false);
          startFreshRun(true);
        },
        onKeepBackup: async () => {
          // Backup corrupted save without destroying or overwriting it (Repair 02, P2)
          let backupOk = false; try { backupOk = await usageCoordinator.recovery(() => backupCorruptSave()); } catch { /* Preserve original. */ }
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

    if (loadResult.envelope) { pendingEnvelope = loadResult.envelope; welcomeAutosave = loadResult.envelope.autosaveEnabled ?? true; showWelcome(); return; }
    showWelcome();
  }

  function resumeEnvelope(envelope) {
    if (envelope) {
      try {
        engine = GameEngine.fromEnvelope(envelope);
        engineOriginPrimary = true;
        if (!raceV2Development) assignUsageId(engine);
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
        requestAnimationFrame(focusCurrentStageIfNeeded);
        return;
      } catch (err) {
        console.warn('[Quackpot] Failed to hydrate from saved envelope:', err);
        renderCorruptSaveModal(document.querySelector('#modal-container'), [`Saved run could not be restored: ${err.message}`], {
          onFresh: () => { globalThis.alert('This saved run passed storage validation but could not be restored. It remains protected; reload or keep it for recovery.'); },
          onKeepBackup: async () => {
            let backupOk = false; try { backupOk = await usageCoordinator.recovery(() => backupCorruptSave()); } catch { /* Preserve original. */ }
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

  }

  function primaryPresent() {
    try { if (!globalThis.localStorage) return null; return globalThis.localStorage.getItem(STORAGE_KEY) !== null; }
    catch { return null; }
  }

  function showWelcome() {
    welcomeHandle?.dispose();
    document.querySelector('#hud-container').replaceChildren();
    document.querySelector('#modal-container').replaceChildren();
    const terminal = Boolean(engine?.isTerminal());
    let storage; try { storage = globalThis.localStorage; } catch { storage = null; }
    welcomeSnapshot = readWelcomeSnapshot(storage, STORAGE_KEY);
    const savedTerminal = ['terminal', 'receipt_presented'].includes(pendingEnvelope?.state?.phase);
    const restarting = terminal || savedTerminal;
    const preserved = Boolean(pendingEnvelope || terminal || primaryPresent() === true || welcomePreservation);
    const utility = credits => {
      const trigger = document.activeElement, modal = document.querySelector('#modal-container');
      welcomeHandle?.pause('modal');
      let cleanup;
      cleanup = renderSettingsModal(modal, {
        autosaveEnabled: welcomeAutosave, autosaveLocked: preserved && !restarting, saveDisabled: true, openCredits: credits, animatePhoneGlow,
        onAutosaveChange: value => { welcomeAutosave = value; },
        onAnimatePhoneGlowChange: value => { animatePhoneGlow = value; },
        onClose: () => { cleanup?.(); modal.replaceChildren(); welcomeHandle?.resume('modal'); if (trigger?.isConnected) trigger.focus(); },
      });
    };
    welcomeHandle = mountWelcome(document.querySelector('#main-content'), {
      finished: restarting, preservedSave: preserved && !restarting, audioSource: welcomeMusic,
      onSettings: () => utility(false), onCredits: () => utility(true),
      onContinue: pendingEnvelope && !savedTerminal ? () => { if (!welcomeCanResume(true)) return; const saved = pendingEnvelope; pendingEnvelope = null; welcomeHandle?.dispose({ fadeAudio: true }); welcomeHandle = null; resumeEnvelope(saved); } : undefined,
      onReceipt: terminal || savedTerminal ? () => { if (!welcomeCanResume(savedTerminal)) return; welcomeHandle?.dispose({ fadeAudio: true }); welcomeHandle = null; if (savedTerminal) { const saved = pendingEnvelope; pendingEnvelope = null; resumeEnvelope(saved); } else { currentStep = 'receipt'; phoneOpen = true; renderApp(); requestAnimationFrame(focusCurrentStageIfNeeded); } } : undefined,
      onConfirm: name => {
        if (restarting) return startAfterReceipt(name);
        const present = primaryPresent();
        const temporary = preserved || present !== false;
        if (temporary && !globalThis.confirm('Any existing saved data will be kept. This new run is temporary and will not survive a reload. An unsaved Receipt will no longer be available. Continue?')) return false;
        welcomePreservation = temporary;
        setTemporaryPreservationMode(temporary);
        if (temporary) storageWarningText = 'Temporary Session: Existing or unavailable storage is protected. This run will not survive a reload.';
        else storageWarningText = null;
        engine = new GameEngine(generateRandomSeed(), { lifePolicy: 'five-slot-v1', tutorialShift: true, raceV2: false });
        engineOriginPrimary = false;
        assignUsageId(engine);
        engine.start(); engine.autosaveEnabled = !temporary && welcomeAutosave;
        engine.setupCompanion(name, 'classic-yellow'); pendingEnvelope = null;
        knownMessageDeliveries = null; messageAttentionStarted = null; activeModal = null; phoneOpen = false;
        welcomeHandle?.dispose({ fadeAudio: true }); welcomeHandle = null;
        enterLife(engine.state.life ? lifeSurface(engine) : BREAKFAST_STEP_BY_DAY[1]);
        requestAnimationFrame(focusCurrentStageIfNeeded);
        return true;
      },
    });
  }

  async function savePendingRestart() {
    if (pendingRestartPromise) return pendingRestartPromise;
    const pendingEngine = engine;
    pendingRestartPromise = (async () => {
    try {
      await usageCoordinator.replace({ prior:pendingRestartSave.prior, replacement:engine.toEnvelope() });
      pendingRestartSave = null; resetInMemoryStore(); setTemporaryPreservationMode(false); welcomePreservation = false;
      return { success:true, inMemory:false };
    } catch (error) {
      welcomePreservation = true; setTemporaryPreservationMode(true); engine.autosaveEnabled = false;
      return { success:false, preservedSnapshot:true, error:error.message };
    }
    })();
    try {
      const result = await pendingRestartPromise;
      if (result.success && engine === pendingEngine && engine.autosaveEnabled) queueMicrotask(() => { void saveNow(); });
      return result;
    } finally { pendingRestartPromise = null; }
  }

  async function startAfterReceipt(name) {
    if (unsupportedRenPreservation) { globalThis.alert('The existing unsupported save is protected. The current Receipt remains available.'); return false; }
    let storage; try { storage = globalThis.localStorage; } catch { storage = null; }
    const snapshot = readWelcomeSnapshot(storage, STORAGE_KEY);
    if (!welcomeSnapshotMatches(welcomeSnapshot, snapshot)) {
      globalThis.alert('Saved data changed or could not be read. Reload to inspect it; the Receipt is still available here.'); return false;
    }
    let prior = null;
    if (snapshot.raw !== null) {
      try { prior = JSON.parse(snapshot.raw); } catch { globalThis.alert('The existing save cannot be safely replaced. The Receipt is still available.'); return false; }
      if (!validateSave(prior, { experimentalFiveSlot: true, requireFiveSlotTutorial: true }).valid) {
        globalThis.alert('The existing save cannot be safely replaced. The Receipt is still available.'); return false;
      }
    }
    if (!await welcomeHandle.confirmRestart(restartConfirmationText(prior?.state?.phase, snapshot.raw !== null, welcomeAutosave))) return false;
    if (!welcomeSnapshotMatches(welcomeSnapshot, snapshot)) { globalThis.alert('Saved data changed. The current Receipt remains available; reload before trying again.'); return false; }
    const candidate = new GameEngine(generateRandomSeed(), { lifePolicy: 'five-slot-v1', tutorialShift: true, raceV2: false });
    assignUsageId(candidate);
    candidate.start(); candidate.autosaveEnabled = welcomeAutosave; candidate.setupCompanion(name, 'classic-yellow');
    const next = candidate.state.life ? lifeSurface(candidate) : BREAKFAST_STEP_BY_DAY[1]; candidate.state.step = next;
    try {
      let savedRun = null;
      const liveRun = engine?.isTerminal() ? usageRun(engine) : null;
      if (prior) {
        if (!prior.usageRunId) {
          const sameLive = engineOriginPrimary && liveRun && liveRun.entries.length >= prior.eventLog.length &&
            JSON.stringify(liveRun.entries.slice(0, prior.eventLog.length)) === JSON.stringify(prior.eventLog);
          const proposedId = sameLive ? liveRun.id : assignUsageId({});
          prior.usageRunId = await usageCoordinator.bindLegacyId(proposedId, envelope => validateSave(envelope, { experimentalFiveSlot:true, requireFiveSlotTutorial:true }).valid);
        }
        savedRun = { id:prior.usageRunId, entries:prior.eventLog };
        if (liveRun?.id === savedRun.id) savedRun = liveRun;
      }
      const additionalRuns = liveRun && liveRun.id !== savedRun?.id ? [liveRun] : [];
      if (welcomeAutosave) {
        await usageCoordinator.replace({ prior:savedRun, replacement:candidate.toEnvelope(), additionalRuns });
        resetInMemoryStore(); setTemporaryPreservationMode(false); pendingRestartSave = null;
      } else {
        if (savedRun) await usageCoordinator.archive(savedRun);
        for (const run of additionalRuns) await usageCoordinator.archive(run);
        pendingRestartSave = { prior:savedRun };
        setTemporaryPreservationMode(false);
      }
    } catch (error) {
        if (!engine && pendingEnvelope) {
          try { engine = GameEngine.fromEnvelope(pendingEnvelope); engineOriginPrimary = true; pendingEnvelope = null; engine.autosaveEnabled = false; welcomePreservation = true; setTemporaryPreservationMode(true); }
          catch { /* Keep the original cached envelope for the existing recovery path. */ }
        }
        globalThis.alert(`The new run could not be saved safely (${error.message}). The current Receipt remains available; check saved data before trying again.`);
        if (engine?.isTerminal()) showWelcome();
        return false;
    }
    welcomePreservation = false; unsupportedRenPreservation = false; storageWarningText = null;
    engine = candidate; engineOriginPrimary = false; pendingEnvelope = null; knownMessageDeliveries = null; messageAttentionStarted = null;
    currentStep = next; activeModal = null; phoneOpen = false; resetLifeUi();
    welcomeHandle?.dispose({ fadeAudio: true }); welcomeHandle = null; renderApp(); requestAnimationFrame(focusCurrentStageIfNeeded);
    return true;
  }

  function welcomeCanResume(revalidate) {
    let storage; try { storage = globalThis.localStorage; } catch { storage = null; }
    const current = readWelcomeSnapshot(storage, STORAGE_KEY);
    const disposition = welcomeResumeDisposition(welcomeSnapshot, current, !revalidate && engine?.state.phase === 'receipt_presented');
    if (disposition === 'temporary-receipt') {
      welcomePreservation = true; preserveLiveReceipt(engine, setTemporaryPreservationMode);
      storageWarningText = 'Saved data changed or could not be read. This Receipt is available for this session only; no save will be written.';
      return true;
    }
    if (disposition === 'refuse') {
      globalThis.alert('Saved data changed or could not be read. Reload to inspect the current saved run; nothing was replaced.'); return false;
    }
    if (revalidate) {
      const result = loadGame(storage, { experimentalFiveSlot: true, requireFiveSlotTutorial: true });
      if (!result.valid || !result.envelope || JSON.stringify(result.envelope) !== JSON.stringify(pendingEnvelope)) {
        globalThis.alert('The saved run could not be safely revalidated. Reload to inspect it; nothing was replaced.'); return false;
      }
    }
    return true;
  }

  async function initSchema6(){
    const main=document.querySelector('#main-content'),modal=document.querySelector('#modal-container'),abort=new AbortController();
    let canceled=false;main.innerHTML='<section><h1>Checking saved race history</h1><p role="status" data-restore-status>Preparing…</p><button type="button" data-restore-settings>Settings</button><button type="button" data-restore-leave>Leave without changing saved data</button></section>';
    main.querySelector('[data-restore-settings]').onclick=()=>{let closeSettings;closeSettings=renderSettingsModal(modal,{autosaveEnabled:false,autosaveLocked:true,saveDisabled:true,onClose:()=>{closeSettings?.();modal.replaceChildren();}});};
    main.querySelector('[data-restore-leave]').onclick=()=>{canceled=true;abort.abort();schema6Session.invalidate();main.innerHTML='<p>Saved data was left unchanged. Reload to try again.</p>';};
    const result=await schema6Session.load({signal:abort.signal,onProgress:({completed,total})=>{const status=main.querySelector('[data-restore-status]');if(status)status.textContent=`Checking race ${completed} of ${total}…`;}});
    if(canceled)return;
    if(!result.valid){
      main.innerHTML='<section><h1>Saved data was not changed</h1><p>The development save could not be validated. Reload or leave it preserved for review.</p><button type="button" data-v2-replace>Replace this development save</button><p role="status" data-v2-status></p></section>';
      const replace=main.querySelector('[data-v2-replace]');replace.disabled=!(result.isCorrupt||result.unsupportedDevelopment);
      replace.onclick=async()=>{
        if(!globalThis.confirm('Replace the separate development save? An existing backup will be preserved.'))return;
        replace.disabled=true;const fresh=new GameEngine(generateRandomSeed(),{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:'messages-v2'});fresh.start();
        const replaced=await schema6Session.replacePreserved(fresh);if(replaced.success)startFreshRun(true,fresh);
        else{main.querySelector('[data-v2-status]').textContent='The saved data was preserved; replacement could not complete.';replace.disabled=false;}
      };return;
    }
    if(result.engine){engine=result.engine;currentStep=engine.state.step||'desk';phoneOpen=engine.isTerminal()||(engine.state.life&&currentStep.startsWith('life_')&&!isLifeStep(currentStep));activeModal=engine.state.activeModal||null;renderApp();return;}
    const fresh=new GameEngine(generateRandomSeed(),{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:'messages-v2'});fresh.start();
    const bound=await schema6Session.bindNew(fresh);if(canceled)return;
    if(!bound.success){main.innerHTML='<p>Saved data was preserved. A new development session could not start.</p>';return;}
    startFreshRun(true,fresh);
  }

  function startFreshRun(enableStorageSave = true, preparedEngine = null) {
    if(raceV2Development&&!preparedEngine){
      const fresh=new GameEngine(generateRandomSeed(),{lifePolicy:'five-slot-v1',tutorialShift:true,raceV2:true,messagesPolicy:'messages-v2'});fresh.start();
      void schema6Session.bindNew(fresh).then(result=>{if(result.success)startFreshRun(enableStorageSave,fresh);else{storageWarningText='The development save was preserved; a new run could not start.';updateWarningBanner();}});return;
    }
    engine = preparedEngine ?? new GameEngine(generateRandomSeed(), { lifePolicy: 'five-slot-v1', tutorialShift: true, raceV2:raceV2Development });
    engineOriginPrimary = false;
    if (!raceV2Development) assignUsageId(engine);
    knownMessageDeliveries=null; messageAttentionStarted=null;
    if(!preparedEngine)engine.start();

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

  function confirmNextPlay(kind, details = {}) {
    if(engine.state.life?.policyVersion==='five-slot-v1') {
      const active=engine.state.life.schedule.active,extend=Boolean(active?.kind==='session' && active[`${kind}Used`]);
      const operationId=`play-ui:${engine.log.length}`,prepared=engine.prepareFiveSlotPlay(kind,{operationId,extend});
      if(!prepared.ok){if(prepared.reason==='financial_obligation_due' && beginDueDefault({kind:'play',play:kind,...details},kind==='pull'?'make this pull':'start this race'))return {ok:false,reason:'pending_default'};appNotice('Resolve the current commitment before playing.');return {ok:false};}
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
      if(raceV2Development&&kind==='race'&&proposal.schedule.destination.day>engine.state.life.schedule.day){
        const duck=BANNER_1_ROSTER.find(d=>d.id===details.duckId),day=proposal.schedule.destination.day,elapsed=day-engine.state.life.schedule.day;
        if(!duck)return {ok:false};const rest=makeRaceRestEvidence(engine.log.entries,duck.id,duck.speed),recoveryDays=Math.max(0,(engine.state.raceGrowth.ducks[duck.id]?.recoveryDays??0)-elapsed);
        const facts=raceCandidateFacts({duckId:duck.id,baseRating:duck.speed,restFactor:rest.restFactor,historyLimited:rest.historyLimited,recoveryDays,referenceDay:day,upgradeAvailable:Boolean(engine.state.raceTrialAvailable),upgradeSelected:details.useTrial===true});
        if(!globalThis.confirm(`On day ${day}, ${duck.name} will have ${recoveryDays} recovery day${recoveryDays===1?'':'s'} remaining and a pre-affine race rating of ${formatRaceRating(Number(facts.effectiveRatingMicros)/1000000)}. Continue?`))return {ok:false};
      }
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

  function messagesAvailable() {
    return Boolean(isMessagesPolicy(engine?.messagesPolicy) && !engine.isTerminal() && !settingsOpen && !activeModal && !pendingDefault &&
      !lifeUi.held && !lifeUi.renOpen && !engine.state.life?.story47 && !engine.state.life?.social46?.scene &&
      (!lifeViewHandle || lifeViewHandle.canSuspendForMessages?.()) &&
      !engine.state.pendingReveals.some(x=>!x.revealed) && !document.querySelector('.stage-transition') &&
      !['life_race','life_race_result','life_gacha','duck_dex'].includes(currentStep) &&
      (isLifeStep(currentStep) || (currentStep==='life_phone' && phoneOpen)));
  }

  function syncMessagesAvailability() {
    const button=document.querySelector('#btn-messages');if(!button || !engine)return;
    const available=messagesAvailable(),count=messagesForEngine(engine).projection.unreadThreads;
    button.setAttribute('aria-label',`Messages, ${count} unread ${count===1?'thread':'threads'}${available?'':', temporarily unavailable'}`);
    const badge=button.querySelector('[data-message-count]');if(badge){badge.textContent=count?String(count):'';badge.hidden=!count;}
    if(!available && document.activeElement===button)document.querySelector('#btn-open-settings')?.focus();
    button.disabled=!available;button.title=available?'Messages':'Messages temporarily unavailable';
    const layer=document.querySelector('#messages-layer');
    if(messagesHandle && layer && layer.hidden && available) {layer.hidden=false;lifeViewHandle?.suspendForMessages?.();messagesHandle.refresh();}
  }

  function positionMessagesLayer() {
    const layer=document.querySelector('#messages-layer'),hud=document.querySelector('#hud-container');
    if(!layer || !hud)return;
    // Include actual controls as well as the HUD box if responsive layout overflows it.
    const edges=[hud,...hud.querySelectorAll('.hud-header, .hud-controls, .hud-controls button')].map(el=>el.getBoundingClientRect().bottom);
    const bottom=Math.ceil(Math.max(0,...edges));
    layer.style.top=`${bottom}px`;layer.style.setProperty('--messages-top',`${bottom}px`);
  }

  function openMessages() {
    if (!messagesAvailable()) return;
    if(messagesHandle)return;
    const layer=document.querySelector('#messages-layer'), host=document.createElement('div');
    positionMessagesLayer();
    const hud=document.querySelector('#hud-container');
    const observer=window.ResizeObserver?new ResizeObserver(positionMessagesLayer):null;observer?.observe(hud);
    window.addEventListener('resize',positionMessagesLayer);window.addEventListener('scroll',positionMessagesLayer,{passive:true});
    messagesGeometryCleanup=()=>{observer?.disconnect();window.removeEventListener('resize',positionMessagesLayer);window.removeEventListener('scroll',positionMessagesLayer);messagesGeometryCleanup=null;};
    layer.hidden=false;layer.replaceChildren(host);host.className='messages-host';
    lifeViewHandle?.suspendForMessages?.();
    const close=()=>{messagesGeometryCleanup?.();messagesHandle=null;layer.hidden=true;layer.replaceChildren();lifeViewHandle?.resumeAfterMessages?.();updateHud();document.querySelector('#btn-messages')?.focus();};
    layer.onclick=e=>{if(isMessagesBackdrop(e.target,layer,host)){e.preventDefault();e.stopPropagation();messagesHandle?.close();}};
    const dismissFromHud=e=>{if(messagesHandle && !layer.hidden){e.preventDefault();e.stopImmediatePropagation();messagesHandle.close();}};
    hud.addEventListener('click',dismissFromHud,true);
    const geometryCleanup=messagesGeometryCleanup;
    messagesGeometryCleanup=()=>{hud.removeEventListener('click',dismissFromHud,true);geometryCleanup?.();};
    const data=messagesForEngine(engine);
    messagesHandle=mountMessages(host,{...data,getCurrentDay:()=>engine.state.life?.schedule?.day,getCurrentLogLength:()=>engine.log.length,isUncovered:()=>!layer.hidden && !settingsOpen && !activeModal && !pendingDefault && messagesAvailable(),onClose:close,
      onDisplay:async ({deliveryId,revision})=>{
        if(!messagesAvailable())return false;
        let shown=null;
        if(deliveryId==='launch:invitation:1')shown=engine.showLifeInvitation() ?? engine.showExpiredLaunchHistory();
        if(deliveryId==='launch:ack:1')shown=engine.showLifeAcknowledgment();
        if(deliveryId.startsWith('ren:')) {
          if(!renCurrentIds(engine.state.life).includes(deliveryId)) {shown=engine.showRenMessageHistory(deliveryId,revision);if(shown)maybeAutosave();return Boolean(shown || engine.log.entries.some(e=>e.type==='message_history_shown' && e.payload?.id===deliveryId));}
          const social=engine.state.life.social46;
          if(!renMessageShown(engine.state.life,deliveryId)) {
            const type=deliveryId.startsWith('ren:offer:')?'social46_offer_shown':deliveryId.startsWith('ren:ack:')?'social46_ack_shown':deliveryId.startsWith('ren:floor:')?'social46_floor_shown':deliveryId.startsWith('ren:response-reply:')?'social46_response_reply_shown':'social46_response_shown';
            const id=deliveryId.startsWith('ren:response')?social.response?.id:social.pending?.id;
            const result=engine.applyFiveSlotSocialAction({operationId:`messages-shown:${engine.log.length}`,action:{type,id}},engine.log.length);
            if(!result.ok)return false;shown=true;
          }
        }
        if(shown)maybeAutosave();return true;
      },
      onRead:async ({deliveryId,revision})=>{
        if(!messagesAvailable())return false;
        if(!engine.readMessage(deliveryId,revision))return false;
        maybeAutosave();syncMessagesAvailability();return true;
      },
      onAction:({deliveryId,revision,choice,amountCents,actionLogLength})=>{
        if(messagesAvailable() && revision===1 && deliveryId.startsWith('ren:') && !deliveryId.startsWith('ren:offer:') && deliveryId!=='ren:contact:1') {
          const life=engine.state.life,s=life.social46,p=s?.pending,r=s?.response;
          if(!renCurrentIds(life).includes(deliveryId) || !renMessageShown(life,deliveryId))return;
          let action=null;
          if(choice==='cancel' && p)action={type:'social46_cancel',id:p.id};
          else if(choice==='plan-reschedule' && p)action={type:'social46_reschedule_plan',id:p.id,day:p.day+1};
          else if(choice==='floor' && p)action={type:'social46_confirm_floor',id:p.id};
          else if(choice==='response-dismiss' && r)action={type:'social46_response_dismiss',id:r.id};
          else if(choice?.startsWith('response-') && r)action={type:'social46_response_reply',id:r.id,choice:choice.slice('response-'.length)};
          if(!action)return;
          const result=engine.applyFiveSlotSocialAction({operationId:`messages-ren:${engine.log.length}`,action},engine.log.length);
          if(result.ok){maybeAutosave();renderApp();if(messagesHandle){const fresh=messagesForEngine(engine);messagesHandle.update(fresh.deliveries,fresh.readKeys);if(document.querySelector('#messages-layer')?.hidden)messagesHandle.suspend();}}
          return;
        }
        if(messagesAvailable() && revision===1 && deliveryId.startsWith('ren:offer:')) {
          const life=engine.state.life,p=life.social46?.pending;
          if(!p || renOfferId(life)!==deliveryId || !p.shown || !['accept','decline','reschedule','suggest'].includes(choice))return;
          const action=choice==='suggest'?{type:'social46_suggest_activity',id:p.id,activity:p.activity==='door'?'game':'door'}:{type:'social46_reply',id:p.id,choice,...(choice==='reschedule'?{day:p.day+1}:{})};
          const result=engine.applyFiveSlotSocialAction({operationId:`messages-ren:${engine.log.length}`,action},engine.log.length);
          if(result.ok){maybeAutosave();renderApp();if(messagesHandle){const fresh=messagesForEngine(engine);messagesHandle.update(fresh.deliveries,fresh.readKeys);if(document.querySelector('#messages-layer')?.hidden)messagesHandle.suspend();}}
          return;
        }
        if(messagesAvailable() && revision===1 && deliveryId==='ren:contact:1') {
          const social=engine.state.life?.social46;
          if(!social?.introShown || (social.revision===2 && !social.intro?.numberShared))return;
          const result=lifeCallbacks().onSocialOpen(engine.log.length);
          if(result?.ok){messagesHandle?.close();lifeUi.renOpen=true;renderApp();}
          return;
        }
        if(messagesAvailable() && revision===1 && deliveryId==='launch:invitation:1') {
          const life=engine.state.life,windowOpen=life.schedule.day===1 && ['morning','midday','early-evening'].includes(life.schedule.slot);
          if(windowOpen && engine.replyLifeInvitation()){maybeAutosave();const fresh=messagesForEngine(engine);messagesHandle?.update(fresh.deliveries,fresh.readKeys);syncMessagesAvailability();}
          return;
        }
        if(!messagesAvailable() || revision!==1 || !deliveryId.startsWith('loan:statement:'))return;
        const loanId=deliveryId.slice('loan:statement:'.length);
        if(engine.state.life.schedule.recovery || engine.checkDueObligations().bills.length)return;
        const result=lifeCallbacks().onMessagesEarlyRepay(actionLogLength,loanId,amountCents);
        if(result?.ok){
          maybeAutosave();renderApp();
          if(messagesHandle){const fresh=messagesForEngine(engine);messagesHandle.update(fresh.deliveries,fresh.readKeys);if(document.querySelector('#messages-layer')?.hidden)messagesHandle.suspend();}
        }
      }});
  }

  function updateHud() {
    const hudContainer = document.querySelector('#hud-container');
    if (!hudContainer || !engine) return;

    renderHud(hudContainer, engine, duckSvgUrl, {
      onMessages:isMessagesPolicy(engine.messagesPolicy)?openMessages:null,
      messageCount:isMessagesPolicy(engine.messagesPolicy)?messagesForEngine(engine).projection.unreadThreads:0,
      messagesAvailable:messagesAvailable(),
      onSave: saveNow,
      onSettings: () => {
        pendingDefault = null;
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
        pendingDefault = null;
        stageTransition?.cancel();
        if (engine.isTerminal()) return;
        if(raceV2Development)engine.cancelRaceV2();
        engine.clickUninstall();
        activeModal = 'retention';
        maybeAutosave(); // Keep the displayed retention prompt and original interrupted context across reload.
        renderApp();
      },
    });
    if(isMessagesPolicy(engine.messagesPolicy)) {
      const ids=engine.log.entries.filter(e=>e.type==='message_delivered').map(e=>e.payload.id);
      const arrived=knownMessageDeliveries && ids.some(id=>!knownMessageDeliveries.has(id));
      knownMessageDeliveries=new Set(ids);
      if(arrived) messageAttentionStarted=performance.now();
      const elapsed=messageAttentionStarted===null?Infinity:performance.now()-messageAttentionStarted;
      if(elapsed<2400 && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        const animation=hudContainer.querySelector('#btn-messages')?.animate?.([
          {transform:'scale(1)',boxShadow:'0 0 0 0 transparent'},
          {transform:'scale(1.12)',boxShadow:'0 0 0 5px #e9a75288'},
          {transform:'scale(1)',boxShadow:'0 0 0 0 transparent'}
        ],{duration:1200,iterations:2,easing:'ease-out'});
        if(animation) animation.currentTime=elapsed;
      }

    }
  }

  async function saveNow() {
    if(raceV2Development){const result=schema6Session.save(engine);checkStorageResult(result);updateWarningBanner();return result;}
    let res;
    if (welcomePreservation) {
      globalThis.alert('This temporary session cannot overwrite the preserved saved data.');
      return { success: false, inMemory: true, preservedSnapshot: true };
    }
    if (unsupportedRenPreservation) {
      globalThis.alert('This temporary session cannot overwrite the preserved Ren save.');
      return { success: false, inMemory: true, preservedSnapshot: true };
    }
    if (pendingRestartSave) { const result = await savePendingRestart(); checkStorageResult(result); updateWarningBanner(); return result; }
    if (isTemporaryPreservationMode()) {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm('An existing save snapshot is currently preserved. Overwrite it with this session?')
        : false;
      if (confirmed) {
        setTemporaryPreservationMode(false);
        try { res = await usageCoordinator.save(engine.toEnvelope()); } catch (error) { res = storageFailure(error); }
      } else {
        return { success:false, preservedSnapshot:true };
      }
    } else {
      try { assignUsageId(engine); res = await usageCoordinator.save(engine.toEnvelope()); } catch (error) { res = storageFailure(error); }
    }
    checkStorageResult(res);
    updateWarningBanner();
    return res;
  }

  function beginDueDefault(request, label) {
    if (!engine.classifyFiveSlotDueCommitment(request).ok) return false;
    if(!engine.fiveSlotDueOptionsWereShown()) {
      // Financial evidence is recorded only by the real payment panel, whose
      // controls let the player inspect and resolve the current obligations.
      currentStep=lifeSurface(engine);engine.state.step=currentStep;phoneOpen=false;
      lifeUi.fiveDueKey=null;lifeUi.held=null;
      queueMicrotask(()=>renderApp());
      return true;
    }
    pendingDefault={request:structuredClone(request),label,selected:null,snapshot:null,returnFocus:document.activeElement};
    queueMicrotask(() => { if(pendingDefault && !pendingDefault.snapshot) renderApp(); });
    return true;
  }

  function renderDueDefault(container) {
    const pending=pendingDefault, due=fiveSlotDueDecision(engine);
    if(!pending || !due || !engine.classifyFiveSlotDueCommitment(pending.request).ok) { pendingDefault=null; return; }
    const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
    const headerBottom=Math.max(0,document.querySelector('#hud-container')?.getBoundingClientRect().bottom??0);
    backdrop.style.top=`${headerBottom}px`;
    const panel=document.createElement('section');panel.className='modal-card life-decide life-default-card';panel.style.maxHeight=`calc(100vh - ${headerBottom+32}px)`;panel.style.overflow='auto';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-labelledby','due-default-heading');
    const body=document.createElement('div');body.className='life-decide-body';panel.append(body);backdrop.append(panel);container.append(backdrop);
    const heading=document.createElement('h2');heading.id='due-default-heading';heading.tabIndex=-1;heading.textContent='Decide';body.append(heading);
    let actions=null;
    const paragraph=text=>{const p=document.createElement('p');p.textContent=text;if(actions)body.insertBefore(p,actions);else body.append(p);};
    paragraph(`You chose to ${pending.label}.`);
    paragraph(`Cash on hand: $${(engine.state.cash).toFixed(2)}.`);
    for(const bill of due.bills) {
      const raw=engine.checkDueObligations().bills.find(item=>item.id===bill.id);
      paragraph(`${bill.label}: $${(bill.amountCents/100).toFixed(2)}, due Day ${raw.due.day} (${raw.due.slot.replaceAll('-',' ')}).`);
    }
    actions=document.createElement('div');actions.className='life-decide-actions';body.append(actions);
    const button=(label,handler)=>{const b=document.createElement('button');b.type='button';b.className='life-btn';b.textContent=label;b.addEventListener('click',handler);actions.append(b);return b;};
    const cancel=()=>{const focus=pending.returnFocus, id=focus?.id, object=focus?.dataset?.obj;pendingDefault=null;renderApp();const restored=(id && document.getElementById(id)) || (object && document.querySelector(`.life-obj[data-obj="${CSS.escape(object)}"]`));(restored ?? document.querySelector('#main-content button:not(:disabled)'))?.focus();};
    backdrop.addEventListener('click',event=>{if(event.target===backdrop)cancel();});
    backdrop.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancel();}});
    if(!pending.snapshot) {
      // Evidence must come from the actionable payment panel, not this summary.
      if(!engine.fiveSlotDueOptionsWereShown()){pendingDefault=null;backdrop.remove();return;}
      pending.snapshot=snapshotDefaultIntent(engine,pending.request);
    }
    if(!pending.snapshot || !defaultIntentIsCurrent(engine,pending.snapshot)){cancel();return;}
    const selected=due.bills.length===1?due.bills[0]:due.bills.find(bill=>bill.id===pending.selected);
    if(!selected) {
      paragraph('Choose a payment to inspect. No payment or other action will happen yet.');
      for(const bill of due.bills)button(`Inspect ${bill.label}`,()=>{pending.selected=bill.id;container.innerHTML='';renderDueDefault(container);});
      button('Reconsider',cancel);heading.focus({preventScroll:true});return;
    }
    paragraph(selected.id.startsWith('loan-')?'The payday loan is still unpaid. Continuing without paying will end the game.':'Rent is still unpaid. Continuing without paying will end the game.');
    if(selected.id==='rent-2')paragraph('You will lose the apartment.');
    if(due.bills.length>1)button('Back to payments',()=>{pending.selected=null;container.innerHTML='';renderDueDefault(container);});
    button('Reconsider',cancel);
    button('Continue without paying',event=>{
      event.currentTarget.disabled=true;
      if(!defaultIntentIsCurrent(engine,pending.snapshot) || !selectedDefaultBill(pending.snapshot,selected.id) || !engine.classifyFiveSlotDueCommitment(pending.request).ok){cancel();return;}
      const action=selected.id.startsWith('loan-')?{type:'leave_unpaid',loanId:selected.id}:{type:'leave_unpaid',billId:selected.id};
      const prepared=engine.prepareFiveSlotAction({domain:'finance',action:{...action,id:`default-ui:${engine.log.length}`,confirmed:true,optionsDisclosed:true}});
      const result=prepared.ok?engine.commitFiveSlotAction(prepared.proposal):prepared;
      pendingDefault=null;
      if(result.ok){currentStep='receipt';engine.state.step='receipt';phoneOpen=true;maybeAutosave();}
      renderApp();
    });
    heading.focus({preventScroll:true});
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
          const decision = confirmNextPlay('pull',{promotion:true}); if (!decision.ok) return;
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
          const decision = confirmNextPlay('pull',{promotion:false,count}); if (!decision.ok) return;
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
          const decision = confirmNextPlay('race',{raceNumber,duckId,stance,useTrial}); if (!decision.ok) return null;
          const conflict = life.policyVersion==='five-slot-v1'?{ok:true,confirmSocial:false}:resolveSocialConflict({ type: decision.confirmNext ? 'phone_commit_next' : 'phone_commit' }); if (!conflict.ok) return null;
          if(raceV2Development){
            const owner=engine;appNotice('Preparing this race… Settings and exit remain available.');
            void owner.runRaceV2(raceNumber,duckId,stance,{useTrial,...decision,confirmSocial:conflict.confirmSocial}).then(attempt=>{
              if(owner!==engine||!attempt||engine.isTerminal())return;
              currentStep='life_race_result';engine.state.step=currentStep;maybeAutosave();updateHud();renderApp();
            }).catch(()=>{if(owner===engine&&!engine.isTerminal())appNotice('Race preparation stopped; time and resources were not changed.');});return null;
          }
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
        onAssignAbility: (duckId,ability) => { if(!raceV2Development||!globalThis.confirm(`Permanently assign ${ability==='bounce'?'Bounce':'Crowd Surge'} to this duck? This choice cannot be changed.`))return false;const assigned=engine.assignRaceV2Ability(duckId,ability);if(assigned)maybeAutosave();return assigned; },
        onAction: (action, details) => { engine.recordRacePlaybackAction(raceNumber, action, details); maybeAutosave(); },
        onCueDisplayed: (cue) => { engine.recordRaceCueDisplayed(raceNumber, cue); maybeAutosave(); },
        onProceed: () => { currentStep = 'life_phone'; engine.state.step = currentStep; maybeAutosave(); renderApp(); },
      }, { active: !settingsOpen && !activeModal, initialSnapshot: racePlaybackSnapshot, initialSelection: dexReturnRaceSelection, version2:raceV2Development });
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
        onAssignAbility: (duckId,ability) => { if(!raceV2Development||!globalThis.confirm(`Permanently assign ${ability==='bounce'?'Bounce':'Crowd Surge'} to this duck? This choice cannot be changed.`))return false;const assigned=engine.assignRaceV2Ability(duckId,ability);if(assigned)maybeAutosave();return assigned; },
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
        onPresented: previousPhase => {
          if (shouldSaveReceiptPresentation(previousPhase, raceV2Development)) maybeAutosave();
          if (!raceV2Development && usageCoordinator && !unsupportedRenPreservation) {
            try { void usageCoordinator.archive(usageRun(engine)).catch(storageFailure); } catch (error) { storageFailure(error); }
          }
        },
        onFreshRun: () => {
          if (!raceV2Development) { showWelcome(); return; }
          if (unsupportedRenPreservation) { startFreshRun(false); return; }
          if(raceV2Development){if(!schema6Session.clear().success)return;}
          startFreshRun(true);
        },
      }, { returnToWelcome: !raceV2Development });
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

    if (pendingDefault && !settingsOpen && !activeModal) renderDueDefault(modalContainer);
    if (settingsOpen) {
      settingsCleanup = renderSettingsModal(modalContainer, {
        autosaveEnabled: engine.autosaveEnabled,
        animatePhoneGlow,
        autosaveLocked: isTemporaryPreservationMode() || engine.isTerminal(),
        saveDisabled: engine.isTerminal(),
        onAutosaveChange: (checked) => {
          if (engine.isTerminal()) return;
          if (!isTemporaryPreservationMode()) welcomeAutosave = checked;
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
    if(messagesHandle) {
      const layer=document.querySelector('#messages-layer');
      if(engine.isTerminal()) { messagesHandle.destroy();messagesGeometryCleanup?.();messagesHandle=null;layer.hidden=true; }
      else {const covered=!messagesAvailable();layer.hidden=covered;if(covered)messagesHandle.suspend();else {lifeViewHandle?.suspendForMessages?.();messagesHandle.refresh();}}
    }
    syncMessagesAvailability();
    if(messagesHandle)positionMessagesLayer();
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
    const prepared=engine.prepareFiveSlotAction(intent);if(!prepared.ok){
      if(prepared.reason==='financial_obligation_due' && beginDueDefault({kind:'schedule',action},action.type==='sleep'?'go to sleep':action.type==='meal'?'buy a meal':action.kind==='early-bed'?'turn in early':action.type==='complete'?'finish this activity':'continue'))return {ok:false,reason:'pending_default'};
      return prepared;
    }
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
      onMessagesAvailabilityChange:syncMessagesAvailability,
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
        if(result.reason==='financial_obligation_due')beginDueDefault({kind:'social',action:intent},'continue your time with Ren');
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
      onMessagesEarlyRepay: commit((loanId,expectedTotal) => payMessageLoan(engine,loanId,expectedTotal,engine.log.length)),
      onFiveSlotEarlyRepay: commit((loanId) => {
        if(!isMessagesPolicy(engine.messagesPolicy)) {
          const loan=engine.state.life.finance.loans.find(item=>item.id===loanId && item.status==='pending');
          if(!loan || Math.round(engine.state.cash*100)<loan.totalCents)return {ok:false,reason:'loan_unavailable'};
          if(!globalThis.confirm(`Repay the full $${(loan.totalCents/100).toFixed(2)} payday loan now?`))return {ok:false,reason:'cancelled'};
          const p=engine.prepareFiveSlotAction({domain:'finance',action:{type:'repay_loan',loanId,id:`repay-ui:${engine.log.length}`}});
          return p.ok?engine.commitFiveSlotAction(p.proposal):p;
        }
        return confirmApartmentLoan(engine,loanId,amount=>globalThis.confirm(`Repay the full $${(amount/100).toFixed(2)} payday loan now?`));
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
        if(result?.reason==='financial_obligation_due')beginDueDefault({kind:'work'},'leave for work');
        if (result.ok) { engine.state.step = lifeSurface(engine); resetLifeUi(); }
        return result;
      }),
      onCompleteWork: commit((id) => engine.applyLifeIntent({ type: 'complete_work', id })),
      onLeisure: commit(() => commitLifeWithSocial({ type: 'leisure' })),
      onBeginStoryActivity: commit((choice) => {
        if(engine.state.life?.policyVersion!=='five-slot-v1')return commitLifeWithSocial({ type: 'begin_activity47', version: choice === 'call_mom' ? 3 : 2, choice });
        const operationId=`activity-ui:${engine.log.length}`;let preview=engine.prepareFiveSlotActivityStory(choice,operationId),conflictChoice=null;
        if(!preview.ok){if(preview.reason==='financial_obligation_due')beginDueDefault({kind:'activity',choice},choice==='call_mom'?'call Mom':'sit with your duck');return preview;}
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
          if(result.reason==='financial_obligation_due' && type==='complete')beginDueDefault({kind:'story',storyKind:'activity',id:story.id},'finish this activity');
          if(result.ok && type==='dismiss'){engine.state.step=lifeSurface(engine);resetLifeUi();}return result;
        }
        if (engine.state.life?.policyVersion === 'five-slot-v1' && story.kind === 'work') {
          const type = story.stage === 'commute' ? 'advance' : story.stage === 'work' ? 'complete' : 'dismiss';
          const result = engine.applyFiveSlotWorkStory({ type, id: story.id, operationId: `work-story-ui:${engine.log.length}`, confirmed: true }, engine.log.length);
          if(result.reason==='financial_obligation_due' && type==='complete')beginDueDefault({kind:'story',storyKind:'work',id:story.id},'finish your shift');
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
        const activeFiveSlotSession = life.policyVersion === 'five-slot-v1' && life.schedule.active?.kind === 'session';
        const pendingReveals = engine.state.pendingReveals.some(draw => !draw.revealed);
        engine.state.step = pendingReveals && activeFiveSlotSession ? 'life_gacha'
          : ((life.session || activeFiveSlotSession) && engine.state.lifePhoneReturnStep) || 'life_phone';
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
          if(result.reason==='pending_default')return null;
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
