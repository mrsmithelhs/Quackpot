import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const scores = require("./scores.js");
const patches = require("./patches.js");
const engine = require("./synth-engine.js");

const ROOT = "C:/AI/Quackpot";
const PLAN32_MOTIFS_PATH = path.join(
  ROOT,
  "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/motifs.js"
);
const PLAN32_WAV_PATH = path.join(
  ROOT,
  "reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/history/attempt-02/plan32-motif-c.wav"
);

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

test("Plan 32 Motif C provenance and untouched SHA-256 integrity", () => {
  const motifsBytes = readFileSync(PLAN32_MOTIFS_PATH);
  const wavBytes = readFileSync(PLAN32_WAV_PATH);

  assert.equal(
    sha256(motifsBytes),
    scores.provenance.motifCSourceSha256,
    "Plan 32 motifs.js SHA-256 must match recorded provenance"
  );
  assert.equal(
    sha256(wavBytes),
    scores.provenance.motifCWavSha256,
    "Plan 32 plan32-motif-c.wav SHA-256 must match recorded provenance"
  );

  // Evaluate Plan 32 motifs.js in a minimal window shim to compare exact Motif C events
  const windowShim = {};
  const fn = new Function("window", motifsBytes.toString("utf8"));
  fn(windowShim);
  const plan32MotifC = windowShim.QUACKPOT_PLAN32_MOTIFS.motifs.find((m) => m.id === "C");
  assert.ok(plan32MotifC, "Motif C must exist in Plan 32 motifs.js");
  assert.equal(scores.motifCAnchorEvents.length, plan32MotifC.events.length);

  scores.motifCAnchorEvents.forEach((ev, idx) => {
    const orig = plan32MotifC.events[idx];
    assert.equal(ev.beat, orig.beat, `Event ${idx} beat matches Motif C`);
    assert.equal(ev.midi, orig.midi, `Event ${idx} MIDI pitch matches Motif C`);
    assert.equal(ev.durationBeats, orig.durationBeats, `Event ${idx} durationBeats matches Motif C`);
    assert.equal(ev.velocity, orig.velocity, `Event ${idx} velocity matches Motif C`);
  });
});

test("C0-original historical control timing and untouched 10-event Motif C anchor", () => {
  const c0Orig = engine.buildScheduledScore({
    candidateId: "C0-original",
    harmonyId: "H0-dry",
    patchId: "P0-plan32-triangle",
    tempoBpm: 100,
    layerMode: "full"
  });
  assert.equal(c0Orig.phraseSeconds, 4.8);
  assert.equal(c0Orig.tailSeconds, 0.12);
  assert.equal(c0Orig.durationSeconds, 4.92);
  assert.equal(c0Orig.leadEvents.length, 10);

  for (let i = 0; i < 10; i += 1) {
    const ev = c0Orig.leadEvents[i];
    const anchor = scores.motifCAnchorEvents[i];
    assert.equal(ev.beat, anchor.beat);
    assert.equal(ev.midi, anchor.midi);
    assert.equal(ev.durationBeats, anchor.durationBeats);
    assert.equal(ev.isExactAnchor, true);
  }
});

