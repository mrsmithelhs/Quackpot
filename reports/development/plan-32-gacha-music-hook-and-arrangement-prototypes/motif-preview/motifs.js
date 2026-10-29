/* Editable, portable Plan 32 bare-melody preview source. No runtime fetches. */
window.QUACKPOT_PLAN32_MOTIFS = Object.freeze({
  sourceVersion: 1,
  tonic: "D",
  tonicMidi: 62,
  tempoBpm: 100,
  beatsPerBar: 4,
  bars: 2,
  patch: Object.freeze({
    waveform: "triangle",
    attackSeconds: 0.012,
    decaySeconds: 0.075,
    sustainRatio: 0.22,
    releaseSeconds: 0.09,
    voicePeak: 0.24,
    masterGain: 0.7,
    sampleRate: 48000,
    tailSeconds: 0.12,
    noise: false
  }),
  motifs: Object.freeze([
    Object.freeze({
      id: "A",
      title: "Prize Lantern",
      description: "A lift, a brief high point, then a falling answer and lower turnaround.",
      events: Object.freeze([
        { beat: 0, midi: 74, durationBeats: 1, velocity: 0.78 },
        { beat: 1, midi: 78, durationBeats: 0.5, velocity: 0.78 },
        { beat: 1.5, midi: 81, durationBeats: 0.5, velocity: 0.78 },
        { beat: 2, midi: 83, durationBeats: 1, velocity: 0.78 },
        { beat: 3, midi: 81, durationBeats: 1, velocity: 0.78 },
        { beat: 4, midi: 78, durationBeats: 1, velocity: 0.78 },
        { beat: 5, midi: 76, durationBeats: 0.5, velocity: 0.78 },
        { beat: 5.5, midi: 78, durationBeats: 0.5, velocity: 0.78 },
        { beat: 6, midi: 74, durationBeats: 1, velocity: 0.78 },
        { beat: 7, midi: 69, durationBeats: 1, velocity: 0.78 }
      ])
    }),
    Object.freeze({
      id: "B",
      title: "Pond Ticket",
      description: "A wider, open contour that lands back on the tonic.",
      events: Object.freeze([
        { beat: 0, midi: 74, durationBeats: 1, velocity: 0.78 },
        { beat: 1, midi: 81, durationBeats: 1, velocity: 0.78 },
        { beat: 2, midi: 78, durationBeats: 0.5, velocity: 0.78 },
        { beat: 2.5, midi: 81, durationBeats: 0.5, velocity: 0.78 },
        { beat: 3, midi: 86, durationBeats: 1, velocity: 0.78 },
        { beat: 4, midi: 83, durationBeats: 1, velocity: 0.78 },
        { beat: 5, midi: 81, durationBeats: 1, velocity: 0.78 },
        { beat: 6, midi: 76, durationBeats: 1, velocity: 0.78 },
        { beat: 7, midi: 74, durationBeats: 1, velocity: 0.78 }
      ])
    }),
    Object.freeze({
      id: "C",
      title: "Lucky Ripple",
      description: "A quick upper turn followed by a descending answer; it starts on beat one.",
      events: Object.freeze([
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
      ])
    })
  ])
});
