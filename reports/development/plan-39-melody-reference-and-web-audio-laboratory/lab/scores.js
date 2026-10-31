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

  function shiftEvents(events, beatOffset, sectionOverride, isExactAnchorOverride) {
    return events.map((event) => ({
      beat: Number((event.beat + beatOffset).toFixed(4)),
      midi: event.midi,
      durationBeats: event.durationBeats,
      velocity: event.velocity,
      section: sectionOverride || event.section,
      isExactAnchor: typeof isExactAnchorOverride === "boolean" ? isExactAnchorOverride : Boolean(event.isExactAnchor)
    }));
  }

  const CANDIDATES = [
    {
      id: "C0-original",
      group: "control",
      title: "Original C — Lucky Ripple (1× Control)",
      shortLabel: "C0 Original (4.92s)",
      parentAnchor: "plan32-motif-c",
      bars: 2,
      beatsPerBar: 4,
      defaultHarmonyId: "H0-dry",
      defaultPatchId: "P0-plan32-triangle",
      lockBareControl: true,
      intent: "Exact historical 2-bar Motif C reference (4.80 s phrase + 0.12 s release = 4.92 s). Preserved as the untouched A/B baseline and historical control; rejected by Suno only because 4.92 s < 6.00 s.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact C Anchor (Bars 1–2)", kind: "exact-anchor" }
      ],
      leadEvents: MOTIF_C_EVENTS.map((e) => ({ ...e }))
    },
    {
      id: "C0-repeat2x",
      group: "control",
      title: "Repeated C Control — 2× Exact Musical Repeat",
      shortLabel: "C0 Repeat 2× (9.72s)",
      parentAnchor: "plan32-motif-c",
      bars: 4,
      beatsPerBar: 4,
      defaultHarmonyId: "H0-dry",
      defaultPatchId: "P0-plan32-triangle",
      lockBareControl: false,
      intent: "Two exact back-to-back musical statements of Motif C at 100 BPM (9.60 s phrase + 0.12 s release = 9.72 s). Note 9 of Statement 1 (beat 6.0, duration 2.0) meets Bar 3 Beat 8.0 seamlessly with zero silence padding or tempo distortion, clearing Suno's 6.0 s minimum upload gate.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact C Anchor 1 (Bars 1–2)", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Exact C Anchor 2 (Bars 3–4)", kind: "exact-anchor-repeat" }
      ],
      leadEvents: [
        ...MOTIF_C_EVENTS.map((e) => ({ ...e })),
        ...shiftEvents(MOTIF_C_EVENTS, 8.0, "exact-anchor-repeat", true)
      ]
    },
    {
      id: "C1-period-lock",
      group: "c-continuation",
      title: "C1 — Ripple & Courtyard Period (Antecedent / Consequent)",
      shortLabel: "C1 Period Lock (19.32s)",
      parentAnchor: "plan32-motif-c",
      bars: 8,
      beatsPerBar: 4,
      defaultHarmonyId: "H1-bright-resolved",
      defaultPatchId: "P1-pluck-bell",
      lockBareControl: false,
      intent: "Classical 8-bar parallel period (A - B_open - A - B_closed). Bars 1–2 state exact Motif C; Bars 3–4 answer with a rhythmically matched lift that pauses on an open half-cadence on dominant A5 (MIDI 81); Bars 5–6 return exact Motif C; Bars 7–8 resolve home to D5.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact C Anchor (Bars 1–2)", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Open Half-Cadence Answer on A5 (Bars 3–4)", kind: "continuation" },
        { startBar: 5, endBar: 6, label: "Exact C Anchor Return (Bars 5–6)", kind: "exact-anchor-repeat" },
        { startBar: 7, endBar: 8, label: "Authentic Cadence to D5 (Bars 7–8)", kind: "cadence" }
      ],
      leadEvents: [
        ...MOTIF_C_EVENTS.map((e) => ({ ...e })),
        { beat: 8.0,  midi: 76, durationBeats: 0.5, velocity: 0.76, section: "open-answer", isExactAnchor: false }, // E5
        { beat: 8.5,  midi: 79, durationBeats: 0.5, velocity: 0.76, section: "open-answer", isExactAnchor: false }, // G5
        { beat: 9.0,  midi: 83, durationBeats: 1.0, velocity: 0.78, section: "open-answer", isExactAnchor: false }, // B5
        { beat: 10.0, midi: 81, durationBeats: 1.0, velocity: 0.78, section: "open-answer", isExactAnchor: false }, // A5
        { beat: 11.0, midi: 79, durationBeats: 0.5, velocity: 0.76, section: "open-answer", isExactAnchor: false }, // G5
        { beat: 11.5, midi: 78, durationBeats: 0.5, velocity: 0.76, section: "open-answer", isExactAnchor: false }, // F#5
        { beat: 12.0, midi: 76, durationBeats: 1.0, velocity: 0.76, section: "open-answer", isExactAnchor: false }, // E5
        { beat: 13.0, midi: 78, durationBeats: 0.5, velocity: 0.76, section: "open-answer", isExactAnchor: false }, // F#5
        { beat: 13.5, midi: 79, durationBeats: 0.5, velocity: 0.77, section: "open-answer", isExactAnchor: false }, // G5
        { beat: 14.0, midi: 81, durationBeats: 2.0, velocity: 0.80, section: "open-answer", isExactAnchor: false }, // A5 half-cadence
        ...shiftEvents(MOTIF_C_EVENTS, 16.0, "exact-anchor-repeat", true),
        { beat: 24.0, midi: 76, durationBeats: 0.5, velocity: 0.76, section: "authentic-cadence", isExactAnchor: false }, // E5
        { beat: 24.5, midi: 78, durationBeats: 0.5, velocity: 0.76, section: "authentic-cadence", isExactAnchor: false }, // F#5
        { beat: 25.0, midi: 79, durationBeats: 0.5, velocity: 0.77, section: "authentic-cadence", isExactAnchor: false }, // G5
        { beat: 25.5, midi: 83, durationBeats: 0.5, velocity: 0.78, section: "authentic-cadence", isExactAnchor: false }, // B5
        { beat: 26.0, midi: 81, durationBeats: 0.5, velocity: 0.78, section: "authentic-cadence", isExactAnchor: false }, // A5
        { beat: 26.5, midi: 79, durationBeats: 0.5, velocity: 0.76, section: "authentic-cadence", isExactAnchor: false }, // G5
        { beat: 27.0, midi: 78, durationBeats: 0.5, velocity: 0.76, section: "authentic-cadence", isExactAnchor: false }, // F#5
        { beat: 27.5, midi: 76, durationBeats: 0.5, velocity: 0.74, section: "authentic-cadence", isExactAnchor: false }, // E5
        { beat: 28.0, midi: 74, durationBeats: 2.5, velocity: 0.80, section: "authentic-cadence", isExactAnchor: false }  // D5 tonic resolution
      ]
    },
    {
      id: "C2-call-and-breath",
      group: "c-continuation",
      title: "C2 — Pond Echoes (Conversational Call & Breathing Room)",
      shortLabel: "C2 Call & Breath (19.32s)",
      parentAnchor: "plan32-motif-c",
      bars: 8,
      beatsPerBar: 4,
      defaultHarmonyId: "H2-floating-color",
      defaultPatchId: "P2-warm-keys",
      lockBareControl: false,
      intent: "Gives Motif C generous breathing space so the lead never crowds reading. Bars 1–2 state exact Motif C; Bars 3–4 leave 2-beat lead rests before and after a gentle 4-note sigh while accompaniment bells/chords answer; Bars 5–6 return exact Motif C; Bars 7–8 close with a concise tag and 3.5 beats of ensemble breathing room.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact C Anchor (Bars 1–2)", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Breathing Space & 4-Note Sigh (Bars 3–4)", kind: "breathing-response" },
        { startBar: 5, endBar: 6, label: "Exact C Anchor Return (Bars 5–6)", kind: "exact-anchor-repeat" },
        { startBar: 7, endBar: 8, label: "Gentle Tag & Seam Rest (Bars 7–8)", kind: "cadence" }
      ],
      leadEvents: [
        ...MOTIF_C_EVENTS.map((e) => ({ ...e })),
        { beat: 10.0, midi: 83, durationBeats: 1.0, velocity: 0.72, section: "breathing-response", isExactAnchor: false }, // B5
        { beat: 11.0, midi: 81, durationBeats: 1.0, velocity: 0.72, section: "breathing-response", isExactAnchor: false }, // A5
        { beat: 12.0, midi: 78, durationBeats: 1.0, velocity: 0.70, section: "breathing-response", isExactAnchor: false }, // F#5
        { beat: 13.0, midi: 76, durationBeats: 1.0, velocity: 0.68, section: "breathing-response", isExactAnchor: false }, // E5
        ...shiftEvents(MOTIF_C_EVENTS, 16.0, "exact-anchor-repeat", true),
        { beat: 24.0, midi: 78, durationBeats: 0.5, velocity: 0.72, section: "tag-and-rest", isExactAnchor: false }, // F#5
        { beat: 24.5, midi: 79, durationBeats: 0.5, velocity: 0.72, section: "tag-and-rest", isExactAnchor: false }, // G5
        { beat: 25.0, midi: 81, durationBeats: 1.0, velocity: 0.74, section: "tag-and-rest", isExactAnchor: false }, // A5
        { beat: 26.0, midi: 78, durationBeats: 1.0, velocity: 0.72, section: "tag-and-rest", isExactAnchor: false }, // F#5
        { beat: 27.0, midi: 74, durationBeats: 1.5, velocity: 0.78, section: "tag-and-rest", isExactAnchor: false }  // D5
      ]
    },
    {
      id: "C3-accompaniment-groove",
      group: "c-continuation",
      title: "C3 — Morning Duck-Shop (Accompaniment-Led Scene)",
      shortLabel: "C3 Accompaniment-Led (19.32s)",
      parentAnchor: "plan32-motif-c",
      bars: 8,
      beatsPerBar: 4,
      defaultHarmonyId: "H3-playful-hocketing",
      defaultPatchId: "P3-toy-ensemble",
      lockBareControl: false,
      intent: "Designed for beginning-of-game play where accompaniment carries the room and the hook only appears intermittently. Bars 1–2 state exact Motif C; Bars 3–6 let the bouncy bass and hocketing accompaniment carry the scene (with only a brief 4-note motif wink in Bar 5); Bars 7–8 bring back exact Motif C.",
      sections: [
        { startBar: 1, endBar: 2, label: "Exact C Anchor (Bars 1–2)", kind: "exact-anchor" },
        { startBar: 3, endBar: 4, label: "Accompaniment-Only Groove (Bars 3–4)", kind: "accompaniment-scene" },
        { startBar: 5, endBar: 6, label: "Brief Motif Wink & Groove (Bars 5–6)", kind: "accompaniment-scene" },
        { startBar: 7, endBar: 8, label: "Exact C Anchor Return (Bars 7–8)", kind: "exact-anchor-repeat" }
      ],
      leadEvents: [
        ...MOTIF_C_EVENTS.map((e) => ({ ...e })),
        { beat: 16.0, midi: 78, durationBeats: 0.5, velocity: 0.74, section: "accompaniment-scene", isExactAnchor: false }, // F#5
        { beat: 16.5, midi: 81, durationBeats: 0.5, velocity: 0.74, section: "accompaniment-scene", isExactAnchor: false }, // A5
        { beat: 17.0, midi: 83, durationBeats: 1.0, velocity: 0.76, section: "accompaniment-scene", isExactAnchor: false }, // B5
        { beat: 18.0, midi: 81, durationBeats: 1.5, velocity: 0.72, section: "accompaniment-scene", isExactAnchor: false }, // A5
        ...shiftEvents(MOTIF_C_EVENTS, 24.0, "exact-anchor-repeat", true)
      ]
    },
    {
      id: "N1-sunny-waddle",
      group: "optional-new-core",
      title: "Optional Foil N1 — Sunny Waddle (Separated Mid-Register Core)",
      shortLabel: "N1 Optional Foil (9.72s)",
      parentAnchor: "none-optional-foil",
      bars: 4,
      beatsPerBar: 4,
      defaultHarmonyId: "H1-bright-resolved",
      defaultPatchId: "P1-pluck-bell",
      lockBareControl: false,
      intent: "Clearly separated optional comparison core (never replaces Motif C). Stays in a narrower mid-register sixth (D5–B5, avoiding high D6) with a 2-bar open call ending on A5 and a 2-bar closed answer ending on D5, testing whether a lower, gentler contour conditions external generators differently.",
      sections: [
        { startBar: 1, endBar: 2, label: "Open Mid-Register Call to A5 (Bars 1–2)", kind: "foil-call" },
        { startBar: 3, endBar: 4, label: "Closed Stepwise Answer to D5 (Bars 3–4)", kind: "foil-answer" }
      ],
      leadEvents: [
        { beat: 0.0,  midi: 78, durationBeats: 1.0, velocity: 0.76, section: "foil-call", isExactAnchor: false }, // F#5
        { beat: 1.0,  midi: 79, durationBeats: 0.5, velocity: 0.74, section: "foil-call", isExactAnchor: false }, // G5
        { beat: 1.5,  midi: 78, durationBeats: 0.5, velocity: 0.74, section: "foil-call", isExactAnchor: false }, // F#5
        { beat: 2.0,  midi: 76, durationBeats: 1.0, velocity: 0.74, section: "foil-call", isExactAnchor: false }, // E5
        { beat: 3.0,  midi: 74, durationBeats: 1.0, velocity: 0.72, section: "foil-call", isExactAnchor: false }, // D5
        { beat: 4.0,  midi: 76, durationBeats: 1.0, velocity: 0.75, section: "foil-call", isExactAnchor: false }, // E5
        { beat: 5.0,  midi: 78, durationBeats: 0.5, velocity: 0.75, section: "foil-call", isExactAnchor: false }, // F#5
        { beat: 5.5,  midi: 79, durationBeats: 0.5, velocity: 0.76, section: "foil-call", isExactAnchor: false }, // G5
        { beat: 6.0,  midi: 81, durationBeats: 2.0, velocity: 0.78, section: "foil-call", isExactAnchor: false }, // A5
        { beat: 8.0,  midi: 83, durationBeats: 1.0, velocity: 0.78, section: "foil-answer", isExactAnchor: false }, // B5
        { beat: 9.0,  midi: 81, durationBeats: 0.5, velocity: 0.76, section: "foil-answer", isExactAnchor: false }, // A5
        { beat: 9.5,  midi: 79, durationBeats: 0.5, velocity: 0.74, section: "foil-answer", isExactAnchor: false }, // G5
        { beat: 10.0, midi: 78, durationBeats: 1.0, velocity: 0.76, section: "foil-answer", isExactAnchor: false }, // F#5
        { beat: 11.0, midi: 79, durationBeats: 1.0, velocity: 0.76, section: "foil-answer", isExactAnchor: false }, // G5
        { beat: 12.0, midi: 76, durationBeats: 1.0, velocity: 0.74, section: "foil-answer", isExactAnchor: false }, // E5
        { beat: 13.0, midi: 78, durationBeats: 0.5, velocity: 0.74, section: "foil-answer", isExactAnchor: false }, // F#5
        { beat: 13.5, midi: 76, durationBeats: 0.5, velocity: 0.72, section: "foil-answer", isExactAnchor: false }, // E5
        { beat: 14.0, midi: 74, durationBeats: 2.0, velocity: 0.80, section: "foil-answer", isExactAnchor: false }  // D5
      ]
    }
  ];

  // Three contrasting light accompaniment families + H0-dry
  const HARMONIES = [
    {
      id: "H0-dry",
      name: "Dry (Unaccompanied Lead Only)",
      description: "Zero chord or bass accompaniment. Used for exact historical Motif C and dry monophonic reference uploads.",
      bass8: [],
      chords8: [],
      counter8: [],
      bass4: [],
      chords4: [],
      counter4: []
    },
    {
      id: "H1-bright-resolved",
      name: "H1 — Bright Resolved Support",
      description: "Clear diatonic D -> G -> Bm7 -> Em7 -> A7 -> D support in C3–G4 with a root-fifth bass line (D2–A2) and gentle rhythmic response in beats 6–7.5.",
      bass8: [
        { beat: 0.0,  midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
        { beat: 2.0,  midi: 45, durationBeats: 2.0, velocity: 0.65 }, // A2
        { beat: 4.0,  midi: 43, durationBeats: 2.0, velocity: 0.72 }, // G2
        { beat: 6.0,  midi: 45, durationBeats: 2.0, velocity: 0.72 }, // A2
        { beat: 8.0,  midi: 47, durationBeats: 2.0, velocity: 0.70 }, // B2
        { beat: 10.0, midi: 42, durationBeats: 2.0, velocity: 0.65 }, // F#2
        { beat: 12.0, midi: 40, durationBeats: 2.0, velocity: 0.70 }, // E2
        { beat: 14.0, midi: 45, durationBeats: 2.0, velocity: 0.74 }, // A2
        { beat: 16.0, midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
        { beat: 18.0, midi: 45, durationBeats: 2.0, velocity: 0.65 }, // A2
        { beat: 20.0, midi: 43, durationBeats: 2.0, velocity: 0.72 }, // G2
        { beat: 22.0, midi: 42, durationBeats: 2.0, velocity: 0.68 }, // F#2
        { beat: 24.0, midi: 40, durationBeats: 2.0, velocity: 0.70 }, // E2
        { beat: 26.0, midi: 45, durationBeats: 2.0, velocity: 0.74 }, // A2
        { beat: 28.0, midi: 38, durationBeats: 2.5, velocity: 0.78 }, // D2
        { beat: 30.5, midi: 45, durationBeats: 1.5, velocity: 0.66 }  // A2 turnaround
      ],
      chords8: [
        { beat: 0.0,  midis: [50, 57, 62, 66], durationBeats: 3.5, velocity: 0.58 },
        { beat: 4.0,  midis: [55, 59, 62],     durationBeats: 2.0, velocity: 0.58 },
        { beat: 6.0,  midis: [57, 61, 64],     durationBeats: 0.5, velocity: 0.62 },
        { beat: 6.5,  midis: [57, 61, 64],     durationBeats: 0.5, velocity: 0.62 },
        { beat: 7.0,  midis: [50, 57, 62, 66], durationBeats: 1.0, velocity: 0.65 },
        { beat: 8.0,  midis: [59, 62, 66, 69], durationBeats: 3.5, velocity: 0.56 },
        { beat: 12.0, midis: [52, 59, 62, 67], durationBeats: 2.0, velocity: 0.56 },
        { beat: 14.0, midis: [57, 61, 64, 67], durationBeats: 2.0, velocity: 0.62 },
        { beat: 16.0, midis: [50, 57, 62, 66], durationBeats: 3.5, velocity: 0.58 },
        { beat: 20.0, midis: [55, 59, 62],     durationBeats: 2.0, velocity: 0.58 },
        { beat: 22.0, midis: [54, 57, 62],     durationBeats: 2.0, velocity: 0.56 },
        { beat: 24.0, midis: [52, 59, 62, 67], durationBeats: 2.0, velocity: 0.58 },
        { beat: 26.0, midis: [57, 61, 64, 67], durationBeats: 2.0, velocity: 0.64 },
        { beat: 28.0, midis: [50, 57, 62, 66], durationBeats: 2.5, velocity: 0.64 },
        { beat: 30.5, midis: [57, 61, 64],     durationBeats: 0.5, velocity: 0.58 },
        { beat: 31.0, midis: [50, 57, 62, 66], durationBeats: 1.0, velocity: 0.62 }
      ],
      counter8: [],
      bass4: [
        { beat: 0.0,  midi: 38, durationBeats: 2.0, velocity: 0.74 }, // D2
        { beat: 2.0,  midi: 45, durationBeats: 2.0, velocity: 0.65 }, // A2
        { beat: 4.0,  midi: 43, durationBeats: 2.0, velocity: 0.72 }, // G2
        { beat: 6.0,  midi: 38, durationBeats: 2.0, velocity: 0.72 }, // D2
        { beat: 8.0,  midi: 47, durationBeats: 2.0, velocity: 0.70 }, // B2
        { beat: 10.0, midi: 45, durationBeats: 2.0, velocity: 0.68 }, // A2
        { beat: 12.0, midi: 43, durationBeats: 1.0, velocity: 0.72 }, // G2
        { beat: 13.0, midi: 45, durationBeats: 1.0, velocity: 0.74 }, // A2
        { beat: 14.0, midi: 38, durationBeats: 2.0, velocity: 0.78 }  // D2 resolved
      ],
      chords4: [
        { beat: 0.0,  midis: [50, 57, 62, 66], durationBeats: 3.5, velocity: 0.58 },
        { beat: 4.0,  midis: [55, 59, 62],     durationBeats: 2.0, velocity: 0.58 },
        { beat: 6.0,  midis: [50, 57, 62, 66], durationBeats: 1.8, velocity: 0.62 },
        { beat: 8.0,  midis: [59, 62, 66],     durationBeats: 2.0, velocity: 0.56 },
        { beat: 10.0, midis: [57, 61, 64],     durationBeats: 2.0, velocity: 0.58 },
        { beat: 12.0, midis: [55, 59, 62],     durationBeats: 1.0, velocity: 0.58 },
        { beat: 13.0, midis: [57, 61, 64, 67], durationBeats: 1.0, velocity: 0.62 },
        { beat: 14.0, midis: [50, 57, 62, 66], durationBeats: 2.0, velocity: 0.65 }
      ],
      counter4: []
    },
    {
      id: "H2-floating-color",
      name: "H2 — Gentle Floating / Added-Note Color",
      description: "Cozy Dmaj9 -> Gmaj7 -> Bm7 -> A6/9 warm pads with delicate bell/harp drops in the breathing spaces (beats 2.5–3.5 and 6.5–7.5).",
      bass8: [
        { beat: 0.0,  midi: 38, durationBeats: 4.0, velocity: 0.68 },
        { beat: 4.0,  midi: 43, durationBeats: 4.0, velocity: 0.66 },
        { beat: 8.0,  midi: 47, durationBeats: 4.0, velocity: 0.64 },
        { beat: 12.0, midi: 45, durationBeats: 4.0, velocity: 0.66 },
        { beat: 16.0, midi: 38, durationBeats: 4.0, velocity: 0.68 },
        { beat: 20.0, midi: 43, durationBeats: 4.0, velocity: 0.66 },
        { beat: 24.0, midi: 47, durationBeats: 2.0, velocity: 0.64 },
        { beat: 26.0, midi: 45, durationBeats: 2.0, velocity: 0.66 },
        { beat: 28.0, midi: 38, durationBeats: 4.0, velocity: 0.70 }
      ],
      chords8: [
        { beat: 0.0,  midis: [50, 57, 61, 64, 66], durationBeats: 3.8, velocity: 0.50 },
        { beat: 4.0,  midis: [55, 59, 62, 66],     durationBeats: 3.8, velocity: 0.50 },
        { beat: 8.0,  midis: [59, 62, 66, 69],     durationBeats: 3.8, velocity: 0.48 },
        { beat: 12.0, midis: [57, 61, 64, 66],     durationBeats: 3.8, velocity: 0.50 },
        { beat: 16.0, midis: [50, 57, 61, 64, 66], durationBeats: 3.8, velocity: 0.50 },
        { beat: 20.0, midis: [55, 59, 62, 66],     durationBeats: 3.8, velocity: 0.50 },
        { beat: 24.0, midis: [59, 62, 66, 69],     durationBeats: 1.8, velocity: 0.48 },
        { beat: 26.0, midis: [57, 61, 64, 66],     durationBeats: 1.8, velocity: 0.50 },
        { beat: 28.0, midis: [50, 57, 61, 64, 66], durationBeats: 3.8, velocity: 0.54 }
      ],
      counter8: [
        { beat: 6.5,  midi: 69, durationBeats: 0.5, velocity: 0.48 }, // A4
        { beat: 7.0,  midi: 74, durationBeats: 1.0, velocity: 0.44 }, // D5
        { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.46 }, // A4
        { beat: 15.0, midi: 73, durationBeats: 1.0, velocity: 0.42 }, // C#5
        { beat: 22.5, midi: 71, durationBeats: 0.5, velocity: 0.46 }, // B4
        { beat: 23.0, midi: 69, durationBeats: 1.0, velocity: 0.42 }, // A4
        { beat: 30.5, midi: 69, durationBeats: 0.5, velocity: 0.48 }, // A4
        { beat: 31.0, midi: 74, durationBeats: 1.0, velocity: 0.44 }  // D5
      ],
      bass4: [
        { beat: 0.0,  midi: 38, durationBeats: 4.0, velocity: 0.68 },
        { beat: 4.0,  midi: 43, durationBeats: 4.0, velocity: 0.66 },
        { beat: 8.0,  midi: 47, durationBeats: 2.0, velocity: 0.64 },
        { beat: 10.0, midi: 45, durationBeats: 2.0, velocity: 0.66 },
        { beat: 12.0, midi: 43, durationBeats: 2.0, velocity: 0.66 },
        { beat: 14.0, midi: 38, durationBeats: 2.0, velocity: 0.70 }
      ],
      chords4: [
        { beat: 0.0,  midis: [50, 57, 61, 64, 66], durationBeats: 3.8, velocity: 0.50 },
        { beat: 4.0,  midis: [55, 59, 62, 66],     durationBeats: 3.8, velocity: 0.50 },
        { beat: 8.0,  midis: [59, 62, 66, 69],     durationBeats: 1.9, velocity: 0.48 },
        { beat: 10.0, midis: [57, 61, 64, 66],     durationBeats: 1.9, velocity: 0.50 },
        { beat: 12.0, midis: [55, 59, 62, 66],     durationBeats: 1.9, velocity: 0.50 },
        { beat: 14.0, midis: [50, 57, 61, 64, 66], durationBeats: 2.0, velocity: 0.54 }
      ],
      counter4: [
        { beat: 6.5,  midi: 69, durationBeats: 0.5, velocity: 0.48 },
        { beat: 7.0,  midi: 74, durationBeats: 1.0, velocity: 0.44 },
        { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.48 },
        { beat: 15.0, midi: 74, durationBeats: 1.0, velocity: 0.44 }
      ]
    },
    {
      id: "H3-playful-hocketing",
      name: "H3 — Playful Syncopated / Hocketing Accompaniment",
      description: "Bouncy staccato bass on beats 0 & 2, light off-beat chord stabs on 1.5 & 3.5, and a cheerful mid-register hocketing figure filling lead rests.",
      bass8: [
        { beat: 0.0,  midi: 38, durationBeats: 0.6, velocity: 0.76 },
        { beat: 2.0,  midi: 45, durationBeats: 0.6, velocity: 0.70 },
        { beat: 4.0,  midi: 43, durationBeats: 0.6, velocity: 0.74 },
        { beat: 6.0,  midi: 45, durationBeats: 0.6, velocity: 0.74 },
        { beat: 8.0,  midi: 47, durationBeats: 0.6, velocity: 0.72 },
        { beat: 10.0, midi: 42, durationBeats: 0.6, velocity: 0.68 },
        { beat: 12.0, midi: 40, durationBeats: 0.6, velocity: 0.70 },
        { beat: 14.0, midi: 45, durationBeats: 0.6, velocity: 0.76 },
        { beat: 16.0, midi: 38, durationBeats: 0.6, velocity: 0.76 },
        { beat: 18.0, midi: 45, durationBeats: 0.6, velocity: 0.70 },
        { beat: 20.0, midi: 43, durationBeats: 0.6, velocity: 0.74 },
        { beat: 22.0, midi: 42, durationBeats: 0.6, velocity: 0.70 },
        { beat: 24.0, midi: 40, durationBeats: 0.6, velocity: 0.70 },
        { beat: 26.0, midi: 45, durationBeats: 0.6, velocity: 0.74 },
        { beat: 28.0, midi: 38, durationBeats: 0.8, velocity: 0.78 },
        { beat: 30.0, midi: 45, durationBeats: 0.6, velocity: 0.72 }
      ],
      chords8: [
        { beat: 1.5,  midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.58 },
        { beat: 3.5,  midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.56 },
        { beat: 5.5,  midis: [59, 62, 67], durationBeats: 0.45, velocity: 0.58 },
        { beat: 7.5,  midis: [57, 61, 64], durationBeats: 0.45, velocity: 0.60 },
        { beat: 9.5,  midis: [59, 62, 66], durationBeats: 0.45, velocity: 0.56 },
        { beat: 11.5, midis: [59, 62, 66], durationBeats: 0.45, velocity: 0.54 },
        { beat: 13.5, midis: [55, 59, 64], durationBeats: 0.45, velocity: 0.56 },
        { beat: 15.5, midis: [57, 61, 67], durationBeats: 0.45, velocity: 0.60 },
        { beat: 17.5, midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.58 },
        { beat: 19.5, midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.56 },
        { beat: 21.5, midis: [59, 62, 67], durationBeats: 0.45, velocity: 0.58 },
        { beat: 23.5, midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.56 },
        { beat: 25.5, midis: [55, 59, 64], durationBeats: 0.45, velocity: 0.56 },
        { beat: 27.5, midis: [57, 61, 67], durationBeats: 0.45, velocity: 0.60 },
        { beat: 29.5, midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.60 },
        { beat: 31.5, midis: [57, 61, 64], durationBeats: 0.45, velocity: 0.58 }
      ],
      counter8: [
        { beat: 6.5,  midi: 69, durationBeats: 0.5, velocity: 0.60 }, // A4
        { beat: 7.0,  midi: 71, durationBeats: 0.5, velocity: 0.62 }, // B4
        { beat: 7.5,  midi: 73, durationBeats: 0.5, velocity: 0.64 }, // C#5
        { beat: 8.5,  midi: 74, durationBeats: 0.5, velocity: 0.60 }, // D5
        { beat: 9.0,  midi: 76, durationBeats: 0.5, velocity: 0.62 }, // E5
        { beat: 14.5, midi: 73, durationBeats: 0.5, velocity: 0.58 }, // C#5
        { beat: 15.0, midi: 71, durationBeats: 0.5, velocity: 0.58 }, // B4
        { beat: 15.5, midi: 69, durationBeats: 0.5, velocity: 0.60 }, // A4
        { beat: 20.5, midi: 71, durationBeats: 0.5, velocity: 0.58 }, // B4
        { beat: 21.0, midi: 73, durationBeats: 0.5, velocity: 0.60 }, // C#5
        { beat: 21.5, midi: 74, durationBeats: 0.5, velocity: 0.62 }, // D5
        { beat: 22.0, midi: 76, durationBeats: 1.0, velocity: 0.60 }, // E5
        { beat: 30.5, midi: 69, durationBeats: 0.5, velocity: 0.62 }, // A4
        { beat: 31.0, midi: 71, durationBeats: 0.5, velocity: 0.64 }, // B4
        { beat: 31.5, midi: 73, durationBeats: 0.5, velocity: 0.66 }  // C#5
      ],
      bass4: [
        { beat: 0.0,  midi: 38, durationBeats: 0.6, velocity: 0.76 },
        { beat: 2.0,  midi: 45, durationBeats: 0.6, velocity: 0.70 },
        { beat: 4.0,  midi: 43, durationBeats: 0.6, velocity: 0.74 },
        { beat: 6.0,  midi: 45, durationBeats: 0.6, velocity: 0.74 },
        { beat: 8.0,  midi: 47, durationBeats: 0.6, velocity: 0.72 },
        { beat: 10.0, midi: 45, durationBeats: 0.6, velocity: 0.70 },
        { beat: 12.0, midi: 43, durationBeats: 0.6, velocity: 0.72 },
        { beat: 14.0, midi: 38, durationBeats: 0.8, velocity: 0.78 }
      ],
      chords4: [
        { beat: 1.5,  midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.58 },
        { beat: 3.5,  midis: [57, 62, 66], durationBeats: 0.45, velocity: 0.56 },
        { beat: 5.5,  midis: [59, 62, 67], durationBeats: 0.45, velocity: 0.58 },
        { beat: 7.5,  midis: [57, 61, 64], durationBeats: 0.45, velocity: 0.60 },
        { beat: 9.5,  midis: [59, 62, 66], durationBeats: 0.45, velocity: 0.56 },
        { beat: 11.5, midis: [57, 61, 64], durationBeats: 0.45, velocity: 0.58 },
        { beat: 13.5, midis: [55, 59, 62], durationBeats: 0.45, velocity: 0.58 },
        { beat: 15.0, midis: [50, 57, 62, 66], durationBeats: 0.8, velocity: 0.62 }
      ],
      counter4: [
        { beat: 6.5,  midi: 69, durationBeats: 0.5, velocity: 0.60 },
        { beat: 7.0,  midi: 71, durationBeats: 0.5, velocity: 0.62 },
        { beat: 7.5,  midi: 73, durationBeats: 0.5, velocity: 0.64 },
        { beat: 14.5, midi: 69, durationBeats: 0.5, velocity: 0.60 },
        { beat: 15.0, midi: 74, durationBeats: 0.8, velocity: 0.64 }
      ]
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
