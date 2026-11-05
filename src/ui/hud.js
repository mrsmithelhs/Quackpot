// src/ui/hud.js
// Persistent HUD displaying clock, resources, save controls, and persistent Uninstall button.
import { fiveSlotLabel } from './life/life-routing.mjs';

export function renderHud(container, engine, duckSvgUrl, callbacks = {}) {
  const { onSave, onSettings, onReturnToApartment, onUninstall, onOpenDex, showReturn = false, showDex = false, showEndRun = false, onEndRun, onMessages, messageCount = 0, messagesAvailable = true } = callbacks;
  const state = engine.state;
  const isTerminal = engine.isTerminal();
  const fiveSlot=state.life?.policyVersion==='five-slot-v1';

  container.innerHTML = `
    <header class="hud-header">
      <div class="hud-top-row">
        <div class="hud-brand">
          <div class="hud-duck-thumb">
            <img class="duck-img" src="${duckSvgUrl}" alt="${state.physicalCompanion?.name || 'Professor Quacks'}" width="120" height="120" />
          </div>
          <div>
            <h1 id="spike-title" class="sr-only">Quackpot</h1>
            <div class="hud-title">
              <span class="title-quack">QUACK</span><span class="title-pot">POT</span>
            </div>
            <div class="hud-companion-info">
              Companion: <strong>${state.physicalCompanion?.name || 'Professor Quacks'}</strong>
              <span class="companion-style">(${state.physicalCompanion?.style || 'classic-yellow'})</span>
            </div>
          </div>
        </div>

        <div class="hud-controls">
          ${onMessages && !isTerminal ? `<button id="btn-messages" class="btn btn-secondary btn-sm" aria-label="Messages, ${messageCount} unread ${messageCount === 1 ? 'thread' : 'threads'}${messagesAvailable ? '' : ', temporarily unavailable'}" title="${messagesAvailable ? 'Messages' : 'Messages will be available after this scene'}"><svg class="messages-icon" aria-hidden="true" viewBox="0 0 28 22"><path d="M3 3h14a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5H9l-4 3v-3a5 5 0 0 1-3-5V8a5 5 0 0 1 1-5Z"/><path d="M15 7h6a5 5 0 0 1 5 5v1a5 5 0 0 1-3 4v3l-4-3h-4"/></svg><span class="messages-badge" data-message-count ${messageCount ? '' : 'hidden'} aria-hidden="true">${messageCount || ''}</span></button>` : ''}
          ${onMessages && !isTerminal ? '<span id="messages-status" role="status" aria-live="polite"></span>' : ''}
          <button id="btn-manual-save" class="btn btn-secondary btn-sm" title="${isTerminal ? 'Run record locked' : 'Save current run state locally'}" ${isTerminal ? 'disabled' : ''}>
            ${isTerminal ? 'Locked' : 'Save'}
          </button>
          <button id="btn-open-settings" class="btn btn-secondary btn-sm">Settings</button>
          ${showEndRun && !isTerminal ? `<button id="btn-end-run" class="btn btn-secondary btn-sm">End run &amp; view Receipt</button>` : ''}
          ${showDex && !isTerminal ? `<button id="btn-open-duck-dex" class="btn btn-secondary btn-sm" title="View Duck-Dex Collection">🦆 Duck-Dex</button>` : ''}
          ${showReturn && !isTerminal ? `<button id="btn-return-apartment" class="btn btn-secondary btn-sm">Return to apartment</button>` : ''}
          ${!isTerminal ? `
            <button id="btn-uninstall" class="btn btn-danger btn-sm" title="Uninstall the gacha game">
              ❌ Uninstall
            </button>
          ` : `
            <div class="hud-terminal-pill" title="Run is complete. Receipt presented.">
              🏁 Run Locked
            </div>
          `}
        </div>
      </div>

      <div class="hud-status-bar">
        <div class="hud-pill hud-pill-clock" id="hud-clock">
          <span class="pill-icon">📅</span>
          <span class="pill-label">Day ${state.day}:</span>
          <span class="pill-val">${fiveSlot ? fiveSlotLabel(state.life.schedule.slot) : state.clock.label}</span>
        </div>
        <div class="hud-pill hud-pill-cash ${state.cash === 0 ? 'pill-alert' : ''}" id="hud-cash">
          <span class="pill-icon">💵</span>
          <span class="pill-label">Cash:</span>
          <span class="pill-val">$${state.cash.toFixed(2)}</span>
        </div>
        <div class="hud-pill hud-pill-gems" id="hud-gems">
          <span class="pill-icon">💎</span>
          <span class="pill-label">Gems:</span>
          <span class="pill-val">${state.gems}</span>
        </div>
        <div class="hud-pill hud-pill-health ${state.health <= 20 ? 'pill-alert' : ''}" id="hud-health">
          <span class="pill-icon">❤️</span>
          <span class="pill-label">Health:</span>
          <span class="pill-val">${state.health} HP</span>
        </div>
        ${state.debt > 0 ? `
          <div class="hud-pill hud-pill-debt pill-alert" id="hud-debt">
            <span class="pill-icon">⚠️</span>
            <span class="pill-label">Debt:</span>
            <span class="pill-val">$${state.debt.toFixed(2)}</span>
          </div>
        ` : ''}
      </div>
      <div id="save-notification" class="save-toast" style="display: none;"></div>
    </header>
  `;

  const btnSave = container.querySelector('#btn-manual-save');
  const btnSettings = container.querySelector('#btn-open-settings');
  const btnDex = container.querySelector('#btn-open-duck-dex');
  const btnReturn = container.querySelector('#btn-return-apartment');
  const btnEndRun = container.querySelector('#btn-end-run');
  const btnUninstall = container.querySelector('#btn-uninstall');
  const btnMessages = container.querySelector('#btn-messages');
  const saveToast = container.querySelector('#save-notification');

  if (btnDex && onOpenDex && !isTerminal) {
    btnDex.addEventListener('click', onOpenDex);
  }

  if (btnSave && onSave && !isTerminal) {
    btnSave.addEventListener('click', () => {
      const result = onSave();
      if (saveToast) {
        saveToast.textContent = result?.success
          ? (result.inMemory ? 'Temporary session only; browser storage is unavailable.' : 'Saved in this browser.')
          : result?.preservedSnapshot
            ? 'Save not replaced; the previous snapshot is preserved.'
            : `Save failed${result?.error ? `: ${result.error}` : '.'}`;
        saveToast.className = result?.success && !result?.inMemory ? 'save-toast' : 'save-toast save-toast-warning';
        saveToast.style.display = 'block';
        setTimeout(() => { saveToast.style.display = 'none'; }, 2500);
      }
    });
  }

  if (btnSettings && onSettings) btnSettings.addEventListener('click', onSettings);
  if (btnMessages && onMessages) btnMessages.addEventListener('click', onMessages);
  if (btnReturn && onReturnToApartment) btnReturn.addEventListener('click', onReturnToApartment);

  if (btnEndRun && onEndRun && !isTerminal) btnEndRun.addEventListener('click', onEndRun);

  if (btnUninstall && onUninstall && !isTerminal) {
    btnUninstall.addEventListener('click', onUninstall);
  }
}
