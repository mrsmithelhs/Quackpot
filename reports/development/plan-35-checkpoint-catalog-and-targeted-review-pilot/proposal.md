# Plan 35 mechanism proposal — checkpoint catalog and targeted review pilot

**Gate:** Root approved the three starts, ownership, and finale-rest pilot on 2026-10-29. Root has since cleared and received the bounded helper validation recorded in `progress.md`. Fixture capture remains separately gated; the single next capture command proposed below has not been cleared or run.

## Recommended mechanism

Use a small development-only wrapper around the audited Plan 16 lifecycle patterns. Keep Plan 16's closed report artifacts immutable. Do not extract a generic automation framework or change production code. The new loader will validate and hydrate complete existing save envelopes, then inject the unchanged serialized envelope into a fresh isolated browser context through the ordinary application restore path. It will never patch state, append log events, alter RNG, or import report files from runtime code.

Treat all three assigned new starts as **captured/replayable**, not generated/reproducible. Their route setup uses actual mounted UI actions and captures an autosaved whole envelope at the stated pre-action boundary. The recipe documents how the original capture was reached; replay means exact-byte fixture load plus real continuation actions, not a claim that repeating the entire UI journey recreates identical display-event history. The two existing Plan 16 starts keep their original identities and classes: pending-reveal is generated under its historical recipe and currently stale for that recipe identity; starter-offer is captured/replayable under its immutable exact-byte and archive provenance. Neither is promoted to a newly validated fixture by inclusion in this catalog.

## Proposed owned files

New tooling and catalog files, all subject to root approval:

- `scripts/dev/checkpoints/catalog.json` — catalog entries for the two Plan 16 references and up to three Plan 35 starts; class, exact artifact path/hash/bytes, original capture recipe/source, current validator identity, route boundary, mounted prehistory, expected next boundary, served-source closure, and explicit status/limits.
- `scripts/dev/checkpoints/provenance.mjs` — exact-byte/size checks, catalog path containment, current production-source closure fingerprint, and independent Plan 16 archive-index pin verification. Read metadata/size before reading a fixture; reject over-cap files before allocating/parsing them.
- `scripts/dev/checkpoints/envelope.mjs` — small shared wrapper for existing `validateSave()` and `GameEngine.fromEnvelope()` hydrate/serialize validation, boundary assertions, and negative controls. No copied engine logic or validator changes.
- `scripts/dev/checkpoints/checkpoint-proof.mjs` — offline verification CLI for historical references and captured Plan 35 fixtures; bounded to one checkpoint/phase per invocation.
- `scripts/dev/checkpoints/cdp.mjs` — shared minimal Chrome DevTools client, isolated profile/context, pointer hit-testing, and owned cleanup helpers used by the browser phase.
- `scripts/dev/checkpoints/browser-phase.mjs` — one mounted phase implementation with explicit `capture` versus `pilot` modes, ordinary localStorage restore, hit-tested pointer actions, before/after envelope observation, and storage-context isolation.
- `scripts/dev/checkpoints/run-controlled-phase.mjs` — one-phase owned Vite/browser supervisor adapted from Plan 16's lifecycle pattern, calling the shared phase module; strict port, finite served-file hashes, fresh temporary profile/context, bounded output/deadlines, source-before/after identity, owned-child cleanup, explicit residual/uncertainty evidence. It must fail if the port is occupied and never kill unrelated processes. A newly written fixture stays `capture-pending-cleanup` until the owned browser cleanup is confirmed; only then can catalog status become `current-loadable`.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/rent-paid-zero.save.json` — captured pre-pay rent-due envelope; tracked only if privacy/size review passes.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/rent-unpaid-escalation.save.json` — captured pre-pay rent-due envelope; same tracking gate.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/finale-race-entry.save.json` — captured day-three race-entry envelope; same tracking gate.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/review-briefs/paid-vs-unpaid-rent.md` — pilot brief 1.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/review-briefs/finale-rest-selection.md` — root-selected pilot brief 2.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/pilot-results.jsonl` — append-only observations bound to fixture/source/loader/brief hashes.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/controlled-pilot-results.jsonl` — append-only process, served-response, timing, and cleanup evidence.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/progress.md` — final scoped progress report, written/committed last.

