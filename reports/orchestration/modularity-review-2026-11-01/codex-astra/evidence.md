# Evidence register — independent Codex Astra review

Date: 2026-11-01. Read alongside report.md and modularity-map.md in this directory. Evidence IDs below are used by both documents. Repository paths are relative to **C:/AI/Quackpot** unless linked explicitly. Historical commit references identify historical facts; current-source line anchors apply to the pinned baseline.

## E01 — Scope, versions, independence and execution

- Review baseline: `96c1b964d415f3468f9004a9e53b58accc7bb0ba`, “Record Plan 45 source checkpoint gate.”
- Starting and final observed HEAD: `383765b63f0a188fe889800118515dff8a6f3a0a`, “Prepare independent staged modularity and integration reviews.” `git status --short` returned no entries at startup and at the final source check.
- `git diff --stat 96c1b964d415f3468f9004a9e53b58accc7bb0ba HEAD` showed only the three modularity-review dispatch/brief documents. Application, packet and checkpoint observations at HEAD therefore also apply to the pinned baseline. The other lead's dispatch contents and work were not read or consulted.
- Read the repository AGENTS, source map, documentation hub, design, relevant decision chronology, open questions, packet index, implementer/orchestrator process sections, packet workflow and selected feature artifacts. This was a selective causal review, not an exhaustive audit of every plan or file.
- All repository operations were read-only: `git status/rev-parse/log/show/diff`, `rg`, PowerShell reads, and SHA-256 calculations. Some initial guessed paths did not exist; actual paths were discovered with `rg --files` and then read. No missing-path result was treated as evidence that the feature was absent.
- No Node, tests, build, browser, server, package install, network research, student data, owner storage, or other-chat operations. Consequently no process-memory preflight, bounded launcher execution, browser cleanup or runtime attestation is claimed. Historical executions below belong to their recorded authors, not this review.
- Only review Markdown was written outside the repository. No changes to source, Git index, packet status, commits, saved games or deployment. A clean tracked/untracked status is supporting evidence, not a forensic proof about every ignored byte; the operation log is the primary basis for the no-write claim.

## E02 — Race chronology: correct the delivery boundary

Relevant sources:

- [Decision log](C:/AI/Quackpot/docs/decision-log.md:217), DECISION-022 through 027.
- [Plan23 packet](C:/AI/Quackpot/docs/development/plan-23-production-race-integration.md:47), selected behavior and preserved boundaries.
- [Production review 01](C:/AI/Quackpot/reports/orchestration/plan-23-production-review-01.md:3).
- [Production review 02](C:/AI/Quackpot/reports/orchestration/plan-23-production-review-02.md:5).

The owner selected individual crossing order in DECISION-022, then the latest Plan23 preview at `7a930fb` with root review `7faef93` in DECISION-023. That was a change from the older Plan13 follower-classification model, not an accidental regression. Original production was the earlier one-shot race; a substantially new resolver/playback was intentionally authorized.

To avoid treating later repair instructions as advance knowledge, the lead also read the packet at production-gate commit `57756ff`. It already requires the adopted preview, shared camera projection, preserved start facing/turns, Plan20 paddle/bob/impact motion and presentation/outcome separation. Later repair wording is not the sole basis for saying these requirements were knowable before implementation.

Review01 explicitly says the owner saw **in-progress uncommitted work**, the writer was idle, and there had been no final production handoff or root acceptance. It reports whole-runner rotation affecting labels, missing eased camera and small 1/2/3 podium. This is a corroborated contemporaneous account of integration loss, not a surviving exact source snapshot independently reproduced in this review.

Lead verification materially corrected the helper chronology: `git show 2609032:src/ui/race-view.js` already contains the duck-only orientation layer, shared camera matrix and `[2, 1, 3]` podium mapping. Therefore **do not cite commit2609032 as the source of the earlier missing-camera/rotating-label defects**. They were corrected before that committed delivery. The helper's initial attribution was rejected.

There are independently inspectable subsequent defects/repairs. `git show 7b69e6c -- src/ui/race-view.js src/ui/race-playback-controller.test.mjs scripts/dev/smoke-browser.mjs` shows:

- orientation changed from `180 - raceDuckYaw(...)` to `raceDuckYaw(...)`;
- successful `Race complete.` status removed from the playback start;
- scene-wide dim layer replacing camera-layer-only filtering;
- participant glow made a 2.2-second presentation-time envelope;
- podium markup/result disclosure withheld until reached;
- normal Skip removed and smoke changed from clicking Skip to waiting for natural settlement;
- existing reward/reload/journey checks retained.

