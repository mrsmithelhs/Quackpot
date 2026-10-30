# Plan 28 root test evidence and browser clearance

Date: 2026-10-30. Reviewed fixes 10a9e90 and server/fault-injection changes through
134b2d6. Root executed the previously proposed tests after substituting a read-only
canonical preflight for the log-appending CLI mode. No game/browser run by root.

## Shared log decision and actual results

The owner authorizes rotation if needed. No rotation is needed for this check:
`reports/orchestration/plan-28-fixture-readonly-check.mjs` calls the same existing
Plan35 freshness, origin/attestation, save hydration, boundary and negative-control
functions without invoking checkpoint-proof.mjs's appendResult. The helper has no
write APIs, creates no attestation and cannot bypass a failed canonical check.
Its summary is small; full duplicate save-state records are unnecessary here.

Root ran these serially through the unchanged Plan25 bounded launcher (1GiB Node
heap,2GiB sampled owned-tree private memory,90s per command), after observing no
Node/Python process:

1. `node reports/orchestration/plan-28-fixture-readonly-check.mjs`
   passed both real rent fixtures, source/validator/capture-origin/current-attestation
   checks and negative controls. Exit0, elapsed1.0378783s, peak sampled79597568bytes;
   StopReason null, CleanupNotes empty, stderr empty. Validator remained
   `2e11f60360c6ca90c078776d5df77d2f96e0733e3129dd13593bf69d03c0fa1a`.
2. `node --test --test-concurrency=1 reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/plan28.test.mjs`
   passed12/12, zero failures/cancellations/skips. Exit0, elapsed1.5682505s, peak
   sampled150523904bytes; StopReason null, CleanupNotes empty, stderr empty.

The tests cover exact fixture loading/tampering, source-table and reached-state
routing, actual furnished SVG variants and engine sales, immutable past-tense
ledger, pre-payment copy, paid-zero choices, genuine final-decline disclosure,
acceptance effects and the evening/Day3 ordering. These are model/markup checks,
not rendered interaction or production-integration proof.

The Plan35 active pilot log remains806905bytes and SHA-256
`610a080cd37d0c5a1a79314b89ab66fc272d5b69c243ed6ee17f5417b518cdd5`.
No fixture/catalog/validation index or existing evidence record was changed.
Post-run no Node process was observed. No further test rerun is needed unless
new source changes or browser findings justify one.

## Exact next clearance to the Claude lead

Proceed with ONE browser gate under validation-plan.md's revised §2–3, using
`comparison/serve-bounded.py` via the stated `python -I` invocation, bound only to
127.0.0.1:5228, deadline900s maximum. Root reviewed the source: repository root
directory, correct module MIME types, threading server with finite main loop,
server_close in finally. No new packages, Node/Vite server or copied CDP harness.
If port5228 is occupied, do not kill/reuse its owner; report or propose another
unused port. Record actual PID/URL/deadline and close the owned process in finally.
Use one coordinated browser tab/context; don't open another project's tabs.

The PowerShell server wrapper may run in a background helper while browser checks
proceed, with Hidden window, finite Python deadline and explicit cleanup. Don't
block the conversation on a15-minute foreground wait. On failure or completion,
stop/close only the owned server, confirm exit and no listener, and preserve logs.
A crash or cleanup uncertainty is a stop/report condition, not authority for broad
process cleanup. No source changes during the browser comparison.

Review at1280x720 and390x844, with keyboard actions, distinct paid-zero/unpaid
branches, actual sale disappearance, final decline, focus, duplicate activation,
scenario switch during transition and the deliberate stale-load failure switch.
Snapshot storage keys plus value hashes, database names/versions, caches and worker
registrations in the disposable prototype origin before/after. Do not access or
clear the owner's production game storage. Equal database lists do not prove equal
database contents; no-API source evidence remains separate.

Compare the two morning framings for owner review. ?motion-off is approved as a
prototype alternative, not OS reduced-motion evidence. If the harness cannot emulate
the actual OS preference, record that limit without blocking this visual review.
Likewise screenshots viewed but not saved are observations, not retained images.

The auto-opened page previously reported is still not evidence. Save/Settings/
Uninstall/Receipt and races remain stand-ins, not integrated behavior. No production
fixes, new time rules, art, audio, or schema changes are authorized. If the first
browser failure requires a source repair, stop and report the concrete issue;
don't iterate an uncontrolled set of runs under this single gate.

Update Plan28's validation plan/progress to reference this root evidence and the
read-only method; do not claim the Claude lead ran commands root actually ran.
No more log-cap deliberation or Plan35 mutation is needed. Return rendered
observations, remaining owner choice and exact resource/cleanup evidence. Branch C
continues, no advisor call. Commit owned report files, progress last; no status/push.
