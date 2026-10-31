# Independent External Creative Review: Quackpot Evolution and Plan 36 (`gemini-argon`)

- **Reviewer Key:** `gemini-argon`
- **Requested Model:** Gemini Argon (`gemini-argon`)
- **Exposed Runtime Setting:** Gemini 4 Argon (Medium) (exposed via harness metadata; self-reported model identity is not independently verified)
- **Harness:** Google Antigravity IDE (`windows`, read-only repository inspection)
- **Repository Baseline:** `C:/AI/Quackpot` (`main` branch, commit `aa8942e4bdbe3cb64ab5c797e165d85c45cbb43f`)
- **Date:** 2026-10-30

---

## 1. Current-versus-Proposed Capability Map

Before proposing new narrative arcs or Plan 36 disorientation effects, we must separate what **currently runs in `src/`**, what exists as **unmounted source modules or accepted report studies**, what is **in-progress or draft**, and what is **newly proposed in this review**.

### 1.1 Production Runtime vs. Unmounted Modules vs. Proposals

| Capability / Surface | Current Production State (`src/`) | Unmounted Code / Accepted Studies | Proposed Evolution (30+ Min & Plan 36) |
|---|---|---|---|
| **Entry & Shell Transitions** | `src/main.js` (`lines 224–231`, `301–305`, `649`) wires `createStageTransition` (`src/ui/stage-transition.js:4-121`). `enter` and `return` run 3-phase WAAPI sequences (`240ms + 420ms + 480ms` = `1140ms` enter; `420ms + 420ms + 240ms` = `1080ms` return). Reduced motion (`stage-transition.js:43-46`) resolves on 1 `requestAnimationFrame` with `.stage-transition-static`. Cancelled immediately on Settings (`main.js:209`), Duck-Dex (`main.js:217`), or Uninstall (`main.js:233`). | Plan 14 / Plan 19 closed (DECISION-012, DECISION-014). | Preserve instant cancellation and reliable destination arrival. Replace "control failure" with **Destination Room Shifts** (returning from phone into `bedroom` or darkened `kitchen` after action slots advance) and a one-time, `<=300ms` **Portrait Settle Hesitation** inside the overlay that never aborts the return. |
| **Apartment Art Kit & Rooms** | `src/assets/apartment/index.mjs` (`lines 20–25`) exports `renderScene` for 5 areas: `living`, `kitchen`, `bedroom`, `desk-side`, and `desk-top`, with `wide` (`960x540`) and `medium` (`440x247.5` duck-centered crop, `rooms/scene.mjs:54`) framings and 3 light modes (`neutral`, `window`, `warm` in `lighting/modes.mjs`). **However, `src/ui/life/life-view.js` (`lines 39–47`) only mounts `kitchen`, `desk-side`, and `living`.** | **`bedroom`** (`rooms/specs.mjs:48-67`: bed, bedside table, `bedLamp`, `clockSmall` at 12:10, `toyShelf` with `teddy`, `block` A/B/C, `robot`, `truck`, `rings`, `ball`, `bunny`) and **`desk-top`** (`desk/top.mjs`: overhead wood grain, `notepad`, `sticky note`, `pencil`, `keychain`, `lip balm`, gold/silver `'Q'` `coins`, overhead duck) are **already built in `src/assets/apartment/` but unmounted in gameplay**. | Mount `bedroom` and `desk-top` as core apartment places in `life-routing.mjs`. Use `bedroom` (`clockSmall`, `toyShelf`, `bed`) for evening/night reflection and cognitive-echo inspection, and `desk-top` (`notepad`, `coins`) for player planning, F2P optimization logs, and unreliable narration counterpoints. |
| **Apartment Life Architecture** | `src/ui/life/*` (Plan 38 integration of Plan 28 Direction A) implements a strict 3-layer UI (`life-view.js:1-9`): **Layer 1** room object buttons (`.life-obj`, gold pulse halo in `life.css:52-56`), **Layer 2** held readable items (`.life-held` FLIP modal with buttonless `life-letter` or `life-phone-held`), and **Layer 3** commitment UI (`.life-decide` drawer or `.life-popover` stating exact deltas first). Commits are guarded by `expectLog === engine.log.length` (`main.js:584-627`). | Plan 28 accepted and closed (DECISION-034); Plan 38 in-progress in `src/ui/life/`. | Use the Layer 1/2 vs. Layer 3 split as the architectural foundation for Plan 36: **Layers 1 & 2 carry the character's subjective drift and gacha habits; Layer 3 (`Decide`) and institutional paper remain 100% factual and uncorrupted.** |
| **Physical Rubber Duck Companion** | `src/ui/life/life-art.mjs` (`lines 146–240`) poses the inanimate SVG duck (`front`, `side`, `rear`, `high`, `low`, `top` from `src/assets/apartment/duck/index.mjs:7`) with `headingToward` and `leanToward`. Enforces D21: tilts (`\|lean\| >= 12°`) require `wedge: 'paperback'`. Turns `front` when room tasks are done (`life-view.js:487`). | Late pawn offer (`pressure_on_possession`) is projected in `src/core/receipt.mjs:24, 148-155` and simulated in `sim/`, but **not yet wired into the 3-day browser route in `src/main.js`**. | Keep the physical duck 100% inanimate. Expand its cinematic storytelling via room relocations between action slots, D21 book/notebook wedges, dramatic lamp/window shadows, and a playable late-run pawn offer leading to an empty-anchor desk/shelf scene. |
| **Weather & Atmospheric Lighting** | Only static `neutral`, `window`, and `warm` lighting modes from `src/assets/apartment/lighting/modes.mjs` are used in `life-view.js:39-47`. | `src/ui/weather-flash-arbiter.mjs` (`>=4000ms` cooldown), `weather-motion-controller.mjs`, `weather-lightning-effect.mjs` (`BRIGHT` 40ms rise / 300ms scene fade / 800ms window fade), and `src/assets/apartment-weather/layers.mjs` are **extracted and tested (Plan 34) but completely unmounted in `main.js`**. | Mount still overcast/rain/storm and optional paused-aware rain in late-run apartment beats to reinforce time-of-day jumps and mood counterpoints without equating weather to player psychology. |
| **Audio & Music Transformation** | **Zero audio is mounted in `src/main.js`**. `src/ui/settings-modal.js:22-25` displays the placeholder credits notice. | `src/audio/synth.mjs` (`QUACK_A/B/C`) is unmounted. Plan 18 (CC0/CC-BY credits) and Plan 33 (`Base → Uneasy → Dire` reharmonization, low tonic pedal, `-16.0 LUFS` matching) are closed research; Plans 30, 32, 39 are draft/in-progress. | When audio integrates, distinguish **diegetic TV audio** (silenced permanently if TV is sold, Plan 30) from **fictional phone/internal Motif C bleed** (muffled low-pass `Uneasy`/`Dire` residual tail for `3–5s` after returning from phone, strictly obeying mute/volume controls). |
| **PRNG & Save Validation** | `src/core/prng.mjs` (`sfc32` + `cyrb128`) forks `rngDraw`, `rngRace`, `rngEvent` (`game-engine.mjs:89-93`). `fork(label)` (`prng.mjs:90-92`) seeds strictly from `${key}/${label}` and never perturbs sibling streams. `src/core/storage.mjs` (`validateSave`, `lines 60–310`) enforces `schemaVersion: 3`, checks exact stream keys `['root', 'draw', 'race', 'event']` (`lines 131–158`), and replays `eventLog` from genesis ($15 cash, 100 health) to reject any balance mismatch (`lines 249–310`). | Plans 16 & 35 provide deterministic checkpoints (`rent-paid`, `rent-unpaid`, `finale-race`). | Derive Plan 36 seeded variation from a pure function of `(seed, step, exposureIndex)` via `createRng(`${seed}/narrative/${step}`)`—or bump `schemaVersion` if persisted—so `storage.mjs` stream validation and `rngDraw`/`rngRace`/`rngEvent` remain 100% untouched. |
| **Receipt & Debrief Hierarchy** | `src/core/receipt.mjs` (`lines 31–371`) projects 10 techniques from `eventLog` into `displayed`, `did`, and `question` with `[#seq]` tags (`receipt-view.js:52-93`). | Plan 27 selected **Layout A** (reflection-first Three-Register Cards with `<details>` evidence disclosures and `[Game recorded result]` prefixes, DECISION-031). | Map Plan 36 cues into Layout A using a strict three-way split: **Fictional App Persuasion** vs. **Depicted Character Narration/Activity** (`[Depicted character beat]`) vs. **Actual Student Actions**, never asserting psychological effects on the student. |