DECISION-025 explicitly supersedes earlier approval of normal Skip. Removing that test/control was an authorized changed expectation, not evidence of test manipulation to conceal a regression. New player emphasis/shared pause/timeline organization in DECISION-024 also must be separated from restoration of selected behavior. `0380c4a`/`fabc8e3` repaired timeline/course-clock disagreement after the major presentation repair. Final owner acceptance is DECISION-027, citing source `9d03dcd` and report `712e474`; historical “pending” review dispositions are not current status.

Historical verification limits: Review02 records full suites/builds, a reproduced semantic-save failure and successful repaired probe, plus implementer-observed browser witnesses. Root did not repeat those browser sessions; automated smoke failed before CDP/page setup and final forced reduced-motion browser rendering was absent. The review did not rerun any of these.

## E03 — A semantic-save negative control found what totals missed

Review02 records a valid race envelope mutated only in cached `raceAttempts`: fake duck identity, place6, payout999 and a same-length fabricated finish order. It passed early validation while the append-only result said50Gems. The root reproduced this while165 tests passed. Later validation rejected the altered cache. This is an accidental state/log consistency finding, not an anti-tamper security claim.

Current [storage validation](C:/AI/Quackpot/src/core/storage.mjs:439) reconciles the cache and decoded result. The important lesson is the specific contradictory-cache negative control, not the reported test count. The early failing uncommitted source was not reproduced here; the historical account and current reconciliation are distinguished.

## E04 — Apartment trace: two Plan38 stages, not one mistaken replacement

- [Plan28 selected-mix review06](C:/AI/Quackpot/reports/orchestration/plan-28-selected-mix-review-06.md:3): D20 selected the mix, D21 physical support, D22 missable paid-zero opportunities. Explicit production qualifications say port interaction grammar, not broad report routing; preserve interrupted gacha/race/Receipt states and historical checkpoint provenance.
- [Earlier Plan28 review](C:/AI/Quackpot/reports/orchestration/plan-28-delivery-review.md:7): initial composition was rejected; HUD/Receipt/race surroundings were stand-ins. This is an earlier phase, not proof the final selected mix remained rejected.
- Initial apartment integration `9bf4432`:27 paths, including focused life files, controller, modal and art changes. `git show --stat 9bf4432` provides the footprint. It was largely a presentation port over the older fixed sequence.
- [Owner sequencing review02](C:/AI/Quackpot/reports/orchestration/plan-38-owner-sequencing-review-02.md:3): root explicitly acknowledges overweighting literal prototype preservation. It identifies the fixed script, mismatched clocks, missing ordinary work/evening/Day2 gacha, and acceptance/work/pay/rent conflation. It also authorizes new optional breakfast behavior. Those missing systems were not all previously accepted production features that got deleted.
- New action-based progression was staged through `c266a20`, `ed28b54`, `9d3f9d2`; these are distinct from `9bf4432`. `git show 9d3f9d2:src/ui/life/life-phone-view.js` contains the new flat session menu. Later `e6d15d3` styles/groups it while preserving action keys and the same callback dispatch.
- [Owner repair03](C:/AI/Quackpot/reports/orchestration/plan-38-owner-experience-repair-03.md:3): screenshot feedback on delivered integration—overlapping phone/work targets, dark afternoon, unsupported companion; root confirms existing production gacha/race views downstream. Morning departure is identified as a new owner direction. The temporary fictional installation choice was subsequently replaced by owner-selected LAUNCH reply in DECISION-050; it is not an unexplained deletion.
- Current [controller](C:/AI/Quackpot/src/main.js:328) separately mounts `life_phone`, real `renderGachaView`, real `renderRaceView`, and apartment life. [Phone context](C:/AI/Quackpot/src/ui/life/life-phone-context.mjs:2) drives both screen art and target meaning through its consumers in life-view.

Exact hub repair diff: `git diff e6d15d3^ e6d15d3 -- src/ui/life/life-phone-view.js`. This supports a presentation-quality regression/new-context mismatch, **not wholesale replacement of the accepted reveal theater or race with report mocks**.

## E05 — Small cross-layer repair exposes the actual ownership problem

