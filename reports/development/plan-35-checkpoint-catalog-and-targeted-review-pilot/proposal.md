# Plan 35 mechanism proposal — checkpoint catalog and targeted review pilot

**Gate:** Proposal only. No tooling, fixtures, generation, or browser work is authorized until root approves the mechanism and exact execution scope.

## Recommended mechanism

Use a small development-only wrapper around the audited Plan 16 lifecycle patterns. Keep Plan 16's closed report artifacts immutable. Do not extract a generic automation framework or change production code. The new loader will validate and hydrate complete existing save envelopes, then inject the unchanged serialized envelope into a fresh isolated browser context through the ordinary application restore path. It will never patch state, append log events, alter RNG, or import report files from runtime code.

Treat all three assigned new starts as **captured/replayable**, not generated/reproducible. Their route setup uses actual mounted UI actions and captures an autosaved whole envelope at the stated pre-action boundary. The recipe documents how the original capture was reached; replay means exact-byte fixture load plus real continuation actions, not a claim that repeating the entire UI journey recreates identical display-event history. The two existing Plan 16 starts keep their original identities and classes: pending-reveal is generated under its historical recipe and currently stale for that recipe identity; starter-offer is captured/replayable under its immutable exact-byte and archive provenance. Neither is promoted to a newly validated fixture by inclusion in this catalog.

## Proposed owned files

New tooling and catalog files, all subject to root approval:

- `scripts/dev/checkpoints/catalog.json` — catalog entries for the two Plan 16 references and up to three Plan 35 starts; class, exact artifact path/hash/bytes, original capture recipe/source, current validator identity, route boundary, mounted prehistory, expected next boundary, served-source closure, and explicit status/limits.
- `scripts/dev/checkpoints/checkpoint-proof.mjs` — bounded fixture preflight/load/continuation proof. Reuse the Plan 16 production-save validation, complete envelope, exact-byte, archive-pin, and isolated ordinary-save sentinel patterns through thin wrappers; do not copy unrelated scenario code.
- `scripts/dev/checkpoints/run-controlled-pilot.mjs` — one-phase owned Vite/browser supervisor adapted from Plan 16's lifecycle helper: strict port, finite served-file hashing, fresh temporary profile/context, bounded output and deadlines, source-before/after identity, owned-child cleanup and explicit residual/uncertainty evidence. It must fail if the port is occupied and never kill unrelated processes.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/rent-paid-zero.save.json` — captured pre-pay rent-due envelope; tracked only if privacy/size review passes.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/rent-unpaid-escalation.save.json` — captured pre-pay rent-due envelope; same tracking gate.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/checkpoints/finale-race-entry.save.json` — captured day-three race-entry envelope; same tracking gate.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/review-briefs/paid-vs-unpaid-rent.md` — pilot brief 1.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/review-briefs/finale-rest-or-exit-receipt.md` — pilot brief 2, one selected path only; see below.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/pilot-results.jsonl` — append-only observations bound to fixture/source/loader/brief hashes.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/controlled-pilot-results.jsonl` — append-only process, served-response, timing, and cleanup evidence.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/progress.md` — final scoped progress report, written/committed last.

Do not modify Plan 16/25 sources, `src/`, `package*.json`, save validation/hydration, packet status/index, global workflow/agent rules, owner records, or Plan 32 audio/intake files. No runtime route, published loader, dependency, full-start smoke, full suite, or reviewer swarm is proposed.

## Route recipes and mounted boundaries

Precondition for each capture: use a new named synthetic seed and a clean temporary browser profile; capture only after the UI transition has autosaved and the normal route visibly matches the envelope. A seed search, if necessary to obtain a desired genuine race identity/rest state, is capped at 128 candidates and must use the production controller/race path. Record each tried seed and outcome in a bounded search record. Do not edit race history, balances, owned roster, Down inventory, rest counters, or displayed-event records to force a candidate. If no legal candidate is found within the cap, stop and report the obstacle; defer that exact scenario rather than substituting another.

