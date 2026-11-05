# Plan 62: welcome-screen proposals (Sonnet)

**What I saw.** I viewed one image, the Plan 10 contact sheet. It shows five views of the physical rubber duck: three-quarter front, side, back, a turned-away three-quarter view, and a low or top-ish angle. The style is a warm yellow body with a thick, slightly wobbly dark-brown outline, a saturated orange beak, a small glossy highlight and a flat cream ground (about #F5F2EE). I did not see the Plan 24 apartment gallery or the current apartment art, so my apartment motifs below come from your text description (kitchen, living room, bedroom, desk; layered SVG). Please treat the apartment-specific details as limited context.

The duck's outline weight and cream ground are the strongest style anchors I can vouch for. I suggest all three compositions reuse them.

---

## Composition A: "The Doorway" (apartment first)

**Hierarchy.**
1. The title "Quackpot" sits as a modest wordmark above or beside the scene.
2. A wide, slightly dusk-lit apartment cross-section is the hero. It shows the living room and desk with the kitchen glimpsed beyond.
3. The physical duck sits on a shelf or desk edge in the foreground, still.
4. Start and Continue sit in a quiet panel beneath the scene.
5. Settings, Credits and Usage download sit as small tertiary links.

**Motifs coexisting.** The digital game is only a lit phone or monitor on the desk. Its screen glows with a small, ambiguous collectible silhouette, so it reads as one object among many: a mug, a plant, a window. The gacha is part of the room and not the headline.

**Desktop and narrow.** Desktop shows the wide room with the controls panel at lower left. On narrow screens the crop pulls in to the desk-and-duck vignette. The panel stacks below, and the room is a vertically cropped SVG layer set.

**Transition to naming.** The camera eases (or cuts, in the still version) toward the desk. The scene dims slightly and the duck is centered. The name field appears beneath it, prefilled with the default.

**Motion and still.**
- *Motion:* slow parallax between SVG layers, window light drifting, a curtain or steam wisp. The duck does not move.
- *Still:* the same composition with all layers at rest.

**Music character.** A gentle, unhurried passage in a major or mixolydian feel, with sparse plucked or mallet voices and a lot of space. It should sound like a late afternoon at home.

**Tradeoff or failure mode.** It may read as a quiet cozy sim with little hook. The gacha side could vanish, and the screen could feel like a different game from the one that follows.

---

## Composition B: "The Shelf" (object-collection grid)

**Hierarchy.**
1. A tidy grid or shelf of framed "slots" fills the screen. One slot holds the physical duck. Others hold small apartment objects: a key, a mug, a plant, a bus pass.
2. The Quackpot wordmark sits on a shelf label.
3. Start is a prominent button on the shelf's front edge.
4. Continue is a secondary button beside it.

**Motifs coexisting.** The shelf layout borrows the vocabulary of a collection screen, with slots, rarity-like borders and a "set" feel. It is filled with ordinary life objects, and the physical duck is simply the first item. Digital ducks appear as a few faint, empty or silhouetted slots at the shelf's end. They are hinted, never promised.

**Desktop and narrow.** Desktop shows a 5×2 or 4×3 shelf. Narrow screens reflow to 2 or 3 columns and scroll vertically. Start stays pinned and visible.

**Transition to naming.** The duck's slot expands and the others fall away to the edges. The enlarged slot becomes the naming card.

**Motion and still.**
- *Motion:* slots settle in a short, staggered fade or lift on load. Objects have soft hover highlights. The physical duck is static.
- *Still:* the fully assembled shelf.

**Music character.** Bright, rhythmic and light, with a small tick or pluck pattern, like a tidy collection menu. It should be upbeat without sounding like a casino.

**Tradeoff or failure mode.** This is the closest of the three to gacha UI. It could pre-announce "this is a collecting game" and leans toward an advertisement for the fictional gacha. It also needs careful object curation so the shelf reads as a life and not as loot.

---

## Composition C: "The Cutout Poster" (graphic, duck-forward)

**Hierarchy.**
1. A large, flat, poster-like composition on the cream ground. The physical duck is huge and cropped, using the 3/4 front view and its bold outline.
2. A big wordmark overlaps or tucks behind the duck.
3. Around the duck sit flat cut-paper shapes: a window, a door, a lamp, a pan and a phone, all in the same thick outline.
4. Controls run along the bottom as a simple horizontal bar.

**Motifs coexisting.** Apartment rooms are abstracted into a few iconic cut shapes, so they read as the "world" without reproducing the full SVG kit. Gacha energy appears as a few starbursts or sparkle shapes, but they are decorative and placed near the lamp or phone, not around the duck.

**Desktop and narrow.** Desktop is a landscape poster with the duck on the right and the wordmark and controls on the left. Narrow is a vertical poster: duck on top, wordmark overlapping, controls stacked below.

**Transition to naming.** The cutout shapes slide off or fade, leaving the duck. The poster's lower band becomes the name field.

**Motion and still.**
- *Motion:* cutouts have a small stepped "paper" drift, a couple of frames at most. The duck stays still.
- *Still:* the poster as composed.

**Music character.** Playful and punchy, with a clear melody, a bouncy bass and light percussion. It should feel like a title screen from a quirky indie game.

**Tradeoff or failure mode.** It has the strongest identity and the best thumbnail. But it is the furthest from the accepted layered apartment kit. It risks a tonal mismatch when the real apartment appears, and it needs new composed art that the kit may not cover.

---

## Real HTML controls in all three

These stay as real HTML and are never baked into artwork:
- Start, Continue, Settings, Credits and Download usage file.
- The name text field and its confirm button.
- The autosave checkbox or toggle and its label.
- The mute control.
- All wordmark text that carries meaning should have an accessible text equivalent. The wordmark itself can be art if it also has an accessible heading.
- Post-Receipt: Start another run, Download usage file, View Receipt.

Artwork carries only decoration: the room, objects, duck and shapes.

## Autosave exposure

Put the existing autosave choice in Settings as the canonical location. Also show it as a small labeled checkbox in the welcome footer, near Settings. Both should reflect the same stored state and not change the default. The label should describe the choice, e.g. "Autosave this run," with the current state shown. Nothing on the welcome screen should say that the default changed or that it is recommended. If the owner wants only one location, Settings alone is the safest option.

## Recommendation

I recommend **Composition A, "The Doorway,"** with one borrowing from C: the thick-outline, cream-ground look for the foreground duck and wordmark. A uses the accepted apartment kit directly and has the lowest art risk. It fits "the whole experience" best because the room is the hero and the phone is just one object in it. It also leaves the most room to keep the later arc hidden.

## Two questions for the owner

1. Should the welcome screen first signal "a home you live in" or "a game you play"? A favors the first, B and C the second. Your answer decides how much digital-collectible imagery, if any, appears before the player starts.
2. Is new composed art acceptable for the welcome screen, or must it be assembled only from existing apartment-kit layers? A fits the second constraint, and C needs the first.
