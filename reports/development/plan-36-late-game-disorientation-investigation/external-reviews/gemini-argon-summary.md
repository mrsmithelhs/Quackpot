# Independent External Creative Review — Executive Summary (`gemini-argon`)

- **Reviewer Key:** `gemini-argon`
- **Requested Model:** Gemini Argon (`gemini-argon`)
- **Exposed Runtime Setting:** Gemini 4 Argon (Medium) (harness user-settings metadata; self-reported model identity is not independently verifiable cryptographic identity)
- **Harness:** Google Antigravity IDE (`windows`, read-only inspection of `C:/AI/Quackpot` at `main` commit `aa8942e4bdbe3cb64ab5c797e165d85c45cbb43f`)
- **Date:** 2026-10-30

---

## 1. Strongest Recommendation: The "Layer 1/2 Subjective Drift vs. Layer 3 Objective Anchor" Principle

Do not treat Plan 36 late-game disorientation as an overlay of screen glitches, broken navigation, or forced losses. Instead, build Plan 36 directly onto the **three-layer apartment architecture** already implemented in `src/ui/life/life-view.js` (`lines 1–9`, `325–404`):

- **Layers 1 & 2 (In the Room & Held Perception):** As the character's gacha involvement deepens—whether through cash spending *or* obsessive free-to-play grinding—their habitual gaze, object labels, and held notes begin sorting domestic reality through Quackpot's commercial grammar. Childhood toys on the already-authored `bedroom` shelf (`src/assets/apartment/rooms/specs.mjs:48-67`) acquire imaginary rarity tiers and rest ratings; the `desk-top` notepad (`src/assets/apartment/desk/top.mjs`) fills with pity math or rationalized budgets; returning from the phone reveals an abrupt **Action-Slot Clock Slip** where the kitchen kettle (`specs.mjs:39`) has gone cold and daylight has jumped to evening lamp-glow.
- **Layer 3 & Institutional Paper (The Uncorrupted Anchor):** Whenever the student opens the **Decide** drawer (`.life-decide`, `life-view.js:338-343`) or reads an institutional document (`noticeLetter` from Harbor Court Property Office or `cardApp` in `life-copy.mjs:15-38`), the interface remains **100% immune to distortion**. Prices, balances, odds, and consequences (`Cash $15.00 → $0.00`) are stated in plain, un-gamified second-person prose.

**Why this works:** The dramatic and pedagogical punch comes from the *collision* between the character's gacha-conditioned inner voice in Layers 1/2 ("Three blocks stacked—seven more to hard pity") and the cold, stubborn arithmetic of Layer 3 ("Rent due today: $300.00"). It achieves uncanny immersion while preserving 100% control reliability, accessibility, and Receipt honesty.

---

## 2. Proposed 30+ Minute Experience Arc: Three Contrasting Routes

To earn a 30-plus-minute engaged run (with local saves supporting multi-session play and ~15 minutes remaining a rapid low-reading path), Quackpot should evolve from a 3-day cash-shortfall demo into a **6-to-8-day two-cycle chapter structure** (Midweek Diner Cycle → Weekend Championship & Rent Settlement) supporting **three distinct player trajectories**:

1. **The "Zero-Dollar Optimizer" Route (Solvency with Time/Attention Cost):** The student spends **$0.00** on Gems and pays rent in full, but chases every "free" pull, Down ticket, and 2-race rest rotation (`src/core/race-rest.mjs`). The cost lands on fictional action slots (DECISION-034): cold meals, skipped social plans with coworker Marisol, and a `desk-top` notepad consumed by cooldown schedules. The Receipt exposes that "free-to-play" still extracts a currency: waking life and attention.
2. **The "Micro-Squeeze & Rationalized Slip" Route (Financial Escalation):** Small, plausible outlays ($0.99 starter, $2.99 top-up for a 10-gem remainder, banner rotation pressure) erode the rent reserve, triggering the furniture/credit ladder (`sell_couch`, `sell_tv` leaving the `specs.mjs:17` dust ghosts, Harbor Card advance) and heightened cognitive bleed.
3. **The "Tethered Balance & Mixed Recovery" Route (Agency & Outside Connection):** The student takes Marisol's diner shift, shares a laugh over the absurd duck roster over two coffee mugs (`living` table), turns the phone face-down, or chooses **Uninstall** when the trap becomes clear—reaching a grounded, non-preachy resolution.

---

## 3. Top Three Priorities

1. **Mount the Unused `bedroom` and `desk-top` Scenes First (`src/assets/apartment/`):** Both are already built in vector SVG (`specs.mjs:48-67`, `desk/top.mjs`) with zero new art cost. They provide the essential domestic stage (bedside clock `clockSmall`, childhood `toyShelf`, spiral `notepad`, loose `coins`) needed for a 30+ minute arc and Plan 36 effects.
2. **Shortlist Four Complementary Plan 36 Effects:** (a) *Action-Slot Clock Slip & Kettle/Window Jump*, (b) *Toy Shelf & Desk Paraphilic Roster Echo*, (c) *Post-Sale Ghost Frame & Acoustic Lingering*, and (d) *The Split-Margin Notepad (Rationalization vs. Arithmetic)*.
3. **Preserve Strict PRNG & Storage Isolation:** Derive cosmetic/narrative variation from a transient or version-gated child stream (`this.rng.fork('narrative')` in `src/core/prng.mjs:90-92`) so `rngDraw`, `rngRace`, and `rngEvent` remain bit-for-bit identical, and log displayed cues separately from student actions for Plan 27 Layout A.

---

## 4. Main Pushback on the Brief and Orchestration Seeds

- **Reject "Someone Else's Apartment" / Unfamiliar Hallway Returns:** Arriving in a stranger's apartment turns a sharp satire of commercial habit into sci-fi/horror psychosis, requires expensive one-off SVG rooms, and violates the brief's own warning not to equate gacha engagement with psychiatric illness. Keep spatial disorientation strictly inside the character's own apartment (e.g., returning from the phone at `desk-side` to find yourself standing in `bedroom` at night because two action slots passed).
- **Reject Control Sabotage & Repeated Bounceback Loops:** Even a decorative "wobble that appears to return the character to gacha" risks training students that the Return button is buggy. If tested at all, cap any portrait-settle hesitation at `<= 350ms` once per run, never re-entering the phone view, and bypass it completely on Uninstall, Settings, or reduced motion.

---

## 5. Load-Bearing Owner Decisions Required Before Prototyping

1. **Scope of the 30+ Minute Arc (Coordinate with Plans 29 & 37):** Approve a 6-to-8-day, 4-slot-per-day action calendar where `bedroom` (night/sleep) and `desk-top` (planning) join `kitchen`, `living`, and `desk-side`.
2. **Storage Envelope Policy for Plan 36 Cues:** Decide whether Plan 36 displayed cues append to `eventLog` as `cue_shown` entries (recommended for Receipt Layout A provenance; compatible with `src/core/storage.mjs:249-310` ledger replay) and whether any narrative RNG state is persisted (requiring a `schemaVersion: 4` bump in `storage.mjs:131-158`) or derived deterministically from `(seed, step, seq)`.
3. **Sensory-Effects Toggle in Settings (`src/ui/settings-modal.js`):** Decide whether to generalize the existing `Animate phone glow` checkbox (`settings-modal.js:13-16`) into a broader `Sensory & transition effects` toggle or keep a separate explicit control.
