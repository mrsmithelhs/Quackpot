# Clearance-aware steering — paired 16-seed screen

2026-11-03. Sixteen new races of the clearance-target candidate finished; three controls are the exact saved Stage 1 races on the same fixed seeds. All are injury-free, ability-free and use player base speed 10 versus rival 8. This screen tests a report-local hypothesis, not selected production rules. Initial paths and RNG keys are paired, but movement and later contacts can diverge once target choices differ. Held-out confirmation seeds were not used.

| Measure, over 16 races each | Accepted one-contact reference | Multiple contacts, no advice | Earlier predictive advice | Clearance-target candidate |
| --- | ---: | ---: | ---: | ---: |
| Contact episodes | 16 | 115 | 121 | 117 |
| Total crowded duck-seconds, proximity proxy | 1,479.95 | 1,164.03 | 1,154.39 | 1,145.05 |
| Longest crowded episode for one duck | 22.25 s | 20.95 s | 18.65 s | 20.45 s |
| Median first crossing | 21.5565 s | 21.5173 s | 21.5173 s | 21.5173 s |
| First crossing strictly after 23 s | 0 | 0 | 0 | 0 |
| Median last crossing | 22.6088 s | 22.8626 s | 22.8745 s | 22.8611 s |
| Player wins | 16 | 14 | 14 | 14 |
| Recorded frame-order changes | 247 | 274 | 282 | 258 |

The crowd measure counts modeled proximity, not a validated visual pileup, and long duration can include normal pack racing. Frame-order changes are a diagnostic, not established visible overtakes; browser playback was not measured. The fixed 10-versus-8 stat gap and 16 races are insufficient to characterize stat progression or validate a <=5% late tail. Sixteen races do not estimate rare outcomes reliably.

Compared seed-by-seed with earlier predictive advice, the clearance candidate had fewer/equal/more contacts in 5/6/5 races; compared with no advice, 2/9/5. Its longest crowded episode was shorter/equal/longer in 8/5/3 versus earlier predictive, and 7/7/2 versus no advice. These mixed outcomes **do not establish that clearance-target advice improves traffic**, even though total proximity time is slightly lower in this screen. Do not select a winner or tune injury odds from this proxy alone.

In the new arm, 115 threat opportunities yielded 54 risk-based ignores, 28 followed decisions with no predicted 0.1-unit improvement, and 33 active target selections; 17 advice episodes were canceled. Of 33 measured following windows, three were partial and 15 involved an actual contact. Median absolute approximate one-second lateral change was 1.2 units versus 0.806 units recorded; restricting to 14 full windows with neither contact nor cancellation yielded medians 1.2 versus 0.805. Realized motion is not necessarily caused solely by advice, and these nested windows are not independent races. The approximation adds a bounded lateral term to linear current velocity and assumes initial alignment; it may overstate physical reach. These numbers argue for checking predictive calibration, not for an automatic strength adjustment.

Selection occurs before step k; the 20-step window ends at post-step frame k+19, and elapsed time counts from k−1. Measurement uses recorded selection-time lateral position and marks partial windows when actual data/finish truncates them. The older two-case motion diagnostic's displacement began at a post-step sample and retains that limitation; its saved evidence was not retroactively changed.

## Evidence and boundaries

New 16-call results `clearance-stage-output/results.json` SHA-256 `bdc2da8b79290e1548026b6d7712341f953bfd58a59edd22ffac02f80f8fc58c`; paired analysis SHA-256 `2cb40127c5b7e962b7d6a503f937dfdf69986aa69a267040efadcc3ce89dbad5`; source manifest `65c458b92329c4e76d0c3aa7efa5b22255669b182222fc826e3b26b28dda6fb6`. Completion receipts bind results and frozen control hashes. Runner checked pins before/after each call, analysis validated every arm's version, completion, seed, choice and risk mapping. New job 3.594 s / 143,822,848 sampled bytes, 13.34 GiB free at preflight; analysis 0.523 s / 1,339,392 bytes, 13.20 GiB free; both exit 0, no stop/stderr/cleanup notes. No control reruns, browser, provider or production code changes.

Correctness before screen: updated pure suite 10/10 passed after final window correction (0.525 s / 1,757,184 bytes, 13.34 GiB free); an earlier six-call correctness batch established prior-versus-copy reference/multi equality on one seed and two active-advice/contact guard rollback cases, with only the later pure window-bookkeeping change after that batch. See `clearance-correctness-output/` and `clearance-stage-proposal.md` for source and limitations. No validity claim extends beyond this bounded evidence.

Root disposition is required before further experiments: assess whether a defensible provisional traffic baseline exists, whether the approximation/metrics need improvement, and how to visually inspect representative movement and passing. The owner-selected per-distinct-contact injury eligibility is unchanged, but no injury probability or post-contact model was selected or simulated in this screen. Injury Stage 2 and held-out confirmation remain gated.
