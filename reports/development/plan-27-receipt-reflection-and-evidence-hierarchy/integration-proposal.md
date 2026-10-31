# Plan 27 follow-up — Production Receipt integration proposal

**Date:** 2026-10-31  
**Status:** Draft for QP Orch adoption as a separate implementation packet. This document authorizes no source changes, tests, browser work, schema edits, packet status changes, push, or deployment.

## Current delivery and blockers

The Plan 27 investigation is delivered; the owner selected **Layout A — Three-register cards**. Keep both comparison layouts and the report intact. The current review entrypoints are [`comparison.html`](comparison.html), [`source-map.md`](source-map.md), and [`progress.md`](progress.md). Layout A selection closes the hierarchy decision; it does not establish rendered accessibility or authorize production integration.

There is no remaining owner-selection blocker for the investigation. Production work needs a new bounded packet adopted by QP Orch, with exact source ownership and validation authority. Two implementation-specific gates should be explicit:

1. Preserve purchase-level cost traceability. `projectReceipt()` currently matches each `draw_committed` to the preceding pull purchase internally, but `pullLedger` exposes only `purchaseKind`, not the matched purchase sequence or transaction amounts. The new packet should either add a minimal projection-only purchase link from existing `purchase` events, or explicitly keep transaction costs in the current aggregate accounting evidence. Do not invent a per-draw price allocation for a ten-pull transaction.
2. Generate the named long-race, early-Uninstall, and zero-cash paths through the actual engine for later implementation evidence. If a path cannot be reached with current public actions, identify it as projection-fixture coverage or a concrete source gap; do not label a hand-built log as an engine trace.

The earlier comparison page was not rendered: the in-app browser rejected its local `file://` URL. That is a known validation limit, not a reason to repeat or bypass the failed workflow. A later implementation packet must authorize its own isolated rendering workflow before browser evidence is claimed.

## Proposed implementation objective

Port the selected Layout A into the existing end Receipt. Keep concise event-grounded cue/action context and the fixed reflection prompt visible. Put repeated race chronology, per-draw records, transaction links, and other supporting evidence in accessible native disclosures. Keep the local append-only log as the source of truth; the display must not delete, rewrite, or infer log facts.

Use only the event types and projected evidence that exist today. Do not wait for the full Plan 38 life/session progression: its future obligations and transaction rules are not yet a production schema. The initial integration can present the current Receipt baseline and leave those later facts to an explicit adapter once Plan 38's amended mechanism and event evidence are adopted.

## Event-to-register mapping

| Register / section | Existing source | Presentation rule |
|---|---|---|
| **We displayed** — technique findings | `cue_shown`, `offer_shown`, and `retention_modal_shown`, projected into each `finding.displayed` with source `seq`. Duplicate conversion is represented through the current duplicate/reveal path. | Name a technique only when the current projection has a recorded display cue. Keep the cue copy, sequence, and any shown cost/terms visible in the card. Missing or older cue detail stays unknown; do not infer exposure from an action or outcome. |
| **We displayed** — race evidence | `race_choice_offered`, `race_trial_offer_shown`, and `race_cue_displayed` → `raceEvidence.displayed`. | Summarize repeated choices with a count/denominator and source references. A mechanical contact, crossing, payout, or simulated event is not a displayed cue unless a display event says so. Preserve the older-record “no candidate details” fallback. |
| **You did** — choices/actions | `action` branches in findings and race evidence; `purchase` events summarized by the existing findings; `race_playback_action`; choices and exit actions. Each projection line has `seq` or `null` for an explicit no-event statement. | Describe recorded player choices/actions only. Temporal “after/during” language remains chronology and never implies cause. |
| **You did / Game recorded** — committed outcomes and accounting | `draw_committed`, `race_result`, `race_attempt_unresolved`, `expense_due`, `expense_paid`, `escalation_result`, `income`, `interest_charged`, terminal, and relevant `action` events, as projected in `pullLedger`, `raceEvidence.did`, `accounting`, and `summary`. | Prefix placements, payouts, unresolved outcomes, balances, and debt as **Game recorded** within the second register. A result is not a player choice. Keep cash paid, waived, unpaid, and debt distinct. Zero cash alone is not debt, failure, or an unpaid bill. |
| **Did this affect you?** | Existing fixed `finding.question.text` and `raceEvidence.question.text`; answers remain `null`. | Keep the question open and visible. Do not collect an answer, add a learner diagnostic, or infer motivation/effect. A generic prompt with no matching technique must explain its factual referent. |
| Expanded draw evidence | `draw_committed` → `pullLedger`: exact per-draw `preDrawOdds` from `payload.odds`, committed identity/rarity/duplicate and `committedSeq`; `reveal_shown` joined by `commitSeq`, with `revealSeq`. | Show each draw's recorded conditional pre-draw Legendary/Rare/Common odds beside its committed result and whether/how it was revealed. Never reconstruct odds from the result or final balance. If a legacy draw lacks odds, label them unavailable for that draw. |
| Expanded race evidence | Ordered `raceEvidence.displayed` and `raceEvidence.did` arrays with `seq`; committed `finishOrder` or unresolved status remains separate from playback controls. | Retain the full sequence and actual crossing order. Preserve unresolved attempts without inventing a place/reward. Mark outcomes “Game recorded”; do not describe mechanical events as watched. |

The Receipt projection also returns `chainValid`, `isComplete`, and `receiptShown`. Do not call the chain cryptographic or authentic. The view currently projects before `recordReceiptPresented()` appends `receipt_shown`; therefore it must not use the initial `isComplete === false`/`receiptShown === false` as a claim that the save is truncated. Any coverage warning needs a lifecycle-aware design and truthful copy. Keep legacy/missing fields explicitly unknown rather than collapsing them into zero/none.

