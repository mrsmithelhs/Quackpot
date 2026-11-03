# Plan 58 — first milestone and clearance proposal

2026-11-03. **Proposed; orchestration clearance required before provider calls or executable gallery work.** The Plan 55 concepts and candidate numeric contract are evolving, not production rules. Plan 57 is concurrently experimental. This is an animation study, not an ability catalog or resolver design.

## Candidate trigger and visual map

Each activation is a seeded automatic opportunity when its condition exists, not a guaranteed outcome. Start/active/end are presentation states of an explicitly authored example; all actual durations, exact conditions, targets and cancellation behavior remain open.

| Candidate / source | Opportunity and affected participants | Example presentation stages and unresolved contract |
| --- | --- | --- |
| Burst / Plan 55 earlier comparison | Whole-race rating proxy affects self; no discrete flight trigger. | Label as speed-proxy control; no invented takeoff or timed activation. Whether a distinct burst exists is open. |
| Guard / Plan 55 earlier comparison | Actual contact and candidate injury decision; affects the guarded duck. | Contact, possible protection indication, end; injury model and whether protection applies are open. Production has no persistent injury model. |
| Wide Flap / ability concepts | Nearby entrants; self acts, eligible neighbors may be deflected. | Wing spread, directional push, settle; area and targets open; flap itself is not an injury. |
| Dive | Traffic/contact risk; self submerges. | Submerge, marked underwater interval, resurface; timing, air interactions and overlapping landing open. |
| Flap Ahead | Entrant ahead and viable path; self flies. | Takeoff, airborne passing, landing slowdown; air contact, landing and crossing open. Not the Burst proxy. |
| Draft | Eligible faster nearby leader; following duck benefits. | Identify leader and follower, shared wake, release; gap, leader loss and cap exception open. |
| Straight Shooter | Actual duck contact deflects self. | Show real impact then heading correction; active/end and steering effect open; no erased injury. |
| Bounce | Actual collision followed by independent successful activation; self rises above later ground traffic. | Impact remains visible, rise, airborne interval, safe landing; air contact, injury ordering and landing open. Not every collision activates it. |
| Quick Recovery | Actual collision starts self's lane recovery. | Impact then shorter return along continuous path; end and recovery relationship open; no teleport or injury erasure. |
| Crowd Surge (working name) | Defined crowd and independent successful activation; self accelerates. | Show nearby entrants, self acceleration accent, fade; crowd, available path and risk open. Does not require Draft. |
| Steady Nerves | A real self-generated wobble opportunity; self affected. | Modest wobble and factual cue then settle; actual activation/end open; not collision protection. |
| Wake Break | Actual close follower; source and follower affected. | Source wake points toward follower, trailing response, wake fades; target/gap and acceleration effect open, not injury or forced movement. |

Potentially confusable groups need distinct movement or shape as well as text: Bounce versus Flap Ahead; Straight Shooter versus Quick Recovery; Draft versus Crowd Surge; Wide Flap versus collision; Guard versus injury marker. Compare these before proposing consolidation. Guard remains provisional and Burst's proxy may be deferred as an animation until it has discrete semantics. No merger is selected by this study.

## Proposed ownership and pins

Own only `reports/development/plan-58-race-ability-animation-study/`: `concept-map-proposal.md`, `progress.md`, later `consultation/`, `art/`, `gallery/`, `tools/`, `evidence/` and `integration-brief.md`. No source, shared helpers, package, other packet or status edits. Read-only source references, SHA-256 at this checkpoint:

- `src/core/duck-rig.mjs` `389f18ae5b391e0b3922a183c8ffe2c8d776bd35b8feefa47b72c067d774f793`
- `src/ui/duck-rig-view.mjs` `e996129c859bb1602e3646c7c3607d37f64e88ef3d611bf16de91021e77fa4a7`
- `src/ui/race-view.js` `d04f2fa57c41be7060a3427eceec73cbeb3b77c8d6d12d7b4bcd11b582b4a074`
- `src/ui/race-motion-controller.mjs` `1c4aa11ba8ccd81532b519e435898394f2e4ed18c13943fa2610c399efce1191`
- Plan 57 `evidence/reference-02/race.png` `401777c27af592cdcfe3a61326351f7a315af27e517bd6722213dd390560fa35`; `closeup.png` `69fdb1504f7b11e818e21740607769ee5cdb464fe72bdeeeb46636aae9734837`. These are synthetic reference captures, and the latter is a crop at similar duck size, not an enlarged demonstration. Plan 57 assets are unaccepted; no asset reuse is assumed. Re-pin immediately before any reuse.

