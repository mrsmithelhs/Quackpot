import musicProvenance from '../assets/audio/PROVENANCE.md?url';
import tinySynthLicense from '../assets/audio/TINYSYNTH-APACHE-2.0.txt?url';

export function renderSettingsModal(container, options = {}) {
  const { autosaveEnabled, autosaveLocked, animatePhoneGlow = true, saveDisabled = false, openCredits = false, onAutosaveChange, onAnimatePhoneGlowChange, onSave, onClearHistory, onClose } = options;
  container.innerHTML = `
    <div class="modal-backdrop settings-backdrop" data-settings-backdrop>
      <section class="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1">
        <button type="button" class="settings-close" data-settings-close aria-label="Close settings">×</button>
        <h2 id="settings-title">Settings</h2>
        <p class="settings-description">Saving stays in this browser. If browser storage is unavailable, the game will tell you when progress is only temporary.</p>
        ${onClearHistory ? '<p>Usage history is kept in this browser when a Receipt is shown, when you download it, and before a saved run is replaced, even if automatic saving is off. Closing a tab before recording finishes can lose unsaved evidence. Clear history separately below.</p>' : ''}
        <label class="settings-row">
          <input type="checkbox" data-settings-autosave ${autosaveEnabled ? 'checked' : ''} ${autosaveLocked ? 'disabled' : ''}>
          <span><strong>Automatic saving</strong><small>Save at safe points during play</small></span>
        </label>
        <label class="settings-row">
          <input type="checkbox" data-settings-phone-glow ${animatePhoneGlow ? 'checked' : ''}>
          <span><strong>Animate phone glow</strong><small>When off, the phone keeps a soft static glow. Reduced-motion settings also keep it static.</small></span>
        </label>
        <div class="settings-actions">
          <button type="button" class="btn btn-secondary" data-settings-save ${saveDisabled ? 'disabled aria-disabled="true"' : ''}>Save now</button>
          ${onClearHistory ? '<button type="button" class="btn btn-secondary" data-clear-history>Clear usage history</button>' : ''}
          <button type="button" class="btn btn-primary" data-settings-done>Done</button>
        </div>
        <p class="settings-save-status" data-settings-status role="status" aria-live="polite"></p>
        ${onClearHistory ? '<div data-clear-confirm hidden><p>Clear recorded usage history in this browser? Your saved run stays, and may be recorded again.</p><button type="button" data-clear-cancel>Cancel</button><button type="button" data-clear-confirmed>Clear history</button></div>' : ''}
        <details class="settings-credits" ${openCredits ? 'open' : ''}>
          <summary>Credits and asset notices</summary>
          <p>Welcome music: a reconstruction of a Suno-generated Quackpot reference, transcribed with MuScriptor Large by Mirelo and Kyutai and rendered with WebAudio TinySynth by Tatsuya Shinyagaito (g200kg). Piano durations and low-register dynamics were adjusted; the first 30 seconds are used.</p>
          <p>MuScriptor: CC BY-NC 4.0 with additional use conditions. WebAudio TinySynth: Apache License 2.0. <a href="${musicProvenance}" target="_blank" rel="noopener">Music provenance</a> · <a href="${tinySynthLicense}" target="_blank" rel="noopener">TinySynth license</a></p>
        </details>
      </section>
    </div>
  `;

  const backdrop = container.querySelector('[data-settings-backdrop]');
  const dialog = container.querySelector('[role="dialog"]');
  const closeButton = container.querySelector('[data-settings-close]');
  const doneButton = container.querySelector('[data-settings-done]');
  const autosaveInput = container.querySelector('[data-settings-autosave]');
  const phoneGlowInput = container.querySelector('[data-settings-phone-glow]');
  const saveButton = container.querySelector('[data-settings-save]');
  const clearPrompt = container.querySelector('[data-clear-confirm]');
  container.querySelector('[data-clear-history]')?.addEventListener('click', () => {
    clearPrompt.hidden = false;
    container.querySelector('[data-clear-cancel]').focus();
  });
  container.querySelector('[data-clear-cancel]')?.addEventListener('click', () => {
    clearPrompt.hidden = true;
    container.querySelector('[data-clear-history]').focus();
  });
  container.querySelector('[data-clear-confirmed]')?.addEventListener('click', async () => {
    const status = container.querySelector('[data-settings-status]');
    try { await onClearHistory(); clearPrompt.hidden = true; if (status) status.textContent = 'Usage history cleared. Your saved run remains.'; container.querySelector('[data-clear-history]').focus(); }
    catch { if (status) status.textContent = 'Usage history could not be cleared. Try again.'; }
  });
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
  phoneGlowInput.addEventListener('change', (event) => onAnimatePhoneGlowChange?.(event.target.checked));
  saveButton.addEventListener('click', async () => {
    if (saveDisabled) return;
    const result = await onSave?.();
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
    const focusable = [...dialog.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex]:not([tabindex="-1"])',
    )].filter((element) => {
      const closedDetails = element.closest('details:not([open])');
      if (closedDetails && element !== closedDetails.querySelector(':scope > summary')) return false;
      if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
      return element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
    });
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
  (openCredits ? container.querySelector('.settings-credits summary') : closeButton || dialog).focus();

  return () => {
    document.removeEventListener('keydown', onKeydown);
    for (const [element, wasInert] of priorInert) element.inert = wasInert;
  };
}
