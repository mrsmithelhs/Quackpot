// Focused Plan 46 scenes. State changes and evidence are owned by engine callbacks.
import { renderRenScene, renderRenArrival, renderFloorCandidate } from '../../assets/ren/index.mjs';
import { social46DisplayText, social46SceneSetting } from '../../core/life-social.mjs';
import { renGraphNode } from '../../core/life-social-dialogue.mjs';

export function renderRenScene46(root, scene, callbacks, active) {
  if (scene.dialogueVersion === 1 && (scene.stage === 'scene' || scene.stage === 'ack')) return renderGraphScene(root, scene, callbacks, active);
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

function renderGraphScene(root, scene, callbacks, active) {
  const isAck = scene.stage === 'ack';
  const node = isAck ? null : renGraphNode(scene.activity, scene.node, scene.seating, scene.hasUncommunicatedBreak);
  if (!isAck && !node) throw new Error('Unknown Ren dialogue node');
  const frame = document.createElement('div'); frame.className = 'life-stage ren46-door-stage';
  const room = document.createElement('div'); room.className = 'life-room ren46-door-room';
  const box = document.createElement('div'); box.className = 'life-box ren46-door-box';
  const art = document.createElement('div'); art.className = 'life-scene';
  const options = {idPrefix:'ren46graph',decorative:true};
  const seating = social46SceneSetting(scene);
  room.classList.add(`ren46-graph-${seating}`);
  art.innerHTML = seating === 'floor' ? renderFloorCandidate({...options,tv:callbacks.tvSold()?'removed':'present'}).svg
    : seating === 'door' && scene.arrivalLook ? renderRenArrival({...options,look:scene.arrivalLook}).svg
      : renderRenScene({...options,scene:seating==='couch'?'couch-close':'door'}).svg;
  const bubble = document.createElement('div'); bubble.className = 'ren46-door-bubble'; bubble.setAttribute('role','status');
  const speaker = document.createElement('strong'); speaker.textContent = isAck ? 'Evening complete' : 'Ren'; const text = document.createElement('span'); text.textContent = isAck ? `Health: ${callbacks.health()} HP.` : node.text; bubble.append(speaker,text);
  box.append(art,bubble); const panel = document.createElement('section'); panel.className = 'ren46-door-decide'; panel.setAttribute('aria-label','Decide');
  const heading = document.createElement('strong'); heading.textContent = 'Decide'; panel.append(heading);
  const choices = isAck ? [{label:'Continue'}] : node.choices;
  for (const item of choices) { const b=document.createElement('button');b.type='button';b.className='life-btn';b.textContent=item.label;b.disabled=!active;b.addEventListener('click',()=>{b.disabled=true;callbacks.advance(scene,item.id);});panel.append(b); }
  room.append(box,panel);frame.append(room);const bar=document.createElement('div');bar.className='life-day-bar';frame.append(bar);root.replaceChildren(frame);
  if(active && !isAck && !scene.shown)callbacks.shown(scene);
  if(active)panel.querySelector('button')?.focus({preventScroll:true});
}
