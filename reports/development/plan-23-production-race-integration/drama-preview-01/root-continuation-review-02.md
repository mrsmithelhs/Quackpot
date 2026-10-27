# Continuation repair review

2026-10-27. Root reviewed 5e1feb5/bac7460, reread timing helper/controller and relevant resolver rollback/prefix code, reran 12 focused tests (all passed), and opened an isolated IAB tab on the approved localhost route. Owner tabs/server untouched; root tab closed and slot released.

## Independently verified repairs

- Default is individual crossing mode. At tick5/0.24s, podium was hidden and result lighting opacity0. At tick386/19.32s (21.3s wall playback), both remained hidden/zero. The former early-winner disclosure is gone in these observed samples.
- Source timing helper uses an explicit millisecond reveal boundary and anchors the highlight to the original first-cross segment; camera progress derives from first-cross tick. Focused tests cover the boundary and midpoint mapping.
- Root directly reran the previous val-04/R01/player7.5/field8/steady/no-trial failure: actual returned terminal snapshot now deep-equals the historical snapshot, rather than merely matching a separate witness.
- Root directly forced val-01/player10 maxMechanicalEvents26: returned state is unresolved, zero crossing facts, null first-cross witness and last trajectory tick434. The former inconsistent retained crossing is gone.
- Natural playback reached a readable settled podium showing actual50/20/10 Gem recipients and upper-course finishers. Skip/static behavior has targeted implementation evidence, with fresh root verification still needed after the final control repair.

## Remaining control repair

Root reproduced completed race → narrative → select RivalE22.49s event: podium hides, lighting resets to0 and status promises Resume from that tick, but the Resume controls remain disabled because `state.finished` stays true. Root sent a bounded source-UI repair; no new model tuning, reviewer or 1,440-case rerun is warranted for that change.

The natural-play attempt to pause within the one-second reveal missed the window and reached completion; it does not establish intermediate reveal easing or pause stability. Root will use the repaired event-seek/resume path to inspect that boundary. No owner-ready claim yet.

Historical and regenerated numerical results remain report evidence. The owner-selected criterion is first-winner crossing; last-finisher9.10% over23s is a separately disclosed measure, not a new tuning failure. Production/save/Receipt/reward integration remains unvalidated.

## Final control repair — ready for owner visual review

Root reviewed eb9800f/0c7920c and independently reran the four timing/seek tests (passed), following the earlier nine resolver tests. Fresh isolated browser inspection confirmed the individual mode default, completion via Skip, then event seeking to RivalD's final crossing at22.67s/tick453.3458071365459. Podium was hidden, lighting0 and Resume enabled. Resume followed by a timed350ms observation/pause captured an intermediate reveal: lighting opacity0.27275 and podium transform y=-1.92131, with HUD at the terminal tick. A subsequent separate read retained those exact paused values. Resume completed with lighting approximately0.34, podium y effectively0 and unchanged first21.62s/last22.67s result.

Restart reset to the early race (tick5), podium hidden and lighting0. Switching to static/reduced motion and advancing four Next-view checkpoints reached the same six-finisher result and settled podium, camera identity, lighting0.34. The committed resolution fingerprint remained identical across the final control sequence. Captured browser warnings/errors: none. Root closed its tab and released the browser slot. The settled rendered podium kept names/50–20–10Gem labels readable with track finishers visible above it.

**Disposition:** repaired report preview is ready for owner visual review. Concrete review01/02 defects are resolved in the tested fixtures/paths. This accepts bounded investigation delivery, not production integration, complete packet status, universal visual quality or classroom/device behavior. Owner should judge the final slowdown, overlapping podium descent/dimming and overall race pacing. Production ownership/lifecycle/save/Receipt/reward integration remains a separate open gate; no further tuning is requested by this review.
