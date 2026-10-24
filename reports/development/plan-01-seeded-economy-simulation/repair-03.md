# Plan 01 Repair 03 — full exposure and unambiguous paid flag

**Review date:** 2026-10-24

**Reviewed commits:** `981d5db`, `44ce6b7`.

**Disposition:** Latest-debt derivation and the ordered terminal/Receipt boundary address the prior counterexamples. Tests pass (45 simulation tests and 143 packet-tooling checks). Two bounded correctness repairs remain before technical acceptance and owner evidence review; no new tuning investigation is requested.

## Implementer handoff

Read `AGENTS.md`, Plan 01, Repair 02 and this note. Run `node scripts/dev/plan-status.js check plan-01`; stop if blocked. Plan 01 is returned to `in-progress`. Own only the necessary `sim/` code/tests and Plan 01 results/progress artifacts. Packet/index status and this note remain orchestrator-owned. Plan 02 is concurrently repairing its smoke tooling; preserve all its files and stage explicit owned paths only.

1. **Require full observed race exposure in both S2 windows.** `runMatchedWindows` sets `survived = run.day >= lateRange[1]`. But a collection ending can occur before that last day's races, so the code includes an incomplete window while dividing its payout by the full scheduled day count. Independent reproduction of `s2em-whale_ten-1-1-0` through `-99` with `{maxDays:15,payoutScale:1,powerCreep:1}` found 99 counted survivors, 13 with fewer than six late-window races. The saved ratio is 0.95678549; restricting to full exposures gives 0.99159241. Require the expected observed race count for each full window (using configured races/day), disclose full-exposure n and excluded n, and compute paired income/roster summaries on the same full-exposure runs. Add a regression fixture where collection completion occurs on the last window day before its races; it must be excluded from a full-window comparison. Retain censoring warnings and do not alter ending rules to create more survivors.
2. **Make structured `paid` agree with actual cash payment.** A zero-cash `payBill('food',12)` produces `status:'waived', paidAmount:0, waivedAmount:12, paid:true`. Human wording is repaired, but consumers can still interpret the boolean as a cash purchase. Make the boolean mean actual cash paid, or remove it in favor of the explicit status/amounts; do not keep contradictory semantics. Assert `paid:false` (if retained) on a waived lunch, true on a cash payment, and false on an unpaid bill. Preserve truthful projected wording and log-only derivation.

## Report and artifacts

The orchestrator corrected report-only inaccuracies directly: `pityCarry` parameter name, actual escalation defaults (80-cash extra shift, couch/TV 80/120, default credit limit 600), continuation sample size 80, and the saved continuation tails (33/73/79 later paid draws in the high-payout/no-creep case; 1/2/4 at default). Preserve these corrections. Ensure the summary at the top of the report also uses the corrected continuation range and sample count. Report the continuation measure as a lower bound on full-draw equivalents funded beyond transition gem stock, rather than assigning every draw to a unique currency source.

Regenerate affected S2 results on the corrected full-exposure calculation and update every dependent report claim; a full runner execution is acceptable. Inspect one raw paired-cohort cell against the same seed replay and verify the excluded count. Run the focused tests plus packet lint; record any remaining censoring and finite-horizon limits. No new parameter sweep, presentation feature, storage mechanism or per-variant balancing is in scope. Commit owned code/results and then the progress report as the final act; never push or set status. Return for technical verification and the owner's S1–S4 evidence gate.
