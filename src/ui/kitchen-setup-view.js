import { renderScene } from '../assets/apartment/index.mjs';

// Setup belongs to the morning scene. The phone invitation is shown only when opening it really opens the game.
export function renderKitchenSetupView(container, onReady) {
  const { svg } = renderScene({ area: 'kitchen', framing: 'wide', light: 'window', idPrefix: 'morning-setup' });
  container.innerHTML = `<section class="desk-card">
    <h2>Day 1 · Morning in the kitchen</h2>
    <div class="life-scene">${svg}</div>
    <form id="morning-setup-form">
      <div class="form-group"><label for="morning-duck-name">Name your rubber duck</label>
      <input id="morning-duck-name" class="form-input" value="Professor Quacks" maxlength="30"></div>
      <label><input id="morning-autosave" type="checkbox" checked> Enable automatic saving at safe junctures</label>
      <button class="life-btn" type="submit">Start the morning</button>
    </form>
  </section>`;
  container.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    onReady({ name: container.querySelector('#morning-duck-name').value.trim() || 'Professor Quacks',
      autosaveEnabled: container.querySelector('#morning-autosave').checked });
  });
}
