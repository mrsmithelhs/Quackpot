# Plan 33 → Plan 32: Lean Composition & Art-Direction Listening Brief

**Date:** 2026-10-28 (system clock; updated for Review 01 repairs)
**Scope & Authorization Gate:** Proposed specification for a **separately authorized, owner-gated first composition and listening pass in Plan 32**. This brief contains **no score, no audio files, no synthesis code, no library selection, and no runtime story-state schedule**. Accepting Plan 33's research report does **not** automatically start composition or assign Plan 32; exact generation, listening, and resource scope require explicit later owner authorization. Owner listening is **art direction**, not population evidence or a statistical experiment.

---

## 1. Lean First-Pass Rendering Set (Exactly 5 Renderings)

If the owner later authorizes Plan 32's first pass, compose **one original gacha hook** (plus **one foil hook** of similar style/length) and render **five loudness-matched 8-bar loops**:

1. **The Hook (Originality & Bare-Melody Check):**
   - A short, memorable melody of **5–9 notes per phrase** over an **8-bar loop in 4/4** ($19.2\text{ s}$ at 100 bpm).
   - **Originality rule (Review 01):** "Original" means **no intentional copying of existing melodies and maintaining an auditable composition record** (e.g., documented scale/motif choices and text note tables)—not the impossible promise that a 5–9 note diatonic hook shares zero accidental two- or three-note intervals with tonal repertoire.
   - **Pass the "V0 Bare-Melody Test" (`[P]`: HOYO-MiX / Yu-Peng Chen 2020; Lena Raine 2018):** Verify that the unaccompanied single-voice melody has a distinctive rhythmic onset profile and pitch contour on its own. Pitch contour/intervals (`[E-abs]`: Dowling & Fujitani 1971) and surface rhythm/interval motifs (`[E-abs]`: Mélen & Deliège 1995; `[E-full]`: Kuusi 2009 descriptive pattern, with intact-vs-altered confounds noted in `recommendation.md` §2.1) support keeping the hook's pitches and rhythm fixed (`[H]`).

2. **The Five First-Pass Renderings (All Matched to `-16.0 LUFS` Integrated, `-1.0 dBFS` True Peak):**
   - **1. `Base`:** Bright, inviting, lightly bouncy diatonic major arrangement (`I, IV, V`) that **remains comfortable and listenable during reading** (`[H]` art direction); warm mid-bass register; steady pulse; resolved authentic cadence at bar 8.
   - **2. `Foil`:** A *different* original melody using the exact same tempo, tonal center, lead patch, and `Base` accompaniment style (sanity-checks "different tune" vs. "same tune").
   - **3. `Uneasy` (Approach 2):** Identical hook pitches, rhythm, tempo, tonal center, and lead patch. Accompaniment **loses some comfort without becoming horror** (`[H]` art direction): shifts to **diatonic substitutions (`ii, iii, vi`)** (`[E-abs]`/`[E-sec]`: Liu 2018; `[E-abs]`: Liu 2022) with at most **one unexpected or borrowed minor-mixture chord (`iv` or $\flat\text{VI}$, `[H]` craft choice)** (`[E-abs]`: Steinbeis et al. 2006), a **thinned mid-register texture** over a **low tonic/minor-third modal pedal** (`[E-full]`: Bostwick et al. 2018; `[E-abs]`: Friedman 2019; `[E-full]`: Trevor et al. 2023 correlational anxiety profile), moderate dynamic swells (e.g., $\pm 6\text{ dB}$ proposed starting parameter `[H]`), and a **withheld half or deceptive cadence** at bar 8 (`[E-full]`: Sears et al. 2020; Choi & Fujioka 2025). Avoid groove syncopation (`[E-full]`: Keller & Schubert 2011).
   - **4. `Dire-Clean` (Approach 2A, Untouched Lead):** Identical hook pitches, rhythm, tempo, tonal center, and **untouched `Base` lead patch**. Accompaniment aims first for **restrained, sparse, unresolved pressure** (`[H]` art direction, informed by **Silvey 2011**, `[E-full]`, where non-musicians rated a sparse solo version tenser than full orchestra): lowers the bass register (e.g., proposed ~55–110 Hz fundamental with ~110–240 Hz overtones `[H]`, informed by whole-passage register studies `[E-full]`: Huron et al. 2006; Granot & Eitan 2011), introduces **controlled harmonic tension / subtle 30–150 Hz roughness** in sparse backing voicings **without making the loop harsh or uncomfortable by default** (`[E-full]` tone/chord-pair studies: Farbood & Price 2017; Pressnitzer et al. 2000), and leaves bar 8 unresolved.
   - **5. `Dire-Filtered` (Approach 2B, Low-Pass Filtered Lead Only):** Identical to **`Dire-Clean`** in every backing and melodic parameter, except the lead synth patch receives **gentle within-patch low-pass filtering only** (no detuning mixed in, preserving a clean single-factor comparison; `[E-abs]`/`[E-sec]`: Lim & Goh 2012 within-family similarity; `[P]`: Korb 2020; Ueda 2017).

