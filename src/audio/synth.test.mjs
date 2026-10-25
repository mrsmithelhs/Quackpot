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

  test('rejects invalid waveforms, treatments, and non-finite frequencies', () => {
    assert.throws(() => validateSoundParams({ waveform: 'pulse-invalid' }), /Invalid waveform/);
    assert.throws(() => validateSoundParams({ treatment: 'neural_dsp' }), /Invalid treatment/);
    assert.throws(() => validateSoundParams({ frequency: -10 }), /Invalid frequency/);
    assert.throws(() => validateSoundParams({ frequency: NaN }), /Invalid frequency/);
    assert.throws(() => validateSoundParams({ frequency: Infinity }), /Invalid frequency/);
    assert.throws(() => validateSoundParams({ frequency: 50000 }), /Invalid frequency/);
  });

  test('rejects non-finite and out-of-range ADSR envelope and duration parameters', () => {
    assert.throws(() => validateSoundParams({ attack: NaN }), /Invalid attack/);
    assert.throws(() => validateSoundParams({ attack: Infinity }), /Invalid attack/);
    assert.throws(() => validateSoundParams({ attack: 0 }), /Invalid attack/);
    assert.throws(() => validateSoundParams({ attack: 1.5 }), /Invalid attack/);

    assert.throws(() => validateSoundParams({ decay: NaN }), /Invalid decay/);
    assert.throws(() => validateSoundParams({ decay: 2.5 }), /Invalid decay/);

    assert.throws(() => validateSoundParams({ sustain: NaN }), /Invalid sustain/);
    assert.throws(() => validateSoundParams({ sustain: -0.1 }), /Invalid sustain/);
    assert.throws(() => validateSoundParams({ sustain: 1.5 }), /Invalid sustain/);

    assert.throws(() => validateSoundParams({ release: NaN }), /Invalid release/);
    assert.throws(() => validateSoundParams({ release: 2.0 }), /Invalid release/);

    // Total duration over conservative 2.0s limit
    assert.throws(
      () => validateSoundParams({ attack: 0.5, decay: 0.9, release: 0.9 }),
      /exceeds conservative quack limit/
    );
  });

  test('rejects non-finite and out-of-range gain, pitch bend, and modulation', () => {
    assert.throws(() => validateSoundParams({ gain: NaN }), /Invalid gain/);
    assert.throws(() => validateSoundParams({ gain: Infinity }), /Invalid gain/);
    assert.throws(() => validateSoundParams({ gain: 0 }), /Invalid gain/);
    assert.throws(() => validateSoundParams({ gain: 1.5 }), /Invalid gain/);

    assert.throws(() => validateSoundParams({ pitchBend: NaN }), /Invalid pitchBend/);
    assert.throws(() => validateSoundParams({ frequency: 100, pitchBend: -95 }), /Invalid ending frequency/);

    assert.throws(() => validateSoundParams({ modulationFreq: NaN }), /Invalid modulationFreq/);
    assert.throws(() => validateSoundParams({ modulationFreq: 150 }), /Invalid modulationFreq/);

    assert.throws(() => validateSoundParams({ modulationDepth: NaN }), /Invalid modulationDepth/);
    assert.throws(() => validateSoundParams({ modulationDepth: 600 }), /Invalid modulationDepth/);
  });

  test('rejects non-finite and out-of-range formant and noise parameters', () => {
    assert.throws(() => validateSoundParams({ formant1Freq: NaN }), /Invalid formant1Freq/);
    assert.throws(() => validateSoundParams({ formant1Freq: 30 }), /Invalid formant1Freq/);
    assert.throws(() => validateSoundParams({ formant1Q: NaN }), /Invalid formant1Q/);
    assert.throws(() => validateSoundParams({ formant1Q: 0 }), /Invalid formant1Q/);
    assert.throws(() => validateSoundParams({ formant1Gain: NaN }), /Invalid formant1Gain/);
    assert.throws(() => validateSoundParams({ formant1Gain: 3.0 }), /Invalid formant1Gain/);

    assert.throws(() => validateSoundParams({ formant2Freq: NaN }), /Invalid formant2Freq/);
    assert.throws(() => validateSoundParams({ formant2Freq: 8000 }), /Invalid formant2Freq/);
    assert.throws(() => validateSoundParams({ formant2Q: NaN }), /Invalid formant2Q/);
    assert.throws(() => validateSoundParams({ formant2Gain: NaN }), /Invalid formant2Gain/);

    assert.throws(() => validateSoundParams({ noiseDuration: NaN }), /Invalid noiseDuration/);
    assert.throws(() => validateSoundParams({ noiseDuration: Infinity }), /Invalid noiseDuration/);
    assert.throws(() => validateSoundParams({ noiseDuration: 0.5 }), /Invalid noiseDuration/);
    assert.throws(() => validateSoundParams({ noiseGain: NaN }), /Invalid noiseGain/);
    assert.throws(() => validateSoundParams({ noiseGain: 1.5 }), /Invalid noiseGain/);
  });
});

describe('synth — deterministic noise generation', () => {
  test('rejects non-finite or extreme noise duration without allocating buffers', () => {
    let allocated = false;
    const mockCtx = {
      sampleRate: 44100,
      createBuffer: () => {
        allocated = true;
        return { getChannelData: () => new Float32Array(1) };
      }
    };

    assert.throws(() => createDeterministicNoiseBuffer(mockCtx, NaN), /Invalid noise duration/);
    assert.throws(() => createDeterministicNoiseBuffer(mockCtx, Infinity), /Invalid noise duration/);
    assert.throws(() => createDeterministicNoiseBuffer(mockCtx, -0.01), /Invalid noise duration/);
    assert.throws(() => createDeterministicNoiseBuffer(mockCtx, 0), /Invalid noise duration/);
    assert.throws(() => createDeterministicNoiseBuffer(mockCtx, 10.0), /Invalid noise duration/);
    assert.equal(allocated, false, 'Must not allocate memory for invalid durations');
  });

  test('returns null when context is unavailable or lacks createBuffer', () => {
    assert.equal(createDeterministicNoiseBuffer(null, 0.015), null);
    assert.equal(createDeterministicNoiseBuffer({}, 0.015), null);
  });
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
