# Plan 35 source-authoring progress

## Summary

QP Orch approved the three captured/replayable starts, new-folder ownership, and the finale-rest selection pilot. I corrected the proposal and authored the bounded catalog/proof/browser helpers plus two briefs. This handoff stops for root source review and command clearance. No Node tooling, fixture capture, Vite server, or browser phase was run after the initial one-time packet check.

No production code, save validation/hydration, package/dependency files, packet status/index, global workflow, owner records, or Plan 32 files were changed. The Plan 32 preview directory remains untracked and untouched.

## Files changed

- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/proposal.md` — updated to reflect root's selection and corrections: no 128-browser seed sweep; pre-Pay rent state has no rent due event/active bill yet; finale selection is uncommitted UI state; historical versus current-loadable statuses; separate capture, offline-preflight, and pilot phases.
- `scripts/dev/checkpoints/catalog.json` — two Plan 16 historical references and three Plan 35 `not-captured` entries, with separate classes/statuses and boundaries.
- `scripts/dev/checkpoints/provenance.mjs` — bounded path/file reads, byte/hash checks, independently pinned Plan 16 archive index and production-source closure, parent/source/loader freshness checks.
- `scripts/dev/checkpoints/envelope.mjs` — wrappers around the existing save validator and engine hydration/round trip; boundary and negative-control assertions.
- `scripts/dev/checkpoints/checkpoint-proof.mjs` — one-reference or one-fixture offline verification command, including negative controls for stale source closure, capture recipe, and loader identities.
- `scripts/dev/checkpoints/cdp.mjs` — isolated Chrome profile/context, CDP, pointer hit-testing, and owned cleanup helpers.
- `scripts/dev/checkpoints/browser-phase.mjs` — separate mounted capture and pilot phases through the ordinary app restore path. A captured file remains `capture-pending-cleanup` until browser cleanup is confirmed, then advances to `current-loadable`.
- `scripts/dev/checkpoints/run-controlled-phase.mjs` — serialized Vite/browser phase supervisor with strict port, finite served-source identity map, 66-second work deadline, 10-second cleanup reserve, bounded output/evidence, and owned cleanup.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/review-briefs/paid-vs-unpaid-rent.md` and `finale-rest-selection.md` — two root-selected focused pilot briefs.
- `reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/progress.md` — this report.

The three fixture files and result logs do not exist yet. Catalog entries remain `not-captured`; no checkpoint is claimed current-loadable.

## Commands and checks

- Read the current Plan 35 packet/handoff, Plan 16 reports, manifest/archive evidence, Plan 25 guard source, and relevant controller/engine/storage/race UI source.
- The one-time `node scripts/dev/plan-status.js check plan-35` returned `RUNNABLE`. **Recorded deviation:** I ran it directly rather than through the required Plan 25 bounded wrapper. I did not repeat the passing check and did not run any other Node/npm/build/test/render/browser/server/install command. Wrapper resource sampling was not performed for that invocation.
- `git diff --check` passed for the authored changes.
- No execution or behavioral validation was performed on the new scripts. Proposed syntax checks, loader identity inspection, offline reference/fixture checks, capture routes, and pilot routes are listed separately in `proposal.md`; each still requires root command clearance first.

## Important behavior and limits

- Rent starts branch from the exact Plan 16 starter capture using the real mounted buy/decline action, then stop at `d2_afternoon_rent` before Pay. The pilot must observe `expense_due` and the true outcome from Pay; the pre-Pay state is not described as having a pending bill.
- Finale starts from the paid-rent checkpoint, pays rent, chooses actual zero-cash Continue, and captures the mounted day-three race form before submit. The pilot selects a rendered racer card only; it preserves actual `race_choice_offered` exposure deltas and does not submit the second race or fabricate `action/race_choice`.
- Plan 16 pending-reveal and starter-offer remain historical references. Starter reuse requires its exact source closure and independent archive pin to pass. Its original capture, original recipe, and repaired loader identities stay distinct.
- Source code correctness, Chrome launch and cleanup, fixture persistence, current source-closure match, all checkpoint routes, actual UI/log deltas, resource use, and every proposed command remain unverified until root clearance.

## Consultation posture

The Codex surface exposes a callable subagent mechanism, so this thread is advisor-capable under the repository registry. For this source-review handoff I am using the degraded **orchestrator-gate-only** path: QP Orch directed root source review before execution and reserved any one Terra-medium read-only review until after the main implemented pilot. No reviewer was launched.

