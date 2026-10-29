(() => {
  "use strict";

  const source = window.QUACKPOT_PLAN32_MOTIFS;
  const select = document.getElementById("motif-select");
  const description = document.getElementById("motif-description");
  const renderButton = document.getElementById("render-button");
  const stopButton = document.getElementById("stop-button");
  const status = document.getElementById("status");
  const list = document.getElementById("preview-list");
  const savedFiles = document.getElementById("saved-preview-files");
  const savedList = document.getElementById("saved-preview-list");
  const rendered = new Map();
  const savedUrls = new Set();
  let activeAudio = null;
  let renderInProgress = false;
  let renderFailedClosed = false;
  let playRequestToken = 0;

  const secondsPerBeat = 60 / source.tempoBpm;
  const phraseSeconds = source.bars * source.beatsPerBar * secondsPerBeat;

  function formatDbfs(linear) {
    if (linear <= 0) return "−∞ dBFS";
    return `${(20 * Math.log10(linear)).toFixed(1)} dBFS`;
  }

  function numericDbfs(linear) {
    return linear > 0 ? Number((20 * Math.log10(linear)).toFixed(1)) : null;
  }

  function midiToHz(midi) {
    return 440 * (2 ** ((midi - 69) / 12));
  }

  function getMotif(id) {
    return source.motifs.find((motif) => motif.id === id);
  }

  function measurePcm(buffer) {
    let peak = 0;
    let sumSquares = 0;
    let count = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const samples = buffer.getChannelData(channel);
      for (let index = 0; index < samples.length; index += 1) {
        const value = samples[index];
        if (!Number.isFinite(value)) throw new Error("Offline render produced a non-finite PCM sample.");
        const magnitude = Math.abs(value);
        if (magnitude > peak) peak = magnitude;
        sumSquares += value * value;
        count += 1;
      }
    }
    return { peak, rms: Math.sqrt(sumSquares / Math.max(count, 1)) };
  }

  function validateMotif(motif) {
    const phraseBeats = source.bars * source.beatsPerBar;
    const patch = source.patch;
    const finite = [source.tempoBpm, source.tonicMidi, patch.sampleRate, patch.voicePeak, patch.masterGain,
      patch.attackSeconds, patch.decaySeconds, patch.sustainRatio, patch.releaseSeconds, patch.tailSeconds];
    if (finite.some((value) => !Number.isFinite(value)) || source.tempoBpm <= 0 ||
        source.bars !== 2 || source.beatsPerBar !== 4 || patch.sampleRate !== 48000 || patch.masterGain <= 0 || patch.masterGain > 1 ||
        patch.waveform !== "triangle" ||
        patch.voicePeak <= 0 || patch.voicePeak > 1 || patch.tailSeconds <= 0 || patch.tailSeconds > 0.5 ||
        !Array.isArray(motif.events) || motif.events.length < 1 || motif.events.length > 16) {
      throw new Error("Preview source settings failed their finite, bounded validation.");
    }
    for (const event of motif.events) {
      if (![event.beat, event.midi, event.durationBeats, event.velocity].every(Number.isFinite) ||
          event.beat < 0 || event.durationBeats <= 0 || event.beat + event.durationBeats > phraseBeats ||
          !Number.isInteger(event.midi) || event.midi < 0 || event.midi > 127 || event.velocity < 0 || event.velocity > 1) {
        throw new Error(`Invalid note event in motif ${motif.id}.`);
      }
    }
  }

  function writeAscii(view, offset, value) {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  }

  function encodePcm16Wav(buffer) {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const frames = buffer.length;
    const bytesPerSample = 2;
    const dataBytes = frames * channels * bytesPerSample;
    const bytes = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(bytes);
    writeAscii(view, 0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeAscii(view, 8, "WAVE");
    writeAscii(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bytesPerSample, true);
    view.setUint16(32, channels * bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeAscii(view, 36, "data");
    view.setUint32(40, dataBytes, true);

    let offset = 44;
    for (let frame = 0; frame < frames; frame += 1) {
      for (let channel = 0; channel < channels; channel += 1) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame]));
        const quantized = sample < 0 ? sample * 32768 : sample * 32767;
        view.setInt16(offset, Math.round(quantized), true);
        offset += bytesPerSample;
      }
    }
    return new Blob([bytes], { type: "audio/wav" });
  }

  function renderMotif(motif) {
    validateMotif(motif);
    const patch = source.patch;
    const duration = phraseSeconds + patch.tailSeconds;
    const frameCount = Math.ceil(duration * patch.sampleRate);
    if (!Number.isFinite(frameCount) || frameCount < 1 || frameCount > patch.sampleRate * 10) {
      throw new Error("Preview frame count exceeds its ten-second bound.");
    }
    const context = new OfflineAudioContext(2, frameCount, patch.sampleRate);
    const output = context.createGain();
    output.gain.value = patch.masterGain;
    output.connect(context.destination);

    motif.events.forEach((event) => {
      const start = event.beat * secondsPerBeat;
      const noteLength = event.durationBeats * secondsPerBeat;
      const releaseStart = start + noteLength;
      const end = releaseStart + patch.releaseSeconds;
      const voice = context.createOscillator();
      const envelope = context.createGain();
      const maxGain = patch.voicePeak * event.velocity;
      const sustainGain = maxGain * patch.sustainRatio;

      voice.type = patch.waveform;
      voice.frequency.setValueAtTime(midiToHz(event.midi), start);
      envelope.gain.setValueAtTime(0.00001, start);
      envelope.gain.linearRampToValueAtTime(maxGain, start + patch.attackSeconds);
      envelope.gain.linearRampToValueAtTime(sustainGain, start + patch.attackSeconds + patch.decaySeconds);
      envelope.gain.setValueAtTime(sustainGain, releaseStart);
      envelope.gain.linearRampToValueAtTime(0.00001, end);
      voice.connect(envelope);
      envelope.connect(output);
      voice.start(start);
      voice.stop(end);
    });

    let timer;
    const rendering = context.startRendering();
    const deadline = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        const error = new Error("Offline render exceeded its 8-second per-preview limit; stop this run and report it to root.");
        error.code = "RENDER_TIMEOUT";
        reject(error);
      }, 8000);
    });
    return Promise.race([rendering, deadline]).finally(() => clearTimeout(timer));
  }

  function stopAudio() {
    playRequestToken += 1;
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    activeAudio = null;
    stopButton.disabled = true;
  }

  async function playAudio(audio, title) {
    stopAudio();
    const requestToken = ++playRequestToken;
    activeAudio = audio;
    stopButton.disabled = false;
    try {
      await audio.play();
      if (requestToken === playRequestToken && activeAudio === audio) {
        status.textContent = `Playing ${title}. Use Stop audio to stop immediately.`;
      }
    } catch (error) {
      if (requestToken === playRequestToken && activeAudio === audio) {
        activeAudio = null;
        stopButton.disabled = true;
        status.textContent = `Could not play preview: ${error.message}`;
      }
    }
  }

  function renderRow(motif, record) {
    const row = document.createElement("li");
    row.className = "preview-row";
    const meta = document.createElement("div");
    meta.className = "preview-meta";
    const title = document.createElement("strong");
    title.textContent = `${motif.id} — ${motif.title}`;
    const metrics = document.createElement("span");
    metrics.textContent = `${record.durationSeconds.toFixed(2)} s · PCM sample peak ${formatDbfs(record.peak)} · RMS ${formatDbfs(record.rms)} · not LUFS / not true peak`;
    meta.append(title, metrics);

    const play = document.createElement("button");
    play.type = "button";
    play.textContent = `Play ${motif.id}`;
    play.setAttribute("aria-label", `Play ${motif.title}`);
    const audio = document.createElement("audio");
    audio.preload = "none";
    audio.hidden = true;
    audio.src = record.url;
    play.addEventListener("click", () => { void playAudio(audio, motif.title); });
    audio.addEventListener("ended", () => {
      if (activeAudio === audio) {
        stopAudio();
        status.textContent = `${motif.title} finished.`;
      }
    });

    const download = document.createElement("a");
    download.className = "download";
    download.href = record.url;
    download.download = `plan32-motif-${motif.id.toLowerCase()}.wav`;
    download.textContent = `Download ${motif.id} WAV`;
    const manifest = document.createElement("a");
    manifest.className = "download";
    manifest.href = record.manifestUrl;
    manifest.download = `plan32-motif-${motif.id.toLowerCase()}-manifest.json`;
    manifest.textContent = `Download ${motif.id} data`;
    row.append(meta, play, download, manifest, audio);
    return row;
  }

  function renderSavedRow(file) {
    const row = document.createElement("li");
    row.className = "preview-row";
    const meta = document.createElement("div");
    meta.className = "preview-meta";
    const title = document.createElement("strong");
    title.textContent = file.name;
    const note = document.createElement("span");
    note.textContent = "Saved WAV · owner listening only · no LUFS/true-peak claim";
    meta.append(title, note);
    const audio = document.createElement("audio");
    audio.preload = "none";
    audio.hidden = true;
    audio.src = URL.createObjectURL(file);
    savedUrls.add(audio.src);
    const play = document.createElement("button");
    play.type = "button";
    play.textContent = "Play";
    play.setAttribute("aria-label", `Play saved preview ${file.name}`);
    play.addEventListener("click", () => { void playAudio(audio, file.name); });
    audio.addEventListener("ended", () => {
      if (activeAudio === audio) {
        stopAudio();
        status.textContent = `${file.name} finished.`;
      }
    });
    row.append(meta, play, audio);
    return row;
  }

  function refreshDescription() {
    description.textContent = getMotif(select.value)?.description || "";
  }

  source.motifs.forEach((motif) => {
    const option = document.createElement("option");
    option.value = motif.id;
    option.textContent = `${motif.id} — ${motif.title}`;
    select.append(option);
  });
  refreshDescription();

  select.addEventListener("change", () => {
    stopAudio();
    refreshDescription();
  });

  renderButton.addEventListener("click", async () => {
    if (renderInProgress) return;
    const motif = getMotif(select.value);
    if (renderFailedClosed) {
      status.textContent = "Rendering stopped after a bounded failure. Close the page and report the error to root.";
      return;
    }
    if (!motif || typeof OfflineAudioContext !== "function") {
      status.textContent = "This browser does not provide OfflineAudioContext. Stop here and report the limitation to root.";
      return;
    }
    renderInProgress = true;
    renderButton.disabled = true;
    select.disabled = true;
    stopAudio();
    status.textContent = `Rendering ${motif.title} once. Do not start another render while this one is running.`;
    const startedAt = performance.now();
    let buffer;
    try {
      buffer = await renderMotif(motif);
      const measured = measurePcm(buffer);
      if (measured.peak >= 1) throw new Error("PCM sample peak reached full scale; no preview was saved.");
      const wav = encodePcm16Wav(buffer);
      const url = URL.createObjectURL(wav);
      const old = rendered.get(motif.id);
      if (old) {
        URL.revokeObjectURL(old.url);
        URL.revokeObjectURL(old.manifestUrl);
      }
      const record = {
        url,
        peak: measured.peak,
        rms: measured.rms,
        durationSeconds: buffer.length / buffer.sampleRate,
        elapsedMilliseconds: Math.round(performance.now() - startedAt)
      };
      const manifest = {
        artifact: "quackpot-plan32-bare-melody-preview",
        sourceVersion: source.sourceVersion,
        motif: { id: motif.id, title: motif.title, events: motif.events },
        tempoBpm: source.tempoBpm,
        tonic: source.tonic,
        bars: source.bars,
        beatsPerBar: source.beatsPerBar,
        patch: source.patch,
        render: {
          fileName: `plan32-motif-${motif.id.toLowerCase()}.wav`,
          format: "WAV PCM16",
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
          durationSeconds: record.durationSeconds,
          elapsedMilliseconds: record.elapsedMilliseconds,
          commonGainPolicy: "fixed masterGain; no per-preview normalization or compression",
          samplePeakDbfs: numericDbfs(measured.peak),
          rmsDbfs: numericDbfs(measured.rms),
          measurementBasis: "float32 OfflineAudioContext render samples before PCM16 quantization; PCM sample peak and RMS only; not LUFS or true peak"
        }
      };
      record.manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }));
      rendered.set(motif.id, record);
      list.replaceChildren(...source.motifs.filter((item) => rendered.has(item.id)).map((item) => renderRow(item, rendered.get(item.id))));
      status.textContent = `${motif.title} rendered once at fixed common gain. PCM sample peak ${formatDbfs(record.peak)}; RMS ${formatDbfs(record.rms)}. These are not LUFS or true-peak readings. Download the WAV if needed.`;
    } catch (error) {
      status.textContent = `Preview render stopped: ${error.message}`;
      renderFailedClosed = true;
    } finally {
      buffer = null;
      renderInProgress = false;
      renderButton.disabled = renderFailedClosed;
      select.disabled = false;
      refreshDescription();
    }
  });

  stopButton.addEventListener("click", () => {
    stopAudio();
    status.textContent = "Audio stopped.";
  });

  savedFiles.addEventListener("change", () => {
    stopAudio();
    for (const url of savedUrls) URL.revokeObjectURL(url);
    savedUrls.clear();
    const files = [...savedFiles.files].filter((file) => file.name.toLowerCase().endsWith(".wav"));
    savedList.replaceChildren(...files.map(renderSavedRow));
    status.textContent = files.length ? `Loaded ${files.length} saved WAV preview${files.length === 1 ? "" : "s"}. No audio starts until Play is pressed.` : "Choose one or more saved WAV preview files.";
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && activeAudio) {
      stopAudio();
      status.textContent = "Audio stopped because the page was hidden.";
    }
  });

  window.addEventListener("pagehide", () => {
    stopAudio();
    rendered.forEach((record) => {
      URL.revokeObjectURL(record.url);
      URL.revokeObjectURL(record.manifestUrl);
    });
    rendered.clear();
    for (const url of savedUrls) URL.revokeObjectURL(url);
    savedUrls.clear();
  }, { once: true });
})();
