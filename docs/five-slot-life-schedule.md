# Five-slot life schedule — accepted direction and transition boundary

Owner accepted 2026-11-02. This is the current selected design, linked from the founding design. Plan 52 has mounted the five-slot scheduler in the development game; integration, checkpoint coverage and owner acceptance remain in progress. Historical reports and completed packets retain their original evidence; their maintenance-plus-anchor assumptions do not override this direction.

## Selected structure

| Slot | Ordinary activity | Selected meaning |
| --- | --- | --- |
| Morning | Breakfast | Eating occupies this slot and completion leads to Midday. A qualifying competing activity misses breakfast. |
| Midday | Scheduled work when available | Work completion/pay leads to Early Evening. A qualifying competing activity can miss a scheduled shift. Weekends/calendar are deferred; work availability must be data, not implied by the slot name. |
| Early Evening | Dinner | Eating occupies this slot and completion leads to Evening. Dinner cannot be postponed into another slot. |
| Evening | Leisure, social visit, gacha, or early bedtime | One activity; early bedtime offers additional recovery, with its amount selected through simulation. |
| Late Evening | Normal bedtime or optional active play | Arriving here after ordinary Evening leisure is not itself fatigue. Qualifying active play incurs the selected fatigue; normal bedtime does not. |

One qualifying activity occupies one slot. Early-bed extra recovery is an alternative to the Evening activity, not an additional bonus after completing Ren or another Evening activity; bedtime after that activity is normal sleep. Slots do not pass with real time, reading, device speed or animation duration. Inspection, navigation, messages and browsing/re-entry are free. Reservations for future activities are not current-slot consumption. Explicit tutorial meal skips close the meal slot without buying a meal. Availability and non-spending/non-gacha progression alternatives must be resolved before integration; no player may be forced into spending or gacha merely to advance.

Commit/reserve, present/resume, and complete/advance are distinct. Meals can complete promptly; work/social/gacha preserve progress through their experience. A gacha session may contain the selected allowance of one pull action (single or ten-pull) plus one race in its one slot; a second allowed action does not automatically consume another slot. Exact session finish/extension boundaries must be specified in Plan 51. No successful activity or slot advancement may occur twice.

## Guidance and consequences

Use one guidance schedule, separate from obligation/consequence rules. Working supported period is N=5 days after Day 1: Day 1 guided, Days 2–6 supported, Day 7 onward independent. N is a tunable working value, not final balance.

- Day 1 teaches explicit Eat/Skip and retains the required first tutorial work shift before the evening launch. If Late Evening is offered, disclose the bedtime/play choice; it is not mandatory play.
- During supported days, a qualifying competing action receives a standardized warning before it commits a missed meal, missed scheduled shift, or Late Evening fatigue. Cancel, unavailable destination or failed play before commitment leaves gameplay time, money, health, commitments and RNG unchanged. Actual displayed-warning and cancel evidence may still be recorded. Early meal-related withdrawal from a not-yet-started Ren visit is exempt; its exact intent, opportunity closure and arrival behavior require the shared mechanism, not a renderer-only escape.
- Later familiar routine warnings fade; factual outcome feedback and Receipt evidence remain. Costs/odds/terms, newly introduced consequences, and materially escalated outcomes such as employment termination or immediate bedrest retain appropriate disclosure.
- Meal loss is the working up-to-5 HP, clamped to actual health, with no meal charge. Working first-port values now selected in Plan52: +5 early bed, +25 bedrest, −10 next-morning Late Evening fatigue and overtime +$60/−15 on completion, retaining earned wages before recovery at0HP. Recovery precedes simultaneous rent while preserving the bill. These remain tunable, not final balance. One future eligible Evening overtime is offered to employed players with confirmed Ren conflict; owned couch/TV sales are free one-time $30/$40 transactions with seating disclosure. A social cancellation is not automatically equivalent to an uncommunicated broken plan; no new relationship penalty is calibrated here.
- This selects no two-slot activity or combined missed-dinner-and-Late-Evening commitment. Different consequences may belong to one actual action, but the scheduler must prove which slot and obligation it displaces; another activity slot requires another deliberate commitment.

## Transaction and interruption boundary

A pre-commit cancellation or failed operation creates no gameplay outcome. Actual displayed cues and player cancellation remain truthful append-only evidence, not a reason to demand an unchanged entire log. Once a start or sub-action succeeds, its slot reservation, purchase, inventory, RNG and event outcomes persist exactly once. Later closing, reloading, interrupting or abandoning a session must not roll them back. Plan51 defines completion/abandonment and obligation timing per activity. Staged destination/slot/consequence writes commit atomically with the specific successful operation, not with an entire future conversation or session.

## Selected working financial contract — 2026-11-02

