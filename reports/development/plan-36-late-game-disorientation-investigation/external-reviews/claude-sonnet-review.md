# Quackpot and Plan 36: independent creative review (`claude-sonnet`)

Report-only. Nothing here is adopted, selected or authorized. Labels used throughout: **[Fact]** read in source/docs, **[Inference]** my reading, **[Proposal]** new idea, **[Hypothesis]** untested claim about players, **[Owner gate]** a decision I am not entitled to make. Repository revision inspected: `main` at `d367b97`. No game was run, so nothing below is a measured behavior.

---

## 0. The idea in one paragraph

**Orient the player, disorient the character.** The student should never be unsure whether a control works, what something costs, or what is true. The *character* is the unreliable part. I propose making unreliable narration the spine of Plan 36: a first-person caption layer whose rationalizations are each tethered to a checkable fact in the run record, a diegetic "plain version" always one action away, and a Receipt section that audits **what the character said against what the record shows**. Environmental spillover (card-frame ghosts, meal receipts laid out like Duck-Dex cards) and return-transition variants become supporting surfaces for that spine, not independent spooky effects. Every one of them survives reduced motion because the information is in text and still images.

Where I push back on the brief: "disorientation" is the wrong target word for the *interface*. A confused student cannot examine design. Disorientation belongs in prose, composition and the fiction's own room geometry, never in input reliability, hit targets or timing.

---

## 1. Current versus proposed capability map

### 1.1 What exists now (all **[Fact]** unless marked)

