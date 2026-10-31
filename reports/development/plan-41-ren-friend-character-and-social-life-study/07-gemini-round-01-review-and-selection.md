# Gemini round 01: review and candidate selection

Date: 2026-10-31 (system clock). Inputs: `concepts/gemini-round-01/` (manifest plus 11 PNGs from a separate Gemini Flash thread, generated from the prompt in `prompts/gemini-outfit-and-hair-prompt.md`). **Selections below are the lead's picks for the SVG drawing pass, as delegated by the owner. They are not owner approval of any final outfit or hair, and no costume or hair is adopted into the game.**

## 1. Provenance, as far as it can be established

- The manifest states the tool as `generate_image` called through an `image-generator` subagent and the model as `not exposed`. It adds the parenthetical "Google Imagen / Gemini backend exposed through internal tool harness"; that is the thread's own guess, **not evidence**, and is not repeated as a fact here.
- Images are 1024x1024 PNG 2x2 grids; I confirmed the files exist (10 outfit images, 1 hair image) and viewed all 11. I cannot verify which references were actually attached or that the prompts in the manifest are the exact text sent.
- Generation stopped at `hair-02-work-messy` with an HTTP 429 `RESOURCE_EXHAUSTED` (manifest times: 2026-10-31T15:58:19Z, reset 2026-10-31T20:44:09Z). `hair-02`, `hair-03` and `hair-04` do not exist. No placeholders were made.
- The manifest's own drift notes ("exceptional alignment", "perfect stylistic consistency") are the generating thread's self-assessment. **My viewing disagrees in part**, below.

## 2. What I saw versus the base art

Across all 44 cells the images are clean, readable, text-free and consistent with each other, and clothing ideas translate well. Compared with the base reference they drifted in ways that matter only for *how* they are used:

| Aspect | Base reference (`ren-ref-*.png`) | Gemini sheets |
|---|---|---|
| Outline | thick (about 3 px at reference scale) on face and body | thinner, especially on faces |
| Hair | compact cloud of near-black brown curls | larger, fuller, and browner (hair-01 is bluer/near navy-black) |
| Face | round head, big dot eyes, short curved nose | slightly more oval and naturalistic; nose is a larger "J" |
| Skin | mid-warm golden brown | slightly more ochre/orange, close |
| Accessories | hoop on the viewer's left ear, stud on the right; pencil on the viewer's right | hoop and stud swapped sides in most cells; pencil on the viewer's left; a second small stud appears on some cells |
| Tattoo | neck sprout on the viewer's right | on the right in outfit sheets, on the left in `hair-01` |
| Text/logos | none | none seen |

**Consequence:** treat the sheets as clothing and hair-shape inspiration only. The SVG drawing tasks therefore start from the template (the base art) and say "template wins on style."

## 3. Outfit candidates chosen for the Haiku drawing pass (6)

Chosen to cover distinct situations, silhouettes and layering problems, and to avoid six near-duplicates:

| ID | Sheet and cell | Why chosen | Drawing challenge |
|---|---|---|---|
| `coveralls-olive` | outfit-01 top-right | Maker's work look; different silhouette from the base overalls | short sleeves, collar, bare arms |
| `cardigan-terracotta` | outfit-02 top-right | Everyday at-home look; warm, easy to read | open front over tee, buttons |
| `slicker-yellow` | outfit-04 top-left | Rain/weather; the strongest silhouette in the set | hood bunched behind neck, toggles |
| `pajama-navy` | outfit-03 top-right | Night at home; pairs with a bonnet/towel hair state | piped collar and placket |
| `paint-overalls` | outfit-08 top-left | Messy-work state; reuses the base outfit with splatters; pairs with paint-in-hair | flat splatter shapes |
| `camp-shirt-geometric` | outfit-05 top-left | Social/picnic; the only patterned shirt | clipped geometric pattern |

**Reserves, not drawn this pass:** terry-cloth bathrobe (outfit-03 bottom-right; pairs with towel hair), mended terracotta sweater (outfit-10 bottom-right; strongest character detail), olive pullover hoodie (outfit-02 top-left), sweater vest over collared shirt (outfit-05 bottom-left), quilted terracotta vest over olive tee (outfit-09 top-right), denim chore coat (outfit-01 top-left).

**Passed on, with reasons:** knit turtleneck (hides the tattoo), tank top (reads as a different body type at this crop and shows collarbones), jumpsuit and tie options (dressier, lower priority until a dressy occasion is selected), patch-covered chore overshirt (patches would need brand-free shape design), bowling shirt (two-tone layout needs more care than a first pass), and the layered vest-and-flannel look (layer-heavy).

## 4. Hair candidates (1 sheet, 4 cells)

