# Plan 38 implementation map (lead, 2026-10-30)

Readiness: `plan-status.js check plan-38` → RUNNABLE (bounded launcher, exit 0, 0.55 s).

## Flow in production (settled by D1–D22; this map only places it in code)

Life steps are **apartment** surfaces (phone closed). Phone steps (gacha, races, Receipt) are unchanged and are opened
from the existing desk view ("Open Quackpot").

| Step string | Surface | Leaves to |
|---|---|---|
| `d1_morning_breakfast` (new) | kitchen, plate confirm | if the 10-pull is not committed: `d1_morning_gacha` (desk → phone); if it is (old save that reached gacha with `d1_food` unsettled): `advanceDay(1,'day 1 midday')` → `d1_midday_race` |
| `d2_morning_breakfast` (new) | kitchen, plate confirm | `d2_afternoon_rent` |
| `d2_afternoon_rent`, `_zerocash`, `_escalation`, `_rent_resolved` (existing) | fridge notice / offer places / day bar | "Go to work": zero-cash `continue` only while open, `creditWage`, `advanceDay(3)` → `d3_morning_breakfast` |
| `d3_morning_breakfast` (new) | kitchen, plate confirm | `d3_midday_race` (desk → phone) |

The three `billExpense('food', 5)` calls leave `main.js` (`:342`, `:651`, `:661`) and run only on the plate confirm.
Gacha Proceed: if `d1_food` is unsettled, go to `d1_morning_breakfast` instead of charging.

## Ownership (disjoint files; one writer each; nobody but the lead runs node, git or the browser)

| Owner | Files (create/edit only these) |
|---|---|
| Lead | `src/ui/life/life-routing.mjs`, `src/ui/life/life-routing.test.mjs`, `src/main.js`, `src/ui/modals.js`, `src/core/game-engine.mjs` (repeated-Uninstall fix only), `src/core/game-engine.test.mjs` (that regression only), `package.json` test list, `docs/repo-structure.md`, this report folder |
| Worker A (Haiku) | `src/assets/apartment/index.mjs`, `src/assets/apartment/rooms/scene.mjs`, `src/assets/apartment/desk/side.mjs`, `src/assets/apartment/desk/top.mjs` (only if the duck lives there), `src/assets/apartment/apartment.test.mjs`, `src/assets/apartment/README.md` |
| Worker B (Haiku) | `src/ui/life/life-preview.mjs`, `src/ui/life/life-copy.mjs`, `src/ui/life/life-decisions.mjs`, `src/ui/life/life-decisions.test.mjs` |
| Worker C (Haiku) | `src/ui/life/life-art.mjs`, `src/ui/life/life-art.test.mjs` |
| Worker D (Sonnet) | `src/ui/life/life-view.js`, `src/ui/life/life.css` |

## Pinned interfaces

`life-routing.mjs` (lead):
- `LIFE_STEPS`, `isLifeStep(step)`, `BREAKFAST_STEP_BY_DAY = {1:'d1_morning_breakfast',2:…,3:…}`
- `rentState(engine) → {paid, owing, short, cash}`; `breakfastState(engine) → {day, billId, settled, owing}`
- `optionalOpen(engine)`: `activeModal === 'zerocash'` and cash 0
- `OFFER_PLACE = {skip_lunch:'kitchen-breakfast', extra_shift:'desk-phone', sell_couch:'living', sell_tv:'living', credit_card:'desk-card'}`
- `PLACES = ['kitchen-notice','kitchen-breakfast','desk-phone','desk-card','living']`
- `placeFor(engine, requested)`: offer place while a bill is owed; plate while breakfast unsettled; notice while rent unsettled; else `requested` if allowed for the step, else the step's default place
- `availablePlaces(engine)`: places the day bar / room may offer on this step
- `afterBreakfast(engine) → {step, advance: null | [day, label], phone: boolean}`
- `normalizeLoadedStep(engine) → {step, recovered: boolean}`: crash between charge and step update moves forward with no charge; unknown step → `recovered` with no mutation

`life-preview.mjs` (B): `money`, `effectText`, `effectFromEvents`, `furnishingsFrom`, `previewLadder(engine)`,
`previewZeroCash(engine, choice)`, `outcomeView(engine, {choice, before})` — ported from `comparison/` with one memo per
log length (measurement decides whether a cheaper helper is needed).

`life-decisions.mjs` (B): `payRentDecision`, `shortfallDecision`, `ladderDecision`, `optionalShiftDecision`,
`optionalCouchDecision`, `breakfastDecision`; each returns `{heading, lines[], confirm, back, decline?, preview?}`
with amounts from the engine. `life-copy.mjs`: `noticeLetter`, `marisolThread`, `cardApp`, `worldLabels`, `chips`, `results`.

`life-art.mjs` (C): `tapedNotice`, `saleTag`, `emptyPlate`, `bakeryBag`, `phoneGlow`, `wallShelf`, `paperback`,
`duckPoseHtml(pose, idPrefix)`, `headingToward`, `leanToward`, `MIN_TILT`.

`life-view.js` (D): `renderLifeView(container, engine, ui, callbacks) → {destroy, focusPlace}` where `ui` is a
controller-owned object `{place, held, decideOpen}` that survives `renderApp`, and `callbacks` are
`{onPayRent, onTryPay, onLadderAccept, onLadderDecline, onOptional(choice), onBreakfast, onGoToWork, onContinue}`.
The view never calls engine mutators.
