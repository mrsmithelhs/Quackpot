# Plan 23 drama study 01 progress

**Date:** 2026-10-27
**Status:** bounded four-arm report-only screen complete; returned for root review.

## Completed

- Amended the study proposal with QP Orch's clarifications: retain median 17–23 s and ≤5% strictly over 23 s; freeze tick-start rank/gap and weave ordering; define the 15 m buffer after existing braking distance; separate the 120-row assistance audit from the 84-row weave diagnostic cap; preserve the 128 mechanical-event cap; require Arm A fingerprint parity before the screen; and defer any fresh-seed validation until root/owner selects an arm.
- Ran `node reports/development/plan-23-production-race-integration/drama-study-01/run.mjs`: three named Arm A parity fingerprints matched, then 1,728 paired race attempts completed on the accepted Plan 13 reference source with only in-memory study transforms. No production, canonical, reference, Plan 20, or external review files were changed.
- All attempts finished: 432 per arm, 0 unresolved. Each arm's median was in the 17–23 s target and each had 0/432 finishes strictly above 23 s. No arm had a finish under 17 s. This screen does not establish a population tail probability or a faster-skewed distribution.
- Leader profile improved movement proxies modestly (sustained lead changes 1.500→1.731/race; bottom-two-to-top-three .271→.352; front-two-to-bottom-three .347→.697) while wall-impact/overlap records rose 36→322. Paired player mean place worsened +.343 and wins worsened in 62 pairs versus 4 improved. These are offline mechanical outcomes, not perception evidence.
- Rear assistance remained null at the outcome level. Of 25,962 rear-only and 25,992 combined scheduled checks, 66 and 82 respectively passed the full gates plus keyed draw. There was no paired placement, finish-time, or movement-proxy delta versus their corresponding control arm. The cumulative condition funnel is preserved in `README.md` and every scheduled check is retained in `results.json`.
- Corrected the initial study-script accounting before the final saved screen: rank turnarounds are based on sustained rank history after the 1 s opening phase, assistance execution summaries include terminal statuses, and spatial gap/progress fields are labeled through the latest trajectory snapshot rather than as burst displacement.

## Artifacts

- `proposal.md` — QP Orch-approved bounded conditions and arm definitions.
- `run.mjs` — reproducible report-only in-memory runner.
- `results.json` — seed/cell/arm attempt rows, summary tables, parity checks, assistance audit and paired comparisons.
- `README.md` — findings, limits, and reproducibility notes.

## Next work and boundaries

QP Orch requested a concise proposal for a separate R2 acceleration-plus-turn/recenter candidate. That proposal is at `../drama-study-02/proposal.md`; it does not authorize study code or another run. Root explicitly requested a compact R1 findings summary and received it before R2 proposal work. No R2 code, matrix reanalysis, validation run, browser preview, production edit, advisor call, dependency installation, or packet-status change was made.

Plan 20's rig/motion files remain handed-off dependencies, not Plan 23 writes. Plan 22 still owns rest penalties. Production source/lifecycle ownership and browser preview remain separately gated. No 20-seed R1 validation has been run or authorized.

## Packaging follow-up (2026-10-27)

QP Orch later authorized a six-seed R2 screen, a separate 20-seed validation and a report-only visual candidate. This follow-up supersedes only the earlier statement that no R2 validation or browser turn was authorized; it does not extend R1's evidence. R1 now has compact and full-gzip outputs and a reproduction runner that writes both. The full six-seed payload is 43,272,640 bytes, gzip 2,042,555 bytes, and R1 validation remains unrun. See `../drama-study-02/README.md` for the later R2 and fresh validation, and `../drama-preview-01/README.md` for browser evidence.

## Advisor disposition

Branch C — orchestrator-gate-only for this bounded report-only follow-up. This screen added research code but no production behavioral surface; no additional advisor or browser review was requested under QP Orch's direction. The result is returned to QP Orch/root for oversight.
