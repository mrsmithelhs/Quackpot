# Making a Zero-Sample Web Audio Theme Sound Like Real Instruments: Instrument Topologies, a Procedural Room, Micro-Groove, and Suno Reference Prep

Your clinical sound mostly comes from static spectra, not from the oscillators themselves. Each instrument needs a spectrum that changes during the note (a bright attack that turns into a darker body), a short noise transient, and a little shared "air". Pick the method per instrument: modal partials plus an FM transient for the marimba, a velocity-driven FM index for the electric piano, Karplus-Strong pre-rendered into an `AudioBuffer` for plucks, and a near-sine `PeriodicWave` with chiff and delayed vibrato for the ocarina. For the Suno reference, export a separate dry, vibrato-free, lead-forward "conditioning mix".

## TL;DR
- **Instruments:** Make every note's spectrum evolve over time. The marimba combines a fundamental, a decaying partial at 3.92× (measured marimba tuning), a fast 1:4 FM burst and an 8 ms mallet click. Use 1:2.76 only if you want glockenspiel clang. The EP uses a 1:1 "body" FM pair plus a 14:1 "tine" modulator whose index scales with velocity. Plucks are Karplus-Strong rendered in JS into an `AudioBuffer`, which beats a `PeriodicWave` stack. The ocarina is nearly sinusoidal (a Helmholtz resonator), so your "predominantly odd harmonics" spec is closer to a clarinet.\[1\]\[2\]
- **Room and groove:** Use a deterministic stereo IR with 8 early taps (7–34 ms) and a decorrelated tail at RT60 ≈ 0.32–0.38 s, damped from ~3 kHz downward. Send Lead ~13%, Chords ~25%, Bass ~3%. For groove, swing lightly (52–54%) and delay only the lead's on-beat eighths by ~10–15 ms. Jazz timing research shows that delaying *all* soloist notes uniformly did not improve swing ratings.
- **Suno Cover:** How Suno extracts melody is not publicly documented. The closest published analog, MusicGen-melody, keeps only the dominant pitch class per ~128 ms chroma frame and strips drums and bass. Inference from that: a dry, vibrato-free reference with a loud, fundamental-dominant lead, a fast (not clicky) attack and clear gaps between repeated notes should preserve contour best. Test it, and use Spotify's Basic Pitch as a free proxy check.\[3\]

---

## Key Findings

1. **What separates "test oscillator" from "instrument" is time-varying brightness.** Every reference design found shows this. Yamaha's DX7 programming guidance builds an electric piano from a mellow, slowly decaying carrier/modulator "body" and a separate tine whose "carrier and the modulators here will have higher frequencies and faster decaying envelopes". A published DX7 Rhodes patch notes that "the 14:1 ratio of Ops #1 and #2 creates a good approximation of the tine".\[4\] All four recipes below follow that principle.
2. **Choose the marimba ratio from physics, not folklore.** An ideal free bar's second mode is at 2.76× the fundamental. Real marimba bars are undercut so it sits near 4× (measured: 1.00, 3.92, 9.24, 16.27…), and xylophones near 3× (1.00, 3.00, 6.16…).\[5\]\[6\] In FM terms, 1:2.76 gives inharmonic, glockenspiel-like sidebands, which is the metallic clang you want to avoid.
3. **`DelayNode` feedback cannot make a 130–660 Hz string**, because a delay inside a cycle is clamped to at least one render quantum.\[7\] Pre-rendering Karplus-Strong in plain JS sidesteps this completely and renders identically in live and offline contexts.
4. **Uniform "laid-back" timing is the wrong lever.** In Nelias et al. (Communications Physics, 2022), delaying a soloist's *downbeats* while keeping offbeats synchronized raised the odds that jazz musicians rated a track as swinging by about 7.5× (95% CI 3.2–17.5; 19 semi-professional and 18 professional jazz musicians rating three pieces). Delaying all soloist notes showed no significant difference.
5. **Suno's internals are undocumented.** The help center confirms only that Covers transform "the style of an existing song while keeping the melody", are in Beta, apply only to songs you created, and that "it may take a few tries".\[8\]\[9\] Everything else in Inquiry D is inference from published analogs, and is labeled as such.

---

## Details

### Shared helpers (deterministic, used everywhere)

These helpers keep every render bit-identical across `AudioContext` and `OfflineAudioContext`, provided both run at 48 kHz.

```js
// Deterministic PRNG (mulberry32): same seed -> same noise in live + offline renders
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

// One shared 1-second white-noise buffer per context; vary hits by start offset
function makeNoiseBuffer(ctx, seconds = 1, seed = 99) {
  const n = Math.ceil(seconds * ctx.sampleRate);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0), r = mulberry32(seed);
  for (let i = 0; i < n; i++) d[i] = r() * 2 - 1;
  return b;
}
```

Build one noise buffer per context rather than sharing `AudioBuffer`s across contexts. It is cheap and avoids edge cases.

Two Web Audio facts these recipes depend on:
- **FM depth is in Hz.** Connect modulator → `GainNode` → `carrier.frequency`, and set the gain to index × modulator frequency (Δf = I·fₘ). Your brief writes `modulationIndex * f_carrier`. That is the same thing only when the ratio is 1:1, so use fₘ.
- **`PeriodicWave` is normalized by default.** MDN: "If normalized, the resulting wave will have a maximum absolute peak value of 1."\[10\] Only the *relative* sizes of your coefficients matter, so set loudness with a `GainNode`.

---

### Inquiry A1 — Cozy wooden marimba / xylophone lead (C5–D6)

**Pushback on the ratio question:** 2.76 is the *untuned* ideal-beam ratio. Euphonics explains that makers undercut bars so this ratio is "close to 3 or, much more commonly, 4", and that measured marimba bars run 1.00, 3.92, 9.24…\[5\] In a 2-op FM pair, any non-integer ratio produces inharmonic sidebands, which is exactly the "clang". Use 2.76 only for a deliberately glassy toy/glock color.

