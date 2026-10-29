# Plan 33 — Recommendation: keeping a gacha tune recognizable while it turns uneasy, then dire

Prepared 2026-10-28 by the Plan 33 Sonnet integrator for QP Orchestration and owner review. This is research and a proposal. It selects no soundtrack, library, trigger schedule or source, composes nothing, and does not diagnose any player. Music here is a designed expression of the *character's* story experience.

**Evidence labels used throughout:** **[E-full]** measured result I could read from full text (via a browser-pass worker); **[E-abs]** measured result known only from an abstract or snippet; **[P]** composer/developer account of intent; **[T]** theory or description; **[H]** hypothesis — my inference, untested. Sources: `sources/index.md`. Worker reports are claims; I have not independently re-opened the sources.

## The short version

**Keep the tune fixed and change what is underneath it.** Hold the melody (exact notes and rhythm), the loop length, the tempo, the key, the lead voice's timbre and the loudness identical across the three states. Make the base → uneasy → dire change mainly in the *accompaniment*: harmony and voicing, bass register, a held drone, a small amount of roughness, and how the phrase ends. Save any change to the lead voice or tempo for a separate, optional test.

## Concrete musical decisions to evaluate (in priority order)

1. **Never change the hook's pitches or rhythm between states.** Contour plus relative interval sizes was the strongest identity carrier in the one classic study that ranked them [E-abs: Dowling & Fujitani 1971]; melody beats rhythm for tune recognition [E-abs: Kuusi 2009, familiar tunes].
2. **Do not swap or noticeably re-voice the lead instrument.** In full-text experiments, changing timbre lowered recognition of unfamiliar melodies at 10 minutes, 1 day and 1 week [E-full: Schellenberg & Habashi 2015, N=96 for timbre; effect small, AUC cost about .05]. Timbre was also the *weakest* of the cues in the one study that ranked emotional cue strength [E-full: Eerola et al. 2013]. So it costs identity and buys little tension: a poor trade.
3. **Hold tempo fixed in the first pass.** Key and tempo changes cost recognition at 10 minutes and 1 day but not after a week, and their penalties add rather than interact [E-full: Schellenberg & Habashi 2015; E-abs: Schellenberg et al. 2014]. For "scary" ratings, tempo contributed almost nothing in the cue study [E-full: Eerola et al. 2013]. Changing it also muddies a loudness- and tempo-matched comparison.
4. **Make the accompaniment the main lever.** Harmony is the cheapest thing to change for identity: harmonic basis alone was the weakest identity carrier [E-abs: Dowling & Fujitani 1971] and adding harmony did not help tune recognition [E-abs: Kuusi 2009]. Neither study tests *replacing* the harmony under a fixed melody, so this is a hypothesis to test **[H]**. The same melody can sound different under different harmonizations, with listener culture mattering a lot [E-full: Athanasopoulos et al. 2021].
5. **Pull the bass down and add a held drone or pedal in "uneasy"; add roughness in "dire".** Low register was a clear contributor to "scary" [E-full: Eerola et al. 2013, though they lowered the *melody's* register, not the accompaniment]. Rough amplitude modulation distinguished scream-like horror-score excerpts from other horror-score excerpts and tracked lower valence [E-full: Trevor et al. 2020, 20 raters, 800 ms clips, roughness only]. Rough harmonizations read as energetic, dominant and angry across three listener groups, though correlations were small and one group's valence sign reversed [E-full: Athanasopoulos et al. 2021]. Drone, sub-bass and detuning specifically have **no direct empirical test that I found**; treat them as craft-plausible **[T/H]**.
6. **Use one unexpected chord, or a withheld ending, as the first "uneasy" step.** An unexpected chord in a fixed melodic context raised felt tension in a small study [E-abs: Steinbeis et al. 2006, N=24]. Withholding the cadence is theory-motivated expectancy [T] with no empirical test found **[H]**.
7. **Mode (major/minor) is one lever among several, not a switch.** Mode was the strongest pooled cue in the synthesized-cue study [E-full: Eerola 2013], but the major-happy/minor-sad effect appeared in UK listeners only among three groups tested [E-full: Athanasopoulos 2021]. For a US classroom, using minor/modal mixture is reasonable **[H]**, but do not rely on it alone.
8. **Do not raise loudness to create dread in the comparison.** Louder dynamics added to "scary" in the cue study [E-full: Eerola 2013] and loudness confounds every comparison. Match loudness (see matrix) so any difference is attributable to the composition. The game may still choose a modest level difference later as a separate, owner-approved variable.

## What is actually known, in one paragraph

Melody carries tune identity; timbre carries real extra identity cost; key and tempo matter less over time; harmony seems a weak identity carrier though not directly tested as a replacement. For tension, several cues add up roughly linearly and no single cue dominates; low register, dissonance/roughness, unexpected harmony and minor mode each push toward threat, with culture and training moderating. Composers say they keep one hook and vary arrangement, instrumentation, layers and sometimes tempo, and that repetition fatigue is a major risk. **No source I could read tests the specific thing the owner wants** — a newly composed hook, repeated across several minutes, whose accompaniment steps from calm to dire. The listening test in `composition-brief.md` is how to find out.

## Recommended approach and alternatives

- **Recommended starting set:** *Approach 2 (reharmonize/revoice) with Approach 1's stem structure* — shared lead + shared rhythm skeleton stems, and state-specific bass/harmony stems. This is also the cheapest to build and loop (see `transition-contract.md` and the memory arithmetic in `composition-brief.md`).
- **Alternatives:** Approach 1 (pure additive "shadow layers" over an untouched base) is the safest for identity by construction but may cap out below "dire"; Approach 3 (re-voice/re-register/destabilize pulse) is the most expressive and the riskiest for identity and should only be tested as a pair against the recommended set. Details: `transformation-matrix.md`.

## Confidence

| Claim | Confidence | Why |
|---|---|---|
| Keep melody and rhythm fixed to preserve identity | High (direction), low (magnitude for a new hook) | Consistent across studies but mostly familiar-tune or old/new memory designs |
| Lead timbre change costs recognition | Medium | Full-text, N=96, but small AUC cost, unfamiliar Western melodies, told to ignore change |
| Tempo/key changes cost little long-term | Medium-low | A null at one week is not equivalence; authors say >400 participants would be needed |
| Accompaniment is the safest lever | Low-medium | Indirect (harmony a weak identity carrier); no replacement study found |
| Low register / roughness / dissonance raise threat | Medium | Several studies, but short excerpts, trained or Western samples, and cultural limits |
| Drone, sub-bass, detuning, withheld cadence work | Low | No direct empirical test found; craft and theory only |
| Composers' stated practice | Medium as practice, none as audience effect | [P] only; the one measured study (Plut & Pasquier 2019, N=30) tests adaptivity, not identity |

## Uncertainties and gaps

- **Newly composed hooks:** nearly all identity studies use already-familiar tunes or one-shot old/new memory; extrapolation to a game hook is inference.
- **Gradual change:** no study found tests slowly morphing arrangements over repeated exposure.
- **Evidence access:** B1 read four sources in full; Kuusi, Dowling & Fujitani, Steinbeis, and the 2014 Schellenberg study remain abstract-only; most T1/T2 snippet-level sources were not upgraded. The one empirical adaptive-game-music study I could read in full, Plut & Pasquier 2019, found that music that changed with game tension raised self-reported tension relative to *static* music (tension F(3,87)=3.66, p=.015, η²p=.11; N=30; about 2 minutes of play in a custom game; self-report; no multiple-comparison correction described; no test against no-music reported as significant). That is [E-full] but small, and says nothing about tune recognition or authored story states. Klimmt et al. 2019 remains an unverified lead (abstract only; bot-blocked).
- **Gacha/mobile composers:** none found. Practice evidence is console/AAA.
- **Culture/training:** the classroom population is unknown; UK-only effects (mode) may or may not transfer.
- **Possible side effect to test:** in Plut & Pasquier, *adapting at all* (even with an inverted mapping) raised reported tension relative to static music, so a listener may hear any state step as added tension, regardless of the chords. Include a "same music, no state change" control in the listening pairs.
- **Corrections to earlier findings** (from full-text reads): Eerola's cue ranking is pooled — for "scary", the underlying musical excerpt dominates, then register and dynamics, with tempo and articulation negligible; Trevor et al. tested roughness only (the "loud, dense, unpredictable rhythm" description came from a news article); Athanasopoulos et al. text says eight harmonization styles while its model says nine, unreconciled.

## Owner decisions needed

1. Is "same tune" a **melody** (timbre may change) or a **specific sound** (timbre fixed)? This decides whether lead-voice changes are even on the table.
2. Is accompaniment-only change acceptable as the first test, or should the first pairing include Approach 3?
3. Run the paired-listening comparison (see `composition-brief.md`) before any production commitment?
4. Should abrupt state steps or gradual morphs be tested first? (No evidence either way.)
5. Should the optional external deep-research prompts (`deep-research-prompts.md`) be run to fill the accompaniment-vs-identity and drone/sub-bass gaps?

## Glossary

- **Hook / motif:** the short, memorable melodic idea (a few bars) that makes the tune recognizable.
- **Contour:** the up/down shape of a melody, ignoring exact interval sizes.
- **Interval:** the pitch distance between two successive notes.
- **Rhythm skeleton:** the pattern of note onsets/durations of the hook, separate from its pitches.
- **Harmonization / voicing:** the chords under a melody and which notes (and which octave) they use.
- **Reharmonization:** replacing the chords under an unchanged melody.
- **Pedal / drone:** a long sustained (often low) note held while other things change.
- **Modal mixture:** borrowing chords from the parallel minor or other mode into a major passage.
- **Cadence / withheld cadence:** the harmonic "full stop" at a phrase end; withholding it leaves the phrase feeling unresolved.
- **Roughness:** the harsh, beating quality from closely spaced partials or fast amplitude modulation.
- **Stem:** a separately rendered layer (e.g., lead, bass, pad) that can be mixed independently.
- **Loop seam:** the point where a looped file ends and restarts.
- **Loudness matching (LUFS/RMS):** adjusting versions to the same perceived level so loudness is not mistaken for composition.
- **Single audio owner:** one controller object that alone creates, fades and stops the game's music.
- **Equal-power crossfade:** a fade whose summed power stays constant (avoids a mid-fade dip), versus a linear fade.
