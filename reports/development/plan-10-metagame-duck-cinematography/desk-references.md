# Desk-view references and phone dimensions (2026-10-27)

Two Haiku researchers fed this note: a web search for desk top-down / side-view references, and a read-only codebase pass for the game's phone dimensions. The web researcher could not view images directly (captions, alt text and snippets only), so visual claims are unverified. Nothing was downloaded into the repo.

## Why the old desk looked wrong

The old close composition mixed cameras: an upright phone seen from the side (front elevation) next to papers, pen and keyring drawn as flat top-down shapes, on a tabletop shown as a side band. One camera height must govern every object in a view.

## Camera rules adopted

- Top-down (plan) and side (elevation) are standard orthographic views ([Wikipedia: multiview orthographic projection](https://en.wikipedia.org/wiki/Multiview_orthographic_projection)). Horizon/eye height decides which faces are visible; at eye level a rim is a straight line and ellipses open the further an object is from eye level ([Drawyager](https://drawyager.com/horizon-line-explained/), [PerspectiveGrids](https://perspectivegrids.com/guides/how-to-draw-ellipses-in-perspective/)).
- Flat-lay conventions: items parallel/perpendicular, even gaps, plain surface ([knolling.org](https://knolling.org/knolling-photography)); shadows slanting one way imply one light not directly overhead ([iPhotography](https://www.iphotography.com/blog/flat-lay-photography/)).
- Top-down: every object is a footprint (phone = rounded rectangle at about 2:1, pencil = long thin rectangle with a point, keys = ring plus flat key shapes, mug/lip-balm cap = circle). Side view: upright objects show their fronts, flat objects collapse to slivers, the tabletop is a thin band with a front edge (partly inferred, not verified on opened pages).
- A 3/4 high view is the best single camera for a mixed scene but is the least-sourced; not drawn here.

## Other sources opened (examples)

- Wikimedia Commons CC0 desk photo (books, pencils, laptop, phone): https://commons.wikimedia.org/wiki/File:Books,_pencils,_laptop,_and_iphone_on_a_desk_(Unsplash).jpg
- iStock illustration pages (paid; captions only): desk top from above https://www.istockphoto.com/illustrations/desk-top-from-above, desk side view https://www.istockphoto.com/illustrations/desk-side-view
- OpenGameArt 2D Furniture Pack (CC-BY 4.0): https://opengameart.org/content/2d-furniture-pack
- DWG Lab, desk-lamp plan blocks (circular base, joints, angled arms): https://www.dwglab.com/blocks/lightings/table-lamps/swing-arm-table-lamps/plan-view-of-desk-lamps/
- Apple iPhone 16 specs (147.6 × 71.6 mm, about 2.06:1): https://www.apple.com/iphone-16/specs/

Could not open: Dreamstime, Vecteezy, Freepik, Public Domain Vectors (403), plus two unrelated or dead pages.

## Distinct object collections (so desks don't look like copies)

Used: **home-office desk** (side view: lamp, duck, mug, phone on stand, books, succulent) and **student/craft desk** (top-down: notepad, sticky note, pencil, keyring with keys, lip balm, coins, lamp seen from above, phone lying flat). Further sets suggested by the researcher: bedside table (phone on charger, lip balm, glasses, paperback, alarm clock, water glass), kitchen table (mug, keys in dish, mail, fruit bowl), entryway tray (keys, wallet, coins, sunglasses).

## The game's phone (verified in the repo by the codebase researcher)

- The game is not rendered inside a phone; the phone exists in fiction as the persistent static portrait card on the apartment desk (`src/ui/desk-view.js:19-30`, `src/ui/desk-phone.css:17-38`) and as a temporary 9:16 overlay (`src/ui/stage-transition.js:53-54`).
- Desk phone: `aspect-ratio: 9/17` (about 0.53), width `clamp(9.5rem, 25vw, 12.5rem)` (200 × 378 px at 1280 wide), padding 0.55rem, 2px `#707784` border, radius 1.65rem, dark gradient bezel; screen radius 1.2rem, navy radial gradient; regions top to bottom: status row "9:41" and three dots, centred content ("QUACKPOT" in amber, "Welcome Festival", "10 FREE pulls waiting!", "Limited-time invitation"), home bar.
- The old preview phone was 168 × 205 px (ratio 0.82), about 1.5× too wide, tilted 4° although the report records "upright", with a cream blank screen. Docs name no physical size for the phone or the duck (`docs/founding/design.md:156-164`, `docs/repo-structure.md:30`).
- Production still uses a placeholder duck, not the Plan 10 drawings (`src/main.js:10`).

## Assumptions in the new desk scenes (not repo facts)

One scale for every object, 2.2 scene units per millimetre. Assumed real sizes: duck about 64 mm tall and 76 mm long, phone 72 × 136 mm (9:17), mug 68 mm wide, notepad A6, pencil 175 mm. The game's own desk UI draws the duck art at about 110 px against a 378 px phone (much larger than the physical ratio used here); the scenes use physical proportions, not the UI proportions.
