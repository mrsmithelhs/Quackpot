# Plan 27 progress — Receipt reflection and evidence hierarchy

**Date:** 2026-10-28  
**Status:** Report artifacts prepared for owner selection; production integration remains gated.

## Summary

Created a report-local comparison of two reflection-first Receipt hierarchies and three clearly labelled, hand-authored synthetic presentation examples: a longer race-heavy case, early Uninstall without an offered technique, and a zero-cash case. The cases are not valid saves, engine-generated traces, or observed player histories and do not establish that their represented events co-occurred.

Both layouts keep **We displayed / You did / Did this affect you?** visible with factual cue/action context and sequence references. Supporting evidence is behind native disclosures. Repeated race choices are summarized with a denominator; expanded entries preserve source-sequence references. Player actions are worded separately from game-recorded outcomes. Pull odds are not invented in the synthetic example; the mapping requires future per-draw detail to copy each exact conditional value from `draw_committed.payload.odds`.

**Recommendation:** Layout A (Three-register cards) is the stronger provisional owner choice because it keeps each cue, action/result, and reflection prompt together in first-event order. Layout B offers a useful cross-domain overview, but its domain board adds another grouping layer. This is a source-based recommendation only; neither layout has been rendered for comparison in a browser.

## Files created

- `comparison.html` — self-contained report page with two selectable layouts, three selectable synthetic cases, native `<details>/<summary>` evidence progression, responsive styles, visible focus, and print rules.
- `source-map.md` — current Receipt projection mapping, summary/omission rules, synthetic-case limits, accessibility/print/export implications, and validation limitations.
- `progress.md` — this delivery record, written last per repository commit discipline.

No production files, canonical docs, packet metadata/status, exports, or Plan 16/33 files were changed. The pre-existing untracked Plan 33 `deep-research/` folder was left untouched.

## Evidence and validation

| Check | Result and exact scope |
|---|---|
| Packet preflight | `node scripts/dev/plan-status.js check plan-27` returned `RUNNABLE: plan-27 is ready to implement`. |
| Source review | Read Plan 27 handoff/packet, current Receipt specification and projection/view, repo structure, decision log, agent prompt, and relevant tests. The report mapping was checked against the current projection branches and field boundaries. This is not production behavior validation. |
| Diff hygiene | `git diff --check` returned exit code 0 for the revised tracked comparison page. No tests, Node build, or automated HTML validator were run; the handoff permits pure report work without additional Node tooling. |
| Browser workflow | QP Orch cleared one direct `file://` page in the empty ChatGPT in-app browser harness, with no owner-tab use, server, Node, network, or storage access. Browser URL policy rejected `file://` before a tab opened. No alternate surface, URL, server, or workaround was attempted. No rendering or print-preview observation was obtained. |
| Terra-medium consultation | One reviewer consultation was requested as `gpt-6.1-terra` / medium. The reviewer reported that its actual model identity was not independently observable. It reviewed inline artifact excerpts only; no local file read, browser, execution, edit, or child agent was used. The resulting `git status --short` showed only the Plan 27 comparison modification and the pre-existing Plan 33 untracked folder; the reviewer made no changes. |

## Consultation finding and disposition

**Finding (medium):** Race results grouped under **You did** could sound like a player action and imply agency over chance-driven outcomes.

**Independent check:** The current `projectReceipt` places `race_result` and `race_attempt_unresolved` lines in `raceEvidence.did`; the production renderer labels the section “YOU DID / THE GAME RECORDED.” This confirms the projection grouping but does not establish rendered comprehension.

**Disposition: Accept.** In the report, race placements and payouts are explicitly prefixed **Game recorded result** in both the visible summary and expanded source evidence. Race selections and playback actions remain separately worded as player actions. Zero-cash balances/payments and the Uninstall terminal route are likewise explicitly identified as game-recorded accounting or outcomes.

The reviewer also identified print expansion, keyboard behavior after content replacement, narrow-screen reflow, and generic-question referents as requiring rendered verification. Early-exit and zero-cash cards now explain that the generic prompt has no technique-specific cue attached. Print, keyboard, narrow-layout, and rendered wording behavior remain **unverified** because the browser blocked the local file before load. No repeated consultation or browser retry was conducted.

## Remaining decisions and limits

- Owner selects the preferred Receipt hierarchy and may revise wording/order in the report artifact.
- Numeric conditional odds are not shown as invented sample values. A later production-facing example must use exact per-draw stored pre-draw odds; any genuine engine trace requires a separately bounded authorization.
- Print implications and accessible native controls are described from source only; this is not browser, assistive-technology, or accessibility-conformance evidence.
- No production Receipt, log, storage, or export implementation is authorized by this report. Stop here for owner hierarchy selection before any production integration proposal or source write.
- No push, deployment, or packet status change was made.

## Commit record

- `8dbd287` — add Plan 27 Receipt layout comparison and source mapping.
- `f481a2d` — clarify race summaries and recorded-result wording.
- This progress report is committed separately as the final scoped action.
