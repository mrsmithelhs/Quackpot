# Packet Tracking System

A project-agnostic guide for adding machine-checkable status tracking to development handoff packets.

This document is written for an orchestrator or implementer setting up the system in any repository. It contains zero project-specific references and can be handed verbatim to an agent in a different codebase.

---

## 1. Problem Statement

Development handoff packets typically accumulate status drift across three hand-maintained copies:

1. A `- Status:` line in the packet body.
2. A status column in a README index table.
3. Progress-report claims in a separate reports folder.

When these diverge — and they always do over time — no one knows which is authoritative. Additional failure modes:

- **No handshake state.** When an implementer finishes, the packet jumps from `in-progress` directly to `complete`, skipping the state where the orchestrator has not yet verified. Work sits in an invisible limbo.
- **No parked state.** Intentionally deferred work looks identical to never-started work. The difference matters: a deferred packet has a reason; a never-started one might need a nudge.
- **No dependency brake.** Nothing stops an agent from starting a packet whose dependencies are not yet complete. The implementer discovers the problem halfway through and either improvises or stops — both bad outcomes.
- **Status never closes.** Packets without a written resolution stay in the `complete` or `superseded` column with no explanation of what was decided and why.

After this system: frontmatter is the only hand-written status, the README index is generated, dependencies are enforced by a `check` command before work starts, and closure is enforced by a lint rule.

---

## 2. Frontmatter Schema

Add this YAML block to the top of every packet file:

```yaml
---
id: plan-NN
title: Short Descriptive Title
status: ready
depends_on: [plan-NN, plan-NN]
gate: "owner gate at completion: specific deliverable or decision"
superseded_by: null
resolution: null
summary: >-
  One-paragraph purpose blurb. This is what the generated index row shows.
  Wrap long text — the YAML >- block scalar handles it.
---
```

**Field rationale:**

| Field | Purpose |
|---|---|
| `id` | Short canonical id for `check` / `depends_on` lookups. Must exactly match the canonical ID derived from the filename prefix (e.g. `plan-07` or `plan-10b`). |
| `title` | Human-readable name shown in the generated index. |
| `status` | Hand-set lifecycle state (see §3). This is the only place status is written by hand. |
| `depends_on` | List of packet ids whose work must be `complete` before this packet is runnable. `[]` if none. |
| `gate` | Short description of the approval gate at completion. `""` if none. |
| `superseded_by` | Required non-null when `status: superseded`. |
| `resolution` | Required one-line explanation for any terminal status (`complete`, `superseded`, `parked`). |
| `summary` | One-paragraph purpose blurb. Becomes the generated index row's description. |

---

## 3. Status Vocabulary

| Status | Meaning |
|---|---|
| `draft` | Exists, needs review before assignment. |
| `ready` | Can be handed to an implementer **if `check` passes** (all deps complete). |
| `in-progress` | Assigned and underway. |
| `delivered` | Implementer reports done; awaiting orchestrator verification. |
| `complete` | Orchestrator-verified. Terminal; requires `resolution`. |
| `superseded` | Replaced by a later packet. Terminal; requires `superseded_by` + `resolution`. |
| `parked` | Deliberately not being done. Terminal-until-reopened; requires `resolution` saying why. |

**Why `delivered`?** Without it, the orchestrator has no way to distinguish "implementer said
done but I have not checked" from "orchestrator verified and closed." The implementer reports
when its work is complete; the orchestrator sets `delivered` when that report is received and
sets `complete` only after verification.

**Why `parked`?** "Deferred" is an owner decision — not the same as never-started (`draft`) or forgotten. `parked` requires a written reason so the intent is preserved.

**Why is `blocked` computed, not hand-set?** Any packet whose `depends_on` entries are not all `complete` is effectively blocked, regardless of its own status label. A separate `blocked` status would require manual maintenance and would drift. The `check` command computes this at runtime from the dependency graph.

**Operating loop:**

1. Orchestrator sets `ready` when a packet is reviewed and ready for assignment.
2. Orchestrator promotes `ready` to `in-progress` when assigning the packet; this status change
   is the lightweight assignment signal.
