# Sonnet handoff — Plan 10 physical duck view redraw

You are taking over a bounded SVG illustration repair in `C:/AI/Quackpot`. The owner is asking for a fresh attempt at the physical duck's different viewpoints after repeated revisions failed to make the views convincing. This is an art/projection task, not a request to polish descriptions of existing shapes. The owner will supply the same four Tinkercad reference screenshots used previously.

## Outcome and authority

Produce five coherent static SVG views of ONE rubber duck: front three-quarter, side profile, rear three-quarter, high angle and low angle. The whole object must read as viewed from the indicated direction. The current rear view has read as a head turned on a largely unchanged body; high/low views have not convincingly changed perspective. You may redraw the view geometry substantially. You need not preserve existing paths just because they have been through earlier review. Keep the selected physical rubber-toy visual direction and preview interface compatible.

The owner has authorized this fresh attempt. Start with a short written diagnosis and a concrete landmark/occlusion plan, then proceed with the bounded SVG redraw; do not stop merely to ask for permission to replace unsuccessful paths. Owner visual acceptance is the final gate. If you conclude a 3D source pipeline is necessary, report the specific failed view and a proposal; do not install/build one under this handoff.

## Read and inspect

1. Root `AGENTS.md` and `docs/repo-structure.md` for constraints and file ownership. Run `node scripts/dev/plan-status.js check plan-10`; stop if blocked. Read the Plan10 packet at `docs/development/plan-10-metagame-duck-cinematography.md`.
2. Inspect the selected style reference: `reports/development/plan-08-duck-visual-direction-prototypes/concepts/d2.jpg`. This supplies the solid molded rubber-duck appearance. Digital gacha paper ducks are a separate asset family.
3. Inspect all four owner-supplied Tinkercad screenshots. Use them as evidence for spatial proportions, whole-body orientation, feature placement and occlusion. Do not copy their faceted surface, exact colors or modeling artifacts. If the images were not attached, ask for them before claiming reference-grounded work.
4. Read `reports/development/plan-10-metagame-duck-cinematography/duck-views.js`, the relevant SVG styles/render helper in `preview.html`, and the local `proposal.md`/`progress.md`. Read `reports/orchestration/plan-10-owner-visual-repair-01.md` for prior owner feedback and unresolved evidence limits. Historical reports are context, not proof that the current art is satisfactory.

## Geometry approach

Think of a single molded object with fixed head/body proportions, a bill projecting from the head, eyes on the head's sides, wings molded onto the body, and a raised tail. Establish those landmarks before detail. Choose and record a consistent camera azimuth/elevation convention. Keep orientation explicit: an elevated view of the same front/side direction should not quietly become a different azimuth just to look different.

For each view, identify the near/far side, visible body and head surfaces, bill projection, wing attachment, tail placement, and which parts occlude others. A rear three-quarter view should show the rear mass and tail/wing relationship; the bill and face should recede or be occluded as geometry requires. A high angle should expose crown/back and compress vertical depth; a low angle should change underside visibility, overlap and bill planes. Avoid moving facial features over an otherwise unchanged front silhouette. Do not force both eyes or both wings to be visible when the angle would hide one.

Preserve the rounded toy material, restrained outline/highlight/shadow treatment and recognizable same-object proportions. Favor clear large shapes over extra decorative paths. Fix clipped shadows, detached bill planes, floating features, contour leaks and impossible wing attachments. A well-formed SVG or a sharp vector edge does not establish convincing perspective.

These are static views of an inanimate prop. No eye, bill, wing, breathing, bobbing or squash/stretch animation. Character will come from camera composition and lighting, not changing its expression or anatomy between shots.

## Exact write scope and shared-checkout discipline

Own only the duck-view repair inside `reports/development/plan-10-metagame-duck-cinematography/`:

- `duck-views.js`: primary geometry implementation; preserve the exported view keys/interface unless a small compatibility change is justified.
- `preview.html`: only view-specific SVG styles/render compatibility and compact diagnostic comparison/crops needed to review the redraw. Preserve current apartment, furniture, desk/portrait-phone/props and lamp compositions. Do not redesign them in this task.
- `proposal.md`: append/update your concise geometry approach, clearly dated.
- Add a scoped `sonnet-view-repair.md` with diagnosis, changed views, evidence and remaining issues; append a concise delivery entry to `progress.md` as the final write.

You are not alone in the checkout. Plan23 may change production race files concurrently. Inspect git status first, preserve all other changes and stage only explicit owned files. Do not edit `src/`, canonical design, packet/status/index, root orchestration records or shared assets. No dependency installation, new runtime libraries, raster game assets, network loading, new art pipeline, push or deployment. Do not delete an index lock; coordinate/wait if another writer is committing.

## Rendered comparison and verification

Use the existing report preview. Compare all five views side by side under the same neutral material/lighting at similar visual size; preserve the contact sheet. Inspect each repaired view in medium and close framing, particularly rear/high/low. Also check that the new duck still sits plausibly on the desk and remains readable under the existing warm lamp treatment. Check outline continuity, shadow clipping, bill/wing attachment, head/body ratio and near/far feature placement.

Browser use must be coordinated through QP Orch because Plan23 may be testing. If your harness cannot message it, ask the owner to obtain a slot; continue source work while waiting, but do not silently take over owner tabs or start competing browser automation. The existing approved local route is `http://127.0.0.1:5181/Quackpot/reports/development/plan-10-metagame-duck-cinematography/preview.html`. Do not restart/change the shared server without coordination. Use an isolated tab/context and close/reset it on release.

Record what was actually rendered and at what viewport. Save useful before/after contact-sheet and close-crop screenshots in this report folder if your harness supports local capture. Screenshot references are review artifacts, not shipped game assets. Inspect actual browser zoom at100/200/400% only if supported; viewport/CSS scaling does not substitute. If unavailable, state it. If browser access is unavailable, deliver source and identify rendered verification as pending; do not assert visual success from code inspection.

Run `node --check reports/development/plan-10-metagame-duck-cinematography/duck-views.js`, verify all generated SVGs parse, and run `git diff --check` on owned files. Existing build/full-game tests are not useful proof of this illustration repair. No additional reviewer/subagent budget is granted by this handoff; concentrate on the art and actual rendered checks.

## Delivery

Give the owner a concise description of the geometric changes and direct them to the existing preview. For each difficult view, explain one or two concrete spatial improvements, with visual evidence where available. State any view that still fails; do not label the set coherent merely because all five views exist. Identify whether actual close views and zoom were checked. Commit only scoped work by explicit paths; commit the progress entry last, leave packet status unchanged and never push. Final acceptance is the owner's visual judgment; production integration is separate work.