**Topology (wiring):**
```
[mod sine 4·f] → [GainNode: I(t)·4f] ──┐
                                        ▼
[carrier sine f] (.frequency) → [ampEnv τ1 ~0.25–0.6 s] ─┐
[partial sine 3.92·f] → [ampEnv τ ≈ 60 ms] ───────────────┤
[partial sine 9.24·f] → [ampEnv τ ≈ 18 ms] ───────────────┼→ [lowpass 6 kHz, Q 0.5] → [voice out]
[noise buf 8 ms] → [bandpass 2.8 kHz Q 1.2] → [env] ──────┘
```
- A **1:4 FM burst** produces sidebands at f, 3f, 5f, 7f, 9f: a hollow, odd-leaning, xylophone-like attack. The orchestration literature describes xylophone spectra as "tuned more like a clarinet", with prominent 3rd and 5th partials.\[11\] Let the index decay with τ ≈ 15–25 ms so it is gone by about 80 ms. That decay is what makes the sound "woody" rather than "clangy". It is my starting value, so tune it by ear.
- **The 3.92× partial** is the marimba's tuned overtone. Keep it at about −11 dB, scaled by velocity, and short.
- **The "resonator"** is simply a longer τ on the fundamental. A marimba's tube is tuned to the bar's fundamental and "spends everything on the note itself". Upper-octave marimba notes are short and woody, so τ shrinks with pitch.\[12\]\[13\]

```js
function playWoodBar(ctx, dest, t, midi, vel, noiseBuf, seed = 1) {
  const f = mtof(midi), v = Math.max(0.05, Math.min(1, vel));
  const tau1 = Math.min(0.6, Math.max(0.22, 0.45 * Math.sqrt(523.25 / f))); // body decay
  const out = new GainNode(ctx, { gain: 1 });
  const tone = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 6000, Q: 0.5 });
  out.connect(tone).connect(dest);
  const end = t + tau1 * 6;

  // Carrier + 1:4 FM transient
  const car = new OscillatorNode(ctx, { type: 'sine', frequency: f });
  const mod = new OscillatorNode(ctx, { type: 'sine', frequency: 4 * f });
  const modG = new GainNode(ctx, { gain: 0 });
  const I0 = 0.4 + 1.2 * v;                 // peak index 0.4–1.6
  modG.gain.setValueAtTime(I0 * 4 * f, t);  // Δf = I·fm (Hz)
  modG.gain.setTargetAtTime(0, t, 0.018);   // ~18 ms time constant
  mod.connect(modG).connect(car.frequency);
  const carEnv = new GainNode(ctx, { gain: 0 });
  carEnv.gain.setValueAtTime(0, t);
  carEnv.gain.linearRampToValueAtTime(0.5 * v, t + 0.002);
  carEnv.gain.setTargetAtTime(0, t + 0.002, tau1);
  car.connect(carEnv).connect(out);

  // Tuned marimba partials (ratios from measured bars)
  [[3.92, 0.14, 0.060], [9.24, 0.05, 0.018]].forEach(([r, a, tau]) => {
    if (r * f > 20000) return;
    const o = new OscillatorNode(ctx, { type: 'sine', frequency: r * f });
    const g = new GainNode(ctx, { gain: 0 });
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(a * v * v, t + 0.0015); // brighter when harder
    g.gain.setTargetAtTime(0, t + 0.0015, tau);
    o.connect(g).connect(out); o.start(t); o.stop(end);
  });

  // Mallet click: 8 ms band-passed noise, deterministic offset per note
  const r = mulberry32(seed + midi * 131);
  const n = new AudioBufferSourceNode(ctx, { buffer: noiseBuf });
  const bp = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 2200 + 1600 * v, Q: 1.2 });
  const ng = new GainNode(ctx, { gain: 0 });
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.10 * v, t + 0.0008);
  ng.gain.linearRampToValueAtTime(0, t + 0.008);
  n.connect(bp).connect(ng).connect(out);
  n.start(t, r() * 0.9, 0.012);

  [car, mod].forEach(o => { o.start(t); o.stop(end); });
}
```

**Variants.** For a *xylophone*, change 3.92→3.0 and 9.24→6.16 (measured xylophone ratios), shorten τ1 by ~40%, and raise the click.\[5\] For a *kalimba*, drop the 3.92 partial, change FM to 1:1 with index ≤0.8, and lengthen τ1 to 0.8–1.2 s. I did not find sourced kalimba tine overtone ratios, so tune those by ear.

---

### Inquiry A2 — Warm electric piano for chords (C3–G4)

**(a) FM topology (3 oscillators: one carrier, two modulators).** This follows the DX7 recipe of a 1:1 body plus a high-ratio, fast-decaying tine. A KVR thread on reconstructing the DX patch also starts from a 1:1 pair.\[14\]\[15\]

```
[mod A sine 1·f]  → [GainNode Ibody(t)·f]  ─┐
[mod B sine 14·f] → [GainNode Itine(t)·14f] ─┼→ carrier.frequency
[carrier sine f] → [ampEnv: 3 ms attack, τ≈1.2 s] → [asym WaveShaper] → [HP 25 Hz] → [LP env 4k→1.6k] → [StereoPanner + autopan LFO]
```

