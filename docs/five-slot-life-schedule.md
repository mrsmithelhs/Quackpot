# Five-slot life schedule — accepted direction and transition boundary

Owner accepted 2026-11-02. This is the current forward design, linked from the founding design. **It is not yet the playable scheduler.** Plans 51 and 52 specify/simulate and integrate it respectively. Historical reports and completed packets retain their original evidence; their maintenance-plus-anchor assumptions do not override this direction.

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
- Meal loss is the existing working up-to-5 HP, clamped to actual health, with no meal charge. Work/fatigue/recovery and early-bed values must be simulated and selected. A social cancellation is not automatically equivalent to an uncommunicated broken plan; no new relationship penalty is calibrated by this document.
- This selects no two-slot activity or combined missed-dinner-and-Late-Evening commitment. Different consequences may belong to one actual action, but the scheduler must prove which slot and obligation it displaces; another activity slot requires another deliberate commitment.

## Transaction and interruption boundary

A pre-commit cancellation or failed operation creates no gameplay outcome. Actual displayed cues and player cancellation remain truthful append-only evidence, not a reason to demand an unchanged entire log. Once a start or sub-action succeeds, its slot reservation, purchase, inventory, RNG and event outcomes persist exactly once. Later closing, reloading, interrupting or abandoning a session must not roll them back. Plan51 defines completion/abandonment and obligation timing per activity. Staged destination/slot/consequence writes commit atomically with the specific successful operation, not with an entire future conversation or session.

## Transition authority and no old-save support

Owner clarifies that all current players/saves are development or synthetic. **No old-save migration, dual legacy scheduler, or backward-compatible old-save playback is required for this transition.** New saved runs must still replay/validate faithfully under the new policy. Detect unsupported old development data clearly rather than interpreting it as new state or calling it corrupt; do not erase the owner's browser save automatically. Offer an explicit fresh-run/reset route using existing storage UX where practical. This waiver concerns game run saves/fixtures, not unrelated audio choices, asset provenance or historical reports.

Update/regenerate synthetic game saves, checkpoint catalogs, generator recipes, source/config fingerprints, validations, brief instructions, smoke routes and active test expectations as part of Plan 52. Keep historical evidence immutable or clearly archived as old-policy, never relabel an old pass as new validation. No hidden reliance on fixture JSON edited by hand.

## Implementation boundary and unresolved decisions

Plan 51 owns the contract, unmounted pure scheduler intended for direct production use, and headless traces/calibration. Plan 52 is the single writer for the coordinated production port, including the current Ren implementation. Plan 46 is held at its committed baseline for scheduler-dependent work; its art, dialogue and lifecycle evidence are preserved, not automatically discarded or declared owner-accepted. Plan 43 remains an independent report-local music study; Plan 48 gigs waits for the new scheduler.

Plan 51 must resolve activity availability for no cash/no job/used allowance, slot exit and early sleep, rent/overtime/recovery placement, zero-HP ordering, future-plan and conflict handling, and the supported-period exit. Values and routes not selected above are proposals for owner/root review. No weekends, new endings, new gigs, narrative expansion, deployment or production music adoption follows from this change.

Current code still uses Morning/Afternoon/Evening/lateNight with maintenance meals until Plan 52 lands. Do not fix that mismatch by isolated phase-name replacements or fresh Plan 46 meal workarounds.