All four `hair-01-messy` cells are usable states and were all assigned for SVG drawing: `hair-bedhead`, `hair-postnap-puff`, `hair-windblown-damp`, `hair-sweaty-pushed-back`. The paint/sawdust/plaster, towel/shower and covering ideas (bonnet, bandana, cap, beanie) have **no generated images yet** because of the quota stop. Open options for them: wait for the reset and rerun the remaining three prompts in the Gemini thread (the prompt file's hair sections still apply; add "images 02 to 04 only"), or skip Gemini and have Haiku draw those coverings directly from the text descriptions. This is a choice for the owner.

## 5. Open owner choices from this review

1. Which of the six outfits (and which reserves) are worth keeping once drawn.
2. Whether to wait for quota and rerun hair images 02 to 04, or draw them directly.
3. Whether the Gemini drift (fuller hair, thinner lines) suggests changing how future generation is prompted, for example by pasting the template's SVG-derived PNG as the only reference.

## 6. SVG drawing pass results (ten Haiku helpers, one per task)

Setup: each helper started from `concepts/svg-round-01/_template/ren-base-template.svg` (a standalone copy of the base art), followed `concepts/svg-round-01/BRIEF-COMMON.md`, wrote only to its own folder, and rendered with headless Edge. They ran concurrently into disjoint folders; the lead was the only other writer and ran no concurrent git operations. I viewed all ten SVGs together on `concepts/svg-round-01/contact-sheet.png` (about 290 px per figure; rendered from the files, not from the helpers' previews) and scanned the SVG sources for images, text, scripts, filters, gradients and external references (none found). I did not check the SVGs at avatar scale, with other complexions, or against the apartment kit. Helper claims such as "matches the intended result" are self-reports; my own reading follows.

| Drawing | My read of the contact sheet | Verdict |
|---|---|---|
| `coveralls-olive` | Reads clearly as a short-sleeve work shirt/coveralls with a collar, pocket and bare arms. | Good as is |
| `cardigan-terracotta` | Reads as a cardigan over a cream tee. The three buttons sit on one panel and look like holes on the orange at small size; ribbing is a thin strip. | Usable; minor fix (buttons) |
| `slicker-yellow` | The silhouette is strong, but the "hood down" reads as a yellow cape or dome; the toggles read well. The helper itself said it reads "as a broad dome rather than a distinctly bunched hood". | Needs a revision pass |
| `pajama-navy` | Reads as piped pajama top with a V neckline; sleeves look like shoulder seams only. | Good enough |
| `paint-overalls` | Base outfit with flat splatters; clean and readable, a lighter splatter than the Gemini cell. | Good as is |
| `camp-shirt-geometric` | The most distinctive: bold triangle/diamond pattern, collar, cuffs, arms. | Good as is |
| `hair-bedhead` | The flattened left cap is convincing, but the tall cluster on the right reads as a side ponytail or bun rather than wild bedhead; the helper flagged the "bun" reading too. | Needs a revision pass |
| `hair-postnap-puff` | Bigger, lopsided cloud with forehead bumps; the dent is subtle but it reads as a puff. | Good enough |
| `hair-windblown-damp` | Swept clumps, loose strands and highlights; the most expressive of the four. | Good as is |
| `hair-sweaty-pushed-back` | Tight swept-back curls with wisps; reads as "hair pushed up". | Good as is |

Housekeeping: the lead replaced the stale "Ren base template" `aria-label` in the SVGs the helpers had not renamed. Each folder also holds the helper's own `notes.md` and last preview PNG.

**Suggested next step (not done):** one revision round for `slicker-yellow` (a visible hood shape with folds) and `hair-bedhead` (flatter, messier shapes so it does not read as a ponytail), plus the button fix on the cardigan. The remaining hair ideas (paint/dust, towels, bonnet/bandana/cap/beanie) are still ungenerated and undrawn.

## 7. Revision pass (three Haiku helpers; v1 files kept, v2 files added)

Slicker, bedhead and cardigan were each revised by a fresh Haiku helper against specific problems named in section 6. Each wrote `*-v2.svg`, a preview PNG and `notes-v2.md` beside the v1 files (v1 untouched). I compared v1 and v2 on `concepts/svg-round-01/compare-v1-v2.png` (rendered from the SVG files at roughly 400 px per figure), scanned the v2 sources for forbidden constructs (none) and set the stale `aria-label` on each. Not checked: avatar scale, other complexions, the apartment kit.

| Drawing | v2 versus v1, my read | Verdict |
|---|---|---|
| `slicker-yellow-v2` | Clear improvement. A dark-lined hood now sits behind the head, drawstrings hang down the chest, and the body has sloped shoulders with seams. It reads as a hooded slicker. The helper said it "partly" read as a hood; I think it reads more clearly than that at this size, but the outer hood arc still hugs the shoulders and could read as a cowl when small. | Good enough to keep |
| `cardigan-terracotta-v2` | Buttons now have rims and thread holes, the front bands are wider, and ribbed sleeve hems appear. At this size the buttons are small and the two thread-hole dots can look like tiny faces (the helper noted the same). The buttonhole slits on the right band are barely visible. | Improved; optional small tweak (larger buttons, one center hole style) |
| `hair-bedhead-v2` | It no longer reads as a ponytail and the crown is lower. But the tufts are sharp triangles, which reads as spikes or cat-ear shapes rather than curly sleep-flattened hair, and the right-side clumps still hint at a side puff. The helper said the same about the puff. | Partial; a further pass should use rounded curl tufts instead of triangles |

Candidates summary after the revision pass: good as drawn: olive coveralls, paint overalls, camp shirt, navy pajama top, windblown damp hair, sweaty pushed-back hair, post-nap puff; improved and usable: slicker v2, cardigan v2; still weak: bedhead v2.