```js
function playEPiano(ctx, dest, t, midi, vel, durS, pan = 0) {
  const f = mtof(midi), v = Math.max(0.05, Math.min(1, vel));
  const car = new OscillatorNode(ctx, { type: 'sine', frequency: f });
  const mA = new OscillatorNode(ctx, { type: 'sine', frequency: f });       // body 1:1
  const mB = new OscillatorNode(ctx, { type: 'sine', frequency: 14 * f });  // tine 14:1
  const gA = new GainNode(ctx, { gain: 0 }), gB = new GainNode(ctx, { gain: 0 });
  const Ibody = 0.3 + 1.7 * Math.pow(v, 1.5);  // velocity → brightness (index)
  const Itine = 0.35 * Math.pow(v, 2);         // tine only speaks when played hard
  gA.gain.setValueAtTime(Ibody * f, t);
  gA.gain.setTargetAtTime(0.15 * f, t, 0.35);  // body index decays faster than amp
  gB.gain.setValueAtTime(Itine * 14 * f, t);
  gB.gain.setTargetAtTime(0, t, 0.03);         // tine "ping" gone in ~100 ms
  mA.connect(gA).connect(car.frequency);
  mB.connect(gB).connect(car.frequency);

  const amp = new GainNode(ctx, { gain: 0 });
  const rel = t + durS;
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.28 * (0.5 + 0.5 * v), t + 0.003);
  amp.gain.setTargetAtTime(0, t + 0.003, 1.2);  // natural decay
  amp.gain.cancelAndHoldAtTime(rel);           // then the damper
  amp.gain.setTargetAtTime(0, rel, 0.06);

  const shaper = new WaveShaperNode(ctx, { curve: asymSoftCurve(1.6, 0.15), oversample: '4x' });
  const dc = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 25 });
  const lp = new BiquadFilterNode(ctx, { type: 'lowpass', Q: 0.5, frequency: 4000 });
  lp.frequency.setValueAtTime(4000, t);
  lp.frequency.setTargetAtTime(1600, t, 0.25);  // bark at onset, warm sustain
  const p = new StereoPannerNode(ctx, { pan });
  car.connect(amp).connect(shaper).connect(dc).connect(lp).connect(p).connect(dest);
  const end = rel + 0.5;
  [car, mA, mB].forEach(o => { o.start(t); o.stop(end); });
}

// Asymmetric tanh: adds even harmonics (2nd) like an off-axis Rhodes pickup
function asymSoftCurve(k = 1.6, bias = 0.15, n = 2048) {
  const c = new Float32Array(n), off = Math.tanh(k * bias), norm = Math.tanh(k * (1 + bias)) - off;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = (Math.tanh(k * (x + bias)) - off) / norm;
  }
  return c;
}
```

**Why the asymmetric shaper.** Münster, Pfeifle, Weinrich & Keil (JASA, 2014) trace the Rhodes growl and its harmonic distortion to the tine moving through the pickup's position-dependent, nonlinear magnetic field. The Rhodes service-manual voicing notes say that as the tine nears the pickup axis, "the fundamental and odd harmonics decrease, causing the second harmonics to rise".\[16\] An asymmetric curve is the cheapest native-node way to get that even-harmonic warmth. It also creates DC, which is why the 25 Hz high-pass follows it.

**Pushback on your chord filter.** A fixed 1.2–1.35 kHz low-pass deletes the tine entirely (14f is 1.8–5.5 kHz across C3–G4) and makes any EP sound like felt. Use the *enveloped* low-pass above (4 kHz → 1.6 kHz over ~250 ms) so the bark appears only on the attack.

**(b) `PeriodicWave` alternative (harmonics 1–12).** These are my design values. They are not measured Rhodes data, but the shape follows the pickup physics above: a strong 2nd, then a fast roll-off.

```js
const epImag = new Float32Array([0, 1.00, 0.42, 0.16, 0.10, 0.05, 0.035, 0.022, 0.014, 0.009, 0.006, 0.004, 0.003]);
const epReal = new Float32Array([0, 0,    0.08, 0,    0.03, 0,    0.01,  0,     0,     0,     0,     0,     0]);
// small cosine terms skew the waveform (asymmetry) without changing magnitudes much
const epWave = ctx.createPeriodicWave(epReal, epImag); // normalized: peak = 1
```

A static wave cannot brighten on velocity. Pair it with the enveloped low-pass (cutoff peak = 1.8 kHz + 2.5 kHz·v) and the same asymmetric shaper.

**Autopan.** Use `OscillatorNode` (0.9 Hz sine) → `GainNode` (0.25) → `StereoPannerNode.pan`, on top of a static per-voice spread of ±0.15. Start the LFO at the cue start so the phase is deterministic offline. Classic stereo-tremolo rates are faster, so 0.9 Hz is my "cozy" choice: it reads as slow breathing rather than wobble.

---

### Inquiry A3 — Plucked string / harp / ukulele (C3–E5)

**Verdict: pre-compute Extended Karplus-Strong in JS into an `AudioBuffer`.** The `PeriodicWave` + dual-envelope + formant bank cannot reproduce the defining trait of a pluck: high harmonics that die faster than low ones, with a slightly irregular onset. KS gets that for free, because its averaging filter removes high frequencies a little more on every period. Jaffe & Smith's 1983 extensions add a pick-direction low-pass, a pick-position comb `1 − z^(−βN)`, a first-order tuning allpass, and a dynamic-level low-pass whose cutoff follows velocity. The tuning allpass matters: without it, rounding the delay length audibly mistunes high notes. Jaffe & Smith also recommend keeping the allpass's fractional delay above zero, in the range [ε, 1+ε).\[17\]\[18\]

**CPU.** 1.5 s at 48 kHz is 72,000 samples, a few floating-point operations each, which is well within a millisecond-class budget per note on modern JS engines. Cache by `midi + velocityBucket` and most phrases reuse buffers. I have not benchmarked your exact "< 0.5 ms" target, so time it with `performance.now()`.

