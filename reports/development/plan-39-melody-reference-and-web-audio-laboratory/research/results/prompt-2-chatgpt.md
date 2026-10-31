# Advanced Zero-Sample Web Audio Music Synthesis, Procedural Room Acoustics, and Sequencer Micro-Groove for HTML5 Games

## Design conclusions

The most useful lesson from small-footprint browser synth engines such as **webaudio-tinysynth**, **SoundBox**, and **ZzFXM** is not that one particular oscillator is superior; it is that convincing procedural instruments are built from **time-varying spectra**. WebAudio TinySynth’s higher-quality voices use multiple oscillators and FM-like routing rather than one static oscillator, and its timbre format explicitly gives each component its own attack, hold, decay, sustain, release, tuning, and routing destination. SoundBox and ZzFXM similarly get disproportionate mileage from envelopes, pitch motion, filtering, noise, and short-lived bright components rather than from static waveform selection alone. citeturn657990search0turn657990search2turn968990search9

That is the central architectural recommendation for your laboratory: **every foreground instrument should contain at least two perceptually different time scales**. One component should define pitch/body and survive most of the note; another should be brighter, noisier, more inharmonic, or more strongly modulated and disappear within roughly 10–300 ms. This follows both classical FM practice—where a decaying modulation index creates a bright attack that evolves toward a simpler spectrum—and the procedural strategies used by small JS synthesis engines. citeturn675241search4turn675241search7turn657990search0

One Web Audio constraint materially changes the best implementation of plucked strings. A `DelayNode` used in a feedback cycle is clamped to at least one render quantum; the default quantum is 128 frames, which at 48 kHz is 2.667 ms, corresponding to a maximum simple feedback-loop pitch of about 375 Hz. The current Web Audio 1.1 specification retains that rule. Consequently, a native-node Karplus–Strong feedback graph cannot cover your requested 130–660 Hz range continuously, while **precomputing the recurrence into an `AudioBuffer` in JavaScript can**. citeturn968990search0turn968990search1turn968990search2

For `PeriodicWave`, the browser accepts Fourier coefficients directly, so the cleanest reusable patches below specify harmonic content once and then use ordinary `OscillatorNode` scheduling. Web Audio defines the arrays as Fourier coefficients in ascending harmonic order, and normalization can be left enabled so the wave does not unexpectedly exceed the normal oscillator range. citeturn156960search0turn156960search21turn156960search22

The numerical patches below are **engineering presets**, not claimed transcriptions of commercial instruments. Their ratios and architectures are grounded in acoustic and FM literature; the exact envelope times, gains, filter values, and coefficient arrays are deliberately tuned starting points for a 100 BPM cozy-game mix.

## Instrument topologies

**Cozy wooden marimba / kalimba lead.** Real tuned marimba bars are commonly designed around approximately **1:4:10** modal relationships, while a uniform untuned bar naturally has modes near **1:2.76:5.4**. That distinction is useful: `2.76×` is good when you want more “wooden knock,” while `4×` sounds more recognizably tuned-marimba and less clangorous. For a cozy lead I recommend a **4.0× FM transient at modest index**, not a persistent 2.76× modulator; reserve a tiny 2.76× component for the very first 50–80 ms if you want more kalimba character. citeturn367345search0turn367345search2turn367345search8turn367345search48

The topology is:

```text
mod sine 4.00*f0 -> modGain(Hz) -> carrier.frequency
carrier sine f0 ------------------------------\
                                                +--> body LPF --> amp --> out
body mode sine 4.00*f0 -> fast gain ----------/
noise AudioBuffer -> bandpass -> click gain ---/
```

Use these values as the default patch:

| Component | Parameter | Recommended value |
|---|---:|---:|
| Carrier | frequency | `f0` |
| Carrier amp | attack | 2.5 ms |
| Carrier amp | decay | 420 ms |
| Carrier sustain | level | 0.18 |
| Carrier release | 90 ms |
| FM modulator | frequency | `4.0 * f0` |
| FM peak deviation | `1.55 * f0 * velocity²` Hz |
| FM decay | to 8% by 85 ms |
| FM end | effectively zero by 180 ms |
| Explicit 4th mode | amplitude | 0.075 relative |
| 4th-mode decay | | 145 ms |
| Noise click | duration | 8 ms |
| Noise filter | bandpass | 2.4 kHz, `Q=0.8` |
| Noise gain | peak | `0.025 + 0.045*velocity` |
| Body LPF | | 5.2 kHz, `Q=0.35` |

