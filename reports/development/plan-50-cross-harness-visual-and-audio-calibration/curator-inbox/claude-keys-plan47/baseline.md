# Plan 47 keys — historical baseline (curator record, HELD-BACK answer material)

Curator: the Sonnet 5.5 chat that did the Plan 47 keys drawing handoff. Date of all events: 2026-11-01 (commit timestamps below, local -05:00). No new drawing or browser work was done for this package; images are copies of screenshots captured during the work. This is a record, not a review; it does not argue that the owner was right. Owner wording is verbatim only where marked. "Mn" = nth user message in this chat (M0 = the pasted handoff brief).

## Shared context available BEFORE any feedback (task given to the drawing chat)
Production keys (`workKeysTray`, `src/ui/life/life-art.mjs:54`, placed by the `work-keys` entry in `src/ui/life/life-view.js`) were a brass-and-silver outline on a brown shallow tray, about 74x42 CSS px desktop and 37x21 narrow. Brief M0 (a relayed handoff, NOT owner verbatim) said the owner found production keys "visually strange" and that a prior Codex candidate (commit 4006cf5, `reports/development/plan-47-work-and-evening-production-integration/keys-art-review/`) improved identity but "shallow compressed silhouettes are tiny and hard to recognize". Ask: a recognisable keyring resting on the desk with solid key heads, holes, toothed blades, a credible ring connection, overlapping brass keys, a blue fob and a subtle contact shadow, matching apartment outlines/palette; a modest scale/aspect/position change could be proposed; do not just enlarge the hotspot. Established identity: two brass keys, silver ring, blue rectangular fob (`src/assets/apartment/desk/top.mjs:21,36`).

Missing context: the owner's original low-angle photos and perspective drawing in "QP Orch" were NOT available to the drawing chat. In M1 the owner pasted three images found by searching (two commercial stock photos of keys on a desk, Alamy- and Shutterstock-watermarked, and a pen sketch of a key beside a thick slab fob) and said they "didn't produce good Codex results". Those are NOT copied here (third-party). I do not know how or whether the owner viewed each version (my pane screenshots, their own pane, or only my text); "owner reacted" below is inferred from message order.

