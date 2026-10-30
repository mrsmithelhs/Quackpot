# Pilot brief 2 — finale rest selection

**Status:** Proposed; execute only after root clears the exact batch.

## Start

`plan35.finale-race-entry.v1`, captured at the mounted `d3_midday_race` form before the second-race submit. Its prehistory includes the real first-race result and all actual preceding state/log evidence.

## One action and look-fors

Record the visible roster, derived rest/effective-rating information, available Down/trial state and offered choices. Select one legal duck or stance in the rendered race form but do not submit the form.

Record the actual selected DOM control/card and visible selection styling. At this point selection is presentation-only; engine state and RNG should remain unchanged. The mounted view may append a genuine `race_choice_offered` exposure record after selection; preserve and report it. `GameEngine.runRace()` appends the `action/race_choice` commit only when the form is submitted, which is outside this pilot. Do not invent a new engine event or write a synthetic selection into the save.

## Evidence to record

Record fixture/source/loader/brief hashes, visible candidate and rest/effective-rating text, selected control, pointer hit-test result, before/after envelope hashes, confirmation that engine state/RNG remain unchanged, exact event-log delta (including any actual choice-offered exposure), viewport, one action, elapsed setup/continuation time, and cleanup. If the natural roster does not provide a rested/fatigued contrast, mark that contrast unverified; do not edit history or fabricate another race.

## Stop conditions

Stop on a source/boundary mismatch, missing or disabled candidate, selection that mutates engine/save state unexpectedly, any need to submit the second race, or cleanup uncertainty.
