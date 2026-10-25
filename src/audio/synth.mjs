/**
 * @file synth.mjs
 * Zero-dependency Web Audio synthesizer for text-stored sound parameters.
 * Implements QUACK_SHORT per Plan 04 controlling conditions with conservative gain,
 * user-gesture start/resume, and silent fallback.
 */

export const QUACK_SHORT = Object.freeze({
  name: 'QUACK_SHORT',
  waveform: 'sawtooth',    // Rich harmonic base
  frequency: 340,          // Fundamental pitch in Hz
  pitchBend: -140,         // Pitch drop over duration in Hz
  attack: 0.02,            // 20ms attack
  decay: 0.12,             // 120ms decay
  sustain: 0.05,           // Sustain floor ratio (0-1)
  release: 0.08,           // 80ms release
  modulationFreq: 22,      // Vibrato / resonance freq in Hz
  modulationDepth: 35,     // Modulation intensity in Hz
  gain: 0.15               // Conservative peak gain (prevents clipping)
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

  return {
    name: params.name || 'CUSTOM_SOUND',
    waveform,
    frequency,
    pitchBend,
    attack,
    decay,
    sustain,
    release,
    modulationFreq,
    modulationDepth,
    gain
  };
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
 * Employs conservative gain, user-gesture resume, and silent fallback.
 * @param {Object} [rawParams=QUACK_SHORT] 
 * @param {Object} [options={}] Options including optional injectable audio context for tests
 * @returns {Promise<{ played: boolean, reason?: string, duration?: number }>}
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
    // If context was created earlier in suspended state, resume on user gesture
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
    const { attack, decay, sustain, release, frequency, pitchBend, gain, modulationFreq, modulationDepth } = params;
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

    // 3. FM Modulation Oscillator (if configured) for natural organic resonance
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
    carrier.start(now);
    carrier.stop(now + totalDuration + 0.05);

    return {
      played: true,
      name: params.name,
      duration: totalDuration,
      gain: params.gain
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
