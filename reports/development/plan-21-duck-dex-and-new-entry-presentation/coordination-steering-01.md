# Plan 21 steering — preserve concurrent work

Date: 2026-10-26. Owner requested this clarification after the apartment-phone subagent's source edits disappeared. Plan23 reports that it did not modify those files or run cleanup; root and the phone subagent also issued no restore. The cause is not established. This note clarifies ownership without attributing the disappearance to Gemini.

## Prompt for the Gemini Plan21 implementer

Continue Plan21 Repair01 only. Read this coordination note together with `repair-01.md`; it supplements rather than replaces the repair requirements. Other agents are working in this same checkout. Changes outside your assignment are expected and must survive your edits, tests and commits.

**First, check your recent actions:** Did you or your harness restore/undo `src/ui/desk-view.js` or `src/ui/shell.css`, remove `src/ui/desk-phone.css`, switch branches/checkouts, or discard changes that were not yours? Include IDE/harness undo or cleanup operations as well as terminal commands. Report what you can verify; if the answer is unknown, say unknown. Do not try to repair the disappearance yourself.

**Your production write scope:** the Duck-Dex/acquisition modules and their focused tests; narrowly necessary integration in `src/main.js`, `src/ui/gacha-view.js`, `src/ui/hud.js` and `src/ui/duck-rig-view.mjs`; narrowly necessary Dex/reveal/persistence methods and tests in `src/core/game-engine.mjs` and `src/core/storage.mjs`. Preserve unrelated behavior and concurrent hunks within those files. Your report scope is your Plan21 report folder, excluding orchestrator-authored review, repair and steering notes. Any additional path requires an explicit scope extension from the owner/orchestrator before editing.

**Reserved or excluded:**

- Apartment phone: `src/ui/desk-view.js`, `src/ui/desk-phone.css`, `src/ui/shell.css`, stage-transition files and `reports/orchestration/apartment-phone-presence-follow-up.md`. Do not implement, remove or restore these. Phone implementation is currently on hold.
- Plan23: everything under `reports/development/plan-23-production-race-integration/`, the Plan23 packet, and any race resolver/view/playback/motion files. Plan23 currently owns report-only calibration work; it does not have a production-writing grant. It must receive a source handoff before later changing shared main/engine/storage files.
- Orchestrator/owner records: `AGENTS.md`, founding design, decision log, starting prompts, packet frontmatter/index and other plans' artifacts. Leave existing changes there alone; do not commit them as part of Plan21.
- Existing global styles and shared rig/motion modules are not a general cleanup allowance. Seek a bounded extension if a repair genuinely needs an additional path.

**Preservation rules:**

1. Inspect `git status --short` and relevant diffs before editing. An untracked file is not disposable; an unfamiliar change is not automatically a mistake.
2. Do not use workspace-wide undo/cleanup, `git reset --hard`, `git clean`, broad restore/checkout, stash, or branch/worktree switches to obtain a clean tree. Do not reset unrelated files after tests. If your harness offers a “discard unrelated changes” action, do not use it.
3. Make small targeted edits against current contents. If a file changes unexpectedly, preserve it and report the conflict rather than replacing it from an older snapshot. Never treat a prior read as permission to overwrite a newer version.
4. Stage only your exact paths and inspect the staged diff immediately before committing. If another agent has staged files, stop and coordinate the commit window. Do not amend another agent's commit. If `index.lock` already exists, wait; never delete it.
5. Test output ownership counts too. Direct browser smoke observations to your Plan21 report folder, for example with `QUACKPOT_SMOKE_OBSERVATION_OUTPUT`, instead of replacing the historical Plan03 observations. If an existing check cannot redirect its output, coordinate before running it; do not silently overwrite another packet's evidence.
6. Request a browser slot through the owner/orchestrator before browser-driving checks. No slot is granted by this note. Use isolated test state and do not replace owner saves.

Return a short acknowledgment of the write boundaries and your verified answer about the missing files, then continue the existing bounded repair if no conflict exists. No new advisor call, push, deployment, packet-status change or unrelated cleanup is authorized.
