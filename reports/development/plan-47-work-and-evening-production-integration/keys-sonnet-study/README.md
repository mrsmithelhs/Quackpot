# Plan 47 keys — Sonnet drawing study (report-local, in progress)

2026-11-01. Not production. Owned files: `keys-study.mjs` (the SVG, `sonnetKeys()`), `compare.mjs` (scene comparison, written and syntax-checked, **not yet run**), `closeup.mjs` (static close-up page builder), this README. Frozen: `../keys-art-review/*`, `src/assets/apartment/desk/top.mjs`, production `workKeysTray`.

## What was drawn
Viewbox 120×76 (taller than the 120×58 tray). Silhouette first, from the owner's low-angle references: a large silver ring standing nearly upright (the recognisable shape at small size), two brass keys fanned flat in front of it with round solid heads, dark holes and toothed blades, a blue slab fob with a visible thickness edge, a short silver link to the ring, and a soft contact shadow. Palette and outline colours from `life-art.mjs`/`top.mjs`. The keys use a squashed key plane plus a thickness edge, so they are partly derived from the top-down key shape; the ring, fob and arrangement are new. The tray is dropped: keys rest directly on the desk.

## Revision 1 (owner request)
Ring made smaller (rx 10, ry 15) and drawn behind the keys; it now passes through key B's open head hole (a short front arc crosses the hole). Key A's hole is hidden under key B's head. Viewed in the app pane: at 5x the ring visibly threads the hole; at the ~96 px and ~48 px copies in the same static page it still reads as ring + brass keys + blue fob (pane capture, not the real scene).

## Evidence so far (honest labels)
- Viewed once: 5× static close-up in the app browser pane (file URL, no Node, no server). It reads as a keyring; the thickness copy makes teeth look chunky/double-outlined and may need thinning. 
- NOT yet viewed: 96 px / 48 px display sizes, or any scene render. A second pane capture timed out, so no small-size claim is made.
- Reference images: I could see the four images the owner pasted in chat (two low-angle photos, one pen sketch; plus the earlier QP Orch set was not available to me). Geometry guidance only; nothing copied.

## Proposed placement (unverified, owner/root to accept)
Current: `x:33, y:74, w:10, h:10` in `life-view.js:148`. Proposal tested in `compare.mjs` only: visual box left 34%, top 69%, width 12.5% (~92 px desktop, ~46 px narrow), height from the SVG aspect. Risks to check in the render: overlap with the duck's tail on the left, the mug base on the right, and keys staying on the desk surface. The button, label, chip and keyboard target are unchanged in kind; the hotspot box and visual box are separate decisions.

## Needed next
A finite browser slot from root, then: run `compare.mjs` through the unchanged Plan 25 `bounded-node-run.ps1`, review zoom/desktop/narrow images, adjust the drawing, update this README with real findings. Preflight note: I ran one trivial `node` file-writer before checking processes; Chrome was already running (not mine).
