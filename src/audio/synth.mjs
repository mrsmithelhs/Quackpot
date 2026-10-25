/**
 * @file synth.mjs
 * Zero-dependency Web Audio synthesizer for text-stored sound parameters.
 * Implements the three quack audition candidates per Plan 04 refinement conditions:
 * - QUACK_A_CONTROL (Baseline unchanged control)
 * - QUACK_B_SYNTH_ADSR (Parameter-only articulated revision)
 * - QUACK_C_FORMANT_NOISE (Small source-filter graph with parallel formants & breath noise)
 */

export const QUACK_A_CONTROL = Object.freeze({
  id: 'QUACK_A_CONTROL',
  name: 'Candidate A: Baseline Control',
  treatment: 'control',
  waveform: 'sawtooth',    // Rich harmonic base
  frequency: 340,          // Fundamental pitch in Hz
  pitchBend: -140,         // Pitch drop over duration in Hz
  attack: 0.02,            // 20ms attack
  decay: 0.12,             // 120ms decay
  sustain: 0.05,           // Sustain floor ratio (0-1)
  release: 0.08,           // 80ms release (Total: 0.22s)
  modulationFreq: 22,      // Vibrato / resonance freq in Hz
  modulationDepth: 35,     // Modulation intensity in Hz
  gain: 0.15               // Peak gain
});

// For backwards compatibility with earlier spike contracts
export const QUACK_SHORT = QUACK_A_CONTROL;

export const QUACK_B_SYNTH_ADSR = Object.freeze({
  id: 'QUACK_B_SYNTH_ADSR',
  name: 'Candidate B: Articulated ADSR',
  treatment: 'param_only',
  waveform: 'sawtooth',    // Sawtooth base
  frequency: 380,          // Slightly higher initial pitch in Hz
  pitchBend: -40,          // Mild whole-duration inflection (-40 Hz)
  attack: 0.005,           // Snappy 5ms attack
  decay: 0.06,             // Quick 60ms decay
  sustain: 0.15,           // Stable vowel floor ratio
  release: 0.04,           // Snappy 40ms release (Total: ~0.105s)
  modulationFreq: 0,       // No continuous FM modulation
  modulationDepth: 0,
  gain: 0.14               // Level-matched perceived volume
});

export const QUACK_C_FORMANT_NOISE = Object.freeze({
  id: 'QUACK_C_FORMANT_NOISE',
  name: 'Candidate C: Source-Filter Formant & Breath',
  treatment: 'source_filter',
  waveform: 'sawtooth',    // Buzzy carrier
  frequency: 300,          // 300 Hz fundamental
  pitchBend: -30,          // Subtle pitch drop (-30 Hz)
  attack: 0.01,            // 10ms attack
  decay: 0.08,             // 80ms decay
  sustain: 0.05,           // Low sustain floor
  release: 0.06,           // 60ms release (Total: ~0.15s)
  // Parallel Formant Bands (Simulating nasal cavity resonances)
  formant1Freq: 750,       // Hz (lower nasal body)
  formant1Q: 3.0,
  formant1Gain: 0.85,
  formant2Freq: 1600,      // Hz (beak resonance)
  formant2Q: 3.5,
  formant2Gain: 0.65,
  // Deterministic Noise Burst (Transient bill click)
  noiseDuration: 0.015,    // 15ms duration
  noiseGain: 0.12,         // Controlled mix ratio
  gain: 0.15               // Master output calibrated for matched loudness
});

export const QUACK_CANDIDATES = Object.freeze({
  QUACK_A_CONTROL,
  QUACK_B_SYNTH_ADSR,
  QUACK_C_FORMANT_NOISE
});

const VALID_WAVEFORMS = Object.freeze(['sawtooth', 'triangle', 'sine', 'square']);

/**
 * Validates audio parameters against safe numeric ranges.
 * @param {Object} params 
 * @returns {Object} validated params
 */
