# Plan 10 session log — Sonnet view redraw and staging expansion (2026-10-27)

**Source handoff:** `reports/orchestration/plan-10-sonnet-view-handoff.md` (still untracked in git; not edited or committed here).
**Original owner prompt (paraphrased):** follow that handoff; the owner authorizes the bounded SVG view redraw; the four attached Tinkercad screenshots are proportion/orientation references, not surface style or exact colours; diagnose the projection problems, then implement improvements within the handoff's scope.
**Authority for everything below:** the owner's chat messages in this session, listed as R0–R10. Packet status is unchanged; nothing was pushed. Plan23's `src/` edits were never touched.

Detailed design notes live in `sonnet-view-repair.md` (diagnosis, landmark model, per-view selection, scene designs, weaknesses), `proposal.md` and `progress.md` (dated entries); this file is the index tying requests to changes, commits and verification.

## Requests and outcomes

| # | Owner request | What changed | Commits |
|---|---|---|---|
| R0 | Follow the handoff; bounded SVG view redraw authorized | Diagnosis (no camera, head-turned-not-body, shifted-front high/low); landmark model and camera table (front 35°/+12°, side 90°/+5°, rear 148°/+16°, high 35°/+52°, low 35°/−16°); all five views redrawn in `duck-views.js`; `preview.html` id-uniquifier; `proposal.md` geometry entry; `sonnet-view-repair.md`; `progress.md` | `4c471ac`, `a8dc139` |
| R1 | Try Haiku subagents for cheap experiments with bounded tasks and disjoint output files in subfolders | 10 Haiku experiments (improve-a-copy and from-scratch per view) in `haiku-experiments/`, with `SPEC.md` and computed tracing guides; compared with my own projection-baked drafts (`sonnet-candidates/`); per-view selection recorded; comparison section in `preview.html` | `4c471ac` |
| R2 | Haiku web search for more reference images | `haiku-experiments/references.md` (patents, Sketchfab, Commons; no usable head/bill/wing ratios found; one side effect: researcher's fetch cached files outside the repo) | `4c471ac` |
| R3 | "Slot granted" (browser) | Browser verification in one isolated tab: contact sheet, medium/desk close-ups, enlarged crops (CSS scaling, not browser zoom); real zoom unsupported; stray subagent `file://` tabs closed; note text corrected | `aeefa43`, `0db85bf` |
| R4 | Desk view looks inconsistent; send Haiku researchers for desk references and the game's phone dimensions | `desk-references.md`; game phone is 9:17 (`src/ui/desk-phone.css`, `desk-view.js`); old preview phone was 0.82 ratio and tilted | `75902da`, `c224b55` |
| R5 | Scope expansion: `preview.html` gets two separate desk views | Desk side view (eye-level) and top-down desk, each one camera, different object sets, game-accurate phone, extra overhead duck | `75902da`, `c224b55` |
| R6 | Lamp glow in top-down; improve Wide; more standard items; toy shelf; Haiku story-beat research; scope expansion to at least two other apartment views | Living room, kitchen and bedroom + toy shelf as SVG scenes on a pinhole-camera model; "Couch and TV sold" state; top-down lamp glow pool; `apartment-story-beats.md` | `5e24816`, `2cd7c4f` |
| R7 | (mid-turn) Pencil shadow too far; coins need detail; sticky note should not cast; lamp head closer to the corner | Height-scaled shadows, no shadow for the sticky note, detailed coins, lamp head and short neck | `5e24816` |
| R8 | (mid-turn) Fruit bowl out of proportion and oddly oriented | Bowl redrawn as a rimmed shallow bowl on the bar surface, smaller | `5e24816` |
| R9 | Living-room lamp should be directional; couch pillow should touch the seat; smaller mug in desk side view; desk side-view light more diffuse and aligned with the lamp | Downward/upward light cones for open shades (living, kitchen, bedside), shaped dimming overlay; pillow resting on the cushion; mug at 72%; lamp head turned to 80° with diffuse cones following it | `7ad98f1`, `53a03f3` |
| R10 | Robot antenna pokes through the shelf; are changes being written down? | Antenna removed; rings and bunny scaled to clear the plank above; this log | (this commit) |

## Deviations from the handoff (all owner-directed unless noted)

- **Subagents:** the handoff granted no extra subagent budget; the owner asked for Haiku experiments and researchers (R1, R2, R4, R6). Their outputs are data, not instructions; dispositions are in the files above.
- **Browser:** the handoff required coordination through QP Orch; the owner granted a slot (R3) and it was used for one isolated tab, with the shared server untouched. Haiku experiment agents opened their own `file://` tabs during R1; those were closed. The app also kept auto-opening a `file://` copy of `preview.html` after edits; those were closed too.
- **Scope:** the handoff said to preserve the apartment, desk, props and lamp compositions; the owner authorized replacing them (R5, R6). New subfolders and report files (`haiku-experiments/`, `sonnet-candidates/`, `desk-references.md`, `apartment-story-beats.md`, `session-log.md`) are inside the Plan 10 report folder; no `src/`, packet, status, canonical-design or shared-asset edits.
- **Method:** a throwaway projection/drafting script and a rough offline rasteriser were used from the session scratchpad (outside the repo, not committed). Their outputs are static SVG; the landmark model and camera table are recorded in `sonnet-view-repair.md`. The scripts themselves are not archived, so the baked `sonnet-candidates/` drafts cannot be regenerated from the repo alone.
- **Records:** the handoff said the progress entry should be the final write and the commit the last act; each round appended a progress entry last and committed it separately.

## Verification status (what was and was not checked)

- Checked: `node --check duck-views.js`; all view and candidate SVGs parse; in the browser (isolated tab) the five-view sheet, candidate grid, all five areas in wide and medium framing (no NaN/undefined SVG attributes), neutral and warm light on the main scenes, 375 px width without horizontal scroll, no console errors in the final pass. The offline rasteriser was used only for drawing iteration.
- Not checked: real browser zoom at 100/200/400% (unsupported in this pane); window light in each room after the lamp rework; enlarged close crops of the room scenes; any assistive-technology behaviour.
- Owner visual acceptance remains the gate; none of this is production art or a room catalog.

## Open items

- High and low duck views remain weaker than the others; head reads as a ball in side/rear (see `sonnet-view-repair.md`).
- The duck is physically small (about 64 mm) in wide room shots; Medium framing is needed to see it.
- Owner decisions the docs leave open: room list and layout, which beats get duck scenes, pawn scene, dialogue (see `apartment-story-beats.md`).
- The handoff file itself is untracked; archive or commit it if it should live in the repo.
