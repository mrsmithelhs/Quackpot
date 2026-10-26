export function renderSettingsModal(container, options = {}) {
  const { autosaveEnabled, autosaveLocked, saveDisabled = false, onAutosaveChange, onSave, onClose } = options;
  container.innerHTML = `
    <div class="modal-backdrop settings-backdrop" data-settings-backdrop>
      <section class="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1">
        <button type="button" class="settings-close" data-settings-close aria-label="Close settings">×</button>
        <h2 id="settings-title">Settings</h2>
        <p class="settings-description">Saving stays in this browser. If browser storage is unavailable, the game will tell you when progress is only temporary.</p>
        <label class="settings-row">
          <input type="checkbox" data-settings-autosave ${autosaveEnabled ? 'checked' : ''} ${autosaveLocked ? 'disabled' : ''}>
          <span><strong>Automatic saving</strong><small>Save at safe points during play</small></span>
        </label>
        <div class="settings-actions">
          <button type="button" class="btn btn-secondary" data-settings-save ${saveDisabled ? 'disabled aria-disabled="true"' : ''}>Save now</button>
          <button type="button" class="btn btn-primary" data-settings-done>Done</button>
        </div>
        <p class="settings-save-status" data-settings-status role="status" aria-live="polite"></p>
        <details class="settings-credits">
          <summary>Credits and asset notices</summary>
          <p>No third-party audio recordings are bundled in this build. Credits for selected assets will appear here when they are added.</p>
        </details>
      </section>
    </div>
  `;

  const backdrop = container.querySelector('[data-settings-backdrop]');
  const dialog = container.querySelector('[role="dialog"]');
  const closeButton = container.querySelector('[data-settings-close]');
  const doneButton = container.querySelector('[data-settings-done]');
  const autosaveInput = container.querySelector('[data-settings-autosave]');
  const saveButton = container.querySelector('[data-settings-save]');
  const priorInert = new Map();

  for (const sibling of container.parentElement?.children || []) {
    if (sibling === container) continue;
    priorInert.set(sibling, Boolean(sibling.inert));
    sibling.inert = true;
  }

  const close = () => onClose?.();
  closeButton.addEventListener('click', close);
  doneButton.addEventListener('click', close);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  autosaveInput.addEventListener('change', (event) => onAutosaveChange?.(event.target.checked));
  saveButton.addEventListener('click', () => {
    if (saveDisabled) return;
    const result = onSave?.();
    const status = container.querySelector('[data-settings-status]');
    if (!status) return;
    status.textContent = result?.success
      ? (result.inMemory ? 'This session is saved temporarily in memory. It will not survive a reload.' : 'Saved in this browser.')
      : result?.preservedSnapshot
        ? 'The previous save is preserved. This session was not written to it.'
        : `Save failed${result?.error ? `: ${result.error}` : '.'}`;
  });

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', onKeydown);
  (closeButton || dialog).focus();

  return () => {
    document.removeEventListener('keydown', onKeydown);
    for (const [element, wasInert] of priorInert) element.inert = wasInert;
  };
}