## Version chronology (SVG source = `keys-sonnet-study/keys-study.mjs`, function `sonnetKeys()`)
| ver | commit / blob | what it was | image(s) in images/ |
|---|---|---|---|
| Codex candidate (frozen) | 4006cf5; `keys-art-review/candidate.mjs` sha256 6735f35f4b3b9204… | two flat brass keys, silver ring and blue fob on the old tray | not copied; existing repo PNGs `keys-art-review/{current,candidate}-{desktop,narrow}.png` (sha256 prefixes current-desktop f05198df3d022cb1, candidate-desktop ea8f6d38aab0b86e, current-narrow ed456bbc515882f1, candidate-narrow 39ed65a17ce4e98e) |
| v1 | 64f5f2c / f144e525761c | tray dropped; large upright silver ring behind-right of two fanned brass keys; blue slab fob with thickness edge at right, short link to ring; viewBox 120x76 | `v1-closeup-5x.jpg` (pane capture of a static close-up page, 5x) |
| v1b (uncommitted) | none | after M2: ring smaller (rx10/ry15), behind the keys; holes open; ring not visible through the hole; no source snapshot | `v1b-uncommitted-ring-small-hole-closed-closeup.jpg` |
| v2 | b594cca / 05152e56f3e0 | v1b plus a short ring arc drawn across the front key's hole so the ring "threads" it; back key's hole hidden under front key | `v2-ring-through-hole-closeup.jpg` |
| v3 | 6ecb4f2 / 56c4cc26985b | ring behind everything; fob drawn last, in front of both key heads and holes (holes hidden); ring (rx10/ry15, upright) rises above the fob | `v3-fob-front-ring-behind-closeup.jpg` (taken just before a small shadow tweak that is in the commit); `owner-red-annotated-screenshot-of-v3.png` (owner's capture of v3 with a red mark) |
| v4a (uncommitted) | none | ring reduced to a low arc but sized rx12/ry11, so it also showed past the fob's right edge | `v4a-uncommitted-ring-arc-large-closeup.jpg` |
| v4 | 7711ae6 / a0a1adf208ba | ring a small arc (rx9.5/ry10) peeking over the fob's back edge, rest hidden | `v4-small-ring-arc-closeup.jpg` |
| v5 (accepted) | 2b26222 / 19230c97aee2 | v4 drawing with viewBox cropped from `0 0 120 76` to `4 32 100 42` so the art fills its box | scene images below |
| production | 1c72d80 (life-art.mjs blob b3172d96b8ba…, previously 5ff66b7488fc…; life-view.js blob f7077d81affe…) | v5 markup in `workKeysTray`; `work-keys` box 33/74/10/10 changed to 33.5/70/12.5/9.5 | `production-after-swap-scene.jpg` |

`svg-source-renders/v1..v5.svg` are mechanical outputs of `sonnetKeys()` run from each commit's blob (later reconstruction from committed source, not screenshots; v1b and v4a have no source). Screenshots are as captured, not annotated or resized.

## Cases (also in cases.json)

### KEYS-A — ring size and attachment (the main iterative thread)
- Before feedback: v1 showed a tall upright ring (about twice the key-head width) standing behind the keys, the fob at right linked to it. At 5x it read as a keyring; teeth looked chunky; no display-size check had been done.
- M2, verbatim: "Make the ring smaller and place it through the keyholes, or arrange the keys so the keyholes are hidden." Classification: aesthetic preference / visible defect (ring scale, doubtful ring-to-hole relationship). A cold reviewer of v1 could see the oversized ring and the unconnected hole, but not the owner's preferred remedy.
- Change: v1b, then v2 (ring arc across the front hole). I judged v2 read as the ring going through the hole at 5x.
- M3, verbatim: "Smaller is good, but the ring still reads wrong.  Place the box-shaped object in front of the holes in the keys and the ring behind all of them, so that it is plausible that the ring goes through the holes in the keys without having to figure out how to draw that." Classification: visible defect (the through-hole drawing did not read) plus a new construction requirement (occlusion composition) not derivable from the brief. Owner accepted "smaller" and rejected the v2 construction.
- Change: v3. M4, verbatim: "Improvement, still not there.  How about we move the ring to just a small portion visible, as in the attached (rough) red area of the screenshot?" (image: owner's red-marked capture of v3, a short red arc just above the fob's back edge at its right/top). Classification: aesthetic / visible defect (v3's ring was still a large loop whose bottom vanished behind the fob) with a new, specific placement requirement.
- Change: v4a (overshoot, not presented as the result), then v4. M5, verbatim: "Much better.  Test the scene composition using localhost:5173, that's open and no other agents are working." Direction approved, not yet final.
- Candid note: v2 was my interpretation of the first option in M2 and failed; v4a was an overshoot I corrected before committing.

### KEYS-B — scale/readability: close-up versus desktop/narrow display
- Context: the stated defect was that the tray art was tiny and hard to recognise at actual size (brief M0, paraphrase; relayed root/owner wording, medium confidence).
- Close-up appearance (5x static pages in the app browser pane, file URL): v1-v4 all read as a keyring at 5x. 96 px and 48 px copies on the same static page (v2-v4 captures) showed ring, brass keys and fob distinguishable at pane resolution. This is close-up/proxy evidence only, not scene readability.
- Scene evidence (v5, owner's dev server localhost:5173, report-local `scene.html` mounting the production HUD/life view with a synthetic engine; not a play-through): desktop 1366 wide with proposed box left 34%, top 70%, width 12.5% (about 92x39 px): on the desk's front band, clear of the duck, overlapping the mug base in front. At 3x CSS-transform magnification (pane screenshots are downsampled about 0.56x, so not pixel-exact) the ring arc, toothed blades and fob are distinguishable (`scene-desktop-*-3x-magnified.jpg`). A 16%-wide trial added little because the old viewBox left about 25% of its width empty, which led to the viewBox crop (`scene-desktop-tightened-viewbox-3x-magnified.jpg`).
- Narrow (390 px emulation, native pane pixels, `scene-narrow-390-native.jpg`): keys about 46 px wide; read as a brass/blue cluster; ring arc and teeth NOT reliably distinguishable; the existing "Work keys" chip label covers part of them. I disclosed this to the owner before acceptance.
- Owner feedback on scale/position: none explicit and verbatim beyond M5/M6; no comment on 12.5%, the mug overlap or the narrow size. What a reviewer could know: legibility is a visible defect measurable from the scene images; the duck-mug gap (about 64 px) and the in-front-of-mug choice were my judgments.
- Not verified: real play-through, other scene states, hold popover placement, other viewports, keyboard focus ring appearance.

### KEYS-C — key shape and perspective (ambiguous, no explicit owner feedback)
- Task context: "do not merely squash the top-down art"; solid heads, holes, toothed blades, shallow perspective. M1 reference guidance (not copied): ring near-upright, keys fanned flat in front, fob a thick slab.
- What I did: keys are the top-down key shape squashed vertically (scale 1, .62) with a darker offset copy for thickness, rotated into a fan; ring, fob and arrangement are new. This only partly meets "not merely squash" (candid note).
- Owner feedback: none about blade/head shape, teeth or perspective at any point. M5 "Much better." followed v4 and could reflect the ring change alone. The thick-edge teeth looked chunky/double-outlined in my own 5x view (my observation, not the owner's); unchanged.
- Unknown: whether the owner accepted the key shape deliberately or moved on.

### KEYS-D — final acceptance (acceptance control)
- My question before acceptance: "Accept this art and placement for the production swap?" with stated limits (desktop good; narrow small and chip covers part; hotspot, popover and other viewports untested).
- M6, verbatim: "Accept for swap". Classification: explicit acceptance of art and proposed placement with disclosed limits. Production swap committed 1c72d80 (only `workKeysTray` and the `work-keys` x/y/w/h). After swap: `life-art.test.mjs` + `life-decisions.test.mjs` 17/17 via the Plan 25 bounded runner; dev-scene check that `work-keys` is a focusable BUTTON with aria-label "Keys: leave for scheduled work". Image: `production-after-swap-scene.jpg` (pane narrower than 1366, box 74x32 there).

## Known limitations of this package
- Screenshots are downsampled in-app browser pane captures; desktop scene images use CSS-transform magnification; not full-resolution captures.
- v1b and v4a have images only. The captured v3 image precedes the final shadow-ellipse tweak by seconds.
- Owner's reference photos/drawing (QP Orch) never seen by this chat; the three M1 images are third-party and uncopied; the red annotation image is the owner's original capture, unmodified.
- Owner wording quoted exactly from this transcript; no owner-message timestamps beyond order (versions and scene work span 11:33-12:18 -05:00 by commit/file times).
- No other agents' edits were present at swap time (clean tree).
