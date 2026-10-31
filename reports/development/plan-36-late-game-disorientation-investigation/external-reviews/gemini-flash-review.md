# Comprehensive Creative & Architectural Review: Quackpot and Plan 36

**Reviewer Key:** `gemini-flash`  
**Requested Model:** `gemini-flash`  
**Actual Model:** Gemini 3.8 Flash (High)  
**Harness:** Antigravity IDE / Gemini Coding Assistant  
**Date:** 2026-10-30  
**Target:** Quackpot Whole-Project Architecture & Plan 36 Investigation  
**Output Location:** External harness scratch directory (Strictly outside `C:/AI/Quackpot`)

---

## 1. Current-Versus-Proposed Capability Map

To ground this review in repository truth rather than speculation, we map current production implementations against accepted design plans, draft specifications, and our newly proposed Plan 36 extensions.

| Subsystem / Area | Current Production Implementation (`src/`) | Accepted Plans / In-Progress Authority | Proposed Plan 36 & Future Horizon | Technical & Pedagogical Risk / Uncertainty |
|---|---|---|---|---|
| **App Shell & Context Transitions** | `src/ui/stage-transition.js` runs WAAPI animations for entering (`enter`) and returning (`return`) from the phone. `src/main.js` (`onReturnToApartment`) collapses phone chrome and rotates back to portrait desk view. Static mode supported via `prefers-reduced-motion`. | Plan 14 / Plan 19 (DECISION-012, DECISION-014) established Shell A full-width stage with quiet Save/Settings and automatic phone turn. | Proposed: Asymmetrical ease-out on late-game returns; subtle phone screen ambient glow bleeding into desk lighting; optional "lingering glance" where phone remains landscape on desk before settling. Zero control lag or bounceback. | **Low Risk:** Stage transition overlay is purely presentation-layer (`aria-hidden="true"`); modifying duration or CSS properties does not touch engine state. Must preserve instant cancel on user interaction. |
| **Apartment Life Metagame & Routing** | `src/ui/life/` (`life-routing.mjs`, `life-view.js`, `life-decisions.mjs`) implements Plan 38 integration: Morning breakfast tap, institutional rent notices (Harbor Court Property Office), and object confirmation for furniture sales. | Plan 28 Direction A selected (DECISION-034): things in their places, styled HTML paper, still physical companion that travels between scenes, relaxing guidance. | Proposed: Action-based time progression (Plan 37) with 3–4 daily slots (Morning, Midday, Afternoon, Evening). Gacha activities consume slots, triggering explicit life trade-offs (e.g. skipped meals, late work shifts). | **Moderate Risk:** Adding slot-based progression requires careful state serialization in `storage.mjs` and clean backwards compatibility for historical saves. |
| **Physical Duck Companion** | `src/ui/desk-view.js` and `src/ui/life/life-art.mjs` render static SVG companion. Setup allows custom name and color styling. Inanimate and silent in all views. | DECISION-003, DECISION-034: Companion remains physical, inanimate, and non-emissive. May appear in different authored positions (desk, kitchen counter, shelf) across scenes. | Proposed: Attentional framing shift. Early days frame duck warmly centered at eye-level; later days frame duck partially obscured by unpaid bills, casting long shadows, or viewed from severe high angles to reflect character avoidance. | **Zero Mechanical Risk:** Companion stays strictly static SVG. Framing changes via CSS viewbox / viewport offsets without autonomous animation. |
| **Gacha Core & Collection** | `src/core/game-engine.mjs` manages banners, pulls, pity, and duplicate conversion to Down. `src/ui/duck-dex-view.mjs` provides voluntary collection inspection with first-owned reveal sequence. | DECISION-013, DECISION-021: 6-duck roster, 3 Down for +5% race speed, 6 Down for pull ticket. Skippable acquisition sequence. | Proposed: Narrative bleed of collection grammar into ordinary life: grocery lists formatted as item rosters with rarity colors; bills formatted as "limited-time banners." | **Low Risk:** Purely diegetic HTML/CSS presentation in apartment surfaces; does not mutate real gacha drop tables or inventory. |
| **Pond Race Engine** | `src/ui/race-view.js` runs Plan 23 individual finish model, rank-weighted weaving, 2s slow-motion highlight, duck rest penalties (Plan 22), and 3-place podium reveal. | DECISION-018, DECISION-022, DECISION-023: Actual crossing order, median 17–23s duration, at most 5% > 23s. Pause and static/reduced-motion parity. | Proposed: Character narration reflects race outcomes as life validation (e.g., "If I win this, I can afford dinner"). Race results remain 100% mechanically honest and unmanipulated. | **Zero Risk:** Race mechanics remain frozen. Narrative framing wraps around pre-race and post-race views without touching engine calculations. |
| **Append-Only Log & Receipt** | `src/core/event-log.mjs` implements hash-chained, deep-frozen event logging. `src/core/receipt.mjs` projects log into three registers: *We displayed / You did / Did this affect you?* | Plan 27 Layout A selected (Three-register cards with expandable evidence hierarchy). | Proposed: Log explicit disorientation cues shown (`disorientation_cue_shown`) without asserting player psychology. Record character narrative rationalizations distinctly from human player actions. | **Critical Contract:** Zero tolerance for claiming student felt disorientation or addiction. Receipt must only log the displayed cue and the player's recorded choice. |
| **Audio & Acoustics** | `src/audio/synth.mjs` provides local Web Audio synthesized quacks (QUACK_A, B, C). Production audio remains unmounted. | DECISION-010, Plan 18, Plan 32, Plan 33: CC/CC0 audio permitted. TV proposed as diegetic apartment music source (Plan 30); music ceases upon TV sale. | Proposed: Audio pareidolia and transient gacha music bleed on return transition, respecting mute and TV sale state. If TV is sold, apartment remains dead quiet. | **Moderate Risk:** Web Audio autoplay restrictions on browser boot; must ensure audio graph cleanly disconnects on navigation or settings toggle. |

