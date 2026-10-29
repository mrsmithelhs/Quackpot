# Codex starting handoff — Plan16 deterministic checkpoint investigation
Owner assigns Plan16 in-progress on2026-10-28 in parallel with Plan27 Receipt presentation and Plan33 music research. Work C:/AI/Quackpot. Read AGENTS, implementer prompt, docs/development/plan-16-deterministic-review-checkpoints.md, repo structure and current storage/engine/PRNG/log/UI controller source. Packet/checkpoint/session notes dating2026-10-24 are historical: current actual save schema, individual crossing races, rest and Duck-Dex rules govern. Run bounded check plan-16; root already got RUNNABLE.

## Initial scope is a proposal, NOT debug tooling
Own ONLY NEW reports/development/plan-16-deterministic-review-checkpoints/. Production, validators, main/current UI, shared smoke/harness scripts, test lists and canonical docs/packets READ-ONLY. Plan27 owns separate Receipt report mocks and does not wait on this plan. No shared report file, fixtures, browserstorage or script ownership. Preserve Plan33 folder.

Investigate how valid engine/action-replay-generated snapshots could let future reviewers start near a chosen scene instead of replaying every opening. First deliver proposal.md, a SMALL proposed manifest/brief format, 4–6 candidate checkpoints and progress.md. Don't implement generator/loader, create real snapshots, add debug menu/import route/test-only bootstrap or run reviewer fanout before OWNER ARCHITECTURE approval. No extra subagent/reviewer budget for this initial prose/source investigation.

## Required analysis
Recommend production engine transitions/save validation over hand-edited state. A seed alone does not suffice: account for all PRNG state/streams, rules/schema/source revision, append-only log, authoritative UI step/modal, clock/deterministic future-input assumptions and resolve-once transactions. Preserve complete normal envelopes rather than stitch invented displayhistory. Synthetic prehistory must be labelled scripted and never imply a student or later reviewer actually saw it.

Inspect current save/load compatibility, integrity/completeness, race resolve-once and presentation-replay, rest/history and pendingreveal boundaries. Identify supported seams and unsupported targets with source evidence. Don't alter validators or invent undocumented entry hooks to make fixture possible.

Small catalog candidates (choose feasible4–6): pendingreveal, firstduplicate/Down, resolved race/podium, starteroffer, solventzeroCash/unpaid escalation, finalReceipt. For each stableID: purpose, legal action recipe, source/schema/config/seed/clock fingerprint, expected context/nextactions/outcomes, branchlookfors, limits and stale-regeneration rule. Do not promise locked named events before examining runtime.

Propose browser loading under separate temporary profile/context with a validated snapshot and provenance record. Ordinary saves protected, never clear owner origin storage. Fixture privileges absent from shipped app; compare automation storage seeding against a dev-only loader, recommend least intrusive approach. Manual state edit for convenience is not equivalent evidence. Explain how loader proves actual loaded hash/revision rather than trusting filename.

Define artifact lifecycle/caching/size: generator recipes tracked, generated fixtures tracked or ignored based on actual proposed size/reuse; no broad catalog generation yet. Stale schema/rules/time assumptions must reject/regenerate explicitly; previous test results don't transfer silently.

## Bounded later review workflow (PROPOSAL only)
One or two real proof checkpoints AFTER owner approves architecture, then separately authorized implementation. Plan a small cheap browser-review batch by changed-area risk, each self-contained task/viewport/input/lookfors/observation budget, separate isolated contexts, reported artifactfingerprint and uncertainty. No model efficacy assumptions or a100agent swarm. Historical Luna-high text is superseded by current owner Terra-medium implementer-review policy; specific cheap spotcheck model/budget can be proposed but not dispatched now.

## Resources / delivery
Only read-only exploration and report writing now, plus mandatory guarded packet CLI using established Plan25 bounded-node-run.ps1 (1GiBheap/2GiBsample/90s/shortoutput). No Node harness/build/test/watchers/server/memory sweeps, no browser or source changes. If evidence needs execution, propose exact bounded proof and stop at architecturegate. Different URLs do not isolate storage; no sharedserver restart or owner tab changes.

Conclude with recommended architecture, concrete source seams/risks, 4–6 feasible checkpoints, isolated loader boundary, stale/invalid/ordinarysave preservation tests, exact later write scope and minimal proofbudget. Progress must distinguish inspected from executed and consultation not warranted for prose-only work. Commit explicit reports/progress last, no packetstatus/rootdocs/push/deploy.

Cross-chat once owner authorizes two-way supervision: actual codex_app.send_message_to_thread to QP Orch id01a16bb0-8611-7243-8c10-562b96083d60; collaboration '/root' only addresses your local subagent tree. No messaging others before authorization.
