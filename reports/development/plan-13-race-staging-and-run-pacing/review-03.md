# Plan 13 Proposal 03 delivery review

Date: 2026-10-26. Verdict: bounded correctness/evidence repair required; mechanics selection remains owner-gated.

Reviewed `dc04259`/`f79c74c`, approved Proposal03 and scan/model/controller artifacts. Root reproduced 12/12 focused tests and ran the exact scan command. All 120 races still finish within the reported 21.619–22.487s range. Independent read-only Luna-high review identified the source defects below. No root browser rerun was used to duplicate the implementer's coordinated inspection.

## Required repair

1. **Narration must separate requested and achieved turns.** Collision narration uses targetOffsetDeg as an attained turn, even though acquisition can time out. The control's six-degree ID-signed rotation is not guaranteed outward relative to the impact. Describe the target as a target, use measured attainment/hold/recovery facts for claims of actual movement, and avoid an unsupported direction. Apply the same distinction to weave text. Add explicit timeout/interrupted-hold witnesses and check ordinary successful wording.
2. **Contact status must aggregate both participants.** Each participant currently writes shared record.status when its own recovery completes; the first can mark a contact recentered before the other. Preserve per-participant stage/status and derive event completion only after all participants settle or are explicitly canceled/unfinished. Verify asymmetric recovery and race-ending-during-recovery, without changing steering constants.
3. **Enforce record caps before overflow.** Current post-tick `length > max` guard permits over-cap mechanical records. Bound appends and return unresolved/no winner or payout under documented limit semantics; no silent dropped events or overflow in the returned record. Cover a boundary/multi-append case and diagnostic guard.
4. **Regenerate and reconcile scan evidence.** Root rerunning `node reports/development/plan-13-race-staging-and-run-pacing/seed-scan-20.mjs` changed about 875 lateralToleranceSettledAt fields in the tracked JSON. This dirty JSON is root-generated and handed back for implementer diagnosis. Define that field precisely (sustained lane entry versus final sustained entry), correct generation/report as needed, regenerate and demonstrate a second byte-identical run. Do not alter mechanics to match old evidence. Keep all aggregate evidence synchronized with the repaired event status/narration semantics.

## Timing question requiring disclosure

Finish interpolation precedes same-tick wall/contact resolution. The fixed-step approximation may therefore omit an impact before a crossing inside the terminal 0.05s interval. Investigate whether an actual supported seed/fixture demonstrates this; state explicit tick ordering and accuracy limits. Do not quietly introduce a new continuous collision solver or retune physics in this repair. Return a bounded recommendation if a contract-level change is needed.

## Remaining design/readability findings

Recovery lasting several seconds, many skipped weave opportunities, partially obscured labels, fixed starting-grid advantage and the one-contact cap remain disclosed experimental limits. Report actual activation/attainment/recovery rather than equating due cadence with successful weaving. No new tuning, label/trajectory offsets, speed penalty, extra contact mechanics or production integration is authorized by this review. Repair is report-local; no extra implementer reviewer, packet status change or push. Focused model/diagnostic checks first; request a browser slot for any affected rendered text/control witness. Commit scoped repair and final report.
