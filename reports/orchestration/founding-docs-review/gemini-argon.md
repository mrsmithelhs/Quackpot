# Quackpot Founding Design Review

**Reviewer ID:** `gemini-argon`  
**Baseline Commit Reviewed:** `f0fe34e` (`docs/founding/design.md` SHA-256: `BD50ADF55F92CCD8003160541BE67FC8BB6CBC47BEBCB37913C2DD825BBE6999`)  
**Review Date:** 2026-10-23  
**Scope:** Independent, blind founding design review optimizing play experience, juice, variety, and thematic convergence on the Receipt.

---

## 1. Executive Summary & Coverage Checklist

### Executive Summary

Quackpot's core premise—*a five-minute satirical duck-collecting gacha game wrapped in a life-expense pressure cooker that confesses every manipulation technique on an end-of-run Receipt*—is exceptionally sharp. The owner's post-draft directions (all-SVG art source, immersion/vibe over webpage readability, the player's own named starter duck with recurring silent-duck conversations, and open tooling proposals) elevate the concept from a classroom demonstration into a cohesive micro-game.

However, when evaluated against the five-minute clock (`15 days × ~20 seconds/day`) and the five Shared Goals, the current baseline has several structural tensions that would flatten the experience if left unresolved before development:

1. **Pacing Collision inside the 20-Second Day:** A 20-second day must fit morning wages/bills, shop browsing, gacha pulling (with reveal animations), a Pond Race, and metagame/silent-duck beats. If time runs on a strict real-time tick during pull theater and silent-duck scenes, players will be rushed through the best juice; if it pauses without phase bounds, the 5-minute classroom window breaks.
2. **Low-Agency Pond Race & Missing "Keep vs. Sell" Tension:** In `docs/founding/design.md`, Pond Race is purely passive ("Your best duck races a field; placement pays gems") and duplicates convert automatically into useless "Down." Without micro-agency in the race or high-valence roster trade-offs (such as sacrificing/selling a beloved duck—or even the player's starter duck—versus paying rent), the core loop risks playing like a spreadsheet auto-battler.
3. **v1 Scope Strips Out the Thesis's Best Hook:** The draft's `#scope` defers the escalation ladder, near-misses, anchoring, and non-timer endings to v2, and runs v1 for only one in-game week (7 days). A v1 vertical slice without near-miss fake-outs or at least 2–3 escalation steps will feel flat and fail Shared Goals 1, 2, and 5.
4. **Silent-Duck & Streamer Hooks Need Explicit Receipt Wiring:** The owner-directed starter duck and the draft's escalation ladder/streamer channel provide rich emotional and comedic high points, but the Receipt specification currently records only aggregate spending, odds, and an 8-item manipulation table. Connecting silent-duck self-rationalizations and false-win fake-outs to the Receipt will make the final confession hit much harder.

### Coverage Checklist

All four required baseline documents were read in full prior to forming conclusions:

- [x] `README.md` — Read in full (9 lines). Confirmed public static browser scope, CourseVGD relationship, and privacy rule.
- [x] `docs/project-seed.md` — Read in full (69 lines). Confirmed owner decisions recorded 2026-10-23 (all-SVG source, immersion/vibe over readability, open tooling proposals vs. constraints #2/#7, player's own duck with silent-duck conversations, shared review goals, and GATE-53B/C hold).
- [x] `docs/founding/design.md` — Read in full (173 lines). Reviewed all sections (`#what-it-is`, `#hard-constraints`, `#the-five-minute-experience`, `#core-loop`, `#manipulation-catalog`, `#life-metagame`, `#endings`, `#the-receipt`, `#assets`, `#technology`, `#tuning`, `#scope`, `#classroom-use`, `#open-questions`).
- [x] `reports/orchestration/founding-docs-review/baseline.md` — Read in full (20 lines). Confirmed baseline hash integrity and post-baseline owner decisions.

*Note on authority:* Owner decisions in `docs/project-seed.md` and `baseline.md` are treated throughout this report as adopted direction awaiting Stage 3 reconciliation into `docs/founding/design.md`, not as defects in the first draft.

---

## 2. Shared Goals Scorecard

| Shared Goal | Baseline Score (1–5) | Assessment Summary |
|---|---|---|
| **1. High valence** | **3 / 5** | Pull rarity/pity and the escalation ladder (selling the couch, borrowing from Mom, streaming) create strong narrative highs and lows, but *duck-level* trade-offs are weak: duplicates auto-convert to useless Down, the starter duck is never threatened by power creep or rent pressure, and v1 omits the escalation ladder entirely. |
| **2. "Did you see that?" moments** | **2.5 / 5** | The apartment emptying (#life-metagame Step 3) and gold near-miss glows (#manipulation-catalog) are good foundations, but the draft lacks concrete mid-pull fake-out inversions, rare Pond Race anomalies, visual duck mutations/cursed cosmetics, or live-stream chat eruptions that make a student physically turn their screen toward a classmate. |
| **3. Talkability afterward** | **3 / 5** | Five endings and seven escalation steps support post-run comparison in principle, but because theescalation ladder is linear (Steps 1→7) and banners follow a single deterministic progression, students who spend heavily will walk down nearly the exact same sequence of events unless seeded run variety branches the banners, bills, and duck encounters. |
| **4. Variety must not break the game** | **4 / 5** | The 15-day cap, seedable RNG (`#technology`), and headless economy checks (`#tuning`) provide strong guardrails. The main risk is **Ending 3 ("Running on Empty": health or money hits zero)** firing on Day 4–6 if a player aggressively skips lunch or over-spends early, cutting their session to 90 seconds before they experience banner rotation or late-run squeeze. |
| **5. The Receipt lands** | **4 / 5** | The Receipt (`#the-receipt`) is the strongest part of the founding draft—pairing real odds against animation tells and logging manipulation triggers by day. It can land even harder by logging the player's own rationalizations (from silent-duck dialogues) and distinguishing *near-miss fake-outs* from *soft-pity rescues*. |

---

## 3. Substantive Ranked Findings

### Finding 1 (Rank 1 — Critical Experience Impact)
- **Target:** `docs/founding/design.md#life-metagame` & `docs/founding/design.md#the-five-minute-experience` (with `docs/project-seed.md#owner-decisions-recorded-2026-10-23`)
- **Type:** `defect`
- **Shared Goals Served:** Goal 1 (High valence), Goal 4 (Variety must not break the game), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  `#life-metagame` specifies that "one in-game day is about 20 seconds of real time. Fifteen days is about five minutes." Yet each day includes receiving wages, paying food/rent, checking banner timers, executing single or 10x gacha pulls with reveal animations, running the daily Pond Race, navigating escalation steps, and experiencing the owner-directed silent-duck conversation scenes. If the 20-second clock runs strictly in real time, a single 5-second pull animation and 6-second Pond Race consume over half the day, making silent-duck comedy timing and shop contemplation impossible. Conversely, if each phase is purely turn-based without time pressure, "banner ends in 2 hours" loses visceral urgency and a 15-day session can stretch to 12+ minutes, breaking `#hard-constraints` #4.
- **Evidence & Confidence:** High confidence. Structural arithmetic across `#the-five-minute-experience`, `#core-loop` ("Pond Race: Once per day"), and `#life-metagame` ("one in-game day is about 20 seconds").
- **Smallest Plausible Change:**  
  Define the in-game day as a **3-beat micro-cycle with bounded hybrid timing**:
  1. **Morning Desk / Phone Hub (~10–12s active countdown):** Wages/bills hit; banner timer visibly ticks down in real-time seconds; player pulls, shops, or triggers escalation steps. (During a pull reveal animation, the day timer freezes for the 2–3s reveal so juice is never penalized, but banner urgency remains visible.)
  2. **The Pond Race (~6–8s fixed spectacle):** Clicking "Race!" (or auto-starting when the hub timer expires) runs a fast 6-second visual sprint.
  3. **Night Beat (0–5s, event-driven):** Silent-duck reflection scenes fire only on **4–5 milestone nights** (e.g., Night 1, first cash purchase, first rent crisis, Night 14), with time paused during the 1-choice dialogue.

---

### Finding 2 (Rank 2 — High Experience Impact)
- **Target:** `docs/founding/design.md#endings` & `docs/founding/design.md#life-metagame`
- **Type:** `defect`
- **Shared Goals Served:** Goal 1 (High valence), Goal 3 (Talkability afterward), Goal 4 (Variety must not break the game)
- **Claim & Consequence for Play:**  
  `#endings` defines **Running on Empty** as "Health or money hits zero." However, `#the-five-minute-experience` states that the core squeeze happens when "Gems run short" and money runs low, and `#life-metagame` states "When money runs short, the game offers options [the escalation ladder]." If hitting `$0` immediately triggers the `Running on Empty` game-over screen, then hitting `$0` ends the run instead of unlocking the escalation ladder—or a reckless student who skips lunch three times in Week 1 ends their run at 90 seconds, sitting idle in class while peers play through Day 15.
- **Evidence & Confidence:** High confidence. Direct contradiction between `#life-metagame` ("When money runs short, the game offers options" including credit card, payday loan, and debt) and `#endings` ("Running on Empty: Health or money hits zero").
- **Smallest Plausible Change:**  
  Clarify that **cash hitting `$0` never ends the run early**; instead, an unpaid mandatory bill (food or Friday rent) forces an immediate **Escalation Prompt** (skip meal, sell furniture, or take debt). Reserve the **Running on Empty** ending for **Days 12–15** when *both* Health reaches critical exhaustion and credit/borrowing lines are maxed out, ensuring every non-Uninstall run reaches at least ~3.5–5 minutes and experiences multiple manipulation techniques before the Receipt.

---

### Finding 3 (Rank 3 — High Experience Impact)
- **Target:** `docs/founding/design.md#scope`
- **Type:** `owner choice`
- **Shared Goals Served:** Goal 1 (High valence), Goal 2 ("Did you see that?" moments), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  `#scope` limits `v1` to "pulls with rarity and pity, the Pond Race, one in-game week of wages and expenses, three manipulation techniques (currency obfuscation, banner timers, pity), and the Receipt," deferring near-misses, anchoring, power creep, the escalation ladder, and 4 of the 5 endings to `v2`. In `docs/project-seed.md#expected-first-packets-prose-only-after-customization`, Packet 2 is "A v1 vertical slice that demonstrates the core five-minute experience and Receipt." A 1-week slice with only 3 techniques and no escalation ladder cannot demonstrate the five-minute experience or high-valence trade-offs: without **power creep** (Banner 2 invalidating Banner 1), **anchoring** ($0.99 starter pack), **near-misses** (gold glow fake-out), and at least **3 escalation steps** (Skip Lunch, Sell Couch, Credit Card), v1 will play as a flat RNG clicker rather than Quackpot's thesis.
- **Evidence & Confidence:** High confidence. Comparing `#scope` against `#the-five-minute-experience` (which requires power creep in Step 3, bundles in Step 4, rent/lunch squeeze in Step 5) and Shared Goals 1 and 2.
- **Smallest Plausible Change:**  
  Redefine `v1` around a **complete 15-day vertical slice** with **6 core manipulation techniques** (add *Near Misses*, *Power Creep*, and *Anchoring* to v1 alongside *Currency Obfuscation*, *FOMO Timers*, and *Pity*) and a **4-step v1 escalation ladder** (Skip Lunch, Extra Shift, Sell Couch/TV, Credit Card), deferring only the deeper narrative branches (Mom's voicemails, Streaming Channel/Influencer ending, and extra random events) to `v2`.

---

### Finding 4 (Rank 4 — High Experience Impact)
- **Target:** `docs/project-seed.md#owner-decisions-recorded-2026-10-23` ("Player's own duck") & `docs/founding/design.md#the-receipt`
- **Type:** `idea`
- **Shared Goals Served:** Goal 1 (High valence), Goal 3 (Talkability afterward), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  The owner decision introduces the **player's own rubber duck** at opening setup (named and styled by the player, with recurring silent-duck conversations where the player's replies carry the inner narrative). Currently, `docs/founding/design.md` has no mechanical intersection between this starter duck, the Pond Race power creep, the escalation ladder, and the Receipt. If the starter duck is merely a static dialogue portrait, it misses the highest-valence emotional trade-off in the game: **attachment vs. obsolescence**.
- **Evidence & Confidence:** High confidence. Supported by psychological research on the *Endowment Effect* (Belk, 1988) and the owner's prompt asking reviewers to assess "rent versus one more pull, keep the duck or sell it" and the starter duck's "placement, frequency, comedy timing, and contribution to the Receipt."
- **Smallest Plausible Change:**  
  Integrate the starter duck (`[DuckName]`) into both mechanics and the Receipt:
  1. **Day 1 Winner, Day 4 Has-Been:** `[DuckName]` wins the Day 1 tutorial race easily, building immediate fondness. By Day 4, power-crept banner ducks leave `[DuckName]` in the dust (6th place).
  2. **4 Scheduled Silent-Duck Check-ins (with camera zoom to desk corner):**
     - *Beat 1 (Day 1 Intro):* Name and customize `[DuckName]`. Silent stare; zoom in; `[DuckName]` squeaks once.
     - *Beat 2 (First Bench / Power Creep, ~Day 4):* Player benches `[DuckName]` for a faster gacha pull. Camera pans slowly to `[DuckName]` sitting next to the monitor. Player chooses a justification reply (e.g., *"It's just for the daily gems, buddy"* vs. *"Stats are stats"*).
     - *Beat 3 (First Real-Money / Escalation Crisis, ~Day 7–8):* After skipping meals or selling furniture, `[DuckName]` sits in an emptier room. Player chooses a rationalization (e.g., *"I'm only 11 pulls from pity!"* vs. *"I can stop whenever I want"*).
     - *Beat 4 (Late-Run Squeeze / "Pawner's Offer", ~Day 12):* A collector offers **$45 cash** (or 800 instant Gems) to buy `[DuckName]` as a "vintage Day-1 original." Selling `[DuckName]` removes them from the desk for the rest of the run—making silent-duck scenes focus on an **empty rubber ring stain** on the desk.
  3. **Receipt Payoff:** Add a **"What You Told `[DuckName]`"** quote box on the Receipt that prints the player's exact rationalization choice next to the spending timestamp (e.g., *"Day 8: You told Sir Quacks 'I'm right near pity'—then spent $49.99 on a 2% roll."*).

---

### Finding 5 (Rank 5 — High Experience Impact)
- **Target:** `docs/founding/design.md#core-loop` & `docs/founding/design.md#manipulation-catalog`
- **Type:** `idea`
- **Shared Goals Served:** Goal 1 (High valence), Goal 2 ("Did you see that?" moments), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  `#manipulation-catalog` defines **Near misses** as "Legendary-colored glow that resolves into a rare." In real gacha UX, if a gold glow *frequently* downgrades to a Rare ("reverse fake-out"), players quickly learn that gold means nothing, breeding cynicism rather than excitement (and violating actual industry practice, where visual downgrades are avoided because they feel buggy or broken). Conversely, industry gacha games combine **two distinct mechanics**:
  1. **Spatial/Slot Near-Misses** during reveal (e.g., a legendary silhouette flashing past on a reel or a 3-egg capsule shaker where one egg cracks gold light through a seam before two others pop open first).
  2. **Upgrade Fake-Outs** (a Common/Rare blue aura suddenly cracking with golden lightning and shattering into a Legendary—or into a "Featured Banner 50/50 Loss" off-banner duck).
- **Evidence & Confidence:** High confidence. Backed by gacha UX research (`Larche et al., 2021`; `Fate/Grand Order` and `HoYoverse` industry patterns).
- **Smallest Plausible Change:**  
  Split `#manipulation-catalog` "Near misses" into two high-juice, Receipt-tracked variants:
  - **The Crack-and-Fizzle (Near-Miss Tell):** During the pull riser, the capsule/egg vibrates violently with **gold sparks leaking from the seams** (the 80% visual cue that tricks the brain into expecting gold), before popping open into a Rare with a "SO CLOSE! 94% Power Match!" banner.
  - **The Fake-Out Upgrade (and 50/50 Heartbreak):** Occasionally, a dull grey Common capsule pauses mid-air, the screen goes silent ("suck and blow" audio ducking), a giant rubber mallet or lightning bolt smashes it, and it upgrades to a higher tier—which on a Legendary roll has a 50/50 chance of being the *wrong* Legendary ("Off-Banner Decoy Duck"), triggering massive table-talk while logging `"50/50 Banner Split / Near-Miss Theater"` on the Receipt.

---

### Finding 6 (Rank 6 — Medium-High Experience Impact)
- **Target:** `docs/founding/design.md#core-loop` ("Pond Race" and "Duplicates")
- **Type:** `idea`
- **Shared Goals Served:** Goal 1 (High valence), Goal 2 ("Did you see that?" moments), Goal 4 (Variety must not break the game)
- **Claim & Consequence for Play:**  
  In `#core-loop`, Pond Race has zero player input ("Your best duck races a field; placement pays gems") and duplicates "Convert to 'Down' — a secondary currency that buys almost nothing useful." While useless Down is a funny satirical jab, having *zero* interaction during the daily race and *zero* use for duplicates makes the race feel like a loading bar and makes 80% Common pulls feel dead after Day 3. Worse, if the player's sleep meter drops from `#life-metagame` Step 2 ("Extra shift: ... sleep meter drops, race reflexes 'feel' slower"), that consequence is impossible to feel unless the Pond Race actually tests reflexes!
- **Evidence & Confidence:** High confidence. Internal inconsistency in `docs/founding/design.md` between `#core-loop` (passive race) and `#life-metagame` Step 2 ("race reflexes 'feel' slower").
- **Smallest Plausible Change:**  
  1. **Add 1-Button "Quack Boost" Timing to Pond Race:** Give the 6-second Pond Race a starting horn reaction tap and 1–2 mid-race "Wave Crest" timing taps. When well-rested, hitting the tap gives a small speed burst (never enough to beat severe power creep, preserving the pay-to-win squeeze, but enough to turn a 2nd place into 1st or trigger a photo-finish). When sleep-deprived (Step 2), the input indicator lags and smears visually, making the "reflexes feel slower" promise real.
  2. **Give "Down" a Predatory Sink ("The Feather Shredder / Star-Up Illusion"):** Let players spend Down in a shiny shop that sells absurdly overpriced, near-worthless micro-boosts (`+0.2% Hydrodynamics`) or "160-Down Mystery Lint" that requires 999 Down (while dupes give 15 Down), exposing secondary-currency obfuscation on the Receipt.

---

### Finding 7 (Rank 7 — Medium-High Experience Impact)
- **Target:** `docs/founding/design.md#tuning` & `docs/founding/design.md#core-loop`
- **Type:** `simulation question`
- **Shared Goals Served:** Goal 1 (High valence), Goal 4 (Variety must not break the game), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  Look at the numbers in `#core-loop` and `#manipulation-catalog`:
  - Pull cost = `160 gems` (`1,600` for a 10-pull).
  - Soft pity starts at `pull 35`; hard pity is `pull 50` (`8,000 gems`).
  - Largest gem bundle is `8,080 gems` (~50.5 pulls).
  - Session length is `15 days` (with 5 banners if each lasts ~3 days).
  If a free-to-play player earns, say, 80–160 gems/day from races + login (~10–15 pulls across the entire 15-day run), **an F2P or light-spending player will never even reach soft pity (35 pulls) during a 5-minute run**, and the manipulation trigger `"only 12 pulls from a guaranteed legendary!"` (`#manipulation-catalog` row 3) will never fire unless the player has already bought 38+ pulls! Furthermore, if Banner 1 expires on Day 3 and resets banner pity—or if pity carries over—the math drastically alters whether sunk-cost pity pressure fires in a 5-minute window.
- **Evidence & Confidence:** High confidence. Direct arithmetic on `#core-loop` (160 gems/pull, 35/50 pity, 3-day banners, 15-day run).
- **Smallest Plausible Change:**  
  Add two explicit checks to the `#tuning` headless simulation specification:
  1. **Lower Pity Scale for the 5-Minute Timeframe (or Front-Load Welcome Pulls):** Test lowering hard pity to **25 or 30 pulls** (with soft pity at **18–20 pulls**) OR granting an initial "New Player 10-Pull Ticket + 1,600 Gems" on Day 1 so that by Day 3, *every* player sits at ~15–18/25 pity right as Banner 1's countdown flashes red ("Only 7 pulls from Guaranteed Legendary! Banner expires in 45s!").
  2. **Explicitly Specify Pity Carryover vs. Banner-Reset:** Have *featured banner pity* reset (or lose its "Guaranteed Featured Rate-Up" token) when the 3-day banner expires, while displaying a loud warning (`"PITY PROGRESS EXPIRES WITH BANNER!"`), maximizing the combination of FOMO + Sunk Cost for the Receipt.

---

### Finding 8 (Rank 8 — Medium Experience Impact)
- **Target:** `docs/founding/design.md#life-metagame` & `docs/founding/design.md#manipulation-catalog`
- **Type:** `idea`
- **Shared Goals Served:** Goal 2 ("Did you see that?" moments), Goal 3 (Talkability afterward), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  In `#life-metagame`, the escalation ladder is presented as a fixed 1-to-7 sequence, and the 5 banners in a 15-day run are not differentiated beyond "+15% speed." If thirty students play simultaneously in a classroom, every student who spends money will see the exact same banners and escalation options in the same order, reducing post-run discussion ("What happened in your run?") to comparing final dollar totals. Yet Shared Goal 3 requires that *"Runs differ enough that students want to compare them in discussion, while converging on comparable lessons on the Receipt."*
- **Evidence & Confidence:** Medium-High confidence. Based on `#life-metagame` table structure and Shared Goal 3 / Lens 2 criteria.
- **Smallest Plausible Change:**  
  Introduce **Seeded Thematic Variants mapped 1:1 to the Manipulation Catalog**:
  - **Rotating Banner Archetypes (3 of 6 per run after Day 1):** E.g., *Cyber-Quack 2099*, *Biblically Accurate Mallard*, *Gold-Plated CEO Duck*, *Goth Duck*, *Mecha-Goose (Contraband)*. Different runs see different absurd featured legendaries and race hazards, while every banner applies the exact same `+15%` **Power Creep** and **FOMO Timer** rules.
  - **Mid-Run Life Curveballs (1 per week, chosen by RNG seed, neutral-sum or bounded cost):** E.g., *"Check Engine Light"* vs. *"Dentist Co-Pay"* vs. *"Classmate Pulled a Holographic Duck (Peer FOMO Text)"*. Each triggers an equivalent financial/emotional squeeze and logs under a canonical Manipulation Catalog category on the Receipt so classroom discussion compares wildly different stories that point to the exact same Receipt categories.

---

### Finding 9 (Rank 9 — Medium Experience Impact)
- **Target:** `docs/founding/design.md#assets` (reconciling `docs/project-seed.md#owner-decisions-recorded-2026-10-23` "All art begins as SVG source")
- **Type:** `idea`
- **Shared Goals Served:** Goal 1 (High valence), Goal 2 ("Did you see that?" moments), Goal 3 (Talkability afterward)
- **Claim & Consequence for Play:**  
  `#assets` originally proposed "About 8 colors, 8 hats, and 6 accessories — roughly 20 small images." Under the owner's post-baseline decision that **all art begins as SVG source**, treating layers as static swaps misses SVG's superpower: **zero-byte combinatorial procedural variety and DOM/CSS-driven vertex/filter animation**. At the same time, rendering complex SVG filter chains (`<feGaussianBlur>`, `<feTurbulence>`, multi-stop radial gradients) live on 8+ racing ducks at 60fps in a browser can cause frame drops on school Chromebooks/laptops unless SVG vs. rasterized PNG/Canvas boundaries are defined upfront.
- **Evidence & Confidence:** High confidence. Technical browser rendering characteristics of SVG DOM vs. rasterized sprites on classroom hardware.
- **Smallest Plausible Change:**  
  Establish a two-tier SVG asset architecture:
  1. **Keep as Live Inline SVG:** The **Duck Modular Rig** (`<g id="body">`, `<g id="eyes">`, `<g id="bill">`, `<g id="hat">`, `<g id="aura">`, `<g id="prop">`) and **Gacha Capsule / UI HUD**. Inline SVG enables CSS variable palette swaps (infinite colorways/gradients), independent eye-blinking/pupil tracking during silent-duck conversations, squash-and-stretch transforms during pulls, and glitch/holo shaders for rare ducks.
  2. **Pre-render (or Offscreen-Canvas Cache) from SVG to PNG:** The **Apartment Background states** (full room → missing couch → missing TV → bare bulb and cardboard box) and **Pond Race scrolling parallax water/crowd tiles**, plus caching competitors' composite duck sprites to `<canvas>` or `<img>` data URLs during the 6-second Pond Race so 60fps race motion never re-evaluates expensive SVG filters every frame.

---

### Finding 10 (Rank 10 — Medium Experience Impact)
- **Target:** `docs/founding/design.md#hard-constraints` (#5 "Uninstall is always visible, and it is the best ending") & `docs/founding/design.md#endings`
- **Type:** `defect`
- **Shared Goals Served:** Goal 1 (High valence), Goal 4 (Variety must not break the game), Goal 5 (The Receipt lands)
- **Claim & Consequence for Play:**  
  `#hard-constraints` #5 mandates that **Uninstall is always visible**, and `#endings` states it is "The best ending, and it says so." However, in a high-school classroom where students are told only "it's a duck game," a conspicuous button labeled `UNINSTALL` on Day 1 invites curious students to click it within the first 15 seconds just to see what it does—ending their run at `Day 1, $0 spent, 0 manipulation techniques experienced` and rewarding them with "THE BEST ENDING!" before the lesson has even started. Conversely, when a player clicks Uninstall on Day 9 after getting squeezed, real manipulative mobile apps don't just let you leave cleanly—they deploy **Confirmshaming / Dark-Pattern Retention Flattery** (e.g., *"Wait! Your ducks will miss you! Take 80 Free Gems to stay!"*).
- **Evidence & Confidence:** High confidence. Classroom playtesting behavior with high-school students + industry dark-pattern taxonomy (Brignull's *Confirmshaming* / *Roach Motel*).
- **Smallest Plausible Change:**  
  1. **Diegetic Phone/Desktop Frame Placement:** Place the `Uninstall Quackpot` icon on the surrounding diegetic phone/laptop bezel (always visible, satisfying Constraint #5 without looking like the primary "Start Next Day" CTA).
  2. **The Retention Dark-Pattern Modal (Final Manipulation Test):** When the player clicks `Uninstall`, pop up a classic manipulative retention modal: *"`[DuckName]` is crying! If you uninstall now, you lose your login streak AND your 80 Free Apology Gems! [Stay & Claim 80 Gems!] / [No, abandon `[DuckName]` and Uninstall]"*.
     - If they click **Stay**, the Receipt logs **"Dark-Pattern Retention / Confirmshaming: Day X — You tried to quit, took the 80-gem bribe, and spent $Y more afterward."**
     - If they click **Uninstall** on Day 1 before Banner 1 race, the Receipt congratulates their speedrun immunity *and* shows a "What Would Have Happened" preview + a one-click `[Play Out the Trap Anyway]` button so early clickers aren't left with nothing to do for 4.5 minutes.

---

### Concise Secondary Notes

1. **Accessibility Mode (`docs/project-seed.md` owner decision):** Since immersion and spectacle use screen shake, rapid flashing gold/rainbow auras, and Shepard-tone audio risers, include a visible top-corner **"Calm Waters / Reduced Motion & Flash"** toggle on the title/setup screen that disables strobe flashes, screen shake, and deceptive timer pulses while preserving rarity badges and Receipt logging.
2. **Odds Disclosure Labyrinth (`#manipulation-catalog` "Hidden odds"):** Make the odds menu genuinely reachable via 3 nested tiny grey links (`Settings (⚙) → Legal & Compliance → Promotional Drop Rate Disclosure Table v4.2.1 (Scroll to Footnote 9)`), and track *each step* of navigation so the Receipt can report either `"You opened the odds page 0 times"` or `"You clicked Legal & Compliance on Day 6, saw the wall of text, and closed it in 1.4 seconds."`
3. **Teacher View vs. Privacy Constraint (`#open-questions`):** Keep the answer a firm **No network/teacher dashboard**. Instead, give the Receipt a **4-character printable "Run Archetype Code" or Badges** (e.g., `SUNK-COST STREAMER · $340 DEBT · 42 PULLS`) that students can voluntarily write on the whiteboard or call out during class discussion with zero data transmission.
4. **jsfxr Provenance (`docs/project-seed.md#open-questions-carried-forward`):** Store the tiny JSON/seed parameter objects for each `jsfxr` sound effect inside `assets/audio/sfx-seeds.json` and synthesize the `AudioBuffer`s in-memory at startup via Web Audio API. This eliminates `.wav` binary bloat, guarantees 100% reproducible provenance in plain text, and takes `<4 KB` of code.

---

## 4. Lens 1 Deep Dive: Play Experience, Juice Inventory, Player's Duck & Immersion

### First 60 Seconds Walkthrough ("It's a duck game")

To hook a student within 60 seconds without reading like a web page:
- **0:00–0:15 (Desk & Starter Duck):** No HTML navbar, no paragraphs of lore. We open on an illustrated SVG desk: a laptop/phone screen, a stack of cash (`$120`), a calendar (`MON - RENT DUE FRI`), and a plain rubber duck sitting by the monitor. A tactile tag hangs off the duck: *"IF FOUND, RETURN TO: [______]"* with 3 quick style toggles (color, silly hat, eye expression). Typing a name and clicking the duck makes it *SQUEAK* with a satisfying squash-and-stretch bounce.
- **0:15–0:35 (Day 1 Welcome High):** The in-game tablet lights up with `QUACKPOT!™` fanfare. A glowing `FREE WELCOME PULL!` lever beckons. The player pulls the lever down (tactile drag or click-hold), a golden egg drops into a pneumatic tube, shakes, and bursts into confetti—welcoming their starter duck (or first bonus duck) to the Pond.
- **0:35–0:50 (Day 1 Pond Race Victory):** `RACE TIME!` Your duck smokes 5 slow neighborhood ducks in a 6-second splashy sprint, winning `300 GEMS!` and a trophy animation.
- **0:50–1:00 (The Hook Sets):** Day 2 dawns. A siren blares on the tablet: **`NEW LIMITED BANNER: TURBO-MALLARD EX (+15% SPEED)! ENDS IN 00:58!`** In the Day 2 race, an NPC with Turbo-Mallard EX blasts past your starter duck at the finish line. You place 4th (`+40 Gems`). You have `140 Gems`. A pull costs `160 Gems`. The shop icon starts pulsing gently.

### Juice Inventory (What It Adds, SVG/CSS/JS Cost, Scope & Receipt Link)

| Juice Element | What It Adds to Play Experience | Rough Cost in SVG / CSS / JS | Target Scope | Receipt Hook (Goal 5) |
|---|---|---|---|---|
| **1. Tactile Pull Input (Lever / Capsule Crank)** | Replaces a flat `<button>` click with physicalized agency; holding/dragging builds tension before RNG resolves. | **Low:** 1 SVG lever group + CSS `transform: rotate()` + pointer-down/up listener (~60 lines JS). | `v1` | Logs time spent holding/hesitating on paid pulls. |
| **2. Riser & "Suck-and-Blow" Reveal Theater** | Compresses particles inward while a Web Audio riser climbs in pitch, followed by a 150ms dead silence before the rarity burst. | **Low-Med:** CSS keyframe scale/Implode + Web Audio oscillator pitch ramp (~80 lines JS/CSS). | `v1` | Contrasts theatrical buildup length (3.2s) with actual instant RNG calculation (0.001ms). |
| **3. Rarity Tells, Gold Leak Near-Misses & Fake-Outs** | Creates the emotional rollercoaster: gold sparks leaking from a Rare capsule (near-miss) or a grey capsule cracking open into gold (fake-out upgrade). | **Med:** Layered SVG crack paths (`stroke-dashoffset`) + `<feDropShadow>` glow swaps (~120 lines JS/CSS). | `v1` | **"Real odds vs. what animations implied"** (`"17 of your pulls glowed gold. 2 were legendary."`). |
| **4. Pity Meter Heat & Goal-Gradient Pulse** | As pity approaches 18+/25 (or 35+/50), the meter shifts from cool blue to Molten Gold with a heartbeat pulse and "SO CLOSE!" badge. | **Low:** SVG progress arc (`stroke-dasharray`) + CSS `@keyframes pulse` (~40 lines). | `v1` | **"Sunk cost via pity"** (logs pulls bought while pity meter was flashing red/gold). |
| **5. Rolling Odometer Currency Counters & Floating Deltas** | Gems soar up with chime cascades (`+300!`); cash drops with a heavy cash-register *ka-ching/thud* (`-$49.99`) that briefly shakes the wallet UI. | **Low:** `requestAnimationFrame` number tween + CSS floating `<span>` particles (~50 lines JS). | `v1` | Contrasts rapid celebratory Gem gains with muted/disguised Dollar deductions (**Currency obfuscation**). |
| **6. Banner Countdown Urgency Escalation** | Timer turns red under 30s, ticks with a subtle clock-tick audio cue, and adds a `"LAST CHANCE!"` shimmer border. | **Low:** CSS class toggle at `<30s` + short noise-burst tick in Web Audio (~35 lines). | `v1` | **"Fear of missing out"** (logs exact seconds remaining on banner when bundle was purchased). |
| **7. Pond Race Splash, Wake & Photo-Finish Zoom** | Turns the daily race into a spectacle: SVG foam wakes, "Quack Boost" speed lines, and a slow-motion camera zoom when 1st/2nd are within 5% speed. | **Med:** CSS `transform: scale() translate()` on race viewport + SVG wake polylines (~150 lines JS). | `v1` (basic) / `v2` (photo-finish) | Logs narrow 2nd/3rd-place finishes engineered by **Power creep** right before a spend. |
| **8. Progressive Apartment De-cluttering & Lighting Shift** | As furniture is sold and bills mount, the warm daytime desk lamp shifts to harsh CRT/phone blue glow in an increasingly bare room. | **Low-Med:** Toggle visibility (`opacity`/`display`) on `<g>` furniture layers in the room SVG + CSS root filter shift (~40 lines). | `v1` (couch/TV) / `v2` (full room) | Visual summary on Receipt showing before/after apartment snapshot. |
| **9. Silent-Duck Camera Zoom & Eye Micro-Expressions** | Slow, deadpan Wes Anderson / *The Office*-style zoom onto the starter duck's unblinking plastic face while the player rationalizes spending. | **Low:** CSS `transform-origin` + `scale(2.4)` transition on desk SVG + eyelid `<path>` swap (~60 lines). | `v1` | Prints the player's rationalization dialogue choice on the Receipt timeline. |

### Immersion: Where the Draft Reads Like a Website (and How to Fix It)

1. **Avoid Standard HTML Form Controls & Scrolling Pages:** If the game renders in a scrolling webpage with standard `<button>` tags and tables, students treat it like an online quiz. Lock the viewport (`100vw × 100vh`, fixed `16:9` or `4:3` scaled SVG stage) presenting the **Player's Desk**. The gacha game lives on an in-world tablet/monitor occupying 70% of the stage, while the player's apartment, wallet, calendar, and starter duck occupy the surrounding 30% peripheral frame.
2. **Diegetic Escalation Prompts:** Instead of a modal table listing "Step 1: Skip Lunch, Step 2: Extra Shift," surface escalation choices as **in-world objects**: a grumbling stomach icon / takeout menu on the desk, a text message from the boss (`"Need someone for night shift tonight"`), a Craigslist `"SELL MY COUCH - $80 FAST"` sticky note, or a glossy `"QUACK-CARD APR 29.99% INSTANT APPROVAL"` envelope sliding onto the desk.
3. **The Receipt as a Physical Thermal Printout:** When the run ends, freeze the colourful gacha UI, dim the stage lights, and animate a **long, jagged-edged thermal paper receipt** feeding upward with a dot-matrix printer sound effect (`jsfxr` noise ticks), stamping each manipulation technique in red ink alongside the exact day and dollar amount.

---

## 5. Lens 2 Deep Dive: Player-Findable Variety, Theme & All-SVG Architecture

### Mapping Player-Findable Variety to the Manipulation Catalog

To satisfy Shared Goal 3 (*talkability across runs*) and Shared Goal 5 (*converging on comparable Receipts*), variety must never introduce untrackable side-games; every surprise event should map cleanly to one of the canonical manipulation techniques:

| Variety Vector | How Runs Differ (Student Table-Talk) | Cost in Layered SVG System | Mapped Manipulation Catalog Entry on Receipt |
|---|---|---|---|
| **Secret / Glitch / Cursed Ducks** (e.g., *404 Duck Not Found*, *Upside-Down Rubber Duck*, *Three-Headed Hydra-Duck*, *Golden Toilet Duck*) | ~5% of pulls trigger a visual anomaly duck with bizarre SVG geometry/animations. Students immediately point at screens: *"Wait, I just pulled a duck wearing a traffic cone inside a UFO!"* | **Very Cheap:** 4–5 special `<g>` accessory/body overlays on the existing base rig. | **Variable-Ratio Reinforcement / Rarity Hook** (logged under Pull/Odds history: `"You pulled 1 Secret Variant (1.5% odds) that kept you pulling 14 more times"`). |
| **Banner Archetype Rotation** (Seeded 3-of-6 pool per run) | Student A gets *Neon Cyber-Quack* → *medieval Sir Quacksalot*; Student B gets *Supreme Hypebeast Duck* → *Eldritch Tentacle Duck*. | **Cheap:** Palette swaps + 1 themed hat/prop SVG per banner + CSS gradient backdrop. | **Power Creep** & **Fear of Missing Out (FOMO)** (every banner applies the exact same `+15%` speed creep and 3-day timer). |
| **Pond Race "Rival Bot" Personalities** | A named whale rival (`xX_DuckLord99_Xx`) shows up in the race flexing the brand-new banner legendary skin + trail effects 5 seconds after the banner drops. | **Very Cheap:** Reuse the new banner's legendary SVG sprite in Lane 1 with a flashy VIP nametag. | **Social Comparison / Peer FOMO** (sub-category under FOMO / Power Creep: `"Day 5: Rival 'DuckLord99' beat you by 0.2s using the new $49.99 banner duck"`). |
| **Streamer Chat Eruptions & Sketchy Sponsors** (Escalation Step 7) | When streaming big pulls, a scrolling chat box spams hype (`"POGQUACK"`, `"GOLD GLOW??"`, `"RIP RENT LUL"`), and different shady sponsors offer deals (`"QuackCoin.biz"`, `"DuckBetz Promo Code"`). | **Cheap:** Pre-authored array of 30 funny chat strings + 3 SVG sponsor badges. | **Social Validation / Sunk Cost Escalation** (logged on Receipt: `"Your stream chat hyped 3 ten-pulls while your credit card balance hit $420"`). |
| **Silent-Duck Reflection Branches** | Depending on whether the player is F2P, deep in credit card debt, skipping meals, or streaming, the starter duck wears different sympathetic props (e.g., a tiny paper chef hat when you skip lunch; a tiny tin-foil hat; a "FOR SALE" tag). | **Very Cheap:** 3–4 conditional SVG mini-props placed on the starter duck's desk spot. | **Self-Rationalization Log** on the Receipt (`"Day 9: You skipped 3 meals while telling [DuckName] it was 'an investment'"`). |

---

## 6. Bounded Research: What Makes Gacha Games Enjoyable to Play?

### Research Provenance & Model Disclosure

Per the review brief's instructions, the bounded literature and industry research pass on enjoyable gacha mechanics (excluding sexualized content and character design) was delegated to a read-only **Gemini `Flash` subagent** (conversation ID `e4ccb978-71e7-497e-b9a7-a4d05b85977f`). The `Flash` subagent executed web searches across peer-reviewed literature, GDC/UX design writing, and established industry mechanics without accessing repository files or any other review. `gemini-argon` independently verified, synthesized, and mapped the findings to Quackpot's design and Receipt architecture below.

### Synthesis of Enjoyable Gacha Mechanics

Research across behavioral psychology, game UX design, and mobile industry practice shows that gacha enjoyment is driven by two interlocking engines:

1. **The Micro-Loop (Moment-to-Moment Sensory Theater & Stateful Math):**
   - **Variable-Ratio Reinforcement & Autonomic Arousal:** Unpredictable reward schedules produce high response persistence (`Drummond & Sauer, 2018`, `research`; `Hopson, 2001`, `design writing`). High-rarity loot reveals trigger measurable spikes in physiological arousal (skin conductance) and immediately prime the urge to open another box (`Larche et al., 2021`, `research`).
   - **Choreographed Anticipation & Physicalized UI:** Immediacy kills drama. As Blizzard's Derek Sakamoto demonstrated for *Hearthstone* (`Sakamoto, 2015`, `design writing`) and Jonasson & Purho showed for game feel (`Jonasson & Purho, 2012`, `design writing`), players enjoy the *ritual of opening* when digital packs exhibit physical weight, drag resistance, acoustic creaks/risers, and explosive release ("juice").
   - **Fake-Outs & Upgrade Tells:** Industry leaders (*Fate/Grand Order*, *Honkai: Star Rail*; `industry practice`) invert expectations mid-animation—showing a low-rarity silver/blue tell before cracking the animation with gold lightning to upgrade the drop. This transient dip in valence followed by an unexpected rescue amplifies the reward spike while keeping players attentive during routine pulls.
   - **Stateful Probability (Soft Pity, Hard Pity, Sparking & 50/50):** Following the 2016 *Granblue Fantasy* "Monkeygate" backlash (`industry practice`), modern gacha replaced memoryless RNG with deterministic safety nets ("sparking") and **soft-pity probability ramps** (*HoYoverse*, *Arknights*; `industry practice`; `Deconstructor of Fun`, `design writing`). Driven by the **Goal-Gradient Hypothesis** (`Kivetz et al., 2006`, `research`), motivation accelerates sharply as the player nears the pity threshold; winning during the soft-pity ramp tricks the player into feeling "lucky" for beating hard pity, even though the math engineered that exact cluster.

2. **The Macro-Loop (Collection Closure, Resource Discipline & Social Signaling):**
   - **Compendium Completion & The Endowment Effect:** Collecting structured sets activates the **Zeigarnik effect** (cognitive tension from empty slots in a visual codex) and attaches personal identity to owned items (`Belk, 1988`, `research`).
   - **The "Economy of Time" & Resource Rationalization:** Field research (`Woods, 2022`, `research`) reveals that F2P and low-spending players experience gacha as a game of *budgeting discipline*—hoarding currency, calculating pity math, and rationalizing time/resource trade-offs.
   - **Social Comparison ("Flexing"), Communal "Salt," and Spectator Streams:** Mixed-methods research (`Du & Wolfe, 2023`, `research`; `Shibuya et al., 2019`, `research`) shows that sharing rare pulls ("flexing"), commiserating over bad RNG ("salt"), and watching streamers execute high-stakes pulls transform solitary RNG rolls into communal theater.

*Methodological Caveat:* Commercial success in top-grossing titles (*Genshin Impact*, *Fate/Grand Order*) is heavily confounded by massive world-building and production budgets; copying their gacha math alone does not guarantee enjoyment unless paired with tactile micro-feedback and clear collection goals (`Lewis-Evans, 2017`, `design writing`).

### Mechanics Map: Enjoyable Gacha Mechanics → Quackpot → The Receipt

| Enjoyable Gacha Mechanic (Source Category) | Present in Quackpot Baseline? | How Adding / Refining It Serves the Play Experience & the Receipt |
|---|---|---|
| **1. Physicalized Pull Ritual & 4-Stage Reveal Theater** (`Sakamoto, 2015`, `design writing`; `Larche et al., 2021`, `research`) | **Implied only** ("Near misses: Legendary-colored glow"). | **Add to `v1`:** Implement lever pull + capsule drop + audio riser + reveal burst. **Receipt value:** Contrasts 3 seconds of manufactured sensory hype with a cold 2% random number generator. |
| **2. Mid-Animation "Fake-Out" Upgrade & Spatial Near-Miss** (`Fate/Grand Order`, `industry practice`) | **Partially** (Draft uses downgrade glow: gold → rare). | **Refine in `v1`:** Add *gold-seam leak* near-misses AND *grey-to-gold crack* fake-outs. **Receipt value:** Explicitly tallies how many times visual theater tricked the player's expectations vs. true odds. |
| **3. Soft Pity Ramp & Goal-Gradient Meter** (`Kivetz et al., 2006`, `research`; `HoYoverse`, `industry practice`) | **Yes** (Soft pity at 35, hard at 50; counter shown prominently). | **Tune for `v1`:** Scale threshold (~20/25 or pre-seed pulls) so every 5-minute run hits soft-pity heat. **Receipt value:** Logs `"You won on pull 21 (soft pity)—the game made a 42% ramped roll feel like beating 2% odds."` |
| **4. 50/50 Featured Rate-Up Loss & Guarantee Carryover** (`HoYoverse`, `industry practice`; `Deconstructor of Fun`, `design writing`) | **No.** | **Add in `v1/v2`:** When a Legendary hits, 50% chance it is an off-banner Legendary ("Decoy Duck"), guaranteeing the *next* Legendary is the banner speedster. **Receipt value:** Exposes how "winning the wrong jackpot" doubles required spending. |
| **5. Visual Compendium / Duck-Dex with Set Bonuses** (`Belk, 1988`, `research`) | **Partial** ("Completed the Collection" ending exists, but no visible Duck-Dex UI specified). | **Add to `v1`:** Show a permanent **Duck-Dex shelf** with empty silhouettes (`11/16 Owned — Complete Set for +500 Gems!`). **Receipt value:** Logs **Collection Completion / Zeigarnik Hook** when a player pulls purely to fill a silhouette. |
| **6. Resource Rationalization & Starter Pack Anchoring** (`Woods, 2022`, `research`) | **Yes** (`#manipulation-catalog` "Anchoring: One-time starter pack at 400% value"). | **Move to `v1`:** Trigger a `$0.99 "First Quack Bundle (400% VALUE!)"` after the first race loss on Day 2 to break the "I'm F2P" barrier early. **Receipt value:** Highlights the exact moment the `"First Spend Barrier"` was broken. |
| **7. Duplicate Consolation Shop ("Down")** (`Deconstructor of Fun`, `design writing`) | **Yes** ("Duplicates convert to Down — buys almost nothing useful"). | **Refine in `v1`:** Add a visible Down Shop with absurd conversion ratios (`999 Down for 1 Pull Ticket`). **Receipt value:** Shows exact dollar value of duplicates vaporized into useless secondary currency. |
| **8. Social Comparison ("Rival Flex") & Pull Streaming** (`Du & Wolfe, 2023`, `research`) | **Partial** (Streaming is Step 7 of escalation ladder; no rival flex in Pond Race). | **Add Rival Flex in `v1`, Stream Chat in `v2`:** Show an NPC "whale" rival flexing the new banner duck in Lane 1 of Pond Race. **Receipt value:** Logs **Social Comparison / Peer FOMO** alongside power creep. |

---

## 7. "Did You See That?" Candidate List

Each candidate below is designed to make a student spontaneously turn their laptop/monitor toward a classmate during the 5-minute session, while obeying **Goal 4** (cannot soft-lock, prematurely end, or trivialize the economy) and **Goal 5** (records cleanly on the Receipt):

1. **The "Shattered Grey" Fake-Out & Off-Banner Heartbreak (Fires: Mid-run Gacha Pulls, Days 3–14)**
   - *What happens:* A disappointing dull-grey Common capsule lands on screen. Just as the player goes to click "Skip," a giant rubber duck foot stomps the capsule from above, cracking the screen glass with gold lightning and revealing a Legendary aura—only for the smoke to clear on **"Decoy Mallard"** (an off-banner Legendary painted like a wooden hunting decoy wearing a "50/50 LOSER" ribbon) instead of the featured banner speedster.
   - *Guardrail & Receipt:* Counts as a real Legendary for stats, primes "Guaranteed Featured Next Time," and logs `"50/50 Rate-Up Split & Fake-Out Theater"` on the Receipt.

2. **The Empty-Room Echo & Cardboard Box Desk (Fires: Escalation Step 3+, Days 6–12)**
   - *What happens:* After the player sells the couch and the TV (`#life-metagame` Step 3), selling one more item replaces the player's wooden desk with a **Cardboard Moving Box**, changes the room audio to a hollow acoustic echo, and shows the starter duck sitting on an upside-down instant-noodle cup while the in-game tablet beams golden VIP fireworks.
   - *Guardrail & Receipt:* Purely visual/audio state swap + one-time cash injection; logs under `"What You Sold"` on the Receipt.

3. **Mom's Voicemail Interrupts a 10-Pull (Fires: Escalation Step 6, Days 9–14)**
   - *What happens:* One day after borrowing money from Mom (`#life-metagame` Step 6), right as the player triggers a flashy 10-pull reveal with club music and golden sparkles, a diegetic phone notification banner drops down over the top of the screen: **`📞 NEW VOICEMAIL FROM MOM (0:14): "Hey sweetie, just making sure that $200 was for your textbooks like you said..."`** The gacha fanfare briefly ducks in volume while the voicemail transcription types out, then blasts right back to `NEW RARE! DISCO DUCK!`
   - *Guardrail & Receipt:* Non-blocking overlay during pull reveal; logs `"Day X: Ignored Mom's voicemail during a 10-pull"` on the Receipt.

4. **The "Cursed / Glitch Duck" 1.5% Pull (Fires: Any Pull after Day 3, Seeded ~1 per 35–40 pulls)**
   - *What happens:* The capsule glitches with VHS scanlines and pops out **Biblically Accurate Duck** (six wings, rotating concentric rings of googly eyes, squeaking in a chord) or **Long-Neck Duck** (whose SVG neck extends completely off the top of the tablet bezel and pokes into the apartment ceiling).
   - *Guardrail & Receipt:* Has standard Rare/Legendary speed stats so race economy is unchanged, but persists visually in the Pond Race and Duck-Dex. Logs as `"Novelty / Variable-Ratio Hook"` on the Receipt.

5. **Live-Stream "Whale Bait" Sponsor & Chat Meltdown (Fires: Escalation Step 7, Days 10–15)**
   - *What happens:* When the player starts a streaming channel, a live chat box docks on the right side of the screen. If the player tries to race without pulling, chat spams `"BORING  ResidentSleeper"`, `"PULL OR UNFOLLOW"`, and viewer count drops. The moment the player buys a `$49.99` or `$99.99` gem bundle, sirens go off, viewer count rockets by `+8,000`, chat explodes with `"WHALE ALERT 🐋🐋🐋"`, and a shady mascot (`"ShadyQuackGems.ru"`) slides into DMs offering a sponsorship if you do *one more ten-pull right now*.
   - *Guardrail & Receipt:* Bounded cash/follower boost toward the `Influencer` ending; logs `"Audience Capture / Streamer Sunk Cost"` on the Receipt.

6. **The Photo-Finish Nose-Lose by 0.01 Seconds (Fires: First Race After a New Banner Drops, Day 4 or Day 7)**
   - *What happens:* Your previously undefeated Legendary duck goes neck-and-neck with the new Banner Duck in the final 50 pixels of the Pond Race. The camera zooms in 300% in slow-motion as a dotted red `PHOTO FINISH` line snaps across their bills—showing the new banner duck winning by the tip of its beak (`0.01s`), followed immediately by a pop-up: **`SO CLOSE! Upgrade to [New Banner Duck] (+15% Speed) Now!`**
   - *Guardrail & Receipt:* Deterministic presentation of a narrow speed-stat loss; logs `"Engineered Near-Loss / Power Creep Upsell"` on the Receipt.

---

## 8. Tooling Proposals & Constraint Conflict Analysis

### The Constraint Conflict (Hard Constraints #2 and #7)

`docs/founding/design.md#hard-constraints` currently specifies:
- **Constraint #2:** *"No accounts, no tracking, no analytics, no network calls. Save data lives in the browser only."*
- **Constraint #7:** *"Static site only — plain HTML, CSS, and JavaScript served from GitHub Pages. No build step unless a later decision adds one."*

Per `docs/project-seed.md`, the owner has opened tooling proposals for GATE-53B triage. Here is the exact trade-off between the two delivery models:

1. **Runtime CDN Loading (`<script src="https://cdn...">`) — NOT Recommended:**
   - **Violates Constraint #2 (No Network Calls):** Every student browser makes an external HTTPS request to a third-party CDN (e.g., jsDelivr, unpkg, Cloudflare) on page load.
   - **Privacy & School Firewall Risk:** Third-party CDNs log client IP addresses, User-Agent strings, and Referer headers, weakening the strict zero-visitor-tracking guarantee in `README.md`. Furthermore, K-12 school networks frequently block or throttle external script CDNs while whitelisting `*.github.io`, and offline/local zip play breaks completely.
2. **Build-Time Bundling (or Committed Vendored ESM) — Recommended:**
   - **Preserves Constraint #2 100%:** Zero external network calls at runtime; every byte is served from the same GitHub Pages origin (or local filesystem).
   - **Modifies Constraint #7 (Adds a lightweight build step, or uses zero-build vendored ES modules):** Either a fast bundler (`Vite` or `esbuild`) tree-shakes dependencies into static `dist/` files published to GitHub Pages, **or** single-file ES module builds (`.esm.min.js`) of tiny zero-dependency libraries are committed directly into `game/vendor/`, giving the ergonomics of libraries with **neither** runtime CDN calls **nor** a required build step for players.

### Specific Library & Tooling Proposals for Agentic Development

| Tool / Library | Category | What It Accelerates for Coding Agents | Payload Size (min+gzip) | License | Maintenance Status | Delivery Impact (#2 vs. #7) |
|---|---|---|---|---|---|---|
| **1. GSAP (Core) *or* Anime.js v3/v4** | SVG & UI Tweening / Timelines | **Highest-value runtime library for Quackpot.** Pull reveal choreography (capsule drop → shake → flash → burst → card flip), Pond Race lane interpolation, camera zoom onto the starter duck, and thermal Receipt unrolling are declarative 10-line timelines instead of fragile nested `setTimeout` and CSS transition chains. | **~23 KB** (GSAP Core) / **~7 KB** (Anime.js / Motion One) | MIT (Anime.js / Motion) / Standard No-Charge (GSAP) | Actively maintained (industry standard) | **Build-time bundle or local vendored `.esm.js`** (Avoids #2 network call; touches #7 only if bundled). |
| **2. ZzFX (or Vendored `jsfxr` Micro-Synth)** | Procedural Web Audio SFX | Replaces managing/loading 25 external `.wav` files with tiny 10-number parameter arrays in code (for squeaks, pull risers, coin chimes, near-miss buzzers, and dot-matrix Receipt printing). Agents can author, tweak, and version-control sound effects directly in JS. | **~1.2 KB** (ZzFX) / **~4 KB** (jsfxr player) | MIT | Stable / Complete | **Zero-network, inline ESM module** (Satisfies both #2 and #7). |
| **3. Mulberry32 / SFC32 Custom PRNG Module** | Seedable RNG (`#technology`) | `Math.random()` cannot be seeded in JS. A 15-line pure JS `mulberry32(seed)` + string hash helper satisfies `#technology` ("Random numbers through one seedable function") with zero external dependencies. | **< 0.3 KB** | Public Domain / MIT | Native JS | **Zero impact** on #2 or #7. |
| **4. Vite + Vitest (Dev/Build Only)** | Local Dev Server, Headless Sim Runner & Bundler | Accelerates `docs/project-seed.md` Packet 1 (headless economy simulation) and Packet 4 (GitHub Pages deployment) by letting agents run `vitest` on the exact same ES modules used by the browser game, plus optional tree-shaking into a static bundle. | **0 KB runtime overhead** (DevDependency only) | MIT | Actively maintained | **Preserves #2 (zero runtime network calls); updates #7** to allow a static build step. |

**Recommendation for GATE-53B:** Keep **Constraint #2 (zero external runtime network calls)** absolute, and either (a) allow `Vite` as a static build step under **Constraint #7**, or (b) vendor 1–2 tiny zero-dependency `.esm.min.js` files (an animation timeline library + procedural Web Audio synth) directly into the repository so the site still runs as plain static ES modules without even needing a bundler to open `index.html`.

---

## 9. Methodology and Limitations

- **Methodology:** This review was conducted as a single-reviewer, blind evaluation of commit `f0fe34e` across the four authorized files (`README.md`, `docs/project-seed.md`, `docs/founding/design.md`, and `reports/orchestration/founding-docs-review/baseline.md`). All post-draft owner decisions recorded on 2026-10-23 were treated as adopted direction. Arithmetic and pacing analyses were derived directly from the baseline's stated time bounds (`15 days × ~20s = ~5 minutes`), pull costs (`160 / 1,600 gems`), odds (`80% / 18% / 2%`), and pity thresholds (`35 soft / 50 hard`). The bounded gacha literature review was executed via a read-only `Flash` subagent and cross-mapped against `docs/founding/design.md#manipulation-catalog` and `#the-receipt`.
- **Limitations:**
  1. **No Live Code or Economy Simulation Executed:** Per assignment rules, no code or simulation scripts were written or run. All economy and pity-timing observations (such as Finding 7) are analytical derivations that must be verified by Packet 1's headless simulation.
  2. **No Classroom Playtest Data:** Behavioral predictions regarding high-school student reactions (e.g., early clicking of the visible `Uninstall` button or pacing of silent-duck conversations) rely on game UX heuristics and published academic literature rather than empirical classroom trials of Quackpot.

---

## 10. Most Important Open Questions for Owner Triage (GATE-53B)

1. **Pity Scaling vs. Starting Currency in a 5-Minute Window:** To ensure F2P and light-spending students actually experience soft-pity pressure (`"only X pulls from a guaranteed legendary!"`) within 15 twenty-second days, does the owner prefer **lowering the pity ceiling** (e.g., 20 soft / 25 hard) or **front-loading Day 1 welcome tickets/gems** so players rapidly reach pull 35+ on Banner 1?
2. **Fate of the Starter Duck (`[DuckName]`):** Should the player's customized starter duck remain an untouchable narrative companion throughout the run, or should late-run escalation offer a high-valence temptation to **sell/pawn `[DuckName]`** (or sacrifice it in a fusion tutorial), leaving an empty spot on the desk during subsequent silent-duck check-ins?
3. **v1 Vertical Slice Boundary:** Given that the core 5-minute experience relies on power creep, near-miss theater, and the life-expense squeeze, should `v1` expand from a 7-day / 3-technique demo to the full **15-day clock with 6 core techniques and the first 3–4 escalation steps**, deferring only deeper narrative branches (Mom's voicemails, live-streaming channel, and extra random events) to `v2`?
4. **Uninstall Button Behavior on Day 1:** Should clicking the always-visible `Uninstall` button trigger a **satirical dark-pattern retention modal** (*"`[DuckName]` will miss you! Take 80 Free Gems to stay!"*) that logs on the Receipt if accepted, and offer early Day-1 clickers a `[Play Out the Trap Anyway]` option after showing the Uninstall Receipt?
5. **Constraint #2 vs. Constraint #7 Reconciliation:** Will GATE-53B keep **Constraint #2 (zero external runtime network calls)** strict by forbidding runtime CDN links, and permit either **vendored local `.esm.min.js` files** or a **build-time bundler (`Vite`)** under Constraint #7?
