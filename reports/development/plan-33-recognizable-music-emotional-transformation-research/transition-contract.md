# Plan 33 — Transition and Lifecycle Considerations (Stage B Options, Nothing Selected)

**Date:** 2026-10-28 (system clock; updated for Review 01 repairs)
**Scope:** Architectural options and platform constraints for apartment ↔ gacha transitions, bar-aligned state changes, and audio lifecycle behavior. **These are Stage B (future runtime integration) options**: the owner does **not** need to decide fade lengths, story-state triggers, or loop continuity to accept Plan 33 or to authorize the lean 5-file first pass in `composition-brief.md`. Nothing here modifies production code, selects a library, or creates an automatic dependency on Plan 16 checkpoints or Plan 27 Receipt work.
**Evidence labels:** **`[E-full]`** / **`[E-abs]`** / **`[E-sec]`** empirical study; **`[P]`** practitioner/composer account; **`[T]`** specification/documentation or arithmetic; **`[H]`** hypothesis/inference.

---

## 1. Core Design Principles (Existing Project Constraints)

- **Single audio owner.** One controller owns creation, gain ramping, ducking, and stopping of all game music; UI views emit state/context requests and never manipulate Web Audio nodes directly.
- **Serve context change and story, never obscure exit or costs.** Music transitions must never delay, mask, or pressure Uninstall, costs, odds, or operational warnings.
- **Authored story state only; Receipt honesty binds.** The music state (`Base` / `Uneasy` / `Dire`) is driven strictly by explicit authored game state, never by inferred player emotion, spending velocity classified as "addiction," or physiological claims. The Receipt may record which music state was *displayed*, never why the player acted.
- **TV-sale independence.** Selling the apartment TV silences the apartment's diegetic music source; **it does not stop or alter the gacha app's music**, which follows its own context and story state.
- **Player controls always win.** In a large player survey ($N = 737$), 39.1% of players reported generally muting background music even in favorite games, with repetition and audio multitasking as top reasons (`[E-full]`: Rogers & Weber 2019). One-click mute and volume controls must apply immediately across all screens.

---

## 2. Browser Platform Constraints (`[T]`: Official Specifications & Docs)

| Constraint | Verified Specification / Documentation Rule | Design Consequence |
|---|---|---|
| **Autoplay & user gesture** | `AudioContext` created before a user gesture starts `suspended`; call `resume()` inside a user-gesture handler (`[T]`: Chrome autoplay docs 2017/2018; MDN Autoplay guide, `navigator.getAutoplayPolicy()`). | Start or resume audio on the player's first click/interaction in the apartment or title screen. |
| **Context states & `interrupted`** | `BaseAudioContext.state` values: `suspended`, `running`, `closed`, `interrupted` (`[T]`: W3C Web Audio WD 2026-09-22 §1.1). Calling `resume()` when `suspended` while the control-thread state is `interrupted` sets `state` to `interrupted`, fires `statechange`, and rejects with `InvalidStateError` (`[T]`: §1.2.3). | Never assume `resume()` succeeds synchronously; listen to `statechange` and reconcile audio graph state against stored data state. |
| **Suspended clock** | `suspend()` halts `currentTime`; scheduled `AudioParam` automation does not advance (`[T]`: W3C spec). | **Never implement mute via `suspend()`**: ramp master/music-bus `GainNode` to `0` so loop clocks and fades stay consistent. |
| **Gain automation & cancellation** | `exponentialRampToValueAtTime` cannot target `0` (stays at $V_0$ if $V_0$ or $V_1$ is $0$ or opposite sign; spec recommends `setTargetAtTime` or linear/curve ramps: `[T]`: §1.6.2). `cancelAndHoldAtTime(t)` cancels future events and holds the instantaneous automated value (`[T]`). | Start every superseding fade by calling `cancelAndHoldAtTime(now)` (or reading current gain) and ramping from the held value via `linearRampToValueAtTime`, `setTargetAtTime`, or `setValueCurveAtTime` (equal-power cosine/sine). |
| **Gapless loops vs. codec padding** | `AudioBufferSourceNode` `loopStart`/`loopEnd` are sample-indexed and clamp to `[0, duration]` (`[T]`: §1.9.2). HTMLMediaElement `loop` seeks to start at end of resource and is not guaranteed gapless (`[T]`: WHATWG HTML 4.8.11.8). MP3 encoders add start/end padding; Ogg Opus (Safari 18.4+) or explicit `loopStart`/`loopEnd` on decoded buffers avoid seam gaps (`[T]`). | Use decoded `AudioBufferSourceNode` loops (or local procedural synthesis via `src/audio/synth.mjs`) rather than `<audio loop>`. |
| **Clock lookahead scheduling & synthesis costs** | Main-thread `setTimeout` callbacks can jitter by tens of milliseconds or throttle in background tabs (`[P]`: Wilson 2013; `[T]`: MDN/Chrome timer throttling). Decoded `48 kHz` `float32` buffers cost `7.3728 MB` per `19.2 s` stereo stem (`22.1184 MB` for 3 full stereo mixes; `36.864 MB` for 5 stereo stems; `29.4912 MB` for 2 mono + 3 stereo stems: `[T]`). Procedural Web Audio synthesis avoids multi-MB `AudioBuffer` RAM, **but still carries active oscillator/filter node CPU, `AudioParam` automation, and timer-lookahead scheduling overhead** (`[T]`). | Compute beat/bar boundaries on `audioContext.currentTime` and weigh decoded-buffer memory against procedural voice/filter node management when Plan 32 is scoped. |

---

## 3. Audio-Owner Architecture & Transition Options (Stage B)

