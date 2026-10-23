# Quackpot founding design review: synthesis

**Plan:** Bootstrap `plan-53`, Stage 2 synthesis.
**Inputs:** the four blind reviews at Quackpot commit `57655b4`: `codex-astra.md`, `codex-sol.md`,
`gemini-argon.md`, and `gemini-flash.md`. They were read against `docs/founding/design.md`
(SHA-256 `BD50ADF5…6999`, unchanged since the baseline), `docs/project-seed.md`, and
`baseline.md`.
**Author:** the Bootstrap orchestrator (Claude), acting as the assigned synthesis writer.
**Date:** 2026-10-23.

This document collects the reviews' claims for owner triage at GATE-53B. Nothing in it is a
decision. The reviews themselves stay unchanged. `dispositions.md` lists every actionable
recommendation with a proposed state.

**How to read the agreement counts.** Four reviewers agreeing is not proof. All four read the same
brief, and the brief named its concerns in advance: timing, juice, the Receipt, the player's own duck,
and variety. Some of the agreement below comes from that shared prompt. Where all four reviews point
at the same *text* in the design doc, the agreement carries weight. Where they predict how students
will feel, it is still a prediction.

## 1. Where the draft stands

Every reviewer called the premise strong: the game manipulates you, then shows you exactly how. The
draft's weakest areas are where the reviews converge most:

- **Time.** It has no plan for how five minutes are actually spent.
- **v1 scope.** As written, v1 does not contain the experience the doc promises.
- **The race.** The race has no defined role for the player.
- **The Receipt.** There is no rule for keeping the Receipt truthful.

None of these is a design reversal. They are gaps in the specification.

Reviewers scored the five shared goals separately. Only `codex-astra` and `gemini-argon` gave numbers:

| Goal | astra | argon | Shared reading |
|---|---|---|---|
| G1 High valence | 3 | 3 | Highs exist. Trade-offs are mostly pushed to v2. |
| G2 "Did you see that?" | 2 | 2.5 | The weakest goal: there are ingredients but no designed moments. |
| G3 Talkability | 3 | 3 | Runs differ mainly by luck and spending, not by what happened in them. |
| G4 Variety can't break the run | 2 | 4 | **The two disagree.** argon credits the 15-day cap and the seeded RNG. astra counts what is still undefined: the collection, event effects, and what happens at zero cash. |
| G5 The Receipt lands | 3 | 4 | Strong idea, but it is not yet guaranteed to be accurate. |

## 2. Convergent findings (all four reviews)

Each item names the design text involved and states the smallest common remedy.

### C1. The clock: five minutes have no budget (defect)
*design.md `#life-metagame`, `#the-five-minute-experience`*

Fifteen 20-second days already add up to 300 seconds. That leaves no room for the owner-adopted
opening customization, the duck conversations, the reveal theater, or the Receipt itself.

The arithmetic is checked. A "2 hours left" banner warning is about 1.7 real seconds if game time maps
linearly (astra). Rent first falls due about 140 seconds in (sol).

The reviewers split on the remedy, and this is one of the main decisions at GATE-53B:

- **Fully phase-driven days.** The player advances each day; it averages about 20 seconds
  (`gemini-flash`).
- **Hybrid.** A short live countdown during the shopping phase, a fixed race, and reveal theater that
  pauses the clock (`gemini-argon`).
- **Advance on player action, with a written scene budget.** Hook by about 30 seconds, a real choice by
  about 60 seconds, then a stopwatch test (`codex-sol`, `codex-astra`).

All four agree on two points. Reveal theater and the duck scenes must not be punished by a running
clock. The whole run, including setup and the Receipt, has to fit the class period.

### C2. v1 scope: does it contain the experience? (defect / owner choice)
*`#scope` against hard constraint #4 and `#the-five-minute-experience`*

v1 is defined as one in-game week with three techniques and no escalation ladder. The doc's own
promise is 15 days with a life squeeze.

- `gemini-argon` and `gemini-flash` would expand v1 to the full 15 days, six techniques, and the first
  three or four ladder steps.
- `codex-astra` and `codex-sol` ask the owner to choose one of two:
  - v1 is a mechanism prototype, or
  - v1 is the classroom experience, with a stated duration, one weighty trade-off, terminal routes
    including Uninstall, and a named set of techniques.

All four agree that the full ladder and the streamer branch can wait.