Because Web Audio oscillator-frequency inputs are summing `AudioParam`s, the output of a `GainNode` connected to `carrier.frequency` is naturally interpreted as frequency deviation in hertz. Classical FM’s modulation index is technically deviation divided by modulator frequency; therefore the preset above has a peak classical index of about `1.55*f0/(4*f0)=0.3875` at full velocity, intentionally restrained to avoid a metallic bell spectrum. citeturn675241search4turn675241search33

```js
function playWoodMallet(ctx, out, f0, t, gate = 0.30, velocity = 0.8) {
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const mode4 = ctx.createOscillator();
  const modeGain = ctx.createGain();
  const body = ctx.createBiquadFilter();
  const amp = ctx.createGain();

  car.type = "sine";
  mod.type = "sine";
  mode4.type = "sine";

  car.frequency.setValueAtTime(f0, t);
  mod.frequency.setValueAtTime(4 * f0, t);
  mode4.frequency.setValueAtTime(4 * f0, t);

  const dev = 1.55 * f0 * velocity * velocity;
  modGain.gain.setValueAtTime(dev, t);
  modGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, dev * 0.08), t + 0.085);
  modGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

  modeGain.gain.setValueAtTime(0.075 * velocity, t);
  modeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.145);

  body.type = "lowpass";
  body.frequency.value = 5200;
  body.Q.value = 0.35;

  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.34 * velocity, t + 0.0025);
  amp.gain.exponentialRampToValueAtTime(0.34 * velocity * 0.18, t + 0.42);
  amp.gain.setValueAtTime(0.34 * velocity * 0.18, t + gate);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + gate + 0.09);

  mod.connect(modGain).connect(car.frequency);
  car.connect(body);
  mode4.connect(modeGain).connect(body);
  body.connect(amp).connect(out);

  // Deterministic 8 ms mallet click.
  const n = Math.ceil(ctx.sampleRate * 0.008);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  let s = ((Math.floor(f0 * 1000) ^ 0x9e3779b9) >>> 0);
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const white = ((s >>> 0) / 4294967296) * 2 - 1;
    d[i] = white * (1 - i / n);
  }

  const click = ctx.createBufferSource();
  const bp = ctx.createBiquadFilter();
  const cg = ctx.createGain();
  click.buffer = b;
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 0.8;
  cg.gain.value = 0.025 + 0.045 * velocity;
  click.connect(bp).connect(cg).connect(body);

  car.start(t); mod.start(t); mode4.start(t); click.start(t);
  car.stop(t + gate + 0.11);
  mod.stop(t + 0.20);
  mode4.stop(t + 0.17);
}
```

This is deliberately softer than a xylophone. A xylophone’s characteristic tuned modes are closer to 1:3:6, whereas the marimba’s approximately 1:4:10 organization produces a less aggressively piercing upper structure. citeturn367345search2turn367345search3

**Warm electric piano / Rhodes-Wurlitzer-celesta chords.** The practical FM recipe is a sine carrier near the fundamental plus a modulator whose amplitude decays faster than the carrier. FM electric-piano programming traditionally makes velocity affect both loudness and modulation depth, so harder notes “bark” rather than merely becoming louder; high-ratio components around 11–14× are also commonly used to evoke tine attack. citeturn675241search25turn675241search30

For a two-operator-only patch, use a carrier at `f0`, modulator at `2.0*f0`, and peak frequency deviation

```js
deviationHz = f0 * (0.30 + 1.15 * velocity * velocity);
```

with modulation falling to 18% by 360 ms and almost zero by 1.15 s. Carrier amplitude: 8 ms attack, 1.8 s decay to 0.28 sustain, 350 ms release. Add a very quiet sine at `13*f0`, only while `13*f0 < 8500`, at amplitude `0.012–0.035` according to velocity, decaying in 75 ms. This creates the velocity-sensitive “tine” without turning chord voicings into a DX-style glass pad. The faster modulator decay follows the same bright-to-dark behavior used in classical FM instrument design. citeturn675241search7turn675241search25

For the less synthetic alternative, the following `PeriodicWave` works well for C3–G4. The `real` coefficients are zero and these `imag` values specify sine-phase harmonics:

```js
const EP_REAL = new Float32Array(13); // DC + harmonics 1..12
const EP_IMAG = new Float32Array([
  0,
  1.0000,  // 1
  0.2850,  // 2
  0.1180,  // 3
  0.0820,  // 4
  0.0450,  // 5
  0.0300,  // 6
  0.0170,  // 7
  0.0110,  // 8
  0.0070,  // 9
  0.0045,  // 10
  0.0028,  // 11
  0.0018   // 12
]);

function makeEPWave(ctx) {
  return ctx.createPeriodicWave(EP_REAL, EP_IMAG);
}
```