| New start | Controller recipe and checkpoint boundary | Required captured facts / next real transition |
|---|---|---|
| `plan35.rent-paid-zero.v1` | Fresh start → companion setup → promotional 10-pull → reveal/continue using actual controls → decline starter offer → ordinary day-two transitions → stop at `d2_afternoon_rent`, before pressing Pay. Map every action to `src/main.js` callback and `GameEngine` method; do not treat scripted prehistory as reviewer-observed UI. | $15 cash; day 2 rent bill still pending; active bill and modal state exactly as mounted; complete log/RNG envelope. Pilot presses actual Pay once and observes the real solvent result: bill settled, $0 cash, no unpaid active bill/debt, and actual resulting prompt. |
| `plan35.rent-unpaid-escalation.v1` | Same mounted route, but accept the real $0.99 starter offer. Stop at the same pre-pay `d2_afternoon_rent` boundary. | $14.01 cash and actual starter purchase/gem history; bill pending. Pilot presses actual Pay once and observes unpaid active bill and actual escalation choices/state. No synthetic debt or forced terminal path. |
| `plan35.finale-race-entry.v1` | Fresh start through mounted ordinary controls, including an actually resolved life choice, first race entry, real race commit and full playback/settling, day-two transitions, then ordinary day-three breakfast to `d3_midday_race`; stop before second race commit. Use at most 128 named seeds if needed, each run through the same actual controller path. | Preserve the actual first-race identity/result/history, roster, rest, Down/trial state, available race choices and log/RNG streams. Record which rest tiers this naturally reaches. The start is useful even if it does not cover every rest tier. Do not manufacture a third race or extra history. If the state is not persistable/coherent or the required first-race identity is not reachable within the bounded search, defer and report. |

The two rent captures intentionally sit **before** Pay so the browser pilot tests the real modal transition. A saved pre-bill state that cannot restore to the correct mounted rent UI is not usable; stop rather than changing the boundary to a modal snapshot. Finale entry has UI-only controller context risk: verify ordinary restore recreates the race-entry screen and offered-choice lifecycle. If the serialized envelope omits required context or current restore does not render it faithfully, report that obstacle for root review.

## Provenance, loading, freshness, and size rules

- Every fixture is the complete ordinary schema envelope: state, all four RNG streams, append-only log, race resolutions and recorded UI/display events. Run existing production `validateSave()` and `GameEngine.fromEnvelope()`/round-trip checks without altering validators.
- Record exact fixture SHA-256 and byte count; checkpoint id/version; schema; boundary fields; seed (where known); mounted capture actions and source callback/method map; scripted prehistory label; capture time; source revision and complete relevant source-file closure hashes; controller recipe bytes/hash; current loader/tool hash; observed UI boundary and expected continuation deltas.
- Keep `captureSourceFingerprint`, `captureRecipeFingerprint`, `loaderValidationFingerprint`, and `currentProductionSourceFingerprint` separate. Never rebind an old fixture to a current recipe hash. Current fixture validation becomes stale if its pinned production source closure or loader identity changes; require explicit revalidation/recapture review, never automatic hash rebinding.
- For each Plan 16 entry preserve its original manifest/provenance and archive-index pin. Reference the historical pending entry only as historical evidence, with stale-generated-use explicitly rejected by current catalog tooling. Reference the starter bytes with exact SHA-256 `e6a4de779d350fb249b3a95071d81b42008495bc52cba40d487b2cd95b2508d9`, original single-capture provenance, original recipe fingerprint `cb318662122d8e18289c3d30d668971e949809aca8678cf77d4e5ae996ab4185`, current Plan 16 loader fingerprint `004ea7783a308c1baa8ec008c2d6013d549aff77fde31b70bd27f30d5be44556`, and its independently pinned archive index. Do not suggest that browser branches were rerun under the repaired loader; the archive guard was checked offline.
- Exact-byte captured loading is authoritative for these classes. No semantic regeneration claim is made. If a future generated class is proposed, strict equality excludes only top-level `savedAt`, preserving all other fields/events/hash chains and all RNG streams.
- Default fixture tracking cap: 1 MiB per save and 2 MiB total for the three new saves; inspect synthetic data for accidental personal/student data before tracking. If a fixture exceeds either cap, do not truncate or strip history; report hash/size and ask root to approve a storage/provenance alternative.
- Isolated browser storage starts empty except for the one chosen checkpoint envelope. Before load, write a distinct ordinary-save sentinel under the app's normal key in a second isolated context; verify it remains byte-identical and never access the owner's browser/profile. Load only by the normal restore path, and prove the loaded autosave matches the fixture before interactions.

## Focused validation and negative controls

