# Plan 10 — Sonnet whole-object view repair (2026-10-27)

Handoff: `reports/orchestration/plan-10-sonnet-view-handoff.md`. The owner supplied four Tinkercad screenshots (front, right side, rear three-quarter, high rear) as orientation/proportion witnesses only. The owner also asked, in this session, for Haiku subagent experiments and a Haiku web search for extra reference images; both were run (the handoff's "no additional subagent budget" is superseded by that instruction).

**Rendered verification status: PENDING.** Everything below was checked with an approximate offline rasteriser (Pillow, no gradients/filters) and XML parsing, not in a browser. No browser zoom (100/200/400%) was observed. No desk/lamp composition was rendered. Owner visual judgment is the gate.

## Diagnosis

1. **No camera.** The old views were one front-view body path reused with small edits; "rear", "high" and "low" differed from "front" by moved paths, not by which surfaces face the viewer.
2. **Head turned, body not.** In the old rear view the body outline and both wings stayed front-like while only the face moved, so it read as a turned head on an unchanged body.
3. **High/low were front views with a shifted head.** There was no crown/back exposure in high, no underside plane in low, and no body-over-head occlusion when looking up.
4. **Feature visibility was not derived.** Both eyes and both wings were forced into views where one side faces away.

## Landmark model and camera convention

Duck-local units (+z front, +y up, body length ≈ 120): squat body (half-width 42, half-length 60, 36 above / 26 below centre, flattened base); head sphere r 40 at (0, 52, 10) — about as wide as the body (Tinkercad front/side captures); spatula bill (upper + lower mandible) ~15 units out from the head front below the eye line; eyes on the head sides ~0.5 radius off the face centre; wings as flattened lobes on the body flanks, behind mid-body, upper half; raised tail flick at the rear top.

Camera: azimuth from the front toward the duck's left, elevation above the table; perspective distance 330 units; same landmark model for all views.

| view | azimuth | elevation | eyes shown | wings shown | tail | underside |
|---|---|---|---|---|---|---|
| front | 35° | +12° | both (far narrow) | near; far hidden | behind body | no |
| side | 90° | +5° | near only | near only | in profile | no |
| rear | 148° | +16° | none | near + far sliver | in front of body | no |
| high | 35° | +52° | both | both | peeks over back | no |
| low | 35° | −16° | both | near (far hidden) | hidden | yes |

High and low keep the front azimuth, so only elevation differs from front. Painter rules: head over body when the camera is above the body top, under the body edge when below (low); near wing over body, far wing before body; bill after head when it points toward the camera, before when away; tail behind the body from the front, in front from behind; eyes only on surfaces facing the camera.

**Drafting aid disclosure.** To get silhouettes consistent across views I used a throwaway projection script (outside the repo, in the session scratchpad) that projects those ellipsoid/sphere landmarks per camera and emits silhouette paths, tracing guides (`haiku-experiments/guides/`) and one full draft set (`sonnet-candidates/`). It is not shipped, is not a build step and adds no dependency. The shipped SVGs are static. If the owner considers this a 3D source pipeline in effect, `sonnet-candidates/` can be dropped and the selection redrawn by hand.

## What was selected for `duck-views.js`

After comparing ten Haiku experiments (improve-a-copy and from-scratch for each view, all given the same spec and guide silhouettes) against my projection-baked set (`candidate-grid-offline.png`), the per-view selection is:

| view | selected drawing | why |
|---|---|---|
| front | `haiku-experiments/front-scratch/duck.svg` | wing sits on the body, two-part bill, readable far-eye sliver |
| side | `haiku-experiments/side-improve/duck.svg` | cleanest tail flick and wing lobe; my draft's tail read as a ball and its wing as a flat pancake over the head |
| rear | `haiku-experiments/rear-scratch/duck.svg` | broad turned body, near wing on the left flank, no eyes, bill only a sliver at the head edge, tail at right |
| high | `haiku-experiments/high-improve/duck.svg` | most legible crown / foreshortened bill / flank wing |
| low | `haiku-experiments/low-improve/duck.svg` | visible underside rim, body edge crossing the lower head |

Each was re-wrapped with the shared header (viewBox, bottom alignment, aria-label), shifted ≤4 units for common centring/bottom, and otherwise left as the subagent drew it. Exports keep the keys `front side rear high low` and the `label/note/svg` interface. The unselected variants stay in `haiku-experiments/` and `sonnet-candidates/` and are shown in the new "Candidate comparison (diagnostic)" section of `preview.html`.

## Spatial improvements in the difficult views

- **Rear:** the body outline is now the turned rear mass, not the front-view blob — a broad back, near wing on the left flank overlapping the body, no eyes, tail flick at the right edge, and the bill reduced to an orange sliver clearing the far-left head edge. The head sits over the body with a nape shadow.
- **High:** the crown is the dominant shape, the body compresses behind/below it, the bill foreshortens toward the lower left beside the near eye, and the near wing runs along the flank at an angle instead of a front-view lobe.
- **Low:** a shaded underside plane with a rim line is visible below the body; the body's top edge crosses and hides the lower head; the bill is drawn from below with the lower mandible in front.

## Remaining issues (not resolved)

- **High still reads closer to a plump three-quarter front view than a true look-down.** The "back of body above head" cue is mostly hidden because the head covers it at this elevation.
- **Low reads partly as a bowl/cylinder with a flat plate base**; the bill is two stacked pills rather than a spatula seen from below.
- **Head is a nearly perfect circle in all views** (side, rear): it reads as a ball stacked on the body with a weak neck transition. This follows the sphere in the landmark model; the Tinkercad captures show a similar sphere but the drawn neck join is soft.
- **Rear head is a plain ball**; no nape detail beyond a rim highlight.
- Wing on the near side is a lobe that is drawn rather than moulded in front and rear; the tail flick looks ear-like in the high view.
- Mixed authorship: strokes, shading offsets and highlight treatment are close (shared palette/spec) but not identical across views.
- Not checked: browser rendering of these SVGs (clip-path/translate behaviour should match the offline renderer, but this is unverified), medium/close framing, the desk composition under the warm lamp, real browser zoom. The `.duck` drop-shadow and lamp overlay are unchanged.
- Not used: web references gave no head/bill/wing ratios (`haiku-experiments/references.md`); proportions come from the owner's captures.

## Files

- Changed: `duck-views.js` (all five views), `preview.html` (id-uniquifying render helper replaces the old body-path regex; compact candidate comparison section and CSS), `proposal.md` (dated geometry approach).
- Added: `sonnet-view-repair.md`, `haiku-experiments/` (SPEC, guides, ten experiment folders with `duck.svg`, `notes.md`, `render.png`; `references.md`), `sonnet-candidates/` (five projection-baked drafts + two offline contact-sheet PNGs).
- Not touched: `src/`, packet/status/index, canonical design, shared assets, apartment/desk/lamp CSS, the shared 5181 server.