Do not modify Plan 16/25 sources, `src/`, `package*.json`, save validation/hydration, packet status/index, global workflow/agent rules, owner records, or Plan 32 audio/intake files. No runtime route, published loader, dependency, full-start smoke, full suite, or reviewer swarm is proposed.

## Route recipes and mounted boundaries

Precondition for each capture: reuse Plan 16's immutable starter fixture and its known completed first-race/roster/Down history wherever the current production source closure matches that capture. Confirm the exact closure before loading it. Rent fixtures branch from this saved starter through the mounted buy/decline control; the finale fixture branches from a rent start through the real rent/zero-cash choices and ordinary day-three transition. Record the capture origin and every mounted action. Do not make a broad browser seed search. If a desired state is not reachable from the pinned starter under current source, stop and propose one separately bounded **engine-only** seed search for root approval before running it. Do not edit race history, balances, owned roster, Down inventory, rest counters, or displayed-event records to force a candidate.

| New start | Controller recipe and checkpoint boundary | Required captured facts / next real transition |
|---|---|---|
| `plan35.rent-paid-zero.v1` | Load the exact Plan 16 starter fixture in a fresh isolated context, after source-closure verification. Use the actual decline control. Stop at mounted `d2_afternoon_rent`, before pressing Pay. Map the capture origin to Plan 16's recorded mounted route and the branch to `src/main.js`'s starter callback / `GameEngine.declineStarterPack()`. | $15 cash at rent-entry; do **not** claim `expense_due`, active bill, or rent modal already exists. `src/main.js` renders the rent page first; clicking Pay calls `billExpense('rent', 15.00)`, which appends `expense_due` and then either `expense_paid` or an actual escalation. Pilot presses Pay once and observes the real solvent result: bill settled, $0 cash, no unpaid active bill/debt, and actual zero-cash prompt. |
| `plan35.rent-unpaid-escalation.v1` | Load the same exact Plan 16 starter fixture in a separate fresh context. Use the actual buy control. Stop at mounted `d2_afternoon_rent`, before pressing Pay. Map the branch to `GameEngine.buyStarterPack()` and the controller's day-two transition. | $14.01 cash and actual starter purchase/gem history at rent-entry; no rent `expense_due` or active rent bill yet. Pilot presses Pay once and observes the actual `expense_due`, unpaid active bill, and escalation choices/state. No synthetic debt or forced terminal path. |
| `plan35.finale-race-entry.v1` | Load the already verified $15 rent-start fixture in a fresh context. Press actual Pay, choose the real zero-cash Continue action, and proceed through the controller's day-three transition to mounted `d3_midday_race`, before submitting the second-race form. Preserve the complete first-race history from the Plan 16 starter prehistory. | Preserve actual first-race identity/result/history, roster, rest, Down/trial state and offered race choices. Record actual rendered choice selection and effective-rating information. Selecting a duck/stance in the form is UI-only until submit; do not require a new `race_choice` event or engine-state write at this boundary. Do not submit the second race for this pilot. |

The two rent captures intentionally sit **before** Pay so the browser pilot observes the real `expense_due` transition and resulting outcome. A rent-entry envelope is not described as having an active bill/modal. A saved pre-bill state that cannot restore to the correct mounted rent UI is not usable; stop rather than changing the boundary to a post-action snapshot. Finale entry has UI-only controller context risk: verify ordinary restore recreates the race-entry screen and offered-choice lifecycle. If the serialized envelope omits required context or current restore does not render it faithfully, report that obstacle for root review.

## Provenance, loading, freshness, and size rules

