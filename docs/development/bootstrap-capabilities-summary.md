# Bootstrap Capabilities Summary

This file is a consumer-safe summary of the capabilities defined in the upstream Bootstrap ledger. It is used by the customization agent to verify adoption states without requiring access to the upstream ledger file.

| id | channel | adoption kind | version | depends on | purpose |
|---|---|---|---|---|---|
| `packet-status-system` | core | verbatim | 1.4.0 | none | Machine-checkable status tracking and orchestrator-owned lifecycle transitions for development handoff packets (list/check/lint/render verbs), with forgiving packet-id input at the check/set boundary. |
| `packet-status-set-verb` | core | verbatim | 1.0.0 | `packet-status-system` | The orchestrator-only `set` verb: one-step status write that validates, writes, and re-renders/lints atomically, refusing to write an unlintable result. |
| `dev-console-hub` | recommended | project-specific-pattern | 1.1.0 | `packet-status-system` | Guidance for an optional submenu-driven local command hub (npm run dev:console) covering dev lifecycle, tests, builds, and packet-status visibility, with mutating commands confirmation-gated, centralized platform-aware package-script execution, and distinct launch-error reporting. |
| `agent-starting-prompts` | core | configurable | 1.8.0 | `packet-status-system` | Starting-prompt contracts for implementer, orchestrator, design-review, plan-scan, test-coverage-scan, and bootstrap-adoption-proposal agent threads. |
| `falsification-check` | recommended | verbatim | 3.0.0 | none | Review discipline for conclusion-bearing investigation packets: hypothesis tables with falsifying observations, discriminating experiments, and a ban on aggregate-only reporting. |
| `reports-archive` | core | configurable | 1.0.0 | `packet-status-system` | Convention: every packet leaves a progress report under reports/development/<packet-folder>/progress.md. |
| `root-agent-guide` | core | configurable | 1.0.0 | `packet-status-system` | Canonical agent entry point (AGENTS.md) plus a thin CLAUDE.md pointer to it, covering stage, area map, repo structure, key commands, architecture constraints, routing table, and guardrails. |
| `decision-log` | recommended | configurable | 1.1.0 | none | Append-only, owner-owned record of dated accepted decisions, plus a companion open-questions log for genuinely unresolved items. |
| `subagent-delegation` | recommended | configurable | 2.0.0 | `root-agent-guide` | A portable, structured discipline plus Claude and Codex-native rosters for delegating bounded read-heavy or small-patch tasks to ephemeral subagents (explorer, researcher, reviewer, implementer) with explicit routing rules and safety constraints. |
| `review-response-tiers` | recommended | verbatim | 1.0.0 | none | A portable, marker-tracked three-tier review-response convention (inline edit, implementer repair prompt, durable repair note) for managing repairs during orchestrator review. |
| `advisor-consultation` | core | verbatim (managed prose) | 1.0.3 | `agent-starting-prompts` | Thread-level pre-delivery consultation with a higher-tier, read-only advisor, proportionate to what the packet changes, with a mandatory three-way declaration. Availability is evaluated per implementer thread and provider, never per repository. |
| `commit-discipline` | core | verbatim (managed prose) | 2.1.0 | `agent-starting-prompts` | Who commits, what they may stage, when pushing is permitted, and the three concurrency modes (sequential, disjoint-scope concurrent, turn-taking) for sharing one working tree across agent threads. |

## Decline Guidance

### `packet-status-system`

Decline only if the project does not use packet-based agent handoffs at all — not recommended; this is the load-bearing tracking mechanism the rest of the system assumes.

### `packet-status-set-verb`

Not recommended to decline if packet-status-system is adopted — without it, status changes go back to the hand-edit-then-render-then-lint dance the system was built to remove.

### `dev-console-hub`

Decline if the project has no recurring local dev commands worth centralizing, or is not a Node project.

### `agent-starting-prompts`

Not recommended to decline — this is the operating contract the rest of the workflow assumes implementers and orchestrators follow.

### `falsification-check`

Decline if the project does no conclusion-bearing investigation work (no root-cause findings, no measurement-driven verdicts) — rare in practice.

### `reports-archive`

Hard to decline meaningfully — packet-status-system's lint rule for complete packets assumes this folder exists.

### `root-agent-guide`

Not recommended to decline unless the project already has an equivalent canonical agent-entry convention.

### `decision-log`

Decline if an equivalent durable decision record (e.g. ADRs) already exists — don't duplicate.

### `subagent-delegation`

Decline only if your project has no need for subagent delegation and performs all tasks inline or via durable handoff packets.

### `review-response-tiers`

Decline only if your project does not use an orchestrator model or does not follow structured review-response tiers.

### `advisor-consultation`

Cannot be declined or deferred: this is a core capability, auto-adopted with state 'adopted' in every consumer's .bootstrap-adoption.json by the initializer. What that manifest entry does NOT mean is that a consultation actually ran on any given packet — actual availability is a per-implementer-thread, per-provider runtime fork evaluated at packet start, never a manifest-level opt-out.

### `commit-discipline`

Not recommended to decline — this is core operating guidance for who commits, what they stage, and how concurrent threads share a tree; without it implementers and orchestrators are left to guess.