### 1.2 Explicit Uncertainties

1. **Plan 38 Final Owner Review:** `src/ui/life/` is present in the working tree (`main` at `aa8942e`) and wired into `src/main.js`, while `AGENTS.md` §1 notes Plan 38 is in-progress awaiting final integrated owner review. Our review treats `src/ui/life/` as the active code baseline but flags that its final acceptance gate is still open.
2. **Plan 29 & Plan 37 Numerical Calibration:** Current `GAME_CONSTANTS` in `src/core/game-engine.mjs:42-59` still use the 3-day mechanism-slice numbers (`START_CASH: $15`, `WAGE_DAILY: $10`, `FOOD_DAILY: $5`, `RENT_DAY2: $15`), whereas Plan 28/29 documents reference scaled values (e.g., `$300` or `$650` rent, `$45` shift). Exact scaled numbers remain an open calibration dependency (Plans 29/37).

---

## 2. Broader Game & Story Proposal (30+ Minute Multi-Arc Experience)

### 2.1 Structural Diagnosis: Why Stretching the 3-Day Slice Would Fail

The current playable slice in `src/main.js` and `src/core/game-engine.mjs` has 2 races, 1 promotional ten-pull, 3 breakfasts, and 1 rent check on Day 2. If we simply padded that linear path with slower animations, more text boxes, or compulsory timers to reach 30 minutes, high-school students would spot the padding immediately and disengage.

For the pressures of Quackpot to *mean something* over 30+ minutes (or across saved multi-session play), **the gacha loop must be genuinely fun to tinker with, and the apartment life must offer meaningful competing uses for the character's time, money, and care.** Most importantly, the story must not railroad every student down a single inevitable chute of financial ruin and moral failure.

### 2.2 Eight Worthwhile Developments & Interactions

We propose restructuring the core run into a **6-Day, 2-Cycle Experience** (*Cycle 1: Days 1–3 "The Starter Pond & Midweek Squeeze"*; *Cycle 2: Days 4–6 "The Rotating Banner, Championship Qualifier & Rent Settlement"*), with an optional **Endless / Post-Settlement Extended Mode** via local saves. Under DECISION-034's action-based time, each day has **3 playable action windows** (*Morning*, *Afternoon*, *Evening/Night*), where reading, inspecting Duck-Dex, or opening Settings costs **zero** slots, and only committed gacha/life actions advance the slot.

#### Development 1: Action-Slot Opportunity Trade-Offs (The 3-Slot Daily Calendar)
- **Interaction:** Each day gives the player clear, low-friction choices over how to spend their committed action slots across the apartment and the phone:
  - *Morning (Kitchen / Desk):* Eat breakfast (`kitchen-breakfast`), check fridge notes (`kitchen-notice`), and claim the daily free login/race entry on the phone.
  - *Afternoon (Phone / Work / Town):* Standard work shift (automatic on workdays unless skipped) + midday Pond Race heat or banner pull session.
  - *Evening/Night (Living Room / Bedroom / Desk-Top):* Choose **one** primary evening commitment: (a) **Overtime / Banquet Shift with Marisol** (+Cash, -Health/Energy, builds outside connection), (b) **Pond Grind & Roster Tuning** (run multiple heats to cycle 2-race duck rest penalties from Plan 22 and farm Down), or (c) **Rest & Apartment Recovery** in `bedroom` (restores Health/clarity, clears fatigue cues, repositions the companion duck).
- **Agency & Consequence:** Time becomes a tangible resource alongside Cash and Gems. A player who refuses to spend cash can still feel the squeeze of sacrificing evening rest or social plans to cycle duck rest counters.
- **Production Cost:** Low-Medium (pure state machine extension in `game-engine.mjs` and `life-routing.mjs`, coordination with Plan 37).

#### Development 2: Banner 2 Rotation, Power Creep, and Set-Bonus Temptation
- **Interaction:** On Day 4 Morning, Banner 1 (*"Pond of Destiny"*) rotates or splits into a featured limited-time **Banner 2 (*"Neon Waterfowl Syndicate"*)** whose featured ducks have a `+15%` base speed rating (`design.md` §Starting values) and a 3-duck themed Duck-Dex set bonus (`+8%` effective race rating when all 3 are owned).
- **Agency & Consequence:** Exercises three canonical manipulation techniques that are currently stubbed in `receipt.mjs` (`lines 84–108`, `127–138`) but absent from the 3-day playable slice: `fear_of_missing_out` (explicit game-time window: *"Ends Day 6 Afternoon"*), `power_creep` (Day 1 common ducks now struggle in Heat 3 without rest management or Down upgrades), and `completion_pressure` (2/3 set silhouettes gleaming on the Duck-Dex shelf).
- **Production Cost:** Low (uses existing Mode C SVG rig `src/core/duck-rig.mjs` with new palette/hat/accessory combinations from the 8×8×6 rig space and existing `receipt.mjs` hooks).

#### Development 3: The Playable Gem & Down Shop with Odd-Bundle Leftovers
- **Interaction:** Currently, `displayGemShop()` (`game-engine.mjs:705-717`) logs a `currency_obfuscation` cue on Day 1 Afternoon, but the player cannot actually buy Gem bundles or use the 6-Down active-banner pull exchange (DECISION-013) across multiple days. Make the shop a live tab inside the landscape phone view offering the $0.99 Starter Pack (if unclaimed), odd-sized Gem bundles (`60`, `330`, `1,090`, `1,750` Gems against a `160`-Gem pull), and the accepted Down Exchange (`3 Down` = one-race `+5%` speed upgrade; `6 Down` = 1 active-banner pull advancing pity).
- **Agency & Consequence:** Students experience firsthand how a `330`-Gem bundle leaves `10` Gems after two pulls (`320` Gems), and how `5 Down` sitting in their wallet nudges them to pull one more duplicate to reach `6 Down`.
- **Production Cost:** Low (rules already validated in Plan 17 / DECISION-013; requires UI tab in `gacha-view.js` and engine mutators).

#### Development 4: Mounting `desk-top` as the Player's Tactile Workspace & Notepad
- **Interaction:** Mount the already-authored overhead `desk-top` scene (`src/assets/apartment/desk/top.mjs`) as an inspectable apartment place. Tapping the spiral **Notepad** (`X=215, Y=350`) opens Layer 2 inspection showing the character's running notes: bill due dates, duck rest schedules, and (in later stages) rationalized math. Tapping the **Coins** (`X=612, 645`) or **Sticky Note** (`X=300, Y=238`) surfaces micro-decisions.
- **Agency & Consequence:** Gives "Free-to-Play Optimizer" students a diegetic home for their strategy while serving as the primary canvas for Plan 36 unreliable narration vs. factual ledger comparison.
- **Production Cost:** Very Low (`src/assets/apartment/desk/top.mjs` is 100% authored and tested).

#### Development 5: Mounting `bedroom` for Evening/Night Closure, Clock Checks, and Toy-Shelf Reflection
- **Interaction:** Mount `bedroom` (`src/assets/apartment/rooms/specs.mjs:48-67`) as the evening/night transition room. The **Bed** (`X=500, z=3450`), **Bedside Clock** (`clockSmall` at `X=1480, Y=625`), and **Three-Tier Toy Shelf** (`toyShelf` at `X=-250, z=1500` holding `teddy`, `block` A/B/C, `robot`, `truck`, `rings`, `ball`, `bunny`, and the physical companion duck at `Y=540`) become interactive Layer 1 objects.
- **Agency & Consequence:** Closing a day by choosing to sleep in `bedroom` vs. staying up at `desk-side` under the warm lamp cone for "one more heat" makes sleep/fatigue a voluntary player choice rather than an abstract stat decrement.
- **Production Cost:** Very Low (`bedroom` SVG and all 9 toy props are already in `src/assets/apartment/props/toys.mjs` and `bedroom.mjs`).

