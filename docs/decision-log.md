# Decision Log

This file records decisions that should guide future work. New entries should include a date and rationale.

**Append-only.** Do not edit or remove entries. If a decision is superseded, add a new entry that references the old one.

This file is orchestrator/owner-owned. Implementers propose but do not edit.

## Accepted decisions

Use this shape for accepted decisions:

```markdown
### DECISION-001 - Short decision title

**Date:** YYYY-MM-DD

**Decision:** What was decided.

**Rationale:** Why this decision is the right tradeoff for now.

**Supersedes / related:** Optional links to older decisions, packets, or resolved open questions.
```

*(Founding design decisions from 2026-10-23 are recorded in [`docs/founding/design.md`](founding/design.md), [`docs/project-seed.md`](project-seed.md), and [`reports/orchestration/founding-docs-review/owner-triage.md`](../reports/orchestration/founding-docs-review/owner-triage.md). Add subsequent project decisions below as owner decisions are made.)*

## Proposed but not yet accepted

Use the same `**Date:** YYYY-MM-DD` field for proposals, using the proposal date.

*(Implementer proposals waiting for owner review go here.)*

## Accepted decisions recorded 2026-10-24

### DECISION-001 — Ratified paths and local Plan 02 spike

**Date:** 2026-10-24

**Decision:** The owner approved the paths proposed after Plan 02 and inspected the local preview. `docs/repo-structure.md` records the accepted layout. Close Plan 02 as the independently verified local build/subpath spike; live Pages deployment, remote configuration and deployed slash behavior remain unverified and unauthorized. Shared-module relocation remains a bounded integration after Plan 01 acceptance.

**Rationale:** Build/source paths have executable local evidence. Improving the placeholder duck's look is a visual-design follow-up, routed through concept selection and Plan 04's SVG rig rather than reopening scaffold validation.

**Related:** Plan 02 `review-02.md`; Plan 08 visual-direction brief.

### DECISION-002 — Generated concept references before the production SVG

**Date:** 2026-10-24

**Decision:** The owner requested a separate Gemini thread using image generation for several duck styles, three variants each, and a local HTML comparison page. Plan 08 specifies five styles and 15 concepts, with owner selection of one or more directions before production SVG revision in Plan 04. Generated raster concepts are review references under `reports/`; they do not ship or replace authored game SVG source. This clarification is recorded beside the asset contract in the design, agent guide and orchestrator prompt.

**Rationale:** Visual directions can be compared before investing in vector construction. The current Plan 02 duck is a scaffold placeholder, not an accepted production base.

### DECISION-003 — Physical metagame prop and digital gacha characters

**Date:** 2026-10-24

**Decision:** The character owns one physical rubber duck; attachment to it motivates interest in the fictional gacha video game. That physical object is outside the collectible digital roster and stays inanimate. The owner wants to explore expressive animations for digital gacha ducks after the base SVG is settled (Plan 09). For metagame conversations, the owner favors a 2D-first study of coherent static views, camera framing/movement, lighting changes and different compositions within the apartment, including player-driven repositioning of the prop (Plan 10). Inspect zoom quality. A 3D source pipeline is only a future investigation option if a witnessed 2D limitation justifies it; no 3D runtime is selected.

**Rationale:** The physical prop can suggest personality through cinematography and context, while digital collectibles have greater freedom of motion. These require separate representation contracts. Pawning the physical object affects the metagame cash/story, not gacha ownership. The current simulation's physical `own-duck` race slot needs an explicit disposition before its rules are used in the playable slice; see the boundary report.

### DECISION-004 — Plan 01 conditional evidence accepted for closure

**Date:** 2026-10-24

**Decision:** The owner accepted Plan 01 for closure after Repair 03 technical review. Accept the bounded S1–S4 headless evidence with assumptions and censoring limits explicit; do not adopt a final balance table. Reconcile the physical-duck race/pawn coupling before Plan 03 uses the model as a playable contract, with rechecks only for evidence actually affected. Plan 03's preflight proposes the needed trial rules and trade-off for owner approval before coding.

**Rationale:** The repaired log/Receipt and paired-cohort counterexamples pass independent checks. Owner acceptance of investigation evidence enables the next mechanism proposal while preserving design authority and the later representation clarification.

**Related:** `reports/development/plan-01-seeded-economy-simulation/review-03.md`; Plan 03 preflight brief.

### DECISION-005 — Visual investigation closed; layered digital motion direction

**Date:** 2026-10-24

**Decision:** The owner approved Plan 08 closeout with 14 concepts; E3 is omitted by choice after quota failure. D2 is the physical-companion reference and E2 is the digital layered-paper proof direction. No production SVG is accepted yet. The owner wants digital motion to articulate separate paper layers, including race candidates for paddling on water, waddling on land, flapping, tiring and graceful bobbing. Plan 09 will compare these after base-rig acceptance. Motion does not adopt new stamina, race or probability mechanics.

**Rationale:** Distinct physical/digital treatments support the two fictional contexts. The paper treatment may extend to some gacha surroundings, effects or UI, but that broader art direction remains unresolved. Draft Plan 11 proposes composition and generation-budget gates before any production scene/effects/UI SVG work. Plans 04, 09, 10 and 11 remain unassigned drafts until the owner starts them; Plan 08 closure alone is not an assignment.

### DECISION-006 — Plan 03 amended short trial approved

**Date:** 2026-10-24

**Decision:** The owner confirmed approval of the amendments in `reports/development/plan-03-mechanism-slice/preflight-review-03.md`. Adopt its bounded three-day mechanism trial, including the limited Common-only stance comparison and explicit broader race-choice uncertainty. This approves implementation of the amended trial, not final balance, the approximately 15-minute floor or played-slice acceptance.

**Related:** Implementer's recorded adoption `d6fa938`; implementation `ea74cc6`; technical `review-01.md` returns that implementation for Repair 01 against the adopted contract.

### DECISION-007 — Plan 03 owner play disposition and next design obligations

**Date:** 2026-10-24

**Decision:** After playing the technically accepted slice, the owner delegated now/later triage and permitted closure if the feedback belongs to subsequent work. Close Plan 03 as the bounded mechanism proof after inline removal of developer-facing Receipt copy. Preserve the favored logo. Route full-width framing/save settings and context transitions to draft Plan 14, progressive onboarding/shop teaching to draft Plan 12, and race staging/day pacing to draft Plan 13, coordinated with existing art/motion packets. These drafts require owner sequencing/assignment and recommendation gates; no generation budget or production implementation is authorized by their creation.

**Rationale:** The approved short trial demonstrated the loop, save/exit and truthful Receipt boundaries; it did not promise final onboarding, day length or race spectacle. Oval movement, contact, camera direction and approximately 30-second races are investigation candidates, not adopted mechanics or final durations. The approximately fifteen-minute floor remains a later whole-run validation obligation. Preserve the recorded Skip Lunch settlement follow-up before expanding food-shortfall play.

**Related:** `reports/orchestration/plan-03-owner-play-feedback.md`; Plan 03 technical `review-03.md`; Plans 09/11/12/13/14.

### DECISION-008 — Plan 12 owner interview and experience/debrief boundary

**Date:** 2026-10-25

**Decision:** Integrate the completed Plan 12 interview as owner direction and close its investigation, not production implementation. Retain the guided companion → phone → free ten-pull → tutorial win → starter-offer sequence; progressive Gems/Down introduction; staged shop; free skip/reveal-all; and O1 Receipt structure. Live gacha should communicate through play and sensory momentum. Remove mathematical/manipulation-analysis helper panels from it and place critical reflection on the Receipt/debrief. Preserve necessary costs, odds, terms, operational warnings, accessible equivalents and immediate exit. The metagame may still contain story dialogue.

The owner selects a fictional-phone quarter-turn into landscape followed by stage expansion as the transition direction, with responsive/static/reduced-motion treatments to be proposed. This does not require physically rotating a laptop, browser fullscreen or a fixed viewport ratio. Starting companion customization is accepted, with more colors/accessories later. Duplicate dissolve/feather conversion, rarity-specific sounds and stronger commercial offer presentation are future obligations. Reduced-motion/audio/contrast controls remain binding; subdued secondary actions must remain readable and operable. No countdown semantics, final app title or accessibility-conformance claim is adopted by this interview.

**Economy refinement:** Down should be usable enough to try while remaining lossy. This supersedes the earlier near-useless exchange direction. The owner selects 3 Down for a minor temporary speed item and 6 Down for a single-pull ticket as calibration targets, with exact effect, duration, stacking, ticket pity/duplicate rules and recycling consequences requiring Plan 17 evidence and owner selection before integration. Do not silently reprice. The 1,750-gem tier is an accepted odd-bundle example; its 150 remainder after a 1,600 ten-pull is bundle-only arithmetic, not a claim about every wallet. Other future tiers and rollout days remain proposals.

**Rationale and limits:** A commercial-feeling experience and an honest later Receipt are compatible. The interview's static examples establish preferences, not PRNG, accessibility, comprehension or economy proof. Current rarity-weighted Down payouts invalidate treating duplicate-card count as expected Down; whole-wallet balances can also remove the illustrated ten-gem shortfall. Investigate these consequences before implementation. Keep the reviewed wireframe as history and use the integration report to supersede rejected recommendations.

