# Ren in the player's apartment: how the kit's camera handles it

Date: 2026-10-31 (system clock). All drawings are report-local concept compositions (PROPOSED, not game art). Files: `concepts/apartment-scenes/` (script `compose-ren-apartment.mjs`, output `scenes/*.svg`, preview `scenes/index.png`).

## The question

The owner asked for a few composed drawings of Ren in the apartment (in a chair, on the couch, standing elsewhere) and whether the kit's camera views make that easy without drawing more of Ren's body.

## Answer, with what was actually checked

**Mostly yes, for front-facing busts, because of how the kit works.** `src/assets/apartment/rooms/` draws every room as a fixed one-point-perspective front view. Each prop is a millimetre-scale elevation placed by `put()` at a depth `z` and a height `Y`, and items are painted far to near. So Ren can be inserted as one more item at a real depth, and furniture that is nearer the camera hides Ren's lower body.

- **Seated on a sofa:** Ren sits at the same depth as the sofa. The sofa's arms, seat cushions and base are redrawn in front of Ren (same colours, taken from the kit's own `sofa()` geometry), which hides the chest cut. The seat cushions top out 440 mm above the floor, about where a seated person's torso should emerge.
- **Behind a counter:** Ren is placed behind the kitchen bar (900 mm top) and the bar hides the cut. The room camera looks slightly down (`camH` 1132 mm in the kitchen), so Ren must be placed a little behind the bar front, with the cut low enough that its projected line falls below the bar top. I computed that and checked it in the render.
- **Medium framing:** the kit's `medium` crop is centred on the duck anchor, not on Ren, so for close views the report script overrides the SVG `viewBox`.

**Limits that still need new drawing or a decision:**
- Ren is front-facing only. Profile or three-quarter poses, turning, walking or reaching need new drawings.
- The kit has **no single armchair or dining chair**. The "chair" scene uses the kit's `sofa(900)`, a narrower sofa. A real armchair prop would be new art.
- Showing Ren's whole body standing in open floor needs a torso and legs; only occluded poses are covered.
- Ren's head is stylised large (about 240 mm wide) against the furniture, so Ren close to the camera (the kitchen bar) looks big next to Ren far away (the couch). That is correct perspective, but the close shot reads more like a portrait than a room scene.
- Found and fixed: the kitchen pendant lamp is a foreground item drawn after everything, so a centred Ren had their face hidden by the lamp. Ren is now off-centre.
- Technical lesson for any future port: CSS selectors that need ancestors do not match inside `<use>` instances, so Ren's colour classes must be unscoped. The first render had black faces for that reason.

## What was produced

| Scene file | What it shows |
|---|---|
| `ren-couch-wide.svg` | Ren on the couch (cardigan), duck on the coffee table |
| `ren-couch-medium.svg` | Close crop of the same couch (pajama top) |
| `ren-loveseat-wide.svg` | Ren in a narrow sofa on the left (coveralls), couch empty |
| `ren-kitchen-bar-wide.svg` | Ren behind the kitchen bar (camp shirt), duck on the bar |
| `ren-kitchen-bar-medium.svg` | Close crop behind the bar (paint overalls) |

I viewed all five rendered together on `scenes/index.png` at desktop width. I did not check them at avatar scale, with other complexions, or in the game's actual scene layout. The script ran through the Plan 25 bounded launcher (about 0.6 s, under 10 MB sampled memory). It reads the kit read-only and changes the kit's in-memory scene specs only while it runs.

## Owner corrections folded in this round (2026-10-31)

- The neck sprout tattoo is removed from all drawings. It now appears only on a bare upper arm (olive coveralls, camp shirt) and not with long sleeves.
- The pencil is redrawn as a recognisable stubby pencil resting on top of Ren's right ear, tip forward. It is omitted from the hood-up slicker because the hood covers the ear.
- Slicker v3 puts the hood up over the head, partly covering the hair, with forehead curls peeking out.
- Bedhead: reference search done (`research/bedhead-reference-notes.md`) and v3 drawn from its checklist.
- The Gemini prompt now says no neck tattoo and describes the new pencil. The older `ren-ref-*.png` references still show the old neck tattoo and pencil and should not be attached to future Gemini runs; use `concepts/svg-round-01/_template/ren-base-template.png`.

## Owner decisions and the floor game-night scene (2026-10-31, round 4)

- **Rule (S49):** use close framing; the bottom of Ren's available body must sit at the bottom of the visible scene unless a scene object hides the lower body. A cut-off body in an uncut scene is a non-starter. The wide couch, loveseat and bar scenes hide the lower body behind furniture, so they satisfy the rule, but close framing is the chosen look.
- **Seats (S50):** the couch in the living room, or behind a desk (sitting on the floor). No armchair prop and no narrow-sofa reuse. Poses stay front-facing for the first build (S51).
- **New scene `ren-floor-game-night.svg` (S52):** Example 1 from file 05 after the couch is sold: the kit's `couch: removed` state, Ren (cardigan) seated on the floor behind the coffee table, a flat board game with pawns on the table top (added through the spec's `onTable` list so the table slab does not hide it), no duck on the table. The table and board hide the chest cut. I read "desk" as the living-room coffee table, which the owner may correct.
- **Script changes:** `compose-ren-apartment.mjs` now takes per-scene `furn`, `duck` and `onTable` and restores them after each scene; the loveseat scene uses the open puffer vest and the close bar scene the tool apron. Run through the Plan 25 bounded launcher in a child shell: exit 0, about 0.6 s, under 5 MB sampled memory. The scene SVGs contain the kit's own gradients and filters (30 hits per scene, same as the older scenes); none come from Ren's drawings.
- **Viewed:** the floor scene preview at 960 by 540 and the review page `scenes/index-review.html`. Not checked: avatar scale, other complexions.

