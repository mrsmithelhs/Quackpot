---
id: plan-65
title: Profile-wide usage history and ZIP export
status: draft
depends_on: [plan-42, plan-44, plan-64]
gate: "Root and owner approve the storage, recording, privacy and export contract before production writes. Root verifies the integration and owner reviews the actual download before closure."
summary: >-
  Preserve usage evidence and recorded achievement unlocks across runs in one
  browser profile, keep Continue tied to the current playable save, and enable
  an explicit local ZIP download from Welcome.
---

# Plan 65 — Profile-wide usage history and ZIP export

- Packet type — feature and storage contract
- Mutation level — source-data after the mechanism gate
- Lead — Codex with one read-only Terra-medium pre-delivery review
- Date — 2026-11-05
- Evidence — `reports/development/plan-65-profile-usage-history-and-zip-export/progress.md`

Read DECISION-076, the founding Receipt and offline export constraints, Plans 07, 42, 44 and 64, the current save and event log code, and the production integration review workflow. Pin the current Welcome and Receipt routes and record selected behavior, neighboring surfaces, placeholders and deferrals before implementation.

## Mechanism gate

Propose a small, versioned local usage store distinct from the current resumable save. Map each operation that can save, end, replace or clear a run. Choose the durable recording boundary, including what can be captured from a currently supported save and how unfinished or autosave-off runs participate. Specify what happens when storage is full, unavailable, corrupt, cleared or changed by another tab. Show how archive and replacement ordering survives an interruption or retry without losing the previous recorded evidence, duplicating runs or silently overwriting a newer save. Resolve these policies and shared source ownership before writing production code. Plan 64's best-effort localStorage check is a reference for current behavior.

Define run identity, history and export versions, recorded achievement identity and scope, and deterministic merge and deduplication rules. Identify an authoritative achievement unlock source. If none exists for a given achievement, defer its producer and test the contract with labeled synthetic unlocks. Preserve recorded unlocks without inventing a catalog or awarding achievements from inferred activity. Explicitly distinguish an empty list from unavailable historical evidence.

Propose what students see about local retention and clearing, what an interrupted or partial run looks like in the export, and safe limits for history and archive generation. An export must explain incomplete coverage when applicable. Use per-run IDs for deduplication, with no profile tracking identifier, names, free text, seeds, exact timestamps or whole saves in the ZIP by default. Use synthetic data only in Git and in review artifacts.

## Production behavior after approval

- Keep **Continue** tied to the current playable save. A confirmed new run uses normal autosave and manual Save rules. Before any supported replacement can displace recorded evidence, persist the applicable prior usage record. Cancel keeps the current save and accessible Receipt. Preserve the existing recovery safeguards for unsupported or corrupt saves. Explain actual consequences in the confirmation, including any still-unsaved progress.
- Archive factual usage from the versioned event log and authoritative unlock records. Reopening a Receipt, retrying a write and downloading repeatedly must preserve identities and avoid duplicate entries. Preserve honest event ordering and unknown versus zero. Keep the game log and Receipt presentation independent of the packaging format.
- Wire **Download usage file** on Welcome, including the post-Receipt route, to explicit local generation of one ZIP with a root `usage.json`. Adapt the accepted Plan 42 transport and limits to a versioned multi-run envelope, with per-run evidence completeness, compact summary and bounded timeline. Verify the exact ZIP dependency, integrity, license and local bundling before adopting it. Provide understandable empty, unavailable and export-failure states. No automatic upload or runtime external calls.

The teacher dashboard, profile identity or sync, multiple resumable save slots, a historical Receipt browser, a new achievement catalog, old unsupported-save migration, and deployment are outside this packet. Demonstrate decoder compatibility or an explicit version refusal in an isolated diagnostic. Do not import report code into the production app.

## Evidence and delivery

- Exercise real fresh, Continue, Uninstall, post-Receipt restart and Save routes using synthetic state. Verify canceled replacement, confirmed replacement followed by reload, autosave off then manual Save, and protected unsupported storage.
- Produce a ZIP through the actual Welcome button after at least two runs and an authoritative or explicitly synthetic unlock. Open the archive with an independent decoder and verify run identity, distinct timelines, retained earlier data and deduplication on repeat export. Check that prohibited fields and network transmission are absent.
- Exercise interrupted archive and replacement, concurrent tab changes, quota failures and retry, corrupt history, explicit clearing, and size limits. Verify actual saved bytes and event counts where preservation is claimed. State any concurrency or platform limits.
- Root inspects the production Welcome and Receipt paths and their neighboring states. Record the bounded Terra-medium review and dispositions, the exact build pin and browser evidence, and owner acceptance separately.
