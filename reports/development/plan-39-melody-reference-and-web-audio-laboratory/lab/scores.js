/* Editable, portable Plan 39 symbolic score & harmony authority. No runtime network fetches. */
(function initPlan39Scores(root) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze(value[key]);
    }
    return value;
  }

  // Exact Plan 32 Motif C ("Lucky Ripple") 10-event anchor (2 bars = 8 beats at 100 BPM)
  const MOTIF_C_EVENTS = [
    { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
    { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
    { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // D6
    { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // C#6
    { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
    { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
    { beat: 4.0, midi: 83, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // B5
    { beat: 5.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
    { beat: 5.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
    { beat: 6.0, midi: 74, durationBeats: 2.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }  // D5
  ];

  function shiftMonophonic(events, beatOffset) {
    return events.map((e) => ({
      beat: Number((e.beat + beatOffset).toFixed(4)),
      midi: e.midi,
      durationBeats: e.durationBeats,
      velocity: e.velocity
    }));
  }

  function shiftChords(chordEvents, beatOffset) {
    return chordEvents.map((c) => ({
      beat: Number((c.beat + beatOffset).toFixed(4)),
      midis: [...c.midis],
      durationBeats: c.durationBeats,
      velocity: c.velocity
    }));
  }

  /* --------------------------------------------------------------------------
   * Melodic Candidates (7 Total: C0 Control + M1–M6 Expansion Proposals)
   * -------------------------------------------------------------------------- */
  const CANDIDATES = [
    // Control: Untouched Historical 2-Bar Motif C Reference
    {
      id: "C0-original",
      group: "control",
      title: "C0 — Original Motif C ('Lucky Ripple' 2-Bar Control)",
      shortLabel: "C0 Original (4.92s)",
      parentAnchor: "plan32-motif-c",
      bars: 2,
      beatsPerBar: 4,
      defaultHarmonyId: "H0-dry",
      defaultPatchId: "P0-plan32-triangle",
      lockBareControl: true,
      intent: "Exact historical 2-bar Motif C reference (4.80 s phrase + 0.12 s release = 4.92 s). Preserved as the untouched A/B baseline and historical control; demonstrates the terminal consequent closure on beat 6.0 (D5).",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact C Anchor (Bars 1–2)", kind: "exact-anchor" }
      ],
      leadEvents: MOTIF_C_EVENTS.map((e) => ({ ...e }))
    },

    // Family A (Non-Terminal Anchor Modifications): M1
    {
      id: "M1-skyward-vista",
      group: "family-a-non-terminal",
      title: "M1 (A1) — Skyward Suspension & High Vista (Non-Terminal Bar 2)",
      shortLabel: "M1 Skyward Vista (9.9s)",
      parentAnchor: "plan32-motif-c-bar1",
      bars: 4,
      beatsPerBar: 4,
      defaultHarmonyId: "H-A1-skyward",
      defaultPatchId: "TS-marimba-epiano",
      lockBareControl: false,
      intent: "Family A non-terminal modification. Retains Bar 1's exact Lucky Ripple launch (F#5 -> A5 -> D6 -> C#6 -> A5 -> F#5), but turns Bar 2 upward (B5 -> C#6 -> D6 -> E6), suspending high E6 (2̂) over A7sus4 as an open antecedent question. Bars 3–4 provide a gentle descending answer.",
      sections: [
        { startBar: 1, endBar: 1, label: "Exact C Anchor Bar 1", kind: "exact-anchor" },
        { startBar: 2, endBar: 2, label: "Ascending Skyward Pivot to E6", kind: "pivot" },
        { startBar: 3, endBar: 4, label: "Floating Lydian/Major Descent", kind: "continuation" }
      ],
      leadEvents: [
        // Bar 1: Exact Lucky Ripple Anchor (isExactAnchor: true)
        { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.90, section: "exact-anchor", isExactAnchor: true }, // D6
        { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.88, section: "exact-anchor", isExactAnchor: true }, // C#6
        { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // F#5
        // Bar 2: Ascending Skyward Pivot to E6 (isExactAnchor: false)
        { beat: 4.0, midi: 83, durationBeats: 1.0, velocity: 0.88, section: "pivot", isExactAnchor: false },        // B5
        { beat: 5.0, midi: 85, durationBeats: 0.5, velocity: 0.88, section: "pivot", isExactAnchor: false },        // C#6
        { beat: 5.5, midi: 86, durationBeats: 0.5, velocity: 0.90, section: "pivot", isExactAnchor: false },        // D6
        { beat: 6.0, midi: 88, durationBeats: 2.0, velocity: 0.92, section: "pivot", isExactAnchor: false },        // E6 (Skyward suspension)
        // Bars 3–4: Floating Lydian/Major Descent (isExactAnchor: false)
        { beat: 8.0,  midi: 86, durationBeats: 0.5, velocity: 0.85, section: "continuation", isExactAnchor: false }, // D6
        { beat: 8.5,  midi: 85, durationBeats: 0.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // C#6
        { beat: 9.0,  midi: 83, durationBeats: 1.0, velocity: 0.82, section: "continuation", isExactAnchor: false }, // B5
        { beat: 10.0, midi: 81, durationBeats: 1.0, velocity: 0.80, section: "continuation", isExactAnchor: false }, // A5
        { beat: 11.0, midi: 79, durationBeats: 0.5, velocity: 0.78, section: "continuation", isExactAnchor: false }, // G5
        { beat: 11.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 12.0, midi: 76, durationBeats: 1.0, velocity: 0.78, section: "continuation", isExactAnchor: false }, // E5
        { beat: 13.0, midi: 79, durationBeats: 1.0, velocity: 0.80, section: "continuation", isExactAnchor: false }, // G5
        { beat: 14.0, midi: 78, durationBeats: 2.0, velocity: 0.82, section: "continuation", isExactAnchor: false }  // F#5 (Sweet 3rd cadence)
      ]
    },

    // Family A (Non-Terminal Anchor Modifications): M2
    {
      id: "M2-supertonic-question",
      group: "family-a-non-terminal",
      title: "M2 (A2) — Stepwise Supertonic Half-Cadence (Open Question)",
      shortLabel: "M2 Supertonic Question (9.9s)",
      parentAnchor: "plan32-motif-c-bar1",
      bars: 4,
      beatsPerBar: 4,
      defaultHarmonyId: "H-A2-supertonic",
      defaultPatchId: "TS-vibraphone-guitar",
      lockBareControl: false,
      intent: "Family A non-terminal modification. Retains Bar 1's exact Lucky Ripple launch, then turns Bar 2 into a smooth stepwise diatonic descent (B5 -> A5 -> G5 -> F#5 -> E5) resting on the supertonic E5 (2̂) over dominant A7. Bars 3–4 answer with a lower-register ripple contour.",
      sections: [
        { startBar: 1, endBar: 1, label: "Exact C Anchor Bar 1", kind: "exact-anchor" },
        { startBar: 2, endBar: 2, label: "Stepwise Descent to Open E5 (2̂)", kind: "pivot" },
        { startBar: 3, endBar: 4, label: "Lower-Register Ripple Answer", kind: "continuation" }
      ],
      leadEvents: [
        // Bar 1: Exact Lucky Ripple Anchor (isExactAnchor: true)
        { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.90, section: "exact-anchor", isExactAnchor: true }, // D6
        { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.88, section: "exact-anchor", isExactAnchor: true }, // C#6
        { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // F#5
        // Bar 2: Stepwise Descent to Open E5 (isExactAnchor: false)
        { beat: 4.0, midi: 83, durationBeats: 1.0, velocity: 0.86, section: "pivot", isExactAnchor: false },        // B5
        { beat: 5.0, midi: 81, durationBeats: 0.5, velocity: 0.84, section: "pivot", isExactAnchor: false },        // A5
        { beat: 5.5, midi: 79, durationBeats: 0.5, velocity: 0.82, section: "pivot", isExactAnchor: false },        // G5
        { beat: 6.0, midi: 78, durationBeats: 1.0, velocity: 0.80, section: "pivot", isExactAnchor: false },        // F#5
        { beat: 7.0, midi: 76, durationBeats: 1.0, velocity: 0.84, section: "pivot", isExactAnchor: false },        // E5 (Supertonic 2̂)
        // Bars 3–4: Lower-Register Ripple Answer (isExactAnchor: false)
        { beat: 8.0,  midi: 74, durationBeats: 0.5, velocity: 0.80, section: "continuation", isExactAnchor: false }, // D5
        { beat: 8.5,  midi: 78, durationBeats: 0.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 9.0,  midi: 83, durationBeats: 1.0, velocity: 0.86, section: "continuation", isExactAnchor: false }, // B5
        { beat: 10.0, midi: 81, durationBeats: 1.0, velocity: 0.84, section: "continuation", isExactAnchor: false }, // A5
        { beat: 11.0, midi: 78, durationBeats: 0.5, velocity: 0.80, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 11.5, midi: 74, durationBeats: 0.5, velocity: 0.78, section: "continuation", isExactAnchor: false }, // D5
        { beat: 12.0, midi: 76, durationBeats: 1.0, velocity: 0.80, section: "continuation", isExactAnchor: false }, // E5
        { beat: 13.0, midi: 78, durationBeats: 0.5, velocity: 0.80, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 13.5, midi: 79, durationBeats: 0.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // G5
        { beat: 14.0, midi: 78, durationBeats: 2.0, velocity: 0.84, section: "continuation", isExactAnchor: false }  // F#5
      ]
    },

    // Family B (Long-Timescale Melodic Arcs >= 3× Length): M3 (6 Bars / 3× Length)
    {
      id: "M3-horizon-drift",
      group: "family-b-long-arc",
      title: "M3 (B1) — The Grand Ripple & Horizon Drift (6 Bars / 3× Length)",
      shortLabel: "M3 Horizon Drift 3× (14.7s)",
      parentAnchor: "plan32-motif-c-bar1",
      bars: 6,
      beatsPerBar: 4,
      defaultHarmonyId: "H-B1-horizon",
      defaultPatchId: "TS-flute-harp",
      lockBareControl: false,
      intent: "Family B 6-bar continuous melodic arc (24 beats = 14.4 s phrase + 0.3 s tail = 14.7 s). The opening Lucky Ripple gesture acts as a launchpad; Bar 2 floats high without falling; Bars 3–4 surge to a high F#6 emotional climax; Bars 5–6 gently cascade into a broad cantabile resolution.",
      sections: [
        { startBar: 1, endBar: 2, label: "Opening Ripple & High Drift", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Register Surge to F#6 Climax", kind: "climax" },
        { startBar: 5, endBar: 6, label: "Cantabile Sequence & Cadence", kind: "cadence" }
      ],
      leadEvents: [
        // Bar 1: Exact Lucky Ripple Anchor (isExactAnchor: true)
        { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.92, section: "exact-anchor", isExactAnchor: true }, // D6
        { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.88, section: "exact-anchor", isExactAnchor: true }, // C#6
        { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // F#5
        // Bar 2: High floating wave line (isExactAnchor: false)
        { beat: 4.0,  midi: 83, durationBeats: 0.75, velocity: 0.88, section: "exact-anchor", isExactAnchor: false }, // B5
        { beat: 4.75, midi: 86, durationBeats: 0.25, velocity: 0.86, section: "exact-anchor", isExactAnchor: false }, // D6
        { beat: 5.0,  midi: 85, durationBeats: 1.0,  velocity: 0.88, section: "exact-anchor", isExactAnchor: false }, // C#6
        { beat: 6.0,  midi: 83, durationBeats: 1.0,  velocity: 0.84, section: "exact-anchor", isExactAnchor: false }, // B5
        { beat: 7.0,  midi: 81, durationBeats: 1.0,  velocity: 0.82, section: "exact-anchor", isExactAnchor: false }, // A5
        // Bars 3–4: Register Surge to F#6 Climax (isExactAnchor: false)
        { beat: 8.0,  midi: 78, durationBeats: 0.5, velocity: 0.82, section: "climax", isExactAnchor: false }, // F#5
        { beat: 8.5,  midi: 79, durationBeats: 0.5, velocity: 0.84, section: "climax", isExactAnchor: false }, // G5
        { beat: 9.0,  midi: 81, durationBeats: 1.0, velocity: 0.86, section: "climax", isExactAnchor: false }, // A5
        { beat: 10.0, midi: 86, durationBeats: 1.5, velocity: 0.90, section: "climax", isExactAnchor: false }, // D6
        { beat: 11.5, midi: 88, durationBeats: 0.5, velocity: 0.92, section: "climax", isExactAnchor: false }, // E6
        { beat: 12.0, midi: 90, durationBeats: 1.0, velocity: 0.95, section: "climax", isExactAnchor: false }, // F#6 (Climax Apex!)
        { beat: 13.0, midi: 88, durationBeats: 1.0, velocity: 0.90, section: "climax", isExactAnchor: false }, // E6
        { beat: 14.0, midi: 86, durationBeats: 1.0, velocity: 0.86, section: "climax", isExactAnchor: false }, // D6
        { beat: 15.0, midi: 83, durationBeats: 1.0, velocity: 0.84, section: "climax", isExactAnchor: false }, // B5
        // Bars 5–6: Cantabile Sequence & Cadence (isExactAnchor: false)
        { beat: 16.0, midi: 81, durationBeats: 1.0, velocity: 0.84, section: "cadence", isExactAnchor: false }, // A5
        { beat: 17.0, midi: 78, durationBeats: 0.5, velocity: 0.80, section: "cadence", isExactAnchor: false }, // F#5
        { beat: 17.5, midi: 76, durationBeats: 0.5, velocity: 0.78, section: "cadence", isExactAnchor: false }, // E5
        { beat: 18.0, midi: 74, durationBeats: 1.0, velocity: 0.80, section: "cadence", isExactAnchor: false }, // D5
        { beat: 19.0, midi: 76, durationBeats: 1.0, velocity: 0.82, section: "cadence", isExactAnchor: false }, // E5
        { beat: 20.0, midi: 78, durationBeats: 1.5, velocity: 0.84, section: "cadence", isExactAnchor: false }, // F#5
        { beat: 21.5, midi: 76, durationBeats: 0.5, velocity: 0.80, section: "cadence", isExactAnchor: false }, // E5
        { beat: 22.0, midi: 74, durationBeats: 2.0, velocity: 0.84, section: "cadence", isExactAnchor: false }  // D5 (Full phrase cadence)
      ]
    },

    // Family B (Long-Timescale Melodic Arcs >= 3× Length): M4 (8 Bars / 4× Length)
    {
      id: "M4-celestial-wanderer",
      group: "family-b-long-arc",
      title: "M4 (B2) — Kondo-Style Sequential Cantabile (8 Bars / 4× Length)",
      shortLabel: "M4 Celestial Wanderer 4× (19.5s)",
      parentAnchor: "plan32-motif-c-bar1",
      bars: 8,
      beatsPerBar: 4,
      defaultHarmonyId: "H-B2-wanderer",
      defaultPatchId: "TS-celesta-rhodes",
      lockBareControl: false,
      intent: "Family B 8-bar symphonic arc (32 beats = 19.2 s phrase + 0.3 s tail = 19.5 s) inspired by Koji Kondo, Yu-Peng Chen, and Lena Raine. Bar 1 states Motif C in D; Bar 2 immediately answers with a sequential variation in G; Bars 3–4 surge to a soaring F#6 climax; Bars 5–6 present a reflective Bm7->Gmaj7 bridge; Bars 7–8 provide a broad cadential resolution.",
      sections: [
        { startBar: 1, endBar: 1, label: "Motif C Ripple in D", kind: "exact-anchor" },
        { startBar: 2, endBar: 2, label: "Sequential Ripple in G/Em", kind: "sequence" },
        { startBar: 3, endBar: 4, label: "Lyrical Climb to F#6 Apex", kind: "climax" },
        { startBar: 5, endBar: 6, label: "Reflective Bridge (Bm7 → Gmaj7)", kind: "continuation" },
        { startBar: 7, endBar: 8, label: "Grand Cadential Resolution", kind: "cadence" }
      ],
      leadEvents: [
        // Bar 1: Exact Lucky Ripple Anchor (isExactAnchor: true)
        { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.85, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.92, section: "exact-anchor", isExactAnchor: true }, // D6
        { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.88, section: "exact-anchor", isExactAnchor: true }, // C#6
        { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.84, section: "exact-anchor", isExactAnchor: true }, // F#5
        // Bar 2: Sequential Ripple in G (isExactAnchor: false)
        { beat: 4.0, midi: 79, durationBeats: 0.5, velocity: 0.85, section: "sequence", isExactAnchor: false },     // G5
        { beat: 4.5, midi: 83, durationBeats: 0.5, velocity: 0.85, section: "sequence", isExactAnchor: false },     // B5
        { beat: 5.0, midi: 88, durationBeats: 1.0, velocity: 0.92, section: "sequence", isExactAnchor: false },     // E6
        { beat: 6.0, midi: 86, durationBeats: 1.0, velocity: 0.88, section: "sequence", isExactAnchor: false },     // D6
        { beat: 7.0, midi: 83, durationBeats: 0.5, velocity: 0.84, section: "sequence", isExactAnchor: false },     // B5
        { beat: 7.5, midi: 79, durationBeats: 0.5, velocity: 0.84, section: "sequence", isExactAnchor: false },     // G5
        // Bars 3–4: Lyrical Climb to F#6 Apex (isExactAnchor: false)
        { beat: 8.0,  midi: 81, durationBeats: 1.0, velocity: 0.86, section: "climax", isExactAnchor: false },     // A5
        { beat: 9.0,  midi: 86, durationBeats: 1.0, velocity: 0.90, section: "climax", isExactAnchor: false },     // D6
        { beat: 10.0, midi: 85, durationBeats: 0.5, velocity: 0.88, section: "climax", isExactAnchor: false },     // C#6
        { beat: 10.5, midi: 86, durationBeats: 0.5, velocity: 0.90, section: "climax", isExactAnchor: false },     // D6
        { beat: 11.0, midi: 88, durationBeats: 1.0, velocity: 0.92, section: "climax", isExactAnchor: false },     // E6
        { beat: 12.0, midi: 90, durationBeats: 1.5, velocity: 0.95, section: "climax", isExactAnchor: false },     // F#6 (Symphonic Apex!)
        { beat: 13.5, midi: 88, durationBeats: 0.5, velocity: 0.88, section: "climax", isExactAnchor: false },     // E6
        { beat: 14.0, midi: 86, durationBeats: 1.0, velocity: 0.86, section: "climax", isExactAnchor: false },     // D6
        { beat: 15.0, midi: 85, durationBeats: 1.0, velocity: 0.84, section: "climax", isExactAnchor: false },     // C#6
        // Bars 5–6: Reflective Bridge (isExactAnchor: false)
        { beat: 16.0, midi: 83, durationBeats: 1.0, velocity: 0.84, section: "continuation", isExactAnchor: false }, // B5
        { beat: 17.0, midi: 86, durationBeats: 1.0, velocity: 0.86, section: "continuation", isExactAnchor: false }, // D6
        { beat: 18.0, midi: 81, durationBeats: 1.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // A5
        { beat: 19.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 20.0, midi: 79, durationBeats: 1.0, velocity: 0.80, section: "continuation", isExactAnchor: false }, // G5
        { beat: 21.0, midi: 81, durationBeats: 0.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // A5
        { beat: 21.5, midi: 83, durationBeats: 0.5, velocity: 0.84, section: "continuation", isExactAnchor: false }, // B5
        { beat: 22.0, midi: 85, durationBeats: 1.0, velocity: 0.86, section: "continuation", isExactAnchor: false }, // C#6
        { beat: 23.0, midi: 86, durationBeats: 1.0, velocity: 0.88, section: "continuation", isExactAnchor: false }, // D6
        // Bars 7–8: Grand Cadential Resolution (isExactAnchor: false)
        { beat: 24.0, midi: 88, durationBeats: 1.0, velocity: 0.88, section: "cadence", isExactAnchor: false },     // E6
        { beat: 25.0, midi: 86, durationBeats: 0.5, velocity: 0.84, section: "cadence", isExactAnchor: false },     // D6
        { beat: 25.5, midi: 85, durationBeats: 0.5, velocity: 0.82, section: "cadence", isExactAnchor: false },     // C#6
        { beat: 26.0, midi: 83, durationBeats: 1.0, velocity: 0.80, section: "cadence", isExactAnchor: false },     // B5
        { beat: 27.0, midi: 81, durationBeats: 1.0, velocity: 0.78, section: "cadence", isExactAnchor: false },     // A5
        { beat: 28.0, midi: 79, durationBeats: 0.5, velocity: 0.78, section: "cadence", isExactAnchor: false },     // G5
        { beat: 28.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "cadence", isExactAnchor: false },     // F#5
        { beat: 29.0, midi: 76, durationBeats: 1.0, velocity: 0.80, section: "cadence", isExactAnchor: false },     // E5
        { beat: 30.0, midi: 74, durationBeats: 2.0, velocity: 0.84, section: "cadence", isExactAnchor: false }      // D5
      ]
    },

    // Family C (Unresolved Pivot Chords Balancing F#5 -> D5): M5
    {
      id: "M5-minor-iv-yearning",
      group: "family-c-unresolved-pivot",
      title: "M5 (C1) — Modal Mixture Gm6/Bb Pivot Under F#5 → D5",
      shortLabel: "M5 Minor-iv Pivot (9.9s)",
      parentAnchor: "plan32-motif-c",
      bars: 4,
      beatsPerBar: 4,
      defaultHarmonyId: "H-C1-minor-iv",
      defaultPatchId: "TS-musicbox-harp",
      lockBareControl: false,
      intent: "Family C harmonic pivot. Preserves all 10 notes of original Motif C in Bars 1–2 exactly, but strikes a bittersweet Gm6/Bb modal mixture chord under F#5 -> D5 (beats 5.5–8.0). D5 is heard not as a terminal tonic, but as the poignant 5th of minor iv. Bars 3–4 bloom out of the shadow into F#m7 -> Bm7.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact 10-Note Motif C Over Gm6/Bb Pivot", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Bittersweet Blossom Continuation", kind: "continuation" }
      ],
      leadEvents: [
        // Bars 1–2: Exact 10-Note Motif C (all isExactAnchor: true)
        { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // D6
        { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // C#6
        { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 4.0, midi: 83, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // B5
        { beat: 5.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 5.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5 (over Gm6 pivot)
        { beat: 6.0, midi: 74, durationBeats: 2.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // D5 (5th of minor iv Gm6!)
        // Bars 3–4: Bittersweet Blossom Continuation (isExactAnchor: false)
        { beat: 8.0,  midi: 73, durationBeats: 0.5, velocity: 0.76, section: "continuation", isExactAnchor: false }, // C#5
        { beat: 8.5,  midi: 74, durationBeats: 0.5, velocity: 0.78, section: "continuation", isExactAnchor: false }, // D5
        { beat: 9.0,  midi: 78, durationBeats: 1.0, velocity: 0.82, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 10.0, midi: 81, durationBeats: 1.0, velocity: 0.85, section: "continuation", isExactAnchor: false }, // A5
        { beat: 11.0, midi: 85, durationBeats: 1.0, velocity: 0.88, section: "continuation", isExactAnchor: false }, // C#6
        { beat: 12.0, midi: 83, durationBeats: 1.0, velocity: 0.86, section: "continuation", isExactAnchor: false }, // B5
        { beat: 13.0, midi: 81, durationBeats: 0.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // A5
        { beat: 13.5, midi: 79, durationBeats: 0.5, velocity: 0.80, section: "continuation", isExactAnchor: false }, // G5
        { beat: 14.0, midi: 78, durationBeats: 1.0, velocity: 0.80, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 15.0, midi: 76, durationBeats: 1.0, velocity: 0.82, section: "continuation", isExactAnchor: false }  // E5
      ]
    },

    // Family C (Unresolved Pivot Chords Balancing F#5 -> D5): M6
    {
      id: "M6-secondary-dominant-drive",
      group: "family-c-unresolved-pivot",
      title: "M6 (C2) — Secondary-Dominant E9 Pivot Under F#5 → D5",
      shortLabel: "M6 Secondary-Dom E9 (9.9s)",
      parentAnchor: "plan32-motif-c",
      bars: 4,
      beatsPerBar: 4,
      defaultHarmonyId: "H-C2-sec-dom",
      defaultPatchId: "TS-kalimba-guitar",
      lockBareControl: false,
      intent: "Family C harmonic pivot. Preserves all 10 notes of original Motif C in Bars 1–2 exactly, but strikes an E9 (V9/V) secondary dominant under F#5 -> D5 (beats 5.5–8.0). D5 is transformed into an active minor 7th over E9, creating forward propulsion that resolves to C#5 in Bar 3 over an A13sus pop-jazz groove.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact 10-Note Motif C Over E9 (V9/V) Pivot", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Dominant Drive & Warm Resolution", kind: "continuation" }
      ],
      leadEvents: [
        // Bars 1–2: Exact 10-Note Motif C (all isExactAnchor: true)
        { beat: 0.0, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 1.0, midi: 86, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // D6
        { beat: 2.0, midi: 85, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // C#6
        { beat: 3.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5
        { beat: 4.0, midi: 83, durationBeats: 1.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // B5
        { beat: 5.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // A5
        { beat: 5.5, midi: 78, durationBeats: 0.5, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // F#5 (9th of E9)
        { beat: 6.0, midi: 74, durationBeats: 2.0, velocity: 0.78, section: "exact-anchor", isExactAnchor: true }, // D5 (Active minor 7th of E9!)
        // Bars 3–4: Dominant Drive & Warm Resolution (isExactAnchor: false)
        { beat: 8.0,  midi: 73, durationBeats: 0.5, velocity: 0.80, section: "continuation", isExactAnchor: false }, // C#5 (Resolves the 7th)
        { beat: 8.5,  midi: 74, durationBeats: 0.5, velocity: 0.80, section: "continuation", isExactAnchor: false }, // D5
        { beat: 9.0,  midi: 76, durationBeats: 1.0, velocity: 0.82, section: "continuation", isExactAnchor: false }, // E5
        { beat: 10.0, midi: 79, durationBeats: 1.0, velocity: 0.85, section: "continuation", isExactAnchor: false }, // G5
        { beat: 11.0, midi: 83, durationBeats: 1.0, velocity: 0.88, section: "continuation", isExactAnchor: false }, // B5
        { beat: 12.0, midi: 81, durationBeats: 1.5, velocity: 0.88, section: "continuation", isExactAnchor: false }, // A5
        { beat: 13.5, midi: 78, durationBeats: 0.5, velocity: 0.82, section: "continuation", isExactAnchor: false }, // F#5
        { beat: 14.0, midi: 76, durationBeats: 1.0, velocity: 0.80, section: "continuation", isExactAnchor: false }, // E5
        { beat: 15.0, midi: 74, durationBeats: 1.0, velocity: 0.84, section: "continuation", isExactAnchor: false }  // D5
      ]
    }
  ];

  /* --------------------------------------------------------------------------
   * Harmonic Accompaniments Raw Definitions
   * -------------------------------------------------------------------------- */

  // H-A1
  const H_A1_BASS = [
    { beat: 0.0,  midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
    { beat: 2.0,  midi: 45, durationBeats: 2.0, velocity: 0.68 }, // A2
    { beat: 4.0,  midi: 43, durationBeats: 2.0, velocity: 0.72 }, // G2
    { beat: 6.0,  midi: 45, durationBeats: 2.0, velocity: 0.76 }, // A2 (dominant bass under E6 suspension!)
    { beat: 8.0,  midi: 42, durationBeats: 2.0, velocity: 0.70 }, // F#2
    { beat: 10.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 12.0, midi: 40, durationBeats: 2.0, velocity: 0.70 }, // E2
    { beat: 14.0, midi: 45, durationBeats: 2.0, velocity: 0.74 }  // A2
  ];
  const H_A1_CHORDS = [
    { beat: 0.0,  midis: [50, 57, 61, 66], durationBeats: 3.5, velocity: 0.58 }, // Dmaj7
    { beat: 4.0,  midis: [55, 59, 62, 66], durationBeats: 1.8, velocity: 0.58 }, // Gmaj7
    { beat: 6.0,  midis: [57, 62, 64, 67], durationBeats: 1.8, velocity: 0.64 }, // A7sus4
    { beat: 8.0,  midis: [54, 57, 61, 64], durationBeats: 1.8, velocity: 0.56 }, // F#m7
    { beat: 10.0, midis: [59, 62, 66, 69], durationBeats: 1.8, velocity: 0.58 }, // Bm7
    { beat: 12.0, midis: [52, 59, 62, 66], durationBeats: 1.8, velocity: 0.58 }, // Em9
    { beat: 14.0, midis: [57, 61, 64, 67], durationBeats: 1.8, velocity: 0.62 }  // A7
  ];
  const H_A1_COUNTER = [
    { beat: 6.0,  midi: 64, durationBeats: 1.0, velocity: 0.50 }, // E4
    { beat: 7.0,  midi: 67, durationBeats: 1.0, velocity: 0.52 }, // G4
    { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 15.0, midi: 73, durationBeats: 1.0, velocity: 0.52 }  // C#5
  ];

  // H-A2
  const H_A2_BASS = [
    { beat: 0.0,  midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
    { beat: 2.0,  midi: 45, durationBeats: 2.0, velocity: 0.68 }, // A2
    { beat: 4.0,  midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 6.0,  midi: 45, durationBeats: 2.0, velocity: 0.76 }, // A2 (dominant half-cadence)
    { beat: 8.0,  midi: 43, durationBeats: 2.0, velocity: 0.72 }, // G2
    { beat: 10.0, midi: 42, durationBeats: 2.0, velocity: 0.70 }, // F#2
    { beat: 12.0, midi: 40, durationBeats: 2.0, velocity: 0.70 }, // E2
    { beat: 14.0, midi: 38, durationBeats: 2.0, velocity: 0.76 }  // D2
  ];
  const H_A2_CHORDS = [
    { beat: 0.0,  midis: [50, 57, 62, 66], durationBeats: 3.5, velocity: 0.58 }, // D
    { beat: 4.0,  midis: [59, 62, 66],     durationBeats: 2.0, velocity: 0.56 }, // Bm
    { beat: 6.0,  midis: [57, 62, 64, 67], durationBeats: 1.0, velocity: 0.62 }, // Asus4
    { beat: 7.0,  midis: [57, 61, 64, 67], durationBeats: 1.0, velocity: 0.64 }, // A7
    { beat: 8.0,  midis: [55, 59, 62, 66], durationBeats: 2.0, velocity: 0.58 }, // Gmaj7
    { beat: 10.0, midis: [54, 57, 61, 64], durationBeats: 2.0, velocity: 0.56 }, // F#m7
    { beat: 12.0, midis: [52, 59, 62],     durationBeats: 2.0, velocity: 0.56 }, // Em
    { beat: 14.0, midis: [50, 57, 62, 66], durationBeats: 2.0, velocity: 0.62 }  // Dadd9
  ];
  const H_A2_COUNTER = [
    { beat: 6.5,  midi: 64, durationBeats: 0.5, velocity: 0.48 }, // E4
    { beat: 7.0,  midi: 67, durationBeats: 0.5, velocity: 0.50 }, // G4
    { beat: 7.5,  midi: 69, durationBeats: 0.5, velocity: 0.52 }, // A4
    { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 15.0, midi: 74, durationBeats: 1.0, velocity: 0.54 }  // D5
  ];

  // H-B1 (6 Bars / 24 Beats)
  const H_B1_BASS = [
    { beat: 0.0,  midi: 38, durationBeats: 4.0, velocity: 0.74 }, // D2
    { beat: 4.0,  midi: 43, durationBeats: 4.0, velocity: 0.72 }, // G2
    { beat: 8.0,  midi: 42, durationBeats: 2.0, velocity: 0.70 }, // F#2
    { beat: 10.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 12.0, midi: 43, durationBeats: 2.0, velocity: 0.74 }, // G2
    { beat: 14.0, midi: 45, durationBeats: 2.0, velocity: 0.76 }, // A2
    { beat: 16.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 18.0, midi: 40, durationBeats: 2.0, velocity: 0.74 }, // E2 (secondary dominant!)
    { beat: 20.0, midi: 40, durationBeats: 1.0, velocity: 0.70 }, // E2
    { beat: 21.0, midi: 45, durationBeats: 1.0, velocity: 0.74 }, // A2
    { beat: 22.0, midi: 38, durationBeats: 2.0, velocity: 0.78 }  // D2
  ];
  const H_B1_CHORDS = [
    { beat: 0.0,  midis: [50, 57, 61, 64, 66], durationBeats: 3.8, velocity: 0.56 }, // Dmaj9
    { beat: 4.0,  midis: [55, 59, 62, 66],     durationBeats: 3.8, velocity: 0.56 }, // Gmaj7
    { beat: 8.0,  midis: [54, 57, 61, 64],     durationBeats: 1.8, velocity: 0.54 }, // F#m7
    { beat: 10.0, midis: [59, 62, 66, 69],     durationBeats: 1.8, velocity: 0.56 }, // Bm7
    { beat: 12.0, midis: [55, 59, 62, 66],     durationBeats: 1.8, velocity: 0.58 }, // Gmaj9
    { beat: 14.0, midis: [57, 62, 64, 67],     durationBeats: 1.8, velocity: 0.62 }, // A7sus4
    { beat: 16.0, midis: [59, 62, 66],         durationBeats: 1.8, velocity: 0.56 }, // Bm7
    { beat: 18.0, midis: [52, 56, 59, 62],     durationBeats: 1.8, velocity: 0.60 }, // E7
    { beat: 20.0, midis: [52, 59, 62, 66],     durationBeats: 1.0, velocity: 0.56 }, // Em9
    { beat: 21.0, midis: [57, 61, 64, 67],     durationBeats: 1.0, velocity: 0.62 }, // A7
    { beat: 22.0, midis: [50, 57, 62, 66],     durationBeats: 2.0, velocity: 0.64 }  // Dadd9
  ];
  const H_B1_COUNTER = [
    { beat: 6.5,  midi: 69, durationBeats: 0.5, velocity: 0.48 }, // A4
    { beat: 7.0,  midi: 71, durationBeats: 0.5, velocity: 0.50 }, // B4
    { beat: 7.5,  midi: 73, durationBeats: 0.5, velocity: 0.52 }, // C#5
    { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 15.0, midi: 74, durationBeats: 1.0, velocity: 0.52 }, // D5
    { beat: 22.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 23.0, midi: 74, durationBeats: 1.0, velocity: 0.54 }  // D5
  ];

  // H-B2 (8 Bars / 32 Beats)
  const H_B2_BASS = [
    { beat: 0.0,  midi: 38, durationBeats: 4.0, velocity: 0.74 }, // D2
    { beat: 4.0,  midi: 43, durationBeats: 4.0, velocity: 0.72 }, // G2 (sequential partner)
    { beat: 8.0,  midi: 42, durationBeats: 2.0, velocity: 0.70 }, // F#2
    { beat: 10.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 12.0, midi: 43, durationBeats: 2.0, velocity: 0.74 }, // G2
    { beat: 14.0, midi: 45, durationBeats: 2.0, velocity: 0.76 }, // A2
    { beat: 16.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 18.0, midi: 45, durationBeats: 2.0, velocity: 0.70 }, // A2 (Bm7/A)
    { beat: 20.0, midi: 43, durationBeats: 2.0, velocity: 0.72 }, // G2
    { beat: 22.0, midi: 43, durationBeats: 2.0, velocity: 0.70 }, // G2 (A/G)
    { beat: 24.0, midi: 42, durationBeats: 2.0, velocity: 0.70 }, // F#2
    { beat: 26.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 28.0, midi: 40, durationBeats: 1.0, velocity: 0.70 }, // E2
    { beat: 29.0, midi: 45, durationBeats: 1.0, velocity: 0.74 }, // A2
    { beat: 30.0, midi: 38, durationBeats: 2.0, velocity: 0.78 }  // D2
  ];
  const H_B2_CHORDS = [
    { beat: 0.0,  midis: [50, 57, 61, 66], durationBeats: 3.8, velocity: 0.56 }, // Dmaj7
    { beat: 4.0,  midis: [55, 59, 62, 66], durationBeats: 3.8, velocity: 0.56 }, // Gmaj7
    { beat: 8.0,  midis: [54, 57, 61, 64], durationBeats: 1.8, velocity: 0.54 }, // F#m7
    { beat: 10.0, midis: [59, 62, 66, 69], durationBeats: 1.8, velocity: 0.56 }, // Bm7
    { beat: 12.0, midis: [55, 59, 62, 66], durationBeats: 1.8, velocity: 0.58 }, // Gmaj7
    { beat: 14.0, midis: [57, 61, 64, 67], durationBeats: 1.8, velocity: 0.62 }, // A7
    { beat: 16.0, midis: [59, 62, 66, 69], durationBeats: 1.8, velocity: 0.54 }, // Bm7
    { beat: 18.0, midis: [57, 61, 64, 66], durationBeats: 1.8, velocity: 0.54 }, // Bm7/A
    { beat: 20.0, midis: [55, 59, 62, 66], durationBeats: 1.8, velocity: 0.56 }, // Gmaj7
    { beat: 22.0, midis: [55, 57, 61, 64], durationBeats: 1.8, velocity: 0.56 }, // A/G
    { beat: 24.0, midis: [54, 57, 61, 64], durationBeats: 1.8, velocity: 0.54 }, // F#m7
    { beat: 26.0, midis: [59, 62, 66, 69], durationBeats: 1.8, velocity: 0.56 }, // Bm7
    { beat: 28.0, midis: [52, 59, 62, 67], durationBeats: 1.0, velocity: 0.56 }, // Em7
    { beat: 29.0, midis: [57, 61, 64, 67], durationBeats: 1.0, velocity: 0.62 }, // A7
    { beat: 30.0, midis: [50, 57, 62, 66], durationBeats: 2.0, velocity: 0.64 }  // D
  ];
  const H_B2_COUNTER = [
    { beat: 6.5,  midi: 69, durationBeats: 0.5, velocity: 0.48 }, // A4
    { beat: 7.0,  midi: 71, durationBeats: 0.5, velocity: 0.50 }, // B4
    { beat: 7.5,  midi: 73, durationBeats: 0.5, velocity: 0.52 }, // C#5
    { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 15.0, midi: 73, durationBeats: 1.0, velocity: 0.52 }, // C#5
    { beat: 22.5, midi: 71, durationBeats: 0.5, velocity: 0.48 }, // B4
    { beat: 23.0, midi: 69, durationBeats: 1.0, velocity: 0.50 }, // A4
    { beat: 30.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 31.0, midi: 73, durationBeats: 1.0, velocity: 0.52 }  // C#5
  ];

  // H-C1 (4 Bars / 16 Beats)
  const H_C1_BASS = [
    { beat: 0.0,  midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
    { beat: 2.0,  midi: 45, durationBeats: 2.0, velocity: 0.68 }, // A2
    { beat: 4.0,  midi: 43, durationBeats: 1.5, velocity: 0.72 }, // G2 (under B5 -> A5)
    { beat: 5.5,  midi: 46, durationBeats: 2.5, velocity: 0.76 }, // Bb2 (THE PIVOT BASS under F#5 -> D5!)
    { beat: 8.0,  midi: 42, durationBeats: 2.0, velocity: 0.70 }, // F#2
    { beat: 10.0, midi: 47, durationBeats: 2.0, velocity: 0.72 }, // B2
    { beat: 12.0, midi: 40, durationBeats: 2.0, velocity: 0.70 }, // E2
    { beat: 14.0, midi: 45, durationBeats: 2.0, velocity: 0.74 }  // A2
  ];
  const H_C1_CHORDS = [
    { beat: 0.0,  midis: [50, 57, 61, 66], durationBeats: 3.5, velocity: 0.58 }, // Dmaj7
    { beat: 4.0,  midis: [55, 59, 62, 66], durationBeats: 1.5, velocity: 0.58 }, // Gmaj7
    { beat: 5.5,  midis: [55, 58, 62, 64], durationBeats: 2.5, velocity: 0.64 }, // Gm6 (G3, Bb3, D4, E4)
    { beat: 8.0,  midis: [54, 57, 61, 64], durationBeats: 2.0, velocity: 0.56 }, // F#m7
    { beat: 10.0, midis: [59, 62, 66, 69], durationBeats: 2.0, velocity: 0.58 }, // Bm7
    { beat: 12.0, midis: [52, 59, 62, 66], durationBeats: 2.0, velocity: 0.58 }, // Em9
    { beat: 14.0, midis: [57, 61, 64, 67], durationBeats: 2.0, velocity: 0.62 }  // A7
  ];
  const H_C1_COUNTER = [
    { beat: 6.0,  midi: 64, durationBeats: 1.0, velocity: 0.52 }, // E4 (bittersweet 6th)
    { beat: 7.0,  midi: 58, durationBeats: 1.0, velocity: 0.50 }, // Bb3
    { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 15.0, midi: 73, durationBeats: 1.0, velocity: 0.52 }  // C#5
  ];

  // H-C2 (4 Bars / 16 Beats)
  const H_C2_BASS = [
    { beat: 0.0,  midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
    { beat: 2.0,  midi: 45, durationBeats: 2.0, velocity: 0.68 }, // A2
    { beat: 4.0,  midi: 43, durationBeats: 1.5, velocity: 0.72 }, // G2 (under B5 -> A5)
    { beat: 5.5,  midi: 40, durationBeats: 2.5, velocity: 0.78 }, // E2 (THE PIVOT BASS under F#5 -> D5!)
    { beat: 8.0,  midi: 45, durationBeats: 2.0, velocity: 0.76 }, // A2
    { beat: 10.0, midi: 45, durationBeats: 2.0, velocity: 0.74 }, // A2
    { beat: 12.0, midi: 42, durationBeats: 2.0, velocity: 0.72 }, // F#2
    { beat: 14.0, midi: 47, durationBeats: 2.0, velocity: 0.74 }  // B2
  ];
  const H_C2_CHORDS = [
    { beat: 0.0,  midis: [50, 57, 61, 64, 66], durationBeats: 3.5, velocity: 0.58 }, // Dmaj9
    { beat: 4.0,  midis: [55, 59, 62, 66],     durationBeats: 1.5, velocity: 0.58 }, // Gmaj7
    { beat: 5.5,  midis: [52, 56, 59, 62, 66], durationBeats: 2.5, velocity: 0.65 }, // E9 (E3, G#3, B3, D4, F#4)
    { beat: 8.0,  midis: [57, 62, 64, 66],     durationBeats: 2.0, velocity: 0.62 }, // A13sus4
    { beat: 10.0, midis: [57, 61, 64, 67],     durationBeats: 2.0, velocity: 0.64 }, // A7
    { beat: 12.0, midis: [54, 57, 61, 64],     durationBeats: 2.0, velocity: 0.58 }, // F#m7
    { beat: 14.0, midis: [59, 62, 66, 69],     durationBeats: 2.0, velocity: 0.60 }  // Bm7
  ];
  const H_C2_COUNTER = [
    { beat: 6.0,  midi: 56, durationBeats: 1.0, velocity: 0.52 }, // G#3 (secondary dominant 3rd)
    { beat: 7.0,  midi: 59, durationBeats: 1.0, velocity: 0.52 }, // B3
    { beat: 8.0,  midi: 61, durationBeats: 1.0, velocity: 0.54 }, // C#4 (resolution of the 7th!)
    { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.50 }, // A4
    { beat: 15.0, midi: 74, durationBeats: 1.0, velocity: 0.54 }  // D5
  ];

  /* --------------------------------------------------------------------------
   * Harmonic Accompaniments (7 Total: H0 Dry Control + H-A1, H-A2, H-B1, H-B2, H-C1, H-C2)
   * -------------------------------------------------------------------------- */
  const HARMONIES = [
    // Control: Dry Unaccompanied
    {
      id: "H0-dry",
      name: "H0 — Dry (Unaccompanied Lead Control)",
      description: "Zero chord or bass accompaniment. Used for exact historical Motif C control audition.",
      spanBeats: 8,
      bass: [],
      chords: [],
      counter: [],
      bass4: [],
      chords4: [],
      counter4: [],
      bass8: [],
      chords8: [],
      counter8: []
    },

    // H-A1: Skyward Suspension (4 Bars / 16 Beats)
    {
      id: "H-A1-skyward",
      name: "H-A1 — Skyward Suspension Harmony (Dmaj7 → Gmaj7 → A7sus4)",
      description: "Supports M1's soaring ascent to high E6. Bar 1 opens in Dmaj7; Bar 2 shifts from Gmaj7 to A7sus4 at beat 6.0, framing E6 as the dominant 5th; Bars 3–4 provide descending F#m7 -> Bm7 -> Em9 -> A7 support.",
      spanBeats: 16,
      bass: H_A1_BASS,
      chords: H_A1_CHORDS,
      counter: H_A1_COUNTER,
      bass4: H_A1_BASS,
      chords4: H_A1_CHORDS,
      counter4: H_A1_COUNTER,
      bass8: [...H_A1_BASS, ...shiftMonophonic(H_A1_BASS, 16.0)],
      chords8: [...H_A1_CHORDS, ...shiftChords(H_A1_CHORDS, 16.0)],
      counter8: [...H_A1_COUNTER, ...shiftMonophonic(H_A1_COUNTER, 16.0)]
    },

    // H-A2: Stepwise Supertonic Half-Cadence (4 Bars / 16 Beats)
    {
      id: "H-A2-supertonic",
      name: "H-A2 — Stepwise Half-Cadence Harmony (Bm7 → Asus4 → Gmaj7)",
      description: "Frames M2's stepwise descent to supertonic E5. Bar 2 moves Bm7 -> Asus4 -> A7, letting E5 ring as an open half-cadence dominant question; Bars 3–4 provide gentle Gmaj7 -> F#m7 -> Em7 -> Dadd9 resolution.",
      spanBeats: 16,
      bass: H_A2_BASS,
      chords: H_A2_CHORDS,
      counter: H_A2_COUNTER,
      bass4: H_A2_BASS,
      chords4: H_A2_CHORDS,
      counter4: H_A2_COUNTER,
      bass8: [...H_A2_BASS, ...shiftMonophonic(H_A2_BASS, 16.0)],
      chords8: [...H_A2_CHORDS, ...shiftChords(H_A2_CHORDS, 16.0)],
      counter8: [...H_A2_COUNTER, ...shiftMonophonic(H_A2_COUNTER, 16.0)]
    },

    // H-B1: Horizon Drift (6 Bars / 24 Beats)
    {
      id: "H-B1-horizon",
      name: "H-B1 — Horizon Drift 6-Bar Arc Harmony (Dmaj9 → Gmaj7 → Bm7 → E7)",
      description: "Full 6-bar harmonic progression supporting M3's long arch. Bar 1 Dmaj9; Bar 2 Gmaj7; Bar 3 F#m7 -> Bm7; Bar 4 Gmaj9 -> A7sus4 under the F#6 climax; Bar 5 Bm7 -> E7 secondary dominant lift; Bar 6 Em9 -> A7 -> Dadd9.",
      spanBeats: 24,
      bass: H_B1_BASS,
      chords: H_B1_CHORDS,
      counter: H_B1_COUNTER,
      bass4: H_B1_BASS.filter((e) => e.beat < 16.0),
      chords4: H_B1_CHORDS.filter((c) => c.beat < 16.0),
      counter4: H_B1_COUNTER.filter((e) => e.beat < 16.0),
      bass8: H_B1_BASS,
      chords8: H_B1_CHORDS,
      counter8: H_B1_COUNTER
    },

    // H-B2: Celestial Wanderer (8 Bars / 32 Beats)
    {
      id: "H-B2-wanderer",
      name: "H-B2 — Celestial Wanderer 8-Bar Symphonic Harmony",
      description: "Expansive 8-bar double-period accompaniment for M4. Features sequential Gmaj7 support in Bar 2, soaring Gmaj7 -> A7 climb under the F#6 climax in Bars 3–4, contemplative Bm7 -> Bm7/A bridge in Bars 5–6, and cadential Em7 -> A7 -> D turnaround in Bars 7–8.",
      spanBeats: 32,
      bass: H_B2_BASS,
      chords: H_B2_CHORDS,
      counter: H_B2_COUNTER,
      bass4: H_B2_BASS.filter((e) => e.beat < 16.0),
      chords4: H_B2_CHORDS.filter((c) => c.beat < 16.0),
      counter4: H_B2_COUNTER.filter((e) => e.beat < 16.0),
      bass8: H_B2_BASS,
      chords8: H_B2_CHORDS,
      counter8: H_B2_COUNTER
    },

    // H-C1: Bittersweet Modal Mixture Minor-iv (Gm6/Bb) Pivot (4 Bars / 16 Beats)
    {
      id: "H-C1-minor-iv",
      name: "H-C1 — Bittersweet Modal Mixture (Gm6/Bb) Pivot Harmony",
      description: "The core Family C modal mixture pivot. Under exact Motif C's F#5 -> D5 (beats 5.5–8.0), the bass drops to Bb2 and strikes a lush Gm6 (G-Bb-D-E), dissolving tonic stability into poignant Ghibli-esque yearning. Bars 3–4 blossom into F#m7 -> Bm7 -> Em9 -> A7.",
      spanBeats: 16,
      bass: H_C1_BASS,
      chords: H_C1_CHORDS,
      counter: H_C1_COUNTER,
      bass4: H_C1_BASS,
      chords4: H_C1_CHORDS,
      counter4: H_C1_COUNTER,
      bass8: [...H_C1_BASS, ...shiftMonophonic(H_C1_BASS, 16.0)],
      chords8: [...H_C1_CHORDS, ...shiftChords(H_C1_CHORDS, 16.0)],
      counter8: [...H_C1_COUNTER, ...shiftMonophonic(H_C1_COUNTER, 16.0)]
    },

    // H-C2: Secondary-Dominant E9 Drive Pivot (4 Bars / 16 Beats)
    {
      id: "H-C2-sec-dom",
      name: "H-C2 — Secondary-Dominant E9 Drive Pivot Harmony",
      description: "The dynamic Family C secondary dominant pivot. Under exact Motif C's F#5 -> D5 (beats 5.5–8.0), strikes an E9 (E-G#-B-D-F#) with bass on E2, converting D5 into an active dominant 7th. Bars 3–4 resolve forward into an energetic A13sus4 -> A7 -> F#m7 -> Bm7 jazz/pop progression.",
      spanBeats: 16,
      bass: H_C2_BASS,
      chords: H_C2_CHORDS,
      counter: H_C2_COUNTER,
      bass4: H_C2_BASS,
      chords4: H_C2_CHORDS,
      counter4: H_C2_COUNTER,
      bass8: [...H_C2_BASS, ...shiftMonophonic(H_C2_BASS, 16.0)],
      chords8: [...H_C2_CHORDS, ...shiftChords(H_C2_CHORDS, 16.0)],
      counter8: [...H_C2_COUNTER, ...shiftMonophonic(H_C2_COUNTER, 16.0)]
    }
  ];

  const SCORES_DATA = deepFreeze({
    schemaVersion: 1,
    artifact: "quackpot-plan39-symbolic-score-authority",
    tonic: "D",
    tonicMidi: 62,
    defaultTempoBpm: 100,
    supportedTemposBpm: [92, 96, 100, 104, 108],
    beatsPerBar: 4,
    sampleRate: 48000,
    maxDurationSeconds: 60,
    provenance: {
      motifCSourceFile: "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/motifs.js",
      motifCSourceSha256: "3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02",
      motifCWavFile: "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/history/attempt-02/plan32-motif-c.wav",
      motifCWavSha256: "b76e9a2f0d357ba4c7c9fc313e54c4e0e621c2774c20bdae5295441d21de4bf6"
    },
    motifCAnchorEvents: MOTIF_C_EVENTS,
    candidates: CANDIDATES,
    harmonies: HARMONIES
  });

  root.QUACKPOT_PLAN39_SCORES = SCORES_DATA;
  if (typeof module === "object" && module.exports) {
    module.exports = SCORES_DATA;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