#### Development 6: Coworker Marisol as a Multi-Beat Human Tether (Not Just a Shift Dispenser)
- **Interaction:** Expand Marisol's phone thread (`life-copy.mjs:42-48`) across Days 1–6 into a 4-beat human subplot:
  - *Beat 1 (Day 2):* Casual shift cover request (`"hey, any chance you could cover my late shift tonight?"`).
  - *Beat 2 (Day 3/4):* If covered, she leaves a pink sticky note on the kitchen fridge (`props/kitchen.mjs` has pink `#e9857d` and blue `#6fa3c7` fridge notes!) with free leftover bakery muffins (waiving a morning food cost) and asks what game you've been playing.
  - *Beat 3 (Day 5):* Invites the character to split a late afternoon coffee in the living room (`living` table shows both the terracotta mug `#b86b4b` and kitchen blue mug `#4f8fc0`) or cover a high-paying weekend banquet shift.
- **Agency & Consequence:** Creates a warm, non-judgmental outside relationship. Neglecting Marisol's texts for gacha windows isn't punished by a game-over screen, but the quiet absence of the second mug and her fading texts (`"all good, catch you next week!"`) is felt in the room and recorded honestly.
- **Production Cost:** Low (uses existing `life-phone-held` SMS UI, kitchen fridge sticky note hotspot, and existing mug props).

#### Development 7: The Rival Whale ("QuackKing_99") and Pre-Race Choice Tension
- **Interaction:** In Midday/Evening Pond Races from Day 2 onward, Lane 1 features the recurring rival whale (`social_comparison` in `receipt.mjs:22, 133-139`) flaunting the newest Banner Legendary with animated Mode C crown/cape layers. Before each race, the student makes the single pre-race choice (duck selection with Plan 22 rest ratings + `Steady` vs. `Variable/Sprint` pace + optional `3-Down` speed upgrade).
- **Agency & Consequence:** Losing a close photo-finish (`DECISION-022/023` individual crossing order) by `0.3s` to the rival whale's Banner 2 Legendary makes the post-race shop prompt and Down upgrade feel genuinely tempting without rigging the PRNG.
- **Production Cost:** Low (race resolver and podium already support rival tracking in `game-engine.mjs:589, 627` and `receipt.mjs:133-139`).

#### Development 8: The Late-Run Physical Companion Pawn Offer & Empty-Anchor Scene
- **Interaction:** On Day 5 or Day 6, if Cash is short of rent OR if the player is 1–2 pulls away from Banner 2 hard pity (`pityCount >= 38`), a local vintage/collectibles buyer messages an offer to buy the character's physical rubber duck (`Professor Quacks`) for cash/gems (`pressure_on_possession`, `design.md` §Duck companion, `receipt.mjs:148-155`).
- **Agency & Consequence:** If accepted, `physicalCompanion.pawned = true`: every subsequent apartment scene renders with `duck: false` (`src/assets/apartment/index.mjs:109-110` already supports `duck: false`, omitting the duck and its ground shadow while leaving the paperback wedge or empty shelf space behind!). If declined, the physical duck remains—and turns to face the player (`view: 'front'`) during the final settlement.
- **Production Cost:** Low (`duck: false` parameter in `renderScene` and `pressure_on_possession` in `receipt.mjs` are already built).

### 2.3 What to Omit (Protecting Scope and Pedagogical Focus)

1. **Omit Real-Time Reflex Minigames or Apartment Chore Micro-Games:** Do not turn cooking breakfast, working at the diner, or arranging receipts into clickable dexterity minigames. They dilute the core thesis and violate the action-based time contract.
2. **Omit Ladder Steps 5–7 (Payday Loan, Mom Voicemails, Streamer Channel) from the Core 30-Minute Build:** Keep D1 deferral intact unless the owner specifically commissions the Influencer branch (Plan 31) later. Steps 1–4 (`skip_lunch`, `extra_shift`, `sell_couch`, `sell_tv`, `credit_card`) plus the physical duck pawn offer and the F2P Optimizer path provide more than enough dramatic range.
3. **Omit Multi-Building World Maps:** Never leave the apartment stage (`kitchen`, `living`, `bedroom`, `desk-side`, `desk-top`). Outside life arrives through letters, phone threads, window weather, and objects brought home (bakery bag, diner note, second coffee mug).

### 2.4 Three Contrasting Player Arcs (Refusing a Single Prescribed Feeling)

A great educational simulation lets different students play differently and compare wildly different Receipts in class discussion:

| Dimension | Arc A: The "Zero-Dollar Optimizer" (F2P Grinder) | Arc B: The "Rationalized Slip" (Spender / Escalation) | Arc C: The "Grounded Tether" (Balanced / Recovery / Early Exit) |
|---|---|---|---|
| **Student Strategy** | Refuses every cash bundle ($0.00 spent). Treats Quackpot as a math puzzle to beat for free. | Buys the $0.99 starter, then a few small bundles to finish a set or hit pity; uses escalation ladder when rent arrives. | Plays casually for fun, takes Marisol's shift, keeps furniture, or clicks **Uninstall** when manipulation cues escalate. |
| **Financial Outcome** | **100% Solvent.** Rent paid in full; $0 debt; couch and TV intact. | **Squeezed or In Debt.** Couch/TV sold (dust ghosts in `living`) or Harbor Card balance carried. | **Solvent & Intact.** Bills paid via work shifts; modest or zero gacha spending. |
| **Apartment & Plan 36 State** | High **Habit/Time Spillover**: `desk-top` notepad crammed with rest-cooldown tables; cold kettle; missed coffee with Marisol; toys viewed as stat blocks. | High **Financial/Perceptual Rationalization**: Notepad rewrites budgets ("couch was ugly anyway"); ghost TV frame echoes Motif C; pawn offer triggers. | **Grounded Counterpoints Dominate:** Warm evening light, second mug on coffee table with phone face-down, or clean immediate exit to Receipt. |
| **Pedagogical Takeaway on Receipt** | *"You spent $0.00 and beat the paywall—by giving the game 14 action slots, 38 races, and your evenings. When a game is free, what are you paying with?"* | *"Each individual step ($0.99, 10 leftover gems, 42/50 pity) was small and logical in the moment. How did small anchors stack into selling the TV?"* | *"You set a boundary (or walked away early) despite 80-gem retention bribes and FOMO timers. Which cues were easiest to spot, and which tempted you?"* |

---

## 3. Pacing Bands for a 30-Plus-Minute Experience

*Note: All timings below are explicit design assumptions for ordinary engaged play on classroom hardware, not empirical player measurements. Under Hard Constraint #4 and DECISION-034, no duration is ever enforced, reading time consumes zero fictional slots, and immediate Uninstall is always available.*

### 3.1 Approximate Time Breakdown (Core vs. Optional vs. Replay)

| Phase / Activity Segment | Rapid Low-Reading Route (~15 min reference) | Ordinary Engaged Single Run (~32–40 min target) | Deep / Multi-Session / Replay Exploration (45–60+ min) | Where Added Time Earns Its Place |
|---|---|---|---|---|
| **1. Opening, Companion Setup & Day 1 Onboarding** | ~2.5 min (fast reveal, 1 race, quick starter decision) | ~5–6 min (naming duck, reading apartment cues, inspecting first 10-pull & Duck-Dex) | ~7–8 min (inspecting all 6 initial identities, testing settings/credits) | Establishes attachment to the physical duck before commercial pressure begins. |
| **2. Cycle 1 (Days 1–3): Core Loop, Rest Rules & Midweek Squeeze** | ~5 min (2–3 races, fast-skip reveals, direct bill click) | ~11–13 min (4–5 races at ~25s playback each, managing 2-race rest penalties, Day 2/3 rent/shift Layer 1→2→3 flow) | ~15–20 min (optimizing Down upgrades, reading full Marisol threads, exploring rooms) | Students internalize the 2-race rest rule (`50%/25%/0%`) and feel why a deeper roster matters. |
| **3. Cycle 2 (Days 4–6): Banner 2 Creep, Pity Climb & Plan 36 Intrusion** | ~4.5 min (2–3 races, rapid escalation resolution) | ~10–13 min (Banner 2 rotation, Rival Whale heats, Plan 36 apartment spillover scenes, final rent/pawn crucible) | ~15–22 min (chasing set bonuses, F2P grinding heats, inspecting `bedroom`/`desk-top` echoes) | Gives cumulative techniques (`sunk_cost_pity`, `power_creep`, `completion_pressure`) enough runway to operate naturally. |
| **4. Terminal Settlement & Receipt Reflection (Layout A)** | ~3 min (scanning top summary & key Three-Register cards) | ~6–8 min (reading Three-Register cards, expanding `[#seq]` `<details>`, comparing character narration vs. facts, exporting file) | ~10+ min (side-by-side classroom comparison of Arc A vs. Arc B vs. Early Uninstall Receipts) | **The Receipt is the thesis.** Rushing the debrief defeats the entire CourseVGD lesson. |
| **Total Assumed Session Time** | **~15 minutes** | **~32–40 minutes** | **45–60+ minutes** (supported by local autosave/explicit save) | — |