3. Implementer runs the read-only `check <id>` command before starting; proceeds only on exit 0.
4. Implementer performs the work and writes the progress report; it does not change packet
   status.
5. When the implementer's report arrives, orchestrator sets `delivered` before verification.
6. Orchestrator verifies; if accepted, sets `complete` and writes a one-line `resolution`.
7. For abandoned/deferred work: orchestrator sets `parked` + writes `resolution`.
8. For replaced work: orchestrator sets `superseded` + writes `superseded_by` + `resolution`.

---

## 4. Five Script Verbs

Implement `scripts/dev/plan-status.js` as a dependency-free Node.js CommonJS script. No new npm packages — parse the YAML frontmatter subset with a small hand-rolled parser.

### `list [--json]`

Reads all packet files in `docs/development/plan-*.md`. Outputs a table:

```
id         status    effective    deps         title
plan-01    complete  complete     -            Initial Scaffold
plan-02    ready     ready        -            Core Feature Implementation
plan-03    draft     blocked      plan-02      Follow-On Investigation
```

- **`status`**: the hand-set frontmatter value.
- **`effective`**: `blocked` if `status` is `ready` or `in-progress` and any `depends_on` entry is not `complete`; otherwise same as `status`.
- `--json` outputs a JSON array for agent consumption.

**Exit codes:** always 0. This is a read command.

### `check <id>`

Determines whether a packet is safe to start implementing.

- **Exit 0 + "RUNNABLE: …"** if status is `ready` or `in-progress` AND all `depends_on` packets are `complete`.
- **Exit 1 + precise reason** otherwise. Example reasons:
  - `BLOCKED: plan-03 has status "draft" — not ready or in-progress`
  - `BLOCKED: plan-04 depends on plan-03 which has status "draft" (not complete)`
  - `BLOCKED: plan-xx: unknown id`

This is the implementer brake. The implementer must run this before starting any packet.

### `lint`

Checks the packet corpus for schema violations. **Exit nonzero if any error-level violation is found.**

Error-level violations:
- Unknown `status` value (not in the vocabulary above).
- `depends_on` entry that does not match any packet id.
- Dependency cycle (packet A depends on B which depends on A, directly or transitively).
- Terminal status (`complete`, `superseded`, `parked`) with `resolution: null`.
- `status: superseded` with `superseded_by: null`.
- Duplicate derived canonical ID values across packets (multiple files resolving to the same short ID prefix).
- `id` / filename mismatch (the frontmatter `id` must exactly match the canonical ID derived from the filename prefix: `plan-<digits>` with at most one lowercase letter suffix; a hyphen separator requires a nonempty descriptive suffix).
- Index markers stale (the content between `<!-- plan-index:begin -->` and `<!-- plan-index:end -->` in the README does not match what `render` would generate).

Warn-level (reported but do not cause nonzero exit):
- `complete` packet missing a `reports/development/<folder>/` directory (early packets may predate the convention).

### `render`

Reads all packets, sorts by id, and regenerates the packet table between the index markers in the README:

```markdown
<!-- plan-index:begin -->
| id | title | status | summary |
|---|---|---|---|
| `plan-01` | Repo Scaffold | complete | Verify the bootstrap files… |
…
<!-- plan-index:end -->
```

Everything outside the markers is untouched. Run this after adding or changing any packet frontmatter. The index is never hand-edited after markers are inserted — `render` owns it.

**Exit codes:** 0 on success. Nonzero if the markers are missing from the README.

### `set`

The write verb — the one-step replacement for "hand-edit frontmatter → `render` → `lint`":

```
node scripts/dev/plan-status.js set <id> <status> [--resolution "…"] [--superseded-by <id>]
```

