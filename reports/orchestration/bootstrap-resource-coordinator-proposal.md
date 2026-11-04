# Shared local resource coordination through MCP

- **From:** Quackpot orchestration, at the owner's request
- **Date:** 2026-11-03
- **Area:** new capability; cross-harness development coordination
- **Type:** new-capability
- **Status:** open

## What and why generic

The owner requests Bootstrap investigation of a deterministic, cooperative resource-reservation service shared by agent harnesses and consumer repositories on one development machine. Quackpot's parallel implementation work has required repeated conversational grants, browser capture quiet windows, Git turns, and resource releases. This is noisy, consumes model and owner attention, and is vulnerable to stale coordination state. The owner wants Bootstrap to assess the idea, improve it, and potentially maintain and distribute it as shared development tooling. This note proposes investigation and a staged pilot, not an adopted capability or authorization to install or launch a service.

Bootstrap is a suitable maintainer because its consumers share the same machine, workflows and owner, not because Bootstrap has authority over their product decisions. One service per repository would fail to coordinate machine-wide contention and create needless process proliferation. Recommend one coordinator instance per machine, with repository-specific resources in the same inventory. Bootstrap need not have an active agent chat for that service to operate.

## Owner direction and trust model

The owner explicitly supports a cooperative agreement among trusted local agents. This service would not lock the operating system, stop rogue commands, or grant implementation authority. Do not turn it into an enterprise identity, permissions or distributed-systems project. Lightweight ownership tokens, duplicate-request protection and an audit trail are primarily defenses against mistakes. A declared orchestration override with a recorded reason may be sufficient; investigate rather than assume strong role authentication is needed.

Agents may request and release their own reservations. Orchestration may resolve another agent's abandoned or uncooperative reservation after checking the situation. The precise override policy remains a Bootstrap/owner decision. Revoking a reservation is distinct from terminating a process or proving that a resource is free. Uncertain process termination and interference with owner-controlled browsers or servers remain subject to existing authority.

Keep authorization, resource availability and execution bounds separate. A grant never authorizes a new download, installation, provider disclosure, experiment, production mutation, push or deployment. Existing bounded launchers and task gates remain in force.

## Generic kernel to upstream

### 1. Investigate fleet resources before choosing the inventory

Bootstrap may propose read-only investigator tasks over its consumer registry and relevant local repositories. The owner specifically suggests delegating this research. Let the Bootstrap lead choose useful bounded investigations and lower-tier helpers, mindful of the teacher owner's limited subscription plans. Avoid exhaustive reading of every repository or repeated expensive consultations when a representative sample establishes the pattern.

Investigators should inspect actual commands, runner contracts and workflow evidence, not infer resource requirements from a language name. Return a compact matrix: resource, scope, contenders, actual conflict, current workaround, expected duration, rough capacity evidence, enforcement limits, and recommended pilot priority. Separate observed use, reported incidents and hypothetical needs. Do not run tests, builds, browsers, provider calls or ML inference merely to inventory them. Do not collect unrelated process command lines, secrets, personal data or raw owner session material.

Candidate resources to investigate:

| Scope | Candidate | Important distinction |
|---|---|---|
| Machine | GPU inference / available VRAM | Rare use still contends across every repository; initial exclusive grant may be simplest. Preflight remains necessary. |
| Machine | Heavy CPU/RAM jobs | Several individually bounded jobs can exceed aggregate laptop capacity. Consider a simple capacity class before inventing exact RAM scheduling. |
| Repository or suite | Unit/integration test runs | Pure isolated tests may run concurrently; tests sharing outputs, fixtures, ports or profiles may not. Node is a runtime, not itself a resource boundary. |
| Repository/worktree | Git index mutation | Short staging/commit window; coordinate any shared repository metadata correctly. This does not solve overlapping semantic edits. |
| Service instance | Dev-server capture stability | Captures conflict with writes that cause hot reload; an unrelated repository may not conflict. |
| Browser/profile | Shared interactive browser control | Separate isolated harness browsers need not share this lock, but may still contend for machine capacity or server stability. |
| Port/server | Agent-owned server startup/use | Describe ownership, existing server reuse and shutdown authority. A reservation is not permission to stop an owner's server. |
| Source area | Shared semantic write ownership | Longer-lived editing responsibility may need a separate ownership record rather than a short compute lease. Investigate this boundary. |
| Provider | Expensive or mutually conflicting helper calls | Optional; inventory only if real workflow evidence supports it. Do not assume every cross-harness call needs global serialization. |

