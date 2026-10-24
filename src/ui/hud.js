// src/ui/hud.js
// Persistent HUD displaying clock, resources, save controls, and persistent Uninstall button.

export function renderHud(container, engine, duckSvgUrl, callbacks = {}) {
  const { onSave, onUninstall, onToggleAutosave } = callbacks;
  const state = engine.state;

  container.innerHTML = `
    <header class="hud-header">
      <div class="hud-top-row">
        <div class="hud-brand">
          <div class="hud-duck-thumb">
            <img class="duck-img" src="${duckSvgUrl}" alt="${state.physicalCompanion?.name || 'Professor Quacks'}" width="120" height="120" />
          </div>
          <div>
            <h1 id="spike-title" class="sr-only">Quackpot Static Spike</h1>
            <div class="hud-title" aria-label="Quackpot Prototype">
              <span class="title-quack">QUACK</span><span class="title-pot">POT</span>
              <span class="tag-prototype">Slice v0.3</span>
            </div>
            <div class="hud-companion-info">
              Companion: <strong>${state.physicalCompanion?.name || 'Professor Quacks'}</strong>
              <span class="companion-style">(${state.physicalCompanion?.style || 'classic-yellow'})</span>
            </div>
          </div>
        </div>

        <div class="hud-controls">
          <label class="hud-autosave-toggle" title="Toggle automatic saving at safe junctures">
            <input type="checkbox" id="autosave-toggle" ${engine.autosaveEnabled ? 'checked' : ''} />
            <span>Autosave</span>
          </label>
          <button id="btn-manual-save" class="btn btn-secondary btn-sm" title="Save current run state locally">
            💾 Save
          </button>
          <button id="btn-uninstall" class="btn btn-danger btn-sm" title="Uninstall the gacha game">
            ❌ Uninstall
          </button>
        </div>
      </div>

      <div class="hud-status-bar">
        <div class="hud-pill hud-pill-clock" id="hud-clock">
          <span class="pill-icon">📅</span>
          <span class="pill-label">Day ${state.day}:</span>
          <span class="pill-val">${state.clock.label}</span>
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
  const btnUninstall = container.querySelector('#btn-uninstall');
  const toggleAutosave = container.querySelector('#autosave-toggle');
  const saveToast = container.querySelector('#save-notification');

  if (btnSave && onSave) {
    btnSave.addEventListener('click', () => {
      const result = onSave();
      if (saveToast) {
        saveToast.textContent = result?.inMemory
          ? '⚠️ Saved to session memory (storage restricted)'
          : '✓ Saved locally!';
        saveToast.style.display = 'block';
        setTimeout(() => { saveToast.style.display = 'none'; }, 2000);
      }
    });
  }

  if (btnUninstall && onUninstall) {
    btnUninstall.addEventListener('click', onUninstall);
  }

  if (toggleAutosave && onToggleAutosave) {
    toggleAutosave.addEventListener('change', (e) => {
      onToggleAutosave(e.target.checked);
    });
  }
}
