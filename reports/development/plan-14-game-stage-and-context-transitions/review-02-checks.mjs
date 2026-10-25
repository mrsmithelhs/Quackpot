// Focus/motion controller checks with DOM stubs, not rendered browser evidence.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = fs.readFileSync(new URL('./wireframes.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
const elements = new Map(), keys = [], preferenceHandlers = [];
let focused;
function el(id) {
  if (elements.has(id)) return elements.get(id);
  const classes = new Set(), handlers = new Map();
  const node = { id, tagName: 'BUTTON', style: {}, inert: false, checked: false, offsetParent: {},
    classList: { add: (...xs) => xs.forEach(x => classes.add(x)), remove: (...xs) => xs.forEach(x => classes.delete(x)), contains: x => classes.has(x) },
    addEventListener(type, fn) { handlers.set(type, [...(handlers.get(type) || []), fn]); },
    fire(type, event = {}) { for (const fn of handlers.get(type) || []) fn({ target: node, preventDefault() {}, ...event }); },
    focus() { focused = node; }, click() { node.fire('click'); },
    contains(other) { return node === other; },
    querySelectorAll() { return id === 'modal-settings' ? [el('btn-close-settings'), el('pref-reduced-motion')] : [el('btn-close-uninstall'), el('btn-retention-leave')]; },
  };
  elements.set(id, node); return node;
}
const body = el('body'); body.tagName = 'BODY';
body.children = [el('shell-root'), el('modal-settings'), el('modal-uninstall'), el('aria-live-polite')];
const context = { document: { body, getElementById: el, get activeElement() { return focused; } },
  window: { addEventListener(type, fn) { if (type === 'keydown') keys.push(fn); }, matchMedia() { return { matches: true, addEventListener(type, fn) { preferenceHandlers.push(fn); } }; } },
  setTimeout() { return 1; }, clearTimeout() {}, alert() {},
};
vm.createContext(context); vm.runInContext(script, context);
assert.equal(body.classList.contains('reduced-motion'), true);
el('toggle-reduced-motion').checked = false; el('toggle-reduced-motion').fire('change');
assert.equal(body.classList.contains('motion-override'), true);
assert.equal(body.classList.contains('reduced-motion'), false);
preferenceHandlers.forEach(fn => fn({ matches: true }));
assert.equal(body.classList.contains('reduced-motion'), false, 'Manual choice must survive an OS change');
assert.ok(html.includes('body:not(.motion-override) *'), 'OS-only CSS must allow the explicit override');
for (const [trigger, modal, first, last] of [
  ['btn-open-settings', 'modal-settings', 'btn-close-settings', 'pref-reduced-motion'],
  ['btn-settings-b', 'modal-settings', 'btn-close-settings', 'pref-reduced-motion'],
  ['btn-open-uninstall', 'modal-uninstall', 'btn-close-uninstall', 'btn-retention-leave'],
]) {
  el(trigger).focus(); el(trigger).click();
  assert.equal(el('shell-root').inert, true); assert.equal(el(modal).inert, false);
  el(last).focus(); keys.forEach(fn => fn({ key: 'Tab', target: focused, preventDefault() {} }));
  assert.equal(focused.id, first);
  keys.forEach(fn => fn({ key: 'Tab', shiftKey: true, target: focused, preventDefault() {} }));
  assert.equal(focused.id, last);
  keys.forEach(fn => fn({ key: 'Escape', target: focused, preventDefault() {} }));
  assert.equal(el('shell-root').inert, false); assert.equal(focused.id, trigger);
}
console.log('PASS: OS-default/manual motion override, background inertness, focus wrap and return in both settings shells and Uninstall (DOM stubs).');