test("v3 Melodic Expansion Families A, B, and C (M1-M6) structure, anchor preservation, and non-overlapping voices", () => {
  assert.equal(scores.candidates.length, 7, "7 candidates total (C0-original + M1..M6)");
  assert.equal(scores.harmonies.length, 7, "7 harmonies total (H0-dry + 6 tailored harmonies)");

  // Family A: Non-terminal Bar 2 modifications (M1, M2)
  const m1 = engine.buildScheduledScore({ candidateId: "M1-skyward-vista" });
  const m2 = engine.buildScheduledScore({ candidateId: "M2-supertonic-question" });
  assert.equal(m1.bars, 4);
  assert.equal(m2.bars, 4);
  assert.ok(m1.durationSeconds >= 9.6, "M1 clears 6.0s minimum");
  assert.ok(m2.durationSeconds >= 9.6, "M2 clears 6.0s minimum");

  // Both M1 and M2 preserve Bar 1 (first 6 notes of Motif C: F#5, A5, D6, C#6, A5, F#5)
  for (const score of [m1, m2]) {
    for (let i = 0; i < 6; i += 1) {
      assert.equal(score.leadEvents[i].beat, scores.motifCAnchorEvents[i].beat);
      assert.equal(score.leadEvents[i].midi, scores.motifCAnchorEvents[i].midi);
      assert.equal(score.leadEvents[i].isExactAnchor, true);
    }
  }
  // M1 Bar 2 pivots upward to E6 (MIDI 88) at beat 6.0 instead of terminal D5 (MIDI 74)
  const m1Beat6 = m1.leadEvents.find((e) => e.beat === 6.0);
  assert.ok(m1Beat6 && m1Beat6.midi === 88, "M1 pivots upward to E6 (MIDI 88) at Beat 6.0");

  // M2 Bar 2 steps down through F#5 (Beat 6.0) to open supertonic E5 (MIDI 76) at Beat 7.0 instead of terminal D5 (MIDI 74)
  const m2Beat7 = m2.leadEvents.find((e) => e.beat === 7.0);
  assert.ok(m2Beat7 && m2Beat7.midi === 76, "M2 lands on supertonic E5 (MIDI 76) at Beat 7.0");

  // Family B: Long-timescale arcs >= 3x original length (M3 = 6 bars / 3x, M4 = 8 bars / 4x)
  const m3 = engine.buildScheduledScore({ candidateId: "M3-horizon-drift" });
  const m4 = engine.buildScheduledScore({ candidateId: "M4-celestial-wanderer" });
  assert.equal(m3.bars, 6, "M3 is 6 bars (3x length of 2-bar Motif C)");
  assert.equal(m3.phraseSeconds, 14.4, "M3 phrase is 14.4s (3x 4.8s)");
  assert.equal(m4.bars, 8, "M4 is 8 bars (4x length of 2-bar Motif C)");
  assert.equal(m4.phraseSeconds, 19.2, "M4 phrase is 19.2s (4x 4.8s)");
  assert.ok(m3.leadEvents.some((e) => e.midi === 90), "M3 reaches high F#6 (MIDI 90) climax");
  assert.ok(m4.leadEvents.some((e) => e.midi === 90), "M4 reaches high F#6 (MIDI 90) climax");

  // Family C: Unresolved pivot chords under exact 10-event Motif C (M5, M6)
  const m5 = engine.buildScheduledScore({ candidateId: "M5-minor-iv-yearning" });
  const m6 = engine.buildScheduledScore({ candidateId: "M6-secondary-dominant-drive" });
  for (const score of [m5, m6]) {
    for (let i = 0; i < 10; i += 1) {
      assert.equal(score.leadEvents[i].beat, scores.motifCAnchorEvents[i].beat, `${score.candidateId} event ${i} beat matches Motif C`);
      assert.equal(score.leadEvents[i].midi, scores.motifCAnchorEvents[i].midi, `${score.candidateId} event ${i} MIDI matches Motif C`);
      assert.equal(score.leadEvents[i].durationBeats, scores.motifCAnchorEvents[i].durationBeats, `${score.candidateId} event ${i} duration matches Motif C`);
      assert.equal(score.leadEvents[i].isExactAnchor, true);
    }
  }
  // Verify M5 has Bb2 (MIDI 46) minor-iv bass pivot and M6 has E2 (MIDI 40) secondary-dominant bass pivot under Bar 2
  assert.ok(m5.bassEvents.some((b) => b.midi === 46 && b.beat >= 5.0 && b.beat <= 6.5), "M5 has Bb2 (MIDI 46) minor-iv bass pivot");
  assert.ok(m6.bassEvents.some((b) => b.midi === 40 && b.beat >= 5.0 && b.beat <= 6.5), "M6 has E2 (MIDI 40) secondary-dominant bass pivot");

  // Verify monophonic non-overlapping lead events across all 7 candidates
  for (const cand of scores.candidates) {
    const scheduled = engine.buildScheduledScore({ candidateId: cand.id });
    assert.ok(scheduled.durationSeconds <= 60, `${cand.id} duration <= 60s`);
    for (let i = 0; i < scheduled.leadEvents.length - 1; i += 1) {
      const curr = scheduled.leadEvents[i];
      const next = scheduled.leadEvents[i + 1];
      assert.ok(
        curr.beat + curr.durationBeats <= next.beat + 1e-6,
        `${cand.id} lead events ${i} and ${i + 1} do not overlap`
      );
    }
  }
});