---

## 2. Broader Game and Story Proposal: The 30+ Minute Arc

### 2.1 The Core Design Dilemma: Sustaining Engagement Without Padding
The owner's expansion of the target session to **at least roughly 30 minutes** (with no upper ceiling) cannot be achieved by padding races with artificial delays, slowing down animations, or making menus click-heavy. Students in CourseVGD are digitally literate; forced waiting breeds resentment, not reflection.

Added playtime must be **earned through narrative density, meaningful life choices, voluntary collection curiosity, and genuine friction between competing priorities.** The central dramatic engine is the clash between two economies:
1. **The Real-Life Economy:** Finite, unforgiving, slow, and linear (wages, rent, groceries, electricity).
2. **The Gacha Economy:** Elastic, dazzling, instant, and exponential (gems, pulls, pity, power creep, duplicates).

### 2.2 Six Worthwhile Developments & Interactions

1. **The Action-Slot Daily Ledger (Plan 37 Core):**  
   Divide each in-game day into 4 slots: *Morning, Midday, Afternoon, Evening*.  
   - Opening Quackpot to run races or pulls consumes a slot.  
   - Going to work consumes a slot (earning $10–$15).  
   - Preparing a meal consumes a slot (saving cash, maintaining health).  
   - *Agency & Consequence:* The student explicitly chooses how to allocate the day. Spending the Morning slot in Quackpot means breakfast is skipped; spending the Evening slot means sleep is compromised, starting Day 3 with fatigue.
   - *Cost:* Low (pure state logic in `life-routing.mjs`).

2. **The Diegetic Marketplace & Proactive Sales:**  
   Instead of furniture sales occurring only at the edge of bankruptcy (the existing emergency ladder), allow the player to post apartment items to a local classified board at any time.  
   - Selling the couch gives instant cash, which can immediately be spent on a gem bundle.  
   - *Consequence:* The living room visibly empties. The apartment view updates dynamically, leaving a faded dust outline on the floor where the couch stood.  
   - *Receipt Impact:* The Receipt links the chain of events: *"You sold your couch for $40.00; 15 minutes later, you bought the 2,240 Gem Bundle for $39.99."*  
   - *Cost:* Moderate (requires state flags and CSS floor-stain art in `life-art.mjs`).

3. **The Outside Anchor: Grounded Human Communications:**  
   Introduce realistic, non-moralizing outside voices through paper notes and text messages:  
   - *Harbor Court Property Office:* Cold, institutional, predictable rent notices.  
   - *Ruth (Downstairs Neighbor):* Friendly, asking if the character wants to share a home-cooked stew or help carry groceries, offering a free, warm recovery beat.  
   - *Work Supervisor (Marcus):* Offering an optional weekend overtime shift ($20.00), but warning that missing consecutive scheduled shifts will terminate employment.  
   - *Agency:* The player can accept outside help, ignore it to keep pulling, or take shifts to fund gacha spending.  
   - *Cost:* Low (styled HTML paper and phone notification text).

4. **The "Inventory Gaze" Grocery Shopping:**  
   On Day 3, the character needs groceries. The shopping list on the kitchen counter allows choosing between:  
   - *Budget Bulk Oatmeal ($3.00, +1 Health)*  
   - *Balanced Groceries ($12.00, +3 Health)*  
   - *Instant Coffee & Energy Drink ($4.00, +0 Health, restores 1 Gacha Action Slot)*  
   - *Skip Groceries ($0.00, -1 Health)*  
   - *Pedagogical Value:* Mirrors how real microtransactions lead players to cut real-world food budgets ("I'll just eat instant noodles this week so I can get the banner duck").  
   - *Cost:* Low (extends `life-decisions.mjs`).

