# Plan 33 → Plan 32: practical composition brief

Prepared 2026-10-28. This is a brief for *later original composition* in Plan 32 once the owner approves it. It contains **no score, no audio, no rendering, no library choice and no trigger schedule.** Numbers below are proposals for the owner to accept, change or reject; arithmetic is labelled. Evidence labels as in `recommendation.md`.

## 1. What to compose (a few variations, not a soundtrack)

**One original gacha hook, three arrangements** (base / uneasy / dire), plus one **foil hook** of similar style used only to test identity.

- **Hook (the identity):** a short melody of roughly 5–9 notes with a distinctive rhythm and an easily hummable contour, written from scratch (no borrowed melodic fragments). Craft guidance only **[P/H]**: make the *rhythm onset pattern* and *contour* memorable, because contour plus interval sizes and rhythm carry tune identity more than harmony does **[E-abs: Dowling & Fujitani 1971; Kuusi 2009]**.
- **Instrument palette (representation):** one lead voice that stays identical in every state (e.g., a bell/pluck-type synth), a rhythm/percussion layer, a bass voice, and a harmony/pad voice. Palette *names* are placeholders; Plan 32 proposes the actual synthesis approach for owner approval. Keep the lead voice unchanged across states **[E-full: Schellenberg & Habashi 2015; E-full: Eerola 2013]**.
- **Recommended arrangement family:** Approach 2 (reharmonize/revoice the accompaniment) on Approach 1's stem structure; see `transformation-matrix.md`. Approach 3 is a *separate pair*, not part of the first set.

## 2. Representation, length and loop boundaries (proposals)

| Item | Proposal | Basis |
|---|---|---|
| Source format | Editable text note/event data (track, bar, beat, MIDI pitch, duration, velocity) plus a per-state chord/voicing table | Lets the same hook be re-rendered deterministically; avoids repeated lossy edits. Plan 32 still chooses the renderer. |
| Loop length | **8 bars of 4/4** as the main loop; a 16-bar A/A′ version as an alternative if fatigue is a concern | At 100 bpm 8 bars = 32 beats = 19.2 s [T arithmetic]. Decoded-buffer designs are documented for short snippets (about 45 s or less) [T: MDN AudioBuffer, T4 src 13]. |
| Tempo | One tempo for all states, e.g., 96–108 bpm; owner picks | Holding tempo fixed avoids a known identity cost and a confound [E-full: Schellenberg & Habashi 2015]. |
| Key | One key for all states | Same reason. |
| Loop seam | Every stem exactly the same length, boundary on a bar line; no tail ring-out crossing the seam, or render the tail into the loop start | Seam audibility is a practitioner concern [P: Martins]; sample-indexed buffer loops are the documented way to loop precisely, while codec padding is not addressed by the docs [T4 findings F5]. |
| State changes | Allowed only on a bar line (or loop boundary), never mid-bar | Bar-aligned changes are standard practice [P: Phillips] |

**Stem layout (proposal) and arithmetic [T]:** stereo 48 kHz float32 = 384,000 bytes per second, so one 19.2 s stereo stem ≈ 7.4 MB decoded.

- *Lean:* lead (shared) + rhythm (shared) + one accompaniment stem per state × 3 = **5 stems ≈ 37 MB** decoded.
- *Fuller:* lead + rhythm + bass ×3 + harmony ×3 = **8 stems ≈ 59 MB** decoded. Mono stems for lead/bass halve their cost.
- Add the apartment music track(s) (Plan 30) on top. These figures are arithmetic only; **no measurement on the target school machines has been made.**

## 3. The three arrangements (summary; detail in `transformation-matrix.md`)

- **Base:** consonant, bright voicings, normal bass register, clear cadence at the phrase end.
- **Uneasy:** modal-mixture or minor-leaning chords; bass lowered; one unexpected chord at one phrase point; softer, wider voicings; last bar left slightly unresolved.
- **Dire:** low bass with a pedal tone; cluster/tritone or mildly detuned voicings; no cadence; sparse upper harmony so the melody sounds exposed.

Constant in all three: hook pitches and rhythm, lead voice, key, tempo, loop length, loudness.

## 4. Paired-listening comparisons (to be run later by the owner; not run here)

Listener: the **owner only** in the first pass. No student data, no collection, no accounts. A wider panel would need a separate owner decision. Fixed playback level and headphones/speakers; order counterbalanced; loudness matched (integrated LUFS/RMS) and peak-checked.

| Pair | Compare | Questions (owner ratings) | Evidence purpose |
|---|---|---|---|
| P1 Identity | Base vs uneasy vs dire, each against the base | "Same tune?" 1–5; what, if anything, changed? | Does Approach 2 keep the hook recognizable? (Primary risk: no replacement-harmony study exists.) |
| P2 Identity foil | Base vs the foil hook | Same scale | Calibrates what "different tune" sounds like |
| P3 Tension | Base → uneasy → dire in order, and shuffled | Tension 1–7; "uneasy" vs "dire" ordering correct? | Do the steps feel ordered? Is "dire" distinguishable from "uneasy"? |
| P4 One lever | Change only bass register; only the unexpected chord; only the withheld cadence; only roughness | Tension 1–7 and "same tune?" | Which lever carries the unease cheaply? (Drone, withheld cadence and detune are untested in the literature.) |
| P5 Loudness | Matched vs a +3 dB louder dire | Tension 1–7 | How much of "dire" is loudness (a known confound [E-full: Eerola 2013])? |
| P6 Approach 3 | Recommended dire vs Approach 3 dire (tempo/register/timbre) | "Same tune?" and tension | Does the extra expressive range cost identity? |
| P7 Fatigue | Each state's loop repeated ~5 times (about 1.5 minutes at 19.2 s) | Note when irritation or boredom starts | Repetition fatigue is a composer-reported risk [P]; the threshold is unmeasured |
| P8 Step ordering | Hear base then uneasy, uneasy then dire, as would occur in play | "Did the change feel like the same story?" | Tests abrupt steps (no gradual-morph evidence exists) |
| P9 No-change control | Base looped with a bar-aligned *re-trigger* of the same material at the moment a step would occur | Tension 1–7 | Separates "any change adds tension" (suggested by an adaptive-music study [E-full: Plut & Pasquier 2019, N=30]) from the effect of the new arrangement |

## 5. Owner questions for the composition round

1. **Recognition:** is "same tune" the *melody* (so timbre could vary) or the *sound* (so timbre is fixed)?
2. **Tension:** is "uneasy" meant as *unresolved/ambiguous* and "dire" as *threatening/heavy*? (Roughness evidence supports energy/anger/dominance, which may sound more aggressive than uneasy.)
3. **Culture and audience:** who will hear this — which age and background? Mode effects were culture-specific in one study [E-full: Athanasopoulos 2021].
4. **Fatigue:** how long will players sit in the gacha screen per visit? 8-bar loops repeat quickly.
5. **Base mood:** should the base be *enticing/peaceful* rather than cheerful? A cheerful base against a menacing underlay can read as ironic.
6. **Steps:** abrupt state steps or crossfaded morphs between accompaniments? (See `transition-contract.md`.)
7. **Rights/provenance:** original composition and generated-music provenance need an explicit later decision (design open question). Credits stay factual and local.

## 6. Not in this brief

No melody, chords, score, rendering, library, soundtrack adoption, story trigger, or schedule. Plan 18's repertoire and Plan 30's apartment-music search are not reopened here.
