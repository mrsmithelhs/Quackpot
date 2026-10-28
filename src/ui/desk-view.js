import { buildApartmentDesk } from './apartment-view.mjs';
import { createAmbientGlowController } from './ambient-glow-controller.mjs';

// Production apartment desk: static scene art with real HTML controls and invitation copy.
export function renderDeskView(container, _duckSvgUrl, onStartApp, options = {}) {
  const returning = Boolean(options.returning);
  const companion = options.companion || {};
  const presentation = buildApartmentDesk({ returning, companion });
  const companionName = escapeHtml(presentation.companionName);
  const { heading, message, action } = presentation.phone;
  const phoneLabel = returning ? 'Open Quackpot' : 'Open Quackpot and claim the 10-pull invitation';

  container.innerHTML = `
    <div class="desk-container apartment-desk-container">
      <div class="desk-card apartment-desk-card">
        <form id="desk-companion-form" class="apartment-desk-form">
          ${returning ? '' : `<div class="form-group">
            <label for="companion-name-input">Name your rubber duck:</label>
            <input type="text" id="companion-name-input" class="form-input" value="Professor Quacks" maxlength="30" />
          </div>
          <div class="form-group">
            <label class="hud-autosave-toggle" style="justify-content: flex-start; margin-top: 0.5rem;">
              <input type="checkbox" id="desk-autosave-checkbox" checked />
              <span>Enable automatic saving at safe junctures (recommended)</span>
            </label>
          </div>`}
        </form>
        <div class="apartment-desk-scene" aria-label="Apartment desk with your still rubber duck and phone">
          <div class="apartment-art-frame">
            ${presentation.scene}
            <div class="apartment-phone-glow" aria-hidden="true"></div>
          </div>
          <div class="apartment-phone-content" aria-label="Phone invitation">
            <span class="apartment-phone-brand" aria-hidden="true">QUACKPOT</span>
            <h2 class="apartment-phone-heading">${heading}</h2>
            <p class="apartment-phone-message">${message}</p>
            <button type="submit" form="desk-companion-form" id="btn-start-app" class="apartment-phone-action" aria-label="${phoneLabel}">${action}</button>
          </div>
        </div>
        <div class="apartment-desk-copy">
          <h2>${returning ? 'Back at Your Apartment' : 'Apartment Desk · Day 1 Morning'}</h2>
          <p class="desk-narrative">Your rubber duck rests beside your phone.</p>
          <p class="desk-narrative">${returning
            ? `Your rubber duck, <strong>${companionName}</strong>, rests beside the phone.`
            : 'Your phone has a new invitation from <strong>Quackpot</strong>.'}</p>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#desk-companion-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = container.querySelector('#companion-name-input');
    const autosaveCheckbox = container.querySelector('#desk-autosave-checkbox');
    const name = nameInput?.value?.trim() || companion.name || 'Professor Quacks';
    const style = companion.style || 'classic-yellow';
    const autosaveEnabled = autosaveCheckbox ? autosaveCheckbox.checked : true;
    onStartApp({ name, style, autosaveEnabled, returning });
  });

  const glow = createAmbientGlowController(container, {
    active: options.phoneGlowActive !== false,
    animateEnabled: options.animatePhoneGlow !== false,
  });
  return { destroy: () => glow.destroy() };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}