| Area | Current state | Evidence |
|---|---|---|
| Route length | Hard-wired 3 days: Day 1 gacha → race → starter offer → Day 2 rent → Day 3 race → Receipt. No day cap in `advanceDay`, but nothing past Day 3 exists. | `src/main.js:341-346, 386-395, 486-494, 648-666`; `src/core/game-engine.mjs:1086-1090` |
| Phone ↔ apartment | `createStageTransition` exposes only `run(direction)` and `cancel()`. `'enter'` = 240+420+480 ms; any other string runs the return sequence = 420+420+240 ms. Reduced motion is checked once at `run()` start and takes a static branch. Overlay is `pointer-events: none`, `aria-hidden`. | `src/ui/stage-transition.js:4-122` (esp. 16, 43, 49, 77-108); `stage-transition.css:1-10` |
| Return flow | HUD "Return to apartment" → `run('return')` → on completion `phoneOpen=false` and re-render. The roughly 1.1 s return is already non-skippable by repeat press: a second activation calls `cancel()` and **restarts** the animation. Settings, Dex and Uninstall also cancel it. (This is small, but it is the baseline any "slower" variant would build on.) | `main.js:210-224`; `stage-transition.js:16` |
| Apartment scene | Production renders one static side-view desk only. The kit can render `living`, `kitchen`, `bedroom`, `desk-side`, `desk-top`, light modes `neutral|window|warm`, six duck views, and `furnishings {couch, tv}` for the living room. No production caller uses rooms or furnishings. | `src/ui/apartment-view.mjs:6-14`; `src/assets/apartment/index.mjs:20-36, 98-143` |
| Apartment state read | The desk view reads only `returning`, companion name and glow flags. It does not read cash, health, debt or sold assets. | `main.js:269-297` (subagent map; I confirmed the call site) |
| Apartment return is not persisted | On restore `phoneOpen = currentStep !== 'desk'`; the "returning desk" leaves `currentStep` unchanged, so a reload from the apartment reopens the phone view. | `main.js:141-149, 268` **[Inference from reading]** |
| Uninstall | HUD renders Uninstall on every non-terminal render, including the desk. `clickUninstall` logs `uninstall_chosen` and `retention_modal_shown`; `leaveUninstall` sets terminal route `uninstall`. | `src/ui/hud.js:35-38`; `game-engine.mjs:990-1019` |
| Leave from the apartment | `renderApp` shows the Receipt only when `phoneOpen` is true. If a student leaves while on the apartment desk, the desk re-renders with a "Run Locked" HUD and the Receipt appears after pressing the desk phone. | `main.js:268-275 vs 496-505`; `hud.js:39-43` **[Inference from code; needs a rendered check.]** `onLeave` (`main.js:604-612`) sets `currentStep='receipt'` but never sets `phoneOpen=true`. If confirmed, this appears to be a **current gap against "immediate Leave to the Receipt"** independent of Plan 36, and I would treat it as a fix candidate for the owner, not only a prerequisite. |
| Escalation ladder | Engine has `skip_lunch`, `extra_shift` (+10 cash, −15 health), `sell_couch` (+10), `sell_tv` (+15), `credit_card` (+15 cash, +15 debt), then Running on Empty. Interest, debt repayment, pawn and Mom/streamer steps are absent. | `game-engine.mjs:857-961, 977-984` (agent map; spot-checked 861-877) |
| Story-state fields | `day`, `clock.label`, `cash`, `health`, `debt`, `assetsSold[]`, `billsSettled[]`, `owned[]`, `activeBill`. No enumerated "pressure band" exists; thresholds are ad hoc (`health <= 20`, `cash === 0`, `debt > 0`). | `game-engine.mjs:96-130`; `hud.js:53-68` |
| RNG | Streams `root`, `draw`, `race`, `event`, all saved/restored. `fork(label)` derives children only from key path and label, never from parent consumption. `rngEvent` and `rngRace` are serialized but not drawn from; race randomness uses stateless keyed draws. | `game-engine.mjs:89-92, 1100-1120`; `prng.mjs:19-24, 90-91`; agent report on `race-resolver.mjs:86-99` |
| Log | Append-only, hash-chained, deep-frozen. Completeness requires `terminal` immediately followed by `receipt_shown`. Displayed-cue types: `cue_shown`, `offer_shown`, `retention_modal_shown`, race cue events. **No** event separates displayed treatment, player action and *depicted character activity*; no narration event exists. | `event-log.mjs:30-106`; `receipt.mjs:3-7, 35-37` |
| Receipt | Fixed technique table; a technique is named only if its cue fired; three registers. Most listed techniques have no emitter yet (red-team found four with emitters). Displayed types also include `reveal_shown`. | `receipt.mjs:4, 14-25, 67-68` |
| Economy facts | Food is billed unnamed ($5) each day, rent once ($15, Day 2), start cash $15, wage +$10. There is **no** recurring rent, voluntary meal purchase, or meal item name. "Skip lunch" exists only as an escalation after an unpaid food bill. | `main.js:342, 434, 649-661`; `game-engine.mjs:863-864` (subagent maps; hand-traced) |
| Settings | Autosave, animate-phone-glow, save, done. No volume, mute, sensory or transition-motion toggle. `animatePhoneGlow` is a `main.js` variable, apparently not in the save envelope. | `src/ui/settings-modal.js:9-16`; `main.js:59, 628` |
| Audio | `synth.mjs` is not imported by any game module (only by its own test and a dev parity script, `scripts/dev/plan-04-parity.test.mjs`). There is no in-game audio. | my grep; red-team subagent correction |
| Weather/lighting | Weather still/motion/lightning modules exist but are unmounted. Reduced-motion is honored in transition, glow, duck and race controllers. | `AGENTS.md` stage line; agent map |

### 1.2 Owner-selected direction and unassigned drafts

- **Selected:** Shell A phone transition (DECISION-012/014), Receipt Layout A (Plan 27, hierarchy only), 30-minute engaged target with no ceiling (DECISION-033), pawn offer and empty-desk scene (design, O5), Uninstall always best ending.
- **Drafts (not assigned, not features):** Plan 28 apartment communications (explicitly avoids "a multiroom navigation game merely to host a bill"), Plan 29 economy scale, Plan 30 TV music, Plan 31 influencer apartment, Plan 32 music hooks. Plan 33 (research) is closed. Plan 32 names five arrangements (Base, Foil, Uneasy, Dire-Clean, Dire-Filtered) that are not tied to any state.
- **Deferred by the owner:** ladder steps 5-7, Mom voicemails, streamer chat/branch (design D1).

### 1.3 What Plan 36 would need that does not exist

1. More than three days of content (Plan 29 prerequisite). **Plan 36 beats cannot be "late-game" in a 3-day route.** [Inference]
2. A persisted apartment location/arrival field (a schema bump from version 3).
3. A narration/beat event type and a Receipt section for non-technique presentation.
4. A pressure-band function over existing state.
5. Plan 28's apartment communication grammar, so life choices live somewhere other than gacha.
6. Audio integration, if any music bleed is wanted.

