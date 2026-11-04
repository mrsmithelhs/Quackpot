# Temporary resource and preview addendum

**Owner-authorized local pilot, 2026-11-03.** Use while Bootstrap's separate resource-manager project is being developed. This supplements current Quackpot handoffs for resource coordination only. It does not adopt an MCP capability, install a service, start any job, reopen a paused study, change packet scope, or remove owner/orchestration review gates.

Root should link this addendum in subsequent handoffs and relay it to participating active chats. Existing experiments, installations, provider disclosures and owner-review pauses retain their substantive gates. Where an earlier handoff requires a separate root resource allocation for every routine validation invocation, the standing-lane procedure below replaces that traffic within an approved batch. A packet-specific safety or semantic gate is not waived by this document.

## Immediate changes we can pilot

1. Permit up to **two modest bounded execution jobs concurrently**, with named standing lane owners, instead of one global execution window.
2. Let implementers execute routine validation and bounded corrections within an already approved method/batch without requesting a new root turn per invocation.
3. Prefer task-owned, non-watching static preview/capture servers and stable inputs. Do not pause unrelated repository writers merely because a browser is open.
4. Keep messages for meaningful milestones, conflicts, exceeded scope/resources, failures requiring judgment and delivery. Do not send acquire/release chatter for every command inside a standing batch.
5. Keep proposal, authorization, technical/visual review, owner decisions, Git-index serialization and production integration boundaries intact.

This is a conservative concurrency experiment, not a claim that two jobs always fit or that all Node/browser work should be serialized into one category. Reassess after the first three genuinely overlapping modest-job batches, or sooner after memory pressure, instability or ownership ambiguity. Do not manufacture work just to fill both lanes.

## Resource map and standing lanes

| Resource/activity | Interim treatment |
|---|---|
| Modest computation | One named compute-lane owner for an approved stretch of focused tests or small finite simulation shards. |
| Isolated browser capture/render | One named preview-lane owner for an approved gallery/validation stretch; separate profile, outputs and preferably static snapshot. May overlap the compute lane. |
| Two modest compute jobs | Root may assign both lanes to compute when no capture needs one. Still only two total concurrent jobs in this pilot. |
| Full suite, large render, broad simulation, substantial download/install | Heavier work: retain explicit root resource planning; do not assume it counts as one modest job merely because its launcher has a limit. |
| GPU/ML inference | Existing separate machine-level proposal/preflight/monitoring authority remains. No new simultaneous GPU work authorized. |
| Git index mutation | Short exclusive stage/commit turn, independent of compute lanes. Explicit paths; never remove index.lock or commit another agent's staged work. |
| Shared semantic source/output | Existing single-writer ownership or explicit turn-taking remains. Spare memory does not make overlapping edits safe. |
| Owner browser/profile/server | Preserve owner access. An agent-owned preview is not permission to control or stop an owner's service or inspect owner storage. |
| Small task-owned static server | Supporting infrastructure for its batch, counted in that batch's resource observation; not an extra heavy execution lane by itself. |

Node is a runtime, not a resource class. A focused pure test and a simulation with disjoint outputs may coexist. A full test command can spawn multiple workers; its whole owned process tree matters. A browser and a test can have enough memory while still conflicting over one output directory or live-reloaded source.

### Admission without a resource service

Root names the lane owner, scope and release boundary **once per coherent work stretch**, not before each command. Lanes are currently unassigned by this document; existing chats waiting for owner judgment remain paused. Root records the assignment in the authorized chat handoff. Within that stretch, the owner may sequence its approved jobs itself; it must not start multiple simultaneous jobs in one lane or transfer its lane to another chat.

There is no automatic claim queue or atomic grant mechanism yet. Two agents observing low memory use must not independently infer ownership of the same lane. Ask root only for a new assignment, a real conflict or a material change. Do not keep a lane while awaiting owner choices, doing unrelated long reading, or after completing its batch. Release at the batch/phase boundary; an abandoned allocation needs root reconciliation, not a guessed timeout takeover.

