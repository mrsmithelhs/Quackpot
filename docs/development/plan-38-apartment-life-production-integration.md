---
id: plan-38
title: Apartment life production integration
status: in-progress
depends_on: [plan-28]
gate: "Owner assigned 2026-10-30 to the existing Opus thread; proceed through bounded implementation and validation to delivery. Integrated experience returns for owner review."
summary: >-
  Bring the selected room-object, held-message and explicit-decision flow into production, with still companion poses, tap-to-buy breakfast and preserved save/exit/economy boundaries.
---
# Plan 38: Apartment life production integration

## Packet Metadata

- Packet id: plan-38
- Packet title: Apartment life production integration
- Status: (see frontmatter)
- Owner/model: existing Plan 28 Opus lead; Haiku coding workers, optional Sonnet integration delegate
- Date: 2026-10-30
- Packet type: feature / integration
- Mutation level: source and user-facing local build
- Approval gate: assignment approved; final integrated owner review
- Expected artifacts: focused production life modules, default-preserving kit omission option, regression evidence and progress report

## Goal and why this packet exists

Replace metagame choices currently presented inside the gacha or in floating form-like cards with the owner-selected Plan 28 mix. Objects belong in the apartment; inspecting is free; committing happens through a clear game decision or appropriate phone-app action. Deliver one coherent integrated flow rather than separately shipping incompatible presentation and routing layers.

## Non-goals

**Owner review amendment, 2026-10-30:** Integrated experience is not accepted. Repair the misleading phone-to-breakfast opening by starting setup in the kitchen. Breakfast must be genuinely optional: explicit skip costs 5 HP (clamped to actual remaining health), spends no cash, advances and is saved/recorded honestly; putting an object down remains free. This supersedes the prior no-skip limit below. Present $15 as the remaining rent balance, without fabricating a prior in-run payment. Broader work/evening/session sequencing remains a blocking experience gap for closure and routes to Plan37 plus the draft Plan40 work/evening study. The current day bar and automatic shift-to-rent settlement are not accepted merely because they match the prototype; do not relabel away the missing action structure.

No new time-slot rules, skipped meals/shifts, firing, food inventory, economy calibration, endings, weather mounting, soundtrack, late-game disorientation or general apartment exploration. Plans 37, 29 and other packets retain those scopes. No new event types or life-surface display logging. No push/deployment.

## Authority and contracts

Read AGENTS.md, docs/decision-log.md, docs/development/README.md, docs/repo-structure.md, docs/founding/design.md, the implementer starting prompt, and:

- reports/orchestration/plan-28-selected-mix-review-06.md (integration qualifications take precedence over inherited proposal shortcuts).
- reports/development/plan-28-apartment-choices-and-diegetic-communications/final-report.md.
- That folder's owner-direction-2026-10-30.md (D1–D22), integration-proposal.md Part A and incorporated lifecycle sections, and gallery/ source/evidence. Preserve alternative treatments as history.
- Existing Plan 35 fixture/capture contracts and root Plan 28 retention diagnostic before modifying compatibility or exit behavior.

Preserve Receipt honesty, existing numerical rules, actual expense/action logging, resolve-once effects, immediate exit, accessible equivalents and static physical companion. Owner D22 intentionally makes paid-zero optional opportunities missable; do not re-ask this or introduce forced tours. Reading and presentation motion do not consume fictional time.

## Scope and ownership

New focused src/ui/life/ modules and scoped CSS; bounded rewiring in src/main.js and retirement of replaced life modal renderers in src/ui/modals.js. Reuse the accepted desk-phone/context lifecycle. Own only necessary related tests and report folder reports/development/plan-38-apartment-life-production-integration/.

Authorize one small src/assets/apartment/ API extension: omit the built-in companion and its shadows, default preserving existing output; use existing renderDuck for separate still poses/perches. Port only needed selected props from reports into source; no report runtime dependencies. Update source map for implemented modules. Engine mutation is limited to a focused repeated-Uninstall idempotency fix and, if measurement justifies it, a read-only preview helper with equivalence tests. No mechanical retuning.

Storage validation or checkpoint tooling changes require an exact compatibility proposal if needed; do not silently expand either subsystem. Other active work must have disjoint ownership; coordinate before touching shared files.

## Implementation requirements