### C3. The race: who plays it? (owner choice, with one defect inside)
*`#core-loop` "Pond Race" against `#life-metagame` step 2*

The race is automatic, yet "extra shift … race reflexes feel slower" implies the player does something
in it. That contradiction is a confirmed defect. If the race is purely about stats, "race your best
duck" also becomes the obvious strategy.

The four remedies:

- **astra:** an automatic spectacle with faithful results, and delete the reflex claim, or add one
  pre-race choice.
- **sol:** one pre-race choice, such as the loved duck for a bond reward or the fastest duck.
- **argon:** one-button "Quack Boost" timing taps, with sleep loss shown as a lagging input.
- **flash:** a passive spectacle plus a purely cosmetic squeeze button.

**Minority caution (astra):** a reflex mini-game brings in skill balance and accessibility questions
that the vibe-over-readability decision does not settle.

### C4. Pity reachability (simulation question)
*`#core-loop` 160 gems per pull, soft pity at 35, hard pity at 50*

Hard pity costs 8,000 gems. At any plausible free income, a non-spending player never reaches soft
pity in 15 days. Then the "only 12 pulls from a guaranteed legendary" line never fires (all four
reviews). Whether pity resets or carries over when a banner ends is also undefined.

The proposed remedies:

- Lower the thresholds, for example 18–20 soft and 25 hard (argon).
- Front-load free gems in a "honeymoon" (flash, argon).
- Compress multi-pull staging (astra).

Every reviewer keeps this inside the existing broad simulation and none asks for per-variant
balancing.

**Arithmetic correction.** `gemini-flash` says its honeymoon schedule reaches about 28–30 pulls by
Day 3. As specified (1,600 gems on Day 1, then 600 a day on Days 2–3, plus perhaps one 300-gem race
win), it reaches about 2,800–3,100 gems, which is roughly 17–19 pulls. The direction still holds; the
number does not.

### C5. The Receipt needs an event record and an honesty rule (defect)
*`#the-receipt`, `#manipulation-catalog`*

All four reviews say the Receipt must be built from a local, append-only record of what actually
happened, not reconstructed from the final game state. Two distinct accuracy problems come up:

- **Mechanical accuracy (all four).**
  - "Legendary odds: 2%" is wrong once soft pity raises the chance.
  - Near-miss counts need a stated rule for when a near-miss tell fires.
  - New cues and variety events vanish from the Receipt unless they are logged.
- **Claims about players' minds (`codex-astra`, `codex-sol`).** Several catalog lines assert things the
  game cannot observe:
  - "The starter pack made $49.99 look reasonable"
  - "You opened the game on 15 of 15 days", where accelerated in-game days are not logins
  - "chasing pity", which assumes a motive

  Their remedy is three registers: *what we displayed*, *what you did*, and *did this affect you?*
  (the last as a question, not a claim).

**This is the most important split for triage.** `gemini-argon` and `gemini-flash` propose many new
Receipt lines that do assert causation or motive, for example:

- "The last 2 silhouettes drove 65% of your spend"
- "triggered immediate $4.99 starter pack purchase"
- "Showing peers reinforced play"

Under astra and sol's rule, those lines would be inaccurate. They would also break goal G4, which
says no variant may make the Receipt inaccurate. The owner should choose the honesty rule before any
new Receipt copy is adopted.

### C6. The player's own duck needs a stake, not just a portrait (idea)
*seed, "Player's own duck"; `#core-loop`*

Power creep makes the named duck mechanically irrelevant almost at once (all four). All four propose
three to five scenes triggered by events, not by the calendar. Typical triggers are the opening, the
first time it is benched or something is sacrificed, the first crisis, and the ending, each with a
neutral fallback line.

They diverge on whether the duck itself can be lost:

| Option | Source |
|---|---|
| The duck stays a companion and cannot be sold. Selling it would need a separate owner decision. | astra |
| An optional, non-blocking keep-or-trade choice | sol |
| A late-run "pawn your vintage duck" offer, with an empty-desk stain afterward | argon |
| Benched tragedy: it eventually turns to face the wall, and a dark-web sponsor asks for its "soul" | flash |

**Receipt link.** argon proposes a "What you told [DuckName]" line that prints the player's actual
dialogue choice beside the spending. This reports something the player *did*, so it passes the C5
honesty rule. Lines claiming the duck "watched you spend on ducks that didn't care about you" are
tone choices, not observations.

