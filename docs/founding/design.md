# Quackpot — Design Document

**Status:** founding design, revised 2026-10-23 after owner triage. Working title. Numeric values are provisional unless explicitly treated as rules; see [Tuning](#tuning).

## What it is

A browser gacha game about collecting rubber ducks, wrapped in a satirical life metagame. The player has a job, rent, and food to pay for, and the game keeps finding reasons to spend fictional money. At the end, the game confesses: a Receipt shows what it displayed, what the player did, and asks whether it affected them.

**Audience and use:** high school Video Game Design students. The game is a learning experience followed by discussion. Owner pacing revision (2026-10-30): an ordinary engaged run should support at least roughly 30 minutes, including reading, choices and Receipt reflection; around 15 minutes describes a rapid, low-reading route. These are design targets awaiting validation, not enforced timers or a restriction on immediate Uninstall. Run-to-run variation rewards replaying the game to examine it from a game-design perspective. A run may extend past a lesson; saves let it resume.

**Design thesis:** *The game manipulates you, then shows you exactly how.* The Receipt is the point.

## Hard constraints

These are owner decisions, not tuning choices. Changes below are dated.

1. **No real money.** No payment links, and no real currency conversion beyond fictional prices shown.
2. **No network calls from the game.** No network requests or telemetry calls; no accounts. Run state and the local Receipt event record stay in the browser. This remains absolute at runtime; runtime CDN loading is not allowed.
3. **Student-initiated file submission only.** The game provides a Receipt export function that assembles run-usage data into a file for the student to download. The student may manually submit that file to an assignment store, such as Google Classroom. The game does not transmit it automatically. A teacher analysis view imports files locally and does not upload or sync them.
   - **Owner decision, 2026-10-23:** This is the narrow exception to the former rule that no student data could be submitted or stored outside the player's browser. No automatic external collection or transmission is permitted.
4. **The game ends at a designed ending and is allowed to run long.** Owner revision (2026-10-30): target at least roughly 30 minutes for an ordinary engaged run; roughly 15 minutes is a rapid, low-reading route. Do not enforce duration through filler waits or delayed exit. High-drama scenes and important choices may extend total time; a run may continue past a lesson (via saves) and beyond 15 in-game days. The game uses no retention techniques after the player reaches their Receipt; offering a fresh run is allowed.
   - **Owner decision, 2026-10-23:** Revise the former five-minute/15-day limit. "Allowed to run long" is the intended reading, not "designed to retain play." Floor set at roughly 15 minutes during GATE-53B review. Exact day count remains open.
5. **Uninstall is always visible and is the best ending.** The player can leave immediately from its retention offer; choosing to leave reaches the ending and Receipt.
6. **No real companies, games, people, or brands in the fiction.** Publisher, products, sponsors, and streamers are fictional. Owner-selected satirical names are retained. Owner-approved exception (2026-10-25): factual creator/source identities and license notices are permitted in Credits and asset-provenance records; this does not place real entities in the game's fiction.
7. **Static site, with a local build step.** Published output is static HTML, CSS, JavaScript, and local assets served from GitHub Pages.
   - **Owner decision, 2026-10-23:** Permit Vite for development and build. Build output remains static. This does not permit runtime CDN loading or network calls.

**Owner scope expansion, 2026-10-30:** Broader story developments and interaction types may be proposed beyond the existing roadmap, supporting at least roughly 30 minutes of ordinary engaged play without a selected upper duration ceiling. This is creative investigation authority, not automatic adoption of new mechanics or a requirement that students stay. Around 15 minutes remains a rapid low-reading reference, not a promised duration for every expanded route. Immediate Uninstall, local saving and no post-Receipt retention remain binding. Later pacing proposals must distinguish content, player reading/choice time and optional branches from enforced waits.

## The five-minute experience

This heading preserves the draft's section anchor, which the founding reviews cite; it is not a five-minute cap. The sequence is a pacing sketch; the current target is at least roughly 30 minutes for ordinary engaged play, with a rapid route around 15 minutes.

1. **Opening.** Meet the player's existing rubber duck, name and style it, receive a free ten-pull, and win. A $0.99 starter offer follows the first win.
2. **Pond Race.** Before the race, the player makes one choice about which duck to race or another narrowly scoped race option. Owner request for orchestration ideas on how fatigue could obscure choices — for example, scrambling letters in the options, making option positions hard to track, swapping click targets, or distracting with other animations during the choice. These examples are requests for proposals, not adopted mechanics.
3. **The hook.** Pulls can earn faster ducks, and races can pay gems. A later banner introduces stronger ducks. Simulation must check that no choice is automatically correct.
4. **The squeeze.** Gems can run short. Fictional wages and expenses create pressure; bundles are offers.
5. **The life.** Rent and food create pressure. Banner labels use explicit game-time units and a real decision window, not a linearly compressed countdown.
6. **The end.** Economy and events lead to an ending, or the player chooses Uninstall. Every ending reaches the Receipt.

## Core loop

| Piece | Behavior |
|---|---|
| **Gems** | Fictional premium currency, earned through the economy and spent on pulls. Income/costs are simulation inputs. |
| **Pull** | Single and ten-pulls. Draft prices of 160 and 1,600 gems remain provisional. |
| **Rarity** | Draft common/rare/legendary distribution remains provisional and must be simulated. |
| **Pity** | Eligible repeated pulls may raise legendary probability. Thresholds and banner carry/reset remain open. Receipt reports actual pre-draw conditional odds. |
| **Banner** | Featured ducks rotate through themes. Labels use explicit game-time units and a real decision window; duration remains open. |
| **Duck stats** | Power creep may make later ducks faster. Rate/effects remain simulation inputs. |
| **Pond Race** | Race resolves from duck stats after one pre-race choice. No timing taps. Owner selects Plan13's combined rank-weighted weaving + seeded15–20° contact model with a2s slow-motion highlight (DECISION-018), amended to actual individual crossing order, one-second post-crossing coast and a podium direction (DECISION-022). Roughly20s is the winner-crossing pacing target; at most5% of winner crossings should occur later than23s, a distribution criterion rather than a hard per-race cutoff (DECISION-019/022). Remaining finishes, highlight, coast and podium playback are measured separately. Production stat mapping/lifecycle integration remain gated. |
| **Duplicates and Down** | Duplicates convert to Down. Owner refinement 2026-10-25: the exchange should be usable enough to try but deliberately lossy; it must not become a profitable/self-funding pull loop. Plan 17's bounded evidence is owner-accepted (DECISION-013): trial contract is 3 Down for +5% base speed on one race, non-stacking/consume once on commit, or 6 Down for an immediate active-banner pull with normal duplicate payouts and pity advancement/Legendary reset. Production lifecycle, actual log/Receipt behavior and whole-run balance remain separate integration checks. |
| **Collection and Duck-Dex** | Finite gacha duck identities are separate from cosmetic looks (see [Assets](#assets)). A standing Duck-Dex shelf shows owned identities and silhouettes of missing ones; themed-set effects remain proposals and must not be implied as implemented bonuses. The metagame's physical companion is outside this digital roster. |

**Owner collection/rest refinements, 2026-10-26 (Duck-Dex accepted 2026-10-27; rest accepted 2026-10-28):** Duck-Dex is voluntarily accessible. Each first-owned identity revealed by a pull may enter a sequential presentation: about 2 seconds scrolling/focusing its shelf position, followed by 2–3 seconds changing its silhouette to full-color art, optionally changing its card background. Fast-pull skips this presentation; static/reduced-motion and explicit skip remain free, and any paid Fast Pull proposal stays separately gated. Ownership commits before presentation; never fabricate a second acquisition on replay/reload or reveal a hidden result early. Show factual duck value (rarity, base/effective race speed, availability) and set progress/selected effects without inventing unimplemented bonuses or implying monetary resale value. Exact set definitions/effects and UI remain bounded proposals. Plan21's bounded six-duck collection/discovery implementation is owner-accepted (DECISION-021); broader catalog scaling and player-copy refinements are separate follow-ups. Plan22 rest is implemented and owner-accepted (2026-10-28); penalties apply to base race rating before the accepted mapping. The player-facing Down item is called a one-race speed upgrade; saved trial identifiers remain compatibility keys.

An owned digital duck has a soft two-race rest rule: entering it again with zero intervening races applies a 50% speed penalty; after one intervening race, a 25% penalty; after two or more, no rest penalty. A never-raced duck is rested. Tired ducks remain selectable, including with a small roster; no forced purchase or paid recovery is selected. Entry selection foregrounds actual effective speed/availability, demoting fatigued candidates with a clear reason. Exact commit/cancel/reload, duplicate identity policy, interaction with trial/stance and whole-run balance require the integration proposal and verification. This is duck rest, separate from the metagame character's sleep and unselected choice-obscuring fatigue proposals.

## Manipulation catalog

**Accepted race reference, 2026-10-26:** Plan13 closes with `weave-rank-strong-contact` at `70ba115`/`c2b9241` and the2s highlight selected. Preserve the existing bounded recenter controller, seeded12–16° weave acquisition/0.5s attained hold/recovery, front/rear3s/6s due opportunities with skips during recovery, seeded15–20° contact targets, one duck-contact episode cap and no added collision speed penalty. Its historical same-time follower classification is superseded by DECISION-022 below. Presentation pause/skip/replay/static modes use the same committed mechanics; reduced-motion slideshow/event stills omit zoom, animated lighting and slow-time effects. The detailed report model is a reference for a bounded production port, not a runtime dependency. Long recovery/skips, grid advantage, label overlap and fixed-step terminal ordering limits remain disclosed; broader changes require a new decision. Production commentary is simpler than the investigation table, with honest event-linked accessible details.

**Individual race finishes (DECISION-022, 2026-10-27):** Owner selects actual crossing order for every entrant, replacing classification of followers at the winner's crossing. Lower placements and Gem recipients may change. Keep the roughly20s/median17–23s/at-most5%>23s criterion on the winner's crossing; measure last crossing and full playback separately. Each duck eases to rest within about1s after its own crossing; the approximately1s ease-out podium entrance begins at the last genuine crossing, overlapping the final coast. Ease the scene lighting down during the reveal while keeping podium text and the upper finish area readable; complete playback only when all racers have stopped and the podium has settled. Braking/podium are presentation, never forced crossings or reward writes. Exact continuation, finished-entrant interactions, tie/watchdog/non-finish policy and lifecycle require a bounded proposal before mutation; production integration stays gated. Reduced motion uses static equivalent results. Historical same-instant rank evidence is not validation of revised lower places.

**Production race target (DECISION-023, 2026-10-27):** Owner accepts the latest Plan23 preview and authorizes production integration under orchestrator supervision. Adopt the tested shared affine conversion8.25+0.5×rating input, R2combined rear acceleration/recentering/turn assistance, controlled leader slowdown, risk-only Sprint mean1.00 with±20% spread (Safe±5%), current course/controller/caps and actual individual crossing order. Preserve accepted large podium, matching whole-environment drama lighting and first-place graceful-bob/second-third paddle loops with pause/static lifecycle. First-winner timing remains the criterion; tail/full playback separate. Root reviews exact production file ownership, resolve-once/versioned-save/reward/Receipt boundaries before source writes; final owner review is of the integrated production race. This historical adoption authorized the port; owner subsequently accepted Plan23 production integration on2026-10-27. Plan22 rest was accepted2026-10-28. Preserve recorded evidence limits; no new assets/audio, push or deployment.

A technique is named on the Receipt only if its cue fired. Copy separates what the game displayed, what the player did, and a question about impact; it does not claim an unobservable motive or effect.

| Technique | In Quackpot | What the Receipt can report |
|---|---|---|
| **Currency obfuscation** | Gems instead of dollars; bundle sizes may leave a balance too small for a pull | Bundle, price, gems received, pull cost, remaining gems |
| **Fear of missing out** | Banner decision windows and “last chance” messages use explicit game-time labels | Message shown, label, and whether a purchase occurred during the window |
| **Sunk cost via pity** | A visible pity counter can emphasize distance to a threshold | Pull count, counter shown, actual conditional odds; no claim the player was “chasing” |
| **Near misses** | Gold-to-rare, crack-and-fizzle/fake-out upgrade, and 50/50 off-banner Decoy Duck remain candidates pending testing; none is selected as a shipped form | Cue that fired, result, applicable odds |
| **Power creep** | New ducks may outrun older ducks | Duck identities, stats used, race placements |
| **Loss aversion** | Streak reward may be offered on in-game days | Cue, reward, player action; an in-game day is not a real visit |
| **Anchoring** | One-time starter offer may show a comparison value | Displayed offer, price, action; no claim it changed later judgment |
| **Odds navigation** | Plan06 selects progressive contextual detail; integration remains separate. Receipt retains actual conditional pre-draw odds; no unexplained pity terminology is required in the promotional tutorial. | Odds shown, button availability/use, actual pre-draw odds |
| **Exit friction (confirmshaming)** | Uninstall opens a retention offer of 80 gems and "play out the trap" | Offer shown, gems offered, action taken (left or stayed) and what followed |
| **Completion pressure** | Duck-Dex silhouettes and set bonuses emphasize what is missing | Set progress shown, set bonuses displayed, pulls made while a set was incomplete |
| **Social comparison** | A rival whale in lane 1 flaunts the newest banner duck | Rival shown, its duck and placement, the player's placement and any following purchase |
| **Secondary-currency obfuscation** | Duplicates become Down, spent in a usable but lossy exchange (owner refinement 2026-10-25) | Down earned, Down spent, items bought, their value relative to pulls |
| **Pressure on an owned possession** | A late pawn offer for the player's own duck | Offer shown, amount, accept or decline, and what the cash or gems bought |

Each Receipt lists only techniques whose cues fired in that run, so different runs produce different Receipts. That is intended: students compare lists in discussion, and the shared catalog keeps the comparison anchored.

Retain the owner-selected names for fictional entities: “Biblically Accurate Duck,” “ShadyQuackGems.ru,” “dark-web,” “sign away your duck’s soul,” and “Degenerate Streamer.” The streamer branch itself is deferred under D1.

## Time policy

**Current accepted direction,2026-11-02:** The owner selects Morning (breakfast), Midday (scheduled work), Early Evening (dinner), Evening (leisure or early bedtime) and Late Evening (optional active play or normal sleep). Meals occupy their slots, replacing the earlier maintenance-plus-anchor model. One activity occupies one slot; inspection, navigation and browsing remain free. The detailed current contract, staged guidance, transaction boundaries and unresolved calibration gates are in [five-slot-life-schedule.md](../five-slot-life-schedule.md). Plan51 is closed as a bounded unmounted shared-scheduler study, not final balance or complete crisis design. Plan52 has mounted the five-slot development scheduler and save transition; checkpoint regeneration, broad lifecycle review and owner acceptance remain in progress. Owner explicitly waives old game-save compatibility/migration; accurate new-policy replay and non-destructive identification of unsupported development data remain required. See DECISION-072.

The dated three-phase and maintenance-meal selections below are historical provenance where superseded by this current contract; they are not a second current specification.

**Historical owner selection, 2026-10-30 (slot details superseded above):** Fictional life scheduling will use action-based
time. Exact slots, committed action costs, warnings and optional meal/work lanes
remain specification inputs for Plan37 with Plan29 numerical calibration. Reading,
device speed and accessibility/presentation duration do not consume life slots.
This was the direction before the five-slot revision. The historical live-window candidates do not authorize real-time missed-life penalties; shop expiry details remain open.

**First design-pilot checkpoint, 2026-10-30:** The owner selects tiered gacha sessions (initial bounded active play, then an explicit trade-off before consuming another life phase), three primary named phases Morning/Afternoon/Evening with optional Late Night, and neutral explicit warnings when a commitment directly sacrifices an obligation. This selects the framework, not the capacity of a phase, number/unit of pulls or races, meal/work coexistence, session re-entry accounting or any automatic Late Night penalty. Those implications remain Plan37 inputs for concrete day traces and owner clarification. Costs and terms stay visible even when routine actions avoid an extra confirmation dialog. See reports/orchestration/plan-37-pilot-checkpoint-01-review.md.

The clock is hybrid:

- The shop has a live decision window using explicit game-time labels; its length is open.
- Race timing is distribution-based: nominal target roughly20s, with at most5% finishing strictly later than23s (owner refinement2026-10-26, DECISION-019). This replaces a universal23s/±15% upper bound; individual long races are allowed. Report sample/configuration, late fraction, quantiles and uncertainty rather than claim a population guarantee from a small seed set. Simulation ends at a genuine crossing, never a forced23s result. A separate computation watchdog must report unresolved honestly. Show full playback wall time including the2s highlight separately from simulated finish time. Production calibration and run-level pacing remain bounded integration decisions.
- Reveal theater, duck scenes, and other high-drama moments pause the running clock.
- The overall time budget includes duck setup and the Receipt. High-drama scenes and important choices may extend total time, including past the lesson.
- Ordinary engaged play targets at least roughly 30 minutes; a rapid low-reading route may take around 15 minutes. Day count is not fixed, and a run may exceed 15 in-game days.
- Simulation and classroom hardware observation should measure the experience without rushing consequential scenes.

**Historical phase-capacity refinement (owner pilot, 2026-10-31; superseded by slot-consuming meals):** Each named phase supports routine maintenance alongside one primary anchor activity. Eating does not consume or freeze out that anchor. This does not select additional daily meals or their costs, new wages/rent/deadlines, sleep recovery or Late Night penalties. The checkpoint's Day1–Day3 example is a proposal awaiting coherent traces, not an adopted tutorial schedule; see reports/orchestration/plan-37-pilot-checkpoint-02-review.md.

**Subsequent owner pilot selections, 2026-10-31:** The ledger selects Day1 evening gacha introduction, exclusive evening leisure/gacha/extra-work anchors, breakfast and dinner maintenance with5HP explicit skips, progressive three-miss scheduled-work warnings/termination, Day4 morning insufficient-rent escalation, and one-phase bedrest at0HP. Restorative leisure supports HP as overall fictional well-being; LateNight gacha causes morning HP fatigue without removing the morning phase. Proactive possession sales are allowed with a social downside to develop in Plan41. Exact recovery, sub-critical degradation thresholds/behaviors, work/rent/bedrest ordering, interruption and unlock exceptions remain specification/calibration inputs; no new fired ending or odd-jobs system is selected. These later selections supersede the earlier unselected status of dinner/deadline/LateNight direction above, not its still-unselected numeric examples. See reports/orchestration/plan-37-pilot-checkpoint-03-review.md. These rules are not yet implemented merely because the interview is complete.

**Apartment action study accepted,2026-11-01 (Plan49; meal/phase details superseded by the five-slot contract):** Ordinary Evening access to the bedroom and bed Turn in/Not now are selected, with separate guarded recovery. Staying up follows an actual activity rather than a standalone phase-advance action; phone browsing/re-entry/cancellation remain free. Quackpot is the core work-competing activity. From Day2, an available time-advancing activity may cause missed dinner after a prior warning, with no meal charge and up to5HP loss; Day1 retains guided meal handling. These are accepted study intentions, not current production rules. A separate versioned mechanism must cover availability, failed transactions, 0HP, rent/recovery, actual shift-miss ordering, Ren conflicts and historical saves. Keep current Finish run as a placeholder until diegetic ending interactions replace it; immediate Uninstall remains unchanged. See DECISION-071 and reports/development/plan-49-diegetic-apartment-action-map/integration-brief.md.

**Owner rent-agency selection,2026-10-31 (LEDGER14):** At Day4 morning, an unpaid but affordable remaining rent balance permits Pay Rent or Hold Cash/Do Not Pay. Withholding preserves cash, marks overdue and immediately triggers landlord escalation; record the choice without inferred motive. Insufficient funds still trigger escalation at the deadline independently of opening a notice. Paying and reaching exactly zero cash remains valid. Exact health/deadline ordering and treatment of solvent withholding require the corrected Plan37 specification; no production adoption follows from the interview. See DECISION-045 and reports/orchestration/plan-37-final-spec-review-01.md.

**Tutorial work exception (owner, 2026-11-01):** The first Day1 tutorial shift is required before the evening launch; later scheduled work remains optional. Represent departure through supported keys in the apartment rather than a below-scene work button. Remove the redundant Day1 Continue without departing route; later conflicting activities retain disclosed work consequences. This selected direction is awaiting Plan47 repair, not a claim that the current production route already enforces it. Preserve historical save/replay semantics. See DECISION-060.

**Evening recovery refinement (owner, 2026-11-01):** Sit with the physical duck and Call Mom each restore up to5HP, capped at maximum health, as alternative exclusive Evening anchors. The new sit-with-duck value awaits versioned Plan47 repair; existing historical10HP outcomes retain their replay semantics. Owner accepts revised work/commute presentation and dinner, but Plan47 remains open for keys/tutorial departure, discoverable leisure alternatives and ordinary relative rent-deadline wording. See DECISION-061.

**Rent artifact refinement (owner, 2026-11-01):** The paper notice retains its original due-in-three-days printed text. The character strikes printed three and accumulates handwritten countdown corrections AFTER the period ending the original days. sentence: add2 on Day2, strike2/add1 on Day3, strike1/add TODAY! on Day4. Do not insert added digits inside or reflow the printed three days. phrase. Current relative deadline stays in the decision UI. An unaffordable pre-deadline notice offers only dismissal; actual deadline/escalation rules do not change. This treatment awaits Plan47 repair; see DECISION-062.

**Family reminder cadence (owner, 2026-11-01):** Call Mom is offered on evenings Days1,6,11,..., subject to normal meal/obligation and exclusive-anchor availability. A missed offer waits until the next scheduled day; no missed-offer penalty. A persistent apartment note remains visible but inactive between offers. Furniture-sale and difficult-workday reminders are deferred. Versioned Plan47 integration preserves historical calls and existing +5HP recovery; note placement awaits owner visual review. See DECISION-063.

## Saving

Two modes, chosen by the player:

- **Autosave**, selectable on the start menu.
- **Explicit save**, through a save icon available at many junctures during play.

Current saves use localStorage with an in-memory fallback when persistence is unavailable; a future IndexedDB migration is not selected. Saves are local to the browser and include run state and the Receipt event record, so a resumed run produces an accurate Receipt. Saving makes no network request. Starting a fresh run after a Receipt uses a new seed. School lab computers may clear or share browser storage; resume behavior there is an open question for the first packets.

## Life metagame

**Owner experience refinement,2026-10-31:** Plan38 kitchen continuity, direct phone opening, physical support/daylight and Morning departure/Day1 dinner return repairs are selected in DECISION-049. The owner subsequently replaces preinstallation with an in-world launch message: reply LAUNCH, see an acknowledgment, or put the phone down (DECISION-050; `reports/orchestration/plan-38-launch-reply-repair-05.md`). Replying is free and grants nothing immediately; everyone retains the welcome ten-pull at launch. Actual invitation, reply and acknowledgment are separate Receipt evidence, with no inferred psychological effect. Owner accepts Plan38 production integration including this refinement on2026-10-31; old installation records remain historical evidence. Provisional work/leisure presentation must not override later accepted Plan40/41 choices, and report-only mocks remain outside runtime. Breakfast/notice are targets in one room, not separate rooms. After-work Ren/Mom/life interruptions remain future story possibilities. Plan40 gigs stay available after scheduled-job termination, consume one exclusive Evening anchor, and use alternative vignettes, not a five-step grind. This is selected direction for later integration; the current Plan38 test build does not yet implement a gig catalog.


**Resolved apartment choices,2026-11-01:** Completed one-time object choices remain visible but stop inviting interaction. Give the immediate acknowledgment one dismissal; do not reopen a redundant decision panel. A reused object becomes interactive again only when it has a new available purpose, such as work messages or actual gacha entry after the launch reply.

**Work/evening study acceptance,2026-10-31:** Owner closes Plan40 with the streamlined atmospheric microfiction treatment: one departure, one commute direction per shift, two work observations together, clear $60 take-home payslip and kitchen/dinner return. Call Mom restores +5HP as selected direction awaiting production adoption; quiet-duck +2 and gig payouts/fatigue remain candidates. Hidden authored tone/IDs are catalog metadata, never measured player mood. Production integration must reuse the accepted phase authority with saved presentation progress and once-only wage/recovery/display evidence. Daily-gig lifecycle and calibration remain separate. See DECISION-057 and reports/orchestration/plan-40-owner-closeout-and-follow-on.md.

**Music laboratory acceptance,2026-10-31:** Owner accepts revised Plan39 audition/export and root closes the report-local laboratory. M1–M6/C0 remain reference material. Original lead reports worker-reconstructed recipes and a custom renderer inspired by TinySynth documentation, not copied upstream program tables or the bundled library. The mechanical comparison is evidence of differences, not historical derivation or sound equivalence. Plan43 may pin the reviewed local baseline; longer-track changes, soundtrack selection and production adoption retain their separate gates. See DECISION-056 and Plan39 author-provenance-clarification.md.

**Ren selected investigation direction,2026-10-31:** Plan41 ledger S1–S58 records the owner's neighbor/tinkerer character, they/them, soft-flat art direction and complexion A. First-wave visits use one Evening leisure anchor with once-per-opportunity HP on completion; exact restore remains unselected. Internal connected/drifting/strained/reconnecting states affect Ren's initiative but are never shown as player or Receipt labels. Working direction: two broken commitments or three consecutive expired-unanswered invitations within the last six opportunities; visits at most every other Evening. Ordinary refusals, communicated cancellation and forced bedrest are exempt. Repair plus one honored visit restores the relationship. Reading consumes no phase and expiry is game-phase based, never wall time. Sales are socially neutral absent established shared context; the selected couch/game-night case needs reconfirmation, while gift/TV reactions remain factual without automatic flag penalties. Exact opportunity, streak/window, cancellation, recovery and gap ordering requires a new bounded mechanism proposal using the accepted phase resolver. Production art extraction and social integration remain separate gates; no new system is implemented by the study. See reports/orchestration/plan-41-investigation-delivery-review-01.md.
**Current life-design baseline (owner/root closeout,2026-10-31):** Plans37 and29 close as design/calibration investigations, not production integration. The owner selects **$60 take-home per completed scheduled shift** as the working wage baseline. Owner subsequently selects the higher60 example as the provisional playable budget: $80 start, $6 per purchased meal and $170 remaining rent. These working values remain tunable, not a final price table; represent shift duration explicitly when chosen. Owner selects one pull action (single or ten-pull) plus one race per baseline phase session, with free browsing/re-entry and disclosed extensions (DECISION-048). Keep small gacha prices unchanged until evidence warrants adjustment. Selected time/life policies are summarized above; `reports/orchestration/plan-37-closeout-and-integration-boundaries.md` qualifies the consolidated specification. Temporary phone return is free and distinct from Finish Session. Bedrest never erases or bypasses a due rent obligation. Exact phase/transaction ordering, health effects, calendar, credit and session allowances remain the next bounded integration proposal's inputs. Plan38 is amended and its root mechanism clearance now authorizes scoped progression implementation, with legacy/config/obligation conditions and final review still required.


**Ren development (owner, 2026-10-31):** Develop Ren as the character's friend in [Plan41](../development/plan-41-ren-friend-character-and-social-life-study.md), using the Plan36 Opus proposal as a starting point rather than adopting its whole arc. Visual direction is androgynous/ambiguously gendered presentation and a mixed Black/Latino background, with complexion, tattoo and earrings explored through owner-reviewed reference/concept studies. Details remain flexible. Social contact with friends/family may support HP as fictional overall well-being; repeatedly neglecting connections and some concretely relevant possession sales may affect relationships. Exact recovery, relationship rules, availability, visuals and story consequences require selection before integration. Report-local research/generated inspiration is authorized on assignment; final game art remains SVG source. Ren is not an automatic moral judge or an unlimited HP dispenser.

Wages, food, rent, and increasingly costly options create the life metagame. Values and timing are simulation questions.

**Owner production refinements, 2026-10-30:** Start the fresh-run setup in the kitchen; the phone invitation must actually lead to Quackpot. Breakfast may be skipped explicitly for 5 HP (no cash spent, actual loss clamped to remaining health); merely inspecting or putting down an object costs nothing. Record the skipped meal and its actual effect without inventing a payment. The current $15 rent demand represents the unpaid remainder after most rent was paid before the represented run, not the full rent. Exact work/evening/session sequencing remains Plan37 specification work: an extra-shift acceptance must not stand in for unrepresented work, wage receipt and automatic rent payment. The short production mechanism slice is not the accepted full daily schedule. Calling Mom is owner-selected ordinary evening leisure (Plan40; +5HP direction awaiting production adoption), distinct from the deferred borrowing ladder.

A bill shortfall offers escalation choices rather than ending immediately, subject to the selected Day4 deadline and conscious withholding rules. Exactly zero cash after a valid payment is not unpaid rent or a terminal state; any optional budgeting prompt must reflect that distinction. Exact escalation ordering remains an integration input. Every terminal route displays the Receipt.

| Step | Option | Consequence |
|---|---|---|
| 1 | Reduce meal spending | The selected breakfast/dinner skip costs5HP; no separate lunch action is selected. Additional emergency-budget presentation remains a proposal |
| 2 | Extra shift | Wages and sleep change; do not claim race reflexes change when the race has no timing input. Fatigue-obscuring choices remain an orchestration request. |
| 3 | Sell couch, then TV | One-time cash; apartment visibly empties |
| 4 | Credit card | Instant money; show interest when charged and on the statement. Rate/timing remain open. |
| 5 | Payday loan | Deferred with ladder steps 5–7 |
| 6 | Borrow from Mom | Deferred, including voicemails |
| 7 | Start streaming channel | Deferred, including streamer chat and sponsorship |

The tone is absurd but real: each included step heightens a recognizable pressure without mocking a real person.

## Duck companion

The story opens with the metagame character's own physical rubber duck. Setup names it and chooses its look using less-extreme parts in the shared visual language. The duck is silent: the camera holds or moves, and the player's replies carry the inner narrative.

**Owner clarification, 2026-10-24:** The character owns one physical rubber duck and becomes interested in the fictional gacha video game because of that attachment. Keep that physical object static. The gacha game's digital ducks are a separate collectible roster and may have expressive or impressive movement, to be investigated after the base SVG is settled. Pawning the physical companion changes the metagame object and cash/story outcome; it does not remove a digital gacha collectible.

Static does not mean one fixed camera view. The owner wants to explore cinematic views of the same physical object for conversation beats: three-quarter angles, apparent side-eye, profile, rear view, high/low angles and framing that suggest posture or personality without autonomous eye, face or body animation. The owner favors a 2D-first study: lighting changes and different backgrounds/compositions within the apartment can carry emotional beats, as if the character has repositioned the physical duck during the conversation. Inspect wide, medium and close framing and multiple zoom levels. A coherent authored set of 2D SVG views is the initial approach. A 3D source model producing 2D views remains a future investigation candidate if a witnessed limitation justifies it; SVG itself is 2D, and no 3D runtime or source-model pipeline is selected. Keep this physical-prop cinematography investigation separate from digital gacha motion.

Use about three to five event-triggered scenes with neutral fallback lines. Scenes are skippable and do not consume running-clock time. A late pawn offer appears during the run; accepting it leads to an empty-desk scene; the choice is meaningful but not required to finish.

Uninstall stays available. After it is chosen, a retention modal offers 80 gems and the option to “play out the trap.” The player can still leave immediately; leaving ends the run and displays the Receipt. Record what the modal displayed and which action the player took, without claiming why.

## Event deck

**Future narrative reference:** [Plan 36](../development/plan-36-late-game-disorientation-investigation.md)
and its [external-review synthesis](../../reports/orchestration/plan-36-external-review-synthesis-01.md)
preserve late-game disorientation, cognitive spillover and humorous unreliable-narration
possibilities. Owner direction favors small, irregular expectation disruptions
that can grow more frequent without a fixed pattern, with accessible text/static
and reduced-motion alternatives. These are deferred candidates, not integrated
mechanics; actual exit and Receipt honesty remain binding.

A seeded deck gives runs distinct moments while allowing reproduction. Each adopted event needs a trigger and eligibility rule, a one-time flag where appropriate, a bounded effect, a Receipt category if it uses a named technique (or “neutral delight” otherwise), and a neutral fallback when none is eligible.

No event discovery is required to pay expenses, finish, or reach the Receipt. The owner selected five variety ingredients. Four are event-deck content:

- rotating banner themes;
- weekly life curveballs with bounded effects;
- rare secret or glitch ducks with unchanged stats; and
- a rival whale in lane 1.

The fifth, the Duck-Dex shelf with set bonuses, is a standing system described under [Core loop](#core-loop).

Variety is meant to reward replay: a student who plays again should meet different beats and a different Receipt list, and can examine the game from a design perspective.

Content, rates, bonuses, and economy effects remain simulation inputs. Cues and actions are recorded without asserting unobserved impact.

## Immersion

Quackpot uses one fixed diegetic stage. Offers appear as objects or messages in that world. The apartment empties as items are sold. The Receipt arrives as a printed slip. Presentation may favor atmosphere over explanatory text while conveying core gameplay information and choices.

Reduced-motion presentation preserves information, choices, and outcomes while reducing motion and spectacle. Photo-finish presentation, screen effects, and musical layering remain in the design; the owner will test them on a teacher computer considered similar to student desktops in the target lab.

**Owner interview direction, 2026-10-25 (Plan 12):** The live gacha experience teaches controls/currencies through play and presents fictional commercial pressure. Do not ship the review wireframe's neutral mathematical helper boxes or manipulation analysis inside the active gacha UI; decomposition and critical reflection belong on the Receipt/debrief. Keep necessary prices, balances, relevant odds, purchase terms, operational warnings and accessible equivalents available. This does not remove in-story metagame dialogue. Accessibility options and instant reveal/skip remain; sensory excitement is not a reason to defeat reduced motion or obscure exit.

**Owner selection, 2026-10-25 (Plan 14):** Use Shell A's full-width top canopy with quiet Save/Settings and persistent Uninstall. One activation automatically plays the fictional-phone turn then stage expansion; reverse return fades/collapses the phone border and rotates back to the apartment portrait view. Settings stays visible above chrome and supports close/Escape/backdrop dismissal with focus return. Reduced-motion/static equivalents remain. Exact timings/geometry are tunable; remove prototype explanatory scaffolding in production. See DECISION-012 and the selected production handoff; the selection itself did not implement the app; Plan19 subsequently integrated the accepted shell/transition lifecycle and is owner-closed.

The phone invitation should transition through an in-world quarter-turn into landscape and expand into the stage. Responsive framing/static equivalents remain required; this is not a request to rotate a laptop or force browser fullscreen. Gems/Down are introduced contextually; duplicate conversion gets a dissolve/feather presentation with an equivalent static announcement. Shop staging starts with the starter offer and grows later; the historical1750-gem example is an arithmetic review reference, not authority for a live bundle; use the actual selected shop terms and Plan17 whole-wallet evidence. Ribbons/countdowns and subdued dismissal are commercial-pressure candidates, not selected expiry/clock rules. Plan 14/15/17 proposals gate implementation; see DECISION-008 and the owner-integration report.

## Endings

| Ending | How you get it |
|---|---|
| **Completed the Collection** | Every identity in the finite digital gacha roster is owned |
| **Influencer** | Deferred with the streaming branch; draft threshold 40,000 followers, deep in debt |
| **Running on Empty** | First rent unpaid after available choices, or loan default; inability and deliberate withholding/refusal have separate evidence. Later unpaid rent uses a housing-loss/eviction reason on the shared terminal/Receipt flow. |
| **Run complete** | Designed final day/event; duration and day count remain open |
| **Uninstall** | Always-visible control opens the retention offer; choosing to leave immediately is a terminal route and the best ending |

All terminal routes reach the Receipt. Early Uninstall does not force the player to continue for extra scenes.

**Selected Plan52 working contract,2026-11-02; production port not yet accepted:** Rent170 Day4/400 Day14, exact-shortfall voluntary loan plus one-time50% fee, due entering Midday five calendar days later before work/wage; full early repayment, one active loan, later eligibility after repayment. Freeze accepted terms/history; no rollover, compounding or automatic payment. Recovery first with persistent due latch; simultaneous due bills display combined affordability and let player choose payment order. Allow free apartment navigation/inspection and actual owned couch30/TV40 sales with seating disclosure while due decisions remain pending; block discretionary work/gacha/time progression but retain immediate Uninstall. When rent alone is due and an eligible future Evening extra shift is explicitly reserved, allow meals, recovery, scheduled work and minimal progression needed to reach it; a due loan overrides that exception. Sale adds cash, never pays bills automatically. Present applicable options and explicit leave-unpaid/refusal consequences before ending; insufficient cash or opening a bill alone is not terminal. Preserve debt, distinguish actual reasons and use shared ending/Receipt plumbing. A loan-funded later rent payment avoids eviction for now. Working health values remain +25 bedrest, −10 late fatigue, overtime+$60/−15 with earned wage retained at0HP, and +5 early bed as an Evening alternative. These remain tunable; see five-slot-life-schedule.md and DECISION-075.

## The Receipt

### Receipt event record

Build the Receipt from a local append-only run record, not inferred from final state. Record:

- cues and offers actually displayed, with game-time labels;
- player choices and actions;
- costs, rewards, expenses, debts, interest, sales, skips, and outcomes;
- pre-draw odds conditional on pity state;
- event eligibility, cue shown, and result; and
- terminal route and Receipt presentation.

Separate each finding into three registers:

1. **We displayed:** the cue, offer, odds, or statement shown.
2. **You did:** the recorded action and result.
3. **Did this affect you?** An optional discussion question, not an asserted answer.

The record stays in the browser during play. A student may download a run-usage file and manually submit it to an assignment store. The game itself makes no network request and performs no automatic upload. Every ending, including early Uninstall and Running on Empty, displays the Receipt.

## Assets

Game art assets begin as SVG source in the repository: characters, environments, gameplay elements, and animation where appropriate. Ordinary text uses HTML/CSS, not SVG, unless a text effect is impractical in CSS and JavaScript.

**Owner authorization, 2026-10-24:** Generated raster concept studies may be created under `reports/` to compare duck visual directions before authoring the production SVG. These are review references, do not ship in the game, and do not replace the SVG-source requirement. The owner selects one or more directions before the base SVG is revised. Animation comparisons follow that base approval in a separate packet; no particular motion is selected yet.

Each asset may be served as SVG or rendered to PNG where a measured test shows PNG is a better fit for that asset. The generated-raster banner/background plan is removed.

**Layered duck rig.** One base duck in SVG, recolored by palette swap, with hat and accessory layers. Draft starting set: about 8 palettes, 8 hats, and 6 accessories — roughly 20 small parts yielding hundreds of looks. Rarity can be signaled by layer (crowns, capes, glow). The rig produces cosmetic looks; the finite roster of collectible identities is defined separately (see [Core loop](#core-loop)). The player's own duck reuses the less extreme parts.

**Owner-approved audio sources, 2026-10-25:** Sound effects may use jsfxr/ZzFX-style parameters stored as text and synthesized at runtime, or selected locally bundled Creative Commons-licensed recordings (including CC0 public-domain dedications). Music may be JavaScript-generated, model-generated local audio, or selected locally bundled Creative Commons recordings. Verify each asset's exact license/version and compatibility with redistribution and any modifications; prefer CC0/CC BY for straightforward reuse. Other CC terms require a documented compatibility check, not an assumption that attribution alone satisfies them. Retain source, creator, required notices/license text, modification record and local asset mapping. A local Credits page is linked from the opening screen and settings; factual creator attribution belongs there and in provenance records, outside fictional game entities. No remote audio/CDN loading, automatic third-party requests or telemetry are permitted. Specific recordings and production integration still require owner selection; generated-music provenance remains open. See DECISION-010 and Plan 18.

## Technology

- The published experience is a static GitHub Pages site.
- Game art assets begin as SVG source; each may ship as SVG or measured-fit PNG. Owner-authorized raster concept references remain in reports and do not ship.
- Development/build may use Vite; output is static HTML, CSS, JavaScript, and assets. Runtime CDN libraries are not allowed.
- State and the Receipt event record stay in browser storage. Gameplay makes no network calls.
- One small seedable PRNG module makes runs and the event deck reproducible.
- A teacher-local dashboard imports multiple student usage files and analyzes them in the browser. It does not transmit or synchronize them. Model the export/import flow roughly on BrowserBattlegorithms (owner authorized inspecting that repository). Bootstrap may be considered later for this teacher-only mode; it is neither a student-game dependency nor a selected implementation.

## Tuning

**Owner calibration investigation, 2026-10-26:** Speed may be an abstract rating; UI need not claim metres/second. Plan23 may compare global rating-to-world conversion and shared track geometry/scale to preserve meaningful tier/trial/rest differences without nonlinear compression or per-identity tuning. Aim for a median simulated crossing in17–23s and at most5% later than23s; a substantial fast tail is acceptable. Keep actual crossings and report highlight wall time separately. Candidate global constants require recommendation/approval before production changes; renaming units alone does not fix a clamped modifier.

The first guesses are not trusted values. The first headless simulation packet will test:

- pity reachability under candidate thresholds and gem income in runs that may exceed 15 days;
- race rewards creating a self-funding pull loop versus premature starvation;
- roster size, duplicate rate and the owner-refined usable-but-lossy Down exchange (Plan 17's 3/6 trial evidence accepted; production lifecycle, larger rosters and whole-run interactions still require validation);
- Receipt accuracy on early exit, zero cash, ineligible events, and near a banner ending;
- near-miss candidate eligibility and the firing rule; and
- effects of Duck-Dex bonuses and bounded weekly curveballs.

Use the no-per-variant-balancing bound. Later accepted decisions govern selected numerical values; remaining tuning must validate the current pacing direction: at least roughly 30 minutes for ordinary engaged play and around 15 minutes for a rapid low-reading route. Historical simulation timing is not proof of the revised target.

### Starting values for simulation

**Historical seed table:** These were initial simulation inputs, not the current selected production economy. The owner now selects the $60 completed-shift take-home baseline; other life prices remain provisional pending the next integration. Preserve this table for experiment provenance, not as a replacement for the current life-design baseline above.

The founding draft's first guesses, kept as the simulation's starting point. None is a decided value.

| Variable | Draft starting value |
|---|---|
| Pull cost | 160 gems single; 1,600 for a ten-pull |
| Rarity | Common 80% · Rare 18% · Legendary 2% |
| Pity | Soft pity from pull 35; legendary guaranteed by pull 50 |
| Banner length | About 3 in-game days |
| Power creep | Each new banner's ducks about 15% faster |
| Gem bundles | 60, 330, 1,090, 2,240, 3,880, 8,080 gems — odd sizes against a 160-gem pull, so leftovers remain |
| Starter anchor | One-time starter pack shown at "400% value" ($0.99 offer per O11) |
| Influencer threshold | 40,000 followers (deferred ending) |
| Day length | Draft: about 20 real seconds per in-game day (superseded as a cap by the time policy) |

## Scope

**v1 is a mechanism prototype.** It tests the core loop and Receipt honesty, not a fully classroom-ready five-minute experience. It should exercise a meaningful trade-off, an ending route including Uninstall, and the core manipulation/Receipt path. Day count, technique breadth, and duration remain open to simulation and orchestration.

**Later scope:** ladder steps 5–7, Mom's voicemails, streamer chat/branch, final event-deck values, and presentation detail not needed to test the prototype. Revisit the deferred ladder after a v1 playtest shows whether steps 1–4 create the intended squeeze.

## Classroom use

Students can play without an introductory lecture, then discuss the Receipt. Choosing Uninstall right away is a legitimate ending worth trying. The intended engaged experience now targets at least roughly 30 minutes, with around 15 minutes for rapid low-reading play; classroom participation expectations remain the teacher's instruction, not a game timer. The game itself never penalizes Uninstall.

Suggested prompts:

- When did you first spend money? What were you feeling right before?
- Which technique on your Receipt surprised you most?
- What did the game show you before you chose?
- Did any cue affect your choice? How do you know?
- Who benefits when luck is something you can buy?
- Is this game different from games you play outside class? How?
- Compare Receipts: which techniques appeared on yours but not a classmate's, and why?

Students who replay can examine the game's variety from a game-design perspective.

A student may download a run-usage file and manually submit it to a class assignment store. A teacher can import multiple files into a local analysis dashboard. This workflow does not require cloud storage, automatic transmission, or a teacher account in the game. Keep student files outside tracked repository content.

## Open questions

- What is the final title?
- What in-game schedule supports at least roughly 30 minutes of engaged play, around 15 minutes for rapid play, and longer resumed runs?
- How should the implemented localStorage save path behave on shared or cleared lab computers? No IndexedDB migration is selected.
- How should the selected per-run offline export and teacher analyzer be integrated? Distinct run IDs do not establish student identity or all attempts; seed/name/free-text export is not selected by default (Plan07/42).
- What pity thresholds and banner carry/reset rule should simulation recommend?
- What roster size, duplicate rate, Down shop, set bonuses, and event effects work without variant-specific balancing?
- Which near-miss forms should testing retain, and what firing rule/rate is accurate?
- What fatigue-obscuring choices should orchestration propose, and does the reduced-motion presentation exempt them?
- How should Plan06's selected contextual odds disclosure be integrated without adding tutorial vocabulary or review-only analysis?
- Which production log projections should fill the selected ZIP/usage summary and bounded timeline contract after Plan42 acceptance? Omit names/duck free text/reflections/seeds/exact timestamps by default; no installation identity or automatic upload.
- Which implementation should the local teacher analyzer use? Bootstrap is allowed but not selected.
- What provenance note is appropriate for model-generated music?
- Which assets show a measured benefit from PNG delivery?

**Owner delivery acceptance, 2026-10-27:** Plan23 integrated race (including focal glow and monotonic timeline disclosure) and Plan10 expanded Sonnet physical-duck/apartment investigation are owner-accepted and closed. This supersedes the earlier pending-delivery stage statements; recorded smoke, storage-inspection, zoom and visual coverage limits remain evidence limits, not erased claims. Plan24 extracts approved art into reusable modules/gallery; Plan25 later integrates a selected desk/phone scene. That was the stage at this historical acceptance; Plan22 rest was subsequently implemented and owner-accepted on2026-10-28. Plans24/25 subsequently extracted/integrated selected apartment art. No new mechanics, broad asset selection, push or deployment is implied by closure.