## Next gate

Root should review commits `d4031d7` and `25fad99` and the corrected proposal, then approve, revise, or reject the exact command batches in `proposal.md`. Do not execute the proposed Node or browser commands before that clearance. Any current source mismatch should stop starter-derived capture; a seed search requires a separate bounded engine-only proposal.

Ready for orchestrator review: yes, for authored source/files and proposed command batches only. Pilot execution and owner acceptance remain pending.

## Root static review repairs — awaiting revised clearance

QP Orch's Terra-medium static source review identified six bounded fixes. I applied these source-only repairs after that review:

- Imported the bounded result-log reader used by offline proof output.
- Required the complete source closure, production fingerprint, capture recipe file/hash, and current loader hash for every `current-loadable` entry. Added negative controls for absent identity fields as well as stale hashes.
- Rechecked the independently pinned Plan 16 archive during every Plan 35 fixture load, including pilot loading.
- Compared the ordinary restored envelope with the exact expected state, RNG streams, and event-log prefix before a pilot action. Rent restores permit no suffix. Finale restores allow only the two mounted race-two exposure event types and require their offered identities to match visible cards.
- Expanded the finale boundary to require exactly the completed R01 attempt/resolution and completed-race record, race number 2, and no R02 commit. The pilot records every displayed owned card's rest reason and effective rating, requires a natural tired-versus-never-raced contrast, and selects one such card without submitting.
- Changed the proof's served-source response reads to stream under per-entry, aggregate, and body-deadline bounds.
- Added a bounded Windows process-tree inspection helper. Chrome ownership is registered immediately after spawn, and profile deletion waits for confirmed child/descendant exit. The phase supervisor inspects descendants even if the parent already exited. Failed inspection or residual descendants are reported as uncertainty/nonzero cleanup, not success.

No Node, syntax, test, browser, server, or runtime validation was performed after these repairs, per root's hold. No fixtures were generated; catalog entries remain `not-captured`. The previous source-review commits precede these repairs; this progress report is intended as the final commit in the revised source handoff. Root must review the revised source and clear an exact validation batch before any execution.

## Consolidated root re-review repairs

Root's consolidated static re-review found the actual `race_choice_offered` payload uses `candidates[].duckId`. I changed the mounted comparison to use that producer contract and verify exact visible-card identity coverage, displayed effective ratings/rest wording, selected card, trial state, and the actual trial-offer panel. The mounted rest-policy activation event is also checked against the expected history baseline and rule. The same suffix validator checks the selection-triggered event delta.

The exact restore comparison now runs on every capture parent before the first capture action as well as on every pilot fixture. Capture and pilot evidence retain parent-fixture/restored-save hashes, exact state/RNG/log-prefix comparison, and the permitted display-event suffix. The proposed syntax batch now includes `process-tree.mjs`.

Cleanup now samples the owned process tree under a hard deadline while the process is alive, retains PID plus creation identity, and independently checks those identities after shutdown. Missing root observation, inspection failure, live retained processes, or an unverified parent exit stays uncertain/nonzero; it cannot be cleared by a later empty tree traversal. The supervisor uses the same retained-identity monitor and treats a normally exited browser-phase child as clean only when its output contains confirmed browser cleanup and retained identities are gone. It does not taskkill a PID unless the owned root was observed.

No validation command has run. Root's latest authorization, after the repair commit, covers only seven serial syntax checks through the unchanged Plan 25 wrapper, after the required Node-memory/concurrent-activity preflight: `provenance.mjs`, `envelope.mjs`, `checkpoint-proof.mjs`, `process-tree.mjs`, `cdp.mjs`, `browser-phase.mjs`, and `run-controlled-phase.mjs`. No imports, semantic/offline checks, process probes, server, or browser/capture/pilot execution is authorized. After that bounded batch, the next semantic command batch must be sent to root for separate clearance.

The required pre-syntax process/memory preflight was attempted after the repair commit using a read-only Windows CIM query. The environment returned “Access to a CIM resource was not available to the client” for both process and OS memory queries; the resulting empty list is not evidence that no Node or Quackpot processes are active. I stopped before the first syntax check, as root required on a failed preflight. No Node/syntax/module/test/browser/server command has been run after the repair commit. The authorized syntax batch remains pending a usable preflight method or renewed root direction.
