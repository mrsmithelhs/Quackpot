# Plan 28 Stage 2 source review and next validation clearance

Date: 2026-10-30. Reviewed commits 5479533/7ccf03f and actual comparison files.
No test or browser execution by root in this review. Branch C/no advisor remains
owner-selected; no extra review-agent call is required.

## Disposition

The report-local A prototype is within scope: accepted art, memory-only real engine
actions, HTML communications, property-office sender, travelling static companion,
and separate reviewer/projection information. No production or new-time-rule work
is adopted. The early unguarded `node -e "1"` deviation and auto-opened page remain
disclosed; neither supplies validation evidence. Do not repeat either as a shortcut.

Before the cleared batch, make these small corrections and commit them:

1. `prototype.js` runScenario's catch handler is not generation-guarded. An older
   rejected fetch can set busy=false and replace a newer scenario with its error.
   Capture the scenario generation at launch and ignore old errors just as the
   successful load ignores stale completion. Do not let an old catch reset current
   controls. Add this to the later browser scenario-switch exercise.
2. `views.mjs` ledger uses a historic expense's cashAfter but labels it current
   'Cash on hand'. Use 'Balance after breakfast' or equally clear past-tense wording.
   This matters especially for the Day1 log projection from a Day2 fixture. Update
   any related expectation; don't mutate fixture time/state to make a display fit.

## Exact offline/test clearance

After those fixes, take a read-only Node/private-memory preflight and stop if a
single Node process is at least1GiB, aggregate at least2GiB, or another Quackpot
validation is active. Inspect rather than kill unknown processes. Run each of the
following serially through the unchanged launcher below; stop on first failure:

Launcher: `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1`
with `-Executable node.exe` and these separate `-ArgumentVector` values:

1. `@('scripts/dev/checkpoints/checkpoint-proof.mjs','fixture','plan35.rent-paid-zero.v1')`
2. `@('scripts/dev/checkpoints/checkpoint-proof.mjs','fixture','plan35.rent-unpaid-escalation.v1')`
3. `@('--test','--test-concurrency=1','reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/plan28.test.mjs')`

The launcher's1GiB Node heap,2GiB sampled owned-tree and90s per-command limits apply.
No broad suite, watcher, mutation sweep, installs or automatic retry. Preserve failed
output and unchanged fixtures. Root explicitly permits the two canonical preflights'
ordinary bounded evidence-log appends; no fixture/catalog/index edits or revalidation.
Read the active1MiB log size first and stop if capacity is inadequate, rather than
rotating attestation-pinned logs. Existing active evidence was806905bytes at delivery;
current actual size governs. Source and catalog identities must remain stable during
this batch. Commit scoped comparison/test/report files only, progress last.

These two canonical checks establish current origin/source/validator attestations
before using the memory-only prototype. `fixtures.mjs` itself checks exact save
bytes, recorded results and ordinary envelope validity; it does NOT independently
recompute current source closure/validation-loader identity or resolve the full
attestation record. Describe that boundary accurately in the reviewer panel/report;
do not advertise the lightweight page loader as Plan35's complete freshness loader.
No synthetic rent fallback on canonical preflight failure. The historic breakfast
and return compositions remain labelled projections/display-only where applicable.

## Browser gate remains pending

After tests pass, return exact outputs/source revision and the next server/browser
proposal. The existing browser checklist is otherwise a useful scope at1280x720
and390x844, keyboard actions, duplicate activation, scenario switching, scene changes
and motion-off. Correct two details before clearance:

- Server fallback: `Start-Process` plus a later manual stop is not a hard30-minute
  bound. Propose a small finite loopback-only static serving command with a real
  deadline (up to15minutes), registered owned PID, and cleanup in a finally path.
  No generic new process manager or copied Plan35 CDP harness. Reusing a verified
  root-approved existing server is also acceptable; identify ownership/URL first.
- Storage: use a disposable isolated browser context. Snapshot key/value content
  or hashes before/after, not just key names (a value can change without a new key).
  Do not inspect the owner's game storage. Distinguish indexedDB database-list
  comparison from content verification; source inspection supports the no-API claim.

The reported double-activation test should assert one mutation of the *specific
clicked action*, using the relevant event type: Pay appends due once; Accept appends
its escalation_result once. It need not claim every Accept appends expense_due.
Record transition/scenario-switch error-path behavior. Real OS reduced motion stays
unverified if the harness cannot emulate it; ?motion-off is not equivalent evidence.

Saving, Settings, Uninstall and the actual Receipt are stand-ins here. Never claim
production lifecycle integration from this prototype. Keep explicit cases for the
final decline and insufficient cash; state what each screenshot or observation shows.
Visible browser inspection is not proof of a complete screenshot artifact unless
the harness can actually save one. No screenshot tooling purchase/install implied.

Stop after returning test evidence and the server/browser proposal. This review does
not clear browser interaction, production changes, more art or Plan37 mechanics.