`git diff 0f9b74d^ 0f9b74d -- src/main.js src/core/game-engine.mjs` shows:

1. Clear `lifePhoneReturnStep` when an engine life intent changes day/phase.
2. Reuse a return destination only when a live session exists.
3. Record hub shop exposure only without Settings/another modal and once per mounted hub visit, resetting on leaving it.

These are distinct engine/navigation/display-evidence concerns coupled by one user action. The repair touched two production files plus a life test and browser witness. It is strong evidence for semantic ownership beyond file ownership; it does not prove today's code has the old defect.

The [hub presentation repair](C:/AI/Quackpot/reports/orchestration/session-hub-presentation-repair.md:3) records14 synthetic component cases, action dispatch/size/overflow checks and captures. Its changed DOM-order expectation reflects intentional grouping. [Viewport repair](C:/AI/Quackpot/reports/orchestration/apartment-viewport-and-plan-40-simplification-review.md:5) says the first witness found11px bottom overflow and added a whole-document assertion. Those are useful measured component checks, not full journey/keyboard/assistive-technology evidence.

## E06 — Less problematic comparison: Plan34

`git show --stat 0b4230f` and `git show --stat eb7b000` confirm focused weather helpers/assets/tests and package test-list changes, without production entry/controller/storage/log/view/global-CSS edits. [Progress](C:/AI/Quackpot/reports/development/plan-34-weather-runtime-extraction/progress.md:7) describes unmounted delivery and later clip-contract repair; owner acceptance is recorded by `7b3fc7d` and current packet/index.

[Layer wrapper](C:/AI/Quackpot/src/assets/apartment-weather/layers.mjs:28) composes around the existing kit and returns explicit clear fallbacks. [Controller](C:/AI/Quackpot/src/ui/weather-motion-controller.mjs:195) has owned cleanup. [Flash arbiter](C:/AI/Quackpot/src/ui/weather-flash-arbiter.mjs:1) is explicitly one-per-page and injected. Source fingerprints and malformed-clip negative cases limit the extraction seam. Historical unchanged build hashes support non-mounting but were not regenerated here. This is a successful bounded extraction, not evidence of successful mounted weather experience or general accessibility certification.

## E07 — Checkpoints: strong provenance, stale source identity

[Catalog](C:/AI/Quackpot/scripts/dev/checkpoints/catalog.json:13) distinguishes historical pending reveal, historical captured starter, and three Plan35 records labelled current-loadable. The latter are two pre-Pay rent branches and finale race entry, all from the older route. No work/evening checkpoint is catalogued.

[Envelope checks](C:/AI/Quackpot/scripts/dev/checkpoints/envelope.mjs:12) use production `validateSave` and `GameEngine.fromEnvelope`, equality beyond savedAt, and schema/RNG/log negatives. [Provenance](C:/AI/Quackpot/scripts/dev/checkpoints/provenance.mjs:116) verifies pinned source identity; current-use checks at335 onward invoke it with `requireCurrent:true`. The loader does not simply trust the label. [Browser phase](C:/AI/Quackpot/scripts/dev/checkpoints/browser-phase.mjs:80) uses ordinary load and mounted actions with temporary contexts and sentinel checks. These source properties are verified by inspection, not a new run.

Lead independently compared every `provenance.sourceFiles` hash in each Plan35 entry with current bytes using PowerShell `Get-FileHash`:

| Checkpoint | Pinned source entries | Mismatches |
|---|---:|---:|
| plan35.rent-paid-zero.v1 |96|20|
| plan35.rent-unpaid-escalation.v1 |96|20|
| plan35.finale-race-entry.v1 |96|20|

Examples include package.json, apartment source/tests and kit-fingerprint tests. This proves exact source mismatch at the reviewed revision. It does **not** prove the saves cannot hydrate, nor constitute running the complete loader. The inspected loader's freshness contract requires matching source identity, so current reuse needs a deliberate new validation/capture disposition rather than relabelling old attestations.

Read-only reproduction from C:/AI/Quackpot:

```powershell
$catalog = Get-Content -Raw scripts/dev/checkpoints/catalog.json | ConvertFrom-Json
foreach ($entry in $catalog.checkpoints.PSObject.Properties) {
  $mismatch = @()
  foreach ($item in $entry.Value.provenance.sourceFiles.PSObject.Properties) {
    $actualHash = (Get-FileHash -LiteralPath $item.Name -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $item.Value) { $mismatch += $item.Name }
  }
  [pscustomobject]@{ checkpoint=$entry.Name; mismatches=$mismatch.Count }
}
```