These are owner-selected first-port rules, not final balance or evidence of mounted behavior. First remaining rent is $170 due Day4; second rent is $400 due Day14. No third bill/calendar is selected. Payment always requires an explicit action. Zero cash after payment is not failure.

A voluntary loan covers exactly the current rent shortfall and adds a one-time50% fee; root approves integer-cent half-cent rounding up. Show principal, fee, full total and exact due day/slot at acceptance. Due is ENTERING Midday five calendar days later, before that day's work/wage. Early repayment is the full agreed total. Only one loan may be active; repayment permits a later qualifying loan without rewriting previous terms/history. No automatic borrowing, renewal, compounding, transfer, seizure or debt forgiveness. Loan acceptance and rent payment are distinct transactions; funding and paying later rent avoids eviction for now.

Resolve forced recovery first and latch all due obligations entered/crossed during it. If rent and loan are both due, display both and current cash; disclose inability to cover the combined amount before the first payment, and let the player choose order. No hidden priority or automatic transfer. Keep the financial decision pending while reading, inspecting or navigating. Work, gacha and other time-consuming progression cannot evade due obligations; Settings/save and immediate Uninstall remain available. The following rent-rescue exception applies while rent alone is due: after explicitly reserving an eligible future Evening extra shift, the player may complete meals, recovery, scheduled work, and the minimal slot progression needed to reach that shift. Discretionary gacha and leisure remain blocked while rent is unpaid. Wages and sales never pay rent automatically. A due loan overrides this exception and must be resolved before work; a failed or cancelled reservation leaves rent due.

For the first integrated playtest, the work-availability data schedules work on Days 1–19, matching the declared calibration study. This is a tunable test assumption; weekends and the later calendar remain deferred.

Allow actual apartment sales of still-owned couch for$30 and TV for$40, once each, consuming no slot and preserving existing Ren seating disclosure/reconfirmation. Sale adds cash but pays no bill. Provide a route from payment context back to the actual sale interactions; do not replace the apartment objects with a bill shop. Navigation/putting a bill down does not clear its deadline or pending choice. Insufficient cash alone does not instantly end a run while an eligible sale remains. Present applicable alternatives, then require an explicit consequential refusal/leave-unpaid choice with its immediate consequence before terminal commitment.

After available choices, unpaid first rent reaches Running on Empty; later unpaid rent uses the housing-loss/eviction reason. Loan default reaches Running on Empty. Inability and solvent deliberate rent withholding/loan refusal have distinct factual events/reasons. Paying one due bill does not forgive another or silently select its ending. Preserve outstanding debt and all earlier committed outcomes; terminal/Receipt happens once, based on evidence rather than final cash. The old Morning-deadline study is historical conditional evidence, not validation of this contract.

## Transition authority and no old-save support

Owner clarifies that all current players/saves are development or synthetic. **No old-save migration, dual legacy scheduler, or backward-compatible old-save playback is required for this transition.** New saved runs must still replay/validate faithfully under the new policy. Detect unsupported old development data clearly rather than interpreting it as new state or calling it corrupt; do not erase the owner's browser save automatically. Offer an explicit fresh-run/reset route using existing storage UX where practical. This waiver concerns game run saves/fixtures, not unrelated audio choices, asset provenance or historical reports.

Update/regenerate synthetic game saves, checkpoint catalogs, generator recipes, source/config fingerprints, validations, brief instructions, smoke routes and active test expectations as part of Plan 52. Keep historical evidence immutable or clearly archived as old-policy, never relabel an old pass as new validation. No hidden reliance on fixture JSON edited by hand.

## Implementation boundary and unresolved decisions

Plan 51 owns the contract, unmounted pure scheduler intended for direct production use, and headless traces/calibration. Plan 52 is the single writer for the coordinated production port, including the current Ren implementation. Plan 46 is held at its committed baseline for scheduler-dependent work; its art, dialogue and lifecycle evidence are preserved, not automatically discarded or declared owner-accepted. Plan 43 remains an independent report-local music study; Plan 48 gigs waits for the new scheduler.

Plan51 closed as a bounded unmounted study. Subsequent Plan52 owner selections above settle the working financial contract; root clears the exact production seam in reports/orchestration/plan-52-production-clearance.md. Final balance, integrated experience, new-policy replay/checkpoints and production acceptance remain gated. The study's unresolved-crisis stop cannot ship as a softlock. No weekends, third rent, new gigs, large housing-art branch or production soundtrack is selected. See DECISION-073/075.

Development startup now uses the five-slot policy and recognizes earlier development saves as unsupported, with explicit preservation or replacement choices. This mounted behavior has bounded Day 1 and save-transition evidence; the broader finance, social, checkpoint and lifecycle review remains open under Plan 52. Do not add isolated phase-name workarounds or a second scheduler.