### A. Context Switching (Apartment ↔ Gacha)
- **Option 3A — Two persistent phase-locked loops, gain crossfade:** Keep apartment and gacha loops running silently when inactive; ramp gains on screen switch. *Pros:* zero start latency; *Cons:* gacha hook enters at an arbitrary bar rather than Bar 1; higher memory/CPU.
- **Option 3B — Start-on-entry at Bar 1:** Start the gacha loop from Bar 1 on entry while fading out the apartment source. *Pros:* the recognizable hook is always heard from its opening motif on every gacha visit (`[E-abs]`: Mélen & Deliège 1995 surface-cue anchor); lower active voice count.
- **Option 3C — Brief breathing gap or pad bridge (~0.5–1.2 s) vs. overlapping crossfade:**
  - *Empirical & craft note:* In an exploratory 20-minute gameplay study (**McNamara, Lindblom, & Arthur 2022**, `[E-full]` project report), transitions between areas that inserted a **brief silence** yielded slightly higher mean Short Flow State Scale scores than overlapping crossfades (though few differences reached statistical significance). In shipped games, composers also bridge state switches using a short harp/melodic transition cue (`[P]`: HOYO-MiX 2020 *Genshin Impact*), a sustained root pad "glue" (`[P]`: O'Donnell & Weinland 2005 *Halo 2*), or a brief filter sweep (`[P]`: Ueda 2017 *NieR: Automata*).
  - *Audit note:* External AI claims (`gemini-research-b.md`) that *NieR: Automata* used `0.5–2.0s` equal-power crossfades and *Genshin Impact* used `3.0–5.0s` unquantized diurnal fades were checked against the cited primary sources (Okabe 2018; Ueda 2017; Chen & Cai 2020) and **rejected as unsupported by the cited sources** (`deep-research/prompt-b/verification.md`). Crossfade duration (~0.5–2 s) vs. a brief breathing gap (~0.5–1 s) is an art-direction choice, not a published empirical law.

### B. Gacha State Switching (`Base` → `Uneasy` → `Dire`)
- **Measure-quantized alignment (`every measure`):** In *Hades*, **Darren Korb (2020)** (`[P]`) placed section markers at the **start of every measure** so arrangement shifts never cut mid-bar; at 100 bpm in 4/4, one bar is $2.4\text{ s}$ max wait (`[T]` arithmetic).
- **Salience rule (`[P]`: Korb's "effectiveness bell curve"):** Korb (2020) reported that fine-grained micro-mix changes go unnoticed during active play, whereas **clearly audible macro steps** (dropping a percussion layer, shifting bass register, or darkening harmony/timbre at a bar boundary) make the music feel responsive.
- **Stall / fatigue mitigation:** **O'Donnell & Weinland (2005)** (`[P]`, *Halo 2*) fade out loops if a player stalls in one state for an extended period without progress; **Worrall (2025)** (`[E-abs]`) models subtle per-loop micro-variation (filter cutoff or velocity) to delay verbatim loop fatigue (`[H]` in Quackpot until tested).

---

## 4. Interrupted Transitions & Invariants

1. **Single active transition:** A new context or state request supersedes any in-progress fade; transitions never stack in parallel.
2. **Cancel, hold, then ramp:** Call `cancelAndHoldAtTime(now)` on affected `GainNode`s and ramp from the held value to the new target (`[T]`).
3. **No node doubling:** Each `AudioBufferSourceNode` is started once and stopped/disconnected once its fade-out completes (`[T]`).
4. **State is data, not audio:** Store `{ context: 'apartment' | 'gacha' | 'silent', mood: 'base' | 'uneasy' | 'dire', muted, volume }` as plain state and reconcile the Web Audio graph to it whenever `AudioContext.state` becomes `running`.

---

## 5. Story-State Mapping Options (Explicit Only; Zero Player Profiling)

| Option | Mechanism | Honesty & Receipt Boundary |
|---|---|---|
| **S1 — Authored narrative flag** | A discrete `musicMood` (`base` / `uneasy` / `dire`) set at authored story beats (e.g., day/chapter transitions or scripted apartment events). | Cleanest and most auditable; explicitly authored. |
| **S2 — Explicit displayed threshold** | Stepped from an existing, player-visible game state (e.g., displayed story stage or visible apartment item sales). | Must map deterministically to a displayed state; never a hidden behavioral score. |
| **S3 — Scripted scene map** | Each authored scene/chapter declares its gacha music variant (`[P]`: Raine 2018 *Celeste* progressive non-dynamic cues). | Zero runtime branching complexity. |

**Strictly excluded:** Any inference of the real player's emotion, motivation, "addiction," or physiology; any claim in the Receipt that the music reflects how the player felt.

---

## 6. Lifecycle Policy Summary (Stage B Decisions for Later Integration)

| Lifecycle Event | Recommended Options | Constraint |
|---|---|---|
| **Mute / volume** | Ramp master/music-bus `GainNode` over ~50–100 ms; keep timeline advancing | Never use `suspend()` for mute (`[T]`). |
| **Hidden tab / blur** | (a) Fade out and pause when `document.hidden`; or (b) leave playing | Test >10 min hidden-tab behavior on target browsers. |
| **TV sale in apartment** | Apartment diegetic music fades to silence; **gacha music remains active when entering gacha** | TV sale must never imply the gacha app stopped. |
| **Uninstall modal & Receipt** | Immediate cancellable fade to silence (or calm neutral loop on Receipt with prominent mute); **never `Dire` on Receipt** | Hard Constraint #4 & #8: never delay Uninstall or steer Receipt critical reflection with oppressive audio. |