**Related:** `reports/development/plan-12-guided-opening-and-shop-progression/wireframes-owner-interview.md`; `reports/orchestration/plan-12-owner-integration.md`; Plans 06/10/11/13/14/15/17. No packet assignment, production change, push or publication follows from this decision.

### DECISION-009 — Mode C selected, three quacks retained, audio sourcing proposed

**Date:** 2026-10-25

**Decision:** Owner selects the actual rendered Plan 04 Mode C hybrid paper duck; preserve its appearance and layered construction for later motion exploration. Retain all three synthesized quack candidates with stable IDs; owner hears C as significantly softer. No single default sound role, random variation policy or volume normalization is selected. A bounded Repair 02 promotes selected C to the master/default, finishes parameter validation and corrects unsupported/stale evidence claims before Plan 04 closes. No production motion or game integration follows. The existing preview only has manual pose diagnostics; actual motion comparisons remain Plan 09.

**Owner clarification:** The selected smaller Down-ticket price supports the feeling of almost catching up, with occasional recoveries. Preserve the 3/6 calibration. Plan 17 should describe recovery trajectories as well as the long-run exchange; perceived recovery and a profitable/self-funding loop are separate questions. Do not rig outcomes to create a teaching example or infer a player's feelings from actions.

**Proposal, not adopted policy:** Owner asks about free sound libraries, attributed Credits from the opening and Creative Commons music. `reports/orchestration/audio-source-options.md` supplies primary sources and a concrete amendment; draft Plan 18 gates its adoption and sample selection. Current synthesized-effect/music-source contracts remain unchanged until owner approves expanding them, with design/AGENTS/prompt synchronized. No external file is downloaded or selected here.

### DECISION-010 — Licensed Creative Commons audio and factual Credits permitted

**Date:** 2026-10-25

**Decision:** Owner explicitly approves amending the documents to permit licensed CC audio sources. Effects and music may use selected locally bundled Creative Commons recordings, including CC0 dedications, alongside synthesized effects and JS/model-generated music. Verify exact per-asset license/version, redistribution/modification compatibility and required notices; prefer CC0/CC BY for straightforward reuse. Retain source, creator, license text/notices, modifications and local-file mapping. Provide local Credits linked from opening/settings. Factual creator/source identities and license notices are permitted there and in provenance records; fictional gameplay entities remain fictional. No remote audio/CDN, automatic third-party loading or telemetry.

**Scope:** Design, AGENTS and orchestrator prompt are synchronized. This supersedes DECISION-009's pending source-policy gate; do not ask for that approval again. Specific recordings and production integration still require owner selection. Plan 18 remains an unassigned draft, now able to investigate auditions once assigned. No file download, library migration, change to Plan 04 Repair 02 or new packet assignment is implied. Model-generated music provenance is still unresolved.

### DECISION-011 — Plan 04 rig/sound proof accepted

**Date:** 2026-10-25

**Decision:** Following Repair 02 technical verification and the owner's acceptance of manual head/wing poses as a good start, close Plan 04. Mode C is the selected digital rig/default/master; all three synthesized quack candidates are retained. Larger and independent paper-layer motions remain Plan 09, not missing work in this static-first proof. Root corrected leftover shadow wording and forced smooth gallery scrolling inline; no further implementer round is needed.

**Limits:** No production game integration, full roster, sound-role/mixing selection, acoustic calibration, classroom performance or licensed-recording selection is established. Plans 09/13 retain their own owner assignment/recommendation gates despite Plan 04 dependency completion. Plans 14/17/18 are already assigned and continue independently. Evidence: `reports/development/plan-04-svg-rig-and-sound/review-04.md`.

### DECISION-012 — Shell A and automatic phone transition selected

**Date:** 2026-10-25

**Decision:** Owner chooses Shell A after refining the wireframe. One activation automatically plays turn then expansion; no separate Expand click is required. Reverse return visibly fades/collapses the phone border as it rotates back to portrait. Settings stays above chrome and within reach, with backdrop dismissal in addition to close/Escape controls. Final production removes explanatory/review scaffolding while retaining essential information, operational feedback and accessibility. Close Plan 14 as the presentation investigation.

**Implementation boundary:** Exact timings/easing/layout values remain tunable. `reports/orchestration/plan-14-production-handoff.md` is the concise selected contract and source mapping; draft Plan19 gates focused production integration. Large report HTML is a transient comparison, not production source or an automatic migration. Actual src roles are now documented in AGENTS and `docs/repo-structure.md`. No whole-app framework/refactor, audio/rig integration, economy change or new packet assignment is approved by this closeout.

### DECISION-013 — Plan 17 bounded evidence accepted for closure

**Date:** 2026-10-25

**Decision:** Owner explicitly accepts Plan 17 for closure after Repair 01 technical review (`7325541`; report-folder `review-02.md`). Retain the accepted scenario contract: 3 Down for +5% base speed on one race, non-stacking, consumed once on race commit; 6 Down for an immediate active-banner draw with normal duplicate payouts and normal pity advancement/Legendary reset. Preserve the welcome-pull exception. This is the bounded trial contract/evidence for later integration, not a claim those features are implemented or final whole-run balance is proven.

**Limits:** Six-identity opening affordability, pooled integer-bank and selected ownership/pity/race cases are verified under recorded assumptions. Censoring and residual probability remain visible; no universal multi-system non-self-funding proof or empirical player-response claim follows. Production must still verify consume/cancel/reload/idempotency, real wallet actions, append-only log/Receipt evidence and whole-run effects. No repricing or settled rule reopening without owner; no integration assignment, push or deployment follows from closure.

### DECISION-014 — Plan 19 Shell A/context integration accepted

**Date:** 2026-10-26

**Decision:** Owner inspected the dev-server output and explicitly approved Plan 19 closure. Accept the integrated Shell A, automatic phone turn/expansion, animated return and quiet Settings/save controls after Repair 01 resolves orientation and Credits keyboard access. Root's fresh focused browser check passes at 390×520 and 1440×900; see `reports/development/plan-19-shell-a-and-context-integration/review-02.md`.

**Limits:** This closes the bounded UI integration, not broad physical-device/assistive-technology coverage, race dynamics, economy changes or audio/art selection. No push, deployment or new packet assignment follows. Plan 13 remains an isolated investigation; Plans 09/16 remain draft until assigned.

### DECISION-015 — Real race crossing and target-duration tolerance

**Date:** 2026-10-26

**Decision:** Owner requests a real completed-lap finish-line crossing rather than ending at a strict 20-second cutoff, allowing about ±15% variation around the target. This supersedes the canonical fixed-duration distance-contest direction. The exact target, course calibration and remaining-racer classification still require a bounded Plan 13 proposal; time-guard expiry cannot fabricate a crossing. Canonical design, AGENTS and orchestrator prompt are synchronized.

**Investigation inputs, not adopted mechanics:** Owner asks to analyze seeded weaving for all ducks, stronger/more frequent perturbations for front-half racers, minimum roughly 10° deviation and 0.5-second hold, and longer collision recovery. Exact schedules, angles, recovery, penalties and combined rules remain proposals. No production integration, new per-variant tuning, push or deployment is authorized.

### DECISION-016 — Plan 09 factor-four motion set accepted

**Date:** 2026-10-26

**Decision:** Owner approves Plan09's stronger factor-four paper-layer result and requests closure. Accept the current paddle, graceful-bob, impact/recovery and static alternatives as the motion reference set (`2786feb`, evidence `22534ce`, reviews02–05). The reported detached-looking lower body backing edge was surfaced before approval; do not silently reduce the selected magnitude on integration.

**Limits and next work:** This closes the isolated gallery, not production wiring or broader motion/rig changes. Actual system reduced-motion=true and fine small-sprite edge quality remain unverified. Draft Plan20 proposes focused rig/controller integration and a trigger gate; production race-event mapping waits for Plan13's accepted semantics. No new packet assignment, push or deployment follows.

### DECISION-017 — Duck-Dex acquisition sequence and soft duck rest

**Date:** 2026-10-26

**Decision:** Owner requests voluntary Duck-Dex inspection linked to first-owned revealed identities: about2s shelf focus/scroll, then2–3s silhouette-to-color transition (optional background change), skipped by fast-pull. Show meaningful factual duck/set value. Owner selects rest speed penalties of50% with zero intervening races,25% after one, none after two; tired ducks remain eligible, avoiding small-roster lockout. Canonical design, AGENTS and orchestrator contracts are synchronized. Exact lifecycle/duplicate/composition and set effects remain proposals, not invented features or prices.

**Routing:** Draft Plan21 covers collection/acquisition presentation; draft Plan22 covers race entry/rest and balance. Neither assigned by this record. Plan20 remains focused rig/motion integration and its proposal has root approval under owner's delegated gate; QP Impl20 is authorized for bidirectional coordination. Keep free skip/static accessibility, honest reveal/Receipt evidence, no paid rest or inferred Fast Pull fee. No push/deployment.

### DECISION-018 — Combined race and two-second highlight selected

**Date:** 2026-10-26

