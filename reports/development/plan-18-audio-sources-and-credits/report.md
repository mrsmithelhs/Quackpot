# Audio Sources, Licensure, and Audition Investigation Report (Repair 01)

**Packet:** Plan 18 — Local audio sources and credits investigation  
**Date:** 2026-10-25  
**Investigator:** Implementer thread  
**Scope:** `reports/development/plan-18-audio-sources-and-credits/`  
**Status:** Completed Repair 01 investigation for owner review; no production integration.

---

## 1. Executive Summary and Scope Boundaries

This investigation delivers a bounded, source-backed local audition workbench comparing **three licensed sound effect candidates** and **two licensed music candidates** under the owner-approved Creative Commons audio policy (**DECISION-010**), while retaining the **three synthesized quack candidates** from Plan 04 as reference options.

### Scope Boundaries and Constraints Upheld:
- **No production code modified:** Zero edits to `src/`, `package.json`, or shared build scripts.
- **Zero third-party runtime requests (Hard Constraint #2):** All 5 audio candidates are bundled locally under `reports/development/plan-18-audio-sources-and-credits/audio/`. Zero CDNs, telemetry endpoints, or external network requests. (Standard local HTTP requests fetch local assets when served via a static web server).
- **Preservation of parallel implementers:** Parallel work on Plan 04 and other active threads remains completely untouched.
- **No account creation or purchases:** All candidates originate from public, verified Creative Commons repositories (Kenney, Wikimedia Commons, OpenGameArt).
- **Authoritative synth parity:** Rather than hand-reimplementing the Web Audio graph, `build-audition.mjs` reproducibly compiles the authoritative `src/audio/synth.mjs` into `bundled-synth.js`, verified via `parity.test.mjs`.
- **Honest playback lifecycle:** All audio elements and synth calls handle start, rejection, stop, and mute truthfully without false "playing" states.

---

## 2. Shortlist and Contextual Evaluation

### Sound Effects Shortlist (At Most Three Candidates)

| Candidate | Local File | Creator & Official Source | License | Size & Duration | Technical Profile & Levels | Contextual Role in Quackpot |
|---|---|---|---|---|---|---|
| **Effect 1: UI Tap** | `click1.wav` | Kenney ([UI Audio](https://kenney.nl/assets/ui-audio)) | CC0 1.0 Universal | 18,254 bytes / 0.103s | 16-bit 44.1kHz Stereo PCM; measured peak -1.54 dBFS, RMS -24.53 dBFS | Tactile feedback on primary buttons ("Pull 10x", "Skip", menu tabs). Uncompressed PCM avoids runtime decoding overhead. |
| **Effect 2: Card / Duplicate Slide** | `cardSlide1.ogg` | Kenney ([Casino Audio](https://kenney.nl/assets/casino-audio)) | CC0 1.0 Universal | 17,704 bytes / 0.601s | Ogg Vorbis 44.1kHz Stereo; Ogg levels uncalculated (compressed stream) | Duplicate card dissolve / feather flutter / Down token conversion. Tactile paper/felt friction bridges card games and gacha mechanics. |
| **Effect 3: Rarity Reveal Chime** | `jingles_STEEL00.ogg` | Kenney ([Music Jingles](https://kenney.nl/assets/music-jingles)) | CC0 1.0 Universal | 15,691 bytes / 0.933s | Ogg Vorbis 44.1kHz Stereo; Ogg levels uncalculated (compressed stream) | 4-Star / 5-Star pull anticipation reveal fanfare. Acoustic steel chime / glockenspiel accent avoids abrasive 8-bit blips. |

*(Note: Jingle binary retrieved via community mirror `iwenzhou/kenney`; official asset page is Kenney Music Jingles).*

### Music Shortlist (At Most Two Candidates)

| Candidate | Local File | Creator & Official Source | License | Size & Duration | Musical Character | Contextual Role in Quackpot |
|---|---|---|---|---|---|
| **Music 1: Apartment Ambient Loop** | `chilllofir-loop.ogg` | omfgdude, arr. qubodup ([OpenGameArt #135940](https://opengameart.org/content/chill-lofi-inspired-loop-edit)) | CC0 1.0 Universal | 2,360,833 bytes / 97.216s | Mellow, unhurried lofi hip-hop; acoustic piano chords, subtle vinyl warmth, relaxed beat. | Metagame apartment scene, physical duck companion interaction, daily life framing, and calm debrief. |
| **Music 2: Gacha App Theme** | `fluffing-a-duck.ogg` | Kevin MacLeod ([Wikimedia File Page](https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Fluffing_a_Duck.ogg)) | CC BY 3.0 Unported | 1,405,902 bytes / 67.370s | Comedic, bouncy cartoon fanfare; playful trombone, tuba, clarinets, and woodwinds. | Fictional mobile game interface, pull theater, and commercial store browsing. Satirical sensory momentum. |

### Retained Reference Options (Plan 04 Synthesized Quacks)
All three synthesized quack presets developed under Plan 04 (`src/audio/synth.mjs`) remain fully playable within the audition workbench via `bundled-synth.js`:
1. **QUACK_A_CONTROL (Baseline Control):** 340 Hz sawtooth, 0.22s duration, -140 Hz pitch bend, 22 Hz vibrato at 35 Hz depth. (Retained reference option).
2. **QUACK_B_SYNTH_ADSR (Articulated ADSR):** 380 Hz sawtooth, 0.105s duration, -40 Hz pitch bend, snappy 5ms attack, 15% sustain floor. (Retained reference option).
3. **QUACK_C_FORMANT_NOISE (Source-Filter Formant & Breath):** 300 Hz sawtooth, 0.15s duration, -30 Hz inflection, parallel dual bandpass filters (750 Hz Q 3.0 / 1600 Hz Q 3.5) with a 15ms deterministic LCG noise burst.
   - **Correction on Selection Status:** DECISION-009 approved visual Mode C and retained all three audio candidates; **no primary quack sound was selected**. Candidate C is presented as a **recommended vocal candidate** for owner evaluation, while all three remain available.
   - **Listening Observation Verified:** As noted by the owner in DECISION-009, Candidate C sounds noticeably softer. The parallel dual bandpass formant filtering naturally attenuates spectral energy outside 750 Hz and 1600 Hz compared to unfiltered sawtooth signals. Master gain (0.15) is preserved as authored without artificial normalization.

---

## 3. Technical Analysis, Browser Compatibility, and Lifecycle Handling

### 3.1 File Size and Delivery Payload
- **Sound Effects Payload:** `18.3 KB + 17.7 KB + 15.7 KB = 51.7 KB`. Total effects footprint is small and loads rapidly over standard connections.
- **Music Payload:** `2.36 MB + 1.41 MB = 3.77 MB`. Total media bundle is ~3.82 MB.
- In production, sound effects can be loaded on first user gesture, while music tracks can use standard HTML5 `<audio>` elements with `preload="metadata"`.

### 3.2 Audio Decoding, Latency, and Format Support
- **WAV Decoding:** Uncompressed 16-bit linear PCM (`click1.wav`) avoids runtime codec decompression in JavaScript. However, operating system and hardware audio buffer scheduling latency still apply (typically 10–30 ms on desktop platforms).
- **Ogg Vorbis Browser Compatibility:**
  - Modern Evergreen browsers (Google Chrome, Microsoft Edge, Mozilla Firefox) natively support Ogg Vorbis.
  - **WebKit / Safari Compatibility:** Per [WebKit release documentation](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/), support for Ogg containers (Ogg Vorbis and Ogg Opus) was added in **Safari 18.4** (March 2025 on macOS Sequoia 15.4, iOS 18.4, iPadOS 18.4, and visionOS 2.4).
  - Earlier Safari versions (Safari 17 and below, macOS Sonoma and earlier, iOS 17 and earlier) do *not* natively decode Ogg Vorbis audio. In such environments, Ogg playback will fail cleanly.
  - The audition workbench in `audition.html` catches playback rejections and displays an informative error caption rather than failing silently or falsely reporting that audio played.

### 3.3 Loop Seams and Playback Lifecycle
- **`chilllofir-loop.ogg`:** Authored by qubodup as a seamless loop edit. In audition listening tests across repetitions, the transition between loop iterations sounds musically natural and free of clicks. However, sample-accurate loop alignment in browsers depends on audio engine scheduling.
- **`fluffing-a-duck.ogg`:** Composed 67-second track. In gameplay context, it serves as the backdrop during active gacha pulling, suitable for playing once or looping with a crossfade during pull sessions.

### 3.4 Honest Lifecycle, Stop All, and Volume Management
- **Media Play Promises:** All `sound.play()` calls are awaited within try/catch blocks. If playback is rejected (by browser autoplay restrictions or codec incompatibility), the UI immediately clears `.playing` state and displays the exact error message.
- **Synthesizer Lifecycle:** Synth playback checks the return object from `DuckSynth.playSynthesizedSound()`. If the AudioContext is suspended or unsupported, the UI displays the failure reason and does not claim audio played.
- **Stop All Functionality:** Clicking "Stop All" pauses all HTML5 audio elements, resets `currentTime = 0`, and calls `DuckSynth.resetAudioContextForTesting()`, immediately terminating any active Web Audio oscillators, noise buffers, and gain ramps.
- **Master Volume & Mute:** Scales both HTML5 audio elements and Web Audio synthesizer master gain.

---

## 4. Accessible Information Equivalents and Decoupled Preferences

In compliance with project accessibility commitments, **sound must never be the sole carrier of information**. Every auditory event in Quackpot has a synchronized visual and accessible equivalent:

| Auditory Event | Sound Candidate | Visual State Equivalent (Candidate Proposals) | Accessible Announcement (Candidate Proposals) |
|---|---|---|---|
| Primary Button Tap | `click1.wav` | Visible button `:active` depth shadow and color shift; focus ring update. | Native button activation / `aria-pressed`. |
| Duplicate Down Conversion | `cardSlide1.ogg` | Card flip rotation, duplicate card dissolution into golden feather particles; Down counter increments. | Live region announcement: *"Duplicate card converted to +1 Down feather."* |
| High-Rarity Reveal (4★/5★) | `jingles_STEEL00.ogg` | Gold foil border flash, glowing card back, sparkling star particle burst (candidate presentation). | Live region announcement: *"High-rarity duck revealed!"* |
| Duck Vocal Quack | Synthesized Quacks A/B/C | SVG beak opening/pivot, subtle feather vibration, animated comic speech balloon. | Live text caption: `[Duck quacks]`. |
| Ambient Music | `chilllofir-loop.ogg` / `fluffing-a-duck.ogg` | Visual banner theme, animated phone screen glow, bouncing status indicator. | Status bar indicator showing current soundscape (with mute toggle). |

### Strict Decoupling of Mute and Reduced Motion
- **Mute Audio:** Controls sound output only. When enabled, all sound effects and music are silenced, while visual animations and transitions continue normally.
- **Reduced Motion:** Controls visual animations only. When enabled, screen shakes, camera rotations, and particle bursts are disabled or replaced with instant static cuts; it does **not** automatically mute game audio.
- The operable preview in `audition.html` provides independent toggles for both preferences to demonstrate this architectural separation.

---

## 5. Operable Opening and Settings Credits Dialog

The proposed Credits specification is fully detailed in [`credits-proposal.md`](file:///c:/AI/Quackpot/reports/development/plan-18-audio-sources-and-credits/credits-proposal.md) and demonstrated in [`audition.html`](file:///c:/AI/Quackpot/reports/development/plan-18-audio-sources-and-credits/audition.html).

### Verified Functional Properties:
1. **Operable Dialog Entry Points:** Two realistic trigger buttons simulate opening from the Title Screen and the Settings Menu.
2. **Native `<dialog>` Architecture:** Opens via `showModal()`, enforcing native focus containment and dimming the background backdrop.
3. **Keyboard Dismissal:** Pressing `Escape` or clicking either "Close Credits" button dismisses the dialog.
4. **Verified Focus Return:** Upon closing, focus is programmatically returned to whichever button originally opened the modal (`lastFocusedElement.focus()`).
5. **Factual Attribution Separation:** Real creator identities (Kevin MacLeod, Kenney, omfgdude, qubodup, CourseVGD) are strictly quarantined inside the Credits view and never leak into gameplay text.
6. **Exact License Attribution:**
   - *"Fluffing a Duck"* Kevin MacLeod (incompetech.com), licensed under Creative Commons Attribution 3.0 Unported (CC BY 3.0) https://creativecommons.org/licenses/by/3.0/
   - Kenney UI Audio, Casino Audio, and Music Jingles under CC0 1.0 Universal.
   - *"Chill lofi inspired [loop edit]"* by omfgdude, arr. qubodup under CC0 1.0 Universal.

---

## 6. Recommendations for Owner Selection

1. **Approve Effect Candidates 1–3 for Future Integration:**
   - `click1.wav` is an industry-standard tactile click that avoids ear fatigue.
   - `cardSlide1.ogg` provides tactile paper friction for card reveals and Down feather conversion.
   - `jingles_STEEL00.ogg` provides a celebratory high-rarity reward fanfare.
2. **Approve Dual Music Strategy (Apartment vs Gacha App):**
   - Use `chilllofir-loop.ogg` (CC0) for the physical apartment context, companion interaction, and post-game reflection.
   - Use `fluffing-a-duck.ogg` (CC BY 3.0) for the fictional gacha mobile app and pull theater.
3. **Retain Procedural Quack Candidate C as Recommended Vocal Cue:**
   - Candidate C's dual formant filtering and breath noise provide an organic duck vocalization while preserving the text-stored parameter engine with zero external dependencies. (All three candidates remain available as retained options).
4. **Coordinate Integration Gates:**
   - Production audio integration should follow approval of **Plan 15** (pull anticipation timing) and **Plan 14** (context transitions between apartment portrait and phone landscape).
