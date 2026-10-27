# Plan23 finish and podium follow-up

2026-10-27. Owner asks for racers to slow smoothly to rest within about one second of finishing, keeping playback alive until all have stopped. Owner also proposes a large podium dropping from above with about one second of ease-out, in/over the centre and lower oval, leaving finishers visible along the top. Root assigns the independent podium prototype to the current isolated preview now. No production adoption follows.

## Pending finish-rule decision

Current accepted model stops at the first actual crossing and classifies followers at that instant. Most followers have not crossed. The implementer correctly identified that the existing saved trace cannot supply their future crossings. Cosmetic extrapolation cannot be called continued simulated racing, and future crossing order must not silently replace locked official standings.

Root recommends genuinely simulating remaining entrants through their crossings and using crossing order for lower places, with individual one-second presentation braking afterward. This is a proposed revision to accepted same-instant classification: it may change lower placements and Gem recipients. The winner and first-crossing timing-distribution target remain distinct from total last-finisher/coast/podium playback time. An alternative is preserving official classification and explicitly cosmetic run-out, which creates a less intuitive finishing display. Owner was asked to choose before dependent implementation. No answer is inferred from elapsed time.

Any continuation must bound unresolved entrants honestly, preserve seeded reproduction and one-time rewards, and distinguish competitive simulated trajectories from post-crossing braking. No forced crossings, unreported new balancing, false finish times or repeated rewards. Prototype proposal and measured tail duration precede production adoption. Exact continuation rules, result versioning, watchdog and non-finish classification must be reviewed before a resolver change.

## Independent podium assignment

**Owner decision received:** Owner explicitly chose actual individual crossing order. DECISION-022 supersedes the pending choice above and historical same-instant follower classification. Root sent the implementer that decision and requested exact continuation/file-scope/validation details before model edits; no cosmetic exhibition fallback is selected. Production integration remains gated.

Root approves the implementer to edit only `drama-preview-01/preview-controller.mjs`, `preview.html`, `preview.css`, `README.md`, `evidence/` and the packet progress report. Start with the current terminal/result hook; connect to all-stopped only after the finish decision. Preserve model files, production, Plan10 and orchestration files.

Use original SVG stacked-paper stepped plinths in 2/1/3 order, large local duck rigs, readable HTML/CSS names/place/Gem labels and a player marker. Display actual resolved Gem recipients, not extra awards. Keep the upper course and finish line visible. The descending panel should settle over about one second, with no bounce requirement or new animation catalog/audio. Reduced motion and skip use the settled display; pause freezes it; restart or earlier event seeking hides it. Keep immediate exit and no duplicate mechanical reward writes.

Podium cues belong in presentation evidence only when actually displayed. Replays can truthfully record another display under their replay index; deduplicate accidental rerenders, not genuine later displays. Do not log a skipped slide as watched. SVG references must be instance-safe. Request browser turns and preserve owner tabs/saves/server. No additional reviewer is authorized for this bounded repair.

## Continuation proposal gate — approved with corrections

Root read the candidate resolver and obtained a read-only Luna-high proposal audit. Both identified crossing-step deferred wall/contact work, non-transitive epsilon sorting, separation of first-crossing parity from later-finalized result records, and the unsupported claim that PHYSICS.minSpeed supplies an applied speed floor. These are proposal corrections, not witnessed implementation bugs in the new resolver (which did not yet exist).

Approve the proposed new report-only `individual-finish-model.mjs`, focused tests, validation runner and generated validation results inside `drama-preview-01/`, in addition to the already approved preview files. Preserve historical models/results. The implementation instructions sent to QP Impl23 require:

- Strict unrounded crossing-time ordering and exact-equality ID tie-break; near-tie diagnostics separately. Any conflict with the historical winner in the 1,440 witnesses returns to root.
- Freeze the original fractional first-crossing witness, process all same-step crossings in time order, then apply deferred endpoint wall/contact work only to still-active entrants, once. Finished entrants cannot influence later competitive events.
- Explicit first-crossing parity projection against raw old-resolver results, distinguishing derived finalization/status fields from causal data. The extended full-result fingerprint necessarily differs. No weakened causal parity or redundant runtime resolver run to fabricate it.
- Initial 800-tail-tick watchdog as a tested guard, not a guaranteed speed-derived bound. Compare all 1,440 selected-candidate inputs; report tail quantiles, unresolved/guards, lower places and changed Gem recipients. Partial-unresolved/no-final-payout is a conservative report-only policy; production policy remains gated. Future finishers cannot change the order of entrants that already crossed.
- Original highlight/camera beat stays anchored to the first-crossing segment. Per-entrant one-second braking is separate presentation without a sudden heading snap. Podium follows all-stopped. Replay/skip/seek/pause/snapshot retain committed mechanics and correct presentation phase without new RNG or payouts.

Root approved this scoped implementation after the proposal review, with no new tuning, production edits, extra implementer reviewer, status change or push. Return executable/rendered delivery for independent review and owner visual acceptance.

## Inspiration sources

Official sources establish kart-racer precedents for a separate top-three awards presentation: Nintendo's Mario Kart DS manual describes a podium ceremony, and Activision's Crash Team Racing update notes describe top-three podium animations. These support the general winner-celebration pattern, not the proposed Quackpot layout or an assertion of psychological efficacy. No branded art is imported.

- https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_ds_21/Manual_NintendoDS_MarioKartDS_FR.pdf
- https://support.activision.com/content/atvi/support/web/fi/crash-team-racing/articles/crash-team-racing-nitro-fueled-updates.html
