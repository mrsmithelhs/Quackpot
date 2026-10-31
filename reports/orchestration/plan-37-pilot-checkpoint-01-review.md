# Plan 37 pilot checkpoint 01 — orchestration disposition

Date: 2026-10-30. Inputs: checkpoint-01.md and ledger.md in the design-review-pilot folder; owner reports continued satisfaction with context/consequence presentation. Scope: review the first stage, not approve implementation or the whole time system.

## Record

Preserve the recorded owner selections: tiered gacha session consumption; Morning/Afternoon/Evening as the three primary narrative phases, with optional Late Night; neutral explicit warning when a commitment directly sacrifices an obligation, with routine non-conflicting actions avoiding redundant modal friction. These are owner preferences, not an invitation to substitute a different time model.

The stage is sufficiently compact and self-contained to review without the entire chat. Separating ledger and consequence map has already exposed implications before code. Continue the pilot; do not roll out the prompt globally or call the whole pilot validated yet. Owner satisfaction is qualitative early evidence, not a comparative study.

## Clarify before dependent lane decisions

1. **A phase is not yet a specified capacity.** LEDGER-02 says one major committed activity per phase, listing meals, work, gacha and rest. The checkpoint does not explain whether a quick breakfast and morning gacha can coexist, whether eating consumes the entire morning, or whether each phase has a major activity plus small choices. This materially changes the owner's tutorial and optional breakfast. Give concrete Day1/Day2 examples and ask only this unresolved capacity fork; keep the three named phases selected. If that exclusivity was explicitly explained and selected in the interview, quote/summarize the actual example rather than ask the owner again. Do not silently infer it from selecting phase names.
2. **Separate optional Late Night from automatic punishment.** Optional extension is recorded; no exact penalty, forced next-morning loss, extra work penalty or bedtime rule is selected here. Late Night can support chosen work/rest/session policies. Return such consequences with context; orchestration does not adopt 'penalty state' merely because checkpoint question 2 calls it that.
3. **Define a session transaction before tuning counts.** First active pull/race versus entering the phone; already-committed purchase versus reveal; returning to apartment and reopening; reload/pause/Uninstall; expiry of the baseline and commitment to another phase all need explicit semantics. A ten-pull purchase is not automatically ten separately charged life actions. Determine which units count in Plan37; Plan29 calibrates numeric thresholds after the units and loops exist. No click cadence or reading duration as a hidden cost.
4. **Keep cost disclosure distinct from warning dialogs.** The selection removes redundant modal friction, not prices/terms/health effects, explicit purchase buttons or accessible ways to understand commitments. A clear Skip breakfast (−5 HP) button need not acquire another dialog solely to satisfy the warning policy. An explicit conflicting action must identify the affected opportunity before commitment. Avoid repeatedly warning for a phase already knowingly committed.
5. **The 30-second click-through example is a stress test, not another owner decision.** Rapid progression is possible without enforced waits. Do not label its exact trade-off chain accepted unless the owner saw it; show one concrete rapid trace and one ordinary trace. No requirement that enough gems can consume every future slot, or that every phase transition sacrifices something.

## Check: event pair and fixture question

The conceptual separation is correct: record a warning only when actually displayed, and a commitment only on the action. The existing vocabulary uses lower-case `cue_shown` (and other shown-event types) plus `action` with a specific kind; `CUE_SHOWN` / `ACTION_COMMITTED` in the checkpoint must be conceptual labels, not adopted new event/schema names. Preserve the three-part rule: **we displayed / you did / did this affect you?** No inferred motive or claimed experienced emotion.

This does NOT establish replay-fixture compatibility. Event payloads, commitments and progression affect hashes, source identities and historical replay expectations. Plan35 captures remain preserved historical evidence. A later implementation packet must choose actual fields/event kinds, migration and new compatibility witnesses; do not regenerate pinned captures or promise old attestations certify new semantics. No schema or code mutation in this pilot.

## Scope: next checkpoint

Proceed with concrete meal/work/rest alternatives once the capacity implication is resolved. Coordinate the owner's latest Plan38 feedback rather than carrying forward instant wages/automatic rent or the unexplained external Go to work button. Next checkpoint should provide:

- One readable Day1–Day3 sequence with at least ordinary work, an evening activity candidate, rent balance and Day2 gacha access.
- Two short contrasting traces plus a rapid route; costs can remain symbolic except selected breakfast skip (5 HP/no cash).
- Explicit distinction between agreeing to work, completing it, receiving pay and deciding to pay the balance.
- Session resume/re-entry and an interrupted commitment case.
- A small list of owner choices and open assumptions, separate from recommended enum/schema/UI implementation.

Call Mom is a preferred neutral activity candidate, not adoption of deferred borrowing. Plan40 studies work/evening presentation; Plan29 tunes numbers; existing weather helpers are not mounted simply because a phase could use different light. Independent investigation can continue; dependent consequences remain held. No new production or prototype execution authority.

## Short relay to the pilot

Root records LEDGER-01–03 as the owner's selected direction and approves continuing the staged interview. Keep the three phases and tiered session choice. Before committing dependent lanes, clarify (with concrete day examples) whether eating consumes a whole phase or can accompany its major activity; don't re-ask if the owner explicitly selected that consequence already. Optional Late Night is selected, automatic penalties are not. Treat event names as conceptual and hold schema/fixture claims. For checkpoint 02 show a coherent Day1–Day3 trace, Day2 gacha opportunity, work/pay/rent as distinct steps, and session re-entry/reload semantics. Work directly with the owner on the unresolved implications; no routine root gate per question.
