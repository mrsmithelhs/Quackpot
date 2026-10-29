---
id: plan-34
title: Weather runtime extraction without mounting
status: in-progress

depends_on: [plan-26]
gate: "Owner authorizes extraction assignment after Plan26 investigation closure; root reviews exact contract and delivery. Mounting remains a separate packet."
summary: >-
  Extract accepted weather still/motion and bright lightning into tested unmounted
  source modules, preserving the art kit and current game behavior.
---
# Plan 34: Weather runtime extraction without mounting

## Packet Metadata

- Packet id: plan-34
- Packet title: Weather runtime extraction without mounting
- Status: (see frontmatter)
- Owner/model: new Codex implementation thread (owner assignment2026-10-28); one writer
- Date: 2026-10-28
- Packet type: extraction / feature helpers
- Mutation level: new unmounted source modules and explicit test-list update
- Approval gate: owner assignment, root API/contract review, root delivery acceptance
- Depends on: Plan26 investigation closure; device/production mounting gates carried separately

## Goal and authority

Adopt the Plan26 E1 proposal as a bounded extraction, not a live feature. Required references: AGENTS, decision log, packet index, repo structure, Plan26 stage-e-proposal.md, stage-e1-packet-draft.md, interface/mechanism/progress and root StageC/D reviews. Run check plan-34 before starting; stop if blocked. Draft is not assignment authority.

Owner assignment2026-10-28 adopts R1–R4: extraction/mount split, wrapper beside kit (optionA), flat focused weather UI modules, bounded process validation. D8: bright only in runtime because that is the owner-selected look; restrained comparison stays report-only. Owner may select an intensity alternative later. No extra brightness vote required. R5 and D1–D7 concern mounting and remain unresolved. Use reports/orchestration/plan-34-codex-starting-handoff.md; one post-main-implementation read-only Terra-medium review is authorized, not preproposal/repeatedrepair consultations.

## Exact ownership

| Study source | New source | Boundary |
|---|---|---|
| animation/arbiter.mjs | src/ui/weather-flash-arbiter.mjs | unchanged logic, injected page owner |
| animation/rain-motion.mjs | src/ui/weather-rain-spec.mjs | selected art/speeds/constants |
| animation/controller.mjs | src/ui/weather-motion-controller.mjs | explicit policy changes below only |
| animation/lightning-bright.mjs | src/ui/weather-lightning-effect.mjs | selected curve, cleanup and colors |
| study/weather.mjs + minimum required helpers | src/assets/apartment-weather/layers.mjs + README.md | weather-only wrapper, no sunlight/daylight feature |
| applicable runtime tests/fake DOM | focused weather tests beside modules + test-only helper | preserve behavior assertions; no report measurement tools |

One explicit package.json test-list edit permitted. Own new reports/development/plan-34-weather-runtime-extraction/ for evidence/progress. Art kit, existing views/main/settings/globalCSS/core/log/storage and accepted Plan25 remain read-only. Report galleries/measurement tools/red tracker/benchmarks not promoted. No runtime import from reports. Tests may read frozen references under reports as development evidence, never production.

## Required contract checkpoint

Before source writes return exact export signatures, layer-anchor map, minimal helper list and test-only file locations for root approval. Don't import the study scaffold wholesale. Snapshot baseline app build hashes before changes using bounded build only after assignment.

Weather wrapper is pure, deterministic, caller-scoped IDs, no module state/timers/network/filesystem. Compatible defaults return exact plain kit output. Validate requested/effective options. Stage insertion off-DOM atomically: missing/ambiguous anchor returns original plain scene and structured diagnostic; never partially decorated SVG. Build/test time pin or anchor checks fail loudly on incompatible kit; runtime requires no git/hash-file access. Pin is integration evidence, not a claim it can never evolve. Preserve duck/lamp nodes; whole-scene flash can illuminate them as selected, not mutate anatomy.

Introduce versioned stable data-weather roles in wrapper/controller together, tested against REAL production kit output. No kit mutation. Existing pane clip/lighting order/ID references preserved. Describe unsupported area/framing fallback honestly; weather initially living-room only.

## Controller policy changes

- Missing IO or unavailable required motion support -> static still, no flash; pending visibility starts blocked, glass-only conservative gate.
- flashEnabled defaults false, separate budget-free flash-off refusal; never inferred from rain on.
- Explicit setMotionEnabled/setFlashEnabled plus pause/resume/setActive/subscribe/idempotentdestroy; disabling motion also refuses flash. No timers scheduling idle weather or flashes.
- Preserve reduced preference live updates, independent blockers, hidden/offscreen behavior, cancellation-to-neutral/no stale resume, accepted/cancelled effect-start failures and watchdog reason.
- One host-created injected arbiter >=4000ms start-to-start, no reset perview, no arbiter -> refusal. Nothing is mounted or instantiated by current app.

## Validation

Port runtime tests, including exception injection, shared budget, restored DOM, pending visibility and policy changes. Add real-kit adapter/ID/layer contract tests. Preserve constants via comparison to frozen accepted reference. Treat original scene nodes vs composited pixels honestly. Include two instances and missing-anchor atomic fallback.

Serial established bounded launcher only:1GiBheap/2GiBsampledprivate/90s/shortoutput. Exact focused file list, no watcher/mutation/full-suite sweep. Record tests newly added to npm test; do NOT execute full npm test or legacy browser smoke absent separate approval (this supersedes draft contradictory wording). Stop first failure/report diagnosed correction before retry. Standard approved execution for isolated Chrome if a report-local witness is needed; no ownerstorage/serverrestart, source/browser coordination required.

Record before/after production build hashes/size and import-graph check from main: new helpers/tests must be unreachable from shipping entry. New modules may import each other and tests may import them; don't assert literally no file imports them. If unchanged build differs, explain exact cause rather than claiming behavioral equality from size. Production-scene lifecycle/flash measurements and StageD matrix belong E2; an E1 report-local real-kit witness is allowed only if proposed and separately root-cleared. No monkey-patching production for a screenshot.

## Stop and deliver

Stop for kit edits, new runtime consumers/settings/saves/logging, visual retuning, extra rooms/audio/sunlight, dependency installation, unmatched anchors or unexpected resource growth. One read-only Terra-medium pre-delivery review may be separately granted by root after implementation; none assumed for proposal. No nested subagents/generation budget.

Commit explicit owned source/evidence and progress last, no status/push/deploy. Return scoped diff, exact commands/results, no-mount proof, API/fallback/limits and readiness. E2 needs separate selected surface/story triggers/preferences/Receipt treatment/credits and device acceptance criteria. In particular decorative weather outside log is not blanket permission to omit a future manipulation cue if one is adopted. Unavailable teacher/slowermachine/OS/true-speed human viewing results remain pending pre-mount criteria; code extraction does not waive them.