A `PeriodicWave` is appropriate here because Web Audio explicitly supports arbitrary Fourier-series waveforms on an `OscillatorNode`. citeturn156960search0turn156960search14

Follow it with a very mild asymmetric saturator:

```js
function makeWarmCurve(n = 2048) {
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = 2 * i / (n - 1) - 1;
    curve[i] = Math.tanh(1.35 * (x + 0.025)) / Math.tanh(1.35) - 0.022;
  }
  return curve;
}

const shaper = ctx.createWaveShaper();
shaper.curve = makeWarmCurve();
shaper.oversample = "2x";
```

`WaveShaperNode` is specifically intended for nonlinear waveshaping, and Web Audio provides optional 2× and 4× oversampling to reduce distortion-aliasing artifacts. citeturn156960search6turn156960search31

For stereo motion, do **not** chorus the chords with delay lines; that will make neural-reference exports less clear and can weaken mono compatibility. Instead, pan each note statically by voice—approximately `[-0.22, -0.07, +0.08, +0.21]` for a four-note voicing—and, in audition mode only, add a 0.12 Hz sine LFO with ±0.035 pan excursion. That is slow enough to create life without perceptibly dragging notes across the stereo image.

**Plucked acoustic string / harp / ukulele.** Here the precomputed-buffer approach wins decisively. Karplus–Strong is a computationally cheap plucked-string model based on an initially noisy delay line whose repeated averaging/loss operation progressively removes upper harmonics; more elaborate digital-waveguide instruments commonly cascade the string model with a body model. citeturn675241search0turn675241search2turn675241search8turn675241search10

Your target range makes native feedback `DelayNode` unsuitable above about 375 Hz under the ordinary 128-frame render quantum, whereas generating the recurrence into an `AudioBuffer` has no such pitch restriction. citeturn968990search0turn968990search2

A good production recipe is: period `N ≈ sampleRate/f0`, noise excitation low-passed once before entering the recurrence, averaging coefficient `0.50/0.50`, loop attenuation `0.9965` around C3 falling to `0.992` around E5, plus a second slower decay layer at about 18% amplitude to keep the body from disappearing too abruptly. The body should then pass through broad peaking filters around **190 Hz, 410 Hz, and 820 Hz**, with low Q, rather than narrow resonances. Those exact body frequencies are design values rather than universal guitar resonances; real plucked-instrument synthesis commonly separates string behavior from body filtering because the resonant body materially shapes the resulting timbre. citeturn675241search10turn675241search44

```js
function xorshift32(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function createPluckBuffer(ctx, f0, seconds = 2.5, seed = 1) {
  const sr = ctx.sampleRate;
  const len = Math.ceil(seconds * sr);
  const N = Math.max(2, Math.round(sr / f0));
  const y = new Float32Array(len);
  const rnd = xorshift32(seed);

  // Slightly smoothed pick/noise excitation.
  let prev = 0;
  for (let i = 0; i < N && i < len; i++) {
    const w = rnd() * 2 - 1;
    prev = 0.62 * prev + 0.38 * w;
    const pickShape = Math.sin(Math.PI * (i + 0.5) / N);
    y[i] = prev * pickShape * 0.75;
  }

  const u = Math.min(1, Math.max(0,
    (Math.log2(f0 / 130)) / Math.log2(660 / 130)
  ));
  const loss = 0.9965 + (0.9920 - 0.9965) * u;

  for (let i = N; i < len; i++) {
    const a = y[i - N];
    const b = y[i - N + 1] || a;
    y[i] = loss * 0.5 * (a + b);
  }

  // Fast pick transient plus slower body component.
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const dualDecay =
      0.82 * Math.exp(-t / 0.72) +
      0.18 * Math.exp(-t / 1.85);
    y[i] *= dualDecay;
  }

  const buf = ctx.createBuffer(1, len, sr);
  buf.copyToChannel(y, 0);
  return buf;
}

function playPluck(ctx, out, f0, t, velocity = 0.8, seed = 1) {
  const src = ctx.createBufferSource();
  src.buffer = createPluckBuffer(ctx, f0, 2.5, seed);

  const r1 = ctx.createBiquadFilter();
  const r2 = ctx.createBiquadFilter();
  const r3 = ctx.createBiquadFilter();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();

  for (const [node, freq, gain, Q] of [
    [r1, 190, +2.0, 0.75],
    [r2, 410, +1.4, 0.85],
    [r3, 820, +0.9, 0.95]
  ]) {
    node.type = "peaking";
    node.frequency.value = freq;
    node.gain.value = gain;
    node.Q.value = Q;
  }

  lp.type = "lowpass";
  lp.frequency.value = Math.min(7200, Math.max(2600, 7.5 * f0));
  lp.Q.value = 0.32;

  g.gain.value = 0.32 * velocity;

  src.connect(r1).connect(r2).connect(r3).connect(lp).connect(g).connect(out);
  src.start(t);
}
```

