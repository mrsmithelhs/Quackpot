/* Shared Plan 39 Web Audio scheduling, OfflineAudioContext WAV export, PCM measurement,
 * and round-trip manifest validation engine.
 * Reads score authority from QUACKPOT_PLAN39_SCORES (scores.js) and patch authority
 * from QUACKPOT_PLAN39_PATCHES (patches.js).
 *
 * Upgraded with v2 research-backed zero-sample Web Audio topologies:
 * - Synthesis modes: "marimba-fm", "rhodes-fm", "karplus-strong", "breath-ocarina"
 * - Deterministic Room Air Convolver IR (360 ms, RT60 = 0.35 s, 180 Hz highpass send)
 * - Micro-Groove pocket offsets (52.3% swing on offbeat 8ths, strum spread, articulated runs)
 * - Subtle brushed shaker pulse on beats 2 & 4
 * - Suno conditioning modes: "conditioning-skeleton" (-4 dB bass, no middle chords),
 *   "melody-octave-down" (D4–D5 neural sweet spot)
 * - Seamless loop wrap with overlap-add spillover and transparent safety limiter
 */
(function initPlan39Engine(root) {
  "use strict";

  const EXPECTED_MOTIFS_SHA256 = "3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02";
  const VALID_LAYER_MODES = [
    "full",
    "melody-only",
    "backing-only",
    "conditioning-skeleton",
    "melody-octave-down"
  ];

  function getAuthorities() {
    let scores = root.QUACKPOT_PLAN39_SCORES;
    let patches = root.QUACKPOT_PLAN39_PATCHES;
    if ((!scores || !patches) && typeof require === "function") {
      scores = scores || require("./scores.js");
      patches = patches || require("./patches.js");
    }
    if (!scores || !patches) {
      throw new Error("Plan 39 score or patch authority is not loaded.");
    }
    return { scores, patches };
  }

  function midiToHz(midi) {
    if (!Number.isFinite(midi) || midi < 0 || midi > 127) {
      throw new Error(`Invalid MIDI note number: ${midi}`);
    }
    return 440 * (2 ** ((midi - 69) / 12));
  }

  function formatDbfs(linear) {
    if (!Number.isFinite(linear) || linear <= 0) return "−∞ dBFS";
    return `${(20 * Math.log10(linear)).toFixed(1)} dBFS`;
  }

  function numericDbfs(linear) {
    if (!Number.isFinite(linear) || linear <= 0) return null;
    return Number((20 * Math.log10(linear)).toFixed(1));
  }

  function getCandidate(candidateId) {
    const { scores } = getAuthorities();
    return scores.candidates.find((c) => c.id === candidateId) || null;
  }

  function getHarmony(harmonyId) {
    const { scores } = getAuthorities();
    return scores.harmonies.find((h) => h.id === harmonyId) || null;
  }

  function getPatch(patchId) {
    const { patches } = getAuthorities();
    return patches.patches.find((p) => p.id === patchId) || null;
  }

  // =========================================================================
  // Deterministic PRNG and Cached Audio Buffers
  // =========================================================================

  function mulberry32(seed) {
    let s = (seed | 0) >>> 0;
    return function() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const noiseBufferCache = new Map();
  function getDeterministicNoiseBuffer(ctx, durationSeconds, seed = 0x1234567) {
    const sampleRate = ctx.sampleRate || 48000;
    const length = Math.max(1, Math.ceil(durationSeconds * sampleRate));
    const cacheKey = `${sampleRate}:${length}:${seed}`;
    if (noiseBufferCache.has(cacheKey)) {
      return noiseBufferCache.get(cacheKey);
    }
    const buffer = typeof ctx.createBuffer === "function"
      ? ctx.createBuffer(1, length, sampleRate)
      : {
          numberOfChannels: 1,
          length,
          sampleRate,
          _data: new Float32Array(length),
          getChannelData() { return this._data; }
        };
    const data = buffer.getChannelData(0);
    const rng = mulberry32(seed);
    for (let i = 0; i < length; i += 1) {
      data[i] = rng() * 2 - 1;
    }
    noiseBufferCache.set(cacheKey, buffer);
    return buffer;
  }

  let tubeCurveCache = null;
  function getTubeCurve() {
    if (tubeCurveCache) return tubeCurveCache;
    const n = 1024;
    const curve = new Float32Array(n);
    const dcOffset = Math.tanh(1.4 * 0.12);
    for (let i = 0; i < n; i += 1) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(1.4 * (x + 0.12)) - dcOffset;
    }
    tubeCurveCache = curve;
    return curve;
  }

  const roomAirCache = new Map();
  function getRoomAirIR(ctx) {
    const sampleRate = ctx.sampleRate || 48000;
    if (roomAirCache.has(sampleRate)) {
      return roomAirCache.get(sampleRate);
    }
    const duration = 0.24; // 240 ms compact cozy wooden room IR
    const totalFrames = Math.floor(duration * sampleRate);
    const irBuffer = typeof ctx.createBuffer === "function"
      ? ctx.createBuffer(2, totalFrames, sampleRate)
      : {
          numberOfChannels: 2,
          length: totalFrames,
          sampleRate,
          _left: new Float32Array(totalFrames),
          _right: new Float32Array(totalFrames),
          getChannelData(c) { return c === 0 ? this._left : this._right; }
        };
    const left = irBuffer.getChannelData(0);
    const right = irBuffer.getChannelData(1);

    const rng = mulberry32(0x51554143);

    // 8 early reflection taps (7–34 ms)
    const tapTimesMs = [7, 11, 15, 19, 23, 27, 31, 34];
    const tapGains = [0.8, -0.65, 0.55, -0.45, 0.38, -0.32, 0.26, -0.22];

    for (let i = 0; i < tapTimesMs.length; i += 1) {
      const frame = Math.round((tapTimesMs[i] / 1000) * sampleRate);
      if (frame < totalFrames) {
        const g = tapGains[i];
        if (i % 2 === 0) {
          left[frame] += g;
          right[frame] += g * 0.7;
        } else {
          left[frame] += g * 0.7;
          right[frame] += g;
        }
      }
    }

    // Diffuse exponential decay tail (RT60 = 0.28 s) with 1-pole lowpass damping at 2900 Hz
    const decayTau = 0.28 / 6.907755; // ln(1000)
    const lpAlpha = Math.exp(-2 * Math.PI * 2900 / sampleRate);
    let lpL = 0;
    let lpR = 0;

    for (let n = 0; n < totalFrames; n += 1) {
      const t = n / sampleRate;
      const env = Math.exp(-t / decayTau) * 0.35;
      const noiseL = (rng() * 2 - 1) * env;
      const noiseR = (rng() * 2 - 1) * env;

      lpL = noiseL * (1 - lpAlpha) + lpL * lpAlpha;
      lpR = noiseR * (1 - lpAlpha) + lpR * lpAlpha;

      left[n] += lpL;
      right[n] += lpR;
    }

    // Unit-energy normalization
    let energy = 0;
    for (let n = 0; n < totalFrames; n += 1) {
      energy += left[n] * left[n] + right[n] * right[n];
    }
    const scale = 1.0 / (Math.sqrt(energy / 2) || 1.0);
    for (let n = 0; n < totalFrames; n += 1) {
      left[n] *= scale;
      right[n] *= scale;
    }

    roomAirCache.set(sampleRate, irBuffer);
    return irBuffer;
  }

  const ksCache = new Map();
  function getKarplusStrongBuffer(ctx, f0, durationSeconds, voiceSpec) {
    const sampleRate = ctx.sampleRate || 48000;
    const totalSamples = Math.max(1, Math.ceil(durationSeconds * sampleRate));
    const cacheKey = `${sampleRate}:${Math.round(f0 * 100)}:${totalSamples}:${voiceSpec.ksDamping || 0.994}`;
    if (ksCache.has(cacheKey)) {
      return ksCache.get(cacheKey);
    }

    const periodSamples = sampleRate / f0;
    const integerDelay = Math.max(4, Math.floor(periodSamples - 0.5));
    const fractionalDelay = Math.max(0, Math.min(0.9999, (periodSamples - 0.5) - integerDelay));
    // Jaffe-Smith allpass coefficient: C = (1 - d) / (1 + d)
    const allpassC = (1 - fractionalDelay) / (1 + fractionalDelay);
    const damping = voiceSpec.ksDamping || 0.994;
    const brightness = voiceSpec.ksBrightness || 0.68;

    const buffer = typeof ctx.createBuffer === "function"
      ? ctx.createBuffer(1, totalSamples, sampleRate)
      : {
          numberOfChannels: 1,
          length: totalSamples,
          sampleRate,
          _data: new Float32Array(totalSamples),
          getChannelData() { return this._data; }
        };
    const channelData = buffer.getChannelData(0);

    const rng = mulberry32(Math.round(f0 * 1000) ^ 0x4B5354);
    const delayLine = new Float32Array(integerDelay);
    let prevExcitation = 0;
    for (let i = 0; i < integerDelay; i += 1) {
      const rawNoise = rng() * 2 - 1;
      prevExcitation = rawNoise * (1 - brightness) + prevExcitation * brightness;
      delayLine[i] = prevExcitation;
    }

    let delayIdx = 0;
    let prevLpSample = 0;
    let allpassXPrev = 0;
    let allpassYPrev = 0;

    for (let n = 0; n < totalSamples; n += 1) {
      const curSample = delayLine[delayIdx];
      channelData[n] = curSample;

      // Two-point averaging lowpass: (x[n] + x[n-1]) / 2
      const lpSample = (curSample + prevLpSample) * 0.5;
      prevLpSample = curSample;

      // Jaffe-Smith allpass fractional delay filter
      const allpassOut = allpassC * lpSample + allpassXPrev - allpassC * allpassYPrev;
      allpassXPrev = lpSample;
      allpassYPrev = allpassOut;

      delayLine[delayIdx] = allpassOut * damping;
      delayIdx = (delayIdx + 1) % integerDelay;
    }

    ksCache.set(cacheKey, buffer);
    return buffer;
  }

  // =========================================================================
  // Configuration Evaluation
  // =========================================================================

  /**
   * Checks whether a configuration combination is supported or requires a guard notice.
   */
  function evaluateCombination(config = {}) {
    const candidate = getCandidate(config.candidateId || "C0-original");
    const harmony = getHarmony(config.harmonyId || (candidate ? candidate.defaultHarmonyId : "H0-dry"));
    const patch = getPatch(config.patchId || (candidate ? candidate.defaultPatchId : "P0-plan32-triangle"));
    const tempoBpm = Number(config.tempoBpm ?? 100);
    const layerMode = config.layerMode || "full";

    if (!candidate) return { supported: false, reason: `Unknown candidate '${config.candidateId}'.` };
    if (!harmony) return { supported: false, reason: `Unknown harmony '${config.harmonyId}'.` };
    if (!patch) return { supported: false, reason: `Unknown patch '${config.patchId}'.` };
    if (!Number.isFinite(tempoBpm) || tempoBpm < 80 || tempoBpm > 132) {
      return { supported: false, reason: `Tempo ${tempoBpm} BPM is outside supported bounds [80, 132].` };
    }
    if (!VALID_LAYER_MODES.includes(layerMode)) {
      return { supported: false, reason: `Layer mode '${layerMode}' is unsupported.` };
    }

    if (candidate.lockBareControl) {
      if (harmony.id !== "H0-dry") {
        return {
          supported: false,
          reason: "C0-original is locked to H0-dry (unaccompanied) as the untouched 4.92 s historical baseline. Switch to C0-repeat2x or C1–C4 to audition harmonies."
        };
      }
      if (layerMode === "backing-only") {
        return {
          supported: false,
          reason: "C0-original has no backing tracks (dry historical control). Choose C0-repeat2x or C1–C4 with H1–H4 to audition Backing Solo."
        };
      }
      if (layerMode === "conditioning-skeleton") {
        return {
          supported: false,
          reason: "2-Voice Conditioning Skeleton requires a bass line (select H1–H4 with C0-repeat2x or C1–C4)."
        };
      }
    }

    if (harmony.id === "H0-dry") {
      if (layerMode === "backing-only") {
        return {
          supported: false,
          reason: "Backing Solo is unavailable when Harmony is set to H0-dry (Unaccompanied). Select H1, H2, or H3 to hear the accompaniment layer."
        };
      }
      if (layerMode === "conditioning-skeleton") {
        return {
          supported: false,
          reason: "2-Voice Conditioning Skeleton requires a bass line (select H1–H4 with C0-repeat2x or C1–C4)."
        };
      }
    }

    const warnings = [];
    if (tempoBpm !== 100) {
      warnings.push(`Non-canonical tempo (${tempoBpm} BPM; canonical Motif C is 100 BPM).`);
    }
    if (candidate.id === "C0-original" && patch.id !== "P0-plan32-triangle") {
      warnings.push(`Comparing C0-original with ${patch.id}; canonical Plan 32 reference uses P0-plan32-triangle.`);
    }
    if (layerMode === "melody-octave-down") {
      warnings.push("Auditioning solo lead shifted -1 octave (D4–D5 neural sweet spot for Suno melody conditioning).");
    }
    if (layerMode === "conditioning-skeleton") {
      warnings.push("Auditioning 2-Voice Conditioning Skeleton (Lead + -4 dB Bass, zero middle-register chords).");
    }
    if (config.exportProfile === "suno-conditioning") {
      warnings.push("Suno Conditioning profile active (room air, micro-groove, and shaker pulse forced dry).");
    }

    return {
      supported: true,
      reason: warnings.length ? warnings.join(" ") : "Supported configuration.",
      warnings
    };
  }

  // =========================================================================
  // Score Building
  // =========================================================================

  /**
   * Builds deterministic scheduled event lists for lead, chords, and bass.
   * Guarantees that leadEvents in "full", "melody-only", "conditioning-skeleton",
   * and "melody-octave-down" are 100% identical in MIDI metadata and timing.
   */
  function buildScheduledScore(config = {}) {
    const { scores } = getAuthorities();
    const candidateId = config.candidateId || "C0-original";
    const candidate = getCandidate(candidateId);
    if (!candidate) throw new Error(`Unknown candidateId: ${candidateId}`);

    const harmonyId = config.harmonyId || candidate.defaultHarmonyId || "H0-dry";
    const harmony = getHarmony(harmonyId);
    if (!harmony) throw new Error(`Unknown harmonyId: ${harmonyId}`);

    const patchId = config.patchId || candidate.defaultPatchId || "P0-plan32-triangle";
    const patch = getPatch(patchId);
    if (!patch) throw new Error(`Unknown patchId: ${patchId}`);

    const tempoBpm = Number(config.tempoBpm ?? scores.defaultTempoBpm);
    if (!Number.isFinite(tempoBpm) || tempoBpm < 80 || tempoBpm > 132) {
      throw new Error(`Invalid tempoBpm ${tempoBpm}; must be within [80, 132].`);
    }

    const layerMode = config.layerMode || "full";
    if (!VALID_LAYER_MODES.includes(layerMode)) {
      throw new Error(`Invalid layerMode '${layerMode}'.`);
    }

    const combination = evaluateCombination({ candidateId, harmonyId, patchId, tempoBpm, layerMode, exportProfile: config.exportProfile });
    if (!combination.supported) {
      throw new Error(combination.reason);
    }

    // Conditioning & Export Profile Options
    const exportProfile = config.exportProfile === "suno-conditioning" ? "suno-conditioning" : "game-audition";
    const useExactPlan32BarePath = Boolean(patch.isHistoricalPlan32 && harmony.id === "H0-dry");

    let roomAir = Boolean(config.roomAir);
    if (exportProfile === "suno-conditioning" || useExactPlan32BarePath) {
      roomAir = false;
    }

    let microGroove = Boolean(config.microGroove);
    if (exportProfile === "suno-conditioning" || candidate.id === "C0-original") {
      microGroove = false;
    }

    let shakerPulse = Boolean(config.shakerPulse);
    if (exportProfile === "suno-conditioning" ||
        layerMode === "melody-only" ||
        layerMode === "melody-octave-down" ||
        layerMode === "conditioning-skeleton" ||
        candidate.id === "C0-original") {
      shakerPulse = false;
    }

    const seamlessLoopWrap = Boolean(config.seamlessLoopWrap);
    const leadPitchMultiplier = layerMode === "melody-octave-down" ? 0.5 : 1.0;

    const secondsPerBeat = 60 / tempoBpm;
    const totalBeats = candidate.bars * candidate.beatsPerBar;
    const phraseSeconds = Number((totalBeats * secondsPerBeat).toFixed(6));
    const tailSeconds = Number((patch.tailSeconds || 0.12).toFixed(6));
    const durationSeconds = Number((phraseSeconds + tailSeconds).toFixed(6));

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > scores.maxDurationSeconds) {
      throw new Error(`Invalid score duration (${durationSeconds}s); must be in (0, ${scores.maxDurationSeconds}].`);
    }

    const rawGains = config.layerGains || {};
    let bassBaseGain = Number.isFinite(rawGains.bass) ? Math.max(0, Math.min(1.5, Number(rawGains.bass))) : 0.90;
    if (layerMode === "conditioning-skeleton") {
      // Prompt 3: 2-Voice Conditioning Skeleton scales bass by 0.63 (-4 dB)
      bassBaseGain = Number((bassBaseGain * 0.63).toFixed(4));
    }

    const layerGains = {
      lead: Number.isFinite(rawGains.lead) ? Math.max(0, Math.min(1.5, Number(rawGains.lead))) : 1.0,
      chords: Number.isFinite(rawGains.chords) ? Math.max(0, Math.min(1.5, Number(rawGains.chords))) : 0.85,
      bass: bassBaseGain
    };

    // 1. Canonical Lead Events (deterministic, 100% identical across all modes)
    const canonicalLeadEvents = candidate.leadEvents.map((ev, index) => {
      if (![ev.beat, ev.midi, ev.durationBeats, ev.velocity].every(Number.isFinite) ||
          ev.beat < 0 || ev.durationBeats <= 0 || ev.beat + ev.durationBeats > totalBeats + 0.0001 ||
          !Number.isInteger(ev.midi) || ev.midi < 0 || ev.midi > 127 || ev.velocity <= 0 || ev.velocity > 1) {
        throw new Error(`Invalid lead event at index ${index} in candidate ${candidateId}.`);
      }
      return Object.freeze({
        track: "lead",
        index,
        beat: Number(ev.beat.toFixed(4)),
        startSeconds: Number((ev.beat * secondsPerBeat).toFixed(6)),
        durationBeats: Number(ev.durationBeats.toFixed(4)),
        durationSeconds: Number((ev.durationBeats * secondsPerBeat).toFixed(6)),
        midi: ev.midi,
        frequencyHz: Number(midiToHz(ev.midi).toFixed(4)),
        velocity: ev.velocity,
        section: ev.section || "lead",
        isExactAnchor: Boolean(ev.isExactAnchor)
      });
    });

    // 2. Canonical Chord & Counter Events (for 4-bar or 8-bar candidates)
    const rawChordSource = candidate.bars === 4 ? (harmony.chords4 || []) : (harmony.chords8 || []);
    const rawCounterSource = candidate.bars === 4 ? (harmony.counter4 || []) : (harmony.counter8 || []);
    const canonicalChordEvents = [];

    rawChordSource.forEach((chordBlock) => {
      if (chordBlock.beat >= totalBeats) return;
      const clippedDuration = Math.min(chordBlock.durationBeats, totalBeats - chordBlock.beat);
      for (const midi of chordBlock.midis) {
        canonicalChordEvents.push(Object.freeze({
          track: "chords",
          role: "pad",
          beat: Number(chordBlock.beat.toFixed(4)),
          startSeconds: Number((chordBlock.beat * secondsPerBeat).toFixed(6)),
          durationBeats: Number(clippedDuration.toFixed(4)),
          durationSeconds: Number((clippedDuration * secondsPerBeat).toFixed(6)),
          midi,
          frequencyHz: Number(midiToHz(midi).toFixed(4)),
          velocity: chordBlock.velocity,
          section: "harmony-chords"
        }));
      }
    });

    rawCounterSource.forEach((counterNote) => {
      if (counterNote.beat >= totalBeats) return;
      const clippedDuration = Math.min(counterNote.durationBeats, totalBeats - counterNote.beat);
      canonicalChordEvents.push(Object.freeze({
        track: "chords",
        role: "counter",
        beat: Number(counterNote.beat.toFixed(4)),
        startSeconds: Number((counterNote.beat * secondsPerBeat).toFixed(6)),
        durationBeats: Number(clippedDuration.toFixed(4)),
        durationSeconds: Number((clippedDuration * secondsPerBeat).toFixed(6)),
        midi: counterNote.midi,
        frequencyHz: Number(midiToHz(counterNote.midi).toFixed(4)),
        velocity: counterNote.velocity,
        section: "harmony-counter"
      }));
    });

    // 3. Canonical Bass Events
    const rawBassSource = candidate.bars === 4 ? (harmony.bass4 || []) : (harmony.bass8 || []);
    const canonicalBassEvents = rawBassSource
      .filter((b) => b.beat < totalBeats)
      .map((b, index) => {
        const clippedDuration = Math.min(b.durationBeats, totalBeats - b.beat);
        return Object.freeze({
          track: "bass",
          index,
          beat: Number(b.beat.toFixed(4)),
          startSeconds: Number((b.beat * secondsPerBeat).toFixed(6)),
          durationBeats: Number(clippedDuration.toFixed(4)),
          durationSeconds: Number((clippedDuration * secondsPerBeat).toFixed(6)),
          midi: b.midi,
          frequencyHz: Number(midiToHz(b.midi).toFixed(4)),
          velocity: b.velocity,
          section: "bass"
        });
      });

    let activeLead = [];
    let activeChords = [];
    let activeBass = [];

    if (layerMode === "full") {
      activeLead = canonicalLeadEvents;
      activeChords = canonicalChordEvents;
      activeBass = canonicalBassEvents;
    } else if (layerMode === "melody-only" || layerMode === "melody-octave-down") {
      activeLead = canonicalLeadEvents;
      activeChords = [];
      activeBass = [];
    } else if (layerMode === "backing-only") {
      activeLead = [];
      activeChords = canonicalChordEvents;
      activeBass = canonicalBassEvents;
    } else if (layerMode === "conditioning-skeleton") {
      activeLead = canonicalLeadEvents;
      activeChords = [];
      activeBass = canonicalBassEvents;
    }

    return Object.freeze({
      schemaVersion: 1,
      candidateId: candidate.id,
      candidateTitle: candidate.title,
      parentAnchor: candidate.parentAnchor,
      harmonyId: harmony.id,
      harmonyName: harmony.name,
      patchId: patch.id,
      patchName: patch.name,
      tempoBpm,
      bars: candidate.bars,
      beatsPerBar: candidate.beatsPerBar,
      totalBeats,
      secondsPerBeat: Number(secondsPerBeat.toFixed(6)),
      phraseSeconds,
      tailSeconds,
      durationSeconds,
      sampleRate: patch.sampleRate || 48000,
      layerMode,
      layerGains: Object.freeze(layerGains),
      seed: config.seed ?? "deterministic-v1",
      sections: candidate.sections,
      exportProfile,
      roomAir,
      microGroove,
      shakerPulse,
      seamlessLoopWrap,
      leadPitchMultiplier,
      leadEvents: Object.freeze(activeLead),
      chordEvents: Object.freeze(activeChords),
      bassEvents: Object.freeze(activeBass),
      canonicalLeadEvents: Object.freeze(canonicalLeadEvents),
      canonicalChordEvents: Object.freeze(canonicalChordEvents),
      canonicalBassEvents: Object.freeze(canonicalBassEvents)
    });
  }

  /**
   * Verifies that two scheduled scores have 100% identical scheduled lead events.
   */
  function verifyLeadEventParity(mixScore, melodyOnlyScore) {
    if (!mixScore || !melodyOnlyScore) {
      return { identical: false, count: 0, reason: "Missing score input." };
    }
    const a = mixScore.leadEvents;
    const b = melodyOnlyScore.leadEvents;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
      return { identical: false, count: 0, reason: `Lead event length mismatch (${a?.length} vs ${b?.length}).` };
    }
    for (let i = 0; i < a.length; i += 1) {
      const evA = a[i];
      const evB = b[i];
      if (evA.beat !== evB.beat ||
          evA.startSeconds !== evB.startSeconds ||
          evA.durationBeats !== evB.durationBeats ||
          evA.durationSeconds !== evB.durationSeconds ||
          evA.midi !== evB.midi ||
          evA.frequencyHz !== evB.frequencyHz ||
          evA.velocity !== evB.velocity ||
          evA.isExactAnchor !== evB.isExactAnchor) {
        return { identical: false, count: i, reason: `Lead event mismatch at index ${i}.` };
      }
    }
    return {
      identical: true,
      count: a.length,
      reason: `Verified ${a.length} scheduled lead events match identically between Full Mix and Melody-Only.`
    };
  }

  // =========================================================================
  // Web Audio Graph Scheduling
  // =========================================================================

  /**
   * Schedules a resolved score onto either a live AudioContext or an OfflineAudioContext.
   */
  function scheduleOnAudioContext(ctx, scheduledScore, patchOverride = null, options = {}) {
    if (!ctx) throw new Error("scheduleOnAudioContext requires an AudioContext or OfflineAudioContext.");
    const patch = patchOverride || getPatch(scheduledScore.patchId);
    if (!patch) throw new Error(`Patch not found: ${scheduledScore.patchId}`);

    const baseTime = typeof options.baseTime === "number" ? options.baseTime : ctx.currentTime;
    const masterGainValue = typeof options.masterGain === "number"
      ? Math.max(0, Math.min(1.0, options.masterGain))
      : patch.masterGain;

    const createdNodes = [];
    const createdOscillators = [];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterGainValue, baseTime);
    masterGain.connect(ctx.destination);
    createdNodes.push(masterGain);

    // Room Air Convolver Send & Return Bus
    let reverbSendBus = null;
    if (scheduledScore.roomAir && typeof ctx.createConvolver === "function") {
      const convolver = ctx.createConvolver();
      convolver.normalize = false;
      convolver.buffer = getRoomAirIR(ctx);

      const reverbHighpass = ctx.createBiquadFilter();
      reverbHighpass.type = "highpass";
      reverbHighpass.frequency.setValueAtTime(180, baseTime);

      const wetGain = ctx.createGain();
      wetGain.gain.setValueAtTime(0.15, baseTime);

      reverbHighpass.connect(convolver);
      convolver.connect(wetGain);
      wetGain.connect(masterGain);

      reverbSendBus = ctx.createGain();
      reverbSendBus.gain.setValueAtTime(1.0, baseTime);
      reverbSendBus.connect(reverbHighpass);

      createdNodes.push(convolver, reverbHighpass, wetGain, reverbSendBus);
    }

    // Exact Plan 32 bare triangle path when P0-plan32-triangle is used dry without roomAir/microGroove
    const useExactPlan32BarePath = Boolean(
      patch.isHistoricalPlan32 &&
      scheduledScore.harmonyId === "H0-dry" &&
      !scheduledScore.roomAir &&
      !scheduledScore.microGroove
    );

    // Shared track buses (eliminates hundreds of redundant per-note panners, waveshapers, and static filters)
    function createTrackBus(voiceSpec, trackRole) {
      if (useExactPlan32BarePath) return masterGain;
      let busHead = masterGain;

      if (typeof ctx.createStereoPanner === "function" && voiceSpec.pan) {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(voiceSpec.pan, baseTime);
        panner.connect(masterGain);
        if (reverbSendBus && trackRole !== "bass") panner.connect(reverbSendBus);
        createdNodes.push(panner);
        busHead = panner;
      } else if (reverbSendBus && trackRole !== "bass") {
        const sendSplitter = ctx.createGain();
        sendSplitter.gain.setValueAtTime(1.0, baseTime);
        sendSplitter.connect(masterGain);
        sendSplitter.connect(reverbSendBus);
        createdNodes.push(sendSplitter);
        busHead = sendSplitter;
      }

      // Shared static lowpass filter for chords/bass or lead voices without per-note filter envelope
      const hasPerNoteFilterEnv = Boolean(trackRole === "lead" && voiceSpec.filterPeakHz && voiceSpec.filterDecaySeconds);
      if (voiceSpec.filterCutoffHz && !hasPerNoteFilterEnv && typeof ctx.createBiquadFilter === "function") {
        const busFilter = ctx.createBiquadFilter();
        busFilter.type = "lowpass";
        busFilter.frequency.setValueAtTime(voiceSpec.filterCutoffHz, baseTime);
        busFilter.Q.setValueAtTime(voiceSpec.filterQ || 0.7, baseTime);
        busFilter.connect(busHead);
        createdNodes.push(busFilter);
        busHead = busFilter;
      }

      // Shared 220 Hz wooden body formant filter for Karplus-Strong acoustic pluck
      if (voiceSpec.synthesisMode === "karplus-strong" && typeof ctx.createBiquadFilter === "function") {
        const bodyFormant = ctx.createBiquadFilter();
        bodyFormant.type = "peaking";
        bodyFormant.frequency.setValueAtTime(220, baseTime);
        bodyFormant.gain.setValueAtTime(3.0, baseTime);
        bodyFormant.Q.setValueAtTime(1.2, baseTime);
        bodyFormant.connect(busHead);
        createdNodes.push(bodyFormant);
        busHead = bodyFormant;
      }

      // Shared Tube WaveShaper on the track bus
      if (voiceSpec.useTubeShaper && typeof ctx.createWaveShaper === "function") {
        const shaper = ctx.createWaveShaper();
        shaper.curve = getTubeCurve();
        shaper.oversample = "none";
        shaper.connect(busHead);
        createdNodes.push(shaper);
        busHead = shaper;
      }

      return busHead;
    }

    const trackBuses = {
      lead: createTrackBus(patch.lead, "lead"),
      chords: createTrackBus(patch.chords, "chords"),
      bass: createTrackBus(patch.bass, "bass")
    };

    function scheduleVoice(event, voiceSpec, busGainMultiplier, trackRole) {
      let startOffset = 0;
      if (scheduledScore.microGroove) {
        const beatFract = event.beat % 1;
        if (Math.abs(beatFract - 0.5) < 0.05) {
          startOffset += 0.014; // 52.3% swing on offbeat 8ths
        } else if (trackRole === "lead" && Math.abs(beatFract) < 0.05) {
          startOffset += 0.008; // pocket offset on downbeats
        }
        if (event.role === "pad") {
          startOffset += (event.midi % 12) * 0.0015; // gentle guitar/keys strum spread
        }
      }

      const start = baseTime + event.startSeconds + startOffset;
      let noteLength = event.durationSeconds;
      if (scheduledScore.microGroove && trackRole === "lead" && event.durationBeats <= 0.55) {
        noteLength = event.durationSeconds * 0.82; // articulate 8th note runs
      }

      const releaseSeconds = voiceSpec.releaseSeconds || 0.09;
      const releaseStart = start + noteLength;
      const end = releaseStart + releaseSeconds;

      const pitchMultiplier = (trackRole === "lead") ? (scheduledScore.leadPitchMultiplier || 1.0) : 1.0;
      const f0 = event.frequencyHz * pitchMultiplier;

      const maxGain = voiceSpec.voicePeak * event.velocity * busGainMultiplier;
      const sustainGain = Math.max(0.00001, maxGain * (voiceSpec.sustainRatio ?? 0.22));

      if (useExactPlan32BarePath) {
        const voice = ctx.createOscillator();
        const envelope = ctx.createGain();
        voice.type = voiceSpec.waveform || "triangle";
        voice.frequency.setValueAtTime(f0, start);

        envelope.gain.setValueAtTime(0.00001, start);
        envelope.gain.linearRampToValueAtTime(maxGain, start + voiceSpec.attackSeconds);
        envelope.gain.linearRampToValueAtTime(sustainGain, start + voiceSpec.attackSeconds + voiceSpec.decaySeconds);
        envelope.gain.setValueAtTime(sustainGain, releaseStart);
        envelope.gain.linearRampToValueAtTime(0.00001, end);

        voice.connect(envelope);
        envelope.connect(masterGain);
        voice.start(start);
        voice.stop(end);
        createdOscillators.push(voice);
        createdNodes.push(voice, envelope);
        return;
      }

      // Standard / Research envelope connected to shared trackBus
      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0.00001, start);
      envelope.gain.linearRampToValueAtTime(maxGain, start + (voiceSpec.attackSeconds || 0.008));
      envelope.gain.linearRampToValueAtTime(
        sustainGain,
        start + (voiceSpec.attackSeconds || 0.008) + (voiceSpec.decaySeconds || 0.12)
      );
      envelope.gain.setValueAtTime(sustainGain, releaseStart);
      envelope.gain.linearRampToValueAtTime(0.00001, end);
      envelope.connect(trackBuses[trackRole] || masterGain);
      createdNodes.push(envelope);

      // Per-note dynamic lowpass filter only for lead voices with filterPeakHz sweep
      let voiceTarget = envelope;
      if (trackRole === "lead" && voiceSpec.filterCutoffHz && voiceSpec.filterPeakHz && voiceSpec.filterDecaySeconds && typeof ctx.createBiquadFilter === "function") {
        const filterNode = ctx.createBiquadFilter();
        filterNode.type = "lowpass";
        filterNode.Q.setValueAtTime(voiceSpec.filterQ || 0.7, start);
        filterNode.frequency.setValueAtTime(voiceSpec.filterPeakHz, start);
        filterNode.frequency.exponentialRampToValueAtTime(
          Math.max(80, voiceSpec.filterCutoffHz),
          start + voiceSpec.filterDecaySeconds
        );
        filterNode.connect(envelope);
        voiceTarget = filterNode;
        createdNodes.push(filterNode);
      }

      // -----------------------------------------------------------------------
      // Specific Synthesis Topologies
      // -----------------------------------------------------------------------

      if (voiceSpec.synthesisMode === "marimba-fm") {
        // P4: Marimba FM Carrier + Modulator + Wood Mode + Mallet Click
        const primary = ctx.createOscillator();
        primary.type = "sine";
        primary.frequency.setValueAtTime(f0, start);

        // 1:4 second-octave FM modulator
        const fmMod = ctx.createOscillator();
        fmMod.type = "sine";
        fmMod.frequency.setValueAtTime((voiceSpec.fmRatio || 4.0) * f0, start);
        const fmGain = ctx.createGain();
        const initialFmDepth = f0 * (voiceSpec.fmIndex || 1.1);
        fmGain.gain.setValueAtTime(initialFmDepth, start);
        fmGain.gain.exponentialRampToValueAtTime(0.01, start + (voiceSpec.fmDecaySeconds || 0.024));
        fmMod.connect(fmGain);
        fmGain.connect(primary.frequency);
        fmMod.start(start);
        fmMod.stop(start + (voiceSpec.fmDecaySeconds || 0.024) + 0.01);
        createdOscillators.push(fmMod);
        createdNodes.push(fmMod, fmGain);

        // 3.92x warm wood mode
        if (voiceSpec.woodModeRatio && voiceSpec.woodModeGain > 0) {
          const woodOsc = ctx.createOscillator();
          woodOsc.type = "sine";
          woodOsc.frequency.setValueAtTime(voiceSpec.woodModeRatio * f0, start);
          const woodGain = ctx.createGain();
          woodGain.gain.setValueAtTime(voiceSpec.woodModeGain * maxGain, start);
          woodGain.gain.exponentialRampToValueAtTime(0.00001, start + 0.045);
          woodOsc.connect(woodGain);
          woodGain.connect(voiceTarget);
          woodOsc.start(start);
          woodOsc.stop(start + 0.05);
          createdOscillators.push(woodOsc);
          createdNodes.push(woodOsc, woodGain);
        }

        // 8 ms bandpassed mallet click
        if (typeof ctx.createBufferSource === "function") {
          const malletBuf = getDeterministicNoiseBuffer(ctx, 0.010, 0x4D414C4C ^ Math.round(f0));
          const malletSource = ctx.createBufferSource();
          malletSource.buffer = malletBuf;
          const malletFilter = ctx.createBiquadFilter();
          malletFilter.type = "bandpass";
          malletFilter.frequency.setValueAtTime(voiceSpec.malletBandpassHz || 2500, start);
          malletFilter.Q.setValueAtTime(2.0, start);
          const malletGain = ctx.createGain();
          malletGain.gain.setValueAtTime((voiceSpec.malletGain || 0.14) * maxGain, start);
          malletGain.gain.exponentialRampToValueAtTime(0.00001, start + 0.008);
          malletSource.connect(malletFilter);
          malletFilter.connect(malletGain);
          malletGain.connect(voiceTarget);
          malletSource.start(start);
          malletSource.stop(start + 0.010);
          createdOscillators.push(malletSource);
          createdNodes.push(malletSource, malletFilter, malletGain);
        }

        primary.connect(voiceTarget);
        primary.start(start);
        primary.stop(end);
        createdOscillators.push(primary);
        createdNodes.push(primary);
        return;
      }

      if (voiceSpec.synthesisMode === "rhodes-fm") {
        // P5: Rhodes EP (1:1 body FM + 14:1 metallic tine FM on lead)
        const primary = ctx.createOscillator();
        primary.type = "sine";
        primary.frequency.setValueAtTime(f0, start);
        if (voiceSpec.detuneCents && primary.detune) {
          primary.detune.setValueAtTime(voiceSpec.detuneCents, start);
        }

        // 1:1 body FM modulator
        const bodyMod = ctx.createOscillator();
        bodyMod.type = "sine";
        bodyMod.frequency.setValueAtTime(f0 * (voiceSpec.bodyFmRatio || 1.0), start);
        const bodyGain = ctx.createGain();
        const bodyDepth = f0 * (voiceSpec.bodyFmIndex || 0.65);
        bodyGain.gain.setValueAtTime(bodyDepth, start);
        bodyGain.gain.exponentialRampToValueAtTime(0.01, start + (voiceSpec.bodyFmDecaySeconds || 0.32));
        bodyMod.connect(bodyGain);
        bodyGain.connect(primary.frequency);
        bodyMod.start(start);
        bodyMod.stop(start + (voiceSpec.bodyFmDecaySeconds || 0.32) + 0.01);
        createdOscillators.push(bodyMod);
        createdNodes.push(bodyMod, bodyGain);

        // 14:1 metallic tine FM modulator on lead voices
        if (trackRole === "lead") {
          const tineMod = ctx.createOscillator();
          tineMod.type = "sine";
          tineMod.frequency.setValueAtTime(f0 * (voiceSpec.tineFmRatio || 14.0), start);
          const tineGain = ctx.createGain();
          const tineAttenuation = Math.pow(0.5, Math.max(0, event.midi - 68) / 12);
          const tineDepth = f0 * (voiceSpec.tineFmIndex || 0.35) * tineAttenuation;
          tineGain.gain.setValueAtTime(Math.max(0.01, tineDepth), start);
          tineGain.gain.exponentialRampToValueAtTime(0.01, start + (voiceSpec.tineFmDecaySeconds || 0.028));
          tineMod.connect(tineGain);
          tineGain.connect(primary.frequency);
          tineMod.start(start);
          tineMod.stop(start + (voiceSpec.tineFmDecaySeconds || 0.028) + 0.01);
          createdOscillators.push(tineMod);
          createdNodes.push(tineMod, tineGain);
        }

        primary.connect(voiceTarget);
        primary.start(start);
        primary.stop(end);
        createdOscillators.push(primary);
        createdNodes.push(primary);
        return;
      }

      if (voiceSpec.synthesisMode === "karplus-strong" && typeof ctx.createBufferSource === "function") {
        // P6: Pre-computed Karplus-Strong string waveguide routed through shared 220 Hz body formant bus
        const ksBuf = getKarplusStrongBuffer(ctx, f0, noteLength + releaseSeconds, voiceSpec);
        const ksSource = ctx.createBufferSource();
        ksSource.buffer = ksBuf;
        ksSource.connect(voiceTarget);
        ksSource.start(start);
        ksSource.stop(end);
        createdOscillators.push(ksSource);
        createdNodes.push(ksSource);
        return;
      }

      if (voiceSpec.synthesisMode === "breath-ocarina") {
        // P7: Sweet Breath Ocarina with Helmholtz PeriodicWave, pitch scoop, chiff, & vibrato
        const primary = ctx.createOscillator();
        if (typeof ctx.createPeriodicWave === "function" && Array.isArray(voiceSpec.periodicImag)) {
          const imag = new Float32Array(voiceSpec.periodicImag);
          const real = new Float32Array(imag.length);
          const wave = ctx.createPeriodicWave(real, imag);
          primary.setPeriodicWave(wave);
        } else {
          primary.type = voiceSpec.waveform || "sine";
        }

        // Pitch scoop (-15 cents for 25 ms) in game audition profile
        if (scheduledScore.exportProfile !== "suno-conditioning") {
          const scoopedF0 = f0 * Math.pow(2, (voiceSpec.scoopCents || -15) / 1200);
          primary.frequency.setValueAtTime(scoopedF0, start);
          primary.frequency.linearRampToValueAtTime(f0, start + (voiceSpec.scoopSeconds || 0.025));
        } else {
          primary.frequency.setValueAtTime(f0, start);
        }

        // 20 ms breath chiff noise burst
        if (scheduledScore.exportProfile !== "suno-conditioning" && typeof ctx.createBufferSource === "function") {
          const chiffBuf = getDeterministicNoiseBuffer(ctx, 0.025, 0x4F434152 ^ Math.round(f0));
          const chiffSource = ctx.createBufferSource();
          chiffSource.buffer = chiffBuf;
          const chiffFilter = ctx.createBiquadFilter();
          chiffFilter.type = "bandpass";
          chiffFilter.frequency.setValueAtTime(Math.min(8000, 3 * f0), start);
          chiffFilter.Q.setValueAtTime(3.0, start);
          const chiffGain = ctx.createGain();
          chiffGain.gain.setValueAtTime((voiceSpec.chiffGain || 0.09) * maxGain, start);
          chiffGain.gain.exponentialRampToValueAtTime(0.00001, start + (voiceSpec.chiffDurationMs ? voiceSpec.chiffDurationMs / 1000 : 0.020));
          chiffSource.connect(chiffFilter);
          chiffFilter.connect(chiffGain);
          chiffGain.connect(voiceTarget);
          chiffSource.start(start);
          chiffSource.stop(start + 0.025);
          createdOscillators.push(chiffSource);
          createdNodes.push(chiffSource, chiffFilter, chiffGain);
        }

        // Delayed 5.2 Hz vibrato on sustained notes (>= 0.45s)
        if (scheduledScore.exportProfile !== "suno-conditioning" && noteLength >= 0.45) {
          const lfo = ctx.createOscillator();
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(voiceSpec.vibratoRateHz || 5.2, start);
          const lfoGain = ctx.createGain();
          const vibratoDepthHz = f0 * (Math.pow(2, (voiceSpec.vibratoDepthCents || 10) / 1200) - 1);
          const vibratoDelay = voiceSpec.vibratoDelaySeconds || 0.25;
          const vibratoRamp = voiceSpec.vibratoRampSeconds || 0.30;
          lfoGain.gain.setValueAtTime(0.0001, start);
          lfoGain.gain.setValueAtTime(0.0001, start + vibratoDelay);
          lfoGain.gain.linearRampToValueAtTime(vibratoDepthHz, start + vibratoDelay + vibratoRamp);
          lfo.connect(lfoGain);
          lfoGain.connect(primary.frequency);
          lfo.start(start);
          lfo.stop(end);
          createdOscillators.push(lfo);
          createdNodes.push(lfo, lfoGain);
        }

        primary.connect(voiceTarget);
        primary.start(start);
        primary.stop(end);
        createdOscillators.push(primary);
        createdNodes.push(primary);
        return;
      }

      // Default Subtractive / Overtone Voice
      const primary = ctx.createOscillator();
      primary.type = voiceSpec.waveform || "triangle";
      primary.frequency.setValueAtTime(f0, start);
      if (voiceSpec.detuneCents && primary.detune) {
        primary.detune.setValueAtTime(voiceSpec.detuneCents, start);
      }
      primary.connect(voiceTarget);
      primary.start(start);
      primary.stop(end);
      createdOscillators.push(primary);
      createdNodes.push(primary);

      if (voiceSpec.overtoneWaveform && voiceSpec.overtoneGain > 0) {
        const overtone = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtone.type = voiceSpec.overtoneWaveform;
        overtone.frequency.setValueAtTime(f0 * (voiceSpec.overtoneRatio || 2), start);
        if (voiceSpec.detuneCents && overtone.detune) {
          overtone.detune.setValueAtTime(-voiceSpec.detuneCents, start);
        }
        overtoneGain.gain.setValueAtTime(voiceSpec.overtoneGain, start);
        overtone.connect(overtoneGain);
        overtoneGain.connect(voiceTarget);
        overtone.start(start);
        overtone.stop(end);
        createdOscillators.push(overtone);
        createdNodes.push(overtone, overtoneGain);
      }
    }

    // Schedule active layers
    for (const ev of scheduledScore.leadEvents) {
      scheduleVoice(ev, patch.lead, scheduledScore.layerGains.lead, "lead");
    }
    for (const ev of scheduledScore.chordEvents) {
      const boost = ev.role === "counter" ? 1.15 : 1.0;
      scheduleVoice(ev, patch.chords, scheduledScore.layerGains.chords * boost, "chords");
    }
    for (const ev of scheduledScore.bassEvents) {
      scheduleVoice(ev, patch.bass, scheduledScore.layerGains.bass, "bass");
    }

    // Schedule brushed noise shaker pulse on beats 2 and 4 (beats 1, 3, 5, 7...)
    if (scheduledScore.shakerPulse && typeof ctx.createBufferSource === "function") {
      for (let b = 1; b < scheduledScore.totalBeats; b += 2) {
        const shakerTime = baseTime + b * scheduledScore.secondsPerBeat;
        const shakerBuf = getDeterministicNoiseBuffer(ctx, 0.045, 0x5348414B ^ b);
        const shakerSource = ctx.createBufferSource();
        shakerSource.buffer = shakerBuf;

        const shakerFilter = ctx.createBiquadFilter();
        shakerFilter.type = "bandpass";
        shakerFilter.frequency.setValueAtTime(5800, shakerTime);
        shakerFilter.Q.setValueAtTime(1.5, shakerTime);

        const shakerGain = ctx.createGain();
        shakerGain.gain.setValueAtTime(0.00001, shakerTime);
        shakerGain.gain.linearRampToValueAtTime(0.032, shakerTime + 0.014); // 14ms attack
        shakerGain.gain.exponentialRampToValueAtTime(0.00001, shakerTime + 0.014 + 0.026); // 26ms decay

        shakerSource.connect(shakerFilter);
        shakerFilter.connect(shakerGain);
        shakerGain.connect(masterGain);
        if (reverbSendBus) shakerGain.connect(reverbSendBus);

        shakerSource.start(shakerTime);
        shakerSource.stop(shakerTime + 0.045);

        createdOscillators.push(shakerSource);
        createdNodes.push(shakerSource, shakerFilter, shakerGain);
      }
    }

    return {
      nodeCount: createdNodes.length,
      oscillatorCount: createdOscillators.length,
      stopAll() {
        for (const osc of createdOscillators) {
          try { osc.stop(); } catch (_) {}
          try { osc.disconnect(); } catch (_) {}
        }
        createdOscillators.length = 0;
        for (const node of createdNodes) {
          try { node.disconnect(); } catch (_) {}
        }
        createdNodes.length = 0;
      }
    };
  }

  // =========================================================================
  // PCM Measurement & WAV Encoding
  // =========================================================================

  function measurePcm(buffer) {
    let peak = 0;
    let sumSquares = 0;
    let count = 0;
    let clippedSamples = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch += 1) {
      const samples = buffer.getChannelData(ch);
      for (let i = 0; i < samples.length; i += 1) {
        const v = samples[i];
        if (!Number.isFinite(v)) {
          throw new Error(`Offline render produced a non-finite PCM sample at channel ${ch}, frame ${i}.`);
        }
        const mag = Math.abs(v);
        if (mag > peak) peak = mag;
        if (mag >= 1.0) clippedSamples += 1;
        sumSquares += v * v;
        count += 1;
      }
    }
    const rms = Math.sqrt(sumSquares / Math.max(count, 1));
    return Object.freeze({
      peak: Number(peak.toFixed(6)),
      rms: Number(rms.toFixed(6)),
      samplePeakDbfs: numericDbfs(peak),
      rmsDbfs: numericDbfs(rms),
      clippedSamples,
      isClipped: clippedSamples > 0,
      measurementBasis: "float32 OfflineAudioContext render samples before PCM16 quantization; PCM sample peak and RMS only; not LUFS or true peak"
    });
  }

  function encodePcm16Wav(buffer) {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const frames = buffer.length;
    const bytesPerSample = 2;
    const dataBytes = frames * channels * bytesPerSample;
    const arrayBuffer = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(arrayBuffer);

    function writeAscii(offset, text) {
      for (let i = 0; i < text.length; i += 1) {
        view.setUint8(offset + i, text.charCodeAt(i));
      }
    }

    writeAscii(0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeAscii(8, "WAVE");
    writeAscii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bytesPerSample, true);
    view.setUint16(32, channels * bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeAscii(36, "data");
    view.setUint32(40, dataBytes, true);

    let offset = 44;
    for (let frame = 0; frame < frames; frame += 1) {
      for (let ch = 0; ch < channels; ch += 1) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[frame]));
        const quantized = sample < 0 ? sample * 32768 : sample * 32767;
        view.setInt16(offset, Math.round(quantized), true);
        offset += bytesPerSample;
      }
    }

    const blob = typeof Blob !== "undefined" ? new Blob([arrayBuffer], { type: "audio/wav" }) : null;
    return {
      arrayBuffer,
      blob,
      byteLength: arrayBuffer.byteLength,
      dataBytes,
      channels,
      sampleRate,
      frames
    };
  }

  function parseWavHeader(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 44) {
      throw new Error("WAV buffer is smaller than 44-byte RIFF header.");
    }
    const view = new DataView(arrayBuffer);
    const readAscii = (offset, len) => {
      let out = "";
      for (let i = 0; i < len; i += 1) out += String.fromCharCode(view.getUint8(offset + i));
      return out;
    };
    const riff = readAscii(0, 4);
    const chunkSize = view.getUint32(4, true);
    const wave = readAscii(8, 4);
    const fmt = readAscii(12, 4);
    const fmtSize = view.getUint32(16, true);
    const audioFormat = view.getUint16(20, true);
    const channels = view.getUint16(22, true);
    const sampleRate = view.getUint32(24, true);
    const byteRate = view.getUint32(28, true);
    const blockAlign = view.getUint16(32, true);
    const bitsPerSample = view.getUint16(34, true);
    const dataTag = readAscii(36, 4);
    const dataBytes = view.getUint32(40, true);

    if (riff !== "RIFF" || wave !== "WAVE" || fmt !== "fmt " || dataTag !== "data") {
      throw new Error("Invalid RIFF/WAVE header tags.");
    }
    if (audioFormat !== 1 || bitsPerSample !== 16) {
      throw new Error(`Expected PCM16 format (got format=${audioFormat}, bits=${bitsPerSample}).`);
    }
    if (dataBytes !== arrayBuffer.byteLength - 44 || chunkSize !== 36 + dataBytes) {
      throw new Error("WAV byte length does not match header chunk sizes.");
    }
    const frames = dataBytes / (channels * 2);
    return Object.freeze({
      valid: true,
      channels,
      sampleRate,
      bitsPerSample,
      byteRate,
      blockAlign,
      dataBytes,
      frames,
      durationSeconds: Number((frames / sampleRate).toFixed(4))
    });
  }

  // =========================================================================
  // Offline Rendering
  // =========================================================================

  let offlineRenderBusy = false;

  async function renderOfflineWav(scheduledScore, options = {}) {
    if (offlineRenderBusy) {
      throw new Error("Another offline WAV render is currently in progress. Wait for it to finish.");
    }
    if (typeof OfflineAudioContext !== "function") {
      throw new Error("OfflineAudioContext is unavailable in this environment.");
    }
    const patch = getPatch(scheduledScore.patchId);
    if (!patch) throw new Error(`Unknown patch ${scheduledScore.patchId}`);

    const sampleRate = patch.sampleRate || 48000;
    const frameCount = Math.ceil(Number((scheduledScore.durationSeconds * sampleRate).toFixed(6)));
    if (!Number.isFinite(frameCount) || frameCount < 1 || frameCount > sampleRate * 60) {
      throw new Error(`Offline frame count (${frameCount}) exceeds the 60-second bound.`);
    }

    offlineRenderBusy = true;
    let timer = null;
    try {
      const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
      const context = new OfflineAudioContext(2, frameCount, sampleRate);
      scheduleOnAudioContext(context, scheduledScore, patch, { baseTime: 0 });

      const rendering = context.startRendering();
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("Offline render exceeded its 8-second timeout bound."));
        }, 8000);
      });
      let renderedBuffer = await Promise.race([rendering, deadline]);

      // Seamless Loop Wrap: overlap-add spillover tail onto beginning of phrase
      if (scheduledScore.seamlessLoopWrap) {
        const phraseFrames = Math.round(Number((scheduledScore.phraseSeconds * sampleRate).toFixed(6)));
        const spilloverFrames = renderedBuffer.length - phraseFrames;
        const wrappedBuffer = typeof context.createBuffer === "function"
          ? context.createBuffer(renderedBuffer.numberOfChannels, phraseFrames, sampleRate)
          : {
              numberOfChannels: renderedBuffer.numberOfChannels,
              length: phraseFrames,
              sampleRate,
              _left: new Float32Array(phraseFrames),
              _right: new Float32Array(phraseFrames),
              getChannelData(c) { return c === 0 ? this._left : this._right; }
            };

        for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch += 1) {
          const orig = renderedBuffer.getChannelData(ch);
          const target = wrappedBuffer.getChannelData(ch);
          for (let i = 0; i < phraseFrames; i += 1) {
            target[i] = orig[i];
          }
          for (let i = 0; i < spilloverFrames && i < phraseFrames; i += 1) {
            target[i] += orig[phraseFrames + i];
          }
        }
        renderedBuffer = wrappedBuffer;
      }

      // Transparent safety limiter: if peak exceeds 0.95, scale down to 0.92 to guarantee peak < 0.98 and zero clipping
      let measured = measurePcm(renderedBuffer);
      if (measured.peak > 0.95) {
        const safetyScale = 0.92 / measured.peak;
        for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch += 1) {
          const data = renderedBuffer.getChannelData(ch);
          for (let i = 0; i < data.length; i += 1) {
            data[i] *= safetyScale;
          }
        }
        measured = measurePcm(renderedBuffer);
      }

      if (measured.isClipped) {
        throw new Error(`Offline render clipped (${measured.clippedSamples} samples >= 0 dBFS).`);
      }

      const wav = encodePcm16Wav(renderedBuffer);
      const elapsedMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
      return {
        wav,
        measured,
        frameCount: renderedBuffer.length,
        sampleRate: renderedBuffer.sampleRate,
        channels: renderedBuffer.numberOfChannels,
        durationSeconds: Number((renderedBuffer.length / renderedBuffer.sampleRate).toFixed(4)),
        elapsedMilliseconds: elapsedMs
      };
    } finally {
      if (timer) clearTimeout(timer);
      offlineRenderBusy = false;
    }
  }

  // =========================================================================
  // Manifest & Round-Trip Validation
  // =========================================================================

  function createExportManifest(scheduledScore, renderSummary = null, leadParity = null) {
    const { scores, patches } = getAuthorities();
    const patch = getPatch(scheduledScore.patchId);
    return Object.freeze({
      artifact: "quackpot-plan39-melody-reference-export",
      schemaVersion: 1,
      scoreSchemaVersion: scores.schemaVersion,
      patchSchemaVersion: patches.schemaVersion,
      exportedAt: new Date().toISOString(),
      provenance: {
        ...scores.provenance,
        origin: "Plan 39 report-local Web Audio laboratory",
        attribution: "Original Quackpot Plan 32/39 synthesized composition; oscillator patches are procedural synthesis proofs, not sampled instruments."
      },
      settings: {
        candidateId: scheduledScore.candidateId,
        candidateTitle: scheduledScore.candidateTitle,
        parentAnchor: scheduledScore.parentAnchor,
        harmonyId: scheduledScore.harmonyId,
        patchId: scheduledScore.patchId,
        tempoBpm: scheduledScore.tempoBpm,
        bars: scheduledScore.bars,
        beatsPerBar: scheduledScore.beatsPerBar,
        layerMode: scheduledScore.layerMode,
        layerGains: { ...scheduledScore.layerGains },
        seed: scheduledScore.seed,
        exportProfile: scheduledScore.exportProfile,
        roomAir: scheduledScore.roomAir,
        microGroove: scheduledScore.microGroove,
        shakerPulse: scheduledScore.shakerPulse,
        seamlessLoopWrap: scheduledScore.seamlessLoopWrap,
        leadPitchMultiplier: scheduledScore.leadPitchMultiplier
      },
      patchSnapshot: patch,
      leadEventParity: leadParity || null,
      render: renderSummary || null,
      events: {
        leadEvents: scheduledScore.canonicalLeadEvents,
        chordEvents: scheduledScore.canonicalChordEvents,
        bassEvents: scheduledScore.canonicalBassEvents
      }
    });
  }

  function validateImportedManifest(manifest) {
    if (!manifest || typeof manifest !== "object") {
      return { valid: false, error: "Imported JSON is not an object." };
    }
    if (manifest.artifact !== "quackpot-plan39-melody-reference-export" || manifest.schemaVersion !== 1) {
      return { valid: false, error: "Unsupported manifest artifact or schemaVersion (expected schemaVersion: 1)." };
    }
    if (manifest.provenance?.motifCSourceSha256 !== EXPECTED_MOTIFS_SHA256) {
      return { valid: false, error: "Manifest motifCSourceSha256 does not match the canonical Plan 32 motifs.js hash." };
    }
    const settings = manifest.settings;
    if (!settings || typeof settings !== "object") {
      return { valid: false, error: "Manifest is missing settings object." };
    }
    const combination = evaluateCombination(settings);
    if (!combination.supported) {
      return { valid: false, error: `Manifest settings unsupported: ${combination.reason}` };
    }
    const rebuilt = buildScheduledScore(settings);
    const importedLead = manifest.events?.leadEvents;
    if (!Array.isArray(importedLead) || importedLead.length !== rebuilt.canonicalLeadEvents.length) {
      return { valid: false, error: "Imported leadEvents count does not match rebuilt canonical score." };
    }
    for (let i = 0; i < importedLead.length; i += 1) {
      const a = importedLead[i];
      const b = rebuilt.canonicalLeadEvents[i];
      if (a.beat !== b.beat || a.midi !== b.midi || a.durationBeats !== b.durationBeats || a.velocity !== b.velocity) {
        return { valid: false, error: `Imported lead event ${i} differs from canonical score.` };
      }
    }
    return { valid: true, settings, rebuilt };
  }

  const ENGINE_API = Object.freeze({
    EXPECTED_MOTIFS_SHA256,
    VALID_LAYER_MODES,
    midiToHz,
    formatDbfs,
    numericDbfs,
    getCandidate,
    getHarmony,
    getPatch,
    evaluateCombination,
    buildScheduledScore,
    verifyLeadEventParity,
    scheduleOnAudioContext,
    measurePcm,
    encodePcm16Wav,
    parseWavHeader,
    renderOfflineWav,
    createExportManifest,
    validateImportedManifest
  });

  root.QUACKPOT_PLAN39_ENGINE = ENGINE_API;
  if (typeof module === "object" && module.exports) {
    module.exports = ENGINE_API;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
