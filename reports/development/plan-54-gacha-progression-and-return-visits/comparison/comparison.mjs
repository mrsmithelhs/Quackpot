import { visits } from './scenarios.mjs';

const visit = document.querySelector('#visit');
const model = document.querySelector('#model');
const variant = document.querySelector('#variant');
const wallet = document.querySelector('#wallet');
const screen = document.querySelector('#screen');
const notes = document.querySelector('#notes');
const context = document.querySelector('#review-context');

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

function render() {
  const scenario = visits[visit.value];
  const content = scenario[model.value][variant.value];
  context.textContent = scenario.situation;
  wallet.replaceChildren(...scenario.wallet.map(item => node('span', item)));
  const card = node('div', '', 'card');
  card.append(node('p', content.card));
  const choices = node('div', '', 'choices');
  choices.setAttribute('aria-label', 'Possible next actions, illustrative only');
  choices.append(node('strong', 'Possible next actions', 'choices-label'));
  content.choices.forEach((choice, index) => choices.append(node('span', choice, index ? 'choice secondary' : 'choice')));
  const inWorldTag = content.tag.replace(/ · proposed(?: field| objective| copy)?/i, '');
  screen.replaceChildren(node('div', inWorldTag, 'tag'), node('h2', content.title), node('p', content.lead, 'lead'), card, choices);
  notes.replaceChildren(node('p', content.note), node('h3', 'Consider'), node('p', content.question), node('p', 'Choices shown on the fictional screen are illustrative. Use the controls above to compare states.'));
}

[visit, model, variant].forEach(control => control.addEventListener('change', render));
render();
