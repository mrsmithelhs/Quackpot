// Execute the delivered inline controller with DOM stubs and a controlled timer queue.
// These are controller observations, not browser layout or accessibility evidence.
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync(new URL('./wireframes.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
function fixture() {
  const elements = new Map(), windowEvents = new Map(), timers = [];
  let activeElement = null, preferenceQueries = 0, alerts = 0;
  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const classes = new Set(), handlers = new Map();
    const el = {
      id, tagName: 'BUTTON', style: {}, checked: false, textContent: '', innerHTML: '',
      classList: {
        add: (...xs) => xs.forEach(x => classes.add(x)),
        remove: (...xs) => xs.forEach(x => classes.delete(x)),
        contains: x => classes.has(x),
        toggle(x) { if (classes.has(x)) classes.delete(x); else classes.add(x); },
      },
      addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, []); handlers.get(type).push(fn); },
      fire(type, event = {}) { for (const fn of handlers.get(type) || []) fn({ target: el, preventDefault() {}, ...event }); },
      click() { el.fire('click'); },
      focus() { activeElement = el; },
    };
    elements.set(id, el);
    return el;
  }
  const body = element('body'); body.tagName = 'BODY';
  const document = { body, getElementById: element, get activeElement() { return activeElement; } };
  const context = {
    document,
    window: {
      addEventListener(type, fn) { if (!windowEvents.has(type)) windowEvents.set(type, []); windowEvents.get(type).push(fn); },
      matchMedia() { preferenceQueries++; return { matches: true, addEventListener() {} }; },
    },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}, alert() { alerts++; },
  };
  vm.createContext(context); vm.runInContext(script, context);
  return {
    element, body,
    key(key) { for (const fn of windowEvents.get('keydown') || []) fn({ key, target: body, preventDefault() {} }); },
    flush() { for (const timer of timers.splice(0).sort((a, b) => a.delay - b.delay)) timer.fn(); },
    get focus() { return activeElement?.id; },
    get preferencesQueried() { return preferenceQueries; },
    get alerts() { return alerts; },
  };
}
const transition = fixture();
transition.element('smartphone-container').click();
transition.element('btn-step-return').click();
const returnedBeforeTimers = !transition.element('stage-canvas').classList.contains('state-gacha-active');
transition.flush();
const focus = fixture();
focus.element('btn-open-settings').focus(); focus.element('btn-open-settings').click(); focus.key('Escape');
const terminal = fixture();
terminal.element('btn-open-uninstall').click(); terminal.element('btn-retention-leave').click(); terminal.key('u');
const output = {
  evidenceType: 'Delivered-controller execution with DOM stubs, not rendered browser evidence',
  returnInitiallyShowsDesk: returnedBeforeTimers,
  pendingEntryReactivatesGachaAfterReturn: transition.element('stage-canvas').classList.contains('state-gacha-active'),
  focusAfterClosingSettings: focus.focus,
  uninstallReopensAfterLeave: terminal.element('modal-uninstall').classList.contains('open'),
  terminalAlertCount: terminal.alerts,
  systemReducedMotionPreferenceQueries: transition.preferencesQueried,
};
console.log(JSON.stringify(output, null, 2));
