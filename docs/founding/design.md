# Quackpot — Design Document

**Status:** founding design, revised 2026-10-23 after owner triage. Working title. Numeric values are provisional unless explicitly treated as rules; see [Tuning](#tuning).

## What it is

A browser gacha game about collecting rubber ducks, wrapped in a satirical life metagame. The player has a job, rent, and food to pay for, and the game keeps finding reasons to spend fictional money. At the end, the game confesses: a Receipt shows what it displayed, what the player did, and asks whether it affected them.

**Audience and use:** high school Video Game Design students. The game is a learning experience followed by discussion. Total session length and in-game day count are open questions; a run may extend past a lesson. High-drama scenes and consequential choices may take the time they need.

**Design thesis:** *The game manipulates you, then shows you exactly how.* The Receipt is the point.

## Hard constraints

These are owner decisions, not tuning choices. Changes below are dated.

1. **No real money.** No payment links, and no real currency conversion beyond fictional prices shown.
2. **No network calls from the game.** No network requests or telemetry calls; no accounts. Run state and the local Receipt event record stay in the browser. This remains absolute at runtime; runtime CDN loading is not allowed.
3. **Student-initiated file submission only.** The game provides a Receipt export function that assembles run-usage data into a file for the student to download. The student may manually submit that file to an assignment store, such as Google Classroom. The game does not transmit it automatically. A teacher analysis view imports files locally and does not upload or sync them.
   - **Owner decision, 2026-10-23:** This is the narrow exception to the former rule that no student data could be submitted or stored outside the player's browser. No automatic external collection or transmission is permitted.
4. **The game ends at a designed ending, but is not capped to the lesson or 15 in-game days.** High-drama scenes and important choices may extend total time, and a run may exceed 15 in-game days. No session-duration or day-count value is set.
   - **Owner decision, 2026-10-23:** Revise the former five-minute/15-day limit to permit a run past the lesson and beyond 15 in-game days. Exact duration remains open.
5. **Uninstall is always visible and is the best ending.** The player can leave immediately from its retention offer; choosing to leave reaches the ending and Receipt.
6. **No real companies, games, people, or brands.** Publisher, products, sponsors, and streamers are fictional. Owner-selected satirical names are retained.
7. **Static site, with a local build step.** Published output is static HTML, CSS, JavaScript, and local assets served from GitHub Pages.
   - **Owner decision, 2026-10-23:** Permit Vite for development and build. Build output remains static. This does not permit runtime CDN loading or network calls.

## The five-minute experience

This heading preserves the draft's section anchor; it is not a five-minute cap. The sequence is a pacing sketch and the full duration remains open.

1. **Opening.** Meet the player's existing rubber duck, name and style it, receive a free ten-pull, and win. A $0.99 starter offer follows the first win.
2. **Pond Race.** Before the race, the player makes one choice about which duck to race or another narrowly scoped race option. Orchestration should propose accessible ways fatigue could obscure a choice; examples are not adopted mechanics.
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
| **Pond Race** | Fixed-duration race resolves from duck stats after one pre-race choice. No timing taps. Race duration remains open. |
| **Duplicates and Down** | Duplicates convert to Down. Its shop is intentionally near-useless and poor value; it must not become a profitable pull loop. |
| **Collection** | Finite duck identities are separate from cosmetic looks. What counts as complete and whether the player's own duck counts remain open. Duck-Dex sets have bonuses; effects are simulation inputs. |

## Manipulation catalog

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
| **Odds navigation** | Optional button may reveal extra odds detail. Receipt odds remain visible; further information awaits orchestration recommendation. | Odds shown, button availability/use, actual pre-draw odds |

Retain the owner-selected names for fictional entities: “Biblically Accurate Duck,” “ShadyQuackGems.ru,” “dark-web,” “sign away your duck’s soul,” and “Degenerate Streamer.” The streamer branch itself is deferred under D1.

## Time policy

The clock is hybrid:

- The shop has a live decision window using explicit game-time labels; its length is open.
- Each race has a fixed duration; its value is open.
- Reveal theater, duck scenes, and other high-drama moments pause the running clock.
- The overall time budget includes duck setup and the Receipt. High-drama scenes and important choices may extend total time, including past the lesson.
- No session duration or day count is fixed. A run may exceed 15 in-game days.
- Simulation and classroom hardware observation should measure the experience without rushing consequential scenes.

## Life metagame

Wages, food, rent, and increasingly costly options create the life metagame. Values and timing are simulation questions.

When cash reaches zero or a bill cannot be paid, offer an escalation choice rather than ending immediately. Define the trigger and ordering for “Running on Empty.” Every terminal route displays the Receipt.

| Step | Option | Consequence |
|---|---|---|
| 1 | Skip lunch | Health changes; amount remains an input |
| 2 | Extra shift | Wages and sleep change; do not claim race reflexes change when the race has no timing input. Fatigue-obscuring choices remain an orchestration request. |
| 3 | Sell couch, then TV | One-time cash; apartment visibly empties |
| 4 | Credit card | Instant money; show interest when charged and on the statement. Rate/timing remain open. |
| 5 | Payday loan | Deferred with ladder steps 5–7 |
| 6 | Borrow from Mom | Deferred, including voicemails |
| 7 | Start streaming channel | Deferred, including streamer chat and sponsorship |

The tone is absurd but real: each included step heightens a recognizable pressure without mocking a real person.

## Duck companion

The story opens with the player's own duck. Setup names it and chooses its look from the less-extreme collection assets. The duck is silent: the camera holds or moves, and the player's replies carry the inner narrative.

Use about three to five event-triggered scenes with neutral fallback lines. Scenes are skippable and do not consume running-clock time. A late pawn offer appears during the run; accepting it leads to an empty-desk scene; the choice is meaningful but not required to finish.

Uninstall stays available. After it is chosen, a retention modal offers 80 gems and the option to “play out the trap.” The player can still leave immediately; leaving ends the run and displays the Receipt. Record what the modal displayed and which action the player took, without claiming why.

## Event deck

A seeded deck gives runs distinct moments while allowing reproduction. Each adopted event needs a trigger and eligibility rule, a one-time flag where appropriate, a bounded effect, a Receipt category if it uses a named technique (or “neutral delight” otherwise), and a neutral fallback when none is eligible.

No event discovery is required to pay expenses, finish, or reach the Receipt. The deck includes these owner-selected variety ingredients:

- rotating banner themes;
- weekly life curveballs with bounded effects;
- rare secret or glitch ducks with unchanged stats;
- a rival whale in lane 1; and
- a Duck-Dex shelf with set bonuses.

Content, rates, bonuses, and economy effects remain simulation inputs. Cues and actions are recorded without asserting unobserved impact.

## Immersion

Quackpot uses one fixed diegetic stage. Offers appear as objects or messages in that world. The apartment empties as items are sold. The Receipt arrives as a printed slip. Presentation may favor atmosphere over explanatory text while conveying core gameplay information and choices.

Reduced-motion presentation preserves information, choices, and outcomes while reducing motion and spectacle. Photo-finish presentation, screen effects, and musical layering remain in the design; the owner will test them on a teacher computer considered similar to student desktops in the target lab.

## Endings

| Ending | How you get it |
|---|---|
| **Completed the Collection** | Every identity in the finite roster is owned; own-duck counting remains open |
| **Influencer** | Deferred with the streaming branch |
| **Running on Empty** | Only after the zero-health/money escalation sequence; ordering remains open |
| **Run complete** | Designed final day/event; duration and day count remain open |
| **Uninstall** | Always-visible control opens the retention offer; choosing to leave immediately is a terminal route and the best ending |

All terminal routes reach the Receipt. Early Uninstall does not force the player to continue for extra scenes.

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

All art begins as SVG source in the repository: characters, environments, gameplay elements, and animation where appropriate. Ordinary text uses HTML/CSS, not SVG, unless a text effect is impractical in CSS and JavaScript.

Each asset may be served as SVG or rendered to PNG where a measured test shows PNG is a better fit for that asset. The generated-raster banner/background plan is removed.

Sound effects use jsfxr/ZzFX-style parameters stored as text and synthesized at runtime. Music remains open: it may be generated through vanilla JavaScript or supplied as locally stored audio files generated with a model. No runtime network request is permitted. Generated-music provenance remains open.

## Technology

- The published experience is a static GitHub Pages site.
- All art begins as SVG source; each asset may ship as SVG or measured-fit PNG.
- Development/build may use Vite; output is static HTML, CSS, JavaScript, and assets. Runtime CDN libraries are not allowed.
- State and the Receipt event record stay in browser storage. Gameplay makes no network calls.
- One small seedable PRNG module makes runs and the event deck reproducible.
- A teacher-local dashboard imports multiple student usage files and analyzes them in the browser. It does not transmit or synchronize them. Bootstrap may be considered later for this teacher-only mode; it is neither a student-game dependency nor a selected implementation.

## Tuning

The first guesses are not trusted values. The first headless simulation packet will test:

- pity reachability under candidate thresholds and gem income in runs that may exceed 15 days;
- race rewards creating a self-funding pull loop versus premature starvation;
- roster size and duplicate rate for finite identities and the near-useless Down shop;
- Receipt accuracy on early exit, zero cash, ineligible events, and near a banner ending;
- near-miss candidate eligibility and the firing rule; and
- effects of Duck-Dex bonuses and bounded weekly curveballs.

Use the no-per-variant-balancing bound. Pity thresholds, gem amounts, roster size, duplicate rates, event rates, set bonuses, credit-card interest, race duration, banner window, session duration, and day count remain open.

## Scope

**v1 is a mechanism prototype.** It tests the core loop and Receipt honesty, not a fully classroom-ready five-minute experience. It should exercise a meaningful trade-off, an ending route including Uninstall, and the core manipulation/Receipt path. Day count, technique breadth, and duration remain open to simulation and orchestration.

**Later scope:** ladder steps 5–7, Mom's voicemails, streamer chat/branch, final event-deck values, and presentation detail not needed to test the prototype. Revisit the deferred ladder after a v1 playtest shows whether steps 1–4 create the intended squeeze.

## Classroom use

Students can play without an introductory lecture, then discuss the Receipt. Suggested prompts:

- What did the game show you before you chose?
- Which action or moment stood out?
- Did any cue affect your choice? How do you know?
- Who benefits when luck is something you can buy?

A student may download a run-usage file and manually submit it to a class assignment store. A teacher can import multiple files into a local analysis dashboard. This workflow does not require cloud storage, automatic transmission, or a teacher account in the game. Keep student files outside tracked repository content.

## Open questions

- What is the final title?
- What duration and in-game day targets work in a classroom, given that a run may continue past a lesson?
- What pity thresholds and banner carry/reset rule should simulation recommend?
- Does the player's own duck count toward collection completion?
- What roster size, duplicate rate, Down shop, set bonuses, and event effects work without variant-specific balancing?
- Which near-miss forms should testing retain, and what firing rule/rate is accurate?
- What fatigue-obscuring choices, if any, should orchestration propose while preserving accessible control?
- What additional odds detail should an optional button reveal?
- What fields belong in the downloadable run-usage file and local teacher analyzer?
- Which implementation should the local teacher analyzer use? Bootstrap is allowed but not selected.
- What provenance note is appropriate for model-generated music?
- Which assets show a measured benefit from PNG delivery?