The two-lane arrangement is local Quackpot coordination, not a machine-wide guarantee against other repositories. A new identified heavy job elsewhere, unexpected large process or owner-reported contention requires reassessment. Never kill unrelated processes to satisfy a preflight.

### Bounds and observations

Existing Node commands still use the unchanged Plan25 bounded launcher. Its ordinary 90-second wall, 1 GiB Node heap environment and 2 GiB sampled owned-tree controls are not silently raised. The heap setting is not a whole-machine memory limit, and sampled thresholds can miss transient peaks. Two simultaneous 2 GiB envelopes are not a hard aggregate 4 GiB guarantee.

For the initial overlapping-job pilot, check actual host memory/process state before each job; start only with at least **8 GiB available physical RAM**, no identified competing heavy validation/inference outside the assignment, and no unexplained large/runaway process. This is a temporary admission floor, not measured optimal capacity. If it fails, stop and report; do not free memory by terminating someone else's work or silently relax it. Root may approve a better measured threshold later.

Keep work modest and finite: targeted test paths, bounded seed shards, one isolated capture, no watcher or unbounded fan-out. Measure combined behavior during paired batches where practical: job types, overlap interval, sampled peaks/minimum available memory, wall time, exit/stop and observed cleanup. Reuse useful runner receipts; do not build a new telemetry framework or publish unrelated host/process data. Report uncertainty honestly. A successful parallel run does not establish all future workloads fit.

## Routine fixes and reduced traffic

Within a root-approved method and named lane, an implementer may make routine owned-code/harness fixes and rerun the affected validation without another allocation message. For an initial pilot repair batch, allow the initial validation plus **up to two materially corrected reruns** under unchanged bounds. Preserve each failure and explain the correction in the final batch report. Do not repeat an unchanged failing command, filter seeds/results, overwrite a failed receipt or rerun an outcome-changing experiment just to obtain a better answer.

This allowance covers issues such as a verified harness syntax correction, a local selector fix, or a CSS composition repair under the same approved design. It does not authorize new provider inference, another ML transcription, an enlarged simulation matrix, a new renderer strategy, new permissions/dependencies, broader filesystem access, changed game rules or larger resource limits. Those keep their existing gates. Provider calls and non-idempotent experimental runs retain the approved count/retry policy.

After the bounded repair allowance, a persistent substantive failure, uncertain ownership, unexpected tool behavior or a need to change the method goes to root with a compact diagnosis. An automatic execution-review rejection is not permission to find a bypass; report its stated reason and preserve unaffected work.

One start message and one completion/blocker message per meaningful batch are sufficient. Intermediate commentary should communicate a finding, changed risk or decision, not bookkeeping. Root still reads proposals, clears meaningful scope/resource changes, inspects actual artifacts and before/after visual evidence, and decides technical readiness. Owner still selects experience/art/music and approves applicable gates.

## Dedicated previews and servers

### Three distinct uses

- **Owner production review:** preserve the existing owner-controlled server and URL, currently port 5173. Do not restart, replace or stop it for an implementer's convenience.
- **Interactive development:** an implementer may use a task-owned server when needed within its approved task. Separate ports alone do not isolate source or prevent live reloads; do not launch several Vite watchers on the same tree as the default remedy.
- **Automated evidence:** prefer a finite non-watching static server serving a pinned task-owned snapshot. Other agents can then keep making disjoint edits while the browser checks stable files.

Existing bounded static-server patterns may be reused/adapted within approved report-local scope. A new general helper, changed lifecycle/security contract or new dependency still needs an ordinary bounded proposal/review. This addendum is process clearance, not a claim that a reusable snapshot/server implementation already exists.

### Stable snapshot contract

