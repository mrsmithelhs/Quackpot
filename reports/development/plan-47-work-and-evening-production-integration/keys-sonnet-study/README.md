# Plan 47 keys — Sonnet drawing study (report-local, in progress)

2026-11-01. Not production. Owned files: `keys-study.mjs` (the SVG, `sonnetKeys()`), `compare.mjs` (scene comparison, written and syntax-checked, **not yet run**), `closeup.mjs` (static close-up page builder), this README. Frozen: `../keys-art-review/*`, `src/assets/apartment/desk/top.mjs`, production `workKeysTray`.

## What was drawn
Viewbox 120×76 (taller than the 120×58 tray). Silhouette first, from the owner's low-angle references: a large silver ring standing nearly upright (the recognisable shape at small size), two brass keys fanned flat in front of it with round solid heads, dark holes and toothed blades, a blue slab fob with a visible thickness edge, a short silver link to the ring, and a soft contact shadow. Palette and outline colours from `life-art.mjs`/`top.mjs`. The keys use a squashed key plane plus a thickness edge, so they are partly derived from the top-down key shape; the ring, fob and arrangement are new. The tray is dropped: keys rest directly on the desk.

## Revision 1 (owner request)
Ring made smaller (rx 10, ry 15) and drawn behind the keys; it now passes through key B's open head hole (a short front arc crosses the hole). Key A's hole is hidden under key B's head. Viewed in the app pane: at 5x the ring visibly threads the hole; at the ~96 px and ~48 px copies in the same static page it still reads as ring + brass keys + blue fob (pane capture, not the real scene).

## Revision 2 (owner request)
Ring smaller and behind everything; the blue fob is drawn last, in front of both key heads, so the head holes are hidden and the ring plausibly threads them without drawing the connection. Viewed as a static 5x pane capture and ~96/~48 px copies in that page; ring, brass keys and fob read at both small copies. Not yet judged in the real scene.

## Revision 3 (owner request)
Ring reduced to a small arc peeking above the fob's back edge, as in the owner's red-marked screenshot; the rest of the ring is hidden behind the fob and key heads. Viewed as a static 5x pane capture only; at ~96/~48 px copies the arc is a few pixels. Not yet judged in the real scene.

## Scene test on localhost:5173 (2026-11-01, owner-opened dev server, app browser pane)
Method: `scene.html`/`scene.mjs` (report-local, served by the dev server) mount the real HUD and life view with a synthetic engine and substitute the study SVG in-page (`?v=current|codex|same|proposed&box=left,top,width`). Synthetic component render, not a real play-through. Desktop magnified 3x with a CSS transform on the scene for inspection (the pane downsamples screenshots, so it is not pixel-exact).
- viewBox tightened to `4 32 100 42` so the art fills its box (the old 120x76 box left ~25% empty, making the keys look smaller than the box).
- Proposed visual box `left 33.5-34%, top 70%, width 12.5%` (~92x39 px desktop, ~46x19 px at 390 wide), vs the current 10%-wide tray (~74x42). Desktop: sits on the desk's front band with its contact shadow, clear of the duck, and its right end overlaps the mug base in front of it (natural; the gap between duck and mug is only ~64 px, so a larger prop would need to overlap). Ring arc, brass blades with teeth, and blue fob are all distinguishable at 3x.
- Narrow (390 px, native pane pixels): the keys are about 46 px wide and read as a brass/blue cluster; the ring arc and teeth are not reliably distinguishable. The existing 'Work keys' chip label sits over the keys at this size (existing production behaviour, not changed here); the keys are legible only beside it.
- Not checked: real hotspot/keyboard focus behaviour with the new box, other scene states, other viewports, hold popover placement.

## Production change if accepted (not done)
Replace `workKeysTray()` in `src/ui/life/life-art.mjs:54` with the `sonnetKeys()` markup (via `svgBox('4 32 100 42', ...)`), and change `x/y/w/h` at `src/ui/life/life-view.js:148` to about `33.5 / 70 / 12.5 / 9.5`. Placement is the only edit beyond the art; owner/root must accept first.

## Evidence so far (honest labels)
- Viewed once: 5× static close-up in the app browser pane (file URL, no Node, no server). It reads as a keyring; the thickness copy makes teeth look chunky/double-outlined and may need thinning. 
- NOT yet viewed: 96 px / 48 px display sizes, or any scene render. A second pane capture timed out, so no small-size claim is made.
- Reference images: I could see the four images the owner pasted in chat (two low-angle photos, one pen sketch; plus the earlier QP Orch set was not available to me). Geometry guidance only; nothing copied.

## Proposed placement (unverified, owner/root to accept)
Current: `x:33, y:74, w:10, h:10` in `life-view.js:148`. Proposal tested in `compare.mjs` only: visual box left 34%, top 69%, width 12.5% (~92 px desktop, ~46 px narrow), height from the SVG aspect. Risks to check in the render: overlap with the duck's tail on the left, the mug base on the right, and keys staying on the desk surface. The button, label, chip and keyboard target are unchanged in kind; the hotspot box and visual box are separate decisions.

## Needed next
A finite browser slot from root, then: run `compare.mjs` through the unchanged Plan 25 `bounded-node-run.ps1`, review zoom/desktop/narrow images, adjust the drawing, update this README with real findings. Preflight note: I ran one trivial `node` file-writer before checking processes; Chrome was already running (not mine).

## Production swap (owner accepted, 2026-11-01)
Owner replied "Accept for swap". Changed only `workKeysTray()` in `src/ui/life/life-art.mjs` (markup generated from `sonnetKeys()`, viewBox `4 32 100 42`) and the `work-keys` entry's `x/y/w/h` in `src/ui/life/life-view.js:148` (33→33.5, 74→70, 10→12.5, 10→9.5). Label, chip, hold behaviour and button element unchanged.
Verified: `node --test` on `life-art.test.mjs` and `life-decisions.test.mjs` via the unchanged Plan 25 bounded runner (17/17 pass, exit 0, ~0.6 s). On the dev server (`scene.html?v=current`, which now renders production art) the `work-keys` button is a focusable BUTTON with aria-label "Keys: leave for scheduled work", svg aria-hidden, and the new art shows in the scene (pane narrower than 1366, so box 74x32 there). Not verified: full real play-through, hold popover position, narrow keys chip overlap (still present), other viewports. No full `npm test`/smoke run, push or deploy.
