import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApartmentDesk } from './apartment-view.mjs';
import { renderDeskView } from './desk-view.js';

test('apartment desk is one static neutral side scene with a blank decorative phone', () => {
  const view = buildApartmentDesk();
  assert.match(view.scene, /viewBox="0 0 960 540"/);
  assert.match(view.scene, /aria-hidden="true"/);
  assert.doesNotMatch(view.scene, /10 FREE pulls|Welcome Festival|QUACKPOT/);
  assert.equal(view.returning, false);
  assert.equal(view.phone.heading, 'Welcome Festival');
});

test('returning desk maps saved companion name and style without rewriting legacy style', () => {
  const view = buildApartmentDesk({ returning: true, companion: { name: '<Quack>', style: 'pirate-hat' } });
  assert.equal(view.companionName, '<Quack>');
  assert.equal(view.companionStyle, 'pirate-hat');
  assert.equal(view.phone.heading, 'Welcome back');
  assert.equal(view.phone.action, 'Open Quackpot');
});

function mountStub({ returning = false } = {}) {
  const formListeners = {};
  const controls = {
    '#desk-companion-form': { addEventListener: (type, listener) => { formListeners[type] = listener; } },
    '#companion-name-input': returning ? null : { value: '  Ada  ' },
    '#desk-autosave-checkbox': returning ? null : { checked: false },
  };
  return {
    controls,
    formListeners,
    container: { innerHTML: '', querySelector: (selector) => controls[selector] ?? null },
  };
}

test('fresh desk uses accessible HTML invitation action and preserves existing form ids', () => {
  const { container } = mountStub();
  renderDeskView(container, 'unused', () => {});
  assert.match(container.innerHTML, /id="desk-companion-form"/);
  assert.match(container.innerHTML, /id="btn-start-app"/);
  assert.match(container.innerHTML, /type="submit"[^>]+aria-label="Open Quackpot and claim the 10-pull invitation"/);
  assert.match(container.innerHTML, /form="desk-companion-form"/);
  assert.match(container.innerHTML, /id="companion-name-input"/);
  assert.match(container.innerHTML, /id="desk-autosave-checkbox"/);
  assert.ok(container.innerHTML.indexOf('id="companion-name-input"') < container.innerHTML.indexOf('id="btn-start-app"'));
  assert.ok(container.innerHTML.indexOf('id="desk-autosave-checkbox"') < container.innerHTML.indexOf('id="btn-start-app"'));
  assert.doesNotMatch(container.innerHTML, /id="companion-style-select"/);
});

test('return submit retains the saved companion style and name in callback data', () => {
  const { container, formListeners } = mountStub({ returning: true });
  const saved = { name: 'Daffy', style: 'cyber-visor' };
  let result;
  renderDeskView(container, 'unused', (payload) => { result = payload; }, { returning: true, companion: saved });
  assert.match(container.innerHTML, /Daffy/);
  assert.doesNotMatch(container.innerHTML, /companion-name-input|desk-autosave-checkbox/);
  formListeners.submit({ preventDefault() {} });
  assert.deepEqual(result, { name: 'Daffy', style: 'cyber-visor', autosaveEnabled: true, returning: true });
});

test('fresh submit defaults the missing style to classic-yellow without adding a style picker', () => {
  const { container, formListeners } = mountStub();
  let result;
  renderDeskView(container, 'unused', (payload) => { result = payload; });
  formListeners.submit({ preventDefault() {} });
  assert.deepEqual(result, { name: 'Ada', style: 'classic-yellow', autosaveEnabled: false, returning: false });
});
