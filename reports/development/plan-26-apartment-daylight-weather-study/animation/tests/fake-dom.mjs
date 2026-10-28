// Minimal fake DOM for the controller tests: enough tree, attributes, WAAPI-like animations, visibility, matchMedia and IntersectionObserver.
export class FakeAnimation {
  constructor(world, target, keyframes, options) { this.world = world; this.target = target; this.keyframes = keyframes; this.options = options; this.playState = 'running'; this.calls = []; this.finished = new Promise((res, rej) => { this._res = res; this._rej = rej; }); world.animations.push(this); }
  play() { this.calls.push('play'); if (this.playState !== 'idle') this.playState = 'running'; }
  pause() { this.calls.push('pause'); if (this.playState !== 'idle') this.playState = 'paused'; }
  cancel() { this.calls.push('cancel'); if (this.playState === 'idle') return; this.playState = 'idle'; const e = new Error('AbortError'); e.name = 'AbortError'; this._rej(e); }
  finish() { this.calls.push('finish'); if (this.playState === 'idle' || this.playState === 'finished') return; this.playState = 'finished'; this._res(this); }
  get live() { return this.playState !== 'idle' && this.playState !== 'finished'; }
}

export class FakeNode {
  constructor(world, tag, attrs = {}) { this.world = world; this.tagName = tag; this.attrs = new Map(Object.entries(attrs).map(([k, v]) => [k, String(v)])); this.childNodes = []; this.parentNode = null; }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
  hasAttribute(k) { return this.attrs.has(k); }
  removeAttribute(k) { this.attrs.delete(k); }
  appendChild(n) { if (n.parentNode) n.parentNode.removeChild(n); n.parentNode = this; this.childNodes.push(n); return n; }
  insertBefore(n, ref) { if (n.parentNode) n.parentNode.removeChild(n); const i = ref ? this.childNodes.indexOf(ref) : this.childNodes.length; n.parentNode = this; this.childNodes.splice(i, 0, n); return n; }
  removeChild(n) { const i = this.childNodes.indexOf(n); if (i < 0) throw new Error('not a child'); this.childNodes.splice(i, 1); n.parentNode = null; return n; }
  get nextSibling() { if (!this.parentNode) return null; const s = this.parentNode.childNodes; return s[s.indexOf(this) + 1] || null; }
  contains(n) { for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
  *walk() { yield this; for (const c of this.childNodes) yield* c.walk(); }
  querySelector(sel) { for (const n of this.walk()) if (n !== this && n.matches(sel)) return n; return null; }
  querySelectorAll(sel) { return [...this.walk()].filter(n => n !== this && n.matches(sel)); }
  matches(sel) { const m = sel.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/); if (!m) throw new Error(`fake selector ${sel}`); return m[2] === undefined ? this.hasAttribute(m[1]) : this.getAttribute(m[1]) === m[2]; }
  animate(keyframes, options) { return new FakeAnimation(this.world, this, keyframes, options); }
  serialize() { const a = [...this.attrs].sort(([x], [y]) => (x < y ? -1 : 1)).map(([k, v]) => ` ${k}="${v}"`).join(''); return `<${this.tagName}${a}>${this.childNodes.map(c => c.serialize()).join('')}</${this.tagName}>`; }
}

class FakeDocument {
  constructor() { this.visibilityState = 'visible'; this.l = new Map(); }
  addEventListener(t, f) { if (!this.l.has(t)) this.l.set(t, new Set()); this.l.get(t).add(f); }
  removeEventListener(t, f) { this.l.get(t)?.delete(f); }
  set(state) { this.visibilityState = state; for (const f of [...(this.l.get('visibilitychange') || [])]) f({ type: 'visibilitychange' }); }
  get listenerCount() { return [...this.l.values()].reduce((n, s) => n + s.size, 0); }
}
class FakeMedia {
  constructor(matches) { this.matches = matches; this.l = new Set(); }
  addEventListener(t, f) { if (t === 'change') this.l.add(f); }
  removeEventListener(t, f) { if (t === 'change') this.l.delete(f); }
  set(matches) { this.matches = matches; for (const f of [...this.l]) f({ matches }); }
}

/** A world: shared document, media query, observers, animations; makeEnv() builds a controller env; makeRoot() a fake study SVG. */
export function makeWorld({ reducedPref = false } = {}) {
  const world = { animations: [], observers: [], doc: new FakeDocument(), media: new FakeMedia(reducedPref) };
  world.node = (tag, attrs) => new FakeNode(world, tag, attrs);
  world.IO = class { constructor(cb) { this.cb = cb; this.targets = []; this.connected = true; world.observers.push(this); } observe(t) { this.targets.push(t); } disconnect() { this.connected = false; this.targets = []; } fire(isIntersecting) { this.cb([{ isIntersecting }]); } };
  world.env = () => ({ document: world.doc, matchMedia: () => world.media, IntersectionObserver: world.IO, createSvg: (tag, attrs) => world.node(tag, attrs) });
  /** root svg > clip group > [sky, clouds, rain-streaks, droplets]; plus a duck svg and lamp group elsewhere. */
  world.makeRoot = ({ withRain = true } = {}) => {
    const root = world.node('svg', { viewBox: '0 0 960 540' }), clip = world.node('g', { 'clip-path': 'url(#x-panes)' });
    clip.appendChild(world.node('rect', { 'data-p26': 'sky', x: 100, y: 50, width: 200, height: 160 })); clip.appendChild(world.node('g', { 'data-p26': 'clouds' }));
    if (withRain) { clip.appendChild(world.node('g', { 'data-p26': 'rain-streaks' })).appendChild(world.node('path', { d: 'M0 0L1 1' })); clip.appendChild(world.node('g', { 'data-p26': 'droplets' })).appendChild(world.node('ellipse', { cx: 1 })); }
    root.appendChild(world.node('g', { id: 'window-item' })); root.appendChild(clip);
    root.appendChild(world.node('ellipse', { 'data-p26': 'window-spill', cx: 200, cy: 130, rx: 380, ry: 240 }));
    const duckWrap = root.appendChild(world.node('g', { 'data-test': 'duck-wrap' })); duckWrap.appendChild(world.node('svg', { role: 'img' }));
    root.appendChild(world.node('g', { class: 'o lamp-on lamp-pool' }));
    return root;
  };
  world.live = () => world.animations.filter(a => a.live);
  return world;
}
