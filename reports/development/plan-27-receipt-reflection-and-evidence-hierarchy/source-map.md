# Plan 27 — Source mapping and summary rules

**Status:** report-local proposal, 2026-10-28. This file describes presentation possibilities only. It does not change the current Receipt projection or renderer.

## Artifact boundary

[`comparison.html`](comparison.html) contains hand-authored presentation examples. They are **not valid saves, engine-generated traces, or observed player histories**, and the examples do not establish that the listed events co-occurred. Sequence numbers and values are illustrative. No engine replay, browser storage, export, or production event log was read to create them.

The examples use current projection concepts and event names so the owner can review information hierarchy. They do not claim that each arbitrary example value is a legal game outcome, and they do not replace an implementation check against a real append-only log. A production presentation must copy facts from the Receipt projection and preserve each source sequence; it must never treat this report's sample text as source data.

## Renderer-to-copy map

| Visible report content | Current source evidence / renderer mapping | Boundary |
|---|---|---|
| Technique name and displayed register | `src/core/receipt.mjs` `shown(technique)` gathers `cue_shown`, `offer_shown`, and `retention_modal_shown` events with that technique. `findings` omits techniques without that cue, except a duplicate `reveal_shown` can itself qualify `secondary_currency`. | A finding must be grounded in an actual display record: its technique cue, or the duplicate reveal exception. A committed action or `draw_committed` alone is not evidence that a cue/reveal was displayed. |
| Technique action register | Current finding branch maps purchase/action/draw/race results to `did`; each projected line has the originating `seq`, or `null` for a “no event recorded” statement. | Do not turn sequence proximity into causation. “After” or “during” is a temporal relationship only where the renderer already establishes it. |
| Technique reflection question | Fixed `TECHNIQUES` question in `src/core/receipt.mjs`. `answer` remains `null`. | Keep the open question; do not answer it or infer motive/effect. For an example with no technique, state that no technique-specific prompt applies instead of inventing a new diagnostic. |
| Race choices shown | `race_choice_offered` → `raceEvidence.displayed`; current renderer uses candidate ratings, available upgrade state, pace labels, and sequence. Older/incomplete records use an explicit “no candidate details” fallback. | Displayed-register wording is based on exposure events. Mark old/incomplete candidate details as unknown; never infer a missing offer or candidate order. |
| Race speed-upgrade offer shown | `race_trial_offer_shown` → `raceEvidence.displayed`. | Keep the offer exposure, cost, and sequence distinct from purchase/use actions. |
| Race cue shown | `race_cue_displayed` → `raceEvidence.displayed`. | Mechanical contacts/collisions/results are not watched cues. A cue is shown only when a display event exists. |
| Race choice, upgrade action, and playback control | `action` (`race_choice`, `race_trial_purchased`, `race_trial_consumed`) and `race_playback_action` → `raceEvidence.did`. | These are recorded actions, not proof that a related offer was noticed. Playback skip does not remove the committed result. |
| Race finish and unresolved attempt | `race_result` and `race_attempt_unresolved` → `raceEvidence.did`. The presentation explicitly prefixes these lines as **Game recorded result** within that register. | The current projection groups actions and recorded outcomes under `raceEvidence.did`; the sublabel avoids attributing a chance-driven place or reward to player agency. Preserve actual recorded crossing order and payout; keep unresolved attempts distinct and do not invent a place or reward. |
| Pull result and conditional odds | `draw_committed` populates `pullLedger`; `preDrawOdds` is the exact `payload.odds` object for that draw. `reveal_shown` is joined only by `commitSeq`. | Expanded per-draw detail must copy the recorded Legendary/Rare/Common pre-draw odds. Do not recalculate from a final balance/result or apply one draw's odds to another. The synthetic race case contains no numeric odds claim. |
| Final cash, health, debt, owned ducks, Down | `summary` is derived from income, expense payments, escalation, purchases, debt-changing events, committed draws, and Down actions inside `projectReceipt`. | Label these as cumulative totals. Do not use totals to fabricate transaction detail. A displayed cash balance of zero does not itself mean an unpaid expense or debt. |
| Paid and unpaid expenses | `expense_due`, matching `expense_paid`, and intervening `escalation_result` are projected to `accounting.expenses`; `accounting.lines` separately summarizes actual cash paid, waived food, and unpaid expense. | Distinguish cash amount actually paid, waived amount, and remaining unpaid amount. Absence of an expense entry is not proof of no bill in a partial or legacy log. |
| Debt and ending | Debt is taken from debt-changing events; `terminal` supplies `terminalRoute`. `receiptShown` is a separate recorded boundary. | Do not equate zero cash with debt, failure, or `running_on_empty`. Do not infer a completed Receipt from a terminal route alone. |

## Proposed default grouping and omissions

