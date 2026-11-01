> Privacy sanitation (2026-11-01): absolute repository paths are now repository-relative; private transcript paths/session identifiers are omitted. Edited quotations retain wording except these labeled removals. Historical artifact/hash tables describe the received evidence; current file hashes are in the Plan50 privacy-audit.json.

# Plan 50 historical evidence: Ren art (Plan 41/45), curator package

HELD-BACK ANSWER MATERIAL. Contains owner verdicts. Do not copy into reviewer inputs. Role: curator, not reviewer. Nothing in this package modifies or improves artwork; every artifact is an existing committed file copied byte-for-byte from the named commit (or listed by path and hash). Machine-readable detail is in `cases.json`.

Source: one Claude Code chat (session [curator-local identifier omitted]), 2026-10-31 to 2026-11-01. Message timestamps below are UTC from the session transcript; commit times in git are UTC-4 (for example 20:18 -0400 equals 00:18 UTC). All repo paths are under `reports/development/plan-41-ren-friend-character-and-social-life-study/concepts/`.

## What this chat can and cannot support

- **Hand/box contact or anatomy:** the owner gave **no feedback** about the box, the forearm or hand shape, or arm anatomy in this chat. The box-and-forearm group (id `R-box-arm`) exists in both the before and after door scenes and is unchanged apart from a removed tattoo stroke. Case RENDOOR-01 is the nearest case; its owner feedback is about the figure floating behind a foreground table, not the hand. Do not treat the hand/box region as owner-labeled.
- **Couch/body/framing:** supported by RENFRAME-02 (owner's framing rule, verbatim).
- **Accepted control:** supported by RENACCEPT-03 (tool apron accepted without changes), paired with an unexplained rejection of a vest in the same message.
- Not packaged although the chat holds owner feedback: the bandana, the sleep bonnet, the pencil placements and the neck-tattoo comment (verbatim in message afca101f at 2026-10-31T20:26:05Z), the hood-up slicker, bedhead. They were outside the requested focus.

## RENDOOR-01: door scene, figure reads as floating behind a table

**Before feedback.** Ren at an apartment door holding a small box of spare bulbs; warm interior, cooler hallway; a console table (mug, small pot) across the lower third, its top cropping Ren at the chest and partly overlapping the box and forearm; couch arm and lamp at left; floor boards visible; old pencil bar behind the ear and faint neck and forearm tattoo marks. The lead had recommended keeping that crop. (Lead's description of the PNG, confidence medium.)

**Chronology.**
1. `reference/ren-ref-door-scene.png`, commit `99e3cc8` (blob and sha256 in cases.json), original PNG export; page source `round-02-refinement.html` at `a0bc2e2`.
2. Owner message 2026-11-01T00:15:45Z (uuid 53b06635-c562-49f4-9144-d7061926432f).
3. Lead redrew: `door-scene-v2.svg` and `round-04-faces-and-door.html`, commit `21b7366` (SVG source; no PNG capture saved).
4. Owner message 2026-11-01T00:44:56Z.

**Owner feedback, verbatim (item 3 of a numbered answer):** "make upper half of door/wall take up the whole frame because the desk is very strange and Ren is floating (don't show door all the way to ground)". The lead had offered "Keep the crop" or "Full height"; the owner chose neither.

**After.** Wall and doorway fill the frame, door frame runs off the bottom edge, table, floor, couch arm and lamp removed, sconce and picture added, forearm tattoo removed (owner had separately said tattoos appear only on a bare upper arm or shoulder). Owner reply, verbatim: "Round 04 door scene much improved, listening face good." Explicit acceptance as improved; not declared final.

**Classification.** Experience/consistency issue needing brief context (spatial reading), plus a new framing requirement introduced in the answer. A reviewer could see the table cropping the figure and an ambiguous floor relationship; could not know the owner wanted the wall to fill the frame or would reject the table the lead recommended.

**Limits.** Before image is an earlier export, not proof of what the owner viewed; unknown whether the owner had seen the door scene earlier; the owner calls the table a desk.

## RENFRAME-02: apartment scenes, body framing, seating, close versus wide

**Before feedback.** Request, verbatim (message afca101f, 2026-10-31T20:26:05Z, last paragraph): "Could we have a few composed drawings that show Ren in the player's apartment: in a chair, on the couch, standing somewhere else?  Do the camera views in the apartment make that easy without having to draw more of Ren's body?" The lead composed bust-only Ren into the kit's camera so furniture hid the chest cut (wide couch, loveseat, bar, and two close crops). In no scene did a cut-off line show in open space. Later two scenes were refreshed with newer outfits and the lead asked the owner about framing (recommending "both, by moment"), a chair, poses, and a floor game-night scene.

**Chronology.**
1. `apartment-scenes/scenes/index.png` and five SVGs, commit `86c17e5` (first set).
2. Refreshed set and review page, commit `308422b` (loveseat with vest, close bar with apron); one partial browser-pane screenshot is copied (`images/pane-screenshot-...jpg`).
3. Owner message 2026-11-01T01:19:11Z (uuid 2b781049-d2ef-4a50-9ec1-b24fecfd05cb).
4. New scene, first version, commit `1e13f12` (`images/c2-after-floor-scene-first-no-duck.png`).
5. Owner message 2026-11-01T01:26:06Z (uuid f2b7e2ec-c842-4043-8bab-de5fb74b1ea8).
6. Duck revision, commit `fc1fc7a` (`images/c2-after-floor-scene-with-duck.png`).

**Owner feedback, verbatim:** "1 close only, at least close enough that bottom of available body is at bottom of visible scene (otherwise it looks awful, body cut off but scene not is always a non-starter unless lower body obscured by scene object), 2 couch in living room or behind desk (which would mean sitting on floor), 3 commission side and turned poses later, 4 draw it". Later: "1 coffee table, 2 revise (add duck on blue book facing board)".

**After.** Close framing recorded as chosen; narrow sofa treated as not wanted; new floor scene drawn (couch removed, Ren behind the coffee table, board game on the table, table and board hide the chest cut), then the duck was placed on the blue magazine facing the board. After the revision the owner did not comment on the scene and moved to the next topic: acceptance is inferred, not stated.

**Classification.** New requirement introduced later (close-only; body must end at the scene bottom unless an object hides it); aesthetic preference (close versus wide); a general visible-defect principle stated conditionally. The earlier wide scenes already satisfied the owner's own condition because furniture hid the cut. A reviewer could check for cut-off bodies in open space; could not know the close-only preference.

**Limits.** The version the owner viewed before the rule has SVG sources and one partial screenshot only. A first floor-scene render with a wrong crop (head cut off) and a blanket prop were failed intermediates never saved or shown. Renders are headless Edge, not an in-game layout.

## RENACCEPT-03: accepted control (tool apron) beside an unexplained "not yet" (puffer vest)

**Before feedback.** The owner asked for two outfits (2026-11-01T00:50:20Z). Two Haiku helpers drew them from Gemini cells; the lead judged the apron fine, found the vest's quilting read like scales with a boxy collar, and redrew it as v2 (closed, straight seams, shorter collar) before the owner saw it. The Gemini cell shows an open, puffy vest. The owner saw the apron and vest v2.

**Owner feedback, verbatim:** "Tool apron looks good, puffer vest does not yet." (2026-11-01T00:59:04Z, uuid 0990e3cc-ff9f-48ae-ba3e-784f4c41ea76)

**After.** Apron unchanged. Vest redrawn by the lead as v3 (open vest of rounded pillows, closer to the cell), described as a best guess. The owner has not commented on v3 in this chat.

**Classification.** Apron: acceptance/aesthetic approval, no known defect. Vest: unexplained; could be a visible defect (flat, closed, not puffy), a mismatch with the reference cell, or taste; not determinable. A reviewer could compare the vest to the cell; could not know what the owner disliked.

**Limits.** Owner-visible capture was the browser-pane sheet; only renders of the same SVGs are saved. Vest history mixes helper and lead work. Control status rests on one sentence of approval.

## Candid notes on the lead's own failed attempts

Vest v1 (helper, scale-like quilting) and v2 (lead, closed and flat) both failed against the owner's eye; v3 is untested by the owner. The floor scene's first render was cropped wrongly. The lead's recommendation to keep the door crop was rejected. None of these should be read as the owner being right or wrong.
