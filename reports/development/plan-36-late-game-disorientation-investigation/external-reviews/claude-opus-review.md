# Quackpot and Plan 36 — independent creative review (claude-opus)

Reviewer key: `claude-opus`. Date: 2026-10-30. Input: `C:/AI/Quackpot` at `d367b97` (read-only).
Labels used throughout: **[FACT]** verified in source or docs at that revision; **[DIRECTION]** owner-selected
or accepted direction not yet in production; **[DRAFT]** unassigned/draft packet content; **[PROPOSAL]** my new
recommendation; **[HYPOTHESIS]** a guess about player response that needs a test. Nothing here is adopted.

---

## 1. Current versus proposed capability map

### 1.1 What exists in production today

| Area | Current state | Evidence |
|---|---|---|
| Run shape | **[FACT]** Three in-game days. Day 1: gacha, food, race 1, starter offer. Day 2: rent $15. Day 3: race 2, then `run_complete`. | `src/main.js:298-495`, `648-666`; `src/core/game-engine.mjs:41-57` (START_CASH 15, WAGE 10, FOOD 5, RENT_DAY2 15), `1051-1059` |
| Story state | **[FACT]** No narrative-stage or pressure variable. Progress is `step`/`phase`/`escalationStepIndex`/`debt`/`health`/`assetsSold`. | `game-engine.mjs:96-130`, `121-122` |
| Life escalation | **[FACT]** Ladder skip lunch → extra shift → sell couch → sell TV → credit card → `running_on_empty`. | `game-engine.mjs:857-984` |
| Apartment scene | **[FACT]** Only `desk-side`, neutral light, is mounted. The kit already has `living`/`kitchen`/`bedroom` (bedroom has a toy shelf), `wide`/`medium` framings, light modes `neutral`/`window`/`warm`, and `couch`/`tv` present/removed toggles. None of these is used by the game, and selling the couch changes nothing visually even though the modal says the apartment is "visibly emptier". | `src/ui/apartment-view.mjs:6-14`; `src/assets/apartment/index.mjs:20-37`; `lighting/modes.mjs:9`; `src/ui/modals.js:107` (subagent-reported; I verified the kit and the view, not the modal line) |
| Context transition | **[FACT]** WAAPI overlay, `aria-hidden`, pointer-events none. Enter is about 1.14 s (240/420/480 ms) and return about 1.08 s (420/420/240 ms). Reduced motion gives a one-frame static overlay. Settings, Dex and Uninstall call `cancel()` first, so any longer transition would already yield to the exit. The return re-renders the desk only after the animation completes. | `src/ui/stage-transition.js:15-118`; `src/main.js:193-224` |
| Phone at desk | **[FACT]** A persistent portrait phone sits in the desk scene, with an optional ambient glow (3 s loop, a non-persisted toggle). The copy is fixed ("Welcome back / Your game is ready when you are."). There is no orientation API; "landscape" is geometry. | `apartment-view.mjs:15-18`; `src/ui/settings-modal.js:13-16`; `ambient-glow-controller.mjs` |
| Physical companion | **[FACT]** A static SVG prop with a user-named default ("Professor Quacks"). There is no narration, monologue or dialogue system anywhere in `src`. | `game-engine.mjs:109`; `desk-view.js` |
| Event log | **[FACT]** Append-only log of typed entries (`cue_shown`, `offer_shown`, `action`, `expense_due`, `escalation_*`, `race_*`, `retention_modal_shown`, `terminal`, `receipt_shown`, …). The Receipt's "displayed" register reads only cue/offer/retention/reveal types, and a technique is named only if its cue fired. | `src/core/receipt.mjs:3-6, 35-38, 65-68` |
| Receipt UI | **[FACT]** Production still uses the older sectioned Receipt (catalog / race / accounting / pull audit). **[DIRECTION]** Layout A "three-register cards" is selected but not integrated. | `src/ui/receipt-view.js`; `reports/orchestration/plan-27-owner-layout-selection.md` |
| RNG | **[FACT]** sfc32 root with labelled forks. A fork's seed depends only on key path + label, so a **new label never shifts existing streams**. `draw` is consumed. `race` and `event` are saved but never consumed, because races fork per key from the seed. | `src/core/prng.mjs:15-25, 90`; `game-engine.mjs:89-92, 1100-1120`; `race-resolver.mjs:86-99` (subagent) |
| Save | **[FACT]** Schema 3 envelope: state + four PRNG snapshots + event log. `phoneOpen` is derived from `step`, and view state (glow, motion pause) is not persisted. | `game-engine.mjs:1093-1107`; `src/main.js:140-149` |
| Settings | **[FACT]** Autosave, animate phone glow, Save now, Credits. **No mute/volume, no in-game reduced-motion or sensory toggle**; reduced motion comes only from the OS media query. | `settings-modal.js`; `stage-transition.js:1, 43` |
| Audio | **[FACT]** Not integrated at runtime; `synth.mjs` is imported only by tests and dev scripts. **[DIRECTION]** Plan 32 selected Motif C "Lucky Ripple" as a direction; Plan 33 research accepted; Plan 30 TV source is **[DRAFT]**. | `src/audio/synth.mjs`; packet frontmatter |
| Weather/daylight | **[FACT]** Extracted to tested, *unmounted* modules (Plan 34). | `src/ui/weather-*.mjs`; Plan 34 resolution |