### C7. Variety comes from a small event deck mapped to the catalog (idea)
*seed shared goals; `#core-loop`*

Rarity alone gives most students no story. Ten 2% draws give only about an 18% chance of any
legendary (astra, checked). The common remedy:

- a small seeded deck of events, roughly one early oddity, one midpoint temptation, and one late
  reversal (sol);
- each event tagged to a catalog technique or marked as neutral delight;
- each with a bounded effect and a guaranteed path to the Receipt.

Two concrete systems were proposed:

- **Banner archetype rotation:** 3 of 6 themes per run, all under the same creep and timer rules
  (argon).
- **A neutral-cost "life curveball" each week** (argon).

astra adds the guardrails:

- a small event vocabulary (trigger, eligibility, one-time flag, presentation, allowed effect, Receipt
  category);
- a fallback when no event is eligible;
- no discovery may be required to pay rent, finish, or reach the Receipt;
- discovery must never require repeat sessions or fast clicking.

### C8. Immersion: one world, not pages (owner direction to implement)

All four describe the same approach:

- a fixed stage, such as a desk or apartment with the gacha on an in-world device;
- escalation offers that appear as objects in the room, such as a boss's text, a "sell my couch" note,
  or a credit-card envelope;
- an apartment that visibly empties;
- the Receipt as a printed itemized slip.

They also agree that ordinary text stays HTML/CSS for scaling and assistive technology, and that a
reduced-motion presentation keeps every outcome intact.

**One premise error.** `gemini-flash` Finding 5 reads "initialized with Bootstrap" as the Bootstrap CSS
framework. Here Bootstrap is the project-management scaffolding; no CSS framework is installed. The
immersion point in that finding stands. The premise is wrong.

### C9. Tooling: no runtime CDN (proposal)

All four keep hard constraint #2 (no network calls) absolute and advise against runtime CDN loading.
Their reasons: the CDN would see student IP addresses, school networks may block it, and offline play
would break.

They differ on the rest:

| Reviewer | Build step | Runtime libraries |
|---|---|---|
| astra | None yet | None. CSS, SVG, and a small sequencing layer are enough to test the design. |
| sol | Vite (dev and build only, MIT, checked 2026-10-23) | None needed for the first slice |
| argon | Vite, or vendored ES modules with no build step | GSAP or Anime.js for timelines; ZzFX or jsfxr for sound; Mulberry32 for seeded randomness |
| flash | Vite | Native Web Animations API and CSS; jsfxr; Mulberry32 or a similar small generator |

Everyone agrees on:

- one small seeded random-number generator;
- sound generated in code from jsfxr/ZzFX parameters stored as text, which also answers the
  sound-provenance open question (argon);
- no runtime dependency until a prototype shows it is needed.

The real choice is whether hard constraint #7 changes to allow a build step (Vite), or the game stays
buildless with vendored modules.

**Licence note.** `gemini-argon` lists GSAP under a "standard no-charge" licence, which is not an
open-source licence. Check the current terms before adopting it. Anime.js is MIT.

## 3. Divergent findings and minority positions to keep in view

### D1. Uninstall placement and behavior (owner choice; constraint #5)

Three reviews worry that curious students will click a visible Uninstall in the first 15 seconds.

- **astra:** keep it visible and usable, but give the "best ending" recognition only at the ending.
  Acknowledge zero-pull exits accurately, and don't stretch an early exit to fill time.
- **flash:** make it diegetic, ask for confirmation on Days 1–2, and celebrate a later exit.
- **argon:** put it on the device bezel, and have a **retention dark-pattern modal** (a guilt-trip
  offer of 80 gems to stay) appear on click. Accepting the offer is logged on the Receipt. Early
  quitters get a "play out the trap anyway" button.

argon's modal adds a ninth catalog technique (confirmshaming) right at the exit. It is a strong teaching
beat, but it sits uneasily with constraint #5's "best ending." The owner should decide this directly.