**Decision:** Owner selects Plan13's combined rank-weighted weave +seeded15–20° contact with2s slow-motion highlight as official and explicitly closes the investigation. Reference implementation `70ba115`, report `c2b9241`, root review05 reproduces17tests and scan hash. Preserve constituent rules/caps, real first crossing and follower classification; highlight changes presentation time only, with static/reduced-motion parity.

**Limits and routing:** This is mechanism/direction selection, not production integration or universal balance proof. One duck-contact episode, long recovery/skips, grid advantage, label overlap and terminal fixed-step approximation remain disclosed. Draft Plan23 ports model/input/save/log/view and accepted duck motion; draft Plan22 rest follows its production contract. Plan20 is delivered awaiting owner card-motion acceptance. No new packet assignment, push or deployment.

### DECISION-019 — Race upper-tail timing criterion

**Date:** 2026-10-26

**Decision:** Owner directs Plan23 to model race timing statistically: at most5% of races finish strictly later than23s, around the roughly20s target. This replaces the prior hard-upper-bound interpretation of±15% tolerance. Long individual races remain legitimate results of the seeded mechanics; no forced crossing or23s truncation. Canonical design/AGENTS/orchestrator contracts synchronized.

**Evidence boundary:** Seed/configuration distributions, late fraction/quantiles/sample uncertainty and independent validation are required; do not infer a population guarantee from20sample races. Watchdog/unresolved outcomes stay explicit. Simulated race finish and selected2s-highlight wall playback remain separate measures. No automatic production tuning, source handoff, push or deployment is authorized.

### DECISION-020 — Plan 20 production card motion and duplicate help accepted

**Date:** 2026-10-26

**Decision:** Owner approves the corrected speech bubble and requests closure after previous rendered review of card behavior. Accept Plan20's ModeC/factor-four keyed loops, per-card reveal/phase preservation, responsive stable grid and first-duplicate explanatory bubble with visible source pointer and persistent dismissal. Final pointer repair `f0cd77b`/`5af086a`, root review05 includes direct screenshot inspection; earlier reviews/tests bound acceptance.

**Limits and handoff:** Actual system reduced-motion=true, physical touch and rendered long-name limits remain. Unauthorized extraSol-lowrepairreview remains a disclosed budget deviation. Production source lane is released; Plan23 may receive ownership only after its calibration/lifecycle proposal is approved. No new identity art, production race/calibration decision, Dex/rest implementation, push or deployment follows from closure.

### DECISION-021 — Duck-Dex and first-owned discovery accepted

**Date:** 2026-10-27

**Decision:** Owner approves the Duck-Dex work and explicitly requests Plan21 closure. Accept the bounded six-duck collection/inspector, identity-consistent art, reveal-protected discovery and skippable first-owned shelf presentation. Repair03 `94a7c8e` and root `review-04.md` establish technical acceptance:147 repository tests,14 focused UI tests, build, harness failure-path probe and fresh8-check isolated browser run passed.

**Follow-ups and limits:** Friendlier details copy and catalog-growth recommendations are recorded in `reports/development/plan-21-duck-dex-and-new-entry-presentation/owner-refinement-01.md`; they are not claimed implemented by closure. Large rosters/multiple banners/sets remain unverified, and Plan22 rest remains unimplemented. No new odds, bonuses, paid skip, race-model adoption, push or deployment follows from this acceptance. Shared production edits still require explicit ownership coordination.

### DECISION-022 — Individual finish order, coast and podium direction

**Date:** 2026-10-27

**Decision:** After root explained that the existing race classifies followers at the winner's crossing, owner explicitly chose “Use each duck's actual crossing order.” Assign places from genuine individual crossings, accepting that lower placements and Gem recipients may change. Each duck slows smoothly to rest within about one second after its crossing; playback continues until all stop. Root assigns the proposed one-second ease-out descending podium to the isolated Plan23 preview now, showing actual Gem-earning places and large digital ducks while retaining visibility of the upper course/finish area.

**Timing and limits:** Winner crossing retains the roughly20s/median17–23s/at-most5%>23s metric. Last crossing, individual coast and podium add separate playback duration; no normalization, fabricated crossing or payout on presentation. Root requires exact continuation/finished-entrant interaction/tie/watchdog/non-finish policy before resolver edits. Historical same-instant lower-rank evidence does not validate new lower ranks. Production source/lifecycle integration remains gated. The design, AGENTS and orchestrator contracts are synchronized. Daily reward/story ideas are recorded separately as an investigation direction, with no adopted schedule or grant amounts. No push/deployment.

**Owner refinement, same date:** The approximately1s podium descent starts immediately at the last genuine crossing and overlaps the last duck's coast. Ease scene lighting down during the reveal, retaining readable podium text and the upper finish area. Playback completes when all racers have stopped and the podium has settled. This supersedes root's earlier podium-after-all-stopped sequencing. Reduced motion uses settled static equivalents. Root relayed the refinement and synchronized the three contracts and Plan23 packet; production adoption remains gated.

### DECISION-023 — Latest race preview adopted for production integration

**Date:** 2026-10-27

**Owner authorization:** “The latest preview is accepted. Use its tested configuration and presentation as the production target, and proceed with Plan 23 integration under your supervision.”

**Adopted target:** Selected R2combined-risk-only candidate with shared affine conversion8.25+0.5×sampled rating, rear acceleration/recentering/turn assistance, controlled leader slowdown, risk-only Sprint mean1.00±20% versus Safe±5%, current course/controller/caps, and the repaired actual individual-crossing resolver. Preserve the current front-row fixture and existing payout amounts. Preview mechanics are in `drama-preview-01/individual-finish-model.mjs`; latest accepted presentation is7a930fb with independent root review7faef93. Accepted presentation includes the enlarged podium, last-crossing trigger, overlapping1s coast/descent, whole-environment drama lighting, winner graceful-bob/second-third paddle ambient loops, pause and static/reduced-motion lifecycle.

**Authority and remaining work:** Production adoption is settled. QP Orch supervises the refreshed exact source/test ownership and resolve-once, PRNG, versioned-save, idempotent reward/trial, displayed-evidence/Receipt and focused-view boundaries before production writes. Implementer must port into production modules without runtime report imports and demonstrate representative actual roster/input effects, legacy-save honesty, corruption/exit/reload behavior, scoped motion cleanup, accessible playback and production browser evidence. Owner then reviews the integrated race; Plan23 remains in-progress until delivered and accepted. Existing report data does not prove production conformance or whole-run balance.

**Preserved boundaries:** Winner-crossing timing criterion remains; last crossing/full playback reported separately. Plan22 owns rest lifecycle, and no6Down pull exchange, new audio/art catalog, calendar/story work, push or deployment is authorized here. Shared contract documents are synchronized. Existing settled rules are not reopened by technical proposal review.

### DECISION-024 — Production race clarity, player podium emphasis and timeline

**Date:** 2026-10-27

**Owner direction:** In-progress production integration has not preserved the accepted preview. Restore correct runner orientation/Y-axis turns with upright independent labels, eased camera, highlight participants, playback motion and large left2/centre1/right3 podium composition. Remove the quoted developer-facing status/subtitle/playback guarantees and unselected POND COURSE label. Keep Opening Pond Trial left and Tutorial event right in its header. Present event stills and reduced-motion checkpoints together as a vertical timeline.

**New selected presentation:** For a player podium finish, mark its place '(you!)', provide a visible non-colour-only player accent and a large actual-result/Gem banner above the podium. No false player award for a rival podium. Owner removes the separate podium-motion pause button; the shared Pause/Resume must also control post-finish ambient loops while retaining the completed race state. This supersedes the earlier separate-button preference, not free motion pause or reduced/static stills.

**Limits:** Existing course geometry/model/tuning, actual results, reward amounts, save/log/Receipt honesty and immediate exit remain. Tutorial/finale are race events/fields; no additional course catalogue is selected. Plan23 stays in-progress; root technical/rendered review and final integrated owner acceptance are still required. No push/deployment.

### DECISION-025 — Production race presentation repair and normal playback controls

**Date:** 2026-10-27

**Owner direction:** The reviewed production delivery remains unaccepted. Initial racers must face right along travel, with duck-only Y turns and upright labels. Remove the successful-playback status subheader, including misleading `Race complete` at race start. Remove the normal-motion `Skip presentation` control; preserve free static/reduced-motion checkpoints and existing immediate exit. Continue follows settled playback. This supersedes prior approval of the visible normal-motion Skip button; internal presentation sampling is not a player control requirement.

Restore meaningful short event descriptions in the chronological timeline as they are reached, with no premature outcome disclosure. Combine current event commentary left and timecode right on one row, without `Recorded course time`. Dim the entire visible race environment, including background exposed by camera movement, using eased highlight onset/offset and eased podium dimming. Participant highlights have at least two seconds of presentation-time duration and eased edges. Pause/seek/replay/static paths must derive correct presentation without changing mechanical events, outcomes or rewards.

During playback, the two current leaders visibly use graceful bob, others paddle, and duck/wall contacts use the accepted paper-layer impact/recover animation before returning to their current role. A wrapper rotation or merely changing transform is insufficient evidence of those roles. Root supervises another bounded implementation repair and checks actual starting facing, visible role/layer motion, complete-scene lighting and timeline wording. No mechanics retuning, extra repair reviewer, packet closure, push or deployment is authorized.

