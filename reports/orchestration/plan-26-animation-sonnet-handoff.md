# Sonnet continuation — approved weather motion prototype

Owner accepts QP Orch's animation recommendations on2026-10-27. Read `reports/orchestration/plan-26-animation-proposal-review-01.md` and your animation proposal. The review's corrections are binding; this is an extension of the report-only Plan26 study, not production integration.

**Proceed now with controller logic and animated rain (StagesA/B).** Own NEW `reports/development/plan-26-apartment-daylight-weather-study/animation/` plus a concise entry in the existing progress report. Put the motion gallery/controller/tests there; existing approved still generators/gallery, Plan24 kit and production are read-only. Run `check plan-26` first. No additional subagent/reviewer budget is assumed.

Approved choices:

- Host-side Web Animations API on inline SVG. No controller means exactly the approved still. Keep original rain drawing intact; add animation-only tiled layers while active and restore the original composition on stop/reduced/destroy. Do not replace approved still art with a new tile and call it identical.
- Ambient rain may run while its selected story/weather scene is active and visible, with a free reachable pause/stop control. No cloud drift in the initial prototype. No real-date weather or new story schedule.
- Lightning direction is selected for a LATER visual stage: story-triggered only, one pulse initially, shared four-second monotonic cooldown, refuse-not-queue. One host-created page arbiter must be injected into all controllers; no independent per-scene budgets and no cooldown reset on recreation. No idle flash. StageA may test this scheduler with fake-clock logic, but do not build/render lightning until its separate gate.
- Reduced motion and motion-off use the unchanged still and refuse flashes. Handle live preference changes. Pause/hidden/offscreen/inactive/reduced are independent blockers; clearing one cannot override another. Rain can resume; transient lightning cancels to neutral on interruption and never resumes a stale beat.
- Audio stays out. Distinguish finished/cancelled/refused outcomes for a future host; no thunder or audio wiring now. Physical duck and lamp geometry/animation targets remain untouched; no emissive duck halo.

First record a concise controller/arbiter interface and lifecycle state table in the animation folder, then implement A/B within the approved scope. Do not stop merely to re-request these selected choices. Return any actual incompatible constraint to root.

Verify fake-clock logic, idempotent teardown, independent blockers and repeated instances, unchanged still DOM/composited appearance after stop, tile seam/clipping and actual WAAPI layer motion. Do not assume SVG-string rasterisation captures animated computed state: establish a positive control before using that method for later flash evidence. Measure frame cadence/drops with scene/device/browser/foreground/still-baseline context; rAF intervals alone are not compositor cost. Current-machine results do not establish low-end lab performance.

Request a coordinated isolated browser turn after source checks for desktop1280x720 and actual390x844, wide/medium, one/multiple scenes, pause/hidden/offscreen/reduced/teardown and seam inspection. Independent harness browsers may run concurrently only with independent control/storage; respect source/hot-reload coordination. No owner tabs/storage/settings/server changes. Close/reset/release afterwards.

**Stop after the A/B rain/controller delivery for root and owner review.** Lightning art/composite measurement is a later explicitly approved stage, followed by performance/technical checks and owner look. Teacher computer and a representative slower student machine/browser are target-device evidence before production claims; do not invent results or certify photosensitivity. Other rooms, kit hooks, Plan25 wiring and promotion remain separate gates.

Commit explicit owned files, progress last; no packet/status/root record edits, no push/deployment. Report exact runtime identity/effort if any permitted consultation occurs; root independent technical review uses Terra-medium.