- Every fixture is the complete ordinary schema envelope: state, all four RNG streams, append-only log, race resolutions and recorded UI/display events. Run existing production `validateSave()` and `GameEngine.fromEnvelope()`/round-trip checks without altering validators.
- Record exact fixture SHA-256 and byte count; checkpoint id/version; schema; boundary fields; seed (where known); mounted capture actions and source callback/method map; scripted prehistory label; capture time; source revision and complete relevant source-file closure hashes; controller recipe bytes/hash; current loader/tool hash; observed UI boundary and expected continuation deltas.
- Keep `captureSourceFingerprint`, `captureRecipeFingerprint`, `loaderValidationFingerprint`, and `currentProductionSourceFingerprint` separate. Never rebind an old fixture to a current recipe hash. Current fixture validation becomes stale if its pinned production source closure or loader identity changes; require explicit revalidation/recapture review, never automatic hash rebinding.
- For each Plan 16 entry preserve its original manifest/provenance and archive-index pin. Catalog status separates `historical-reference` from `current-loadable`. Pending-reveal remains a historical generated reference and stale for current generated use. Starter-offer is a captured historical reference; its exact bytes remain SHA-256 `e6a4de779d350fb249b3a95071d81b42008495bc52cba40d487b2cd95b2508d9`, with original single-capture recipe fingerprint `cb318662122d8e18289c3d30d668971e949809aca8678cf77d4e5ae996ab4185`, repaired Plan 16 loader fingerprint `004ea7783a308c1baa8ec008c2d6013d549aff77fde31b70bd27f30d5be44556`, and independently pinned archive index. It may be a Plan 35 capture parent only if the **current production source closure matches** its pinned source closure. Do not suggest that browser branches were rerun under the repaired loader; the archive guard was checked offline.
- Exact-byte captured loading is authoritative for these classes. No semantic regeneration claim is made. If a future generated class is proposed, strict equality excludes only top-level `savedAt`, preserving all other fields/events/hash chains and all RNG streams.
- Default fixture tracking cap: 1 MiB per save and 2 MiB total for the three new saves; inspect synthetic data for accidental personal/student data before tracking. If a fixture exceeds either cap, do not truncate or strip history; report hash/size and ask root to approve a storage/provenance alternative.
- Isolated browser storage starts empty except for the one chosen checkpoint envelope. Before load, write a distinct ordinary-save sentinel under the app's normal key in a second isolated context; verify it remains byte-identical and never access the owner's browser/profile. Load only by the normal restore path, and prove the loaded autosave matches the fixture before interactions.

## Focused validation and negative controls

Preflight each fixture offline: exact bytes/hash, catalog-to-path agreement, provenance/index pins, current source closure, full production validation, hydration and serialization round trip, valid event chain, every RNG snapshot, and named mounted boundary. Reject: one-byte fixture mutation; stale source hash; stale capture recipe identity; stale loader hash; malformed/truncated JSON; invalid schema/envelope; log-chain mutation; missing/changed RNG stream; wrong step/modal/phase; wrong cash/bill amount; false finale race count; archive index mutation (including coordinated archive file/index edit when Plan 16 archive is loaded). No control may weaken or alter the production validator.

For actual pilot actions record before/after envelope hashes, exact action route, visible text and hit-tested target, exact event-log delta and chain heads, state/economy/race delta, engine RNG deltas, displayed cue records, screenshot only where needed, viewport, action count, elapsed setup/continuation time, and cleanup. Finale's one action is a rendered form selection only: record the selected card/stance from the live DOM and expected unchanged engine envelope; do not infer an engine `race_choice` event before form submit. Distinguish mechanical outcomes from actually displayed evidence. The first failed validation stops the batch; preserve a bounded candidate and exact differing fields when diagnosis needs one, never only the error line.

## Two pilot briefs

### Brief 1 — paid versus unpaid rent

Run two independent fresh contexts, one for each rent checkpoint. Inspect the actual rent presentation before action; perform one real Pay action in each. Compare only the specified outcome: paid route ends at $0 with a settled bill and no unpaid active bill/debt; unpaid route retains the bill and displays/records the actual escalation options. Capture visible wording, actual button hit-test, state/log deltas, and whether the paired starts made the comparison easier to set up. No extra shift, couch sale, or later Receipt route in this brief. Stop on a boundary mismatch, unexpected amount, missing visible control, or cleanup uncertainty.

### Brief 2 — finale rest selection

