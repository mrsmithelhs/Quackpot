# Quackpot founding design review — dispositions

Companion to `synthesis.md`. Each actionable recommendation from the four reviews, with a
**proposed** state for owner triage at GATE-53B. Only the owner sets final states.

States: **accept** (fix the founding document as described) · **owner** (a genuine choice; options
listed) · **sim** (input to the first headless-simulation packet, not a number to set now) ·
**defer** (v2 or later; revisit trigger given) · **reject** (with reason).

Sources: A = codex-astra, S = codex-sol, R = gemini-argon, F = gemini-flash. Sections are
`docs/founding/design.md` anchors unless noted.

## Specification gaps (proposed: accept)

| ID | Recommendation | Source | Sections | Notes / dependencies |
|---|---|---|---|---|
| T1 | Write an explicit time policy and scene budget: the bound includes setup and Receipt; reveal theater and duck scenes are never penalized by a running clock | A S R F | `#life-metagame`, `#the-five-minute-experience` | The *shape* of the clock is owner choice O2 |
| T2 | Banner urgency uses explicit game-time labels and a real decision window, not linear compression | A R | `#core-loop`, catalog "FOMO" | Depends on O2 |
| T3 | Resolve the race "reflexes" contradiction — either the race takes input or the claim is removed | A S R | `#core-loop`, `#life-metagame` step 2 | How: O4 |
| T4 | Cash reaching zero or an unpaid bill opens an escalation prompt, never an immediate ending; define "Running on Empty" ordering; every terminal state reaches the Receipt | R A | `#endings`, `#life-metagame` | — |
| T5 | Receipt is built from a local append-only event record of cues shown, choices, costs, outcomes, and actual pre-draw odds; a technique is named only if its cue fired | A S R F | `#the-receipt`, `#manipulation-catalog`, `#technology` | Local only; no telemetry or network (constraint #2). Wording rule is O1 |
| T6 | Odds on the Receipt show conditional (pity-adjusted) probability, not only base 2% | A S | `#the-receipt`, catalog "Hidden odds" | — |
| T7 | Define pity carry-over or reset at banner end | A S R | `#core-loop` | Feeds S1 |
| T8 | Separate a finite collectible roster from cosmetic variation; define "complete"; state whether the own duck counts | A F R | `#core-loop`, `#assets`, `#endings` | Roster size → S1; own-duck counting → O5 |
| T9 | Define how often the near-miss tell fires, as a rule | F A S | catalog "Near misses" | Form of the tell is O7 |
| T10 | Reconcile all-SVG art into Assets and Technology (owner decision of 2026-10-23); ordinary text stays HTML/CSS; PNG rendering only where a measured test shows benefit | A S R F | `#assets`, `#technology` | Already decided; reconciliation only |
| T11 | Specify one small seedable PRNG module | R F | `#technology` | Trivial; zero dependency |
| T12 | Store jsfxr/ZzFX parameters as text and synthesize at runtime — answers the sound-provenance open question | R F | `#assets`; seed open question | Pairs with C9 tooling choice |
| T13 | Immersion contract: fixed stage, diegetic offers, visibly emptying apartment, Receipt as a printed slip; reduced-motion presentation preserves every outcome | A S R F | new section or `#technology` | Owner decision already adopted; this records how |
| T14 | Duck-companion scenes are event-triggered (about 3–5), skippable, with neutral fallback lines; an early Uninstall goes straight to its ending | A S R F | new section | Fate of the duck is O5 |
| T15 | Small seeded event deck: each event has trigger, eligibility, one-time flag, bounded effect, Receipt category or "neutral delight"; ineligible fallback; no discovery needed to finish | A S R | new section | Content picks in O9 |
| T16 | Credit-card interest is shown, not silent (weekly statement beat) | F | `#life-metagame` step 4 | v2 if the card is v2 |
| T17 | Classroom: no teacher view (confirms the draft); optional shareable run summary on the Receipt for voluntary discussion | R F | `#open-questions`, `#classroom-use` | No data leaves the browser |

## Owner choices

| ID | Choice | Options (source) | Synthesis note |
|---|---|---|---|
| O1 | **Receipt honesty rule** | (a) three registers — *we displayed / you did / did this affect you?* (A S); (b) allow interpretive lines asserting effect or motive (implicit in many R F examples) | Recommend (a): G4 forbids an inaccurate Receipt, and a student who catches one stops trusting the confession. Decide first; it governs every new Receipt line |
| O2 | **Clock** | phase-driven days (F); hybrid live shop window + fixed race + paused reveals (R); advance-on-action with scene budget and stopwatch test (S A) | All satisfy T1; differ in how much urgency is real |
| O3 | **v1 definition** | mechanism prototype (A option); classroom experience with stated duration, one weighty trade-off, terminal routes, named techniques (A S); full 15 days, six techniques, ladder steps 1–4 (R), steps 1/3/4 (F) | Everyone defers the full ladder and streamer branch |
| O4 | **Race role** | auto spectacle, remove reflex claim (A F); one pre-race choice, e.g. loved duck vs fastest (S, A alternative); timing taps with fatigue lag (R) | Timing taps add skill balance and accessibility work (A caution) |
| O5 | **Own duck's fate** | protected companion (A); optional keep-or-trade (S); late pawn offer and empty-desk scenes (R); benched-tragedy arc (F) | Any loss path must be optional and non-blocking; "what you told [DuckName]" Receipt line (R) works under O1(a) |
| O6 | **Uninstall** | visible, recognized as best only at the end, no prolonging (A); diegetic with early confirm (F); diegetic plus retention dark-pattern modal logged on the Receipt, with "play out the trap" for early exits (R) | R's modal adds a technique at the exit and tests constraint #5's spirit; flash's early confirm adds friction to the best ending |
| O7 | **Near-miss form** | keep gold→rare with a frequency rule (F); add crack-and-fizzle tell plus fake-out upgrade (R); 50/50 off-banner decoy (R) | The decoy is a new catalog technique; needs a Receipt line under T5 |
| O8 | **Down** | bounded cosmetic use, no profitable loop (A); predatory near-useless shop (R); dusting duplicates into pulls (F) | F changes the economy (→ S1); A and F conflict |
| O9 | **Variety content and tone** | banner archetype rotation (R); weekly life curveballs (R); secret/glitch ducks at very low rates with unchanged stats (R F); rival "whale" in lane 1 (R); Duck-Dex shelf with set bonuses (R F) | Tone-check names before adoption: "Biblically Accurate Duck", ".ru" sponsor domain, "dark-web", "Degenerate Streamer" (constraint #6 and classroom fit) |
| O10 | **Constraints #2 and #7** | keep #2 absolute (all four); allow a Vite dev/build step (S R F); stay buildless with vendored ES modules (R alternative); no libraries yet (A) | Runtime CDN: proposed **reject** (all four). GSAP licence is not open-source — check before choosing it |
| O11 | **Opening hook storyboard** | near-loss then free pull (S); Day 1 win then Day 2 banner loss (R); free ten-pull, win, $0.99 anchor bundle (F) | All: no exposition; first win before first squeeze |

## Simulation inputs (first consumer packet)

| ID | Question | Source | Bound |
|---|---|---|---|
| S1 | Pity reachability in 15 days: lower thresholds (e.g. 18–20 soft / 25 hard), front-loaded gems, or compressed multi-pull staging | A S R F | The design's four broad checks plus a few human-readable seed traces (S). **No per-variant fairness simulation.** Note: flash's honeymoon schedule yields ~17–19 pulls by Day 3, not 28–30 |
| S2 | Self-funding race loop versus too-early starvation | S | Same bound |
| S3 | Roster size and duplicate rate given T8 and O8 | A F | Same bound |
| S4 | Lifecycle checks: exit mid-reveal, zero cash on an expense, ineligible event, banner change near an ending — Receipt stays accurate | A | Targeted cases, not balance work |

## Deferrals (proposed)

| ID | Item | Source | Revisit trigger |
|---|---|---|---|
| D1 | Full escalation ladder steps 5–7, Mom's voicemails, streamer chat | all | After v1 classroom playtest shows the step 1–4 squeeze lands |
| D2 | Elaborate photo-finish, screen effects, musical layering | A F | After the v1 slice runs on classroom hardware |
| D3 | Odds-page navigation labyrinth with per-step tracking | R | With catalog "Hidden odds" when it enters scope |
| D4 | SVG-to-canvas caching for race sprites | R | Only if profiling on school laptops shows dropped frames |

## Proposed rejections

| ID | Item | Source | Reason |
|---|---|---|---|
| X1 | Runtime CDN libraries | considered by all; recommended by none | Violates constraint #2; exposes student IPs; school networks may block |
| X2 | Finding 5's Bootstrap-CSS premise | F | Factual error — Bootstrap here is project scaffolding, no CSS framework is present. The immersion point survives as T13 |
| X3 | Receipt lines asserting measured motive or effect (e.g. "drove 65% of your spend") | F R examples | Only if O1(a) is chosen; unobservable, so inaccurate under G4 |

## Hygiene correction (done)

`gemini-flash.md`'s 11 lines of absolute `file:///` links were rewritten to repo-relative paths before the first
push, on owner instruction; a mechanical edit that changes no finding. See `synthesis.md` §6.
