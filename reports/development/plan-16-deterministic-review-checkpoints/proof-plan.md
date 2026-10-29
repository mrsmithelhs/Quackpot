# Plan 16 bounded proof plan

**Authority:** `reports/orchestration/plan-16-proof-authorization.md` (2026-10-28). This plan uses only the authorized pending-reveal and starter-offer checkpoints. It writes only within this folder. It does not authorize production changes, status edits, push/deploy, or broader browser review.

## Exact intended files

1. `proof-plan.md` — this source map, boundaries, execution commands, and stop criteria.
2. `checkpoint-proof.mjs` — one development-only bounded harness; it may import current pure engine/storage modules but must not duplicate game logic or edit an ordinary save.
3. `checkpoint-manifest.json` — two checkpoint records and their provenance/briefs.
4. `pending-reveal.save.json` and `starter-offer.save.json` — only if size/privacy review supports tracking; otherwise keep them ignored and report exact hashes/sizes.
5. `proof-results.json` — actual validation, semantic regeneration, and mounted UI observations.
6. Minimal screenshots, only where needed to witness a rendered route/control.
7. `progress.md` — evidence, exact bounded commands and outcomes, deviations, limits, and ready-for-review status. It is the final report artifact committed.

No other report, packet, source, validator, build, smoke, browser, or owner-profile files may be changed. Existing Plan 27 and Plan 33 work remains foreign and untouched.

## Source-to-recipe mapping

The pending checkpoint is created by calling the current `GameEngine` constructor, `start()`, `setupCompanion()` and `commitPromotionalTenPull()` in a development-only Node recipe with a fixed seed. That produces valid engine history but does **not** claim the companion setup or pull was displayed to a learner/reviewer. Its entire pre-load log is explicitly scripted prehistory. The checkpoint is then loaded through normal app restore and mounted gacha UI; only post-load visible card interaction supplies actual `reveal_shown` evidence. The starter recipe uses that same seeded envelope and continues only through actual mounted UI controls. This avoids a seed-injection hook and gives both checkpoints one reproducible engine-generated prehistory.

| Recipe transition | Current production source mapping | Required evidence / boundary |
|---|---|---|
| Fresh seeded engine; `start()` | `src/core/game-engine.mjs` constructor and `start()`; `src/main.js` fresh-run boot | `run_started` is the first logged event; fixture records root seed and all four serialized RNG stream states. |
| Setup companion | `src/main.js` desk submit callback; `GameEngine.setupCompanion()` | `companion_styled` event; phase playing, step `d1_morning_gacha`, modal null. |
| Commit welcome pull | `src/main.js` gacha claim callback; `GameEngine.commitPromotionalTenPull()` | Exactly ten consecutive `draw_committed` records, `tenPullCommitted=true`, ten matching pending entries, zero `reveal_shown` entries. Boundary captured before clicking any reveal control. |
| Restore pending checkpoint and reveal one card | `src/main.js` `GameEngine.fromEnvelope()` restore and `renderGachaView()`; visible `.card-back[data-card-idx]` handler invokes `revealDrawAtIndex()` and the acquisition queue | Normal UI renders gacha theater. Actual `reveal_shown` entry is appended only after mounted pointer interaction; if a first-owned acquisition overlay appears, its visible Skip Presentation control is activated by pointer and records its actual cue/skip events. Wait until overlay removal and latest saved state agree. |
| Reveal remaining cards for starter recipe | Mounted `#btn-reveal-all` callback invokes `revealAllPending()`; `createAcquisitionQueueController.enqueueReveals(..., {fastPull:true})` performs its selected static acquisition behavior | Use only actual visible Reveal All. Wait for acquisition overlay removal; gacha Proceed must be enabled, not inert, in viewport, and hit-testable before pointer activation. Its existence alone is not completion evidence. |
| Proceed to breakfast/race | `main.js` gacha `onProceed`: `billExpense('food', 5)`, `advanceDay(1, 'day 1 midday')`, controller sets step `d1_midday_race` | Expense due/paid sequence and expected day/step; if cash/state unexpectedly blocks route, stop rather than patch it. |
| Race controls and selection | `main.js` race `onChoiceShown`/`onTrialOfferShown`; `GameEngine.recordRaceChoicesShown()` and `recordRaceTrialOfferShown()` are invoked only after rendered race controls | Actual `race_choice_offered` and trial offer evidence from mounted controls; select an owned duck and Safe/Steady stance through visible controls. |
| Race attempt/resolution | `main.js` `onStartRace`; `GameEngine.runRace(1, duckId, 'safe')` | One committed attempt, serialized resolution, resolution digest, actual finish order and reward events. If unresolved, stop; do not retry or edit attempt/resolution. |
| Race presentation to starter | `src/ui/race-view.js` emits actual callbacks for displayed cues and playback actions; visible Continue reaches `main.js` race `onProceed`, which calls `advanceDay(1, 'day 1 afternoon')`, `displayStarterOffer()`, `displayGemShop()`, and sets `d1_afternoon_starter` / `activeModal='starter'` | Allow race playback to settle naturally; no race-skip control is assumed. Capture only after Starter offer modal is mounted and visible and the latest autosave agrees. Expected tail includes actual race result/playback evidence, then `offer_shown` and currency `cue_shown`. No shortcut may call these methods solely to force the modal. |
| Load starter checkpoint into separate contexts | `main.js` normal `loadGame()` → `validateSave()` → `GameEngine.fromEnvelope()` → `renderApp()` and `renderStarterOffer()` | Independently load the same exact fixture bytes into two fresh contexts. Observe the mounted modal and branch one context to accept and the other to decline. Confirm distinct one-time outcomes and valid continuation envelopes. |