If memory becomes important, cache one buffer per MIDI pitch rather than regenerating each note. `AudioBufferSourceNode` is explicitly intended for playback of in-memory buffers, so this remains fully compatible with both real-time and offline contexts. citeturn156960search29turn968990search32

The `PeriodicWave` substitute is worthwhile only if buffer generation becomes inconvenient. A plausible spectrum is `[1, .42, .25, .16, .10, .07, .045, .03, .02, .014, .009, .006]` multiplied by two envelopes: fundamental/low harmonics around 1.4 s and upper harmonics around 280 ms. It is cheaper conceptually, but it sounds more like a “plucked synth” because it lacks the continuously evolving stochastic loop spectrum that makes Karplus–Strong convincing. The physical-modeling literature is consistent on the importance of the delay-loop/loss process for this class of sound. citeturn675241search11turn675241search32

**Soft ocarina / whistle lead.** Ocarinas are comparatively spectrally pure instruments, so a restrained Fourier series is preferable to an aggressive saw-like spectrum. Measurements and acoustic descriptions consistently characterize their sound as dominated by the fundamental with relatively few strong upper harmonics. citeturn367345search19turn367345search20

Use:

```js
const OCARINA_REAL = new Float32Array(10);
const OCARINA_IMAG = new Float32Array([
  0,
  1.000, // fundamental
  0.105, // soft 2nd
  0.170, // 3rd
  0.025, // 4th
  0.075, // 5th
  0.012, // 6th
  0.030, // 7th
  0.006, // 8th
  0.012  // 9th
]);
```

The complete expressive recipe is a 22 ms filtered-noise chiff, a `-15 cent → 0` pitch scoop over 25 ms, and vibrato at 5.25 Hz whose depth is held to effectively zero until 180 ms and then rises over 110 ms to ±10 cents. For frequency modulation by cents, convert the requested peak cents to hertz approximately as `f0 * (2^(cents/1200)-1)`; using the oscillator’s `detune` input is simpler because detune is already expressed in cents. Web Audio supports oscillator detuning as an `AudioParam`. citeturn156960search0

```js
function playOcarina(ctx, out, f0, t, gate = 0.6, velocity = 0.8) {
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(ctx.createPeriodicWave(OCARINA_REAL, OCARINA_IMAG));
  osc.frequency.setValueAtTime(f0, t);

  // -15 cents -> 0 cents in 25 ms.
  osc.detune.setValueAtTime(-15, t);
  osc.detune.linearRampToValueAtTime(0, t + 0.025);

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.22 * velocity, t + 0.018);
  amp.gain.setValueAtTime(0.22 * velocity, t + Math.max(0.025, gate - 0.07));
  amp.gain.exponentialRampToValueAtTime(0.0001, t + gate + 0.10);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 5200;
  lp.Q.value = 0.25;

  // Delayed vibrato.
  const lfo = ctx.createOscillator();
  const vibDepth = ctx.createGain();
  lfo.frequency.value = 5.25;
  vibDepth.gain.setValueAtTime(0.0001, t);
  vibDepth.gain.setValueAtTime(0.0001, t + 0.180);
  vibDepth.gain.linearRampToValueAtTime(10.0, t + 0.290);
  lfo.connect(vibDepth).connect(osc.detune);

  osc.connect(lp).connect(amp).connect(out);

  // 22 ms breath/chiff.
  const n = Math.ceil(ctx.sampleRate * 0.022);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const x = b.getChannelData(0);
  let s = 0x1234567 ^ Math.round(f0);
  for (let i = 0; i < n; i++) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    const white = ((s >>> 0) / 4294967296) * 2 - 1;
    const env = Math.sin(Math.PI * (i + 0.5) / n);
    x[i] = white * env;
  }

  const breath = ctx.createBufferSource();
  breath.buffer = b;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3600;
  bp.Q.value = 0.75;
  const bg = ctx.createGain();
  bg.gain.value = 0.018 + 0.030 * velocity;

  breath.connect(bp).connect(bg).connect(out);

  osc.start(t); lfo.start(t); breath.start(t);
  osc.stop(t + gate + 0.12);
  lfo.stop(t + gate + 0.12);
}
```