```js
function renderPluck(sr, f, { durS = 1.6, decayS = 1.4, vel = 0.7, pickPos = 0.18,
                              stretch = 0.5, seed = 7 } = {}) {
  const N = sr / f;                          // desired loop delay (samples)
  const L = Math.floor(N - stretch - 0.1);   // integer delay; keep allpass frac in [0.1, 1.1)
  const frac = N - stretch - L;
  const C = (1 - frac) / (1 + frac);         // first-order tuning allpass coefficient
  const g = Math.pow(10, -3 / (f * decayS)); // per-period loss → −60 dB at decayS
  const rnd = mulberry32(seed);

  // Excitation: noise → dynamic-level lowpass (velocity) → pick-position comb
  const ex = new Float32Array(L);
  const R = Math.exp(-2 * Math.PI * (800 + 6000 * vel) / sr); // brighter when harder
  let lp = 0;
  for (let i = 0; i < L; i++) { lp = (1 - R) * (rnd() * 2 - 1) + R * lp; ex[i] = lp; }
  const pd = Math.max(1, Math.round(pickPos * L));
  const delay = new Float32Array(L);
  let mean = 0;
  for (let i = 0; i < L; i++) { delay[i] = ex[i] - (i >= pd ? ex[i - pd] : 0); mean += delay[i]; }
  mean /= L; for (let i = 0; i < L; i++) delay[i] -= mean;  // remove DC

  const len = Math.ceil(durS * sr), out = new Float32Array(len);
  let idx = 0, prev = 0, apX1 = 0, apY1 = 0, peak = 1e-9;
  for (let n = 0; n < len; n++) {
    const s = delay[idx];
    out[n] = s; peak = Math.max(peak, Math.abs(s));
    const avg = (1 - stretch) * s + stretch * prev; prev = s;  // loss/averaging filter
    const ap = C * avg + apX1 - C * apY1; apX1 = avg; apY1 = ap; // tuning allpass
    delay[idx] = g * ap;
    idx = (idx + 1) % L;
  }
  const fade = Math.floor(0.03 * sr);
  for (let i = 0; i < len; i++) {
    out[i] /= peak;
    if (i > len - fade) out[i] *= (len - i) / fade;
  }
  return out;
}

const pluckCache = new Map();
function playPluck(ctx, dest, t, midi, vel, gate) {
  const vb = Math.round(vel * 4) / 4, key = midi + ':' + vb;
  let buf = pluckCache.get(key);
  if (!buf || buf.sampleRate !== ctx.sampleRate) {
    const data = renderPluck(ctx.sampleRate, mtof(midi), { vel: vb, seed: midi * 17 + vb * 100 });
    buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
    buf.copyToChannel(data, 0);
    pluckCache.set(key, buf);
  }
  const src = new AudioBufferSourceNode(ctx, { buffer: buf });
  const amp = new GainNode(ctx, { gain: 0.35 * (0.4 + 0.6 * vel) });
  amp.gain.setValueAtTime(amp.gain.value, t + gate);
  amp.gain.setTargetAtTime(0, t + gate, 0.05);   // finger damping at gate end
  src.connect(amp).connect(dest);
  src.start(t); src.stop(t + gate + 0.4);
}
```

**Body: a shared bus, not one per voice.** Use `peaking` filters at the guitar's documented low resonances. Firth's guitar measurements identify the Helmholtz air resonance A0 at 89.6 Hz and the first top-plate resonance T1 at 178.6 Hz.\[19\] A guitar-acoustics summary puts the air and top-plate peaks "at about 100 and 200 Hz" and reports a listener-preferred spectrum with peaks at 100, 200 and 400 Hz.\[20\]

| Filter | Type | Freq | Gain | Q |
|---|---|---|---|---|
| Air (A0) | peaking | 95 Hz | +3 dB | 1.4 |
| Top plate (T1) | peaking | 190 Hz | +2.5 dB | 1.6 |
| Upper body | peaking | 400 Hz | +2 dB | 2.0 |
| Nylon softness | highshelf | 3.5 kHz | −4 dB | — |

For a **ukulele**, the body is much smaller, so shift all three peaks upward (roughly ×2 as a starting guess, which is unsourced) and drop the A0 boost. For a **harp**, use `pickPos ≈ 0.5`, which removes even harmonics for the hollow harp tone, together with `decayS` 2–3 s.

---

### Inquiry A4 — Soft ocarina / whistle lead (C5–D6)

**Pushback:** an ocarina is a Helmholtz resonator, not a pipe. A 2009 compressible large-eddy simulation of an ocarina in OpenFOAM (arXiv:0911.3567), whose 3D model reproduced A5 = 880 Hz, notes that "the single oscillation without harmonics is one of the properties of the Helmholtz resonance". A strongly odd-harmonic spectrum is the closed-pipe/clarinet signature. So use two waves: a true ocarina, and an odd-leaning "woodwind" for a reedier lead.

```js
// harmonic:          DC  1     2     3     4     5     6     7
const ocarinaImag = [0,  1.0,  0.10, 0.05, 0.02, 0.01, 0,    0];
const reedyImag   = [0,  1.0,  0.08, 0.30, 0.03, 0.14, 0.02, 0.06]; // odd-leaning + soft 2nd
const wave = ctx.createPeriodicWave(new Float32Array(8), new Float32Array(ocarinaImag));
```

**Vibrato onset.** Measured vocal vibrato rates cluster at 4.5–6.5 Hz in trained singers, so your 5.0–5.5 Hz is right. Your ±8–12 cents is far narrower than classical singing (50–120 cents peak-to-peak), which suits a small wind instrument, so keep it.\[21\] Your 180 ms delay is short, though. An ICIC 2025 study of tenor and soprano vibrato reports a mean onset delay of 0.47 s (SD 0.34 s, range 0.06–1.73 s). At 100 BPM an eighth note lasts 300 ms, so a 180 ms hold plus ramp lets vibrato leak into eighths. Hold for 250 ms, then ramp over 350 ms. Vibrato then shows only on quarters and longer, and fully on half notes.

