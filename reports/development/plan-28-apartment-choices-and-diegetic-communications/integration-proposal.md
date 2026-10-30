# Plan 28: production integration proposal (Direction A)

- **Status:** proposal only. No `src/` file has been edited. Production edits are outside the Plan 28 packet.
- **Basis:**
  - the report-local prototype in `comparison/`;
  - the owner decisions D1–D10 (`owner-direction-2026-10-30.md`);
  - a static reading of the current source at HEAD `928ea02`.

Line citations come from that reading. A Haiku explorer produced the source map, and the lead spot-checked the key
lines. Nothing in this file is evidence of runtime behavior in the real app.

## 0. The one decision requested from root

Assign or decline a **single cohesive implementation packet**. It would cover:
- the modules in §2;
- the `main.js` rewiring in §3;
- the routing in §4.

It requires no engine rule change and no new event type. It includes one owner-approved timing change: breakfast is
charged when the player taps, instead of automatically (§1).

Root also needs to decide on the HUD-during-card question (§4.3). Root may split the packet differently, but slicing it
into preliminary gates is not needed.

## 1. Current flow and selected flow

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

## 2. Modules and ownership

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

## 3. Mapping controls to engine actions

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

## 4. Save, reload and context routing

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
- **An unknown combination** falls back to the current phone view rather than guessing.

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
bills sit in the apartment rather than over it. **Root decision:** whether that HUD reachability is acceptable during
rent.

Consequences:
- **Settings** keeps its modal behavior. Closing it returns to a life surface that is re-derived from state.
- **Uninstall** stores `interruptedContext = {step, activeModal}` (`game-engine.mjs:990-1007`). Stay restores it
  (`:1025-1048`), and the life surface re-derives from the restored state. The prototype's H1 test covers Stay and Leave
  over the ladder.
- **Latent defect (source reading only, not reproduced).** Because the retention modal does not make the HUD inert,
  pressing Uninstall again from the retention modal calls `clickUninstall` a second time. That overwrites
  `interruptedContext.activeModal` with `'retention'`. The packet should guard `clickUninstall` while
  `activeModal === 'retention'`, or make the HUD inert under that modal. This sits next to Plan 28 rather than inside
  it.

## 5. Focus and accessibility

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

## 6. Event and display boundaries

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

## 7. Migration and evidence

- **Saves.** There is no schema change. Saves written by the current code already have breakfast settled for the day
  they are on, so the new routing shows no tap for them, which is correct. Saves on rent steps route through
  `lifeLocation`.
- **Hash chains.** Appending new events, or different event orders in new runs, does not rewrite valid historical
  entries. Old chains stay valid.
- **Plan 35 fixtures.** The two rent fixtures stay historically valid saves. What changes is their **current
  attestation**: source changes to `main.js` and the engine closure make the recorded source/validator identity
  stale.
  - Handle that with Plan 35's compatible offline revalidation. Do not recapture.
  - **Recapture** is needed only to witness genuinely new behavior. A new fixture, such as "Day 2 morning, breakfast
    unpaid", would be a new capture, labelled as such.
  - Do not regenerate all fixtures by default.
  - Do not relabel old displayed evidence as newly witnessed.

## 8. Validation plan (proportionate)

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

## 9. Seams left open (no stubs)

- **Plan 37 (time and optional lanes):**
  - The breakfast note already supports several controls, so a skip choice is a data change.
  - Marisol's message thread is the natural home for skipped-shift and fired lanes.
  - Light and framing per moment are already parameters.
- **Plan 29 (numbers):** every amount is read from `GAME_CONSTANTS` or engine results, and the food-unpaid route exists
  for when calibration makes it reachable.
- **Plan 36 (late-game distortions):** copy is data in `life-views.mjs`.

## 10. Risks

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