The delayed vibrato matters especially at 100 BPM: an eighth note is 300 ms, so waiting 180 ms before vibrato becomes meaningful keeps short melodic turns clean while allowing held quarter/half notes to develop player-like motion.

## Deterministic cozy-room impulse response

A `ConvolverNode` performs convolution with an in-memory impulse response. If `normalize` is enabled, Web Audio rescales the supplied impulse response according to its normalization procedure; for a deliberately calibrated procedural IR, I recommend setting `normalize = false` and controlling the IR amplitude yourself. citeturn156960search10turn156960search17

For this style, use **explicit early reflections plus a short, decorrelated stochastic tail**, not a long synthetic hall. The room design below uses reflection arrivals between roughly 7 and 34 ms and a tail constant short enough that the audible effect mostly dies within about 300–350 ms. The “damping” stage is implemented directly while constructing the buffer as a one-pole low-pass recurrence, which avoids needing additional graph nodes and guarantees identical live/offline results.

```js
function createCozyRoomImpulse(
  ctx,
  {
    durationSeconds = 0.34,
    preDelayMs = 7,
    dampingHz = 3000,
    seed = 0xC0FFEE
  } = {}
) {
  const sr = ctx.sampleRate;
  const n = Math.ceil(durationSeconds * sr);
  const buffer = ctx.createBuffer(2, n, sr);

  function rngFactory(seed0) {
    let s = seed0 >>> 0 || 1;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  }

  const rngL = rngFactory(seed ^ 0xA53A9E37);
  const rngR = rngFactory(seed ^ 0x7F4A7C15);

  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Small warm room: asymmetric early reflection times decorrelate stereo.
  const earlyL = [
    [0.0,   0.55],
    [6.8,   0.21],
    [11.6,  0.15],
    [18.9, -0.105],
    [26.7,  0.078],
    [34.1, -0.052]
  ];

  const earlyR = [
    [0.0,   0.55],
    [8.1,   0.19],
    [13.9, -0.135],
    [21.5,  0.098],
    [29.4, -0.070],
    [33.0,  0.050]
  ];

  const pd = preDelayMs / 1000;

  function addTaps(dst, taps) {
    for (const [ms, amp] of taps) {
      const idx = Math.round((pd + ms / 1000) * sr);
      if (idx >= 0 && idx < dst.length) dst[idx] += amp;
    }
  }

  addTaps(left, earlyL);
  addTaps(right, earlyR);

  // One-pole low-pass coefficient: y[n]=(1-a)x[n]+a*y[n-1].
  const a = Math.exp(-2 * Math.PI * dampingHz / sr);

  // Decay chosen so stochastic tail is effectively gone near IR end.
  const tau = 0.085;
  const tailStart = pd + 0.011;

  function fillTail(dst, rng, stereoScale) {
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const time = i / sr;
      if (time < tailStart) continue;

      const dt = time - tailStart;
      const env = Math.exp(-dt / tau);

      // Slight density build at tail onset prevents an artificial hard start.
      const build = Math.min(1, dt / 0.012);

      const white = 2 * rng() - 1;
      lp = (1 - a) * white + a * lp;

      // Add extremely low-level unfiltered component to avoid "blanket" tone.
      const diffuse = 0.92 * lp + 0.08 * white;

      dst[i] += diffuse * env * build * 0.070 * stereoScale;
    }
  }

  fillTail(left, rngL, 1.00);
  fillTail(right, rngR, 0.97);

  // Soft safety normalization to a known procedural peak.
  let peak = 0;
  for (let ch = 0; ch < 2; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < d.length; i++)
      peak = Math.max(peak, Math.abs(d[i]));
  }

  const targetPeak = 0.62;
  const scale = peak > targetPeak ? targetPeak / peak : 1;
  if (scale !== 1) {
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] *= scale;
    }
  }

  return buffer;
}
```

The routing should be conventional send-return rather than placing the convolver inline:

```text
instrument -----> dryGain ----------------------> master
      |
      +---------> sendGain -> convolver -> returnGain -> master
```

```js
const convolver = ctx.createConvolver();
convolver.normalize = false;
convolver.buffer = createCozyRoomImpulse(ctx, {
  durationSeconds: 0.34,
  preDelayMs: 7,
  dampingHz: 3000,
  seed: 0x51A7C0DE
});

const verbReturn = ctx.createGain();
verbReturn.gain.value = 0.72;
convolver.connect(verbReturn).connect(master);
```

The following sends are conservative enough for a dense game loop:

| Bus | Send gain | Approximate intent |
|---|---:|---|
| Lead | `0.12–0.16` | noticeable air, intact attack |
| Chords | `0.22–0.27` | main sense of room |
| Pluck | `0.14–0.20` | depth without washing attack |
| Bass | `0.00–0.035` | almost dry |
| Percussion | `0.06–0.10` | faint shared space |

These are linear send amplitudes, not literal wet-percentage measurements. Because convolution output level depends on the IR and source spectrum, “15% wet” is not physically identical to `gain=0.15`; the controlled peak and `normalize=false` setting make the presets much more repeatable. Web Audio’s normalization behavior is why that distinction matters. citeturn156960search17

For your stated tail budget, `durationSeconds=0.34` is the natural default. In an offline render, extend the render length by **0.34 s**, rather than adding a generic several-second reverb tail.

## Micro-groove, articulation, and subtle pulse

At 100 BPM, one beat is exactly **600 ms**, an eighth note is 300 ms, and a sixteenth is 150 ms. The strongest recommendation is to humanize *roles*, not individual notes randomly. Random ±10 ms perturbations produce imprecision; consistent role-based offsets create groove.

For eighth-note swing, 52–54% means the first half of each quarter-note pair receives 52–54% of the 600 ms beat and the second half receives 48–46%. That puts the off-eighth approximately **+12 ms at 52%, +18 ms at 53%, and +24 ms at 54%** relative to straight eighths. For the cozy tempo here, use **52.5%**, or about **+15 ms on off-eighths**. Do not combine full +15 ms swing with an additional +14 ms lead delay on every offbeat; instead treat swing as the rhythmic-grid deformation and add only a smaller melodic pocket offset.

My recommended timing policy is:

| Event type | Offset |
|---|---:|
| Bass downbeats | `-2 to 0 ms` |
| Chord anchor note | `0 ms` |
| Lead melody | `+9 ms` default |
| Phrase-opening lead | `+4 ms` |
| Off-eighth swing | `+15 ms` |
| Chord voice 2 | `+9 ms` |
| Chord voice 3 | `+18 ms` |
| Chord voice 4 | `+27 ms` maximum |
| Cadential melody note | `+12 ms` |

For your original requested 8–15 ms chord-strum increments, **9 ms per voice** is the safest value at 100 BPM. A four-note chord then spans 27 ms—audibly played rather than machine-simultaneous, but not an overt arpeggio. Use low-to-high ordering most of the time and reverse it only around one in four phrase boundaries.

A deterministic scheduling helper can therefore be:

```js
const SPB = 60 / 100; // 0.6 sec

function grooveTime(beat, {
  role = "lead",
  chordIndex = 0,
  swing = true
} = {}) {
  let t = beat * SPB;

  // eighth-grid test: beat positions x.5
  if (swing) {
    const frac = ((beat % 1) + 1) % 1;
    if (Math.abs(frac - 0.5) < 1e-6) t += 0.015;
  }

  if (role === "lead") t += 0.009;
  if (role === "bass") t -= 0.001;
  if (role === "chord") t += chordIndex * 0.009;

  return t;
}
```

For articulation, do not equate authored duration with gate. Separate *notated duration* from *acoustic occupancy*. A reliable mapping for this theme is:

| Musical gesture | Authored value | Gate fraction |
|---|---:|---:|
| Staccato eighth turn | `0.5 b` | `0.55–0.64` |
| Normal detached eighth | `0.5 b` | `0.72–0.80` |
| Stepwise legato eighth | `0.5 b` | `0.91–0.97` |
| Normal quarter | `1.0 b` | `0.82–0.90` |
| Slurred quarter | `1.0 b` | `0.94–0.99` |
| Cadential half note | `2.0 b` | `0.88–0.94` |
| Phrase-final note | any | shorten by another `35–70 ms` before next phrase |

At 100 BPM, a staccato eighth at 60% gate has a 180 ms held portion before its synthesis release; a legato eighth at 95% gate holds 285 ms. The latter is nearly connected, but the envelope’s existing release can overlap the following attack, which creates the desired slur.

A useful automatic rule is:

```js
function gateBeats(note, nextNote) {
  const d = note.durationBeats;

  if (note.articulation === "staccato")
    return d * 0.60;

  if (note.articulation === "legato")
    return d * 0.95;

  if (note.phraseEnd)
    return Math.max(0.05, d - 0.10); // 60 ms phrase breath at 100 BPM

  if (d <= 0.5) return d * 0.77;
  if (d <= 1.0) return d * 0.87;
  return d * 0.91;
}
```