```js
function playOcarina(ctx, dest, t, midi, vel, gateS, { slurredFromPrev = false, noiseBuf, wave } = {}) {
  const f = mtof(midi), v = Math.max(0.05, Math.min(1, vel));
  const osc = new OscillatorNode(ctx, { frequency: f }); osc.setPeriodicWave(wave);
  // (c) micro-pitch scoop: −15 → 0 cents over 25 ms (skip on slurs)
  if (!slurredFromPrev) {
    osc.detune.setValueAtTime(-15, t);
    osc.detune.linearRampToValueAtTime(0, t + 0.025);
  }
  // (d) delayed vibrato: 5.2 Hz, ±10 cents, 250 ms hold + 350 ms ramp
  const lfo = new OscillatorNode(ctx, { type: 'sine', frequency: 5.2 });
  const depth = new GainNode(ctx, { gain: 0 });
  depth.gain.setValueAtTime(0, t);
  depth.gain.setValueAtTime(0, t + 0.25);
  depth.gain.linearRampToValueAtTime(10, t + 0.60);  // cents (detune is in cents)
  lfo.connect(depth).connect(osc.detune);            // sums with the scoop automation

  const amp = new GainNode(ctx, { gain: 0 });
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.30 * v, t + (slurredFromPrev ? 0.012 : 0.030)); // breathy rise
  amp.gain.setValueAtTime(0.30 * v, t + gateS);
  amp.gain.setTargetAtTime(0, t + gateS, 0.035);
  osc.connect(amp).connect(dest);

  // (b) chiff: 20 ms band-passed noise around 3f, plus faint steady air
  if (!slurredFromPrev) {
    const n = new AudioBufferSourceNode(ctx, { buffer: noiseBuf });
    const bp = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: Math.min(9000, 3 * f), Q: 2.5 });
    const ng = new GainNode(ctx, { gain: 0 });
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(0.06 * v, t + 0.003);
    ng.gain.setTargetAtTime(0, t + 0.003, 0.008);   // ~20–25 ms audible chiff
    n.connect(bp).connect(ng).connect(dest);
    n.start(t, (midi % 13) * 0.05, 0.05);
  }
  const end = t + gateS + 0.25;
  osc.start(t); lfo.start(t); osc.stop(end); lfo.stop(end);
}
```

**Slurs.** When a note is slurred, skip both the chiff and the scoop. For true legato, use one persistent oscillator per phrase and glide `frequency` with `setTargetAtTime(newF, t, 0.012)`. Re-triggering the chiff on every slurred note is the biggest tell of a synthetic wind. The chiff duration and band are my starting values; I did not find a measured source for them.

---

### Inquiry B — Deterministic "cozy room" impulse response

**Target values.** Room EQ Wizard's RT60 guidance recommends an RT60 of 0.3 s for domestic listening rooms and recording studios "with volumes of less than 50 cubic metres", and 0.4–0.6 s for rooms up to 200 m³. Commercial acoustics guidance treats 0.3–0.5 s as "tight and intelligible".\[22\] Your ≤0.35 s tail budget therefore implies RT60 ≈ 0.32–0.38 s. That is plenty for "air" without smearing 300 ms eighths.

**Spec detail you need.** `ConvolverNode.normalize` defaults to `true`, which applies "an equal-power normalization" when the buffer is set.\[23\] Set it to `false` and normalize the IR yourself, so your send percentages mean what they say.

```js
function createCozyRoomImpulse(ctx, { durationSeconds = 0.45, preDelayMs = 2, dampingHz = 3000,
                                      seed = 1337, rt60 = 0.35, erLevel = 0.55 } = {}) {
  const sr = ctx.sampleRate, len = Math.ceil(durationSeconds * sr);
  const ir = ctx.createBuffer(2, len, sr);
  const pre = Math.round(preDelayMs * sr / 1000);
  // 8 early-reflection taps (ms, gain): small room, irregular spacing avoids flutter
  const taps = [[7.3, .62], [11.9, .48], [14.6, .44], [19.1, .35], [22.7, .30], [26.3, .24], [29.8, .20], [33.9, .16]];
  const k60 = Math.log(1000) / rt60;           // amplitude decays 60 dB at rt60
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch), rnd = mulberry32(seed + ch * 7919); // L/R decorrelated
    for (const [ms, gn] of taps) {
      const pos = pre + Math.round((ms + (rnd() - 0.5) * 1.8) * sr / 1000); // ±0.9 ms per channel
      const sgn = rnd() < 0.5 ? -1 : 1;
      [0.35, 1, 0.35].forEach((w, k) => { if (pos + k < len) d[pos + k] += sgn * gn * erLevel * w; });
    }
    const tail0 = pre + Math.round(0.010 * sr), fadeIn = Math.round(0.025 * sr);
    let lp = 0;
    for (let i = tail0; i < len; i++) {
      const tt = (i - pre) / sr;
      const env = Math.exp(-k60 * tt) * Math.min(1, (i - tail0) / fadeIn);
      const fc = dampingHz * (0.35 + 0.65 * Math.exp(-tt / (0.5 * rt60))); // darkens as it decays
      const a = Math.exp(-2 * Math.PI * fc / sr);
      lp = (1 - a) * (rnd() * 2 - 1) + a * lp;
      d[i] += 2.2 * lp * env;
    }
    const fo = Math.round(0.04 * sr);
    for (let i = len - fo; i < len; i++) d[i] *= (len - i) / fo;
  }
  // Unit-energy normalization per channel → send gain ≈ wet/dry RMS ratio
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch); let e = 0;
    for (let i = 0; i < len; i++) e += d[i] * d[i];
    const s = 1 / Math.sqrt(e); for (let i = 0; i < len; i++) d[i] *= s;
  }
  return ir;
}

// Wiring: per-bus sends → HP 180 Hz → convolver → master
const verb = new ConvolverNode(ctx, { disableNormalization: true });
verb.buffer = createCozyRoomImpulse(ctx, { seed: 1337 });
const verbHP = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 180 });
verbHP.connect(verb).connect(master);
```

`disableNormalization: true` in the constructor is equivalent to `normalize = false`. Taps below ~5 ms read as comb filtering and taps above ~40 ms read as slap echo. That is why the taps sit between 7 and 34 ms, with irregular gaps and per-channel jitter: no tap spacing repeats, which is what prevents "metallic ringing".