### DECISION-026 — SVG authoring and reviewer routing

**Date:** 2026-10-27

Owner prefers Sonnet for future SVG drawing plans after the Plan10 redraw/staging session. Bounded Haiku drawing variants and separate reference research proved useful in that owner-directed session; future packets should explicitly budget these experiments and keep candidate ownership disjoint, with one final integration writer and coordinated browser turns. Sonnet scope expansions are indexed in the Plan10 session log and are not inferred as blanket future authority. Asset selection/production integration and packet closure remain separate.

Owner replaces prior Luna-high root reviews and Sol-low Codex implementation reviews with Terra-medium. Root independent reviews use gpt-6.1-terra at explicit medium; root judges when a Codex implementer may use one read-only post-implementation Terra-medium reviewer before delivery. No automatic pre-proposal/repeated repair budget or silent substitution. Preserve requested/observed settings, actual findings and dispositions, and historical reviewer records. AGENTS, both starting prompts and Codex reviewer configuration are updated. No game behavior or hard constraint changes.

### DECISION-027 — Close race/art investigations and assign extraction

**Date:** 2026-10-27

Owner accepts Plan23 production race and closes it; final focal-glow/sticky-timeline repair source9d03dcd and report712e474 retain176-test/build evidence and explicit smoke/live-storage limits. Owner also closes the expanded Sonnet Plan10 duck/apartment investigation with its recorded view/zoom/render limits. Closure does not imply every art variant is a final production selection.

Owner requests Plans24/25: Plan24 apartment-art extraction is assigned in-progress to the same Sonnet thread, with bounded Haiku extraction tasks and root interface/fidelity review; Plan25 desk/phone integration remains draft until24accepted. Root recommends Plan22 as disjoint parallel work but does not promote it without assignment. No publication/push, new race rules, rest implementation or whole-apartment runtime import is authorized by these closures.

### DECISION-028 — Separate living-room still daylight/weather investigation

**Date:** 2026-10-27

Owner approves the scoped recommendation in `reports/orchestration/apartment-daylight-weather-review-01.md`. Plan26 is assigned in-progress to the existing Sonnet art thread: unchanged-output scaffold, living-room still daylight, then owner-reviewed still weather. Existing window light stays. Living room only initially; default still, no idle or host-triggered lightning, rain animation, audio, kit hooks or production integration. Each later visual stage/browser turn is coordinated; animation/other rooms/promotion require separate decisions. Plan24 remains independently reviewable; Plan25 is not made dependent on weather. No deployment/push.

**DECISION-028 continuation, 2026-10-27:** Owner explicitly approves Plan26Stage3 five still-weather cells on the root-recommended basis: strong sun reference, overcast, rain, storm and storm+warm lamp. Retain restrained reference, no extra cells or prerequisite polish. Animated rain and lightning explicitly remain open future candidates; current scope does not implement or select animation, flash timing, host triggers or audio. Fresh coordinated browser turn follows source checks, then owner still-weather review. Kit/production remain read-only.

**DECISION-028 animation continuation, 2026-10-27:** Owner accepts still-weather visuals and root's seven animation recommendations. Approve report-only host-WAAPI controller logic and animated-rain prototype (StagesA/B) under Plan26's new animation subfolder, preserving approved stills/kit/production. Select ambient rain only for active selected scenes with free pause; live reduced motion stays still/no flash. Select later lightning direction: host-triggered one pulse, shared page-level four-second cooldown, refusal not queue; its visual stage remains separately gated. No audio/other rooms/kit hooks/promotion. Lifecycle, exact still restoration and measured evidence follow the root review/handoff; no safety/performance certification inferred.

### DECISION-029 — Race rest accepted; Down item named upgrade

**Date:** 2026-10-28

Owner accepts Plan22 except the confusing term trial for the Down speed item. Rename player-facing copy and Receipt wording to one-race speed upgrade (including with upgrade on candidate ratings), retaining3Down/+5%/one-race/nonstacking rules and internal saved/event/API names. Opening Pond Trial is a race event title, not this item, and is unchanged. Copy repair b3f2b3d and final progress a6f61b0 pass focused5tests/build; root independently confirms. Main implementation/evidence a59c043/390ce1d passed194tests/build, actual tired-duck story path and frozen-source8-journey smoke with explicit provenance; copy-only follow-up did not rerun smoke. Root closes Plan22 under owner's conditional acceptance. Art extraction/weather gates remain separate; no push/deploy.

### DECISION-030 — Extraction closure, desk integration assignment and audio expansion

**Date:** 2026-10-28

Owner explicitly closes24 and starts25 for Codex with one Terra-medium main-artifact pre-delivery review. Extracted art/scene lighting accepted; no production weather or all-room adoption implied. Owner likes existing searched audio/playback but requests a much larger recorded-effects catalog and multi-select role pools;18reopens for Sonnet-led bounded Haiku research and redesigned report audition. Do not juxtapose recorded candidates with disliked synthesized quacks in the main experience. Exact-license/local/Credits rules and separate production gate remain.

Owner accepts26animation visuals. Root verifies pending-visibility repair8889e7d/7c036f8 with45tests, accepting A/B prototype technically with existing evidence limits. Owner then questions whole-plan closure because later C/D/E stages were proposed;26remainsopen until that scope disposition is settled. Rain acceptance is not permission to build lightning visuals or promote effects.

### DECISION-031 — Engaged pacing revision and presentation follow-ups

**Date:** 2026-10-28

Owner accepts the direction of Plan25 apartment integration but requests phone-screen ambient glow (approximately3s ease-in/out cycle, nonzero baseline), compact accessible pause/play card-motion control to the right of Reveal All, and replacement of developer-facing starter narration. Plan25 remains open for bounded follow-up; exact source/lifecycle scope is root-gated, motion-off/reduced mode retains a static equivalent, physical companion remains non-emissive and still. No general visual-system selection follows.

Owner revises pacing expectation to at least roughly25minutes for an ordinary engaged run, with around15minutes for rapid low-reading play. Canonical design/AGENTS/orchestrator contracts updated together. These are targets, not measurements, classroom grading rules or mandatory waits; immediate Uninstall and no post-Receipt retention remain binding.

Owner requests richer consistent gacha presentation (existing Plan11), reflection-first Receipt with expandable lower-level evidence (draft Plan27), life choices in apartment settings/communications rather than gacha intrusion (draft Plan28), and believable financial stakes from accumulating small purchases rather than uniform currency scaling (draft Plan29). Drafts are not assignment or production authority. Preserve full append-only evidence and three-register honesty; presentation prioritization does not authorize deleting facts, inferred motives, changing economy constants or rewriting log/export schemas. No push/deployment.

### DECISION-032 — Bright weather study acceptance and new audio/art investigations

**Date:** 2026-10-28

Owner selects Plan26 bright report-gallery lightning: near-white scene peak40ms, scene fade300ms, window fade800ms; includes lamp washout and external lighting of still duck. Earlier restrained-only bounds superseded for that study only. Root verifies exception cleanup0f8ef5f; implementer73/73 bounded test evidence550dcb7. StageC accepted as investigation; bounded StageD live/lifecycle/performance evidence authorized via plan-26-stage-d-sonnet-handoff.md. Actual live speed, hidden/OS preferences, red analysis and representative devices remain evidence gaps; StageE runtime promotion separately gated.

Owner proposes TV as a visible apartment soundtrack source, track cycling and room-dependent acoustics, with apartment music ceasing when TV sold (draft Plan30); influencer equipment/apartment transformation and displaced possessions (draft Plan31); original recognizable gacha hooks/arrangements (draft Plan32), paired with research on recognizable emotional transformations and context crossfades (draft Plan33). These record investigation directions, not production adoption, music selection, automatic room creation, prices, or reopening the deferred streamer branch. Audio remains local/provenance-checked with player controls; expression of story mood is not evidence of actual player psychology. No assigned status or subagent/generation budget follows from drafts.

### DECISION-033 — Checkpoint pilot acceptance and expanded creative investigation

**Date:** 2026-10-30

Owner accepts Plan35 for closure following root/Terra artifact review and three
successful targeted pilots. Retain the three captured starts and optional,
orchestrator-supervised checkpoint/brief workflow with provenance, freshness,
isolated storage and bounded execution. This is not mandatory global workflow,
general checkpoint coverage, accessibility/device validation or a replacement for
appropriate full-start checks. Historical failed/uncertain evidence remains intact.

Owner authorizes broader story developments and new interaction proposals beyond
the existing roadmap, with an ordinary engaged-play target of at least roughly
30 minutes and no selected upper duration ceiling. This supersedes the prior
25-minute target. No enforced duration, delayed Uninstall or post-Receipt retention;
saves support longer experiences. Around15minutes remains a rapid low-reading
reference, not a minimum or guarantee for every expanded route. Design, agent guide
and orchestrator prompt updated together; actual pacing remains to be validated.

