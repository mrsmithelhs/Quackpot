import titleUrl from '../assets/welcome/title-a.svg';
import { createStage } from './welcome/stage.js';
import { createWelcomeAudio } from './welcome-audio.mjs';
import { createConfirmationGate } from './welcome/confirmation.mjs';
import './welcome-view.css';

export const COMPANION_SUGGESTIONS = Object.freeze(['Professor Quacks','Mabel','Pickles','Biscuit','Waffles','Dottie','Noodle','Mochi','Peaches','Clover','Pip','Button','Marigold','Otis','Juniper','Poppy','Alfie','Tilly','Winston','Hazel','Bean','Maple','Rufus','Olive','Muffin','Percy','Clementine','Sunny','Penny','Walter']);

// Presentation only. Callbacks determine availability and own all game state.
export function mountWelcome(container, options = {}) {
  const { onConfirm = () => {}, onContinue, onReceipt, onDownload, onSettings, onCredits, audioSource, random = Math.random } = options;
  container.innerHTML = `<section class="qp-welcome stage"><div class="paper-back" aria-hidden="true"></div><div class="sky-water" aria-hidden="true"></div><div class="furnishings" aria-hidden="true"></div><div class="digital-ducks" aria-hidden="true"></div><img class="title-art" alt="" aria-hidden="true"><div class="art" aria-hidden="true"></div><div class="welcome-panel"><div class="card" aria-live="polite"></div><button class="sound-button" type="button" aria-pressed="false" aria-label="Turn sound on"></button><span class="sound-status" role="status"></span></div></section>`;
  const root = container.querySelector('.qp-welcome'), card = root.querySelector('.card'), sound = root.querySelector('.sound-button'), status = root.querySelector('.sound-status');
  root.querySelector('.title-art').src = titleUrl;
  const stage = createStage(root, root.querySelector('.art'), root.querySelector('.furnishings'), root.querySelector('.digital-ducks'));
  let state = 'opening', suggestion = '', enabled = false, disposed = false, cancelConfirm = null;
  const confirmName = createConfirmationGate(onConfirm);
  const blockers = new Set();
  const audio = createWelcomeAudio({ source: audioSource, onState(value) { if (value === 'unavailable') { enabled = false; status.textContent = 'Sound is unavailable.'; updateSound(); } } });
  function updateSound() { sound.setAttribute('aria-pressed', String(enabled)); sound.setAttribute('aria-label', !audioSource ? 'Sound unavailable' : enabled ? 'Mute sound' : 'Turn sound on'); sound.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 12h6l7-6v20l-7-6H3z" fill="currentColor"/>${enabled ? '<path d="M20 10c3 3 3 9 0 12M24 6c5 5 5 15 0 20" fill="none" stroke="currentColor" stroke-width="2.5"/>' : '<path d="M20 11l8 10m0-10l-8 10" fill="none" stroke="currentColor" stroke-width="2.5"/>'}</svg>`; }
  sound.disabled = !audioSource; if (!audioSource) { sound.setAttribute('aria-label', 'Sound unavailable'); status.textContent = 'Sound unavailable'; } updateSound();
  sound.addEventListener('click', async () => { enabled = !enabled; updateSound(); await audio.setEnabled(enabled); });
  function action(label, fn, primary = false) { const button = document.createElement('button'); button.type = 'button'; button.textContent = label; if (primary) button.className = 'primary'; button.addEventListener('click', fn); return button; }
  function sync() { stage.setNaming(state === 'naming'); stage.setPaused(state === 'naming' || blockers.size > 0); }
  function render() {
    if (disposed) return; sync(); card.replaceChildren();
    const heading = document.createElement(state === 'opening' ? 'h1' : 'h2'); heading.textContent = state === 'opening' ? 'Quackpot' : 'Meet your rubber duck'; heading.tabIndex = -1; if (state === 'opening') heading.className = 'visually-hidden'; card.append(heading);
    const p = document.createElement('p'); p.textContent = state === 'opening' ? 'A little room, a quiet moment, and a new day.' : 'Give your duck a name, or keep the one already here.'; card.append(p);
    if (state === 'opening' && options.preservedSave) { const note = document.createElement('p'); note.textContent = 'Your saved run stays here. A new run will be temporary.'; card.append(note); }
    const buttons = document.createElement('div'); buttons.className = 'buttons';
    if (state === 'opening') {
      buttons.append(action(options.finished ? 'Start another run' : 'Start', () => { suggestion = COMPANION_SUGGESTIONS[Math.min(29, Math.max(0, Math.floor(random() * 30)))]; state = 'naming'; audio.transition('naming'); render(); card.querySelector('input')?.focus(); }, !onContinue));
      if (onContinue) buttons.append(action('Continue', onContinue, true));
      if (onReceipt) buttons.append(action('View Receipt', onReceipt));
      if (onDownload) buttons.append(action('Download usage file', onDownload));
      else { const unavailable = action('Download usage file (unavailable)', () => {}); unavailable.disabled = true; buttons.append(unavailable); }
      card.append(buttons); const utilities = document.createElement('div'); utilities.className = 'utilities'; if (onSettings) utilities.append(action('Settings', onSettings)); if (onCredits) utilities.append(action('Credits', onCredits)); card.append(utilities);
    } else {
      const label = document.createElement('label'); label.textContent = 'Duck name'; const input = document.createElement('input'); input.maxLength = 30; input.value = suggestion; label.append(input); card.append(label, buttons);
      const accept = () => { void confirmName(input.value.trim() || suggestion).catch(() => { status.textContent = 'Could not start. Please try again.'; }); };
      buttons.append(action('Continue', accept, true), action('Back', () => { state = 'opening'; audio.transition('opening'); render(); card.querySelector('button')?.focus(); })); if (onReceipt) buttons.append(action('View Receipt', onReceipt)); input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); accept(); } });
    }
  }
  function visibility() { if (document.hidden) pause('hidden'); else resume('hidden'); }
  function pagehide(event) { if (event.persisted) pause('pagehide'); else dispose(); }
  function pageshow(event) { if (event.persisted) resume('pagehide'); }
  function pause(reason) { blockers.add(reason); audio.pause(reason); sync(); }
  function resume(reason) { blockers.delete(reason); audio.resume(reason); sync(); }
  function confirmRestart(message) {
    if (disposed || cancelConfirm) return Promise.resolve(false);
    const trigger = document.activeElement, dialog = document.createElement('dialog');
    dialog.className = 'restart-confirm'; dialog.setAttribute('aria-labelledby', 'restart-confirm-title'); dialog.setAttribute('aria-describedby', 'restart-confirm-description');
    const heading = document.createElement('h2'); heading.id = 'restart-confirm-title'; heading.textContent = 'Start another run?';
    const description = document.createElement('p'); description.id = 'restart-confirm-description'; description.textContent = message; let finish;
    const cancel = action('Cancel', () => finish(false)); const accept = action('Start another run', () => finish(true), true);
    dialog.append(heading, description, cancel, accept); root.append(dialog); pause('modal');
    return new Promise(resolve => {
      let settled = false;
      finish = value => { if (settled) return; settled = true; cancelConfirm = null; if (dialog.open) dialog.close(); dialog.remove(); if (!disposed) { resume('modal'); if (trigger?.isConnected) trigger.focus(); } resolve(value); };
      cancelConfirm = () => finish(false);
      dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
      try { dialog.showModal(); cancel.focus(); } catch { finish(false); }
    });
  }
  function dispose({ fadeAudio = false } = {}) { if (disposed) return; disposed = true; cancelConfirm?.(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pagehide); window.removeEventListener('pageshow', pageshow); if (fadeAudio) { audio.transition('apartment'); setTimeout(() => audio.dispose(), 1000); } else audio.dispose(); stage.dispose(); container.replaceChildren(); }
  document.addEventListener('visibilitychange', visibility); window.addEventListener('pagehide', pagehide); window.addEventListener('pageshow', pageshow); visibility(); render();
  card.querySelector('h1')?.focus();
  return { pause, resume, confirmRestart, transition: place => audio.transition(place), dispose };
}