**Send levels** (linear gain into `verbHP`; IR is unit-energy, so these are wet:dry RMS ratios):

| Bus | Send | ≈ dB below dry | Why |
|---|---|---|---|
| Lead (marimba/ocarina) | 0.13 | −17.7 dB | Keeps fast eighths articulate |
| Chords (EP/pluck) | 0.25 | −12 dB | Glues the harmony, softens FM bite |
| Bass | 0.03 | −30 dB | Mostly dry; the 180 Hz HP blocks mud anyway |
| Shaker/tick | 0.18 | −15 dB | Places the pulse "in the room", away from the face |

**Clipping and tail check.** With RT60 = 0.35 s, the wet signal 0.35 s after the last release is 60 dB below its onset, and the sends already sit 12–30 dB below dry. The residual is therefore below about −72 dB relative to the music, so `tailSeconds += 0.35` is sufficient. Keep each bus's dry peak around −12 to −10 dBFS. After `startRendering()`, scan the rendered buffer's peak and scale to −1 dBFS before 16-bit quantization; adding TPDF dither is a nice touch. This step is what guarantees identical, clip-free WAVs.

---

### Inquiry C — Micro-groove, articulation, and pulse

**C1. Timing.** At 100 BPM a beat is 600 ms and an eighth is 300 ms.

| Technique | Value | ms @ 100 BPM | Evidence / note |
|---|---|---|---|
| Swing (offbeat eighth delay) | 52–54% | +12 to +24 ms | Light lilt. Friberg & Sundström measured jazz ratios from 3.5:1 (slow) to 1:1 (fast), with 2:1 triplet feel present "only at a certain tempo". Other studies report ratios from 1.2:1 up to 3:1+.\[24\]\[25\] 54% = 1.17:1, i.e. "straight with bounce", which suits a cozy game. |
| Lead downbeat delay | +10 to +15 ms on on-beat eighths only; offbeats on the swung grid | — | Nelias et al.: delayed soloist downbeats with synchronized offbeats raised swing ratings (odds ratio ~7.5, 95% CI 3.2–17.5). Their manipulation fixed the delay at 85 ticks, which the MPI-DS press release puts at about 30 ms, and in their analysis of 456 jazz solos almost all soloists used downbeat delays averaging 30 ms. Uniformly delaying *all* soloist notes did not help. Use half the jazz value for a cozy theme. |
| Strum spread | 8–12 ms per voice, low→high on downbeats; reversed (high→low) on offbeat re-strikes | 24–36 ms total for 4 voices | Keep the lowest note on the grid and cap the total at ~35 ms so the bass/chord onset stays tight. |
| Random jitter | ≤ ±2 ms (deterministic), or none | — | Systematic deviations make the groove. Nelias et al. note their earlier work found that random microtiming deviations did not enhance swing.\[26\] |

```js
function scheduleTime(n, { bpm = 100, swing = 0.53, leadDownbeatMs = 12, strumMs = 10 } = {}, part, voiceIdx = 0) {
  const beatS = 60 / bpm, b = n.beat, frac = b - Math.floor(b);
  let t = b * beatS;
  if (Math.abs(frac - 0.5) < 1e-6) t += (swing - 0.5) * beatS;          // swung offbeat
  if (part === 'lead' && Math.abs(frac) < 1e-6) t += leadDownbeatMs / 1000; // downbeat lay-back
  if (part === 'chords') t += voiceIdx * strumMs / 1000;                 // voices sorted low→high
  return t;
}
```

**C2. Gate articulation** (`releaseStart = t + gateRatio × durationBeats × 0.6 s`). These are my production starting values, not measured norms. The underlying ideas (contrasting short/long notes, phrase arching, final lengthening) are formalized in the KTH performance-rule tradition, e.g. Friberg's *Quantitative Rule System for Musical Performance*.\[27\]

| Context | Authored | Gate ratio | Actual sounding | Release τ |
|---|---|---|---|---|
| Staccato eighth turn | 0.5 b | 0.55–0.65 | 165–195 ms | 20–30 ms |
| Detached normal eighth/quarter | 0.5–1 b | 0.85 | 255 / 510 ms | 40 ms |
| Slurred stepwise line | any | 1.00 + 15–25 ms overlap (mono: glide, no re-attack) | full | — |
| Repeated same pitch | any | ≤ 0.80 | audible gap ≥ 60 ms | 30 ms |
| Cadential half note | 2.0 b | 0.92–0.95, plus 4–6% local ritard on the approach | ~1.1–1.15 s | 150–250 ms |
| Phrase end before a rest | any | end ≥ 120 ms before the next phrase ("breath") | — | 120 ms |

Pair these with a velocity arch: +5% toward the phrase peak and −10% on the final note. That is the single cheapest "real player" cue.

**C3. Gentle pulse (beats 2 and 4).** Use a brushed shaker: a soft swell rather than a click, plus a quieter "back-stroke" on the preceding "&". That two-stroke motion is what keeps it from sounding like a drum machine.

```js
function playShaker(ctx, dest, t, level, noiseBuf, hitIndex) {
  const r = mulberry32(4242 + hitIndex);
  const src = new AudioBufferSourceNode(ctx, { buffer: noiseBuf });
  const hp = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 3500 });
  const bp = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 6200 + r() * 800, Q: 0.9 });
  const g = new GainNode(ctx, { gain: 0 });
  const peak = level * (0.94 + 0.12 * r());                   // ±0.5 dB deterministic variation
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.016);           // 16 ms swell = "brushed"
  g.gain.setTargetAtTime(0, t + 0.016, 0.028);
  src.connect(hp).connect(bp).connect(g).connect(dest);
  src.start(t, r() * 0.8, 0.2);
}
// Beats 2 & 4 main stroke, back-stroke on the "&" before (−8 dB)
// level: 0.05 ≈ −26 dBFS peak target; verify on the rendered buffer
```

