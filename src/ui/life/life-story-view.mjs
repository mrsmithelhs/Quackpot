import { COMMUTE_STORIES, WORK_STORIES } from '../../core/life-story-content.mjs';
import { storyBackdrop } from './life-story-backdrop.mjs';

export function payslipAmountText(wage) {
  return Number.isFinite(wage) ? `Net take-home cash: $${wage.toFixed(2)}` : 'Wage amount unavailable';
}

// Render only committed story data. All state changes and evidence go through callbacks.
export function renderStory47(root, story, callbacks, active) {
  const card = document.createElement('section');
  card.className = `life-story47${story.kind === 'work' && story.stage === 'payslip' ? ' life-story47-payslip' : ''}`;
  card.setAttribute('aria-labelledby', 'story47-heading');
  const heading = document.createElement('h2'); heading.id = 'story47-heading';
  const lines = [];
  let label;
  if (story.kind === 'work' && story.stage === 'commute') {
    const beat = COMMUTE_STORIES[story.story.commute];
    heading.textContent = 'On the way to work'; lines.push(beat.text, beat.detail); label = 'Arrive at work';
  } else if (story.kind === 'work' && story.stage === 'work') {
    heading.textContent = 'Your shift';
    for (const id of story.story.work) lines.push(`${WORK_STORIES[id].text} ${WORK_STORIES[id].detail}`);
    label = 'Complete shift';
  } else if (story.kind === 'work') {
    heading.textContent = 'Payslip';
    const wage = callbacks.wage(story.id);
    lines.push('Harbor Logistics Distribution', `Day ${callbacks.day()} · Scheduled shift`, payslipAmountText(wage), Number.isFinite(wage) ? 'Settled and credited to cash.' : 'No matching wage record is available.'); label = 'Return home';
  } else if (story.stage === 'scene') {
    heading.textContent = story.choice === 'call_mom' ? 'Call Mom' : 'A quiet moment';
    lines.push(...(story.choice === 'call_mom'
      ? ['You call home. Mom asks about your day, and tells you that the neighbor’s cat got onto the roof again.', '“Take care of yourself, okay? I love you.” You promise to call again soon.']
      : ['You sit at the desk with your little rubber duck under the warm lamp.', 'The apartment is quiet for a moment. The duck sits beside your pens and papers.']));
    label = story.choice === 'call_mom' ? 'Finish the call' : 'Finish your break';
  } else {
    heading.textContent = story.choice === 'call_mom' ? 'Call complete' : 'Break complete';
    lines.push(`Health: ${callbacks.health()} HP.`); label = 'Continue';
  }
  if (story.kind === 'work' && story.stage === 'payslip') {
    const seal = document.createElement('div'); seal.className = 'life-story47-seal'; seal.setAttribute('aria-hidden', 'true');
    seal.innerHTML = '<svg viewBox="0 0 100 80"><rect x="14" y="16" width="72" height="48" rx="2" fill="#faf6ee" stroke="#3b3226" stroke-width="2"/><rect x="34" y="28" width="36" height="20" rx="2" fill="none" stroke="#2a9d8f" stroke-width="2.5" transform="rotate(-6 52 38)"/><text x="52" y="42" fill="#2a9d8f" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle" transform="rotate(-6 52 38)">PAID</text></svg>';
    card.append(seal);
  }
  card.append(heading);
  for (const line of lines) { const p = document.createElement('p'); p.textContent = line; card.append(p); }
  const button = document.createElement('button'); button.type = 'button'; button.className = 'life-btn life-day-next'; button.textContent = label;
  button.disabled = !active;
  button.addEventListener('click', () => { button.disabled = true; callbacks.advance(story); });
  card.append(button);
  const scene = document.createElement('div'); scene.className = 'life-story47-stage';
  if (story.kind === 'work') { const backdrop = document.createElement('div'); backdrop.className = 'life-story47-backdrop'; backdrop.innerHTML = storyBackdrop(story.stage); scene.append(backdrop); }
  scene.append(card); root.replaceChildren(scene);
  if (active && ['commute', 'work', 'scene'].includes(story.stage)) callbacks.shown(story);
  if (active) button.focus({ preventScroll: true });
}