3. **Deferred Later Options (Not Rendered in First Pass Unless Owner Expands Scope):**
   - **Full melodic/modal/tempo alternative (`Approach 3` / `Dire-3`):** Octave-dropped lead, minor/Phrygian melodic inflection, and pulse hesitation.
   - **Extra texture/effect sub-variants:** Denser/rougher backing (`>3` events/s per Trevor et al. 2023 correlational terror profile), lead detuning (separated from low-pass filtering), or a separate $+3\text{ dB}$ loudness exploration. Keep these on the shelf unless the owner hears too little contrast in the 5-file first pass.

---

## 2. Representation, Loudness Matching, and Memory Budget Arithmetic (`[T]`)

| Parameter | Specification | Technical Basis & Exact Arithmetic (Review 01 Repair) |
|---|---|---|
| **Source representation** | Auditable text note/event tables (bar, beat, MIDI pitch, duration, velocity) + documented per-state chord/voicing/filter parameters | Provides an auditable originality and parameter record; supports either offline rendering or local Web Audio synthesis (`src/audio/synth.mjs`) if later authorized. |
| **Loudness matching method** | **ITU-R BS.1770 / EBU R128 integrated loudness (`-16.0 LUFS`, $\pm 0.5\text{ LU}$)** with **`-1.0 dBFS` true-peak headroom**; also record unweighted RMS (`dBFS`) | **LUFS vs. RMS distinction:** LUFS applies K-weighting (accounting for human ear sensitivity across frequency, especially bass roll-off and upper-mid presence), whereas RMS is unweighted signal energy (`[T]`). Because bass register shifts between `Base` and `Dire`, LUFS is the primary perceptual match metric, with RMS logged to document any low-frequency energy difference. |
| **Loop grid & seam** | **8 bars of 4/4** at 100 bpm ($19.2\text{ s}$ exact; or ~96–108 bpm = $17.78\text{–}20.00\text{ s}$); bar-aligned loop boundaries | Measure-quantized switching (`every measure`, $2.4\text{ s}$ per bar at 100 bpm) matches shipped practice (`[P]`: Korb 2020). Optional 16-bar A/A′ ($38.4\text{ s}$) or micro-variation to reduce loop fatigue (`[E-full]`: Rogers & Weber 2019; McNamara et al. 2022; `[E-abs]`: Worrall 2025) is an `[H]` hypothesis to check by ear. |
| **Exact decoded PCM arithmetic (`48 kHz` `float32`)** | - **1 stereo stem ($19.2\text{ s}$):** $48{,}000 \times 2 \times 4 \times 19.2 = \mathbf{7{,}372{,}800\text{ B}}$ (**`7.3728 MB`** decimal / `7.03125 MiB`)<br>- **1 mono stem ($19.2\text{ s}$):** $48{,}000 \times 1 \times 4 \times 19.2 = \mathbf{3{,}686{,}400\text{ B}}$ (**`3.6864 MB`** decimal / `3.515625 MiB`) | - **3 pre-rendered stereo full mixes (`Base`, `Uneasy`, `Dire`):** $3 \times 7.3728\text{ MB} = \mathbf{22.1184\text{ MB}}$ decoded RAM (~`0.7–1.2 MB` on disk as compressed Ogg Opus/Vorbis).<br>- **5 first-pass listening files (offline comparison set, not simultaneous runtime):** $5 \times 7.3728\text{ MB} = \mathbf{36.864\text{ MB}}$ decoded.<br>- **5 runtime stereo stems (shared lead, shared rhythm, 3 state backings):** $5 \times 7.3728\text{ MB} = \mathbf{36.864\text{ MB}}$ decoded.<br>- **2 mono stems (lead, bass) + 3 stereo stems:** $(2 \times 3.6864) + (3 \times 7.3728) = \mathbf{29.4912\text{ MB}}$ decoded (correcting the prior report's erroneous `~22 MB` figure).<br>- **Procedural Web Audio synthesis (`src/audio/synth.mjs`):** Avoids multi-megabyte `AudioBuffer` PCM storage (`< 50 KB` parameter tables), **but still incurs real-time oscillator, filter (`BiquadFilterNode`), gain-automation, and main-thread scheduling/GC costs** (`[T]`). |

---

## 3. Lean First-Pass Owner Art-Direction Listening Checks (Not Run in Plan 33)

- **Role of listening:** Owner listening is **practical art direction** for Quackpot, not a statistical experiment or human-subjects study (zero student data, zero telemetry).
- **Five core checks using the 5 renderings (`Base`, `Foil`, `Uneasy`, `Dire-Clean`, `Dire-Filtered`):**

| Check | Renderings Auditioned | Practical Art-Direction Question | Purpose |
|---|---|---|---|
| **1. Same-Tune / Foil Check** | `Base` vs. `Foil`, then `Base` → `Uneasy` → `Dire-Clean` | Does `Uneasy` and `Dire-Clean` clearly remain the same tune as `Base` (unlike `Foil`), while keeping `Base` pleasant during reading? | Sanity-checks hook recognizability across the accompaniment-only changes (`[E-abs]`/`[E-sec]`: Liu 2018). |
| **2. Mood-Order & Salience Check** | `Base` → `Uneasy` → `Dire-Clean` | Does `Uneasy` lose comfort without becoming horror, does `Dire` read as restrained unresolved pressure, and is each step clearly noticeable (`[P]`: Korb salience bell curve)? *(If contrast is too subtle, decide whether to pull a denser/rougher or Approach 3 variant off the shelf.)* | Evaluates the `[H]` state progression by ear. |
| **3. Clean vs. Filtered Lead Choice** | `Dire-Clean` (`2A`) vs. `Dire-Filtered` (`2B`, low-pass filter only) | Over the identical Dire backing, does the untouched lead (`Dire-Clean`) sound eerily isolated or mismatched, or does gentle low-pass filtering (`Dire-Filtered`) cohere better without losing tune identity? | Clean single-factor decision on lead filtering (`[E-abs]`/`[E-sec]`: Lim & Goh 2012; `[P]`: Korb 2020). |
| **4. Practical Speaker Check** | All 4 hook states on headphones **and** a built-in laptop/phone speaker | Do the low pedal and bass movement remain audible and balanced on small speakers without subwoofers? | Verifies actual hardware audibility rather than trusting a frequency formula (`[H]`). |
| **5. Loop-Seam & Comfort Check** | Let `Base`, `Uneasy`, and the preferred `Dire` loop cycle 3–5 times continuously | Is the bar-8 → bar-1 seam click-free, does the withheld cadence in `Uneasy`/`Dire` work across repeats, and do all three states avoid harsh ear fatigue? | Checks loop seam hygiene and listening comfort during reading (`[P]`: Korb 2020; `[E-full]`: Rogers & Weber 2019). |

---

## 4. Short Owner Gate to Open Plan 32 First Pass

1. **Authorize Plan 32 to compose the original 8-bar hook and render the 5-file first-pass set (`Base`, `Foil`, `Uneasy`, `Dire-Clean`, `Dire-Filtered`)?**
2. **Confirm the starting aesthetic target:** Bright, inviting, lightly bouncy `Base` (comfortable for reading) → less-comfortable `Uneasy` → restrained, sparse, unresolved `Dire`, keeping denser/rougher backing and `Approach 3` (melodic/modal/tempo shift) in reserve unless needed after hearing the 5 files?
