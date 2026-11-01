# Experiments

## E1 — Are test files outside `npm test` silently broken?

- **Baseline:** HEAD `383765b` (pinned `96c1b96` + review handoff docs only; identical `src/`). Clean working tree confirmed immediately before the run.
- **Question:** Eight tracked test files are not listed in `package.json` `test` (computed by diffing `git ls-files '*.test.mjs'` against the script string): `src/core/life-progression.test.mjs`, `src/ui/acquisition-queue.test.mjs`, `src/ui/duck-dex-view.test.mjs`, `src/ui/receipt-presentation.test.mjs`, `src/ui/duck-motion-controller.test.mjs`, `src/ui/ambient-glow-controller.test.mjs`, `src/ui/apartment-view.test.mjs`, `src/assets/apartment/apartment.test.mjs`. Grep found none of them in any `package.json` script; four appear only in `scripts/dev/checkpoints/run-controlled-phase.mjs`.
- **Competing predictions:** (a) some already fail → demonstrated silent rot; (b) all pass → latent exposure only (future packets running `npm test` would not see regressions in these areas).
- **Method:** unchanged Plan 25 launcher `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 node.exe --test --test-reporter=tap <8 absolute paths>`, cwd = this `experiments/` folder. Preflight: ~45 pre-existing node processes (≈1.5 GB private total, not owned, untouched), ≈9 GB free physical memory. Test files grepped for `writeFile|appendFile|mkdir`: none.
- **Result:** exit 0, 1.12 s, peak sampled 94,466,048 bytes, no stop reason, no cleanup notes. 87 tests, 87 pass, 0 fail. Full TAP in `omitted-tests-run.txt`.
- **Conclusion:** prediction (b). Nothing has rotted yet; the finding is an exposure, not a defect. The exposure covers Plan38's core phase/obligation contract (50 tests), the Plan21 discovery queue, the Plan44 Receipt adapter and the Plan20/25 motion controllers.

## Not executed (static inference, labelled as such in the report)
- `npm run test:smoke` vs HEAD: the script clears storage, starts a fresh run (fresh runs are `lifePolicy: true`, `src/main.js:203`), then waits for `#btn-pay-rent` (`scripts/dev/smoke-browser.mjs:602,782`), which no `src/` file contains since `9bf4432`. It also sets `window.__E2E_INSTANT_RACE__`, which no `src/` file reads. Predicted to time out. Not run: it needs a browser and a build, and a static check already settles the question.
- Checkpoint freshness: every checkpoint fixture is `schemaVersion` 3 without `life`; the pinned source-closure hashes for `game-engine.mjs`, `storage.mjs` and `main.js` differ from HEAD (helper E, `scripts/dev/checkpoints/catalog.json` + manifest). Not run because `revalidate` rewrites `fixture-validation-index.json` and appends `pilot-results.jsonl` inside the repo.
