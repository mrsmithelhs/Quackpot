# Plan 51 — Codex starting handoff

Work in `C:/AI/Quackpot`. You are the engineering lead for **Plan51: Five-slot scheduler contract and calibration**. Owner starts this packet on 2026-11-02. The packet is the work order; this handoff makes the starting gate and coordination explicit.

Read first:

- `C:/AI/Quackpot/AGENTS.md` and `docs/agent-starting-prompts/implementer-prompt.md`.
- `docs/development/plan-51-five-slot-scheduler-and-calibration.md` in full.
- `docs/five-slot-life-schedule.md`, `docs/decision-log.md` DECISION-072, current time/life sections of `docs/founding/design.md`, `docs/README.md`, `docs/open-questions.md`, and the current-source map in `docs/repo-structure.md`.
- `docs/development/plan-52-five-slot-production-transition.md`: your delivery must give that port a real shared authority, concrete calibration choices and a fixture/documentation map.
- Relevant current life/config/engine/validation/simulation code; Plan49 selected integration brief; latest Plan46 progress and its phone/arrival contract; Plan35 checkpoint-generation/validation contracts. Read relevant modules, not all reports indiscriminately.

## Start and first deliverable

Inspect Git status and process/resource use without disturbing others. Every Node command, including packet checks, uses the unchanged `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1`. Run the named `scripts/dev/plan-status.js check 51` through it; stop if blocked. Defaults are 1GiB heap, 2GiB sampled owned-tree memory, 90s wall time. No watcher, broad parallel run, package install, server change or killing unrelated processes. Steady owner Vite/Codex runtimes are not competing validation jobs. If sandbox process inspection is unavailable, say so and use the established normal execution approval rather than assuming no processes exist.

**Your first milestone is one compact mechanism/ownership proposal, not a playable port.** Pin current source/config; map activities and phase/meal/session/obligation callers; propose the pure API/state/events, unresolved owner choices, named traces, resource estimate and exact new files. Send it to orchestration for clearance before shared pure source creation. Keep meaningful experience/value questions for the owner in this chat, with concrete examples and consequences; do not relabel your defaults as owner decisions. After root clears the mechanism, proceed autonomously through bounded coding, debugging and validation to final owner/root review. Do not ask for a fresh relay for every routine command or repair.

## Accepted direction to implement in the unmounted model

- Five slots: **Morning** breakfast → **Midday** scheduled work → **Early Evening** dinner → **Evening** leisure/social/gacha or early bedtime → **Late Evening** normal bedtime or optional active play. Work schedule is data; weekends are not designed here.
- Meals occupy their own slots. One activity occupies one slot. Eating completes promptly; work/social/gacha have durable presentation/progress. A gacha session can contain one pull action (single or ten-pull) plus one race without charging a second slot for its second action. Define exact commit/completion/extension boundaries.
- Reading, navigation, inspecting, messages and browsing/re-entry are free. Future reservations do not consume the current slot. A successful start can reserve the slot before later completion advances it.
- Early-bed extra recovery is an alternative to the Evening activity, not a bonus after a completed Ren visit. Bed after ordinary Evening leisure is normal sleep. Only qualifying active Late Evening play causes the selected fatigue; merely reaching that slot does not.
- Guidance is separate from outcome rules: Day1 guided with the required first tutorial shift; working N=5 means Days2–6 routine confirmations and Day7+ familiar warning fade. Preserve necessary costs/terms, exits and appropriate new/escalated consequence disclosures. Exact supported-period meal withdrawal from an unstarted Ren visit must be specified without fabricated opportunity counts or relationship damage.
- Working baseline: $80 starting cash, $60 completed shift, $6 meal, $170 remaining rent, up to5HP skipped meal. Compare current recovery/fatigue and propose early-bed recovery; do not silently adopt new values. No-cash/no-job/no-gacha progression, obligations, zero HP and interrupted commitments are load-bearing decisions, not reasons to force spending or copy a generic Continue button into production.
- **No old game-save migration, compatibility layer or dual legacy scheduler is required.** Owner has no deployed players. New-policy saves must replay truthfully; old development data must not be silently treated as new or automatically erased. Historical evidence remains historical. Unrelated music/audition choice storage is not part of this waiver.
- Neutrality applies to a failed/canceled **pre-commit operation**, not to an entire interrupted session. Preserve earlier successful purchases/pulls/RNG/outcomes exactly once. Actual displayed warnings and cancellation facts still belong in append-only evidence. Specify interruption/abandonment, not a rollback of real results.

