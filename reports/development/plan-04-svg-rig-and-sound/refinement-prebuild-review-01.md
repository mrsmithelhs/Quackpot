# Plan 04 refinement proposal — approved bounded comparison

**Date:** 2026-10-25. **Input:** owner-supplied implementer return, preserved in `refinement-proposal-01.md`. **Disposition:** proceed with the paper A/B/C comparison and the small sound A/B/C audition under the conditions below. This approves prototype execution within the existing refinement, not the final art, quack choice, a general synth rewrite or production integration. No additional general preflight round is needed if these conditions are met.

## Status clarification

The attachment records an earlier `delivered` packet block. Current repository truth is `in-progress`, recorded in `4c046f9` after the owner dispatched the full refinement brief. Root reran `node scripts/dev/plan-status.js check plan-04` on 2026-10-25: **RUNNABLE**. Do not keep reporting the earlier block as current; run the check again before work, and stop only if it actually fails.

## Art: proceed with the proposed matched comparison

Keep A as the existing control, B as stronger geometric paper separation, and C as B plus restrained localized soft shadows. Preserve accepted palettes/cosmetics and parent-relative attachments. The body/head backing contours, distinct wing tones and seam shadows answer the owner's request. Specify geometric offsets in the 100×100 viewBox's units and inspect the resulting 64/128/256px samples; “4–6px strips” is ambiguous across scales and is not a fixed acceptance requirement. At 32px prioritize silhouette and avoid clutter.

Keep the comparison source-backed. A may be a clearly labeled historical vector snapshot reproducibly derived from the prior composer/revision; it must not become a second independently hand-edited rig. B/C and dynamic diagnostics must use the authoritative current composer. Namespace any extra filter/clip/label IDs per instance, update the derivation/parity checks as appropriate and regenerate the page. Do not expand into full animation, new accessories or environment art.

## Sound: the limited extension is approved with these corrections

1. **A remains the unchanged control.** Preserve the original signal path and QUACK_SHORT parameters; introducing a shared post-filter must not accidentally alter A. Give all candidates stable IDs and one-click replay.
2. **B really is parameter-only.** Existing `synth.mjs` has one linear pitch ramp across the whole sound and no sustain-hold duration. It cannot express a 25ms initial drop followed by a stable pitch plateau through its current parameters. Use the proposed shorter envelope, gentler whole-duration bend and removed/lessened modulation within existing controls, and describe it accurately. Do not add a new envelope engine just to meet B's prose. If separately timed pitch points prove necessary later, flag that as a distinct small capability request.
3. **C is a small audition graph, not an established duck model.** Use the proposed numbers only as experimental starting settings. Remove claims that these bands are measured duck anatomy or are required for recognizability. The capability addition is confined to one controlled noise burst and at most two resonant bands for this quack. State the routing in the implementation report: for two added resonance bands, use independently gain-controlled parallel branches into a shared output envelope, or justify another simple topology; do not blindly cascade disjoint narrow band-pass filters. State where the noise is mixed and how the sum's level is controlled. Keep finite/bounded parameters, scheduled cleanup, gesture resume and silent failure behavior.
4. **Gain is not perceived loudness.** .15/.14/.15 are initial settings, not evidence of calibrated volume or clipping immunity. Check the summed output and compare by listening at similar perceived volume; describe the method and limits. Tests can establish graph/scheduling/fallback, not whether C sounds like a duck.
5. **Preserve determinism and scope.** Use controlled audition noise independent of gameplay RNG. No dependency/library migration, recorded animal audio, downloaded WAV, runtime network calls or other sound-effect catalog. Keep the source-backed preview and its provenance current.

## Ownership, verification and return

Continue under the existing Plan 04 refinement scope: necessary changes to `src/core/duck-rig.mjs`, derived master SVG, `src/audio/synth.mjs`, their tests, `scripts/dev/build-plan-04-preview.mjs`/parity checks and Plan 04 report/gallery. Package changes only if needed for the scoped tests/helper; no production UI/placeholder/simulation edits. Plan 12's owner-interview work is active in a separate report folder; leave it untouched, including untracked material.

Update the durable proposal to reflect these controlling corrections, then implement. Test source/gallery parity, multiple-instance references, attachment diagnostics, audio scheduling/fallback and controlled noise; inspect the rendered comparison and report actual audio audition limits. Run the appropriate existing checks without using counts as evidence of artistic quality. Commit scoped work, then the final progress report with the actual advisor branch; never push or set status. Return the samples for owner selection.

## Review provenance

A cold read-only `gpt-6-luna` at high effort identified the pitch-envelope, filter-capability and loudness clarifications. Root verified them against the actual source: the pitch ramp ends at `now + attack + decay + release`, the existing graph has no noise/filter nodes, and it does not provide a separate hold duration. The graph proposal above is a bounded engineering recommendation, not a new acoustic research result. No refinement implementation, recognizability or rendered improvement is claimed yet.
