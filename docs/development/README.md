# Development Packets

This folder contains durable handoff packets for bounded agent work.

Packets are assigned to implementer agents. Each packet defines scope, required reading, input files, output files, validation checks, progress-report requirements, stop conditions, and approval gates.

## Packet Index

<!-- plan-index:begin -->
| id | title | status | summary |
|---|---|---|---|
| `plan-01` | Seeded economy and Receipt simulation | complete | Build one reproducible PRNG and a headless model to test pity, economy loops, roster duplicates, and event-log Receipt lifecycle from provisional values. |
| `plan-02` | Static build and Pages deployment spike | complete | Prove a local Vite static build and Pages-compatible output, then propose ratification of the source, asset, simulation, test, and publish folders. |
| `plan-03` | Core mechanism and truthful Receipt slice | complete | Build one playable core-loop path with a meaningful trade-off, local saving, Uninstall and its retention offer, and an event-log-derived honest Receipt. |
| `plan-04` | SVG duck rig and synthesized sound spike | complete | Prove a small layered SVG duck rig and local parameter-synthesized sound without deciding broad art production or music provenance. |
| `plan-05` | Fatigue and pre-race choice investigation | draft | Compare bounded ways fatigue could obscure the one pre-race choice while preserving agency, accessibility, and the reduced-motion information path. |
| `plan-06` | Optional odds-detail investigation | draft | Specify candidate information for an optional odds-detail button without hiding the Receipt's actual pity-adjusted pre-draw odds. |
| `plan-07` | Run-usage export and teacher analyzer investigation | draft | Inspect BrowserBattlegorithms as an authorized rough model and propose a minimal manual export schema plus local multi-file teacher analysis flow. |
| `plan-08` | Duck visual-direction prototypes and owner gallery | complete | A separate Gemini thread generates five visual styles with three shape variants each and builds a local HTML gallery for owner comparison before SVG authoring. |
| `plan-09` | Digital gacha duck motion comparison | complete | Compare short SVG motions on the accepted digital duck rig, with static and reduced-motion alternatives; the physical metagame duck remains inanimate. |
| `plan-10` | Physical metagame duck views and cinematic staging | draft | Investigate static SVG views, lighting and apartment compositions that suggest character in the physical duck, including close-up and zoom quality checks. |
| `plan-11` | Gacha visual compositions before environment and UI assets | draft | Compare paper-style and mixed-style gacha compositions using owner-approved concept generations before committing to environment, effect and UI SVG assets. |
| `plan-12` | Guided opening and progressive shop investigation | complete | Propose an experiential opening that introduces Gems, duplicates and Down in context, and a shop that grows in complexity without an opening lecture. |
| `plan-13` | Race staging and run pacing investigation | in-progress | Compare readable oval-course race drama and camera direction alongside a timed day/run beat map toward the roughly fifteen-minute floor. |
| `plan-14` | Game stage and metagame transitions investigation | complete | Propose a full-width game stage, quieter save/settings controls and readable transitions between apartment metagame and fictional gacha app. |
| `plan-15` | Pull anticipation and bounded local cue investigation | draft | Compare short pull anticipation and graceful fast reveal, then investigate bounded fictional cues responding to local actions with truthful Receipt evidence. |
| `plan-16` | Deterministic review checkpoints and browser briefs | draft | Propose valid engine-generated seeded checkpoints and short review briefs so targeted browser checks can start at the relevant game or metagame beat. |
| `plan-17` | Down exchange and whole-wallet validation | complete | Validate owner-selected Down prices and odd-bundle examples using actual duplicate payouts, pity rules and whole-wallet balances before shop integration. |
| `plan-18` | Local audio sources and credits investigation | delivered | Compare a small set of licensed local sound/music sources and propose opening-screen credits under the owner-approved CC audio policy, without production integration. |
| `plan-19` | Shell A and context-transition integration | complete | Integrate the selected full-width Shell A, quiet settings/save controls and automatic phone entry/animated return into focused production modules. |
| `plan-20` | Digital rig and accepted motion integration | in-progress | Integrate the accepted Mode C digital rig and factor-four motion controller through focused source modules; preserve the physical companion and defer race-event wiring until its mechanics are accepted. |
<!-- plan-index:end -->

## Report Folders

Every packet should leave a report under:

```text
reports/development/<packet-folder>/progress.md
```

Implementers should create the folder if it does not already exist.

## Packet Lifecycle

Status is set in each packet's YAML frontmatter (the only hand-written source). This table is generated by `node scripts/dev/plan-status.js render`.

| Status | Meaning |
|---|---|
| `draft` | Exists; needs review before assignment. |
| `ready` | Can be handed to an implementer, **if `check` passes** (all deps complete). |
| `in-progress` | Assigned and underway. |
| `delivered` | Implementer reports done; awaiting orchestrator verification. |
| `complete` | Orchestrator-verified. Terminal; requires `resolution`. |
| `superseded` | Replaced by a later packet. Terminal; requires `superseded_by` + `resolution`. |
| `parked` | Deliberately deferred. Terminal-until-reopened; requires `resolution` saying why. |

`blocked` is computed, not hand-set: any packet whose `depends_on` are not all `complete` is effectively blocked regardless of its own status. See `node scripts/dev/plan-status.js check <id>`.

## Status Tooling

```
node scripts/dev/plan-status.js list            # all packets + effective status
node scripts/dev/plan-status.js check <id>      # exit 0 + RUNNABLE, or exit 1 + reason
node scripts/dev/plan-status.js lint            # schema violations
node scripts/dev/plan-status.js render          # regenerate this index between markers
node scripts/dev/plan-status.js set <id> <status> [--resolution "…"] [--superseded-by <id>]
                                                # change status + re-render + lint atomically; refuses to write if result won't lint
```

See `docs/workflows/packet-tracking-system.md` for the full system design.

## General Rules

- **Before starting any packet, run `check <id>`.** If it exits nonzero, stop and report.
- Follow the assigned packet exactly.
- Do not broaden scope.
- Use repository truth over memory.
- Stop on judgment decisions, evidence gaps, or validation failures that change scope.
- Write the progress report before the final response.
- Implementers report their work; the orchestrator sets `delivered` on receipt and `complete` after verification.
- Do not hand-edit the packet table above — run `render` instead.
