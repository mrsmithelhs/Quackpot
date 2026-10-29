# Plan 16 progress — architecture proposal and bounded proof

## Current status

The report-only architecture stage is complete and owner-approved. A separately authorized bounded proof has regenerated the pending-reveal checkpoint twice under the corrected recipe and confirmed semantic equality. The pending-restore browser phase has **not** run under the corrected recipe: its preflight found other Node and Chrome processes already running and stopped before invoking the Plan 25 wrapper. No process was terminated, and no retry was made. A fresh root clearance is required after the environment is idle.

The proof remains report-folder-only. No production source, save schema, validator, packet status, deployment, or push was changed.

## Architecture proposal — historical completed stage

`proposal.md` recommends legal action recipes through the current engine/controller boundary, retaining the full schema-3 envelope, all RNG streams, event history and UI boundary. It proposes a compact provenance manifest and review brief, six checkpoint candidates, strict stale rejection, and automation-side fixture loading in a separate browser context. The proposal distinguishes exact-byte SHA-256 identity from semantic regeneration comparison that excludes only top-level `savedAt`, and requires mounted UI callbacks for display evidence. Owner architecture approval and the initial two-checkpoint proof are recorded in `reports/orchestration/plan-16-proof-authorization.md`.

## Current proof files and changes

- `checkpoint-proof.mjs` — pending-restore now waits up to the existing 12-second limit for the acquisition queue to finish naturally; it no longer activates Skip Presentation in that phase. On a pointer hit-test failure it records target and hit tag/classes/rectangles, relevant computed styles, scroll and visual viewport state, and attempts at most one screenshot of the current page, capped at 2 MiB. The pointer hit guard is unchanged. The screenshot is failure-only and will not be produced on a successful run.
- `proof-plan.md` — maps the natural-completion route, documents history preservation/fingerprinting, records prior controlled browser outcomes, and states the current authorized guarded sequence and limits.
- `history/2026-10-29-before-natural-completion-recipe/` — exact prior `checkpoint-manifest.json`, `pending-reveal.save.json`, and the two-record `proof-results.jsonl`, moved before regeneration. Their hashes were checked before and after `Move-Item` and recorded in `archive-index.json`.
- Active `checkpoint-manifest.json` and `pending-reveal.save.json` — regenerated for the corrected recipe. Active `proof-results.jsonl` contains the two current create-pending results. `controlled-vite-phase-results.jsonl` remains append-only and retains all three earlier browser-helper attempts.

The corrected recipe and plan were committed first as `9be3192` (`fix(plan-16): wait for acquisition checkpoint naturally`). The report and generated artifacts remain uncommitted pending this update.

## Commands and results

All authorized Node batches used `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1` with its 1 GiB heap, 2 GiB sampled private-byte, 90-second, and bounded-output limits. Process and port inventory preceded each batch. The successful batches had no concurrent Node or Chrome processes and no listener on port 5181.

1. `node --check reports/development/plan-16-deterministic-review-checkpoints/checkpoint-proof.mjs` — exit 0, 0.52 seconds, peak sampled private bytes 1,789,952; no stop reason or cleanup notes.
2. First `create-pending` — exit 0, 0.52 seconds, peak sampled private bytes 1,851,392; valid engine-generated envelope, full hydrate/serialize round trip equal, ten draw commits, zero reveal events.
3. Second `create-pending` — exit 0, 0.52 seconds, peak sampled private bytes 1,728,512; same semantic envelope excluding top-level `savedAt`. First and second fixture hashes were `8c4b655633046ec146c066b68e91347125211ba3094fd437f889a13a2076cf57` and `4d550bdead725ab0fadad735c77705c1535828da4e3bd8f746ef71d8254ef98d`. The new manifest uses recipe fingerprint `cb318662122d8e18289c3d30d668971e949809aca8678cf77d4e5ae996ab4185`.
4. One controlled pending-restore batch was authorized next. Its process preflight found multiple Node and Chrome processes already active and stopped before checking port 5181 or invoking the wrapper/helper. Therefore no Plan 16 Vite or Chrome process was launched in this attempt. The ambient process list was left untouched. This is the stop condition; do not retry without fresh root clearance.

## Earlier controlled pending-restore attempts

These attempts used the prior recipe and are retained in the append-only helper log. They are not evidence for the corrected natural-completion route.

- Restricted attempt 1 timed out during finite served-response hashing before browser interaction. Cleanup was uncertain in the helper record; post-run inventory found no Node, Chrome, or port-5181 listener.
- Restricted attempt 2 hashed 31 served entries but Chrome exited during startup with crashpad error `4294930433`. Cleanup uncertainty was recorded; post-run inventory found no Node, Chrome, or port-5181 listener.
- Owner-cleared standard-environment attempt hashed 31 entries (2,105,842 bytes), started Chrome, and reached the Skip pointer guard. At the target center `(1033.2578125, 75)`, the hit element was a `DIV`; the guard correctly rejected activation. Cleanup was confirmed with no residual/uncertainty. That attempt predates the failure diagnostic, so it has no screenshot or detailed class/rect evidence.

The source diagnosis found a normal 2,000 ms focus phase followed by a 2,500 ms colorization phase in `src/ui/acquisition-queue.mjs`. Source CSS gives the acquisition overlay z-index 1100, but source inspection did not identify the rendered `DIV` or establish whether obstruction was transient or persistent. No UI correction was made.

## Verification limits and remaining work

- The corrected recipe has passed one syntax check and two engine-only generations. Mounted restore, natural acquisition completion, post-load save/RNG/log assertions, ordinary-save preservation in browser contexts, and the new failure diagnostic remain unverified.
- Starter-offer capture and accept/decline branch continuations were not authorized in this follow-up and remain unrun.
- No tests, build, production code, reviewer fan-out, status change, push, or deployment was performed.
- Before any later recipe revision, preserve current active generation records, manifest and fixture in a uniquely named history folder with pre/post-move hashes. Keep the controlled browser-helper log append-only. Never overwrite or relabel historical hashes.
- The original proposal’s concerns still apply: a finite served-response map is not full network/transitive-byte attestation, and a fixture fingerprint does not replace production save validation or prove that historical pre-checkpoint cues were seen by a reviewer.

## Consultation and review status

The original prose-only architecture report did not warrant advisor consultation or reviewer fan-out. No reviewer ran for this proof update. Orchestrator review remains pending for the regenerated fixture and the unexecuted corrected mounted-restore boundary.
