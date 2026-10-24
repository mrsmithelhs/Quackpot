# Plan 01 technical review after Repair 03

**Date:** 2026-10-24

**Reviewed commits:** `f9c95e2`, `5326348`, together with earlier Plan 01 artifacts. Subsequent owner representation clarification is recorded in `f676bf0` and the boundary note.

**Disposition:** Technical Repair 03 accepted. The original bounded S1–S4 headless investigation is ready for owner evidence review; no further implementation repair is requested in this scope. Packet remains `delivered` until that owner gate. All tuning remains provisional.

## Independent checks

- Explicit simulation test paths pass 47 tests; packet-tooling tests pass 143 internal checks. Source and direct projection confirm `paid:false` on a waived lunch, `paid:true` for actual cash payment and false on unpaid outcomes. The prior latest-debt and ordered terminal/Receipt checks remain covered.
- Importing `run-experiments.mjs` no longer executes the full runner. The orchestrator imported `runMatchedWindows` and replayed all 100 seeds in `s2em-whale_ten-1-1` with the saved parameters and windows. Result: 99 reach day 12, 86 have full observed exposure, 14 are excluded, and ratio `0.9915924116125321` matches saved `0.9915924116125325` within floating-point accumulation precision. The day-12 pre-race completion fixture has only four of six late races and is excluded.
- Both income and roster summaries use the identical full-exposure cohort. Saved Markdown and raw `fullN`/`excludedN` fields agree. A read-only reviewer identified ambiguous legacy survivor aliases in JSON; those aliases contain the full-exposure values and do not change the correct ratio. `results/README.md` now documents their exact interpretation. Use the canonical full-exposure fields; no production schema depends on the legacy names.
- The orchestrator inspected refreshed result cells and repaired source; the implementer reports a final full runner execution of approximately 407 seconds. This review used targeted replay rather than rerunning every unchanged sweep.

## Evidence the owner can accept

| Question | Supported conditional result |
|---|---|
| S1 — pity reachability | The default 35/50 linear ramp makes hard draw 50 extremely rare (`4.2148e-7` per uninterrupted window); gentler/linear-to-cap ramps materially change reachability. Threshold, ramp, opening advance and carry/reset are not selected. |
| S2 — race funding versus starvation | Race-funded continuation is possible in the tested higher-payout/no-creep configuration; default assumptions yield much less continuation. Unbuffered spenders demonstrate zero-cash/expense failure under price pressure. Strategy and horizon assumptions prevent human-behavior claims. Paired windows expose exclusions and cannot generalize tiny late survivor cohorts to all buyers. |
| S3 — roster and duplicates | Completion and duplicate outcomes depend heavily on roster, strategy and horizon. At 15 days 30/400 top-up and 133/400 whale runs complete 24 identities; the near-99% figure is the 60-day whale result. Down's tested gem-equivalent recovery is small. |
| S4 — Receipt lifecycle | The headless log/projection distinguishes displayed versus committed outcomes, conditional pre-draw odds, paid/waived/unpaid expenses, latest debt, and matching terminal/Receipt boundaries. Early exit and zero-cash cases have executable evidence. Browser presentation and local save/resume still require the slice. |
| Floor pacing | Sensitivity estimates bracket roughly 15 minutes under candidate day/race/pacing assumptions. They are not measured classroom duration. |

## Completion and next integration gate

Recommend owner acceptance of Plan 01 as conditional investigation evidence, without adopting a balance table. Its failed meaningful-choice hypothesis, actual pacing, near-miss follow-up and other unselected rules remain explicit inputs to later owner-gated work.

The owner's later clarification separates the physical metagame rubber duck from digital gacha characters. The model still has an `own-duck` racer tied to `ownDuckSold`; this is an inherited model assumption, not a selected game rule or a Repair 03 regression. Before Plan 03 uses the model as its contract, remove that physical-prop coupling or obtain approval of a separately defined digital identity. The opening free ten-pull already provides digital ducks, so excluding the physical prop is the simplest proposal. Check only affected policy/economy evidence and document any reruns required. Pawn cash/story effects remain physical/metagame effects.

Owner acceptance may close this packet with those conditional and downstream limits in its resolution. Plan 03 still requires its own mechanism/trade-off/tuning approval before coding; passing dependencies alone does not authorize a playable release.
