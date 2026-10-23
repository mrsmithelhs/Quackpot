# Packet Creation Guidance

Use this guidance when creating development packets for implementer agents.

The goal is to make every packet a clear work order plus guardrail contract: what to do, what not to decide, where project truth lives, how to validate the result, when to stop for owner or orchestrator review, and what report to leave behind.

## Packet location and naming

- Put implementation packets in `docs/development/`.
- Use sequential plan names: `plan-01-short-title.md`, `plan-02-other-thing.md`.
- After adding a packet, run `node scripts/dev/plan-status.js render` to regenerate the index in `docs/development/README.md`.
- Use `docs/agent-starting-prompts/implementer-prompt.md` when starting an implementation thread.

## Frontmatter (required)

Every packet starts with a YAML frontmatter block. Use `docs/development/packet-template.md` as the starting point:

```yaml
---
id: plan-NN
title: Short Descriptive Title
status: draft
depends_on: []
gate: ""
superseded_by: null
resolution: null
summary: >-
  One-paragraph purpose blurb. This is what the generated index row shows.
---
```

See `docs/workflows/packet-tracking-system.md` for the full frontmatter field reference and status vocabulary.

## Packet metadata

After the frontmatter, every packet should include a `## Packet Metadata` section that restates the short canonical id, title, owner/model, date, packet type, mutation level, and approval gate in human-readable form. The `- Status:` line should say `(see frontmatter)`.

The `id` field in both frontmatter and metadata must exactly match the short canonical ID derived from the filename's leading `plan-<number>[suffix]` token (e.g. `plan-07` or `plan-10b`). Descriptive packet filenames remain valid, and report folders remain keyed to the descriptive basename.

## Packet summary sections

Include:

- **Goal** — what this packet accomplishes.
- **Non-goals** — what is explicitly out of scope.
- **Depends on** — blocking dependencies and why.
- **Why this packet exists** — the problem it solves.

Make the "why" concrete: the specific failure mode, missing capability, or workflow burden this reduces.

## Authority and contracts

Name the sources of truth the implementer must obey. Always include:

- `AGENTS.md`
- `docs/decision-log.md`
- `docs/development/README.md`

Add any relevant schema, workflow, or investigation docs.

List decisions the packet must not redefine. If the implementer discovers a contract appears wrong, tell it to stop and report rather than quietly changing project direction.

## Scope

Split scope into:

- In scope — what the implementer may change.
- Out of scope — what they explicitly must not do.

Be specific. Ambiguous scope is the leading cause of out-of-band decisions.

## Work plan

Use a small numbered plan:

1. Inspect the current state and confirm assumptions.
2. Implement only the bounded changes in scope.
3. Run targeted validation.
4. Run broader validation if required by the packet.
5. Write the progress report.
6. Report results, risks, and follow-ups clearly.

For scan-only or approval-gated packets, say exactly where the implementer must stop.

## Validation checklist

Every packet needs a checklist. Required items:

- [ ] Required output files or artifacts exist.
- [ ] Required report exists at `reports/development/<packet>/progress.md`.
- [ ] No unrelated files were changed.
- [ ] Approval gate is honored.

Add domain-specific items for tests, schemas, data safety, deployment, etc.

## Implementer authority boundaries (state these in every packet)

Include these stop-condition rules explicitly:

- The implementer **may not set packet completion status** (no flipping `status` to `complete`) and **may not edit orchestrator review notes** or other orchestrator/owner disposition records. It reports and stops; the orchestrator/owner verifies and sets status.
- The implementer **may not declare a packet or feature "complete," "ready to ship," or "done"** — readiness is the owner's call.
- The implementer must **report against the objective, not a proxy**: "tests pass" or a large count is evidence, not proof. The progress report should state precisely what was verified and how.

## For generative or structural work: gate on mechanism confirmation

For packets that generate content, create schemas, or make significant structural changes: add an explicit gate where the implementer must describe its approach and wiring points and **wait for approval before building**. When this gate is used, results are solid; when skipped, overclaims slip through.

<!-- bootstrap:advisor-consultation v1 begin -->
## Every packet inherits advisor-consultation; do not re-scope it per packet

The `advisor-consultation` capability (see the implementer and orchestrator starting prompts)
applies to every packet unconditionally as a **declaration requirement** — every implementer
thread states one of "consultation ran," "not warranted," or "degraded mode" — but whether an
actual consultation runs is a proportionality judgment the thread makes at packet start (a real
behavioral surface — code/script/schema changes, or anything flagged high-risk — requires it;
docs-only, prose-only, or a genuinely trivial mechanical edit does not), not a per-packet or
per-repository adoption choice. When writing a packet:

- Do not add a packet-specific "consult an advisor" requirement, a per-packet opt-out, or a
  `deferred` treatment for it in the packet's own gates or stop conditions — that misreads a
  thread-level property as a repository- or packet-level one.
- Do not pre-classify the packet as "docs-only" to pre-empt the thread's own declaration — the
  thread still states its branch explicitly at packet start, even for a packet the author
  expects to be mechanical.
- If a packet is unusually high-risk and the owner wants a consultation to be non-negotiable
  regardless of the assigned thread's provider, name the **owner-mediated consultation**
  degraded mode explicitly as a requirement for that packet. Do not silently assume a
  consultation will happen just because the capability exists.
<!-- bootstrap:advisor-consultation v1 end -->

<!-- bootstrap:commit-discipline v2 begin -->
## Commit Discipline