Preflight each fixture offline: exact bytes/hash, catalog-to-path agreement, provenance/index pins, current source closure, full production validation, hydration and serialization round trip, valid event chain, every RNG snapshot, and named mounted boundary. Reject: one-byte fixture mutation; stale source hash; stale capture recipe identity; stale loader hash; malformed/truncated JSON; invalid schema/envelope; log-chain mutation; missing/changed RNG stream; wrong step/modal/phase; wrong cash/bill amount; false finale race count; archive index mutation (including coordinated archive file/index edit when Plan 16 archive is loaded). No control may weaken or alter the production validator.

For actual pilot actions record before/after envelope hashes, exact action route, visible text and hit-tested target, exact event-log delta and chain heads, state/economy/race delta, engine RNG deltas, displayed cue records, screenshot only where needed, viewport, action count, elapsed setup/continuation time, and cleanup. Distinguish mechanical outcomes from actually displayed evidence. The first failed validation stops the batch; preserve a bounded candidate and exact differing fields when diagnosis needs one, never only the error line.

## Two pilot briefs

### Brief 1 — paid versus unpaid rent

Run two independent fresh contexts, one for each rent checkpoint. Inspect the actual rent presentation before action; perform one real Pay action in each. Compare only the specified outcome: paid route ends at $0 with a settled bill and no unpaid active bill/debt; unpaid route retains the bill and displays/records the actual escalation options. Capture visible wording, actual button hit-test, state/log deltas, and whether the paired starts made the comparison easier to set up. No extra shift, couch sale, or later Receipt route in this brief. Stop on a boundary mismatch, unexpected amount, missing visible control, or cleanup uncertainty.

### Brief 2 — finale rest **or** exit/Receipt

Root should choose one bounded branch before execution; recommend the finale-rest branch because the new finale checkpoint directly serves it and avoids a longer, more fragile route. From `finale-race-entry`, record actual roster/rest/effective-rating/offered choice, then make one actual legal race-choice action without committing the second race. Confirm displayed choice and corresponding engine/log boundary; no purchase is required. If the captured route lacks enough naturally rested/ fatigued contrast, mark the visual comparison unverified and stop rather than altering history.

Alternative if root prefers the exit/Receipt pilot: use the existing immutable Plan 16 starter checkpoint, load exact bytes into a separate context, then actual starter decline → continue only through already-supported ordinary actions to Uninstall → Leave → genuine terminal/`receipt_shown` Receipt. This is a proposed longer derived route, not existing verified evidence for Receipt. Do not claim Plan 16 already proved it. A no-race early exit cannot stand in for a two-race normal-completion Receipt.

The brief makes at most one or two reviewer actions after restore; route-preparation actions are documented and excluded from pilot interaction counts. No Stay/repeat-Uninstall in this two-brief pilot; it remains proposed/unverified unless separately approved.

## Proposed exact commands (root clearance required)

No command below has been run for Plan 35. Run commands serially, only after root approves each exact phase and the bounded runner design. First inspect processes/resource state once; do not kill unknown processes or repeat empty checks. Every Node phase uses the existing Plan 25 wrapper (1 GiB Node heap, 2 GiB sampled owned-tree private-byte stop, 90-second outer limit):

```powershell
# After root clearance: one syntax/contract preflight only
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','scripts/dev/checkpoints/checkpoint-proof.mjs')

# After root clears the fixture capture and browser phase: one phase at a time
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/run-controlled-pilot.mjs','rent-paid-zero')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/run-controlled-pilot.mjs','rent-unpaid-escalation')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/run-controlled-pilot.mjs','finale-rest-choice')

# After each captured artifact is committed, bounded offline verification
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','preflight','rent-paid-zero')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','preflight','rent-unpaid-escalation')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','preflight','finale-race-entry')
```

The wrapper checks `90s` for the whole Node launcher. Plan 16's browser helper reserved cleanup inside its own deadline, but Plan 35's browser route and launcher must be audited and capped before use. Root must approve the exact outer duration/resource budget, seed-search cap, known server/port, Chrome context lifecycle, and any required standard permission review. If the three captures cannot each fit a single bounded phase, propose one revised sequence for root review before splitting or retrying. No npm, build, full suite, watch server, install, packet render, direct Node, or browser command is authorized by this proposal.

## Review disposition requested

Root review requested on: the three captured/replayable classes and mounted recipes; exact tooling/artifact ownership; final choice for pilot brief 2; source-freshness and size policy; Plan 16 evidence references; seed-search and browser resource caps; and exact command authorization. Stop here pending that review. After approval, implement only the approved new `scripts/dev/checkpoints/` helpers and Plan 35 report-folder artifacts; retain the current Plan 32 untracked audio preview tree untouched.