Both candidates use the same displayed facts and topic summaries; only hierarchy changes. Layout A is a single sequence of topic cards. Layout B places first-event-ordered domain groups into a responsive board; each topic inside a group still exposes all three registers before the sequence-level disclosure.

1. **Show the accountability context before detailed evidence.** Keep the factual terminal route/totals visible, then show compact groups with clearly labelled **We displayed**, **You did**, and **Did this affect you?** registers. A named technique card must make its displayed cue and recorded action/outcome understandable without requiring the reader to open every disclosure. Within **You did**, prefix game outcomes with **Game recorded result** so a placement/payout is not framed as a player choice.
2. **Order topics by first relevant event sequence.** The current `findings` array follows fixed technique-catalog order, not first-cue order. A production presentation adapter must explicitly sort findings by the numeric sequence of their earliest qualifying display evidence. Race `displayed`/`did` arrays are appended in event-type loops, not globally chronological order; merge sequence-bearing lines and stable-sort by numeric `seq` for expanded chronology. Keep null-sequence “no event recorded” lines distinct rather than assigning them invented positions. For grouped domains, order domains by their earliest represented event. This is explainable and repeatable; it is not a hidden importance score.
3. **Compress repeated evidence only in the default summary.** State an aggregate with a denominator (for example, “4 race choices represented”) and identify any selected latest/first example explicitly. Keep the underlying sequence-linked records in the disclosure. Never let a selected example stand in for the cumulative total.
4. **Keep examples, totals, and unknowns distinct.** Use labels such as “4 events represented,” “latest shown value,” “sequence example,” “none recorded in this complete example,” and “unknown in older record.” Do not silently treat missing or unsupported evidence as zero or none.
5. **Keep conditional odds at draw level.** Any future per-draw expansion copies that draw's `draw_committed.payload.odds`, including the pity-adjusted pre-draw values. If odds are absent in a legacy record, say they are unavailable for that draw.
6. **No new diagnostic or inferred impact.** Questions remain unanswered. Preserve temporal language such as “after” as chronology, not cause. Reflection and story tone are not evidence of player psychology.

## Synthetic case coverage

- **Longer race-heavy:** demonstrates visible race choice/cue/action/result grouping, skip evidence, four represented attempts, and a pity/draw mapping whose odds must remain per-draw. The four attempts are a layout sample, not a duration measurement, validation of the 25-minute design target, or valid run.
- **Early Uninstall with no offered technique:** demonstrates that no empty technique card is invented. The generic prompt is explicitly about the recorded exit and is not attached to an unrecorded technique. It assumes a complete record for the example; in partial/old/unknown records, an absent cue is unknown, not proof that none was displayed.
- **Zero cash:** separates `$0.00` final cash from `$0.00` cash expenses paid, an unpaid expense entry, and debt events. The example does not turn zero cash into a failure or debt claim. “None represented” is explicitly bounded to its complete-example assumption.

## Accessibility and print/export boundary

- Layout and case choices are native labelled radio controls. Disclosure uses native `<details>/<summary>` controls, preserving keyboard activation and browser focus behavior.
- Register labels remain visible, color is supplementary, text reflows at narrow widths, and focus has a visible outline.
- Print output includes only the selected case/layout and expands closed evidence disclosures. This is an implication for a narrative Receipt printout, not a redesign of raw run-usage export (Plan 07).
- The page is not imported into Vite or production and makes no network/storage/export calls.

## Validation still required

QP Orch cleared one direct local-file rendering review in the empty ChatGPT in-app browser harness, with no owner-tab use, server, Node, network, or storage access. The browser's URL policy rejected the required `file://` protocol before a tab opened. No alternate URL, server, browser surface, or workaround was attempted. Node, build, and automated HTML validation have also not been run. Source review cannot establish rendered visual quality, browser accessibility conformance, or production behavior.

One authorized Terra-medium consultation reviewed inline artifact excerpts only; it could not independently open the report files or run them, and its actual model identity was not independently observable. It identified one accepted presentation risk: race outcomes under **You did** could imply player agency. The example and mapping were revised to prefix these entries **Game recorded result**. The consultant also identified print, keyboard updates, narrow reflow, and generic-question referent as items requiring rendered verification; these remain unverified due the blocked local-file navigation.

**QP Orch closeout review, 2026-10-31:** Root accepted Plan 27 as a report-only hierarchy investigation with owner-selected Layout A. This source map and the integration proposal were corrected to record that race evidence arrays are grouped by event type and need numeric sequence sorting for chronology; nearest-preceding purchase association is only a heuristic; duplicate `reveal_shown` is valid display evidence for the `secondary_currency` exception; and `race_trial_offer_shown` must be mapped to displayed evidence. Plan 44 carries these qualifications into the future implementation packet. Plan 27 closeout does not authorize production source, tests, browser work, schema/export/storage changes, or Plan 44 assignment.