Four independent external reviews (Claude Opus/Sonnet and Gemini Argon/Flash) may
explore broader development and then Plan36 disorientation. The common handoff
permits at most four low-tier tasks per review, two concurrent, Haiku for Claude
and Flash for Gemini, no recursive fan-out. Repository access is read-only; output
must stay in each harness's external working directory for owner-mediated intake.
Ideas may challenge the roadmap but are not adopted mechanics or new production
authority. Immediate exit, truthful evidence and separation of fictional character
activity from actual player choices remain binding. No push or deployment.

**Later task authorization, same date:** Owner assigns Plan28 to Claude with Haiku
delegation at the lead's discretion, without a fixed call-count or concurrency cap.
The Plan36 external review handoff is amended likewise, retaining Haiku for Claude
and Flash for Gemini. These task-specific permissions supersede the fixed counts
above; lead integration, disjoint draft ownership, execution gates and production
boundaries remain. General provider-routing preferences are private orchestration
memory and are not recorded here.

### DECISION-034 — Apartment presentation and action-based fictional time

**Date:** 2026-10-30

Owner selects Plan28 Direction A (things in their places), styled HTML paper,
a physical companion that is still in each scene but may travel between scenes,
guidance that relaxes over the run, and Harbor Court Property Office as rent sender.
Root approves an A-only report prototype; B stays as documentary contrast. Exact
report execution remains gated, production integration is separate. The Opus lead
uses owner-selected Branch C/orchestrator-gate-only with no advisor call.

Owner explicitly approves action-based fictional time. It does not advance through
real elapsed reading, animation, accessibility or device time. Exact slot structure,
committed action costs, warnings and optional-lane consequences remain to be specified
in draft Plan37 and numerically calibrated with Plan29. Missed meals, skipped shifts,
possible dismissal and other candidate lanes are desired exploration, not automatic
selection of thresholds or new endings. No such rules are implemented by Plan28.
Actual player commitments, automatic character consequences and displayed evidence
remain distinguishable; no inferred motive is a Receipt fact. Immediate exit and
save/reload/idempotency constraints remain binding. No push or deployment.

### DECISION-035 — Staged interview pilot and melody-reference investigation

**Date:** 2026-10-30

Owner approves a first staged design-review pilot with Gemini Flash, using the
proposed replacement prompt and a coherent Plan37 topic. Default prompt rollout
remains separate from pilot acceptance. Preserve owner selections separately from
agent implications, and use a compact checkpoint before dependent propagation.

Owner supplies twelve Gemini-generated music references and reports enjoyable music
but weak chosen-C fidelity, with04-The_Penny_Prize_Dispenser-with-c.mp3 the only close
candidate. Exact interface is Gemini web app Create music; the WAV was attached to
each with-C request. Owner requests current, evidence-grounded reference/prompt
research before more generations, including eventual Suno trials. Reference intake
and root research are not new audio selection or production adoption. Original C and
rejected extension histories stay intact; no account/tool/model installation or
generation quota is authorized by the research direction alone.

### DECISION-036 — Kitchen opening, optional breakfast and remaining rent balance

**Date:** 2026-10-30

Owner rejects Plan38's integrated day sequencing as incoherent. Fresh setup begins in the kitchen; the phone invitation must lead to Quackpot rather than breakfast. Breakfast is an actual choice on each supported morning: an explicitly disclosed skip costs 5 HP (clamped to remaining health), spends no cash and progresses. Merely putting down an object remains free. This supersedes Plan28 D9's mandatory-breakfast first-integration restriction; it does not authorize wider missed-meal/shift rules. Persist and reflect actual skipped-meal effects without fabricating a paid expense.

The current $15 rent demand is the unpaid remainder after most rent was paid before the represented run. No prior transaction is invented in this run's log; Plan29 must use the framing when calibrating.

Plan38 is not accepted. Automatic wages/day jumps, night-shift execution coupled to automatic rent payment, absent Day2 gacha access and the external Go to work modality require a coherent sequence specification. Plan37 owns authoritative action/time/day rules; its current pilot remains the owner interview. Draft Plan40 owns conversation-first work/evening visual ideas. Call Mom is a preferred neutral activity candidate, not adoption of deferred borrowing. Tests of the mechanism slice do not establish an acceptable whole-game sequence. No push/deployment.

### DECISION-037 — First staged time-design checkpoint

**Date:** 2026-10-30

The owner-provided Plan37 pilot checkpoint and ledger record three selections: tiered gacha sessions, Morning/Afternoon/Evening phases plus optional Late Night, and neutral explicit warnings for commitments that directly sacrifice an obligation. Root records those selected directions and permits continued staged interview, preserving the owner's positive feedback on context/consequence presentation.

Do not infer that breakfast consumes an entire phase, that Late Night automatically penalizes health/next morning, or that a ten-pull is ten life commitments. Exact phase capacity, session boundaries/re-entry/reload and consequences need concrete traces and clarification before dependent decisions. The pilot's uppercase logging pair is conceptual, not a new event/schema adoption or a claim old replay attestations certify changed behavior. Source disposition and short continuation relay: reports/orchestration/plan-37-pilot-checkpoint-01-review.md.

The four Plan36 external reviews are received as creative inputs. No proposed cast, ending, day count, effect, setting, prototype or Receipt expansion is adopted by intake. Reviewer preferences against expressive return disturbances do not replace the owner's authorized exploration; immediate actual Uninstall/Leave and truthful evidence remain binding. Root comparison: reports/orchestration/plan-36-external-review-synthesis-01.md. No production authority or push/deployment follows from either design review.

### DECISION-038 — Phase anchor plus routine maintenance

**Date:** 2026-10-31

Owner selects pilot Scenario B / LEDGER-04: routine maintenance such as eating coexists with a phase's primary work/gacha/leisure anchor; eating does not consume the phase's anchor. Keep free inspection and clear explicit breakfast-skip disclosure.

Root records this decision while returning checkpoint02's example for correction. No $25 wage, $100 remaining rent, Day4 deadline, Day2 gacha unlock, new dinner costs, sleep recovery or Late Night penalty is adopted through the example. Those recommendations need provenance, consistent phase/cash/health traces and appropriate owner/calibration decisions. The pilot should continue in coherent batches without a root turn after every answer. Disposition and continuation relay: reports/orchestration/plan-37-pilot-checkpoint-02-review.md. No code, schema, prototype or deployment authority.

### DECISION-039 — Owner-approved packet inventory cleanup

**Date:** 2026-10-31

Owner accepts root's proposed cleanup batch from reports/orchestration/draft-packet-inventory-review-01.md. Plan27 is delivered, not completed; Plan32 and31 are deliberately parked with reopening conditions; Plan05 is parked as a distinct deferred investigation, not superseded by duck rest. Plan37 is in-progress only for the already authorized design pilot/report-only specification, without new prototype, numeric or production authority. No packet is marked superseded.

Root reviews and prepares Plans06/07 as ready, disjoint Codex report-only candidates: factual optional odds disclosure and export/analyzer field/workflow research. They are not assigned by readiness alone and do not authorize product/schema changes. Their eventual owner decisions and implementation remain gated. Plan39 remains active; foreign in-progress reports and music inputs are untouched. No push/deployment.

### DECISION-040 — Parallel Codex investigation assignment and delivery receipt

**Date:** 2026-10-31

Owner assigns QP Impl06 and QP Impl07 with Terra-class implementers and explicitly authorizes two-way communication/oversight through owner decisions or delivery. Root contacted both; each verified the original human authorization and sent a direct delivery milestone. Current model settings were left unchanged; root did not independently measure backend model identity.

Both investigations had already completed by first root contact. Plan06 report/progress commits are d6b895f/d3ec447; Plan07 proposal/progress commits are8d6fd45/d6dc637. Packets are delivered, not accepted/complete; work holds at that boundary pending artifact review and owner choices. No production implementation or field/content adoption is authorized by receipt. Plan06 local chat is01a1920b-1bae-7da0-9fff-5719cefa973d; Plan07 is01a1920c-9a04-7573-8f84-d62ac06d0449; both host local. No push/deployment.

### DECISION-041 — Extended oversight and selected odds/export directions

**Date:** 2026-10-31

Owner explicitly authorizes two-way communication with QP Impl06 and QP Impl07 through completion, including post-delivery report refinement, and approves root's recommendations. Plan06 direction is progressive/context-sensitive factual disclosure: no undefined pity-counter lesson in the free opening, no redundant explanations, later plain-language guarantee/progress information when relevant. Underlying rules still need selection/verification before promises; per-draw Receipt accuracy is unchanged.

Plan07 direction is genuine ZIP containing versioned JSON with direct local import (and optional bare-JSON compatibility), compact summary plus bounded meaningful timeline, random per-run ID stable across re-exports and replaced on a new run, default omission of student/duck names, free text/reflection, persistent installation identity, seed and exact timestamps. Compare submitted runs only; identity, all attempts and causation are not established. Initial analyzer remains in-memory/local; teacher CSV can follow separately. Numeric import budgets, library and exact contract/mapping remain later spike/implementation choices. Compression packaging is not deployment or additional data-collection authority.

Both report-only refinements returned and were reviewed by root: Plan06 4883ef9/7e04fbe; Plan07 0aad5dd/a5b9ac8. Investigations can close with their selected directions and explicit limits; UI/export/analyzer implementation stays in separate scopes. No premium advisor, browser or new executable experiment was needed for these document refinements. No push/deployment.