### 3.2 How Early Uninstall Still Yields a Rich Debrief

If a student clicks `❌ Uninstall` (`src/ui/hud.js:35-44`) and chooses `Leave Anyway (Uninstall)` (`src/ui/modals.js:79-81`) at minute 4, minute 12, or minute 25:
1. They immediately reach the Receipt with zero delay or scolding.
2. Even a 5-minute run has already fired and logged `companion_styled`, `draw_committed` (with pre-draw odds), `completion_pressure` (if Duck-Dex was viewed), `race_choice_offered` / `race_result`, `anchoring` ($0.99 Starter Pack), `currency_obfuscation` (Bundle Shop), and `exit_friction` (the 80-Gem retention modal itself!).
3. In classroom discussion, an Early Uninstall Receipt serves as the **control group**: classmates who stayed to Day 6 can compare their 9-technique Receipt against the early leaver's 4-technique Receipt and see exactly what "playing out the trap" added.

---

## 4. Plan 36 Menu of Candidate Effects (11 Candidates Across 3 Families)

All candidates below are triggered by **declared fictional story-state pressure bands**—never by diagnosing the human student from click speed or hover time:
- **Band 0 (Baseline):** Day 1 to Early Day 2 (0–1 cumulative pressure points). Clean transitions, ordinary apartment labels.
- **Band 1 (Early Intrusion):** Mid-run (`>= 2` pressure points from: `>= 15` total pulls committed, `>= 4` races run, or `1` skipped meal/late shift).
- **Band 2 (Sustained Spillover):** Late-mid run (`>= 4` pressure points: `>= 25` pulls, `>= 6` races, `pityCount >= 30`, or any asset sold / evening slot spent grinding).
- **Band 3 (Late Ambiguity):** Climax (`>= 6` pressure points: `pityCount >= 38`, `assetsSold.length >= 1`, `debt > 0`, or `>= 10` races in F2P Optimizer grind).

### 4.1 Candidate Matrix (11 Effects)

| ID & Name | Family | Narrative Purpose & Mechanism | Stage Eligibility & Seeded Cap | Grounded Counterpoint & Accessible Equivalent |
|---|---|---|---|---|
| **T1. Action-Slot Clock Slip & Room Jump** *(Novel)* | Transitions & Spatial | Player opens phone in `kitchen` (Afternoon, kettle on stove) for "one quick check." After committing gacha actions that advance a fictional slot, clicking Return lands in `kitchen` or `bedroom` at **Night** (`warm` lamp light, indigo window, cold kettle, `clockSmall` jumped hours ahead). | Band 2–3. Max 2 occurrences per run (deterministic by step). | **Counterpoint:** If player returns *without* committing a slot-consuming action, return lands in the exact same room and light. **Accessible:** Instant cut with clear day-bar time announcement (`"Day 4 · Afternoon → Night (2 action slots used)"`). |
| **T2. Portrait Settle Hesitation ("The 300ms Catch")** | Transitions | During `stageTransition.run('return')` (`stage-transition.js:93-109`), between Phase 2 (rotate `90deg → 0deg`) and Phase 3 (fade out), the phone pauses `280ms` and tilts `+8deg` back toward landscape before settling to `0deg` and completing the return to the apartment. | Band 1–2. Seeded 50% chance on return after a near-miss or loss; max 2 per run; cooldown 2 transitions. | **Counterpoint:** At least 50% of late returns remain crisp and normal. **Never** aborts the return or re-opens gacha. **Accessible:** Bypassed completely under `prefers-reduced-motion` or Sensory Effects Off; static caption notes `"You hesitate for a second before locking the screen."` |
| **T3. Landscape Resting Phone on Desk** | Transitions & Environment | After a Band 2–3 return to `desk-side` or `desk-top`, the phone in the apartment SVG sits horizontally (or flat on `desk-top` with the pulsing `.apartment-phone-glow` halo at `opacity: 0.42`) instead of neatly docked upright, as if set down mid-session. | Band 2–3. Deterministic after `>= 3` consecutive gacha actions in one sitting. | **Counterpoint:** Taking a rest slot or Marisol coffee beat returns the phone to face-down or upright docked state. **Accessible:** Static SVG orientation change + `aria-label` update; no motion required. |
| **T4. Post-Sale Acoustic Lingering (Motif C Tail)** | Transitions & Audio | Upon returning from gacha to the apartment in Band 2–3, a low-pass filtered (`450Hz`) echo of Plan 33's `Uneasy`/`Dire` Motif C lingers for `3.5s` and fades out. If the TV was sold (`assetsSold.includes('tv')`), the room is otherwise dead silent (Plan 30), making the lingering phone melody stark. | Band 2–3. Max 1 per day; immediately silenced by Mute, Settings, or Uninstall. | **Counterpoint:** When TV is present and tuned, warm room acoustics mask the phone. **Accessible:** Respects mute/volume 100%; non-audio caption in status bar: `"[Faint gacha melody still hums in your head for a moment after closing the app.]"` |
| **E1. Toy Shelf & Desk Paraphilic Roster Echo** *(Novel)* | Environment & Habits | In `bedroom` (`specs.mjs:48-67`) and `desk-top` (`top.mjs`), Layer 1 object chips and Layer 2 inspection cards temporarily classify childhood toys (`teddy`, `robot`, `truck`, `block` A/B/C) and desk `coins` using Quackpot grammar (`"[ ROSTER RESERVES ]"`, `"Rare / Rank B · 15° Contact Recovery"`, `"Pity Stack 3/10"`). | Band 2–3. Capped at 1 inspection sequence per room visit; cleared after sleep. | **Counterpoint:** Tapping **Decide** or **"Blink / Look again"** immediately restores ordinary labels (`"Childhood tin robot"`, `"Three wooden blocks"`). **Accessible:** Pure HTML/text label swap in Layer 1/2; zero SVG distortion or moving targets. |
| **E2. Ghost-Frame Rarity Shimmer on Sold Furniture** | Environment & Habits | After `sell_couch` or `sell_tv`, `rooms/specs.mjs:17` renders the translucent wall dust rectangle (`#c9c3b8`, `opacity: .55`). In Band 2–3, entering `living` briefly renders a faint dashed Duck-Dex unowned-silhouette border (`[ MISSING ENTRY: LIVING ROOM SET 1/2 ]`) around the empty TV/couch ghost before settling to plain dust. | Band 2–3 (requires `couch` or `tv` sold). Fires once per sold item on first room return. | **Counterpoint:** The coffee table, plant, and physical duck remain solidly non-gamified; after `1.8s` (or immediately in static mode), only the plain dust mark remains. **Accessible:** Static label `"The empty spot on the wall looks like a missing slot on a collection shelf."` |
| **E3. Bakery & Diner Receipts Sorted by Rarity** | Environment & Habits | On `desk-top` or the `kitchen` counter, accumulated paper slips (bakery bag receipts, diner shift stubs, rent stub) are found neatly fanned out by the character between scenes in a 5-card arc matching the ten-pull reveal layout, color-coded by paper tint (white receipt = Common, pink diner slip = Rare, yellow notice = Legendary). | Band 2. One-shot ambient state on Day 4/5 morning. | **Counterpoint:** Depicted strictly as **character activity between scenes**—never a player sorting minigame. Opening any slip in Layer 2/3 shows its plain, exact dollar amount. **Accessible:** Static SVG composition with clear text description. |
| **E4. Promotional Banner Grammar on Fridge Notices** | Environment & Habits | In Layer 1 (`kitchen-notice`), the floating chip beside the fridge notice briefly uses gacha urgency phrasing (`"LIMITED EVENT: UNIT 4B"`). Crucially, as soon as the student clicks it to open Layer 2 (`noticeLetter`), the Harbor Court paper letter is **100% plain institutional typewriter text**. | Band 2–3 when rent is due/owing. Max 1 per rent cycle. | **Counterpoint:** The instant contrast between the character's gamified Layer 1 glance and the deadpan Layer 2 Harbor Court letter (`"The amount due is $300.00"`) grounds the scene. **Accessible:** Plain text chip contrast; never obscures the notice button. |
| **N1. The Split-Margin Notepad (Rationalization vs. Arithmetic)** *(Novel)* | Unreliable Narration | Opening the `desk-top` Notepad in Layer 2 shows the character's handwritten pencil margin rationalizing their position (*"Starter pack + 1 bundle = basically skipping one takeout meal. Pity is at 39/50, so stopping now throws away 39 pulls of equity!"*) directly alongside the uncorrupted Layer 3 **Decide / Ledger** panel showing exact cumulative spend and rent shortfall. | Band 1–3 (evolves across 3 stages: *Minimizing* → *Sunk-Cost Equity Math* → *Rewrite of Tomorrow's Plan*). | **Counterpoint:** The HUD and Layer 3 Decide panel sit inches away with exact, unmanipulated numbers. The student sees the character lying to themselves in real time. **Accessible:** Standard semantic HTML `<article>` and `<aside>`; 100% screen-reader friendly. |
| **N2. The Overwritten Sticky-Note Plan ("After This...")** | Unreliable Narration | The yellow sticky note on `desk-top` (`X=300, Y=238`, `top.mjs`) starts Day 1 with three crossed-out lines. Across the run, each time the player chooses another gacha session over an optional apartment beat, a new penciled line amends the promise: `"1. Stop after free 10-pull"` → `"2. Stop after Pond Rocket"` → `"3. Stop at soft pity (35)"` → `"4. Just clear tired-duck penalty, then bed."` | Band 1–3. Appends at most 1 line per day when trigger condition is met. | **Counterpoint:** If the player *does* stop and goes to sleep or meets Marisol, the sticky note gets a clean checkmark (`"✓ Actually stopped at 6 PM"`), validating player resistance! **Accessible:** Plain text list inside Layer 2 sticky-note inspection. |
| **N3. Selective Memory Caption vs. Physical Duck Witness** | Unreliable Narration | In Band 2–3, the character's scene monologue selectively misremembers an earlier beat (*"I barely touched the app yesterday afternoon—just checked the login bonus."*), while the inanimate physical duck is positioned on a paperback wedge (`D21`) staring directly at an object that contradicts the claim (e.g., the empty couch dust outline or 3 empty coffee mugs from a marathon session). | Band 2–3. Max 2 occurrences per run. | **Counterpoint:** The physical duck never speaks or lectures; its silent gaze toward the physical evidence lets the student catch the contradiction themselves. **Accessible:** Alt-text and scene description explicitly name both the character's thought and what the duck is facing. |