## Compact default and detail progression

1. Start with terminal route and the current event-derived cash, health, debt, owned-duck, and Down totals. Keep paid/waived/unpaid summaries distinct and link summarized lines back to event `seq` where the projection supplies one.
2. List each projected technique in first-cue sequence order. Each card shows its recorded displayed cue, the action/result summary with relevant sequence references, and the existing fixed impact question. No hidden importance score; do not suppress a named technique's cue/action context behind disclosure.
3. Provide a compact race group with counts and denominators for choice/action/result records. Individual choices, shown cues, result crossing order, payouts, unresolved attempts, and playback actions remain available in chronological expandable evidence.
4. Provide a compact pull summary; each expanded committed draw shows its exact per-draw conditional odds and committed-versus-revealed distinction. Group a multi-draw purchase by its transaction `purchase.seq` once; do not multiply or invent a per-draw cash/gem allocation.
5. Keep all details locally available, with native keyboard-operable disclosures, visible focus, text labels independent of color, responsive reflow, and print behavior that expands closed evidence. Do not redesign Plan 07's raw usage export.

## Required engine-generated trace set for the future packet

These are validation targets, not traces claimed by the current synthetic comparison.

- **Long race-heavy:** use engine actions to complete several races, including choice offers and selections, any actually displayed race cue, playback action, committed individual finish order and payout, and at least one committed draw with conditional odds. Record the seed/configuration and source sequences. Confirm default counts and expanded evidence reproduce those events without claiming a collision was watched.
- **Early Uninstall:** exercise the actual offer/leave path and, where reachable, an immediate exit with no technique offer. Confirm the displayed register includes only logged cues, the exit action remains distinct, and the terminal route is recorded. Do not invent a technique card for the no-offer route.
- **Zero cash:** exercise a cash-zero route with no unpaid expense and a separate zero-cash unpaid-bill route if both are reachable. Compare `expense_due`, matching payment/waiver, debt events and terminal route. If the engine cannot produce a case, retain a clearly labelled projection fixture and report the gap; do not claim a story-path witness.

All three must be actual append-only engine traces for behavioral claims. Hand-authored HTML examples remain presentation-only and cannot satisfy those acceptance checks. Do not open or reuse owner saves.

## Files and ownership for a separate packet

**Plan 27 follow-up would own:**

- `src/ui/receipt-view.js` — Layout A markup, visible summary, and accessible disclosures; keep `renderReceiptView(container, engine, callbacks)` and the existing presentation callback boundary.
- `src/ui/receipt-presentation.mjs` — small pure display-summary adapter over `projectReceipt()` output, if needed to keep grouping/count rules out of the DOM renderer.
- `src/ui/receipt-view.css` — scoped Receipt styles, avoiding the shared global style sheet if the existing Vite/CSS entry can include this module without disturbing other views.
- `src/core/receipt.mjs` plus `src/core/receipt.test.mjs` — only if the adopted packet approves exposing purchase transaction links already present in `purchase` events; no event schema or storage change.
- A focused view test file and the report-local progress/evidence needed by the adopted packet. Their exact paths and execution budget should be ratified with the packet.

**Plan 27 follow-up would not own:** `src/core/event-log.mjs`, engine outcomes, `src/core/storage.mjs`, `src/main.js`, `src/ui/life/*`, `src/ui/modals.js`, `src/style.css`, save migrations, ZIP/export schemas, teacher analysis, Plan 38 paths, or later-life event definitions. If exact source evidence cannot be presented from existing projection fields, stop for an owner/orchestrator scope decision before touching those areas.

Plan 38 currently owns `src/ui/life/*`, bounded `src/main.js`/`src/ui/modals.js` life routing, and its stated engine changes; it excludes new event types/life-surface display logging and has a pending bounded progression amendment. The proposed Plan 27 baseline therefore does not depend on Plan 38 completing and must not compete for those files. A later additive adapter may consume Plan 38's approved event facts only after its mechanism, event contract, source ownership, and chronology are explicit. Do not block the current Receipt baseline on unresolved Plan 38 rules or infer the future lifecycle from today's cash/health totals.

Plan 29's selected working wage is $60 take-home per completed shift; other prices, health values, and duration remain provisional. The Receipt must report committed event values as recorded and must not use integration as a reason to retune or settle those parameters.

## Later validation and acceptance gates

No tests, browser run, build, dependency install, or source edits are authorized by this draft. A separately adopted packet should require:

- Focused projection coverage for sequence mapping, cue-only technique naming, exact purchase-to-draw grouping, conditional odds, result/action distinctions, legacy unknowns, zero-cash paid/unpaid/debt distinctions, and both early-exit routes.
- View coverage showing Layout A's cue/action/question context visible without opening details, the complete evidence available inside disclosures, safe escaping of all log-derived text, keyboard/focus behavior, narrow reflow, and print expansion.
- Actual engine traces from the three cases above, a bounded static build, and one isolated real-app browser review after explicit browser coordination. Report where evidence is still partial; do not convert code/snapshot coverage into assistive-technology or real-device claims.
- Source ownership and Plan 38 coordination checked before mutation. The root adopts an implementation packet, assigns status separately, and reviews any unavoidable core/event scope before source writes.

**Next step:** QP Orch may adopt, narrow, or revise this proposal into a new implementation packet. Until then Layout A remains a selected presentation hierarchy, and production Receipt behavior remains unchanged.