5. **Voluntary Duck-Dex Study & Power Creep Realization:**  
   Encourage voluntary Duck-Dex inspection by showing concrete statistical speed deltas between Banner 1 and Banner 2 ducks.  
   - When Banner 2 drops with ducks that are 15% faster, the Duck-Dex comparison clearly shows that yesterday's hard-won Legendary duck is now obsolete in top-tier races.  
   - *Agency:* The player decides whether to pull on the new banner, rely on Down upgrades, or accept lower race placements.  
   - *Cost:* Low (already supported by Plan 21 Duck-Dex inspector).

6. **The Park Walk with the Companion (Off-Ramp Interaction):**  
   In the afternoon, the player can choose an optional action: *"Take [DuckName] to the park fountain."*  
   - The scene does not show a new 3D world; it shows the apartment door closing, a brief reflective text beat, and a return with refreshed composure and zero financial cost.  
   - *Agency:* A deliberate, peaceful alternative to screen absorption. Demonstrates that stepping away from the phone is an active, positive choice.  
   - *Cost:* Very low (text transition within current apartment shell).

### 2.3 What to Explicitly Omit
- **Omit Multi-Room Exploration Games:** Do not turn the apartment into a point-and-click pixel hunt. Stick to the accepted Direction A compositions (desk, kitchen counter, living room TV).
- **Omit Streamer / Social Media Mechanics:** The streamer branch (D1) remains deferred. Simulating follower counts, live chat, or webcam equipment distracts from the core financial/psychological squeeze.
- **Omit Real-Time Punishments:** Never penalize a student for taking a phone call, reading slowly, or leaving the browser open during class.

---

### 2.4 Two Contrasting Narrative Arcs

To avoid lecturing students with a single preachy narrative of inevitable degradation, we present two fully realized contrasting arcs:

```
                  [ Day 1: Shared Opening ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Arc A: System Optimizer ]      [ Arc B: Quiet Drift & Recovery ]
   - Gacha treated as an investment  - Gacha as ambient procrastination
   - Cuts food/sleep to maximize     - Misses chores and forgets time
     gem efficiency and pity         - Experiences audio pareidolia
   - Sells couch/TV calculatedly     - Reconnects with neighbor / walks
   - Confronts structural paywall    - Reaches conscious, relieved
     despite "flawless" math           Uninstall without bankruptcy
```

#### Arc A: The "System Optimizer" (The Spreadsheet Trap)
- **Character Mindset:** Analytical, confident, detached. The character believes gacha games are purely mathematical systems to be beaten through discipline, pity tracking, and secondary-currency arbitrage.
- **Story Beats:**
  - Day 2: Character calculates Down-to-gem efficiency and notes in their journal: *"If I buy the $4.99 pack now, I hit soft pity on Banner 1, which guarantees a podium finish in Race 2, repaying 40% of the gem value."*
  - Day 3: Character skips lunch not out of desperation, but as a deliberate budget reallocation: *"A $5 sandwich is 330 gems. That's two pulls. Easy trade."*
  - Day 4: Sells the living room TV to fund a 10-pull, coldly noting that the TV was an inefficient entertainment source compared to mobile racing.
  - Day 5 (The Wall): A new banner launches with a 20% speed power creep and altered pity rules. The math breaks down. The character realizes the system was never designed to be "solved" by skill—it was designed to move the goalposts.
- **Ending & Debrief:** The player uninstalls in disgust or runs out of cash despite optimal play. The Receipt highlights the cold calculation: *"You calculated Down conversion 14 times; you made 100% of your race choices based on optimal stats; you still spent $45.00 of real rent money. Can a commercial game be beaten by math if the publisher controls the rules?"*

#### Arc B: The "Quiet Drift & Grounded Recovery" (The Procrastination Spiral)
- **Character Mindset:** Stressed, overwhelmed by mundane responsibilities, using Quackpot as a cozy escape.
- **Story Beats:**
  - Day 2: Character opens the phone to check daily check-in rewards while boiling water for tea. Becomes absorbed in duck accessories; returns to find the kettle boiled dry.
  - Day 3: Rent notice arrives. Character feels an anxious knot, opens Quackpot "just for a second" to decompress, and burns the morning slot. The rent remains unpaid.
  - Day 4: Disorientation manifests. Traffic outside sounds like gacha race horns. The character looks at the physical rubber duck on the desk; it is half-hidden behind junk mail, feeling like a silent reproach.
  - Day 5 (The Turning Point): Downstairs neighbor Ruth knocks and leaves a warm container of soup with a handwritten note. The character eats real food. The player is presented with a choice: *Open Quackpot* or *Take the duck for a walk to the park.*
  - Choosing the park leads to a moment of quiet clarity. The player clicks Uninstall from the settings canopy.