For the pulse layer, avoid a pitched kick/snare idiom. A filtered-noise shaker works because procedural Web Audio percussion is naturally implemented as a short noise buffer through a filter and envelope; MDN’s own Web Audio sequencing examples use generated noise plus `BiquadFilterNode` for this class of sound. citeturn367345search23

Use a 38–55 ms noise burst on beats 2 and 4, high-pass around 2.7 kHz, then low-pass at 7 kHz, with a peak gain of `0.040–0.063` relative to a full-scale normalized source—roughly the desired very-low-level region once mixed with your instruments. Vary the two backbeats slightly, for example `0.048` on beat 2 and `0.041` on beat 4.

```js
function playSoftShaker(ctx, out, t, velocity = 1, seed = 1234) {
  const dur = 0.046;
  const n = Math.ceil(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const x = b.getChannelData(0);
  const rnd = xorshift32(seed);

  for (let i = 0; i < n; i++) {
    const u = i / n;
    const env = Math.sin(Math.PI * u) * Math.exp(-3.2 * u);
    x[i] = (rnd() * 2 - 1) * env;
  }

  const src = ctx.createBufferSource();
  const hp = ctx.createBiquadFilter();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();

  src.buffer = b;

  hp.type = "highpass";
  hp.frequency.value = 2700;
  hp.Q.value = 0.45;

  lp.type = "lowpass";
  lp.frequency.value = 7000;
  lp.Q.value = 0.30;

  g.gain.value = 0.048 * velocity;

  src.connect(hp).connect(lp).connect(g).connect(out);
  src.start(t);
}
```

If you want a muted woodblock instead, combine a 95 ms sine at roughly 720 Hz with a weaker 1.62 kHz sine, both decaying exponentially, and keep its bus approximately 5–7 dB lower than the shaker. The key musical rule is that this layer should fill **lead rests**, not run continuously through every phrase.

## External neural conditioning and Suno Cover

The most important distinction here is between what is publicly documented about **Suno Cover** and what can only be inferred from other neural-music systems. Suno publicly describes Cover as using the selected song’s actual audio as the reference and attempting to preserve its original melody while changing genre, feel, instrumentation, or voice. Suno currently accepts audio uploads and says Cover can operate on material ranging from simple voice memos to fully produced tracks. Its current product language does **not** disclose the internal encoder, pitch representation, codec, CQT frontend, or conditioning architecture. citeturn510449search0turn510449search3turn510449search6

Therefore, it would be unsupported to claim that Suno specifically uses EnCodec, SoundStream, a CQT tracker, or a particular chromagram network. What can be said is that modern neural music systems commonly use learned audio representations and/or explicit melodic features. EnCodec and SoundStream encode audio into learned compressed latent representations using convolutional encoders and residual vector quantization. MusicGen’s published melody-conditioned model takes a different route: it extracts a chromagram from the reference, and its authors specifically remove drums and bass first because those components can dominate chroma and obscure the melodic structure. citeturn657990academia5turn657990academia6turn510449search7turn510449search13

That MusicGen result is highly relevant to your export strategy even though Suno’s implementation is unknown. It demonstrates a general conditioning failure mode: **extra spectral energy can compete with the information you actually want the model to follow**. In MusicGen’s case, lower-frequency instruments caused enough chroma interference that the reference preprocessing explicitly separated them before melody extraction. citeturn510449search13turn510449search8

A transient-rich piano or pluck is therefore likely to be a **better reference carrier of symbolic musical structure** than a pure sustained triangle, but not because “neural models prefer piano” in any universal sense. The useful properties are clearer note boundaries, salient harmonic energy at integer multiples of the fundamental, and less ambiguous segmentation between successive notes. That is an inference from known audio-conditioning behavior, not a documented Suno rule. Learned codec models such as EnCodec and SoundStream preserve broadband temporal/spectral information rather than reducing every sound to pitch alone, while explicit melody-conditioned systems such as MusicGen rely on chromatic spectral energy; both mechanisms give a crisp, harmonically clear pluck more usable evidence about note identity and onset location than a nearly sinusoidal tone does. citeturn657990academia5turn657990academia6turn510449search13

For a **conditioning reference**, I would therefore use a deliberately plain “reference piano/pluck” voice:

```text
attack             3–6 ms
bright transient   80–180 ms
overall decay      600–1200 ms
harmonics          strong 1st–5th, rapidly reduced above that
vibrato            none
reverb              none
stereo width        mono or nearly mono
chord strumming     none for harmony-critical passages
random timing       none
swing               retain only if groove itself is compositionally important
peak level          around -6 dBFS
limiting            none unless required to prevent accidental overs
```

