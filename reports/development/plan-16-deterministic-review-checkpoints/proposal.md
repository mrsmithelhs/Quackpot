# Plan 16 architecture proposal: valid review checkpoints

**Status:** architecture proposal only; awaiting owner approval before proof or implementation.

## Recommendation

Generate checkpoints by replaying a named, deterministic action recipe through the current `GameEngine` and the same controller transitions that own progression. At each approved boundary, serialize the engine with `toEnvelope()`, run the existing `validateSave()` and `GameEngine.fromEnvelope()` hydration path, then record a content hash of the canonical envelope plus a separate manifest. Do not construct state fields by hand, call `EventLog.append()` to pretend something was seen, or edit the envelope to force a scene.

The envelope is a valid continuation snapshot, not a claim that a real student saw its synthetic history. Keep the source recipe and complete event history. Label all events before the checkpoint as **scripted prehistory** in the review brief/report. The reviewer begins observing only after the load boundary. For claims about display, use events the current UI emits after render (for example `reveal_shown`), not the mere existence of a committed result or a named view.

### Source-grounded current behavior

- `src/core/storage.mjs` uses `CURRENT_SCHEMA_VERSION = 3`; `validateSave()` accepts schema 1, 2, and 3 with version-specific race-rest checks. It validates state shape and coherence, all four PRNG snapshots (`root`, `draw`, `race`, `event`) and stream key derivation, the event log chain, draw/reveal consistency, race attempt/resolution consistency, rest evidence, and terminal/Receipt phase coherence. Schema 1 is migrated by `loadGame()`; migration is not a reason to label a newly generated checkpoint schema 1 or 2.
- `src/core/game-engine.mjs` `toEnvelope()` captures `savedAt`, autosave setting, cloned complete `state`, all four stream snapshots, and `eventLog`; `fromEnvelope()` hydrates those components and reconstructs selected compatibility fields from log events. It does not include application source revision, generator recipe, a general game-rules fingerprint, or a deterministic wall-clock seed.
- The RNG root forks independent draw/race/event streams. A seed alone does not encode their current consumed states. Preserve every stream snapshot exactly. Race resolution additionally has its own recorded `rulesVersion`, seed, race identity, inputs, deterministic resolution payload/digest, and versioned presentation snapshot; preserve these bytes and validate their stored digest.
- `EventLog` is append-only, sequence-numbered, and hash-chained. Any full prefix is chain-valid, but terminal completeness is a separate constraint: `verifyCompleteness()` requires a terminal event immediately followed by `receipt_shown` at the tail. Checkpoints should therefore use full valid logs at natural boundaries, with a terminal checkpoint only after the Receipt boundary is truly recorded.
- `main.js` restores `currentStep` and `activeModal` from engine state and renders based on both. It also has UI-only details such as settings-open, phone-open, Duck-Dex return step and paused race playback snapshot. Those are not generally all represented in the engine envelope. Avoid checkpointing inside an animation or overlay lifecycle unless a future version explicitly serializes and validates the needed controller snapshot. For first proof, target stable render boundaries: pending reveal, offer modal, zero-cash/escalation modal, settled race result, and terminal Receipt.
- `state.clock` is story day/label and is copied into every event. `savedAt` is wall-clock time and is volatile metadata. Normalize only the manifest's comparison view of `savedAt`; do not rewrite it in the envelope. If any future action recipe depends on real time, inject and version a clock source as part of an approved engine change. Current deterministic choices should be action-driven and avoid `Date.now()` except initial default seed and serialization timestamp. `main.js` uses `Math.random()`/`Date.now()` for an exposure identifier; avoid asserting that identifier as a deterministic outcome unless the exposure source is separately made injectable.
- Resolve-once boundaries matter. `runRace()` commits the attempt/resolution and rewards before presentation, and its serialized race resolution must remain paired with the committed attempt. Race playback actions/cues are appended during UI presentation; a checkpoint after that presentation begins would need its playback snapshot and exact playback lifecycle context. A settled result after all required playback callbacks is more supportable than a mid-playback save. Similarly, a draw may be committed while individual reveal events have not yet occurred; `pendingReveals` must exactly match all draw commits and reveal flags must agree with log events.

