// Focused Plan 46 scenes. State changes and evidence are owned by engine callbacks.
import { renderRenScene, renderFloorCandidate } from '../../assets/ren/index.mjs';
import { social46DisplayText, social46SceneSetting } from '../../core/life-social.mjs';

export function renderRenScene46(root, scene, callbacks, active) {
  const frame = document.createElement('div'); frame.className = 'life-story47-stage';
  const card = document.createElement('section'); card.className = 'life-story47 ren46-scene';
  const heading = document.createElement('h2'); heading.textContent = scene.stage === 'ack' ? 'Evening complete' : 'An evening with Ren';
  const art = document.createElement('div'); art.className = 'ren46-art';
  const options = { idPrefix: 'ren46scene', decorative: true };
  const seating = social46SceneSetting(scene);
  const svg = seating === 'floor' ? renderFloorCandidate({ ...options, tv: callbacks.tvSold() ? 'removed' : 'present' }).svg
    : renderRenScene({ ...options, scene: seating === 'couch' ? 'couch-close' : 'door' }).svg;
  art.innerHTML = svg;
  const line = document.createElement('p');
  line.textContent = scene.stage === 'ack' ? `Health: ${callbacks.health()} HP.` : social46DisplayText('scene', scene.activity, null, scene.beat, null, seating);
  const button = document.createElement('button'); button.type = 'button'; button.className = 'life-btn life-day-next';
  button.textContent = scene.stage === 'ack' || scene.beat < 2 ? 'Continue' : 'Finish the evening'; button.disabled = !active;
  button.addEventListener('click', () => { button.disabled = true; callbacks.advance(scene); });
  const dialogue = document.createElement('div'); dialogue.className = 'ren46-dialogue';
  dialogue.append(line, button);
  card.append(heading, art, dialogue); frame.append(card); root.replaceChildren(frame);
  if (active && scene.stage === 'scene' && !scene.shown) callbacks.shown(scene);
  if (active) button.focus({ preventScroll: true });
}
