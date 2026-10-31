/* Editable, portable Plan 39 synthesized instrument patch definitions.
 * Note: Oscillator-and-filter patches are lightweight procedural synthesis proofs,
 * never claimed to be authentic sampled acoustic instruments.
 */
(function initPlan39Patches(root) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze(value[key]);
    }
    return value;
  }

  const PATCHES = [
    {
      id: "P0-plan32-triangle",
      name: "P0 — Plan 32 Original Bare Triangle (Historical Reference)",
      description: "Exact Plan 32 triangle wave parameters (attack 0.012 s, decay 0.075 s, sustain 0.22, release 0.09 s, tail 0.12 s, masterGain 0.70). Matches the 4.92 s historical reference.",
      isHistoricalPlan32: true,
      tailSeconds: 0.12,
      masterGain: 0.70,
      sampleRate: 48000,
      lead: {
        waveform: "triangle",
        overtoneWaveform: null,
        overtoneRatio: 2,
        overtoneGain: 0,
        detuneCents: 0,
        filterCutoffHz: null,
        filterPeakHz: null,
        filterDecaySeconds: 0,
        filterQ: 0.7,
        attackSeconds: 0.012,
        decaySeconds: 0.075,
        sustainRatio: 0.22,
        releaseSeconds: 0.09,
        voicePeak: 0.24,
        pan: 0
      },
      chords: {
        waveform: "triangle",
        overtoneWaveform: "sine",
        overtoneRatio: 1,
        overtoneGain: 0,
        detuneCents: 0,
        filterCutoffHz: 1300,
        filterQ: 0.6,
        attackSeconds: 0.02,
        decaySeconds: 0.18,
        sustainRatio: 0.35,
        releaseSeconds: 0.10,
        voicePeak: 0.085,
        pan: -0.15
      },
      bass: {
        waveform: "triangle",
        overtoneWaveform: "sine",
        overtoneRatio: 2,
        overtoneGain: 0.28,
        filterCutoffHz: 360,
        filterQ: 0.7,
        attackSeconds: 0.008,
        decaySeconds: 0.14,
        sustainRatio: 0.35,
        releaseSeconds: 0.08,
        voicePeak: 0.16,
        pan: 0
      }
    },
    {
      id: "P1-pluck-bell",
      name: "P1 — Clean Pluck / Marimba-Bell Ensemble",
      description: "Articulate triangle + octave-sine bell transient lead with lowpass filter envelope, warm filtered chord plucks (1.35 kHz shelf), and small-speaker-friendly bass (2nd harmonic overtone).",
      isHistoricalPlan32: false,
      tailSeconds: 0.12,
      masterGain: 0.72,
      sampleRate: 48000,
      lead: {
        waveform: "triangle",
        overtoneWaveform: "sine",
        overtoneRatio: 2,
        overtoneGain: 0.22,
        detuneCents: 0,
        filterCutoffHz: 1600,
        filterPeakHz: 4200,
        filterDecaySeconds: 0.14,
        filterQ: 0.9,
        attackSeconds: 0.004,
        decaySeconds: 0.18,
        sustainRatio: 0.18,
        releaseSeconds: 0.09,
        voicePeak: 0.23,
        pan: 0
      },
      chords: {
        waveform: "triangle",
        overtoneWaveform: "sine",
        overtoneRatio: 1,
        overtoneGain: 0.25,
        detuneCents: 3,
        filterCutoffHz: 1350,
        filterQ: 0.6,
        attackSeconds: 0.022,
        decaySeconds: 0.24,
        sustainRatio: 0.36,
        releaseSeconds: 0.11,
        voicePeak: 0.08,
        pan: -0.20
      },
      bass: {
        waveform: "triangle",
        overtoneWaveform: "triangle",
        overtoneRatio: 2,
        overtoneGain: 0.32,
        filterCutoffHz: 380,
        filterQ: 0.75,
        attackSeconds: 0.006,
        decaySeconds: 0.16,
        sustainRatio: 0.32,
        releaseSeconds: 0.08,
        voicePeak: 0.16,
        pan: 0
      }
    },
    {
      id: "P2-warm-keys",
      name: "P2 — Warm Electric Keyboard / Cozy Lounge Keys",
      description: "Softly chorused triangle/sine lead (2.6 kHz warm filter), buttery Rhodes-style detuned accompaniment bed (1.2 kHz lowpass clearing the lead register), and rounded bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.12,
      masterGain: 0.72,
      sampleRate: 48000,
      lead: {
        waveform: "triangle",
        overtoneWaveform: "sine",
        overtoneRatio: 1,
        overtoneGain: 0.35,
        detuneCents: 3,
        filterCutoffHz: 2400,
        filterPeakHz: 3200,
        filterDecaySeconds: 0.16,
        filterQ: 0.7,
        attackSeconds: 0.012,
        decaySeconds: 0.20,
        sustainRatio: 0.42,
        releaseSeconds: 0.10,
        voicePeak: 0.21,
        pan: 0
      },
      chords: {
        waveform: "sine",
        overtoneWaveform: "triangle",
        overtoneRatio: 1,
        overtoneGain: 0.45,
        detuneCents: 4,
        filterCutoffHz: 1200,
        filterQ: 0.55,
        attackSeconds: 0.030,
        decaySeconds: 0.30,
        sustainRatio: 0.45,
        releaseSeconds: 0.11,
        voicePeak: 0.075,
        pan: -0.22
      },
      bass: {
        waveform: "sine",
        overtoneWaveform: "triangle",
        overtoneRatio: 2,
        overtoneGain: 0.38,
        filterCutoffHz: 340,
        filterQ: 0.65,
        attackSeconds: 0.010,
        decaySeconds: 0.20,
        sustainRatio: 0.40,
        releaseSeconds: 0.09,
        voicePeak: 0.16,
        pan: 0
      }
    },
    {
      id: "P3-toy-ensemble",
      name: "P3 — Light Arcade / Cozy Toy-Synth Ensemble",
      description: "Playful band-limited square/triangle lead with rounded lowpass filter envelope (no harsh NES sizzle), snappy staccato accompaniment stabs, and bouncy bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.12,
      masterGain: 0.70,
      sampleRate: 48000,
      lead: {
        waveform: "square",
        overtoneWaveform: "triangle",
        overtoneRatio: 1,
        overtoneGain: 0.40,
        detuneCents: 2,
        filterCutoffHz: 1550,
        filterPeakHz: 2900,
        filterDecaySeconds: 0.11,
        filterQ: 1.25,
        attackSeconds: 0.006,
        decaySeconds: 0.12,
        sustainRatio: 0.34,
        releaseSeconds: 0.08,
        voicePeak: 0.16,
        pan: 0
      },
      chords: {
        waveform: "triangle",
        overtoneWaveform: "sine",
        overtoneRatio: 2,
        overtoneGain: 0.18,
        detuneCents: 2,
        filterCutoffHz: 1150,
        filterQ: 0.65,
        attackSeconds: 0.008,
        decaySeconds: 0.10,
        sustainRatio: 0.18,
        releaseSeconds: 0.06,
        voicePeak: 0.08,
        pan: 0.18
      },
      bass: {
        waveform: "triangle",
        overtoneWaveform: "square",
        overtoneRatio: 2,
        overtoneGain: 0.18,
        filterCutoffHz: 350,
        filterQ: 0.85,
        attackSeconds: 0.004,
        decaySeconds: 0.13,
        sustainRatio: 0.18,
        releaseSeconds: 0.06,
        voicePeak: 0.17,
        pan: 0
      }
    }
  ];

  const PATCHES_DATA = deepFreeze({
    schemaVersion: 1,
    artifact: "quackpot-plan39-synth-patch-authority",
    disclaimer: "Synthesized oscillator-and-filter patches for composition/reference evaluation; not sampled acoustic instruments.",
    patches: PATCHES
  });

  root.QUACKPOT_PLAN39_PATCHES = PATCHES_DATA;
  if (typeof module === "object" && module.exports) {
    module.exports = PATCHES_DATA;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