- **Ending & Debrief:** The character uninstalls peacefully. The Receipt shows early exit with minimal debt: *"You experienced 3 banner FOMO messages; you spent $0.99 on the starter pack; you chose to leave on Day 5. What prompted you to close the app?"*

---

## 3. Pacing Bands for a 30+ Minute Engaged Experience

The table below details how player time is distributed across the core and optional layers. These numbers represent **design assumptions awaiting classroom validation**, not enforced timers.

| Game Day / Phase | Core Mechanics (Pulls, Races, Upgrades) | Diegetic Apartment Life (Reading, Meals, Bills) | Disorientation & Reflective Beats | Total Estimated Engaged Time | Rapid Low-Reading Reference |
|---|---|---|---|---|---|
| **Day 1: Onboarding** | 3.5 min (Free 10-pull, reveal cards, tutorial race) | 2.5 min (Companion styling, desk intro, breakfast tap) | 0.5 min (Baseline quiet apartment, clear lighting) | **6.5 min** | 3.0 min |
| **Day 2: The First Squeeze** | 4.0 min (Midday race, rest check, starter offer review) | 3.5 min (Day 2 breakfast, Harbor Court rent notice $15) | 1.0 min (First return transition linger, kettle boil narrative) | **8.5 min** | 3.5 min |
| **Day 3: Deepening Commitments** | 4.5 min (Banner rotation, Down shop, stance choice) | 4.0 min (Grocery decision, shift notice, bank balance check) | 2.0 min (Rarity grammar on mail, phone glow in dusk) | **10.5 min** | 4.0 min |
| **Day 4: Friction & Escalation** | 5.0 min (Fatigued duck management, 10-pull temptation) | 4.5 min (Emergency bill, couch sale offer, neighbor note) | 2.5 min (Audio pareidolia, awkward duck camera angle) | **12.0 min** | 4.5 min |
| **Day 5+: Divergence & Terminal Horizon** | 4.0 min (Final high-stakes race or pawn offer evaluation) | 3.5 min (Final life choice: walk, work shift, or debt) | 2.5 min (Music bleed, lingering gacha thoughts) | **10.0 min** | 3.0 min |
| **Debrief: The Receipt** | 0.0 min | 0.0 min | 6.0 min (Careful reading of 3 registers, reflection questions) | **6.0 min** | 2.0 min |
| **Total Experience** | **21.0 min** | **18.0 min** | **14.5 min** | **53.5 min** | **20.0 min** |

### Where Added Time Earns Its Place
- **No Forced Pauses:** Every minute is spent reading meaningful character copy, examining authentic microtransaction odds, or making trade-offs.
- **Duck-Dex Exploration:** Browsing owned ducks, viewing set bonuses, and reading satirical lore takes 3–5 minutes of self-directed student curiosity.
- **Receipt Reflection:** A substantive Receipt is not dismissed in 10 seconds; students read the three-register cards, cross-reference their choices with displayed cues, and prepare for classroom discussion (5–8 minutes).

### Early Exit Dignity
If a student uninstalls on Day 2 or Day 3, the session concludes in 12–15 minutes. The Receipt immediately projects:
- Exactly which cues fired before exit (e.g. Starter Pack 400% anchor, retention modal 80-gem offer).
- The student's decisive action: *"Chose to leave immediately without accepting retention gems."*
- Discussion Prompt: *"You uninstalled early. What specific cue or requirement triggered your decision to walk away?"*  
In the classroom, this student becomes the crucial counterweight to classmates who stayed until bankruptcy.

---

## 4. Plan 36 Menu of Disorientation & Spillover Effects

Below is a curated menu of 10 candidate effects across three families, followed by an in-depth specification of the shortlisted candidates.

### 4.1 Candidate Menu

#### Family A: Transitions & Spatial Continuity
1. **The Asymmetrical Ease-Out:** Entering the phone is fast, snappy, and exciting (240ms); returning to the apartment in late stages eases out slowly (600–800ms) with a gentle fade, conveying mental friction when leaving the game.
2. **The Horizontal Phone Linger:** Upon return, the phone doesn't instantly snap back into its upright desktop stand; it remains resting horizontally on the desk for 1.5 seconds, screen still dimly glowing, as if the character hasn't fully put it down.
3. **The Ambient Screen Bleed:** When returning to the apartment at dusk or evening, the phone screen casts a rhythmic, flickering cool-blue light onto the wooden desk and walls, visibly overpowering the warm domestic lamp.
4. **Transient Audio Bleed (Plan 30 Parity):** Gacha music continues playing for 2–3 seconds after returning to the apartment, softly decaying into silence. *Strict Constraint:* If the player sold the TV (or has audio muted in Settings), the apartment remains completely dead silent.