Starting levels are 0.05 for the main stroke (aim −26 dBFS; confirm on the offline render, since filtering changes the peak) and 0.02 for the back-stroke. Pushback on "only during lead rests": a pulse that switches on and off reads as an arrangement event. Run it continuously at about −30 dBFS under phrases and lift it 3–4 dB in rests.

The **muted woodblock** alternative uses two sines at 880 Hz and ~2.2 kHz (τ 12 ms / 6 ms) plus a 3 ms band-passed click at 3 kHz. Those partial ratios are by ear, not sourced.

---

### Inquiry D — Reference timbre for Suno Cover

**Documented facts (Suno):**
- Help center: Covers "transform the style of an existing song while keeping the melody"; Beta; Pro/Premier; "only use this feature for songs you created"; "It may take a few tries to get it just right."\[8\]\[9\]
- Suno blog (beta notes): "in some cases, the Cover feature might return the original clip without adapting it to a new style."\[28\]\[29\]
- Upload length: Basic plan up to 60 s, Pro/Premier up to 8 minutes per the current help page. An older help page says 6–60 s (120 s for Pro/Premier), so expect the limits to change.\[30\]\[31\]\[32\]\[33\]
- **Not documented:** Suno's melody-extraction frontend (EnCodec, CQT, chroma or otherwise), and any official guidance about reverb, vibrato or timbre for Cover inputs. Third-party guides claim "reverb confuses the melody extraction", but those sites are not Suno and cite no evidence.\[29\]

**Closest published analogs (facts about other systems):**
- **MusicGen-melody (Meta, Copet et al. 2023)** conditions on a chromagram with "a window size of 2^14 and a hop size of 2^12". The authors explain that "conditioning on the raw chromagram often led to reconstructing the original sample", so they take "the argmax at each time step". At MusicGen's 32 kHz, that is roughly one pitch class every ~128 ms. Their implementation first removes drums and bass with Demucs, and the Hugging Face docs say the prompt "should ideally be free of the low-frequency signals usually produced by instruments such as drums and bass".\[34\]\[35\]\[36\]
- **Basic Pitch (Spotify, Bittner et al. 2022)** uses a harmonic CQT (7 harmonics plus 1 sub-harmonic) with a dedicated onset posteriorgram that uses audio features "necessary to identify transients". It was trained with reverb and noise augmentation, and is designed for one instrument class at a time.\[3\]\[37\]\[38\]

**Inference: does a sharp-onset, harmonic-rich pluck beat a sustained triangle?** It depends on which kind of frontend Suno uses:
- For a **chroma-argmax** frontend, timbre matters mainly through which pitch class wins each ~128 ms frame. Strong 2nd and 4th harmonics are harmless (same pitch class). A strong **3rd** harmonic is the fifth (D → A) and a strong **5th** is the major third (D → F♯), so those can steal frames. Exponential decay also lets sustained chords win the second half of long lead notes. A triangle's 3rd harmonic sits about 19 dB down, which keeps chroma clean.
- For an **onset-aware transcriber**, sharp onsets clearly help segment notes, especially repeated pitches.
- **Best of both:** a 4–8 ms attack (fast but not a click), a fundamental-dominant sustained body (harmonics ≤ −12 dB, 3rd/5th lowest), and gaps of at least 60 ms between repeated pitches. Your ocarina wave with the chiff, or the marimba with τ1 lengthened, fits this well. A pure triangle with a slow attack is weakest at segmentation. A bright pluck is weakest at chroma stability.

**Should the uploaded WAV be dry? Yes. Render a separate "conditioning mix":**

| Element | In-game audition | Suno reference |
|---|---|---|
| Room IR | on | off (or ≤ 0.05 send) |
| Vibrato | delayed ±10 c | off (negligible for chroma, but it costs nothing to remove) |
| Strum | 8–12 ms | off (chord onsets aligned) |
| Lead level | balanced | +6 dB over chords, chords thinned to 3 voices, bass −6 dB |
| Swing / lay-back | on | A/B test: Suno re-performs anyway, so state "light swing" in the style prompt |
| Shaker | on | off |

**Test protocol for a closed system:** First, run each candidate reference through Basic Pitch; if a public transcriber cannot recover your lead, Suno's extractor probably will not either. Second, upload two to three references that differ in **one** variable (timbre A vs B, dry vs room), keeping the prompt and slider settings fixed. Third, judge contour retention by ear on 3–4 generations each, because outputs are stochastic.

---

## Recommendations (in order)

1. **This week:** wire up the shared helpers and the room bus (Inquiry B), and switch all instruments to sends. This is the biggest headphone improvement for the least code.
2. **Replace the lead** with `playWoodBar` for bouncy sections and `playOcarina` for sustained melodies, and **replace the chords** with `playEPiano` using the enveloped low-pass (drop the fixed 1.3 kHz LPF on the EP).
3. **Add KS plucks** as a second accompaniment layer, with the cache and the shared body EQ bus.
4. **Add the groove layer:** 53% swing, a 12 ms lead downbeat delay, 10 ms strum, the gate table, and the continuous shaker at about −30/−26 dBFS.
5. **Build an `exportForSuno()` render path** with the conditioning-mix toggles, validate it with Basic Pitch, then run the A/B protocol.
6. **Classroom bonus:** each recipe works well as a lab. FM index vs. brightness, KS loop gain vs. RT60, and swing percentage vs. felt groove are all measurable with an `AnalyserNode` and rendered WAVs.

## Caveats

- **Sourced vs. chosen.** Sourced numbers: marimba/xylophone ratios, the 14:1 DX tine, guitar A0/T1, room RT60 targets, swing and downbeat-delay findings, vibrato norms, MusicGen and Basic Pitch internals. My engineering starting values: FM index curves, decay τ values, chiff band and duration, EP harmonic table, IR tap pattern, send levels, gate ratios, and woodblock partials. Tune those by ear.
- **The swing research is about jazz.** It tells you *which* deviation pattern works (downbeat-only delay) but not the right magnitude for a cozy game theme. I halved the jazz values on judgment.
- **Inquiry D is mostly inference.** Suno could use a completely different frontend, and its behavior changes between model versions.
- **Determinism** requires the same sample rate (48 kHz) in both contexts and fixed seeds. Live `AudioContext` output still depends on device resampling. The offline WAV is your ground truth.