### DECISION-042 — Ren character and social-life investigation

**Date:** 2026-10-31

Owner selects development of Ren, the friend suggested in Plan36's Opus review, as a separate Plan41 investigation covering characterization, visual concepts, interaction options and consequences. Appearance direction is ambiguously gendered/androgynous, mixed Black/Latino heritage with flexible complexion, possible tattoo and earrings; research and report-local image-generation inspiration are authorized on assignment. No visual feature must prove identity and no final design is selected yet.

Social contact may restore fictional well-being HP. Frequent ignored/broken connections and some meaningful possession-sale contexts may endanger relationships. Exact gains, costs, classification, availability, relationship-state model and consequences remain owner-selected outputs, coordinated with Plans37/29/40. Do not infer student feelings, punish every refusal/sale, invent shared ownership, or make Ren an unlimited HP faucet. Preserve ordinary enjoyable reciprocal friendship and possible reconnection. No entire external-review arc, new ending or final game-asset adoption follows automatically. Plan41 is ready, not assigned; production remains separately gated.

### DECISION-043 — Later life-lane selections and next-stage boundaries

**Date:** 2026-10-31

Owner-supplied pilot ledger05–13 records Day1 evening unlock; exclusive evening anchors; breakfast/dinner and5HP skips; progressive three-miss scheduled-work loss; Day4 morning rent-shortfall trigger;0HP one-phase bedrest; provisional sub-critical degradation; proactive possession sale with social downside; restorative leisure with HP as fictional overall well-being; LateNight gacha morning fatigue without deleting the morning. Root preserves these choices while holding illustrative70HP thresholds, wage reductions, recovery values, concentration-friction implementations, event keys, new odd jobs and new terminal endings as unselected. Detailed ordering and once-only/resume rules remain a required Plan37 final artifact.

The pilot interview wrap-up is received; Plan37 remains in-progress pending its promised consolidated transition table and symbolic traces. Root's disposition/continuation relay is reports/orchestration/plan-37-pilot-checkpoint-03-review.md. Self-reported pilot observations and owner satisfaction support using the staged method, not a universal validation or default-prompt rollout.

Plan29 is prepared for bounded initial calibration in parallel with consolidation, with selected rules and explicit assumptions; no numeric policy is adopted. Draft Plan42 describes synthetic ZIP/usage-contract foundations that can precede final student experience, with exact dependency/mechanism clearance before executable artifact work and production integration separate. No assignment, package installation, source/schema mutation, student data access or deployment follows from preparing these next scopes.


### DECISION-044 — Music reference repertoire and parallel investigation assignments

**Date:** 2026-10-31

Owner favors Plan39 v3 M1–M6 as a varied reference repertoire for differing gacha situations; not every candidate needs a Suno cover. This selects a musical direction, not production assets or complete renderer validation. Preserve original C and the variations. Further technical work uses Flash or Codex Terra rather than another Argon turn. Root review and immediate bounded resource repairs are recorded in reports/orchestration/plan-39-v3-review-01.md; Plan39 is delivered pending remaining technical work.

Owner requests apartment music research for lofi hiphop, jazz, country,90s alternative guitar rock, Hawaiian/ukulele-oriented music and EDM: selected ordinary loops at least2minutes and eventual approximately30second gacha-motif-inflected counterparts. Plan43 is ready and unassigned, with short pilot listening before long-track expansion and no production/trigger adoption.

Owner assigns Plans29 and42 to Codex in parallel with disjoint report folders. Plan29 models selected life/time policies with explicit calibration assumptions; Plan42 proves a synthetic local ZIP/usage contract with exact dependency/mechanism clearance before executable artifact work. Neither assignment authorizes production changes, package installation in the game, student data, push or deployment.


### DECISION-045 — Conscious withholding of affordable rent

**Date:** 2026-10-31

Owner reports selecting LEDGER14 in the Plan37 pilot: on Day4 morning, a player with enough cash for the unpaid remaining rent balance may choose Pay Rent or Hold Cash/Do Not Pay. Withholding keeps cash in hand, marks rent overdue and immediately triggers landlord escalation. Record the choice factually; do not infer a gacha motive. Paying remains conscious, and a resulting zero cash balance is not nonpayment. LEDGER09 still requires immediate insufficient-funds escalation at the deadline, not only on notice inspection. Exact health/deadline ordering and escalation treatment of solvent withholding remain specification outputs, not production implementation.

Root's final-spec review is reports/orchestration/plan-37-final-spec-review-01.md. The fourteen owner choices are preserved; the consolidation still needs bounded provenance, lifecycle and trace corrections before acceptance/closure. Plan29 may continue with explicit assumptions; no numerical policy, event schema or production mutation is adopted.


### DECISION-046 — Life-design investigation closeout and working wage

**Date:** 2026-10-31

Owner selects $60 take-home per completed scheduled shift as the working wage baseline and accepts Plan29 investigation closure without settling every price. Other higher60 configuration values and the four-hour representation remain provisional until selected. Continue development against explicit working assumptions and rerun calibration when integrated opportunities, spending/recovery data or material rule changes justify it. No production price mutation is authorized by investigation closure alone.

Owner permits Plan37 closure at root judgment. Root accepts the policy/design investigation and fourteen owner selections with the qualifications in reports/orchestration/plan-37-closeout-and-integration-boundaries.md: temporary phone return is not session finish; bedrest cannot bypass due rent; remaining lifecycle defaults, calendar, effects and transaction schema are inputs to a bounded Plan38 amendment. This closes an interview/specification investigation, not a production-ready engine specification. No further design-agent handoff is required merely to close it.

Root reconciled stale open-question/source-map summaries and added a compact document-authority/current-direction view to docs/README.md plus an orchestration reconciliation reminder. The Bootstrap pilot intake remains a proposal; no local default design-review prompt/capability adoption follows.


### DECISION-047 — Progression integration assignment and parallel experience studies

**Date:** 2026-10-31

Owner assigns amended Plan38 to Codex and Plan40 to Gemini Flash, and reports Plan41 dispatched to Sonnet. Plan38 now explicitly covers selected life progression/transactions beyond its older presentation-only scope, with a root mechanism/config/compatibility checkpoint before source writes. Plan40 has cross-harness latitude for direct owner questions, treatment selection and report-local prototype iteration through coherent delivery, returning for material cross-packet/rule/ownership implications or final review. The three scopes remain distinct; no automatic production adoption of Plan40/41 proposals.

Owner renews two-way supervision of QP Impl42 and QP Impl27 through completion. Root review accepts Plan27 as the selected-layout investigation with explicit source-link/chronology qualifications; draftPlan44 scopes future production Receipt and remains unassigned. Plan42 final repairs pass independent source review and12 focused serial test files and are delivered for owner acceptance as a synthetic report-local spike, not a production exporter/analyzer. No push/deployment.


### DECISION-048 — Initial playable life budget and baseline session allowance

**Date:** 2026-10-31

Owner explicitly selects the Plan29 working budget for Plan38: $80 starting cash, $60 take-home completed scheduled shift, $6 per purchased meal and $170 remaining rent. This is a provisional playable baseline, not a final economy table. Owner also selects one pull action (single or ten-pull) plus one race within a phase's baseline gacha allowance; welcome ten-pull uses the pull-action allowance, browsing/re-entry remains free, additional play requires disclosed extension. No forced use of both activities.

Root corrects the mechanism's Morning-work proposal to the selected Afternoon schedule and clears scoped implementation through reports/orchestration/plan-38-mechanism-clearance-01.md. That note distinguishes owner choices from provisional recovery/leisure/fatigue/overtime defaults for review, legacy save/config provenance conditions and exact deadline/bedrest/terminal transaction boundaries. New source is authorized within amended packet; final technical and owner experience review remain.


### DECISION-049 — Work/commute study clarifications and apartment repair direction

**Date:** 2026-10-31

Owner agrees with Plan40 checkpoint recommendations and explicitly selects gigs available after losing scheduled employment, still consuming one Evening anchor, with five alternative vignettes per job rather than a five-part sequence. Stable daily offers, authored-tone/data provenance and later export adaptation remain boundaries in root continuation02; candidate gig economics are not silently adopted. Plan40 may continue catalog work with owner; no production gig system or analyzer schema is authorized by this checkpoint.

Owner requests coherent Plan38 apartment repair: breakfast and notice share one kitchen; notice visible before Day1 meal decision but inactive until resolved; brief same-room fade changes static duck focus; phone offers tonight's launch invitation/fictional preinstallation before work, unlocked app opens directly; no overlapping Work/Phone hotspots; companion physically supported; daytime rooms look daytime; sale opportunities withheld until gacha actually opens. Morning departure enters the one work block, with Day1 return initially focusing kitchen/dinner. Root maps this to the selected Afternoon work anchor without adding another phase charge, pending implementation compatibility checks. Later arrival interruptions such as Ren/Mom/life events are wanted future possibilities, not selected event probabilities or immediate production scope. Root repair03 and Plan40 continuation02 govern.

### DECISION-050 — In-world launch reply replaces preinstallation

**Date:** 2026-10-31

