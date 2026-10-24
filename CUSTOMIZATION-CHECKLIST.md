# Customization Checklist

Every project-specific template token listed below must be resolved in the customization targets before Bootstrap is usable. This file is the authoritative list; it may retain the literal token names as checklist labels after customization.

The customizing agent reads your project and resolves each item. Items it cannot determine from the project are marked `[UNRESOLVED]` and presented to the owner.

**The agent must not invent policy.** If a placeholder requires an owner decision, the agent surfaces it here and stops rather than guessing.

After the agent finishes, the owner reviews this file. Every item should be resolved or explicitly deferred with a reason.

---

## Required: project identity

| Placeholder | Where used | What to fill in | Resolved value |
|---|---|---|---|
| `{{PROJECT_NAME}}` | AGENTS.md.template, CLAUDE.md.template, docs/README.md.template, orchestrator prompt, implementer prompt, design-review prompt | The project's short name (e.g., "MyProject"). Used in headings and context. | **RESOLVED:** `Quackpot` |
| `{{ONE_LINER}}` | AGENTS.md.template, orchestrator prompt, implementer prompt, design-review prompt | One sentence describing what the project is and does. Avoid jargon. | **RESOLVED:** `Quackpot is a public, static browser gacha game used in CourseVGD to help students critically examine microtransaction design by experiencing a fictional duck-collecting game and reviewing an end-of-run Receipt.` |
| `{{STAGE}}` | AGENTS.md.template, orchestrator prompt, implementer prompt, design-review prompt | Current project stage (e.g., "early development", "pre-launch", "post-pilot iteration", "maintenance"). | **RESOLVED:** `founding design complete; pre-implementation (awaiting GATE-53C before first development packets)` |

## Required: project structure

| Placeholder | Where used | What to fill in | Resolved value |
|---|---|---|---|
| `{{AREA_MAP_TABLE}}` | AGENTS.md.template | A markdown table listing the project's key areas, strands, modules, or components and a one-line description of each. May be left as a stub if the project is early-stage. | **RESOLVED:** Populated in `AGENTS.md` §2 covering Founding design (`docs/founding/design.md`), Project seed (`docs/project-seed.md`), Founding design review (`reports/orchestration/founding-docs-review/`), Packet & status tooling (`scripts/dev/plan-status.js`, `docs/development/`), and planned post-GATE-53C Gameplay/simulation/teacher-analyzer areas. |
| `{{REPO_STRUCTURE}}` | AGENTS.md.template | A tree-style listing of the top-level repo directories and their roles. Read the repo root and write this from observation. | **RESOLVED:** Populated in `AGENTS.md` §3 from observed repository directories (`.claude/agents/`, `.codex/agents/`, `docs/`, `reports/`, `scripts/dev/`, `.bootstrap-adoption.json`, `advisor-capable-providers.json`). |
| `{{ROUTING_TABLE}}` | AGENTS.md.template | A markdown table of topic → file mappings for the project's key reference files. At minimum: schema files, key implementation modules, and workflow docs. Leave blank if the project is new. | **RESOLVED:** Populated in `AGENTS.md` §6 mapping `docs/founding/design.md`, `docs/project-seed.md`, `reports/orchestration/founding-docs-review/owner-triage.md` & `dispositions.md`, `docs/workflows/packet-tracking-system.md`, `docs/development/packet-creation-guidance.md` & `packet-template.md`, and `docs/development/bootstrap-capabilities-summary.md` & `.bootstrap-adoption.json`. |

## Required: technical

