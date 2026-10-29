# Plan 16 progress — architecture proposal

## Overall summary

Produced a report-only architecture proposal for valid engine-generated seeded checkpoints, a compact sidecar manifest/review brief, six candidate checkpoints, strict staleness rules, and an isolated future load workflow. Recommendation is to replay legal actions through the current engine/controller boundary, retain the complete schema-3 envelope, validate and hydrate it through existing production contracts, and use automation-side storage seeding in a fresh private browser context after a separate owner architecture gate. Root reviewed the proposal for owner review and requested three prose clarifications: isolated context does not require a new server when an existing stable server serves verified source; exact-byte SHA-256 is distinct from semantic regeneration comparison excluding `savedAt`; and any thin controller adapter needs an explicit production-source-to-recipe mapping with no fabricated cue evidence, plus proof of mounted UI continuation.

## Files changed

- `reports/development/plan-16-deterministic-review-checkpoints/proposal.md` — source-grounded architecture, proposed metadata/brief example, six candidates, risks, future proof and write boundary.
- `reports/development/plan-16-deterministic-review-checkpoints/progress.md` — this report.

## Artifacts produced

- `proposal.md` describes the recommendation and candidate catalog. No generator, loader, fixture, browser profile, or production code was created.

## Commands run and results

- Read `AGENTS.md`, `docs/agent-starting-prompts/implementer-prompt.md`, the Plan 16 handoff, Plan 16 packet, repository source map, and targeted current engine/storage/PRNG/event-log/controller/race source.
- Ran the required `node scripts/dev/plan-status.js check plan-16` through the established Plan 25 `bounded-node-run.ps1` wrapper: **RUNNABLE**, exit 0, 0.52 seconds, peak sampled private bytes 2,031,616; no stop reason. No other Node command was run.
- `git status --short` before report edits showed an unrelated untracked Plan 33 artifact at `reports/development/plan-33-recognizable-music-emotional-transformation-research/deep-research/`; it was left untouched.

## Validation checks performed

- Source inspection confirmed current schema version 3; accepted legacy versions/migration; whole-state envelope serialization; root/draw/race/event PRNG snapshots; append-only event chain and separate terminal completeness; persisted step/modal restoration; pending reveal coherence; race attempt/resolution/digest and rest evidence checks; storage preservation mode; UI race playback callbacks; and event-logged Receipt boundary.
- This is prose/source investigation only. No code behavior was executed or validated beyond the guarded packet-status CLI. No tests, build, server, browser, storage seeding, memory sweep, or fixture generation was run. This follow-up made only the root-requested prose clarifications; the executable-proof gate remains closed pending owner approval and bounded follow-on scope. During this follow-up, Git status also showed an untracked Plan 27 report folder alongside the previously noted Plan 33 folder; both were left untouched.
- Advisor consultation not warranted for this docs-only architecture proposal; no reviewer/subagent fan-out ran.

## Problems and how resolved

- The packet describes older assumptions. Used the current source schema, rest and Duck-Dex fields, individual-crossing race result/resolution path, current main-controller context restoration, and latest handoff limits instead of treating historical notes as current behavior.
- A valid event-log chain alone is insufficient: terminal completeness and event-to-state consistency are separately enforced. The proposal preserves complete logs and requires natural boundaries.

## Remaining risks and follow-ups

- Source does not encode a general application rules/source fingerprint or generator provenance. Proposed these as external sidecar metadata; owner should approve exact fingerprint coverage before implementation.
- Runtime UI-only contexts are not all in the envelope. The initial catalog avoids mid-animation/modal substate boundaries and flags duplicate-help and settled-race candidates for proof before commitment.
- The underlying event chain uses a compact FNV-1a check, not a cryptographic digest. The proposed external SHA-256 fixture hash covers exact checkpoint bytes for artifact identity; it does not replace semantic save validation.
- No real recipe has been executed, so candidate feasibility, seed selection, size and continuation reproducibility remain proposals pending the architecture gate and separately authorized proof.

## Ready for orchestrator review

Yes — architecture recommendation only; owner approval is still required before generator/loader implementation, fixture generation, browser work, or reviewer fan-out.