## Event boundaries

- **Pending reveal:** Complete engine-generated envelope; full hash-chained prefix through tenth `draw_committed`; no reveal entry; queue exactly matches commits; `state.step='d1_morning_gacha'`, `activeModal=null`, `phase='playing'`, story clock day 1 morning. After restore, normal gacha controls are rendered. One post-load pointer activation of the first-owned visible card back should append exactly one matching `reveal_shown` record and mark only its card revealed; engine RNG snapshots and draw-commit count remain identical. Repeating the same reveal against a hydrated engine must be idempotent and add no log entry.
- **Starter offer:** Complete envelope from continuation of the pending baseline through actual visible app controls. Capture after modal visibility, not merely after `displayStarterOffer()`. Require a valid race attempt/resolution pair and its proper timeline/callback evidence, `offer_shown`, currency offer cue, `state.step='d1_afternoon_starter'`, `activeModal='starter'`, and story clock day 1 afternoon. The branch contexts reload byte-identical starter fixtures separately; accept and decline are not run sequentially against shared storage.
- Neither recipe may splice histories or append display evidence from a harness shortcut. Every display evidence record must originate from mounted production UI callback execution. Pre-checkpoint history is synthetic, labeled scripted prehistory, and never represented as actual reviewer observation.

## Fingerprints and checks

For each fixture, compute SHA-256 from exact stored bytes (artifact identity) separately from semantic regeneration equality. Semantic comparison omits only the envelope's top-level volatile `savedAt`, then compares the full remaining envelope, state, every RNG stream, event entries/head, race resolutions and UI boundary context. Nested fields named `savedAt` remain compared. Rerun `create-pending` and `starter-capture` to compare semantic regeneration; if any event ID or other evidence differs, preserve the old fixture and report the mismatch without adding a normalization exception. Manifest fingerprints identify the source commit, raw local hashes for every tracked `src/` file plus `index.html`, Vite configuration, package manifest/lockfile, and the harness recipe, as well as schema/rest evidence versions, seed and story clock. This conservative local closure includes direct imports such as apartment/ambient helpers, rig/motion modules, and apartment kits. A finite `SERVED_FILES` map separately checks response hashes for the app's explicitly reviewed runtime entries; Vite config and package files are not fetched as runtime modules. Transformed response bytes are not claimed to equal raw working-tree files. A mismatch is stale and fails closed.

Validate with current `validateSave()` before writing and after each captured continuation. Hydrate both fixtures and each branch through `GameEngine.fromEnvelope()` and compare a second serialization semantically. Deliberate in-memory negative controls verify malformed schema, malformed RNG snapshot, tampered event chain, incoherent state/log and stale source fingerprint rejection; none is written to storage. Preservation demonstration uses an isolated ordinary-save context with a sentinel save: fixture load occurs in a second fresh context/profile; confirm sentinel bytes remain unchanged and no clear/remove call targets the ordinary context.

The browser witness must report actual loopback page origin/base URL, local source revision/fingerprint, exact separately hashed served module responses, fresh Chrome profile/context identity, checkpoint ID and exact fixture hash, normal loaded route/modal, observed controls, actions taken, resulting log head/schema and any uncertainty. Each phase uses a new temporary Chrome profile and newly isolated BrowserContexts. Screenshots are visual witness only; semantic save validation remains the engine/storage checks above.

## Guarded batches

Use the existing Plan 25 wrapper, one invocation per batch. Its policy enforces a 1 GiB Node heap, 2 GiB sampled private-byte cap, 90-second timeout, and bounded output. No unbounded npm, Vite, smoke, test-suite, watcher, or server command is proposed.

1. Root cleared one exact syntax check after these source corrections. Run it once, through the existing Plan 25 wrapper:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('--check','reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs')
```

2. Only if syntax succeeds, root cleared one bounded Node-only `create-pending` batch, with the recipe committed first. This creates or semantically revalidates the engine-generated checkpoint and does not use a browser or server:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs','--phase','create-pending')
```

3. After source inspection and exact URL/hash clearance, run each browser phase separately with the root-approved loopback base URL and `QP16_EXPECTED_SERVED_MODULES` JSON map covering every fingerprinted path. Each phase uses a fresh Chrome profile, waits for normal UI, and does not start a server:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs','--phase','pending-restore','--base-url','<root-approved-loopback-base-url>')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs','--phase','starter-capture','--base-url','<root-approved-loopback-base-url>')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs','--phase','starter-capture','--base-url','<root-approved-loopback-base-url>')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs','--phase','branch-accept','--base-url','<root-approved-loopback-base-url>')
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs','--phase','branch-decline','--base-url','<root-approved-loopback-base-url>')
```

Before any browser phase, the harness rejects non-loopback HTTP, credentials, redirects, missing or mismatched root-reviewed served-module hashes, changed local source, stale manifest entries, and malformed manifests. It never starts a server. If no suitable stable server is available, stop and request a separate resource decision. Do not start Chrome against a user profile, reuse an owner tab, or clear ordinary origin storage. If a phase cannot complete within one bounded batch, report the reached boundary and request a specific follow-up batch; do not extend limits silently.