It validates the inputs, surgically rewrites only the `status` (and, for terminal statuses, `resolution` / `superseded_by`) lines while **preserving the file's existing line endings**, then lints the **proposed** state — README index included — *before* writing. If the proposed state would fail lint (a terminal status with no resolution, an unknown status, a dangling `--superseded-by`), it **writes nothing** and exits nonzero. On success it writes the file, re-renders the index, and reports `<id>: <old> → <new>`. It makes **no git commits** — `set` is a status-write only; who commits the result is governed by the project's `commit-discipline` capability, not by this tool. Terminal statuses (`complete`/`superseded`/`parked`) require `--resolution`; `superseded` also requires `--superseded-by`.

**Orchestrator-only.** `set` is a status-write, and status is the orchestrator's/owner's to set — implementers never run it (see §6). If the project ships a dev console, wrap `set` behind a **Packet status** submenu with a frictionless non-terminal Set-status path and a gated Close/supersede path that demands a resolution and a confirmation.

**Exit codes:** 0 on a successful write. Nonzero (with no write) on validation or proposed-state lint failure.

---

## 5. Migration Recipe

When adding this system to a repository that already has packets without frontmatter:

1. **Read every packet.** Extract `id` (from filename prefix), `title` (from Packet title metadata), `status` (from current Status line), `depends_on` (from explicit "Depends on" sections), `gate` (from Approval gate), `summary` (from the README index Purpose column or from the packet's Goal section).

2. **Map statuses faithfully.** Do not correct what looks wrong — carry the current status value into frontmatter as-is. Suspicious statuses go into a triage report for the orchestrator. The implementer does not adjudicate status.

3. **Preserve body content.** Migration is additive. The only body mutation: replace the `- Status: <value>` line with `- Status: (see frontmatter)`. Long verification notes in the current status line move verbatim to a `### Orchestrator status notes` body subsection; `resolution:` gets a one-line distillation. Nothing else in the packet body changes.

4. **Handle compound statuses.** `complete (orchestrator-verified 2026-06-04)` → `status: complete`, `resolution: "orchestrator-verified 2026-06-04."`. `deferred (owner decision)` → `status: parked`, `resolution: "owner decision."`. Ambiguous cases go to the triage report.

5. **Insert index markers.** In the README, wrap the hand-built packet table with `<!-- plan-index:begin -->` and `<!-- plan-index:end -->` on their own lines.

6. **Run `render`.** The generated table replaces the hand-built one. Verify the content is equivalent.

7. **Run `lint`.** Fix any schema violations. Remaining status-correctness questions go to the orchestrator as a triage report — do not adjudicate.

8. **Orchestrator adjudicates the triage report.** The orchestrator reviews each flagged item and updates frontmatter `status` and `resolution` as appropriate. The implementer does not touch these.

---

## 6. What NOT to Do

- **Do not store the index in a database, SQLite file, or binary format.** Plain-text frontmatter in Markdown files is version-controlled, diffable, and directly editable by humans. External stores add a synchronization problem without solving any problem.

- **Do not hand-edit the README index after inserting the markers.** The index between the markers is owned by `render`. Manual edits will be overwritten. If you need to change an entry, change the packet's frontmatter and run `render`.

- **Implementers never set packet status to `complete`** — and never run `plan-status.js set` at all (it is the status-write verb). The `complete` state means orchestrator-verified. An implementer who sets their own work to `complete` breaks the handshake. The implementer reports done; the orchestrator runs `set … delivered`/`complete`.

- **Do not set `blocked` in frontmatter.** `blocked` is computed from the dependency graph at runtime. A hand-set `blocked` would require manual maintenance and would drift.

- **Do not leave terminal states without `resolution`.** A `complete` packet with `resolution: null` fails lint. If you close a packet, write why — future readers (and agents) need to know what was decided and whether the work actually happened.

- **Do not commit a packet with a dependency on a packet that does not exist.** Dangling `depends_on` ids fail lint. If a dependency is expected but not yet written, create the packet stub first.

---

## 7. Cross-Reference

If your project uses this system as a template, see also:

- The packet template file (includes the frontmatter block).
- The packet creation guidance doc (when to create a new packet vs. extend an existing one).
- The implementer starting prompt (includes the check-before-start instruction).
- The orchestrator starting prompt (includes the triage and verification loop).
