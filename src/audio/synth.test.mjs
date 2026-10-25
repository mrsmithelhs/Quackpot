import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  QUACK_SHORT,
  validateSoundParams,
  calculateDuration,
  playSynthesizedSound,
  resetAudioContextForTesting
} from './synth.mjs';

describe('synth — parameter validation and duration', () => {
  test('QUACK_SHORT satisfies parameter contract', () => {
    const valid = validateSoundParams(QUACK_SHORT);
    assert.equal(valid.name, 'QUACK_SHORT');
    assert.equal(valid.waveform, 'sawtooth');
    assert.equal(valid.frequency, 340);
    assert.equal(valid.pitchBend, -140);
    assert.equal(valid.gain, 0.15);
    assert.ok(valid.gain <= 0.2, 'Gain must be conservative to prevent ear fatigue');
  });

  test('calculateDuration accurately computes envelope time', () => {
    const duration = calculateDuration(QUACK_SHORT);
    // 0.02 + 0.12 + 0.08 = 0.22s
    assert.ok(Math.abs(duration - 0.22) < 0.001);
  });

  test('rejects invalid waveforms', () => {
    assert.throws(() => validateSoundParams({ waveform: 'super-sine-pwm' }), /Invalid waveform/);
  });

  test('rejects frequencies outside human audio bounds', () => {
    assert.throws(() => validateSoundParams({ frequency: -50 }), /Invalid frequency/);
    assert.throws(() => validateSoundParams({ frequency: 25000 }), /Invalid frequency/);
    assert.throws(() => validateSoundParams({ frequency: 'not-a-number' }), /Invalid frequency/);
  });

  test('rejects unsafe peak gain', () => {
    assert.throws(() => validateSoundParams({ gain: 1.5 }), /Invalid gain/);
    assert.throws(() => validateSoundParams({ gain: -0.1 }), /Invalid gain/);
  });
});

describe('synth — silent fallback in headless/Node environment', () => {
  beforeEach(() => {
    resetAudioContextForTesting();
  });

  test('resolves gracefully with silent fallback when AudioContext is absent', async () => {
    // In Node.js, window is undefined
    const result = await playSynthesizedSound(QUACK_SHORT);
    assert.deepEqual(result, {
      played: false,
      reason: 'audio_context_unsupported',
      fallback: 'silent'
    });
  });
});

describe('synth — mock Web Audio scheduling and user gesture', () => {
  // Simple mock Web Audio harness
  function createMockAudioContext(initialState = 'running') {
    const events = [];
    let state = initialState;

    return {
      get state() {
        return state;
      },
      currentTime: 10.0,
      destination: { name: 'destination' },
      resume: async () => {
        events.push('resumed');
        state = 'running';
      },
      createGain: () => {
        const gainNode = {
          gain: {
            value: 1,
            setValueAtTime: (val, time) => events.push(['gain.setValueAtTime', val, time]),
            linearRampToValueAtTime: (val, time) => events.push(['gain.linearRampToValueAtTime', val, time]),
            exponentialRampToValueAtTime: (val, time) => events.push(['gain.exponentialRampToValueAtTime', val, time])
          },
          connect: (dest) => events.push(['gain.connect', dest])
        };
        return gainNode;
      },
      createOscillator: () => {
        const osc = {
          type: 'sine',
          frequency: {
            value: 440,
            setValueAtTime: (val, time) => events.push(['osc.freq.setValueAtTime', val, time]),
            linearRampToValueAtTime: (val, time) => events.push(['osc.freq.linearRampToValueAtTime', val, time])
          },
          connect: (dest) => events.push(['osc.connect', dest]),
          start: (time) => events.push(['osc.start', time]),
          stop: (time) => events.push(['osc.stop', time])
        };
        return osc;
      },
      getEvents: () => events
    };
  }

  test('schedules carrier and FM modulator with correct ADSR envelope', async () => {
    const mockCtx = createMockAudioContext('running');
    const result = await playSynthesizedSound(QUACK_SHORT, { audioContext: mockCtx });

    assert.equal(result.played, true);
    assert.equal(result.name, 'QUACK_SHORT');
    assert.ok(result.duration > 0.2);

    const events = mockCtx.getEvents();
    assert.ok(events.some(e => e[0] === 'gain.linearRampToValueAtTime' && e[1] === 0.15), 'Ramps to peak gain 0.15');
    assert.ok(events.some(e => e[0] === 'osc.freq.setValueAtTime' && e[1] === 340), 'Starts at carrier freq 340 Hz');
  });

  test('resumes suspended context upon play request (simulating user gesture unlock)', async () => {
    const mockCtx = createMockAudioContext('suspended');
    const result = await playSynthesizedSound(QUACK_SHORT, { audioContext: mockCtx });

    assert.equal(result.played, true);
    const events = mockCtx.getEvents();
    assert.ok(events.includes('resumed'), 'Context resume must be invoked');
  });

  test('falls back silently if resume fails to unlock context', async () => {
    const stubbornMockCtx = {
      state: 'suspended',
      resume: async () => {
        // Keeps state suspended
      }
    };

    const result = await playSynthesizedSound(QUACK_SHORT, { audioContext: stubbornMockCtx });
    assert.equal(result.played, false);
    assert.equal(result.reason, 'audio_context_suspended');
    assert.equal(result.fallback, 'silent');
  });
});
