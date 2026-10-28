# Quackpot — Agent Guide

> **This is the canonical agent entry point for this repository.**
> `CLAUDE.md` (repo root) points here. Read this file before working on any task.

---

## 1. Project Overview and Current Stage

Quackpot is a public, static browser gacha game used in CourseVGD to help students critically examine microtransaction design by experiencing a fictional duck-collecting game and reviewing an end-of-run Receipt.

**Current stage: development underway. Plans10,22,23 and24 are owner-accepted and closed. Plan25 desk/phone production integration is in-progress for Codex. Plan18 is reopened for Sonnet-led expanded licensed-audio research and a role/pool audition page; production audio remains gated. Plan26 still weather and rain/controller A/B are accepted, with the plan open pending disposition of later lightning/performance/promotion stages. Existing app/rig/Shell A/Duck-Dex rules remain binding; no push/deployment is authorized.**

---

## 2. Area Map

<!-- Replace this table with the project's actual areas, strands, modules, or components. -->

| Area | Description |
|---|---|
| Founding design (`docs/founding/design.md`) | Canonical game design, hard constraints, manipulation catalog, time/saving policy, and Receipt specification |
| Project seed (`docs/project-seed.md`) | Setup context and founding proposal history; accepted paths are in `docs/repo-structure.md` |
| Founding design review (`reports/orchestration/founding-docs-review/`) | Blind review reports, synthesis, dispositions, and GATE-53B owner triage |
| Packet & status tooling (`scripts/dev/plan-status.js`, `docs/development/`) | Handoff packet lifecycle and index management |
| Browser app (`src/`) | Playable mechanism slice: entry/controller, engine/log/Receipt/storage, UI views and global styles; see `docs/repo-structure.md` for the source map |
| Rig/audio proofs and simulation | `src/core/duck-rig.mjs` and `src/audio/synth.mjs` are accepted proof modules awaiting game integration; `sim/` contains the separate headless model and re-exports of shared pure modules |

---

## 3. Core Repository Structure

```
.claude/agents/                 # Claude Code subagent definitions (explorer, implementer, researcher, reviewer)
.codex/agents/                  # Codex subagent definitions (implementer, researcher, reviewer)
src/                            # Playable browser mechanism slice and proof assets
  main.js                       # Boot/restore, navigation, view callbacks, autosave/warnings
  core/                         # Game rules/state, PRNG, append-only log, Receipt projection, storage, rig
  ui/                           # HUD, desk/gacha/race/Receipt views and modal renderers
  audio/                        # Local synthesized sound proof; game integration pending
  assets/                       # Placeholder still used in game; accepted SVG rig also available
  style.css                     # Current global styles; a coordination hotspot
sim/                            # Separate headless model/experiments; pure shared modules re-export src/core
docs/
  agent-starting-prompts/       # Starting prompts for orchestrator, implementer, design-review, and scan threads
  development/                  # Implementer handoff packets, packet index, and templates
  founding/design.md            # Canonical game design and hard constraints
  workflows/                    # Process guides (packet-tracking-system.md)
  decision-log.md               # Dated accepted decisions (append-only, orchestrator/owner-owned)
  open-questions.md             # Genuinely unresolved questions
  project-seed.md               # Project setup context and historical folder proposal
  repo-structure.md             # Owner-ratified paths and integration boundary
  README.md                     # Documentation hub
reports/
  development/                  # Implementer progress reports per packet
  orchestration/                # Founding design review artifacts and orchestration records
scripts/dev/
  plan-status.js                # Packet status CLI (list, check, lint, render, set)
  plan-status.test.js           # Tests for plan-status.js
.bootstrap-adoption.json        # Tracked Bootstrap capability adoption manifest
advisor-capable-providers.json  # Provider capability registry for pre-delivery advisor consultation
```

---

## 4. Key Commands

**Editing map:** Read the current-source section of `docs/repo-structure.md`, then only the relevant modules. UI callbacks call the engine; the engine owns outcomes and log entries; storage persists the state/log/RNG envelope; Receipt projection reads log evidence. Report wireframes are review artifacts, not runtime dependencies. Port selected behavior into focused source modules; do not copy a monolithic mockup or append every new feature to `main.js`/`style.css`. The selected Shell A handoff is `reports/orchestration/plan-14-production-handoff.md`.

Run from the repository root:

```
# Local build and verification:
npm run build                                  # ignored static output in dist/
npm test                                       # packet, smoke-validator, and simulation tests
npm run test:smoke                             # fresh build plus isolated local browser smoke

# Packet status tooling:
node scripts/dev/plan-status.js list            # table of all packets + effective status
node scripts/dev/plan-status.js check <id>      # exit 0 + RUNNABLE, or exit 1 + reason
node scripts/dev/plan-status.js lint            # check for schema violations
node scripts/dev/plan-status.js render          # regenerate docs/development/README.md index
node scripts/dev/plan-status.js set <id> <status> [--resolution "…"] [--superseded-by <id>]
                                                # orchestrator: change status + re-render + lint atomically (refuses to write if result won't lint)
```

> **Before starting any packet, run `node scripts/dev/plan-status.js check <id>`.**
> **If it exits nonzero, stop and report the reason — do not implement a blocked packet.**

**Optional dev console:** If the project exposes `npm run dev:console`, treat it as a submenu-driven command hub for local dev lifecycle, tests, builds, packet-status visibility, and advanced scripts. The packet-status submenu should make the list/status view easy to reach, and any command that mutates local generated output, packet frontmatter, or remote/external state should be confirmation-gated before it runs. If the console executes package scripts:
- Centralize package-script execution behind a shared wrapper helper.
- Avoid spawning raw `npm.cmd` directly on Windows (spawn `cmd.exe /d /s /c "npm run <script> -- <args>"` or equivalent tested wrapper with `shell: false` to avoid launch/EINVAL issues).
- Ensure the invocation command shown to the user on confirmation screens is the exact same command object that gets executed.
- Report spawn/launch failures (e.g. `result.error`) distinctly from child process nonzero exit statuses so environment/configuration errors are immediately debuggable.
- Add regression tests to the console's test suite to cover script launching and error handling.

---

## 5. Critical Architecture Constraints

**Read this section before touching any shared code.**