That recommendation follows the principle of making the desired latent factors—pitch, melody, harmony, rhythm—more unambiguous rather than presenting the conditioner with a fully “produced” signal.

I would **not**, however, export a completely quantized version if rhythmic feel is part of the song identity. Suno’s public description says Cover works from the actual source audio and is intended to retain the underlying musical idea, not merely MIDI-like pitch classes. citeturn510449search3turn510449search5 Thus there are two sensible exports:

| Export | Use |
|---|---|
| `game-audition.wav` | room IR, expressive vibrato, chord strum, role timing, stereo motion |
| `cover-reference.wav` | dry, almost mono, no vibrato, no room, no decorative strum; keep only deliberate swing/phrase timing |

I would specifically remove the `ConvolverNode` from the Cover reference. Reverb creates overlapping decaying copies of earlier notes, so the reference spectrogram contains simultaneous energy from the current and prior pitches. Given that at least one published melody-conditioned neural system found spectral interference severe enough to remove entire bass and drum stems before extracting its melodic conditioning, minimizing unnecessary room energy is the safer engineering choice. This is an inference rather than a Suno-documented requirement. citeturn510449search13

I would also disable ocarina vibrato in the conditioning WAV. A ±10-cent vibrato is musically attractive in audition but continuously spreads the instantaneous fundamental and upper partials around the nominal pitch. A human listener has no trouble interpreting that as one note; a conditioning frontend needlessly receives a less stable pitch trajectory. Again, no public Suno document says “disable vibrato,” so this should be treated as a robustness optimization rather than a platform requirement. Suno itself says Cover is designed to preserve melody but also acknowledges that the feature can produce mixed results. citeturn510449search1turn510449search6

For chord-strumming, the decision is similar. Your 9 ms-per-voice game-audition strum is desirable sonically, but a four-note voicing then spans 27 ms. If the goal is neural reconstruction of exact harmonic attack points, render those chord notes together or within 2–3 ms. If the groove depends on guitar-like rolled voicings, retain them. In other words, remove **decorative microtiming**, not compositional rhythm.

## Recommended production architecture

The best overall architecture is to maintain one symbolic score and two deterministic rendering profiles. The synth engines that inspired this approach—WebAudio TinySynth, SoundBox, and ZzFXM—demonstrate that substantial timbral complexity can be synthesized procedurally with oscillators, generated buffers, envelopes, filters, and offline rendering rather than streamed PCM assets. citeturn657990search0turn657990search3turn968990search7

The **audition/game profile** should use the wooden mallet FM transient and noise click, the saturated `PeriodicWave` electric piano, precomputed Karplus–Strong plucks, ocarina chiff/scoop/delayed vibrato, the deterministic 340 ms room IR, 52.5% eighth swing, role-based timing offsets, micro-strummed chords, and the very low-level filtered-noise shaker.

The **neural-reference profile** should render the same notes and authored phrase durations through one simplified harmonic pluck/piano voice, nearly centered and dry, with no convolution, no autopan, no vibrato, no decorative randomization, and no micro-strummed chord spread. Preserve tempo, phrase timing, true rests, deliberate swing, melody rhythm, bass movement, and chord changes. Suno’s current public materials explicitly frame Cover as preserving the melody of source audio while changing its presentation, so optimizing the reference for structural clarity is aligned with the feature’s stated purpose even though its exact internal conditioning architecture is proprietary. citeturn510449search3turn510449search5

For live/offline parity, all of these recipes remain within the native graph primitives you specified: `OscillatorNode`, `PeriodicWave`, generated `AudioBuffer`s, `AudioBufferSourceNode`, `GainNode`, `BiquadFilterNode`, `WaveShaperNode`, `StereoPannerNode`, and `ConvolverNode`. `AudioBufferSourceNode` is explicitly an in-memory source, `PeriodicWave` is the standardized arbitrary-waveform mechanism, and the convolution and waveshaping behavior used above are part of the current Web Audio specification. citeturn156960search0turn156960search8turn156960search10turn156960search31

The single highest-value upgrade over your existing oscillator-plus-filter voices is therefore not “more oscillators” by itself. It is to make each voice **temporally layered**: a short, spectrally informative excitation; a stable pitch-bearing body; independent decay rates; and a small amount of deterministic spatial and performance variation. That combination is what moves these patches away from the perception of static Web Audio test tones while preserving the zero-sample, no-network, `OfflineAudioContext`-compatible architecture. citeturn657990search0turn675241search7turn675241search11