---

## 2. A broader story/game proposal (8 developments)

All **[Proposal]**. Each notes consequence, agency, cost (S/M/L relative, no hours claimed) and what to omit.

**D1. Home beats: one short apartment scene closes each in-game day.**
The apartment becomes where life choices live (Plan 28's goal) and where Plan 36 beats occur. Arrival is to the room that scene needs; a visible "Open Quackpot" is always present.
*Agency:* real choices (pay, skip, sell) with existing costs. *Cost:* M (needs persisted location, 2-3 rooms from the existing kit). *Omit:* free-roaming navigation, pixel hunts.

**D2. Margin Notes: the narration layer.** First-person captions, each bound to a fact reference (§4.A). Plain-version ledger is always one action away.
*Agency:* the student can read the plain line or not. *Cost:* S-M, mostly writing. *Omit:* narration that instructs ("do X"), narration inside buttons or prices.

**D3. The Neighbor thread (outside relationship).** A fictional neighbor behind a thin wall: notes under the door, a knock, a hallway. Their own habit is quietly different (baking, a model railway). Optional.
*Agency:* answer the knock, say not now, or ignore. *Consequence:* a flag that affects which later beats are eligible, never economy. *Cost:* L (new writing and some art). *Omit:* making the neighbor a rescuer or lecturer; this must not be Mom's voicemails (deferred by owner; flag overlap, **[Owner gate]**).

**D4. Maintenance Day.** The fictional app announces scheduled downtime. The day is a quiet apartment day; "skip to after maintenance" is always available, so no waiting. An apology-compensation gem offer follows, a candidate technique for the Receipt.
*Cost:* M (a new offer, a small gem grant, which is **[Owner gate]** economy). *Omit:* timers, fake loading.

**D5. Envelope Night.** Optional pre-commitment: on payday the player may set aside cash for rent, food and gems on a kitchen-table envelope. Later the Receipt shows plan versus actual, with no judgment.
*Agency:* high; default is skipping. *Cost:* M and entangled with Plan 29's economy. *Omit:* penalties for deviating, "you broke your plan" copy.

**D6. Chapters and nights.** Weeks as chapters; each night is a natural save point with a "Previously" recap built from the log. Supports multi-session classroom use without padding.
*Cost:* S-M. *Omit:* streaks that reward returning on a calendar day (design already treats streaks as a manipulation candidate).

**D7. Composition as mood.** Use existing `duckView` and `light` options to vary the *camera and light*, not the duck: a low angle under a harsh lamp on a defensive day, window light and side view on a recovery day. Never a verdict.
*Cost:* S (renderScene options already exist). *Omit:* any duck animation, any "judging" pose.

**D8. Curveball visitors.** The design's weekly curveballs (the unused `event` stream is the natural home) arrive as apartment visitors: landlord note, delivery, neighbor. Merch tie-ins, if ever wanted, are a visible, opt-in shelf item with an explicit fictional-currency price (never hidden, never real money).
*Note:* the `event` RNG stream is currently unused; giving it game-affecting visitors would be a **new economy consumer** and an **[Owner gate]**. Purely cosmetic choices use the separate stateless cosmetic label in §4.2 instead.
*Cost:* M. *Omit:* any hidden or automatic purchase; any inventory change from decoration.

### 2.1 Two contrasting arcs (and a third)

| | **Arc A: Tide** | **Arc B: Tether** | **Arc C: Window Shopper** |
|---|---|---|---|
| Shape | Spillover intensifies; the apartment gains collection grammar; narration grows defensive. | Student answers the neighbor; spillover plateaus and turns playful; gacha play can continue. | Student spends little; narration rationalizes *watching*, not buying ("I'm only tracking the timer"). |
| Delight | Collection joy is real and rendered as delight, not decay. | Shared collecting, a dinner invitation. | Cleverness at resisting, then a banner that tempts. |
| Endings | Existing endings only (Collection, Running on Empty, Uninstall, Run complete). | Run complete with an epilogue; Uninstall still equally dignified. | Run complete or Uninstall. |
| Not meant | Not "the correct feeling is dread." | Not "friends fix it." | Not "spending is the only harm." |

The arc is determined by **declared fictional state** (day, sold assets, debt, whether the door was answered), not by clicking behavior. Arc C shows why bands must not be a function of spending: a student who barely spends still gets rationalizing narration, which is a lesson about *attention*, not money.

### 2.2 Endings

I recommend **no new terminal route**. Add one epilogue choice inside Run complete: "put the phone in the drawer" or "open it once more." Both reach the Receipt; the choice is logged as a player action, not interpreted. **[Owner gate]** if the owner wants a named ending.

---

## 3. Pacing bands (assumptions, not measurements)

Current route is 3 days; the 15-minute figure has not been validated. Bands below are **assumed** reading-and-choice times for one engaged student reading most text.

| Segment | Core (min) | Optional (min) | Where the time earns its place |
|---|---|---|---|
| Opening, naming, free 10-pull, tutorial win, starter offer | 4-6 | | Existing; sets baseline |
| Ch.1 Settling in (Days 2-3) | 6-8 | | **Baseline calm**: Plan 36 effects mean nothing without ≥2 ordinary returns |
| Ch.2 The squeeze (Days 4-6) | 8-10 | Envelope Night +1 each | First intrusion; first apartment life choices |
| Ch.3 Spillover (Days 7-9) | 8-10 | Neighbor thread +5-8; Maintenance Day +2 | The contrast between arcs lives here |
| Ch.4 Resolution (Days 10-11) | 4-6 | | Epilogue; endings |
| Receipt reading and reflection | 6-10 | Expand evidence +3 | The point of the game |
| **Total core** | **~36-50** | | |
| Rapid low-reading route | ~15-20 | | Fast controls, skim captions; unvalidated |
| Replay on the other arc | | ~25-35 | Design-literacy reward |

- **Reconciling targets.** The core total (~36-50) sits above the owner's "at least roughly 30" so a slower reader still clears it; the ~15-20 rapid route is the historical low-reading reference, reached by fast controls and skimming captions, not a promised minimum. Both are unvalidated.
- **Time is content, never waiting.** No segment contains a timer. Maintenance Day is a day-skip with an always-visible skip.
- **Early exit still yields reflection.** Uninstall at P0 (before any Plan 36 beat) produces the existing Receipt: starter offer, exit friction, any reveal cues. Plan 36 adds a section only for beats that fired; the Receipt says nothing about unseen content. I recommend against an "here is what you missed" teaser inside the game, because it reads as retention pressure.
- **Multi-session:** nights are save points; recap is read from the log, so a returning student gets facts, not a re-roll.
- **Reading load risk [Hypothesis]:** narration plus Receipt expansion may exceed a class period for slow readers. Keep captions to one or two sentences and default the Receipt section collapsed (Layout A).

---

## 4. Plan 36 effect menu (12 candidates)

**Transitions and arrival (T)**

1. **Quiet Return** (T0, baseline). The unchanged Shell A return. *Always eligible at every stage*; most returns should be this.
2. **Where you land.** The return resolves into a *different authored room* (kitchen from the kit; later the neighbor's mirrored flat) or the desk with the phone left lying landscape. The arrival is the destination, not a failed exit. A fixed-position "Open Quackpot" stays on screen. *Replaces* orchestration's "unexpected room arrival" with a version that is a legitimate navigation target.
3. **Summons instead of snapback.** After landing, the phone buzzes with a notice that must correspond to something real in game state (an actual unclaimed item or offer); a fabricated "reward ready" would be deceptive and needs an owner decision.  The student chooses "Open Quackpot" or "Put it down." This keeps the owner's idea (a pull toward gacha) as an *offer*, which is better than a wobble because the choice and its outcome are loggable player actions and nothing pretends a control failed.
4. **Drift return.** The return grows slower over bands. **Defer/reject.** Currently the apartment is unreachable until the animation completes (`main.js:210-215`), so slowing it is effectively waiting, and a second click restarts it. If ever used: cap ≤ ~1.6 s, skip on second activation, baseline in Calm mode; static equivalent is the existing static return branch. That second-activation skip would change accepted Shell A behavior **[Owner gate]**.

**Environment and habits (E)**

5. **Card-frame ghosts.** Faint rarity-framed outlines around ordinary objects (mug, kettle, shoes). Static SVG overlay; at most three objects per view, one new per day.
6. **Receipt cards.** The character's meal receipts (built from real food-expense log entries) lie on the table in Duck-Dex card frames. The framing and set-grouping are the character's; the amounts are the record's. A "plain list" toggle shows the same facts as a table.
7. **Absence as silhouette, then recovery.** After a sale, the removed object leaves a Duck-Dex-style silhouette slot. Later returns, the slot is simply a clean wall or a plant. (Orchestration suggested the first half; the recovery half is mine.) Coordinate with Plan 31.
8. **Promo-grammar notices.** Landlord notices gain ribbons. **Defer.** High risk of obscuring real terms; revisit only after Plan 28's bill grammar exists.

**Narration (N)**

9. **Margin Note rationalization.** A caption in the character's voice paired with a fact reference (e.g. "Just one more race, then I'll eat" with the day's recorded food expense and clock label).
10. **The unmentioned object.** Narration lists the pleasant things on the table; the unpaid-bill envelope sits in view, unmentioned and openable. Selective attention becomes something the student can *choose* to correct, without being told they should.
11. **Compression and "after this."** A caption compresses time ("A quiet week") while the HUD day/clock stays true; a tomorrow-list sticky note is rewritten each night with "after this" appended. The HUD is the reliable anchor.
12. **Maintenance Day** (D4 above). A quiet counterpoint and recovery beat.

Not menu items but noted: calendar stamp grid (echoes login-reward grids), glint sweep on glass reusing the unmounted weather motion lifecycle (static equivalent: a fixed highlight), misattributed fanfare (a kettle click remembered as a Legendary jingle; used in Scene 1).

### 4.1 Shortlist of four (complementary)

| Pick | Why this set |
|---|---|
| **A. Margin Notes + unmentioned object** (#9, #10, #11) | The spine. Text-first, reduced-motion native, directly exercises the unreliable-narration seed. |
| **B. Receipt cards** (#6) | Concrete habit imagery grounded in real expense facts; owner seed 2. |
| **C. Where you land + Quiet Return + Summons** (#1, #2, #3) | Covers return-transition seed 1 without sabotaging controls. |
| **D. Maintenance Day** (#12) | A designed quiet beat and a recovery path; not a variant of any seed. |

Rejected/deferred: Drift return (#4), Promo notices (#8), glint sweep (needs weather mounting).

### 4.2 Specification for each shortlisted effect

**Shared rules** (apply to A-D):

- **Stage eligibility** comes from `pressureBand(state)`, a pure function of declared story state: `day`, `assetsSold`, `debt`, `health <= 20`, `billsSettled`, and a `doorAnswered` flag if D3 exists. Never from click rate, hover, timing, device, or counts of the student's own pulls/races. [Proposal] No band field exists today, so I sketch one (thresholds are placeholders for owner/Plan 29, not tuned values): **P0** Days 1-3 and no sale/debt (baseline, no effects); **P1** first bill shortfall or Day ≥ 4; **P2** one asset sold or debt > 0, or Day ≥ 6; **P3** two assets sold, or debt > 0 with `health <= 20`, or Day ≥ 8; **P4** final-day events. Bands are monotonic in day; quiet variants stay eligible at every band.
- **Narration may evaluate, never quote.** No caption states a price, balance, odds, term or deadline. Those appear only in HUD/bill UI, which is never narrated or altered. A caption may misjudge ("Rent's fine"), omit, or compress, but never misstate a number; that is what keeps the unreliable line from becoming a false operational statement.
- **Fact references** for captions are world facts (recorded expenses, clock label, sold assets), not the student's play counts.
- **Seeded cosmetic variation:** choose among authored variants with a stateless draw `createRng(seed).fork('cosmetic').fork(beatKey)` where `beatKey = <effectId>@d<day>#<occurrence>` and `occurrence` is counted from prior `scene_beat_displayed` entries of that effect in the log (never a session counter, or a reload could differ). By the contract at `prng.mjs:19-24` this cannot perturb `draw`, `race` or `event`, and it needs no new saved stream (the race resolver already uses this stateless-key pattern). **[Inference]**
- **No reroll on reload:** the chosen `variantId` is written to the log when the beat is displayed. On restore, read it from the log; if the beat was logged, re-render a still version without logging again.
- **Interruption:** Uninstall, Settings, Save, Dex stay live and visible. Beats are dismissible with one action (Escape or a visible Skip). No beat holds focus hostage; focus lands on the primary actionable control afterwards.
- **Sensory setting [Owner gate]:** a single "Sensory effects: Standard / Calm" setting. Calm disables motion variants, adds no drift, plays no audio bleed, and keeps all text. It also must be persisted (the existing glow flag apparently is not).
- **Cap:** at most one disturbed return and one new ghost per in-game day; quiet returns remain eligible at every band.
- **Evidence logged:** a new `scene_beat_displayed` event, appended only when the beat is actually on screen (the `recordReceiptPresented` precedent), carrying `{effectId, variantId, factRefs[], register: 'displayed', actor: 'character' | 'game'}`. Any player response is a separate `action` event.

| | **A. Margin Notes** | **B. Receipt cards** | **C. Where you land** | **D. Maintenance Day** |
|---|---|---|---|---|
| Purpose | Show rationalization and selective attention against a checkable fact | Make habit imagery from the character's own expenses | Express "pulled back toward the phone" via arrival, not control failure | Provide a designed quiet beat, recovery, and a technique to name |
| Eligibility | Bands P1-P4; lighter in P1 | P2+ and ≥2 food expenses recorded | P1+ as rare variants; Quiet Return always possible | Once, P2-P3, authored day |
| Variation/cap | Template choice per beat; ≤2 notes per day | Arrangement layout choice; ≤1 per day | Landing room/phone orientation; ≤1 per day | One authored variant set; once per run |
| Accessible equivalent | Real HTML text, one polite region updated once per beat; plain ledger is a button | Plain table of the same facts; decorative frames `aria-hidden` | Landing room named in text; same primary button position | All text; skip always present |
| Grounded counterpoint | HUD, bills and the plain ledger are never narrated | Real amounts printed plainly; no rarity implies value | Fixed "Open Quackpot"/"Sit at desk" in the same place | The apartment carries on: rain, kettle, radiator |
| Evidence | `scene_beat_displayed` + factRefs (log seq numbers) | same, with `sourceSeqs` of the food expenses | same, with `landing` and `phoneOrientation` | `offer_shown` (compensation) + beat event |
| Risks | Students read rationalizations as instructions; reading load | Reads as a minigame the student must play | Reads as a bug | Compensation reads as a reward for waiting |
| Dependencies | Plan 28 grammar, new event type, band function | Plan 28 and Duck-Dex card art reuse | Persisted location, schema bump, 1-2 room scenes | New offer, owner economy decision |

**Reject/defer reasons.** A has the most risk of mistaken instruction and the biggest reading load, so it ships with the shortest lines. B is rejected if testers think they are meant to play it. C is rejected if landing in a non-desk room causes more than momentary hesitation. D is deferred if the compensation is judged to reward waiting.

---

## 5. Three scene treatments

All text is **[Proposal]** and fictional. Scenes assume the expanded route: today the engine bills unnamed $5 food each day, rent once on Day 2, and ends after the Day 3 race. Recurring rent (Plan 29), voluntary meals and apartment choices (Plan 28) do not exist. Dollar figures below are **illustrative placeholders, not derived from the current economy**; I found no current path that produces them.

### 5.1 Early intrusion: "The Kettle" (an early Chapter 2 evening, say Day 4; band P1)

**Ordinary version.** After the day's race, the student presses Return. The standard fade-and-rotate plays and lands on the desk. HUD: *Day 4, evening, Cash $12.00* (illustrative).

**Disturbed version.** The return lands in the kitchen instead (variant, seeded, rare). Fixed button bottom-center: **Open Quackpot**. A second control: **Sit at the desk**. A kettle on the counter clicks off. A single gold card-frame outline appears around it for the length of the caption.

> Caption (character): *The kettle chimes. For half a second my brain says "Legendary." Ha. It's a kettle.*

Choices:
1. **Make tea.** Caption: *Tea. Normal.* Scene closes. Logged: `scene_beat_displayed(kettle-chime)`, `action: choice=tea`.
2. **Sit at the desk.** Moves to the usual desk view with the phone; no caption.
3. **Open Quackpot.** Starts the normal entry. Logged as an action; the beat has no further effect.

**Static/reduced-motion equivalent.** No transition rotation (already static); frame outline is a still; caption identical.
**Grounded counterpoint.** The character *notices and laughs*: reliability is high at this band. HUD unchanged.
**Receipt treatment.** "We displayed: a caption in the character's voice comparing a kettle chime to a game fanfare (Day 4), with a card-frame outline on the kettle. You did: [the recorded choice: Make tea, Sit at the desk, or Open Quackpot]. Did this affect you?"

### 5.2 Sustained spillover: "Sets" (Day 6, band P2-P3)

**Setting.** The student returns to the kitchen table. Three small receipts lie in card frames. The day and amount come from a recorded expense; the dish name is the character's decoration (the engine records no item names today), so the card marks it as the character's label:

| Card | Text on card | Source |
|---|---|---|
| 1 | *Day 4: $5.00 · "Noodles" (character's label)* | recorded food expense |
| 2 | *Day 5: (empty slot, silhouette)* | no food expense recorded that day (needs voluntary meals; today food bills daily) |
| 3 | *Day 6: $5.00 · "Toast" (character's label)* | recorded food expense |

A "Plain list" button sits under the cards. A bill envelope reading *RENT $15.00 due Day 7* lies at the table's edge (a recurring rent cadence is a Plan 29 question, not current). HUD: *Cash $9.00* (illustrative).

> Caption (character): *Look at that. Three days, two meals, one slot to fill. Funny how it all fits. Rent's fine. Rent's always fine.*

**Choices (assume Plan 28 provides a voluntary meal action; prices plain):**
1. **Buy dinner ($5.00).** Real expense; cash becomes $4.00. Slot 2 stays empty, because Day 5 is past; the character fills it in narration only.
2. **Read the bill.** Opens the actual bill: *$15.00 due Day 7; cash $9.00.* This is a player action.
3. **Skip dinner.** The existing skip-lunch rule and health effect, shown before confirmation (today that rule exists only as an escalation step).

**Static equivalent.** Cards are still images; "Plain list" shows the identical table. **Grounded counterpoint.** The plain list, the bill and the HUD say what the caption won't. **Evidence.** `scene_beat_displayed(receipt-cards, sourceSeqs=[…])` marks the arrangement as *depicted character activity*. It is not logged as something the student did; the choices are.

### 5.3 Later ambiguity and recovery: "Scheduled Maintenance" (Day 9, band P3)

**Visual sequence.** Rain at the window (existing weather art, if mounted; otherwise a still). The phone lies face-up. Its screen: *Quackpot is down for maintenance. A thank-you offer will be shown when service returns.* A **Skip to after maintenance** link is on the phone and in the HUD area.

> Caption: *I'm not checking. I'm confirming that it's down.*
> *(Radiator ticks. Somewhere a door closes.)*

**Choices:**
- **Refresh anyway.** Shows the same maintenance screen. Honest; nothing changes.
- **Put the phone in the drawer.** Caption: *Quiet.* Arc B only: a knock follows.
- **Skip to after maintenance.** Compensation offer: *"We're sorry! 60 free gems."* The offer is logged as shown; accepting or declining is a player action.

**Arc B variant** (door answered earlier): the neighbor says through the door, *"You okay? You were standing in the hallway a while."* The student replies *"Fine. Phone died."* (a character line the student chooses) or *"Honestly? Lost track."* Both are fiction; neither is logged as a fact about the student.

**Static equivalent.** All text; no motion needed. **Grounded counterpoint.** The kettle, rain, and neighbor are ordinary life; the app being down changes nothing about bills. **Receipt treatment.** The compensation offer is a displayed cue (we displayed / you did). The student's chosen replies appear as *choices*, never as a statement of how they felt.

---

## 6. Example Receipt excerpt

> **Apartment and narration (Day 6)**
>
> **We displayed**
> - Narration in the character's voice: "Rent's fine. Rent's always fine." *(fictional; shown at Day 6 evening)*
> - The same screen showed an envelope reading "Rent $15.00 due Day 7" and a status bar reading "Cash $9.00." *(record)*
> - Two meal receipts from Day 4 and Day 6 were arranged on the table as card frames, with one empty slot. The arrangement depicts what the character did. *(depicted character activity, not recorded as your action)*
> - The return to the apartment landed in the kitchen. A button "Open Quackpot" was in its usual place.
>
> **You did**
> - Ran 1 race (recorded).
> - No "read the bill" action is recorded for this evening. *(A statement of the record only; it does not say you did or did not notice the bill.)*
> - Chose "Buy dinner ($5.00)" (recorded).
>
> **Did this affect you?**
> - Did the game still feel present when you returned to the apartment?
> - The narration and the bill said different things. Which one did you rely on, if either?
> - Has a game or app ever phrased a decision in a way that made it sound smaller than it was?
>
> *Reliable anchor: Day 6; Cash $9.00 before dinner, $4.00 after; Rent $15.00 due Day 7.*

This excerpt is an illustration, not engine output; it assumes the new `scene_beat_displayed` event and new logged apartment actions. Nothing in it states what the student felt or noticed.

---

## 7. Bounded investigation and prototype recommendations

Prioritized, none authorized by this report.

1. **Narration-to-fact contract sheet (docs only).** Write 12 candidate lines. For each, name the exact log event or state field that makes it checkable, and mark gaps. Cheapest test of the spine, and it finds missing events before anyone builds.
2. **Determinism spike (pure-function, no UI).** `pressureBand(state)` and `cosmeticKey` with unit tests showing equal outputs after a save/restore, and that draw/race/event stream outputs are bit-identical with and without the cosmetic fork. Uses patterns the code already has.
3. **Apartment-leave check.** Render-verify whether Leave from the apartment needs an extra click (§1.1). This is a prerequisite for any apartment beat, because Uninstall must reach the Receipt immediately.
4. **Receipt mapping sketch** inside Plan 27 Layout A: where a "narration vs record" row lives, collapsed by default.
5. **Static HTML storyboard** of Scenes 5.1-5.3 at 390×520 and 1440×900, reduced-motion by default, with a facilitated read-through (no telemetry).
6. **One art spike** (Sonnet SVG): card-frame outlines on three existing props via the kit's overlay path, plus a landscape-phone desk variant.

### 7.1 Unresolved decisions **[Owner gate]**

- Is a persisted apartment location (schema bump) acceptable, given Plan 28's wariness of multiroom navigation?
- Does the Receipt add a non-technique "narration and presentation" section?
- A global "Sensory effects" setting, and whether the OS reduced-motion flag is sufficient alone.
- Second-activation-skips-return (changes accepted Shell A behavior).
- Maintenance compensation as a gem grant and a named technique.
- Neighbor thread: whether it collides with the deferred Mom/streamer material.
- Envelope Night as a new mechanic with economy consequences.
- Whether Plan 36 should wait for Plan 28/29 given the 3-day route.

### 7.2 What would falsify my favorite idea (Margin Notes with a plain ledger)

- In a facilitated read-through, most students cannot name any divergence between a caption and the record even when prompted, so the contrast is too subtle.
- Students treat captions as game instructions (for example, believe "Rent's fine") and miss a bill. That would mean the reliability tell fails.
- The plain ledger becomes a crutch that students open first, so narration carries no experiential weight.
- A screen-reader walkthrough hears contradictory text without any cue that it is a character's voice.
- Reading time per beat visibly exceeds a few seconds for most testers, or the Receipt section pushes total time well past a class period.
- Testers read the narration layer as a lecture about their behavior.

### 7.3 Leaving out on purpose

Control sabotage; hit targets that move; fake loading; screen shake; flashes; clicking-speed or hover inference; an unreliable HUD, bill or Receipt; a companion that comments; hidden purchases; a second human-player minigame for receipts; claims about dopamine, addiction or dissociation. No web research was used, so no external findings are asserted.

---

## 8. Criticism of the brief

- "Later-game" assumes a game that does not exist; the route is three days. Plan 36 is blocked on length work, and the brief should say so plainly.
- "Disorientation" is easily read as interface disorientation; the contract list already forbids it, but the word invites it.
- Asking for 3,000-5,000 words plus scenes plus an excerpt pressures breadth. Fewer, deeper beats would serve the owner better.
- The brief's no-click-inference rule is correct, but it also forbids the most natural gate for "habit" content; I used world-state facts instead, at the cost of beats that cannot mirror a student's own play.