1. Use T1 paper rent notice, T2 phone-native shift/advance, and T4 object confirmation for sales and bakery breakfast. Keep the institutional letter free of software controls. Decide starts collapsed; no reading/scroll prerequisite. Preserve selected halo/chip/gaze guidance and physically supported tilt. Narrow screens receive a readable confirmation sheet.
2. Preserve ladder order, effects and honest final-decline warning. Inspect/Not now/Escape change no game state or log. Paid-zero alternatives remain mutually exclusive under existing engine rules; Go to work closes the opportunity and grants the regular wage exactly once.
3. Move breakfast charging to explicit confirmation on supported mornings. Preserve $5 and existing outcome rules. No skipping breakfast introduced here. Handle already-settled, unsettled, crash-between-charge-and-route and historical pending-reveal cases without rewinds or double charges. Route from explicit production state, not gallery day>=3 shortcuts; unknown states get non-destructive recovery.
4. Keep Save, Settings and immediate Uninstall available in ordinary and held/confirm contexts through an explicit accessible hierarchy. Restore focus and interrupted context correctly. Repeated Uninstall must not overwrite the original context, repeat rewards or block Leave. Rendering, reload and dismissal never commit an expense or choice.
5. Keep production report-independent. Scope SVG ids, remove associated duck shadows on omission, preserve output by default and existing phone behavior. No physical-duck motion. Measure preview computation against representative large logs before choosing repeated clone-based rendering.
6. Existing captured saves/attestations remain preserved historical artifacts. Document compatibility against changed source explicitly; use a bounded approved revalidation extension or dedicated fresh-run/old-save regression evidence, never claim a historical fingerprint attests the new build. Do not recapture or regenerate fixtures gratuitously.

## Work plan and execution latitude

On assignment, check packet readiness through the existing bounded launcher and inspect current ownership/processes. Record a concise implementation map, then proceed through scoped edits, ordinary fixes, proportionate tests and browser iterations to delivery without per-run orchestration gates. Ask the owner directly about genuinely new experience choices; return to orchestration only for substantive contract/ownership/scope changes or final review. Do not reopen D1–D22.

All Node work uses the unchanged Plan 25 bounded launcher, serial runs, 1 GiB heap, 2 GiB sampled owned-tree memory and 90-second ceiling. Preflight running processes; never kill unrelated Node/Codex processes. Reuse the verified owner dev server; do not stop an owner-started server. Avoid watchers, install churn and concurrent test suites.

**Owner execution amendment, 2026-10-30:** The existing Opus lead should prioritize coding in several bounded Haiku tasks, rather than doing the bulk of routine implementation itself. It may delegate implementation coordination to one Sonnet subagent, which may spawn its own Haiku helpers if the harness actually supports that capability. Nested delegation is optional, not an assumed capability or reason to spend time troubleshooting the harness. Direct Opus-to-Haiku delegation is the fallback. No numerical Haiku cap; size tasks by actual separability and avoid duplicated repository surveys or repeated full-context briefs.

Keep one integration writer responsible for shared main.js/controller/lifecycle wiring. Independent workers own explicit disjoint files or return patches from isolated workspaces; never have multiple workers modify the same files or operate the shared git index concurrently. If isolation is unavailable, serialize coding writes while overlapping read-only work. Leaf workers do not fan out; only the expressly authorized Sonnet coordinator may do so. This owner amendment permits that bounded hierarchy for this packet without changing general repository delegation rules.

Suggested division: kit omission and tests; pure life-routing/decision models and tests; focused life views/scoped styles; targeted retention/compatibility regression work after interfaces are agreed. Separate the view files from shared integration hotspots. Lead chooses exact boundaries after a short inspection; do not turn the suggestions into compulsory staffing. Workers run no concurrent Node suites or competing browser sessions. One coordinator batches targeted validation through the bounded launcher.

Opus does a short, substantive integration review of the final diff and evidence, concentrating on breakfast/old saves, exactly-once effects, Uninstall and selected-experience fidelity; it need not reimplement or reread every worker step. Retain owner-directed Branch C with no advisor. Record actual model/delegation use and uncertainties. No Terra or other advisory call is authorized for this Opus assignment.

## Validation Checklist

- [ ] Targeted route/effect tests cover rent paid/zero/unpaid, every offer, mutually exclusive paid-zero outcomes and exactly-once ordinary wage.
- [ ] Inspect/Not now/put-down produce no events; costs and terminal labels match actual engine results.
- [ ] Breakfast and old saves cover the named compatibility cases, including pending reveals; reload cannot repeat payments or rewards.
- [ ] Retention regression covers repeated Uninstall, Stay restoration, once-only reward and Leave from each new surface.
- [ ] Kit default output is unchanged; omission removes duck/shadows; two instances have scoped ids and selected furniture disappears after actual sales.
- [ ] Focused real-app browser checks cover desktop/narrow, keyboard, held/confirm layers, Settings/Save/Uninstall and static/reduced-motion handling. Separate emulated, actual OS and unverified evidence.
- [ ] Relevant engine/storage/Receipt and build checks pass under bounded execution; no report imports or runtime remote assets introduced.
- [ ] Progress states actual evidence, limits, remaining owner review, consultation and file ownership; commit scoped files explicitly and progress last.

## Stop conditions and delivery

Stop for new game rules, unavoidable schema/source-closure redesign, unresolved overlapping writes or resource-limit failure. Routine repairs and tests remain authorized after assignment. Implementers never set packet completion status. Deliver integrated local review URL, named scenarios, before/after flow and evidence in reports/development/plan-38-apartment-life-production-integration/progress.md; do not push.