#### Family B: Gacha Imagery & Habits in Ordinary Life
5. **Rarity Grammar on Life Notices:** Mundane apartment mail adopts gacha typography: a past-due electric bill displays a glowing purple *"EPIC NOTICE"* header; a grocery flyer categorizes generic beans as *"COMMON TIER."*
6. **The Silhouetted Absence:** When the character sells the couch or TV to buy gems, the furniture doesn't just vanish cleanly; a distinct, faded dust silhouette and unplugged cord remain visible on the floor and wall.
7. **Meal Receipt Duck-Dex Layout:** Checking the grocery slip or restaurant receipt displays the items arranged in standard 3x3 trading-card grids, complete with fake rarity borders.
8. **The Pawning Ghost:** If the player accepts the late pawn offer for their physical duck, the empty desk spot features an SVG dust ring and an occasional soft phantom highlight where the duck used to sit.

#### Family C: Unreliable Narration & Temporal Compression
9. **Selective Temporal Compression ("Just One Race"):** The narrative text notes the character opening the phone for *"a quick 30-second race,"* followed immediately by an apartment scene where the window lighting has shifted from afternoon gold to deep dusk, and the tea on the counter has gone cold.
10. **Audio Pareidolia (The Phantom Quack):** While reading a work email or listening to the apartment kettle boil, the character’s inner narration describes hearing a faint race horn or celebratory quack, only to realize it was the steam whistle.

---

### 4.2 Shortlist of Complementary Effects (Detailed Specification)

We select **four complementary, non-conflicting effects** that span transitions, visual environment, narration, and audio:

```
[Effect 1: Asymmetrical Ease-Out] ──► Transition Layer (Phone -> Room)
[Effect 2: Ambient Screen Bleed]   ──► Environment Layer (Desk Scene)
[Effect 3: Rarity Grammar on Mail] ──► Narrative / Life Object Layer
[Effect 4: Audio Pareidolia]       ──► Internal Narration Layer
```

#### Specification Matrix