test("webaudio-tinysynth (quality: 1) GM programs, per-track GM overrides, melody-chords mode, and single-file WAV naming", () => {
  assert.ok(patches.gmPrograms.length >= 20, "At least 20 GM programs defined in patches.js");
  assert.equal(patches.ensemblePresets.length, 8, "8 ensemble presets defined in patches.js");

  const customScore = engine.buildScheduledScore({
    candidateId: "M5-minor-iv-yearning",
    harmonyId: "H-C1-minor-iv",
    patchId: "TS-musicbox-harp",
    leadProgramId: "GM-108-kalimba",
    chordsProgramId: "GM-04-epiano1",
    bassProgramId: "GM-33-finger-bass",
    tempoBpm: 100,
    layerMode: "melody-chords"
  });

  assert.equal(customScore.leadProgramId, "GM-108-kalimba");
  assert.equal(customScore.chordsProgramId, "GM-04-epiano1");
  assert.equal(customScore.bassProgramId, "GM-33-finger-bass");
  assert.ok(customScore.leadEvents.length > 0, "melody-chords retains lead events");
  assert.ok(customScore.chordEvents.length > 0, "melody-chords retains chord events");
  assert.equal(customScore.bassEvents.length, 0, "melody-chords omits bass events");

  const fileName = engine.buildArrangementFilename(customScore);
  assert.equal(fileName, "plan39-M5-minor-iv-yearning-H-C1-minor-iv-kalimba-melody-chords-100bpm.wav");
});

test("Lead event parity between Full Mix, Melody+Chords, and Melody-Only across all candidates and ensemble presets", () => {
  for (const cand of scores.candidates) {
    const harmonyId = cand.lockBareControl ? "H0-dry" : cand.defaultHarmonyId;
    for (const preset of patches.ensemblePresets) {
      const mixScore = engine.buildScheduledScore({
        candidateId: cand.id,
        harmonyId,
        patchId: preset.id,
        tempoBpm: 100,
        layerMode: "full"
      });
      const melodyScore = engine.buildScheduledScore({
        candidateId: cand.id,
        harmonyId,
        patchId: preset.id,
        tempoBpm: 100,
        layerMode: "melody-only"
      });

      const parity = engine.verifyLeadEventParity(mixScore, melodyScore);
      assert.equal(parity.identical, true, `Lead parity holds for ${cand.id} + ${preset.id}`);
      assert.equal(melodyScore.chordEvents.length, 0);
      assert.equal(melodyScore.bassEvents.length, 0);
    }
  }
});

test("Combination guard rejects unsupported settings and bounds validation rejects out-of-range inputs", () => {
  const badBareHarmony = engine.evaluateCombination({
    candidateId: "C0-original",
    harmonyId: "H-A1-skyward",
    patchId: "P0-plan32-triangle",
    tempoBpm: 100,
    layerMode: "full"
  });
  assert.equal(badBareHarmony.supported, false);

  const badDryBacking = engine.evaluateCombination({
    candidateId: "M1-skyward-vista",
    harmonyId: "H0-dry",
    patchId: "TS-marimba-epiano",
    tempoBpm: 100,
    layerMode: "backing-only"
  });
  assert.equal(badDryBacking.supported, false);

  assert.throws(() => {
    engine.buildScheduledScore({
      candidateId: "M1-skyward-vista",
      harmonyId: "H-A1-skyward",
      patchId: "TS-marimba-epiano",
      tempoBpm: 45,
      layerMode: "full"
    });
  }, /Invalid tempoBpm/);
});

test("WAV encoder/parser and manifest round-trip verification with GM program IDs", () => {
  const sampleRate = 48000;
  const frames = 4800; // 0.10 s
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (let i = 0; i < frames; i += 1) {
    const val = 0.25 * Math.sin((2 * Math.PI * 440 * i) / sampleRate);
    left[i] = val;
    right[i] = val;
  }
  const fakeBuffer = {
    numberOfChannels: 2,
    sampleRate,
    length: frames,
    getChannelData(ch) {
      return ch === 0 ? left : right;
    }
  };

  const measured = engine.measurePcm(fakeBuffer);
  assert.equal(measured.isClipped, false);
  assert.ok(measured.peak > 0.24 && measured.peak <= 0.25);
  assert.ok(measured.measurementBasis.includes("not LUFS or true peak"));

  const wav = engine.encodePcm16Wav(fakeBuffer);
  const parsed = engine.parseWavHeader(wav.arrayBuffer);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.channels, 2);
  assert.equal(parsed.sampleRate, 48000);
  assert.equal(parsed.bitsPerSample, 16);
  assert.equal(parsed.frames, frames);
  assert.equal(parsed.durationSeconds, 0.1);

  // Test manifest round-trip with custom GM program overrides
  const score = engine.buildScheduledScore({
    candidateId: "M3-horizon-drift",
    harmonyId: "H-B1-horizon",
    patchId: "TS-flute-harp",
    leadProgramId: "GM-79-ocarina",
    chordsProgramId: "GM-46-harp",
    bassProgramId: "GM-32-acoustic-bass",
    tempoBpm: 100,
    layerMode: "full"
  });
  const manifest = engine.createExportManifest(score, { sampleRate: 48000 }, { identical: true, count: score.leadEvents.length });
  const roundTrip = engine.validateImportedManifest(JSON.parse(JSON.stringify(manifest)));
  assert.equal(roundTrip.valid, true);
  assert.equal(roundTrip.settings.leadProgramId, "GM-79-ocarina");
  assert.equal(roundTrip.rebuilt.leadEvents.length, score.leadEvents.length);
  assert.equal(roundTrip.rebuilt.chordEvents.length, score.chordEvents.length);
  assert.equal(roundTrip.rebuilt.bassEvents.length, score.bassEvents.length);
});