Owner rejects immersion-breaking fictional-install/download reassurance and selects a message announcing tonight's Quackpot launch and inviting a reply of LAUNCH for ten free ducks. Reply shows a response; Put it down remains available. Everyone still receives the existing welcome ten-pull at launch, including nonresponders. No immediate reward, phase cost, actual download or network communication. Receipt distinguishes actual invitation display, reply and acknowledgment display and may invite reflection on anticipation without asserting an effect. Historical install evidence is preserved as historical, never relabeled as a reply. Root authorizes bounded Plan38 repair05 under existing supervision, preserving shared progression and other plans' integrated systems. Implementation and owner acceptance remain pending.

### DECISION-051 — Plan38 owner acceptance and integration boundary

**Date:** 2026-10-31

Owner accepts Plan38 and requests closure after the launch-reply refinement. Preserve integrated production features contributed by other plans; report-only mocks must not become runtime dependencies or override real production choices. Provisional work/leisure presentation remains replaceable by separately accepted Plan40/41 experience. Existing central life progression, engine transactions, saved-history validation and separate UI routing remain integration contracts. Owner acceptance does not establish complete whole-run balance, device/accessibility or 30-minute pacing validation, and authorizes no push/deployment. Plan44 is root's recommended next Codex candidate, not assigned by this closure.

### DECISION-052 — Parallel Codex Receipt and apartment music assignments

**Date:** 2026-10-31

Owner assigns Plans44 and43 to separate Codex implementers. Plan44 integrates selected LayoutA after root projection/ownership mechanism clearance, with one Terra-medium pre-delivery review. Plan43 performs report-local style/instrument research and staged listening, with a pinned renderer/resource checkpoint before executable reuse/extensions or long renders, and one Terra-medium review for substantive rendering code. Source scopes are disjoint; shared browser/audio/build turns require coordination. Plan39 originals remain read-only; necessary renderer fixes may be made in Plan43's pinned attributed copy after clearance without claiming Plan39 closure. No production music, TV, social, export or deployment adoption follows from assignment.

### DECISION-053 — Plan39 in-place technical completion before Plan43 reuse

**Date:** 2026-10-31

Owner reopens Plan39 and assigns a new Codex implementer to finish the six reviewed renderer/export/provenance findings while preserving accepted M1–M6/C0 music. Root authorizes one Terra-medium pre-delivery review and scoped completion through delivery without repetitive proposal gates. This supersedes DECISION-052's optional Plan43 baseline-repair copy: Plan39 now owns in-place baseline repairs; Plan43 research can proceed independently, but executable reuse waits for a root-accepted pinned revision. No duplicate renderer repair writers, new musical expansion, production integration or push/deployment. Plan43 remains assigned in progress but owner reports it has not yet been dispatched.

### DECISION-054 — Ren owner-selected investigation direction

**Date:** 2026-10-31

Root reconciles Plan41's direct owner selections S1–S58: neighbor/tinkerer, they/them; selected character/visual direction and complexion A; Evening visits and bounded once-per-opportunity recovery; hidden qualitative relationship states, reduced initiative, communicated-cancellation/forced-bedrest exemptions and repair plus honored-visit recovery. Working direction is B2 breaks, U3 consecutive unanswered expiries, last6 opportunities and visits at most every other Evening. Sales are neutral without prior shared context; couch game-night reconfirmation and limited gift/TV flavor are selected. No hidden flag/status word or flag-change line on player Receipt. Remaining exact opportunity/window/gap semantics and visit HP require a future bounded mechanism proposal on accepted Plan38 progression, not ad-hoc controller logic. Final art adoption, later poses and production integration are separate. Root delivery review does not itself close Plan41 or authorize new packets/production writes. Unreviewed latest vest/dust/floor concepts may be accepted or deferred separately.

### DECISION-055 — Plan41 closure and separate Ren engineering packets

**Date:** 2026-10-31

Owner accepts Plan41 closure and requests two follow-on packets. Draft45 extracts existing selected SVG concepts/components and composition recipes into an unmounted fidelity-tested kit; Codex is recommended for this engineering work. It does not authorize new drawing simply because SVGs are involved. Missing or materially revised artwork gets a separate art brief, with Sonnet preferred for authoring. Draft46 proposes then integrates Ren social lifecycle into accepted phase/action/save/event architecture after exact owner/root mechanism clearance and accepted art mounting. Neither packet is assigned by drafting. Side/turned poses and unreviewed final variants retain their recorded gates; no full wardrobe shipping requirement, hidden relationship labels on Receipt, production music, push or deployment follows.

### DECISION-056 — Plan39 laboratory accepted and production presentation repairs

**Date:** 2026-10-31

Owner tried revised Plan39 playback/export successfully and asks about closure; root accepts and closes the bounded laboratory after prior technical/browser review. Original Argon lead reports raw TinySynth runtime/tables were never retrieved and workers reconstructed recipes from documentation summaries with a custom renderer. Root records this as owner-relayed author testimony, consistent with the mechanical comparison, not an independent external transcript audit or legal determination. Preserve reference/license notices and local source pin; no claim of upstream fidelity or whole-library integration. Plan43 may use the accepted local baseline f91dc4b and29698a0 evidence, with its exact extension/resource/long-render gates unchanged; production soundtrack not adopted.

Owner continues Plan40 issues directly with its implementer; root leaves their files untouched. Separately owner requests apartment cash duplication and phone artwork/target mismatch fixes. Root removes footer cash while preserving rent-specific status and top HUD, and derives artwork/target from one pure presentation context. Focused22checks and build pass; no time/economy/save/event change or new independent browser coverage. No push/deployment.

### DECISION-057 — Plan40 accepted investigation and integration boundary

**Date:** 2026-10-31

Owner accepts the simplified work/evening study and requests closure. Preserve atmospheric microfiction, single departure and one commute direction per work sequence, two observations on one work card, clear $60 payslip and kitchen/dinner return, with author IDs/tone hidden from student UI. Call Mom +5 remains recorded owner direction awaiting production adoption; quiet-duck +2 and gig cash/health figures remain proposals. Gigs after job loss and one exclusive Evening anchor with standalone alternative beats remain selected direction. Root recommends scheduled-work/ordinary-leisure integration first and a separate daily-gig lifecycle/calibration packet; neither is dispatched here. Report controller/tracker are demonstrations, not runtime dependencies or accepted export/causality contracts. See Plan40 owner closeout for reload, once-only effects, Ren coordination and evidence requirements. No push/deployment.

### DECISION-058 — Work/Ren parallel assignments and resolved object affordances

**Date:** 2026-11-01

Owner requests both follow-on packets:47 scheduled work/ordinary evening integration assigned Codex in-progress and48 daily gigs remains draft; existing45 Ren extraction also assigned Codex in-progress.45 owns new unmounted assets/report,47 owns root-cleared production work/life integration; no concurrent shared-engine writer. Both authorize one read-only Terra-medium pre-delivery review, with a root source/API checkpoint first. Owner favors noninteractive resolved one-time objects; root implements this for replied launch invitation and existing done targets, with a single immediate acknowledgment dismissal. Phone work/app functions reactivate when context changes. No new save/event/economy rule, packet implementation by assignment alone, push or deployment.

### DECISION-059 — Adopt bounded production integration review practice

**Date:** 2026-11-01

Owner adopts Astra's modularity recommendations and endorses root before/after visual inspection. Local practice is in docs/workflows/production-integration-review.md: compact selection/preservation record in the packet, exact seam/surfaces/compatibility, meaningful amendment notices, root-viewed changed and neighboring production evidence plus behavior/reload checks where screenshots cannot prove the claim, and serialized shared semantic ownership. Preserve existing healthy modules and focused previews; no rewrite, new framework or recurring retrospective review. Opus W1 is a one-time test of the recommendation, not a required helper run on each packet's commits. A small current-policy checkpoint pilot is the next tooling direction, still requiring its own bounded assignment; no broad smoke/catalog refactor or mandatory config registry is authorized here. Immutable historical semantics and concrete compatibility proof remain required. This is Quackpot-local guidance, not upstream Bootstrap capability adoption; no push/deployment.

### DECISION-060 — Diegetic work departure and first-shift tutorial exception

**Date:** 2026-11-01

Owner requests keys as the apartment work-departure affordance and removal of the redundant Continue without departing choice. After root identifies the Day1 launch lock, owner explicitly selects requiring the first tutorial shift; later work remains optional. Plan47 reopens for bounded production repair: supported keys placement, clear departure/completion-wage semantics, coherent Day1 progression and preservation of later disclosed conflicting-activity choices. Historical replay/legacy saves must retain their established semantics; no general economy or schedule rewrite is authorized. Selected direction awaits implementation and root/owner review. Plan45 retains its separate art scope and releases its finite browser slot before Plan47 testing. No push/deployment.

### DECISION-061 — Plan47 accepted presentation and evening/rent refinements

**Date:** 2026-11-01