```yaml
Effect 1: Asymmetrical Return Transition
  Purpose: Suggest cognitive absorption and reluctance to disengage without adding input delay.
  Stage Eligibility: Days 3–5+ (Activates only after player has made at least 2 paid pulls or 3 races).
  Seeded Variation: Triggered on deterministic stream B; maximum 3 occurrences per run.
  Duration / Timing: Enter transition remains 240ms; return transition lengthens from 240ms to 650ms.
  Interruption & Exit: Any click, keypress (Escape/Space), or Uninstall click immediately cancels transition and renders destination instantly.
  Save / Reload Lifecycle: Transition state is transient and never saved. Reloading restores direct target view.
  Accessible Equivalent: Under prefers-reduced-motion: true, transition is an instant clean cut (0ms). No motion or timing changes.
  Grounded Counterpoint: On Day 1 and Day 2, returns are snappy (240ms). On Day 4, a quiet, immediate return occurs after a non-gacha life action.
  Actual Evidence Logged: event_log records { type: 'cue_shown', payload: { cue: 'transition_asymmetric_ease', durationMs: 650, stage: 'd3_evening' } }.
  Pedagogical Safety: No real controls are disabled. HUD buttons (Save, Settings, Uninstall) remain 100% clickable throughout.

Effect 2: Phone Ambient Screen Bleed
  Purpose: Visually demonstrate the intrusion of the digital game into the physical living space.
  Stage Eligibility: Days 2–5 (Evening and Night slots).
  Seeded Variation: Active whenever phone is in desk stand during low-light apartment scenes.
  Duration / Timing: Gentle, continuous CSS opacity breathing cycle (3.5s ease-in-out, baseline 0.35, peak 0.85).
  Interruption & Exit: Toggleable in Settings ("Ambient Glow: On/Off").
  Save / Reload Lifecycle: Governed purely by current scene lighting state (Day/Night) and settings flag.
  Accessible Equivalent: Reduced-motion mode freezes glow at static 0.5 opacity with zero pulsing.
  Grounded Counterpoint: Daytime desk views feature natural window sunlight with zero phone glow.
  Actual Evidence Logged: event_log records { type: 'cue_shown', payload: { cue: 'ambient_screen_bleed', context: 'desk_dusk' } }.
  Pedagogical Safety: Emissive glow is applied to desk surface via CSS radial gradient; physical companion duck remains 100% non-emissive and inanimate.

Effect 3: Rarity Grammar on Apartment Notices
  Purpose: Illustrate how gacha monetization language reframes ordinary financial obligations.
  Stage Eligibility: Day 3 morning (Grocery flyer) and Day 4 morning (Late utility bill).
  Seeded Variation: Fixed narrative cue on Day 4 if rent/bills are unpaid; repeat cap: 2 times per run.
  Duration / Timing: Persistent until notice is put down or paid.
  Interruption & Exit: Putting down the letter closes the view immediately.
  Save / Reload Lifecycle: Stored deterministically in engine state as { noticeStyle: 'gacha_framed' }. Reload preserves exact copy.
  Accessible Equivalent: Semantic HTML text is preserved in full for screen readers: "Past Due Notice ($25.00)" with supplementary subtitle "[Framed as Legendary Urgency]".
  Grounded Counterpoint: Day 1 rent notice is 100% clean, institutional, black-and-white paper with no decorative gaming borders.
  Actual Evidence Logged: event_log records { type: 'cue_shown', payload: { cue: 'rarity_grammar_notice', document: 'utility_bill_d4' } }.
  Pedagogical Safety: Real dollar amounts, payment buttons, and terms remain perfectly legible. No obfuscated numbers.

Effect 4: Audio Pareidolia (The Phantom Quack)
  Purpose: Evoke the psychological phenomenon of hearing notification phantom sounds without actual sound playback.
  Stage Eligibility: Day 3 or Day 4 afternoon, during an apartment life scene.
  Seeded Variation: Triggered once per run when boiling tea or inspecting the kitchen.
  Duration / Timing: A 1.2s narrative text beat: the text describes a faint quack, followed by a soft ambient kettle hiss (or pure text if audio muted).
  Interruption & Exit: Skip button immediately dismisses the text.
  Save / Reload Lifecycle: One-shot event flag in event log; will not re-trigger on reload.
  Accessible Equivalent: Displayed clearly in descriptive caption text for deaf and hard-of-hearing users: "[A faint, cheerful duck quack seems to echo over the sound of the kettle.]"
  Grounded Counterpoint: Ordinary kitchen sounds on Day 1 have no narrative commentary.
  Actual Evidence Logged: event_log records { type: 'cue_shown', payload: { cue: 'narration_audio_pareidolia', trigger: 'kettle_boil' } }.
  Pedagogical Safety: Does not blast unexpected audio. Uses standard Web Audio synthesis at soft -18dB or pure descriptive text. Honors master mute.
```

---

## 5. Three Concrete Scene Treatments

### Treatment 1: Early Intrusion (Day 2 Evening — "The Cold Kettle")
- **Context:** The character has completed their Day 2 race and returns to the apartment to prepare dinner before evening work.
- **Ordinary Version:**  
  The player returns to the desk. The kitchen counter shows a kettle on the stove. The player taps *Put on kettle*, pays $2.00 for instant noodles, and the day advances cleanly to Evening.
- **Disturbed Version:**  
  - *Visual Sequence:* The transition from the phone back to the desk lingers slightly (500ms). The phone rests on the desk with its screen still softly glowing.
  - *Narration Copy:*  
    > *"You put the kettle on the ring. Just five minutes before it boils. Just enough time to check the new banner countdown."*
  - *Player Choice:* Two clear buttons appear on the desk:
    1. `[ Open Quackpot ]` *(Takes 1 Action Slot)*
    2. `[ Wait by the stove ]` *(Advance to Dinner)*
  - If the player clicks `[ Open Quackpot ]`, they enter the gacha. When they return 2 minutes later, the scene text reads:
    > *"The burner is clicking. The kettle has boiled dry, filling the small kitchen with a hot, metallic smell. You turn off the gas. Dinner will have to wait."*
- **Reduced-Motion / Static Equivalent:** Instant cut between screens; cold kettle described in static text without animated steam or screen shake.
- **Grounded Counterpoint:** On Day 1, waiting by the stove produces a piping hot cup of tea with warm narrative satisfaction.
- **Receipt Evidence:**  
  - *We displayed:* "Decision to open Quackpot while kettle was on the stove."
  - *You did:* "Chose 'Open Quackpot'; missed dinner; health decreased by 1."
  - *Did this affect you?:* "Did the feeling of having 'five minutes to spare' influence your decision to reopen the game?"

---

### Treatment 2: Sustained Spillover (Day 4 Morning — "The Categorized Pantry")
- **Context:** Day 4 begins. The character has $8.00 in cash, and a $20.00 utility bill is sitting on the kitchen table.
- **Ordinary Version:**  
  A simple paper bill lists: *"City Power & Light: $20.00 Due."* The pantry shows: *Bread, peanut butter, tea.*