## Proposed architecture

### 1. Recipe runner

A future development-only generator accepts a manifest entry's fixed seed, scenario inputs, and ordered named actions. It creates a normal `GameEngine`, calls public engine actions, and uses a thin test/controller adapter only for progression fields that production `main.js` currently changes around engine calls (for example the race-result step). This adapter must mirror documented production transitions and be reviewed against current `main.js`; it must not add undocumented runtime hooks or bypass validators. After each action, assert expected state/log invariants. At the target boundary:

1. Call `toEnvelope()`.
2. Require `validateSave(envelope).valid`.
3. Hydrate via `GameEngine.fromEnvelope(envelope)` and re-serialize.
4. Compare state, RNG snapshots, log entries/head, race-resolution bytes/digests, and target UI context, excluding only volatile `savedAt` from equality.
5. Write fixture bytes and manifest atomically to a development-only artifact directory; fail closed on any stale fingerprint or mismatch.

The generator may use a deterministic `savedAt` provider only if a later approved implementation makes the serialization clock injectable. Until then, hash/equality code can explicitly omit `savedAt`; no such adjustment may alter the saved envelope's actual timestamp.

### 2. Fixture provenance versus game envelope

Keep checkpoint provenance outside the save as a sidecar manifest rather than adding synthetic fields to the learner save schema. This keeps `validateSave()`'s production contract intact and makes fixture privilege visible to tooling. The fixture is a whole envelope, never a hand-composed partial state or invented event prefix. Its event log truth remains internally coherent but synthetic. Labeling belongs in the sidecar and brief, not in fake student-visible events.

### 3. Isolated loader boundary

Recommend automation-side storage seeding into a **fresh, dedicated browser context with a unique temporary profile/storage partition and an isolated local server instance** after validating the fixture in Node. Use the actual production app boot/restore path and ordinary schema validation. Do not add a hidden student-build route, query parameter, import menu, global hook, or debug bundle branch. Different URLs on one origin are not storage isolation. Do not clear or overwrite the owner's normal origin storage or take ownership of an already-open browser/server.

Before app navigation, automation seeds only `STORAGE_KEY` in its private context. It must not invoke `clearGame()` against an owner profile. If the app is booted from the wrong context or the save key/hash does not match, abort. After load, capture from that isolated page a small read-only diagnostic witness supplied by the harness (not a production debug hook): expected checkpoint ID, fixture byte hash, schema, source/rules fingerprint, loaded `eventLog` head, `state.step`, `state.activeModal`, and the rendered route/modal heading. This proves which bytes were seeded and which normal route rendered; it does not by itself prove every field hydrated correctly. The pre-load `validateSave` + round-trip comparison covers that contract.

Between the alternatives, browser-automation storage seeding is less intrusive than a dev-only application loader because it needs no shipped code or app import surface. A dev-only loader should be reconsidered only if automation cannot seed before app boot while retaining the normal restore path; if approved, compile it into a separate non-publishable dev entry and assert it is absent from the static student build. No code for either path is authorized now.

## Small proposed manifest and review brief

Keep one manifest entry per checkpoint in a small JSON file; the review brief can be a Markdown template rendered from that entry. Example shape (illustrative, not a generated fixture):