export function validateSoundParams(params = {}) {
  if (!params || typeof params !== 'object') {
    throw new Error('Sound params must be an object');
  }

  const waveform = params.waveform || 'sawtooth';
  if (!VALID_WAVEFORMS.includes(waveform)) {
    throw new Error(`Invalid waveform "${waveform}". Supported: ${VALID_WAVEFORMS.join(', ')}`);
  }

  const frequency = Number(params.frequency ?? 340);
  if (!Number.isFinite(frequency) || frequency <= 0 || frequency > 20000) {
    throw new Error(`Invalid frequency "${params.frequency}". Must be between 1 and 20000 Hz.`);
  }

  const gain = Number(params.gain ?? 0.15);
  if (!Number.isFinite(gain) || gain <= 0 || gain > 1.0) {
    throw new Error(`Invalid gain "${params.gain}". Must be between 0 and 1.0.`);
  }

  const attack = Math.max(0.001, Number(params.attack ?? 0.02));
  const decay = Math.max(0.001, Number(params.decay ?? 0.12));
  const sustain = Math.max(0, Math.min(1.0, Number(params.sustain ?? 0.05)));
  const release = Math.max(0.001, Number(params.release ?? 0.08));
  const pitchBend = Number(params.pitchBend ?? 0);
  const modulationFreq = Math.max(0, Number(params.modulationFreq ?? 0));
  const modulationDepth = Math.max(0, Number(params.modulationDepth ?? 0));

  const treatment = params.treatment || (params.formant1Freq ? 'source_filter' : 'control');

  return {
    id: params.id || params.name || 'CUSTOM_SOUND',
    name: params.name || 'CUSTOM_SOUND',
    treatment,
    waveform,
    frequency,
    pitchBend,
    attack,
    decay,
    sustain,
    release,
    modulationFreq,
    modulationDepth,
    gain,
    formant1Freq: Number(params.formant1Freq ?? 750),
    formant1Q: Number(params.formant1Q ?? 3.0),
    formant1Gain: Number(params.formant1Gain ?? 0.85),
    formant2Freq: Number(params.formant2Freq ?? 1600),
    formant2Q: Number(params.formant2Q ?? 3.5),
    formant2Gain: Number(params.formant2Gain ?? 0.65),
    noiseDuration: Number(params.noiseDuration ?? 0.015),
    noiseGain: Number(params.noiseGain ?? 0.12)
  };
}

/**
 * Generates an AudioBuffer containing deterministic pseudo-random white noise.
 * Uses an isolated linear congruential generator (LCG) seed to ensure 100% reproducible
 * audition noise completely decoupled from game simulation PRNG.
 * @param {AudioContext} ctx
 * @param {number} durationSeconds
 * @param {number} [seed=12345]
 * @returns {AudioBuffer|null}
 */
export function createDeterministicNoiseBuffer(ctx, durationSeconds, seed = 12345) {
  if (!ctx || typeof ctx.createBuffer !== 'function') return null;
  const sampleRate = ctx.sampleRate || 44100;
  const length = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channelData = buffer.getChannelData(0);

  let state = seed;
  for (let i = 0; i < length; i++) {
    // 32-bit LCG
    state = (state * 1664525 + 1013904223) % 4294967296;
    channelData[i] = (state / 4294967296) * 2 - 1;
  }
  return buffer;
}

/**
 * Calculates total sound duration from ADSR parameters.
 * @param {Object} params 
 * @returns {number} duration in seconds
 */
export function calculateDuration(params) {
  const p = validateSoundParams(params);
  return p.attack + p.decay + p.release;
}

// Module-scoped audio context reference for browser sessions
let activeContext = null;

/**
 * Safely obtains or resumes an AudioContext under a user gesture.
 * Returns null if Web Audio is unsupported (silent fallback).
 * @param {Object} [customAudioContextClass] Optional injectable constructor for testing
 * @returns {AudioContext|null}
 */
export function getOrCreateAudioContext(customAudioContextClass) {
  const ContextClass = customAudioContextClass ||
    (typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null);

  if (!ContextClass) {
    return null;
  }

  try {
    if (!activeContext || activeContext.state === 'closed') {
      activeContext = new ContextClass();
    }
    return activeContext;
  } catch (err) {
    return null;
  }
}

/**
 * Resets the active audio context (useful for test isolation).
 */
export function resetAudioContextForTesting() {
  if (activeContext) {
    try {
      if (typeof activeContext.close === 'function') {
        activeContext.close();
      }
    } catch (_) {}
    activeContext = null;
  }
}

/**
 * Plays a synthesized sound from text parameters.
 * Supports Candidate A (control), Candidate B (parameter-only), and Candidate C (source-filter).
 * @param {Object} [rawParams=QUACK_SHORT] 
 * @param {Object} [options={}] Options including optional injectable audio context for tests
 * @returns {Promise<{ played: boolean, reason?: string, duration?: number, candidateId?: string }>}
 */