Owner accepts revised work/commute presentation and reports dinner works. This is partial experience acceptance, not packet closure. Owner selects sitting with the physical duck to restore up to5HP, replacing the current10HP for newly versioned activity behavior; Call Mom remains up to5HP and both are exclusive Evening anchor alternatives. Preserve historical activity replay/config values rather than rewriting old outcomes. Owner cannot find Call Mom; Plan47 must verify the actual reachable evening and make the alternative discoverable before anchor commitment. Rent letter/decision should use ordinary due-date framing rather than Day4 and omit No cash has been taken. Relative due wording may derive from the existing deadline without changing it or introducing a real calendar. These repairs await implementation and review; no push/deployment.

### DECISION-062 — Rent paper countdown and gacha/life boundary repair direction

**Date:** 2026-11-01

Owner accepts Call Mom presentation and improved rent notice appearance. Printed notice must remain the original due-in-three-days wording: on Day2 hand-strike three and add2; Day3 strike2/add1; Day4 strike1/add TODAY!, retaining prior marks and printed days grammar. Current relative deadline belongs in the decision panel. Before deadline, an unaffordable notice offers only Put it down; existing due-time escalation remains authoritative. Plan47 owns bounded paper/copy repair, not new deadline/economy rules.

Owner observes Day1 post-CallMom app advertises a pull then rejects it. Root confirms openLifeApp permits browsing while phone_commit rejects an already-used anchor. Desired repair separates free browsing from warned further active play; exact atomic commitment/reload/extension seam requires a narrow proposal before semantic mutation. Owner requests Duck-Dex inside fictional app navigation rather than global HUD and removal of life-session advancement from fictional app controls. Root recommends compact hub Duck-Dex navigation and metagame-side phase advance; placement/commit details remain proposal work, not yet implemented/accepted. Keys art remains separately held for Sonnet. No push/deployment.

### DECISION-063 — Fixed Call Mom evenings and accepted Sonnet keys

**Date:** 2026-11-01

Owner selects Call Mom on evenings Days1,6,11,...; the reminder stays visible but inactive on other days, and a missed offer waits for the next scheduled day. Furniture-sale and difficult-workday triggers are deferred. Root clears narrow call-only begin_activity47 v3; new choices use cadence, existing v1/v2 histories/pending calls retain prior semantics, quietv2 remains5HP. Existing dinner/anchor/obligation/terminal guards apply; missed offers add no penalty. Root selects supported fridge sticky as first diegetic presentation for owner inspection, replacing redundant footer CallMom; no broad narrative scheduler.

Owner approves Sonnet keys visuals and reports production swap1c72d80/study80d7d50. Root verifies exact workKeysTray replacement plus target geometry33.5/70/12.5/9.5; no behavioral edits in that commit. Owner approval settles drawing; final interaction check must verify popover/focus and narrow label overlap without redrawing accepted art. Reported17/17 bounded art/decision checks are not a fullplaythrough. Plan47 remains inprogress for note/cadence and final integration review; no push/deployment.

### DECISION-064 — Fixed rent sentence annotations and complete action-map study

**Date:** 2026-11-01

Owner requests no target chip for the inactive breakfast fridge reminder, and reports a scheduled Day1 Evening note unavailable. Plan47 must reproduce eligibility with resolved dinner buy/skip and used anchor, preserving current selected guards unless evidence/owner changes them. The printed rent sentence remains fixed: strike printed three, but place accumulated handwritten2/1/TODAY additions after the period ending days., avoiding reflow inside the printed phrase. Owner accepts note placement, not inactive eligible behavior.

Owner requests a coherent plan for non-navigation apartment actions instead of ad hoc footer buttons. Root drafts49 as a report-local action/room/prop study after47, including sleep, continued phone play, existing bedroom/recovery art and elimination of redundant non-actions; no dispatch, production mutation or time-rule change follows from drafting. Operational global controls and room navigation remain separate. No push/deployment.

### DECISION-065 — Direct cross-harness visual/UI calibration pilot

**Date:** 2026-11-01

Owner assigns Plan50 to a new Codex Terra implementer. Direct local authenticated Haiku and Gemini Flash calls are authorized within this report-only pilot, both reviewing artwork AND game presentation/UI, with cold reviewer inputs separated from held-back historical ownerfeedback. PriorClaude chats may curate exactversions/feedback into designated inboxes; their self-review is not a blindreview. Root clears initialcase/method/transport design before historicalpaidbatch. Evaluate usefulobservations, hints, falsealarms, misses andeffort, not owneragreement alone; historicalnewrequirements/preferences are controls. Ownerreviewofinitialvisualresults gates any audiostage or broaderstandingadoption. No productionwrites, previouspacketacceptancechanges, modelsubstitution, API/accountsetup or newbilling; existingTerrareview/ownerexperiencegates unchanged. Machine-specificCLIevidence is not media/sandbox/effective-effort proof. No push/deployment.

### DECISION-066 — Ren extraction and work/evening acceptance; experimental helper continuation

**Date:** 2026-11-01

Owner accepts and closes Plans45 and47 after selected hand/couch promotion, unchanged wide floor composition and final integrated work/evening/fridge revisions. Plan45 assets remain unmounted; social integration is separate. Plan47 preserves periodic Call Mom Days1,6,11 and +5HP, accepted keys, fixed printed rent notice and red handwritten countdown; later gigs and remaining diegetic action design remain separate. Root reviewed scoped source and rendered evidence; historical evidence limitations are retained.

Owner accepts Plan50 visual/UI evidence for experimental supplementary use, not automatic readiness or standing adoption. Two simple Haiku SVG additions in resumed conversations succeeded after a root-cleared persistence-context repair; no complex drawing capability is established. Flash's three-tone control asked relative pitch direction, not Hertz identification, and did not validate audio delivery/comprehension. Owner authorizes a further naturalistic condition: one licensed music selection and two licensed effects, neutrally renamed temporary copies, held-back reference metadata and questions limited to audible characteristics. Root reviews exact inputs/prompts before the bounded calls; do not overwrite the failed control or infer artist/license/source from sound. No new API/billing, production integration, push or deployment.

### DECISION-067 — Codex-led contextual creative helpers; Receipt/ZIP technical closure

**Date:** 2026-11-01

Owner requests revised Codex-led Plans46/49 before starting, with direct Sonnet writing/experience/larger-art support and Haiku small drawing support. Codex keeps integration, deterministic rules, tests and source iteration. Batch coherent Ren writing and apartment ideation with enough selected context, reuse task-specific conversations for revisions/consultation, and use fresh contexts for independent critics. Helpers cannot select new rules or approve themselves; rendered image inspection and owner gates remain. Plan43 gains Flash musical impressions/arrangement consultancy after actual audio generation, with contextual reuse honestly recorded and claims checked against source/listening. Apply later Plan50 lessons through root review without silently expanding budgets, capabilities or acceptance. This is task-scoped experimental authority, not Bootstrap or universal reviewer adoption.

Owner authorizes closure of Plans42/44 if technically sound. Root rechecks previous repaired findings and current source/evidence with a read-only Terra-medium audit: no known blocker found. Plan42 closes only the synthetic report-local ZIP contract/diagnostic, not production export/analyzer or arbitrary-archive safety certification. Plan44 closes the repaired production Receipt slice, retaining attributed test/browser/print limits and future event/export mapping work. No fresh broad test/browser run or push/deployment is implied.

### DECISION-068 — Parallel Codex dispatch and early musical listening

**Date:** 2026-11-01

Owner dispatches Plans46/49/43 in parallel from Codex with the task-scoped Sonnet/Haiku/Flash roles in their revised packets. Material owner choices may be settled in the respective implementer chats, recorded and relayed at milestones; root retains cross-packet technical/ownership and production review. Plan46 owns approved social source seams, Plan49 only action-map reports, Plan43 only music-study reports. Concurrent proposals do not authorize concurrent overlapping runtime writes.

Plan43 brings its first roughly20–40second pilots and first Flash impressions to an early owner listening checkpoint before catalog/long-track expansion; consultant failure must not prevent owner hearing playable output. Owner provides existing localhost:5173 for viewing/testing; reuse without server/config changes or owner-storage writes. Independent isolated viewing may coexist, while shared native control, heavy renders/tests/builds and Git index writes are coordinated. Root routes useful capability hypotheses visibly to Plan50; a suggested experiment is not automatic inference/budget authority. No push/deployment.

### DECISION-069 — Genuine TinySynth reference comparison before long compositions

**Date:** 2026-11-01

Owner amends assigned, not-yet-dispatched Plan43: compare genuine pinned upstream TinySynth definitions played with its actual compatible implementation against unchanged accepted Plan39 custom renderer/recipes before longer compositions. Preserve Plan39 as control; no reopening, replacement or claim it already integrates the library. A mere table swap into the different local engine is not the upstream reference. Root clears bounded dependency/adapter/license/resource feasibility, then small same-score keyboard/mallet, bass and guitar/strum auditions with optional short ensemble compare sound and maintainability/export tradeoffs. Owner selects foundation or justified exceptions after early listening; Flash impressions are experimental inputs, not selection. No whole-bank bakeoff, automatic migration, runtime CDN, new production dependency or push/deployment.

Owner explicitly authorizes bidirectional root supervision of QP Impl46 and QP Impl49 through completion, preserving owner checkpoints in those chats. Selected social choices and proposed implementation interfaces remain separate; root coordinates shared resources and semantic writes.