The [finite served-source list](C:/AI/Quackpot/scripts/dev/checkpoints/run-controlled-phase.mjs:219) omits the newer life module family and expressly disclaims transitive response coverage. Do not interpret it as current full-app identity proof. Root's Plan28 selected-mix review already warned about stale attestations; this is a known maintenance obligation, not a newly discovered broken safeguard.

## E08 — Current coupling and future-policy evidence

- [main.js](C:/AI/Quackpot/src/main.js:54): local route/phone/modal state; render destroy/remount at298; duplicated legacy/new-policy mounts; life command wrapper at700. [Life resolver](C:/AI/Quackpot/src/core/life-progression.mjs:19) is pure; [engine adapter](C:/AI/Quackpot/src/core/game-engine.mjs:156) commits effects/events.
- [Life config](C:/AI/Quackpot/src/core/life-config.mjs:1) requires exact known config; [replay validation](C:/AI/Quackpot/src/core/life-validation.mjs:7) calls the same transition function and compares expected effects/snapshots. Changes to these functions are save/history changes even if UI files are disjoint. This is a compatibility risk to manage, not a reproduced present failure.
- [Receipt view](C:/AI/Quackpot/src/ui/receipt-view.js:11) serializes selected source payloads in details; [projection](C:/AI/Quackpot/src/core/receipt.mjs:384) uses an allowlist. Future Ren public projection must exclude hidden flags from every detailed path as well as summary cards; current hidden Ren flags are not claimed to exist or leak.
- [Plan47](C:/AI/Quackpot/docs/development/plan-47-work-and-evening-production-integration.md:25) already protects real gacha, one phase authority, source ownership, persisted IDs/RNG, display evidence and prior saves. [Plan46](C:/AI/Quackpot/docs/development/plan-46-ren-social-lifecycle-integration.md:49) requires a mechanism proposal; [Plan48](C:/AI/Quackpot/docs/development/plan-48-daily-gigs-and-evening-work-lifecycle.md:37) requires stable offers and serialized core writes. These are safeguards/proposals, not demonstrated integration outcomes.
- Plan40 `storyboard.mjs` is a separate report controller with `scenarioCommitted`; its `integration-recommendation.md` proposes evening resolution and export/tone metadata. Plan47 explicitly rejects importing its mock open-gacha completion or treating unselected numbers as adopted. This is a concrete successful qualification transfer, although final production remains active.
- Current docs/open-questions still calls Plan38 root-cleared for remaining implementation while current packet/index says accepted complete. Docs/README social row still calls Plan45 draft while index says in-progress. These specific stale summaries support incremental reconciliation, not distrust of every record.

## E09 — Helpers and dispositions

Owner-requested lead label: Codex Astra. Independently exposed lead runtime model identity is unavailable in this session; no self-identification is offered as proof.

Three default-role cold children were configured through accepted spawn calls with **gpt-6-luna / high**, no recursive delegation. Tools returned task names but no independent provider/model attestation. All reported read-only inspection and no execution/writes. Paths: `/root/apartment_history`, `/root/race_comparison`, `/root/checkpoint_verification`.

| Helper | Material disposition by lead |
|---|---|
| Apartment | Accepted preserved downstream components, cross-layer context problem and prototype/lifecycle mismatch after source/diff verification. Split initial presentation port from later action-policy integration. Used final selected-mix review rather than treating earlier rejection as final. Corrected return-lifecycle commit to0f9b74d; discarded stray date uncertainty in handback. |
| Race/comparison | Accepted mixed fidelity/owner-refinement diagnosis and bounded Plan34 comparison. Rejected attribution of missing camera/upright-label/podium issues to2609032: its source already fixes them. Reclassified earliest report as uncommitted in-progress evidence. Corrected stale acceptance uncertainty with DECISION-027/current index. |
| Checkpoint | Accepted source-level guarantees/coverage limits after reading actual validator/provenance/catalog. Added independent hash comparison; did not repeat historical executions or claim current runtime loadability. |

No Terra call was made. Another general static review was not warranted after lead verification corrected the material chronology and source claims; no production change was authored. No second wave is requested. Subscription costs, remaining quota and independently verified model identities are unknown and not estimated.
