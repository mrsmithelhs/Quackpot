# Plan23 production implementation gate

2026-10-27. Owner explicitly accepts latest preview/configuration/presentation and authorizes integration under root supervision (DECISION-023). Root read refreshed proposal29bae5b, inspected current engine/storage/Receipt/main/race-view boundaries and obtained a bounded read-only Luna-high source audit. Plan23 is RUNNABLE. This gate approves production writes, not delivery or packet closure.

## Single-writer ownership

QP Impl23 owns the exact refreshed proposal set: new `src/core/race-resolver.mjs`; race-focused changes to `game-engine.mjs`, `storage.mjs`, `receipt.mjs`; `src/ui/race-view.js`; new `race-playback-controller.mjs`, `race-motion-controller.mjs`, `race-view.css`; narrow `src/main.js` wiring; listed core/UI tests and packet progress. Additionally approve `package.json` test-script wiring only, optional `scripts/dev/plan-23-browser-check.mjs`, and narrowly necessary existing smoke race-control/explicit-skip updates preserving its original assertions/failure behavior. No dependency/build migration.

Accepted shared rig/card-motion modules and global styles remain read-only. Root owns canonical docs/packet/status/orchestration records. Preserve other work. New paths/scope changes return to root. No push/deployment.

## Resolve, failure and accounting

Adopt tested individual-crossing R2combined-risk-only/affine candidate unchanged; production never imports report files. Validate actual owned racer, one-time trial input and stance; no silent fallback identity. Keyed local race inputs/results are immutable and duplicate/reload callbacks reuse committed attempts without extra RNG, charges or payouts.

Root selects conservative exceptional-guard behavior: persist a failed unresolved attempt once under its key; retain factual guard/crossing evidence without final places/Gems, do not reroll or softlock/end the game. Allow normal metagame continuation or immediate Uninstall with an honest failure message. Purchased trial stays available and is not consumed by the failed attempt; no new charge/refund policy. A failed story race step is not a completed mechanical race and must not count toward future Plan22 rest. Successful commit consumes selected trial and grants payout once. Keep purchase/availability/consumption separate and preserve log/state balance consistency. Three-Down trial bridge is authorized; six-Down pull exchange and rest lifecycle are not.

## Storage and evidence

Schema-v2 proposal and summary-only v1 migration are approved subject to exact round-trip/validation. No old trajectory or displayed cues may be invented. Use lossless compact numeric tuples initially, retaining raw numbers/fractional ticks/world coordinates and exact crossing witnesses. Integer quantization/derived coordinates are not accepted merely because sizing samples are small. Compare full decoded renderer timeline, input/event/crossing/order data. Version and bound every format, array, identity, tick and finite value; verify digest/log/state/accounting consistency.

512KiB per resolution and1MiB for both remain provisional measurement budgets, not an excuse to drop evidence. Test complete saves, ordinary and guarded/capped cases, corruption/quota fallback and existing snapshot preservation. Return measured alternatives to root if needed. Keep full trajectories out of the append-only log; keep mechanical facts, actual displayed cues and player actions separate. Receipt remains a pure log projection in the three honesty registers.

## UI lifecycle and verification

Port focused modules, not the monolithic preview. Main retains/destroys the race handle; modal/settings/retention/Uninstall/background behavior must pause/tear down without late callbacks or unseen cues marked displayed. Record choices when actually rendered, not at commit. Retain accepted camera/highlight/individual coast/last-cross podium/dimming/loop behavior with free static/skip/pause and concise player-facing commentary.

Required evidence: frozen1,440 reference parity and actual renderer trajectory agreement; representative actual inputs/trial; idempotent commit/reload; legacy migration and complete two-race storage round trip/budget; guard failure; actual versus unseen Receipt cues; focus/static/seek/motion cleanup. Wire meaningful new tests into test commands, run required build/full checks, then request coordinated isolated production browser desktop/narrow turn. Only one allowed Sol-low read-only reviewer for implemented main production artifact before delivery; no proposal/repair reviewers. Root independent reviews remain Luna-high. Return measured findings and stop for root/owner delivery review.