A test batch can require BOTH a project-specific fixture/output reservation and a machine-wide heavy-job reservation. Conversely, tiny pure tests may need neither exclusive project access nor heavy-job serialization. Resource naming and conflict rules should follow actual interference.

### 2. Deterministic reservation core

Use a small independently tested core with transactional persistent state. SQLite is a candidate, not a selected dependency. MCP and an administrative CLI should use the same core and database, never competing truth stores. Runtime state stays outside tracked repository content. Avoid fifteen services, per-chat daemons or sleeping shell polling processes.

Recommended semantics to evaluate:

- Unique request ID and caller-provided idempotency key; retry after a lost response must not create duplicate grants.
- Stable owner/project/chat labels and opaque server-issued lease tokens; stale releases cannot affect newer grants.
- Atomic acquisition of a resource set, or none of it; agents must not hold one scarce resource while indefinitely waiting for another.
- Deterministic queueing and explicit fairness rules. Compatible work may proceed, but account for starvation of larger or earlier requests.
- States distinguishing queued, offered, claimed/active, released, cancelled and overdue. An offer has a bounded claim window so idle agents do not indefinitely reserve newly available resources.
- Expected end, optional bounded renewal, and optional progress/heartbeat information. Renewal must not silently create permanent priority over queued work.
- Deadline expiration marks an active grant overdue; it does not automatically declare a still-running process gone or grant a conflicting request.
- Restarts preserve unresolved reservations. Reconcile time changes, disconnection and service downtime conservatively; investigate elapsed-time handling rather than relying blindly on wall-clock expiry.
- Explicit override/reconciliation with reason and retained history. No automatic arbitrary process killing or recursive profile cleanup.
- Bounded audit retention/rotation. Logs should be useful without becoming another oversized evidence file.
- Missing coordinator behavior must be explicit: no silent inference of exclusive access. Choose a documented fallback/manual coordination procedure, without deadlocking every harmless read-only task.

### 3. MCP as the shared agent interface

MCP is a protocol/interface, not the scheduler. Candidate tools include request_resources, inspect_request, claim_offer, renew_lease, release_lease, cancel_request, list_reservations and resolve_overdue. Keep tool results concise and structured, including request state, applicable resource names, next check guidance and conflicts. Avoid huge queue dumps on every call.

Prefer investigating one loopback-only Streamable HTTP service serving several harness clients. A stdio adapter may be useful if a client lacks compatible local HTTP support. Separate stdio processes must not each create an independent in-memory lock universe. Use an established SDK and ordinary local transport protections; do not implement raw MCP framing unnecessarily or introduce cloud hosting/accounts for this pilot.

Notifications are an important potential benefit. A changed request can notify a subscribed connected client. However, protocol notification support does not establish that a harness routes it into the correct chat, resumes an idle agent, or starts another turn. Test those separately. Persisted request state remains authoritative, with reconnect/status lookup as fallback. Notification should normally announce an available offer for the agent to claim. It must not imply unattended automatic execution authority.

### 4. Probe actual harness compatibility early

The relevant participants are the owner's actual Codex, Claude and Gemini harnesses. Do not substitute vendor feature claims for observed behavior in these installations. Record requested and effective transport, connection configuration, relevant permission behavior, and whether identity/routing is observed or merely caller-declared.

Test a minimal harmless request/notification with an active agent, a waiting tool call, an idle chat and a disconnected/reconnected client where supported. Determine whether a notification is only received by the application, visible to the model, routed to the right chat, or actually wakes work. No promise of wakeup until demonstrated. Any required harness-specific automation should be a separate optional adapter, not a hidden prerequisite for the core.

### 5. Integrate gently with execution and guidance

The service should remove conversational allocation overhead, not reproduce every orchestration approval as a tool ritual. Within already authorized repair/validation scope, an implementer should acquire its next resource turn itself. Root still reviews material experimental changes and owner-ready evidence. Common launchers may check a valid lease for relevant jobs, but the system remains cooperative and must not claim OS enforcement.

Do not hold a reservation while awaiting owner aesthetic decisions, writing long reports or doing unrelated reading. Release promptly and report only actionable conflict, overdue state, failure or owner decision. Avoid constant unchanged snapshots in the owner chat.

## Suggested staged Bootstrap action

