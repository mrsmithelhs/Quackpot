// A bounded recovery surface for an unsupported, unreleased Ren development save.
// Never offers a reset or a write over the saved slot.
export function renderUnsupportedRenSave(container, onTemporary) {
  container.innerHTML = '';
  const overlay = document.createElement('div'); overlay.className = 'modal-backdrop';
  const card = document.createElement('section'); card.className = 'modal-card modal-corrupt ren46-save-compat';
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-labelledby', 'ren-save-heading');
  const heading = document.createElement('h2'); heading.id = 'ren-save-heading'; heading.textContent = 'Ren save from another version';
  const message = document.createElement('p'); message.textContent = 'This save uses a Ren version that this game cannot safely resume. Its original data is preserved. To continue that run, use the compatible version in the same browser.';
  const note = document.createElement('p'); note.textContent = 'You can start a temporary session now. It will not overwrite this save; the game will also try to keep a backup copy.';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'btn btn-primary btn-lg'; button.textContent = 'Play a temporary session';
  button.addEventListener('click', () => { button.disabled = true; onTemporary(); });
  card.append(heading, message, note, button); overlay.append(card); container.append(overlay); button.focus();
}
