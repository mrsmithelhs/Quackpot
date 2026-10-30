# Plan 28: production integration proposal (Direction A)

- **Status:** proposal only. No `src/` file has been edited. Production edits are outside the Plan 28 packet.
- **Part A** (2026-10-30) fits the **selected interaction model**: the mix (owner D20), plus the duck decisions D14, D18
  and D21.
- **Part B** is the earlier floating-card proposal, kept as history. Root's revision 05 did not select that card
  treatment. Part A says which Part B sections still apply.
- Nothing here is evidence of runtime behavior in the real app.

# Part A: the selected mix

## A0. The one decision requested from root

Assign or decline **one cohesive implementation packet** for the selected mix:
- the modules in A2;
- the `main.js` rewiring in A3;
- the state-derived routing in A4.

It needs no engine rule change and no new event type.

It needs **one small Plan 25 apartment-kit change**: let a scene omit or pose its duck (A2.3), so production doesn't
remove the kit's duck in the page the way the prototype does.

The ordering and exposure changes in A9 need the owner's confirmation and root's agreement within that one decision.
They are not separate gates.

## A1. The selected flow: what is where, and where you commit

| Beat | In the room (layer 1) | Held or confirm (layer 2) | Commitment, in the game's voice (layer 3) | Engine call |
|---|---|---|---|---|
| Rent, enough cash | Notice taped to the fridge, kitchen wide; the duck on a wall shelf faces it | The letter, held and readable; the institution prints no controls | Collapsed **Decide** panel: "Pay $15.00", cash $15.00 → $0.00 | `billExpense('rent', 15)` |
| Rent, short | Same | Same letter | Decide: "You are $0.99 short. Nothing will be taken." then **Try to pay $15.00**, then "Rent unpaid · you need $0.99 more" | the same `billExpense('rent', 15)`; the engine records only `expense_due` |
| Offer: extra shift (also optional after paying with exactly $15) | Phone on the desk shows Marisol; the duck faces right, chest on a paperback, gazing up at it | Phone held: her text thread | The game panel beside the phone, because a text can't state the health cost: accept with its exact effect, **turn it down** (recorded; says rent stays short), or **Not now** (nothing recorded) | `acceptEscalation` / `declineEscalation`, or `chooseZeroCashOption('extra_shift')` |
| Offer: sell the couch / the TV | Living room; the object carries a sale tag; the duck faces it | (none) | Confirm attached to the object, or a sheet under the room on narrow screens: accept, keep (recorded), or Not now | ladder calls, or `chooseZeroCashOption('sell_couch')` |
| Offer: card cash advance (last) | Phone on the desk with the card app | Phone held: card app (available amount, what's owed now) | The game panel. Only this decline says "this run ends. Your Receipt is next.", and that label comes from the engine's own decline preview. | ladder calls; the final decline leads to `running_on_empty` |
| Go to work | Day bar (non-diegetic): "Later that afternoon" and "Go to work" | (none) | The day bar button | `proceedToDay2Evening` order: zero-cash `continue` only while that choice is open, then the wage, then the next day |
| Breakfast (D9) | Kitchen medium, Day 3; empty plate on the counter; the duck looks at it | (none) | Confirm at the plate: "Buy breakfast for $5.00" (the bakery downstairs, D15), with cash before and after | `billExpense('food', 5)` |

Rules that hold everywhere:
- Every amount comes from an engine clone of the action about to run.
- Every commitment is guarded against double activation, and `billExpense` is also idempotent per bill.
- "Put it down", "Not now", Esc and clicking the dimmed room never record anything.

The ladder previews are those of `comparison/life-model.mjs`.

## A2. Modules and ownership

### A2.1 New focused modules under `src/ui/life/`

| Module | Contents | Ported from (report) |
|---|---|---|
| `life-routing.mjs` | Pure: `placeFor(engine, requested)`, `rentState`, `optionalOpen`, `OFFER_PLACE` | `gallery/mix-model.mjs` |
| `life-decisions.mjs` | Pure decision view-models: pay, shortfall, ladder (accept / turn down / Not now), optional shift and couch, breakfast; copy | `gallery/mix-model.mjs`, `gallery/copy.mjs`, `comparison/views.mjs` |
| `life-preview.mjs` | Clone-based effect previews; cost to be measured (see B3) | `comparison/life-model.mjs` |
| `life-objects.js` | Layer 1: world objects as positioned buttons with an accessible name, halo, chip (guidance level, D14), and done state that stays focusable | `gallery/gallery.js` renderRoom |
| `life-held.js` | Layer 2: held letter, phone and notepad views. A modal dialog with the page made inert behind it, focus on its heading, Esc or backdrop to put it down, focus returned to the object, and a pickup animation with a reduced-motion fallback. | `gallery/gallery.js` openHeld/closeHeld |
| `life-decide.js` | Layer 3: the collapsed Decide panel (D13); the anchored confirm, which becomes a sheet under the room below 760 px; guarded commits; result then done | `gallery/gallery.js` decisionPanel, openPopover |
| `duck-pose.mjs` | Gaze helpers (`headingToward`, `leanToward`) and the tilt rule (wedge required, at least 12°, at most 25°), with perches and wedges | `gallery/duck-layer.mjs`, `gallery/perches.mjs` |
| `life.css` | Styles for the three layers, scoped to `.life-*` | `gallery/gallery.css` (player rules only) |

### A2.2 Edited files

**`src/main.js`**
- Replace the phone rent screen (`:405-421`) and the zero-cash and escalation modal branches (`:527-593`) with a
  single `mountLife(engine, place)`.
- Move the three automatic food charges (`:342`, `:651`, `:661`) to the breakfast confirm (D9).
- Replace the paid-zero "continue" with the day bar's "Go to work".

**`src/ui/modals.js`**
- Retire `renderZeroCashPrompt` and `renderEscalationModal`.
- Starter, retention and corrupt-save modals are unchanged.

**`src/core/game-engine.mjs`:** no change.

### A2.3 Plan 25 apartment kit (one small change, to be scoped through root)

The prototype removes the kit's duck from the rendered SVG in the page and draws a posed duck in its place using the
kit's own `renderDuck` artwork. Production should not rely on page surgery. Proposal:
- add `renderScene({ duck: false })`, or a `duckPose` option, that omits the built-in duck and its shadows;
- correct the stale "not imported by the game" comments (B10).

Final art, as an art request separate from code:
- final-quality versions of the sketch props (taped notice, sale tag, plate, bakery bag, envelope) and perches (wall
  shelf, paperback; the book stack, crate and ledge are drafted but unused);
- optionally, a front door for notices slipped under it.

## A3. Engine mapping

B3 still applies, with these changes:
- "Try to pay $15.00" is the same `billExpense('rent', 15)` as Pay. It is shown only when cash is short, and it says
  beforehand that nothing will be taken.
- Ladder: accept is `acceptEscalation`; turning it down is `declineEscalation`.
- The day bar's "Go to work" runs the `proceedToDay2Evening` order. It calls the zero-cash `continue` only while that
  choice is open: after an extra shift or a sale the engine has already closed it, and calling it would throw. This was
  found as a real prototype bug.

## A4. Reload and context routing

Where the player is, is derived from engine state by `placeFor`:
- **terminal:** the Receipt;
- **rent owed:** the place of the current offer (`getCurrentEscalationStep`);
- **rent unpaid:** the fridge notice;
- **Day 3:** breakfast;
- **otherwise:** the place the player last chose.

Notes:
- **Not saved.** The player's chosen place is UI state and is never saved. After a reload, mandatory beats come back
  from state, and optional beats stay reachable through the day bar. No schema change.
- **Breakfast unchanged from B4.** The new morning step strings and the reload rule for breakfast still apply.
- **Uninstall and Settings.** In the room, the HUD stays reachable, matching B4.3's recommendation. While
  something is held, the page behind the dialog, including the HUD, is inert: put it down first (Esc). The latent
  Uninstall-from-retention defect in B4.3 still stands.

## A5. Focus and accessibility

- **World objects:** every object is a `<button>` with an accessible name, so it can be reached by Tab. The chip is
  decorative (`aria-hidden`), and the name carries the meaning. Done objects use `aria-disabled` and stay focusable.
- **Held objects:** picking something up moves focus to the held object's heading. Decide is a disclosure button
  (`aria-expanded`). Putting it down returns focus to the object. If the place changed, for example after the
  shortfall result, focus goes to the new place's object.
- **Confirms:** the anchored confirm is a non-modal dialog with focus on its heading. Esc returns focus to the object.
- **Verified in the gallery:** these behaviors, plus double Enter and same-instant double clicks producing one event,
  all checked by keyboard at 1280×720. At 390×844 there's no horizontal scroll in six moments, held views stack, and the
  confirm becomes a sheet under the room.
- **Not verified:** real OS reduced motion. `?motion-off` was checked; it is not the same thing.

## A6. Event and display boundaries

B6 still applies: no new event types, and no display logging of life surfaces in the first integration (D10).

## A7. Migration and evidence

B7 still applies:
- no schema change;
- old saves route through `placeFor`;
- Plan 35 fixtures stay historically valid, and their current attestations need compatible offline revalidation, not
  recapture.

## A8. Validation plan

- **Unit tests.** Port `gallery/gallery.test.mjs` (7 tests: routing for both rent fixtures, the shortfall attempt,
  ladder places and the honest decline labels, accept effects equal to previews, gaze and the tilt rule, inert
  scoped art, a letter with no controls). Also port the still-relevant `comparison/plan28.test.mjs` cases (fixture
  pins, furnishings, breakfast tap, framing).
- **Existing suites.** Run the engine, storage and Receipt tests that cover these calls, chosen by grep.
- **Browser, in the real app.** The gallery's checks, plus reload at each place, Settings over a held object,
  Uninstall Stay and Leave from each place, the Receipt after both branches, and real reduced motion if a harness can
  emulate it.

## A9. Ordering and exposure changes needing owner confirmation and root agreement

1. **Breakfast becomes a tap** (D9), already recorded. The food charges move from the evening transitions to the
   morning confirm.
2. **Paying with exactly $15.**
   - **Before:** the two optional choices (extra shift, sell the couch) sat as buttons on the paid-zero card.
   - **Now:** they are objects in other places: the phone's message, the couch's sale tag. The day bar offers "Later
     that afternoon", and "Go to work" ends the choice.
   - A player can now go to work without seeing them. That fits D4 and D5 (optional lanes, relaxing guidance), but it
     changes how often the choices are seen. The duck's gaze and the halo still point to them.
3. **Rent short.** The four offers are no longer one card. Each appears where it lives, one at a time, with the scene
   cutting to the next after a turn-down. The order and effects are unchanged.
4. **New non-diegetic control:** the day bar.

## A10. Risks

- **Discoverability of optional beats** (A9.2), especially early in a run.
- **More taps per beat:** picking up, then Decide, then confirm.
- **Kit change needed:** A2.3, Plan 25.
- **Art adoption:** the sketch props are not final art.
- **Scene cuts on the ladder** may feel abrupt without a transition. A short crossfade is easy, and it already has a
  reduced-motion fallback in the held-object code.
- **Inherited from Part B:** preview cost, and the Uninstall-from-retention defect.

# Part B: earlier proposal (floating-card model), kept as history

Root's revision 05 did not select the card treatment in B1–B2 and B5. Sections B3, B4, B6, B7 and B9 still apply where
Part A says so.

## B0. The one decision requested from root

Assign or decline a **single cohesive implementation packet**. It would cover:
- the modules in §2;
- the `main.js` rewiring in §3;
- the routing in §4.

It reuses existing engine computations and event types. It includes an owner-approved controller timing/progression
change: breakfast is charged when the player taps, instead of automatically (§1). That requires compatibility and
lifecycle checks even though amounts and engine action methods are retained.

Root also needs to decide on the HUD-during-card question (§4.3). Root may split the packet differently, but slicing it
into preliminary gates is not needed.

## B1. Current flow and selected flow

| Moment | Current production | Selected (Direction A) |
|---|---|---|
| Day 1 breakfast | Charged silently when the gacha's Proceed button is pressed (`main.js:342`), before `advanceDay(1,'day 1 midday')`. Nothing shows the charge. | **Kitchen, wide framing (the Day 1 establishing shot).** A paper note says "Breakfast: $5.00, not paid yet" and shows current cash, with one control: **Pay for breakfast**. This comes before the phone opens, so the Day 1 opening order changes (§9). |
| Day 2 breakfast | Charged inside `proceedToDay1Evening` (`main.js:648-652`), when the starter modal closes, together with the wage and the day change. | Evening still credits the wage and advances the day. **Day 2 morning: kitchen, medium framing,** with the same note and tap. |
| Rent | A phone rent screen (`main.js:405-421`) and its Pay button (`:434`). The result appears in `zerocash` or `escalation` modals (`modals.js:45`, `:87`; dispatch at `main.js:527`, `:557`). | A Harbor Court Property Office bill on the desk-top. Paying with exactly $15 gives a "Paid in full" paper with the PAID stamp and $0.00, plus two optional choices. Paying short gives "Rent unpaid · you need $X more", and the escalation offers appear in their own places: the shift is a message from Marisol at the desk-side, the sales happen in the living room, and the card advance arrives as a card statement. |
| Day 3 breakfast | Charged inside `proceedToDay2Evening` (`main.js:658-662`). | Kitchen, medium framing, with the same tap. |
| Return from gacha | Desk view (`apartment-view.mjs`, desk-side). | Desk-side, with a day summary (cash, health, what's due next). No mechanics change. |
| Final decline | Escalation modal; the decline leads through `exhaustEscalation` to `running_on_empty`, then the Receipt. | The same engine path. Only the last decline is labelled as ending the run, and the Receipt is next. |

Unchanged: amounts, health costs, debt, ladder order, endings and the Receipt. Breakfast has no skip control; skipping
a meal is a Plan 37 rule. The duck stays still within a scene and appears in each scene.

## B2. Modules and ownership

These are focused modules, kept out of `main.js` and the global `style.css`. Each is a port of a tested prototype
module.

| New file | Contents | Ported from |
|---|---|---|
| `src/ui/life/life-routing.mjs` | Pure code: `ROUTES`, `lifeLocation(state)`, `morningFramingFor(day)` and `furnishingsFrom(assetsSold)`. | `comparison/life-model.mjs` |
| `src/ui/life/life-scene.mjs` | Pure code: `sceneFor(moment, …)`, which produces `renderScene` options for the existing kit. | `life-model.mjs` |
| `src/ui/life/life-views.mjs` | Pure view-models and copy: breakfast, ledger, rent due, paid-zero, unpaid ladder, outcome and return. Every amount comes from the engine or `GAME_CONSTANTS`. | `comparison/views.mjs` |
| `src/ui/life/life-preview.mjs` | Clone-based effect previews (`previewZeroCash`, `previewLadder`), so each button can state its exact effect. | `life-model.mjs` |
| `src/ui/life/life-surface.js` | DOM mounting: scene and card, heading focus, token/busy duplicate guard, status live region. | `comparison/prototype.js` (renderCard, click guard) |
| `src/ui/life/life-surface.css` | Card, paper, bill, message and statement styles; the scroll region with actions outside it; layout below 760 px. | `comparison/prototype.css` (player rules only) |

Edited files:

- **`src/main.js`**
  - Replace the rent screen branch (`:405-421`) and the zero-cash and escalation modal branches (`:527-593`) with one
    `mountLifeSurface(engine, location)` call.
  - Remove the three automatic food charges (`:342`, `:651`, `:661`) and add the breakfast handler.
  - Add routing for the morning steps.
  - Expected net change: smaller.
- **`src/ui/modals.js`**
  - Retire `renderZeroCashPrompt` and `renderEscalationModal` once the life surface covers their states.
  - Starter, retention and corrupt-save modals are untouched.
- **`src/core/game-engine.mjs`:** no rule changes. The breakfast handler reuses the existing `billExpense('food', …)`,
  which is idempotent per bill ID (`:745-753`).

Overlapping ownership that root should settle in the packet:
- **Plan 25:** `apartment-view.mjs`, `desk-view.js`, `stage-transition.js` and the apartment kit, which Plan 28 only
  imports.
- **Plan 35:** fixtures and attestations; see §7.
- **Plans 37, 29 and 36:** see §9.

## B3. Mapping controls to engine actions

Every call already exists. Only the breakfast call moves.

| Control | Engine call | Current call site |
|---|---|---|
| Pay for breakfast | `billExpense('food', GAME_CONSTANTS.FOOD_DAILY)`, then set the next step | moved from `main.js:342`, `:651` and `:661` |
| Pay rent | `billExpense('rent', 15)` | `main.js:434` |
| Continue to evening, extra shift, sell couch (rent paid, $0 left) | `chooseZeroCashOption(choice)` (`game-engine.mjs:798`) | `main.js:529-554` |
| Accept an offer | `acceptEscalation()` (`:886`); if resolved, go to `proceedToDay2Evening` | `main.js:559-579` |
| Skip an offer, or the final decline | `declineEscalation()` (`:964`); the last one goes through `exhaustEscalation` (`:977`) to `running_on_empty`, then the Receipt | `main.js:580-593` |

**Breakfast result routing.** Production currently ignores the result of `billExpense` for food (`main.js:342`, `:651`,
`:661`). The new handler must act on it:
- If the result is short (`needsEscalation`), mount the same ladder surface for the food bill. `lifeLocation` already
  has the `food-unpaid` row.
- If breakfast leaves exactly $0.00 (`zeroCash`), mount the paid-zero surface.

Under the current constants, cash before each breakfast is at least $10, so neither case is reachable today. Plan 29
calibration could make them reachable, so the routing should exist anyway.

**Effect previews.** These clone the engine envelope, about 170 KB, once per option shown. That is 2–4 clones per card
render, and only on rent surfaces. The implementation packet should measure this cost. If it is too slow, the
fallback is a pure engine method `previewEscalation(step)`. That would be a new read-only method, not a rule change.

## B4. Save, reload and context routing

### 4.1 Steps

- **New morning step strings:** `d1_morning_breakfast`, `d2_morning_breakfast` and `d3_morning_breakfast`.
  - The evening helpers set them after `creditWage` and `advanceDay`.
  - The breakfast handler moves on to the existing next step after paying.
  - `validateSave` has no closed list of steps (`storage.mjs:517-564` checks only the race and terminal rules), so the
    new strings pass.
- **Rent steps are unchanged:** `d2_afternoon_rent`, `_rent_resolved`, `_zerocash` and `_escalation`.

### 4.2 Reload

At present, `main.js:140-148` restores `step` and `activeModal` independently, and nothing checks that they agree.
- **Proposal:** the life surface derives its place from the full state through `lifeLocation(state)`. The H1 tests
  cover every persisted route in the source table, and states reached by real actions from both fixtures.
- **An unknown combination** needs an explicit, non-destructive recovery policy. Do not silently route a new morning
  step into an unrelated phone view or replay already-committed pulls, payments or races. Cover named supported old
  saves and interrupted states rather than relying on the validator accepting arbitrary step strings.

Breakfast on reload:
- If breakfast is unpaid (its bill ID is not in `billsSettled`), the note shows again.
- If the app crashed between the charge and the step update, the bill ID is already settled. `billExpense` then
  returns `alreadySettled` (`game-engine.mjs:746-748`), so the routing moves forward with no second charge.

This also removes an inconsistency found in reading the source: after a zero-cash rent payment, the phone rent card
behind the modal still reads "Pay Rent / $15.00 Due" (`main.js:405-421`, where `isResolved` is false for
`d2_afternoon_zerocash`).

### 4.3 HUD, Settings and Uninstall

What happens today:
- The modal backdrop (`style.css:929-938`, z-index 1000) blocks the HUD for the mouse.
- Zero-cash and escalation modals do not set `inert`, so keyboard users can still Tab to the HUD.
- Settings uses its own focus trap and `inert` (`settings-modal.js:39-43`, `:72-101`).

**Proposal: life cards are part of the page, not modal dialogs.** No backdrop, no `aria-modal` and no focus trap, so
Save, Settings and Uninstall stay reachable on every life surface. This matches the selected experience, in which
bills sit in the apartment rather than over it. **Root delivery disposition,2026-10-30:** approve this reachability
for the future integration; it follows existing Save/Settings/Uninstall contracts and is not an unresolved owner
product choice. Both pointer and keyboard access must work.

Consequences:
- **Settings** keeps its modal behavior. Closing it returns to a life surface that is re-derived from state.
- **Uninstall** stores `interruptedContext = {step, activeModal}` (`game-engine.mjs:990-1007`). Stay restores it
  (`:1025-1048`), and the life surface re-derives from the restored state. The prototype's H1 test covers Stay and Leave
  over the ladder.
- **Existing defect (engine reproduction by root,2026-10-30; browser reachability still untested).** Because the retention modal does not make the HUD inert,
  pressing Uninstall again from the retention modal calls `clickUninstall` a second time. That overwrites
  `interruptedContext.activeModal` with `'retention'`. Root reproduced Pay on the unpaid fixture, Uninstall twice,
  then Stay: activeModal incorrectly returns to retention instead of escalation. The future integration packet
  should make repeated Uninstall requests idempotent without replacing the original context; keep immediate Leave
  and at-most-once retention reward. Do not solve this by blocking Uninstall on ordinary bill surfaces.

## B5. Focus and accessibility

- **Focus:**
  - After each player action, focus moves to the new card's `<h2 tabindex="-1">`. This is verified in the prototype
    at both widths.
  - On first load, focus is left alone. After Settings closes, focus returns to the trigger (existing behavior,
    `main.js:635`).
- **Text and controls:**
  - All copy is HTML text, not SVG, and the scene is `decorative: true`.
  - Controls are at least 44 px tall.
  - Each choice's label states its effect, and only the true ending is labelled as one.
- **Card layout:**
  - On desktop, the text scrolls inside the card while the actions stay visible.
  - Below 760 px, the card sits in normal page flow under the scene.
- **Motion:** use the production `stage-transition.js` reduced-motion path. Real OS reduced motion is still
  unverified, because the prototype's harness could not emulate it.

## B6. Event and display boundaries

- **No new event types.** The first integration records outcomes only, through existing events: `expense_due`,
  `expense_paid`, `escalation_offered`, `escalation_result`, `action`, `income` and `terminal`. That is what the
  Receipt's "you did" register already reads.
- **Owner decision D10:** life surfaces are not logged as displayed in the first integration. A view-model existing,
  or a card rendering, is not evidence of display.
- **Possible later step (not proposed now).** Reuse `cue_shown` with a `cueId` such as `life_rent_bill` and **no
  `technique` field**.
  - `receipt.mjs:35-38` builds findings only from shown entries whose `technique` matches. So such entries would not
    create, or quietly assert, a manipulation category.
  - Logging would happen only after the card is visible: after the transition finishes, deduplicated per bill per
    day, and never on a reload re-render or an interrupted transition.
- **Order of events in new logs.** Moving the breakfast charge changes the order of food events relative to other
  events. For example, `d1_food` would come before the gacha's events instead of after Proceed. Historical logs are
  unaffected.

## B7. Migration and evidence

- **Saves.** No new envelope field is proposed, but that does not establish migration-free behavior. The rent fixtures
  have breakfast settled; other old saves do not. The valid historical Plan16 pending-reveal checkpoint is Day1,
  `d1_morning_gacha`, with unsettled `d1_food` and ten pending reveals. Define compatibility for this and other
  pre-breakfast/interrupted states, preserving their existing progress and revealing no already-committed result
  twice. Settled bills must never be charged again. Saves on known rent steps route through `lifeLocation`.
- **Hash chains.** Appending new events, or different event orders in new runs, does not rewrite valid historical
  entries. Old chains stay valid.
- **Plan 35 fixtures.** The two rent fixtures stay historically valid saves. What changes is their **current
  attestation**: source changes to `main.js` and the engine closure make the recorded source/validator identity
  stale.
  - Compatible revalidation is the desired reuse path, but the CURRENT Plan35 validator deliberately rejects
    production-source drift against the captured source closure. Its existing revalidate command does not authorize
    rebinding that origin to new production code. A reviewed compatibility extension or later bounded reuse task is
    needed; do not expect a routine command to pass after main.js changes. Preserve old capture bytes/provenance,
    and use fresh ordinary saves/full-start evidence for integration where appropriate rather than expanding this
    packet into a checkpoint-tool rewrite. Do not recapture all fixtures by default.
  - **Recapture** is needed only to witness genuinely new behavior. A new fixture, such as "Day 2 morning, breakfast
    unpaid", would be a new capture, labelled as such.
  - Do not regenerate all fixtures by default.
  - Do not relabel old displayed evidence as newly witnessed.

## B8. Validation plan (proportionate)

1. **Unit tests.**
   - Port `plan28.test.mjs` (13 tests: H1 routing, H2 furnishings, semantic copy and outcomes, breakfast tap, framing)
     into `tests/` against the new `src/ui/life/` modules.
   - Run the existing tests that cover `billExpense`, zero-cash, escalation, storage reconciliation and the Receipt.
     Choose them by grep at implementation time, not by running the whole suite repeatedly.
2. **Plan 35.** Run the read-only fixture preflight. Plan 35 owns the re-attestation decision.
3. **Browser, on the real app.** Repeat the prototype gate at 1280×720 and 390×844, plus the integration-only cases:
   - reload at each morning and rent step;
   - Settings open over a bill;
   - Uninstall Stay and Leave from each life surface;
   - Uninstall pressed from retention, which is the latent defect;
   - one real `billExpense` per double activation;
   - Receipt contents after both rent branches;
   - real reduced motion, if a harness can emulate it, with the limit stated otherwise.

## B9. Seams left open (no stubs)

- **Plan 37 (time and optional lanes):**
  - The breakfast note already supports several controls, so a skip choice is a data change.
  - Marisol's message thread is the natural home for skipped-shift and fired lanes.
  - Light and framing per moment are already parameters.
- **Plan 29 (numbers):** every amount is read from `GAME_CONSTANTS` or engine results, and the food-unpaid route exists
  for when calibration makes it reachable.
- **Plan 36 (late-game distortions):** copy is data in `life-views.mjs`.

## B10. Risks

- **Day 1 opening order.** A kitchen breakfast before the phone opens changes tutorial pacing (owner D4: guide without
  overwhelming). Consider a one-line hint on Day 1 only.
- **More taps.** Tap-to-pay adds one deliberate tap per morning (three in a run). That is the point, since it makes
  life visible, but it lengthens the loop.
- **HUD reachability during rent (§4.3)** is a behavior change from today's mouse-blocking backdrop.
- **Preview cost (§3)** has not been measured in production.
- **Stale comments.** `src/assets/apartment/index.mjs:5` and its README say the kit is "not imported by the game",
  but `apartment-view.mjs:1` imports it. This is a documentation fix for Plan 25.
- **What the prototype stood in for.** Its Save, Settings, Uninstall, Receipt and race stand-ins mean those
  integrations have only been reasoned about here, not exercised.
