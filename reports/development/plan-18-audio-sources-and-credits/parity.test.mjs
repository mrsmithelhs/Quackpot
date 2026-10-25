/**
 * @file parity.test.mjs
 * Behavioral parity verification between `src/audio/synth.mjs` and `bundled-synth.js`
 * for Plan 18 audition workbench.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

import {
  QUACK_A_CONTROL,
  QUACK_B_SYNTH_ADSR,
  QUACK_C_FORMANT_NOISE,
  QUACK_CANDIDATES,
  QUACK_SHORT,
  validateSoundParams,
  calculateDuration,
  createDeterministicNoiseBuffer
} from '../../../src/audio/synth.mjs';

const sourcePath = path.resolve('src/audio/synth.mjs');
const bundlePath = path.resolve('reports/development/plan-18-audio-sources-and-credits/bundled-synth.js');

function computeSha256(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadBundledSynth() {
  const code = fs.readFileSync(bundlePath, 'utf8');
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.DuckSynth || sandbox.window.DuckSynth;
}

describe('plan-18 — bundled synth provenance and contract parity', () => {
  test('bundled-synth.js exists and embeds current src/audio/synth.mjs SHA-256 hash', () => {
    assert.ok(fs.existsSync(bundlePath), 'bundled-synth.js must exist');
    const sourceHash = computeSha256(sourcePath);
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(
      bundleContent.includes(sourceHash),
      `bundled-synth.js must embed current source hash (${sourceHash})`
    );
  });

  test('bundled-synth exports all authoritative presets and functions', () => {
    const DuckSynth = loadBundledSynth();
    assert.ok(DuckSynth, 'DuckSynth must be defined on window');
    assert.equal(typeof DuckSynth.playSynthesizedSound, 'function');
    assert.equal(typeof DuckSynth.validateSoundParams, 'function');
    assert.equal(typeof DuckSynth.calculateDuration, 'function');
    assert.equal(typeof DuckSynth.createDeterministicNoiseBuffer, 'function');
    assert.equal(typeof DuckSynth.resetAudioContextForTesting, 'function');

    assert.ok(DuckSynth.QUACK_A_CONTROL);
    assert.ok(DuckSynth.QUACK_B_SYNTH_ADSR);
    assert.ok(DuckSynth.QUACK_C_FORMANT_NOISE);
    assert.ok(DuckSynth.QUACK_CANDIDATES);
    assert.ok(DuckSynth.QUACK_SHORT);
  });

  test('candidate presets match source definitions identically', () => {
    const DuckSynth = loadBundledSynth();
    assert.deepEqual(JSON.parse(JSON.stringify(DuckSynth.QUACK_A_CONTROL)), QUACK_A_CONTROL);
    assert.deepEqual(JSON.parse(JSON.stringify(DuckSynth.QUACK_B_SYNTH_ADSR)), QUACK_B_SYNTH_ADSR);
    assert.deepEqual(JSON.parse(JSON.stringify(DuckSynth.QUACK_C_FORMANT_NOISE)), QUACK_C_FORMANT_NOISE);
    assert.deepEqual(JSON.parse(JSON.stringify(DuckSynth.QUACK_SHORT)), QUACK_SHORT);
  });

  test('validation and duration calculations produce identical results', () => {
    const DuckSynth = loadBundledSynth();
    for (const preset of [QUACK_A_CONTROL, QUACK_B_SYNTH_ADSR, QUACK_C_FORMANT_NOISE]) {
      assert.deepEqual(
        JSON.parse(JSON.stringify(DuckSynth.validateSoundParams(preset))),
        validateSoundParams(preset)
      );
      assert.equal(
        DuckSynth.calculateDuration(preset),
        calculateDuration(preset)
      );
    }
  });
});

describe('plan-18 — graph routing and execution parity', () => {
  function createMockAudioContext(options = {}) {
    const connections = [];
    const createdNodes = [];

    class MockAudioParam {
      constructor(name) {
        this.name = name;
        this.events = [];
      }
      setValueAtTime(val, t) { this.events.push({ type: 'setValue', val, t }); }
      linearRampToValueAtTime(val, t) { this.events.push({ type: 'linearRamp', val, t }); }
      exponentialRampToValueAtTime(val, t) { this.events.push({ type: 'exponentialRamp', val, t }); }
      cancelScheduledValues(t) { this.events.push({ type: 'cancel', t }); }
    }

    class MockNode {
      constructor(nodeType) {
        this.nodeType = nodeType;
        createdNodes.push(this);
      }
      connect(target) {
        connections.push({ from: this, to: target });
      }
    }

    class MockGainNode extends MockNode {
      constructor() {
        super('GainNode');
        this.gain = new MockAudioParam('gain');
      }
    }

    class MockOscillatorNode extends MockNode {
      constructor() {
        super('OscillatorNode');
        this.frequency = new MockAudioParam('frequency');
        this.type = 'sawtooth';
        this.started = false;
        this.stopped = false;
      }
      start(t) { this.started = t; }
      stop(t) { this.stopped = t; }
    }

    class MockBiquadFilterNode extends MockNode {
      constructor() {
        super('BiquadFilterNode');
        this.frequency = new MockAudioParam('frequency');
        this.Q = new MockAudioParam('Q');
        this.type = 'bandpass';
      }
    }

    class MockBufferSourceNode extends MockNode {
      constructor() {
        super('AudioBufferSourceNode');
        this.buffer = null;
        this.started = false;
        this.stopped = false;
      }
      start(t) { this.started = t; }
      stop(t) { this.stopped = t; }
    }

    class MockBuffer {
      constructor(channels, length, sampleRate) {
        this.numberOfChannels = channels;
        this.length = length;
        this.sampleRate = sampleRate;
        this._data = new Float32Array(length);
      }
      getChannelData() { return this._data; }
    }

    return {
      state: options.state || 'running',
      currentTime: 0.1,
      sampleRate: 44100,
      destination: new MockNode('Destination'),
      connections,
      createdNodes,
      createGain: () => new MockGainNode(),
      createOscillator: () => new MockOscillatorNode(),
      createBiquadFilter: () => new MockBiquadFilterNode(),
      createBufferSource: () => new MockBufferSourceNode(),
      createBuffer: (c, l, s) => new MockBuffer(c, l, s),
      resume: async function() { this.state = 'running'; }
    };
  }

  test('Candidate C routes carrier AND noise through sumBus into parallel formants and masterGain', async () => {
    const DuckSynth = loadBundledSynth();
    const mockCtx = createMockAudioContext();

    const res = await DuckSynth.playSynthesizedSound(DuckSynth.QUACK_C_FORMANT_NOISE, { audioContext: mockCtx });
    assert.equal(res.played, true);
    assert.equal(res.treatment, 'source_filter');

    // Find nodes by type
    const filters = mockCtx.createdNodes.filter(n => n.nodeType === 'BiquadFilterNode');
    assert.equal(filters.length, 2, 'Candidate C must instantiate 2 formant bandpass filters');

    const bufferSources = mockCtx.createdNodes.filter(n => n.nodeType === 'AudioBufferSourceNode');
    assert.equal(bufferSources.length, 1, 'Candidate C must instantiate 1 deterministic noise source');

    const oscillators = mockCtx.createdNodes.filter(n => n.nodeType === 'OscillatorNode');
    assert.equal(oscillators.length, 1, 'Candidate C must instantiate 1 carrier oscillator');

    // Verify routing:
    // Carrier -> sumBus
    // Noise -> noiseGain -> sumBus
    // sumBus -> f1 AND sumBus -> f2
    // f1 -> f1Gain -> masterGain
    // f2 -> f2Gain -> masterGain
    // masterGain -> destination
    const destConn = mockCtx.connections.find(c => c.to === mockCtx.destination);
    assert.ok(destConn, 'masterGain must connect to destination');
    const masterGain = destConn.from;
    assert.equal(masterGain.nodeType, 'GainNode');

    // Filters must connect to branch gains, which connect to masterGain
    const f1Conn = mockCtx.connections.find(c => c.from === filters[0]);
    assert.ok(f1Conn, 'Formant 1 must connect to a gain node');
    const f1GainConn = mockCtx.connections.find(c => c.from === f1Conn.to);
    assert.equal(f1GainConn.to, masterGain, 'Formant 1 gain must connect to masterGain');

    const f2Conn = mockCtx.connections.find(c => c.from === filters[1]);
    assert.ok(f2Conn, 'Formant 2 must connect to a gain node');
    const f2GainConn = mockCtx.connections.find(c => c.from === f2Conn.to);
    assert.equal(f2GainConn.to, masterGain, 'Formant 2 gain must connect to masterGain');

    // Both filters must be fed by sumBus
    const sumBusToF1 = mockCtx.connections.find(c => c.to === filters[0]);
    const sumBusToF2 = mockCtx.connections.find(c => c.to === filters[1]);
    assert.ok(sumBusToF1 && sumBusToF2, 'Both filters must be fed by sumBus');
    assert.equal(sumBusToF1.from, sumBusToF2.from, 'Both filters must receive input from the SAME sumBus');

    const sumBus = sumBusToF1.from;
    // Carrier and noise must feed sumBus
    const carrierToSum = mockCtx.connections.find(c => c.from === oscillators[0] && c.to === sumBus);
    assert.ok(carrierToSum, 'Carrier oscillator must connect into sumBus');

    const noiseGainConn = mockCtx.connections.find(c => c.from === bufferSources[0]);
    assert.ok(noiseGainConn, 'Noise source must connect to a noise gain node');
    const noiseToSum = mockCtx.connections.find(c => c.from === noiseGainConn.to && c.to === sumBus);
    assert.ok(noiseToSum, 'Noise gain node must connect into sumBus before filters');
  });

  test('playSynthesizedSound returns silent fallback on suspended or null context without throwing', async () => {
    const DuckSynth = loadBundledSynth();

    const resNull = await DuckSynth.playSynthesizedSound(DuckSynth.QUACK_A_CONTROL, { audioContext: null });
    assert.equal(resNull.played, false);
    assert.equal(resNull.fallback, 'silent');

    const mockSuspended = createMockAudioContext({ state: 'suspended' });
    mockSuspended.resume = async () => {}; // stays suspended
    const resSuspended = await DuckSynth.playSynthesizedSound(DuckSynth.QUACK_A_CONTROL, { audioContext: mockSuspended });
    assert.equal(resSuspended.played, false);
    assert.equal(resSuspended.fallback, 'silent');
  });
});
