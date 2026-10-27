// src/ui/desk-view.js
// Apartment desk view introducing the physical rubber duck companion and launching the app.

export function renderDeskView(container, duckSvgUrl, onStartApp, options = {}) {
  const returning = Boolean(options.returning);
  const companion = options.companion || {};
  const companionName = escapeHtml(companion.name || 'Professor Quacks');
  container.innerHTML = `
    <div class="desk-container">
      <div class="desk-card">
        <div class="desk-stage">
          <div class="desk-duck-display">
            <div class="desk-duck-halo">
              <img class="duck-img desk-companion-art" src="${duckSvgUrl}" alt="Physical Rubber Duck Companion" width="120" height="120" />
            </div>
            <div class="desk-duck-caption">Your Physical Desk Companion</div>
          </div>

          <div class="desk-phone" aria-label="Your phone">
            <div class="desk-phone-screen">
              <div class="desk-phone-status" aria-hidden="true"><span>9:41</span><span>● ● ●</span></div>
              <div class="desk-phone-content">
                <div class="desk-phone-brand">QUACKPOT</div>
                ${returning
                  ? '<div class="desk-phone-heading">Welcome back</div><p>Your game is ready when you are.</p>'
                  : '<div class="desk-phone-heading">Welcome Festival</div><p>10 FREE pulls waiting!</p><span class="desk-phone-note">Limited-time invitation</span>'}
              </div>
              <div class="desk-phone-home" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <div class="desk-intro">
          <h2>${returning ? 'Back at Your Apartment' : 'Apartment Desk • Day 1 Morning'}</h2>
          <p class="desk-narrative">
            Sitting on your apartment desk is an inanimate rubber duck. It doesn't move or talk,
            but having it around makes your cramped room feel a little more like home.
          </p>
          <p class="desk-narrative">${returning
            ? `Your rubber duck, <strong>${companionName}</strong>, rests beside the phone.`
            : 'Your phone has a new invitation from <strong>Quackpot</strong>.'}</p>
        </div>

        <form id="desk-companion-form" class="companion-setup-form">
          ${returning ? '' : `<div class="form-group">
            <label for="companion-name-input">Name your rubber duck:</label>
            <input type="text" id="companion-name-input" class="form-input" value="Professor Quacks" maxlength="30" />
          </div>`}

          ${returning ? '' : `<div class="form-group">
            <label for="companion-style-select">Companion Style:</label>
            <select id="companion-style-select" class="form-select">
              <option value="classic-yellow" selected>Classic Yellow (Timeless Rubber Duck)</option>
              <option value="pirate-hat">Captain Quack (Felt Pirate Hat)</option>
              <option value="cyber-visor">Cyber Mallard (Neon Visor)</option>
            </select>
          </div>`}

          ${returning ? '' : `<div class="form-group">
            <label class="hud-autosave-toggle" style="justify-content: flex-start; margin-top: 0.5rem;">
              <input type="checkbox" id="desk-autosave-checkbox" checked />
              <span>Enable automatic saving at safe junctures (recommended)</span>
            </label>
          </div>`}

          <div class="desk-actions">
            <button type="submit" id="btn-start-app" class="btn btn-primary btn-lg">
              ${returning ? 'Open Quackpot' : '📱 Open Quackpot & Claim 10-Pull'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#desk-companion-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = container.querySelector('#companion-name-input');
      const styleSelect = container.querySelector('#companion-style-select');
      const autosaveCheckbox = container.querySelector('#desk-autosave-checkbox');
      const name = nameInput?.value?.trim() || companion.name || 'Professor Quacks';
      const style = styleSelect?.value || 'classic-yellow';
      const autosaveEnabled = autosaveCheckbox ? autosaveCheckbox.checked : true;
      onStartApp({ name, style, autosaveEnabled, returning });
    });
  }
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
