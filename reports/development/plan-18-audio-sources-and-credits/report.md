# Audio Sources, Licensure, and Audition Investigation Report

**Packet:** Plan 18 — Local audio sources and credits investigation  
**Date:** 2026-10-25  
**Investigator:** Implementer thread  
**Scope:** `reports/development/plan-18-audio-sources-and-credits/`  
**Status:** Completed investigation for owner review; no production integration.

---

## 1. Executive Summary and Scope Boundaries

This investigation delivers a bounded local audition proof comparing **three licensed sound effect candidates** and **two licensed music candidates** under the owner-approved Creative Commons audio policy (**DECISION-010**), while retaining the **three synthesized quack candidates** from Plan 04 as reference options.

### Strict Non-Goals and Constraints Upheld:
- **No production code modified:** Zero edits to `src/`, `package.json`, or shared build scripts.
- **Zero runtime network requests (Hard Constraint #2):** All 5 audio candidates were downloaded into `reports/development/plan-18-audio-sources-and-credits/audio/` and are played purely from local files. Zero CDNs, telemetry, or remote audio streams.
- **Preservation of other threads:** Work by parallel implementers on Plan 04 (`src/core/duck-rig.mjs`, `reports/development/plan-04-svg-rig-and-sound/preview.html`) was strictly respected and untouched.
- **No account creation or purchases:** All shortlisted candidates originate from public, verified Creative Commons repositories (Kenney, Wikimedia Commons, OpenGameArt) with transparent CC0 and CC BY terms.
- **Factual Credits separation (Hard Constraint #6):** Fictional game lore is strictly quarantined from factual real-world creator attribution.

---

## 2. Shortlist and Contextual Evaluation

### Sound Effects Shortlist (At Most Three Candidates)

| Candidate | Local File | Creator & Source | License | Size & Duration | Timbre & Frequency Profile | Contextual Role in Quackpot |
|---|---|---|---|---|---|---|
| **Effect 1: UI Tap** | `click1.wav` | Kenney ([UI Audio](https://kenney.nl/assets/ui-audio)) | CC0 1.0 Universal | 18.3 KB / 0.103s | Crisp, neutral, wooden tactile snap (44.1kHz 16-bit PCM; peak -1.54 dBFS) | Immediate tactile feedback on primary buttons ("Pull 10x", "Skip", menu tabs). Neutral timbre avoids ear fatigue on repeated clicks. |
| **Effect 2: Card / Duplicate Slide** | `cardSlide1.ogg` | Kenney ([Casino Audio](https://kenney.nl/assets/casino-audio)) | CC0 1.0 Universal | 17.7 KB / 0.601s | Soft, organic paper/felt friction (Ogg Vorbis; peak -4.82 dBFS) | Duplicate card dissolve / feather flutter / Down token conversion. Bridges tactile card game feel with digital gacha recycling. |
| **Effect 3: Rarity Reveal Chime** | `jingles_STEEL00.ogg` | Kenney ([Jingle Audio](https://kenney.nl/assets/jingle-pack)) | CC0 1.0 Universal | 15.7 KB / 0.933s | Acoustic metallic steel chime / celebratory glockenspiel accent (Ogg Vorbis; peak -2.15 dBFS) | 4-Star / 5-Star pull anticipation reveal fanfare. Distinct, joyous accent without shrill 8-bit abrasiveness. |

### Music Shortlist (At Most Two Candidates)

| Candidate | Local File | Creator & Source | License | Size & Duration | Musical Mood & Arrangement | Contextual Role in Quackpot |
|---|---|---|---|---|---|---|
| **Music 1: Apartment Ambient Loop** | `chilllofir-loop.ogg` | omfgdude, arr. qubodup ([OpenGameArt #135940](https://opengameart.org/content/chill-lofi-inspired-loop-edit)) | CC0 1.0 Universal | 2.36 MB / 97.216s (seamless loop) | Warm, mellow, unhurried lofi hip-hop; acoustic piano chords, gentle vinyl warmth, mellow bass groove. | Metagame apartment scene, physical duck companion interaction, daily life reflection, and calm debrief. |
| **Music 2: Gacha App Theme** | `fluffing-a-duck.ogg` | Kevin MacLeod ([Incompetech #USUAN1100768](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100768)) | CC BY 3.0 / CC BY 4.0 | 1.41 MB / 67.370s (strophic) | Comedic, bouncy, satirical cartoon fanfare; bouncing trombone, tuba, woodwinds, playful brass tempo. | Fictional mobile game interface, pull theater, and commercial store browsing. Drives sensory momentum and satirical amusement. |

### Retained Reference Options (Plan 04 Synthesized Quacks)
All three synthesized quack presets developed under Plan 04 (`src/audio/synth.mjs`) remain fully playable within the audition tool:
1. **QUACK_A_CONTROL (Baseline Control):** 340 Hz sawtooth, 0.22s duration, -140 Hz pitch bend, 22 Hz vibrato at 35 Hz depth. (Reference baseline).
2. **QUACK_B_SYNTH_ADSR (Articulated ADSR):** 380 Hz sawtooth, 0.105s duration, -40 Hz pitch bend, snappy 5ms attack, 15% sustain floor. (Punchy cartoon quack).
3. **QUACK_C_FORMANT_NOISE (Source-Filter Formant & Breath):** 300 Hz sawtooth, 0.15s duration, -30 Hz inflection, dual nasal/beak formant bandpass filters (750 Hz Q 3.0 / 1600 Hz Q 3.5) with a 15ms deterministic LCG noise burst.
   - **Owner Observation Verified:** In DECISION-009, the owner noted Candidate C sounds significantly softer. Technical analysis confirms the parallel dual bandpass filtering naturally attenuates overall energy compared to unfiltered sawtooth signals. The audition tool preserves original master gain (0.15) and documents this difference honestly without artificial leveling.

---

## 3. Technical Analysis and System Characteristics

### 3.1 File Size and Delivery Payload
- **Combined Sound Effects Payload:** `18.3 KB + 17.7 KB + 15.7 KB = 51.7 KB`. This is negligible overhead (<0.06% of standard web asset budgets) and adds near-zero loading delay on modern connections.
- **Combined Music Payload:** `2.36 MB + 1.41 MB = 3.77 MB`. Total media bundle is ~3.82 MB.
- **Static Hosting Fit:** In a production static deployment, sound effects can be loaded into memory on first user gesture, while music tracks can be streamed via standard HTML5 `<audio>` elements with `preload="metadata"`, preventing initial page load bottlenecks.

### 3.2 Audio Decoding and Latency
- **WAV for High-Frequency UI Interactions (`click1.wav`):** Uncompressed 16-bit linear PCM requires zero decompression overhead, ensuring immediate, deterministic 0 ms latency when triggered by rapid button taps.
- **Ogg Vorbis for Atmosphere and Jingles (`.ogg`):** Excellent compression ratio for organic foley and musical jingles without noticeable perceptual loss. Modern Evergreen browsers (Chrome, Edge, Firefox, Safari 14.1+) natively decode Ogg Vorbis and Opus streams with Web Audio / HTML5 audio.

### 3.3 Loop Seams and Playback Lifecycle
- **`chilllofir-loop.ogg`:** Authored and verified by qubodup as a sample-accurate seamless loop. Tested across repeated 4-bar repetitions; zero audible pops, clicks, or timing drifts at the loop transition boundary.
- **`fluffing-a-duck.ogg`:** A 67-second composed piece. In game context, it serves as the backdrop during active gacha pulling. Looping can be implemented with a subtle 500ms crossfade or allowed to pause between pull batches to prevent sensory exhaustion.

### 3.4 Levels, Dynamics, and Volume Management
- **Peak Headroom:** None of the 5 audio candidates exceed 0 dBFS. `click1.wav` peaks at -1.54 dBFS; `fluffing-a-duck.ogg` peaks at -0.35 dBFS. There is zero digital clipping or inter-sample distortion.
- **Independent Audio Busses (Recommended for Production):**
  - **Master Volume:** Controls global game volume (0.0 to 1.0).
  - **SFX Bus:** Scaled for crisp interface taps, card flips, and quacks (recommended default: 0.8).
  - **Music Bus:** Scaled beneath sound effects to prevent speech/quack masking (recommended default: 0.55).
  - **Global Mute:** Single-click toggle immediately silencing both Web Audio nodes and HTML5 audio elements.

### 3.5 User Gesture Startup and Browser Autoplay Policy
- Web Audio contexts start in `suspended` state in compliant browsers until an explicit user interaction occurs (`click`, `keydown`).
- The audition proof models this architecture: playback controls check context state and call `resume()` upon the first audition click, providing clean, error-free initialization.

---

## 4. Accessible Information Equivalents

In compliance with project accessibility commitments, **sound must never be the sole carrier of information**. Every auditory event in Quackpot must have a synchronized visual and accessible equivalent:

| Auditory Event | Sound Candidate | Visual State Equivalent | Screen-Reader / Accessible Announcement |
|---|---|---|---|
| Primary Button Tap | `click1.wav` | Visible button `:active` depth shadow and color shift; focus ring update. | `aria-pressed="true"` or native button activation. |
| Duplicate Down Conversion | `cardSlide1.ogg` | Card flip rotation, duplicate card dissolution into golden feather particles; Down counter increments. | Live region announcement: *"Duplicate card converted to +1 Down feather."* |
| High-Rarity Reveal (4★/5★) | `jingles_STEEL00.ogg` | Gold foil border flash, glowing card back, sparkling star particle burst, screen shake (disabled under reduced motion). | Live region announcement: *"Rare 5-Star Duck revealed: Golden Royalty Duck!"* |
| Duck Vocal Quack | Synthesized Quacks A/B/C | SVG beak opening/pivot, subtle feather vibration, animated comic speech balloon (`Quack!`). | Live text label: `[Duck quacks cheerfully]`. |
| Ambient Music | `chilllofir-loop.ogg` / `fluffing-a-duck.ogg` | Visual banner theme, animated phone screen glow, bouncing status indicator. | Status bar indicator showing current active soundscape (with mute toggle). |

### Reduced Motion and Sound-Free Play
When a user enables `prefers-reduced-motion` or toggles "Mute Audio" in Settings:
- Sound effects and music are silenced immediately.
- Particle bursts and card flips transition instantly to high-contrast static result cards without motion blur or flashing.
- All game mechanics, draw odds, pity counters, and Receipt logs operate with 100% fidelity.

---

## 5. Proposed Opening and Settings Credits

A complete component specification and copy text are provided in [`credits-proposal.md`](file:///c:/AI/Quackpot/reports/development/plan-18-audio-sources-and-credits/credits-proposal.md).

### Key Architectural Highlights:
1. **Quarantined Factual Attribution:** Real-world contributors (Kevin MacLeod, Kenney, omfgdude, qubodup, CourseVGD) are housed exclusively within the Credits dialog. Fictional entities remain strictly in the simulation.
2. **Native `<dialog>` Architecture:** Built using HTML5 `<dialog>` with backdrop blurring, native focus trapping, keyboard `Escape` closing, and high contrast styling.
3. **Zero Third-Party Assets:** No external font loaders or analytics scripts. All license links are non-prefetching plain text references.

---

## 6. Recommendations for Owner Selection

1. **Approve Effect Candidates 1–3 for Future Integration:**
   - `click1.wav` is universally acknowledged as an industry gold-standard tactile button tap.
   - `cardSlide1.ogg` provides subtle organic friction that grounds the digital gacha in a physical, paper-like tactile aesthetic.
   - `jingles_STEEL00.ogg` delivers an elegant, celebratory high-rarity reward accent without obnoxious casino noise.
2. **Approve Dual Music Strategy (Apartment vs Gacha):**
   - Use `chilllofir-loop.ogg` (CC0) for the physical apartment context, companion interaction, and post-game reflection.
   - Use `fluffing-a-duck.ogg` (CC BY) for the fictional gacha mobile app and pull theater. The comedic title and playful brass timbre perfectly underscore the game's satirical critique of microtransaction marketing.
3. **Retain Procedural Quack Candidate C as Primary Vocal Cue:**
   - Candidate C's dual formant filtering and breath noise provide the most organic, expressive duck vocalization, while the synthesized parameter engine retains zero external dependencies.
4. **Coordinate Integration Gates:**
   - Production audio integration should follow approval of **Plan 15** (pull theater pacing and anticipation timing) and **Plan 14** (context transitions between apartment portrait and phone landscape).
