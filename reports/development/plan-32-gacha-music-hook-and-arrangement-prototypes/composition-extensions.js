/* Classic-script data wrapper for reliable local file:// loading. */
window.QUACKPOT_PLAN32_EXTENSIONS = Object.freeze({
  schema: "quackpot.plan32-composition-extensions/v1",
  source: {
    file: "motif-preview/motifs.js",
    sha256: "3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02",
    motifId: "C",
    title: "Lucky Ripple",
    sourceVersion: 1,
    tonic: "D",
    tonicMidi: 62,
    tempoBpm: 100,
    beatsPerBar: 4,
    beatsPerBar: 4,
    bars: 2,
    events: [
      { beat: 0, midi: 78, durationBeats: 0.5, velocity: 0.78 },
      { beat: 0.5, midi: 81, durationBeats: 0.5, velocity: 0.78 },
      { beat: 1, midi: 86, durationBeats: 1, velocity: 0.78 },
      { beat: 2, midi: 85, durationBeats: 1, velocity: 0.78 },
      { beat: 3, midi: 81, durationBeats: 0.5, velocity: 0.78 },
      { beat: 3.5, midi: 78, durationBeats: 0.5, velocity: 0.78 },
      { beat: 4, midi: 83, durationBeats: 1, velocity: 0.78 },
      { beat: 5, midi: 81, durationBeats: 0.5, velocity: 0.78 },
      { beat: 5.5, midi: 78, durationBeats: 0.5, velocity: 0.78 },
      { beat: 6, midi: 74, durationBeats: 2, velocity: 0.78 }
    ]
  },
  render: {
    musicalSeconds: 19.2,
    tailSeconds: 0.12,
    sampleRate: 48000,
    channels: 2,
    format: "PCM16",
    waveform: "triangle",
    attackSeconds: 0.012,
    decaySeconds: 0.075,
    sustainRatio: 0.22,
    releaseSeconds: 0.09,
    leadVoicePeak: 0.24,
    masterGain: 0.7,
    backingVoicePeak: 0.028,
    backingVelocity: 0.72,
    commonGainOnly: true,
    normalization: "none",
    measurements: "PCM sample peak and RMS only; not LUFS or true peak"
  },
  sharedBed: [
    { beat: 0, midi: 50, durationBeats: 2, velocity: 0.72, role: "D support" },
    { beat: 2, midi: 57, durationBeats: 2, velocity: 0.72, role: "A support" }
  ],
  structures: [
    {
      id: "S1",
      title: "Call, answer, return",
      sections: [
        { bars: "1-2", kind: "full-source-hook" },
        { bars: "3-4", kind: "new-answer", eventRange: [0, 10] },
        { bars: "5-6", kind: "lead-rest-source-echo" },
        { bars: "7-8", kind: "full-source-hook" }
      ],
      lead: [
        { beat: 8, midi: 78, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 8.5, midi: 76, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 9, midi: 78, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 9.5, midi: 81, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 10, midi: 83, durationBeats: 1, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 11, midi: 81, durationBeats: 1, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 12, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 13, midi: 76, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 13.5, midi: 78, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "answer" },
        { beat: 14, midi: 74, durationBeats: 2, velocity: 0.78, origin: "new", section: "answer" }
      ],
      backingEchoes: [
        { beat: 16, sourceEventIndex: 0, midi: 78, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 16.5, sourceEventIndex: 1, midi: 81, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 22, sourceEventIndex: 3, midi: 85, durationBeats: 1, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 23, sourceEventIndex: 4, midi: 81, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 23.5, sourceEventIndex: 5, midi: 78, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" }
      ]
    },
    {
      id: "S2",
      title: "Bookend contrast",
      sections: [
        { bars: "1-2", kind: "full-source-hook" },
        { bars: "3-6", kind: "new-contrast-with-source-echo", eventRange: [0, 15] },
        { bars: "7-8", kind: "full-source-hook" }
      ],
      lead: [
        { beat: 8, midi: 74, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 9, midi: 78, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 9.5, midi: 81, durationBeats: 0.5, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 10, midi: 83, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 11, midi: 86, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 12, midi: 85, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 13, midi: 83, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 14, midi: 81, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 15, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 17, midi: 83, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 18, midi: 81, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 19, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 20, midi: 76, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 21, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 22, midi: 81, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" },
        { beat: 23, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "contrast" }
      ],
      backingEchoes: [
        { beat: 16, sourceEventIndex: 0, midi: 78, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 16.5, sourceEventIndex: 1, midi: 81, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" }
      ]
    },
    {
      id: "S3",
      title: "Spacious, fragmentary answer",
      sections: [
        { bars: "1-2", kind: "full-source-hook" },
        { bars: "3-4", kind: "lead-rest" },
        { bars: "5-6", kind: "sparse-source-echo" },
        { bars: "7-8", kind: "new-cadence-answer", eventRange: [0, 7] }
      ],
      lead: [
        { beat: 24, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "cadence-answer" },
        { beat: 25, midi: 81, durationBeats: 1, velocity: 0.78, origin: "new", section: "cadence-answer" },
        { beat: 26, midi: 83, durationBeats: 1, velocity: 0.78, origin: "new", section: "cadence-answer" },
        { beat: 27, midi: 81, durationBeats: 1, velocity: 0.78, origin: "new", section: "cadence-answer" },
        { beat: 28, midi: 78, durationBeats: 1, velocity: 0.78, origin: "new", section: "cadence-answer" },
        { beat: 29, midi: 76, durationBeats: 1, velocity: 0.78, origin: "new", section: "cadence-answer" },
        { beat: 30, midi: 74, durationBeats: 2, velocity: 0.78, origin: "new", section: "cadence-answer" }
      ],
      backingEchoes: [
        { beat: 16, sourceEventIndex: 0, midi: 78, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 16.5, sourceEventIndex: 1, midi: 81, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 22, sourceEventIndex: 3, midi: 85, durationBeats: 1, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 23, sourceEventIndex: 4, midi: 81, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" },
        { beat: 23.5, sourceEventIndex: 5, midi: 78, durationBeats: 0.5, velocity: 0.72, origin: "source-derived", transform: "unchanged pitch and duration; backing role" }
      ]
    }
  ]
});