```json
{
  "manifestVersion": 1,
  "checkpointId": "qp16.starter-offer.v1",
  "fixtureFile": "starter-offer.v1.save.json",
  "fixtureSha256": "<computed from exact fixture bytes>",
  "provenance": {
    "synthetic": true,
    "generatorVersion": 1,
    "recipeId": "starter-offer.v1",
    "recipeRevision": "<recipe source hash>",
    "sourceRevision": "<git commit>",
    "rulesFingerprint": "<selected engine/core/UI files and constants hash>",
    "schemaVersion": 3,
    "raceRestEvidenceVersion": 1,
    "seed": "qp16-starter-001",
    "storyClock": {"day": 1, "label": "day 1 afternoon"},
    "wallClockPolicy": "savedAt-is-volatile; no action depends on wall time"
  },
  "boundary": {
    "step": "d1_afternoon_starter",
    "activeModal": "starter",
    "phase": "playing",
    "eventLogHead": "<chain>",
    "eventCount": 0,
    "expectedRenderedContext": "Starter offer dialog"
  },
  "scriptedPrehistory": "All events through eventLogHead were created by the named recipe; none represent student observation.",
  "brief": {
    "purpose": "Review the starter offer's copy, focus, and available actions.",
    "nextActions": ["accept offer", "decline offer"],
    "expectedOutcomes": ["purchase is logged once", "decline is logged once"],
    "branchLookFors": ["dialog context is explicit", "both actions remain reachable"],
    "viewport": "1280x800",
    "input": "keyboard then pointer",
    "observationBudget": "one load and at most two branch actions",
    "limits": ["synthetic prehistory", "does not establish student understanding"]
  }
}
```

For race checkpoints, add the exact `raceId`, resolution `rulesVersion`/digest, `presentation.version` and finish status. For a final Receipt, record the complete event-log tail and `verifyCompleteness` result. The fixture hash is over exact bytes; the source/rules fingerprint should cover the modules and constants whose changes can invalidate recipe or observations, including engine, storage validator, PRNG, event log, race resolver when relevant, main controller and the specific view. Exclude timestamps from the rules fingerprint. On any source revision or fingerprint mismatch, mark the fixture stale and reject it pending regeneration and a fresh review; do not silently carry prior findings forward.

Each reviewer report should echo checkpoint ID, exact fixture hash, source/rules fingerprint, schema, loaded log head, actual rendered context, actions taken and branches observed. If any expected value differs, stop and report the mismatch rather than “repairing” fixture state manually.

## Six feasible first-catalog candidates

These are recipe candidates, not promises that a checkpoint already exists. Every recipe must use current engine actions and then pass save validation/round-trip. Direct engine transitions may be used to build prehistory, but the final boundary must be producible by the same production state/context transitions. A candidate that cannot reach a coherent state/log without undocumented mutation is dropped until separately designed.

| Stable ID | Recipe and boundary | Purpose / expected next actions and outcomes | Branch look-fors and limits |
|---|---|---|---|
| `qp16.pending-reveal.v1` | Start run, set up companion, commit promotional 10-pull; capture before revealing cards. Boundary is `d1_morning_gacha`, no modal, pending queue with commits and no reveal events. | Verify committed results are faithfully displayed; reviewer can reveal the next unrevealed card or fast-reveal all. | Confirm first reveal is logged after display and repeated reveal is idempotent. A commit is not evidence that a learner saw the card. UI-only reveal animation timing is not captured. |
| `qp16.duplicate-down.v1` | Fixed seed whose actual 10-pull yields at least one duplicate; run engine setup and pull; use the existing UI/controller reveal path for the first qualifying duplicate. Capture only at the supported duplicate conversion-help boundary if current source confirms its authoritative state. | Inspect duplicate card, factual Down conversion, optional help and dismiss/return actions. | Preserve all ten commits, prior reveals, Down amount and help log/cue. Seed search may be performed only by a future bounded generator; do not hardcode a desired identity or claim an event before reproducing it. If the help is only transient view state, defer this target and use the pending-reveal checkpoint. |
| `qp16.starter-offer.v1` | Reach the accepted day-one race outcome and production transition into `d1_afternoon_starter`; capture with `activeModal: starter`. | Review offer text and keyboard focus; accept and decline are separate fresh-context branches. | Purchase/decline must log once. Offer display is a UI-bound event; engine `displayStarterOffer()` also exists, but it must not substitute for the production race-to-offer controller path. |
| `qp16.zero-cash.v1` | Build actual cash history, resolve a rent bill that leaves exactly zero, reach `d2_afternoon_zerocash` / `zerocash` modal. | Review solvent-zero-cash explanation and continue, extra-shift, or couch-sale branches. | Verify bill already settled, no unpaid `activeBill`, and no running-on-empty claim. This is distinct from unpaid escalation and its branches. |
| `qp16.unpaid-escalation.v1` | Build cash below rent, call rent bill transition and reach `d2_afternoon_escalation` with active bill/modal and escalation index. | Inspect the current available escalation, choose a supported step, or continue into later route. | Validate amount, bill ID, phase, active modal, state index and matching unpaid-bill history. The currently available action can depend on health/assets/debt; manifest records exact state and expected choice. |
| `qp16.final-receipt.v1` | Replay one complete legal route to a terminal outcome; record terminal then present Receipt using real engine/controller boundary. | Inspect Receipt sections and terminal exit/restart controls where present; no game mutation is expected. | Require phase `receipt_presented`, step `receipt`, no modal, terminal followed immediately by `receipt_shown`, `verifyCompleteness=true`. Expensive recipe and terminal display is sensitive to whole-route changes; use only when Receipt code is in review scope. |

