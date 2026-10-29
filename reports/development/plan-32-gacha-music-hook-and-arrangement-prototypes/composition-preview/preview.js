(() => {
  "use strict";
  const data = window.QUACKPOT_PLAN32_EXTENSIONS;
  const ids = ["S1", "S2", "S3"];
  const select = document.getElementById("structure-select");
  const description = document.getElementById("description");
  const status = document.getElementById("status");
  const renderButton = document.getElementById("render-button");
  const stopButton = document.getElementById("stop-button");
  const fileInput = document.getElementById("saved-files");
  const savedList = document.getElementById("saved-list");
  const savedUrls = new Set();
  let activeAudio = null;
  let rendering = false;

  function validateSource() {
    if (!data || data.schema !== "quackpot.plan32-composition-extensions/v1" ||
        data.source.sha256 !== "3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02" ||
        data.source.events.length !== 10 || data.source.tempoBpm !== 100 || data.source.beatsPerBar !== 4 ||
        data.source.tonic !== "D" || data.source.tonicMidi !== 62 || data.structures.length !== 3 || data.render.sampleRate !== 48000 ||
        data.render.channels !== 2 || data.render.format !== "PCM16" || data.render.normalization !== "none") {
      throw new Error("Composition source identity or render settings failed validation.");
    }
    const expected = [[0,78,.5],[.5,81,.5],[1,86,1],[2,85,1],[3,81,.5],[3.5,78,.5],[4,83,1],[5,81,.5],[5.5,78,.5],[6,74,2]];
    data.source.events.forEach((event, index) => {
      const row = expected[index];
      if (!row || event.beat !== row[0] || event.midi !== row[1] || event.durationBeats !== row[2] || event.velocity !== .78) {
        throw new Error(`Selected hook event ${index} no longer matches its exact source.`);
      }
    });
    for (const structure of data.structures) {
      if (!ids.includes(structure.id) || !Array.isArray(structure.lead) || !Array.isArray(structure.backingEchoes)) throw new Error("Malformed structure source.");
      for (const [role, events] of [["lead", structure.lead], ["backing", structure.backingEchoes]]) {
        for (const event of events) {
          if (![event.beat,event.midi,event.durationBeats,event.velocity].every(Number.isFinite) ||
              event.beat < 0 || event.beat + event.durationBeats > 32 || !Number.isInteger(event.midi) ||
              event.midi < 0 || event.midi > 127 || event.durationBeats <= 0 || event.velocity < 0 || event.velocity > 1) {
            throw new Error(`Invalid ${role} event in ${structure.id}.`);
          }
          if (role === "lead" && event.origin !== "new") throw new Error(`${structure.id} answer notes must stay explicitly marked new.`);
          if (role === "backing" && (event.origin !== "source-derived" || !Number.isInteger(event.sourceEventIndex) ||
              !data.source.events[event.sourceEventIndex])) throw new Error(`${structure.id} echo source link is missing.`);
        }
      }
    }
  }

  function sourceHook(structure) {
    const fullHookStarts = structure.id === "S3" ? [0] : [0, 24];
    return fullHookStarts.flatMap((start) => data.source.events.map((event, sourceEventIndex) => ({
      beat: start + event.beat, midi: event.midi, durationBeats: event.durationBeats, velocity: event.velocity,
      origin: "source-reused", sourceEventIndex, role: "lead"
    })));
  }

  function eventSet(structure) {
    const lead = [...sourceHook(structure), ...structure.lead.map((event) => ({ ...event, role: "lead" }))];
    const echoes = structure.backingEchoes.map((event) => ({ ...event, role: "backing" }));
    const bed = [];
    for (let bar = 0; bar < 8; bar += 1) {
      for (const event of data.sharedBed) bed.push({ ...event, beat: event.beat + bar * 4, role: "bed", origin: "shared-support" });
    }
    return [...lead, ...echoes, ...bed].sort((a, b) => a.beat - b.beat || a.role.localeCompare(b.role));
  }

  function midiHz(midi) { return 440 * (2 ** ((midi - 69) / 12)); }

  function measure(buffer) {
    let peak = 0;
    let sum = 0;
    let count = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const samples = buffer.getChannelData(channel);
      for (const sample of samples) {
        if (!Number.isFinite(sample)) throw new Error("Renderer produced a nonfinite PCM sample.");
        peak = Math.max(peak, Math.abs(sample));
        sum += sample * sample;
        count += 1;
      }
    }
    if (peak >= 1) throw new Error("Renderer reached full scale; preserve the approved gain and stop for review.");
    const rms = Math.sqrt(sum / Math.max(count, 1));
    const db = (value) => value > 0 ? Number((20 * Math.log10(value)).toFixed(2)) : null;
    return { samplePeakDbfs: db(peak), rmsDbfs: db(rms), basis: "PCM sample readings only; not LUFS or true peak; no normalization" };
  }

  function writeAscii(view, offset, value) {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  }

  function wavBlob(buffer) {
    const channels = 2;
    const frames = buffer.length;
    const dataBytes = frames * channels * 2;
    const bytes = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(bytes);
    writeAscii(view,0,"RIFF"); view.setUint32(4,36+dataBytes,true); writeAscii(view,8,"WAVE");
    writeAscii(view,12,"fmt "); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,channels,true);
    view.setUint32(24,buffer.sampleRate,true); view.setUint32(28,buffer.sampleRate*channels*2,true);
    view.setUint16(32,channels*2,true); view.setUint16(34,16,true); writeAscii(view,36,"data"); view.setUint32(40,dataBytes,true);
    let offset = 44;
    for (let frame = 0; frame < frames; frame += 1) {
      for (let channel = 0; channel < channels; channel += 1) {
        const value = Math.max(-1,Math.min(1,buffer.getChannelData(channel)[frame]));
        view.setInt16(offset,value < 0 ? Math.round(value*32768) : Math.round(value*32767),true); offset += 2;
      }
    }
    if (bytes.byteLength > 3800000) throw new Error(`WAV exceeded 3,800,000-byte cap: ${bytes.byteLength}.`);
    return new Blob([bytes],{type:"audio/wav"});
  }

  function envelope(context, voice, event, voicePeak, patch, destination, secondsPerBeat) {
    const start = event.beat * secondsPerBeat;
    const noteEnd = start + event.durationBeats * secondsPerBeat;
    const voiceEnd = noteEnd + patch.releaseSeconds;
    const amp = context.createGain();
    const peak = voicePeak * event.velocity;
    voice.frequency.setValueAtTime(midiHz(event.midi),start);
    amp.gain.setValueAtTime(.00001,start);
    amp.gain.linearRampToValueAtTime(peak,start+patch.attackSeconds);
    amp.gain.linearRampToValueAtTime(peak*patch.sustainRatio,start+patch.attackSeconds+patch.decaySeconds);
    amp.gain.setValueAtTime(peak*patch.sustainRatio,noteEnd);
    amp.gain.linearRampToValueAtTime(.00001,voiceEnd);
    voice.connect(amp); amp.connect(destination); voice.start(start); voice.stop(voiceEnd);
  }

  async function render(structure) {
    validateSource();
    const renderStarted = performance.now();
    const spec = data.render;
    const duration = spec.musicalSeconds + spec.tailSeconds;
    const frameCount = Math.ceil(duration * spec.sampleRate);
    if (frameCount !== 927360 || frameCount * spec.channels * 4 !== 7418880) throw new Error("Render buffer dimensions changed from the reviewed cap.");
    const context = new OfflineAudioContext(2,frameCount,spec.sampleRate);
    const master = context.createGain(); master.gain.value = spec.masterGain; master.connect(context.destination);
    const secondsPerBeat = 60 / data.source.tempoBpm;
    for (const event of eventSet(structure)) {
      const voice = context.createOscillator(); voice.type = spec.waveform;
      envelope(context,voice,event,event.role === "lead" ? spec.leadVoicePeak : spec.backingVoicePeak,spec,master,secondsPerBeat);
    }
    let timer;
    const timeout = new Promise((_,reject) => { timer=setTimeout(() => reject(new Error("Offline render exceeded 15 seconds; stop and report.")),15000); });
    let buffer;
    try { buffer = await Promise.race([context.startRendering(),timeout]); } finally { clearTimeout(timer); }
    if (buffer.length !== frameCount || buffer.sampleRate !== 48000 || buffer.numberOfChannels !== 2) throw new Error("Rendered audio dimensions failed validation.");
    return { buffer, measurements: measure(buffer), events: eventSet(structure), elapsedMilliseconds: Number((performance.now()-renderStarted).toFixed(1)) };
  }

  function download(name, blob) {
    const url = URL.createObjectURL(blob); savedUrls.add(url);
    const anchor = document.createElement("a"); anchor.href=url; anchor.download=name; anchor.hidden=true;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => { URL.revokeObjectURL(url); savedUrls.delete(url); }, 60000);
  }

  async function renderSelected() {
    if (rendering) return;
    rendering = true; renderButton.disabled = true;
    let failed = false;
    const structure = data.structures.find((item) => item.id === select.value);
    try {
      stopAudio(); status.textContent = `Rendering ${structure.id} serially with the shared patch and gain…`;
      const result = await render(structure);
      const wav = wavBlob(result.buffer);
      const measurement = result.measurements;
      const provenance = {
        artifact: "quackpot-plan32-composition-preview",
        schema: data.schema,
        source: { file: data.source.file, sha256: data.source.sha256, motifId: data.source.motifId, title: data.source.title, sourceVersion: data.source.sourceVersion },
        structure: { id: structure.id, title: structure.title, sections: structure.sections },
        render: { tempoBpm:data.source.tempoBpm, bars:8, musicalSeconds:19.2, tailSeconds:.12, durationSeconds:19.32, elapsedMilliseconds:result.elapsedMilliseconds,
          sampleRate:48000, channels:2, format:"PCM16", waveform:"triangle", masterGain:.7,
          normalization:"none", measurements },
        events: result.events.map((event) => ({ beat:event.beat,midi:event.midi,durationBeats:event.durationBeats,velocity:event.velocity,
          role:event.role,origin:event.origin,sourceEventIndex:event.sourceEventIndex ?? null,transform:event.transform ?? null,section:event.section ?? null })),
        loop: "No seamless-loop or crossfade claim; music form plus release tail"
      };
      const base = `plan32-extension-${structure.id.toLowerCase()}-${({S1:"call-answer",S2:"bookend",S3:"spacious"})[structure.id]}`;
      const json = new Blob([`${JSON.stringify(provenance,null,2)}\n`],{type:"application/json"});
      if (json.size > 32768) throw new Error(`Provenance exceeded 32 KiB cap: ${json.size}.`);
      download(`${base}.wav`,wav); download(`${base}-provenance.json`,json);
      status.textContent = `${structure.id} rendered: 19.32 seconds; ${wav.size} WAV bytes; PCM sample peak ${measurement.samplePeakDbfs ?? "−∞"} dBFS and RMS ${measurement.rmsDbfs ?? "−∞"} dBFS. These are not LUFS or true peak.`;
    } catch (error) {
      status.textContent = `Render stopped: ${error.message}`;
      failed = true;
    } finally { rendering=false; renderButton.disabled=failed; }
  }

  function stopAudio() {
    if (activeAudio) { activeAudio.pause(); activeAudio.currentTime=0; activeAudio=null; }
    stopButton.disabled=true;
  }

  function clearSaved() {
    stopAudio();
    for (const url of savedUrls) URL.revokeObjectURL(url);
    savedUrls.clear(); savedList.replaceChildren();
  }

  function playSaved(file,url,button) {
    stopAudio(); const audio=new Audio(url); activeAudio=audio; stopButton.disabled=false;
    audio.addEventListener("ended",stopAudio,{once:true});
    audio.addEventListener("error",() => { status.textContent=`Could not play ${file.name}.`; stopAudio(); },{once:true});
    button.addEventListener("click",stopAudio,{once:true});
    void audio.play().catch((error) => { status.textContent=`Playback did not start: ${error.message}`; stopAudio(); });
  }

  function addSavedFiles() {
    clearSaved();
    for (const file of [...fileInput.files]) {
      if (!file.name.toLowerCase().endsWith(".wav") || file.size > 3800000) { status.textContent=`Skipped unsupported or oversized file ${file.name}.`; continue; }
      const url=URL.createObjectURL(file); savedUrls.add(url);
      const li=document.createElement("li"); const button=document.createElement("button");
      button.type="button"; button.textContent=`Play ${file.name}`; button.addEventListener("click",() => playSaved(file,url,button));
      li.append(button); savedList.append(li);
    }
  }

  for (const item of data.structures) {
    const option=document.createElement("option"); option.value=item.id; option.textContent=`${item.id} — ${item.title}`; select.append(option);
  }
  function updateDescription() { description.textContent=data.structures.find((item) => item.id===select.value)?.sections.map((section) => `bars ${section.bars}: ${section.kind}`).join(" · ") ?? ""; }
  select.addEventListener("change",updateDescription);
  renderButton.addEventListener("click",renderSelected);
  stopButton.addEventListener("click",stopAudio);
  fileInput.addEventListener("change",addSavedFiles);
  window.addEventListener("pagehide",() => { stopAudio(); clearSaved(); });
  try { validateSource(); updateDescription(); }
  catch (error) { renderButton.disabled=true; status.textContent=`Source validation failed: ${error.message}`; }
})();
