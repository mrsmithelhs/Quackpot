# Implementation Reports

This folder holds durable implementer progress reports.

## Convention

Every development packet should produce a report at:

```text
reports/development/<packet-folder>/progress.md
```

The `<packet-folder>` matches the packet filename without the `.md` extension (e.g., `plan-01-repo-scaffold`).

## What a progress report must contain

- **Overall summary** — what was done, what was not done.
- **Files changed** — list with brief note on each.
- **Artifacts produced** — generated outputs, reports, exported files.
- **Commands run and results** — exact commands and pass/fail outcomes.
- **Validation checks** — which checklist items passed, which need follow-up.
- **Problems encountered** — and how they were resolved or escalated.
- **Remaining risks or follow-ups** — honest list; do not bury concerns.
- **Ready for orchestrator review: yes/no** — the implementer's own assessment.

## What the orchestrator does with a report

The orchestrator:
1. Checks that claimed artifacts actually exist and behave as described.
2. Checks that the validation checklist maps to the actual objective, not a proxy.
3. Either accepts the work (sets `complete` + `resolution` in frontmatter) or returns repair directions.
4. Does not silently accept work that hasn't been independently verified.

## Note on implementer overclaiming

Implementers sometimes declare work "complete" or "release-ready" based on tests passing or large output counts. Treat those claims as evidence, not proof. Verify that the tested behavior is the behavior that matters — the gap usually only shows under independent inspection.
