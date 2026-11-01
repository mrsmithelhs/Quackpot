# Owner checkpoint — optional second wave

The first-pass report (`report.md`) is complete and actionable without this. Approve all, some or none. Silence = none.

> **W1 status: owner-approved and completed 2026-11-01. Results in `experiments/w1-results.md`** (3.5/8 and 3.5/10 caught; threshold not triggered; recommendation narrowed). W2 has not been run; the owner may instead forward finding F5 to orchestration.

## W1 — Paper falsification test of the provenance card (recommended if any)
- **Question:** Would a provenance card plus a "surfaces in path" list, written only from information available *before* Plan38 (Plan28 owner-direction, delivery review, Plan38 packet), have flagged the defects the owner later found? This tests whether my primary recommendation is cheap insurance or ceremony.
- **Task:** 1 Haiku helper drafts the card blind from those three inputs (no later history). The lead scores it against the owner-found list (stand-in HUD, bare hub, duplicate cash, phone art vs target, skip-control conflict, Morning departure). Repeat once for Plan23 (inputs: DECISION-023, gate-01).
- **Decision value:** moderate. It decides whether the owner should adopt the card as a standing process. The alternative would be relying on the before/after render gate alone.
- **What would change my recommendation:** if the card would catch ≤1 of the ~6 items, downgrade it and emphasise the render gate and checkpoints.
- **Limits:** read-only, no execution, about 2 helpers plus a short lead pass. Relative effort: small (well under this first pass).

## W2 — Static check that Plan47's checkpoint proposal handles config versioning (only once its proposal exists)
- **Question:** Does Plan47's root-cleared proposal avoid the exact-match save-invalidation trap (report F5)?
- **Task:** read the Plan47 proposal and diff when published; no execution. Note this stays separate from Codex Astra and is not a production review.
- **Decision value:** high if 47 changes any `LIFE_CONFIG` value. Otherwise low. Small effort.
- **Why not now:** the proposal is not yet in the repo at HEAD `383765b`.

Not proposed: browser experiments, a scratch route-table refactor or checkpoint capture. Their value is better realised as the bounded packets A–C in the report, under normal orchestration.