1. Triage this note; decide whether Bootstrap should own a bounded investigation packet. Preserve the owner's preference for a lightweight local service.
2. Inventory representative fleet resource use and test actual MCP transport/notification compatibility. Return architecture recommendations and any meaningful owner choices before broad implementation.
3. Implement and deterministically test the reservation core plus minimal MCP and CLI access. Concurrency tests can use synthetic clients; no scarce real GPU work is needed to prove atomic grants.
4. Pilot on a small set: machine heavy-job allocation, repository Git mutation, and dev-server capture stability. Quackpot offers actual workflow examples; Bootstrap should choose a second consumer to check generality.
5. Compare coordination messages, agent wait/error behavior, overhead and recovery against manual practice. Add wakeup adapters or more resource classes only when results justify them.
6. If useful, release through Bootstrap's normal versioned capability/adoption process. No automatic fleet-wide installation, prompt rewrite, startup service registration or consumer manifest change follows from this note.

Acceptance scenarios should include simultaneous conflicting requests, compatible grants, atomic multi-resource acquisition, duplicate requests/releases, stale-token rejection, cancelled queue entries, offer timeout, overdue renewal, client crash/disconnect, service restart, clock changes and administration recovery. Probe queue fairness and cancellation rather than merely demonstrating two successful sequential calls.

Success means less human/model coordination and reliable reservations across harnesses without more setup trouble than the system removes. It does not mean every task waits on a new global mutex.

## Evidence and exemplar files

In Quackpot:

- `reports/development/plan-58-race-ability-animation-study/tools/gallery-browser.mjs` and `tools/validation-proposal.md`: finite capture jobs on an existing server, affected by source reloads and needing separate interpretation of assertions and visual evidence.
- The same study's `progress.md`, `evidence/gallery-01/` through `evidence/gallery-07/`, and `early-owner-checkpoint.md`: successive bounded checks, failed attempts retained, actual visual repairs and early owner gate. The repeated write-quiet-window grants/releases are primarily chat evidence, not a quantified study in these files.
- `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1`: existing bounded runner; a reservation would complement rather than replace it.
- `scripts/dev/checkpoints/process-tree.ps1`, `process-tree-graph.ps1`, `process-cleanup-policy.mjs` and related tests: process ownership/cleanup limitations. Numeric PID alone is insufficient proof of ownership, and sampled observation is not complete descendant termination proof. Reuse lessons, not assumptions that these helpers form a general OS lock system.
- `reports/development/plan-53-generated-track-transcription-and-reconstruction/`: bounded GPU/audio/model work illustrates machine-level contention. Do not copy local media, model files, private paths or provider receipts into Bootstrap.
- `AGENTS.md` sections on concurrency, explicit scoped commits and single-writer integration: existing cooperative rules to preserve.

Recent Plan 58 coordination successfully serialized work but repeatedly interrupted another implementer for short dev-server capture stability windows. This observation motivates the proposal. No measured token/time savings, deployed coordinator, cross-harness notification test or fleet-wide inventory exists yet.

## What would make this wrong

The proposal weakens if most apparent conflicts are avoidable through isolated output/profile directories, static capture servers or narrower watched paths; if harnesses cannot reliably discover/use the service; if notifications do not reach agents and polling becomes equally noisy; or if requests, cleanup and configuration cost more effort than manual coordination. A single heavy-job mutex could over-serialize harmless work. Stale leases, priority inversion, restart ambiguity or inconsistent resource names could create new failures.

Benchmark a small pilot and retain simple alternatives. A service does not fix poor packet boundaries, overlapping source edits, incorrect tests, excessive approval gates, unbounded jobs, or production regressions. Those remain separate problems. Current SDK/transport documentation supports notifications, not confirmed wakeup behavior in the owner's installed harnesses.

## Technical references to recheck during investigation

- MCP architecture: https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
- Official Python SDK transports: https://py.sdk.modelcontextprotocol.io/run/
- Official TypeScript SDK notifications: https://ts.sdk.modelcontextprotocol.io/v2/servers/notifications
- Official TypeScript SDK resource subscriptions: https://ts.sdk.modelcontextprotocol.io/v2/servers/resources

These are research starting points, not pins for an implementation. Bootstrap should select compatible supported protocol/SDK versions after inspecting the actual clients.

## Delivery and ownership

Owner authorized this new inbox proposal. The originating Quackpot agent writes only this new note into Bootstrap's intake, leaves other Bootstrap files and live state alone, and does not stage, commit, assign a packet number or set a capability disposition there. Bootstrap's orchestrator owns triage, revisions, publication and commit. The proposal is open even if a future draft packet references it.