From `finale-race-entry`, record actual roster/rest/effective-rating/offered choice, then select one legal duck in the rendered form without submitting. Confirm the rendered selection and unchanged engine state/RNG. A real `race_choice_offered` exposure record may be appended by the mounted view callback; record it exactly. No `action/race_choice` is expected until a real submit, which is outside this pilot. If the captured route lacks naturally rested/fatigued contrast, mark that comparison unverified and stop rather than altering history.

The brief makes one reviewer action after restore; route-preparation actions are documented and excluded from pilot interaction counts. No Stay/repeat-Uninstall or exit/Receipt branch is included in this pilot.

## First proposed syntax, offline, and single-capture batch (attempted; superseded below)

The lifecycle helper's bounded checks have passed and are recorded in `progress.md`. No checkpoint fixture has been captured. The next proposal is one serial batch for only `capture-rent-paid-zero`; it awaits root source review and separate clearance. Take one fresh `Get-Process -Name node` preflight before the batch. Every Node command remains under the unchanged Plan 25 wrapper (1 GiB Node heap, 2 GiB sampled owned-tree stop, 90-second outer limit).

```powershell
# Syntax checks for the scoped capture repairs.
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','scripts/dev/checkpoints/envelope.mjs')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','scripts/dev/checkpoints/browser-phase.mjs')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','scripts/dev/checkpoints/run-controlled-phase.mjs')

# Offline loader/source and exact Plan 16 starter reference checks.
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','loader-identity')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','reference','qp16.starter-offer.v1')

# Sole next mounted capture proposed for separate root review.
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/run-controlled-phase.mjs','capture-rent-paid-zero')
```

The capture route is the mounted starter decline to the ordinary `d2_afternoon_rent` screen at $15.00 before Pay. Before writing any candidate, capture runs `assertCatalogBoundary` against the exact catalog entry; both rent entries name `phase: playing` and `activeBill: null`, and the shared assertion also forbids a pre-Pay rent `expense_due`. The capture creates the pilot's second isolated context and writes its ordinary save sentinel before loading the fixture in the separate capture context, then verifies the sentinel's exact bytes remain unchanged.

The candidate remains `capture-pending-cleanup` after the browser proof closes Chrome. Only the supervisor success path may promote it, after it verifies the complete successful proof record and sentinel evidence, unchanged source identity before/after the phase and after owned-process cleanup, proof/Vite full-tree cleanup, and the exact fixture hash/catalog status. It atomically promotes only that matching pending candidate. A failed route, source check, proof, Chrome cleanup, Vite cleanup, deadline, or hash/status check leaves the candidate pending.

This is a proposed batch only; no syntax/offline/capture command listed here has run. The other two captures and both pilot briefs remain later, separately reviewed phases.
## Ownership lifecycle probe (bounded helper run complete; capture remains gated)

Root redirected this focused helper check away from proving orphan persistence. The root-reviewed helper command completed all four cases; exact results and source hashes are in `progress.md`. The probe validates the exact PID-plus-creation comparator while a controlled root is known live, then reports what is sampled for retained child identities after the actual root exit. It does not assume the platform must preserve a child after parent exit.

Each controlled root uses one bounded JSON `ready` record over stdout and an explicit stdin `release` signal, with a fixed 8-second fallback exit. The parent-early-exit root spawns the existing 8.5-second naturally terminating child, emits its PID, and remains held until release or fallback. After `monitor.ready`, the probe takes a live tree snapshot and requires the root identity to round-trip through the normal `inspectOwnedIdentities` / `-OwnedJson` path before releasing the root. In the parent-exit case it records each exact retained child PID plus creation time as `live` or `absent` at the first post-exit query, classifying the sample as `surviving-descendant-observed` or `no-survivor-observed-in-this-environment`. The latter is not evidence that an orphan was cleaned up or even survived. If any retained identity is live at the first query, bounded independent queries continue until those exact identities are absent or the case deadline; no PID-only diagnostic grants ownership or cleanup.

