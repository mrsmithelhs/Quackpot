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