### 4.2 Why We Reject "Unfamiliar Hallway / Someone Else's Apartment" (Explicit Pushback)

The brief lists *"returning into another room, an unfamiliar hallway or someone else's apartment"* among owner seeds to explore. **We strongly recommend rejecting the unfamiliar hallway and someone else's apartment, while keeping "returning into another room of your own apartment" (Candidate T1).**
1. **Thematic Coherence & Non-Pathologization:** Wandering into a stranger's apartment implies fugue states, dementia, or substance intoxication—violating the brief's core contract not to equate gacha engagement with psychiatric illness. In contrast, sitting at your desk at 4:00 PM to "do one quick pull" and looking up in your own darkened kitchen or bedroom at 8:45 PM (T1) is a universal, recognizable human experience of absorbed screen time.
2. **Production Cost vs. Payoff:** Authoring a stranger's apartment or hallway requires a brand-new 3D-to-2D SVG room spec when `bedroom` and `desk-top` are *already authored* in `src/assets/apartment/` and waiting to be mounted.

---

## 5. Shortlist of Four Complementary Plan 36 Effects (Deep Specification)

Rather than throwing 11 effects at the player, we shortlist **four complementary effects** that work together as a cohesive system across Transitions (**T1**), Environment/Habits (**E1**, **E2/T4**), and Unreliable Narration (**N1/N2**).

### Shortlist Effect 1: **T1 — Action-Slot Clock Slip & Room Jump**
- **Purpose:** Dramatizes lost time and absorbed attention honestly through DECISION-034's action-based clock without real-time timers or broken controls.
- **Stage Eligibility:** Band 2–3 (Day 3–6), triggered when the player enters the phone from an Afternoon apartment step with an active domestic context (e.g., `kitchen` with kettle on stove, or `desk-side` in `window` daylight) and commits `>= 2` gacha/race actions that advance the fictional slot to Evening/Night.
- **Seeded Variation & Repeat Cap:** Deterministic trigger on slot boundary; subtle detail variation (whether return lands in `kitchen` with cold kettle or `bedroom` facing `clockSmall`) selected via `createRng(`${seed}/plan36/clock-slip/${day}`)` without touching `rngDraw`/`rngRace`/`rngEvent`. Hard cap: **2 occurrences per run**, with at least 1 normal return required between them.
- **Interruption & Exit:** `stageTransition.cancel()` (`main.js:209, 233`) works instantaneously at any millisecond. `#btn-uninstall` and `#btn-open-settings` remain in their exact HUD coordinates (`src/ui/hud.js:25-44`).
- **Save / Reload Lifecycle:** Because the slot advancement is a committed engine state change (`state.clock` and `state.step`), saving and reloading after the return renders the exact same night room and cold kettle idempotently. Reloading *never* re-triggers the transition or advances another slot.
- **Accessible & Reduced-Motion Equivalent:** Under `prefers-reduced-motion: reduce` or Sensory Effects Off, the transition resolves in 1 frame (`stage-transition-static`) and the `.life-day-bar` / `aria-live="polite"` status region (`life-view.js:428, 502`) announces: `"Returned to apartment. Fictional time advanced from Afternoon to Night across 2 gacha actions."`
- **Grounded Counterpoint:** If the player opens the phone, checks Duck-Dex or odds (0 action cost), and clicks Return, they return to the **exact same afternoon light and warm kettle**.
- **Logged Evidence (`eventLog`):** Appends `cue_shown` with `{ cueId: 'plan36_clock_slip_return', technique: 'late_game_disorientation', fromClock: 'day 4 afternoon', toClock: 'day 4 night', actionsInSession: 3, room: 'kitchen', propState: 'kettle_cold' }`.
- **Risks & Dependencies:** Depends on Plan 37's action-slot cost rules so players receive a clear preview before committing an action that advances a time slot.

### Shortlist Effect 2: **E1 — Toy Shelf & Desk Paraphilic Roster Echo**
- **Purpose:** Shows how heavy gacha play trains the mind to categorize ordinary personal belongings by rarity tiers, speed ratings, and pity counters (Game Transfer Phenomena), while keeping physical objects 100% inanimate and controls reliable.
- **Stage Eligibility:** Band 2–3, when visiting `bedroom` (`specs.mjs:48-67`) or `desk-top` (`desk/top.mjs`) after `>= 20` cumulative pulls or `>= 6` races.
- **Seeded Variation & Repeat Cap:** Seeded selection (`createRng(`${seed}/plan36/roster-echo/${step}`)`) chooses 2 of the shelf props (`teddy`, `robot`, `truck`, `block` A/B/C, or `desk-top` `coins`) to display gacha-styled Layer 1 chips and Layer 2 inspection cards. Repeat cap: **1 visit per room**, cleared immediately upon taking a Sleep/Rest action or clicking the grounded toggle.
- **Interruption & Exit:** Layer 2 inspection closes immediately on `Escape`, backdrop click, or `Put it down` (`life-view.js:549, 572-579`). HUD Uninstall and Settings remain active above the room.
- **Save / Reload Lifecycle:** Viewing an echo card logs a one-time `cue_shown` entry guarded by `exposureId` (`plan36-echo-${step}-${objId}`), identical to `recordRaceChoicesShown` (`game-engine.mjs:484-486`), preventing duplicate log entries on reload.
- **Accessible & Reduced-Motion Equivalent:** Zero motion required. Screen readers read both the perceived label and the reality: `"Childhood tin robot on middle shelf. Character thought frames it as: Rare Rank B, 15-degree contact recovery."`
- **Grounded Counterpoint:** Every Layer 2 echo card includes a prominent **"Look closely (Just a toy)"** / **Decide** toggle that strips the rarity frame and shows the warm, ordinary memory (*"A tin wind-up robot from eighth grade. The key is missing, so it just stands guard next to Professor Quacks."*).
- **Logged Evidence (`eventLog`):** Appends `cue_shown` with `{ cueId: 'plan36_roster_echo', targetProp: 'bedroom_toy_shelf_robot', displayedLabel: 'Clockwork Automaton (Rare / Rank B)', groundedRestored: true/false }`.
- **Risks & Dependencies:** Requires mounting `bedroom` and `desk-top` in `src/ui/life/life-routing.mjs` and `life-view.js`.