### 1.2 Finding that matters more under Plan 36

**[FACT, code reading only, not runtime-tested]** Uninstall is reachable from the desk because the HUD renders it whenever the run is not terminal (`src/ui/hud.js:35-38, 110`). The retention modal's `onLeave` sets `currentStep = 'receipt'` but leaves `phoneOpen` unchanged (`src/main.js:604-612`). `renderApp` checks `!phoneOpen` *before* `currentStep === 'receipt'` (`main.js:268` vs `:496`). If a player chooses Uninstall → Leave while in the apartment, the app therefore seems to draw the desk rather than the Receipt until the player opens the phone. A reload goes straight to the Receipt (`main.js:141-143`). Any Plan 36 design that keeps students in the apartment longer makes this path more common. **I recommend that orchestration verify this in the browser before any apartment-heavy work.** I did not run it.

### 1.3 Absent capabilities that Plan 36 ideas depend on

- A **story-state / beat ledger** (persisted, with one-shot flags and chosen variants).
- **Mounted rooms and light/time-of-day changes**. The art kit exists; wiring does not.
- A **narration surface**: a caption/thought line distinct from UI copy and from cues.
- **Audio runtime with mute/volume**. Any music-bleed idea is blocked until this exists.
- A **Receipt strand for depicted story** that is not a manipulation technique.
- An in-game **reduced-motion / sensory-effects** setting that works independently of the OS (**[DRAFT]** in Plan 36's own text).

---

## 2. The broader game: where Quackpot could go

### 2.1 Diagnosis

The current slice proves the honest mechanism: draw → log → Receipt. It does not yet give the *life* half a texture of its own. Life currently consists of bills that interrupt the gacha (Plan 28 says as much). For Plan 36's spillover to mean anything, the apartment must first be a place with its own pleasures and its own reasons to put the phone down. You cannot depict gacha leaking into a life the game has never shown. Disorientation is therefore not the first thing to build. It is a *variation* on an apartment routine that must exist first.

### 2.2 Developments (6–10)

**D1. A seven-day "week" with a pay cycle and a midweek break. [PROPOSAL]**
Replace three days with seven in-game days. Rent falls due on day 7, and a paycheck arrives on days 3 and 6 (this aligns with Plan 29's pay-period model, **[DRAFT]**). Days are short: one morning beat, one optional gacha window, one evening beat. Day 4's evening ends with an optional save-and-rest point ("Night 4. You can stop here and pick up later"). It is a natural session break, not a lock, and the next day starts immediately if the player continues.
*Agency:* the student chooses where attention goes each day. *Cost:* economy re-validation (Plan 29), new step graph, Receipt day labels. *Omit:* real-date checks or any reward for coming back.

**D2. Ren: one outside relationship with their own life. [PROPOSAL]**
A single recurring friend, Ren, communicates through phone texts on the *apartment* phone (Plan 28 grammar). Ren is not a lecturer. Ren also plays a game (a fictional rhythm game), teases the character about ducks, and asks for small things: help moving a bookshelf on day 3, a Saturday picnic on day 6. Saying yes spends in-game time. It occupies a day's gacha window and connects to the check-in tension in `reports/orchestration/check-in-rewards-and-life-choices-direction.md`. Saying no is fine, and Ren isn't punished or wounded. Ren may simply go without the character.
*Why:* it gives the student a pleasure to weigh against gacha that is not "being responsible". *Cost:* about 8–12 short message scenes, 2 small scenes outside the apartment. *Omit:* Mom/loan/streamer threads (D1 deferral stands).

**D3. The Second Look verb. [PROPOSAL; the idea I'm most confident in]**
Whenever the story presents a *disturbed* version of a scene or message, a small persistent control appears: **"Look again"**. It cuts to a plain, factual framing, often from the physical duck's fixed vantage (its camera, not its animation). The framing shows what is literally there: stove clock, cold pot, empty couch space, Ren's message in plain text. It costs nothing, never expires and is never required.
*Why:* it turns unreliable narration into something the student *can investigate* instead of something done *to* them. It keeps agency and the factual anchor inside the fiction rather than only in the debrief. It also gives the inanimate duck a role as witness: something that sees plainly, without speaking or judging. *Evidence:* `second_look_used {beatId}` is an honest player action. *Cost:* each disturbed beat needs a plain twin, which also serves as the reduced-motion and sensory-off equivalent (§4). *Omit:* scoring or rewarding its use.

**D4. Merch and parcels: the gacha becomes physical. [PROPOSAL]**
Mid-week, the fictional app offers a fictional physical plush of a duck the player *owns* ("Bring Pond Rocket home!", fictional cash price). If bought, it arrives on day 5 or 6 at the door. This gives a real reason for the "unexpected room arrival" seed: the return lands at the front door because the buzzer went. The plush is an inanimate physical object. The physical companion now has a shelf neighbour that came from the app.
*Why:* it is a literal, honest spillover that comes from a player purchase, not a hallucination. *Receipt:* a normal offer/purchase with real fictional price. *Owner decision:* a new purchase category. *Omit:* any implication that the plush has gacha stats.

**D5. Bedtime as a scarce, visible resource. [PROPOSAL]**
Evenings end with a bedtime beat: "Sleep" or "One more race". Choosing "one more" pushes the next morning's start later and visibly darkens the window. It may cost the morning beat (breakfast or Ren's text arrives "while asleep" and is read late). No health penalty beyond what already exists.
*Why:* lost time becomes a story consequence of a *real choice*, so the time-compression narration has something true to distort. *Cost:* low (light modes exist). *Omit:* real-time waits.

**D6. The Napkin Tally: the character's own receipt before the real one. [PROPOSAL]**
At any ending, before the printed Receipt, the character scribbles a quick self-accounting on a napkin by the desk, in the character's voice: "Spent like… $3? Mostly free pulls. Paid rent. Pretty fun week." The napkin is computed from story state with deliberate, *labelled* rounding and omission rules (see §4, N4). Then the printed Receipt arrives beside it.
*Why:* unreliable narration gets a payoff the student can actually check, and the comparison becomes the first discussion move. *Constraint:* the napkin is visually and verbally marked as the character's ("Professor Quacks' owner wrote:"), never the game's factual account. It is skippable and folds away. *Owner decision:* a new pre-Receipt surface.

**D7. Three endings that are not "decline". [PROPOSAL; owner gate on endings]**
- **Saturday** — the character goes to Ren's picnic with the phone in a bag. It reaches the Receipt like any other ending. It is not labelled "best"; Uninstall keeps that canonical title.
- **Good Week** — the character played a lot, enjoyed it, paid rent and has some ducks they love. The epilogue is warm and unironic. The Receipt still lists every cue that fired.
- **Completed the Collection** (exists in design) — gets a quiet epilogue: the Dex is full, the shelf in the bedroom is full, and the narration says "Okay. Now what's next banner?" This is one line of ambiguity, not a moral.

**D8. Replay as a design lens. [PROPOSAL]**
Show the run's seed on the Receipt (the teacher-analyzer questions in design already contemplate this). Offer "Same week, different choices", which replays the same seed so story and draw outcomes stay aligned and students can isolate their own choices. This is not retention: it is offered only as a design-study affordance from the Receipt, and a fresh-seed run remains available.

**What to omit outright:** a multi-room navigation game (Plan 28's own caution is right); fail states for "too much gacha"; any clinical framing; a companion that talks.

### 2.3 Two contrasting arcs (no single correct feeling)

**Arc A — "Spillover" (the student leans into the gacha).** Gacha windows are taken, the couch goes, Ren's invites are declined. The apartment increasingly borrows gacha grammar, and returns land at odd times of day. The napkin tally is rosy. The Receipt shows plainly what happened. The student may find the week *fun*, and the design must allow that answer.

**Arc B — "Counterweight" (the student spends attention elsewhere).** Ren's bookshelf and picnic are accepted, sleep is taken, and the gacha is used in small doses. Spillover beats still occur, but at lower bands, mostly as gentle echoes (the tune in the head, a rarity rim on the sunlight). Grounded scenes dominate. The ending is Saturday or Good Week.

**Arc C (mixed, probably the commonest).** Early enthusiasm, a late correction or a late slide, and a mixture of beats. Bands can *fall* as well as rise (§4.1), so recovery is visible in the art.

---

## 3. Pacing bands (assumptions, not measurements)

| Segment | Core route (engaged) | Rapid route | Optional adds |
|---|---|---|---|
| Opening: companion, phone entry, free ten-pull, tutorial race | 5–7 min | 3 min | Dex browsing +1–3 |
| Days 1–3 (Act I: welcome, first bills, Ren's bookshelf) | 7–10 | 4 | extra pulls/races +2–5 |
| Day 4 night: natural save point | — | — | session break |
| Days 4–6 (Act II: spillover, merch, picnic invite) | 8–12 | 4 | Second Look +1–2; parcel scene +1 |
| Day 7 / ending scene | 2–4 | 1 | epilogue +1 |
| Napkin Tally + Receipt reflection | 5–8 | 2–3 | replay comparison 10–20 |
| **Total** | **≈ 27–41 min** | **≈ 14–17 min** | open-ended |

Assumptions: about 200 wpm reading of short scene text, about 20 s per meaningful choice, about 20 s per race, and Receipt reading proportional to cues fired. Time earns its place through **choices that cost something** (Ren vs. banner, sleep vs. race) and **reflection** (napkin vs. Receipt). It does not come from longer transitions or waits.

**Early exit:** a student who uninstalls on day 1 still gets (a) a very short napkin ("Didn't even finish the free pulls. Weird game."), (b) a Receipt listing the few cues that fired, including the retention offer, and (c) reflection prompts that work from absence: "What made you leave? What did the game show you right before?" The exit is a complete datum, not a failed run.

---

## 4. Plan 36 effect menu

### 4.1 Shared machinery (prerequisite for every effect) [PROPOSAL]

- **Pressure band from declared story state only.** For example, `band = clamp(dayBand + flags)`, where `dayBand` comes from the day number (0 for days 1–2, 1 for days 3–4, 2 for days 5–7) and the flags are **story facts**: couch sold +1, TV sold +1, picnic declined +1, picnic accepted −1, slept on time last night −1, rent unpaid +1. Never use click speed, pull frequency per real minute or hesitation. This is a story ledger, like any branching game's flags. Bands may fall.
- **Disclosure:** the Receipt's story strand says *why* a scene looked the way it did ("Day 5 and the couch was sold, so the apartment scenes used the later version"). This keeps the mechanism transparent and avoids implying a diagnosis.
- **Cosmetic randomness:** `createRng(seed).fork('story/' + beatId)` or a separate `cosmetic` fork. Forks never shift `draw`/race streams (`prng.mjs:19-23`). The selected variant is written to a persisted **beat ledger** `{beatId, variant, band, shownAt}` *when the beat becomes visible*, so a reload replays the same variant and never re-shows a one-shot as new.
- **Exit invariants:** Uninstall, Settings and Save stay in the HUD canopy and are never covered, moved or delayed. Any effect is cancelled by them, as `stage-transition.js` already does. Disturbance never changes a control's meaning, position or hit area.
- **Sensory-effects setting [OWNER DECISION]:** an in-game "Story effects: Full / Calm / Plain" setting. Calm keeps content but removes motion and audio bleed. Plain shows only the Second Look framings with narration as text. This is independent of OS reduced motion, which maps to at least Calm.

### 4.2 Menu

Owner seeds are marked (O). Orchestration suggestions are marked (R). New ideas are marked (N).

**Transitions**

1. **T1 Time in the Cut (N; my reframing of O1 "slower").** The return animation keeps its accepted ~1 s. What changes is *what you arrive to*: window light jumps from `window` to `warm`/dusk, the stove clock reads later, and a plate has gone cold. The narration says "Back. That was quick." Disorientation lives in the discontinuity, not the duration.
2. **T2 Phone left landscape (O).** After return, the desk phone rests sideways, still lit with the app's idle screen. An optional verb, "Turn it face down", is logged as an action and changes nothing in the economy. Cheap: a desk-art variant.
3. **T3 Mild slowing (O).** Return phases stretched by at most +40% (≈1.5 s) at band 2. Still cancellable, with no erratic easing. **I rank this low** (see §6).
4. **T4 Buzzer redirect (O hallway, grounded by D4/D2).** A return lands at the front door because the parcel or Ren arrived. The door view is actionable at once, and the desk is one click back. This is the only "unexpected room" I'd keep, because it has a story cause.
5. **T5 The Reach (O wobble, reframed).** After return, a still frame shows the character's hand hovering over the phone, with the narration "Just checking the banner—". The student gets two ordinary choices: **Open Quackpot** / **Leave it**. Nothing auto-opens and nothing snaps back.

**Environment and habits**

6. **E1 Rarity light (N).** Late afternoon sun lays a gold rim on an ordinary object (mug, couch arm) using the light layer only, as a static tint. In reduced motion it is identical, because it is already static.
7. **E2 Receipt Dex (O).** Meal receipts are pinned on the fridge in a 3×3 grid. Days with skipped meals are dashed silhouettes, and a "4/7" tally is pencilled on. It depicts the character's arranging, not a player minigame. It is drawn from actual `expense_paid`/skip records, so the content is true while the *framing* is the character's habit.
8. **E3 Collection-shaped absence (R).** After the couch sells, its floor space shows a faint dashed outline like a Dex silhouette, with a tiny "0/1" in the character's handwriting on a sticky note.
9. **E4 Event grammar (O "life messages as merch").** Ren's text arrives styled as a gacha event card ("LIMITED EVENT: Saturday Picnic ✦ 1 day left!"). Second Look shows the plain text: "picnic sat? bring nothing, I've got snacks." The price, odds and actual bill notices are **never** restyled. Restyling applies only to personal messages, never to obligations.

**Narration**

10. **N1 Second Look (N).** The general mechanism behind D3.
11. **N2 The plan note (R "after this", made factual).** A sticky note on the monitor holds the character's plan list. Lines are struck through by *recorded* events: "~~one race then dinner~~" appears only if a race happened and dinner was skipped. The character rewrites the note; the struck lines are the true ones.
12. **N3 Remembered jingle (O).** At bedtime the character recalls the day: "Best part: that legendary sparkle." If Ren called that day, the narration also recalls Ren's call with the gacha's rare-pull chime (as text "(rare-pull chime)" plus optional audio), and Second Look shows the call log: 4 minutes, "ok see you Sat 🙂".
13. **N4 Napkin Tally (N).** As D6. Rule set: the napkin rounds spending down to the nearest friendly number, counts free pulls by name, omits Down, and says "paid rent" if rent was ever paid. Each distortion is a declared rule that is printed in the Receipt's story strand ("The napkin left out: $X in starter/merch purchases").

### 4.3 Shortlist: four complementary effects

**1. T1 Time in the Cut** (transition) · **2. E2/E3 Receipt Dex & absences** (environment) · **3. N1 Second Look with E4 event grammar** (narration and agency) · **4. N4 Napkin Tally** (debrief bridge).

They work as one system. T1 and E2/E3 create a gap between perception and fact. N1 lets the student close that gap in the moment. N4 closes it at the end. None of them needs control sabotage or a longer animation.

| | T1 Time in the Cut | E2/E3 Receipt Dex / absence | N1 Second Look + E4 | N4 Napkin Tally |
|---|---|---|---|---|
| Purpose | lost time felt through discontinuity | habit-shaped perception of ordinary objects | unreliable framing that the player can check | the character's self-story vs. facts |
| Stage eligibility | band ≥1; never on day 1 | E2 from day 3 if ≥3 meal records; E3 after a sale | any band where a disturbed variant exists; E4 band ≥1 | every ending, including Uninstall |
| Seeded variation / cap | 3 arrival variants (dusk, lamp-on, cold plate); at most once per day, ≤3 per run; band 0 days always plain | 2 grid styles; shown on each kitchen visit, one-shot "first noticed" narration | which phrasing variant; E4 ≤2 messages restyled per run | wording variants per rule; one per run |
| Quiet counterpoint | plain returns remain eligible at every band (≥50% of returns stay plain) | Ren's bookshelf day shows the fridge with a normal photo instead | Plain message texts dominate; E4 is the exception | the printed Receipt itself |
| Interruption / exit | it is a static arrival frame; the HUD is untouched; Uninstall works mid-frame | static; no blocking | Look again is a toggle; Esc returns; no focus trap | skippable; folds; Receipt is always below |
| Save / reload | ledger records variant when shown; reload shows same frame, not re-narrated | derived from records; deterministic | ledger stores restyle variant; plain view always reconstructable | computed from log at terminal; frozen with terminal state |
| Accessible equivalent | caption: "It's darker outside. The stove clock says 7:40." | alt list: "Fridge: 4 receipts arranged in a grid; 3 dashed spaces" | the plain twin *is* the accessible form; screen readers get both, labelled | plain text; `role="note"` labelled "character's note" |
| Logged evidence | `story_beat_shown {beatId:'arrival_dusk', band, reasons}` | `story_beat_shown` | `story_beat_shown` + `second_look_used` (action) | `story_beat_shown {napkin, rulesApplied}` |
| Risks | read as a bug or a clock error | reads as a mini-game or a judgement | becomes "spot the difference"; overuse | students treat the napkin as fact |
| Dependencies | mounted desk light modes; a clock prop; the ledger | the kitchen room mounted; meal records | narration surface; Plan 28 messages | Layout A Receipt integration |
| Reject/defer if | testers can't tell it's intended | it requires a multiroom navigation build | testers ignore it entirely or treat it as a chore | comprehension checks show confusion |

**Deferred:** T3 (duration is the weakest carrier and an accessibility cost), N3 audio version (no audio runtime yet), T4 (needs D4/D2 first). **Rejected for now:** "someone else's apartment" (high confusion, and no story reason exists yet), and any auto-reopening wobble.

---

## 5. Scene treatments

### Scene 1 — Early intrusion: "Back. That was quick." (Day 3 evening, band 1)

*Ordinary version.* The player taps Return. The phone rotates back into portrait (accepted Shell A). The desk-side scene shows neutral light, a pot on the hob in the background and Professor Quacks beside the keyboard.
> *Caption:* Evening. Dinner's almost ready.
> Choices: **Eat** · **Open Quackpot**

*Disturbed version (T1, variant "dusk").* Same accepted return animation. On arrival:
1. Light mode is `warm`, and the window has gone deep blue.
2. The stove clock prop reads 7:41 (it read 6:10 before the phone opened). The clock only states story time, which the HUD day/phase already shows truthfully.
3. The pot no longer steams. (Steam is a static wisp; its absence is a still.)
4. Camera: the medium framing is held from just behind the duck's shoulder, so the duck "faces" the stove. This uses composition only.
> *Narration (character):* Back. That was quick.
> Choices: **Eat it cold** · **Open Quackpot** · *(small)* **Look again**

*Look again* cuts to a static close-up of the clock and pot with a plain caption: "6:10 → 7:41. The pot's been off for an hour." The caption is not a lecture or a judgement; it is just what is there.

*Reduced motion / Plain:* the arrival is a direct cut with the caption "It's dark now. The stove clock says 7:41. Dinner is cold." The narration line still follows, as text.

*Grounded counterpoint:* if the player chose to eat *before* opening the phone, this beat cannot fire that evening. The plain dinner scene plays instead: "Pasta. Not bad."

*Consequences:* "Eat it cold" pays nothing extra (food was already billed) and adds a one-line Napkin Tally entry later. "Open Quackpot" proceeds normally. No economy effect comes from the beat itself.

*Receipt (story strand):* "Story showed: arriving back from Quackpot at dusk (Day 3), because it was Day 3 or later and dinner hadn't been eaten. You chose: Look again; then Eat it cold."

### Scene 2 — Sustained spillover: "Limited Event" (Day 5 morning, band 2, couch sold)

*Ordinary version.* Kitchen, medium framing, `window` light. Fridge with a magnet calendar. The phone buzzes on the counter.
> Ren: picnic sat? bring nothing, I've got snacks.
> Choices: **"I'm in"** · **"Maybe"** · **"Can't this time"**

*Disturbed version (E2 + E3 + E4).*
- The fridge carries five meal receipts in a neat grid with two dashed empty slots, and "5/7" is pencilled in the corner. The receipts are the real day-1–5 food records; the dashed slots are the two skipped lunches the player actually chose.
- Through the doorway, the living room floor shows the faint dashed outline where the couch was, with a sticky note: "0/1".
- The phone notification renders as an event card: gold border, sparkle glyphs.
> **✦ LIMITED EVENT ✦ Saturday Picnic** — *Ends in 1 day!* — Reward: ??? 
> Choices are unchanged: **"I'm in"** · **"Maybe"** · **"Can't this time"** · *(small)* **Look again**

*Look again* shows the plain bubble from Ren, with Ren's earlier message above it: "lol is your couch gone?? come sit on my blanket then".

*Hard rule:* the rent notice on the same fridge (rent due day 7, $amount) is **never** restyled. It sits beside the grid in plain type, and its amount and due day are exact.

*Consequences:* "I'm in" commits Saturday's gacha window to the picnic, which is the last day of the current banner (this is the real trade-off). "Maybe" leaves it open until Saturday morning. "Can't" ends the thread kindly: "all good, next time".

*Reduced motion / Plain:* there is no motion here anyway. Plain mode shows Ren's bubble only, with the alt text "Fridge: meal receipts arranged in a grid, two empty spaces; outline on the floor where the couch was."

*Receipt (story strand + register):* see §6.

### Scene 3 — Late ambiguity *or* recovery: "The Door" (Day 6 evening)

*Trigger:* the player accepted the picnic, or bought the plush (D4). Otherwise this scene doesn't occur, and a plain evening plays instead.

*Version A — ambiguity (band 2, picnic accepted "Maybe" and not yet confirmed).* The player taps Return mid-banner. The accepted return animation plays, but the arrival frame is the **front door, interior view** (T4). It is dim and the buzzer light is on.
> *Narration:* Who's—oh. Did I say I'd do something tonight?
> Ren (through the door, as text): you said you'd help carry the cooler up? I texted.
> Choices: **Open the door** · **"One sec—"** (back to desk) · *(small)* **Look again**

*Look again* shows the actual phone thread, Thursday 6:02 pm: "Ren: can you help w cooler fri night?" and the character's reply "yeah def". That reply exists only if the player *actually* chose the corresponding reply on Thursday. If the player had not replied, Ren's line instead says "I texted, did you see it?", and Look again shows the message as unread. The narration's forgetting belongs to the character. The record never pretends the human player agreed to something they didn't.

*Version B — recovery (band ≤1, picnic "I'm in").* The return lands at the desk, plain light. The phone is face down (if the player turned it down earlier) and the window is still light. Ren is at the door at 6 pm as agreed.
> *Narration:* Right on time. Huh.
> Choices: **Open the door** · **Finish this race first**

Either way, **Uninstall stays in the canopy and works instantly**. If chosen here, the retention modal opens over the door scene, and Leave goes to the Napkin Tally/Receipt. This depends on fixing the `phoneOpen` path noted in §1.2.

*Consequences:* opening the door leads to a short cooler-carrying scene (two lines, one choice: talk about ducks or about Ren's game), then night. "One sec—" returns to the desk; Ren waits one more beat and then texts "nvm got it, see u sat?". Nothing is lost except the scene itself.

---

## 6. Example Receipt excerpt (Layout A cards + proposed story strand)

*Synthetic illustration for a proposed 7-day run, not an engine trace; values are invented for layout.*

> **Recorded outcome and totals** — Ending: *Saturday* (Day 6). Cash $41.20 · Gems 90 · Rent ($45, due Day 7): not yet due when the run ended.
>
> **Card: Fear of missing out**
> **We displayed:** Banner 2 message "Last 2 days!" shown on Day 5 (morning) and Day 6 (morning).
> **You did:** No pulls during that window after Day 5 noon. You accepted Ren's picnic on Day 5 (morning).
> **Did this affect you?** *When the banner and the picnic landed on the same day, what did you weigh?*
>
> **Story the game showed you** *(scenes written about the character, not records of your choices)*
> - Day 3, evening: the character returned from Quackpot at dusk and said "Back. That was quick." *Shown because: Day 3 or later; dinner not eaten.*
> - Day 5, morning: Ren's message appeared styled as a gacha event. *Shown because: Day 5; couch sold.* **The game's restyling of a friend's message is a story device, not a commercial offer.**
> - Napkin note: "Spent like $3? Paid rent. Fun week." The note rounded $9.98 of purchases down and left out 18 Down.
>
> **You did (story choices):** Look again ×2 (Day 3, Day 5). Turned the phone face down ×1. "I'm in" to the picnic.
>
> **Did this affect you?** *Did the game still feel present when you were back in the apartment? Was the character's napkin closer to or further from what you would have written?*

Note what is *absent*. The Receipt never says the student felt disoriented, forgot or rationalized. Disturbance beats are **not listed as manipulation techniques**, because they are narrative devices aimed at the character. Restyled personal messages are explicitly distinguished from offers.

---

## 7. Main pushback on the brief and seeds

1. **Duration is the weakest carrier of "slower, then erratic".** Lengthening an `aria-hidden` overlay mostly delays focus return and makes the accepted Shell A look broken. It does so most for keyboard and screen-reader users, who receive none of the meaning. Put lost time *in the cut* (T1) and keep the accepted ~1 s. If the owner still wants slowing, cap it (≤ +40%), never make it erratic, and keep it cancellable.
2. **"Someone else's apartment" spends trust without buying meaning.** Students cannot distinguish an authored surprise from a routing bug. Arrivals elsewhere need a story cause (buzzer, parcel, Ren) and an immediately actionable view.
3. **A wobble that *appears* to return to gacha imitates a real control failure.** I agree with orchestration on this and go further: depict the urge as a *still frame and a choice* (T5), never as motion of the phone.
4. **Music bleed is premature.** There is no audio runtime, mute or volume yet (§1.1). Sequence it after Plans 30/32 and an audio-settings packet. When it comes, bleed should be an "in-head" layer: filtered, mono, captioned "(the Quackpot tune, in their head)", silenced by mute, and explicitly distinct from TV playback. After the TV is sold, only the in-head layer may persist, and it is captioned as memory.
5. **The brief asks for disorientation before the apartment has a life.** Building D1/D2 (a week, a friend, mounted rooms) is a precondition. Plan 36 effects on top of the current three-day bill loop would read as decoration.
6. **Plan 28 + Plan 36 should share one "apartment scene beat" contract** (beat ledger, narration line, plain twin, story-strand evidence) rather than each inventing its own.

---

## 8. Recommendations, decisions, falsification

### 8.1 Prioritized bounded investigations (none authorized here)

1. **P0 — verify the Uninstall-from-desk Receipt path** (§1.2). This is a browser check only.
2. **P1 — paper/text storyboard comparison** of Scenes 1–3 in Full, Calm and Plain forms, using the *existing* kit renders (desk-side and kitchen; `neutral`/`warm`/`window`). Report-only, static stills, no new art. Question: do readers identify T1 as intended rather than a bug, and do they use Look again?
3. **P2 — Receipt comprehension check** on a synthetic Layout A page with the story strand and the napkin. Question: can a reader correctly sort five statements into "the game showed", "the character did/said", and "I did"?
4. **P3 — beat-ledger and story-band proposal**: a schema, a fork label, one-shot/reload semantics and the event types `story_beat_shown`/`second_look_used`, written as a design note against `prng.mjs` and the storage schema. This is a document, not code.
5. **P4 (later)** — audio bleed, after audio runtime and settings exist.

### 8.2 Owner decisions surfaced

- Expand from 3 to ~7 in-game days with a pay cycle (with Plan 29)?
- Introduce Ren, an outside relationship (and outside scenes), as a standing character?
- Adopt **Second Look** as a standing verb?
- Add the **Napkin Tally** pre-Receipt surface and a **story strand** on the Receipt?
- New endings **Saturday** and **Good Week**, and their relation to Uninstall's "best ending" title.
- Merch/plush as a new fictional purchase category.
- In-game **Story effects: Full/Calm/Plain** setting (a new global settings policy).
- Accept the reframing of slow/erratic transitions into arrival discontinuity, which declines the seed as written.

### 8.3 What would falsify my favourite idea (Second Look)

- In a storyboard test, most readers **never use** Look again; the disturbance then carries itself and the verb is clutter.
- Or most readers use it **reflexively on every beat** as a chore or puzzle; the disturbance then stops being felt, and the verb has turned unreliability into spot-the-difference.
- Or readers interpret the duck-vantage plain view as the **companion judging them**. This would violate the "not a lecturer" goal; the fix would be dropping the duck vantage, not necessarily the verb.
- Or the "plain twin" doubles authoring cost per beat beyond what the owner will fund. Then fewer beats with twins beat more beats without them.

If any of these hold, the fallback is that the factual anchor lives only in the Napkin/Receipt comparison, with no in-play verb.

### 8.4 Not decided here

Exact bands and weights, the number of beats, day count, the plush price, Ren's script, and any audio. This review authorizes and implements nothing.
