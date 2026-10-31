/* Owner-facing UI controller for the Plan 39 Melody Reference & Web Audio Laboratory.
 * Uses the exact same QUACKPOT_PLAN39_ENGINE scheduling & synthesis path for both
 * real-time AudioContext audition and OfflineAudioContext WAV export.
 */
(function initPlan39Laboratory() {
  "use strict";

  const scores = window.QUACKPOT_PLAN39_SCORES;
  const patches = window.QUACKPOT_PLAN39_PATCHES;
  const engine = window.QUACKPOT_PLAN39_ENGINE;

  if (!scores || !patches || !engine) {
    throw new Error("Plan 39 authorities (scores, patches, engine) failed to initialize.");
  }

  const NOTES_STORAGE_KEY = "quackpot.plan39.lab.notes.v1";

  // DOM Elements
  const statusBanner = document.getElementById("status-banner");
  const telemetryState = document.getElementById("telemetry-state");
  const telemetryTime = document.getElementById("telemetry-time");
  const telemetryCandidate = document.getElementById("telemetry-candidate");

  const candidateSelect = document.getElementById("candidate-select");
  const harmonySelect = document.getElementById("harmony-select");
  const patchSelect = document.getElementById("patch-select");
  const tempoSelect = document.getElementById("tempo-select");
  const layerModeSelect = document.getElementById("layer-mode-select");
  const loopToggle = document.getElementById("loop-toggle");
  const masterVolume = document.getElementById("master-volume");
  const volumeReadout = document.getElementById("volume-readout");

  const combinationNotice = document.getElementById("combination-notice");
  const combinationNoticeTitle = document.getElementById("combination-notice-title");
  const combinationNoticeMsg = document.getElementById("combination-notice-msg");
  const combinationFixBtn = document.getElementById("combination-fix-btn");

  const playSelectedBtn = document.getElementById("play-selected-btn");
  const stopBtn = document.getElementById("stop-btn");
  const abOriginalBtn = document.getElementById("ab-original-btn");
  const abRepeat2xBtn = document.getElementById("ab-repeat2x-btn");
  const playingIndicator = document.getElementById("playing-indicator");
  const playbackStatusText = document.getElementById("playback-status-text");

  const sectionRibbon = document.getElementById("section-ribbon");
  const timelineRuler = document.getElementById("timeline-ruler");
  const visualizerPlayhead = document.getElementById("visualizer-playhead");
  const trackLeadStatus = document.getElementById("track-lead-status");
  const trackChordsStatus = document.getElementById("track-chords-status");
  const trackBassStatus = document.getElementById("track-bass-status");
  const trackLeadNotes = document.getElementById("track-lead-notes");
  const trackChordsNotes = document.getElementById("track-chords-notes");
  const trackBassNotes = document.getElementById("track-bass-notes");

  const primaryCandidatesGrid = document.getElementById("primary-candidates-grid");
  const optionalCandidatesGrid = document.getElementById("optional-candidates-grid");

  const renderExportBtn = document.getElementById("render-export-btn");
  const exportList = document.getElementById("export-list");

  const notesVerdictSelect = document.getElementById("notes-verdict-select");
  const ownerNotesInput = document.getElementById("owner-notes-input");
  const saveNotesBtn = document.getElementById("save-notes-btn");
  const exportNotesBtn = document.getElementById("export-notes-btn");
  const importJsonInput = document.getElementById("import-json-input");
  const notesFeedback = document.getElementById("notes-feedback");

  // Quick-start buttons
  const qsOrigBtn = document.getElementById("qs-orig-btn");
  const qsRepeatBtn = document.getElementById("qs-repeat-btn");
  const qsExportBtn = document.getElementById("qs-export-btn");

  // Runtime state
  let audioCtx = null;
  let activeSynthHandle = null;
  let activeHtmlAudio = null;
  let playbackTimer = null;
  let loopRestartTimer = null;
  let playbackToken = 0;
  let exportInProgress = false;
  let exportSequence = 0;
  const allocatedObjectUrls = new Set();

  function setStatus(message) {
    statusBanner.textContent = message;
  }

  function loadStoredNotes() {
    try {
      const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
      if (!raw) return {};
      if (raw.length > 65536) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || parsed.schemaVersion !== 1 || typeof parsed.entries !== "object") {
        return {};
      }
      return parsed.entries;
    } catch (_) {
      return {};
    }
  }

  function saveStoredNotes(entries) {
    try {
      const payload = JSON.stringify({
        artifact: "quackpot-plan39-owner-listening-notes",
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
        entries
      }, null, 2);
      if (payload.length > 65536) {
        throw new Error("Listening notes exceeded the 64 KiB laboratory storage bound.");
      }
      window.localStorage.setItem(NOTES_STORAGE_KEY, payload);
      return true;
    } catch (_) {
      return false;
    }
  }

  function currentConfig() {
    return {
      candidateId: candidateSelect.value,
      harmonyId: harmonySelect.value,
      patchId: patchSelect.value,
      tempoBpm: Number(tempoSelect.value),
      layerMode: layerModeSelect.value
    };
  }

  function stopAllAudio(reasonText = null) {
    playbackToken += 1;
    if (playbackTimer) {
      clearInterval(playbackTimer);
      playbackTimer = null;
    }
    if (loopRestartTimer) {
      clearTimeout(loopRestartTimer);
      loopRestartTimer = null;
    }
    if (activeSynthHandle) {
      try { activeSynthHandle.stopAll(); } catch (_) {}
      activeSynthHandle = null;
    }
    if (activeHtmlAudio) {
      try {
        activeHtmlAudio.pause();
        activeHtmlAudio.currentTime = 0;
      } catch (_) {}
      activeHtmlAudio = null;
    }
    stopBtn.disabled = true;
    playingIndicator.classList.remove("playing");
    playbackStatusText.textContent = "Stopped";
    telemetryState.textContent = "IDLE";
    visualizerPlayhead.style.left = "0%";
    if (reasonText) setStatus(reasonText);
  }

  function populateSelects() {
    candidateSelect.replaceChildren();
    scores.candidates.forEach((cand) => {
      const opt = document.createElement("option");
      opt.value = cand.id;
      opt.textContent = `${cand.id} — ${cand.title}`;
      candidateSelect.append(opt);
    });
    candidateSelect.value = "C0-repeat2x";

    harmonySelect.replaceChildren();
    scores.harmonies.forEach((harm) => {
      const opt = document.createElement("option");
      opt.value = harm.id;
      opt.textContent = harm.name;
      harmonySelect.append(opt);
    });
    harmonySelect.value = "H0-dry";

    patchSelect.replaceChildren();
    patches.patches.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      patchSelect.append(opt);
    });
    patchSelect.value = "P0-plan32-triangle";
  }

  function renderCandidateCards() {
    primaryCandidatesGrid.replaceChildren();
    optionalCandidatesGrid.replaceChildren();

    scores.candidates.forEach((cand) => {
      const card = document.createElement("article");
      card.className = "candidate-card";
      card.id = `card-${cand.id}`;
      card.dataset.candidateId = cand.id;
      card.setAttribute("role", "listitem");

      const defaultDuration = ((cand.bars * cand.beatsPerBar * 60) / 100 + 0.12).toFixed(2);
      const groupBadge = cand.group === "control"
        ? "Control Benchmark"
        : cand.group === "c-continuation"
          ? "C-Derived 8-Bar Form"
          : "Separated Optional Foil";

      card.innerHTML = `
        <div class="card-id-row">
          <span class="candidate-id font-mono">${cand.id}</span>
          <span class="badge">${groupBadge}</span>
        </div>
        <h3 class="card-title">${cand.title}</h3>
        <div class="card-meta">
          <span class="meta-tag">${cand.bars} Bars (${cand.bars * cand.beatsPerBar} Beats)</span>
          <span class="meta-tag">${defaultDuration} s @ 100 BPM</span>
          <span class="meta-tag">Default: ${cand.defaultHarmonyId}</span>
        </div>
        <p class="card-intent">${cand.intent}</p>
        <div class="card-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-select-only="${cand.id}">Select Defaults</button>
          <button type="button" class="btn btn-primary btn-sm" data-select-audition="${cand.id}">▶ Select &amp; Audition</button>
        </div>
      `;

      if (cand.group === "optional-new-core") {
        optionalCandidatesGrid.append(card);
      } else {
        primaryCandidatesGrid.append(card);
      }
    });
  }

  function syncNotesFormForCandidate(candidateId) {
    const entries = loadStoredNotes();
    const record = entries[candidateId] || { verdict: "unrated", notes: "" };
    notesVerdictSelect.value = record.verdict || "unrated";
    ownerNotesInput.value = record.notes || "";
    notesFeedback.textContent = "";
  }

  function updateUIAndVisualizer() {
    const cfg = currentConfig();
    telemetryCandidate.textContent = cfg.candidateId;

    document.querySelectorAll(".candidate-card").forEach((card) => {
      card.classList.toggle("active-card", card.dataset.candidateId === cfg.candidateId);
    });

    const check = engine.evaluateCombination(cfg);
    if (!check.supported) {
      combinationNotice.classList.remove("hidden");
      combinationNoticeTitle.textContent = "Unsupported Configuration Guard";
      combinationNoticeMsg.textContent = check.reason;
      playSelectedBtn.disabled = true;
      renderExportBtn.disabled = true;
      return;
    }

    playSelectedBtn.disabled = false;
    renderExportBtn.disabled = exportInProgress;

    if (check.warnings && check.warnings.length > 0) {
      combinationNotice.classList.remove("hidden");
      combinationNoticeTitle.textContent = "Non-Canonical Comparison Notice";
      combinationNoticeMsg.textContent = check.warnings.join(" ");
    } else {
      combinationNotice.classList.add("hidden");
    }

    const scheduled = engine.buildScheduledScore(cfg);
    telemetryTime.textContent = `0.00 s / ${scheduled.durationSeconds.toFixed(2)} s`;

    // Render section ribbon
    sectionRibbon.replaceChildren();
    scheduled.sections.forEach((sec) => {
      const span = document.createElement("div");
      span.className = `section-segment kind-${sec.kind}`;
      span.style.flex = String(sec.endBar - sec.startBar + 1);
      span.textContent = sec.label;
      sectionRibbon.append(span);
    });

    // Render ruler bars
    timelineRuler.replaceChildren();
    for (let bar = 1; bar <= scheduled.bars; bar += 1) {
      const div = document.createElement("div");
      div.className = "ruler-bar";
      const barStartSec = ((bar - 1) * scheduled.beatsPerBar * scheduled.secondsPerBeat).toFixed(1);
      div.textContent = `Bar ${bar} (${barStartSec}s)`;
      timelineRuler.append(div);
    }

    // Render track lanes
    const totalBeats = scheduled.totalBeats;
    trackLeadStatus.textContent = `${scheduled.leadEvents.length} active notes`;
    trackChordsStatus.textContent = `${scheduled.chordEvents.length} active notes`;
    trackBassStatus.textContent = `${scheduled.bassEvents.length} active notes`;

    trackLeadNotes.replaceChildren();
    scheduled.leadEvents.forEach((ev) => {
      const pill = document.createElement("div");
      pill.className = `note-pill ${ev.isExactAnchor ? "anchor" : "continuation"}`;
      pill.style.left = `${(ev.beat / totalBeats) * 100}%`;
      pill.style.width = `${Math.max(1.2, (ev.durationBeats / totalBeats) * 100)}%`;
      pill.title = `Beat ${ev.beat}: MIDI ${ev.midi} (${ev.durationBeats}b, ${ev.section})`;
      trackLeadNotes.append(pill);
    });

    trackChordsNotes.replaceChildren();
    scheduled.chordEvents.forEach((ev) => {
      const pill = document.createElement("div");
      pill.className = "note-pill chords";
      pill.style.left = `${(ev.beat / totalBeats) * 100}%`;
      pill.style.width = `${Math.max(1.0, (ev.durationBeats / totalBeats) * 100)}%`;
      trackChordsNotes.append(pill);
    });

    trackBassNotes.replaceChildren();
    scheduled.bassEvents.forEach((ev) => {
      const pill = document.createElement("div");
      pill.className = "note-pill bass";
      pill.style.left = `${(ev.beat / totalBeats) * 100}%`;
      pill.style.width = `${Math.max(1.2, (ev.durationBeats / totalBeats) * 100)}%`;
      trackBassNotes.append(pill);
    });
  }

  function applyCandidateDefaults(candidateId) {
    const cand = engine.getCandidate(candidateId);
    if (!cand) return;
    candidateSelect.value = cand.id;
    harmonySelect.value = cand.defaultHarmonyId;
    patchSelect.value = cand.defaultPatchId;
    tempoSelect.value = "100";
    layerModeSelect.value = "full";
    syncNotesFormForCandidate(cand.id);
    updateUIAndVisualizer();
  }

  async function ensureAudioContext() {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      throw new Error("Web Audio API AudioContext is unavailable in this browser.");
    }
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    return audioCtx;
  }

  async function auditionConfig(cfg, labelPrefix = "Auditioning") {
    stopAllAudio();
    const check = engine.evaluateCombination(cfg);
    if (!check.supported) {
      updateUIAndVisualizer();
      setStatus(`Cannot audition: ${check.reason}`);
      return;
    }

    const token = ++playbackToken;
    try {
      const ctx = await ensureAudioContext();
      if (token !== playbackToken) return;

      const scheduled = engine.buildScheduledScore(cfg);
      const patch = engine.getPatch(scheduled.patchId);
      const userVol = Number(masterVolume.value) || 0.85;
      const startAt = ctx.currentTime + 0.025;

      activeSynthHandle = engine.scheduleOnAudioContext(ctx, scheduled, patch, {
        baseTime: startAt,
        masterGain: patch.masterGain * userVol
      });

      stopBtn.disabled = false;
      playingIndicator.classList.add("playing");
      playbackStatusText.textContent = "Playing";
      telemetryState.textContent = "PLAYING";
      setStatus(`${labelPrefix}: ${scheduled.candidateId} (${scheduled.harmonyId}, ${scheduled.patchId}, ${scheduled.tempoBpm} BPM, ${scheduled.layerMode}) — ${scheduled.durationSeconds.toFixed(2)} s.`);

      const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playbackTimer = setInterval(() => {
        if (token !== playbackToken || !audioCtx) return;
        const elapsed = Math.max(0, audioCtx.currentTime - startAt);
        const clamped = Math.min(scheduled.durationSeconds, elapsed);
        telemetryTime.textContent = `${clamped.toFixed(2)} s / ${scheduled.durationSeconds.toFixed(2)} s`;
        if (!reducedMotion) {
          const pct = Math.min(100, (clamped / scheduled.phraseSeconds) * 100);
          visualizerPlayhead.style.left = `${pct.toFixed(1)}%`;
        }
      }, 60);

      const waitSec = loopToggle.checked ? scheduled.phraseSeconds : scheduled.durationSeconds;
      const waitMs = Math.ceil((waitSec + 0.04) * 1000);
      loopRestartTimer = setTimeout(() => {
        if (token !== playbackToken) return;
        if (loopToggle.checked) {
          void auditionConfig(cfg, "Looping");
        } else {
          stopAllAudio(`Finished playing ${scheduled.candidateId} (${scheduled.durationSeconds.toFixed(2)} s).`);
        }
      }, waitMs);
    } catch (error) {
      stopAllAudio(`Audition error: ${error.message}`);
    }
  }

  async function renderAndPrepareExportBundle() {
    if (exportInProgress) return;
    const cfg = currentConfig();
    const check = engine.evaluateCombination(cfg);
    if (!check.supported) {
      setStatus(`Cannot render export bundle: ${check.reason}`);
      return;
    }

    stopAllAudio();
    exportInProgress = true;
    renderExportBtn.disabled = true;
    setStatus(`Rendering OfflineAudioContext reference bundle for ${cfg.candidateId}...`);

    try {
      const mixScore = engine.buildScheduledScore({ ...cfg, layerMode: "full" });
      const melodyScore = engine.buildScheduledScore({ ...cfg, layerMode: "melody-only" });
      const parity = engine.verifyLeadEventParity(mixScore, melodyScore);
      if (!parity.identical) {
        throw new Error(`Lead event parity check failed: ${parity.reason}`);
      }

      const mixRender = await engine.renderOfflineWav(mixScore);
      const mixHeader = engine.parseWavHeader(mixRender.wav.arrayBuffer);

      const melodyRender = await engine.renderOfflineWav(melodyScore);
      const melodyHeader = engine.parseWavHeader(melodyRender.wav.arrayBuffer);

      let backingRender = null;
      let backingHeader = null;
      if (cfg.harmonyId !== "H0-dry") {
        const backingScore = engine.buildScheduledScore({ ...cfg, layerMode: "backing-only" });
        backingRender = await engine.renderOfflineWav(backingScore);
        backingHeader = engine.parseWavHeader(backingRender.wav.arrayBuffer);
      }

      exportSequence += 1;
      const baseSlug = `plan39-${cfg.candidateId.toLowerCase()}-${cfg.harmonyId.toLowerCase()}-${cfg.patchId.toLowerCase()}-${cfg.tempoBpm}bpm`;
      const mixFileName = `${baseSlug}-mix.wav`;
      const melodyFileName = `${baseSlug}-melody.wav`;
      const backingFileName = backingRender ? `${baseSlug}-backing.wav` : null;
      const manifestFileName = `${baseSlug}-manifest.json`;

      const renderSummary = {
        format: "WAV PCM16 Stereo",
        sampleRate: mixHeader.sampleRate,
        channels: mixHeader.channels,
        durationSeconds: mixRender.durationSeconds,
        frameCount: mixRender.frameCount,
        measurementBasis: mixRender.measured.measurementBasis,
        mix: {
          fileName: mixFileName,
          bytes: mixRender.wav.byteLength,
          samplePeakDbfs: mixRender.measured.samplePeakDbfs,
          rmsDbfs: mixRender.measured.rmsDbfs,
          peakLinear: mixRender.measured.peak,
          rmsLinear: mixRender.measured.rms
        },
        melodyOnly: {
          fileName: melodyFileName,
          bytes: melodyRender.wav.byteLength,
          samplePeakDbfs: melodyRender.measured.samplePeakDbfs,
          rmsDbfs: melodyRender.measured.rmsDbfs,
          peakLinear: melodyRender.measured.peak,
          rmsLinear: melodyRender.measured.rms
        },
        backingOnly: backingRender ? {
          fileName: backingFileName,
          bytes: backingRender.wav.byteLength,
          samplePeakDbfs: backingRender.measured.samplePeakDbfs,
          rmsDbfs: backingRender.measured.rmsDbfs
        } : null
      };

      const manifest = engine.createExportManifest(mixScore, renderSummary, parity);
      const manifestBlob = new Blob([`${JSON.stringify(manifest, null, 2)}\n`], { type: "application/json" });

      const mixUrl = URL.createObjectURL(mixRender.wav.blob);
      const melodyUrl = URL.createObjectURL(melodyRender.wav.blob);
      const backingUrl = backingRender ? URL.createObjectURL(backingRender.wav.blob) : null;
      const manifestUrl = URL.createObjectURL(manifestBlob);

      allocatedObjectUrls.add(mixUrl);
      allocatedObjectUrls.add(melodyUrl);
      if (backingUrl) allocatedObjectUrls.add(backingUrl);
      allocatedObjectUrls.add(manifestUrl);

      const placeholder = exportList.querySelector(".export-empty-placeholder");
      if (placeholder) placeholder.remove();

      const bundleCard = document.createElement("div");
      bundleCard.className = "export-bundle-card";
      bundleCard.dataset.bundleCandidate = cfg.candidateId;

      const headerRow = document.createElement("div");
      headerRow.className = "bundle-header";
      headerRow.innerHTML = `
        <strong>#${exportSequence} · ${cfg.candidateId} (${cfg.harmonyId}, ${cfg.patchId}, ${cfg.tempoBpm} BPM)</strong>
        <span class="badge badge-status">${parity.reason}</span>
      `;

      const metricsRow = document.createElement("div");
      metricsRow.className = "bundle-metrics font-mono";
      metricsRow.textContent = `${mixRender.durationSeconds.toFixed(2)} s (${mixHeader.frames} frames @ ${mixHeader.sampleRate} Hz) · Mix PCM peak ${engine.formatDbfs(mixRender.measured.peak)} / RMS ${engine.formatDbfs(mixRender.measured.rms)} · Melody PCM peak ${engine.formatDbfs(melodyRender.measured.peak)} / RMS ${engine.formatDbfs(melodyRender.measured.rms)} · PCM sample peak and RMS only; not LUFS or true peak`;

      const linksRow = document.createElement("div");
      linksRow.className = "bundle-links";

      function makeDownloadLink(url, fileName, label) {
        const a = document.createElement("a");
        a.className = "btn btn-secondary btn-sm";
        a.href = url;
        a.download = fileName;
        a.textContent = label;
        return a;
      }

      function makeWavPlayButton(url, label) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline btn-sm";
        btn.textContent = `▶ Play Rendered ${label}`;
        btn.addEventListener("click", async () => {
          stopAllAudio();
          const audio = new Audio(url);
          activeHtmlAudio = audio;
          stopBtn.disabled = false;
          playingIndicator.classList.add("playing");
          playbackStatusText.textContent = "Playing WAV";
          telemetryState.textContent = "WAV-AUDIO";
          audio.addEventListener("ended", () => {
            if (activeHtmlAudio === audio) {
              stopAllAudio(`Finished playing rendered ${label} WAV.`);
            }
          });
          await audio.play();
          setStatus(`Playing rendered ${label} WAV (${fileNameForLabel(label)}).`);
        });
        return btn;
      }

      function fileNameForLabel(label) {
        if (label === "Mix") return mixFileName;
        if (label === "Melody") return melodyFileName;
        return backingFileName || "";
      }

      linksRow.append(
        makeWavPlayButton(mixUrl, "Mix"),
        makeWavPlayButton(melodyUrl, "Melody"),
        makeDownloadLink(mixUrl, mixFileName, "Download Full Mix WAV"),
        makeDownloadLink(melodyUrl, melodyFileName, "Download Melody-Only WAV")
      );

      if (backingUrl && backingFileName && backingHeader) {
        linksRow.append(
          makeWavPlayButton(backingUrl, "Backing"),
          makeDownloadLink(backingUrl, backingFileName, "Download Backing-Only WAV")
        );
      }

      linksRow.append(makeDownloadLink(manifestUrl, manifestFileName, "Download Score/Provenance JSON"));

      bundleCard.append(headerRow, metricsRow, linksRow);
      exportList.prepend(bundleCard);

      setStatus(
        `Bundle #${exportSequence} rendered: ${mixRender.durationSeconds.toFixed(2)} s · Mix PCM sample peak ${engine.formatDbfs(mixRender.measured.peak)}, RMS ${engine.formatDbfs(mixRender.measured.rms)} · not LUFS or true peak.`
      );
    } catch (error) {
      setStatus(`Export render failed: ${error.message}`);
    } finally {
      exportInProgress = false;
      renderExportBtn.disabled = false;
    }
  }

  // Event Listeners
  candidateSelect.addEventListener("change", () => {
    stopAllAudio();
    applyCandidateDefaults(candidateSelect.value);
  });

  [harmonySelect, patchSelect, tempoSelect, layerModeSelect].forEach((sel) => {
    sel.addEventListener("change", () => {
      stopAllAudio();
      updateUIAndVisualizer();
    });
  });

  masterVolume.addEventListener("input", () => {
    volumeReadout.textContent = `${Math.round(Number(masterVolume.value) * 100)}%`;
  });

  combinationFixBtn.addEventListener("click", () => {
    stopAllAudio();
    candidateSelect.value = "C0-repeat2x";
    harmonySelect.value = "H1-bright-resolved";
    patchSelect.value = "P1-pluck-bell";
    layerModeSelect.value = "full";
    syncNotesFormForCandidate("C0-repeat2x");
    updateUIAndVisualizer();
    setStatus("Switched to C0-repeat2x with H1-bright-resolved and P1-pluck-bell.");
  });

  playSelectedBtn.addEventListener("click", () => {
    void auditionConfig(currentConfig(), "Auditioning");
  });

  stopBtn.addEventListener("click", () => {
    stopAllAudio("Audio stopped.");
  });

  abOriginalBtn.addEventListener("click", () => {
    candidateSelect.value = "C0-original";
    harmonySelect.value = "H0-dry";
    patchSelect.value = "P0-plan32-triangle";
    tempoSelect.value = "100";
    layerModeSelect.value = "full";
    syncNotesFormForCandidate("C0-original");
    updateUIAndVisualizer();
    void auditionConfig(currentConfig(), "A/B Historical Original C (4.92 s)");
  });

  abRepeat2xBtn.addEventListener("click", () => {
    candidateSelect.value = "C0-repeat2x";
    harmonySelect.value = "H0-dry";
    patchSelect.value = "P0-plan32-triangle";
    tempoSelect.value = "100";
    layerModeSelect.value = "full";
    syncNotesFormForCandidate("C0-repeat2x");
    updateUIAndVisualizer();
    void auditionConfig(currentConfig(), "A/B 2× Repeated C Control (9.72 s)");
  });

  qsOrigBtn.addEventListener("click", () => abOriginalBtn.click());
  qsRepeatBtn.addEventListener("click", () => abRepeat2xBtn.click());
  qsExportBtn.addEventListener("click", () => {
    void renderAndPrepareExportBundle();
  });

  document.querySelectorAll("[data-quick-candidate]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-quick-candidate");
      applyCandidateDefaults(targetId);
      void auditionConfig(currentConfig(), `Quick-Start ${targetId}`);
    });
  });

  document.querySelectorAll("[data-quick-layer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const layer = btn.getAttribute("data-quick-layer");
      if (candidateSelect.value === "C0-original" && layer === "backing-only") {
        applyCandidateDefaults("C3-accompaniment-groove");
      } else if (harmonySelect.value === "H0-dry" && layer === "backing-only") {
        harmonySelect.value = "H1-bright-resolved";
      }
      layerModeSelect.value = layer;
      updateUIAndVisualizer();
      void auditionConfig(currentConfig(), `Layer ${layer}`);
    });
  });

  document.addEventListener("click", (event) => {
    const selectOnly = event.target.closest("[data-select-only]");
    if (selectOnly) {
      stopAllAudio();
      applyCandidateDefaults(selectOnly.getAttribute("data-select-only"));
      setStatus(`Selected ${candidateSelect.value} defaults.`);
      return;
    }
    const selectAudition = event.target.closest("[data-select-audition]");
    if (selectAudition) {
      applyCandidateDefaults(selectAudition.getAttribute("data-select-audition"));
      void auditionConfig(currentConfig(), "Auditioning");
    }
  });

  renderExportBtn.addEventListener("click", () => {
    void renderAndPrepareExportBundle();
  });

  saveNotesBtn.addEventListener("click", () => {
    const entries = loadStoredNotes();
    const candId = candidateSelect.value;
    entries[candId] = {
      verdict: notesVerdictSelect.value,
      notes: String(ownerNotesInput.value || "").slice(0, 4000),
      savedAt: new Date().toISOString()
    };
    const ok = saveStoredNotes(entries);
    notesFeedback.textContent = ok ? `Saved listening note for ${candId}.` : "Could not save note in localStorage.";
  });

  exportNotesBtn.addEventListener("click", () => {
    const entries = loadStoredNotes();
    const payload = {
      artifact: "quackpot-plan39-owner-listening-notes",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      entries
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    allocatedObjectUrls.add(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan39-owner-listening-notes.json";
    a.click();
    notesFeedback.textContent = "Downloaded plan39-owner-listening-notes.json.";
  });

  importJsonInput.addEventListener("change", async () => {
    const file = importJsonInput.files && importJsonInput.files[0];
    if (!file) return;
    stopAllAudio();
    try {
      if (file.size > 262144) {
        throw new Error("Imported JSON file exceeds the 256 KiB safety limit.");
      }
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && parsed.artifact === "quackpot-plan39-owner-listening-notes" && parsed.schemaVersion === 1 && typeof parsed.entries === "object") {
        saveStoredNotes(parsed.entries);
        syncNotesFormForCandidate(candidateSelect.value);
        notesFeedback.textContent = `Imported owner listening notes from ${file.name}.`;
        setStatus(`Imported owner listening notes from ${file.name}.`);
        return;
      }
      const validation = engine.validateImportedManifest(parsed);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      const s = validation.settings;
      candidateSelect.value = s.candidateId;
      harmonySelect.value = s.harmonyId;
      patchSelect.value = s.patchId;
      tempoSelect.value = String(s.tempoBpm);
      layerModeSelect.value = s.layerMode;
      syncNotesFormForCandidate(s.candidateId);
      updateUIAndVisualizer();
      notesFeedback.textContent = `Restored configuration from ${file.name} (${s.candidateId}).`;
      setStatus(`Imported and verified manifest ${file.name}: ${s.candidateId} (${s.harmonyId}, ${s.patchId}, ${s.tempoBpm} BPM).`);
    } catch (error) {
      notesFeedback.textContent = `Import rejected: ${error.message}`;
      setStatus(`Import rejected: ${error.message}`);
    } finally {
      importJsonInput.value = "";
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      stopAllAudio("Audio stopped because the laboratory tab was hidden.");
    }
  });

  window.addEventListener("pagehide", () => {
    stopAllAudio();
    for (const url of allocatedObjectUrls) {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
    allocatedObjectUrls.clear();
    if (audioCtx && typeof audioCtx.close === "function") {
      try { void audioCtx.close(); } catch (_) {}
    }
  }, { once: true });

  // Boot initialization
  populateSelects();
  renderCandidateCards();
  applyCandidateDefaults("C0-repeat2x");
})();