| Placeholder | Where used | What to fill in | Resolved value |
|---|---|---|---|
| `{{KEY_COMMANDS}}` | AGENTS.md.template | The project's standard test/build/run commands (e.g., `npm test`, `npm run build`, `python -m pytest`). The plan-status commands are already included; add project-specific ones here. If the project uses `npm run dev:console` as a submenu-driven command hub, describe it briefly here. | **RESOLVED:** `node --test scripts/dev/plan-status.test.js` (with note that no `package.json` or Vite build exists yet — awaiting first implementation packets after GATE-53C). |
| `{{ARCHITECTURE_CONSTRAINTS}}` | AGENTS.md.template | Critical technical constraints that could break things if violated (e.g., "all shared modules must be CommonJS", "no top-level await", "no third-party deps in the shared layer"). Read the code before filling this in. If none are known yet, write "None identified yet — update as constraints emerge." | **RESOLVED:** Populated in `AGENTS.md` §5 from `docs/founding/design.md` and `docs/project-seed.md`: (1) No network calls or runtime CDN libraries (Hard Constraint #2); (2) Static build output served from GitHub Pages with Vite permitted for dev/build, not published from `docs/` (Hard Constraint #7); (3) Student-initiated offline file export and local-only multi-file teacher analyzer (Hard Constraint #3); (4) No Bootstrap dependency in student game and CourseVGD is an independent user; (5) SVG art source & synthesized jsfxr/ZzFX audio; (6) Seedable PRNG & local append-only Receipt log; (7) Folder layout in `docs/project-seed.md` is unratified until after the first build and deployment spike. |

## Required: contracts and data rules

| Placeholder | Where used | What to fill in | Resolved value |
|---|---|---|---|
| `{{PROJECT_SPECIFIC_DATA_RULES}}` | AGENTS.md.template guardrails section | The project's privacy/asset rules. Example: "No real names, emails, private records, or sensitive customer data in the repo. Anonymize before committing." Or: "No third-party proprietary assets (images, sounds, fonts) copied into the repo." Required; do not leave as a placeholder. | **RESOLVED (from `README.md` & `docs/founding/design.md`):** `Public-repository privacy, fiction, and asset rules: Never commit personal information, student data, exported student run-usage files, credentials, analytics keys, or deployment secrets (README.md, docs/founding/design.md). Include no real companies, games, people, or brands—all publishers, products, sponsors, and streamers must remain fictional while retaining owner-selected satirical names (Hard Constraint #6). All art must begin as SVG source in the repository (with per-asset PNG delivery only where measured testing shows benefit) and sound effects as text-stored synthesis parameters (docs/founding/design.md §Assets).` |
| `{{PROJECT_SPECIFIC_CONTRACTS}}` | orchestrator prompt | The project's durable contracts the orchestrator must preserve (e.g., folder roles, generated-vs-source-of-truth distinction, release gate rules). Read `docs/decision-log.md` and the existing docs before filling in. If none exist yet, write: "*(No contracts established yet — add them as owner decisions are made.)*" | **RESOLVED (from `docs/founding/design.md` & `docs/project-seed.md`):** Populated in `docs/agent-starting-prompts/orchestrator-prompt.md` covering canonical design authority (`docs/founding/design.md` vs `docs/project-seed.md`), the 7 Hard Constraints, the O1 Receipt honesty contract (three registers, conditional pre-draw odds, fired-cue-only reporting), SVG/audio/PRNG/no-per-variant-balancing contracts, and the GATE-53C / unratified folder-layout boundaries. |

---

## Required: what NOT to copy (Bootstrap-self exclusion list)

Bootstrap tracks its own development using the same packet system it ships. That means Bootstrap's own copy of this folder contains **live, Bootstrap-specific content that must never be copied into a new project**:

| Do NOT copy | Copy instead |
|---|---|
| `docs/development/README.md` (Bootstrap's own live packet index) | `docs/development/README.md.template` (the empty index - rename it per below) |
| `docs/decision-log.md` and `docs/open-questions.md` (Bootstrap's own live governance records) | `docs/decision-log.md.template` and `docs/open-questions.md.template` (empty portable scaffolds - rename them per below) |
| `docs/development/plan-*.md` (Bootstrap's own meta-packets, e.g. `plan-01-bootstrap-sync-ledger-and-drift-audit.md`) | nothing — a new project starts with zero packets and creates its own from `docs/development/packet-template.md` |
| `reports/development/plan-*/` (Bootstrap's own packet reports) | nothing — a new project's reports folder starts empty |
| `reports/advisor-consultation-reflections/` and `reports/advisor-consultation-reflections-rollup.md` (Bootstrap-self reflection archive and rollup) | nothing — a new project's reports folder starts without Bootstrap-self reflection data |
| `reports/fleet-scans/` (Bootstrap-self fleet-triage reports) | nothing — a new project's reports folder starts without Bootstrap's fleet reports |
| `bootstrap-capabilities.json`, `docs/bootstrap-capabilities.md`, `CHANGELOG.md`, `docs/bootstrap-adoption-schema.md`, `docs/bootstrap-sync.md`, `scripts/bootstrap-audit.js`, `scripts/bootstrap-adopt-copy.js`, `scripts/bootstrap-adoption-inventory.js`, `scripts/bootstrap-advisor-reflections.js`, `scripts/bootstrap-advisor-reflections.test.js` | these are Bootstrap-self sync tooling (used to audit and adopt into *consumers* of Bootstrap) — they belong only in Bootstrap, not in the consumer being instantiated |
| `scripts/bootstrap-fleet-scan.js` and `scripts/bootstrap-fleet-scan.test.js` (Bootstrap-self fleet evidence tooling) | nothing — fleet scanning operates over Bootstrap's whole consumer registry and is not consumer-adoptable |
| `bootstrap-adopters.json`, `scripts/bootstrap-consumer-registry.js`, `scripts/bootstrap-consumer-registry.test.js`, `docs/bootstrap-consumer-registry.md`, `scripts/bootstrap-dev-console.js`, `scripts/bootstrap-dev-console.test.js`, `scripts/bootstrap-fleet-console.js`, `scripts/bootstrap-fleet-console.html`, `scripts/bootstrap-fleet-console.test.js` | Bootstrap-self consumer registry data, tooling, and dev consoles (plan-19/plan-21/plan-34); keep the ignored local data and Bootstrap-self implementation, tests, and documentation out of consumer initialization |
| `docs/bootstrap-dev/` (Bootstrap-self orchestrator/implementer starting prompts, **and the `incoming/` cross-project proposal drop folder**) | nothing — these are for working on Bootstrap itself, not on the project being instantiated; the consumer uses `docs/agent-starting-prompts/*` instead |
| `.claude/settings.local.json` (Bootstrap local settings) | nothing — these are for working on Bootstrap itself; the consumer's environment handles its own local settings (beyond basic scope; added for manual-fallback safety) |

Everything in the initializer allowlist (`scripts/bootstrap-init.js`) is project-agnostic and meant to be copied. Treat that allowlist as the source of truth for manual fallback setup rather than inferring portability from the repository tree.

This exclusion is what keeps Bootstrap usable as a template source while also being its own tracked project: new-project instantiation must still yield a clean empty packet index, never Bootstrap's own backlog.

## Required: capability selection (`.bootstrap-adoption.json`)

Bootstrap is not "copy everything and forget it" — it ships a **capability ledger** (`bootstrap-capabilities.json`), and a new project is supposed to be **born tracked**: every capability gets a recorded position before setup is reported done, not silently assumed.

*(Note: If the project was initialized using `bootstrap-init.js`, a starter `.bootstrap-adoption.json` manifest already exists in the root, and the capability definitions are summarized in `docs/development/bootstrap-capabilities-summary.md`. Read the summary and the manifest to verify the entries and versions and resolve any "deferred" states with the owner, rather than generating the file from scratch using `bootstrap-capabilities.json` or `docs/bootstrap-adoption-schema.md` which are absent.)*

1. **Read capability definitions.** If initialized via `bootstrap-init.js`, read them from the local `docs/development/bootstrap-capabilities-summary.md`. If manual fallback, read `bootstrap-capabilities.json` from your upstream copy of the Bootstrap repo. For each capability entry, walk it in this order and apply the matching default — defaults exist so most projects don't have to deliberate on every entry, but every entry still gets a recorded decision, not a silent skip:
   - **`channel: "core"`** — default is **adopt**. Declining a core capability is a real policy decision (every core entry's `declineGuidance` says it isn't recommended) — record it only on an **explicit owner statement** in this checklist, never on the agent's own judgment.
   - **`channel: "recommended"`** — default is **adopt**, but present the capability's `purpose` and `declineGuidance` to the owner for confirmation before finalizing. The owner may decline by citing the `declineGuidance` reason or their own.
   - **`channel: "optional"`** — default is **ask, don't take silently**. Do not adopt an optional capability without an explicit owner "yes."
   - **`adoptionKind: "project-specific-pattern"`** — Bootstrap ships no files for these (e.g. `dev-console-hub`); record whether the owner intends to build the pattern, for the manifest's sake. There is nothing to copy or decline either way.
2. **Check `dependsOn` before finalizing.** If a capability is being marked `adopted` while any capability in its `dependsOn` list is `declined` or otherwise absent, that is an incoherent manifest (e.g. adopting `packet-status-set-verb` while declining `packet-status-system`). **Do not auto-resolve this** — flag the conflict to the owner and wait for a decision (adopt the dependency too, or decline the dependent capability as well).
3. **Leftover files from a declined capability are not deleted.** The agent does not selectively remove a declined capability's `portableFiles` from the freshly copied tree — that is a destructive operation this flow deliberately does not perform. Instead, **print a one-line note per declined capability whose files are still present** (e.g. "declined `dev-console-hub` — no files shipped for this one" or "declined `decision-log` — `docs/decision-log.md` is still present; remove manually if undesired") so the owner knows to clean up by hand if they want to. This is not a correctness problem: `bootstrap-audit.js` treats `declined` as silent regardless of what the behavioral probe finds, so leftover files never produce a false drift signal later.
4. **Emit or Update `.bootstrap-adoption.json`** at the project root, covering every capability in the ledger — not just the adopted ones. (If initialized via `bootstrap-init.js`, verify and update the existing file; if manual fallback, emit a new one). Per the schema in `docs/bootstrap-adoption-schema.md` (consult upstream if manual):
   - Top level: `lastBootstrapAudit` (today's date), `bootstrapVersion` (the `version` field from the ledger, read mechanically).
   - Each entry: `capability` (the ledger id), `state` (`adopted`, `declined` or `deferred` per the decisions above), and for `adopted` entries, **`capabilityVersion`** set to that capability's own version from the ledger.
   - `declined` entries carry the owner's actual stated rationale in `localRationale` — never an invented or generic one.
   - `sourceCommit` may be omitted.
5. **Validate before reporting done**: confirm `.bootstrap-adoption.json` parses as valid JSON and every entry has the required fields per `docs/bootstrap-adoption-schema.md` (consult upstream if manual). A full tracked-mode `bootstrap-audit.js` self-audit against the new project is optional extra confidence, not required.

### Recorded Capability Decisions (`2026-10-23`)

| Capability | Channel | Version | Depends On | State | Notes |
|---|---|---|---|---|---|
| `packet-status-system` | core | `1.4.0` | none | `adopted` | Core default |
| `packet-status-set-verb` | core | `1.0.0` | `packet-status-system` | `adopted` | Core default |
| `dev-console-hub` | recommended | `1.1.0` | `packet-status-system` | `adopted` | Owner confirmed (`2026-10-23`) |
| `agent-starting-prompts` | core | `1.8.0` | `packet-status-system` | `adopted` | Core default |
| `falsification-check` | recommended | `3.0.0` | none | `adopted` | Owner confirmed (`2026-10-23`) |
| `reports-archive` | core | `1.0.0` | `packet-status-system` | `adopted` | Core default |
| `root-agent-guide` | core | `1.0.0` | `packet-status-system` | `adopted` | Core default |
| `decision-log` | recommended | `1.1.0` | none | `adopted` | Owner confirmed (`2026-10-23`) |
| `subagent-delegation` | recommended | `2.0.0` | `root-agent-guide` | `adopted` | Owner confirmed (`2026-10-23`; resolved from `deferred`) |
| `review-response-tiers` | recommended | `1.0.0` | none | `adopted` | Owner confirmed (`2026-10-23`; resolved from `deferred`) |
| `advisor-consultation` | core | `1.0.3` | `agent-starting-prompts` | `adopted` | Core auto-adopted |
| `commit-discipline` | core | `2.1.0` | `agent-starting-prompts` | `adopted` | Core default |

- **`dependsOn` conflicts:** None.
- **Declined capabilities / leftover files:** None (all 12 capabilities adopted).

## Checklist: file actions

After resolving all placeholders, the customizing agent must:

- [x] Replace every listed project-specific token in the initialized `*.template` files and role-specific starting prompts. Literal token names may remain in `BOOTSTRAP-PROMPT.md` and this checklist where they describe the setup process.
- [x] Rename `AGENTS.md.template` → `AGENTS.md`.
- [x] Rename `CLAUDE.md.template` → `CLAUDE.md`.
- [x] Rename `docs/README.md.template` → `docs/README.md`.
- [x] Rename `docs/decision-log.md.template` → `docs/decision-log.md`.
- [x] Rename `docs/open-questions.md.template` → `docs/open-questions.md`.
- [x] Rename `docs/development/README.md.template` → `docs/development/README.md`.
- [x] Confirm none of the "Do NOT copy" files above were copied in (Bootstrap's own `docs/development/README.md`, its `plan-*.md` packets, its `reports/development/plan-*/` folders, its sync-tooling files, or `docs/bootstrap-dev/`).
- [x] Confirm `.claude/agents/` contains the four roster definitions (`explorer.md`, `reviewer.md`, `researcher.md`, `implementer.md`) and is left intact.
- [x] Confirm `.codex/agents/` contains `reviewer.toml`, `researcher.toml`, and `implementer.toml`, and that no project `explorer.toml` shadows Codex's built-in explorer.
- [x] Verify that the `subagent-delegation` managed-prose block in `AGENTS.md` is left intact and not de-templated.
- [x] Walk the capability-selection procedure above; record an explicit `adopted`/`declined`/`deferred` decision for every capability in the local capabilities summary (or upstream ledger for manual fallback); resolve any `dependsOn` conflicts with the owner rather than auto-resolving.
- [x] Emit `.bootstrap-adoption.json` at the project root covering every capability; confirm it parses as valid JSON with the required fields.
- [x] Note any declined capability whose files are still physically present, for the owner's awareness (not automatically deleted). *(None declined.)*
- [x] Run `node scripts/dev/plan-status.js render` first (even with no packets, this regenerates the index between markers).
- [x] Run `node scripts/dev/plan-status.js lint` from the project root. It should exit 0 (no packets exist yet). If it fails, fix the issue before reporting done.
- [x] Present this checklist to the owner with every item marked as resolved, unresolved, or deferred.

## Checklist: owner review

After the agent finishes:

- [ ] Every listed project-specific token is replaced in customization targets or explicitly marked unresolved for owner review.
- [ ] `.template` suffixes are gone from all initialized files.
- [ ] `lint` exits 0.
- [ ] `AGENTS.md` correctly describes the project.
- [ ] The 8 guardrails in `AGENTS.md` are present and make sense for this project.
- [ ] `{{PROJECT_SPECIFIC_DATA_RULES}}` reflects your actual privacy/asset constraints.
- [ ] `{{PROJECT_SPECIFIC_CONTRACTS}}` reflects your actual durable contracts.
- [ ] No source-project-specific content leaked in. If this folder came from another project, run a grep for that project's name, area names, platform names, and domain-specific vocabulary; confirm hits are only inside marked example callouts or in the checklist instruction itself.
- [ ] `.bootstrap-adoption.json` exists, covers every ledger capability, and every `declined`/etc. entry's rationale is something you actually said — not something the agent invented.
- [ ] Any `dependsOn` conflict the agent flagged has been resolved by you, not silently picked by the agent.

---

## Notes

The `scripts/dev/plan-status.js` file does not contain placeholders — it is already project-agnostic. It discovers packets by scanning `docs/development/plan-*.md` relative to its own location.

The `docs/workflows/packet-tracking-system.md` file does not contain placeholders — it is already written in project-agnostic language.