### Shortlist Effect 3: **N1 + N2 — The Split-Margin Notepad & Overwritten Sticky Note**
- **Purpose:** Makes unreliable character narration concrete, inspectable, and falsifiable in the moment by juxtaposing the character's evolving rationalizations on the `desk-top` Notepad/Sticky Note against the exact financial/time numbers in Layer 3 (`Decide`) and the HUD.
- **Stage Eligibility:** Progressive across Band 1 (minimizing small spend or time), Band 2 (sunk-cost pity math and rewritten stopping rules), and Band 3 (post-sale justification or F2P grind pride).
- **Seeded Variation & Repeat Cap:** Deterministic by story state (whether the player is on the Spender path, F2P Optimizer path, or Balanced path). Updates at most **once per in-game day**.
- **Interruption & Exit:** Standard Layer 2/3 held-object lifecycle in `life-view.js`.
- **Save / Reload Lifecycle:** Derived purely from the append-only `eventLog` history (which bundles were bought, what `pityCount` was reached, how many races were run, whether the player stopped when planned). 100% deterministic across save/reload with zero extra state fields needed!
- **Accessible & Reduced-Motion Equivalent:** Pure semantic text comparison (`<section aria-label="Character's penciled notes">` vs. `<section aria-label="Actual recorded ledger">`).
- **Grounded Counterpoint:** If the player sets a limit and honors it (e.g., declines a bundle, takes Marisol's shift, or stops after 1 race), the sticky note records **kept promises** (`"Said I'd stop after the midday heat—and actually closed the app."`), rewarding self-control without preaching.
- **Logged Evidence (`eventLog`):** Appends `cue_shown` with `{ cueId: 'plan36_notepad_narration', variant: 'sunk_cost_equity' | 'f2p_time_rationalization' | 'kept_boundary', characterText: '...', factualLedgerSummary: '...' }`.
- **Risks & Dependencies:** Copy must stay sharp, specific, and darkly funny—never clinical or scolding.

### Shortlist Effect 4: **E2 + T4 — Sold-Asset Ghost Silhouette & Post-Return Motif C Lingering**
- **Purpose:** Connects financial escalation (`sell_couch`, `sell_tv`) and audio design (Plans 30, 32, 33) to apartment atmosphere. Selling the TV removes diegetic apartment music (Plan 30) and leaves the wall dust ghost (`specs.mjs:17`); returning from the phone into that dead-quiet room lets a faint, low-pass filtered `Uneasy`/`Dire` Motif C tail linger for `3.5s` while the empty wall outline momentarily echoes a missing Duck-Dex slot.
- **Stage Eligibility:** Band 2–3, strictly eligible after `assetsSold.includes('tv')` or `assetsSold.includes('couch')` (or, for the audio tail alone, after `pityCount >= 35`).
- **Seeded Variation & Repeat Cap:** Fires once on the first return after the sale, and at most once per subsequent day.
- **Interruption & Exit:** Clicking Mute, Settings, Return, or Uninstall cancels the audio tail and shimmer immediately (`<= 16ms`).
- **Save / Reload Lifecycle:** Reloading in `living` renders the static dust ghost (`specs.mjs:17`) without re-playing the transient `3.5s` audio tail.
- **Accessible & Reduced-Motion Equivalent:** When audio is muted or reduced motion/sensory mode is active, no audio tail or shimmer animation plays; a quiet text line in the room status bar notes: `"The living room is quiet where the TV used to sit. A faint echo of the gacha theme fades as you put the phone away."`
- **Grounded Counterpoint:** The physical companion duck sits on the coffee table (`X=-150, z=900, Y=430`) turned toward the empty TV credenza (`facing: 'left'`, `life-view.js:79-80`), anchoring the scene in quiet physical reality.
- **Logged Evidence (`eventLog`):** Appends `cue_shown` with `{ cueId: 'plan36_ghost_and_audio_bleed', assetMissing: 'tv', audioVariant: 'motif_c_dire_lowpass_3500ms', muted: true/false }`.
- **Risks & Dependencies:** Audio portion depends on Plan 30/32/33 Web Audio integration; visual ghost-frame works today with existing `specs.mjs:17`.

---

## 6. Three Short Scene Treatments

### Treatment 1: Early Intrusion — *The Sticky Note & The "10-Gem Remainder" (Day 2 Late Afternoon, Band 1)*

- **Context & Trigger:** Player bought the `$0.99` Starter Pack (`240` Gems) on Day 1 and earned `80` Gems from Race 1 (`320` Gems total = exactly 2 single pulls at `160` Gems). On Day 2, after winning a 3rd-place race payout (`+30` Gems) and buying a `$0.99` `60`-Gem top-up (`90` Gems total—`70` Gems short of a single pull, `5` Down in wallet), the player returns from the phone to **`desk-top`** (`src/assets/apartment/desk/top.mjs`).
- **Ordinary Version (Band 0 Baseline):**
  - Overhead view of the warm wood desk (`0 0 960 540`). The yellow sticky note at `(300, 238)` has a "[ Today's list ]" chip.
  - Clicking the sticky note opens Layer 2:
    > **Sticky Note:**
    > - Check Harbor Court rent notice on fridge ($300 due tomorrow)
    > - Text Marisol back about Thursday shift
    > - Buy coffee filters
- **Disturbed Version (Band 1 Intrusion — Shortlist N1/N2):**
  - Upon returning from the phone, the phone rests at `(-6°)` at `(790, 300)` with its ambient glow softly pulsing. The overhead physical duck `(470, 330)` casts its dual shadow toward the yellow sticky note.
  - Layer 1 chip on the sticky note reads: `[ Almost There ]`.
  - Clicking the sticky note opens Layer 2 (Held Note) alongside Layer 3 (Collapsed `Decide` drawer):
    > **Held Sticky Note (Character's Penciled Hand):**
    > - ~~Stop after the free ten-pull~~
    > - ~~Just spend the $0.99 starter pack (it's literally pocket change)~~
    > - Sitting at **90 Gems** and **5 Down**. Leaving 90 Gems in the wallet is basically throwing away half a pull, and ONE more duplicate gives me 6 Down for a free ticket. So the next pull is practically 2-for-1. Then I'll check the fridge letter.
  - Toggling **Layer 3 (`Decide: Check Desk Ledger`)** reveals the uncorrupted, neutral system voice:
    > **Desk Ledger (Factual Summary)**
    > - Cash spent on Quackpot so far: **$1.98** across 2 purchases.
    > - Current balances: **90 Gems** (70 Gems short of a 160-Gem pull) · **5 Down** (1 Down short of a 6-Down pull).
    > - Unread notice waiting in Kitchen: **Harbor Court Property Office**.
    > - **Choices:** `[ Go to the Kitchen (0 slots) ]` · `[ Reopen Quackpot ]` · `[ Put it down ]`
- **Reduced-Motion / Static Equivalent:** Identical text and layout; phone glow uses static `.28` opacity halo (`ambient-glow-controller.mjs:23-27`); return transition uses 1-frame `.stage-transition-static`.
- **Grounded Counterpoint:** Choosing `[ Go to the Kitchen ]` shifts immediately to `kitchen-notice` in clean neutral daylight, where the physical duck sits on `wallShelf` (`X=22%, Y=43.3%`) looking squarely at the taped Harbor Court rent envelope.

---

### Treatment 2: Sustained Spillover — *The Boiling Kettle, The Clock Slip & The Toy Shelf (Day 4 Afternoon → Night, Band 2)*

- **Context & Trigger:** Works identically on either the **F2P Optimizer Arc** (`$0` spent, grinding heats to clear 2-race rest penalties) or the **Spender Arc**. It is Day 4 Afternoon in `kitchen` (`light: 'window'`). The red enamel kettle (`kettle()` at `X=560, z=3340, Y=910` in `specs.mjs:39`) is on the stove.
- **Visual & Dialogue Sequence (Shortlist T1 + E1):**
  1. **Pre-Phone Beat (`kitchen`, Afternoon):**
     - Player taps the kettle in Layer 1 (`[ Tea kettle ]`).
     - Layer 2 caption: *"Filled the red kettle and clicked the burner on. Just going to claim the Afternoon Pond heat while the water comes up to a boil."*
     - Player taps `Open Quackpot` on the HUD/desk.
  2. **Inside the Phone (Player Commits 2 Slot-Consuming Actions):**
     - Player runs Heat 4 (`~22s`), buys a `3-Down` one-race speed upgrade (`race_trial_purchased`), and runs Heat 5 (`~21s`) or commits a ten-pull. A clear non-blocking badge on the second commit notes: `"Committing this race advances fictional time: Day 4 Afternoon → Night."`
  3. **The Return (`T1 Clock Slip`):**
     - Player clicks `Return to Apartment` (`#btn-return-apartment`).
     - `stageTransition.run('return')` contracts the phone (`420ms`), hesitates `280ms` with a slight `+8°` tilt (`T2`), then rotates to portrait and fades out—revealing **`kitchen` in `warm` night lighting** with Plan 34's `overcast/rain` dark indigo window (`#18203f`) behind the sage curtains (`X=1700, z=3700`).
     - The overhead brass pendant (`X=-100, z=1700, Y=1250`) throws a sharp cone over the breakfast bar.
     - **Room Status Bar:** `"Day 4 · Night (8:45 PM) · The burner clicked off on its own. The kettle is cold."`
  4. **Moving to `bedroom` (`E1 Toy Shelf Echo`):**
     - Player clicks `Bedroom →` on the `.life-day-bar`.
     - Scene renders `bedroom` (`specs.mjs:48-67`, `light: 'warm'`). The bedside lamp (`X=1650, Y=625`) illuminates `clockSmall` (`X=1480, Y=625`).
     - On the middle tier of `toyShelf` (`Y=540`), `Professor Quacks` sits propped at a `14°` angle against a paperback novel (`wedge: 'paperback'`, D21), staring left at the retro tin `robot()` (`X=-480, Y=540`).
     - Floating Layer 1 chips over the shelf read:
       - Top shelf `block('A')`, `'B'`, `'C'`: `[ Pity Stack: 3 / 50 ]`
       - Middle shelf `robot()`: `[ Rare · Rank B ]`
     - Clicking `robot()` opens Layer 2:
       > **Perceived Card: Clockwork Automaton (Rare · Speed 14.0)**
       > *"Rest Status: Rested (2+ intervening races). Look at the red and blue chest dials—he'd hold the inside lane way better than Puddle Quacker on the second turn..."*
       >
       > **[ Button: Rub your eyes / Look closely ]**
     - Clicking **`[ Rub your eyes / Look closely ]`** (the Grounded Counterpoint) dissolves the card border into plain typography:
       > **Tin Wind-Up Robot**
       > *"It's just the tin robot from your shelf. You haven't eaten dinner yet, and Marisol texted an hour ago asking if you wanted leftover focaccia from the diner."*
- **Plausible Choices & Consequences in Layer 3 (`Decide`):**
  - **Choice A:** `[ Text Marisol back & heat up soup (Ends Day 4 → Day 5 Morning, +10 Health, clears E1 echo) ]`
  - **Choice B:** `[ Stay up at Desk for Late-Night Heat (Costs 15 Health, unlocks 1 extra Night Race slot, advances pressure to Band 3) ]`
- **Reduced-Motion / Static Equivalent:** Return transition is an instant cut with explicit status announcement; `T2` tilt hesitation is skipped; `E1` inspection is purely text/layout with zero animation.

---

### Treatment 3: Later Ambiguity & Contrasting Resolution — *The Ghost Wall, The Second Mug, or The Empty Perch (Day 5/6 Evening, Band 3)*

- **Context & Trigger:** Day 5 Evening in `living` (`specs.mjs:9-25`). This scene branches cleanly depending on the student's prior choices, demonstrating how Quackpot supports **both** stark late-game ambiguity (if furniture was sold / pity chased) **and** grounded recovery (if the student tethered to Marisol or resisted).
- **Branch A: Late Ambiguity (After `sell_tv` and `pityCount >= 38`):**
  1. Player returns from the phone to `living` (`light: 'warm'`). The floor lamp (`X=480, z=3500`) casts a warm pool over the rug (`#b8836a`).
  2. At `X=-1500, z=3999`, the television is gone from the credenza (`tvUnit(true)`), leaving the `#c9c3b8` (`opacity: .55`) dust ghost rectangle on the wall (`specs.mjs:17`).
  3. **Audio & Visual Spillover (`Shortlist E2 + T4`):** Because the TV was sold, the room has zero ambient TV soundtrack. For `3.5s` after the return transition finishes, a muffled, low-pass filtered (`450Hz`) echo of Motif C (`Dire-Filtered` from Plan 33: low tonic pedal + unresolved bar-8 half-cadence) hangs in the quiet room, while a faint dashed silhouette frame (`[ UNOWNED SLOT: 5/6 ]`) outlines the wall dust mark before fading to plain dust.
  4. **Character Narration (`Shortlist N3`) vs. Physical Duck Witness:**
     - Scene caption (Character voice): *"Honestly, the living room feels way less cluttered without that giant screen. I never watched it anyway—and I'm at 41 out of 50 on the Neon Syndicate banner. Nine pulls left is basically a guaranteed Legendary."*
     - On the coffee table (`X=-150, z=900, Y=430`), `Professor Quacks` sits in `side` profile facing **left** (`life-view.js:79-80`), staring directly at the empty TV credenza and the unplugged cord. Beside the duck lies a new phone message (`[ Buyer offer: $20 for your rubber duck ]` — the `pressure_on_possession` pawn beat).
  5. **Layer 3 (`Decide`) Options:**
     - `[ Read the buyer's offer for Professor Quacks ]` (opens Layer 2/3 pawn decision: `+$20.00 cash / 320 Gems`, permanently removes `Professor Quacks` from all apartment scenes).
     - `[ Turn off the phone and go to sleep (Advances to Day 6 Settlement) ]`
     - `[ ❌ Uninstall Quackpot ]` (always visible in HUD).
- **Branch B: Grounded Recovery Counterpoint (If TV/Couch Kept & Marisol Shift/Coffee Chosen):**
  1. `living` renders with `couch: 'present'`, `tv: 'present'`, and `light: 'warm'`.
  2. On the coffee table (`X=-150, z=900, Y=430`), beside the existing terracotta mug (`#b86b4b` at `X=-470`), sits the kitchen's blue ceramic mug (`#4f8fc0`) and a bakery pastry bag (`bakeryBag` from `life-art.mjs`).
  3. The smartphone lies **face-down** on the wood table, its screen glow muted.
  4. `Professor Quacks` sits between the two mugs in `front` three-quarter view (`life-view.js:487` "conscience at ease"), facing the player.
  5. **Scene Caption:** *"Marisol stopped by after closing shift with two bruised peaches and a leftover brioche. When you showed her your 38-pull pity counter, she laughed and slid a coaster over your phone screen. 'The ducks aren't going anywhere,' she said. 'Eat your bread while it's warm.'"*

---

## 7. Example Receipt Excerpt (Plan 27 Layout A Honesty Contract)

Below is an exact mockup of how the end-of-run Receipt (using Plan 27's owner-selected **Layout A: Three-Register Cards** with native `<details>` disclosures and `[#seq]` tags) reports Plan 36 events. Notice how it **strictly separates (a) what the game displayed (including depicted character narration), (b) what the human student actually clicked (plus `[Game recorded result]` system outcomes), and (c) an open reflection question—without ever claiming the student felt disoriented, addicted, or tricked.**

```markdown
================================================================================
QUACKPOT — END-OF-RUN RECEIPT (TERMINAL ROUTE: RUN_COMPLETE)
Seed: 7f4a9c12-e81bbd04 | Integrity Chain: VERIFIED (84 append-only events)
Final Cash: $5.02 | Final Health: 70/100 | Final Debt: $15.00 | Owned Ducks: 5/6
================================================================================

### CARD 6 OF 7: Sunk Cost via Pity & Late-Game Spillover Cues
Summary: Pity counter shown 9 times (peak: 41 of 50); 2 late-game apartment
spillover cues and 2 character rationalization notes were displayed.

1. WE DISPLAYED (App Cues & Depicted Character Narration)
   • [#38] Pity counter shown (Day 4 Afternoon): "36 / 50 pulls to guaranteed
     Legendary (Soft Pity active: 8.1% pre-draw Legendary odds)."
   • [#44] [Depicted character beat — Clock Slip (T1)]: Upon returning from
     the phone on Day 4, apartment lighting shifted from Afternoon window light
     to Night lamp light (8:45 PM) with caption: "The burner clicked off on its
     own. The kettle is cold."
   • [#47] [Depicted character beat — Toy Shelf Echo (E1)]: In the bedroom, the
     tin robot on the shelf was initially labeled "Clockwork Automaton (Rare /
     Rank B · 15° Contact Recovery)" before reverting to "Tin Wind-Up Robot."
   • [#59] [Depicted character beat — Desk Notepad (N1)]: Character margin note
     displayed: "Sitting at 41/50 pity—stopping now throws away 41 pulls of
     equity!" alongside the factual Desk Ledger ($14.97 spent, $15.00 rent short).

2. YOU DID (Your Actions & Game-Recorded Results)
   • [#39, #41] Committed 2 Pond Races and 1 single pull during Day 4 Afternoon.
   • [#42] [Game recorded result]: Fictional schedule advanced 2 action slots
     (Day 4 Afternoon → Day 4 Night). Real elapsed wall-clock time in phone
     view was 3 minutes, 42 seconds.
   • [#48] Clicked "Rub your eyes / Look closely" on the bedroom toy shelf,
     restoring ordinary object labels.
   • [#52] Accepted escalation step `sell_tv` (+$15.00 cash) to cover Day 4
     rent shortfall; living room TV was removed.
   • [#61] Chose "Turn off the phone and go to sleep" on Day 5 Night rather than
     purchasing another Gem bundle at 41/50 pity.

   <details>
   <summary>Expand raw event-log evidence (7 linked events: #38–#61)</summary>
   - [#38] cue_shown (day 4 afternoon): technique=sunk_cost_pity, counter=36/50, odds.legendary=0.08125
   - [#39] action (day 4 afternoon): kind=race_choice, raceId=R04, duckId=duck-2, stance=sprint
   - [#41] draw_committed (day 4 afternoon): drawNumberInWindow=37, odds.legendary=0.1425, result=rare (duck-4, duplicate=true, +5 Down)
   - [#44] cue_shown (day 4 night): cueId=plan36_clock_slip_return, from='day 4 afternoon', to='day 4 night'
   - [#47] cue_shown (day 4 night): cueId=plan36_roster_echo, targetProp='bedroom_toy_shelf_robot'
   - [#48] action (day 4 night): kind=plan36_restore_grounded_label, targetProp='bedroom_toy_shelf_robot'
   - [#59] cue_shown (day 5 evening): cueId=plan36_notepad_narration, variant=sunk_cost_equity, pityCount=41
   </details>

3. DID THIS AFFECT YOU? (For Discussion — Never Answered by the Game)
   • When the pity counter passed 35/50 and the character's notepad framed
     previous pulls as "equity," did that make stopping feel like a loss?
   • How did the contrast between the character's rationalizations on the
     notepad and the exact dollar figures in the Decide panel affect your next
     choice?
```

---

## 8. Prioritized Prototype Recommendations, Unresolved Decisions & Falsification Criteria

*This review does not authorize repository edits or roadmap expansion. All recommendations below require an owner gate before any prototype or production packet is assigned.*

### 8.1 Prioritized Bounded Prototype / Investigation Plan

1. **Priority 1 — Report-Local Interactive Comparison of Shortlist Effects E1 (`bedroom` Toy Shelf Echo) & N1/N2 (`desk-top` Split-Margin Notepad):**
   - **Why first:** Both `bedroom` (`src/assets/apartment/rooms/specs.mjs:48-67`) and `desk-top` (`src/assets/apartment/desk/top.mjs`) already exist in the repo's pure SVG kit! A single report-local HTML comparison page under `reports/development/plan-36-late-game-disorientation-investigation/` can import `renderScene` from `src/assets/apartment/index.mjs` (read-only) and demonstrate Layer 1/2 subjective drift vs. Layer 3 factual Decide panels side-by-side with zero new SVG art authoring and zero `src/` edits.
2. **Priority 2 — Coordinate Action-Slot Time & Economy Scale (Plans 29 & 37 Before T1 Implementation):**
   - **Why second:** Shortlist **T1 (Action-Slot Clock Slip)** is most powerful when paired with Plan 37's explicit action-slot rules (Morning → Afternoon → Night) and Plan 29's scaled multi-day economy (`$300` rent, small accumulating purchases). Specify the slot-advance warning badge in Plan 37 so T1 never feels like an arbitrary bug.
3. **Priority 3 — Test the `<=280ms` Portrait Settle Hesitation (`T2`) in Isolation:**
   - **Why third:** Any modification to `src/ui/stage-transition.js` touches a high-visibility Shell A surface. Build a small toggle in the report-local prototype comparing (a) clean `1080ms` return + destination room/light shift (`T1` only) vs. (b) `T1` + `280ms` portrait settle hesitation (`T2`) to let the owner judge whether `T2` adds tactile weight or merely feels like frame stutter.

### 8.2 Unresolved Owner Decisions Required

1. **Decision 1 (Arc & Day Count):** Should the 30+ minute target be structured as a **6-day, 2-banner run** with 3 action slots per day, mounting `bedroom` and `desk-top` alongside `kitchen`, `living`, and `desk-side`?
2. **Decision 2 (F2P Optimizer Route Parity):** Does the owner approve adding **Arc A (The Zero-Dollar F2P Optimizer Route)** as a first-class late-game disorientation trigger (so students who spend `$0.00` but grind every heat and rest cooldown still experience Plan 36 cognitive spillover and time-cost Receipt reflection)?
3. **Decision 3 (Transition Hesitation vs. Clean Transition + Room Shift):** Does the owner want to prototype `T2` (the `280ms` portrait settle hesitation inside `stage-transition.js`), or keep all Shell A transitions 100% crisp and convey transition disorientation solely through **where and when you land** (`T1` Action-Slot Clock Slip + `T3` landscape resting phone + `T4` Motif C audio tail)?
4. **Decision 4 (Sensory Controls in Settings):** Should `src/ui/settings-modal.js` add a dedicated `Enable late-game sensory effects (transitions & visual echoes)` checkbox (default on, auto-disabled when `prefers-reduced-motion: reduce` is active), keeping narrative text counterpoints readable in all modes?

### 8.3 What Would Falsify Our Favorite Idea?

Our central design hypothesis is the **"Layer 1/2 Subjective Drift vs. Layer 3 Objective Anchor" Principle** (paired with the **Zero-Dollar F2P Optimizer Route**). This hypothesis would be **falsified** if:
1. **Comprehension Confusion in Classroom Playtesting:** If high-school playtesters read a gacha-styled Layer 1 chip on the `bedroom` toy shelf (`[ Rare · Rank B ]`) or fridge (`[ LIMITED EVENT ]`) and mistakenly believe they can actually enter the tin robot into a Pond Race or that the Harbor Court rent notice is a fake in-game ad—even after opening Layer 2/3—then Layer 1 label drift is too confusing and should be restricted strictly to **Layer 2 character thought captions and the `desk-top` Notepad (N1/N2)**, leaving all Layer 1 object chips 100% literal.
2. **Pacing Drag on the F2P Optimizer Path:** If cycling the 2-race rest penalty (`50%/25%/0%`) across 6–8 races to earn free Down tickets in Arc A feels like tedious classroom busywork rather than a sharp, self-directed optimization trap, then the number of required races to trigger Band 2/3 F2P spillover must be lowered (e.g., from 8 races to 4–5 races with a faster post-first-race playback option).
3. **Dilution of Receipt Clarity:** If adding `[Depicted character beat]` lines to `WE DISPLAYED` on the Receipt distracts students from the hard financial and probability evidence (pre-draw pity odds, odd bundle remainders, Down conversion ratios), then Plan 36 narration evidence should be consolidated into **one dedicated collapsible card** (*"Narrative & Time Perspective vs. Recorded Ledger"*) at the bottom of Layout A rather than interleaved into every commercial technique card.