## Gallery proposal

A report-local HTML/CSS/module gallery imports the two pinned rig modules read-only, with a local presentation controller and authored fixture data; no runtime imports into the game. Separate world position, facing/orientation, local effect and upright label layers. Fixture events carry stable ID, time, type, source, explicit targets, phase and end/cancel, with independently authored trajectories and a labeled synthetic timeline; no resolver, randomized outcomes, save or storage. Derive visible state from time so seek/replay cannot duplicate pulses; teardown each instance and test overlap, boundaries and independent instances. Provide pause, seek, replay, static and reduced-motion/text states.

Early owner checkpoint: two visibly different Bounce treatments, two crowd-acceleration treatments, one combined sequence showing the initiating collision and independent activations, plus still storyboards for other candidates. Compare six ducks at actual race-scale width, turns, upright labels, normal/drama lighting and narrow viewport. In addition provide two separate, genuinely enlarged duck/effect demonstrations in Duck-Dex inspection and racer-selection mock contexts, with optional replay, useful still, short conditional player copy and source/target/stage clarity. These are explanations, not real races or guarantees. Coordinate collision/injury neighbors with Plan 57 without editing or representing unfinished art as accepted. Use isolated browser contexts; don't touch owner storage or restart the server. Browser/resource scheduling and actual render review require root coordination.

## Provider and drawing proposal — not yet cleared

Deliver the same concept brief and actual staged race/rig image bytes independently to Sonnet and Flash before cross-sharing. Ask for a whole-set visual vocabulary, possible overlaps, combinations, colored/accessorized bodies, turns, drama lighting, race scale, transitions and static equivalents. Synthesize and reuse each conversation for at most one focused follow-up if useful. Then request small standalone motifs from Haiku and a larger coherent composition from Sonnet only if useful; Codex integrates. Inspect XML for scripts, handlers, external links, foreign content, raster, unsafe IDs and size before any browser rendering; namespace IDs and inspect actual rendered results. Original output and sanitized provenance stay report-local, private receipts out of Git.

Plan 50 evidence supports proposing `claude-sonnet-5-5` medium with restricted/safe, strict MCP, Read-only tools and image reads; `claude-haiku-5-5` with empty tools for text-returned SVG; and `gemini-3.8-flash-medium` plan mode with session deny rules for writes, commands, MCP and web. Sonnet's image-block traces and Flash's synthetic content challenge provide limited prior evidence, not proof for this run. Flash advertised broad tools and its effective policy, startup context and image byte transport were not fully established; prior sandbox authentication failed. Normal provider/session persistence applies. Never transmit private material, silently substitute models, retry authentication or assume effective effort. Check available trace or output evidence for image delivery and disclose when final-only output cannot independently verify reads; filenames alone do not establish delivery.

Propose serial jobs only, fresh process/memory preflight and root scheduling; per call default 90 s wall, 2 GiB sampled owned-tree and 1 GiB Node heap via the applicable unchanged bounded launcher. Hard output capture and CLI timeout must be checked against current launcher/help before a call. Stop on timeout, authentication, unexpected tools/model, truncation, missing image delivery or resource stop; retain failure and request review, no automatic retries. Two independent initial consultancy calls are proposed; any follow-up or drawing call is separately allocated when results justify it. No guarantee of cost or tokens; subscription usage is unknown. No new billing/account/API setup. Exact executable paths, current CLI flags, argument vectors, staging location, receipt isolation and observed available memory still need verification and root approval before dispatch; Flash executable was not found on this session's PATH. These gaps are deliberately not represented as cleared.

## Evidence and approval limits

The bounded Plan 58 check returned RUNNABLE. The initial direct Node check mistakenly preceded the handoff's bounded check; it was repeated through the unchanged launcher after a partial process/memory preflight. Windows denied CIM; .NET reported 33,615,630,336 bytes total available to GC but not reliable current free memory, and the sandbox process query returned no listed node/browser processes with exit 1. This is insufficient proof of host-wide idle capacity; root must coordinate fresh host preflight before heavier work. No provider call or executable gallery has run. Early owner visual selection, final selection and production integration remain separate gates.
