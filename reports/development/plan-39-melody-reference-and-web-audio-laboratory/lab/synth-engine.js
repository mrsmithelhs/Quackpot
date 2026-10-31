/* Shared Plan 39 Web Audio scheduling, OfflineAudioContext WAV export, PCM measurement,
 * and round-trip manifest validation engine.
 * Reads score authority from QUACKPOT_PLAN39_SCORES (scores.js) and patch authority
 * from QUACKPOT_PLAN39_PATCHES (patches.js).
 */
(function initPlan39Engine(root) {
  "use strict";

  const EXPECTED_MOTIFS_SHA256 = "3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02";
  const VALID_LAYER_MODES = ["full", "melody-only", "backing-only"];

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
          reason: "C0-original is locked to H0-dry (unaccompanied) as the untouched 4.92 s historical baseline. Switch to C0-repeat2x or C1–C3 to audition harmonies."
        };
      }
      if (layerMode === "backing-only") {
        return {
          supported: false,
          reason: "C0-original has no backing tracks (dry historical control). Choose C0-repeat2x or C1–C3 with H1–H3 to audition Backing Solo."
        };
      }
    }

    if (harmony.id === "H0-dry" && layerMode === "backing-only") {
      return {
        supported: false,
        reason: "Backing Solo is unavailable when Harmony is set to H0-dry (Unaccompanied). Select H1, H2, or H3 to hear the accompaniment layer."
      };
    }

    const warnings = [];
    if (tempoBpm !== 100) {
      warnings.push(`Non-canonical tempo (${tempoBpm} BPM; canonical Motif C is 100 BPM).`);
    }
    if (candidate.id === "C0-original" && patch.id !== "P0-plan32-triangle") {
      warnings.push(`Comparing C0-original with ${patch.id}; canonical Plan 32 reference uses P0-plan32-triangle.`);
    }

    return {
      supported: true,
      reason: warnings.length ? warnings.join(" ") : "Supported configuration.",
      warnings
    };
  }

  /**
   * Builds deterministic scheduled event lists for lead, chords, and bass.
   * Guarantees that leadEvents in "full" and "melody-only" are 100% identical.
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

    const combination = evaluateCombination({ candidateId, harmonyId, patchId, tempoBpm, layerMode });
    if (!combination.supported) {
      throw new Error(combination.reason);
    }

    const secondsPerBeat = 60 / tempoBpm;
    const totalBeats = candidate.bars * candidate.beatsPerBar;
    const phraseSeconds = Number((totalBeats * secondsPerBeat).toFixed(6));
    const tailSeconds = Number((patch.tailSeconds || 0.12).toFixed(6));
    const durationSeconds = Number((phraseSeconds + tailSeconds).toFixed(6));

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > scores.maxDurationSeconds) {
      throw new Error(`Invalid score duration (${durationSeconds}s); must be in (0, ${scores.maxDurationSeconds}].`);
    }

    const rawGains = config.layerGains || {};
    const layerGains = {
      lead: Number.isFinite(rawGains.lead) ? Math.max(0, Math.min(1.5, Number(rawGains.lead))) : 1.0,
      chords: Number.isFinite(rawGains.chords) ? Math.max(0, Math.min(1.5, Number(rawGains.chords))) : 0.85,
      bass: Number.isFinite(rawGains.bass) ? Math.max(0, Math.min(1.5, Number(rawGains.bass))) : 0.90
    };

    // 1. Canonical Lead Events (deterministic, identical between "full" and "melody-only")
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

    const activeLead = layerMode === "backing-only" ? [] : canonicalLeadEvents;
    const activeChords = layerMode === "melody-only" ? [] : canonicalChordEvents;
    const activeBass = layerMode === "melody-only" ? [] : canonicalBassEvents;

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

    // Exact Plan 32 bare triangle path when P0-plan32-triangle is used dry
    const useExactPlan32BarePath = Boolean(patch.isHistoricalPlan32 && scheduledScore.harmonyId === "H0-dry");

    function scheduleVoice(event, voiceSpec, busGainMultiplier) {
      const start = baseTime + event.startSeconds;
      const noteLength = event.durationSeconds;
      const releaseSeconds = voiceSpec.releaseSeconds || 0.09;
      const releaseStart = start + noteLength;
      const end = releaseStart + releaseSeconds;

      const maxGain = voiceSpec.voicePeak * event.velocity * busGainMultiplier;
      const sustainGain = Math.max(0.00001, maxGain * (voiceSpec.sustainRatio ?? 0.22));

      if (useExactPlan32BarePath) {
        const voice = ctx.createOscillator();
        const envelope = ctx.createGain();
        voice.type = voiceSpec.waveform || "triangle";
        voice.frequency.setValueAtTime(event.frequencyHz, start);

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

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0.00001, start);
      envelope.gain.linearRampToValueAtTime(maxGain, start + (voiceSpec.attackSeconds || 0.008));
      envelope.gain.linearRampToValueAtTime(
        sustainGain,
        start + (voiceSpec.attackSeconds || 0.008) + (voiceSpec.decaySeconds || 0.12)
      );
      envelope.gain.setValueAtTime(sustainGain, releaseStart);
      envelope.gain.linearRampToValueAtTime(0.00001, end);
      createdNodes.push(envelope);

      let voiceTarget = envelope;
      if (voiceSpec.filterCutoffHz && typeof ctx.createBiquadFilter === "function") {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.setValueAtTime(voiceSpec.filterQ || 0.7, start);
        if (voiceSpec.filterPeakHz && voiceSpec.filterDecaySeconds) {
          filter.frequency.setValueAtTime(voiceSpec.filterPeakHz, start);
          filter.frequency.exponentialRampToValueAtTime(
            Math.max(80, voiceSpec.filterCutoffHz),
            start + voiceSpec.filterDecaySeconds
          );
        } else {
          filter.frequency.setValueAtTime(voiceSpec.filterCutoffHz, start);
        }
        filter.connect(envelope);
        voiceTarget = filter;
        createdNodes.push(filter);
      }

      if (typeof ctx.createStereoPanner === "function" && voiceSpec.pan) {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(voiceSpec.pan, start);
        envelope.connect(panner);
        panner.connect(masterGain);
        createdNodes.push(panner);
      } else {
        envelope.connect(masterGain);
      }

      const primary = ctx.createOscillator();
      primary.type = voiceSpec.waveform || "triangle";
      primary.frequency.setValueAtTime(event.frequencyHz, start);
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
        overtone.frequency.setValueAtTime(event.frequencyHz * (voiceSpec.overtoneRatio || 2), start);
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

    for (const ev of scheduledScore.leadEvents) {
      scheduleVoice(ev, patch.lead, scheduledScore.layerGains.lead);
    }
    for (const ev of scheduledScore.chordEvents) {
      const boost = ev.role === "counter" ? 1.15 : 1.0;
      scheduleVoice(ev, patch.chords, scheduledScore.layerGains.chords * boost);
    }
    for (const ev of scheduledScore.bassEvents) {
      scheduleVoice(ev, patch.bass, scheduledScore.layerGains.bass);
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
      const renderedBuffer = await Promise.race([rendering, deadline]);
      const measured = measurePcm(renderedBuffer);
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
        seed: scheduledScore.seed
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
