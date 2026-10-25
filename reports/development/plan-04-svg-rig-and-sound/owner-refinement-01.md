# Plan 04 owner refinement — visible paper construction and quack audition

**Date:** 2026-10-24. **Owner feedback:** the gallery's hats, accessories and alternate colors are good; the duck needs substantially more of E2's layered-paper character. Paper Shadows are preferred to Drop Shadow, but a subtle combination may help. The sound currently reads as a retro electronic effect rather than a recognizable quack. This brief records the requested direction; no production integration or library migration is selected. Keep the current source-backed generation/parity path.

## Art direction to implement

Use `reports/development/plan-08-duck-visual-direction-prototypes/concepts/e2.jpg` as the construction reference. Make the duck look assembled from overlapping paper cutouts, rather than a flat duck with painted shading. Preserve the favored proportions, palettes, hats, accessories, head/body attachment hierarchy and separate wing sublayers. Do not redesign the character or expand the cosmetic catalog.

- Give the body, head and wing broad backing/foreground shapes with exposed offset contours, especially at the head rim, body edge and the three overlapping wing pieces. A viewer should be able to trace which piece lies over which. Avoid subdividing the duck into many tiny decorative scraps.
- Keep a visible strip of each wing layer with slightly different paper tones. The current middle/top fills are similar; changing fill color alone will not establish physical overlap if their contours nearly coincide.
- Use narrow contact/occlusion shadows where a raised paper piece sits over another, with consistent upper-left lighting. Add a restrained light-facing edge if useful. Inspect stacking: a shadow placed entirely beneath its own opaque fill can disappear instead of showing the join. Separate dark side-edge strips from larger painted body shadows.
- Keep flat paper separation as the baseline. Compare it with a restrained hybrid that adds local soft cast shadows at the head/wing/beak joins; a shadow around the entire duck alone is not sufficient. Avoid heavy outlines, broad blurry halos or gradients that turn the paper into a glossy rubber/plastic rendering.
- Aim to evoke layered cardstock without raster textures. Slight contour character is optional; noise/grain is lower priority than silhouette, overlap and readable seams. Head-attached shadows/parts must move with their parent during diagnostics, and accessories must remain attached.

Return a matched small comparison of the existing baseline, stronger geometric paper separation and stronger separation plus restrained soft shadows. Use the same yellow unadorned base, scale and background so the difference can be judged; keep existing cosmetic examples available. Inspect 64/128/256px and use 32px as a silhouette/readability check rather than requiring every seam to survive. Include a short note naming the pieces and shadows that create the paper effect. Regenerate from the actual source; no independent gallery edits or production animation.

## Sound: first propose a small comparison, then audition

The current `src/audio/synth.mjs` is a custom Web Audio oscillator/envelope implementation. `QUACK_SHORT` uses a 340 Hz sawtooth sliding down 140 Hz over 0.22 seconds with 22 Hz modulation; it contains no vocal/resonant filter bank or noise component. Do not describe it as an installed jsfxr/ZzFX library or assume those libraries' parameter arrays can be pasted into it.

Retain this sample as a control. Propose at most two additional quack treatments of the same effect: (1) a parameter-only revision with less obvious continuous pitch slide/vibrato and a more articulated short amplitude envelope; (2) if needed, a small source-filter synthesis extension using a buzzy source, a little synthesized breath/noise and one or two resonant/filter bands whose emphasis changes through the sound. Treat this as an audition hypothesis, not a measured reconstruction of duck anatomy or a proven recognizable call. No exact natural-duck frequencies are established by this research.

If the current controls cannot produce the needed tone, state what capability is missing before adding it. Avoid building a general audio workstation. A library trial is an alternative requiring an explicit proposed local dependency/parameter contract and license handling, not an automatic rewrite. Keep all sound source as text parameters/code and local synthesis; no recorded animal sample, downloaded WAV or runtime CDN. Any noise/randomized timbre needs a controlled audition source independent of game outcome RNG. Preserve gesture start/resume, silent fallback, source-backed gallery and appropriate parameter validation.

Compare candidates at similar perceived volume, with stable A/B/C IDs, one-click replay and parameter notes. Aim first for a short readable cartoon “quack”; pitch variation alone can remain electronic. Owner chooses by listening; tests establish scheduling/fallback/parity, not recognizability. No need to add other sound effects, music or D2 physical-prop animation.

## Primary research references and limits

- [ZzFX repository/designer](https://github.com/KilledByAPixel/ZzFX) and [current Micro source](https://raw.githubusercontent.com/KilledByAPixel/ZzFX/master/ZzFXMicro.js): parameters include noise, slide, modulation, filtering and bit crushing. Avoid assuming every ZzFX variant exposes identical controls. The inspected Micro source also creates an AudioContext at module scope and uses Math.random; a local integration must preserve this project's gesture and independent-RNG behavior rather than blindly copying it.
- [jsfxr editor](https://sfxr.me/) and [maintained library](https://github.com/chr15m/jsfxr): useful for quick parameter exploration, including envelopes/noise/filtering and serialized sound settings. Its stated emphasis is retro/8-bit effects; changing to it alone does not establish a more natural quack.
- [MDN BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode): documents local low-pass, high-pass, band-pass and resonant controls available without an extra library.
- [Ableton audio-effects manual](https://www.ableton.com/en/manual/live-audio-effect-reference/), formant discussion: distinguishes timbral resonances from fundamental pitch. This supports the general sound-shaping approach, not a duck-specific recipe or an Ableton runtime dependency.

No new code or sound was produced in this research turn. Plan 04's owner base/sound gate remains open. Before executing refinement, follow the packet check and actual assignment/status workflow; never self-close or push. A later implementer report must separate structural tests from owner audition and rendered acceptance.
