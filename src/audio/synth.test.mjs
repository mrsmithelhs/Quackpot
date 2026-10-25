import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUACK_SHORT,
  QUACK_A_CONTROL,
  QUACK_B_SYNTH_ADSR,
  QUACK_C_FORMANT_NOISE,
  QUACK_CANDIDATES,
  validateSoundParams,
  calculateDuration,
  createDeterministicNoiseBuffer,
  playSynthesizedSound,
  resetAudioContextForTesting
} from './synth.mjs';

describe('synth — quack audition candidates parameter contracts', () => {
  test('QUACK_A_CONTROL matches baseline control contract', () => {
    const valid = validateSoundParams(QUACK_A_CONTROL);
    assert.equal(valid.id, 'QUACK_A_CONTROL');
    assert.equal(valid.waveform, 'sawtooth');
    assert.equal(valid.frequency, 340);
    assert.equal(valid.pitchBend, -140);
    assert.equal(valid.gain, 0.15);
    assert.equal(valid.modulationFreq, 22);
    assert.equal(valid.modulationDepth, 35);
    assert.equal(QUACK_SHORT, QUACK_A_CONTROL, 'QUACK_SHORT must remain backwards-compatible alias for Candidate A');
  });

  test('QUACK_B_SYNTH_ADSR is strictly parameter-only with no FM modulation', () => {
    const valid = validateSoundParams(QUACK_B_SYNTH_ADSR);
    assert.equal(valid.id, 'QUACK_B_SYNTH_ADSR');
    assert.equal(valid.waveform, 'sawtooth');
    assert.equal(valid.frequency, 380);
    assert.equal(valid.pitchBend, -40);
    assert.equal(valid.modulationFreq, 0);
    assert.equal(valid.modulationDepth, 0);
    assert.equal(valid.gain, 0.14);
    const duration = calculateDuration(QUACK_B_SYNTH_ADSR);
    assert.ok(duration < 0.15, `Duration (${duration}) should be a short, snappy chirp`);
  });

  test('QUACK_C_FORMANT_NOISE satisfies source-filter contract with parallel formants', () => {
    const valid = validateSoundParams(QUACK_C_FORMANT_NOISE);
    assert.equal(valid.id, 'QUACK_C_FORMANT_NOISE');
    assert.equal(valid.treatment, 'source_filter');
    assert.equal(valid.frequency, 300);
    assert.equal(valid.pitchBend, -30);
    assert.equal(valid.formant1Freq, 750);
    assert.equal(valid.formant2Freq, 1600);
    assert.equal(valid.gain, 0.15);
  });

  test('QUACK_CANDIDATES contains all three stable IDs', () => {
    assert.ok(QUACK_CANDIDATES.QUACK_A_CONTROL);
    assert.ok(QUACK_CANDIDATES.QUACK_B_SYNTH_ADSR);
    assert.ok(QUACK_CANDIDATES.QUACK_C_FORMANT_NOISE);
  });

  test('rejects invalid waveforms and frequencies', () => {
    assert.throws(() => validateSoundParams({ waveform: 'pulse-invalid' }), /Invalid waveform/);
    assert.throws(() => validateSoundParams({ frequency: -10 }), /Invalid frequency/);
  });
});

describe('synth — deterministic noise generation', () => {
  test('generates reproducible noise buffer given the same seed', () => {
    const mockCtx = {
      sampleRate: 44100,
      createBuffer: (channels, length, rate) => ({
        channels,
        length,
        rate,
        _data: new Float32Array(length),
        getChannelData(c) {
          return this._data;
        }
      })
    };

    const buf1 = createDeterministicNoiseBuffer(mockCtx, 0.015, 12345);
    const buf2 = createDeterministicNoiseBuffer(mockCtx, 0.015, 12345);
    const buf3 = createDeterministicNoiseBuffer(mockCtx, 0.015, 99999);

    assert.equal(buf1.length, buf2.length);
    const d1 = buf1.getChannelData(0);
    const d2 = buf2.getChannelData(0);
    const d3 = buf3.getChannelData(0);

    for (let i = 0; i < d1.length; i++) {
      assert.equal(d1[i], d2[i], 'Same seed must produce byte-identical noise samples');
    }

    let diffCount = 0;
    for (let i = 0; i < d1.length; i++) {
      if (d1[i] !== d3[i]) diffCount++;
    }
    assert.ok(diffCount > 0, 'Different seeds should produce different noise samples');
  });
});