Use an ignored task-specific directory and an explicit allowlist of the page, required local/transitive imports, CSS and selected assets. Do not copy the entire repository, secrets, private provider sessions, model caches, unrelated ignored media or owner browser state. Preserve relative paths/module semantics; dynamic imports or bundler-only features require an appropriate bounded build rather than pretending plain file serving is equivalent.

Record source and snapshot hashes, serve the snapshot unchanged, and report which source revision it represents. Check for changes during snapshot preparation and stop/rebuild the snapshot coherently if it is mixed; no new complete-repository freeze is implied. Use a fresh output per attempt, not another agent's shared dist/, fixture, receipt or screenshot file. Build snapshots in per-task output directories if a build is needed. A snapshot is evidence at its pins, not proof of current production after later source edits.

If a small report genuinely imports live files directly, an ordinary static server eliminates hot reload but NOT source drift. Pin and check those inputs before/after. If another writer owns an imported file, arrange a specific source-stability window or snapshot it; do not demand a repository-wide pause from unrelated writers. A quiet window is a fallback for a named real conflict, not an automatic browser requirement.

### Lifecycle and endpoints

- Bind only to loopback. Prefer an OS-assigned available port for automated work and consume the actual advertised endpoint. Verify body/route readiness, not just that a TCP port answers.
- Serve only the intended root, with correct JS/MJS MIME types and explicit base-path handling. Do not guess localhost versus 127.0.0.1 or add/remove /Quackpot/ independently of what the helper serves.
- Launch the server as an owned child of the finite runner, capture its identity and endpoint, stop it in finally and wait for observed exit. The server also needs its own finite deadline if its parent fails. Neither a generic process name nor a numeric PID alone proves ownership.
- Automated servers should live no longer than their approved batch/runner envelope. Existing examples use 85 seconds inside a 90-second job or a finite 15-minute preview. A longer owner-facing preview must have an explicitly agreed review lifetime; do not unexpectedly expire a page handed to the owner.
- Avoid detached helpers without an owner/lifetime. Never solve cleanup by killing every process on a port or every Python/Node/Chrome process. Retain and report a live residual or ownership uncertainty; sampled observations are not proof that all possible descendants disappeared.
- Supporting servers and browser profiles stay local. Do not broaden network binding, add persistent startup tasks, change firewall rules, or register a service under this pilot.

Useful existing examples, with their original scopes and limitations: Plan28 comparison/serve-bounded.py; Plan53 low-register-static-server.py; Plan52 rent-display-static-server.mjs. These are patterns to inspect, not interchangeable general-purpose wrappers or blanket authority to execute old packet commands.

## What waits for the MCP resource project

Do NOT imitate these features with a hastily shared JSON file or informal promise that status reads are atomic:

- Cross-project atomic grants, multi-resource acquisition and deterministic fair queues.
- Lease ownership tokens, offered turns, renewal policy and overdue reconciliation.
- Persistent machine-level capacity accounting or automatic admission from memory estimates.
- Server notifications, subscriptions, reconnect recovery and harness-specific agent wakeup.
- Automatic stale-owner recovery, background process supervision or administrative overrides.
- Machine-wide inventory/adoption and integration with shared launch wrappers.

Until those are implemented and adopted, named lane assignments and existing direct root communication handle genuine contention. MCP availability will not erase proposal, execution-bound, privacy, ownership, inspection or owner-review requirements.

## Pilot assessment and retirement

Ask whether the pilot reduced traffic-cop messages, allowed useful overlap, preserved bounded cleanup and kept stable preview evidence without interrupting other writers. Record incidents as well as successes; no performance or token-saving claim is made yet. Stop/adjust the pilot after pressure, conflicting ownership or repeat lifecycle failures rather than treating two lanes as a target to force.

This addendum remains a temporary local operating decision. Root will explicitly reconcile/retire it when the shared resource service is ready or new evidence changes the recommendation. Do not leave both mechanisms active with contradictory grants. Bootstrap owns its separate project; Quackpot can supply observations through its inbox without claiming fleet adoption.
