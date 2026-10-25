// Execute the actual audition controller with DOM/media stubs and the real source synth.
// Verifies control wiring, not browser decoding, audible output, or native-dialog accessibility.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as source from '../../../src/audio/synth.mjs';
const html = fs.readFileSync(new URL('./audition.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
const nodes = new Map(), media = [];
function element(id) {
  if (nodes.has(id)) return nodes.get(id);
  const handlers = new Map(), classes = new Set();
  const node = { id, style: {}, value: '0.8', textContent: '', innerHTML: '',
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
    addEventListener(type, fn) { handlers.set(type, [...(handlers.get(type) || []), fn]); },
    async fire(type, event = {}) { for (const fn of handlers.get(type) || []) await fn({ target: node, preventDefault() {}, ...event }); },
    focus() {}, showModal() { node.open = true; }, close() { node.open = false; },
  };
  nodes.set(id, node); return node;
}
function context() {
  const result = { state: 'running', currentTime: 1, sampleRate: 44100, destination: {}, gains: [],
    resume: async function() { assert.equal(this, result); this.state = 'running'; },
    close() { this.state = 'closed'; },
  };
  function param() { return { value: 0, setValueAtTime(value) { this.value = value; }, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }; }
  function node() { return { gain: param(), frequency: param(), Q: param(), connect() {}, start() {}, stop() {} }; }
  result.createGain = function() { assert.equal(this, result); const n = node(); this.gains.push(n); return n; };
  result.createOscillator = function() { assert.equal(this, result); return node(); };
  result.createBiquadFilter = function() { assert.equal(this, result); return node(); };
  result.createBufferSource = function() { assert.equal(this, result); return node(); };
  result.createBuffer = function(channels, length) { assert.equal(this, result); return { getChannelData() { return new Float32Array(length); } }; };
  return result;
}
let currentContext = context(), synthCalls = 0, unavailable = false;
const duckSynth = { ...source,
  getOrCreateAudioContext() { if (unavailable) return null; if (currentContext.state === 'closed') currentContext = context(); return currentContext; },
  resetAudioContextForTesting() { currentContext.close(); },
  async playSynthesizedSound(preset, options) { synthCalls++; assert.ok(Object.values(source.QUACK_CANDIDATES).includes(preset)); return source.playSynthesizedSound(preset, options); },
};
class Media {
  constructor(url) { this.url = url; this.paused = true; this.currentTime = 0; media.push(this); }
  addEventListener() {} pause() { this.paused = true; }
  async play() { if (this.reject) throw new Error('decode denied'); this.paused = false; }
}
const sandbox = { window: { DuckSynth: duckSynth }, document: { getElementById: element, querySelectorAll() { return []; }, activeElement: null }, Audio: Media, setTimeout() {}, clearTimeout() {}, console };
vm.createContext(sandbox); vm.runInContext(script, sandbox);
await sandbox.playSynthesizedQuack('C');
assert.equal(synthCalls, 1); assert.equal(currentContext.gains[0].gain.value, .8);
await element('btn-toggle-mute').fire('click');
assert.equal(currentContext.gains[0].gain.value, 0, 'Mute changes the active synth output bus');
assert.ok(media.every(m => m.volume === 0));
await sandbox.playSynthesizedQuack('A'); assert.equal(synthCalls, 1, 'Muted clicks must not schedule a quack');
await element('btn-toggle-mute').fire('click');
element('master-volume').value = '0'; await element('master-volume').fire('input');
assert.equal(currentContext.gains[0].gain.value, 0);
await sandbox.playSynthesizedQuack('B'); assert.equal(synthCalls, 1, 'Zero-volume clicks must not pass invalid zero preset gains');
element('master-volume').value = '.5'; await element('master-volume').fire('input');
assert.equal(currentContext.gains[0].gain.value, .5);
await sandbox.playSynthesizedQuack('B'); assert.equal(synthCalls, 2);
await element('btn-stop-all').fire('click'); assert.equal(currentContext.state, 'closed');
media[0].reject = true; await sandbox.playEffect('click1');
assert.equal(element('card-click1').classList.contains('playing'), false);
assert.match(element('caption-text').textContent, /error|fail|denied/i);
unavailable = true; await element('btn-resume-audio').fire('click');
assert.match(element('caption-text').textContent, /unavailable/i);
await sandbox.playSynthesizedQuack('A'); assert.match(element('caption-text').textContent, /unavailable/i);
console.log('PASS: real source presets/graph invocation, active synth/media mute, live output volume, zero volume, Stop All, rejected media and unavailable context (controller stubs).');