### D2. The zero-cash ending contradicts the escalation ladder (defect; mainly argon, also astra)
*`#endings` "Running on Empty" (money hits zero) against `#life-metagame` ("when money runs short, the
game offers options")*

As written, reaching zero cash could end the run at exactly the moment the ladder should open.
Proposed fix: cash at zero, or an unpaid bill, triggers an escalation prompt, not an ending; "Running on
Empty" happens only once borrowing is exhausted (argon). astra's version: define what happens at zero
cash, and make every terminal state reach the Receipt.

### D3. Near-miss design

- **argon:** gold that resolves into a rare is the wrong shape, because industry tells upgrade rather
  than downgrade (unsourced industry-practice claim). It proposes splitting near-misses into a
  "crack-and-fizzle" tell and a "fake-out upgrade," the latter including a 50/50 off-banner "Decoy Duck."
- **flash:** the draft's example ("17 glowed gold, 2 legendary") implies gold tells on most pulls, which
  would wear the cue out. Restrict tells to about 30% of rares. **Correction:** that example is a sample
  Receipt line, not a frequency spec; but the underlying gap is real, because no rule says how often the
  tell fires.
- **astra and sol:** whatever the tell, log the cue rule and the actual pre-draw odds.

**New manipulation in argon's proposal.** The 50/50 decoy adds a technique that the catalog does not
include.

### D4. The use of Down (duplicates)

| Proposal | Source | Effect |
|---|---|---|
| One bounded cosmetic use; keep it economically poor; avoid a profitable loop | astra | Consolation without changing the economy |
| A predatory sink: absurd prices, almost nothing for sale | argon | Exposes secondary-currency obfuscation |
| "Dusting": 5 duplicates buy 1 pull | flash | A recycling loop; changes the economy, so it needs simulation |

astra's no-profitable-loop rule and flash's dusting loop pull in opposite directions.

### D5. The collection must be finite (defect; astra, flash, argon)

8 colors × 8 hats × 6 accessories gives 384 combinations (checked). If every combination counted,
completing the collection would be impossible. The proposed fix is to separate a finite roster of
collectible identities, such as 10–16 named ducks, from cosmetic variation. Show the roster on a shelf
or "Duck-Dex" with silhouettes for missing ducks (flash, argon); argon adds set bonuses. The owner also
needs to decide whether the player's own duck counts toward the collection.

### D6. Tone of individual variety ideas (owner taste)

Several candidate moments are very funny, and a few need a classroom-tone check before adoption:

- "Biblically Accurate Duck" (religious imagery);
- "ShadyQuackGems.ru" (a real country's domain used as the punchline for "shady"; under constraint #6,
  only fictional names);
- "dark-web" and "sign away your duck's soul";
- the "Degenerate Streamer" branch name.

The mechanics underneath stand on their own; only the framing needs the check.

### D7. The opening hook

The first-minute storyboards differ in a way that matters:

- **sol:** the familiar duck nearly wins, then a sponsored rival rockets past, and the free pull is
  offered after the sting.
- **argon:** the duck wins Day 1, then on Day 2 a new banner duck beats it at the line, with a "only
  58 s left" banner.
- **flash:** a free ten-pull, a Day 1 win, then a $0.99 "400% value" bundle on Day 2.
- **astra:** own duck → welcome reveal → race payoff → a temptation, all within about 60 seconds.

All four agree on two points: no opening exposition, and the first win comes before the first squeeze.

## 4. "Did you see that?" moments: merged candidates

Merged from all four reviews. These are not commitments. The tags follow the C5 honesty rule: an event
counts as manipulation only if it is a catalog technique and its cue is logged.

| Moment | When it fires | Tag | Reviewers | Cost |
|---|---|---|---|---|
| Familiar duck nearly wins; a sponsored rival rockets past | Day 1–2 race | Power creep | sol, argon | Low–medium |
| Photo finish: lose by a beak, then an immediate upgrade offer | First race after a new banner | Power creep, near-miss | argon, flash | Medium |
| Common duck crosses the line backward; standings stay correct | Early race, seeded | Neutral delight | astra | Low |
| Plain capsule unfolds into a spectacular reveal | Early or mid pull | Anticipation (log cue and odds) | sol, argon, flash | Medium |
| Glitch, cursed, or secret duck at a very low rate, same stats | Any pull after Day 3 | Novelty / variable reward | argon, flash | Low with SVG layers |
| Camera finds the missing couch, then holds on the silent duck | First furniture sale | Sacrifice (no claimed regret) | astra, argon | Low–medium |
| Cardboard box replaces the desk; room audio turns hollow | Late sales | What you sold | argon | Low |
| Mom's voicemail drops in over a ten-pull | After "borrow from Mom" | Escalation | argon | Medium (v2) |
| Landlord door-knock with a screen shake | Day 7 if rent is short | Squeeze | flash | Low |
| Streamer chat explodes on a big bundle | Streaming branch | Social proof (log it) | sol, argon, astra | Medium (v2) |
| A secret accessory hidden in the reeds | Optional pond click (with a keyboard equivalent) | Cosmetic only | astra, flash | Low |
| The benched duck turns to face the wall | Late, if benched long | Companion reflection | flash | Low |
| The game falls silent and the duck sits beside a printed Receipt | Every ending | Payoff | sol, astra, argon | Low–medium |

## 5. Research: what the reviews established

All four ran the required research. Who actually did it:

| Reviewer | Research done by | Source handling |
|---|---|---|
| astra | Luna subagent (`gpt-6-luna`) | Five linked sources, spot-checked by the parent reviewer |
| sol | Luna subagent | Three linked sources |
| argon | Flash subagent | Citations unlinked |
| flash | Flash subagent | Citations unlinked |

**Supported by linked research.** Anticipation and reveal, rare surprises, collection, progression, and
time-limited opportunities are plausible sources of enjoyment. This rests on Larche et al. 2021, the
Nicklin et al. 2021 interviews, and the RAFFLE validation study. Social comparison and sharing appear
mainly as *motives players report*, not as measured behavior. Whether any of this carries over to a
five-minute classroom run with fictional money is unknown (astra, sol).

**Cited but not checked by this synthesis.** The Gemini reviews cite a wider range of psychology:
- goal-gradient (Kivetz 2006);
- the IKEA effect (Norton 2012);
- near-miss neuroscience (Clark 2009);
- Zeigarnik and others.

They also attach specific industry percentages, such as "15–25% of 4-star pulls," without sources.
Treat those as design rationale, not evidence. One attribution looks wrong: argon credits the
endowment effect to Belk (1988). The usual citation is Kahneman, Knetsch and Thaler (1990), which
flash correctly uses.

**Mechanics the draft lacks that all the maps flag:**
- a tactile pull ritual;
- fake-out or upgrade tells;
- a visible collection shelf;
- a working duplicate economy;
- rare anomaly events;
- an attachment payoff for the owned duck.

## 6. Matters for the owner (before GATE-53B)

**A path-hygiene defect in a committed review — corrected.** `gemini-flash.md` as copied contained
11 lines of `file:///` links to an absolute local drive path, which Quackpot's contract forbids in
committed files of a public repository. On owner instruction (2026-10-23), before the first push, the
links were rewritten to repo-relative paths (`../../../docs/...`, line anchors kept) and the edit was
folded into the unpushed review commit, so the path never enters published history. This is a
mechanical hygiene edit; no finding, wording, or citation changed. The two research-subagent
conversation IDs (argon, flash) are harmless and stay.

**Decisions this synthesis cannot make, in rough priority order:**

1. **Honesty rule for the Receipt (C5).** Should it use three registers (displayed / did / question),
   which rules out Receipt lines that assert motive?
2. **Clock policy (C1).** Fully phase-driven, hybrid, or advance-on-action with a scene budget.
3. **v1 definition (C2).** A mechanism prototype, or the classroom experience; and if the latter, which
   techniques and which ladder steps.
4. **The race's role (C3).** A spectacle only, a pre-race choice, or timing taps.
5. **The duck's fate (C6).** A protected companion, or an optional keep/trade/pawn branch.
6. **Uninstall behavior (D1),** including whether to add a retention dark-pattern modal.
7. **Pity scale and banner carry-over (C4).** These are inputs to the first simulation packet, not
   numbers to set now.
8. **Finite roster and the Down economy (D4, D5).**
9. **Constraints #2 and #7 (C9).** Keep #2 absolute? Allow a Vite build, or stay buildless?
10. **Tone check on specific variety ideas (D6).**

## 7. Limits of this synthesis

- **Checking.** I checked the arithmetic and the claims that recommendations depend on against
  `design.md`. Unlinked citations were not verified.
- **Conflict of interest.** The synthesis writer also wrote the review brief.
- **Assumption.** The reviews are taken to be as the owner copied them at `57655b4`; nothing confirms
  they match each reviewer's output.
- **Dispositions are proposals.** The proposed states in `dispositions.md` express the synthesis
  writer's judgment. The owner sets the actual states.
