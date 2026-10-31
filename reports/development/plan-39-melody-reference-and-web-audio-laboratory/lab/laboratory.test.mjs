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

test("C0-original and C0-repeat2x timing, repetition join, and duration bounds", () => {
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

  const c0Rep = engine.buildScheduledScore({
    candidateId: "C0-repeat2x",
    harmonyId: "H0-dry",
    patchId: "P0-plan32-triangle",
    tempoBpm: 100,
    layerMode: "full"
  });
  assert.equal(c0Rep.phraseSeconds, 9.6);
  assert.equal(c0Rep.tailSeconds, 0.12);
  assert.equal(c0Rep.durationSeconds, 9.72);
  assert.ok(c0Rep.durationSeconds >= 6.0, "Repeated control clears Suno 6.0s minimum");
  assert.equal(c0Rep.leadEvents.length, 20);

  // Verify repetition join: Note 9 (end of statement 1) ends at beat 8.0 (4.80s)
  // and Note 10 (start of statement 2) starts at beat 8.0 (4.80s) with no gap or overlap
  const lastOfFirst = c0Rep.leadEvents[9];
  const firstOfSecond = c0Rep.leadEvents[10];
  assert.equal(lastOfFirst.beat, 6.0);
  assert.equal(lastOfFirst.durationBeats, 2.0);
  assert.equal(lastOfFirst.beat + lastOfFirst.durationBeats, 8.0);
  assert.equal(firstOfSecond.beat, 8.0);
  assert.equal(
    Number((lastOfFirst.startSeconds + lastOfFirst.durationSeconds).toFixed(6)),
    firstOfSecond.startSeconds,
    "Repetition join has zero gap and zero overlap"
  );

  // Verify statement 2 pitches/durations match statement 1 + 8 beats
  for (let i = 0; i < 10; i += 1) {
    const a = c0Rep.leadEvents[i];
    const b = c0Rep.leadEvents[i + 10];
    assert.equal(b.beat, a.beat + 8.0);
    assert.equal(b.midi, a.midi);
    assert.equal(b.durationBeats, a.durationBeats);
    assert.equal(b.velocity, a.velocity);
  }
});

test("All C-derived candidates preserve exact Motif C anchor in Bars 1-2 and have finite non-overlapping lead voices", () => {
  const cDerivedIds = ["C0-original", "C0-repeat2x", "C1-period-lock", "C2-call-and-breath", "C3-accompaniment-groove"];
  for (const id of cDerivedIds) {
    const cand = engine.getCandidate(id);
    assert.ok(cand, `Candidate ${id} exists`);
    const scheduled = engine.buildScheduledScore({
      candidateId: id,
      harmonyId: cand.defaultHarmonyId,
      patchId: cand.defaultPatchId,
      tempoBpm: 100,
      layerMode: "full"
    });
    assert.ok(scheduled.durationSeconds <= 60, `${id} duration <= 60s`);

    // First 10 events must be exact Motif C anchor
    for (let i = 0; i < 10; i += 1) {
      const ev = scheduled.leadEvents[i];
      const anchor = scores.motifCAnchorEvents[i];
      assert.equal(ev.beat, anchor.beat, `${id} event ${i} beat matches Motif C anchor`);
      assert.equal(ev.midi, anchor.midi, `${id} event ${i} MIDI matches Motif C anchor`);
      assert.equal(ev.durationBeats, anchor.durationBeats, `${id} event ${i} duration matches Motif C anchor`);
      assert.equal(ev.isExactAnchor, true, `${id} event ${i} marked as exact anchor`);
    }

    // Verify monophonic non-overlapping lead events
    for (let i = 0; i < scheduled.leadEvents.length - 1; i += 1) {
      const curr = scheduled.leadEvents[i];
      const next = scheduled.leadEvents[i + 1];
      assert.ok(
        curr.beat + curr.durationBeats <= next.beat + 1e-6,
        `${id} lead events ${i} and ${i + 1} do not overlap`
      );
    }
  }
});

test("Lead event parity between Full Mix and Melody-Only across all candidates, harmonies, and patches", () => {
  for (const cand of scores.candidates) {
    const harmonyId = cand.lockBareControl ? "H0-dry" : "H1-bright-resolved";
    for (const patch of patches.patches) {
      const mixScore = engine.buildScheduledScore({
        candidateId: cand.id,
        harmonyId,
        patchId: patch.id,
        tempoBpm: 100,
        layerMode: "full"
      });
      const melodyScore = engine.buildScheduledScore({
        candidateId: cand.id,
        harmonyId,
        patchId: patch.id,
        tempoBpm: 100,
        layerMode: "melody-only"
      });

      const parity = engine.verifyLeadEventParity(mixScore, melodyScore);
      assert.equal(parity.identical, true, `Lead parity holds for ${cand.id} + ${patch.id}`);
      assert.equal(melodyScore.chordEvents.length, 0);
      assert.equal(melodyScore.bassEvents.length, 0);
    }
  }
});

test("Combination guard rejects unsupported settings and bounds validation rejects out-of-range inputs", () => {
  const badBareHarmony = engine.evaluateCombination({
    candidateId: "C0-original",
    harmonyId: "H1-bright-resolved",
    patchId: "P0-plan32-triangle",
    tempoBpm: 100,
    layerMode: "full"
  });
  assert.equal(badBareHarmony.supported, false);

  const badDryBacking = engine.evaluateCombination({
    candidateId: "C0-repeat2x",
    harmonyId: "H0-dry",
    patchId: "P0-plan32-triangle",
    tempoBpm: 100,
    layerMode: "backing-only"
  });
  assert.equal(badDryBacking.supported, false);

  assert.throws(() => {
    engine.buildScheduledScore({
      candidateId: "C0-repeat2x",
      harmonyId: "H0-dry",
      patchId: "P0-plan32-triangle",
      tempoBpm: 45,
      layerMode: "full"
    });
  }, /Invalid tempoBpm/);
});

test("WAV encoder/parser and manifest round-trip verification", () => {
  // Construct a synthetic stereo buffer shim to test encodePcm16Wav & parseWavHeader in Node
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

  // Test manifest round-trip
  const score = engine.buildScheduledScore({
    candidateId: "C1-period-lock",
    harmonyId: "H1-bright-resolved",
    patchId: "P1-pluck-bell",
    tempoBpm: 100,
    layerMode: "full"
  });
  const manifest = engine.createExportManifest(score, { sampleRate: 48000 }, { identical: true, count: score.leadEvents.length });
  const roundTrip = engine.validateImportedManifest(JSON.parse(JSON.stringify(manifest)));
  assert.equal(roundTrip.valid, true);
  assert.equal(roundTrip.rebuilt.leadEvents.length, score.leadEvents.length);
  assert.equal(roundTrip.rebuilt.chordEvents.length, score.chordEvents.length);
  assert.equal(roundTrip.rebuilt.bassEvents.length, score.bassEvents.length);
});
