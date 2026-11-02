// Report-local static fixtures only; no game engine, storage or production callbacks.
import { renderScene } from '../../../src/assets/apartment/index.mjs';
import { bedroomStudyScene } from './bedroom-study.mjs';

const $ = (selector) => document.querySelector(selector);
const state = { scenario: 'evening', room: 'bedroom', returnFocus: null };
const names = { bedroom: 'Bedroom', 'desk-side': 'Desk', kitchen: 'Kitchen', living: 'Living room' };
const labels = { evening: 'Evening · dinner resolved', used: 'Evening · activity chosen', late: 'Late Night', recovery: 'Morning · recovery pending', future: 'Evening · hypothetical social offer', afternoon: 'Day 2+ afternoon · shift not worked', 'afternoon-unemployed': 'Day 2+ afternoon · unemployed', 'afternoon-used': 'Day 2+ afternoon · phone activity used', 'evening-dinner': 'Day 2+ evening · dinner pending', tutorial: 'Day 1 · guided tutorial' };
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
function turnInDecision(late = false) {
  decision(late ? 'Finish Late Night?' : 'Turn in for the night?', ['The next phase is morning. Pending meals, work or rent may need attention first.', ...(state.scenario === 'future' ? ['A future social commitment could require a specific notice. Its interface is still being designed.'] : [])], late ? 'Finish Late Night' : 'Turn in');
}
function phoneExample() {
  const texts = {
    used: 'Completing this pull uses Late Night and can cause up to 10 HP fatigue tomorrow.',
    afternoon: 'This pull uses your afternoon and misses your scheduled shift. Repeated missed shifts can affect your job.',
    'afternoon-unemployed': 'This illustrative pull uses your afternoon. You have no scheduled shift to miss.',
    'afternoon-used': 'This is an illustrative further pull after an afternoon activity. The actual destination and obligation checks need a future integration proposal.',
    'evening-dinner': 'This illustrative time-advancing pull would mean missing dinner: no meal cost, up to 5 HP lost. Late Night play can also cause up to 10 HP fatigue tomorrow.',
  };
  const text = texts[state.scenario];
  decision('Phone · illustrative example', [state.scenario === 'tutorial' ? 'The new competing-action dinner example begins on Day 2; this Day 1 study scene does not offer it.' : text ? 'Browsing is free. Choose the example pull to see its proposed or existing warning.' : 'Browsing and returning are free. A pull or race may commit a session.', 'The actual Quackpot app is not reproduced in this study.'], text ? [{ label: 'Try a pull example', open: () => decision('Start this pull?', [text], 'Confirm example') }] : null);
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
  if (state.room === 'bedroom' && !state.scenario.startsWith('afternoon')) {
    if (state.scenario === 'recovery') target('Recover in bed', { x: 40, y: 61, w: 53, h: 25 }, () => decision('Recover in bed', ['Recovery is a separate action that uses the current phase. The actual amount and any pending obligations come from the game.'], 'Rest'));
    else target(state.scenario === 'late' ? 'Finish Late Night' : 'Turn in for the night', { x: 40, y: 61, w: 53, h: 25 }, () => turnInDecision(state.scenario === 'late'));
  }
  if (state.room === 'desk-side') {
    target('Phone', { x: 63, y: 17, w: 17.5, h: 58 }, phoneExample);
  }
  if (state.room === 'kitchen') {
    target('Kitchen notice', { x: 3.6, y: 25, w: 9.5, h: 22 }, () => decision('Rent notice', ['Existing payment and obligation controls belong here. This study does not change them.'], null));
  }
}
$('#scenario').addEventListener('change', (event) => { state.scenario = event.target.value; state.room = state.scenario.startsWith('afternoon') || ['evening-dinner', 'tutorial'].includes(state.scenario) ? 'desk-side' : 'bedroom'; render(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#decision').hidden) closeDecision(); });
render();