**Not in first catalog:** a race in mid-playback is excluded because elapsed animation and paused/running presentation state are not fully part of the current engine envelope. A post-resolution, settled race result may be added after a bounded proof establishes the exact UI boundary, preserved race presentation record, and current controller step. Do not treat `race_result` alone as proof that podium/presentation was observed. The selected actual individual crossing order, rest history, race-attempt idempotency, saved resolution and resolution version/digest must agree. If the one-or-two-checkpoint first proof includes race behavior, prefer this settled boundary over an animation snapshot.

## Artifact lifecycle and proposed later proof

- Track small, stable recipe/manifest source as development test tooling only after gate. Track generated envelope fixtures only if one or two files stay small and reviewers need exact replayable bytes; otherwise ignore generated output and regenerate in a bounded preflight. In either case, retain their SHA-256 and never commit learner exports or personal data.
- Generator changes invalidate generator/recipe fingerprint. Engine, validator, rules, controller or relevant view changes invalidate the applicable rules fingerprint. Schema migration or race resolver version change explicitly rejects affected fixtures. Regenerate and recapture only after a fresh pass of validation; old reviewer output is historical evidence only.
- After owner approves architecture, prove with one pending-reveal and one modal checkpoint (starter or zero-cash), chosen based on active review need. Require deterministic regeneration comparison, valid schema-3 load/round-trip, next action continuation with expected log/RNG change, stale fingerprint rejection, malformed fixture rejection, and ordinary-save preservation in two distinct contexts. Keep the owner profile and shared browser untouched.
- Exact later write scope should be a new implementation packet owning only a development generator/recipe manifest, fixture validation/load helper (if automation cannot perform it externally), fixture folder policy, focused tests and `reports/development/plan-16-deterministic-review-checkpoints/progress.md`. Production `src/`, static student build entry, ordinary storage behavior, validators and app debug routes stay read-only unless a later approved packet explicitly revises that boundary.
- Minimal first proof budget: one generator process per candidate, then one isolated browser context per chosen checkpoint, one load and at most two explicit branch actions each; capture one structured result with fixture fingerprint and screenshots only where rendered appearance is the claim. No reviewer fan-out or model selection is part of this stage. A later owner-approved cheap spot-check can assign one self-contained checkpoint per reviewer/context, using current routing rules and bounded observation budgets.

## Owner gate requested

Approve or revise: (1) production action-replay recipes plus complete schema-3 envelope as the checkpoint unit; (2) sidecar provenance/brief with strict source/rules/schema invalidation; (3) automation-side storage seeding in a fresh isolated context as the default loader; and (4) a first two-checkpoint proof chosen from pending reveal and one modal checkpoint. No implementation, fixture generation, browser launch, or reviewer fan-out is included in this proposal.