describe('synth — mock execution across candidates', () => {
  function createMockAudioContext() {
    const events = [];
    return {
      state: 'running',
      currentTime: 10.0,
      sampleRate: 44100,
      destination: { name: 'dest' },
      resume: async () => events.push('resumed'),
      createBuffer: (c, len, rate) => ({
        getChannelData: () => new Float32Array(len)
      }),
      createBufferSource: () => ({
        buffer: null,
        connect: (d) => events.push(['noise.connect', d]),
        start: (t) => events.push(['noise.start', t]),
        stop: (t) => events.push(['noise.stop', t])
      }),
      createGain: () => ({
        gain: {
          value: 1,
          setValueAtTime: (v, t) => events.push(['gain.set', v, t]),
          linearRampToValueAtTime: (v, t) => events.push(['gain.ramp', v, t]),
          exponentialRampToValueAtTime: (v, t) => events.push(['gain.expRamp', v, t])
        },
        connect: (d) => events.push(['gain.connect', d])
      }),
      createOscillator: () => ({
        type: 'sawtooth',
        frequency: {
          setValueAtTime: (v, t) => events.push(['osc.freq.set', v, t]),
          linearRampToValueAtTime: (v, t) => events.push(['osc.freq.ramp', v, t])
        },
        connect: (d) => events.push(['osc.connect', d]),
        start: (t) => events.push(['osc.start', t]),
        stop: (t) => events.push(['osc.stop', t])
      }),
      createBiquadFilter: () => ({
        type: 'bandpass',
        frequency: { setValueAtTime: (v, t) => events.push(['filter.freq.set', v, t]) },
        Q: { setValueAtTime: (v, t) => events.push(['filter.Q.set', v, t]) },
        connect: (d) => events.push(['filter.connect', d])
      }),
      getEvents: () => events
    };
  }

  test('Candidate A plays via control oscillator routing', async () => {
    const mockCtx = createMockAudioContext();
    const res = await playSynthesizedSound(QUACK_A_CONTROL, { audioContext: mockCtx });
    assert.equal(res.played, true);
    assert.equal(res.candidateId, 'QUACK_A_CONTROL');
    const events = mockCtx.getEvents();
    assert.ok(events.some(e => e[0] === 'osc.freq.set' && e[1] === 340));
  });

  test('Candidate B plays parameter-only routing with zero modulation', async () => {
    const mockCtx = createMockAudioContext();
    const res = await playSynthesizedSound(QUACK_B_SYNTH_ADSR, { audioContext: mockCtx });
    assert.equal(res.played, true);
    assert.equal(res.candidateId, 'QUACK_B_SYNTH_ADSR');
    assert.ok(res.duration < 0.15);
  });

  test('Candidate C plays source-filter routing with biquad bandpass filters and noise', async () => {
    const mockCtx = createMockAudioContext();
    const res = await playSynthesizedSound(QUACK_C_FORMANT_NOISE, { audioContext: mockCtx });
    assert.equal(res.played, true);
    assert.equal(res.candidateId, 'QUACK_C_FORMANT_NOISE');
    assert.equal(res.treatment, 'source_filter');

    const events = mockCtx.getEvents();
    assert.ok(events.some(e => e[0] === 'noise.start'), 'Noise burst must start');
    assert.ok(events.some(e => e[0] === 'filter.freq.set' && e[1] === 750), 'Formant 1 @ 750 Hz');
    assert.ok(events.some(e => e[0] === 'filter.freq.set' && e[1] === 1600), 'Formant 2 @ 1600 Hz');
  });

  test('silent fallback works when Web Audio is missing', async () => {
    const res = await playSynthesizedSound(QUACK_C_FORMANT_NOISE, { audioContext: null, AudioContextClass: null });
    assert.equal(res.played, false);
    assert.equal(res.fallback, 'silent');
  });
});
