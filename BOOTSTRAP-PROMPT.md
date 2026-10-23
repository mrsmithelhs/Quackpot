# Bootstrap Prompt

Paste this message to an agent in your new project after running the Bootstrap-side `bootstrap-init.js` initializer (or completing the documented manual fallback).

---

You are setting up the orchestrator/implementer process for this project. Bootstrap's consumer-safe files have already been initialized into this repository. Your job is to customize them for this specific project - replacing placeholders, removing `.template` suffixes, reconciling capability choices, and verifying the tooling runs.

## Your task

Work through `CUSTOMIZATION-CHECKLIST.md` item by item. For each project-specific template token listed there:

1. **Read the project** to find the answer. Read `README.md`, `src/`, the existing code structure, any existing docs, and `git log --oneline` if there is history.
2. **Fill in the value** based on what you observe. Do not invent policy or make decisions the owner hasn't made.
3. **If you cannot resolve a placeholder** from the project itself — because it requires an owner decision — mark it `[UNRESOLVED: <one-line question for owner>]` and continue. Do not guess.

## Specific steps

0. **Verify the setup source.** Read the "Required: what NOT to copy (Bootstrap-self exclusion list)" section of `CUSTOMIZATION-CHECKLIST.md`. If this project was initialized by `bootstrap-init.js`, confirm the listed Bootstrap-self files are absent. If it was copied manually, stop and remove any Bootstrap-self material before customization continues.
1. Read `CUSTOMIZATION-CHECKLIST.md` fully before starting.
2. Read `AGENTS.md.template`, `CLAUDE.md.template`, `docs/README.md.template`, `docs/decision-log.md.template`, `docs/open-questions.md.template`, `docs/development/README.md.template`, every file in `docs/agent-starting-prompts/`, the four `.claude/agents/*.md` files, and the three `.codex/agents/*.toml` files. Codex uses its built-in `explorer`; do not create a project override for it.
3. Read the project: `README.md`, top-level directory listing, key source folders, any existing docs.
4. Resolve every project-specific token in the customization targets (`*.template` files and role-specific starting prompts) and apply the replacements. The checklist and this setup prompt are control documents and may retain literal token names when describing the process.
5. Rename files: `AGENTS.md.template` -> `AGENTS.md`, `CLAUDE.md.template` -> `CLAUDE.md`, `docs/README.md.template` -> `docs/README.md`, `docs/decision-log.md.template` -> `docs/decision-log.md`, `docs/open-questions.md.template` -> `docs/open-questions.md`, and `docs/development/README.md.template` -> `docs/development/README.md`.
6. **Reconcile/Select capabilities and manifest (`.bootstrap-adoption.json`)** — follow "Required: capability selection" in `CUSTOMIZATION-CHECKLIST.md` exactly:
   - **If initialized via `bootstrap-init.js`**: A starter `.bootstrap-adoption.json` manifest is already created, and capability definitions are summarized in `docs/development/bootstrap-capabilities-summary.md`. Read the summary and the manifest. For any capability marked `deferred`, ask the owner for their decision (adopt, or decline with rationale).
   - **If set up manually (fallback)**: Read `bootstrap-capabilities.json` and the schema in `docs/bootstrap-adoption-schema.md` from the upstream Bootstrap repository folder. Walk the capabilities list in channel order (`core` default-adopt, `recommended` default-adopt-with-confirmation, `optional` default-ask) to build `.bootstrap-adoption.json` at the target root.
   - For both flows:
     - Flag any `dependsOn` conflict (adopting a capability while declining something it depends on) to the owner instead of resolving it yourself.
     - Do not delete a declined capability's leftover files — print a one-line note per declined capability whose files are still present instead.
     - Confirm the manifest covers every capability and parses as valid JSON with the correct versions before moving on.
7. Run `node scripts/dev/plan-status.js render` from the project root. Confirm it writes the index markers without error.
8. Run `node scripts/dev/plan-status.js lint`. Fix any errors before continuing.
9. Fill in `CUSTOMIZATION-CHECKLIST.md` with your resolved values, your capability decisions, and any `[UNRESOLVED]` items.
10. Present the filled-in checklist to the owner.

If the project exposes `npm run dev:console`, treat it as a growing submenu-driven hub rather than a flat command list: group local dev, tests, builds/deploys, packet-status visibility, and advanced scripts, and gate any mutating or external-state command behind an explicit confirmation prompt. Keep packet-status list/status access visible in that menu so the safe read path stays discoverable. If the console executes package scripts:
- Centralize package-script execution behind a shared wrapper helper.
- Avoid spawning raw `npm.cmd` directly on Windows (spawn `cmd.exe /d /s /c "npm run <script> -- <args>"` or equivalent tested wrapper with `shell: false` to avoid launch/EINVAL issues).
- Ensure the invocation command shown to the user on confirmation screens is the exact same command object that gets executed.
- Report spawn/launch failures (e.g. `result.error`) distinctly from child process nonzero exit statuses so environment/configuration errors are immediately debuggable.
- Add regression tests to the console's test suite to cover script launching and error handling.

## What you must NOT do

- Do not invent `{{PROJECT_SPECIFIC_DATA_RULES}}` or `{{PROJECT_SPECIFIC_CONTRACTS}}` — these require owner input if the project has no existing policy. Mark them `[UNRESOLVED]` instead.
- Do not decline a `core` capability on your own judgment — that requires an explicit owner statement (see `CUSTOMIZATION-CHECKLIST.md`).
- Do not auto-resolve a `dependsOn` conflict (adopting a capability while declining something it depends on) — flag it to the owner.
- Do not delete a declined capability's leftover files — note their presence instead.
- Do not invent a `localRationale` for a `declined` capability — it must be the owner's actual stated reason.
- Do not create development packets yet — that is the orchestrator's job after setup is complete.
- Do not modify or de-template the `.claude/agents/*.md` files, `.codex/agents/*.toml` files, or the `subagent-delegation` managed-prose block in `AGENTS.md` - they are already project-agnostic. Do not add `.codex/agents/explorer.toml`; Codex's built-in explorer is intentionally used.
- Do not modify `scripts/dev/plan-status.js` or `docs/workflows/packet-tracking-system.md` — they are already project-agnostic.
- Do not delete `CUSTOMIZATION-CHECKLIST.md` — the owner needs it for review.
- Do not commit. Leave the final commit to the owner.

## When you are done

Report:
- All resolved placeholder values.
- All `[UNRESOLVED]` items and what decision is needed.
- Your capability selections (adopted/declined per ledger entry) and any `dependsOn` conflicts you flagged to the owner.
- Confirmation that `.bootstrap-adoption.json` was emitted, covers every ledger capability, and parses as valid JSON with the required fields.
- Result of `render` and `lint`.
- Any files you couldn't customize because the project lacked enough context.

The owner will review your work, make decisions on unresolved items, and then commit the result.