export async function playSynthesizedSound(rawParams = QUACK_SHORT, options = {}) {
  const params = validateSoundParams(rawParams);
  const ctx = options.audioContext || getOrCreateAudioContext(options.AudioContextClass);

  if (!ctx) {
    return {
      played: false,
      reason: 'audio_context_unsupported',
      fallback: 'silent'
    };
  }

  try {
    // Resume on user gesture if suspended
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      await ctx.resume();
    }

    if (ctx.state !== 'running') {
      return {
        played: false,
        reason: 'audio_context_suspended',
        fallback: 'silent'
      };
    }

    const now = ctx.currentTime;
    const {
      treatment,
      attack,
      decay,
      sustain,
      release,
      frequency,
      pitchBend,
      gain,
      modulationFreq,
      modulationDepth,
      formant1Freq,
      formant1Q,
      formant1Gain,
      formant2Freq,
      formant2Q,
      formant2Gain,
      noiseDuration,
      noiseGain
    } = params;
    const totalDuration = attack + decay + release;

    // 1. Master Envelope Gain Node (ADSR)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(gain, now + attack);
    masterGain.gain.linearRampToValueAtTime(gain * sustain, now + attack + decay);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);
    masterGain.connect(ctx.destination);

    // 2. Carrier Oscillator
    const carrier = ctx.createOscillator();
    carrier.type = params.waveform;
    carrier.frequency.setValueAtTime(frequency, now);
    carrier.frequency.linearRampToValueAtTime(Math.max(20, frequency + pitchBend), now + totalDuration);

    if (treatment === 'source_filter') {
      // --- Candidate C Routing: Parallel Formant Filter Branches + Breath Noise ---
      const sumBus = ctx.createGain();
      sumBus.gain.setValueAtTime(1.0, now);

      carrier.connect(sumBus);

      // Deterministic breath noise burst
      const noiseBuffer = createDeterministicNoiseBuffer(ctx, noiseDuration, 42424);
      if (noiseBuffer && typeof ctx.createBufferSource === 'function') {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGainNode = ctx.createGain();
        noiseGainNode.gain.setValueAtTime(noiseGain, now);
        noiseGainNode.gain.linearRampToValueAtTime(0.0001, now + noiseDuration);
        noiseSource.connect(noiseGainNode);
        noiseGainNode.connect(sumBus);
        noiseSource.start(now);
        noiseSource.stop(now + noiseDuration + 0.01);
      }

      // Parallel Formant Branch 1 (Lower Nasal)
      if (typeof ctx.createBiquadFilter === 'function') {
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(formant1Freq, now);
        f1.Q.setValueAtTime(formant1Q, now);
        const f1Gain = ctx.createGain();
        f1Gain.gain.setValueAtTime(formant1Gain, now);
        sumBus.connect(f1);
        f1.connect(f1Gain);
        f1Gain.connect(masterGain);

        // Parallel Formant Branch 2 (Beak Resonance)
        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.setValueAtTime(formant2Freq, now);
        f2.Q.setValueAtTime(formant2Q, now);
        const f2Gain = ctx.createGain();
        f2Gain.gain.setValueAtTime(formant2Gain, now);
        sumBus.connect(f2);
        f2.connect(f2Gain);
        f2Gain.connect(masterGain);
      } else {
        // Fallback for mock environments lacking createBiquadFilter
        sumBus.connect(masterGain);
      }
    } else {
      // --- Candidate A & B Routing: Direct Carrier to Master Envelope (+ Optional FM) ---
      let modulator = null;
      if (modulationFreq > 0 && modulationDepth > 0) {
        modulator = ctx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(modulationFreq, now);

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(modulationDepth, now);
        modGain.gain.linearRampToValueAtTime(modulationDepth * 0.2, now + totalDuration);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        modulator.start(now);
        modulator.stop(now + totalDuration + 0.05);
      }

      carrier.connect(masterGain);
    }

    carrier.start(now);
    carrier.stop(now + totalDuration + 0.05);

    return {
      played: true,
      candidateId: params.id || params.name,
      name: params.name,
      duration: totalDuration,
      gain: params.gain,
      treatment: params.treatment
    };
  } catch (err) {
    return {
      played: false,
      reason: 'playback_error',
      error: err.message,
      fallback: 'silent'
    };
  }
}
