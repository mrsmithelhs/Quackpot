# Plan 02 Repair 02 — bounded waits and a fresh-build smoke entry

**Review date:** 2026-10-24

**Reviewed commits:** `b9cf61a`, `bea2026`.

**Disposition:** Repair 01's process/profile isolation, common load/reload validators, neutral page copy and auditable observations are sufficiently addressed for the current one-page spike. The final technical acceptance check is limited to the two remaining items below. Layout ratification and live Pages publication remain owner gates.

## Implementer brief

Read `AGENTS.md`, Plan 02, Repair 01 and this note. Run `node scripts/dev/plan-status.js check plan-02`; stop if blocked. Plan 02 is returned to `in-progress`. Own only the smoke script, narrowly factored wait helpers/tests, package scripts and Plan 02 progress/observations. Active Plan 01 `sim/` and results edits remain another writer's work; do not change, stage or commit them. This note and packet/index status are orchestrator-owned.

1. **Bound the waits that remain unbounded.** `smoke-browser.mjs` awaits `initialLoadPromise` and `reloadPromise` from `Page.loadEventFired` without timeout or session-close rejection. A successful `Page.navigate`/`Page.reload` CDP command does not guarantee a subsequent load event. Use a bounded event helper that rejects on timeout or CDP closure, removes listeners/timers when settled, and lets the existing cleanup run. `waitForEndpoint` also awaits each `fetch` without a request timeout, so a listening but nonresponding endpoint can bypass its advertised eight-second loop bound. Bound HTTP readiness/metadata requests as well. Add focused tests for successful event arrival, no event, connection closure, and a nonresponding local HTTP endpoint. Keep this a small helper, not a general browser framework.
2. **Make the supported smoke command use the current build.** `npm run test:smoke` currently previews whatever `dist/` exists. Add a build-before-smoke entry (for example `pretest:smoke`) or an equally concrete freshness check. Update instructions/report to use that supported entry; describe direct script invocation as requiring a prior fresh build if it remains available. Verify that the browser observes asset filenames from the build made for this run.

The orchestrator corrected two low-risk report details inline: the Receipt export is `projectReceipt`, and the publish workflow remains undecided. Preserve these corrections. Avoid adding unrelated validation or redesigning the scaffold.

## Delivery check

Run targeted wait-helper tests, existing validator tests, packet tooling and build; then run the supported fresh-build smoke entry and record observations. The orchestrator already independently rebuilt matching Repair 01 asset filenames and passed 14 validator + 45 current simulation tests plus 143 packet-tooling checks. Record the bounded failure evidence separately from the normal successful browser run. Update the progress report honestly, including the finite observation window; don't describe local observations as live Pages proof. Commit scoped implementation/observations, then progress report as the final act. Never push or set packet status. Return for orchestrator verification and the owner's folder-layout decision.