- **Disturbed Version:**  
  - *Visual Sequence:* The apartment table is rendered in the accepted paper style. When the player clicks on the grocery cupboard, the items are presented in a diegetic 3-column card frame echoing the Duck-Dex UI:
    - Card 1 (Grey border): `Stale White Bread (x4)` — *Common. Restores minimal stamina.*
    - Card 2 (Blue border): `Store-Brand Peanut Butter` — *Rare. High caloric density.*
    - Card 3 (Gold border, locked silhouette): `Fresh Deli Sandwich ($7.50)` — *Legendary. Guaranteed satisfaction. (Costs 500 Gem Equivalent).*
  - *Narration Copy:*  
    > *"You stare into the cupboard, unconsciously sorting the jars by rarity. $7.50 for a deli sandwich feels absurdly steep. That’s almost five single pulls. You can survive on peanut butter."*
  - *Player Choice:*
    1. `[ Eat Peanut Butter ($0.00) ]` *(Health unchanged)*
    2. `[ Buy Deli Sandwich ($7.50) ]` *(Leaves $0.50 cash)*
- **Reduced-Motion / Static Equivalent:** Unanimated card frames; zero hover zoom; clean typography readable by screen readers.
- **Grounded Counterpoint:** Day 1 breakfast has no rarity labels or pull-cost comparisons.
- **Receipt Evidence:**  
  - *We displayed:* "Grocery items presented with rarity borders and gem-equivalent price tags."
  - *You did:* "Chose to eat free pantry rations; preserved $7.50 cash balance."
  - *Did this affect you?:* "Did comparing real-world food costs to fictional pull prices change how you evaluated your spending?"

---

### Treatment 3: Later Ambiguity or Recovery (Day 6 Afternoon — "The Park Bench")
- **Context:** Following a difficult Day 5 where rent was paid via emergency overtime, the character has an open afternoon slot.
- **Ordinary Version:**  
  The player can click *Go to Work* or *Open Phone*.
- **Disturbed / Recovery Choice:**  
  - *Visual Sequence:* The living room is quiet. The physical rubber duck sits on the small hallway table by the coat rack. The door is highlighted with a gentle amber rim.
  - *Narration Copy:*  
    > *"The phone buzzes in your pocket with a limited-time race alert: 'Rival whale spotted in Lane 1!' Outside, the afternoon rain has cleared, leaving wet asphalt and cold sunlight. [DuckName] sits by your keys, yellow and perfectly still."*
  - *Player Choices:*
    1. `[ Take [DuckName] for a walk to the park ]` *(Free, consumes 1 slot)*
    2. `[ Answer the Race Alert on Phone ]` *(Enter Pond Race)*
    3. `[ Uninstall Quackpot ]` *(Available in HUD Settings / persistent canopy)*
  - *Consequence of Choosing Park:*  
    The screen transitions to a quiet text interlude:
    > *"You sit on a damp wooden bench with [DuckName] on your knee. Real pigeons bicker around a discarded pretzel. No countdown banners. No pity counters. Just cold air. For the first time in three days, your shoulders drop."*  
    Upon return, the character's health is restored by +2, and the Uninstall button is given a gentle, quiet focus indicator.
- **Reduced-Motion / Static Equivalent:** Instant transition to park scene; zero camera panning.
- **Grounded Counterpoint:** Choosing the Race Alert plunges the player immediately into high-energy gacha music and dramatic oval racing.
- **Receipt Evidence:**  
  - *We displayed:* "Simultaneous display of 'Rival Whale Alert' push notification and 'Walk in the Park' opportunity."
  - *You did:* "Chose 'Walk in the Park'; deferred gacha session for 1 slot."
  - *Did this affect you?:* "When faced with both a time-limited game event and a peaceful real-world activity, what guided your choice?"

---

## 6. Example Receipt Excerpt

Below is an authentic three-register Receipt excerpt demonstrating how Plan 36 disorientation cues are reported with absolute factual honesty, separating system presentation from character narration and player action.