- You commit during review — inline repairs, docs corrections, and the closeout commit.
  Stage by explicit path.
- **If a git command fails with `index.lock: File exists`, another agent is mid-commit. Wait and
  retry.** Never delete the lock file: a lock that looks stale may be a live commit, and removing
  it can corrupt someone else's work. Disjoint write-scopes prevent content conflicts, not index
  contention — serializing here is expected, not an error.
- **Confirm the working tree is clean before setting `complete`.** Uncommitted packet
  work at closeout is a defect: invisible to commit-derived tooling, and inherited by
  the next thread as unexplained dirt.
- **A tree containing changes you did not write is a signal to stop and ask — not a staging problem
  to solve.** That is the default. You may resolve it yourself only where the correct resolution is
  unambiguous *and* nothing is discarded: changes plainly belonging to the packet under review may be
  committed with it, and changes plainly belonging to another thread's in-flight work are left
  untouched and named in your report. Anything else — including deciding *whose* work it is — goes to
  the owner. **Never resolve by discarding work**: no `reset --hard`, no `checkout -- .`, no
  stash-and-forget over changes you did not create.
- Push only with explicit owner authorization.
- Branches are for overlapping-scope or abandonable work, not a default; delete them
  when merged.
- **This governs the repository you are working in.** If your packet has you write into
  a *different* repository, that packet states whether and when to commit there — never
  infer it from this rule.

### Concurrency modes

Two variables govern whether shared-tree work is safe: concurrency and scope overlap.

- **Mode A — sequential, any scope.** One agent at a time. Safe regardless of overlap.
  Each agent commits its own work so the next starts from a clean tree.
- **Mode B — concurrent, disjoint write-scopes.** Two or more agents at once, each
  owning files no other touches. Safe; no branches or worktrees needed.
- **Mode C — turn-taking on a shared file.** Two orchestration threads deliberately
  alternating on the same file. Sequential, not concurrent — which is what makes it
  safe despite total scope overlap. Each thread commits its own turn *before handing
  back*; the commit is the handoff signal, not mere hygiene, and skipping it destroys
  the pattern's value.

Concurrent work with overlapping scopes is unsafe regardless of care — the working tree
is shared state. Serialize it (mode A or C), or isolate it on a branch or worktree.

**Single-live-orchestrator assumption.** The bounded authority above assumes you are
the only orchestrator thread acting on this tree at a time. Under mode C turn-taking,
do not apply that authority to the other thread's in-flight turn — wait for its handoff
commit before touching the shared file, and commit your own turn before handing back.
<!-- bootstrap:commit-discipline v2 end -->

<!-- bootstrap:falsification-check v3 begin -->
## For investigation packets: design for falsification

When a packet's deliverable is a conclusion (a governing rule, a root cause, a measurement), bake these requirements into the packet:

- **Hypothesis table up front:** every rival hypothesis, and next to each, **the specific observation that would falsify it.** If no falsifying observation can be named, the hypothesis isn't testable as posed — rewrite it.
- **Discriminating experiments:** for every pair of live hypotheses, at least one planned experiment where they **predict different outcomes**. Deliberately decouple variables that usually co-vary (the natural/convenient cases are usually the confounded ones).
- **Conclusion discipline:** the findings section may declare a winner only if every rival was falsified by an actual observation. Otherwise it must say "consistent with A and B" and name the next discriminating experiment — that phrasing is a success, not a failure.
- **Sweep what reality varies:** enumerate the dimensions the real user/world varies and check the test matrix covers them, not just the dimensions that are convenient to vary.
- **Report distributions, not bare means** — percentiles/min/max — so tails can't hide.

Wherever possible, anchor each of these points to a real incident from this project's own history; a remembered concrete failure carries more review weight than the abstract rule.

These cost a paragraph at design time and prevent the most expensive failure an investigation can produce: a confident conclusion the data never actually tested.
<!-- bootstrap:falsification-check v3 end -->

## Orchestrator review and repair flow

After implementation, the orchestrator decides between:

- **Accept the work as ready for owner review** — set `status: delivered` in frontmatter. This is the no-issues path. The orchestrator should not quietly accept work that hasn't been independently verified.
- **Handle repairs according to the three response tiers:**

<!-- bootstrap:review-response-tiers v1 begin -->
Use three response tiers when review finds issues:

1. **Inline orchestration edits:** For docs-only fixes, report corrections, wording cleanup, prompt/template edits, or other low-risk changes that do not require tests or further iteration, make the edits directly during review. This keeps the loop precise and avoids wasting an implementer pass on changes the orchestrator can see clearly.
2. **Implementer repair prompt:** For small-scale repairs that may require testing, iteration, generated outputs, external probes, or source changes, return a concise prompt the owner can hand back to the implementer. Include the exact files, acceptance checks, and stop conditions.
3. **Durable repair note:** For larger repairs that need multi-step coordination, substantial judgment, or should live beside the implementation evidence, write a repair note under `reports/development/<packet>/` (for example `repair-NN.md`) and summarize how it should be used.

Do not quietly make changes that require owner policy decisions, external behavior, source-material revisions, generated-output regeneration, or broad implementation testing. Route those through tier 2 or tier 3.
<!-- bootstrap:review-response-tiers v1 end -->

For investigation or conclusion-bearing packets, apply the **falsification check** (see *For investigation packets: design for falsification* above) before accepting any conclusion — the same discipline, enforced at review time.