## Ownership and parallel work

You are not alone in the repository. Preserve other work; stage explicit paths and coordinate Git index turns. Never delete `index.lock`.

- Initially own `reports/development/plan-51-five-slot-scheduler-and-calibration/` only. After mechanism clearance, own the agreed unmounted pure subtree (preferred `src/core/life-schedule/`), its tests and bounded `sim/` study. The simulator must import this actual production-intended authority, not an independently rewritten schedule. Report files never become runtime imports.
- Existing live engine/UI/storage/accepted assets remain read-only. **No app mount in Plan51.** Plan52 is the later coordinated production/fixture/documentation port.
- Plan46 confirmed a clean stable baseline: implementation/evidence `0c6874f`, progress `b7755f2`. Whole Ren experience acceptance is pending; selected art/dialogue/lifecycle are preserved inputs. Its scheduler-dependent writes are held. Preserve future invitation reservation, free arrival/open, actual Welcome claiming the activity, once-only capped5HP completion, shown-only unanswered rules, communicated inability/recovery exemptions and factual display/choice evidence. Do not preserve obsolete meal-maintenance guards or old save branches as new requirements.
- Plan43 remains report-local audio work and can continue independently. Plan50 is not an automatic extra test requirement. Plan48 gigs is blocked on Plan52. Do not start new feature implementation or cross-provider calls under those packets.
- The owner has not yet supplied your Codex chat name or granted this new chat its own messaging arrangement. Until that happens, give one concise proposal/milestone relay for QP Orch. Once owner authorizes two-way messaging, send proposal, material owner choices, unexpected risks, gate readiness and final delivery to root proactively; do not silently stop without reporting what you need.

## Validation, review and delivery

Publish named traces and fixed seed/config cohorts before evaluation; no seed filtering or hidden per-route subsidy. Cover normal eating/work/leisure/sleep, early bed, meal/work replaced by gacha, repeated/Late Evening play, unemployment/low cash, rent/recovery/0HP, interrupted social/session progress, and Day1→2 / Day6→7. Separate measured simulation results from assumed reading/scene/race timing; ordinary engaged target remains roughly30+ minutes with no forced waits. Bound/chunk work before execution.

Deliver one compact contract/decision table, actual pure scheduler/interface tests, seeded route ledgers/cohort summaries, adopted versus proposed working values, and Plan52's exact source/fixture/catalog/pin/smoke/documentation map. Do not generate production-valid saves by editing old envelopes; production synthetic refresh belongs to Plan52.

**One read-only Terra-medium pre-delivery subagent review is authorized after substantive implementation**, focused on scheduling, transaction/once-only behavior, simulation fidelity and missing routes. Request `gpt-6.1-terra`, explicit `medium`, default-role child if another role fixes settings. Give a self-contained read-only brief; no nested fan-out or reviewer writes/executions. Record requested/observed identity limits and independently disposition findings. No automatic pre-proposal or repeated repair reviewer. Codex read-only investigation helpers follow AGENTS; bounded implementation stays single-writer. No paid Claude/Gemini consultancy is implied by this handoff.

Update current docs/source map only to reflect selected or actually created unmounted work; root owns decision adoption and packet status. Stop at final contract/calibration review, not production integration. Commit your explicit scoped source/results first and `reports/development/plan-51-five-slot-scheduler-and-calibration/progress.md` last. Never set completion, push or deploy. Final report must state what was actually checked, resource/coverage limits, unresolved decisions and whether Plan52 is genuinely ready to be opened.
