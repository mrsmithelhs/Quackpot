/* ============================================================================
 * Quackpot Plan 39: Web Audio Laboratory Synthesizer Patches
 *
 * Attribution & License Notice:
 * Procedural General MIDI (GM) operator recipes adapted from `webaudio-tinysynth`:
 *   Copyright (c) 2015-2024 Tatsuya Shinyagaito (g200kg)
 *   Repository: https://github.com/g200kg/webaudio-tinysynth
 *   License: Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 *
 * Quackpot Procedural Synthesis Disclaimer:
 * All synthesized instrument patches defined herein are lightweight algorithmic
 * Web Audio FM/additive procedural synthesis proofs for melody reference and
 * composition audition; they are never claimed to be authentic sampled acoustic
 * instruments. No external PCM sample files or SoundFonts are utilized.
 * ============================================================================
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

  /* --------------------------------------------------------------------------
   * 1. Curated webaudio-tinysynth (quality: 1) GM Instrument Definitions
   *
   * Operator parameters adhere to webaudio-tinysynth quality:1 timbre format:
   *   g : output destination (0 = voice master audio out, 1..n = FM modulator to osc n)
   *   w : waveform ("sine", "triangle", "sawtooth", "square", "w9999", "n0", "n1")
   *   v : volume level / modulation index
   *   t : tuning ratio multiplier (fundamental * t)
   *   f : fixed frequency in Hz (0 = track note pitch)
   *   a : attack time in seconds
   *   h : hold time in seconds
   *   d : decay time in seconds
   *   s : sustain level (0.0 to 1.0)
   *   r : release time in seconds
   *   p : pitch sweep depth
   *   q : pitch sweep rate
   *   k : key-scaling coefficient (scales decay time and modulation across octaves)
   * -------------------------------------------------------------------------- */
  const GM_PROGRAMS = [
    {
      id: "P0-plan32-triangle",
      gmNumber: null,
      name: "P0 — Plan 32 Historical Bare Triangle (Control)",
      category: "control",
      roles: ["lead", "chords", "bass"],
      voiceGain: 0.24,
      releaseTailSeconds: 0.12,
      operators: [
        { g: 0, w: "triangle", v: 1.0, t: 1, f: 0, a: 0.012, h: 0, d: 0.075, s: 0.22, r: 0.09, p: 0, q: 0, k: 0 }
      ]
    },
    {
      id: "GM-00-piano",
      gmNumber: 0,
      name: "GM 00 — Acoustic Grand Piano (TinySynth q:1)",
      category: "keys",
      roles: ["lead", "chords"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.25,
      operators: [
        { g: 0, w: "sine", v: 0.45, t: 1, f: 0, a: 0.005, h: 0, d: 0.70, s: 0.05, r: 0.15, p: 0, q: 0, k: -1.2 },
        { g: 1, w: "triangle", v: 2.8, t: 1, f: 0, a: 0.010, h: 0, d: 0.60, s: 0.02, r: 0.10, p: 0, q: 0, k: -1.2 }
      ]
    },
    {
      id: "GM-04-epiano1",
      gmNumber: 4,
      name: "GM 04 — Electric Piano 1 / Rhodes (TinySynth q:1)",
      category: "keys",
      roles: ["lead", "chords"],
      voiceGain: 0.21,
      releaseTailSeconds: 0.28,
      operators: [
        { g: 0, w: "sine", v: 0.50, t: 1, f: 0, a: 0.005, h: 0, d: 0.60, s: 0.25, r: 0.15, p: 0, q: 0, k: -0.8 },
        { g: 1, w: "sine", v: 2.2, t: 14, f: 0, a: 0.002, h: 0, d: 0.07, s: 0.00, r: 0.08, p: 0, q: 0, k: -0.5 },
        { g: 1, w: "triangle", v: 0.8, t: 1, f: 0, a: 0.010, h: 0, d: 0.40, s: 0.10, r: 0.12, p: 0, q: 0, k: -0.8 }
      ]
    },
    {
      id: "GM-05-epiano2",
      gmNumber: 5,
      name: "GM 05 — Electric Piano 2 / DX Chime (TinySynth q:1)",
      category: "keys",
      roles: ["lead", "chords"],
      voiceGain: 0.20,
      releaseTailSeconds: 0.30,
      operators: [
        { g: 0, w: "sine", v: 0.45, t: 1, f: 0, a: 0.004, h: 0, d: 0.70, s: 0.30, r: 0.18, p: 0, q: 0, k: -0.7 },
        { g: 1, w: "sine", v: 3.2, t: 1, f: 0, a: 0.002, h: 0, d: 0.25, s: 0.08, r: 0.12, p: 0, q: 0, k: -0.9 },
        { g: 0, w: "sine", v: 0.25, t: 2, f: 0, a: 0.004, h: 0, d: 0.50, s: 0.15, r: 0.15, p: 0, q: 0, k: -0.7 }
      ]
    },
    {
      id: "GM-08-celesta",
      gmNumber: 8,
      name: "GM 08 — Celesta (TinySynth q:1)",
      category: "mallet",
      roles: ["lead", "chords"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.32,
      operators: [
        { g: 0, w: "sine", v: 0.42, t: 2, f: 0, a: 0.002, h: 0, d: 0.45, s: 0.00, r: 0.25, p: 0, q: 0, k: -0.9 },
        { g: 1, w: "sine", v: 1.6, t: 7, f: 0, a: 0.001, h: 0, d: 0.09, s: 0.00, r: 0.08, p: 0, q: 0, k: -1.0 }
      ]
    },
    {
      id: "GM-10-music-box",
      gmNumber: 10,
      name: "GM 10 — Music Box (TinySynth q:1)",
      category: "mallet",
      roles: ["lead"],
      voiceGain: 0.23,
      releaseTailSeconds: 0.35,
      operators: [
        { g: 0, w: "sine", v: 0.48, t: 2, f: 0, a: 0.001, h: 0, d: 0.55, s: 0.00, r: 0.30, p: 0, q: 0, k: -1.1 },
        { g: 1, w: "sine", v: 2.4, t: 8.5, f: 0, a: 0.001, h: 0, d: 0.045, s: 0.00, r: 0.05, p: 0, q: 0, k: -1.2 }
      ]
    },
    {
      id: "GM-11-vibraphone",
      gmNumber: 11,
      name: "GM 11 — Vibraphone (TinySynth q:1)",
      category: "mallet",
      roles: ["lead", "chords"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.35,
      operators: [
        { g: 0, w: "sine", v: 0.46, t: 1, f: 0, a: 0.003, h: 0, d: 0.85, s: 0.04, r: 0.30, p: 0, q: 0, k: -0.8 },
        { g: 1, w: "sine", v: 1.8, t: 3.98, f: 0, a: 0.001, h: 0, d: 0.12, s: 0.00, r: 0.10, p: 0, q: 0, k: -0.9 },
        { g: 0, w: "sine", v: 0.18, t: 2, f: 0, a: 0.003, h: 0, d: 0.60, s: 0.02, r: 0.25, p: 0, q: 0, k: -0.8 }
      ]
    },
    {
      id: "GM-12-marimba",
      gmNumber: 12,
      name: "GM 12 — Marimba (TinySynth q:1)",
      category: "mallet",
      roles: ["lead", "chords"],
      voiceGain: 0.24,
      releaseTailSeconds: 0.28,
      operators: [
        { g: 0, w: "sine", v: 0.52, t: 1, f: 0, a: 0.002, h: 0, d: 0.32, s: 0.00, r: 0.18, p: 0, q: 0, k: -1.1 },
        { g: 1, w: "triangle", v: 2.2, t: 4, f: 0, a: 0.001, h: 0, d: 0.035, s: 0.00, r: 0.04, p: 0, q: 0, k: -1.3 },
        { g: 0, w: "sine", v: 0.22, t: 3.92, f: 0, a: 0.002, h: 0, d: 0.08, s: 0.00, r: 0.06, p: 0, q: 0, k: -1.2 }
      ]
    },
    {
      id: "GM-13-xylophone",
      gmNumber: 13,
      name: "GM 13 — Xylophone (TinySynth q:1)",
      category: "mallet",
      roles: ["lead"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.22,
      operators: [
        { g: 0, w: "sine", v: 0.44, t: 2, f: 0, a: 0.001, h: 0, d: 0.18, s: 0.00, r: 0.12, p: 0, q: 0, k: -1.4 },
        { g: 1, w: "sawtooth", v: 2.5, t: 3, f: 0, a: 0.001, h: 0, d: 0.025, s: 0.00, r: 0.03, p: 0, q: 0, k: -1.4 }
      ]
    },
    {
      id: "GM-15-dulcimer",
      gmNumber: 15,
      name: "GM 15 — Dulcimer (TinySynth q:1)",
      category: "plucked",
      roles: ["lead", "chords"],
      voiceGain: 0.21,
      releaseTailSeconds: 0.25,
      operators: [
        { g: 0, w: "sine", v: 0.42, t: 1, f: 0, a: 0.002, h: 0, d: 0.45, s: 0.02, r: 0.15, p: 0, q: 0, k: -1.0 },
        { g: 1, w: "sawtooth", v: 1.8, t: 2, f: 0, a: 0.001, h: 0, d: 0.12, s: 0.00, r: 0.08, p: 0, q: 0, k: -1.1 },
        { g: 0, w: "triangle", v: 0.25, t: 3, f: 0, a: 0.002, h: 0, d: 0.20, s: 0.00, r: 0.10, p: 0, q: 0, k: -1.0 }
      ]
    },
    {
      id: "GM-24-nylon-guitar",
      gmNumber: 24,
      name: "GM 24 — Acoustic Guitar / Nylon (TinySynth q:1)",
      category: "plucked",
      roles: ["lead", "chords"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.26,
      operators: [
        { g: 0, w: "triangle", v: 0.46, t: 1, f: 0, a: 0.004, h: 0, d: 0.45, s: 0.05, r: 0.14, p: 0, q: 0, k: -0.9 },
        { g: 1, w: "sine", v: 1.5, t: 2, f: 0, a: 0.001, h: 0, d: 0.06, s: 0.00, r: 0.06, p: 0, q: 0, k: -1.1 }
      ]
    },
    {
      id: "GM-25-steel-guitar",
      gmNumber: 25,
      name: "GM 25 — Acoustic Guitar / Steel (TinySynth q:1)",
      category: "plucked",
      roles: ["lead", "chords"],
      voiceGain: 0.20,
      releaseTailSeconds: 0.26,
      operators: [
        { g: 0, w: "sine", v: 0.40, t: 1, f: 0, a: 0.003, h: 0, d: 0.50, s: 0.06, r: 0.15, p: 0, q: 0, k: -0.85 },
        { g: 1, w: "sawtooth", v: 2.2, t: 1, f: 0, a: 0.001, h: 0, d: 0.14, s: 0.01, r: 0.08, p: 0, q: 0, k: -1.0 },
        { g: 0, w: "triangle", v: 0.22, t: 2, f: 0, a: 0.003, h: 0, d: 0.25, s: 0.02, r: 0.10, p: 0, q: 0, k: -0.9 }
      ]
    },
    {
      id: "GM-32-acoustic-bass",
      gmNumber: 32,
      name: "GM 32 — Acoustic Bass (TinySynth q:1)",
      category: "bass",
      roles: ["bass"],
      voiceGain: 0.26,
      releaseTailSeconds: 0.24,
      operators: [
        { g: 0, w: "sine", v: 0.65, t: 1, f: 0, a: 0.008, h: 0, d: 0.42, s: 0.15, r: 0.12, p: 0, q: 0, k: -0.5 },
        { g: 1, w: "triangle", v: 1.2, t: 1, f: 0, a: 0.004, h: 0, d: 0.18, s: 0.02, r: 0.08, p: 0, q: 0, k: -0.6 },
        { g: 0, w: "sine", v: 0.28, t: 2, f: 0, a: 0.006, h: 0, d: 0.28, s: 0.05, r: 0.10, p: 0, q: 0, k: -0.5 }
      ]
    },
    {
      id: "GM-33-finger-bass",
      gmNumber: 33,
      name: "GM 33 — Electric Bass / Finger (TinySynth q:1)",
      category: "bass",
      roles: ["bass"],
      voiceGain: 0.25,
      releaseTailSeconds: 0.22,
      operators: [
        { g: 0, w: "triangle", v: 0.60, t: 1, f: 0, a: 0.005, h: 0, d: 0.38, s: 0.18, r: 0.10, p: 0, q: 0, k: -0.5 },
        { g: 1, w: "sine", v: 1.8, t: 2, f: 0, a: 0.002, h: 0, d: 0.08, s: 0.00, r: 0.06, p: 0, q: 0, k: -0.7 },
        { g: 0, w: "sine", v: 0.35, t: 1, f: 0, a: 0.006, h: 0, d: 0.45, s: 0.20, r: 0.12, p: 0, q: 0, k: -0.5 }
      ]
    },
    {
      id: "GM-45-pizzicato",
      gmNumber: 45,
      name: "GM 45 — Pizzicato Strings (TinySynth q:1)",
      category: "plucked",
      roles: ["chords", "bass", "lead"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.20,
      operators: [
        { g: 0, w: "sawtooth", v: 0.38, t: 1, f: 0, a: 0.002, h: 0, d: 0.14, s: 0.00, r: 0.10, p: 0, q: 0, k: -1.2 },
        { g: 1, w: "triangle", v: 1.6, t: 2, f: 0, a: 0.001, h: 0, d: 0.05, s: 0.00, r: 0.05, p: 0, q: 0, k: -1.3 },
        { g: 0, w: "sine", v: 0.30, t: 1, f: 0, a: 0.003, h: 0, d: 0.20, s: 0.00, r: 0.12, p: 0, q: 0, k: -1.0 }
      ]
    },
    {
      id: "GM-46-harp",
      gmNumber: 46,
      name: "GM 46 — Orchestral Harp (TinySynth q:1)",
      category: "plucked",
      roles: ["chords", "lead"],
      voiceGain: 0.21,
      releaseTailSeconds: 0.35,
      operators: [
        { g: 0, w: "sine", v: 0.45, t: 1, f: 0, a: 0.003, h: 0, d: 0.65, s: 0.05, r: 0.25, p: 0, q: 0, k: -0.85 },
        { g: 1, w: "triangle", v: 1.4, t: 2, f: 0, a: 0.001, h: 0, d: 0.18, s: 0.00, r: 0.10, p: 0, q: 0, k: -1.0 },
        { g: 0, w: "sine", v: 0.20, t: 3, f: 0, a: 0.003, h: 0, d: 0.30, s: 0.00, r: 0.15, p: 0, q: 0, k: -0.9 }
      ]
    },
    {
      id: "GM-73-flute",
      gmNumber: 73,
      name: "GM 73 — Flute (TinySynth q:1)",
      category: "wind",
      roles: ["lead"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.25,
      operators: [
        { g: 0, w: "sine", v: 0.48, t: 1, f: 0, a: 0.022, h: 0.05, d: 0.20, s: 0.70, r: 0.14, p: 0, q: 0, k: -0.4 },
        { g: 1, w: "triangle", v: 0.5, t: 2, f: 0, a: 0.015, h: 0, d: 0.15, s: 0.25, r: 0.10, p: 0, q: 0, k: -0.5 },
        { g: 0, w: "sine", v: 0.12, t: 3, f: 0, a: 0.025, h: 0, d: 0.10, s: 0.15, r: 0.12, p: 0, q: 0, k: -0.5 }
      ]
    },
    {
      id: "GM-75-pan-flute",
      gmNumber: 75,
      name: "GM 75 — Pan Flute (TinySynth q:1)",
      category: "wind",
      roles: ["lead"],
      voiceGain: 0.21,
      releaseTailSeconds: 0.26,
      operators: [
        { g: 0, w: "sine", v: 0.46, t: 1, f: 0, a: 0.016, h: 0.04, d: 0.22, s: 0.65, r: 0.15, p: 0, q: 0, k: -0.4 },
        { g: 1, w: "sine", v: 1.1, t: 3, f: 0, a: 0.005, h: 0, d: 0.06, s: 0.05, r: 0.08, p: 0, q: 0, k: -0.6 }
      ]
    },
    {
      id: "GM-79-ocarina",
      gmNumber: 79,
      name: "GM 79 — Ocarina (TinySynth q:1)",
      category: "wind",
      roles: ["lead"],
      voiceGain: 0.22,
      releaseTailSeconds: 0.25,
      operators: [
        { g: 0, w: "sine", v: 0.50, t: 1, f: 0, a: 0.018, h: 0.05, d: 0.18, s: 0.75, r: 0.12, p: 0, q: 0, k: -0.3 },
        { g: 1, w: "sine", v: 0.4, t: 3, f: 0, a: 0.012, h: 0, d: 0.10, s: 0.08, r: 0.08, p: 0, q: 0, k: -0.5 }
      ]
    },
    {
      id: "GM-107-koto",
      gmNumber: 107,
      name: "GM 107 — Koto (TinySynth q:1)",
      category: "plucked",
      roles: ["lead", "chords"],
      voiceGain: 0.20,
      releaseTailSeconds: 0.25,
      operators: [
        { g: 0, w: "triangle", v: 0.42, t: 1, f: 0, a: 0.002, h: 0, d: 0.35, s: 0.02, r: 0.12, p: 0, q: 0, k: -1.0 },
        { g: 1, w: "sawtooth", v: 2.0, t: 2, f: 0, a: 0.001, h: 0, d: 0.08, s: 0.00, r: 0.05, p: 0, q: 0, k: -1.1 },
        { g: 0, w: "sine", v: 0.22, t: 4, f: 0, a: 0.002, h: 0, d: 0.15, s: 0.00, r: 0.08, p: 0, q: 0, k: -1.0 }
      ]
    },
    {
      id: "GM-108-kalimba",
      gmNumber: 108,
      name: "GM 108 — Kalimba / Thumb Piano (TinySynth q:1)",
      category: "mallet",
      roles: ["lead", "chords"],
      voiceGain: 0.23,
      releaseTailSeconds: 0.32,
      operators: [
        { g: 0, w: "sine", v: 0.48, t: 1, f: 0, a: 0.002, h: 0, d: 0.42, s: 0.00, r: 0.22, p: 0, q: 0, k: -1.0 },
        { g: 1, w: "sine", v: 2.5, t: 5.2, f: 0, a: 0.001, h: 0, d: 0.038, s: 0.00, r: 0.04, p: 0, q: 0, k: -1.2 },
        { g: 0, w: "sine", v: 0.20, t: 3, f: 0, a: 0.002, h: 0, d: 0.10, s: 0.00, r: 0.08, p: 0, q: 0, k: -1.1 }
      ]
    }
  ];

  /* Build rapid lookup map for GM programs */
  const GM_PROGRAMS_BY_ID = Object.create(null);
  const GM_PROGRAMS_BY_NUMBER = Object.create(null);
  for (const prog of GM_PROGRAMS) {
    GM_PROGRAMS_BY_ID[prog.id] = prog;
    if (prog.gmNumber !== null && prog.gmNumber !== undefined) {
      GM_PROGRAMS_BY_NUMBER[prog.gmNumber] = prog;
    }
  }

  /* --------------------------------------------------------------------------
   * 2. Curated Ensemble Presets (3-Track Arrangements)
   *
   * Pairs leadProgramId, chordsProgramId, and bassProgramId.
   * Also retains lead, chords, and bass sub-objects for backwards compatibility
   * with legacy patch consumers.
   * -------------------------------------------------------------------------- */
  const ENSEMBLE_PRESETS = [
    {
      id: "P0-plan32-triangle",
      name: "P0 — Plan 32 Historical Bare Triangle (Control)",
      description: "Exact Plan 32 triangle wave parameters (attack 0.012 s, decay 0.075 s, sustain 0.22, release 0.09 s, tail 0.12 s, masterGain 0.70). Matches the 4.92 s historical reference.",
      isHistoricalPlan32: true,
      tailSeconds: 0.12,
      masterGain: 0.70,
      leadProgramId: "P0-plan32-triangle",
      chordsProgramId: "P0-plan32-triangle",
      bassProgramId: "P0-plan32-triangle",
      lead: GM_PROGRAMS_BY_ID["P0-plan32-triangle"],
      chords: GM_PROGRAMS_BY_ID["P0-plan32-triangle"],
      bass: GM_PROGRAMS_BY_ID["P0-plan32-triangle"]
    },
    {
      id: "TS-marimba-epiano",
      name: "TinySynth q:1 — Marimba Lead + Rhodes EP Chords + Acoustic Bass",
      description: "Concert marimba lead (wooden FM arch-cut), warm Rhodes Electric Piano chords, and resonant acoustic bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.30,
      masterGain: 0.72,
      leadProgramId: "GM-12-marimba",
      chordsProgramId: "GM-04-epiano1",
      bassProgramId: "GM-32-acoustic-bass",
      lead: GM_PROGRAMS_BY_ID["GM-12-marimba"],
      chords: GM_PROGRAMS_BY_ID["GM-04-epiano1"],
      bass: GM_PROGRAMS_BY_ID["GM-32-acoustic-bass"]
    },
    {
      id: "TS-musicbox-harp",
      name: "TinySynth q:1 — Music Box Lead + Orchestral Harp + Pizzicato Bass",
      description: "Delicate music box bell lead with gentle orchestral harp accompaniment and tight pizzicato bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.35,
      masterGain: 0.72,
      leadProgramId: "GM-10-music-box",
      chordsProgramId: "GM-46-harp",
      bassProgramId: "GM-45-pizzicato",
      lead: GM_PROGRAMS_BY_ID["GM-10-music-box"],
      chords: GM_PROGRAMS_BY_ID["GM-46-harp"],
      bass: GM_PROGRAMS_BY_ID["GM-45-pizzicato"]
    },
    {
      id: "TS-vibraphone-guitar",
      name: "TinySynth q:1 — Vibraphone Lead + Nylon Guitar + Finger Bass",
      description: "Warm metallic vibraphone lead paired with nylon acoustic guitar chords and rounded finger bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.35,
      masterGain: 0.72,
      leadProgramId: "GM-11-vibraphone",
      chordsProgramId: "GM-24-nylon-guitar",
      bassProgramId: "GM-33-finger-bass",
      lead: GM_PROGRAMS_BY_ID["GM-11-vibraphone"],
      chords: GM_PROGRAMS_BY_ID["GM-24-nylon-guitar"],
      bass: GM_PROGRAMS_BY_ID["GM-33-finger-bass"]
    },
    {
      id: "TS-celesta-rhodes",
      name: "TinySynth q:1 — Celesta Lead + DX EP Chords + Acoustic Bass",
      description: "Airy bell-like celesta lead backed by crystalline DX electric piano harmony and warm acoustic bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.30,
      masterGain: 0.72,
      leadProgramId: "GM-08-celesta",
      chordsProgramId: "GM-05-epiano2",
      bassProgramId: "GM-32-acoustic-bass",
      lead: GM_PROGRAMS_BY_ID["GM-08-celesta"],
      chords: GM_PROGRAMS_BY_ID["GM-05-epiano2"],
      bass: GM_PROGRAMS_BY_ID["GM-32-acoustic-bass"]
    },
    {
      id: "TS-kalimba-guitar",
      name: "TinySynth q:1 — Kalimba Lead + Steel Guitar + Acoustic Bass",
      description: "Inharmonic thumb-piano kalimba lead with bright steel acoustic guitar accompaniment and acoustic bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.30,
      masterGain: 0.72,
      leadProgramId: "GM-108-kalimba",
      chordsProgramId: "GM-25-steel-guitar",
      bassProgramId: "GM-32-acoustic-bass",
      lead: GM_PROGRAMS_BY_ID["GM-108-kalimba"],
      chords: GM_PROGRAMS_BY_ID["GM-25-steel-guitar"],
      bass: GM_PROGRAMS_BY_ID["GM-32-acoustic-bass"]
    },
    {
      id: "TS-flute-harp",
      name: "TinySynth q:1 — Flute Lead + Harp Chords + Acoustic Bass",
      description: "Pastoral, breathy flute melody over gentle harp arpeggio chords and grounded acoustic bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.30,
      masterGain: 0.72,
      leadProgramId: "GM-73-flute",
      chordsProgramId: "GM-46-harp",
      bassProgramId: "GM-32-acoustic-bass",
      lead: GM_PROGRAMS_BY_ID["GM-73-flute"],
      chords: GM_PROGRAMS_BY_ID["GM-46-harp"],
      bass: GM_PROGRAMS_BY_ID["GM-32-acoustic-bass"]
    },
    {
      id: "TS-ocarina-epiano",
      name: "TinySynth q:1 — Ocarina Lead + Rhodes EP Chords + Finger Bass",
      description: "Sweet, hollow vessel-flute ocarina lead accompanied by warm Rhodes EP chords and finger-picked electric bass.",
      isHistoricalPlan32: false,
      tailSeconds: 0.30,
      masterGain: 0.72,
      leadProgramId: "GM-79-ocarina",
      chordsProgramId: "GM-04-epiano1",
      bassProgramId: "GM-33-finger-bass",
      lead: GM_PROGRAMS_BY_ID["GM-79-ocarina"],
      chords: GM_PROGRAMS_BY_ID["GM-04-epiano1"],
      bass: GM_PROGRAMS_BY_ID["GM-33-finger-bass"]
    }
  ];

  /* --------------------------------------------------------------------------
   * 3. Combined Patches Catalog
   *
   * Exposes both ensemble presets AND individual GM program entries so any ID
   * can be looked up uniformly via getPatch(id).
   * -------------------------------------------------------------------------- */
  const ALL_PATCHES = [...ENSEMBLE_PRESETS];
  const PATCHES_BY_ID = Object.create(null);

  for (const preset of ENSEMBLE_PRESETS) {
    PATCHES_BY_ID[preset.id] = preset;
  }

  // Also index individual GM programs as standalone single-timbre patches
  for (const gm of GM_PROGRAMS) {
    if (!PATCHES_BY_ID[gm.id]) {
      const standalonePatch = {
        id: gm.id,
        name: gm.name,
        description: `Individual GM instrument: ${gm.name}`,
        isHistoricalPlan32: gm.id === "P0-plan32-triangle",
        tailSeconds: gm.releaseTailSeconds || 0.25,
        masterGain: 0.72,
        leadProgramId: gm.id,
        chordsProgramId: gm.id,
        bassProgramId: gm.id,
        lead: gm,
        chords: gm,
        bass: gm
      };
      ALL_PATCHES.push(standalonePatch);
      PATCHES_BY_ID[gm.id] = standalonePatch;
    }
  }

  /* --------------------------------------------------------------------------
   * 4. Helper Accessors
   * -------------------------------------------------------------------------- */
  function getPatch(id) {
    if (!id) return ALL_PATCHES[0];
    return PATCHES_BY_ID[id] || GM_PROGRAMS_BY_ID[id] || ALL_PATCHES[0];
  }

  function getGmProgram(idOrGmNumber) {
    if (typeof idOrGmNumber === "number") {
      return GM_PROGRAMS_BY_NUMBER[idOrGmNumber] || null;
    }
    if (typeof idOrGmNumber === "string") {
      return GM_PROGRAMS_BY_ID[idOrGmNumber] || null;
    }
    return null;
  }

  const PATCHES_DATA = deepFreeze({
    schemaVersion: 3,
    artifact: "quackpot-plan39-synth-patch-authority",
    disclaimer: "Synthesized oscillator-and-operator patches for composition/reference evaluation; not sampled acoustic instruments.",
    gmPrograms: GM_PROGRAMS,
    gmProgramsById: GM_PROGRAMS_BY_ID,
    gmProgramsByNumber: GM_PROGRAMS_BY_NUMBER,
    ensemblePresets: ENSEMBLE_PRESETS,
    patches: ALL_PATCHES,
    patchesById: PATCHES_BY_ID,
    getPatch: getPatch,
    getGmProgram: getGmProgram
  });

  root.QUACKPOT_PLAN39_PATCHES = PATCHES_DATA;
  if (typeof module === "object" && module.exports) {
    module.exports = PATCHES_DATA;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
