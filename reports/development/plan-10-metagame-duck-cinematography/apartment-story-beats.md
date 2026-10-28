# Apartment areas and metagame beats (Haiku codebase pass, 2026-10-27)

A read-only Haiku explorer searched `docs/`, `reports/` and `src/` for metagame story beats, dialogue and apartment locations. Its findings (file:line citations are the explorer's; spot-check before relying on them):

## What exists
- **No apartment layout, room list, time-of-day lighting or written metagame dialogue** is specified. Production draws only a desk card with the phone and a placeholder duck (`src/ui/desk-view.js`, `src/ui/desk-phone.css`). Room art exists only in this report preview.
- Tone: "cramped room" that the duck makes "feel a little more like home" (`desk-view.js:36-37`); "absurd but real" satire (`docs/founding/design.md:123`); "one fixed diegetic stage" (`design.md:156`).
- **Visible emptying:** the player can pawn the living-room couch ("Your apartment is visibly emptier", `src/ui/modals.js:107`) and sell the only TV (`modals.js:111`); "The apartment empties as items are sold" (`design.md:156`). Not implemented visually yet. A late pawn offer for the physical duck leads to an empty-desk scene (`design.md:133`), also not implemented.
- **Beats with an apartment setting (explorer's reading):** Day 1 morning invitation at the desk (`desk-view.js:21-34`); Day 2 rent, "Your landlord arrives to collect this month's rent" (`src/main.js:402-406`); "Rent Paid, But Wallet is Empty!" decisions with skip lunch, extra shift with sleep loss, sell couch/TV, credit card (`modals.js:52-115`, `src/core/game-engine.mjs:803-820`); end-of-run Receipt as a printed slip (`design.md:156`); 3–5 skippable duck scenes at undecided moments (`design.md:133`).
- **Rules:** the duck is inanimate, never animated or expressive; pawning it does not delete a gacha collectible (`AGENTS.md`, `design.md:127-131`); fictional names only; scenes skippable, with static/reduced-motion equivalents.
- A name collision: "Curio Shelf" is the digital Duck-Dex UI, not furniture (`src/ui/duck-dex-view.mjs:145`). The toy shelf in the bedroom view is a separate piece of apartment furniture.

## How the preview areas map to those beats (inference, not canon)
| Area | Natural beats |
|---|---|
| Desk (side / top-down) | Day 1 morning phone invitation; later the empty-desk scene after a pawn |
| Living room (couch, TV, floor lamp, art) | Selling the couch and TV (furnished vs "sold" state), evening bills, the landlord's visit |
| Kitchen (fridge, stove, breakfast bar) | Skip-lunch and daily food-bill beats |
| Bedroom + toy shelf | Sleep loss / night-shift beats; the duck among other toys |

## Gaps needing an owner decision
Room list and layout (does a kitchen or bedroom exist at all?); where the TV sits; per-item "visibly emptier" states and sale order; time-of-day lighting per beat; which 3–5 beats get duck scenes; pawn trigger, amount, buyer and reclaim rule; all dialogue lines and speakers; where the duck is during the town scene; whether the companion's setup accessories (pirate hat, neon visor, chef hat) appear in these views.
