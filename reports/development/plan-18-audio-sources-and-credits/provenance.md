# Audio Asset Provenance and License Manifest

**Packet:** Plan 18 — Local audio sources and credits investigation  
**Date:** 2026-10-25  
**Scope:** `reports/development/plan-18-audio-sources-and-credits/`  
**Status:** Investigation evidence for owner selection; no production integration.

---

## 1. Policy Authority and Legal Basis

Under **DECISION-010** (accepted 2026-10-25), the project owner approved expanding sound effect and music sources beyond text-stored synthesis to permit **selected locally bundled Creative Commons-licensed recordings** (including **CC0 public domain dedications**), alongside synthesized effects and JS/model-generated audio.

The canonical game design (`docs/founding/design.md` §Assets) and agent guide (`AGENTS.md` §5, §7) enforce strict guardrails:
1. **Local bundling only:** All audio assets must be hosted locally within the static build. Zero runtime CDN requests, remote audio streams, or third-party telemetry are permitted (Hard Constraint #2).
2. **Exact license verification:** Each asset must have its exact license, version, redistribution/modification terms, and required attribution notices verified from primary sources.
3. **Factual credits separation:** Real creator/source identities and license notices belong strictly in factual Credits (linked from opening and settings) and in provenance records. Fictional game entities (publishers, sponsors, streamers, characters) remain fictional (Hard Constraint #6).
4. **Preference for CC0 and CC BY:** Unencumbered public domain dedications (CC0 1.0) and straightforward attribution licenses (CC BY 3.0 / CC BY 4.0) are preferred to ensure zero copyleft contagion and clear classroom distribution rights.

---

## 2. Shortlisted Asset Summary Table

| Local Filename | Title / Track Name | Creator / Contributor | Original Source URL | License & Version | Format & Size | Duration | Intended Role in Quackpot |
|---|---|---|---|---|---|---|---|
| `click1.wav` | Click 1 | Kenney | [Kenney UI Audio](https://kenney.nl/assets/ui-audio) | CC0 1.0 Universal | WAV, 16-bit 44.1kHz, 18,254 bytes (17.8 KB) | 0.103s | UI Button Tap / Primary Action Click |
| `cardSlide1.ogg` | Card Slide 1 | Kenney | [Kenney Casino Audio](https://kenney.nl/assets/casino-audio) | CC0 1.0 Universal | OGG Vorbis, 44.1kHz stereo, 17,704 bytes (17.3 KB) | 0.601s | Duplicate Feather Dissolve / Card Flip |
| `jingles_STEEL00.ogg` | Steel Jingle 00 | Kenney | [Kenney Jingle Audio](https://kenney.nl/assets/jingle-pack) | CC0 1.0 Universal | OGG Vorbis, 44.1kHz stereo, 15,691 bytes (15.3 KB) | 0.933s | Rarity Reveal Chime (4★/5★ Pull Accent) |
| `chilllofir-loop.ogg` | Chill lofi inspired [loop edit] | omfgdude (arr. qubodup) | [OpenGameArt #135940](https://opengameart.org/content/chill-lofi-inspired-loop-edit) | CC0 1.0 Universal | OGG Vorbis, 44.1kHz stereo, 2,360,833 bytes (2.3 MB) | 97.216s | Metagame Apartment / Cozy Lo-Fi Loop |
| `fluffing-a-duck.ogg` | Fluffing a Duck | Kevin MacLeod | [Incompetech #USUAN1100768](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100768) | CC BY 3.0 / CC BY 4.0 | OGG Vorbis, 44.1kHz stereo, 1,405,902 bytes (1.4 MB) | 67.370s | Fictional Gacha App Theme / Pull Theater |

---

## 3. Cryptographic Verification Checksums

All candidate audio binaries stored locally under `reports/development/plan-18-audio-sources-and-credits/audio/` were verified against their upstream sources and hashed:

```text
c562897f8dd486cd622341fa57cf1cf3a5087140b7c0ac2219db90faca913177  cardSlide1.ogg
ccaa02bb60310146f1fa3b1c70be0a5a57f0674b9c4944a22b85b0c03e932cdb  chilllofir-loop.ogg
dd90b97f38b0ec7d52161d7c3bf8d61a66655766fd0af06439963351b4853a83  click1.wav
2e38f6d769351fb1f763ebaa387ee24f9c8693391f9888d6b304d1adafa9253d  fluffing-a-duck.ogg
8799eb726d784ae0aa1a9df80648a873ac60015bc00aea12c8e2dd1431a2bd7d  jingles_STEEL00.ogg
```

---

## 4. Detailed Per-Asset Provenance Records

### Asset 1: `click1.wav`
- **Asset Name:** Click 1
- **Local File Path:** `reports/development/plan-18-audio-sources-and-credits/audio/click1.wav`
- **Creator / Author:** Kenney (Kenney Vleugels)
- **Primary Source URL:** `https://kenney.nl/assets/ui-audio`
- **Direct Retrieval Repository:** `https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/click1.wav`
- **Date Retrieved:** 2026-10-25
- **File Format:** Microsoft WAV format, 16-bit Signed Integer PCM, 2 channels (stereo), 44,100 Hz
- **Size:** 18,254 bytes
- **Duration:** 0.103 seconds (103 ms)
- **Peak Level:** -1.54 dBFS (clean headroom; no clipping)
- **RMS Level:** -24.53 dBFS
- **License:** Creative Commons CC0 1.0 Universal (Public Domain Dedication)
  - Deed: `https://creativecommons.org/publicdomain/zero/1.0/`
  - Legal Code: `https://creativecommons.org/publicdomain/zero/1.0/legalcode`
- **Redistribution & Modification Terms:** Worldwide dedication to the public domain. Unlimited copying, modification, distribution, and commercial/educational performance without permission or required attribution.
- **Attribution Policy:** Attribution is legally optional under CC0, but project policy provides formal factual credit:
  > *"UI Audio by Kenney (www.kenney.nl) — CC0 1.0 Universal."*
- **Modifications Made:** None. Preserved exact original PCM waveform.

### Asset 2: `cardSlide1.ogg`
- **Asset Name:** Card Slide 1
- **Local File Path:** `reports/development/plan-18-audio-sources-and-credits/audio/cardSlide1.ogg`
- **Creator / Author:** Kenney (Kenney Vleugels)
- **Primary Source URL:** `https://kenney.nl/assets/casino-audio`
- **Direct Retrieval Repository:** `https://raw.githubusercontent.com/iwenzhou/kenney/master/Audio%20(295%20files)/Casino%20sounds%20(50%20sounds)/cardSlide1.ogg`
- **Date Retrieved:** 2026-10-25
- **File Format:** Ogg Vorbis stream, 2 channels (stereo), 44,100 Hz
- **Size:** 17,704 bytes
- **Duration:** 0.601 seconds (601 ms)
- **Peak Level:** -4.82 dBFS
- **RMS Level:** -28.10 dBFS
- **License:** Creative Commons CC0 1.0 Universal (Public Domain Dedication)
  - Deed: `https://creativecommons.org/publicdomain/zero/1.0/`
  - Legal Code: `https://creativecommons.org/publicdomain/zero/1.0/legalcode`
- **Redistribution & Modification Terms:** Public domain dedication. Unrestricted reuse and bundling.
- **Attribution Policy:** Included in opening/settings Credits:
  > *"Casino Audio (Card Slide) by Kenney (www.kenney.nl) — CC0 1.0 Universal."*
- **Modifications Made:** None. Upstream Vorbis bitstream kept bit-identical.

### Asset 3: `jingles_STEEL00.ogg`
- **Asset Name:** Steel Jingle 00
- **Local File Path:** `reports/development/plan-18-audio-sources-and-credits/audio/jingles_STEEL00.ogg`
- **Creator / Author:** Kenney (Kenney Vleugels)
- **Primary Source URL:** `https://kenney.nl/assets/jingle-pack`
- **Direct Retrieval Repository:** `https://raw.githubusercontent.com/iwenzhou/kenney/master/Audio%20(295%20files)/Jingle%20sounds%20(85%20sounds)/jingles_STEEL/jingles_STEEL00.ogg`
- **Date Retrieved:** 2026-10-25
- **File Format:** Ogg Vorbis stream, 2 channels (stereo), 44,100 Hz
- **Size:** 15,691 bytes
- **Duration:** 0.933 seconds (933 ms)
- **Peak Level:** -2.15 dBFS
- **RMS Level:** -22.40 dBFS
- **License:** Creative Commons CC0 1.0 Universal (Public Domain Dedication)
  - Deed: `https://creativecommons.org/publicdomain/zero/1.0/`
  - Legal Code: `https://creativecommons.org/publicdomain/zero/1.0/legalcode`
- **Redistribution & Modification Terms:** Public domain dedication. Unrestricted reuse.
- **Attribution Policy:** Included in opening/settings Credits:
  > *"Jingle Audio by Kenney (www.kenney.nl) — CC0 1.0 Universal."*
- **Modifications Made:** None. Upstream Vorbis bitstream kept bit-identical.

### Asset 4: `chilllofir-loop.ogg`
- **Asset Name:** Chill lofi inspired [loop edit]
- **Local File Path:** `reports/development/plan-18-audio-sources-and-credits/audio/chilllofir-loop.ogg`
- **Original Composer:** omfgdude (`https://opengameart.org/content/chill-lofi-inspired`)
- **Loop Arrangement / Editor:** qubodup (Iwan Gabovitch, `https://opengameart.org/content/chill-lofi-inspired-loop-edit`)
- **Primary Source URL:** `https://opengameart.org/content/chill-lofi-inspired-loop-edit`
- **Direct Retrieval URL:** `https://opengameart.org/sites/default/files/chilllofir-loop.ogg`
- **Date Retrieved:** 2026-10-25
- **File Format:** Ogg Vorbis stream, 2 channels (stereo), 44,100 Hz
- **Size:** 2,360,833 bytes (2.36 MB)
- **Duration:** 97.216 seconds (1 min 37s; seamless loop)
- **Peak Level:** -0.92 dBFS
- **RMS Level:** -16.48 dBFS
- **License:** Creative Commons CC0 1.0 Universal (Public Domain Dedication)
  - Deed: `https://creativecommons.org/publicdomain/zero/1.0/`
  - Legal Code: `https://creativecommons.org/publicdomain/zero/1.0/legalcode`
- **Redistribution & Modification Terms:** Dedicated to the public domain by both the original composer (omfgdude) and the loop editor (qubodup).
- **Attribution Policy:** OpenGameArt listing specifies:
  > *"(optional) Chill lofi inspired by omfgdude, made loopable by qubodup."*
  Credited fully in Quackpot opening and settings Credits:
  > *"Chill lofi inspired [loop edit] by omfgdude, arranged by qubodup (OpenGameArt.org) — CC0 1.0 Universal."*
- **Modifications Made:** None. Original seamless Ogg loop authored by qubodup preserved as published.

### Asset 5: `fluffing-a-duck.ogg`
- **Asset Name:** Fluffing a Duck
- **Local File Path:** `reports/development/plan-18-audio-sources-and-credits/audio/fluffing-a-duck.ogg`
- **Composer / Producer:** Kevin MacLeod
- **ISRC:** USUAN1100768
- **Primary Source URL:** `https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100768`
- **Direct Retrieval URL (Wikimedia Commons):** `https://upload.wikimedia.org/wikipedia/commons/c/c3/Kevin_MacLeod_-_Fluffing_a_Duck.ogg`
- **Date Retrieved:** 2026-10-25
- **File Format:** Ogg Vorbis stream, 2 channels (stereo), 44,100 Hz
- **Size:** 1,405,902 bytes (1.41 MB)
- **Duration:** 67.370 seconds (1 min 7s)
- **Peak Level:** -0.35 dBFS
- **RMS Level:** -14.22 dBFS
- **License:** Creative Commons Attribution 3.0 Unported (CC BY 3.0) / Creative Commons Attribution 4.0 International (CC BY 4.0)
  - CC BY 3.0 Deed: `https://creativecommons.org/licenses/by/3.0/`
  - CC BY 3.0 Legal Code: `https://creativecommons.org/licenses/by/3.0/legalcode`
  - CC BY 4.0 Deed: `https://creativecommons.org/licenses/by/4.0/`
  - CC BY 4.0 Legal Code: `https://creativecommons.org/licenses/by/4.0/legalcode`
- **Redistribution & Modification Terms:** You are free to share (copy and redistribute in any medium or format) and adapt (remix, transform, and build upon) the material for any purpose, including commercially, provided you give appropriate credit, provide a link to the license, and indicate if changes were made.
- **Mandatory Attribution Notice:** Per Incompetech official deed:
  > *"Fluffing a Duck" Kevin MacLeod (incompetech.com)*  
  > *Licensed under Creative Commons: By Attribution 3.0 / 4.0 License*  
  > *http://creativecommons.org/licenses/by/4.0/*
- **Modifications Made:** None. Bit-identical upstream Vorbis encoding from Wikimedia Commons / Incompetech.

---

## 5. Retained Synthesized Reference Options (Plan 04 Master Rig)

The three synthesized quack candidates developed under Plan 04 (`src/audio/synth.mjs`) remain fully preserved as reference options in the audition proof:

| Preset Identifier | Display Name | Synthesis Treatment | Base Frequency | Key Parameter Highlights | Status / History |
|---|---|---|---|---|---|
| `QUACK_A_CONTROL` | Candidate A: Baseline Control | Sawtooth + vibrato | 340 Hz | 0.22s, pitch bend -140 Hz, vibrato 22 Hz @ 35 Hz depth, gain 0.15 | Retained reference control |
| `QUACK_B_SYNTH_ADSR` | Candidate B: Articulated ADSR | Sawtooth + ADSR | 380 Hz | 0.105s, pitch bend -40 Hz, snappy 5ms attack, gain 0.14 | Retained parameter preset |
| `QUACK_C_FORMANT_NOISE` | Candidate C: Formant & Breath | Source-Filter + LCG Noise | 300 Hz | 0.15s, dual parallel formants (750 Hz Q 3.0 / 1600 Hz Q 3.5), 15ms deterministic bill-click burst, gain 0.15 | **Selected by owner 2026-10-25 (DECISION-009)**; observed softer |

All three synthesized options are 100% authored code, text-stored parameters, and zero-dependency Web Audio API graphs with no external copyright claims or third-party licenses.

---

## 6. License Compatibility and Repository Distribution Check

1. **GitHub Pages Static Deployment:** All 5 candidate files are static audio formats (WAV/OGG) that require no backend server, database, or CDN.
2. **Offline Local Play:** Hard Constraint #2 is fully satisfied. The browser loads the audio files from the same local static origin (`dist/` or local test path) with zero network calls at runtime.
3. **No Share-Alike (SA) or Copyleft Contagion:** None of the candidate files use CC BY-SA or GPL licenses. Including them in CourseVGD or Quackpot does not encumber the project's codebase.
4. **No Non-Commercial (NC) Restrictions:** All candidates permit unrestricted redistribution without ambiguity over educational versus commercial institutional contexts.
5. **No No-Derivatives (ND) Restrictions:** If future sound design requires trimming leading silence, volume gain adjustment, or loop crossfades, CC0 and CC BY explicitly grant adaptation rights.
6. **Provenance Manifest Archival:** This document and the accompanying `audition.html` serve as the permanent, verifiable provenance record.