- **No network calls at runtime (Hard Constraint #2):** The student game makes zero network requests or telemetry calls, has no accounts, and may never load runtime CDN libraries. Run state and the Receipt event record stay in browser storage (`localStorage` or `IndexedDB`).
- **Static build output (Hard Constraint #7):** Vite is permitted for development and build, but published output must be static HTML, CSS, JavaScript, and local assets served from GitHub Pages. Do not publish from `docs/` (would collide with Bootstrap/documentation material).
- **Student-initiated offline file export only (Hard Constraint #3):** The game may assemble a run-usage file for manual student download and submission, and a local teacher dashboard may import multiple student files in the browser, but neither may automatically upload, transmit, or cloud-sync data.
- **No Bootstrap dependency in the student game:** CourseVGD is an independent user of Quackpot, not a dependency. Bootstrap is not a student-game dependency (allowed only as an unselected future option for the local teacher analyzer).
- **SVG art source & local audio:** Game art assets begin as SVG source in the repo; per-asset PNG delivery requires a measured test showing benefit. Owner-authorized generated raster concept studies may live under `reports/` as review references (2026-10-24); they are not game assets or substitutes for SVG source. Ordinary text uses HTML/CSS. Owner approval 2026-10-25 permits synthesized text-parameter effects and selected locally bundled Creative Commons recordings (including CC0) for effects/music; JS/model-generated music remains an option. Verify each exact license/version, redistribution/modification compatibility and required notices; prefer CC0/CC BY. Retain source/creator/license/change records and local file mapping. Provide local opening/settings Credits; factual attribution is outside fictional game entities. No remote audio/CDN/automatic third-party loading. Asset selection/integration remain gated; see design Assets and DECISION-010.
- **Seedable PRNG & append-only Receipt log:** Runs and the event deck use a small seedable PRNG module. The Receipt is built from a local append-only event record of displayed cues, player actions, and conditional (pity-adjusted) pre-draw odds — never inferred from final state.
- **Accepted folder layout:** See `docs/repo-structure.md` (owner approval 2026-10-24). Shared-module relocation is a separately bounded integration after Plan 01 acceptance; live Pages publication remains separately gated.
- **Experience versus debrief (owner interview 2026-10-25):** Keep mathematical/manipulation-analysis helper panels out of live gacha; put critical reflection on the Receipt/debrief. Preserve necessary costs/odds/terms, operational warnings, accessible equivalents and immediate exit. Plan 17 bounded evidence is accepted: 3 Down buys +5% base speed for one race (non-stacking, consumed once on commit); 6 Down buys an immediate active-banner pull with normal duplicate payouts/pity advancement/Legendary reset. Production lifecycle/log/Receipt and whole-run balance still require integration verification. See design and DECISION-008/013; do not treat wireframe labels as conformance evidence or reopen accepted trial rules without owner.
- **Two duck contexts:** The static companion is a physical rubber duck owned by the metagame character; it motivates interest in the fictional gacha game. Use a 2D-first study of coherent views, lighting and apartment compositions to give that inanimate object character; inspect close-up/zoom quality. A 3D source pipeline is only a future investigation candidate. Digital gacha ducks belong to the collectible roster and may receive separately approved animation. Never apply gacha motion globally to the physical companion or treat pawning it as deleting a gacha collectible.
- **Race finish refinement (owner, 2026-10-26):** A genuine completed-lap finish-line crossing replaces the prior strict fixed-duration distance-contest direction. Allow about ±15% variation around the selected target; twenty seconds remains an investigation target. No forced crossing, per-duck trajectory normalization or time-limit result mislabeled as a finish. Exact lap calibration, remaining-entrant classification and seeded weaving/contact recovery remain proposal/integration gates. Preserve the single pre-race choice, no reflex input, no per-variant balancing and honest mechanical-versus-displayed event evidence.
- **Selected race model (DECISION-018, 2026-10-26):** Plan13's combined rank-weighted weave + seeded15–20° contact with2s presentation-only slow-motion highlight is owner-selected and the investigation is closed. Preserve accepted reference controls/caps and static/reduced-motion parity; DECISION-022 below supersedes same-time follower classification. Production stat mapping/lifecycle/log/Receipt and race-motion wiring remain a separate integration gate. Never import report artifacts at runtime or silently retune selected rules.
- **Individual race finishes (DECISION-022, 2026-10-27):** Owner selects actual crossing order for every entrant, replacing classification of followers at the winner's crossing. Lower placements and Gem recipients may change. Keep the roughly20s/median17–23s/at-most5%>23s criterion on the winner's crossing; measure last crossing and full playback separately. Each duck eases to rest within about1s after its own crossing; the approximately1s ease-out podium entrance begins at the last genuine crossing, overlapping the final coast. Ease the scene lighting down during the reveal while keeping podium text and the upper finish area readable; complete playback only when all racers have stopped and the podium has settled. Braking/podium are presentation, never forced crossings or reward writes. Exact continuation, finished-entrant interactions, tie/watchdog/non-finish policy and lifecycle require a bounded proposal before mutation; production integration stays gated. Reduced motion uses static equivalent results. Historical same-instant rank evidence is not validation of revised lower places.
- **Production race target (DECISION-023, 2026-10-27):** Owner accepts the latest Plan23 preview and authorizes production integration under orchestrator supervision. Adopt the tested shared affine conversion8.25+0.5×rating input, R2combined rear acceleration/recentering/turn assistance, controlled leader slowdown, risk-only Sprint mean1.00 with±20% spread (Safe±5%), current course/controller/caps and actual individual crossing order. Preserve accepted large podium, matching whole-environment drama lighting and first-place graceful-bob/second-third paddle loops with pause/static lifecycle. First-winner timing remains the criterion; tail/full playback separate. Root reviews exact production file ownership, resolve-once/versioned-save/reward/Receipt boundaries before source writes; final owner review is of the integrated production race. This is adoption/implementation authority, not a claim production is implemented or validated. Plan22 owns rest; no new assets/audio, push or deployment.
- **Race timing distribution (DECISION-019, 2026-10-26):** At most5% of races should finish strictly later than23s around the roughly20s target. This supersedes a hard23s/±15% upper limit above; long individual races are allowed. Validate named seed/configuration sets with late fractions/quantiles/uncertainty, preserve real crossing/watchdog honesty and report2s-highlight playback overhead separately. No seed filtering, per-race normalization or silent balancing to meet a proxy.
- **Calibration investigation (owner, 2026-10-26):** Speed can be an abstract rating. Plan23 may compare global conversion/track-scale changes while preserving tier/trial/rest input effects, with median17–23s and at most5%>23s; substantial faster finishes are acceptable. No per-identity tuning or selected-modifier compression by stealth. Report recommended shared constants and validation before production mutation; selected weave/contact rules remain reference behavior.
- **Duck-Dex/rest direction (owner, 2026-10-26; Duck-Dex accepted 2026-10-27):** Voluntary collection access; first-owned revealed identities get approximately 2s shelf focus then 2–3s silhouette-to-color transition, skippable by fast-pull and free static/reduced-motion/skip paths. Show factual duck/set value without inventing bonuses. Plan21 implements this bounded collection/discovery feature; copy and large-catalog follow-ups remain separate. Soft rest speed penalties remain selected for Plan22: zero intervening races 50%, one 25%, two or more none; never-raced ducks rested, tired ducks still selectable. Plan22 rest is implemented and owner-accepted (2026-10-28), applied to base race rating before the accepted mapping. The player-facing Down item is a one-race speed upgrade; internal trial identifiers remain compatibility keys. No paid recovery or fee for accessibility; Fast Pull pricing remains separately gated. Preserve canonical discovery, lifecycle and balance boundaries.

---

## 6. Key Reference Routing Table

When your task touches a component, read these first.

**Orientation / project-wide** (read first on any task)

| Topic | Read this |
|---|---|
| Repo folder roles and rules | `docs/repo-structure.md` (if it exists) |
| Project decisions history | `docs/decision-log.md` |
| Active / pending plans | `docs/development/README.md` |
| Documentation hub | `docs/README.md` |

<!-- Add project-specific routing rows below. -->
| Canonical game design, hard constraints, and manipulation catalog | `docs/founding/design.md` |
| Project seed, 2026-10-23 owner decisions, and tooling limits | `docs/project-seed.md` |
| GATE-53B owner triage and founding design review dispositions | `reports/orchestration/founding-docs-review/owner-triage.md`, `reports/orchestration/founding-docs-review/dispositions.md` |
| Packet lifecycle and status CLI rules | `docs/workflows/packet-tracking-system.md` |
| Packet creation format and template | `docs/development/packet-creation-guidance.md`, `docs/development/packet-template.md` |
| Bootstrap capability summary and local adoption manifest | `docs/development/bootstrap-capabilities-summary.md`, `.bootstrap-adoption.json` |

---

## 7. Guardrails

**These apply in every task. Do not override without explicit owner approval.**

1. **Implementers never set packet completion status.** Do not flip `status: draft` to `complete` or edit orchestrator review notes. Report results and stop; the orchestrator/owner verifies and sets status.

2. **Verify against artifacts, not reports.** "Tests pass" and large counts are evidence, not proof. State precisely what was verified and how, so a reviewer can confirm the claim maps to the goal. Don't declare victory on a proxy metric.

3. **Decisions route through the owner.** Anything an implementer writes as "owner decision" without an owner in the loop is a defect. Surface unresolved decisions in the progress report; stop if the decision is load-bearing.

4. **Terminal states require a written `resolution`.** A `complete`, `superseded`, or `parked` packet with `resolution: null` fails lint. If you close a packet, write why.

5. **Report against the actual objective, not a proxy.** The progress report must state what was verified and how — not just that tests passed. The reviewer must be able to confirm the claim maps to the goal without re-running everything.

6. **Investigation before mutation, with an owner gate between.** For significant behavioral or structural changes: first investigate and produce a report; then wait for an owner gate; then implement. Packets that jump straight to implementation without evidence of the problem are high-risk.

7. **Docs describe what exists or is decided, never what is imagined.** A doc that describes planned or speculative state misleads the next agent. If it's aspirational, say so explicitly, or don't write it yet.

8. **Public-repository privacy, fiction, and asset rules: Never commit personal information, student data, exported student run-usage files, credentials, analytics keys, or deployment secrets (`README.md`, `docs/founding/design.md`). All publishers, products, sponsors, and streamers in the fiction remain fictional while retaining owner-selected satirical names (Hard Constraint #6); factual creator/source attribution is permitted in Credits and provenance/license notices (owner approval 2026-10-25). Game art assets begin as SVG source in the repository (per-asset PNG delivery requires measured benefit); owner-authorized raster concept references remain in reports and do not ship. Effects may use text-stored synthesis parameters or selected locally bundled CC/CC0 audio, with exact-license compatibility/provenance and local Credits; see `docs/founding/design.md` §Assets.**

---

<!-- bootstrap:subagent-delegation v2 begin -->
## 8. Subagent Delegation Discipline

When addressing tasks in this repository, follow these delegation rules:

1. **Three-Way Routing Rule**: Default to **inline execution** in your primary thread. Escalate to an **ephemeral subagent** (e.g., `explorer`, `researcher`, `reviewer`, `implementer`) when a task requires exploring/reading files, contains multiple independent sub-tasks, requires fresh-context review, or would flood your context window. (As a default signal rather than hard law: consider delegating when reading ~≥10 files or handling ~≥3 sub-tasks). For large, high-blast-radius, or multi-session changes, request or create a **durable handoff packet**.
2. **Cold-Start Self-Contained Briefs**: Subagents start with a cold context and no conversation history. Every delegation prompt must be a self-contained brief carrying the exact paths, inputs, relevant decisions, and expected output format the subagent needs.
3. **Delegate Reads; Keep Writes Single-Threaded**: Use read-only subagents (`explorer`, `researcher`, `reviewer`) freely for exploration, web research, and clean-context code audits. Bounded implementation subagents (`implementer`) are permitted but must execute one writer at a time, use an isolated workspace or worktree when the active tool supports it, receive a full self-contained brief, and never fan out into additional agents or silently weaken test harnesses.
4. **Strict Verification**: Never accept "tests pass" as proof of correctness. All subagent output must be verified by the orchestrator against the user's actual objective.
5. **Minimal Hand-Written Context**: The `AGENTS.md` guide and subagent definitions must be hand-written and minimal. Avoid auto-generating them, as bloated context files degrade agent performance.
<!-- bootstrap:subagent-delegation v2 end -->

<!-- bootstrap:advisor-consultation v1 begin -->
## Advisor Consultation

**Owner reviewer routing (2026-10-27; supersedes Sol-low/Luna-high):** Orchestrator reviews of implementer work use **Terra-medium** (`gpt-6.1-terra`, explicit `medium`). The orchestrator may authorize one read-only Terra-medium reviewer for Codex implementers after implementation and before delivery, judging need by scope and risk; no automatic pre-proposal or repeated repair-review budget. Use a default-role child if a named role fixes a conflicting effort. Keep briefs self-contained/read-only, record requested/observed settings and findings dispositions, and report unavailable settings rather than silently substituting. Historical reviews retain their actual model records.

**SVG authoring routing (owner, 2026-10-27):** Prefer Sonnet for future SVG drawing packets. The owner found bounded Haiku drawing experiments and separate reference research useful; packet briefs may propose explicit budgets and disjoint output folders. This is an authoring preference, not blanket scope, subagent, browser or production-integration authority. Preserve single-writer integration and coordinate browser turns through orchestration.

Implementer threads may consult a higher-tier, read-only advisor before reporting a packet
done — but only when the change has a real behavioral surface (code, scripts, or schemas; not a
docs-only or prose-only edit) and the thread can confidently identify itself as capable. Availability is a property of
the individual thread and its provider, not of this repository — see
`advisor-capable-providers.json` for the current provider-capability list; do not hardcode
provider names here, and if you cannot confidently match yourself to an entry, treat yourself
as not capable. Every thread states explicitly, in its progress report, one of: a consultation
ran, a consultation was not warranted for this change, or a degraded mode is in use
(owner-mediated, or orchestrator-gate-only) — silence is never acceptable. See the implementer
and orchestrator starting prompts for the full behavioral contract and the required
disposition-record fields.
<!-- bootstrap:advisor-consultation v1 end -->

<!-- bootstrap:commit-discipline v2 begin -->
## Commit Discipline

Implementers commit their own scoped work in the repository they are working in: commit the
files you created or modified, stage by explicit path (not `git add -A` unless `git status`
shows nothing unrecognized), never push, and commit the progress report as your final act. A
packet that has you write into a different repository states its own commit rule there — never
infer one from this rule.

- **If a git command fails with `index.lock: File exists`, another agent is mid-commit. Wait and
  retry.** Never delete the lock file: a lock that looks stale may be a live commit, and removing
  it can corrupt someone else's work. Disjoint write-scopes prevent content conflicts, not index
  contention — serializing here is expected, not an error.

Running two agents on this tree at once is safe only with disjoint write-scopes (mode B);
overlapping scopes must be serialized — one agent at a time, or turn-taking with a commit at
each handoff. See the implementer and orchestrator starting prompts for the full contract,
including the three concurrency modes and bounded orchestrator authority over unexpected
working-tree state.
<!-- bootstrap:commit-discipline v2 end -->