test("manifest rejects changed tracks, versions, programs and mix and preserves skeleton gains", () => {
  const score = engine.buildScheduledScore({ candidateId: "M3-horizon-drift", harmonyId: "H-B1-horizon", patchId: "TS-flute-harp", tempoBpm: 104, layerMode: "conditioning-skeleton", layerGains: { lead: 0.7, chords: 0.8, bass: 0.6 }, roomAir: true });
  const manifest = JSON.parse(JSON.stringify(engine.createExportManifest(score)));
  const ok = engine.validateImportedManifest(manifest);
  assert.equal(ok.valid, true);
  assert.deepEqual(ok.rebuilt.layerGains, score.layerGains);
  for (const mutate of [
    m => { m.events.chordEvents[0].midi++; },
    m => { m.events.bassEvents[0].velocity = 0; },
    m => { m.events.leadEvents[0].startSeconds = 99; },
    m => { m.patchSnapshot.masterGain = 0; },
    m => { m.settings.leadProgramId = "unknown"; },
    m => { m.settings.roomAir = "yes"; },
    m => { m.settings.layerGains.bass = -1; },
    m => { delete m.settings.candidateId; },
    m => { delete m.settings.layerMode; },
    m => { m.mixContract.peakSafetyScale = 0.5; },
    m => { m.render = { safetyScale: 2 }; m.mixContract.peakSafetyScale = 2; },
    m => { m.scoreSchemaVersion = 999; },
    m => { m.schemaVersion = 3; }
  ]) {
    const copy = structuredClone(manifest); mutate(copy);
    assert.equal(engine.validateImportedManifest(copy).valid, false);
  }
});

test("tail bound includes non-lead program, groove and room; candidate defaults build", () => {
  for (const c of scores.candidates) engine.buildScheduledScore({ candidateId: c.id, harmonyId: c.defaultHarmonyId, patchId: c.defaultPatchId, tempoBpm: 100 });
  const config = { candidateId: "M3-horizon-drift", harmonyId: "H-B1-horizon", patchId: "TS-flute-harp", leadProgramId: "GM-12-marimba", chordsProgramId: "GM-46-harp", bassProgramId: "GM-32-acoustic-bass", tempoBpm: 100, layerMode: "full" };
  const dry = engine.buildScheduledScore(config);
  const wet = engine.buildScheduledScore({ ...config, roomAir: true, microGroove: true });
  assert.ok(dry.tailSeconds >= engine.getGmProgram(config.chordsProgramId).releaseTailSeconds);
  assert.ok(wet.tailSeconds >= dry.tailSeconds + 0.39);
});


test("offline render timeout retains the lock until a late rejection settles", async () => {
  const originalContext = globalThis.OfflineAudioContext;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  let fireDeadline;
  let rejectRender;
  let starts = 0;
  const gainNode = () => ({ gain: { setValueAtTime() {} }, connect() {} });
  globalThis.OfflineAudioContext = class {
    constructor() { this.destination = {}; }
    createGain() { return gainNode(); }
    startRendering() {
      starts += 1;
      return new Promise((_, reject) => { rejectRender = reject; });
    }
  };
  globalThis.setTimeout = (callback) => { fireDeadline = callback; return 1; };
  globalThis.clearTimeout = () => {};
  const score = {
    patchId: "P0-plan32-triangle", harmonyId: "H0-dry", durationSeconds: 1,
    leadEvents: [], chordEvents: [], bassEvents: []
  };
  try {
    const first = engine.renderOfflineWav(score);
    fireDeadline();
    await assert.rejects(first, /timeout; rendering may still be in progress/);
    await assert.rejects(engine.renderOfflineWav(score), /currently in progress/);
    assert.equal(starts, 1);
    rejectRender(new Error("late render failure"));
    await Promise.resolve();
    const second = engine.renderOfflineWav(score);
    assert.equal(starts, 2);
    rejectRender(new Error("second render failure"));
    await assert.rejects(second, /second render failure/);
  } finally {
    globalThis.OfflineAudioContext = originalContext;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});