```markdown
================================================================================
                                QUACKPOT DEBRIEF
                       Harbor Court Tenant Run Record #4b-982
================================================================================

[TECHNIQUE: COGNITIVE SPILLOVER & RARITY FRAMING]
--------------------------------------------------------------------------------
WE DISPLAYED:
  - Day 4, 08:30: Apartment grocery inventory was presented with gacha rarity borders 
    (Common / Rare / Legendary) and displayed the message: "Deli Sandwich: $7.50 
    (500 Gem Equivalent)." (Log seq #042)
  - Day 4, 18:15: Phone return transition duration was extended to 650ms; ambient 
    screen glow was rendered on desk surface during evening scene. (Log seq #058)

YOU DID:
  - Day 4, 08:32: You chose "Eat Peanut Butter ($0.00)" instead of purchasing groceries. 
    (Log seq #043)
  - Day 4, 18:16: You immediately clicked "Open Quackpot" 4.2 seconds after returning 
    to the desk. (Log seq #059)
  - Day 4, 18:20: You purchased the 330 Gem Bundle for $2.99 using emergency funds. 
    (Log seq #064)

DID THIS AFFECT YOU?
  - When mundane apartment items and bills were framed using the game's rarity colors 
    and pull costs, did it make real-world expenses feel more or less significant?
--------------------------------------------------------------------------------

[TECHNIQUE: EXIT FRICTION & RETENTION PROMPTING]
--------------------------------------------------------------------------------
WE DISPLAYED:
  - Day 5, 14:10: When you clicked "Uninstall", a modal was displayed offering 
    80 Free Gems and the option to "Play out the trap." (Log seq #081)

YOU DID:
  - Day 5, 14:12: You clicked "Leave Immediately" and confirmed uninstallation. 
    (Log seq #082)

DID THIS AFFECT YOU?
  - Did the offer of free currency make you hesitate before confirming your exit?
--------------------------------------------------------------------------------
```

*Note on Pedagogy:* Notice that the Receipt never asserts: *"You felt addicted,"* *"You forgot to eat because of the game,"* or *"The glow mesmerized you."* It reports the exact pixel layout shown, the exact button clicked, and leaves the psychological interpretation entirely to the student and their classmates.

---

## 7. Bounded Investigation Recommendations & Falsification Criteria

### 7.1 Prioritized Investigation Roadmap

1. **Step 1: Prototype Candidate 3 (Rarity Grammar on Paper Notices) in Isolation**  
   - *Target:* A small, report-local HTML/CSS comparison in `reports/development/plan-36-late-game-disorientation-investigation/prototypes/notices/`.  
   - *Test:* Display a standard rent bill alongside a gacha-framed utility bill. Inspect keyboard accessibility, screen-reader markup, and readability.  
   - *Resource Cost:* Zero engine changes; pure static HTML/CSS.

2. **Step 2: Prototype Candidate 1 & 2 (Asymmetrical Return & Desk Screen Bleed)**  
   - *Target:* Report-local testbench demonstrating the 240ms enter vs. 650ms return transition with ambient desk lighting.  
   - *Verification:* Verify that clicking `Uninstall` or pressing `Escape` during the transition instantly cancels the animation and brings up the target modal without delay.

3. **Step 3: Action-Based Daily Slot Formalization (Coordinate with Plan 37)**  
   - *Target:* Specify the exact state transition schema in `life-routing.mjs` for advancing slots (Morning -> Midday -> Afternoon -> Evening) before writing story copy.

---

### 7.2 What Would Falsify Our Favorite Ideas?

We adhere to strict falsification criteria. If any of the following observations occur during prototype evaluation, the corresponding idea must be immediately rejected:

- **Falsifier 1 (Input Sabotage):** If user testing on classroom-spec hardware reveals that players perceive the 650ms asymmetrical return transition as *browser sluggishness, dropped frames, or broken software* rather than authored narrative weight, **the asymmetrical transition must be abandoned** in favor of a clean, instantaneous cut paired with explicit character narration.
- **Falsifier 2 (Accessibility Impediment):** If screen-reader software (NVDA / VoiceOver) stumbles over the rarity-framed notices or reads CSS gradient tags as unpronounceable characters, **the visual rarity styling must be stripped**, leaving plain, accessible HTML text.
- **Falsifier 3 (Moralizing Perception):** If student feedback in pilot reviews indicates that students feel "scolded" or "judged" by the character's narration (e.g. feeling that the game is calling them foolish for pulling), **the narrative voice must be retuned to be more empathetic, dry, and neutral.**

---

### 7.3 Unresolved Owner Decisions

The following architectural questions require owner determination before implementation:
1. **Action-Slot Budget Finalization:** Does the owner approve a 4-slot daily structure (Morning, Midday, Afternoon, Evening) for all days after Day 2?
2. **Outside Voices Canonization:** Does the owner authorize named recurring secondary characters (Ruth downstairs, Supervisor Marcus) for optional non-gacha life branches?
3. **Disorientation Trigger Rule:** Should disorientation cues be linked strictly to **elapsed in-game day count** (e.g. Day 4+), or conditionally triggered by **cumulative gem spending / missed meals**? *(Our recommendation: Link strictly to in-game day count to ensure every student encounters the learning material regardless of spending style).*
