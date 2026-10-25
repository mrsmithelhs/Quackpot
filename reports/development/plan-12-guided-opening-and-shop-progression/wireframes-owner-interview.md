# Plan 12 Wireframe Owner Interview Record

**Date Started:** 2026-10-25  
**Artifact Evaluated:** [`reports/development/plan-12-guided-opening-and-shop-progression/wireframes.html`](file:///C:/AI/Quackpot/reports/development/plan-12-guided-opening-and-shop-progression/wireframes.html)  
**Context:** Plan 12 Investigation (Guided Opening & Progressive Shop Progression)  
**Interview Scope:** Structured step-by-step owner evaluation of wireframe sections, scoped features, presentation models, and pedagogical guardrails.

---

## Interview Progression Tracker

| Step | Topic / Wireframe Section | Status |
| :--- | :--- | :--- |
| **Step 1** | Header, Layout & Accessibility Controls (Reduced Motion, High Contrast, Audio) | **Accepted** |
| **Step 2** | Storyboard Beats 1 & 2: Apartment Desk, Physical Companion & Smartphone Invitation | **Feedback Logged for Orchestration** |
| **Step 3** | Storyboard Beats 3 & 4: Free 10-Pull, Staged Gems & First Pond Race Payoff | **Feedback Logged for Orchestration** |
| **Step 4** | Storyboard Beat 5: Starter Anchor Modal ($0.99, "400% VALUE!", Cash Squeeze) | **Feedback Logged for Orchestration** |
| **Step 5** | Tab 2: Duplicates & Down Dilemma (Case A vs Case B Anti-Rigging Architecture) | **Feedback Logged for Orchestration** |
| **Step 6** | Tab 3: Progressive Shop (Stage 1 Starter vs Stage 2 Odd Bundles & Down Exchange) | **Feedback Logged for Orchestration** |
| **Step 7** | Tabs 4 & 5: Misunderstanding Risks & Mock Receipt Attribution | **Feedback Logged for Orchestration** |

---

## Step-by-Step Interview Notes

### Step 1: Header, Layout & Accessibility Controls
- **Features Presented by Plan 12:**
  - Game title *Quackpot* with "Wireframe Mockup" pill and baseline financial timeline summary.
  - Instant accessibility toggles: Reduced Motion (disables transforms, transitions, card flips), High Contrast (WCAG AAA palette), and Synthesized Web Audio toggle.
  - Five-tab navigation structure.
  - Live ARIA narrative transcript logger at the base of the canvas.
- **Owner Feedback:** Accepted without changes. Header, toggles, and layout approved for review.
- **Disposition:** Kept as presented.

---

### Step 2: Storyboard Beats 1 & 2 (Apartment Desk Setup & Smartphone Invitation)
- **Features Presented by Plan 12:**
  - Beat 1: Apartment desk blotter, Cash: $15.00, Rent: $15.00 due Day 2, 2D physical duck customization (name, accessory: tie, plain, chef hat).
  - Beat 2: Dormant smartphone illuminates with warm gold glow and chime; invitation prompt: *"Special Welcome Gift Waiting! Tap to Claim 10-Pull!"*.
  - Diegetic boundary between inanimate desk companion and digital gacha game.
- **Owner Feedback:**
  1. *Companion Customization:* Good starting options; for the real game, expand to base color and more accessory options. (Bug noted: selecting chef hat in wireframe previously rendered plain duck).
  2. *Device Orientation & Stage Aspect Ratio:* Phone invitation is clever and recognizable as separate from the metagame, but portrait phone implies the gacha will be played in a tiny portrait box. Recommended adding a visual transition where the phone prompts the user to rotate 90 degrees into landscape orientation (suited for student laptops/desktops). After rotation, the phone frame expands to fill the stage, visually conveying immersion into the gacha game.
  3. *Fictional Gacha Game Naming:* Provide candidate title options for the fictional gacha app itself.
- **Logged Recommendations for Orchestration & Refinement:**
  - *Bug Fix:* Ensure Chef Hat accessory renders when selected in Beat 1 companion customization (add missing SVG chef hat elements and update toggle).
  - *Landscape Transition & Immersion Expansion:* Introduce an explicit device transition in Beat 2 where the phone rotates 90° into landscape orientation (16:9 view appropriate for student laptops) and then expands into the full-stage game canvas for Beat 3, visually representing entering the gacha game.
  - *Fictional Gacha Subtitle Options:* Proposed candidates for the internal gacha app title: *Quackpot: Pond Championship*, *Quackpot: Duck Dynasty*, *Quackpot: Golden Feather*.
  - *Production Scope Note:* In real game implementation, expand companion customization to base color variations and additional accessories.

---

### Step 3: Storyboard Beats 3 & 4 (Free 10-Pull, Staged Gems & First Pond Race Payoff)
- **Features Presented by Plan 12:**
  - Beat 3:
    - Quackpot App Home screen with HUD.
    - Currency gating: Gem counter dormant/unlit at 0 (`💎 0 Gems`, 40% opacity) and Down currency completely hidden until duplicates are actually encountered.
    - Special Rookie Welcome Banner offering 100% discount on a 10-pull (normally 160 gems each, 1600 gems for 10-pull).
    - Transparent base odds pill (`Common 80.0% | Rare 18.0% | Legendary 2.0%`) with a clickable Odds Details modal.
    - Reveal Theater with card-by-card reveal or instant "⏩ Reveal All / Skip" control.
    - Currency illumination: Gems counter illuminates upon pull completion at 0.
  - Beat 4:
    - Intervening living expense notice: Day 1 Midday Food (-$5.00) paid, cash is now $10.00.
    - Rookie Sprint race: 100m sprint against field AI bots.
    - Zero-poverty rule demonstration: Common beginner duck (`Rubber Mallard`, Speed 10.0) easily beats tutorial field (Speed 8.0) without needing premium gacha or pay-to-win upgrades.
    - Victory & Reward: 1st Place awards +50 Gems bounty.
    - Odd-currency friction setup: Gacha pull costs 160 Gems; player now has 50 Gems (110 Gems short), priming Beat 5's starter pack.
- **Owner Feedback:**
  1. *Reveal Theater Pacing & Transparency:* The instant skip toggle preserves student pacing and accessibility, while displaying exact base odds upfront aligns with transparency requirements.
  2. *Currency Gating:* Dormant Gems (illuminated only post-pull) and hidden Down currency effectively minimize rookie cognitive overload until mechanics are actually relevant.
  3. *Race Payoff & Friction:* The First Pond Race cleanly establishes that Common ducks can win tutorial content without spending, while the +50 Gem prize (leaving the player at 50/160 gems) sets up classic fractional friction.
  4. *Production Pacing & Audio (Owner Guidance):* Ensure the reveal theater later gets re-integrated to feature full anticipation beats and animations, along with differentiated sound effects for different rarity tiers (Common vs. Rare vs. Legendary). Similarly, recognize that the pond race is an abstraction in the wireframe and will be restored to a richer, more engaging visual experience during full implementation.
- **Logged Recommendations for Orchestration & Refinement:**
  - Retain the reveal skip button, transparent odds pill, and progressive currency gating.
  - In production implementation specs (coordinated with Plan 14/15 and audio plans): specify tiered sound effects (distinct chimes/fanfares for Common vs. Rare/Legendary), reveal suspense pacing, and full 2D pond race presentation beyond the wireframe progress bar.

---

### Step 4: Storyboard Beat 5 (Starter Pack Modal: $0.99 for 240 Gems, "400% VALUE!", and Rent Shortfall)
- **Features Presented by Plan 12:**
  - Introductory Starter Pack Pop-up Modal appearing immediately after returning to home screen following Beat 4's race victory.
  - Price & Currency: $0.99 for 240 Premium Gems with a prominent "400% VALUE!" badge.
  - Fictional Cash context: "Your Fictional Cash: $10.00 (Leaves $9.01)".
  - Fractional currency friction: 240 gems alone gives 1 pull (160 gems) with 80 leftover; combined with 50 race gems (290 total), gives 1 pull with 130 leftover (30 short of a 2nd pull).
  - Living expense cash squeeze: Day 1 cash ($10.00) drops to $9.01 upon purchase. With Evening Wage (+$10) and Day 2 Food (-$5), cash reaches $14.01 against the $15.00 rent bill—triggering an exact $0.99 rent shortfall. Declining preserves $10.00, meeting rent exactly at $15.00.
  - Honest Mathematical Disclosure box in the modal explaining leftover gems, rent shortfall arithmetic, and that "400% value" is an unverified publisher marketing anchor.
  - Actions: Primary "BUY FOR $0.99" vs Secondary "Maybe Later".
- **Owner Feedback:**
  1. *Starter Offer Mechanics & Friction:* The starter modal and anchoring work well: $0.99 for 240 gems ("400% VALUE!") captures predatory introductory pricing, and the 80/130 leftover gem trap cleanly demonstrates fractional currency manipulation.
  2. *Cash Timeline Impact:* The financial cash timeline ($10.00 -> $9.01 leading to a $0.99 rent shortfall on Day 2) provides an impactful lesson in the Receipt without feeling rigged or unfair.
  3. *Dark Pattern Commercial Pressure:* The modal should look more pushy and aggressive (e.g. smaller or faded "Maybe Later" button, a countdown timer, or a "Best Deal" ribbon) to reflect real commercial pressure in gacha games.
  4. *Pedagogical Disclosure Distinction:* The honest disclosure box in the wireframe is great for design review and teacher inspection, but in live gameplay this analytical breakdown should be deferred to the end-of-run Receipt rather than spoon-fed inside the gacha modal itself (students should experience the manipulation organically before debriefing).
- **Logged Recommendations for Orchestration & Refinement:**
  - Increase commercial pressure cues on the starter modal: style the dismissal button ("Maybe Later") as lower-contrast/subdued, add subtle urgency/deal cues (e.g., "Limited Time Rookie Offer").
  - Clarify presentation boundary: ensure the analytical disclosure box is classified as a review/wireframe artifact; in student production gameplay, students see standard gacha marketing, and the exact mathematical breakdown is surfaced post-run in the Receipt.

---

### Step 5: Tab 2 (The Duplicates & Down Dilemma: Case A vs Case B Anti-Rigging Architecture)
- **Features Presented by Plan 12:**
  - Case A (Current 6-Identity Roster): Mathematical reality that drawing 10 cards necessarily produces $\ge 4$ duplicates under the Pigeonhole Principle. Fixture A yields 4 duplicates = 4 Down feathers. Down counter unlocks in HUD ("Down: 4") and Down Shop tab unlocks.
  - Case B (Future 16-Identity Hypothetical): Demonstrates honest fallback when 10 unique ducks are drawn (0 duplicates). Proves the game never rigs or scripts the PRNG stream to force a duplicate. Down counter remains hidden/omitted, Down Shop remains locked with condition ("Unlocks on 1st dup"), and no phantom Down cues are logged in the Receipt.
  - Behavioral comparison matrix detailing HUD visibility, shop accessibility, Receipt logging, and unmanipulated PRNG stream.
  - Interactive preview card with duplicate badge and Down conversion tag.
- **Owner Feedback:**
  1. *Dual-Case Anti-Rigging Architecture:* Approved. Case A accurately handles the current 6-identity roster (guaranteed $\ge 4$ duplicates), while Case B proves that the UI honestly adapts without rigging the PRNG if an expanded roster produces zero duplicates.
  2. *Progressive Gating of Consolation Mechanics:* Approved. Hiding the Down counter and locking the Down Shop until a duplicate naturally occurs is the right pedagogical approach to prevent cognitive clutter.
  3. *Dissolve Animation Observation (Owner Guidance):* The owner noted: *"I didn't see any card-dissolve animations"*. The wireframe currently features a static CSS badge/tag (`.card-down-dissolve`) rather than an active visual dissolve animation.
- **Logged Recommendations for Orchestration & Refinement:**
  - Retain the honest dual-case architecture and anti-rigging PRNG rule in future design specifications.
  - In production visual design specs (Plan 14/15 integration): implement a genuine visual transition/dissolve animation (e.g. card fading/dissolving into a fluttering feather asset) when duplicate conversion takes place, replacing the static text tag.

---

### Step 6: Tab 3 (Progressive Shop Progression: Stage 1 Starter Anchor vs Stage 2 Predatory Marketplace & Down Exchange)
- **Features Presented by Plan 12:**
  - Stage 1 (Trial Baseline - Day 1 Afternoon): Isolates the storefront to the single starter pack ($0.99 for 240 gems, "400% VALUE!"), establishing an initial price anchor while avoiding early cognitive overload.
  - Stage 2 (Unadopted Future Proposal - Day 3+ Predatory Marketplace): Full multi-tier storefront demonstrating predatory dark patterns:
    - Tier 1: 320 Gems for $0.99 (2 pulls, 0 leftover).
    - Tier 2 ("POPULAR!"): 1,750 Gems for $4.99 (10-pull uses 1,600, leaving 150 leftover—exactly 10 gems short of a single pull).
    - Tier 3 ("BEST VALUE"): 3,600 Gems for $9.99 (2x 10-pull uses 3,200, leaving 400 leftover).
  - Down Exchange proposal: Wireframe originally proposed 15 Down for Soggy Breadcrumb (+0.5% speed for 1 race) and 100 Down for 1 Single Pull Ticket.
  - Unadopted Proposal Tagging: Explicit amber badge identifying Stage 2 as an unadopted future concept rather than accepted baseline code.
- **Owner Feedback:**
  1. *Two-Stage Progressive Rollout:* Approved. Isolating Day 1 to just the starter pack prevents cognitive overload, while Stage 2 effectively demonstrates predatory odd bundles and trapped leftovers.
  2. *Tier 2 Bundle Trap:* Approved. The 1,750-gem bundle leaving 150 gems (10 short of a pull) is an effective and authentic currency trap demonstration.
  3. *Unadopted Proposal Tagging:* Approved. Labeling Stage 2 as an "Unadopted Proposal" clearly protects against architectural drift.
  4. *Down Exchange Economy Calibration (Owner Guidance):* The owner directed a critical price adjustment: 100 Down for 1 pull ticket is too extreme. At 100 Down, students will disregard the shop entirely and wonder why it exists. The owner specified:
     - **3 Down** for the minor temporary speed improvement (e.g., Soggy Breadcrumb).
     - **6 Down** for a free single pull ticket.
     This calibration ensures students can practically interact with the Down exchange after their first 10-pull (which yields ~4-6 Down in the 6-roster game), making the lossy consolation mechanic directly observable.
- **Logged Recommendations for Orchestration & Refinement:**
  - Retain the two-stage progressive rollout and odd-bundle traps in the shop architecture.
  - Update Down Exchange proposal documentation and wireframe specs: change Soggy Breadcrumb price to 3 Down and Single Pull Ticket price to 6 Down.
  - Preserve clear labeling separating active trial baseline (Stage 1) from future proposal concepts (Stage 2).

---

### Step 7: Tabs 4 & 5 (Pedagogical Misunderstanding Risk Matrix & Mock Receipt Attribution)
- **Features Presented by Plan 12:**
  - Tab 4 (Misunderstanding Risk Matrix): Four core learner hazards identified and analyzed:
    1. Conflating physical companion with digital gacha racer (addressed via diegetic boundary).
    2. Believing Down feathers enable an infinite pull loop (addressed via transparent exchange ratios).
    3. Falling for leftover gem traps (addressed via analytical unit breakdowns).
    4. Believing starter packs offer an objective discount (addressed via Receipt reflection).
  - Tab 5 (Receipt Event Record & O1 Three-Register Attribution):
    - Strict adherence to the founding O1 three registers: *1. We Displayed / 2. You Did / 3. Did This Affect You?*
    - Direct connection linking the Day 1 starter purchase ($0.99) to the Day 2 rent shortfall ($0.99).
    - Strict cue attribution: techniques appear on the Receipt only if their specific triggers were encountered during the run.
- **Owner Feedback:**
  1. *Three-Register Structure Approved:* The Receipt's three-register attribution ('We Displayed / You Did / Did This Affect You?') faithfully follows the founding specification without preachy moralizing.
  2. *Misunderstanding Risk Alignment Approved:* The 4 Misunderstanding Risks correctly capture the critical learner hazards, especially the diegetic separation of the physical duck from digital racers and the illusion of infinite recycling.
  3. *Rent Shortfall Attribution Approved:* Tying the starter pack purchase directly to the $0.99 rent shortfall in the Receipt ('You Did' register) provides the central reflective learning moment of the opening.
  4. *Crucial Pedagogical Boundary & Game Feel Guidance (Owner Directive):*
     - **Remove "Neutral Helper Boxes" from Live Gameplay:** Eliminate in-game analytical/helper boxes (such as the box explaining that 150 extra gems leave the player 10 gems short of a pull). The game must present offers as commercial gacha games do—as an exciting value transaction.
     - **Prevent Mid-Game Reflection Leakage:** Guard vigilantly against pedagogical reflection sneaking into the active gacha game. Reflection belongs strictly at the end-of-run Receipt and debrief, not while the player is inside the gacha experience.
     - **Sensory Momentum vs Cognitive Overload:** The gacha experience should feel slightly overwhelming through lights, sounds, and momentum—NOT cognitively overwhelming with walls of explanatory text.
     - **Non-Textual Communication & On-Demand Context:** Communicate information non-textually when possible (with accessible fallbacks). Reserve presentation of information to times when it matters to know it, rather than maintaining static dashboard context onscreen at all times.
     - **Authentic Game Feel:** The gacha game must feel like an authentic, enticing mobile game—never like an analytical dashboard or website.
- **Logged Recommendations for Orchestration & Refinement:**
  - Remove all inline analytical "helper boxes" from student-facing gacha screens; relegate analytical breakdowns exclusively to the post-run Receipt and teacher debrief materials.
  - Rebalance the audio-visual presentation: emphasize exciting commercial fanfare, lights, and momentum inside the gacha app, while cutting inline explanatory text to the bare minimum.
  - In visual architecture planning (Plan 14/15): design non-textual UI cues (e.g. glowing progress rings, visual shortfall indicators) rather than textual commentary boxes.
  - Preserve the three-register Receipt format as the sole authorized locus for critical reflection.

---

## Overall Interview Summary & Orchestration Handoff

All 7 sections of the Plan 12 wireframe artifact have been evaluated by the project owner across this structured interview. In accordance with owner instructions, no unauthorized mutations were made to production code or wireframes during this process. All feedback, calibrations, and architectural directives have been compiled here for orchestration triage.

### Summary of Key Owner Decisions to Route Through Orchestration:
1. **Device Orientation & Immersion:** In Beat 2, transition from the portrait smartphone invitation by prompting the user to rotate 90° into landscape (16:9 laptop view), followed by an immersion expansion filling the stage.
2. **Reveal Theater & Audio Pacing:** Retain instant skip controls for accessibility, but ensure production planning restores suspenseful anticipation beats and rarity-differentiated sound effects.
3. **Starter Modal Commercial Pressure:** Increase commercial urgency on the Beat 5 starter modal (subdue "Maybe Later", add deal ribbons/timers).
4. **Strict Separation of Experience vs Reflection:** Strip all "neutral helper boxes" and analytical commentary out of the live gacha interface. The gacha must feel like an authentic, exciting commercial game with sensory momentum. Keep reflection strictly localized to the end-of-run Receipt.
5. **Down Exchange Economy Calibration:** Re-price the Down shop from the wireframe's excessive proposal down to **3 Down** for minor speed items and **6 Down** for a single pull ticket, ensuring students actively encounter and evaluate the consolation system after their first 10-pull.
6. **Card Dissolve Animation:** Replace static duplicate tags with real visual dissolve animations into Down feather assets.

---
