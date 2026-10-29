# Codex starting handoff — Plan34 weather extraction (unmounted)

Owner authorizes Plan26 closure and starts Plan34 in a NEW Codex thread on2026-10-28, conserving Claude usage. Work in C:/AI/Quackpot. Read AGENTS.md first, docs/agent-starting-prompts/implementer-prompt.md, docs/development/plan-34-weather-runtime-extraction.md, docs/repo-structure.md and the packet's named Plan26 source/interface/review references. Packet is in-progress and root check returned RUNNABLE. Recheck through bounded launcher before work; stop if blocked.

## First deliverable: exact proposal, no source edits yet
Return a concise table of exact files, exported function signatures, stable data-weather roles/ID mapping, minimal weather-only helper extraction and fallback diagnostics. Explain how real-kit tests cover anchors/clip/layer order, duck/lamp preservation and two instances. Wait for root API/ownership approval before source mutation. The owner has selected bright-only extraction, wrapper beside unchanged kit and flat weather UI helpers; don't reopen those choices.

Scope is NEW unmounted helpers/tests plus explicit package.json test-list update. Nothing in main/current views/settings/save/core/log/global CSS/artkit changes. Source mapping is in the packet: arbiter, rain-spec, motion-controller, bright-lightning-effect, and src/assets/apartment-weather/layers.mjs. Minimum weather dependencies only, no sunlight/daylight feature. Report progress/evidence in reports/development/plan-34-weather-runtime-extraction/.

## Important source and behavior
Use current accepted Plan26 source, including exception-safe repairs0f8ef5f/progress550dcb7, not an older copy of the first proposal. Read later StageD interpretation correction and E proposal; saturated-red custom tracker is REPORT tooling and stays there. Weather art/controller/bright source live under reports/development/plan-26-apartment-daylight-weather-study/{study,animation}/. Pin/fingerprint accepted inputs in your proposal so later edits cannot silently change extraction.

Preserve bright curve0/40/300/800ms, window tail500ms, scene peak0.9/window1.0, colors, seeded rain art/speeds, one host-triggered pulse, injected shared>=4s start-to-start arbiter/no queue/no budget reset. Prior root tests found partial insertion/watchdog failures: preserve exact cleanup, accepted-then-cancelled start failure, no refund and later recovery.

Explicit production-helper differences: missing IO -> static; pending visibility stays blocked; separate flashEnabled defaultfalse; motion-off/reduced/hidden/offscreen/inactive/manualpause/destroy block/cancel and never resume stale flash. Host creates arbiter, modules keep no hidden mutable state. All exported paths should be deterministic and local. Atomic weather layers return original plain kit SVG plus diagnostic on unsupported/missing/ambiguous anchors, not partial output; development contract test fails loudly, runtime never reads Git/filesystem or loads reports.

“Duck/lamp untouched” means geometry/subtrees unchanged; selected whole-scene lightning illuminates them and washes lamp white at peak. Don't mistakenly weaken selected visual to keep lamp warm. Actual live-device/OS/red assessment limits remain, no certification.

## Resource discipline — mandatory
Owner previously saw Node reach ~21GB; cause unknown. Inspect process inventory before launches; do NOT kill unrelated servers/browser/Node. No watchers, installs, unattended sweeps, mutation runs, full npm test/legacy smoke or parallel Node. Use established report-local PowerShell launcher READ-ONLY:
reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1
with named -Executable node.exe -ArgumentVector @(...) from repo root. It supplies1GiBheap,2GiB sampled owned-tree private memory,90s deadline and bounded output. Sampling is NOT hard peak guarantee. Example preflight:
& './reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1' -Executable node.exe -ArgumentVector @('scripts/dev/plan-status.js','check','plan-34')
Single tiny CLI/focused tests/directVitebuild sequential only. If exec yields session_id, drain using write_stdin to completion; don't lose runner's final result. Stop first failure, diagnose/report before retry; known deterministic fixture defect can be proposed for root clearance.

After root approves source, exact focused test commands and bounded before/after directVitebuild can be cleared. No browser launch automatically: propose report-local real-kit witness if needed. IsolatedChrome requires normal require_escalated execution; restricted mode previously causes Crashpad pipefailure before page, don't repeat or bypass securityflags. No owner tab/storage/systemsettings. An existing server URL needs /Quackpot/ base; reports are not in dist. Don't add new hosting infrastructure to an extraction.

## Review and delivery
ONE read-only gpt-6.1-terra at explicit medium pre-delivery reviewer authorized AFTER main implementation, not preproposal/repeatedsmallrepairs. Self-contained brief, no changes or extra process launches by reviewer; record requested/observedsettings honestly and independent findings/dispositions. No nested implementation agents or otherbudget assumed.

Prove app entry/import graph cannot reach new modules (tests/newmodules can import them); before/after build hashes/size, focused tests and source-only compatibility references. No claim E1 is mounted productionweather. Current app bundle should remain unchanged absent explained build nondeterminism. E2 needs separate surface/triggers/settings/preferences/Receipt/credits decisions and actual production/device measurements.

You are not alone: preserve other work, explicitpathstaging, never remove index.lock. Root owns statuses/decisiondocs. Commit scoped source/evidence, progress last, no push/deploy/status. Report to owner after proposal/delivery. Cross-chat messaging requires owner's authorization; once connected use actual codex_app send_message_to_thread to QP Orch thread01a16bb0-8611-7243-8c10-562b96083d60, not collaboration '/root' (that's only your local agent tree).