## Sources

1. [arXiv:0911.3567v1 \[physics.comp-ph\] 18 Nov 2009](https://arxiv.org/pdf/0911.3567)
2. [3D Calculation with Compressible LESfor Sound Vibration of Ocarina](https://arxiv.org/html/0911.3567.pdf)
3. [spotify/basic-pitch](https://www.npmjs.com/package/@spotify/basic-pitch?activeTab=readme)
4. [DX7/Aftertouch Publication (USA)](https://bobbyblues.recup.ch/yamaha_dx7/patches/Aftertouch.html)
5. [3.3 Marimbas and xylophones – Euphonics](https://euphonics.org/3-3-marimbas-and-xylophones/)
6. [harmonic tuning and the marimba](http://www.hopestreetmarimba.com/a-driftwood-marimba-on-the-beach-of-improbability/)
7. [Simplify occurrences of 128 sample frames to one render quantum by svgeesus · Pull Request #1170 · WebAudio/web-audio-api · GitHub](https://github.com/WebAudio/web-audio-api/pull/1170/files)
8. [What is a Cover?](https://help.suno.com/en/articles/2872257)
9. [Suno Cover: The Ultimate 2026 Guide to Music Reimagination](https://apipass.dev/blogs/suno-cover-2026-guide)
10. [BaseAudioContext: createPeriodicWave() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave)
11. [Orchestration Tip: Harmonic Spectra of Xylophone vs. Marimba - Orchestration Online](https://orchestrationonline.com/orchestration-tip-harmonic-spectra-of-xylophone-vs-marimba/)
12. [Online Marimba — Play a Virtual Marimba Free (5-Octave Concert) | Tonalics](https://tonalics.com/play/marimba)
13. [Marimba Construction & Tuning](https://www.heartlandmarimba.com/articles/marimba-construction-tuning)
14. [Reconstructing that FM E.Piano, how? - Sound Design Forum - KVR Audio](https://www.kvraudio.com/forum/viewtopic.php?t=223022)
15. [How to program the DX7 | Articles | Yamaha black boxes online archive](https://yamahablackboxes.com/articles/how-to-program-yamaha-dx7/)
16. [The Fender Rhodes | SoundGirls.org](https://soundgirls.org/the-fender-rhodes/)
17. [The Extended Karplus-Strong Algorithm - CCRMA](https://ccrma.stanford.edu/~jos/pasp/Extended_Karplus_Strong_Algorithm.html)
18. [Karplus-Strong: How a Ring Buffer Became the World's Most Elegant String Synthesizer | Tonalux Blog](https://tonalux.org/blog/karplus-strong-string-synthesis)
19. [Physics of the guitar at the Helmholtz and first top- plate resonances\*](https://www.iuliusguitars.com/wp-content/uploads/2025/03/Firth_Physics-of-the-guitar_1976.pdf)
20. [2 Acoustics - Knowledge Guitars](https://knowledgeguitars.com/acoustics/)
21. [Vibrato: Pitch Oscillation in the Singing Voice – Voice Science](https://www.voicescience.org/lexicon/vibrato/)
22. [Reverberation Time for Different Rooms: RT60 Chart & Targets](https://commercial-acoustics.com/guides/reverberation-time-for-different-rooms/)
23. [ConvolverNode: normalize property - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode/normalize)
24. [Swing ratios and ensemble timing in jazz performance: Evidence for a common rhythmic pattern | Request PDF](https://www.researchgate.net/publication/312445674_Swing_ratios_and_ensemble_timing_in_jazz_performance_Evidence_for_a_common_rhythmic_pattern)
25. [Google Scholar](https://scholar.google.com/scholar_lookup?title=Swing+ratios+and+ensemble+timing+in+jazz+performance:+Evidence+for+a+common+rhythmic+pattern&amp=&author=A.+Friberg&amp=&author=A.+Sundstr%C3%B6m&amp=&publication_year=2002&amp=&journal=Music+Perception&amp=&volume=19&amp=&pages=333-349)
26. [Downbeat delays are a key component of swing in jazz | Communications Physics](https://www.nature.com/articles/s42005-022-00995-z)
27. [(PDF) Preferred swing ratio in jazz as a function of tempo](https://www.academia.edu/2756208/Preferred_swing_ratio_in_jazz_as_a_function_of_tempo)
28. [Introducing Covers | Suno](https://suno.com/blog/covers)
29. [Suno AI Covers | Keep the Melody, Change Everything Else](https://sunnoai.com/covers/)
30. [How to Use: Audio Uploads](https://help.suno.com/en/articles/6141569)
31. [What does Upload Audio do?](https://help.suno.com/en/articles/2477633)
32. [Suno AI Audio Inputs | Upload, Record, Extend & Cover Your Own Audio](https://sunnoai.com/audio-inputs/)
33. [Suno AI Music Generation Guide - FIYA Platform](https://fiyaplatform.com/suno.php)
34. <https://arxiv.org/pdf/2306.05284v3>
35. [MusicGen Melody · Hugging Face](https://huggingface.co/docs/transformers/model_doc/musicgen_melody)
36. [docs/CONDITIONING.md · trttung1610/musicgen at main](https://huggingface.co/spaces/trttung1610/musicgen/blob/main/docs/CONDITIONING.md)
37. [A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation](https://arxiv.org/html/2203.09893v2)
38. [GitHub - spotify/basic-pitch: A lightweight yet powerful audio-to-MIDI converter with pitch bend detection · GitHub](https://github.com/spotify/basic-pitch)