The four serial cases remain normal exit, parent-exit observation, guarded startup failure, and invalid-root inspection failure. Initial monitor/inspection failures remain sticky. No process is killed by PID; on a harness assertion failure, only the directly owned root `ChildProcess` handle may be signaled. Each case remains bounded at 13 seconds, active work at 40 seconds, with a 10-second cleanup reserve (50-second maximum); the wrapper remains capped at 1 GiB Node heap, 2 GiB sampled owned-tree, and 90 seconds outer. Ready output is capped at 1 KiB; final JSON at 8 KiB. This check does not establish browser/launcher shutdown or cleanup of a surviving orphan when no survivor is observed. No timers were extended, no detached flags or persistent watchers were added, and no server, Vite, browser, network, capture, or checkpoint fixture is involved.

The intended child was absent at the first post-root-exit query, so the result was `no-survivor-observed-in-this-environment`. Other retained descendant identities were also absent at that sample. This is not evidence that an orphan was cleaned up or that the intended child survived the parent. The CDP/launcher, forced-termination, and mid-run CIM outage limitations still apply.

## Next single mounted capture proposed for separate root review

The first proposed capture is only `capture-rent-paid-zero`: load the pinned Plan 16 starter in a fresh isolated context, use the real decline action, and capture at `d2_afternoon_rent` with $15.00 before pressing Pay. Exact route and evidence requirements remain in the route table above. Its single exact command appears in the command block above for root to review against the capture source. The other two capture routes and both pilot briefs remain later, separately reviewed phases; no additional mounted command is proposed in this handoff. This is not authorization to run the proposed command; no capture, fixture write, Vite server, or browser launch has occurred.
## Review disposition requested

Root has approved the three captured/replayable starts, folder ownership, and finale-rest pilot. Remaining clearance is for authored tooling/files and exact later commands. Existing Plan 16 entries are historical references; current usability must be computed from exact current source closure and catalog status. Preserve the current Plan 32 untracked audio preview tree untouched.

## Amendment — failed first capture, compact proof repair, and exact next batch

The prior block records the first authorized attempt and is no longer the proposed next batch. Its one mounted `capture-rent-paid-zero` phase reached the requested mounted rent screen and wrote a 170,013-byte candidate, but the supervisor rejected the oversized proof stdout at 12,288 bytes before promotion. Root clarified that the supervisor's earlier `residual=true` label arose from inability to parse/confirm the proof and did not demonstrate a browser survivor. The exact failed candidate, catalog snapshot, provenance and logs are preserved at `attempts/attempt-01/`; the live catalog entry is `not-captured`. The old candidate is not current-loadable and must never be relabelled under the changed recipe.

Source repair in commit `65dd2e5` (with one follow-up residual/unknown classification correction to be committed before progress) has the browser phase append the full evidence record to the bounded report log and emit a compact JSON summary capped at 4 KiB. The summary contains phase; candidate and capture IDs/hashes/status; sentinel before/after hashes and preserved flag; Chrome residual/uncertainty, exit, tree-termination and profile-removal fields; and the exact full-log record path/byte count/SHA-256. The supervisor pins and verifies that full record and cross-checks it against the summary before setting `summaryValidated`. The full record retains source-map/provenance/event detail on disk. Cleanup reporting treats an exited proof process without a valid cleanup summary as **unknown/uncertain**, not as a confirmed residual process; only a live process or an observed surviving descendant is reported as residual. The capture helper's cleanup result is the same summary checked by the supervisor.

### Exact proposed next batch — root review and separate clearance required

No syntax check, loader/reference check, runtime phase, server, browser, capture, or pilot has run against the repair. First review the source diff and confirm the exact commands below. If cleared, take fresh preflight samples for `Get-Process -Name node` and whether port 5181 has a listener; stop before the batch if either is occupied. Run each command serially through the unchanged Plan 25 bounded runner:

```powershell
# Syntax checks for both changed capture-path files.
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','scripts/dev/checkpoints/browser-phase.mjs')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','scripts/dev/checkpoints/run-controlled-phase.mjs')

# Offline loader identity and exact Plan 16 starter reference.
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','loader-identity')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','reference','qp16.starter-offer.v1')

# At most this one new-recipe mounted capture in the batch.
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/run-controlled-phase.mjs','capture-rent-paid-zero')
```

Do not proceed to either other capture or either pilot until root reviews this batch's evidence and separately clears the next phase. No production/status/workflow change is part of this repair.
