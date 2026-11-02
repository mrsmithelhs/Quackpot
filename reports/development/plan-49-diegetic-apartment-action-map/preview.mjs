// Report-local static fixtures only; no game engine, storage or production callbacks.
import { renderScene } from '../../../src/assets/apartment/index.mjs';
import { bedroomStudyScene } from './bedroom-study.mjs';

const $ = (selector) => document.querySelector(selector);
const state = { scenario: 'evening', room: 'bedroom', stayLayout: 'lamp', returnFocus: null };
const names = { bedroom: 'Bedroom', 'desk-side': 'Desk', kitchen: 'Kitchen', living: 'Living room' };
const labels = { evening: 'Evening · dinner resolved', used: 'Evening · activity chosen', late: 'Late Night', recovery: 'Morning · recovery pending', future: 'Evening · hypothetical social offer' };
const scenes = { bedroom: { area: 'bedroom', light: 'warm' }, 'desk-side': { area: 'desk-side', light: 'warm' }, kitchen: { area: 'kitchen', light: 'warm' }, living: { area: 'living', light: 'warm' } };

function closeDecision() {
  $('#decision').hidden = true;
  $('#decision').replaceChildren();
  state.returnFocus?.focus();
}
function decision(title, lines, action) {
  const panel = $('#decision');
  if (panel.hidden) state.returnFocus = document.activeElement;
  const heading = document.createElement('h2'); heading.textContent = title;
  panel.replaceChildren(heading);
  for (const line of lines) { const p = document.createElement('p'); p.textContent = line; panel.append(p); }
  const controls = document.createElement('div'); controls.className = 'buttons';
  for (const item of action ? (Array.isArray(action) ? action : [{ label: action }]) : []) {
    const button = document.createElement('button'); button.className = 'primary'; button.textContent = item.label;
    button.addEventListener('click', () => { if (item.open) item.open(); else { closeDecision(); $('#notice').textContent = 'Preview only: no game action or phase change occurred.'; } }); controls.append(button);
  }
  const cancel = document.createElement('button'); cancel.textContent = 'Not now'; cancel.addEventListener('click', closeDecision); controls.append(cancel);
  panel.append(controls); panel.hidden = false; controls.querySelector('button')?.focus();
}
function stayUpDecision() {
  decision('Stay up for Late Night?', ['Staying up moves to Late Night without playing. A pull or race in Late Night can cause up to 10 HP fatigue the following morning.'], 'Stay up');
}
function turnInDecision(late = false) {
  decision(late ? 'Finish Late Night?' : 'Turn in for the night?', ['The next phase is morning. Pending meals, work or rent may need attention first.', ...(state.scenario === 'future' ? ['A future social commitment could require a specific notice. Its interface is still being designed.'] : [])], late ? 'Finish Late Night' : 'Turn in');
}
function target(label, box, onClick) {
  const button = document.createElement('button'); button.className = 'target'; button.type = 'button';
  Object.assign(button.style, { left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` });
  button.setAttribute('aria-label', label); const chip = document.createElement('span'); chip.setAttribute('aria-hidden','true'); chip.textContent = label; button.append(chip);
  button.addEventListener('click', () => { button.focus({ preventScroll: true }); onClick(); }); $('#scene').append(button);
}
function render() {
  $('#decision').hidden = true; $('#notice').textContent = '';
  $('#phase').textContent = labels[state.scenario];
  $('#scene').innerHTML = (state.room === 'bedroom' ? bedroomStudyScene() : renderScene({ ...scenes[state.room], idPrefix: `p49-${state.room.replace('-', '')}`, duckView: 'side' })).svg;
  $('#rooms').replaceChildren();
  for (const [room, label] of Object.entries(names)) {
    const button = document.createElement('button'); button.textContent = label; button.setAttribute('aria-current', room === state.room ? 'page' : 'false');
    button.addEventListener('click', () => { state.room = room; render(); $('#rooms').querySelector('[aria-current="page"]')?.focus(); }); $('#rooms').append(button);
  }
  if (state.room === 'bedroom') {
    if (state.scenario === 'recovery') target('Recover in bed', { x: 40, y: 61, w: 53, h: 25 }, () => decision('Recover in bed', ['Recovery is a separate action that uses the current phase. The actual amount and any pending obligations come from the game.'], 'Rest'));
    else if (state.scenario !== 'late' && state.stayLayout === 'bed') target('Bed · night choices', { x: 40, y: 61, w: 53, h: 25 }, () => decision('What would you like to do?', ['Choose a night action to see its consequences.'], [{ label: 'Turn in for the night', open: () => turnInDecision() }, { label: 'Stay up for Late Night', open: stayUpDecision }]));
    else target(state.scenario === 'late' ? 'Finish Late Night' : 'Turn in for the night', { x: 40, y: 61, w: 53, h: 25 }, () => turnInDecision(state.scenario === 'late'));
  }
  if (state.room === 'desk-side') {
    target('Phone', { x: 63, y: 17, w: 17.5, h: 58 }, () => decision('Phone', [state.scenario === 'used' ? 'Browsing is free. A further pull or race asks for confirmation and may enter Late Night; the existing game supplies the exact warning.' : state.scenario === 'late' ? 'Browsing is free. A pull or race in Late Night can cause fatigue the following morning.' : 'Browsing and returning are free. A pull or race may commit a session.'], null));
    if (state.stayLayout === 'lamp' && ['evening', 'used', 'future'].includes(state.scenario)) target('Stay up', { x: 5, y: 10, w: 28, h: 42 }, stayUpDecision);
  }
  if (state.room === 'kitchen') target('Kitchen notice', { x: 3.6, y: 25, w: 9.5, h: 22 }, () => decision('Rent notice', ['Existing payment and obligation controls belong here. This study does not change them.'], null));
}
$('#scenario').addEventListener('change', (event) => { state.scenario = event.target.value; state.room = 'bedroom'; render(); });
$('#stay-layout').addEventListener('change', (event) => { state.stayLayout = event.target.value; render(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#decision').hidden) closeDecision(); });
render();
